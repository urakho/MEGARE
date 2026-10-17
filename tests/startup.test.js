const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const source = fs.readFileSync(path.join(__dirname, '..', 'src', 'main.js'), 'utf8');
const start = source.indexOf('window.frameCount = 0;');
const end = source.indexOf('// Function to set selected tank', start);

test('game loop waits until later scripts have loaded', () => {
    let onLoad;
    let mobileHudUpdates = 0;
    const frames = [];
    const context = vm.createContext({
        window: { addEventListener: (event, handler) => { if (event === 'load') onLoad = handler; } },
        performance: { now: () => 100 },
        requestAnimationFrame: handler => { frames.push(handler); },
        gameState: 'playing',
        _measureGamePhase: (name, action) => action(),
        update: () => {},
        updateMobileHud: () => { mobileHudUpdates++; },
        generateMap: () => {},
        draw: () => {},
        drawCharacterPreviews: () => {},
        console
    });
    vm.runInContext(source.slice(start, end), context);
    assert.equal(frames.length, 0);
    onLoad();
    assert.equal(frames.length, 1);
    frames.shift()(101);
    assert.equal(mobileHudUpdates, 1);
    assert.equal(frames.length, 1);
});
