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

// Command input element
const commandInput = document.getElementById('commandInput');

// Глобальное состояние
const keys = {};
let objects = [];
let particles = [];
let bullets = [];
let flames = [];
let soundWaves = [];
let illusions = [];
let electricRays = [];  // Electric chain lightning beams
let novaZones = [];  // Active nova damage zones (center, radius, life, ownerTeam)
let enemies = [];
let allies = [];
let gameState = 'menu';
let menuMusic = new Audio('music/menu.mp3');
menuMusic.loop = true;
menuMusic.volume = 0.5;
let fightMusic = new Audio('music/fight.mp3');
fightMusic.loop = true;
fightMusic.volume = 0.5;
let duelMusic = new Audio('music/duel.mp3');
duelMusic.loop = true;
duelMusic.volume = 0.5;
let teamMusic = new Audio('music/team.mp3');
teamMusic.loop = true;
teamMusic.volume = 0.5;
let tankMusic = new Audio('music/tank.mp3');
tankMusic.loop = true;
tankMusic.volume = 0.5;
let exfightMusic = new Audio('music/exfight.mp3');
exfightMusic.loop = true;
exfightMusic.volume = 0.5;
let currentMode = 'menu';
let duelState = null;

// Battle metrics tracking
let gameStartTime = null;
let playerDamageTaken = 0;
let playerMaxHpAtStart = 0;
let battleEnemyCount = 0;

// Throttling AI counters
let globalPathBudget = 0;
const MAX_PATH_BUDGET = 2; // max A* searches per frame
const MAX_PATH_BUDGET_ONEVSALL = 1; // reduced for one vs all mode
const MAX_STEPS_FALLBACK = 8; // was 24, severely reduced for performance
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
let gems = parseInt(localStorage.getItem('tankGems')) || 0;
let trophies = parseInt(localStorage.getItem('tankTrophies')) || 0;
let claimedRewards = JSON.parse(localStorage.getItem('tankClaimedRewards')) || [];

// Trophy Road Rewards
const trophyRoadRewards = [
    { trophies: 0, type: 'start', reward: 'Старт', claimed: false },
    { trophies: 5, type: 'container', level: 'mini', reward: 'Мини-контейнер', claimed: false },
    { trophies: 10, type: 'coins', amount: 150, reward: '150 монет', claimed: false },
    { trophies: 15, type: 'container', level: 'mini', reward: 'Мини-контейнер', claimed: false },
    { trophies: 20, type: 'container', level: 'normal', reward: 'Обычный контейнер', claimed: false },
    { trophies: 25, type: 'gems', amount: 5, reward: '5 гемов', claimed: false },
    { trophies: 30, type: 'gems', amount: 10, reward: '10 гемов', claimed: false },
    { trophies: 40, type: 'coins', amount: 250, reward: '250 монет', claimed: false },
    { trophies: 50, type: 'container', level: 'normal', reward: 'Обычный контейнер', claimed: false },
    { trophies: 60, type: 'container', level: 'mini', reward: 'Мини-контейнер', claimed: false },
    { trophies: 70, type: 'gems', amount: 10, reward: '10 гемов', claimed: false },
    { trophies: 80, type: 'container', level: 'normal', reward: 'Обычный контейнер', claimed: false },
    { trophies: 90, type: 'gems', amount: 15, reward: '15 гемов', claimed: false },
    { trophies: 100, type: 'container', level: 'super', reward: 'Супер-контейнер', claimed: false },
    { trophies: 125, type: 'tank', tank: 'ice', compensation: 100, reward: 'Ледяной танк', claimed: false },
    { trophies: 150, type: 'coins', amount: 400, reward: '400 монет', claimed: false },
    { trophies: 175, type: 'container', level: 'normal', reward: 'Обычный контейнер', claimed: false },
    { trophies: 200, type: 'gems', amount: 25, reward: '25 гемов', claimed: false },
    { trophies: 250, type: 'containers', level: 'normal', amount: 2, reward: '2 обычных контейнера', claimed: false },
    { trophies: 300, type: 'container', level: 'super', reward: 'Супер-контейнер', claimed: false },
    { trophies: 350, type: 'coins', amount: 600, reward: '600 монет', claimed: false },
    { trophies: 400, type: 'choice', options: ['machinegun', 'buckshot'], reward: 'Пулеметный или Дробовой на выбор', claimed: false },
    { trophies: 450, type: 'gems', amount: 40, reward: '40 гемов', claimed: false },
    { trophies: 500, type: 'container', level: 'omega', reward: 'Омега-контейнер', claimed: false },
    { trophies: 575, type: 'container', level: 'super', reward: 'Супер-контейнер', claimed: false },
    { trophies: 650, type: 'coins', amount: 800, reward: '800 монет', claimed: false },
    { trophies: 725, type: 'gems', amount: 50, reward: '50 гемов', claimed: false },

    // 🔴 Этап истины (800–1200)
    { trophies: 900, type: 'coins', amount: 1000, reward: '1000 монет', claimed: false },
    { trophies: 1000, type: 'container', level: 'omega', reward: 'Омега-контейнер', claimed: false },
    { trophies: 1100, type: 'container', level: 'super', reward: 'Супер-контейнер', claimed: false },
    { trophies: 1200, type: 'coins', amount: 1200, reward: '1200 монет', claimed: false },

    // ⚫ Этап легенд
    { trophies: 1350, type: 'gems', amount: 75, reward: '75 гемов', claimed: false },
    { trophies: 1500, type: 'choice', options: ['time', 'imitator'], reward: 'Временной или Имитатор на выбор', claimed: false },
    { trophies: 1650, type: 'coins', amount: 1000, reward: '1000 монет', claimed: false },
    { trophies: 1800, type: 'coins', amount: 3000, reward: '3000 монет', claimed: false }
];
// Unlocked tanks list
let unlockedTanks = JSON.parse(localStorage.getItem('tankUnlockedTanks')) || ['normal'];

// Initialize claimed rewards on game load
function initializeTrophySystem() {
    claimedRewards = JSON.parse(localStorage.getItem('tankClaimedRewards')) || [];
    checkTrophyRewards();
}

const tankGemPrices = {
    'normal': 0,
    'ice': 100,       // Редкий
    'machinegun': 100,// Редкий
    'buckshot': 100,  // Редкий
    'fire': 200,      // Сверхредкий
    'waterjet': 200,  // Сверхредкий
    'buratino': 300,  // Эпический
    'musical': 300,   // Эпический
    'toxic': 500,     // Легендарный
    'mirror': 500,    // Легендарный
    'illuminat': 750, // Мифический
    'plasma': 750,    // Мифический
    'time': 750,      // Хроматический
    'electric': 750,   // Электрический (Шаровая молния с цепочкой хит)
    'electric': 750   // Электрический (Шаровая молния с цепочкой хит)
};

// Функция для определения минимального уровня трофеев (последняя полученная награда)
function getMinimumTrophyLevel() {
    let maxClaimedLevel = 0;
    for (const rewardIndex of claimedRewards) {
        const reward = trophyRoadRewards[rewardIndex];
        if (reward && reward.trophies > maxClaimedLevel) {
            maxClaimedLevel = reward.trophies;
        }
    }
    return maxClaimedLevel;
}

// Функция для безопасного снятия трофеев (с защитой от опускания ниже полученных наград)
function loseTrophies(amount = 1) {
    const minLevel = getMinimumTrophyLevel();
    const newTrophyCount = Math.max(minLevel, trophies - amount);
    
    if (newTrophyCount < trophies) {
        trophies = newTrophyCount;
        saveProgress();
        console.log(`Трофеи снижены до ${trophies} (минимум: ${minLevel})`);
    }
}

// Mode-aware trophy loss: 3 for team, 5 for onevsall, 1 for single and duel
function loseModeTrophies() {
    if (currentMode === 'training') return;
    if (currentMode === 'team') {
        loseTrophies(3);
    } else if (currentMode === 'onevsall') {
        loseTrophies(5);
    } else {
        loseTrophies(1);
    }
}

function saveProgress() {
    localStorage.setItem('tankCoins', coins);
    localStorage.setItem('tankGems', gems);
    localStorage.setItem('tankTrophies', trophies);
    localStorage.setItem('tankClaimedRewards', JSON.stringify(claimedRewards));
    localStorage.setItem('tankUnlockedTanks', JSON.stringify(unlockedTanks));
}

// Camera follow flag — always on so player sees their tank
let cameraFollow = true;

// Тип танка игрока
let tankType = localStorage.getItem('tankSelected') || 'normal';

// Tank HP based on type
const tankMaxHpByType = {
    'normal': 300,
    'ice': 300,
    'fire': 600,
    'buratino': 350,
    'toxic': 250,
    'plasma': 300,
    'musical': 400,
    'illuminat': 300,
    'mirror': 400,
    'time': 200,
    'machinegun': 300,
    'buckshot': 350,
    'waterjet': 300,
    'imitator': 250,
    'electric': 400
};

function setTankHP(type) {
    const hp = tankMaxHpByType[type] || 300;
    tank.hp = hp;
    tank.maxHp = hp;
    return hp;
}

// Tank max speed by type
const tankMaxSpeedByType = {
    'normal': 3.2,
    'ice': 3.0,
    'fire': 2.5,
    'buratino': 2.8,
    'toxic': 3.5,
    'plasma': 3.2,
    'musical': 3.5,
    'illuminat': 3.0,
    'mirror': 3.0,
    'time': 3.7,
    'machinegun': 3.2,
    'buckshot': 2.7,
    'waterjet': 3.2,
    'imitator': 3.5,
    'electric': 2.6
};

function setTankSpeed(type) {
    const speed = tankMaxSpeedByType[type] || 3.2;
    tank.speed = speed;
    return speed;
}

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
    fireCooldown: 0,
    // Autopilot / ultimate ability flags
    isAutopilotActive: false,
    autoPilotTimer: 0,
    autoPilotCooldown: 0,
    // Ultimate (Electric): stop then nova
    isUltimateActive: false,
    ultimateTimer: 0,
    ultimateCooldown: 0
};

// Apply saved tank type properties
setTankHP(tankType);
setTankSpeed(tankType);

// Слушатели событий
window.onkeydown = (e) => {
    // Не регистрировать клавишу если зажаты модификаторы (Ctrl, Cmd) или если фокус на командном вводе
    if (e.ctrlKey || e.metaKey || document.activeElement === commandInput) {
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
    // Command input toggle with /
    if (e.code === 'Slash' && !e.shiftKey && gameState === 'menu') {
        e.preventDefault();
        const commandModal = document.getElementById('commandModal');
        if (commandModal) {
            commandModal.style.display = 'flex';
            commandInput.value = '/';
            commandInput.focus();
        }
    }
    // F5 to return to main menu
    if (e.code === 'F5') {
        e.preventDefault();
        gameState = 'menu';
        _lastMusicKey = ''; // force music switch on next updateMusic()
        if (mainMenu) mainMenu.style.display = 'flex';
    }
};
window.onkeyup = (e) => keys[e.code] = false;

// ========================
// SETTINGS
// ========================
window.effectsEnabled = localStorage.getItem('settingEffects') !== 'false';
window.deviceModeMobile = localStorage.getItem('settingMobile') === 'true';
// Read saved music volume. Use explicit null/isNaN checks so 0 is preserved.
{
    const sv = localStorage.getItem('settingMusicVolume');
    if (sv === null) {
        window.musicVolume = 0.5;
    } else {
        const v = parseFloat(sv);
        window.musicVolume = Number.isFinite(v) ? v : 0.5;
    }
}

(function initSettings() {
    const btn   = document.getElementById('settingsBtn');
    const cmdBtn = document.getElementById('cmdBtn');

    // Show/hide cmdBtn based on mobile mode setting
    function updateCmdBtnVisibility() {
        if (!cmdBtn) return;
        // Use setProperty with !important to override display:flex !important from .btn-settings class
        if (window.deviceModeMobile) {
            cmdBtn.style.setProperty('display', 'flex', 'important');
        } else {
            cmdBtn.style.setProperty('display', 'none', 'important');
        }
    }
    updateCmdBtnVisibility();

    // Open command modal on tap
    if (cmdBtn) {
        cmdBtn.addEventListener('click', () => {
            const commandModal = document.getElementById('commandModal');
            if (commandModal) {
                commandModal.style.display = 'flex';
                const ci = document.getElementById('commandInput');
                if (ci) { ci.value = '/'; ci.focus(); }
            }
        });
    }
    const modal = document.getElementById('settingsModal');
    const closeBtn = document.getElementById('settingsClose');
    const chkEffects = document.getElementById('settingEffects');
    const chkMobile  = document.getElementById('settingMobile');
    const chkMusicVolume = document.getElementById('settingMusicVolume');
    if (!btn || !modal) return;

    // Apply saved values
    chkEffects.checked = window.effectsEnabled;
    chkMobile.checked  = window.deviceModeMobile;
    chkMusicVolume.value = Math.round(window.musicVolume * 100);

    // Real-time volume change
    chkMusicVolume.addEventListener('input', () => {
        const vol = chkMusicVolume.value / 100;
        menuMusic.volume = vol;
        fightMusic.volume = vol;
        duelMusic.volume = vol;
        exfightMusic.volume = vol;
        teamMusic.volume = vol;
        tankMusic.volume = vol;
    });

    btn.addEventListener('click', () => { modal.style.display = 'flex'; });
    closeBtn.addEventListener('click', () => {
        window.effectsEnabled   = chkEffects.checked;
        window.deviceModeMobile = chkMobile.checked;
        window.musicVolume = chkMusicVolume.value / 100;
        localStorage.setItem('settingEffects', chkEffects.checked);
        localStorage.setItem('settingMobile',  chkMobile.checked);
        localStorage.setItem('settingMusicVolume', window.musicVolume);
        menuMusic.volume = window.musicVolume;
        fightMusic.volume = window.musicVolume;
        duelMusic.volume = window.musicVolume;
        exfightMusic.volume = window.musicVolume;
        teamMusic.volume = window.musicVolume;
        tankMusic.volume = window.musicVolume;
        updateCmdBtnVisibility();
        modal.style.display = 'none';
    });
})();

// Apply initial music volume
menuMusic.volume = window.musicVolume;
fightMusic.volume = window.musicVolume;
exfightMusic.volume = window.musicVolume;

// Music management
let _lastMusicKey = '';

function _getTargetMusicKey() {
    if (gameState === 'menu') return 'menu';
    if (gameState === 'playing') {
        if (currentMode === 'trial') return 'exfight';
        if (currentMode === 'onevsall') return 'fight';
        if (currentMode === 'duel') return 'duel';
        if (currentMode === 'team') return 'team';
        if (currentMode === 'single') return 'tank';
    }
    return 'none';
}

function _getMusicTrack(key) {
    if (key === 'menu') return menuMusic;
    if (key === 'fight') return fightMusic;
    if (key === 'duel') return duelMusic;
    if (key === 'team') return teamMusic;
    if (key === 'tank') return tankMusic;
    if (key === 'exfight') return exfightMusic;
    return null;
}

function updateMusic() {
    const vol = window.musicVolume;
    const targetKey = (vol > 0) ? _getTargetMusicKey() : 'none';
    const track = _getMusicTrack(targetKey);

    // If music key changed — stop everything and switch
    if (targetKey !== _lastMusicKey) {
        _lastMusicKey = targetKey;
        menuMusic.pause();
        fightMusic.pause();
        duelMusic.pause();
        teamMusic.pause();
        tankMusic.pause();
        exfightMusic.pause();
        if (track) {
            track.volume = vol;
            track.play().catch(() => {});
        }
        return;
    }

    // Same key: if the track should be playing but got paused (e.g. autoplay blocked, then user clicked)
    if (track && track.paused) {
        track.volume = vol;
        track.play().catch(() => {});
    }
}

// ========================
// MOBILE CONTROLS
// ========================
(function() {
    const JOYSTICK_RADIUS = 60;
    const ATTACK_RADIUS   = 55;
    const DEAD_ZONE = 10;

    let joystickTouchId = null;
    let joystickBaseX = 0, joystickBaseY = 0;
    let attackTouchId = null;
    let attackBaseX = 0, attackBaseY = 0;

    const mobileControls = document.getElementById('mobileControls');
    const joystickZone   = document.getElementById('joystickZone');
    const joystickBase   = document.getElementById('joystickBase');
    const joystickKnob   = document.getElementById('joystickKnob');
    const attackZone     = document.getElementById('attackZone');
    const attackBase     = document.getElementById('attackBase');
    const attackKnob     = document.getElementById('attackKnob');

    // Use manual setting if set, otherwise auto-detect
    let IS_MOBILE = typeof window.deviceModeMobile !== 'undefined'
        ? window.deviceModeMobile
        : (navigator.maxTouchPoints > 0 || ('ontouchstart' in window));
    // Re-read from settings each interval tick so toggling takes effect live
    window.addEventListener('touchstart', () => {}, { once: true, passive: true });

    // ---- Move joystick ----
    function clearMoveKeys() {
        keys['KeyW'] = false; keys['KeyS'] = false;
        keys['KeyA'] = false; keys['KeyD'] = false;
    }

    function applyJoystickVector(dx, dy) {
        const mag = Math.sqrt(dx*dx + dy*dy);
        if (mag < DEAD_ZONE) { clearMoveKeys(); return; }
        const nx = dx / mag, ny = dy / mag;
        keys['KeyW'] = ny < -0.3;
        keys['KeyS'] = ny >  0.3;
        keys['KeyA'] = nx < -0.3;
        keys['KeyD'] = nx >  0.3;
    }

    function moveKnob(knob, base, radius, dx, dy) {
        const mag = Math.sqrt(dx*dx + dy*dy);
        const r   = Math.min(mag, radius);
        const ratio = mag > 0 ? r / mag : 0;
        const cx = dx * ratio, cy = dy * ratio;
        const half = base.offsetWidth / 2;
        const kh   = knob.offsetWidth  / 2;
        knob.style.left = (half + cx - kh) + 'px';
        knob.style.top  = (half + cy - kh) + 'px';
    }

    function resetKnob(knob) {
        knob.style.left = '';
        knob.style.top  = '';
    }

    function getCenter(el) {
        const r = el.getBoundingClientRect();
        return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
    }

    joystickZone.addEventListener('touchstart', (e) => {
        e.preventDefault();
        if (joystickTouchId !== null) return;
        const t = e.changedTouches[0];
        joystickTouchId = t.identifier;
        const c = getCenter(joystickBase);
        joystickBaseX = c.x; joystickBaseY = c.y;
    }, { passive: false });

    joystickZone.addEventListener('touchmove', (e) => {
        e.preventDefault();
        for (const t of e.changedTouches) {
            if (t.identifier !== joystickTouchId) continue;
            const dx = t.clientX - joystickBaseX;
            const dy = t.clientY - joystickBaseY;
            moveKnob(joystickKnob, joystickBase, JOYSTICK_RADIUS, dx, dy);
            applyJoystickVector(dx, dy);
        }
    }, { passive: false });

    function endJoystick(e) {
        e.preventDefault && e.preventDefault();
        for (const t of (e.changedTouches || [])) {
            if (t.identifier !== joystickTouchId) continue;
            joystickTouchId = null;
            resetKnob(joystickKnob);
            clearMoveKeys();
        }
    }
    joystickZone.addEventListener('touchend',    endJoystick, { passive: false });
    joystickZone.addEventListener('touchcancel', () => { joystickTouchId = null; resetKnob(joystickKnob); clearMoveKeys(); });

    // ---- Attack joystick mode: 'attack' | 'ult' ----
    // Quick tap (<200ms, no drag) toggles between attack and ult mode (if tank has ult)
    const TANKS_WITH_ULT = ['toxic', 'plasma', 'illuminat', 'mirror', 'time', 'imitator', 'electric'];
    let attackMode = 'attack';
    let attackTapStartTime = 0;
    let attackTapStartX = 0, attackTapStartY = 0;
    let attackMoved = false;
    const attackLabel = document.getElementById('attackLabel');

    function setAttackMode(mode) {
        attackMode = mode;
        if (mode === 'ult') {
            attackBase.style.background    = 'rgba(243,156,18,0.18)';
            attackBase.style.borderColor   = 'rgba(243,200,50,0.55)';
            attackBase.style.boxShadow     = '0 0 22px rgba(243,156,18,0.45)';
            attackKnob.style.background    = 'radial-gradient(circle at 35% 35%, #ffe060, #d35400)';
            attackKnob.style.border        = '2px solid rgba(255,220,80,0.8)';
            attackKnob.style.boxShadow     = '0 3px 8px rgba(0,0,0,0.6), 0 0 14px rgba(243,156,18,0.65)';
            attackKnob.textContent         = '⚡';
            attackKnob.style.fontSize      = '20px';
            attackKnob.style.color         = '#fff';
            if (attackLabel) { attackLabel.textContent = 'УЛТ'; attackLabel.style.color = 'rgba(243,190,50,0.75)'; }
        } else {
            attackBase.style.background    = '';
            attackBase.style.borderColor   = '';
            attackBase.style.boxShadow     = '';
            attackKnob.style.background    = '';
            attackKnob.style.border        = '';
            attackKnob.style.boxShadow     = '';
            attackKnob.textContent         = '';
            attackKnob.style.fontSize      = '';
            attackKnob.style.color         = '';
            if (attackLabel) { attackLabel.textContent = 'АТАКА'; attackLabel.style.color = ''; }
        }
    }

    attackZone.addEventListener('touchstart', (e) => {
        e.preventDefault();
        if (typeof gameState !== 'undefined' && gameState !== 'playing') return;
        if (attackTouchId !== null) return;
        const t = e.changedTouches[0];
        attackTouchId     = t.identifier;
        attackTapStartTime = Date.now();
        attackTapStartX   = t.clientX;
        attackTapStartY   = t.clientY;
        attackMoved       = false;
        const c = getCenter(attackBase);
        attackBaseX = c.x; attackBaseY = c.y;
        attackBase.style.borderColor = attackMode === 'ult'
            ? 'rgba(255,220,60,0.85)'
            : 'rgba(255,200,0,0.8)';
    }, { passive: false });

    attackZone.addEventListener('touchmove', (e) => {
        e.preventDefault();
        for (const t of e.changedTouches) {
            if (t.identifier !== attackTouchId) continue;
            const dx = t.clientX - attackBaseX;
            const dy = t.clientY - attackBaseY;
            const mag = Math.sqrt(dx*dx + dy*dy);
            if (mag >= DEAD_ZONE) {
                attackMoved = true;
                tank.turretAngle = Math.atan2(dy, dx);
                if (attackMode === 'ult') {
                    // Только прицеливание, ульта стреляет при отпускании
                    keys['Space'] = false;
                    keys['KeyE']  = false;
                } else {
                    keys['Space']  = true;
                    keys['KeyE']   = false;
                }
            } else {
                keys['Space'] = false;
                keys['KeyE']  = false;
            }
            moveKnob(attackKnob, attackBase, ATTACK_RADIUS, dx, dy);
        }
    }, { passive: false });

    function endAttack(e) {
        e.preventDefault && e.preventDefault();
        for (const t of (e.changedTouches || [])) {
            if (t.identifier !== attackTouchId) continue;
            attackTouchId = null;
            // Quick tap — toggle attack / ult mode (only for tanks with ult)
            const tapDuration = Date.now() - attackTapStartTime;
            const ddx = t.clientX - attackTapStartX;
            const ddy = t.clientY - attackTapStartY;
            if (!attackMoved && tapDuration < 250 && Math.sqrt(ddx*ddx + ddy*ddy) < 18) {
                const tt = typeof tankType !== 'undefined' ? tankType : '';
                if (TANKS_WITH_ULT.includes(tt)) {
                    setAttackMode(attackMode === 'attack' ? 'ult' : 'attack');
                }
            }
            resetKnob(attackKnob);
            keys['Space'] = false;
            keys['KeyE']  = false;
            // Если был тащить в режиме УЛТ — выстрел ульты при отпускании
            if (attackMoved && attackMode === 'ult') {
                keys['KeyE'] = true;
                setTimeout(() => { keys['KeyE'] = false; }, 80);
            }
            // Restore border to mode-appropriate idle colour
            attackBase.style.borderColor = attackMode === 'ult' ? 'rgba(243,200,50,0.55)' : '';
        }
    }
    attackZone.addEventListener('touchend',    endAttack, { passive: false });
    attackZone.addEventListener('touchcancel', () => {
        attackTouchId = null;
        resetKnob(attackKnob);
        keys['Space'] = false;
        keys['KeyE']  = false;
        attackBase.style.borderColor = attackMode === 'ult' ? 'rgba(243,200,50,0.55)' : '';
    });

    // ---- Show/hide: only on mobile, only when playing ----
    setInterval(() => {
        if (!mobileControls) return;
        const isMob = window.deviceModeMobile;
        const playing = typeof gameState !== 'undefined' && gameState === 'playing';
        mobileControls.style.display = (isMob && playing) ? 'block' : 'none';
        // Reset to attack mode if game not playing (e.g. back in menu)
        if (!playing && attackMode !== 'attack') setAttackMode('attack');
        // If current tank has no ult and we're in ult mode — reset
        const tt = typeof tankType !== 'undefined' ? tankType : '';
        if (playing && attackMode === 'ult' && !TANKS_WITH_ULT.includes(tt)) setAttackMode('attack');
    }, 80);
})();

window.addEventListener('wheel', (e) => {
    tank.turretAngle += e.deltaY * 0.0015;
});

// Command input handling
if (commandInput) {
    commandInput.addEventListener('keydown', (e) => {
        if (e.code === 'Enter') {
            const command = commandInput.value.trim();
            if (command.startsWith('/coins ')) {
                const amount = parseInt(command.substring(7));
                if (!isNaN(amount) && amount > 0) {
                    coins += amount;
                    updateCoinDisplay();
                    localStorage.setItem('tankCoins', coins);
                    console.log(`Added ${amount} coins. Total: ${coins}`);
                }
            }
            commandInput.value = '';
            commandInput.style.display = 'none';
            commandInput.blur();
        } else if (e.code === 'Escape') {
            commandInput.value = '';
            commandInput.style.display = 'none';
            commandInput.blur();
        }
    });
}

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
const musicalTankPreview = document.getElementById('musicalTankPreview');
const musicalTankCtx = musicalTankPreview && musicalTankPreview.getContext ? musicalTankPreview.getContext('2d') : null;
const illuminatTankPreview = document.getElementById('illuminatTankPreview');
const illuminatTankCtx = illuminatTankPreview && illuminatTankPreview.getContext ? illuminatTankPreview.getContext('2d') : null;
const mirrorTankPreview = document.getElementById('mirrorTankPreview');
const mirrorTankCtx = mirrorTankPreview && mirrorTankPreview.getContext ? mirrorTankPreview.getContext('2d') : null;
const timeTankPreview = document.getElementById('timeTankPreview');
const timeTankCtx = timeTankPreview && timeTankPreview.getContext ? timeTankPreview.getContext('2d') : null;
const machinegunTankPreview = document.getElementById('machinegunTankPreview');
const machinegunTankCtx = machinegunTankPreview && machinegunTankPreview.getContext ? machinegunTankPreview.getContext('2d') : null;
const buckshotTankPreview = document.getElementById('buckshotTankPreview');
const buckshotTankCtx = buckshotTankPreview && buckshotTankPreview.getContext ? buckshotTankPreview.getContext('2d') : null;
const waterjetTankPreview = document.getElementById('waterjetTankPreview');
const waterjetTankCtx = waterjetTankPreview && waterjetTankPreview.getContext ? waterjetTankPreview.getContext('2d') : null;
const imitatorTankPreview = document.getElementById('imitatorTankPreview');
const imitatorTankCtx = imitatorTankPreview && imitatorTankPreview.getContext ? imitatorTankPreview.getContext('2d') : null;
const electricTankPreview = document.getElementById('electricTankPreview');
const electricTankCtx = electricTankPreview && electricTankPreview.getContext ? electricTankPreview.getContext('2d') : null;

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
const modeOneVsAll = document.getElementById('modeOneVsAll');

function startGame(mode) {
    // If imitator player died while transformed, restore the real tank type before any reset
    if (tank.imitatorActive && tank.originalTankType) {
        tankType = tank.originalTankType;
    } else if (tank.imitatorActive) {
        tankType = 'imitator';
    }
    // reset basic state
    tank.turretAngle = 0; setTankHP(tankType); setTankSpeed(tankType); tank.artilleryMode = false; tank.artilleryTimer = 0; enemies = []; bullets = []; particles = []; objects = []; electricRays = []; novaZones = [];
    
    // Reset all effects
    tank.paralyzed = false;
    tank.paralyzedTime = 0;
    tank.frozenEffect = 0;
    tank.confused = 0;
    tank.mirrorShieldActive = false;
    tank.mirrorShieldTimer = 0;
    tank.lastHitType = null;
    tank.lastHitTime = 0;
    tank.alive = true;
    
    // Reset illuminat beam effects
    tank.beamActive = false;
    tank.beamStart = 0;
    tank.beamCooldown = 0;
    tank.beamAngle = 0;
    tank.inversionUsed = 0;
    // Reset waterjet
    tank.waterjetActive = false;
    tank.waterjetBeamLen = 0;
    
    // Reset toxic gas ability
    tank.megaGasUsed = false;
    
    // Reset plasma blast ability
    tank.plasmaBlastUsed = 0;
    
    // Reset imitator transformation ability
    tank.imitatorActive = false;
    tank.imitatorTimer = 0;
    tank.imitatorCooldown = 0;
    tank.originalTankType = null;
    tank.originalMaxHp = 250;
    
    // Reset poison and control effects
    tank.poisonTimer = 0;
    tank.invertedControls = 0;
    tank.disoriented = 0;
    
    // Reset ultimate ability (electric tank)
    tank.isUltimateActive = false;
    tank.ultimateTimer = 0;
    tank.ultimateCooldown = 0;
    
    navNeedsRebuild = true;
    lastResultState = null;
    syncResultOverlay('playing');

    if (mode === 'single') {
        // normal world
        worldWidth = 900; worldHeight = 700;
        canvas.width = DISPLAY_W; canvas.height = DISPLAY_H;
        tank.x = 50; tank.y = 50;
        generateMap();
        cameraFollow = true;
    } else if (mode === 'team') {
        // larger world map
        worldWidth = 1400; worldHeight = 1000;
        canvas.width = DISPLAY_W; canvas.height = DISPLAY_H;
        tank.x = 60; tank.y = 60;
        generateMap();
        spawnTeamMode();
        cameraFollow = true;
    } else if (mode === 'duel') {
        // Duel mode (1vs1, shrinking map)
        worldWidth = 900 * 2; worldHeight = 700 * 2;
        canvas.width = DISPLAY_W; canvas.height = DISPLAY_H;
        tank.x = 100; tank.y = 100;
        tank.team = 0;
        
        // Initialize duel state (Rectangular / Grid-based shrinking)
        // navCell = 25. Let's align to grid.
        // Bounds in pixels
        duelState = {
            // Initial safe zone (full map)
            minX: 0,
            minY: 0,
            maxX: worldWidth,
            maxY: worldHeight,
            
            // Shrink config
            // User requested: "Shrinks gradually by cells"
            // Let's make it shrink every 2 seconds by 1 cell
            shrinkTimer: 0,
            shrinkInterval: 120, // frames (2 seconds per step)
            stepSize: 25, // 1 cell size
            minSize: 300 // Don't shrink to 0, leave a small arena
        };
        
        generateMap();
        spawnDuelMode();
        cameraFollow = true;
    } else if (mode === 'trial') {
        // Trial mode: FFA 1+7 bots, no rewards
        worldWidth = 1400; worldHeight = 1000;
        canvas.width = DISPLAY_W; canvas.height = DISPLAY_H;
        generateMap();
        spawnTrialMode();
        cameraFollow = true;
    } else if (mode === 'training') {
        // Training mode: open map, dummy targets that respawn every 10s
        worldWidth = 1200; worldHeight = 900;
        canvas.width = DISPLAY_W; canvas.height = DISPLAY_H;
        generateTrainingMap();
        spawnTrainingMode();
        cameraFollow = true;
        // Show exit button
        const trainingExitBtn = document.getElementById('trainingExitBtn');
        if (trainingExitBtn) trainingExitBtn.style.display = 'block';
    } else if (mode === 'onevsall') {
        // One vs All: 4x map, player vs 7 allied enemy bots
        worldWidth = 900 * 4; worldHeight = 700 * 4;
        canvas.width = DISPLAY_W; canvas.height = DISPLAY_H;
        tank.team = 0;
        setTankHP(tankType);
        tank.alive = true; tank.respawnTimer = 0; tank.respawnCount = 0;
        generateMap();
        spawnOneVsAllMode();
        cameraFollow = true;
    }
    
    // set current mode for runtime logic
    currentMode = mode;
    if (mode !== 'duel') duelState = null;

    if (modeModal) modeModal.style.display = 'none';
    if (mainMenu) mainMenu.style.display = 'none';
    gameState = 'playing';
    // Hide training exit button (unless training mode)
    const trainingExitBtn = document.getElementById('trainingExitBtn');
    if (trainingExitBtn && mode !== 'training') trainingExitBtn.style.display = 'none';
    
    // Initialize battle metrics
    gameStartTime = Date.now();
    playerDamageTaken = 0;
    playerMaxHpAtStart = tank.hp;
    battleEnemyCount = enemies.length;
    
    _lastMusicKey = ''; // force music switch on next updateMusic()
    navNeedsRebuild = true;
    try { if (typeof draw === 'function') draw(); } catch (e) { /* ignore */ }
}

                // very large world (6x single)
                worldWidth = 900 * 6; worldHeight = 700 * 6;
                // keep display canvas small for performance
                canvas.width = DISPLAY_W; canvas.height = DISPLAY_H;
if (modeTeam) modeTeam.addEventListener('click', () => startGame('team'));
if (modeSingle) modeSingle.addEventListener('click', () => startGame('single'));
if (modeOneVsAll) modeOneVsAll.addEventListener('click', () => startGame('onevsall'));

if (modeCancel) modeCancel.addEventListener('click', () => { if (modeModal) modeModal.style.display = 'none'; });

// Shop button handler
const shopModal = document.getElementById('shopModal');
const characterModal = document.getElementById('characterModal');
const shopBtn = document.getElementById('shopBtn');
const characterBtn = document.getElementById('characterBtn');
const buyMiniContainer = document.getElementById('buyMiniContainer');
const buyContainer = document.getElementById('buyContainer');
const buySuperContainer = document.getElementById('buySuperContainer');
const buyOmegaContainer = document.getElementById('buyOmegaContainer');
const shopCancel = document.getElementById('shopCancel');
const characterCancel = document.getElementById('characterCancel');
const trophyRoadBtn = document.getElementById('trophyRoadBtn');
const trophyRoadModal = document.getElementById('trophyRoadModal');
const closeTrophyRoad = document.getElementById('closeTrophyRoad');
if (shopBtn) shopBtn.addEventListener('click', () => { if (shopModal) shopModal.style.display = 'flex'; });
if (characterBtn) characterBtn.addEventListener('click', () => { if (characterModal) { characterModal.style.display = 'flex'; drawCharacterPreviews(); } });
if (trophyRoadBtn) trophyRoadBtn.addEventListener('click', () => { if (trophyRoadModal) { trophyRoadModal.style.display = 'flex'; generateTrophyRoad(); } });
if (shopCancel) shopCancel.addEventListener('click', () => { if (shopModal) shopModal.style.display = 'none'; });
if (characterCancel) characterCancel.addEventListener('click', () => { if (characterModal) characterModal.style.display = 'none'; });
if (closeTrophyRoad) closeTrophyRoad.addEventListener('click', () => { if (trophyRoadModal) trophyRoadModal.style.display = 'none'; });

// Command modal handlers
const commandModal = document.getElementById('commandModal');
const commandExecute = document.getElementById('commandExecute');
const commandCancel = document.getElementById('commandCancel');
if (commandExecute) commandExecute.addEventListener('click', () => {
    processDevCommand(commandInput.value);
    commandInput.value = '';
    if (commandModal) commandModal.style.display = 'none';
});

// Duel mode handler
const modeDuel = document.getElementById('modeDuel');
if (modeDuel) modeDuel.addEventListener('click', () => startGame('duel'));

function processDevCommand(rawCommand) {
    const command = rawCommand.trim();
    if (!command) return;

    if (command.startsWith('/coins')) {
        const parts = command.substring(6).trim().split(/\s+/);
        let op = '+'; 
        let valStr = parts[0];
        
        if (['+', '-', '='].includes(parts[0])) {
            op = parts[0];
            valStr = parts[1];
        }
        
        const amount = parseInt(valStr);
        if (!isNaN(amount) && amount >= 0) {
            if (op === '+') coins += amount;
            else if (op === '-') coins = Math.max(0, coins - amount);
            else if (op === '=') coins = amount;
            
            updateCoinDisplay();
            saveProgress();
            console.log(`Coins updated: ${coins}`);
        }
    } else if (command.startsWith('/gems')) {
        const parts = command.substring(5).trim().split(/\s+/);
        let op = '+'; 
        let valStr = parts[0];
        
        if (['+', '-', '='].includes(parts[0])) {
            op = parts[0];
            valStr = parts[1];
        }
        
        const amount = parseInt(valStr);
        if (!isNaN(amount) && amount >= 0) {
            if (op === '+') gems += amount;
            else if (op === '-') gems = Math.max(0, gems - amount);
            else if (op === '=') gems = amount;
            
            updateCoinDisplay();
            saveProgress();
            console.log(`Gems updated: ${gems}`);
        }
    } else if (command.startsWith('/trophy')) {
        const parts = command.substring(7).trim().split(/\s+/);
        let op = '='; 
        let valStr = parts[0];
        
        if (['+', '-', '='].includes(parts[0])) {
            op = parts[0];
            valStr = parts[1];
        }
        
        const amount = parseInt(valStr);
        if (!isNaN(amount) && amount >= 0) {
            if (op === '+') trophies += amount;
            else if (op === '-') trophies = Math.max(0, trophies - amount);
            else if (op === '=') {
                trophies = amount;
                // Reset claimed rewards when setting trophies
                claimedRewards = [];
                console.log('Trophy rewards reset!');
            }
            
            updateCoinDisplay();
            saveProgress();
            console.log(`Trophies updated: ${trophies}`);
            
            // Refresh trophy road if it's open
            if (trophyRoadModal && trophyRoadModal.style.display === 'flex') {
                generateTrophyRoad();
            }
        }
    } else if (command === '/clear t') {
        unlockedTanks = ['normal'];
        saveProgress();
        // Force switch to normal tank
        if (typeof window.setSelectedTank === 'function') window.setSelectedTank('normal');
        console.log('All tanks except normal are locked.');
        // Update UI if character modal is open
        if (typeof drawCharacterPreviews === 'function' && characterModal && characterModal.style.display === 'flex') {
            drawCharacterPreviews();
        }
    } else if (command === '/help' || command === '/commands') {
        console.log('=== ДОСТУПНЫЕ КОМАНДЫ ===');
        console.log('/coins [+/-/=] [число] - управление монетами (по умолчанию +)');
        console.log('/gems [+/-/=] [число] - управление гемами (по умолчанию +)');
        console.log('/trophy [+/-/=] [число] - управление трофеями, = сбрасывает награды');
        console.log('/clear t - сбросить все танки кроме обычного');
        console.log('/help или /commands - показать этот список');
        console.log('========================');
    }
}

if (commandCancel) commandCancel.addEventListener('click', () => { commandInput.value = ''; if (commandModal) commandModal.style.display = 'none'; });
if (commandModal) {
    commandModal.addEventListener('click', (e) => {
        if (e.target === commandModal) {
            commandInput.value = '';
            commandModal.style.display = 'none';
        }
    });
}
if (commandInput) {
    commandInput.addEventListener('keydown', (e) => {
        if (e.code === 'Enter') {
            processDevCommand(commandInput.value);
            commandInput.value = '';
            if (commandModal) commandModal.style.display = 'none';
        } else if (e.code === 'Escape') {
            commandInput.value = '';
            if (commandModal) commandModal.style.display = 'none';
        }
    });
}



// Win/lose overlay moved to src/win-lose.js
// See src/win-lose.js for the result UI, messages and helper

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

if (buyMiniContainer) buyMiniContainer.addEventListener('click', () => showContainerFlow('mini'));
if (buyContainer) buyContainer.addEventListener('click', () => showContainerFlow('bronze'));
if (buySuperContainer) buySuperContainer.addEventListener('click', () => showContainerFlow('legendary'));
if (buyOmegaContainer) buyOmegaContainer.addEventListener('click', () => showContainerFlow('omega'));

const containerFlowModal = document.getElementById('containerFlowModal');
const containerFlowPreview = document.getElementById('containerFlowPreview');
const containerFlowText = document.getElementById('containerFlowText');
const containerDropArea = document.getElementById('containerDropArea');
const containerFlowCancel = document.getElementById('containerFlowCancel');

let containerFlowType = null;
let containerDropTimers = [];
let containerDropActive = false;
let containerQueue = []; // Queue for multiple containers
let isFromTrophyRoad = false; // Track if container is from trophy road

// Process next container in queue
function processNextContainer() {
    if (containerQueue.length > 0) {
        const nextType = containerQueue.shift();
        setTimeout(() => {
            showFreeContainerFlow(nextType);
        }, 500); // Small delay for better UX
    }
}

function clearContainerDropTimers() {
    containerDropTimers.forEach((id) => clearTimeout(id));
    containerDropTimers = [];
    containerDropActive = false;
    if (containerDropArea) containerDropArea.classList.remove('active');
}

function closeContainerFlow() {
    if (containerFlowModal) containerFlowModal.style.display = 'none';
    clearContainerDropTimers();
    if (containerDropArea) containerDropArea.innerHTML = '';
    const hintEl = document.querySelector('.container-flow-hint');
    if (hintEl) hintEl.style.display = '';
    containerFlowType = null;
    // Don't reset isFromTrophyRoad here - it will be reset after rewards are shown
}

function updateContainerFlowStage(stage) {
    if (!containerFlowType || !containerFlowText || !containerFlowPreview) return;
    const isBronze = containerFlowType === 'bronze';
    const isOmega = containerFlowType === 'omega';
    const isMini = containerFlowType === 'mini';
    
    // Toggle Cancel button visibility based on stage
    if (containerFlowCancel) {
        // If stage is intro, show cancel. If open/animating, hide it.
        containerFlowCancel.style.display = (stage === 'intro') ? '' : 'none';
        containerFlowCancel.disabled = (stage !== 'intro');
    }

    // No filter needed as we have specific images
    containerFlowPreview.style.filter = '';

    if (stage === 'intro') {
        if (isOmega) {
            containerFlowPreview.src = 'cont-png/omega-cont.png';
            containerFlowText.textContent = 'Нажми на ОМЕГА контейнер!';
        } else if (isMini) {
            containerFlowPreview.src = 'cont-png/mini-cont.png';
            containerFlowText.textContent = 'Нажми на мини контейнер!';
        } else {
            containerFlowPreview.src = isBronze ? 'cont-png/cont1.png' : 'cont-png/super-cont.png';
            containerFlowText.textContent = isBronze
                ? 'Нажми на контейнер, чтобы открыть'
                : 'Нажми на контейнер, чтобы открыть';
        }
    } else {
        if (isOmega) {
            containerFlowPreview.src = 'cont-png/omega-cont2.png';
            containerFlowText.textContent = 'ОМЕГА контейнер взрывается наградами!';
        } else if (isMini) {
            containerFlowPreview.src = 'cont-png/mini-cont2.png';
            containerFlowText.textContent = 'Мини контейнер раскрывается!';
        } else {
            containerFlowPreview.src = isBronze ? 'cont-png/cont2.png' : 'cont-png/super-cont2.png';
            containerFlowText.textContent = isBronze
                ? 'Из контейнера высыпаются награды!'
                : 'Легендарный контейнер раскрывается!';
        }
    }
}

function animateContainerDrops(rewards, done) {
    if (!containerDropArea) {
        done();
        return;
    }
    clearContainerDropTimers();
    containerDropActive = true;
    containerDropArea.innerHTML = '';
    containerDropArea.classList.add('active');
    
    // Hide hint during animation
    const hintEl = document.querySelector('.container-flow-hint');
    if (hintEl) hintEl.style.display = 'none';
    
    const dropCount = Math.max(rewards.length, 1);
    const intervalMs = 360;
    let dropped = 0;

    const spawn = () => {
        if (!containerDropActive) return;
        if (dropped >= dropCount) {
            const finishTimer = setTimeout(() => {
                if (!containerDropActive) return;
                containerDropActive = false;
                containerDropArea.classList.remove('active');
                if (hintEl) hintEl.style.display = '';
                done();
            }, 900);
            containerDropTimers.push(finishTimer);
            return;
        }
        const reward = rewards[dropped] || {};
        const item = document.createElement('div');
        item.className = 'container-drop-item';
        // Use emoji for resource icons (fallback to reward.icon if provided)
        const iconText = reward.icon || (reward.type === 'gems' ? '💎' : reward.type === 'tank' ? '🏆' : '💰');
        item.textContent = iconText;
        const label = reward.type === 'tank'
            ? (reward.tankType ? reward.tankType.toUpperCase() : 'TANK')
            : reward.amount ? '+' + reward.amount : '';
        if (label) item.setAttribute('data-label', label);
        if (reward.desc) item.title = reward.desc;
        containerDropArea.appendChild(item);
        requestAnimationFrame(() => item.classList.add('visible'));
        dropped += 1;
        const nextTimer = setTimeout(spawn, intervalMs);
        containerDropTimers.push(nextTimer);
    };

    spawn();
}

function showContainerFlow(type) {
    if (containerFlowType) return;
    const price = type === 'bronze' ? 100 : (type === 'mini' ? 25 : (type === 'omega' ? 4000 : 1000));
    if (coins < price) {
        alert('Недостаточно монет!');
        return;
    }
    containerFlowType = type;
    updateContainerFlowStage('intro');
    if (containerDropArea) {
        containerDropArea.innerHTML = '';
        containerDropArea.classList.remove('active');
    }
    if (containerFlowModal) containerFlowModal.style.display = 'flex';
}

// Free version for trophy road rewards
function showFreeContainerFlow(type) {
    if (containerFlowType) {
        // If busy, add to queue
        containerQueue.push(type);
        return;
    }
    isFromTrophyRoad = true;
    containerFlowType = type;
    updateContainerFlowStage('intro');
    if (containerDropArea) {
        containerDropArea.innerHTML = '';
        containerDropArea.classList.remove('active');
    }
    if (containerFlowModal) containerFlowModal.style.display = 'flex';
}

// Free container confirm handler
function handleFreeContainerConfirm() {
    if (!containerFlowType || containerDropActive) return;
    const currentType = containerFlowType;
    const dropCount = currentType === 'bronze' ? 3 : (currentType === 'omega' ? 7 : (currentType === 'mini' ? 2 : 5));
    const rewards = [];
    // Generate rewards without payment
    for (let i = 0; i < dropCount; i++) {
        let reward;
        if (currentType === 'omega') {
            reward = openOmegaContainer({ suppressRewardModal: true });
        } else if (currentType === 'bronze') {
            reward = openContainer({ suppressRewardModal: true });
        } else if (currentType === 'mini') {
            reward = openMiniContainer({ suppressRewardModal: true });
        } else {
            reward = openSuperContainer({ suppressRewardModal: true });
        }
        rewards.push(reward);
    }
    updateContainerFlowStage('open');
    animateContainerDrops(rewards, () => {
        closeContainerFlow();
        updateCoinDisplay();
        showContainerRewards(rewards);
    });
}

function showContainerRewards(rewards, index = 0) {
    if (!rewards || index >= rewards.length) {
        // All rewards shown
        return;
    }
    
    const reward = rewards[index];
    if (!reward) {
        showContainerRewards(rewards, index + 1);
        return;
    }
    
    const modal = document.getElementById('rewardModal');
    const btn = document.getElementById('rewardClaimBtn');
    
    if (!modal || !btn) return;
    
    // Show current reward
    const isLast = index === rewards.length - 1;
    if (reward.type === 'tank') {
        showReward(reward.type, 1, reward.desc || '', reward.tankType);
    } else {
        showReward(reward.type, reward.amount, reward.desc || '');
    }

    // Update button text to indicate progress if multiple rewards
    if (rewards.length > 1) {
        btn.textContent = isLast ? 'FINISH' : `NEXT REWARD (${index + 1}/${rewards.length})`;
    } else {
        btn.textContent = 'CLAIM';
    }
    
    // Override button to show next reward
    const nextHandler = (e) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        
        // Prevent double clicks
        btn.onclick = null;
        
        if (isLast) {
            // Close if it's the last one
            modal.classList.remove('visible');
            setTimeout(() => {
                modal.style.display = 'none';
                // If this was from trophy road, process next container in queue
                if (isFromTrophyRoad) {
                    isFromTrophyRoad = false; // Reset the flag
                    processNextContainer();
                }
            }, 300);
        } else {
            // Instantly show next reward without closing modal
            showContainerRewards(rewards, index + 1);
        }
    };

    btn.onclick = nextHandler;
}

function handleContainerConfirm() {
    if (!containerFlowType || containerDropActive) return;
    const currentType = containerFlowType;
    const price = currentType === 'bronze' ? 100 : (currentType === 'mini' ? 25 : (currentType === 'omega' ? 4000 : 1000));
    if (coins < price) {
        alert('Недостаточно монет!');
        closeContainerFlow();
        return;
    }
    coins -= price;
    updateCoinDisplay();
    const dropCount = currentType === 'bronze' ? 3 : (currentType === 'omega' ? 7 : (currentType === 'mini' ? 2 : 5));
    const rewards = [];
    // Ensure we create unique objects for each reward
    for (let i = 0; i < dropCount; i++) {
        let reward;
        if (currentType === 'omega') {
            reward = openOmegaContainer({ suppressRewardModal: true });
        } else if (currentType === 'bronze') {
            reward = openContainer({ suppressRewardModal: true });
        } else if (currentType === 'mini') {
            reward = openMiniContainer({ suppressRewardModal: true });
        } else {
            reward = openSuperContainer({ suppressRewardModal: true });
        }
        
        // Add unique ID just in case
        console.log('Generated reward:', reward);
        rewards.push(reward);
    }
    updateContainerFlowStage('open');
    animateContainerDrops(rewards, () => {
        closeContainerFlow();
        updateCoinDisplay();
        showContainerRewards(rewards);
    });
}

// Dynamic click handler that chooses between paid and free containers
function handleContainerClick() {
    if (isFromTrophyRoad) {
        handleFreeContainerConfirm();
    } else {
        handleContainerConfirm();
    }
}

if (containerFlowPreview) containerFlowPreview.addEventListener('click', handleContainerClick);
if (containerFlowText) containerFlowText.addEventListener('click', handleContainerClick);
if (containerFlowCancel) containerFlowCancel.addEventListener('click', () => {
    closeContainerFlow();
});
if (containerFlowModal) {
    containerFlowModal.addEventListener('click', (e) => {
        if (e.target === containerFlowModal && !containerDropActive) {
            closeContainerFlow();
        }
    });
}



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
const selectMusicalTank = document.getElementById('selectMusicalTank');
if (selectMusicalTank) selectMusicalTank.addEventListener('click', () => {
    showTankDetail('musical');
});
const selectIlluminatTank = document.getElementById('selectIlluminatTank');
if (selectIlluminatTank) selectIlluminatTank.addEventListener('click', () => {
    showTankDetail('illuminat');
});
const selectMirrorTank = document.getElementById('selectMirrorTank');
if (selectMirrorTank) selectMirrorTank.addEventListener('click', () => {
    showTankDetail('mirror');
});
const selectTimeTank = document.getElementById('selectTimeTank');
if (selectTimeTank) selectTimeTank.addEventListener('click', () => {
    showTankDetail('time');
});
const selectMachinegunTank = document.getElementById('selectMachinegunTank');
if (selectMachinegunTank) selectMachinegunTank.addEventListener('click', () => {
    showTankDetail('machinegun');
});
const selectBuckshotTank = document.getElementById('selectBuckshotTank');
if (selectBuckshotTank) selectBuckshotTank.addEventListener('click', () => {
    showTankDetail('buckshot');
});
const selectWaterjetTank = document.getElementById('selectWaterjetTank');
if (selectWaterjetTank) selectWaterjetTank.addEventListener('click', () => {
    showTankDetail('waterjet');
});
const selectImitatorTank = document.getElementById('selectImitatorTank');
if (selectImitatorTank) selectImitatorTank.addEventListener('click', () => {
    showTankDetail('imitator');
});
const selectElectricTank = document.getElementById('selectElectricTank');
if (selectElectricTank) selectElectricTank.addEventListener('click', () => {
    showTankDetail('electric');
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
                if (Math.random() > 0.92) {
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
        const tankTypes = ['normal','ice','fire','buratino','toxic','plasma','musical', 'illuminat', 'mirror', 'machinegun', 'waterjet', 'buckshot', 'electric', 'imitator'];
        const tt = tankTypes[Math.floor(Math.random() * tankTypes.length)];
        const typeColors = { normal: '#8B0000', ice: '#00BFFF', fire: '#FF4500', buratino: '#6E38B0', toxic: '#27ae60', plasma: '#8e44ad', musical: '#00ffff', illuminat: '#f39c12', mirror: '#bdc3c7', machinegun: '#A0522D', waterjet: '#2e86c1', buckshot: '#455A64', electric: '#6c3483', imitator: '#6c3483' };
        enemies.push({
            x: p.x, y: p.y, w: 38, h: 38,
            color: typeColors[tt] || ['#8B0000', '#006400', '#FFD700'][i],
            tankType: tt,
            hp: (tankMaxHpByType[tt] || 300),
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
                tankType: (['normal','ice','fire','buratino','toxic','plasma','musical','illuminat', 'mirror', 'machinegun', 'waterjet','electric'])[Math.floor(Math.random()*12)],
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
                const allyTypes = ['normal','ice','fire','buratino','toxic','plasma','musical', 'illuminat', 'mirror', 'time', 'machinegun', 'waterjet','electric'];
            const allyType = allyTypes[Math.floor(Math.random()*allyTypes.length)];
            allies.push({ x: playerCorner.x + 44, y: playerCorner.y + 10, w: 38, h: 38, color: tank.color, tankType: allyType, hp: (tankMaxHpByType[allyType] || 300), turretAngle:0, baseAngle:0, speed: (tankMaxSpeedByType[allyType] || 3.2), trackOffset:0, alive:true, team:0, stuckCount:0, fireCooldown:0, dodgeAccuracy: 0.78 + Math.random()*0.15, paralyzed: false, paralyzedTime: 0 });

    const enemyColors = ['#006400', '#FFD700', '#00BFFF'];
    // spawn other corners with 2 enemies each; clear spawn areas first
    for (let ci = 1; ci < 4; ci++) {
        const base = corners[ci];
        clearArea(base.x - 48, base.y - 48, 96, 96);
        for (let k = 0; k < 2; k++) {
            const tankTypes = ['normal','ice','fire','buratino','toxic','plasma','musical', 'illuminat', 'mirror', 'machinegun', 'waterjet', 'buckshot', 'electric', 'imitator'];
            const tt = tankTypes[Math.floor(Math.random() * tankTypes.length)];
            const typeColor = { normal: '#8B0000', ice: '#00BFFF', fire: '#FF4500', buratino: '#6E38B0', toxic: '#27ae60', plasma: '#8e44ad', musical: '#00ffff', illuminat: '#f39c12', mirror: '#bdc3c7', machinegun: '#A0522D', waterjet: '#2e86c1', buckshot: '#455A64', electric: '#6c3483', imitator: '#6c3483' };
            // Fix: Use findFreeSpot to ensure enemies spawn inside map boundaries (especially for corners)
            // base.x/y might be near edge, and +k*44 might push out. findFreeSpot clamps efficiently.
            let sx = base.x + (k === 0 ? 0 : (ci===1 ? -44 : (ci===2 ? 44 : -44))); // try to offset inwards roughly
            let sy = base.y + (k === 0 ? 0 : (ci===1 ? 28 : (ci===2 ? -28 : -28))); 
            
            const p = findFreeSpot(sx, sy, 38, 38, 200, 20);
            if (p) {
                enemies.push({ x: p.x, y: p.y, w:38, h:38, color: typeColor[tt] || enemyColors[(ci-1)%enemyColors.length], tankType: tt, hp: (tankMaxHpByType[tt] || 300), turretAngle:0, baseAngle:0, speed:(tankMaxSpeedByType[tt] || 3.2), trackOffset:0, alive:true, team:ci, stuckCount:0, fireCooldown:0, dodgeAccuracy: 0.7 + Math.random()*0.25, paralyzed: false, paralyzedTime: 0 });
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

function spawnDuelMode() {
    enemies = [];
    allies = [];
    objects = objects || [];

    // Player in top-left corner
    tank.x = 100; tank.y = 100;
    tank.alive = true;
    setTankHP(tankType);
    
    // 1 Bot in bottom-right corner
    const ex = worldWidth - 100;
    const ey = worldHeight - 100;
    
    const tankTypes = ['normal','ice','fire','buratino','toxic','plasma','musical','illuminat', 'mirror', 'machinegun', 'buckshot', 'electric', 'imitator'];
    const tt = tankTypes[Math.floor(Math.random() * tankTypes.length)];
    const typeColor = { normal: '#8B0000', ice: '#00BFFF', fire: '#FF4500', buratino: '#6E38B0', toxic: '#27ae60', plasma: '#8e44ad', musical: '#00ffff', illuminat: '#f39c12', mirror: '#bdc3c7', machinegun: '#A0522D', buckshot: '#455A64', imitator: '#6c3483' };
    
    enemies.push({ 
        x: ex, y: ey, w:38, h:38, 
        color: typeColor[tt] || '#B22222', 
        tankType: tt, 
        hp:(tt==='fire')?600:(tt==='musical')?400:(tt==='illuminat'||tt==='mirror')?300:300, 
        turretAngle: Math.PI, 
        baseAngle: Math.PI, 
        speed: 2.5, 
        trackOffset: 0, 
        alive: true, 
        team: 1, 
        fireCooldown: 0, 
        stuckCount: 0, 
        dodgeAccuracy: 0.85, 
        respawnCount: 0, 
        paralyzed: false, 
        paralyzedTime: 0 
    });

    // spawn some barrels
    for (let b = 0; b < 8; b++) {
        const rx = 200 + Math.random() * (worldWidth - 400);
        const ry = 200 + Math.random() * (worldHeight - 400);
        const p = findFreeSpot(rx - 20, ry - 20, 40, 40, 800, 32);
        if (p) objects.push({ x: p.x, y: p.y, w: 40, h: 40, type: Math.random() > 0.85 ? 'barrel' : 'box', color: '#7a4a21' });
    }

    navNeedsRebuild = true;
}

function spawnTrialMode() {
    enemies = [];
    allies = [];
    objects = objects || [];

    // Player at center-ish spawn
    const cx = worldWidth / 2, cy = worldHeight / 2;
    const ps = findFreeSpot(cx - 19, cy - 19, 38, 38, 600, 32) || { x: cx, y: cy };
    tank.x = ps.x; tank.y = ps.y; tank.team = 0;
    setTankHP(tankType);
    tank.alive = true; tank.respawnTimer = 0;

    // 7 bots spread around the map, each on its own team
    const spreadPositions = [
        { x: 120, y: 120 },
        { x: worldWidth - 120, y: 120 },
        { x: 120, y: worldHeight - 120 },
        { x: worldWidth - 120, y: worldHeight - 120 },
        { x: cx, y: 120 },
        { x: 120, y: cy },
        { x: worldWidth - 120, y: cy }
    ];
    const trialTankTypes = ['normal','ice','fire','buratino','toxic','plasma','musical','illuminat','mirror','machinegun','waterjet','buckshot','electric','imitator'];
    const typeColor = { normal:'#8B0000', ice:'#00BFFF', fire:'#FF4500', buratino:'#6E38B0', toxic:'#27ae60', plasma:'#8e44ad', musical:'#00ffff', illuminat:'#f39c12', mirror:'#bdc3c7', machinegun:'#A0522D', waterjet:'#2e86c1', buckshot:'#455A64', electric:'#6c3483', imitator:'#6c3483' };

    for (let i = 0; i < 7; i++) {
        const sp = spreadPositions[i];
        const pos = findFreeSpot(sp.x - 19, sp.y - 19, 38, 38, 600, 32) || sp;
        const tt = trialTankTypes[Math.floor(Math.random() * trialTankTypes.length)];
        enemies.push({
            x: pos.x, y: pos.y, w: 38, h: 38,
            color: typeColor[tt] || '#B22222',
            tankType: tt,
            hp: (tankMaxHpByType[tt] || 300),
            turretAngle: 0, baseAngle: 0, speed: (tankMaxSpeedByType[tt] || 3.2), trackOffset: 0,
            alive: true,
            team: i + 1, // each bot is its own team → FFA
            fireCooldown: 0, stuckCount: 0,
            dodgeAccuracy: 0.75 + Math.random() * 0.2,
            respawnCount: 0, paralyzed: false, paralyzedTime: 0
        });
    }

    // Some barrels/boxes for cover
    for (let b = 0; b < 15; b++) {
        const rx = 180 + Math.random() * (worldWidth - 360);
        const ry = 180 + Math.random() * (worldHeight - 360);
        const p = findFreeSpot(rx - 20, ry - 20, 40, 40, 800, 32);
        if (p) objects.push({ x: p.x, y: p.y, w: 40, h: 40, type: Math.random() > 0.85 ? 'barrel' : 'box', color: '#7a4a21' });
    }

    navNeedsRebuild = true;
}

// Training map: open field with decorative elements, no random walls
function generateTrainingMap() {
    objects = [];
    const bw = 50;
    // ── Border walls ───────────────────────────────────────────────
    for (let y = 0; y < worldHeight; y += bw) {
        objects.push({ x: 0, y, w: bw, h: bw, type: 'wall', color: '#2d4a1e' });
        objects.push({ x: worldWidth - bw, y, w: bw, h: bw, type: 'wall', color: '#2d4a1e' });
    }
    for (let x = bw; x < worldWidth - bw; x += bw) {
        objects.push({ x, y: 0, w: bw, h: bw, type: 'wall', color: '#2d4a1e' });
        objects.push({ x, y: worldHeight - bw, w: bw, h: bw, type: 'wall', color: '#2d4a1e' });
    }
    // ── Divider wall at x=700 — full height, corridor gap centered at y=375..475 ──
    for (let y = bw; y < worldHeight - bw; y += bw) {
        if (y >= 375 && y < 475) continue; // centered corridor entrance
        objects.push({ x: 700, y, w: bw, h: bw, type: 'wall', color: '#4a1a0a' });
    }
    // ── Symmetric cover pillars inside boss room ──────────────────────
    // Room occupies x=750..1150, y=50..850. Center = (950, 450).
    // 4 pillars symmetric around center: (+/-150 x, +/-130 y)
    const roomPillars = [
        { x: 800, y: 300 }, { x: 1050, y: 300 },
        { x: 800, y: 550 }, { x: 1050, y: 550 },
    ];
    for (const p of roomPillars) {
        objects.push({ x: p.x, y: p.y, w: bw, h: bw, type: 'wall', color: '#4a1a0a' });
    }
    // ── Decorative barrels ────────────────────────────────────────────
    const barrelPos = [
        { x: 100, y: 100 }, { x: 100, y: 750 },
        { x: 200, y: 800 }, { x: 580, y: 70 },
        { x: 580, y: 790 }, { x: 660, y: 240 },
        { x: 660, y: 620 }, { x: 870, y: 200 },
        { x: 870, y: 680 }, { x: 1090, y: 200 },
        { x: 1090, y: 680 },
    ];
    for (const p of barrelPos) {
        objects.push({ x: p.x, y: p.y, w: 40, h: 40, type: 'barrel', color: '#7a4a21' });
    }
    navNeedsRebuild = true;
}

// Training mode: dummy targets that don't move, respawn every 10 seconds
let trainingDummies = [];
let trainingRespawnTimers = [];  // per-dummy countdown
let trainingShooterDummy = null;
let trainingShooterTimer = 0;

function spawnTrainingMode() {
    enemies = [];
    allies = [];
    trainingDummies = [];
    trainingRespawnTimers = [];

    // Player starts center-left
    tank.x = 150; tank.y = worldHeight / 2 - 19;
    tank.team = 0;
    setTankHP(tankType);
    tank.alive = true;

    // Dummy positions — split into 2 groups: upper (before corridor) and lower (after corridor)
    // Corridor entrance at y=375..475, so dummies positioned well above and below it
    const dummyPositions = [
        // Upper group (above corridor entrance)
        { x: 480, y: 130 }, { x: 570, y: 130 }, { x: 660, y: 130 },
        { x: 480, y: 280 }, { x: 570, y: 280 }, { x: 660, y: 280 },
        // Lower group (below corridor entrance)
        { x: 480, y: 570 }, { x: 570, y: 570 }, { x: 660, y: 570 },
        { x: 480, y: 720 }, { x: 570, y: 720 }, { x: 660, y: 720 },
    ];

    for (let i = 0; i < dummyPositions.length; i++) {
        const pos = dummyPositions[i];
        const dummy = {
            x: pos.x, y: pos.y, w: 38, h: 38,
            color: '#888888',
            tankType: 'dummy',
            hp: 300, maxHp: 300,
            turretAngle: 0, baseAngle: 0, speed: 0,
            alive: true,
            team: 99, // neutral team
            fireCooldown: 9999, stuckCount: 0,
            dodgeAccuracy: 0,
            isDummy: true,
            dummyIndex: i,
            spawnX: pos.x, spawnY: pos.y,
        };
        enemies.push(dummy);
        trainingDummies.push(dummy);
        trainingRespawnTimers.push(0);
    }

    // Armed shooter dummy — stationary boss tank, center of boss room (x=750..1150, y=50..850)
    const shooterDummy = {
        x: 930, y: 431, w: 38, h: 38,
        color: '#880000',
        tankType: 'boss_dummy',
        hp: 1000, maxHp: 1000,
        turretAngle: Math.PI, baseAngle: Math.PI,
        speed: 0, alive: true,
        team: 1,
        fireCooldown: 80,
        stuckCount: 0, dodgeAccuracy: 0,
        isDummy: true, isShooterDummy: true,
        spawnX: 930, spawnY: 431,
    };
    enemies.push(shooterDummy);
    trainingShooterDummy = shooterDummy;
    trainingShooterTimer = 0;

    navNeedsRebuild = true;
}

// One vs All mode: Player (team 0) vs 7 allied enemy bots (all team 1)
function spawnOneVsAllMode() {
    enemies = [];
    allies = [];
    objects = objects || [];
    
    // Player spawns in top-left corner
    const cx = 100;
    const cy = 100;
    const ps = findFreeSpot(cx - 19, cy - 19, 38, 38, 800, 32) || { x: cx, y: cy };
    tank.x = ps.x; tank.y = ps.y; tank.team = 0;
    
    // 7 enemy bots spawn on right side (all allied to each other, team 1)
    const botStartX = worldWidth * 0.85;
    const botTankTypes = ['normal','ice','fire','buratino','toxic','plasma','musical','illuminat','mirror','machinegun','waterjet','buckshot','electric','imitator'];
    const typeColors = { normal:'#8B0000', ice:'#00BFFF', fire:'#FF4500', buratino:'#6E38B0', toxic:'#27ae60', plasma:'#8e44ad', musical:'#00ffff', illuminat:'#f39c12', mirror:'#bdc3c7', machinegun:'#A0522D', waterjet:'#2e86c1', buckshot:'#455A64', electric:'#6c3483', imitator:'#6c3483' };
    
    for (let i = 0; i < 7; i++) {
        // Spread bots vertically around right side
        const angle = (i / 7) * Math.PI * 1.5 - Math.PI * 0.75; // spread from top-right to bottom-right
        const radius = Math.min(worldWidth, worldHeight) * 0.25;
        const bx = botStartX + Math.cos(angle) * (radius * 0.5);
        const by = worldHeight / 2 + Math.sin(angle) * radius;
        
        const tt = botTankTypes[Math.floor(Math.random() * botTankTypes.length)];
        const bp = findFreeSpot(bx - 19, by - 19, 38, 38, 600, 24) || { x: bx, y: by };
        
        enemies.push({
            x: bp.x, y: bp.y, w: 38, h: 38,
            color: typeColors[tt] || '#B22222',
            tankType: tt,
            hp: (tankMaxHpByType[tt] || 300),
            turretAngle: Math.random() * Math.PI * 2, baseAngle: 0, speed: 2.5, trackOffset: 0,
            alive: true, team: 1,  // all allied with each other
            fireCooldown: Math.floor(Math.random() * 60), stuckCount: 0,
            dodgeAccuracy: 0.65 + Math.random() * 0.25,
            respawnCount: 0, paralyzed: false, paralyzedTime: 0,
            mirrorShieldActive: false, mirrorShieldTimer: 0, mirrorShieldCooldown: 0,
            megaGasUsed: false, plasmaBlastUsed: 0
        });
    }
    
    // Scatter cover objects across large map (minimal for performance in one vs all)
    const coverCount = currentMode === 'onevsall' ? 30 : 80;
    for (let b = 0; b < coverCount; b++) {
        const rx = 200 + Math.random() * (worldWidth - 400);
        const ry = 200 + Math.random() * (worldHeight - 400);
        const p = findFreeSpot(rx - 20, ry - 20, 40, 40, 600, 20);
        if (p) objects.push({ x: p.x, y: p.y, w: 40, h: 40, type: Math.random() > 0.7 ? 'barrel' : 'box', color: '#7a4a21' });
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
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Tanks sorted by rarity: rare → super_rare → epic → legendary → mythic → imitator
const allTanksList = ['ice', 'machinegun', 'buckshot', 'fire', 'waterjet', 'buratino', 'musical', 'toxic', 'mirror', 'illuminat', 'plasma', 'electric', 'time', 'imitator'];
const tankRarityMap = {
    'ice': 'rare',
    'machinegun': 'rare',
    'buckshot': 'rare',
    'fire': 'super_rare',
    'waterjet': 'super_rare',
    'buratino': 'epic',
    'musical': 'epic',
    'toxic': 'legendary',
    'mirror': 'legendary',
    'illuminat': 'mythic',
    'plasma': 'mythic',
    'electric': 'mythic',
    'time': 'imitator',
    'imitator': 'imitator'
};

const rarityChances = {
    'rare': 40,
    'super_rare': 25,
    'epic': 15,
    'legendary': 10,
    'imitator': 5,
    'mythic': 5
};

// Removed duplicate tankDescriptions declaration to avoid conflict with tanks.js
// relying on window.tankDescriptions or global scope if tanks.js is loaded
// If we need English names, we should update tanks.js or use a different variable name here.
// For now, ensuring we don't crash.

// Helper to pick rarity based on weights
function getRarity() {
    const r = Math.random() * 100;
    let acc = 0;
    // Iterate in order to ensure correct accumulation
    const order = ['rare', 'super_rare', 'epic', 'legendary', 'imitator', 'mythic'];
    for (const rar of order) {
        acc += rarityChances[rar];
        if (r < acc) return rar;
    }
    return 'rare';
}

// Show reward modal
function showReward(type, amount, desc, tankType = null, options = {}) {
    const modal = document.getElementById('rewardModal');
    const title = document.getElementById('rewardTitle');
    const iconContainer = document.getElementById('rewardIconContainer');
    const amountText = document.getElementById('rewardAmount');
    const descText = document.getElementById('rewardDesc');
    const btn = document.getElementById('rewardClaimBtn');

    if (!modal) return;

    modal.classList.add('visible');
    modal.style.display = 'flex';
    
    // Reset icon container
    iconContainer.innerHTML = '<div class="reward-icon" id="rewardIcon"></div>';
    const icon = document.getElementById('rewardIcon');
    icon.style.display = 'block';

    // Default button action
    btn.onclick = () => {
        modal.classList.remove('visible');
        setTimeout(() => { 
            modal.style.display = 'none';
        }, 300);
    };

    const customTitle = options.title;
    const customIcon = options.icon;
    
    // Determine title color
    let titleColor = '#e74c3c'; // default red
    if (type === 'coins') titleColor = '#f1c40f';
    else if (type === 'gems') titleColor = '#2ecc71';
    else if (type === 'tank' && tankType && window.tankBgGradients && window.tankBgGradients[tankType]) {
        // Use the second color of the gradient for text as it's usually solid
        titleColor = window.tankBgGradients[tankType][1]; 
    }

    const defaultTitle = type === 'coins' ? 'COINS!' : type === 'gems' ? 'GEMS!' : 'NEW TANK!';
    const iconTextFallback = type === 'coins' ? '💰' : type === 'gems' ? '💎' : '🏆';
    const resolvedTitle = customTitle || defaultTitle;
    const resolvedIcon = customIcon || iconTextFallback;

    // Reset box style for every call
    const rewardBox = document.querySelector('.reward-box');
    if (rewardBox) {
        rewardBox.style.background = ''; // clear custom tank/gradient backgrounds
        rewardBox.className = 'reward-box'; // reset classes
        // Also reset border/shadow which might have been changed by tank logic
        rewardBox.style.border = ''; 
        rewardBox.style.boxShadow = '';
    }

    title.textContent = resolvedTitle;
    title.style.color = titleColor;
    title.style.background = 'none'; 
    title.style.webkitTextFillColor = 'initial';
    // Explicitly reset shadow to the CSS default (or clear inline 'none' from previous calls)
    title.style.textShadow = ''; 

    // Render icon as emoji/text
    icon.textContent = resolvedIcon || '';

    if (type === 'tank') {
        const tName = (window.tankDescriptions && window.tankDescriptions[tankType]) ? window.tankDescriptions[tankType].name : (tankType || 'Tank').toUpperCase();
        amountText.textContent = tName;
        // Text color matches rarity by default
        amountText.style.color = titleColor; 
        amountText.style.background = 'none'; 
        amountText.style.webkitTextFillColor = 'initial';
        amountText.style.textShadow = '';
        
        descText.textContent = desc || 'A powerful new vehicle!';
        
        // Draw tank
        iconContainer.innerHTML = '';
        const card = document.createElement('div');
        card.className = 'new-tank-card';
        // Reset card style to default instead of transparent
        card.style.background = '';
        card.style.border = '';
        
        // Find the reward box container to restore its default look (NOT changing it based on tank)
        if (rewardBox) {
            // Restore default reward box style
            rewardBox.style.background = 'radial-gradient(circle, #2c3e50 0%, #000000 100%)';
            rewardBox.className = 'reward-box';
            rewardBox.style.border = ''; // restore default border from CSS
            rewardBox.style.boxShadow = ''; // restore default shadow from CSS
            
            // Only modify the CARD (square) background
            if (tankType === 'time' || tankType === 'imitator') {
               // For imitator/Time, we need a CANVAS animation to match the menu exactly
               // The menu uses JS to draw pixelated rainbow. We can't easily reuse that code 
               // without refactoring, but we can copy the logic into a new helper or inline.
               // Let's create a dedicated canvas for the background inside the card
               card.style.background = 'transparent'; // Canvas will provide bg
               card.style.border = '2px solid #fff';
               
               // Rainbow text for Tank Name
               amountText.style.background = 'linear-gradient(to right, #ff0000, #ff7f00, #ffff00, #00ff00, #0000ff, #4b0082, #8b00ff)';
               amountText.style.webkitBackgroundClip = 'text';
               amountText.style.webkitTextFillColor = 'transparent';
               amountText.style.backgroundSize = '200% auto';
               amountText.style.animation = 'rainbowText 2s linear infinite';
               amountText.style.textShadow = 'none';
               
               // Keep Title standard
               title.style.color = '#f1c40f'; // Default gold for title
               title.style.textShadow = '2px 2px 0 #000';
               
            } else if (window.tankBgGradients && window.tankBgGradients[tankType]) {
                const [c1, c2] = window.tankBgGradients[tankType];
                // Apply solid background color matching the menu (second value in array usually)
                card.style.background = c1; 
                // Remove border/shadow if user wants it plain? 
                // User said "remove grey walls around tank". This means border: 2px solid from CSS maybe?
                card.style.border = 'none'; 
                card.style.boxShadow = 'none';
            
            } else {
                // Default fallback (grass color)
                card.style.background = '#1b5e20'; 
                card.style.border = 'none';
                card.style.boxShadow = 'none';
            }
        }
        
        const glow = document.createElement('div');
        glow.className = 'rarity-glow';
        // Adjust glow color to match
        glow.style.boxShadow = `0 0 30px 10px ${titleColor}`;
        
        const canvas = document.createElement('canvas');
        canvas.width = 150;
        canvas.height = 150;
        canvas.className = 'tank-display';
        // Make the canvas background transparent so it shows the card gradient
        canvas.style.background = 'transparent';
        
        card.appendChild(glow);
        card.appendChild(canvas);
        iconContainer.appendChild(card);
        
        const ctx = canvas.getContext('2d');
        if (typeof drawTankOn === 'function') {
            if (tankType === 'time' || tankType === 'imitator') {
               // Replicate the exact menu animation for Time tank
               const drawFrame = () => {
                 // Check if modal is still open
                 if (modal.style.display === 'none') return;
                 
                 ctx.clearRect(0, 0, canvas.width, canvas.height);
                 const t = Date.now() * 0.05; // Slightly faster for responsiveness
                 const pixel = 20; // Fixed pixel size matches menu style
                 const shift = (t * 2) % 360;
                 const step = 0.5;
                 
                 // Draw dynamic background directly on canvas
                 for (let py = 0; py < canvas.height; py += pixel) {
                     for (let px = 0; px < canvas.width; px += pixel) {
                         const s = px + py;
                         const hue = (((s * step) - shift) % 360 + 360) % 360;
                         const light = 48 + 6 * Math.sin((px * 0.015 + py * 0.015) + t * 0.02);
                         ctx.fillStyle = `hsl(${hue}, 80%, ${light}%)`;
                         ctx.fillRect(px, py, pixel, pixel);
                     }
                 }
                 
                 // Draw the tank on top
                 // Need to save/restore context or drawTankOn might be affected by fillStyle
                 drawTankOn(ctx, 75, 75, 60, 60, '#fff', -Math.PI/2, 1, tankType);
                 requestAnimationFrame(drawFrame);
               };
               drawFrame();
            } else {
               drawTankOn(ctx, 75, 75, 60, 60, '#fff', -Math.PI/2, 1, tankType);
            }
        }
    } else {
        amountText.textContent = (typeof amount === 'number' ? '+' + amount : amount || '');
        amountText.style.color = titleColor;
        descText.textContent = desc || (type === 'coins' ? 'Shiny gold coins!' : 'Rare currency!');
    }
}

function unlockRandomTank(fromSuper = false, options = {}) {
    const { suppressRewardModal = false } = options;
    
    // 1. Pick rarity
    const rarity = getRarity();
    const tanksInRarity = allTanksList.filter(t => tankRarityMap[t] === rarity);
    const t = tanksInRarity.length > 0
        ? tanksInRarity[Math.floor(Math.random() * tanksInRarity.length)]
        : allTanksList[Math.floor(Math.random() * allTanksList.length)]; // fallback

    const tDesc = tankDescriptions[t] ? tankDescriptions[t].name : t.toUpperCase();
    const rarityLabel = rarity.replace('_', ' ').toUpperCase();

    if (!unlockedTanks.includes(t)) {
        unlockedTanks.push(t);
        saveProgress();
        if (!suppressRewardModal) showReward('tank', 1, 'Unlocked permanently!', t);
        updateTankDetailButton(t);
        return { type: 'tank', tankType: t, desc: 'Unlocked permanently!', icon: '�' };
    } else {
        const price = tankGemPrices[t] || 0;
        const comp = price > 0 ? Math.floor(price * 0.5) : (fromSuper ? 50 : 25);
        gems += comp;
        saveProgress();
        if (!suppressRewardModal) showReward('gems', comp, `Duplicate tank ${t.toUpperCase()} converted to Gems!`);
        return { type: 'gems', amount: comp, desc: `Duplicate tank ${t.toUpperCase()} converted to Gems!`, icon: '💎' };
    }
}


// Open mini container
function openMiniContainer(options = {}) {
    const { suppressRewardModal = false } = options;
    const r = Math.random() * 100;
    if (r < 60) { // 60% — coins (10–20)
        const val = getRandomInt(10, 20);
        coins += val;
        if (!suppressRewardModal) showReward('coins', val, 'Coins (10–20)');
        return { type: 'coins', amount: val, desc: 'Coins (10–20)', icon: '💰' };
    } else if (r < 80) { // next 20% — gems (1–2)
        const val = getRandomInt(1, 2);
        gems += val;
        if (!suppressRewardModal) showReward('gems', val, 'Gems (1–2)');
        return { type: 'gems', amount: val, desc: 'Gems (1–2)', icon: '💎' };
    } else if (r < 90) { // next 10% — coins (20–40)
        const val = getRandomInt(20, 40);
        coins += val;
        if (!suppressRewardModal) showReward('coins', val, 'Coins (20–40)');
        return { type: 'coins', amount: val, desc: 'Coins (20–40)', icon: '💰' };
    } else if (r < 95) { // next 5% — gems (2–3)
        const val = getRandomInt(2, 3);
        gems += val;
        if (!suppressRewardModal) showReward('gems', val, 'Gems (2–3)');
        return { type: 'gems', amount: val, desc: 'Gems (2–3)', icon: '💎' };
    } else if (r < 98) { // next 3% — coins (40–60)
        const val = getRandomInt(40, 60);
        coins += val;
        if (!suppressRewardModal) showReward('coins', val, 'Coins (40–60)');
        return { type: 'coins', amount: val, desc: 'Coins (40–60)', icon: '💰' };
    }
    // remaining 2% — gems (3–5)
    const val = getRandomInt(3, 5);
    gems += val;
    if (!suppressRewardModal) showReward('gems', val, 'Gems (3–5)');
    return { type: 'gems', amount: val, desc: 'Gems (3–5)', icon: '💎' };
}

// Open normal container
function openContainer(options = {}) {
    const { suppressRewardModal = false } = options;
    const r = Math.random() * 100;
    if (r < 45) { // 45% — coins (20–60)
        const val = getRandomInt(20, 60);
        coins += val;
        if (!suppressRewardModal) showReward('coins', val, 'Coins (20–60)');
        return { type: 'coins', amount: val, desc: 'Coins (20–60)', icon: '💰' };
    } else if (r < 75) { // next 30% — coins (60–120)
        const val = getRandomInt(60, 120);
        coins += val;
        if (!suppressRewardModal) showReward('coins', val, 'Coins (60–120)');
        return { type: 'coins', amount: val, desc: 'Coins (60–120)', icon: '💰' };
    } else if (r < 90) { // next 15% — gems (1–3)
        const val = getRandomInt(1, 3);
        gems += val;
        if (!suppressRewardModal) showReward('gems', val, 'Gems (1–3)');
        return { type: 'gems', amount: val, desc: 'Gems (1–3)', icon: '💎' };
    } else if (r < 95) { // next 5% — gems (3–6)
        const val = getRandomInt(3, 6);
        gems += val;
        if (!suppressRewardModal) showReward('gems', val, 'Gems (3–6)');
        return { type: 'gems', amount: val, desc: 'Gems (3–6)', icon: '💎' };
    }
    return unlockRandomTankNew(false, { suppressRewardModal });
}

// Open super container
function openSuperContainer(options = {}) {
    const { suppressRewardModal = false } = options;
    const r = Math.random() * 100;
    if (r < 35) { // 35% — coins (120–250)
        const val = getRandomInt(120, 250);
        coins += val;
        if (!suppressRewardModal) showReward('coins', val, 'Coins (120–250)');
        return { type: 'coins', amount: val, desc: 'Coins (120–250)', icon: '💰' };
    } else if (r < 60) { // next 25% — coins (250–450)
        const val = getRandomInt(250, 450);
        coins += val;
        if (!suppressRewardModal) showReward('coins', val, 'Coins (250–450)');
        return { type: 'coins', amount: val, desc: 'Coins (250–450)', icon: '💰' };
    } else if (r < 75) { // next 15% — gems (5–12)
        const val = getRandomInt(5, 12);
        gems += val;
        if (!suppressRewardModal) showReward('gems', val, 'Gems (5–12)');
        return { type: 'gems', amount: val, desc: 'Gems (5–12)', icon: '💎' };
    } else if (r < 90) { // next 15% — gems (12–25)
        const val = getRandomInt(12, 25);
        gems += val;
        if (!suppressRewardModal) showReward('gems', val, 'Gems (12–25)');
        return { type: 'gems', amount: val, desc: 'Gems (12–25)', icon: '💎' };
    }
    return unlockRandomTankNew(true, { suppressRewardModal });
}

// Open Omega container
// 20% - Tank
// 80% - Resources:
//   30% - Coins 600-1200
//   20% - Coins 1200-2000
//   20% - Gems 25-50
//   10% - Gems 50-80
function openOmegaContainer(options = {}) {
    const { suppressRewardModal = false } = options;
    const r = Math.random() * 100;
    
    if (r < 30) { // 30% coins small
        const val = getRandomInt(600, 1200);
        coins += val;
        if (!suppressRewardModal) showReward('coins', val, 'Coins (600–1200)');
        return { type: 'coins', amount: val, desc: 'Coins (600–1200)', icon: '💰' };
    
    } else if (r < 50) { // 20% coins big (30 + 20 = 50)
        const val = getRandomInt(1200, 2000);
        coins += val;
        if (!suppressRewardModal) showReward('coins', val, 'Coins (1200–2000)');
        return { type: 'coins', amount: val, desc: 'Coins (1200–2000)', icon: '💰' };
    
    } else if (r < 70) { // 20% gems small (50 + 20 = 70)
        const val = getRandomInt(25, 50);
        gems += val;
        if (!suppressRewardModal) showReward('gems', val, 'Gems (25–50)');
        return { type: 'gems', amount: val, desc: 'Gems (25–50)', icon: '💎' };
    
    } else if (r < 80) { // 10% gems big (70 + 10 = 80)
        const val = getRandomInt(50, 80);
        gems += val;
        if (!suppressRewardModal) showReward('gems', val, 'Gems (50–80)');
        return { type: 'gems', amount: val, desc: 'Gems (50–80)', icon: '💎' };
    
    } else { // Remaining 20% (80 -> 100) is Tank
        // Reuse unlockRandomTank but maybe prioritize unlocked ones? 
        // Logic says "any tank". unlockRandomTank handles duplicate logic.
        // We pass fromSuper=true to get higher gem refund if duplicate.
        // Maybe even higher refund for Omega?
        // Let's modify unlockRandomTank to accept multiplier or specific refund.
        // For now standard super refund is fine.
        return unlockRandomTankNew(true, { suppressRewardModal });
    }
}

// Autopilot evasion AI for electric robot tank
function updateAutopilotEvasion() {
    // Find the nearest enemy
    let nearest = null;
    let nearestDist = Infinity;
    const pcx = tank.x + tank.w / 2;
    const pcy = tank.y + tank.h / 2;
    
    for (const e of enemies) {
        if (!e.alive) continue;
        const ecx = e.x + e.w / 2;
        const ecy = e.y + e.h / 2;
        const dist = Math.hypot(ecx - pcx, ecy - pcy);
        if (dist < nearestDist) {
            nearestDist = dist;
            nearest = e;
        }
    }
    
    // Evasion behavior: move away from nearest enemy
    if (nearest) {
        const ecx = nearest.x + nearest.w / 2;
        const ecy = nearest.y + nearest.h / 2;
        
        // Calculate direction away from enemy
        const angleAwayFrom = Math.atan2(pcy - ecy, pcx - ecx);
        
        // Move away with evasion speed
        const evadeSpeed = tank.speed * 1.2; // Slightly faster during evasion
        const dx = Math.cos(angleAwayFrom) * evadeSpeed;
        const dy = Math.sin(angleAwayFrom) * evadeSpeed;
        
        // Update tank's base angle toward move direction
        tank.baseAngle = angleAwayFrom;
        
        // Continue moving away using movement logic
        // Use the physics system to avoid walls
        for (let step = 0; step < 2; step++) {
            moveWithCollision(dx / 2, 0);
            moveWithCollision(0, dy / 2);
        }
        
        // Rotate turret to face the enemy (defensive posture)
        const angleToEnemy = Math.atan2(ecy - pcy, ecx - pcx);
        const angleDiff = angleToEnemy - tank.turretAngle;
        
        // Normalize angle difference
        let normalizedDiff = angleDiff;
        if (normalizedDiff > Math.PI) normalizedDiff -= Math.PI * 2;
        if (normalizedDiff < -Math.PI) normalizedDiff += Math.PI * 2;
        
        // Gradually turn turret (smooth rotation)
        const rotSpeed = 0.1;
        if (Math.abs(normalizedDiff) > 0.05) {
            tank.turretAngle += Math.sign(normalizedDiff) * rotSpeed;
        }
    }
}

// Построить навигационную сетку: 1 = блокировано, 0 = свободно
function update() {
    updateMusic();
    if (gameState !== 'playing') {
        syncResultOverlay(gameState);
        if (gameState === 'win' || gameState === 'lose') {
            // Do not restart on Space — use Enter to restart instead
            if (keys['Enter']) {
                saveProgress(); // Save before reload
                location.reload();
                keys['Enter'] = false;
            }
        }
        return;
    }

    // TRAINING MODE: respawn dead dummies every 10 seconds (600 frames)
    if (currentMode === 'training' && typeof trainingDummies !== 'undefined') {
        for (let i = 0; i < trainingDummies.length; i++) {
            const dummy = trainingDummies[i];
            if (!dummy.alive || dummy.hp <= 0) {
                // Start or tick respawn timer
                trainingRespawnTimers[i] = (trainingRespawnTimers[i] || 0) + 1;
                // Remove from enemies array so it doesn't block
                const ei = enemies.indexOf(dummy);
                if (ei !== -1) enemies.splice(ei, 1);
                dummy.alive = false;
                if (trainingRespawnTimers[i] >= 600) {
                    // Respawn: reset dummy and re-add to enemies
                    dummy.hp = dummy.maxHp || 300;
                    dummy.alive = true;
                    dummy.x = dummy.spawnX;
                    dummy.y = dummy.spawnY;
                    enemies.push(dummy);
                    trainingRespawnTimers[i] = 0;
                    spawnParticle(dummy.x + 19, dummy.y + 19, '#00ff88');
                }
            } else {
                // Alive: keep hp capped and make sure it's in enemies
                trainingRespawnTimers[i] = 0;
                dummy.hp = Math.min(dummy.hp, dummy.maxHp || 300);
                // Dummies don't move at all
                dummy.speed = 0;
                dummy.fireCooldown = 9999;
            }
        }
        // SHOOTER DUMMY: stationary armed tank — aims at player, fires, respawns after 15s
        if (trainingShooterDummy) {
            const sd = trainingShooterDummy;
            if (sd.alive && sd.hp > 0) {
                sd.x = sd.spawnX; sd.y = sd.spawnY; sd.speed = 0;
                sd.hp = Math.min(sd.hp, sd.maxHp);
                const dx = (tank.x + 19) - (sd.x + 19);
                const dy = (tank.y + 19) - (sd.y + 19);
                sd.turretAngle = Math.atan2(dy, dx);
                sd.baseAngle = sd.turretAngle;
                if (sd.fireCooldown > 0) { sd.fireCooldown--; }
                else {
                    const ang = sd.turretAngle;
                    bullets.push({ x: sd.x+19+Math.cos(ang)*25, y: sd.y+19+Math.sin(ang)*25, w:5, h:5, vx:Math.cos(ang)*5, vy:Math.sin(ang)*5, life:130, owner:'enemy', team: sd.team, type:'fire', damage:100 });
                    sd.fireCooldown = 80;
                }
            } else {
                sd.alive = false;
                const ei = enemies.indexOf(sd);
                if (ei !== -1) enemies.splice(ei, 1);
                trainingShooterTimer++;
                if (trainingShooterTimer >= 900) {
                    sd.hp = sd.maxHp; sd.alive = true;
                    sd.x = sd.spawnX; sd.y = sd.spawnY;
                    sd.fireCooldown = 80;
                    enemies.push(sd);
                    trainingShooterTimer = 0;
                    spawnParticle(sd.x + 19, sd.y + 19, '#ff4400');
                    spawnParticle(sd.x + 19, sd.y + 19, '#ff8800');
                }
            }
        }
    }
    
    // DUEL MODE: Shrinking Zone Logic (Grid Based)
    if (currentMode === 'duel' && duelState) {
        // Shrink timer
        duelState.shrinkTimer++;
        if (duelState.shrinkTimer >= duelState.shrinkInterval) {
            duelState.shrinkTimer = 0;
            // Shrink sides if larger than minSize
            if (duelState.maxX - duelState.minX > duelState.minSize) {
                duelState.minX += duelState.stepSize;
                duelState.maxX -= duelState.stepSize;
            }
            if (duelState.maxY - duelState.minY > duelState.minSize) {
                duelState.minY += duelState.stepSize;
                duelState.maxY -= duelState.stepSize;
            }
        }
        
        // Helper: is entity inside safe zone?
        function isSafe(ent) {
            const cx = ent.x + ent.w/2;
            const cy = ent.y + ent.h/2;
            return (cx >= duelState.minX && cx <= duelState.maxX && 
                    cy >= duelState.minY && cy <= duelState.maxY);
        }

        // Damage Check Player
        if (!isSafe(tank) && tank.alive !== false) {
            if ((Date.now() % 1000) < 16) tank.hp -= 100; // 100 dmg/sec
            if (Math.random() > 0.8) spawnParticle(tank.x + tank.w/2, tank.y + tank.h/2, '#FF0000');
            if (tank.hp <= 0) {
                tank.alive = false;
                gameState = 'lose';
                loseModeTrophies();
                syncResultOverlay('lose');
                spawnExplosion(tank.x+tank.w/2, tank.y+tank.h/2, 70);
            }
        }
        
        // Damage Check Enemies
        for (let i = enemies.length - 1; i >= 0; i--) {
            const e = enemies[i];
            if (!e || !e.alive) continue;
            
            if (!isSafe(e)) {
                if ((Date.now() % 1000) < 16) e.hp -= 100;
                if (Math.random() > 0.8) spawnParticle(e.x + e.w/2, e.y + e.h/2, '#FF0000');
                if (e.hp <= 0) {
                    enemies.splice(i, 1);
                    spawnExplosion(e.x+e.w/2, e.y+e.h/2, 65);
                }
            }
        }
    }

    // Reset AI budget for this frame (reduced for onevsall)
    globalPathBudget = (currentMode === 'onevsall') ? MAX_PATH_BUDGET_ONEVSALL : MAX_PATH_BUDGET;

    // Throttle nav rebuild - only once every few frames max if needed (skip for onevsall)
    if (navNeedsRebuild && currentMode !== 'onevsall') { 
        if ((window.frameCount || 0) % 3 === 0) {
            buildNavGrid(); 
            navNeedsRebuild = false; 
        }
    } else if (currentMode === 'onevsall') {
        navNeedsRebuild = false; // disable navgrid for onevsall
    }
    
    // player input only when alive
    if (tank.alive !== false) {
        if (tank.moveCooldown > 0) tank.moveCooldown--;
        // handle paralyze state for player tank
        if (tank.paralyzed) {
            tank.paralyzedTime = (tank.paralyzedTime || 0) - 1;
            if (tank.paralyzedTime <= 0) tank.paralyzed = false;
            if (tank.frozenEffect) tank.frozenEffect--;
        } else {
        
        if (tank.invertedControls > 0) {
            tank.invertedControls--;
            // Visual confusion
            if (Math.random() > 0.8) spawnParticle(tank.x + tank.w/2, tank.y + tank.h/2, '#8e44ad');
        }

        let dx = 0, dy = 0;
        let isW = keys['KeyW'], isS = keys['KeyS'], isA = keys['KeyA'], isD = keys['KeyD'];
        
        // Block player controls during autopilot or ultimate charge
        if (tank.isAutopilotActive || tank.isUltimateActive) {
            isW = isS = isA = isD = false;
        }
        
        // Handle Control Inversion (Swap inputs)
        if (tank.invertedControls > 0) {
            [isW, isS] = [isS, isW];
            [isA, isD] = [isD, isA];
        }

        if (isW) { dy -= tank.speed; tank.baseAngle = -Math.PI/2; }
        if (isS) { dy += tank.speed; tank.baseAngle = Math.PI/2; }
        if (isA) { dx -= tank.speed; tank.baseAngle = Math.PI; }
        if (isD) { dx += tank.speed; tank.baseAngle = 0; }
        // Store velocity so flames inherit it (bug fix: flames don't drift back when moving)
        tank._vx = dx; tank._vy = dy;
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
                    damage: 350, // high damage
                    piercing: true,
                    destroysWalls: true // will destroy walls it hits
                });
                tank.plasmaBlastUsed = (tank.plasmaBlastUsed || 0) + 1;
                tank.fireCooldown = 60; // short cooldown after blast
            }
            keys['KeyE'] = false;
        }
        // Inversion of Control ability for illuminat tank on E
        if (tankType === 'illuminat' && keys['KeyE']) {
            if ((tank.inversionUsed || 0) < 2) {
                // Inversion of Control: All nearby enemies move in opposite direction
                const range = 350;
                const cx = tank.x + tank.w/2;
                const cy = tank.y + tank.h/2;
                
                // Visual Effect Ring
                objects.push({
                     type: 'explosion', 
                     x: cx, y: cy, 
                     radius: range, 
                     life: 45, 
                     maxLife: 45,
                     color: 'rgba(155, 89, 182, 0.2)' 
                });
                 // Visual Particles
                for (let k=0; k<20; k++) {
                    const a = Math.random() * Math.PI*2;
                    const r = range * Math.sqrt(Math.random());
                    spawnParticle(cx + Math.cos(a)*r, cy + Math.sin(a)*r, '#8e44ad');
                }

                // Affect Enemies
                for (const e of enemies) {
                    const ex = e.x + e.w/2;
                    const ey = e.y + e.h/2;
                    if (Math.hypot(ex-cx, ey-cy) <= range) {
                        e.invertedControls = 120; // 2 seconds
                        e.confused = 120; // Add confusion for turret spinning too
                    }
                }
                
                // Affect Allies (if friendly fire/confusion enabled? No, usually beneficial only)
                
                tank.inversionUsed = (tank.inversionUsed || 0) + 1;
            }
            keys['KeyE'] = false;
        }

        // Mirror tank ability (E) - Mirror Shield
        if (tankType === 'mirror') {
             if (keys['KeyE']) {
                if (!tank.mirrorShieldActive && (!tank.mirrorShieldCooldown || tank.mirrorShieldCooldown <= 0)) {
                    tank.mirrorShieldActive = true;
                    tank.mirrorShieldTimer = 120; // 2 seconds (60fps * 2)
                    tank.mirrorShieldCooldown = 60 * 18; // 18 seconds
                }
                keys['KeyE'] = false;
            }
            if (tank.mirrorShieldActive) {
                tank.mirrorShieldTimer--;
                if (tank.mirrorShieldTimer <= 0) {
                    tank.mirrorShieldActive = false;
                }
            }
            if (tank.mirrorShieldCooldown > 0) tank.mirrorShieldCooldown--;
        }

        // Time Tank Ability (E) - Time Rewind (Back 5 seconds)
        if (tankType === 'time') {
            if (keys['KeyE']) {
                if (!tank.teleportCooldown || tank.teleportCooldown <= 0) {
                    // Rewind logic
                    if (tank.history && tank.history.length > 0) {
                        // Get the oldest state (5 seconds ago, or as far as we have)
                        const oldState = tank.history[0];
                        
                        // FX at current position (vanish - Implosion style)
                        objects.push({ type: 'implosion', x: tank.x + tank.w/2, y: tank.y + tank.h/2, radius: 45, life: 25, maxLife: 25, color: '#00ffff' }); // Cyan Flash
                        for(let i=0; i<40; i++) {
                            spawnParticle(tank.x + tank.w/2, tank.y + tank.h/2, '#00ffff', 6);
                        }

                        // Teleport back
                        tank.x = oldState.x;
                        tank.y = oldState.y;
                        tank.turretAngle = oldState.turretAngle;
                        tank.baseAngle = oldState.baseAngle;
                        // Optional: Restore HP? For now, let's keep it just movement to avoid exploit/confusion
                        // tank.hp = Math.min(tank.maxHp, Math.max(tank.hp, oldState.hp));

                        // FX at new position (appear - Explosion style)
                        objects.push({ type: 'explosion', x: tank.x + tank.w/2, y: tank.y + tank.h/2, radius: 60, life: 30, color: '#ff00ff' }); // Magenta Flash
                        for(let i=0; i<50; i++) {
                            spawnParticle(tank.x + tank.w/2, tank.y + tank.h/2, '#ff00ff', 6);
                        }
                        
                        // Clear history to prevent jumping back to same spot immediately? 
                        // Or keep it for continuous rewinding?
                        // Usually clear history to reset the timeline.
                        tank.history = []; 
                        
                        tank.teleportCooldown = 60 * 8; // 8 seconds standard cooldown
                    }
                }
                keys['KeyE'] = false;
            }
            if (tank.teleportCooldown > 0) tank.teleportCooldown--;
        }

        // Imitator Tank Ability (E) — Transform into nearest enemy for 6 seconds (cooldown 18s)
        if (tankType === 'imitator' && !tank.imitatorActive) {
            if (keys['KeyE']) {
                if (!tank.imitatorCooldown || tank.imitatorCooldown <= 0) {
                    // Find nearest alive enemy
                    let nearest = null;
                    let nearestDist = Infinity;
                    const pcx = tank.x + tank.w / 2;
                    const pcy = tank.y + tank.h / 2;
                    for (const e of enemies) {
                        if (!e.alive) continue;
                        const d = Math.hypot((e.x + e.w/2) - pcx, (e.y + e.h/2) - pcy);
                        if (d < nearestDist) { nearestDist = d; nearest = e; }
                    }
                    if (nearest) {
                        const copiedType = nearest.tankType || 'normal';
                        const copiedMaxHp = tankMaxHpByType[copiedType] || 300;
                        tank.imitatorActive = true;
                        tank.imitatorTimer = 360; // 6 seconds at 60fps
                        tank.imitatorCooldown = 60 * 18; // 18 second cooldown
                        tank.originalTankType = 'imitator';
                        tank.originalMaxHp = 250;
                        tankType = copiedType;
                        setTankSpeed(tankType);
                        setTankHP(tankType);
                        tank.hp = tank.maxHp; // Transform to full HP of copied tank
                        // Rainbow transformation particles
                        for (let i = 0; i < 35; i++) {
                            const hue = (i / 35) * 360;
                            spawnParticle(pcx + (Math.random()-0.5)*30, pcy + (Math.random()-0.5)*30,
                                `hsl(${hue},100%,60%)`, 7);
                        }
                        objects.push({ type: 'explosion', x: pcx, y: pcy, radius: 55, life: 25, maxLife: 25, color: 'rgba(200,100,255,0.3)' });
                    }
                }
                keys['KeyE'] = false;
            }
        }
        // Tick imitator transformation timer
        if (tank.imitatorActive) {
            tank.imitatorTimer--;
            if (tank.imitatorTimer <= 0) {
                // Revert to imitator form
                tank.imitatorActive = false;
                tankType = tank.originalTankType || 'imitator';
                setTankSpeed(tankType);
                setTankHP(tankType);
                tank.hp = tank.maxHp; // Revert to full HP
                // Clean up any copied-type state
                tank.mirrorShieldActive = false;
                tank.mirrorShieldTimer = 0;
                tank.beamActive = false;
                tank.waterjetActive = false;
                tank.history = [];
                // Revert particle burst
                const rx = tank.x + tank.w/2, ry = tank.y + tank.h/2;
                for (let i = 0; i < 20; i++) {
                    const hue = (i / 20) * 360;
                    spawnParticle(rx + (Math.random()-0.5)*24, ry + (Math.random()-0.5)*24,
                        `hsl(${hue},100%,65%)`, 5);
                }
            }
        }
        if (tank.imitatorCooldown > 0) tank.imitatorCooldown--;

        // electric / Electric Ability (E) — Ultimate: charge 1s, then nova through walls
        if (tankType === 'electric') {
            if (keys['KeyE']) {
                if (!tank.isUltimateActive && (!tank.ultimateCooldown || tank.ultimateCooldown <= 0)) {
                    // Activate ultimate: charge (stop) for 1 second
                    tank.isUltimateActive = true;
                    tank.ultimateTimer = 60; // 1 second at 60fps
                    tank.ultimateCooldown = 480; // 8 seconds cooldown

                    // Visual charge effect
                    for (let i = 0; i < 30; i++) {
                        spawnParticle(tank.x + tank.w/2 + (Math.random()-0.5)*tank.w*1.2,
                                     tank.y + tank.h/2 + (Math.random()-0.5)*tank.h*1.2,
                                     '#00d4ff', 1);
                    }
                }
                keys['KeyE'] = false;
            }
        }
        // Update autopilot ability timers
        if (tank.isAutopilotActive) {
            tank.autoPilotTimer--;
            if (tank.autoPilotTimer <= 0) {
                tank.isAutopilotActive = false;
            }
        }
        if (tank.autoPilotCooldown > 0) tank.autoPilotCooldown--;

        // Update ultimate timers
        if (tank.isUltimateActive) {
            tank.ultimateTimer--;
            if (tank.ultimateTimer <= 0) {
                // End charge and unleash nova that hits all enemies through walls
                tank.isUltimateActive = false;
                const cx = tank.x + tank.w/2;
                const cy = tank.y + tank.h/2;
                // Reduced radius ~200px for electric electric ultimate
                if (typeof createElectricNova === 'function') {
                    createElectricNova(cx, cy, 200, 2, tank.team);
                }
                // Center burst particles
                for (let p = 0; p < 40; p++) spawnParticle(cx + (Math.random()-0.5)*120, cy + (Math.random()-0.5)*120, '#00f2ff', 0.9);
            }
        }
        if (tank.ultimateCooldown > 0) tank.ultimateCooldown--;

        // Update active nova zones (continuous damage)
        if (typeof updateNovaZones === 'function') {
            updateNovaZones();
        }

        if (keys['ArrowRight']) tank.turretAngle += 0.06;

    // Time Travel Record (for Time Rewind ability)
    if (tankType === 'time') {
        if (!tank.history) tank.history = [];
        // Save current state every frame (at 60fps, 300 frames = 5 seconds)
        tank.history.push({
            x: tank.x,
            y: tank.y,
            turretAngle: tank.turretAngle,
            baseAngle: tank.baseAngle,
            hp: tank.hp
        });
        // Limit history to 5 seconds
        if (tank.history.length > 300) {
            tank.history.shift();
        }
    }

    // Перезарядка игрока
    if (tank.fireCooldown > 0) tank.fireCooldown--;

    // Logic for Machinegun Overheating
    if (tankType === 'machinegun') {
        tank.heat = tank.heat || 0;
        const HEAT_MAX = 240; // 4 seconds at 60fps
        const COOL_RATE = 2; // Cools down in 2 seconds (240/2 = 120 ticks)
        
        if (tank.overheated) {
            // Overheated: Cool down, cannot shoot
            tank.heat -= COOL_RATE;
            if (tank.heat <= 0) {
                tank.heat = 0;
                tank.overheated = false;
            }
            // Add smoke effect when overheated
             if (Math.random() > 0.5) spawnParticle(tank.x + tank.w/2, tank.y + tank.h/2, '#555', 0.5);
        } else {
             if (keys['Space']) {
                // Shooting heats up
                tank.heat++;
                if (tank.heat >= HEAT_MAX) {
                    tank.heat = HEAT_MAX;
                    tank.overheated = true;
                    // Steam effect
                    for(let i=0; i<10; i++) spawnParticle(tank.x + tank.w/2, tank.y + tank.h/2, '#fff', 1);
                }
             } else {
                 // Not shooting cools down
                 if (tank.heat > 0) tank.heat -= COOL_RATE;
             }
        }
    } else {
        tank.heat = 0;
        tank.overheated = false;
    }

        // Стрельба (только если перезарядка закончилась, нет перегрева и не активен автопилот/ульт)
        if (keys['Space'] && tank.fireCooldown <= 0 && !tank.overheated && !tank.isAutopilotActive && !tank.isUltimateActive) {
            shoot();
            if (tankType !== 'fire' && tankType !== 'machinegun' && tankType !== 'waterjet') {
                keys['Space'] = false;
            }
        }
        }
    }
// --- APPEND_POINT_UPDATE_AI ---
    // Autopilot evasion for electric tank
    if (tank.isAutopilotActive) {
        updateAutopilotEvasion();
    }
    updateEnemyAI();
// --- APPEND_POINT_UPDATE_AI_ALLIES ---
    updateAllyAI();
// --- APPEND_POINT_UPDATE_REST ---
    updatePhysics();
}

function updateCoinDisplay() {
    // Game HUD
    const coinDisplay = document.getElementById('coinDisplay');
    if (coinDisplay) coinDisplay.textContent = coins;
    const gemDisplay = document.getElementById('gemDisplay');
    if (gemDisplay) gemDisplay.textContent = gems;
    const trophyDisplay = document.getElementById('trophyDisplay');
    if (trophyDisplay) trophyDisplay.textContent = trophies;

    // Menu Displays (IDs: menuCoinDisplay, menuGemDisplay, shopCoinDisplay, etc)
    const elementsToUpdate = document.querySelectorAll('.currency-coin');
    elementsToUpdate.forEach(el => el.textContent = coins);
    
    const gemElements = document.querySelectorAll('.currency-gem');
    gemElements.forEach(el => el.textContent = gems);
    
    const trophyElements = document.querySelectorAll('.currency-trophy');
    trophyElements.forEach(el => el.textContent = trophies);

    // Update trophy progress bar if present (progress toward next milestone)
    const trophyBarFill = document.getElementById('trophyBarFill');
    if (trophyBarFill) {
        let prev = 0;
        let next = trophyRoadRewards.length ? trophyRoadRewards[trophyRoadRewards.length - 1].trophies : 100;
        for (let i = 0; i < trophyRoadRewards.length; i++) {
            const tReq = trophyRoadRewards[i].trophies;
            if (trophies >= tReq) prev = tReq;
            else { next = tReq; break; }
        }
        const pct = (next === prev) ? 100 : Math.max(0, Math.min(100, Math.floor((trophies - prev) / (next - prev) * 100)));
        trophyBarFill.style.width = pct + '%';
    }

    // Check for new available trophy rewards
    checkTrophyRewards();

    saveProgress();
}

// Check and auto-unlock trophy rewards
function checkTrophyRewards() {
    trophyRoadRewards.forEach((reward, index) => {
        if (trophies >= reward.trophies && !claimedRewards.includes(index)) {
            // Reward is available but not claimed
            reward.claimed = false;
        }
    });
}

// Generate trophy road UI
function generateTrophyRoad() {
    const container = document.getElementById('trophyRoadContainer');
    if (!container) return;
    
    container.innerHTML = '';
    
    // Add stage headers
    let currentStage = '';
    
    trophyRoadRewards.forEach((reward, index) => {
        // Add stage headers for new trophy road (0-1000)
        if (reward.trophies === 0 && currentStage !== 'stage1') {
            currentStage = 'stage1';
            const stageDiv = document.createElement('div');
            stageDiv.className = 'trophy-stage stage1';
            stageDiv.textContent = '🟢 Начальный этап';
            container.appendChild(stageDiv);
        } else if (reward.trophies === 30 && currentStage !== 'stage2') {
            currentStage = 'stage2';
            const stageDiv = document.createElement('div');
            stageDiv.className = 'trophy-stage stage2';
            stageDiv.textContent = '🟡 Ранний этап';
            container.appendChild(stageDiv);
        } else if (reward.trophies === 100 && currentStage !== 'stage3') {
            currentStage = 'stage3';
            const stageDiv = document.createElement('div');
            stageDiv.className = 'trophy-stage stage3';
            stageDiv.textContent = '🟠 Этап развития';
            container.appendChild(stageDiv);
        } else if (reward.trophies === 200 && currentStage !== 'stage4') {
            currentStage = 'stage4';
            const stageDiv = document.createElement('div');
            stageDiv.className = 'trophy-stage stage4';
            stageDiv.textContent = '🔵 Продвинутый этап';
            container.appendChild(stageDiv);
        } else if (reward.trophies === 500 && currentStage !== 'stage5') {
            currentStage = 'stage5';
            const stageDiv = document.createElement('div');
            stageDiv.className = 'trophy-stage stage5';
            stageDiv.textContent = '🟣 Мастерство';
            container.appendChild(stageDiv);
        } else if (reward.trophies === 900 && currentStage !== 'stage6') {
            currentStage = 'stage6';
            const stageDiv = document.createElement('div');
            stageDiv.className = 'trophy-stage stage6';
            stageDiv.textContent = '🔴 Этап истины';
            container.appendChild(stageDiv);
        } else if (reward.trophies === 1200 && currentStage !== 'stage7') {
            currentStage = 'stage7';
            const stageDiv = document.createElement('div');
            stageDiv.className = 'trophy-stage stage7';
            stageDiv.textContent = '⚫ Этап легенд';
            container.appendChild(stageDiv);
        }
        
        const itemDiv = document.createElement('div');
        itemDiv.className = 'trophy-item';
        // attach current stage class so we can style buttons according to stage color
        if (currentStage) itemDiv.classList.add(currentStage);
        
        const isClaimed = claimedRewards.includes(index);
        const isAvailable = trophies >= reward.trophies && !isClaimed;
        
        if (isClaimed) {
            itemDiv.classList.add('claimed');
        } else if (isAvailable) {
            itemDiv.classList.add('available');
        }
        
        itemDiv.innerHTML = `
            <div class="trophy-milestone">${reward.trophies} 🏆</div>
            <div class="trophy-reward">${reward.reward}</div>
            <button class="trophy-claim" ${!isAvailable || isClaimed ? 'disabled' : ''} 
                onclick="claimTrophyReward(${index})">
                ${isClaimed ? 'Получено' : isAvailable ? 'Получить' : 'Заблокировано'}
            </button>
        `;
        
        container.appendChild(itemDiv);
    });
}

// Claim trophy reward
function claimTrophyReward(index) {
    const reward = trophyRoadRewards[index];
    if (!reward || claimedRewards.includes(index) || trophies < reward.trophies) return;
    
    claimedRewards.push(index);
    
    // Process reward
    switch (reward.type) {
        case 'coins':
            coins += reward.amount;
            showNotification(`+${reward.amount} монет!`, '#f1c40f');
            break;
        case 'gems':
            gems += reward.amount;
            showNotification(`+${reward.amount} гемов!`, '#2ecc71');
            break;
        case 'bundle':
            if (reward.coins) { coins += reward.coins; showNotification(`+${reward.coins} монет!`, '#f1c40f'); }
            if (reward.gems) { gems += reward.gems; showNotification(`+${reward.gems} гемов!`, '#2ecc71'); }
            break;
        case 'container':
            // Show container modal like in shop
            if (reward.level === 'mini') {
                showFreeContainerFlow('mini');
            } else if (reward.level === 'normal') {
                showFreeContainerFlow('bronze');
            } else if (reward.level === 'super') {
                showFreeContainerFlow('legendary');
            } else if (reward.level === 'omega') {
                showFreeContainerFlow('omega');
            }
            showNotification(`Получен ${reward.reward}!`, '#9b59b6');
            break;
        case 'containers':
            // Add all containers to queue and start with first one
            showNotification(`Получено ${reward.amount} контейнеров!`, '#9b59b6');
            
            // Clear queue first
            containerQueue = [];
            
            // Add remaining containers to queue (first one will be shown immediately)
            for (let i = 1; i < reward.amount; i++) {
                if (reward.level === 'mini') {
                    containerQueue.push('mini');
                } else if (reward.level === 'normal') {
                    containerQueue.push('bronze');
                } else if (reward.level === 'super') {
                    containerQueue.push('legendary');
                } else if (reward.level === 'omega') {
                    containerQueue.push('omega');
                }
            }
            
            // Show first container immediately
            if (reward.level === 'mini') {
                showFreeContainerFlow('mini');
            } else if (reward.level === 'normal') {
                showFreeContainerFlow('bronze');
            } else if (reward.level === 'super') {
                showFreeContainerFlow('legendary');
            } else if (reward.level === 'omega') {
                showFreeContainerFlow('omega');
            }
            break;
        case 'choice':
            // Defer claiming until choice is made. We must remove it from claimedRewards temporarily.
            claimedRewards.pop(); 
            openChoiceModal(reward, index);
            return; // Exit function so we don't save progress yet
        case 'tank':
            if (unlockedTanks.includes(reward.tank)) {
                // Already has tank, give gems as compensation
                gems += reward.compensation;
                showNotification(`У вас уже есть этот танк! +${reward.compensation} гемов в качестве компенсации`, '#2ecc71');
            } else {
                unlockedTanks.push(reward.tank);
                // Show tank reward modal like in shop
                const tankName = (window.tankDescriptions && window.tankDescriptions[reward.tank]) ? window.tankDescriptions[reward.tank].name : reward.tank;
                showReward('tank', 1, `Новый танк разблокирован!`, reward.tank);
                showNotification(`Разблокирован ${tankName}!`, '#e74c3c');
            }
            break;
        case 'chromatic':
            // Grant chromatic variant based on player's 1000-choice
            try {
                const chosenKey = localStorage.getItem('trophyChoice_1000');
                if (!chosenKey) {
                    gems += 150;
                    showNotification('Нет выбранного танка на 1000 трофеев. +150 гемов вместо хроматического танка.', '#2ecc71');
                } else {
                    const tankName = (window.tankDescriptions && window.tankDescriptions[chosenKey]) ? window.tankDescriptions[chosenKey].name : chosenKey;
                    const chromKey = 'tankChromatic_' + chosenKey;
                    if (localStorage.getItem(chromKey)) {
                        gems += 200;
                        showNotification('У вас уже есть хроматическая версия! +200 гемов.', '#f1c40f');
                    } else {
                        localStorage.setItem(chromKey, 'true');
                        if (!unlockedTanks.includes(chosenKey)) unlockedTanks.push(chosenKey);
                        showNotification(`Разблокирована хроматическая версия ${tankName}!`, '#9b59b6');
                        saveProgress();
                    }
                }
            } catch (e) {
                console.error('Chromatic reward error', e);
            }
            break;
        default:
            console.warn('Unknown trophy reward type:', reward.type);
    }
    
    // Persist changes and refresh UI
    saveProgress();
    
    updateCoinDisplay();
    generateTrophyRoad(); // Refresh the display
}

// Simple notification system
function showNotification(text, color = '#ffffff') {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 50px;
        right: 20px;
        background: rgba(0,0,0,0.9);
        color: ${color};
        padding: 15px 20px;
        border-radius: 8px;
        font-weight: bold;
        z-index: 9999;
        box-shadow: 0 4px 15px rgba(0,0,0,0.5);
        animation: slideIn 0.3s ease;
    `;
    notification.textContent = text;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}


// Постоянный цикл обновления физики
window.frameCount = 0;
function gameLoop() {
    window.frameCount++;
    update();
    // draw is called via requestAnimationFrame usually, but here checking existing interval
}
setInterval(gameLoop, 1000/60);

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
    localStorage.setItem('tankSelected', selectedType);
    tankColor = '#0000FF';
    tank.color = tankColor;

    // Special properties for specific tanks
    setTankHP(selectedType);
    setTankSpeed(selectedType);
    if (selectedType === 'mirror') {
        tank.lastHitType = null;
        tank.lastHitTime = 0;
        tank.mirrorShieldActive = false;
        tank.mirrorShieldTimer = 0;
    }
    
    if (selectedType === 'toxic') {
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

// Function to update tank detail button moved up


function updateTankDetailButton(type) {
    const btn = document.getElementById('tankDetailSelect');
    if (!btn) return;

    if (unlockedTanks.includes(type)) {
        btn.textContent = 'Выбрать';
        btn.className = 'btn btn-primary';
        return;
    }

    const price = tankGemPrices[type] || 9999;
    btn.textContent = `Купить (${price} 💎)`;

    // Base buy style
    let classes = 'btn btn-buy';

    // Map tank type to rarity class
    const rarityMap = {
        'normal': 'common',
        'ice': 'rare', 'machinegun': 'rare', 'buckshot': 'rare',
        'fire': 'super', 'waterjet': 'super',
        'buratino': 'epic', 'musical': 'epic',
        'toxic': 'legendary', 'mirror': 'legendary',
        'illuminat': 'mythic', 'plasma': 'mythic', 'electric': 'mythic', 'time': 'imitator', 'imitator': 'imitator'
    };

    // If player has enough gems, color the buy button by rarity
    if (typeof gems !== 'undefined' && gems >= price) {
        const rarity = rarityMap[type] || 'common';
        classes += ' rarity-' + rarity;
    }

    btn.className = classes;
}

if (tankDetailClose) tankDetailClose.addEventListener('click', () => {
    hideTankDetail();
});

if (tankDetailSelect) tankDetailSelect.addEventListener('click', () => {
    if (unlockedTanks.includes(currentTankType)) {
        selectTank(currentTankType);
        // Close modal after selection
        if (document.getElementById('tankDetailModal')) {
            document.getElementById('tankDetailModal').style.display = 'none';
        }
    } else {
        // Try to buy (use styled modal instead of alert/confirm)
        const price = tankGemPrices[currentTankType];
        const showBuyModal = (title, message, canBuy) => {
            const modal = document.getElementById('buyConfirmModal');
            if (!modal) return;
            const tEl = document.getElementById('buyConfirmTitle');
            const mEl = document.getElementById('buyConfirmMessage');
            const buyBtn = document.getElementById('buyConfirmBtn');
            const cancelBtn = document.getElementById('buyCancelBtn');
            tEl.textContent = title;
            mEl.textContent = message;
            buyBtn.style.display = canBuy ? 'inline-block' : 'none';
            modal.style.display = 'flex';

            const cleanup = () => { buyBtn.onclick = null; cancelBtn.onclick = null; modal.style.display = 'none'; };

            buyBtn.onclick = () => {
                // perform purchase
                gems -= price;
                unlockedTanks.push(currentTankType);
                saveProgress();
                updateCoinDisplay();
                updateTankDetailButton(currentTankType);
                // Refresh character previews so the unlocked state is visible immediately
                if (typeof drawCharacterPreviews === 'function') drawCharacterPreviews();
                cleanup();
                // show success reward: display the new tank card
                if (typeof showReward === 'function') showReward('tank', 1, 'Танк успешно приобретен!', currentTankType);
            };
            cancelBtn.onclick = () => { cleanup(); };
        };

        if (gems >= price) {
            showBuyModal('Подтвердите покупку', `Купить ${tankDescriptions[currentTankType].name} за ${price} гемов?`, true);
        } else {
            showBuyModal('Недостаточно гемов', `У вас: ${gems}, нужно: ${price}`, false);
        }
    }
});

// Override showTankDetail after tanks.js loads
window.addEventListener('load', () => {
    const originalShowTankDetail = window.showTankDetail;
    window.showTankDetail = function(tankType) {
        currentTankType = tankType;
        window._currentDetailTankType = tankType; // track for Try button
        if (originalShowTankDetail) originalShowTankDetail(tankType);
        updateTankDetailButton(tankType);
    };

    // Try button — launch FFA trial with the previewed tank
    const tankDetailTry = document.getElementById('tankDetailTry');
    if (tankDetailTry) {
        tankDetailTry.addEventListener('click', () => {
            const trialTank = window._currentDetailTankType || 'normal';
            window._preTankType = tankType;
            tankType = trialTank;
            // Show try mode selection modal instead of launching directly
            const tryModeModal = document.getElementById('tryModeModal');
            if (tryModeModal) tryModeModal.style.display = 'flex';
        });
    }
    // Try mode: Battle button
    const tryModeBattle = document.getElementById('tryModeBattle');
    if (tryModeBattle) {
        tryModeBattle.addEventListener('click', () => {
            const tryModeModal = document.getElementById('tryModeModal');
            if (tryModeModal) tryModeModal.style.display = 'none';
            const detailModal = document.getElementById('tankDetailModal');
            const charModal = document.getElementById('characterModal');
            if (detailModal) detailModal.style.display = 'none';
            if (charModal) charModal.style.display = 'none';
            startGame('trial');
        });
    }
    // Try mode: Training button
    const tryModeTraining = document.getElementById('tryModeTraining');
    if (tryModeTraining) {
        tryModeTraining.addEventListener('click', () => {
            const tryModeModal = document.getElementById('tryModeModal');
            if (tryModeModal) tryModeModal.style.display = 'none';
            const detailModal = document.getElementById('tankDetailModal');
            const charModal = document.getElementById('characterModal');
            if (detailModal) detailModal.style.display = 'none';
            if (charModal) charModal.style.display = 'none';
            startGame('training');
        });
    }
    // Try mode: Cancel button
    const tryModeCancel = document.getElementById('tryModeCancel');
    if (tryModeCancel) {
        tryModeCancel.addEventListener('click', () => {
            const tryModeModal = document.getElementById('tryModeModal');
            if (tryModeModal) tryModeModal.style.display = 'none';
            // Restore tank type if it was changed
            if (window._preTankType) { tankType = window._preTankType; window._preTankType = null; }
        });
    }
    // Training exit button — both click (desktop) and touchend (mobile)
    const trainingExitBtn = document.getElementById('trainingExitBtn');
    if (trainingExitBtn) {
        function _doTrainingExit(e) {
            e.preventDefault();
            trainingExitBtn.style.display = 'none';
            // Restore tank type
            if (window._preTankType) { tankType = window._preTankType; window._preTankType = null; }
            saveProgress();
            location.reload();
        }
        trainingExitBtn.addEventListener('click', _doTrainingExit);
        trainingExitBtn.addEventListener('touchend', _doTrainingExit, { passive: false });
    }
});
function unlockRandomTankNew(fromSuper = false, options = {}) {
    const { suppressRewardModal = false } = options;
    
    // 1. Pick rarity
    const rarity = getRarity();
    
    // 2. Pick tank from that rarity
    const tanksInRarity = allTanksList.filter(t => tankRarityMap[t] === rarity);
    const t = tanksInRarity.length > 0 
        ? tanksInRarity[Math.floor(Math.random() * tanksInRarity.length)]
        : allTanksList[Math.floor(Math.random() * allTanksList.length)]; // fallback

    const tDesc = tankDescriptions[t] ? tankDescriptions[t].name : t.toUpperCase();
    const rarityLabel = rarity.replace('_', ' ').toUpperCase();

    if (!unlockedTanks.includes(t)) {
        unlockedTanks.push(t);
        saveProgress();
        if (!suppressRewardModal) showReward('tank', 1, `Unlocked ${rarityLabel} tank!`, t);
        updateTankDetailButton(t);
        return { type: 'tank', tankType: t, desc: `${rarityLabel} Tank Unlocked!`, icon: '🚜', rarity: rarity };
    } else {
        const price = tankGemPrices[t] || 0;
        let comp = price > 0 ? Math.floor(price * 0.5) : (fromSuper ? 50 : 25);
        if (rarity === 'legendary') comp = Math.max(comp, 100);
        if (rarity === 'imitator') comp = Math.max(comp, 150);
        if (rarity === 'mythic') comp = Math.max(comp, 200);

        gems += comp;
        saveProgress();
        if (!suppressRewardModal) showReward('gems', comp, `Duplicate ${rarityLabel} tank ${tDesc} converted to Gems!`);
        return { type: 'gems', amount: comp, desc: `Duplicate ${rarityLabel} tank converted to Gems!`, icon: '💎', rarity: rarity };
    }
}

// Initialize trophy system on game load
initializeTrophySystem();
updateCoinDisplay();


/* --- TANK CHOICE MODAL LOGIC --- */

let choiceRewardData = null;
let choiceRewardIndex = null;
let selectedChoiceIdx = -1;

function openChoiceModal(reward, index) {
    choiceRewardData = reward;
    choiceRewardIndex = index;
    selectedChoiceIdx = -1;
    
    const choiceModal = document.getElementById('choiceModal');
    if (!choiceModal) return;
    
    choiceModal.style.display = 'flex';
    document.getElementById('choiceConfirmation').style.display = 'none';
    const cancelCont = document.getElementById('choiceCancelContainer');
    if (cancelCont) cancelCont.style.display = 'block';
    
    // Reset styles
    const opt1El = document.getElementById('choiceOption1');
    const opt2El = document.getElementById('choiceOption2');
    if (opt1El) opt1El.style.border = '2px solid transparent';
    if (opt2El) opt2El.style.border = '2px solid transparent';

    const opt1 = reward.options[0];
    const opt2 = reward.options[1];
    
    // Use descriptions
    const t1 = (window.tankDescriptions && window.tankDescriptions[opt1]) ? window.tankDescriptions[opt1] : {name: opt1, description: ''};
    const t2 = (window.tankDescriptions && window.tankDescriptions[opt2]) ? window.tankDescriptions[opt2] : {name: opt2, description: ''};
    
    const name1El = document.getElementById('choiceName1');
    if (name1El) name1El.textContent = t1.name;
    const name2El = document.getElementById('choiceName2');
    if (name2El) name2El.textContent = t2.name;
    
    // Draw previews
    const cvs1 = document.getElementById('choiceCanvas1');
    if (cvs1) {
        const ctx1 = cvs1.getContext('2d');
        ctx1.clearRect(0,0,cvs1.width,cvs1.height);
        if (typeof drawTankOn === 'function') drawTankOn(ctx1, 50, 50, 38, 38, '#3498db', -Math.PI/2, 1, opt1);
    }
    
    const cvs2 = document.getElementById('choiceCanvas2');
    if (cvs2) {
        const ctx2 = cvs2.getContext('2d');
        ctx2.clearRect(0,0,cvs2.width,cvs2.height);
        if (typeof drawTankOn === 'function') drawTankOn(ctx2, 50, 50, 38, 38, '#3498db', -Math.PI/2, 1, opt2);
    }
}

window.selectChoiceOption = function(idx) {
    if (!choiceRewardData) return;
    
    selectedChoiceIdx = idx;
    
    // Highlight
    const opt1El = document.getElementById('choiceOption1');
    const opt2El = document.getElementById('choiceOption2');
    if (opt1El) opt1El.style.border = (idx === 0) ? '2px solid #f1c40f' : '2px solid transparent';
    if (opt2El) opt2El.style.border = (idx === 1) ? '2px solid #f1c40f' : '2px solid transparent';
    
    // Show confirmation
    document.getElementById('choiceConfirmation').style.display = 'block';
    const cancelCont = document.getElementById('choiceCancelContainer');
    if (cancelCont) cancelCont.style.display = 'none';
    
    const tankId = choiceRewardData.options[idx];
    const tData = (window.tankDescriptions && window.tankDescriptions[tankId]) ? window.tankDescriptions[tankId] : {name: tankId, description: ''};
    
    document.getElementById('choiceConfirmTitle').textContent = 'Вы уверены, что хотите выбрать ' + tData.name + '?'; // Fixed string
    document.getElementById('choiceConfirmDesc').textContent = tData.description || 'Нет описания';
}

window.cancelChoiceSelection = function() {
    selectedChoiceIdx = -1;
    document.getElementById('choiceOption1').style.border = '2px solid transparent';
    document.getElementById('choiceOption2').style.border = '2px solid transparent';
    document.getElementById('choiceConfirmation').style.display = 'none';
    document.getElementById('choiceCancelContainer').style.display = 'block';
}

window.confirmChoice = function() {
    if (selectedChoiceIdx === -1 || !choiceRewardData) return;

    const chosenOption = choiceRewardData.options[selectedChoiceIdx];

    // If this choice is a title selection (2000), handle separately
    if (choiceRewardData.subType === 'title') {
        try {
            localStorage.setItem('playerTitle', chosenOption);
        } catch (e) {}
        showNotification('Вы выбрали звание: ' + (chosenOption === 'legend' ? 'ЛЕГЕНДА' : 'ЧЕМПИОН'), '#f1c40f');
        if (choiceRewardIndex !== null && choiceRewardIndex !== undefined) {
            if (!claimedRewards.includes(choiceRewardIndex)) claimedRewards.push(choiceRewardIndex);
            saveProgress();
        }
        document.getElementById('choiceModal').style.display = 'none';
        generateTrophyRoad();
        return;
    }

    // Persist the player's choice for later reference (e.g., chromatic reward at 1600)
    if (choiceRewardData && typeof choiceRewardData.trophies !== 'undefined') {
        try { localStorage.setItem('trophyChoice_' + choiceRewardData.trophies, chosenOption); } catch (e) {}
    }

    // Process as a tank reward by default
    if (unlockedTanks.includes(chosenOption)) {
         gems += 50; // Compensation
         showNotification('У вас уже есть этот танк! +50 гемов', '#f1c40f');
    } else {
         unlockedTanks.push(chosenOption);
         const tData = (window.tankDescriptions && window.tankDescriptions[chosenOption]) ? window.tankDescriptions[chosenOption] : {name: chosenOption};
         showNotification('Вы получили ' + tData.name + '!', '#2ecc71');
    }

    // Mark as claimed
    if (choiceRewardIndex !== null && choiceRewardIndex !== undefined) {
        if (!claimedRewards.includes(choiceRewardIndex)) {
            claimedRewards.push(choiceRewardIndex);
        }
        saveProgress();
    }

    // Close modal
    document.getElementById('choiceModal').style.display = 'none';
    generateTrophyRoad();
}
