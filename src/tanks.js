
// --- VISUALS & ABILITIES --- //

// Tank descriptions for detail modal
const tankDescriptions = {
    normal: {
        name: "Стандартный танк",
        description: "Надёжный танк для любого боя: обычные снаряды, понятное управление и никаких сложных способностей. Учись держать дистанцию, обходить укрытия и выбирать момент для выстрела — здесь всё решают твои действия.",
        rarity: "Обычный"
    },
    ice: {
        name: "Ледяной танк",
        description: "Ледяные снаряды сковывают врага и дают время сменить позицию. Ульта покрывает холодом область вокруг танка и замораживает противников. Особенно полезен, когда нужно остановить наступление или вырваться из окружения.",
        rarity: "Эпический"
    },
    fire: {
        name: "Огненный танк",
        description: "Огнемёт накрывает близкие цели непрерывной струёй пламени. Подойди так, чтобы врагу было трудно выйти из огня, но заранее приготовь путь назад. После долгой очереди оружию нужно время на перезарядку.",
        rarity: "Редкая"
    },
    toxic: {
        name: "Токсичный танк",
        description: "Ядовитый снаряд не ранит при попадании: настоящая опасность начинается, когда раскрывается облако. Яд разъедает тех, кто задержался внутри. Перекрывай узкие проходы и заставляй врага выбирать между уроном и отступлением.",
        rarity: "Легендарный"
    },
    plasma: {
        name: "Плазменный танк",
        description: "Плазменный снаряд проходит сквозь цели и особенно опасен, когда враги выстроились в одну линию. Его усиленная атака позволяет резко переломить бой. Выбирай чистый угол выстрела, чтобы мощный заряд не ушёл впустую.",
        rarity: "Мифический"
    },
    buratino: {
        name: "Буратино (ТОС)",
        description: "Буратино накрывает выбранное направление быстрым ракетным залпом и может двигаться, пока ракеты летят к цели. Ульта обрушивает несколько волн на большую область, вынуждая противников покинуть опасную позицию.",
        rarity: "Эпический"
    },
    musical: {
        name: "Музыкальный танк",
        description: "Звуковые снаряды отскакивают от стен и находят путь туда, куда нельзя выстрелить напрямую. Используй углы и узкие коридоры, чтобы удивлять врага неожиданной траекторией. Ульта наполняет поле сразу несколькими рикошетами.",
        rarity: "Эпический"
    },
    illuminat: {
        name: "Иллюминат",
        description: "Луч Иллюмината постепенно разгорается и становится всё опаснее. Оставленные на земле знаки ранят наступившего врага, а во время ульты вспыхивают огнём. Держи цель в луче и направляй её прямо к знаку.",
        rarity: "Мифический"
    },
    mirror: {
        name: "Зеркальный",
        description: "Зеркальный запоминает тип попавшего в него снаряда и отвечает похожим выстрелом. Чужое оружие становится частью твоей тактики, а щит помогает пережить опасный обмен. Следи, что именно скопировано, прежде чем идти в атаку.",
        rarity: "Легендарный"
    },
    egyptian: {
        name: "Танк-фараон",
        description: "Танк-фараон выпускает быстрые стрелы и призывает рой чёрных насекомых. Рой преследует врага, ослабляет его и мешает спокойно удерживать позицию. Направляй цель к тесным проходам, где увернуться труднее всего.",
        rarity: "Легендарный"
    },
    time: {
        name: "Временной",
        description: "Временной умеет вернуться туда, где находился несколько секунд назад. Это помогает выйти из неудачного захода или неожиданно сменить дистанцию после атаки. Возврат меняет позицию, поэтому заранее подумай, куда приведёт тебя прошлый маршрут.",
        rarity: "Хроматическая"
    },
    machinegun: {
        name: "Пулемётчик",
        description: "Пулемётчик давит врага длинной очередью из частых выстрелов. Чем дольше держишь огонь, тем ближе перегрев и вынужденная пауза. Стреляй на ходу и заранее выбирай укрытие, где можно переждать охлаждение оружия.",
        rarity: "Необычная"
    },
    buckshot: {
        name: "Дробовой танк",
        description: "Дробовой выпускает плотный веер дроби. Вблизи весь залп может попасть в одну цель, но на расстоянии его сила быстро рассеивается. Найди момент для сближения и уходи за укрытие, пока оружие перезаряжается.",
        rarity: "Необычная"
    },
    waterjet: {
        name: "Водомётчик",
        description: "Водомёт выпускает струю, которая наносит урон и отталкивает противника. Ею удобно очищать проходы, сбивать наступление и прижимать врага к стене. После длинной очереди струе нужна перезарядка — не оставайся в этот момент вплотную к цели.",
        rarity: "Редкая"
    },
    imitator: {
        name: "Имитатор",
        description: "Имитатор начинает бой с собственным оружием, но его главная сила — временно принимать облик другого танка. Он подхватывает чужой стиль и меняет тактику прямо на ходу. Выбирай форму по ситуации: для наступления, отхода или неожиданного ответа.",
        rarity: "Хроматическая"
    },
    electric: {
        name: "Электрический",
        description: "Электрический заряд поворачивает к ближайшей цели и может задеть нескольких врагов. Ульта создаёт мощную зону поражения вокруг танка. Подпускай противников достаточно близко, чтобы ударить сразу по всей группе.",
        rarity: "Мифический"
    },
    burovoy: {
        name: "Буровой",
        description: "Вращающийся бур вгрызается в броню и мешает стрелять противнику, пока касается его. Ульта позволяет уйти под землю и пройти через преграды. Настигай цель коротким рывком: как только она выйдет из-под бура, блокировка стрельбы исчезнет.",
        rarity: "Мифический"
    },
    robot: {
        name: "Танк-робот",
        description: "Танк-робот бьёт быстрым пробивным снарядом и выпускает боевых дронов. Они создают перекрёстный огонь и заставляют врага следить за угрозой со всех сторон. Выбирай позицию так, чтобы техника могла поддержать атаку.",
        rarity: "Легендарный"
    },
    medical: {
        name: "Медицинский танк",
        description: "Медицинский импульс восстанавливает здоровье союзникам и наносит урон врагам. Этот танк особенно полезен в затяжном бою, когда команде важно удержать линию. Держись рядом с товарищами, но оставляй себе пространство для манёвра.",
        rarity: "Эпический"
    },
    mine: {
        name: "Минный танк",
        description: "Минный танк превращает маршрут противника в цепочку ловушек. Мины помогают защитить фланг или заставить врага ехать туда, где его уже ждут. Оставляй между ловушками место: ставить их друг на друга нельзя.",
        rarity: "Редкая"
    },
    roman: {
        name: "Римский танк",
        description: "Римский танк метает вращающийся клинок, который может отскочить от каменной стены. Его знамя призывает легионеров, которые сопровождают танк, метают копья и защищают его мечами. Если приходит конный центурион, отряд становится больше. Всадник сближается для укола копьём, а в тесной схватке берётся за длинный меч. Он гораздо живучее пехотинцев и сражается дольше.",
        rarity: "Хроматическая"
    },
    pyro: {
        name: "Зажигательный",
        description: "Зажигательный снаряд наносит урон при попадании и оставляет на цели огонь. Даже отступив за укрытие, противник продолжает расплачиваться за ошибку. Не спеши сближаться: повторные попадания поддерживают давление на расстоянии.",
        rarity: "Необычная"
    },
    air: {
        name: "Воздушный",
        description: "Воздушный танк отталкивает врагов своими снарядами и не даёт им легко сократить дистанцию. Используй выстрел, чтобы сорвать вражеский заход или освободить проход. Особенно полезен, когда рядом есть стена или опасная зона.",
        rarity: "Редкая"
    },
    spartan: {
        name: "Спартанский танк",
        description: "Спартанец метает копьё, которое может пройти сквозь нескольких врагов. Получив тяжёлые повреждения, танк ускоряется и получает шанс сменить ход боя. Используй прибавку скорости для точного захода или своевременного отхода.",
        rarity: "Редкая"
    },
    kamikaze: {
        name: "Камикадзе",
        description: "Камикадзе стреляет разрывными зарядами, задевая противников рядом с попаданием. Его главный приём — неуязвимый разгон с огненными следами: заранее выбери направление, а во время рывка лишь слегка корректируй курс клавишами движения. Проламывай стены и врывайся в скопление врагов. Столкновение завершает атаку мощным взрывом, но после него танк ненадолго замедляется и не может стрелять. Продумай отход заранее.",
        rarity: "Лимитированная"
    },
    myasnoy: {
        name: "Мясной",
        description: "Мясной поливает врагов веером живых сосудов и может разделиться посреди боя. Отделённый корпус продолжает стрелять сам, а подвижный глаз атакует лучом. Заходи с разных сторон, чтобы врагу было трудно ответить обеим формам.",
        rarity: "Лимитированная"
    },
    kvant: {
        name: "Квант",
        description: "Квантовый снаряд меняет форму в полёте и заставляет врага постоянно следить за траекторией. Ульта перегружает противников и ослабляет их ответный урон. Лови момент перегрузки, чтобы провести решающую атаку.",
        rarity: "Хроматическая"
    }
};

// Background gradients for tank previews (menu & modal)
// Colors follow user mapping: Обычный=grass, Редкий=green, Сверхредкий=blue,
// Эпический=purple, Легендарный=yellow, Мифический=red
const tankBgGradients = {
    normal: ['#1b5e20', '#1b5e20'],   // Обычный - dark grass green (menu & modal)
    ice: ['#9b59b6', '#8e44ad'],      // Эпический - purple
    buckshot: ['#2ecc71', '#27ae60'], // Редкий - green
    fire: ['#f9e04b', '#f1c40f'],     // Редкая - yellow
    waterjet: ['#f9e04b', '#f1c40f'],  // Редкая - yellow
    mine: ['#f9e04b', '#f1c40f'],     // Редкая - yellow
    buratino: ['#9b59b6', '#8e44ad'], // Эпический - purple
    toxic: ['#40f6d1', '#11a89c', '#06615b'],    // Легендарный - turquoise
    plasma: ['#ff2400', '#ba0020', '#660012'],   // Мифический - ало-бордовый
    burovoy: ['#ff2400', '#ba0020', '#660012'],  // Мифический - ало-бордовый
    musical: ['#9b59b6', '#8e44ad'],  // Эпический - purple
    illuminat: ['#ff2400', '#ba0020', '#660012'],// Мифический - ало-бордовый
    mirror: ['#40f6d1', '#11a89c', '#06615b'],   // Легендарный - turquoise
    egyptian: ['#40f6d1', '#11a89c', '#06615b'], // Легендарный - standard legendary
    time: ['rgba(0,0,0,0)', 'rgba(0,0,0,0)'], // Хроматическая - transparent for CSS anim
    roman: ['rgba(0,0,0,0)', 'rgba(0,0,0,0)'], // Хроматическая - animated like time
    kvant: ['rgba(0,0,0,0)', 'rgba(0,0,0,0)'],  // Хроматическая - animated like time
    spartan: ['#f9e04b', '#f1c40f'],       // Редкая - yellow
    machinegun: ['#2ecc71', '#27ae60'], // Редкий - green (like ice)
    pyro: ['#2ecc71', '#27ae60'],        // Редкий - green
    air: ['#2ecc71', '#27ae60'],          // Редкий - green
    imitator: ['rgba(0,0,0,0)', 'rgba(0,0,0,0)'], // Имитатор - animated via code
    electric: ['#ff2400', '#ba0020', '#660012'],  // Мифический - ало-бордовый
    robot:  ['#40f6d1', '#11a89c', '#06615b'],    // Легендарный - turquoise
    medical: ['#9b59b6', '#8e44ad'],   // Медицинский - purple (Эпический)
    kamikaze: ['#ff4400', '#cc2200'], // Лимитированный - red-orange
    myasnoy: ['#ff4400', '#cc2200'],  // Лимитированный — совпадает с камикадзе
};

// Base colors used in preview rendering (keeps menu and modal consistent)
const tankBaseColors = {
    normal: '#0000FF',
    ice: '#54d1e8',
    buckshot: '#455A64',
    fire: '#4c00ff',
    buratino: '#0000FF',
    toxic: '#0000FF',
    plasma: '#0000FF',
    burovoy: '#8b1e13',
    musical: '#0000FF',
    illuminat: '#0000FF',
    mirror: '#0000FF',
    egyptian: '#8c6a25',
    time: '#FF00FF',
    machinegun: '#0000FF',
    electric: '#1a1a2e',  // Dark blue-purple for robot
    robot:   '#263238',    // Dark steel for robot tank
    medical: '#0033ff',    // Bright blue for medical tank
    mine: '#3d4c18',       // Dark olive for mine tank
    roman: '#8B6914',      // Dark gold for Roman tank
    ai: '#0d1b2a',          // Dark navy for Квант
    spartan: '#b87333',    // Bronze for Spartan tank
    pyro: '#8b2500',        // Deep orange-red for Pyro tank
    air: '#00a896',          // Teal-cyan for Air tank
    kamikaze: '#FFFFFF', // White — Japanese imperial theme
    myasnoy: '#c03030',  // Deep flesh-red for Мясной tank
};

// Make available globally
window.tankDescriptions = tankDescriptions;
window.tankBgGradients  = tankBgGradients;
window.tankBaseColors   = tankBaseColors;

// Trio data: each tank belongs to exactly one trio (or null for illuminat)
// color: accent colour for the badge; icon: big badge icon; members: [type, emoji] pairs
const _trioTechno = {
    icon: '⚡', name: 'Техно-трио', color: '#00d4ff',
    members: [['electric','⚡'],['robot','🤖'],['plasma','💜']]
};
const _trioFire = {
    icon: '🔥', name: 'Огневое трио', color: '#ff6633',
    members: [['buckshot','🔱'],['machinegun','🔫'],['fire','🔥']]
};
const _trioTactic = {
    icon: '🏛', name: 'Древнейшее трио', color: '#d4a017',
    members: [['roman','🏛'],['spartan','⚔️'],['egyptian','𓂀']]
};
const _trioAnomaly = {
    icon: '🌀', name: 'Аномальное трио', color: '#cc44ff',
    members: [['time','⏰'],['imitator','🌈'],['illuminat','👁️']]
};
const _trioBase = {
    icon: '🛡️', name: 'Базовое трио', color: '#5dade2',
    members: [['normal','🔵'],['ice','❄️'],['waterjet','💧']]
};
const _trioControl = {
    icon: '☢️', name: 'Контролирующее трио', color: '#aaff00',
    members: [['mine','💣'],['buratino','🟡'],['toxic','☠️']]
};
const _trioSupport = {
    icon: '💫', name: 'Поддерживающее трио', color: '#00cc88',
    members: [['musical','🎵'],['medical','🩺'],['mirror','🪞']]
};
const tankTrios = {
    electric: _trioTechno, robot: _trioTechno, plasma: _trioTechno,
    buckshot: _trioFire, machinegun: _trioFire, fire: _trioFire,
    roman: _trioTactic, spartan: _trioTactic, egyptian: _trioTactic,
    normal: _trioBase, ice: _trioBase, waterjet: _trioBase,
    mine: _trioControl, buratino: _trioControl, toxic: _trioControl,
    musical: _trioSupport, medical: _trioSupport, mirror: _trioSupport,
    time: _trioAnomaly, imitator: _trioAnomaly, illuminat: _trioAnomaly,
    pyro: null,
};
window.tankTrios = tankTrios;
window.tankBgGradients = tankBgGradients;

// Preview canvas global access (defined in main.js, used here)

function drawMyasnoyTentacles(ctx, halfW, halfH, moveAnimation) {
    const motion = moveAnimation && typeof moveAnimation === 'object' ? moveAnimation : null;
    const strength = motion ? Math.max(0, Math.min(1, motion.strength || 0)) : 0;
    const phase = motion ? motion.phase || 0 : 0;
    const turn = motion ? Math.max(-0.16, Math.min(0.16, motion.turnVelocity || 0)) : 0;
    const size = Math.min(halfW, halfH);
    const count = 10;
    const swayTime = Date.now() * 0.0008;
    ctx.save();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    for (let i = 0; i < count; i++) {
        const angle = i * Math.PI * 2 / count + Math.PI / count;
        const nx = Math.cos(angle), ny = Math.sin(angle);
        const edge = Math.min(halfW / Math.max(0.01, Math.abs(nx)), halfH / Math.max(0.01, Math.abs(ny)));
        const rootX = nx * edge * 0.88;
        const rootY = ny * edge * 0.88;
        const stride = Math.sin(phase + (i % 2) * Math.PI) * strength;
        const sway = Math.sin(swayTime + i * 1.7) * size * 0.025;
        const reach = size * 0.68;
        const tipX = rootX + nx * reach + stride * size * 0.25 - turn * size * 1.2;
        const tipY = rootY + ny * reach + sway + Math.abs(stride) * ny * size * 0.08;
        const elbowX = rootX + nx * reach * 0.48 - stride * size * 0.08;
        const elbowY = rootY + ny * reach * 0.64 + sway * 0.5;
        const width = Math.max(0.9, size * 0.14);
        ctx.beginPath();
        ctx.moveTo(rootX, rootY);
        ctx.quadraticCurveTo(elbowX, elbowY, tipX, tipY);
        ctx.strokeStyle = '#430909';
        ctx.lineWidth = width * 2.2;
        ctx.stroke();
        ctx.strokeStyle = i % 3 === 0 ? '#db3b29' : '#af201a';
        ctx.lineWidth = width;
        ctx.stroke();
        ctx.fillStyle = '#7c1512';
        ctx.beginPath();
        ctx.ellipse(tipX, tipY, width * 0.95, width * 0.68, angle, 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.restore();
}

function drawMyasnoyEyeVessels(ctx, radius, moveAnimation) {
    const motion = moveAnimation && typeof moveAnimation === 'object' ? moveAnimation : null;
    const strength = motion ? Math.max(0, Math.min(1, motion.strength || 0)) : 0;
    const time = Date.now() * 0.0008;
    ctx.save();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    for (let i = 0; i < 7; i++) {
        const fan = (i - 3) / 3;
        const angle = Math.PI + fan * 0.85;
        const directionX = Math.cos(angle), directionY = Math.sin(angle);
        const normalX = -directionY, normalY = directionX;
        const rootX = directionX * radius * 0.86;
        const rootY = directionY * radius * 0.86;
        const length = radius * (1.1 + (1 - Math.abs(fan)) * 0.42);
        const bend = Math.sin(time + i * 0.95) * radius * (0.14 + strength * 0.07) + fan * radius * 0.07;
        const tipX = rootX + directionX * length + normalX * bend * 0.4;
        const tipY = rootY + directionY * length + normalY * bend * 0.4;
        const midX = rootX + directionX * length * 0.58 + normalX * bend * 0.3;
        const midY = rootY + directionY * length * 0.58 + normalY * bend * 0.3;
        const width = Math.max(1, radius * (0.11 + (1 - Math.abs(fan)) * 0.035));
        ctx.beginPath();
        ctx.moveTo(rootX, rootY);
        ctx.bezierCurveTo(rootX + directionX * length * 0.27 + normalX * bend,
            rootY + directionY * length * 0.27 + normalY * bend,
            rootX + directionX * length * 0.68 - normalX * bend * 0.35,
            rootY + directionY * length * 0.68 - normalY * bend * 0.35, tipX, tipY);
        ctx.strokeStyle = '#390606'; ctx.lineWidth = width * 2.2; ctx.stroke();
        ctx.strokeStyle = i % 2 ? '#a71b17' : '#ca3327'; ctx.lineWidth = width; ctx.stroke();

        for (const side of [-1, 1]) {
            const branchRootX = side < 0 ? midX : rootX + directionX * length * 0.38 + normalX * bend * 0.35;
            const branchRootY = side < 0 ? midY : rootY + directionY * length * 0.38 + normalY * bend * 0.35;
            const branchAngle = angle + side * (0.43 + (i % 2) * 0.08);
            const branchLength = length * (side < 0 ? 0.42 : 0.32);
            const branchX = branchRootX + Math.cos(branchAngle) * branchLength;
            const branchY = branchRootY + Math.sin(branchAngle) * branchLength;
            ctx.beginPath();
            ctx.moveTo(branchRootX, branchRootY);
            ctx.quadraticCurveTo(branchRootX + directionX * branchLength * 0.55,
                branchRootY + directionY * branchLength * 0.55, branchX, branchY);
            ctx.strokeStyle = '#390606'; ctx.lineWidth = width * 1.15; ctx.stroke();
            ctx.strokeStyle = '#a82119'; ctx.lineWidth = width * 0.5; ctx.stroke();
        }
    }
    ctx.restore();
}

function drawKamikazeFlag(ctx, x, y, width, height) {
    ctx.save();
    ctx.beginPath(); ctx.rect(x, y, width, height); ctx.clip();
    ctx.fillStyle = '#f5f5f5';
    ctx.fillRect(x, y, width, height);
    const cx = x + width / 2, cy = y + height / 2;
    const radius = Math.hypot(width, height);
    ctx.fillStyle = '#c91e2b';
    // Sixteen rays extend to the flag edges instead of ending in a circular badge.
    for (let i = 0; i < 16; i++) {
        const angle = i * Math.PI / 8;
        ctx.beginPath(); ctx.moveTo(cx, cy);
        ctx.arc(cx, cy, radius, angle - Math.PI / 32, angle + Math.PI / 32);
        ctx.closePath(); ctx.fill();
    }
    ctx.beginPath(); ctx.arc(cx, cy, Math.min(width, height) * 0.22, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
}

let tankFireSprite = null;

function getTankFireSprite() {
    if (tankFireSprite) return tankFireSprite;
    const art = document.createElement('canvas');
    art.width = 64; art.height = 96;
    const c = art.getContext('2d');
    const pixels = c.createImageData(art.width, art.height);
    const hash = (x, y) => {
        const value = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
        return value - Math.floor(value);
    };
    const noise = (x, y) => {
        const ix = Math.floor(x), iy = Math.floor(y);
        let fx = x - ix, fy = y - iy;
        fx = fx * fx * (3 - 2 * fx); fy = fy * fy * (3 - 2 * fy);
        const top = hash(ix, iy) * (1 - fx) + hash(ix + 1, iy) * fx;
        const bottom = hash(ix, iy + 1) * (1 - fx) + hash(ix + 1, iy + 1) * fx;
        return top * (1 - fy) + bottom * fy;
    };
    // Bake turbulent density and temperature once; animate the small wisps at draw time.
    for (let y = 0; y < art.height; y++) for (let x = 0; x < art.width; x++) {
        const height = y / art.height;
        const turbulence = noise(x / 10, y / 15) * 0.7 + noise(x / 3, y / 5) * 0.3;
        const center = Math.sin(height * 10) * 0.12 * (1 - height);
        const edge = 1 - Math.abs((x - 32) / 32 + center) / (0.12 + height * 0.48);
        const density = Math.max(0, Math.min(1, edge * 1.5 + (turbulence - 0.55) * 0.9));
        const temperature = Math.max(0, Math.min(1, edge * 0.65 + height * 0.2 + (turbulence - 0.5) * 0.4));
        const fade = Math.min(1, height * 9) * Math.min(1, (1 - height) * 15);
        const offset = (y * art.width + x) * 4;
        pixels.data[offset] = 180 + temperature * 75;
        pixels.data[offset + 1] = 28 + temperature * temperature * 208;
        pixels.data[offset + 2] = 3 + Math.pow(temperature, 6) * 85;
        pixels.data[offset + 3] = density * fade * 245;
    }
    c.putImageData(pixels, 0, 0);
    tankFireSprite = art;
    return art;
}

function drawTankDamage(ctx, unit) {
    if (window.effectsEnabled === false || !(unit.hp > 0) || unit.burovoyBurrowActive) return;
    const health = unit.hp / (unit.maxHp || 300);
    if (health >= 0.5) return;
    const size = Math.max(unit.w, unit.h);
    const angle = getTankEffectHullAngle(unit);
    const x = -unit.w * 0.27 * Math.cos(angle) - unit.h * 0.18 * Math.sin(angle);
    const y = -unit.w * 0.27 * Math.sin(angle) + unit.h * 0.18 * Math.cos(angle);
    const time = (window.frameCount || 0) / 60;
    ctx.save();
    const soot = ctx.createRadialGradient(x, y, 0, x, y, size * 0.18);
    soot.addColorStop(0, 'rgba(12, 13, 11, 0.7)');
    soot.addColorStop(1, 'rgba(26, 22, 17, 0)');
    ctx.fillStyle = soot;
    ctx.beginPath(); ctx.arc(x, y, size * 0.18, 0, Math.PI * 2); ctx.fill();
    if (health < 0.3) {
        const critical = health < 0.1;
        const fire = getTankFireSprite();
        const count = critical ? 5 : 3;
        const glowRadius = size * (critical ? 0.6 : 0.34);
        const glow = ctx.createRadialGradient(x, y, 0, x, y, glowRadius);
        glow.addColorStop(0, critical ? 'rgba(255,116,19,0.35)' : 'rgba(255,104,18,0.18)');
        glow.addColorStop(1, 'rgba(255,77,8,0)');
        ctx.fillStyle = glow;
        ctx.beginPath(); ctx.arc(x, y, glowRadius, 0, Math.PI * 2); ctx.fill();
        for (let i = 0; i < count; i++) {
            const pulse = 0.78 + Math.sin(time * (9 + i * 0.7) + i * 2.4) * 0.22;
            const height = size * (critical ? 0.82 : 0.5) * pulse;
            const width = size * (critical ? 0.46 : 0.32);
            ctx.save();
            ctx.translate(x + Math.sin(i * 3.7 + time * 1.3) * size * (critical ? 0.12 : 0.07), y + size * 0.06);
            ctx.rotate(Math.sin(time * 5 + i * 2.1) * 0.12);
            ctx.globalAlpha = 0.65 + pulse * 0.15;
            ctx.drawImage(fire, -width / 2, -height, width, height);
            ctx.restore();
        }
    }
    ctx.restore();
}

function drawTankDamageSmoke(ctx, smoke) {
    if (window.effectsEnabled === false) return;
    const age = 1 - smoke.life / smoke.maxLife;
    const width = smoke.size * (0.23 + age * (1.05 + smoke.stage * 0.08));
    ctx.save();
    ctx.translate(smoke.x, smoke.y);
    ctx.rotate(smoke.seed + age * 0.25);
    ctx.globalAlpha = Math.sin(age * Math.PI) * (smoke.stage === 1 ? 0.23 : smoke.stage === 2 ? 0.35 : 0.45);
    ctx.drawImage(getOrdnanceExplosionSprite('tankSmoke'), -width / 2, -width / 2, width, width);
    ctx.restore();
}

const tankOilArt = new WeakMap();

function getTankOilArt(oil) {
    let art = tankOilArt.get(oil);
    if (art) return art;
    art = document.createElement('canvas');
    art.width = art.height = 64;
    const c = art.getContext('2d');
    const seed = oil.seed || 0;
    const points = [];
    for (let i = 0; i < 16; i++) {
        const angle = i * Math.PI / 8;
        const radius = 21 * (1 + Math.sin(i * 2.3 + seed) * 0.16 + Math.cos(i * 4.7 + seed) * 0.09);
        points.push({ x: 32 + Math.cos(angle) * radius, y: 32 + Math.sin(angle) * radius * 0.86 });
    }
    c.beginPath();
    c.moveTo((points[0].x + points[15].x) / 2, (points[0].y + points[15].y) / 2);
    for (let i = 0; i < 16; i++) {
        const next = points[(i + 1) % 16];
        c.quadraticCurveTo(points[i].x, points[i].y, (points[i].x + next.x) / 2, (points[i].y + next.y) / 2);
    }
    c.closePath();
    const oilFill = c.createRadialGradient(25, 24, 2, 32, 32, 27);
    oilFill.addColorStop(0, 'rgba(14, 18, 14, 0.78)');
    oilFill.addColorStop(0.65, 'rgba(7, 10, 7, 0.82)');
    oilFill.addColorStop(1, 'rgba(17, 16, 10, 0.25)');
    c.fillStyle = oilFill; c.fill();
    c.save(); c.clip();
    // A broken, low-contrast reflection makes the surface wet without a bright outline.
    c.strokeStyle = 'rgba(102, 119, 108, 0.17)'; c.lineWidth = 1.1;
    c.beginPath(); c.ellipse(30, 30, 16, 12, -0.3, 3.7 + seed * 0.06, 4.9); c.stroke();
    c.strokeStyle = 'rgba(78, 94, 103, 0.2)'; c.lineWidth = 2.2;
    c.beginPath(); c.ellipse(34, 35, 10, 6, -0.2, 3.2, 4.5); c.stroke();
    c.restore();
    tankOilArt.set(oil, art);
    return art;
}

function drawTankOilTrail(ctx, oil) {
    if (window.effectsEnabled === false) return;
    const spread = 1 + (1 - Math.exp(-(oil.age || 0) / 28)) * 0.35;
    const width = (oil.visualRadius ?? oil.radius) * 3 * spread;
    ctx.save();
    ctx.translate(oil.x, oil.y);
    ctx.rotate(oil.angle);
    ctx.globalAlpha = Math.min(1, oil.life / 500) * (oil.inWater ? 0.28 : 1);
    ctx.drawImage(getTankOilArt(oil), -width * (oil.stretch || 1) / 2, -width / 2, width * (oil.stretch || 1), width);
    ctx.restore();
}

const tankWreckArt = new WeakMap();

function getTankWreckArt(wreck) {
    let art = tankWreckArt.get(wreck);
    if (art) return art;
    // Reuse the vehicle's own artwork so its armor and weapon remain recognizable.
    const extent = Math.max(wreck.width, wreck.height) * 4;
    art = document.createElement('canvas');
    art.width = art.height = Math.ceil(extent * 2);
    const c = art.getContext('2d');
    c.translate(art.width / 2, art.height / 2);
    c.scale(2, 2);
    c.filter = 'saturate(0.45) brightness(0.65)';
    if (wreck.isBoss) drawBossOn(c, wreck.width, wreck.height, 0, 1);
    else drawTankOn(c, 0, 0, wreck.width, wreck.height, wreck.color, 0, 1, wreck.tankType, null, 0);
    tankWreckArt.set(wreck, art);
    return art;
}

function drawTankWreck(ctx, wreck) {
    const size = wreck.radius;
    const age = wreck.age ?? 90;
    const travel = 1 - Math.exp(-age / 13);
    const flight = Math.min(1, age / 40);
    const art = getTankWreckArt(wreck);
    const extent = art.width / 2;
    ctx.save();
    ctx.translate(wreck.x, wreck.y);
    const soot = ctx.createRadialGradient(0, 0, size * 0.1, 0, 0, size * 1.65);
    soot.addColorStop(0, 'rgba(10, 10, 9, 0.6)');
    soot.addColorStop(0.65, 'rgba(23, 19, 15, 0.28)');
    soot.addColorStop(1, 'rgba(23, 19, 15, 0)');
    ctx.fillStyle = soot;
    ctx.beginPath(); ctx.arc(0, 0, size * 1.65, 0, Math.PI * 2); ctx.fill();

    ctx.save();
    ctx.rotate(wreck.hullAngle);
    // Jagged cuts pull the original hull apart, keeping its tracks and surface detail.
    for (const side of [-1, 1]) {
        ctx.save();
        ctx.translate(side * size * 0.2 * travel, side * size * 0.1 * travel);
        ctx.rotate(side * 0.13 * travel);
        ctx.beginPath();
        ctx.moveTo(side * size * 1.08, -size * 1.22);
        ctx.lineTo(side * size * 0.12, -size * 1.22);
        ctx.lineTo(side * size * 0.26, -size * 0.48);
        ctx.lineTo(-side * size * 0.08, -size * 0.15);
        ctx.lineTo(side * size * 0.2, size * 0.12);
        ctx.lineTo(side * size * 0.02, size * 0.48);
        ctx.lineTo(side * size * 0.16, size * 1.22);
        ctx.lineTo(side * size * 1.08, size * 1.22);
        ctx.closePath();
        ctx.clip();
        ctx.beginPath();
        ctx.rect(-extent / 2, -extent / 2, extent, extent);
        ctx.rect(size * 0.58, -size * 0.23, size * 1.8, size * 0.46);
        ctx.clip('evenodd');
        ctx.drawImage(art, -extent / 2, -extent / 2, extent, extent);
        ctx.restore();
    }
    // Torn armor exposes a dark engine bay, ribs, and severed pipes.
    const cavity = ctx.createRadialGradient(-size * 0.07, -size * 0.07, 0, 0, 0, size * 0.64);
    cavity.addColorStop(0, '#080b0a'); cavity.addColorStop(0.65, '#161b17');
    cavity.addColorStop(0.88, '#4c4d3c'); cavity.addColorStop(1, '#252b23');
    ctx.fillStyle = cavity; ctx.strokeStyle = '#101610'; ctx.lineWidth = Math.max(1, size * 0.06);
    ctx.beginPath();
    for (let i = 0; i < 14; i++) {
        const a = i * Math.PI / 7;
        const rough = 0.87 + Math.sin(i * 3.7 + wreck.seed * 8) * 0.14;
        const x = Math.cos(a) * size * 0.58 * rough;
        const y = Math.sin(a) * size * 0.46 * rough;
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#444b43';
    ctx.fillRect(-size * 0.3, -size * 0.2, size * 0.43, size * 0.33);
    ctx.strokeStyle = '#8a8d77'; ctx.lineWidth = Math.max(0.6, size * 0.035);
    for (let rib = 0; rib < 4; rib++) {
        const x = size * (-0.26 + rib * 0.1);
        ctx.beginPath(); ctx.moveTo(x, -size * 0.18); ctx.lineTo(x, size * 0.1); ctx.stroke();
    }
    ctx.strokeStyle = '#383c32'; ctx.lineWidth = Math.max(1, size * 0.07);
    ctx.beginPath(); ctx.moveTo(size * 0.1, -size * 0.25);
    ctx.bezierCurveTo(size * 0.4, -size * 0.35, size * 0.12, size * 0.25, size * 0.4, size * 0.3); ctx.stroke();
    ctx.strokeStyle = '#9c7044'; ctx.lineWidth = Math.max(0.8, size * 0.035);
    ctx.beginPath(); ctx.moveTo(size * 0.05, -size * 0.95);
    ctx.lineTo(size * 0.18, -size * 0.65); ctx.lineTo(size * 0.06, -size * 0.5); ctx.stroke();
    ctx.restore();

    // A short section of the original running gear lands separately from the hull.
    ctx.save();
    ctx.translate(-size * 1.1 * travel, size * 1.05 * travel);
    ctx.rotate(wreck.hullAngle - travel * 0.55);
    ctx.beginPath(); ctx.rect(-wreck.width * 0.32, -wreck.height * 0.09, wreck.width * 0.64, wreck.height * 0.18); ctx.clip();
    ctx.drawImage(art, -extent / 2, -extent / 2 + wreck.height * 0.5, extent, extent);
    ctx.restore();

    // Cut the detached turret and its original barrel from the same texture.
    ctx.save();
    const turretX = size * (1.6 + wreck.seed * 0.45) * travel;
    const turretY = -size * (0.5 + wreck.seed * 0.3) * travel;
    ctx.globalAlpha = 0.3;
    ctx.fillStyle = '#11160e';
    ctx.beginPath(); ctx.ellipse(turretX, turretY + 3, size * 0.7, size * 0.4, 0, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = 1;
    ctx.translate(turretX, turretY - Math.sin(flight * Math.PI) * size * 1.2);
    ctx.rotate(wreck.turretAngle + (0.5 + wreck.seed * 0.9) * travel);
    ctx.beginPath();
    ctx.roundRect(-size * 0.67, -size * 0.67, size * 1.34, size * 1.34, size * 0.06);
    ctx.rect(0, -size * 0.24, size * 2.2, size * 0.48);
    ctx.clip();
    ctx.drawImage(art, -extent / 2, -extent / 2, extent, extent);
    ctx.restore();

    ctx.fillStyle = '#4e544a'; ctx.strokeStyle = '#acaa8e'; ctx.lineWidth = Math.max(0.6, size * 0.025);
    for (let i = 0; i < 8; i++) {
        const angle = wreck.seed * 6 + i * 1.65;
        const distance = size * (1.1 + (i % 3) * 0.4) * travel;
        ctx.save(); ctx.translate(Math.cos(angle) * distance, Math.sin(angle) * distance - Math.sin(flight * Math.PI) * size * (0.3 + i * 0.05));
        ctx.rotate(angle + (1 - travel) * 2);
        ctx.beginPath(); ctx.moveTo(-size * 0.15, -size * 0.06);
        ctx.lineTo(size * 0.13, -size * 0.1); ctx.lineTo(size * 0.06, size * 0.1);
        ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.restore();
    }
    if (age < 180 && window.effectsEnabled !== false) {
        const fade = Math.min(1, age / 20) * (1 - age / 180);
        ctx.globalAlpha = fade * 0.8;
        ctx.drawImage(getOrdnanceExplosionSprite('ember'), -size * 0.35, -size * 0.3, size * 0.7, size * 0.7);
        for (let i = 0; i < 3; i++) {
            const rise = (age / 65 + i / 3) % 1;
            const width = size * (0.6 + rise);
            ctx.globalAlpha = fade * (1 - rise) * 0.35;
            ctx.drawImage(getOrdnanceExplosionSprite('tankSmoke'), -width / 2 + rise * size * 0.2, -width / 2 - rise * size * 1.4, width, width);
        }
    }
    ctx.restore();
}

function drawTankOn(ctx, cx, cy, W, H, color, turretAngle, turretScale = 1, type = 'normal', heatState = null, moveAnimation = 0) {
    if (!isFinite(cx) || !isFinite(cy) || !W || !H || !isFinite(W) || !isFinite(H)) return;
    
    // Scale mechRocket 1.25x larger
    if (type === 'mechRocket') {
        W *= 1.25;
        H *= 1.25;
    }
    
    ctx.save();
    ctx.translate(cx, cy);
    const spartanRage = type === 'spartan' && !!heatState?.spartanRage;

    let isBurovoyFullyBurrowed = false;

    if (type === 'burovoy' && heatState && heatState.burovoyBurrowActive) {
        const burrowPhase = Math.max(0, Math.min(1, heatState.burovoyBurrowPhase || 0));
        const sinkIntro = Math.max(0, Math.min(1, burrowPhase / 0.22));
        const hullRadius = Math.max(W, H) * 0.62;
        const holeRadius = hullRadius * (0.43 + sinkIntro * 0.55);
        const tracePit = (radius) => {
            ctx.beginPath();
            for (let i = 0; i <= 16; i++) {
                const angle = i * Math.PI / 8;
                const roughness = 1 + Math.sin(i * 4.7) * 0.065 + Math.cos(i * 2.3) * 0.04;
                const px = Math.cos(angle) * radius * roughness;
                const py = Math.sin(angle) * radius * roughness * 0.78;
                if (i === 0) ctx.moveTo(px, py);
                else ctx.lineTo(px, py);
            }
            ctx.closePath();
        };
        const shadow = ctx.createRadialGradient(0, 0, holeRadius * 0.55, 0, 0, holeRadius * 1.6);
        shadow.addColorStop(0, 'rgba(28,22,15,0.32)');
        shadow.addColorStop(0.68, 'rgba(44,34,23,0.2)');
        shadow.addColorStop(1, 'rgba(44,34,23,0)');
        tracePit(holeRadius * 1.6);
        ctx.fillStyle = shadow; ctx.fill();
        const soil = ctx.createLinearGradient(0, -holeRadius, 0, holeRadius);
        soil.addColorStop(0, '#aa8250'); soil.addColorStop(0.42, '#78603c'); soil.addColorStop(1, '#493925');
        tracePit(holeRadius * 1.32);
        ctx.fillStyle = soil; ctx.fill();
        const depth = ctx.createRadialGradient(0, holeRadius * 0.16, holeRadius * 0.08, 0, 0, holeRadius);
        depth.addColorStop(0, '#100e0b'); depth.addColorStop(0.62, '#1c1710');
        depth.addColorStop(0.86, '#3b2b1b'); depth.addColorStop(1, '#765432');
        tracePit(holeRadius);
        ctx.fillStyle = depth; ctx.fill();
        ctx.strokeStyle = 'rgba(189,150,95,0.45)'; ctx.lineWidth = Math.max(0.8, W * 0.02);
        tracePit(holeRadius * 1.14); ctx.stroke();
        for (let i = 0; i < 11; i++) {
            const angle = i * Math.PI * 2 / 11 + Math.sin(i * 7.1) * 0.17;
            const distance = holeRadius * (1.15 + (i % 4) * 0.095);
            const pebbleSize = Math.max(0.8, W * (0.025 + (i % 3) * 0.01));
            ctx.fillStyle = i % 3 ? '#705638' : '#b18c59';
            ctx.beginPath();
            ctx.ellipse(Math.cos(angle) * distance, Math.sin(angle) * distance * 0.8,
                pebbleSize * 1.45, pebbleSize * 0.7, angle, 0, Math.PI * 2);
            ctx.fill();
        }

        if (sinkIntro >= 0.985) {
            isBurovoyFullyBurrowed = true;
            ctx.restore();
            return;
        } else {
            ctx.rotate(sinkIntro * sinkIntro * 0.26);
            ctx.globalAlpha = 1 - sinkIntro * 0.42;
            ctx.beginPath();
            ctx.arc(0, 0, Math.max(4, hullRadius * (1 - Math.pow(sinkIntro, 0.72) * 0.94)), 0, Math.PI * 2);
            ctx.clip();
        }
    }

    // Freestanding circular range target with a narrow folding support.
    if (type === 'dummy') {
        const side = Math.min(W, H);
        ctx.fillStyle = 'rgba(19,26,23,0.35)';
        ctx.beginPath(); ctx.ellipse(0, H*0.42, W*0.36, H*0.09, 0, 0, Math.PI*2); ctx.fill();
        ctx.strokeStyle = '#4f584d'; ctx.lineWidth = Math.max(1.4, side*0.055);
        ctx.beginPath(); ctx.moveTo(-W*0.12, H*0.11); ctx.lineTo(-W*0.23, H*0.36);
        ctx.moveTo(W*0.12, H*0.11); ctx.lineTo(W*0.23, H*0.36); ctx.stroke();
        ctx.fillStyle = '#777b68';
        ctx.beginPath(); ctx.roundRect(-W*0.29, H*0.34, W*0.58, H*0.075, H*0.03); ctx.fill();

        const targetY = -H*0.075, radius = side*0.39;
        ctx.fillStyle = '#29332f';
        ctx.beginPath(); ctx.arc(0, targetY, radius+side*0.055, 0, Math.PI*2); ctx.fill();
        const rim = ctx.createRadialGradient(-radius*0.3, targetY-radius*0.35, radius*0.05, 0, targetY, radius);
        rim.addColorStop(0, '#eee7d3'); rim.addColorStop(0.78, '#bfc4b3'); rim.addColorStop(1, '#788379');
        ctx.fillStyle = rim;
        ctx.beginPath(); ctx.arc(0, targetY, radius, 0, Math.PI*2); ctx.fill();
        if (side >= 70) {
            ctx.strokeStyle = '#bd9860'; ctx.lineWidth = Math.max(2, side*0.045);
            ctx.beginPath(); ctx.arc(0, targetY, radius*0.91, 0, Math.PI*2); ctx.stroke();
            ctx.fillStyle = '#d1ae71';
            for (const direction of [-1, 1]) {
                ctx.beginPath(); ctx.roundRect(direction*W*0.39-W*0.04, targetY-H*0.11, W*0.08, H*0.22, H*0.025); ctx.fill();
            }
        }
        ctx.fillStyle = '#b45e47';
        ctx.beginPath(); ctx.arc(0, targetY, radius*0.72, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = '#eee7d3';
        ctx.beginPath(); ctx.arc(0, targetY, radius*0.46, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = '#854a37';
        ctx.beginPath(); ctx.arc(0, targetY, radius*0.22, 0, Math.PI*2); ctx.fill();
        ctx.strokeStyle = 'rgba(45,55,48,0.5)'; ctx.lineWidth = Math.max(0.7, side*0.02);
        ctx.beginPath(); ctx.moveTo(-radius*0.12, targetY); ctx.lineTo(radius*0.12, targetY);
        ctx.moveTo(0, targetY-radius*0.12); ctx.lineTo(0, targetY+radius*0.12); ctx.stroke();
        ctx.fillStyle = '#d9cfad';
        for (let i=0; i<4; i++) {
            const angle = i*Math.PI/2+Math.PI/4;
            ctx.beginPath(); ctx.arc(Math.cos(angle)*(radius+side*0.024), targetY+Math.sin(angle)*(radius+side*0.024),
                Math.max(0.55, side*0.024), 0, Math.PI*2); ctx.fill();
        }
        ctx.restore();
        return;
    }

    // Myasnoy eye form — draw as detached eyeball with blood-vessel tentacles, no turret/barrel
    if (type === 'myasnoy' && heatState && heatState.myasnoyEyeForm) {
        const _eyT = Date.now() * 0.0018;
        const _eyR = Math.min(W, H) * 0.44;
        const _sepPulse = Math.max(0, Math.min(1, heatState.myasnoySeparationPulse || 0));
        if (_sepPulse > 0) {
            const _memR = _eyR * (1.1 + _sepPulse * 1.15);
            const _memG = ctx.createRadialGradient(0, 0, _eyR * 0.45, 0, 0, _memR);
            _memG.addColorStop(0, 'rgba(255,180,150,0.18)');
            _memG.addColorStop(0.55, `rgba(180,20,20,${0.16 + _sepPulse * 0.10})`);
            _memG.addColorStop(1, 'rgba(80,0,0,0)');
            ctx.fillStyle = _memG;
            ctx.beginPath(); ctx.arc(0, 0, _memR, 0, Math.PI * 2); ctx.fill();
            ctx.save();
            ctx.globalAlpha = 0.45 + _sepPulse * 0.25;
            ctx.strokeStyle = '#7a0505';
            ctx.lineWidth = Math.max(1, _eyR * 0.08 * _sepPulse);
            ctx.beginPath(); ctx.arc(0, 0, _memR * 0.82, 0, Math.PI * 2); ctx.stroke();
            ctx.restore();
        }
        // Outer glow halo
        const _eyGlow = ctx.createRadialGradient(0, 0, _eyR * 0.6, 0, 0, _eyR * 2.4);
        _eyGlow.addColorStop(0, 'rgba(200,0,0,0.30)');
        _eyGlow.addColorStop(1, 'rgba(200,0,0,0)');
        ctx.fillStyle = _eyGlow;
        ctx.beginPath(); ctx.arc(0, 0, _eyR * 2.4, 0, Math.PI * 2); ctx.fill();
        // Blood vessels stream behind the eye while the pupil tracks aim.
        ctx.save();
        const eyeMotion = moveAnimation && typeof moveAnimation === 'object' ? moveAnimation : null;
        const eyeHeading = eyeMotion && (eyeMotion.strength || 0) > 0.05 ? (eyeMotion.angle || 0) : turretAngle;
        ctx.rotate(eyeHeading);
        drawMyasnoyEyeVessels(ctx, _eyR, moveAnimation);
        ctx.restore();
        // Sweeping eye beam — scans across the attack arc while the timer counts down
        if (heatState && (heatState.myasnoyAttackTimer || 0) > 0) {
            const _atMax  = MYASNOY_EYE_ATTACK_DURATION;
            const _atA    = heatState.myasnoyAttackTimer / _atMax; // 1→0 as attack fades
            const _atRange = W * MYASNOY_EYE_ATTACK_RANGE_MULT;
            const _halfArc = MYASNOY_EYE_ATTACK_HALF_ARC;
            const _attackAngle = heatState.myasnoyAttackAngle ?? turretAngle;
            // Sweep progress: beam starts at left edge and sweeps right
            const _sweep  = Math.min(1, (_atMax + 1 - heatState.myasnoyAttackTimer) / _atMax);
            const _beamAng = _attackAngle - _halfArc + _sweep * _halfArc * 2;
            ctx.save();
            // Already-burned area (behind the beam)
            ctx.globalAlpha = 0.48;
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.arc(0, 0, _atRange, _attackAngle - _halfArc, _beamAng);
            ctx.closePath();
            const _burnG = ctx.createRadialGradient(0, 0, 0, 0, 0, _atRange);
            _burnG.addColorStop(0, 'rgba(255,80,0,0.9)');
            _burnG.addColorStop(0.5, 'rgba(180,0,0,0.5)');
            _burnG.addColorStop(1, 'rgba(80,0,0,0)');
            ctx.fillStyle = _burnG;
            ctx.fill();
            // Central bright sweeping beam ray
            ctx.globalAlpha = 0.85 + _atA * 0.15;
            const _bx = Math.cos(_beamAng) * _atRange;
            const _by = Math.sin(_beamAng) * _atRange;
            const _beamLineG = ctx.createLinearGradient(0, 0, _bx, _by);
            _beamLineG.addColorStop(0, 'rgba(255,240,200,1)');
            _beamLineG.addColorStop(0.18, 'rgba(255,120,0,0.9)');
            _beamLineG.addColorStop(1, 'rgba(180,0,0,0)');
            ctx.strokeStyle = _beamLineG;
            ctx.lineWidth = _atRange * 0.06;
            ctx.lineCap = 'round';
            ctx.shadowColor = '#ff4400'; ctx.shadowBlur = 22;
            ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(_bx, _by); ctx.stroke();
            ctx.shadowBlur = 0;
            // Bright flare at beam tip
            ctx.globalAlpha = 0.7;
            const _flG = ctx.createRadialGradient(_bx, _by, 0, _bx, _by, _atRange * 0.18);
            _flG.addColorStop(0, 'rgba(255,200,100,0.9)');
            _flG.addColorStop(1, 'rgba(200,0,0,0)');
            ctx.fillStyle = _flG;
            ctx.beginPath(); ctx.arc(_bx, _by, _atRange * 0.18, 0, Math.PI*2); ctx.fill();
            // Arc boundary line
            ctx.globalAlpha = Math.max(0.35, _atA * 0.7);
            ctx.strokeStyle = 'rgba(255,60,0,0.8)'; ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(0, 0, _atRange, _attackAngle - _halfArc, _beamAng);
            ctx.stroke();
            ctx.restore();
        }
        if (heatState && (heatState.myasnoyHypnoBeamTimer || 0) > 0) {
            const _hypMax = 24;
            const _hypA = Math.max(0, Math.min(1, heatState.myasnoyHypnoBeamTimer / _hypMax));
            const _hypRange = Math.min(W, H) * 1.6;
            const _hypHalfArc = Math.PI * 0.48;
            const _hypPulse = 0.7 + 0.3 * Math.sin(_eyT * 12);
            ctx.save();
            ctx.globalAlpha = 0.42 + _hypA * 0.22;
            const _hypCone = ctx.createRadialGradient(0, 0, 0, 0, 0, _hypRange);
            _hypCone.addColorStop(0, 'rgba(250,235,255,0.88)');
            _hypCone.addColorStop(0.35, 'rgba(188,108,255,0.56)');
            _hypCone.addColorStop(1, 'rgba(120,30,160,0)');
            ctx.fillStyle = _hypCone;
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.arc(0, 0, _hypRange, turretAngle - _hypHalfArc, turretAngle + _hypHalfArc);
            ctx.closePath();
            ctx.fill();
            ctx.globalAlpha = 0.9;
            const _hypBeamG = ctx.createLinearGradient(0, 0, Math.cos(turretAngle) * _hypRange, Math.sin(turretAngle) * _hypRange);
            _hypBeamG.addColorStop(0, 'rgba(255,255,255,0.95)');
            _hypBeamG.addColorStop(0.25, `rgba(214,149,255,${(0.95 * _hypPulse).toFixed(2)})`);
            _hypBeamG.addColorStop(1, 'rgba(112,34,168,0)');
            ctx.strokeStyle = _hypBeamG;
            ctx.lineWidth = Math.max(4, _eyR * 0.28);
            ctx.lineCap = 'round';
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(Math.cos(turretAngle) * _hypRange, Math.sin(turretAngle) * _hypRange);
            ctx.stroke();
            ctx.strokeStyle = `rgba(232,200,255,${(0.55 + _hypA * 0.25).toFixed(2)})`;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(0, 0, _hypRange, turretAngle - _hypHalfArc, turretAngle + _hypHalfArc);
            ctx.stroke();
            ctx.restore();
        }
        // Sclera
        const _sclG = ctx.createRadialGradient(-_eyR*0.2, -_eyR*0.2, 0, 0, 0, _eyR);
        _sclG.addColorStop(0, '#fff8ef'); _sclG.addColorStop(1, '#e8d0b0');
        ctx.beginPath(); ctx.arc(0, 0, _eyR, 0, Math.PI * 2); ctx.fillStyle = _sclG; ctx.fill();
        ctx.strokeStyle = 'rgba(90,0,0,0.55)'; ctx.lineWidth = 1.5; ctx.stroke();
        // Blood veins on sclera
        ctx.save(); ctx.strokeStyle = 'rgba(180,0,0,0.38)'; ctx.lineWidth = 0.9;
        for (let _vi = 0; _vi < 6; _vi++) {
            const _va2 = (_vi / 6) * Math.PI * 2 + 0.25;
            ctx.beginPath();
            ctx.moveTo(Math.cos(_va2)*_eyR*0.62, Math.sin(_va2)*_eyR*0.62);
            ctx.quadraticCurveTo(Math.cos(_va2+0.15)*_eyR*0.8, Math.sin(_va2+0.15)*_eyR*0.8,
                Math.cos(_va2+0.22)*_eyR*0.94, Math.sin(_va2+0.22)*_eyR*0.94);
            ctx.stroke();
        }
        ctx.restore();
        // Iris
        ctx.beginPath(); ctx.arc(0, 0, _eyR * 0.58, 0, Math.PI * 2); ctx.fillStyle = '#8c2800'; ctx.fill();
        // Pupil tracks turret direction
        const _pOff = _eyR * 0.13;
        const _pX = Math.cos(turretAngle) * _pOff;
        const _pY = Math.sin(turretAngle) * _pOff;
        ctx.beginPath(); ctx.arc(_pX, _pY, _eyR * 0.31, 0, Math.PI * 2); ctx.fillStyle = '#080808'; ctx.fill();
        // Highlight
        ctx.beginPath(); ctx.arc(-_eyR*0.23, -_eyR*0.23, _eyR*0.14, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255,255,255,0.82)'; ctx.fill();
        ctx.restore();
        return; // No turret or barrel for the eye
    }

    const hullAngle = moveAnimation && typeof moveAnimation === 'object' ? (moveAnimation.angle || 0) : 0;
    ctx.rotate(hullAngle);
    if (type === 'illuminat' || type === 'mechDiy' || type === 'mechShield' || type === 'mechRocket') {
         // See turret section for actual drawing
         // We do nothing here for body/tracks because the mech IS the body and turret united.
    } else {
        if (type === 'fire') {
            W *= 1.2; // make wider
        } else if (type === 'buratino') {
            W *= 1.1; // make longer
        } else if (type === 'machinegun') {
            W *= 0.9; // make narrower for agility
            H *= 1.1; // make slightly longer
        }
        // Draw the running gear before the hull.
        const trackThick = Math.max(4, W * 0.12);
        if (type === 'roman' || type === 'egyptian' || type === 'spartan') {
            const wheelLength = W * 0.25, wheelWidth = Math.max(5, W * 0.16);
            const rotation = moveAnimation && typeof moveAnimation === 'object' ? (moveAnimation.travel || 0) * Math.PI * 2 / 17.6 : 0;
            const egyptianWheel = type === 'egyptian';
            const spartanWheel = type === 'spartan';
            for (const side of [-1, 1]) for (const axle of [-1, 1]) {
                const x = axle * W * 0.31, y = side * H / 2;
                ctx.fillStyle = egyptianWheel ? '#51412a' : spartanWheel ? '#4c3020' : '#382c21'; ctx.strokeStyle = '#201912'; ctx.lineWidth = 0.8;
                ctx.beginPath(); ctx.roundRect(x - wheelLength / 2, y - wheelWidth / 2, wheelLength, wheelWidth, wheelWidth * 0.25); ctx.fill(); ctx.stroke();
                ctx.fillStyle = egyptianWheel ? '#b08a50' : spartanWheel ? '#b8793d' : '#9c713b';
                ctx.beginPath(); ctx.roundRect(x - wheelLength * 0.36, y - wheelWidth * 0.3, wheelLength * 0.72, wheelWidth * 0.6, 1); ctx.fill();
                ctx.strokeStyle = egyptianWheel ? '#e1c184' : spartanWheel ? (spartanRage ? '#f2cd8b' : '#e1b978') : '#d0a665'; ctx.lineWidth = Math.max(0.6, W * 0.012);
                ctx.beginPath(); ctx.moveTo(x + Math.cos(rotation) * wheelLength * 0.23, y - wheelWidth * 0.23);
                ctx.lineTo(x - Math.cos(rotation) * wheelLength * 0.23, y + wheelWidth * 0.23); ctx.stroke();
                ctx.fillStyle = '#e2bd79'; ctx.beginPath(); ctx.arc(x, y, Math.max(0.7, W * 0.018), 0, Math.PI * 2); ctx.fill();
            }
        } else if (type === 'air') {
            // Two floating ribbons of wind take the place of physical tracks.
            const travel = moveAnimation && typeof moveAnimation === 'object' ? (moveAnimation.travel || 0) : 0;
            const phase = travel * Math.PI * 2 / 17.6;
            for (const side of [-1, 1]) {
                const y = side * H * 0.52;
                ctx.save();
                ctx.lineCap = 'round'; ctx.lineJoin = 'round';
                const wind = ctx.createLinearGradient(0, y - H * 0.12, 0, y + H * 0.12);
                wind.addColorStop(0, 'rgba(111,225,218,0.54)');
                wind.addColorStop(0.5, 'rgba(35,164,159,0.45)');
                wind.addColorStop(1, 'rgba(151,238,229,0.45)');
                ctx.fillStyle = wind;
                ctx.beginPath();
                ctx.moveTo(-W * 0.43, y);
                ctx.bezierCurveTo(-W * 0.40, y - H * 0.13, W * 0.39, y - H * 0.13, W * 0.46, y);
                ctx.bezierCurveTo(W * 0.39, y + H * 0.13, -W * 0.40, y + H * 0.13, -W * 0.43, y);
                ctx.closePath(); ctx.fill();
                ctx.strokeStyle = 'rgba(195,250,241,0.58)'; ctx.lineWidth = Math.max(0.7, W * 0.018);
                ctx.beginPath(); ctx.moveTo(-W * 0.40, y);
                ctx.bezierCurveTo(-W * 0.29, y - side * H * 0.095, W * 0.30, y - side * H * 0.095, W * 0.43, y);
                ctx.stroke();
                for (let i = 0; i < 3; i++) {
                    const x = W * (-0.27 + i * 0.27) + Math.sin(phase + i * 1.8) * W * 0.035;
                    const ripple = Math.sin(phase + i * 1.8) * H * 0.015;
                    ctx.strokeStyle = 'rgba(225,255,249,0.65)';
                    ctx.beginPath(); ctx.moveTo(x - W * 0.075, y + side * H * 0.025 + ripple);
                    ctx.quadraticCurveTo(x, y - side * H * 0.035 + ripple, x + W * 0.075, y + ripple); ctx.stroke();
                }
                ctx.restore();
            }
        } else if (type !== 'myasnoy' && !isBurovoyFullyBurrowed) {
            const offset = moveAnimation && typeof moveAnimation === 'object' ? (moveAnimation.travel || 0) % 4.4 : 0;
            for (const side of [-1, 1]) {
                const y = side * H / 2, half = trackThick / 2;
                ctx.save();
                const iceTrack = type === 'ice';
                const metal = ctx.createLinearGradient(0, y - half, 0, y + half);
                metal.addColorStop(0, iceTrack ? '#ffffff' : '#5a625b');
                metal.addColorStop(0.5, iceTrack ? '#e9f7fa' : '#343d37');
                metal.addColorStop(1, iceTrack ? '#a9cdd7' : '#202924');
                ctx.fillStyle = metal; ctx.strokeStyle = iceTrack ? '#7da7b4' : '#161d19'; ctx.lineWidth = 0.7;
                ctx.beginPath(); ctx.roundRect(-W / 2, y - half, W, trackThick, half); ctx.fill(); ctx.stroke();
                ctx.clip();
                ctx.strokeStyle = iceTrack ? 'rgba(92,153,169,0.5)' : 'rgba(12,19,15,0.65)';
                ctx.lineWidth = 0.7; ctx.beginPath();
                for (let x = -W / 2 - offset; x < W / 2; x += 4.4) {
                    ctx.moveTo(x, y - half); ctx.lineTo(x, y + half);
                }
                ctx.stroke();
                ctx.restore();
            }
        }
        // body (between tracks); myasnoy fills full height since no tracks
        const bodyW = W - 4;
        const bodyH = type === 'myasnoy' ? H - 8 : H - trackThick - 4;

        if (type === 'normal') {
            // Modern Military Tank
            const grad = ctx.createLinearGradient(-bodyW/2, 0, bodyW/2, 0);
            grad.addColorStop(0, '#556B2F'); grad.addColorStop(1, '#6B8E23');
            ctx.fillStyle = grad;
            ctx.fillRect(-bodyW/2, -bodyH/2, bodyW, bodyH);
            // Armor plates
            ctx.fillStyle = 'rgba(0,0,0,0.2)';
            ctx.fillRect(-bodyW/2 + 4, -bodyH/2 + 4, bodyW/2 - 4, bodyH/2 - 4);
            ctx.fillRect(0, 0, bodyW/2 - 4, bodyH/2 - 4);
        } else if (type === 'ice') {
            // Deep Glacial Body
            const grad = ctx.createLinearGradient(-bodyW/2, -bodyH/2, bodyW/2, bodyH/2);
            grad.addColorStop(0, '#2980b9'); // Darker blue start
            grad.addColorStop(0.5, '#6dd5fa');
            grad.addColorStop(1, '#ffffff'); // Icy white end
            ctx.fillStyle = grad;
            ctx.fillRect(-bodyW/2, -bodyH/2, bodyW, bodyH);
            
            // Ice Shards / Cracks pattern
            ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
            ctx.beginPath();
            ctx.moveTo(-bodyW/2, -bodyH/2); ctx.lineTo(-bodyW/2 + 10, 0); ctx.lineTo(0, -bodyH/2 + 5);
            ctx.fill();
            ctx.beginPath();
            ctx.moveTo(bodyW/2, bodyH/2); ctx.lineTo(bodyW/2 - 15, 0); ctx.lineTo(0, bodyH/2 - 5);
            ctx.fill();
            
            // Crisp outline
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
            ctx.lineWidth = 1;
            ctx.strokeRect(-bodyW/2, -bodyH/2, bodyW, bodyH);
        } else if (type === 'fire') {
            // Armored fuel carrier with separate tanks and protected feed lines.
            const hull = ctx.createLinearGradient(0, -bodyH/2, 0, bodyH/2);
            hull.addColorStop(0, '#e8a45f'); hull.addColorStop(0.42, '#b75329'); hull.addColorStop(1, '#65301f');
            ctx.fillStyle = hull; ctx.strokeStyle = '#181c1b'; ctx.lineWidth = 1.2;
            ctx.beginPath(); ctx.roundRect(-bodyW/2, -bodyH/2, bodyW, bodyH, bodyH*0.1); ctx.fill(); ctx.stroke();
            ctx.fillStyle = '#4c2520';
            ctx.fillRect(-bodyW*0.35, -bodyH*0.41, bodyW*0.18, bodyH*0.82);
            for (const side of [-1, 1]) {
                const y = side * bodyH*0.31;
                const tank = ctx.createLinearGradient(0, y-bodyH*0.13, 0, y+bodyH*0.13);
                tank.addColorStop(0, '#ffd394'); tank.addColorStop(0.46, '#d5813c'); tank.addColorStop(1, '#8a3c25');
                ctx.fillStyle = tank; ctx.strokeStyle = '#252321'; ctx.lineWidth = 1;
                ctx.beginPath(); ctx.roundRect(-bodyW*0.33, y-bodyH*0.12, bodyW*0.42, bodyH*0.24, bodyH*0.1); ctx.fill(); ctx.stroke();
                ctx.fillStyle = '#513026';
                ctx.fillRect(-bodyW*0.24, y-bodyH*0.13, bodyW*0.045, bodyH*0.26);
                ctx.fillRect(-bodyW*0.02, y-bodyH*0.13, bodyW*0.045, bodyH*0.26);
                ctx.strokeStyle = '#ffe0a1'; ctx.lineWidth = Math.max(0.8, bodyH*0.026);
                ctx.beginPath(); ctx.moveTo(bodyW*0.09, y); ctx.lineTo(bodyW*0.34, y); ctx.lineTo(bodyW*0.39, side*bodyH*0.15); ctx.stroke();
            }
            ctx.fillStyle = '#f3b55e';
            ctx.fillRect(bodyW*0.33, -bodyH*0.17, bodyW*0.1, bodyH*0.34);
        } else if (type === 'toxic') {
            // Sealed chemical hull with two recessed reagent reservoirs.
            const hull = ctx.createLinearGradient(0, -bodyH/2, 0, bodyH/2);
            hull.addColorStop(0, '#b5cc79'); hull.addColorStop(0.5, '#5b9148'); hull.addColorStop(1, '#285139');
            ctx.fillStyle = hull; ctx.strokeStyle = '#24332a'; ctx.lineWidth = 1.3;
            ctx.beginPath(); ctx.roundRect(-bodyW/2, -bodyH/2, bodyW, bodyH, bodyH*0.1); ctx.fill(); ctx.stroke();
            for (const side of [-1, 1]) {
                const y = side * bodyH*0.29;
                ctx.fillStyle = '#1f4636';
                ctx.beginPath(); ctx.roundRect(-bodyW*0.35, y-bodyH*0.13, bodyW*0.54, bodyH*0.26, bodyH*0.07); ctx.fill();
                const fluid = ctx.createLinearGradient(0, y-bodyH*0.1, 0, y+bodyH*0.1);
                fluid.addColorStop(0, '#e1f7a3'); fluid.addColorStop(0.5, '#a8ce51'); fluid.addColorStop(1, '#4c922e');
                ctx.fillStyle = fluid;
                ctx.beginPath(); ctx.roundRect(-bodyW*0.28, y-bodyH*0.09, bodyW*0.4, bodyH*0.18, bodyH*0.06); ctx.fill();
                ctx.fillStyle = '#c7de8c';
                ctx.fillRect(-bodyW*0.18, y-bodyH*0.13, bodyW*0.045, bodyH*0.26);
                ctx.fillRect(bodyW*0.04, y-bodyH*0.13, bodyW*0.045, bodyH*0.26);
                ctx.strokeStyle = '#dbed91'; ctx.lineWidth = Math.max(0.8, bodyH*0.025);
                ctx.beginPath(); ctx.moveTo(bodyW*0.12, y); ctx.lineTo(bodyW*0.36, y); ctx.stroke();
            }
            ctx.fillStyle = '#f0d174';
            ctx.fillRect(bodyW*0.31, -bodyH*0.1, bodyW*0.055, bodyH*0.2);
        } else if (type === 'plasma') {
            const grad = ctx.createLinearGradient(-bodyW/2, 0, bodyW/2, 0);
            grad.addColorStop(0, '#bdc3c7'); grad.addColorStop(1, '#7f8c8d');
            ctx.fillStyle = grad;
            ctx.fillRect(-bodyW/2, -bodyH/2, bodyW, bodyH);
            // Tech lines
            ctx.strokeStyle = '#8e44ad';
            ctx.lineWidth = 1;
            ctx.strokeRect(-bodyW/2+4, -bodyH/2+4, bodyW-8, bodyH-8);
        } else if (type === 'buratino') {
            // Heavy Heavy Flamethrower Hull (Dark Camo)
            const grad = ctx.createLinearGradient(-bodyW/2, 0, bodyW/2, 0);
            grad.addColorStop(0, '#354a21'); grad.addColorStop(0.5, '#4b6b30'); grad.addColorStop(1, '#354a21');
            ctx.fillStyle = grad;
            ctx.fillRect(-bodyW/2, -bodyH/2, bodyW, bodyH);
            
            // Armor panels
            ctx.fillStyle = 'rgba(0,0,0,0.2)';
            ctx.fillRect(-bodyW/2 + 10, -bodyH/2 + 2, bodyW - 20, bodyH - 4);
            
            // Rear vents
            ctx.fillStyle = '#1a2612';
            for(let i=0; i<3; i++) {
                ctx.fillRect(-bodyW/2 + 2, -6 + i*5, 5, 3);
            }
        } else if (type === 'musical') {
            // Musical Tank Body (Vibrant and Sound-themed)
            const grad = ctx.createLinearGradient(-bodyW/2, 0, bodyW/2, 0);
            grad.addColorStop(0, '#8e44ad'); grad.addColorStop(0.5, '#e91e63'); grad.addColorStop(1, '#8e44ad');
            ctx.fillStyle = grad;
            ctx.fillRect(-bodyW/2, -bodyH/2, bodyW, bodyH);
            
            // Speaker grilles
            ctx.fillStyle = '#2c3e50';
            ctx.fillRect(-bodyW/2 + 5, -bodyH/2 + 5, bodyW/2 - 10, bodyH - 10);
            ctx.fillRect(5, -bodyH/2 + 5, bodyW/2 - 10, bodyH - 10);
            
            // Musical notes
            ctx.fillStyle = '#f1c40f';
            // Note 1
            ctx.beginPath();
            ctx.arc(-bodyW/4, -bodyH/4, 3, 0, Math.PI*2);
            ctx.fill();
            ctx.fillRect(-bodyW/4 - 1, -bodyH/4 - 8, 2, 6);
            // Note 2
            ctx.beginPath();
            ctx.arc(bodyW/4, bodyH/4, 3, 0, Math.PI*2);
            ctx.fill();
            ctx.fillRect(bodyW/4 - 1, bodyH/4 - 8, 2, 6);
        } else if (type === 'illuminat') {
             // Intentionally empty - body is handled by turret section
        } else if (type === 'mirror') {
            const grad = ctx.createLinearGradient(-bodyW/2, -bodyH/2, bodyW/2, bodyH/2);
            grad.addColorStop(0, '#bdc3c7'); grad.addColorStop(0.5, '#ecf0f1'); grad.addColorStop(1, '#95a5a6');
            ctx.fillStyle = grad;
            ctx.fillRect(-bodyW/2, -bodyH/2, bodyW, bodyH);

            // Reflection stripes
            ctx.fillStyle = 'rgba(255,255,255,0.7)';
            ctx.beginPath();
            ctx.moveTo(-bodyW/2, -bodyH/2); ctx.lineTo(-bodyW/2 + 10, -bodyH/2); ctx.lineTo(bodyW/2, bodyH/2 - 10); ctx.lineTo(bodyW/2, bodyH/2);
            ctx.fill();

            // Border
            ctx.strokeStyle = '#7f8c8d';
            ctx.lineWidth = 1;
            ctx.strokeRect(-bodyW/2, -bodyH/2, bodyW, bodyH);
        } else if (type === 'time') {
            // Minimalistic Purple Body
            ctx.fillStyle = '#9b59b6'; // Purple
            ctx.fillRect(-bodyW/2, -bodyH/2, bodyW, bodyH);
            
            // Clean border
            ctx.strokeStyle = '#2c3e50';
            ctx.lineWidth = 2;
            ctx.strokeRect(-bodyW/2, -bodyH/2, bodyW, bodyH);
        } else if (type === 'machinegun') {
            // Angled gunmetal hull with inset deck and protected side armor.
            const hull = ctx.createLinearGradient(0, -bodyH/2, 0, bodyH/2);
            hull.addColorStop(0, '#68757a');
            hull.addColorStop(0.48, '#3c4b51');
            hull.addColorStop(1, '#222e34');
            ctx.fillStyle = hull;
            ctx.strokeStyle = '#182329';
            ctx.lineWidth = 1.2;
            ctx.beginPath();
            ctx.moveTo(-bodyW*0.48, -bodyH*0.46);
            ctx.lineTo(bodyW*0.28, -bodyH*0.46);
            ctx.lineTo(bodyW*0.49, -bodyH*0.26);
            ctx.lineTo(bodyW*0.49, bodyH*0.26);
            ctx.lineTo(bodyW*0.28, bodyH*0.46);
            ctx.lineTo(-bodyW*0.48, bodyH*0.46);
            ctx.closePath(); ctx.fill(); ctx.stroke();

            ctx.fillStyle = '#29373c';
            ctx.fillRect(-bodyW*0.34, -bodyH*0.32, bodyW*0.58, bodyH*0.64);
            ctx.strokeStyle = '#768287';
            ctx.lineWidth = 0.8;
            ctx.strokeRect(-bodyW*0.34, -bodyH*0.32, bodyW*0.58, bodyH*0.64);

            for (const side of [-1, 1]) {
                const edgeY = side < 0 ? -bodyH*0.46 : bodyH*0.32;
                const plate = ctx.createLinearGradient(0, edgeY, 0, edgeY + bodyH*0.14);
                plate.addColorStop(0, side < 0 ? '#a2aaa7' : '#3b494c');
                plate.addColorStop(1, side < 0 ? '#526065' : '#697579');
                ctx.fillStyle = plate;
                ctx.fillRect(-bodyW*0.37, edgeY, bodyW*0.59, bodyH*0.14);
                ctx.fillStyle = '#b1a079';
                ctx.fillRect(-bodyW*0.2, edgeY + bodyH*0.055, bodyW*0.23, Math.max(1, bodyH*0.025));
            }

            // Rear cooling grille and two recessed ammunition cases.
            ctx.fillStyle = '#142025';
            ctx.fillRect(-bodyW*0.44, -bodyH*0.18, bodyW*0.09, bodyH*0.36);
            ctx.fillStyle = '#819095';
            for (let i = -1; i <= 1; i++) {
                ctx.fillRect(-bodyW*0.43, i*bodyH*0.11 - bodyH*0.015, bodyW*0.07, Math.max(1, bodyH*0.03));
            }
            ctx.fillStyle = '#857456';
            ctx.fillRect(-bodyW*0.23, -bodyH*0.24, bodyW*0.16, bodyH*0.13);
            ctx.fillRect(-bodyW*0.23, bodyH*0.11, bodyW*0.16, bodyH*0.13);
            ctx.fillStyle = '#c5ad78';
            ctx.fillRect(-bodyW*0.2, -bodyH*0.21, bodyW*0.1, Math.max(1, bodyH*0.025));
            ctx.fillRect(-bodyW*0.2, bodyH*0.14, bodyW*0.1, Math.max(1, bodyH*0.025));
        } else if (type === 'buckshot') {
            // Breaching chassis with faceted armor and recessed ammunition.
            const armor = ctx.createLinearGradient(0, -bodyH/2, 0, bodyH/2);
            armor.addColorStop(0, '#87918e'); armor.addColorStop(0.48, '#526063'); armor.addColorStop(1, '#2c3436');
            ctx.fillStyle = armor; ctx.strokeStyle = '#222c2d'; ctx.lineWidth = 1.2;
            ctx.beginPath(); ctx.moveTo(-bodyW*0.5, -bodyH*0.45); ctx.lineTo(bodyW*0.3, -bodyH*0.45);
            ctx.lineTo(bodyW*0.5, -bodyH*0.28); ctx.lineTo(bodyW*0.5, bodyH*0.28);
            ctx.lineTo(bodyW*0.3, bodyH*0.45); ctx.lineTo(-bodyW*0.5, bodyH*0.45); ctx.closePath(); ctx.fill(); ctx.stroke();

            // Side grip panels (knurled texture look)
            const gripW = Math.max(2, bodyW * 0.12);
            ctx.fillStyle = '#30393a';
            ctx.fillRect(-bodyW/2 + 2, -bodyH/2 + 2, gripW, bodyH - 4); 
            ctx.fillRect(bodyW/2 - gripW - 2, -bodyH/2 + 2, gripW, bodyH - 4);

            // Shell Rack on the back deck - perfectly contained
            const rackH = Math.max(3, bodyH * 0.18);
            const rackY = bodyH/2 - rackH - Math.max(1, bodyH*0.05); // relative to bottom
            const rackW = bodyW * 0.55;
            
            ctx.fillStyle = '#1a1a1a';
            ctx.fillRect(-rackW/2, rackY, rackW, rackH);
            
            // Individual Shells
            const shellTotalW = rackW * 0.9;
            const shellW = shellTotalW / 4; 
            const shellGap = shellW * 0.2;
            const finalShellW = shellW - shellGap;
            const shellH = rackH - 2;
            const shellY = rackY + 1;
            
            for (let i = 0; i < 4; i++) {
                const shellX = -shellTotalW/2 + i * shellW + shellGap/2;
                // Muted copper shell case and brass base.
                ctx.fillStyle = '#a7674a';
                ctx.fillRect(shellX, shellY, finalShellW, shellH);
                ctx.fillStyle = '#c1a979';
                ctx.fillRect(shellX, shellY, finalShellW * 0.4, shellH);
            }

            // Front Bumper / Ram (Relative size)
            const bumpSize = Math.max(2, bodyW * 0.08);
            ctx.fillStyle = '#354143';
            ctx.beginPath();
            ctx.moveTo(bodyW/2, -bodyH/2);
            ctx.lineTo(bodyW/2 + bumpSize, -bodyH/4);
            ctx.lineTo(bodyW/2 + bumpSize, bodyH/4);
            ctx.lineTo(bodyW/2, bodyH/2);
            ctx.fill();
        } else if (type === 'waterjet') {
            // Deep navy hull with water-pressure markings
            const grad = ctx.createLinearGradient(-bodyW/2, -bodyH/2, bodyW/2, bodyH/2);
            grad.addColorStop(0, '#154360');
            grad.addColorStop(0.5, '#1a5276');
            grad.addColorStop(1, '#1b4f72');
            ctx.fillStyle = grad;
            ctx.fillRect(-bodyW/2, -bodyH/2, bodyW, bodyH);
            // Water conduit curves
            ctx.strokeStyle = '#5dade2';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(-bodyW/2+4, -2); ctx.quadraticCurveTo(0, -bodyH/4, bodyW/2-4, -2);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(-bodyW/2+4, 2); ctx.quadraticCurveTo(0, bodyH/4, bodyW/2-4, 2);
            ctx.stroke();
            // Side pressure tanks
            ctx.fillStyle = '#2980b9';
            ctx.fillRect(-bodyW/2 - 2, -bodyH/4, 4, bodyH/2);
            ctx.fillRect(bodyW/2 - 2, -bodyH/4, 4, bodyH/2);
        } else if (type === 'imitator') {
            // Keep the dark prismatic hull, side strips and diamond while adding depth.
            const t = Date.now() * 0.002;

            // Base dark body
            const grad = ctx.createLinearGradient(-bodyW/2, -bodyH/2, bodyW/2, bodyH/2);
            grad.addColorStop(0, '#0f0f23');
            grad.addColorStop(0.5, '#1a1a3e');
            grad.addColorStop(1, '#0d0d1f');
            ctx.fillStyle = grad;
            ctx.fillRect(-bodyW/2, -bodyH/2, bodyW, bodyH);
            ctx.fillStyle = 'rgba(215,195,255,0.08)';
            ctx.fillRect(-bodyW/2 + 3, -bodyH/2 + 3, bodyW - 6, bodyH - 6);
            ctx.strokeStyle = 'rgba(215,195,255,0.3)';
            ctx.lineWidth = 1;
            ctx.strokeRect(-bodyW/2 + 2, -bodyH/2 + 2, bodyW - 4, bodyH - 4);

            // Left prismatic strip
            const stripW = bodyW * 0.18;
            const prismL = ctx.createLinearGradient(-bodyW/2, 0, -bodyW/2 + stripW, 0);
            prismL.addColorStop(0,   'rgba(255,0,150,0.6)');
            prismL.addColorStop(0.5, 'rgba(0,200,255,0.55)');
            prismL.addColorStop(1,   'rgba(120,0,255,0.3)');
            ctx.fillStyle = prismL;
            ctx.fillRect(-bodyW/2 + 2, -bodyH/2 + 2, stripW, bodyH - 4);

            // Right prismatic strip
            const prismR = ctx.createLinearGradient(bodyW/2 - stripW, 0, bodyW/2, 0);
            prismR.addColorStop(0,   'rgba(80,0,200,0.3)');
            prismR.addColorStop(0.5, 'rgba(0,255,150,0.55)');
            prismR.addColorStop(1,   'rgba(255,120,0,0.6)');
            ctx.fillStyle = prismR;
            ctx.fillRect(bodyW/2 - stripW - 2, -bodyH/2 + 2, stripW, bodyH - 4);
            ctx.strokeStyle = 'rgba(220,210,255,0.42)';
            ctx.lineWidth = 0.8;
            for (const side of [-1, 1]) {
                const stripX = side < 0 ? -bodyW/2 + 2 : bodyW/2 - stripW - 2;
                for (let i = 1; i <= 3; i++) {
                    const y = -bodyH/2 + i * bodyH/4;
                    ctx.beginPath();
                    ctx.moveTo(stripX + 1, y - 1);
                    ctx.lineTo(stripX + stripW - 1, y + 1);
                    ctx.stroke();
                }
            }

            // Animated sheen sweep (smooth radial highlight)
            ctx.save();
            ctx.globalCompositeOperation = 'lighter';
            // slow sine-based movement for smoothness
            const sheenX = Math.sin(t * 0.55) * (bodyW * 0.32);
            const sheenY = Math.sin(t * 0.33) * (bodyH * 0.08);
            const sheenRad = Math.max(bodyW, bodyH) * 0.9;
            const sheenGrad = ctx.createRadialGradient(sheenX, sheenY, 0, sheenX, sheenY, sheenRad);
            sheenGrad.addColorStop(0, 'rgba(255,255,255,0.16)');
            sheenGrad.addColorStop(0.25, 'rgba(255,255,255,0.08)');
            sheenGrad.addColorStop(0.5, 'rgba(255,255,255,0.03)');
            sheenGrad.addColorStop(1, 'rgba(255,255,255,0)');
            const prevAlpha = ctx.globalAlpha;
            ctx.globalAlpha = 0.95;
            ctx.fillStyle = sheenGrad;
            ctx.fillRect(-bodyW/2, -bodyH/2, bodyW, bodyH);
            ctx.globalAlpha = prevAlpha;
            ctx.restore();

            // Central morphing diamond symbol (original)
            ctx.strokeStyle = 'rgba(220,200,255,0.65)';
            ctx.lineWidth = 1;
            const dS = Math.min(bodyW, bodyH) * 0.2;
            const diamondFill = ctx.createLinearGradient(-dS, -dS, dS, dS);
            diamondFill.addColorStop(0, '#b68bd7');
            diamondFill.addColorStop(0.5, '#4a326f');
            diamondFill.addColorStop(1, '#241b46');
            ctx.fillStyle = diamondFill;
            ctx.beginPath();
            ctx.moveTo(0, -dS); ctx.lineTo(dS * 0.8, 0);
            ctx.lineTo(0, dS); ctx.lineTo(-dS * 0.8, 0);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            ctx.strokeStyle = 'rgba(236,225,255,0.65)';
            ctx.lineWidth = 0.75;
            ctx.beginPath();
            ctx.moveTo(0, -dS); ctx.lineTo(0, dS);
            ctx.moveTo(-dS * 0.8, 0); ctx.lineTo(dS * 0.8, 0);
            ctx.stroke();

            // Pulsing core glow inside diamond (slower, smooth fade)
            const pulse = 0.35 + 0.25 * (0.5 + 0.5 * Math.sin(t * 1.5));
            ctx.save();
            ctx.globalCompositeOperation = 'lighter';
            ctx.fillStyle = `rgba(180,150,255,${pulse})`;
            ctx.beginPath(); ctx.arc(0, 0, dS * 0.25, 0, Math.PI * 2); ctx.fill();
            ctx.restore();

            // Outer border
            ctx.strokeStyle = 'rgba(180,100,255,0.45)';
            ctx.lineWidth = 1.5;
            ctx.strokeRect(-bodyW/2, -bodyH/2, bodyW, bodyH);
            ctx.fillStyle = '#8f779e';
            for (const x of [-bodyW/2 + 3, bodyW/2 - 3]) {
                for (const y of [-bodyH/2 + 3, bodyH/2 - 3]) {
                    ctx.beginPath(); ctx.arc(x, y, 0.9, 0, Math.PI * 2); ctx.fill();
                }
            }
        } else if (type === 'boss_dummy') {
            // Reinforced range tank with ochre safety panels.
            const practiceHull = ctx.createLinearGradient(0, -bodyH/2, 0, bodyH/2);
            practiceHull.addColorStop(0, '#a3aaa5'); practiceHull.addColorStop(0.5, '#5b6868'); practiceHull.addColorStop(1, '#303c3e');
            ctx.fillStyle = practiceHull; ctx.strokeStyle = '#243032'; ctx.lineWidth = 1.2;
            ctx.beginPath(); ctx.roundRect(-bodyW/2, -bodyH/2, bodyW, bodyH, bodyH*0.12); ctx.fill(); ctx.stroke();
            for (const side of [-1, 1]) {
                ctx.fillStyle = '#c79954';
                ctx.beginPath(); ctx.moveTo(-bodyW*0.43, side*bodyH*0.25); ctx.lineTo(bodyW*0.24, side*bodyH*0.25);
                ctx.lineTo(bodyW*0.43, side*bodyH*0.39); ctx.lineTo(-bodyW*0.43, side*bodyH*0.39); ctx.closePath(); ctx.fill();
                ctx.strokeStyle = '#f0d59a'; ctx.lineWidth = 0.9;
                ctx.beginPath(); ctx.moveTo(-bodyW*0.35, side*bodyH*0.28); ctx.lineTo(bodyW*0.22, side*bodyH*0.28); ctx.stroke();
            }
            ctx.fillStyle = '#343f3f';
            ctx.fillRect(-bodyW*0.4, -bodyH*0.14, bodyW*0.2, bodyH*0.28);
            ctx.fillStyle = '#e0b675';
            for (let i=0; i<3; i++) ctx.fillRect(-bodyW*0.36 + i*bodyW*0.06, -bodyH*0.11, bodyW*0.025, bodyH*0.22);
        } else if (type === 'electric') {
            // ELECTRIC ROBOT - ELEGANT ELECTRIC DESIGN
            // Dark metallic base
            ctx.fillStyle = '#0d0d1a';
            ctx.fillRect(-bodyW/2, -bodyH/2, bodyW, bodyH);
            
            // Main body gradient - elegant energy field
            const energyGrad = ctx.createLinearGradient(-bodyW/2, -bodyH/2, bodyW/2, bodyH/2);
            energyGrad.addColorStop(0, '#1a2a4a');
            energyGrad.addColorStop(0.5, '#0f1f35');
            energyGrad.addColorStop(1, '#1a2a4a');
            ctx.fillStyle = energyGrad;
            ctx.fillRect(-bodyW/2, -bodyH/2, bodyW, bodyH);

            // Subtle pulsing aura (not too bright)
            const pulse = 0.6 + 0.3 * Math.sin(Date.now() * 0.005);
            ctx.fillStyle = `rgba(80, 180, 220, ${0.1 * pulse})`;
            ctx.fillRect(-bodyW/2 - 2, -bodyH/2 - 2, bodyW + 4, bodyH + 4);

            // Top energy strip - elegant cyan
            ctx.fillStyle = '#4da6ff';
            ctx.fillRect(-bodyW/2, -bodyH/2, bodyW, 4);
            ctx.fillStyle = 'rgba(100, 180, 220, 0.5)';
            ctx.fillRect(-bodyW/2, -bodyH/2 + 4, bodyW, 2);

            // Bottom energy strip
            ctx.fillStyle = '#4da6ff';
            ctx.fillRect(-bodyW/2, bodyH/2 - 4, bodyW, 4);
            
            // Side accent panels (subtle)
            ctx.fillStyle = 'rgba(100, 180, 220, 0.4)';
            ctx.fillRect(-bodyW/2, -bodyH/2 + 4, 2, bodyH - 8);
            ctx.fillRect(bodyW/2 - 2, -bodyH/2 + 4, 2, bodyH - 8);

            // Central power core - soft glow
            const coreW = bodyW * 0.6;
            const coreH = bodyH * 0.45;
            const coreGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, coreW/2);
            coreGrad.addColorStop(0, `rgba(100, 200, 255, ${0.25 * pulse})`);
            coreGrad.addColorStop(0.5, `rgba(80, 160, 220, ${0.1 * pulse})`);
            coreGrad.addColorStop(1, 'rgba(60, 120, 180, 0)');
            ctx.fillStyle = coreGrad;
            ctx.fillRect(-coreW/2, -coreH/2, coreW, coreH);

            // Clean horizontal center line
            ctx.strokeStyle = 'rgba(100, 180, 220, 0.6)';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(-bodyW*0.35, 0);
            ctx.lineTo(bodyW*0.35, 0);
            ctx.stroke();
            
            // Vertical energy channels (subtle grid)
            ctx.lineWidth = 1;
            ctx.strokeStyle = 'rgba(80, 160, 200, 0.4)';
            for (let i = -2; i <= 2; i++) {
                const xPos = i * bodyW * 0.2;
                ctx.beginPath();
                ctx.moveTo(xPos, -bodyH*0.2);
                ctx.lineTo(xPos, bodyH*0.2);
                ctx.stroke();
            }

            // Simple diagonal accent (X pattern)
            ctx.strokeStyle = 'rgba(80, 160, 200, 0.3)';
            ctx.lineWidth = 0.8;
            ctx.beginPath();
            ctx.moveTo(-bodyW*0.25, -bodyH*0.2);
            ctx.lineTo(bodyW*0.25, bodyH*0.2);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(bodyW*0.25, -bodyH*0.2);
            ctx.lineTo(-bodyW*0.25, bodyH*0.2);
            ctx.stroke();

            // Power junction nodes (small, clean)
            ctx.fillStyle = '#66ccff';
            const junctions = [
                [-bodyW*0.2, 0],
                [0, -bodyH*0.15],
                [bodyW*0.2, 0],
                [0, bodyH*0.15]
            ];
            for (const [jx, jy] of junctions) {
                ctx.beginPath();
                ctx.arc(jx, jy, 2, 0, Math.PI*2);
                ctx.fill();
                ctx.fillStyle = `rgba(100, 200, 255, ${0.25 * pulse})`;
                ctx.beginPath();
                ctx.arc(jx, jy, 3.5, 0, Math.PI*2);
                ctx.fill();
                ctx.fillStyle = '#66ccff';
            }

            // Corner accent vents (small)
            ctx.fillStyle = '#4da6ff';
            for (const [_rx, _ry] of [[-bodyW/2+3,-bodyH/2+3],[bodyW/2-3,-bodyH/2+3],[-bodyW/2+3,bodyH/2-3],[bodyW/2-3,bodyH/2-3]]) {
                ctx.beginPath();
                ctx.arc(_rx, _ry, 2, 0, Math.PI*2);
                ctx.fill();
            }

            // Clean outer border
            ctx.strokeStyle = 'rgba(100, 180, 220, 0.7)';
            ctx.lineWidth = 1.5;
            ctx.strokeRect(-bodyW/2, -bodyH/2, bodyW, bodyH);
        } else if (type === 'robot') {
            // Heavy armored robot body — dark steel plates
            const rg = ctx.createLinearGradient(-bodyW/2, -bodyH/2, bodyW/2, bodyH/2);
            rg.addColorStop(0, '#37474f');
            rg.addColorStop(0.5, '#263238');
            rg.addColorStop(1, '#1c2628');
            ctx.fillStyle = rg;
            ctx.fillRect(-bodyW/2, -bodyH/2, bodyW, bodyH);
            // Armor panel lines
            ctx.strokeStyle = '#546e7a';
            ctx.lineWidth = 1;
            ctx.strokeRect(-bodyW/2 + 3, -bodyH/2 + 3, bodyW - 6, bodyH - 6);
            ctx.strokeRect(-bodyW/2 + 7, -bodyH/2 + 7, bodyW - 14, bodyH - 14);
            // Reactor vent (cyan glow)
            ctx.fillStyle = '#00e5ff';
            ctx.fillRect(-5, -bodyH/2 + 4, 10, 5);
            ctx.shadowColor = '#00e5ff';
            ctx.shadowBlur = 8;
            ctx.fillRect(-5, -bodyH/2 + 4, 10, 5);
            ctx.shadowBlur = 0;
        } else if (type === 'medical') {
            // Epic Medical tank body — advanced design with armor plating
            const medGrad = ctx.createLinearGradient(-bodyW/2, -bodyH/2, bodyW/2, bodyH/2);
            medGrad.addColorStop(0, '#ffffff');
            medGrad.addColorStop(0.3, '#f0f8ff');
            medGrad.addColorStop(0.7, '#e0f0ff');
            medGrad.addColorStop(1, '#c8e6f5');
            ctx.fillStyle = medGrad;
            ctx.fillRect(-bodyW/2, -bodyH/2, bodyW, bodyH);
            // Green accent stripe (left side) — healing color
            ctx.fillStyle = '#00cc66';
            ctx.fillRect(-bodyW/2, -bodyH/2, bodyW * 0.2, bodyH);
            // Blue accent stripe (right side)
            ctx.fillStyle = '#0099ff';
            ctx.fillRect(bodyW/2 - bodyW * 0.15, -bodyH/2, bodyW * 0.15, bodyH);
            // Armor plating detail
            ctx.strokeStyle = '#0066ff';
            ctx.lineWidth = 2;
            ctx.setLineDash([4, 2]);
            ctx.strokeRect(-bodyW/2 + 3, -bodyH/2 + 3, bodyW - 6, bodyH - 6);
            ctx.setLineDash([]);
            // Large red medical cross
            ctx.fillStyle = '#ff2222';
            const crossW = bodyW * 0.16;
            const crossH = bodyH * 0.10;
            ctx.fillRect(-crossW/2, -bodyH/2 + bodyH * 0.35, crossW, crossH); // horizontal
            ctx.fillRect(-bodyW/2 + bodyW * 0.35, -crossH/2, crossH, crossW); // vertical
            // Border
            ctx.strokeStyle = '#0066ff';
            ctx.lineWidth = 2.5;
            ctx.strokeRect(-bodyW/2, -bodyH/2, bodyW, bodyH);
        } else if (type === 'roman') {
            // Roman Tank Body - imperial crimson with gold lorica bands
            const bodyGrad = ctx.createLinearGradient(-bodyW/2, -bodyH/2, bodyW/2, bodyH/2);
            bodyGrad.addColorStop(0, '#6b0000');
            bodyGrad.addColorStop(0.3, '#C41E3A');
            bodyGrad.addColorStop(0.65, '#8B0000');
            bodyGrad.addColorStop(1, '#4a0000');
            ctx.fillStyle = bodyGrad;
            ctx.fillRect(-bodyW/2, -bodyH/2, bodyW, bodyH);

            // Gold lorica bands (horizontal armor strips)
            const bandColor = '#D4A017';
            const bandH = Math.max(2.5, bodyH * 0.09);
            ctx.fillStyle = bandColor;
            ctx.fillRect(-bodyW/2, -bodyH/2, bodyW, bandH);                             // top band
            ctx.fillRect(-bodyW/2, bodyH/2 - bandH, bodyW, bandH);                     // bottom band
            ctx.fillRect(-bodyW/2, -bodyH * 0.14, bodyW, bandH * 0.7);                 // upper mid band
            ctx.fillRect(-bodyW/2,  bodyH * 0.05, bodyW, bandH * 0.7);                 // lower mid band

            // Gold side border strips
            ctx.fillRect(-bodyW/2, -bodyH/2, bandH * 0.7, bodyH);
            ctx.fillRect( bodyW/2 - bandH * 0.7, -bodyH/2, bandH * 0.7, bodyH);

            // Inner crimson panel between bands
            const panelGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, bodyW * 0.4);
            panelGrad.addColorStop(0, 'rgba(220,20,60,0.35)');
            panelGrad.addColorStop(1, 'rgba(80,0,0,0)');
            ctx.fillStyle = panelGrad;
            ctx.fillRect(-bodyW/2, -bodyH/2, bodyW, bodyH);

            // Roman SPQR shield emblem (drawn geometry, no emoji)
            const emR = Math.min(bodyW, bodyH) * 0.22;
            // Shield outline - oval shape
            ctx.fillStyle = '#D4A017';
            ctx.beginPath();
            ctx.ellipse(0, 0, emR * 0.75, emR, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#8B0000';
            ctx.beginPath();
            ctx.ellipse(0, 0, emR * 0.58, emR * 0.83, 0, 0, Math.PI * 2);
            ctx.fill();
            // Gold cross on the shield
            const cw = emR * 0.12;
            ctx.fillStyle = '#FFD700';
            ctx.fillRect(-emR * 0.55, -cw / 2, emR * 1.1, cw);
            ctx.fillRect(-cw / 2, -emR * 0.8, cw, emR * 1.6);

            // Gold outline
            ctx.strokeStyle = '#8B6914';
            ctx.lineWidth = 1.5;
            ctx.strokeRect(-bodyW/2, -bodyH/2, bodyW, bodyH);
        } else if (type === 'egyptian') {
            const sandGrad = ctx.createLinearGradient(-bodyW/2, -bodyH/2, bodyW/2, bodyH/2);
            sandGrad.addColorStop(0, '#f3d995');
            sandGrad.addColorStop(0.45, '#c89b3c');
            sandGrad.addColorStop(1, '#8f6720');
            ctx.fillStyle = sandGrad;
            ctx.fillRect(-bodyW/2, -bodyH/2, bodyW, bodyH);

            const panelW = bodyW * 0.2;
            const stripeW = panelW / 5;
            for (const side of [-1, 1]) {
                const panelX = side < 0 ? -bodyW / 2 : bodyW / 2 - panelW;
                for (let i = 0; i < 5; i++) {
                    ctx.fillStyle = i % 2 === 0 ? '#113c74' : '#d7b55e';
                    ctx.fillRect(panelX + i * stripeW, -bodyH / 2, stripeW, bodyH);
                }
            }

            const faceGrad = ctx.createRadialGradient(-bodyW * 0.04, -bodyH * 0.1, 0, 0, 0, bodyH * 0.34);
            faceGrad.addColorStop(0, '#f6dfa0');
            faceGrad.addColorStop(0.58, '#d8b561');
            faceGrad.addColorStop(1, '#8f6720');
            ctx.fillStyle = faceGrad;
            ctx.beginPath();
            ctx.ellipse(0, -bodyH * 0.02, bodyW * 0.18, bodyH * 0.27, 0, 0, Math.PI * 2);
            ctx.fill();

            ctx.strokeStyle = '#4d3310';
            ctx.lineWidth = 1.1;
            ctx.beginPath();
            ctx.moveTo(-bodyW * 0.09, -bodyH * 0.06);
            ctx.quadraticCurveTo(-bodyW * 0.03, -bodyH * 0.11, bodyW * 0.01, -bodyH * 0.06);
            ctx.moveTo(bodyW * 0.09, -bodyH * 0.06);
            ctx.quadraticCurveTo(bodyW * 0.03, -bodyH * 0.11, -bodyW * 0.01, -bodyH * 0.06);
            ctx.stroke();

            ctx.fillStyle = '#0e2f60';
            ctx.beginPath();
            ctx.arc(-bodyW * 0.05, -bodyH * 0.04, bodyW * 0.018, 0, Math.PI * 2);
            ctx.arc(bodyW * 0.05, -bodyH * 0.04, bodyW * 0.018, 0, Math.PI * 2);
            ctx.fill();

            ctx.strokeStyle = '#6b4a18';
            ctx.lineWidth = 1.4;
            ctx.beginPath();
            ctx.moveTo(0, bodyH * 0.03);
            ctx.lineTo(0, bodyH * 0.13);
            ctx.stroke();

            ctx.fillStyle = '#113c74';
            ctx.beginPath();
            ctx.moveTo(0, bodyH * 0.12);
            ctx.lineTo(bodyW * 0.04, bodyH * 0.32);
            ctx.lineTo(-bodyW * 0.04, bodyH * 0.32);
            ctx.closePath();
            ctx.fill();

            ctx.strokeStyle = 'rgba(255,241,191,0.55)';
            ctx.lineWidth = 0.8;
            ctx.beginPath();
            ctx.moveTo(-bodyW * 0.11, bodyH * 0.17);
            ctx.lineTo(bodyW * 0.11, bodyH * 0.17);
            ctx.stroke();

            ctx.strokeStyle = '#704a12';
            ctx.lineWidth = 1.6;
            ctx.strokeRect(-bodyW/2, -bodyH/2, bodyW, bodyH);
        } else if (type === 'pyro') {
            // Oxide armor, side heat shields and recessed incendiary shells.
            const armor = ctx.createLinearGradient(0, -bodyH/2, 0, bodyH/2);
            armor.addColorStop(0, '#f5b46c'); armor.addColorStop(0.48, '#c65e35'); armor.addColorStop(1, '#713b2d');
            ctx.fillStyle = armor; ctx.strokeStyle = '#322a26'; ctx.lineWidth = 1.2;
            ctx.beginPath(); ctx.roundRect(-bodyW/2, -bodyH/2, bodyW, bodyH, bodyH*0.08); ctx.fill(); ctx.stroke();
            for (const side of [-1, 1]) {
                ctx.fillStyle = '#92432d';
                ctx.beginPath(); ctx.moveTo(-bodyW*0.36, side*bodyH*0.23); ctx.lineTo(bodyW*0.3, side*bodyH*0.23);
                ctx.lineTo(bodyW*0.39, side*bodyH*0.39); ctx.lineTo(-bodyW*0.36, side*bodyH*0.39); ctx.closePath(); ctx.fill();
                ctx.strokeStyle = '#ffd395'; ctx.lineWidth = Math.max(0.7, bodyH*0.023);
                ctx.beginPath(); ctx.moveTo(-bodyW*0.28, side*bodyH*0.26); ctx.lineTo(bodyW*0.26, side*bodyH*0.26); ctx.stroke();
            }
            ctx.fillStyle = '#302825';
            ctx.fillRect(-bodyW*0.4, -bodyH*0.15, bodyW*0.23, bodyH*0.3);
            for (let i=0; i<3; i++) {
                const x = -bodyW*0.37+i*bodyW*0.07;
                ctx.fillStyle = '#cf6b36'; ctx.fillRect(x, -bodyH*0.12, bodyW*0.045, bodyH*0.24);
                ctx.fillStyle = '#ffe0a0'; ctx.fillRect(x, -bodyH*0.12, bodyW*0.045, bodyH*0.04);
            }
        } else if (type === 'burovoy') {
            if (!isBurovoyFullyBurrowed) {
                const outerW = bodyW * 0.9;
                const outerH = bodyH * 0.78;
                const coreW = bodyW * 0.48;
                const coreH = bodyH * 0.5;

                const hullGrad = ctx.createLinearGradient(-outerW / 2, -outerH / 2, outerW / 2, outerH / 2);
                hullGrad.addColorStop(0, '#d9b859');
                hullGrad.addColorStop(0.34, '#9a7f3a');
                hullGrad.addColorStop(0.7, '#5a4828');
                hullGrad.addColorStop(1, '#2c2417');
                ctx.fillStyle = hullGrad;
                ctx.beginPath();
                ctx.moveTo(-outerW * 0.42, -outerH * 0.82);
                ctx.lineTo(outerW * 0.42, -outerH * 0.82);
                ctx.lineTo(outerW * 0.48, -outerH * 0.36);
                ctx.lineTo(outerW * 0.48, outerH * 0.36);
                ctx.lineTo(outerW * 0.42, outerH * 0.82);
                ctx.lineTo(-outerW * 0.42, outerH * 0.82);
                ctx.lineTo(-outerW * 0.48, outerH * 0.36);
                ctx.lineTo(-outerW * 0.48, -outerH * 0.36);
                ctx.closePath();
                ctx.fill();

                const sidePlateGrad = ctx.createLinearGradient(-outerW * 0.5, 0, outerW * 0.5, 0);
                sidePlateGrad.addColorStop(0, '#322b1f');
                sidePlateGrad.addColorStop(0.5, '#62533a');
                sidePlateGrad.addColorStop(1, '#322b1f');
                ctx.fillStyle = sidePlateGrad;
                ctx.fillRect(-outerW * 0.48, -outerH * 0.44, outerW * 0.18, outerH * 0.88);
                ctx.fillRect(outerW * 0.3, -outerH * 0.44, outerW * 0.18, outerH * 0.88);

                const plateGrad = ctx.createLinearGradient(0, -outerH, 0, outerH);
                plateGrad.addColorStop(0, '#f1d07a');
                plateGrad.addColorStop(0.55, '#a48139');
                plateGrad.addColorStop(1, '#5d4928');
                ctx.fillStyle = plateGrad;
                for (const dir of [-1, 1]) {
                    const edgeY = dir * outerH * 0.84;
                    const innerY = dir * outerH * 0.48;
                    ctx.beginPath();
                    ctx.moveTo(-outerW * 0.26, edgeY);
                    ctx.lineTo(outerW * 0.26, edgeY);
                    ctx.lineTo(outerW * 0.38, innerY);
                    ctx.lineTo(-outerW * 0.38, innerY);
                    ctx.closePath();
                    ctx.fill();
                }

                const spineGrad = ctx.createLinearGradient(0, -coreH, 0, coreH);
                spineGrad.addColorStop(0, '#f5d582');
                spineGrad.addColorStop(0.42, '#b18d40');
                spineGrad.addColorStop(1, '#604d2c');
                ctx.fillStyle = spineGrad;
                ctx.beginPath();
                ctx.moveTo(-coreW * 0.48, -coreH);
                ctx.lineTo(coreW * 0.48, -coreH);
                ctx.lineTo(coreW * 0.58, 0);
                ctx.lineTo(coreW * 0.48, coreH);
                ctx.lineTo(-coreW * 0.48, coreH);
                ctx.lineTo(-coreW * 0.58, 0);
                ctx.closePath();
                ctx.fill();

                ctx.fillStyle = 'rgba(28, 24, 18, 0.82)';
                ctx.fillRect(-coreW * 0.15, -coreH * 0.9, coreW * 0.3, coreH * 1.8);

                ctx.strokeStyle = 'rgba(255, 235, 170, 0.34)';
                ctx.lineWidth = 1.8;
                ctx.beginPath();
                ctx.moveTo(-outerW * 0.16, -outerH * 0.72);
                ctx.lineTo(-outerW * 0.06, -outerH * 0.14);
                ctx.lineTo(-outerW * 0.16, outerH * 0.72);
                ctx.moveTo(outerW * 0.16, -outerH * 0.72);
                ctx.lineTo(outerW * 0.06, -outerH * 0.14);
                ctx.lineTo(outerW * 0.16, outerH * 0.72);
                ctx.stroke();

                ctx.fillStyle = '#2f281d';
                const boltSize = Math.max(3, bodyW * 0.035);
                for (const bolt of [
                    [-outerW * 0.19, -outerH * 0.42],
                    [outerW * 0.19, -outerH * 0.42],
                    [-outerW * 0.19, outerH * 0.42],
                    [outerW * 0.19, outerH * 0.42],
                    [0, -outerH * 0.62],
                    [0, outerH * 0.62]
                ]) {
                    ctx.fillRect(bolt[0] - boltSize / 2, bolt[1] - boltSize / 2, boltSize, boltSize);
                }

                ctx.strokeStyle = '#1c1812';
                ctx.lineWidth = 2.2;
                ctx.beginPath();
                ctx.moveTo(-outerW * 0.42, -outerH * 0.82);
                ctx.lineTo(outerW * 0.42, -outerH * 0.82);
                ctx.lineTo(outerW * 0.48, -outerH * 0.36);
                ctx.lineTo(outerW * 0.48, outerH * 0.36);
                ctx.lineTo(outerW * 0.42, outerH * 0.82);
                ctx.lineTo(-outerW * 0.42, outerH * 0.82);
                ctx.lineTo(-outerW * 0.48, outerH * 0.36);
                ctx.lineTo(-outerW * 0.48, -outerH * 0.36);
                ctx.closePath();
                ctx.stroke();
            }
            
        } else if (type === 'spartan') {
            // Keep the same bronze hull in both phases.
            const spBG = ctx.createLinearGradient(-bodyW/2, -bodyH/2, bodyW/2, bodyH/2);
            spBG.addColorStop(0, '#c8722a');
            spBG.addColorStop(0.45, '#d79b4b');
            spBG.addColorStop(1, '#75451d');
            ctx.fillStyle = spBG;
            ctx.fillRect(-bodyW/2, -bodyH/2, bodyW, bodyH);
            ctx.strokeStyle = 'rgba(60,20,0,0.55)';
            ctx.lineWidth = 1.2;
            for (let ri = -1; ri <= 1; ri++) {
                ctx.beginPath();
                ctx.moveTo(-bodyW/2 + 3, ri * bodyH * 0.26);
                ctx.lineTo(bodyW/2 - 3, ri * bodyH * 0.26);
                ctx.stroke();
            }
            ctx.fillStyle = 'rgba(180,0,0,0.45)';
            ctx.fillRect(-bodyW * 0.08, -bodyH/2, bodyW * 0.16, bodyH);
            ctx.fillStyle = 'rgba(255,200,100,0.12)';
            ctx.beginPath();
            ctx.moveTo(-bodyW/2, -bodyH/2);
            ctx.lineTo(bodyW * 0.2, -bodyH/2);
            ctx.lineTo(-bodyW/2, bodyH * 0.3);
            ctx.closePath(); ctx.fill();
            ctx.strokeStyle = '#3a1a00';
            ctx.lineWidth = 2;
            ctx.strokeRect(-bodyW/2, -bodyH/2, bodyW, bodyH);
            if (spartanRage) {
                // Reinforced bronze rim and a broader crimson cloak mark signal the boost.
                ctx.strokeStyle = '#f1cb85';
                ctx.lineWidth = Math.max(1, bodyW * 0.035);
                ctx.strokeRect(-bodyW/2 + 2, -bodyH/2 + 2, bodyW - 4, bodyH - 4);
                ctx.fillStyle = 'rgba(156,22,31,0.58)';
                ctx.fillRect(-bodyW*0.11, -bodyH*0.42, bodyW*0.22, bodyH*0.84);
                ctx.strokeStyle = '#efc780';
                ctx.lineWidth = Math.max(0.8, bodyW*0.022);
                ctx.beginPath();
                ctx.moveTo(-bodyW*0.34, -bodyH*0.23);
                ctx.lineTo(-bodyW*0.24, 0);
                ctx.lineTo(-bodyW*0.34, bodyH*0.23);
                ctx.stroke();
            }
        } else if (type === 'kamikaze') {
            // Rising Sun paint reaches the hull edges and remains visible beside the turret.
            drawKamikazeFlag(ctx, -bodyW / 2, -bodyH / 2, bodyW, bodyH);
            const armorShade = ctx.createLinearGradient(-bodyW / 2, -bodyH / 2, bodyW / 2, bodyH / 2);
            armorShade.addColorStop(0, 'rgba(255,255,255,0.18)');
            armorShade.addColorStop(0.45, 'rgba(255,255,255,0)');
            armorShade.addColorStop(1, 'rgba(24,29,36,0.22)');
            ctx.fillStyle = armorShade;
            ctx.fillRect(-bodyW / 2, -bodyH / 2, bodyW, bodyH);
            ctx.strokeStyle = '#686a6d';
            ctx.lineWidth = 1.2;
            ctx.strokeRect(-bodyW / 2, -bodyH / 2, bodyW, bodyH);
        } else if (type === 'myasnoy') {
            // Alternating tentacle steps wrap around the entire hull.
            drawMyasnoyTentacles(ctx, bodyW / 2, bodyH / 2, moveAnimation);

            // Fleshy biological body — mottled flesh, red spikes, large eye + small eyes
            const _mytT = Date.now() * 0.001;
            // Base flesh gradient
            const _mytBG = ctx.createRadialGradient(-bodyW*0.1, -bodyH*0.15, 0, 0, 0, bodyW * 0.72);
            _mytBG.addColorStop(0, '#d03030');
            _mytBG.addColorStop(0.5, '#aa1818');
            _mytBG.addColorStop(1, '#750808');
            ctx.fillStyle = _mytBG;
            ctx.fillRect(-bodyW/2, -bodyH/2, bodyW, bodyH);
            // Flesh cell spots / texture
            ctx.fillStyle = 'rgba(55, 0, 0, 0.28)';
            const _mytCells = [[-0.27,-0.21,0.11],[0.21,-0.3,0.09],[-0.09,0.27,0.12],[0.3,0.19,0.1],[-0.33,0.09,0.08],[0.07,0.07,0.07]];
            for (const [_mx,_my,_mr] of _mytCells) {
                ctx.beginPath(); ctx.arc(_mx*bodyW, _my*bodyH, _mr*bodyW, 0, Math.PI*2); ctx.fill();
            }
            // Red fur spikes around perimeter
            const _mytSN = 16;
            for (let _msi = 0; _msi < _mytSN; _msi++) {
                const _msa = (_msi / _mytSN) * Math.PI * 2;
                const _mBase = Math.min(bodyW, bodyH) * 0.5;
                const _mTip  = _mBase * (1.48 + Math.sin(_mytT * 1.5 + _msi) * 0.06);
                const _msW = 0.13;
                ctx.fillStyle = _msi % 2 === 0 ? '#c01800' : '#951200';
                ctx.beginPath();
                ctx.moveTo(Math.cos(_msa - _msW) * _mBase, Math.sin(_msa - _msW) * _mBase);
                ctx.lineTo(Math.cos(_msa) * _mTip,          Math.sin(_msa) * _mTip);
                ctx.lineTo(Math.cos(_msa + _msW) * _mBase, Math.sin(_msa + _msW) * _mBase);
                ctx.closePath(); ctx.fill();
            }
            // Central eye socket — always hollow for myasnoy (eye is the turret)
            if (type === 'myasnoy') {
                // Eye has detached: show dark hollow socket with blood drips
                ctx.beginPath(); ctx.arc(0, 0, bodyW*0.22, 0, Math.PI*2); ctx.fillStyle = '#3a0000'; ctx.fill();
                ctx.strokeStyle = '#770000'; ctx.lineWidth = 2; ctx.stroke();
                ctx.beginPath(); ctx.arc(0, 0, bodyW*0.13, 0, Math.PI*2); ctx.fillStyle = '#100000'; ctx.fill();
                for (let _sv = 0; _sv < 5; _sv++) {
                    const _sa = (_sv / 5) * Math.PI * 2;
                    ctx.beginPath(); ctx.moveTo(0, 0);
                    ctx.lineTo(Math.cos(_sa)*bodyW*0.22, Math.sin(_sa)*bodyW*0.22);
                    ctx.strokeStyle = 'rgba(160,0,0,0.45)'; ctx.lineWidth = 1.5; ctx.stroke();
                }
            } else {
                // Large prominent central eye (player main form)
                const _eyeS = ctx.createRadialGradient(-bodyW*0.07, -bodyH*0.07, 0, 0, 0, bodyW*0.29);
                _eyeS.addColorStop(0, '#fff8ef'); _eyeS.addColorStop(0.6, '#f0dcc0'); _eyeS.addColorStop(1, '#dfc090');
                ctx.beginPath(); ctx.arc(0, 0, bodyW*0.29, 0, Math.PI*2); ctx.fillStyle = _eyeS; ctx.fill();
                ctx.strokeStyle = 'rgba(90,0,0,0.55)'; ctx.lineWidth = 2; ctx.stroke();
                ctx.beginPath(); ctx.arc(0, 0, bodyW*0.18, 0, Math.PI*2); ctx.fillStyle = '#8c2800'; ctx.fill();
                ctx.beginPath(); ctx.arc(0, 0, bodyW*0.09, 0, Math.PI*2); ctx.fillStyle = '#0f0f0f'; ctx.fill();
                ctx.beginPath(); ctx.arc(-bodyW*0.09, -bodyH*0.09, bodyW*0.055, 0, Math.PI*2); ctx.fillStyle = 'rgba(255,255,255,0.88)'; ctx.fill();
                ctx.beginPath(); ctx.arc(bodyW*0.04, bodyH*0.04, bodyW*0.027, 0, Math.PI*2); ctx.fillStyle = 'rgba(255,255,255,0.32)'; ctx.fill();
            }
            // Small scattered eyes
            const _mytEyes = [[-0.3,-0.26],[0.31,-0.23],[-0.27,0.27],[0.27,0.29]];
            for (const [_mex,_mey] of _mytEyes) {
                const _mer = bodyW * 0.073;
                ctx.beginPath(); ctx.arc(_mex*bodyW, _mey*bodyH, _mer,       0, Math.PI*2); ctx.fillStyle = '#f0e0c0'; ctx.fill();
                ctx.beginPath(); ctx.arc(_mex*bodyW, _mey*bodyH, _mer*0.55,  0, Math.PI*2); ctx.fillStyle = '#701800'; ctx.fill();
                ctx.beginPath(); ctx.arc(_mex*bodyW, _mey*bodyH, _mer*0.28,  0, Math.PI*2); ctx.fillStyle = '#0a0a0a'; ctx.fill();
            }
            // Body border
            ctx.strokeStyle = '#5a0000'; ctx.lineWidth = 2;
            ctx.strokeRect(-bodyW/2, -bodyH/2, bodyW, bodyH);
        } else if (type === 'mine') {
            // Armored olive chassis with layered plates and restrained markings.
            const mineBodyGrad = ctx.createLinearGradient(-bodyW/2, -bodyH/2, bodyW/2, bodyH/2);
            mineBodyGrad.addColorStop(0, '#78814a'); mineBodyGrad.addColorStop(0.45, '#535e32'); mineBodyGrad.addColorStop(1, '#303b24');
            ctx.fillStyle = mineBodyGrad; ctx.strokeStyle = '#202a1b'; ctx.lineWidth = Math.max(1, W * 0.035);
            ctx.beginPath(); ctx.moveTo(-bodyW * 0.46, -bodyH * 0.5); ctx.lineTo(bodyW * 0.34, -bodyH * 0.5);
            ctx.lineTo(bodyW * 0.5, -bodyH * 0.34); ctx.lineTo(bodyW * 0.5, bodyH * 0.34);
            ctx.lineTo(bodyW * 0.34, bodyH * 0.5); ctx.lineTo(-bodyW * 0.46, bodyH * 0.5);
            ctx.lineTo(-bodyW * 0.5, bodyH * 0.38); ctx.lineTo(-bodyW * 0.5, -bodyH * 0.38); ctx.closePath(); ctx.fill(); ctx.stroke();
            ctx.fillStyle = 'rgba(34,48,26,0.38)';
            ctx.beginPath(); ctx.moveTo(-bodyW * 0.47, -bodyH * 0.25); ctx.lineTo(-bodyW * 0.22, -bodyH * 0.38);
            ctx.lineTo(-bodyW * 0.08, -bodyH * 0.05); ctx.lineTo(-bodyW * 0.38, bodyH * 0.12); ctx.closePath(); ctx.fill();
            ctx.beginPath(); ctx.moveTo(bodyW * 0.24, bodyH * 0.12); ctx.lineTo(bodyW * 0.47, bodyH * 0.22);
            ctx.lineTo(bodyW * 0.33, bodyH * 0.48); ctx.lineTo(bodyW * 0.07, bodyH * 0.42); ctx.closePath(); ctx.fill();
            ctx.strokeStyle = 'rgba(198,203,142,0.4)'; ctx.lineWidth = Math.max(0.6, W * 0.015);
            ctx.beginPath(); ctx.moveTo(-bodyW * 0.43, -bodyH * 0.4); ctx.lineTo(bodyW * 0.31, -bodyH * 0.4);
            ctx.lineTo(bodyW * 0.41, -bodyH * 0.3); ctx.moveTo(-bodyW * 0.43, bodyH * 0.4); ctx.lineTo(bodyW * 0.31, bodyH * 0.4); ctx.stroke();
            // Rear engine vents and small warning stripes.
            ctx.fillStyle = '#283323'; ctx.fillRect(-bodyW * 0.42, -bodyH * 0.27, bodyW * 0.15, bodyH * 0.54);
            ctx.strokeStyle = '#a1a879'; ctx.lineWidth = Math.max(0.6, W * 0.012);
            for (let i = 0; i < 4; i++) {
                const y = bodyH * (-0.2 + i * 0.13);
                ctx.beginPath(); ctx.moveTo(-bodyW * 0.4, y); ctx.lineTo(-bodyW * 0.29, y); ctx.stroke();
            }
            ctx.strokeStyle = '#c5ac5e'; ctx.lineWidth = Math.max(1, W * 0.025);
            for (const side of [-1, 1]) {
                for (let i = 0; i < 2; i++) {
                    const x = bodyW * (0.22 + i * 0.09);
                    ctx.beginPath(); ctx.moveTo(x, side * bodyH * 0.32); ctx.lineTo(x + bodyW * 0.04, side * bodyH * 0.42); ctx.stroke();
                }
            }
        } else if (type === 'air') {
            // Enhanced Air Tank — highly stylized, beautiful glowing tornado vortex
            const t = Date.now() * 0.003; // smooth rotation time
            
            // Base shadow/glow to ground the tornado
            const shadowGrad = ctx.createRadialGradient(0, 0, bodyW * 0.2, 0, 0, bodyW * 0.8);
            shadowGrad.addColorStop(0, 'rgba(0, 228, 204, 0.4)');
            shadowGrad.addColorStop(0.5, 'rgba(0, 168, 150, 0.15)');
            shadowGrad.addColorStop(1, 'rgba(0, 94, 87, 0)');
            ctx.fillStyle = shadowGrad;
            ctx.beginPath();
            ctx.arc(0, 0, bodyW * 0.8, 0, Math.PI * 2);
            ctx.fill();

            // Interlocking asymmetric swirl arms (the "blades" of the tornado)
            ctx.save();
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            
            const arms = 5; // Number of major swirl arms
            for (let i = 0; i < arms; i++) {
                const angleOffset = (Math.PI * 2 / arms) * i + t * 1.5;
                const armLength = bodyW * 0.65 + Math.sin(t * 2 + i) * (bodyW * 0.1);
                
                // Outer glow per arm
                ctx.strokeStyle = `rgba(0, 228, 204, 0.6)`;
                ctx.lineWidth = bodyW * 0.12;
                ctx.beginPath();
                for (let r = 0; r <= armLength; r += 2) {
                    // Spiral function: angle increases as radius increases
                    const theta = angleOffset + (r / armLength) * Math.PI * 1.8;
                    const x = Math.cos(theta) * r;
                    const y = Math.sin(theta) * r;
                    if (r === 0) ctx.moveTo(x, y);
                    else ctx.lineTo(x, y);
                }
                ctx.stroke();

                // Inner bright core per arm
                ctx.strokeStyle = `rgba(224, 255, 248, 0.9)`;
                ctx.lineWidth = bodyW * 0.04;
                ctx.beginPath();
                for (let r = 0; r <= armLength * 0.8; r += 2) {
                    const theta = angleOffset + (r / (armLength * 0.8)) * Math.PI * 1.5;
                    const x = Math.cos(theta) * r;
                    const y = Math.sin(theta) * r;
                    if (r === 0) ctx.moveTo(x, y);
                    else ctx.lineTo(x, y);
                }
                ctx.stroke();
            }
            ctx.restore();

            // High-speed winding stripes crossing over the vortex
            ctx.save();
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
            ctx.lineWidth = 2;
            for (let s = 0; s < 4; s++) {
                const sAngle = (s / 4) * Math.PI * 2 - t * 3;
                ctx.beginPath();
                ctx.arc(0, 0, bodyW * 0.45, sAngle, sAngle + Math.PI / 3);
                ctx.stroke();
            }
            ctx.restore();

            // Dynamic floating dust / wind particles being sucked in
            ctx.fillStyle = '#bdfdf2';
            for (let p = 0; window.effectsEnabled !== false && p < 8; p++) {
                // Particles spiral inward and loop back outward
                const progress = ((t * 2 + p * 0.125) % 1.0); // 0.0 to 1.0
                const pR = bodyW * 0.7 * (1 - progress); // start far, go to 0
                const pAng = (p * Math.PI / 4) + t * 4 + (progress * Math.PI * 2);
                
                const px = Math.cos(pAng) * pR;
                const py = Math.sin(pAng) * pR;
                
                ctx.beginPath();
                // Particles fade as they reach the center
                ctx.globalAlpha = 1 - progress;
                ctx.arc(px, py, bodyW * 0.04 + (progress * bodyW * 0.02), 0, Math.PI * 2);
                ctx.fill();
                ctx.globalAlpha = 1.0;
            }

            // Central Eye of the Storm (super bright core)
            const coreGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, bodyW * 0.25);
            coreGrad.addColorStop(0, '#ffffff');
            coreGrad.addColorStop(0.3, '#e0fff8');
            coreGrad.addColorStop(0.7, '#00e4cc');
            coreGrad.addColorStop(1, 'rgba(0, 95, 87, 0)');
            ctx.fillStyle = coreGrad;
            ctx.beginPath();
            ctx.arc(0, 0, bodyW * 0.25, 0, Math.PI * 2);
            ctx.fill();
        } else if (type === 'mechDiy') {
            // mechDiy uses a dedicated walker-mech renderer in mechs.js
            if (typeof drawMechOn !== 'function') {
                ctx.fillStyle = '#1a8a3e';
                ctx.fillRect(-bodyW/2, -bodyH/2, bodyW, bodyH);
            }
            // Actual drawing happens in the mechDiy turret block below (after ctx.rotate)
        } else if (type === 'mechShield') {
            // mechShield uses a dedicated renderer in mechs.js
            if (typeof drawMechShieldOn !== 'function') {
                ctx.fillStyle = '#1a3a6e';
                ctx.fillRect(-bodyW/2, -bodyH/2, bodyW, bodyH);
            }
            // Actual drawing happens in the mechShield turret block below
        } else if (type === 'kvant') {
            // Квант body: Cybernetic obsidian frame with glowing neon circuitry
            const _aiT = Date.now() * 0.001;
            const _aiP = 0.55 + 0.45 * Math.sin(_aiT * 3.0);
            
            // 1. Dark obsidian base plate with rounded chamfer and metallic gradient
            const _baseGrad = ctx.createLinearGradient(-bodyW/2, -bodyH/2, bodyW/2, bodyH/2);
            _baseGrad.addColorStop(0, '#040b12');
            _baseGrad.addColorStop(0.5, '#0d1e2e');
            _baseGrad.addColorStop(1, '#020609');
            ctx.fillStyle = _baseGrad;
            // Draw slightly clipped octagonal base
            ctx.beginPath();
            const cutX = bodyW * 0.18;
            const cutY = bodyH * 0.18;
            ctx.moveTo(-bodyW/2 + cutX, -bodyH/2);
            ctx.lineTo(bodyW/2 - cutX, -bodyH/2);
            ctx.lineTo(bodyW/2, -bodyH/2 + cutY);
            ctx.lineTo(bodyW/2, bodyH/2 - cutY);
            ctx.lineTo(bodyW/2 - cutX, bodyH/2);
            ctx.lineTo(-bodyW/2 + cutX, bodyH/2);
            ctx.lineTo(-bodyW/2, bodyH/2 - cutY);
            ctx.lineTo(-bodyW/2, -bodyH/2 + cutY);
            ctx.closePath();
            ctx.fill();
            
            // Outer thick plating border (metallic)
            ctx.strokeStyle = '#112b40';
            ctx.lineWidth = 2.5;
            ctx.stroke();

            // 2. Cyber-circuitry glowing lines inside
            ctx.save();
            ctx.shadowColor = '#00e5ff';
            ctx.shadowBlur = 5 + 3 * _aiP;
            ctx.strokeStyle = `rgba(0, 229, 255, ${0.4 + 0.6 * _aiP})`;
            ctx.lineJoin = 'round';
            ctx.lineWidth = 1.5;
            
            ctx.beginPath();
            // Left circuit
            ctx.moveTo(-bodyW*0.35, -bodyH*0.28);
            ctx.lineTo(-bodyW*0.2, -bodyH*0.12);
            ctx.lineTo(-bodyW*0.2,  bodyH*0.12);
            ctx.lineTo(-bodyW*0.35,  bodyH*0.28);
            ctx.stroke();

            ctx.beginPath();
            // Right circuit
            ctx.moveTo(bodyW*0.35, -bodyH*0.28);
            ctx.lineTo(bodyW*0.2, -bodyH*0.12);
            ctx.lineTo(bodyW*0.2,  bodyH*0.12);
            ctx.lineTo(bodyW*0.35,  bodyH*0.28);
            ctx.stroke();
            
            // Bright data nodes at the ends of circuits
            ctx.fillStyle = '#e0ffff';
            ctx.beginPath(); ctx.arc(-bodyW*0.35, -bodyH*0.28, 2, 0, Math.PI*2); ctx.fill();
            ctx.beginPath(); ctx.arc(-bodyW*0.35,  bodyH*0.28, 2, 0, Math.PI*2); ctx.fill();
            ctx.beginPath(); ctx.arc( bodyW*0.35, -bodyH*0.28, 2, 0, Math.PI*2); ctx.fill();
            ctx.beginPath(); ctx.arc( bodyW*0.35,  bodyH*0.28, 2, 0, Math.PI*2); ctx.fill();
            ctx.restore();

            // 3. Core energy channel pulsating
            ctx.fillStyle = `rgba(0, 229, 255, ${0.08 + 0.12 * _aiP})`;
            ctx.beginPath(); ctx.arc(0, 0, Math.min(bodyW, bodyH) * 0.35, 0, Math.PI*2); ctx.fill();
            
            // 4. Rotating containment ring
            ctx.save();
            ctx.rotate(-_aiT * 0.8);
            ctx.strokeStyle = `rgba(0, 229, 255, ${0.4 + 0.2*_aiP})`;
            ctx.lineWidth = 1.2;
            ctx.setLineDash([6, 4]); // dashed high-tech ring
            ctx.beginPath();
            ctx.arc(0, 0, Math.min(bodyW, bodyH) * 0.28, 0, Math.PI*2);
            ctx.stroke();
            ctx.restore();
        } else {
            // Default
            ctx.fillStyle = color;
            ctx.fillRect(-bodyW/2, -bodyH/2, bodyW, bodyH);
        }
        // hatch outline
        if (type !== 'illuminat') {
            ctx.strokeStyle = 'rgba(0,0,0,0.25)'; ctx.strokeRect(-W*0.12, -H*0.12, W*0.24, H*0.24);
        }
    }
    ctx.rotate(-hullAngle);
    // turret
    // For Illuminat, we want the body to rotate with turretAngle too (as it's a floating pyramid looking at target)
    // The previous loop drew body which rotates with baseAngle (implicitly 0 offset in drawTankOn, assuming caller rotated ctx)
    // Wait, drawTankOn rotates for turret at the end.
    // So for Illuminat, we just do everything in the turret block.

    if (type === 'illuminat') {
        // We need to rotate for the pyramid "body" which is actually the turret
        ctx.rotate(turretAngle || 0);
    } else {
        ctx.rotate(turretAngle || 0);
    }
    
    // ... rest of turret drawing ...
    const tSize = Math.min(W, H) * 0.35 * turretScale * ((type === 'normal' && turretScale === 1 ? 1.95 : 1) * (type === 'ice' && turretScale === 1 ? 1.8 : 1) * (type === 'fire' && turretScale === 1 ? 1.6 : 1) * (type === 'buratino' ? 1.5 : 1));
    if (type === 'normal') {
        // Reinforced Turret
        const grad = ctx.createLinearGradient(-tSize/2, 0, tSize/2, 0);
        grad.addColorStop(0, '#556B2F'); grad.addColorStop(1, '#6B8E23');
        ctx.fillStyle = grad;
        ctx.fillRect(-tSize/2, -tSize/2, tSize, tSize);
        // Hatch
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.beginPath(); ctx.arc(0, 0, tSize*0.25, 0, Math.PI*2); ctx.fill();
        // Bolts
        ctx.fillStyle = '#222';
        ctx.fillRect(-tSize/2+2, -tSize/2+2, 3, 3);
        ctx.fillRect(tSize/2-5, -tSize/2+2, 3, 3);
        ctx.fillRect(-tSize/2+2, tSize/2-5, 3, 3);
        ctx.fillRect(tSize/2-5, tSize/2-5, 3, 3);
    } else if (type === 'fire') {
        // Heat-shielded pressure chamber, with a copper regulator at its center.
        const casing = ctx.createLinearGradient(0, -tSize*0.53, 0, tSize*0.53);
        casing.addColorStop(0, '#ffcf80'); casing.addColorStop(0.45, '#d47635'); casing.addColorStop(1, '#673424');
        ctx.fillStyle = casing; ctx.strokeStyle = '#252827'; ctx.lineWidth = 1.3;
        ctx.beginPath(); ctx.moveTo(-tSize*0.48, -tSize*0.34); ctx.lineTo(-tSize*0.3, -tSize*0.48);
        ctx.lineTo(tSize*0.38, -tSize*0.41); ctx.lineTo(tSize*0.5, -tSize*0.19);
        ctx.lineTo(tSize*0.5, tSize*0.19); ctx.lineTo(tSize*0.38, tSize*0.41);
        ctx.lineTo(-tSize*0.3, tSize*0.48); ctx.lineTo(-tSize*0.48, tSize*0.34); ctx.closePath(); ctx.fill(); ctx.stroke();
        ctx.fillStyle = '#572a20';
        ctx.beginPath(); ctx.ellipse(-tSize*0.07, 0, tSize*0.28, tSize*0.3, 0, 0, Math.PI*2); ctx.fill();
        ctx.strokeStyle = '#ffcf75'; ctx.lineWidth = Math.max(1, tSize*0.07);
        ctx.beginPath(); ctx.arc(-tSize*0.07, 0, tSize*0.18, 0, Math.PI*2); ctx.stroke();
        ctx.fillStyle = '#ef6c2d';
        ctx.beginPath(); ctx.arc(-tSize*0.07, 0, tSize*0.08, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = '#ffe2a5';
        for (const side of [-1, 1]) {
            ctx.beginPath(); ctx.arc(tSize*0.29, side*tSize*0.28, Math.max(0.6, tSize*0.035), 0, Math.PI*2); ctx.fill();
        }
    } else if (type === 'toxic') {
        // Sealed mixer dome with three clamp bolts and a warning plate.
        const dome = ctx.createRadialGradient(-tSize*0.18, -tSize*0.25, tSize*0.04, 0, 0, tSize*0.6);
        dome.addColorStop(0, '#d1e994'); dome.addColorStop(0.6, '#6eaa59'); dome.addColorStop(1, '#265541');
        ctx.fillStyle = dome; ctx.strokeStyle = '#27362e'; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.ellipse(0, 0, tSize*0.52, tSize*0.46, 0, 0, Math.PI*2); ctx.fill(); ctx.stroke();
        ctx.strokeStyle = '#e0f2a3'; ctx.lineWidth = Math.max(0.8, tSize*0.055);
        ctx.beginPath(); ctx.ellipse(0, 0, tSize*0.32, tSize*0.28, 0, 0, Math.PI*2); ctx.stroke();
        ctx.fillStyle = '#315f3d';
        ctx.beginPath(); ctx.arc(0, 0, tSize*0.22, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = '#f0d970';
        ctx.beginPath(); ctx.moveTo(tSize*0.1, -tSize*0.11); ctx.lineTo(tSize*0.1, tSize*0.11);
        ctx.lineTo(-tSize*0.11, 0); ctx.closePath(); ctx.fill();
        ctx.fillStyle = '#e8f4bb';
        for (let i = 0; i < 3; i++) {
            const angle = i*Math.PI*2/3;
            ctx.beginPath(); ctx.arc(Math.cos(angle)*tSize*0.39, Math.sin(angle)*tSize*0.35, Math.max(0.6, tSize*0.035), 0, Math.PI*2); ctx.fill();
        }
    } else if (type === 'ice') {
        // Crystalline Turret to stand out
        // Darker base for contrast
        ctx.fillStyle = '#154360'; 
        ctx.fillRect(-tSize/2, -tSize/2, tSize, tSize);
        // Lighter top facets
        ctx.fillStyle = '#5dade2';
        ctx.beginPath(); ctx.moveTo(-tSize/2, -tSize/2); ctx.lineTo(tSize/2, -tSize/2); ctx.lineTo(0, 0); ctx.fill();
        // Highlight center
        const rad = ctx.createRadialGradient(0, 0, 0, 0, 0, tSize/2);
        rad.addColorStop(0, '#ffffff'); rad.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = rad;
        ctx.fillRect(-tSize/2, -tSize/2, tSize, tSize);
        // Border
        ctx.strokeStyle = '#aed6f1';
        ctx.lineWidth = 1;
        ctx.strokeRect(-tSize/2, -tSize/2, tSize, tSize);
    } else if (type === 'buratino') {
        // Placeholder, overwritten by detailed drawing below
        ctx.fillStyle = '#4b6b30';
        ctx.fillRect(-tSize/2, -tSize/2, tSize, tSize);
    } else if (type === 'musical') {
        // Musical Turret (Speaker with Sound Waves)
        ctx.fillStyle = '#2c3e50';
        ctx.fillRect(-tSize/2, -tSize/2, tSize, tSize);
        
        // Speaker grille
        ctx.fillStyle = '#34495e';
        for (let i = 0; i < 5; i++) {
            ctx.fillRect(-tSize/2 + 2 + i*4, -tSize/2 + 2, 2, tSize - 4);
        }
        
        // Sound waves
        ctx.strokeStyle = '#f1c40f';
        ctx.lineWidth = 2;
        for (let i = 0; i < 3; i++) {
            const radius = (i + 1) * 5;
            ctx.beginPath();
            ctx.arc(0, 0, radius, -Math.PI/4, Math.PI/4);
            ctx.stroke();
        }
    } else if (type === 'illuminat') {
        const s = Math.min(W, H), time = Date.now() * 0.001;
        ctx.save();
        // The pyramid's capstone points along the firing direction.
        ctx.rotate(Math.PI / 2);

        // A subdued shadow and rotating ring make the pyramid look suspended.
        ctx.fillStyle = 'rgba(12,17,16,0.34)';
        ctx.beginPath(); ctx.ellipse(0, s * 0.12, s * 0.44, s * 0.32, 0, 0, Math.PI * 2); ctx.fill();
        ctx.save(); ctx.rotate(time * 0.45);
        ctx.strokeStyle = 'rgba(197,163,79,0.42)'; ctx.lineWidth = Math.max(0.6, s * 0.018);
        ctx.beginPath(); ctx.arc(0, 0, s * 0.54, 0, Math.PI * 2); ctx.stroke();
        for (let i = 0; i < 4; i++) {
            const a = i * Math.PI / 2;
            ctx.fillStyle = '#b99855';
            ctx.beginPath(); ctx.arc(Math.cos(a) * s * 0.54, Math.sin(a) * s * 0.54, Math.max(0.8, s * 0.022), 0, Math.PI * 2); ctx.fill();
        }
        ctx.restore();

        // The lower pyramid is faceted gold over a dark metal foundation.
        const gold = ctx.createLinearGradient(-s * 0.45, -s * 0.2, s * 0.45, s * 0.42);
        gold.addColorStop(0, '#e4c571'); gold.addColorStop(0.48, '#c59a45'); gold.addColorStop(1, '#76512c');
        ctx.beginPath(); ctx.moveTo(-s * 0.18, -s * 0.19); ctx.lineTo(s * 0.18, -s * 0.19);
        ctx.lineTo(s * 0.48, s * 0.39); ctx.lineTo(-s * 0.48, s * 0.39); ctx.closePath();
        ctx.fillStyle = gold; ctx.fill(); ctx.strokeStyle = '#34291e'; ctx.lineWidth = Math.max(1.3, s * 0.04); ctx.lineJoin = 'round'; ctx.stroke();
        ctx.fillStyle = 'rgba(255,232,155,0.20)';
        ctx.beginPath(); ctx.moveTo(-s * 0.18, -s * 0.19); ctx.lineTo(0, -s * 0.19);
        ctx.lineTo(0, s * 0.39); ctx.lineTo(-s * 0.48, s * 0.39); ctx.closePath(); ctx.fill();
        ctx.strokeStyle = 'rgba(76,51,25,0.38)'; ctx.lineWidth = Math.max(0.55, s * 0.014);
        ctx.beginPath(); ctx.moveTo(-s * 0.37, s * 0.19); ctx.lineTo(s * 0.37, s * 0.19);
        ctx.moveTo(-s * 0.44, s * 0.32); ctx.lineTo(s * 0.44, s * 0.32); ctx.stroke();
        ctx.strokeStyle = 'rgba(255,230,149,0.48)'; ctx.lineWidth = Math.max(0.6, s * 0.016);
        ctx.beginPath(); ctx.moveTo(-s * 0.18, -s * 0.16); ctx.lineTo(-s * 0.43, s * 0.34);
        ctx.lineTo(s * 0.43, s * 0.34); ctx.stroke();

        // The eye remains legible at battle size, with a restrained luminous iris.
        const eyeY = s * 0.08;
        const eyeHeat = Math.max(0, Math.min(1, (heatState && heatState.illuminatUltStrength) || 0));
        const eyeColor = (normal, hot) => `rgb(${normal.map((channel, i) => Math.round(channel + (hot[i] - channel) * eyeHeat)).join(',')})`;
        ctx.beginPath(); ctx.moveTo(-s * 0.27, eyeY);
        ctx.quadraticCurveTo(0, eyeY - s * 0.19, s * 0.27, eyeY);
        ctx.quadraticCurveTo(0, eyeY + s * 0.19, -s * 0.27, eyeY); ctx.closePath();
        ctx.fillStyle = eyeColor([246, 233, 197], [228, 101, 93]); ctx.fill(); ctx.strokeStyle = '#493723'; ctx.lineWidth = Math.max(1, s * 0.028); ctx.stroke();
        ctx.fillStyle = eyeColor([66, 142, 145], [168, 31, 34]); ctx.beginPath(); ctx.arc(0, eyeY, s * 0.085, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = eyeColor([23, 42, 42], [57, 15, 14]); ctx.beginPath(); ctx.arc(0, eyeY, s * 0.042, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = eyeColor([235, 248, 232], [255, 224, 197]); ctx.beginPath(); ctx.arc(-s * 0.025, eyeY - s * 0.028, Math.max(0.6, s * 0.017), 0, Math.PI * 2); ctx.fill();

        // The floating capstone houses the cannon, with its muzzle flush at the tip.
        ctx.save(); ctx.translate(0, Math.sin(time * 2) * s * 0.015);
        const cap = ctx.createLinearGradient(-s * 0.2, -s * 0.52, s * 0.2, -s * 0.2);
        cap.addColorStop(0, '#fff1bd'); cap.addColorStop(0.55, '#e0bd6a'); cap.addColorStop(1, '#a47737');
        ctx.fillStyle = cap; ctx.strokeStyle = '#413220'; ctx.lineWidth = Math.max(1, s * 0.035);
        ctx.beginPath(); ctx.moveTo(-s * 0.045, -s * 0.56); ctx.lineTo(s * 0.045, -s * 0.56);
        ctx.lineTo(s * 0.18, -s * 0.24); ctx.lineTo(-s * 0.18, -s * 0.24); ctx.closePath(); ctx.fill(); ctx.stroke();
        ctx.fillStyle = '#5a452b';
        ctx.beginPath(); ctx.moveTo(-s * 0.04, -s * 0.52); ctx.lineTo(s * 0.04, -s * 0.52);
        ctx.lineTo(s * 0.09, -s * 0.35); ctx.lineTo(0, -s * 0.30); ctx.lineTo(-s * 0.09, -s * 0.35); ctx.closePath(); ctx.fill();
        ctx.fillStyle = '#83beb3';
        ctx.beginPath(); ctx.moveTo(0, -s * 0.49); ctx.lineTo(s * 0.045, -s * 0.37);
        ctx.lineTo(0, -s * 0.34); ctx.lineTo(-s * 0.045, -s * 0.37); ctx.closePath(); ctx.fill();
        ctx.strokeStyle = '#1d302d'; ctx.lineWidth = Math.max(1, s * 0.025);
        ctx.beginPath(); ctx.moveTo(-s * 0.035, -s * 0.55); ctx.lineTo(s * 0.035, -s * 0.55); ctx.stroke();
        ctx.restore(); ctx.restore();
    } else if (type === 'mirror') {
        // Mirror Turret (Prism/Reflective)
        const grad = ctx.createLinearGradient(-tSize/2, -tSize/2, tSize/2, tSize/2);
        grad.addColorStop(0, '#bdc3c7'); 
        grad.addColorStop(0.5, '#ecf0f1'); 
        grad.addColorStop(1, '#7f8c8d');
        ctx.fillStyle = grad;
        ctx.fillRect(-tSize/2, -tSize/2, tSize, tSize);
        
        // Reflective sheen
        ctx.fillStyle = 'rgba(255,255,255,0.6)';
        ctx.beginPath();
        ctx.moveTo(-tSize/2, -tSize/2);
        ctx.lineTo(0, -tSize/2);
        ctx.lineTo(tSize/2, tSize/2);
        ctx.lineTo(-tSize/2, tSize/2);
        ctx.fill();
        
        // Crystal core
        ctx.fillStyle = '#3498db';
        ctx.beginPath();
        ctx.moveTo(0, -tSize/4);
        ctx.lineTo(tSize/4, 0);
        ctx.lineTo(0, tSize/4);
        ctx.lineTo(-tSize/4, 0);
        ctx.fill();

        ctx.strokeStyle = '#95a5a6';
        ctx.lineWidth = 1;
        ctx.strokeRect(-tSize/2, -tSize/2, tSize, tSize);
    } else if (type === 'time') {
        // Minimalistic White Clock Turret (2.5x larger)
        const clockSize = tSize * 2.5;

        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(0, 0, clockSize/2, 0, Math.PI*2);
        ctx.fill();

        // Black Border
        ctx.strokeStyle = '#2c3e50';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Clock Face
        const now = Date.now();
        // Custom timing: red (second) hand completes full rotation every 10s;
        // black (minute) hand completes full rotation every 120s by stepping one of 12 notches every 10s.
        const sec = (now % 10000) / 1000; // seconds within 10s window (0..10)
        // min not used; minuteIndex computed from 10s ticks

        ctx.save();
        // Markers (Black dots)
        ctx.fillStyle = '#000';
        for(let i=0; i<12; i++) {
            const a = (i/12) * Math.PI*2;
            const r = clockSize/2 - 3;
            ctx.beginPath();
            ctx.arc(Math.cos(a)*r, Math.sin(a)*r, 1.5, 0, Math.PI*2);
            ctx.fill();
        }

        // (No hour hand — only minute (black) and second (red) are drawn)

        // Minute Hand (Black) — discrete 12-step hand; advances one notch every 10s (12*10s = 120s full rotation)
        const handLenM = clockSize * 0.35;
        const tick10s = Math.floor(now / 10000) % 12; // 10s ticks modulo 12
        const handAngM = (tick10s / 12) * Math.PI * 2 - Math.PI/2;
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2.5;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(0,0);
        ctx.lineTo(Math.cos(handAngM)*handLenM, Math.sin(handAngM)*handLenM); 
        ctx.stroke();

        // Second Hand (Red linear) — 1 rotation per 10s
        const handLenS = clockSize * 0.42;
        const frac10 = (now % 10000) / 10000; // 0..1 over 10s
        const handAngS = (frac10) * Math.PI * 2 - Math.PI/2;
        ctx.strokeStyle = '#e74c3c'; 
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0,0);
        ctx.lineTo(Math.cos(handAngS)*handLenS, Math.sin(handAngS)*handLenS);
        ctx.stroke();

        ctx.restore();
        
        // Center Pin
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(0,0, 2.5, 0, Math.PI*2);
        ctx.fill();

    } else if (type === 'imitator') {
        // Preserve the hexagonal turret and single prismatic barrel.
        const barrelLen = tSize * 1.55;
        const barrelH   = tSize * 0.27;
        // Barrel body
        const barGrad = ctx.createLinearGradient(0, -barrelH/2, 0, barrelH/2);
        barGrad.addColorStop(0,   '#6c3483');
        barGrad.addColorStop(0.5, '#a569bd');
        barGrad.addColorStop(1,   '#4a235a');
        ctx.fillStyle = barGrad;
        ctx.fillRect(tSize * 0.3, -barrelH/2, barrelLen, barrelH);
        ctx.strokeStyle = 'rgba(236,210,255,0.58)';
        ctx.lineWidth = 0.9;
        ctx.beginPath();
        ctx.moveTo(tSize * 0.38, -barrelH * 0.27);
        ctx.lineTo(tSize * 0.3 + barrelLen * 0.92, -barrelH * 0.27);
        ctx.stroke();
        ctx.fillStyle = 'rgba(28,15,52,0.65)';
        ctx.fillRect(tSize * 0.34, barrelH * 0.22, barrelLen * 0.86, barrelH * 0.12);
        // Prismatic band near muzzle
        const bandGrad = ctx.createLinearGradient(0, -barrelH/2, 0, barrelH/2);
        bandGrad.addColorStop(0,    '#ff0080');
        bandGrad.addColorStop(0.33, '#00ccff');
        bandGrad.addColorStop(0.66, '#80ff00');
        bandGrad.addColorStop(1,    '#ff8000');
        ctx.fillStyle = bandGrad;
        ctx.fillRect(tSize * 0.8, -barrelH * 0.75, tSize * 0.18, barrelH * 1.5);
        ctx.strokeStyle = 'rgba(235,218,255,0.65)';
        ctx.lineWidth = 0.8;
        ctx.strokeRect(tSize * 0.8, -barrelH * 0.75, tSize * 0.18, barrelH * 1.5);
        // Muzzle end cap
        ctx.fillStyle = '#1a1a3e';
        ctx.beginPath();
        ctx.arc(tSize * 0.3 + barrelLen, 0, barrelH * 0.55, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = 'rgba(200,150,255,0.6)';
        ctx.lineWidth = 1;
        ctx.stroke();
        // Hexagonal turret mount
        const hexR = tSize * 0.52;
        ctx.fillStyle = '#1a1a3e';
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
            const a = (i / 6) * Math.PI * 2 - Math.PI / 6;
            i === 0 ? ctx.moveTo(Math.cos(a) * hexR, Math.sin(a) * hexR)
                    : ctx.lineTo(Math.cos(a) * hexR, Math.sin(a) * hexR);
        }
        ctx.closePath();
        ctx.fill();
        // Hex border glow
        ctx.strokeStyle = 'rgba(180,100,255,0.85)';
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.strokeStyle = 'rgba(220,200,255,0.48)';
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
            const a = (i / 6) * Math.PI * 2 - Math.PI / 6;
            i === 0 ? ctx.moveTo(Math.cos(a) * hexR * 0.77, Math.sin(a) * hexR * 0.77)
                    : ctx.lineTo(Math.cos(a) * hexR * 0.77, Math.sin(a) * hexR * 0.77);
        }
        ctx.closePath(); ctx.stroke();
        // Inner crystal orb
        const orbGrad = ctx.createRadialGradient(-hexR*0.1, -hexR*0.15, 0, 0, 0, hexR * 0.38);
        orbGrad.addColorStop(0,   'rgba(255,210,255,0.95)');
        orbGrad.addColorStop(0.5, 'rgba(160,0,255,0.75)');
        orbGrad.addColorStop(1,   'rgba(50,0,120,0.5)');
        ctx.fillStyle = orbGrad;
        ctx.beginPath();
        ctx.arc(0, 0, hexR * 0.38, 0, Math.PI * 2);
        ctx.fill();
        // Crystal sparkle lines
        ctx.strokeStyle = 'rgba(255,255,255,0.55)';
        ctx.lineWidth = 1;
        for (let i = 0; i < 4; i++) {
            const a = (i / 4) * Math.PI;
            ctx.beginPath();
            ctx.moveTo(Math.cos(a) * hexR * 0.12, Math.sin(a) * hexR * 0.12);
            ctx.lineTo(Math.cos(a) * hexR * 0.36, Math.sin(a) * hexR * 0.36);
            ctx.stroke();
        }
    } else if (type === 'electric') {
        // ELECTRIC ROBOT Turret - ELEGANT ELECTRIC GENERATOR
        const turretBase = tSize * 0.65;
        
        // Dark base layer
        ctx.fillStyle = '#0a0a15';
        ctx.fillRect(-turretBase/2, -turretBase/2, turretBase, turretBase);
        
        // Main turret gradient - softer energy
        const turretGrad = ctx.createLinearGradient(-turretBase/2, -turretBase/2, turretBase/2, turretBase/2);
        turretGrad.addColorStop(0, '#1a2a50');
        turretGrad.addColorStop(0.5, '#0f1f40');
        turretGrad.addColorStop(1, '#1a2a50');
        ctx.fillStyle = turretGrad;
        ctx.fillRect(-turretBase/2, -turretBase/2, turretBase, turretBase);

        // Subtle pulsing energy field
        const turboPulse = 0.5 + 0.3 * Math.sin(Date.now() * 0.006);
        ctx.fillStyle = `rgba(100, 180, 220, ${0.08 * turboPulse})`;
        ctx.fillRect(-turretBase/2 - 2, -turretBase/2 - 2, turretBase + 4, turretBase + 4);

        // Clean energy circuit lines
        ctx.strokeStyle = `rgba(100, 180, 220, ${0.6 * turboPulse})`;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(-turretBase*0.3, -turretBase*0.25);
        ctx.lineTo(0, 0);
        ctx.lineTo(turretBase*0.3, turretBase*0.25);
        ctx.stroke();
        
        ctx.lineWidth = 1;
        ctx.strokeStyle = 'rgba(100, 180, 220, 0.4)';
        ctx.beginPath();
        ctx.moveTo(-turretBase*0.2, turretBase*0.3);
        ctx.lineTo(0, -turretBase*0.15);
        ctx.lineTo(turretBase*0.2, turretBase*0.3);
        ctx.stroke();

        // Central elegant core
        const coreGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, turretBase * 0.18);
        coreGrad.addColorStop(0, '#66ccff');
        coreGrad.addColorStop(0.5, `rgba(80, 180, 220, ${turboPulse})`);
        coreGrad.addColorStop(1, `rgba(60, 140, 200, ${0.2 * turboPulse})`);
        ctx.fillStyle = coreGrad;
        ctx.beginPath();
        ctx.arc(0, 0, turretBase * 0.16, 0, Math.PI * 2);
        ctx.fill();

        // Dark inner core
        ctx.fillStyle = '#050510';
        ctx.beginPath();
        ctx.arc(0, 0, turretBase * 0.07, 0, Math.PI * 2);
        ctx.fill();

        // Clean double border
        ctx.strokeStyle = 'rgba(100, 180, 220, 0.7)';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(-turretBase/2, -turretBase/2, turretBase, turretBase);
        
        ctx.strokeStyle = 'rgba(80, 160, 200, 0.3)';
        ctx.lineWidth = 0.8;
        ctx.strokeRect(-turretBase/2 + 1.5, -turretBase/2 + 1.5, turretBase - 3, turretBase - 3);

        // Energy nodes at corners (small, clean)
        ctx.fillStyle = '#4da6ff';
        const corners = [[-turretBase/2+3, -turretBase/2+3], [turretBase/2-3, -turretBase/2+3], 
                         [-turretBase/2+3, turretBase/2-3], [turretBase/2-3, turretBase/2-3]];
        for (const [cx, cy] of corners) {
            ctx.beginPath();
            ctx.arc(cx, cy, 2, 0, Math.PI*2);
            ctx.fill();
        }

        // BARREL - Elegant Electric Discharge Cannon
        const barrelLen = tSize * 1.95;
        const barrelH = tSize * 0.32;
        
        // Barrel gradient - balanced colors
        const barGrad = ctx.createLinearGradient(tSize * 0.3, -barrelH/2, tSize * 0.3 + barrelLen, barrelH/2);
        barGrad.addColorStop(0, '#0f1f35');
        barGrad.addColorStop(0.2, '#4da6ff');
        barGrad.addColorStop(0.4, '#2d7bb0');
        barGrad.addColorStop(0.6, '#4da6ff');
        barGrad.addColorStop(0.8, '#1a2a40');
        barGrad.addColorStop(1, '#0a0a15');
        ctx.fillStyle = barGrad;
        ctx.fillRect(tSize * 0.3, -barrelH/2, barrelLen, barrelH);

        // Top bright edge (subtle)
        ctx.fillStyle = 'rgba(100, 180, 220, 0.5)';
        ctx.fillRect(tSize * 0.3, -barrelH/2, barrelLen, barrelH * 0.25);

        // Electric coil rings - elegant
        ctx.strokeStyle = `rgba(100, 180, 220, ${0.6 * turboPulse})`;
        ctx.lineWidth = 1.5;
        for (let i = 0; i < 4; i++) {
            const cx = tSize * 0.3 + barrelLen * (0.25 + i * 0.22);
            ctx.beginPath();
            ctx.arc(cx, 0, barrelH * 0.4, 0, Math.PI * 2);
            ctx.stroke();
        }

        // Muzzle - Clean Electric Opening
        const muzzleX = tSize * 0.3 + barrelLen;
        const muzzleGrad = ctx.createRadialGradient(muzzleX, 0, barrelH*0.12, muzzleX, 0, barrelH*0.62);
        muzzleGrad.addColorStop(0, '#66ccff');
        muzzleGrad.addColorStop(0.35, '#4da6ff');
        muzzleGrad.addColorStop(0.7, `rgba(80, 160, 200, ${0.4 * turboPulse})`);
        muzzleGrad.addColorStop(1, 'rgba(60, 120, 180, 0.1)');
        ctx.fillStyle = muzzleGrad;
        ctx.beginPath();
        ctx.arc(muzzleX, 0, barrelH*0.6, 0, Math.PI*2);
        ctx.fill();

        // Muzzle core
        ctx.fillStyle = `rgba(80, 160, 200, ${0.5 * turboPulse})`;
        ctx.beginPath();
        ctx.arc(muzzleX, 0, barrelH*0.3, 0, Math.PI*2);
        ctx.fill();

        // Dark muzzle center
        ctx.fillStyle = '#000a15';
        ctx.beginPath();
        ctx.arc(muzzleX, 0, barrelH*0.12, 0, Math.PI*2);
        ctx.fill();

    } else if (type === 'machinegun') {
        // Low faceted turret with a visible cannon cradle.
        const turretArmor = ctx.createLinearGradient(0, -tSize*0.52, 0, tSize*0.52);
        turretArmor.addColorStop(0, '#9ca7a5');
        turretArmor.addColorStop(0.42, '#52636a');
        turretArmor.addColorStop(1, '#29383e');
        ctx.fillStyle = turretArmor;
        ctx.strokeStyle = '#16232a';
        ctx.lineWidth = 1.1;
        ctx.beginPath();
        ctx.moveTo(-tSize*0.5, -tSize*0.28);
        ctx.lineTo(-tSize*0.26, -tSize*0.52);
        ctx.lineTo(tSize*0.27, -tSize*0.48);
        ctx.lineTo(tSize*0.52, -tSize*0.27);
        ctx.lineTo(tSize*0.52, tSize*0.27);
        ctx.lineTo(tSize*0.27, tSize*0.48);
        ctx.lineTo(-tSize*0.26, tSize*0.52);
        ctx.lineTo(-tSize*0.5, tSize*0.28);
        ctx.closePath(); ctx.fill(); ctx.stroke();
        ctx.fillStyle = '#26343a';
        ctx.fillRect(-tSize*0.13, -tSize*0.29, tSize*0.55, tSize*0.58);
        ctx.fillStyle = '#9b8a69';
        ctx.fillRect(-tSize*0.38, -tSize*0.36, tSize*0.18, tSize*0.07);
        ctx.fillRect(-tSize*0.38, tSize*0.29, tSize*0.18, tSize*0.07);
        ctx.fillStyle = '#6e7e82';
        ctx.beginPath(); ctx.arc(-tSize*0.16, 0, tSize*0.18, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = '#1c2b30';
        ctx.beginPath(); ctx.arc(-tSize*0.16, 0, tSize*0.09, 0, Math.PI*2); ctx.fill();

    } else if (type === 'buckshot') {
        // Buckshot Turret — Side-by-side double-barrel shotgun
        const bLen   = tSize * 1.05;  // total barrel length beyond turret
        const bR     = tSize * 0.14;  // barrel radius
        const bSep   = tSize * 0.17;  // barrel centre offset from 0
        const baseX  = tSize / 2;     // point where barrels leave the turret box

        // ── Turret housing ──
        const hsGrad = ctx.createLinearGradient(-tSize/2, -tSize/2, tSize/2, tSize/2);
        hsGrad.addColorStop(0, '#37474F');
        hsGrad.addColorStop(0.5, '#455A64');
        hsGrad.addColorStop(1, '#263238');
        ctx.fillStyle = hsGrad;
        ctx.fillRect(-tSize/2, -tSize/2, tSize, tSize);

        // Housing border
        ctx.strokeStyle = '#546E7A';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(-tSize/2 + 1, -tSize/2 + 1, tSize - 2, tSize - 2);

        // Hatch
        ctx.fillStyle = '#546E7A';
        ctx.fillRect(-tSize*0.22, -tSize*0.22, tSize*0.44, tSize*0.44);
        ctx.fillStyle = '#263238';
        ctx.beginPath(); ctx.arc(0, 0, tSize*0.1, 0, Math.PI*2); ctx.fill();

        // ── Barrels (drawn back→front so front face overlaps) ──
        for (let s = -1; s <= 1; s += 2) {   // s = -1 (top), +1 (bottom)
            const cy = s * bSep;

            // Barrel body — gradient to fake cylinder shading
            const barGrad = ctx.createLinearGradient(baseX, cy - bR, baseX, cy + bR);
            barGrad.addColorStop(0,   '#5a5a5a');   // lit top edge
            barGrad.addColorStop(0.3, '#2a2a2a');   // mid barrel
            barGrad.addColorStop(0.7, '#111');       // shadow groove
            barGrad.addColorStop(1,   '#3a3a3a');   // lit bottom edge
            ctx.fillStyle = barGrad;
            ctx.fillRect(baseX - 4, cy - bR, bLen + 4, bR * 2);

            // Barrel highlight (top glint)
            ctx.fillStyle = 'rgba(255,255,255,0.12)';
            ctx.fillRect(baseX - 4, cy - bR, bLen + 4, bR * 0.35);

            // Heat-vent slots (3 slots near muzzle)
            ctx.fillStyle = '#000';
            for (let vi = 0; vi < 3; vi++) {
                ctx.fillRect(baseX + bLen * (0.55 + vi * 0.12), cy - bR * 0.6, bLen * 0.06, bR * 1.2);
            }

            // ── Muzzle brake / Bell ──
            // Dark outer circle
            ctx.fillStyle = '#111';
            ctx.beginPath();
            ctx.arc(baseX + bLen, cy, bR * 1.2, 0, Math.PI * 2);
            ctx.fill();
            // Inner bore ring
            ctx.fillStyle = '#2a2a2a';
            ctx.beginPath();
            ctx.arc(baseX + bLen, cy, bR * 0.85, 0, Math.PI * 2);
            ctx.fill();
            // Bore black hole
            ctx.fillStyle = '#000';
            ctx.beginPath();
            ctx.arc(baseX + bLen, cy, bR * 0.5, 0, Math.PI * 2);
            ctx.fill();
            // Rim highlight
            ctx.strokeStyle = '#555';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.arc(baseX + bLen, cy, bR * 1.2, -Math.PI*0.7, Math.PI*0.7, true);
            ctx.stroke();
        }

        // ── Barrel separator bar ──
        ctx.fillStyle = '#263238';
        ctx.fillRect(baseX, -2, bLen * 0.85, 4);

        // ── Fore-stock (grip wrap around barrels) ──
        const gripX = baseX + bLen * 0.25;
        const gripW = bLen * 0.35;
        const gripH = bSep * 2 + bR * 2.6;
        const rnd   = Math.min(4, gripW * 0.2);
        ctx.fillStyle = '#37474F';
        ctx.beginPath();
        ctx.moveTo(gripX + rnd, -gripH/2);
        ctx.lineTo(gripX + gripW - rnd, -gripH/2);
        ctx.quadraticCurveTo(gripX + gripW, -gripH/2, gripX + gripW, -gripH/2 + rnd);
        ctx.lineTo(gripX + gripW, gripH/2 - rnd);
        ctx.quadraticCurveTo(gripX + gripW, gripH/2, gripX + gripW - rnd, gripH/2);
        ctx.lineTo(gripX + rnd, gripH/2);
        ctx.quadraticCurveTo(gripX, gripH/2, gripX, gripH/2 - rnd);
        ctx.lineTo(gripX, -gripH/2 + rnd);
        ctx.quadraticCurveTo(gripX, -gripH/2, gripX + rnd, -gripH/2);
        ctx.closePath();
        ctx.fill();
        // Grip ridges
        ctx.fillStyle = '#263238';
        for (let ri = 1; ri <= 3; ri++) {
            const ridgeX = gripX + gripW * ri / 4;
            ctx.fillRect(ridgeX, -gripH*0.36, Math.max(0.6, gripW*0.065), gripH*0.72);
        }

    } else if (type === 'waterjet') {
        // Pressurized round turret – concentric blue rings
        const wjGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, tSize/2);
        wjGrad.addColorStop(0, '#85c1e9');
        wjGrad.addColorStop(0.5, '#2e86c1');
        wjGrad.addColorStop(1, '#1a5276');
        ctx.fillStyle = wjGrad;
        ctx.beginPath(); ctx.arc(0, 0, tSize/2, 0, Math.PI*2); ctx.fill();
        ctx.strokeStyle = 'rgba(174,214,241,0.7)';
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.arc(0, 0, tSize*0.25, 0, Math.PI*2); ctx.stroke();
        ctx.beginPath(); ctx.arc(0, 0, tSize*0.42, 0, Math.PI*2); ctx.stroke();
        ctx.fillStyle = '#aed6f1';
        ctx.beginPath(); ctx.arc(0, 0, tSize*0.12, 0, Math.PI*2); ctx.fill();
    } else if (type === 'plasma') {
        // Handled below
    } else if (type === 'robot') {
        // Robotic dome turret with sensor eye
        const rTGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, tSize/2);
        rTGrad.addColorStop(0, '#455a64');
        rTGrad.addColorStop(0.6, '#263238');
        rTGrad.addColorStop(1, '#1a2226');
        ctx.fillStyle = rTGrad;
        ctx.beginPath(); ctx.arc(0, 0, tSize/2, 0, Math.PI*2); ctx.fill();
        // Sensor ring
        ctx.strokeStyle = '#00e5ff';
        ctx.lineWidth = 2;
        ctx.shadowColor = '#00e5ff';
        ctx.shadowBlur = 8;
        ctx.beginPath(); ctx.arc(0, 0, tSize*0.28, 0, Math.PI*2); ctx.stroke();
        // Central red sensor eye
        ctx.shadowColor = '#ff1744';
        ctx.shadowBlur = 10;
        ctx.fillStyle = '#ff1744';
        ctx.beginPath(); ctx.arc(0, 0, tSize*0.12, 0, Math.PI*2); ctx.fill();
        ctx.shadowBlur = 0;
    } else if (type === 'medical') {
        // Medical turret — white dome with red cross
        const medTGrad = ctx.createRadialGradient(0, 0, tSize*0.1, 0, 0, tSize/2);
        medTGrad.addColorStop(0, '#f5f5f5');
        medTGrad.addColorStop(0.5, '#d9d9d9');
        medTGrad.addColorStop(1, '#bfbfbf');
        ctx.fillStyle = medTGrad;
        ctx.beginPath(); ctx.arc(0, 0, tSize/2, 0, Math.PI*2); ctx.fill();
        // Simple outline
        ctx.strokeStyle = '#999';
        ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.arc(0, 0, tSize/2, 0, Math.PI*2); ctx.stroke();
        // Red medical cross
        ctx.fillStyle = '#ff2222';
        const crossSize = tSize * 0.20;
        const crossThick = tSize * 0.09;
        ctx.fillRect(-crossSize/2, -crossThick/2, crossSize, crossThick); // horizontal
        ctx.fillRect(-crossThick/2, -crossSize/2, crossThick, crossSize); // vertical
    } else if (type === 'roman') {
        // Roman Turret - domed imperial cupola: crimson base with gleaming gold crest
        // Outer golden rim ring
        ctx.strokeStyle = '#D4A017';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(0, 0, tSize * 0.56, 0, Math.PI * 2);
        ctx.stroke();

        // Dome body: crimson with golden highlight
        const romTGrad = ctx.createRadialGradient(-tSize * 0.18, -tSize * 0.18, 0, 0, 0, tSize * 0.52);
        romTGrad.addColorStop(0, '#FF4040');
        romTGrad.addColorStop(0.45, '#C41E3A');
        romTGrad.addColorStop(1, '#6b0000');
        ctx.fillStyle = romTGrad;
        ctx.beginPath();
        ctx.arc(0, 0, tSize * 0.52, 0, Math.PI * 2);
        ctx.fill();

        // Gold equatorial band on dome
        ctx.strokeStyle = '#FFD700';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(0, 0, tSize * 0.38, 0, Math.PI * 2);
        ctx.stroke();

        // Helmet crest plume (front-pointing arc of crimson feathers)
        ctx.strokeStyle = '#FF1010';
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(-tSize * 0.4, -tSize * 0.45);
        ctx.quadraticCurveTo(0, -tSize * 0.78, tSize * 0.4, -tSize * 0.45);
        ctx.stroke();
        // Gold shimmer on crest
        ctx.strokeStyle = 'rgba(255,215,0,0.6)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(-tSize * 0.32, -tSize * 0.42);
        ctx.quadraticCurveTo(0, -tSize * 0.68, tSize * 0.32, -tSize * 0.42);
        ctx.stroke();
        ctx.lineCap = 'butt';

        // Inner dark socket
        ctx.fillStyle = '#3b0000';
        ctx.beginPath();
        ctx.arc(0, 0, tSize * 0.18, 0, Math.PI * 2);
        ctx.fill();
        // Gold center rivet
        ctx.fillStyle = '#FFD700';
        ctx.beginPath();
        ctx.arc(0, 0, tSize * 0.07, 0, Math.PI * 2);
        ctx.fill();
    } else if (type === 'egyptian') {
        const crownR = tSize * 0.54;
        ctx.save();
        ctx.beginPath();
        ctx.arc(0, 0, crownR, 0, Math.PI * 2);
        ctx.clip();
        for (let i = -5; i <= 5; i++) {
            ctx.fillStyle = i % 2 === 0 ? '#113c74' : '#d8b561';
            ctx.fillRect(i * tSize * 0.1 - tSize * 0.05, -crownR, tSize * 0.1, crownR * 2);
        }
        ctx.restore();

        const egGrad = ctx.createRadialGradient(-tSize * 0.1, -tSize * 0.15, 0, 0, 0, crownR);
        egGrad.addColorStop(0, 'rgba(255,236,180,0.95)');
        egGrad.addColorStop(0.5, 'rgba(214,181,97,0.55)');
        egGrad.addColorStop(1, 'rgba(143,103,32,0.2)');
        ctx.fillStyle = egGrad;
        ctx.beginPath();
        ctx.arc(0, 0, crownR, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#6b4a18';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, 0, crownR, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = '#d7b55e';
        ctx.beginPath();
        ctx.ellipse(0, -tSize * 0.02, tSize * 0.17, tSize * 0.22, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#4d3310';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(-tSize * 0.09, -tSize * 0.05);
        ctx.quadraticCurveTo(-tSize * 0.04, -tSize * 0.1, tSize * 0.005, -tSize * 0.05);
        ctx.moveTo(tSize * 0.09, -tSize * 0.05);
        ctx.quadraticCurveTo(tSize * 0.04, -tSize * 0.1, -tSize * 0.005, -tSize * 0.05);
        ctx.stroke();

        ctx.fillStyle = '#113c74';
        ctx.beginPath();
        ctx.moveTo(0, -crownR * 0.82);
        ctx.quadraticCurveTo(tSize * 0.07, -crownR * 0.6, 0, -crownR * 0.42);
        ctx.quadraticCurveTo(-tSize * 0.07, -crownR * 0.6, 0, -crownR * 0.82);
        ctx.fill();
        ctx.fillStyle = '#d7b55e';
        ctx.beginPath();
        ctx.arc(0, -crownR * 0.48, tSize * 0.045, 0, Math.PI * 2);
        ctx.fill();
    } else if (type === 'mine') {
        // Low armored turret with a circular loading hatch.
        const turretGrad = ctx.createLinearGradient(0, -tSize * 0.58, 0, tSize * 0.58);
        turretGrad.addColorStop(0, '#929a60'); turretGrad.addColorStop(0.5, '#59673c'); turretGrad.addColorStop(1, '#303d27');
        ctx.fillStyle = turretGrad; ctx.strokeStyle = '#202a1b'; ctx.lineWidth = Math.max(1, tSize * 0.08);
        ctx.beginPath(); ctx.ellipse(0, 0, tSize * 0.72, tSize * 0.59, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        ctx.fillStyle = '#3c4b30'; ctx.strokeStyle = '#899268'; ctx.lineWidth = Math.max(0.6, tSize * 0.045);
        ctx.beginPath(); ctx.arc(-tSize * 0.1, 0, tSize * 0.34, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        ctx.strokeStyle = '#b0b786'; ctx.lineWidth = Math.max(0.6, tSize * 0.045);
        ctx.beginPath(); ctx.moveTo(-tSize * 0.28, 0); ctx.lineTo(tSize * 0.08, 0); ctx.stroke();
        ctx.fillStyle = '#d2bd78';
        for (const side of [-1, 1]) {
            ctx.beginPath(); ctx.arc(-tSize * 0.45, side * tSize * 0.29, Math.max(0.55, tSize * 0.045), 0, Math.PI * 2); ctx.fill();
        }
    } else if (type === 'pyro') {
        // Faceted shell-launcher housing with a protected ignition port.
        const turret = ctx.createLinearGradient(0, -tSize*0.5, 0, tSize*0.5);
        turret.addColorStop(0, '#ffc07b'); turret.addColorStop(0.5, '#d16a3d'); turret.addColorStop(1, '#763a2c');
        ctx.fillStyle = turret; ctx.strokeStyle = '#382724'; ctx.lineWidth = 1.3;
        ctx.beginPath(); ctx.moveTo(-tSize*0.47, -tSize*0.3); ctx.lineTo(-tSize*0.28, -tSize*0.48);
        ctx.lineTo(tSize*0.32, -tSize*0.48); ctx.lineTo(tSize*0.49, -tSize*0.27);
        ctx.lineTo(tSize*0.49, tSize*0.27); ctx.lineTo(tSize*0.32, tSize*0.48);
        ctx.lineTo(-tSize*0.28, tSize*0.48); ctx.lineTo(-tSize*0.47, tSize*0.3); ctx.closePath(); ctx.fill(); ctx.stroke();
        ctx.fillStyle = '#392d2b';
        ctx.beginPath(); ctx.arc(-tSize*0.09, 0, tSize*0.27, 0, Math.PI*2); ctx.fill();
        ctx.strokeStyle = '#ffd18c'; ctx.lineWidth = Math.max(0.8, tSize*0.055);
        ctx.beginPath(); ctx.arc(-tSize*0.09, 0, tSize*0.21, 0, Math.PI*2); ctx.stroke();
        ctx.fillStyle = '#f29a4e';
        ctx.beginPath(); ctx.arc(-tSize*0.09, 0, tSize*0.095, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = '#d2ad7b';
        for (const side of [-1, 1]) {
            ctx.beginPath(); ctx.arc(tSize*0.29, side*tSize*0.27, Math.max(0.6, tSize*0.035), 0, Math.PI*2); ctx.fill();
        }
    } else if (type === 'burovoy') {
        const drillAnim = Math.max(0, Math.min(1, (heatState && heatState.burovoyDrillAnim) || 0));
        const drillActive = !!(heatState && heatState.burovoyDrillActive);
        const drillHit = !!(heatState && heatState.burovoyDrillHit);
        if (!isBurovoyFullyBurrowed) {
            const mountR = tSize * 0.33;
            const extension = tSize * (0.08 + drillAnim * 0.22 + (drillActive ? 0.12 : 0));
            const vibration = drillActive ? Math.sin(Date.now() * 0.07) * tSize * 0.015 : 0;
            const drillLen = Math.max(W, H) * 0.78;
            const drillBase = tSize * 0.31;
            const spiralShift = (Date.now() * 0.032) % (drillLen * 0.18);

            const mountGrad = ctx.createRadialGradient(-mountR * 0.18, -mountR * 0.18, 0, 0, 0, mountR);
            mountGrad.addColorStop(0, '#f1ca71');
            mountGrad.addColorStop(0.45, '#8e7136');
            mountGrad.addColorStop(1, '#2d2416');
            ctx.fillStyle = mountGrad;
            ctx.beginPath();
            ctx.arc(0, 0, mountR, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = '#3a3122';
            for (const side of [-1, 1]) {
                ctx.beginPath();
                ctx.moveTo(-mountR * 0.12, side * mountR * 0.68);
                ctx.lineTo(mountR * 0.78, side * mountR * 0.5);
                ctx.lineTo(mountR * 1.02, side * mountR * 0.18);
                ctx.lineTo(mountR * 0.18, side * mountR * 0.08);
                ctx.closePath();
                ctx.fill();
            }

            ctx.save();
            ctx.translate(extension, vibration);

            const drillGrad = ctx.createLinearGradient(-tSize * 0.04, 0, drillLen, 0);
            drillGrad.addColorStop(0, '#4a4a4a');
            drillGrad.addColorStop(0.28, '#e7dfc7');
            drillGrad.addColorStop(0.65, '#9c9c9c');
            drillGrad.addColorStop(1, '#f3eee1');
            ctx.fillStyle = drillGrad;
            ctx.beginPath();
            ctx.moveTo(-tSize * 0.04, -drillBase * 0.56);
            ctx.lineTo(drillLen * 0.54, -drillBase * 0.42);
            ctx.lineTo(drillLen, 0);
            ctx.lineTo(drillLen * 0.54, drillBase * 0.42);
            ctx.lineTo(-tSize * 0.04, drillBase * 0.56);
            ctx.closePath();
            ctx.fill();

            ctx.fillStyle = '#58492b';
            for (const side of [-1, 1]) {
                ctx.beginPath();
                ctx.moveTo(-tSize * 0.02, side * drillBase * 0.66);
                ctx.lineTo(drillLen * 0.22, side * drillBase * 0.58);
                ctx.lineTo(drillLen * 0.1, side * drillBase * 1.05);
                ctx.closePath();
                ctx.fill();
            }

            ctx.save();
            ctx.beginPath();
            ctx.moveTo(-tSize * 0.04, -drillBase * 0.56);
            ctx.lineTo(drillLen * 0.54, -drillBase * 0.42);
            ctx.lineTo(drillLen, 0);
            ctx.lineTo(drillLen * 0.54, drillBase * 0.42);
            ctx.lineTo(-tSize * 0.04, drillBase * 0.56);
            ctx.closePath();
            ctx.clip();

            ctx.strokeStyle = drillHit ? 'rgba(255,245,200,0.95)' : 'rgba(255,255,255,0.72)';
            ctx.lineWidth = 1.7;
            for (let i = -2; i < 8; i++) {
                const sx = -tSize * 0.12 + i * drillLen * 0.18 + spiralShift;
                ctx.beginPath();
                ctx.moveTo(sx, -drillBase * 0.58);
                ctx.lineTo(sx + drillLen * 0.16, drillBase * 0.58);
                ctx.stroke();
            }
            ctx.restore();

            const tipGlow = ctx.createRadialGradient(drillLen * 0.88, 0, 0, drillLen * 0.88, 0, drillBase * 0.7);
            tipGlow.addColorStop(0, drillHit ? 'rgba(255,255,220,0.95)' : 'rgba(255,232,180,0.8)');
            tipGlow.addColorStop(0.4, drillHit ? 'rgba(255,190,80,0.7)' : 'rgba(255,165,60,0.45)');
            tipGlow.addColorStop(1, 'rgba(255,90,0,0)');
            ctx.fillStyle = tipGlow;
            ctx.beginPath();
            ctx.arc(drillLen * 0.88, 0, drillBase * 0.7, 0, Math.PI * 2);
            ctx.fill();

            ctx.strokeStyle = '#1b1812';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(-tSize * 0.04, -drillBase * 0.56);
            ctx.lineTo(drillLen * 0.54, -drillBase * 0.42);
            ctx.lineTo(drillLen, 0);
            ctx.lineTo(drillLen * 0.54, drillBase * 0.42);
            ctx.lineTo(-tSize * 0.04, drillBase * 0.56);
            ctx.closePath();
            ctx.stroke();

            ctx.restore();
        }
    } else if (type === 'spartan') {
        // Spartan turret — Corinthian helmet silhouette
        const spT = ctx.createRadialGradient(-tSize*0.12, -tSize*0.12, 0, 0, 0, tSize*0.65);
        spT.addColorStop(0, spartanRage ? '#e8ad53' : '#d4892a');
        spT.addColorStop(0.55, spartanRage ? '#c48138' : '#b87333');
        spT.addColorStop(1, spartanRage ? '#704014' : '#6b3e10');
        ctx.fillStyle = spT;
        // Rounded helm-dome
        ctx.beginPath();
        ctx.arc(0, 0, tSize * 0.52, 0, Math.PI * 2);
        ctx.fill();
        // Red crest stripe (top of helmet)
        ctx.fillStyle = spartanRage ? '#ae2835' : 'rgba(200,0,0,0.6)';
        ctx.fillRect(-tSize*(spartanRage ? 0.11 : 0.07), -tSize*0.6, tSize*(spartanRage ? 0.22 : 0.14), tSize*0.6);
        if (spartanRage) {
            ctx.fillStyle = '#d5aa6d';
            ctx.fillRect(-tSize*0.17, -tSize*0.42, tSize*0.34, Math.max(1, tSize*0.055));
        }
        // Eye slit
        ctx.fillStyle = 'rgba(20,0,0,0.7)';
        ctx.fillRect(-tSize*0.22, -tSize*0.1, tSize*0.44, tSize*0.12);
        // Border
        ctx.strokeStyle = spartanRage ? '#e0b477' : '#3a1a00';
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.arc(0, 0, tSize * 0.52, 0, Math.PI * 2);
        ctx.stroke();
    } else if (type === 'kamikaze') {
        // The red turret is the sun at the center of the hull's rays.
        const sunRadius = tSize * 0.52;
        const sunArmor = ctx.createRadialGradient(-sunRadius * 0.28, -sunRadius * 0.3, 0, 0, 0, sunRadius);
        sunArmor.addColorStop(0, '#e3474e');
        sunArmor.addColorStop(0.65, '#c91e2b');
        sunArmor.addColorStop(1, '#ac1b27');
        ctx.fillStyle = sunArmor;
        ctx.beginPath(); ctx.arc(0, 0, sunRadius, 0, Math.PI * 2); ctx.fill();
    } else if (type === 'myasnoy') {
        if (heatState && heatState.isMyasnoyBody) {
            // Body bot — eye has detached, just a fleshy flesh dome on the body
            const _mytTG = ctx.createRadialGradient(-tSize*0.14, -tSize*0.14, 0, 0, 0, tSize*0.58);
            _mytTG.addColorStop(0, '#d84040');
            _mytTG.addColorStop(0.55, '#9a1a1a');
            _mytTG.addColorStop(1, '#6a0808');
            ctx.fillStyle = _mytTG;
            ctx.beginPath(); ctx.arc(0, 0, tSize * 0.52, 0, Math.PI * 2); ctx.fill();
            ctx.strokeStyle = '#5a0000'; ctx.lineWidth = 1.5;
            ctx.beginPath(); ctx.arc(0, 0, tSize * 0.52, 0, Math.PI * 2); ctx.stroke();
        } else {
            // Player — the turret IS a giant eye
            // Sclera
            const _myEG = ctx.createRadialGradient(-tSize*0.1, -tSize*0.12, 0, 0, 0, tSize*0.52);
            _myEG.addColorStop(0, '#fff4e0');
            _myEG.addColorStop(0.7, '#f0dbc0');
            _myEG.addColorStop(1, '#d0a888');
            ctx.beginPath(); ctx.arc(0, 0, tSize*0.52, 0, Math.PI*2); ctx.fillStyle = _myEG; ctx.fill();
            ctx.strokeStyle = 'rgba(100,10,10,0.65)'; ctx.lineWidth = 1.5;
            ctx.beginPath(); ctx.arc(0, 0, tSize*0.52, 0, Math.PI*2); ctx.stroke();
            // Iris
            ctx.beginPath(); ctx.arc(0, 0, tSize*0.32, 0, Math.PI*2); ctx.fillStyle = '#8c2800'; ctx.fill();
            // Pupil
            ctx.beginPath(); ctx.arc(0, 0, tSize*0.16, 0, Math.PI*2); ctx.fillStyle = '#080808'; ctx.fill();
            // Highlights
            ctx.beginPath(); ctx.arc(-tSize*0.1, -tSize*0.12, tSize*0.08, 0, Math.PI*2); ctx.fillStyle = 'rgba(255,255,255,0.9)'; ctx.fill();
            ctx.beginPath(); ctx.arc(tSize*0.05, tSize*0.06, tSize*0.04, 0, Math.PI*2); ctx.fillStyle = 'rgba(255,255,255,0.28)'; ctx.fill();
        }
    } else if (type === 'kvant') {
        // Квант turret: hex dome with pulsing eye
        const _aiTT = Date.now() * 0.001;
        const _aiPT = 0.6 + 0.4 * Math.sin(_aiTT * 2.8);
        const _hexR = tSize * 0.52;
        // Hex base
        const hexGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, _hexR);
        hexGrad.addColorStop(0, '#0a2233');
        hexGrad.addColorStop(1, '#071520');
        ctx.fillStyle = hexGrad;
        ctx.beginPath();
        for (let _hi = 0; _hi < 6; _hi++) {
            const _ha = (_hi / 6) * Math.PI * 2 - Math.PI / 6;
            _hi === 0 ? ctx.moveTo(Math.cos(_ha)*_hexR, Math.sin(_ha)*_hexR) : ctx.lineTo(Math.cos(_ha)*_hexR, Math.sin(_ha)*_hexR);
        }
        ctx.closePath(); ctx.fill();
        // Glowing hex border
        ctx.shadowColor = '#00e5ff'; ctx.shadowBlur = 8 * _aiPT;
        ctx.strokeStyle = `rgba(0,229,255,${_aiPT * 0.9})`; ctx.lineWidth = 1.5;
        ctx.stroke(); ctx.shadowBlur = 0;
        // Spinning scan arm
        ctx.save(); ctx.rotate(_aiTT * 1.8);
        ctx.beginPath(); ctx.moveTo(0,0); ctx.arc(0, 0, _hexR*0.65, -0.2, 0.2); ctx.closePath();
        ctx.fillStyle = `rgba(0,229,255,${_aiPT * 0.2})`; ctx.fill();
        ctx.strokeStyle = `rgba(0,229,255,${_aiPT * 0.7})`; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(_hexR*0.65, 0); ctx.stroke();
        ctx.restore();
        // Pulsing center eye
        const eyeGrad = ctx.createRadialGradient(0,0,0,0,0,tSize*0.18);
        eyeGrad.addColorStop(0, `rgba(255,255,255,${_aiPT})`); eyeGrad.addColorStop(0.5, `rgba(0,229,255,${_aiPT*0.9})`); eyeGrad.addColorStop(1, 'rgba(0,100,160,0)');
        ctx.fillStyle = eyeGrad; ctx.beginPath(); ctx.arc(0,0,tSize*0.18,0,Math.PI*2); ctx.fill();
    } else if (type === 'air') {
        // Air turret — rounded teal dome with spinning wind ring
        const airT = ctx.createRadialGradient(-tSize*0.15, -tSize*0.15, 0, 0, 0, tSize*0.6);
        airT.addColorStop(0,   '#7fffee');
        airT.addColorStop(0.5, '#00c9a7');
        airT.addColorStop(1,   '#005f57');
        ctx.fillStyle = airT;
        ctx.beginPath();
        ctx.arc(0, 0, tSize * 0.52, 0, Math.PI * 2);
        ctx.fill();
        // Animated wind ring
        const ringT = Date.now() * 0.003;
        ctx.save();
        ctx.rotate(ringT);
        ctx.strokeStyle = 'rgba(200,255,245,0.65)';
        ctx.lineWidth = 2;
        ctx.setLineDash([tSize * 0.35, tSize * 0.3]);
        ctx.beginPath();
        ctx.arc(0, 0, tSize * 0.38, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.restore();
        // Bright center dot
        ctx.fillStyle = '#e0fff8';
        ctx.beginPath();
        ctx.arc(0, 0, tSize * 0.12, 0, Math.PI * 2);
        ctx.fill();
        // Border
        ctx.strokeStyle = '#005f57';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(0, 0, tSize * 0.52, 0, Math.PI * 2);
        ctx.stroke();
    } else if (type === 'mechDiy') {
        // Entire mech rendering delegated to mechs.js drawMechOn.
        ctx.restore();
        if (typeof drawMechOn === 'function') {
            drawMechOn(ctx, cx, cy, W, H, turretAngle, 'mechDiy', moveAnimation);
        }
        return; // skip normal barrel drawing
    } else if (type === 'mechShield') {
        // Entire shield-mech rendering delegated to mechs.js drawMechShieldOn.
        ctx.restore();
        if (typeof drawMechShieldOn === 'function') {
            drawMechShieldOn(ctx, cx, cy, W, H, turretAngle, 'mechShield', moveAnimation);
        }
        return;
    } else if (type === 'mechRocket') {
        // Rocket-mech rendering delegated to mechs.js drawMechRocketOn.
        ctx.restore();
        if (typeof drawMechRocketOn === 'function') {
            drawMechRocketOn(ctx, cx, cy, W, H, turretAngle, 'mechRocket', moveAnimation);
        } else if (typeof drawMechShieldOn === 'function') {
            drawMechShieldOn(ctx, cx, cy, W, H, turretAngle, 'mechRocket', moveAnimation);
        }
        return;
    } else {
        ctx.fillStyle = '#5c7041';
        ctx.fillRect(-tSize/2, -tSize/2, tSize, tSize);
    }
    if (type === 'plasma') {
        // Unique plasma turret: advanced energy containment system
        
        // Base metallic structure
        const baseGrad = ctx.createLinearGradient(-tSize/2, -tSize/2, tSize/2, tSize/2);
        baseGrad.addColorStop(0, '#F5F5F5');
        baseGrad.addColorStop(0.5, '#D3D3D3');
        baseGrad.addColorStop(1, '#A9A9A9');
        ctx.fillStyle = baseGrad;
        ctx.fillRect(-tSize/2, -tSize/2, tSize, tSize);
        
        // Energy containment rings
        ctx.strokeStyle = '#8e44ad';
        ctx.lineWidth = 4;
        ctx.shadowColor = '#8e44ad';
        ctx.shadowBlur = 10;
        for (let r = 1; r <= 3; r++) {
            const ringRadius = (tSize * 0.15) * r;
            ctx.beginPath();
            ctx.arc(0, 0, ringRadius, 0, Math.PI * 2);
            ctx.stroke();
        }
        ctx.shadowBlur = 0;
        
        // Central plasma crystal
        const crystalGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, tSize * 0.2);
        crystalGrad.addColorStop(0, '#ffffff');
        crystalGrad.addColorStop(0.3, '#8e44ad');
        crystalGrad.addColorStop(0.7, '#5b2c6f');
        crystalGrad.addColorStop(1, 'rgba(142, 68, 173, 0.5)');
        ctx.fillStyle = crystalGrad;
        ctx.beginPath();
        ctx.arc(0, 0, tSize * 0.2, 0, Math.PI * 2);
        ctx.fill();
        
        // Crystal facets (geometric cuts)
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        for (let i = 0; i < 6; i++) {
            const angle = (i / 6) * Math.PI * 2;
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(Math.cos(angle) * tSize * 0.25, Math.sin(angle) * tSize * 0.25);
            ctx.stroke();
        }
        
        // Energy conduits (connecting rings to crystal)
        ctx.strokeStyle = '#e91e63';
        ctx.lineWidth = 2;
        ctx.shadowColor = '#e91e63';
        ctx.shadowBlur = 5;
        for (let i = 0; i < 4; i++) {
            const angle = (i / 4) * Math.PI * 2;
            const startRadius = tSize * 0.15;
            const endRadius = tSize * 0.18;
            ctx.beginPath();
            ctx.moveTo(Math.cos(angle) * startRadius, Math.sin(angle) * startRadius);
            ctx.lineTo(Math.cos(angle) * endRadius, Math.sin(angle) * endRadius);
            ctx.stroke();
        }
        ctx.shadowBlur = 0;
        
        // Pulsing energy field
        const pulse = Math.sin(Date.now() * 0.01) * 0.5 + 0.5;
        const fieldGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, tSize * 0.4);
        fieldGrad.addColorStop(0, `rgba(142, 68, 173, ${0.1 + pulse * 0.2})`);
        fieldGrad.addColorStop(0.5, `rgba(142, 68, 173, ${0.05 + pulse * 0.1})`);
        fieldGrad.addColorStop(1, 'rgba(142, 68, 173, 0)');
        ctx.fillStyle = fieldGrad;
        ctx.beginPath();
        ctx.arc(0, 0, tSize * 0.4, 0, Math.PI * 2);
        ctx.fill();
        
        // Warning indicators (small red lights)
        ctx.fillStyle = '#e74c3c';
        const lightPositions = [
            [-tSize/2 + 5, -tSize/2 + 5],
            [tSize/2 - 5, -tSize/2 + 5],
            [-tSize/2 + 5, tSize/2 - 5],
            [tSize/2 - 5, tSize/2 - 5]
        ];
        lightPositions.forEach(([x, y]) => {
            ctx.beginPath();
            ctx.arc(x, y, 3, 0, Math.PI * 2);
            ctx.fill();
        });
    } else if (type === 'boss_dummy') {
        // Armored rotating dome with a readable practice target.
        const practiceTurret = ctx.createRadialGradient(-tSize*0.2, -tSize*0.2, 0, 0, 0, tSize*0.58);
        practiceTurret.addColorStop(0, '#c4c9b9'); practiceTurret.addColorStop(0.65, '#75817c'); practiceTurret.addColorStop(1, '#344344');
        ctx.fillStyle = practiceTurret; ctx.strokeStyle = '#253333'; ctx.lineWidth = 1.2;
        ctx.beginPath(); ctx.ellipse(0, 0, tSize*0.53, tSize*0.47, 0, 0, Math.PI*2); ctx.fill(); ctx.stroke();
        ctx.fillStyle = '#354343';
        ctx.beginPath(); ctx.arc(-tSize*0.1, 0, tSize*0.3, 0, Math.PI*2); ctx.fill();
        ctx.strokeStyle = '#e7bd76'; ctx.lineWidth = Math.max(1, tSize*0.07);
        ctx.beginPath(); ctx.arc(-tSize*0.1, 0, tSize*0.2, 0, Math.PI*2); ctx.stroke();
        ctx.fillStyle = '#c36d4a';
        ctx.beginPath(); ctx.arc(-tSize*0.1, 0, tSize*0.085, 0, Math.PI*2); ctx.fill();
    }

    if (type === 'ice') {
        // ice crystals on turret
        ctx.fillStyle = 'rgba(255,255,255,0.9)';
        // crystal on turret top-left
        ctx.beginPath();
        ctx.moveTo(-tSize/2 + 2, -tSize/2 + 2);
        ctx.lineTo(-tSize/2 + 5, -tSize/2 - 3);
        ctx.lineTo(-tSize/2 + 8, -tSize/2 + 2);
        ctx.closePath();
        ctx.fill();
        // crystal on turret bottom-right
        ctx.beginPath();
        ctx.moveTo(tSize/2 - 8, tSize/2 - 2);
        ctx.lineTo(tSize/2 - 5, tSize/2 + 3);
        ctx.lineTo(tSize/2 - 2, tSize/2 - 2);
        ctx.closePath();
        ctx.fill();
    } else if (type === 'buratino') {
        // Heavy Missile System (TOS-1 Buratino style)
        
        // Main Launcher Box
        const grad = ctx.createLinearGradient(-tSize/2, -tSize/2, tSize/2, tSize/2);
        grad.addColorStop(0, '#354a21'); grad.addColorStop(0.5, '#4b6b30'); grad.addColorStop(1, '#2e4033');
        ctx.fillStyle = grad;
        ctx.fillRect(-tSize/2, -tSize/2, tSize, tSize);
        
        // Metallic Frame
        ctx.strokeStyle = '#1a2612';
        ctx.lineWidth = 2;
        ctx.strokeRect(-tSize/2 + 2, -tSize/2 + 2, tSize - 4, tSize - 4);
        
        // 3D Side Panels
        ctx.fillStyle = '#26331a';
        ctx.fillRect(-tSize/2, -tSize/2, 4, tSize);
        ctx.fillRect(tSize/2 - 4, -tSize/2, 4, tSize);

        // Rocket Tubes Array
        const rows = 4;
        const cols = 5;
        // Use relative margins to support small icon sizes without negative dimensions
        const marginX = tSize * 0.2;
        const marginY = tSize * 0.15;
        const availableW = Math.max(1, tSize - marginX * 2);
        const availableH = Math.max(1, tSize - marginY * 2);
        
        const tubeSize = Math.max(0.1, Math.min(availableW / cols, availableH / rows) * 0.85);
        const gapX = cols > 1 ? (availableW - tubeSize * cols) / (cols - 1) : 0;
        const gapY = rows > 1 ? (availableH - tubeSize * rows) / (rows - 1) : 0;
        
        for(let r=0; r<rows; r++) {
            for(let c=0; c<cols; c++) {
                const tx = -tSize/2 + marginX + c * (tubeSize + gapX) + tubeSize/2;
                const ty = -tSize/2 + marginY + r * (tubeSize + gapY) + tubeSize/2;
                
                const rOuter = Math.max(0, tubeSize/2);
                
                // Tube casing
                ctx.fillStyle = '#222';
                ctx.beginPath(); ctx.arc(tx, ty, rOuter, 0, Math.PI*2); ctx.fill();
                
                // Tube interior (black hole)
                // Use relative subtraction to stay safe at small scales
                const rInner = Math.max(0, rOuter * 0.75);
                ctx.fillStyle = '#000';
                ctx.beginPath(); ctx.arc(tx, ty, rInner, 0, Math.PI*2); ctx.fill();
                
                // Missile Warhead (Red/Orange dangerous look)
                const rWarhead = Math.max(0, rInner * 0.6);
                if (rWarhead > 0) {
                    ctx.fillStyle = '#c0392b';
                    ctx.beginPath(); ctx.arc(tx, ty, rWarhead, 0, Math.PI*2); ctx.fill();
                }
                
                // Highlight
                if (rOuter > 1.5) {
                    ctx.fillStyle = 'rgba(255,255,255,0.3)';
                    ctx.beginPath(); ctx.arc(tx - rOuter*0.3, ty - rOuter*0.3, Math.max(0, rOuter*0.25), 0, Math.PI*2); ctx.fill();
                }
            }
        }
    }
    // barrel
    if (type !== 'buratino' && type !== 'burovoy' && type !== 'illuminat') {
        const barrelLen = Math.max(20, W * 0.45) * turretScale * (type === 'normal' && turretScale === 1 ? 1.65 : 1);
        const barrelH = Math.max(4, H * 0.08) * turretScale * (type === 'normal' && turretScale === 1 ? 1.75 : 1);

        if (type === 'fire') {
            // Short insulated feed pipe and a wide, vented burner head.
            const start = tSize*0.38, end = start + barrelLen*0.82;
            const pipe = ctx.createLinearGradient(0, -barrelH, 0, barrelH);
            pipe.addColorStop(0, '#f5be70'); pipe.addColorStop(0.5, '#b45a2d'); pipe.addColorStop(1, '#562c25');
            ctx.fillStyle = pipe; ctx.strokeStyle = '#252c2b'; ctx.lineWidth = 1;
            ctx.beginPath(); ctx.roundRect(start, -barrelH*0.64, barrelLen*0.65, barrelH*1.28, barrelH*0.18); ctx.fill(); ctx.stroke();
            ctx.fillStyle = '#ffcf82';
            ctx.fillRect(start+barrelLen*0.15, -barrelH*0.8, barrelLen*0.09, barrelH*1.6);
            ctx.fillRect(start+barrelLen*0.49, -barrelH*0.8, barrelLen*0.09, barrelH*1.6);
            ctx.fillStyle = '#a74a2b';
            ctx.beginPath(); ctx.moveTo(start+barrelLen*0.62, -barrelH*0.77);
            ctx.lineTo(end, -barrelH*1.12); ctx.lineTo(end, barrelH*1.12);
            ctx.lineTo(start+barrelLen*0.62, barrelH*0.77); ctx.closePath(); ctx.fill();
            ctx.fillStyle = '#f9b65b';
            ctx.fillRect(end-barrelLen*0.09, -barrelH*1.14, barrelLen*0.09, barrelH*2.28);
            ctx.fillStyle = '#1b201f';
            ctx.fillRect(end-barrelLen*0.025, -barrelH*0.74, barrelLen*0.03, barrelH*1.48);
            ctx.fillStyle = '#ffe0a0';
            for (const side of [-1, 1]) {
                ctx.fillRect(start+barrelLen*0.71, side*barrelH*0.67, barrelLen*0.12, Math.max(0.7, barrelH*0.15));
            }
        } else if (type === 'ice') {
            // Ice Spire
            // Darker core for visibility
            ctx.fillStyle = '#1f618d';
            ctx.beginPath();
            ctx.moveTo(tSize/2, -barrelH);
            ctx.lineTo(tSize/2 + barrelLen, 0);
            ctx.lineTo(tSize/2, barrelH);
            ctx.fill();
            // Lighter overlay
            const val = ctx.createLinearGradient(tSize/2, 0, tSize/2 + barrelLen, 0);
            val.addColorStop(0, 'rgba(176, 224, 230, 0.5)'); val.addColorStop(1, '#FFFFFF');
            ctx.fillStyle = val;
            ctx.beginPath();
            ctx.moveTo(tSize/2, -barrelH/2); // slightly smaller overlay
            ctx.lineTo(tSize/2 + barrelLen, 0);
            ctx.lineTo(tSize/2, barrelH/2);
            ctx.fill();
        } else if (type === 'toxic') {
            // Twin chemical delivery tubes held by a sealed steel manifold.
            const start = tSize*0.38, end = start+barrelLen*0.74;
            ctx.fillStyle = '#246446';
            ctx.beginPath(); ctx.roundRect(start, -barrelH*1.52, barrelLen*0.62, barrelH*3.04, barrelH*0.3); ctx.fill();
            for (const side of [-1, 1]) {
                const y = side*barrelH*0.7;
                const tube = ctx.createLinearGradient(0, y-barrelH*0.34, 0, y+barrelH*0.34);
                tube.addColorStop(0, '#e5f4a5'); tube.addColorStop(0.5, '#98c653'); tube.addColorStop(1, '#387945');
                ctx.fillStyle = tube; ctx.strokeStyle = '#263b32'; ctx.lineWidth = 0.8;
                ctx.beginPath(); ctx.roundRect(start, y-barrelH*0.34, barrelLen*0.74, barrelH*0.68, barrelH*0.16); ctx.fill(); ctx.stroke();
                ctx.fillStyle = '#e4da81';
                ctx.fillRect(start+barrelLen*0.15, y-barrelH*0.42, barrelLen*0.065, barrelH*0.84);
                ctx.fillStyle = '#1b2c26';
                ctx.fillRect(end-barrelLen*0.05, y-barrelH*0.42, barrelLen*0.05, barrelH*0.84);
            }
            ctx.fillStyle = '#d5e99b';
            ctx.fillRect(start+barrelLen*0.42, -barrelH*1.44, barrelLen*0.09, barrelH*2.88);
        } else if (type === 'buckshot') {
            // The paired shotgun barrels are part of the turret drawing.
        } else if (type === 'plasma') {
            // Railgun rails
            ctx.fillStyle = '#7f8c8d';
            ctx.fillRect(tSize/2, -barrelH - 4, barrelLen, 3);
            ctx.fillRect(tSize/2, barrelH + 1, barrelLen, 3);
            // Energy between rails
            ctx.fillStyle = 'rgba(142, 68, 173, 0.4)';
            ctx.fillRect(tSize/2, -barrelH, barrelLen, barrelH * 2);
        } else if (type === 'musical') {
            // Sound Horn
            ctx.fillStyle = '#34495e';
            ctx.beginPath();
            ctx.moveTo(tSize/2, -barrelH/2);
            ctx.lineTo(tSize/2 + barrelLen, -barrelH);
            ctx.lineTo(tSize/2 + barrelLen, barrelH);
            ctx.lineTo(tSize/2, barrelH/2);
            ctx.fill();
            // Sound waves emanating
            ctx.strokeStyle = '#f1c40f';
            ctx.lineWidth = 1;
            for (let i = 1; i <= 3; i++) {
                const offset = i * 8;
                ctx.beginPath();
                ctx.arc(tSize/2 + offset, 0, 4, 0, Math.PI * 2);
                ctx.stroke();
            }
        } else if (type === 'mirror') {
             // Mirror Turret (Smooth Chrome)
             const barrelLen = Math.min(W, H) * 0.7 * turretScale;
             const barrelH = Math.min(W, H) * 0.16 * turretScale;
             
             // Rails
             const grad = ctx.createLinearGradient(0, -barrelH, 0, barrelH);
             grad.addColorStop(0, '#bdc3c7'); grad.addColorStop(0.5, '#ecf0f1'); grad.addColorStop(1, '#95a5a6');
             ctx.fillStyle = grad;
             ctx.fillRect(tSize/2, -barrelH/2, barrelLen, barrelH);
             
             // Reflective ring at end
             ctx.fillStyle = '#fff';
             ctx.fillRect(tSize/2 + barrelLen - 4, -barrelH/2 - 2, 4, barrelH + 4);
        } else if (type === 'machinegun') {
            // Three exposed barrels sit inside a short ventilated shroud.
            const cannonLength = Math.min(W, H) * 0.67 * turretScale;
            const cannonHalfHeight = Math.min(W, H) * 0.12 * turretScale;
            const cannonX = tSize * 0.3;
            const heat = Math.max(0, Math.min(1, (heatState?.heat || 0) / MACHINEGUN_MAX_HEAT));
            const hotColor = heatState?.overheated ? '#d47855' : `rgb(${Math.round(145 + heat*55)},${Math.round(163 - heat*55)},${Math.round(166 - heat*80)})`;

            ctx.fillStyle = '#17252b';
            ctx.fillRect(cannonX, -cannonHalfHeight*1.22, cannonLength, cannonHalfHeight*2.44);
            ctx.fillStyle = '#718085';
            ctx.fillRect(cannonX, -cannonHalfHeight*1.22, cannonLength*0.79, Math.max(1, cannonHalfHeight*0.18));
            ctx.fillStyle = '#34454b';
            ctx.fillRect(cannonX, cannonHalfHeight*1.04, cannonLength*0.79, Math.max(1, cannonHalfHeight*0.18));

            for (const offset of [-0.7, 0, 0.7]) {
                const barrelY = offset * cannonHalfHeight;
                ctx.fillStyle = hotColor;
                ctx.fillRect(cannonX + cannonLength*0.08, barrelY - cannonHalfHeight*0.13, cannonLength*0.95, Math.max(1, cannonHalfHeight*0.26));
                ctx.fillStyle = '#111c21';
                ctx.fillRect(cannonX + cannonLength*1.02, barrelY - cannonHalfHeight*0.17, cannonLength*0.11, Math.max(1.2, cannonHalfHeight*0.34));
            }

            ctx.fillStyle = '#59696d';
            for (const ring of [0.28, 0.55, 0.8]) {
                ctx.fillRect(cannonX + cannonLength*ring, -cannonHalfHeight*1.22, Math.max(1, cannonLength*0.045), cannonHalfHeight*2.44);
            }
            ctx.fillStyle = '#a4ada9';
            ctx.fillRect(cannonX + cannonLength*0.8, -cannonHalfHeight*1.25, Math.max(1, cannonLength*0.045), cannonHalfHeight*0.24);

        } else if (type === 'waterjet') {
            // High-pressure water hose with contrasted nozzle and highlights
            // Body of hose (darker, thin)
            ctx.fillStyle = '#12394a';
            ctx.fillRect(tSize/2, -barrelH * 0.55, barrelLen * 0.72, barrelH * 1.08);
            // Pressure collar (slightly metallic)
            ctx.fillStyle = '#0f3a50';
            ctx.fillRect(tSize/2 + barrelLen * 0.66, -barrelH * 0.82, barrelLen * 0.12, barrelH * 1.64);
            // Bright metallic nozzle to stand out from hull
            const nozzleX = tSize/2 + barrelLen * 0.78;
            ctx.fillStyle = '#e8f7ff';
            ctx.fillRect(nozzleX, -barrelH * 0.7, barrelLen * 0.22, barrelH * 1.38);
            // Nozzle outline
            ctx.strokeStyle = 'rgba(255,255,255,0.6)';
            ctx.lineWidth = 1.2;
            ctx.strokeRect(nozzleX, -barrelH * 0.7, barrelLen * 0.22, barrelH * 1.38);
            // Inner spray opening (dark core for contrast)
            ctx.fillStyle = '#c6eaff';
            ctx.fillRect(tSize/2 + barrelLen - 3, -barrelH * 0.42, 4, barrelH * 0.86);
            // Small highlight streak along nozzle
            ctx.strokeStyle = 'rgba(255,255,255,0.9)';
            ctx.lineWidth = 0.8;
            ctx.beginPath(); ctx.moveTo(nozzleX + 2, -barrelH * 0.45); ctx.lineTo(nozzleX + 2, barrelH * 0.45); ctx.stroke();
        } else if (type === 'electric') {
            // ELECTRIC ROBOT Barrel - Electric discharge cannon
            const barLen = Math.min(W, H) * 0.7 * turretScale;
            const barH = Math.min(W, H) * 0.25 * turretScale;

            // Main barrel body - electric blue gradient
            const barGrad = ctx.createLinearGradient(tSize/2, -barH/2, tSize/2 + barLen, barH/2);
            barGrad.addColorStop(0, '#1a1a2e');
            barGrad.addColorStop(0.3, '#00d4ff');
            barGrad.addColorStop(0.5, '#0080c0');
            barGrad.addColorStop(0.7, '#00d4ff');
            barGrad.addColorStop(1, '#0a0a1a');
            ctx.fillStyle = barGrad;
            ctx.fillRect(tSize/2, -barH/2, barLen, barH);

            // Electric coil rings
            ctx.strokeStyle = 'rgba(0, 212, 255, 0.7)';
            ctx.lineWidth = 1.5;
            for (let i = 0; i < 4; i++) {
                const cx = tSize/2 + barLen * (0.2 + i * 0.2);
                ctx.beginPath();
                ctx.arc(cx, 0, barH * 0.45, 0, Math.PI * 2);
                ctx.stroke();
            }

            // Top edge glow
            ctx.fillStyle = 'rgba(0, 212, 255, 0.5)';
            ctx.fillRect(tSize/2, -barH/2, barLen, barH * 0.3);

            // Muzzle opening - electric discharge point
            const muzzleX = tSize/2 + barLen;
            const muzzleGrad = ctx.createRadialGradient(muzzleX, 0, barH*0.15, muzzleX, 0, barH*0.7);
            muzzleGrad.addColorStop(0, '#00ffff');
            muzzleGrad.addColorStop(0.4, '#0080c0');
            muzzleGrad.addColorStop(1, 'rgba(0, 128, 192, 0.2)');
            ctx.fillStyle = muzzleGrad;
            ctx.beginPath();
            ctx.arc(muzzleX, 0, barH*0.7, 0, Math.PI*2);
            ctx.fill();

            // Dark core of muzzle
            ctx.fillStyle = '#000';
            ctx.beginPath();
            ctx.arc(muzzleX, 0, barH*0.3, 0, Math.PI*2);
            ctx.fill();

            // Electric discharge spark lines from muzzle
            ctx.strokeStyle = 'rgba(0, 255, 255, 0.6)';
            ctx.lineWidth = 1;
            for (let i = 0; i < 3; i++) {
                const angle = (i / 3) * Math.PI * 2;
                const sparkLen = barH * 0.5;
                ctx.beginPath();
                ctx.moveTo(muzzleX + Math.cos(angle) * barH*0.35, Math.sin(angle) * barH*0.35);
                ctx.lineTo(muzzleX + Math.cos(angle) * (barH*0.35 + sparkLen), Math.sin(angle) * (barH*0.35 + sparkLen));
                ctx.stroke();
            }

        } else if (type === 'boss_dummy') {
            // Steel practice cannon with a fixed amber muzzle sleeve.
            const length = Math.min(W, H)*0.64*turretScale;
            const half = Math.min(W, H)*0.085*turretScale;
            const start = tSize*0.35, end = start+length;
            const cannon = ctx.createLinearGradient(0, -half, 0, half);
            cannon.addColorStop(0, '#bac4b9'); cannon.addColorStop(0.5, '#6a7773'); cannon.addColorStop(1, '#354343');
            ctx.fillStyle = cannon; ctx.strokeStyle = '#263332'; ctx.lineWidth = 1;
            ctx.beginPath(); ctx.roundRect(start, -half, length, half*2, half*0.22); ctx.fill(); ctx.stroke();
            ctx.fillStyle = '#d1a465';
            ctx.fillRect(start+length*0.14, -half*1.2, length*0.12, half*2.4);
            ctx.fillStyle = '#354141';
            ctx.fillRect(end-length*0.17, -half*1.18, length*0.17, half*2.36);
            ctx.fillStyle = '#dcbd80';
            ctx.fillRect(end-length*0.04, -half*1.18, length*0.04, half*2.36);
        } else if (type === 'robot') {
            // Long slender railgun barrel
            const rbLen = Math.min(W, H) * 0.82 * turretScale;
            const rbH   = Math.min(W, H) * 0.14 * turretScale;
            const rbGrad = ctx.createLinearGradient(tSize/2, 0, tSize/2 + rbLen, 0);
            rbGrad.addColorStop(0, '#455a64');
            rbGrad.addColorStop(0.4, '#b0bec5');
            rbGrad.addColorStop(1, '#37474f');
            ctx.fillStyle = rbGrad;
            ctx.fillRect(tSize/2, -rbH/2, rbLen, rbH);
            // Magnetic accelerator coil rings
            ctx.fillStyle = '#00e5ff';
            ctx.shadowColor = '#00e5ff';
            ctx.shadowBlur = 4;
            for (let ri = 0; ri < 4; ri++) {
                const rx = tSize/2 + rbLen * (0.18 + ri * 0.2);
                ctx.fillRect(rx, -rbH/2 - 2, 3, rbH + 4);
            }
            // Muzzle cap
            ctx.fillStyle = '#00e5ff';
            ctx.shadowBlur = 8;
            ctx.fillRect(tSize/2 + rbLen - 2, -rbH/2 - 3, 5, rbH + 6);
            ctx.shadowBlur = 0;
        } else if (type === 'medical') {
            // Medical cannon — white barrel with red bands
            const mbLen = Math.min(W, H) * 0.82 * turretScale;
            const mbH = Math.min(W, H) * 0.13 * turretScale;
            const mbGrad = ctx.createLinearGradient(tSize/2, 0, tSize/2 + mbLen, 0);
            mbGrad.addColorStop(0, '#e8e8e8');
            mbGrad.addColorStop(0.5, '#d0d0d0');
            mbGrad.addColorStop(1, '#b8b8b8');
            ctx.fillStyle = mbGrad;
            ctx.fillRect(tSize/2, -mbH/2, mbLen, mbH);
            // Red band markings
            ctx.fillStyle = '#cc3333';
            for (let bi = 0; bi < 3; bi++) {
                const bx = tSize/2 + mbLen * (0.25 + bi * 0.35);
                ctx.fillRect(bx - 1.5, -mbH/2, 3, mbH);
            }
            // Simple outline
            ctx.strokeStyle = '#666';
            ctx.lineWidth = 1;
            ctx.strokeRect(tSize/2, -mbH/2, mbLen, mbH);
        } else if (type === 'roman') {
            // Roman barrel - elegant pilum arm: dark shaft with gleaming gold spear tip
            const romBarrelLen = Math.min(W, H) * 0.52 * turretScale;
            const romBarrelH  = Math.min(W, H) * 0.085 * turretScale;
            const shaftLen = romBarrelLen * 0.74;
            // Dark wooden shaft with highlight
            const shaftGrad = ctx.createLinearGradient(tSize / 2, -romBarrelH / 2, tSize / 2, romBarrelH / 2);
            shaftGrad.addColorStop(0, '#6b3a1f');
            shaftGrad.addColorStop(0.4, '#9b5a2f');
            shaftGrad.addColorStop(1, '#4a2010');
            ctx.fillStyle = shaftGrad;
            ctx.fillRect(tSize / 2, -romBarrelH / 2, shaftLen, romBarrelH);
            // Gold collar ring at shaft-tip junction
            ctx.fillStyle = '#FFD700';
            ctx.fillRect(tSize / 2 + shaftLen - 3, -romBarrelH / 2 - 1, 5, romBarrelH + 2);
            // Iron tip - elongated golden lance head
            const tipLen = romBarrelLen * 0.26;
            const tipX = tSize / 2 + shaftLen;
            const tipGrad = ctx.createLinearGradient(tipX, 0, tipX + tipLen, 0);
            tipGrad.addColorStop(0, '#D4A017');
            tipGrad.addColorStop(0.4, '#FFD700');
            tipGrad.addColorStop(1, '#FFF8DC');
            ctx.fillStyle = tipGrad;
            ctx.beginPath();
            ctx.moveTo(tipX, -romBarrelH * 0.9);
            ctx.lineTo(tipX + tipLen, 0);
            ctx.lineTo(tipX, romBarrelH * 0.9);
            ctx.closePath();
            ctx.fill();
            ctx.strokeStyle = '#8B6914';
            ctx.lineWidth = 0.8;
            ctx.stroke();
        } else if (type === 'egyptian') {
            const egBarrelLen = Math.min(W, H) * 0.7 * turretScale;
            const egBarrelH = Math.min(W, H) * 0.07 * turretScale;
            const shaftLen = egBarrelLen * 0.68;
            const shaftGrad = ctx.createLinearGradient(tSize / 2, -egBarrelH / 2, tSize / 2 + shaftLen, egBarrelH / 2);
            shaftGrad.addColorStop(0, '#7a5220');
            shaftGrad.addColorStop(0.55, '#9f6c2a');
            shaftGrad.addColorStop(1, '#5b3b12');
            ctx.fillStyle = shaftGrad;
            ctx.fillRect(tSize / 2, -egBarrelH / 2, shaftLen, egBarrelH);

            ctx.fillStyle = '#d9b25b';
            ctx.fillRect(tSize / 2 + shaftLen * 0.2, -egBarrelH / 2, 3, egBarrelH);
            ctx.fillRect(tSize / 2 + shaftLen * 0.5, -egBarrelH / 2, 3, egBarrelH);

            const tipLen = egBarrelLen * 0.32;
            const tipX = tSize / 2 + shaftLen;
            const tipGrad = ctx.createLinearGradient(tipX, 0, tipX + tipLen, 0);
            tipGrad.addColorStop(0, '#fff1bf');
            tipGrad.addColorStop(0.45, '#d9b25b');
            tipGrad.addColorStop(1, '#8f6720');
            ctx.fillStyle = tipGrad;
            ctx.beginPath();
            ctx.moveTo(tipX, -egBarrelH * 1.2);
            ctx.lineTo(tipX + tipLen, 0);
            ctx.lineTo(tipX, egBarrelH * 1.2);
            ctx.closePath();
            ctx.fill();
            ctx.strokeStyle = '#6b4a18';
            ctx.lineWidth = 0.9;
            ctx.stroke();
        } else if (type === 'mine') {
            // Armored deployment chute with a recessed slot.
            const size = Math.min(W, H) * turretScale;
            const start = tSize * 0.4, end = size * 0.52, half = size * 0.105;
            const chute = ctx.createLinearGradient(0, -half, 0, half);
            chute.addColorStop(0, '#87915a'); chute.addColorStop(0.5, '#59663c'); chute.addColorStop(1, '#303c29');
            ctx.fillStyle = chute; ctx.strokeStyle = '#202a1b'; ctx.lineWidth = Math.max(0.8, size * 0.025);
            ctx.beginPath(); ctx.moveTo(start, -half * 0.8); ctx.lineTo(end - size * 0.05, -half);
            ctx.lineTo(end, -half * 0.72); ctx.lineTo(end, half * 0.72);
            ctx.lineTo(end - size * 0.05, half); ctx.lineTo(start, half * 0.8); ctx.closePath(); ctx.fill(); ctx.stroke();
            ctx.strokeStyle = '#242f22'; ctx.lineWidth = Math.max(1, size * 0.035);
            ctx.beginPath(); ctx.moveTo(end - size * 0.045, -half * 0.55); ctx.lineTo(end - size * 0.045, half * 0.55); ctx.stroke();
            ctx.strokeStyle = 'rgba(216,219,168,0.6)'; ctx.lineWidth = Math.max(0.6, size * 0.014);
            ctx.beginPath(); ctx.moveTo(start + size * 0.04, -half * 0.53); ctx.lineTo(end - size * 0.09, -half * 0.53); ctx.stroke();
        } else if (type === 'pyro') {
            // Incendiary shell launcher: a thick chamber and compact muzzle brake.
            const length = Math.min(W, H)*0.58*turretScale;
            const half = Math.min(W, H)*0.075*turretScale;
            const start = tSize*0.37, end = start+length;
            const steel = ctx.createLinearGradient(0, -half, 0, half);
            steel.addColorStop(0, '#ad9583'); steel.addColorStop(0.5, '#5a5b58'); steel.addColorStop(1, '#30383a');
            ctx.fillStyle = steel; ctx.strokeStyle = '#302d2c'; ctx.lineWidth = 1;
            ctx.beginPath(); ctx.roundRect(start, -half, length, half*2, half*0.27); ctx.fill(); ctx.stroke();
            ctx.fillStyle = '#8b4a39';
            ctx.fillRect(start+length*0.06, -half*1.25, length*0.34, half*2.5);
            ctx.fillStyle = '#c79670';
            ctx.fillRect(start+length*0.34, -half*1.25, length*0.055, half*2.5);
            ctx.fillStyle = '#343737';
            ctx.fillRect(end-length*0.2, -half*1.19, length*0.2, half*2.38);
            ctx.fillStyle = '#1f2424';
            ctx.fillRect(end-length*0.13, -half*0.73, length*0.05, half*1.46);
            ctx.fillStyle = '#ab8a72';
            ctx.fillRect(end-length*0.035, -half*1.2, length*0.035, half*2.4);
        } else if (type === 'spartan') {
            // Spartan barrel — long bronze spear shaft with forged iron tip
            const spBarLen = Math.min(W, H) * 0.78 * turretScale;
            const spBarH   = Math.min(W, H) * 0.075 * turretScale;
            // Wooden shaft (dark tan)
            const shaftGrad = ctx.createLinearGradient(0, -spBarH/2, 0, spBarH/2);
            shaftGrad.addColorStop(0, spartanRage ? '#8c6441' : '#8b5a2b');
            shaftGrad.addColorStop(0.5, spartanRage ? '#d2a36b' : '#a0693a');
            shaftGrad.addColorStop(1, spartanRage ? '#443238' : '#6b3f18');
            ctx.fillStyle = shaftGrad;
            ctx.fillRect(tSize/2, -spBarH/2, spBarLen * 0.72, spBarH);
            // Bronze grip wrap
            ctx.strokeStyle = spartanRage ? '#b12f38' : 'rgba(184,115,51,0.7)';
            ctx.lineWidth = 1.3;
            for (let wi = 0; wi < 3; wi++) {
                const wx = tSize/2 + spBarLen * (0.1 + wi * 0.2);
                ctx.beginPath();
                ctx.moveTo(wx, -spBarH/2);
                ctx.lineTo(wx,  spBarH/2);
                ctx.stroke();
            }
            // Iron spear tip
            const tipX = tSize/2 + spBarLen * 0.72;
            const tipGrad = ctx.createLinearGradient(tipX, -spBarH, tipX + spBarLen*0.28, 0);
            tipGrad.addColorStop(0, spartanRage ? '#776f70' : '#9aa0a8');
            tipGrad.addColorStop(0.4, spartanRage ? '#f0dcbb' : '#d8dde2');
            tipGrad.addColorStop(1, spartanRage ? '#a87158' : '#5c6870');
            ctx.fillStyle = tipGrad;
            ctx.beginPath();
            ctx.moveTo(tipX,                    -spBarH * 1.2);
            ctx.lineTo(tSize/2 + spBarLen,       0);
            ctx.lineTo(tipX,                     spBarH * 1.2);
            ctx.closePath();
            ctx.fill();
            ctx.strokeStyle = '#3a4a54';
            ctx.lineWidth = 0.8;
            ctx.stroke();
        } else if (type === 'mechShield') {
            // mechShield: barrels drawn by drawMechShieldOn (already returned above)
        } else if (type === 'kvant') {
            // Квант barrel: twin energy launchers
            const bLen = Math.min(W,H) * 0.58 * turretScale;
            const bH   = Math.min(W,H) * 0.10 * turretScale;
            const gap  = Math.min(W,H) * 0.10 * turretScale;
            for (let _bi = 0; _bi < 2; _bi++) {
                const yOff = (_bi === 0 ? -1 : 1) * gap;
                const bGrad = ctx.createLinearGradient(tSize/2, 0, tSize/2 + bLen, 0);
                bGrad.addColorStop(0, '#071520'); bGrad.addColorStop(0.6, '#0a3355'); bGrad.addColorStop(0.85, '#0077aa'); bGrad.addColorStop(1, '#00e5ff');
                ctx.fillStyle = bGrad;
                ctx.fillRect(tSize/2, yOff - bH/2, bLen, bH);
                // Glow tip
                ctx.shadowColor = '#00e5ff'; ctx.shadowBlur = 7;
                ctx.strokeStyle = '#00e5ff'; ctx.lineWidth = 1;
                ctx.strokeRect(tSize/2 + bLen - 4, yOff - bH/2 - 1, 4, bH + 2);
                ctx.shadowBlur = 0;
            }
        } else if (type === 'mechDiy') {
            // Dual barrels — two parallel thin cannons side-by-side
            const dBarL = Math.min(W, H) * 0.65 * turretScale;
            const dBarH = Math.min(W, H) * 0.08 * turretScale;
            const gap = Math.min(W, H) * 0.11 * turretScale;
            for (let ci = 0; ci < 2; ci++) {
                const yOff = (ci === 0 ? -1 : 1) * gap;
                const barGrad = ctx.createLinearGradient(tSize/2, yOff - dBarH/2, tSize/2 + dBarL, yOff + dBarH/2);
                barGrad.addColorStop(0, '#27ae60');
                barGrad.addColorStop(0.5, '#1a8a3e');
                barGrad.addColorStop(1, '#145a32');
                ctx.fillStyle = barGrad;
                ctx.fillRect(tSize/2, yOff - dBarH/2, dBarL, dBarH);
                // Muzzle tip ring
                ctx.strokeStyle = '#00ff88';
                ctx.lineWidth = 1;
                ctx.strokeRect(tSize/2 + dBarL - 3, yOff - dBarH/2 - 1, 3, dBarH + 2);
            }
        } else if (type === 'myasnoy') {
            // Bio-beam cannon: organic neck flaring into a wide cone
            const _mybLen   = Math.min(W, H) * 0.65 * turretScale;
            const _mybNeckH = Math.min(W, H) * 0.10 * turretScale;
            const _mybConeH = Math.min(W, H) * 0.23 * turretScale;
            // Fleshy neck tube
            const _mybNG = ctx.createLinearGradient(tSize/2, 0, tSize/2 + _mybLen*0.55, 0);
            _mybNG.addColorStop(0, '#b02020'); _mybNG.addColorStop(1, '#c83030');
            ctx.fillStyle = _mybNG;
            ctx.fillRect(tSize/2, -_mybNeckH/2, _mybLen * 0.55, _mybNeckH);
            // Widening cone (the bio-beam mouth)
            ctx.fillStyle = '#cc1a10';
            ctx.beginPath();
            ctx.moveTo(tSize/2 + _mybLen*0.55, -_mybNeckH/2);
            ctx.lineTo(tSize/2 + _mybLen,       -_mybConeH/2);
            ctx.lineTo(tSize/2 + _mybLen,        _mybConeH/2);
            ctx.lineTo(tSize/2 + _mybLen*0.55,  _mybNeckH/2);
            ctx.closePath(); ctx.fill();
            ctx.strokeStyle = '#7a0000'; ctx.lineWidth = 1.2; ctx.stroke();
            // Dark opening at cone tip
            ctx.fillStyle = 'rgba(15,0,0,0.85)';
            ctx.beginPath();
            ctx.moveTo(tSize/2 + _mybLen, -_mybConeH * 0.44);
            ctx.lineTo(tSize/2 + _mybLen - 6, 0);
            ctx.lineTo(tSize/2 + _mybLen,  _mybConeH * 0.44);
            ctx.closePath(); ctx.fill();
        } else {
            // Standard Cannon
            const barrelLen = Math.min(W, H) * 0.6 * turretScale;
            const barrelH = Math.min(W, H) * 0.14 * turretScale;
            ctx.fillStyle = '#2F4F4F';
            ctx.fillRect(tSize/2 - 2 * turretScale, -barrelH/2, barrelLen, barrelH);
            // Muzzle brake
            ctx.fillStyle = '#111';
            ctx.fillRect(tSize/2 + barrelLen - 4, -barrelH, 4, barrelH*2);
        }
    }
    ctx.restore();
}

    function hellLavaNoise(seed) {
        const raw = Math.sin(seed * 12.9898 + 78.233) * 43758.5453123;
        return raw - Math.floor(raw);
    }

    function traceHellLavaPoolPath(ctx, obj, inset = 0) {
        const centerX = obj.x + obj.w * 0.5;
        const centerY = obj.y + obj.h * 0.5;
        const radiusX = Math.max(18, obj.w * 0.5 - inset);
        const radiusY = Math.max(14, obj.h * 0.5 - inset * 0.85);
        const seedBase = obj.x * 0.017 + obj.y * 0.013 + obj.w * 0.011 + obj.h * 0.019;
        const pointCount = 12;
        const points = [];

        for (let i = 0; i < pointCount; i++) {
            const angle = Math.PI * 2 * i / pointCount;
            const stretchX = 0.76 + hellLavaNoise(seedBase + i * 0.91) * 0.34;
            const stretchY = 0.74 + hellLavaNoise(seedBase + 20 + i * 1.07) * 0.38;
            const lobeBoost = (i % 4 === 1 || i % 4 === 2) ? 1.08 : 0.96;
            const ridgeBoost = i % 3 === 0 ? 1.06 : 0.94;

            points.push({
                x: centerX + Math.cos(angle) * radiusX * stretchX * lobeBoost,
                y: centerY + Math.sin(angle) * radiusY * stretchY * ridgeBoost
            });
        }

        const firstMidX = (points[0].x + points[1].x) * 0.5;
        const firstMidY = (points[0].y + points[1].y) * 0.5;

        ctx.beginPath();
        ctx.moveTo(firstMidX, firstMidY);

        for (let i = 1; i <= pointCount; i++) {
            const current = points[i % pointCount];
            const next = points[(i + 1) % pointCount];
            const midX = (current.x + next.x) * 0.5;
            const midY = (current.y + next.y) * 0.5;
            ctx.quadraticCurveTo(current.x, current.y, midX, midY);
        }

        ctx.closePath();
    }

// ── Boss Hell Tank custom renderer ────────────────────────────────────────────
// Call with ctx already translated so (0,0) is the boss centre.
// w, h = 114×114. turretAngle in radians. isPhase2 = rage mode boolean.
function drawBossOn(ctx, w, h, turretAngle, phase) {
    const t = Date.now();
    const isPhase2 = phase >= 2;
    const isPhase3 = phase === 3;

    // Phase 3: slightly stronger random body shake
    if (isPhase3) ctx.translate((Math.random() - 0.5) * 3, (Math.random() - 0.5) * 3);
    else if (isPhase2) ctx.translate((Math.random() - 0.5) * 2.5, (Math.random() - 0.5) * 2.5);

    const trackH = h * 0.14;
    const bw = w * 0.82;
    const bh = h * 0.60;

    // ── Phase outer hell-glow ──────────────────────────────────────────────
    if (isPhase2) {
        const pulse = 0.5 + 0.5 * Math.sin(t * 0.01);
        const intensity = isPhase3 ? 0.38 : 0.28; // Phase 3: stronger glow
        const hg = ctx.createRadialGradient(0, 0, w * 0.2, 0, 0, w * 0.72);
        hg.addColorStop(0, `rgba(255,${Math.floor(isPhase3 ? 80 : 60 + 40 * pulse)},0,${intensity})`);
        hg.addColorStop(1, 'rgba(120,0,0,0)');
        ctx.fillStyle = hg;
        ctx.beginPath(); ctx.arc(0, 0, w * 0.72, 0, Math.PI * 2); ctx.fill();
    }

    // ── TRACKS ───────────────────────────────────────────────────────────────
    ctx.fillStyle = isPhase2 ? '#1a0000' : '#1c1c1c';
    ctx.fillRect(-w / 2, -h / 2, w, trackH);
    ctx.fillRect(-w / 2, h / 2 - trackH, w, trackH);
    // Track segment lines
    ctx.strokeStyle = isPhase2 ? '#4a0000' : '#383838';
    ctx.lineWidth = 2;
    for (let x = -w / 2 + 8; x < w / 2; x += 14) {
        ctx.beginPath(); ctx.moveTo(x, -h / 2); ctx.lineTo(x, -h / 2 + trackH); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(x, h / 2 - trackH); ctx.lineTo(x, h / 2); ctx.stroke();
    }
    // Track wheel hints
    const wheelY = [-h / 2 + trackH * 0.5, h / 2 - trackH * 0.5];
    for (const wy of wheelY) {
        for (let wx = -w / 2 + 10; wx < w / 2; wx += 22) {
            ctx.beginPath(); ctx.arc(wx, wy, 5, 0, Math.PI * 2);
            ctx.fillStyle = isPhase2 ? '#2a0000' : '#2a2a2a'; ctx.fill();
            ctx.strokeStyle = isPhase2 ? '#660000' : '#555'; ctx.lineWidth = 1.5; ctx.stroke();
        }
    }

    // ── BODY ─────────────────────────────────────────────────────────────────
    const bg = ctx.createLinearGradient(-bw / 2, -bh / 2, bw / 2, bh / 2);
    if (isPhase3) {
        // Phase 3: intense red/orange
        bg.addColorStop(0, '#6b0000'); bg.addColorStop(0.45, '#8b1a1a');
        bg.addColorStop(0.75, '#5a0000'); bg.addColorStop(1, '#2e0000');
    } else if (isPhase2) {
        // Phase 2: angry red
        bg.addColorStop(0, '#4a0000'); bg.addColorStop(0.45, '#700000');
        bg.addColorStop(0.75, '#4a0000'); bg.addColorStop(1, '#1e0000');
    } else {
        // Phase 1: normal dark red
        bg.addColorStop(0, '#1a0000'); bg.addColorStop(0.45, '#3a0000');
        bg.addColorStop(0.75, '#280000'); bg.addColorStop(1, '#0d0000');
    }
    ctx.fillStyle = bg;
    ctx.fillRect(-bw / 2, -bh / 2, bw, bh);

    // Sloped front armour panel
    ctx.beginPath();
    ctx.moveTo(bw / 2, -bh / 2);
    ctx.lineTo(bw / 2 + 10, -bh / 4);
    ctx.lineTo(bw / 2 + 10, bh / 4);
    ctx.lineTo(bw / 2, bh / 2);
    ctx.closePath();
    ctx.fillStyle = isPhase2 ? '#5a0000' : '#250000'; ctx.fill();
    ctx.strokeStyle = isPhase2 ? '#880000' : '#3a0000'; ctx.lineWidth = 2; ctx.stroke();

    // Side armour strips
    ctx.fillStyle = isPhase2 ? '#3d0000' : '#1f0000';
    ctx.fillRect(-bw / 2, -bh / 2, 10, bh);
    ctx.fillRect(bw / 2 - 10, -bh / 2, 10, bh);

    // Rivets
    const rivets = [
        [-bw / 2 + 8, -bh / 2 + 9], [bw / 2 - 8, -bh / 2 + 9],
        [-bw / 2 + 8, bh / 2 - 9],  [bw / 2 - 8, bh / 2 - 9],
        [0, -bh / 2 + 9], [0, bh / 2 - 9],
        [-bw / 4, -bh / 2 + 9], [bw / 4, -bh / 2 + 9]
    ];
    ctx.fillStyle = isPhase2 ? '#8b2200' : '#4a2200';
    for (const [rx, ry] of rivets) {
        ctx.beginPath(); ctx.arc(rx, ry, 3.5, 0, Math.PI * 2); ctx.fill();
    }

    // ── CRACKED ARMOUR with inner fire glow (phase 2+) ───────────────────────
    if (isPhase2) {
        const crackGlow = Math.floor(isPhase3 ? 150 : 100 + 80 * Math.sin(t * 0.022));
        ctx.strokeStyle = `rgba(255,${crackGlow},0,${isPhase3 ? 0.85 : 0.75})`;
        ctx.lineWidth = isPhase3 ? 2 : 1.5;
        const cracks = [
            [[-bw / 4, -bh / 2 + 6], [-bw / 6, 2], [-bw / 3, bh / 3]],
            [[bw / 6, -bh / 3], [bw / 4, bh / 5]],
            [[-bw / 2 + 12, 0], [-bw / 4, bh / 4], [-bw / 5, bh / 2 - 4]],
            [[bw / 3, -bh / 4], [bw / 5, bh / 3]]
        ];
        for (const pts of cracks) {
            ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]);
            for (let k = 1; k < pts.length; k++) ctx.lineTo(pts[k][0], pts[k][1]);
            ctx.stroke();
        }
        // Inner fire leaking through cracks
        ctx.fillStyle = `rgba(255,${crackGlow},0,${isPhase3 ? 0.55 : 0.35})`;
        ctx.fillRect(-bw / 4 - 1, -bh / 2 + 4, 3, 10);
        ctx.fillRect(bw / 5, -bh / 3 - 1, 2, 8);
        
        // Phase 3: extra cracks
        if (isPhase3) {
            const extraCracks = [
                [[0, -bh / 3], [bw / 6, 0], [bw / 4, bh / 4]],
                [[-bw / 3, bh / 4], [-bw / 5, bh / 2 - 2]]
            ];
            for (const pts of extraCracks) {
                ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]);
                for (let k = 1; k < pts.length; k++) ctx.lineTo(pts[k][0], pts[k][1]);
                ctx.stroke();
            }
        }
    }

    // ── GLOWING EYE SLITS ────────────────────────────────────────────────────
    const eyeBrightness = isPhase2 ? Math.floor(isPhase3 ? 180 : 80 + 60 * Math.sin(t * 0.025)) : 50;
    const eyeColor = `rgba(255,${eyeBrightness},0,${isPhase3 ? 1 : (isPhase2 ? 0.95 : 0.85)})`;
    ctx.fillStyle = eyeColor;
    ctx.fillRect(-bw / 4 - 10, -bh / 4 - 1, 20, 7);
    ctx.fillRect(bw / 4 - 10, -bh / 4 - 1, 20, 7);
    // Bright inner gleam
    ctx.fillStyle = isPhase3 ? '#ffff00' : (isPhase2 ? '#ffffff' : '#ffcc44');
    ctx.fillRect(-bw / 4 - 7, -bh / 4 + 1, 14, 3);
    ctx.fillRect(bw / 4 - 7, -bh / 4 + 1, 14, 3);
    // Eye glow halo
    if (isPhase2) {
        for (let ei = -1; ei <= 1; ei += 2) {
            const ex = ei * bw / 4;
            const eg = ctx.createRadialGradient(ex, -bh / 4 + 2, 0, ex, -bh / 4 + 2, isPhase3 ? 20 : 16);
            eg.addColorStop(0, `rgba(255,${eyeBrightness},0,${isPhase3 ? 0.7 : 0.5})`);
            eg.addColorStop(1, 'rgba(255,0,0,0)');
            ctx.fillStyle = eg; ctx.beginPath(); ctx.arc(ex, -bh / 4 + 2, isPhase3 ? 20 : 16, 0, Math.PI * 2); ctx.fill();
        }
    }

    // Skull emblem
    ctx.font = `bold ${Math.round(w * 0.21)}px Arial`;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.globalAlpha = isPhase3 ? 0.95 : (isPhase2 ? 0.8 + 0.2 * Math.sin(t * 0.03) : 0.55);
    ctx.fillStyle = isPhase2 ? `rgba(255,${Math.floor(isPhase3 ? 100 : 40 + 30 * Math.sin(t * 0.04))},0,1)` : 'rgba(200,0,0,1)';
    ctx.fillText('💀', bw / 10, bh / 8);
    ctx.globalAlpha = 1;

    // ── FIRE JETS (Phase 2+) ────────────────────────────────────────────────
    if (isPhase2) {
        // Top + bottom flames (spread along the width)
        const flameCount = isPhase3 ? 11 : 9;
        for (let i = 0; i < flameCount; i++) {
            const fx = -bw / 2 + (i / (flameCount - 1)) * bw + (Math.random() - 0.5) * 6;
            const fh = (isPhase3 ? 18 : 14) + Math.sin(t * 0.007 + i * 0.9) * 8 + Math.random() * 6;
            const sides = [[-bh / 2, -1], [bh / 2, 1]];
            for (const [fy0, dir] of sides) {
                const fg = ctx.createRadialGradient(fx, fy0 + dir * fh * 0.35, 0, fx, fy0 + dir * fh * 0.35, fh * 0.75);
                fg.addColorStop(0, `rgba(255,255,${isPhase3 ? 80 : 120},${isPhase3 ? 1 : 0.95})`);
                fg.addColorStop(0.35, `rgba(255,${isPhase3 ? 180 : 130},0,${isPhase3 ? 0.85 : 0.75})`);
                fg.addColorStop(0.7, `rgba(220,${isPhase3 ? 80 : 30},0,${isPhase3 ? 0.65 : 0.45})`);
                fg.addColorStop(1, 'rgba(120,0,0,0)');
                ctx.fillStyle = fg;
                ctx.beginPath(); ctx.arc(fx, fy0 + dir * fh * 0.35, fh * 0.75, 0, Math.PI * 2); ctx.fill();
            }
        }
        // Side venting flames (left & right) - more intense in Phase 3
        for (let side = -1; side <= 1; side += 2) {
            const count = isPhase3 ? 7 : 5;
            for (let j = 0; j < count; j++) {
                const fx = side * (bw / 2 + 6 + Math.random() * (isPhase3 ? 14 : 10));
                const fy = -bh / 3 + (j / (count - 1)) * bh * 0.66 + (Math.random() - 0.5) * 8;
                const fr = (isPhase3 ? 12 : 9) + Math.random() * (isPhase3 ? 14 : 10);
                const sg = ctx.createRadialGradient(fx, fy, 0, fx, fy, fr);
                sg.addColorStop(0, `rgba(255,${isPhase3 ? 250 : 220},80,${isPhase3 ? 0.95 : 0.9})`);
                sg.addColorStop(0.4, `rgba(255,${isPhase3 ? 150 : 80},0,${isPhase3 ? 0.75 : 0.6})`);
                sg.addColorStop(1, 'rgba(150,0,0,0)');
                ctx.fillStyle = sg; ctx.beginPath(); ctx.arc(fx, fy, fr, 0, Math.PI * 2); ctx.fill();
            }
        }
        // Exhaust smoke wisps from underside - more in Phase 3
        const smokeCount = isPhase3 ? 6 : 4;
        for (let i = 0; i < smokeCount; i++) {
            const ex = -bw / 3 + i * (bw * 0.22);
            const ey = h / 2 + 5 + Math.random() * 8;
            ctx.globalAlpha = isPhase3 ? 0.3 : (0.18 + Math.random() * 0.12);
            ctx.fillStyle = isPhase3 ? '#440000' : '#220000';
            ctx.beginPath(); ctx.arc(ex, ey, (isPhase3 ? 12 : 8) + Math.random() * (isPhase3 ? 8 : 6), 0, Math.PI * 2); ctx.fill();
            ctx.globalAlpha = 1;
        }
    }

    // ── TURRET ───────────────────────────────────────────────────────────────
    ctx.save();
    ctx.rotate(turretAngle);

    // Turret dome
    const tg = ctx.createRadialGradient(-w * 0.06, -h * 0.06, w * 0.02, 0, 0, w * 0.28);
    if (isPhase2) {
        tg.addColorStop(0, '#6b0000'); tg.addColorStop(0.55, '#420000'); tg.addColorStop(1, '#1a0000');
    } else {
        tg.addColorStop(0, '#320000'); tg.addColorStop(0.55, '#1e0000'); tg.addColorStop(1, '#0d0000');
    }
    ctx.fillStyle = tg;
    ctx.beginPath(); ctx.ellipse(0, 0, w * 0.28, h * 0.21, 0, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = isPhase2 ? '#770000' : '#380000'; ctx.lineWidth = 3; ctx.stroke();

    // Barrel
    const bLen = w * 0.58, bBarW = h * 0.088;
    ctx.fillStyle = isPhase2 ? '#1e0000' : '#0f0000';
    ctx.fillRect(0, -bBarW / 2, bLen, bBarW);
    ctx.fillStyle = isPhase2 ? '#3d0000' : '#1a0000';
    ctx.fillRect(8, -bBarW / 2 + 2, bLen - 14, bBarW - 4);
    // Armour ring on barrel
    ctx.fillStyle = isPhase2 ? '#550000' : '#220000';
    ctx.fillRect(bLen * 0.55 - 5, -bBarW / 2 - 2, 10, bBarW + 4);
    // Muzzle brake
    ctx.fillStyle = isPhase2 ? '#660000' : '#1e0000';
    ctx.fillRect(bLen - 12, -bBarW / 2 - 4, 16, bBarW + 8);

    // Phase 2+: continuous muzzle fire glow
    if (isPhase2) {
        const mFlicker = 0.5 + 0.5 * Math.sin(t * 0.04);
        const mSize = 16 + mFlicker * 10;
        const mg = ctx.createRadialGradient(bLen + 10, 0, 0, bLen + 10, 0, mSize);
        mg.addColorStop(0, `rgba(255,255,${Math.floor(150 * mFlicker)},0.9)`);
        mg.addColorStop(0.4, `rgba(255,${Math.floor(80 + 50 * mFlicker)},0,0.6)`);
        mg.addColorStop(1, 'rgba(180,0,0,0)');
        ctx.fillStyle = mg;
        ctx.beginPath(); ctx.arc(bLen + 10, 0, mSize, 0, Math.PI * 2); ctx.fill();
    }

    ctx.restore(); // end turret rotation
}

let lastPreviewDrawAt = -Infinity;
let lastPreviewDrawKey = '';
function drawPreview() {
    if (!previewCtx || gameState !== 'menu') return;
    const now = performance.now();
    const previewKey = [tankType, tank.color, tank.turretAngle,
        previewCanvas.width, previewCanvas.height].join(':');
    if (previewKey === lastPreviewDrawKey && now - lastPreviewDrawAt < 1000 / 30) return;
    lastPreviewDrawAt = now;
    lastPreviewDrawKey = previewKey;
    previewCtx.clearRect(0,0,previewCanvas.width, previewCanvas.height);
    const side = Math.min(previewCanvas.width, previewCanvas.height) / 2;
    drawTankOn(previewCtx, previewCanvas.width/2, previewCanvas.height/2, side, side, tank.color, getPreviewTankTurretAngle(tankType, tank.turretAngle), 1, tankType, getPreviewTankHeatState(tankType), 0);
}

function getPreviewTankTurretAngle(type, fallbackAngle = 0) {
    return fallbackAngle;
}

function getPreviewTankHeatState(type) {
    if (type === 'burovoy') {
        const cycle = (Date.now() % 1800) / 1800;
        const pulse = Math.pow((Math.sin(cycle * Math.PI * 2) + 1) * 0.5, 1.5);

        return {
            burovoyDrillAnim: 0.12 + pulse * 0.88,
            burovoyBurrowActive: false,
            burovoyBurrowPhase: 0,
            burovoyDrillActive: pulse > 0.55,
            burovoyDrillHit: pulse > 0.84
        };
    }

    return null;
}

function stopCharacterPreviewAnimations() {
    if (window.characterPreviewsAnimId) {
        cancelAnimationFrame(window.characterPreviewsAnimId);
        window.characterPreviewsAnimId = null;
    }
    if (window.characterPreviewObserver) {
        window.characterPreviewObserver.disconnect();
        window.characterPreviewObserver = null;
    }
    for (const key of ['mechDiyAnimId', 'mechShieldAnimId', 'mechRocketAnimId']) {
        if (window[key] != null) cancelAnimationFrame(window[key]);
        window[key] = null;
    }
}

function drawFrozenOverlay(ctx, x, y, w, h, life) {
    const alpha = Math.min(1, life / 24);
    const traceIce = () => {
        ctx.beginPath();
        ctx.moveTo(x - w * 0.09, y + h * 0.05);
        ctx.lineTo(x + w * 0.19, y - h * 0.12);
        ctx.lineTo(x + w * 0.48, y - h * 0.08);
        ctx.lineTo(x + w * 0.78, y - h * 0.13);
        ctx.lineTo(x + w * 1.10, y - h * 0.04);
        ctx.lineTo(x + w * 1.14, y + h * 0.18);
        ctx.lineTo(x + w * 1.09, y + h * 0.46);
        ctx.lineTo(x + w * 1.17, y + h * 0.75);
        ctx.lineTo(x + w * 1.07, y + h * 1.10);
        ctx.lineTo(x + w * 0.77, y + h * 1.13);
        ctx.lineTo(x + w * 0.50, y + h * 1.08);
        ctx.lineTo(x + w * 0.17, y + h * 1.15);
        ctx.lineTo(x - w * 0.09, y + h * 1.07);
        ctx.lineTo(x - w * 0.15, y + h * 0.77);
        ctx.lineTo(x - w * 0.09, y + h * 0.46);
        ctx.lineTo(x - w * 0.14, y + h * 0.20);
        ctx.closePath();
    };
    ctx.save();
    ctx.globalAlpha = alpha;
    traceIce();
    const body = ctx.createLinearGradient(x, y, x + w, y + h);
    body.addColorStop(0, 'rgba(216, 248, 251, 0.64)');
    body.addColorStop(0.52, 'rgba(123, 203, 226, 0.49)');
    body.addColorStop(1, 'rgba(57, 119, 158, 0.61)');
    ctx.fillStyle = body;
    ctx.fill();
    ctx.save();
    traceIce();
    ctx.clip();
    const frost = ctx.createRadialGradient(x + w * 0.52, y + h * 0.5, w * 0.2,
        x + w * 0.52, y + h * 0.5, w * 0.78);
    frost.addColorStop(0, 'rgba(234, 251, 253, 0)');
    frost.addColorStop(1, 'rgba(227, 250, 252, 0.46)');
    ctx.fillStyle = frost;
    ctx.fillRect(x - w * 0.2, y - h * 0.2, w * 1.4, h * 1.4);
    ctx.fillStyle = 'rgba(230, 251, 253, 0.25)';
    ctx.beginPath();
    ctx.moveTo(x - w * 0.15, y + h * 0.2);
    ctx.lineTo(x + w * 0.33, y - h * 0.15);
    ctx.lineTo(x + w * 0.26, y + h * 0.24);
    ctx.lineTo(x + w * 0.03, y + h * 0.48);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = 'rgba(48, 126, 164, 0.18)';
    ctx.beginPath();
    ctx.moveTo(x + w * 1.18, y + h * 0.45);
    ctx.lineTo(x + w * 0.79, y + h * 0.63);
    ctx.lineTo(x + w * 0.86, y + h * 1.16);
    ctx.lineTo(x + w * 1.16, y + h * 1.07);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = 'rgba(222, 248, 251, 0.24)';
    ctx.beginPath();
    ctx.moveTo(x + w * 0.08, y + h * 1.17);
    ctx.lineTo(x + w * 0.38, y + h * 0.88);
    ctx.lineTo(x + w * 0.59, y + h * 1.1);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = 'rgba(233, 253, 254, 0.58)';
    ctx.lineWidth = 0.9;
    ctx.beginPath();
    ctx.moveTo(x + w * 0.02, y + h * 0.25);
    ctx.lineTo(x + w * 0.25, y + h * 0.38);
    ctx.lineTo(x + w * 0.19, y + h * 0.52);
    ctx.moveTo(x + w * 0.25, y + h * 0.38);
    ctx.lineTo(x + w * 0.39, y + h * 0.33);
    ctx.moveTo(x + w * 0.94, y + h * 0.62);
    ctx.lineTo(x + w * 0.72, y + h * 0.75);
    ctx.lineTo(x + w * 0.78, y + h * 0.88);
    ctx.stroke();
    ctx.restore();
    traceIce();
    ctx.strokeStyle = 'rgba(212, 247, 250, 0.85)';
    ctx.lineWidth = 1.3;
    ctx.lineJoin = 'round';
    ctx.stroke();
    ctx.restore();
}

function drawIceSlowOverlay(ctx, x, y, w, h, life, unit) {
    const alpha = Math.min(1, life / 24);
    if (unit._iceVisualSeed === undefined) unit._iceVisualSeed = Math.random() * 1000;
    const time = Date.now() / 2500 + unit._iceVisualSeed;
    ctx.save();
    for (let i = 0; i < 3; i++) {
        const cycle = time + i * 0.34;
        const stage = cycle - Math.floor(cycle);
        const opacity = Math.min(1, stage * 4, (1 - stage) * 4);
        const hash = Math.sin((Math.floor(cycle) + i * 17.31) * 12.9898) * 43758.5453;
        const position = hash - Math.floor(hash);
        const side = i === 0 ? 0 : (i === 1 ? (position < 0.5 ? 3 : 1) : (position < 0.5 ? 0 : 2));
        const anchorX = side === 0 || side === 2
            ? x + w * (0.2 + position * 0.6) : (side === 1 ? x + w + 1 : x - 1);
        const anchorY = side === 1 || side === 3
            ? y + h * (0.2 + position * 0.6) : (side === 0 ? y - 1 : y + h + 1);
        const angle = side === 0 ? 0 : side === 1 ? Math.PI / 2 : side === 2 ? Math.PI : -Math.PI / 2;
        const width = Math.min(w, h) * (0.14 + position * 0.05);
        const length = Math.min(w, h) * (0.32 + position * 0.12) * (side === 0 ? 1 : 0.62);
        ctx.save();
        ctx.globalAlpha = alpha * opacity;
        ctx.translate(anchorX, anchorY);
        ctx.rotate(angle);
        ctx.fillStyle = 'rgba(181, 226, 240, 0.34)';
        ctx.beginPath();
        ctx.moveTo(-width, -0.7);
        ctx.lineTo(-width * 0.45, -1.8);
        ctx.lineTo(width * 0.2, -1.3);
        ctx.lineTo(width * 0.9, -0.2);
        ctx.lineTo(width * 0.7, 1.7);
        ctx.lineTo(-width * 0.8, 1.9);
        ctx.closePath();
        ctx.fill();
        const crystal = ctx.createLinearGradient(-width, 0, width, length);
        crystal.addColorStop(0, 'rgba(228, 248, 252, 0.86)');
        crystal.addColorStop(0.5, 'rgba(152, 217, 239, 0.84)');
        crystal.addColorStop(1, 'rgba(86, 171, 209, 0.74)');
        ctx.fillStyle = crystal;
        ctx.beginPath();
        ctx.moveTo(-width * 0.7, 0.5);
        ctx.lineTo(width * 0.6, 0.8);
        ctx.lineTo(width * 0.46, length * 0.36);
        ctx.lineTo(-width * 0.25, length);
        ctx.lineTo(-width * 0.38, length * 0.55);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = 'rgba(43, 128, 179, 0.38)';
        ctx.beginPath();
        ctx.moveTo(width * 0.6, 0.8);
        ctx.lineTo(width * 0.46, length * 0.36);
        ctx.lineTo(-width * 0.25, length);
        ctx.lineTo(width * 0.02, length * 0.3);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = 'rgba(244, 255, 255, 0.82)';
        ctx.lineWidth = 0.9;
        ctx.beginPath();
        ctx.moveTo(-width * 0.47, 1);
        ctx.lineTo(-width * 0.29, length * 0.51);
        ctx.lineTo(-width * 0.25, length);
        ctx.stroke();
        ctx.restore();
    }
    ctx.restore();
}

function drawSandCurseOverlay(ctx, radius, timer) {
    if (!timer || timer <= 0) return;
    const time = Date.now() * 0.004;
    const pulse = 0.68 + 0.18 * Math.sin(time * 2.3);
    ctx.save();
    const grad = ctx.createRadialGradient(0, 0, radius * 0.2, 0, 0, radius);
    grad.addColorStop(0, `rgba(14,12,20,${0.08 * pulse})`);
    grad.addColorStop(0.55, `rgba(26,22,38,${0.28 * pulse})`);
    grad.addColorStop(1, `rgba(6,5,12,${0.56 * pulse})`);
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(0, 0, radius * 0.96, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = `rgba(8, 7, 14, ${0.22 * pulse})`;
    ctx.beginPath();
    ctx.arc(0, 0, radius * 0.72, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = `rgba(108, 92, 140, ${0.6 * pulse})`;
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.arc(0, 0, radius * 0.82, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = `rgba(22, 18, 34, ${0.72 * pulse})`;
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.arc(0, 0, radius * 0.58, 0, Math.PI * 2);
    ctx.stroke();

    for (let i = 0; i < 5; i++) {
        const ang = time * 1.6 + i * 1.26;
        const drift = ((time * 0.35) + i * 0.17) % 1;
        const dist = radius * (0.18 + drift * 0.72);
        const px = Math.cos(ang) * dist * 0.88;
        const py = Math.sin(ang * 0.92) * dist * 0.62 - drift * radius * 0.18;
        const size = 1.8 + (i % 2) * 1.1;
        ctx.fillStyle = `rgba(38, 32, 52, ${0.48 + drift * 0.2})`;
        ctx.beginPath();
        ctx.arc(px, py, size, 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.restore();
}

function drawPharaohSwarm(ctx, obj) {
    if (!obj) return;
    const maxLife = obj.maxLife || 300;
    const lifeRatio = Math.max(0, Math.min(1, (obj.life || 0) / maxLife));
    const alpha = 0.18 + (1 - lifeRatio) * 0.08 + lifeRatio * 0.24;
    const time = Date.now() * 0.001;

    ctx.save();
    ctx.translate(obj.x, obj.y);

    const haze = ctx.createRadialGradient(0, 0, obj.radius * 0.1, 0, 0, obj.radius);
    haze.addColorStop(0, `rgba(20, 20, 25, ${alpha * 0.9})`);
    haze.addColorStop(0.5, `rgba(30, 30, 40, ${alpha * 0.6})`);
    haze.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = haze;
    ctx.beginPath();
    ctx.arc(0, 0, obj.radius, 0, Math.PI * 2);
    ctx.fill();

    const insectCount = 75; 
    for (let i = 0; i < insectCount; i++) {
        const speedBase = 1.5 + (i % 3) * 0.5;
        const orbitAngle = time * speedBase * (i % 2 === 0 ? 1 : -1) + (i * 0.37);
        
        const dist = obj.radius * (0.05 + ((i * 17) % 95) / 100);
        const erraticX = Math.sin(time * 12 + i) * 8;
        const erraticY = Math.cos(time * 14 + i * 2) * 8;
        
        const px = Math.cos(orbitAngle) * dist + erraticX;
        const py = Math.sin(orbitAngle * 1.1) * dist * 0.8 + erraticY;
        
        const angle = orbitAngle + Math.PI / 2 + Math.sin(time * 15 + i) * 0.7;
        const size = 1.0 + (i % 4) * 0.3;

        ctx.save();
        ctx.translate(px, py);
        ctx.rotate(angle);

        ctx.fillStyle = `rgba(10, 10, 12, ${alpha * 1.5})`;
        ctx.beginPath();
        ctx.ellipse(0, 0, size * 2, size, 0, 0, Math.PI * 2);
        ctx.fill();

        const flap = Math.abs(Math.sin(time * 40 + i)); 
        ctx.fillStyle = `rgba(220, 220, 240, ${alpha * 1.3})`;
        
        ctx.beginPath();
        ctx.ellipse(0, -size * (0.6 + flap), size * 1.2, size * 0.5, 0, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.beginPath();
        ctx.ellipse(0, size * (0.6 + flap), size * 1.2, size * 0.5, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }

    ctx.restore();
}

function getBurovoyDrillRenderState(unit) {
    if (!unit) return { burovoyDrillAnim: 0, burovoyBurrowActive: false, burovoyBurrowPhase: 0, burovoyDrillActive: false, burovoyDrillHit: false };
    const now = Date.now();
    const until = unit.burovoyDrillAnimUntil || 0;
    const duration = Math.max(1, unit.burovoyDrillAnimDuration || 120);
    const burrowDuration = Math.max(1, unit.burovoyBurrowDuration || 180);
    const burrowTimer = Math.max(0, unit.burovoyBurrowTimer || 0);
    return {
        burovoyDrillAnim: unit.burovoyDrillActive ? 1 : (until > now ? Math.max(0, Math.min(1, (until - now) / duration)) : 0),
        burovoyBurrowActive: unit.burovoyBurrowActive === true,
        burovoyBurrowPhase: unit.burovoyBurrowActive ? (1 - Math.min(1, burrowTimer / burrowDuration)) : 0,
        burovoyDrillActive: unit.burovoyDrillActive === true,
        burovoyDrillHit: unit.burovoyDrillHit === true
    };
}

function drawBurovoyBurrowCracks(ctx, unit) {
    if (!ctx || !unit || unit.burovoyBurrowActive !== true) return;

    const cx = unit.x + (unit.w || 0) / 2;
    const cy = unit.y + (unit.h || 0) / 2;
    const duration = Math.max(1, unit.burovoyBurrowDuration || 180);
    const phase = 1 - Math.max(0, unit.burovoyBurrowTimer || 0) / duration;
    const sinkIntro = Math.max(0, Math.min(1, phase / 0.22));
    const radius = Math.max(unit.w || 38, unit.h || 38) * 0.62 * (0.43 + sinkIntro * 0.55);

    ctx.save();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    for (let i = 0; i < 7; i++) {
        const angle = i * Math.PI * 2 / 7 + 0.16;
        const start = radius * (1.2 + (i % 2) * 0.08);
        const end = radius * (1.54 + (i % 3) * 0.09);
        const middle = (start + end) * 0.5;
        ctx.strokeStyle = 'rgba(57,43,28,0.5)';
        ctx.lineWidth = Math.max(0.8, radius * 0.045);
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(angle) * start, cy + Math.sin(angle) * start * 0.78);
        ctx.lineTo(cx + Math.cos(angle + 0.09) * middle, cy + Math.sin(angle + 0.09) * middle * 0.78);
        ctx.lineTo(cx + Math.cos(angle - 0.05) * end, cy + Math.sin(angle - 0.05) * end * 0.78);
        ctx.stroke();
        ctx.fillStyle = i % 2 ? '#92734a' : '#5b4a31';
        ctx.beginPath();
        ctx.ellipse(cx + Math.cos(angle) * end, cy + Math.sin(angle) * end * 0.78,
            radius * 0.08, radius * 0.045, angle, 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.restore();
}

function drawIceFieldGround(ctx, obj) {
    if (!obj) return;
    const maxLife = obj.maxLife || 240;
    const elapsed = maxLife - (obj.life || 0);
    const freezeInTicks = obj.freezeInTicks || 42;
    const thawOutTicks = obj.thawOutTicks || 56;
    const cells = Array.isArray(obj.cells) ? obj.cells : [];
    const shimmer = Date.now() * 0.0018;
    const radius = obj.radius || 0;

    if (cells.length === 0) return;

    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 0, worldWidth, worldHeight);
    ctx.clip();

    const fieldFreeze = Math.max(0, Math.min(1, elapsed / Math.max(16, freezeInTicks)));
    const fieldThaw = Math.max(0, Math.min(1, (obj.life || 0) / Math.max(18, thawOutTicks)));
    const fieldStrength = fieldFreeze * fieldThaw;
    if (fieldStrength > 0) {
        const body = ctx.createRadialGradient(obj.x, obj.y, radius * 0.14, obj.x, obj.y, radius * 1.04);
        body.addColorStop(0, `rgba(232,247,255,${0.06 + fieldStrength * 0.12})`);
        body.addColorStop(0.45, `rgba(176,218,244,${0.05 + fieldStrength * 0.11})`);
        body.addColorStop(0.8, `rgba(132,184,232,${0.03 + fieldStrength * 0.08})`);
        body.addColorStop(1, 'rgba(120,176,226,0)');
        ctx.fillStyle = body;
        ctx.beginPath();
        ctx.arc(obj.x, obj.y, radius * 1.02, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = `rgba(242,252,255,${0.07 + fieldStrength * 0.16})`;
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        for (let i = 0; i <= 48; i++) {
            const angle = (i / 48) * Math.PI * 2;
            const wave = Math.sin(shimmer * 2.2 + angle * 3.1) * radius * 0.025;
            const ripple = Math.cos(shimmer * 1.5 - angle * 4.2) * radius * 0.018;
            const px = obj.x + Math.cos(angle) * (radius * (0.86 + fieldStrength * 0.05) + wave + ripple);
            const py = obj.y + Math.sin(angle) * (radius * (0.82 + fieldStrength * 0.05) + wave - ripple);
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.stroke();
    }

    for (const cell of cells) {
        const cellElapsed = elapsed - (cell.delay || 0);
        if (cellElapsed <= 0) continue;
        const cellSize = cell.size || 25;
        const freezeProgress = Math.max(0, Math.min(1, cellElapsed / Math.max(16, freezeInTicks)));
        const thawProgress = Math.max(0, Math.min(1, ((obj.life || 0) - (cell.delay || 0) * 0.45) / Math.max(18, thawOutTicks)));
        const strength = freezeProgress * thawProgress;
        if (strength <= 0.02) continue;

        const centerX = cell.x + cellSize / 2;
        const centerY = cell.y + cellSize / 2;
        const haloRadius = cellSize * (0.74 + strength * 0.34);
        const coreRadius = haloRadius * (0.2 + strength * 0.28);
        const frost = ctx.createRadialGradient(centerX, centerY, coreRadius * 0.18, centerX, centerY, haloRadius);
        frost.addColorStop(0, `rgba(244,252,255,${0.12 + strength * 0.22})`);
        frost.addColorStop(0.35, `rgba(193,229,250,${0.12 + strength * 0.2})`);
        frost.addColorStop(0.72, `rgba(146,199,236,${0.08 + strength * 0.16})`);
        frost.addColorStop(1, 'rgba(115,176,226,0)');
        ctx.fillStyle = frost;
        ctx.beginPath();
        ctx.arc(centerX, centerY, haloRadius, 0, Math.PI * 2);
        ctx.fill();

        const veinLen = cellSize * (0.82 + strength * 0.42);
        const veinAngle = shimmer + cell.phase * Math.PI * 2;
        ctx.strokeStyle = `rgba(240,248,255,${0.05 + strength * 0.16})`;
        ctx.lineWidth = 0.8 + strength * 0.9;
        ctx.beginPath();
        ctx.moveTo(
            centerX - Math.cos(veinAngle) * veinLen * 0.34,
            centerY - Math.sin(veinAngle) * veinLen * 0.28
        );
        ctx.quadraticCurveTo(
            centerX + Math.cos(veinAngle + 0.9) * veinLen * 0.14,
            centerY + Math.sin(veinAngle + 0.9) * veinLen * 0.18,
            centerX + Math.cos(veinAngle) * veinLen * 0.38,
            centerY + Math.sin(veinAngle) * veinLen * 0.3
        );
        ctx.stroke();

        if (cell.icicles && strength > 0.34) {
            const sparkleAngle = shimmer * 1.4 + cell.phase * Math.PI * 4;
            const sparkleDist = cellSize * (0.16 + strength * 0.18);
            const sparkleX = centerX + Math.cos(sparkleAngle) * sparkleDist;
            const sparkleY = centerY + Math.sin(sparkleAngle) * sparkleDist;
            const sparkleSize = 2.5 + strength * 2.2;
            ctx.strokeStyle = `rgba(250,254,255,${0.08 + strength * 0.2})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(sparkleX - sparkleSize, sparkleY);
            ctx.lineTo(sparkleX + sparkleSize, sparkleY);
            ctx.moveTo(sparkleX, sparkleY - sparkleSize * 0.85);
            ctx.lineTo(sparkleX, sparkleY + sparkleSize * 0.85);
            ctx.stroke();
        }
    }
    ctx.restore();
}

function drawSandBlindScreenOverlay(ctx, width, height, timer) {
    if (!timer || timer <= 0) return;
    const fullBlind = (typeof tankType !== 'undefined' && tankType !== 'egyptian');
    if (fullBlind) {
        const alpha = Math.min(0.96, 0.82 + (timer / 90) * 0.16);
        const drift = Date.now() * 0.0009;
        const playerCx = (typeof tank !== 'undefined' ? tank.x + (tank.w || 0) / 2 : width / 2);
        const playerCy = (typeof tank !== 'undefined' ? tank.y + (tank.h || 0) / 2 : height / 2);
        const revealRange = 90;

        ctx.save();
        ctx.fillStyle = `rgba(168, 134, 74, ${alpha})`;
        ctx.fillRect(0, 0, width, height);

        const stormGrad = ctx.createRadialGradient(playerCx, playerCy, 0, playerCx, playerCy, Math.max(width, height) * 0.95);
        stormGrad.addColorStop(0, `rgba(186, 151, 84, ${Math.min(0.92, alpha)})`);
        stormGrad.addColorStop(0.5, `rgba(154, 120, 62, ${Math.min(0.95, alpha + 0.04)})`);
        stormGrad.addColorStop(1, `rgba(113, 83, 34, ${Math.min(0.98, alpha + 0.06)})`);
        ctx.fillStyle = stormGrad;
        ctx.fillRect(0, 0, width, height);

        ctx.strokeStyle = `rgba(235, 213, 164, ${0.2 + Math.min(0.18, timer / 450)})`;
        ctx.lineWidth = 3;
        for (let i = 0; i < 7; i++) {
            const y = height * (0.1 + i * 0.13);
            ctx.beginPath();
            ctx.moveTo(-40, y + Math.sin(drift * 3.5 + i) * 24);
            ctx.quadraticCurveTo(width * 0.33, y - 18, width + 40, y + Math.cos(drift * 2.7 + i * 0.8) * 20);
            ctx.stroke();
        }

        ctx.fillStyle = `rgba(224, 196, 138, ${0.22})`;
        for (let i = 0; i < 22; i++) {
            const px = (i * 71 + drift * 1200) % (width + 80) - 40;
            const py = ((i * 53) % (height + 60)) - 30 + Math.sin(drift * 4 + i) * 14;
            const size = 2 + (i % 3);
            ctx.beginPath();
            ctx.arc(px, py, size, 0, Math.PI * 2);
            ctx.fill();
        }

        const revealTargets = [];
        const collectReveal = (unit) => {
            if (!unit || unit.alive === false || (unit.tankType || '') !== 'egyptian') return;
            if (!GameTerrain.canSee(tank, unit, objects)) return;
            const ux = unit.x + (unit.w || 0) / 2;
            const uy = unit.y + (unit.h || 0) / 2;
            const dist = Math.hypot(ux - playerCx, uy - playerCy);
            if (dist > revealRange) return;
            revealTargets.push({
                x: ux,
                y: uy,
                radius: Math.max(22, Math.max(unit.w || 0, unit.h || 0) * 0.92 + (revealRange - dist) * 0.26)
            });
        };
        if (typeof enemies !== 'undefined') enemies.forEach(collectReveal);
        if (typeof allies !== 'undefined') allies.forEach(collectReveal);

        if (revealTargets.length > 0) {
            ctx.globalCompositeOperation = 'destination-out';
            for (const reveal of revealTargets) {
                const hole = ctx.createRadialGradient(reveal.x, reveal.y, reveal.radius * 0.18, reveal.x, reveal.y, reveal.radius);
                hole.addColorStop(0, 'rgba(0,0,0,0.96)');
                hole.addColorStop(0.7, 'rgba(0,0,0,0.42)');
                hole.addColorStop(1, 'rgba(0,0,0,0)');
                ctx.fillStyle = hole;
                ctx.beginPath();
                ctx.arc(reveal.x, reveal.y, reveal.radius, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.globalCompositeOperation = 'source-over';

            ctx.strokeStyle = 'rgba(245, 226, 180, 0.24)';
            ctx.lineWidth = 1.2;
            for (const reveal of revealTargets) {
                ctx.beginPath();
                ctx.arc(reveal.x, reveal.y, reveal.radius * 0.92, 0, Math.PI * 2);
                ctx.stroke();
            }
        }
        ctx.restore();
        return;
    }

    const alpha = Math.min(0.34, 0.12 + (timer / 90) * 0.18);
    const cx = width / 2;
    const cy = height / 2;
    const radius = Math.max(width, height) * 0.72;
    const drift = Date.now() * 0.0008;

    ctx.save();
    const vignette = ctx.createRadialGradient(cx, cy, Math.min(width, height) * 0.12, cx, cy, radius);
    vignette.addColorStop(0, 'rgba(245,230,180,0)');
    vignette.addColorStop(0.58, `rgba(212,185,120,${alpha * 0.18})`);
    vignette.addColorStop(1, `rgba(110,82,35,${alpha})`);
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, width, height);

    ctx.globalCompositeOperation = 'screen';
    ctx.strokeStyle = `rgba(245,225,170,${alpha * 0.38})`;
    ctx.lineWidth = 2;
    for (let i = 0; i < 4; i++) {
        const y = height * (0.18 + i * 0.2);
        ctx.beginPath();
        ctx.moveTo(-30, y + Math.sin(drift * 4 + i) * 18);
        ctx.quadraticCurveTo(width * 0.35, y - 14, width + 30, y + Math.cos(drift * 3 + i) * 16);
        ctx.stroke();
    }
    ctx.globalCompositeOperation = 'source-over';
    ctx.restore();
}

function drawCharacterPreviews() {
    stopCharacterPreviewAnimations();

    const characterModal = document.getElementById('characterModal');
    if (!characterModal || getComputedStyle(characterModal).display === 'none') return;
    const visiblePreviews = new Set();
    const renderedStaticPreviews = new Set();
    const isPreviewVisible = canvas => !!canvas && visiblePreviews.has(canvas);

    const shouldAnimateTankPreviews = () => {
        const tanksGrid = document.getElementById('charGridTanks');
        const mechsGrid = document.getElementById('charGridMechs');
        return !!(
            characterModal &&
            getComputedStyle(characterModal).display !== 'none' &&
            ((!tanksGrid || getComputedStyle(tanksGrid).display !== 'none') ||
             (mechsGrid && getComputedStyle(mechsGrid).display !== 'none'))
        );
    };

    const isUnlockedTank = (type) => {
        return typeof unlockedTanks !== 'undefined' && unlockedTanks.includes(type);
    };

    const drawPreviewOverlay = (ctx, canvas, type, isUnlocked) => {
        if (isUnlocked && typeof getTankTrophies === 'function') {
            const tankTrophies = getTankTrophies(type);
            if (tankTrophies > 0) {
                ctx.fillStyle = 'rgba(0,0,0,0.6)';
                ctx.fillRect(0, canvas.height - 24, canvas.width, 24);
                ctx.fillStyle = '#e67e22';
                ctx.font = 'bold 14px Arial';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText('🏆 ' + tankTrophies, canvas.width / 2, canvas.height - 12);
            }
        }

        if (typeof window.getCurrentTankType === 'function' && window.getCurrentTankType() === type) {
            ctx.save();
            ctx.strokeStyle = 'white';
            ctx.lineWidth = 4;
            ctx.strokeRect(2, 2, canvas.width - 4, canvas.height - 4);
            ctx.restore();
        } else if (!isUnlocked) {
            ctx.fillStyle = 'rgba(0,0,0,0.5)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.font = '40px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = '#fff';
            ctx.shadowColor = 'black';
            ctx.shadowBlur = 4;
            ctx.fillText('🔒', canvas.width / 2, canvas.height / 2);
            ctx.shadowBlur = 0;
        }
    };

    const drawItem = (ctx, canvas, type, baseColor, bgGrad, heatState = null, animated = false) => {
        if (!ctx || !isPreviewVisible(canvas) || !bgGrad ||
            (!animated && renderedStaticPreviews.has(canvas))) return;

        const isUnlocked = isUnlockedTank(type);
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
        if (isUnlocked) {
            bgGrad.forEach((colorStop, idx) => {
                grad.addColorStop(idx / Math.max(1, bgGrad.length - 1), colorStop);
            });
        } else {
            grad.addColorStop(0, '#444');
            grad.addColorStop(1, '#222');
        }

        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        let side = Math.min(canvas.width, canvas.height) / 2;
        if (type === 'mechDiy' || type === 'mechShield') side *= 0.2;
        if (type === 'myasnoy') side *= (heatState && heatState.myasnoyEyeForm) ? 0.78 : 0.90;

        ctx.save();
        if (!isUnlocked) ctx.filter = 'grayscale(100%) contrast(0.8)';
        drawTankOn(ctx, canvas.width / 2, canvas.height / 2, side, side, baseColor, getPreviewTankTurretAngle(type, 0), 1, type, heatState, 0);
        ctx.restore();

        drawPreviewOverlay(ctx, canvas, type, isUnlocked);
        if (!animated) renderedStaticPreviews.add(canvas);
    };

    const drawChromaticItem = (ctx, canvas, type, baseColor, lockedBg) => {
        if (!ctx || !isPreviewVisible(canvas)) return;

        const isUnlocked = isUnlockedTank(type);
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const time = Date.now() * 0.00012;
        if (isUnlocked) {
            const pixel = Math.max(18, Math.floor(Math.min(canvas.width, canvas.height) / 12));
            const shift = (time * 360) % 360;
            const step = 0.12;
            for (let py = 0; py < canvas.height; py += pixel) {
                for (let px = 0; px < canvas.width; px += pixel) {
                    const diagonal = px + py;
                    const hue = (((diagonal * step) - shift) % 360 + 360) % 360;
                    const light = 48 + 6 * Math.sin((px * 0.02 + py * 0.02) + time * 2.2);
                    ctx.fillStyle = `hsl(${hue}, 82%, ${light}%)`;
                    ctx.fillRect(px, py, pixel, pixel);
                }
            }
        } else {
            ctx.fillStyle = lockedBg;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        const side = Math.min(canvas.width, canvas.height) / 2;
        ctx.save();
        if (!isUnlocked) ctx.filter = 'grayscale(100%) contrast(0.8)';
        drawTankOn(ctx, canvas.width / 2, canvas.height / 2, side, side, baseColor, 0, 1, type);
        ctx.restore();

        drawPreviewOverlay(ctx, canvas, type, isUnlocked);
    };

    const renderAnimatedCharacterPreviews = () => {
        const tanksGrid = document.getElementById('charGridTanks');
        const mechsGrid = document.getElementById('charGridMechs');
        if (!tanksGrid || getComputedStyle(tanksGrid).display !== 'none') {
            drawItem(airTankCtx, airTankPreview, 'air', '#00a896', tankBgGradients.air, null, true);
            drawItem(illuminatTankCtx, illuminatTankPreview, 'illuminat', '#0000FF', tankBgGradients.illuminat, null, true);
            drawItem(burovoyTankCtx, burovoyTankPreview, 'burovoy', '#8b1e13', tankBgGradients.burovoy, getPreviewTankHeatState('burovoy'), true);
            if (typeof myasnoyTankCtx !== 'undefined' && myasnoyTankCtx && myasnoyTankPreview) {
                drawItem(myasnoyTankCtx, myasnoyTankPreview, 'myasnoy', '#c03030', tankBgGradients.myasnoy, null, true);
            }
            drawChromaticItem(timeTankCtx, timeTankPreview, 'time', '#FF00FF', '#333');
            drawChromaticItem(imitatorTankCtx, imitatorTankPreview, 'imitator', '#1a1a3e', '#111');
            drawChromaticItem(romanTankCtx, romanTankPreview, 'roman', '#1a1a2e', '#111');
            if (typeof kvantTankCtx !== 'undefined' && kvantTankCtx && kvantTankPreview) {
                drawChromaticItem(kvantTankCtx, kvantTankPreview, 'kvant', '#0d1b2a', '#06111e');
            }
        }
        if (!mechsGrid || getComputedStyle(mechsGrid).display !== 'none') {
            if (isPreviewVisible(mechDiyTankPreview) && typeof drawMechDiyPreview === 'function')
                drawMechDiyPreview(mechDiyTankPreview, isUnlockedTank('mechDiy'));
            if (isPreviewVisible(mechShieldTankPreview) && typeof drawMechShieldPreview === 'function')
                drawMechShieldPreview(mechShieldTankPreview, isUnlockedTank('mechShield'));
            if (isPreviewVisible(mechRocketTankPreview) && typeof drawMechRocketPreview === 'function')
                drawMechRocketPreview(mechRocketTankPreview, isUnlockedTank('mechRocket'));
        }
    };

    const staticPreviews = [
        [normalTankCtx, normalTankPreview, 'normal', '#0000FF'],
        [iceTankCtx, iceTankPreview, 'ice', '#54d1e8'],
        [machinegunTankCtx, machinegunTankPreview, 'machinegun', '#0000FF'],
        [buckshotTankCtx, buckshotTankPreview, 'buckshot', '#2ecc71'],
        [pyroTankCtx, pyroTankPreview, 'pyro', '#8b2500'],
        [fireTankCtx, fireTankPreview, 'fire', '#4c00ff'],
        [waterjetTankCtx, waterjetTankPreview, 'waterjet', '#154360'],
        [medicalTankCtx, medicalTankPreview, 'medical', '#0033ff'],
        [spartanTankCtx, spartanTankPreview, 'spartan', '#b87333'],
        [kamikazeTankCtx, kamikazeTankPreview, 'kamikaze', '#FFFFFF'],
        [mineTankCtx, mineTankPreview, 'mine', '#3d4c18'],
        [buratinoTankCtx, buratinoTankPreview, 'buratino', '#0000FF'],
        [musicalTankCtx, musicalTankPreview, 'musical', '#0000FF'],
        [toxicTankCtx, toxicTankPreview, 'toxic', '#0000FF'],
        [mirrorTankCtx, mirrorTankPreview, 'mirror', '#0000FF'],
        [egyptianTankCtx, egyptianTankPreview, 'egyptian', '#8c6a25'],
        [plasmaTankCtx, plasmaTankPreview, 'plasma', '#0000FF'],
        [electricTankCtx, electricTankPreview, 'electric', '#1a1a2e'],
        [robotTankCtx, robotTankPreview, 'robot', '#0d0d1e']
    ];

    const renderStaticCharacterPreviews = () => {
        for (const [ctx, canvas, type, color] of staticPreviews) {
            drawItem(ctx, canvas, type, color, tankBgGradients[type]);
        }

        if (isPreviewVisible(mechDiyTankPreview) && !renderedStaticPreviews.has(mechDiyTankPreview)) {
            const mechDiyUnlocked = isUnlockedTank('mechDiy');
            if (typeof drawMechDiyPreview === 'function') {
                drawMechDiyPreview(mechDiyTankPreview, mechDiyUnlocked);
            } else if (mechDiyTankCtx) {
                drawItem(mechDiyTankCtx, mechDiyTankPreview, 'mechDiy', '#1a8a3e', tankBgGradients.mechDiy);
            }
            renderedStaticPreviews.add(mechDiyTankPreview);
        }
        if (isPreviewVisible(mechShieldTankPreview) && !renderedStaticPreviews.has(mechShieldTankPreview)) {
            const mechShieldUnlocked = isUnlockedTank('mechShield');
            if (typeof drawMechShieldPreview === 'function') {
                drawMechShieldPreview(mechShieldTankPreview, mechShieldUnlocked);
            } else if (mechShieldTankCtx) {
                drawItem(mechShieldTankCtx, mechShieldTankPreview, 'mechShield', '#1a3a6e', tankBgGradients.mechShield);
            }
            renderedStaticPreviews.add(mechShieldTankPreview);
        }
        if (isPreviewVisible(mechRocketTankPreview) && !renderedStaticPreviews.has(mechRocketTankPreview)) {
            const mechRocketUnlocked = isUnlockedTank('mechRocket');
            if (typeof drawMechRocketPreview === 'function') {
                drawMechRocketPreview(mechRocketTankPreview, mechRocketUnlocked);
            }
            renderedStaticPreviews.add(mechRocketTankPreview);
        }
    };

    const previewCanvases = characterModal.querySelectorAll('.char-grid canvas');
    if (typeof IntersectionObserver === 'function') {
        const modalBounds = characterModal.getBoundingClientRect();
        for (const canvas of previewCanvases) {
            const bounds = canvas.getBoundingClientRect();
            if (bounds.width && bounds.height && bounds.bottom >= Math.max(0, modalBounds.top - 120) &&
                bounds.top <= Math.min(window.innerHeight, modalBounds.bottom + 120) &&
                bounds.right >= 0 && bounds.left <= window.innerWidth) {
                visiblePreviews.add(canvas);
            }
        }
        window.characterPreviewObserver = new IntersectionObserver(entries => {
            let newlyVisible = false;
            for (const entry of entries) {
                if (entry.isIntersecting) {
                    if (!visiblePreviews.has(entry.target)) newlyVisible = true;
                    visiblePreviews.add(entry.target);
                } else {
                    visiblePreviews.delete(entry.target);
                }
            }
            if (newlyVisible) renderStaticCharacterPreviews();
        }, { rootMargin: '120px' });
        for (const canvas of previewCanvases) window.characterPreviewObserver.observe(canvas);
    } else {
        for (const canvas of previewCanvases) visiblePreviews.add(canvas);
    }

    renderStaticCharacterPreviews();
    renderAnimatedCharacterPreviews();

    if (shouldAnimateTankPreviews()) {
        let lastPreviewRender = 0;
        const animateCharacterPreviews = (now) => {
            if (!shouldAnimateTankPreviews()) {
                if (getComputedStyle(characterModal).display === 'none') {
                    stopCharacterPreviewAnimations();
                } else {
                    window.characterPreviewsAnimId = null;
                }
                return;
            }

            if (now - lastPreviewRender >= 1000 / 30 - 1) {
                renderAnimatedCharacterPreviews();
                lastPreviewRender = now;
            }
            window.characterPreviewsAnimId = requestAnimationFrame(animateCharacterPreviews);
        };

        window.characterPreviewsAnimId = requestAnimationFrame(animateCharacterPreviews);
    }

}

let menuBackdropWidth = 0;
let menuBackdropHeight = 0;
let menuBackdropObjects = null;
let menuBackdropObjectCount = 0;
let poisonMistSprite = null;

function getPoisonMistSprite() {
    if (poisonMistSprite) return poisonMistSprite;
    const sprite = document.createElement('canvas');
    sprite.width = sprite.height = 128;
    const spriteCtx = sprite.getContext('2d');
    const mist = spriteCtx.createRadialGradient(64, 64, 5, 64, 64, 63);
    mist.addColorStop(0, 'rgba(171,211,103,0.6)');
    mist.addColorStop(0.38, 'rgba(113,171,78,0.48)');
    mist.addColorStop(0.72, 'rgba(74,128,70,0.18)');
    mist.addColorStop(1, 'rgba(55,102,67,0)');
    spriteCtx.fillStyle = mist;
    spriteCtx.fillRect(0, 0, 128, 128);
    poisonMistSprite = sprite;
    return sprite;
}

function drawPoisonCloud(ctx, cloud) {
    const radius = cloud.radius;
    const age = (cloud.maxLife || cloud.life) - cloud.life;
    const fade = Math.min(1, age / 16, cloud.life / 35);
    if (fade <= 0) return;
    const sprite = getPoisonMistSprite();
    const drift = Date.now() * 0.00035;
    ctx.save();
    ctx.globalAlpha = fade * (cloud.toxicWave ? 0.36 : 0.56);
    for (let i = 0; i < 13; i++) {
        const angle = i * 2.39996 + cloud.x * 0.013;
        const distance = radius * (i < 3 ? 0.13 : 0.35 + (i % 3) * 0.12);
        const size = radius * (i < 3 ? 1.12 : 0.92 + (i % 4) * 0.08);
        const x = cloud.x + Math.cos(angle) * distance + Math.sin(drift + i * 1.7) * radius * 0.035;
        const y = cloud.y + Math.sin(angle) * distance + Math.cos(drift * 0.8 + i * 1.3) * radius * 0.035;
        ctx.drawImage(sprite, x - size / 2, y - size / 2, size, size);
    }
    ctx.restore();
}

function drawToxicWaveProjectile(ctx, bullet) {
    const sprite = getPoisonMistSprite();
    const age = Math.max(0, bullet.maxLife - bullet.life);
    const pulse = Math.sin(age * 0.3) * 0.08;
    ctx.save(); ctx.translate(bullet.x, bullet.y); ctx.rotate(Math.atan2(bullet.vy, bullet.vx));
    for (let i = 3; i >= 0; i--) {
        const size = (22 - i * 3) * (1 + pulse);
        ctx.globalAlpha = 0.75 - i * 0.15;
        ctx.drawImage(sprite, -i * 6 - size / 2, -size / 2 + Math.sin(age * 0.2 + i) * 1.5, size, size);
    }
    ctx.globalAlpha = 0.85; ctx.fillStyle = '#b6cf78';
    ctx.beginPath(); ctx.ellipse(0, 0, 4.8, 2.6, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#dfeba4'; ctx.globalAlpha = 0.7;
    ctx.beginPath(); ctx.ellipse(1.2, -0.7, 1.8, 0.7, 0, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
}

function drawPlasmaBolt(ctx, bullet, charged) {
    const radius = Math.max(4, bullet.w * 0.5);
    const scale = charged ? 1.35 : 1;
    const phase = Date.now() * 0.006 + bullet.x * 0.035 + bullet.y * 0.017;
    const pulse = 0.88 + Math.sin(phase * 2) * 0.13;
    const tailWave = Math.sin(phase * 2.4) * radius * 0.28 * scale;
    ctx.save();
    ctx.translate(bullet.x, bullet.y);
    ctx.rotate(Math.atan2(bullet.vy || 0, bullet.vx || 0));

    const tail = ctx.createLinearGradient(-radius * 3.5, 0, radius * 0.3, 0);
    tail.addColorStop(0, charged ? 'rgba(100,9,20,0)' : 'rgba(90,62,206,0)');
    tail.addColorStop(0.5, charged ? 'rgba(195,22,35,0.5)' : 'rgba(114,76,225,0.3)');
    tail.addColorStop(1, charged ? 'rgba(255,80,55,0.95)' : 'rgba(206,135,255,0.8)');
    ctx.fillStyle = tail;
    ctx.beginPath();
    ctx.moveTo(-radius * 3.5 * scale, tailWave * 0.35);
    ctx.quadraticCurveTo(-radius * 1.2, -radius * 0.7 * scale + tailWave, radius * 0.4, -radius * 0.42 * scale);
    ctx.lineTo(radius * 0.4, radius * 0.42 * scale);
    ctx.quadraticCurveTo(-radius * 1.2, radius * 0.7 * scale + tailWave, -radius * 3.5 * scale, tailWave * 0.35);
    ctx.fill();

    const glowRadius = radius * 1.75 * scale * pulse;
    const glow = ctx.createRadialGradient(0, 0, radius * 0.15, 0, 0, glowRadius);
    glow.addColorStop(0, charged ? 'rgba(255,245,210,1)' : 'rgba(249,251,255,0.98)');
    glow.addColorStop(0.26, charged ? 'rgba(255,101,75,0.96)' : 'rgba(180,194,255,0.92)');
    glow.addColorStop(0.53, charged ? 'rgba(220,21,39,0.78)' : 'rgba(151,91,240,0.7)');
    glow.addColorStop(1, charged ? 'rgba(125,4,23,0)' : 'rgba(102,55,195,0)');
    ctx.fillStyle = glow;
    ctx.beginPath(); ctx.arc(0, 0, glowRadius, 0, Math.PI * 2); ctx.fill();

    if (charged) {
        ctx.strokeStyle = 'rgba(255,72,62,0.78)';
        ctx.lineWidth = 1.5;
        for (let i = 0; i < 8; i++) {
            const angle = i * Math.PI / 4 + phase * 0.55;
            const inner = radius * 0.75 * scale;
            const outer = radius * (1.4 + (i % 2) * 0.25) * scale * (1 + Math.sin(phase * 2 + i) * 0.1);
            ctx.beginPath();
            ctx.moveTo(Math.cos(angle) * inner, Math.sin(angle) * inner);
            ctx.lineTo(Math.cos(angle + 0.12) * outer, Math.sin(angle + 0.12) * outer);
            ctx.stroke();
        }
    }
    ctx.strokeStyle = charged ? 'rgba(255,168,115,0.95)' : 'rgba(207,176,255,0.7)';
    ctx.lineWidth = charged ? 1.4 : 1;
    for (const side of [-1, 1]) {
        ctx.beginPath();
        ctx.moveTo(-radius * 1.2, side * radius * 0.32);
        ctx.quadraticCurveTo(0, side * radius * 1.32 * scale + Math.sin(phase * 2 + side) * radius * 0.25, radius * 0.78, side * radius * 0.38);
        ctx.stroke();
    }

    ctx.strokeStyle = charged ? 'rgba(255,205,145,0.82)' : 'rgba(210,207,255,0.78)';
    ctx.lineWidth = charged ? 1.6 : 1.2;
    for (let i = 0; i < 2; i++) {
        const ringRadius = radius * scale * (0.86 + Math.sin(phase * 2 + i * Math.PI) * 0.12);
        const start = phase * (charged ? -0.9 : 1.1) + i * Math.PI;
        ctx.beginPath();
        ctx.arc(0, 0, ringRadius, start, start + Math.PI * 0.7);
        ctx.stroke();
    }

    ctx.fillStyle = charged ? 'rgba(255,221,166,0.9)' : 'rgba(225,210,255,0.85)';
    for (let i = 0, count = charged ? 5 : 3; i < count; i++) {
        const angle = phase * (charged ? -1.2 : 1.3) + i * Math.PI * 2 / count;
        const orbit = radius * scale * (1.18 + Math.sin(phase * 2 + i) * 0.1);
        ctx.beginPath();
        ctx.arc(Math.cos(angle) * orbit, Math.sin(angle) * orbit, charged ? 1.2 : 0.9, 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.fillStyle = charged ? '#fff1c9' : '#ffffff';
    ctx.beginPath(); ctx.ellipse(radius * 0.12, 0, radius * 0.54 * scale * pulse, radius * 0.38 * scale * pulse, 0, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
}

const ordnanceExplosionArt = new WeakMap();
const ordnanceExplosionSprites = new Map();

const tankBlastSprites = new Map();

function getTankBlastSprite(kind, variant = 0) {
    const key = kind + variant;
    if (tankBlastSprites.has(key)) return tankBlastSprites.get(key);
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 192;
    const c = canvas.getContext('2d'), pixels = c.createImageData(192, 192);
    const hash = (x, y) => {
        const n = Math.sin(x * 127.1 + y * 311.7 + variant * 73.3) * 43758.5453;
        return n - Math.floor(n);
    };
    const noise = (x, y) => {
        const ix = Math.floor(x), iy = Math.floor(y);
        let fx = x - ix, fy = y - iy;
        fx *= fx * (3 - 2 * fx); fy *= fy * (3 - 2 * fy);
        return (hash(ix, iy) * (1 - fx) + hash(ix + 1, iy) * fx) * (1 - fy)
            + (hash(ix, iy + 1) * (1 - fx) + hash(ix + 1, iy + 1) * fx) * fy;
    };
    const palette = [[77, 32, 22], [190, 51, 12], [255, 126, 22], [255, 211, 104], [255, 246, 207]];
    // Bake turbulent volume and a broken silhouette; no per-frame pixel work.
    for (let y = 0; y < 192; y++) for (let x = 0; x < 192; x++) {
        const nx = (x - 95.5) / 88, ny = (y - 95.5) / 88;
        const coarse = noise(x / 27, y / 27), detail = noise(x / 9, y / 9);
        const turbulence = coarse * 0.7 + detail * 0.22 + noise(x / 3, y / 3) * 0.08;
        const edge = 1 - Math.hypot(nx, ny) + (coarse - 0.5) * 0.42;
        const alpha = Math.min(1, Math.max(0, edge * 6));
        const index = (y * 192 + x) * 4;
        if (kind === 'fire' || kind === 'ember') {
            let heat = edge * 0.5 + turbulence * 1.05 - 0.18;
            if (kind === 'ember') heat = heat * 0.65 - 0.04;
            heat = Math.max(0, Math.min(0.999, heat));
            const band = heat * (palette.length - 1), low = Math.floor(band), mix = band - low;
            for (let channel = 0; channel < 3; channel++) pixels.data[index + channel] = palette[low][channel] * (1 - mix) + palette[low + 1][channel] * mix;
        } else {
            const light = Math.max(0, 1 - Math.hypot(nx + 0.3, ny + 0.4));
            const shade = (kind === 'dust' ? 75 : 24) + turbulence * (kind === 'dust' ? 55 : 66) + light * 24;
            pixels.data[index] = shade + (kind === 'dust' ? 15 : 0);
            pixels.data[index + 1] = shade;
            pixels.data[index + 2] = shade - (kind === 'dust' ? 19 : 5);
        }
        pixels.data[index + 3] = alpha * (kind === 'dust' ? 150 : 245);
    }
    c.putImageData(pixels, 0, 0);
    tankBlastSprites.set(key, canvas);
    return canvas;
}

function drawTankExplosion(ctx, obj) {
    const progress = Math.max(0, Math.min(1, 1 - obj.life / (obj.maxLife || 54)));
    if (progress >= 1) return;
    const radius = obj.radius || 65, seed = obj.seed || 0;
    const expansion = 1 - Math.exp(-progress * 10);
    const fade = Math.min(1, (1 - progress) / 0.28);
    ctx.save(); ctx.translate(obj.x, obj.y);
    // Dust travels along the ground while the hot fuel clouds rise above it.
    for (let i = 0; i < 9; i++) {
        const angle = i * Math.PI * 2 / 9 + seed;
        const reach = radius * (0.2 + expansion * 0.92);
        const size = radius * (0.23 + progress * 0.5);
        ctx.globalAlpha = Math.sin(progress * Math.PI) * 0.32;
        ctx.drawImage(getTankBlastSprite('dust'), Math.cos(angle) * reach - size / 2,
            Math.sin(angle) * reach * 0.65 - size * 0.23, size, size * 0.46);
    }
    for (let i = 0; i < 10; i++) {
        const angle = i * 2.39996 + seed;
        const variation = 0.5 + Math.sin(i * 7.13 + seed) * 0.5;
        const delay = i % 3 * 0.035;
        const age = Math.max(0, progress - delay);
        const growth = 1 - Math.exp(-age * 12);
        const x = Math.cos(angle) * radius * (0.12 + growth * 0.36);
        const y = Math.sin(angle) * radius * growth * 0.28 - radius * age * (0.25 + variation * 0.35);
        const size = radius * (0.48 + variation * 0.32) * (0.25 + growth);
        ctx.save(); ctx.translate(x, y); ctx.rotate(angle + age * (variation - 0.5));
        const smoke = Math.min(1, Math.max(0, (age - 0.08) * 5));
        ctx.globalAlpha = smoke * fade * 0.85;
        ctx.drawImage(getTankBlastSprite('smoke', i % 2), -size * 0.58, -size * 0.58, size * 1.16, size * 1.16);
        const fire = Math.max(0, 1 - age / (0.38 + variation * 0.22));
        ctx.globalAlpha = fire * fade;
        ctx.drawImage(getTankBlastSprite('fire', i % 2), -size / 2, -size / 2, size, size);
        ctx.globalAlpha = fire * fade * Math.min(1, age * 6);
        ctx.drawImage(getTankBlastSprite('ember', i % 2), -size / 2, -size / 2, size, size);
        ctx.restore();
    }
    if (progress < 0.17) {
        const size = radius * (0.3 + expansion * 0.6);
        ctx.globalCompositeOperation = 'screen';
        ctx.globalAlpha = (1 - progress / 0.17) * 0.95;
        ctx.drawImage(getOrdnanceExplosionSprite('flash'), -size, -size, size * 2, size * 2);
        ctx.globalCompositeOperation = 'source-over';
    }
    // Fine incandescent streaks cool before the smoke clears.
    for (let i = 0; i < 24 && progress < 0.7; i++) {
        const angle = seed + i * 2.39996, speed = 0.65 + (i % 5) * 0.15;
        const distance = radius * speed * (1 - Math.exp(-progress * 5));
        const x = Math.cos(angle) * distance, y = Math.sin(angle) * distance + radius * progress * progress * 0.3;
        const trail = radius * (0.03 + progress * 0.12);
        ctx.globalAlpha = Math.pow(1 - progress / 0.7, 1.5);
        ctx.strokeStyle = i % 3 ? '#ffbe64' : '#fff2c4'; ctx.lineWidth = Math.max(0.7, radius * 0.009);
        ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - Math.cos(angle) * trail, y - Math.sin(angle) * trail); ctx.stroke();
    }
    ctx.restore();
}

function getOrdnanceExplosionSprite(kind, color = '') {
    const key = kind + color;
    if (ordnanceExplosionSprites.has(key)) return ordnanceExplosionSprites.get(key);
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 128;
    const c = canvas.getContext('2d');
    if (kind === 'flash') {
        const flash = c.createRadialGradient(64, 64, 0, 64, 64, 64);
        flash.addColorStop(0, 'rgba(255,252,228,1)');
        flash.addColorStop(0.22, 'rgba(255,232,166,0.95)');
        flash.addColorStop(0.55, 'rgba(255,177,65,0.4)');
        flash.addColorStop(1, 'rgba(255,125,30,0)');
        c.fillStyle = flash; c.fillRect(0, 0, 128, 128);
        ordnanceExplosionSprites.set(key, canvas);
        return canvas;
    }
    const colors = kind === 'tankSmoke' ? ['rgba(102,109,107,0.65)', 'rgba(45,51,50,0.58)', 'rgba(29,34,32,0)']
        : kind === 'smoke' ? ['rgba(96,87,76,0.8)', 'rgba(58,53,48,0.65)', 'rgba(34,32,30,0)']
        : kind === 'ember' ? ['#ffc15e', '#db5c1d', 'rgba(94,35,19,0)']
        : kind === 'tint' ? [color, color, 'rgba(0,0,0,0)']
        : ['#fff0b9', '#ffac39', 'rgba(163,48,16,0)'];
    // Bake an uneven, billowing silhouette once instead of rebuilding gradients every frame.
    for (let i = 0; i < 8; i++) {
        const angle = i * Math.PI / 4;
        const reach = 17 + Math.sin(i * 3.7) * 5;
        const x = 64 + Math.cos(angle) * reach, y = 64 + Math.sin(angle) * reach;
        const radius = 29 + Math.sin(i * 2.3) * 5;
        const grad = c.createRadialGradient(x - 5, y - 7, 1, x, y, radius);
        grad.addColorStop(0, colors[0]);
        grad.addColorStop(0.38, colors[1]);
        grad.addColorStop(1, colors[2]);
        c.fillStyle = grad; c.beginPath(); c.arc(x, y, radius, 0, Math.PI * 2); c.fill();
    }
    const core = c.createRadialGradient(61, 59, 0, 64, 64, 36);
    core.addColorStop(0, colors[0]); core.addColorStop(0.45, colors[1]); core.addColorStop(1, colors[2]);
    c.fillStyle = core; c.beginPath(); c.arc(64, 64, 36, 0, Math.PI * 2); c.fill();
    ordnanceExplosionSprites.set(key, canvas);
    return canvas;
}

function drawOrdnanceExplosion(ctx, obj) {
    const progress = Math.max(0, Math.min(1, 1 - obj.life / (obj.maxLife || 30)));
    if (progress >= 1) return;
    const radius = obj.radius || 40;
    const growth = 1 - Math.exp(-progress * 9);
    let art = ordnanceExplosionArt.get(obj);
    if (!art) {
        let seed = Math.floor(Math.abs(obj.seed ?? (obj.x * 0.17 + obj.y * 0.31)) * 1000000) >>> 0;
        const random = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; };
        const count = obj.explosionStyle === 'barrel' ? 10 : obj.explosionStyle === 'impact' ? 5 : 7;
        art = { clouds: [], fragments: [] };
        for (let i = 0; i < count; i++) {
            const angle = i * Math.PI * 2 / count + random() * 0.4;
            const distance = 0.16 + random() * 0.22;
            art.clouds.push({ x: Math.cos(angle) * distance, y: Math.sin(angle) * distance,
                scale: 0.6 + random() * 0.35, angle: random() * Math.PI * 2, roll: (random() - 0.5) * 0.7 });
        }
        const fragmentCount = obj.explosionStyle === 'barrel' ? 20 : obj.explosionStyle === 'impact' ? 7 : 12;
        for (let i = 0; i < fragmentCount; i++) {
            const angle = random() * Math.PI * 2;
            art.fragments.push({ x: Math.cos(angle), y: Math.sin(angle), reach: 0.65 + random() * 0.65,
                size: 0.5 + random(), spin: (random() - 0.5) * 8 });
        }
        ordnanceExplosionArt.set(obj, art);
    }
    ctx.save(); ctx.translate(obj.x, obj.y);
    if (obj.color) {
        // Ability and gas bursts keep their own palette, with a translucent turbulent edge.
        const tint = getOrdnanceExplosionSprite('tint', obj.color);
        const r = radius * (0.12 + growth * 0.88);
        ctx.globalAlpha = (1 - progress) * 0.35;
        ctx.drawImage(tint, -r, -r, r * 2, r * 2);
        ctx.globalAlpha = Math.pow(1 - progress, 2) * 0.75;
        ctx.strokeStyle = obj.color; ctx.lineWidth = Math.max(1, radius * 0.012 * (1 - progress));
        ctx.beginPath(); ctx.arc(0, 0, r * 0.88, 0, Math.PI * 2); ctx.stroke();
        ctx.lineWidth *= 0.5;
        ctx.beginPath(); ctx.arc(0, 0, r * 0.67, 0, Math.PI * 2); ctx.stroke();
        ctx.restore();
        return;
    }
    const smoke = getOrdnanceExplosionSprite('smoke');
    const fire = getOrdnanceExplosionSprite('fire');
    const ember = getOrdnanceExplosionSprite('ember');
    const hotMix = Math.max(0, 1 - progress / 0.4);
    const smokeAlpha = Math.min(1, Math.max(0, (progress - 0.1) / 0.22)) * Math.pow(1 - progress, 0.7) * 0.7;
    const fireAlpha = Math.max(0, 1 - progress / 0.62);
    if (smokeAlpha > 0) for (const cloud of art.clouds) {
        const x = cloud.x * radius * growth, y = cloud.y * radius * growth;
        const smokeSize = radius * cloud.scale * (0.55 + growth * 0.65 + progress * 0.2);
        ctx.globalAlpha = smokeAlpha;
        ctx.drawImage(smoke, x - smokeSize / 2, y - smokeSize / 2 - radius * progress * 0.18, smokeSize, smokeSize);
    }
    // Pressure wave is brief and soft; it does not add another simulated object.
    if (progress < 0.55) {
        ctx.globalAlpha = Math.pow(1 - progress / 0.55, 2) * 0.42;
        ctx.strokeStyle = '#e9cf9f'; ctx.lineWidth = Math.max(0.6, radius * 0.035 * (1 - progress));
        ctx.beginPath(); ctx.arc(0, 0, radius * (0.15 + progress * 1.9), 0, Math.PI * 2); ctx.stroke();
    }
    if (fireAlpha > 0) for (const cloud of art.clouds) {
        const size = radius * cloud.scale * (0.35 + growth * 0.85);
        ctx.save();
        ctx.translate(cloud.x * radius * growth, cloud.y * radius * growth);
        ctx.rotate(cloud.angle + progress * cloud.roll);
        ctx.globalAlpha = fireAlpha * (1 - hotMix) * 0.9;
        ctx.drawImage(ember, -size / 2, -size / 2, size, size);
        if (hotMix > 0) {
            ctx.globalAlpha = fireAlpha * hotMix * 0.9;
            ctx.drawImage(fire, -size / 2, -size / 2, size, size);
        }
        ctx.restore();
    }
    // A hot initial core gives way to the separate fire lobes and cooling smoke.
    if (progress < 0.2) {
        const core = radius * (0.22 + growth * 0.32);
        ctx.globalAlpha = (1 - progress / 0.2) * 0.9;
        ctx.drawImage(getOrdnanceExplosionSprite('flash'), -core, -core, core * 2, core * 2);
    }
    for (let i = 0; i < art.fragments.length; i++) {
        const fragment = art.fragments[i];
        const distance = radius * fragment.reach * (1 - Math.exp(-progress * 5));
        const x = fragment.x * distance, y = fragment.y * distance + radius * progress * progress * 0.12;
        if (i % 3 === 0) {
            ctx.save(); ctx.translate(x, y); ctx.rotate(fragment.spin * progress);
            ctx.globalAlpha = Math.pow(1 - progress, 1.4) * 0.85;
            ctx.fillStyle = '#3d2c22';
            const size = Math.max(1, radius * 0.025) * fragment.size;
            ctx.fillRect(-size / 2, -size / 3, size, size * 0.65); ctx.restore();
        } else if (progress < 0.65) {
            ctx.globalAlpha = Math.pow(1 - progress / 0.65, 1.5);
            ctx.strokeStyle = i % 2 ? '#ffd58a' : '#ed8d36';
            ctx.lineWidth = Math.max(0.6, radius * 0.008) * fragment.size;
            const trail = radius * 0.08 * (1 - progress);
            ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - fragment.x * trail, y - fragment.y * trail); ctx.stroke();
        }
    }
    ctx.restore();
}

const terrainDebrisWoodPalettes = {
    forest: ['#976b40', '#503922', '#cca273'], rain: ['#715333', '#382d21', '#a38960'],
    snow: ['#c7b793', '#756b54', '#ede0bd'], desert: ['#ab704a', '#633f2d', '#d6a67b'],
    swamp: ['#7b644a', '#3f392c', '#ad9873'], lava: ['#403830', '#211e1b', '#76624b']
};

function drawTerrainDebris(ctx, obj) {
    const age = Math.max(0, (obj.maxLife || 44) - obj.life);
    const flight = Math.min(1, age / 18);
    const travel = 1 - Math.pow(1 - flight, 3);
    const fade = Math.min(1, Math.max(0, obj.life / 14));
    const wood = obj.material === 'wood' || obj.material === 'ice';
    const colors = obj.material === 'rot' ? ['#554d31', '#302c20', '#798052'] : obj.charred ? ['#3e352a', '#231f1b', '#766851'] : wood
        ? (terrainDebrisWoodPalettes[obj.biome] || terrainDebrisWoodPalettes.forest)
        : ['#797c7b', '#373b3b', '#b5b7af'];
    ctx.save(); ctx.translate(obj.x, obj.y);
    const dustFade = Math.max(0, 1 - age / 14);
    if (dustFade > 0) {
        const color = obj.charred ? 'rgba(65,60,52,0.5)' : wood ? 'rgba(166,128,80,0.4)' : 'rgba(160,157,146,0.5)';
        const size = obj.dustSize * (0.7 + travel * 1.2);
        ctx.globalAlpha = dustFade * 0.65;
        ctx.drawImage(getOrdnanceExplosionSprite('tint', color), obj.dustX - size / 2, obj.dustY - size / 2, size, size);
    }
    for (const fragment of obj.fragments) {
        const x = fragment.x + fragment.dx * travel;
        const groundY = fragment.y + fragment.dy * travel;
        const lift = Math.sin(flight * Math.PI) * fragment.lift;
        ctx.globalAlpha = fade * 0.15;
        ctx.fillStyle = '#181a16';
        ctx.beginPath(); ctx.ellipse(x, groundY + 2, fragment.size * 0.48, Math.max(1, fragment.thickness * 0.4), fragment.angle + fragment.spin * flight, 0, Math.PI * 2); ctx.fill();
        ctx.save(); ctx.translate(x, groundY - lift); ctx.rotate(fragment.angle + fragment.spin * flight);
        ctx.globalAlpha = fade;
        const length = fragment.size, width = fragment.thickness;
        ctx.fillStyle = colors[0]; ctx.strokeStyle = colors[1]; ctx.lineWidth = 0.6;
        ctx.beginPath(); ctx.moveTo(-length * 0.5, -width * 0.4);
        if (wood) {
            ctx.lineTo(length * 0.55, -width * 0.5);
            ctx.lineTo(length * 0.32, -width * 0.05);
            ctx.lineTo(length * 0.44, width * 0.2);
            ctx.lineTo(-length * 0.35, width * 0.5);
        } else {
            ctx.lineTo(length * 0.15, -width * 0.65);
            ctx.lineTo(length * 0.55, -width * 0.1);
            ctx.lineTo(length * 0.22, width * 0.55);
            ctx.lineTo(-length * 0.42, width * 0.3);
        }
        ctx.closePath(); ctx.fill(); ctx.stroke();
        if (obj.material === 'ice') { ctx.fillStyle = 'rgba(155,225,244,0.7)'; ctx.fill(); }
        ctx.strokeStyle = colors[2]; ctx.lineWidth = 0.65;
        ctx.beginPath(); ctx.moveTo(-length * 0.32, -width * 0.15);
        ctx.lineTo(length * 0.26, -width * (wood ? 0.15 : 0.34)); ctx.stroke();
        ctx.restore();
    }
    ctx.restore();
}

const wallBreakShapes = new WeakMap();

function getWoodWallSurfaceDamage(obj) {
    const totalDamage = Math.max(0, Math.min(1, 1 - (obj.hp ?? 300) / (obj.maxHp || 300)));
    if (totalDamage <= 0) return null;
    const marks = (obj.woodHitPoints || []).filter(mark => mark.active !== false);
    if (!marks.length && (obj.woodRotAmount || (obj.woodHitPoints || []).length)) return { splits: [], dents: [] };
    const damage = marks.length ? Math.max(...marks.map(mark => mark.damage ?? totalDamage)) : totalDamage;
    if (marks.some(mark => mark.impactStrength != null)) {
        const horizontal = obj.w >= obj.h;
        const length = horizontal ? obj.w : obj.h, breadth = horizontal ? obj.h : obj.w;
        const splits = [], dents = [];
        for (const mark of marks) {
            if (mark.effect === 'ice' || mark.effect === 'rot') continue;
            const strength = mark.impactStrength ?? mark.damage ?? 0;
            const x = Math.max(1, Math.min(obj.w - 1, mark.x * obj.w));
            const y = Math.max(1, Math.min(obj.h - 1, mark.y * obj.h));
            dents.push({ x, y, horizontal, length: Math.min(28, breadth * (0.025 + Math.sqrt(strength) * 0.78)), width: 0.5 + strength * 7 });
            if (strength > 0.075) splits.push({ x, y, horizontal,
                length: Math.min(65, length * (0.05 + strength * 0.45)), width: 0.3 + strength * 1.6 });
        }
        return { splits, dents };
    }
    const horizontal = obj.w >= obj.h;
    const length = horizontal ? obj.w : obj.h, breadth = horizontal ? obj.h : obj.w;
    const boards = Math.max(2, Math.min(8, Math.round(breadth / 16)));
    const splits = [], dents = [];
    for (let i = 0; i < boards; i++) {
        const raw = Math.sin(obj.x * 0.13 + obj.y * 0.19 + i * 4.71) * 43758.5453;
        const variation = raw - Math.floor(raw);
        const severity = Math.max(0, (damage - (i % 3) * 0.06) / 0.94);
        if (severity <= 0.1) continue;
        const across = (i + 0.5) * breadth / boards;
        splits.push({ x: horizontal ? length * (0.35 + variation * 0.3) : across,
            y: horizontal ? across : length * (0.35 + variation * 0.3), horizontal,
            length: length * (0.12 + severity * 0.2), width: 0.5 + severity * 1.4 });
    }
    for (const mark of marks.slice(-5).filter(mark => mark.effect !== 'ice' && mark.effect !== 'rot')) {
        dents.push({ x: Math.max(5, Math.min(obj.w - 5, mark.x * obj.w)),
            y: Math.max(5, Math.min(obj.h - 5, mark.y * obj.h)), horizontal,
            length: Math.min(24, length * (0.1 + damage * 0.12)), width: 2 + damage * 3.5 });
    }
    return { splits, dents };
}

function getWallBreakShape(obj, wood = false) {
    const damage = wood ? Math.max(0, Math.min(1, 1 - (obj.hp ?? 300) / (obj.maxHp || 300)))
        : Math.min(5, obj.wallDamageCount || 0) / 6;
    if (damage <= 0) return null;
    const marks = (wood ? obj.woodHitPoints : obj.wallHitPoints) || [];
    const stage = wood ? Math.ceil(damage * 15) : obj.wallDamageCount;
    const key = `${wood ? 'wood' : 'stone'}:${obj.w}:${obj.h}:${stage}:${marks.length}:${wood ? obj.woodDamageVersion || 0 : 0}`;
    const saved = wallBreakShapes.get(obj);
    if (saved && saved.key === key) return saved;
    const w = obj.w, h = obj.h, breadth = Math.min(w, h);
    const cuts = [], splits = [];
    const count = wood ? marks.length : Math.max(1, marks.length || obj.wallDamageCount);
    for (let i = 0; i < count; i++) {
        const mark = marks[i] || (wood ? obj.woodBurnOrigin || { x: 0.2 + i * 0.26, y: 0 } : { x: 0, y: 0.3 + i * 0.13 });
        if (mark.active === false || mark.effect === 'rot') continue;
        const distances = [mark.y * h, (1 - mark.x) * w, (1 - mark.y) * h, mark.x * w];
        const side = distances.indexOf(Math.min(...distances));
        const length = side % 2 ? h : w;
        const center = (side % 2 ? mark.y : mark.x) * length;
        const cutDamage = wood && mark.damage != null ? mark.damage : damage;
        const strength = wood ? mark.impactStrength : null;
        const depth = breadth * (strength != null ? 0.004 + Math.pow(strength, 0.8) * 0.5 : 0.09 + cutDamage * 0.42);
        cuts.push({ side, center, depth: depth * (0.9 + (i % 3) * 0.1),
            span: breadth * (strength != null ? 0.02 + Math.sqrt(strength) * 0.6 : 0.16 + cutDamage * 0.28), effect: mark.effect || 'wood', phase: i * 2.7 + obj.x * 0.07 + obj.y * 0.03 });
    }
    const points = [], rims = [];
    for (let side = 0; side < 4; side++) {
        const length = side % 2 ? h : w;
        const steps = Math.max(12, Math.min(60, Math.ceil(length / 2.5)));
        for (let step = 0; step <= steps; step++) {
            const along = length * (side < 2 ? step / steps : 1 - step / steps);
            let bite = 0, effect = 'wood';
            for (const cut of cuts) {
                if (cut.side !== side) continue;
                const distance = Math.abs(along - cut.center) / cut.span;
                if (distance >= 1) continue;
                const roughness = 0.78 + Math.sin(step * 2.6 + cut.phase) * 0.15;
                const candidate = cut.depth * Math.pow(1 - distance, 0.55) * roughness;
                if (candidate > bite) { bite = candidate; effect = cut.effect; }
            }
            // Keep the corners joined while the edge loses irregular chunks.
            bite *= Math.min(1, along / 3, (length - along) / 3);
            const point = side === 0 ? { x: along, y: bite } : side === 1 ? { x: w - bite, y: along }
                : side === 2 ? { x: along, y: h - bite } : { x: bite, y: along };
            points.push(point);
            if (bite > 1.2) rims.push({ ...point, side, bite, effect });
        }
    }
    const surface = wood ? getWoodWallSurfaceDamage(obj) : { splits, dents: [] };
    const shape = { key, points, rims, splits: surface.splits, dents: surface.dents, wood, damage };
    wallBreakShapes.set(obj, shape);
    return shape;
}

function clipWallBreakShape(ctx, obj, shape) {
    if (!shape) return;
    ctx.beginPath();
    shape.points.forEach((point, index) => index
        ? ctx.lineTo(obj.x + point.x, obj.y + point.y) : ctx.moveTo(obj.x + point.x, obj.y + point.y));
    ctx.closePath(); ctx.clip();
}

function drawWallBrokenEdges(ctx, obj, shape) {
    if (!shape) return;
    const type = typeof GameTerrain !== 'undefined' && typeof GameTerrain.current === 'function' ? GameTerrain.current() : 'forest';
    const colors = terrainDebrisWoodPalettes[type] || terrainDebrisWoodPalettes.forest;
    ctx.save(); ctx.translate(obj.x, obj.y);
    const trace = () => {
        ctx.beginPath();
        shape.points.forEach((point, index) => index ? ctx.lineTo(point.x, point.y) : ctx.moveTo(point.x, point.y));
        ctx.closePath();
    };
    trace();
    ctx.strokeStyle = shape.wood ? colors[1] : '#242827';
    ctx.lineWidth = 1.1; ctx.stroke();
    if (shape.wood) {
        ctx.save(); trace(); ctx.clip();
        for (const dent of shape.dents) {
            ctx.save(); ctx.translate(dent.x, dent.y);
            if (!dent.horizontal) ctx.rotate(Math.PI / 2);
            ctx.fillStyle = colors[1];
            ctx.beginPath(); ctx.moveTo(-dent.length * 0.5, -dent.width * 0.3);
            ctx.lineTo(-dent.length * 0.15, -dent.width * 0.55);
            ctx.lineTo(dent.length * 0.5, -dent.width * 0.12);
            ctx.lineTo(dent.length * 0.23, dent.width * 0.45);
            ctx.lineTo(-dent.length * 0.4, dent.width * 0.3); ctx.closePath(); ctx.fill();
            ctx.strokeStyle = colors[2]; ctx.lineWidth = 0.8;
            for (let fibre = 0; fibre < 3; fibre++) {
                const y = (fibre - 1) * dent.width * 0.2;
                ctx.beginPath(); ctx.moveTo(-dent.length * 0.4, y);
                ctx.lineTo(dent.length * (0.05 + fibre * 0.1), y + 0.5); ctx.stroke();
            }
            ctx.restore();
        }
        for (const split of shape.splits) {
            ctx.save(); ctx.translate(split.x, split.y);
            if (!split.horizontal) ctx.rotate(Math.PI / 2);
            ctx.fillStyle = '#342315';
            ctx.beginPath(); ctx.moveTo(-split.length / 2, 0);
            ctx.lineTo(-split.length * 0.12, -split.width);
            ctx.lineTo(split.length / 2, 0);
            ctx.lineTo(split.length * 0.18, split.width * 0.7); ctx.closePath(); ctx.fill();
            ctx.strokeStyle = colors[2]; ctx.lineWidth = 0.65;
            ctx.beginPath(); ctx.moveTo(-split.length / 2, -0.5);
            ctx.lineTo(-split.length * 0.12, -split.width - 0.5);
            ctx.lineTo(split.length * 0.35, -0.5); ctx.stroke();
            ctx.restore();
        }
        ctx.restore();
    }
    for (let i = 0; i < shape.rims.length; i++) {
        const point = shape.rims[i];
        const inwardX = point.side === 1 ? -1 : point.side === 3 ? 1 : 0;
        const inwardY = point.side === 0 ? 1 : point.side === 2 ? -1 : 0;
        if (shape.wood && point.effect === 'rot') {
            ctx.fillStyle = i % 2 ? '#39402b' : '#6b7050';
            ctx.beginPath(); ctx.arc(point.x, point.y, 1.3 + i % 3, 0, Math.PI * 2); ctx.fill();
        } else if (shape.wood && point.effect === 'ice') {
            ctx.fillStyle = colors[1];
            ctx.beginPath(); ctx.moveTo(point.x, point.y); ctx.lineTo(point.x + inwardX * 3 - inwardY * 2, point.y + inwardY * 3 + inwardX * 2); ctx.lineTo(point.x + inwardX * 4 + inwardY * 2, point.y + inwardY * 4 - inwardX * 2); ctx.closePath(); ctx.fill();
        } else if (shape.wood) {
            // Unequal wood fibres protrude from the torn board ends into the missing section.
            const fibre = 2 + (i % 4) * 1.2;
            ctx.strokeStyle = i % 3 ? colors[2] : colors[1];
            ctx.lineWidth = i % 3 ? 0.75 : 1.1;
            ctx.beginPath(); ctx.moveTo(point.x + inwardX, point.y + inwardY);
            ctx.lineTo(point.x - inwardX * fibre + inwardY * 0.7, point.y - inwardY * fibre + inwardX * 0.7); ctx.stroke();
        } else if (i % 2 === 0) {
            // Small exposed fracture planes give the missing stone a solid, chipped rim.
            ctx.fillStyle = i % 4 ? '#626967' : '#929893';
            ctx.beginPath(); ctx.moveTo(point.x - inwardY * 1.5, point.y + inwardX * 1.5);
            ctx.lineTo(point.x + inwardX * 2.5, point.y + inwardY * 2.5);
            ctx.lineTo(point.x + inwardY * 1.5, point.y - inwardX * 1.5); ctx.closePath(); ctx.fill();
        }
    }
    ctx.restore();
}

function drawHistoricalProjectile(ctx, b, angleOverride = null) {
    if (b.type === 'romanBlade') {
            // Roman gladius — solid iron short-sword spinning in flight
            ctx.save();
            ctx.translate(b.x, b.y);
            ctx.rotate(angleOverride ?? b.spinAngle ?? 0);

            const bLen = (b.w || 14) * 0.95; // half-length from centre to tip
            const bWid = bLen * 0.28;         // max half-width at blade shoulder

            // === Blade body (iron/steel, flat faces) ===
            // Left side: straight back edge, right side: double-edged taper to point
            ctx.beginPath();
            ctx.moveTo( bLen, 0);                      // front tip
            ctx.lineTo( bLen * 0.55,  bWid);           // upper shoulder
            ctx.lineTo(-bLen * 0.38,  bWid * 0.72);    // upper back edge
            ctx.lineTo(-bLen * 0.38, -bWid * 0.72);    // lower back edge
            ctx.lineTo( bLen * 0.55, -bWid);           // lower shoulder
            ctx.closePath();
            const bladeGrad = ctx.createLinearGradient(0, -bWid, 0, bWid);
            bladeGrad.addColorStop(0,   '#8a9aaa');   // upper edge (lighter)
            bladeGrad.addColorStop(0.3, '#b0c0cc');   // upper bevel
            bladeGrad.addColorStop(0.5, '#d8e4e8');   // Fuller / central highlight
            bladeGrad.addColorStop(0.7, '#8a9aaa');   // lower bevel
            bladeGrad.addColorStop(1,   '#5c6a74');   // lower edge (shadow)
            ctx.fillStyle = bladeGrad;
            ctx.fill();

            // Central fuller (ridge line)
            ctx.strokeStyle = 'rgba(255,255,255,0.55)';
            ctx.lineWidth = 0.9;
            ctx.beginPath();
            ctx.moveTo(bLen * 0.92, 0);
            ctx.lineTo(-bLen * 0.3, 0);
            ctx.stroke();

            // Blade outline
            ctx.strokeStyle = '#3d4a52';
            ctx.lineWidth = 0.7;
            ctx.beginPath();
            ctx.moveTo( bLen, 0);
            ctx.lineTo( bLen * 0.55,  bWid);
            ctx.lineTo(-bLen * 0.38,  bWid * 0.72);
            ctx.lineTo(-bLen * 0.38, -bWid * 0.72);
            ctx.lineTo( bLen * 0.55, -bWid);
            ctx.closePath();
            ctx.stroke();

            // === Crossguard (gold horizontal bar) ===
            const gW = bWid * 0.28;
            const gH = bWid * 1.55;
            ctx.fillStyle = '#D4A017';
            ctx.fillRect(-bLen * 0.38 - gW, -gH / 2, gW * 2, gH);
            ctx.strokeStyle = '#8B6914';
            ctx.lineWidth = 0.6;
            ctx.strokeRect(-bLen * 0.38 - gW, -gH / 2, gW * 2, gH);

            // === Handle (dark red leather wrapping) ===
            const handleLen = bLen * 0.42;
            const handleH   = bWid * 0.65;
            ctx.fillStyle = '#6B1010';
            ctx.fillRect(-bLen * 0.38 - gW - handleLen, -handleH / 2, handleLen, handleH);
            // Wrapping bands
            ctx.strokeStyle = '#3a0808';
            ctx.lineWidth = 0.8;
            for (let bi = 1; bi <= 3; bi++) {
                const bx = -bLen * 0.38 - gW - handleLen * (bi / 4);
                ctx.beginPath();
                ctx.moveTo(bx, -handleH / 2);
                ctx.lineTo(bx,  handleH / 2);
                ctx.stroke();
            }
            // Pommel cap
            const pomR = handleH * 0.72;
            ctx.fillStyle = '#D4A017';
            ctx.beginPath();
            ctx.arc(-bLen * 0.38 - gW - handleLen, 0, pomR, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#8B6914';
            ctx.lineWidth = 0.6;
            ctx.stroke();

            ctx.restore();

        } else if (b.type === 'egyptArrow' || b.type === 'romanPilum') {
            ctx.save();
            ctx.translate(b.x, b.y);
            ctx.rotate(angleOverride ?? Math.atan2(b.vy, b.vx));

            const shaftLen = Math.max(9, (b.w || 10) * 1.55);
            const shaftH = Math.max(1.6, (b.h || 4) * 0.4);
            const shaftX = -shaftLen * 0.35;

            const shaftGrad = ctx.createLinearGradient(shaftX, 0, shaftX + shaftLen, 0);
            shaftGrad.addColorStop(0, '#7a5220');
            shaftGrad.addColorStop(0.5, '#a3702d');
            shaftGrad.addColorStop(1, '#5b3b12');
            ctx.fillStyle = shaftGrad;
            ctx.fillRect(shaftX, -shaftH / 2, shaftLen, shaftH);

            ctx.fillStyle = '#d9b25b';
            ctx.beginPath();
            ctx.moveTo(shaftX + shaftLen, -shaftH * 1.6);
            ctx.lineTo(shaftX + shaftLen + shaftLen * 0.28, 0);
            ctx.lineTo(shaftX + shaftLen, shaftH * 1.6);
            ctx.closePath();
            ctx.fill();

            ctx.fillStyle = '#f8e7b2';
            ctx.beginPath();
            ctx.moveTo(shaftX + shaftLen, -shaftH);
            ctx.lineTo(shaftX + shaftLen + shaftLen * 0.18, 0);
            ctx.lineTo(shaftX + shaftLen, shaftH);
            ctx.closePath();
            ctx.fill();

            ctx.strokeStyle = '#6b4a18';
            ctx.lineWidth = 1;
            ctx.strokeRect(shaftX, -shaftH / 2, shaftLen, shaftH);

            ctx.strokeStyle = 'rgba(255,241,191,0.7)';
            ctx.beginPath();
            ctx.moveTo(shaftX + shaftLen * 0.15, 0);
            ctx.lineTo(shaftX + shaftLen * 0.92, 0);
            ctx.stroke();

            ctx.fillStyle = '#8f6720';
            ctx.beginPath();
            ctx.moveTo(shaftX - shaftLen * 0.16, 0);
            ctx.lineTo(shaftX, -shaftH * 1.45);
            ctx.lineTo(shaftX + shaftLen * 0.08, 0);
            ctx.lineTo(shaftX, shaftH * 1.45);
            ctx.closePath();
            ctx.fill();

            ctx.restore();

        } else if (b.type === 'spartanSpear') {
            // Spartan spear bullet — elongated bronze shaft with iron tip
            ctx.save();
            ctx.translate(b.x, b.y);
            ctx.rotate(angleOverride ?? Math.atan2(b.vy, b.vx));

            const sLen = 22;  // half-length from center to tip
            const sH   = 3;   // half-height

            // Wooden shaft
            ctx.fillStyle = '#8b5a2b';
            ctx.fillRect(-sLen, -sH/2, sLen * 1.35, sH);

            // Bronze wrap bands
            ctx.strokeStyle = '#c89050';
            ctx.lineWidth = 1;
            for (let bi = 0; bi < 2; bi++) {
                const bx = -sLen + sLen * (0.3 + bi * 0.45);
                ctx.beginPath();
                ctx.moveTo(bx, -sH/2);
                ctx.lineTo(bx,  sH/2);
                ctx.stroke();
            }

            // Iron tip (triangle)
            ctx.fillStyle = '#c8d0d8';
            ctx.beginPath();
            ctx.moveTo(sLen * 0.35, -sH * 1.5);
            ctx.lineTo(sLen,         0);
            ctx.lineTo(sLen * 0.35,  sH * 1.5);
            ctx.closePath();
            ctx.fill();
            ctx.strokeStyle = '#6a7880';
            ctx.lineWidth = 0.7;
            ctx.stroke();

            ctx.restore();


    }
}

function drawEmbeddedProjectiles(ctx, target, centered = true) {
    if (!target.embeddedProjectiles) return;
    for (const mark of target.embeddedProjectiles) {
        if (!mark.permanent && !(mark.life > 0)) continue;
        const settle = Math.min(1, (mark.age || 0) / 6);
        const depth = (mark.type === 'egyptArrow' || mark.type === 'romanPilum') ? 5 : mark.type === 'spartanSpear' ? 8 : mark.tip * 0.38;
        const exposedTip = mark.tip - depth * (0.65 + settle * 0.35);
        ctx.save();
        if (centered && typeof GameTerrain !== 'undefined' && GameTerrain.getMotion) ctx.rotate((GameTerrain.getMotion(target).angle || 0) - (mark.bodyAngle || 0));
        ctx.translate((centered ? 0 : target.x + target.w / 2) + mark.x, (centered ? 0 : target.y + target.h / 2) + mark.y);
        ctx.rotate(mark.angle);
        ctx.globalAlpha = mark.permanent ? 1 : Math.min(1, mark.life / 10);
        // The surface hides the buried tip; the full-size shaft stays outside the entry hole.
        ctx.fillStyle = 'rgba(20,17,13,0.85)';
        ctx.beginPath(); ctx.ellipse(0, 0, 1.7, mark.type === 'spartanSpear' ? 3.4 : 2.2, 0, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.rect(-160, -80, 160.2, 160); ctx.clip();
        ctx.translate(-exposedTip, 0);
        ctx.shadowColor = 'rgba(10,12,10,0.45)'; ctx.shadowOffsetY = 1; ctx.shadowBlur = 1;
        drawHistoricalProjectile(ctx, { ...mark, x: 0, y: 0, vx: 1, vy: 0 }, 0);
        ctx.restore();
    }
}

const woodIceArt = new WeakMap();
function getWoodIceArt(impact) {
    let art = woodIceArt.get(impact);
    if (art) return art;
    const seed = impact.hitX * 1.27 + impact.hitY * 0.79 + impact.x * 0.13 + impact.y * 0.31;
    const rand = i => { const n = Math.sin(seed + i * 19.13) * 43758.5453; return n - Math.floor(n); };
    const radius = Math.max(14, Math.min(25, Math.min(impact.w, impact.h) * 0.57));
    let outline = Array.from({ length: 20 }, (_, i) => {
        const angle = i / 20 * Math.PI * 2;
        const r = radius * (0.78 + rand(i) * 0.22);
        return { x: Math.cos(angle) * r, y: Math.sin(angle) * r * 0.88 };
    });
    const clip = (polygon, nx, ny, limit) => {
        const result = [];
        for (let i = 0; i < polygon.length; i++) {
            const a = polygon[i], b = polygon[(i + 1) % polygon.length];
            const da = a.x * nx + a.y * ny - limit, db = b.x * nx + b.y * ny - limit;
            if (da <= 0) result.push(a);
            if ((da < 0 && db > 0) || (da > 0 && db < 0)) {
                const t = da / (da - db);
                result.push({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t });
            }
        }
        return result;
    };
    // Shards come only from wood actually coated by the impact, even at an edge.
    outline = clip(outline, -1, 0, impact.hitX);
    outline = clip(outline, 1, 0, impact.w - impact.hitX);
    outline = clip(outline, 0, -1, impact.hitY);
    outline = clip(outline, 0, 1, impact.h - impact.hitY);
    const centers = Array.from({ length: 7 }, (_, i) => ({ x: (rand(70 + i) - 0.5) * radius * 1.7, y: (rand(90 + i) - 0.5) * radius * 1.6 }));
    const shards = centers.map((center, index) => {
        let points = outline;
        for (let j = 0; j < centers.length; j++) {
            if (j === index) continue;
            const other = centers[j];
            points = clip(points, other.x - center.x, other.y - center.y,
                (other.x * other.x + other.y * other.y - center.x * center.x - center.y * center.y) / 2);
        }
        return { points, center };
    }).filter(shard => shard.points.length >= 3);
    const size = Math.ceil(radius * 2 + 6), half = size / 2;
    const image = document.createElement('canvas'); image.width = image.height = size;
    const c = image.getContext('2d'); c.translate(half, half);
    const trace = (ctx, points) => {
        ctx.beginPath(); points.forEach((p, i) => i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)); ctx.closePath();
    };
    trace(c, outline); c.clip();
    const frost = c.createLinearGradient(-radius, -radius, radius, radius);
    frost.addColorStop(0, 'rgba(222,240,239,0.74)'); frost.addColorStop(0.32, 'rgba(154,194,206,0.6)');
    frost.addColorStop(0.65, 'rgba(111,168,185,0.47)'); frost.addColorStop(1, 'rgba(198,223,227,0.67)');
    c.fillStyle = frost; c.fillRect(-half, -half, size, size);
    for (let i = 0; i < 65; i++) {
        const x = (rand(120 + i) - 0.5) * radius * 2, y = (rand(220 + i) - 0.5) * radius * 2;
        c.fillStyle = i % 4 ? 'rgba(235,249,247,0.28)' : 'rgba(83,133,151,0.2)';
        c.fillRect(x, y, 0.5 + rand(320 + i), 0.5 + rand(420 + i));
        if (i % 6 === 0) {
            c.strokeStyle = 'rgba(234,248,246,0.45)'; c.lineWidth = 0.55;
            c.beginPath(); c.moveTo(x - 2, y + 3); c.lineTo(x, y); c.lineTo(x + 2, y - 4);
            c.moveTo(x - 1, y + 1); c.lineTo(x - 4, y); c.moveTo(x + 1, y - 2); c.lineTo(x + 3, y - 1); c.stroke();
        }
    }
    trace(c, outline); c.strokeStyle = 'rgba(225,247,245,0.9)'; c.lineWidth = 1; c.stroke();
    art = { outline, shards, radius, image, half, trace };
    woodIceArt.set(impact, art);
    return art;
}

const woodWallDeathArt = new WeakMap();
function getWoodWallDeathArt(effect, frozen) {
    let art = woodWallDeathArt.get(effect);
    if (art) return art;
    const wall = effect.wall, w = effect.w, h = effect.h;
    const seed = effect.x * 0.23 + effect.y * 0.43 + (frozen ? 19 : 73);
    const rand = i => { const n = Math.sin(seed + i * 7.913) * 43758.5453; return n - Math.floor(n); };
    const image = document.createElement('canvas');
    image.width = Math.max(1, Math.min(512, Math.ceil(w)));
    image.height = Math.max(1, Math.min(512, Math.ceil(h)));
    const c = image.getContext('2d');
    const trace = (ctx, points) => {
        ctx.beginPath(); points.forEach((p, i) => i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)); ctx.closePath();
    };
    c.save(); c.scale(image.width / w, image.height / h); c.translate(-wall.x, -wall.y);
    const sourceWall = { ...wall, hp: effect.sourceHp || 1, burning: false };
    const shape = getWallBreakShape(sourceWall, true);
    if (shape) clipWallBreakShape(c, wall, shape);
    GameTerrain.drawWoodenWall(c, wall); GameTerrain.drawWallCover(c, wall);
    if (wall.woodRotAmount) GameTerrain.drawWoodenWallRot(c, wall);
    if (wall.woodCharAmount) GameTerrain.drawWoodenWallBurn(c, sourceWall, 0);
    c.translate(wall.x, wall.y);
    if (frozen) {
        const glaze = c.createLinearGradient(0, 0, w, h);
        glaze.addColorStop(0, 'rgba(218,240,240,0.52)'); glaze.addColorStop(0.38, 'rgba(127,185,202,0.3)');
        glaze.addColorStop(1, 'rgba(190,227,233,0.48)'); c.fillStyle = glaze; c.fillRect(0, 0, w, h);
        for (let i = 0; i < Math.min(120, w * h / 24); i++) {
            c.fillStyle = i % 4 ? 'rgba(232,250,249,0.3)' : 'rgba(72,127,148,0.22)';
            c.fillRect(rand(i + 800) * w, rand(i + 1000) * h, 0.8 + rand(i + 1200), 0.7);
        }
    }
    c.restore();
    const cols = Math.max(2, Math.min(frozen ? 5 : 6, Math.ceil(w / (frozen ? 32 : 23))));
    const rows = Math.max(2, Math.min(frozen ? 3 : 4, Math.ceil(h / (frozen ? 22 : 13))));
    const grid = Array.from({ length: rows + 1 }, (_, row) => Array.from({ length: cols + 1 }, (_, col) => ({
        x: col * w / cols + (col === 0 || col === cols ? 0 : (rand(row * 31 + col) - 0.5) * w / cols * 0.45),
        y: row * h / rows + (row === 0 || row === rows ? 0 : (rand(row * 37 + col + 200) - 0.5) * h / rows * 0.45)
    })));
    const midpoint = (a, b, id, border) => {
        const amount = border ? 0 : (rand(id + 400) - 0.5) * 0.2;
        return { x: (a.x + b.x) / 2 - (b.y - a.y) * amount, y: (a.y + b.y) / 2 + (b.x - a.x) * amount };
    };
    const horizontal = Array.from({ length: rows + 1 }, (_, row) => Array.from({ length: cols }, (_, col) =>
        midpoint(grid[row][col], grid[row][col + 1], row * 29 + col, row === 0 || row === rows)));
    const vertical = Array.from({ length: rows }, (_, row) => Array.from({ length: cols + 1 }, (_, col) =>
        midpoint(grid[row][col], grid[row + 1][col], row * 23 + col + 100, col === 0 || col === cols)));
    const pieces = [];
    for (let row = 0; row < rows; row++) for (let col = 0; col < cols; col++) {
        const id = row * cols + col;
        const points = [grid[row][col], horizontal[row][col], grid[row][col + 1], vertical[row][col + 1],
            grid[row + 1][col + 1], horizontal[row + 1][col], grid[row + 1][col], vertical[row][col]];
        const cx = points.reduce((sum, point) => sum + point.x, 0) / points.length;
        const cy = points.reduce((sum, point) => sum + point.y, 0) / points.length;
        const dx = cx - (effect.hitX ?? w / 2), dy = cy - (effect.hitY ?? h / 2);
        const distance = Math.max(8, Math.hypot(dx, dy));
        pieces.push({ points, cx, cy, delay: frozen ? rand(id + 500) * 3 : (1 - cy / h) * 8 + rand(id + 500) * 5,
            dx: frozen ? dx / distance * (13 + rand(id + 600) * 20) + Math.sign(effect.vx || 0) * 7 : (rand(id + 600) - 0.5) * 13,
            dy: frozen ? dy / distance * (7 + rand(id + 700) * 12) : 12 + rand(id + 700) * 22,
            spin: (rand(id + 900) - 0.5) * (frozen ? 1.6 : 0.7), lift: 4 + rand(id + 1100) * 9 });
    }
    art = { image, pieces, trace, rand };
    woodWallDeathArt.set(effect, art);
    return art;
}

function drawWoodWallDestruction(ctx, effect, frozen) {
    const art = getWoodWallDeathArt(effect, frozen);
    const age = effect.age ?? effect.maxLife - effect.life;
    const start = frozen ? 9 : 0;
    ctx.save(); ctx.translate(effect.x, effect.y);
    if (frozen && age < start) {
        ctx.drawImage(art.image, 0, 0, effect.w, effect.h);
        ctx.globalAlpha = Math.min(1, age / 7);
        for (const piece of art.pieces) {
            art.trace(ctx, piece.points); ctx.strokeStyle = '#618d9e'; ctx.lineWidth = 0.85; ctx.stroke();
            ctx.save(); ctx.translate(0.6, -0.6); art.trace(ctx, piece.points);
            ctx.strokeStyle = 'rgba(236,252,249,0.85)'; ctx.lineWidth = 0.65; ctx.stroke(); ctx.restore();
        }
    } else {
        for (const piece of art.pieces) {
            const progress = Math.max(0, Math.min(1, (age - start - piece.delay) / (frozen ? 38 : 46)));
            const travel = frozen ? 1 - Math.pow(1 - progress, 2) : progress * progress;
            const lift = frozen ? Math.sin(progress * Math.PI) * piece.lift : 0;
            ctx.save();
            ctx.translate(piece.cx + piece.dx * travel, piece.cy + piece.dy * travel + progress * progress * (frozen ? 17 : 18) - lift);
            ctx.rotate(piece.spin * travel);
            const shrink = frozen ? 1 - progress * 0.12 : 1 - Math.pow(progress, 1.3) * 0.65;
            ctx.scale(shrink, shrink); ctx.translate(-piece.cx, -piece.cy);
            ctx.globalAlpha = Math.min(1, (1 - progress) * (frozen ? 2.4 : 2));
            art.trace(ctx, piece.points); ctx.clip();
            ctx.drawImage(art.image, 0, 0, effect.w, effect.h);
            if (frozen) {
                art.trace(ctx, piece.points); ctx.strokeStyle = 'rgba(225,249,251,0.95)'; ctx.lineWidth = 1.5; ctx.stroke();
                ctx.translate(0.8, 1); art.trace(ctx, piece.points); ctx.strokeStyle = 'rgba(59,109,130,0.65)'; ctx.lineWidth = 1; ctx.stroke();
            }
            ctx.restore();
        }
    }
    const progress = Math.max(0, (age - start) / (effect.maxLife - start));
    if (progress > 0) {
        const colors = frozen ? ['#c1e4e9', '#8cbacb', '#e4f5f3'] : ['#3a3d2a', '#535039', '#7b7950'];
        for (let i = 0; i < 12; i++) {
            const fall = Math.max(0, progress - art.rand(i + 1400) * 0.23);
            if (!fall) continue;
            const x = art.rand(i + 1500) * effect.w + (art.rand(i + 1600) - 0.5) * fall * (frozen ? 46 : 12);
            const y = art.rand(i + 1700) * effect.h + fall * fall * 38 - (frozen ? Math.sin(fall * Math.PI) * 9 : 0);
            const size = (frozen ? 1.5 : 1) + art.rand(i + 1800) * (frozen ? 2.5 : 1.5);
            ctx.globalAlpha = Math.max(0, 1 - fall * 1.5); ctx.fillStyle = colors[i % 3];
            ctx.beginPath(); ctx.moveTo(x - size, y); ctx.lineTo(x + size * 0.6, y - size * 0.8); ctx.lineTo(x + size, y + size * 0.7); ctx.closePath(); ctx.fill();
        }
    }
    ctx.restore();
}

function drawWoodIceImpact(ctx, impact) {
    if (impact.destroyedWall) { drawWoodWallDestruction(ctx, impact, true); return; }
    const age = impact.age || 0, wall = impact.wall;
    const art = getWoodIceArt(impact);
    const releasing = age >= 26;
    const progress = Math.max(0, Math.min(1, (age - 26) / 30));
    const growth = Math.min(1, age / 11);
    ctx.save();
    if (!releasing) {
        ctx.beginPath(); ctx.rect(impact.x, impact.y, impact.w, impact.h); ctx.clip();
        const shape = getWallBreakShape(wall, true);
        if (shape && wall.hp > 0) clipWallBreakShape(ctx, wall, shape);
    }
    ctx.translate(impact.x + impact.hitX, impact.y + impact.hitY);
    ctx.scale(growth, growth);
    if (!releasing) {
        ctx.globalAlpha = Math.min(1, age / 4);
        ctx.drawImage(art.image, -art.half, -art.half);
    }
    const crack = Math.min(1, Math.max(0, (age - 14) / 10));
    for (let i = 0; i < art.shards.length; i++) {
        const shard = art.shards[i];
        ctx.save();
        if (releasing) {
            ctx.translate(shard.center.x * progress * 0.65, shard.center.y * progress * 0.2 + progress * progress * 17);
            ctx.translate(shard.center.x, shard.center.y); ctx.rotate((i % 2 ? -1 : 1) * progress * 0.6); ctx.translate(-shard.center.x, -shard.center.y);
            ctx.globalAlpha = 1 - progress;
            art.trace(ctx, shard.points); ctx.clip();
            ctx.drawImage(art.image, -art.half, -art.half);
        }
        if (crack > 0) {
            ctx.globalAlpha = (releasing ? 1 - progress : crack) * 0.9;
            art.trace(ctx, shard.points); ctx.strokeStyle = 'rgba(58,101,121,0.8)'; ctx.lineWidth = 0.8; ctx.stroke();
            ctx.translate(0.55, -0.45);
            art.trace(ctx, shard.points); ctx.strokeStyle = 'rgba(230,249,247,0.9)'; ctx.lineWidth = 0.55; ctx.stroke();
        }
        ctx.restore();
    }
    ctx.restore();
}

function drawWoodDecay(ctx, obj) {
    drawWoodWallDestruction(ctx, obj, false);
}

function drawRomanSummon(ctx, unit, opacity = 1, remnant = null) {
    const cx = unit.x + unit.w / 2, cy = unit.y + unit.h / 2;
    const friendly = unit.team === tank.team;
    const teamColor = friendly ? '#98ad72' : '#c37a69';
    const fade = Math.min(1, (unit.age || 1) / 10, Math.max(0, unit.life) / 22) * opacity;
    if (fade <= 0) return;
    ctx.save(); ctx.translate(cx, cy); ctx.globalAlpha = fade;
    if (remnant) {
        ctx.rotate(remnant.expired ? 0 : (1 - remnant.life / remnant.maxLife) * 0.85);
        ctx.translate(0, (1 - remnant.life / remnant.maxLife) * 4);
    }
    ctx.fillStyle = 'rgba(14,18,12,0.27)';
    ctx.beginPath(); ctx.ellipse(1.5, unit.romanSummon === 'banner' ? 12 : 4, unit.w * 0.6, unit.isCenturion ? 8 : 4.2, unit.isCenturion ? (unit.turretAngle || 0) : 0, 0, Math.PI * 2); ctx.fill();
    if (unit.romanSummon === 'banner') {
        if (!remnant && unit.pending > 0) {
            const progress = 1 - unit.pending / ROMAN_LEGION_DELAY;
            ctx.strokeStyle = 'rgba(182,155,91,0.3)'; ctx.lineWidth = 1;
            ctx.beginPath(); ctx.ellipse(0, 8, 30, 15, 0, 0, Math.PI * 2); ctx.stroke();
            ctx.strokeStyle = '#bea365'; ctx.lineWidth = 1.5;
            ctx.beginPath(); ctx.ellipse(0, 8, 30, 15, 0, -Math.PI / 2, -Math.PI / 2 + progress * Math.PI * 2); ctx.stroke();
        }
        const wave = Math.sin((unit.age || 0) * 0.055) * 0.8;
        ctx.strokeStyle = '#493321'; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(0, 14); ctx.lineTo(0, -28); ctx.stroke();
        ctx.strokeStyle = '#c2a16a'; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(-0.7, 12); ctx.lineTo(-0.7, -27); ctx.stroke();
        ctx.fillStyle = '#58442e'; ctx.fillRect(-4, 11, 8, 3);
        ctx.strokeStyle = '#c5a66a'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(-15, -22); ctx.lineTo(15, -22); ctx.stroke();
        ctx.fillStyle = '#d1b275';
        ctx.beginPath(); ctx.moveTo(0, -32); ctx.lineTo(2.4, -28); ctx.lineTo(0, -25); ctx.lineTo(-2.4, -28); ctx.closePath(); ctx.fill();
        const cloth = ctx.createLinearGradient(-14, -20, 14, 6);
        cloth.addColorStop(0, '#752827'); cloth.addColorStop(0.45, '#ad4438'); cloth.addColorStop(1, '#682226');
        ctx.fillStyle = cloth; ctx.strokeStyle = '#c5a267'; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(-13, -21); ctx.lineTo(13, -21); ctx.lineTo(13 + wave, 5); ctx.quadraticCurveTo(0, 7 - wave, -13 + wave, 5); ctx.closePath(); ctx.fill(); ctx.stroke();
        ctx.strokeStyle = 'rgba(244,185,135,0.22)'; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(-8, -20); ctx.quadraticCurveTo(-6 + wave, -8, -8 + wave, 4); ctx.moveTo(7, -20); ctx.quadraticCurveTo(5 + wave, -8, 7 + wave, 4); ctx.stroke();
        ctx.strokeStyle = '#d3b475'; ctx.lineWidth = 1;
        for (let x = -11; x <= 11; x += 3) { ctx.beginPath(); ctx.moveTo(x + wave, 5); ctx.lineTo(x + wave, 8); ctx.stroke(); }
        // A stylised eagle and inscription evoke Roman military standards.
        ctx.fillStyle = '#d8bc80'; ctx.beginPath(); ctx.moveTo(0, -14); ctx.lineTo(-3, -16); ctx.lineTo(-9, -17); ctx.lineTo(-7, -12); ctx.lineTo(-3, -10); ctx.lineTo(0, -11); ctx.lineTo(3, -10); ctx.lineTo(7, -12); ctx.lineTo(9, -17); ctx.lineTo(3, -16); ctx.closePath(); ctx.fill();
        ctx.beginPath(); ctx.ellipse(0, -12, 1.5, 3, 0, 0, Math.PI * 2); ctx.fill();
        ctx.font = 'bold 5px serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('SPQR', wave * 0.3, 0);
        if (!remnant && unit.pending > 0) {
            ctx.fillStyle = '#e1d6b5'; ctx.font = 'bold 8px sans-serif'; ctx.fillText(Math.ceil(unit.pending / 60), 0, -38);
        }
    } else {
        ctx.rotate(unit.turretAngle || 0);
        const centurion = unit.isCenturion === true;
        ctx.scale(unit.w / (centurion ? 36 : 20), unit.h / (centurion ? 30 : 25));
        if (centurion) {
            const gait = unit.walking ? (unit.walkPhase || 0) * 0.8 : 0;
            // Diagonal pairs trot together; legs and hooves remain underneath the horse.
            for (const front of [-1, 1]) for (const side of [-1, 1]) {
                const step = unit.walking ? Math.sin(gait + (front === side ? 0 : Math.PI)) * 3 : 0;
                const hipX = front > 0 ? 8 : -11;
                ctx.strokeStyle = '#493126'; ctx.lineWidth = 2.8; ctx.lineCap = 'round';
                ctx.beginPath(); ctx.moveTo(hipX, side * 4); ctx.lineTo(hipX - 1 + step * 0.4, side * 8); ctx.lineTo(hipX + step, side * 11); ctx.stroke();
                ctx.strokeStyle = '#b48a62'; ctx.lineWidth = 1.1;
                ctx.beginPath(); ctx.moveTo(hipX - 1 + step * 0.4, side * 7); ctx.lineTo(hipX + step, side * 10); ctx.stroke();
                ctx.fillStyle = '#292723'; ctx.beginPath(); ctx.roundRect(hipX + step - 1.4, side * 11 - 1.6, 3.6, 3.2, 1); ctx.fill();
            }
            const tail = unit.walking ? Math.sin(gait * 0.5) * 1.7 : 0;
            ctx.strokeStyle = '#30271f'; ctx.lineWidth = 3; ctx.lineCap = 'round';
            ctx.beginPath(); ctx.moveTo(-15, 0); ctx.bezierCurveTo(-20, -1, -20, 3 + tail, -25, 2 + tail); ctx.stroke();
            const coat = ctx.createLinearGradient(-6, -8, 3, 8);
            coat.addColorStop(0, '#b58b61'); coat.addColorStop(0.4, '#8c603f'); coat.addColorStop(1, '#51392a');
            ctx.fillStyle = coat; ctx.strokeStyle = '#493427'; ctx.lineWidth = 0.8;
            ctx.beginPath(); ctx.ellipse(-3, 0, 14, 7.3, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
            ctx.beginPath(); ctx.ellipse(-11, 0, 6.2, 6.8, 0, 0, Math.PI * 2); ctx.fill();
            ctx.beginPath(); ctx.moveTo(5, -5.8); ctx.bezierCurveTo(11, -6, 13, -5, 18, -3.5); ctx.lineTo(19, 3); ctx.bezierCurveTo(12, 5.8, 10, 6, 5, 5.5); ctx.closePath(); ctx.fill(); ctx.stroke();
            ctx.strokeStyle = '#382a22'; ctx.lineWidth = 2.5;
            ctx.beginPath(); ctx.moveTo(7, -4.8); ctx.quadraticCurveTo(13, -5.5, 19, -2.8); ctx.stroke();
            ctx.fillStyle = coat;
            ctx.beginPath(); ctx.moveTo(16, -3.6); ctx.quadraticCurveTo(21, -5.5, 24, -2.6); ctx.lineTo(27, -1.8); ctx.quadraticCurveTo(28, 0, 26, 2); ctx.lineTo(21, 3); ctx.lineTo(16, 2.5); ctx.closePath(); ctx.fill(); ctx.stroke();
            for (const side of [-1, 1]) {
                ctx.fillStyle = '#765039'; ctx.beginPath(); ctx.moveTo(18, side * 2.2); ctx.lineTo(20, side * 5.2); ctx.lineTo(21.3, side * 2.5); ctx.closePath(); ctx.fill();
                ctx.fillStyle = '#211f1c'; ctx.beginPath(); ctx.arc(23.1, side * 2.2, 0.65, 0, Math.PI * 2); ctx.fill();
            }
            ctx.strokeStyle = '#bc9b72'; ctx.lineWidth = 0.7;
            ctx.beginPath(); ctx.moveTo(25, -2.5); ctx.lineTo(25.3, 2.2); ctx.moveTo(19, -3.8); ctx.lineTo(20, 3.2); ctx.stroke();
            ctx.strokeStyle = '#493628'; ctx.lineWidth = 0.65;
            ctx.beginPath(); ctx.moveTo(24.5, -1.7); ctx.quadraticCurveTo(14, -5, 3, -3); ctx.moveTo(24.5, 1.7); ctx.quadraticCurveTo(14, 6, 3, 5); ctx.stroke();
            ctx.fillStyle = '#7b3030'; ctx.strokeStyle = '#b69a65'; ctx.lineWidth = 0.7;
            ctx.beginPath(); ctx.roundRect(-9, -8, 12, 16, 2); ctx.fill(); ctx.stroke();
            ctx.fillStyle = '#51382a'; ctx.beginPath(); ctx.roundRect(-7, -5, 7, 10, 2); ctx.fill();
            // Keep the rider human-sized while the mount has its own larger footprint.
            ctx.translate(-2, unit.walking ? Math.sin(gait * 2) * 0.35 : 0);
            ctx.scale(0.85, 0.85);
        }
        const stride = unit.walking ? Math.sin(unit.walkPhase || 0) * 2 : 0;
        const melee = (unit.attackType === 'melee' || unit.attackType === 'cavalrySword') && unit.attackAnim > 0;
        const mountedSpear = centurion && !melee;
        const attackDuration = centurion ? (melee ? 22 : 30) : (melee ? 18 : 14);
        const attackProgress = unit.attackAnim > 0 ? Math.max(0, Math.min(1, 1 - unit.attackAnim / attackDuration)) : 0;
        const attack = unit.attackAnim > 0 ? Math.sin(attackProgress * Math.PI) : 0;
        const bob = unit.walking ? Math.sin((unit.walkPhase || 0) * 2) * 0.3 : 0;
        // Feet alternate underneath the tunic instead of sliding with the entire body.
        for (const side of [-1, 1]) {
            if (centurion) {
                ctx.strokeStyle = '#9a6d4c'; ctx.lineWidth = 2.6;
                ctx.beginPath(); ctx.moveTo(-5, side * 3); ctx.lineTo(-5.5, side * 8.5); ctx.stroke();
                ctx.fillStyle = '#382b23'; ctx.beginPath(); ctx.roundRect(-6.5, side * 9 - 1.6, 5, 3.2, 1); ctx.fill();
                continue;
            }
            const step = stride * side;
            ctx.strokeStyle = '#b58d6d'; ctx.lineWidth = 3;
            ctx.beginPath(); ctx.moveTo(-6, side * 3); ctx.lineTo(-10 + step, side * 3.8); ctx.stroke();
            ctx.fillStyle = '#4b3528'; ctx.strokeStyle = '#241f1b'; ctx.lineWidth = 0.7;
            ctx.beginPath(); ctx.roundRect(-13 + step, side * 3.8 - 1.6, 5.8, 3.2, 1.3); ctx.fill(); ctx.stroke();
            ctx.strokeStyle = '#c1a17b'; ctx.lineWidth = 0.6;
            ctx.beginPath(); ctx.moveTo(-10.5 + step, side * 3.8 - 1.2); ctx.lineTo(-10.5 + step, side * 3.8 + 1.2); ctx.stroke();
        }
        ctx.translate(bob + (melee ? attack * 1.8 : 0), 0);
        const tunic = ctx.createLinearGradient(-10, -6, -3, 6);
        tunic.addColorStop(0, '#b75242'); tunic.addColorStop(1, '#662c2b');
        ctx.fillStyle = tunic; ctx.strokeStyle = '#462725'; ctx.lineWidth = 0.8;
        ctx.beginPath(); ctx.moveTo(-7, -5); ctx.lineTo(-10, -5.8); ctx.lineTo(-11, 5.6); ctx.lineTo(-6, 5); ctx.closePath(); ctx.fill(); ctx.stroke();
        ctx.strokeStyle = '#ce8a62'; ctx.lineWidth = 0.6;
        for (const y of [-3, 0, 3]) { ctx.beginPath(); ctx.moveTo(-9.4, y); ctx.lineTo(-6.3, y); ctx.stroke(); }
        // Broad articulated shoulders, waist and separate arms create a readable human silhouette.
        ctx.strokeStyle = '#642e2a'; ctx.lineWidth = 4;
        ctx.beginPath(); ctx.moveTo(-2, -4); ctx.lineTo(2, -7); ctx.moveTo(-2, 4); ctx.lineTo(1.5 + attack * 2, 7); ctx.stroke();
        ctx.strokeStyle = '#bf9875'; ctx.lineWidth = 2.5;
        ctx.beginPath(); ctx.moveTo(1, -7); ctx.lineTo(5, -6.5); ctx.moveTo(1.5 + attack * 2, 7); ctx.lineTo(5 + attack * 4, 7.5); ctx.stroke();
        const steel = ctx.createLinearGradient(-6, -6, 0, 6);
        steel.addColorStop(0, centurion ? '#dec78f' : '#d3d4c7'); steel.addColorStop(0.4, centurion ? '#b4975e' : '#9da69f'); steel.addColorStop(1, centurion ? '#6e5c3e' : '#545e5c');
        ctx.fillStyle = steel; ctx.strokeStyle = '#353d3c'; ctx.lineWidth = 0.8;
        ctx.beginPath(); ctx.roundRect(-6.7, -5.8, 7.6, 11.6, 2.2); ctx.fill(); ctx.stroke();
        ctx.strokeStyle = '#59635e'; ctx.lineWidth = 0.7;
        for (let x = -5; x < 0; x += 1.7) { ctx.beginPath(); ctx.moveTo(x, -5); ctx.quadraticCurveTo(x - 0.7, 0, x, 5); ctx.stroke(); }
        for (const side of [-1, 1]) {
            ctx.fillStyle = steel; ctx.beginPath(); ctx.roundRect(-3.8, side * 5 - 1.7, 5.4, 3.4, 1.2); ctx.fill(); ctx.stroke();
        }
        ctx.fillStyle = '#694833'; ctx.fillRect(-7.2, -4.7, 1.7, 9.4);
        ctx.fillStyle = '#c6ac70'; ctx.fillRect(-7.3, -1, 2, 2);
        // Cavalry uses a long spatha swing or a forward fighting-spear thrust.
        const hand = 5 + attack * (mountedSpear ? 8 : melee ? 4 : -3);
        ctx.save(); ctx.translate(hand, 7.5);
        ctx.rotate(centurion ? (melee ? -1.1 + attackProgress * 1.8 : -0.08 + attack * 0.08) : (melee ? -attack * 0.25 : -attack * 0.35));
        ctx.strokeStyle = '#47362a'; ctx.lineWidth = 1.7;
        ctx.beginPath(); ctx.moveTo(-2, 0); ctx.lineTo(2, 0); ctx.stroke();
        if (melee) {
            const bladeLength = centurion ? 19 : 13;
            ctx.fillStyle = '#c4cbd0'; ctx.strokeStyle = '#4b565b'; ctx.lineWidth = 0.5;
            ctx.beginPath(); ctx.moveTo(2, -1.3); ctx.lineTo(bladeLength - 3, -0.9); ctx.lineTo(bladeLength, 0); ctx.lineTo(bladeLength - 3, 0.9); ctx.lineTo(2, 1.3); ctx.closePath(); ctx.fill(); ctx.stroke();
            ctx.strokeStyle = '#eee7d4'; ctx.beginPath(); ctx.moveTo(3, -0.4); ctx.lineTo(bladeLength - 2, 0); ctx.stroke();
            ctx.strokeStyle = '#b79a62'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(2, -2); ctx.lineTo(2, 2); ctx.stroke();
        } else if (mountedSpear) {
            ctx.strokeStyle = '#6e4b30'; ctx.lineWidth = 1.5;
            ctx.beginPath(); ctx.moveTo(-11, 0); ctx.lineTo(28, 0); ctx.stroke();
            ctx.strokeStyle = '#b19261'; ctx.lineWidth = 0.5;
            ctx.beginPath(); ctx.moveTo(-9, -0.35); ctx.lineTo(27, -0.35); ctx.stroke();
            ctx.fillStyle = '#cbd1c8'; ctx.strokeStyle = '#555e58'; ctx.lineWidth = 0.5;
            ctx.beginPath(); ctx.moveTo(27, -1); ctx.lineTo(31, -1.6); ctx.lineTo(36, 0); ctx.lineTo(31, 1.6); ctx.lineTo(27, 1); ctx.closePath(); ctx.fill(); ctx.stroke();
            ctx.strokeStyle = '#f0ead5'; ctx.beginPath(); ctx.moveTo(29, -0.3); ctx.lineTo(34, 0); ctx.stroke();
        } else {
            ctx.strokeStyle = '#755137'; ctx.lineWidth = 1.1; ctx.beginPath(); ctx.moveTo(-8, 0); ctx.lineTo(10, 0); ctx.stroke();
            ctx.strokeStyle = '#9ca8ab'; ctx.lineWidth = 0.8; ctx.beginPath(); ctx.moveTo(10, 0); ctx.lineTo(15, 0); ctx.stroke();
            ctx.fillStyle = '#d1d8d5'; ctx.beginPath(); ctx.moveTo(17, 0); ctx.lineTo(14, -1.1); ctx.lineTo(14, 1.1); ctx.closePath(); ctx.fill();
        }
        ctx.restore();
        // A curved scutum protects the left arm without hiding the face and torso.
        ctx.save(); ctx.translate(unit.bracing ? 6.5 : 4.5, -7); ctx.rotate(unit.bracing ? 0.08 : -0.12);
        const shield = ctx.createLinearGradient(-3.5, 0, 4, 0);
        shield.addColorStop(0, '#762d2c'); shield.addColorStop(0.45, '#bd5845'); shield.addColorStop(1, '#6b292a');
        ctx.fillStyle = shield; ctx.strokeStyle = unit.shieldHit > 0 ? '#f0deb0' : '#bd9a62'; ctx.lineWidth = unit.shieldHit > 0 ? 1.2 : 0.85;
        ctx.beginPath();
        if (centurion) ctx.ellipse(0, 0, 4.1, 7.2, 0, 0, Math.PI * 2);
        else { ctx.moveTo(-3.5, -6.6); ctx.quadraticCurveTo(0, -8, 3.5, -6.6); ctx.lineTo(3.5, 6.6); ctx.quadraticCurveTo(0, 8, -3.5, 6.6); ctx.closePath(); }
        ctx.fill(); ctx.stroke();
        ctx.strokeStyle = '#e0bc78'; ctx.lineWidth = 0.65;
        for (const side of [-1, 1]) {
            ctx.beginPath(); ctx.moveTo(-1.9, side * 5.7); ctx.lineTo(1, side * 3.7); ctx.lineTo(-1, side * 2.8); ctx.lineTo(1.9, side * 1.1); ctx.stroke();
        }
        ctx.fillStyle = '#493c2d'; ctx.beginPath(); ctx.ellipse(0, 0, 2.1, 2.7, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#d5bc83'; ctx.beginPath(); ctx.ellipse(-0.3, -0.2, 1.4, 1.8, 0, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
        // Imperial-style iron helmet: neck guard, cheeks and a restrained central ridge.
        ctx.fillStyle = '#626a64'; ctx.beginPath(); ctx.ellipse(-0.5, 0, 3.6, 4.7, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#bf9673'; ctx.beginPath(); ctx.ellipse(3.3, 0, 2, 2.4, 0, 0, Math.PI * 2); ctx.fill();
        const helmet = ctx.createLinearGradient(-2, -4, 3, 4);
        helmet.addColorStop(0, '#e3e2ce'); helmet.addColorStop(0.4, '#b4bcb5'); helmet.addColorStop(1, '#68736e');
        ctx.fillStyle = helmet; ctx.strokeStyle = '#404a46'; ctx.lineWidth = 0.7;
        ctx.beginPath(); ctx.ellipse(0.5, 0, 3.7, 3.8, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        ctx.strokeStyle = '#d9c99e'; ctx.lineWidth = 0.8;
        ctx.beginPath(); ctx.moveTo(-2.5, 0); ctx.lineTo(3.4, 0); ctx.stroke();
        ctx.strokeStyle = '#64706a'; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(3.5, -2.7); ctx.lineTo(4.5, -1.3); ctx.moveTo(3.5, 2.7); ctx.lineTo(4.5, 1.3); ctx.stroke();
        if (centurion) {
            // A transverse crimson crest distinguishes the officer at game scale.
            ctx.strokeStyle = '#4f2829'; ctx.lineWidth = 3.6;
            ctx.beginPath(); ctx.moveTo(0, -6.5); ctx.quadraticCurveTo(-2.5, 0, 0, 6.5); ctx.stroke();
            ctx.strokeStyle = '#b94d40'; ctx.lineWidth = 2.3;
            ctx.beginPath(); ctx.moveTo(-0.3, -6.3); ctx.quadraticCurveTo(-2.7, 0, -0.3, 6.3); ctx.stroke();
            ctx.strokeStyle = '#df9670'; ctx.lineWidth = 0.6;
            for (let y = -5; y <= 5; y += 2) { ctx.beginPath(); ctx.moveTo(-0.8, y); ctx.lineTo(-2.6 + Math.abs(y) * 0.16, y); ctx.stroke(); }
        }
    }
    ctx.restore();
    if (!remnant && unit.romanSummon === 'legionary') {
        ctx.save(); ctx.globalAlpha = fade;
        const y = unit.y - 6;
        ctx.fillStyle = '#24261f'; ctx.fillRect(unit.x, y, unit.w, 2.5);
        ctx.fillStyle = teamColor; ctx.fillRect(unit.x, y, unit.w * Math.max(0, unit.hp / unit.maxHp), 2.5);
        ctx.restore();
        if (unit.romanSummon === 'legionary') {
            if (unit.frozenEffect > 0 && typeof drawFrozenOverlay === 'function') drawFrozenOverlay(ctx, unit.x, unit.y, unit.w, unit.h, unit.frozenEffect);
            else if (unit.iceSlowed && typeof drawIceSlowOverlay === 'function') drawIceSlowOverlay(ctx, unit.x, unit.y, unit.w, unit.h, unit.iceSlowedTime, unit);
        }
    }
}

function drawRomanRemnant(ctx, object) {
    drawRomanSummon(ctx, { ...object.unit, life: 100, age: 20 }, object.life / object.maxLife, object);
}

function drawWorldGrid(viewLeft, viewRight, viewTop, viewBottom) {
    ctx.strokeStyle = GameTerrain.current() === 'forest' || GameTerrain.current() === 'night' ?
        'rgba(0,0,0,0.045)' : 'rgba(0,0,0,0.018)';
    ctx.lineWidth = 1;
    const gridStep = navCell;
    const minX = Math.max(0, Math.floor(viewLeft / gridStep) * gridStep);
    const minY = Math.max(0, Math.floor(viewTop / gridStep) * gridStep);
    const maxX = Math.min(worldWidth, viewRight);
    const maxY = Math.min(worldHeight, viewBottom);

    ctx.beginPath();
    for (let x = minX; x <= maxX; x += gridStep) {
        ctx.moveTo(x, minY); ctx.lineTo(x, maxY);
    }
    for (let y = minY; y <= maxY; y += gridStep) {
        ctx.moveTo(minX, y); ctx.lineTo(maxX, y);
    }
    ctx.stroke();
}

function drawReloadBar(ctx, unit, type, color) {
    if (type === 'mechDiy' || type === 'mechShield' || type === 'mechRocket') return;
    // The machinegun reloads only after its full firing burst overheats.
    let remaining = Math.max(0, unit.fireCooldown || 0);
    if (type === 'machinegun') remaining = unit.overheated ? Math.max(0, unit.heat || 0) : 0;
    if (type === 'illuminat') remaining = unit.beamActive ? 0 : Math.max(0, unit.beamCooldown || 0);
    if (type === 'myasnoy' && !unit.myasnoyUltActive && remaining > 0 &&
        remaining <= 12 && (unit._reloadBarTotal || 0) <= 12 && !unit.myasnoyReloading) return;
    const now = typeof performance !== 'undefined' ? performance.now() : Date.now();
    const elapsed = Math.max(0, Math.min(50, now - (unit._reloadBarTime ?? now - 16)));
    unit._reloadBarTime = now;
    const fade = 1 - Math.exp(-elapsed / 60);
    unit._reloadBarOpacity = (unit._reloadBarOpacity || 0) + ((remaining > 0 ? 1 : 0) - (unit._reloadBarOpacity || 0)) * fade;
    if (remaining <= 0) {
        unit._reloadBarPrevious = 0;
        unit._reloadBarTotal = 0;
    } else if (!unit._reloadBarTotal || remaining > (unit._reloadBarPrevious || 0)) {
        unit._reloadBarTotal = type === 'machinegun' ? MACHINEGUN_MAX_HEAT : remaining;
        unit._reloadBarProgress = 0;
    }
    unit._reloadBarPrevious = remaining;
    const targetProgress = remaining > 0 ? Math.max(0, Math.min(1, 1 - remaining / unit._reloadBarTotal)) : 1;
    unit._reloadBarProgress = (unit._reloadBarProgress || 0)
        + (targetProgress - (unit._reloadBarProgress || 0)) * (1 - Math.exp(-elapsed / 45));
    if (unit._reloadBarOpacity < 0.015) return;
    const barY = unit.y - 17;
    const fillWidth = unit.w * unit._reloadBarProgress;
    ctx.save();
    ctx.globalAlpha *= unit._reloadBarOpacity;
    ctx.fillStyle = 'rgba(12, 19, 26, 0.85)';
    ctx.fillRect(unit.x - 1, barY - 1, unit.w + 2, 6);
    ctx.fillStyle = color;
    ctx.fillRect(unit.x, barY, fillWidth, 4);
    ctx.restore();
}

let immersionEdgeCache = null;
let immersionDustSprite = null;
let immersionPresentation = null;

function updateImmersionPresentation(unit, biome, frame, motionStrength) {
    if (!window.immersionEnabled || gameState !== 'playing' || !unit || unit.alive === false || !(unit.hp > 0)) {
        immersionPresentation = null;
        return null;
    }
    const session = typeof battleSessionId === 'undefined' ? 0 : battleSessionId;
    if (!immersionPresentation || immersionPresentation.session !== session) {
        immersionPresentation = { session, frame: frame - 1, rain: 0, desert: 0, snow: 0, swamp: 0, fire: 0,
            ice: 0, frozen: 0, gas: 0, drill: 0, drillSeed: 0, drilling: false, pyro: 0, heat: 0, iced: false, illuminatAge: 2,
            electricAge: 2, impactAge: 2, swarm: 0, overload: 0, water: 0, wasJet: false,
            musicAge: 2, musicFrame: undefined, musicPulses: [], barrageAge: 2, barrageFrame: undefined,
            barrageShockFrame: undefined, barrageShockAge: 2, airAge: 2, airAngle: 0,
            sprayTime: 0, spraySeed: 0, sprayClock: 0, wetDrops: [], insects: [],
            drops: [], smoke: [], rainClock: 0, smokeClock: 0 };
    }
    const state = immersionPresentation;
    const dt = Math.max(0, Math.min(0.05, (frame - state.frame) / 60));
    state.frame = frame;
    if (dt === 0) return state;
    const health = unit.hp / (unit.maxHp || 300);
    const hitAge = stamp => Number.isFinite(stamp) ? Math.max(0, (frame - stamp) / 60) : 2;
    state.electricAge = hitAge(unit._immersionElectricFrame);
    state.impactAge = hitAge(unit._immersionImpactFrame);
    state.musicAge = hitAge(unit._immersionMusicFrame);
    if (Number.isFinite(unit._immersionMusicFrame) && state.musicFrame !== unit._immersionMusicFrame) {
        state.musicFrame = unit._immersionMusicFrame;
        if (state.musicAge < 0.9 && (!state.musicPulses.length || state.musicFrame - state.musicPulses[state.musicPulses.length - 1] >= 6)) {
            state.musicPulses.push(state.musicFrame);
            if (state.musicPulses.length > 4) state.musicPulses.shift();
        }
    }
    state.musicPulses = state.musicPulses.filter(stamp => hitAge(stamp) < 0.9);
    state.barrageAge = hitAge(unit._immersionBarrageFrame);
    if (Number.isFinite(unit._immersionBarrageFrame) && state.barrageFrame !== unit._immersionBarrageFrame) {
        if (!Number.isFinite(state.barrageShockFrame) || unit._immersionBarrageFrame - state.barrageFrame > 48) state.barrageShockFrame = unit._immersionBarrageFrame;
        state.barrageFrame = unit._immersionBarrageFrame;
    }
    state.barrageShockAge = hitAge(state.barrageShockFrame);
    state.airAge = hitAge(unit._immersionAirFrame);
    state.airAngle = Number.isFinite(unit._immersionAirAngle) ? unit._immersionAirAngle : 0;
    const jet = hitAge(unit._immersionWaterFrame) < 0.14;
    const inSwarm = typeof objects !== 'undefined' && objects.some(obj => obj.type === 'pharaohSwarm' && obj.life > 0 && obj.team !== unit.team &&
        Math.hypot(obj.x - Math.max(unit.x, Math.min(obj.x, unit.x + unit.w)),
            obj.y - Math.max(unit.y, Math.min(obj.y, unit.y + unit.h))) <= obj.radius);
    for (const [type, target] of [['swarm', inSwarm ? 1 : 0], ['overload', unit._kvantOverload ? 1 : 0], ['water', jet ? 1 : 0]]) {
        state[type] += (target - state[type]) * Math.min(1, dt * (target ? 9 : 4));
        if (!target && state[type] < 0.01) state[type] = 0;
    }
    if (state.swarm > 0.01) {
        if (!state.insects.length) for (let i = 0; i < 96; i++) state.insects.push({
            x: Math.random(), y: Math.random(), angle: Math.random() * Math.PI * 2,
            speed: 0.25 + Math.random() * 0.45, size: 0.65 + Math.random() * 0.7, phase: Math.random() * 6,
            flying: i < 64, modeTime: 0.4 + Math.random() * 2 });
        for (const bug of state.insects) {
            bug.modeTime -= dt;
            if (bug.modeTime <= 0) {
                bug.flying = !bug.flying; bug.modeTime = 0.5 + Math.random() * (bug.flying ? 1.3 : 2.5);
                bug.angle += (Math.random() - 0.5) * 3;
            }
            bug.angle += Math.sin(frame * (bug.flying ? 0.11 : 0.035) + bug.phase) * dt * (bug.flying ? 10 : 2);
            const speed = bug.speed * (bug.flying ? 1 : 0.065);
            bug.x = (bug.x + Math.cos(bug.angle) * speed * dt + 1) % 1;
            bug.y = (bug.y + Math.sin(bug.angle) * speed * dt + 1) % 1;
        }
    } else state.insects.length = 0;
    if (state.water > 0) state.sprayTime += dt;
    if (jet && !state.wasJet) {
        if (state.water < 0.2) state.spraySeed = Math.random() * Math.PI * 2;
        state.sprayClock += 12;
    }
    state.wasJet = jet;
    if (jet) state.sprayClock += dt * 16;
    while (state.sprayClock >= 1) {
        state.sprayClock--;
        if (state.wetDrops.length < 28) state.wetDrops.push({ x: 0.03 + Math.random() * 0.94, y: 0.03 + Math.random() * 0.78,
            radius: 12 + Math.random() * 14, speed: 0.025 + Math.random() * 0.06, age: 0, life: 4 + Math.random() * 3, seed: Math.random() * 6 });
    }
    for (const drop of state.wetDrops) {
        drop.age += dt; drop.life -= dt; drop.speed += dt * 0.035; drop.y += drop.speed * dt;
        drop.x += Math.sin(drop.age * 2 + drop.seed) * dt * 0.002;
    }
    state.wetDrops = state.wetDrops.filter(drop => drop.life > 0 && drop.y < 1.08);
    const frozen = (unit.frozenEffect || 0) > 0;
    const cold = frozen || !!unit.iceSlowed || (unit.iceSlowedTime || 0) > 0;
    const heatHit = frame >= unit._immersionHeatFrame && frame - unit._immersionHeatFrame < 45;
    const pyroBurn = !!unit.burning && (unit.burnTimer || 0) > 0;
    const drilling = !!unit.burovoyDrillParalysis;
    if (drilling && !state.drilling) state.drillSeed = Math.floor(Math.random() * 4294967296);
    state.drilling = drilling;
    let gasStrength = 0;
    if (typeof objects !== 'undefined') for (const obj of objects) {
        if (obj.type !== 'gas' || obj.life <= 0 ||
            Math.hypot(unit.x + unit.w / 2 - obj.x, unit.y + unit.h / 2 - obj.y) > obj.radius) continue;
        const sourceTeam = obj.ownerTeam ?? obj.team;
        const friendly = sourceTeam !== undefined ? sourceTeam === unit.team : obj.owner === 'player' || obj.owner === 'ally';
        gasStrength = Math.max(gasStrength, friendly ? 0.06 : 1);
    }
    for (const [type, target] of [['ice', cold ? 1 : 0], ['frozen', frozen ? 1 : 0],
        ['gas', gasStrength], ['drill', unit.burovoyDrillParalysis ? 1 : 0]]) {
        state[type] += (target - state[type]) * Math.min(1, dt * (target ? 6 : 4));
        if (!target && state[type] < 0.02) state[type] = 0;
    }
    state.iced = cold || state.ice > 0 || state.frozen > 0;
    state.illuminatAge = Number.isFinite(unit._immersionIlluminatFrame)
        ? Math.max(0, (frame - unit._immersionIlluminatFrame) / 60) : 2;
    if (state.iced) {
        state.fire = 0; state.pyro = 0; state.heat = 0;
        state.smoke.length = 0; state.smokeClock = 0;
    } else {
        state.pyro += ((pyroBurn ? 1 : 0) - state.pyro) * Math.min(1, dt * 5);
        state.heat += ((heatHit && !pyroBurn ? 1 : 0) - state.heat) * Math.min(1, dt * 5);
        if (!heatHit && state.heat < 0.02) state.heat = 0;
    }
    const heatOnly = !pyroBurn && (heatHit || state.heat > 0);
    if (heatOnly) {
        state.fire = 0; state.pyro = 0; state.smoke.length = 0; state.smokeClock = 0;
    }
    for (const type of ['rain', 'desert', 'snow', 'swamp', 'fire']) {
        const target = type === 'fire' ? (!state.iced && !heatOnly && health < 0.3 && !unit.burovoyBurrowActive ? (health < 0.1 ? 1 : 0.65) : 0)
            : biome === type ? (type === 'rain' ? Math.min(1, motionStrength) : 1) : 0;
        state[type] += (target - state[type]) * Math.min(1, dt * (type === 'fire' ? 4 : 1.5));
    }
    for (const drop of state.drops) {
        drop.age += dt; drop.life -= dt * (biome === 'rain' ? 1 : 3);
        drop.speed += dt * 0.008;
        drop.y += drop.speed * dt;
        drop.x += Math.sin(drop.age * 1.7 + drop.seed) * dt * 0.0015;
    }
    state.drops = state.drops.filter(drop => drop.y < 1.08 && drop.life > 0);
    if (biome === 'rain' && motionStrength > 0.05) {
        state.rainClock += dt * (6 + Math.min(1, motionStrength) * 8);
        while (state.rainClock >= 1) {
            state.rainClock--;
            if (state.drops.length < 18) state.drops.push({ x: Math.random(), y: Math.random() * 0.85,
                radius: 2.7 + Math.random() * 3.8, speed: 0.025 + Math.random() * 0.07,
                age: 0, life: 5 + Math.random() * 5, seed: Math.random() * 6 });
        }
    }
    // Nearby beads combine into a heavier drop that slides faster.
    for (let i = 0; i < state.drops.length; i++) for (let j = i + 1; j < state.drops.length; j++) {
        const a = state.drops[i], b = state.drops[j];
        if (a.life > 0 && b.life > 0 && Math.hypot((a.x - b.x) * 1.5, a.y - b.y) < 0.014) {
            a.radius = Math.min(10, Math.hypot(a.radius, b.radius));
            a.speed = Math.min(0.14, Math.max(a.speed, b.speed) * 1.25); b.life = 0;
        }
    }
    for (const puff of state.smoke) {
        puff.age += dt; puff.x += puff.vx * dt; puff.y += puff.vy * dt;
    }
    state.smoke = state.smoke.filter(puff => puff.age < 3.2);
    if (!state.iced && Math.max(state.fire, state.pyro) > 0.04) {
        state.smokeClock += dt * Math.max(state.fire, state.pyro) * (state.pyro > 0.1 ? 12 : 7);
        while (state.smokeClock >= 1) {
            state.smokeClock--;
            if (state.smoke.length < 22) {
                const edge = state.pyro > 0.1 ? Math.floor(Math.random() * 4) : 0;
                state.smoke.push({ x: edge === 1 ? 0 : edge === 2 ? 1 : Math.random(), y: edge === 0 ? 1 : edge === 3 ? 0 : Math.random(),
                    vx: edge === 1 ? 0.09 : edge === 2 ? -0.09 : (Math.random() - 0.35) * 0.025,
                    vy: edge === 3 ? -0.035 : -0.11 - Math.random() * 0.04,
                    pyro: state.pyro > 0.1, size: (state.pyro > 0.1 ? 0.2 : 0.14) + Math.random() * 0.08,
                    age: 0, angle: Math.random() * 6 });
            }
        }
    }
    return state;
}

function getImmersionEdgeArt(type, width, height) {
    if (!immersionEdgeCache || immersionEdgeCache.width !== width || immersionEdgeCache.height !== height) {
        immersionEdgeCache = { width, height, images: new Map() };
    }
    if (immersionEdgeCache.images.has(type)) return immersionEdgeCache.images.get(type);
    const art = document.createElement('canvas');
    art.width = width; art.height = height;
    const c = art.getContext('2d');
    const depth = Math.min(width * (type === 'snow' ? 0.13 : 0.11), type === 'snow' ? 160 : 130);
    for (const side of [0, 1]) {
        const mask = document.createElement('canvas');
        mask.width = 72; mask.height = Math.min(512, Math.ceil(height / 2));
        const m = mask.getContext('2d'), pixels = m.createImageData(mask.width, mask.height);
        let seed = 12387 + side * 3151 + (type === 'snow' ? 0 : 919);
        const grid = new Float32Array(32 * 128);
        for (let i = 0; i < grid.length; i++) { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; grid[i] = seed / 4294967296; }
        const noise = (x, y) => {
            const ix = Math.floor(x), iy = Math.floor(y);
            let fx = x - ix, fy = y - iy;
            fx = fx * fx * (3 - 2 * fx); fy = fy * fy * (3 - 2 * fy);
            const at = (xx, yy) => grid[(yy % 128) * 32 + xx % 32];
            return (at(ix, iy) * (1 - fx) + at(ix + 1, iy) * fx) * (1 - fy)
                + (at(ix, iy + 1) * (1 - fx) + at(ix + 1, iy + 1) * fx) * fy;
        };
        for (let y = 0; y < mask.height; y++) for (let x = 0; x < mask.width; x++) {
            const edge = x / mask.width;
            const grain = noise(x / 9, y / 14) * 0.7 + noise(x / 2.2, y / 3.5) * 0.3;
            const density = Math.max(0, Math.min(1, (1 - edge) * 1.5 + (grain - 0.5) * 0.9)) * Math.pow(1 - edge, 0.85);
            const offset = (y * mask.width + x) * 4;
            pixels.data[offset] = type === 'snow' ? 195 + grain * 55 : 25 + grain * 36;
            pixels.data[offset + 1] = type === 'snow' ? 222 + grain * 30 : 33 + grain * 35;
            pixels.data[offset + 2] = type === 'snow' ? 239 + grain * 16 : 15 + grain * 17;
            pixels.data[offset + 3] = density * (type === 'snow' ? 235 : 225);
        }
        m.putImageData(pixels, 0, 0);
        c.save(); c.translate(side ? width : 0, 0); c.scale(side ? -1 : 1, 1);
        c.drawImage(mask, 0, 0, depth, height);
        c.globalCompositeOperation = 'source-atop';
        if (type === 'snow') {
            c.strokeStyle = 'rgba(244,252,255,0.45)'; c.lineWidth = 0.9;
            for (let i = 0; i < 19; i++) {
                const y = height * (i + 0.4) / 19;
                const length = depth * (0.18 + Math.sin(i * 2.7 + side) ** 2 * 0.4);
                c.beginPath(); c.moveTo(0, y); c.lineTo(length, y - length * 0.4);
                for (let branch = 1; branch < 4; branch++) {
                    const x = length * branch / 4, by = y - x * 0.4;
                    c.moveTo(x, by); c.lineTo(x - length * 0.15, by - length * 0.18);
                    c.moveTo(x, by); c.lineTo(x - length * 0.1, by + length * 0.16);
                }
                c.stroke();
            }
        } else {
            c.strokeStyle = 'rgba(153,164,104,0.27)'; c.lineWidth = 1.4;
            for (let i = 0; i < 16; i++) {
                const x = depth * (0.18 + Math.sin(i * 3.3 + side) ** 2 * 0.3), y = height * i / 16;
                c.beginPath(); c.moveTo(x - 4, y);
                c.bezierCurveTo(x + 5, y + 6, x - 4, y + 14, x + 1, y + 22); c.stroke();
            }
        }
        c.restore();
        const rim = Math.min(height * (type === 'snow' ? 0.05 : side ? 0.065 : 0.025), type === 'snow' ? 40 : side ? 45 : 18);
        c.save();
        c.translate(side ? 0 : width, side ? height : 0);
        c.rotate(side ? -Math.PI / 2 : Math.PI / 2);
        c.drawImage(mask, 0, 0, rim, width);
        c.restore();
    }
    immersionEdgeCache.images.set(type, art);
    return art;
}

function getImmersionDustSprite() {
    if (immersionDustSprite) return immersionDustSprite;
    const art = document.createElement('canvas');
    art.width = art.height = 128;
    const c = art.getContext('2d');
    const dust = c.createRadialGradient(58, 67, 0, 64, 64, 64);
    dust.addColorStop(0, 'rgba(155,105,43,0.72)');
    dust.addColorStop(0.3, 'rgba(174,123,59,0.48)');
    dust.addColorStop(0.65, 'rgba(190,141,76,0.18)');
    dust.addColorStop(1, 'rgba(190,141,76,0)');
    c.fillStyle = dust; c.fillRect(0, 0, 128, 128);
    immersionDustSprite = art;
    return art;
}

function drawImmersionFire(ctx, width, height, intensity, time) {
    const reach = height * (0.15 + intensity * 0.14);
    const glow = ctx.createLinearGradient(0, height, 0, height - reach);
    glow.addColorStop(0, 'rgba(247,69,7,' + intensity * 0.52 + ')');
    glow.addColorStop(1, 'rgba(247,69,7,0)');
    ctx.fillStyle = glow; ctx.fillRect(0, height - reach, width, reach);
    const count = Math.min(24, Math.ceil(width / 75));
    for (let layer = 0; layer < 2; layer++) for (let i = -1; i <= count; i++) {
        const phase = i * 4.37 + layer * 2.1;
        const pulse = 0.72 + Math.sin(time * (5 + i % 3) + phase) * 0.17 + Math.sin(time * 9 + phase * 2) * 0.08;
        const flameHeight = reach * pulse * (layer ? 0.9 : 0.7);
        const flameWidth = Math.max(width / count * (layer ? 2.1 : 2.8), flameHeight * 0.65);
        const x = width * (i + layer * 0.43 + Math.sin(phase) * 0.24) / count;
        ctx.save(); ctx.translate(x + Math.sin(time * 2 + phase) * 4, height + reach * 0.13);
        ctx.rotate(Math.sin(time * 2.5 + phase) * 0.12);
        ctx.globalAlpha = intensity * (layer ? 0.68 : 0.42);
        ctx.drawImage(getTankFireSprite(), -flameWidth / 2, -flameHeight, flameWidth, flameHeight);
        ctx.restore();
    }
}

function drawImmersionRain(ctx, width, height, drops) {
    const scale = Math.max(0.8, Math.min(width, height) / 600);
    for (const drop of drops) {
        if (drop.life <= 0) continue;
        const x = drop.x * width, y = drop.y * height, r = Math.max(1.4, drop.radius * scale);
        const opacity = Math.min(1, drop.age * 2) * Math.min(1, drop.life);
        ctx.globalAlpha = opacity;
        const trail = Math.min(65, drop.age * drop.speed * height);
        const streak = ctx.createLinearGradient(x, y - trail, x, y);
        streak.addColorStop(0, 'rgba(198,225,237,0)'); streak.addColorStop(1, 'rgba(198,225,237,0.2)');
        ctx.strokeStyle = streak; ctx.lineWidth = Math.max(0.8, r * 0.28);
        ctx.beginPath(); ctx.moveTo(x - 1, y - trail); ctx.quadraticCurveTo(x + 1, y - trail / 2, x, y); ctx.stroke();
        const lens = ctx.createRadialGradient(x - r * 0.2, y - r * 0.3, 0, x, y, r * 1.5);
        lens.addColorStop(0, 'rgba(198,226,237,0.14)'); lens.addColorStop(1, 'rgba(7,22,31,0.3)');
        ctx.fillStyle = lens;
        ctx.beginPath(); ctx.moveTo(x, y - r * 1.8);
        ctx.bezierCurveTo(x - r * 1.4, y - r * 0.5, x - r, y + r, x, y + r * 1.2);
        ctx.bezierCurveTo(x + r, y + r, x + r * 1.3, y - r * 0.5, x, y - r * 1.8); ctx.fill();
        ctx.strokeStyle = 'rgba(232,247,255,0.7)'; ctx.lineWidth = Math.max(0.8, r * 0.16);
        ctx.beginPath(); ctx.arc(x, y, r * 0.75, 3.5, 4.6); ctx.stroke();
        ctx.strokeStyle = 'rgba(153,191,213,0.4)'; ctx.lineWidth = Math.max(0.8, r * 0.14);
        ctx.beginPath(); ctx.arc(x, y + r * 0.2, r * 0.8, 0.5, 1.8); ctx.stroke();
    }
    ctx.globalAlpha = 1;
}

let immersionStatusCache = null;
let immersionIlluminatArt = null;
const immersionPyroSprites = [];

function getImmersionPyroSprite(variant) {
    if (immersionPyroSprites[variant]) return immersionPyroSprites[variant];
    const art = document.createElement('canvas'); art.width = 128; art.height = 192;
    const c = art.getContext('2d'), pixels = c.createImageData(128, 192);
    let seed = 8137 + variant * 7919;
    const grid = new Float32Array(32 * 32);
    for (let i = 0; i < grid.length; i++) { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; grid[i] = seed / 4294967296; }
    const noise = (x, y) => {
        const ix = Math.floor(x), iy = Math.floor(y); let fx = x - ix, fy = y - iy;
        fx *= fx * (3 - 2 * fx); fy *= fy * (3 - 2 * fy);
        const at = (xx, yy) => grid[((yy + 32) % 32) * 32 + (xx + 32) % 32];
        return (at(ix, iy) * (1 - fx) + at(ix + 1, iy) * fx) * (1 - fy)
            + (at(ix, iy + 1) * (1 - fx) + at(ix + 1, iy + 1) * fx) * fy;
    };
    for (let y = 0; y < 192; y++) for (let x = 0; x < 128; x++) {
        const rise = y / 192, nx = (x - 64) / 64;
        const coarse = noise(x / 23, y / 28), fine = noise(x / 7, y / 9);
        const warp = Math.sin(rise * 11 + variant * 2) * 0.17 + (coarse - 0.5) * 0.34;
        const edge = 1 - Math.abs(nx + warp) / (0.1 + rise * 0.94);
        const density = Math.max(0, Math.min(1, (edge + (coarse * 0.7 + fine * 0.3 - 0.5) * 0.95) * 2.2));
        const hot = Math.max(0, Math.min(1, edge * 0.65 + rise * 0.3 + (coarse - 0.5) * 0.3 + (fine - 0.5) * 0.12));
        const fade = Math.min(1, rise * 12) * Math.min(1, (1 - rise) * 10);
        const index = (y * 128 + x) * 4;
        pixels.data[index] = 198 + hot * 57; pixels.data[index + 1] = 36 + hot * hot * 209;
        pixels.data[index + 2] = 6 + Math.pow(hot, 5) * 143; pixels.data[index + 3] = density * fade * 240;
    }
    c.putImageData(pixels, 0, 0);
    immersionPyroSprites[variant] = art;
    return art;
}

function getImmersionStatusArt(type, width, height, variant = 0) {
    if (!immersionStatusCache || immersionStatusCache.width !== width || immersionStatusCache.height !== height) {
        immersionStatusCache = { width, height, images: new Map() };
    }
    if (type === 'cracks' && immersionStatusCache.crackSeed !== variant) {
        immersionStatusCache.images.delete(type);
        immersionStatusCache.crackSeed = variant;
    }
    if (immersionStatusCache.images.has(type)) return immersionStatusCache.images.get(type);
    const art = document.createElement('canvas'); art.width = width; art.height = height;
    const c = art.getContext('2d');
    let seed = type === 'cracks' ? variant >>> 0 : 9713;
    const random = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; };
    if (type === 'cracks') {
        const paths = [];
        const columns = width > height * 1.5 ? 3 : 2, rows = height > width ? 3 : 2;
        for (let row = 0; row < rows; row++) for (let col = 0; col < columns; col++) {
            const cx = width * (col + 0.18 + random() * 0.64) / columns;
            const cy = height * (row + 0.18 + random() * 0.64) / rows;
            const radius = Math.hypot(width / columns, height / rows) * (0.62 + random() * 0.18);
            const count = 8 + Math.floor(random() * 5);
            const spokes = [];
            for (let ray = 0; ray < count; ray++) {
                const angle = ray * Math.PI * 2 / count + (random() - 0.5) * 0.28;
                const length = radius * (0.55 + random() * 0.65), points = [{ x: cx, y: cy }];
                for (let step = 1; step <= 8; step++) {
                    const bend = (random() - 0.5) * length * 0.045;
                    points.push({ x: cx + Math.cos(angle) * length * step / 8 - Math.sin(angle) * bend,
                        y: cy + Math.sin(angle) * length * step / 8 + Math.cos(angle) * bend });
                }
                spokes.push(points); paths.push(points);
                const branch = points[5], turn = angle + (ray % 2 ? 0.5 : -0.6);
                paths.push([branch, { x: branch.x + Math.cos(turn) * length * 0.13, y: branch.y + Math.sin(turn) * length * 0.13 },
                    { x: branch.x + Math.cos(turn + 0.15) * length * 0.23, y: branch.y + Math.sin(turn + 0.15) * length * 0.23 }]);
            }
            // Broken stress rings connect the radial fractures into damaged glass.
            for (const step of [2, 4, 6]) for (let ray = 0; ray < count; ray++) {
                if (random() < 0.28) continue;
                const a = spokes[ray][step], b = spokes[(ray + 1) % count][step];
                paths.push([a, { x: (a.x + b.x) / 2 + (random() - 0.5) * 5,
                    y: (a.y + b.y) / 2 + (random() - 0.5) * 5 }, b]);
            }
            c.fillStyle = 'rgba(210,230,236,0.3)';
            for (let chip = 0; chip < 15; chip++) {
                const x = cx + (random() - 0.5) * 15, y = cy + (random() - 0.5) * 15;
                c.beginPath(); c.moveTo(x, y); c.lineTo(x + random() * 5, y - 2);
                c.lineTo(x + 1, y + random() * 4); c.closePath(); c.fill();
            }
        }
        c.lineCap = 'round'; c.lineJoin = 'round'; c.beginPath();
        for (const points of paths) {
            c.moveTo(points[0].x, points[0].y);
            for (let i = 1; i < points.length; i++) c.lineTo(points[i].x, points[i].y);
        }
        c.strokeStyle = 'rgba(8,18,23,0.38)'; c.lineWidth = 1.6; c.stroke();
        c.save(); c.translate(0.45, -0.4);
        c.strokeStyle = 'rgba(222,239,244,0.72)'; c.lineWidth = 0.55; c.stroke(); c.restore();
    } else {
        // Low-resolution rime is baked once; fine crystal veins stay at viewport resolution.
        const texture = document.createElement('canvas'); texture.width = Math.min(384, width);
        texture.height = Math.max(1, Math.round(texture.width * height / width));
        const t = texture.getContext('2d'), pixels = t.createImageData(texture.width, texture.height);
        const grid = new Float32Array(33 * 33);
        for (let i = 0; i < grid.length; i++) grid[i] = random();
        const noise = (x, y) => {
            const ix = Math.floor(x), iy = Math.floor(y); let fx = x - ix, fy = y - iy;
            fx *= fx * (3 - 2 * fx); fy *= fy * (3 - 2 * fy);
            const at = (xx, yy) => grid[(yy % 33) * 33 + xx % 33];
            return (at(ix, iy) * (1 - fx) + at(ix + 1, iy) * fx) * (1 - fy)
                + (at(ix, iy + 1) * (1 - fx) + at(ix + 1, iy + 1) * fx) * fy;
        };
        for (let y = 0; y < texture.height; y++) for (let x = 0; x < texture.width; x++) {
            const nx = x / texture.width, ny = y / texture.height;
            const n = noise(nx * 7, ny * 7) * 0.62 + noise(nx * 28, ny * 28) * 0.28 + random() * 0.1;
            const edge = Math.min(nx / 0.18, (1 - nx) / 0.18, ny / 0.23, (1 - ny) / 0.23);
            const rime = Math.pow(Math.max(0, 1 - edge + (n - 0.5) * 0.6), 1.5);
            const alpha = type === 'frozen' ? 0.12 + n * 0.26 + rime * 0.44 : rime * (0.32 + n * 0.55);
            const index = (y * texture.width + x) * 4;
            pixels.data[index] = 174 + n * 68; pixels.data[index + 1] = 211 + n * 35;
            pixels.data[index + 2] = 230 + n * 24; pixels.data[index + 3] = Math.min(0.9, alpha) * 255;
        }
        t.putImageData(pixels, 0, 0); c.drawImage(texture, 0, 0, width, height);
        const frond = (x, y, angle, length, opacity) => {
            c.save(); c.translate(x, y); c.rotate(angle); c.globalAlpha = opacity;
            c.lineWidth = 0.6; c.strokeStyle = '#e8f9ff'; c.beginPath(); c.moveTo(0, 0);
            c.quadraticCurveTo(length * 0.025, length * 0.5, 0, length);
            for (let branch = 1; branch < 15; branch++) for (const side of [-1, 1]) {
                const along = branch / 16, reach = length * (0.12 + random() * 0.12) * Math.sin(along * Math.PI);
                const bx = side * reach, by = along * length + reach * 0.65;
                c.moveTo(0, along * length); c.quadraticCurveTo(bx * 0.45, along * length + reach * 0.2, bx, by);
                for (let twig = 1; twig <= 3; twig++) {
                    const tx = bx * twig / 4, ty = along * length + reach * 0.65 * twig / 4;
                    c.moveTo(tx, ty); c.lineTo(tx + side * reach * 0.3, ty - reach * 0.12);
                }
            }
            c.stroke(); c.restore();
        };
        for (let side = 0; side < 4; side++) {
            const span = side < 2 ? width : height, depth = side < 2 ? height : width;
            c.save();
            if (side === 1) { c.translate(width, height); c.rotate(Math.PI); }
            if (side === 2) { c.translate(0, height); c.rotate(-Math.PI / 2); }
            if (side === 3) { c.translate(width, 0); c.rotate(Math.PI / 2); }
            const count = Math.ceil(span / 65);
            for (let i = 0; i < count; i++) {
                const x = span * (i + random()) / count;
                frond(x, -3, (random() - 0.5) * 0.8, depth * (0.06 + random() * 0.11), 0.15 + random() * 0.27);
            }
            // Sparse slender icicles have curved edges, translucent cores and broken highlights.
            if (type === 'ice' && side < 2) for (let i = 0, count = Math.ceil(span / (side ? 135 : 90)); i < count; i++) {
                const x = span * (i + 0.2 + random() * 0.6) / count, half = 2 + random() * 4;
                const length = depth * (side ? 0.04 + random() * 0.06 : 0.07 + random() * 0.16);
                const tip = (random() - 0.5) * half;
                const ice = c.createLinearGradient(x - half, 0, x + half, 0);
                ice.addColorStop(0, 'rgba(102,171,203,0.18)'); ice.addColorStop(0.43, 'rgba(229,252,255,0.64)');
                ice.addColorStop(0.7, 'rgba(141,204,228,0.25)'); ice.addColorStop(1, 'rgba(239,252,255,0.5)');
                c.fillStyle = ice; c.beginPath(); c.moveTo(x - half, -2);
                c.quadraticCurveTo(x - half * 0.55, length * 0.65, x + tip, length);
                c.quadraticCurveTo(x + half * 0.4, length * 0.7, x + half, -2); c.closePath(); c.fill();
                c.strokeStyle = 'rgba(242,254,255,0.65)'; c.lineWidth = 0.7;
                c.beginPath(); c.moveTo(x - half * 0.4, length * 0.12); c.lineTo(x + tip * 0.7, length * 0.88); c.stroke();
            }
            c.restore();
        }
        if (type === 'frozen') for (let i = 0; i < 28; i++) {
            frond(random() * width, random() * height, random() * Math.PI * 2,
                Math.min(width, height) * (0.05 + random() * 0.18), 0.16 + random() * 0.2);
        }
    }
    immersionStatusCache.images.set(type, art);
    return art;
}

function getImmersionIlluminatArt() {
    if (immersionIlluminatArt) return immersionIlluminatArt;
    const art = document.createElement('canvas'); art.width = art.height = 384;
    const c = art.getContext('2d');
    c.scale(1.5, 1.5);
    drawTankOn(c, 128, 128, 190, 190, '#19111f', -Math.PI / 2, 1, 'illuminat', { illuminatUltStrength: 1 }, 0);
    c.globalCompositeOperation = 'source-atop'; c.fillStyle = 'rgba(8,4,14,0.8)'; c.fillRect(0, 0, 256, 256);
    c.globalCompositeOperation = 'source-over';
    const glow = c.createRadialGradient(128, 143, 1, 128, 143, 48);
    glow.addColorStop(0, 'rgba(255,47,24,0.9)'); glow.addColorStop(0.35, 'rgba(214,12,9,0.4)'); glow.addColorStop(1, 'rgba(255,10,0,0)');
    c.fillStyle = glow; c.fillRect(80, 95, 96, 96);
    const eye = c.createRadialGradient(127, 141, 1, 128, 143, 43);
    eye.addColorStop(0, '#ffcd9b'); eye.addColorStop(0.16, '#ff5830'); eye.addColorStop(0.55, '#bc1c17'); eye.addColorStop(1, '#390a13');
    c.fillStyle = eye; c.beginPath(); c.moveTo(83, 143);
    c.quadraticCurveTo(128, 115, 173, 143); c.quadraticCurveTo(128, 170, 83, 143); c.fill();
    c.fillStyle = '#19060c'; c.beginPath(); c.ellipse(128, 143, 6, 13, 0, 0, Math.PI * 2); c.fill();
    c.fillStyle = 'rgba(255,227,196,0.85)'; c.beginPath(); c.ellipse(123, 137, 2, 3, 0.4, 0, Math.PI * 2); c.fill();
    immersionIlluminatArt = art;
    return art;
}

function drawImmersionPyro(ctx, width, height, intensity, time) {
    ctx.save();
    const glow = ctx.createRadialGradient(width / 2, height / 2, Math.min(width, height) * 0.28,
        width / 2, height / 2, Math.hypot(width, height) * 0.55);
    glow.addColorStop(0, 'rgba(244,75,8,0)'); glow.addColorStop(0.65, 'rgba(211,59,8,0.11)');
    glow.addColorStop(1, 'rgba(255,108,16,0.46)');
    ctx.globalAlpha = intensity; ctx.fillStyle = glow; ctx.fillRect(0, 0, width, height);
    // Local -Y points into the screen; every plume base stays beyond its own edge.
    for (let edge = 0; edge < 4; edge++) {
        const span = edge < 2 ? width : height, depth = edge < 2 ? height : width;
        const count = Math.min(24, Math.ceil(span / 75) + 2);
        ctx.save();
        if (edge === 0) ctx.translate(0, height);
        if (edge === 1) { ctx.translate(width, 0); ctx.rotate(Math.PI); }
        if (edge === 2) ctx.rotate(Math.PI / 2);
        if (edge === 3) { ctx.translate(width, height); ctx.rotate(-Math.PI / 2); }
        for (let i = -1; i <= count; i++) {
            const phase = i * 2.39996 + edge * 1.73;
            const cycle = (time * (0.45 + (i + 4) % 4 * 0.06) + (i + 1) * 0.381 + edge * 0.217) % 1;
            const envelope = Math.pow(Math.sin(cycle * Math.PI), 0.6);
            const x = span * (i + 0.5 + Math.sin(time * 1.8 + phase) * 0.16) / count;
            const y = depth * (0.065 - cycle * 0.025);
            const tall = Math.min(width, height) * (0.2 + (Math.sin(phase) + 1) * 0.08) * (0.7 + cycle * 0.55);
            const broad = Math.max(span / count * 1.6, tall * (0.6 + Math.sin(phase * 2) * 0.15));
            ctx.save(); ctx.translate(x, y); ctx.rotate(Math.sin(time * 2 + phase) * 0.1);
            ctx.globalAlpha = intensity * envelope * 0.85;
            ctx.drawImage(getImmersionPyroSprite((i + 3 + edge) % 3), -broad / 2, -tall, broad, tall);
            ctx.globalAlpha *= 0.18;
            ctx.drawImage(getTankBlastSprite('ember', (i + 3) % 2), -broad * 0.65, -tall * 0.65, broad * 1.3, tall * 0.7);
            ctx.restore();
        }
        ctx.restore();
    }
    ctx.restore();
}

function drawImmersionStatusEffects(ctx, width, height, state, time) {
    ctx.save();
    if (state.heat > 0.005 && !state.iced) {
        const heat = ctx.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, Math.hypot(width, height) / 2);
        heat.addColorStop(0, 'rgba(255,139,54,0.025)'); heat.addColorStop(0.55, 'rgba(235,94,25,0.1)');
        heat.addColorStop(1, 'rgba(255,64,9,0.48)');
        ctx.globalAlpha = state.heat * (0.88 + Math.sin(time * 8) * 0.12); ctx.fillStyle = heat; ctx.fillRect(0, 0, width, height);
    }
    if (state.gas > 0.005) {
        ctx.globalAlpha = state.gas; ctx.fillStyle = 'rgba(45,106,17,0.16)'; ctx.fillRect(0, 0, width, height);
        const gas = getOrdnanceExplosionSprite('tint', 'rgba(72,139,28,0.48)');
        for (let i = 0; i < 8; i++) {
            const x = width * ((i * 0.381 + time * 0.012) % 1), y = height * (0.1 + (i % 3) * 0.4) + Math.sin(time * 0.6 + i) * height * 0.08;
            ctx.globalAlpha = state.gas * (0.28 + Math.sin(time * 0.7 + i) * 0.07);
            ctx.drawImage(gas, x - width * 0.45, y - height * 0.48, width * 0.9, height * 0.96);
        }
    }
    if (state.ice > 0) {
        const ice = getImmersionStatusArt('ice', width, height);
        const scale = 1 + (1 - Math.sqrt(state.ice)) * 0.28;
        ctx.globalAlpha = state.ice;
        ctx.drawImage(ice, width * (1 - scale) / 2, height * (1 - scale) / 2, width * scale, height * scale);
    }
    if (state.frozen > 0) {
        ctx.globalAlpha = state.frozen; ctx.drawImage(getImmersionStatusArt('frozen', width, height), 0, 0);
    }
    if (state.drill > 0.005) {
        ctx.globalAlpha = state.drill * 0.85;
        ctx.drawImage(getImmersionStatusArt('cracks', width, height, state.drillSeed || 0), Math.sin(time * 27) * state.drill * 0.35, 0);
    }
    if (state.illuminatAge < 1) {
        const progress = state.illuminatAge, travel = progress * progress * (3 - 2 * progress);
        const size = Math.min(width * 0.75, height * 0.7, 460) * (0.88 + Math.sin(progress * Math.PI) * 0.12);
        const x = width / 2 + Math.sin(progress * Math.PI) * width * 0.025;
        const y = height * (1 - travel) + size * (0.5 - travel);
        const opacity = Math.pow(Math.sin(progress * Math.PI), 0.5);
        ctx.save(); ctx.translate(x, y); ctx.rotate(Math.sin(progress * Math.PI * 2) * 0.035);
        for (let echo = 3; echo > 0; echo--) {
            ctx.globalAlpha = opacity * (0.065 - echo * 0.012);
            ctx.drawImage(getImmersionIlluminatArt(), -size / 2, -size / 2 + echo * size * 0.06, size, size);
        }
        ctx.globalAlpha = opacity * 0.9;
        ctx.drawImage(getImmersionIlluminatArt(), -size / 2, -size / 2, size, size); ctx.restore();
    }
    ctx.restore();
}

let immersionSceneSnapshot = null;
const immersionInsectSprites = [];
let immersionElectricPaths = null;

function getImmersionFlySprite(frame, flying) {
    const key = frame + (flying ? 4 : 0);
    if (immersionInsectSprites[key]) return immersionInsectSprites[key];
    const art = document.createElement('canvas'); art.width = art.height = 48;
    const c = art.getContext('2d'); c.translate(24, 24);
    c.strokeStyle = '#11130f'; c.lineWidth = 0.9; c.lineCap = 'round';
    for (const side of [-1, 1]) for (let leg = 0; leg < 3; leg++) {
        const stride = Math.sin(frame * Math.PI / 2 + leg * 1.7) * (flying ? 1 : 2);
        c.beginPath(); c.moveTo(side * 3, (leg - 1) * 3);
        c.lineTo(side * 7, (leg - 1) * 6 + stride);
        c.lineTo(side * 11, (leg - 1) * 8 + stride); c.stroke();
    }
    for (const side of [-1, 1]) {
        c.save(); c.translate(side * 2, -2); c.rotate(side * (flying ? 0.65 + frame % 2 * 0.65 : 0.3));
        c.fillStyle = flying ? 'rgba(85,104,105,0.28)' : 'rgba(102,120,122,0.38)';
        c.strokeStyle = 'rgba(32,43,41,0.48)'; c.lineWidth = 0.55;
        c.beginPath(); c.ellipse(side * 4, 6, flying ? 6.5 : 4.5, 11, -side * 0.2, 0, Math.PI * 2); c.fill(); c.stroke();
        c.beginPath(); c.moveTo(0, 0); c.lineTo(side * 5, 14); c.moveTo(side * 2, 6); c.lineTo(side * 8, 7); c.stroke(); c.restore();
    }
    c.fillStyle = '#080b09'; c.beginPath(); c.ellipse(0, 5, 3.7, 6.8, 0, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#242c29'; c.beginPath(); c.ellipse(0, -1, 4.2, 4.8, 0, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#090b09'; c.beginPath(); c.ellipse(0, -7, 4, 3, 0, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#43201a'; c.beginPath(); c.ellipse(-2.7, -7.3, 1.3, 2, -0.3, 0, Math.PI * 2); c.ellipse(2.7, -7.3, 1.3, 2, 0.3, 0, Math.PI * 2); c.fill();
    immersionInsectSprites[key] = art;
    return art;
}

function getImmersionElectricPaths(seed) {
    if (immersionElectricPaths && immersionElectricPaths.seed === seed) return immersionElectricPaths.paths;
    let randomState = seed ^ 0x73a91;
    const random = () => { randomState = (Math.imul(randomState, 1664525) + 1013904223) >>> 0; return randomState / 4294967296; };
    const fracture = (a, b, roughness, steps) => {
        let points = [a, b];
        for (let step = 0; step < steps; step++) {
            const next = [points[0]];
            for (let i = 1; i < points.length; i++) {
                const p = points[i - 1], q = points[i], offset = (random() - 0.5) * roughness;
                next.push({ x: (p.x + q.x) / 2 - (q.y - p.y) * offset,
                    y: (p.y + q.y) / 2 + (q.x - p.x) * offset }, q);
            }
            points = next; roughness *= 0.82;
        }
        return points;
    };
    const paths = [];
    for (let i = 0; i < 5; i++) {
        const roots = [[-0.02, 0.23], [1.02, 0.68], [0.65, -0.02], [0.26, 1.02], [1.02, 0.12]];
        const tips = [[0.4, 0.35], [0.62, 0.55], [0.57, 0.39], [0.37, 0.65], [0.73, 0.28]];
        const start = { x: roots[i][0], y: roots[i][1] }, end = { x: tips[i][0] + (random() - 0.5) * 0.2, y: tips[i][1] + (random() - 0.5) * 0.2 };
        const points = fracture(start, end, 0.8, 6);
        paths.push({ points, branch: false, phase: random() * 6 });
        for (let j = 0; j < 3; j++) {
            const p = points[17 + j * 16], angle = Math.atan2(end.y - start.y, end.x - start.x) + (random() > 0.5 ? 1 : -1) * (0.45 + random());
            const length = 0.07 + random() * 0.14;
            paths.push({ points: fracture(p, { x: p.x + Math.cos(angle) * length, y: p.y + Math.sin(angle) * length }, 1, 5),
                branch: true, phase: random() * 6 });
        }
    }
    immersionElectricPaths = { seed, paths };
    return paths;
}

let immersionWaterSpraySprite = null;

function getImmersionWaterSpraySprite() {
    if (immersionWaterSpraySprite) return immersionWaterSpraySprite;
    const art = document.createElement('canvas'); art.width = 32; art.height = 64;
    const c = art.getContext('2d'), water = c.createLinearGradient(0, 0, 0, 64);
    water.addColorStop(0, 'rgba(174,230,250,0)'); water.addColorStop(0.6, 'rgba(111,199,232,0.32)');
    water.addColorStop(0.85, 'rgba(210,246,255,0.8)'); water.addColorStop(1, 'rgba(80,168,201,0.1)');
    c.fillStyle = water; c.beginPath(); c.moveTo(16, 0);
    c.bezierCurveTo(15, 25, 6, 39, 9, 51); c.bezierCurveTo(12, 64, 26, 57, 24, 46);
    c.bezierCurveTo(21, 33, 17, 18, 16, 0); c.fill();
    c.strokeStyle = 'rgba(241,253,255,0.85)'; c.lineWidth = 1.6;
    c.beginPath(); c.moveTo(12, 39); c.quadraticCurveTo(9, 46, 12, 51); c.stroke();
    immersionWaterSpraySprite = art;
    return art;
}

function drawImmersionWaterImpact(ctx, width, height, state, scene) {
    const time = state.sprayTime, seed = state.spraySeed, x = width * 0.5, y = height * 0.48;
    const scale = Math.max(0.7, Math.min(width, height) / 500), radius = Math.min(width, height) * 0.095;
    ctx.save(); ctx.globalCompositeOperation = 'source-over'; ctx.lineCap = 'round';
    if (scene) {
        ctx.save(); ctx.globalAlpha = state.water * 0.65; ctx.beginPath(); ctx.ellipse(x, y, radius * 0.9, radius * 0.65, 0, 0, Math.PI * 2); ctx.clip();
        const side = radius * 2;
        ctx.drawImage(scene, x - radius, y - radius, side, side,
            x - radius + Math.sin(time * 8) * 2, y - radius + Math.cos(time * 7) * 2, side, side); ctx.restore();
    }
    // Short-lived water webs break apart independently; there is no static full-screen film.
    for (let i = 0; i < 7; i++) {
        const progress = (time * (1.7 + i % 3 * 0.2) + i * 0.618034) % 1;
        const direction = seed + i * 2.39996, reach = radius * (0.35 + Math.sqrt(progress) * (1.3 + i % 3 * 0.45));
        const spread = 0.16 + i % 3 * 0.08;
        const point = (a, r) => [x + Math.cos(a) * r, y + Math.sin(a) * r + progress * progress * radius * 0.45];
        ctx.globalAlpha = state.water * Math.sin(progress * Math.PI) * 0.65;
        ctx.beginPath(); ctx.moveTo(...point(direction - spread, radius * 0.2));
        ctx.quadraticCurveTo(...point(direction - spread, reach * 0.6), ...point(direction - spread * 0.7, reach));
        ctx.quadraticCurveTo(...point(direction, reach * 1.12), ...point(direction + spread, reach * 0.88));
        ctx.quadraticCurveTo(...point(direction + spread, reach * 0.5), ...point(direction + spread, radius * 0.2)); ctx.closePath();
        ctx.fillStyle = 'rgba(125,208,238,0.2)'; ctx.fill();
        ctx.beginPath(); ctx.moveTo(...point(direction - spread * 0.7, reach));
        ctx.quadraticCurveTo(...point(direction, reach * 1.12), ...point(direction + spread, reach * 0.88));
        ctx.strokeStyle = 'rgba(226,249,255,0.8)'; ctx.lineWidth = 1.2 * scale; ctx.stroke();
    }
    const pressure = ctx.createRadialGradient(x, y, 0, x, y, radius * 0.9);
    pressure.addColorStop(0, 'rgba(242,253,255,0.65)'); pressure.addColorStop(0.4, 'rgba(178,232,251,0.3)'); pressure.addColorStop(1, 'rgba(180,234,253,0)');
    ctx.globalAlpha = state.water; ctx.fillStyle = pressure; ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);
    const spray = getImmersionWaterSpraySprite();
    for (let i = 0; i < 130; i++) {
        const life = 0.38 + i % 7 * 0.055, progress = (time / life + i * 0.618034) % 1;
        const direction = seed + i * 2.39996 + Math.sin(i * 13.7) * 0.2;
        const distance = progress * Math.min(width, height) * (0.45 + i % 5 * 0.15);
        const px = x + Math.cos(direction) * distance, py = y + Math.sin(direction) * distance + progress * progress * height * 0.17;
        const size = (2.8 + i % 7 * 1.05) * scale * (i % 13 === 0 ? 1.8 : 1) * (0.8 + progress * 0.6);
        ctx.save(); ctx.translate(px, py); ctx.rotate(direction - Math.PI / 2);
        ctx.globalAlpha = state.water * Math.min(1, progress * 18) * Math.pow(1 - progress, 0.4);
        ctx.drawImage(spray, -size, -size * 2.2, size * 2, size * 4.4); ctx.restore();
    }
    ctx.restore();
}

function drawImmersionWaterDrops(ctx, width, height, drops, scene) {
    const scale = Math.max(0.9, Math.min(width, height) / 600);
    for (const drop of drops) {
        const x = drop.x * width, y = drop.y * height, r = drop.radius * scale;
        const opacity = Math.min(1, drop.age * 10) * Math.min(1, drop.life);
        ctx.save(); ctx.globalAlpha = opacity;
        const trail = Math.min(height * 0.08, drop.age * (drop.speed || 0.04) * height * 0.7);
        const streak = ctx.createLinearGradient(x, y - trail, x, y);
        streak.addColorStop(0, 'rgba(174,218,232,0)'); streak.addColorStop(1, 'rgba(183,226,241,0.12)');
        ctx.strokeStyle = streak; ctx.lineWidth = Math.max(1.3, r * 0.18); ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(x + Math.sin(drop.seed) * r * 0.25, y - trail);
        ctx.bezierCurveTo(x - r * 0.3, y - trail * 0.6, x + r * 0.35, y - trail * 0.3, x, y); ctx.stroke();
        // The lens magnifies the live battlefield; the surrounding wet film remains transparent.
        const shape = () => {
            ctx.beginPath(); ctx.moveTo(x + Math.sin(drop.seed) * r * 0.12, y - r * 1.9);
            ctx.bezierCurveTo(x - r * 0.1, y - r * 0.95, x - r * 0.85, y - r * 0.1, x - r * 0.65, y + r * 0.5);
            ctx.bezierCurveTo(x - r * 0.4, y + r * 1.2, x + r * 0.6, y + r * 1.2, x + r * 0.7, y + r * 0.4);
            ctx.bezierCurveTo(x + r * 0.85, y - r * 0.2, x + r * 0.13, y - r * 1.1, x + Math.sin(drop.seed) * r * 0.12, y - r * 1.9); ctx.closePath();
        };
        if (scene) {
            ctx.save(); shape(); ctx.clip();
            const sx = Math.max(0, x - r), sy = Math.max(0, y - r * 1.9);
            const sw = Math.min(r * 2, width - sx), sh = Math.min(r * 3.2, height - sy);
            if (sw > 0 && sh > 0) ctx.drawImage(scene, sx, sy, sw, sh, sx - r * 0.2, sy - r * 0.2, sw * 1.22, sh * 1.18);
            ctx.restore();
        }
        const lens = ctx.createRadialGradient(x - r * 0.25, y - r * 0.3, r * 0.1, x, y, r * 1.3);
        lens.addColorStop(0, 'rgba(224,247,255,0.18)'); lens.addColorStop(0.5, 'rgba(114,173,197,0.025)'); lens.addColorStop(0.82, 'rgba(13,38,49,0.12)'); lens.addColorStop(1, 'rgba(64,119,138,0.18)');
        shape(); ctx.fillStyle = lens; ctx.fill(); ctx.strokeStyle = 'rgba(8,30,39,0.25)'; ctx.lineWidth = 0.8; ctx.stroke();
        ctx.strokeStyle = 'rgba(235,251,255,0.88)'; ctx.lineWidth = Math.max(1, r * 0.1);
        ctx.beginPath(); ctx.moveTo(x - r * 0.2, y - r * 0.6); ctx.bezierCurveTo(x - r * 0.4, y - r * 0.36, x - r * 0.57, y, x - r * 0.5, y + r * 0.25); ctx.stroke();
        ctx.strokeStyle = 'rgba(218,246,255,0.54)'; ctx.lineWidth = Math.max(0.7, r * 0.06);
        ctx.beginPath(); ctx.moveTo(x + r * 0.1, y + r * 0.8); ctx.quadraticCurveTo(x + r * 0.4, y + r * 0.74, x + r * 0.48, y + r * 0.4); ctx.stroke();
        ctx.restore();
    }
}

function drawImmersionMusicDistortion(ctx, width, height, pulses, scene, time) {
    ctx.save();
    // Refraction follows only the two newest wavefronts, leaving the center clear.
    for (const stamp of pulses.slice(-2)) {
        const progress = (time - stamp / 60) / 0.9;
        if (progress < 0 || progress >= 1) continue;
        const radius = Math.hypot(width, height) * (0.035 + progress * 0.65);
        const band = Math.min(width, height) * 0.025 * (1 - progress * 0.4);
        const inner = Math.max(0.5, radius - band);
        ctx.save(); ctx.beginPath();
        ctx.ellipse(width / 2, height / 2, radius + band, (radius + band) * 0.74, 0, 0, Math.PI * 2);
        ctx.moveTo(width / 2 + inner, height / 2);
        ctx.ellipse(width / 2, height / 2, inner, inner * 0.74, 0, 0, Math.PI * 2);
        ctx.clip('evenodd');
        const zoom = 1 + Math.sin(progress * 26) * 0.012 * (1 - progress);
        ctx.globalAlpha = (1 - progress) * 0.75;
        ctx.drawImage(scene, width * (1 - zoom) / 2, height * (1 - zoom) / 2, width * zoom, height * zoom);
        ctx.restore();
    }
    ctx.restore();
}

function drawImmersionMusic(ctx, width, height, state, time) {
    const pulses = state.musicPulses || [];
    if (!pulses.length) return;
    ctx.save(); ctx.lineCap = 'round';
    const diagonal = Math.hypot(width, height), overlap = 1 / Math.max(1, pulses.length * 0.7);
    for (const stamp of pulses) {
        const age = time - stamp / 60, progress = age / 0.9;
        if (progress < 0 || progress >= 1) continue;
        const radius = diagonal * (0.035 + progress * 0.65), fade = Math.pow(1 - progress, 0.75);
        const phase = stamp * 0.037 + age * 0.18;
        for (let section = 0; section < 3; section++) {
            const start = phase + section * Math.PI * 2 / 3, end = start + Math.PI * 0.52;
            const arc = (r, offset = 0) => {
                ctx.beginPath(); ctx.ellipse(width / 2, height / 2, r, r * 0.74, 0, start + offset, end + offset);
            };
            ctx.globalAlpha = fade * overlap;
            arc(radius); ctx.strokeStyle = 'rgba(93,174,255,0.12)'; ctx.lineWidth = 14 + fade * 8; ctx.stroke();
            ctx.strokeStyle = 'rgba(135,236,255,0.68)'; ctx.lineWidth = 2; ctx.stroke();
            arc(Math.max(1, radius - 4)); ctx.strokeStyle = 'rgba(207,159,255,0.5)'; ctx.lineWidth = 1.2; ctx.stroke();
            const echoRadius = Math.max(1, radius - diagonal * (0.015 + progress * 0.035));
            arc(echoRadius, 0.12); ctx.globalAlpha = fade * overlap * 0.28;
            ctx.strokeStyle = '#b29cff'; ctx.lineWidth = 2.5; ctx.stroke();
        }
    }
    const envelope = Math.max(0, 1 - state.musicAge / 0.9), count = Math.max(24, Math.min(48, Math.floor(width / 15)));
    const spectrum = ctx.createLinearGradient(0, 0, width, 0);
    spectrum.addColorStop(0, '#75eaff'); spectrum.addColorStop(0.5, '#939bff'); spectrum.addColorStop(1, '#d29bff');
    for (let i = 0; i < count; i++) {
        const energy = 0.15 + Math.sin(i * 0.68 + time * 7) ** 2 * 0.5 + Math.sin(time * 18 - i * 0.39) ** 2 * 0.35;
        const heightOfBar = Math.min(width, height) * 0.08 * energy * envelope, x = width * (i + 1) / (count + 1);
        ctx.beginPath(); ctx.moveTo(x, height - 5); ctx.lineTo(x, height - 5 - heightOfBar);
        ctx.strokeStyle = spectrum; ctx.globalAlpha = envelope * 0.12; ctx.lineWidth = 7; ctx.stroke();
        ctx.globalAlpha = envelope * 0.6; ctx.lineWidth = 2.3; ctx.stroke();
    }
    ctx.globalAlpha = envelope; ctx.fillStyle = 'rgba(114,131,255,0.018)'; ctx.fillRect(0, 0, width, height);
    ctx.restore();
}

function drawImmersionImpactReactions(ctx, width, height, state, time) {
    ctx.save(); ctx.globalAlpha = 1;
    const diagonal = Math.hypot(width, height);
    drawImmersionMusic(ctx, width, height, state, time);
    if (state.barrageAge < 1.1) {
        const age = state.barrageAge, progress = age / 1.1, fade = Math.pow(1 - progress, 0.7);
        ctx.globalAlpha = Math.max(0, 1 - age / 0.1) * 0.1; ctx.fillStyle = '#ffe6b5'; ctx.fillRect(0, 0, width, height);
        for (let i = 0; i < 8; i++) {
            const side = i % 4, along = 0.2 + Math.floor(i / 4) * 0.6;
            const size = Math.min(width, height) * (0.55 + age * 0.35);
            const inset = size * (0.04 + age * 0.07);
            const x = side === 0 ? inset : side === 1 ? width - inset : width * along;
            const y = side === 2 ? inset : side === 3 ? height - inset : height * along;
            ctx.globalAlpha = Math.pow(Math.sin(progress * Math.PI), 0.8) * 0.36;
            ctx.drawImage(getTankBlastSprite('dust'), x - size / 2, y - size / 2, size, size);
        }
        for (let i = 0; i < 24; i++) {
            const side = i % 2 ? 1 : -1, size = 1.5 + i % 4;
            const x = width * (side < 0 ? 0.04 + age * (0.1 + i % 3 * 0.03) : 0.96 - age * (0.1 + i % 3 * 0.03));
            const y = height * (0.1 + i * 0.137 % 0.75 - age * 0.12 + age * age * 0.3);
            ctx.save(); ctx.translate(x, y); ctx.rotate(i * 1.7 + age * (4 + i % 3)); ctx.globalAlpha = fade * 0.8;
            ctx.fillStyle = ['#a58e66', '#d6bf94', '#5d584a'][i % 3];
            ctx.beginPath(); ctx.moveTo(-size, -size * 0.3); ctx.lineTo(size, -size * 0.5); ctx.lineTo(size * 0.4, size * 0.6); ctx.closePath(); ctx.fill(); ctx.restore();
        }
    }
    if (state.airAge < 0.9) {
        const age = state.airAge, progress = age / 0.9, fade = Math.pow(1 - progress, 0.7);
        ctx.save(); ctx.translate(width / 2, height / 2); ctx.rotate(state.airAngle || 0); ctx.lineCap = 'round';
        for (let i = 0; i < 2; i++) {
            const size = Math.min(width, height) * 0.65, x = diagonal * (-0.35 + progress * 0.75 - i * 0.18);
            const y = Math.min(width, height) * (i ? 0.17 : -0.2);
            ctx.globalAlpha = fade * 0.13;
            ctx.drawImage(getTankBlastSprite('dust'), x - size / 2, y - size / 2, size, size);
        }
        for (let i = 0; i < 20; i++) {
            const head = diagonal * (-0.4 + progress * 1.1 + i % 4 * 0.15), length = diagonal * (0.14 + i % 3 * 0.06);
            const y = diagonal * ((i * 0.618034) % 1 - 0.5), bend = Math.sin(i * 3.7 + age * 10) * 12;
            ctx.beginPath(); ctx.moveTo(head - length, y);
            ctx.bezierCurveTo(head - length * 0.7, y + bend, head - length * 0.2, y - bend * 0.5, head, y + bend * 0.3);
            ctx.globalAlpha = fade; ctx.strokeStyle = 'rgba(160,225,210,0.05)'; ctx.lineWidth = 10; ctx.stroke();
            ctx.strokeStyle = 'rgba(212,244,234,0.6)'; ctx.lineWidth = 1.1 + i % 3 * 0.65; ctx.stroke();
        }
        for (let i = 0; i < 62; i++) {
            const x = diagonal * (((i * 0.618034 + progress * 1.1) % 1) - 0.5), y = diagonal * ((i * 0.273) % 1 - 0.5);
            const size = 1 + i % 4 * 0.65;
            ctx.globalAlpha = fade * 0.8; ctx.fillStyle = i % 3 ? '#c7c0a2' : '#e9f5de';
            ctx.beginPath(); ctx.moveTo(x - size * 2, y); ctx.lineTo(x, y - size * 0.6); ctx.lineTo(x + size, y + size * 0.5); ctx.closePath(); ctx.fill();
        }
        ctx.restore();
    }
    ctx.restore();
}

function drawImmersionCombatEffects(ctx, width, height, state, time) {
    ctx.save(); ctx.globalAlpha = 1;
    const impact = state.impactAge < 0.85, barrage = state.barrageAge < 1.1, music = state.musicAge < 0.9;
    let scene = null;
    if ((impact || barrage || music || state.overload > 0.005 || state.water > 0.005 || state.wetDrops.length > 0) && ctx.canvas) {
        if (!immersionSceneSnapshot || immersionSceneSnapshot.width !== width || immersionSceneSnapshot.height !== height) {
            immersionSceneSnapshot = document.createElement('canvas');
            immersionSceneSnapshot.width = width; immersionSceneSnapshot.height = height;
        }
        const snapshot = immersionSceneSnapshot.getContext('2d');
        snapshot.globalCompositeOperation = 'copy'; snapshot.drawImage(ctx.canvas, 0, 0, width, height);
        snapshot.globalCompositeOperation = 'source-over'; scene = immersionSceneSnapshot;
    }
    if (scene && (impact || barrage || music)) {
        let dx = 0, dy = 0;
        if (impact) {
            const age = state.impactAge, strength = Math.min(24, Math.min(width, height) * 0.045) * Math.pow(1 - age / 0.85, 2);
            dx += (Math.sin(age * 97) + Math.sin(age * 163) * 0.4) * strength;
            dy += Math.cos(age * 113) * strength * 0.75;
        }
        if (barrage && state.barrageShockAge < 0.4) {
            const age = state.barrageShockAge, strength = Math.min(9, Math.min(width, height) * 0.014) * Math.pow(1 - age / 0.4, 2);
            dx += Math.sin(age * 103) * strength; dy += Math.cos(age * 137) * strength * 0.7;
        }
        if (music && state.musicAge < 0.3) {
            const age = state.musicAge, strength = Math.min(2.5, Math.min(width, height) * 0.004) * (1 - age / 0.3);
            dx += Math.sin(age * 125) * strength; dy += Math.cos(age * 107) * strength * 0.5;
        }
        const margin = impact ? 0.04 : (barrage ? 0.018 * Math.pow(Math.max(0, 1 - state.barrageShockAge / 0.4), 2) : 0)
            + (music ? 0.004 * Math.max(0, 1 - state.musicAge / 0.3) : 0);
        ctx.fillStyle = '#211c13'; ctx.fillRect(0, 0, width, height);
        ctx.drawImage(scene, -width * margin + dx, -height * margin + dy, width * (1 + margin * 2), height * (1 + margin * 2));
    }
    if (scene && music) drawImmersionMusicDistortion(ctx, width, height, state.musicPulses || [], scene, time);
    if (impact) {
        const age = state.impactAge, fade = Math.max(0, 1 - age / 0.85);
        for (let i = 0; i < 18; i++) {
            const angle = i * 2.39996, spread = 0.2 + age * 1.6;
            const x = width * (0.5 + Math.cos(angle) * spread * (0.25 + i % 3 * 0.09));
            const y = height * (0.98 - age * (0.5 + i % 4 * 0.14));
            const size = Math.max(width, height) * (0.22 + age * 0.45 + i % 3 * 0.035);
            ctx.globalAlpha = Math.pow(Math.sin(Math.min(1, age / 0.85) * Math.PI), 1.2) * 0.24;
            ctx.drawImage(getTankBlastSprite('dust'), x - size / 2, y - size / 2, size, size);
        }
        ctx.globalAlpha = 1;
        if (age < 0.65 && !state.iced) drawTankExplosion(ctx, { x: width / 2, y: height * 0.96,
            radius: Math.min(width, height) * 0.26, maxLife: 0.65, life: 0.65 - age, seed: 0.31 });
        const pressure = ctx.createRadialGradient(width / 2, height * 0.94, 0, width / 2, height * 0.94, Math.max(width, height) * 0.65);
        pressure.addColorStop(0, 'rgba(255,234,180,' + Math.max(0, 1 - age / 0.13) * 0.6 + ')');
        pressure.addColorStop(0.25, 'rgba(218,189,130,' + fade * 0.08 + ')'); pressure.addColorStop(1, 'rgba(30,22,13,0)');
        ctx.fillStyle = pressure; ctx.fillRect(0, 0, width, height);
        if (age < 0.38) {
            ctx.globalAlpha = (1 - age / 0.38) * 0.35; ctx.strokeStyle = '#e9d4ac'; ctx.lineWidth = 2 + fade * 5;
            ctx.beginPath(); ctx.ellipse(width / 2, height * 1.06, width * (0.04 + age * 2.4), height * (0.03 + age * 1.7), 0, Math.PI, Math.PI * 2); ctx.stroke();
        }
        for (let i = 0; i < 38; i++) {
            const velocity = 0.45 + i % 7 * 0.15, angle = Math.PI * (1.12 + i * 0.618 % 0.78);
            const x = width * (0.5 + Math.cos(angle) * velocity * age), y = height * (1.02 + Math.sin(angle) * velocity * age + age * age * 0.7);
            const size = 1.5 + i % 4 * 1.5;
            ctx.save(); ctx.globalAlpha = fade; ctx.translate(x, y); ctx.rotate(i * 1.7 + age * (i % 5 + 4));
            ctx.fillStyle = ['#514738', '#9c8861', '#c1ac7e', '#302d26'][i % 4];
            ctx.beginPath(); ctx.moveTo(-size, -size * 0.3); ctx.lineTo(size * 0.6, -size * 0.6); ctx.lineTo(size, size * 0.4); ctx.lineTo(-size * 0.5, size * 0.65); ctx.closePath(); ctx.fill(); ctx.restore();
        }
        ctx.globalAlpha = 1;
    }
    drawImmersionImpactReactions(ctx, width, height, state, time);
    if (state.overload > 0.005) {
        const phase = Math.floor(time * 9);
        if (scene) for (let i = 0; i < 32; i++) {
            const edge = i % 4, sw = width * (0.08 + i % 5 * 0.025), sh = 2 + i % 3 * 3;
            const sx = edge === 0 ? 0 : edge === 1 ? width - sw : ((i * 0.173 + phase * 0.037) % 1) * (width - sw);
            const sy = edge < 2 ? ((i * 0.173 + phase * 0.037) % 1) * (height - sh) : edge === 2 ? 0 : height - sh;
            const shift = Math.sin(i * 4.3 + phase) * width * 0.025 * state.overload;
            const lift = edge < 2 ? Math.cos(i + phase) * 3 : Math.cos(i + phase) * height * 0.02;
            ctx.globalAlpha = state.overload;
            ctx.drawImage(scene, sx, sy, sw, sh, sx + shift, sy + lift, sw, sh);
            ctx.strokeStyle = i % 3 ? 'rgba(63,228,255,0.55)' : 'rgba(245,62,134,0.5)';
            ctx.lineWidth = 1; ctx.strokeRect(sx + shift, sy + lift, sw, sh);
        }
        ctx.globalCompositeOperation = 'difference'; ctx.globalAlpha = state.overload; ctx.fillStyle = '#ffffff';
        for (let i = 0; i < 5; i++) {
            const sw = width * (0.09 + (i + phase) % 3 * 0.045), sh = height * (0.07 + i % 3 * 0.045);
            const x = i % 2 ? width - sw : 0, y = ((i * 0.217 + phase * 0.023) % 0.82) * height;
            ctx.fillRect(x, y, sw, sh);
        }
        ctx.globalCompositeOperation = 'source-over';
        // Local signal loss, displaced scan bands and dead pixels keep the center readable.
        if (scene) for (let i = 0; i < 3; i++) {
            const y = ((phase * 0.071 + i * 0.317) % 0.96) * height, h = 3 + i * 3;
            const shift = Math.sin(phase * 3 + i) * width * 0.05;
            ctx.globalAlpha = state.overload * 0.55;
            ctx.drawImage(scene, 0, y, width, h, shift, y, width, h);
            ctx.fillStyle = i % 2 ? 'rgba(70,236,255,0.2)' : 'rgba(255,48,122,0.18)'; ctx.fillRect(0, y, width, 1);
        }
        ctx.globalAlpha = state.overload;
        for (let i = 0; i < 100; i++) {
            const side = i % 4, along = ((i * 0.618034 + phase * 0.037) % 1), depth = (Math.sin(i * 71 + phase * 5) + 1) * 0.055;
            const x = side === 0 ? depth * width : side === 1 ? (1 - depth) * width : along * width;
            const y = side === 2 ? depth * height : side === 3 ? (1 - depth) * height : along * height;
            ctx.fillStyle = ['rgba(2,8,15,0.85)', 'rgba(105,241,255,0.65)', 'rgba(247,58,138,0.5)', 'rgba(214,246,255,0.6)'][i % 4];
            ctx.fillRect(x, y, 2 + i % 6 * 2, 1 + i % 3);
        }
        for (let side = 0; side < 4; side++) {
            ctx.beginPath();
            for (let j = 0; j < 13; j++) {
                const along = j / 12, depth = (0.015 + (j % 3) * 0.014) * (0.7 + Math.sin(phase + j * 1.7) * 0.3);
                const x = side < 2 ? (side ? 1 - depth : depth) * width : along * width;
                const y = side < 2 ? along * height : (side === 2 ? depth : 1 - depth) * height;
                if (j) ctx.lineTo(x, y); else ctx.moveTo(x, y);
            }
            ctx.globalAlpha = state.overload * 0.5; ctx.strokeStyle = '#070a14'; ctx.lineWidth = 4; ctx.stroke();
            ctx.strokeStyle = side % 2 ? '#e2549b' : '#65f0fc'; ctx.lineWidth = 0.8; ctx.stroke();
        }
    }
    if (state.electricAge < 0.7) {
        const age = state.electricAge, fade = Math.pow(1 - age / 0.7, 0.65);
        const paths = getImmersionElectricPaths(Math.round((time - age) * 60));
        ctx.globalAlpha = fade; ctx.fillStyle = 'rgba(103,150,255,0.035)'; ctx.fillRect(0, 0, width, height);
        ctx.lineJoin = 'round'; ctx.lineCap = 'round';
        for (const bolt of paths) {
            const visible = Math.min(1, age / (bolt.branch ? 0.13 : 0.07));
            const count = Math.max(2, Math.ceil(bolt.points.length * visible));
            ctx.beginPath();
            for (let i = 0; i < count; i++) {
                const p = bolt.points[i], x = p.x * width, y = p.y * height;
                if (i) ctx.lineTo(x, y); else ctx.moveTo(x, y);
            }
            const pulse = 0.7 + Math.pow(Math.sin(age * 37 + bolt.phase), 2) * 0.3, thickness = bolt.branch ? 0.45 : 1;
            ctx.globalAlpha = fade * pulse;
            for (const [color, size] of [['rgba(80,83,255,0.07)', 18], ['rgba(71,133,255,0.22)', 7], ['rgba(149,205,255,0.85)', 2.7], ['rgba(246,253,255,1)', 0.9]]) {
                ctx.strokeStyle = color; ctx.lineWidth = size * thickness; ctx.stroke();
            }
        }
    }
    if (state.swarm > 0.005) for (let i = 0; i < state.insects.length; i++) {
        const bug = state.insects[i], size = Math.max(24, Math.min(34, Math.min(width, height) * 0.055)) * bug.size * (i % 7 === 0 ? 1.5 : 1);
        ctx.save(); ctx.translate(bug.x * width, bug.y * height); ctx.rotate(bug.angle + Math.PI / 2);
        const sprite = getImmersionFlySprite((Math.floor(time * (bug.flying ? 53 : 12) + bug.phase) + i) % 4, bug.flying);
        if (bug.flying) {
            ctx.globalAlpha = state.swarm * 0.16; ctx.drawImage(sprite, -size / 2, -size / 2 + size * 0.19, size, size);
        }
        ctx.globalAlpha = state.swarm * 0.95;
        ctx.drawImage(sprite, -size / 2, -size / 2, size, size);
        ctx.restore();
    }
    if (state.water > 0.005) drawImmersionWaterImpact(ctx, width, height, state, scene);
    ctx.globalAlpha = 1;
    drawImmersionWaterDrops(ctx, width, height, state.wetDrops, scene);
    ctx.restore();
}

function drawImmersionEffects(ctx, width, height, unit) {
    const death = typeof advanceImmersionDeath === 'function' ? advanceImmersionDeath(performance.now()) : null;
    if (!window.immersionEnabled) { immersionPresentation = null; return; }
    ctx.save(); ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
    if (death && death.elapsed < death.duration) {
        immersionPresentation = null;
        const progress = Math.min(1, death.elapsed / death.duration);
        if (!death.blast) death.blast = { seed: 0.73, maxLife: 1 };
        Object.assign(death.blast, { x: width / 2, y: height * 0.6, radius: Math.hypot(width, height) * 0.85, life: 1 - progress });
        // Camera recoil affects only the overlay and settles before the result window.
        ctx.save();
        const recoil = Math.pow(1 - progress, 3) * Math.min(width, height) * 0.025;
        ctx.translate(Math.sin(progress * 83) * recoil, Math.cos(progress * 97) * recoil);
        drawTankExplosion(ctx, death.blast);
        ctx.restore();
        const flash = Math.max(0, 1 - progress / 0.1);
        if (flash > 0) {
            ctx.fillStyle = 'rgba(255,242,198,' + flash * 0.95 + ')'; ctx.fillRect(0, 0, width, height);
        }
        ctx.fillStyle = 'rgba(15,12,9,' + Math.max(0, (progress - 0.65) / 0.35) * 0.65 + ')';
        ctx.fillRect(0, 0, width, height);
    } else {
        const biome = GameTerrain.current();
        const state = updateImmersionPresentation(unit, biome, window.frameCount || 0, GameTerrain.getMotion(unit).strength || 0);
        if (state) {
            const time = (window.frameCount || 0) / 60;
            for (const type of ['snow', 'swamp']) if (state[type] > 0.005) {
                ctx.globalAlpha = state[type];
                const drift = type === 'swamp' ? Math.sin(time * 0.3) * 2 : 0;
                ctx.drawImage(getImmersionEdgeArt(type, width, height), 0, drift - 2, width, height + 4);
            }
            ctx.globalAlpha = 1;
            if (state.rain > 0.005) {
                const wet = ctx.createLinearGradient(0, 0, 0, height);
                wet.addColorStop(0, 'rgba(76,121,148,' + state.rain * 0.015 + ')');
                wet.addColorStop(1, 'rgba(34,83,112,' + state.rain * 0.055 + ')');
                ctx.fillStyle = wet; ctx.fillRect(0, 0, width, height);
            }
            if (state.desert > 0.005) {
                const gust = 0.45 + Math.sin(time * 0.7) ** 2 * 0.55;
                ctx.fillStyle = 'rgba(170,117,48,' + state.desert * gust * 0.16 + ')';
                ctx.fillRect(0, 0, width, height);
                for (let i = 0; i < 140; i++) {
                    const speed = 170 + (i % 7) * 47;
                    const x = ((time * speed + i * 97) % (width + 100)) - 50;
                    const y = height * ((i * 0.381) % 1) + Math.sin(time * 0.8 + i) * 18;
                    ctx.strokeStyle = (i % 3 === 0 ? 'rgba(86,51,20,' : 'rgba(248,220,158,') + state.desert * gust * (0.4 + i % 3 * 0.12) + ')';
                    ctx.lineWidth = i % 4 === 0 ? 2 : 1;
                    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - 3 - i % 9, y + 1.3); ctx.stroke();
                }
                const cloud = getImmersionDustSprite();
                for (let i = 0; i < 3; i++) {
                    const x = ((time * 75 + i * width * 0.63) % (width * 1.9)) - width * 0.65;
                    ctx.globalAlpha = state.desert * gust * 0.7;
                    ctx.drawImage(cloud, x, height * (-0.04 + i * 0.34), width * 0.95, height * 0.5);
                }
            }
            ctx.globalAlpha = 1;
            drawImmersionRain(ctx, width, height, state.drops);
            if (!state.iced && Math.max(state.fire, state.pyro) > 0.005) {
                if (state.pyro > 0.005) drawImmersionPyro(ctx, width, height, state.pyro, time);
                else drawImmersionFire(ctx, width, height, state.fire, time);
            }
            for (const puff of state.iced ? [] : state.smoke) {
                const size = height * puff.size * (1 + puff.age * 0.65);
                ctx.save(); ctx.translate(puff.x * width, puff.y * height); ctx.rotate(puff.angle + puff.age * 0.05);
                ctx.globalAlpha = Math.min(1, puff.age * 3) * Math.sqrt(Math.max(0, 1 - puff.age / 3.2)) * (puff.pyro ? 0.3 : 0.38);
                ctx.drawImage(puff.pyro ? getTankBlastSprite('smoke') : getOrdnanceExplosionSprite('tankSmoke'), -size / 2, -size / 2, size, size); ctx.restore();
            }
            drawImmersionStatusEffects(ctx, width, height, state, time);
            drawImmersionCombatEffects(ctx, width, height, state, time);
        }
    }
    ctx.restore();
}

function renderGameFrame() {
    const isMenuBackdrop = gameState === 'menu' && mainMenu && mainMenu.style.display !== 'none';
    if (isMenuBackdrop && menuBackdropWidth === canvas.width &&
        menuBackdropHeight === canvas.height && menuBackdropObjects === objects &&
        menuBackdropObjectCount === objects.length) {
        drawPreview();
        updateCoinDisplay();
        return;
    }
    menuBackdropWidth = 0;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // ensure normal drawing mode
    ctx.globalCompositeOperation = 'source-over';

    // Viewport culling optimizations
    let camX = 0;
    let camY = 0;
    let cameraTranslated = false;

    if (cameraFollow) {
        const offsetX = canvas.width/2 - (tank.x + tank.w/2);
        const offsetY = canvas.height/2 - (tank.y + tank.h/2);

        ctx.save();
        ctx.translate(offsetX, offsetY);
        cameraTranslated = true;

        camX = tank.x + tank.w/2 - canvas.width/2;
        camY = tank.y + tank.h/2 - canvas.height/2;
        // Expose to mobile controls
        window._camX = camX;
        window._camY = camY;
    } else {
        window._camX = 0;
        window._camY = 0;
    }

    // Define safe view bounds for culling (viewport + margin)
    const cullMargin = 150;
    const viewLeft = camX - cullMargin;
    const viewRight = camX + canvas.width + cullMargin;
    const viewTop = camY - cullMargin;
    const viewBottom = camY + canvas.height + cullMargin;

    // Helper: is visible? (Simple AABB check)
    // Objects/Tanks use w/h, Particles/Bullets circles use size/w radius approximation
    function isVisible(x, y, w, h) {
        return (x + w > viewLeft && x < viewRight && y + h > viewTop && y < viewBottom);
    }

    // 1. Фон (сетка)
    GameTerrain.drawGround(ctx, viewLeft, viewTop, viewRight - viewLeft, viewBottom - viewTop);
    if ((currentMode !== 'training' || gameState !== 'playing') && GameTerrain.current() !== 'lava') {
        drawWorldGrid(viewLeft, viewRight, viewTop, viewBottom);
    }

    objects.forEach(obj => {
        const rad = obj.radius || 0;
        if (obj.type !== 'iceField') return;
        if (!isVisible(obj.x - rad, obj.y - rad, obj.w || (rad * 2), obj.h || (rad * 2))) return;
        drawIceFieldGround(ctx, obj);
    });

    // 2. Частицы пыли
    if (gameState === 'playing') GameTerrain.drawMovement(ctx, viewLeft, viewTop, viewRight, viewBottom, tank, objects);
    particles.forEach(p => {
        if (window.effectsEnabled === false) return;
        if (!isVisible(p.x, p.y, p.size || 4, p.size || 4)) return;
        const alpha = Math.min(1, Math.max(0, p.life));
        if (p.rgb) {
            ctx.fillStyle = `rgba(${p.rgb}, ${alpha})`;
        } else {
            ctx.fillStyle = p.color || `rgba(139, 69, 19, ${alpha})`;
        }
        ctx.beginPath();
        ctx.arc(p.x + p.size/2, p.y + p.size/2, p.size/2, 0, Math.PI * 2);
        ctx.fill();
    });

    // 3. Объекты
    objects.forEach(obj => {
        const rad = (obj.radius || 0) * (obj.type === 'tankWreck' ? 2.3 : obj.explosionStyle === 'tank' ? 1.65 : obj.explosionStyle ? 1.35 : 1);
        if (!isVisible(obj.x - rad, obj.y - rad, obj.w || (rad*2), obj.h || (rad*2))) return;
        if (obj.type === 'iceField' || obj.type === 'tankDamageSmoke') return;
        if (window.effectsEnabled === false && ['explosion', 'shockwave', 'implosion', 'terrainDebris',
            'romanRemnant', 'woodDecay', 'woodIceImpact'].includes(obj.type)) return;
        if (obj.type === 'visualRocket' && obj.barrageVisual && obj.delay > 0) return;

        ctx.save();
        ctx.fillStyle = obj.color;
        if (obj.type === 'wall') {
            const wx = obj.x, wy = obj.y, ww = obj.w, wh = obj.h;
            const brokenShape = getWallBreakShape(obj);
            if (brokenShape) { ctx.save(); clipWallBreakShape(ctx, obj, brokenShape); }
            // Metallic/Industrial Block
            const grad = ctx.createLinearGradient(wx, wy, wx + ww, wy + wh);
            grad.addColorStop(0, '#555');
            grad.addColorStop(0.5, '#333');
            grad.addColorStop(1, '#222');
            ctx.fillStyle = grad;
            ctx.fillRect(wx, wy, ww, wh);

            // Inner bevel
            ctx.lineWidth = 2;
            ctx.strokeStyle = '#666';
            ctx.beginPath(); ctx.moveTo(wx+ww, wy); ctx.lineTo(wx, wy); ctx.lineTo(wx, wy+wh); ctx.stroke();
            ctx.strokeStyle = '#111';
            ctx.beginPath(); ctx.moveTo(wx+ww, wy); ctx.lineTo(wx+ww, wy+wh); ctx.lineTo(wx, wy+wh); ctx.stroke();

            // Rivets on corners
            ctx.fillStyle = '#111';
            const m = 4;
            ctx.fillRect(wx+m, wy+m, 2, 2);
            ctx.fillRect(wx+ww-m-2, wy+m, 2, 2);
            ctx.fillRect(wx+m, wy+wh-m-2, 2, 2);
            ctx.fillRect(wx+ww-m-2, wy+wh-m-2, 2, 2);

            // Simple X brace pattern in center for industrial feel
            ctx.strokeStyle = 'rgba(0,0,0,0.3)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(wx + 4, wy + 4); ctx.lineTo(wx + ww - 4, wy + wh - 4);
            ctx.moveTo(wx + ww - 4, wy + 4); ctx.lineTo(wx + 4, wy + wh - 4);
            ctx.stroke();

            GameTerrain.drawWallCover(ctx, obj);
            if (brokenShape) ctx.restore();
            drawWallBrokenEdges(ctx, obj, brokenShape);

        } else if (obj.type === 'woodenWall') {
            const brokenShape = getWallBreakShape(obj, true);
            if (brokenShape) { ctx.save(); clipWallBreakShape(ctx, obj, brokenShape); }
            GameTerrain.drawWoodenWall(ctx, obj);
            GameTerrain.drawWallCover(ctx, obj);
            if (brokenShape) ctx.restore();
            drawWallBrokenEdges(ctx, obj, brokenShape);
            if (obj.woodRotAmount) {
                ctx.save(); if (brokenShape) clipWallBreakShape(ctx, obj, brokenShape);
                GameTerrain.drawWoodenWallRot(ctx, obj); ctx.restore();
            }
            GameTerrain.drawWoodenWallBurn(ctx, obj, window.frameCount || 0, brokenShape && brokenShape.points);
            drawEmbeddedProjectiles(ctx, obj, false);

        } else if (obj.type === 'barrel') {
            GameTerrain.drawBarrel(ctx, obj);
        } else if (obj.type === 'targetCircle') {
            if (obj.buratinoBarrage) {
                const warning = Math.min(1, obj.elapsed / obj.warningTicks);
                const flash = (obj.flashTicks || 0) / 8;
                ctx.fillStyle = obj.ultimate
                    ? `rgba(233, 65, 25, ${0.11 + flash * 0.22})`
                    : `rgba(241, 158, 50, ${0.09 + flash * 0.22})`;
                ctx.strokeStyle = obj.ultimate ? 'rgba(255, 106, 58, 0.78)' : 'rgba(255, 190, 96, 0.78)';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.arc(obj.x, obj.y, obj.radius, 0, Math.PI * 2);
                ctx.fill();
                ctx.stroke();
                if (obj.elapsed < obj.warningTicks) {
                    ctx.lineWidth = 3;
                    ctx.strokeStyle = 'rgba(255, 234, 175, 0.9)';
                    ctx.beginPath();
                    ctx.arc(obj.x, obj.y, obj.radius, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * warning);
                    ctx.stroke();
                }
            } else {
                ctx.strokeStyle = obj.color;
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.arc(obj.x, obj.y, obj.radius, 0, Math.PI * 2);
                ctx.stroke();
            }
        } else if (obj.type === 'woodIceImpact') {
            drawWoodIceImpact(ctx, obj);
        } else if (obj.type === 'romanRemnant') {
            drawRomanRemnant(ctx, obj);
        } else if (obj.type === 'woodDecay') {
            drawWoodDecay(ctx, obj);
        } else if (obj.type === 'tankOilTrail') {
            drawTankOilTrail(ctx, obj);
        } else if (obj.type === 'tankWreck') {
            drawTankWreck(ctx, obj);
        } else if (obj.type === 'terrainDebris') {
            drawTerrainDebris(ctx, obj);
        } else if (obj.type === 'explosion') {
            if (obj.explosionStyle === 'tank' || (!obj.explosionStyle && !obj.color)) drawTankExplosion(ctx, obj);
            else drawOrdnanceExplosion(ctx, obj);
        } else if (obj.type === 'shockwave') {
            const maxLife = obj.maxLife || 20;
            const t = Math.max(0, obj.life / maxLife);
            const alpha = t * 0.75;
            ctx.save();
            // Квант shockwave: cyan energy ring with segments
            if (obj.color === '#00e5ff') {
                const r = Math.max(1, obj.radius);
                // Outer ring
                ctx.strokeStyle = `rgba(0,229,255,${alpha * 0.9})`;
                ctx.lineWidth = Math.max(0.5, 4 * t);
                ctx.shadowColor = '#00e5ff';
                ctx.shadowBlur = 18 * t;
                ctx.beginPath(); ctx.arc(obj.x, obj.y, r, 0, Math.PI * 2); ctx.stroke();
                // Inner ring (thinner, slightly smaller)
                ctx.strokeStyle = `rgba(150,255,255,${alpha * 0.5})`;
                ctx.lineWidth = Math.max(0.5, 1.5 * t);
                ctx.shadowBlur = 8 * t;
                ctx.beginPath(); ctx.arc(obj.x, obj.y, Math.max(1, r * 0.72), 0, Math.PI * 2); ctx.stroke();
                // Energy arc segments rotating with time
                ctx.lineWidth = Math.max(0.5, 2.5 * t);
                ctx.strokeStyle = `rgba(255,255,255,${alpha * 0.7})`;
                ctx.shadowBlur = 10 * t;
                const _segCount = 6;
                const _segOff = (Date.now() * 0.003) % (Math.PI * 2);
                for (let _si = 0; _si < _segCount; _si++) {
                    const _sa = _segOff + (_si / _segCount) * Math.PI * 2;
                    ctx.beginPath(); ctx.arc(obj.x, obj.y, r, _sa, _sa + 0.32); ctx.stroke();
                }
                ctx.shadowBlur = 0;
            } else if (obj.tankBlast) {
                ctx.strokeStyle = `rgba(215,191,150,${t * t * 0.3})`;
                ctx.lineWidth = Math.max(0.5, 4 * t);
                ctx.beginPath(); ctx.ellipse(obj.x, obj.y, obj.radius, obj.radius * 0.75, 0, 0, Math.PI * 2); ctx.stroke();
            } else {
                // Default shockwave (orange/yellow)
                ctx.strokeStyle = `rgba(255,220,110,${alpha})`;
                ctx.lineWidth = Math.max(0.5, 3.5 * t);
                ctx.shadowColor = `rgba(255,190,0,${alpha * 0.8})`;
                ctx.shadowBlur = 12;
                ctx.beginPath(); ctx.arc(obj.x, obj.y, Math.max(1, obj.radius), 0, Math.PI * 2); ctx.stroke();
            }
            ctx.restore();
        } else if (obj.type === 'implosion') {
            const maxLife = obj.maxLife || 30;
            const progress = obj.life / maxLife; // Shrinks as life decreases
            // Ensure radius is positive and alpha valid
            const r = Math.max(0, obj.radius * progress);
            const alpha = Math.min(1, Math.max(0, 1 - (obj.life / maxLife))); // Fades in? Or just constant?
            // Actually implosion should start big and shrink.
            // life starts high, goes to 0.
            // progress starts at 1, goes to 0. Radius starts max, goes to 0. Correct.
            
            ctx.globalAlpha = 0.7; // Constant alpha or fade out?
            ctx.fillStyle = obj.color;
            ctx.beginPath();
            ctx.arc(obj.x, obj.y, r, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalAlpha = 1;
        } else if (obj.type === 'visualRocket') {
            ctx.save();
            ctx.translate(obj.x, obj.y);
            const ang = Math.atan2(obj.vy, obj.vx);
            ctx.rotate(ang);
            
            ctx.fillStyle = '#3a4a2a'; // darker olive
            const mw = obj.w; 
            const mh = obj.h;
            ctx.fillRect(-mw/2, -mh/2, mw, mh);
            
            ctx.fillStyle = '#8b0000';
            ctx.beginPath();
            ctx.moveTo(mw/2, -mh/2);
            ctx.lineTo(mw/2 + mh, 0);
            ctx.lineTo(mw/2, mh/2);
            ctx.fill();
            
            ctx.fillStyle = '#1a1a1a';
            ctx.beginPath(); ctx.moveTo(-mw/2, -mh/2); ctx.lineTo(-mw/2 - 2, -mh/2 - 2); ctx.lineTo(-mw/2 + 2, -mh/2); ctx.fill();
            ctx.beginPath(); ctx.moveTo(-mw/2, mh/2); ctx.lineTo(-mw/2 - 2, mh/2 + 2); ctx.lineTo(-mw/2 + 2, mh/2); ctx.fill();
            
            ctx.fillStyle = '#ffaa00';
            ctx.beginPath(); ctx.arc(-mw/2, 0, 1.5, 0, Math.PI*2); ctx.fill();
            
            ctx.restore();
        } else if (obj.type === 'gas') {
            drawPoisonCloud(ctx, obj);
        } else if (obj.type === 'pharaohSwarm') {
            drawPharaohSwarm(ctx, obj);
        } else if (obj.type === 'iceField') {
            drawIceFieldGround(ctx, obj);
        } else if (obj.type === 'sandstorm') {
            const maxLife = obj.maxLife || 300;
            const lifeRatio = Math.max(0, (obj.life || 0) / maxLife);
            const alpha = 0.16 + lifeRatio * 0.28;
            ctx.save();
            ctx.translate(obj.x, obj.y);
            const swirl = Date.now() * 0.00095;

            const haze = ctx.createRadialGradient(0, 0, obj.radius * 0.12, 0, 0, obj.radius * 1.02);
            haze.addColorStop(0, `rgba(242,224,180,${alpha * 0.14})`);
            haze.addColorStop(0.48, `rgba(201,163,92,${alpha * 0.36})`);
            haze.addColorStop(0.82, `rgba(138,101,44,${alpha * 0.24})`);
            haze.addColorStop(1, 'rgba(92,67,28,0)');
            ctx.fillStyle = haze;
            ctx.beginPath();
            ctx.arc(0, 0, obj.radius, 0, Math.PI * 2);
            ctx.fill();

            for (let i = 0; i < 2; i++) {
                ctx.save();
                ctx.rotate(swirl * (i % 2 === 0 ? 1 : -0.8) + i * 0.9);
                ctx.scale(1, 0.72 + i * 0.08);
                const layerRadius = obj.radius * (0.96 - i * 0.18);
                const layerGrad = ctx.createRadialGradient(0, 0, layerRadius * 0.14, 0, 0, layerRadius);
                layerGrad.addColorStop(0, `rgba(255,238,196,${alpha * (0.05 + i * 0.03)})`);
                layerGrad.addColorStop(0.5, `rgba(205,170,105,${alpha * (0.18 + i * 0.05)})`);
                layerGrad.addColorStop(1, 'rgba(150,104,45,0)');
                ctx.fillStyle = layerGrad;
                ctx.beginPath();
                ctx.arc(0, 0, layerRadius, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            }

            ctx.strokeStyle = `rgba(110,74,28,${alpha * 0.7})`;
            ctx.lineWidth = 3;
            ctx.setLineDash([16, 10]);
            ctx.beginPath();
            ctx.arc(0, 0, obj.radius * 0.98, swirl * 32, swirl * 32 + Math.PI * 2);
            ctx.stroke();
            ctx.setLineDash([]);

            ctx.strokeStyle = `rgba(247,229,178,${alpha * 0.42})`;
            ctx.lineWidth = 1.4;
            ctx.beginPath();
            ctx.arc(0, 0, obj.radius * 0.82, 0, Math.PI * 2);
            ctx.stroke();

            ctx.strokeStyle = `rgba(245,224,170,${alpha * 0.42})`;
            ctx.lineWidth = 2;
            for (let i = 0; i < 2; i++) {
                ctx.beginPath();
                ctx.arc(0, 0, obj.radius * (0.32 + i * 0.18), swirl * 1.4 + i * 0.7, swirl * 1.4 + i * 0.7 + Math.PI * 1.25);
                ctx.stroke();
            }

            ctx.fillStyle = `rgba(235,216,160,${alpha * 0.52})`;
            for (let i = 0; i < 8; i++) {
                const ang = swirl * 2.2 + i * 0.52;
                const dist = obj.radius * (0.16 + ((i * 13) % 8) / 10 * 0.72);
                const size = 1.5 + (i % 3) * 0.9;
                ctx.beginPath();
                ctx.arc(Math.cos(ang) * dist, Math.sin(ang) * dist, size, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.restore();
        } else if (obj.type === 'hellLava') {
            // Boss fight lava pool — organic molten shape
            const _lt = Date.now() * 0.0012;
            const _lx = obj.x, _ly = obj.y, _lw = obj.w, _lh = obj.h;
            const _cx = _lx + _lw * 0.5, _cy = _ly + _lh * 0.5;
            const _maxSize = Math.max(_lw, _lh);

            ctx.save();
            ctx.translate(0, 5);
            traceHellLavaPoolPath(ctx, obj);
            ctx.fillStyle = 'rgba(34,8,0,0.42)';
            ctx.fill();
            ctx.restore();

            ctx.save();
            traceHellLavaPoolPath(ctx, obj);
            ctx.clip();

            const _bedGrad = ctx.createLinearGradient(_lx, _ly, _lx + _lw, _ly + _lh);
            _bedGrad.addColorStop(0, '#341004');
            _bedGrad.addColorStop(0.34, '#7a1f04');
            _bedGrad.addColorStop(0.7, '#c53b00');
            _bedGrad.addColorStop(1, '#4d1200');
            ctx.fillStyle = _bedGrad;
            ctx.fillRect(_lx - 16, _ly - 16, _lw + 32, _lh + 32);

            const _coreGrad = ctx.createRadialGradient(
                _cx + Math.sin(_lt * 1.5) * _lw * 0.08,
                _cy + Math.cos(_lt * 1.1) * _lh * 0.06,
                _maxSize * 0.06,
                _cx,
                _cy,
                _maxSize * 0.72
            );
            _coreGrad.addColorStop(0, 'rgba(255,251,176,0.95)');
            _coreGrad.addColorStop(0.24, 'rgba(255,194,70,0.88)');
            _coreGrad.addColorStop(0.56, 'rgba(255,100,18,0.54)');
            _coreGrad.addColorStop(1, 'rgba(120,24,0,0)');
            ctx.globalCompositeOperation = 'screen';
            ctx.fillStyle = _coreGrad;
            ctx.fillRect(_lx - 16, _ly - 16, _lw + 32, _lh + 32);
            ctx.globalCompositeOperation = 'source-over';

            for (let _fi = 0; _fi < 3; _fi++) {
                ctx.save();
                ctx.translate(_cx, _cy);
                ctx.rotate(Math.sin(_lt * 0.6 + _fi * 1.1) * 0.22 + _fi * 0.6);
                ctx.scale(1, 0.34 + _fi * 0.09);
                const _flowGrad = ctx.createLinearGradient(-_lw * 0.7, 0, _lw * 0.7, 0);
                _flowGrad.addColorStop(0, 'rgba(255,120,0,0)');
                _flowGrad.addColorStop(0.25, 'rgba(255,166,34,0.2)');
                _flowGrad.addColorStop(0.5, 'rgba(255,235,132,0.46)');
                _flowGrad.addColorStop(0.75, 'rgba(255,123,15,0.24)');
                _flowGrad.addColorStop(1, 'rgba(255,120,0,0)');
                ctx.fillStyle = _flowGrad;
                ctx.beginPath();
                ctx.ellipse(0, Math.sin(_lt * 1.9 + _fi) * _lh * 0.08, _lw * (0.34 + _fi * 0.07), _lh * 0.18, 0, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            }

            for (let _bi = 0; _bi < 6; _bi++) {
                const _bpx = _lx + _lw * (0.14 + _bi * 0.14) + Math.sin(_lt * 1.5 + _bi * 1.7) * _lw * 0.06;
                const _bpy = _ly + _lh * (0.32 + (_bi % 3) * 0.18) + Math.cos(_lt * 1.2 + _bi * 1.4) * _lh * 0.08;
                const _br = Math.min(_lw, _lh) * (0.06 + 0.025 * Math.sin(_lt * 2.2 + _bi));
                const _bGrad = ctx.createRadialGradient(_bpx, _bpy, 0, _bpx, _bpy, _br);
                _bGrad.addColorStop(0, `rgba(255,247,176,${0.55 + 0.2 * Math.sin(_lt * 2 + _bi)})`);
                _bGrad.addColorStop(0.5, 'rgba(255,170,48,0.38)');
                _bGrad.addColorStop(1, 'rgba(255,120,0,0)');
                ctx.fillStyle = _bGrad;
                ctx.beginPath();
                ctx.arc(_bpx, _bpy, _br, 0, Math.PI * 2);
                ctx.fill();
            }

            ctx.fillStyle = 'rgba(68,16,0,0.18)';
            for (let _ci = 0; _ci < 3; _ci++) {
                ctx.beginPath();
                ctx.ellipse(
                    _lx + _lw * (0.28 + _ci * 0.22),
                    _ly + _lh * (0.4 + (_ci % 2) * 0.2),
                    _lw * (0.06 + _ci * 0.015),
                    _lh * (0.05 + _ci * 0.02),
                    _ci * 0.6,
                    0,
                    Math.PI * 2
                );
                ctx.fill();
            }
            ctx.restore();

            ctx.save();
            ctx.shadowColor = 'rgba(255,174,52,0.7)';
            ctx.shadowBlur = 16;
            traceHellLavaPoolPath(ctx, obj);
            ctx.lineWidth = 10;
            ctx.strokeStyle = 'rgba(78,18,0,0.78)';
            ctx.stroke();
            ctx.shadowBlur = 10;
            ctx.lineWidth = 3;
            ctx.strokeStyle = `rgba(255,194,74,${0.6 + 0.18 * Math.sin(_lt * 2.2)})`;
            ctx.stroke();
            ctx.restore();

            ctx.save();
            traceHellLavaPoolPath(ctx, obj, 12);
            ctx.strokeStyle = `rgba(255,234,156,${0.2 + 0.12 * Math.sin(_lt * 3.1)})`;
            ctx.lineWidth = 1.5;
            ctx.setLineDash([16, 10]);
            ctx.stroke();
            ctx.setLineDash([]);
            ctx.restore();
        } else if (obj.type === 'hellRift') {
            // Boss fight dimensional rift — dark purple/crimson crack
            const _rt = Date.now() * 0.0015;
            const _rx = obj.x, _ry = obj.y, _rw = obj.w, _rh = obj.h;
            const _rGrad = ctx.createLinearGradient(_rx, _ry, _rx + _rw, _ry + _rh);
            _rGrad.addColorStop(0,   '#1a0022');
            _rGrad.addColorStop(0.5, '#5a0044');
            _rGrad.addColorStop(1,   '#1a0022');
            ctx.fillStyle = _rGrad;
            ctx.fillRect(_rx, _ry, _rw, _rh);
            // Pulsing inner glow
            const _rInner = ctx.createRadialGradient(
                _rx + _rw * 0.5, _ry + _rh * 0.5, 0,
                _rx + _rw * 0.5, _ry + _rh * 0.5, Math.max(_rw, _rh) * 0.55);
            const _rAlpha = 0.5 + 0.4 * Math.sin(_rt * 2);
            _rInner.addColorStop(0, `rgba(200,0,255,${_rAlpha})`);
            _rInner.addColorStop(0.5, `rgba(100,0,80,${_rAlpha * 0.4})`);
            _rInner.addColorStop(1, 'rgba(0,0,0,0)');
            ctx.fillStyle = _rInner;
            ctx.fillRect(_rx, _ry, _rw, _rh);
            // Crack lines across the rift
            ctx.shadowColor = '#dd00ff'; ctx.shadowBlur = 8;
            ctx.strokeStyle = `rgba(220,100,255,${0.6 + 0.4 * Math.sin(_rt * 3)})`;
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(_rx + _rw * 0.1, _ry + _rh * 0.5);
            ctx.lineTo(_rx + _rw * 0.35, _ry + _rh * 0.3);
            ctx.lineTo(_rx + _rw * 0.5, _ry + _rh * 0.5);
            ctx.lineTo(_rx + _rw * 0.65, _ry + _rh * 0.7);
            ctx.lineTo(_rx + _rw * 0.9, _ry + _rh * 0.5);
            ctx.stroke();
            // Outer rim
            ctx.shadowBlur = 14;
            ctx.strokeStyle = `rgba(180,0,255,${0.5 + 0.3 * Math.sin(_rt)})`;
            ctx.lineWidth = 2.5;
            ctx.strokeRect(_rx, _ry, _rw, _rh);
            ctx.shadowBlur = 0;
        } else if (obj.type === 'box') {
            GameTerrain.drawBox(ctx, obj);
        } else {
            const bx = obj.x, by = obj.y, bw = obj.w, bh = obj.h;
            ctx.fillStyle = '#cd853f'; // Peru
            ctx.fillRect(bx, by, bw, bh);
            const border = 4;
            ctx.strokeStyle = '#8b4513';
            ctx.lineWidth = border;
            ctx.strokeRect(bx + border/2, by + border/2, bw - border, bh - border);
            ctx.beginPath();
            ctx.moveTo(bx + border, by + border);
            ctx.lineTo(bx + bw - border, by + bh - border);
            ctx.moveTo(bx + bw - border, by + border);
            ctx.lineTo(bx + border, by + bh - border);
            ctx.stroke();
            ctx.fillStyle = 'rgba(0,0,0,0.1)';
            ctx.fillRect(bx + border, by + bh/2 - 1, bw - border*2, 2);
        }
        ctx.restore();
    });

    // 3.5. Пули
    bullets.forEach(b => {
        if (!isVisible(b.x - b.w, b.y - b.h, b.w * 2, b.h * 2)) return;
        ctx.save();
        if (b.type === 'fire') {
            const grad = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.w/2 + 4);
            grad.addColorStop(0, 'rgba(255, 255, 100, 0.9)');
            grad.addColorStop(0.4, 'rgba(255, 100, 0, 0.6)');
            grad.addColorStop(1, 'rgba(255, 0, 0, 0)');
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(b.x, b.y, b.w/2 + 2, 0, Math.PI * 2);
            ctx.fill();
        } else if (b.type === 'rocket') {
            ctx.save();
            ctx.translate(b.x, b.y);
            const ang = Math.atan2(b.vy, b.vx);
            ctx.rotate(ang);
            ctx.fillStyle = '#556b2f';
            ctx.fillRect(-b.w/2, -b.h/2, b.w, b.h);
            ctx.fillStyle = '#8b0000';
            ctx.beginPath(); 
            ctx.moveTo(b.w/2, -b.h/2); 
            ctx.lineTo(b.w/2 + b.h, 0); 
            ctx.lineTo(b.w/2, b.h/2); 
            ctx.fill();
            ctx.fillStyle = '#2f4f4f';
            ctx.beginPath(); ctx.moveTo(-b.w/2, -b.h/2); ctx.lineTo(-b.w/2 - 4, -b.h/2 - 4); ctx.lineTo(-b.w/2 + 4, -b.h/2); ctx.fill();
            ctx.beginPath(); ctx.moveTo(-b.w/2, b.h/2); ctx.lineTo(-b.w/2 - 4, b.h/2 + 4); ctx.lineTo(-b.w/2 + 4, b.h/2); ctx.fill();
            if (Math.random() > 0.3) {
                ctx.fillStyle = 'rgba(255, 140, 0, 0.6)';
                ctx.beginPath(); ctx.arc(-b.w/2 - 2, 0, 3, 0, Math.PI*2); ctx.fill();
            }
            ctx.restore();
        } else if (b.type === 'smallRocket') {
            ctx.save();
            ctx.translate(b.x, b.y);
            ctx.rotate(Math.atan2(b.vy, b.vx));
            ctx.fillStyle = '#111';
            ctx.fillRect(-b.w/2, -b.h/2, b.w, b.h);
            ctx.fillStyle = '#ccc';
            ctx.beginPath(); ctx.moveTo(b.w/2, -b.h/2); ctx.lineTo(b.w, 0); ctx.lineTo(b.w/2, b.h/2); ctx.fill();
            ctx.restore();
        } else if (b.type === 'plasma') {
            drawPlasmaBolt(ctx, b, false);
        } else if (b.type === 'plasmaBlast') {
            drawPlasmaBolt(ctx, b, true);
        } else if (b.type === 'toxic' && b.toxicWave) {
            drawToxicWaveProjectile(ctx, b);
        } else if (b.type === 'toxic') {
            const r = Math.max(3, b.w / 2);
            const wobble = Math.sin(Date.now() * 0.02 + b.x) * 2;
            const grad = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, r + 2);
            grad.addColorStop(0, '#ccff90');
            grad.addColorStop(0.6, '#76ff03');
            grad.addColorStop(1, 'rgba(51, 105, 30, 0.5)');
            ctx.fillStyle = grad;
            ctx.beginPath(); 
            ctx.ellipse(b.x, b.y, r + wobble*0.2, r - wobble*0.2, Date.now()*0.005, 0, Math.PI*2);
            ctx.fill();
            
            ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
            ctx.beginPath(); ctx.arc(b.x - r*0.3, b.y - r*0.3, r*0.25, 0, Math.PI*2); ctx.fill();
            ctx.beginPath(); ctx.arc(b.x + r*0.4, b.y + r*0.2, r*0.15, 0, Math.PI*2); ctx.fill();
            
            if (Math.random() > 0.6) {
                // Optimization: reduced particle spawn rate if many particles
                if (window.effectsEnabled !== false && particles.length < 150) {
                    particles.push({
                       x: b.x, y: b.y, size: 2, color: '#76ff03', life: 0.5, vx: (Math.random()-0.5), vy: (Math.random()-0.5)
                    });
                }
            }

        } else if (b.type === 'megabomb') {
            const r = Math.max(5, b.w / 2);
            const grad = ctx.createRadialGradient(b.x - 2, b.y - 2, 0, b.x, b.y, r);
            grad.addColorStop(0, '#555');
            grad.addColorStop(1, '#000');
            ctx.fillStyle = grad;
            ctx.beginPath(); ctx.arc(b.x, b.y, r, 0, Math.PI*2); ctx.fill();
            
            ctx.strokeStyle = '#444'; ctx.lineWidth = 1; ctx.stroke();
            
            const blink = Math.abs(Math.sin(Date.now() * 0.01));
            ctx.fillStyle = `rgba(255, 0, 0, ${0.5 + blink * 0.5})`;
            ctx.beginPath(); ctx.arc(b.x, b.y, r * 0.4, 0, Math.PI*2); ctx.fill();
            
            ctx.fillStyle = 'rgba(255,255,255,0.4)';
            ctx.beginPath(); ctx.arc(b.x - r*0.4, b.y - r*0.4, r*0.2, 0, Math.PI*2); ctx.fill();
            
        } else if (b.type === 'ice') {
            ctx.save();
            ctx.translate(b.x, b.y);
            ctx.rotate(Date.now() * 0.01 + b.x * 0.1);
            
            const size = Math.max(b.w, b.h);
            const grad = ctx.createLinearGradient(-size/2, -size/2, size/2, size/2);
            grad.addColorStop(0, '#E0F7FA'); 
            grad.addColorStop(0.5, '#4DD0E1');
            grad.addColorStop(1, '#006064');
            ctx.fillStyle = grad;
            
            ctx.beginPath();
            ctx.moveTo(0, -size/2 - 2);
            ctx.lineTo(size/2, 0);
            ctx.lineTo(0, size/2 + 2);
            ctx.lineTo(-size/2, 0);
            ctx.closePath();
            ctx.fill();
            
            ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
            ctx.beginPath();
            ctx.moveTo(0, -size/2);
            ctx.lineTo(size/4, -size/4);
            ctx.lineTo(0, 0);
            ctx.lineTo(-size/4, -size/4);
            ctx.fill();
            
            // Optimization: limit particle spawning here too
            if (window.effectsEnabled !== false && Math.random() > 0.5 && particles.length < 150) {
                const px = (Math.random() - 0.5) * size;
                const py = (Math.random() - 0.5) * size;
                particles.push({
                   x: b.x + px, y: b.y + py, size: 1.5, color: '#FFFFFF', life: 0.4, vx: 0, vy: 0
                });
            }
            ctx.restore();

        } else if (b.type === 'musical') {
            ctx.save();
            ctx.translate(b.x, b.y);
            const angle = Math.atan2(b.vy, b.vx);
            ctx.rotate(angle);
            
            ctx.shadowBlur = 6;
            ctx.shadowColor = '#00ffff';
            ctx.strokeStyle = '#00ffff';
            ctx.lineWidth = 2;
            
            // Draw animated wave arcs
            const time = Date.now() / 100;
            const size = b.w || 12;
            
            // Main arc
            ctx.beginPath();
            ctx.arc(-2, 0, size/2, -Math.PI/2.5, Math.PI/2.5);
            ctx.stroke();
            
            // Inner arc
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.arc(-5, 0, size/3, -Math.PI/3, Math.PI/3);
            ctx.stroke();
            
            // Core
            ctx.fillStyle = '#e0ffff';
            ctx.beginPath();
            ctx.arc(-size/2, 0, 3, 0, Math.PI*2);
            ctx.fill();
            
            ctx.restore();
            
            // Musical notes trail
            if (window.effectsEnabled !== false && Math.random() > 0.8 && particles.length < 150) {
                 particles.push({
                   x: b.x - b.vx*2 + (Math.random()-0.5)*5, 
                   y: b.y - b.vy*2 + (Math.random()-0.5)*5, 
                   size: 2, 
                   color: '#00ffff', 
                   life: 0.5, 
                   vx: (Math.random()-0.5)*0.5, 
                   vy: (Math.random()-0.5)*0.5
                });
            }

        } else if (b.type === 'romanBlade' || b.type === 'egyptArrow' || b.type === 'spartanSpear' || b.type === 'romanPilum') {
            drawHistoricalProjectile(ctx, b);
        } else if (b.type === 'illuminat') {
            ctx.save();
            ctx.translate(b.x, b.y);
            const angle = Math.atan2(b.vy, b.vx);
            ctx.rotate(angle);
            
            // "True Beauty" - A mystical Eye of Providence style
            // Outer golden triangle
            ctx.shadowBlur = 10;
            ctx.shadowColor = '#f39c12';
            
            // Triangle path
            ctx.beginPath();
            ctx.moveTo(10, 0);       // Tip pointing forward
            ctx.lineTo(-8, 8);       // Bottom right
            ctx.lineTo(-8, -8);      // Bottom left
            ctx.closePath();
            
            // Gradient fill for triangle
            const triGrad = ctx.createLinearGradient(-8, -8, 10, 0);
            triGrad.addColorStop(0, '#d35400');
            triGrad.addColorStop(0.5, '#f39c12');
            triGrad.addColorStop(1, '#f1c40f');
            ctx.fillStyle = triGrad;
            ctx.fill();
            
            // Golden stroke
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 1.5;
            ctx.stroke();

            // The All-Seeing Eye in center
            ctx.shadowBlur = 5;
            ctx.shadowColor = '#00ffff'; 
            
            // Eye Sclera (White)
            ctx.fillStyle = '#fff';
            ctx.beginPath();
            ctx.ellipse(-2, 0, 3, 5, -Math.PI/2, 0, Math.PI*2);
            ctx.fill();

            // Pupil (Black/Cyan)
            ctx.fillStyle = '#000';
            ctx.beginPath();
            ctx.arc(-2, 0, 1.5, 0, Math.PI*2);
            ctx.fill();
            
            ctx.fillStyle = '#00ffff';
            ctx.beginPath();
            ctx.arc(-2, 0, 0.8, 0, Math.PI*2);
            ctx.fill();

            // Radiating rays (Holy light)
            ctx.shadowBlur = 0;
            ctx.strokeStyle = 'rgba(241, 196, 15, 0.6)';
            ctx.lineWidth = 1;
            for(let i=0; i<3; i++) {
                const r = Date.now() * 0.005 + i * (Math.PI*2/3);
                ctx.beginPath();
                ctx.moveTo(-2, 0);
                ctx.lineTo(-2 + Math.cos(r)*12, Math.sin(r)*12);
                ctx.stroke();
            }

            ctx.restore();
            
            // Mystical particles
            if (window.effectsEnabled !== false && Math.random() > 0.6 && particles.length < 150) {
                 particles.push({
                   x: b.x - b.vx*0.5 + (Math.random()-0.5)*4, 
                   y: b.y - b.vy*0.5 + (Math.random()-0.5)*4, 
                   size: Math.random() * 2, 
                   color: Math.random() > 0.5 ? '#f1c40f' : '#00ffff', 
                   life: 0.5, 
                   vx: (Math.random()-0.5)*0.3, 
                   vy: (Math.random()-0.5)*0.3
                });
            }

        } else if (b.type === 'mirror') {
            ctx.save();
            ctx.translate(b.x, b.y);
            // Spin the shard
            const spin = Date.now() * 0.01 + b.x * 0.1;
            ctx.rotate(spin);
             
            const size = (b.w || 8);
             
            // Diamond/Shard shape (Rhombus)
            ctx.beginPath();
            ctx.moveTo(0, -size);
            ctx.lineTo(size/1.5, 0);
            ctx.lineTo(0, size);
            ctx.lineTo(-size/1.5, 0);
            ctx.closePath();
             
            // Reflective gradient - giving a metallic/mirror look
            const grad = ctx.createLinearGradient(-size, -size, size, size);
            grad.addColorStop(0, '#7f8c8d');
            grad.addColorStop(0.3, '#bdc3c7'); 
            grad.addColorStop(0.5, '#ffffff'); // bright shine in middle
            grad.addColorStop(0.7, '#bdc3c7');
            grad.addColorStop(1, '#7f8c8d');
            ctx.fillStyle = grad;
            ctx.fill();
            
            // Bright highlight edge
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
            ctx.lineWidth = 1;
            ctx.stroke();

            // Inner "crack" or facet
            ctx.beginPath();
            ctx.moveTo(0, -size*0.5);
            ctx.lineTo(size*0.3, 0);
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
            ctx.stroke();

            ctx.restore();
             
            // Trailing glittering shards (particles)
            if (window.effectsEnabled !== false && Math.random() > 0.7 && particles.length < 150) {
                  particles.push({
                    x: b.x - b.vx*0.5 + (Math.random()-0.5)*2, 
                    y: b.y - b.vy*0.5 + (Math.random()-0.5)*2, 
                    life: 0.4, 
                    size: 1.5,
                    color: '#ffffff', // white sparkle
                    vx: 0, vy: 0
                 });
            }

        } else if (b.type === 'imitator') {
            // imitator base bullet — prismatic orb with rainbow trail
            const pr = Math.max(3.5, b.w / 2);
            const ang = Math.atan2(b.vy, b.vx);
            // Rainbow trail
            const trailLen = pr * 4;
            const tx = b.x - Math.cos(ang) * trailLen;
            const ty = b.y - Math.sin(ang) * trailLen;
            const trailGrad = ctx.createLinearGradient(tx, ty, b.x, b.y);
            trailGrad.addColorStop(0, 'rgba(255,0,200,0)');
            trailGrad.addColorStop(0.4, 'rgba(0,200,255,0.3)');
            trailGrad.addColorStop(1, 'rgba(200,100,255,0.6)');
            ctx.strokeStyle = trailGrad;
            ctx.lineWidth = pr * 1.5;
            ctx.lineCap = 'round';
            ctx.beginPath();
            ctx.moveTo(tx, ty);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
            // Outer glow
            const glowGrad = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, pr * 2.5);
            glowGrad.addColorStop(0, 'rgba(200,100,255,0.5)');
            glowGrad.addColorStop(1, 'rgba(100,0,200,0)');
            ctx.fillStyle = glowGrad;
            ctx.beginPath();
            ctx.arc(b.x, b.y, pr * 2.5, 0, Math.PI * 2);
            ctx.fill();
            // Core orb
            const coreGrad = ctx.createRadialGradient(
                b.x - pr * 0.3, b.y - pr * 0.3, pr * 0.05,
                b.x, b.y, pr
            );
            coreGrad.addColorStop(0,   '#ffffff');
            coreGrad.addColorStop(0.25, '#e8aaff');
            coreGrad.addColorStop(0.6,  '#9b00ff');
            coreGrad.addColorStop(1,    '#2d0057');
            ctx.fillStyle = coreGrad;
            ctx.beginPath();
            ctx.arc(b.x, b.y, pr, 0, Math.PI * 2);
            ctx.fill();
            // Specular glint
            ctx.fillStyle = 'rgba(255,255,255,0.8)';
            ctx.beginPath();
            ctx.arc(b.x - pr * 0.28, b.y - pr * 0.28, pr * 0.3, 0, Math.PI * 2);
            ctx.fill();
            // A tiny faceted diamond links the shot to the tank's hull emblem.
            const spin = Date.now() * 0.004;
            const facet = pr * 0.55;
            ctx.fillStyle = 'rgba(34,18,80,0.78)';
            ctx.strokeStyle = 'rgba(232,207,255,0.9)';
            ctx.lineWidth = 0.8;
            ctx.beginPath();
            for (let i = 0; i < 4; i++) {
                const a = spin + i * Math.PI / 2;
                const x = b.x + Math.cos(a) * facet;
                const y = b.y + Math.sin(a) * facet;
                if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
            }
            ctx.closePath(); ctx.fill(); ctx.stroke();

        } else if (b.type === 'kvantMain' || b.type === 'kvantSide' || b.type === 'kvantSmall') {
            // Квант bullets — kvantMain is the primary morphing orb, kvantSmall are fragments
            const isMain = b.type === 'kvantMain';
            const pr = b.type === 'kvantSmall' ? Math.max(2.5, b.w/2) : Math.max(isMain ? 6 : 4.5, b.w/2);
            const ang = Math.atan2(b.vy, b.vx);
            const pulse = 0.7 + 0.3 * Math.sin(Date.now() * 0.012 + b.x * 0.02);
            // For kvantMain: flash/pulse faster as morph approaches
            const morphFraction = isMain && b.morphTimer != null ? Math.max(0, b.morphTimer / 90) : 1;
            const morphPulse = isMain ? (morphFraction > 0.2 ? pulse : 0.5 + 0.5 * Math.sin(Date.now() * 0.06)) : 1;
            const alpha = (b.type === 'kvantSide' && (b.splitTimer || 90) < 22)
                ? (0.5 + 0.5 * Math.sin(Date.now() * 0.04)) : 1;
            // Trail
            const trailLen = pr * (isMain ? 4.5 : 3.2);
            const tx = b.x - Math.cos(ang) * trailLen, ty = b.y - Math.sin(ang) * trailLen;
            const aiTrail = ctx.createLinearGradient(tx, ty, b.x, b.y);
            aiTrail.addColorStop(0, 'rgba(0,229,255,0)');
            aiTrail.addColorStop(1, `rgba(0,229,255,${0.5 * morphPulse * alpha})`);
            ctx.strokeStyle = aiTrail; ctx.lineWidth = pr * (isMain ? 2.2 : 1.6); ctx.lineCap = 'round';
            ctx.beginPath(); ctx.moveTo(tx, ty); ctx.lineTo(b.x, b.y); ctx.stroke();
            // Outer glow (bigger for main)
            const glowR = pr * (isMain ? 3.5 : 2.4);
            const aiGlow = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, glowR);
            aiGlow.addColorStop(0, `rgba(0,229,255,${0.38 * morphPulse * alpha})`);
            aiGlow.addColorStop(1, 'rgba(0,100,180,0)');
            ctx.fillStyle = aiGlow; ctx.beginPath(); ctx.arc(b.x, b.y, glowR, 0, Math.PI*2); ctx.fill();
            // Morphing ring indicator on kvantMain (shows time-to-morph)
            if (isMain && b.morphTimer != null) {
                const _ringAlpha = (1 - morphFraction) * 0.8;
                if (_ringAlpha > 0.05) {
                    ctx.strokeStyle = `rgba(255,255,100,${_ringAlpha})`;
                    ctx.lineWidth = 2;
                    ctx.shadowColor = '#ffff00'; ctx.shadowBlur = 6;
                    ctx.beginPath();
                    ctx.arc(b.x, b.y, pr * 2, -Math.PI/2, -Math.PI/2 + Math.PI * 2 * (1 - morphFraction));
                    ctx.stroke();
                    ctx.shadowBlur = 0;
                }
            }
            // Core
            ctx.globalAlpha = alpha;
            const coreColor0 = isMain ? '#ffffff' : '#ffffff';
            const coreColor1 = isMain ? '#44ffff' : '#00e5ff';
            const aiCore = ctx.createRadialGradient(b.x - pr*0.25, b.y - pr*0.25, 0, b.x, b.y, pr);
            aiCore.addColorStop(0, coreColor0); aiCore.addColorStop(0.35, coreColor1);
            aiCore.addColorStop(0.75, '#0066aa'); aiCore.addColorStop(1, '#003366');
            ctx.fillStyle = aiCore; ctx.beginPath(); ctx.arc(b.x, b.y, pr, 0, Math.PI*2); ctx.fill();
            ctx.strokeStyle = `rgba(0,229,255,${0.6 * pulse})`; ctx.lineWidth = 1.5;
            ctx.beginPath(); ctx.arc(b.x, b.y, pr * 1.55, 0, Math.PI*2); ctx.stroke();
            ctx.globalAlpha = 1;

        } else if (b.type === 'buckshot') {
            // Shotgun pellet — brass sphere with motion trail
            const pr = Math.max(2.5, b.w / 2);
            const ang = Math.atan2(b.vy, b.vx);

            // Motion trail (fading streak behind pellet)
            const trailLen = pr * 3.5;
            const tx = b.x - Math.cos(ang) * trailLen;
            const ty = b.y - Math.sin(ang) * trailLen;
            const trailGrad = ctx.createLinearGradient(tx, ty, b.x, b.y);
            trailGrad.addColorStop(0, 'rgba(180, 100, 20, 0)');
            trailGrad.addColorStop(1, 'rgba(220, 150, 40, 0.55)');
            ctx.strokeStyle = trailGrad;
            ctx.lineWidth = pr * 1.2;
            ctx.lineCap = 'round';
            ctx.beginPath();
            ctx.moveTo(tx, ty);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();

            // Outer glow
            const glowGrad = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, pr * 2.2);
            glowGrad.addColorStop(0, 'rgba(255, 200, 80, 0.45)');
            glowGrad.addColorStop(1, 'rgba(180, 80, 0, 0)');
            ctx.fillStyle = glowGrad;
            ctx.beginPath();
            ctx.arc(b.x, b.y, pr * 2.2, 0, Math.PI * 2);
            ctx.fill();

            // Brass/copper sphere
            const sphereGrad = ctx.createRadialGradient(
                b.x - pr * 0.35, b.y - pr * 0.35, pr * 0.05,
                b.x, b.y, pr
            );
            sphereGrad.addColorStop(0,   '#ffe082');  // lit highlight
            sphereGrad.addColorStop(0.3, '#ffb300');  // warm brass
            sphereGrad.addColorStop(0.65,'#c17900');  // mid tone
            sphereGrad.addColorStop(1,   '#6d3b00');  // deep shadow
            ctx.fillStyle = sphereGrad;
            ctx.beginPath();
            ctx.arc(b.x, b.y, pr, 0, Math.PI * 2);
            ctx.fill();

            // Specular glint
            ctx.fillStyle = 'rgba(255,255,255,0.7)';
            ctx.beginPath();
            ctx.arc(b.x - pr * 0.3, b.y - pr * 0.3, pr * 0.28, 0, Math.PI * 2);
            ctx.fill();

        } else if (b.type === 'electricBall') {
            // МИФИЧЕСКИЙ: Усиленный визуал шаровой молнии — яркая корона, вращающиеся искры и динамические отростки
            const radius = (b.w || 12) / 2;
            const t = Date.now() * 0.0025;
            const pulse = 0.9 + Math.sin(Date.now() * 0.02 + b.x * 0.02) * 0.25;

            // Trail (soft streak behind orb)
            const ang = Math.atan2(b.vy, b.vx);
            const trailLen = radius * 4;
            const tx = b.x - Math.cos(ang) * trailLen;
            const ty = b.y - Math.sin(ang) * trailLen;
            const trailGrad = ctx.createLinearGradient(tx, ty, b.x, b.y);
            trailGrad.addColorStop(0, 'rgba(0, 212, 255, 0)');
            trailGrad.addColorStop(0.5, 'rgba(0, 180, 255, 0.18)');
            trailGrad.addColorStop(1, 'rgba(0, 220, 255, 0.6)');
            ctx.strokeStyle = trailGrad;
            ctx.lineWidth = radius * 1.8;
            ctx.lineCap = 'round';
            ctx.beginPath(); ctx.moveTo(tx, ty); ctx.lineTo(b.x, b.y); ctx.stroke();

            // Additive glow + dynamic tendrils
            ctx.save();
            ctx.globalCompositeOperation = 'lighter';

            // Outer corona
            const outerGlow = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, radius * 3 * pulse);
            outerGlow.addColorStop(0, 'rgba(140,255,255,0.35)');
            outerGlow.addColorStop(0.3, 'rgba(0,220,255,0.18)');
            outerGlow.addColorStop(0.7, 'rgba(0,120,200,0.06)');
            outerGlow.addColorStop(1, 'rgba(0,0,0,0)');
            ctx.fillStyle = outerGlow; ctx.beginPath(); ctx.arc(b.x, b.y, radius * 3 * pulse, 0, Math.PI * 2); ctx.fill();

            // Dynamic electric tendrils (curved)
            for (let i = 0; i < 7; i++) {
                const angOff = (i / 7) * Math.PI * 2 + t * (1 + i * 0.06);
                const start = radius * (0.95 + Math.sin(t * 2 + i) * 0.05);
                const len = radius * (1.5 + Math.abs(Math.cos(t * 1.5 + i)) * 1.2);
                const cx = b.x + Math.cos(angOff) * len;
                const cy = b.y + Math.sin(angOff) * len;
                ctx.strokeStyle = `rgba(0, 220, 255, ${0.6 - i*0.06})`;
                ctx.lineWidth = 1 + (i % 3) * 0.6;
                ctx.beginPath();
                ctx.moveTo(b.x + Math.cos(angOff) * start, b.y + Math.sin(angOff) * start);
                ctx.quadraticCurveTo(
                    b.x + Math.cos(angOff) * (radius * 1.25) + Math.sin(angOff) * 6,
                    b.y + Math.sin(angOff) * (radius * 1.25) - Math.cos(angOff) * 6,
                    cx + (Math.random() - 0.5) * 6,
                    cy + (Math.random() - 0.5) * 6
                );
                ctx.stroke();
            }

            // Orbiting micro-sparks
            for (let i = 0; window.effectsEnabled !== false && i < 6; i++) {
                const aa = t * 3 + i * (Math.PI * 2 / 6);
                const rr = radius * 1.8 + Math.sin(t * 6 + i) * 2;
                const sx = b.x + Math.cos(aa) * rr;
                const sy = b.y + Math.sin(aa) * rr;
                const g = ctx.createRadialGradient(sx, sy, 0, sx, sy, 6);
                g.addColorStop(0, 'rgba(255,255,255,0.95)');
                g.addColorStop(0.25, 'rgba(0,230,255,0.9)');
                g.addColorStop(1, 'rgba(0,140,200,0)');
                ctx.fillStyle = g; ctx.beginPath(); ctx.arc(sx, sy, 3, 0, Math.PI * 2); ctx.fill();
            }

            // Central core (strong gradient)
            const coreGrad = ctx.createRadialGradient(b.x - radius * 0.12, b.y - radius * 0.12, 0, b.x, b.y, radius);
            coreGrad.addColorStop(0, '#ffffff');
            coreGrad.addColorStop(0.18, '#e8ffff');
            coreGrad.addColorStop(0.5, '#00f2ff');
            coreGrad.addColorStop(1, '#003366');
            ctx.fillStyle = coreGrad; ctx.beginPath(); ctx.arc(b.x, b.y, radius * 0.9, 0, Math.PI * 2); ctx.fill();

            ctx.restore();

            // Bright specular highlight
            ctx.fillStyle = 'rgba(255,255,255,0.95)'; ctx.beginPath(); ctx.arc(b.x - radius * 0.25, b.y - radius * 0.25, radius * 0.35, 0, Math.PI * 2); ctx.fill();

        } else if (b.type === 'railgun') {
            // Fast cyan energy bolt with glow trail
            const ang = Math.atan2(b.vy, b.vx);
            const boltLen = 26;
            const tx = b.x - Math.cos(ang) * boltLen;
            const ty = b.y - Math.sin(ang) * boltLen;
            const rg = ctx.createLinearGradient(tx, ty, b.x, b.y);
            rg.addColorStop(0, 'rgba(0,229,255,0)');
            rg.addColorStop(0.5, 'rgba(0,229,255,0.7)');
            rg.addColorStop(1, '#ffffff');
            ctx.strokeStyle = rg;
            ctx.lineWidth = 4;
            ctx.lineCap = 'round';
            ctx.shadowColor = '#00e5ff';
            ctx.shadowBlur = 14;
            ctx.beginPath();
            ctx.moveTo(tx, ty);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
            // Bright tip
            ctx.fillStyle = '#ffffff';
            ctx.shadowColor = '#00e5ff';
            ctx.shadowBlur = 18;
            ctx.beginPath();
            ctx.arc(b.x, b.y, 3, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;

        } else if (b.type === 'droneBullet') {
            // Small cyan drone shot
            const dpr = 3;
            ctx.fillStyle = '#00e5ff';
            ctx.shadowColor = '#00e5ff';
            ctx.shadowBlur = 8;
            ctx.beginPath();
            ctx.arc(b.x, b.y, dpr, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;

        } else if (b.type === 'medicalPulse') {
            // Medical healing projectile — green/white gradient with pulsing aura
            const radius = (b.w || 8) / 2;
            const pulse = 0.8 + Math.sin(Date.now() * 0.015) * 0.35;
            const brightness = 0.6 + Math.sin(Date.now() * 0.025 + b.x * 0.01) * 0.4;
            
            // Pulsing healing aura
            const auraGrad = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, radius * 3.5 * pulse);
            auraGrad.addColorStop(0, `rgba(100, 255, 150, ${0.25 * brightness})`);
            auraGrad.addColorStop(0.5, `rgba(100, 255, 200, ${0.12 * brightness})`);
            auraGrad.addColorStop(1, 'rgba(100, 255, 150, 0)');
            ctx.fillStyle = auraGrad;
            ctx.beginPath();
            ctx.arc(b.x, b.y, radius * 3.5 * pulse, 0, Math.PI * 2);
            ctx.fill();
            
            // Core gradient — healing green/white
            const coreGrad = ctx.createRadialGradient(
                b.x - radius * 0.2, b.y - radius * 0.2, radius * 0.15,
                b.x, b.y, radius
            );
            coreGrad.addColorStop(0, '#ffffff');
            coreGrad.addColorStop(0.4, '#a8ff7f');
            coreGrad.addColorStop(0.8, '#64ff96');
            coreGrad.addColorStop(1, '#2dad4c');
            ctx.fillStyle = coreGrad;
            ctx.beginPath();
            ctx.arc(b.x, b.y, radius, 0, Math.PI * 2);
            ctx.fill();
            
            // Highlight shine
            ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            ctx.beginPath();
            ctx.arc(b.x - radius * 0.25, b.y - radius * 0.25, radius * 0.35, 0, Math.PI * 2);
            ctx.fill();
            
            // Healing particles (flying outward on pulse)
            if (window.effectsEnabled !== false && Math.random() > 0.65 && particles.length < 150) {
                const angle = Math.random() * Math.PI * 2;
                const speed = 0.8 + Math.random() * 0.6;
                particles.push({
                    x: b.x,
                    y: b.y,
                    vx: Math.cos(angle) * speed,
                    vy: Math.sin(angle) * speed,
                    life: 0.6,
                    size: 1.2,
                    color: '#64ff96',
                    type: 'heal'
                });
            }

        } else if (b.type === 'meteorMini') {
            // Small meteor — rocky appearance with fire
            const r = Math.max(4, b.w / 2);
            const rotate = Date.now() * 0.01 + b.x * 0.05;
            
            ctx.save();
            ctx.translate(b.x, b.y);
            ctx.rotate(rotate);
            
            // Dark rocky body
            const rockGrad = ctx.createRadialGradient(-r*0.2, -r*0.2, r*0.1, 0, 0, r);
            rockGrad.addColorStop(0, '#444');
            rockGrad.addColorStop(0.6, '#1a1a1a');
            rockGrad.addColorStop(1, '#0a0a0a');
            ctx.fillStyle = rockGrad;
            ctx.beginPath();
            ctx.arc(0, 0, r, 0, Math.PI * 2);
            ctx.fill();
            
            // Jagged edges
            ctx.strokeStyle = '#555';
            ctx.lineWidth = 1;
            ctx.stroke();
            
            // Lava glow edges
            ctx.shadowColor = '#ff6600';
            ctx.shadowBlur = 8;
            const glowGrad = ctx.createRadialGradient(0, 0, r*0.7, 0, 0, r*1.3);
            glowGrad.addColorStop(0, 'rgba(255, 100, 0, 0)');
            glowGrad.addColorStop(0.7, 'rgba(255, 80, 0, 0.3)');
            glowGrad.addColorStop(1, 'rgba(255, 50, 0, 0)');
            ctx.fillStyle = glowGrad;
            ctx.beginPath();
            ctx.arc(0, 0, r, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.restore();
            
            // Fire trail below
            if (window.effectsEnabled !== false && Math.random() > 0.4) {
                particles.push({
                    x: b.x + (Math.random() - 0.5) * r,
                    y: b.y + (Math.random() - 0.5) * r,
                    size: 1 + Math.random() * 2,
                    color: Math.random() > 0.5 ? '#ff6600' : '#ffaa00',
                    life: 0.4,
                    vx: (Math.random() - 0.5) * 0.5,
                    vy: (Math.random() - 0.5) * 0.5
                });
            }

        } else if (b.type === 'pyroBullet') {
            // Incendiary shell – glowing orange-red orb with fire trail and rotating ember sparks
            const pr = (b.w || 9) / 2;
            const t = Date.now() * 0.003;

            // Fire trail behind bullet
            const ang = Math.atan2(b.vy, b.vx);
            const trailLen = pr * 4.5;
            const tx = b.x - Math.cos(ang) * trailLen;
            const ty = b.y - Math.sin(ang) * trailLen;
            const trailGrad = ctx.createLinearGradient(tx, ty, b.x, b.y);
            trailGrad.addColorStop(0, 'rgba(200,50,0,0)');
            trailGrad.addColorStop(0.5, 'rgba(255,100,0,0.28)');
            trailGrad.addColorStop(1, 'rgba(255,200,0,0.55)');
            ctx.strokeStyle = trailGrad;
            ctx.lineWidth = pr * 1.8;
            ctx.lineCap = 'round';
            ctx.beginPath();
            ctx.moveTo(tx, ty);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();

            // Additive glow layer
            ctx.save();
            ctx.globalCompositeOperation = 'lighter';

            // Outer heat halo
            const haloGrad = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, pr * 3.2);
            haloGrad.addColorStop(0,   'rgba(255,160,0,0.30)');
            haloGrad.addColorStop(0.4, 'rgba(255,80,0,0.15)');
            haloGrad.addColorStop(1,   'rgba(200,0,0,0)');
            ctx.fillStyle = haloGrad;
            ctx.beginPath(); ctx.arc(b.x, b.y, pr * 3.2, 0, Math.PI * 2); ctx.fill();

            ctx.restore();

            // Core orb – bright incendiary sphere
            const coreGrad = ctx.createRadialGradient(
                b.x - pr * 0.3, b.y - pr * 0.3, pr * 0.05,
                b.x, b.y, pr
            );
            coreGrad.addColorStop(0,    '#ffffc0');   // white-yellow hot center
            coreGrad.addColorStop(0.25, '#ffbf00');   // amber
            coreGrad.addColorStop(0.6,  '#ff4500');   // orange-red
            coreGrad.addColorStop(1,    '#6b0a00');   // deep red edge
            ctx.fillStyle = coreGrad;
            ctx.shadowColor = '#ff6600';
            ctx.shadowBlur = 8;
            ctx.beginPath(); ctx.arc(b.x, b.y, pr, 0, Math.PI * 2); ctx.fill();
            ctx.shadowBlur = 0;

            // Rotating ember sparks around the orb
            for (let i = 0; window.effectsEnabled !== false && i < 5; i++) {
                const sa = t * 2.5 + (i / 5) * Math.PI * 2;
                const sr = pr * 1.55 + Math.sin(t * 4 + i) * pr * 0.25;
                const sx = b.x + Math.cos(sa) * sr;
                const sy = b.y + Math.sin(sa) * sr;
                ctx.fillStyle = i % 2 === 0 ? '#ffcc00' : '#ff6600';
                ctx.beginPath(); ctx.arc(sx, sy, pr * 0.22, 0, Math.PI * 2); ctx.fill();
            }

            // Hot specular highlight
            ctx.fillStyle = 'rgba(255,255,200,0.85)';
            ctx.beginPath();
            ctx.arc(b.x - pr * 0.28, b.y - pr * 0.28, pr * 0.28, 0, Math.PI * 2);
            ctx.fill();

        } else if (b.type === 'airBullet') {
            // Little flying tornado / whirlwind
            const pr = (b.w || 10) / 2;
            const t = Date.now() * 0.01; // fast rotation speed
            const ang = Math.atan2(b.vy, b.vx);

            ctx.save();
            ctx.translate(b.x, b.y);
            // Rotate to point backward the movement direction so it looks like it's drifting, but keep the tornado upright relative to velocity
            ctx.rotate(ang + Math.PI / 2);

            // Draw a stack of spinning ellipses (tornado layers)
            // They get wider at the top (-y) and narrower at the bottom (+y)
            const layers = 5;
            for (let i = 0; i < layers; i++) {
                // Layer properties
                const layerY = (i - layers/2) * (pr * 0.5); // from top to bottom
                const layerWidth = pr * (1.8 - (i * 0.25)); // wider at i=0 (top)
                const layerHeight = pr * 0.5;

                // Alternate rotation offset for erratic wind look
                const waveOffset = Math.sin(t + i) * (pr * 0.3);

                ctx.save();
                ctx.translate(waveOffset, layerY);

                const grad = ctx.createLinearGradient(-layerWidth, 0, layerWidth, 0);
                grad.addColorStop(0, 'rgba(0,200,160,0.2)');
                grad.addColorStop(0.2, '#00e4cc');
                grad.addColorStop(0.5, '#e0fff8');
                grad.addColorStop(0.8, '#00c9a7');
                grad.addColorStop(1, 'rgba(0,200,160,0.2)');

                ctx.fillStyle = grad;
                ctx.beginPath();
                ctx.ellipse(0, 0, layerWidth, layerHeight, 0, 0, Math.PI * 2);
                ctx.fill();
                
                // Wind streaks inside the layer
                ctx.strokeStyle = '#fff';
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(-layerWidth * 0.5, 0);
                ctx.quadraticCurveTo(0, layerHeight * 0.5, layerWidth * 0.5, 0);
                ctx.stroke();

                ctx.restore();
            }

            // Draw some flying debris/dust around it
            ctx.fillStyle = '#bdfdf2';
            for (let d = 0; window.effectsEnabled !== false && d < 3; d++) {
                const dx = Math.cos(t * 1.5 + d * 2) * (pr * 1.2);
                const dy = Math.sin(t * 1.5 + d * 2) * (pr * 1.2);
                ctx.beginPath();
                ctx.arc(dx, dy, pr * 0.15, 0, Math.PI * 2);
                ctx.fill();
            }

            ctx.restore();

            // Specular highlight
            ctx.fillStyle = 'rgba(255,255,255,0.80)';
            ctx.beginPath();
            ctx.arc(b.x - pr * 0.28, b.y - pr * 0.28, pr * 0.25, 0, Math.PI * 2);
            ctx.fill();

        } else if (b.type === 'mechDiy') {
            // mechDiy energy slug — drawn via mechs.js
            if (typeof drawMechBullet === 'function') {
                drawMechBullet(ctx, b);
            } else {
                ctx.fillStyle = '#00ff88';
                ctx.beginPath(); ctx.arc(b.x, b.y, (b.w || 10) / 2, 0, Math.PI * 2); ctx.fill();
            }

        } else if (b.type === 'kamikazeBullet') {
            // Original white round with a red center; damage still uses an explosive blast.
            const _kr = (b.w || 10) / 2;
            ctx.save();
            ctx.beginPath();
            ctx.arc(b.x, b.y, _kr, 0, Math.PI * 2);
            ctx.fillStyle = '#ffffff';
            ctx.fill();
            ctx.strokeStyle = '#aaaaaa';
            ctx.lineWidth = 1;
            ctx.stroke();
            ctx.beginPath();
            ctx.arc(b.x, b.y, _kr * 0.46, 0, Math.PI * 2);
            ctx.fillStyle = '#cc0000';
            ctx.fill();
            ctx.restore();

        } else if (b.type === 'mechShield') {
            // mechShield dense slug — drawn via mechs.js
            if (typeof drawMechShieldBullet === 'function') {
                drawMechShieldBullet(ctx, b);
            } else {
                ctx.fillStyle = '#00aaff';
                ctx.beginPath(); ctx.arc(b.x, b.y, (b.w || 14) / 2, 0, Math.PI * 2); ctx.fill();
            }

        } else if (b.type === 'mechRocketBullet') {
            // mechRocket missile — body + flame trail
            const ang = Math.atan2(b.vy, b.vx);
            const len = (b.w || 10) * 2.4;
            const wid = (b.w || 10) * 0.55;
            ctx.save();
            ctx.translate(b.x, b.y);
            ctx.rotate(ang);
            // long flame trail
            const fLen = len + 14 + Math.random() * 6;
            const grad = ctx.createLinearGradient(-len/2 - fLen, 0, -len/2, 0);
            grad.addColorStop(0, 'rgba(255,220,80,0)');
            grad.addColorStop(0.4, 'rgba(255,160,20,0.55)');
            grad.addColorStop(0.8, 'rgba(255,90,0,0.85)');
            grad.addColorStop(1, 'rgba(255,255,200,1)');
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.moveTo(-len/2, -wid * 0.7);
            ctx.lineTo(-len/2 - fLen, 0);
            ctx.lineTo(-len/2, wid * 0.7);
            ctx.closePath();
            ctx.fill();
            // rocket body (metallic)
            const bodyGrad = ctx.createLinearGradient(0, -wid/2, 0, wid/2);
            bodyGrad.addColorStop(0, b.isUlt ? '#ff5555' : '#d0d0d0');
            bodyGrad.addColorStop(0.5, b.isUlt ? '#ff2222' : '#888888');
            bodyGrad.addColorStop(1, b.isUlt ? '#990000' : '#444444');
            ctx.fillStyle = bodyGrad;
            ctx.fillRect(-len/2, -wid/2, len, wid);
            // dark band stripe
            ctx.fillStyle = '#222';
            ctx.fillRect(-len/2 + len * 0.25, -wid/2, len * 0.08, wid);
            // nose cone (pointed red)
            ctx.fillStyle = b.isUlt ? '#ffcc00' : '#c0392b';
            ctx.beginPath();
            ctx.moveTo(len/2, -wid/2);
            ctx.lineTo(len/2 + wid * 1.1, 0);
            ctx.lineTo(len/2, wid/2);
            ctx.closePath();
            ctx.fill();
            ctx.strokeStyle = '#5a1010';
            ctx.lineWidth = 0.8;
            ctx.stroke();
            // tail fins
            ctx.fillStyle = '#333';
            ctx.beginPath();
            ctx.moveTo(-len/2 + wid * 0.1, -wid/2);
            ctx.lineTo(-len/2 - wid * 0.5, -wid * 1.05);
            ctx.lineTo(-len/2 + wid * 0.4, -wid/2);
            ctx.closePath();
            ctx.fill();
            ctx.beginPath();
            ctx.moveTo(-len/2 + wid * 0.1, wid/2);
            ctx.lineTo(-len/2 - wid * 0.5, wid * 1.05);
            ctx.lineTo(-len/2 + wid * 0.4, wid/2);
            ctx.closePath();
            ctx.fill();
            ctx.restore();

        } else if (b.type === 'time') {
            // Time tank bullet — rotating watch with ticking effect
            const radius = (b.w || 9) / 2;
            const t = Date.now() * 0.008;  // Rotation speed
            
            // Outer watch case (gold/brass)
            ctx.fillStyle = '#d4af37';
            ctx.beginPath();
            ctx.arc(b.x, b.y, radius, 0, Math.PI * 2);
            ctx.fill();
            
            // Watch rim (darker brass)
            ctx.strokeStyle = '#8b6914';
            ctx.lineWidth = 1.2;
            ctx.beginPath();
            ctx.arc(b.x, b.y, radius, 0, Math.PI * 2);
            ctx.stroke();
            
            // Watch face (white)
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(b.x, b.y, radius * 0.85, 0, Math.PI * 2);
            ctx.fill();
            
            // Hour markers (12 dots)
            ctx.fillStyle = '#333';
            for (let i = 0; i < 12; i++) {
                const angle = (i / 12) * Math.PI * 2 - Math.PI / 2;
                const mx = b.x + Math.cos(angle) * radius * 0.7;
                const my = b.y + Math.sin(angle) * radius * 0.7;
                ctx.beginPath();
                ctx.arc(mx, my, 0.8, 0, Math.PI * 2);
                ctx.fill();
            }
            
            // Hour hand (short, thick)
            ctx.strokeStyle = '#333';
            ctx.lineWidth = 1.5;
            ctx.lineCap = 'round';
            const hourAngle = t + Math.PI * 1.5;
            ctx.beginPath();
            ctx.moveTo(b.x, b.y);
            ctx.lineTo(
                b.x + Math.cos(hourAngle) * radius * 0.35,
                b.y + Math.sin(hourAngle) * radius * 0.35
            );
            ctx.stroke();
            
            // Minute hand (long, thin, rotates faster)
            ctx.strokeStyle = '#555';
            ctx.lineWidth = 1;
            const minAngle = t * 2.5 + Math.PI * 1.5;
            ctx.beginPath();
            ctx.moveTo(b.x, b.y);
            ctx.lineTo(
                b.x + Math.cos(minAngle) * radius * 0.6,
                b.y + Math.sin(minAngle) * radius * 0.6
            );
            ctx.stroke();
            
            // Center dot
            ctx.fillStyle = '#d4af37';
            ctx.beginPath();
            ctx.arc(b.x, b.y, 1, 0, Math.PI * 2);
            ctx.fill();
            
            // Glow effect (slight shimmer)
            ctx.strokeStyle = 'rgba(212, 175, 55, 0.4)';
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.arc(b.x, b.y, radius + 0.5, 0, Math.PI * 2);
            ctx.stroke();
            
        } else if (b.type === 'myasnoyBio') {
            // Thin twisting blood vessel flying along the projectile direction
            const _mbR = Math.max(2, (b.w || 5) * 0.5);
            const _mbAng = Math.atan2(b.vy, b.vx);
            const _mbSeed = b.veinSeed || 0;
            const _mbTwist = b.veinTwist || 1;
            const _mbT = Date.now() * 0.007 + _mbSeed;
            const _mbLen = _mbR * 8.8;
            const _mbAmp = _mbR * 1.35;
            const _mbPts = [];
            const _mbSegs = 7;
            for (let _pi = 0; _pi <= _mbSegs; _pi++) {
                const _pf = _pi / _mbSegs;
                const _px = -_mbLen * 0.62 + _pf * _mbLen * 1.24;
                const _fade = 0.35 + Math.sin(_pf * Math.PI) * 0.65;
                const _waveA = Math.sin(_mbT * 1.25 + _pf * 6.4 * _mbTwist) * _mbAmp;
                const _waveB = Math.sin(_mbT * 2.1 + _pf * 10.8) * _mbR * 0.42;
                const _py = (_waveA + _waveB) * _fade;
                _mbPts.push({ x: _px, y: _py });
            }
            const _drawVein = (pts, outerColor, innerColor, outerW, innerW) => {
                ctx.beginPath();
                ctx.moveTo(pts[0].x, pts[0].y);
                for (let _vi = 1; _vi < pts.length; _vi++) {
                    const _prev = pts[_vi - 1];
                    const _cur = pts[_vi];
                    const _mx = (_prev.x + _cur.x) * 0.5;
                    const _my = (_prev.y + _cur.y) * 0.5;
                    ctx.quadraticCurveTo(_prev.x, _prev.y, _mx, _my);
                }
                const _last = pts[pts.length - 1];
                ctx.lineTo(_last.x, _last.y);
                ctx.strokeStyle = outerColor;
                ctx.lineWidth = outerW;
                ctx.stroke();
                ctx.strokeStyle = innerColor;
                ctx.lineWidth = innerW;
                ctx.stroke();
            };
            ctx.save();
            ctx.translate(b.x, b.y);
            ctx.rotate(_mbAng);
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            const _mbGrad = ctx.createLinearGradient(-_mbLen * 0.65, 0, _mbLen * 0.65, 0);
            _mbGrad.addColorStop(0, 'rgba(80,0,0,0.25)');
            _mbGrad.addColorStop(0.55, 'rgba(155,18,18,0.95)');
            _mbGrad.addColorStop(1, 'rgba(255,120,120,0.92)');
            _drawVein(_mbPts, 'rgba(20,0,0,0.92)', _mbGrad, _mbR * 1.05, Math.max(0.9, _mbR * 0.42));

            const _branchBase = _mbPts[2];
            const _branchLen = _mbR * 3.1;
            const _branchWave = Math.sin(_mbT * 1.4) * _mbR * 0.55;
            const _branchA = [
                { x: _branchBase.x - _mbR * 0.2, y: _branchBase.y },
                { x: _branchBase.x - _branchLen * 0.25, y: _branchBase.y - _mbR * 0.95 + _branchWave },
                { x: _branchBase.x - _branchLen * 0.7, y: _branchBase.y - _mbR * 1.45 + _branchWave * 0.8 },
                { x: _branchBase.x - _branchLen, y: _branchBase.y - _mbR * 1.9 + _branchWave }
            ];
            const _branchB = [
                { x: _branchBase.x + _mbR * 0.1, y: _branchBase.y + _mbR * 0.05 },
                { x: _branchBase.x - _branchLen * 0.18, y: _branchBase.y + _mbR * 0.95 - _branchWave * 0.65 },
                { x: _branchBase.x - _branchLen * 0.58, y: _branchBase.y + _mbR * 1.35 - _branchWave * 0.55 },
                { x: _branchBase.x - _branchLen * 0.92, y: _branchBase.y + _mbR * 1.8 - _branchWave * 0.7 }
            ];
            _drawVein(_branchA, 'rgba(18,0,0,0.85)', 'rgba(120,10,10,0.95)', _mbR * 0.62, Math.max(0.7, _mbR * 0.22));
            _drawVein(_branchB, 'rgba(18,0,0,0.82)', 'rgba(120,10,10,0.92)', _mbR * 0.56, Math.max(0.6, _mbR * 0.20));

            ctx.fillStyle = 'rgba(255,170,170,0.65)';
            ctx.beginPath();
            ctx.ellipse(_mbLen * 0.6, _mbPts[_mbPts.length - 1].y * 0.35, _mbR * 0.45, _mbR * 0.25, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();

        } else {
            ctx.fillStyle = '#a5660b';
            ctx.fillRect(b.x - b.w/2, b.y - b.h/2, b.w, b.h);
            ctx.fillStyle = '#fdb813'; 
            const m = 2;
            if (b.w > m*2) {
                ctx.fillRect(b.x - b.w/2 + m, b.y - b.h/2 + m, b.w - m*2, b.h - m*2);
            }
            ctx.fillStyle = 'rgba(255,255,255,0.5)';
            ctx.fillRect(b.x - b.w/2 + 1, b.y - b.h/2 + 1, b.w/3, b.h/3);
        }
        ctx.restore();
    });

    // 3.5.4. Электрические лучи (молнии)
    if (typeof electricRays !== 'undefined' && electricRays) {
        electricRays.forEach((ray, idx) => {
            if (!isVisible(Math.min(ray.fromX, ray.toX) - 20, Math.min(ray.fromY, ray.toY) - 20, 
                          Math.max(ray.fromX, ray.toX) - Math.min(ray.fromX, ray.toX) + 40,
                          Math.max(ray.fromY, ray.toY) - Math.min(ray.fromY, ray.toY) + 40)) return;
            
            ctx.save();
            
            // Fade out over time
            const fadeAlpha = ray.life / ray.maxLife;
            const isNova = ray.isNova || false;
            
            // NOVA: BIG LIGHTNING STRIKES
            if (isNova) {
                ctx.globalCompositeOperation = 'lighter';  // Additive blending
                
                // Ultra-bright inner core
                ctx.strokeStyle = 'rgba(255, 255, 255, 1)';
                ctx.lineWidth = 12;
                ctx.lineCap = 'round';
                ctx.lineJoin = 'round';
                ctx.globalAlpha = 0.9 * fadeAlpha;
                
                ctx.beginPath();
                ctx.moveTo(ray.fromX, ray.fromY);
                
                const segmentCount = 7;
                const dx = (ray.toX - ray.fromX) / segmentCount;
                const dy = (ray.toY - ray.fromY) / segmentCount;
                
                for (let i = 1; i < segmentCount; i++) {
                    const offsetX = (Math.random() - 0.5) * 12;
                    const offsetY = (Math.random() - 0.5) * 12;
                    ctx.lineTo(ray.fromX + dx * i + offsetX, ray.fromY + dy * i + offsetY);
                }
                ctx.lineTo(ray.toX, ray.toY);
                ctx.stroke();
                
                // Bright cyan main bolt
                ctx.strokeStyle = 'rgba(0, 255, 255, 1)';
                ctx.lineWidth = 8;
                ctx.globalAlpha = 0.95 * fadeAlpha;
                
                ctx.beginPath();
                ctx.moveTo(ray.fromX, ray.fromY);
                for (let i = 1; i < segmentCount; i++) {
                    const offsetX = (Math.random() - 0.5) * 12;
                    const offsetY = (Math.random() - 0.5) * 12;
                    ctx.lineTo(ray.fromX + dx * i + offsetX, ray.fromY + dy * i + offsetY);
                }
                ctx.lineTo(ray.toX, ray.toY);
                ctx.stroke();
                
                // Massive outer glow
                ctx.strokeStyle = 'rgba(0, 200, 255, 0.7)';
                ctx.lineWidth = 24;
                ctx.globalAlpha = 0.4 * fadeAlpha;
                
                ctx.beginPath();
                ctx.moveTo(ray.fromX, ray.fromY);
                for (let i = 1; i < segmentCount; i++) {
                    const offsetX = (Math.random() - 0.5) * 12;
                    const offsetY = (Math.random() - 0.5) * 12;
                    ctx.lineTo(ray.fromX + dx * i + offsetX, ray.fromY + dy * i + offsetY);
                }
                ctx.lineTo(ray.toX, ray.toY);
                ctx.stroke();
                
                // Branch effects (smaller lightning branches)
                ctx.strokeStyle = 'rgba(100, 220, 255, 0.6)';
                ctx.lineWidth = 2;
                ctx.globalAlpha = 0.6 * fadeAlpha;
                
                for (let b = 0; b < 3; b++) {
                    ctx.beginPath();
                    const branchStart = Math.floor(Math.random() * (segmentCount - 1)) + 1;
                    const branchX = ray.fromX + dx * branchStart;
                    const branchY = ray.fromY + dy * branchStart;
                    ctx.moveTo(branchX, branchY);
                    
                    const branchAngle = Math.random() * Math.PI * 2;
                    const branchLen = 40 + Math.random() * 60;
                    ctx.lineTo(branchX + Math.cos(branchAngle) * branchLen, branchY + Math.sin(branchAngle) * branchLen);
                    ctx.stroke();
                }
                
                // Massive endpoint explosion
                ctx.globalAlpha = 0.8 * fadeAlpha;
                ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
                ctx.beginPath();
                ctx.arc(ray.toX, ray.toY, 8, 0, Math.PI * 2);
                ctx.fill();
                
                ctx.fillStyle = 'rgba(0, 255, 255, 0.8)';
                ctx.beginPath();
                ctx.arc(ray.toX, ray.toY, 5, 0, Math.PI * 2);
                ctx.fill();
                
            } else {
                // Regular chain lightning (thin rays)
                ctx.globalAlpha = 0.8 * fadeAlpha;
                
                // Main bright lightning bolt
                ctx.strokeStyle = 'rgba(0, 255, 255, 1)';
                ctx.lineWidth = 3;
                ctx.lineCap = 'round';
                ctx.lineJoin = 'round';
                
                // Draw main beam with slight jagged effect
                ctx.beginPath();
                ctx.moveTo(ray.fromX, ray.fromY);
                
                // Add jagger to make it look more like lightning
                const segmentCount = 5;
                const dx = (ray.toX - ray.fromX) / segmentCount;
                const dy = (ray.toY - ray.fromY) / segmentCount;
                
                for (let i = 1; i < segmentCount; i++) {
                    const offsetX = (Math.random() - 0.5) * 8;
                    const offsetY = (Math.random() - 0.5) * 8;
                    ctx.lineTo(ray.fromX + dx * i + offsetX, ray.fromY + dy * i + offsetY);
                }
                ctx.lineTo(ray.toX, ray.toY);
                ctx.stroke();
                
                // Glow effect (outer light)
                ctx.strokeStyle = 'rgba(0, 212, 255, 0.5)';
                ctx.lineWidth = 8;
                ctx.globalAlpha = 0.3 * fadeAlpha;
                ctx.beginPath();
                ctx.moveTo(ray.fromX, ray.fromY);
                for (let i = 1; i < segmentCount; i++) {
                    const offsetX = (Math.random() - 0.5) * 8;
                    const offsetY = (Math.random() - 0.5) * 8;
                    ctx.lineTo(ray.fromX + dx * i + offsetX, ray.fromY + dy * i + offsetY);
                }
                ctx.lineTo(ray.toX, ray.toY);
                ctx.stroke();
                
                // Electric sparkles at endpoints
                ctx.globalAlpha = fadeAlpha;
                ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
                ctx.beginPath();
                ctx.arc(ray.fromX, ray.fromY, 2, 0, Math.PI * 2);
                ctx.fill();
                ctx.beginPath();
                ctx.arc(ray.toX, ray.toY, 2, 0, Math.PI * 2);
                ctx.fill();
            }
            
            ctx.restore();
            
        });
        
    }

    // 3.5.5. Медицинские зоны (лечение)
    if (typeof medicalZones !== 'undefined' && medicalZones) {
        medicalZones.forEach((zone, idx) => {
            if (!isVisible(zone.x - zone.radius, zone.y - zone.radius, zone.radius * 2, zone.radius * 2)) return;
            
            ctx.save();
            
            // Fade out over time
            const fadeAlpha = zone.life / zone.maxLife;
            ctx.globalAlpha = 0.5 * fadeAlpha;
            
            // Outer pulsing circle (green glow)
            const pulseScale = 1 + Math.sin(Date.now() * 0.005) * 0.15;
            ctx.strokeStyle = '#00ff88';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(zone.x, zone.y, zone.radius * (0.8 + 0.2 * pulseScale), 0, Math.PI * 2);
            ctx.stroke();
            
            // Inner circle (softer)
            ctx.globalAlpha = 0.3 * fadeAlpha;
            ctx.strokeStyle = '#00ff88';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.arc(zone.x, zone.y, zone.radius * 0.5, 0, Math.PI * 2);
            ctx.stroke();
            
            // Fill with subtle green
            ctx.globalAlpha = 0.08 * fadeAlpha;
            ctx.fillStyle = '#00ff88';
            ctx.beginPath();
            ctx.arc(zone.x, zone.y, zone.radius, 0, Math.PI * 2);
            ctx.fill();
            
            // Healing particles (sparkles around the zone)
            ctx.globalAlpha = 0.6 * fadeAlpha;
            for (let p = 0; window.effectsEnabled !== false && p < 8; p++) {
                const angle = (p / 8) * Math.PI * 2 + Date.now() * 0.002;
                const pRadius = zone.radius + 5;
                const px = zone.x + Math.cos(angle) * pRadius;
                const py = zone.y + Math.sin(angle) * pRadius;
                ctx.fillStyle = '#00ff88';
                ctx.beginPath();
                ctx.arc(px, py, 1.5, 0, Math.PI * 2);
                ctx.fill();
            }
            
            ctx.restore();
        });
        
        // Remove expired zones
        medicalZones = medicalZones.filter(zone => zone.life > 0);
    }

    // Buratino barrage projectiles
    if (typeof buratinoBarrages !== 'undefined' && buratinoBarrages) {
        for (const proj of buratinoBarrages) {
            // Draw projectile
            if (!isVisible(proj.x - proj.radius, proj.y - proj.radius, proj.radius*2, proj.radius*2)) continue;
            
            ctx.save();
            ctx.fillStyle = '#ff6600';
            ctx.shadowColor = '#ff3300';
            ctx.shadowBlur = 8;
            ctx.beginPath();
            ctx.arc(proj.x, proj.y, proj.radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
    }

    // Musical sound waves
    if (typeof musicalSoundWaves !== 'undefined' && musicalSoundWaves) {
        for (const proj of musicalSoundWaves) {
            // Draw projectile
            if (!isVisible(proj.x - proj.radius, proj.y - proj.radius, proj.radius*2, proj.radius*2)) continue;
            
            ctx.save();
            ctx.fillStyle = '#00ffff';
            ctx.shadowColor = '#00ffff';
            ctx.shadowBlur = 6;
            ctx.beginPath();
            ctx.arc(proj.x, proj.y, proj.radius, 0, Math.PI * 2);
            ctx.fill();
            
            // Add oscillating rings
            const ringAlpha = 0.5 * (proj.life / proj.maxLife);
            ctx.globalAlpha = ringAlpha;
            ctx.strokeStyle = '#00ffff';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.arc(proj.x, proj.y, proj.radius * 2, 0, Math.PI * 2);
            ctx.stroke();
            
            ctx.restore();
        }
    }

    // 3.5.5b. Mines (only player-placed mines are visible; enemy mines are hidden)
    if (typeof mines !== 'undefined' && mines && mines.length > 0) {
        for (const mine of mines) {
            // Only render mines placed by the player (team 0); enemy mines are invisible
            if (mine.team !== 0) continue;
            if (!isVisible(mine.x - mine.radius - 6, mine.y - mine.radius - 6, (mine.radius + 6) * 2, (mine.radius + 6) * 2)) continue;
            ctx.save();
            ctx.translate(mine.x, mine.y);
            const r = mine.radius;
            // A low, weathered metal case sits on a soft ground shadow.
            ctx.fillStyle = 'rgba(15,20,13,0.38)';
            ctx.beginPath(); ctx.ellipse(r * 0.08, r * 0.12, r * 1.04, r * 0.95, 0, 0, Math.PI * 2); ctx.fill();
            const mGrad = ctx.createRadialGradient(-r * 0.32, -r * 0.35, r * 0.04, 0, 0, r);
            mGrad.addColorStop(0, '#92996b'); mGrad.addColorStop(0.65, '#596443'); mGrad.addColorStop(1, '#303b2a');
            ctx.fillStyle = mGrad; ctx.strokeStyle = '#242e20'; ctx.lineWidth = Math.max(1, r * 0.1);
            ctx.beginPath(); ctx.arc(0, 0, r * 0.92, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
            ctx.strokeStyle = 'rgba(200,203,160,0.5)'; ctx.lineWidth = Math.max(0.7, r * 0.055);
            ctx.beginPath(); ctx.arc(0, 0, r * 0.77, Math.PI * 1.05, Math.PI * 1.92); ctx.stroke();
            // The pressure plate is inset into the case, with four fastening bolts.
            const plate = ctx.createRadialGradient(-r * 0.18, -r * 0.2, 0, 0, 0, r * 0.59);
            plate.addColorStop(0, '#89936a'); plate.addColorStop(1, '#4d5b3b');
            ctx.fillStyle = plate; ctx.strokeStyle = '#34412d'; ctx.lineWidth = Math.max(1, r * 0.08);
            ctx.beginPath(); ctx.arc(0, 0, r * 0.58, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
            ctx.strokeStyle = 'rgba(218,219,181,0.36)'; ctx.lineWidth = Math.max(0.6, r * 0.045);
            ctx.beginPath(); ctx.arc(0, 0, r * 0.44, Math.PI * 1.1, Math.PI * 1.85); ctx.stroke();
            ctx.fillStyle = '#bec39b';
            for (let i = 0; i < 4; i++) {
                const a = Math.PI / 4 + i * Math.PI / 2;
                ctx.beginPath(); ctx.arc(Math.cos(a) * r * 0.73, Math.sin(a) * r * 0.73, Math.max(0.7, r * 0.045), 0, Math.PI * 2); ctx.fill();
            }
            ctx.fillStyle = '#b49a56'; ctx.fillRect(-r * 0.18, -r * 0.035, r * 0.36, r * 0.07);
            ctx.restore();
        }
    }

    // 3.5.6. Звуковые волны
    soundWaves.forEach(sw => {
        if (!isVisible(sw.x - sw.radius, sw.y - sw.radius, sw.radius * 2, sw.radius * 2)) return;
        ctx.strokeStyle = '#f1c40f';
        ctx.lineWidth = 2;
        ctx.globalAlpha = 0.6;
        ctx.beginPath();
        ctx.arc(sw.x, sw.y, sw.radius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.globalAlpha = 1;
    });

    // 3.6. Огненные частицы
    flames.forEach(f => {
        if (!isVisible(f.x, f.y, 8, 8)) return;
        // Radius is bigger at start of life (fresh flame), shrinks as it dies
        const maxLife = (f.owner === 'enemy' || f.owner === 'ally') ? 45 : 28;
        const lifeRatio = Math.min(1, f.life / maxLife);
        const r = 3 + lifeRatio * 5; // 3..8px
        const grad = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, r);
        grad.addColorStop(0, `rgba(255, 240, 100, ${0.7 + lifeRatio * 0.3})`);
        grad.addColorStop(0.45, `rgba(255, 100, 0, ${0.5 + lifeRatio * 0.3})`);
        grad.addColorStop(1, 'rgba(255, 0, 0, 0)');
        ctx.fillStyle = grad;
        ctx.beginPath(); ctx.arc(f.x, f.y, r, 0, Math.PI*2); ctx.fill();
    });

    ctx.shadowBlur = 0;
    ctx.shadowColor = 'transparent';
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 1;

    // AI Debug
    if (typeof SHOW_AI_DEBUG !== 'undefined' && SHOW_AI_DEBUG && typeof drawDebugLines === 'function') drawDebugLines();

    // 4. Враги
    allies.forEach(a => {
        if (!a || !a.alive || !isVisible(a.x, a.y, a.w, a.h) || !GameTerrain.canSee(tank, a, objects)) return;
        ctx.save();
        ctx.translate(a.x + a.w/2, a.y + a.h/2);
        // Draw mirror shield for ally bots
        if (a.tankType === 'mirror' && a.mirrorShieldActive) {
            const shieldSize = Math.max(a.w, a.h) * 0.8;
            ctx.save();
            ctx.beginPath();
            ctx.arc(0, 0, shieldSize, 0, Math.PI * 2);
            const grad = ctx.createRadialGradient(0, 0, shieldSize * 0.8, 0, 0, shieldSize);
            grad.addColorStop(0, 'rgba(255,255,255,0)');
            grad.addColorStop(0.5, 'rgba(200,200,255,0.4)');
            grad.addColorStop(1, 'rgba(255,255,255,0.8)');
            ctx.fillStyle = grad;
            ctx.fill();
            ctx.strokeStyle = '#aaddff';
            ctx.lineWidth = 3;
            ctx.setLineDash([10, 5]);
            ctx.stroke();
            ctx.setLineDash([]);
            ctx.rotate(Date.now() * 0.005);
            ctx.strokeStyle = 'rgba(255,255,255,0.9)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(0, 0, shieldSize + 5, 0, Math.PI * 1.5);
            ctx.stroke();
            ctx.restore();
        }
        const _aBurovoyDrill = getBurovoyDrillRenderState(a);
        drawTankOn(ctx, 0, 0, a.w, a.h, a.color || '#888', a.turretAngle || 0, 1, a.tankType || 'normal', { heat: a.heat, overheated: a.overheated, spartanRage: a.hp < (a.maxHp || tankMaxHpByType.spartan) * 0.5, illuminatUltStrength: GameTerrain.illuminatSuperStrength(a), burovoyDrillAnim: _aBurovoyDrill.burovoyDrillAnim, burovoyBurrowActive: _aBurovoyDrill.burovoyBurrowActive, burovoyBurrowPhase: _aBurovoyDrill.burovoyBurrowPhase, burovoyDrillActive: _aBurovoyDrill.burovoyDrillActive, burovoyDrillHit: _aBurovoyDrill.burovoyDrillHit, isMyasnoyBody: !!(a.isMyasnoyBody) }, GameTerrain.getMotion(a));
        drawTankDamage(ctx, a);
        drawEmbeddedProjectiles(ctx, a);
        drawSandCurseOverlay(ctx, Math.max(a.w, a.h) * 0.85, a.sandCurseTimer || 0);
        // Hit flash - radial impact burst
        const _aFlashAge = Date.now() - (a.hitFlashTime || 0);
        if (_aFlashAge < 120) {
            const _fa = 1 - _aFlashAge / 120;
            const _ar = Math.max(a.w, a.h) * 0.75;
            const _ag = ctx.createRadialGradient(0, 0, 0, 0, 0, _ar);
            _ag.addColorStop(0,    `rgba(255,255,200,${(_fa * 0.95).toFixed(2)})`);
            _ag.addColorStop(0.3,  `rgba(255,160,0,${(_fa * 0.7).toFixed(2)})`);
            _ag.addColorStop(0.65, `rgba(255,40,0,${(_fa * 0.35).toFixed(2)})`);
            _ag.addColorStop(1,    'rgba(255,0,0,0)');
            ctx.beginPath();
            ctx.arc(0, 0, _ar, 0, Math.PI * 2);
            ctx.fillStyle = _ag;
            ctx.fill();
        }
        ctx.restore();
        if (_aBurovoyDrill.burovoyBurrowActive) drawBurovoyBurrowCracks(ctx, a);
        if (a.mechPowerStunTime > 0 && typeof drawParalysisOverlay === 'function') drawParalysisOverlay(ctx, a.x, a.y, a.w, a.h);
        if (a.paralyzed && a.frozenEffect > 0) drawFrozenOverlay(ctx, a.x, a.y, a.w, a.h, a.frozenEffect);
        else if (a.iceSlowed && a.iceSlowedTime > 0) drawIceSlowOverlay(ctx, a.x, a.y, a.w, a.h, a.iceSlowedTime, a);
        ctx.fillStyle = 'blue';
        ctx.fillRect(a.x, a.y - 10, a.w, 5);
        ctx.fillStyle = 'black';
        const maxAllyHp = a.maxHp || (typeof tankMaxHpByType !== 'undefined' && tankMaxHpByType[a.tankType]) || 300;
        const missingHp = maxAllyHp - a.hp;
        if (missingHp > 0) {
            ctx.fillRect(a.x + a.w * (a.hp / maxAllyHp), a.y - 10, a.w * (missingHp / maxAllyHp), 5);
        }
        ctx.fillStyle = 'white';
        ctx.font = 'bold 7px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(Math.ceil(a.hp) + '/' + maxAllyHp, a.x + a.w / 2, a.y - 7);
        drawReloadBar(ctx, a, a.tankType, '#86aebd');
    });

    // Helper for beam drawing (applied to all)
    function drawUnitBeam(unit) {
        if (!GameTerrain.canSee(tank, unit, objects)) return;
        if (!unit || (unit.tankType !== 'illuminat' && unit !== tank)) return;
        if (unit === tank && tankType !== 'illuminat') return; // player global override

        if (!unit.beamIntensity || unit.beamIntensity <= 0) return;
        
        // Intensity check
        const intensity = unit.beamIntensity; // 0..1
        
        const elapsed = (Date.now() - (unit.beamStartTime || unit.beamStart || 0)) / 1000;
        let color1 = '#ffff00'; // yellow
        let color2 = '#ffff00';
        if (elapsed > 2) {
            color1 = '#ff8000'; // orange
            color2 = '#ff0000'; // red
        }
        if (elapsed > 3) {
            color1 = '#ff0000';
            color2 = '#800000'; // dark red
        }
        
        // Use actual beam length calculated by physics if available, otherwise default
        const maxLen = 300;
        const beamLength = (typeof unit.actualBeamLength !== 'undefined') ? unit.actualBeamLength : maxLen;
        
        const startX = unit.x + unit.w/2;
        const startY = unit.y + unit.h/2;
        const angle = unit.turretAngle;
        const endX = startX + Math.cos(angle) * beamLength;
        const endY = startY + Math.sin(angle) * beamLength;
        
        ctx.save();
        
        // Use intensity for opacity
        ctx.globalAlpha = intensity;
        
        // Outer Glow - REPLACED shadowBlur with simpler wide stroke for performance
        // ctx.shadowBlur = (15 + Math.sin(Date.now()/50)*5) * intensity;
        // ctx.shadowColor = color1;
        
        // Manual Glow (Faster)
        ctx.strokeStyle = color1;
        ctx.globalAlpha = 0.3 * intensity;
        ctx.lineWidth = (15 + Math.sin(Date.now()/50)*5);
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(endX, endY);
        ctx.stroke();
        
        // Restore Alpha
        ctx.globalAlpha = intensity;

        // Main Beam
        const grad = ctx.createLinearGradient(startX, startY, endX, endY);
        grad.addColorStop(0, color1);
        grad.addColorStop(1, color2);
        ctx.strokeStyle = grad;
        // Width grows with intensity
        ctx.lineWidth = (2 + (6 + Math.sin(Date.now()/50)) * intensity); 
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(endX, endY);
        ctx.stroke();
        
        // Inner white core suitable for energy beams
        ctx.strokeStyle = `rgba(255, 255, 255, ${intensity})`;
        ctx.lineWidth = 2 * intensity;
        ctx.shadowBlur = 0;
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(endX, endY);
        ctx.stroke();
        
        // Spiral effects winding around the beam - OPTIMIZED
        if (intensity > 0.3) {
            const time = Date.now() / 100;
            ctx.strokeStyle = color1;
            ctx.lineWidth = 1 * intensity;
            ctx.beginPath();
            
            // Precalculate trigonometry once outside the loop
            const cosA = Math.cos(angle);
            const sinA = Math.sin(angle);
            // Perpendicular vector (-sin, cos)
            const perpX = -sinA;
            const perpY = cosA;
            
            // Increase step size from 4 to 10 to reduce iterations by ~60%
            const step = 10;
            for(let i=0; i<Math.min(beamLength, 300); i+=step) {
                 const bx = startX + cosA * i;
                 const by = startY + sinA * i;
                 
                 const wave = Math.sin(i*0.05 - time) * 8 * intensity;
                 ctx.lineTo(bx + perpX * wave, by + perpY * wave);
            }
            ctx.stroke();
        }
        
        ctx.shadowBlur = 0;
        ctx.lineCap = 'butt';
        ctx.restore();
    }

    // Draw beams for all known entities
    allies.forEach(a => drawUnitBeam(a));
    enemies.forEach(e => drawUnitBeam(e));
    if (tank.alive !== false) drawUnitBeam(tank);

    // ── Water jet stream renderer ─────────────────────────────────────────
    function drawUnitWaterjet(unit) {
        if (!GameTerrain.canSee(tank, unit, objects)) return;
        const isPlayer = unit === tank;
        const activeType = isPlayer ? tankType : (unit.tankType || 'normal');
        if (activeType !== 'waterjet') return;
        const beamLen = unit.waterjetBeamLen || 0;
        const isActive = unit.waterjetActive;
        const hitWall = unit.waterjetHitWall === true;
        const hitTarget = unit.waterjetHitTarget === true;

        // Init per-unit droplet arrays
        if (!unit.wjDroplets) unit.wjDroplets = [];
        if (!unit.wjSplash) unit.wjSplash = [];

        const startX = unit.x + unit.w / 2;
        const startY = unit.y + unit.h / 2;
        const angle = unit.turretAngle;
        const cosA = Math.cos(angle), sinA = Math.sin(angle);
        const perpX = -sinA, perpY = cosA;
        const endX = startX + cosA * beamLen;
        const endY = startY + sinA * beamLen;

        if (isActive && beamLen > 10) {
            // Tight straight-beam droplets — almost no lateral spread
            const count = 8;
            for (let i = 0; i < count; i++) {
                const t = Math.random() * beamLen;
                const bx = startX + cosA * t;
                const by = startY + sinA * t;
                const fwd = 1.5 + Math.random() * 1.5;
                const lat = (Math.random() - 0.5) * 0.25; // negligible lateral
                const vx = cosA * fwd + perpX * lat;
                const vy = sinA * fwd + perpY * lat;
                const life = 5 + Math.floor(Math.random() * 5);
                const r = 1 + Math.random() * 1.5;
                const palette = ['rgba(255,255,255,0.9)', 'rgba(174,214,241,0.9)', 'rgba(93,173,226,0.85)', 'rgba(46,134,193,0.8)'];
                const col = palette[Math.floor(Math.random() * palette.length)];
                unit.wjDroplets.push({ x: bx, y: by, vx, vy, life, maxLife: life, r, col });
            }

            if (hitWall) {
                // Strong perpendicular splash on wall impact
                for (let i = 0; i < 6; i++) {
                    const side = (Math.random() < 0.5 ? 1 : -1);
                    const sa = angle + Math.PI / 2 * side + (Math.random() - 0.5) * 0.9;
                    const sp = 2 + Math.random() * 3.5;
                    unit.wjSplash.push({
                        x: endX + (Math.random() - 0.5) * 5,
                        y: endY + (Math.random() - 0.5) * 5,
                        vx: Math.cos(sa) * sp, vy: Math.sin(sa) * sp,
                        life: 8 + Math.floor(Math.random() * 8), maxLife: 14,
                        r: 1.5 + Math.random() * 2.5,
                        col: 'rgba(93,173,226,0.85)'
                    });
                }
            } else if (unit.waterjetHitTarget) {
                // Perpendicular splash when hitting a tank (like wall)
                for (let i = 0; i < 6; i++) {
                    const side = (Math.random() < 0.5 ? 1 : -1);
                    const sa = angle + Math.PI / 2 * side + (Math.random() - 0.5) * 0.9;
                    const sp = 2 + Math.random() * 3.5;
                    unit.wjSplash.push({
                        x: endX + (Math.random() - 0.5) * 5,
                        y: endY + (Math.random() - 0.5) * 5,
                        vx: Math.cos(sa) * sp, vy: Math.sin(sa) * sp,
                        life: 8 + Math.floor(Math.random() * 8), maxLife: 14,
                        r: 1.5 + Math.random() * 2.5,
                        col: 'rgba(93,173,226,0.85)'
                    });
                }
            } else {
                // Visible free-air mist at beam tip when no wall or target hit
                const mistCount = 4 + Math.floor(Math.random() * 3);
                for (let i = 0; i < mistCount; i++) {
                    const sa = angle + (Math.random() - 0.5) * 0.7;
                    const sp = 1.2 + Math.random() * 2.2;
                    unit.wjSplash.push({
                        x: endX + (Math.random() - 0.5) * 4,
                        y: endY + (Math.random() - 0.5) * 4,
                        vx: Math.cos(sa) * sp, vy: Math.sin(sa) * sp,
                        life: 5 + Math.floor(Math.random() * 6), maxLife: 10,
                        r: 0.9 + Math.random() * 1.5,
                        col: 'rgba(174,214,241,0.72)'
                    });
                }
            }
        }

        ctx.save();

        // Draw + update beam droplets (tight stream)
        for (let i = unit.wjDroplets.length - 1; i >= 0; i--) {
            const d = unit.wjDroplets[i];
            d.x += d.vx; d.y += d.vy;
            d.vx *= 0.92; d.vy *= 0.92;
            d.life--;
            if (d.life <= 0) { unit.wjDroplets.splice(i, 1); continue; }
            ctx.globalAlpha = d.life / d.maxLife;
            ctx.fillStyle = d.col;
            ctx.beginPath(); ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2); ctx.fill();
        }

        // Draw + update wall splash droplets
        for (let i = unit.wjSplash.length - 1; i >= 0; i--) {
            const d = unit.wjSplash[i];
            d.x += d.vx; d.y += d.vy;
            d.vx *= 0.87; d.vy *= 0.87;
            d.life--;
            if (d.life <= 0) { unit.wjSplash.splice(i, 1); continue; }
            ctx.globalAlpha = d.life / d.maxLife;
            ctx.fillStyle = d.col;
            ctx.beginPath(); ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2); ctx.fill();
        }

        // Backbone glow + nozzle
        if (isActive && beamLen > 10) {
            ctx.globalAlpha = 0.18;
            ctx.strokeStyle = '#aed6f1';
            ctx.lineWidth = 9;
            ctx.lineCap = 'round';
            ctx.beginPath(); ctx.moveTo(startX, startY); ctx.lineTo(endX, endY); ctx.stroke();
            ctx.globalAlpha = 0.35;
            ctx.strokeStyle = '#5dade2';
            ctx.lineWidth = 3;
            ctx.beginPath(); ctx.moveTo(startX, startY); ctx.lineTo(endX, endY); ctx.stroke();

            const pulse = 0.5 + 0.5 * Math.sin(Date.now() / 40);
            ctx.globalAlpha = 0.4 + 0.3 * pulse;
            ctx.fillStyle = '#aed6f1';
            ctx.beginPath(); ctx.arc(startX + cosA * 22, startY + sinA * 22, 4 + pulse * 2, 0, Math.PI * 2); ctx.fill();
        }

        ctx.globalAlpha = 1; ctx.lineCap = 'butt';
        ctx.restore();
    }
    allies.forEach(a => drawUnitWaterjet(a));
    enemies.forEach(e => drawUnitWaterjet(e));
    if (tank.alive !== false) drawUnitWaterjet(tank);

    enemies.forEach(enemy => {
        if (!enemy || !enemy.alive || !isVisible(enemy.x, enemy.y, enemy.w, enemy.h) || !GameTerrain.canSee(tank, enemy, objects)) return;
        // Hide enemy burovoy completely while burrowed - player cannot see its position
        if (enemy.tankType === 'burovoy' && enemy.burovoyBurrowActive === true) return;
        ctx.save();
        // Smooth movement interpolation: render at interpolated position
        const renderX = enemy.x + enemy.w/2;
        const renderY = enemy.y + enemy.h/2;
        ctx.translate(renderX, renderY);
        // Draw mirror shield for bot enemies
        if (enemy.tankType === 'mirror' && enemy.mirrorShieldActive) {
            const shieldSize = Math.max(enemy.w, enemy.h) * 0.8;
            ctx.save();
            ctx.beginPath();
            ctx.arc(0, 0, shieldSize, 0, Math.PI * 2);
            const grad = ctx.createRadialGradient(0, 0, shieldSize * 0.8, 0, 0, shieldSize);
            grad.addColorStop(0, 'rgba(255,255,255,0)');
            grad.addColorStop(0.5, 'rgba(200,200,255,0.4)');
            grad.addColorStop(1, 'rgba(255,255,255,0.8)');
            ctx.fillStyle = grad;
            ctx.fill();
            ctx.strokeStyle = '#aaddff';
            ctx.lineWidth = 3;
            ctx.setLineDash([10, 5]);
            ctx.stroke();
            ctx.setLineDash([]);
            ctx.rotate(Date.now() * 0.005);
            ctx.strokeStyle = 'rgba(255,255,255,0.9)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(0, 0, shieldSize + 5, 0, Math.PI * 1.5);
            ctx.stroke();
            ctx.restore();
        }
        // Draw boss with custom texture; regular tanks use drawTankOn
        let _enemyBurovoyDrill = null;
        if (enemy.isBoss) {
            drawBossOn(ctx, enemy.w, enemy.h, enemy.turretAngle || 0, enemy.phase || 1);
        } else {
            const _drawColor = enemy.paralyzed && !(enemy.mechPowerStunTime > 0) ? '#00FFFF' : (enemy.color || '#B22222');
            // Calculate movement animation for mech tanks
            const _moveAnim = GameTerrain.getMotion(enemy);
            const _eTankType = enemy.tankType || 'normal';
            _enemyBurovoyDrill = getBurovoyDrillRenderState(enemy);
            drawTankOn(ctx, 0, 0, enemy.w, enemy.h, _drawColor, enemy.turretAngle || 0, 1, _eTankType, { heat: enemy.heat, overheated: enemy.overheated, spartanRage: enemy.hp < (enemy.maxHp || tankMaxHpByType.spartan) * 0.5, illuminatUltStrength: GameTerrain.illuminatSuperStrength(enemy), burovoyDrillAnim: _enemyBurovoyDrill.burovoyDrillAnim, burovoyBurrowActive: _enemyBurovoyDrill.burovoyBurrowActive, burovoyBurrowPhase: _enemyBurovoyDrill.burovoyBurrowPhase, burovoyDrillActive: _enemyBurovoyDrill.burovoyDrillActive, burovoyDrillHit: _enemyBurovoyDrill.burovoyDrillHit }, _moveAnim);
            drawSandCurseOverlay(ctx, Math.max(enemy.w, enemy.h) * 0.85, enemy.sandCurseTimer || 0);
        }
        drawTankDamage(ctx, enemy);
        drawEmbeddedProjectiles(ctx, enemy);
        // Hit flash - radial impact burst
        const _eFlashAge = Date.now() - (enemy.hitFlashTime || 0);
        if (_eFlashAge < 120) {
            const _fa = 1 - _eFlashAge / 120;
            const _er = Math.max(enemy.w, enemy.h) * 0.75;
            const _eg = ctx.createRadialGradient(0, 0, 0, 0, 0, _er);
            _eg.addColorStop(0,    `rgba(255,255,200,${(_fa * 0.95).toFixed(2)})`);
            _eg.addColorStop(0.3,  `rgba(255,160,0,${(_fa * 0.7).toFixed(2)})`);
            _eg.addColorStop(0.65, `rgba(255,40,0,${(_fa * 0.35).toFixed(2)})`);
            _eg.addColorStop(1,    'rgba(255,0,0,0)');
            ctx.beginPath();
            ctx.arc(0, 0, _er, 0, Math.PI * 2);
            ctx.fillStyle = _eg;
            ctx.fill();
        }
        // Boss phase 2 glow overlay is already baked into drawBossOn
        ctx.restore();
        if (_enemyBurovoyDrill && _enemyBurovoyDrill.burovoyBurrowActive) drawBurovoyBurrowCracks(ctx, enemy);
        if (enemy.mechPowerStunTime > 0 && typeof drawParalysisOverlay === 'function') drawParalysisOverlay(ctx, enemy.x, enemy.y, enemy.w, enemy.h);
        if (enemy.paralyzed && enemy.frozenEffect > 0) drawFrozenOverlay(ctx, enemy.x, enemy.y, enemy.w, enemy.h, enemy.frozenEffect);
        else if (enemy.iceSlowed && enemy.iceSlowedTime > 0) drawIceSlowOverlay(ctx, enemy.x, enemy.y, enemy.w, enemy.h, enemy.iceSlowedTime, enemy);
        // Draw Квант overload debuff indicator
        if (enemy._kvantOverload && enemy._kvantOverloadTimer > 0) {
            const _ovProg = enemy._kvantOverloadTimer / 300; // 1 = just applied, 0 = about to explode
            const _ovPulse = 0.55 + 0.45 * Math.sin(Date.now() * 0.012);
            const _ovCx = enemy.x + enemy.w / 2;
            const _ovCy = enemy.y + enemy.h / 2;
            const _ovR = Math.max(enemy.w, enemy.h) * 0.72;
            ctx.save();
            // Pulsing dashed cyan ring
            ctx.strokeStyle = `rgba(0,229,255,${(_ovPulse * 0.85).toFixed(2)})`;
            ctx.lineWidth = 2;
            ctx.setLineDash([5, 4]);
            ctx.beginPath();
            ctx.arc(_ovCx, _ovCy, _ovR, 0, Math.PI * 2);
            ctx.stroke();
            ctx.setLineDash([]);
            // Countdown arc (solid, fills up as timer runs out)
            ctx.strokeStyle = 'rgba(0,229,255,0.95)';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(_ovCx, _ovCy, _ovR + 5, -Math.PI / 2, -Math.PI / 2 + _ovProg * Math.PI * 2);
            ctx.stroke();
            // Cyan overload icon above tank
            ctx.fillStyle = `rgba(0,229,255,${_ovPulse.toFixed(2)})`;
            ctx.font = 'bold 11px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'bottom';
            ctx.fillText('⚡', _ovCx, enemy.y - 13);
            ctx.restore();
        }
        if ((enemy.myasnoyHypnoTimer || 0) > 0) {
            const _hyProg = Math.max(0, Math.min(1, (enemy.myasnoyHypnoTimer || 0) / 300));
            const _hyPulse = 0.68 + 0.32 * Math.sin(Date.now() * 0.012 + enemy.x * 0.03);
            const _hyCx = enemy.x + enemy.w / 2;
            const _hyCy = enemy.y - 16;
            const _hyR = Math.max(enemy.w, enemy.h) * 0.22;
            ctx.save();
            ctx.strokeStyle = `rgba(185,115,255,${(0.8 * _hyPulse).toFixed(2)})`;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(_hyCx, _hyCy, _hyR + 3, 0, Math.PI * 2);
            ctx.stroke();
            ctx.strokeStyle = 'rgba(235,210,255,0.92)';
            ctx.lineWidth = 2.5;
            ctx.beginPath();
            ctx.arc(_hyCx, _hyCy, _hyR + 6, -Math.PI / 2, -Math.PI / 2 + _hyProg * Math.PI * 2);
            ctx.stroke();
            ctx.fillStyle = `rgba(249,240,255,${(0.92 * _hyPulse).toFixed(2)})`;
            ctx.font = 'bold 12px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('◎', _hyCx, _hyCy + 0.5);
            ctx.restore();
        }
        if ((enemy.tankType === 'mechShield') && typeof drawShieldActiveOverlay === 'function') {
            const _eFadeR = enemy.mechShieldActive ? 1 : Math.max(0, (enemy.mechShieldFadeTimer || 0) / 30);
            const _eDmgP = enemy.mechShieldDamagePercent || 0;
            if (_eFadeR > 0) drawShieldActiveOverlay(ctx, enemy.x, enemy.y, enemy.w, enemy.h, _eFadeR, _eDmgP);
        }
        ctx.fillStyle = 'red';
        ctx.fillRect(enemy.x, enemy.y - 10, enemy.w, 5);
        ctx.fillStyle = 'black';
        const maxHp = enemy.maxHp || (typeof tankMaxHpByType !== 'undefined' && tankMaxHpByType[enemy.tankType]) || 300;
        const missingHp = maxHp - enemy.hp;
        if (missingHp > 0) {
            ctx.fillRect(enemy.x + enemy.w * (enemy.hp / maxHp), enemy.y - 10, enemy.w * (missingHp / maxHp), 5);
        }
        ctx.fillStyle = 'white';
        ctx.font = 'bold 7px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(Math.ceil(enemy.hp) + '/' + maxHp, enemy.x + enemy.w / 2, enemy.y - 7);
        // Draw energy bar for mech enemies
        if ((enemy.tankType === 'mechDiy' || enemy.tankType === 'mechShield' || enemy.tankType === 'mechRocket') && typeof drawMechEnergyBar === 'function') {
            drawMechEnergyBar(ctx, enemy);
        }
    });

    // 6. Иллюзии
    illusions.forEach(ill => {
        if (!GameTerrain.canSee(tank, ill, objects)) return;
        ctx.save();
        ctx.translate(ill.x, ill.y);
        ctx.globalAlpha = 0.5; // semi-transparent
        // Add a "glitch" color shift
        if (Math.random() > 0.8) {
             ctx.translate((Math.random()-0.5)*4, (Math.random()-0.5)*4);
        }
        drawTankOn(ctx, 0, 0, 38, 38, ill.color, ill.turretAngle, 1, ill.tankType || 'normal', null, 0);
        ctx.restore();
    });

    // 7. Танк
    if (tank.alive !== false) {
        ctx.save();
        ctx.translate(tank.x + tank.w/2, tank.y + tank.h/2);
        
        // Draw Mirror Shield if active
        if (tankType === 'mirror' && tank.mirrorShieldActive) {
            ctx.save();
            const shieldSize = Math.max(tank.w, tank.h) * 0.8;
            ctx.beginPath();
            ctx.arc(0, 0, shieldSize, 0, Math.PI * 2);
            // Reflective look
            const grad = ctx.createRadialGradient(0, 0, shieldSize * 0.8, 0, 0, shieldSize);
            grad.addColorStop(0, 'rgba(255, 255, 255, 0)');
            grad.addColorStop(0.5, 'rgba(200, 200, 255, 0.4)');
            grad.addColorStop(1, 'rgba(255, 255, 255, 0.8)');
            ctx.fillStyle = grad;
            ctx.fill();
            
            ctx.strokeStyle = '#aaddff';
            ctx.lineWidth = 3;
            ctx.setLineDash([10, 5]);
            ctx.stroke();
            ctx.setLineDash([]);
            
            // Rotating shine
            ctx.rotate(Date.now() * 0.005);
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(0, 0, shieldSize + 5, 0, Math.PI * 1.5);
            ctx.stroke();
            ctx.restore();
        }

        // Calculate movement animation for mech tanks
        const moveAnim = GameTerrain.getMotion(tank);
        const _playerBurovoyDrill = getBurovoyDrillRenderState(tank);
        drawTankOn(ctx, 0, 0, tank.w, tank.h, tank.color, tank.turretAngle, 1, tankType, { heat: tank.heat, overheated: tank.overheated, spartanRage: tank.hp < tank.maxHp * 0.5, illuminatUltStrength: GameTerrain.illuminatSuperStrength(tank), burovoyDrillAnim: _playerBurovoyDrill.burovoyDrillAnim, burovoyBurrowActive: _playerBurovoyDrill.burovoyBurrowActive, burovoyBurrowPhase: _playerBurovoyDrill.burovoyBurrowPhase, burovoyDrillActive: _playerBurovoyDrill.burovoyDrillActive, burovoyDrillHit: _playerBurovoyDrill.burovoyDrillHit, myasnoyEyeForm: tankType === 'myasnoy' && typeof tank !== 'undefined' && !!tank.myasnoyUltActive, myasnoyAttackTimer: (tankType === 'myasnoy' && tank.myasnoyUltActive ? (tank.myasnoyAttackTimer || 0) : 0), myasnoyAttackAngle: tank.myasnoyAttackAngle, myasnoyHypnoBeamTimer: (tankType === 'myasnoy' && tank.myasnoyUltActive ? (tank.myasnoyHypnoBeamTimer || 0) : 0), myasnoySeparationPulse: (tankType === 'myasnoy' && tank.myasnoyUltActive && (tank.myasnoySeparationAnim || 0) > 0)
            ? ((tank.myasnoySeparationAnim || 0) / Math.max(1, tank.myasnoySeparationAnimMax || 18))
            : 0 }, moveAnim);
        drawTankDamage(ctx, tank);
        drawEmbeddedProjectiles(ctx, tank);
        drawSandCurseOverlay(ctx, Math.max(tank.w, tank.h) * 0.85, tank.sandCurseTimer || 0);

        // Draw Квант overload indicator on player tank (when debuffed by enemy bot)
        if (tank._kvantOverload && tank._kvantOverloadTimer > 0) {
            const _ovProg = tank._kvantOverloadTimer / 300;
            const _ovPulse = 0.55 + 0.45 * Math.sin(Date.now() * 0.012);
            const _ovR = Math.max(tank.w, tank.h) * 0.72;
            ctx.save();
            ctx.strokeStyle = `rgba(0,229,255,${(_ovPulse * 0.85).toFixed(2)})`;
            ctx.lineWidth = 2;
            ctx.setLineDash([5, 4]);
            ctx.beginPath();
            ctx.arc(0, 0, _ovR, 0, Math.PI * 2);
            ctx.stroke();
            ctx.setLineDash([]);
            ctx.strokeStyle = 'rgba(0,229,255,0.95)';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(0, 0, _ovR + 5, -Math.PI / 2, -Math.PI / 2 + _ovProg * Math.PI * 2);
            ctx.stroke();
            ctx.fillStyle = `rgba(0,229,255,${_ovPulse.toFixed(2)})`;
            ctx.font = 'bold 11px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'bottom';
            ctx.fillText('⚡', 0, -tank.h / 2 - 13);
            ctx.restore();
        }

        // Hit flash overlay - radial impact burst, red-tinted for player
        const _tFlashAge = Date.now() - (tank.hitFlashTime || 0);
        if (_tFlashAge < 120) {
            const _fa = 1 - _tFlashAge / 120;
            const _tr = Math.max(tank.w, tank.h) * 0.75;
            const _tg = ctx.createRadialGradient(0, 0, 0, 0, 0, _tr);
            _tg.addColorStop(0,    `rgba(255,220,180,${(_fa * 0.95).toFixed(2)})`);
            _tg.addColorStop(0.3,  `rgba(255,80,0,${(_fa * 0.8).toFixed(2)})`);
            _tg.addColorStop(0.65, `rgba(200,0,0,${(_fa * 0.45).toFixed(2)})`);
            _tg.addColorStop(1,    'rgba(150,0,0,0)');
            ctx.beginPath();
            ctx.arc(0, 0, _tr, 0, Math.PI * 2);
            ctx.fillStyle = _tg;
            ctx.fill();
        }

        // Rainbow aura when imitator transformation is active
        if (tank.imitatorActive) {
            const auraR = Math.max(tank.w, tank.h) * 0.72;
            ctx.save();
            const hue = (Date.now() * 0.36) % 360;
            for (let i = 0; i < 3; i++) {
                ctx.strokeStyle = `hsla(${(hue + i * 120) % 360}, 100%, 65%, ${0.55 - i * 0.15})`;
                ctx.lineWidth = 3 - i;
                ctx.beginPath();
                ctx.arc(0, 0, auraR + i * 4, 0, Math.PI * 2);
                ctx.stroke();
            }
            ctx.restore();
        }

        ctx.restore();
        if (_playerBurovoyDrill.burovoyBurrowActive) drawBurovoyBurrowCracks(ctx, tank);
        if ((tank.paralyzed || tank.mechPowerStunTime > 0) && (tankType === 'mechDiy' || tankType === 'mechShield' || tankType === 'mechRocket')) drawParalysisOverlay(ctx, tank.x, tank.y, tank.w, tank.h);
        if ((tankType === 'mechShield') && typeof drawShieldActiveOverlay === 'function') {
            const _fadeR = tank.mechShieldActive ? 1 : Math.max(0, (tank.mechShieldFadeTimer || 0) / 30);
            const _dmgP = tank.mechShieldDamagePercent || 0;
            if (_fadeR > 0) drawShieldActiveOverlay(ctx, tank.x, tank.y, tank.w, tank.h, _fadeR, _dmgP);
        }
        if (tank.paralyzed && tank.frozenEffect > 0) drawFrozenOverlay(ctx, tank.x, tank.y, tank.w, tank.h, tank.frozenEffect);
        else if (tank.iceSlowed && tank.iceSlowedTime > 0) drawIceSlowOverlay(ctx, tank.x, tank.y, tank.w, tank.h, tank.iceSlowedTime, tank);
        ctx.fillStyle = 'green';
        ctx.fillRect(tank.x, tank.y - 10, tank.w, 5);
        ctx.fillStyle = 'black';
        const maxTankHp = tank.maxHp || (typeof tankMaxHpByType !== 'undefined' && tankMaxHpByType[tankType]) || 300;
        const missingHp = maxTankHp - tank.hp;
        if (missingHp > 0) {
            ctx.fillRect(tank.x + tank.w * (tank.hp / maxTankHp), tank.y - 10, tank.w * (missingHp / maxTankHp), 5);
        }
        ctx.fillStyle = 'white';
        ctx.font = 'bold 7px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(Math.ceil(tank.hp) + '/' + maxTankHp, tank.x + tank.w / 2, tank.y - 7);
        drawReloadBar(ctx, tank, tankType, '#cba46e');
        // mech energy bars — rendered by mechs.js
        if ((tankType === 'mechDiy' || tankType === 'mechShield' || tankType === 'mechRocket') && typeof drawMechEnergyBar === 'function') {
            drawMechEnergyBar(ctx, tank);
        }
    }

    if ((tank.sandBlindTimer || 0) > 0) {
        drawSandBlindScreenOverlay(ctx, canvas.width, canvas.height, tank.sandBlindTimer || 0);
    }
    
    // Illuminat beam handled by drawUnitBeam above for all units including player

    // Draw combat drones (robot tank ultimate)
    if (typeof playerDrones !== 'undefined' && playerDrones.length > 0) {
        for (const d of playerDrones) {
            if (!d.alive || !GameTerrain.canSee(tank, d, objects)) continue;
            if (d.romanSummon) { drawRomanSummon(ctx, d); continue; }
            const cx = d.x + d.w / 2;
            const cy = d.y + d.h / 2;
            const dr = d.w / 2;
            const angle = d.turretAngle || 0;

            ctx.save();
            ctx.translate(cx, cy);
            ctx.rotate(angle);

            // Wing panels — two side fins aligned with movement
            ctx.fillStyle = '#37474f';
            ctx.fillRect(-dr * 0.2, -dr * 1.1, dr * 0.4, dr * 0.55);
            ctx.fillRect(-dr * 0.2,  dr * 0.55, dr * 0.4, dr * 0.55);
            ctx.strokeStyle = '#00e5ff'; ctx.lineWidth = 0.8;
            ctx.strokeRect(-dr * 0.2, -dr * 1.1, dr * 0.4, dr * 0.55);
            ctx.strokeRect(-dr * 0.2,  dr * 0.55, dr * 0.4, dr * 0.55);

            // Hexagonal body
            ctx.fillStyle = '#263238';
            ctx.shadowColor = '#00e5ff';
            ctx.shadowBlur = 7;
            ctx.beginPath();
            for (let i = 0; i < 6; i++) {
                const a = (i / 6) * Math.PI * 2 - Math.PI / 6;
                const px = Math.cos(a) * dr, py = Math.sin(a) * dr;
                if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
            }
            ctx.closePath(); ctx.fill();
            ctx.strokeStyle = '#00e5ff'; ctx.lineWidth = 1.5; ctx.stroke();
            ctx.shadowBlur = 0;

            // Inner ring detail
            ctx.strokeStyle = 'rgba(0,229,255,0.35)';
            ctx.lineWidth = 1;
            ctx.beginPath(); ctx.arc(0, 0, dr * 0.55, 0, Math.PI * 2); ctx.stroke();

            // Mini cannon barrel pointing forward (along +X before rotation)
            const barLen = dr * 1.1;
            const barH  = dr * 0.22;
            const barGrad = ctx.createLinearGradient(0, 0, barLen, 0);
            barGrad.addColorStop(0, '#455a64');
            barGrad.addColorStop(1, '#b0bec5');
            ctx.fillStyle = barGrad;
            ctx.fillRect(dr * 0.42, -barH / 2, barLen, barH);
            // Cyan muzzle tip
            ctx.fillStyle = '#00e5ff';
            ctx.shadowColor = '#00e5ff';
            ctx.shadowBlur = 5;
            ctx.fillRect(dr * 0.42 + barLen - 2, -barH / 2 - 1, 3, barH + 2);
            ctx.shadowBlur = 0;

            // Red sensor eye
            ctx.fillStyle = '#ff1744';
            ctx.shadowColor = '#ff1744';
            ctx.shadowBlur = 5;
            ctx.beginPath(); ctx.arc(0, 0, dr * 0.2, 0, Math.PI * 2); ctx.fill();
            ctx.shadowBlur = 0;

            ctx.restore();

            // HP bar (unrotated, above drone)
            ctx.fillStyle = '#1a1a1a';
            ctx.fillRect(d.x, d.y - 9, d.w, 4);
            ctx.fillStyle = '#00e5ff';
            ctx.fillRect(d.x, d.y - 9, d.w * (d.hp / d.maxHp), 4);
            // Life timer bar
            const lifeRatio = d.life / d.maxLife;
            ctx.fillStyle = 'rgba(255,255,100,0.35)';
            ctx.fillRect(d.x, d.y - 14, d.w * lifeRatio, 3);
        }
    }

    // Draw enemy combat drones (enemy robot tank ultimate)
    if (typeof enemyDrones !== 'undefined' && enemyDrones.length > 0) {
        for (const d of enemyDrones) {
            if (!d.alive || !GameTerrain.canSee(tank, d, objects)) continue;
            if (d.romanSummon) { drawRomanSummon(ctx, d); continue; }
            const cx = d.x + d.w / 2;
            const cy = d.y + d.h / 2;
            const dr = d.w / 2;
            const angle = d.turretAngle || 0;

            // Determine color based on team
            const teamColors = ['#00e5ff', '#ff6b6b', '#ffd700', '#2ecc71'];
            const droneColor = teamColors[d.team % 4] || '#ff6b6b';

            ctx.save();
            ctx.translate(cx, cy);
            ctx.rotate(angle);

            // Wing panels — two side fins aligned with movement
            ctx.fillStyle = '#37474f';
            ctx.fillRect(-dr * 0.2, -dr * 1.1, dr * 0.4, dr * 0.55);
            ctx.fillRect(-dr * 0.2,  dr * 0.55, dr * 0.4, dr * 0.55);
            ctx.strokeStyle = droneColor; ctx.lineWidth = 0.8;
            ctx.strokeRect(-dr * 0.2, -dr * 1.1, dr * 0.4, dr * 0.55);
            ctx.strokeRect(-dr * 0.2,  dr * 0.55, dr * 0.4, dr * 0.55);

            // Hexagonal body
            ctx.fillStyle = '#263238';
            ctx.shadowColor = droneColor;
            ctx.shadowBlur = 7;
            ctx.beginPath();
            for (let i = 0; i < 6; i++) {
                const a = (i / 6) * Math.PI * 2 - Math.PI / 6;
                const px = Math.cos(a) * dr, py = Math.sin(a) * dr;
                if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
            }
            ctx.closePath(); ctx.fill();
            ctx.strokeStyle = droneColor; ctx.lineWidth = 1.5; ctx.stroke();
            ctx.shadowBlur = 0;

            // Inner ring detail
            ctx.strokeStyle = 'rgba(' + (droneColor === '#00e5ff' ? '0,229,255' : droneColor === '#ff6b6b' ? '255,107,107' : droneColor === '#ffd700' ? '255,215,0' : '46,204,113') + ',0.35)';
            ctx.lineWidth = 1;
            ctx.beginPath(); ctx.arc(0, 0, dr * 0.55, 0, Math.PI * 2); ctx.stroke();

            // Mini cannon barrel pointing forward (along +X before rotation)
            const barLen = dr * 1.1;
            const barH  = dr * 0.22;
            const barGrad = ctx.createLinearGradient(0, 0, barLen, 0);
            barGrad.addColorStop(0, '#455a64');
            barGrad.addColorStop(1, '#b0bec5');
            ctx.fillStyle = barGrad;
            ctx.fillRect(dr * 0.42, -barH / 2, barLen, barH);
            // Colored muzzle tip matching team
            ctx.fillStyle = droneColor;
            ctx.shadowColor = droneColor;
            ctx.shadowBlur = 5;
            ctx.fillRect(dr * 0.42 + barLen - 2, -barH / 2 - 1, 3, barH + 2);
            ctx.shadowBlur = 0;

            // Sensor eye
            ctx.fillStyle = droneColor;
            ctx.shadowColor = droneColor;
            ctx.shadowBlur = 5;
            ctx.beginPath(); ctx.arc(0, 0, dr * 0.2, 0, Math.PI * 2); ctx.fill();
            ctx.shadowBlur = 0;

            ctx.restore();

            // HP bar (unrotated, above drone)
            ctx.fillStyle = '#1a1a1a';
            ctx.fillRect(d.x, d.y - 9, d.w, 4);
            ctx.fillStyle = droneColor;
            ctx.fillRect(d.x, d.y - 9, d.w * (d.hp / d.maxHp), 4);
            // Life timer bar
            const lifeRatio = d.life / d.maxLife;
            ctx.fillStyle = 'rgba(255,255,100,0.35)';
            ctx.fillRect(d.x, d.y - 14, d.w * lifeRatio, 3);
        }
    }

    // DUEL MODE: Draw Shrinking Zone (Grid Based)
    if (typeof currentMode !== 'undefined' && currentMode === 'duel' && typeof duelState !== 'undefined' && duelState) {
        ctx.save();
        
        // Define Safe Zone Rect
        const safeX = duelState.minX;
        const safeY = duelState.minY;
        const safeW = duelState.maxX - duelState.minX;
        const safeH = duelState.maxY - duelState.minY;
        
        // Border of Safe Zone
        ctx.strokeStyle = '#FF0000';
        ctx.lineWidth = 3;
        ctx.setLineDash([10, 5]);
        ctx.lineDashOffset = -Date.now() / 20;
        ctx.strokeRect(safeX, safeY, safeW, safeH);
        
        ctx.fillStyle = 'rgba(255, 0, 0, 0.2)';
        
        // 4 Danger Rects around the safe zone (full coverage)
        // Top Strip
        ctx.fillRect(0, 0, worldWidth, safeY);
        // Bottom Strip
        ctx.fillRect(0, safeY + safeH, worldWidth, worldHeight - (safeY + safeH));
        // Left Strip (between Ys)
        ctx.fillRect(0, safeY, safeX, safeH);
        // Right Strip (between Ys)
        ctx.fillRect(safeX + safeW, safeY, worldWidth - (safeX + safeW), safeH);

        ctx.restore();
    }
    
    // Draw boss fire trail (Phase 3 only)
    if (currentMode === 'bossfight') {
        const boss = (typeof enemies !== 'undefined' && enemies.find(e => e && e.isBoss)) || null;
        if (boss && boss.fireTrail && boss.fireTrail.length > 0) {
            for (const trail of boss.fireTrail) {
                const alpha = trail.life / 300; // 1 → 0 as trail fades
                const flicker = Math.max(0.3, 0.3 + 0.7 * Math.sin(Date.now() * 0.015 + trail.x * 0.01));
                
                ctx.save();
                ctx.globalAlpha = alpha * 0.7;
                
                // Core bright yellow flame
                const cg = ctx.createRadialGradient(trail.x, trail.y, 2, trail.x, trail.y, 28);
                cg.addColorStop(0, `rgba(255,255,${Math.floor(150 * flicker)},0.95)`);
                cg.addColorStop(0.4, `rgba(255,200,0,${0.8 * flicker})`);
                cg.addColorStop(0.8, `rgba(255,100,0,${0.4 * flicker})`);
                cg.addColorStop(1, 'rgba(200,50,0,0)');
                ctx.fillStyle = cg;
                ctx.beginPath();
                ctx.arc(trail.x, trail.y, Math.max(2, 28 * flicker), 0, Math.PI * 2);
                ctx.fill();
                
                // Middle orange layer
                const mg = ctx.createRadialGradient(trail.x - 3, trail.y - 3, 0, trail.x, trail.y, 35);
                mg.addColorStop(0, `rgba(255,150,0,${0.6 * alpha})`);
                mg.addColorStop(0.6, `rgba(220,80,0,${0.3 * alpha})`);
                mg.addColorStop(1, 'rgba(150,30,0,0)');
                ctx.fillStyle = mg;
                ctx.beginPath();
                ctx.arc(trail.x, trail.y, Math.max(2, 35 * alpha), 0, Math.PI * 2);
                ctx.fill();
                
                // Outer red glow with jagged edges
                const og = ctx.createRadialGradient(trail.x, trail.y, 10, trail.x, trail.y, 50);
                og.addColorStop(0, `rgba(200,50,0,${0.5 * alpha})`);
                og.addColorStop(0.5, `rgba(150,20,0,${0.2 * alpha})`);
                og.addColorStop(1, 'rgba(100,0,0,0)');
                ctx.fillStyle = og;
                
                // Draw jagged flame-like outer edge
                ctx.beginPath();
                const edgePoints = 12;
                for (let i = 0; i < edgePoints; i++) {
                    const angle = (i / edgePoints) * Math.PI * 2;
                    const baseRadius = 45;
                    const spike = (Math.sin(angle * 3) + Math.sin(angle * 2.3)) * 15;
                    const r = baseRadius + spike;
                    const x = trail.x + Math.cos(angle) * r;
                    const y = trail.y + Math.sin(angle) * r;
                    if (i === 0) ctx.moveTo(x, y);
                    else ctx.lineTo(x, y);
                }
                ctx.closePath();
                ctx.fill();
                
                // Spark particles
                if (window.effectsEnabled !== false && alpha > 0.3) {
                    for (let s = 0; s < 3; s++) {
                        const sparkAngle = Math.random() * Math.PI * 2;
                        const sparkDist = Math.random() * 30 + 20;
                        const sx = trail.x + Math.cos(sparkAngle) * sparkDist;
                        const sy = trail.y + Math.sin(sparkAngle) * sparkDist;
                        const sparkAlpha = (Math.random() * 0.5 + 0.3) * alpha;
                        ctx.fillStyle = `rgba(255,${Math.floor(150 * Math.random())},0,${sparkAlpha})`;
                        ctx.beginPath();
                        ctx.arc(sx, sy, Math.max(0.5, Math.random() * 2 + 1), 0, Math.PI * 2);
                        ctx.fill();
                    }
                }
                
                ctx.restore();
            }
        }
    }
    
    // Draw boss meteors (warning circles, fire zones, and falling rock animation)
    if (currentMode === 'bossfight' && typeof bossMeteors !== 'undefined') {
        for (const m of bossMeteors) {
            if (!m.landed) {
                const progress = 1 - m.warningTimer / 90; // 0→1 as it falls
                const pulse = 0.5 + 0.5 * Math.sin(Date.now() * 0.015);

                // Ground warning circle (stays at target position)
                ctx.save();
                ctx.globalAlpha = (0.2 + 0.2 * progress) * (0.6 + 0.4 * pulse);
                ctx.strokeStyle = '#FF0000';
                ctx.lineWidth = 3;
                ctx.setLineDash([8, 6]);
                ctx.beginPath(); ctx.arc(m.x, m.y, 80, 0, Math.PI * 2); ctx.stroke();
                ctx.setLineDash([]);
                ctx.globalAlpha = (0.12 + 0.15 * progress) * (0.6 + 0.4 * pulse);
                ctx.fillStyle = '#FF4500';
                ctx.beginPath(); ctx.arc(m.x, m.y, 80, 0, Math.PI * 2); ctx.fill();
                ctx.restore();

                // Falling rock: starts 200px above, descends to target
                const rockY = m.y - 200 * (1 - progress);
                const rockScale = 0.35 + 0.65 * progress;
                const rockR = 18 * rockScale;

                // Fire trail behind the rock (above it = negative Y)
                for (let ti = 1; ti <= 7; ti++) {
                    const trailProg = progress - ti * 0.04;
                    if (trailProg < 0) continue;
                    const trailY = m.y - 200 * (1 - trailProg) - 4 * ti;
                    const trailR = rockR * (1 - ti / 9);
                    const trailAlpha = (1 - ti / 8) * 0.65;
                    ctx.save();
                    ctx.globalAlpha = trailAlpha;
                    const tg = ctx.createRadialGradient(m.x, trailY, 0, m.x, trailY, trailR * 1.5);
                    tg.addColorStop(0, '#FFFF80');
                    tg.addColorStop(0.35, '#FF6600');
                    tg.addColorStop(0.7, '#CC2200');
                    tg.addColorStop(1, 'rgba(80,0,0,0)');
                    ctx.fillStyle = tg;
                    ctx.beginPath(); ctx.arc(m.x, trailY, trailR * 1.5, 0, Math.PI * 2); ctx.fill();
                    ctx.restore();
                }

                // Rock body: dark gray with glowing orange-red cracks
                ctx.save();
                ctx.translate(m.x, rockY);
                ctx.rotate(progress * Math.PI * 3); // spin as it falls
                // Outer glow
                const glow = ctx.createRadialGradient(0, 0, rockR * 0.2, 0, 0, rockR * 2.2);
                glow.addColorStop(0, 'rgba(255,140,0,0.55)');
                glow.addColorStop(0.5, 'rgba(200,40,0,0.3)');
                glow.addColorStop(1, 'rgba(80,0,0,0)');
                ctx.fillStyle = glow;
                ctx.beginPath(); ctx.arc(0, 0, rockR * 2.2, 0, Math.PI * 2); ctx.fill();
                // Rock silhouette (rough jagged polygon)
                ctx.fillStyle = '#1a0000';
                ctx.beginPath();
                const sides = 8;
                for (let k = 0; k < sides; k++) {
                    const ang = (k / sides) * Math.PI * 2;
                    const jitter = rockR * (0.8 + 0.22 * Math.sin(k * 2.3 + progress * 5));
                    if (k === 0) ctx.moveTo(Math.cos(ang) * jitter, Math.sin(ang) * jitter);
                    else ctx.lineTo(Math.cos(ang) * jitter, Math.sin(ang) * jitter);
                }
                ctx.closePath(); ctx.fill();
                // Crack lines with lava glow
                ctx.strokeStyle = `rgba(255,${Math.floor(120 + 80 * pulse)},0,0.85)`;
                ctx.lineWidth = 1.5;
                ctx.beginPath(); ctx.moveTo(-rockR * 0.3, -rockR * 0.6); ctx.lineTo(0, 0); ctx.lineTo(rockR * 0.5, rockR * 0.4); ctx.stroke();
                ctx.beginPath(); ctx.moveTo(rockR * 0.2, -rockR * 0.5); ctx.lineTo(-rockR * 0.1, rockR * 0.3); ctx.stroke();
                ctx.restore();

            } else if (m.fireTimer > 0) {
                // Fire zone: orange-red radial gradient, fades as fireTimer decreases
                const alpha = Math.min(0.65, m.fireTimer / 300);
                const flicker = 0.5 + 0.5 * Math.sin(Date.now() * 0.02 + m.x);
                ctx.save();
                ctx.globalAlpha = alpha * (0.8 + 0.2 * flicker);
                const grad = ctx.createRadialGradient(m.x, m.y, 0, m.x, m.y, 55);
                grad.addColorStop(0, '#FFFF00');
                grad.addColorStop(0.2, '#FF8800');
                grad.addColorStop(0.6, '#FF2200');
                grad.addColorStop(1, 'rgba(140,0,0,0)');
                ctx.fillStyle = grad;
                ctx.beginPath(); ctx.arc(m.x, m.y, 55, 0, Math.PI * 2); ctx.fill();
                // Flickering inner flame tongues
                for (let fl = 0; fl < 5; fl++) {
                    const fa = (Date.now() * 0.003 + fl * 1.26) % (Math.PI * 2);
                    const fr = Math.max(0, 10 + 12 * Math.sin(Date.now() * 0.008 + fl * 1.4));
                    const fx = m.x + Math.cos(fa) * fr * 0.5;
                    const fy = m.y + Math.sin(fa) * fr * 0.5;
                    if (fr <= 0) continue;
                    ctx.globalAlpha = alpha * 0.6;
                    ctx.fillStyle = '#FF6600';
                    ctx.beginPath(); ctx.arc(fx, fy, fr * 0.5, 0, Math.PI * 2); ctx.fill();
                }
                ctx.restore();
            }
        }
    }

    for (const smoke of objects) {
        if (smoke.type !== 'tankDamageSmoke' || !isVisible(smoke.x - smoke.radius, smoke.y - smoke.radius, smoke.radius * 2, smoke.radius * 2)) continue;
        if (smoke.source && !GameTerrain.canSee(tank, smoke.source, objects)) continue;
        drawTankDamageSmoke(ctx, smoke);
    }

    if (cameraTranslated) ctx.restore();
    if (gameState === 'playing') {
        GameTerrain.drawAtmosphere(ctx, canvas, tank, camX, camY, objects, window.frameCount || 0);
    }

    // Boss HP bar (screen coordinates, drawn after camera restore)
    if (currentMode === 'bossfight' && typeof enemies !== 'undefined') {
        const boss = enemies.find(e => e.isBoss && e.alive !== false);
        if (boss && boss.hp > 0) {
            const bw = 500, bh = 18, bx = (canvas.width - bw) / 2, by = 14;
            const hpRatio = Math.max(0, boss.hp / boss.maxHp);
            // Background
            ctx.fillStyle = 'rgba(0,0,0,0.6)';
            ctx.fillRect(bx - 4, by - 4, bw + 8, bh + 8);
            // Empty bar
            ctx.fillStyle = '#330000';
            ctx.fillRect(bx, by, bw, bh);
            // HP fill
            ctx.fillStyle = boss.phase >= 2 ? '#FF4500' : '#CC0000';
            ctx.fillRect(bx, by, bw * hpRatio, bh);
            // Gold border
            ctx.strokeStyle = boss.phase >= 2 ? '#FF6600' : '#880000';
            ctx.lineWidth = 2;
            ctx.strokeRect(bx, by, bw, bh);
            // Label
            ctx.fillStyle = '#FFDDDD';
            ctx.font = 'bold 11px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(
                '👹 АДСКИЙ ТАНК  ' + Math.ceil(boss.hp) + ' / ' + boss.maxHp + (boss.phase >= 2 ? '  ⚡ ЯРОСТЬ!' : ''),
                canvas.width / 2, by + bh - 3
            );
        }
    }

    let battleCounterText = '';
    if (gameState === 'playing') {
        if (currentMode === 'single') {
            const remainingTanks = (typeof enemies !== 'undefined' ? enemies : []).filter(e => e && e.alive !== false && (e.hp == null || e.hp > 0)).length;
            battleCounterText = 'Врагов: ' + remainingTanks;
        } else if (currentMode === 'onevsall') {
            const remainingEnemies = (typeof enemies !== 'undefined' ? enemies : []).filter(e => e && e.alive !== false && (e.hp == null || e.hp > 0)).length;
            battleCounterText = 'Врагов: ' + remainingEnemies;
        } else if (currentMode === 'team') {
            const aliveTeams = new Set();
            if (typeof tank !== 'undefined' && tank && tank.alive !== false && (tank.hp == null || tank.hp > 0)) {
                aliveTeams.add(tank.team ?? 0);
            }
            if (typeof allies !== 'undefined') {
                for (const ally of allies) {
                    if (ally && ally.alive !== false && (ally.hp == null || ally.hp > 0)) aliveTeams.add(ally.team ?? 0);
                }
            }
            if (typeof enemies !== 'undefined') {
                for (const enemy of enemies) {
                    if (enemy && enemy.alive !== false && (enemy.hp == null || enemy.hp > 0)) aliveTeams.add(enemy.team);
                }
            }
            battleCounterText = 'Команд: ' + aliveTeams.size;
        }
    }

    if (battleCounterText) {
        ctx.save();
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        ctx.font = (window.deviceModeMobile ? 'bold 18px Arial' : 'bold 20px Arial');
        ctx.lineWidth = 4;
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.75)';
        ctx.fillStyle = '#f5f7fa';
        ctx.strokeText(battleCounterText, 14, 14);
        ctx.fillText(battleCounterText, 14, 14);
        ctx.restore();
    }

    if (gameState === 'playing') {
        ctx.save();
        ctx.textAlign = 'left'; ctx.textBaseline = 'top';
        ctx.font = '13px Arial'; ctx.lineWidth = 3;
        ctx.strokeStyle = 'rgba(0,0,0,0.75)'; ctx.fillStyle = '#cbd0c4';
        const terrainLabelY = battleCounterText ? 42 : 14;
        ctx.strokeText(GameTerrain.label(), 14, terrainLabelY);
        ctx.fillText(GameTerrain.label(), 14, terrainLabelY);
        ctx.restore();
    }

    if (tank.alive === false && currentMode === 'war' && tank.respawnTimer > 0 && gameState !== 'lose') {
        ctx.fillStyle = 'white'; ctx.font = '18px Arial'; ctx.textAlign = 'center';
        ctx.fillText('Возрождение через ' + Math.ceil(tank.respawnTimer / 60) + ' с', canvas.width/2, 40);
    }

    if (gameState === 'menu') {
        ctx.fillStyle = 'rgba(0,0,0,0.6)';
        ctx.fillRect(0,0,canvas.width, canvas.height);
    } else if (gameState === 'win' || gameState === 'lose') {
        ctx.fillStyle = 'rgba(0,0,0,0.45)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    if (typeof syncResultOverlay === 'function' &&
        (typeof lastResultState === 'undefined' || lastResultState !== gameState)) {
        syncResultOverlay();
    }

    drawImmersionEffects(ctx, canvas.width, canvas.height, tank);

    if (isMenuBackdrop) {
        menuBackdropWidth = canvas.width;
        menuBackdropHeight = canvas.height;
        menuBackdropObjects = objects;
        menuBackdropObjectCount = objects.length;
    }
    drawPreview();
    updateCoinDisplay();
}

let drawLoopStarted = false;
function draw() {
    if (drawLoopStarted) return;
    drawLoopStarted = true;
    renderGameFrame();
}

// Ensure global access
window.draw = draw;
window.renderActiveGameFrame = () => { if (drawLoopStarted) renderGameFrame(); };

// ─── Upgrade costs per level (1→2→3) ─────────────────────────────────────────
const UPGRADE_COSTS = [150, 350, 500]; // cost to reach level 1, 2, 3 (in parts)
const UPGRADE_MAX  = 3;

// Render the upgrade panel inside #tankDetailUpgrades for a given tankType
function renderTankUpgradesUI(tt) {
    const el = document.getElementById('tankDetailUpgrades');
    if (!el) return;

    // Check if player owns this tank
    const isOwned = (typeof unlockedTanks !== 'undefined') && unlockedTanks.includes(tt);

    const getLvl  = (stat) => (typeof getTankUpgrade === 'function') ? getTankUpgrade(tt, stat) : 0;
    const canAfford = (cost) => isOwned && (typeof parts !== 'undefined') && parts >= cost;

    const dmgBonusTxts = ['', '+10%', '+30%', '+60%'];
    const statDefs = [
        { stat: 'hp',  icon: '', label: 'HP',  bonusFn: (lvl) => `+${lvl*50} HP` },
        { stat: 'dmg', icon: '', label: 'Урон', bonusFn: (lvl) => dmgBonusTxts[lvl] || '' },
        { stat: 'spd', icon: '', label: 'Скорость', bonusFn: (lvl) => {
            const incs = [0.2,0.2,0.3];
            let s = 0;
            for (let i = 0; i < lvl; i++) s += (incs[i] || 0);
            return `+${s.toFixed(1)}`;
        } },
    ];
    // mechDiy and mechShield get an additional max energy upgrade
    if (tt === 'mechDiy' || tt === 'mechShield') {
        statDefs.push({ stat: 'energy', icon: '', label: 'Энергия', bonusFn: (lvl) => lvl > 0 ? `+${lvl*20} макс.` : '' });
    }

    let html = `<div style="font-size:11px; font-weight:bold; color:#f1c40f; margin-bottom:5px;">🔧 Улучшения</div>`;
    if (!isOwned) {
        el.innerHTML = html + `<div style="font-size:11px; color:#888; padding:4px 0;">🔒 Разблокируй танк, чтобы улучшать характеристики</div>`;
        return;
    }
    html += `<div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:5px;">`;

    for (const def of statDefs) {
        const lvl  = getLvl(def.stat);
        const dots = '●'.repeat(lvl) + '○'.repeat(UPGRADE_MAX - lvl);
        const bonusTxt = def.bonusFn(lvl);
        const nextCost = lvl < UPGRADE_MAX ? UPGRADE_COSTS[lvl] : null;
        const affordable = nextCost !== null && canAfford(nextCost);
        const btnHtml = nextCost !== null
            ? `<button class="upgrade-btn" data-type="${tt}" data-stat="${def.stat}" data-cost="${nextCost}"
                  style="display:inline-block; min-width:48px; margin-top:4px; padding:2px 4px; font-size:10px; border:1px solid ${affordable ? '#3498db' : '#555'}; border-radius:4px; background:${affordable ? 'rgba(52,152,219,0.25)' : 'rgba(80,80,80,0.2)'}; color:${affordable ? '#fff' : '#777'}; cursor:${affordable ? 'pointer' : 'not-allowed'};"
                  ${affordable ? '' : 'disabled'}>Ур.${lvl+1} · ${nextCost}🔧</button>`
            : `<div style="text-align:center; font-size:10px; color:#f1c40f; margin-top:3px;">MAX ✓</div>`;
        html += `<div style="background:rgba(0,0,0,0.3); border-radius:6px; padding:5px 6px; text-align:center;">
            <div style="font-size:13px;">${def.icon} <span style="font-size:11px; color:#ccc;">${def.label}</span></div>
            <div style="letter-spacing:1px; font-size:12px; margin:2px 0;">${dots}</div>
            <div style="font-size:10px; color:#aaa; height:13px;">${bonusTxt}</div>
            ${btnHtml}
        </div>`;
    }

    html += `</div>`;
    el.innerHTML = html;

    // Attach buy-button listeners
    el.querySelectorAll('.upgrade-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const type = btn.dataset.type;
            const stat = btn.dataset.stat;
            const cost = parseInt(btn.dataset.cost);
            if (typeof parts === 'undefined' || parts < cost) return;
            if (window._isProfileSwitching) return;
            // Deduct parts
            parts -= cost;
            localStorage.setItem('tankParts', parts);
            // Store upgrade
            if (!tankUpgrades[type]) tankUpgrades[type] = {};
            tankUpgrades[type][stat] = (tankUpgrades[type][stat] || 0) + 1;
            saveTankUpgrades();
            if (typeof updateCoinDisplay === 'function') updateCoinDisplay();
            // Always re-apply HP and speed immediately (in case player buys mid-session)
            if (typeof setTankHP    === 'function') setTankHP(type);
            if (typeof setTankSpeed === 'function') setTankSpeed(type);
            // If energy upgrade bought for a mech and it's active, reset energy to full
            if (stat === 'energy' && (type === 'mechDiy' || type === 'mechShield') && typeof tank !== 'undefined' && tank.tankType === type) {
                const upLvl = (typeof getTankUpgrade === 'function') ? getTankUpgrade(type, 'energy') : 0;
                if (type === 'mechDiy') {
                    tank.mechMaxEnergy = 110 + upLvl * 20;
                    tank.mechEnergy = tank.mechMaxEnergy;
                } else if (type === 'mechShield') {
                    tank.mechMaxEnergy = 130 + upLvl * 20;
                    tank.mechEnergy = tank.mechMaxEnergy;
                }
            }
            // Refresh both panels
            showTankDetail(type);
        });
    });
}
// ─────────────────────────────────────────────────────────────────────────────
// getRankInfo and TANK_RANKS are defined in src/rank.js

// Function to show tank detail modal
function showTankDetail(tankType) {
    if (typeof window.setCurrentTankDetail === 'function') window.setCurrentTankDetail(tankType);
    const modal = document.getElementById('tankDetailModal');
    const modalBox = modal ? modal.querySelector('.modal-box') : null;
    const title = document.getElementById('tankDetailTitle');
    const rarity = document.getElementById('tankDetailRarity');
    const tabsEl = document.getElementById('tankDetailTabs');
    const canvas = document.getElementById('tankDetailCanvas');
    const description = document.getElementById('tankDetailDescription');
    const statsEl = document.getElementById('tankDetailStats');
    const upgradesEl = document.getElementById('tankDetailUpgrades');
    const rankEl = document.getElementById('tankDetailRank');
    const ctx = canvas.getContext('2d');

    // Reference to the modal primary action button (style updated elsewhere)
    const tankDetailSelectBtn = document.getElementById('tankDetailSelect');
    const tankDetailTryBtn = document.getElementById('tankDetailTry');

    // Resolve unit description — mechs use their own data, tanks use tankDescriptions
    const unitDesc = (window.isMech && window.isMech(tankType))
        ? (window.mechDescriptions && window.mechDescriptions[tankType])
        : tankDescriptions[tankType];
    const isMyasnoyDetail = tankType === 'myasnoy';
    const myasnoyTabKey = isMyasnoyDetail && (window._myasnoyDetailTab === 'body' || window._myasnoyDetailTab === 'eye')
        ? window._myasnoyDetailTab
        : 'base';
    const myasnoyForms = isMyasnoyDetail ? {
        base: {
            label: 'Начальная',
            description: unitDesc.description,
            hpMultiplier: 1,
            speedBase: ((typeof tankMaxSpeedByType !== 'undefined' && tankMaxSpeedByType.myasnoy) || 3.0),
            damageBase: 2,
            damageNote: '/сосуд',
            fractionalDamage: true,
            sideScale: 0.86,
            heatState: null
        },
        body: {
            label: 'Форма бота',
            description: 'Отделённый корпус сам обстреливает врагов веером живых сосудов. Он держит линию и отвлекает противника, пока глаз ищет удобный угол для атаки. Не оставляй корпус без поддержки под плотным огнём.',
            hpMultiplier: 300 / 320,
            speedBase: 3.2,
            damageBase: 2,
            damageNote: '/сосуд',
            fractionalDamage: true,
            sideScale: 0.86,
            heatState: { isMyasnoyBody: true }
        },
        eye: {
            label: 'Глаз',
            description: 'Глаз проводит лучом по видимой области и может резко наказать врага за неосторожное сближение. Он подвижнее корпуса, а его ульта гипнотизирует противников. Пользуйся скоростью и не задерживайся под ответным огнём.',
            hpMultiplier: 180 / 320,
            speedBase: 3.6,
            damageBase: 100,
            damageNote: '/удар',
            fractionalDamage: false,
            sideScale: 0.80,
            heatState: { myasnoyEyeForm: true, myasnoyAttackTimer: 12, myasnoySeparationPulse: 0.14 }
        }
    } : null;
    const myasnoyForm = myasnoyForms ? (myasnoyForms[myasnoyTabKey] || myasnoyForms.base) : null;
    const roundMyasnoyDisplayHp = (value) => Math.max(10, Math.round((value || 0) / 10) * 10);
    const useCompactCard = false;
    const infoRow = canvas.parentElement;
    const infoSide = description ? description.parentElement : null;
    const actionsRow = tankDetailTryBtn ? tankDetailTryBtn.parentElement : null;

    canvas.width = useCompactCard ? 240 : 200;
    canvas.height = useCompactCard ? 240 : 200;
    canvas.style.width = useCompactCard ? '240px' : '200px';
    canvas.style.height = useCompactCard ? '240px' : '200px';
    canvas.style.border = useCompactCard ? '2px solid #ff5a1f' : '2px solid #444';
    canvas.style.boxShadow = useCompactCard ? '0 0 22px rgba(255,90,31,0.28)' : 'none';
    canvas.style.background = useCompactCard ? 'radial-gradient(circle at 50% 35%, rgba(90,18,18,0.55), rgba(20,0,0,0.92))' : '';
    if (infoRow) {
        infoRow.style.justifyContent = useCompactCard ? 'center' : 'space-between';
        infoRow.style.alignItems = useCompactCard ? 'center' : 'flex-start';
        infoRow.style.marginBottom = useCompactCard ? '18px' : '14px';
        infoRow.style.gap = useCompactCard ? '0px' : '16px';
    }
    if (infoSide) infoSide.style.display = useCompactCard ? 'none' : 'flex';
    if (description) description.style.display = useCompactCard ? 'none' : 'block';
    if (tabsEl) {
        tabsEl.style.display = useCompactCard || !isMyasnoyDetail ? 'none' : 'flex';
        if (useCompactCard || !isMyasnoyDetail) tabsEl.innerHTML = '';
    }
    if (statsEl) {
        statsEl.style.display = useCompactCard ? 'none' : 'block';
        if (useCompactCard) statsEl.innerHTML = '';
    }
    if (upgradesEl) {
        upgradesEl.style.display = useCompactCard ? 'none' : 'block';
        if (useCompactCard) upgradesEl.innerHTML = '';
    }
    if (rankEl) rankEl.style.display = useCompactCard ? 'none' : 'flex';
    if (modalBox) {
        modalBox.style.maxWidth = useCompactCard ? '430px' : '';
        modalBox.style.width = useCompactCard ? 'min(430px, 92vw)' : '';
        modalBox.style.background = useCompactCard ? 'linear-gradient(180deg, rgba(40,8,8,0.98), rgba(16,0,0,0.98))' : '';
        modalBox.style.border = useCompactCard ? '2px solid #ff5a1f' : '';
        modalBox.style.boxShadow = useCompactCard ? '0 0 32px rgba(255,90,31,0.2)' : '';
    }
    title.style.marginBottom = useCompactCard ? '8px' : '';
    title.style.letterSpacing = useCompactCard ? '0.04em' : '';
    rarity.style.margin = useCompactCard ? '0 0 14px 0' : '';
    if (actionsRow) {
        actionsRow.style.display = useCompactCard ? 'grid' : 'flex';
        actionsRow.style.gridTemplateColumns = useCompactCard ? '1fr 1fr' : '';
        actionsRow.style.gap = useCompactCard ? '10px' : '14px';
        actionsRow.style.alignItems = 'stretch';
    }
    if (tankDetailTryBtn) tankDetailTryBtn.style.width = useCompactCard ? '100%' : '';
    if (tankDetailSelectBtn) tankDetailSelectBtn.style.width = useCompactCard ? '100%' : '';

    // Set title, rarity and description
    title.textContent = unitDesc.name;
    const rarityText = "Редкость: " + unitDesc.rarity;
    let rarityColor = '#f1c40f'; // default yellow
    let glowStyle = '';
    const rarityValue = unitDesc.rarity;
    if (rarityValue === 'Необычная') {
        rarityColor = '#27ae60'; // green
    } else if (rarityValue === 'Эпический') {
        rarityColor = '#9b59b6'; // purple
    } else if (rarityValue === 'Редкая') {
        rarityColor = '#f1c40f'; // yellow
    } else if (rarityValue === 'Легендарный') {
        // Легендарный: teal for all
        rarityColor = '#1abc9c'; // teal
        glowStyle = 'text-shadow: 0 0 15px #1abc9c, 0 0 30px #1abc9c, 0 0 45px #1abc9c;';
    } else if (rarityValue === 'Мифический') {
        rarityColor = '#e91e63'; // pink
        glowStyle = 'text-shadow: 0 0 15px #e91e63, 0 0 30px #e91e63, 0 0 45px #e91e63;';
    } else if (rarityValue === 'Хроматическая') {
        rarityColor = '#00ffcc';
        glowStyle = 'text-shadow: 0 0 10px #00ffcc, 0 0 20px #00ffcc, 0 0 30px #00ffcc;';
    } else if (rarityValue === 'Лимитированная' || rarityValue === 'Лимитированный') {
        rarityColor = '#ff4400';
        glowStyle = 'text-shadow: 0 0 12px #ff4400, 0 0 24px #ff6600, 0 0 36px #ff4400;';
    }
    rarity.innerHTML = `<span style="color:${rarityColor}; ${glowStyle}">${rarityText}</span>`;
    description.textContent = myasnoyForm ? myasnoyForm.description : unitDesc.description;

    if (tabsEl) {
        if (isMyasnoyDetail && !useCompactCard) {
            const _myasnoyTabDefs = [
                ['base', 'Начальная'],
                ['body', 'Форма бота'],
                ['eye', 'Глаз']
            ];
            tabsEl.innerHTML = _myasnoyTabDefs.map(([_key, _label]) => {
                const _active = _key === myasnoyTabKey;
                return `<button type="button" data-myasnoy-tab="${_key}" style="padding:7px 12px; border-radius:999px; border:1px solid ${_active ? '#ff7a44' : 'rgba(255,120,90,0.28)'}; background:${_active ? 'linear-gradient(135deg, rgba(122,0,0,0.92), rgba(196,42,24,0.88))' : 'rgba(50,8,8,0.52)'}; color:${_active ? '#fff4ef' : '#d8b3ad'}; font-size:12px; font-weight:${_active ? '700' : '600'}; letter-spacing:0.02em; cursor:pointer; box-shadow:${_active ? '0 0 12px rgba(255,90,50,0.18)' : 'none'};">${_label}</button>`;
            }).join('');
            tabsEl.querySelectorAll('[data-myasnoy-tab]').forEach(btn => {
                btn.addEventListener('click', () => {
                    const nextTab = btn.getAttribute('data-myasnoy-tab') || 'base';
                    if (nextTab === myasnoyTabKey) return;
                    window._myasnoyDetailTab = nextTab;
                    showTankDetail('myasnoy');
                });
            });
        } else {
            tabsEl.innerHTML = '';
        }
    }

    // Rank badge based on per-tank trophies
    if (rankEl) {
        const tt = (typeof getTankTrophies === 'function') ? getTankTrophies(tankType) : 0;
        const info = getRankInfo(tt, tankType);
        const filled = info.isAtmospheric ? '👑👑👑' : '★'.repeat(info.stars);
        const empty  = (info.perStar > 0 && !info.isAtmospheric) ? '☆'.repeat(3 - info.stars) : '';
        // Progress to next star or next rank
        let progressText = '';
        if (info.isAtmospheric) {
            progressText = `${tt} 🏆 (макс.)`;
        } else if (info.name === 'Маршал') {
            // Show progress to 8000 title threshold
            const TITLE_THRESHOLD = 8000;
            const td = window.TANK_ATMOSPHERIC_TITLES && window.TANK_ATMOSPHERIC_TITLES[tankType];
            const titleName = td ? td.name : null;
            if (tt >= TITLE_THRESHOLD) {
                progressText = titleName ? `👑 «${titleName}»` : `${tt} 🏆 (макс.)`;
            } else {
                progressText = `${tt}/${TITLE_THRESHOLD} 🏆`;
            }
        } else if (info.perStar > 0 && info.stars < 3) {
            const next = info.base + (info.stars + 1) * info.perStar;
            progressText = `${tt}/${next} 🏆`;
        } else if (info.perStar === 0) {
            progressText = `${tt} 🏆`;
        } else {
            // 3 stars reached, show progress to next rank if exists
            const idx = TANK_RANKS.findIndex(r => r.name === info.name);
            const nextRank = TANK_RANKS[idx + 1];
            if (nextRank) progressText = `${tt}/${nextRank.base} 🏆`;
            else progressText = `${tt} 🏆`;
        }
        rankEl.style.borderColor = info.color;
        rankEl.style.cursor = 'pointer';
        rankEl.title = 'Нажми, чтобы увидеть подробности звания';
        rankEl.innerHTML = `
            <div style="font-size:13px; font-weight:bold; color:${info.color}; line-height:1; display:flex; align-items:center; gap:4px;">
                <span>${info.icon}</span><span>${info.name}</span>
            </div>
            <div style="font-size:14px; color:#f1c40f; letter-spacing:2px; line-height:1;">${filled}<span style="color:#555;">${empty}</span></div>
            <div style="font-size:10px; color:#bbb; line-height:1;">${progressText}</div>
        `;
        // Open rank detail modal on click
        rankEl.onclick = () => {
            if (typeof showRankModal === 'function') showRankModal(tankType);
        };
        if (useCompactCard) rankEl.style.display = 'none';
    }

    // Trio badge
    const trioEl = document.getElementById('tankDetailTrio');
    if (trioEl) {
        if (useCompactCard) {
            trioEl.style.display = 'none';
        } else {
            const trio = tankTrios[tankType];
            if (trio) {
                const c = trio.color;
                // Build member chips: emoji + short name, highlight current tank, gray out locked tanks
                const chips = trio.members.map(([mType, mIcon]) => {
                    const mName = (tankDescriptions[mType] || window.mechDescriptions?.[mType])?.name || mType;
                    const isActive = mType === tankType;
                    const isUnlocked = unlockedTanks && unlockedTanks.includes(mType);
                    let bgColor, borderColor, textColor, fontWeight, opacity;
                    if (isActive) {
                        bgColor = c + '55';
                        borderColor = c;
                        textColor = '#fff';
                        fontWeight = '800';
                        opacity = '1';
                    } else if (isUnlocked) {
                        bgColor = c + '22';
                        borderColor = c;
                        textColor = '#fff';
                        fontWeight = '600';
                        opacity = '1';
                    } else {
                        bgColor = 'rgba(100,100,100,0.15)';
                        borderColor = 'rgba(150,150,150,0.3)';
                        textColor = '#888';
                        fontWeight = 'normal';
                        opacity = '0.5';
                    }
                    return `<span style="
                        display:inline-flex; align-items:center; gap:4px;
                        background:${bgColor};
                        border:1px solid ${borderColor};
                        border-radius:20px; padding:3px 9px 3px 7px;
                        font-size:12px; color:${textColor};
                        font-weight:${fontWeight};
                        opacity:${opacity};
                    ">${mIcon} ${mName}</span>`;
                }).join('');
                trioEl.style.display = 'block';
                trioEl.innerHTML = `
                    <div style="
                        background: linear-gradient(135deg, ${c}18, ${c}08);
                        border: 1px solid ${c}55;
                        border-left: 3px solid ${c};
                        border-radius: 8px;
                        padding: 8px 12px;
                        display: flex;
                        align-items: center;
                        gap: 10px;
                    ">
                        <span style="font-size:24px; line-height:1; flex-shrink:0;">${trio.icon}</span>
                        <div style="display:flex; flex-direction:column; gap:5px;">
                            <div style="font-size:12px; font-weight:bold; color:${c}; letter-spacing:0.8px; text-transform:uppercase;">${trio.name}</div>
                            <div style="display:flex; flex-wrap:wrap; gap:5px;">${chips}</div>
                        </div>
                    </div>`;
            } else {
                trioEl.style.display = 'none';
            }
        }
    }

    // Fill stats block (with inline upgrade buttons)
    if (statsEl) {
        if (useCompactCard) {
            statsEl.innerHTML = '';
        } else {
        const hpBase = (typeof tankMaxHpByType !== 'undefined' && tankMaxHpByType[tankType]) || window.mechMaxHpByType?.[tankType] || 300;
        const defaultSpdBase = (typeof tankMaxSpeedByType !== 'undefined' && tankMaxSpeedByType[tankType]) || window.mechMaxSpeedByType?.[tankType] || 3.2;
        const hpLvl   = (typeof getTankUpgrade === 'function') ? getTankUpgrade(tankType, 'hp')  : 0;
        const spdLvl  = (typeof getTankUpgrade === 'function') ? getTankUpgrade(tankType, 'spd') : 0;
        const dmgLvl  = (typeof getTankUpgrade === 'function') ? getTankUpgrade(tankType, 'dmg') : 0;
        const hp  = myasnoyForm
            ? roundMyasnoyDisplayHp((hpBase + hpLvl * 50) * myasnoyForm.hpMultiplier)
            : hpBase + hpLvl * 50;
        // per-type maximum (base + full upgrades)
        const hpMaxPossible = myasnoyForm
            ? roundMyasnoyDisplayHp(((tankMaxHpByType[tankType] || window.mechMaxHpByType?.[tankType] || 300) + (UPGRADE_MAX * 50)) * myasnoyForm.hpMultiplier)
            : (tankMaxHpByType[tankType] || window.mechMaxHpByType?.[tankType] || 300) + (UPGRADE_MAX * 50);
        const hpStars  = Math.min(10, Math.round((hp / hpMaxPossible) * 10));
        // speed current and per-type max
        let spdBonus = 0;
        if (typeof getTankSpeedBonus === 'function') {
            spdBonus = getTankSpeedBonus(tankType);
        } else {
            const _incs = [0.2, 0.2, 0.3];
            for (let _i = 0; _i < spdLvl; _i++) spdBonus += (_incs[_i] || 0);
        }
        const spdBase = myasnoyForm ? myasnoyForm.speedBase : defaultSpdBase;
        const spd = parseFloat((spdBase + spdBonus).toFixed(1));
        const spdMaxPossible = spdBase + (typeof SPEED_INCREMENTS !== 'undefined' ? SPEED_INCREMENTS.reduce((a,b)=>a+b,0) : 0.7);
        const spdStars = Math.min(10, Math.round((spd / spdMaxPossible) * 10));
        const bar = (val, max = 10) => {
            const filled = Math.min(val, max);
            return '█'.repeat(filled) + '░'.repeat(max - filled);
        };
        const tankDamageByType = {
            normal: 100, ice: 100, fire: 0.75, buratino: 300, toxic: 44 / 60,
            plasma: 350, musical: 200, waterjet: 1.5, illuminat: 75 / 60,
            mirror: 100, egyptian: 100, time: 100, machinegun: MACHINEGUN_BULLET_DAMAGE, buckshot: BUCKSHOT_PELLET_DAMAGE, imitator: 100, electric: 150, burovoy: 40, robot: 65, medical: 75, mine: 150, roman: 125, pyro: 70, spartan: 80, air: 80, myasnoy: 2, ai: 80
        };
        const dmgRaw = myasnoyForm ? myasnoyForm.damageBase : (tankDamageByType[tankType] || window.mechDamageByType?.[tankType] || 100);
        // Use multiplier table if present, compute raw (float) boosted damage
        const dmgMultAtLvl = (typeof DMG_MULT_TABLE !== 'undefined') ? DMG_MULT_TABLE[dmgLvl] : (1 + dmgLvl*0.1);
        const dmgMultMax = (typeof DMG_MULT_TABLE !== 'undefined') ? DMG_MULT_TABLE[UPGRADE_MAX] : 1.6;
        const dmgBoostedRaw = dmgRaw * dmgMultAtLvl; // float value (not rounded) used for relative calculations
        const dmgMaxPossible = dmgRaw * dmgMultMax;

        // Show continuous damage per second and flame damage per particle.
        let displayDmgBoosted = tankType === 'fire' ? dmgBoostedRaw.toFixed(2) : Math.round(dmgBoostedRaw);
        let displayDmgMaxPossible = dmgMaxPossible;
        let displayDmgNote  = myasnoyForm ? myasnoyForm.damageNote : ({ buckshot: ' ×5', waterjet: '/тик', illuminat: '/тик', machinegun: '/пул.', mechDiy: '×3', fire: '/част.', burovoy: '/сек', myasnoy: '/сосуд' }[tankType] || '');
        // Квант: show main bullet + all 3 morph variants
        let displayDmgExtra = '';
        if (tankType === 'kvant') {
            const _kvantMainDmg = Math.round(100 * dmgMultAtLvl);
            displayDmgBoosted = `${_kvantMainDmg}`;
        }

        if (tankType === 'waterjet' || tankType === 'illuminat' || tankType === 'toxic') {
            // convert tick-based damage to per-second for display (60 ticks = 1s)
            displayDmgBoosted = Math.round(dmgBoostedRaw * 60);
            displayDmgMaxPossible = dmgMaxPossible * 60;
            displayDmgNote = '/сек';
        } else if (tankType === 'myasnoy') {
            if (myasnoyForm && myasnoyForm.fractionalDamage) {
                displayDmgBoosted = parseFloat(dmgBoostedRaw.toFixed(1));
                displayDmgMaxPossible = parseFloat(dmgMaxPossible.toFixed(1));
            } else {
                displayDmgBoosted = Math.round(dmgBoostedRaw);
                displayDmgMaxPossible = Math.round(dmgMaxPossible);
            }
        }
        const dmgStars = Math.min(10, Math.round((dmgBoostedRaw / Math.max(1, dmgMaxPossible)) * 10));

        // Ownership and helper to generate compact inline button HTML
        const isOwned = (typeof unlockedTanks !== 'undefined') && unlockedTanks.includes(tankType);
        const getLvl  = (stat) => (typeof getTankUpgrade === 'function') ? getTankUpgrade(tankType, stat) : 0;
        // Near number: MAX or lock symbol shown right after the value
        const makeNear = (stat) => {
            const lvl = getLvl(stat);
            if (!isOwned) return `<span style="font-size:12px; opacity:0.6; margin-left:6px;">🔒</span>`;
            if (lvl >= UPGRADE_MAX) return `<span style="font-size:11px; color:#f1c40f; font-weight:bold; margin-left:8px;">MAX</span>`;
            return '';
        };
        // Right side: upgrade button only (or nothing if MAX/locked)
        const makeFar = (stat) => {
            const lvl = getLvl(stat);
            if (!isOwned || lvl >= UPGRADE_MAX) return '';
            const nextCost = UPGRADE_COSTS[lvl];
            const affordable = (typeof parts !== 'undefined') && parts >= nextCost;
            return `<button class="upgrade-btn" data-type="${tankType}" data-stat="${stat}" data-cost="${nextCost}" ${affordable ? '' : 'disabled'} style="display:inline-block; min-width:48px; padding:2px 4px; font-size:10px; border-radius:4px; background:${affordable ? 'rgba(52,152,219,0.25)' : 'rgba(80,80,80,0.18)'}; border:1px solid ${affordable ? '#3498db' : '#555'}; color:${affordable ? '#fff' : '#888'};">Ур.${lvl+1} · ${nextCost}🔧</button>`;
        };

        const cssBar = (pct, color) => `<div style="width:90px;height:8px;background:#333;border-radius:4px;overflow:hidden;display:inline-block;vertical-align:middle;flex-shrink:0;"><div style="width:${Math.round(pct)}%;height:100%;background:${color};border-radius:4px;"></div></div>`;
        const hpPct  = Math.round((hp / hpMaxPossible) * 100);
        // Use raw float values for bar so it reaches 100% at max upgrade
        const dmgPct = Math.round((dmgBoostedRaw / Math.max(1, dmgMaxPossible)) * 100);
        const spdPct = Math.round((spd / spdMaxPossible) * 100);

        statsEl.innerHTML = `
            <div style="display:flex; flex-direction:column; gap:9px; font-size:13px;">
                <div style="display:flex; align-items:center;">
                    <div style="width:80px; font-weight:bold; flex-shrink:0;">HP</div>
                    ${cssBar(hpPct, '#e74c3c')}
                    <div style="margin-left:4px; flex-shrink:0; font-variant-numeric:tabular-nums;">${hp}</div>
                    ${makeNear('hp')}
                    <div style="flex:1;"></div>
                    <div style="flex-shrink:0;">${makeFar('hp')}</div>
                </div>
                <div style="display:flex; align-items:center;">
                    <div style="width:80px; font-weight:bold; flex-shrink:0;">Урон</div>
                    ${cssBar(dmgPct, '#A0522D')}
                    <div style="margin-left:4px; flex-shrink:0; font-variant-numeric:tabular-nums;">${displayDmgBoosted}${displayDmgNote}</div>
                    ${displayDmgExtra || ''}
                    ${makeNear('dmg')}
                    <div style="flex:1;"></div>
                    <div style="flex-shrink:0;">${makeFar('dmg')}</div>
                </div>
                <div style="display:flex; align-items:center;">
                    <div style="width:80px; font-weight:bold; flex-shrink:0;">Скорость</div>
                    ${cssBar(spdPct, '#2ecc71')}
                    <div style="margin-left:4px; flex-shrink:0; font-variant-numeric:tabular-nums;">${spd.toFixed(1)}</div>
                    ${makeNear('spd')}
                    <div style="flex:1;"></div>
                    <div style="flex-shrink:0;">${makeFar('spd')}</div>
                </div>
                ${(tankType === 'mechDiy' || tankType === 'mechShield' || tankType === 'mechRocket') ? (() => {
                    const _eBase = tankType === 'mechShield' ? 130 : (tankType === 'mechRocket' ? 150 : 110);
                    const energyLvl = getLvl('energy');
                    const maxE = _eBase + energyLvl * 20;
                    const maxEPossible = _eBase + UPGRADE_MAX * 20;
                    const ePct = Math.round((maxE / maxEPossible) * 100);
                    return `<div style="display:flex; align-items:center;">
                        <div style="width:80px; font-weight:bold; flex-shrink:0;">Энергия</div>
                        ${cssBar(ePct, '#3498db')}
                        <div style="margin-left:4px; flex-shrink:0; font-variant-numeric:tabular-nums;">${maxE}</div>
                        ${makeNear('energy')}
                        <div style="flex:1;"></div>
                        <div style="flex-shrink:0;">${makeFar('energy')}</div>
                    </div>`;
                })() : ''}
            </div>`;

        // Attach buy-button listeners inside statsEl
        statsEl.querySelectorAll('.upgrade-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const type = btn.dataset.type;
                const stat = btn.dataset.stat;
                const cost = parseInt(btn.dataset.cost) || 0;
                if (typeof parts === 'undefined' || parts < cost) return;
                if (window._isProfileSwitching) return;
                // Deduct parts
                parts -= cost;
                localStorage.setItem('tankParts', parts);
                // Store upgrade
                if (!tankUpgrades[type]) tankUpgrades[type] = {};
                tankUpgrades[type][stat] = (tankUpgrades[type][stat] || 0) + 1;
                saveTankUpgrades();
                if (typeof updateCoinDisplay === 'function') updateCoinDisplay();
                // Always re-apply HP and speed immediately (in case player buys mid-session)
                if (typeof setTankHP    === 'function') setTankHP(type);
                if (typeof setTankSpeed === 'function') setTankSpeed(type);
                // Refresh modal
                showTankDetail(type);
            });
        });
        }
    }

    // Draw background: normal uses single grass color, others use rarity gradient
    if (tankType === 'normal') {
        const grass = (tankBgGradients && tankBgGradients.normal && tankBgGradients.normal[1]) ? tankBgGradients.normal[1] : '#228B22';
        ctx.fillStyle = grass;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    } else if (tankType === 'time' || tankType === 'imitator' || tankType === 'roman' || tankType === 'kvant') {
        // Animated: pixelated rainbow flowing from top-left; redraw every frame
        if (window.tankDetailAnimId) cancelAnimationFrame(window.tankDetailAnimId);
        modal.style.display = 'flex'; // ensure visible before first frame
        const pixel = Math.max(16, Math.floor(Math.min(canvas.width, canvas.height) / 14));
        const drawFrame = () => {
            // If modal hidden externally, stop anim
            if (modal.style.display === 'none') {
                window.tankDetailAnimId = null;
                return;
            }
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            const t = Date.now() * 0.00012;
            const pixel = Math.max(20, Math.floor(Math.min(canvas.width, canvas.height) / 12));
            const shift = (t * 360) % 360;
            const step = 0.12;
            for (let py = 0; py < canvas.height; py += pixel) {
                for (let px = 0; px < canvas.width; px += pixel) {
                    const s = px + py;
                    const hue = (((s * step) - shift) % 360 + 360) % 360;
                    const light = 48 + 6 * Math.sin((px * 0.015 + py * 0.015) + t * 2.2);
                    ctx.fillStyle = `hsl(${hue}, 80%, ${light}%)`;
                    ctx.fillRect(px, py, pixel, pixel);
                }
            }
            ctx.strokeStyle = 'rgba(255,255,255,0.05)';
            ctx.lineWidth = 2;
            ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(canvas.width, canvas.height); ctx.stroke();

            const side = Math.min(canvas.width, canvas.height) / 2;
            const baseColor = (tankBaseColors && tankBaseColors[tankType]) ? tankBaseColors[tankType] : '#000000';
            drawTankOn(ctx, canvas.width / 2, canvas.height / 2, side, side, baseColor, 0, 1, tankType);
            window.tankDetailAnimId = requestAnimationFrame(drawFrame);
        };
        drawFrame();
        return; // avoid duplicate drawing / display toggle below
    } else if (tankType === 'illuminat') {
        // Animated: eye animation only, red gradient background
        if (window.tankDetailAnimId) cancelAnimationFrame(window.tankDetailAnimId);
        modal.style.display = 'flex';
        const drawFrame = () => {
            if (modal.style.display === 'none') {
                window.tankDetailAnimId = null;
                return;
            }
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            // Red gradient background
            const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
            grad.addColorStop(0, tankBgGradients.illuminat[0]);
            grad.addColorStop(1, tankBgGradients.illuminat[1]);
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Draw tank with animated eye
            const side = Math.min(canvas.width, canvas.height) / 2;
            const baseColor = (tankBaseColors && tankBaseColors[tankType]) ? tankBaseColors[tankType] : '#000000';
            drawTankOn(ctx, canvas.width / 2, canvas.height / 2, side, side, baseColor, 0, 1, tankType);
            window.tankDetailAnimId = requestAnimationFrame(drawFrame);
        };
        drawFrame();
        return;
    } else if (tankType === 'air') {
        // Animated Air tank tornado in modal
        if (window.tankDetailAnimId) cancelAnimationFrame(window.tankDetailAnimId);
        modal.style.display = 'flex';
        const drawFrame = () => {
            if (modal.style.display === 'none') {
                window.tankDetailAnimId = null;
                return;
            }
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
            grad.addColorStop(0, tankBgGradients.air[0]);
            grad.addColorStop(1, tankBgGradients.air[1]);
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            const side = Math.min(canvas.width, canvas.height) / 2;
            const baseColor = (tankBaseColors && tankBaseColors[tankType]) ? tankBaseColors[tankType] : '#00a896';
            drawTankOn(ctx, canvas.width / 2, canvas.height / 2, side, side, baseColor, 0, 1, tankType);
            window.tankDetailAnimId = requestAnimationFrame(drawFrame);
        };
        drawFrame();
        return;
    } else if (tankType === 'burovoy') {
        if (window.tankDetailAnimId) cancelAnimationFrame(window.tankDetailAnimId);
        modal.style.display = 'flex';
        const drawFrame = () => {
            if (modal.style.display === 'none') {
                window.tankDetailAnimId = null;
                return;
            }

            const bg = tankBgGradients.burovoy;
            const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
            grad.addColorStop(0, bg[0]);
            grad.addColorStop(1, bg[1]);
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            const side = Math.min(canvas.width, canvas.height) / 2;
            const baseColor = (tankBaseColors && tankBaseColors[tankType]) ? tankBaseColors[tankType] : '#8b1e13';
            drawTankOn(ctx, canvas.width / 2, canvas.height / 2, side, side, baseColor, 0, 1, tankType, getPreviewTankHeatState(tankType), 0);
            window.tankDetailAnimId = requestAnimationFrame(drawFrame);
        };
        drawFrame();
        return;
    } else if (tankType === 'myasnoy') {
        if (window.tankDetailAnimId) cancelAnimationFrame(window.tankDetailAnimId);
        modal.style.display = 'flex';
        const drawFrame = () => {
            if (modal.style.display === 'none') {
                window.tankDetailAnimId = null;
                return;
            }

            ctx.clearRect(0, 0, canvas.width, canvas.height);
            const bg = tankBgGradients.myasnoy || ['#701010', '#180000'];
            const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
            grad.addColorStop(0, bg[0]);
            grad.addColorStop(1, bg[1]);
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            const side = (Math.min(canvas.width, canvas.height) / 2) * (myasnoyForm ? myasnoyForm.sideScale : 0.66);
            const baseColor = (tankBaseColors && tankBaseColors[tankType]) ? tankBaseColors[tankType] : '#c03030';
            const angle = myasnoyTabKey === 'eye'
                ? Math.sin(Date.now() * 0.0018) * 0.65
                : Math.sin(Date.now() * 0.0011) * 0.28;
            const heatState = myasnoyForm && myasnoyForm.heatState ? { ...myasnoyForm.heatState } : null;
            if (heatState && heatState.myasnoyEyeForm) {
                heatState.myasnoyAttackTimer = 10 + Math.round((Math.sin(Date.now() * 0.004) + 1) * 4);
            }
            drawTankOn(ctx, canvas.width / 2, canvas.height / 2, side, side, baseColor, angle, 1, tankType, heatState, 0);
            window.tankDetailAnimId = requestAnimationFrame(drawFrame);
        };
        drawFrame();
        return;
    } else if (tankType === 'mechDiy') {
        // Modal animation delegated to mechs.js
        if (typeof showMechDiyModal === 'function') showMechDiyModal(ctx, canvas, modal);
        return;
    } else if (tankType === 'mechShield') {
        if (typeof showMechShieldModal === 'function') showMechShieldModal(ctx, canvas, modal);
        return;
    } else if (tankType === 'mechRocket') {
        if (typeof showMechRocketModal === 'function') showMechRocketModal(ctx, canvas, modal);
        return;
    } else if (tankBgGradients && tankBgGradients[tankType]) {
        const bg = tankBgGradients[tankType];
        const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
        grad.addColorStop(0, bg[0]);
        grad.addColorStop(1, bg[1]);
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const side = Math.min(canvas.width, canvas.height) / 2;
        const baseColor = (tankBaseColors && tankBaseColors[tankType]) ? tankBaseColors[tankType] : '#000000';
        drawTankOn(ctx, canvas.width / 2, canvas.height / 2, side, side, baseColor, getPreviewTankTurretAngle(tankType), 1, tankType, null, 0);

        modal.style.display = 'flex';
        return;
    } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    if (tankType !== 'time') {
        const side = Math.min(canvas.width, canvas.height) / 2;
        const baseColor = (tankBaseColors && tankBaseColors[tankType]) ? tankBaseColors[tankType] : '#000000';
        drawTankOn(ctx, canvas.width / 2, canvas.height / 2, side, side, baseColor, 0, 1, tankType, null, 0);
    }

    // Show modal
    modal.style.display = 'flex';
}

// Function to hide tank detail modal
function hideTankDetail() {
    const modal = document.getElementById('tankDetailModal');
    if (window.tankDetailAnimId) {
        cancelAnimationFrame(window.tankDetailAnimId);
        window.tankDetailAnimId = null;
    }
    modal.style.display = 'none';
}

// Function to select tank and close menus
function selectTank(tankType) {
    console.log('Selecting tank: ' + tankType);
    // Set selected tank using the function from main.js
    window.setSelectedTank(tankType);

    // Update previews to show selection
    drawCharacterPreviews();

    // Close detail modal
    hideTankDetail();
    // Close character modal
    document.getElementById('characterModal').style.display = 'none';
    // Update UI if needed
    if (window.updateCoinDisplay) window.updateCoinDisplay();
}
