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
        FIRE_COOLDOWN: 20, GameTerrain: { reloadFactor: () => 1, speedFactor: () => 1 }
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

test('flamethrower hits mark presentation heat only after unblocked damage', () => {
    const start = physics.indexOf('    for (let i = flames.length - 1;');
    const end = physics.indexOf('    // Advance each barrage once', start);
    assert.ok(start >= 0 && end > start);
    for (const team of [0, 1]) for (const blocked of [false, true]) {
        const battle = makeBattle();
        battle.window.frameCount = 120;
        battle.tank.romanShieldActive = blocked;
        battle.flames.push({ x: 519, y: 519, vx: 0, vy: 0, life: 20, damage: 22, team, owner: team ? 'enemy' : 'ally' });
        vm.runInContext(`function hitFlame() { ${physics.slice(start, end)} }`, battle);
        battle.hitFlame();
        assert.equal(battle.tank.hp, blocked || team === 0 ? 300 : 278);
        assert.equal(battle.tank._immersionHeatFrame, blocked || team === 0 ? undefined : 120);
        assert.equal(battle.tank.burning, undefined, 'heat presentation does not add a burn status');
    }
});

test('own and allied projectiles cannot trigger player attack immersion statuses', () => {
    for (const owner of ['player', 'ally']) for (const type of ['ice', 'pyroBullet', 'electricBall']) {
        const battle = makeBattle();
        Object.assign(battle.tank, { x: 100, y: 100 });
        battle.window.frameCount = 100;
        battle.bullets.push({ ...bullet(0, type, 20), owner, homingStrength: 0.15 });
        battle.runBulletTick();
        assert.equal(battle.tank.hp, 300, `${owner} ${type}`);
        assert.equal(battle.tank.iceSlowed, undefined);
        assert.equal(battle.tank.burning, undefined);
        assert.equal(battle.tank._immersionElectricFrame, undefined);
    }
});

test('electric impacts record a cue only for a fresh unprotected hostile hit', () => {
    for (const protectedHit of [false, true]) {
        const battle = makeBattle();
        Object.assign(battle.tank, { x: 100, y: 100, hp: 1000, kamikazeInvincible: protectedHit });
        battle.window.frameCount = 100;
        battle.bullets.push({ ...bullet(1, 'electricBall', 150), homingStrength: 0.15 });
        battle.runBulletTick();
        assert.equal(battle.tank.hp, protectedHit ? 1000 : 850);
        assert.equal(battle.tank._immersionElectricFrame, protectedHit ? undefined : 100);
        battle.window.frameCount = 101; battle.runBulletTick();
        assert.equal(battle.tank._immersionElectricFrame, protectedHit ? undefined : 100, 'chain shots cannot repeatedly refresh one hit');
    }
});

test('musical and air hits cue immersion only after hostile unprotected damage', () => {
    for (const type of ['musical', 'airBullet']) for (const team of [0, 1]) for (const protectedHit of [false, true]) {
        const battle = makeBattle();
        Object.assign(battle.tank, { x: 100, y: 100, kamikazeInvincible: protectedHit });
        battle.window.frameCount = 120;
        battle.bullets.push({ ...bullet(team, type, 20), vx: 0, vy: 1 });
        battle.runBulletTick();
        const hit = team === 1 && !protectedHit;
        assert.equal(battle.tank.hp, hit ? 280 : 300);
        assert.equal(battle.tank._immersionMusicFrame, hit && type === 'musical' ? 120 : undefined);
        assert.equal(battle.tank._immersionAirFrame, hit && type === 'airBullet' ? 120 : undefined);
        assert.equal(battle.tank._immersionAirAngle, hit && type === 'airBullet' ? Math.PI / 2 : undefined);
    }
});

test('musical ultimate waves cue immersion only when they damage the hostile player', () => {
    for (const team of [0, 1]) for (const protectedHit of [false, true]) {
        const battle = makeBattle();
        Object.assign(battle.tank, { x: 100, y: 100, kamikazeInvincible: protectedHit });
        battle.window.frameCount = 140;
        battle.musicalSoundWaves = [{ x: 118, y: 118, vx: 1, vy: 0, radius: 6, life: 60, damage: 30, bounces: 0, maxBounces: 8, team }];
        battle.updateSpecialProjectiles();
        assert.equal(battle.tank.hp, team === 1 && !protectedHit ? 270 : 300);
        assert.equal(battle.tank._immersionMusicFrame, team === 1 && !protectedHit ? 140 : undefined);
    }
});

test('Buratino normal, ultimate, rocket and legacy barrages cue only hostile damage', () => {
    for (const mode of ['normal', 'ultimate', 'rocket', 'legacy']) for (const team of [0, 1]) for (const protectedHit of [false, true]) {
        const battle = makeBattle();
        Object.assign(battle.tank, { x: 100, y: 100, hp: 1000, kamikazeInvincible: protectedHit });
        battle.window.frameCount = 100;
        if (mode === 'normal' || mode === 'ultimate') {
            const ultimate = mode === 'ultimate'; battle.tank.x = ultimate ? 300 : 220;
            const source = { x: 0, y: 100, w: 38, h: 38, turretAngle: 0, team };
            const barrage = battle.createBuratinoBarrage(source, ultimate);
            for (let i = 0; i < 100; i++) battle.updateBuratinoBarrage(barrage);
        } else if (mode === 'rocket') battle.explodeRocket({ x: 119, y: 119, team });
        else {
            battle.buratinoBarrages = [{ x: 119, y: 119, vx: 0, vy: 0, radius: 5, life: 1, explosionRadius: 100, damage: 300, team }];
            battle.updateSpecialProjectiles();
        }
        assert.equal(battle.tank._immersionBarrageFrame, team === 1 && !protectedHit ? 100 : undefined, `${mode} team ${team}`);
        if (team === 1 && !protectedHit) assert.ok(battle.tank.hp < 1000);
    }
    const battle = makeBattle(); Object.assign(battle.tank, { x: 100, y: 100, hp: 5000 });
    for (const frame of [100, 101, 112]) {
        battle.window.frameCount = frame; battle.explodeRocket({ x: 119, y: 119, team: 1 });
        assert.equal(battle.tank._immersionBarrageFrame, frame === 101 ? 100 : frame, 'near-simultaneous blasts are coalesced');
    }
});

test('Kamikaze impact presentation requires direct contact with the player', () => {
    for (const contact of [false, true]) {
        const battle = makeBattle();
        Object.assign(battle.tank, { x: 100, y: 100, hp: 1000 });
        const unit = { x: contact ? 55 : 800, y: 100, w: 38, h: 38, hp: 300, alive: true, team: 1, tankType: 'kamikaze', turretAngle: 0 };
        battle.enemies.push(unit); battle.window.frameCount = 120;
        battle.startKamikazeDash(unit);
        if (!contact) unit.kamikazeDashTimer = 1;
        battle.updateKamikazeDash(unit);
        assert.equal(battle.tank._immersionImpactFrame, contact ? 120 : undefined);
        assert.equal(unit.kamikazeUltActive, false);
        assert.ok(contact ? battle.tank.hp < 1000 : battle.tank.hp === 1000);
    }
});

test('waterjet cue follows damage contact and respects shields', () => {
    const start = bot.indexOf('    function updateUnitWaterjet('), end = bot.indexOf('    // Waterjet: Player', start);
    assert.ok(start >= 0 && end > start);
    for (const team of [0, 1]) for (const blocked of [false, true]) {
        const battle = makeBattle();
        Object.assign(battle.tank, { x: 200, y: 100, romanShieldActive: blocked });
        battle.window.frameCount = 140; battle.moveSmallSteps = () => true;
        vm.runInContext(bot.slice(start, end), battle);
        battle.source = { x: 100, y: 100, w: 38, h: 38, hp: 300, team, tankType: 'waterjet', waterjetActive: true, waterjetTimer: 60, turretAngle: 0 };
        vm.runInContext('updateUnitWaterjet(source, [tank])', battle);
        assert.equal(battle.tank.hp, blocked || team === 0 ? 300 : 298.5);
        assert.equal(battle.tank._immersionWaterFrame, blocked || team === 0 ? undefined : 140);
    }
});

test('Illuminat immersion cue is recorded only when its ultimate reaches the player', () => {
    const bot = fs.readFileSync(path.join(__dirname, '..', 'src', 'bot.js'), 'utf8');
    const start = bot.indexOf('            // Illuminat: inversion of controls');
    const end = bot.indexOf('            // electric: charge ultimate', start);
    assert.ok(start >= 0 && end > start);
    for (const team of [0, 1]) for (const inRange of [false, true]) {
        const battle = makeBattle();
        battle.window.frameCount = 240;
        battle.Math = Object.assign(Object.create(Math), { random: () => 0 });
        battle.GameTerrain.activateIlluminatSuper = () => {};
        battle.enemy = { x: inRange ? 400 : 0, y: 500, w: 38, h: 38, tankType: 'illuminat', team };
        battle.distToNearest = 100;
        vm.runInContext(bot.slice(start, end), battle);
        assert.equal(battle.tank._immersionIlluminatFrame, inRange && team === 1 ? 240 : undefined);
        assert.equal(battle.tank.invertedControls, inRange && team === 1 ? 120 : undefined);
    }
});

test('Kvant overload does not affect a player on the same team', () => {
    const start = bot.indexOf('            if (enemy.kvantUltCooldown === undefined)'), end = bot.indexOf('            // Roman reinforcements', start);
    assert.ok(start >= 0 && end > start);
    for (const team of [0, 1]) {
        const battle = makeBattle();
        battle.Math = Object.assign(Object.create(Math), { random: () => 0 });
        battle.enemy = { x: 400, y: 500, w: 38, h: 38, tankType: 'kvant', team, kvantUltCooldown: 0 };
        battle.distToNearest = 100;
        vm.runInContext(bot.slice(start, end), battle);
        assert.equal(battle.tank._kvantOverload, team === 1 ? true : undefined);
    }
});

test('Kamikaze charges damage a direct target and nearby hostiles once, sparing friends', () => {
    for (const owner of ['player', 'ally', 'enemy']) {
        const battle = makeBattle();
        const team = owner === 'enemy' ? 1 : 0;
        Object.assign(battle.tank, { x: 800, y: 800 });
        const direct = { x: 100, y: 100, w: 20, h: 20, hp: 50, team: 1 - team, alive: true };
        const nearby = { ...direct, x: 130, hp: 300 };
        const outside = { ...nearby, x: 200 };
        const friend = { ...direct, hp: 300, team };
        battle.enemies.push(direct, nearby, outside, friend);
        const drone = { ...nearby, y: 115 };
        battle.enemyDrones.push(drone);
        const charge = bullet(team, 'kamikazeBullet');
        charge.owner = owner;
        battle.bullets.push(charge);
        battle.runBulletTick();
        assert.equal(battle.enemies.includes(direct), false, owner);
        assert.ok(nearby.hp < 300 && nearby.hp > 200, owner);
        assert.ok(drone.hp < 300, owner);
        assert.equal(outside.hp, 300, owner);
        assert.equal(friend.hp, 300, owner);
        assert.equal(battle.bullets.length, 0, owner);
        const hp = nearby.hp;
        battle.explodeKamikazeProjectile(charge);
        battle.runBulletTick();
        assert.equal(nearby.hp, hp, owner);
    }
});

test('Kamikaze charges explode at cover and expiry, and a mirror can reflect them', () => {
    const battle = makeBattle();
    const wall = { type: 'woodenWall', x: 100, y: 100, w: 30, h: 30, hp: 300 };
    battle.objects.push(wall);
    battle.bullets.push(bullet(0, 'kamikazeBullet'));
    battle.runBulletTick();
    assert.ok(wall.hp < 300);
    assert.equal(battle.bullets.length, 0);
    battle.objects.length = 0;
    const mirror = { x: 100, y: 100, w: 20, h: 20, hp: 300, team: 1, alive: true,
        tankType: 'mirror', mirrorShieldActive: true };
    battle.enemies.push(mirror);
    const charge = { ...bullet(0, 'kamikazeBullet'), vx: 1 };
    battle.bullets.push(charge);
    battle.runBulletTick();
    assert.equal(charge.team, 1);
    assert.equal(charge.vx, -1.5);
    assert.equal(charge.detonated, undefined);
    assert.equal(mirror.hp, 300);
    battle.enemies.length = 0;
    charge.life = 1;
    battle.runBulletTick();
    assert.equal(charge.detonated, true);
    assert.equal(battle.bullets.length, 0);
});

test('Kamikaze dash steers gradually, breaks cover and ends in one area blast', () => {
    const battle = makeBattle();
    battle.tankType = 'kamikaze';
    Object.assign(battle.tank, { x: 100, y: 100, turretAngle: 0 });
    const direct = { x: 150, y: 100, w: 38, h: 38, hp: 400, team: 1, alive: true };
    const nearby = { ...direct, x: 210 };
    const ally = { ...direct, team: 0 };
    battle.enemies.push(direct, nearby);
    battle.allies.push(ally);
    battle.objects.push({ type: 'wall', x: 138, y: 100, w: 6, h: 38 });
    assert.equal(battle.startKamikazeDash(battle.tank), true);
    assert.equal(battle.dealDamageToEntity(battle.tank, 100), 0);
    battle.updateKamikazeDash(battle.tank, Math.PI / 2);
    assert.ok(battle.tank.kamikazeDashAngle > 0 && battle.tank.kamikazeDashAngle <= 0.008);
    for (let i = 0; i < 10 && battle.tank.kamikazeUltActive; i++) battle.updateKamikazeDash(battle.tank);
    assert.equal(battle.tank.kamikazeUltActive, false);
    assert.equal(battle.tank.kamikazeInvincible, false);
    assert.equal(battle.tank.kamikazeRecoveryTimer, 45);
    assert.equal(battle.objects.some(obj => obj.type === 'wall'), false);
    assert.ok(direct.hp < nearby.hp && nearby.hp < 400);
    assert.equal(ally.hp, 400);
    assert.equal(battle.tank.hp, 300);
    const hp = direct.hp;
    battle.finishKamikazeDash(battle.tank);
    assert.equal(direct.hp, hp);
    assert.equal(battle.dealDamageToEntity(battle.tank, 10), 10);
    battle.shoot();
    assert.equal(battle.bullets.length, 0);
    battle.tank.kamikazeRecoveryTimer = 0;
    battle.shoot();
    assert.equal(battle.bullets[0].type, 'kamikazeBullet');
});

test('holding Kamikaze steering stays within twenty degrees of the launch direction', () => {
    for (const angle of [0, Math.PI / 2, Math.PI - 0.03, -Math.PI + 0.03]) {
        for (const sign of [-1, 1]) {
            const battle = makeBattle();
            battle.worldWidth = battle.worldHeight = 5000;
            Object.assign(battle.tank, { x: 2500, y: 2500, turretAngle: angle });
            battle.startKamikazeDash(battle.tank);
            for (let i = 0; i < 80; i++) {
                const previous = battle.tank.kamikazeDashAngle;
                battle.updateKamikazeDash(battle.tank, angle + sign * Math.PI / 2);
                const deviation = Math.atan2(Math.sin(battle.tank.kamikazeDashAngle - angle), Math.cos(battle.tank.kamikazeDashAngle - angle));
                assert.ok(Math.abs(deviation) <= Math.PI / 9 + 1e-9);
                assert.ok(Math.abs(battle.tank.kamikazeDashAngle - previous) <= 0.008 + 1e-9);
            }
            assert.ok(Math.abs(battle.tank.kamikazeDashAngle - angle - sign * Math.PI / 9) < 1e-9);
        }
    }
});

test('Kamikaze dash ends at the map edge, times out and is interrupted by paralysis', () => {
    for (const ending of ['edge', 'timeout', 'paralysis']) {
        const battle = makeBattle();
        battle.tankType = 'kamikaze';
        Object.assign(battle.tank, { x: ending === 'edge' ? 1160 : 100, y: 100, turretAngle: 0 });
        let blasts = 0;
        battle.spawnExplosion = () => { blasts++; };
        battle.startKamikazeDash(battle.tank);
        if (ending === 'timeout') battle.tank.kamikazeDashTimer = 1;
        if (ending === 'paralysis') battle.tank.paralyzed = true;
        battle.updateKamikazeDash(battle.tank);
        assert.equal(battle.tank.kamikazeUltActive, false, ending);
        assert.equal(battle.tank.kamikazeInvincible, false, ending);
        assert.equal(blasts, ending === 'paralysis' ? 0 : 1, ending);
        assert.ok(battle.tank.x <= 1162, ending);
        assert.equal(battle.startKamikazeDash(battle.tank), false, ending);
    }
});

test('allied and hostile Kamikaze bots use the shared weapon, dash and recovery', () => {
    for (const owner of ['ally', 'enemy']) {
        const battle = makeBattle();
        const start = bot.indexOf('function tickBotKamikaze(');
        const end = bot.indexOf('function updateEnemyAI()', start);
        vm.runInContext(bot.slice(start, end), battle);
        battle.Math = Object.assign(Object.create(Math), { random: () => 0 });
        battle.filterTargetsByVision = (_unit, targets) => targets;
        let retreatSpeed = 0;
        battle.moveParalyzedUnit = (_unit, _targets, speed) => { retreatSpeed = speed; };
        const unit = { x: 100, y: 100, w: 38, h: 38, hp: 300, speed: 3, alive: true,
            turretAngle: 0, tankType: 'kamikaze', team: owner === 'enemy' ? 1 : 0 };
        const target = { ...unit, x: 250, team: 1 - unit.team, tankType: 'normal' };
        const projectile = battle.createBotBasicProjectile(unit, owner);
        assert.equal(projectile.type, 'kamikazeBullet');
        assert.equal(projectile.damage, 100);
        assert.equal(projectile.life, 65);
        assert.equal(battle.tryBotKamikazeDash(unit, target), true);
        assert.equal(battle.dealDamageToEntity(unit, 100), 0);
        battle.tickBotKamikaze(unit);
        assert.equal(battle.handleBotKamikazeMovement(unit, [target]), true);
        assert.equal(unit.x, 109);
        assert.equal(unit.kamikazeUltCooldown, 599);
        unit.paralyzed = true;
        battle.tickBotKamikaze(unit);
        assert.equal(unit.kamikazeUltActive, false);
        assert.equal(unit.kamikazeInvincible, false);
        unit.paralyzed = false;
        assert.equal(battle.handleBotKamikazeMovement(unit, [target]), true);
        assert.equal(retreatSpeed, 0.65);
        unit.kamikazeRecoveryTimer = 0;
        assert.equal(battle.handleBotKamikazeMovement(unit, [target]), false);
    }
});

test('restarting battle clears Kamikaze dash, protection and recovery', () => {
    const battle = makeBattle();
    const start = main.indexOf('function resetTankMatchUltState(unit)');
    const end = main.indexOf('// Apply saved tank type properties', start);
    vm.runInContext(main.slice(start, end), battle);
    battle.startKamikazeDash(battle.tank);
    battle.finishKamikazeDash(battle.tank, false);
    battle.resetTankBattleEffects(battle.tank);
    battle.resetTankMatchUltState(battle.tank);
    assert.equal(battle.tank.kamikazeUltActive, false);
    assert.equal(battle.tank.kamikazeInvincible, false);
    assert.equal(battle.tank.kamikazeRecoveryTimer, 0);
    assert.equal(battle.tank.kamikazeUltCooldown, 0);
    assert.equal(battle.tank._kamikazeTrailThisTick, false);
});

test('wooden walls burn for five seconds normally and twenty percent less in rain', () => {
    for (const biome of ['forest', 'snow', 'desert', 'swamp', 'night', 'lava', 'rain']) {
        const battle = makeBattle();
        battle.GameTerrain.current = () => biome;
        const wall = { type: 'woodenWall', x: 100, y: 100, w: 100, h: 30, hp: 1000 };
        const ticks = biome === 'rain' ? 240 : 300;
        battle.igniteWoodenWall(wall, 300, 20, 110, 115);
        assert.equal(wall.burnTimer, ticks, biome);
        assert.equal(wall.woodBurnOrigin.x, 0.1);
        for (let i = 0; i < ticks - 1; i++) battle.updateWoodenWallBurn(wall);
        assert.equal(wall.burning, true, biome);
        battle.updateWoodenWallBurn(wall);
        assert.equal(wall.burning, false, biome);
        assert.equal(wall.burnTimer, 0, biome);
        assert.ok(Math.abs(wall.hp - (1000 - ticks * 20 / 60)) < 1e-8, biome);
        assert.ok(wall.woodCharAmount > 0.5, biome);
        const hp = wall.hp;
        battle.updateWoodenWallBurn(wall);
        assert.equal(wall.hp, hp, biome);
    }
});

test('pyro shots, flame streams and helper ignition all respect rainy wood burn duration', () => {
    for (const source of ['pyro', 'flame', 'helper']) {
        const battle = makeBattle();
        battle.GameTerrain.current = () => 'rain';
        const wall = { type: 'woodenWall', x: 100, y: 100, w: 100, h: 30, hp: 1000 };
        battle.objects.push(wall);
        if (source === 'pyro') {
            battle.bullets.push(bullet(0, 'pyroBullet', 70));
            battle.runBulletTick();
        } else if (source === 'flame') {
            const start = physics.indexOf('    for (let i = flames.length - 1; i >= 0; i--)');
            const end = physics.indexOf('    // Advance each barrage once', start);
            assert.ok(start >= 0 && end > start);
            vm.runInContext(`function runFlameTick() { ${physics.slice(start, end)} }`, battle);
            battle.flames.push({ x: 110, y: 110, vx: 0, vy: 0, life: 10, damage: 0.75, team: 0 });
            battle.runFlameTick();
        } else {
            battle.damageWoodenWall(wall, 5, { ignite: true });
        }
        assert.equal(wall.burnTimer, 240, source);
        for (let i = 0; i < 30; i++) battle.updateWoodenWallBurn(wall);
        battle.igniteWoodenWall(wall);
        assert.equal(wall.burnTimer, 240, source);
        assert.equal(wall.woodBurnAge, 30, source);
        assert.equal(wall.burnDps, 20, source);
    }
});

test('shield mech damages stone once per shot and breaks it on the sixth hit for every team', () => {
    for (const owner of ['player', 'ally', 'enemy']) {
        const battle = makeBattle();
        battle.window.effectsEnabled = true;
        const wall = { type: 'wall', x: 100, y: 100, w: 50, h: 50 };
        battle.objects.push(wall);
        for (let hit = 1; hit <= 6; hit++) {
            const shot = bullet(owner === 'enemy' ? 1 : 0, 'mechShield', 120);
            shot.owner = owner;
            battle.bullets.push(shot);
            battle.runBulletTick();
            assert.equal(wall.wallDamageCount, hit, owner);
            assert.equal(wall.wallHitPoints.length, hit, owner);
            assert.equal(battle.objects.includes(wall), hit < 6, owner);
            assert.equal(battle.bullets.length, 0, owner);
            battle.runBulletTick();
            assert.equal(wall.wallDamageCount, hit, 'the same shot cannot count again');
        }
        assert.equal(battle.navNeedsRebuild, true);
        const rubble = battle.objects.filter(obj => obj.type === 'terrainDebris');
        assert.equal(rubble.length, 6);
        assert.ok(rubble.every(obj => obj.material === 'stone'));
        assert.ok(rubble[5].fragments.length > rubble[0].fragments.length);
    }
});

test('wood breaks into splinters from a shield shot, standard damage and fire without duplicate debris', () => {
    for (const attack of ['shield', 'normal', 'fire']) {
        const battle = makeBattle();
        battle.window.effectsEnabled = true;
        const wall = { type: 'woodenWall', x: 100, y: 100, w: 80, h: 30, hp: 300 };
        battle.objects.push(wall);
        if (attack === 'shield') {
            battle.bullets.push(bullet(0, 'mechShield', 1));
            battle.runBulletTick();
        } else if (attack === 'normal') {
            battle.bullets.push(bullet(0, 'normal', 300));
            battle.runBulletTick();
        } else {
            wall.hp = 0;
            wall.burning = true;
            battle.destroyWoodenWall(wall);
        }
        assert.equal(battle.objects.includes(wall), false, attack);
        const debris = battle.objects.find(obj => obj.type === 'terrainDebris');
        assert.ok(debris, attack);
        assert.equal(debris.material, 'wood');
        assert.equal(debris.charred, attack === 'fire');
        assert.ok(debris.fragments.length <= 16);
        assert.equal(battle.isBlockingTerrainObject(debris), false);
        const count = battle.objects.length;
        assert.equal(battle.destroyWoodenWall(wall), false);
        assert.equal(battle.objects.length, count);
    }
});

test('wall debris and oil marks expire through the shared physics cleanup', () => {
    const battle = makeBattle();
    battle.window.effectsEnabled = true;
    battle.spawnTerrainDebris({ type: 'woodenWall', x: 0, y: 0, w: 50, h: 50 }, { destroyed: true });
    battle.objects.push({ type: 'tankOilTrail', life: 2100 });
    const start = physics.indexOf("        } else if (obj.type === 'explosion' || obj.type === 'terrainDebris' || obj.type === 'tankOilTrail') {");
    const end = physics.indexOf("        } else if (obj.type === 'shockwave') {", start);
    assert.ok(start >= 0 && end > start);
    vm.runInContext(`function tickDebris() { for (let i = objects.length - 1; i >= 0; i--) { const obj = objects[i]; if (false) { ${physics.slice(start, end)} } } }`, battle);
    for (let i = 0; i < 44; i++) battle.tickDebris();
    assert.equal(battle.objects.length, 1);
    assert.equal(battle.objects[0].type, 'tankOilTrail');
    for (let i = 44; i < 2099; i++) battle.tickDebris();
    assert.equal(battle.objects.length, 1);
    battle.tickDebris();
    assert.equal(battle.objects.length, 0);
});

test('wood chip effects are throttled while fractional projectile damage stays exact', () => {
    const battle = makeBattle();
    battle.window.effectsEnabled = true;
    const wall = { type: 'woodenWall', x: 100, y: 100, w: 80, h: 30, hp: 300 };
    battle.objects.push(wall);
    for (let frame = 0; frame < 12; frame++) {
        battle.window.frameCount = frame;
        battle.bullets.push(bullet(0, 'normal', 0.5));
        battle.runBulletTick();
    }
    assert.equal(wall.hp, 294);
    assert.equal(battle.objects.filter(obj => obj.type === 'terrainDebris').length, 2);
});

test('Buratino fires a mobile barrage that damages enemies once after the warning', () => {
    const battle = makeBattle();
    Object.assign(battle.tank, { x: 100, y: 100, turretAngle: 0, fireCooldown: 0, artilleryMode: false });
    battle.tankType = 'buratino';
    const enemy = { x: 320, y: 100, w: 38, h: 38, hp: 2000, team: 1, alive: true };
    const ally = { ...enemy, team: 0 };
    battle.enemies.push(enemy);
    battle.allies.push(ally);
    battle.shoot();
    const barrage = battle.objects.find(obj => obj.buratinoBarrage);
    assert.ok(barrage);
    assert.equal(battle.tank.artilleryMode, false);
    assert.equal(battle.tank.fireCooldown, battle.getTankShotCooldown('buratino'));
    assert.equal(battle.objects.filter(obj => obj.barrageVisual).length, 13);
    assert.equal(barrage.warningTicks, 100);
    assert.equal(barrage.impacts[0].length, 13);
    assert.equal(barrage.impacts[0].filter(point => Math.hypot(point.x - barrage.x, point.y - barrage.y) > barrage.radius * 0.7).length, 8);
    for (let i = 0; i < 99; i++) battle.updateBuratinoBarrage(barrage);
    assert.equal(enemy.hp, 2000);
    battle.updateBuratinoBarrage(barrage);
    assert.equal(enemy.hp, 1700);
    assert.equal(ally.hp, 2000);
    for (let i = 0; i < 15; i++) battle.updateBuratinoBarrage(barrage);
    assert.equal(enemy.hp, 1700);
    assert.equal(battle.objects.includes(barrage), false);
});

test('Buratino ultimate damages hostile units in three separate waves', () => {
    const battle = makeBattle();
    const attacker = { x: 100, y: 100, w: 38, h: 38, turretAngle: 0, team: 1, alive: true };
    Object.assign(battle.tank, { x: 400, y: 100, hp: 2000 });
    const friendly = { x: 400, y: 100, w: 38, h: 38, hp: 2000, team: 1, alive: true };
    battle.enemies.push(friendly);
    const barrage = battle.createBuratinoBarrage(attacker, true);
    assert.equal(battle.objects.filter(obj => obj.barrageVisual).length, 39);
    const rockets = battle.objects.filter(obj => obj.barrageVisual);
    for (let wave = 0; wave < 3; wave++) {
        for (const rocket of rockets.slice(wave * 13, (wave + 1) * 13)) {
            assert.equal(rocket.life + rocket.delay, 100 * (wave + 1));
        }
    }
    for (let wave = 0; wave < 3; wave++) {
        for (let i = 0; i < 99; i++) battle.updateBuratinoBarrage(barrage);
        assert.equal(battle.tank.hp, 2000 - wave * 300);
        battle.updateBuratinoBarrage(barrage);
        assert.equal(battle.tank.hp, 2000 - (wave + 1) * 300);
        assert.equal(friendly.hp, 2000);
    }
    for (let i = 0; i < 15; i++) battle.updateBuratinoBarrage(barrage);
    assert.equal(battle.objects.includes(barrage), false);
});

test('Buratino barrage resolves once when explosions remove nearby cover', () => {
    const battle = makeBattle();
    Object.assign(battle.tank, { x: 100, y: 100, turretAngle: 0, fireCooldown: 0 });
    battle.tankType = 'buratino';
    const enemy = { x: 320, y: 100, w: 38, h: 38, hp: 2000, team: 1, alive: true };
    battle.enemies.push(enemy);
    battle.objects.push({ type: 'box', x: 320, y: 100, w: 20, h: 20 });
    const start = physics.indexOf('    // Advance each barrage once before explosions can change the objects array.');
    const end = physics.indexOf('    for (const unit of [tank, ...allies, ...enemies])', start);
    assert.ok(start >= 0 && end > start);
    vm.runInContext(`function runBarrageObjects() { ${physics.slice(start, end)} }`, battle);
    battle.shoot();
    for (let i = 0; i < 115; i++) battle.runBarrageObjects();
    assert.equal(enemy.hp, 1700);
    assert.equal(battle.objects.some(obj => obj.type === 'box'), false);
    assert.equal(battle.objects.some(obj => obj.buratinoBarrage || obj.barrageVisual), false);
});

test('ice projectiles slow hostile player, ally, and enemy tanks without freezing them', () => {
    for (const targetKind of ['player', 'ally', 'enemy']) {
        const battle = makeBattle();
        const target = targetKind === 'player'
            ? battle.tank
            : { x: 100, y: 100, w: 38, h: 38, hp: 300, team: targetKind === 'ally' ? 0 : 1, alive: true, tankType: 'normal' };
        target.x = 100;
        target.y = 100;
        if (targetKind === 'ally') battle.allies.push(target);
        if (targetKind === 'enemy') battle.enemies.push(target);
        battle.bullets.push(bullet(targetKind === 'enemy' ? 0 : 1, 'ice', 20));
        battle.runBulletTick();
        assert.equal(target.iceSlowed, true, targetKind);
        assert.equal(target.iceSlowedTime, 240, targetKind);
        assert.equal(target.paralyzed, undefined, targetKind);
        assert.equal(target.frozenEffect, undefined, targetKind);
    }
});

test('ice ultimate immediately freezes targets in range before they can escape', () => {
    const battle = makeBattle();
    const enemy = { x: 100, y: 100, w: 38, h: 38, hp: 300, team: 1, alive: true, tankType: 'normal' };
    const friendly = { ...enemy, team: 0 };
    const iceTank = { ...enemy, tankType: 'ice' };
    const distant = { ...enemy, x: 600, y: 600 };
    battle.enemies.push(enemy, friendly, iceTank, distant);
    battle.createIceNova(120, 120, 80, 0);
    assert.equal(enemy.paralyzedTime, 240);
    assert.equal(enemy.frozenEffect, 240);
    assert.equal(friendly.paralyzed, undefined);
    assert.equal(iceTank.paralyzed, undefined);
    assert.equal(distant.paralyzed, undefined);
});

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
    assert.equal(wall.hp, 300);
    assert.equal(wall.woodPoisonTimer, 180);
    for (let tick = 0; tick < 60; tick++) battle.updateWoodenWallRot(wall);
    assert.ok(Math.abs(wall.hp - 256) < 1e-8);
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
    assert.equal(gasWall.hp, 300);
    for (let tick = 0; tick < 60; tick++) battle.updateWoodenWallRot(gasWall);
    assert.ok(Math.abs(gasWall.hp - 256) < 1e-8);
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


test('gas rots wooden cover over time without burst damage, stacking or mechanical splinters', () => {
    const battle = makeBattle();
    battle.window.effectsEnabled = true;
    const wall = { type: 'woodenWall', x: 100, y: 100, w: 80, h: 40, hp: 300, maxHp: 300 };
    const farWall = { type: 'woodenWall', x: 900, y: 900, w: 40, h: 40, hp: 300 };
    battle.objects.push(wall, farWall);
    battle.explodeGas({ x: 105, y: 115, owner: 'player', team: 0 });
    assert.equal(wall.hp, 300);
    const cloud = battle.objects.find(obj => obj.type === 'gas');
    for (let tick = 0; tick < 60; tick++) {
        battle.poisonWoodInGas(cloud);
        battle.poisonWoodInGas(cloud);
        battle.updateWoodenWallRot(wall);
    }
    assert.ok(Math.abs(wall.hp - 256) < 1e-8, 'overlapping poison must tick once, at 44 HP per second');
    assert.equal(farWall.woodPoisonTimer, undefined);
    assert.ok(wall.woodRotAmount > 0.14);
    assert.equal(wall.woodHitPoints, undefined);
    assert.equal(battle.objects.some(obj => obj.type === 'terrainDebris'), false);
    for (let tick = 0; tick < 180; tick++) battle.updateWoodenWallRot(wall);
    const hpAfterPoison = wall.hp;
    battle.updateWoodenWallRot(wall);
    assert.equal(wall.hp, hpAfterPoison, 'decay stops when the remaining poison expires');
    assert.ok(wall.woodRotAmount > 0, 'the rotten surface persists after damage stops');
    while (wall.hp > 0) {
        battle.poisonWoodenWall(wall, wall.x, wall.y + 15);
        battle.updateWoodenWallRot(wall);
    }
    assert.equal(battle.objects.includes(wall), false);
    const decay = battle.objects.find(obj => obj.type === 'woodDecay');
    assert.ok(decay);
    assert.equal(battle.isBlockingTerrainObject(decay), false);
    assert.equal(battle.objects.some(obj => obj.type === 'terrainDebris'), false);
});

test('ice on wood grows and cracks before revealing a chip, then expires without generic splinters', () => {
    const battle = makeBattle();
    battle.window.effectsEnabled = true;
    const wall = { type: 'woodenWall', x: 100, y: 100, w: 80, h: 40, hp: 300 };
    battle.objects.push(wall);
    battle.bullets.push({ ...bullet(0, 'ice', 100), x: 102, y: 120, vx: 2 });
    battle.runBulletTick();
    assert.equal(wall.hp, 200);
    const impact = battle.objects.find(obj => obj.type === 'woodIceImpact');
    assert.ok(impact);
    assert.equal(impact.mark.active, false);
    assert.equal(battle.objects.some(obj => obj.type === 'terrainDebris'), false);
    for (let i = 0; i < 25; i++) assert.equal(battle.updateWoodIceImpact(impact), true);
    assert.equal(impact.mark.active, false);
    battle.updateWoodIceImpact(impact);
    assert.equal(impact.mark.active, true);
    for (let i = 26; i < 58; i++) battle.updateWoodIceImpact(impact);
    assert.equal(impact.life, 0);
    assert.equal(wall.hp, 200, 'ice animation must not deal damage again');
});

test('historical projectiles lodge at the entry surface with original dimensions and stop flying', () => {
    const dimensions = { romanBlade: [14, 14], egyptArrow: [10, 4], spartanSpear: [5, 5] };
    for (const [type, [w, h]] of Object.entries(dimensions)) {
        for (const targetKind of ['wood', 'player', 'ally', 'enemy']) {
            const battle = makeBattle();
            const target = { x: 100, y: 100, w: 50, h: 40, hp: 300, alive: true, team: targetKind === 'enemy' ? 1 : 0, tankType: 'normal' };
            if (targetKind === 'wood') { target.type = 'woodenWall'; battle.objects.push(target); }
            else if (targetKind === 'player') battle.tank = target;
            else battle[targetKind === 'ally' ? 'allies' : 'enemies'].push(target);
            const projectile = { ...bullet(targetKind === 'player' || targetKind === 'ally' ? 1 : 0, type, 80),
                x: 99, y: 120, vx: 3, vy: 0, w, h, bounces: 0, maxBounces: 1 };
            battle.bullets.push(projectile);
            battle.runBulletTick();
            assert.equal(target.hp, 220, type + ' vs ' + targetKind);
            assert.equal(battle.bullets.length, 0, 'an embedded weapon must stop flying');
            assert.equal(target.embeddedProjectiles.length, 1);
            const mark = target.embeddedProjectiles[0];
            assert.equal(mark.w, w); assert.equal(mark.h, h); assert.equal(mark.type, type);
            assert.equal(mark.angle, 0);
            assert.ok(mark.x <= -target.w / 2 + 10, 'entry should be at the outer surface, including chipped edges');
            assert.equal(battle.addEmbeddedProjectile(target, projectile), false, 'the same projectile cannot leave duplicate copies');
            for (let tick = 0; tick < 59; tick++) battle.updateEmbeddedProjectiles(target);
            assert.equal(target.embeddedProjectiles.length, 1);
            battle.updateEmbeddedProjectiles(target);
            assert.equal(target.embeddedProjectiles.length, targetKind === 'wood' ? 1 : 0);
            if (targetKind === 'wood') {
                for (let tick = 0; tick < 3600; tick++) battle.updateEmbeddedProjectiles(target);
                assert.equal(target.embeddedProjectiles.length, 1, 'wood retains its lodged weapon for the wall lifetime');
                battle.destroyWoodenWall(target);
                assert.equal(target.embeddedProjectiles.length, 0);
            }
        }
    }
});

test('projectile entry points follow the incoming direction on every side', () => {
    const battle = makeBattle();
    const target = { x: 100, y: 100, w: 50, h: 40 };
    for (const [x, y, vx, vy, expectedX, expectedY] of [
        [102, 120, 4, 0, -25, 0], [148, 120, -4, 0, 25, 0],
        [125, 102, 0, 4, 0, -20], [125, 138, 0, -4, 0, 20]
    ]) {
        const entry = battle.projectileSurfaceEntry(target, { x, y, vx, vy });
        assert.ok(Math.abs(entry.x - expectedX) < 1e-8);
        assert.ok(Math.abs(entry.y - expectedY) < 1e-8);
    }
});


test('wood retains every lodged weapon even when more than eight have accumulated', () => {
    const battle = makeBattle();
    const wall = { type: 'woodenWall', x: 100, y: 100, w: 80, h: 40, hp: 10000 };
    battle.objects.push(wall);
    for (let i = 0; i < 12; i++) {
        battle.addEmbeddedProjectile(wall, { type: 'egyptArrow', x: 102, y: 102 + i * 3, vx: 4, vy: 0, w: 10, h: 4 });
    }
    for (let tick = 0; tick < 600; tick++) battle.updateEmbeddedProjectiles(wall);
    assert.equal(wall.embeddedProjectiles.length, 12);
    battle.destroyWoodenWall(wall);
    assert.equal(wall.embeddedProjectiles.length, 0);
});


test('toxic wave launches a forward fan once per battle and becomes available after restart', () => {
    const battle = makeBattle();
    battle.tankType = 'toxic';
    battle.tank.turretAngle = Math.PI / 2;
    battle.keys = { KeyE: true };
    const start = main.indexOf('        // Toxic wave replaces');
    const end = main.indexOf('        // Plasma blast ability', start);
    vm.runInContext(`function pressToxicUlt() { ${main.slice(start, end)} }`, battle);
    battle.pressToxicUlt();
    assert.equal(battle.keys.KeyE, false);
    assert.equal(battle.tank.megaGasUsed, true);
    assert.equal(battle.bullets.length, 5);
    const angles = battle.bullets.map(shot => Math.atan2(shot.vy, shot.vx));
    assert.ok(angles.every(angle => angle > 0 && angle < Math.PI), 'every node must travel in front of the turret');
    assert.ok(Math.abs(angles[0] + angles[4] - Math.PI) < 1e-9);
    assert.ok(battle.bullets.every(shot => shot.toxicWave && shot.type === 'toxic' && shot.team === 0));
    battle.keys.KeyE = true;
    battle.pressToxicUlt();
    assert.equal(battle.bullets.length, 5);
    const resetStart = main.indexOf('function resetTankMatchUltState(unit)');
    const resetEnd = main.indexOf('// Apply saved tank type properties', resetStart);
    vm.runInContext(main.slice(resetStart, resetEnd), battle);
    battle.resetTankMatchUltState(battle.tank);
    assert.equal(battle.activateToxicWave(battle.tank), true);
    assert.equal(battle.bullets.length, 10);
    for (const state of [{ paralyzed: true }, { frozenEffect: 10 }, { alive: false }, { hp: 0 }]) {
        const unit = { x: 0, y: 0, w: 38, h: 38, hp: 300, alive: true, tankType: 'toxic', ...state };
        assert.equal(battle.activateToxicWave(unit, 'enemy'), false);
        assert.ok(!unit.megaGasUsed);
    }
    assert.equal(battle.activateToxicWave({ ...battle.tank, megaGasUsed: false, tankType: 'roman' }), false);
});

test('enemy and allied toxic AI trigger the shared wave with the correct team', () => {
    for (const owner of ['enemy', 'ally']) {
        const battle = makeBattle();
        battle.Math = Object.assign(Object.create(Math), { random: () => 0 });
        const unit = { x: 100, y: 100, w: 38, h: 38, hp: 300, alive: true, tankType: 'toxic', team: owner === 'enemy' ? 1 : 0, turretAngle: 0 };
        let start, end;
        if (owner === 'enemy') {
            battle.enemy = unit; battle.distToNearest = 220;
            start = bot.indexOf('            // Toxic uses the same wave');
            end = bot.indexOf('            // Plasma: fire', start);
        } else {
            battle.ally = unit; battle.nd = 220;
            start = bot.indexOf("        if (ally.tankType === 'toxic' && !ally.megaGasUsed");
            end = bot.indexOf("        if (ally.tankType === 'buratino'", start);
        }
        vm.runInContext(bot.slice(start, end), battle);
        assert.equal(battle.bullets.length, 5);
        assert.ok(battle.bullets.every(shot => shot.owner === owner && shot.team === unit.team));
        vm.runInContext(bot.slice(start, end), battle);
        assert.equal(battle.bullets.length, 5);
    }
});

test('toxic wave does no contact damage and overlapping clouds apply poison once per tick', () => {
    for (const owner of ['player', 'enemy']) {
        const battle = makeBattle();
        const team = owner === 'enemy' ? 1 : 0;
        const source = owner === 'player' ? battle.tank : { ...battle.tank, tankType: 'toxic', team, turretAngle: 0 };
        if (owner === 'player') battle.tankType = 'toxic';
        const victim = owner === 'player' ? { x: 715, y: 509, w: 20, h: 20, hp: 150, team: 1, alive: true } : battle.tank;
        if (owner === 'enemy') Object.assign(victim, { x: 715, y: 509, w: 20, h: 20, hp: 150 });
        else battle.enemies.push(victim);
        const friend = { x: 715, y: 509, w: 20, h: 20, hp: 150, team, alive: true };
        battle.allies.push(friend);
        const drone = { x: 715, y: 509, w: 20, h: 20, hp: 150, team: 1 - team, alive: true };
        battle.enemyDrones.push(drone);
        battle.activateToxicWave(source, owner);
        for (let tick = 0; tick < 40; tick++) battle.runBulletTick();
        assert.equal(battle.bullets.length, 0);
        assert.equal(victim.hp, 150, 'only clouds may damage a target');
        const clouds = battle.objects.filter(obj => obj.type === 'gas');
        assert.equal(clouds.length, 5);
        assert.equal(battle.objects.some(obj => obj.type === 'explosion'), false, 'the wave must not spawn five explosion flashes');
        for (const cloud of clouds) for (let tick = 0; tick < 22; tick++) battle.updatePoisonCloud(cloud);
        assert.ok(clouds.filter(cloud => Math.hypot(cloud.x - 725, cloud.y - 519) < cloud.radius).length >= 2);
        const start = physics.indexOf('    // Apply gas effects: check entities entering gas clouds');
        const end = physics.indexOf('    // Respawn timers (War mode)', start);
        vm.runInContext(`function tickPoison() { ${physics.slice(start, end)} }`, battle);
        const wood = { type: 'woodenWall', x: 715, y: 509, w: 20, h: 20, hp: 1000, maxHp: 1000 };
        battle.objects.push(wood);
        for (let tick = 0; tick < 60; tick++) {
            for (const cloud of clouds) { battle.updatePoisonCloud(cloud); battle.poisonWoodInGas(cloud); }
            battle.updateWoodenWallRot(wood);
            battle.tickPoison();
        }
        assert.ok(Math.abs(victim.hp - 106) < 1e-8, owner + ' poison must remain 44 HP/sec');
        assert.ok(Math.abs(drone.hp - 106) < 1e-8);
        assert.equal(friend.hp, 150);
        assert.ok(Math.abs(wood.hp - 956) < 1e-8);
    }
});

test('wave nodes open on cover and their clouds expand, disperse and expire', () => {
    const battle = makeBattle();
    battle.tankType = 'toxic';
    battle.activateToxicWave(battle.tank);
    battle.objects.push({ type: 'wall', x: 550, y: 400, w: 30, h: 240 });
    for (let tick = 0; tick < 20; tick++) battle.runBulletTick();
    assert.equal(battle.bullets.length, 0);
    const clouds = battle.objects.filter(obj => obj.type === 'gas');
    assert.equal(clouds.length, 5);
    assert.ok(clouds.every(cloud => cloud.x < 580));
    const cloud = clouds[0];
    assert.equal(cloud.radius, 28);
    for (let tick = 0; tick < 22; tick++) battle.updatePoisonCloud(cloud);
    assert.equal(cloud.radius, 105);
    while (cloud.life > 90) battle.updatePoisonCloud(cloud);
    const full = cloud.radius;
    while (cloud.life > 30) battle.updatePoisonCloud(cloud);
    assert.ok(cloud.radius < full * 0.4);
    while (cloud.life > 1) battle.updatePoisonCloud(cloud);
    assert.equal(battle.updatePoisonCloud(cloud), false);
    assert.equal(cloud.radius, 0);
});


test('Kamikaze charges and mech rockets detonate barrels on impact for all owners', () => {
    for (const type of ['kamikazeBullet', 'mechRocketBullet']) for (const owner of ['player', 'ally', 'enemy']) {
        const battle = makeBattle();
        const styles = [];
        battle.spawnExplosion = (_x, _y, _r, style) => styles.push(style);
        const root = { type: 'barrel', x: 100, y: 100, w: 60, h: 60 };
        const neighbor = { type: 'barrel', x: 240, y: 100, w: 60, h: 60 };
        const safe = { type: 'barrel', x: 450, y: 100, w: 60, h: 60 };
        battle.objects.push(root, neighbor, safe);
        battle.bullets.push({ ...bullet(owner === 'enemy' ? 1 : 0, type, 150), owner,
            x: 96, y: 130, vx: 1, vy: 0, w: 12, h: 8, explodeRadius: 50 });
        battle.runBulletTick();
        assert.equal(battle.objects.includes(root), false, type + ' ' + owner);
        assert.equal(battle.objects.includes(neighbor), true);
        assert.equal(neighbor.barrelFuseTicks, 15);
        assert.equal(styles.filter(style => style === 'barrel').length, 1);
        for (let tick = 0; tick < 14; tick++) battle.updateBarrelFuses();
        assert.equal(battle.objects.includes(neighbor), true);
        battle.updateBarrelFuses();
        assert.equal(battle.objects.includes(neighbor), false);
        assert.equal(battle.objects.includes(safe), true);
        assert.equal(styles.filter(style => style === 'barrel').length, 2, 'each barrel must show its own blast');
        assert.equal(battle.bullets.length, 0);
    }
});

test('a chain reaction cannot skip or damage the wrong neighboring cover through shifted array indices', () => {
    const battle = makeBattle();
    const barrel = { type: 'barrel', x: 100, y: 100, w: 60, h: 60 };
    const neighbor = { type: 'barrel', x: 220, y: 100, w: 60, h: 60 };
    const wood = { type: 'woodenWall', x: 90, y: 90, w: 60, h: 60, hp: 300 };
    const box = { type: 'box', x: 110, y: 110, w: 40, h: 40 };
    const safeBox = { type: 'box', x: 400, y: 400, w: 40, h: 40 };
    battle.objects.push(wood, barrel, box, neighbor, safeBox);
    battle.applyDamage(110, 110, 55, 100, 0);
    assert.equal(wood.hp, 200, 'wood must take one original impact rather than repeated or skipped damage');
    assert.equal(battle.objects.includes(barrel), false);
    assert.equal(battle.objects.includes(neighbor), true);
    assert.equal(neighbor.barrelFuseTicks, 15);
    for (let tick = 0; tick < 15; tick++) battle.updateBarrelFuses();
    assert.equal(battle.objects.includes(neighbor), false);
    assert.equal(battle.objects.includes(box), false);
    assert.equal(battle.objects.includes(safeBox), true);
});


test('a direct shot detonates an already burning barrel immediately', () => {
    for (const type of ['normal', 'kamikazeBullet', 'mechRocketBullet', 'rocket']) {
        const battle = makeBattle();
        const root = { type: 'barrel', x: 100, y: 100, w: 50, h: 50 };
        const pending = { type: 'barrel', x: 220, y: 100, w: 50, h: 50 };
        battle.objects.push(root, pending);
        battle.explodeBarrel(root);
        assert.equal(pending.barrelFuseTicks, 15);
        battle.bullets.push({ ...bullet(0, type, 150), x: 216, y: 125, vx: 1, vy: 0, w: 12, h: 8, explodeRadius: 50 });
        battle.runBulletTick();
        assert.equal(battle.objects.includes(pending), false, type);
    }
});
