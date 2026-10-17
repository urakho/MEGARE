const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const main = fs.readFileSync(path.join(__dirname, '..', 'src', 'main.js'), 'utf8');
const physics = fs.readFileSync(path.join(__dirname, '..', 'src', 'physics.js'), 'utf8');
const pause = fs.readFileSync(path.join(__dirname, '..', 'src', 'pause-menu.js'), 'utf8');

function section(source, start, end) {
    const from = source.indexOf(start);
    const to = source.indexOf(end, from + start.length);
    assert.ok(from >= 0 && to > from, `Missing section: ${start}`);
    return source.slice(from, to);
}

function storage() {
    const data = new Map();
    return {
        getItem: key => data.has(key) ? data.get(key) : null,
        setItem: (key, value) => data.set(key, String(value)),
        removeItem: key => data.delete(key)
    };
}

function profileContext(localStorage) {
    const context = vm.createContext({ localStorage, window: {}, console });
    vm.runInContext(section(main, 'const PROFILE_SAVE_KEYS = [', '// Atmospheric titles'), context);
    vm.runInContext(section(main, 'function _profilesLoad()', '/** Switch to profile'), context);
    vm.runInContext(`let coins = Number(localStorage.getItem('tankCoins') ?? 100), gems = 0,
        parts = Number(localStorage.getItem('tankParts') ?? 100), trophies = 0;
        let claimedRewards = [], unlockedTanks = ['normal'],
        tankUpgrades = JSON.parse(localStorage.getItem('tankUpgrades') || '{}');`, context);
    vm.runInContext(section(main, 'function saveTankUpgrades()', '// Returns damage multiplier'), context);
    vm.runInContext(section(main, 'function saveProgress()', '// Camera follow flag'), context);
    return context;
}

test('profile reload preserves purchased upgrades and selected tank', () => {
    const localStorage = storage();
    const ctx = profileContext(localStorage);
    Object.assign(ctx, {
        document: { querySelectorAll: () => [], getElementById: () => null },
        tank: {}, setTankHP: () => {}, setTankSpeed: () => {}
    });
    vm.runInContext("let tankType = 'normal', tankColor = '';", ctx);
    vm.runInContext(section(main, 'window.setSelectedTank = function(selectedType)', '// Function to get current tank type'), ctx);
    vm.runInContext(`parts -= 50; localStorage.setItem('tankParts', parts);
        tankUpgrades.normal = { hp: 1 }; saveTankUpgrades();
        window.setSelectedTank('ice');`, ctx);
    profileContext(localStorage);
    assert.equal(localStorage.getItem('tankParts'), '50');
    assert.deepEqual(JSON.parse(localStorage.getItem('tankUpgrades')), { normal: { hp: 1 } });
    assert.equal(localStorage.getItem('tankSelected'), 'ice');
});

function containerContext(localStorage) {
    const ctx = profileContext(localStorage);
    Object.assign(ctx, {
        containerFlowType: null, containerFlowModal: { style: {}, dataset: {} },
        containerFlowText: { textContent: '' }, containerFlowPreview: {}, containerFlowCancel: { style: {} },
        containerDropArea: null,
        document: { querySelector: () => null }, setTimeout: () => 1, clearTimeout: () => {},
        getRandomInt: () => 1, showNotification: () => {}, updateCoinDisplay: () => {},
        openMiniContainer: () => { vm.runInContext('coins += 10', ctx); return { type: 'coins', amount: 10 }; }
    });
    vm.runInContext(section(main, 'let containerDropTimers = [];', 'if (containerFlowPreview) containerFlowPreview.addEventListener'), ctx);
    vm.runInContext('animateContainerDrops = () => {}', ctx);
    return ctx;
}

test('free containers survive cancellation and reload, and paid opening costs coins', () => {
    const localStorage = storage();
    let ctx = containerContext(localStorage);
    vm.runInContext("showFreeContainerFlow('mini', 2); closeContainerFlow(); showContainerFlow('mini'); handleContainerClick()", ctx);
    assert.equal(vm.runInContext('coins', ctx), 85);
    assert.deepEqual(JSON.parse(localStorage.getItem('pendingFreeContainers')), ['mini', 'mini']);
    ctx = containerContext(localStorage);
    vm.runInContext('processNextContainer(); handleContainerClick()', ctx);
    assert.deepEqual(JSON.parse(localStorage.getItem('pendingFreeContainers')), ['mini']);
    assert.equal(JSON.parse(localStorage.getItem('megare_profiles'))[0].data.tankCoins, '95');
});

test('damage protection prevents lethal hits and special projectiles update independently of drawing', () => {
    let losses = 0;
    const ctx = vm.createContext({
        tank: { x: 100, y: 100, w: 20, h: 20, hp: 10, team: 0, kamikazeInvincible: true },
        tankType: 'kamikaze', currentMode: 'single', gameState: 'playing',
        objects: [], enemies: [], allies: [], worldWidth: 1000, worldHeight: 1000,
        buratinoBarrages: [{ x: 300, y: 300, vx: 3, vy: 0, life: 5, radius: 5 }],
        musicalSoundWaves: [{ x: 110, y: 110, vx: 0, vy: 0, life: 5, radius: 5, damage: 50, team: 1, bounces: 0, maxBounces: 5 }],
        electricRays: [{ life: 3 }],
        isBurovoyBurrowActive: e => e.tankType === 'burovoy' && !!e.burovoyBurrowActive,
        spawnParticle: () => {}, spawnExplosion: () => {}, loseModeTrophies: () => { losses++; },
        syncResultOverlay: () => { losses++; }
    });
    vm.runInContext(section(physics, 'function applyTargetDamageModifiers(', 'function refreshSandstormDebuff('), ctx);
    vm.runInContext(section(physics, 'function applyPharaohSwarmDamage(', 'function updatePharaohSwarm('), ctx);
    vm.runInContext(section(physics, 'function updateSpecialProjectiles()', 'function updatePhysics()'), ctx);
    vm.runInContext('dealDamageToEntity(tank, 100); applyPharaohSwarmDamage(tank, 100); updateSpecialProjectiles()', ctx);
    assert.equal(ctx.tank.hp, 10);
    assert.equal(ctx.gameState, 'playing');
    assert.equal(losses, 0);
    assert.equal(ctx.buratinoBarrages[0].x, 303);
    assert.equal(ctx.electricRays[0].life, 2);
    vm.runInContext("tank.kamikazeInvincible = false; tankType = 'burovoy'; tank.burovoyBurrowActive = true; dealDamageToEntity(tank, 100)", ctx);
    assert.equal(ctx.tank.hp, 10);
    vm.runInContext('tank.burovoyBurrowActive = false; dealDamageToEntity(tank, 5)', ctx);
    assert.equal(ctx.tank.hp, 5);
    vm.runInContext('updateSpecialProjectiles()', ctx);
    assert.equal(ctx.gameState, 'lose');
    assert.equal(losses, 2);
});

test('pause stops simulation, preserves ability timers and returns to menu', () => {
    const listeners = {};
    const elements = Object.fromEntries(['pauseMenu', 'pauseResumeBtn', 'pauseRestartBtn', 'pauseMenuBtn', 'mainMenu'].map(id => [id, {
        style: { display: id === 'mainMenu' ? 'none' : '' },
        addEventListener: (type, fn) => { listeners[id + ':' + type] = fn; }
    }]));
    let now = 1000, returned = 0, musicUpdates = 0;
    const ctx = vm.createContext({
        document: { body: { insertAdjacentHTML: () => {} }, getElementById: id => elements[id] || null, addEventListener: (type, fn) => { listeners[type] = fn; } },
        localStorage: storage(), window: { goToMenuNoReload: () => { returned++; } },
        Date: { now: () => now }, gameState: 'playing', gameStartTime: 500,
        tank: { beamStart: 800, lastHitTime: 900 }, enemies: [], allies: [], keys: { w: true },
        updateMusic: () => { musicUpdates++; }
    });
    vm.runInContext(pause, ctx);
    vm.runInContext(section(main, 'function update() {', 'let _lastDisplayedResources'), ctx);
    ctx.window.openPauseMenu();
    ctx.update();
    assert.equal(musicUpdates, 1);
    assert.equal(ctx.keys.w, false);
    now = 3000;
    listeners['pauseResumeBtn:click']();
    assert.equal(ctx.gameStartTime, 2500);
    assert.equal(ctx.tank.beamStart, 2800);
    ctx.window.openPauseMenu();
    listeners['pauseMenuBtn:click']();
    assert.equal(returned, 1);
    assert.equal(ctx.window.isPaused(), false);
});
