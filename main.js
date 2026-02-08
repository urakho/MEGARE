/**
 * КЛАССИЧЕСКИЕ ТАНКИ С ПРОЦЕДУРНЫМИ СТЕНАМИ
 * Логика: Генерация длинных препятствий с проверкой путей
 */

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
// Display size (canvas kept reasonable for performance)
const DISPLAY_W = 900, DISPLAY_H = 700;
canvas.width = DISPLAY_W;
canvas.height = DISPLAY_H;
// World size (can be larger than display for big maps like War)
let worldWidth = DISPLAY_W, worldHeight = DISPLAY_H;

// Глобальное состояние
const keys = {};
let objects = [];
let particles = [];
let bullets = [];
let flames = [];
let enemies = [];
let allies = [];
let gameState = 'menu';
let currentMode = 'menu';
// Временная отладочная коллекция линий для AI (не сохраняется)
let debugLines = [];
// Показать отладочные линии AI (true — показать отладочные трассы)
const SHOW_AI_DEBUG = false;

// Навигационная сетка для A* (перестраивается при перемещении ящиков)
let navGrid = null;
let navCols = 0, navRows = 0, navCell = 25;
// Размер агента, используемый при построении безопасных ячеек
let navAgentW = 38, navAgentH = 38;
let navNeedsRebuild = true;
// War mode team spawn centers (filled by spawnWarMode)
let warTeamSpawns = [];

// Глобальная перезарядка в тиках (1 тик = 1/60s)
const FIRE_COOLDOWN = 20; // ~333ms at 60fps
// Базовая вероятность успешного уклонения AI (0..1)
const DODGE_BASE_ACCURACY = 0.8;

// Глобальная валюта
let coins = parseInt(localStorage.getItem('tankCoins')) || 0;

// Camera follow flag
let cameraFollow = false;

// Тип танка игрока
let tankType = 'normal';

const tank = {
    x: 50,
    y: 50,
    w: 38,
    h: 38,
    speed: 3.2,
    turretAngle: 0,
    baseAngle: 0,
    color: '#0000FF',
    trackOffset: 0,
    hp: 3,
    maxHp: 3,
    team: 0,
    fireCooldown: 0
};

// Слушатели событий
window.onkeydown = (e) => {
    // Не регистрировать клавишу если зажаты модификаторы (Ctrl, Cmd)
    if (e.ctrlKey || e.metaKey) {
        return;
    }
    keys[e.code] = true;
    // V + Alt для открытия информации о версии
    if ((e.code === 'KeyV' || e.code === 'keyV') && e.altKey) {
        const versionModal = document.getElementById('versionModal');
        if (versionModal) {
            versionModal.style.display = 'flex';
        }
    }
};
window.onkeyup = (e) => keys[e.code] = false;
window.addEventListener('wheel', (e) => {
    tank.turretAngle += e.deltaY * 0.0015;
});

// Preview canvas drawing
const previewCanvas = document.getElementById('previewCanvas');
const previewCtx = previewCanvas && previewCanvas.getContext ? previewCanvas.getContext('2d') : null;
// Character modal previews
const normalTankPreview = document.getElementById('normalTankPreview');
const normalTankCtx = normalTankPreview && normalTankPreview.getContext ? normalTankPreview.getContext('2d') : null;
const iceTankPreview = document.getElementById('iceTankPreview');
const iceTankCtx = iceTankPreview && iceTankPreview.getContext ? iceTankPreview.getContext('2d') : null;
const fireTankPreview = document.getElementById('fireTankPreview');
const fireTankCtx = fireTankPreview && fireTankPreview.getContext ? fireTankPreview.getContext('2d') : null;
const buratinoTankPreview = document.getElementById('buratinoTankPreview');
const buratinoTankCtx = buratinoTankPreview && buratinoTankPreview.getContext ? buratinoTankPreview.getContext('2d') : null;
const toxicTankPreview = document.getElementById('toxicTankPreview');
const toxicTankCtx = toxicTankPreview && toxicTankPreview.getContext ? toxicTankPreview.getContext('2d') : null;
const plasmaTankPreview = document.getElementById('plasmaTankPreview');
const plasmaTankCtx = plasmaTankPreview && plasmaTankPreview.getContext ? plasmaTankPreview.getContext('2d') : null;

// --- APPEND_POINT_1 ---
// Start button handler (open mode selection modal)
const mainMenu = document.getElementById('mainMenu');
const modeModal = document.getElementById('modeModal');
const startBtn = document.getElementById('startBtn');
if (startBtn) startBtn.addEventListener('click', () => {
    if (modeModal) modeModal.style.display = 'flex';
});

// Mode buttons
const modeSingle = document.getElementById('modeSingle');
const modeTeam = document.getElementById('modeTeam');
const modeCancel = document.getElementById('modeCancel');

function startGame(mode) {
    // reset basic state
    tank.turretAngle = 0; tank.hp = (tankType === 'fire' ? 6 : 3); tank.artilleryMode = false; tank.artilleryTimer = 0; enemies = []; bullets = []; particles = [];
    navNeedsRebuild = true;

    if (mode === 'single') {
        // normal world
        worldWidth = 900; worldHeight = 700;
        canvas.width = DISPLAY_W; canvas.height = DISPLAY_H;
        tank.x = 50; tank.y = 50;
        generateMap();
    } else if (mode === 'team') {
        // larger world map
        worldWidth = 1400; worldHeight = 1000;
        canvas.width = DISPLAY_W; canvas.height = DISPLAY_H;
        tank.x = 60; tank.y = 60;
        generateMap();
        spawnTeamMode();
        cameraFollow = true;
    } else if (mode === 'war') {
        // large world (previously 6x) — reduced by half to 3x for performance
        worldWidth = 900 * 3; worldHeight = 700 * 3;
        canvas.width = DISPLAY_W; canvas.height = DISPLAY_H;
        // place player and spawn war layout
        tank.x = 120; tank.y = 120; tank.team = 0; tank.hp = (tankType === 'fire' ? 6 : 3); tank.alive = true; tank.respawnTimer = 0; tank.respawnCount = 0;
        // finer nav grid for better obstacle avoidance
        navCell = 25;
        generateMap();
        spawnWarMode();
        cameraFollow = true;
    }

    // set current mode for runtime logic
    currentMode = mode;

    if (modeModal) modeModal.style.display = 'none';
    if (mainMenu) mainMenu.style.display = 'none';
    gameState = 'playing';
    navNeedsRebuild = true;
    try { if (typeof draw === 'function') draw(); } catch (e) { /* ignore */ }
}

                // very large world (6x single)
                worldWidth = 900 * 6; worldHeight = 700 * 6;
                // keep display canvas small for performance
                canvas.width = DISPLAY_W; canvas.height = DISPLAY_H;
if (modeTeam) modeTeam.addEventListener('click', () => startGame('team'));
if (modeSingle) modeSingle.addEventListener('click', () => startGame('single'));
// War mode button (added dynamically to modal) — insert above Cancel for consistent spacing
const modeWarBtn = document.createElement('button');
modeWarBtn.id = 'modeWar';
modeWarBtn.textContent = 'Война (2x10)';
modeWarBtn.style.padding = '10px 18px';
modeWarBtn.style.width = '80%';
modeWarBtn.style.fontSize = '16px';
if (modeModal) {
    // find the inner button group (the second div inside the modal container)
    const container = modeModal.querySelector('div');
    const btnGroup = container ? container.querySelector('div') : null;
    if (btnGroup) {
        // insert the War button before the Cancel button so it appears above
        const cancelBtn = btnGroup.querySelector('#modeCancel');
        if (cancelBtn) btnGroup.insertBefore(modeWarBtn, cancelBtn);
        else btnGroup.appendChild(modeWarBtn);
    } else {
        container.appendChild(modeWarBtn);
    }
}
if (modeWarBtn) modeWarBtn.addEventListener('click', () => startGame('war'));
if (modeCancel) modeCancel.addEventListener('click', () => { if (modeModal) modeModal.style.display = 'none'; });

// Shop button handler
const shopModal = document.getElementById('shopModal');
const characterModal = document.getElementById('characterModal');
const shopBtn = document.getElementById('shopBtn');
const characterBtn = document.getElementById('characterBtn');
const buyContainer = document.getElementById('buyContainer');
const buySuperContainer = document.getElementById('buySuperContainer');
const shopCancel = document.getElementById('shopCancel');
const characterCancel = document.getElementById('characterCancel');
if (shopBtn) shopBtn.addEventListener('click', () => { if (shopModal) shopModal.style.display = 'flex'; });
if (characterBtn) characterBtn.addEventListener('click', () => { if (characterModal) { characterModal.style.display = 'flex'; drawCharacterPreviews(); } });
if (shopCancel) shopCancel.addEventListener('click', () => { if (shopModal) shopModal.style.display = 'none'; });
if (characterCancel) characterCancel.addEventListener('click', () => { if (characterModal) characterModal.style.display = 'none'; });

// Version modal
const versionModal = document.getElementById('versionModal');
const versionClose = document.getElementById('versionClose');
if (versionClose) versionClose.addEventListener('click', () => { if (versionModal) versionModal.style.display = 'none'; });
// Закрытие модалки при клике на фон
if (versionModal) {
    versionModal.addEventListener('click', (e) => {
        if (e.target === versionModal) {
            versionModal.style.display = 'none';
        }
    });
}

if (buyContainer) buyContainer.addEventListener('click', () => {
    if (coins >= 100) {
        coins -= 100;
        openContainer();
        updateCoinDisplay();
    } else {
        alert('Недостаточно монет!');
    }
});
if (buySuperContainer) buySuperContainer.addEventListener('click', () => {
    if (coins >= 200) {
        coins -= 200;
        openSuperContainer();
        updateCoinDisplay();
    } else {
        alert('Недостаточно монет!');
    }
});

const selectNormalTank = document.getElementById('selectNormalTank');
const selectIceTank = document.getElementById('selectIceTank');
const selectFireTank = document.getElementById('selectFireTank');
const selectBuratinoTank = document.getElementById('selectBuratinoTank');
const selectToxicTank = document.getElementById('selectToxicTank');
const selectPlasmaTank = document.getElementById('selectPlasmaTank');
if (selectNormalTank) selectNormalTank.addEventListener('click', () => {
    showTankDetail('normal');
});
if (selectIceTank) selectIceTank.addEventListener('click', () => {
    showTankDetail('ice');
});
if (selectFireTank) selectFireTank.addEventListener('click', () => {
    showTankDetail('fire');
});
if (selectBuratinoTank) selectBuratinoTank.addEventListener('click', () => {
    showTankDetail('buratino');
});
if (selectToxicTank) selectToxicTank.addEventListener('click', () => {
    showTankDetail('toxic');
});
if (selectPlasmaTank) selectPlasmaTank.addEventListener('click', () => {
    showTankDetail('plasma');
});

// По умолчанию показываем главное меню
if (mainMenu) mainMenu.style.display = 'flex';

// --- APPEND_POINT_3 ---

/**
 * ГЕНЕРАЦИЯ КАРТЫ
 * Создаем длинные стены как в оригинале (вертикальные и горизонтальные)
 */
function generateMap() {
    objects = [];
    const step = 50; // Шаг сетки (50px cells for tighter, tile-aligned placement)
    
    // Внешние границы (невидимые, чтобы не выезжать)
    // Внутренние стены
    for (let x = step; x < worldWidth - step; x += step) {
        for (let y = step; y < worldHeight - step; y += step) {
            
            // reduce wall density further: spawn less frequently
            if (Math.random() > 0.92) {
                const isVertical = Math.random() > 0.5;
                const length = Math.floor(Math.random() * 2) + 1; // Длина 1-2 блока
                
                // Create dense blocks for walls aligned to grid
                const blockSize = 50;
                // Center the wall within the 100x100 cell if possible, or just align top-left
                // Let's align top-left to x,y but maybe center in the transverse direction?
                // x, y are on 100px grid.
                // If we want 50px walls centered in 100px grid: offset = 25.
                
                if (isVertical) {
                    const blockCount = (length * step) / blockSize;
                    for (let i = 0; i < blockCount; i++) {
                       objects.push({
                           x: x, 
                           y: y + i * blockSize, 
                           w: blockSize, h: blockSize, 
                           type: 'wall', color: '#2b2b2b'
                       });
                    }
                } else {
                    const blockCount = (length * step) / blockSize;
                    for (let i = 0; i < blockCount; i++) {
                       objects.push({
                           x: x + i * blockSize, 
                           y: y, 
                           w: blockSize, h: blockSize, 
                           type: 'wall', color: '#2b2b2b'
                       });
                    }
                }
            }
        }
    }
    
    // Ящики в случайных местах, проверяя коллизии со стенами
    for (let x = step; x < worldWidth - step; x += step) {
        for (let y = step; y < worldHeight - step; y += step) {
            // reduce box density further: spawn less frequently
            if (Math.random() > 0.96) {
                const newBox = {
                    x: x, y: y, 
                    w: 50, h: 50, 
                    type: 'box', color: '#7a4a21'
                };
                // Проверяем, не пересекается ли с существующими стенами
                let canPlace = true;
                for (let obj of objects) {
                    if (obj.type === 'wall' && checkRectCollision(newBox, obj)) {
                        canPlace = false;
                        break;
                    }
                }
                if (canPlace) {
                    objects.push(newBox);
                }
            }
        }
    }
    
    // Удаляем объекты, которые слишком близко к старту игрока
    objects = objects.filter(obj => {
        const dist = Math.hypot(obj.x - tank.x, obj.y - tank.y);
        return dist > 100;
    });

    // Генерация врагов в углах
    enemies = [];
    const cornerPositions = [
        {x: worldWidth - 50, y: 50},
        {x: 50, y: worldHeight - 50},
        {x: worldWidth - 50, y: worldHeight - 50}
    ];
    for (let i = 0; i < 3; i++) {
        const cp = cornerPositions[i];
        const p = findFreeSpot(cp.x - 19, cp.y - 19, 38, 38);
        // Choose a random tank type for this AI
        const tankTypes = ['normal','ice','fire','buratino','toxic','plasma'];
        const tt = tankTypes[Math.floor(Math.random() * tankTypes.length)];
        const typeColors = { normal: '#8B0000', ice: '#00BFFF', fire: '#FF4500', buratino: '#6E38B0', toxic: '#27ae60', plasma: '#8e44ad' };
        enemies.push({
            x: p.x, y: p.y, w: 38, h: 38,
            color: typeColors[tt] || ['#8B0000', '#006400', '#FFD700'][i],
            tankType: tt,
            hp: (tt === 'fire') ? 6 : 3,
            turretAngle: 0,
            baseAngle: 0,
            speed: 2.5,
            trackOffset: 0,
            alive: true,
            stuckCount: 0,
            fireCooldown: 0,
            team: i+1,
            dodgeAccuracy: 0.75 + Math.random() * 0.2,
            paralyzed: false,
            paralyzedTime: 0,
            // ability flags
            megaGasUsed: false,
            plasmaBlastUsed: 0
        });
    }
}

// Spawn teams: numTeams teams, each of teamSize tanks
function spawnAllies(numTeams, teamSize) {
    allies = [];
    const pads = [50, 50];
    const corners = [
        { x: 60, y: 60 },
        { x: worldWidth - 60, y: 60 },
        { x: 60, y: worldHeight - 60 },
        { x: worldWidth - 60, y: worldHeight - 60 }
    ];
    for (let t = 0; t < numTeams; t++) {
        const teamColor = ['#8B0000', '#006400', '#FFD700', '#00BFFF'][t % 4];
        const base = corners[t % corners.length];
        for (let s = 0; s < teamSize; s++) {
            const offset = s * 44;
            // ensure ally spawn is inside and not colliding
            let pos = findFreeSpot(base.x + offset, base.y + offset, 38, 38);
            allies.push({
                x: pos.x, y: pos.y, w: 38, h: 38,
                color: teamColor,
                // choose random tank type for ally
                tankType: (['normal','ice','fire','buratino','toxic','plasma'])[Math.floor(Math.random()*6)],
                hp: 100,
                turretAngle: 0,
                baseAngle: 0,
                speed: 2.5,
                trackOffset: 0,
                alive: true,
                team: t,
                fireCooldown: 0,
                stuckCount: 0,
                dodgeAccuracy: 0.75 + Math.random() * 0.2,
                paralyzed: false,
                paralyzedTime: 0
            });
        }
    }
    navNeedsRebuild = true;
}

// Spawn team-mode: place player + 1 ally in one corner, spawn 6 enemies in other corners (total 8 players)
function spawnTeamMode() {
    enemies = [];
    allies = [];
    const corners = [
        { x: 60, y: 60 },
        { x: worldWidth - 60, y: 60 },
        { x: 60, y: worldHeight - 60 },
        { x: worldWidth - 60, y: worldHeight - 60 }
    ];

    // helper: remove objects overlapping a rectangle so spawn areas are free
    function clearArea(x, y, w, h) {
        objects = objects.filter(o => {
            const ox = o.x, oy = o.y, ow = o.w || 40, oh = o.h || 40;
            if (ox < x + w && ox + ow > x && oy < y + h && oy + oh > y) return false;
            return true;
        });
    }

    // choose corner 0 for player team
    const playerCorner = corners[0];
    tank.x = playerCorner.x; tank.y = playerCorner.y; tank.team = 0;
    // clear around player spawn
    clearArea(playerCorner.x - 48, playerCorner.y - 48, 96, 96);
    // spawn one ally near player (use player's color)
            const allyTypes = ['normal','ice','fire','buratino','toxic','plasma'];
            const allyType = allyTypes[Math.floor(Math.random()*allyTypes.length)];
            allies.push({ x: playerCorner.x + 44, y: playerCorner.y + 10, w: 38, h: 38, color: tank.color, tankType: allyType, hp: (allyType === 'fire') ? 6 : 3, turretAngle:0, baseAngle:0, speed: 2.5, trackOffset:0, alive:true, team:0, stuckCount:0, fireCooldown:0, dodgeAccuracy: 0.78 + Math.random()*0.15, paralyzed: false, paralyzedTime: 0 });

    const enemyColors = ['#006400', '#FFD700', '#00BFFF'];
    // spawn other corners with 2 enemies each; clear spawn areas first
    for (let ci = 1; ci < 4; ci++) {
        const base = corners[ci];
        clearArea(base.x - 48, base.y - 48, 96, 96);
        for (let k = 0; k < 2; k++) {
            const tt = ['normal','ice','fire','buratino','toxic','plasma'][Math.floor(Math.random()*6)];
            const typeColor = { normal: '#8B0000', ice: '#00BFFF', fire: '#FF4500', buratino: '#6E38B0', toxic: '#27ae60', plasma: '#8e44ad' };
            // Fix: Use findFreeSpot to ensure enemies spawn inside map boundaries (especially for corners)
            // base.x/y might be near edge, and +k*44 might push out. findFreeSpot clamps efficiently.
            let sx = base.x + (k === 0 ? 0 : (ci===1 ? -44 : (ci===2 ? 44 : -44))); // try to offset inwards roughly
            let sy = base.y + (k === 0 ? 0 : (ci===1 ? 28 : (ci===2 ? -28 : -28))); 
            
            const p = findFreeSpot(sx, sy, 38, 38, 200, 20);
            if (p) {
                enemies.push({ x: p.x, y: p.y, w:38, h:38, color: typeColor[tt] || enemyColors[(ci-1)%enemyColors.length], tankType: tt, hp: (tt === 'fire')?6:3, turretAngle:0, baseAngle:0, speed:2.5, trackOffset:0, alive:true, team:ci, stuckCount:0, fireCooldown:0, dodgeAccuracy: 0.7 + Math.random()*0.25, paralyzed: false, paralyzedTime: 0 });
            }
        }
    }

    // add explosive barrels for team mode only (place a few in free spots)
    const barrelCount = 5;
    for (let b = 0; b < barrelCount; b++) {
        // try random positions near center area
        const rx = 80 + Math.random() * (worldWidth - 160);
        const ry = 80 + Math.random() * (worldHeight - 160);
        const p = findFreeSpot(rx - 20, ry - 20, 40, 40, 300, 16);
        // avoid placing extremely close to player
        if (Math.hypot(p.x - tank.x, p.y - tank.y) < 120) continue;
        objects.push({ x: p.x, y: p.y, w: 40, h: 40, type: 'barrel', color: '#b33' });
    }

    navNeedsRebuild = true;
}

// Spawn War mode: 2 teams x 10 players (player is on blue team = team 0)
function spawnWarMode() {
    enemies = [];
    allies = [];
    objects = objects || [];
    // huge map already set in startGame
    const corners = [
        { x: 120, y: 120 },
        { x: worldWidth - 120, y: worldHeight - 120 }
    ];
    // record team spawn centers
    const teamSpawns = [ corners[0], corners[1] ];
    warTeamSpawns = teamSpawns;

    // place player near team 0 spawn
    const p0 = findFreeSpot(teamSpawns[0].x - 19, teamSpawns[0].y - 19, tank.w, tank.h, 600, 40);
    if (p0) {
        tank.x = p0.x; tank.y = p0.y; tank.team = 0; tank.hp = (tankType === 'fire' ? 6 : 3); tank.alive = true; tank.respawnTimer = 0;
    } else {
        // Absolute fallback if findFreeSpot returns null for player
        tank.x = teamSpawns[0].x; tank.y = teamSpawns[0].y; tank.team = 0; tank.hp = (tankType === 'fire' ? 6 : 3); tank.alive = true; tank.respawnTimer = 0;
    }

    // spawn allies (team 0) - 9 bots + player = 10
    for (let i = 0; i < 9; i++) {
            const rx = teamSpawns[0].x + 30 + (i % 3) * 80 + (Math.random() - 0.5) * 30;
            const ry = teamSpawns[0].y + 30 + Math.floor(i/3) * 80 + (Math.random() - 0.5) * 30;
        const pos = findFreeSpot(rx, ry, 38, 38, 600, 24);
        if (pos) {
            const allyT = (['normal','ice','fire','buratino','toxic','plasma'])[Math.floor(Math.random()*6)];
            allies.push({ x: pos.x, y: pos.y, w:38, h:38, color: tank.color || '#00BFFF', tankType: allyT, hp: (allyT === 'fire') ? 6 : 3, turretAngle:0, baseAngle:0, speed: 2.5, trackOffset:0, alive:true, team:0, fireCooldown:0, stuckCount:0, dodgeAccuracy:0.75 + Math.random()*0.2, respawnCount:0, paralyzed: false, paralyzedTime: 0 });
        }
    }

    // spawn enemies (team 1) - 10 bots
    for (let i = 0; i < 10; i++) {
        const rx = teamSpawns[1].x - 30 - (i % 4) * 80 + (Math.random() - 0.5) * 40;
        const ry = teamSpawns[1].y - 30 - Math.floor(i/4) * 80 + (Math.random() - 0.5) * 40;
        const pos = findFreeSpot(rx, ry, 38, 38, 600, 24);
        if (pos) {
            const tt = ['normal','ice','fire','buratino','toxic','plasma'][Math.floor(Math.random()*6)];
            const typeColor = { normal: '#8B0000', ice: '#00BFFF', fire: '#FF4500', buratino: '#6E38B0', toxic: '#27ae60', plasma: '#8e44ad' };
            enemies.push({ x: pos.x, y: pos.y, w:38, h:38, color:typeColor[tt] || '#B22222', tankType: tt, hp:(tt==='fire')?6:3, turretAngle:0, baseAngle:0, speed:2.5, trackOffset:0, alive:true, team:1, fireCooldown:0, stuckCount:0, dodgeAccuracy:0.7 + Math.random()*0.2, respawnCount:0, paralyzed: false, paralyzedTime: 0 });
        }
    }

    // spawn some barrels and boxes in war map
    for (let b = 0; b < 20; b++) {
        const rx = 200 + Math.random() * (worldWidth - 400);
        const ry = 200 + Math.random() * (worldHeight - 400);
        const p = findFreeSpot(rx - 20, ry - 20, 40, 40, 800, 32);
        objects.push({ x: p.x, y: p.y, w: 40, h: 40, type: Math.random() > 0.85 ? 'barrel' : 'box', color: '#7a4a21' });
    }

    navNeedsRebuild = true;
}

function teamHasAliveMember(team) {
    if (team === 0) {
        if (tank.alive) return true;
        for (const a of allies) if (a && a.alive) return true;
        return false;
    } else {
        for (const e of enemies) if (e && e.alive) return true;
        return false;
    }
}

/**
 * ФИЗИКА И КОЛЛИЗИИ
 */
function checkRectCollision(r1, r2) {
    return r1.x < r2.x + r2.w && r1.x + r1.w > r2.x &&
           r1.y < r2.y + r2.h && r1.y + r1.h > r2.y;
}

// Проверяет, чист ли путь вдоль направления `angle` на расстояние `dist`.
// Делает несколько сэмплов по пути, чтобы заметить узкие препятствия.
function pathClearFor(entity, angle, dist, samples = 4) {
    // use entity center for sampling so narrow passages are tested correctly
    const cx = entity.x + (entity.w || 0) / 2;
    const cy = entity.y + (entity.h || 0) / 2;
    for (let s = 1; s <= samples; s++) {
        const t = s / samples;
        const sampleCx = cx + Math.cos(angle) * dist * t;
        const sampleCy = cy + Math.sin(angle) * dist * t;
        const tx = sampleCx - (entity.w || 0) / 2;
        const ty = sampleCy - (entity.h || 0) / 2;
        const rect = { x: tx, y: ty, w: entity.w, h: entity.h };
        for (const obj of objects) {
            if (checkRectCollision(rect, obj)) return false;
        }
    }
    // также проверка границ канвы по конечной позиции центра
    const endCx = cx + Math.cos(angle) * dist;
    const endCy = cy + Math.sin(angle) * dist;
    const endX = endCx - (entity.w || 0) / 2;
    const endY = endCy - (entity.h || 0) / 2;
    if (endX < 0 || endY < 0 || endX + entity.w > worldWidth || endY + entity.h > worldHeight) return false;
    return true;
}

// Найти свободную точку рядом с (x,y) чтобы сущность не появлялась в стене
function findFreeSpot(x, y, w, h, maxRadius = 200, step = 16) {
    // clamp initial with margin from edges
    const margin = 100;
    x = Math.max(margin, Math.min(worldWidth - w - margin, x));
    y = Math.max(margin, Math.min(worldHeight - h - margin, y));
    // quick check
    function collides(px, py) {
        const rect = { x: px, y: py, w: w, h: h };
        for (const o of objects) if (checkRectCollision(rect, o)) return true;
        return false;
    }
    if (!collides(x, y)) return { x, y };
    // search in expanding square/spiral
    for (let r = step; r <= maxRadius; r += step) {
        for (let dx = -r; dx <= r; dx += step) {
            for (let dy of [-r, r]) {
                const nx = Math.max(margin, Math.min(worldWidth - w - margin, x + dx));
                const ny = Math.max(margin, Math.min(worldHeight - h - margin, y + dy));
                if (!collides(nx, ny)) return { x: nx, y: ny };
            }
        }
        for (let dy = -r + step; dy <= r - step; dy += step) {
            for (let dx of [-r, r]) {
                const nx = Math.max(margin, Math.min(worldWidth - w - margin, x + dx));
                const ny = Math.max(margin, Math.min(worldHeight - h - margin, y + dy));
                if (!collides(nx, ny)) return { x: nx, y: ny };
            }
        }
    }
    // fallback clamp
    const fx = Math.max(margin, Math.min(worldWidth - w - margin, x));
    const fy = Math.max(margin, Math.min(worldHeight - h - margin, y));
    if (!collides(fx, fy)) return { x: fx, y: fy };
    // if still collides, return null
    return null;
}

// Проверяем, летят ли по сущности снаряды; если да — попробуем уклониться
function tryDodgeIncoming(entity) {
    const ex = entity.x + (entity.w||0)/2; const ey = entity.y + (entity.h||0)/2;
    const dangerLookahead = 30; // ticks to look ahead
    const accuracy = (entity.dodgeAccuracy !== undefined) ? entity.dodgeAccuracy : DODGE_BASE_ACCURACY;
    for (const b of bullets) {
        if (!b || b.team === undefined) continue;
        if (b.team === entity.team) continue; // ignore friendly
        // probabilistic: sometimes AI fails to notice or react
        if (Math.random() > accuracy) continue;
        const bvx = b.vx, bvy = b.vy;
        const rx = ex - b.x, ry = ey - b.y;
        const vv = bvx*bvx + bvy*bvy;
        if (vv === 0) continue;
        const t = (rx*bvx + ry*bvy) / vv; // time to closest approach in ticks (approx)
        if (t < 0 || t > dangerLookahead) continue;
        const cx = b.x + bvx * t, cy = b.y + bvy * t;
        const dist = Math.hypot(cx - ex, cy - ey);
        const safeDist = Math.max((entity.w||20), (entity.h||20)) * 0.9;
        if (dist < safeDist) {
            // try perpendicular dodge but add angle noise proportional to (1-accuracy)
            const bulletAng = Math.atan2(bvy, bvx);
            const maxNoise = Math.PI * 0.45; // up to ~81 degrees
            const noise = (1 - accuracy) * maxNoise * (Math.random() - 0.5) * 2;
            const cand = [bulletAng + Math.PI/2 + noise, bulletAng - Math.PI/2 + noise, Math.atan2(ey - b.y, ex - b.x) + noise];
            for (const ang of cand) {
                if (moveSmallSteps(entity, ang, (entity.speed || 2.5) * 1.3)) {
                    entity.baseAngle = ang;
                    return true;
                }
            }
            // if couldn't move, try small backward step (with chance to fail as well)
            const backAng = Math.atan2(ey - b.y, ex - b.x) + ((1 - accuracy) * (Math.random() - 0.5));
            if (moveSmallSteps(entity, backAng, (entity.speed || 2.5) * 0.9)) {
                entity.baseAngle = backAng;
                return true;
            }
        }
    }
    return false;
}

// Взрыв бочки: эффекты и урон всем танкам в радиусе
function explodeBarrel(obj) {
    // visual particles
    for (let i = 0; i < 40; i++) {
        const ang = Math.random() * Math.PI * 2;
        const sp = Math.random() * 6 + 2;
        particles.push({ x: obj.x + obj.w/2, y: obj.y + obj.h/2, vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp, life: 1, size: 2 + Math.random() * 3 });
    }
    // explosion damage radius
    const R = 120;
    function applyDamageToTank(t) {
        if (!t) return;
        const tx = t.x + (t.w||0)/2, ty = t.y + (t.h||0)/2;
        const dist = Math.hypot(tx - (obj.x + obj.w/2), ty - (obj.y + obj.h/2));
        if (dist <= R) {
            const damage = Math.max(1, Math.round((1 - dist / R) * 3));
            t.hp = (t.hp || 0) - damage;
            if (t === tank && t.hp <= 0) {
                for (let k = 0; k < 30; k++) spawnParticle(t.x + t.w/2, t.y + t.h/2);
                if (currentMode === 'war') { t.alive = false; t.respawnTimer = 600; }
                else { gameState = 'lose'; }
            }
        }
    }
    // apply to player
    applyDamageToTank(tank);
    // allies
    for (let i = allies.length - 1; i >= 0; i--) {
        const a = allies[i]; applyDamageToTank(a);
        if (a.hp <= 0) {
            if (currentMode === 'war') { a.alive = false; a.respawnTimer = 600; for (let k = 0; k < 8; k++) spawnParticle(a.x + a.w/2, a.y + a.h/2); }
            else { allies.splice(i, 1); for (let k = 0; k < 8; k++) spawnParticle(a.x + a.w/2, a.y + a.h/2); }
        }
    }
    // enemies
    for (let i = enemies.length - 1; i >= 0; i--) {
        const e = enemies[i]; applyDamageToTank(e);
        if (e.hp <= 0) {
            if (currentMode === 'war') { e.alive = false; e.respawnTimer = 600; for (let k = 0; k < 10; k++) spawnParticle(e.x + e.w/2, e.y + e.h/2); }
            else { enemies.splice(i, 1); for (let k = 0; k < 10; k++) spawnParticle(e.x + e.w/2, e.y + e.h/2); }
        }
    }
    // remove barrel object
    const idx = objects.indexOf(obj);
    if (idx >= 0) objects.splice(idx, 1);
    navNeedsRebuild = true;
}

// Взрыв ракеты: эффекты и урон всем танкам в радиусе
function explodeRocket(bullet) {
    // visual explosion circle
    objects.push({
        type: 'explosion',
        x: bullet.x,
        y: bullet.y,
        radius: 80,
        life: 30,
        color: '#FFA500'
    });
    // explosion damage radius
    const R = 80;
    function applyDamageToTank(t) {
        if (!t) return;
        const tx = t.x + (t.w||0)/2, ty = t.y + (t.h||0)/2;
        const dist = Math.hypot(tx - bullet.x, ty - bullet.y);
        if (dist <= R) {
            const damage = Math.max(1, Math.round((1 - dist / R) * 2));
            t.hp = (t.hp || 0) - damage;
            if (t === tank && t.hp <= 0) {
                for (let k = 0; k < 30; k++) spawnParticle(t.x + t.w/2, t.y + t.h/2);
                if (currentMode === 'war') { t.alive = false; t.respawnTimer = 600; }
                else { gameState = 'lose'; }
            }
        }
    }
    // apply to player
    applyDamageToTank(tank);
    // allies
    for (let i = allies.length - 1; i >= 0; i--) {
        const a = allies[i]; applyDamageToTank(a);
        if (a.hp <= 0) {
            if (currentMode === 'war') { a.alive = false; a.respawnTimer = 600; for (let k = 0; k < 8; k++) spawnParticle(a.x + a.w/2, a.y + a.h/2); }
            else { allies.splice(i, 1); for (let k = 0; k < 8; k++) spawnParticle(a.x + a.w/2, a.y + a.h/2); }
        }
    }
    // enemies
    for (let i = enemies.length - 1; i >= 0; i--) {
        const e = enemies[i]; applyDamageToTank(e);
        if (e.hp <= 0) {
            if (currentMode === 'war') { e.alive = false; e.respawnTimer = 600; for (let k = 0; k < 10; k++) spawnParticle(e.x + e.w/2, e.y + e.h/2); }
            else { enemies.splice(i, 1); for (let k = 0; k < 10; k++) spawnParticle(e.x + e.w/2, e.y + e.h/2); }
        }
    }
}

// Spawn gas cloud at (x,y). If mega=true, larger radius and longer duration.
function explodeGas(bullet, mega = false) {
    // small visual explosion
    objects.push({ type: 'explosion', x: bullet.x, y: bullet.y, radius: mega ? 80 : 40, life: 30, color: '#66FF66' });
    // gas cloud
    const durationTicks = (mega ? 10 : 5) * 60; // seconds -> ticks
    const radius = mega ? 180 : 90;
    objects.push({ type: 'gas', x: bullet.x, y: bullet.y, radius: radius, life: durationTicks, maxLife: durationTicks, color: 'rgba(100,220,100,0.25)', owner: bullet.owner, isMega: mega });
    // Уничтожение ящиков и бочек в зоне газа
    for (let i = objects.length - 1; i >= 0; i--) {
        const obj = objects[i];
        if (obj.type === 'box' || obj.type === 'barrel') {
            const ox = obj.x + obj.w/2, oy = obj.y + obj.h/2;
            const dist = Math.hypot(ox - bullet.x, oy - bullet.y);
            if (dist <= radius) {
                objects.splice(i, 1);
            }
        }
    }
}

// Global helper: apply area damage at point (x,y)
function applyDamage(x, y, R = 30, coef = 1, attackerTeam = undefined) {
    function applyDamageToTank(t) {
        if (!t) return;
        // if attackerTeam is set, skip damage to same team (friendly fire protection)
        if (attackerTeam !== undefined && t.team === attackerTeam) return;
        
        const tx = t.x + (t.w||0)/2, ty = t.y + (t.h||0)/2;
        const dist = Math.hypot(tx - x, ty - y);
        if (dist <= R) {
            const damage = Math.max(1, Math.round((1 - dist / R) * coef));
            t.hp = (t.hp || 0) - damage;
            if (t === tank && t.hp <= 0) {
                for (let k = 0; k < 30; k++) spawnParticle(t.x + t.w/2, t.y + t.h/2);
                if (currentMode === 'war') { t.alive = false; t.respawnTimer = 600; }
                else { gameState = 'lose'; }
            }
        }
    }
    applyDamageToTank(tank);
    for (let i = allies.length - 1; i >= 0; i--) {
        const a = allies[i]; applyDamageToTank(a);
        if (a.hp <= 0) {
            if (currentMode === 'war') { a.alive = false; a.respawnTimer = 600; for (let k = 0; k < 8; k++) spawnParticle(a.x + a.w/2, a.y + a.h/2); }
            else { allies.splice(i, 1); for (let k = 0; k < 8; k++) spawnParticle(a.x + a.w/2, a.y + a.h/2); }
        }
    }
    for (let i = enemies.length - 1; i >= 0; i--) {
        const e = enemies[i]; applyDamageToTank(e);
        if (e.hp <= 0) {
            if (currentMode === 'war') { e.alive = false; e.respawnTimer = 600; for (let k = 0; k < 10; k++) spawnParticle(e.x + e.w/2, e.y + e.h/2); }
            else { enemies.splice(i, 1); for (let k = 0; k < 10; k++) spawnParticle(e.x + e.w/2, e.y + e.h/2); }
        }
    }
    // Уничтожение ящиков и бочек в зоне взрыва
    for (let i = objects.length - 1; i >= 0; i--) {
        const obj = objects[i];
        if (obj.type === 'box' || obj.type === 'barrel') {
            const ox = obj.x + obj.w/2, oy = obj.y + obj.h/2;
            const dist = Math.hypot(ox - x, oy - y);
            if (dist <= R) {
                objects.splice(i, 1);
            }
        }
    }
}

// Open super container: give rare bonus
function openSuperContainer() {
    const bonuses = [
        () => { tank.hp += 1; alert('Редкий бонус: +1 HP!'); },
        () => { tank.speed += 0.5; alert('Редкий бонус: +Скорость!'); },
        () => { tank.color = '#FFD700'; alert('Редкий бонус: золотой цвет танка!'); },
        () => { tank.color = '#FF1493'; alert('Редкий бонус: розовый цвет танка!'); },
        () => { tank.color = '#00FFFF'; alert('Редкий бонус: циановый цвет танка!'); }
    ];
    const bonus = bonuses[Math.floor(Math.random() * bonuses.length)];
    bonus();
}

// Построить навигационную сетку: 1 = блокировано, 0 = свободно
function buildNavGrid(cellSize = navCell) {
    navCell = cellSize;
    navCols = Math.ceil(worldWidth / navCell);
    navRows = Math.ceil(worldHeight / navCell);
    navGrid = new Array(navCols * navRows).fill(0);
    for (let j = 0; j < navRows; j++) {
        for (let i = 0; i < navCols; i++) {
            // Проверяем, можно ли поместить агента (танк) с центром в центре клетки
            const center = cellCenter(i, j);
            const agentRect = { x: center.x - navAgentW/2, y: center.y - navAgentH/2, w: navAgentW, h: navAgentH };
            let blocked = false;
            for (const o of objects) {
                if (o.type === 'wall') {
                    if (checkRectCollision(agentRect, o)) { blocked = true; break; }
                }
                // Для ящиков считаем клетку блокированной, если ящик занимает значительную часть клетки
                if (o.type === 'box') {
                    if (checkRectCollision(agentRect, o)) { blocked = true; break; }
                }
            }
            // Также учитываем границы канвы
            if (agentRect.x < 0 || agentRect.y < 0 || agentRect.x + agentRect.w > worldWidth || agentRect.y + agentRect.h > worldHeight) blocked = true;
            navGrid[j * navCols + i] = blocked ? 1 : 0;
        }
    }
}

function worldToCell(x, y) {
    const ci = Math.max(0, Math.min(navCols - 1, Math.floor(x / navCell)));
    const rj = Math.max(0, Math.min(navRows - 1, Math.floor(y / navCell)));
    return { ci, rj };
}
function cellCenter(i, j) { return { x: (i + 0.5) * navCell, y: (j + 0.5) * navCell }; }

// Найти путь от мировых координат start->goal, вернуть массив контрольных точек (центры ячеек)
function findPath(sx, sy, gx, gy) {
    if (!navGrid) buildNavGrid();
    const start = worldToCell(sx, sy);
    const goal = worldToCell(gx, gy);
    const startKey = start.ci + ',' + start.rj;
    const goalKey = goal.ci + ',' + goal.rj;
    if (navGrid[start.rj * navCols + start.ci]) {
        // try to find nearby free start
        let found = false;
        for (let r = 1; r < 4 && !found; r++) {
            for (let dj = -r; dj <= r && !found; dj++) {
                for (let di = -r; di <= r && !found; di++) {
                    const ni = start.ci + di, nj = start.rj + dj;
                    if (ni < 0 || nj < 0 || ni >= navCols || nj >= navRows) continue;
                    if (!navGrid[nj * navCols + ni]) { start.ci = ni; start.rj = nj; found = true; }
                }
            }
        }
        if (!found) return null;
    }
    if (navGrid[goal.rj * navCols + goal.ci]) {
        let found = false;
        for (let r = 1; r < 6 && !found; r++) {
            for (let dj = -r; dj <= r && !found; dj++) {
                for (let di = -r; di <= r && !found; di++) {
                    const ni = goal.ci + di, nj = goal.rj + dj;
                    if (ni < 0 || nj < 0 || ni >= navCols || nj >= navRows) continue;
                    if (!navGrid[nj * navCols + ni]) { goal.ci = ni; goal.rj = nj; found = true; }
                }
            }
        }
        if (!found) return null;
    }

    const key = (i, j) => i + ',' + j;
    const open = new Map();
    const closed = new Set();
    const gScore = {};
    const fScore = {};
    const cameFrom = {};

    function heuristic(i, j) { return Math.hypot(i - goal.ci, j - goal.rj); }

    const startK = key(start.ci, start.rj);
    gScore[startK] = 0;
    fScore[startK] = heuristic(start.ci, start.rj);
    open.set(startK, { i: start.ci, j: start.rj, f: fScore[startK] });

    const neigh = [ [1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1] ];
    const maxIter = navCols * navRows * 4;
    let iter = 0;
    while (open.size && iter++ < maxIter) {
        // get node in open with min f
        let curKey = null, curNode = null;
        for (const [k,v] of open) { if (!curNode || v.f < curNode.f) { curNode = v; curKey = k; } }
        if (!curNode) break;
        open.delete(curKey);
        if (curNode.i === goal.ci && curNode.j === goal.rj) {
            // reconstruct path
            const path = [];
            let ck = curKey;
            while (ck && cameFrom[ck]) {
                const parts = ck.split(',').map(Number);
                path.push(cellCenter(parts[0], parts[1]));
                ck = cameFrom[ck];
            }
            path.push(cellCenter(start.ci, start.rj));
            path.reverse();
            return path;
        }
        closed.add(curKey);

        for (const d of neigh) {
            const ni = curNode.i + d[0], nj = curNode.j + d[1];
            if (ni < 0 || nj < 0 || ni >= navCols || nj >= navRows) continue;
            const nk = key(ni, nj);
            if (closed.has(nk)) continue;
            if (navGrid[nj * navCols + ni]) continue; // blocked
            const tentativeG = (gScore[curKey] || 0) + ((d[0] && d[1]) ? Math.SQRT2 : 1);
            if (open.has(nk) && tentativeG >= (gScore[nk] || Infinity)) continue;
            cameFrom[nk] = curKey;
            gScore[nk] = tentativeG;
            fScore[nk] = tentativeG + heuristic(ni, nj);
            open.set(nk, { i: ni, j: nj, f: fScore[nk] });
        }
    }
    return null;
}

// Проверить, можно ли поместить `entity` в позицию x,y без пересечений со стенами
function canPlaceAt(entity, nx, ny) {
    const rect = { x: nx, y: ny, w: entity.w, h: entity.h };
    for (const obj of objects) {
        if (obj.type === 'wall' && checkRectCollision(rect, obj)) return false;
    }
    if (rect.x < 0 || rect.y < 0 || rect.x + rect.w > worldWidth || rect.y + rect.h > worldHeight) return false;
    return true;
}

// Найти первый объект, пересекающий прямоугольник (или null)
function getCollidingObject(rect) {
    for (const obj of objects) {
        if (checkRectCollision(rect, obj)) return obj;
    }
    return null;
}

// Попытаться сдвинуть entity на расстояние dist в направлении angle малыми шагами.
// Если на пути ящик — предпринять попытку безопасно его толкнуть (только если у ящика есть куда сдвинуться).
function moveSmallSteps(entity, angle, dist) {
    const step = 1; // пиксельный шаг
    const steps = Math.max(1, Math.round(dist / step));
    const dxStep = Math.cos(angle) * step;
    const dyStep = Math.sin(angle) * step;
    for (let i = 0; i < steps; i++) {
        const nx = entity.x + dxStep;
        const ny = entity.y + dyStep;

        // Быстрая проверка на стены/границы
        if (!canPlaceAt(entity, nx, ny)) {
            if (SHOW_AI_DEBUG) console.log('move blocked (wall) for', entity.id || entity.color || 'enemy', 'at', nx, ny);
            return false;
        }

        // Проверяем, не пересекается ли с ящиком — тогда попробуем его сдвинуть
        const rect = { x: nx, y: ny, w: entity.w, h: entity.h };
        const coll = getCollidingObject(rect);
        if (coll && coll.type === 'box') {
            const boxNx = coll.x + dxStep;
            const boxNy = coll.y + dyStep;
            const boxRect = { x: boxNx, y: boxNy, w: coll.w, h: coll.h };

            // Проверяем, можно ли сдвинуть ящик (не врезается в стену/другой объект и в пределах канвы)
            let blocked = false;
            if (boxRect.x < 0 || boxRect.y < 0 || boxRect.x + boxRect.w > worldWidth || boxRect.y + boxRect.h > worldHeight) blocked = true;
            for (const o of objects) {
                if (o === coll) continue;
                if (checkRectCollision(boxRect, o)) { blocked = true; break; }
            }
            if (blocked) {
                if (SHOW_AI_DEBUG) console.log('box cannot be pushed for', entity.id || entity.color || 'enemy', 'at', nx, ny);
                return false;
            }

            // Толкаем ящик на один шаг
            coll.x = boxNx; coll.y = boxNy;
            spawnParticle(coll.x + coll.w / 2, coll.y + coll.h / 2);
            // Нужно перестроить навигационный грид, т.к. объект изменил позицию
            navNeedsRebuild = true;
        }

        // Наконец, двигаем сущность на шаг
        entity.x = nx; entity.y = ny;
    }
    return true;
}

// Добавляем функцию для рисования отладочных линий
function drawDebugLines() {
    for (const l of debugLines) {
        ctx.beginPath();
        ctx.strokeStyle = l.color || 'red';
        ctx.lineWidth = l.width || 2;
        ctx.moveTo(l.x1, l.y1);
        ctx.lineTo(l.x2, l.y2);
        ctx.stroke();
    }
    // очищаем после рисования
    debugLines = [];
}

function spawnParticle(x, y) {
    particles.push({
        x, y, 
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        life: 1,
        size: Math.random() * 3 + 2
    });
}
// --- APPEND_POINT_RESUME ---
function shoot() {
    if (tankType === 'fire') {
        // Flamethrower: emit a short cone of flame projectiles
        const flameCount = 7;
        const baseAng = tank.turretAngle;
        const spread = 0.7; // radians total cone
        for (let f = 0; f < flameCount; f++) {
            const t = flameCount <= 1 ? 0.5 : f / (flameCount - 1);
            const ang = baseAng + (t - 0.5) * spread + (Math.random() - 0.5) * 0.06;
            const sx = tank.x + tank.w/2 + Math.cos(ang) * 18;
            const sy = tank.y + tank.h/2 + Math.sin(ang) * 18;
            const speed = 3.5 + Math.random() * 1.2;
            flames.push({
                x: sx,
                y: sy,
                vx: Math.cos(ang) * speed,
                vy: Math.sin(ang) * speed,
                life: 20 + Math.floor(Math.random() * 8),
                damage: 0.22,
                team: 0
            });
        }
    } else if (tankType === 'buratino') {
        // Target in turret direction
        const dist = 300;
        const targetX = tank.x + tank.w/2 + Math.cos(tank.turretAngle) * dist;
        const targetY = tank.y + tank.h/2 + Math.sin(tank.turretAngle) * dist;
        const targetCircle = { x: targetX, y: targetY, radius: 100, color: tank.color, timer: 180, type: 'targetCircle' };
        // precompute planned explosion positions (inner 4 + outer 9) so rockets can target them
        targetCircle.planned = [];
        for (let j = 0; j < 4; j++) {
            const ang = (j / 4) * Math.PI * 2;
            const distP = targetCircle.radius * 0.3;
            targetCircle.planned.push({ x: targetCircle.x + Math.cos(ang) * distP, y: targetCircle.y + Math.sin(ang) * distP, exploded: false });
        }
        for (let j = 0; j < 9; j++) {
            const ang = (j / 9) * Math.PI * 2;
            const distP = targetCircle.radius * 0.7;
            targetCircle.planned.push({ x: targetCircle.x + Math.cos(ang) * distP, y: targetCircle.y + Math.sin(ang) * distP, exploded: false });
        }
        objects.push(targetCircle);
        tank.artilleryMode = true;
        tank.artilleryTimer = 180; // 3 seconds
        tank.fireCooldown = 60; // 1 second cooldown (60 ticks)
        // Visual rockets: spawn from tube positions but smaller and in a fan
        const rows = 3;
        const cols = Math.max(5, Math.floor((Math.min(tank.w, tank.h) * 1.5) / 10));
        const tSize = Math.min(tank.w, tank.h) * 0.35 * 1.5;
        const inset = 6;
        const usableW = tSize - inset * 2;
        const usableH = tSize - inset * 2;
        const fanSpread = 0.9; // radians total spread for the fan
        for (let r = 0; r < rows; r++) {
            const ry = -tSize/2 + inset + r * (usableH / (rows - 1 || 1));
            for (let c = 0; c < cols; c++) {
                const cx = -tSize/2 + inset + c * (usableW / (cols - 1 || 1));
                const baseAng = tank.turretAngle;
                // local tube position -> world
                const lx = cx;
                const ly = ry;
                const sx = tank.x + tank.w/2 + Math.cos(baseAng) * lx - Math.sin(baseAng) * ly;
                const sy = tank.y + tank.h/2 + Math.sin(baseAng) * lx + Math.cos(baseAng) * ly;
                // compute per-rocket fan angle offset across columns + small row offset
                const colNorm = cols <= 1 ? 0.5 : c / (cols - 1);
                const rowNorm = rows <= 1 ? 0.5 : r / (rows - 1);
                const angOffset = (colNorm - 0.5) * fanSpread + (rowNorm - 0.5) * 0.06;
                const angRocket = baseAng + angOffset + (Math.random() - 0.5) * 0.03;
                // assign rocket to one of the planned explosion positions (round-robin)
                const planned = targetCircle.planned || [];
                const idx = planned.length ? ((r * cols + c) % planned.length) : 0;
                const targetPos = planned.length ? planned[idx] : { x: targetX + Math.cos(angRocket) * (targetCircle.radius * 0.5), y: targetY + Math.sin(angRocket) * (targetCircle.radius * 0.5) };
                const dx = targetPos.x - sx;
                const dy = targetPos.y - sy;
                const delay = Math.floor((r * cols + c) * 1 + Math.random() * 2);
                const travel = Math.max(16, tank.artilleryTimer - delay - 2);
                const vx = dx / travel;
                const vy = dy / travel;
                const life = travel + 6;
                // smaller rockets targeted to planned explosion position
                objects.push({ type: 'visualRocket', x: sx, y: sy, vx: vx, vy: vy, life: life, delay: delay, w: 4, h: 3, color: '#000', angOffset: angOffset, target: targetPos, team: 0 });
            }
        }
    } else if (tankType === 'toxic') {
        // Toxic tank: fires projectiles straight along turret angle, they fall with gravity and explode into gas
        const speed = 7;
        const ang = tank.turretAngle;
        const sx = tank.x + tank.w/2 + Math.cos(ang) * 25;
        const sy = tank.y + tank.h/2 + Math.sin(ang) * 25;
        // fly in turret direction (both components based on angle) and do NOT have gravity
        bullets.push({
            x: sx,
            y: sy,
            w: 6,
            h: 6,
            vx: Math.cos(ang) * speed,
            vy: Math.sin(ang) * speed, // fly in turret direction
            life: 500,
            owner: 'player',
            team: 0,
            type: 'toxic',
            explodeTimer: 45, // explode after 45 ticks (~0.75 seconds)
            spawned: 5 // spawn protection for 5 ticks
        });
        tank.fireCooldown = 35; // moderate cooldown
    } else if (tankType === 'plasma') {
        // Plasma tank: fires a single piercing plasma bolt
        const speed = 8;
        const life = 200; // long range
        bullets.push({
            x: tank.x + tank.w/2 + Math.cos(tank.turretAngle) * 25,
            y: tank.y + tank.h/2 + Math.sin(tank.turretAngle) * 25,
            w: 10, h: 10,
            vx: Math.cos(tank.turretAngle) * speed,
            vy: Math.sin(tank.turretAngle) * speed,
            life: life,
            owner: 'player',
            team: 0,
            type: 'plasma',
            damage: 3, // 3 HP damage
            piercing: true // can hit multiple targets
        });
        tank.fireCooldown = 120; // 2 second cooldown
    } else if (tankType === 'ice') {
        const speed = 5;
        const life = 100;
        bullets.push({
            x: tank.x + tank.w/2 + Math.cos(tank.turretAngle) * 25,
            y: tank.y + tank.h/2 + Math.sin(tank.turretAngle) * 25,
            w: 8, h: 8, // Bigger ice shard
            vx: Math.cos(tank.turretAngle) * speed,
            vy: Math.sin(tank.turretAngle) * speed,
            life: life,
            owner: 'player',
            team: 0,
            type: 'ice'
        });
    } else {
        const speed = 5;
        const life = 100;
        bullets.push({
            x: tank.x + tank.w/2 + Math.cos(tank.turretAngle) * 25,
            y: tank.y + tank.h/2 + Math.sin(tank.turretAngle) * 25,
            w: 9, h: 9, // Even bigger normal shell (1.5x)
            vx: Math.cos(tank.turretAngle) * speed,
            vy: Math.sin(tank.turretAngle) * speed,
            life: life,
            owner: 'player',
            team: 0,
            type: tankType
        });
    }
    if (tankType !== 'fire' && tankType !== 'buratino' && tankType !== 'toxic') {
        tank.fireCooldown = FIRE_COOLDOWN;
    }
}
// --- APPEND_POINT_UPDATE ---
function update() {
    if (gameState !== 'playing') {
        if (gameState === 'win' || gameState === 'lose') {
            if (keys['Space']) {
                location.reload();
                keys['Space'] = false;
            }
        }
        return;
    }
    if (navNeedsRebuild) { buildNavGrid(); navNeedsRebuild = false; }
    // player input only when alive
    if (tank.alive !== false) {
        if (tank.moveCooldown > 0) tank.moveCooldown--;
        // handle paralyze state for player tank
        if (tank.paralyzed) {
            tank.paralyzedTime = (tank.paralyzedTime || 0) - 1;
            if (tank.paralyzedTime <= 0) tank.paralyzed = false;
            if (tank.frozenEffect) tank.frozenEffect--;
        } else {

        let dx = 0, dy = 0;
        if (keys['KeyW']) { dy -= tank.speed; tank.baseAngle = -Math.PI/2; }
        if (keys['KeyS']) { dy += tank.speed; tank.baseAngle = Math.PI/2; }
        if (keys['KeyA']) { dx -= tank.speed; tank.baseAngle = Math.PI; }
        if (keys['KeyD']) { dx += tank.speed; tank.baseAngle = 0; }
        if (dx !== 0 || dy !== 0) {
            if (!tank.artilleryMode) {
                tank.trackOffset = (tank.trackOffset + 0.2) % 10;
                moveWithCollision(dx, 0);
                moveWithCollision(0, dy);
            }
        }
        // turret rotation with arrow keys (same effect as mouse wheel)
        if (keys['ArrowLeft']) tank.turretAngle -= 0.06;
        // Mega-gas ability (one-time per battle) for toxic tank on E
        if (tankType === 'toxic' && keys['KeyE']) {
            if (!tank.megaGasUsed) {
                // spawn a thrown mega bomb in turret direction (straight, no upward arc)
                const ang = tank.turretAngle;
                const sx = tank.x + tank.w/2 + Math.cos(ang) * 20;
                const sy = tank.y + tank.h/2 + Math.sin(ang) * 20;
                const speed = 8;
                // mega bomb flies straight along turret angle, then falls with gravity
                bullets.push({
                    x: sx,
                    y: sy,
                    w: 8,
                    h: 8,
                    vx: Math.cos(ang) * speed,
                    vy: Math.sin(ang) * speed, // fly in turret direction
                    life: 500,
                    owner: 'player',
                    team: 0,
                    type: 'megabomb',
                    explodeTimer: 60, // explode after 60 ticks (~1 second)
                    spawned: 5 // spawn protection for 5 ticks
                });
                tank.megaGasUsed = true;
            }
            keys['KeyE'] = false;
        }
        // Plasma blast ability for plasma tank on E (limited uses per battle)
        if (tankType === 'plasma' && keys['KeyE']) {
            if ((tank.plasmaBlastUsed || 0) < 2) {
                // Fire a powerful plasma blast that destroys walls and damages all in line
                const ang = tank.turretAngle;
                const sx = tank.x + tank.w/2 + Math.cos(ang) * 25;
                const sy = tank.y + tank.h/2 + Math.sin(ang) * 25;
                const speed = 10;
                bullets.push({
                    x: sx,
                    y: sy,
                    w: 10, h: 10,
                    vx: Math.cos(ang) * speed,
                    vy: Math.sin(ang) * speed,
                    life: 300,
                    owner: 'player',
                    team: 0,
                    type: 'plasmaBlast',
                    damage: 5, // high damage
                    piercing: true,
                    destroysWalls: true // will destroy walls it hits
                });
                tank.plasmaBlastUsed = (tank.plasmaBlastUsed || 0) + 1;
                tank.fireCooldown = 60; // short cooldown after blast
            }
            keys['KeyE'] = false;
        }
        if (keys['ArrowRight']) tank.turretAngle += 0.06;
        // Перезарядка игрока
        if (tank.fireCooldown > 0) tank.fireCooldown--;
        // Стрельба (только если перезарядка закончилась)
        if (keys['Space'] && tank.fireCooldown <= 0) {
            shoot();
            if (tankType !== 'fire') {
                keys['Space'] = false;
            }
        }
        }
    }
// --- APPEND_POINT_UPDATE_AI ---
    
    // AI для врагов: выбирать ближайшую цель (игрок или другой враг) и действовать
    for (let enemy of enemies) {
        if (!enemy || !enemy.alive) continue;
        if (enemy.paralyzed) { enemy.paralyzedTime--; if (enemy.paralyzedTime <= 0) enemy.paralyzed = false; if (enemy.frozenEffect) enemy.frozenEffect--; continue; }
        // If in artillery mode, countdown and skip normal AI movement/actions
        if (enemy.artilleryMode) {
            enemy.artilleryTimer = (enemy.artilleryTimer || 0) - 1;
            if (enemy.artilleryTimer <= 0) enemy.artilleryMode = false;
            continue;
        }
        
        // Check if enemy is in poison gas and escape if it's enemy poison
        let inEnemyPoison = false;
        let poisonGasPos = null;
        for (const obj of objects) {
            if (obj.type === 'gas' && obj.owner !== 'enemy') { // enemy poison = created by player/ally
                const dist = Math.hypot((enemy.x + enemy.w/2) - obj.x, (enemy.y + enemy.h/2) - obj.y);
                if (dist <= obj.radius) {
                    inEnemyPoison = true;
                    poisonGasPos = { x: obj.x, y: obj.y, radius: obj.radius };
                    break;
                }
            }
        }
        
        // If in enemy poison, try to escape
        if (inEnemyPoison && poisonGasPos) {
            // Move away from poison center
            const ex = enemy.x + enemy.w/2;
            const ey = enemy.y + enemy.h/2;
            const escapeAngle = Math.atan2(ey - poisonGasPos.y, ex - poisonGasPos.x);
            const tryDist = enemy.speed * 1.5; // move faster when escaping
            
            // Try main escape direction
            let escaped = false;
            if (moveSmallSteps(enemy, escapeAngle, tryDist)) {
                enemy.baseAngle = escapeAngle;
                escaped = true;
            } else {
                // Try sidesteps if blocked
                const sideAngles = [escapeAngle + Math.PI/3, escapeAngle - Math.PI/3, escapeAngle + Math.PI/6, escapeAngle - Math.PI/6];
                for (const a of sideAngles) {
                    if (moveSmallSteps(enemy, a, tryDist * 0.8)) {
                        enemy.baseAngle = a;
                        escaped = true;
                        break;
                    }
                }
            }
            
            // Skip normal AI behavior while escaping
            continue;
        }
        
        // Выбор цели: ближайшая цель среди всех танков, исключая тех, кто в той же команде
        const otherEnemies = enemies.filter(e => e !== enemy && e.alive);
        const potentialTargets = [tank, ...allies, ...otherEnemies];
        const targets = potentialTargets.filter(t => t && (t.team === undefined || t.team !== enemy.team));
        if (targets.length === 0) continue;
        // Find nearest target
        let nearest = targets[0];
        let nd = Math.hypot((nearest.x + (nearest.w||0)/2) - (enemy.x + enemy.w/2), (nearest.y + (nearest.h||0)/2) - (enemy.y + enemy.h/2));
        for (const t of targets) {
            const d = Math.hypot((t.x + (t.w||0)/2) - (enemy.x + enemy.w/2), (t.y + (t.h||0)/2) - (enemy.y + enemy.h/2));
            if (d < nd) { nearest = t; nd = d; }
        }

        // Башня смотрит на ближайшую цель
        enemy.turretAngle = Math.atan2(nearest.y - enemy.y, nearest.x - enemy.x);

        // Двигаться к цели с помощью навигационной сетки (A*). Если путь не найден — падаем обратно на прежнюю эвристику.
        const mdx = (nearest.x + (nearest.w||0)/2) - (enemy.x + enemy.w/2);
        const mdy = (nearest.y + (nearest.h||0)/2) - (enemy.y + enemy.h/2);
        const mdist = Math.hypot(mdx, mdy);
        if (mdist > 0) {
            const targetCx = nearest.x + (nearest.w||0)/2;
            const targetCy = nearest.y + (nearest.h||0)/2;
            const tryDist = enemy.speed; // per-tick movement distance

            // Построим/обновим путь при необходимости
            if (!enemy.path || !enemy.path.length || (enemy.pathRecalc || 0) <= 0) {
                const sx = enemy.x + enemy.w/2, sy = enemy.y + enemy.h/2;
                const newPath = findPath(sx, sy, targetCx, targetCy);
                if (newPath && newPath.length) {
                    enemy.path = newPath;
                    enemy.pathIndex = 0;
                    enemy.pathRecalc = 20; // тиков до следующего пересчёта
                } else {
                    enemy.path = [];
                    enemy.pathIndex = 0;
                    enemy.pathRecalc = 10;
                    if (SHOW_AI_DEBUG) console.log('no path found for', enemy.color || enemy.id);
                }
            } else {
                enemy.pathRecalc--;
            }

            // Если есть путь — следуем по waypoints
            // If incoming bullet detected, attempt dodge and skip normal pathing for this tick
            if (tryDodgeIncoming(enemy)) continue;

            if (enemy.path && enemy.path.length) {
                const wp = enemy.path[Math.min(enemy.pathIndex, enemy.path.length - 1)];
                const cx = enemy.x + enemy.w/2, cy = enemy.y + enemy.h/2;
                const toWpX = wp.x - cx, toWpY = wp.y - cy;
                const distToWp = Math.hypot(toWpX, toWpY);
                const ang = Math.atan2(toWpY, toWpX);
                // Дистанция шага — не больше, чем расстояние до точки
                const moveDist = Math.min(tryDist, distToWp);
                // If direct path to waypoint is blocked, attempt local sidestep avoidance
                if (!pathClearFor(enemy, ang, moveDist)) {
                    const sideAngles = [ang + Math.PI/2, ang - Math.PI/2, ang + Math.PI/3, ang - Math.PI/3];
                    let avoided = false;
                    for (const a of sideAngles) {
                        if (moveSmallSteps(enemy, a, moveDist * 0.9)) { enemy.baseAngle = a; avoided = true; break; }
                    }
                    if (avoided) continue;
                    // unable to sidestep — force path recalculation next tick
                    enemy.pathRecalc = 0;
                }
                let movedAlongPath = false;
                // Попробуем основной шаг, затем уменьшенные фракции, чтобы пролезть в узких местах
                const fracs = [1, 0.8, 0.5];
                for (const f of fracs) {
                    if (moveSmallSteps(enemy, ang, moveDist * f)) {
                        movedAlongPath = true;
                        enemy.baseAngle = ang;
                        enemy.stuckCount = 0;
                        break;
                    }
                }
                if (movedAlongPath) {
                    if (distToWp < navCell * 0.35 || distToWp < moveDist * 1.1) {
                        enemy.pathIndex++;
                    }
                } else {
                    enemy.stuckCount = (enemy.stuckCount || 0) + 1;
                    // если не можем двигаться к точке — форсируем пересчёт пути
                    if (enemy.stuckCount > 2) enemy.pathRecalc = 0;
                }
            } else {
                // fallback: старая эвристика (локальные сэмплы углов)
                enemy.baseAngle = Math.atan2(mdy, mdx);
                const desiredAng = enemy.baseAngle;
                // Попытка сделать малые шаги в желаемом направлении
                let moved = false;
                if (moveSmallSteps(enemy, desiredAng, tryDist)) {
                    moved = true;
                    enemy.baseAngle = desiredAng;
                    enemy.stuckCount = 0;
                } else {
                    const MAX_STEPS = 24;
                    const ANG_STEP = Math.PI / 24;
                    for (let s = 1; s <= MAX_STEPS && !moved; s++) {
                        const sign = (s % 2 === 0) ? 1 : -1;
                        const mag = Math.ceil(s / 2);
                        const ang = desiredAng + sign * mag * ANG_STEP;
                        if (moveSmallSteps(enemy, ang, tryDist)) {
                            moved = true; enemy.baseAngle = ang; enemy.stuckCount = 0; break;
                        } else if (SHOW_AI_DEBUG) {
                            const px1 = enemy.x + enemy.w/2; const py1 = enemy.y + enemy.h/2;
                            const px2 = px1 + Math.cos(ang) * tryDist * 4;
                            const py2 = py1 + Math.sin(ang) * tryDist * 4;
                            debugLines.push({ x1: px1, y1: py1, x2: px2, y2: py2, color: 'orange', width: 1 });
                        }
                    }
                }
                if (!moved) {
                    enemy.stuckCount = (enemy.stuckCount || 0) + 1;
                    const sidesteps = [desiredAng + Math.PI/2, desiredAng - Math.PI/2, desiredAng + Math.PI*0.6, desiredAng - Math.PI*0.6];
                    for (const ang of sidesteps) {
                        if (moveSmallSteps(enemy, ang, tryDist)) { moved = true; enemy.baseAngle = ang; enemy.stuckCount = 0; break; }
                        else if (SHOW_AI_DEBUG) { const px1 = enemy.x + enemy.w/2; const py1 = enemy.y + enemy.h/2; const px2 = px1 + Math.cos(ang) * tryDist * 4; const py2 = py1 + Math.sin(ang) * tryDist * 4; debugLines.push({ x1: px1, y1: py1, x2: px2, y2: py2, color: 'aqua', width: 1 }); }
                    }
                    if (!moved && enemy.stuckCount > 4) {
                        const newAng = desiredAng + Math.PI + (Math.random() - 0.5) * Math.PI/2;
                        if (moveSmallSteps(enemy, newAng, tryDist * 1.2)) { moved = true; enemy.baseAngle = newAng; enemy.stuckCount = 0; }
                    }
                    if (!moved) { enemy.x -= Math.cos(enemy.baseAngle) * enemy.speed * 0.25; enemy.y -= Math.sin(enemy.baseAngle) * enemy.speed * 0.25; }
                }
            }
        }

        // (Толкание ящиков теперь обрабатывается внутри moveSmallSteps при необходимости)

        // Стрелять по ближайшей цели; если цель враждебна (другая команда), стрелять чаще
        const shootProb = (nearest.team !== undefined && nearest.team !== enemy.team) ? 0.12 : 0.04;
        if (enemy.fireCooldown > 0) enemy.fireCooldown--;
        if (enemy.fireCooldown <= 0 && Math.random() < shootProb) {
            const tt = enemy.tankType || 'normal';
            let b = null;
            if (tt === 'plasma') {
                b = { x: enemy.x + enemy.w/2 + Math.cos(enemy.turretAngle) * 25, y: enemy.y + enemy.h/2 + Math.sin(enemy.turretAngle) * 25, w:10, h:10, vx:Math.cos(enemy.turretAngle)*8, vy:Math.sin(enemy.turretAngle)*8, life:200, owner:'enemy', team: enemy.team, type:'plasma', damage:3, piercing:true };
            } else if (tt === 'toxic') {
                b = { x: enemy.x + enemy.w/2 + Math.cos(enemy.turretAngle) * 25, y: enemy.y + enemy.h/2 + Math.sin(enemy.turretAngle) * 25, w:6, h:6, vx:Math.cos(enemy.turretAngle)*7, vy:Math.sin(enemy.turretAngle)*7, life:500, owner:'enemy', team: enemy.team, type:'toxic', explodeTimer:45, spawned:5 };
            } else if (tt === 'fire') {
                // Fire-type enemy uses flamethrower cone: spawn multiple flame particles
                const flameCountE = 11;
                const baseAngE = enemy.turretAngle;
                const spreadE = 0.7;
                for (let f = 0; f < flameCountE; f++) {
                    const t = flameCountE <= 1 ? 0.5 : f / (flameCountE - 1);
                    const ang = baseAngE + (t - 0.5) * spreadE + (Math.random() - 0.5) * 0.06;
                    const sx = enemy.x + enemy.w/2 + Math.cos(ang) * 18;
                    const sy = enemy.y + enemy.h/2 + Math.sin(ang) * 18;
                    const speed = 3.5 + Math.random() * 1.2;
                    flames.push({ x: sx, y: sy, vx: Math.cos(ang) * speed, vy: Math.sin(ang) * speed, life: 20 + Math.floor(Math.random() * 8), damage: 0.28, team: enemy.team, owner: 'enemy' });
                }
            } else if (tt === 'buratino') {
                // Enemy buratino: enter artillery mode, spawn target circle and visual rockets (like player)
                const distE = 300;
                const targetXE = enemy.x + enemy.w/2 + Math.cos(enemy.turretAngle) * distE;
                const targetYE = enemy.y + enemy.h/2 + Math.sin(enemy.turretAngle) * distE;
                const targetCircleE = { x: targetXE, y: targetYE, radius: 100, color: enemy.color, timer: 180, type: 'targetCircle' };
                targetCircleE.planned = [];
                for (let j = 0; j < 4; j++) {
                    const ang = (j / 4) * Math.PI * 2;
                    const distP = targetCircleE.radius * 0.3;
                    targetCircleE.planned.push({ x: targetCircleE.x + Math.cos(ang) * distP, y: targetCircleE.y + Math.sin(ang) * distP, exploded: false });
                }
                for (let j = 0; j < 9; j++) {
                    const ang = (j / 9) * Math.PI * 2;
                    const distP = targetCircleE.radius * 0.7;
                    targetCircleE.planned.push({ x: targetCircleE.x + Math.cos(ang) * distP, y: targetCircleE.y + Math.sin(ang) * distP, exploded: false });
                }
                objects.push(targetCircleE);
                enemy.artilleryMode = true;
                enemy.artilleryTimer = 180;
                enemy.fireCooldown = 60;
                const rowsE = 3;
                const colsE = Math.max(5, Math.floor((Math.min(enemy.w, enemy.h) * 1.5) / 10));
                const tSizeE = Math.min(enemy.w, enemy.h) * 0.35 * 1.5;
                const insetE = 6;
                const usableWE = tSizeE - insetE * 2;
                const usableHE = tSizeE - insetE * 2;
                const fanSpreadE = 0.9;
                for (let r = 0; r < rowsE; r++) {
                    const ry = -tSizeE/2 + insetE + r * (usableHE / (rowsE - 1 || 1));
                    for (let c = 0; c < colsE; c++) {
                        const cx = -tSizeE/2 + insetE + c * (usableWE / (colsE - 1 || 1));
                        const baseAng = enemy.turretAngle;
                        const lx = cx;
                        const ly = ry;
                        const sx = enemy.x + enemy.w/2 + Math.cos(baseAng) * lx - Math.sin(baseAng) * ly;
                        const sy = enemy.y + enemy.h/2 + Math.sin(baseAng) * lx + Math.cos(baseAng) * ly;
                        const colNorm = colsE <= 1 ? 0.5 : c / (colsE - 1);
                        const rowNorm = rowsE <= 1 ? 0.5 : r / (rowsE - 1);
                        const angOffset = (colNorm - 0.5) * fanSpreadE + (rowNorm - 0.5) * 0.06;
                        const angRocket = baseAng + angOffset + (Math.random() - 0.5) * 0.03;
                        const planned = targetCircleE.planned || [];
                        const idx = planned.length ? ((r * colsE + c) % planned.length) : 0;
                        const targetPos = planned.length ? planned[idx] : { x: targetXE + Math.cos(angRocket) * (targetCircleE.radius * 0.5), y: targetYE + Math.sin(angRocket) * (targetCircleE.radius * 0.5) };
                        const dx = targetPos.x - sx;
                        const dy = targetPos.y - sy;
                        const delay = Math.floor((r * colsE + c) * 1 + Math.random() * 2);
                        const travel = 180;
                        const vx = dx / travel;
                        const vy = dy / travel;
                        const life = travel + 6;
                        objects.push({ type: 'visualRocket', x: sx, y: sy, vx: vx, vy: vy, life: life, delay: delay, w: 4, h: 3, color: '#000', angOffset: angOffset, target: targetPos });
                    }
                }
            } else {
                // normal or ice and other types default to normal shell
                const w = (tt === 'ice') ? 8 : 9;
                b = { x: enemy.x + enemy.w/2 + Math.cos(enemy.turretAngle) * 25, y: enemy.y + enemy.h/2 + Math.sin(enemy.turretAngle) * 25, w: w, h: w, vx:Math.cos(enemy.turretAngle)*6, vy:Math.sin(enemy.turretAngle)*6, life:100, owner:'enemy', team: enemy.team, type: (tt === 'ice') ? 'ice' : 'normal' };
            }
            if (b) bullets.push(b);
            // Fire-type enemies should be able to spray flames more often
            enemy.fireCooldown = (tt === 'fire') ? 10 : (tt === 'buratino') ? 180 : FIRE_COOLDOWN;
        }
    }
// --- APPEND_POINT_UPDATE_AI_ALLIES ---

    // AI для союзников — действуют как враги, но цель у них — враги
    for (let ally of allies) {
        if (!ally || !ally.alive) continue;
        if (ally.paralyzed) { ally.paralyzedTime--; if (ally.paralyzedTime <= 0) ally.paralyzed = false; if (ally.frozenEffect) ally.frozenEffect--; continue; }
        // If in artillery mode, countdown and skip normal AI movement/actions
        if (ally.artilleryMode) {
            ally.artilleryTimer = (ally.artilleryTimer || 0) - 1;
            if (ally.artilleryTimer <= 0) ally.artilleryMode = false;
            continue;
        }
        const targets = enemies.filter(e => e && e.alive);
        if (targets.length === 0) continue;
        let nearest = targets[0];
        let nd = Math.hypot((nearest.x + (nearest.w||0)/2) - (ally.x + ally.w/2), (nearest.y + (nearest.h||0)/2) - (ally.y + ally.h/2));
        for (const t of targets) {
            const d = Math.hypot((t.x + (t.w||0)/2) - (ally.x + ally.w/2), (t.y + (t.h||0)/2) - (ally.y + ally.h/2));
            if (d < nd) { nearest = t; nd = d; }
        }
        // Aim turret at nearest enemy
        ally.turretAngle = Math.atan2(nearest.y - ally.y, nearest.x - ally.x);

        // Movement towards nearest enemy (reuse enemy logic: pathfinding then small-step fallback)
        const mdx = (nearest.x + (nearest.w||0)/2) - (ally.x + ally.w/2);
        const mdy = (nearest.y + (nearest.h||0)/2) - (ally.y + ally.h/2);
        const mdist = Math.hypot(mdx, mdy);
        if (mdist > 0) {
            const targetCx = nearest.x + (nearest.w||0)/2;
            const targetCy = nearest.y + (nearest.h||0)/2;
            const tryDist = ally.speed;

            if (!ally.path || !ally.path.length || (ally.pathRecalc || 0) <= 0) {
                const sx = ally.x + ally.w/2, sy = ally.y + ally.h/2;
                const newPath = findPath(sx, sy, targetCx, targetCy);
                if (newPath && newPath.length) {
                    ally.path = newPath; ally.pathIndex = 0; ally.pathRecalc = 20;
                } else { ally.path = []; ally.pathIndex = 0; ally.pathRecalc = 10; }
            } else ally.pathRecalc--;

            // If incoming bullet detected, attempt dodge and skip normal pathing for this tick
            if (tryDodgeIncoming(ally)) continue;

            if (ally.path && ally.path.length) {
                const wp = ally.path[Math.min(ally.pathIndex, ally.path.length - 1)];
                const cx = ally.x + ally.w/2, cy = ally.y + ally.h/2;
                const toWpX = wp.x - cx, toWpY = wp.y - cy;
                const distToWp = Math.hypot(toWpX, toWpY);
                const ang = Math.atan2(toWpY, toWpX);
                const moveDist = Math.min(tryDist, distToWp);
                    // Local avoidance: if blocked, try sidesteps before forcing path recalculation
                    if (!pathClearFor(ally, ang, moveDist)) {
                        const sideAngles = [ang + Math.PI/2, ang - Math.PI/2, ang + Math.PI/3, ang - Math.PI/3];
                        let avoided = false;
                        for (const a of sideAngles) {
                            if (moveSmallSteps(ally, a, moveDist * 0.9)) { ally.baseAngle = a; avoided = true; break; }
                        }
                        if (avoided) continue;
                        ally.pathRecalc = 0;
                    }
                let movedAlongPath = false;
                const fracs = [1, 0.8, 0.5];
                for (const f of fracs) {
                    if (moveSmallSteps(ally, ang, moveDist * f)) { movedAlongPath = true; ally.baseAngle = ang; ally.stuckCount = 0; break; }
                }
                if (movedAlongPath) {
                    if (distToWp < navCell * 0.35 || distToWp < moveDist * 1.1) ally.pathIndex++;
                } else { ally.stuckCount = (ally.stuckCount || 0) + 1; if (ally.stuckCount > 2) ally.pathRecalc = 0; }
            } else {
                // fallback local sampling
                ally.baseAngle = Math.atan2(mdy, mdx);
                const desiredAng = ally.baseAngle; let moved = false;
                if (moveSmallSteps(ally, desiredAng, tryDist)) { moved = true; ally.baseAngle = desiredAng; ally.stuckCount = 0; }
                else {
                    const MAX_STEPS = 24; const ANG_STEP = Math.PI/24;
                    for (let s=1; s<=MAX_STEPS && !moved; s++) {
                        const sign = (s%2===0)?1:-1; const mag = Math.ceil(s/2); const ang = desiredAng + sign*mag*ANG_STEP;
                        if (moveSmallSteps(ally, ang, tryDist)) { moved = true; ally.baseAngle = ang; ally.stuckCount = 0; break; }
                    }
                }
                if (!moved) { ally.stuckCount = (ally.stuckCount||0) + 1; if (ally.stuckCount > 4) { const newAng = desiredAng + Math.PI + (Math.random()-0.5)*Math.PI/2; if (moveSmallSteps(ally, newAng, tryDist*1.2)) { ally.baseAngle = newAng; ally.stuckCount = 0; } } if (!moved) { ally.x -= Math.cos(ally.baseAngle)*ally.speed*0.25; ally.y -= Math.sin(ally.baseAngle)*ally.speed*0.25; } }
            }

            // Shoot at target occasionally with cooldown
            const shootProb = 0.06;
            if (ally.fireCooldown > 0) ally.fireCooldown--;
            if (ally.fireCooldown <= 0 && Math.random() < shootProb) {
                const tt = ally.tankType || 'normal';
                let b = null;
                if (tt === 'plasma') {
                    b = { x: ally.x + ally.w/2 + Math.cos(ally.turretAngle)*25, y: ally.y + ally.h/2 + Math.sin(ally.turretAngle)*25, w:10, h:10, vx:Math.cos(ally.turretAngle)*8, vy:Math.sin(ally.turretAngle)*8, life:200, owner:'ally', team: ally.team, type:'plasma', damage:3, piercing:true };
                } else if (tt === 'toxic') {
                    b = { x: ally.x + ally.w/2 + Math.cos(ally.turretAngle)*25, y: ally.y + ally.h/2 + Math.sin(ally.turretAngle)*25, w:6, h:6, vx:Math.cos(ally.turretAngle)*7, vy:Math.sin(ally.turretAngle)*7, life:500, owner:'ally', team: ally.team, type:'toxic', explodeTimer:45, spawned:5 };
                } else if (tt === 'fire') {
                    // Ally fire-type uses flamethrower: spawn flame particles
                        const flameCountA = 11;
                    const baseAngA = ally.turretAngle;
                    const spreadA = 0.7;
                    for (let f = 0; f < flameCountA; f++) {
                        const t = flameCountA <= 1 ? 0.5 : f / (flameCountA - 1);
                        const ang = baseAngA + (t - 0.5) * spreadA + (Math.random() - 0.5) * 0.06;
                        const sx = ally.x + ally.w/2 + Math.cos(ang) * 18;
                        const sy = ally.y + ally.h/2 + Math.sin(ang) * 18;
                        const speed = 3.5 + Math.random() * 1.2;
                        flames.push({ x: sx, y: sy, vx: Math.cos(ang) * speed, vy: Math.sin(ang) * speed, life: 20 + Math.floor(Math.random() * 8), damage: 0.28, team: ally.team, owner: 'ally' });
                    }
                } else if (tt === 'buratino') {
                    // Ally buratino: enter artillery mode, spawn target circle and visual rockets (like player and enemy)
                    const distA = 300;
                    const targetXA = ally.x + ally.w/2 + Math.cos(ally.turretAngle) * distA;
                    const targetYA = ally.y + ally.h/2 + Math.sin(ally.turretAngle) * distA;
                    const targetCircleA = { x: targetXA, y: targetYA, radius: 100, color: ally.color, timer: 180, type: 'targetCircle' };
                    targetCircleA.planned = [];
                    for (let j = 0; j < 4; j++) {
                        const ang = (j / 4) * Math.PI * 2;
                        const distP = targetCircleA.radius * 0.3;
                        targetCircleA.planned.push({ x: targetCircleA.x + Math.cos(ang) * distP, y: targetCircleA.y + Math.sin(ang) * distP, exploded: false });
                    }
                    for (let j = 0; j < 9; j++) {
                        const ang = (j / 9) * Math.PI * 2;
                        const distP = targetCircleA.radius * 0.7;
                        targetCircleA.planned.push({ x: targetCircleA.x + Math.cos(ang) * distP, y: targetCircleA.y + Math.sin(ang) * distP, exploded: false });
                    }
                    objects.push(targetCircleA);
                    ally.artilleryMode = true;
                    ally.artilleryTimer = 180;
                    ally.fireCooldown = 60;
                    const rowsA = 3;
                    const colsA = Math.max(5, Math.floor((Math.min(ally.w, ally.h) * 1.5) / 10));
                    const tSizeA = Math.min(ally.w, ally.h) * 0.35 * 1.5;
                    const insetA = 6;
                    const usableWA = tSizeA - insetA * 2;
                    const usableHA = tSizeA - insetA * 2;
                    const fanSpreadA = 0.9;
                    for (let r = 0; r < rowsA; r++) {
                        const ry = -tSizeA/2 + insetA + r * (usableHA / (rowsA - 1 || 1));
                        for (let c = 0; c < colsA; c++) {
                            const cx = -tSizeA/2 + insetA + c * (usableWA / (colsA - 1 || 1));
                            const baseAng = ally.turretAngle;
                            const lx = cx;
                            const ly = ry;
                            const sx = ally.x + ally.w/2 + Math.cos(baseAng) * lx - Math.sin(baseAng) * ly;
                            const sy = ally.y + ally.h/2 + Math.sin(baseAng) * lx + Math.cos(baseAng) * ly;
                            const colNorm = colsA <= 1 ? 0.5 : c / (colsA - 1);
                            const rowNorm = rowsA <= 1 ? 0.5 : r / (rowsA - 1);
                            const angOffset = (colNorm - 0.5) * fanSpreadA + (rowNorm - 0.5) * 0.06;
                            const angRocket = baseAng + angOffset + (Math.random() - 0.5) * 0.03;
                            const planned = targetCircleA.planned || [];
                            const idx = planned.length ? ((r * colsA + c) % planned.length) : 0;
                            const targetPos = planned.length ? planned[idx] : { x: targetXA + Math.cos(angRocket) * (targetCircleA.radius * 0.5), y: targetYA + Math.sin(angRocket) * (targetCircleA.radius * 0.5) };
                            const dx = targetPos.x - sx;
                            const dy = targetPos.y - sy;
                            const delay = Math.floor((r * colsA + c) * 1 + Math.random() * 2);
                            const travel = 180;
                            const vx = dx / travel;
                            const vy = dy / travel;
                            const life = travel + 6;
                            objects.push({ type: 'visualRocket', x: sx, y: sy, vx: vx, vy: vy, life: life, delay: delay, w: 4, h: 3, color: '#000', angOffset: angOffset, target: targetPos });
                        }
                    }
                    const w = (tt === 'ice') ? 8 : 9;
                    b = { x: ally.x + ally.w/2 + Math.cos(ally.turretAngle)*25, y: ally.y + ally.h/2 + Math.sin(ally.turretAngle)*25, w: w, h: w, vx:Math.cos(ally.turretAngle)*6, vy:Math.sin(ally.turretAngle)*6, life:100, owner:'ally', team: ally.team, type: (tt === 'ice') ? 'ice' : 'normal' };
                }
                if (b) bullets.push(b);
                ally.fireCooldown = (tt === 'fire') ? 10 : (tt === 'buratino') ? 180 : FIRE_COOLDOWN;
            }
        }
    }
// --- APPEND_POINT_UPDATE_REST ---

    // Обновление пуль
    for (let i = bullets.length - 1; i >= 0; i--) {
        const b = bullets[i];
        // gravity only for bullets that explicitly enable it via hasGravity
        if (b.hasGravity) {
            if (b.gravityDelay && b.gravityDelay > 0) {
                b.gravityDelay--;
            } else {
                b.vy += 0.18; // gravity
            }
        }
        b.x += b.vx;
        b.y += b.vy;
        b.life--;
        
        // Decrease spawn protection counter
        if (b.spawned > 0) b.spawned--;
        
        // Check explode timer for toxic/megabomb (only if spawn protection is done and timer is active)
        if ((b.type === 'toxic' || b.type === 'megabomb') && b.spawned <= 0) {
            if (b.explodeTimer > 0) {
                b.explodeTimer--;
                if (b.explodeTimer <= 0) {
                    explodeGas(b, b.type === 'megabomb');
                    bullets.splice(i, 1);
                    continue;
                }
            }
        }
        
        if (b.life <= 0) {
            if (b.type === 'rocket' || b.type === 'smallRocket') explodeRocket(b);
            else if (b.type === 'toxic' || b.type === 'megabomb') explodeGas(b, b.type === 'megabomb');
            bullets.splice(i, 1);
            continue;
        }
        // normalize bullet rect (bullets stored by center)
        const bRect = { x: b.x - (b.w||0)/2, y: b.y - (b.h||0)/2, w: b.w || 4, h: b.h || 4 };
        // Check collision with objects (but toxic/megabomb/plasmaBlast pass through everything except walls for plasmaBlast)
        let hit = false;
        if (b.type !== 'rocket' && b.type !== 'toxic' && b.type !== 'megabomb' && b.type !== 'plasmaBlast') {
            for (const obj of objects) {
                if (checkRectCollision(bRect, obj)) {
                    // Toxic/mega bombs pass through walls but explode on other objects
                    if ((b.type === 'toxic' || b.type === 'megabomb') && obj.type === 'wall') {
                        // pass through walls, don't explode
                        continue;
                    }
                    // Other bullets explode on collision, but toxic/megabomb only explode by timer
                    if (b.type !== 'toxic' && b.type !== 'megabomb') {
                        // regular explosion logic for non-toxic bullets
                    }
                    bullets.splice(i, 1);
                    hit = true;
                    if (obj.type === 'box') {
                        objects.splice(objects.indexOf(obj), 1);
                        for (let j = 0; j < 5; j++) spawnParticle(obj.x + obj.w/2, obj.y + obj.h/2);
                        navNeedsRebuild = true;
                    } else if (obj.type === 'barrel') {
                        // barrel explodes
                        explodeBarrel(obj);
                    }
                    break;
                }
            }
        }
        // Special handling for plasmaBlast: destroys walls
        if (b.type === 'plasmaBlast') {
            for (let j = objects.length - 1; j >= 0; j--) {
                const obj = objects[j];
                if (checkRectCollision(bRect, obj) && obj.type === 'wall') {
                    // Destroy wall permanently
                    objects.splice(j, 1);
                    navNeedsRebuild = true;
                    for (let k = 0; k < 10; k++) spawnParticle(obj.x + obj.w/2, obj.y + obj.h/2);
                    // Continue flying, don't remove bullet
                }
            }
        }
        if (!hit) {
            // Check collision with tank (player team = 0) - toxic/megabomb only damage, don't stop
            if (tank.hp > 0 && checkRectCollision(bRect, tank) && b.team !== tank.team) {
                if (b.type === 'rocket' || b.type === 'smallRocket') {
                    explodeRocket(b);
                    bullets.splice(i, 1);
                } else if (b.type === 'toxic' || b.type === 'megabomb') {
                    // Toxic bombs only damage, don't stop or explode on contact
                    tank.hp -= 5;
                    // continue flying, don't remove bullet
                } else if (b.type === 'plasma') {
                    // Plasma bolt pierces through tank
                    tank.hp -= b.damage || 3;
                    // continue flying, don't remove bullet
                } else if (b.type === 'plasmaBlast') {
                    // Plasma blast pierces through tank
                    tank.hp -= b.damage || 5;
                    // continue flying, don't remove bullet
                    } else {
                        tank.hp -= (b.type === 'fire' ? 16 : b.type === 'rocket' ? 2 : 1);
                        if (b.type === 'ice' && tankType !== 'ice') { tank.paralyzed = true; tank.paralyzedTime = 180; tank.frozenEffect = 180; }
                        bullets.splice(i, 1);
                    }
                if (tank.hp <= 0) {
                    for (let k = 0; k < 30; k++) spawnParticle(tank.x + tank.w/2, tank.y + tank.h/2);
                    if (currentMode === 'war') {
                        if (tank.respawnCount >= 2) {
                            gameState = 'lose';
                        } else {
                            tank.alive = false;
                            tank.respawnTimer = 600; // 10s
                        }
                    } else {
                        gameState = 'lose';
                    }
                }
                continue;
            }
            // Check collision with allies - toxic/megabomb only damage, don't stop
            for (let j = allies.length - 1; j >= 0; j--) {
                const a = allies[j];
                if (!a || !a.alive) continue;
                if (checkRectCollision(bRect, a) && b.team !== a.team) {
                    if (b.type === 'rocket' || b.type === 'smallRocket') {
                        explodeRocket(b);
                        bullets.splice(i, 1);
                    } else if (b.type === 'toxic' || b.type === 'megabomb') {
                        // Toxic bombs only damage, don't stop or explode on contact
                        a.hp = (a.hp || 100) - 5;
                        // continue flying, don't remove bullet
                    } else if (b.type === 'plasma') {
                        // Plasma bolt pierces through allies
                        a.hp = (a.hp || 100) - (b.damage || 3);
                        // continue flying, don't remove bullet
                    } else if (b.type === 'plasmaBlast') {
                        // Plasma blast pierces and damages all in line
                        a.hp = (a.hp || 100) - (b.damage || 5);
                        // continue flying, don't remove bullet
                    } else {
                        a.hp = (a.hp || 100) - (b.type === 'fire' ? 16 : b.type === 'rocket' ? 2 : 1);
                        if (b.type === 'ice' && a.tankType !== 'ice') { a.paralyzed = true; a.paralyzedTime = 180; a.frozenEffect = 180; }
                        bullets.splice(i, 1);
                    }
                    if (a.hp <= 0) {
                        if (currentMode === 'war') {
                            a.alive = false; a.respawnTimer = 600; for (let k = 0; k < 8; k++) spawnParticle(a.x + a.w/2, a.y + a.h/2);
                        } else {
                            allies.splice(j, 1);
                            for (let k = 0; k < 8; k++) spawnParticle(a.x + a.w/2, a.y + a.h/2);
                        }
                    }
                    break;
                }
            }
            // Check collision with enemies - toxic/megabomb only damage, don't stop
            for (let j = enemies.length - 1; j >= 0; j--) {
                const e = enemies[j];
                if (!e || !e.alive) continue;
                if (checkRectCollision(bRect, e) && b.team !== e.team) {
                    if (b.type === 'rocket' || b.type === 'smallRocket') {
                        explodeRocket(b);
                        bullets.splice(i, 1);
                    } else if (b.type === 'toxic' || b.type === 'megabomb') {
                        // Toxic bombs only damage, don't stop or explode on contact
                        e.hp -= 5;
                        // continue flying, don't remove bullet
                    } else if (b.type === 'plasma') {
                        // Plasma bolt pierces through enemies
                        e.hp -= b.damage || 3;
                        // continue flying, don't remove bullet
                    } else if (b.type === 'plasmaBlast') {
                        // Plasma blast pierces and damages all in line
                        e.hp -= b.damage || 5;
                        // continue flying, don't remove bullet
                    } else {
                        e.hp -= (b.type === 'fire' ? 16 : b.type === 'rocket' ? 2 : 1);
                        if (b.type === 'ice' && e.tankType !== 'ice') { e.paralyzed = true; e.paralyzedTime = 180; e.frozenEffect = 180; }
                        bullets.splice(i, 1);
                    }
                    if (e.hp <= 0) {
                        coins += 5; // earn coins for killing enemy
                        if (currentMode === 'war') {
                            e.alive = false; e.respawnTimer = 600; for (let k = 0; k < 10; k++) spawnParticle(e.x + e.w/2, e.y + e.h/2);
                        } else {
                            enemies.splice(j, 1);
                            for (let k = 0; k < 10; k++) spawnParticle(e.x + e.w/2, e.y + e.h/2);
                        }
                    }
                    break;
                }
            }
        }
    }
    
    // Обновление огненных частиц
    for (let i = flames.length - 1; i >= 0; i--) {
        const f = flames[i];
        f.x += f.vx;
        f.y += f.vy;
        f.life--;
        if (f.life <= 0) {
            flames.splice(i, 1);
            continue;
        }
        // Check collision with objects
        let hit = false;
        for (const obj of objects) {
            if (checkRectCollision({x: f.x-2, y: f.y-2, w:4, h:4}, obj)) {
                flames.splice(i, 1);
                hit = true;
                if (obj.type === 'box') {
                    objects.splice(objects.indexOf(obj), 1);
                    for (let j = 0; j < 5; j++) spawnParticle(obj.x + obj.w/2, obj.y + obj.h/2);
                    navNeedsRebuild = true;
                } else if (obj.type === 'barrel') {
                    explodeBarrel(obj);
                }
                break;
            }
        }
        if (!hit) {
            // Check collision with tank
            if (tank.hp > 0 && checkRectCollision({x: f.x-2, y: f.y-2, w:4, h:4}, tank) && f.team !== tank.team) {
                tank.hp -= f.damage;
                flames.splice(i, 1);
                if (tank.hp <= 0) {
                    for (let k = 0; k < 30; k++) spawnParticle(tank.x + tank.w/2, tank.y + tank.h/2);
                    if (currentMode === 'war') {
                        if (tank.respawnCount >= 2) {
                            gameState = 'lose';
                        } else {
                            tank.alive = false;
                            tank.respawnTimer = 600;
                        }
                    } else {
                        gameState = 'lose';
                    }
                }
                continue;
            }
            // Check collision with allies
            for (let j = allies.length - 1; j >= 0; j--) {
                const a = allies[j];
                if (!a || !a.alive) continue;
                if (checkRectCollision({x: f.x-2, y: f.y-2, w:4, h:4}, a) && f.team !== a.team) {
                    a.hp -= f.damage;
                    flames.splice(i, 1);
                    if (a.hp <= 0) {
                        if (currentMode === 'war') {
                            a.alive = false; a.respawnTimer = 600; for (let k = 0; k < 8; k++) spawnParticle(a.x + a.w/2, a.y + a.h/2);
                        } else {
                            allies.splice(j, 1);
                            for (let k = 0; k < 8; k++) spawnParticle(a.x + a.w/2, a.y + a.h/2);
                        }
                    }
                    break;
                }
            }
            // Check collision with enemies
            for (let j = enemies.length - 1; j >= 0; j--) {
                const e = enemies[j];
                if (!e || !e.alive) continue;
                if (checkRectCollision({x: f.x-2, y: f.y-2, w:4, h:4}, e) && f.team !== e.team) {
                    e.hp -= f.damage;
                    flames.splice(i, 1);
                    if (e.hp <= 0) {
                        coins += 5;
                        if (currentMode === 'war') {
                            e.alive = false; e.respawnTimer = 600; for (let k = 0; k < 10; k++) spawnParticle(e.x + e.w/2, e.y + e.h/2);
                        } else {
                            enemies.splice(j, 1);
                            for (let k = 0; k < 10; k++) spawnParticle(e.x + e.w/2, e.y + e.h/2);
                        }
                    }
                    break;
                }
            }
        }
    }
    
    // Обновление target circles
    for (let i = objects.length - 1; i >= 0; i--) {
        const obj = objects[i];
        if (obj.type === 'targetCircle') {
            obj.timer--;
            if (obj.timer <= 0) {
                // use global applyDamage(x,y) helper for area damage
                // If planned positions exist, only spawn explosions for positions not yet exploded.
                if (obj.planned && obj.planned.length) {
                    for (let p of obj.planned) {
                        if (!p.exploded) {
                            objects.push({ type: 'explosion', x: p.x, y: p.y, radius: 30, life: 30, color: '#FFA500' });
                            applyDamage(p.x, p.y);
                        }
                    }
                } else {
                    // fallback: spawn original pattern
                    for (let j = 0; j < 4; j++) {
                        const ang = (j / 4) * Math.PI * 2;
                        const dist = obj.radius * 0.3;
                        const ex = obj.x + Math.cos(ang) * dist;
                        const ey = obj.y + Math.sin(ang) * dist;
                        objects.push({ type: 'explosion', x: ex, y: ey, radius: 30, life: 30, color: '#FFA500' });
                        applyDamage(ex, ey);
                    }
                    for (let j = 0; j < 9; j++) {
                        const ang = (j / 9) * Math.PI * 2;
                        const dist = obj.radius * 0.7;
                        const ex = obj.x + Math.cos(ang) * dist;
                        const ey = obj.y + Math.sin(ang) * dist;
                        objects.push({ type: 'explosion', x: ex, y: ey, radius: 30, life: 30, color: '#FFA500' });
                        applyDamage(ex, ey);
                    }
                }
                objects.splice(i, 1);
            }
        } else if (obj.type === 'explosion') {
            obj.life--;
            if (obj.life <= 0) objects.splice(i, 1);
        } else if (obj.type === 'gas') {
            // gas cloud visual fades over time
            obj.life--;
            if (obj.life <= 0) objects.splice(i, 1);
        } else if (obj.type === 'visualRocket') {
            // visual rocket supports an initial delay (stay at tube), then fly, leave a trail, and explode on arrival
            if (obj.delay && obj.delay > 0) {
                obj.delay--;
                if (obj.delay === 0) spawnParticle(obj.x, obj.y);
            } else {
                obj.x += obj.vx;
                obj.y += obj.vy;
                // small smoke trail
                if (Math.random() < 0.6) {
                    particles.push({ x: obj.x, y: obj.y, vx: (Math.random() - 0.5) * 0.4 - obj.vx * 0.08, vy: (Math.random() - 0.5) * 0.4 - obj.vy * 0.08, life: 8, size: 2, color: 'rgba(80,80,80,0.6)' });
                }

                // If rocket has an assigned planned target, detonate precisely at that planned spot
                let exploded = false;
                if (obj.target) {
                    const distToTarget = Math.hypot(obj.x - obj.target.x, obj.y - obj.target.y);
                    if (distToTarget <= 10) {
                        // spawn explosion at planned spot and mark it
                        objects.push({ type: 'explosion', x: obj.target.x, y: obj.target.y, radius: 30, life: 30, color: '#FFA500' });
                        obj.target.exploded = true;
                        applyDamage(obj.target.x, obj.target.y, 30, 1, obj.team);
                        exploded = true;
                    }
                } else {
                    // fallback: if no assigned target, explode when entering any targetCircle
                    for (let j = 0; j < objects.length; j++) {
                        const o = objects[j];
                        if (o.type === 'targetCircle') {
                            const dist = Math.hypot(obj.x - o.x, obj.y - o.y);
                            if (dist <= o.radius + 6) {
                                objects.push({ type: 'explosion', x: obj.x, y: obj.y, radius: 30, life: 30, color: '#FFA500' });
                                applyDamage(obj.x, obj.y, 30, 1, obj.team);
                                exploded = true;
                                break;
                            }
                        }
                    }
                }

                obj.life--;
                if (exploded || obj.life <= 0) {
                    // remove rocket
                    objects.splice(i, 1);
                }
            }
        }
    }
    
    // Check artillery mode
    if (tank.artilleryTimer > 0) {
        tank.artilleryTimer--;
        if (tank.artilleryTimer <= 0) tank.artilleryMode = false;
    }
    
    // Обновление частиц
    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx; p.y += p.vy;
        p.life -= 0.02;
        if (p.life <= 0) particles.splice(i, 1);
    }

    // Apply gas effects: check entities entering gas clouds and apply poison timers
    const GAS_DEBUFF_TICKS = 3 * 60; // 3 seconds
    for (const obj of objects) {
        if (obj.type !== 'gas') continue;
        // Only poison enemies if gas was created by player
        if (obj.owner === 'player') {
            // enemies
            for (const e of enemies) {
                if (!e || !e.alive) continue;
                const dist = Math.hypot((e.x + (e.w||0)/2) - obj.x, (e.y + (e.h||0)/2) - obj.y);
                if (dist <= obj.radius) {
                    if (!e.poisonTimer || e.poisonTimer <= 0) e.poisonTimer = GAS_DEBUFF_TICKS;
                }
            }
        } else if (obj.owner === 'ally') {
            // Only poison enemies if gas was created by an ally
            for (const e of enemies) {
                if (!e || !e.alive) continue;
                const dist = Math.hypot((e.x + (e.w||0)/2) - obj.x, (e.y + (e.h||0)/2) - obj.y);
                if (dist <= obj.radius) {
                    if (!e.poisonTimer || e.poisonTimer <= 0) e.poisonTimer = GAS_DEBUFF_TICKS;
                }
            }
        } else if (obj.owner === 'enemy') {
            // Only poison player and allies if gas was created by an enemy
            if (tank.alive !== false) {
                const dist = Math.hypot((tank.x + tank.w/2) - obj.x, (tank.y + tank.h/2) - obj.y);
                if (dist <= obj.radius) {
                    if (!tank.poisonTimer || tank.poisonTimer <= 0) tank.poisonTimer = GAS_DEBUFF_TICKS;
                }
            }
            for (const a of allies) {
                if (!a || !a.alive) continue;
                const dist = Math.hypot((a.x + (a.w||0)/2) - obj.x, (a.y + (a.h||0)/2) - obj.y);
                if (dist <= obj.radius) {
                    if (!a.poisonTimer || a.poisonTimer <= 0) a.poisonTimer = GAS_DEBUFF_TICKS;
                }
            }
        }
    }

    // Apply poison damage over time to all entities with poisonTimer
    const applyPoisonTick = (ent) => {
        if (!ent || !ent.poisonTimer) return;
        if (ent.alive === false) return; // Don't poison dead entities
        if (ent.poisonTimer > 0) {
            // damage = (maxHp or 3) / 6 per second -> per tick divide by 60
            const maxHp = ent.maxHp || 3;
            const dmgPerSec = maxHp / 6;
            const dmgPerTick = dmgPerSec / 60;
            ent.hp = (ent.hp || 0) - dmgPerTick;
            ent.poisonTimer--;
            if (ent.hp <= 0) {
                ent.hp = 0;
                ent.alive = false;
                if (ent === tank) {
                    for (let k = 0; k < 30; k++) spawnParticle(ent.x + ent.w/2, ent.y + ent.h/2);
                    if (currentMode !== 'war') { gameState = 'lose'; }
                }
            }
        }
    };
    applyPoisonTick(tank);
    
    // Allies poison check
    for (let i = allies.length - 1; i >= 0; i--) {
        const a = allies[i];
        applyPoisonTick(a);
        if (a.hp <= 0 && a.alive === false) {
             if (currentMode === 'war') {
                 if (!a.respawnTimer) {
                     a.respawnTimer = 600;
                     for (let k = 0; k < 8; k++) spawnParticle(a.x + a.w/2, a.y + a.h/2);
                 }
             } else {
                 allies.splice(i, 1);
                 for (let k = 0; k < 8; k++) spawnParticle(a.x + a.w/2, a.y + a.h/2);
             }
        }
    }
    
    // Enemies poison check
    for (let i = enemies.length - 1; i >= 0; i--) {
        const e = enemies[i];
        applyPoisonTick(e);
        if (e.hp <= 0 && e.alive === false) {
             if (currentMode === 'war') {
                 if (!e.respawnTimer) {
                     e.respawnTimer = 600;
                     for (let k = 0; k < 10; k++) spawnParticle(e.x + e.w/2, e.y + e.h/2);
                 }
             } else {
                 if (currentMode === 'single' || currentMode === 'team') coins += 5; // Reward
                 enemies.splice(i, 1);
                 for (let k = 0; k < 10; k++) spawnParticle(e.x + e.w/2, e.y + e.h/2);
             }
        }
    }

    // Respawn timers (War mode): decrement and respawn if team still has members
    if (currentMode === 'war') {
        // player
        if (tank.alive === false && tank.respawnTimer > 0) {
            tank.respawnTimer--;
            if (tank.respawnTimer <= 0) {
                if (teamHasAliveMember(0) && tank.respawnCount < 2) {
                    // respawn near team spawn
                    const sp = (warTeamSpawns[0]) ? warTeamSpawns[0] : { x: 120, y: 120 };
                    const p = findFreeSpot(sp.x - 40 + Math.random()*80, sp.y - 40 + Math.random()*80, tank.w, tank.h, 600, 24);
                    if (p) {
                         tank.x = p.x; tank.y = p.y; tank.hp = (tankType === 'fire' ? 6 : 3); tank.alive = true; tank.respawnTimer = 0; tank.respawnCount++;
                    } else {
                         // fallback respawn
                         tank.x = sp.x; tank.y = sp.y; tank.hp = (tankType === 'fire' ? 6 : 3); tank.alive = true; tank.respawnTimer = 0; tank.respawnCount++;
                    }
                }
            }
        }
        // allies
        for (const a of allies) {
            if (!a) continue;
            if (a.alive === false && (a.respawnTimer || 0) > 0) {
                a.respawnTimer--;
                if (a.respawnTimer <= 0) {
                    if (teamHasAliveMember(a.team) && (a.respawnCount || 0) < 2) {
                        const sp = warTeamSpawns[a.team] || { x: 120, y: 120 };
                        const p = findFreeSpot(sp.x + (Math.random()-0.5)*160, sp.y + (Math.random()-0.5)*160, a.w, a.h, 1000, 24);
                        a.x = p.x; a.y = p.y; a.hp = (a.tankType === 'fire') ? 6 : 3; a.alive = true; a.respawnTimer = 0; a.respawnCount = (a.respawnCount || 0) + 1;
                    }
                }
            }
        }
        // enemies
        for (const e of enemies) {
            if (!e) continue;
            if (e.alive === false && (e.respawnTimer || 0) > 0) {
                e.respawnTimer--;
                if (e.respawnTimer <= 0) {
                    if (teamHasAliveMember(e.team) && (e.respawnCount || 0) < 2) {
                        const sp = warTeamSpawns[e.team] || { x: worldWidth - 120, y: worldHeight - 120 };
                        const p = findFreeSpot(sp.x + (Math.random()-0.5)*160, sp.y + (Math.random()-0.5)*160, e.w, e.h, 1000, 24);
                        e.x = p.x; e.y = p.y; e.hp = (e.tankType === 'fire') ? 6 : 3; e.alive = true; e.respawnTimer = 0; e.respawnCount = (e.respawnCount || 0) + 1;
                    }
                }
            }
        }
    }

    // Проверка победы/поражения
    if (currentMode === 'war') {
        const aliveEnemies = enemies.filter(e => e && e.alive !== false && e.hp > 0);
        if (aliveEnemies.length === 0) {
            gameState = 'win';
            coins += 50; // reward for war
        } else if (!teamHasAliveMember(0)) {
            gameState = 'lose';
        }
    } else if (enemies.length === 0) {
        gameState = 'win';
        if (currentMode === 'single') coins += 25;
        else if (currentMode === 'team') coins += 40;
    }
}

function moveWithCollision(dx, dy) {
    tank.x += dx;
    tank.y += dy;

    for (const obj of objects) {
        if (checkRectCollision(tank, obj)) {
            if (obj.type === 'box' || obj.type === 'barrel') {
                // Пытаемся толкать ящик
                obj.x += dx;
                obj.y += dy;
                
                const blocked = objects.some(o => o !== obj && checkRectCollision(obj, o)) ||
                                obj.x < 0 || obj.y < 0 || 
                                obj.x + obj.w > worldWidth || obj.y + obj.h > worldHeight;
                
                if (blocked) {
                    obj.x -= dx; obj.y -= dy;
                    tank.x -= dx; tank.y -= dy;
                } else if (dx !== 0 || dy !== 0) {
                    spawnParticle(obj.x + obj.w/2, obj.y + obj.h/2);
                }
            } else {
                // Жесткая стена
                tank.x -= dx;
                tank.y -= dy;
            }
        }
    }
    
    // Края мира
    tank.x = Math.max(0, Math.min(worldWidth - tank.w, tank.x));
    tank.y = Math.max(0, Math.min(worldHeight - tank.h, tank.y));
}

function updateCoinDisplay() {
    const coinDisplay = document.getElementById('coinDisplay');
    if (coinDisplay) coinDisplay.textContent = coins;
    localStorage.setItem('tankCoins', coins);
}


// Постоянный цикл обновления физики
setInterval(update, 1000/60);

// Инициализация после загрузки страницы — защищаем от ранних ошибок
window.addEventListener('load', () => {
    try {
        console.log('Game init');
        generateMap();
        // draw() may be block-scoped in some environments; retry until available
        const tryStart = () => {
            if (typeof draw === 'function') {
                draw();
            } else {
                console.warn('draw not ready, retrying');
                setTimeout(tryStart, 50);
            }
        };
        tryStart();
        // Also draw character previews which should now be available from tanks.js
        if (typeof drawCharacterPreviews === 'function') drawCharacterPreviews();
    } catch (err) {
        console.error('Init error', err);
    }
});

// Function to set selected tank (called from tanks.js)
window.setSelectedTank = function(selectedType) {
    console.log('Setting selected tank to: ' + selectedType);
    tankType = selectedType;
    tankColor = '#0000FF';
    tank.color = tankColor;

    // Special properties for specific tanks
    if (selectedType === 'fire') {
        tank.hp = 6;
    } else if (selectedType === 'toxic') {
        tank.megaGasUsed = false;
    } else if (selectedType === 'plasma') {
        tank.plasmaBlastUsed = 0; // counter for plasma blasts used
    }
};

// Function to get current tank type
window.getCurrentTankType = () => tankType;

// Tank detail modal event listeners
const tankDetailClose = document.getElementById('tankDetailClose');
const tankDetailSelect = document.getElementById('tankDetailSelect');
let currentTankType = 'normal'; // To remember which tank is being viewed

if (tankDetailClose) tankDetailClose.addEventListener('click', () => {
    hideTankDetail();
});

if (tankDetailSelect) tankDetailSelect.addEventListener('click', () => {
    console.log('Selecting tank, currentTankType: ' + currentTankType);
    selectTank(currentTankType);
});

// Override showTankDetail after tanks.js loads
window.addEventListener('load', () => {
    const originalShowTankDetail = window.showTankDetail;
    window.showTankDetail = function(tankType) {
        console.log('Overriding showTankDetail for: ' + tankType);
        currentTankType = tankType;
        originalShowTankDetail(tankType);
    };
});