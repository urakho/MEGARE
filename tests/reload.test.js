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

test('reload acceleration applies to tanks except electric, plasma and flamethrower', () => {
    const physics = read('physics.js');
    const context = { GameTerrain: { reloadFactor: () => 1 } };
    vm.runInNewContext(section(physics, 'function getEntityTankType(', 'function advanceFlamethrowerBurst('), context);
    context.tank = { tankType: 'normal' };
    context.tankType = 'normal';
    assert.equal(context.getEntityFireCooldownStep(context.tank), 1.25);
    assert.equal(context.getEntityFireCooldownStep({ tankType: 'myasnoy' }), 1.25);
    for (const type of ['electric', 'plasma', 'fire']) {
        assert.equal(context.getEntityFireCooldownStep({ tankType: type }), 1);
    }
    context.GameTerrain.reloadFactor = () => 0.95;
    assert.equal(context.getEntityFireCooldownStep(context.tank), 1.1875);
    context.tank.burovoyFireSlowTimer = 1;
    assert.equal(context.getEntityFireCooldownStep(context.tank), 0);
});

test('bot shot cooldowns use the player values for every standard weapon', () => {
    const physics = read('physics.js');
    const context = { FIRE_COOLDOWN: 20, GameTerrain: { reloadFactor: () => 1 } };
    vm.runInNewContext(section(physics, 'function getEntityTankType(', 'function advanceFlamethrowerBurst('), context);
    const expected = {
        normal: 30, ice: 30, buratino: 60, toxic: 35, plasma: 300,
        musical: 80, illuminat: 240, mirror: 90, machinegun: 5,
        buckshot: 80, time: 60, imitator: 60, electric: 80,
        robot: 60, medical: 60, mine: 90, spartan: 40,
        kamikaze: 30, roman: 60, egyptian: 45, pyro: 40,
        air: 40, kvant: 60, mechDiy: 60, mechShield: 45,
        mechRocket: 50
    };
    for (const [type, cooldown] of Object.entries(expected)) {
        assert.equal(context.getTankShotCooldown(type), cooldown, type);
    }
    assert.equal(context.getTankShotCooldown('unknown'), 20);
});

test('buckshot fires five 75-damage pellets and reloads twice as long', () => {
    const physics = read('physics.js');
    const context = {
        tank: { x: 0, y: 0, w: 38, h: 38, turretAngle: 0, fireCooldown: 0 },
        tankType: 'buckshot', bullets: [], FIRE_COOLDOWN: 20,
        GameTerrain: { reloadFactor: () => 1 }
    };
    vm.runInNewContext(section(physics, 'function getEntityTankType(', 'function advanceFlamethrowerBurst('), context);
    vm.runInNewContext(section(physics, 'function shoot() {', 'function updateSpecialProjectiles()'), context);
    context.shoot();
    assert.equal(context.bullets.length, 5);
    assert.ok(context.bullets.every(bullet => bullet.type === 'buckshot' && bullet.damage === 75));
    assert.equal(context.tank.fireCooldown, 80);
});

test('myasnoy body bot keeps its three-second salvo cycle', () => {
    const physics = read('physics.js');
    const context = { GameTerrain: { reloadFactor: () => 1 } };
    vm.runInNewContext(section(physics, 'function getEntityTankType(', 'function canBurovoyPhaseThroughWalls('), context);
    const unit = { tankType: 'myasnoy', fireCooldown: 0 };
    let elapsedFrames = 0;
    for (let shot = 0; shot < 19; shot++) {
        while (unit.fireCooldown > 0) {
            unit.fireCooldown = Math.max(0, unit.fireCooldown - context.getEntityFireCooldownStep(unit));
            elapsedFrames++;
        }
        context.advanceMyasnoyBurst(unit);
        if (shot < 18) {
            assert.equal(unit.fireCooldown, 12);
            assert.equal(unit.myasnoyReloading, false);
        }
    }
    assert.equal(elapsedFrames, 180);
    assert.equal(unit.fireCooldown, 150);
    assert.equal(unit.myasnoyReloading, true);
    assert.equal(unit.myasnoyBurstShots, 0);
});

test('player myasnoy sprays every frame for three seconds before reloading', () => {
    const physics = read('physics.js');
    const context = { tank: { x: 0, y: 0, w: 38, h: 38, turretAngle: 0, fireCooldown: 0 },
        tankType: 'myasnoy', bullets: [] };
    vm.runInNewContext(section(physics, 'function advanceFlamethrowerBurst(', 'function canBurovoyPhaseThroughWalls('), context);
    vm.runInNewContext(section(physics, 'function shoot() {', 'function updateSpecialProjectiles()'), context);
    for (let frame = 0; frame < 179; frame++) {
        context.shoot();
        assert.equal(context.tank.fireCooldown, 0);
        assert.equal(context.tank.myasnoyReloading, false);
    }
    context.shoot();
    assert.equal(context.bullets.length, 360);
    assert.equal(context.tank.fireCooldown, 150);
    assert.equal(context.tank.myasnoyReloading, true);
    assert.equal(context.tank.myasnoyBurstFrames, 0);
});

test('flamethrower and waterjet stop to reload after a finite burst', () => {
    const physics = read('physics.js');
    const context = {};
    vm.runInNewContext(section(physics, 'function advanceFlamethrowerBurst(', 'function canBurovoyPhaseThroughWalls('), context);

    const flame = { fireCooldown: 0 };
    for (let shot = 1; shot <= 8; shot++) {
        context.advanceFlamethrowerBurst(flame, 9, 10);
        assert.equal(flame.fireCooldown, 10);
    }
    context.advanceFlamethrowerBurst(flame, 9, 10);
    assert.equal(flame.fireCooldown, 90);
    assert.equal(flame.flamethrowerShots, 0);

    const water = { fireCooldown: 0 };
    context.startWaterjetBurst(water);
    assert.equal(water.waterjetTimer, 90);
    water.waterjetTimer = 30;
    context.startWaterjetBurst(water);
    assert.equal(water.waterjetTimer, 30, 'holding fire must not restart the burst');
    context.stopWaterjetBurst(water);
    assert.equal(water.waterjetActive, false);
    assert.equal(water.fireCooldown, 90);
    context.startWaterjetBurst(water);
    assert.equal(water.waterjetActive, false, 'water cannot restart before reloading');

    context.tank = { x: 0, y: 0, w: 38, h: 38, turretAngle: 0, fireCooldown: 0 };
    context.flames = [];
    context.tankType = 'fire';
    vm.runInNewContext(section(physics, 'function shoot() {', 'function updateSpecialProjectiles()'), context);
    for (let shot = 0; shot < 90; shot++) context.shoot();
    assert.equal(context.tank.fireCooldown, 90);
    context.tank.fireCooldown = 0;
    context.tankType = 'waterjet';
    context.shoot();
    assert.equal(context.tank.fireCooldown, 0);
    assert.equal(context.tank.waterjetTimer, 90);
    context.tank.waterjetTimer = 42;
    context.shoot();
    assert.equal(context.tank.waterjetTimer, 42);
    context.tankType = 'myasnoy';
    context.tank.fireCooldown = 0;
    context.bullets = [];
    context.shoot();
    assert.equal(context.tank.fireCooldown, 0);
    assert.equal(context.tank.myasnoyBurstFrames, 1);
    assert.equal(context.bullets.length, 2);
});

test('waterjet damages and pushes a target without disabling its weapons', () => {
    const bot = read('bot.js');
    const target = { x: 80, y: 0, w: 38, h: 38, team: 1, hp: 1000, alive: true,
        paralyzed: false, paralyzedTime: 0, frozenEffect: 0, fireCooldown: 0 };
    const drone = { x: 90, y: 0, w: 24, h: 24, team: 1, hp: 150, alive: true };
    const tank = { x: 0, y: 0, w: 38, h: 38, team: 0, alive: true,
        turretAngle: 0, waterjetActive: true, waterjetTimer: 90 };
    let pushes = 0;
    const context = {
        tank, tankType: 'waterjet', keys: { Space: true }, objects: [], playerDrones: [], enemyDrones: [drone],
        window: { effectsEnabled: false },
        dealDamageToEntity(entity, damage) { entity.hp -= damage; return damage; },
        damageCombatDrone(entity, damage) { entity.hp -= damage; return damage; },
        moveSmallSteps() { pushes++; return true; },
        startWaterjetBurst() {},
        stopWaterjetBurst(unit) { unit.waterjetActive = false; unit.fireCooldown = 90; unit.waterjetBeamLen = 0; },
        getPlayerDmgMult: () => 1
    };
    vm.runInNewContext(section(bot, '    function updateUnitWaterjet(unit, targets) {', '    // Waterjet: Player'), context);
    for (let frame = 0; frame < 90; frame++) context.updateUnitWaterjet(tank, [target, drone]);
    assert.ok(target.hp < 1000);
    assert.ok(drone.hp < 150);
    assert.ok(pushes > 0);
    assert.equal(target.paralyzed, false);
    assert.equal(target.paralyzedTime, 0);
    assert.equal(target.frozenEffect, 0);
    assert.equal(target.fireCooldown, 0);
    context.updateUnitWaterjet(tank, [target]);
    assert.equal(tank.waterjetActive, false);
    assert.equal(tank.fireCooldown, 90);
});

test('reload bar fills as cooldown elapses and clears between shots', () => {
    const tanks = read('tanks.js');
    let clock = 0;
    const context = { performance: { now: () => clock } };
    vm.runInNewContext(section(tanks, 'function drawReloadBar(', 'function renderGameFrame()'), context);
    const rectangles = [];
    const ctx = {
        globalAlpha: 1,
        save() { this.savedAlpha = this.globalAlpha; },
        restore() { this.globalAlpha = this.savedAlpha; },
        fillRect(...args) { rectangles.push(args); }
    };
    const unit = { x: 10, y: 50, w: 38, fireCooldown: 90 };
    context.drawReloadBar(ctx, unit, 'normal', '#fff');
    const firstOpacity = unit._reloadBarOpacity;
    assert.ok(firstOpacity > 0 && firstOpacity < 1);
    assert.equal(unit._reloadBarProgress, 0);
    unit.fireCooldown = 45;
    clock += 50;
    context.drawReloadBar(ctx, unit, 'normal', '#fff');
    assert.ok(unit._reloadBarProgress > 0 && unit._reloadBarProgress < 0.5);
    assert.ok(unit._reloadBarOpacity > 0.6, 'bar appears promptly');
    unit.fireCooldown = 0;
    clock += 50;
    const visibleOpacity = unit._reloadBarOpacity;
    context.drawReloadBar(ctx, unit, 'normal', '#fff');
    assert.ok(unit._reloadBarOpacity < visibleOpacity && unit._reloadBarOpacity > 0);
    unit.fireCooldown = 30;
    clock += 50;
    rectangles.length = 0;
    context.drawReloadBar(ctx, unit, 'mechDiy', '#fff');
    assert.equal(unit._reloadBarProgress, 0);
    assert.ok(rectangles.some(rect => rect[1] === 27), 'mech reload bar sits above its energy bar');
    assert.equal(rectangles.length, 2, 'simple bar uses only background and fill');

    const myasnoy = { x: 10, y: 50, w: 38, fireCooldown: 12, myasnoyReloading: false };
    rectangles.length = 0;
    context.drawReloadBar(ctx, myasnoy, 'myasnoy', '#fff');
    assert.equal(rectangles.length, 0, 'short gaps between organic salvos do not show a reload bar');
    myasnoy.fireCooldown = 150;
    myasnoy.myasnoyReloading = false;
    context.drawReloadBar(ctx, myasnoy, 'myasnoy', '#fff');
    assert.equal(rectangles.length, 2, 'the long reload is visible even without a state flag');
    myasnoy.fireCooldown = 8;
    clock += 50;
    rectangles.length = 0;
    context.drawReloadBar(ctx, myasnoy, 'myasnoy', '#fff');
    assert.equal(rectangles.length, 2, 'the bar stays visible until the reload finishes');
});

test('machinegun reload bar appears only after the firing burst overheats', () => {
    const tanks = read('tanks.js');
    const physics = read('physics.js');
    let clock = 0;
    const context = { performance: { now: () => clock } };
    vm.runInNewContext(section(physics, 'const MACHINEGUN_MAX_HEAT', 'function getTankShotCooldown('), context);
    vm.runInNewContext(section(tanks, 'function drawReloadBar(', 'function renderGameFrame()'), context);
    const rectangles = [];
    const ctx = {
        globalAlpha: 1,
        save() { this.savedAlpha = this.globalAlpha; },
        restore() { this.globalAlpha = this.savedAlpha; },
        fillRect(...args) { rectangles.push(args); }
    };
    const unit = { x: 0, y: 40, w: 38, fireCooldown: 5, heat: 100, overheated: false };
    context.drawReloadBar(ctx, unit, 'machinegun', '#fff');
    assert.equal(rectangles.length, 0, 'short gaps between bullets do not show reloading');
    unit.heat = 160;
    unit.overheated = true;
    clock += 50;
    context.drawReloadBar(ctx, unit, 'machinegun', '#fff');
    assert.equal(unit._reloadBarTotal, 160);
    assert.equal(unit._reloadBarProgress, 0);
    assert.equal(rectangles.length, 2);
    unit.heat = 80;
    clock += 50;
    context.drawReloadBar(ctx, unit, 'machinegun', '#fff');
    assert.ok(unit._reloadBarProgress > 0 && unit._reloadBarProgress < 0.5);
    unit.heat = 0;
    unit.overheated = false;
    clock += 50;
    context.drawReloadBar(ctx, unit, 'machinegun', '#fff');
    assert.equal(unit._reloadBarTotal, 0);
});

test('machinegun fires 10-damage bullets in a shorter burst and keeps its cooling time', () => {
    const physics = read('physics.js');
    const context = {
        tank: { x: 0, y: 0, w: 38, h: 38, turretAngle: 0, fireCooldown: 0, heat: 0 },
        tankType: 'machinegun', bullets: [],
        FIRE_COOLDOWN: 20, GameTerrain: { reloadFactor: () => 1 }
    };
    vm.runInNewContext(section(physics, 'function getEntityTankType(', 'function advanceFlamethrowerBurst('), context);
    vm.runInNewContext(section(physics, 'function shoot() {', 'function updateSpecialProjectiles()'), context);
    assert.equal(vm.runInNewContext('MACHINEGUN_MAX_HEAT', context), 160);
    for (let frame = 0; frame < 160; frame++) {
        context.tank.fireCooldown = Math.max(0, context.tank.fireCooldown - context.getEntityFireCooldownStep(context.tank));
        context.tank.heat++;
        if (context.tank.heat < 160 && context.tank.fireCooldown <= 0) context.shoot();
    }
    assert.equal(context.bullets.length, 40);
    assert.ok(context.bullets.every(bullet => bullet.type === 'machinegun' && bullet.damage === 10));
    const overheated = { heat: 160, overheated: true };
    for (let frame = 0; frame < 120; frame++) context.coolMachinegunHeat(overheated);
    assert.equal(overheated.heat, 0);
    assert.equal(overheated.overheated, false);
});
