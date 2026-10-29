const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const physics = fs.readFileSync(path.join(__dirname, '..', 'src', 'physics.js'), 'utf8');
const drawing = fs.readFileSync(path.join(__dirname, '..', 'src', 'tanks.js'), 'utf8');

function battle() {
    const context = vm.createContext({
        window: { effectsEnabled: true }, objects: [], particles: [], enemies: [], allies: [],
        playerDrones: [], enemyDrones: [], tankType: 'normal',
        tank: { x: 1000, y: 1000, w: 38, h: 38, hp: 300, alive: true, team: 0 },
        navNeedsRebuild: false, currentMode: 'single', gameState: 'playing'
    });
    vm.runInContext(physics, context);
    return context;
}

test('tank destruction keeps its original fireball, shockwave, lifetime and particles', () => {
    const context = battle();
    context.spawnExplosion(100, 200, 65);
    assert.equal(context.objects.length, 2);
    assert.equal(context.objects[0].explosionStyle, undefined);
    assert.equal(context.objects[0].radius, 65);
    assert.equal(context.objects[0].life, 28);
    assert.equal(context.objects[1].type, 'shockwave');
    assert.equal(context.objects[1].life, 18);
    assert.equal(context.particles.length, 50);
});

test('projectile impacts and larger barrel fireballs keep their damage radii', () => {
    const context = battle();
    const direct = { x: 35, y: -10, w: 20, h: 20, hp: 1000, team: 1, alive: true };
    const neighbor = { ...direct, x: 85 };
    context.enemies.push(direct, neighbor);
    context.explodeKamikazeProjectile({ x: 0, y: 0, team: 0, owner: 'player', damage: 100 }, direct);
    assert.equal(context.objects[0].explosionStyle, 'impact');
    assert.equal(context.objects[0].radius, 30);
    assert.equal(direct.hp, 900);
    assert.ok(neighbor.hp < 1000, 'splash still reaches past the smaller visual effect');
    context.objects.length = 0;
    direct.hp = neighbor.hp = 1000;
    context.explodeMechRocket({ x: 0, y: 0, team: 0, damage: 150, explodeRadius: 50 });
    assert.equal(context.objects[0].radius, 60);
    assert.equal(context.objects[0].explosionStyle, 'blast');
    assert.equal(context.objects[0].life, 36);
    assert.equal(direct.hp, 940);
    assert.equal(neighbor.hp, 1000);
    context.objects.length = 0;
    direct.x = 100;
    neighbor.x = 125;
    direct.hp = neighbor.hp = 1000;
    const barrel = { type: 'barrel', x: -10, y: -10, w: 20, h: 20 };
    context.objects.push(barrel);
    context.explodeBarrel(barrel);
    const blast = context.objects.find(obj => obj.type === 'explosion');
    assert.equal(blast.explosionStyle, 'barrel');
    assert.equal(blast.radius, 140);
    assert.equal(direct.hp, 950);
    assert.equal(neighbor.hp, 1000);
    assert.equal(context.objects.includes(barrel), false);
    assert.equal(context.particles.length, 0, 'new explosions do not create particle storms');
});

test('effects setting disables all explosion spawning', () => {
    const context = battle();
    context.window.effectsEnabled = false;
    for (const style of ['tank', 'impact', 'blast', 'barrel']) context.spawnExplosion(10, 20, 50, style);
    assert.equal(context.objects.length, 0);
    assert.equal(context.particles.length, 0);
});

test('explosion rendering restores canvas state, caches sprites and leaves simulation untouched', () => {
    let surfaces = 0;
    const spriteContext = new Proxy({}, { get: (_target, name) => (name === 'createRadialGradient' || name === 'createLinearGradient')
        ? () => ({ addColorStop() {} }) : () => {} });
    const calls = [], stack = [], legacyStops = [];
    const state = { globalAlpha: 1, globalCompositeOperation: 'source-over', fillStyle: '#initial', strokeStyle: '#initial', lineWidth: 1 };
    const canvas = new Proxy(state, { get(target, name) {
        if (name === 'save') return () => stack.push({ ...target });
        if (name === 'restore') return () => {
            assert.ok(stack.length, 'canvas restore without a matching save');
            Object.assign(target, stack.pop());
        };
        if (name === 'createRadialGradient' || name === 'createLinearGradient') return () => ({ addColorStop: (_offset, color) => legacyStops.push(color) });
        if (name in target) return target[name];
        return (...args) => calls.push({ name, args });
    } });
    const objects = [{ type: 'explosion', explosionStyle: 'impact', x: 10, y: 20, radius: 30, seed: 1, life: 22, maxLife: 24 }];
    const context = vm.createContext({ ctx: canvas, objects, isVisible: () => true, window: {},
        GameTerrain: { current: () => 'forest', drawWallCover() {}, drawWoodenWall() {}, drawWoodenWallBurn() {}, drawWoodenWallRot() {} },
        document: { createElement: () => { surfaces++; return { getContext: () => spriteContext }; } } });
    const start = drawing.indexOf('const ordnanceExplosionArt');
    const end = drawing.indexOf('function drawWorldGrid(', start);
    vm.runInContext(drawing.slice(start, end), context);
    const marker = drawing.indexOf('const rad = (obj.radius || 0) *');
    const objectStart = drawing.lastIndexOf('    objects.forEach(obj => {', marker);
    const objectEnd = drawing.indexOf('    // 3.5. ', objectStart);
    assert.ok(objectStart >= 0 && objectEnd > objectStart);
    const render = new vm.Script(drawing.slice(objectStart, objectEnd));
    const saved = JSON.stringify(objects);
    render.runInContext(context);
    assert.equal(surfaces, 4);
    const firstImages = calls.filter(call => call.name === 'drawImage').map(call => call.args);
    calls.length = 0;
    render.runInContext(context);
    assert.deepEqual(calls.filter(call => call.name === 'drawImage').map(call => call.args), firstImages);
    assert.equal(surfaces, 4);
    assert.equal(JSON.stringify(objects), saved);
    objects[0].life = 12;
    calls.length = 0;
    render.runInContext(context);
    assert.notDeepEqual(calls.filter(call => call.name === 'drawImage').map(call => call.args), firstImages);
    objects.push({ type: 'explosion', x: 100, y: 100, radius: 65, life: 24, maxLife: 28 });
    render.runInContext(context);
    assert.ok(legacyStops.some(color => color.startsWith('rgba(255,255,220,')), 'tank fireball still uses its original gradient');
    assert.equal(stack.length, 0);
    assert.equal(state.fillStyle, '#initial');
    assert.equal(state.globalAlpha, 1);
    assert.equal(state.globalCompositeOperation, 'source-over');
    objects.length = 0;
    objects.push({ type: 'terrainDebris', x: 100, y: 100, radius: 80, life: 38, maxLife: 44,
        material: 'wood', biome: 'snow', dustSize: 40, dustX: 0, dustY: 0,
        fragments: [{ x: 0, y: 0, dx: 12, dy: 6, lift: 10, size: 12, thickness: 2, angle: 0.5, spin: 2 }] });
    render.runInContext(context);
    assert.equal(stack.length, 0);
    assert.equal(state.fillStyle, '#initial');
    assert.equal(state.globalAlpha, 1);
    objects.push({ type: 'wall', x: 0, y: 0, w: 50, h: 50, wallDamageCount: 3, wallHitPoints: [{ x: 0, y: 0.5 }] },
        { type: 'woodenWall', x: 80, y: 0, w: 90, h: 30, hp: 120, maxHp: 300, woodHitPoints: [{ x: 0, y: 0.5 }] });
    render.runInContext(context);
    assert.equal(stack.length, 0, 'damaged wall masks must not affect subsequent drawing');
    assert.equal(state.fillStyle, '#initial');
    objects.length = 0;
    const deadWall = { type: 'woodenWall', x: 50, y: 50, w: 150, h: 45, hp: 0, woodRotAmount: 1 };
    objects.push({ type: 'woodIceImpact', destroyedWall: true, wall: deadWall, x: 50, y: 50, w: 150, h: 45,
        sourceHp: 80, hitX: 0, hitY: 22, vx: 7, vy: 0, age: 22, life: 36, maxLife: 58 },
        { type: 'woodDecay', wall: deadWall, x: 250, y: 50, w: 150, h: 45, sourceHp: 0.5, life: 42, maxLife: 64 });
    const savedDeaths = JSON.stringify(objects);
    calls.length = 0;
    render.runInContext(context);
    const cachedDeathSurfaces = surfaces;
    const shards = calls.filter(call => call.name === 'drawImage').map(call => call.args);
    assert.ok(shards.length > 5 && shards.length <= 40, 'destruction renders bounded textured fragments instead of one fading rectangle');
    calls.length = 0;
    render.runInContext(context);
    assert.equal(surfaces, cachedDeathSurfaces, 'dying walls must reuse their captured texture');
    assert.equal(JSON.stringify(objects), savedDeaths, 'rendering destruction must not change simulation state');
    assert.deepEqual(calls.filter(call => call.name === 'drawImage').map(call => call.args), shards);
    assert.equal(stack.length, 0);
    assert.equal(state.fillStyle, '#initial');
    assert.equal(state.globalAlpha, 1);
});

test('stone and wood lose localized chunks at impact points without uniform edge erosion', () => {
    const context = vm.createContext({});
    const start = drawing.indexOf('const ordnanceExplosionArt');
    vm.runInContext(drawing.slice(start, drawing.indexOf('function drawWorldGrid(', start)), context);
    const area = points => Math.abs(points.reduce((sum, point, i) => {
        const next = points[(i + 1) % points.length];
        return sum + point.x * next.y - next.x * point.y;
    }, 0)) / 2;
    const wall = { x: 100, y: 100, w: 60, h: 60, wallHitPoints: [] };
    let lastArea = 3600;
    for (let hit = 1; hit <= 5; hit++) {
        wall.wallDamageCount = hit;
        wall.wallHitPoints.push({ x: 0, y: 0.5 });
        const shape = context.getWallBreakShape(wall);
        assert.ok(area(shape.points) < lastArea, 'each hit must remove more visible stone');
        assert.ok(area(shape.points) > 1800);
        assert.ok(shape.rims.length > 0);
        assert.equal(context.getWallBreakShape(wall), shape, 'unchanged damage must reuse the same outline');
        assert.ok(shape.points.every(point => point.x >= 0 && point.x <= 60 && point.y >= 0 && point.y <= 60));
        lastArea = area(shape.points);
    }
    const wood = { x: 100, y: 100, w: 100, h: 40, hp: 240, maxHp: 300, woodHitPoints: [{ x: 0, y: 0.5 }] };
    const light = context.getWallBreakShape(wood, true);
    wood.hp = 60;
    const heavy = context.getWallBreakShape(wood, true);
    assert.ok(area(light.points) < 4000);
    assert.ok(area(heavy.points) < area(light.points));
    assert.equal(heavy.wood, true);
    assert.ok(heavy.rims.length > 0);
    assert.ok(heavy.rims.every(point => point.side === 3), 'a left impact must not trim the opposite end or the top and bottom');
    assert.ok(heavy.dents.length > 0);
    assert.ok(heavy.splits.length >= 2, 'separate boards must split along their grain');
    const matchingWood = context.getWallBreakShape({ ...wood, hp: 150 }, true);
    const matchingStone = context.getWallBreakShape({ ...wood, wallDamageCount: 3, wallHitPoints: [{ x: 0, y: 0.5 }] });
    assert.deepEqual(matchingWood.points, matchingStone.points, 'both materials must use the same localized chunk-removal shape');
    wood.woodHitPoints.push({ x: 1, y: 0.5 });
    wood.woodDamageVersion = 1;
    const secondImpact = context.getWallBreakShape(wood, true);
    assert.ok(secondImpact.rims.some(point => point.side === 1));
    assert.ok(secondImpact.rims.some(point => point.side === 3));
    assert.ok(secondImpact.points.some(point => point.x === 0 && point.y === 0));
    assert.ok(secondImpact.points.some(point => point.x === 100 && point.y === 40));
    const stableWood = { x: 100, y: 100, w: 100, h: 40, hp: 240, maxHp: 300,
        woodHitPoints: [{ x: 0, y: 0.5, damage: 0.2, effect: 'wood' }] };
    const firstShape = context.getWallBreakShape(stableWood, true);
    stableWood.hp = 150;
    stableWood.woodHitPoints.push({ x: 1, y: 0.5, damage: 0.5, effect: 'ice' });
    stableWood.woodDamageVersion = 1;
    const nextShape = context.getWallBreakShape(stableWood, true);
    assert.deepEqual(nextShape.points.filter(point => point.x < 40), firstShape.points.filter(point => point.x < 40),
        'a new hit on the opposite end must not reshape existing damage');
    assert.ok(nextShape.rims.some(point => point.effect === 'ice'));
    wood.hp = 300;
    assert.equal(context.getWallBreakShape(wood, true), null);
});


test('wood impact size follows local damage, including on already weakened walls', () => {
    const context = battle();
    const start = drawing.indexOf('const ordnanceExplosionArt');
    vm.runInContext(drawing.slice(start, drawing.indexOf('function drawWorldGrid(', start)), context);
    vm.runInContext('Math.random = () => 0.5;', context);
    const makeWall = hp => ({ type: 'woodenWall', x: 100, y: 100, w: 140, h: 50, hp, maxHp: 300 });
    const weak = makeWall(300), strong = makeWall(300), weakened = makeWall(120), repeated = makeWall(300);
    context.objects.push(weak, strong, weakened, repeated);
    const options = { exactDamage: true, hitX: 101, hitY: 125, vx: 7, vy: 0 };
    context.damageWoodenWall(weak, 10, options);
    context.damageWoodenWall(strong, 100, options);
    context.damageWoodenWall(weakened, 10, options);
    const area = points => Math.abs(points.reduce((sum, point, i) => {
        const next = points[(i + 1) % points.length];
        return sum + point.x * next.y - next.x * point.y;
    }, 0)) / 2;
    const chippedArea = wall => wall.w * wall.h - area(context.getWallBreakShape(wall, true).points);
    assert.ok(chippedArea(strong) > chippedArea(weak) * 4, 'a standard round must visibly remove much more wood than a machinegun bullet');
    assert.ok(Math.abs(chippedArea(weak) - chippedArea(weakened)) < 1e-8, 'low wall health must not magnify a weak impact');
    const debris = context.objects.filter(obj => obj.type === 'terrainDebris');
    assert.ok(debris[1].fragments.length > debris[0].fragments.length);
    assert.ok(debris[1].fragments[0].size > debris[0].fragments[0].size * 2);
    assert.ok(debris[1].dustSize > debris[0].dustSize * 2);
    for (let i = 0; i < 10; i++) context.damageWoodenWall(repeated, 10, options);
    assert.ok(Math.abs(chippedArea(repeated) - chippedArea(strong)) < 1e-8, 'repeated hits in one spot must accumulate local damage');
    const beforeStrong = context.objects.filter(obj => obj.type === 'terrainDebris').length;
    context.damageWoodenWall(weak, 100, options);
    assert.equal(context.objects.filter(obj => obj.type === 'terrainDebris').length, beforeStrong + 1,
        'a strong impact must not be suppressed by a weak impact in the same frame');
});

test('ice and rot destruction finishes without collision ghosts or lingering effect objects', () => {
    const context = battle();
    const iceWall = { type: 'woodenWall', x: 100, y: 100, w: 100, h: 40, hp: 80 };
    const rotWall = { type: 'woodenWall', x: 300, y: 100, w: 100, h: 40, hp: 0.5 };
    context.objects.push(iceWall, rotWall);
    context.damageWoodenWall(iceWall, 100, { materialEffect: 'ice', hitX: 101, hitY: 120 });
    context.poisonWoodenWall(rotWall, 301, 120);
    context.updateWoodenWallRot(rotWall);
    assert.equal(context.objects.includes(iceWall), false);
    assert.equal(context.objects.includes(rotWall), false);
    assert.equal(context.objects.length, 2);
    assert.ok(context.objects.every(obj => !context.isBlockingTerrainObject(obj)));
    assert.equal(context.objects.find(obj => obj.type === 'woodIceImpact').sourceHp, 80);
    const start = physics.indexOf("        } else if (obj.type === 'woodIceImpact') {");
    const end = physics.indexOf("        } else if (obj.type === 'gas') {", start);
    vm.runInContext(`function tickDestruction() { for (let i = objects.length - 1; i >= 0; i--) { const obj = objects[i]; if (false) { ${physics.slice(start, end)} } } }`, context);
    for (let tick = 0; tick < 64; tick++) context.tickDestruction();
    assert.equal(context.objects.length, 0);
});


test('barrel chain advances once every 15 simulation ticks and detonates each barrel once', () => {
    const context = battle();
    const barrels = [0, 150, 300, 550].map(x => ({ type: 'barrel', x, y: 0, w: 60, h: 60 }));
    const victim = { x: 170, y: 20, w: 20, h: 20, hp: 1000, team: 1, alive: true };
    context.objects.push(...barrels); context.enemies.push(victim);
    assert.equal(context.explodeBarrel(barrels[0]), 1);
    assert.equal(context.objects.filter(obj => obj.explosionStyle === 'barrel').length, 1);
    assert.equal(barrels[1].barrelFuseTicks, 15);
    assert.equal(victim.hp, 1000);
    for (let i = 0; i < 14; i++) context.updateBarrelFuses();
    assert.equal(context.objects.includes(barrels[1]), true);
    assert.equal(context.objects.includes(barrels[2]), true);
    context.updateBarrelFuses();
    assert.equal(context.objects.includes(barrels[1]), false);
    assert.equal(barrels[2].barrelFuseTicks, 15);
    assert.equal(victim.hp, 700);
    for (let i = 0; i < 14; i++) context.updateBarrelFuses();
    assert.equal(context.objects.includes(barrels[2]), true);
    context.updateBarrelFuses();
    assert.equal(context.objects.filter(obj => obj.explosionStyle === 'barrel').length, 3);
    assert.equal(context.objects.includes(barrels[3]), true);
    assert.equal(context.explodeBarrel(barrels[0]), 0);
    assert.equal(victim.hp, 700);
});

test('long barrel chains work with effects disabled and do not recurse through the call stack', () => {
    const context = battle();
    context.window.effectsEnabled = false;
    const barrels = Array.from({ length: 750 }, (_, index) => ({ type: 'barrel', x: index * 100, y: 0, w: 60, h: 60 }));
    context.objects.push(...barrels);
    assert.equal(context.explodeBarrel(barrels[0]), 1);
    for (let tick = 0; tick < 15 * 749; tick++) context.updateBarrelFuses();
    assert.equal(context.objects.length, 0);
    assert.equal(context.particles.length, 0);
});

test('overlapping explosions preserve the first fuse and clearing the map cancels pending barrels', () => {
    const context = battle();
    const first = { type: 'barrel', x: 0, y: 0, w: 60, h: 60 };
    const middle = { type: 'barrel', x: 140, y: 0, w: 60, h: 60 };
    const other = { type: 'barrel', x: 240, y: 0, w: 60, h: 60 };
    context.objects.push(first, middle, other);
    context.explodeBarrel(first);
    for (let i = 0; i < 10; i++) context.updateBarrelFuses();
    assert.equal(middle.barrelFuseTicks, 5);
    context.explodeBarrel(other);
    assert.equal(middle.barrelFuseTicks, 5);
    for (let i = 0; i < 4; i++) context.updateBarrelFuses();
    assert.equal(context.objects.includes(middle), true);
    context.updateBarrelFuses();
    assert.equal(context.objects.includes(middle), false);
    assert.equal(context.objects.filter(obj => obj.explosionStyle === 'barrel').length, 3);
    const next = { type: 'barrel', x: 0, y: 0, w: 60, h: 60 };
    const pending = { type: 'barrel', x: 100, y: 0, w: 60, h: 60 };
    context.objects = [next, pending]; context.explodeBarrel(next);
    context.objects = [];
    for (let i = 0; i < 60; i++) context.updateBarrelFuses();
    assert.equal(context.objects.length, 0);
});

test('barrel chains report player death once and preserve war respawning', () => {
    for (const mode of ['single', 'war']) {
        const context = battle();
        Object.assign(context.tank, { x: 20, y: 20, hp: 50 });
        context.currentMode = mode;
        let losses = 0;
        context.loseModeTrophies = () => losses++;
        context.syncResultOverlay = () => {};
        context.objects.push({ type: 'barrel', x: 0, y: 0, w: 60, h: 60 }, { type: 'barrel', x: 60, y: 0, w: 60, h: 60 });
        context.explodeBarrel(context.objects[0]);
        assert.equal(context.tank.alive, false);
        assert.equal(losses, mode === 'war' ? 0 : 1);
        if (mode === 'war') assert.equal(context.tank.respawnTimer, 600);
    }
});

test('mech rockets remove larger visible wood chunks without changing wall HP damage', () => {
    const prepare = () => {
        const context = battle();
        vm.runInContext('Math.random = () => 0.5;', context);
        const start = drawing.indexOf('const ordnanceExplosionArt');
        vm.runInContext(drawing.slice(start, drawing.indexOf('function drawWorldGrid(', start)), context);
        const wall = { type: 'woodenWall', x: 100, y: 100, w: 120, h: 40, hp: 300, maxHp: 300 };
        context.objects.push(wall);
        return { context, wall };
    };
    const normal = prepare(), mech = prepare();
    normal.context.damageTerrainInRadius(90, 120, 50, 150);
    mech.context.explodeMechRocket({ x: 90, y: 120, explodeRadius: 50, damage: 150, team: 0 });
    assert.equal(normal.wall.hp, 180);
    assert.equal(mech.wall.hp, normal.wall.hp);
    const area = points => Math.abs(points.reduce((sum, point, i) => {
        const next = points[(i + 1) % points.length]; return sum + point.x * next.y - next.x * point.y;
    }, 0)) / 2;
    const normalRemoved = 4800 - area(normal.context.getWallBreakShape(normal.wall, true).points);
    const mechRemoved = 4800 - area(mech.context.getWallBreakShape(mech.wall, true).points);
    assert.ok(mechRemoved > normalRemoved * 2);
    const normalDebris = normal.context.objects.find(obj => obj.type === 'terrainDebris');
    const mechDebris = mech.context.objects.find(obj => obj.type === 'terrainDebris');
    assert.ok(mechDebris.fragments.length > normalDebris.fragments.length);
    assert.ok(mechDebris.dustSize > normalDebris.dustSize);
    assert.ok(mechDebris.fragments[0].size > normalDebris.fragments[0].size);
});


test('a barrel ignited before physics starts its fuse on the next simulation frame', () => {
    const context = battle();
    context.window.frameCount = 50;
    const first = { type: 'barrel', x: 0, y: 0, w: 50, h: 50 };
    const next = { type: 'barrel', x: 100, y: 0, w: 50, h: 50 };
    context.objects.push(first, next);
    context.explodeBarrel(first);
    context.updateBarrelFuses();
    assert.equal(next.barrelFuseTicks, 15);
    for (let tick = 0; tick < 14; tick++) { context.window.frameCount++; context.updateBarrelFuses(); }
    assert.equal(next.barrelFuseTicks, 1);
    assert.equal(context.objects.includes(next), true);
    context.window.frameCount++; context.updateBarrelFuses();
    assert.equal(context.objects.includes(next), false);
});
