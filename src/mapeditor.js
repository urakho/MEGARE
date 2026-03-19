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
    const MAX_ALLIES   = 40;          // max ally spawn points per map
    const STORAGE_KEY  = 'me_maps';  // localStorage key for saved maps
    const MEG_VERSION  = 1;          // .meg file format version

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
        wall:   { color: '#3a3a3a', stroke: '#666666', label: 'Стена'    },
        box:    { color: '#8b5a2b', stroke: '#c0803a', label: 'Ящик'     },
        barrel: { color: '#7a4d2a', stroke: '#c87d40', label: 'Бочка'    },
        enemy:  { color: '#c0392b', stroke: '#e74c3c', label: 'Враг'     },
        ally:   { color: '#2980b9', stroke: '#3498db', label: 'Союзник'  },
        player: { color: '#00cc44', stroke: '#00ff55', label: 'Игрок'    },
    };

    // ─── state ─────────────────────────────────────────────────────────────────
    let meObjects  = [];       // { type, x, y, w, h }
    let undoStack  = [];       // snapshots for undo
    let activeTool = 'wall';   // 'wall' | 'box' | 'barrel' | 'erase' | 'enemy' | 'player'
    let enemyMode  = 'group';  // 'group' = all team 1 | 'solo' = each own team
    let customWinMsg  = '';    // shown on result screen when player wins
    let customLoseMsg = '';    // shown on result screen when player loses
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
    let nameInput, mapSizeSelect, enemyModeSelect, winMsgInput, loseMsgInput, objectCountEl, coordsEl;

    // ─────────────────────────────────────────────────────────────────────────────
    // STORAGE
    // ─────────────────────────────────────────────────────────────────────────────

    function listMaps() {
        try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'); }
        catch { return {}; }
    }

    function saveMap(name, objects) {
        const maps = listMaps();
        maps[name] = { v: MEG_VERSION, name, worldW: curWorldW, worldH: curWorldH, objects, enemyMode, customWinMsg, customLoseMsg, savedAt: Date.now() };
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
        const ww = data.worldW || 900;
        const wh = data.worldH || 700;
        const physObjs = data.objects.filter(o => o.type === 'wall' || o.type === 'box' || o.type === 'barrel');
        const enemyObjs = data.objects.filter(o => o.type === 'enemy');
        const allyObjs = data.objects.filter(o => o.type === 'ally');
        if (physObjs.length > MAX_OBJECTS) return `Слишком много объектов (макс. ${MAX_OBJECTS})`;
        if (enemyObjs.length > MAX_ENEMIES) return `Слишком много врагов (макс. ${MAX_ENEMIES})`;
        if (allyObjs.length > MAX_ALLIES) return `Слишком много союзников (макс. ${MAX_ALLIES})`;

        for (const obj of data.objects) {
            if (!OBJ_TYPES[obj.type]) return `Неизвестный тип объекта: ${obj.type}`;
            if (typeof obj.x !== 'number' || typeof obj.y !== 'number') return 'Некорректные координаты';
            if (typeof obj.w !== 'number' || typeof obj.h !== 'number') return 'Некорректный размер';
            if (obj.x < 0 || obj.y < 0 || obj.x + obj.w > ww + 50 || obj.y + obj.h > wh + 50)
                return 'Объект за пределами карты';
        }
        return null; // ok
    }

    // ─────────────────────────────────────────────────────────────────────────────
    // UNDO
    // ─────────────────────────────────────────────────────────────────────────────

    function pushUndo() {
        undoStack.push(JSON.stringify(meObjects));
        if (undoStack.length > 50) undoStack.shift();
    }

    function undo() {
        if (!undoStack.length) return;
        meObjects = JSON.parse(undoStack.pop());
        updateHUD();
        render();
    }

    // ─────────────────────────────────────────────────────────────────────────────
    // HUD
    // ─────────────────────────────────────────────────────────────────────────────

    function updateHUD() {
        if (!objectCountEl) return;
        const physCount  = meObjects.filter(o => o.type === 'wall' || o.type === 'box' || o.type === 'barrel').length;
        const enemyCount = meObjects.filter(o => o.type === 'enemy').length;
        const allyCount  = meObjects.filter(o => o.type === 'ally').length;
        const hasPlayer  = meObjects.some(o => o.type === 'player');
        objectCountEl.textContent = `Объектов: ${physCount}/${MAX_OBJECTS}  Врагов: ${enemyCount}/${MAX_ENEMIES}  Союзников: ${allyCount}/${MAX_ALLIES}  ${hasPlayer ? '✅ Игрок' : '⚠️ Нет игрока'}`;
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

    // ─────────────────────────────────────────────────────────────────────────────
    // RENDER
    // ─────────────────────────────────────────────────────────────────────────────

    function render() {
        if (!ctx) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        ctx.save();
        ctx.translate(camX, camY);
        ctx.scale(zoom, zoom);

        // Background (game canvas color)
        ctx.fillStyle = '#445522';
        ctx.fillRect(0, 0, curWorldW, curWorldH);

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

        // Placed objects (walls / boxes / barrels)
        for (const obj of meObjects) {
            if (obj.type === 'enemy' || obj.type === 'player' || obj.type === 'ally') continue;
            if (obj.type === 'barrel') {
                // Draw barrel as a red-banded cylinder preview
                const bx = obj.x, by = obj.y, bw = obj.w, bh = obj.h;
                const bcx = bx + bw / 2;
                const grad = ctx.createLinearGradient(bx, by, bx, by + bh);
                grad.addColorStop(0,    '#4b2b17');
                grad.addColorStop(0.45, '#7a4d2a');
                grad.addColorStop(0.55, '#c27f48');
                grad.addColorStop(1,    '#5a2f18');
                ctx.fillStyle = grad;
                ctx.fillRect(bx, by + bh * 0.1, bw, bh * 0.8);
                ctx.fillStyle = '#33363a';
                ctx.fillRect(bx, by + bh * 0.28, bw, Math.max(3, bh * 0.08));
                ctx.fillRect(bx, by + bh * 0.62, bw, Math.max(3, bh * 0.08));
                // hazard stripe
                ctx.fillStyle = 'rgba(255,80,0,0.7)';
                ctx.font = `bold ${Math.max(8, bh * 0.45)}px 'Courier New'`;
                ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
                ctx.fillText('💥', bcx, by + bh / 2);
                ctx.textBaseline = 'alphabetic';
            } else {
                const def = OBJ_TYPES[obj.type];
                ctx.fillStyle = def.color;
                ctx.fillRect(obj.x, obj.y, obj.w, obj.h);
                ctx.strokeStyle = def.stroke;
                ctx.lineWidth = 1 / zoom;
                ctx.strokeRect(obj.x, obj.y, obj.w, obj.h);
            }
        }

        // Enemy spawn markers
        for (const obj of meObjects) {
            if (obj.type !== 'enemy') continue;
            const ex = obj.x + obj.w / 2, ey = obj.y + obj.h / 2;
            const er = obj.w * 0.42;
            ctx.fillStyle   = 'rgba(192,57,43,0.85)';
            ctx.strokeStyle = '#e74c3c';
            ctx.lineWidth   = 2 / zoom;
            ctx.beginPath(); ctx.arc(ex, ey, er, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
            ctx.fillStyle    = '#fff';
            ctx.font         = `bold ${Math.max(10, 16 / zoom)}px 'Courier New'`;
            ctx.textAlign    = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('E', ex, ey);
            ctx.textBaseline = 'alphabetic';
        }

        // Ally spawn markers
        for (const obj of meObjects) {
            if (obj.type !== 'ally') continue;
            const ax = obj.x + obj.w / 2, ay = obj.y + obj.h / 2;
            const ar = obj.w * 0.42;
            ctx.fillStyle   = 'rgba(41,128,185,0.85)';
            ctx.strokeStyle = '#3498db';
            ctx.lineWidth   = 2 / zoom;
            ctx.beginPath(); ctx.arc(ax, ay, ar, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
            ctx.fillStyle    = '#fff';
            ctx.font         = `bold ${Math.max(10, 16 / zoom)}px 'Courier New'`;
            ctx.textAlign    = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('A', ax, ay);
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
        } else {
            // Faint hint: place your player here
            ctx.fillStyle   = 'rgba(0,255,80,0.08)';
            ctx.strokeStyle = 'rgba(0,255,80,0.3)';
            ctx.lineWidth   = 2 / zoom;
            ctx.setLineDash([4 / zoom, 4 / zoom]);
            ctx.beginPath();
            ctx.arc(50, curWorldH - 50, 24, 0, Math.PI * 2);
            ctx.fill(); ctx.stroke();
            ctx.setLineDash([]);
            ctx.fillStyle    = 'rgba(0,255,80,0.4)';
            ctx.font         = `bold ${Math.max(10, 12 / zoom)}px 'Courier New'`;
            ctx.textAlign    = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('P?', 50, curWorldH - 50);
            ctx.textBaseline = 'alphabetic';
        }

        // Hover preview
        if (hoverCell) {
            if (activeTool === 'erase') {
                ctx.fillStyle   = 'rgba(255,60,60,0.35)';
                ctx.strokeStyle = '#ff4444';
                ctx.lineWidth = 1.5 / zoom;
                ctx.fillRect(hoverCell.gx, hoverCell.gy, gridSize, gridSize);
                ctx.strokeRect(hoverCell.gx, hoverCell.gy, gridSize, gridSize);
            } else if (activeTool === 'enemy') {
                const ex = hoverCell.gx + gridSize / 2, ey = hoverCell.gy + gridSize / 2;
                ctx.fillStyle   = 'rgba(192,57,43,0.5)';
                ctx.strokeStyle = '#e74c3c';
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
                ctx.fillStyle   = 'rgba(122,77,42,0.5)';
                ctx.strokeStyle = '#c87d40';
                ctx.lineWidth = 1.5 / zoom;
                ctx.fillRect(hoverCell.gx, hoverCell.gy, gridSize, gridSize);
                ctx.strokeRect(hoverCell.gx, hoverCell.gy, gridSize, gridSize);
            } else {
                const def = OBJ_TYPES[activeTool] || OBJ_TYPES.wall;
                ctx.fillStyle   = def.color + 'aa';
                ctx.strokeStyle = def.stroke;
                ctx.lineWidth = 1.5 / zoom;
                ctx.fillRect(hoverCell.gx, hoverCell.gy, gridSize, gridSize);
                ctx.strokeRect(hoverCell.gx, hoverCell.gy, gridSize, gridSize);
            }
        }

        ctx.restore();
    }

    // ─────────────────────────────────────────────────────────────────────────────
    // PLACE / ERASE
    // ─────────────────────────────────────────────────────────────────────────────

    function placeAt(canvasX, canvasY) {
        const { wx, wy } = toWorld(canvasX, canvasY);
        if (wx < 0 || wy < 0 || wx >= curWorldW || wy >= curWorldH) return;

        const { gx, gy } = snapToGrid(wx, wy);

        if (activeTool === 'erase') {
            const before = meObjects.length;
            meObjects = meObjects.filter(o => !(o.x === gx && o.y === gy));
            if (meObjects.length !== before) { updateHUD(); render(); }
            return;
        }

        // Player tool: only 1 allowed, replaces any existing
        if (activeTool === 'player') {
            meObjects = meObjects.filter(o => o.type !== 'player');
            meObjects.push({ type: 'player', x: gx, y: gy, w: gridSize, h: gridSize });
            updateHUD(); render();
            return;
        }

        // Check for duplicate on same cell
        if (meObjects.some(o => o.x === gx && o.y === gy)) return;

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
            if (meObjects.filter(o => o.type === 'wall' || o.type === 'box' || o.type === 'barrel').length >= MAX_OBJECTS) {
                showEditorToast(`Лимит объектов: ${MAX_OBJECTS}`);
                return;
            }
        }

        meObjects.push({ type: activeTool, x: gx, y: gy, w: gridSize, h: gridSize });
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
                const map = maps[name];
                const row = document.createElement('div');
                row.style.cssText = 'display:flex;align-items:center;gap:8px;background:#334;padding:8px 12px;border-radius:8px;';

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
                    if (nameInput) nameInput.value = name;
                    // Restore map dimensions
                    if (map.worldW && map.worldH) {
                        curWorldW = map.worldW; curWorldH = map.worldH;
                        const sz = Object.entries(MAP_SIZES).find(([, s]) => s.w === map.worldW && s.h === map.worldH);
                        if (sz && mapSizeSelect) mapSizeSelect.value = sz[0];
                    }
                    // Restore enemy mode
                    enemyMode = map.enemyMode || 'group';
                    if (enemyModeSelect) enemyModeSelect.value = enemyMode;
                    // Restore custom messages
                    customWinMsg  = map.customWinMsg  || '';
                    customLoseMsg = map.customLoseMsg || '';
                    if (winMsgInput)  winMsgInput.value  = customWinMsg;
                    if (loseMsgInput) loseMsgInput.value = customLoseMsg;
                    undoStack = [];
                    updateHUD(); render();
                    mapsModal.style.display = 'none';
                    showEditorToast(`Карта «${name}» загружена`, false);
                };
                if (window.deviceModeMobile) loadBtn.style.display = 'none';

                const playBtn = document.createElement('button');
                playBtn.textContent = '▶ Играть';
                playBtn.className = 'btn me-btn me-btn-red';
                playBtn.style.cssText = 'font-size:12px;padding:5px 10px;margin:0;min-height:30px;';
                playBtn.onclick = () => {
                    // Restore enemy mode before launching
                    enemyMode = map.enemyMode || 'group';
                    mapsModal.style.display = 'none';
                    launchCustomMap(map.objects, map.worldW || 900, map.worldH || 700);
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
        const data = { v: MEG_VERSION, name, worldW: curWorldW, worldH: curWorldH, objects: meObjects, enemyMode, customWinMsg, customLoseMsg, savedAt: Date.now() };
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

            const err = validateMegData(data);
            if (err) { showEditorToast(`\u041e\u0448\u0438\u0431\u043a\u0430: ${err}`); return; }

            pushUndo();
            meObjects = data.objects;
            if (nameInput && data.name) nameInput.value = data.name;
            // Restore map size
            if (data.worldW && data.worldH) {
                curWorldW = data.worldW; curWorldH = data.worldH;
                const sz = Object.entries(MAP_SIZES).find(([, s]) => s.w === data.worldW && s.h === data.worldH);
                if (sz && mapSizeSelect) mapSizeSelect.value = sz[0];
            }
            // Restore enemy mode
            enemyMode = data.enemyMode || 'group';
            if (enemyModeSelect) enemyModeSelect.value = enemyMode;
            // Restore custom messages
            customWinMsg  = data.customWinMsg  || '';
            customLoseMsg = data.customLoseMsg || '';
            if (winMsgInput)  winMsgInput.value  = customWinMsg;
            if (loseMsgInput) loseMsgInput.value = customLoseMsg;
            undoStack = [];

            // Auto-save imported map so it appears in the list
            const mapName = data.name || 'imported_map';
            // Note: saveMap will now include the restored enemyMode
            saveMap(mapName, meObjects);

            updateHUD();
            if (!window.deviceModeMobile) render();

            showEditorToast('\u041a\u0430\u0440\u0442\u0430 \u0437\u0430\u0433\u0440\u0443\u0436\u0435\u043d\u0430 \u0443\u0441\u043f\u0435\u0448\u043d\u043e', false);

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

    function launchCustomMap(objList, worldW, worldH) {
        worldW = worldW || curWorldW;
        worldH = worldH || curWorldH;
        const physicsObjs = objList.filter(o => o.type === 'wall' || o.type === 'box' || o.type === 'barrel');
        const enemySpawns = objList.filter(o => o.type === 'enemy');
        const allySpawns = objList.filter(o => o.type === 'ally');
        const playerSpawns = objList.filter(o => o.type === 'player');

        if (enemySpawns.length === 0) {
            showEditorToast('⚠️ На карте нет ни одного врага!');
            return;
        }
        if (playerSpawns.length === 0) {
            showEditorToast('⚠️ Не размещён спавн игрока (инструмент 🟢 Игрок)');
            return;
        }

        const playerSpawn = playerSpawns[0];

        // Close editor
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
                enemyMode,
                customWinMsg,
                customLoseMsg
            );
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
            const { cx, cy } = getCanvasPos(e);
            panStart = { x: cx - camX, y: cy - camY };
            e.preventDefault();
            return;
        }
        isDrawing = true;
        pushUndo();
        const { cx, cy } = getCanvasPos(e);
        placeAt(cx, cy);
    }

    function onMouseMove(e) {
        const { cx, cy } = getCanvasPos(e);

        if (isPanning) {
            camX = cx - panStart.x;
            camY = cy - panStart.y;
            render();
            return;
        }

        const { wx, wy } = toWorld(cx, cy);
        if (coordsEl) coordsEl.textContent = `X: ${Math.floor(wx)}  Y: ${Math.floor(wy)}`;

        if (wx >= 0 && wy >= 0 && wx < curWorldW && wy < curWorldH) {
            hoverCell = snapToGrid(wx, wy);
        } else {
            hoverCell = null;
        }

        if (isDrawing) placeAt(cx, cy);
        else render();
    }

    function onMouseUp() { isDrawing = false; isPanning = false; }

    function onWheel(e) {
        e.preventDefault();
        const { cx, cy } = getCanvasPos(e);
        const delta = e.deltaY > 0 ? 0.85 : 1.18;
        const newZoom = Math.max(0.3, Math.min(4, zoom * delta));
        // Zoom toward cursor
        camX = cx - (cx - camX) * (newZoom / zoom);
        camY = cy - (cy - camY) * (newZoom / zoom);
        zoom = newZoom;
        render();
    }

    function onTouchStart(e) {
        if (e.touches.length === 1) {
            isDrawing = true;
            pushUndo();
            const { cx, cy } = getCanvasPos(e);
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
        activeTool = tool;
        document.querySelectorAll('.me-tool-btn[data-tool]').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tool === tool);
        });
        // Update canvas cursor
        if (canvasWrap) canvasWrap.style.cursor = 'crosshair';
    }

    // ─────────────────────────────────────────────────────────────────────────────
    // OPEN / CLOSE EDITOR
    // ─────────────────────────────────────────────────────────────────────────────

    function openEditor() {
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

        // Calculate zoom to fit entire map in view with 90% padding
        if (canvas && canvas.width > 0 && canvas.height > 0) {
            const initialZoom = Math.min(
                canvas.width / curWorldW,
                canvas.height / curWorldH
            ) * 0.9;
            zoom = initialZoom;
            
            // Center the map on canvas
            camX = (canvas.width - curWorldW * zoom) / 2;
            camY = (canvas.height - curWorldH * zoom) / 2;
        }
        
        render();
    }

    function closeEditor() {
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
        winMsgInput     = document.getElementById('meWinMsg');
        loseMsgInput    = document.getElementById('meLoseMsg');
        objectCountEl   = document.getElementById('meObjectCount');
        coordsEl        = document.getElementById('meCoords');

        // Resize observer
        const ro = new ResizeObserver(resizeCanvas);
        ro.observe(canvasWrap);

        // Canvas events
        canvas.addEventListener('mousedown',  onMouseDown);
        canvas.addEventListener('mousemove',  onMouseMove);
        canvas.addEventListener('mouseup',    onMouseUp);
        canvas.addEventListener('mouseleave', onMouseUp);
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
                if (sz) { curWorldW = sz.w; curWorldH = sz.h; render(); }
            });
        }

        // Enemy mode select
        if (enemyModeSelect) {
            enemyModeSelect.addEventListener('change', () => {
                enemyMode = enemyModeSelect.value;
            });
        }

        // Custom win/lose message inputs
        if (winMsgInput)  winMsgInput.addEventListener('input',  () => { customWinMsg  = winMsgInput.value;  });
        if (loseMsgInput) loseMsgInput.addEventListener('input', () => { customLoseMsg = loseMsgInput.value; });

        // Header buttons
        document.getElementById('meNewBtn')?.addEventListener('click', () => {
            const doNew = () => {
                // Auto-save current map with messages before creating new
                if (meObjects.length > 0) {
                    const name = (nameInput ? nameInput.value.trim() : '') || 'my_map';
                    saveMap(name, meObjects);
                }
                pushUndo();
                meObjects = [];
                undoStack = [];
                if (nameInput) nameInput.value = 'my_map';
                if (mapSizeSelect) { mapSizeSelect.value = 'small'; curWorldW = 900; curWorldH = 700; }
                // Clear custom win/lose messages for the new map
                customWinMsg = '';
                customLoseMsg = '';
                if (winMsgInput) winMsgInput.value = '';
                if (loseMsgInput) loseMsgInput.value = '';
                updateHUD(); render();
            };
            if (meObjects.length) {
                showEditorConfirm('Очистить текущую карту и начать новую?', doNew);
            } else {
                doNew();
            }
        });

        document.getElementById('meSettingsBtn')?.addEventListener('click', () => {
            document.getElementById('meSettingsModal').style.display = 'flex';
        });
        document.getElementById('meSettingsClose')?.addEventListener('click', () => {
            document.getElementById('meSettingsModal').style.display = 'none';
        });

        document.getElementById('meMapsBtn')?.addEventListener('click', openMapsModal);

        document.getElementById('meSaveBtn')?.addEventListener('click', () => {
            if (meObjects.length === 0) { showEditorToast('Карта пустая — нечего сохранять'); return; }
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
            if ((e.ctrlKey || e.metaKey) && e.key === 'z') { e.preventDefault(); undo(); }
            if (e.key === 'Escape') closeEditor();
            if (e.key === '1') setTool('wall');
            if (e.key === '2') setTool('box');
            if (e.key === '3') setTool('barrel');
            if (e.key === '4') setTool('enemy');
            if (e.key === '5') setTool('player');
            if (e.key === '6') setTool('erase');
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
