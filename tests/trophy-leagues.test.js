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
        getElementById: () => ({ set innerHTML(value) {}, appendChild: item => items.push(item) }),
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
