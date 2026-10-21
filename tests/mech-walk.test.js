const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

test('all mech renderers accept simulation gait and preview animation without invalid geometry', () => {
    const source = fs.readFileSync(path.join(__dirname, '..', 'src', 'mechs.js'), 'utf8');
    const context = { window: {}, Date: { now: () => 1000 } };
    vm.runInNewContext(source, context);
    let calls = [];
    const drawing = new Proxy({}, {
        get: (_target, name) => (...args) => {
            for (const arg of args) if (typeof arg === 'number') assert.ok(Number.isFinite(arg), `${name}: invalid geometry`);
            calls.push([name, ...args]);
            if (name === 'createLinearGradient' || name === 'createRadialGradient') return { addColorStop() {} };
        },
        set: (_target, name, value) => {
            if (typeof value === 'number') assert.ok(Number.isFinite(value), `${name}: invalid drawing state`);
            return true;
        }
    });
    for (const [type, renderer] of [['mechDiy', 'drawMechOn'], ['mechShield', 'drawMechShieldOn'], ['mechRocket', 'drawMechRocketOn']]) {
        const frames = [];
        for (const phase of [0, Math.PI / 2, Math.PI, Math.PI * 1.5]) {
            calls = [];
            context[renderer](drawing, 0, 0, 38, 38, 0.3, type, { phase, strength: 1, angle: 0 });
            frames.push(JSON.stringify(calls));
        }
        assert.equal(new Set(frames).size, 4, `${type}: walk phases must produce different poses`);
        context[renderer](drawing, 0, 0, 38, 38, 0, type, { phase: 0.4, strength: 0, angle: 0 });
        context[renderer](drawing, 0, 0, 38, 38, 0, type, 0.4);
    }
});
