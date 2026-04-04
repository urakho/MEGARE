
// --- VISUALS & ABILITIES --- //

// Tank descriptions for detail modal
const tankDescriptions = {
    normal: {
        name: "Стандартный танк",
        description: "Стандартный танк — надёжная боевая машина без сложных механик. Сбалансированная скорость, урон и броня делают его универсальным бойцом, подходящим для любой ситуации.",
        rarity: "Обычный"
    },
    ice: {
        name: "Ледяной танк",
        description: "Стреляет ледяными глыбами, замедляющими врагов. Замороженные противники становятся уязвимы и движутся медленнее. Идеален для контроля поля боя.",
        rarity: "Редкий"
    },
    fire: {
        name: "Огненный танк",
        description: "Мощный огнемет, сжигающий врагов потоком пламени. Наносит периодический урон и поджигает цели. Опасен на близкой дистанции.",
        rarity: "Сверхредкий"
    },
    toxic: {
        name: "Токсичный танк",
        description: "Запускает ядовитые газовые облака, создающие зоны поражения. Особая способность (E): выпускает огромное облако мегагаза, наносящее урон всем в нем. Зонный контроль.",
        rarity: "Легендарный"
    },
    plasma: {
        name: "Плазменный танк",
        description: "Стреляет мощными плазменными болтами, пробивающими врагов насквозь и наносящими огромный урон. Особая способность (E): концентрирует плазму в огромный взрывной выстрел. Высокий урон, долгая перезарядка.",
        rarity: "Мифический"
    },
    buratino: {
        name: "Буратино (ТОС)",
        description: "Тяжелая система залпового огня. Запускает мощный залп из ракет по площадям. Медленный и тяжелый, но наносит колоссальный урон в группировке.",
        rarity: "Эпический"
    },
    musical: {
        name: "Музыкальный танк",
        description: "Атакует звуковыми волнами, рикошетящими от стен и дезориентирующими врагов. Волна расширяется по мере распространения. Хитрый тактически.",
        rarity: "Эпический"
    },
    illuminat: {
        name: "Иллюминат",
        description: "Мистическая сущность, атакующая непрерывным световым лучом. Особая способность (E): инверсия управления — враги движутся в обратную сторону 2 секунды. Необычный боец с нестандартной тактикой.",
        rarity: "Мифический"
    },
    mirror: {
        name: "Зеркальный",
        description: "Мастер адаптации. Копирует тип снарядов противника при получении урона и отражает их обратно. Особая способность (E): активирует зеркальный щит, отражающий все входящие атаки. Умный защитник.",
        rarity: "Легендарный"
    },
    time: {
        name: "Временной",
        description: "Повелитель времени, защищающийся от опасности. Стреляет обычными пулями. Особая способность (E): временная петля — мгновенно возвращает танк в состояние 5 секунд назад (кулдаун 8 сек). Экстренная защита от поражения.",
        rarity: "Хроматическая"
    },
    machinegun: {
        name: "Пулемётчик",
        description: "Высокоскоростной боец, стреляющий очередями из 4 пуль. Частая огневая мощь компенсирует слабость одного выстрела. Идеален для постоянного давления.",
        rarity: "Редкий"
    },
    buckshot: {
        name: "Дробовой танк",
        description: "Выстреливает 6 дробин вперёд веером, расходящихся под углом. На близкой дистанции наносит огромный урон. На дальней дистанции дробь расходится, и урон снижается. Медленная перезарядка для компенсации мощности.",
        rarity: "Редкий"
    },
    waterjet: {
        name: "Водомётчик",
        description: "Стреляет мощной струёй воды вперед. Наносит урон при прямом контакте, замедляет и отталкивает врагов. Не пробивает стены — рассеивается при ударе. Идеален для защиты узких проходов.",
        rarity: "Сверхредкий"
    },
    imitator: {
        name: "Имитатор",
        description: "Стреляет одиничным призматическим снарядом. Способность (E): на 6 сек копирует ближайшего противника (внешность, снаряды, способность, HP, скорость). Кулдаун 18 сек.",
        rarity: "Хроматическая"
    },
    electric: {
        name: "Электрический",
        description: "Мифический электрический танк. Шаровые молнии преследуют врагов и обходят препятствия. Ульта (E): вспышка молний поражает всех рядом, проходя сквозь препятствия. Кулдаун: 8 сек. Танк идеален для контроля толпы и точечных зачисток.",
        rarity: "Мифический"
    },
    robot: {
        name: "Танк-робот",
        description: "Тяжёлый боевой робот с рельсотроном. Его выстрел пробивает танки и наносит урон всем врагам на линии. Ульта выпускает 3 боевых дрона, которые самостоятельно ищут врагов и атакуют их.",
        rarity: "Легендарный"
    },
    medical: {
        name: "Медицинский танк",
        description: "Боевой санитар, помогающий своей команде. Стреляет медицинскими импульсами — нанося урон врагам. Способность (E): создаёт лечебное поле на 5 секунд, восстанавливающее HP всех рядом находящихся товарищей. Кулдаун: 12 сек.",
        rarity: "Эпический"
    },
    mine: {
        name: "Минный танк",
        description: "Скрытный сапёр, расставляющий замаскированные мины. Нажмите пробел, чтобы разместить мину на земле. Свои мины видны только вам — вражеские скрыты. Мина взрывается при контакте с противником, нанося урон.",
        rarity: "Сверхредкий"
    },
    roman: {
        name: "Римский танк",
        description: "Имперский танк, вдохновлённый величием древнего Рима. Бросает тяжёлый клинок, способный поражать врагов даже за укрытиями, а в критический момент возводит сияющий золотой щит, становясь неуязвимым для любой атаки. Символ силы, чести и несгибаемой воли легионера.",
        rarity: "Хроматическая"
    }
};

// Background gradients for tank previews (menu & modal)
// Colors follow user mapping: Обычный=grass, Редкий=green, Сверхредкий=blue,
// Эпический=purple, Легендарный=yellow, Мифический=red
const tankBgGradients = {
    normal: ['#1b5e20', '#1b5e20'],   // Обычный - dark grass green (menu & modal)
    ice: ['#2ecc71', '#27ae60'],      // Редкий - green
    buckshot: ['#2ecc71', '#27ae60'], // Редкий - green
    fire: ['#3498db', '#5dade2'],     // Сверхредкий - blue
    waterjet: ['#3498db', '#5dade2'],  // Сверхредкий - blue (like fire slot)
    mine: ['#3498db', '#5dade2'],     // Сверхредкий - blue
    buratino: ['#9b59b6', '#8e44ad'], // Эпический - purple
    toxic: ['#fff9c4', '#fff176'],    // Легендарный - pale yellow
    plasma: ['#ff6b6b', '#e74c3c'],   // Мифический - red
    musical: ['#9b59b6', '#8e44ad'],  // Эпический - purple
    illuminat: ['#ff6b6b', '#e74c3c'],// Мифический - red
    mirror: ['#fff9c4', '#fff176'],   // Легендарный - pale yellow
    time: ['rgba(0,0,0,0)', 'rgba(0,0,0,0)'], // Хроматическая - transparent for CSS anim
    roman: ['rgba(0,0,0,0)', 'rgba(0,0,0,0)'], // Хроматическая - animated like time
    machinegun: ['#2ecc71', '#27ae60'], // Редкий - green (like ice)
    imitator: ['rgba(0,0,0,0)', 'rgba(0,0,0,0)'], // Имитатор - animated via code
    electric: ['#ff6b6b', '#e74c3c'],  // Электрический - red (robot theme)
    robot:  ['#fff9c4', '#fff176'],    // Танк-робот - legendary yellow
    medical: ['#9b59b6', '#8e44ad'],   // Медицинский - purple (Эпический)
    // sport removed
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
    musical: '#0000FF',
    illuminat: '#0000FF',
    mirror: '#0000FF',
    time: '#FF00FF',
    machinegun: '#0000FF',
    electric: '#1a1a2e',  // Dark blue-purple for robot
    robot:   '#263238',    // Dark steel for robot tank
    medical: '#0033ff',    // Bright blue for medical tank
    mine: '#3d4c18',       // Dark olive for mine tank
    roman: '#8B6914',      // Dark gold for Roman tank
    // sport removed
};

// Make available globally
window.tankDescriptions = tankDescriptions;

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
    icon: '🏛', name: 'Тактическое трио', color: '#d4a017',
    members: [['roman','🏛'],['time','⏰'],['imitator','🌈']]
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
    roman: _trioTactic, time: _trioTactic, imitator: _trioTactic,
    normal: _trioBase, ice: _trioBase, waterjet: _trioBase,
    mine: _trioControl, buratino: _trioControl, toxic: _trioControl,
    musical: _trioSupport, medical: _trioSupport, mirror: _trioSupport,
    illuminat: null,
};
window.tankTrios = tankTrios;
window.tankBgGradients = tankBgGradients;

// Preview canvas global access (defined in main.js, used here)

function drawTankOn(ctx, cx, cy, W, H, color, turretAngle, turretScale = 1, type = 'normal', heatState = null) {
    ctx.save();
    ctx.translate(cx, cy);

    // Dummy (training target): draw as a target/bullseye on a post
    if (type === 'dummy') {
        // Post
        ctx.fillStyle = '#8B6914';
        ctx.fillRect(-4, 0, 8, H * 0.5);
        // Target circles
        const rings = [
            { r: W * 0.48, color: '#cc2222' },
            { r: W * 0.34, color: '#ffffff' },
            { r: W * 0.20, color: '#cc2222' },
            { r: W * 0.09, color: '#ffdd00' },
        ];
        for (const ring of rings) {
            ctx.beginPath();
            ctx.arc(0, -H * 0.1, ring.r, 0, Math.PI * 2);
            ctx.fillStyle = ring.color;
            ctx.fill();
        }
        // Border
        ctx.beginPath();
        ctx.arc(0, -H * 0.1, W * 0.48, 0, Math.PI * 2);
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.restore();
        return;
    }
    if (type === 'illuminat') {
         // See turret section for actual drawing
         // We do nothing here for body/tracks because the pyramid IS the body and turret united.
    } else {
        if (type === 'fire') {
            W *= 1.2; // make wider
        } else if (type === 'buratino') {
            W *= 1.1; // make longer
        } else if (type === 'machinegun') {
            W *= 0.9; // make narrower for agility
            H *= 1.1; // make slightly longer
        }
        // tracks (top/bottom)
        const trackThick = Math.max(6, W * 0.12);
        ctx.fillStyle = type === 'ice' ? '#F0F8FF' : '#222';
        ctx.fillRect(-W/2, -H/2 - trackThick/2, W, trackThick);
        ctx.fillRect(-W/2, H/2 - trackThick/2, W, trackThick);
        if (type === 'buratino') {
            // track segments
            ctx.strokeStyle = '#444';
            ctx.lineWidth = 1;
            for (let x = -W/2 + 5; x < W/2; x += 10) {
                ctx.beginPath();
                ctx.moveTo(x, -H/2 - trackThick/2);
                ctx.lineTo(x, -H/2 + trackThick/2);
                ctx.stroke();
                ctx.beginPath();
                ctx.moveTo(x, H/2 - trackThick/2);
                ctx.lineTo(x, H/2 + trackThick/2);
                ctx.stroke();
            }
        }
        // body (between tracks)
        const bodyW = W - 4;
        const bodyH = H - trackThick - 4;

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
            // Magma Body
            ctx.fillStyle = '#2c2c2c';
            ctx.fillRect(-bodyW/2, -bodyH/2, bodyW, bodyH);
            // Molten cracks
            ctx.strokeStyle = '#e74c3c';
            ctx.lineWidth = 2;
            ctx.beginPath(); ctx.moveTo(-bodyW/4, -bodyH/4); ctx.lineTo(0, 0); ctx.lineTo(bodyW/4, -bodyH/4); ctx.stroke();
            // Heat vents
            ctx.fillStyle = '#d35400';
            ctx.fillRect(-bodyW/2 - 2, -5, 4, 10);
            ctx.fillRect(bodyW/2 - 2, -5, 4, 10);
        } else if (type === 'toxic') {
            // Bio-Hazard Body
            ctx.fillStyle = '#2c3e50';
            ctx.fillRect(-bodyW/2, -bodyH/2, bodyW, bodyH);
            // Warning stripes
            ctx.fillStyle = '#f1c40f';
            ctx.beginPath(); ctx.moveTo(-bodyW/2+5, -bodyH/2); ctx.lineTo(-bodyW/2+10, -bodyH/2); ctx.lineTo(-bodyW/2+5, bodyH/2); ctx.lineTo(-bodyW/2, bodyH/2); ctx.fill();
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
            // Machinegun Tank Body - Heavy assault vehicle
            // Dark Gunmetal / Urban Camo
            const grad = ctx.createLinearGradient(-bodyW/2, -bodyH/2, bodyW/2, bodyH/2);
            grad.addColorStop(0, '#263238');   // Dark Blue Grey
            grad.addColorStop(0.5, '#37474F'); // Blue Grey
            grad.addColorStop(1, '#212121');   // Almost Black
            ctx.fillStyle = grad;
            
            // Armored Chassis with angled front
            ctx.beginPath();
            ctx.moveTo(-bodyW/2, -bodyH/2);
            ctx.lineTo(bodyW/2 - 10, -bodyH/2); // Front right cut
            ctx.lineTo(bodyW/2, -bodyH/4);
            ctx.lineTo(bodyW/2, bodyH/4);
            ctx.lineTo(bodyW/2 - 10, bodyH/2);  // Front left cut
            ctx.lineTo(-bodyW/2, bodyH/2);
            ctx.closePath();
            ctx.fill();
            
            // Side Armor Plates (Reactive Armor)
            ctx.fillStyle = '#455A64'; // Lighter Grey
            ctx.fillRect(-bodyW/2 + 5, -bodyH/2 - 2, bodyW - 15, 4); // Top side
            ctx.fillRect(-bodyW/2 + 5, bodyH/2 - 2, bodyW - 15, 4);  // Bottom side
            
            // Engine Vents (Rear)
            ctx.fillStyle = '#000';
            for(let i=0; i<3; i++) {
                ctx.fillRect(-bodyW/2 + 2, -bodyH/4 + i*6, 4, 3);
            }
            
            // Ammo Feed System (Gold Line from body to turret center)
            ctx.fillStyle = '#FFC107'; 
            ctx.beginPath();
            ctx.moveTo(-bodyW/4, -bodyH/4);
            ctx.lineTo(0, 0); 
            ctx.lineTo(-bodyW/4, bodyH/4);
            ctx.stroke(); // Wait, fillStyle set but using stroke? need strokeStyle
            
            ctx.strokeStyle = '#FFB300';
            ctx.lineWidth = 2;
            ctx.stroke();

            // Heavy tread look
            ctx.strokeStyle = '#263238';
            ctx.lineWidth = 1;
            ctx.strokeRect(-bodyW/2, -bodyH/2, bodyW, bodyH);
        } else if (type === 'buckshot') {
            // Buckshot Tank - Tactical Breach Vehicle
            // Body: Reinforced Composite Armor (Dark Grey/Black)
            const grad = ctx.createLinearGradient(-bodyW/2, -bodyH/2, bodyW/2, bodyH/2);
            grad.addColorStop(0, '#37474F');   // Blue Grey Dark
            grad.addColorStop(0.5, '#455A64'); // Blue Grey Light
            grad.addColorStop(1, '#263238');   // Almost Black
            ctx.fillStyle = grad;
            ctx.fillRect(-bodyW/2, -bodyH/2, bodyW, bodyH);

            // Side grip panels (knurled texture look)
            const gripW = Math.max(2, bodyW * 0.12);
            ctx.fillStyle = '#212121'; 
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
                // Red Case
                ctx.fillStyle = '#c0392b'; // Shell Red
                ctx.fillRect(shellX, shellY, finalShellW, shellH);
                // Gold Base
                ctx.fillStyle = '#f1c40f'; // Brass Head
                ctx.fillRect(shellX, shellY, finalShellW * 0.4, shellH);
            }

            // Front Bumper / Ram (Relative size)
            const bumpSize = Math.max(2, bodyW * 0.08);
            ctx.fillStyle = '#546E7A';
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
            // imitator Tank — original style with elegant animated sheen and pulsing core
            const t = Date.now() * 0.002;

            // Base dark body
            const grad = ctx.createLinearGradient(-bodyW/2, -bodyH/2, bodyW/2, bodyH/2);
            grad.addColorStop(0, '#0f0f23');
            grad.addColorStop(0.5, '#1a1a3e');
            grad.addColorStop(1, '#0d0d1f');
            ctx.fillStyle = grad;
            ctx.fillRect(-bodyW/2, -bodyH/2, bodyW, bodyH);

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
            ctx.beginPath();
            ctx.moveTo(0, -dS); ctx.lineTo(dS * 0.8, 0);
            ctx.lineTo(0, dS); ctx.lineTo(-dS * 0.8, 0);
            ctx.closePath();
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
        } else if (type === 'boss_dummy') {
            // Dark body with red accents
            const _bg = ctx.createLinearGradient(-bodyW/2, -bodyH/2, bodyW/2, bodyH/2);
            _bg.addColorStop(0, '#1c0404');
            _bg.addColorStop(0.5, '#2a0606');
            _bg.addColorStop(1, '#1c0404');
            ctx.fillStyle = _bg;
            ctx.fillRect(-bodyW/2, -bodyH/2, bodyW, bodyH);
            // Red hazard edges (top/bottom strips)
            ctx.fillStyle = '#aa0000';
            ctx.fillRect(-bodyW/2, -bodyH/2, bodyW, 5);
            ctx.fillRect(-bodyW/2, bodyH/2 - 5, bodyW, 5);
            ctx.fillRect(-bodyW/2, -bodyH/2, 5, bodyH);
            ctx.fillRect(bodyW/2 - 5, -bodyH/2, 5, bodyH);
            // Simple bold X on body
            ctx.strokeStyle = '#dd1111';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(-bodyW*0.25, -bodyH*0.3); ctx.lineTo(bodyW*0.25, bodyH*0.3);
            ctx.moveTo(bodyW*0.25, -bodyH*0.3); ctx.lineTo(-bodyW*0.25, bodyH*0.3);
            ctx.stroke();
            // Corner bolts
            ctx.fillStyle = '#555';
            for (const [_rx, _ry] of [[-bodyW/2+5,-bodyH/2+5],[bodyW/2-5,-bodyH/2+5],[-bodyW/2+5,bodyH/2-5],[bodyW/2-5,bodyH/2-5]]) {
                ctx.beginPath(); ctx.arc(_rx, _ry, 3, 0, Math.PI*2); ctx.fill();
            }
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
        } else if (type === 'mine') {
            // Dark olive camo body with hazard markings
            const mineBodyGrad = ctx.createLinearGradient(-bodyW/2, -bodyH/2, bodyW/2, bodyH/2);
            mineBodyGrad.addColorStop(0, '#4a5a1c');
            mineBodyGrad.addColorStop(0.4, '#3d4c18');
            mineBodyGrad.addColorStop(1, '#2f3c10');
            ctx.fillStyle = mineBodyGrad;
            ctx.fillRect(-bodyW/2, -bodyH/2, bodyW, bodyH);
            // Camo dark patches
            ctx.fillStyle = 'rgba(15, 25, 5, 0.5)';
            ctx.fillRect(-bodyW/2, -bodyH * 0.15, bodyW * 0.28, bodyH * 0.45);
            ctx.fillRect(bodyW * 0.22, -bodyH/2, bodyW * 0.22, bodyH * 0.38);
            // Yellow hazard stripes on front
            const sW = bodyW * 0.07;
            ctx.fillStyle = '#ffcc00';
            for (let si = 0; si < 3; si++) {
                ctx.fillRect(-bodyW/2 + bodyW * (0.12 + si * 0.3), bodyH * 0.22, sW, bodyH * 0.28);
                ctx.fillStyle = 'rgba(0,0,0,0.6)';
                ctx.fillRect(-bodyW/2 + bodyW * (0.12 + si * 0.3) + sW, bodyH * 0.22, sW, bodyH * 0.28);
                ctx.fillStyle = '#ffcc00';
            }
            // Border
            ctx.strokeStyle = '#2a3510';
            ctx.lineWidth = 2;
            ctx.strokeRect(-bodyW/2, -bodyH/2, bodyW, bodyH);
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
        // Furnace Turret
        ctx.fillStyle = '#e74c3c'; // Lighter Red
        ctx.fillRect(-tSize/2, -tSize/2, tSize, tSize);
        // Heat coils
        ctx.strokeStyle = '#f1c40f';
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(-tSize/2+5, 0); ctx.lineTo(tSize/2-5, 0); ctx.stroke();
    } else if (type === 'toxic') {
        // Bio-Turret
        ctx.fillStyle = '#27ae60';
        ctx.beginPath(); ctx.arc(0, 0, tSize/2, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = '#2ecc71';
        ctx.beginPath(); ctx.arc(0, 0, tSize/3, 0, Math.PI*2); ctx.fill();
        // Bio symbol center
        ctx.fillStyle = '#f1c40f';
        ctx.beginPath(); ctx.arc(0, 0, tSize/6, 0, Math.PI*2); ctx.fill();
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
        const tSize = Math.max(W, H);
        // Clean "Eye of Providence" Design
        
        ctx.save();
        // Rotate -90 degrees (point LEFT/Opposite relative to standard/previous)
        // Original tip was UP (0, -Y). Previous edit was +90 (Right). User wants opposite of current.
        ctx.rotate(-Math.PI / 2);

        // Subtle mystical aura
        ctx.shadowColor = '#f1c40f';
        ctx.shadowBlur = 10;

        // --- The Pyramid ---
        const pSize = tSize * 0.85;
        
        // Solid Golden Triangle (No bricks, clean)
        const goldGrad = ctx.createLinearGradient(0, -pSize/2, 0, pSize/2);
        goldGrad.addColorStop(0, '#f1c40f');   // Bright Gold
        goldGrad.addColorStop(1, '#f39c12');   // Darker Gold
        ctx.fillStyle = goldGrad;
        
        ctx.beginPath();
        // Equilateral-ish triangle
        ctx.moveTo(0, -pSize * 0.6); 
        ctx.lineTo(pSize * 0.6, pSize * 0.45);
        ctx.lineTo(-pSize * 0.6, pSize * 0.45);
        ctx.closePath();
        ctx.fill();
        
        // Sharp black outline
        ctx.strokeStyle = '#2c3e50';
        ctx.lineWidth = 2;
        ctx.stroke();

        // --- The All-Seeing Eye ---
        // Levitating Capstone seaparated by a gap
        ctx.globalCompositeOperation = 'destination-out';
        ctx.beginPath();
        ctx.moveTo(-pSize * 0.6, pSize * 0.45 - pSize * 0.35); // line across
        ctx.lineTo(pSize * 0.6, pSize * 0.45 - pSize * 0.35);
        // Wait, cutting a line is hard with destination-out on filled path.
        // Let's just draw the capstone separate.
        ctx.globalCompositeOperation = 'source-over';
        
        // Draw the capstone triangle (Tip)
        const capY = -pSize * 0.6;
        const capBaseY = -pSize * 0.2;
        
        // Floating effect
        const floatOffset = Math.sin(Date.now() * 0.003) * 3;
        
        ctx.save();
        ctx.translate(0, floatOffset);
        
        // Capstone Glow
        ctx.shadowColor = '#00ffff';
        ctx.shadowBlur = 15;
        
        ctx.fillStyle = '#fff'; // White glowing capstone
        ctx.beginPath();
        ctx.moveTo(0, capY - 5);
        ctx.lineTo(pSize * 0.35, capBaseY - 5);
        ctx.lineTo(-pSize * 0.35, capBaseY - 5);
        ctx.closePath();
        ctx.fill();
        
        // The Eye itself inside the capstone
        ctx.fillStyle = '#00ffff'; // Cyan Eye
        ctx.beginPath();
        ctx.arc(0, (capY + capBaseY)/2 - 5, pSize * 0.1, 0, Math.PI * 2);
        ctx.fill();
        
        // Pupil
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(0, (capY + capBaseY)/2 - 5, pSize * 0.04, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();

        // --- Floating Runes ---
        // Rotating ring of runes
        ctx.save();
        ctx.rotate(Date.now() * 0.001);
        ctx.strokeStyle = 'rgba(241, 196, 15, 0.5)';
        ctx.lineWidth = 1;
        ctx.shadowBlur = 0;
        const ringR = pSize * 0.7;
        ctx.beginPath();
        ctx.arc(0, 0, ringR, 0, Math.PI*2);
        ctx.stroke();
        
        // 3 small dots on ring
        for(let k=0; k<3; k++) {
            const ra = (k/3) * Math.PI*2;
            ctx.fillStyle = '#f1c40f';
            ctx.beginPath();
            ctx.arc(Math.cos(ra)*ringR, Math.sin(ra)*ringR, 2, 0, Math.PI*2);
            ctx.fill();
        }
        ctx.restore();

        ctx.restore();
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
        // imitator Turret — hexagonal mount with single prismatic barrel
        const barrelLen = tSize * 1.55;
        const barrelH   = tSize * 0.27;
        // Barrel body
        const barGrad = ctx.createLinearGradient(0, -barrelH/2, 0, barrelH/2);
        barGrad.addColorStop(0,   '#6c3483');
        barGrad.addColorStop(0.5, '#a569bd');
        barGrad.addColorStop(1,   '#4a235a');
        ctx.fillStyle = barGrad;
        ctx.fillRect(tSize * 0.3, -barrelH/2, barrelLen, barrelH);
        // Prismatic band near muzzle
        const bandGrad = ctx.createLinearGradient(0, -barrelH/2, 0, barrelH/2);
        bandGrad.addColorStop(0,    '#ff0080');
        bandGrad.addColorStop(0.33, '#00ccff');
        bandGrad.addColorStop(0.66, '#80ff00');
        bandGrad.addColorStop(1,    '#ff8000');
        ctx.fillStyle = bandGrad;
        ctx.fillRect(tSize * 0.8, -barrelH * 0.75, tSize * 0.18, barrelH * 1.5);
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
        // Machinegun Turret - Multiple barrels
        ctx.fillStyle = '#A0522D';
        ctx.fillRect(-tSize/2, -tSize/2, tSize, tSize);
        
        // Multiple small barrels arrangement
        ctx.fillStyle = '#654321';
        for(let i = 0; i < 4; i++) {
            const offset = (i - 1.5) * 3;
            ctx.fillRect(0, offset, tSize/2, 2);
        }
        
        // Turret center (Pivot) - Larger, darker mount
        const tGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, tSize/2);
        tGrad.addColorStop(0, '#607D8B');
        tGrad.addColorStop(1, '#37474F');
        ctx.fillStyle = tGrad;
        ctx.beginPath();
        ctx.arc(0, 0, tSize/2.5, 0, Math.PI*2);
        ctx.fill();
        
        ctx.strokeStyle = '#263238';
        ctx.lineWidth = 1;
        ctx.stroke();
        
        // Inner mechanical details (Bolt circle)
        ctx.fillStyle = '#CFD8DC';
        for (let i = 0; i < 4; i++) {
            const rot = (i / 4) * Math.PI * 2 + Math.PI/4;
            const bx = Math.cos(rot) * tSize/5;
            const by = Math.sin(rot) * tSize/5;
            ctx.beginPath();
            ctx.arc(bx, by, 1.5, 0, Math.PI*2);
            ctx.fill();
        }

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
        const rnd   = 4;
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
        for(let ri = 0; ri < 4; ri++) {
            ctx.fillRect(gripX + 4 + ri * 7, -gripH/2 + 2, 3, gripH - 4);
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
    } else if (type === 'mine') {
        // Flat camo dome turret with mine deployer hatch
        ctx.fillStyle = '#3d4c18';
        ctx.beginPath();
        ctx.ellipse(0, 0, tSize * 0.55, tSize * 0.4, 0, 0, Math.PI * 2);
        ctx.fill();
        // Deployer hatch on top
        ctx.fillStyle = '#555500';
        ctx.beginPath();
        ctx.arc(0, -tSize * 0.08, tSize * 0.24, 0, Math.PI * 2);
        ctx.fill();
        // Warning ring around hatch
        ctx.strokeStyle = '#ffcc00';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, -tSize * 0.08, tSize * 0.24, 0, Math.PI * 2);
        ctx.stroke();
        // Outline
        ctx.strokeStyle = '#2a3510';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.ellipse(0, 0, tSize * 0.55, tSize * 0.4, 0, 0, Math.PI * 2);
        ctx.stroke();
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
        // Simple dark square turret with red ring
        ctx.fillStyle = '#1a0000';
        ctx.fillRect(-tSize/2, -tSize/2, tSize, tSize);
        ctx.strokeStyle = '#cc0000'; ctx.lineWidth = 2;
        ctx.strokeRect(-tSize/2+1, -tSize/2+1, tSize-2, tSize-2);
        // Pulsing red dot in center
        const _p = 0.6 + 0.4 * Math.sin(Date.now() * 0.006);
        ctx.fillStyle = `rgba(220,0,0,${_p})`;
        ctx.beginPath(); ctx.arc(0, 0, tSize*0.2, 0, Math.PI*2); ctx.fill();
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
    if (type !== 'buratino') {
        const barrelLen = Math.max(20, W * 0.45) * turretScale * (type === 'normal' && turretScale === 1 ? 1.65 : 1);
        const barrelH = Math.max(4, H * 0.08) * turretScale * (type === 'normal' && turretScale === 1 ? 1.75 : 1);

        if (type === 'fire') {
            // Flamethrower
            ctx.fillStyle = '#666'; // Lighter Grey
            ctx.fillRect(tSize/2 - 2, -barrelH/2, barrelLen*0.7, barrelH);
            // Wide Nozzle
            ctx.fillStyle = '#e67e22'; // Lighter Orange
            ctx.beginPath();
            ctx.moveTo(tSize/2 + barrelLen*0.7, -barrelH);
            ctx.lineTo(tSize/2 + barrelLen, -barrelH*1.5);
            ctx.lineTo(tSize/2 + barrelLen, barrelH*1.5);
            ctx.lineTo(tSize/2 + barrelLen*0.7, barrelH);
            ctx.fill();
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
            // Dual Toxin Injectors
            ctx.fillStyle = '#2ecc71';
            ctx.fillRect(tSize/2, -barrelH - 2, barrelLen, 4);
            ctx.fillRect(tSize/2, barrelH - 2, barrelLen, 4);
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
            // Heavy Rotary Cannon
            const barrelLen = Math.min(W, H) * 0.75 * turretScale; // Longer
            const barrelH = Math.min(W, H) * 0.22 * turretScale;   // Thicker base
            
            // Mounting (connects turret to barrels)
            ctx.fillStyle = '#455A64';
            ctx.fillRect(tSize/2 - 4, -barrelH/2 - 2, 8, barrelH + 4);
            
            // Main Barrel Assembly (Rotating Cylinder Block)
            const cylGrad = ctx.createLinearGradient(0, -barrelH/2, 0, barrelH/2);
            cylGrad.addColorStop(0, '#263238');
            cylGrad.addColorStop(0.5, '#546E7A');
            cylGrad.addColorStop(1, '#263238');
            ctx.fillStyle = cylGrad;
            
            ctx.fillRect(tSize/2 + 2, -barrelH/2, barrelLen, barrelH);
            
            // Detail: Cooling Rings along the assembly
            ctx.fillStyle = 'rgba(0,0,0,0.3)';
            for(let k=1; k<5; k++) {
                ctx.fillRect(tSize/2 + 2 + k * (barrelLen/5), -barrelH/2, 2, barrelH);
            }
            
            // Individual Barrels (Visible protruding at the end or as lines)
            // We draw 3 parallel lines to represent the visible sector of the 6-barrel cluster
            let barrelColor = '#90A4AE'; // Bright Steel
            let muzzleColor = '#37474F';
            
            if (heatState && heatState.heat > 0) {
                 const t = Math.min(1, heatState.heat / 240); // 240 is max heat
                 // Interpolate #90A4AE (144,164,174) to #FF0000 (255,0,0)
                 const r = Math.floor(144 + (255 - 144) * t);
                 const g = Math.floor(164 * (1 - t));
                 const b = Math.floor(174 * (1 - t));
                 barrelColor = `rgb(${r},${g},${b})`;
                 
                 if (heatState.overheated) {
                      muzzleColor = '#FF4500';
                      // Flashing red
                      if (Math.floor(Date.now() / 100) % 2 === 0) {
                          barrelColor = '#FF0000';
                      } else {
                          barrelColor = '#8B0000';
                      }
                 }
            }

            ctx.fillStyle = barrelColor;
            const bH = barrelH / 4;
            // Top barrel
            ctx.fillRect(tSize/2 + 2, -barrelH/2 + bH*0.5, barrelLen + 4, bH/2);
            // Middle barrel
            ctx.fillRect(tSize/2 + 2, -bH/4, barrelLen + 4, bH/2);
            // Bottom barrel
            ctx.fillRect(tSize/2 + 2, barrelH/2 - bH, barrelLen + 4, bH/2);
            
            // Muzzle disk (Front plate holding barrels together)
            const mX = tSize/2 + barrelLen + 2;
            ctx.fillStyle = muzzleColor;
            ctx.beginPath();
            ctx.ellipse(mX, 0, 3, barrelH/2 + 2, 0, 0, Math.PI*2);
            ctx.fill();
            
            // Muzzle Holes (Black dots on the disk)
            ctx.fillStyle = '#000';
            ctx.beginPath(); ctx.arc(mX, -barrelH/3, 1.5, 0, Math.PI*2); ctx.fill();
            ctx.beginPath(); ctx.arc(mX, 0, 1.5, 0, Math.PI*2); ctx.fill();
            ctx.beginPath(); ctx.arc(mX, barrelH/3, 1.5, 0, Math.PI*2); ctx.fill();

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
            // Heavy boss cannon — thick red-black armored barrel
            const _bLen = Math.min(W, H) * 0.65 * turretScale;
            const _bH   = Math.min(W, H) * 0.22 * turretScale;
            const _bGrad = ctx.createLinearGradient(0, -_bH/2, 0, _bH/2);
            _bGrad.addColorStop(0, '#4a0000');
            _bGrad.addColorStop(0.4, '#880000');
            _bGrad.addColorStop(0.6, '#2a0000');
            _bGrad.addColorStop(1, '#4a0000');
            ctx.fillStyle = _bGrad;
            ctx.fillRect(tSize/2, -_bH/2, _bLen, _bH);
            // Reinforcement rings
            ctx.fillStyle = '#cc0000';
            for (let _ri = 0; _ri < 3; _ri++) {
                ctx.fillRect(tSize/2 + _bLen * (0.22 + _ri * 0.22) - 2, -_bH/2 - 2, 4, _bH + 4);
            }
            // Muzzle brake block
            ctx.fillStyle = '#1a0000';
            ctx.fillRect(tSize/2 + _bLen - 5, -_bH/2 - 5, 10, _bH + 10);
            // Muzzle hole
            ctx.fillStyle = '#000';
            ctx.beginPath(); ctx.arc(tSize/2 + _bLen + 4, 0, _bH * 0.28, 0, Math.PI*2); ctx.fill();
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
        } else if (type === 'mine') {
            // Short mine deployer arm with a mine at the end
            const mBarrelLen = Math.min(W, H) * 0.34 * turretScale;
            const mBarrelH = Math.min(W, H) * 0.11 * turretScale;
            ctx.fillStyle = '#2a3510';
            ctx.fillRect(tSize / 2, -mBarrelH / 2, mBarrelLen, mBarrelH);
            // Mine shape at tip
            const mineR = mBarrelH * 0.9;
            ctx.fillStyle = '#333300';
            ctx.shadowColor = '#ffcc00';
            ctx.shadowBlur = 6;
            ctx.beginPath();
            ctx.arc(tSize / 2 + mBarrelLen, 0, mineR, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#ffcc00';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.arc(tSize / 2 + mBarrelLen, 0, mineR, 0, Math.PI * 2);
            ctx.stroke();
            // Small detonator spike on mine
            ctx.fillStyle = '#ff4400';
            ctx.shadowColor = '#ff4400';
            ctx.shadowBlur = 4;
            ctx.beginPath();
            ctx.arc(tSize / 2 + mBarrelLen, 0, mineR * 0.35, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
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

function drawPreview() {
    if (!previewCtx) return;
    previewCtx.clearRect(0,0,previewCanvas.width, previewCanvas.height);
    const side = Math.min(previewCanvas.width, previewCanvas.height) / 2;
    drawTankOn(previewCtx, previewCanvas.width/2, previewCanvas.height/2, side, side, tank.color, tank.turretAngle, 1, tankType);
}

function drawFrozenOverlay(ctx, x, y, w, h, life) {
    const cx = x + w/2;
    const cy = y + h/2;
    const alpha = Math.max(0.12, Math.min(0.95, life / 180));
    ctx.save();
    const g = ctx.createLinearGradient(x, y, x + w, y + h);
    g.addColorStop(0, `rgba(200,230,255,${0.02 * alpha})`);
    g.addColorStop(0.5, `rgba(180,215,240,${0.06 * alpha})`);
    g.addColorStop(1, `rgba(220,245,255,${0.03 * alpha})`);
    ctx.fillStyle = g;
    ctx.fillRect(x, y, w, h);

    ctx.globalAlpha = 0.6 * alpha;
    ctx.strokeStyle = 'rgba(220,240,255,0.6)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 3; i++) {
        const off = (i - 1) * (h * 0.18);
        ctx.beginPath();
        ctx.moveTo(x - w * 0.1, y + h * 0.2 + off);
        ctx.lineTo(x + w * 1.05, y + h * 0.05 + off);
        ctx.stroke();
    }

    const t = (Date.now() % 1000) / 1000;
    const shimmerX = x + (t * (w + 40)) - 20;
    ctx.globalCompositeOperation = 'lighter';
    const shimmerGrad = ctx.createLinearGradient(shimmerX - 20, y, shimmerX + 20, y + h);
    shimmerGrad.addColorStop(0, `rgba(255,255,255,${0.0 * alpha})`);
    shimmerGrad.addColorStop(0.5, `rgba(255,255,255,${0.35 * alpha})`);
    shimmerGrad.addColorStop(1, `rgba(255,255,255,${0.0 * alpha})`);
    ctx.fillStyle = shimmerGrad;
    ctx.fillRect(x, y, w, h);
    ctx.globalCompositeOperation = 'source-over';

    const icCount = Math.max(3, Math.floor(w / 14));
    const maxLen = Math.min(h * 0.9, 20);
    for (let i = 0; i < icCount; i++) {
        const u = (i + 0.5) / icCount;
        const px = x + u * w + (Math.sin(i * 2 + Date.now() * 0.002) * 2);
        const baseY = y + 2;
        const len = maxLen * (0.4 + 0.6 * (0.5 + 0.5 * Math.sin(i * 3 + Date.now() * 0.003)));
        ctx.beginPath();
        ctx.moveTo(px - 6, baseY);
        ctx.lineTo(px + 6, baseY);
        ctx.lineTo(px, baseY + len);
        ctx.closePath();
        ctx.fillStyle = `rgba(180,220,255,${0.9 * alpha})`;
        ctx.fill();
        ctx.strokeStyle = `rgba(220,240,255,${0.95 * alpha})`;
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(px - 2, baseY + len * 0.4);
        ctx.lineTo(px, baseY + len * 0.2);
        ctx.lineTo(px + 2, baseY + len * 0.4);
        ctx.fillStyle = `rgba(255,255,255,${0.6 * alpha})`;
        ctx.fill();
    }

    ctx.restore();
}

function drawCharacterPreviews() {
    const drawItem = (ctx, canvas, type, baseColor, bgGrad) => {
        if (!ctx) return;
        // Проверка на разблокированность (unlockedTanks глобальный массив из main.js)
        const isUnlocked = typeof unlockedTanks !== 'undefined' && unlockedTanks.includes(type);
        
        ctx.clearRect(0,0,canvas.width, canvas.height);
        const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
        
        if (isUnlocked) {
            grad.addColorStop(0, bgGrad[0]);
            grad.addColorStop(1, bgGrad[1]);
        } else {
            // Темный фон для заблокированных
            grad.addColorStop(0, '#444');
            grad.addColorStop(1, '#222');
        }
        
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        const side = Math.min(canvas.width, canvas.height) / 2;
        
        ctx.save();
        if (!isUnlocked) {
            // Делаем черно-белым
            ctx.filter = 'grayscale(100%) contrast(0.8)';
        }
        drawTankOn(ctx, canvas.width/2, canvas.height/2, side, side, baseColor, 0, 1, type);
        ctx.restore();
        
        // Draw trophy counter for unlocked tanks
        if (isUnlocked && typeof getTankTrophies === 'function') {
            const tankTrophies = getTankTrophies(type);
            if (tankTrophies > 0) {
                ctx.fillStyle = 'rgba(0,0,0,0.6)';
                ctx.fillRect(0, canvas.height - 24, canvas.width, 24);
                ctx.fillStyle = '#e67e22';
                ctx.font = 'bold 14px Arial';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText('🏆 ' + tankTrophies, canvas.width/2, canvas.height - 12);
            }
        }
        
        if (typeof window.getCurrentTankType === 'function' && window.getCurrentTankType() === type) {
            ctx.strokeStyle = 'white';
            ctx.lineWidth = 4;
            ctx.strokeRect(2, 2, canvas.width - 4, canvas.height - 4);
        } else if (!isUnlocked) {
             // Рисуем замок
             ctx.fillStyle = 'rgba(0,0,0,0.5)';
             ctx.fillRect(0, 0, canvas.width, canvas.height);
             
             ctx.font = '40px Arial';
             ctx.textAlign = 'center';
             ctx.textBaseline = 'middle';
             ctx.fillStyle = '#fff';
             ctx.shadowColor = 'black';
             ctx.shadowBlur = 4;
             ctx.fillText('🔒', canvas.width/2, canvas.height/2);
             ctx.shadowBlur = 0;
        }
    };

    drawItem(normalTankCtx, normalTankPreview, 'normal', '#0000FF', tankBgGradients.normal);
    // RARE
    drawItem(iceTankCtx, iceTankPreview, 'ice', '#54d1e8', tankBgGradients.ice);
    drawItem(machinegunTankCtx, machinegunTankPreview, 'machinegun', '#0000FF', tankBgGradients.machinegun);
    drawItem(buckshotTankCtx, buckshotTankPreview, 'buckshot', '#2ecc71', tankBgGradients.buckshot);
    // SUPER_RARE
    drawItem(fireTankCtx, fireTankPreview, 'fire', '#4c00ff', tankBgGradients.fire);
    drawItem(waterjetTankCtx, waterjetTankPreview, 'waterjet', '#154360', tankBgGradients.waterjet);
    drawItem(medicalTankCtx, medicalTankPreview, 'medical', '#0033ff', tankBgGradients.medical);
    // MINE
    if (typeof mineTankCtx !== 'undefined' && mineTankCtx && mineTankPreview) {
        drawItem(mineTankCtx, mineTankPreview, 'mine', '#3d4c18', tankBgGradients.mine);
    }
    // EPIC
    drawItem(buratinoTankCtx, buratinoTankPreview, 'buratino', '#0000FF', tankBgGradients.buratino);
    drawItem(musicalTankCtx, musicalTankPreview, 'musical', '#0000FF', tankBgGradients.musical);
    // LEGENDARY
    drawItem(toxicTankCtx, toxicTankPreview, 'toxic', '#0000FF', tankBgGradients.toxic);
    drawItem(mirrorTankCtx, mirrorTankPreview, 'mirror', '#0000FF', tankBgGradients.mirror);
    // MYTHIC
    // Illuminat Tank Animation (eye animation only, no pixelated background)
    if (typeof illuminatTankCtx !== 'undefined' && illuminatTankCtx && illuminatTankPreview) {
        if (window.illuminatTankAnimId) cancelAnimationFrame(window.illuminatTankAnimId);

        const animateIlluminatTank = () => {
            if (document.getElementById('characterModal').style.display === 'none') return;
            
            const isUnlocked = typeof unlockedTanks !== 'undefined' && unlockedTanks.includes('illuminat');
            const canvas = illuminatTankPreview;
            const ctx = illuminatTankCtx;

            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            // Red gradient background (no pixelated animation)
            const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
            if (isUnlocked) {
                grad.addColorStop(0, tankBgGradients.illuminat[0]);
                grad.addColorStop(1, tankBgGradients.illuminat[1]);
            } else {
                grad.addColorStop(0, '#444');
                grad.addColorStop(1, '#222');
            }
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            const side = Math.min(canvas.width, canvas.height) / 2;
            ctx.save();
            if (!isUnlocked) ctx.filter = 'grayscale(100%) contrast(0.8)';
            drawTankOn(ctx, canvas.width/2, canvas.height/2, side, side, '#0000FF', 0, 1, 'illuminat');
            ctx.restore();

            // Selection Border or Lock
            if (typeof window.getCurrentTankType === 'function' && window.getCurrentTankType() === 'illuminat') {
                ctx.strokeStyle = 'white';
                ctx.lineWidth = 4;
                ctx.strokeRect(2, 2, canvas.width - 4, canvas.height - 4);
            } else if (!isUnlocked) {
                ctx.fillStyle = 'rgba(0,0,0,0.5)';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.font = '40px Arial';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillStyle = '#fff';
                ctx.fillText('🔒', canvas.width/2, canvas.height/2);
            }
            
            window.illuminatTankAnimId = requestAnimationFrame(animateIlluminatTank);
        };
        animateIlluminatTank();
    } else {
        drawItem(illuminatTankCtx, illuminatTankPreview, 'illuminat', '#0000FF', tankBgGradients.illuminat);
    }

    // Plasma (mythic)
    drawItem(plasmaTankCtx, plasmaTankPreview, 'plasma', '#0000FF', tankBgGradients.plasma);

    // imitator - Time Tank Animation Logic
    if (typeof timeTankCtx !== 'undefined' && timeTankCtx && timeTankPreview) {
        // Stop any existing loop
        if (window.timeTankAnimId) cancelAnimationFrame(window.timeTankAnimId);

        const animateTimeTank = () => {
            if (document.getElementById('characterModal').style.display === 'none') return;
            
            const isUnlocked = typeof unlockedTanks !== 'undefined' && unlockedTanks.includes('time');
            const canvas = timeTankPreview;
            const ctx = timeTankCtx;

            ctx.clearRect(0,0,canvas.width, canvas.height);
            
            // Pixelated diagonal sweep from top-left: large tiles, bands move diagonally from top-left
            const time = Date.now() * 0.00012; // sweep speed control (lower == slower)
            if (isUnlocked) {
                const pixel = Math.max(18, Math.floor(Math.min(canvas.width, canvas.height) / 12));
                const shift = (time * 360) % 360; // degrees of shift applied over s = x+y
                const step = 0.12; // hue step per pixel-distance
                for (let py = 0; py < canvas.height; py += pixel) {
                    for (let px = 0; px < canvas.width; px += pixel) {
                        const s = px + py; // diagonal coordinate from top-left
                        const hue = (((s * step) - shift) % 360 + 360) % 360;
                        const light = 48 + 6 * Math.sin((px * 0.02 + py * 0.02) + time * 2.2);
                        ctx.fillStyle = `hsl(${hue}, 82%, ${light}%)`;
                        ctx.fillRect(px, py, pixel, pixel);
                    }
                }
            } else {
                ctx.fillStyle = '#333';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
            }

            const side = Math.min(canvas.width, canvas.height) / 2;
            ctx.save();
            if (!isUnlocked) ctx.filter = 'grayscale(100%) contrast(0.8)';
            drawTankOn(ctx, canvas.width/2, canvas.height/2, side, side, '#FF00FF', 0, 1, 'time');
            ctx.restore();

            // Selection Border or Lock
             if (typeof window.getCurrentTankType === 'function' && window.getCurrentTankType() === 'time') {
                ctx.strokeStyle = 'white';
                ctx.lineWidth = 4;
                ctx.strokeRect(2, 2, canvas.width - 4, canvas.height - 4);
            } else if (!isUnlocked) {
                 ctx.fillStyle = 'rgba(0,0,0,0.5)';
                 ctx.fillRect(0, 0, canvas.width, canvas.height);
                 ctx.font = '40px Arial';
                 ctx.textAlign = 'center';
                 ctx.textBaseline = 'middle';
                 ctx.fillStyle = '#fff';
                 ctx.fillText('🔒', canvas.width/2, canvas.height/2);
            }
            
            window.timeTankAnimId = requestAnimationFrame(animateTimeTank);
        };
        animateTimeTank();
    }

    // imitator Tank Animation Logic — use same pixelated Time background
    if (typeof imitatorTankCtx !== 'undefined' && imitatorTankCtx && imitatorTankPreview) {
        if (window.imitatorTankAnimId) cancelAnimationFrame(window.imitatorTankAnimId);

        const animateimitatorTank = () => {
            if (document.getElementById('characterModal').style.display === 'none') return;

            const isUnlocked = typeof unlockedTanks !== 'undefined' && unlockedTanks.includes('imitator');
            const canvas = imitatorTankPreview;
            const ctx = imitatorTankCtx;

            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Use the same diagonal pixel sweep as Time (top-left → bottom-right)
            const time = Date.now() * 0.00012;
            if (isUnlocked) {
                const pixel = Math.max(18, Math.floor(Math.min(canvas.width, canvas.height) / 12));
                const shift = (time * 360) % 360; // degrees
                const step = 0.12;
                for (let py = 0; py < canvas.height; py += pixel) {
                    for (let px = 0; px < canvas.width; px += pixel) {
                        const s = px + py; // diagonal coordinate
                        const hue = (((s * step) - shift) % 360 + 360) % 360;
                        const light = 48 + 6 * Math.sin((px * 0.02 + py * 0.02) + time * 2.2);
                        ctx.fillStyle = `hsl(${hue}, 82%, ${light}%)`;
                        ctx.fillRect(px, py, pixel, pixel);
                    }
                }
            } else {
                ctx.fillStyle = '#111';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
            }

            const side = Math.min(canvas.width, canvas.height) / 2;
            ctx.save();
            if (!isUnlocked) ctx.filter = 'grayscale(100%) contrast(0.8)';
            drawTankOn(ctx, canvas.width/2, canvas.height/2, side, side, '#1a1a3e', 0, 1, 'imitator');
            ctx.restore();

            // Selection Border or Lock
            if (typeof window.getCurrentTankType === 'function' && window.getCurrentTankType() === 'imitator') {
                ctx.strokeStyle = 'white';
                ctx.lineWidth = 4;
                ctx.strokeRect(2, 2, canvas.width - 4, canvas.height - 4);
            } else if (!isUnlocked) {
                ctx.fillStyle = 'rgba(0,0,0,0.5)';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.font = '40px Arial';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillStyle = '#fff';
                ctx.fillText('🔒', canvas.width/2, canvas.height/2);
            }

            window.imitatorTankAnimId = requestAnimationFrame(animateimitatorTank);
        };
        animateimitatorTank();
    }
    
    // ELECTRIC Robot Tank - Static preview with gradient background
    drawItem(electricTankCtx, electricTankPreview, 'electric', '#1a1a2e', tankBgGradients.electric);

    // ROBOT Tank preview
    if (typeof robotTankCtx !== 'undefined' && robotTankCtx && robotTankPreview) {
        drawItem(robotTankCtx, robotTankPreview, 'robot', '#0d0d1e', tankBgGradients.robot);
    }

    // ROMAN Tank preview - animated chromatic
    if (typeof romanTankCtx !== 'undefined' && romanTankCtx && typeof romanTankPreview !== 'undefined' && romanTankPreview) {
        const animateRomanTank = function() {
            const isUnlocked = typeof unlockedTanks !== 'undefined' && unlockedTanks.includes('roman');
            const canvas = romanTankPreview;
            const ctx    = romanTankCtx;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            const time = Date.now() * 0.00012;
            if (isUnlocked) {
                const pixel  = Math.max(18, Math.floor(Math.min(canvas.width, canvas.height) / 12));
                const shift  = (time * 360) % 360;
                const step   = 0.12;
                for (let py = 0; py < canvas.height; py += pixel) {
                    for (let px = 0; px < canvas.width; px += pixel) {
                        const s   = px + py;
                        const hue = (((s * step) - shift) % 360 + 360) % 360;
                        const light = 48 + 6 * Math.sin((px * 0.02 + py * 0.02) + time * 2.2);
                        ctx.fillStyle = `hsl(${hue}, 82%, ${light}%)`;
                        ctx.fillRect(px, py, pixel, pixel);
                    }
                }
            } else {
                ctx.fillStyle = '#111';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
            }
            const side = Math.min(canvas.width, canvas.height) / 2;
            ctx.save();
            if (!isUnlocked) ctx.filter = 'grayscale(100%) contrast(0.8)';
            drawTankOn(ctx, canvas.width/2, canvas.height/2, side, side, '#1a1a2e', 0, 1, 'roman');
            ctx.restore();
            if (typeof window.getCurrentTankType === 'function' && window.getCurrentTankType() === 'roman') {
                ctx.strokeStyle = 'white';
                ctx.lineWidth   = 4;
                ctx.strokeRect(2, 2, canvas.width - 4, canvas.height - 4);
            } else if (!isUnlocked) {
                ctx.fillStyle = 'rgba(0,0,0,0.5)';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.font         = '40px Arial';
                ctx.textAlign    = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillStyle    = '#fff';
                ctx.fillText('\ud83d\udd12', canvas.width/2, canvas.height/2);
            }
            window.romanTankAnimId = requestAnimationFrame(animateRomanTank);
        };
        animateRomanTank();
    }

    // SPORT Soccer Tank preview removed
}

function draw() {
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

    // 1. Фон (сетка) — cell grid aligned to nav cells (visible window only)
    ctx.strokeStyle = 'rgba(0,0,0,0.15)';
    ctx.lineWidth = 1;
    const gridStep = navCell;  // defaults to 25 usually
    
    const minX = Math.max(0, Math.floor(viewLeft / gridStep) * gridStep);
    const minY = Math.max(0, Math.floor(viewTop / gridStep) * gridStep);
    const maxX = Math.min(worldWidth, viewRight);
    const maxY = Math.min(worldHeight, viewBottom);
    
    // Use beginPath outside loop for better performance if possible, but we need separate strokes for large lines?
    // Actually drawing one huge path is faster than many strokes
    ctx.beginPath();
    for (let x = minX; x <= maxX; x += gridStep) {
        ctx.moveTo(x, minY); ctx.lineTo(x, maxY);
    }
    for (let y = minY; y <= maxY; y += gridStep) {
        ctx.moveTo(minX, y); ctx.lineTo(maxX, y);
    }
    ctx.stroke();

    // 2. Частицы пыли
    particles.forEach(p => {
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
        const rad = obj.radius || 0; // for circles
        if (!isVisible(obj.x - rad, obj.y - rad, obj.w || (rad*2), obj.h || (rad*2))) return;

        ctx.save();
        ctx.fillStyle = obj.color;
        if (obj.type === 'wall') {
            const wx = obj.x, wy = obj.y, ww = obj.w, wh = obj.h;
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

        } else if (obj.type === 'barrel') {
            const cx = obj.x + obj.w/2;
            const cy = obj.y + obj.h/2;
            const rx = obj.w/2;
            const ry = Math.max(6, obj.h * 0.18);

            const grad = ctx.createLinearGradient(obj.x, obj.y, obj.x, obj.y + obj.h);
            grad.addColorStop(0, '#4b2b17');
            grad.addColorStop(0.45, '#7a4d2a');
            grad.addColorStop(0.55, '#c27f48');
            grad.addColorStop(1, '#5a2f18');
            ctx.fillStyle = grad;
            ctx.fillRect(obj.x, obj.y + ry * 0.5, obj.w, obj.h - ry);

            ctx.beginPath();
            ctx.ellipse(cx, obj.y + ry * 0.6, rx * 0.92, ry * 0.9, 0, 0, Math.PI * 2);
            ctx.fillStyle = '#6b361b';
            ctx.fill();
            ctx.strokeStyle = 'rgba(0,0,0,0.35)'; ctx.lineWidth = 2; ctx.stroke();

            const bandH = Math.max(4, obj.h * 0.08);
            const bandY1 = obj.y + obj.h * 0.28;
            const bandY2 = obj.y + obj.h * 0.62;
            ctx.fillStyle = '#33363a'; ctx.fillRect(obj.x, bandY1, obj.w, bandH);
            ctx.fillStyle = '#2b2f34'; ctx.fillRect(obj.x, bandY2, obj.w, bandH);
            ctx.fillStyle = 'rgba(255,255,255,0.12)';
            ctx.fillRect(obj.x, bandY1 + 1, obj.w, 1);
            ctx.fillRect(obj.x, bandY2 + 1, obj.w, 1);

            ctx.fillStyle = 'rgba(220,220,220,0.6)';
            const rivetCount = Math.max(3, Math.floor(obj.w / 40));
            for (let r = 0; r < rivetCount; r++) {
                const rxpos = obj.x + 8 + (r / (rivetCount - 1)) * (obj.w - 16);
                ctx.beginPath(); ctx.arc(rxpos, bandY1 + bandH/2, 2, 0, Math.PI*2); ctx.fill();
                ctx.beginPath(); ctx.arc(rxpos, bandY2 + bandH/2, 2, 0, Math.PI*2); ctx.fill();
            }

            ctx.beginPath();
            ctx.moveTo(obj.x + obj.w * 0.18, obj.y + obj.h * 0.12);
            ctx.quadraticCurveTo(obj.x + obj.w * 0.23, obj.y + obj.h * 0.5, obj.x + obj.w * 0.18, obj.y + obj.h * 0.88);
            ctx.strokeStyle = 'rgba(255,255,255,0.12)'; ctx.lineWidth = Math.max(2, obj.w * 0.06); ctx.stroke();

            const radial = ctx.createRadialGradient(cx, obj.y + ry*0.6, 2, cx, obj.y + ry*0.6, rx*1.1);
            radial.addColorStop(0, 'rgba(255,255,255,0.22)');
            radial.addColorStop(0.25, 'rgba(255,255,255,0.06)');
            radial.addColorStop(1, 'rgba(0,0,0,0)');
            ctx.fillStyle = radial;
            ctx.beginPath(); ctx.ellipse(cx, obj.y + ry * 0.6, rx * 0.9, ry * 0.9, 0, 0, Math.PI * 2); ctx.fill();

            // bottom shadow ellipse
            ctx.beginPath();
            ctx.ellipse(cx, obj.y + obj.h - ry * 0.35, rx * 0.9, ry * 0.6, 0, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(0,0,0,0.22)';
            ctx.fill();
        } else if (obj.type === 'targetCircle') {
            ctx.strokeStyle = obj.color;
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(obj.x, obj.y, obj.radius, 0, Math.PI * 2);
            ctx.stroke();
        } else if (obj.type === 'explosion') {
            const maxLife = obj.maxLife || 30;
            const t = Math.max(0, obj.life / maxLife); // 1→0
            const progress = 1 - t;                   // 0→1
            ctx.save();
            if (obj.color) {
                // Colored wave (e.g. illuminat ult, gas visual) — expand ring with tint
                const r = Math.max(1, obj.radius * Math.sqrt(progress + 0.01));
                const grad = ctx.createRadialGradient(obj.x, obj.y, r * 0.55, obj.x, obj.y, r);
                const alpha = t * 0.7;
                grad.addColorStop(0, obj.color.replace(/,[^,)]+\)$/, `, ${alpha})`) );
                grad.addColorStop(1, 'rgba(0,0,0,0)');
                ctx.fillStyle = obj.color;
                ctx.globalAlpha = alpha;
                ctx.beginPath();
                ctx.arc(obj.x, obj.y, r, 0, Math.PI * 2);
                ctx.fill();
                ctx.globalAlpha = 1;
            } else {
                // Real fire explosion
                const r = Math.max(1, obj.radius * Math.sqrt(progress + 0.01));
                const grad = ctx.createRadialGradient(obj.x, obj.y, 0, obj.x, obj.y, r);
                if (progress < 0.35) {
                    grad.addColorStop(0,    `rgba(255,255,220,${t})`);
                    grad.addColorStop(0.15, `rgba(255,230,50,${t * 0.95})`);
                    grad.addColorStop(0.45, `rgba(255,110,0,${t * 0.85})`);
                    grad.addColorStop(0.72, `rgba(160,25,0,${t * 0.7})`);
                    grad.addColorStop(1,    `rgba(50,25,5,0)`);
                } else {
                    grad.addColorStop(0,    `rgba(255,150,15,${t * 0.65})`);
                    grad.addColorStop(0.3,  `rgba(120,50,0,${t * 0.55})`);
                    grad.addColorStop(0.62, `rgba(70,55,45,${t * 0.45})`);
                    grad.addColorStop(1,    `rgba(30,30,30,0)`);
                }
                ctx.fillStyle = grad;
                ctx.beginPath();
                ctx.arc(obj.x, obj.y, r, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.restore();
        } else if (obj.type === 'shockwave') {
            const maxLife = obj.maxLife || 20;
            const t = Math.max(0, obj.life / maxLife);
            const alpha = t * 0.75;
            ctx.save();
            ctx.strokeStyle = `rgba(255,220,110,${alpha})`;
            ctx.lineWidth = Math.max(0.5, 3.5 * t);
            ctx.shadowColor = `rgba(255,190,0,${alpha * 0.8})`;
            ctx.shadowBlur = 12;
            ctx.beginPath();
            ctx.arc(obj.x, obj.y, Math.max(1, obj.radius), 0, Math.PI * 2);
            ctx.stroke();
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
            const alpha = Math.max(0.06, obj.life / obj.maxLife * 0.6);
            ctx.fillStyle = `rgba(60,180,60,${alpha})`;
            ctx.beginPath(); ctx.arc(obj.x, obj.y, obj.radius, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = `rgba(120,240,120,${alpha * 0.25})`;
            ctx.beginPath(); ctx.arc(obj.x, obj.y, obj.radius * 0.6, 0, Math.PI * 2); ctx.fill();
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
            const radius = b.w / 2;
            const pulse = Math.sin(Date.now() * 0.02 + b.x * 0.1) * 0.2 + 0.8; 
            
            const outerGrad = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, radius * pulse);
            outerGrad.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
            outerGrad.addColorStop(0.2, 'rgba(142, 68, 173, 0.8)');
            outerGrad.addColorStop(0.6, 'rgba(91, 44, 111, 0.6)');
            outerGrad.addColorStop(1, 'rgba(142, 68, 173, 0)');
            ctx.fillStyle = outerGrad;
            ctx.beginPath();
            ctx.arc(b.x, b.y, radius * pulse, 0, Math.PI * 2);
            ctx.fill();
            
            const coreGrad = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, radius * 0.6);
            coreGrad.addColorStop(0, '#ffffff');
            coreGrad.addColorStop(0.5, '#e8f5e8');
            coreGrad.addColorStop(1, 'rgba(232, 245, 232, 0)');
            ctx.fillStyle = coreGrad;
            ctx.beginPath();
            ctx.arc(b.x, b.y, radius * 0.6, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.strokeStyle = '#8e44ad';
            ctx.lineWidth = 2;
            ctx.shadowColor = '#8e44ad';
            ctx.shadowBlur = 8;
            for (let i = 0; i < 4; i++) {
                const angle = (i / 4) * Math.PI * 2 + (Date.now() * 0.015 + b.x * 0.05) % (Math.PI * 2);
                const startDist = radius * 0.7;
                const endDist = radius * 1.3;
                ctx.beginPath();
                ctx.moveTo(b.x + Math.cos(angle) * startDist, b.y + Math.sin(angle) * startDist);
                ctx.quadraticCurveTo(
                    b.x + Math.cos(angle + 0.3) * radius,
                    b.y + Math.sin(angle + 0.3) * radius,
                    b.x + Math.cos(angle + 0.6) * endDist,
                    b.y + Math.sin(angle + 0.6) * endDist
                );
                ctx.stroke();
            }
            
            ctx.fillStyle = '#ffffff';
            for (let i = 0; i < 6; i++) {
                const angle = (i / 6) * Math.PI * 2 + (Date.now() * 0.01) % (Math.PI * 2);
                const dist = radius * 0.9;
                const px = b.x + Math.cos(angle) * dist;
                const py = b.y + Math.sin(angle) * dist;
                ctx.beginPath();
                ctx.arc(px, py, 1.5, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.shadowBlur = 0;
        } else if (b.type === 'plasmaBlast') {
            const radius = b.w / 2;
            const grad = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, radius);
            grad.addColorStop(0, '#ffffff');
            grad.addColorStop(0.2, '#e91e63');
            grad.addColorStop(0.5, '#c2185b');
            grad.addColorStop(0.8, '#880e4f');
            grad.addColorStop(1, 'rgba(233, 30, 99, 0)');
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(b.x, b.y, radius, 0, Math.PI * 2);
            ctx.fill();
            
            const layerGrad = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, radius * 0.7);
            layerGrad.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
            layerGrad.addColorStop(0.5, 'rgba(233, 30, 99, 0.6)');
            layerGrad.addColorStop(1, 'rgba(233, 30, 99, 0)');
            ctx.fillStyle = layerGrad;
            ctx.beginPath();
            ctx.arc(b.x, b.y, radius * 0.7, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.strokeStyle = '#e91e63';
            ctx.lineWidth = 2;
            ctx.shadowColor = '#e91e63';
            ctx.shadowBlur = 15;
            for (let i = 0; i < 6; i++) {
                const angle = (i / 6) * Math.PI * 2 + (Date.now() * 0.02) % (Math.PI * 2);
                ctx.beginPath();
                ctx.moveTo(b.x, b.y);
                ctx.quadraticCurveTo(
                    b.x + Math.cos(angle) * radius * 1.5,
                    b.y + Math.sin(angle) * radius * 1.5,
                    b.x + Math.cos(angle + 0.5) * radius * 2,
                    b.y + Math.sin(angle + 0.5) * radius * 2
                );
                ctx.stroke();
            }
            
            ctx.fillStyle = '#ffffff';
            for (let i = 0; i < 8; i++) {
                const angle = (i / 8) * Math.PI * 2;
                const dist = radius * 0.8;
                const px = b.x + Math.cos(angle) * dist;
                const py = b.y + Math.sin(angle) * dist;
                ctx.beginPath();
                ctx.arc(px, py, 1, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.shadowBlur = 0;
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
                // Optimization: reduced particle spawn rate in war mode or if many particles
                if (window.effectsEnabled !== false && (currentMode !== 'war' || particles.length < 150)) {
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
            if (window.effectsEnabled !== false && Math.random() > 0.5 && (currentMode !== 'war' || particles.length < 150)) {
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
            if (window.effectsEnabled !== false && Math.random() > 0.8 && (typeof currentMode === 'undefined' || currentMode !== 'war' || particles.length < 150)) {
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

        } else if (b.type === 'romanBlade') {
            // Roman gladius — solid iron short-sword spinning in flight
            ctx.save();
            ctx.translate(b.x, b.y);
            ctx.rotate(b.spinAngle || 0);

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
            if (window.effectsEnabled !== false && Math.random() > 0.6 && (typeof currentMode === 'undefined' || currentMode !== 'war' || particles.length < 150)) {
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
            if (window.effectsEnabled !== false && Math.random() > 0.7 && (typeof currentMode === 'undefined' || currentMode !== 'war' || particles.length < 150)) {
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
            for (let i = 0; i < 6; i++) {
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
            if (window.effectsEnabled !== false && Math.random() > 0.65 && (typeof currentMode === 'undefined' || currentMode !== 'war' || particles.length < 150)) {
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

        } else {
            ctx.fillStyle = '#5c4033';
            ctx.fillRect(b.x - b.w/2, b.y - b.h/2, b.w, b.h);
            ctx.fillStyle = '#fdb813'; 
            const m = 2;
            if (b.w > m*2) {
                ctx.fillRect(b.x - b.w/2 + m, b.y - b.h/2 + m, b.w - m*2, b.h - m*2);
            }
            ctx.fillStyle = 'rgba(255,255,255,0.5)';
            ctx.fillRect(b.x - b.w/2 + 1, b.y - b.h/2 + 1, b.w/3, b.h/3);
        }
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
            
            // Decrease life
            ray.life--;
        });
        
        // Remove dead rays
        electricRays = electricRays.filter(ray => ray.life > 0);
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
            for (let p = 0; p < 8; p++) {
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

    // 3.5.5c. Buratino barrage projectiles
    if (typeof buratinoBarrages !== 'undefined' && buratinoBarrages && buratinoBarrages.length > 0) {
        for (let i = buratinoBarrages.length - 1; i >= 0; i--) {
            const proj = buratinoBarrages[i];
            
            // Move projectile
            proj.x += proj.vx;
            proj.y += proj.vy;
            proj.vy += 0.2; // gravity
            proj.life--;
            
            // Check collisions with walls
            let hitWall = false;
            for (const obj of objects) {
                const dx = proj.x - Math.max(obj.x, Math.min(proj.x, obj.x + obj.w));
                const dy = proj.y - Math.max(obj.y, Math.min(proj.y, obj.y + obj.h));
                if (dx*dx + dy*dy < (proj.radius + 5)*(proj.radius + 5)) {
                    hitWall = true;
                    break;
                }
            }
            
            // Check collisions with enemies
            for (const enemy of enemies) {
                const dx = proj.x - (enemy.x + enemy.w/2);
                const dy = proj.y - (enemy.y + enemy.h/2);
                if (dx*dx + dy*dy < (proj.radius + enemy.w/2)*(proj.radius + enemy.w/2)) {
                    hitWall = true;
                    break;
                }
            }
            
            // Explode on collision, timeout, or out of bounds
            if (hitWall || proj.life <= 0 || proj.x < 0 || proj.x > worldWidth || proj.y < 0 || proj.y > worldHeight) {
                // Explosion effect
                spawnExplosion(proj.x, proj.y, proj.explosionRadius);
                
                // Damage enemies in explosion radius
                for (let e of enemies) {
                    const dx = e.x + e.w/2 - proj.x;
                    const dy = e.y + e.h/2 - proj.y;
                    const dist = Math.sqrt(dx*dx + dy*dy);
                    if (dist < proj.explosionRadius) {
                        let dmg = proj.damage * (1 - dist / proj.explosionRadius);
                        if (typeof godMode !== 'undefined' && godMode) dmg = dmg * 1000;
                        e.hp -= dmg;
                        if (e.hp < 0) e.hp = 0;
                    }
                }
                
                // Spawn particles
                for (let p = 0; p < 15; p++) {
                    spawnParticle(proj.x + (Math.random()-0.5)*50, proj.y + (Math.random()-0.5)*50, '#ff6600', 0.6);
                }
                
                buratinoBarrages.splice(i, 1);
                continue;
            }
            
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

    // 3.5.5d. Musical tank sound ricochet projectiles
    if (typeof musicalSoundWaves !== 'undefined' && musicalSoundWaves && musicalSoundWaves.length > 0) {
        for (let i = musicalSoundWaves.length - 1; i >= 0; i--) {
            const proj = musicalSoundWaves[i];
            
            // Move projectile
            proj.x += proj.vx;
            proj.y += proj.vy;
            proj.life--;
            
            // Check collisions with walls and bounce
            for (const obj of objects) {
                const dx = proj.x - Math.max(obj.x, Math.min(proj.x, obj.x + obj.w));
                const dy = proj.y - Math.max(obj.y, Math.min(proj.y, obj.y + obj.h));
                if (dx*dx + dy*dy < (proj.radius + 5)*(proj.radius + 5)) {
                    // Calculate bounce direction
                    const overlapX = (proj.radius + 5) - Math.abs(proj.x - (obj.x + obj.w/2));
                    const overlapY = (proj.radius + 5) - Math.abs(proj.y - (obj.y + obj.h/2));
                    if (overlapX < overlapY) {
                        proj.vx = -proj.vx;
                    } else {
                        proj.vy = -proj.vy;
                    }
                    proj.bounces++;
                    spawnParticle(proj.x, proj.y, '#00ffff', 0.5);
                    break;
                }
            }
            
            // Check collisions with enemies
            for (const enemy of enemies) {
                const dx = proj.x - (enemy.x + enemy.w/2);
                const dy = proj.y - (enemy.y + enemy.h/2);
                if (dx*dx + dy*dy < (proj.radius + enemy.w/2)*(proj.radius + enemy.w/2)) {
                    // Damage enemy
                    enemy.hp -= proj.damage;
                    if (enemy.hp < 0) enemy.hp = 0;
                    
                    // Play hit effect
                    spawnParticle(proj.x, proj.y, '#00ffff', 0.7);
                    
                    // Bounce away
                    const ang = Math.atan2(dy, dx);
                    proj.vx = Math.cos(ang) * 5;
                    proj.vy = Math.sin(ang) * 5;
                    proj.bounces++;
                    break;
                }
            }
            
            // Remove if too many bounces or out of bounds or timed out
            if (proj.bounces > proj.maxBounces || proj.life <= 0 || proj.x < 0 || proj.x > worldWidth || proj.y < 0 || proj.y > worldHeight) {
                spawnParticle(proj.x, proj.y, '#00ffff', 0.6);
                musicalSoundWaves.splice(i, 1);
                continue;
            }
            
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
        const now = Date.now();
        for (const mine of mines) {
            // Only render mines placed by the player (team 0); enemy mines are invisible
            if (mine.team !== 0) continue;
            if (!isVisible(mine.x - mine.radius - 6, mine.y - mine.radius - 6, (mine.radius + 6) * 2, (mine.radius + 6) * 2)) continue;
            ctx.save();
            ctx.translate(mine.x, mine.y);
            // Mine body — dark olive disk
            const mGrad = ctx.createRadialGradient(-3, -3, 1, 0, 0, mine.radius);
            mGrad.addColorStop(0, '#555510');
            mGrad.addColorStop(0.5, '#333300');
            mGrad.addColorStop(1, '#111100');
            ctx.fillStyle = mGrad;
            ctx.beginPath();
            ctx.arc(0, 0, mine.radius, 0, Math.PI * 2);
            ctx.fill();
            // Yellow warning ring
            ctx.strokeStyle = '#ffcc00';
            ctx.lineWidth = 2.5;
            ctx.shadowColor = '#ffcc00';
            ctx.shadowBlur = 7;
            ctx.beginPath();
            ctx.arc(0, 0, mine.radius, 0, Math.PI * 2);
            ctx.stroke();
            ctx.shadowBlur = 0;
            // Rotating danger spokes
            const rot = (now * 0.0012) % (Math.PI * 2);
            ctx.rotate(rot);
            ctx.strokeStyle = '#ff5500';
            ctx.lineWidth = 1.8;
            ctx.globalAlpha = 0.75;
            for (let s = 0; s < 4; s++) {
                const a = (s / 4) * Math.PI * 2;
                ctx.beginPath();
                ctx.moveTo(Math.cos(a) * 4, Math.sin(a) * 4);
                ctx.lineTo(Math.cos(a) * (mine.radius - 3), Math.sin(a) * (mine.radius - 3));
                ctx.stroke();
            }
            ctx.globalAlpha = 1;
            ctx.rotate(-rot);
            // Red detonator knob in center
            ctx.fillStyle = '#ff2200';
            ctx.shadowColor = '#ff5500';
            ctx.shadowBlur = 8;
            ctx.beginPath();
            ctx.arc(0, 0, 4, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
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
        if (!a || !a.alive || !isVisible(a.x, a.y, a.w, a.h)) return;
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
        drawTankOn(ctx, 0, 0, a.w, a.h, a.color || '#888', a.turretAngle || 0, 1, a.tankType || 'normal', { heat: a.heat, overheated: a.overheated });
        ctx.restore();
        if (a.frozenEffect && a.frozenEffect > 0) drawFrozenOverlay(ctx, a.x, a.y, a.w, a.h, a.frozenEffect);
        ctx.fillStyle = 'blue';
        ctx.fillRect(a.x, a.y - 10, a.w, 5);
        ctx.fillStyle = 'black';
        const maxAllyHp = (typeof tankMaxHpByType !== 'undefined' && tankMaxHpByType[a.tankType]) || a.maxHp || 300;
        const missingHp = maxAllyHp - a.hp;
        if (missingHp > 0) {
            ctx.fillRect(a.x + a.w * (a.hp / maxAllyHp), a.y - 10, a.w * (missingHp / maxAllyHp), 5);
        }
        ctx.fillStyle = 'white';
        ctx.font = 'bold 7px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(Math.ceil(a.hp) + '/' + maxAllyHp, a.x + a.w / 2, a.y - 7);
    });

    // Helper for beam drawing (applied to all)
    function drawUnitBeam(unit) {
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
        if (!enemy || !enemy.alive || !isVisible(enemy.x, enemy.y, enemy.w, enemy.h)) return;
        ctx.save();
        ctx.translate(enemy.x + enemy.w/2, enemy.y + enemy.h/2);
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
        if (enemy.isBoss) {
            drawBossOn(ctx, enemy.w, enemy.h, enemy.turretAngle || 0, enemy.phase || 1);
        } else {
            const _drawColor = enemy.paralyzed ? '#00FFFF' : (enemy.color || '#B22222');
            drawTankOn(ctx, 0, 0, enemy.w, enemy.h, _drawColor, enemy.turretAngle || 0, 1, enemy.tankType || 'normal', { heat: enemy.heat, overheated: enemy.overheated });
        }
        // Boss phase 2 glow overlay is already baked into drawBossOn
        ctx.restore();
        if (enemy.frozenEffect && enemy.frozenEffect > 0) drawFrozenOverlay(ctx, enemy.x, enemy.y, enemy.w, enemy.h, enemy.frozenEffect);
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
    });

    // 6. Иллюзии
    illusions.forEach(ill => {
        ctx.save();
        ctx.translate(ill.x, ill.y);
        ctx.globalAlpha = 0.5; // semi-transparent
        // Add a "glitch" color shift
        if (Math.random() > 0.8) {
             ctx.translate((Math.random()-0.5)*4, (Math.random()-0.5)*4);
        }
        drawTankOn(ctx, 0, 0, 38, 38, ill.color, ill.turretAngle, 1, ill.tankType || 'normal');
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

        drawTankOn(ctx, 0, 0, tank.w, tank.h, tank.color, tank.turretAngle, 1, tankType, { heat: tank.heat, overheated: tank.overheated });

        // Draw Roman Shield on top of tank body
        if (tankType === 'roman' && tank.romanShieldActive) {
            ctx.save();
            const _now = Date.now();
            const rShieldR = Math.max(tank.w, tank.h) * 0.88;
            const _pulse = 0.7 + 0.3 * Math.sin(_now * 0.008);

            // === Glowing base dome: crimson core fading to gold rim ===
            const rGrad = ctx.createRadialGradient(0, 0, rShieldR * 0.22, 0, 0, rShieldR);
            rGrad.addColorStop(0,    `rgba(180, 30, 10, ${0.06 * _pulse})`);
            rGrad.addColorStop(0.5,  `rgba(255, 160, 0, ${0.10 * _pulse})`);
            rGrad.addColorStop(0.82, `rgba(255, 215, 0, ${0.28 * _pulse})`);
            rGrad.addColorStop(1,    `rgba(255, 130, 0, ${0.58 * _pulse})`);
            ctx.beginPath();
            ctx.arc(0, 0, rShieldR, 0, Math.PI * 2);
            ctx.fillStyle = rGrad;
            ctx.fill();

            // === Bright outer rim with gold glow ===
            ctx.shadowBlur = 14;
            ctx.shadowColor = '#FFD700';
            ctx.strokeStyle = `rgba(255, 215, 0, ${0.92 * _pulse})`;
            ctx.lineWidth = 3.5;
            ctx.beginPath();
            ctx.arc(0, 0, rShieldR, 0, Math.PI * 2);
            ctx.stroke();
            ctx.shadowBlur = 0;

            // === Outer rotating octagon ===
            ctx.save();
            ctx.rotate(_now * 0.0018);
            ctx.strokeStyle = `rgba(255, 200, 50, ${0.50 * _pulse})`;
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            for (let _si = 0; _si <= 8; _si++) {
                const _a = (_si / 8) * Math.PI * 2;
                const _r = rShieldR * 1.07 * (1 + 0.04 * Math.sin(_si * 2.5 + _now * 0.009));
                if (_si === 0) ctx.moveTo(Math.cos(_a) * _r, Math.sin(_a) * _r);
                else          ctx.lineTo(Math.cos(_a) * _r, Math.sin(_a) * _r);
            }
            ctx.closePath();
            ctx.stroke();
            ctx.restore();

            // === Inner concentric rings ===
            [0.62, 0.38].forEach((_ratio, _ri) => {
                ctx.strokeStyle = `rgba(255, 215, 0, ${(0.16 + _ri * 0.1) * _pulse})`;
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.arc(0, 0, rShieldR * _ratio, 0, Math.PI * 2);
                ctx.stroke();
            });

            // === Slowly rotating golden spokes ===
            ctx.save();
            ctx.rotate(_now * 0.0022);
            ctx.strokeStyle = `rgba(255, 200, 50, ${0.38 * _pulse})`;
            ctx.lineWidth = 1.2;
            for (let _si = 0; _si < 4; _si++) {
                const _a = (_si / 4) * Math.PI * 2;
                ctx.beginPath();
                ctx.moveTo(Math.cos(_a) * rShieldR * 0.18, Math.sin(_a) * rShieldR * 0.18);
                ctx.lineTo(Math.cos(_a) * rShieldR * 0.84, Math.sin(_a) * rShieldR * 0.84);
                ctx.stroke();
            }
            ctx.restore();

            // === Counter-rotating bright arc highlights ===
            ctx.save();
            ctx.rotate(-_now * 0.0045);
            ctx.shadowBlur = 7;
            ctx.shadowColor = '#fff8cc';
            for (let _ai = 0; _ai < 3; _ai++) {
                const _a = (_ai / 3) * Math.PI * 2;
                ctx.strokeStyle = `rgba(255, 255, 200, ${0.78 * _pulse})`;
                ctx.lineWidth = 2.5;
                ctx.beginPath();
                ctx.arc(0, 0, rShieldR + 5, _a, _a + Math.PI * 0.35);
                ctx.stroke();
            }
            ctx.shadowBlur = 0;
            ctx.restore();

            ctx.restore();
        }

        // Sport visuals removed

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
        if (tank.frozenEffect && tank.frozenEffect > 0) drawFrozenOverlay(ctx, tank.x, tank.y, tank.w, tank.h, tank.frozenEffect);
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
    }
    
    // Illuminat beam handled by drawUnitBeam above for all units including player

    // Draw combat drones (robot tank ultimate)
    if (typeof playerDrones !== 'undefined' && playerDrones.length > 0) {
        for (const d of playerDrones) {
            if (!d.alive) continue;
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
            if (!d.alive) continue;
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
                if (alpha > 0.3) {
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

    if (cameraTranslated) ctx.restore();

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
            ctx.fillStyle = boss.isPhase2 ? '#FF4500' : '#CC0000';
            ctx.fillRect(bx, by, bw * hpRatio, bh);
            // Gold border
            ctx.strokeStyle = boss.isPhase2 ? '#FF6600' : '#880000';
            ctx.lineWidth = 2;
            ctx.strokeRect(bx, by, bw, bh);
            // Label
            ctx.fillStyle = '#FFDDDD';
            ctx.font = 'bold 11px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(
                '👹 АДСКИЙ ТАНК  ' + Math.ceil(boss.hp) + ' / ' + boss.maxHp + (boss.isPhase2 ? '  ⚡ ЯРОСТЬ!' : ''),
                canvas.width / 2, by + bh - 3
            );
        }
    }

    // DEBUG: Ultimate status (if electric tank)
    if (gameState === 'play' && typeof tankType !== 'undefined' && tankType === 'electric') {
        ctx.fillStyle = '#ffff00'; ctx.font = '14px monospace'; ctx.textAlign = 'left';
        const debugY = 60;
        if (typeof tank !== 'undefined') {
            ctx.fillText('Ultimate: ' + (tank.isUltimateActive ? 'ACTIVE' : 'idle'), 10, debugY);
            ctx.fillText('Timer: ' + (tank.ultimateTimer || 0), 10, debugY + 20);
            ctx.fillText('Cooldown: ' + (tank.ultimateCooldown || 0), 10, debugY + 40);
            ctx.fillText('Rays: ' + (typeof electricRays !== 'undefined' ? electricRays.length : 0), 10, debugY + 60);
        }
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

    if (typeof syncResultOverlay === 'function') syncResultOverlay();

    drawPreview();
    updateCoinDisplay();
    requestAnimationFrame(draw);
}

// Ensure global access
window.draw = draw;

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
            // Deduct parts
            parts -= cost;
            localStorage.setItem('tankParts', parts);
            if (typeof updateCoinDisplay === 'function') updateCoinDisplay();
            // Store upgrade
            if (!tankUpgrades[type]) tankUpgrades[type] = {};
            tankUpgrades[type][stat] = (tankUpgrades[type][stat] || 0) + 1;
            saveTankUpgrades();
            // Always re-apply HP and speed immediately (in case player buys mid-session)
            if (typeof setTankHP    === 'function') setTankHP(type);
            if (typeof setTankSpeed === 'function') setTankSpeed(type);
            // Refresh both panels
            showTankDetail(type);
        });
    });
}
// ─────────────────────────────────────────────────────────────────────────────

// Function to show tank detail modal
function showTankDetail(tankType) {
    const modal = document.getElementById('tankDetailModal');
    const title = document.getElementById('tankDetailTitle');
    const rarity = document.getElementById('tankDetailRarity');
    const canvas = document.getElementById('tankDetailCanvas');
    const description = document.getElementById('tankDetailDescription');
    const ctx = canvas.getContext('2d');

    // Reference to the modal primary action button (style updated elsewhere)
    const tankDetailSelectBtn = document.getElementById('tankDetailSelect');

    // Set title, rarity and description
    title.textContent = tankDescriptions[tankType].name;
    const rarityText = "Редкость: " + tankDescriptions[tankType].rarity;
    let rarityColor = '#f1c40f'; // default yellow
    let glowStyle = '';
    const rarityValue = tankDescriptions[tankType].rarity;
    if (rarityValue === 'Редкий') {
        rarityColor = '#27ae60'; // green
    } else if (rarityValue === 'Эпический') {
        rarityColor = '#9b59b6'; // purple
    } else if (rarityValue === 'Сверхредкий') {
        rarityColor = '#3498db'; // blue
    } else if (rarityValue === 'Легендарный') {
        rarityColor = '#ffd700'; // gold
        glowStyle = 'text-shadow: 0 0 15px #ffd700, 0 0 30px #ffd700, 0 0 45px #ffd700;';
    } else if (rarityValue === 'Мифический') {
        rarityColor = '#e91e63'; // pink
        glowStyle = 'text-shadow: 0 0 15px #e91e63, 0 0 30px #e91e63, 0 0 45px #e91e63;';
    } else if (rarityValue === 'Хроматическая') {
        rarityColor = '#00ffcc';
        glowStyle = 'text-shadow: 0 0 10px #00ffcc, 0 0 20px #00ffcc, 0 0 30px #00ffcc;';
    }
    rarity.innerHTML = `<span style="color:${rarityColor}; ${glowStyle}">${rarityText}</span>`;
    description.textContent = tankDescriptions[tankType].description;

    // Trio badge
    const trioEl = document.getElementById('tankDetailTrio');
    if (trioEl) {
        const trio = tankTrios[tankType];
        if (trio) {
            const c = trio.color;
            // Build member chips: emoji + short name, highlight current tank, gray out locked tanks
            const chips = trio.members.map(([mType, mIcon]) => {
                const mName = tankDescriptions[mType] ? tankDescriptions[mType].name : mType;
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

    // Fill stats block (with inline upgrade buttons)
    const statsEl = document.getElementById('tankDetailStats');
    if (statsEl) {
        const hpBase = (typeof tankMaxHpByType !== 'undefined' && tankMaxHpByType[tankType]) || 300;
        const spdBase = (typeof tankMaxSpeedByType !== 'undefined' && tankMaxSpeedByType[tankType]) || 3.2;
        const hpLvl   = (typeof getTankUpgrade === 'function') ? getTankUpgrade(tankType, 'hp')  : 0;
        const spdLvl  = (typeof getTankUpgrade === 'function') ? getTankUpgrade(tankType, 'spd') : 0;
        const dmgLvl  = (typeof getTankUpgrade === 'function') ? getTankUpgrade(tankType, 'dmg') : 0;
        const hp  = hpBase  + hpLvl  * 50;
        // per-type maximum (base + full upgrades)
        const hpMaxPossible = (tankMaxHpByType[tankType] || 300) + (UPGRADE_MAX * 50);
        const hpStars  = Math.min(10, Math.round((hp / hpMaxPossible) * 10));
        // speed current and per-type max
        let spdBonus = 0;
        if (typeof getTankSpeedBonus === 'function') {
            spdBonus = getTankSpeedBonus(tankType);
        } else {
            const _incs = [0.2, 0.2, 0.3];
            for (let _i = 0; _i < spdLvl; _i++) spdBonus += (_incs[_i] || 0);
        }
        const spd = parseFloat((spdBase + spdBonus).toFixed(1));
        const spdMaxPossible = (tankMaxSpeedByType[tankType] || 3.2) + (typeof SPEED_INCREMENTS !== 'undefined' ? SPEED_INCREMENTS.reduce((a,b)=>a+b,0) : 0.7);
        const spdStars = Math.min(10, Math.round((spd / spdMaxPossible) * 10));
        const bar = (val, max = 10) => {
            const filled = Math.min(val, max);
            return '█'.repeat(filled) + '░'.repeat(max - filled);
        };
        const tankDamageByType = {
            normal: 100, ice: 100, fire: 22, buratino: 200, toxic: 100,
            plasma: 350, musical: 200, waterjet: 1.5, illuminat: 3,
            mirror: 100, time: 100, machinegun: 20, buckshot: 125, imitator: 200, electric: 150, robot: 75, medical: 75, mine: 150, roman: 200
        };
        const dmgRaw   = tankDamageByType[tankType] || 100;
        // Use multiplier table if present, compute raw (float) boosted damage
        const dmgMultAtLvl = (typeof DMG_MULT_TABLE !== 'undefined') ? DMG_MULT_TABLE[dmgLvl] : (1 + dmgLvl*0.1);
        const dmgMultMax = (typeof DMG_MULT_TABLE !== 'undefined') ? DMG_MULT_TABLE[UPGRADE_MAX] : 1.6;
        const dmgBoostedRaw = dmgRaw * dmgMultAtLvl; // float value (not rounded) used for relative calculations
        const dmgMaxPossible = dmgRaw * dmgMultMax;

        // Prepare displayed values: for continuous/tick weapons (waterjet, illuminat) show per-second values in the modal
        let displayDmgBoosted = Math.round(dmgBoostedRaw);
        let displayDmgMaxPossible = dmgMaxPossible;
        let displayDmgNote  = { buckshot: ' ×5', waterjet: '/тик', illuminat: '/тик', machinegun: '/пул.' }[tankType] || '';
        if (tankType === 'waterjet' || tankType === 'illuminat') {
            // convert tick-based damage to per-second for display (60 ticks = 1s)
            displayDmgBoosted = Math.round(dmgBoostedRaw * 60);
            displayDmgMaxPossible = dmgMaxPossible * 60;
            displayDmgNote = '/сек';
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
        // For the progress bar, compare displayed values so bars match what the user sees
        const dmgPct = Math.round((displayDmgBoosted / Math.max(1, displayDmgMaxPossible)) * 100);
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
            </div>`;

        // Attach buy-button listeners inside statsEl
        statsEl.querySelectorAll('.upgrade-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const type = btn.dataset.type;
                const stat = btn.dataset.stat;
                const cost = parseInt(btn.dataset.cost) || 0;
                if (typeof parts === 'undefined' || parts < cost) return;
                // Deduct parts
                parts -= cost;
                localStorage.setItem('tankParts', parts);
                if (typeof updateCoinDisplay === 'function') updateCoinDisplay();
                // Store upgrade
                if (!tankUpgrades[type]) tankUpgrades[type] = {};
                tankUpgrades[type][stat] = (tankUpgrades[type][stat] || 0) + 1;
                saveTankUpgrades();
                // Always re-apply HP and speed immediately (in case player buys mid-session)
                if (typeof setTankHP    === 'function') setTankHP(type);
                if (typeof setTankSpeed === 'function') setTankSpeed(type);
                // Refresh modal
                showTankDetail(type);
            });
        });
    }

    // Draw background: normal uses single grass color, others use rarity gradient
    if (tankType === 'normal') {
        const grass = (tankBgGradients && tankBgGradients.normal && tankBgGradients.normal[1]) ? tankBgGradients.normal[1] : '#228B22';
        ctx.fillStyle = grass;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    } else if (tankType === 'time' || tankType === 'imitator' || tankType === 'roman') {
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
    } else if (tankBgGradients && tankBgGradients[tankType]) {
        const bg = tankBgGradients[tankType];
        const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
        grad.addColorStop(0, bg[0]);
        grad.addColorStop(1, bg[1]);
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const side = Math.min(canvas.width, canvas.height) / 2;
        const baseColor = (tankBaseColors && tankBaseColors[tankType]) ? tankBaseColors[tankType] : '#000000';
        drawTankOn(ctx, canvas.width / 2, canvas.height / 2, side, side, baseColor, 0, 1, tankType);

        modal.style.display = 'flex';
        return;
    } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    if (tankType !== 'time') {
        const side = Math.min(canvas.width, canvas.height) / 2;
        const baseColor = (tankBaseColors && tankBaseColors[tankType]) ? tankBaseColors[tankType] : '#000000';
        drawTankOn(ctx, canvas.width / 2, canvas.height / 2, side, side, baseColor, 0, 1, tankType);
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
