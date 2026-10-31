const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const read = name => fs.readFileSync(path.join(__dirname, '..', 'src', name), 'utf8');
const main = read('main.js'), editor = read('mapeditor.js'), results = read('win-lose.js');
function loadTerrain(context) {
    context.window ||= {};
    vm.runInNewContext(read('terrain.js'), context);
    context.GameTerrain = context.window.GameTerrain;
}
function section(source, first, last) {
    const start = source.indexOf(first), end = source.indexOf(last, start + first.length);
    assert.ok(start >= 0 && end > start, `Missing section ${first}`);
    return source.slice(start, end);
}

test('duel zone deals 100 HP per simulated second independent of wall clock timing', () => {
    const context = {
        currentMode: 'duel', duelState: { shrinkTimer: 0, shrinkInterval: 10000,
            minX: 50, maxX: 500, minY: 50, maxY: 500, minSize: 100, stepSize: 10 },
        tank: { x: 0, y: 0, w: 38, h: 38, hp: 300, alive: true },
        enemies: [{ x: 0, y: 0, w: 38, h: 38, hp: 300, alive: true }],
        Date: { now: () => 1005 }, Math, isPlayerDamageProtected: () => false,
        spawnParticle() {}, spawnExplosion() {}
    };
    vm.runInNewContext(section(main, 'function updateDuelZone()', 'function update()'), context);
    for (let i = 0; i < 60; i++) context.updateDuelZone();
    assert.ok(Math.abs(context.tank.hp - 200) < 1e-9);
    assert.ok(Math.abs(context.enemies[0].hp - 200) < 1e-9);
});

test('custom map restart resets mech combat state and preserves placed obstacles', () => {
    const window = { innerWidth: 800, innerHeight: 600, mechMaxHpByType: { mechDiy: 420, mechShield: 600 },
        mechMaxSpeedByType: { mechDiy: 2.4, mechShield: 2.3 } };
    const controlledMath = Object.assign(Object.create(Math), { random: () => 0.999 });
    const context = { window, tankType: 'mechDiy', tank: { w: 38, h: 38, team: 0,
            mechEnergy: 2, mechBurstShots: 2, mechShieldActive: false,
            heat: 240, overheated: true, _kvantOverload: true, _kvantOverloadTimer: 300,
            kvantUltActive: true, kvantUltTimer: 200, history: [{ x: 900, y: 900 }],
            _immersionHeatFrame: 100, _immersionIlluminatFrame: 100,
            _immersionElectricFrame: 100, _immersionWaterFrame: 100, _immersionImpactFrame: 100,
            _immersionMusicFrame: 100, _immersionBarrageFrame: 100, _immersionAirFrame: 100, _immersionAirAngle: 1.2 },
        canvas: { style: {} }, document: { getElementById: () => null },
        modeModal: { style: {} }, mainMenu: { style: {} },
        tankMaxHpByType: {}, tankMaxSpeedByType: {}, godMode: false, battleSessionId: 0,
        setTankHP() {}, setTankSpeed() {}, getTankUpgrade: () => 0,
        sanitizeBattleSpawns() {}, draw() {}, Date, Math: controlledMath, lastResultState: null
    };
    loadTerrain(context);
    vm.runInNewContext(section(main, 'function isCustomMapTankType(type)', 'function setTankHP(type)'), context);
    vm.runInNewContext(section(main, 'function resetTankMatchUltState(unit)', '// Apply saved tank type properties'), context);
    const start = main.indexOf('window.startCustomMapMode = function(');
    const end = main.indexOf('    if (typeof draw === \'function\') draw();', start);
    assert.ok(start >= 0 && end > start);
    vm.runInNewContext(main.slice(start, main.indexOf('};', end) + 2), context);
    const box = { type: 'box', x: 110, y: 62, w: 50, h: 50 };
    const spawn = { x: 50, y: 50, w: 50, h: 50 };
    window.startCustomMapMode([box], 900, 700, [{ x: 500, y: 300, w: 50, h: 50 }], [], spawn, 'group', '', '');
    assert.equal(window.currentTerrain, 'rain');
    assert.equal(context.tank.mechEnergy, 110);
    assert.equal(context.tank.mechBurstShots, 0);
    assert.equal(context.tank.heat, 0);
    assert.equal(context.tank.overheated, false);
    assert.equal(context.tank._kvantOverload, false);
    assert.equal(context.tank.kvantUltActive, false);
    assert.equal(context.tank.history.length, 0);
    assert.equal(context.tank._immersionHeatFrame, undefined);
    assert.equal(context.tank._immersionIlluminatFrame, undefined);
    assert.equal(context.tank._immersionElectricFrame, undefined);
    assert.equal(context.tank._immersionWaterFrame, undefined);
    assert.equal(context.tank._immersionImpactFrame, undefined);
    assert.equal(context.tank._immersionMusicFrame, undefined);
    assert.equal(context.tank._immersionBarrageFrame, undefined);
    assert.equal(context.tank._immersionAirFrame, undefined);
    assert.equal(context.tank._immersionAirAngle, undefined);
    assert.equal(context.battleSessionId, 1);
    assert.equal(context.objects.length, 1);
    assert.equal(context.objects[0].x, box.x);
    assert.equal(context.enemies[0].tankType, 'mechShield');
    assert.equal(context.enemies[0].hp, 600);
    assert.equal(context.enemies[0].speed, 2.3);
    context.tankMaxHpByType.pyro = 420;
    context.tankMaxSpeedByType = { pyro: 2.75 };
    const enemy = { x: 500, y: 300, w: 50, h: 50, tankType: 'pyro' };
    const ally = { x: 300, y: 200, w: 50, h: 50, tankType: 'mechDiy' };
    for (let restart = 0; restart < 2; restart++) {
        window.startCustomMapMode([box], 900, 700, [enemy], [ally], spawn, 'solo', '', '');
        assert.equal(context.enemies[0].tankType, 'pyro');
        assert.equal(context.enemies[0].hp, 420);
        assert.equal(context.enemies[0].speed, 2.75);
        assert.equal(context.enemies[0].team, 2);
        assert.equal(context.allies[0].tankType, 'mechDiy');
        assert.equal(context.allies[0].hp, 420);
        assert.equal(context.allies[0].speed, 2.4);
        assert.equal(context.allies[0].team, 0);
        assert.equal(window._customMapParams.enemySpawns[0].tankType, 'pyro');
        assert.equal(window._customMapParams.allySpawns[0].tankType, 'mechDiy');
    }
});

test('editor assigns, replaces, undoes and saves each bot vehicle independently', () => {
    const saved = {};
    const context = { window: {}, meObjects: [], undoStack: [], activeTool: 'enemy', gridSize: 50, curWorldW: 900, curWorldH: 700,
        botModal: { style: { display: 'none' } }, botTankSelect: { value: '', focus() {} }, botTitle: {}, selectedBot: null,
        isDrawing: false, isPanning: false, tankMaxHpByType: { pyro: 420, ice: 300, mechRocket: 600 },
        toWorld: (x, y) => ({ wx: x, wy: y }), snapToGrid: (x, y) => ({ gx: Math.floor(x / 50) * 50, gy: Math.floor(y / 50) * 50 }),
        showEditorToast() {}, updateHUD() {}, render() {}, MAX_ENEMIES: 75, MAX_ALLIES: 40, MAX_OBJECTS: 750,
        STORAGE_KEY: 'me_maps', MEG_VERSION: 1, enemyMode: 'group', customWinMsg: '', customLoseMsg: '',
        localStorage: { getItem: key => saved[key] || null, setItem: (key, value) => { saved[key] = value; } } };
    vm.runInNewContext(section(editor, '    function overlaps(a, b)', '    function pushUndo()'), context);
    vm.runInNewContext(section(main, 'function isCustomMapTankType(type)', 'function setTankHP(type)'), context);
    vm.runInNewContext(section(editor, '    function closeBotSettings()', '    function listMaps()'), context);
    vm.runInNewContext(section(editor, '    function pushUndo()', '    function updateHUD()'), context);
    vm.runInNewContext(section(editor, '    function placeAt(canvasX, canvasY)', '    function showEditorToast('), context);
    vm.runInNewContext(section(editor, '    function listMaps()', '    function validateMegData(data)'), context);
    context.placeAt(25, 25);
    context.activeTool = 'ally'; context.placeAt(75, 25);
    assert.equal(context.meObjects[0].tankType, undefined, 'new markers use random vehicles');
    context.activeTool = 'wall';
    assert.equal(context.openBotSettingsAt(25, 25), true, 'click selects a bot independently of the placement tool');
    const undoBeforeCancel = context.undoStack.length;
    context.botTankSelect.value = 'pyro'; context.closeBotSettings();
    assert.equal(context.meObjects[0].tankType, undefined, 'cancel leaves the bot unchanged');
    assert.equal(context.undoStack.length, undoBeforeCancel);
    context.openBotSettingsAt(25, 25); context.botTankSelect.value = 'pyro'; context.applyBotTank();
    context.openBotSettingsAt(75, 25); context.botTankSelect.value = 'ice'; context.applyBotTank();
    assert.equal(context.meObjects[0].tankType, 'pyro');
    assert.equal(context.meObjects[1].tankType, 'ice');
    context.openBotSettingsAt(25, 25);
    assert.equal(context.botTankSelect.value, 'pyro', 'picker restores this particular bot’s current vehicle');
    context.botTankSelect.value = 'mechRocket'; context.applyBotTank();
    assert.equal(context.meObjects.length, 2);
    assert.equal(context.meObjects[0].tankType, 'mechRocket');
    assert.equal(context.meObjects[1].tankType, 'ice');
    context.undo(); assert.equal(context.meObjects[0].tankType, 'pyro');
    context.saveMap('Typed map', context.meObjects);
    const map = JSON.parse(saved.me_maps)['Typed map'];
    assert.equal(map.objects[0].tankType, 'pyro'); assert.equal(map.objects[1].tankType, 'ice');
    let exported;
    context.Blob = class { constructor(parts) { exported = JSON.parse(parts[0]); } };
    context.URL = { createObjectURL: () => 'blob:map', revokeObjectURL() {} };
    context.document = { createElement: () => ({ click() {} }) };
    context.nameInput = { value: 'Typed map' };
    vm.runInNewContext(section(editor, '    function exportMeg()', '    function importMeg(file)'), context);
    context.exportMeg();
    assert.equal(exported.v, 1, 'typed markers remain compatible with the map file version');
    assert.equal(exported.objects[0].tankType, 'pyro'); assert.equal(exported.objects[1].tankType, 'ice');
    context.openBotSettingsAt(25, 25); context.botTankSelect.value = ''; context.applyBotTank();
    assert.equal(context.meObjects[0].tankType, undefined, 'random choice removes the fixed type');
    context.activeTool = 'erase';
    assert.equal(context.openBotSettingsAt(25, 25), false, 'eraser still removes bots instead of opening the picker');
    context.placeAt(25, 25);
    assert.equal(context.meObjects.length, 1);
    assert.equal(context.meObjects[0].type, 'ally');
});

test('map import rejects invalid objects and obstacles overlapping player spawn', () => {
    const context = { MAX_OBJECTS: 750, MAX_ENEMIES: 75, MAX_ALLIES: 40, MEG_VERSION: 1,
        OBJ_TYPES: { wall: {}, woodenWall: {}, box: {}, barrel: {}, enemy: {}, ally: {}, player: {} },
        tankMaxHpByType: { normal: 300, pyro: 420, boss_hell: 7500 }, window: { mechMaxHpByType: { mechRocket: 600 } } };
    vm.runInNewContext(section(main, 'function isCustomMapTankType(type)', 'function setTankHP(type)'), context);
    vm.runInNewContext(section(editor, '    function validateMegData(data)', '    function pushUndo()'), context);
    const validate = objects => context.validateMegData({ v: 1, worldW: 900, worldH: 700, objects });
    assert.equal(typeof validate([null]), 'string');
    assert.equal(typeof validate([{ type: 'wall', x: 0, y: 0, w: -10, h: 50 }]), 'string');
    assert.equal(typeof validate([{ type: 'wall', x: 0, y: 0, w: 50, h: 50 },
        { type: 'player', x: 0, y: 0, w: 50, h: 50 }]), 'string');
    assert.equal(validate([{ type: 'wall', x: 50, y: 0, w: 50, h: 50 },
        { type: 'player', x: 0, y: 0, w: 50, h: 50 }]), null);
    assert.equal(typeof validate([{ type: 'wall', x: 50, y: 50, w: 100, h: 50 },
        { type: 'box', x: 100, y: 50, w: 50, h: 50 }]), 'string');
    assert.equal(validate([{ type: 'woodenWall', x: 50, y: 50, w: 100, h: 50 },
        { type: 'box', x: 150, y: 50, w: 50, h: 50 }]), null);
    for (const type of ['enemy', 'ally']) {
        const marker = { type, x: 100, y: 100, w: 50, h: 50 };
        for (const tankType of [undefined, '', 'normal', 'pyro', 'mechRocket']) assert.equal(validate([{ ...marker, tankType }]), null);
        for (const tankType of ['missing', 'boss_hell', '__proto__', 123, null]) assert.equal(typeof validate([{ ...marker, tankType }]), 'string');
    }
});

test('editor prevents placing a block on a player spawn in either order', () => {
    const context = { meObjects: [], activeTool: 'player', gridSize: 50, curWorldW: 900, curWorldH: 700,
        toWorld: (x, y) => ({ wx: x, wy: y }),
        snapToGrid: (x, y) => ({ gx: Math.floor(x / 50) * 50, gy: Math.floor(y / 50) * 50 }),
        showEditorToast() {}, updateHUD() {}, render() {},
        MAX_ENEMIES: 75, MAX_ALLIES: 40, MAX_OBJECTS: 750
    };
    vm.runInNewContext(section(editor, '    function overlaps(a, b)', '    function pushUndo()'), context);
    vm.runInNewContext(section(editor, '    function placeAt(canvasX, canvasY)', '    function showEditorToast('), context);
    context.placeAt(25, 25);
    context.activeTool = 'wall';
    context.placeAt(25, 25);
    assert.equal(context.meObjects.length, 1);
    context.placeAt(75, 25);
    assert.equal(context.meObjects.length, 2);
    context.activeTool = 'player';
    context.placeAt(75, 25);
    assert.equal(context.meObjects.find(o => o.type === 'player').x, 0);
    context.meObjects = [{ type: 'woodenWall', x: 100, y: 100, w: 100, h: 50 }];
    context.activeTool = 'box';
    context.placeAt(175, 125);
    assert.equal(context.meObjects.length, 1, 'a different grid cell can still belong to an existing large wall');
    context.placeAt(225, 125);
    assert.equal(context.meObjects.length, 2, 'touching edges must remain allowed');
});

test('importing a map with an existing name keeps both maps', () => {
    const store = new Map([['me_maps', JSON.stringify({ Arena: { objects: [{ type: 'box' }] } })]]);
    const storage = { getItem: key => store.get(key) ?? null, setItem: (key, value) => store.set(key, value) };
    class FileReaderMock { readAsText(file) { this.onload({ target: { result: file } }); } }
    const context = { localStorage: storage, STORAGE_KEY: 'me_maps', MEG_VERSION: 1,
        FileReader: FileReaderMock, Date, MAP_SIZES: { small: { w: 900, h: 700 } },
        nameInput: { value: '' }, mapSizeSelect: { value: '' }, enemyModeSelect: { value: '' },
        winMsgInput: { value: '' }, loseMsgInput: { value: '' },
        window: { deviceModeMobile: false }, validateMegData: () => null,
        pushUndo() {}, updateHUD() {}, render() {}, showEditorToast() {}
    };
    loadTerrain(context);
    vm.runInNewContext(section(editor, '    function listMaps()', '    function validateMegData(data)'), context);
    vm.runInNewContext(section(editor, '    function importMeg(file)', '    function launchCustomMap('), context);
    context.importMeg(JSON.stringify({ name: 'Arena', objects: [{ type: 'player', x: 50, y: 50, w: 50, h: 50 },
        { type: 'enemy', x: 300, y: 200, w: 50, h: 50, tankType: 'pyro' },
        { type: 'ally', x: 100, y: 100, w: 50, h: 50, tankType: 'mechRocket' }],
        worldW: 900, worldH: 700, enemyMode: 'solo', terrainType: 'snow', customWinMsg: 'Новая победа' }));
    const maps = JSON.parse(store.get('me_maps'));
    assert.ok(maps.Arena);
    assert.ok(maps['Arena (импорт 2)']);
    assert.equal(maps['Arena (импорт 2)'].customWinMsg, 'Новая победа');
    assert.equal(context.nameInput.value, 'Arena (импорт 2)');
    assert.equal(maps['Arena (импорт 2)'].terrainType, undefined);
    assert.equal(maps['Arena (импорт 2)'].objects[1].tankType, 'pyro');
    assert.equal(maps['Arena (импорт 2)'].objects[2].tankType, 'mechRocket');
});

test('playing a saved map uses that map’s messages', () => {
    let launched;
    const runtime = { map: { enemyMode: 'solo', terrainType: 'night', customWinMsg: 'Победа карты', customLoseMsg: 'Поражение карты',
            objects: [], worldW: 900, worldH: 700 }, mapsModal: { style: {} },
        enemyMode: 'group', customWinMsg: 'Старое сообщение', customLoseMsg: 'Старое поражение',
        playBtn: {} };
    loadTerrain(runtime);
    runtime.launchCustomMap = () => { launched = [runtime.customWinMsg, runtime.customLoseMsg]; return true; };
    vm.runInNewContext(section(editor, '                playBtn.onclick = () => {', '                const delBtn ='), runtime);
    runtime.playBtn.onclick();
    assert.deepEqual(launched, ['Победа карты', 'Поражение карты']);
});

test('creating a profile does not change the previous profile title', () => {
    let saveHandler, created = false;
    const store = new Map([['playerTitle', 'original']]);
    const runtime = {
        profileEditSave: { addEventListener: (_event, handler) => { saveHandler = handler; } },
        document: { getElementById: id => id === 'profileEditName' ? { value: 'Новый игрок' } : null },
        localStorage: { getItem: key => store.get(key), setItem: (key, value) => store.set(key, value) },
        _profileEditIdx: -1, _profileEditAvatar: '🎮', _profileEditTitleId: 'unlocked',
        window: { createProfile: () => { created = true; } }, saveProgress() {}
    };
    vm.runInNewContext(section(main, "if (profileEditSave) profileEditSave.addEventListener('click', () => {", '// Edit modal: Cancel'), runtime);
    saveHandler();
    assert.equal(created, true);
    assert.equal(store.get('playerTitle'), 'original');
});

test('flawless victory has a reachable outcome and boss bonuses match displayed reward', () => {
    const outcome = { tank: { hp: 300 }, playerMaxHpAtStart: 300, currentMode: 'bossfight',
        gameStartTime: 1, enemies: [], Date: { now: () => 100001 }, Math };
    vm.runInNewContext(section(results, 'function determineOutcomeType(isWin)', '// Message library'), outcome);
    assert.equal(outcome.determineOutcomeType(true), 'hard');
    outcome.tank.hp = 290;
    assert.equal(outcome.determineOutcomeType(true), 'crushing');
    outcome.enemies = [{ isBoss: true, phase: 2, hp: 2000 }];
    assert.equal(outcome.determineOutcomeType(false), 'overwhelm');

    const element = () => ({ style: {}, textContent: '', innerHTML: '' });
    const ui = { resultOverlay: element(), resultStatus: element(), resultModeLabel: element(),
        resultEmblem: element(), resultHeadline: element(), resultMessage: element(),
        resultReward: element(), resultEditor: null };
    const game = { ...ui, window: { _customMapActive: false }, currentMode: 'bossfight',
        gameState: 'win', lastResultState: null, coins: 300, trophies: 25,
        tankType: 'normal', tank: { hp: 300 }, Math, console: { log() {}, error() {} },
        determineOutcomeType: () => 'crushing', describeMode: () => 'Босс',
        getResultMessages: () => ({ bossfight: { win: { crushing: ['Победа'] } } }),
        addIndividualTankTrophies() {}, saveProgress() {}
    };
    vm.runInNewContext(section(results, 'let immersionDeath = null;', '// Determine outcome type'), game);
    vm.runInNewContext(section(results, 'function syncResultOverlay(state = gameState)', 'window.syncResultOverlay = syncResultOverlay;'), game);
    game.syncResultOverlay('win');
    assert.equal(game.coins, 400);
    assert.equal(game.trophies, 35);
    assert.match(game.resultReward.textContent, /400 монет, \+35 трофеев/);
});

test('immersion starts disabled and restores only an explicit saved opt-in', () => {
    const code = section(main, 'window.immersionEnabled =', 'window.deviceModeMobile =');
    for (const [saved, expected] of [[null, false], ['false', false], ['true', true]]) {
        const context = { window: {}, localStorage: { getItem: key => { assert.equal(key, 'settingImmersion'); return saved; } } };
        vm.runInNewContext(code, context);
        assert.equal(context.window.immersionEnabled, expected);
    }
});

test('immersive defeat finishes its blast before showing results and cannot leak across battles', () => {
    let now = 0, saves = 0;
    const game = { window: { immersionEnabled: true, _customMapActive: true }, document: { hidden: false },
        performance: { now: () => now }, battleSessionId: 1, currentMode: 'custom', gameState: 'lose',
        tank: { hp: 0, alive: false }, resultOverlay: { style: {} }, lastResultState: 'playing',
        resultStatus: null, resultModeLabel: null, resultEmblem: null, resultHeadline: null,
        resultMessage: null, resultReward: null, resultEditor: null,
        console: { log() {}, error() {} }, determineOutcomeType: () => 'normal', saveProgress: () => saves++ };
    vm.runInNewContext(section(results, 'let immersionDeath = null;', '// Determine outcome type'), game);
    vm.runInNewContext(section(results, 'function syncResultOverlay(state = gameState)', 'window.syncResultOverlay = syncResultOverlay;'), game);
    game.syncResultOverlay('lose');
    assert.equal(game.resultOverlay.style.display, 'none');
    assert.equal(saves, 0);
    for (let frame = 1; frame < 20; frame++) { now = frame * 50; game.advanceImmersionDeath(now); game.syncResultOverlay('lose'); }
    assert.equal(game.resultOverlay.style.display, 'none');
    now = 1000; game.advanceImmersionDeath(now); game.syncResultOverlay('lose');
    assert.equal(game.resultOverlay.style.display, 'flex');
    assert.equal(saves, 1);
    game.syncResultOverlay('lose');
    assert.equal(saves, 1);
    game.battleSessionId++; game.lastResultState = 'playing';
    game.syncResultOverlay('lose');
    game.document.hidden = true; now += 10000;
    assert.equal(game.advanceImmersionDeath(now).elapsed, 0);
    game.document.hidden = false;
    game.gameState = 'playing'; game.battleSessionId++;
    assert.equal(game.advanceImmersionDeath(now), null);
    game.syncResultOverlay('playing');
    game.window.immersionEnabled = false; game.gameState = 'lose';
    game.syncResultOverlay('lose');
    assert.equal(game.resultOverlay.style.display, 'flex');
    assert.equal(saves, 2, 'disabled immersion shows the result immediately');
});

test('replaced chromatic reward stops its canvas animation', () => {
    const items = Object.fromEntries(['rewardModal', 'rewardTitle', 'rewardIconContainer',
        'rewardAmount', 'rewardDesc', 'rewardClaimBtn', 'rewardIcon'].map(id => [id,
        { style: {}, classList: { add() {}, remove() {} }, appendChild() {}, setAttribute() {}, isConnected: true }]));
    let nextId = 0, draws = 0, rewardCanvas;
    const frames = new Map(), cancelled = [];
    const context = {
        document: { getElementById: id => items[id], querySelector: () => ({ style: {} }),
            createElement: type => type === 'canvas'
                ? (rewardCanvas = { style: {}, isConnected: true, getContext: () => ({ clearRect() {}, fillRect() { draws++; } }) })
                : { style: {}, classList: {}, appendChild() {} } },
        window: { tankDescriptions: { time: { name: 'Время', rarity: 'Хроматическая' } } },
        requestAnimationFrame: callback => { frames.set(++nextId, callback); return nextId; },
        cancelAnimationFrame: id => { cancelled.push(id); frames.delete(id); },
        drawTankOn() {}, setTimeout() {}, Date, Math
    };
    vm.runInNewContext(section(main, 'function showReward(type, amount, desc, tankType = null, options = {})', 'function openMiniContainer('), context);
    context.showReward('tank', 1, '', 'time');
    assert.equal(frames.size, 1);
    const previousFrame = [...frames.values()][0];
    const previousDraws = draws;
    context.showReward('coins', 10, '');
    rewardCanvas.isConnected = false;
    assert.equal(frames.size, 0);
    assert.deepEqual(cancelled, [1]);
    previousFrame();
    assert.equal(draws, previousDraws);
});


test('editor places one-cell barrels and keeps cell placement and erasing consistent', () => {
    const context = { meObjects: [], activeTool: 'barrel', gridSize: 50, curWorldW: 900, curWorldH: 700,
        toWorld: (x, y) => ({ wx: x, wy: y }), snapToGrid: (x, y) => ({ gx: Math.floor(x / 50) * 50, gy: Math.floor(y / 50) * 50 }),
        showEditorToast() {}, updateHUD() {}, render() {}, MAX_ENEMIES: 75, MAX_ALLIES: 40, MAX_OBJECTS: 750 };
    vm.runInNewContext(section(editor, '    function overlaps(a, b)', '    function pushUndo()'), context);
    vm.runInNewContext(section(editor, '    function placeAt(canvasX, canvasY)', '    function showEditorToast('), context);
    context.placeAt(25, 25);
    assert.equal(context.meObjects[0].w, 50); assert.equal(context.meObjects[0].h, 50);
    assert.equal(context.meObjects[0].x, 0); assert.equal(context.meObjects[0].y, 0);
    context.placeAt(75, 25);
    assert.equal(context.meObjects.length, 2, 'neighboring cells must fit separate barrels');
    context.placeAt(25, 25);
    assert.equal(context.meObjects.length, 2, 'the barrel occupies its grid cell');
    context.placeAt(875, 675);
    assert.equal(context.meObjects.length, 3, 'the last map cell must also fit a barrel');
    assert.ok(context.meObjects.every(obj => obj.x + obj.w <= 900 && obj.y + obj.h <= 700));
    context.activeTool = 'erase';
    context.placeAt(1, 1);
    assert.equal(context.meObjects.length, 2, 'erasing the cell must remove its barrel');
});
