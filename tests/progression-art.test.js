const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

test('each vehicle milestone uses a different existing atlas while saved IDs remain stable', () => {
    const ctx = vm.createContext({ window: {} });
    vm.runInContext(fs.readFileSync('src/progression-art.js', 'utf8'), ctx);
    for (const [i, step] of [750, 1750, 3500, 5000, 10000].entries()) {
        const markup = ctx.window.vehicleInsignia('ice', step, 64);
        assert.match(markup, new RegExp('vehicles-tier-' + (i + 1) + '\\.png'));
        assert.match(markup, /background-size:672% 560%/);
        assert.ok(fs.existsSync('pictures/png/progression/vehicles-tier-' + (i + 1) + '.png'));
    }
    assert.match(ctx.window.leagueInsignia({}, 10), /leagues-v3\.png/);
    assert.ok(fs.existsSync('pictures/png/progression/leagues-v3.png'));
});

test('vehicle atlas alignment accounts for artwork offset in each tile', () => {
    const ctx = vm.createContext({ window: {} });
    vm.runInContext(fs.readFileSync('src/progression-art.js', 'utf8'), ctx);
    const first = ctx.window.vehicleInsignia('normal', 750, 64);
    const match = first.match(/background-position:([\d.]+)% ([\d.]+)%/);
    assert.ok(match);
    const zoom = 1.12;
    const centerX = (Number(match[1]) / 100 * (6 * zoom - 1) + 0.5) / zoom;
    const centerY = (Number(match[2]) / 100 * (5 * zoom - 1) + 0.5) / zoom;
    assert.ok(Math.abs(centerX - 0.55) < 0.001);
    assert.ok(Math.abs(centerY - 0.53) < 0.001);
});

test('saved progression avatars render before the main menu and reward scripts initialize', () => {
    const ctx = vm.createContext({ window: {} });
    vm.runInContext(fs.readFileSync('src/progression-art.js', 'utf8'), ctx);
    const main = fs.readFileSync('src/main.js', 'utf8');
    const begin = main.indexOf('function profileAvatarMarkup(');
    const end = main.indexOf('// Get the tier of a preset avatar', begin);
    assert.ok(begin >= 0 && end > begin);
    vm.runInContext(main.slice(begin, end), ctx);
    assert.match(ctx.profileAvatarMarkup('league:10', 38), /leagues-v3\.png/);
    assert.match(ctx.profileAvatarMarkup('tank-road:ice:5000', 38), /vehicles-tier-4\.png/);
    assert.equal(ctx.profileAvatarMarkup('league:99', 38), '');
});
