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
    loadMapRules(context);
}
function loadMapRules(context) {
    vm.runInNewContext(section(main, 'function validateCustomMapTriggers(', 'function updateCustomMapTriggers()'), context);
}
function editorBotForm(context) {
    const fields = vm.runInNewContext(section(editor, '    const BOT_FIELDS = {', '    // Preset map sizes') + '\nBOT_FIELDS;');
    const elements = {};
    const element = id => elements[id] ||= { value: '', checked: false, style: { display: 'none' },
        focus() {}, replaceChildren() {}, appendChild() {}, querySelector: () => ({}), classList: { toggle() {} } };
    context.BOT_FIELDS = fields;
    context.botInputs = {}; context.botChecks = {};
    for (const [key, [input, check]] of Object.entries(fields)) {
        context.botInputs[key] = element(input); context.botChecks[key] = element(check);
    }
    context.botTankSelect = element('meBotTank');
    context.document = { getElementById: element, createElement: () => ({}), querySelectorAll: () => [] };
    context.botModal.classList = { toggle() {} };
    context.editingBots = []; context.selectedBots = []; context.meTriggers = [];
    context.botTriggerDrafts = []; context.activeTriggerSlot = 0;
    context.onMouseUp = () => {};
    context.editorTerrain = 'forest';
    context.spawnTankName = type => type || 'Случайный';
    context.OBJ_TYPES = { enemy: { label: 'Враг' }, ally: { label: 'Союзник' } };
    context.nameInput ||= { value: 'Test map' };
    context.STORAGE_KEY = 'me_maps'; context.MEG_VERSION = 1;
    context.curWorldW ||= 900; context.curWorldH ||= 700;
    context.enemyMode ||= 'group'; context.customWinMsg ||= ''; context.customLoseMsg ||= '';
    const stored = {};
    context.localStorage ||= { getItem: key => stored[key] || null, setItem: (key, value) => { stored[key] = value; } };
    loadMapRules(context);
    vm.runInNewContext(section(editor, '    function listMaps()', '    function validateMegData(data)'), context);
    return elements;
}
function section(source, first, last) {
    const start = source.indexOf(first), end = source.indexOf(last, start + first.length);
    assert.ok(start >= 0 && end > start, `Missing section ${first}`);
    return source.slice(start, end);
}

test('legacy maps lose neutral bots and only their related trigger actions', () => {
    const context = {}; loadMapRules(context);
    const original = { name: 'Arena', terrainType: 'snow', objects: [
        { id: 'n', type: 'neutral', x: 1 }, { id: 'e', type: 'enemy', health: 300 },
        { id: 'a', type: 'ally', neutralSettings: { role: 'guard' } }
    ], triggers: [
        { when: 'timer', targets: ['n', 'e'], changes: { health: 500, neutralSettings: { role: 'wander' } } },
        { when: 'destroyed', sourceId: 'n', targets: ['e'], changes: { health: 200 } },
        { when: 'timer', targets: ['a'], changes: { type: 'neutral', customName: 'Friend' } }
    ] };
    const cleaned = context.removeNeutralMapData(original);
    assert.deepEqual(JSON.parse(JSON.stringify(cleaned.objects)), [{ id: 'e', type: 'enemy', health: 300 }, { id: 'a', type: 'ally' }]);
    assert.deepEqual(JSON.parse(JSON.stringify(cleaned.triggers)), [
        { when: 'timer', targets: ['e'], changes: { health: 500 } },
        { when: 'timer', targets: ['a'], changes: { customName: 'Friend' } }
    ]);
    assert.equal(cleaned.terrainType, 'snow');
    assert.equal(original.objects.length, 3, 'reading a map does not mutate the caller data');
});

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
    const enemy = { id: 'guard', type: 'enemy', x: 500, y: 300, w: 50, h: 50, tankType: 'pyro', health: 1200, customName: 'Guard', customLabel: 'Hold position', team: 3 };
    const ally = { id: 'friend', type: 'ally', x: 300, y: 200, w: 50, h: 50, tankType: 'mechDiy', allyTeam: 3 };
    const neutral = { id: 'neutral', type: 'neutral', x: 600, y: 400, w: 50, h: 50, tankType: 'ice' };
    const rules = [{ when: 'timer', seconds: 5, targets: ['guard'], changes: { type: 'ally' } }];
    for (let restart = 0; restart < 2; restart++) {
        window.startCustomMapMode([box], 900, 700, [enemy, neutral], [ally], spawn, 'custom', '', '', 'snow', rules);
        assert.equal(context.enemies.length, 1, 'legacy neutral spawn is discarded');
        assert.equal(context.enemies[0].tankType, 'pyro');
        assert.equal(context.enemies[0].hp, 1200);
        assert.equal(context.enemies[0].maxHp, 1200);
        assert.equal(context.enemies[0].speed, 2.75);
        assert.equal(context.enemies[0].team, 3);
        assert.equal(context.enemies[0].customName, 'Guard');
        assert.equal(context.enemies[0].customLabel, 'Hold position');
        assert.equal(window.currentTerrain, 'snow');
        assert.equal(window._customMapParams.terrainType, 'snow');
        assert.equal(window._customMapTriggerState.ticks, 0);
        assert.equal(window._customMapTriggerState.fired.size, 0);
        assert.equal(window._customMapTriggerState.units.get('guard'), context.enemies[0]);
        window._customMapTriggerState.fired.add(0);
        assert.equal(window._customMapParams.triggers[0].seconds, 5);
        assert.equal(context.allies[0].tankType, 'mechDiy');
        assert.equal(context.allies[0].hp, 420);
        assert.equal(context.allies[0].speed, 2.4);
        assert.equal(context.allies[0].team, -3);
        assert.equal(window._customMapParams.enemySpawns[0].tankType, 'pyro');
        assert.equal(window._customMapParams.allySpawns[0].tankType, 'mechDiy');
    }
});

test('bot team controls follow enemy and ally sides', () => {
    const context = { meObjects: [{ type: 'enemy' }, { type: 'ally', allyTeam: 2 }],
        botModal: { style: {} }, botTitle: {}, updateHUD() {}, render() {} };
    const form = editorBotForm(context);
    vm.runInNewContext(section(editor, '    function closeBotSettings()', '    function listMaps()'), context);
    for (const bot of context.meObjects) {
        context.openBotSettings([bot]);
        assert.equal(form.meBotTeamField.style.display, bot.type === 'enemy' ? 'block' : 'none');
        assert.equal(form.meBotAllyTeamField.style.display, bot.type === 'ally' ? 'block' : 'none');
    }
    context.openBotSettings(context.meObjects);
    assert.equal(form.meBotTeamField.style.display, 'block');
    assert.equal(form.meBotAllyTeamField.style.display, 'block');
});

test('editor places at most fifty allies', () => {
    const context = { meObjects: [], activeTool: 'ally', gridSize: 50, curWorldW: 900, curWorldH: 700,
        toWorld: (x, y) => ({ wx: x, wy: y }), snapToGrid: (x, y) => ({ gx: Math.floor(x / 50) * 50, gy: Math.floor(y / 50) * 50 }),
        showEditorToast() {}, updateHUD() {}, render() {}, MAX_ENEMIES: 75, MAX_ALLIES: 50, MAX_OBJECTS: 750 };
    vm.runInNewContext(section(editor, '    function overlaps(a, b)', '    function pushUndo('), context);
    vm.runInNewContext(section(editor, '    function placeAt(canvasX, canvasY)', '    function showEditorToast('), context);
    for (let i = 0; i < 50; i++) context.placeAt(i % 15 * 50 + 5, Math.floor(i / 15) * 50 + 5);
    assert.equal(context.meObjects.length, 50);
    context.placeAt(805, 605); assert.equal(context.meObjects.length, 50);
});

test('bulk bot edits change only checked fields and undo includes trigger creation', () => {
    const enemy = { type: 'enemy', x: 0, y: 0, w: 50, h: 50, tankType: 'pyro' };
    const ally = { type: 'ally', x: 100, y: 0, w: 50, h: 50, tankType: 'ice' };
    const other = { type: 'enemy', x: 200, y: 0, w: 50, h: 50, tankType: 'normal' };
    const context = { window: {}, meObjects: [enemy, ally, other], undoStack: [], activeTool: 'select',
        botModal: { style: {} }, botTitle: {}, updateHUD() {}, render() {}, showEditorToast() {},
        MAX_ENEMIES: 75, MAX_ALLIES: 50, isCustomMapTankType: type => ['normal', 'pyro', 'ice'].includes(type) };
    const form = editorBotForm(context);
    vm.runInNewContext(section(editor, '    function closeBotSettings()', '    function listMaps()'), context);
    vm.runInNewContext(section(editor, '    function pushUndo(', '    function updateHUD()'), context);
    context.openBotSettings([enemy, ally]);
    form.meUseHealth.checked = true; form.meBotHealth.value = '850';
    form.meUseName.checked = true; form.meBotName.value = 'Squad';
    context.applyBotTank();
    assert.equal(enemy.health, 850); assert.equal(ally.health, 850);
    assert.equal(enemy.tankType, 'pyro'); assert.equal(ally.tankType, 'ice');
    assert.equal(enemy.type, 'enemy'); assert.equal(ally.type, 'ally');
    assert.equal(other.customName, undefined);
    context.openBotSettings([enemy, ally]);
    form.meUseSide.checked = true; form.meBotSide.value = 'ally';
    context.applyBotTank();
    assert.equal(enemy.type, 'ally'); assert.equal(other.type, 'enemy');
    context.undo();
    assert.equal(context.meObjects[0].type, 'enemy');
    context.openBotSettings(context.meObjects.slice(0, 2));
    context.switchBotTriggerSlot(1);
    context.document.getElementById('meTriggerEnabled').checked = true;
    context.document.getElementById('meTriggerTime').value = '5';
    form.meUseLabel.checked = true; form.meBotLabel.value = 'Reinforcements';
    context.applyBotTank();
    assert.equal(context.meTriggers.length, 2);
    assert.equal(new Set(context.meTriggers.flatMap(rule => rule.targets)).size, 2);
    assert.deepEqual(Object.keys(context.meTriggers[0].changes), ['customLabel']);
    assert.equal(context.meObjects[0].customLabel, undefined, 'a trigger does not apply during editing');
    context.undo(); assert.equal(context.meTriggers.length, 0);
    assert.equal(context.meObjects[0].id, undefined, 'undo restores IDs and rules together');
});

test('custom map triggers pause, fire once, retain dead sources and move bots between sides', () => {
    const guard = { editorId: 'guard', tankType: 'normal', customTeam: 1, team: 1, alive: true, hp: 300, maxHp: 300 };
    const enemy = { editorId: 'enemy', tankType: 'normal', customTeam: 3, team: 3, alive: true, hp: 300, maxHp: 300 };
    const ally = { editorId: 'ally', tankType: 'normal', customTeam: 4, team: 0, alive: true, hp: 300, maxHp: 300 };
    const rules = [
        { when: 'timer', seconds: 1, targets: ['enemy'], changes: { type: 'ally', health: 900, customName: 'Friend' } },
        { when: 'destroyed', sourceId: 'guard', targets: ['ally'], changes: { type: 'enemy', team: 2, tankType: 'mechRocket', health: 1500, customLabel: 'Boss' } }
    ];
    let paused = false;
    const state = { ticks: 0, enemyMode: 'custom', nextTeam: 5, rules, fired: new Set(), units: new Map([['guard', guard], ['enemy', enemy], ['ally', ally]]) };
    const context = { currentMode: 'custom', gameState: 'playing', window: { _customMapTriggerState: state, isPaused: () => paused,
        mechMaxHpByType: { mechRocket: 600 }, mechMaxSpeedByType: { mechRocket: 2.5 } },
        enemies: [guard, enemy], allies: [ally], playerDrones: [], enemyDrones: [],
        tankMaxHpByType: { normal: 300 }, tankMaxSpeedByType: { normal: 3.2 }, isCustomMapTankType: type => ['normal', 'mechRocket'].includes(type) };
    vm.runInNewContext(section(main, 'function updateCustomMapTriggers()', '                // very large world'), context);
    for (let i = 0; i < 59; i++) context.updateCustomMapTriggers();
    assert.equal(context.enemies.length, 2);
    paused = true; context.updateCustomMapTriggers(); assert.equal(state.ticks, 59);
    paused = false; context.updateCustomMapTriggers();
    assert.equal(context.enemies.includes(enemy), false); assert.equal(context.allies.includes(enemy), true);
    assert.equal(enemy.team, -1); assert.equal(enemy.hp, 900); assert.equal(enemy.customName, 'Friend');
    enemy.hp = 800; context.updateCustomMapTriggers(); assert.equal(enemy.hp, 800, 'one-shot trigger does not heal again');
    guard.hp = 0; context.enemies.splice(context.enemies.indexOf(guard), 1);
    context.updateCustomMapTriggers();
    const transformed = state.units.get('ally');
    assert.equal(context.enemies.includes(transformed), true);
    assert.equal(context.allies.includes(ally), false);
    assert.equal(transformed.tankType, 'mechRocket'); assert.equal(transformed.speed, 2.5);
    assert.equal(transformed.hp, 1500); assert.equal(transformed.maxHp, 1500);
    assert.equal(transformed.team, 2); assert.equal(transformed.customLabel, 'Boss');
    assert.equal(state.fired.size, 2);
    const ticks = state.ticks; context.currentMode = 'single'; context.updateCustomMapTriggers(); assert.equal(state.ticks, ticks);
});

test('all five bot slots survive switching, saving and reopening from local storage', () => {
    const stored = {};
    const context = { window: {}, meObjects: [{ type: 'enemy', x: 100, y: 100, w: 50, h: 50 }], undoStack: [],
        botModal: { style: {} }, botTitle: {}, updateHUD() {}, render() {}, showEditorToast() {},
        MAX_ENEMIES: 75, MAX_ALLIES: 50, isCustomMapTankType: type => type === 'normal',
        STORAGE_KEY: 'me_maps', MEG_VERSION: 1, curWorldW: 900, curWorldH: 700,
        enemyMode: 'group', customWinMsg: '', customLoseMsg: '', nameInput: { value: 'Persistent' },
        localStorage: { getItem: key => stored[key] || null, setItem: (key, value) => { stored[key] = value; } } };
    const form = editorBotForm(context);
    vm.runInNewContext(section(editor, '    function closeBotSettings()', '    function listMaps()'), context);
    vm.runInNewContext(section(editor, '    function listMaps()', '    function validateMegData(data)'), context);
    vm.runInNewContext(section(editor, '    function pushUndo(', '    function updateHUD()'), context);
    context.openBotSettings(context.meObjects);
    form.meBotHealth.value = '400';
    for (let slot = 1; slot <= 4; slot++) {
        context.switchBotTriggerSlot(slot);
        context.document.getElementById('meTriggerEnabled').checked = true;
        context.document.getElementById('meTriggerTime').value = String(slot * 10);
        form.meUseHealth.checked = true; form.meBotHealth.value = String(700 + slot);
    }
    context.switchBotTriggerSlot(0);
    assert.equal(form.meBotHealth.value, '400', 'switching slots must retain the first draft');
    context.applyBotTank();
    assert.ok(stored.me_maps, 'Save in the bot dialog must persist without another click on the map Save button');
    const saved = JSON.parse(stored.me_maps).Persistent;
    assert.equal(saved.objects[0].health, 400);
    assert.equal(saved.triggers.length, 4);
    assert.deepEqual(saved.triggers.map(rule => rule.slot), [2, 3, 4, 5]);
    context.meObjects = saved.objects; context.meTriggers = saved.triggers;
    context.openBotSettings(context.meObjects);
    for (let slot = 1; slot <= 4; slot++) {
        context.switchBotTriggerSlot(slot);
        assert.equal(form.meBotHealth.value, String(700 + slot));
        assert.equal(form.meUseHealth.checked, true);
        assert.equal(Number(context.document.getElementById('meTriggerTime').value), slot * 10);
        assert.equal(context.document.getElementById('meTriggerEnabled').checked, true);
    }
    context.switchBotTriggerSlot(2); form.meBotHealth.value = '999'; context.applyBotTank();
    assert.equal(context.meTriggers.length, 4, 'editing a slot must replace it rather than append another trigger');
    assert.equal(context.meTriggers.find(rule => rule.slot === 3).changes.health, 999);
    assert.equal(context.meTriggers.find(rule => rule.slot === 5).changes.health, 704);
    context.undo();
    assert.equal(JSON.parse(stored.me_maps).Persistent.triggers.find(rule => rule.slot === 3).changes.health, 702, 'undo must update the saved map too');
    context.openBotSettings(context.meObjects, 4);
    context.document.getElementById('meTriggerEnabled').checked = false;
    context.applyBotTank();
    context.openBotSettings(context.meObjects, 4);
    assert.equal(context.document.getElementById('meTriggerEnabled').checked, false);
    assert.equal(form.meBotHealth.value, '704', 'disabled slots must keep their configuration');
    form.meBotHealth.value = '1234'; context.switchBotTriggerSlot(1); context.closeBotSettings();
    context.openBotSettings(context.meObjects, 4);
    assert.equal(form.meBotHealth.value, '704', 'Cancel must discard all unsaved slot drafts');
});

test('a storage failure leaves trigger drafts open and does not claim they were saved', () => {
    const messages = [];
    const context = { window: {}, meObjects: [{ type: 'enemy', x: 0, y: 0, w: 50, h: 50, health: 100 }], undoStack: [],
        botModal: { style: {} }, botTitle: {}, updateHUD() {}, render() {}, showEditorToast: msg => messages.push(msg),
        MAX_ENEMIES: 75, MAX_ALLIES: 50, isCustomMapTankType: () => true };
    const form = editorBotForm(context);
    context.localStorage.setItem = () => { throw new Error('Storage full'); };
    vm.runInNewContext(section(editor, '    function closeBotSettings()', '    function listMaps()'), context);
    vm.runInNewContext(section(editor, '    function pushUndo(', '    function updateHUD()'), context);
    context.openBotSettings(context.meObjects);
    form.meBotHealth.value = '900'; context.applyBotTank();
    assert.equal(context.meObjects[0].health, 100);
    assert.equal(context.undoStack.length, 0);
    assert.equal(context.botModal.style.display, 'flex');
    assert.equal(form.meBotHealth.value, '900');
    assert.equal(messages.length, 1);
    assert.match(messages[0], /Не удалось сохранить/);
});

test('editing one bot slot preserves the other targets of a shared trigger', () => {
    const context = { window: {}, meObjects: [{ type: 'enemy', id: 'a' }, { type: 'ally', id: 'b' }], undoStack: [],
        botModal: { style: {} }, botTitle: {}, updateHUD() {}, render() {}, showEditorToast() {},
        MAX_ENEMIES: 75, MAX_ALLIES: 50, isCustomMapTankType: () => true };
    const form = editorBotForm(context);
    vm.runInNewContext(section(editor, '    function closeBotSettings()', '    function listMaps()'), context);
    vm.runInNewContext(section(editor, '    function pushUndo(', '    function updateHUD()'), context);
    context.meTriggers = [{ when: 'timer', slot: 2, seconds: 10, targets: ['a', 'b'], changes: { health: 800, customName: 'Shared' } }];
    context.openBotSettings([context.meObjects[0]], 1);
    form.meBotHealth.value = '900'; context.applyBotTank();
    assert.equal(context.meTriggers.length, 2);
    assert.equal(context.meTriggers.find(rule => rule.targets.includes('a')).changes.health, 900);
    assert.equal(context.meTriggers.find(rule => rule.targets.includes('b')).changes.health, 800);
    context.undo();
    assert.equal(context.meTriggers.length, 1);
    assert.deepEqual(Array.from(context.meTriggers[0].targets), ['a', 'b']);
});

test('four timed bot slots run once in simulation time and keep targeting a transformed tank', () => {
    const bot = { editorId: 'bot', tankType: 'normal', x: 100, y: 100, w: 38, h: 38, team: 1, hp: 400, maxHp: 400, alive: true };
    const rules = [
        { when: 'timer', slot: 2, seconds: 1, targets: ['bot'], changes: { health: 500 } },
        { when: 'timer', slot: 3, seconds: 2, targets: ['bot'], changes: { tankType: 'ice', health: 600 } },
        { when: 'timer', slot: 4, seconds: 3, targets: ['bot'], changes: { customName: 'Later' } },
        { when: 'timer', slot: 5, seconds: 4, targets: ['bot'], changes: { type: 'ally', health: 700 } }
    ];
    let paused = false;
    const state = { ticks: 0, enemyMode: 'group', nextTeam: 2, rules, fired: new Set(), units: new Map([['bot', bot]]) };
    const context = { currentMode: 'custom', gameState: 'playing', window: { _customMapTriggerState: state, isPaused: () => paused },
        enemies: [bot], allies: [], playerDrones: [], enemyDrones: [], tankMaxHpByType: { normal: 300, ice: 350 },
        tankMaxSpeedByType: { normal: 3.2, ice: 3 }, isCustomMapTankType: type => ['normal', 'ice'].includes(type) };
    vm.runInNewContext(section(main, 'function updateCustomMapTriggers()', '                // very large world'), context);
    const advance = steps => { for (let i = 0; i < steps; i++) context.updateCustomMapTriggers(); };
    advance(59); assert.equal(bot.hp, 400);
    paused = true; advance(60); assert.equal(state.ticks, 59);
    paused = false; advance(1); assert.equal(bot.hp, 500);
    advance(60); const transformed = state.units.get('bot');
    assert.notEqual(transformed, bot); assert.equal(transformed.tankType, 'ice'); assert.equal(transformed.hp, 600);
    advance(60); assert.equal(transformed.customName, 'Later');
    advance(60); assert.equal(transformed.team, -1); assert.equal(transformed.hp, 700); assert.equal(context.allies[0], transformed);
    transformed.hp = 650; advance(60); assert.equal(transformed.hp, 650); assert.equal(state.fired.size, 4);
    rules[3].enabled = false; state.fired.clear(); state.ticks = 239;
    transformed.team = 1; context.allies = []; context.enemies = [transformed];
    advance(1); assert.equal(state.units.get('bot').team, 1, 'a disabled timer cannot change sides');
    assert.equal(state.fired.has(3), false);
});

test('a bot accepts four timed triggers and rejects a fifth', () => {
    const context = { isCustomMapTankType: () => true };
    loadMapRules(context);
    const markers = [{ id: 'bot', type: 'enemy' }];
    const rules = Array.from({ length: 5 }, (_, index) => ({ when: 'timer', seconds: index + 1, targets: ['bot'], changes: { health: 500 } }));
    assert.equal(context.validateCustomMapTriggers(rules.slice(0, 4), markers), null);
    assert.equal(typeof context.validateCustomMapTriggers(rules, markers), 'string');
    assert.equal(typeof context.validateCustomMapTriggers([{ ...rules[0], slot: 2, seconds: 0 }], markers), 'string');
    assert.equal(typeof context.validateCustomMapTriggers([{ ...rules[0], slot: 1 }], markers), 'string');
    assert.equal(typeof context.validateCustomMapTriggers([{ ...rules[0], slot: 2 }, { ...rules[1], slot: 2 }], markers), 'string');
});

test('editor assigns, replaces, undoes and saves each bot vehicle independently', () => {
    const saved = {};
    const context = { window: {}, meObjects: [], undoStack: [], activeTool: 'enemy', gridSize: 50, curWorldW: 900, curWorldH: 700,
        botModal: { style: { display: 'none' } }, botTankSelect: { value: '', focus() {} }, botTitle: {}, selectedBot: null,
        isDrawing: false, isPanning: false, tankMaxHpByType: { pyro: 420, ice: 300, mechRocket: 600 },
        toWorld: (x, y) => ({ wx: x, wy: y }), snapToGrid: (x, y) => ({ gx: Math.floor(x / 50) * 50, gy: Math.floor(y / 50) * 50 }),
        showEditorToast() {}, updateHUD() {}, render() {}, MAX_ENEMIES: 75, MAX_ALLIES: 50, MAX_OBJECTS: 750,
        STORAGE_KEY: 'me_maps', MEG_VERSION: 1, enemyMode: 'group', customWinMsg: '', customLoseMsg: '',
        localStorage: { getItem: key => saved[key] || null, setItem: (key, value) => { saved[key] = value; } } };
    editorBotForm(context);
    context.validateMegData = () => null;
    vm.runInNewContext(section(editor, '    function overlaps(a, b)', '    function pushUndo('), context);
    vm.runInNewContext(section(main, 'function isCustomMapTankType(type)', 'function setTankHP(type)'), context);
    vm.runInNewContext(section(editor, '    function closeBotSettings()', '    function listMaps()'), context);
    vm.runInNewContext(section(editor, '    function pushUndo(', '    function updateHUD()'), context);
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
    const createElement = context.document.createElement;
    context.document.createElement = () => ({ click() {} });
    context.nameInput = { value: 'Typed map' };
    vm.runInNewContext(section(editor, '    function exportMeg()', '    function importMeg(file)'), context);
    context.exportMeg();
    context.document.createElement = createElement;
    assert.equal(exported.v, 1, 'typed markers remain compatible with the map file version');
    assert.equal(exported.terrainType, 'forest');
    assert.equal(exported.triggers.length, 0);
    assert.equal(exported.objects[0].tankType, 'pyro'); assert.equal(exported.objects[1].tankType, 'ice');
    context.openBotSettingsAt(25, 25); context.botTankSelect.value = ''; context.applyBotTank();
    assert.equal(context.meObjects[0].tankType, undefined, 'random choice removes the fixed type');
    context.activeTool = 'erase';
    assert.equal(context.openBotSettingsAt(25, 25), false, 'eraser still removes bots instead of opening the picker');
    context.placeAt(25, 25);
    assert.equal(context.meObjects.length, 1);
    assert.equal(context.meObjects[0].type, 'ally');
});

test('editor fits large maps and keeps the zoom anchor at the same world position', () => {
    const context = { canvas: { width: 800, height: 500 }, curWorldW: 3600, curWorldH: 1800,
        zoom: 1, camX: 0, camY: 0, hoverCell: { gx: 50, gy: 50 }, render() {} };
    vm.runInNewContext(section(editor, '    function fitMap()', '    function render()'), context);
    context.fitMap();
    assert.ok(context.zoom < 0.3, 'a large map fits even below the usual minimum zoom');
    assert.ok(context.camX >= 0 && context.camY >= 0);
    assert.ok(context.camX + context.curWorldW * context.zoom <= context.canvas.width);
    assert.ok(context.camY + context.curWorldH * context.zoom <= context.canvas.height);
    assert.equal(context.hoverCell, null);
    const point = { x: 150, y: 200 };
    const worldX = (point.x - context.camX) / context.zoom;
    const worldY = (point.y - context.camY) / context.zoom;
    const fitZoom = context.zoom;
    context.zoomAt(1.18, point.x, point.y);
    assert.ok(Math.abs((point.x - context.camX) / context.zoom - worldX) < 1e-9);
    assert.ok(Math.abs((point.y - context.camY) / context.zoom - worldY) < 1e-9);
    context.zoomAt(0.001);
    assert.equal(context.zoom, fitZoom, 'zooming out cannot jump inward from the fitted view');
    context.zoomAt(1000);
    assert.equal(context.zoom, 4);
});

test('editor shortcuts leave dialogs and text entry in control', () => {
    let keydown, undos = 0, closes = 0, tool = 'wall', cancels = 0;
    const dialogs = Object.fromEntries(['meConfirmOverlay', 'meMapsModal', 'meSettingsModal'].map(id => [id, { style: { display: 'none' } }]));
    dialogs.meConfirmNo = { click() { cancels++; dialogs.meConfirmOverlay.style.display = 'none'; } };
    dialogs.meMapsClose = { click() { dialogs.meMapsModal.style.display = 'none'; } };
    dialogs.meSettingsClose = { click() { dialogs.meSettingsModal.style.display = 'none'; } };
    const context = { modal: { style: { display: 'flex' } }, botModal: { style: { display: 'none' } },
        document: { getElementById: id => dialogs[id], addEventListener(type, handler) { keydown = handler; } },
        closeBotSettings() {}, closeEditor() { closes++; }, undo() { undos++; }, setTool(value) { tool = value; } };
    vm.runInNewContext(section(editor, "        document.addEventListener('keydown', (e) => {", '        updateHUD();'), context);
    const press = (key, extra = {}) => keydown({ key, target: { tagName: 'BUTTON' }, preventDefault() {}, ...extra });
    press('6'); assert.equal(tool, 'enemy');
    for (const id of ['meSettingsModal', 'meMapsModal', 'meConfirmOverlay']) {
        dialogs[id].style.display = 'flex';
        press('1'); assert.equal(tool, 'enemy');
        press('z', { ctrlKey: true }); assert.equal(undos, 0);
        press('Escape'); assert.equal(dialogs[id].style.display, 'none');
        assert.equal(closes, 0, 'Escape dismisses the dialog before closing the editor');
    }
    assert.equal(cancels, 1);
    press('1', { target: { tagName: 'INPUT' } }); assert.equal(tool, 'enemy');
    press('1', { ctrlKey: true }); assert.equal(tool, 'enemy');
    press('Z', { ctrlKey: true }); assert.equal(undos, 1);
    context.modal.style.display = 'none';
    press('6'); press('z', { ctrlKey: true }); assert.equal(undos, 1);
});

test('map import rejects invalid objects and obstacles overlapping player spawn', () => {
    const context = { MAX_OBJECTS: 750, MAX_ENEMIES: 75, MAX_ALLIES: 50, MEG_VERSION: 1,
        BIOMES: ['forest', 'snow', 'desert', 'swamp', 'rain', 'night', 'lava'],
        OBJ_TYPES: { wall: {}, woodenWall: {}, box: {}, barrel: {}, enemy: {}, ally: {}, player: {} },
        tankMaxHpByType: { normal: 300, pyro: 420, boss_hell: 7500 }, window: { mechMaxHpByType: { mechRocket: 600 } } };
    vm.runInNewContext(section(main, 'function isCustomMapTankType(type)', 'function setTankHP(type)'), context);
    loadMapRules(context);
    vm.runInNewContext(section(editor, '    function validateMegData(data)', '    function pushUndo('), context);
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
        assert.equal(validate([{ ...marker, health: 1500, customName: 'Guard', customLabel: 'Hold', team: 4 }]), null);
        for (const health of [0, -1, 1.5, 100001, '500']) assert.equal(typeof validate([{ ...marker, health }]), 'string');
        for (const team of [0, 5, '2', 1.1]) assert.equal(typeof validate([{ ...marker, team }]), 'string');
        assert.equal(validate([{ ...marker, allyTeam: 4 }]), null);
        for (const allyTeam of [0, 5, '2', 1.1]) assert.equal(typeof validate([{ ...marker, allyTeam }]), 'string');
        assert.equal(typeof validate([{ ...marker, customName: 'x'.repeat(33) }]), 'string');
        assert.equal(typeof validate([{ ...marker, customLabel: {} }]), 'string');
    }
    const allies = Array.from({ length: 50 }, (_, i) => ({ type: 'ally', x: i % 15 * 50, y: Math.floor(i / 15) * 50, w: 50, h: 50 }));
    assert.equal(validate(allies), null);
    assert.equal(typeof validate([...allies, { type: 'ally', x: 800, y: 600, w: 50, h: 50 }]), 'string');
    const markers = [{ id: 'source', type: 'enemy' }, { id: 'target', type: 'ally' }];
    const rule = { when: 'destroyed', sourceId: 'source', targets: ['target'], changes: { type: 'enemy', health: 700 } };
    assert.equal(context.validateCustomMapTriggers([rule], markers), null);
    assert.equal(typeof context.validateCustomMapTriggers([{ ...rule, targets: ['missing'] }], markers), 'string');
    assert.equal(typeof context.validateCustomMapTriggers([{ ...rule, changes: { hp: -1 } }], markers), 'string');
    assert.equal(typeof context.validateCustomMapTriggers([{ ...rule, when: 'timer', seconds: Infinity }], markers), 'string');
    assert.equal(typeof context.validateCustomMapTriggers([rule], [...markers, markers[0]]), 'string');
});

test('editor prevents placing a block on a player spawn in either order', () => {
    const context = { meObjects: [], activeTool: 'player', gridSize: 50, curWorldW: 900, curWorldH: 700,
        toWorld: (x, y) => ({ wx: x, wy: y }),
        snapToGrid: (x, y) => ({ gx: Math.floor(x / 50) * 50, gy: Math.floor(y / 50) * 50 }),
        showEditorToast() {}, updateHUD() {}, render() {},
        MAX_ENEMIES: 75, MAX_ALLIES: 50, MAX_OBJECTS: 750
    };
    vm.runInNewContext(section(editor, '    function overlaps(a, b)', '    function pushUndo('), context);
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
        biomeSelect: { value: '' }, editorTerrain: 'forest', meTriggers: [],
        winMsgInput: { value: '' }, loseMsgInput: { value: '' },
        window: { deviceModeMobile: false }, validateMegData: () => null,
        pushUndo() {}, updateHUD() {}, render() {}, fitMap() {}, showEditorToast() {}, renderResultMessages() {}
    };
    loadTerrain(context);
    vm.runInNewContext(section(editor, '    function listMaps()', '    function validateMegData(data)'), context);
    vm.runInNewContext(section(editor, '    function importMeg(file)', '    function launchCustomMap('), context);
    context.importMeg(JSON.stringify({ name: 'Arena', objects: [{ type: 'player', x: 50, y: 50, w: 50, h: 50 },
        { type: 'enemy', id: 'guard', x: 300, y: 200, w: 50, h: 50, tankType: 'pyro', health: 2000, customName: 'Guard', team: 3 },
        { type: 'ally', id: 'friend', x: 100, y: 100, w: 50, h: 50, tankType: 'mechRocket', customLabel: 'Escort' }],
        worldW: 900, worldH: 700, enemyMode: 'custom', terrainType: 'snow', customWinMsg: 'Новая победа',
        triggers: [{ when: 'destroyed', sourceId: 'guard', targets: ['friend'], changes: { type: 'enemy' } }] }));
    const maps = JSON.parse(store.get('me_maps'));
    assert.ok(maps.Arena);
    assert.ok(maps['Arena (импорт 2)']);
    assert.deepEqual(maps['Arena (импорт 2)'].customWinMsg, ['Новая победа']);
    assert.equal(context.nameInput.value, 'Arena (импорт 2)');
    assert.equal(maps['Arena (импорт 2)'].terrainType, 'snow');
    assert.equal(maps['Arena (импорт 2)'].objects[1].tankType, 'pyro');
    assert.equal(maps['Arena (импорт 2)'].objects[2].tankType, 'mechRocket');
    assert.equal(maps['Arena (импорт 2)'].objects[1].health, 2000);
    assert.equal(maps['Arena (импорт 2)'].objects[1].customName, 'Guard');
    assert.equal(maps['Arena (импорт 2)'].objects[1].team, 3);
    assert.equal(maps['Arena (импорт 2)'].objects[2].customLabel, 'Escort');
    assert.equal(maps['Arena (импорт 2)'].triggers[0].sourceId, 'guard');
});

test('finishing map settings saves the biome, including empty drafts, and retains the form on storage failure', () => {
    for (const objects of [[], [{ type: 'player', x: 50, y: 50 }]]) {
        let done, saved = JSON.stringify({ Arena: { terrainType: 'forest' } }), fail = false;
        const dialog = { style: { display: 'flex' } }, notices = [];
        const context = {
            document: { getElementById: id => id === 'meSettingsClose'
                ? { addEventListener: (_event, handler) => { done = handler; } } : dialog },
            localStorage: { getItem: () => saved, setItem: (_key, value) => {
                if (fail) throw new Error('Storage full');
                saved = value;
            } },
            STORAGE_KEY: 'me_maps', MEG_VERSION: 1, nameInput: { value: 'Arena' },
            meObjects: objects, meTriggers: [], editorTerrain: 'snow', curWorldW: 900, curWorldH: 700,
            enemyMode: 'group', customWinMsg: '', customLoseMsg: '', showEditorToast: message => notices.push(message)
        };
        vm.runInNewContext(section(editor, '    function listMaps()', '    function validateMegData(data)'), context);
        vm.runInNewContext(section(editor, "        document.getElementById('meSettingsClose')?.addEventListener", "        document.getElementById('meMapsBtn')"), context);
        done();
        assert.equal(JSON.parse(saved).Arena.terrainType, 'snow');
        assert.deepEqual(JSON.parse(saved).Arena.objects, objects);
        assert.equal(dialog.style.display, 'none');
        context.editorTerrain = 'desert'; dialog.style.display = 'flex'; fail = true;
        done();
        assert.equal(JSON.parse(saved).Arena.terrainType, 'snow');
        assert.equal(dialog.style.display, 'flex');
        assert.ok(notices.at(-1).includes('Не удалось'));
    }
});

test('playing a saved map uses its biome and messages without changing the draft biome', () => {
    let launched;
    const runtime = { map: { enemyMode: 'solo', terrainType: 'night', customWinMsg: 'Победа карты', customLoseMsg: 'Поражение карты',
            objects: [], worldW: 900, worldH: 700 }, mapsModal: { style: {} },
        enemyMode: 'group', editorTerrain: 'snow', biomeSelect: { value: 'snow' }, customWinMsg: 'Старое сообщение', customLoseMsg: 'Старое поражение',
        playBtn: {} };
    loadTerrain(runtime);
    runtime.launchCustomMap = (_objects, _width, _height, biome, _triggers, settings) => { launched = [settings.customWinMsg, settings.customLoseMsg, biome]; return true; };
    vm.runInNewContext(section(editor, '                playBtn.onclick = () => {', '                const delBtn ='), runtime);
    runtime.playBtn.onclick();
    assert.deepEqual(launched, ['Победа карты', 'Поражение карты', 'night']);
    assert.equal(runtime.editorTerrain, 'snow');
    assert.equal(runtime.biomeSelect.value, 'snow');
    assert.equal(runtime.customWinMsg, 'Старое сообщение');
    assert.equal(runtime.enemyMode, 'group');
});

test('changing a biome saves immediately before finishing the settings dialog', () => {
    let change, saved;
    const context = { biomeSelect: { value: 'rain', addEventListener: (_event, handler) => { change = handler; } },
        document: { getElementById() { return context.biomeSelect; } }, nameInput: { value: 'Weather' },
        meObjects: [], meTriggers: [], editorTerrain: 'forest', STORAGE_KEY: 'me_maps', MEG_VERSION: 1,
        curWorldW: 900, curWorldH: 700, enemyMode: 'group', customWinMsg: [], customLoseMsg: [], render() {},
        localStorage: { getItem: () => saved || null, setItem: (_key, value) => { saved = value; } }, showEditorToast() {} };
    vm.runInNewContext(section(editor, '    function listMaps()', '    function validateMegData(data)'), context);
    vm.runInNewContext(section(editor, "        biomeSelect = document.getElementById('meBiome');", "        editSelectionBtn = document.getElementById('meEditSelection');"), context);
    change();
    assert.equal(JSON.parse(saved).Weather.terrainType, 'rain');
});

test('result message cards keep multiline text inside one variant and remove variants independently', () => {
    const elements = {};
    const makeElement = () => ({ children: [], value: '', style: {},
        replaceChildren() { this.children = []; }, appendChild(child) { this.children.push(child); },
        append(...children) { this.children.push(...children); }, setAttribute() {},
        addEventListener(type, handler) { this[type] = handler; } });
    const context = { customWinMsg: ['First\nsecond line', 'Other victory'], customLoseMsg: ['Defeat'],
        document: { getElementById: id => elements[id] ||= makeElement(), createElement: makeElement } };
    vm.runInNewContext(section(editor, '    function renderResultMessages()', '    function switchBotTriggerSlot('), context);
    context.renderResultMessages();
    const first = elements.meWinMessages.children[0].children[1];
    assert.equal(first.value, 'First\nsecond line');
    first.value = 'Updated\nstill one'; first.input();
    assert.deepEqual(context.customWinMsg, ['Updated\nstill one', 'Other victory']);
    elements.meWinMessages.children[1].children[2].onclick();
    assert.deepEqual(context.customWinMsg, ['Updated\nstill one']);
    assert.deepEqual(context.customLoseMsg, ['Defeat']);
    loadMapRules(context);
    assert.equal(context.normalizeCustomMapMessages(context.customWinMsg).length, 1);
    assert.deepEqual(Array.from(context.normalizeCustomMapMessages('Legacy one\nLegacy two')), ['Legacy one', 'Legacy two']);
});

test('bot labels contain only author supplied names and captions', () => {
    const context = {};
    vm.runInNewContext(section(read('tanks.js'), 'function drawCustomBotLabel(', 'function drawReloadBar('), context);
    const labels = [], ctx = { save() {}, restore() {}, strokeText() {}, fillText: text => labels.push(text) };
    const unit = { x: 10, y: 10, w: 38, h: 38, team: 1 };
    context.drawCustomBotLabel(ctx, unit);
    assert.deepEqual(labels, []);
    Object.assign(unit, { customName: 'Courier', customLabel: 'Escort' });
    context.drawCustomBotLabel(ctx, unit);
    assert.deepEqual(labels, ['Courier', 'Escort']);
});

test('creating a profile does not change the previous profile title', () => {
    let saveHandler, created = false;
    const store = new Map([['playerTitle', 'original']]);
    const runtime = {
        profileEditSave: { addEventListener: (_event, handler) => { saveHandler = handler; } },
        document: { getElementById: id => id === 'profileEditName' ? { value: 'Новый игрок' } : null },
        localStorage: { getItem: key => store.get(key), setItem: (key, value) => store.set(key, value) },
        _profileEditIdx: -1, _profileEditAvatar: '🎮', _profileEditTitleId: 'unlocked', _profileEditBackground: 'default',
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
        gameState: 'win', lastResultState: null, coins: 300, tokens: 100, trophies: 25,
        tankType: 'normal', tank: { hp: 300 }, Math, console: { log() {}, error() {} },
        determineOutcomeType: () => 'crushing', describeMode: () => 'Босс',
        getResultMessages: () => ({ bossfight: { win: { crushing: ['Победа'] } } }),
        addIndividualTankTrophies() {}, saveProgress() {},
        VICTORY_TOKEN_REWARDS: { bossfight: 100 }, BOSS_BONUS_TOKENS: 35,
        awardVictoryTokens() { game.tokens += 35; }
    };
    vm.runInNewContext(section(results, 'let immersionDeath = null;', '// Determine outcome type'), game);
    vm.runInNewContext(section(results, 'function syncResultOverlay(state = gameState)', 'window.syncResultOverlay = syncResultOverlay;'), game);
    game.syncResultOverlay('win');
    assert.equal(game.coins, 300);
    assert.equal(game.tokens, 135);
    assert.equal(game.trophies, 35);
    assert.match(game.resultReward.textContent, /\+35 трофеев/);
    assert.doesNotMatch(game.resultReward.textContent, /монет/);
    assert.match(game.resultReward.textContent, /\+135 жетонов/);
    game.syncResultOverlay('win');
    assert.equal(game.tokens, 135);
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
        showEditorToast() {}, updateHUD() {}, render() {}, MAX_ENEMIES: 75, MAX_ALLIES: 50, MAX_OBJECTS: 750 };
    vm.runInNewContext(section(editor, '    function overlaps(a, b)', '    function pushUndo('), context);
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
