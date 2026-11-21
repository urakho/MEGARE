const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const code = fs.readFileSync('src/tank-road.js', 'utf8');
function game(initial = {}) {
    const data = { ...initial };
    const storage = { getItem: key => Object.hasOwn(data, key) ? data[key] : null, setItem: (key, value) => { data[key] = String(value); } };
    const elements = [];
    function element(tag) {
        const queries = {};
        const node = { tag, children: [], style: {}, dataset: {}, classList: { add() {} }, appendChild(child) { this.children.push(child); }, remove() { this.removed = true; }, addEventListener() {}, focus() {},
            querySelector(selector) { return queries[selector] ||= element(selector); },
            getContext() { return { fillRect() {}, beginPath() {}, arc() {}, stroke() {}, fillText() {} }; },
            toDataURL() { return 'data:image/png;base64,test'; } };
        elements.push(node); return node;
    }
    const document = { createElement: element, getElementById: id => elements.findLast(node => node.id === id && !node.removed) || null, body: element('body'), addEventListener() {}, removeEventListener() {} };
    const ctx = vm.createContext({ localStorage: storage, document, console, window: { TANK_ATMOSPHERIC_TITLES: {}, saveActiveProfile() {} },
        _getUnlockedTitles: () => JSON.parse(storage.getItem('playerTitleUnlocks') || '[]'),
        getTankTrophies: type => JSON.parse(storage.getItem('tankTrophiesData') || '{}')[type] || 0,
        _unlockAvatar: id => { let list = JSON.parse(storage.getItem('tankAvatarUnlocks') || '[]'); if (!list.includes(id)) list.push(id); storage.setItem('tankAvatarUnlocks', JSON.stringify(list)); },
        saveProgress() {}, updateCoinDisplay() {}, drawTankOn() {}, coins: 0, gems: 0, parts: 0 });
    vm.runInContext(code, ctx);
    return { ctx, data, storage, elements };
}
test('vehicle milestones unlock distinct titles and keep the best score after losses and reload', () => {
    const { ctx, storage, data } = game({ tankTrophiesData: JSON.stringify({ ice: 2500 }) });
    let unlocked = JSON.parse(storage.getItem('playerTitleUnlocks'));
    assert.deepEqual(unlocked, ['tank-title:ice:1000', 'tank-title:ice:2500']);
    assert.notEqual(ctx.window.getTankRoadTitle(unlocked[0]).name, ctx.window.getTankRoadTitle(unlocked[1]).name);
    ctx.window.recordTankRoadProgress('ice', 10000);
    ctx.window.recordTankRoadProgress('ice', 5);
    assert.equal(JSON.parse(storage.getItem('tankRoadProgress')).ice.best, 10000);
    assert.equal(JSON.parse(storage.getItem('playerTitleUnlocks')).length, 4);
    const reloaded = game(data);
    assert.equal(JSON.parse(reloaded.storage.getItem('tankRoadProgress')).ice.best, 10000);
    assert.equal(JSON.parse(reloaded.storage.getItem('playerTitleUnlocks')).length, 4);
});
test('resources show one modal and milestone rewards show resource then title without double grants', () => {
    const { ctx, elements } = game({ tankTrophiesData: '{"normal":1000}' });
    ctx.window.showRankModal('normal');
    const row = elements.find(node => node.dataset.step === 1000);
    row.querySelector('button').onclick();
    assert.equal(ctx.gems, 20);
    let overlay = elements.findLast(node => node.id === 'tankRoadReveal' && !node.removed);
    assert.match(overlay.querySelector('h2').textContent, /20/);
    overlay.querySelector('button').onclick();
    overlay = elements.findLast(node => node.id === 'tankRoadReveal' && !node.removed);
    assert.equal(overlay.querySelector('h2').textContent, ctx.window.getTankRoadTitle('tank-title:normal:1000').name);
    overlay.querySelector('button').onclick();
    assert.equal(elements.filter(node => node.id === 'tankRoadReveal' && !node.removed).length, 0);
    row.querySelector('button').onclick();
    assert.equal(ctx.gems, 20);
    elements.find(node => node.dataset.step === 250).querySelector('button').onclick();
    overlay = elements.findLast(node => node.id === 'tankRoadReveal' && !node.removed);
    assert.match(overlay.querySelector('h2').textContent, /100/);
    overlay.querySelector('button').onclick();
    assert.equal(elements.filter(node => node.id === 'tankRoadReveal' && !node.removed).length, 0);
});
test('different profile data keep separate vehicle roads and legacy titles', () => {
    const a = game({ tankTrophiesData: '{"fire":5000}', playerTitleUnlocks: '["fire"]' });
    const b = game({ tankTrophiesData: '{"ice":1000}' });
    assert.ok(JSON.parse(a.storage.getItem('playerTitleUnlocks')).includes('fire'));
    assert.ok(!JSON.parse(b.storage.getItem('playerTitleUnlocks')).includes('tank-title:fire:5000'));
    assert.equal(a.ctx.window.getTankRoadTitle('tank-title:fire:5000').threshold, 5000);
    assert.equal(a.ctx.window.getTankRoadTitle('tank-title:fire:9999'), null);
});
