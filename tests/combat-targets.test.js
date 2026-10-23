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

test('burovoy drill deals 40 damage per second and paralyzes only hostile tanks it touches', () => {
    const battle = makeBattle();
    const source = battle.tank;
    Object.assign(source, { x: 0, y: 0, tankType: 'burovoy', turretAngle: 0 });
    battle.tankType = 'burovoy';
    const target = { x: 55, y: 0, w: 38, h: 38, hp: 200, team: 1, alive: true, paralyzed: false };
    const friendly = { x: 55, y: 0, w: 38, h: 38, hp: 200, team: 0, alive: true, paralyzed: false };
    const drone = { x: 55, y: 0, w: 24, h: 24, hp: 200, team: 1, alive: true, paralyzed: false };
    battle.enemies.push(target);
    battle.allies.push(friendly);
    battle.enemyDrones.push(drone);
    for (let tick = 0; tick < 60; tick++) battle.updateBurovoyDrillAttack(source, true);
    assert.ok(Math.abs(target.hp - 160) < 1e-9);
    assert.equal(target.paralyzed, true);
    assert.equal(target.paralyzedTime, 12);
    assert.equal(friendly.hp, 200);
    assert.equal(friendly.paralyzed, false);
    assert.equal(drone.paralyzed, false);
    target.x = 200;
    battle.syncBurovoyDrillParalysis(target);
    assert.equal(target.paralyzed, false);
    assert.equal(target.paralyzedTime, 0);
    assert.equal(target.burovoyFireSlowTimer, 0);
});

test('drill release preserves a longer paralysis from another attack', () => {
    const battle = makeBattle();
    const source = battle.tank;
    Object.assign(source, { x: 0, y: 0, tankType: 'burovoy', turretAngle: 0 });
    battle.tankType = 'burovoy';
    const target = { x: 55, y: 0, w: 38, h: 38, hp: 200, team: 1, alive: true, paralyzed: true, paralyzedTime: 180 };
    battle.enemies.push(target);
    battle.applyBurovoyDrillDamage(source, 1);
    target.x = 200;
    battle.syncBurovoyDrillParalysis(target);
    assert.equal(target.paralyzed, true);
    assert.equal(target.paralyzedTime, 180);
});

test('drill release keeps the remaining time of a shorter independent paralysis', () => {
    const battle = makeBattle();
    const source = battle.tank;
    Object.assign(source, { x: 0, y: 0, tankType: 'burovoy', turretAngle: 0, burovoyDrillActive: true });
    battle.tankType = 'burovoy';
    const target = { x: 55, y: 0, w: 38, h: 38, hp: 200, team: 1, alive: true, paralyzed: true, paralyzedTime: 5 };
    battle.enemies.push(target);
    battle.applyBurovoyDrillDamage(source, 1);
    battle.syncBurovoyDrillParalysis(target);
    target.x = 200;
    battle.syncBurovoyDrillParalysis(target);
    assert.equal(target.paralyzed, true);
    assert.equal(target.paralyzedTime, 3);
});

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

test('robot starts with a 65-damage railgun shot', () => {
    const battle = makeBattle();
    battle.tankType = 'robot';
    battle.tank.turretAngle = 0;
    battle.shoot();
    assert.equal(battle.bullets.length, 1);
    assert.equal(battle.bullets[0].type, 'railgun');
    assert.equal(battle.bullets[0].damage, 65);
});

test('basic bot weapons keep their tank-specific projectiles and damage wooden walls', () => {
    const start = bot.indexOf('function createBotBasicProjectile(');
    const end = bot.indexOf('function updateEnemyAI()', start);
    assert.ok(start >= 0 && end > start);
    const cases = {
        normal: 'normal', ice: 'ice', egyptian: 'egyptArrow',
        kamikaze: 'kamikazeBullet', pyro: 'pyroBullet',
        mechShield: 'mechShield', mechRocket: 'mechRocketBullet', ai: 'ai'
    };
    for (const owner of ['enemy', 'ally']) {
        for (const [tankType, projectileType] of Object.entries(cases)) {
            const battle = makeBattle();
            vm.runInContext(bot.slice(start, end), battle);
            const unit = { x: 40, y: 100, w: 38, h: 38, turretAngle: 0, team: owner === 'enemy' ? 1 : 0, tankType };
            const projectile = battle.createBotBasicProjectile(unit, owner);
            assert.equal(projectile.type, projectileType, `${owner} ${tankType}`);
            assert.equal(projectile.owner, owner);
            const wall = { x: 80, y: 100, w: 60, h: 40, type: 'woodenWall', hp: 300 };
            battle.objects.push(wall);
            battle.bullets.push(projectile);
            battle.runBulletTick();
            assert.ok(wall.hp < 300 || !battle.objects.includes(wall), `${owner} ${tankType} damages wood`);
        }
    }
});

test('mirror bots copy an Egyptian arrow with the right texture and damage', () => {
    const battle = makeBattle();
    const start = bot.indexOf('function createBotBasicProjectile(');
    const end = bot.indexOf('function updateEnemyAI()', start);
    vm.runInContext(bot.slice(start, end), battle);
    for (const owner of ['enemy', 'ally']) {
        const projectile = battle.createBotMirrorProjectile({
            x: 0, y: 0, w: 38, h: 38, turretAngle: 0,
            team: owner === 'enemy' ? 1 : 0,
            lastHitType: 'egyptArrow', lastHitTime: Date.now()
        }, owner);
        assert.equal(projectile.type, 'egyptArrow');
        assert.equal(projectile.damage, 100);
        assert.equal(projectile.w, 10);
        assert.equal(projectile.h, 4);
    }
});

test('allied DIY mech fires its three-shot burst and miner plants a mine', () => {
    const start = bot.indexOf("            const tt = ally.tankType || 'normal';");
    const end = bot.indexOf("            if (tt === 'machinegun') {", start);
    assert.ok(start >= 0 && end > start);
    const random = Object.create(Math);
    random.random = () => 0;
    const context = vm.createContext({
        ally: { x: 0, y: 0, w: 38, h: 38, team: 0, tankType: 'mechDiy',
            turretAngle: 0, fireCooldown: 0, mechEnergy: 110, mechBurstCooldown: 0 },
        nd: 100, bullets: [], mines: [], Math: random,
        canPlaceMineAt: () => true, getTankShotCooldown: () => 90
    });
    vm.runInContext(`function tickAllyShot() { ${bot.slice(start, end)} }`, context);
    context.tickAllyShot();
    assert.equal(context.bullets.length, 1);
    assert.equal(context.ally.mechEnergy, 90);
    for (let tick = 0; tick < 52; tick++) context.tickAllyShot();
    assert.equal(context.bullets.length, 3);
    assert.ok(context.bullets.every(shot => shot.type === 'mechDiy' && shot.damage === 40));

    Object.assign(context.ally, { tankType: 'mine', fireCooldown: 0 });
    context.tickAllyShot();
    assert.equal(context.mines.length, 1);
    assert.equal(context.mines[0].team, 0);
    assert.equal(context.ally.fireCooldown, 90);
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

test('poison projectile creates its damaging cloud when it strikes a wooden wall', () => {
    const battle = makeBattle();
    const wall = { x: 100, y: 100, w: 30, h: 30, type: 'woodenWall', hp: 300 };
    battle.objects.push(wall);
    battle.bullets.push({ ...bullet(0, 'toxic', 0), explodeTimer: 45, spawned: 0 });
    battle.runBulletTick();
    assert.equal(wall.hp, 250);
    assert.equal(battle.bullets.length, 0);
    assert.ok(battle.objects.some(obj => obj.type === 'gas'));
});

test('electric nova from an enemy damages player and allies but spares its team', () => {
    const battle = makeBattle();
    battle.novaZones = [];
    battle.electricRays = [];
    const ally = { x: 520, y: 500, w: 38, h: 38, hp: 200, team: 0, alive: true };
    const enemy = { x: 510, y: 500, w: 38, h: 38, hp: 200, team: 1, alive: true };
    battle.allies.push(ally);
    battle.enemies.push(enemy);
    battle.createElectricNova(519, 519, 200, 50, 1);
    assert.ok(battle.electricRays.some(ray => ray.toX === 519 && ray.toY === 519));
    for (let tick = 0; tick < 10; tick++) battle.updateNovaZones();
    assert.equal(battle.tank.hp, 250);
    assert.equal(ally.hp, 150);
    assert.equal(enemy.hp, 200);
});

test('Illuminat signs deal ten damage per second only to hostile units standing on them', () => {
    const battle = makeBattle();
    const enemy = { x: 100, y: 100, w: 38, h: 38, hp: 200, team: 1, alive: true };
    const ally = { x: 100, y: 100, w: 38, h: 38, hp: 200, team: 0, alive: true };
    battle.enemies.push(enemy);
    battle.allies.push(ally);
    let marks = [{ x: 119, y: 119, size: 55, team: 0 }];
    battle.GameTerrain = { forEachIlluminatMark: callback => marks.forEach(callback) };
    for (let tick = 0; tick < 60; tick++) battle.updateIlluminatMarkDamage();
    assert.ok(Math.abs(enemy.hp - 190) < 1e-8);
    assert.equal(ally.hp, 200);
    assert.equal(battle.tank.hp, 300);

    ally.x = 500; ally.y = 500;
    marks = [{ x: 519, y: 519, size: 55, team: 1 }];
    for (let tick = 0; tick < 60; tick++) battle.updateIlluminatMarkDamage();
    assert.ok(Math.abs(battle.tank.hp - 290) < 1e-8);
    assert.ok(Math.abs(ally.hp - 190) < 1e-8);
    assert.ok(Math.abs(enemy.hp - 190) < 1e-8);
    battle.tank.romanShieldActive = true;
    for (let tick = 0; tick < 60; tick++) battle.updateIlluminatMarkDamage();
    assert.ok(Math.abs(battle.tank.hp - 285) < 1e-8, 'shield reduces fractional damage without erasing it');
    battle.tank.romanShieldActive = false;
    battle.tank.hp = 0.1;
    battle.loseModeTrophies = () => {};
    battle.syncResultOverlay = () => {};
    battle.updateIlluminatMarkDamage();
    assert.equal(battle.gameState, 'lose', 'a lethal sign ends the match');
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
        assert.ok(Math.abs(drone.hp - (150 - 75 / 60)) < 1e-9,
            'a fully charged Illuminat beam deals 75 HP per second');
        const wall = { x: 75, y: 8, w: 20, h: 24, type: 'woodenWall', hp: 300 };
        battle.objects.push(wall);
        battle.updateUnitBeam(unit, [drone]);
        assert.ok(wall.hp < 300);
        const droneHp = drone.hp;
        unit.paralyzed = true;
        unit.beamActive = true;
        unit.beamIntensity = 1;
        battle.updateUnitBeam(unit, [drone]);
        assert.equal(unit.beamActive, false);
        assert.equal(unit.beamIntensity, 0);
        assert.equal(drone.hp, droneHp);
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

test('poison projectiles deal no contact damage while clouds deal 44 HP per second', () => {
    for (const target of ['enemy', 'ally', 'player', 'drone']) {
        const battle = makeBattle();
        const hostileTeam = target === 'enemy' || target === 'drone' ? 0 : 1;
        const victim = target === 'player' ? battle.tank :
            { x: 100, y: 100, w: 24, h: 24, hp: 150, team: hostileTeam === 0 ? 1 : 0, alive: true };
        if (target === 'enemy') battle.enemies.push(victim);
        if (target === 'ally') battle.allies.push(victim);
        if (target === 'drone') battle.enemyDrones.push(victim);
        const shot = { ...bullet(hostileTeam, 'toxic', 50),
            x: target === 'player' ? 519 : 110, y: target === 'player' ? 519 : 110,
            explodeTimer: 45, spawned: 0 };
        battle.bullets.push(shot);
        battle.runBulletTick();
        assert.equal(victim.hp, target === 'player' ? 300 : 150, target);
        assert.ok(!victim.hitFlashTime, `${target} must not flash as if damaged`);
        assert.equal(battle.bullets.length, 1, 'the poison projectile keeps flying');
    }
    const battle = makeBattle();
    const start = physics.indexOf('    // Apply gas effects: check entities entering gas clouds');
    const end = physics.indexOf('    // Respawn timers (War mode)', start);
    vm.runInContext(`function runGasTick() { ${physics.slice(start, end)} }`, battle);
    const victim = { x: 100, y: 100, w: 24, h: 24, hp: 150, team: 1, alive: true };
    battle.enemies.push(victim);
    battle.objects.push({ type: 'gas', x: 110, y: 110, radius: 90, ownerTeam: 0 });
    battle.runGasTick();
    assert.ok(Math.abs(victim.hp - (150 - 44 / 60)) < 1e-9);
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
