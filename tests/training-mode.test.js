const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const read = name => fs.readFileSync(path.join(__dirname, '..', 'src', name), 'utf8');
const section = (source, first, last) => {
    const start = source.indexOf(first);
    const end = source.indexOf(last, start + first.length);
    assert.ok(start >= 0 && end > start);
    return source.slice(start, end);
};

test('training creates four practice areas and the shooter fires only inside its area while unfrozen', () => {
    const window = { frameCount: 0 };
    const context = {
        window, worldWidth: 2300, worldHeight: 1550, objects: [], enemies: [], allies: [], bullets: [],
        tankType: 'normal', tank: { x: 0, y: 0, w: 38, h: 38, alive: true },
        currentMode: 'training', GameTerrain: { canSee: () => true },
        setTankHP() {}, spawnParticle() {}, Math
    };
    const map = read('mode-map.js');
    vm.runInNewContext(section(map, 'function generateTrainingMap()', 'function spawnAllies('), context);
    vm.runInNewContext(section(map, 'function spawnTrainingMode()', 'function updateBossFight()'), context);
    context.generateTrainingMap();
    context.spawnTrainingMode();

    assert.equal(context.trainingDummies.length, 12);
    const megaTarget = context.trainingDummies.find(dummy => dummy.maxHp === 5000);
    assert.ok(megaTarget);
    assert.equal(megaTarget.hp, 5000);
    assert.equal(megaTarget.w, 88);
    assert.ok(megaTarget.x > 1200 && megaTarget.y < 650);
    assert.equal(context.trainingShooterDummy.x, context.trainingShooterDummy.spawnX);
    assert.ok(context.objects.length < 300);
    assert.ok(context.objects.some(o => o.type === 'wall' && o.x === 1200 && o.y === 300));
    assert.ok(context.objects.some(o => o.type === 'wall' && o.x === 1200 && o.y === 1100));
    for (const y of [650, 850]) {
        assert.equal(context.objects.some(o => o.type === 'wall' && o.x === 300 && o.y === y), false);
        assert.equal(context.objects.some(o => o.type === 'wall' && o.x === 1650 && o.y === y), false);
    }

    const main = read('main.js');
    vm.runInNewContext(section(main, 'function resetTrainingDummyEffects(', 'function updateDuelZone()'), context);
    const shooter = context.trainingShooterDummy;
    shooter.fireCooldown = 0;
    context.updateTrainingMode();
    assert.equal(context.bullets.length, 0);

    context.tank.x = window.trainingShooterZone.x + 300;
    context.tank.y = window.trainingShooterZone.y + 300;
    shooter.fireCooldown = 0;
    context.updateTrainingMode();
    assert.equal(context.bullets.length, 1);
    assert.equal(context.bullets[0].trainingZone, window.trainingShooterZone);

    context.bullets.length = 0;
    shooter.paralyzed = true;
    shooter.paralyzedTime = 60;
    shooter.frozenEffect = 60;
    shooter.fireCooldown = 0;
    context.updateTrainingMode();
    assert.equal(context.bullets.length, 0);
    assert.equal(shooter.paralyzedTime, 59);
    assert.equal(shooter.frozenEffect, 59);

    for (let i = 0; i < 59; i++) context.updateTrainingMode();
    assert.equal(shooter.paralyzed, false);
    assert.equal(context.bullets.length, 1);
});
