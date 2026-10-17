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

function canvasContext(initialFill = '#initial') {
    const state = {
        fillStyle: initialFill, strokeStyle: '#initial-stroke', lineWidth: 1,
        shadowColor: '#initial-shadow', shadowBlur: 0, globalAlpha: 1,
        globalCompositeOperation: 'source-over', lineCap: 'butt', lineJoin: 'miter'
    };
    const stack = [];
    const calls = [];
    const gradient = () => ({ addColorStop() {} });
    const ctx = new Proxy(state, {
        get(target, prop) {
            if (prop === 'save') return () => stack.push({ ...target });
            if (prop === 'restore') return () => {
                assert.ok(stack.length, 'Canvas state was restored without a matching save');
                Object.assign(target, stack.pop());
            };
            if (prop === 'createRadialGradient' || prop === 'createLinearGradient') return gradient;
            if (prop === 'fillRect') return (...args) => calls.push({ kind: 'fillRect', color: target.fillStyle, args });
            if (prop === 'fill' || prop === 'fillText') return () => calls.push({ kind: 'fill', color: target.fillStyle });
            if (prop === 'stroke' || prop === 'strokeRect' || prop === 'strokeText') return () => calls.push({ kind: 'stroke', color: target.strokeStyle });
            if (prop in target) return target[prop];
            return () => {};
        }
    });
    return { ctx, state, stack, calls };
}

function draw(bullets, initialFill = '#initial') {
    const canvas = canvasContext(initialFill);
    renderBullets.runInNewContext({
        ctx: canvas.ctx, bullets, isVisible: () => true,
        window: { effectsEnabled: false }, particles: []
    });
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
