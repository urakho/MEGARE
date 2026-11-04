/**
 * MEGARE – Map Editor
 * Handles creating, editing, saving, loading and playing custom maps.
 * Maps are stored in localStorage and can be exported/imported as .meg files.
 */

(function () {
    'use strict';

    // ─── constants ─────────────────────────────────────────────────────────────
    const MAX_OBJECTS  = 750;        // max placeable objects per map
    const MAX_ENEMIES  = 75;          // max enemy spawn points per map
    const MAX_ALLIES   = 50;          // max ally spawn points per map
    const STORAGE_KEY  = 'me_maps';  // localStorage key for saved maps
    const MEG_VERSION  = 1;          // .meg file format version
    const BIOMES = ['forest', 'snow', 'desert', 'swamp', 'rain', 'night', 'lava'];
    const BOT_FIELDS = {
        tankType: ['meBotTank', 'meUseTank'], health: ['meBotHealth', 'meUseHealth'],
        customName: ['meBotName', 'meUseName'], customLabel: ['meBotLabel', 'meUseLabel'],
        type: ['meBotSide', 'meUseSide'], team: ['meBotTeam', 'meUseTeam'], allyTeam: ['meBotAllyTeam', 'meUseAllyTeam']
    };
    // Preset map sizes
    const MAP_SIZES = {
        small:  { w: 900,  h: 700  },
        medium: { w: 1350, h: 900  },
        large:  { w: 1800, h: 1100 },
        huge:   { w: 2700, h: 1400 },
        ultra:  { w: 3600, h: 1800 },
    };

    // Object type definitions: colour, label
    const OBJ_TYPES = {
        wall:       { color: '#3a3a3a', stroke: '#666666', label: 'Стена'      },
        woodenWall: { color: '#6e4f35', stroke: '#8c6849', label: 'Дер. стена' },
        box:        { color: '#8b5a2b', stroke: '#c0803a', label: 'Ящик'       },
        barrel:     { color: '#7a4d2a', stroke: '#c87d40', label: 'Бочка'      },
        enemy:      { color: '#c0392b', stroke: '#e74c3c', label: 'Враг'       },
        ally:   { color: '#2980b9', stroke: '#3498db', label: 'Союзник'  },
        player: { color: '#00cc44', stroke: '#00ff55', label: 'Игрок'    },
    };

    // ─── state ─────────────────────────────────────────────────────────────────
    let meObjects  = [];       // Obstacles and spawn markers with optional bot settings.
    let undoStack  = [];       // snapshots for undo
    let activeTool = 'wall';
    let enemyMode  = 'group';  // Shared team, individual teams, or four custom enemy teams.
    let editorTerrain = 'forest';
    let selectedBots = [], editingBots = [], selectionStart = null, selectionBox = null, selectionBase = [];
    let meTriggers = [], botTriggerDrafts = [], activeTriggerSlot = 0;
    let toolArtTerrain = null;
    let customWinMsg = [], customLoseMsg = [];
    let gridSize   = 50;       // snap grid in pixels
    let curWorldW  = 900;      // current map width
    let curWorldH  = 700;      // current map height
    let isDrawing  = false;
    let isPanning  = false;
    let panStart   = { x: 0, y: 0 };
    let camX = 0, camY = 0;   // canvas offset (pan)
    let zoom = 1;
    let hoverCell  = null;     // { gx, gy } grid cell under cursor

    // ─── DOM refs (filled in init) ──────────────────────────────────────────────
    let modal, canvas, canvasWrap, ctx;
    let nameInput, mapSizeSelect, enemyModeSelect, objectCountEl, coordsEl;
    let toolNameEl, toolHintEl, enemyHintEl, undoBtn, zoomLevelEl, zoomInBtn, zoomOutBtn, mapSummaryEl;
    let botModal, botTankSelect, botTitle, biomeSelect, editSelectionBtn;
    const botInputs = {}, botChecks = {};
    const spawnTankSprites = new Map();

    function spawnTankName(type) {
        return window.tankDescriptions?.[type]?.name || window.mechDescriptions?.[type]?.name || type || 'Случайный';
    }

    function drawSpawnTank(obj, x, y) {
        if (!obj.tankType || typeof drawTankOn !== 'function') return false;
        const key = obj.type + ':' + obj.tankType;
        if (!spawnTankSprites.has(key)) {
            const sprite = document.createElement('canvas'); sprite.width = sprite.height = 128;
            drawTankOn(sprite.getContext('2d'), 64, 64, 64, 64, OBJ_TYPES[obj.type].color,
                -Math.PI / 2, 1, obj.tankType, null, 0);
            spawnTankSprites.set(key, sprite);
        }
        const size = obj.w * 1.3;
        ctx.drawImage(spawnTankSprites.get(key), x - size / 2, y - size / 2, size, size);
        return true;
    }

    function closeBotSettings() {
        if (botModal) botModal.style.display = 'none';
        editingBots = [];
        botTriggerDrafts = [];
    }

    function ensureBotIds(objects = meObjects) {
        const used = new Set(objects.map(bot => bot.id).filter(Boolean));
        let id = 1;
        for (const bot of objects) {
            if ((!['enemy', 'ally'].includes(bot.type)) || bot.id) continue;
            while (used.has(`bot${id}`)) id++;
            bot.id = `bot${id++}`;
            used.add(bot.id);
        }
    }

    function getBotTriggerSlots(bot, rules = meTriggers) {
        const slots = Array(5).fill(null);
        if (!bot.id) return slots;
        const matching = rules.filter(rule => rule.targets.includes(bot.id));
        for (const rule of matching) if (Number.isInteger(rule.slot) && rule.slot >= 2 && rule.slot <= 5) slots[rule.slot - 1] = rule;
        for (const rule of matching) {
            if (rule.slot !== undefined) continue;
            const freeSlot = slots.findIndex((entry, index) => index > 0 && !entry);
            if (freeSlot >= 0) slots[freeSlot] = rule;
        }
        return slots;
    }

    function captureBotTriggerDraft() {
        const draft = botTriggerDrafts[activeTriggerSlot];
        if (!draft) return;
        for (const key of Object.keys(BOT_FIELDS)) {
            const relevant = key === 'team' ? document.getElementById('meBotTeamField').style.display !== 'none'
                : key === 'allyTeam' ? document.getElementById('meBotAllyTeamField').style.display !== 'none' : true;
            const checked = botChecks[key].checked && relevant, value = String(botInputs[key].value);
            if (checked !== draft.checked[key] || (checked && value !== draft.values[key])) draft.dirty = true;
            draft.checked[key] = checked; draft.values[key] = value;
        }
        if (activeTriggerSlot > 0) {
            const enabled = document.getElementById('meTriggerEnabled').checked;
            const seconds = document.getElementById('meTriggerTime').value;
            if (enabled !== draft.enabled || String(seconds) !== String(draft.seconds)) draft.dirty = true;
            draft.enabled = enabled; draft.seconds = seconds;
        }
    }

    function showBotTriggerSlot(slot) {
        activeTriggerSlot = slot;
        const draft = botTriggerDrafts[slot];
        for (const key of Object.keys(BOT_FIELDS)) {
            botInputs[key].value = draft.values[key];
            botChecks[key].checked = draft.checked[key];
        }
        botModal.classList.toggle('me-batch', editingBots.length > 1 || slot > 0);
        document.getElementById('meTriggerTimeField').style.display = slot > 0 ? 'block' : 'none';
        document.getElementById('meTriggerEnabled').checked = draft.enabled;
        document.getElementById('meTriggerTime').value = draft.seconds;
        updateBotTeamFields();
        document.getElementById('meTriggerSlotHint').textContent = slot === 0
            ? 'Триггер 1 задаёт состояние танка в начале боя.'
            : draft.legacy && !draft.dirty ? 'Сохранён старый триггер уничтожения. Измени этот слот, чтобы заменить его таймером.'
            : `Триггер ${slot + 1}: время считается от начала боя. Отметь поля, которые нужно изменить.`;
        document.querySelectorAll('[data-trigger-slot]').forEach(button => {
            const index = Number(button.dataset.triggerSlot), item = botTriggerDrafts[index];
            button.classList.toggle('active', index === slot);
            button.setAttribute('aria-pressed', String(index === slot));
            button.querySelector('span').textContent = index === 0 ? 'Начало боя'
                : item.enabled ? (item.legacy && !item.dirty ? 'Старый' : `${item.seconds} с`) : 'Выключен';
        });
    }

    function updateBotTeamFields() {
        const sides = editingBots.length > 1 && !botChecks.type.checked
            ? editingBots.map(bot => bot.type) : [botInputs.type.value];
        document.getElementById('meBotTeamField').style.display = sides.includes('enemy') ? 'block' : 'none';
        document.getElementById('meBotAllyTeamField').style.display = sides.includes('ally') ? 'block' : 'none';
    }

    function renderResultMessages() {
        for (const [kind, messages] of [['Win', customWinMsg], ['Lose', customLoseMsg]]) {
            const list = document.getElementById(`me${kind}Messages`);
            if (!list) continue;
            list.replaceChildren();
            if (!messages.length) {
                const hint = document.createElement('p'); hint.className = 'me-panel-hint';
                hint.textContent = 'Пока используются обычные сообщения игры.'; list.appendChild(hint);
            }
            messages.forEach((message, index) => {
                const row = document.createElement('div'); row.className = 'me-message-card';
                const label = document.createElement('label'); label.textContent = `Сообщение ${index + 1}`;
                const input = document.createElement('textarea'); input.className = 'me-input'; input.rows = 2; input.maxLength = 200;
                input.value = message; input.id = `me${kind}Message${index}`; label.htmlFor = input.id;
                input.placeholder = kind === 'Win' ? 'Поздравляю, ты выиграл!' : 'Попробуй ещё раз!';
                input.addEventListener('input', () => { messages[index] = input.value; });
                const remove = document.createElement('button'); remove.type = 'button'; remove.className = 'me-view-btn';
                remove.textContent = 'Удалить'; remove.setAttribute('aria-label', `Удалить сообщение ${index + 1}`);
                remove.onclick = () => { messages.splice(index, 1); renderResultMessages(); };
                row.append(label, input, remove); list.appendChild(row);
            });
            const add = document.getElementById(`meAdd${kind}Message`);
            if (add) add.disabled = messages.length >= 20;
        }
    }

    function switchBotTriggerSlot(slot) {
        captureBotTriggerDraft();
        showBotTriggerSlot(slot);
    }

    function openBotSettings(bots, slot = 0) {
        editingBots = bots.filter(bot => meObjects.includes(bot));
        if (!editingBots.length || !botModal) return;
        const first = editingBots[0], batch = editingBots.length > 1;
        botTitle.textContent = batch ? `Настройки ботов: ${editingBots.length}` : 'Настройки бота';
        botTriggerDrafts = Array.from({ length: 5 }, (_, index) => {
            const rule = index > 0 ? editingBots.map(bot => getBotTriggerSlots(bot)[index]).find(Boolean) : null;
            const draft = { values: {}, checked: {}, dirty: false, enabled: index === 0 || !!rule && rule.enabled !== false,
                seconds: rule?.seconds ?? (index || 1) * 10, legacy: rule?.when === 'destroyed' };
            for (const key of Object.keys(BOT_FIELDS)) {
                draft.values[key] = String(rule && Object.hasOwn(rule.changes, key) ? rule.changes[key] ?? '' : first[key] ?? (key === 'team' || key === 'allyTeam' ? 1 : ''));
                draft.checked[key] = !batch && (index === 0 || !!rule && Object.hasOwn(rule.changes, key));
            }
            return draft;
        });
        showBotTriggerSlot(slot);
        botModal.style.display = 'flex';
        onMouseUp();
        botTankSelect.focus();
    }

    function openBotSettingsAt(cx, cy) {
        if (activeTool === 'erase' || activeTool === 'select' || !botModal) return false;
        const { wx, wy } = toWorld(cx, cy);
        const bot = meObjects.find(obj => (['enemy', 'ally'].includes(obj.type)) &&
            wx >= obj.x && wx < obj.x + obj.w && wy >= obj.y && wy < obj.y + obj.h);
        if (!bot) return false;
        selectedBots = [bot];
        updateHUD(); render();
        openBotSettings([bot]);
        return true;
    }

    function applyBotTank() {
        captureBotTriggerDraft();
        const targets = editingBots.filter(bot => meObjects.includes(bot));
        if (!targets.length) return;
        const next = meObjects.map(bot => ({ ...bot }));
        const rules = meTriggers.map(rule => ({ ...rule, targets: [...rule.targets], changes: { ...rule.changes } }));
        if (botTriggerDrafts.some((draft, index) => draft.dirty && index > 0)) ensureBotIds(next);
        for (let slot = 0; slot < 5; slot++) {
            const draft = botTriggerDrafts[slot];
            if (!draft.dirty) continue;
            const changes = {};
            for (const key of Object.keys(BOT_FIELDS)) if (draft.checked[key]) {
                const value = draft.values[key].trim();
                changes[key] = key === 'health' || key === 'team' || key === 'allyTeam' ? (value ? Number(value) : null) : value;
            }
            if (changes.tankType && !isCustomMapTankType(changes.tankType)) return;
            if (changes.health != null && (!Number.isInteger(changes.health) || changes.health < 1 || changes.health > 100000)) {
                showEditorToast(`Триггер ${slot + 1}: здоровье — целое число от 1 до 100 000.`); return;
            }
            const seconds = Number(draft.seconds);
            if (slot > 0 && draft.enabled && (!Number.isFinite(seconds) || seconds < 0.1 || seconds > 3600)) {
                showEditorToast(`Триггер ${slot + 1}: время — от 0,1 до 3600 секунд.`); return;
            }
            for (const bot of targets) {
                const edited = next[meObjects.indexOf(bot)];
                if (slot === 0) {
                    for (const [key, value] of Object.entries(changes)) {
                        if (key === 'team' && edited.type !== 'enemy' || key === 'allyTeam' && edited.type !== 'ally') continue;
                        if (value === '' || value === null) delete edited[key];
                        else edited[key] = value;
                    }
                    continue;
                }
                const oldRule = getBotTriggerSlots(bot)[slot];
                if (oldRule) rules[meTriggers.indexOf(oldRule)].targets = rules[meTriggers.indexOf(oldRule)].targets.filter(id => id !== bot.id);
                const combined = editingBots.length === 1 ? { ...changes } : { ...(oldRule?.changes || {}), ...changes };
                if (!Object.keys(combined).length) {
                    if (!draft.enabled) continue;
                    showEditorToast(`Триггер ${slot + 1}: отметь хотя бы одно поле для изменения.`); return;
                }
                rules.push({ when: 'timer', slot: slot + 1, enabled: draft.enabled, seconds, targets: [edited.id], changes: combined });
            }
        }
        const nextRules = rules.filter(rule => rule.targets.length);
        const triggerError = validateCustomMapTriggers(nextRules, next);
        if (triggerError) { showEditorToast(triggerError); return; }
        if (next.filter(o => o.type === 'enemy').length > MAX_ENEMIES || next.filter(o => o.type === 'ally').length > MAX_ALLIES) {
            showEditorToast('Превышен лимит врагов или союзников.'); return;
        }
        const name = nameInput.value.trim() || 'my_map';
        try { saveMap(name, next, nextRules); }
        catch { showEditorToast('Не удалось сохранить карту в браузере. Освободи место и попробуй ещё раз.'); return; }
        if (botTriggerDrafts.some(draft => draft.dirty)) {
            pushUndo(true);
            meObjects.forEach((bot, index) => {
                for (const key of Object.keys(BOT_FIELDS)) if (!Object.hasOwn(next[index], key)) delete bot[key];
                Object.assign(bot, next[index]);
            });
            meTriggers = nextRules;
        }
        updateHUD(); render();
        closeBotSettings();
        showEditorToast('Все 5 слотов сохранены вместе с картой', false);
    }

    function selectBots(type) {
        setTool('select');
        selectedBots = meObjects.filter(bot => (['enemy', 'ally'].includes(bot.type)) && (!type || bot.type === type));
        updateHUD(); render();
    }

    function refreshTriggersList() {
        const list = document.getElementById('meTriggersList');
        if (!list || document.getElementById('meSettingsModal')?.style.display === 'none') return;
        list.replaceChildren();
        if (!meTriggers.length) { list.textContent = 'Триггеров пока нет'; return; }
        meTriggers.forEach((rule, index) => {
            const row = document.createElement('div'); row.className = 'me-trigger-row';
            const text = document.createElement('span');
            const source = meObjects.find(bot => bot.id === rule.sourceId);
            text.textContent = `${index + 1}. ${rule.enabled === false ? 'Выключен · ' : ''}${rule.when === 'timer' ? `Через ${rule.seconds} с` : `После уничтожения: ${source?.customName || source?.id || 'бот удалён'}`} → ботов: ${rule.targets.length}`;
            const edit = document.createElement('button'); edit.className = 'me-view-btn'; edit.textContent = 'Изменить';
            edit.onclick = () => {
                const bots = meObjects.filter(bot => rule.targets.includes(bot.id));
                if (!bots.length) { showEditorToast('Боты этого триггера удалены.'); return; }
                openBotSettings(bots, getBotTriggerSlots(bots[0]).indexOf(rule));
            };
            const remove = document.createElement('button'); remove.className = 'me-view-btn'; remove.textContent = 'Удалить';
            remove.onclick = () => {
                const rules = meTriggers.filter((_, ruleIndex) => ruleIndex !== index);
                try { saveMap(nameInput.value.trim() || 'my_map', meObjects, rules); }
                catch { showEditorToast('Не удалось сохранить удаление триггера.'); return; }
                pushUndo(true); meTriggers = rules; updateHUD();
            };
            row.append(text, edit, remove); list.appendChild(row);
        });
    }

    // ─────────────────────────────────────────────────────────────────────────────
    // STORAGE
    // ─────────────────────────────────────────────────────────────────────────────

    function listMaps() {
        try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'); }
        catch { return {}; }
    }

    function saveMap(name, objects, triggers = meTriggers) {
        const maps = listMaps();
        maps[name] = { v: MEG_VERSION, name, worldW: curWorldW, worldH: curWorldH, objects, enemyMode, terrainType: editorTerrain, triggers, customWinMsg, customLoseMsg, savedAt: Date.now() };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(maps));
    }

    function deleteMapByName(name) {
        const maps = listMaps();
        delete maps[name];
        localStorage.setItem(STORAGE_KEY, JSON.stringify(maps));
    }

    function loadMapByName(name) {
        const maps = listMaps();
        return maps[name] || null;
    }

    // ─────────────────────────────────────────────────────────────────────────────
    // VALIDATION
    // ─────────────────────────────────────────────────────────────────────────────

    function validateMegData(data) {
        if (!data || typeof data !== 'object') return 'Неверный формат файла';
        if (data.v !== MEG_VERSION)            return 'Неподдерживаемая версия .meg';
        if (!Array.isArray(data.objects))      return 'Нет данных объектов';
        if (data.terrainType !== undefined && !BIOMES.includes(data.terrainType)) return 'Неизвестный биом';
        if (data.enemyMode !== undefined && !['group', 'solo', 'custom'].includes(data.enemyMode)) return 'Неизвестный режим команд';
        for (const key of ['customWinMsg', 'customLoseMsg']) {
            const value = data[key];
            if (value !== undefined && !(typeof value === 'string' && value.length <= 4000) &&
                !(Array.isArray(value) && value.length <= 20 && value.every(message => typeof message === 'string' && message.length <= 200))) return 'Некорректные сообщения карты';
        }
        const ww = data.worldW || 900;
        const wh = data.worldH || 700;
        if (!Number.isFinite(ww) || !Number.isFinite(wh) || ww <= 0 || wh <= 0) return 'Некорректный размер карты';
        if (data.objects.some(o => !o || typeof o !== 'object' || Array.isArray(o))) return 'Некорректный объект карты';
        const physObjs = data.objects.filter(o => o.type === 'wall' || o.type === 'woodenWall' || o.type === 'box' || o.type === 'barrel');
        const enemyObjs = data.objects.filter(o => o.type === 'enemy');
        const allyObjs = data.objects.filter(o => o.type === 'ally');
        if (physObjs.length > MAX_OBJECTS) return `Слишком много объектов (макс. ${MAX_OBJECTS})`;
        if (enemyObjs.length > MAX_ENEMIES) return `Слишком много врагов (макс. ${MAX_ENEMIES})`;
        if (allyObjs.length > MAX_ALLIES) return `Слишком много союзников (макс. ${MAX_ALLIES})`;
        const triggerError = validateCustomMapTriggers(data.triggers === undefined ? [] : data.triggers, data.objects);
        if (triggerError) return triggerError;

        for (const obj of data.objects) {
            if (!OBJ_TYPES[obj.type]) return `Неизвестный тип объекта: ${obj.type}`;
            if ((['enemy', 'ally'].includes(obj.type)) && obj.tankType !== undefined && obj.tankType !== '' &&
                !isCustomMapTankType(obj.tankType)) return 'Неизвестный танк у бота';
            if (obj.health !== undefined && (!Number.isInteger(obj.health) || obj.health < 1 || obj.health > 100000)) return 'Некорректное здоровье бота';
            if (obj.team !== undefined && (!Number.isInteger(obj.team) || obj.team < 1 || obj.team > 4)) return 'Некорректная команда бота';
            if (obj.allyTeam !== undefined && (!Number.isInteger(obj.allyTeam) || obj.allyTeam < 1 || obj.allyTeam > 4)) return 'Некорректная команда союзника';
            for (const [key, limit] of [['customName', 32], ['customLabel', 64]]) {
                if (obj[key] !== undefined && (typeof obj[key] !== 'string' || obj[key].length > limit)) return 'Некорректная подпись бота';
            }
            if (!Number.isFinite(obj.x) || !Number.isFinite(obj.y)) return 'Некорректные координаты';
            if (!Number.isFinite(obj.w) || !Number.isFinite(obj.h) || obj.w <= 0 || obj.h <= 0) return 'Некорректный размер';
            if (obj.x < 0 || obj.y < 0 || obj.x + obj.w > ww + 50 || obj.y + obj.h > wh + 50)
                return 'Объект за пределами карты';
        }
        if (hasBlockedPlayerSpawn(data.objects)) return 'Место появления игрока занято препятствием';
        for (let i = 0; i < physObjs.length; i++) {
            for (let j = i + 1; j < physObjs.length; j++) {
                if (overlaps(physObjs[i], physObjs[j])) return 'Препятствия не должны находиться друг в друге';
            }
        }
        return null; // ok
    }

    function overlaps(a, b) {
        return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
    }

    function hasBlockedPlayerSpawn(objList) {
        const players = objList.filter(o => o.type === 'player');
        return players.some(player => objList.some(o =>
            (o.type === 'wall' || o.type === 'woodenWall' || o.type === 'box' || o.type === 'barrel') && overlaps(player, o)));
    }

    // ─────────────────────────────────────────────────────────────────────────────
    // UNDO
    // ─────────────────────────────────────────────────────────────────────────────

    function pushUndo(persist = false) {
        undoStack.push(JSON.stringify({ objects: meObjects, triggers: meTriggers, persist }));
        if (undoStack.length > 50) undoStack.shift();
        updateHUD();
    }

    function undo() {
        if (!undoStack.length) return;
        const snapshot = JSON.parse(undoStack[undoStack.length - 1]);
        if (snapshot.persist) {
            try { saveMap(nameInput.value.trim() || 'my_map', snapshot.objects, snapshot.triggers); }
            catch { showEditorToast('Не удалось сохранить отмену. Попробуй ещё раз.'); return; }
        }
        undoStack.pop();
        meObjects = snapshot.objects;
        meTriggers = snapshot.triggers;
        updateHUD();
        render();
    }

    // ─────────────────────────────────────────────────────────────────────────────
    // HUD
    // ─────────────────────────────────────────────────────────────────────────────

    function updateHUD() {
        if (!objectCountEl) return;
        selectedBots = selectedBots.filter(bot => meObjects.includes(bot));
        if (editSelectionBtn) {
            editSelectionBtn.disabled = selectedBots.length === 0;
            editSelectionBtn.textContent = `Настроить выбранных (${selectedBots.length})`;
        }
        refreshTriggersList();
        const physCount  = meObjects.filter(o => o.type === 'wall' || o.type === 'woodenWall' || o.type === 'box' || o.type === 'barrel').length;
        const enemyCount = meObjects.filter(o => o.type === 'enemy').length;
        const allyCount  = meObjects.filter(o => o.type === 'ally').length;
        objectCountEl.innerHTML = `<span>Препятствия: ${physCount}/${MAX_OBJECTS}</span><span>Враги: ${enemyCount}/${MAX_ENEMIES}</span><span>Союзники: ${allyCount}/${MAX_ALLIES}</span>`;
        if (undoBtn) undoBtn.disabled = undoStack.length === 0;
        if (mapSummaryEl) mapSummaryEl.textContent = `${nameInput.value.trim() || 'my_map'} · ${curWorldW}×${curWorldH}`;
        if (enemyHintEl) enemyHintEl.textContent = enemyMode === 'custom'
            ? 'У врагов четыре команды. Назначь цвет в настройках бота: одинаковый цвет — одна команда.' : enemyMode === 'solo'
            ? 'Каждый враг сражается за себя, в том числе против других врагов.'
            : 'Все враги в одной команде против игрока и союзников.';
    }

    // ─────────────────────────────────────────────────────────────────────────────
    // CANVAS SIZE / RESIZE
    // ─────────────────────────────────────────────────────────────────────────────

    function resizeCanvas() {
        if (!canvas || !canvasWrap) return;
        canvas.width  = canvasWrap.clientWidth;
        canvas.height = canvasWrap.clientHeight;
        render();
    }

    function renderToolArt() {
        document.querySelectorAll('.me-tool-art').forEach(preview => {
            const c = preview.getContext('2d');
            c.clearRect(0, 0, 32, 32);
            const obj = { type: preview.dataset.obstacle, x: 3, y: 3, w: 26, h: 26 };
            if (obj.type === 'wall') GameTerrain.drawWall(c, obj, editorTerrain);
            else if (obj.type === 'box') GameTerrain.drawBox(c, obj, editorTerrain);
            else if (obj.type === 'barrel') GameTerrain.drawBarrel(c, obj, editorTerrain);
            else { GameTerrain.drawWoodenWall(c, obj, editorTerrain); GameTerrain.drawWallCover(c, obj, editorTerrain); }
        });
    }

    // ─────────────────────────────────────────────────────────────────────────────
    // COORDINATE HELPERS
    // ─────────────────────────────────────────────────────────────────────────────

    /** Convert canvas-pixel mouse position to world coordinates */
    function toWorld(cx, cy) {
        return { wx: (cx - camX) / zoom, wy: (cy - camY) / zoom };
    }

    /** Snap world coord to grid */
    function snapToGrid(wx, wy) {
        return {
            gx: Math.floor(wx / gridSize) * gridSize,
            gy: Math.floor(wy / gridSize) * gridSize,
        };
    }

    function fitMap() {
        if (!canvas || !canvas.width || !canvas.height) return;
        zoom = Math.min(4, Math.min(canvas.width / curWorldW, canvas.height / curWorldH) * 0.9);
        camX = (canvas.width - curWorldW * zoom) / 2;
        camY = (canvas.height - curWorldH * zoom) / 2;
        hoverCell = null;
        render();
    }

    function zoomAt(factor, cx = canvas.width / 2, cy = canvas.height / 2) {
        const minZoom = Math.min(0.3, Math.min(canvas.width / curWorldW, canvas.height / curWorldH) * 0.9);
        if (minZoom <= 0) return;
        const newZoom = Math.max(minZoom, Math.min(4, zoom * factor));
        camX = cx - (cx - camX) * (newZoom / zoom);
        camY = cy - (cy - camY) * (newZoom / zoom);
        zoom = newZoom;
        hoverCell = null;
        render();
    }

    // ─────────────────────────────────────────────────────────────────────────────
    // RENDER
    // ─────────────────────────────────────────────────────────────────────────────

    function render() {
        if (!ctx) return;
        if (toolArtTerrain !== editorTerrain) { renderToolArt(); toolArtTerrain = editorTerrain; }
        if (zoomLevelEl) zoomLevelEl.textContent = `${Math.round(zoom * 100)}%`;
        if (zoomInBtn) zoomInBtn.disabled = zoom >= 4;
        const minZoom = Math.min(0.3, Math.min(canvas.width / curWorldW, canvas.height / curWorldH) * 0.9);
        if (zoomOutBtn) zoomOutBtn.disabled = zoom <= minZoom + 0.0001;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        ctx.save();
        ctx.translate(camX, camY);
        ctx.scale(zoom, zoom);

        GameTerrain.drawGround(ctx, -camX / zoom, -camY / zoom, canvas.width / zoom, canvas.height / zoom, editorTerrain);

        // Grid lines
        ctx.strokeStyle = 'rgba(0,0,0,0.2)';
        ctx.lineWidth = 0.5 / zoom;
        for (let x = 0; x <= curWorldW; x += gridSize) {
            ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, curWorldH); ctx.stroke();
        }
        for (let y = 0; y <= curWorldH; y += gridSize) {
            ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(curWorldW, y); ctx.stroke();
        }

        // World border
        ctx.strokeStyle = '#f39c12';
        ctx.lineWidth = 3 / zoom;
        ctx.strokeRect(0, 0, curWorldW, curWorldH);

        // Obstacles share the battle renderers, including biome coatings.
        for (const obj of meObjects) {
            if (obj.type === 'wall') GameTerrain.drawWall(ctx, obj, editorTerrain);
            else if (obj.type === 'woodenWall') {
                GameTerrain.drawWoodenWall(ctx, obj, editorTerrain);
                GameTerrain.drawWallCover(ctx, obj, editorTerrain);
            } else if (obj.type === 'box') GameTerrain.drawBox(ctx, obj, editorTerrain);
            else if (obj.type === 'barrel') GameTerrain.drawBarrel(ctx, obj, editorTerrain);
        }

        // Bot markers share selection, labels and vehicle previews.
        for (const obj of meObjects) {
            if (!['enemy', 'ally'].includes(obj.type)) continue;
            const def = OBJ_TYPES[obj.type], x = obj.x + obj.w / 2, y = obj.y + obj.h / 2;
            ctx.fillStyle = def.color;
            ctx.strokeStyle = def.stroke;
            ctx.lineWidth = 2 / zoom;
            ctx.beginPath(); ctx.arc(x, y, obj.w * 0.42, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
            ctx.fillStyle = '#fff';
            ctx.font = `bold ${Math.max(10, 16 / zoom)}px Arial`;
            ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
            if (!drawSpawnTank(obj, x, y)) ctx.fillText({ enemy: 'E', ally: 'A' }[obj.type], x, y);
            ctx.textBaseline = 'alphabetic';
        }

        // Player spawn marker
        const playerObj = meObjects.find(o => o.type === 'player');
        if (playerObj) {
            const px = playerObj.x + playerObj.w / 2, py = playerObj.y + playerObj.h / 2;
            const pr = playerObj.w * 0.42;
            ctx.fillStyle   = 'rgba(0,200,60,0.85)';
            ctx.strokeStyle = '#00ff55';
            ctx.lineWidth   = 2 / zoom;
            ctx.beginPath(); ctx.arc(px, py, pr, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
            ctx.fillStyle    = '#fff';
            ctx.font         = `bold ${Math.max(10, 16 / zoom)}px 'Courier New'`;
            ctx.textAlign    = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('P', px, py);
            ctx.textBaseline = 'alphabetic';
        }

        // Hover preview
        if (hoverCell && activeTool !== 'select') {
            if (activeTool === 'erase') {
                ctx.fillStyle   = 'rgba(255,60,60,0.35)';
                ctx.strokeStyle = '#ff4444';
                ctx.lineWidth = 1.5 / zoom;
                ctx.fillRect(hoverCell.gx, hoverCell.gy, gridSize, gridSize);
                ctx.strokeRect(hoverCell.gx, hoverCell.gy, gridSize, gridSize);
            } else if (activeTool === 'enemy') {
                const ex = hoverCell.gx + gridSize / 2, ey = hoverCell.gy + gridSize / 2;
                ctx.fillStyle = 'rgba(192,57,43,0.5)';
                ctx.strokeStyle = OBJ_TYPES[activeTool].stroke;
                ctx.lineWidth   = 1.5 / zoom;
                ctx.beginPath(); ctx.arc(ex, ey, gridSize * 0.42, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
            } else if (activeTool === 'ally') {
                const ax = hoverCell.gx + gridSize / 2, ay = hoverCell.gy + gridSize / 2;
                ctx.fillStyle   = 'rgba(41,128,185,0.5)';
                ctx.strokeStyle = '#3498db';
                ctx.lineWidth   = 1.5 / zoom;
                ctx.beginPath(); ctx.arc(ax, ay, gridSize * 0.42, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
            } else if (activeTool === 'player') {
                const px = hoverCell.gx + gridSize / 2, py = hoverCell.gy + gridSize / 2;
                ctx.fillStyle   = 'rgba(0,200,60,0.5)';
                ctx.strokeStyle = '#00ff55';
                ctx.lineWidth   = 1.5 / zoom;
                ctx.beginPath(); ctx.arc(px, py, gridSize * 0.42, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
            } else if (activeTool === 'barrel') {
                ctx.save(); ctx.globalAlpha = 0.55;
                GameTerrain.drawBarrel(ctx, { x: hoverCell.gx, y: hoverCell.gy, w: gridSize, h: gridSize }, editorTerrain);
                ctx.restore();
            } else {
                const preview = { type: activeTool, x: hoverCell.gx, y: hoverCell.gy, w: gridSize, h: gridSize };
                ctx.save(); ctx.globalAlpha = 0.6;
                if (activeTool === 'wall') GameTerrain.drawWall(ctx, preview, editorTerrain);
                else if (activeTool === 'box') GameTerrain.drawBox(ctx, preview, editorTerrain);
                else if (activeTool === 'woodenWall') {
                    GameTerrain.drawWoodenWall(ctx, preview, editorTerrain);
                    GameTerrain.drawWallCover(ctx, preview, editorTerrain);
                }
                ctx.restore();
            }
        }

        for (const bot of meObjects) {
            if (!['enemy', 'ally'].includes(bot.type)) continue;
            if (typeof drawCustomBotLabel === 'function') drawCustomBotLabel(ctx, bot, 1 / zoom);
        }
        ctx.strokeStyle = '#ffe08a';
        ctx.lineWidth = 2 / zoom;
        for (const bot of selectedBots) ctx.strokeRect(bot.x - 3 / zoom, bot.y - 3 / zoom, bot.w + 6 / zoom, bot.h + 6 / zoom);
        if (selectionBox) {
            ctx.fillStyle = 'rgba(255,224,138,0.15)';
            ctx.fillRect(selectionBox.x, selectionBox.y, selectionBox.w, selectionBox.h);
            ctx.strokeRect(selectionBox.x, selectionBox.y, selectionBox.w, selectionBox.h);
        }
        ctx.restore();
    }

    // ─────────────────────────────────────────────────────────────────────────────
    // PLACE / ERASE
    // ─────────────────────────────────────────────────────────────────────────────

    function placeAt(canvasX, canvasY) {
        if (activeTool === 'select') return;
        const { wx, wy } = toWorld(canvasX, canvasY);
        if (wx < 0 || wy < 0 || wx >= curWorldW || wy >= curWorldH) return;

        const { gx, gy } = snapToGrid(wx, wy);
        const occupiesCell = o => o.type === 'barrel'
            ? Math.floor(o.x / gridSize) * gridSize === gx && Math.floor(o.y / gridSize) * gridSize === gy
            : o.x === gx && o.y === gy;

        if (activeTool === 'erase') {
            const before = meObjects.length;
            meObjects = meObjects.filter(o => !occupiesCell(o));
            if (meObjects.length !== before) { updateHUD(); render(); }
            return;
        }

        // Player tool: only 1 allowed, replaces any existing
        if (activeTool === 'player') {
            const spawn = { x: gx, y: gy, w: gridSize, h: gridSize };
            if (meObjects.some(o => (o.type === 'wall' || o.type === 'woodenWall' || o.type === 'box' || o.type === 'barrel') && overlaps(spawn, o))) {
                showEditorToast('Место появления игрока занято препятствием');
                return;
            }
            meObjects = meObjects.filter(o => o.type !== 'player');
            meObjects.push({ type: 'player', ...spawn });
            updateHUD(); render();
            return;
        }

        const placementSize = gridSize;
        const placementX = gx + (gridSize - placementSize) / 2;
        const placementY = gy + (gridSize - placementSize) / 2;
        if (placementX + placementSize > curWorldW || placementY + placementSize > curWorldH) return;

        if (meObjects.some(occupiesCell)) return;
        if (['wall', 'woodenWall', 'box', 'barrel'].includes(activeTool) &&
            meObjects.some(o => ['wall', 'woodenWall', 'box', 'barrel'].includes(o.type) &&
                overlaps(o, { x: placementX, y: placementY, w: placementSize, h: placementSize }))) {
            showEditorToast('Это место уже занято другим препятствием');
            return;
        }

        if (['wall', 'woodenWall', 'box', 'barrel'].includes(activeTool) &&
            meObjects.some(o => o.type === 'player' && overlaps(o, { x: placementX, y: placementY, w: placementSize, h: placementSize }))) {
            showEditorToast('Нельзя ставить препятствие на место появления игрока');
            return;
        }

        if (activeTool === 'enemy') {
            if (meObjects.filter(o => o.type === 'enemy').length >= MAX_ENEMIES) {
                showEditorToast(`Лимит врагов: ${MAX_ENEMIES}`);
                return;
            }
        } else if (activeTool === 'ally') {
            if (meObjects.filter(o => o.type === 'ally').length >= MAX_ALLIES) {
                showEditorToast(`Лимит союзников: ${MAX_ALLIES}`);
                return;
            }
        } else {
            if (meObjects.filter(o => o.type === 'wall' || o.type === 'woodenWall' || o.type === 'box' || o.type === 'barrel').length >= MAX_OBJECTS) {
                showEditorToast(`Лимит объектов: ${MAX_OBJECTS}`);
                return;
            }
        }

        const placed = { type: activeTool, x: placementX, y: placementY, w: placementSize, h: placementSize };
        meObjects.push(placed);
        updateHUD();
        render();
    }

    // ─────────────────────────────────────────────────────────────────────────────
    // TOAST
    // ─────────────────────────────────────────────────────────────────────────────

    function showEditorToast(msg, isError = true) {
        let t = document.getElementById('meToast');
        if (!t) {
            t = document.createElement('div');
            t.id = 'meToast';
            t.style.cssText = 'position:fixed;bottom:30px;left:50%;transform:translateX(-50%);' +
                'background:#222;color:#fff;padding:10px 22px;border-radius:8px;font-size:14px;' +
                'z-index:9999;transition:opacity .3s;pointer-events:none;';
            document.body.appendChild(t);
        }
        t.style.background = isError ? '#c0392b' : '#27ae60';
        t.textContent = msg;
        t.style.opacity = '1';
        clearTimeout(t._timeout);
        t._timeout = setTimeout(() => { t.style.opacity = '0'; }, 2500);
    }

    // ─────────────────────────────────────────────────────────────────────────────
    // CONFIRM MODAL
    // ─────────────────────────────────────────────────────────────────────────────

    function showEditorConfirm(msg, onYes, onNo) {
        const overlay = document.getElementById('meConfirmOverlay');
        const msgEl   = document.getElementById('meConfirmMsg');
        const yesBtn  = document.getElementById('meConfirmYes');
        const noBtn   = document.getElementById('meConfirmNo');
        if (!overlay || !msgEl) {
            // Native fallback if modal not in DOM yet
            if (confirm(msg)) { if (onYes) onYes(); } else { if (onNo) onNo(); }
            return;
        }
        msgEl.textContent = msg;
        overlay.style.display = 'flex';
        const cleanup = () => { overlay.style.display = 'none'; };
        yesBtn.onclick = () => { cleanup(); if (onYes) onYes(); };
        noBtn.onclick  = () => { cleanup(); if (onNo)  onNo();  };
    }

    // ─────────────────────────────────────────────────────────────────────────────
    // MY MAPS MODAL
    // ─────────────────────────────────────────────────────────────────────────────

    function openMapsModal() {
        const mapsModal = document.getElementById('meMapsModal');
        const listEl    = document.getElementById('meMapsList');
        if (!mapsModal || !listEl) return;

        const maps = listMaps();
        listEl.innerHTML = '';

        const names = Object.keys(maps);
        if (names.length === 0) {
            listEl.innerHTML = '<div style="color:#aaa;text-align:center;padding:20px;">Нет сохранённых карт</div>';
        } else {
            names.forEach(name => {
                const map = removeNeutralMapData(maps[name]);
                const row = document.createElement('div');
                row.style.cssText = 'display:flex;align-items:center;gap:8px;background:rgba(0,0,0,0.4);padding:10px 12px;border-radius:8px;border:1px solid rgba(243,156,18,0.25);';

                const info = document.createElement('span');
                info.style.flex = '1';
                const date = map.savedAt ? new Date(map.savedAt).toLocaleDateString('ru-RU') : '';
                info.innerHTML = `<b>${escapeHtml(name)}</b> <span style="color:#aaa;font-size:12px;">${map.objects.length} объектов · ${date}</span>`;

                const loadBtn = document.createElement('button');
                loadBtn.textContent = '✏️ Изменить';
                loadBtn.className = 'btn me-btn me-btn-blue';
                loadBtn.style.cssText = 'font-size:12px;padding:5px 10px;margin:0;min-height:30px;';
                loadBtn.onclick = () => {
                    meObjects = JSON.parse(JSON.stringify(map.objects));
                    meTriggers = JSON.parse(JSON.stringify(map.triggers || []));
                    if (nameInput) nameInput.value = name;
                    // Restore map dimensions
                    if (map.worldW && map.worldH) {
                        curWorldW = map.worldW; curWorldH = map.worldH;
                        const sz = Object.entries(MAP_SIZES).find(([, s]) => s.w === map.worldW && s.h === map.worldH);
                        if (sz && mapSizeSelect) mapSizeSelect.value = sz[0];
                    }
                    // Restore enemy mode
                    enemyMode = map.enemyMode || 'group';
                    editorTerrain = map.terrainType || 'forest';
                    if (biomeSelect) biomeSelect.value = editorTerrain;
                    if (enemyModeSelect) enemyModeSelect.value = enemyMode;
                    // Restore custom messages
                    customWinMsg = normalizeCustomMapMessages(map.customWinMsg);
                    customLoseMsg = normalizeCustomMapMessages(map.customLoseMsg);
                    renderResultMessages();
                    undoStack = [];
                    updateHUD(); fitMap();
                    mapsModal.style.display = 'none';
                    showEditorToast(`Карта «${name}» загружена`, false);
                };
                if (window.deviceModeMobile) loadBtn.style.display = 'none';

                const playBtn = document.createElement('button');
                playBtn.textContent = '▶ Играть';
                playBtn.className = 'btn me-btn me-btn-green';
                playBtn.style.cssText = 'font-size:12px;padding:5px 10px;margin:0;min-height:30px;';
                playBtn.onclick = () => {
                    if (launchCustomMap(map.objects, map.worldW || 900, map.worldH || 700, map.terrainType || 'forest', map.triggers || [], map)) mapsModal.style.display = 'none';
                };

                const delBtn = document.createElement('button');
                delBtn.textContent = '🗑️';
                delBtn.className = 'btn me-btn me-btn-gray';
                delBtn.style.cssText = 'font-size:12px;padding:5px 8px;margin:0;min-height:30px;';
                delBtn.onclick = () => {
                    showEditorConfirm(`Удалить карту «${name}»?`, () => {
                        deleteMapByName(name);
                        openMapsModal();
                    });
                };

                row.append(info, loadBtn, playBtn, delBtn);
                listEl.appendChild(row);
            });
        }

        mapsModal.style.display = 'flex';
    }

    function escapeHtml(str) {
        return str.replace(/[&<>"']/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));
    }

    // ─────────────────────────────────────────────────────────────────────────────
    // EXPORT / IMPORT
    // ─────────────────────────────────────────────────────────────────────────────

    function exportMeg() {
        const name = (nameInput ? nameInput.value.trim() : '') || 'my_map';
        const data = { v: MEG_VERSION, name, worldW: curWorldW, worldH: curWorldH, objects: meObjects, enemyMode, terrainType: editorTerrain, triggers: meTriggers, customWinMsg, customLoseMsg, savedAt: Date.now() };
        const error = validateMegData(data);
        if (error) { showEditorToast(error); return; }
        const json = JSON.stringify(data, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url  = URL.createObjectURL(blob);
        const a    = document.createElement('a');
        a.href     = url;
        a.download = `${name}.meg`;
        a.click();
        URL.revokeObjectURL(url);
        showEditorToast('Карта экспортирована', false);
    }

    function importMeg(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            let data;
            try { data = JSON.parse(e.target.result); }
            catch { showEditorToast('\u041e\u0448\u0438\u0431\u043a\u0430: \u043d\u0435\u0432\u043e\u0437\u043c\u043e\u0436\u043d\u043e \u043f\u0440\u043e\u0447\u0438\u0442\u0430\u0442\u044c \u0444\u0430\u0439\u043b'); return; }

            data = removeNeutralMapData(data);
            const err = validateMegData(data);
            if (err) { showEditorToast(`\u041e\u0448\u0438\u0431\u043a\u0430: ${err}`); return; }

            pushUndo();
            meObjects = data.objects;
            meTriggers = data.triggers || [];
            const baseName = (typeof data.name === 'string' && data.name.trim()) || 'imported_map';
            const existingMaps = listMaps();
            let mapName = baseName;
            let copy = 2;
            while (Object.prototype.hasOwnProperty.call(existingMaps, mapName)) {
                mapName = `${baseName} (импорт ${copy++})`;
            }
            if (nameInput) nameInput.value = mapName;
            // Restore map size
            if (data.worldW && data.worldH) {
                curWorldW = data.worldW; curWorldH = data.worldH;
                const sz = Object.entries(MAP_SIZES).find(([, s]) => s.w === data.worldW && s.h === data.worldH);
                if (sz && mapSizeSelect) mapSizeSelect.value = sz[0];
            }
            // Restore enemy mode
            enemyMode = data.enemyMode || 'group';
            editorTerrain = data.terrainType || 'forest';
            if (biomeSelect) biomeSelect.value = editorTerrain;
            if (enemyModeSelect) enemyModeSelect.value = enemyMode;
            // Restore custom messages
            customWinMsg = normalizeCustomMapMessages(data.customWinMsg);
            customLoseMsg = normalizeCustomMapMessages(data.customLoseMsg);
            renderResultMessages();
            undoStack = [];

            // Auto-save imported map so it appears in the list
            saveMap(mapName, meObjects);

            updateHUD();
            if (!window.deviceModeMobile) fitMap();

            showEditorToast(`Карта «${mapName}» загружена`, false);

            // On mobile: refresh the maps list so the imported map appears
            if (window.deviceModeMobile) {
                openMapsModal();
            }
        };
        reader.readAsText(file);
    }

    // ─────────────────────────────────────────────────────────────────────────────
    // PLAY ON CUSTOM MAP
    // ─────────────────────────────────────────────────────────────────────────────

    function launchCustomMap(objList, worldW, worldH, terrainType = editorTerrain, triggers = meTriggers, settings = null) {
        worldW = worldW || curWorldW;
        worldH = worldH || curWorldH;
        const triggerError = validateCustomMapTriggers(triggers, objList);
        if (triggerError) { showEditorToast(triggerError); return false; }
        const physicsObjs = objList.filter(o => o.type === 'wall' || o.type === 'woodenWall' || o.type === 'box' || o.type === 'barrel');
        const enemySpawns = objList.filter(o => o.type === 'enemy');
        const allySpawns = objList.filter(o => o.type === 'ally');
        const playerSpawns = objList.filter(o => o.type === 'player');

        if (enemySpawns.length === 0 && allySpawns.length === 0) {
            showEditorToast('Добавь на карту хотя бы одного бота.');
            return;
        }
        if (playerSpawns.length === 0) {
            showEditorToast('⚠️ Не размещён спавн игрока (инструмент 🟢 Игрок)');
            return;
        }

        const playerSpawn = playerSpawns[0];
        if (hasBlockedPlayerSpawn(objList)) {
            showEditorToast('Место появления игрока занято препятствием. Уберите его в редакторе.');
            return false;
        }

        // Close editor
        closeBotSettings();
        modal.style.display = 'none';

        // Close main menu if open
        const mainMenu = document.getElementById('mainMenu');
        if (mainMenu) mainMenu.style.display = 'none';

        // Hand off to game
        if (typeof window.startCustomMapMode === 'function') {
            window.startCustomMapMode(
                JSON.parse(JSON.stringify(physicsObjs)),
                worldW, worldH,
                JSON.parse(JSON.stringify(enemySpawns)),
                JSON.parse(JSON.stringify(allySpawns)),
                JSON.parse(JSON.stringify(playerSpawn)),
                settings?.enemyMode || enemyMode,
                settings ? settings.customWinMsg : customWinMsg,
                settings ? settings.customLoseMsg : customLoseMsg,
                terrainType,
                triggers
            );
            return true;
        } else {
            // Fallback: direct injection
            if (typeof objects !== 'undefined') {
                objects.length = 0;
                JSON.parse(JSON.stringify(physicsObjs)).forEach(o => {
                    objects.push({ ...o, color: OBJ_TYPES[o.type] ? OBJ_TYPES[o.type].color : '#888' });
                });
            }
            if (typeof gameState !== 'undefined') {
                window._customMapActive = true;
                if (typeof startMode === 'function') {
                    startMode('single');
                } else {
                    // eslint-disable-next-line no-global-assign
                    gameState = 'playing';
                }
            }
            return true;
        }
    }

    // ─────────────────────────────────────────────────────────────────────────────
    // MOUSE / TOUCH EVENTS ON CANVAS
    // ─────────────────────────────────────────────────────────────────────────────

    function getCanvasPos(e) {
        const rect = canvas.getBoundingClientRect();
        const src  = e.touches ? e.touches[0] : e;
        return { cx: src.clientX - rect.left, cy: src.clientY - rect.top };
    }

    function onMouseDown(e) {
        if (e.button === 1 || e.button === 2) {
            // Middle / right → pan
            isPanning = true;
            hoverCell = null;
            canvasWrap.style.cursor = 'grabbing';
            const { cx, cy } = getCanvasPos(e);
            panStart = { x: cx - camX, y: cy - camY };
            e.preventDefault();
            render();
            return;
        }
        const { cx, cy } = getCanvasPos(e);
        if (activeTool === 'select') {
            const { wx, wy } = toWorld(cx, cy);
            selectionStart = { x: wx, y: wy };
            selectionBase = e.ctrlKey || e.shiftKey || e.metaKey ? [...selectedBots] : [];
            const hit = meObjects.find(bot => (['enemy', 'ally'].includes(bot.type)) &&
                wx >= bot.x && wx < bot.x + bot.w && wy >= bot.y && wy < bot.y + bot.h);
            selectedBots = hit ? (selectionBase.includes(hit) ? selectionBase.filter(bot => bot !== hit) : [...selectionBase, hit]) : selectionBase;
            updateHUD(); render();
            return;
        }
        if (openBotSettingsAt(cx, cy)) return;
        isDrawing = true;
        pushUndo();
        placeAt(cx, cy);
    }

    function onMouseMove(e) {
        const { cx, cy } = getCanvasPos(e);
        if (selectionStart) {
            const { wx, wy } = toWorld(cx, cy);
            selectionBox = { x: Math.min(wx, selectionStart.x), y: Math.min(wy, selectionStart.y),
                w: Math.abs(wx - selectionStart.x), h: Math.abs(wy - selectionStart.y) };
            if (selectionBox.w > 3 / zoom || selectionBox.h > 3 / zoom) {
                selectedBots = [...new Set([...selectionBase, ...meObjects.filter(bot =>
                    (['enemy', 'ally'].includes(bot.type)) && overlaps(bot, selectionBox))])];
            }
            updateHUD(); render();
            return;
        }

        if (isPanning) {
            camX = cx - panStart.x;
            camY = cy - panStart.y;
            render();
            return;
        }

        const { wx, wy } = toWorld(cx, cy);
        if (coordsEl) {
            const bot = meObjects.find(obj => (['enemy', 'ally'].includes(obj.type)) &&
                wx >= obj.x && wx < obj.x + obj.w && wy >= obj.y && wy < obj.y + obj.h);
            coordsEl.textContent = `X: ${Math.floor(wx)}  Y: ${Math.floor(wy)}` +
                (bot ? ` · ${OBJ_TYPES[bot.type].label}: ${spawnTankName(bot.tankType)}` : '');
        }

        if (wx >= 0 && wy >= 0 && wx < curWorldW && wy < curWorldH) {
            hoverCell = snapToGrid(wx, wy);
        } else {
            hoverCell = null;
        }

        if (isDrawing) placeAt(cx, cy);
        else render();
    }

    function onMouseUp() {
        isDrawing = false; isPanning = false;
        selectionStart = null; selectionBox = null;
        if (canvasWrap) canvasWrap.style.cursor = activeTool === 'select' ? 'default' : 'crosshair';
        render();
    }

    function onWheel(e) {
        e.preventDefault();
        const { cx, cy } = getCanvasPos(e);
        zoomAt(e.deltaY > 0 ? 0.85 : 1.18, cx, cy);
    }

    function onTouchStart(e) {
        if (e.touches.length === 1) {
            e.preventDefault();
            const { cx, cy } = getCanvasPos(e);
            if (openBotSettingsAt(cx, cy)) return;
            isDrawing = true;
            pushUndo();
            placeAt(cx, cy);
        }
    }

    function onTouchMove(e) {
        e.preventDefault();
        if (e.touches.length === 1) {
            const { cx, cy } = getCanvasPos(e);
            if (isDrawing) placeAt(cx, cy);
        }
    }

    function onTouchEnd(e) {
        isDrawing = false;
    }

    // ─────────────────────────────────────────────────────────────────────────────
    // TOOL BUTTONS
    // ─────────────────────────────────────────────────────────────────────────────

    function setTool(tool) {
        onMouseUp();
        activeTool = tool;
        document.querySelectorAll('.me-tool-btn[data-tool]').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tool === tool);
            btn.setAttribute('aria-pressed', String(btn.dataset.tool === tool));
        });
        const hints = {
            wall: 'Зажми левую кнопку мыши, чтобы рисовать стены.',
            woodenWall: 'Деревянная стена — разрушаемое укрытие. Зажми ЛКМ, чтобы рисовать.',
            box: 'Ящики можно толкать в бою. Нажми на свободную клетку.',
            barrel: 'Взрывная бочка. Нажми на свободную клетку.',
            player: 'Нажми, чтобы выбрать старт игрока. Повторный клик перенесёт его.',
            enemy: 'Нажми, чтобы добавить врага. Клик по боту — выбор его техники.',
            ally: 'Нажми, чтобы добавить союзника. Клик по боту — выбор его техники.',
            erase: 'Зажми левую кнопку мыши, чтобы удалять объекты. Ctrl Z — отменить.',
            select: 'Обведи ботов рамкой. Ctrl / Shift + клик — добавить или убрать бота.'
        };
        if (toolNameEl) toolNameEl.textContent = tool === 'select' ? 'Выделение ботов' : tool === 'erase' ? 'Ластик' : OBJ_TYPES[tool].label;
        if (toolHintEl) toolHintEl.textContent = hints[tool];
        // Update canvas cursor
        if (canvasWrap) canvasWrap.style.cursor = tool === 'select' ? 'default' : 'crosshair';
        render();
    }

    // ─────────────────────────────────────────────────────────────────────────────
    // OPEN / CLOSE EDITOR
    // ─────────────────────────────────────────────────────────────────────────────

    function openEditor() {
        closeBotSettings();
        // On mobile: show only import/load view
        if (window.deviceModeMobile) {
            modal.style.display = 'flex';
            const workspace = modal.querySelector('.me-workspace');
            const header = modal.querySelector('.me-header');
            if (workspace) workspace.style.display = 'none';
            if (header) header.style.display = 'none';
            openMapsModal();
            return;
        }

        // On desktop: show full editor
        modal.style.display = 'flex';
        const workspace = modal.querySelector('.me-workspace');
        const header = modal.querySelector('.me-header');
        if (workspace) workspace.style.display = 'flex';
        if (header) header.style.display = 'flex';
        resizeCanvas();

        fitMap();
    }

    function closeEditor() {
        onMouseUp();
        closeBotSettings();
        modal.style.display = 'none';
        // Return to main menu properly (works on mobile too)
        if (typeof window.goToMenuNoReload === 'function') {
            window.goToMenuNoReload();
        } else {
            const mainMenu = document.getElementById('mainMenu');
            if (mainMenu) mainMenu.style.display = 'flex';
        }
    }

    // ─────────────────────────────────────────────────────────────────────────────
    // INIT
    // ─────────────────────────────────────────────────────────────────────────────

    function init() {
        modal       = document.getElementById('mapEditorModal');
        canvas      = document.getElementById('meCanvas');
        canvasWrap  = document.getElementById('meCanvasWrap');
        if (!modal || !canvas || !canvasWrap) return;

        ctx             = canvas.getContext('2d');
        nameInput       = document.getElementById('meMapName');
        mapSizeSelect   = document.getElementById('meMapSize');
        enemyModeSelect = document.getElementById('meEnemyMode');
        botModal = document.getElementById('meBotModal');
        botTankSelect = document.getElementById('meBotTank');
        botTitle = document.getElementById('meBotTitle');
        document.querySelectorAll('[data-trigger-slot]').forEach(button => {
            button.addEventListener('click', () => switchBotTriggerSlot(Number(button.dataset.triggerSlot)));
        });
        document.getElementById('meTriggerEnabled').addEventListener('change', () => { botTriggerDrafts[activeTriggerSlot].dirty = true; });
        document.getElementById('meTriggerTime').addEventListener('input', () => {
            botTriggerDrafts[activeTriggerSlot].dirty = true;
            document.getElementById('meTriggerEnabled').checked = true;
        });
        for (const [key, [inputId, checkId]] of Object.entries(BOT_FIELDS)) {
            botInputs[key] = document.getElementById(inputId);
            botChecks[key] = document.getElementById(checkId);
            botInputs[key].addEventListener('input', () => {
                botChecks[key].checked = true;
                if (key === 'type') updateBotTeamFields();
                if (activeTriggerSlot > 0) document.getElementById('meTriggerEnabled').checked = true;
            });
            if (key === 'type') botChecks[key].addEventListener('change', updateBotTeamFields);
        }
        biomeSelect = document.getElementById('meBiome');
        biomeSelect?.addEventListener('change', () => {
            editorTerrain = biomeSelect.value;
            render();
            try { saveMap(nameInput.value.trim() || 'my_map', meObjects); }
            catch { showEditorToast('Не удалось сохранить биом. Попробуй сохранить карту ещё раз.'); }
        });
        editSelectionBtn = document.getElementById('meEditSelection');
        editSelectionBtn?.addEventListener('click', () => openBotSettings(selectedBots));
        document.getElementById('meSelectAll')?.addEventListener('click', () => selectBots());
        document.getElementById('meSelectEnemies')?.addEventListener('click', () => selectBots('enemy'));
        document.getElementById('meSelectAllies')?.addEventListener('click', () => selectBots('ally'));
        const botTankTypes = [...Object.keys(tankMaxHpByType), ...Object.keys(window.mechMaxHpByType || {})].filter(isCustomMapTankType);
        if (botTankSelect) {
            for (const type of botTankTypes) {
                const option = document.createElement('option');
                option.value = type;
                option.textContent = spawnTankName(type);
                botTankSelect.appendChild(option);
            }
        }
        document.getElementById('meBotApply')?.addEventListener('click', applyBotTank);
        document.getElementById('meBotCancel')?.addEventListener('click', closeBotSettings);
        botModal?.addEventListener('click', e => { if (e.target === botModal) closeBotSettings(); });
        for (const kind of ['Win', 'Lose']) document.getElementById(`meAdd${kind}Message`).addEventListener('click', () => {
            const messages = kind === 'Win' ? customWinMsg : customLoseMsg;
            if (messages.length >= 20) return;
            messages.push(''); renderResultMessages();
            document.getElementById(`me${kind}Message${messages.length - 1}`).focus();
        });
        renderResultMessages();
        objectCountEl   = document.getElementById('meObjectCount');
        coordsEl        = document.getElementById('meCoords');
        toolNameEl      = document.getElementById('meToolName');
        toolHintEl      = document.getElementById('meToolHint');
        enemyHintEl     = document.getElementById('meEnemyHint');
        undoBtn         = document.getElementById('meUndoBtn');
        zoomLevelEl     = document.getElementById('meZoomLevel');
        zoomInBtn       = document.getElementById('meZoomIn');
        zoomOutBtn      = document.getElementById('meZoomOut');
        mapSummaryEl    = document.getElementById('meMapSummary');
        nameInput?.addEventListener('input', updateHUD);
        zoomInBtn?.addEventListener('click', () => zoomAt(1.18));
        zoomOutBtn?.addEventListener('click', () => zoomAt(0.85));
        document.getElementById('meFitBtn')?.addEventListener('click', fitMap);

        // Resize observer
        const ro = new ResizeObserver(resizeCanvas);
        ro.observe(canvasWrap);

        // Canvas events
        canvas.addEventListener('mousedown',  onMouseDown);
        canvas.addEventListener('mousemove',  onMouseMove);
        canvas.addEventListener('mouseup',    onMouseUp);
        canvas.addEventListener('mouseleave', () => {
            onMouseUp();
            hoverCell = null;
            routeHover = null;
            if (coordsEl) coordsEl.textContent = 'X: — · Y: —';
            render();
        });
        canvas.addEventListener('wheel',      onWheel, { passive: false });
        canvas.addEventListener('contextmenu', e => e.preventDefault());
        canvas.addEventListener('touchstart', onTouchStart, { passive: false });
        canvas.addEventListener('touchmove',  onTouchMove,  { passive: false });
        canvas.addEventListener('touchend',   onTouchEnd);

        // Tool buttons
        document.querySelectorAll('.me-tool-btn[data-tool]').forEach(btn => {
            btn.addEventListener('click', () => setTool(btn.dataset.tool));
        });

        // Map size select
        if (mapSizeSelect) {
            mapSizeSelect.addEventListener('change', () => {
                const sz = MAP_SIZES[mapSizeSelect.value];
                if (sz) { curWorldW = sz.w; curWorldH = sz.h; updateHUD(); fitMap(); }
            });
        }

        // Enemy mode select
        if (enemyModeSelect) {
            enemyModeSelect.addEventListener('change', () => {
                enemyMode = enemyModeSelect.value;
                updateHUD();
            });
        }

        // Header buttons
        document.getElementById('meNewBtn')?.addEventListener('click', () => {
            const doNew = () => {
                closeBotSettings();
                // Auto-save current map with messages before creating new
                if (meObjects.length > 0) {
                    const name = (nameInput ? nameInput.value.trim() : '') || 'my_map';
                    saveMap(name, meObjects);
                }
                pushUndo();
                meObjects = [];
                meTriggers = [];
                undoStack = [];
                if (nameInput) nameInput.value = 'my_map';
                if (mapSizeSelect) { mapSizeSelect.value = 'small'; curWorldW = 900; curWorldH = 700; }
                // Clear custom win/lose messages for the new map
                customWinMsg = [];
                customLoseMsg = [];
                editorTerrain = 'forest';
                if (biomeSelect) biomeSelect.value = editorTerrain;
                renderResultMessages();
                updateHUD(); fitMap();
            };
            if (meObjects.length) {
                showEditorConfirm('Очистить текущую карту и начать новую?', doNew);
            } else {
                doNew();
            }
        });

        document.getElementById('meSettingsBtn')?.addEventListener('click', () => {
            document.getElementById('meSettingsModal').style.display = 'flex';
            refreshTriggersList();
        });
        document.getElementById('meSettingsClose')?.addEventListener('click', () => {
            const name = (nameInput ? nameInput.value.trim() : '') || 'my_map';
            try { saveMap(name, meObjects); }
            catch { showEditorToast('Не удалось сохранить настройки карты.'); return; }
            document.getElementById('meSettingsModal').style.display = 'none';
            showEditorToast(`Карта «${name}» сохранена`, false);
        });

        document.getElementById('meMapsBtn')?.addEventListener('click', openMapsModal);

        document.getElementById('meSaveBtn')?.addEventListener('click', () => {
            const name = (nameInput ? nameInput.value.trim() : '') || 'my_map';
            saveMap(name, meObjects);
            showEditorToast(`Карта «${name}» сохранена`, false);
        });

        document.getElementById('meExportBtn')?.addEventListener('click', () => {
            if (meObjects.length === 0) { showEditorToast('Карта пустая — нечего экспортировать'); return; }
            // Auto-save before export
            const name = (nameInput ? nameInput.value.trim() : '') || 'my_map';
            saveMap(name, meObjects);
            exportMeg();
        });

        document.getElementById('meImportBtn')?.addEventListener('click', () => {
            document.getElementById('meFileInput')?.click();
        });

        document.getElementById('meFileInput')?.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) importMeg(file);
            e.target.value = '';
        });

        document.getElementById('mePlayBtn')?.addEventListener('click', () => {
            if (meObjects.length === 0) { showEditorToast('Карта пустая — нельзя играть'); return; }
            // Auto-save
            const name = (nameInput ? nameInput.value.trim() : '') || 'my_map';
            saveMap(name, meObjects);
            launchCustomMap(meObjects);
        });

        document.getElementById('meCloseBtn')?.addEventListener('click', () => {
            // Auto-save on close if there are objects
            if (meObjects.length > 0) {
                const name = (nameInput ? nameInput.value.trim() : '') || 'my_map';
                saveMap(name, meObjects);
                showEditorToast(`Карта «${name}» сохранена`, false);
            }
            closeEditor();
        });

        document.getElementById('meClearBtn')?.addEventListener('click', () => {
            if (meObjects.length === 0) return;
            showEditorConfirm('Очистить все объекты?', () => {
                pushUndo();
                meObjects = [];
                meTriggers = [];
                updateHUD(); render();
            });
        });

        document.getElementById('meUndoBtn')?.addEventListener('click', undo);

        document.getElementById('meMapsClose')?.addEventListener('click', () => {
            document.getElementById('meMapsModal').style.display = 'none';
            // On mobile: also close the editor overlay to avoid the orange border
            if (window.deviceModeMobile) closeEditor();
        });

        // Open editor button from main menu (desktop green button and mobile grey button)
        document.getElementById('mapEditorBtn')?.addEventListener('click', openEditor);
        document.getElementById('mapEditorMobileBtn')?.addEventListener('click', openEditor);

        // Keyboard shortcut: Ctrl+Z
        document.addEventListener('keydown', (e) => {
            if (modal.style.display === 'none') return;
            if (botModal && botModal.style.display !== 'none') {
                if (e.key === 'Escape') { e.preventDefault(); closeBotSettings(); }
                return;
            }
            for (const id of ['meConfirmOverlay', 'meMapsModal', 'meSettingsModal']) {
                const dialog = document.getElementById(id);
                if (dialog && dialog.style.display !== 'none') {
                    if (e.key === 'Escape') {
                        e.preventDefault();
                        if (id === 'meConfirmOverlay') document.getElementById('meConfirmNo').click();
                        else if (id === 'meMapsModal') document.getElementById('meMapsClose').click();
                        else document.getElementById('meSettingsClose').click();
                    }
                    return;
                }
            }
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') return;
            if (e.ctrlKey || e.metaKey) {
                if (e.key.toLowerCase() === 'z') { e.preventDefault(); undo(); }
                return;
            }
            if (e.key === 'Escape') closeEditor();
            if (e.key === '1') setTool('wall');
            if (e.key === '2') setTool('woodenWall');
            if (e.key === '3') setTool('box');
            if (e.key === '4') setTool('barrel');
            if (e.key === '5') setTool('player');
            if (e.key === '6') setTool('enemy');
            if (e.key === '7') setTool('ally');
            if (e.key === '8') setTool('select');
            if (e.key === '9') setTool('erase');
        });

        updateHUD();
    }

    // ─────────────────────────────────────────────────────────────────────────────
    // EXPOSE to main.js
    // ─────────────────────────────────────────────────────────────────────────────
    window.openMapEditor = openEditor;

    // Boot when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
