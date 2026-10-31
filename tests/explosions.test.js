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

test('tank destruction leaves capped wreckage alongside its visual-only explosion', () => {
    const context = battle();
    context.spawnExplosion(100, 200, 65, 'tank', { w: 38, h: 38, color: '#b22222', tankType: 'machinegun', baseAngle: 0.4, turretAngle: 0.7 });
    assert.equal(context.objects.length, 3);
    assert.equal(context.objects[0].type, 'tankWreck');
    assert.equal(context.objects[0].x, 100);
    assert.equal(context.objects[0].y, 200);
    assert.equal(context.objects[0].color, '#b22222');
    assert.equal(context.objects[0].hullAngle, 0.4);
    assert.equal(context.objects[0].turretAngle, 0.7);
    assert.equal(context.objects[0].tankType, 'machinegun');
    assert.equal(context.objects[1].explosionStyle, 'tank');
    assert.equal(context.objects[1].radius, 65);
    assert.equal(context.objects[1].life, 54);
    assert.equal(context.objects[1].damage, undefined);
    assert.equal(context.objects[2].type, 'shockwave');
    assert.equal(context.objects[2].life, 18);
    assert.equal(context.particles.length, 50);
    for (let i = 0; i < 20; i++) context.spawnExplosion(i, 0, 65);
    const wrecks = context.objects.filter(obj => obj.type === 'tankWreck');
    assert.equal(wrecks.length, 20);
    assert.equal(wrecks[0].x, 0);
});

test('critical oil leakage makes small moving drops and grows one stationary pool', () => {
    const context = battle();
    const tank = context.tank;
    let poured = 0;
    context.GameTerrain = { addOilToWater: (_x, _y, amount) => { poured += amount; return true; } };
    Object.assign(tank, { x: 0, y: 0, w: 38, h: 38, hp: 20, maxHp: 100 });
    const oil = () => context.objects.filter(obj => obj.type === 'tankOilTrail');
    context.updateTankDamageEffects();
    tank.x = 12;
    context.updateTankDamageEffects();
    assert.equal(oil().length, 0, 'exactly 20 percent HP does not leak');
    tank.hp = 19;
    context.updateTankDamageEffects();
    tank.x = 24;
    for (let tick = 0; tick < 3; tick++) context.updateTankDamageEffects();
    assert.equal(oil().length, 2);
    assert.ok(oil().every(drop => drop.radius < 3 && drop.life === 2100 && drop.damage === undefined));
    assert.ok(oil().every(drop => drop.x < tank.x + tank.w / 2), 'leak stays at the rear of the hull');
    for (let tick = 0; tick < 35; tick++) context.updateTankDamageEffects();
    const pool = tank._oilPool;
    assert.ok(pool);
    const count = oil().length, radius = pool.radius;
    for (let tick = 0; tick < 35; tick++) context.updateTankDamageEffects();
    assert.equal(oil().length, count, 'stationary leakage reuses its puddle');
    assert.ok(pool.radius > radius);
    for (let tick = 0; tick < 700; tick++) context.updateTankDamageEffects();
    assert.ok(pool.radius <= tank.w * 0.24, 'continued leakage keeps a compact puddle');
    assert.ok(poured > 100, 'fresh leakage keeps adding oil to terrain water');
    context.window.effectsEnabled = false;
    tank.x = 36;
    context.updateTankDamageEffects();
    assert.equal(oil().length, count);
});

test('damage smoke drifts independently of its source and expires in simulation', () => {
    const context = battle();
    context.tank.hp = 100;
    context.tank.maxHp = 300;
    context.updateTankDamageEffects();
    const smoke = context.objects.find(obj => obj.type === 'tankDamageSmoke');
    assert.ok(smoke);
    const start = physics.indexOf("        } else if (obj.type === 'tankDamageSmoke') {");
    const end = physics.indexOf("        } else if (obj.type === 'explosion' ||", start);
    assert.ok(start >= 0 && end > start);
    vm.runInContext(`function tickSmoke() { for (let i=objects.length-1;i>=0;i--) { const obj=objects[i]; if(false) { ${physics.slice(start,end)} } } }`, context);
    const x = smoke.x, y = smoke.y;
    context.tank.x += 200;
    context.tickSmoke();
    assert.ok(smoke.x > x && smoke.x < x + 1);
    assert.ok(smoke.y < y);
    for (let i=1;i<90;i++) context.tickSmoke();
    assert.equal(context.objects.filter(obj => obj.type === 'tankDamageSmoke').length, 0);
});

test('damage source follows the visible hull instead of snapping to movement input', () => {
    const context = battle();
    let visibleAngle = 0;
    context.GameTerrain = { getMotion: () => ({ angle: visibleAngle }) };
    Object.assign(context.tank, { hp: 49, maxHp: 100, baseAngle: 0 });
    const start = drawing.indexOf('function drawTankDamage(');
    const end = drawing.indexOf('function drawTankDamageSmoke(', start);
    vm.runInContext(drawing.slice(start, end), context);
    const anchors = [];
    const canvas = new Proxy({}, { get: (_target, name) => {
        if (name === 'createRadialGradient') return (x, y) => { anchors.push({ x, y }); return { addColorStop() {} }; };
        return () => {};
    } });
    context.drawTankDamage(canvas, context.tank);
    context.tank.baseAngle = Math.PI / 2;
    visibleAngle = 0.1;
    context.drawTankDamage(canvas, context.tank);
    assert.ok(Math.hypot(anchors[1].x - anchors[0].x, anchors[1].y - anchors[0].y) < 2);
    context.updateTankDamageEffects();
    const smoke = context.objects.find(obj => obj.type === 'tankDamageSmoke');
    assert.ok(Math.abs(smoke.x - (context.tank.x + context.tank.w / 2 + anchors[1].x)) < 0.001);
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

test('smoke and oil respect separate damage thresholds', () => {
    const sample = (hp, enabled = true) => {
        const context = battle();
        Object.assign(context.tank, { hp, maxHp: 100 });
        context.window.effectsEnabled = enabled;
        for (let tick=0;tick<40;tick++) context.updateTankDamageEffects();
        assert.equal(context.tank.hp, hp, 'presentation does not deal damage');
        return {
            smoke: context.objects.filter(obj => obj.type === 'tankDamageSmoke').length,
            oil: context.objects.filter(obj => obj.type === 'tankOilTrail').length
        };
    };
    assert.deepEqual(sample(50), { smoke: 0, oil: 0 });
    assert.deepEqual(sample(49.9), { smoke: 3, oil: 0 });
    assert.deepEqual(sample(30), { smoke: 3, oil: 0 });
    assert.deepEqual(sample(29.9), { smoke: 5, oil: 0 });
    assert.deepEqual(sample(20), { smoke: 5, oil: 0 });
    assert.deepEqual(sample(19.9), { smoke: 5, oil: 1 });
    assert.deepEqual(sample(10), { smoke: 5, oil: 1 });
    assert.deepEqual(sample(9.9), { smoke: 8, oil: 1 });
    assert.deepEqual(sample(9.9, false), { smoke: 0, oil: 0 });
});

test('screen immersion preserves moving drops and smoke, freezes on pause, and clears between battles', () => {
    const start = drawing.indexOf('let immersionPresentation = null;');
    const end = drawing.indexOf('function getImmersionEdgeArt(', start);
    assert.ok(start >= 0 && end > start);
    const context = vm.createContext({ window: { immersionEnabled: true }, gameState: 'playing', battleSessionId: 1 });
    vm.runInContext(drawing.slice(start, end), context);
    const unit = { hp: 100, maxHp: 100, alive: true };
    let state;
    for (let frame = 0; frame < 120; frame++) state = context.updateImmersionPresentation(unit, 'rain', frame, 1);
    assert.ok(state.drops.length > 0 && state.drops.length <= 18);
    const drop = [...state.drops].sort((a, b) => a.y - b.y)[0], y = drop.y;
    for (let frame = 120; frame < 130; frame++) state = context.updateImmersionPresentation(unit, 'rain', frame, 0);
    assert.ok(state.drops.includes(drop) && drop.y > y, 'existing rain keeps sliding after movement stops');
    const paused = JSON.stringify(state);
    for (let i = 0; i < 30; i++) context.updateImmersionPresentation(unit, 'rain', 129, 0);
    assert.equal(JSON.stringify(state), paused);
    context.battleSessionId++;
    state = context.updateImmersionPresentation(unit, 'forest', 130, 0);
    assert.equal(state.drops.length, 0);
    unit.hp = 9;
    for (let frame = 131; frame < 311; frame++) state = context.updateImmersionPresentation(unit, 'forest', frame, 0);
    assert.ok(state.smoke.length > 0 && state.smoke.length <= 22);
    assert.ok(state.smoke.some(puff => puff.y < 1), 'fire smoke rises into the screen');
    unit.hp = 100;
    for (let frame = 311; frame < 551; frame++) state = context.updateImmersionPresentation(unit, 'forest', frame, 0);
    assert.equal(state.smoke.length, 0);
    context.window.immersionEnabled = false;
    assert.equal(context.updateImmersionPresentation(unit, 'snow', 551, 0), null);
});

test('immersion statuses follow cold, cloud contact, drill contact and distinct fire attacks', () => {
    const start = drawing.indexOf('let immersionPresentation = null;');
    const end = drawing.indexOf('function getImmersionEdgeArt(', start);
    const context = vm.createContext({ window: { immersionEnabled: true }, gameState: 'playing', battleSessionId: 1, objects: [] });
    vm.runInContext(drawing.slice(start, end), context);
    const unit = { x: 0, y: 0, w: 38, h: 38, hp: 100, maxHp: 100, alive: true };
    let frame = 0, state;
    const advance = (count = 90) => {
        for (let i = 0; i < count; i++) state = context.updateImmersionPresentation(unit, 'forest', frame++, 0);
        return state;
    };
    unit.burning = true; unit.burnTimer = 300;
    advance();
    assert.ok(state.pyro > 0.95 && state.smoke.length > 0, 'pyro burning works at full HP');
    unit.iceSlowed = true; unit.iceSlowedTime = 240;
    advance(1);
    assert.equal(state.fire, 0); assert.equal(state.pyro, 0); assert.equal(state.smoke.length, 0);
    assert.equal(state.iced, true);
    advance();
    assert.ok(state.ice > 0.95); assert.equal(state.frozen, 0, 'ordinary ice hits do not cover the whole screen');
    unit.frozenEffect = 180; advance(); assert.ok(state.frozen > 0.95);
    const paused = JSON.stringify(state);
    context.updateImmersionPresentation(unit, 'forest', frame - 1, 0);
    assert.equal(JSON.stringify(state), paused);
    unit.frozenEffect = 0; unit.iceSlowed = false; unit.iceSlowedTime = 0; unit.burning = false;
    advance(120);
    assert.equal(state.iced, false);
    unit.hp = 9; advance();
    assert.ok(state.fire > 0.9 && state.smoke.length > 0);
    unit._immersionHeatFrame = frame;
    advance(30);
    assert.ok(state.heat > 0.8); assert.ok(state.pyro < 0.01);
    assert.equal(state.fire, 0, 'flamethrower heat takes precedence over damage flames');
    assert.equal(state.smoke.length, 0, 'flamethrower heat does not emit fire smoke');
    unit.hp = 100;
    context.objects.push({ type: 'gas', x: 19, y: 19, radius: 50, life: 100 });
    advance(); assert.ok(state.gas > 0.95);
    unit.x = 300; unit.poisonTimer = 180;
    advance(120); assert.equal(state.gas, 0, 'lingering poison outside the cloud does not cover the screen');
    context.Math = Object.assign(Object.create(Math), { random: () => 0.2 });
    unit.burovoyDrillParalysis = true; advance(); assert.ok(state.drill > 0.95);
    const firstDrillSeed = state.drillSeed;
    advance(10); assert.equal(state.drillSeed, firstDrillSeed, 'one contact keeps stable crack geometry');
    unit.burovoyDrillParalysis = false; unit.paralyzed = true;
    advance(120); assert.equal(state.drill, 0, 'ordinary paralysis does not keep drill cracks');
    context.Math.random = () => 0.8;
    unit.burovoyDrillParalysis = true; advance(1);
    assert.notEqual(state.drillSeed, firstDrillSeed, 'a new drill contact generates a different pattern');
    const pausedDrill = JSON.stringify(state);
    context.updateImmersionPresentation(unit, 'forest', frame - 1, 0);
    assert.equal(JSON.stringify(state), pausedDrill, 'pause does not reroll the cracks');
    unit.burovoyDrillParalysis = false; advance(120);
    unit._immersionIlluminatFrame = frame;
    advance(31); assert.equal(state.illuminatAge, 0.5);
    advance(30); assert.equal(state.illuminatAge, 1, 'Illuminat crosses the screen for one simulated second');
    context.battleSessionId++;
    state = context.updateImmersionPresentation({ ...unit, _immersionIlluminatFrame: undefined }, 'forest', frame++, 0);
    assert.equal(state.smoke.length, 0); assert.equal(state.gas, 0); assert.equal(state.illuminatAge, 2);
    context.window.immersionEnabled = false;
    assert.equal(context.updateImmersionPresentation(unit, 'forest', frame++, 0), null);
});

test('new immersion reactions track hostile swarms, overload and water without leaking between battles', () => {
    const start = drawing.indexOf('let immersionPresentation = null;'), end = drawing.indexOf('function getImmersionEdgeArt(', start);
    const context = vm.createContext({ window: { immersionEnabled: true }, gameState: 'playing', battleSessionId: 1, objects: [] });
    vm.runInContext(drawing.slice(start, end), context);
    const unit = { x: 0, y: 0, w: 38, h: 38, hp: 100, maxHp: 100, alive: true, team: 0 };
    let frame = 0, state;
    const advance = count => { for (let i = 0; i < count; i++) state = context.updateImmersionPresentation(unit, 'forest', frame++, 0); };
    context.objects.push({ type: 'pharaohSwarm', x: 19, y: 19, radius: 78, life: 300, team: 0 });
    advance(60); assert.equal(state.swarm, 0, 'friendly swarms do not cover the screen');
    context.objects[0].team = 1; advance(60);
    assert.ok(state.swarm > 0.95); assert.equal(state.insects.length, 96);
    const bug = state.insects[0], position = bug.x; advance(10); assert.notEqual(bug.x, position);
    const wasFlying = bug.flying; bug.modeTime = 0; advance(1);
    assert.equal(bug.flying, !wasFlying, 'flies alternate between flight and crawling');
    const paused = JSON.stringify(state); context.updateImmersionPresentation(unit, 'forest', frame - 1, 0);
    assert.equal(JSON.stringify(state), paused);
    unit.x = 400; unit.sandCurseTimer = 300; advance(120);
    assert.equal(state.swarm, 0); assert.equal(state.insects.length, 0, 'leaving the swarm clears bugs despite the lingering curse');
    unit._kvantOverload = true; advance(60); assert.ok(state.overload > 0.95);
    unit._kvantOverload = false; advance(120); assert.equal(state.overload, 0);
    unit._immersionElectricFrame = frame; unit._immersionImpactFrame = frame; unit._immersionWaterFrame = frame;
    advance(1); assert.equal(state.electricAge, 0); assert.equal(state.impactAge, 0);
    assert.equal(state.wetDrops.length, 12);
    const drop = state.wetDrops[0], y = drop.y; advance(30); assert.ok(drop.y > y, 'large drops slide after the hit');
    unit._immersionWaterFrame = frame; advance(1);
    const spraySeed = state.spraySeed, sprayTime = state.sprayTime;
    for (let i = 0; i < 180; i++) { unit._immersionWaterFrame = frame; advance(1); }
    assert.equal(state.spraySeed, spraySeed, 'sustained water contact keeps the spray direction stable');
    assert.ok(state.sprayTime > sprayTime + 2.9, 'continuous spray never restarts its animation clock');
    assert.ok(state.wetDrops.length <= 28); assert.ok(state.water > 0.9);
    advance(480); assert.equal(state.wetDrops.length, 0); assert.equal(state.water, 0); assert.ok(state.impactAge > 0.85);
    context.battleSessionId++; advance(1);
    assert.equal(state.insects.length, 0); assert.equal(state.wetDrops.length, 0);
    context.window.immersionEnabled = false;
    assert.equal(context.updateImmersionPresentation(unit, 'forest', frame++, 0), null);
});

test('poison immersion reads real cloud ownership and keeps friendly mist faint', () => {
    const context = battle();
    context.window.immersionEnabled = true; context.window.effectsEnabled = false; context.battleSessionId = 1;
    const start = drawing.indexOf('let immersionPresentation = null;'), end = drawing.indexOf('function getImmersionEdgeArt(', start);
    vm.runInContext(drawing.slice(start, end), context);
    let frame = 0, state;
    const advance = () => { for (let i = 0; i < 180; i++) state = context.updateImmersionPresentation(context.tank, 'forest', frame++, 0); };
    const makeCloud = (owner, team) => context.explodeGas({ x: 1019, y: 1019, owner, team });
    for (const owner of ['player', 'ally']) {
        context.objects.length = 0; makeCloud(owner, 0); advance();
        assert.ok(state.gas > 0.05 && state.gas <= 0.061, `${owner} gas stays faint`);
        assert.equal(context.objects.find(obj => obj.type === 'gas').ownerTeam, 0);
    }
    makeCloud('enemy', 1); advance(); assert.ok(state.gas > 0.99, 'hostile gas dominates overlapping friendly gas');
    context.objects = context.objects.filter(obj => obj.owner !== 'enemy'); advance();
    assert.ok(state.gas > 0.05 && state.gas < 0.061, 'only faint mist remains after hostile gas is removed');
    context.tank.x += 500; advance(); assert.equal(state.gas, 0);
});

test('music, air and barrage immersion expire, pause and bound repeated hits', () => {
    const start = drawing.indexOf('let immersionPresentation = null;'), end = drawing.indexOf('function getImmersionEdgeArt(', start);
    const context = vm.createContext({ window: { immersionEnabled: true }, gameState: 'playing', battleSessionId: 1, objects: [] });
    vm.runInContext(drawing.slice(start, end), context);
    const unit = { x: 0, y: 0, w: 38, h: 38, hp: 100, maxHp: 100, alive: true, team: 0 };
    let frame = 0, state;
    const advance = count => { for (let i = 0; i < count; i++) state = context.updateImmersionPresentation(unit, 'forest', frame++, 0); };
    unit._immersionMusicFrame = 0; unit._immersionAirFrame = 0; unit._immersionAirAngle = Math.PI / 2; unit._immersionBarrageFrame = 0;
    advance(1); assert.equal(state.musicPulses.length, 1); assert.equal(state.airAge, 0); assert.equal(state.airAngle, Math.PI / 2);
    const initialShock = state.barrageShockFrame;
    for (let i = 0; i < 12; i++) {
        advance(6); unit._immersionMusicFrame = frame; unit._immersionBarrageFrame = frame; advance(1);
        assert.ok(state.musicPulses.length <= 4);
    }
    assert.equal(state.barrageShockFrame, initialShock, 'sustained barrages do not restart strong shake');
    assert.ok(state.barrageShockAge > 0.4);
    const paused = JSON.stringify(state); context.updateImmersionPresentation(unit, 'forest', frame - 1, 0);
    assert.equal(JSON.stringify(state), paused);
    advance(60); unit._immersionBarrageFrame = frame; advance(1);
    assert.equal(state.barrageShockAge, 0, 'a later separate wave gets its own impact');
    advance(120); assert.equal(state.musicPulses.length, 0); assert.ok(state.barrageAge > 1.1 && state.airAge > 0.9);
    delete unit._immersionMusicFrame; delete unit._immersionAirFrame; delete unit._immersionAirAngle; delete unit._immersionBarrageFrame;
    context.battleSessionId++; advance(1); assert.equal(state.musicPulses.length, 0); assert.equal(state.barrageAge, 2); assert.equal(state.airAge, 2);
    context.window.immersionEnabled = false; advance(1); assert.equal(state, null);
});

test('explosion rendering restores canvas state, caches sprites and leaves simulation untouched', () => {
    let surfaces = 0;
    const spriteContext = new Proxy({}, { get: (_target, name) => name === 'createImageData'
        ? (w, h) => ({ data: new Uint8ClampedArray(w * h * 4) })
        : (name === 'createRadialGradient' || name === 'createLinearGradient')
            ? () => ({ addColorStop() {} }) : () => {} });
    const calls = [], stack = [];
    const state = { globalAlpha: 1, globalCompositeOperation: 'source-over', fillStyle: '#initial', strokeStyle: '#initial', lineWidth: 1 };
    const canvas = new Proxy(state, { get(target, name) {
        if (name === 'save') return () => stack.push({ ...target });
        if (name === 'restore') return () => {
            assert.ok(stack.length, 'canvas restore without a matching save');
            Object.assign(target, stack.pop());
        };
        if (name === 'createRadialGradient' || name === 'createLinearGradient') return () => ({ addColorStop() {} });
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
    objects.length = 0;
    const blast = { type: 'explosion', explosionStyle: 'tank', x: 100, y: 100, radius: 65, seed: 0.7, life: 50, maxLife: 54 };
    objects.push(blast);
    const savedBlast = JSON.stringify(blast);
    render.runInContext(context);
    const bakedSurfaces = surfaces;
    calls.length = 0;
    render.runInContext(context);
    const tankImages = calls.filter(call => call.name === 'drawImage').map(call => call.args);
    calls.length = 0;
    render.runInContext(context);
    assert.deepEqual(calls.filter(call => call.name === 'drawImage').map(call => call.args), tankImages);
    assert.equal(surfaces, bakedSurfaces, 'tank textures are reused across frames');
    assert.equal(JSON.stringify(blast), savedBlast, 'drawing never advances explosion life');
    blast.life = 10;
    calls.length = 0;
    render.runInContext(context);
    assert.notDeepEqual(calls.filter(call => call.name === 'drawImage').map(call => call.args), tankImages);
    assert.equal(surfaces, bakedSurfaces);
    assert.equal(stack.length, 0);
    assert.equal(state.fillStyle, '#initial');
    assert.equal(state.globalAlpha, 1);
    assert.equal(state.globalCompositeOperation, 'source-over');
    context.window.effectsEnabled = false;
    objects.push({ type: 'shockwave', x: 100, y: 100, radius: 50, life: 10 },
        { type: 'terrainDebris', x: 100, y: 100, radius: 50, life: 30, fragments: [] },
        { type: 'implosion', x: 100, y: 100, radius: 50, life: 10 });
    calls.length = 0;
    render.runInContext(context);
    assert.equal(calls.length, 0, 'turning effects off immediately hides existing cosmetic objects');
    const particleStart = drawing.indexOf('    particles.forEach(p => {', drawing.indexOf('function renderGameFrame('));
    const particleEnd = drawing.indexOf('    // 3.', particleStart);
    assert.ok(particleStart >= 0 && particleEnd > particleStart);
    context.particles = [{ x: 100, y: 100, size: 5, life: 1, rgb: '255,120,0' }];
    vm.runInContext(drawing.slice(particleStart, particleEnd), context);
    assert.equal(calls.length, 0, 'existing free particles are hidden too');
    context.window.effectsEnabled = true;
    objects.length = 0;
    objects.push(blast);
    const death = { elapsed: 380, duration: 1000, blast: null };
    context.window.immersionEnabled = true;
    context.window.effectsEnabled = false;
    context.advanceImmersionDeath = () => death;
    context.performance = { now: () => 380 };
    const immersionStart = drawing.indexOf('function drawImmersionEffects(');
    const immersionEnd = drawing.indexOf('function renderGameFrame(', immersionStart);
    vm.runInContext('let immersionPresentation = null;\n' + drawing.slice(immersionStart, immersionEnd), context);
    calls.length = 0;
    vm.runInContext('drawImmersionEffects(ctx, 1280, 720, null)', context);
    assert.ok(calls.some(call => call.name === 'drawImage'), 'immersion remains independent of world effects');
    assert.equal(surfaces, bakedSurfaces, 'screen blast reuses the world blast textures');
    assert.equal(death.elapsed, 380, 'drawing does not advance the defeat clock');
    assert.equal(stack.length, 0);
    assert.equal(state.fillStyle, '#initial');
    assert.equal(state.globalAlpha, 1);
    assert.equal(state.globalCompositeOperation, 'source-over');
    const statusStart = drawing.indexOf('let immersionStatusCache = null;');
    assert.ok(statusStart > 0 && statusStart < immersionStart);
    context.drawTankOn = () => {};
    vm.runInContext(drawing.slice(statusStart, immersionStart), context);
    context.status = { heat: 1, gas: 1, ice: 1, frozen: 1, drill: 1, illuminatAge: 0.5, iced: true };
    const savedStatus = JSON.stringify(context.status);
    vm.runInContext('drawImmersionStatusEffects(ctx, 800, 600, status, 1)', context);
    const statusSurfaces = surfaces;
    vm.runInContext('drawImmersionStatusEffects(ctx, 800, 600, status, 1)', context);
    assert.equal(surfaces, statusSurfaces, 'status artwork is cached instead of rebuilt each frame');
    assert.equal(JSON.stringify(context.status), savedStatus);
    assert.equal(stack.length, 0);
    assert.equal(state.globalAlpha, 1);
    assert.equal(state.globalCompositeOperation, 'source-over');
    const cracksA = vm.runInContext("getImmersionStatusArt('cracks', 800, 600, 123)", context);
    assert.equal(vm.runInContext("getImmersionStatusArt('cracks', 800, 600, 123)", context), cracksA);
    const cracksB = vm.runInContext("getImmersionStatusArt('cracks', 800, 600, 456)", context);
    assert.notEqual(cracksB, cracksA, 'new contact replaces the cached crack artwork');
    calls.length = 0;
    vm.runInContext('drawImmersionPyro(ctx, 800, 600, 1, 1)', context);
    const pyroSurfaces = surfaces;
    const pausedPyro = calls.filter(call => call.name === 'drawImage').map(call => call.args);
    calls.length = 0;
    vm.runInContext('drawImmersionPyro(ctx, 800, 600, 1, 1)', context);
    assert.deepEqual(calls.filter(call => call.name === 'drawImage').map(call => call.args), pausedPyro);
    assert.equal(surfaces, pyroSurfaces, 'pyro plumes reuse their baked textures');
    calls.length = 0;
    vm.runInContext('drawImmersionPyro(ctx, 800, 600, 1, 1.3)', context);
    assert.notDeepEqual(calls.filter(call => call.name === 'drawImage').map(call => call.args), pausedPyro);
    assert.equal(surfaces, pyroSurfaces);
    assert.equal(stack.length, 0);
    assert.equal(state.globalAlpha, 1);
    assert.equal(state.globalCompositeOperation, 'source-over');
    const rainStart = drawing.indexOf('function drawImmersionRain(');
    vm.runInContext(drawing.slice(rainStart, statusStart), context);
    state.canvas = { width: 800, height: 600 };
    context.combat = { impactAge: 0.2, electricAge: 0.15, overload: 1, swarm: 1, iced: false,
        insects: [{ x: 0.3, y: 0.4, angle: 0.2, speed: 0.1, size: 1, phase: 0, flying: true },
            { x: 0.7, y: 0.6, angle: 1, speed: 0.1, size: 1, phase: 0, flying: false }],
        musicAge: 0.1, musicPulses: [48, 54], barrageAge: 0.2, barrageShockAge: 0.2, airAge: 0.2, airAngle: 0.7,
        water: 1, sprayTime: 0.1, spraySeed: 0.3,
        wetDrops: [{ x: 0.3, y: 0.3, radius: 12, age: 0.5, life: 5, seed: 1 }] };
    const savedCombat = JSON.stringify(context.combat);
    vm.runInContext('drawImmersionCombatEffects(ctx, 800, 600, combat, 1)', context);
    const combatSurfaces = surfaces;
    calls.length = 0;
    vm.runInContext('drawImmersionCombatEffects(ctx, 800, 600, combat, 1)', context);
    const combatImages = calls.filter(call => call.name === 'drawImage').map(call => call.args);
    calls.length = 0;
    vm.runInContext('drawImmersionCombatEffects(ctx, 800, 600, combat, 1)', context);
    assert.deepEqual(calls.filter(call => call.name === 'drawImage').map(call => call.args), combatImages);
    assert.equal(surfaces, combatSurfaces, 'combat overlays reuse sprites and a single scene snapshot');
    assert.equal(JSON.stringify(context.combat), savedCombat, 'rendering does not advance combat presentation');
    assert.equal(stack.length, 0);
    assert.equal(state.globalAlpha, 1);
    assert.equal(state.globalCompositeOperation, 'source-over');
    context.window.effectsEnabled = true;
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
