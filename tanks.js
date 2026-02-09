
// --- VISUALS & ABILITIES --- //

// Tank descriptions for detail modal
const tankDescriptions = {
    normal: {
        name: "Стандартный танк",
        description: "Базовый танк с обычными снарядами. Имеет стандартные характеристики: 3 HP, обычная стрельба с перезарядкой.",
        rarity: "Обычный"
    },
    ice: {
        name: "Ледяной танк",
        description: "Стреляет ледяными снарядами, которые замораживают врагов. Обычные характеристики: 3 HP, замораживающая стрельба.",
        rarity: "Редкий"
    },
    fire: {
        name: "Огненный танк",
        description: "Усиленный танк с 6 HP. Стреляет обычными снарядами, но имеет повышенную живучесть.",
        rarity: "Сверхредкий"
    },
    toxic: {
        name: "Токсичный танк",
        description: "Имеет специальную способность Mega Gas (клавиша E) - бросает мощную бомбу один раз за бой. Обычные характеристики: 3 HP.",
        rarity: "Легендарный"
    },
    plasma: {
        name: "Плазменный танк",
        description: "Имеет специальную способность Plasma Blast (клавиша E) - мощный выстрел, пробивающий стены, до 2 раз за бой. Обычные характеристики: 3 HP.",
        rarity: "Мифический"
    },
    buratino: {
        name: "Буратино",
        description: "Тяжелая огнеметная система. Запускает залп из 6 зажигательных ракет. Очень мощный, но медленный.",
        rarity: "Экзотический"
    }
};

// Make available globally
window.tankDescriptions = tankDescriptions;

// Preview canvas global access (defined in main.js, used here)

function drawTankOn(ctx, cx, cy, W, H, color, turretAngle, turretScale = 1, type = 'normal') {
    ctx.save();
    ctx.translate(cx, cy);
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
    } else {
        // Default
        ctx.fillStyle = color;
        ctx.fillRect(-bodyW/2, -bodyH/2, bodyW, bodyH);
    }
    // hatch outline
    ctx.strokeStyle = 'rgba(0,0,0,0.25)'; ctx.strokeRect(-W*0.12, -H*0.12, W*0.24, H*0.24);
    // turret
    ctx.rotate(turretAngle || 0);
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
        } else {
            // Standard Cannon
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
            ctx.strokeStyle = 'gold';
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

    drawItem(normalTankCtx, normalTankPreview, 'normal', '#0000FF', ['white', 'lightgray']);
    drawItem(iceTankCtx, iceTankPreview, 'ice', '#54d1e8', ['green', 'lightgreen']);
    drawItem(fireTankCtx, fireTankPreview, 'fire', '#4c00ff', ['blue', 'lightblue']);
    drawItem(buratinoTankCtx, buratinoTankPreview, 'buratino', '#0000FF', ['purple', 'magenta']);
    drawItem(toxicTankCtx, toxicTankPreview, 'toxic', '#0000FF', ['yellow', 'lightyellow']);
    drawItem(plasmaTankCtx, plasmaTankPreview, 'plasma', '#0000FF', ['red', 'lightcoral']);
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
            ctx.globalAlpha = obj.life / 30;
            ctx.fillStyle = obj.color;
            ctx.beginPath();
            ctx.arc(obj.x, obj.y, obj.radius * (1 - obj.life / 30), 0, Math.PI * 2);
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
        const maxAllyHp = (a.tankType === 'fire') ? 6 : 3;
        const missingHp = maxAllyHp - a.hp;
        if (missingHp > 0) {
            ctx.fillRect(a.x + a.w * (a.hp / maxAllyHp), a.y - 10, a.w * (missingHp / maxAllyHp), 5);
        }
    });

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
        const maxHp = (enemy.tankType === 'fire') ? 6 : 3;
        const missingHp = maxHp - enemy.hp;
        if (missingHp > 0) {
            ctx.fillRect(enemy.x + enemy.w * (enemy.hp / maxHp), enemy.y - 10, enemy.w * (missingHp / maxHp), 5);
        }
    });

    // 5. Танк
    if (tank.alive !== false) {
        ctx.save();
        ctx.translate(tank.x + tank.w/2, tank.y + tank.h/2);
        drawTankOn(ctx, 0, 0, tank.w, tank.h, tank.color, tank.turretAngle, 1, tankType);
        ctx.restore();
        if (tank.frozenEffect && tank.frozenEffect > 0) drawFrozenOverlay(ctx, tank.x, tank.y, tank.w, tank.h, tank.frozenEffect);
        ctx.fillStyle = 'green';
        ctx.fillRect(tank.x, tank.y - 10, tank.w, 5);
        ctx.fillStyle = 'black';
        const maxTankHp = (tankType === 'fire') ? 6 : 3;
        const missingHp = maxTankHp - tank.hp;
        if (missingHp > 0) {
            ctx.fillRect(tank.x + tank.w * (tank.hp / maxTankHp), tank.y - 10, tank.w * (missingHp / maxTankHp), 5);
        }
    }
    if (cameraTranslated) ctx.restore();

    if (tank.alive === false && currentMode === 'war' && tank.respawnTimer > 0 && gameState !== 'lose') {
        ctx.fillStyle = 'white'; ctx.font = '18px Arial'; ctx.textAlign = 'center';
        ctx.fillText('Respawn in ' + Math.ceil(tank.respawnTimer / 60) + 's', canvas.width/2, 40);
    }

    if (gameState === 'menu') {
        ctx.fillStyle = 'rgba(0,0,0,0.6)';
        ctx.fillRect(0,0,canvas.width, canvas.height);
    } else if (gameState === 'win') {
        ctx.fillStyle = 'rgba(0,0,0,0.7)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'white';
        ctx.font = '48px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('YOU WIN!', canvas.width / 2, canvas.height / 2);
        ctx.font = '24px Arial';
        ctx.fillText('Press SPACE to restart', canvas.width / 2, canvas.height / 2 + 50);
    } else if (gameState === 'lose') {
        ctx.fillStyle = 'rgba(0,0,0,0.7)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'white';
        ctx.font = '48px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('YOU LOSE!', canvas.width / 2, canvas.height / 2);
        ctx.font = '24px Arial';
        ctx.fillText('Press SPACE to restart', canvas.width / 2, canvas.height / 2 + 50);
    }

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
    }
    rarity.innerHTML = `<span style="color:${rarityColor}; ${glowStyle}">${rarityText}</span>`;
    description.textContent = tankDescriptions[tankType].description;

    // Clear and draw tank on canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawTankOn(ctx, canvas.width / 2, canvas.height / 2, 150, 100, '#fff', 0, 1, tankType);

    // Show modal
    modal.style.display = 'flex';
}

// Function to hide tank detail modal
function hideTankDetail() {
    const modal = document.getElementById('tankDetailModal');
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
