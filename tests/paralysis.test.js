const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const main = fs.readFileSync(path.join(__dirname, '..', 'src', 'main.js'), 'utf8');
const bot = fs.readFileSync(path.join(__dirname, '..', 'src', 'bot.js'), 'utf8');
const physics = fs.readFileSync(path.join(__dirname, '..', 'src', 'physics.js'), 'utf8');

function sourceBetween(source, first, last) {
    const start = source.indexOf(first);
    const end = source.indexOf(last, start + first.length);
    assert.ok(start >= 0 && end > start);
    return source.slice(start, end);
}

function loadMechPower(context) {
    vm.runInContext(sourceBetween(physics, 'function getEntityTankType(', 'function isBurovoyTank('), context);
}

test('depleted player mechs stop moving and firing for exactly one second while energy regenerates', () => {
    for (const type of ['mechDiy', 'mechShield', 'mechRocket']) {
        const tank = { tankType: type, mechEnergy: 0, speed: 3, mechShieldActive: true };
        const context = vm.createContext({ tank, tankType: type, keys: { KeyD: true, KeyE: true },
            GameTerrain: { speedFactor: () => 1 } });
        loadMechPower(context);
        const movement = sourceBetween(main, '        // handle paralyze state for player tank', '        // Apply ice-slow 50% movement penalty');
        vm.runInContext(`function tickPlayer() { updateMechPower(tank); ${movement} return { dx, dy }; }`, context);
        for (let i = 0; i < 60; i++) {
            const moved = context.tickPlayer();
            assert.equal(moved.dx, 0, type);
            assert.equal(moved.dy, 0, type);
            assert.equal(tank.paralyzed, true, type);
            assert.equal(context.keys.KeyE, false, type);
        }
        assert.ok(Math.abs(tank.mechEnergy - 3) < 1e-9, type);
        assert.equal(context.tickPlayer().dx, 3, type);
        assert.equal(tank.paralyzed, false, type);
        assert.equal(tank.mechPowerStunTime, 0, type);
        if (type === 'mechShield') assert.equal(tank.mechShieldActive, false);
        for (let i = 0; i < 20; i++) assert.equal(context.tickPlayer().dx, 3, 'low energy must not repeatedly restart the stun');
    }
});

test('power depletion is detected before regeneration and preserves longer independent paralysis', () => {
    const unit = { tankType: 'mechDiy', mechEnergy: 5, paralyzed: true, paralyzedTime: 240 };
    const context = vm.createContext({});
    loadMechPower(context);
    context.updateMechPower(unit);
    assert.equal(unit.mechPowerStunTime, 60);
    assert.equal(unit.paralyzedTime, 240);
    assert.ok(unit.mechEnergy > 5);
    for (let i = 0; i < 60; i++) context.updateMechPower(unit);
    assert.equal(unit.mechPowerStunTime, 0);
    unit.mechEnergy = 0;
    context.updateMechPower(unit);
    assert.equal(unit.mechPowerStunTime, 60, 'a new depletion can stun after the battery has recovered');
});

test('depletion pauses a paid DIY burst and resumes it after recovery', () => {
    const tank = { tankType: 'mechDiy', mechEnergy: 0, mechBurstShots: 3, mechBurstDelay: 0,
        x: 100, y: 100, w: 38, h: 38, turretAngle: 0, speed: 3 };
    const context = vm.createContext({ tank, tankType: 'mechDiy', keys: {}, bullets: [],
        GameTerrain: { speedFactor: () => 1 }, getPlayerDmgMult: () => 1 });
    loadMechPower(context);
    const movement = sourceBetween(main, '        // handle paralyze state for player tank', '        // Apply ice-slow 50% movement penalty');
    const burst = sourceBetween(main, "        if (tankType === 'mechDiy' && !tank.paralyzed && (tank.mechBurstShots || 0) > 0) {",
        "        if (tankType === 'burovoy' && typeof updateBurovoyDrillAttack");
    vm.runInContext(`function tickBurst() { updateMechPower(tank); ${movement} ${burst} }`, context);
    for (let i = 0; i < 60; i++) context.tickBurst();
    assert.equal(context.bullets.length, 0);
    assert.equal(tank.mechBurstShots, 3);
    context.tickBurst();
    assert.equal(context.bullets.length, 1);
    assert.equal(tank.mechBurstShots, 2);
});

test('depleted allied and enemy mechs regenerate before AI early returns and cannot retreat', () => {
    for (const side of ['enemy', 'ally']) {
        for (const type of ['mechDiy', 'mechShield', 'mechRocket']) {
            const unit = { tankType: type, alive: true, mechEnergy: 0, fireCooldown: 0 };
            const context = vm.createContext({ [side]: unit, actions: 0,
                getEntityFireCooldownStep: () => 1.25,
                moveParalyzedUnit() { throw new Error('A powerless mech tried to move'); } });
            loadMechPower(context);
            const start = bot.indexOf(`        if (!${side} || !${side}.alive) continue;`, bot.indexOf(side === 'enemy' ? 'function updateEnemyAI()' : 'function updateAllyAI()'));
            const end = bot.indexOf('        // Ice slow:', start);
            assert.ok(start >= 0 && end > start);
            vm.runInContext(`function tickBot() { for (let i = 0; i < 1; i++) { ${bot.slice(start, end)} actions++; } }`, context);
            for (let i = 0; i < 60; i++) context.tickBot();
            assert.equal(context.actions, 0, `${side} ${type}`);
            assert.ok(Math.abs(unit.mechEnergy - 3) < 1e-9, `${side} ${type}`);
            context.tickBot();
            assert.equal(context.actions, 1, `${side} ${type}`);
        }
    }
});

test('starting another battle clears mech depletion state', () => {
    const context = vm.createContext({});
    vm.runInContext(sourceBetween(main, 'function resetTankBattleEffects(unit)', '// Apply saved tank type properties'), context);
    const unit = { mechPowerStunTime: 42, mechLowEnergyLatched: true };
    context.resetTankBattleEffects(unit);
    assert.equal(unit.mechPowerStunTime, 0);
    assert.equal(unit.mechLowEnergyLatched, false);
    loadMechPower(context);
    const transformed = { tankType: 'imitator', mechPowerStunTime: 30, mechLowEnergyLatched: true, paralyzedTime: 120 };
    context.updateMechPower(transformed);
    assert.equal(transformed.mechPowerStunTime, 0, 'leaving a copied mech form cannot leave movement permanently locked');
    assert.equal(transformed.paralyzedTime, 120, 'independent paralysis must survive a form change');
});

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

test('ice-frozen player and bot remain still while paralysis alone permits movement', () => {
    const tank = { paralyzed: true, paralyzedTime: 12, frozenEffect: 12, speed: 3 };
    const keys = { KeyD: true };
    const playerContext = { tank, tankType: 'normal', keys, GameTerrain: { speedFactor: () => 1 } };
    const movement = sourceBetween(main, '        // handle paralyze state for player tank', '        // Apply ice-slow 50% movement penalty');
    vm.runInNewContext(`function moveProbe() { ${movement} return { dx, dy }; } result = moveProbe();`, playerContext);
    assert.equal(playerContext.result.dx, 0);
    assert.equal(tank.frozenEffect, 11);

    const enemy = { x: 100, y: 100, w: 38, h: 38, speed: 3, team: 1,
        paralyzed: true, paralyzedTime: 12, frozenEffect: 12 };
    const target = { x: 160, y: 100, w: 38, h: 38, team: 0, alive: true };
    const botContext = { enemy, tank: target, allies: [], enemies: [enemy], playerDrones: [], enemyDrones: [],
        moveParalyzedUnit() { throw new Error('Frozen bot moved'); } };
    const branch = sourceBetween(bot, '        if (enemy.paralyzed) {', '        // Ice slow:');
    vm.runInNewContext(`function updateProbe() { for (let i = 0; i < 1; i++) { ${branch} } } updateProbe();`, botContext);
    assert.equal(enemy.x, 100);
    assert.equal(enemy.frozenEffect, 11);
});
