
// --- VISUALS & ABILITIES --- //

// Tank descriptions for detail modal
const tankDescriptions = {
    normal: {
        name: "Стандартный танк",
        description: "Классическая боевая машина. Сбалансированные характеристики, стандартная 120мм пушка. Идеален для новичков.",
        rarity: "Обычный"
    },
    ice: {
        name: "Ледяной танк",
        description: "Стреляет криогенными осколками, замедляющими врагов. Замораживание делает противников легкой мишенью.",
        rarity: "Редкий"
    },
    fire: {
        name: "Огненный танк",
        description: "Оснащен мощным огнеметом вместо пушки. Сжигает врагов в ближнем бою. Имеет повышенный запас прочности (6 HP).",
        rarity: "Сверхредкий"
    },
    toxic: {
        name: "Токсичный танк",
        description: "Запускает канистры с ядовитым газом, создающие опасные зоны. Газ наносит урон всем, кто в нем находится.",
        rarity: "Легендарный"
    },
    plasma: {
        name: "Плазменный танк",
        description: "Стреляет высокоэнергетическими плазменными болтами, пробивающими врагов насквозь. Огромный урон, но долгая перезарядка.",
        rarity: "Мифический"
    },
    buratino: {
        name: "Буратино (ТОС)",
        description: "Тяжелая огнеметная система. Запускает залп из 6 неуправляемых ракет по площадям. Медленный, но разрушительный.",
        rarity: "Эпический"
    },
    musical: {
        name: "Музыкальный танк",
        description: "Использует звуковые волны, которые рикошетят от стен и дезориентируют врагов. Волна расширяется с расстоянием.",
        rarity: "Эпический"
    },
    illuminat: {
        name: "👁 Иллюминат",
        description: "Мистическая сущность. Атакует непрерывным лучом. Способность 'Инверсия Управления' (E) заставляет врагов двигаться в обратную сторону в течение 2 секунд.",
        rarity: "Мифический"
    },
    mirror: {
        name: "🪞 Зеркальный",
        description: "Мастер адаптации. Копирует тип снарядов противника при получении урона. Способность 'Зеркальный щит' (клавиша E) отражает любые атаки обратно во врага.",
        rarity: "Легендарный"
    },
    time: {
        name: "⏳ Временной",
        description: "Повелитель времени. Способность 'Временная Петля' (E) мгновенно возвращает танк в состояние 5 секунд назад. Кулдаун 8 сек.",
        rarity: "Хроматическая"
    }
};

// Background gradients for tank previews (menu & modal)
// Colors follow user mapping: Обычный=grass, Редкий=green, Сверхредкий=blue,
// Эпический=purple, Легендарный=yellow, Мифический=red
const tankBgGradients = {
    normal: ['#1b5e20', '#1b5e20'],   // Обычный - dark grass green (menu & modal)
    ice: ['#2ecc71', '#27ae60'],      // Редкий - green
    fire: ['#3498db', '#5dade2'],     // Сверхредкий - blue
    buratino: ['#9b59b6', '#8e44ad'], // Эпический - purple
    toxic: ['#fff9c4', '#fff176'],    // Легендарный - pale yellow
    plasma: ['#ff6b6b', '#e74c3c'],   // Мифический - red
    musical: ['#9b59b6', '#8e44ad'],  // Эпический - purple
    illuminat: ['#ff6b6b', '#e74c3c'],// Мифический - red
    mirror: ['#fff9c4', '#fff176'],   // Легендарный - pale yellow
    time: ['rgba(0,0,0,0)', 'rgba(0,0,0,0)'] // Хроматическая - transparent for CSS anim
};

// Base colors used in preview rendering (keeps menu and modal consistent)
const tankBaseColors = {
    normal: '#0000FF',
    ice: '#54d1e8',
    fire: '#4c00ff',
    buratino: '#0000FF',
    toxic: '#0000FF',
    plasma: '#0000FF',
    musical: '#0000FF',
    illuminat: '#0000FF',
    mirror: '#0000FF',
    time: '#FF00FF'
};

// Make available globally
window.tankDescriptions = tankDescriptions;
window.tankBgGradients = tankBgGradients;

// Preview canvas global access (defined in main.js, used here)

function drawTankOn(ctx, cx, cy, W, H, color, turretAngle, turretScale = 1, type = 'normal') {
    ctx.save();
    ctx.translate(cx, cy);

    // Special Case: Illuminat (Floating Pyramid - No Tracks/Chassis)
    if (type === 'illuminat') {
         // See turret section for actual drawing
         // We do nothing here for body/tracks because the pyramid IS the body and turret united.
    } else {
        if (type === 'fire') {
            W *= 1.2; // make wider
        } else if (type === 'buratino') {
            W *= 1.1; // make longer
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

    } else if (type === 'plasma') {
        // Handled below
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
    drawItem(iceTankCtx, iceTankPreview, 'ice', '#54d1e8', tankBgGradients.ice);
    drawItem(fireTankCtx, fireTankPreview, 'fire', '#4c00ff', tankBgGradients.fire);
    drawItem(buratinoTankCtx, buratinoTankPreview, 'buratino', '#0000FF', tankBgGradients.buratino);
    drawItem(toxicTankCtx, toxicTankPreview, 'toxic', '#0000FF', tankBgGradients.toxic);
    drawItem(plasmaTankCtx, plasmaTankPreview, 'plasma', '#0000FF', tankBgGradients.plasma);
    drawItem(musicalTankCtx, musicalTankPreview, 'musical', '#0000FF', tankBgGradients.musical);
    drawItem(illuminatTankCtx, illuminatTankPreview, 'illuminat', '#0000FF', tankBgGradients.illuminat);
    drawItem(mirrorTankCtx, mirrorTankPreview, 'mirror', '#0000FF', tankBgGradients.mirror);

    // Time Tank Animation Logic
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
        const alpha = Math.max(0, p.life);
        ctx.fillStyle = p.color || `rgba(139, 69, 19, ${alpha})`;
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
            const progress = 1 - (obj.life / maxLife);
            // Ensure radius is positive and alpha valid
            const r = Math.max(0, obj.radius * progress);
            const alpha = Math.min(1, Math.max(0, obj.life / maxLife));
            
            ctx.globalAlpha = alpha;
            ctx.fillStyle = obj.color;
            ctx.beginPath();
            ctx.arc(obj.x, obj.y, r, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalAlpha = 1;
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
                if (currentMode !== 'war' || particles.length < 150) {
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
            if (Math.random() > 0.5 && (currentMode !== 'war' || particles.length < 150)) {
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
            if (Math.random() > 0.8 && (typeof currentMode === 'undefined' || currentMode !== 'war' || particles.length < 150)) {
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
            if (Math.random() > 0.6 && (typeof currentMode === 'undefined' || currentMode !== 'war' || particles.length < 150)) {
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
            if (Math.random() > 0.7 && (typeof currentMode === 'undefined' || currentMode !== 'war' || particles.length < 150)) {
                  particles.push({
                    x: b.x - b.vx*0.5 + (Math.random()-0.5)*2, 
                    y: b.y - b.vy*0.5 + (Math.random()-0.5)*2, 
                    life: 0.4, 
                    size: 1.5,
                    color: '#ffffff', // white sparkle
                    vx: 0, vy: 0
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

    // 3.5.5. Звуковые волны
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
        if (!isVisible(f.x, f.y, 4, 4)) return;
        const r = 4;
        const grad = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, r);
        grad.addColorStop(0, 'rgba(255, 230, 100, 1)');
        grad.addColorStop(0.5, 'rgba(255, 100, 0, 0.7)');
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
        drawTankOn(ctx, 0, 0, a.w, a.h, a.color || '#888', a.turretAngle || 0, 1, a.tankType || 'normal');
        ctx.restore();
        if (a.frozenEffect && a.frozenEffect > 0) drawFrozenOverlay(ctx, a.x, a.y, a.w, a.h, a.frozenEffect);
        ctx.fillStyle = 'blue';
        ctx.fillRect(a.x, a.y - 10, a.w, 5);
        ctx.fillStyle = 'black';
        const maxAllyHp = (a.tankType === 'fire') ? 6 : (a.tankType === 'musical') ? 4 : (a.tankType === 'illuminat') ? 3 : 3;
        const missingHp = maxAllyHp - a.hp;
        if (missingHp > 0) {
            ctx.fillRect(a.x + a.w * (a.hp / maxAllyHp), a.y - 10, a.w * (missingHp / maxAllyHp), 5);
        }
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

    enemies.forEach(enemy => {
        if (!enemy || !enemy.alive || !isVisible(enemy.x, enemy.y, enemy.w, enemy.h)) return;
        ctx.save();
        ctx.translate(enemy.x + enemy.w/2, enemy.y + enemy.h/2);
        drawTankOn(ctx, 0, 0, enemy.w, enemy.h, enemy.paralyzed ? '#00FFFF' : (enemy.color || '#B22222'), enemy.turretAngle || 0, 1, enemy.tankType || 'normal');
        ctx.restore();
        if (enemy.frozenEffect && enemy.frozenEffect > 0) drawFrozenOverlay(ctx, enemy.x, enemy.y, enemy.w, enemy.h, enemy.frozenEffect);
        ctx.fillStyle = 'red';
        ctx.fillRect(enemy.x, enemy.y - 10, enemy.w, 5);
        ctx.fillStyle = 'black';
        const maxHp = (enemy.tankType === 'fire') ? 6 : (enemy.tankType === 'musical') ? 4 : (enemy.tankType === 'illuminat') ? 3 : 3;
        const missingHp = maxHp - enemy.hp;
        if (missingHp > 0) {
            ctx.fillRect(enemy.x + enemy.w * (enemy.hp / maxHp), enemy.y - 10, enemy.w * (missingHp / maxHp), 5);
        }
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

        drawTankOn(ctx, 0, 0, tank.w, tank.h, tank.color, tank.turretAngle, 1, tankType);
        ctx.restore();
        if (tank.frozenEffect && tank.frozenEffect > 0) drawFrozenOverlay(ctx, tank.x, tank.y, tank.w, tank.h, tank.frozenEffect);
        ctx.fillStyle = 'green';
        ctx.fillRect(tank.x, tank.y - 10, tank.w, 5);
        ctx.fillStyle = 'black';
        const maxTankHp = (tankType === 'fire') ? 6 : (tankType === 'musical') ? 4 : (tankType === 'illuminat') ? 3 : 3;
        const missingHp = maxTankHp - tank.hp;
        if (missingHp > 0) {
            ctx.fillRect(tank.x + tank.w * (tank.hp / maxTankHp), tank.y - 10, tank.w * (missingHp / maxTankHp), 5);
        }
    }
    
    // Illuminat beam handled by drawUnitBeam above for all units including player
    
    if (cameraTranslated) ctx.restore();

    if (tank.alive === false && currentMode === 'war' && tank.respawnTimer > 0 && gameState !== 'lose') {
        ctx.fillStyle = 'white'; ctx.font = '18px Arial'; ctx.textAlign = 'center';
        ctx.fillText('Respawn in ' + Math.ceil(tank.respawnTimer / 60) + 's', canvas.width/2, 40);
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

// Function to show tank detail modal
function showTankDetail(tankType) {
    const modal = document.getElementById('tankDetailModal');
    const title = document.getElementById('tankDetailTitle');
    const rarity = document.getElementById('tankDetailRarity');
    const canvas = document.getElementById('tankDetailCanvas');
    const description = document.getElementById('tankDetailDescription');
    const ctx = canvas.getContext('2d');

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

    // Draw background: normal uses single grass color, others use rarity gradient
    if (tankType === 'normal') {
        const grass = (tankBgGradients && tankBgGradients.normal && tankBgGradients.normal[1]) ? tankBgGradients.normal[1] : '#228B22';
        ctx.fillStyle = grass;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    } else if (tankType === 'time') {
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
