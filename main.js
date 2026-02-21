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
let enemies = [];
let allies = [];
let gameState = 'menu';
let currentMode = 'menu';
// Throttling AI counters
let globalPathBudget = 0;
const MAX_PATH_BUDGET = 2; // max A* searches per frame
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
// Unlocked tanks list
let unlockedTanks = JSON.parse(localStorage.getItem('tankUnlockedTanks')) || ['normal'];

const tankGemPrices = {
    'normal': 0,
    'ice': 30,
    'fire': 50,
    'toxic': 120, // Updated
    'plasma': 150, // Updated
    'buratino': 100, // Updated
    'musical': 100, // New
    'illuminat': 120, // New
    'mirror': 150, // New
    'time': 200 // Временной танк (Temporal / Time Tank)
};

function saveProgress() {
    localStorage.setItem('tankCoins', coins);
    localStorage.setItem('tankGems', gems);
    localStorage.setItem('tankUnlockedTanks', JSON.stringify(unlockedTanks));
}

// Camera follow flag
let cameraFollow = false;

// Тип танка игрока
let tankType = localStorage.getItem('tankSelected') || 'normal';

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

// Apply saved tank type properties immediately if needed
if (tankType === 'fire') tank.hp = 6;
else if (tankType === 'musical') tank.hp = 4;

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
};
window.onkeyup = (e) => keys[e.code] = false;
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
    tank.turretAngle = 0; tank.hp = (tankType === 'fire' ? 6 : tankType === 'musical' ? 4 : 3); tank.artilleryMode = false; tank.artilleryTimer = 0; enemies = []; bullets = []; particles = [];
    navNeedsRebuild = true;
    lastResultState = null;
    syncResultOverlay('playing');

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
        tank.x = 120; tank.y = 120; tank.team = 0; tank.hp = (tankType === 'fire' ? 6 : tankType === 'musical' ? 4 : 3); tank.alive = true; tank.respawnTimer = 0; tank.respawnCount = 0;
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
// War mode button (added dynamically to modal)
const modeWarBtn = document.createElement('button');
modeWarBtn.id = 'modeWar';
modeWarBtn.textContent = 'Война (2x10)';
modeWarBtn.className = 'btn btn-mode';
modeWarBtn.style.width = '80%';
if (modeModal) {
    // find the inner button group (the second div inside the modal container)
    const container = modeModal.querySelector('div.modal-box');
    const btnGroup = container ? container.querySelector('div') : null;
    if (btnGroup) {
        // insert the War button before the Cancel button
        const cancelBtn = btnGroup.querySelector('#modeCancel');
        if (cancelBtn) btnGroup.insertBefore(modeWarBtn, cancelBtn);
        else btnGroup.appendChild(modeWarBtn);
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
const buyOmegaContainer = document.getElementById('buyOmegaContainer');
const shopCancel = document.getElementById('shopCancel');
const characterCancel = document.getElementById('characterCancel');
if (shopBtn) shopBtn.addEventListener('click', () => { if (shopModal) shopModal.style.display = 'flex'; });
if (characterBtn) characterBtn.addEventListener('click', () => { if (characterModal) { characterModal.style.display = 'flex'; drawCharacterPreviews(); } });
if (shopCancel) shopCancel.addEventListener('click', () => { if (shopModal) shopModal.style.display = 'none'; });
if (characterCancel) characterCancel.addEventListener('click', () => { if (characterModal) characterModal.style.display = 'none'; });

// Command modal handlers
const commandModal = document.getElementById('commandModal');
const commandExecute = document.getElementById('commandExecute');
const commandCancel = document.getElementById('commandCancel');
if (commandExecute) commandExecute.addEventListener('click', () => {
    processDevCommand(commandInput.value);
    commandInput.value = '';
    if (commandModal) commandModal.style.display = 'none';
});

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

// Result overlay elements (win / lose)
const resultOverlay = document.getElementById('resultOverlay');
const resultStatus = document.getElementById('resultStatus');
const resultModeLabel = document.getElementById('resultMode');
const resultEmblem = document.getElementById('resultEmblem');
const resultHeadline = document.getElementById('resultHeadline');
const resultMessage = document.getElementById('resultMessage');
const resultReward = document.getElementById('resultReward');
const resultRestart = document.getElementById('resultRestart');
const resultToMenu = document.getElementById('resultToMenu');
let lastResultState = null;

function describeMode(mode) {
    if (mode === 'war') return 'Война 2x10';
    if (mode === 'team') return 'Командный';
    if (mode === 'single') return 'Одиночный';
    return 'Свободный бой';
}

function syncResultOverlay(state = gameState) {
    if (!resultOverlay) return;
    if (state === lastResultState) return;

    if (state === 'win' || state === 'lose') {
        const isWin = state === 'win';
        const rewardText = isWin
            ? (currentMode === 'single' ? '+25 монет'
                : currentMode === 'team' ? '+40 монет'
                : currentMode === 'war' ? '+50 монет'
                : '+0 монет')
            : 'Попробуй другую тактику';

        resultOverlay.style.display = 'flex';
        
        // Update text content
        if (resultStatus) {
            resultStatus.textContent = isWin ? 'ПОБЕДА' : 'ПОРАЖЕНИЕ';
            resultStatus.style.color = isWin ? '#2ecc71' : '#e74c3c'; // Green or Red
        }
        
        if (resultModeLabel) resultModeLabel.textContent = describeMode(currentMode);
        
        if (resultEmblem) {
            resultEmblem.textContent = isWin ? '🏆' : '☠️';
        }

        if (resultHeadline) {
            resultHeadline.textContent = isWin ? 'ЗОНА ОЧИЩЕНА' : 'БОЙ ПРОИГРАН';
            resultHeadline.style.color = isWin ? '#ffffff' : '#e74c3c';
        }

        if (resultMessage) {
            const messagesByMode = {
                single: {
                    win: [
                        "Одиночная зачистка: враги выведены из строя.",
                        "Ты справился в одиночку — впечатляющая победа.",
                        "Один против многих — и ты победил.",
                        "Соло-операция успешна. Награда начислена.",
                        "Мастер-одиночка: зона под контролем.",
                        "Ты показал классную индивидуальную игру.",
                        "Одна цель — одна победа. Отлично.",
                        "Соло-удар прошёл точно по плану.",
                        "Ты вырвался вперёд и закрыл бой в одиночку.",
                        "Жёсткая сессия — и ты с триумфом.",
                        "Одиночный рейд завершён успешно.",
                        "Твоя точность решила исход боя.",
                        "Ты один — и достаточно, чтобы победить.",
                        "Идеальная реализация соло-плана.",
                        "Соло: скорость и точность — твои козыри.",
                        "Один игрок, одна победа. Блестяще.",
                        "Ты разнес оппонентов поодиночке.",
                        "Умелая манёвренность принесла результат.",
                        "Одиночная миссия — выполнена.",
                        "Победа в одиночку — заслуженный триумф."
                    ],
                    lose: [
                        "Одиночный удар не удался — возвращайся сильнее.",
                        "Слишком многое взвалил на себя. Попробуй иначе.",
                        "Один в поле — не воин. Подготовься и вернись.",
                        "Поражение в соло — ценный опыт.",
                        "Тебе не хватило огневой мощи. Прокачайся.",
                        "Одинокая атака промахнулась. Проанализируй.",
                        "Соло-подход сегодня не прошёл. Будь хитрее.",
                        "Одинокие рейды требуют риска — риск не оправдался.",
                        "Твой транспорт повреждён — отремонтируй и возвращайся.",
                        "Неудача в соло — повод улучшить билд.",
                        "План одного игрока оказался слабым. Переделай.",
                        "Один против нескольких — в следующий раз действуй иначе.",
                        "Используй окружение и повтори попытку.",
                        "Одинокая ошибка стоила боя. Учти это.",
                        "Поражение — шанс доработать стратегию.",
                        "Тебе не хватило поддержки — возьми её в следующий раз.",
                        "Слишком опрометчиво — в следующий раз осторожнее.",
                        "Соло-атака прошла неудачно. Подготовься.",
                        "Одинокий рейд провален, но опыт получен.",
                        "Твоя машина пострадала — чинь и возвращайся."
                    ]
                },
                team: {
                    win: [
                        "Команда сработала чётко — совместная победа!",
                        "Отличная координация, ребята — фронт очищен.",
                        "Командный удар разрушил оборону соперника.",
                        "Слаженные действия привели к успеху.",
                        "Ваша команда показала высший пилотаж.",
                        "Командная тактика сработала идеально.",
                        "Благодаря согласованности — победа.",
                        "Команда держала строй и победила.",
                        "Обмен огнём и поддержка — результат налицо.",
                        "Командная победа: распределение ролей сработало.",
                        "Все выполнили свою задачу, отличная работа.",
                        "Грамотная поддержка товарищей принесла успех.",
                        "Командная синергия — ключ к победе.",
                        "Ваша группа показала невероятную выдержку.",
                        "Слаженность действий — и победа ваша.",
                        "Командный успех. Так держать!",
                        "Вы объединились и разнесли врага.",
                        "Тактическая кооперация принесла результат.",
                        "Коллективная работа — отличная победа.",
                        "Команда действовала как единый механизм."
                    ],
                    lose: [
                        "Потеряли синхрон — утратили преимущество.",
                        "Нужно лучше распределять роли в команде.",
                        "Команда растерялась — проанализируйте тактику.",
                        "Не хватило взаимной поддержки — обсудите план.",
                        "Координация подвела. В следующий раз лучше.",
                        "Разногласия стоили боя. Согласуйте действия.",
                        "Ошибки в коммуникации привели к поражению.",
                        "Команда слишком растянулась — держите ближе.",
                        "Нужно больше фокуса на общую цель.",
                        "Слабая поддержка в точке прорыва — учесть на будущее.",
                        "Команда потеряла темп — восстановите строй.",
                        "Не сработали комбинированные атаки — потренируйтесь.",
                        "Поражение — повод улучшить взаимодействие.",
                        "Координация и план — вот что нужно улучшить.",
                        "Командная тактика дала трещину. Исправьте ошибки.",
                        "Были шансы, но не использовали их как команда.",
                        "Команда проиграла из-за плохой коммуникации.",
                        "Обсудите роли и стратегии — вернётесь сильнее.",
                        "Поддержка не пришла вовремя — работайте над этим.",
                        "Поражение — шаг к лучшей командной игре."
                    ]
                },
                war: {
                    win: [
                        "Война окончена — наша победа на поле боя.",
                        "Стратегическое превосходство обеспечило успех.",
                        "Твои действия помогли захватить ключевые позиции.",
                        "Массовая атака завершилась триумфом.",
                        "Война под контролем — отличная работа.",
                        "Штурм прошёл успешно, трофеи начислены.",
                        "Ты внёс решающий вклад в общую победу.",
                        "Боевые операции выполнены, фронт чист.",
                        "Грамотное командование и решительность — победа.",
                        "Мы сокрушили их вражеские силы.",
                        "Тактический прорыв открывает новые возможности.",
                        "Выдержка и дисциплина дали результат.",
                        "Коллективный усилие привело к победе в войне.",
                        "Масштабная операция завершена успешно.",
                        "Все подразделения справились великолепно.",
                        "Это был решающий манёвр — молодцы.",
                        "Твоя роль в операции была ключевой.",
                        "Фронт удержан — миссия выполнена.",
                        "Слаженная кампания принесла плоды.",
                        "Война выиграна — честь и хвала."
                    ],
                    lose: [
                        "Война обернулась не в нашу пользу на этом участке.",
                        "Широкомасштабная операция провалилась — анализируем.",
                        "Потери велики — время для перегруппировки.",
                        "Тактический просчёт стоил нам боя — учтём.",
                        "Не выдержали натиск. Вернёмся с другим планом.",
                        "Командные ресурсы были не на должном уровне.",
                        "Ошибка в логистике повлияла на исход.",
                        "Нужно усилить поддержку и переформатировать атаку.",
                        "Масштабный провал — важные уроки для штаба.",
                        "Поражение в кампании временно — готовим контрмеры.",
                        "Непродуманная экспансия обернулась против нас.",
                        "Слишком большие риски — и они окупились не в нашу пользу.",
                        "Тыл был уязвим — укрепим оборону.",
                        "Штаб сделает выводы и обновит стратегию.",
                        "Поражение больно, но сделает нас сильнее.",
                        "Не хватило резервов — пополним и вернёмся.",
                        "Они оказались подготовленнее — работаем над ошибками.",
                        "Поражение — стимул для новой кампании.",
                        "Тактическая ошибка показала слабые места.",
                        "Мы проиграли бой, но не войну — готовимся."
                    ]
                }
            };

            const modeSet = messagesByMode[currentMode] || messagesByMode.single;
            const messages = isWin ? (modeSet.win || []) : (modeSet.lose || []);
            if (messages.length > 0) {
                resultMessage.textContent = messages[Math.floor(Math.random() * messages.length)];
            }
        }

        if (resultReward) resultReward.textContent = rewardText;
        
    } else {
        resultOverlay.style.display = 'none';
    }

    lastResultState = state;
}
window.syncResultOverlay = syncResultOverlay;

if (resultRestart) resultRestart.addEventListener('click', () => location.reload());
if (resultToMenu) resultToMenu.addEventListener('click', () => location.reload());
syncResultOverlay('menu');

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
}

function updateContainerFlowStage(stage) {
    if (!containerFlowType || !containerFlowText || !containerFlowPreview) return;
    const isBronze = containerFlowType === 'bronze';
    const isOmega = containerFlowType === 'omega';
    
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
            containerFlowPreview.src = 'png/omega-cont.png';
            containerFlowText.textContent = 'Нажми на ОМЕГА контейнер!';
        } else {
            containerFlowPreview.src = isBronze ? 'png/cont1.png' : 'png/super-cont.png';
            containerFlowText.textContent = isBronze
                ? 'Нажми на контейнер, чтобы открыть'
                : 'Нажми на контейнер, чтобы открыть';
        }
    } else {
        if (isOmega) {
            containerFlowPreview.src = 'png/omega-cont2.png';
            containerFlowText.textContent = 'ОМЕГА контейнер взрывается наградами!';
        } else {
            containerFlowPreview.src = isBronze ? 'png/cont2.png' : 'png/super-cont2.png';
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
        const iconText = reward.icon || (reward.type === 'gems' ? '💎' : reward.type === 'tank' ? '�' : '💰');
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
    const price = type === 'bronze' ? 100 : (type === 'omega' ? 2000 : 500);
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
    const price = currentType === 'bronze' ? 100 : (currentType === 'omega' ? 2000 : 500);
    if (coins < price) {
        alert('Недостаточно монет!');
        closeContainerFlow();
        return;
    }
    coins -= price;
    updateCoinDisplay();
    const dropCount = currentType === 'bronze' ? 3 : (currentType === 'omega' ? 7 : 5);
    const rewards = [];
    // Ensure we create unique objects for each reward
    for (let i = 0; i < dropCount; i++) {
        let reward;
        if (currentType === 'omega') {
            reward = openOmegaContainer({ suppressRewardModal: true });
        } else {
            reward = currentType === 'bronze'
                ? openContainer({ suppressRewardModal: true })
                : openSuperContainer({ suppressRewardModal: true });
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

if (containerFlowPreview) containerFlowPreview.addEventListener('click', handleContainerConfirm);
if (containerFlowText) containerFlowText.addEventListener('click', handleContainerConfirm);
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
        const tankTypes = ['normal','ice','fire','buratino','toxic','plasma','musical', 'illuminat', 'mirror'];
        const tt = tankTypes[Math.floor(Math.random() * tankTypes.length)];
        const typeColors = { normal: '#8B0000', ice: '#00BFFF', fire: '#FF4500', buratino: '#6E38B0', toxic: '#27ae60', plasma: '#8e44ad', musical: '#00ffff', illuminat: '#f39c12', mirror: '#bdc3c7' };
        enemies.push({
            x: p.x, y: p.y, w: 38, h: 38,
            color: typeColors[tt] || ['#8B0000', '#006400', '#FFD700'][i],
            tankType: tt,
            hp: (tt === 'fire') ? 6 : (tt === 'musical') ? 4 : (tt === 'illuminat' || tt === 'mirror') ? 3 : 3,
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
                tankType: (['normal','ice','fire','buratino','toxic','plasma','musical','illuminat', 'mirror'])[Math.floor(Math.random()*9)],
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
            const allyTypes = ['normal','ice','fire','buratino','toxic','plasma','musical', 'illuminat', 'mirror'];
            const allyType = allyTypes[Math.floor(Math.random()*allyTypes.length)];
            allies.push({ x: playerCorner.x + 44, y: playerCorner.y + 10, w: 38, h: 38, color: tank.color, tankType: allyType, hp: (allyType === 'fire') ? 6 : (allyType === 'musical') ? 4 : (allyType === 'illuminat' || allyType === 'mirror') ? 3 : 3, turretAngle:0, baseAngle:0, speed: 2.5, trackOffset:0, alive:true, team:0, stuckCount:0, fireCooldown:0, dodgeAccuracy: 0.78 + Math.random()*0.15, paralyzed: false, paralyzedTime: 0 });

    const enemyColors = ['#006400', '#FFD700', '#00BFFF'];
    // spawn other corners with 2 enemies each; clear spawn areas first
    for (let ci = 1; ci < 4; ci++) {
        const base = corners[ci];
        clearArea(base.x - 48, base.y - 48, 96, 96);
        for (let k = 0; k < 2; k++) {
            const tankTypes = ['normal','ice','fire','buratino','toxic','plasma','musical', 'illuminat', 'mirror'];
            const tt = tankTypes[Math.floor(Math.random() * tankTypes.length)];
            const typeColor = { normal: '#8B0000', ice: '#00BFFF', fire: '#FF4500', buratino: '#6E38B0', toxic: '#27ae60', plasma: '#8e44ad', musical: '#00ffff', illuminat: '#f39c12', mirror: '#bdc3c7' };
            // Fix: Use findFreeSpot to ensure enemies spawn inside map boundaries (especially for corners)
            // base.x/y might be near edge, and +k*44 might push out. findFreeSpot clamps efficiently.
            let sx = base.x + (k === 0 ? 0 : (ci===1 ? -44 : (ci===2 ? 44 : -44))); // try to offset inwards roughly
            let sy = base.y + (k === 0 ? 0 : (ci===1 ? 28 : (ci===2 ? -28 : -28))); 
            
            const p = findFreeSpot(sx, sy, 38, 38, 200, 20);
            if (p) {
                enemies.push({ x: p.x, y: p.y, w:38, h:38, color: typeColor[tt] || enemyColors[(ci-1)%enemyColors.length], tankType: tt, hp: (tt === 'fire')?6:(tt === 'musical')?4:(tt === 'mirror' || tt === 'illuminat')?3:3, turretAngle:0, baseAngle:0, speed:2.5, trackOffset:0, alive:true, team:ci, stuckCount:0, fireCooldown:0, dodgeAccuracy: 0.7 + Math.random()*0.25, paralyzed: false, paralyzedTime: 0 });
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
        tank.x = p0.x; tank.y = p0.y; tank.team = 0; tank.hp = (tankType === 'fire' ? 6 : tankType === 'musical' ? 4 : 3); tank.alive = true; tank.respawnTimer = 0;
    } else {
        // Absolute fallback if findFreeSpot returns null for player
        tank.x = teamSpawns[0].x; tank.y = teamSpawns[0].y; tank.team = 0; tank.hp = (tankType === 'fire' ? 6 : tankType === 'musical' ? 4 : 3); tank.alive = true; tank.respawnTimer = 0;
    }

    // spawn allies (team 0) - 9 bots + player = 10
    for (let i = 0; i < 9; i++) {
            const rx = teamSpawns[0].x + 30 + (i % 3) * 80 + (Math.random() - 0.5) * 30;
            const ry = teamSpawns[0].y + 30 + Math.floor(i/3) * 80 + (Math.random() - 0.5) * 30;
        const pos = findFreeSpot(rx, ry, 38, 38, 600, 24);
        if (pos) {
            const allyTypes = ['normal','ice','fire','buratino','toxic','plasma','musical','illuminat', 'mirror'];
            const allyT = allyTypes[Math.floor(Math.random()*allyTypes.length)];
            allies.push({ x: pos.x, y: pos.y, w:38, h:38, color: tank.color || '#00BFFF', tankType: allyT, hp: (allyT === 'fire') ? 6 : (allyT === 'musical') ? 4 : (allyT === 'illuminat' || allyT === 'mirror') ? 3 : 3, turretAngle:0, baseAngle:0, speed: 2.5, trackOffset:0, alive:true, team:0, fireCooldown:0, stuckCount:0, dodgeAccuracy:0.75 + Math.random()*0.2, respawnCount:0, paralyzed: false, paralyzedTime: 0 });
        }
    }

    // spawn enemies (team 1) - 10 bots
    for (let i = 0; i < 10; i++) {
        const rx = teamSpawns[1].x - 30 - (i % 4) * 80 + (Math.random() - 0.5) * 40;
        const ry = teamSpawns[1].y - 30 - Math.floor(i/4) * 80 + (Math.random() - 0.5) * 40;
        const pos = findFreeSpot(rx, ry, 38, 38, 600, 24);
        if (pos) {
            const tankTypes = ['normal','ice','fire','buratino','toxic','plasma','musical','illuminat', 'mirror'];
            const tt = tankTypes[Math.floor(Math.random() * tankTypes.length)];
            const typeColor = { normal: '#8B0000', ice: '#00BFFF', fire: '#FF4500', buratino: '#6E38B0', toxic: '#27ae60', plasma: '#8e44ad', musical: '#00ffff', illuminat: '#f39c12', mirror: '#bdc3c7' };
            enemies.push({ x: pos.x, y: pos.y, w:38, h:38, color:typeColor[tt] || '#B22222', tankType: tt, hp:(tt==='fire')?6:(tt==='musical')?4:(tt==='illuminat'||tt==='mirror')?3:3, turretAngle:0, baseAngle:0, speed:2.5, trackOffset:0, alive:true, team:1, fireCooldown:0, stuckCount:0, dodgeAccuracy:0.7 + Math.random()*0.2, respawnCount:0, paralyzed: false, paralyzedTime: 0 });
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

function getRayRectDistance(x, y, angle, maxDist, rect) {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    let minD = maxDist;
    // 4 segments of rectangle
    const x1 = rect.x, y1 = rect.y;
    const x2 = rect.x + rect.w, y2 = rect.y + rect.h;
    
    // Check intersection with each wall segment
    // Left: x1, y1 to x1, y2
    // Top: x1, y1 to x2, y1
    // Right: x2, y1 to x2, y2
    // Bottom: x1, y2 to x2, y2
    const segs = [
        [x1, y1, x1, y2], [x1, y1, x2, y1], [x2, y1, x2, y2], [x1, y2, x2, y2]
    ];
    
    // Ray as line segment
    const rx2 = x + cos*maxDist;
    const ry2 = y + sin*maxDist;

    for(let i=0; i<4; i++) {
        const sx1 = segs[i][0], sy1 = segs[i][1], sx2 = segs[i][2], sy2 = segs[i][3];
        const denom = (x - rx2) * (sy1 - sy2) - (y - ry2) * (sx1 - sx2);
        if (denom !== 0) {
            const t = ((x - sx1) * (sy1 - sy2) - (y - sy1) * (sx1 - sx2)) / denom;
            const u = -((x - rx2) * (y - sy1) - (y - ry2) * (x - sx1)) / denom;
            if (t >= 0 && t <= 1 && u >= 0 && u <= 1) {
                const dist = t * maxDist;
                if (dist < minD) minD = dist;
            }
        }
    }
    return minD;
}

function lineIntersectsRect(x1, y1, x2, y2, rx, ry, rw, rh) {
    // Check if line intersects rectangle
    const left = rx, right = rx + rw, top = ry, bottom = ry + rh;
    // Check if either end is inside
    if (x1 >= left && x1 <= right && y1 >= top && y1 <= bottom) return true;
    if (x2 >= left && x2 <= right && y2 >= top && y2 <= bottom) return true;
    // Check intersections with edges
    if (lineIntersectsLine(x1, y1, x2, y2, left, top, right, top)) return true; // top
    if (lineIntersectsLine(x1, y1, x2, y2, right, top, right, bottom)) return true; // right
    if (lineIntersectsLine(x1, y1, x2, y2, right, bottom, left, bottom)) return true; // bottom
    if (lineIntersectsLine(x1, y1, x2, y2, left, bottom, left, top)) return true; // left
    return false;
}

function lineIntersectsLine(x1, y1, x2, y2, x3, y3, x4, y4) {
    const denom = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
    if (denom === 0) return false;
    const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / denom;
    const u = -((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)) / denom;
    return t >= 0 && t <= 1 && u >= 0 && u <= 1;
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
        const inflate = 2;
        const rect = { x: tx - inflate, y: ty - inflate, w: (entity.w || 0) + inflate * 2, h: (entity.h || 0) + inflate * 2 };
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

// Быстрая оценка свободного расстояния вперед по траектории
function clearanceAhead(entity, angle, maxDist, step = 8) {
    const cx = entity.x + (entity.w || 0) / 2;
    const cy = entity.y + (entity.h || 0) / 2;
    const effStep = Math.max(6, Math.min(step, (entity.w || 16) * 0.4));
    let lastFree = 0;
    for (let d = effStep; d <= maxDist; d += effStep) {
        const px = cx + Math.cos(angle) * d;
        const py = cy + Math.sin(angle) * d;
        const rect = { x: px - (entity.w || 0) / 2, y: py - (entity.h || 0) / 2, w: entity.w, h: entity.h };
        // Canvas bounds
        if (rect.x < 0 || rect.y < 0 || rect.x + rect.w > worldWidth || rect.y + rect.h > worldHeight) return lastFree;
        let hit = false;
        for (const obj of objects) {
            if (checkRectCollision(rect, obj)) { hit = true; break; }
        }
        if (hit) return lastFree;
        lastFree = d;
    }
    return Math.min(maxDist, lastFree || maxDist);
}

// Подруливание: выбираем угол с наибольшей свободной дистанцией рядом с целевым
function steerAroundObstacles(entity, desiredAngle, dist) {
    const samples = [0, Math.PI / 8, -Math.PI / 8, Math.PI / 4, -Math.PI / 4, Math.PI / 2, -Math.PI / 2];
    let bestAng = desiredAngle;
    let bestScore = -Infinity;
    let bestClear = 0;
    for (const off of samples) {
        const a = desiredAngle + off;
        const clear = clearanceAhead(entity, a, dist);
        const devPenalty = Math.abs(off) * navCell * 0.25;
        const score = clear - devPenalty;
        if (score > bestScore) {
            bestScore = score;
            bestAng = a;
            bestClear = clear;
        }
    }
    const trimmedDist = bestClear < dist ? Math.max(bestClear * 0.9, dist * 0.4) : dist;
    return { angle: bestAng, dist: trimmedDist };
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
        // Mirror Shield Protection: No splash damage (works for any tank)
        if (t.mirrorShieldActive) return;

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
    objects.push({ type: 'gas', x: bullet.x, y: bullet.y, radius: radius, life: durationTicks, maxLife: durationTicks, color: 'rgba(100,220,100,0.25)', owner: bullet.owner, ownerTeam: bullet.team, isMega: mega });
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
        // Mirror Shield Protection check (works for any tank)
        if (t.mirrorShieldActive) return;

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

// Helper for RNG
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

const allTanksList = ['ice', 'fire', 'buratino', 'toxic', 'plasma', 'musical', 'illuminat', 'mirror', 'time'];
const tankRarityMap = {
    'ice': 'rare',
    'fire': 'super_rare',
    'buratino': 'epic',
    'musical': 'epic',
    'toxic': 'legendary',
    'mirror': 'legendary',
    'illuminat': 'mythic',
    'plasma': 'mythic',
    'time': 'chromatic'
};

const rarityChances = {
    'rare': 40,
    'super_rare': 25,
    'epic': 15,
    'legendary': 10,
    'chromatic': 5,
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
    const order = ['rare', 'super_rare', 'epic', 'legendary', 'chromatic', 'mythic'];
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
        setTimeout(() => { modal.style.display = 'none'; }, 300);
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
            if (tankType === 'time') {
               // For Chromatic/Time, we need a CANVAS animation to match the menu exactly
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
            if (tankType === 'time') {
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
    // Optimization: Limit max A* iterations to prevent long freezes on large maps
    // Was navCols * navRows * 4 (dangerous!). Cap at 1000 steps.
    const maxIter = 1000; 
    let iter = 0;
    const startTime = Date.now();
    
    while (open.size && iter++ < maxIter) {
        // Safety Break: Don't spend more than 3ms on a single pathfinding call
        if (iter % 50 === 0 && (Date.now() - startTime > 3)) return null;

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
    // Optimization: Check the full distance first if short, otherwise step by entity size
    // Walls are grid based (usually > 20px), bullets are small but tanks are huge (38px).
    // Stepping by 1px is too slow. Stepping by 1/2 tank size is safe enough.
    const step = Math.min(dist, 10);
    const steps = Math.ceil(dist / step);
    const dxStep = Math.cos(angle) * step;
    const dyStep = Math.sin(angle) * step;
    
    // Optimization: Pre-screen destination to avoid loop if possible
    // Only if no physics interaction (pushing) is needed, but we need to push boxes.
    // So we iterate steps.

    for (let i = 0; i < steps; i++) {
        // Correct last step distance if needed, but linear steps are fine for AI movement smoothness
        const nx = entity.x + dxStep;
        const ny = entity.y + dyStep;

        // Быстрая проверка на стены/границы
        // Check map bounds first (cheaper)
        if (nx < 0 || ny < 0 || nx + entity.w > worldWidth || ny + entity.h > worldHeight) return false;

        let blocked = false;
        let collider = null;

        // Single loop to find collision
        for (const obj of objects) {
            // Check collision with wall or box
            if (nx < obj.x + obj.w && nx + entity.w > obj.x &&
                ny < obj.y + obj.h && ny + entity.h > obj.y) {
                    if (obj.type === 'wall') { blocked = true; break; }
                    if (obj.type === 'box') { collider = obj; break; } // Hit first box and handle
            }
        }
        
        if (blocked) return false;

        // Проверяем, не пересекается ли с ящиком — тогда попробуем его сдвинуть
        if (collider && collider.type === 'box') {
            const boxNx = collider.x + dxStep;
            const boxNy = collider.y + dyStep;
            
            // Проверяем, можно ли сдвинуть ящик (не врезается в стену/другой объект и в пределах канвы)
            let boxBlocked = false;
            // Map bounds for box
            if (boxNx < 0 || boxNx < 0 || boxNx + collider.w > worldWidth || boxNy + collider.h > worldHeight) boxBlocked = true;
            else {
                 for (const o of objects) {
                    if (o === collider) continue;
                    if (boxNx < o.x + o.w && boxNx + collider.w > o.x &&
                        boxNy < o.y + o.h && boxNy + collider.h > o.y) { 
                        boxBlocked = true; break; 
                    }
                }
            }
            if (boxBlocked) {
                // if (SHOW_AI_DEBUG) console.log('box cannot be pushed');
                return false;
            }

            // Толкаем ящик на один шаг
            collider.x = boxNx; collider.y = boxNy;
            // Only update visuals/grid occasionally or flag it
            if (Math.random() > 0.5) spawnParticle(collider.x + collider.w / 2, collider.y + collider.h / 2);
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

function spawnParticle(x, y, color, life) {
    const lifeValue = (typeof life === 'number') ? life : (20 + Math.random() * 10);
    if (color && typeof color === 'string') {
        particles.push({
            x, y,
            vx: (Math.random() - 0.5) * 2,
            vy: (Math.random() - 0.5) * 2,
            life: lifeValue,
            size: Math.random() * 3 + 2,
            color: color
        });
    } else {
        particles.push({
            x, y,
            vx: (Math.random() - 0.5) * 2,
            vy: (Math.random() - 0.5) * 2,
            life: lifeValue,
            size: Math.random() * 3 + 2
        });
    }
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
    } else if (tankType === 'musical') {
        // Musical tank: sound wave projectile that ricochets
        const speed = 6;
        bullets.push({
            x: tank.x + tank.w/2 + Math.cos(tank.turretAngle) * 25,
            y: tank.y + tank.h/2 + Math.sin(tank.turretAngle) * 25,
            w: 12, h: 12,
            vx: Math.cos(tank.turretAngle) * speed,
            vy: Math.sin(tank.turretAngle) * speed,
            life: 180,
            team: 0,
            type: 'musical',
            damage: 2, // 2 HP damage
            bounces: 0,
            maxBounces: 3
        });
        tank.fireCooldown = 45; // 0.75 seconds
    } else if (tankType === 'illuminat') {
        // Illuminat: continuous beam
        if (!tank.beamActive && (!tank.beamCooldown || tank.beamCooldown <= 0)) {
            tank.beamActive = true;
            tank.beamStart = Date.now();
            tank.fireCooldown = 240;
        }
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
    } else if (tankType === 'mirror') {
        // Mirror tank: check if hit recently
        let pType = 'mirror';
        const now = Date.now();
        if (tank.lastHitType && (now - tank.lastHitTime < 2000)) {
            pType = tank.lastHitType;
        }

        const speed = 6;
        let props = {
            x: tank.x + tank.w/2 + Math.cos(tank.turretAngle) * 25,
            y: tank.y + tank.h/2 + Math.sin(tank.turretAngle) * 25,
            vx: Math.cos(tank.turretAngle) * speed,
            vy: Math.sin(tank.turretAngle) * speed,
            life: 100,
            owner: 'player',
            team: 0,
            type: pType
        };

        // Customize projectile based on copied type
        if (pType === 'purple' || pType === 'plasma') {
            props.damage = 3; props.w = 10; props.h = 10; props.piercing = true;
        } else if (pType === 'fire') {
            props.damage = 1; props.w = 5; props.h = 5; // flame
        } else if (pType === 'toxic') {
            props = { ...props, type:'toxic', explodeTimer: 45, spawned: 5 }; // mini toxic bomb
        } else if (pType === 'musical') {
            props.damage = 2; props.w = 12; props.h = 12; props.bounces = 0; props.maxBounces = 3; // musical wave
        } else if (pType === 'mirror') {
            // Normal mirror shot
            props.damage = 1; props.w = 8; props.h = 8; // specialized mirror shard
        } else {
            // Fallback for copied normal/other types
            props.damage = 1; props.w = 6; props.h = 6; 
        }
        
        bullets.push(props);
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
        tank.fireCooldown = (tankType === 'mirror' ? 90 : FIRE_COOLDOWN); // 1.5sec for mirror
    }
}
// --- APPEND_POINT_UPDATE ---
function update() {
    if (gameState !== 'playing') {
        syncResultOverlay(gameState);
        if (gameState === 'win' || gameState === 'lose') {
            // Do not restart on Space — use Enter to restart instead
            if (keys['Enter']) {
                location.reload();
                keys['Enter'] = false;
            }
        }
        return;
    }
    
    // Reset AI budget for this frame
    globalPathBudget = MAX_PATH_BUDGET;

    // Throttle nav rebuild - only once every few frames max if needed
    if (navNeedsRebuild) { 
        if ((window.frameCount || 0) % 3 === 0) {
            buildNavGrid(); 
            navNeedsRebuild = false; 
        }
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
        
        // Handle Control Inversion (Swap inputs)
        if (tank.invertedControls > 0) {
            [isW, isS] = [isS, isW];
            [isA, isD] = [isD, isA];
        }

        if (isW) { dy -= tank.speed; tank.baseAngle = -Math.PI/2; }
        if (isS) { dy += tank.speed; tank.baseAngle = Math.PI/2; }
        if (isA) { dx -= tank.speed; tank.baseAngle = Math.PI; }
        if (isD) { dx += tank.speed; tank.baseAngle = 0; }
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
      try {
        if (!enemy || !enemy.alive) continue;
        if (enemy.paralyzed) { enemy.paralyzedTime--; if (enemy.paralyzedTime <= 0) enemy.paralyzed = false; if (enemy.frozenEffect) enemy.frozenEffect--; continue; }
        
        // Handle Inverted Controls (AI) and disorientation affecting movement
        let invertAI = false;
        if (enemy.invertedControls > 0) {
            enemy.invertedControls--;
            invertAI = true;
            if (Math.random() > 0.9) spawnParticle(enemy.x+enemy.w/2, enemy.y+enemy.h/2, '#8e44ad');
        }
        // If disoriented, also invert movement (but don't decrement here since turret logic handles disoriented decrement)
        if (enemy.disoriented > 0) {
            invertAI = true;
        }

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
        const potentialTargets = [tank, ...allies, ...otherEnemies, ...illusions.filter(i => i.life > 0)];
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
        if (enemy.confused > 0) {
            enemy.turretAngle += (Math.random() - 0.5) * 1.2;
            enemy.confused--;
        } else if (enemy.disoriented > 0 || (enemy.invertedControls && enemy.invertedControls > 0)) {
            enemy.turretAngle = Math.atan2(enemy.y - nearest.y, enemy.x - nearest.x); // shoot backwards
            if (enemy.disoriented > 0) enemy.disoriented--;
            if (enemy.invertedControls && enemy.invertedControls > 0) enemy.invertedControls--;
        } else {
            enemy.turretAngle = Math.atan2(nearest.y - enemy.y, nearest.x - enemy.x);
        }

        // Enemy ability usage heuristics
        try {
            // Mirror shield tick/cooldown maintenance
            if (enemy.mirrorShieldActive) {
                enemy.mirrorShieldTimer = (enemy.mirrorShieldTimer || 0) - 1;
                if (enemy.mirrorShieldTimer <= 0) enemy.mirrorShieldActive = false;
            }
            if (enemy.mirrorShieldCooldown > 0) enemy.mirrorShieldCooldown--;

            const distToNearest = Math.hypot((nearest.x + (nearest.w||0)/2) - (enemy.x + enemy.w/2), (nearest.y + (nearest.h||0)/2) - (enemy.y + enemy.h/2));

            // Toxic: use mega gas once if close enough
            if (enemy.tankType === 'toxic' && !enemy.megaGasUsed && distToNearest < 300 && Math.random() < 0.03) {
                const ang = enemy.turretAngle;
                const sx = enemy.x + enemy.w/2 + Math.cos(ang) * 20;
                const sy = enemy.y + enemy.h/2 + Math.sin(ang) * 20;
                const speed = 8;
                bullets.push({ x: sx, y: sy, w: 8, h: 8, vx: Math.cos(ang) * speed, vy: Math.sin(ang) * speed, life: 500, owner: 'enemy', team: enemy.team, type: 'megabomb', explodeTimer: 60, spawned: 5 });
                enemy.megaGasUsed = true;
                enemy.fireCooldown = 60;
            }

            // Plasma: fire powerful plasma blast (limited uses)
            if (enemy.tankType === 'plasma' && ((enemy.plasmaBlastUsed || 0) < 2) && distToNearest < 450 && Math.random() < 0.04) {
                const ang = enemy.turretAngle;
                const sx = enemy.x + enemy.w/2 + Math.cos(ang) * 25;
                const sy = enemy.y + enemy.h/2 + Math.sin(ang) * 25;
                bullets.push({ x: sx, y: sy, w: 10, h: 10, vx: Math.cos(ang) * 10, vy: Math.sin(ang) * 10, life: 300, owner: 'enemy', team: enemy.team, type: 'plasmaBlast', damage: 5, piercing: true, destroysWalls: true });
                enemy.plasmaBlastUsed = (enemy.plasmaBlastUsed || 0) + 1;
                enemy.fireCooldown = 60;
            }

            // Illuminat: inversion of controls affecting player/allies
            if (enemy.tankType === 'illuminat' && ((enemy.inversionUsed || 0) < 2) && distToNearest < 380 && Math.random() < 0.03) {
                const range = 350;
                const cx = enemy.x + enemy.w/2;
                const cy = enemy.y + enemy.h/2;
                objects.push({ type: 'explosion', x: cx, y: cy, radius: range, life: 45, maxLife: 45, color: 'rgba(155, 89, 182, 0.2)' });
                for (let k = 0; k < 20; k++) { const a = Math.random() * Math.PI * 2; const r = range * Math.sqrt(Math.random()); spawnParticle(cx + Math.cos(a) * r, cy + Math.sin(a) * r, '#8e44ad'); }
                // Affect player and allies
                const targetsToInvert = [tank, ...allies];
                for (const t of targetsToInvert) {
                    if (!t) continue;
                    const ex = t.x + (t.w||0)/2, ey = t.y + (t.h||0)/2;
                    if (Math.hypot(ex - cx, ey - cy) <= range) {
                        t.invertedControls = 120;
                        t.confused = 120;
                    }
                }
                enemy.inversionUsed = (enemy.inversionUsed || 0) + 1;
                enemy.fireCooldown = 60;
            }

            // Mirror: activate shield defensively
            if (enemy.tankType === 'mirror' && !enemy.mirrorShieldActive && (!enemy.mirrorShieldCooldown || enemy.mirrorShieldCooldown <= 0) && distToNearest < 320 && Math.random() < 0.025) {
                enemy.mirrorShieldActive = true;
                enemy.mirrorShieldTimer = 120;
                enemy.mirrorShieldCooldown = 60 * 18;
            }
        } catch (errAbility) { /* ignore ability errors for AI */ }

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
                // Throttle A* calls
                if (globalPathBudget > 0) {
                    globalPathBudget--;
                    const sx = enemy.x + enemy.w/2, sy = enemy.y + enemy.h/2;
                    const newPath = findPath(sx, sy, targetCx, targetCy);
                    if (newPath && newPath.length) {
                        enemy.path = newPath;
                        enemy.pathIndex = 0;
                        enemy.pathRecalc = 30 + Math.floor(Math.random() * 20); // spread out recalcs
                    } else {
                        enemy.path = [];
                        enemy.pathIndex = 0;
                        enemy.pathRecalc = 15;
                    }
                } else {
                    // Budget exhausted, try again next frame but delay slightly random amount to prevent stacking
                    enemy.pathRecalc = 1 + Math.floor(Math.random() * 2);
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
                let ang = Math.atan2(toWpY, toWpX);
                const originalAng = ang; // Store intended direction
                if (invertAI) ang += Math.PI;

                let moveDist = Math.min(tryDist, distToWp);
                const steering = steerAroundObstacles(enemy, ang, moveDist);
                ang = steering.angle;
                moveDist = steering.dist;
                // If direct path to waypoint is blocked, attempt local sidestep avoidance
                if (!pathClearFor(enemy, ang, moveDist) && !invertAI) { // Don't block inversion escape if pathblocked (actually inversion just goes backwards so it might go into wall)
                    const sideAngles = [ang + Math.PI/2, ang - Math.PI/2, ang + Math.PI/3, ang - Math.PI/3];
                    let avoided = false;
                    for (const a of sideAngles) {
                        if (moveSmallSteps(enemy, a, moveDist * 0.9)) { 
                            enemy.baseAngle = invertAI ? a - Math.PI : a; 
                            avoided = true; break; 
                        }
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
                        // Use original intended angle for baseAngle so it looks like reverse driving
                        enemy.baseAngle = invertAI ? ang - Math.PI : ang;
                        enemy.stuckCount = 0;
                        break;
                    }
                }
                if (movedAlongPath) {
                    if (distToWp < navCell * 0.35 || distToWp < moveDist * 1.1) {
                         if (!invertAI) enemy.pathIndex++; // Only advance path if moving towards it
                    }
                } else {
                    enemy.stuckCount = (enemy.stuckCount || 0) + 1;
                    // если не можем двигаться к точке — форсируем пересчёт пути
                    if (enemy.stuckCount > 2) enemy.pathRecalc = 0;
                }
            } else {
                // fallback: старая эвристика (локальные сэмплы углов)
                let faceAng = Math.atan2(mdy, mdx);
                // initial guess for movement
                let moveAng = faceAng + (invertAI ? Math.PI : 0);
                enemy.baseAngle = faceAng; 

                let desiredAng = moveAng;
                let fallbackDist = tryDist;
                const steer = steerAroundObstacles(enemy, desiredAng, fallbackDist);
                desiredAng = steer.angle;
                fallbackDist = steer.dist;
                // Попытка сделать малые шаги в желаемом направлении
                let moved = false;
                if (moveSmallSteps(enemy, desiredAng, fallbackDist)) {
                    moved = true;
                    enemy.baseAngle = invertAI ? desiredAng - Math.PI : desiredAng; 
                    enemy.stuckCount = 0;
                } else {
                    const MAX_STEPS = MAX_STEPS_FALLBACK;
                    const ANG_STEP = (Math.PI * 2) / MAX_STEPS;
                    for (let s = 1; s <= MAX_STEPS && !moved; s++) {
                        const sign = (s % 2 === 0) ? 1 : -1;
                        const mag = Math.ceil(s / 2);
                        const ang = desiredAng + sign * mag * ANG_STEP;
                        if (moveSmallSteps(enemy, ang, fallbackDist)) {
                            moved = true; 
                            enemy.baseAngle = invertAI ? ang - Math.PI : ang; 
                            enemy.stuckCount = 0; 
                            break;
                        } else if (SHOW_AI_DEBUG) {
                            const px1 = enemy.x + enemy.w/2; const py1 = enemy.y + enemy.h/2;
                            const px2 = px1 + Math.cos(ang) * fallbackDist * 4;
                            const py2 = py1 + Math.sin(ang) * fallbackDist * 4;
                            debugLines.push({ x1: px1, y1: py1, x2: px2, y2: py2, color: 'orange', width: 1 });
                        }
                    }
                }
                if (!moved) {
                    enemy.stuckCount = (enemy.stuckCount || 0) + 1;
                    const sidesteps = [desiredAng + Math.PI/2, desiredAng - Math.PI/2, desiredAng + Math.PI*0.6, desiredAng - Math.PI*0.6];
                    for (const ang of sidesteps) {
                        if (moveSmallSteps(enemy, ang, tryDist)) { 
                             moved = true; 
                             enemy.baseAngle = invertAI ? ang - Math.PI : ang; // approximate facing
                             enemy.stuckCount = 0; 
                             break; 
                        }
                        else if (SHOW_AI_DEBUG) { const px1 = enemy.x + enemy.w/2; const py1 = enemy.y + enemy.h/2; const px2 = px1 + Math.cos(ang) * tryDist * 4; const py2 = py1 + Math.sin(ang) * tryDist * 4; debugLines.push({ x1: px1, y1: py1, x2: px2, y2: py2, color: 'aqua', width: 1 }); }
                    }
                    if (!moved && enemy.stuckCount > 4) {
                        const newAng = desiredAng + Math.PI + (Math.random() - 0.5) * Math.PI/2;
                        if (moveSmallSteps(enemy, newAng, tryDist * 1.2)) { 
                             moved = true; 
                             enemy.baseAngle = invertAI ? newAng - Math.PI : newAng;
                             enemy.stuckCount = 0; 
                        }
                    }
                    if (!moved) { 
                        // desperation backup
                        const retreatAng = enemy.baseAngle; 
                        enemy.x -= Math.cos(retreatAng) * enemy.speed * 0.25; 
                        enemy.y -= Math.sin(retreatAng) * enemy.speed * 0.25; 
                    }
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
            } else if (tt === 'illuminat') {
                if (!enemy.beamActive && (!enemy.beamCooldown || enemy.beamCooldown <= 0)) {
                    enemy.beamActive = true;
                    enemy.beamStartTime = Date.now();
                    enemy.fireCooldown = 240;
                }
            } else if (tt === 'mirror') {
                // Mirror Tank (Enemy) - Copycat Logic
                let pType = 'mirror';
                const now = Date.now();
                if (enemy.lastHitType && (now - enemy.lastHitTime < 3000)) { // 3 seconds memory
                    pType = enemy.lastHitType;
                }
                // Create projectile based on copied type
                // Same logic as player mirror
                let props = {
                    x: enemy.x + enemy.w/2 + Math.cos(enemy.turretAngle) * 25,
                    y: enemy.y + enemy.h/2 + Math.sin(enemy.turretAngle) * 25,
                    vx: Math.cos(enemy.turretAngle) * 6,
                    vy: Math.sin(enemy.turretAngle) * 6,
                    life: 100,
                    owner: 'enemy',
                    team: enemy.team,
                    type: pType
                };
                
                // Customize projectile based on copied type
                if (pType === 'purple' || pType === 'plasma') {
                    props.damage = 3; props.w = 10; props.h = 10; props.piercing = true;
                } else if (pType === 'fire') {
                    props.damage = 1; props.w = 5; props.h = 5; 
                } else if (pType === 'toxic') {
                    props = { ...props, type:'toxic', explodeTimer: 45, spawned: 5, w:6, h:6 }; 
                } else if (pType === 'musical') {
                    props.damage = 2; props.w = 12; props.h = 12; props.bounces = 0; props.maxBounces = 3;
                } else if (pType === 'mirror') {
                    props.damage = 1; props.w = 8; props.h = 8;
                } else if (pType === 'ice') {
                    props.type = 'ice'; props.w = 8; props.h = 8; props.speed = 5;
                } else {
                    props.damage = 1; props.w = 6; props.h = 6;
                }
                b = props;
            } else if (tt === 'musical') {
                // Enemy musical: sound wave projectile that ricochets
                const speed = 6;
                b = { x: enemy.x + enemy.w/2 + Math.cos(enemy.turretAngle) * 25, y: enemy.y + enemy.h/2 + Math.sin(enemy.turretAngle) * 25, w: 12, h: 12, vx: Math.cos(enemy.turretAngle) * speed, vy: Math.sin(enemy.turretAngle) * speed, life: 180, team: enemy.team, type: 'musical', damage: 2, bounces: 0, maxBounces: 3 };
            } else {
                // normal or ice and other types default to normal shell
                const w = (tt === 'ice') ? 8 : 9;
                b = { x: enemy.x + enemy.w/2 + Math.cos(enemy.turretAngle) * 25, y: enemy.y + enemy.h/2 + Math.sin(enemy.turretAngle) * 25, w: w, h: w, vx:Math.cos(enemy.turretAngle)*6, vy:Math.sin(enemy.turretAngle)*6, life:100, owner:'enemy', team: enemy.team, type: (tt === 'ice') ? 'ice' : 'normal' };
            }
            if (b) bullets.push(b);
            // Fire-type enemies should be able to spray flames more often
            enemy.fireCooldown = (tt === 'fire') ? 10 : (tt === 'buratino') ? 180 : FIRE_COOLDOWN;
        }
      } catch (err) {
        console.error('Enemy AI Error:', err);
      }
    }
// --- APPEND_POINT_UPDATE_AI_ALLIES ---

    // AI для союзников — действуют как враги, но цель у них — враги
    for (let ally of allies) {
      try {
        if (!ally || !ally.alive) continue;
        if (ally.paralyzed) { ally.paralyzedTime--; if (ally.paralyzedTime <= 0) ally.paralyzed = false; if (ally.frozenEffect) ally.frozenEffect--; continue; }
        // If in artillery mode, countdown and skip normal AI movement/actions
        if (ally.artilleryMode) {
            ally.artilleryTimer = (ally.artilleryTimer || 0) - 1;
            if (ally.artilleryTimer <= 0) ally.artilleryMode = false;
            continue;
        }
        const targets = [...enemies.filter(e => e && e.alive), ...illusions.filter(i => i.life > 0)];
        if (targets.length === 0) continue;
        let nearest = targets[0];
        let nd = Math.hypot((nearest.x + (nearest.w||0)/2) - (ally.x + ally.w/2), (nearest.y + (nearest.h||0)/2) - (ally.y + ally.h/2));
        for (const t of targets) {
            const d = Math.hypot((t.x + (t.w||0)/2) - (ally.x + ally.w/2), (t.y + (t.h||0)/2) - (ally.y + ally.h/2));
            if (d < nd) { nearest = t; nd = d; }
        }
        // Aim turret at nearest enemy
        if (ally.confused > 0) {
            ally.turretAngle += (Math.random() - 0.5) * 1.2;
            ally.confused--;
        } else if (ally.disoriented > 0 || (ally.invertedControls && ally.invertedControls > 0)) {
            ally.turretAngle = Math.atan2(ally.y - nearest.y, ally.x - nearest.x); // shoot backwards
            if (ally.disoriented > 0) ally.disoriented--;
            if (ally.invertedControls && ally.invertedControls > 0) ally.invertedControls--;
        } else {
            ally.turretAngle = Math.atan2(nearest.y - ally.y, nearest.x - ally.x);
        }
        if (ally.confused > 0) {
            ally.turretAngle += (Math.random() - 0.5) * 0.5;
            ally.confused--;
        }

        // Movement towards nearest enemy (reuse enemy logic: pathfinding then small-step fallback)
        // If disoriented or inverted, invert movement direction for allies
        const invertAlly = (ally.disoriented > 0) || (ally.invertedControls && ally.invertedControls > 0);
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
                let faceAng = Math.atan2(toWpY, toWpX);
                let moveAng = faceAng + (invertAlly ? Math.PI : 0);

                let moveDist = Math.min(tryDist, distToWp);
                const steering = steerAroundObstacles(ally, moveAng, moveDist);
                moveAng = steering.angle; 
                moveDist = steering.dist;
                    // Local avoidance: if blocked, try sidesteps before forcing path recalculation
                    if (!pathClearFor(ally, moveAng, moveDist)) {
                        const sideAngles = [moveAng + Math.PI/2, moveAng - Math.PI/2, moveAng + Math.PI/3, moveAng - Math.PI/3];
                        let avoided = false;
                        for (const a of sideAngles) {
                            if (moveSmallSteps(ally, a, moveDist * 0.9)) { 
                                ally.baseAngle = invertAlly ? a - Math.PI : a; 
                                avoided = true; 
                                break; 
                            }
                        }
                        if (avoided) continue;
                        ally.pathRecalc = 0;
                    }
                let movedAlongPath = false;
                const fracs = [1, 0.8, 0.5];
                for (const f of fracs) {
                    if (moveSmallSteps(ally, moveAng, moveDist * f)) { 
                        movedAlongPath = true; 
                        ally.baseAngle = invertAlly ? moveAng - Math.PI : moveAng; 
                        ally.stuckCount = 0; 
                        break; 
                    }
                }
                if (movedAlongPath) {
                    if (distToWp < navCell * 0.35 || distToWp < moveDist * 1.1) ally.pathIndex++;
                } else { ally.stuckCount = (ally.stuckCount || 0) + 1; if (ally.stuckCount > 2) ally.pathRecalc = 0; }
            } else {
                // fallback local sampling
                let faceAng = Math.atan2(mdy, mdx);
                let desiredAng = faceAng + (invertAlly ? Math.PI : 0);
                
                ally.baseAngle = faceAng; 
                let moved = false;
                let fallbackDist = tryDist;
                const steer = steerAroundObstacles(ally, desiredAng, fallbackDist);
                desiredAng = steer.angle;
                fallbackDist = steer.dist;
                
                if (moveSmallSteps(ally, desiredAng, fallbackDist)) { 
                    moved = true; 
                    ally.baseAngle = invertAlly ? desiredAng - Math.PI : desiredAng; 
                    ally.stuckCount = 0; 
                }
                else {
                    const MAX_STEPS = 24; const ANG_STEP = Math.PI/24;
                    for (let s=1; s<=MAX_STEPS && !moved; s++) {
                        const sign = (s%2===0)?1:-1; const mag = Math.ceil(s/2); const ang = desiredAng + sign*mag*ANG_STEP;
                        if (moveSmallSteps(ally, ang, fallbackDist)) { 
                            moved = true; 
                            ally.baseAngle = invertAlly ? ang - Math.PI : ang; 
                            ally.stuckCount = 0; 
                            break; 
                        }
                    }
                }
                if (!moved) { 
                    ally.stuckCount = (ally.stuckCount||0) + 1; 
                    if (ally.stuckCount > 4) { 
                        const newAng = desiredAng + Math.PI + (Math.random()-0.5)*Math.PI/2; 
                        if (moveSmallSteps(ally, newAng, tryDist*1.2)) { 
                            ally.baseAngle = invertAlly ? newAng - Math.PI : newAng; 
                            ally.stuckCount = 0; 
                        } 
                    } 
                    if (!moved) { 
                        const retreatAng = ally.baseAngle; 
                        ally.x -= Math.cos(retreatAng)*ally.speed*0.25; 
                        ally.y -= Math.sin(retreatAng)*ally.speed*0.25; 
                    } 
                }
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
                } else if (tt === 'musical') {
                    // Ally musical: sound wave projectile that ricochets
                    const speed = 6;
                    b = { x: ally.x + ally.w/2 + Math.cos(ally.turretAngle) * 25, y: ally.y + ally.h/2 + Math.sin(ally.turretAngle) * 25, w: 12, h: 12, vx: Math.cos(ally.turretAngle) * speed, vy: Math.sin(ally.turretAngle) * speed, life: 180, team: ally.team, type: 'musical', damage: 2, bounces: 0, maxBounces: 3 };
                } else if (tt === 'illuminat') {
                    // Ally illuminat: activate beam
                    if (!ally.beamActive && (!ally.beamCooldown || ally.beamCooldown <= 0)) {
                        ally.beamActive = true;
                        ally.beamStartTime = Date.now();
                        ally.fireCooldown = 240;
                    }
                }
                if (b) bullets.push(b);
                ally.fireCooldown = (tt === 'fire') ? 10 : (tt === 'buratino') ? 180 : (tt === 'musical') ? 45 : (tt === 'illuminat') ? 240 : FIRE_COOLDOWN;
            }
        }
      } catch (err) { console.error('Ally AI Error:', err); }
    }

    // Generic Helper for beam update (Player, Ally, Enemy)
    function updateUnitBeam(unit, targets) {
        if (typeof unit.beamIntensity === 'undefined') unit.beamIntensity = 0;

        // Manage active state & intensity
        if (unit.beamActive) {
            const elapsed = (Date.now() - (unit.beamStartTime || unit.beamStart)) / 1000;
            if (elapsed < 5) {
                // Fade in
                unit.beamIntensity = Math.min(1, unit.beamIntensity + 0.05);
            } else {
                // Time up
                unit.beamActive = false;
                unit.beamCooldown = 180;
            }
        } else {
            // Fade out
            unit.beamIntensity = Math.max(0, unit.beamIntensity - 0.05);
        }

        // Apply effect if visible
        if (unit.beamIntensity > 0) {
            let beamLength = 300;
            const beamX = unit.x + unit.w/2;
            const beamY = unit.y + unit.h/2;
            
            // Raycast for obstacles first (walls, boxes) to stop beam
            // Simple check: iterate objects, find closest intersection
            let closestDist = beamLength;
            let closestObj = null;
            const rayEndX = beamX + Math.cos(unit.turretAngle) * beamLength;
            const rayEndY = beamY + Math.sin(unit.turretAngle) * beamLength;

            for (const obj of objects) {
                 // Check if line intersects object rect
                 // We reuse lineIntersectsRect logic but need point of intersection for distance
                 // Since lineIntersectsRect is boolean, let's just do a rough check or precise one if needed.
                 // For now, let's step along the ray to find the blockage point if boolean check hits.
                 if (lineIntersectsRect(beamX, beamY, rayEndX, rayEndY, obj.x, obj.y, obj.w, obj.h)) {
                      // Found an obstacle in the path. Find accurate distance.
                      // Approximating by checking multiple points along the ray or geometric intersection
                      // Geometric intersection with rectangle:
                      // Line: P = beam + t*Dir, t in [0, 1]
                      // Intersect with 4 lines of rect. Find min positive t.
                      // Simplified: Helper function to get distance
                      const d = getRayRectDistance(beamX, beamY, unit.turretAngle, beamLength, obj);
                      if (d < closestDist) {
                          closestDist = d;
                          closestObj = obj;
                      }
                 }
            }
            
            // Handle destruction of obstacles by beam
            if (closestObj) { // Found something the beam hit
                if (closestObj.type === 'box') {
                    // Instantly destroy box
                    for(let k=0; k<8; k++) spawnParticle(closestObj.x+closestObj.w/2, closestObj.y+closestObj.h/2);
                    const idx = objects.indexOf(closestObj);
                    if (idx !== -1) objects.splice(idx, 1);
                    navNeedsRebuild = true;
                } else if (closestObj.type === 'barrel') {
                    explodeBarrel(closestObj);
                }
            }
            
            // Update beam length based on obstacles
            beamLength = closestDist;
            // Store actual length for renderer to use (attach property to unit so renderer knows where to stop)
            unit.actualBeamLength = beamLength; 
            
            const endX = beamX + Math.cos(unit.turretAngle) * beamLength;
            const endY = beamY + Math.sin(unit.turretAngle) * beamLength;
            
            // Allow checking player as target (wrapped)
            const checkList = targets; // targets is array

            // helper: distance from point to beam segment
            const distToSegment = (px, py, x1, y1, x2, y2) => {
                const dx = x2 - x1;
                const dy = y2 - y1;
                const lenSq = dx*dx + dy*dy || 1;
                const t = Math.max(0, Math.min(1, ((px - x1) * dx + (py - y1) * dy) / lenSq));
                const projX = x1 + t * dx;
                const projY = y1 + t * dy;
                return Math.hypot(px - projX, py - projY);
            };

            for (let j = checkList.length - 1; j >= 0; j--) {
                const e = checkList[j];
                // Skip invalid, dead, or same team
                if (!e || (e.alive === false && e !== tank) || (e.team !== undefined && e.team === unit.team)) continue;

                // Mirror Shield Protection from Beams (works for any tank)
                if (e.mirrorShieldActive) continue;

                // Hit check by distance to beam segment (more reliable than rect intersection)
                const cx = e.x + (e.w||0)/2;
                const cy = e.y + (e.h||0)/2;
                const hitRadius = Math.max(e.w||0, e.h||0) * 0.55 + 4; // small padding
                const dist = distToSegment(cx, cy, beamX, beamY, endX, endY);
                if (dist <= hitRadius) {
                    // Damage scaled by beam intensity (slightly stronger)
                    const dmg = 0.8 * unit.beamIntensity;
                    e.hp -= dmg;
                    // Apply strong disorientation/inversion + confusion so AI reacts
                    e.disoriented = Math.max(e.disoriented || 0, 60);
                    e.invertedControls = Math.max(e.invertedControls || 0, 120);
                    e.confused = Math.max(e.confused || 0, 90);
                    // small visual feedback
                    for (let p = 0; p < 6; p++) spawnParticle(cx + (Math.random()-0.5)*10, cy + (Math.random()-0.5)*10, '#8e44ad');

                    if (e.hp <= 0) {
                        // Handle death
                        if (e === tank) {
                            if (currentMode === 'war') { 
                                tank.alive = false; tank.respawnTimer = 600; 
                            } else { gameState = 'lose'; }
                            for(let k=0; k<10; k++) spawnParticle(tank.x+tank.w/2, tank.y+tank.h/2);
                        } else {
                            if (currentMode === 'war') { 
                                e.alive = false; e.respawnTimer = 600; 
                                for(let k=0; k<10; k++) spawnParticle(e.x+e.w/2, e.y+e.h/2);
                            } else {
                                // Check list existence before splicing
                                const idxE = enemies.indexOf(e);
                                if (idxE !== -1) { enemies.splice(idxE, 1); coins += 5; }
                                const idxA = allies.indexOf(e);
                                if (idxA !== -1) { allies.splice(idxA, 1); }
                                
                                for(let k=0; k<10; k++) spawnParticle(e.x+e.w/2, e.y+e.h/2);
                            }
                        }
                    }
                }
            }
        }
        if (unit.beamCooldown > 0) unit.beamCooldown--;
    }

    // Illuminat beam logic (Player)
    if (tank.tankType === 'illuminat' || tankType === 'illuminat') { // handle global and obj property
        // Prepare target list for player (Enemies)
        updateUnitBeam(tank, enemies);
    }

    // Illuminat beam logic for allies
    for (let i = allies.length - 1; i >= 0; i--) {
        const ally = allies[i];
        if (ally.tankType === 'illuminat') updateUnitBeam(ally, enemies);
    }

    // Illuminat beam logic for enemies
    for (let i = enemies.length - 1; i >= 0; i--) {
        const enemy = enemies[i];
        if (enemy.tankType === 'illuminat') updateUnitBeam(enemy, [tank, ...allies, ...enemies]);
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
        // Check collision with objects (but toxic/megabomb/plasmaBlast/musical pass through standard logic differently)
        let hit = false;
        if (b.type !== 'rocket' && b.type !== 'toxic' && b.type !== 'megabomb' && b.type !== 'plasmaBlast' && b.type !== 'musical') {
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
        // Special handling for musical: ricochet
        if (b.type === 'musical') {
            for (let j = objects.length - 1; j >= 0; j--) {
                const obj = objects[j];
                if (checkRectCollision(bRect, obj)) {
                    // Calculate collision normal
                    const bCenterX = b.x;
                    const bCenterY = b.y;
                    const oCenterX = obj.x + obj.w/2;
                    const oCenterY = obj.y + obj.h/2;
                    const overlapX = (b.w + obj.w)/2 - Math.abs(bCenterX - oCenterX);
                    const overlapY = (b.h + obj.h)/2 - Math.abs(bCenterY - oCenterY);
                    
                    if (overlapX < overlapY) {
                        b.vx = -b.vx; // Reflect horizontally
                        b.x += Math.sign(b.vx) * overlapX * 2; // Anti-stuck push
                    } else {
                        b.vy = -b.vy; // Reflect vertically
                        b.y += Math.sign(b.vy) * overlapY * 2; // Anti-stuck push
                    }
                    
                    b.bounces++;
                    if (b.bounces > b.maxBounces) {
                        bullets.splice(i, 1);
                        hit = true;
                    } else {
                        // Spawn some particles on bounce
                        for (let k = 0; k < 3; k++) spawnParticle(b.x, b.y, b.color || '#00ffff');
                    }
                    
                    if (obj.type === 'box') {
                        objects.splice(j, 1);
                        for (let k = 0; k < 5; k++) spawnParticle(obj.x + obj.w/2, obj.y + obj.h/2);
                        navNeedsRebuild = true;
                    } else if (obj.type === 'barrel') {
                        explodeBarrel(obj);
                    }
                    break; // Handle one collision per frame
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
                // Mirror tank shield reflection logic
                if (tankType === 'mirror' && tank.mirrorShieldActive) {
                    // Reflect bullet!
                    // Reverse velocity and boost slightly
                    b.vx = -b.vx * 1.5;
                    b.vy = -b.vy * 1.5;
                    b.team = tank.team; // Now belongs to player
                    b.owner = 'player';
                    b.life += 60; // Extend life a bit
                    // Play reflect sound effect (particle burst)
                    for(let k=0; k<5; k++) spawnParticle(b.x, b.y, '#ffffff');
                    continue; // Skip damage logic
                }
                
                // Copy hit type logic for Mirror Tank
                if (tankType === 'mirror') {
                    tank.lastHitType = b.type;
                    tank.lastHitTime = Date.now();
                }

                if (b.type === 'rocket' || b.type === 'smallRocket') {
                    explodeRocket(b);
                    bullets.splice(i, 1);
                } else if (b.type === 'toxic' || b.type === 'megabomb') {
                    // Toxic bombs only damage, don't stop or explode on contact
                    tank.hp -= 5;
                    // continue flying, don't remove bullet
                } else if (b.type === 'plasma') {
                    // Mirror tank resistance to plasma
                    if (tankType === 'mirror') {
                         tank.hp -= 2; // Reduced damage
                    } else {
                         tank.hp -= b.damage || 3;
                    }
                    bullets.splice(i, 1); // Remove bullet on hit
                } else if (b.type === 'plasmaBlast') {
                    // Plasma blast logic
                    // Ensure it only hits once per entity by tracking
                    b.hitEntities = b.hitEntities || [];
                    if (!b.hitEntities.includes('player')) {
                        if (tankType === 'mirror') {
                            tank.hp -= 3; // Reduced damage
                        } else {
                            tank.hp -= b.damage || 5;
                        }
                        b.hitEntities.push('player');
                        // Do not remove bullet if it's meant to pierce, but ensure single hit
                    }
                } else if (b.type === 'illuminat') {
                    // Illuminat beam: damage and disorient
                    tank.hp -= b.damage || 1;
                    tank.disoriented = b.disorientTime || 36; // 0.6 seconds
                    bullets.splice(i, 1);
                } else {
                     let dmg = (b.damage || (b.type === 'fire' ? 16 : b.type === 'rocket' ? 2 : 1));
                     tank.hp -= dmg;
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
                    if (a.tankType === 'mirror') {
                        a.lastHitType = b.type;
                        a.lastHitTime = Date.now();
                    }
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
                        a.hp = (a.hp || 100) - (b.damage || (b.type === 'fire' ? 16 : b.type === 'rocket' ? 2 : 1));
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
                    if (e.tankType === 'mirror') {
                        e.lastHitType = b.type;
                        e.lastHitTime = Date.now();
                    }
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
                        e.hp -= (b.damage || (b.type === 'fire' ? 16 : b.type === 'rocket' ? 2 : 1));
                        if (b.type === 'ice' && e.tankType !== 'ice') { e.paralyzed = true; e.paralyzedTime = 180; e.frozenEffect = 180; }
                        if (b.type === 'musical') { e.confused = 120; } // 2 seconds confusion
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
    
    // Обновление звуковых волн
    for (let i = soundWaves.length - 1; i >= 0; i--) {
        const sw = soundWaves[i];
        sw.radius += sw.speed;
        sw.life--;
        if (sw.radius >= sw.maxRadius || sw.life <= 0) {
            soundWaves.splice(i, 1);
            continue;
        }
        // Check wall bounce
        const checkX = sw.x + Math.cos(sw.angle) * sw.radius;
        const checkY = sw.y + Math.sin(sw.angle) * sw.radius;
        if (checkX < 0 || checkX > worldWidth || checkY < 0 || checkY > worldHeight) {
            if (sw.bounces < sw.maxBounces) {
                // Reflect angle
                if (checkX < 0 || checkX > worldWidth) sw.angle = Math.PI - sw.angle;
                if (checkY < 0 || checkY > worldHeight) sw.angle = -sw.angle;
                sw.bounces++;
            } else {
                soundWaves.splice(i, 1);
                continue;
            }
        }
        
        // Check collision with player (if enemy wave)
        if (sw.team !== tank.team && checkCircleCollision(sw.x, sw.y, sw.radius, tank.x + tank.w/2, tank.y + tank.h/2, Math.max(tank.w, tank.h)/2)) {
            let shielded = false;
            if (tankType === 'mirror') {
                if (tank.mirrorShieldActive) {
                    sw.team = tank.team; // Reflect to player team
                    sw.angle += Math.PI; // Reverse direction roughly or bounce off?
                    // Actually expanding wave... just change team so it hits enemies now?
                    // Or bounce? Bouncing expanding circle is weird. Just change ownership.
                    shielded = true;
                }
                tank.lastHitType = 'musical';
                tank.lastHitTime = Date.now();
            }
            
            if (!shielded) {
                tank.hp -= sw.damage;
                tank.confused = 30;
                if (tank.hp <= 0) {
                     for (let k = 0; k < 30; k++) spawnParticle(tank.x + tank.w/2, tank.y + tank.h/2);
                     if (currentMode === 'war') { tank.alive = false; tank.respawnTimer = 600; }
                     else { gameState = 'lose'; }
                }
            }
        }

        // Check collision with enemies
        for (let j = enemies.length - 1; j >= 0; j--) {
            const e = enemies[j];
            if (e.team !== sw.team && checkCircleCollision(sw.x, sw.y, sw.radius, e.x + e.w/2, e.y + e.h/2, Math.max(e.w, e.h)/2)) {
                if (e.tankType === 'mirror') {
                    e.lastHitType = 'musical';
                    e.lastHitTime = Date.now();
                }
                e.hp -= sw.damage;
                e.confused = 30; // 0.5 seconds confusion
                if (e.hp <= 0) {
                    enemies.splice(j, 1);
                    coins += 5;
                    for (let k = 0; k < 10; k++) spawnParticle(e.x + e.w/2, e.y + e.h/2);
                }
            }
        }
        // Check collision with allies if enemy wave
        for (let j = allies.length - 1; j >= 0; j--) {
            const a = allies[j];
            if (a.team !== sw.team && checkCircleCollision(sw.x, sw.y, sw.radius, a.x + a.w/2, a.y + a.h/2, Math.max(a.w, a.h)/2)) {
                if (a.tankType === 'mirror') {
                    a.lastHitType = 'musical';
                    a.lastHitTime = Date.now();
                }
                a.hp -= sw.damage;
                a.confused = 30;
                if (a.hp <= 0) {
                    allies.splice(j, 1);
                    for (let k = 0; k < 10; k++) spawnParticle(a.x + a.w/2, a.y + a.h/2);
                }
            }
        }
    }
    
    // Обновление иллюзий
    for (let i = illusions.length - 1; i >= 0; i--) {
        const ill = illusions[i];
        ill.life--;
        if (ill.life <= 0) {
            illusions.splice(i, 1);
            continue;
        }
        // Move illusion slightly
        ill.x += Math.cos(ill.baseAngle) * 1.5;
        ill.y += Math.sin(ill.baseAngle) * 1.5;
        ill.turretAngle += 0.02; // slight rotation
        // Check collision with bullets (illusions disappear on hit)
        for (let j = bullets.length - 1; j >= 0; j--) {
            const b = bullets[j];
            if (b.team !== ill.team && checkCircleCollision(ill.x, ill.y, 20, b.x, b.y, Math.max(b.w, b.h)/2)) {
                illusions.splice(i, 1);
                // Remove bullet
                bullets.splice(j, 1);
                for (let k = 0; k < 5; k++) spawnParticle(ill.x, ill.y);
                break;
            }
        }
    }
    
    // Illuminat beam logic
    if (tank.beamActive) {
        const elapsed = (Date.now() - tank.beamStart) / 1000; // seconds
        if (elapsed >= 5) {
            // Turn off beam for 3 seconds
            tank.beamActive = false;
            tank.beamCooldown = 180; // 3 seconds
        } else {
            // Check beam collision
            const beamLength = 300;
            const beamX = tank.x + tank.w/2;
            const beamY = tank.y + tank.h/2;
            const endX = beamX + Math.cos(tank.beamAngle) * beamLength;
            const endY = beamY + Math.sin(tank.beamAngle) * beamLength;
            
            // Check enemies
            for (let j = enemies.length - 1; j >= 0; j--) {
                const e = enemies[j];
                if (e.team !== tank.team && lineIntersectsRect(beamX, beamY, endX, endY, e.x, e.y, e.w, e.h)) {
                    e.hp -= 0.5; // continuous damage
                    e.disoriented = 36; // 0.6 seconds
                    if (e.hp <= 0) {
                        enemies.splice(j, 1);
                        coins += 5;
                        for (let k = 0; k < 10; k++) spawnParticle(e.x + e.w/2, e.y + e.h/2);
                    }
                }
            }
            // Check allies if enemy beam (but player beam)
            // For player, only enemies
        }
    }
    if (tank.beamCooldown > 0) tank.beamCooldown--;
    
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
                // Mirror shield reflection logic (for flames it's tricky, just block or reflect back?)
                if (tankType === 'mirror' && tank.mirrorShieldActive) {
                    f.vx = -f.vx * 1.5; f.vy = -f.vy * 1.5; f.team = tank.team; f.life = 60; 
                    continue; 
                }
                
                // Mirror tank copy trait
                if (tankType === 'mirror') {
                    tank.lastHitType = 'fire';
                    tank.lastHitTime = Date.now();
                }

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
        } else if (obj.type === 'implosion') {
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
    if (particles.length > 200) {
        particles.splice(0, particles.length - 200);
    }
    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx; p.y += p.vy;
        p.life -= 0.05; // Was 0.02 - sped up cleanup
        
        // Boundaries check optimization
        if (p.x < -10 || p.x > worldWidth + 10 || p.y < -10 || p.y > worldHeight + 10) p.life = -1;
        
        if (p.life <= 0) particles.splice(i, 1);
    }

    // Apply gas effects: check entities entering gas clouds and apply poison timers
    const GAS_DEBUFF_TICKS = 3 * 60; // 3 seconds
    for (const obj of objects) {
        if (obj.type !== 'gas') continue;
        const ownerTeam = typeof obj.ownerTeam !== 'undefined' ? obj.ownerTeam : null;

        // If ownerTeam is set, poison entities whose team differs from ownerTeam
        if (ownerTeam !== null) {
            // Poison enemies (team !== ownerTeam)
            for (const e of enemies) {
                if (!e || !e.alive) continue;
                if (e.team === ownerTeam) continue;
                const dist = Math.hypot((e.x + (e.w||0)/2) - obj.x, (e.y + (e.h||0)/2) - obj.y);
                if (dist <= obj.radius) {
                    if (!e.poisonTimer || e.poisonTimer <= 0) e.poisonTimer = GAS_DEBUFF_TICKS;
                }
            }
            // Poison player if not on same team
            if (tank && tank.alive !== false && tank.team !== ownerTeam) {
                const dist = Math.hypot((tank.x + tank.w/2) - obj.x, (tank.y + tank.h/2) - obj.y);
                if (dist <= obj.radius) {
                    if (!tank.poisonTimer || tank.poisonTimer <= 0) tank.poisonTimer = GAS_DEBUFF_TICKS;
                }
            }
            // Poison allies not on ownerTeam
            for (const a of allies) {
                if (!a || !a.alive) continue;
                if (a.team === ownerTeam) continue;
                const dist = Math.hypot((a.x + (a.w||0)/2) - obj.x, (a.y + (a.h||0)/2) - obj.y);
                if (dist <= obj.radius) {
                    if (!a.poisonTimer || a.poisonTimer <= 0) a.poisonTimer = GAS_DEBUFF_TICKS;
                }
            }
        } else {
            // Fallback for older gas objects using owner string: keep previous semantics
            if (obj.owner === 'player' || obj.owner === 'ally') {
                for (const e of enemies) {
                    if (!e || !e.alive) continue;
                    const dist = Math.hypot((e.x + (e.w||0)/2) - obj.x, (e.y + (e.h||0)/2) - obj.y);
                    if (dist <= obj.radius) {
                        if (!e.poisonTimer || e.poisonTimer <= 0) e.poisonTimer = GAS_DEBUFF_TICKS;
                    }
                }
            } else if (obj.owner === 'enemy') {
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

              // Mirror Tank Logic: Poison counts as hit type 'toxic' (for any mirror tank)
              if (ent.tankType === 'mirror') {
                  ent.lastHitType = 'toxic';
                  ent.lastHitTime = Date.now();
              }

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
                    // Mirror tank check for maxHP
                    const maxHp = (tankType === 'fire' ? 6 : (tankType === 'musical' || tankType === 'mirror') ? 4 : 3);
                    if (p) {
                         tank.x = p.x; tank.y = p.y; tank.hp = maxHp; tank.alive = true; tank.respawnTimer = 0; tank.respawnCount++;
                    } else {
                         // fallback respawn
                         tank.x = sp.x; tank.y = sp.y; tank.hp = maxHp; tank.alive = true; tank.respawnTimer = 0; tank.respawnCount++;
                    }
                    if (tankType === 'mirror') {
                         tank.mirrorShieldActive = false; tank.mirrorShieldTimer = 0; tank.lastHitType = null;
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
            syncResultOverlay('win');
        } else if (!teamHasAliveMember(0)) {
            gameState = 'lose';
            syncResultOverlay('lose');
        }
    } else if (enemies.length === 0) {
        gameState = 'win';
        if (currentMode === 'single') coins += 25;
        else if (currentMode === 'team') coins += 40;
        syncResultOverlay('win');
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
    // Game HUD
    const coinDisplay = document.getElementById('coinDisplay');
    if (coinDisplay) coinDisplay.textContent = coins;
    const gemDisplay = document.getElementById('gemDisplay');
    if (gemDisplay) gemDisplay.textContent = gems;

    // Menu Displays (IDs: menuCoinDisplay, menuGemDisplay, shopCoinDisplay, etc)
    const elementsToUpdate = document.querySelectorAll('.currency-coin');
    elementsToUpdate.forEach(el => el.textContent = coins);
    
    const gemElements = document.querySelectorAll('.currency-gem');
    gemElements.forEach(el => el.textContent = gems);

    saveProgress();
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
    if (selectedType === 'fire') {
        tank.hp = 6;
    } else if (selectedType === 'musical') {
        tank.hp = 4;
    } else if (selectedType === 'mirror') {
        tank.hp = 4;
        tank.lastHitType = null;
        tank.lastHitTime = 0;
        tank.mirrorShieldActive = false;
        tank.mirrorShieldTimer = 0;
    } else {
        tank.hp = 3; // Reset HP for others
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
        btn.style.background = '#e74c3c';
    } else {
        const price = tankGemPrices[type] || 9999;
        btn.textContent = `Купить (${price} 💎)`;
        if (gems >= price) {
            btn.style.background = '#27ae60'; // Green for buyable
        } else {
            btn.style.background = '#95a5a6'; // Gray for too expensive
        }
    }
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
        if (originalShowTankDetail) originalShowTankDetail(tankType);
        updateTankDetailButton(tankType);
    };
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
        if (rarity === 'chromatic') comp = Math.max(comp, 150);
        if (rarity === 'mythic') comp = Math.max(comp, 200);

        gems += comp;
        saveProgress();
        if (!suppressRewardModal) showReward('gems', comp, `Duplicate ${rarityLabel} tank ${tDesc} converted to Gems!`);
        return { type: 'gems', amount: comp, desc: `Duplicate ${rarityLabel} tank converted to Gems!`, icon: '💎', rarity: rarity };
    }
}

