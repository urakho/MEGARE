const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const main = fs.readFileSync(path.join(__dirname, '..', 'src', 'main.js'), 'utf8');
const bot = fs.readFileSync(path.join(__dirname, '..', 'src', 'bot.js'), 'utf8');

function sourceBetween(source, first, last) {
    const start = source.indexOf(first);
    const end = source.indexOf(last, start + first.length);
    assert.ok(start >= 0 && end > start);
    return source.slice(start, end);
}

test('paralyzed player can move but cannot fire or activate a weapon ability', () => {
    const tank = { paralyzed: true, paralyzedTime: 12, speed: 3, fireCooldown: 0 };
    const keys = { KeyD: true, Space: true, KeyE: true };
    let shots = 0;
    const context = {
        tank, tankType: 'normal', keys, bullets: [], flames: [],
        GameTerrain: { speedFactor: () => 1 },
        shoot() { shots++; }, getPlayerDmgMult: () => 1
    };
    const movement = sourceBetween(main, '        // handle paralyze state for player tank', '        // Apply ice-slow 50% movement penalty');
    vm.runInNewContext(`function moveProbe() { ${movement} return { dx, dy }; } result = moveProbe();`, context);
    assert.equal(context.result.dx, 3);
    assert.equal(context.result.dy, 0);
    assert.equal(tank.paralyzed, true);
    assert.equal(keys.KeyE, false);

    const fire = sourceBetween(main,
        "        if (keys['Space'] && !tank.paralyzed && tank.fireCooldown <= 0",
        '// --- APPEND_POINT_UPDATE_AI ---').replace(/\r?\n    }\s*$/, '');
    vm.runInNewContext(`function fireProbe() { ${fire} } fireProbe();`, context);
    assert.equal(shots, 0);
    tank.paralyzed = false;
    vm.runInNewContext('fireProbe();', context);
    assert.equal(shots, 1);
});

test('paralyzed bot retreats from an opponent while its weapon logic is skipped', () => {
    const enemy = { x: 100, y: 100, w: 38, h: 38, speed: 3, team: 1, paralyzed: true, paralyzedTime: 12 };
    const tank = { x: 160, y: 100, w: 38, h: 38, team: 0, alive: true };
    let shots = 0;
    const context = {
        enemy, tank, allies: [], enemies: [enemy], playerDrones: [], enemyDrones: [],
        tryDodgeIncoming: () => false,
        filterTargetsByVision: (_unit, targets) => targets,
        GameTerrain: { movementSpeed: speed => speed },
        moveSmallSteps(unit, angle, speed) { unit.x += Math.cos(angle) * speed; return true; }
    };
    vm.runInNewContext(sourceBetween(bot, 'function moveParalyzedUnit(', 'function updateEnemyAI()'), context);
    const branch = sourceBetween(bot, '        if (enemy.paralyzed) {', '        // Ice slow:');
    vm.runInNewContext(`function updateProbe() { for (let i = 0; i < 1; i++) { ${branch} shots++; } }`, context);
    context.shots = shots;
    vm.runInNewContext('updateProbe();', context);
    assert.ok(enemy.x < 100);
    assert.equal(context.shots, 0);
});
