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
            kvantUltActive: true, kvantUltTimer: 200, history: [{ x: 900, y: 900 }] },
        canvas: { style: {} }, document: { getElementById: () => null },
        modeModal: { style: {} }, mainMenu: { style: {} },
        tankMaxHpByType: {}, tankMaxSpeedByType: {}, godMode: false, battleSessionId: 0,
        setTankHP() {}, setTankSpeed() {}, getTankUpgrade: () => 0,
        sanitizeBattleSpawns() {}, draw() {}, Date, Math: controlledMath, lastResultState: null
    };
    loadTerrain(context);
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
    assert.equal(context.battleSessionId, 1);
    assert.equal(context.objects.length, 1);
    assert.equal(context.objects[0].x, box.x);
    assert.equal(context.enemies[0].tankType, 'mechShield');
    assert.equal(context.enemies[0].hp, 600);
    assert.equal(context.enemies[0].speed, 2.3);
});

test('map import rejects invalid objects and obstacles overlapping player spawn', () => {
    const context = { MAX_OBJECTS: 750, MAX_ENEMIES: 75, MAX_ALLIES: 40, MEG_VERSION: 1,
        OBJ_TYPES: { wall: {}, woodenWall: {}, box: {}, barrel: {}, enemy: {}, ally: {}, player: {} } };
    vm.runInNewContext(section(editor, '    function validateMegData(data)', '    function pushUndo()'), context);
    const validate = objects => context.validateMegData({ v: 1, worldW: 900, worldH: 700, objects });
    assert.equal(typeof validate([null]), 'string');
    assert.equal(typeof validate([{ type: 'wall', x: 0, y: 0, w: -10, h: 50 }]), 'string');
    assert.equal(typeof validate([{ type: 'wall', x: 0, y: 0, w: 50, h: 50 },
        { type: 'player', x: 0, y: 0, w: 50, h: 50 }]), 'string');
    assert.equal(validate([{ type: 'wall', x: 50, y: 0, w: 50, h: 50 },
        { type: 'player', x: 0, y: 0, w: 50, h: 50 }]), null);
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
    context.importMeg(JSON.stringify({ name: 'Arena', objects: [{ type: 'player', x: 50, y: 50, w: 50, h: 50 }],
        worldW: 900, worldH: 700, enemyMode: 'solo', terrainType: 'snow', customWinMsg: 'Новая победа' }));
    const maps = JSON.parse(store.get('me_maps'));
    assert.ok(maps.Arena);
    assert.ok(maps['Arena (импорт 2)']);
    assert.equal(maps['Arena (импорт 2)'].customWinMsg, 'Новая победа');
    assert.equal(context.nameInput.value, 'Arena (импорт 2)');
    assert.equal(maps['Arena (импорт 2)'].terrainType, undefined);
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
    vm.runInNewContext(section(results, 'function syncResultOverlay(state = gameState)', 'window.syncResultOverlay = syncResultOverlay;'), game);
    game.syncResultOverlay('win');
    assert.equal(game.coins, 400);
    assert.equal(game.trophies, 35);
    assert.match(game.resultReward.textContent, /400 монет, \+35 трофеев/);
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
