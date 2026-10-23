const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const source = fs.readFileSync(path.join(__dirname, '..', 'src', 'tanks.js'), 'utf8');
const start = source.indexOf('    // 3.5. Пули');
const end = source.indexOf('    // 3.5.4. Электрические лучи', start);
assert.ok(start >= 0 && end > start, 'Bullet drawing section must exist');
const renderBullets = new vm.Script(source.slice(start, end));
const plasmaStart = source.indexOf('function drawPlasmaBolt(');
const plasmaEnd = source.indexOf('function drawWorldGrid(', plasmaStart);
assert.ok(plasmaStart >= 0 && plasmaEnd > plasmaStart);
const renderPlasma = new vm.Script(source.slice(plasmaStart, plasmaEnd));

function canvasContext(initialFill = '#initial') {
    const state = {
        fillStyle: initialFill, strokeStyle: '#initial-stroke', lineWidth: 1,
        shadowColor: '#initial-shadow', shadowBlur: 0, globalAlpha: 1,
        globalCompositeOperation: 'source-over', lineCap: 'butt', lineJoin: 'miter'
    };
    const stack = [];
    const calls = [];
    const gradient = () => ({ addColorStop(position, color) { calls.push({ kind: 'gradient', position, color }); } });
    const ctx = new Proxy(state, {
        get(target, prop) {
            if (prop === 'save') return () => stack.push({ ...target });
            if (prop === 'restore') return () => {
                assert.ok(stack.length, 'Canvas state was restored without a matching save');
                Object.assign(target, stack.pop());
            };
            if (prop === 'createRadialGradient' || prop === 'createLinearGradient') return gradient;
            if (prop === 'arc') return (...args) => calls.push({ kind: 'arc', args });
            if (prop === 'fillRect') return (...args) => calls.push({ kind: 'fillRect', color: target.fillStyle, args });
            if (prop === 'fill' || prop === 'fillText') return () => calls.push({ kind: 'fill', color: target.fillStyle });
            if (prop === 'stroke' || prop === 'strokeRect' || prop === 'strokeText') return () => calls.push({ kind: 'stroke', color: target.strokeStyle });
            if (prop in target) return target[prop];
            return () => {};
        }
    });
    return { ctx, state, stack, calls };
}

function draw(bullets, initialFill = '#initial', nowMs = 0) {
    const canvas = canvasContext(initialFill);
    const context = vm.createContext({
        ctx: canvas.ctx, bullets, isVisible: () => true,
        window: { effectsEnabled: false }, particles: [],
        Date: class extends Date { static now() { return nowMs; } }
    });
    renderPlasma.runInContext(context);
    renderBullets.runInContext(context);
    return canvas;
}

function bullet(type, x = 20) {
    return { type, x, y: 20, w: 9, h: 9, vx: 4, vy: 0, life: 30, maxLife: 60 };
}

test('ordinary shell colors do not depend on the previous canvas color or projectile', () => {
    const solo = draw([bullet('normal')], '#ff0000');
    const afterFire = draw([bullet('fire', 0), bullet('normal')], '#0000ff');
    const afterPlasma = draw([bullet('plasma', 0), bullet('normal')], '#00ff00');
    const rectColors = result => result.calls.filter(call => call.kind === 'fillRect').map(call => call.color);
    assert.deepEqual(rectColors(solo), rectColors(afterFire));
    assert.deepEqual(rectColors(solo), rectColors(afterPlasma));
    assert.notEqual(rectColors(solo)[0], '#ff0000');
    assert.notEqual(rectColors(solo)[0], '#0000ff');
});

test('plasma ultimate has a red texture distinct from the ordinary plasma bolt', () => {
    const normal = draw([bullet('plasma')]);
    const ultimate = draw([bullet('plasmaBlast')]);
    const colors = result => result.calls.filter(call => call.kind === 'gradient').map(call => call.color);
    assert.ok(colors(normal).some(color => color.includes('151,91,240')));
    assert.ok(colors(ultimate).some(color => color.includes('220,21,39')));
    assert.ok(!colors(ultimate).some(color => color.includes('151,91,240')));
    assert.ok(ultimate.calls.filter(call => call.kind === 'stroke').length > normal.calls.filter(call => call.kind === 'stroke').length);
});

test('both plasma projectiles animate while staying in the same place', () => {
    for (const type of ['plasma', 'plasmaBlast']) {
        const first = draw([bullet(type)], '#initial', 0);
        const later = draw([bullet(type)], '#initial', 250);
        const arcs = result => result.calls.filter(call => call.kind === 'arc').map(call => call.args);
        assert.notDeepEqual(arcs(first), arcs(later), `${type} remained static`);
    }
});

test('each projectile restores the canvas state after drawing', () => {
    const types = [
        'normal', 'machinegun', 'fire', 'rocket', 'smallRocket', 'plasma', 'plasmaBlast',
        'toxic', 'megabomb', 'ice', 'musical', 'romanBlade', 'egyptArrow', 'spartanSpear',
        'illuminat', 'mirror', 'imitator', 'kvantMain', 'kvantSide', 'kvantSmall', 'buckshot',
        'electricBall', 'railgun', 'droneBullet', 'medicalPulse', 'meteorMini', 'pyroBullet',
        'airBullet', 'mechDiy', 'kamikazeBullet', 'mechShield', 'mechRocketBullet', 'time', 'myasnoyBio'
    ];
    for (const type of types) {
        const result = draw([bullet(type)]);
        assert.equal(result.stack.length, 0, `${type} left canvas state on the stack`);
        assert.equal(result.state.fillStyle, '#initial', `${type} leaked its fill color`);
        assert.equal(result.state.strokeStyle, '#initial-stroke', `${type} leaked its stroke color`);
        assert.equal(result.state.shadowBlur, 0, `${type} leaked its shadow`);
        assert.equal(result.state.globalAlpha, 1, `${type} leaked its opacity`);
        assert.ok(result.calls.length > 0, `${type} did not draw`);
        assert.ok(result.calls.every(call => call.color !== '#initial' && call.color !== '#initial-stroke'),
            `${type} used an inherited color`);
    }
});
