const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const physics = fs.readFileSync(path.join(__dirname, '..', 'src', 'physics.js'), 'utf8');
const bot = fs.readFileSync(path.join(__dirname, '..', 'src', 'bot.js'), 'utf8');
const main = fs.readFileSync(path.join(__dirname, '..', 'src', 'main.js'), 'utf8');

function makeBattle() {
    const context = vm.createContext({
        tank: { x: 500, y: 500, w: 38, h: 38, hp: 300, team: 0, alive: true },
        tankType: 'normal', allies: [], enemies: [], playerDrones: [], enemyDrones: [],
        objects: [], bullets: [], flames: [], particles: [], illusions: [], soundWaves: [],
        worldWidth: 1200, worldHeight: 900, currentMode: 'single', gameState: 'playing',
        navNeedsRebuild: false, window: { effectsEnabled: false },
        FIRE_COOLDOWN: 20, GameTerrain: { reloadFactor: () => 1 }
    });
    vm.runInContext(physics, context);
    context.spawnParticle = () => {};
    context.spawnExplosion = () => {};
    const start = physics.indexOf('    // Обновление пуль\n    for (let i = bullets.length');
    const end = physics.indexOf('    // Обновление звуковых волн', start);
    assert.ok(start >= 0 && end > start);
    vm.runInContext(`function runBulletTick() { const terrainIndex = null; ${physics.slice(start, end)} }`, context);
    return context;
}

function bullet(team, type = 'normal', damage = 100) {
    return { x: 110, y: 110, w: 8, h: 8, vx: 0, vy: 0,
        life: 20, team, owner: team === 1 ? 'enemy' : 'player', type, damage };
}

test('player, ally and enemy projectiles damage hostile robot drones', () => {
    for (const { team, owner, group } of [
        { team: 0, owner: 'player', group: 'enemyDrones' },
        { team: 0, owner: 'ally', group: 'enemyDrones' },
        { team: 1, owner: 'enemy', group: 'playerDrones' }
    ]) {
        const battle = makeBattle();
        const drone = { x: 100, y: 100, w: 24, h: 24, hp: 150, team: team === 0 ? 1 : 0, alive: true };
        battle[group].push(drone);
        battle.bullets.push({ ...bullet(team), owner });
        battle.runBulletTick();
        assert.equal(drone.hp, 50, owner);
        assert.equal(battle.bullets.length, 0, owner);
    }
});

test('friendly drones are safe and piercing shots hit each hostile drone once', () => {
    const battle = makeBattle();
    const friendly = { x: 100, y: 100, w: 24, h: 24, hp: 150, team: 0, alive: true };
    const hostile = { x: 100, y: 100, w: 24, h: 24, hp: 150, team: 1, alive: true };
    battle.playerDrones.push(friendly);
    battle.enemyDrones.push(hostile);
    battle.bullets.push(bullet(0, 'railgun', 75));
    battle.runBulletTick();
    battle.runBulletTick();
    assert.equal(friendly.hp, 150);
    assert.equal(hostile.hp, 75);
});

test('machinegun bullets deal their 10 base damage to drones and wooden walls', () => {
    const battle = makeBattle();
    const drone = { x: 100, y: 100, w: 24, h: 24, hp: 150, team: 1, alive: true };
    battle.enemyDrones.push(drone);
    battle.bullets.push(bullet(0, 'machinegun', 10));
    battle.runBulletTick();
    assert.equal(drone.hp, 140);
    const wall = { x: 100, y: 100, w: 30, h: 30, type: 'woodenWall', hp: 300 };
    battle.objects.push(wall);
    battle.bullets.push(bullet(0, 'machinegun', 10));
    battle.runBulletTick();
    assert.equal(wall.hp, 290);
});

test('shots from all three sides destroy boxes and damage wooden walls', () => {
    for (const { team, owner } of [
        { team: 0, owner: 'player' }, { team: 0, owner: 'ally' }, { team: 1, owner: 'enemy' }
    ]) {
        const battle = makeBattle();
        const box = { x: 100, y: 100, w: 30, h: 30, type: 'box' };
        battle.objects.push(box);
        battle.bullets.push({ ...bullet(team), owner });
        battle.runBulletTick();
        assert.equal(battle.objects.includes(box), false);
        const wall = { x: 100, y: 100, w: 30, h: 30, type: 'woodenWall', hp: 300 };
        battle.objects.push(wall);
        battle.bullets.push({ ...bullet(team), owner });
        battle.runBulletTick();
        assert.equal(wall.hp, 200);
    }
});

test('special projectiles also break boxes and wooden walls', () => {
    for (const type of ['rocket', 'plasmaBlast', 'musical', 'romanBlade', 'mechRocketBullet']) {
        for (const objectType of ['box', 'woodenWall']) {
            const battle = makeBattle();
            const object = { x: 100, y: 100, w: 30, h: 30, type: objectType, hp: 300 };
            battle.objects.push(object);
            battle.bullets.push({ ...bullet(0, type, 150), bounces: 0, maxBounces: 3, explodeRadius: 50 });
            battle.runBulletTick();
            assert.ok(!battle.objects.includes(object) || object.hp < 300, `${type} against ${objectType}`);
        }
    }
});

test('explosions and gas reach hostile drones and destructible cover', () => {
    const battle = makeBattle();
    const friendly = { x: 100, y: 100, w: 24, h: 24, hp: 150, team: 0, alive: true };
    const hostile = { x: 100, y: 100, w: 24, h: 24, hp: 150, team: 1, alive: true };
    const wall = { x: 100, y: 100, w: 30, h: 30, type: 'woodenWall', hp: 300 };
    const box = { x: 120, y: 100, w: 30, h: 30, type: 'box' };
    battle.playerDrones.push(friendly);
    battle.enemyDrones.push(hostile);
    battle.objects.push(wall, box);
    battle.explodeRocket(bullet(0, 'rocket', 200));
    assert.equal(friendly.hp, 150);
    assert.equal(battle.enemyDrones.length, 0);
    assert.ok(wall.hp < 300);
    assert.equal(battle.objects.includes(box), false);
    const gasWall = { x: 100, y: 100, w: 30, h: 30, type: 'woodenWall', hp: 300 };
    battle.objects.push(gasWall);
    battle.explodeGas(bullet(0, 'toxic', 50));
    assert.equal(gasWall.hp, 250);
});

test('player and enemy beams damage hostile drones and break cover', () => {
    const battle = makeBattle();
    const start = bot.indexOf('    function updateUnitBeam(unit, targets) {');
    const end = bot.indexOf('    // Illuminat beam logic (Player)', start);
    assert.ok(start >= 0 && end > start);
    vm.runInContext(bot.slice(start, end), battle);
    for (const team of [0, 1]) {
        const unit = { x: 0, y: 0, w: 38, h: 38, team, turretAngle: 0,
            beamActive: true, beamStartTime: Date.now(), beamIntensity: 1, beamCooldown: 0 };
        const drone = { x: 95, y: 7, w: 24, h: 24, hp: 150,
            team: team === 0 ? 1 : 0, alive: true };
        (team === 0 ? battle.enemyDrones : battle.playerDrones).push(drone);
        battle.updateUnitBeam(unit, [drone]);
        assert.ok(drone.hp < 150);
        const wall = { x: 75, y: 8, w: 20, h: 24, type: 'woodenWall', hp: 300 };
        battle.objects.push(wall);
        battle.updateUnitBeam(unit, [drone]);
        assert.ok(wall.hp < 300);
        battle.objects.length = 0;
    }
});

test('poison gas damages enemy drones and leaves friendly drones safe', () => {
    const battle = makeBattle();
    const start = physics.indexOf('    // Apply gas effects: check entities entering gas clouds');
    const end = physics.indexOf('    // Respawn timers (War mode)', start);
    assert.ok(start >= 0 && end > start);
    vm.runInContext(`function runGasTick() { ${physics.slice(start, end)} }`, battle);
    const friendly = { x: 100, y: 100, w: 24, h: 24, hp: 150, team: 0, alive: true };
    const hostile = { x: 100, y: 100, w: 24, h: 24, hp: 150, team: 1, alive: true };
    battle.playerDrones.push(friendly);
    battle.enemyDrones.push(hostile);
    battle.objects.push({ type: 'gas', x: 110, y: 110, radius: 90, ownerTeam: 0 });
    battle.runGasTick();
    assert.equal(friendly.hp, 150);
    assert.equal(hostile.poisonTimer, 179);
    assert.ok(hostile.hp < 150);
});

test('mines from any team can damage drones, boxes and wooden walls', () => {
    const start = main.indexOf('        // Update mines — check collisions and trigger explosions');
    const end = main.indexOf('        // Update combat drones (robot tank ultimate)', start);
    assert.ok(start >= 0 && end > start);
    for (const team of [0, 1]) {
        const battle = makeBattle();
        battle.mines = [{ x: 110, y: 110, radius: 18, team, damage: 150 }];
        const drone = { x: 100, y: 100, w: 24, h: 24, hp: 150, team: team === 0 ? 1 : 0, alive: true };
        (team === 0 ? battle.enemyDrones : battle.playerDrones).push(drone);
        const box = { x: 120, y: 100, w: 20, h: 20, type: 'box' };
        const wall = { x: 100, y: 125, w: 30, h: 20, type: 'woodenWall', hp: 300 };
        battle.objects.push(box, wall);
        vm.runInContext(`function runMines() { ${main.slice(start, end)} }`, battle);
        battle.runMines();
        assert.equal(battle.mines.length, 0);
        assert.equal(battle.objects.includes(box), false);
        assert.ok(wall.hp < 300);
        assert.ok(drone.hp < 150);
    }
});
