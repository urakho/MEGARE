const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const main = fs.readFileSync('src/main.js', 'utf8');
const leagueCode = fs.readFileSync('src/league-rewards.js', 'utf8');
function game(count, oldClaim = false) {
    const data = {};
    const context = vm.createContext({ trophies: count, claimedRewards: [], containerQueue: [], PROFILE_BACKGROUNDS: {},
        localStorage: { getItem: key => data[key] ?? null, setItem: (key, value) => { data[key] = String(value); } },
        document: { createElement: () => ({}), head: { appendChild() {} } },
        _getBackgroundUnlocks: () => JSON.parse(data.tankBackgroundUnlocks || '[]'),
        _unlockAvatar(id) { const list = JSON.parse(data.tankAvatarUnlocks || '[]'); if (!list.includes(id)) list.push(id); data.tankAvatarUnlocks = JSON.stringify(list); },
        saveProgress() {}, updateCoinDisplay() {}, generateTrophyRoad() {},
        showProgressionRewards(items) { context.shown = items; }, leagueInsignia: (_, index) => String(index) });
    vm.runInContext('window = globalThis', context);
    vm.runInContext(main.slice(main.indexOf('const trophyRoadRewards = ['), main.indexOf('// Unlocked tanks list')), context);
    if (oldClaim) vm.runInContext('claimedRewards.push(trophyRoadRewards.findIndex(r => r.trophies === 10000 && r.level === "alpha"))', context);
    vm.runInContext(leagueCode, context);
    vm.runInContext(main.slice(main.indexOf('function claimTrophyReward(index)'), main.indexOf('// Simple notification system')), context);
    return { context, data };
}
test('league cosmetics are claimed once, stored in existing unlocks, and show two windows', () => {
    const { context, data } = game(100);
    vm.runInContext('claimTrophyReward(trophyRoadRewards.findIndex(r => r.type === "league" && r.trophies === 100))', context);
    assert.deepEqual(JSON.parse(data.tankAvatarUnlocks), ['league:1']);
    assert.deepEqual(JSON.parse(data.tankBackgroundUnlocks), ['league-1']);
    assert.equal(context.shown.length, 2);
    assert.equal(context.shown[1].background, true);
    context.shown = null;
    vm.runInContext('claimTrophyReward(trophyRoadRewards.findIndex(r => r.type === "league" && r.trophies === 100))', context);
    assert.equal(context.shown, null);
    assert.equal(context.UNIQUE_LEAGUE_BACKGROUNDS.length, 11);
    assert.equal(context.leagueAvatarMarkup('league:1', 64), context.leagueInsignia({}, 1, 64));
    assert.equal(context.shown, null);
});
test('secret cosmetics cannot be claimed on discovery and old alpha compensation runs once', () => {
    const { context, data } = game(20000, true);
    assert.equal(context.containerQueue.length, 2);
    vm.runInContext(leagueCode, context);
    assert.equal(context.containerQueue.length, 2);
    vm.runInContext('claimTrophyReward(trophyRoadRewards.findIndex(r => r.type === "league" && r.trophies === 50000))', context);
    assert.equal(data.tankAvatarUnlocks, undefined);
    context.trophies = 50000;
    vm.runInContext('claimTrophyReward(trophyRoadRewards.findIndex(r => r.type === "league" && r.trophies === 50000))', context);
    assert.deepEqual(JSON.parse(data.tankAvatarUnlocks), ['league:11']);
});
