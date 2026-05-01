// ─── mechs.js ────────────────────────────────────────────────────────────────
// Dedicated renderer for mech-type units.
// Exports: drawMechOn(ctx, cx, cy, W, H, turretAngle, mechType)
//          drawMechBullet(ctx, b)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Draws the "Штурмовой мех" (mechDiy) unit centred at (cx, cy).
 * Top-down visually strictly from above, removing the side-view legs.
 * Entire unit rotates towards the turretAngle to face its cannons.
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} cx - centre x (world space)
 * @param {number} cy - centre y (world space)
 * @param {number} W  - bounding width
 * @param {number} H  - bounding height
 * @param {number} turretAngle - radians, direction the mech faces
 * @param {string} mechType    - e.g. 'mechDiy'
 */
function drawMechOn(ctx, cx, cy, W, H, turretAngle, mechType, moveAnimation = 0) {
    if (mechType !== 'mechDiy') return;

    const s = Math.min(W, H);
    const now = Date.now();

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(turretAngle);

    // Dynamic scale/pulse effects
    const pulse = Math.sin(now * 0.005) * 0.5 + 0.5;
    // Movement animation: bobbing/walking motion
    const moveWave = Math.sin(now * 0.008) * moveAnimation;

    // ── SHADOW ─────────────────────────────────────────────────────────────
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.beginPath();
    ctx.roundRect(-s*0.45, -s*0.4 + moveWave, s*0.9, s*0.8, 8);
    ctx.fill();

    // ── ARM JOINTS / ACTUATORS ─────────────────────────────────────────────
    ctx.fillStyle = '#111';
    ctx.strokeStyle = '#2d3330';
    ctx.lineWidth = 2;
    // Left actuator with movement bob
    ctx.beginPath();
    ctx.arc(-s*0.1, -s*0.45 + moveWave * 0.3, s*0.18, 0, Math.PI*2);
    ctx.fill(); ctx.stroke();
    // Right actuator with movement bob (opposite phase)
    ctx.beginPath();
    ctx.arc(-s*0.1, s*0.45 - moveWave * 0.3, s*0.18, 0, Math.PI*2);
    ctx.fill(); ctx.stroke();

    // Pivot bolts
    ctx.fillStyle = '#44554c';
    ctx.beginPath(); ctx.arc(-s*0.1, -s*0.45, s*0.06, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(-s*0.1, s*0.45, s*0.06, 0, Math.PI*2); ctx.fill();

    // ── HEAVY CANNONS ──────────────────────────────────────────────────────
    const armLen = s * 0.65;
    const armW = s * 0.16;
    const armX = -s * 0.1;
    
    // Left Cannon
    const ly = -s * 0.45 - armW/2;
    const cannonGrad = ctx.createLinearGradient(armX, ly, armX + armLen, ly + armW);
    cannonGrad.addColorStop(0, '#1c2826');
    cannonGrad.addColorStop(0.5, '#44554c');
    cannonGrad.addColorStop(1, '#1c2826');

    ctx.fillStyle = cannonGrad;
    ctx.fillRect(armX, ly, armLen, armW);
    // Vents / Heat sinks
    ctx.fillStyle = '#0a0d0a';
    for(let i=0; i<4; i++) {
        ctx.fillRect(armX + armLen*0.3 + i*(armLen*0.15), ly-1, armLen*0.08, armW+2);
    }
    // Muzzle block
    ctx.fillStyle = '#0f1714';
    ctx.fillRect(armX + armLen, ly - armW*0.1, s*0.12, armW*1.2);
    // Cyan Energy glow inside muzzle
    ctx.shadowBlur = 10; ctx.shadowColor = '#00e5ff';
    ctx.fillStyle = '#00e5ff';
    ctx.fillRect(armX + armLen + s*0.08, ly + armW*0.2, s*0.05, armW*0.6);
    ctx.shadowBlur = 0;

    // Right Cannon
    const ry = s * 0.45 - armW/2;
    ctx.fillStyle = cannonGrad;
    ctx.fillRect(armX, ry, armLen, armW);
    ctx.fillStyle = '#0a0d0a';
    for(let i=0; i<4; i++) {
        ctx.fillRect(armX + armLen*0.3 + i*(armLen*0.15), ry-1, armLen*0.08, armW+2);
    }
    ctx.fillStyle = '#0f1714';
    ctx.fillRect(armX + armLen, ry - armW*0.1, s*0.12, armW*1.2);
    ctx.shadowBlur = 10; ctx.shadowColor = '#00e5ff';
    ctx.fillStyle = '#00e5ff';
    ctx.fillRect(armX + armLen + s*0.08, ry + armW*0.2, s*0.05, armW*0.6);
    ctx.shadowBlur = 0;
    
    // Energy cables feeding into weapons
    ctx.strokeStyle = '#007a88';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-s*0.15, -s*0.15); // Torso source
    ctx.bezierCurveTo(-s*0.25, -s*0.35, 0, -s*0.45, s*0.1, -s*0.45);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-s*0.15, s*0.15);
    ctx.bezierCurveTo(-s*0.25, s*0.35, 0, s*0.45, s*0.1, s*0.45);
    ctx.stroke();

    // ── MAIN HULL / TORSO CHASSIS ──────────────────────────────────────────
    // Exhausts at the rear
    ctx.fillStyle = '#111';
    ctx.fillRect(-s*0.42, -s*0.15, s*0.1, s*0.3);
    // Glowing exhaust heat
    ctx.fillStyle = `rgba(0, 229, 255, ${0.4 + 0.3 * pulse})`;
    ctx.fillRect(-s*0.45, -s*0.12, s*0.06, s*0.24);

    // Main armor block shape
    ctx.beginPath();
    ctx.moveTo(-s*0.35, -s*0.25);
    ctx.lineTo(s*0.2, -s*0.30);
    ctx.lineTo(s*0.35, -s*0.15);
    ctx.lineTo(s*0.35, s*0.15);
    ctx.lineTo(s*0.2, s*0.30);
    ctx.lineTo(-s*0.35, s*0.25);
    ctx.closePath();

    const hullGrad = ctx.createLinearGradient(-s*0.35, -s*0.25, s*0.35, s*0.25);
    hullGrad.addColorStop(0, '#155c3c');
    hullGrad.addColorStop(0.5, '#2ecc71');
    hullGrad.addColorStop(1, '#0e4a28');

    ctx.fillStyle = hullGrad;
    ctx.fill();
    ctx.strokeStyle = '#082613';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Hull armor plates details (lines)
    ctx.strokeStyle = 'rgba(0,0,0,0.3)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(-s*0.1, -s*0.28);
    ctx.lineTo(-s*0.1, s*0.28);
    ctx.moveTo(s*0.1, -s*0.22);
    ctx.lineTo(s*0.1, s*0.22);
    ctx.stroke();

    // Heavy front bumper
    ctx.fillStyle = '#1e2420';
    ctx.beginPath();
    ctx.moveTo(s*0.25, -s*0.18);
    ctx.lineTo(s*0.42, -s*0.12);
    ctx.lineTo(s*0.42, s*0.12);
    ctx.lineTo(s*0.25, s*0.18);
    ctx.closePath();
    ctx.fill(); ctx.stroke();

    // ── CENTRAL ENERGY REACTOR ─────────────────────────────────────────────
    const reactorX = -s*0.05;
    const reactorY = 0;
    
    // Outer reactor ring
    ctx.fillStyle = '#0d1a13';
    ctx.beginPath(); ctx.arc(reactorX, reactorY, s*0.16, 0, Math.PI*2); ctx.fill(); ctx.stroke();
    
    // Inner pulse
    ctx.shadowBlur = 12; ctx.shadowColor = '#00e5ff';
    const coreGrad = ctx.createRadialGradient(reactorX, reactorY, 0, reactorX, reactorY, s*0.12);
    coreGrad.addColorStop(0, '#ffffff');
    coreGrad.addColorStop(0.3, '#baffff');
    coreGrad.addColorStop(1, '#00b8cc');
    
    // Animate reactor core scale
    const coreScale = s * (0.08 + 0.04 * pulse);
    ctx.fillStyle = coreGrad;
    ctx.beginPath(); ctx.arc(reactorX, reactorY, coreScale, 0, Math.PI*2); ctx.fill();
    ctx.shadowBlur = 0;

    // Metal spokes over the reactor
    ctx.strokeStyle = '#222';
    ctx.lineWidth = 2;
    for(let i=0; i<3; i++) {
        const ang = (i * Math.PI*2) / 3 + now * 0.001; // Slow rotation
        ctx.beginPath();
        ctx.moveTo(reactorX, reactorY);
        ctx.lineTo(reactorX + Math.cos(ang) * s*0.16, reactorY + Math.sin(ang) * s*0.16);
        ctx.stroke();
    }

    ctx.restore();
}

/**
 * Draws a single mechDiy projectile at (b.x, b.y).
 * Appearance: a compact energy slug — green glowing diamond with a short neon trail.
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {{ x:number, y:number, vx:number, vy:number, w:number, h:number }} b
 */
function drawMechBullet(ctx, b) {
    const r = (b.w || 10) / 2;
    const t = Date.now() * 0.006;
    const ang = Math.atan2(b.vy, b.vx);

    // Trail — short neon green streak behind the bullet
    const trailLen = r * 5.5;
    const tx = b.x - Math.cos(ang) * trailLen;
    const ty = b.y - Math.sin(ang) * trailLen;
    const trailGrad = ctx.createLinearGradient(tx, ty, b.x, b.y);
    trailGrad.addColorStop(0,   'rgba(0,255,100,0)');
    trailGrad.addColorStop(0.5, 'rgba(0,255,100,0.22)');
    trailGrad.addColorStop(1,   'rgba(140,255,180,0.60)');
    ctx.strokeStyle = trailGrad;
    ctx.lineWidth = r * 1.6;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(tx, ty);
    ctx.lineTo(b.x, b.y);
    ctx.stroke();

    // Additive glow halo
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    const haloGrad = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, r * 2.8);
    haloGrad.addColorStop(0,   'rgba(0,255,120,0.30)');
    haloGrad.addColorStop(0.5, 'rgba(0,200,80,0.12)');
    haloGrad.addColorStop(1,   'rgba(0,120,40,0)');
    ctx.fillStyle = haloGrad;
    ctx.beginPath(); ctx.arc(b.x, b.y, r * 2.8, 0, Math.PI * 2); ctx.fill();
    ctx.restore();

    // Diamond (rotated square) core
    ctx.save();
    ctx.translate(b.x, b.y);
    ctx.rotate(Math.PI / 4 + t * 2.5);  // slowly spinning diamond

    const dSize = r * 0.85;
    const coreGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, dSize * 1.4);
    coreGrad.addColorStop(0,   '#eafff0');
    coreGrad.addColorStop(0.3, '#00ff88');
    coreGrad.addColorStop(0.75, '#00b050');
    coreGrad.addColorStop(1,   '#003d18');

    ctx.fillStyle = coreGrad;
    ctx.shadowColor = '#00ff88';
    ctx.shadowBlur = 10;
    ctx.fillRect(-dSize, -dSize, dSize * 2, dSize * 2);
    ctx.shadowBlur = 0;

    // Inner bright centre
    ctx.fillStyle = 'rgba(255,255,255,0.90)';
    ctx.fillRect(-dSize * 0.28, -dSize * 0.28, dSize * 0.56, dSize * 0.56);

    ctx.restore();
}

// ── Preview: draw mechDiy in the character select preview canvas ──────────────
/**
 * Draws the mech preview (animated with movement) into a canvas element.
 * Called from drawCharacterPreviews() in tanks.js .
 */
function drawMechDiyPreview(canvasEl, isUnlocked) {
    if (!canvasEl) return;
    const ctx = canvasEl.getContext('2d');
    if (!ctx) return;
    
    // Cancel any existing animation
    if (window.mechDiyAnimId) cancelAnimationFrame(window.mechDiyAnimId);
    
    const W = canvasEl.width;
    const H = canvasEl.height;
    
    // Animation loop
    const drawFrame = () => {
        ctx.clearRect(0, 0, W, H);

        // Background gradient (green rarity)
        if (isUnlocked) {
            const bg = ctx.createLinearGradient(0, 0, 0, H);
            bg.addColorStop(0, '#2ecc71');
            bg.addColorStop(1, '#27ae60');
            ctx.fillStyle = bg;
        } else {
            ctx.fillStyle = '#333';
        }
        ctx.fillRect(0, 0, W, H);

        // Draw mech facing right with movement animation
        const side = Math.min(W, H) * 0.58;
        ctx.save();
        if (!isUnlocked) ctx.filter = 'grayscale(100%) contrast(0.8)';
        // Add movement animation parameter (0.5 = subtle up/down bob)
        drawMechOn(ctx, W / 2, H / 2, side, side, 0, 'mechDiy', 0.5);
        ctx.restore();

        // Trophy counter
        if (isUnlocked && typeof getTankTrophies === 'function') {
            const tw = getTankTrophies('mechDiy');
            if (tw > 0) {
                ctx.fillStyle = 'rgba(0,0,0,0.6)';
                ctx.fillRect(0, H - 24, W, 24);
                ctx.fillStyle = '#e67e22';
                ctx.font = 'bold 14px Arial';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText('🏆 ' + tw, W / 2, H - 12);
            }
        }

        // Selection border or lock
        if (isUnlocked && typeof window.getCurrentTankType === 'function' && window.getCurrentTankType() === 'mechDiy') {
            ctx.strokeStyle = 'white';
            ctx.lineWidth = 4;
            ctx.strokeRect(2, 2, W - 4, H - 4);
        } else if (!isUnlocked) {
            ctx.fillStyle = 'rgba(0,0,0,0.5)';
            ctx.fillRect(0, 0, W, H);
            ctx.font = '40px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = '#fff';
            ctx.fillText('🔒', W / 2, H / 2);
        }
        
        // Continue animation loop
        window.mechDiyAnimId = requestAnimationFrame(drawFrame);
    };
    
    drawFrame();
}

// ── Mech metadata (consumed by tanks.js config objects) ──────────────────────
// mechs.js loads before tanks.js, so these are ready when tanks.js initialises.
window.mechDiyMeta = {
    name: "Штурмовой мех",
    description: "Гибкий боевой мех с двумя плазменными пушками. Он любит аккуратную игру, даёт хороший темп атаки и заметно слабеет, если не следить за энергией. Это мех для тех, кто умеет держать ритм, считать момент и не тратить ресурсы впустую.",
    rarity: "Редкий"
};
window.mechDiyBgGradient = ['#2ecc71', '#27ae60'];
window.mechDiyBaseColor  = '#1a8a3e';

window.mechShieldMeta = {
    name: "Щитовой мех",
    description: "Тяжёлый мех с защитным корпусом и мощным фронтом. Он движется медленнее остальных, зато уверенно держит удар и хорошо давит в лоб. Его стиль — выдержать натиск, пережить опасный момент и сломать строй противника силой брони.",
    rarity: "Сверхредкий"
};
window.mechShieldBgGradient = ['#3498db', '#5dade2'];
window.mechShieldBaseColor  = '#1a3a6e';

// ── Paralysis overlay (yellow-electric stun visual for mechDiy) ───────────────
function drawParalysisOverlay(ctx, x, y, w, h) {
    ctx.save();
    const now = Date.now();
    const pulse = Math.sin(now * 0.01) * 0.5 + 0.5;

    // Yellow/orange electrical fill
    ctx.globalAlpha = 0.4 + 0.2 * pulse;
    const grad = ctx.createLinearGradient(x, y, x + w, y + h);
    grad.addColorStop(0,   'rgba(255, 200, 0, 0.3)');
    grad.addColorStop(0.5, 'rgba(255, 150, 0, 0.5)');
    grad.addColorStop(1,   'rgba(255, 100, 0, 0.3)');
    ctx.fillStyle = grad;
    ctx.fillRect(x, y, w, h);

    // Crackling electricity lines
    ctx.strokeStyle = `rgba(255, 200, 0, ${0.6 + 0.4 * pulse})`;
    ctx.lineWidth = 1.5;
    ctx.globalAlpha = 0.8 * pulse;
    for (let i = 0; i < 4; i++) {
        const posY = y + h * (i + 1) / 5;
        ctx.beginPath();
        for (let px = x; px < x + w; px += 8) {
            const noise = (Math.random() - 0.5) * 6;
            ctx.lineTo(px, posY + noise);
        }
        ctx.stroke();
    }

    // Border glow
    ctx.globalAlpha = 0.5 * pulse;
    ctx.strokeStyle = 'rgba(255, 200, 0, 0.8)';
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, w, h);

    ctx.restore();
}

// ── Energy bar (drawn above the HP bar for mechDiy) ───────────────────────────
function drawMechEnergyBar(ctx, tank) {
    if (typeof tank.mechEnergy === 'undefined') return;
    const maxE = tank.mechMaxEnergy || 110;
    const curE = Math.max(0, tank.mechEnergy || 0);
    const barY = tank.y - 17;
    // Dark blue background track
    ctx.fillStyle = '#0a192f';
    ctx.fillRect(tank.x, barY, tank.w, 4);
    // Energy fill: bright cyan when full, blue otherwise
    ctx.fillStyle = curE >= maxE ? '#00e5ff' : '#0066cc';
    ctx.fillRect(tank.x, barY, tank.w * (curE / maxE), 4);
    // Numeric label
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 6px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = '#000';
    ctx.shadowBlur = 2;
    ctx.fillText(Math.floor(curE) + '/' + maxE, tank.x + tank.w / 2, barY + 2);
    ctx.shadowBlur = 0;
}

// ── Modal animation (animated mech in the tank detail popup) ─────────────────
function showMechDiyModal(ctx, canvas, modal) {
    if (window.tankDetailAnimId) cancelAnimationFrame(window.tankDetailAnimId);
    modal.style.display = 'flex';
    const drawFrame = () => {
        if (modal.style.display === 'none') {
            window.tankDetailAnimId = null;
            return;
        }
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        // Green rarity background
        const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
        grad.addColorStop(0, '#2ecc71');
        grad.addColorStop(1, '#27ae60');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        // Draw mech with movement animation (0.8 = more pronounced bobbing)
        const side = Math.min(canvas.width, canvas.height) / 2;
        const baseColor = window.mechDiyBaseColor || '#1a8a3e';
        if (typeof drawTankOn === 'function') {
            drawTankOn(ctx, canvas.width / 2, canvas.height / 2, side, side, baseColor, 0, 1, 'mechDiy', null, 0.8);
        }
        window.tankDetailAnimId = requestAnimationFrame(drawFrame);
    };
    drawFrame();
}

// Make globally accessible
window.drawMechOn         = drawMechOn;
window.drawMechBullet     = drawMechBullet;
window.drawMechDiyPreview = drawMechDiyPreview;
window.drawParalysisOverlay = drawParalysisOverlay;
window.drawMechEnergyBar  = drawMechEnergyBar;
window.showMechDiyModal   = showMechDiyModal;

// ─────────────────────────────────────────────────────────────────────────────
// ЩИТОВОЙ МЕХ (mechShield) — heavy shield mech
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Draws the "Щитовой мех" (mechShield) unit centred at (cx, cy).
 * Heavy, boxy body with a prominent front energy-shield plate and shoulder cannons.
 */
function drawMechShieldOn(ctx, cx, cy, W, H, turretAngle, mechType, moveAnimation = 0) {
    if (mechType !== 'mechShield') return;

    const s = Math.min(W, H);
    const now = Date.now();

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(turretAngle);

    const pulse = Math.sin(now * 0.004) * 0.5 + 0.5;
    // Slower, heavier movement wave
    const moveWave = Math.sin(now * 0.006) * moveAnimation * 1.2;

    // ── SHADOW ─────────────────────────────────────────────────────────────
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.beginPath();
    ctx.roundRect(-s*0.48, -s*0.42 + moveWave, s*0.96, s*0.84, 6);
    ctx.fill();

    // ── SHOULDER CANNONS ───────────────────────────────────────────────────
    const barLen = s * 0.58;
    const barW   = s * 0.13;
    const barX   = -s * 0.06;

    const cGrad = ctx.createLinearGradient(barX, 0, barX + barLen, 0);
    cGrad.addColorStop(0, '#0a1828');
    cGrad.addColorStop(0.5, '#1e4a80');
    cGrad.addColorStop(1, '#0a1828');

    // Top cannon (bobs up)
    const ty = -s * 0.31 - barW / 2 + moveWave * 0.5;
    ctx.fillStyle = cGrad;
    ctx.fillRect(barX, ty, barLen, barW);
    // Cooling fins
    ctx.fillStyle = '#06101e';
    for (let i = 0; i < 3; i++) ctx.fillRect(barX + barLen * (0.3 + i * 0.2), ty - 1, barLen * 0.1, barW + 2);
    // Muzzle block + glow
    ctx.fillStyle = '#0c1c30';
    ctx.fillRect(barX + barLen, ty - barW * 0.15, s * 0.1, barW * 1.3);
    ctx.shadowBlur = 8; ctx.shadowColor = '#00aaff';
    ctx.fillStyle = '#00aaff';
    ctx.fillRect(barX + barLen + s * 0.07, ty + barW * 0.2, s * 0.04, barW * 0.6);
    ctx.shadowBlur = 0;

    // Bottom cannon (bobs down)
    const by = s * 0.31 - barW / 2 - moveWave * 0.5;
    ctx.fillStyle = cGrad;
    ctx.fillRect(barX, by, barLen, barW);
    ctx.fillStyle = '#06101e';
    for (let i = 0; i < 3; i++) ctx.fillRect(barX + barLen * (0.3 + i * 0.2), by - 1, barLen * 0.1, barW + 2);
    ctx.fillStyle = '#0c1c30';
    ctx.fillRect(barX + barLen, by - barW * 0.15, s * 0.1, barW * 1.3);
    ctx.shadowBlur = 8; ctx.shadowColor = '#00aaff';
    ctx.fillStyle = '#00aaff';
    ctx.fillRect(barX + barLen + s * 0.07, by + barW * 0.2, s * 0.04, barW * 0.6);
    ctx.shadowBlur = 0;

    // ── MAIN HULL ──────────────────────────────────────────────────────────
    // Rear exhaust
    ctx.fillStyle = '#050e1a';
    ctx.fillRect(-s * 0.46, -s * 0.14, s * 0.1, s * 0.28);
    ctx.fillStyle = `rgba(0, 170, 255, ${0.3 + 0.25 * pulse})`;
    ctx.fillRect(-s * 0.49, -s * 0.11, s * 0.07, s * 0.22);

    // Boxy armored body — slightly wider than mechDiy
    ctx.beginPath();
    ctx.moveTo(-s * 0.40, -s * 0.32);
    ctx.lineTo( s * 0.22, -s * 0.36);
    ctx.lineTo( s * 0.36, -s * 0.20);
    ctx.lineTo( s * 0.36,  s * 0.20);
    ctx.lineTo( s * 0.22,  s * 0.36);
    ctx.lineTo(-s * 0.40,  s * 0.32);
    ctx.closePath();

    const hullGrad = ctx.createLinearGradient(-s * 0.40, -s * 0.32, s * 0.36, s * 0.32);
    hullGrad.addColorStop(0, '#0e2540');
    hullGrad.addColorStop(0.45, '#1a4578');
    hullGrad.addColorStop(1, '#0a1a30');
    ctx.fillStyle = hullGrad;
    ctx.fill();
    ctx.strokeStyle = '#060e18';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Armor plate detail lines
    ctx.strokeStyle = 'rgba(0, 100, 200, 0.4)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(-s * 0.12, -s * 0.30); ctx.lineTo(-s * 0.12,  s * 0.30);
    ctx.moveTo( s * 0.08, -s * 0.24); ctx.lineTo( s * 0.08,  s * 0.24);
    ctx.stroke();

    // ── ENERGY SHIELD PLATE (front-facing panel) ───────────────────────────
    const shX = s * 0.22;
    const shW = s * 0.20;
    const shH = s * 0.80;

    const shGrad = ctx.createLinearGradient(shX, -shH / 2, shX + shW, shH / 2);
    shGrad.addColorStop(0, '#0d2644');
    shGrad.addColorStop(0.5, '#20538a');
    shGrad.addColorStop(1, '#0d2644');
    ctx.fillStyle = shGrad;
    ctx.beginPath();
    ctx.roundRect(shX, -shH / 2, shW, shH, 5);
    ctx.fill();
    ctx.strokeStyle = '#00aaff';
    ctx.lineWidth = 1.8;
    ctx.stroke();

    // Concentric arc energy pattern on the shield plate
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(shX, -shH / 2, shW, shH, 5);
    ctx.clip();
    const arcCx = shX + shW * 0.25;
    ctx.strokeStyle = `rgba(0, 170, 255, ${0.35 + 0.3 * pulse})`;
    ctx.lineWidth = 1;
    ctx.shadowBlur = 6; ctx.shadowColor = '#0099ff';
    for (let r = 1; r <= 5; r++) {
        ctx.beginPath();
        ctx.arc(arcCx, 0, shH * 0.1 * r, -Math.PI * 0.5, Math.PI * 0.5);
        ctx.stroke();
    }
    ctx.shadowBlur = 0;
    ctx.restore();

    // ── CENTRAL REACTOR ────────────────────────────────────────────────────
    const rxX = -s * 0.07;
    ctx.fillStyle = '#060e18';
    ctx.beginPath(); ctx.arc(rxX, 0, s * 0.15, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#00aaff'; ctx.lineWidth = 1.5; ctx.stroke();

    ctx.shadowBlur = 14; ctx.shadowColor = '#00aaff';
    const coreG = ctx.createRadialGradient(rxX, 0, 0, rxX, 0, s * 0.11);
    coreG.addColorStop(0, '#ffffff');
    coreG.addColorStop(0.35, '#aaddff');
    coreG.addColorStop(1, '#0077bb');
    const coreR = s * (0.065 + 0.04 * pulse);
    ctx.fillStyle = coreG;
    ctx.beginPath(); ctx.arc(rxX, 0, coreR, 0, Math.PI * 2); ctx.fill();
    ctx.shadowBlur = 0;

    // Reactor spokes (4-arm, slower rotation for heavier feel)
    ctx.strokeStyle = '#0a1a2a';
    ctx.lineWidth = 2;
    for (let i = 0; i < 4; i++) {
        const ang = (i * Math.PI / 2) + now * 0.0006;
        ctx.beginPath();
        ctx.moveTo(rxX, 0);
        ctx.lineTo(rxX + Math.cos(ang) * s * 0.15, Math.sin(ang) * s * 0.15);
        ctx.stroke();
    }

    ctx.restore();
}

/**
 * Draws a single mechShield projectile — a slow, dense blue-white energy slug.
 */
function drawMechShieldBullet(ctx, b) {
    const r = (b.w || 14) / 2;
    const t = Date.now() * 0.005;
    const ang = Math.atan2(b.vy, b.vx);

    // Short dense trail
    const trailLen = r * 4;
    const tx = b.x - Math.cos(ang) * trailLen;
    const ty_ = b.y - Math.sin(ang) * trailLen;
    const trailGrad = ctx.createLinearGradient(tx, ty_, b.x, b.y);
    trailGrad.addColorStop(0,   'rgba(0, 120, 255, 0)');
    trailGrad.addColorStop(0.5, 'rgba(30, 150, 255, 0.25)');
    trailGrad.addColorStop(1,   'rgba(160, 220, 255, 0.65)');
    ctx.strokeStyle = trailGrad;
    ctx.lineWidth = r * 1.8;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(tx, ty_);
    ctx.lineTo(b.x, b.y);
    ctx.stroke();

    // Additive glow
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    const halo = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, r * 3);
    halo.addColorStop(0,   'rgba(100, 200, 255, 0.35)');
    halo.addColorStop(0.5, 'rgba(0, 120, 255, 0.15)');
    halo.addColorStop(1,   'rgba(0, 60, 200, 0)');
    ctx.fillStyle = halo;
    ctx.beginPath(); ctx.arc(b.x, b.y, r * 3, 0, Math.PI * 2); ctx.fill();
    ctx.restore();

    // Spinning hexagonal core (slow spin, heavy feel)
    ctx.save();
    ctx.translate(b.x, b.y);
    ctx.rotate(t * 1.5);
    const hexR = r * 0.9;
    const hexGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, hexR * 1.3);
    hexGrad.addColorStop(0,   '#e8f8ff');
    hexGrad.addColorStop(0.4, '#55aaff');
    hexGrad.addColorStop(0.8, '#0066cc');
    hexGrad.addColorStop(1,   '#003080');
    ctx.shadowColor = '#0099ff'; ctx.shadowBlur = 12;
    ctx.fillStyle = hexGrad;
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2;
        const px = Math.cos(a) * hexR, py = Math.sin(a) * hexR;
        if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.closePath(); ctx.fill();
    ctx.shadowBlur = 0;
    // Bright inner core
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    ctx.beginPath(); ctx.arc(0, 0, hexR * 0.3, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
}

// ── Preview: draw mechShield in the character select preview canvas ───────────
function drawMechShieldPreview(canvasEl, isUnlocked) {
    if (!canvasEl) return;
    const ctx = canvasEl.getContext('2d');
    if (!ctx) return;

    if (window.mechShieldAnimId) cancelAnimationFrame(window.mechShieldAnimId);

    const W = canvasEl.width;
    const H = canvasEl.height;

    const drawFrame = () => {
        ctx.clearRect(0, 0, W, H);

        if (isUnlocked) {
            const bg = ctx.createLinearGradient(0, 0, 0, H);
            bg.addColorStop(0, '#3498db');
            bg.addColorStop(1, '#5dade2');
            ctx.fillStyle = bg;
        } else {
            ctx.fillStyle = '#333';
        }
        ctx.fillRect(0, 0, W, H);

        const side = Math.min(W, H) * 0.55;
        ctx.save();
        if (!isUnlocked) ctx.filter = 'grayscale(100%) contrast(0.8)';
        drawMechShieldOn(ctx, W / 2, H / 2, side, side, 0, 'mechShield', 0.4);
        ctx.restore();

        if (isUnlocked && typeof getTankTrophies === 'function') {
            const tw = getTankTrophies('mechShield');
            if (tw > 0) {
                ctx.fillStyle = 'rgba(0,0,0,0.6)';
                ctx.fillRect(0, H - 24, W, 24);
                ctx.fillStyle = '#e67e22';
                ctx.font = 'bold 14px Arial';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText('🏆 ' + tw, W / 2, H - 12);
            }
        }

        if (isUnlocked && typeof window.getCurrentTankType === 'function' && window.getCurrentTankType() === 'mechShield') {
            ctx.strokeStyle = 'white';
            ctx.lineWidth = 4;
            ctx.strokeRect(2, 2, W - 4, H - 4);
        } else if (!isUnlocked) {
            ctx.fillStyle = 'rgba(0,0,0,0.5)';
            ctx.fillRect(0, 0, W, H);
            ctx.font = '40px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = '#fff';
            ctx.fillText('🔒', W / 2, H / 2);
        }

        window.mechShieldAnimId = requestAnimationFrame(drawFrame);
    };

    drawFrame();
}

// ── Shield active overlay (blue energy bubble around the mech's world position) ─
function drawShieldActiveOverlay(ctx, x, y, w, h, fadeRatio, damagePercent) {
    // fadeRatio: 1 = fully visible, 0 = invisible
    // damagePercent: 0-100, increases red tint when shield takes damage
    if (fadeRatio <= 0) return;
    const cx = x + w / 2;
    const cy = y + h / 2;
    const r = Math.max(w, h) * 0.72;
    const now = Date.now();
    const pulse = Math.sin(now * 0.007) * 0.5 + 0.5;
    const dmgRatio = (damagePercent || 0) / 100;  // 0-1

    ctx.save();
    const alpha = fadeRatio;

    // Color shift: blue when healthy → red when damaged
    const baseBlue = 255;
    const baseGreen = 170;
    const baseRed = 0;
    const damageRed = Math.round(baseRed + (200 * dmgRatio));
    const damageGreen = Math.round(baseGreen - (100 * dmgRatio));
    const damageBlue = Math.round(baseBlue - (100 * dmgRatio));

    // Outer energy glow ring
    ctx.strokeStyle = `rgba(${damageRed}, ${damageGreen}, ${damageBlue}, ${(0.55 + 0.35 * pulse) * alpha})`;
    ctx.lineWidth = 3.5;
    ctx.shadowColor = `rgba(${damageRed}, ${damageGreen}, ${damageBlue}, 0.8)`;
    ctx.shadowBlur = 18;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.stroke();

    // Inner translucent fill
    const fillGrad = ctx.createRadialGradient(cx, cy, r * 0.3, cx, cy, r);
    fillGrad.addColorStop(0, `rgba(${Math.round(30 + 100 * dmgRatio)}, ${Math.round(120 - 60 * dmgRatio)}, ${damageBlue}, ${0.08 * alpha})`);
    fillGrad.addColorStop(0.7, `rgba(${Math.round(damageRed * 0.5)}, ${Math.round(damageGreen * 0.8)}, ${damageBlue}, ${0.12 * alpha})`);
    fillGrad.addColorStop(1, `rgba(${Math.round(damageRed * 0.6)}, ${Math.round(damageGreen * 0.6)}, ${damageBlue}, ${0.22 * alpha})`);
    ctx.fillStyle = fillGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();

    // Counter-rotating arc segments
    ctx.shadowBlur = 0;
    for (let i = 0; i < 3; i++) {
        const a = (i / 3) * Math.PI * 2 + now * 0.003;
        ctx.strokeStyle = `rgba(${Math.round(120 + 50 * dmgRatio)}, ${Math.round(200 - 60 * dmgRatio)}, ${damageBlue}, ${(0.7 * pulse) * alpha})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(cx, cy, r + 4, a, a + Math.PI * 0.45);
        ctx.stroke();
    }

    ctx.restore();
}

// ── Modal animation for mechShield ──────────────────────────────────────────
function showMechShieldModal(ctx, canvas, modal) {
    if (window.tankDetailAnimId) cancelAnimationFrame(window.tankDetailAnimId);
    modal.style.display = 'flex';
    const drawFrame = () => {
        if (modal.style.display === 'none') {
            window.tankDetailAnimId = null;
            return;
        }
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        // Blue rarity background
        const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
        grad.addColorStop(0, '#3498db');
        grad.addColorStop(1, '#5dade2');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        const side = Math.min(canvas.width, canvas.height) / 2;
        const baseColor = window.mechShieldBaseColor || '#1a3a6e';
        if (typeof drawTankOn === 'function') {
            drawTankOn(ctx, canvas.width / 2, canvas.height / 2, side, side, baseColor, 0, 1, 'mechShield', null, 0.6);
        }
        window.tankDetailAnimId = requestAnimationFrame(drawFrame);
    };
    drawFrame();
}

// Make globally accessible
window.drawMechOn           = drawMechOn;
window.drawMechBullet       = drawMechBullet;
window.drawMechDiyPreview   = drawMechDiyPreview;
window.drawParalysisOverlay = drawParalysisOverlay;
window.drawMechEnergyBar    = drawMechEnergyBar;
window.showMechDiyModal     = showMechDiyModal;
window.drawMechShieldOn         = drawMechShieldOn;
window.drawMechShieldBullet     = drawMechShieldBullet;
window.drawMechShieldPreview    = drawMechShieldPreview;
window.drawShieldActiveOverlay  = drawShieldActiveOverlay;
window.showMechShieldModal      = showMechShieldModal;

// ─── Rocket Mech (mechRocket) ────────────────────────────────────────────────
window.mechRocketMeta = {
    name: "Ракетный мех",
    description: "Эпический ракетный мех для плотного урона по площади. Он особенно силён там, где врагам тесно и нет безопасного пространства для манёвра. Если соперники любят собираться вместе, этот мех быстро наказывает за привычку стоять кучно и терять расстояние.",
    rarity: "Эпический"
};
window.mechRocketBgGradient = ['#9b59b6', '#8e44ad'];
window.mechRocketBaseColor  = '#7d1f1f';

function drawMechRocketOn(ctx, cx, cy, W, H, turretAngle, mechType, moveAnimation = 0) {
    if (mechType !== 'mechRocket') return;
    const s = Math.min(W, H);
    const now = Date.now();

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(turretAngle);

    const pulse = Math.sin(now * 0.005) * 0.5 + 0.5;
    const moveWave = Math.sin(now * 0.008) * moveAnimation * 1.0;

    // Scale up the mech body for better visibility
    ctx.scale(1.15, 1.15);

    // ── SHOULDER ROCKET PODS (top + bottom, like mechShield's cannons) ──────
    const podLen = s * 0.50;
    const podW   = s * 0.20;
    const podX   = -s * 0.10;

    function drawPod(podY, side) {
        // Pod body — dark red metal with gradient
        const pGrad = ctx.createLinearGradient(podX, 0, podX + podLen, 0);
        pGrad.addColorStop(0, '#2a0606');
        pGrad.addColorStop(0.5, '#7d1f1f');
        pGrad.addColorStop(1, '#2a0606');
        ctx.fillStyle = pGrad;
        ctx.beginPath();
        ctx.roundRect(podX, podY, podLen, podW, 4);
        ctx.fill();
        ctx.strokeStyle = '#1a0303';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // 2x3 rocket tube grid at the front of the pod
        const tubeAreaX = podX + podLen * 0.55;
        const tubeAreaW = podLen * 0.40;
        const cellW = tubeAreaW / 3;
        const cellH = podW / 2;
        for (let row = 0; row < 2; row++) {
            for (let col = 0; col < 3; col++) {
                const tx = tubeAreaX + cellW * (col + 0.5);
                const ty = podY + cellH * (row + 0.5);
                ctx.fillStyle = '#0a0202';
                ctx.beginPath();
                ctx.arc(tx, ty, Math.min(cellW, cellH) * 0.32, 0, Math.PI * 2);
                ctx.fill();
                // Glowing tip
                ctx.fillStyle = `rgba(255, ${100 + 100 * pulse}, 0, ${0.7 + 0.3 * pulse})`;
                ctx.beginPath();
                ctx.arc(tx, ty, Math.min(cellW, cellH) * 0.16, 0, Math.PI * 2);
                ctx.fill();
            }
        }
        // Cooling fins on the rear half
        ctx.fillStyle = '#1a0303';
        for (let i = 0; i < 3; i++) {
            ctx.fillRect(podX + podLen * (0.08 + i * 0.13), podY - 1, podLen * 0.06, podW + 2);
        }
        // Mech-arm joint connecting to body
        ctx.fillStyle = '#3a0a0a';
        ctx.beginPath();
        ctx.arc(podX + s * 0.02, podY + podW / 2, podW * 0.55, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#1a0303';
        ctx.lineWidth = 1.5;
        ctx.stroke();
    }

    // Top pod (slight bob up)
    drawPod(-s * 0.34 + moveWave * 0.5, -1);
    // Bottom pod (slight bob down)
    drawPod( s * 0.14 - moveWave * 0.5,  1);

    // ── REAR EXHAUST (jet thruster) ─────────────────────────────────────────
    ctx.fillStyle = '#1a0303';
    ctx.fillRect(-s * 0.46, -s * 0.10, s * 0.10, s * 0.20);
    ctx.fillStyle = `rgba(255, ${100 + 80 * pulse}, 0, ${0.5 + 0.3 * pulse})`;
    ctx.fillRect(-s * 0.50, -s * 0.07, s * 0.07, s * 0.14);

    // ── MAIN HULL (mech torso) ─────────────────────────────────────────────
    ctx.beginPath();
    ctx.moveTo(-s * 0.36, -s * 0.22);
    ctx.lineTo( s * 0.18, -s * 0.26);
    ctx.lineTo( s * 0.30, -s * 0.12);
    ctx.lineTo( s * 0.30,  s * 0.12);
    ctx.lineTo( s * 0.18,  s * 0.26);
    ctx.lineTo(-s * 0.36,  s * 0.22);
    ctx.closePath();
    const hullGrad = ctx.createLinearGradient(-s * 0.36, -s * 0.22, s * 0.30, s * 0.22);
    hullGrad.addColorStop(0, '#3a0a0a');
    hullGrad.addColorStop(0.45, '#7d1f1f');
    hullGrad.addColorStop(1, '#280707');
    ctx.fillStyle = hullGrad;
    ctx.fill();
    ctx.strokeStyle = '#1a0303';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Armor plate detail lines
    ctx.strokeStyle = 'rgba(255, 100, 80, 0.3)';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(-s * 0.10, -s * 0.20); ctx.lineTo(-s * 0.10,  s * 0.20);
    ctx.moveTo( s * 0.05, -s * 0.18); ctx.lineTo( s * 0.05,  s * 0.18);
    ctx.stroke();

    // ── COCKPIT / VISOR (front) ────────────────────────────────────────────
    const visorX = s * 0.10;
    const visorW = s * 0.14;
    const visorH = s * 0.18;
    const visorGrad = ctx.createLinearGradient(visorX, -visorH/2, visorX + visorW, visorH/2);
    visorGrad.addColorStop(0, '#0a0202');
    visorGrad.addColorStop(0.5, '#3a0a0a');
    visorGrad.addColorStop(1, '#0a0202');
    ctx.fillStyle = visorGrad;
    ctx.beginPath();
    ctx.roundRect(visorX, -visorH/2, visorW, visorH, 4);
    ctx.fill();
    ctx.strokeStyle = '#ff6633';
    ctx.lineWidth = 1.4;
    ctx.stroke();
    // Glowing red eye slit
    ctx.shadowBlur = 8;
    ctx.shadowColor = '#ff3300';
    ctx.fillStyle = `rgba(255, ${80 + 100 * pulse}, 0, ${0.85 + 0.15 * pulse})`;
    ctx.fillRect(visorX + visorW * 0.18, -visorH * 0.12, visorW * 0.64, visorH * 0.25);
    ctx.shadowBlur = 0;

    // ── CENTRAL REACTOR CORE ───────────────────────────────────────────────
    const rxX = -s * 0.10;
    ctx.fillStyle = '#1a0303';
    ctx.beginPath(); ctx.arc(rxX, 0, s * 0.13, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#ff5500'; ctx.lineWidth = 1.5; ctx.stroke();

    ctx.shadowBlur = 14; ctx.shadowColor = '#ff5500';
    const coreG = ctx.createRadialGradient(rxX, 0, 0, rxX, 0, s * 0.10);
    coreG.addColorStop(0, '#ffffcc');
    coreG.addColorStop(0.4, '#ff9900');
    coreG.addColorStop(1, '#aa2200');
    const coreR = s * (0.055 + 0.035 * pulse);
    ctx.fillStyle = coreG;
    ctx.beginPath(); ctx.arc(rxX, 0, coreR, 0, Math.PI * 2); ctx.fill();
    ctx.shadowBlur = 0;

    // Reactor spokes (rotating)
    ctx.strokeStyle = '#1a0303';
    ctx.lineWidth = 2;
    for (let i = 0; i < 4; i++) {
        const ang = (i * Math.PI / 2) + now * 0.0008;
        ctx.beginPath();
        ctx.moveTo(rxX, 0);
        ctx.lineTo(rxX + Math.cos(ang) * s * 0.13, Math.sin(ang) * s * 0.13);
        ctx.stroke();
    }

    ctx.restore();
}

function drawMechRocketPreview(canvasEl, isUnlocked) {
    if (!canvasEl) return;
    const ctx = canvasEl.getContext('2d');
    if (!ctx) return;
    if (window.mechRocketAnimId) cancelAnimationFrame(window.mechRocketAnimId);
    const W = canvasEl.width;
    const H = canvasEl.height;
    const drawFrame = () => {
        ctx.clearRect(0, 0, W, H);
        if (isUnlocked) {
            const bg = ctx.createLinearGradient(0, 0, 0, H);
            bg.addColorStop(0, '#9b59b6');
            bg.addColorStop(1, '#8e44ad');
            ctx.fillStyle = bg;
        } else {
            ctx.fillStyle = '#444';
        }
        ctx.fillRect(0, 0, W, H);
        const side = Math.min(W, H) * 0.68;
        ctx.save();
        if (!isUnlocked) ctx.filter = 'grayscale(100%) contrast(0.8)';
        drawMechRocketOn(ctx, W / 2, H / 2, side, side, 0, 'mechRocket', 0.4);
        ctx.restore();
        if (isUnlocked && typeof getTankTrophies === 'function') {
            const tw = getTankTrophies('mechRocket');
            if (tw > 0) {
                ctx.fillStyle = 'rgba(0,0,0,0.6)';
                ctx.fillRect(0, H - 24, W, 24);
                ctx.fillStyle = '#e67e22';
                ctx.font = 'bold 14px Arial';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText('🏆 ' + tw, W / 2, H - 12);
            }
        }
        if (isUnlocked && typeof window.getCurrentTankType === 'function' && window.getCurrentTankType() === 'mechRocket') {
            ctx.strokeStyle = 'white';
            ctx.lineWidth = 4;
            ctx.strokeRect(2, 2, W - 4, H - 4);
        } else if (!isUnlocked) {
            ctx.fillStyle = 'rgba(0,0,0,0.5)';
            ctx.fillRect(0, 0, W, H);
            ctx.font = '40px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = '#fff';
            ctx.fillText('🔒', W / 2, H / 2);
        }
        window.mechRocketAnimId = requestAnimationFrame(drawFrame);
    };
    drawFrame();
}

function showMechRocketModal(ctx, canvas, modal) {
    if (window.tankDetailAnimId) cancelAnimationFrame(window.tankDetailAnimId);
    modal.style.display = 'flex';
    const drawFrame = () => {
        if (modal.style.display === 'none') {
            window.tankDetailAnimId = null;
            return;
        }
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
        grad.addColorStop(0, '#9b59b6');
        grad.addColorStop(1, '#8e44ad');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        const side = Math.min(canvas.width, canvas.height) / 2;
        const baseColor = window.mechRocketBaseColor || '#7d1f1f';
        if (typeof drawTankOn === 'function') {
            drawTankOn(ctx, canvas.width / 2, canvas.height / 2, side, side, baseColor, 0, 1, 'mechRocket', null, 0.6);
        }
        window.tankDetailAnimId = requestAnimationFrame(drawFrame);
    };
    drawFrame();
}

window.drawMechRocketOn      = drawMechRocketOn;
window.drawMechRocketPreview = drawMechRocketPreview;
window.showMechRocketModal   = showMechRocketModal;

// ── Consolidated mech data structures ────────────────────────────────────────
// Single canonical source of truth for all mech unit data.
// Other files must use window.isMech() and window.mech* objects
// instead of hardcoding mech types inside tank data structures.

const MECH_TYPES = ['mechDiy', 'mechShield', 'mechRocket'];
window.MECH_TYPES = MECH_TYPES;
window.isMech = (type) => MECH_TYPES.includes(type);

window.mechDescriptions = {
    mechDiy:    window.mechDiyMeta,
    mechShield: window.mechShieldMeta,
    mechRocket: window.mechRocketMeta,
};
window.mechBgGradients = {
    mechDiy:    window.mechDiyBgGradient,
    mechShield: window.mechShieldBgGradient,
    mechRocket: window.mechRocketBgGradient,
};
window.mechBaseColors = {
    mechDiy:    window.mechDiyBaseColor,
    mechShield: window.mechShieldBaseColor,
    mechRocket: window.mechRocketBaseColor,
};
window.mechGemPrices = {
    mechDiy:    150,
    mechShield: 300,
    mechRocket: 600,
};
window.mechMaxHpByType = {
    mechDiy:    420,
    mechShield: 600,
    mechRocket: 450,
};
window.mechMaxSpeedByType = {
    mechDiy:    2.4,
    mechShield: 2.3,
    mechRocket: 2.1,
};
window.mechDamageByType = {
    mechDiy:    40,
    mechShield: 120,
    mechRocket: 150,
};
