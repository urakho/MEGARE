const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const source = fs.readFileSync('src/main.js', 'utf8');
function section(from, to) { return source.slice(source.indexOf(from), source.indexOf(to)); }
function createGame(count, claimed = []) {
    const ctx = vm.createContext({ trophies: count, claimedRewards: claimed, window: {}, console,
        localStorage: { getItem: () => null }, tankType: 'normal', loseIndividualTankTrophies: () => false, saveProgress() {} });
    vm.runInContext(section('const trophyRoadRewards = [', '// Unlocked tanks list'), ctx);
    vm.runInContext(section('function getMinimumTrophyLevel()', '// Снятие трофеев с конкретного танка'), ctx);
    return ctx;
}
test('league boundaries protect progress without claiming a road reward', () => {
    for (const boundary of [100, 400, 900, 1600, 2500, 3500, 5000, 6500, 8000, 10000]) {
        const ctx = createGame(boundary + 1);
        vm.runInContext('loseTrophies(15)', ctx);
        assert.equal(ctx.trophies, boundary);
    }
});
test('existing claimed reward floor and indices remain valid', () => {
    const ctx = createGame(127, [14]);
    vm.runInContext('loseTrophies(15)', ctx);
    assert.equal(ctx.trophies, 125);
    assert.equal(vm.runInContext('trophyRoadRewards[14].tank', ctx), 'ice');
    assert.equal(vm.runInContext('Math.max(...trophyRoadRewards.map(r => r.trophies))', ctx), 50000);
});
test('secret league reveals at 20000, is earned at 50000, and MEGARE awards three alphas', () => {
    for (const count of [19999, 20000, 49999, 50000]) {
        const ctx = createGame(count);
        assert.equal(vm.runInContext('getVisibleTrophyLeagues().some(league => league.secret)', ctx), count >= 20000);
        assert.equal(vm.runInContext('!!getTrophyLeague(trophies).secret', ctx), count >= 50000);
    }
    const ctx = createGame(10000);
    assert.equal(vm.runInContext('trophyRoadRewards.find(r => r.trophies === 10000 && r.level === "alpha").amount', ctx), 3);
    ctx.localStorage.getItem = () => 'true';
    ctx.trophies = 19000;
    assert.equal(vm.runInContext('getVisibleTrophyLeagues().some(league => league.secret)', ctx), true);
});
test('the start marker cannot be claimed while ordinary rewards remain claimable', () => {
    const ctx = createGame(0);
    const items = [];
    ctx.document = {
        getElementById: () => ({ style: { setProperty() {} }, set innerHTML(value) {}, appendChild: item => items.push(item) }),
        createElement: () => ({ style: { setProperty() {} }, classList: { add() {} } })
    };
    ctx.updateCoinDisplay = () => {};
    vm.runInContext(section('function generateTrophyRoad()', '// Simple notification system'), ctx);
    vm.runInContext('generateTrophyRoad()', ctx);
    const start = items.find(item => item.innerHTML && item.innerHTML.includes('>Старт</div>'));
    assert.ok(start);
    assert.doesNotMatch(start.innerHTML, /<button/);
    vm.runInContext('claimTrophyReward(0)', ctx);
    assert.equal(ctx.claimedRewards.length, 0);
    assert.ok(items.some(item => item.innerHTML && item.innerHTML.includes('onclick="claimTrophyReward(')));
});

test('new road tokens and profile icons are granted once, including duplicate compensation', () => {
    const ctx = createGame(10000);
    const unlocked = new Set(['new-icon:rare-hawk']);
    Object.assign(ctx, { tokens: 0, gems: 0, showNotification() {}, updateCoinDisplay() {}, generateTrophyRoad() {},
        _isAvatarUnlocked: id => unlocked.has(id), _unlockAvatar: id => unlocked.add(id), profileAvatarMarkup: id => id });
    ctx.window.showProgressionRewards = items => { ctx.shown = items; };
    vm.runInContext(section('function showTrophyRoadReward(', '// Simple notification system'), ctx);
    const tokenIndex = vm.runInContext('trophyRoadRewards.findIndex(r => r.type === "tokens" && r.trophies === 2000)', ctx);
    ctx.claimTrophyReward(tokenIndex);
    ctx.claimTrophyReward(tokenIndex);
    assert.equal(ctx.tokens, 100);
    const iconIndex = vm.runInContext('trophyRoadRewards.findIndex(r => r.type === "avatar" && r.trophies === 1200)', ctx);
    ctx.claimTrophyReward(iconIndex);
    assert.ok(unlocked.has('new-icon:rare-helmet'));
    assert.match(ctx.shown[0].art, /rare-helmet/);
    const duplicateIndex = vm.runInContext('trophyRoadRewards.findIndex(r => r.type === "avatar" && r.trophies === 3000)', ctx);
    ctx.claimTrophyReward(duplicateIndex);
    ctx.claimTrophyReward(duplicateIndex);
    assert.equal(ctx.gems, 50);
});

test('new vehicle choices can be postponed and claim exactly one option', () => {
    for (const threshold of [2200, 4000, 6000, 8500]) {
        for (const selection of [0, 1]) {
            const ctx = createGame(threshold);
            const elements = {};
            ctx.document = { getElementById(id) {
                return elements[id] ||= { style: {}, classList: { remove() {}, toggle() {} }, setAttribute() {},
                    width: 120, height: 120, getContext: () => ({ clearRect() {} }) };
            } };
            Object.assign(ctx, { unlockedTanks: [], gems: 0, showNotification() {}, updateCoinDisplay() {}, generateTrophyRoad() {} });
            ctx.localStorage.setItem = () => {};
            vm.runInContext(section('function showTrophyRoadReward(', '// Simple notification system'), ctx);
            vm.runInContext(section('let choiceRewardData = null;', '// ── ACHIEVEMENTS SYSTEM'), ctx);
            const index = vm.runInContext(`trophyRoadRewards.findIndex(r => r.type === 'choice' && r.trophies === ${threshold})`, ctx);
            const expected = vm.runInContext(`trophyRoadRewards[${index}].options[${selection}]`, ctx);
            ctx.claimTrophyReward(index);
            ctx.window.selectChoiceOption(selection);
            ctx.window.cancelChoiceSelection();
            assert.equal(ctx.claimedRewards.length, 0);
            ctx.window.selectChoiceOption(selection);
            ctx.window.confirmChoice();
            ctx.window.confirmChoice();
            assert.deepEqual(ctx.unlockedTanks, [expected]);
            assert.deepEqual(ctx.claimedRewards, [index]);
            assert.equal(ctx.gems, 0);
        }
    }
});

test('choosing an already unlocked vehicle grants compensation only once', () => {
    const ctx = createGame(2200);
    ctx.document = { getElementById: () => ({ style: {}, classList: { remove() {}, toggle() {} }, setAttribute() {},
        width: 120, height: 120, getContext: () => ({ clearRect() {} }) }) };
    Object.assign(ctx, { unlockedTanks: ['medical'], gems: 0, showNotification() {}, updateCoinDisplay() {}, generateTrophyRoad() {} });
    ctx.localStorage.setItem = () => {};
    vm.runInContext(section('function showTrophyRoadReward(', '// Simple notification system'), ctx);
    vm.runInContext(section('let choiceRewardData = null;', '// ── ACHIEVEMENTS SYSTEM'), ctx);
    const index = vm.runInContext('trophyRoadRewards.findIndex(r => r.type === "choice" && r.trophies === 2200)', ctx);
    ctx.claimTrophyReward(index);
    ctx.window.selectChoiceOption(0);
    ctx.window.confirmChoice();
    ctx.window.confirmChoice();
    assert.equal(ctx.gems, 50);
    assert.deepEqual(ctx.unlockedTanks, ['medical']);
    assert.deepEqual(ctx.claimedRewards, [index]);
});

test('road frame uses current league while each reward uses its own league', () => {
    const ctx = createGame(10000);
    const items = [], roadStyle = {};
    ctx.document = {
        getElementById: id => id === 'trophyRoadModal' ? { style: { setProperty: (name, value) => { roadStyle[name] = value; } } }
            : { set innerHTML(value) {}, appendChild: item => items.push(item) },
        createElement: () => ({ style: { setProperty(name, value) { this[name] = value; } }, classList: { add() {} } })
    };
    vm.runInContext(section('function generateTrophyRoad()', '// Simple notification system'), ctx);
    ctx.generateTrophyRoad();
    assert.equal(roadStyle['--league-color'], '#f4db87');
    const card = items.find(item => item.innerHTML && item.innerHTML.includes('5 <span'));
    assert.equal(card.style['--league-color'], '#9eacb5');
    let shown;
    ctx.window.showProgressionRewards = items => { shown = items; };
    ctx.showTrophyRoadReward({ trophies: 5 }, 'test', 'art');
    assert.equal(shown[0].leagueColor, '#9eacb5');
    ctx.showTrophyRoadReward({ trophies: 50000 }, 'test', 'art');
    assert.equal(shown[0].leagueColor, '#c35b70');
});

test('container reward opens directly without a separate reveal window', () => {
    const ctx = createGame(100);
    const queued = [], calls = [];
    Object.assign(ctx, { showFreeContainerFlow: (type, count, defer, color) => queued.push({ type, count, defer, color }),
        processNextContainer: () => calls.push('opened'), showNotification() {}, updateCoinDisplay() {}, generateTrophyRoad() {} });
    ctx.window.showProgressionRewards = () => { calls.push('unexpected reveal'); };
    vm.runInContext(section('function showTrophyRoadReward(', '// Simple notification system'), ctx);
    const index = vm.runInContext('trophyRoadRewards.findIndex(r => r.trophies === 5 && r.type === "container")', ctx);
    ctx.claimTrophyReward(index);
    assert.deepEqual(queued, [{ type: 'mini', count: 1, defer: false, color: '#9eacb5' }]);
    assert.deepEqual(calls, []);
    assert.deepEqual(ctx.claimedRewards, [index]);
});

test('deferred free containers are saved before opening and remain queued', () => {
    const saved = {}, queue = [];
    let opens = 0, saves = 0;
    const ctx = vm.createContext({ containerQueue: queue,
        localStorage: { setItem: (key, value) => { saved[key] = value; } },
        saveProgress: () => { saves++; }, processNextContainer: () => { opens++; } });
    vm.runInContext(section('function showFreeContainerFlow(', '// Free container confirm handler'), ctx);
    ctx.showFreeContainerFlow('alpha', 3, true);
    assert.deepEqual(queue, ['alpha', 'alpha', 'alpha']);
    assert.deepEqual(JSON.parse(saved.pendingFreeContainers), queue);
    assert.equal(saves, 1);
    assert.equal(opens, 0);
    ctx.showFreeContainerFlow('mini');
    assert.equal(opens, 1);
});
