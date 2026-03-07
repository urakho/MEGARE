// physics.js  collision detection, explosions, particles, shooting, movement

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

function explodeBarrel(obj) {
    // visual explosion — radius matches damage radius R=120
    const cx = obj.x + obj.w/2, cy = obj.y + obj.h/2;
    spawnExplosion(cx, cy, 120);
    // shockwave expands to exactly the damage boundary
    objects.push({ type: 'shockwave', x: cx, y: cy, radius: 10, speed: 10, life: 12, maxLife: 12 });
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
                spawnExplosion(t.x + t.w/2, t.y + t.h/2, 70);
                if (currentMode === 'war') { t.alive = false; t.respawnTimer = 600; }
                else { 
                    gameState = 'lose'; 
                    loseModeTrophies();
                    syncResultOverlay('lose');
                }
            }
        }
    }
    // apply to player
    applyDamageToTank(tank);
    // allies
    for (let i = allies.length - 1; i >= 0; i--) {
        const a = allies[i]; applyDamageToTank(a);
        if (a.hp <= 0) {
            if (currentMode === 'war') { a.alive = false; a.respawnTimer = 600; spawnExplosion(a.x + a.w/2, a.y + a.h/2, 65); }
            else { allies.splice(i, 1); spawnExplosion(a.x + a.w/2, a.y + a.h/2, 65); }
        }
    }
    // enemies
    for (let i = enemies.length - 1; i >= 0; i--) {
        const e = enemies[i]; applyDamageToTank(e);
        if (e.hp <= 0) {
            if (currentMode === 'war') { e.alive = false; e.respawnTimer = 600; spawnExplosion(e.x + e.w/2, e.y + e.h/2, 65); }
            else { enemies.splice(i, 1); spawnExplosion(e.x + e.w/2, e.y + e.h/2, 65); }
        }
    }
    // remove barrel object
    const idx = objects.indexOf(obj);
    if (idx >= 0) objects.splice(idx, 1);
    navNeedsRebuild = true;
}

// Взрыв ракеты: эффекты и урон всем танкам в радиусе
function explodeRocket(bullet) {
    // visual explosion — radius matches damage radius R=80
    spawnExplosion(bullet.x, bullet.y, 80);
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
                spawnExplosion(t.x + t.w/2, t.y + t.h/2, 70);
                if (currentMode === 'war') { t.alive = false; t.respawnTimer = 600; }
                else { 
                    gameState = 'lose'; 
                    loseModeTrophies();
                    syncResultOverlay('lose');
                }
            }
        }
    }
    // apply to player
    applyDamageToTank(tank);
    // allies
    for (let i = allies.length - 1; i >= 0; i--) {
        const a = allies[i]; applyDamageToTank(a);
        if (a.hp <= 0) {
            if (currentMode === 'war') { a.alive = false; a.respawnTimer = 600; spawnExplosion(a.x + a.w/2, a.y + a.h/2, 65); }
            else { allies.splice(i, 1); spawnExplosion(a.x + a.w/2, a.y + a.h/2, 65); }
        }
    }
    // enemies
    for (let i = enemies.length - 1; i >= 0; i--) {
        const e = enemies[i]; applyDamageToTank(e);
        if (e.hp <= 0) {
            if (currentMode === 'war') { e.alive = false; e.respawnTimer = 600; spawnExplosion(e.x + e.w/2, e.y + e.h/2, 65); }
            else { enemies.splice(i, 1); spawnExplosion(e.x + e.w/2, e.y + e.h/2, 65); }
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
                spawnExplosion(t.x+t.w/2, t.y+t.h/2, 70);
                if (currentMode === 'war') { t.alive = false; t.respawnTimer = 600; }
                else { 
                    gameState = 'lose'; 
                    loseModeTrophies();
                    syncResultOverlay('lose');
                }
            }
        }
    }
    applyDamageToTank(tank);
    for (let i = allies.length - 1; i >= 0; i--) {
        const a = allies[i]; applyDamageToTank(a);
        if (a.hp <= 0) {
            if (currentMode === 'war') { a.alive = false; a.respawnTimer = 600; spawnExplosion(a.x+a.w/2, a.y+a.h/2, 65); }
            else { allies.splice(i, 1); spawnExplosion(a.x+a.w/2, a.y+a.h/2, 65); }
        }
    }
    for (let i = enemies.length - 1; i >= 0; i--) {
        const e = enemies[i]; applyDamageToTank(e);
        if (e.hp <= 0) {
            if (currentMode === 'war') { e.alive = false; e.respawnTimer = 600; spawnExplosion(e.x+e.w/2, e.y+e.h/2, 65); }
            else { enemies.splice(i, 1); spawnExplosion(e.x+e.w/2, e.y+e.h/2, 65); }
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

function spawnExplosion(cx, cy, radius) {
    if (window.effectsEnabled === false) return;
    const r = radius || 80;
    // Main fire visual
    objects.push({ type: 'explosion', x: cx, y: cy, radius: r, life: 28, maxLife: 28 });
    // Shockwave ring
    objects.push({ type: 'shockwave', x: cx, y: cy, radius: r * 0.18, speed: r * 0.075, life: 18, maxLife: 18 });
    // Fire sparks
    const fireRgb = ['255,210,40','255,140,0','255,60,0','255,245,90','210,90,0'];
    for (let i = 0; i < 28; i++) {
        const ang = Math.random() * Math.PI * 2;
        const sp = (r / 80) * (5 + Math.random() * 9);
        particles.push({ x: cx, y: cy, vx: Math.cos(ang)*sp, vy: Math.sin(ang)*sp,
            life: 0.45 + Math.random() * 0.6, size: 3 + Math.random() * (r/22),
            rgb: fireRgb[Math.floor(Math.random() * fireRgb.length)] });
    }
    // Smoke
    for (let i = 0; i < 14; i++) {
        const ang = Math.random() * Math.PI * 2;
        const sp = (r / 80) * (0.8 + Math.random() * 2.2);
        const g = 55 + Math.floor(Math.random() * 65);
        particles.push({ x: cx + (Math.random()-0.5)*r*0.4, y: cy + (Math.random()-0.5)*r*0.4,
            vx: Math.cos(ang)*sp, vy: Math.sin(ang)*sp - 0.5,
            life: 1.0 + Math.random() * 0.9, size: 7 + Math.random()*(r/9),
            rgb: `${g},${g},${g}` });
    }
    // Debris
    for (let i = 0; i < 8; i++) {
        const ang = Math.random() * Math.PI * 2;
        const sp = (r / 80) * (6 + Math.random() * 6);
        particles.push({ x: cx, y: cy, vx: Math.cos(ang)*sp, vy: Math.sin(ang)*sp,
            life: 0.35 + Math.random() * 0.35, size: 4 + Math.random() * 5, rgb: '50,35,15' });
    }
}

function spawnParticle(x, y, color, life) {
    if (!window.effectsEnabled) return;
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
        const tvx = tank._vx || 0; // inherit tank velocity so flames track with movement
        const tvy = tank._vy || 0;
        for (let f = 0; f < flameCount; f++) {
            const t = flameCount <= 1 ? 0.5 : f / (flameCount - 1);
            const ang = baseAng + (t - 0.5) * spread + (Math.random() - 0.5) * 0.06;
            const sx = tank.x + tank.w/2 + Math.cos(ang) * 18;
            const sy = tank.y + tank.h/2 + Math.sin(ang) * 18;
            const speed = 3.5 + Math.random() * 1.2;
            flames.push({
                x: sx,
                y: sy,
                vx: Math.cos(ang) * speed + tvx,
                vy: Math.sin(ang) * speed + tvy,
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
        const targetCircle = { x: targetX, y: targetY, radius: 100, color: tank.color, timer: 180, type: 'targetCircle', team: tank.team };
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
    } else if (tankType === 'waterjet') {
        // Waterjet: continuous stream while Space held
        tank.waterjetActive = true;
        tank.fireCooldown = 3;
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
    } else if (tankType === 'machinegun') {
        const speed = 7;
        const life = 80;
        // Slightly randomized exit point for realism
        const ang = tank.turretAngle + (Math.random() - 0.5) * 0.05;
        bullets.push({
            x: tank.x + tank.w/2 + Math.cos(ang) * 35,
            y: tank.y + tank.h/2 + Math.sin(ang) * 35,
            w: 7, h: 7, // Slightly smaller than normal (9x9)
            vx: Math.cos(ang) * speed,
            vy: Math.sin(ang) * speed,
            life: life,
            owner: 'player',
            team: 0,
            type: 'machinegun',
            damage: 0.2 // Very low damage per bullet
        });
        tank.fireCooldown = 5; // Fast rate (approx 12 shots/sec)
    } else if (tankType === 'buckshot') {
        // Buckshot: 5 pellets in a spread pattern
        const speed = 6;
        const life = 24; // 0.4 second lifetime
        const baseAng = tank.turretAngle;
        const spreadAngle = 0.6; // total spread in radians (~34 degrees)
        const startX = tank.x + tank.w/2 + Math.cos(baseAng) * 20;
        const startY = tank.y + tank.h/2 + Math.sin(baseAng) * 20;
        
        // Fire 5 pellets in a spread
        for (let i = 0; i < 5; i++) {
            const pelletAngle = baseAng + (i - 2) * (spreadAngle / 4) + (Math.random() - 0.5) * 0.08;
            bullets.push({
                x: startX + Math.cos(pelletAngle) * 2 * i,
                y: startY + Math.sin(pelletAngle) * 2 * i,
                w: 6, h: 6,
                vx: Math.cos(pelletAngle) * speed,
                vy: Math.sin(pelletAngle) * speed,
                life: life,
                owner: 'player',
                team: 0,
                type: 'buckshot',
                damage: 1.5 // Each pellet deals 1.5 damage
            });
        }
        tank.fireCooldown = 40; // ~667ms (2x slower than normal 333ms)
    } else if (tankType === 'chromatic') {
        // Chromatic base form: single powerful shot, damage 2
        const speed = 5;
        const life = 100;
        bullets.push({
            x: tank.x + tank.w/2 + Math.cos(tank.turretAngle) * 25,
            y: tank.y + tank.h/2 + Math.sin(tank.turretAngle) * 25,
            w: 9, h: 9,
            vx: Math.cos(tank.turretAngle) * speed,
            vy: Math.sin(tank.turretAngle) * speed,
            life: life,
            owner: 'player',
            team: 0,
            type: 'chromatic',
            damage: 2
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
    if (tankType !== 'fire' && tankType !== 'buratino' && tankType !== 'toxic' && tankType !== 'machinegun') {
        tank.fireCooldown = (tankType === 'mirror' ? 90 : FIRE_COOLDOWN); // 1.5sec for mirror
    }
}
// --- APPEND_POINT_UPDATE ---

function updatePhysics() {

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
                    spawnExplosion(tank.x+tank.w/2, tank.y+tank.h/2, 70);
                    if (currentMode === 'war') {
                        if (tank.respawnCount >= 2) {
                            gameState = 'lose';
                            loseTrophies(1); // Снимаем 1 трофей за поражение в war режиме
                            syncResultOverlay('lose');
                        } else {
                            tank.alive = false;
                            tank.respawnTimer = 600; // 10s
                        }
                    } else {
                        gameState = 'lose';
                        loseModeTrophies();
                        syncResultOverlay('lose');
                    }
                }
                continue;
            }
            // Check collision with allies - toxic/megabomb only damage, don't stop
            for (let j = allies.length - 1; j >= 0; j--) {
                const a = allies[j];
                if (!a || !a.alive) continue;
                if (checkRectCollision(bRect, a) && b.team !== a.team) {
                    // Mirror shield reflection for ally bots
                    if (a.tankType === 'mirror' && a.mirrorShieldActive) {
                        b.vx = -b.vx * 1.5;
                        b.vy = -b.vy * 1.5;
                        b.team = a.team;
                        b.owner = 'ally';
                        b.life += 60;
                        for (let k = 0; k < 5; k++) spawnParticle(b.x, b.y, '#ffffff');
                        break;
                    }
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
                            a.alive = false; a.respawnTimer = 600; spawnExplosion(a.x+a.w/2, a.y+a.h/2, 65);
                        } else {
                            allies.splice(j, 1);
                            spawnExplosion(a.x+a.w/2, a.y+a.h/2, 65);
                        }
                    }
                    break;
                }
            }
            // Check collision with enemies - toxic/megabomb only damage, don't stop
            let reflected = false;
            for (let j = enemies.length - 1; j >= 0; j--) {
                const e = enemies[j];
                if (!e || !e.alive) continue;
                if (checkRectCollision(bRect, e) && b.team !== e.team) {
                    if (e.tankType === 'mirror') {
                        // Activate shield on impact if cooldown allows
                        if (!e.mirrorShieldActive && e.mirrorShieldCooldown <= 0) {
                            e.mirrorShieldActive = true;
                            e.mirrorShieldTimer = 120;
                            e.mirrorShieldCooldown = 60 * 14;
                        }
                        if (e.mirrorShieldActive) {
                            // Fully reverse bullet direction
                            b.vx = -b.vx;
                            b.vy = -b.vy;
                            b.team = e.team;
                            b.owner = 'enemy';
                            b.life = Math.max(b.life, 120);
                            // Push bullet well clear of the hitbox so it never re-collides
                            b.x += b.vx * 10;
                            b.y += b.vy * 10;
                            for (let k = 0; k < 10; k++) spawnParticle(b.x, b.y, '#bdc3c7');
                            reflected = true;
                            break;
                        }
                        // Shield on cooldown — take damage normally
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
                            e.alive = false; e.respawnTimer = 600; spawnExplosion(e.x+e.w/2, e.y+e.h/2, 65);
                        } else {
                            enemies.splice(j, 1);
                            spawnExplosion(e.x+e.w/2, e.y+e.h/2, 65);
                        }
                    }
                    break;
                }
            }
            // If bullet was reflected by a mirror bot, skip to next bullet immediately
            if (reflected) continue;
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
                     spawnExplosion(tank.x+tank.w/2, tank.y+tank.h/2, 70);
                     if (currentMode === 'war') { tank.alive = false; tank.respawnTimer = 600; }
                     else { 
                         gameState = 'lose'; 
                         loseModeTrophies();
                         syncResultOverlay('lose');
                     }
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
                    spawnExplosion(e.x+e.w/2, e.y+e.h/2, 65);
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
                    spawnExplosion(a.x+a.w/2, a.y+a.h/2, 65);
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
                        spawnExplosion(e.x+e.w/2, e.y+e.h/2, 65);
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
        // Fire trail particles — more frequent for enemy/ally flames
        if (window.effectsEnabled !== false) {
            const trailChance = (f.owner === 'player' || !f.owner) ? 0.4 : 0.6;
            if (Math.random() < trailChance) {
                const colors = ['#ff6600', '#ff3300', '#ffaa00', '#ffff00'];
                spawnParticle(f.x, f.y, colors[Math.floor(Math.random() * colors.length)], 6 + Math.random() * 6);
            }
        }
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
                    spawnExplosion(tank.x+tank.w/2, tank.y+tank.h/2, 70);
                    if (currentMode === 'war') {
                        if (tank.respawnCount >= 2) {
                            gameState = 'lose';
                            loseTrophies(1); // Снимаем 1 трофей за поражение в war режиме
                            syncResultOverlay('lose');
                        } else {
                            tank.alive = false;
                            tank.respawnTimer = 600;
                        }
                    } else {
                        gameState = 'lose';
                        loseModeTrophies();
                        syncResultOverlay('lose');
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
                            a.alive = false; a.respawnTimer = 600; spawnExplosion(a.x+a.w/2, a.y+a.h/2, 65);
                        } else {
                            allies.splice(j, 1);
                            spawnExplosion(a.x+a.w/2, a.y+a.h/2, 65);
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
                            e.alive = false; e.respawnTimer = 600; spawnExplosion(e.x+e.w/2, e.y+e.h/2, 65);
                        } else {
                            enemies.splice(j, 1);
                            spawnExplosion(e.x+e.w/2, e.y+e.h/2, 65);
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
                            spawnExplosion(p.x, p.y, 30);
                            applyDamage(p.x, p.y, 30, 1, obj.team);
                        }
                    }
                } else {
                    // fallback: spawn original pattern
                    for (let j = 0; j < 4; j++) {
                        const ang = (j / 4) * Math.PI * 2;
                        const dist = obj.radius * 0.3;
                        const ex = obj.x + Math.cos(ang) * dist;
                        const ey = obj.y + Math.sin(ang) * dist;
                        spawnExplosion(ex, ey, 30);
                        applyDamage(ex, ey, 30, 1, obj.team);
                    }
                    for (let j = 0; j < 9; j++) {
                        const ang = (j / 9) * Math.PI * 2;
                        const dist = obj.radius * 0.7;
                        const ex = obj.x + Math.cos(ang) * dist;
                        const ey = obj.y + Math.sin(ang) * dist;
                        spawnExplosion(ex, ey, 30);
                        applyDamage(ex, ey, 30, 1, obj.team);
                    }
                }
                objects.splice(i, 1);
            }
        } else if (obj.type === 'explosion') {
            obj.life--;
            if (obj.life <= 0) objects.splice(i, 1);
        } else if (obj.type === 'shockwave') {
            obj.radius += obj.speed || 8;
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
                if (window.effectsEnabled !== false && Math.random() < 0.6) {
                    particles.push({ x: obj.x, y: obj.y, vx: (Math.random() - 0.5) * 0.4 - obj.vx * 0.08, vy: (Math.random() - 0.5) * 0.4 - obj.vy * 0.08, life: 8, size: 2, color: 'rgba(80,80,80,0.6)' });
                }

                // If rocket has an assigned planned target, detonate precisely at that planned spot
                let exploded = false;
                if (obj.target) {
                    const distToTarget = Math.hypot(obj.x - obj.target.x, obj.y - obj.target.y);
                    if (distToTarget <= 10) {
                        // spawn explosion at planned spot and mark it
                        spawnExplosion(obj.target.x, obj.target.y, 30);
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
                                spawnExplosion(obj.x, obj.y, 30);
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
                    spawnExplosion(ent.x+ent.w/2, ent.y+ent.h/2, 65);
                    if (currentMode !== 'war') { 
                        gameState = 'lose'; 
                        loseModeTrophies();
                        syncResultOverlay('lose');
                    }
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
                     spawnExplosion(a.x+a.w/2, a.y+a.h/2, 65);
                 }
             } else {
                 allies.splice(i, 1);
                 spawnExplosion(a.x+a.w/2, a.y+a.h/2, 65);
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
                     spawnExplosion(e.x+e.w/2, e.y+e.h/2, 65);
                 }
             } else {
                 if (currentMode === 'single' || currentMode === 'team') coins += 5; // Reward
                 enemies.splice(i, 1);
                 spawnExplosion(e.x+e.w/2, e.y+e.h/2, 65);
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
                    const maxHp = (tankType === 'fire' ? 6 : (tankType === 'musical' || tankType === 'mirror') ? 4 : (tankType === 'buckshot') ? 3 : 3);
                    if (p) {
                         tank.x = p.x; tank.y = p.y; tank.hp = maxHp; tank.alive = true; tank.respawnTimer = 0; tank.respawnCount++;
                    } else {
                         // fallback respawn
                         tank.x = sp.x; tank.y = sp.y; tank.hp = maxHp; tank.alive = true; tank.respawnTimer = 0; tank.respawnCount++;
                    }
                    // Reset all effects on respawn
                    tank.paralyzed = false;
                    tank.paralyzedTime = 0;
                    tank.frozenEffect = 0;
                    tank.confused = 0;
                    tank.mirrorShieldActive = false;
                    tank.mirrorShieldTimer = 0;
                    tank.lastHitType = null;
                    tank.lastHitTime = 0;
                    
                    // Reset illuminat beam effects
                    tank.beamActive = false;
                    tank.beamStart = 0;
                    tank.beamCooldown = 0;
                    tank.beamAngle = 0;
                    tank.inversionUsed = 0;
                    
                    // Reset toxic gas ability
                    tank.megaGasUsed = false;
                    
                    // Reset plasma blast ability
                    tank.plasmaBlastUsed = 0;
                    
                    // Reset poison and control effects
                    tank.poisonTimer = 0;
                    tank.invertedControls = 0;
                    tank.disoriented = 0;
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

    // Проверка победы/поражения (пропускаем если уже lose/win — чтобы не вычитать трофеи дважды)
    if (gameState !== 'playing') return;
    if (currentMode === 'trial') {
        const aliveEnemies = enemies.filter(e => e && e.alive !== false && e.hp > 0);
        if (aliveEnemies.length === 0) {
            gameState = 'win';
            // No coins or trophies for trial mode
            syncResultOverlay('win');
        } else if (!tank.alive || tank.hp <= 0) {
            gameState = 'lose';
            // No trophies lost for trial mode
            syncResultOverlay('lose');
        }
    } else if (enemies.length === 0) {
        gameState = 'win';
        if (currentMode === 'single') {
            coins += 20;
            trophies += 3; // single trophy reward
        } else if (currentMode === 'team') {
            coins += 20;
            trophies += 3; // team trophy reward
        } else if (currentMode === 'duel') {
            coins += 30;
            trophies += 2; // duel trophy reward
        } else if (currentMode === 'onevsall') {
            coins += 80;
            trophies += 10; // one vs all trophy reward
        }
        syncResultOverlay('win');
    } else if (!tank.alive || tank.hp <= 0) {
        gameState = 'lose';
        if (currentMode === 'single' || currentMode === 'duel') {
            loseTrophies(1); // lose 1 trophy
        } else if (currentMode === 'team') {
            loseTrophies(1); // lose 1 trophy
        } else if (currentMode === 'onevsall') {
            loseTrophies(5); // lose 5 trophies in one vs all
        }
        syncResultOverlay('lose');
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

