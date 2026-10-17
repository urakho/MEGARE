const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const read = file => fs.readFileSync(path.join(__dirname, '..', 'src', file), 'utf8');
const main = read('main.js'), mechs = read('mechs.js'), tanks = read('tanks.js');
function section(source, start, end) {
    const from = source.indexOf(start), to = source.indexOf(end, from + start.length);
    assert.ok(from >= 0 && to > from, `Missing section: ${start}`);
    return source.slice(from, to);
}

test('mech previews draw one frame and the shared stop cancels existing preview callbacks', () => {
    const requested = [], cancelled = [], drawn = [];
    const gradient = { addColorStop() {} };
    const canvas = { width: 100, height: 100, getContext: () => ({
        clearRect() {}, fillRect() {}, save() {}, restore() {}, createLinearGradient: () => gradient
    }) };
    const ctx = vm.createContext({
        window: { mechDiyAnimId: 1, mechShieldAnimId: 2, mechRocketAnimId: 3, characterPreviewsAnimId: 4 },
        requestAnimationFrame: fn => { requested.push(fn); return 5; },
        cancelAnimationFrame: id => { cancelled.push(id); },
        drawMechOn: () => drawn.push('diy'), drawMechShieldOn: () => drawn.push('shield'),
        drawMechRocketOn: () => drawn.push('rocket')
    });
    vm.runInContext(section(mechs, 'function drawMechDiyPreview(', '// ── Mech metadata'), ctx);
    vm.runInContext(section(mechs, 'function drawMechShieldPreview(', '// ── Shield active overlay'), ctx);
    vm.runInContext(section(mechs, 'function drawMechRocketPreview(', 'function showMechRocketModal('), ctx);
    ctx.drawMechDiyPreview(canvas, true);
    ctx.drawMechShieldPreview(canvas, true);
    ctx.drawMechRocketPreview(canvas, true);
    assert.deepEqual(drawn, ['diy', 'shield', 'rocket']);
    assert.equal(requested.length, 0);
    vm.runInContext(section(tanks, 'function stopCharacterPreviewAnimations()', 'function drawFrozenOverlay('), ctx);
    ctx.stopCharacterPreviewAnimations();
    assert.deepEqual(cancelled, [4, 1, 2, 3]);
});

test('one loop renders and catches up after a slow frame, without simulating paused time', () => {
    let updates = 0, renders = 0, hudUpdates = 0, paused = false, now = 0;
    const frames = [], listeners = {};
    const ctx = vm.createContext({
        window: { isPaused: () => paused, deviceModeMobile: true, renderActiveGameFrame: () => { renders++; } },
        gameState: 'playing', performance: { now: () => now },
        requestAnimationFrame: fn => { frames.push(fn); },
        document: { addEventListener: (event, fn) => { listeners[event] = fn; } },
        update: () => { if (!paused && ctx.gameState === 'playing') updates++; },
        updateMobileHud: () => { hudUpdates++; }, _measureGamePhase: (name, fn) => fn()
    });
    vm.runInContext(section(main, 'window.frameCount = 0;', '// Инициализация после загрузки'), ctx);
    ctx.gameLoop(200);
    assert.ok(updates >= 11 && updates <= 12);
    assert.equal(renders, 1);
    assert.equal(frames.length, 1);
    ctx.gameLoop(220);
    assert.ok(updates >= 13);
    paused = true;
    const before = updates;
    ctx.gameLoop(1000);
    assert.equal(updates, before);
    paused = false;
    ctx.gameLoop(1017);
    assert.ok(updates <= before + 1);
    ctx.gameState = 'menu';
    const previousHud = hudUpdates;
    ctx.gameLoop(1034);
    assert.equal(hudUpdates, previousHud + 1);
    ctx.gameLoop(1051);
    assert.equal(hudUpdates, previousHud + 1);
    now = 5000;
    listeners.visibilitychange();
});

test('cached menu rendering does not schedule a second world loop', () => {
    let frames = 0, previews = 0;
    const objects = [];
    const ctx = vm.createContext({
        gameState: 'menu', mainMenu: { style: { display: 'flex' } }, canvas: { width: 800, height: 600 }, objects,
        menuBackdropWidth: 800, menuBackdropHeight: 600, menuBackdropObjects: objects, menuBackdropObjectCount: 0,
        drawPreview: () => { previews++; }, updateCoinDisplay: () => {}, requestAnimationFrame: () => { frames++; }
    });
    vm.runInContext(section(tanks, 'function renderGameFrame()', 'let drawLoopStarted = false;'), ctx);
    ctx.renderGameFrame();
    assert.equal(previews, 1);
    assert.equal(frames, 0);
});

test('drawing starts and renders again when window is the global object', () => {
    let previews = 0, scheduled = 0;
    const objects = [];
    const ctx = vm.createContext({
        gameState: 'menu', mainMenu: { style: { display: 'flex' } }, canvas: { width: 800, height: 600 }, objects,
        menuBackdropWidth: 800, menuBackdropHeight: 600, menuBackdropObjects: objects, menuBackdropObjectCount: 0,
        drawPreview: () => { previews++; }, updateCoinDisplay: () => {}, requestAnimationFrame: () => { scheduled++; }
    });
    ctx.window = ctx;
    vm.runInContext(section(tanks, 'function renderGameFrame()', 'const UPGRADE_COSTS'), ctx);
    ctx.renderActiveGameFrame();
    assert.equal(previews, 0);
    ctx.draw();
    ctx.renderActiveGameFrame();
    assert.equal(previews, 2);
    assert.equal(scheduled, 0);
});

test('blocked music waits for interaction before retrying', async () => {
    const listeners = {}, tracks = {};
    let allowed = false, attempts = 0;
    for (const name of ['menuMusic', 'fightMusic', 'duelMusic', 'teamMusic', 'tankMusic', 'exfightMusic', 'bossMusic', 'angryBossMusic']) {
        tracks[name] = {
            paused: true, volume: 1,
            pause() { this.paused = true; },
            play() {
                attempts++;
                if (!allowed) return Promise.reject(Object.assign(new Error('blocked'), { name: 'NotAllowedError' }));
                this.paused = false;
                return Promise.resolve();
            }
        };
    }
    const ctx = vm.createContext({
        ...tracks, window: { musicVolume: 0.5 }, gameState: 'menu', currentMode: 'single', enemies: [],
        performance: { now: () => 100 }, document: { addEventListener: (event, fn) => { listeners[event] = fn; } }
    });
    vm.runInContext(section(main, "let _lastMusicKey = '';", '// Opt-in measurements'), ctx);
    ctx.updateMusic();
    for (let i = 0; i < 100; i++) ctx.updateMusic();
    assert.equal(attempts, 1);
    await new Promise(resolve => setImmediate(resolve));
    for (let i = 0; i < 100; i++) ctx.updateMusic();
    assert.equal(attempts, 1);
    allowed = true;
    listeners.pointerdown({ repeat: false });
    await new Promise(resolve => setImmediate(resolve));
    assert.equal(attempts, 2);
    assert.equal(tracks.menuMusic.paused, false);
    ctx.gameState = 'playing';
    ctx.updateMusic();
    await new Promise(resolve => setImmediate(resolve));
    assert.equal(tracks.menuMusic.paused, true);
    assert.equal(tracks.tankMusic.paused, false);
});

test('performance profiler is opt-in and reports phase counts and durations', () => {
    let now = 0;
    const ctx = vm.createContext({ window: {}, performance: { now: () => now } });
    vm.runInContext(section(main, 'let _gamePerformanceStats = null;', '// ========================'), ctx);
    assert.equal(ctx.window.stopGamePerformanceProfile(), null);
    ctx.window.startGamePerformanceProfile();
    ctx._measureGamePhase('physics', () => { now += 3; });
    ctx._measureGamePhase('physics', () => { now += 5; });
    const result = ctx.window.stopGamePerformanceProfile();
    assert.equal(result.physics.count, 2);
    assert.equal(result.physics.averageMs, 4);
    assert.equal(result.physics.maxMs, 5);
    assert.equal(ctx.window.stopGamePerformanceProfile(), null);
});
