const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const source = fs.readFileSync(path.join(__dirname, '..', 'src', 'terrain.js'), 'utf8');
function terrain(type = 'forest') {
    const context = { window: { currentTerrain: type } };
    vm.runInNewContext(source, context);
    return context.window.GameTerrain;
}

test('terrain penalties apply only to swamp and rain', () => {
    const t = terrain();
    for (const type of ['forest', 'snow', 'desert', 'night']) {
        assert.equal(t.speedFactor(type), 1);
        assert.equal(t.reloadFactor(type), 1);
    }
    assert.equal(t.speedFactor('swamp'), 0.9);
    assert.equal(t.reloadFactor('swamp'), 1);
    assert.equal(t.speedFactor('rain'), 0.95);
    assert.ok(Math.abs(t.reloadFactor('rain') - 1 / 1.05) < 1e-12);
    assert.equal(t.normalize('unknown'), 'forest');
});

test('random terrain selects the five active map types and skips night', () => {
    const selected = [];
    for (let i = 0; i < 5; i++) {
        const context = { window: {}, Math: Object.assign(Object.create(Math), { random: () => (i + 0.5) / 5 }) };
        vm.runInNewContext(source, context);
        selected.push(context.window.GameTerrain.randomType());
    }
    assert.deepEqual(selected, ['forest', 'snow', 'desert', 'swamp', 'rain']);
});

test('lava is a dedicated boss terrain without speed or reload penalties', () => {
    const t = terrain('lava');
    assert.equal(t.current(), 'lava');
    assert.equal(t.normalize('lava'), 'lava');
    assert.equal(t.speedFactor(), 1);
    assert.equal(t.reloadFactor(), 1);
    assert.equal(t.groundColor(), '#211715');
    assert.equal(t.label(), 'Лавовая арена');
});

test('boss fight selects lava while ordinary battles keep random biomes', () => {
    const main = fs.readFileSync(path.join(__dirname, '..', 'src', 'main.js'), 'utf8');
    const start = main.indexOf("    window.currentTerrain = mode === 'bossfight'");
    const end = main.indexOf('    GameTerrain.resetBattle();', start);
    assert.ok(start >= 0 && end > start);
    const context = { window: {}, GameTerrain: { randomType: () => 'snow' } };
    vm.runInNewContext(`function choose(mode) { ${main.slice(start, end)} return window.currentTerrain; }`, context);
    assert.equal(context.choose('bossfight'), 'lava');
    assert.equal(context.choose('single'), 'snow');
});

test('lava ground, volcanic walls, and charred boxes render through cached canvas textures', () => {
    let surfaces = 0;
    const drawing = new Proxy({}, { get: (_target, name) => {
        if (name === 'createLinearGradient' || name === 'createRadialGradient') return () => ({ addColorStop() {} });
        return () => {};
    }, set: () => true });
    const context = { window: { currentTerrain: 'lava' }, document: {
        createElement: () => { surfaces++; return { getContext: () => drawing }; }
    } };
    vm.runInNewContext(source, context);
    const t = context.window.GameTerrain;
    const images = [];
    const output = { createPattern: image => image, fillRect() {}, drawImage: image => images.push(image) };
    t.drawGround(output, 0, 0, 400, 300);
    const wall = { type: 'wall', x: 50, y: 50, w: 50, h: 50, theme: 'hell' };
    const box = { type: 'box', x: 100, y: 100, w: 40, h: 40 };
    t.drawWallCover(output, wall);
    t.drawBox(output, box);
    assert.equal(images.length, 2);
    assert.equal(surfaces, 3);
    t.drawGround(output, 0, 0, 400, 300);
    t.drawWallCover(output, wall);
    t.drawBox(output, box);
    assert.equal(surfaces, 3, 'the boss terrain does not rebuild its textures every frame');
});

test('night detection has the same range and obstacle rules from both sides', () => {
    const t = terrain('night');
    const a = { x: 0, y: 0, w: 38, h: 38 };
    const b = { x: 200, y: 0, w: 38, h: 38 };
    assert.equal(t.canSee(a, b, []), true);
    assert.equal(t.canSee(b, a, []), true);
    const blockers = [{ type: 'wall', x: 100, y: -40, w: 30, h: 120 }];
    assert.equal(t.canSee(a, b, blockers), false);
    assert.equal(t.canSee(b, a, blockers), false);
    assert.equal(t.canSee(a, { ...b, x: t.NIGHT_VISION_RADIUS + 1 }, []), false);
    assert.equal(terrain('forest').canSee(a, { ...b, x: 1000 }, blockers), true);
});

test('bot target selection uses night sight instead of tracking hidden tanks', () => {
    const context = { window: { currentTerrain: 'night' }, objects: [
        { type: 'wall', x: 100, y: -40, w: 30, h: 120 }
    ] };
    vm.runInNewContext(source, context);
    context.GameTerrain = context.window.GameTerrain;
    const bot = fs.readFileSync(path.join(__dirname, '..', 'src', 'bot.js'), 'utf8');
    vm.runInNewContext(bot.slice(0, bot.indexOf('function pathClearFor(')), context);
    const observer = { x: 0, y: 0, w: 38, h: 38 };
    const visible = { x: 0, y: 150, w: 38, h: 38 };
    const hidden = { x: 200, y: 0, w: 38, h: 38 };
    const distant = { x: 600, y: 0, w: 38, h: 38 };
    const result = context.filterTargetsByVision(observer, [visible, hidden, distant]);
    assert.equal(result.length, 1); assert.equal(result[0], visible);
});

test('movement effects require displacement, expire, stay bounded and reset between battles', () => {
    const t = terrain('snow');
    const player = { x: 0, y: 0, w: 38, h: 38, alive: true };
    const bots = Array.from({ length: 115 }, (_, i) => ({ x: i * 5, y: 60, w: 38, h: 38, alive: true, tankType: i % 2 ? 'mechDiy' : 'normal' }));
    for (let i = 0; i < 20; i++) t.updateMovement(player, bots, [], 'normal');
    assert.equal(t.movementStats().marks, 0);
    let peakParticles = 0;
    for (let i = 0; i < 300; i++) {
        player.x += 3;
        for (const bot of bots) bot.x += 3;
        t.updateMovement(player, bots, [], 'normal');
        const count = t.movementStats().particles;
        assert.ok(count <= 140); peakParticles = Math.max(peakParticles, count);
    }
    assert.ok(t.movementStats().marks > 0 && t.movementStats().marks <= 1600);
    assert.ok(peakParticles > 0);
    for (let i = 0; i < 115; i++) t.updateMovement(player, bots, [], 'normal');
    assert.equal(t.movementStats().marks, 0); assert.equal(t.movementStats().particles, 0);
    player.x += 20; t.updateMovement(player, bots, [], 'normal');
    assert.ok(t.movementStats().marks > 0);
    t.resetBattle();
    assert.equal(t.movementStats().marks, 0); assert.equal(t.movementStats().particles, 0);
});

test('mech movement sway follows actual travel and settles when movement stops', () => {
    const t = terrain('snow');
    const unit = { x: 0, y: 0, w: 38, h: 38, alive: true, speed: 3 };
    t.updateMovement(unit, [], [], 'mechShield');
    for (let i = 0; i < 10; i++) { unit.y += 2; t.updateMovement(unit, [], [], 'mechShield'); }
    const phase = t.getMotion(unit).phase;
    assert.ok(phase > 0); assert.ok(t.getMotion(unit).strength > 0.5);
    assert.ok(t.getMotion(unit).angle > 0 && t.getMotion(unit).angle < Math.PI / 2, 'movement direction turns gradually');
    assert.ok(t.movementStats().marks > 0, 'moving mechs leave footprints');
    assert.ok(t.movementStats().particles > 0, 'mechs still raise a little debris');
    for (let i = 0; i < 20; i++) t.updateMovement(unit, [], [], 'mechShield');
    assert.equal(t.getMotion(unit).phase, phase);
    assert.equal(t.getMotion(unit).strength, 0, 'a nonzero speed stat must not keep an idle mech walking');
});

test('mech footprints alternate sides, render and disappear after stopping', () => {
    for (const type of ['mechDiy', 'mechShield', 'mechRocket']) {
        const t = terrain('snow'), unit = { x: 0, y: 0, w: 38, h: 38, alive: true };
        t.updateMovement(unit, [], [], type);
        for (let i = 0; i < 24; i++) { unit.x += 3; t.updateMovement(unit, [], [], type); }
        for (let i = 0; i < 30; i++) t.updateMovement(unit, [], [], type);
        const footprints = [];
        const ctx = new Proxy({}, { get: (_target, name) => name === 'translate'
            ? (x, y) => footprints.push({ x, y }) : () => {}, set: () => true });
        t.drawMovement(ctx, -100, -100, 200, 200, unit, []);
        assert.ok(footprints.some(p => p.y < 19) && footprints.some(p => p.y > 19), `${type} leaves marks on both sides`);
        for (let i = 0; i < 60; i++) t.updateMovement(unit, [], [], type);
        assert.ok(t.movementStats().marks > 0, 'mech footprints remain a little longer than ordinary snow tracks');
        for (let i = 0; i < 30; i++) t.updateMovement(unit, [], [], type);
        assert.equal(t.movementStats().marks, 0, 'footprints fade away after movement stops');
    }
});

test('chassis turns smoothly through the angle boundary and finishes turning when stopped', () => {
    for (const type of ['normal', 'mechDiy']) {
        const t = terrain();
        const unit = { x: 0, y: 0, w: 38, h: 38, baseAngle: Math.PI - 0.12 };
        t.updateMovement(unit, [], [], type);
        unit.x -= 3; unit.y -= 0.3;
        const start = t.getMotion(unit).angle;
        t.updateMovement(unit, [], [], type);
        const delta = Math.atan2(Math.sin(t.getMotion(unit).angle - start), Math.cos(t.getMotion(unit).angle - start));
        assert.ok(delta > 0 && delta < 0.04, 'crossing +/- pi uses a small turn along the shortest arc');
        for (let i = 0; i < 90; i++) t.updateMovement(unit, [], [], type);
        const target = Math.atan2(-0.3, -3);
        assert.ok(Math.abs(Math.atan2(Math.sin(target - t.getMotion(unit).angle), Math.cos(target - t.getMotion(unit).angle))) < 0.001);
        unit.x += 3;
        const beforeReverse = t.getMotion(unit).angle;
        t.updateMovement(unit, [], [], type);
        assert.ok(Math.abs(t.getMotion(unit).angle - beforeReverse) < 0.11, 'reversing must not snap the chassis');
    }
});

test('one moving tank emits sparse debris and its traces disappear within 1.5 seconds', () => {
    for (const type of ['forest', 'snow', 'desert', 'swamp', 'night', 'rain']) {
        const t = terrain(type), unit = { x: 0, y: 0, w: 38, h: 38 };
        t.updateMovement(unit, [], [], 'normal');
        for (let i = 0; i < 5; i++) { unit.x += 3; t.updateMovement(unit, [], [], 'normal'); }
        assert.equal(t.movementStats().particles, 0, 'no continuous shower for every few pixels');
        unit.x += 3; t.updateMovement(unit, [], [], 'normal');
        assert.equal(t.movementStats().particles, 2, 'one small piece of debris per track');
        for (let i = 0; i < 90; i++) t.updateMovement(unit, [], [], 'normal');
        assert.equal(t.movementStats().particles, 0); assert.equal(t.movementStats().marks, 0);
    }
});

test('hovering tanks leave no driving traces and illuminat leaves a lasting sign after three seconds', () => {
    const drawing = new Proxy({}, { get: (_target, name) => {
        if (name === 'createRadialGradient') return () => ({ addColorStop() {} });
        return () => {};
    }, set: () => true });
    const context = { window: { currentTerrain: 'forest' }, document: {
        createElement: () => ({ getContext: () => drawing })
    } };
    vm.runInNewContext(source, context);
    const t = context.window.GameTerrain, unit = { x: 0, y: 0, w: 38, h: 38, alive: true, turretAngle: 0.7 };
    let drawn = 0, stampAngle;
    const target = new Proxy({}, { get: (_target, name) => name === 'drawImage' ? () => { drawn++; }
        : name === 'rotate' ? angle => { stampAngle = angle; } : () => {}, set: () => true });
    t.updateMovement(unit, [], [], 'air');
    for (let i = 0; i < 150; i++) { unit.x += 2; t.updateMovement(unit, [], [], 'air'); }
    assert.equal(t.movementStats().marks, 0); assert.equal(t.movementStats().particles, 0);
    t.resetBattle();
    t.updateMovement(unit, [], [], 'illuminat');
    for (let i = 0; i < 179; i++) t.updateMovement(unit, [], [], 'illuminat');
    t.drawMovement(target, -1000, -1000, 1000, 1000, unit, []);
    assert.equal(drawn, 0, 'sign must not appear early');
    t.updateMovement(unit, [], [], 'illuminat');
    t.drawMovement(target, -1000, -1000, 1000, 1000, unit, []);
    assert.equal(drawn, 1, 'sign appears after three seconds');
    assert.ok(Math.abs(stampAngle - (unit.turretAngle + Math.PI / 2)) < 1e-10, 'sign points in the aiming direction');
    for (let i = 0; i < 600; i++) t.updateMovement(unit, [], [], 'illuminat');
    drawn = 0; t.drawMovement(target, -1000, -1000, 1000, 1000, unit, []);
    assert.equal(drawn, 1, 'one sign stays without fading or repeated stamping');
    unit.x += 40; t.updateMovement(unit, [], [], 'illuminat');
    for (let i = 0; i < 180; i++) t.updateMovement(unit, [], [], 'illuminat');
    drawn = 0; t.drawMovement(target, -1000, -1000, 1000, 1000, unit, []);
    assert.equal(drawn, 2, 'a later stop leaves another permanent sign');
    t.resetBattle(); drawn = 0; t.drawMovement(target, -1000, -1000, 1000, 1000, unit, []);
    assert.equal(drawn, 0, 'starting a battle clears the previous map');
});

test('each Illuminat keeps only the two newest signs', () => {
    const t = terrain();
    const unit = { x: 0, y: 0, w: 38, h: 38, alive: true, team: 0 };
    t.updateMovement(unit, [], [], 'illuminat');
    const stop = () => { for (let tick = 0; tick < 180; tick++) t.updateMovement(unit, [], [], 'illuminat'); };
    stop();
    unit.x += 55; t.updateMovement(unit, [], [], 'illuminat'); stop();
    unit.x += 55; t.updateMovement(unit, [], [], 'illuminat'); stop();
    const marks = [];
    t.forEachIlluminatMark(mark => marks.push(mark));
    assert.equal(marks.length, 2);
    assert.equal(marks[0].x, 74);
    assert.equal(marks[1].x, 129);
    assert.ok(marks.every(mark => mark.team === 0 && mark.owner === unit));
    t.resetBattle();
    const cleared = [];
    t.forEachIlluminatMark(mark => cleared.push(mark));
    assert.equal(cleared.length, 0);
});

test('Illuminat super ignites only its own marks for two simulated seconds', () => {
    const drawing = new Proxy({}, { get: (_target, name) => {
        if (name === 'createRadialGradient' || name === 'createLinearGradient') return () => ({ addColorStop() {} });
        return () => {};
    }, set: () => true });
    const context = { window: { currentTerrain: 'forest', frameCount: 0 }, document: {
        createElement: () => ({ getContext: () => drawing })
    } };
    vm.runInNewContext(source, context);
    const t = context.window.GameTerrain;
    const player = { x: 0, y: 0, w: 38, h: 38, alive: true };
    const enemy = { x: 150, y: 0, w: 38, h: 38, alive: true, tankType: 'illuminat' };
    t.updateMovement(player, [enemy], [], 'illuminat');
    for (let i = 0; i < 180; i++) t.updateMovement(player, [enemy], [], 'illuminat');
    let images = 0;
    const target = new Proxy({}, { get: (_target, name) => name === 'drawImage' ? () => { images++; } : () => {}, set: () => true });
    const draw = () => { images = 0; t.drawMovement(target, -1000, -1000, 1000, 1000, player, []); return images; };
    assert.equal(draw(), 2, 'both signs start without fire');
    t.activateIlluminatSuper(player);
    const firstFrame = t.illuminatSuperStrength(player);
    assert.ok(firstFrame > 0 && firstFrame < 0.1, 'the fire and eye begin fading in');
    assert.equal(draw(), 3, 'only the activating player’s sign burns');
    context.window.frameCount = 15;
    assert.equal(t.illuminatSuperStrength(player), 1, 'the effect reaches full strength gradually');
    context.window.frameCount = 60;
    t.activateIlluminatSuper(enemy);
    assert.equal(draw(), 4, 'both owners can ignite their own signs');
    context.window.frameCount = 120;
    assert.equal(t.isIlluminatSuperActive(player), false);
    assert.equal(t.isIlluminatSuperActive(enemy), true);
    assert.equal(draw(), 3, 'the first fire stops while the second remains');
    context.window.frameCount = 170;
    assert.ok(t.illuminatSuperStrength(enemy) > 0 && t.illuminatSuperStrength(enemy) < 1,
        'the eye and fire fade out before the ability ends');
    context.window.frameCount = 180;
    assert.equal(draw(), 2, 'both signs remain after the visual effect ends');
});

test('Egyptian wheel marks keep their sandy color on other terrains', () => {
    for (const type of ['forest', 'snow', 'rain', 'swamp']) {
        const t = terrain(type), unit = { x: 0, y: 0, w: 38, h: 38, alive: true };
        t.updateMovement(unit, [], [], 'egyptian');
        for (let i = 0; i < 5; i++) { unit.x += 3; t.updateMovement(unit, [], [], 'egyptian'); }
        const strokes = [];
        const ctx = new Proxy({}, { get: (target, name) => name === 'stroke'
            ? () => strokes.push(target.strokeStyle) : () => {}, set: (target, name, value) => { target[name] = value; return true; } });
        t.drawMovement(ctx, -100, -100, 200, 200, unit, []);
        assert.ok(strokes.includes('#85653b') && strokes.includes('#c6a16c'), `${type} uses sandy wheel marks`);
    }
});

test('wall coatings are cached per wall without cycling through shared variants', () => {
    let created = 0;
    const drawing = new Proxy({}, { get: (_target, name) => {
        if (name === 'createLinearGradient' || name === 'createRadialGradient') return () => ({ addColorStop() {} });
        return () => {};
    }, set: () => true });
    const context = { window: {}, document: { createElement: () => {
        created++;
        return { getContext: () => drawing };
    } } };
    vm.runInNewContext(source, context);
    const images = [];
    const output = { drawImage: image => images.push(image) };
    const walls = Array.from({ length: 160 }, (_, i) => ({ type: 'wall', x: i * 50, y: 100, w: 50, h: 50 }));
    for (const wall of walls) context.window.GameTerrain.drawWallCover(output, wall, 'snow');
    assert.equal(new Set(images).size, walls.length);
    for (const wall of walls) context.window.GameTerrain.drawWallCover(output, wall, 'snow');
    assert.equal(created, walls.length, 'revisiting more than 128 walls must reuse their coatings');
    for (let i = 0; i < walls.length; i++) assert.equal(images[i], images[i + walls.length]);
});

test('box textures differ by biome and remain stable when pushed', () => {
    let created = 0;
    const gradientColors = [];
    const fills = [];
    const drawing = new Proxy({}, { get: (target, name) => {
        if (name === 'createLinearGradient') return () => ({ addColorStop: (_stop, color) => gradientColors.push(color) });
        if (name === 'fillRect') return () => fills.push(target.fillStyle);
        return () => {};
    }, set: (target, name, value) => { target[name] = value; return true; } });
    const context = { window: {}, document: { createElement: () => {
        created++;
        return { getContext: () => drawing };
    } } };
    vm.runInNewContext(source, context);
    const images = [];
    const output = { drawImage: image => images.push(image) };
    const game = context.window.GameTerrain;
    const box = { type: 'box', x: 100, y: 150, w: 50, h: 50 };
    const baseColors = [];
    for (const type of ['forest', 'snow', 'desert', 'swamp', 'rain']) {
        const before = gradientColors.length;
        game.drawBox(output, box, type);
        baseColors.push(gradientColors[before]);
    }
    assert.equal(created, 5);
    assert.equal(new Set(baseColors.slice(0, 4)).size, 4, 'forest, snow, desert and swamp use distinct wood');
    assert.equal(baseColors[4], baseColors[0], 'rain uses the same oak wood as forest');
    assert.ok(fills.includes('rgba(28,39,37,0.32)'), 'rain adds a wet darkening layer');
    assert.equal(new Set(images).size, 5, 'each biome creates its own texture');
    box.x += 20;
    game.drawBox(output, box, 'rain');
    assert.equal(created, 5, 'pushing does not regenerate the texture');
    assert.equal(images[5], images[4]);
});

test('night sight stops at walls, boxes and barrels and reaches its radius in the open', () => {
    const t = terrain();
    const open = t.visibilityPolygon(0, 0, 320, []);
    const east = points => points.find(p => Math.abs(p.y) < 0.001 && p.x > 0);
    assert.ok(Math.abs(east(open).x - 320) < 0.001);
    for (const type of ['wall', 'woodenWall', 'box', 'barrel']) {
        const blocked = t.visibilityPolygon(0, 0, 320, [{ type, x: 80, y: -30, w: 30, h: 60 }]);
        assert.ok(Math.abs(east(blocked).x - 80) < 0.001, `${type} should block sight`);
    }
    const front = { type: 'wall', x: 80, y: -30, w: 30, h: 60 };
    const hidden = { type: 'box', x: 160, y: -10, w: 20, h: 20 };
    const visibleBlockers = new Set();
    t.visibilityPolygon(0, 0, 320, [front, hidden], visibleBlockers);
    assert.ok(visibleBlockers.has(front));
    assert.ok(!visibleBlockers.has(hidden), 'an obstacle behind a wall must stay hidden');
    const dense = [];
    for (let y = -350; y < 350; y += 25) {
        for (let x = -350; x < 350; x += 25) {
            dense.push({ type: 'wall', x, y, w: 20, h: 20 });
        }
    }
    assert.ok(t.visibilityPolygon(0, 0, 320, dense).length <= 384);
});
