const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const read = name => fs.readFileSync(path.join(__dirname, '..', 'src', name), 'utf8');
const physics = read('physics.js'), main = read('main.js'), bot = read('bot.js');

function battle(owner = 'player') {
    const context = vm.createContext({ window: { effectsEnabled: false }, objects: [], bullets: [], flames: [], particles: [],
        allies: [], enemies: [], playerDrones: [], enemyDrones: [], illusions: [], soundWaves: [],
        tankType: owner === 'player' ? 'roman' : 'normal', tank: { x: 400, y: 400, w: 38, h: 38, hp: 300, maxHp: 300, alive: true, team: 0, turretAngle: 0 },
        worldWidth: 1600, worldHeight: 1200, currentMode: 'single', gameState: 'playing', navNeedsRebuild: false,
        GameTerrain: { speedFactor: () => 1, canSee: () => true, current: () => 'forest' }, FIRE_COOLDOWN: 30 });
    vm.runInContext(physics, context);
    context.Math = Object.assign(Object.create(Math), { random: () => 0.5 });
    context.spawnExplosion = () => {};
    context.spawnParticle = () => {};
    let source = context.tank;
    if (owner !== 'player') {
        context.tank.x = 1000;
        source = { x: 400, y: 400, w: 38, h: 38, hp: 300, alive: true, team: owner === 'enemy' ? 1 : 0, tankType: 'roman', turretAngle: 0 };
        context[owner === 'enemy' ? 'enemies' : 'allies'].push(source);
    }
    context.source = source;
    const bulletStart = physics.indexOf('    for (let i = bullets.length - 1;', physics.indexOf('function updatePhysics()'));
    const bulletEnd = physics.indexOf('    for (let i = soundWaves.length', bulletStart);
    const end = physics.lastIndexOf('    //', bulletEnd);
    assert.ok(bulletStart > 0 && end > bulletStart);
    vm.runInContext(`function tickBullets() { const terrainIndex = null; ${physics.slice(bulletStart, end)} }`, context);
    return context;
}
function summons(b) { return [...b.playerDrones, ...b.enemyDrones].filter(unit => unit.romanSummon); }
function wait(b, ticks) { for (let i = 0; i < ticks; i++) b.updateRomanLegion(); }

test('a Roman banner calls exactly three friendly legionaries after three seconds for every owner', () => {
    for (const owner of ['player', 'ally', 'enemy']) {
        const b = battle(owner);
        assert.equal(b.castRomanBanner(b.source, owner), true);
        assert.equal(b.source.romanShieldActive, false);
        assert.equal(b.source.romanLegionCooldown, 1200);
        const banner = b.source.romanBanner;
        assert.equal(banner.hp, 100);
        assert.equal(summons(b).length, 1);
        wait(b, 179);
        assert.equal(summons(b).length, 1);
        wait(b, 1);
        const legionaries = summons(b).filter(unit => unit.romanSummon === 'legionary');
        assert.equal(legionaries.length, 3);
        assert.ok(legionaries.every(unit => unit.team === b.source.team && unit.owner === owner));
        for (const unit of legionaries) {
            assert.equal(unit.w, 24); assert.equal(unit.h, 30); assert.equal(unit.hp, 120);
            assert.equal(b.canPlaceRomanUnit(unit, unit.x, unit.y, b.romanPlacementContext()), true);
        }
        wait(b, 120);
        assert.equal(summons(b).filter(unit => unit.romanSummon === 'legionary').length, 3);
        assert.equal(b.castRomanBanner(b.source, owner), false);
    }
});

test('the banner ignores hostile projectiles and still calls reinforcements', () => {
    const b = battle();
    let explosions = 0; b.spawnExplosion = () => explosions++;
    b.castRomanBanner(b.source);
    const banner = b.source.romanBanner;
    assert.equal(b.hitCombatDroneWithBullet({ type: 'normal', damage: 1000, vx: 7, vy: 0, owner: 'enemy', team: 1 }, banner), false);
    assert.equal(b.dealDamageToEntity(banner, 1000), 0);
    b.bullets.push({ x: banner.x + 3, y: banner.y + 3, w: 6, h: 6, vx: 0, vy: 0, type: 'normal', damage: 1000, team: 1, owner: 'enemy', life: 30 });
    b.tickBullets();
    assert.equal(b.bullets.length, 1);
    assert.equal(banner.hp, 100);
    wait(b, 180);
    assert.equal(summons(b).filter(unit => unit.romanSummon === 'legionary').length, 3);
    assert.equal(explosions, 0);
    assert.ok(b.source.romanLegionCooldown > 0);
});

test('blocked flag placement does not spend the ultimate or create a flag through a wall', () => {
    const b = battle();
    b.objects.push({ type: 'wall', x: 440, y: 300, w: 60, h: 250 });
    assert.equal(b.castRomanBanner(b.source), false);
    assert.equal(b.source.romanLegionCooldown, undefined);
    assert.equal(summons(b).length, 0);
    b.objects.length = 0;
    b.objects.push({ type: 'explosion', x: 480, y: 400, radius: 100, life: 5 });
    assert.equal(b.castRomanBanner(b.source), true, 'visual effects must not block a valid rally point');
});

test('legionaries fight enemy tanks and ignore their own team', () => {
    for (const owner of ['player', 'enemy']) {
        const b = battle(owner);
        b.castRomanBanner(b.source, owner);
        const banner = b.source.romanBanner;
        wait(b, 180);
        const victim = owner === 'enemy' ? b.tank : { x: 0, y: 0, w: 38, h: 38, hp: 600, maxHp: 600, alive: true, team: 1 };
        Object.assign(victim, { x: banner.x + 160, y: banner.y, hp: 600 });
        if (owner === 'player') b.enemies.push(victim);
        const friend = { x: banner.x + 90, y: banner.y + 40, w: 38, h: 38, hp: 300, alive: true, team: b.source.team };
        b.allies.push(friend);
        for (let tick = 0; tick < 180; tick++) { b.updateRomanLegion(); b.tickBullets(); }
        assert.ok(victim.hp < 600, owner + ' legion must land actual hits');
        assert.equal(friend.hp, 300);
        assert.ok(b.bullets.every(shot => shot.team === b.source.team && shot.type === 'romanPilum'));
    }
});

test('legionaries cannot walk or shoot through a stone wall', () => {
    const b = battle();
    b.castRomanBanner(b.source); wait(b, 180);
    const banner = b.source.romanBanner;
    const wall = { type: 'wall', x: banner.x + 100, y: banner.y - 250, w: 30, h: 500 };
    b.objects.push(wall);
    b.enemies.push({ x: wall.x + 70, y: banner.y, w: 38, h: 38, hp: 300, alive: true, team: 1 });
    wait(b, 180);
    assert.equal(b.bullets.length, 0);
    for (const unit of summons(b)) if (unit.romanSummon === 'legionary') {
        assert.equal(b.checkRectCollision(unit, wall), false);
        assert.ok(unit.x + unit.w <= wall.x);
    }
});

test('frontal shields reduce bullets, ice slows and freezes, and burning harms legionaries', () => {
    const b = battle(); b.castRomanBanner(b.source); wait(b, 180);
    const unit = summons(b).find(unit => unit.romanSummon === 'legionary');
    unit.hp = 90;
    unit.bracing = true; unit.turretAngle = 0;
    b.hitCombatDroneWithBullet({ type: 'normal', damage: 40, vx: -7, vy: 0, owner: 'enemy' }, unit);
    assert.equal(unit.hp, 64);
    b.hitCombatDroneWithBullet({ type: 'normal', damage: 40, vx: 7, vy: 0, owner: 'enemy' }, unit);
    assert.equal(unit.hp, 24);
    b.hitCombatDroneWithBullet({ type: 'ice', damage: 1, vx: 7, vy: 0, owner: 'enemy' }, unit);
    assert.equal(unit.iceSlowed, true);
    assert.ok(!unit.paralyzed);
    b.freezeWithIce(unit, 30);
    const x = unit.x, y = unit.y;
    wait(b, 29);
    assert.equal(unit.x, x); assert.equal(unit.y, y);
    assert.equal(unit.frozenEffect, 1);
    unit.burnTimer = 20; unit.burnDps = 10;
    wait(b, 5);
    assert.ok(unit.hp < 23);
});

test('poison and blast do not harm the banner or prevent reinforcements', () => {
    const b = battle(); b.castRomanBanner(b.source);
    const banner = b.source.romanBanner;
    b.objects.push({ type: 'gas', x: banner.x + banner.w / 2, y: banner.y + banner.h / 2, radius: 80, ownerTeam: 1, owner: 'enemy' });
    const start = physics.indexOf('    // Apply gas effects: check entities entering gas clouds');
    const end = physics.indexOf('    // Respawn timers (War mode)', start);
    vm.runInContext(`function tickPoison() { ${physics.slice(start, end)} }`, b);
    b.damageDronesInRadius(banner.x, banner.y, 80, 1000, 1);
    for (let tick = 0; tick < 180; tick++) { b.tickPoison(); b.updateRomanLegion(); }
    assert.equal(banner.alive, true);
    assert.equal(banner.hp, 100);
    assert.equal(summons(b).filter(unit => unit.romanSummon === 'legionary').length, 3);
});

test('reinforcements expire, cooldown recovers and match reset clears the flag reference', () => {
    const b = battle(); b.castRomanBanner(b.source);
    wait(b, 1080);
    assert.equal(summons(b).length, 0);
    assert.equal(b.source.romanLegionCooldown, 120);
    wait(b, 120);
    assert.equal(b.castRomanBanner(b.source), true);
    const start = main.indexOf('function resetTankMatchUltState(unit)');
    const end = main.indexOf('// Apply saved tank type properties', start);
    vm.runInContext(main.slice(start, end), b);
    b.resetTankMatchUltState(b.source);
    assert.equal(b.source.romanLegionCooldown, 0);
    assert.equal(b.source.romanBanner, null);
});

test('enemy and allied Romans activate the shared banner ability', () => {
    for (const owner of ['enemy', 'ally']) {
        const b = battle(owner);
        b.Math = Object.assign(Object.create(Math), { random: () => 0 });
        let start, end;
        if (owner === 'enemy') {
            b.enemy = b.source; b.distToNearest = 250;
            start = bot.indexOf('            // Roman reinforcements use');
            end = bot.indexOf('            // Medical:', start);
        } else {
            b.ally = b.source; b.nd = 250;
            start = bot.indexOf("        if (ally.tankType === 'roman' && nd < 380");
            end = bot.indexOf("        if (ally.tankType === 'ice'", start);
        }
        vm.runInContext(bot.slice(start, end), b);
        assert.equal(summons(b).length, 1);
        assert.equal(summons(b)[0].team, b.source.team);
    }
});


test('the ice ultimate freezes legionaries immediately while fire keeps ticking through the freeze', () => {
    const b = battle(); b.castRomanBanner(b.source); wait(b, 180);
    const unit = summons(b).find(unit => unit.romanSummon === 'legionary');
    b.createIceNova(unit.x + 8, unit.y + 10, 80, 1);
    assert.equal(unit.paralyzed, true);
    assert.equal(unit.frozenEffect, 240);
    unit.burnTimer = 30; unit.burnDps = 10;
    const hp = unit.hp, x = unit.x, y = unit.y;
    wait(b, 10);
    assert.ok(unit.hp < hp);
    assert.equal(unit.x, x); assert.equal(unit.y, y);
});

test('ordinary, explosive and continuous attacks can destroy Roman reinforcements', () => {
    for (const attack of ['bullet', 'blast', 'flame', 'beam']) {
        const b = battle(); b.castRomanBanner(b.source); wait(b, 180);
        const unit = summons(b).find(unit => unit.romanSummon === 'legionary');
        if (attack === 'bullet') {
            b.bullets.push({ x: unit.x + 8, y: unit.y + 10, w: 8, h: 8, vx: 0, vy: 0, type: 'normal', damage: 150, team: 1, owner: 'enemy', life: 30 });
            b.tickBullets();
        } else if (attack === 'blast') b.damageDronesInRadius(unit.x + 8, unit.y + 10, 50, 200, 1);
        else if (attack === 'flame') {
            const start = physics.indexOf('            if (flames.includes(f)) {');
            const end = physics.indexOf('    // Advance each barrage', start);
            const section = physics.slice(start, end);
            const bodyEnd = section.lastIndexOf('        }');
            b.flames.push({ x: unit.x + 8, y: unit.y + 10, damage: 150, team: 1 });
            vm.runInContext(`function flameProbe() { const i=0,f=flames[0]; ${section.slice(0, bodyEnd)} }`, b);
            b.flameProbe();
        } else {
            b.forEachHostileDrone(1, target => { if (target === unit) b.damageCombatDrone(target, 150); });
        }
        assert.equal(unit.alive, false, attack);
        assert.equal(summons(b).includes(unit), false, attack);
    }
});

test('a crowded rally point never spawns legionaries inside newly placed walls', () => {
    const b = battle(); b.castRomanBanner(b.source);
    const banner = b.source.romanBanner;
    b.objects.push({ type: 'wall', x: banner.x - 120, y: banner.y - 120, w: 260, h: 260 });
    wait(b, 260);
    assert.equal(summons(b).filter(unit => unit.romanSummon === 'legionary').length, 0);
    assert.equal(banner.spawnWait, 0);
});


test('legionary sword strike requires a windup and a target still in reach', () => {
    const b = battle(); b.castRomanBanner(b.source); wait(b, 180);
    const unit = summons(b).find(unit => unit.romanSummon === 'legionary');
    const target = { x: unit.x + 34, y: unit.y, w: 38, h: 38, hp: 300, alive: true, team: 1 };
    b.enemies.push(target); unit.turretAngle = 0; unit.fireCooldown = 0;
    b.updateRomanLegionary(unit, b.romanPlacementContext());
    assert.equal(unit.attackType, 'melee'); assert.equal(target.hp, 300);
    for (let i = 0; i < 8; i++) b.updateRomanLegionary(unit, b.romanPlacementContext());
    assert.equal(target.hp, 272);
    unit.fireCooldown = 0; b.updateRomanLegionary(unit, b.romanPlacementContext());
    target.x += 100;
    for (let i = 0; i < 8; i++) b.updateRomanLegionary(unit, b.romanPlacementContext());
    assert.equal(target.hp, 272);
});

test('legionaries escort their own moving commander and form a ring away from the banner', () => {
    for (const owner of ['player', 'ally', 'enemy']) {
        const b = battle(owner); b.castRomanBanner(b.source, owner); wait(b, 180);
        const bannerX = b.source.romanBanner.x;
        b.source.speed = 3.2;
        for (let i = 0; i < 130; i++) { b.source.x += 3.2; b.updateRomanLegion(); }
        wait(b, 120);
        const units = summons(b).filter(unit => unit.romanSummon === 'legionary');
        assert.equal(units.length, 3);
        for (const unit of units) {
            assert.equal(unit.commander, b.source);
            const distance = Math.hypot(unit.x + unit.w / 2 - b.source.x - b.source.w / 2, unit.y + unit.h / 2 - b.source.y - b.source.h / 2);
            assert.ok(distance >= 45 && distance < 100, owner + ': escort must settle around its commander');
            assert.ok(unit.x > bannerX + 200, 'must leave the stationary banner behind');
        }
        for (let i = 0; i < units.length; i++) for (let j = i + 1; j < units.length; j++) {
            assert.ok(Math.hypot(units[i].x - units[j].x, units[i].y - units[j].y) > 65, 'guards must occupy separate sides');
        }
    }
});

test('an escort abandons a distant enemy and returns when the commander moves away', () => {
    const b = battle(); b.castRomanBanner(b.source); wait(b, 180);
    const target = { x: b.source.x + 140, y: b.source.y, w: 38, h: 38, hp: 600, alive: true, team: 1 };
    b.enemies.push(target); wait(b, 45);
    b.source.x += 500;
    wait(b, 180);
    for (const unit of summons(b).filter(unit => unit.romanSummon === 'legionary')) {
        assert.equal(unit.target, null);
        assert.ok(Math.hypot(unit.x - b.source.x, unit.y - b.source.y) < 110);
    }
    assert.ok(!b.bullets.some(shot => shot.team !== b.source.team));
});

test('each placed soldier gets an independent ten-percent centurion roll for every owner', () => {
    for (const owner of ['player', 'ally', 'enemy']) {
        const b = battle(owner);
        const rolls = [0.099999, 0.1, 0.9]; let calls = 0;
        b.Math.random = () => rolls[calls++];
        b.castRomanBanner(b.source, owner); wait(b, 180);
        const units = summons(b).filter(unit => unit.romanSummon === 'legionary');
        assert.equal(calls, 3);
        assert.deepEqual(Array.from(units, unit => unit.isCenturion), [true, false, false, false, false]);
        assert.equal(units[0].hp, units[1].hp * 3); assert.equal(units[0].maxHp, 360);
        assert.equal(units[0].w, 40); assert.equal(units[0].h, 32);
        for (const unit of units) assert.equal(b.canPlaceRomanUnit(unit, unit.x, unit.y, b.romanPlacementContext()), true);
        assert.equal(units[0].maxLife, units[1].maxLife * 2);
        assert.ok(units.every(unit => unit.commander === b.source && unit.team === b.source.team));
    }
});

test('blocked reinforcement placement does not reroll the centurion chance', () => {
    const b = battle(); b.castRomanBanner(b.source);
    const banner = b.source.romanBanner;
    b.objects.push({ type: 'wall', x: banner.x - 120, y: banner.y - 120, w: 260, h: 260 });
    let rolls = 0; b.Math.random = () => { rolls++; return 0; };
    wait(b, 195); assert.equal(rolls, 0);
    b.objects.length = 0; wait(b, 15);
    assert.equal(rolls, 3);
    assert.equal(summons(b).filter(unit => unit.isCenturion).length, 1);
    assert.equal(summons(b).filter(unit => unit.romanSummon === 'legionary').length, 5);
});

test('a mounted centurion keeps its rank while waiting for enough spawn space', () => {
    const b = battle(); b.castRomanBanner(b.source);
    const original = b.findRomanPosition;
    let blocked = true, rolls = 0;
    b.findRomanPosition = (unit, ...args) => unit.isCenturion && blocked ? null : original(unit, ...args);
    b.Math.random = () => rolls++ === 0 ? 0 : 0.5;
    wait(b, 180);
    assert.equal(rolls, 1);
    assert.equal(summons(b).filter(unit => unit.romanSummon === 'legionary').length, 0);
    blocked = false; wait(b, 15);
    const units = summons(b).filter(unit => unit.romanSummon === 'legionary');
    assert.equal(rolls, 3); assert.equal(units.length, 5);
    assert.equal(units[0].isCenturion, true);
    assert.equal(units[0].hp, 360);
    for (const unit of units) assert.equal(b.canPlaceRomanUnit(unit, unit.x, unit.y, b.romanPlacementContext()), true);
});

test('a centurion survives twice as long even after its banner and regular soldiers expire', () => {
    const b = battle(); let rolls = 0;
    b.Math.random = () => rolls++ === 0 ? 0 : 0.5;
    b.castRomanBanner(b.source); wait(b, 180);
    const centurion = summons(b).find(unit => unit.isCenturion);
    wait(b, 900);
    assert.equal(summons(b).length, 1); assert.equal(summons(b)[0], centurion);
    assert.equal(centurion.life, 900); assert.equal(centurion.commander, b.source);
    wait(b, 899); assert.equal(centurion.alive, true);
    wait(b, 1); assert.equal(centurion.alive, false); assert.equal(summons(b).length, 0);
});

test('centurions move twenty-five percent faster and use mounted weapons instead of infantry pilums', () => {
    const distances = [];
    for (const centurion of [false, true]) {
        const b = battle(); b.Math.random = () => centurion ? 0 : 0.5;
        b.castRomanBanner(b.source); wait(b, 180);
        const unit = summons(b).find(unit => unit.romanSummon === 'legionary');
        unit.x = 100; unit.y = 100;
        b.updateRomanLegionary(unit, b.romanPlacementContext());
        distances.push(Math.hypot(unit.x - 100, unit.y - 100));
        unit.x = b.source.x + 70; unit.y = b.source.y;
        unit.turretAngle = 0; unit.fireCooldown = 0; unit.returningToGuard = false;
        const target = { x: unit.x + 100, y: unit.y, w: 38, h: 38, hp: 1000, alive: true, team: 1 };
        b.enemies.push(target);
        b.updateRomanLegionary(unit, b.romanPlacementContext());
        assert.equal(b.bullets.length, centurion ? 0 : 1);
        if (centurion) assert.equal(unit.attackType, 'cavalrySpear');
        else assert.equal(b.bullets[0].damage, 24);
        target.x = unit.x + 34; target.y = unit.y;
        if (centurion) unit.attackType = 'cavalrySword';
        assert.equal(b.romanMeleeStrike(unit, target, b.romanPlacementContext()), true);
        assert.equal(target.hp, 1000 - (centurion ? 42 : 28));
    }
    assert.ok(Math.abs(distances[1] / distances[0] - 1.25) < 0.000001);
});

test('a centurion rolled in the third slot adds exactly two infantry and the five soldiers escort their commander', () => {
    for (const owner of ['player', 'ally', 'enemy']) {
        const b = battle(owner); let rolls = 0;
        b.Math.random = () => ++rolls === 3 ? 0 : 0.5;
        b.castRomanBanner(b.source, owner); wait(b, 180);
        const units = summons(b).filter(unit => unit.romanSummon === 'legionary');
        assert.equal(rolls, 3); assert.equal(units.length, 5);
        assert.equal(units.filter(unit => unit.isCenturion).length, 1);
        assert.equal(units.filter(unit => !unit.isCenturion).length, 4);
        b.source.x += 300; wait(b, 180);
        for (const unit of units) {
            assert.ok(Math.hypot(unit.x + unit.w / 2 - b.source.x - b.source.w / 2, unit.y + unit.h / 2 - b.source.y - b.source.h / 2) < 110);
            assert.equal(b.canPlaceRomanUnit(unit, unit.x, unit.y, b.romanPlacementContext()), true);
        }
        assert.equal(summons(b).filter(unit => unit.romanSummon === 'legionary').length, 5);
    }
});

function mountedDuel(owner = 'player', distance = 110) {
    const b = battle(owner); b.Math.random = () => 0;
    b.castRomanBanner(b.source, owner); wait(b, 180);
    const unit = summons(b).find(unit => unit.isCenturion);
    for (const other of summons(b)) if (other.romanSummon === 'legionary' && other !== unit) b.retireRomanUnit(other);
    unit.x = b.source.x + 55; unit.y = b.source.y + 70; unit.turretAngle = 0; unit.fireCooldown = 0;
    const target = owner === 'enemy' ? b.tank : { w: 38, h: 38, alive: true, team: 1 };
    Object.assign(target, { x: unit.x + distance, y: unit.y - 3, hp: 1000 });
    if (owner !== 'enemy') b.enemies.push(target);
    return { b, unit, target };
}

test('mounted spear approaches during its windup and lands one directional hit for either team', () => {
    for (const owner of ['player', 'ally', 'enemy']) {
        const { b, unit, target } = mountedDuel(owner);
        const startX = unit.x;
        b.updateRomanLegionary(unit, b.romanPlacementContext());
        assert.equal(unit.attackType, 'cavalrySpear');
        assert.equal(target.hp, 1000); assert.equal(b.bullets.length, 0);
        for (let i = 0; i < 16; i++) b.updateRomanLegionary(unit, b.romanPlacementContext());
        assert.ok(unit.x > startX + 35, 'the horse must physically approach the enemy');
        assert.equal(target.hp, 940);
        for (let i = 0; i < 10; i++) b.updateRomanLegionary(unit, b.romanPlacementContext());
        assert.equal(target.hp, 940, 'one spear pass must not damage every frame');
    }
});

test('mounted close combat uses a spatha and respects the sword windup', () => {
    const { b, unit, target } = mountedDuel('player', 42);
    b.updateRomanLegionary(unit, b.romanPlacementContext());
    assert.equal(unit.attackType, 'cavalrySword'); assert.equal(target.hp, 1000);
    for (let i = 0; i < 9; i++) b.updateRomanLegionary(unit, b.romanPlacementContext());
    assert.equal(target.hp, 1000);
    b.updateRomanLegionary(unit, b.romanPlacementContext());
    assert.equal(target.hp, 958);
});

test('a mounted spear can miss, cannot cross cover, and freezing cancels the attack', () => {
    for (const defense of ['dodge', 'wall', 'freeze']) {
        const { b, unit, target } = mountedDuel();
        b.updateRomanLegionary(unit, b.romanPlacementContext());
        if (defense === 'dodge') target.y += 110;
        else if (defense === 'wall') b.objects.push({ type: 'wall', x: unit.x + 45, y: unit.y - 50, w: 25, h: 130 });
        else b.freezeWithIce(unit, 60);
        for (let i = 0; i < 20; i++) b.updateRomanLegionary(unit, b.romanPlacementContext());
        assert.equal(target.hp, 1000, defense);
        if (defense === 'wall') assert.equal(b.checkRectCollision(unit, b.objects[0]), false);
    }
});
