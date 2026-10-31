const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

test('menu particles stop requesting frames while hidden and resume when shown', () => {
    const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
    const start = html.indexOf('// ─── Animated background particle system');
    const end = html.indexOf('</script>', start);
    assert.ok(start >= 0 && end > start);
    const script = html.slice(start, end);

    const queued = new Map();
    let nextId = 1;
    let observerCallback;
    const listeners = {};
    const ctx = { clearRect() {} };
    const window = { innerWidth: 800, innerHeight: 600, effectsEnabled: true,
        addEventListener: (name, callback) => { listeners[name] = callback; } };
    const canvas = { width: 0, height: 0, getContext: () => ctx };
    const menu = { style: { display: 'flex' } };
    const document = {
        hidden: false,
        getElementById: id => id === 'mainMenu' ? menu : id === 'bgParticleCanvas' ? canvas : null,
        addEventListener: (name, callback) => { listeners[name] = callback; },
    };
    vm.runInNewContext(script, {
        document,
        window,
        MutationObserver: class { constructor(callback) { observerCallback = callback; } observe() {} },
        requestAnimationFrame: callback => { const id = nextId++; queued.set(id, callback); return id; },
        cancelAnimationFrame: id => queued.delete(id),
    });

    assert.equal(queued.size, 1);
    const [firstId, firstFrame] = queued.entries().next().value;
    queued.delete(firstId);
    firstFrame();
    assert.equal(queued.size, 1);

    menu.style.display = 'none';
    observerCallback();
    assert.equal(queued.size, 0);

    menu.style.display = 'flex';
    observerCallback();
    assert.equal(queued.size, 1);

    window.effectsEnabled = false;
    listeners.effectschange();
    assert.equal(queued.size, 0, 'disabled particles stop the menu loop');
    observerCallback();
    assert.equal(queued.size, 0);
    window.effectsEnabled = true;
    listeners.effectschange();
    assert.equal(queued.size, 1, 'enabling particles restarts a single loop');

    document.hidden = true;
    listeners.visibilitychange();
    assert.equal(queued.size, 0);
    document.hidden = false;
    listeners.visibilitychange();
    assert.equal(queued.size, 1);
});
