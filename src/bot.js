// bot.js  pathfinding, navigation grid, enemy AI, ally AI

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


function updateEnemyAI() {
    
    // AI для врагов: выбирать ближайшую цель (игрок или другой враг) и действовать
    for (let enemy of enemies) {
      try {
        if (!enemy || !enemy.alive) continue;
        // Training dummies: skip all AI, just stand still
        if (enemy.isDummy) continue;
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

        // electric enemy ultimate handling: charge, then release nova (stationary while charging)
        if (enemy.isUltimateActive) {
            enemy.ultimateTimer = (enemy.ultimateTimer || 0) - 1;
            if (enemy.ultimateTimer <= 0) {
                enemy.isUltimateActive = false;
                const cx = enemy.x + enemy.w/2;
                const cy = enemy.y + enemy.h/2;
                if (typeof createElectricNova === 'function') {
                    createElectricNova(cx, cy, 200, 2, enemy.team);
                }
                for (let p = 0; p < 40; p++) spawnParticle(cx + (Math.random()-0.5)*120, cy + (Math.random()-0.5)*120, '#00f2ff', 0.9);
            }
            if (enemy.ultimateCooldown > 0) enemy.ultimateCooldown--;
            // remain stationary and skip other actions while charging
            continue;
        }
        if (enemy.ultimateCooldown > 0) enemy.ultimateCooldown--;
        
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

        // Mirror shield — tick and cooldown always run (outside try/catch)
        if (enemy.mirrorShieldActive === undefined) enemy.mirrorShieldActive = false;
        if (enemy.mirrorShieldTimer === undefined) enemy.mirrorShieldTimer = 0;
        if (enemy.mirrorShieldCooldown === undefined) enemy.mirrorShieldCooldown = 0;
        if (enemy.mirrorShieldActive) {
            enemy.mirrorShieldTimer--;
            if (enemy.mirrorShieldTimer <= 0) enemy.mirrorShieldActive = false;
        }
        if (enemy.mirrorShieldCooldown > 0) enemy.mirrorShieldCooldown--;

        // Enemy ability usage heuristics (skip abilities in onevsall for perf)
        if (currentMode !== 'onevsall') {
        try {
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
                bullets.push({ x: sx, y: sy, w: 10, h: 10, vx: Math.cos(ang) * 10, vy: Math.sin(ang) * 10, life: 300, owner: 'enemy', team: enemy.team, type: 'plasmaBlast', damage: 350, piercing: true, destroysWalls: true });
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

            // electric: charge ultimate when close to targets
            if (enemy.tankType === 'electric' && (!enemy.isUltimateActive) && (!enemy.ultimateCooldown || enemy.ultimateCooldown <= 0) && distToNearest < 280 && Math.random() < 0.035) {
                enemy.isUltimateActive = true;
                enemy.ultimateTimer = 60; // 1 second charge
                enemy.ultimateCooldown = 480; // 8s cooldown
                // Visual charge particles
                for (let k = 0; k < 30; k++) spawnParticle(enemy.x + enemy.w/2 + (Math.random()-0.5)*enemy.w*1.2, enemy.y + enemy.h/2 + (Math.random()-0.5)*enemy.h*1.2, '#00d4ff', 1);
                enemy.fireCooldown = 60;
            }

        } catch (errAbility) { /* ignore ability errors for AI */ }
        }

        // imitator bot: periodically transform into a random tank type for 6 seconds
        if (enemy.originalTankType === 'imitator' || enemy.tankType === 'imitator') {
            // Initialize imitator state flags if missing
            if (enemy.imitatorActive === undefined) enemy.imitatorActive = false;
            if (enemy.imitatorTimer === undefined) enemy.imitatorTimer = 0;
            if (enemy.originalTankType === undefined) enemy.originalTankType = 'imitator';

            if (!enemy.imitatorActive && Math.random() < 0.004) {
                // Find nearest tank (player or other enemy) to copy its type
                const ex = enemy.x + enemy.w / 2;
                const ey = enemy.y + enemy.h / 2;
                let nearestType = null;
                let nearestDist = Infinity;
                // Check player
                if (tank && tank.alive !== false) {
                    const d = Math.hypot((tank.x + tank.w/2) - ex, (tank.y + tank.h/2) - ey);
                    if (d < nearestDist) { nearestDist = d; nearestType = tankType || 'normal'; }
                }
                // Check other enemies
                for (const other of enemies) {
                    if (other === enemy || !other || other.alive === false) continue;
                    const d = Math.hypot((other.x + other.w/2) - ex, (other.y + other.h/2) - ey);
                    if (d < nearestDist) { nearestDist = d; nearestType = other.tankType || 'normal'; }
                }
                // Don't copy imitator or unknown types
                const validTypes = ['normal','ice','fire','buratino','toxic','plasma','musical','illuminat','mirror','machinegun','waterjet','buckshot'];
                const picked = (nearestType && validTypes.includes(nearestType)) ? nearestType : validTypes[Math.floor(Math.random() * validTypes.length)];
                enemy.originalTankType = 'imitator';
                enemy.imitatorActive = true;
                enemy.imitatorTimer = 360;
                enemy.tankType = picked;
                const newMaxHp = (typeof tankMaxHpByType !== 'undefined' && tankMaxHpByType[picked]) || 300;
                enemy.hp = Math.min(enemy.hp, newMaxHp);
            }
            if (enemy.imitatorActive) {
                enemy.imitatorTimer--;
                if (enemy.imitatorTimer <= 0) {
                    enemy.imitatorActive = false;
                    enemy.tankType = 'imitator';
                }
            }
        }

        // Mirror: proactive shield activation (outside try/catch so errors are visible)
        if (enemy.tankType === 'mirror' && !enemy.mirrorShieldActive && enemy.mirrorShieldCooldown <= 0) {
            const ex = enemy.x + enemy.w / 2;
            const ey = enemy.y + enemy.h / 2;
            for (const bb of bullets) {
                if (bb.team === enemy.team) continue;
                const dist = Math.hypot(bb.x - ex, bb.y - ey);
                if (dist < 400) {
                    const dot = bb.vx * (ex - bb.x) + bb.vy * (ey - bb.y);
                    if (dot > 0) {
                        enemy.mirrorShieldActive = true;
                        enemy.mirrorShieldTimer = 120;
                        enemy.mirrorShieldCooldown = 60 * 14;
                        break;
                    }
                }
            }
        }

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
                        const recalcDelay = (currentMode === 'onevsall') ? 60 : 30;
                        enemy.pathRecalc = recalcDelay + Math.floor(Math.random() * 30);
                    } else {
                        enemy.path = [];
                        enemy.pathIndex = 0;
                        enemy.pathRecalc = 15;
                    }
                } else {
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
        
        // --- AI MACHINEGUN HEAT LOGIC (exact same as player) ---
        const tt = enemy.tankType || 'normal';
        if (tt === 'machinegun') {
            enemy.heat = enemy.heat || 0;
            const HEAT_MAX = 240; // 4 seconds at 60fps
            const COOL_RATE = 2;  // 2 seconds to cool down
            if (enemy.overheated) {
                // Overheated: cool down, can't shoot
                enemy.heat -= COOL_RATE;
                if (enemy.heat <= 0) { enemy.heat = 0; enemy.overheated = false; }
                if (Math.random() > 0.5) spawnParticle(enemy.x + enemy.w/2, enemy.y + enemy.h/2, '#555', 0.5);
            } else {
                // heat++ every frame — identical to player holding Space
                enemy.heat++;
                if (enemy.heat >= HEAT_MAX) {
                    enemy.heat = HEAT_MAX;
                    enemy.overheated = true;
                    for(let i=0; i<10; i++) spawnParticle(enemy.x + enemy.w/2, enemy.y + enemy.h/2, '#fff', 1);
                }
            }
        } else { enemy.heat = 0; enemy.overheated = false; }
        // --------------------------------

        const mgShootProb = (tt === 'machinegun') ? 0.7 : (tt === 'waterjet') ? 1.0 : shootProb;
        if (enemy.fireCooldown > 0) enemy.fireCooldown--;
        if (enemy.fireCooldown <= 0 && Math.random() < mgShootProb && !enemy.overheated) {
            // No extra heat here — heat is managed per-frame above based on fireCooldown state

            let b = null;
            if (tt === 'plasma') {
                b = { x: enemy.x + enemy.w/2 + Math.cos(enemy.turretAngle) * 25, y: enemy.y + enemy.h/2 + Math.sin(enemy.turretAngle) * 25, w:10, h:10, vx:Math.cos(enemy.turretAngle)*8, vy:Math.sin(enemy.turretAngle)*8, life:200, owner:'enemy', team: enemy.team, type:'plasma', damage:350, piercing:true };
            } else if (tt === 'toxic') {
                b = { x: enemy.x + enemy.w/2 + Math.cos(enemy.turretAngle) * 25, y: enemy.y + enemy.h/2 + Math.sin(enemy.turretAngle) * 25, w:6, h:6, vx:Math.cos(enemy.turretAngle)*7, vy:Math.sin(enemy.turretAngle)*7, life:500, owner:'enemy', team: enemy.team, type:'toxic', explodeTimer:45, spawned:5 };
            } else if (tt === 'fire') {
                // Fire-type enemy uses flamethrower cone: spawn multiple flame particles
                const flameCountE = 14;
                const baseAngE = enemy.turretAngle;
                const spreadE = 0.7;
                for (let f = 0; f < flameCountE; f++) {
                    const t = flameCountE <= 1 ? 0.5 : f / (flameCountE - 1);
                    const ang = baseAngE + (t - 0.5) * spreadE + (Math.random() - 0.5) * 0.06;
                    const sx = enemy.x + enemy.w/2 + Math.cos(ang) * 18;
                    const sy = enemy.y + enemy.h/2 + Math.sin(ang) * 18;
                    const speed = 3.5 + Math.random() * 1.2;
                    flames.push({ x: sx, y: sy, vx: Math.cos(ang) * speed, vy: Math.sin(ang) * speed, life: 28 + Math.floor(Math.random() * 17), damage: 28, team: enemy.team, owner: 'enemy' });
                }
            } else if (tt === 'buratino') {
                // Enemy buratino: enter artillery mode, spawn target circle and visual rockets (like player)
                const distE = 300;
                const targetXE = enemy.x + enemy.w/2 + Math.cos(enemy.turretAngle) * distE;
                const targetYE = enemy.y + enemy.h/2 + Math.sin(enemy.turretAngle) * distE;
                const targetCircleE = { x: targetXE, y: targetYE, radius: 100, color: enemy.color, timer: 180, type: 'targetCircle', team: enemy.team };
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
                        objects.push({ type: 'visualRocket', x: sx, y: sy, vx: vx, vy: vy, life: life, delay: delay, w: 4, h: 3, color: '#000', angOffset: angOffset, target: targetPos, team: enemy.team });
                    }
                }
            } else if (tt === 'illuminat') {
                if (!enemy.beamActive && (!enemy.beamCooldown || enemy.beamCooldown <= 0)) {
                    enemy.beamActive = true;
                    enemy.beamStartTime = Date.now();
                    enemy.fireCooldown = 240;
                }
            } else if (tt === 'waterjet') {
                // Water jet: activate continuous stream for ~1.5s
                enemy.waterjetActive = true;
                enemy.waterjetTimer = 90;
            } else if (tt === 'buckshot') {
                // Buckshot: 5 pellets in a spread pattern
                const speed = 6;
                const life = 12; // 0.2 second lifetime
                const baseAng = enemy.turretAngle;
                const spreadAngle = 0.6; // total spread in radians (~34 degrees)
                const startXE = enemy.x + enemy.w/2 + Math.cos(baseAng) * 20;
                const startYE = enemy.y + enemy.h/2 + Math.sin(baseAng) * 20;
                
                // Fire 5 pellets in a spread
                for (let i = 0; i < 5; i++) {
                    const pelletAngle = baseAng + (i - 2) * (spreadAngle / 4) + (Math.random() - 0.5) * 0.08;
                    bullets.push({
                        x: startXE + Math.cos(pelletAngle) * 2 * i,
                        y: startYE + Math.sin(pelletAngle) * 2 * i,
                        w: 6, h: 6,
                        vx: Math.cos(pelletAngle) * speed,
                        vy: Math.sin(pelletAngle) * speed,
                        life: life,
                        owner: 'enemy',
                        team: enemy.team,
                        type: 'buckshot',
                        damage: 125 // Each pellet deals 125 damage
                    });
                }
                enemy.fireCooldown = 40; // ~667ms (2x slower than normal 333ms)
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
                    props.damage = 350; props.w = 10; props.h = 10; props.piercing = true;
                } else if (pType === 'fire') {
                    props.damage = 22; props.w = 5; props.h = 5; 
                } else if (pType === 'toxic') {
                    props = { ...props, type:'toxic', explodeTimer: 45, spawned: 5, w:6, h:6 }; 
                } else if (pType === 'musical') {
                    props.damage = 200; props.w = 12; props.h = 12; props.bounces = 0; props.maxBounces = 3;
                } else if (pType === 'mirror') {
                    props.damage = 100; props.w = 8; props.h = 8;
                } else if (pType === 'ice') {
                    props.type = 'ice'; props.w = 8; props.h = 8; props.speed = 5;
                } else {
                    props.damage = 100; props.w = 6; props.h = 6;
                }
                b = props;
            } else if (tt === 'machinegun') {
                // Machine gun: rapid fire with low damage (match player projectile)
                const speed = 7;
                const life = 80;
                const ang = enemy.turretAngle + (Math.random() - 0.5) * 0.05;
                b = { x: enemy.x + enemy.w/2 + Math.cos(ang) * 35, y: enemy.y + enemy.h/2 + Math.sin(ang) * 35, w:7, h:7, vx:Math.cos(ang)*speed, vy:Math.sin(ang)*speed, life:life, owner:'enemy', team: enemy.team, type: 'machinegun', damage: 20 };
            } else if (tt === 'musical') {
                // Enemy musical: sound wave projectile that ricochets
                const speed = 6;
                b = { x: enemy.x + enemy.w/2 + Math.cos(enemy.turretAngle) * 25, y: enemy.y + enemy.h/2 + Math.sin(enemy.turretAngle) * 25, w: 12, h: 12, vx: Math.cos(enemy.turretAngle) * speed, vy: Math.sin(enemy.turretAngle) * speed, life: 180, team: enemy.team, type: 'musical', damage: 200, bounces: 0, maxBounces: 3 };
            } else if (tt === 'imitator') {
                // imitator base form: prismatic bullet, damage 2 (same as player)
                b = { x: enemy.x + enemy.w/2 + Math.cos(enemy.turretAngle) * 25, y: enemy.y + enemy.h/2 + Math.sin(enemy.turretAngle) * 25, w: 9, h: 9, vx:Math.cos(enemy.turretAngle)*5, vy:Math.sin(enemy.turretAngle)*5, life:100, owner:'enemy', team: enemy.team, type: 'imitator', damage: 200 };
            } else if (tt === 'electric') {
                // Enemy electric: fire electric homing ball
                b = {
                    x: enemy.x + enemy.w/2 + Math.cos(enemy.turretAngle) * 25,
                    y: enemy.y + enemy.h/2 + Math.sin(enemy.turretAngle) * 25,
                    w: 12, h: 12,
                    vx: Math.cos(enemy.turretAngle) * 4,
                    vy: Math.sin(enemy.turretAngle) * 4,
                    life: 300,
                    maxLife: 300,
                    owner: 'enemy',
                    team: enemy.team,
                    type: 'electricBall',
                    damage: 150,
                    homingStrength: 0.15,
                    hitChain: []
                };
            } else {
                // normal or ice and other types default to normal shell
                const w = (tt === 'ice') ? 8 : 9;
                b = { x: enemy.x + enemy.w/2 + Math.cos(enemy.turretAngle) * 25, y: enemy.y + enemy.h/2 + Math.sin(enemy.turretAngle) * 25, w: w, h: w, vx:Math.cos(enemy.turretAngle)*6, vy:Math.sin(enemy.turretAngle)*6, life:100, owner:'enemy', team: enemy.team, type: (tt === 'ice') ? 'ice' : 'normal' };
            }
            if (b) bullets.push(b);
            // Fire-type enemies should be able to spray flames more often
            enemy.fireCooldown = (tt === 'fire') ? 10 : (tt === 'buratino') ? 180 : (tt === 'machinegun') ? 5 : (tt === 'waterjet') ? 80 : (tt === 'electric') ? 80 : FIRE_COOLDOWN;
        }
      } catch (err) {
        console.error('Enemy AI Error:', err);
      }
    }
}

function updateAllyAI() {

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

        // Lazy-init mirror shield for allies
        if (ally.mirrorShieldActive === undefined) ally.mirrorShieldActive = false;
        if (ally.mirrorShieldTimer === undefined) ally.mirrorShieldTimer = 0;
        if (ally.mirrorShieldCooldown === undefined) ally.mirrorShieldCooldown = 0;
        // Tick mirror shield for ally
        if (ally.mirrorShieldActive) {
            ally.mirrorShieldTimer--;
            if (ally.mirrorShieldTimer <= 0) ally.mirrorShieldActive = false;
        }
        if (ally.mirrorShieldCooldown > 0) ally.mirrorShieldCooldown--;
        // Activate mirror shield for ally when incoming bullet detected
        if (ally.tankType === 'mirror' && !ally.mirrorShieldActive && ally.mirrorShieldCooldown <= 0) {
            const ax = ally.x + ally.w / 2, ay = ally.y + ally.h / 2;
            let threat = false;
            for (const b of bullets) {
                if (b.team === ally.team) continue;
                if (Math.hypot(b.x - ax, b.y - ay) < 350) {
                    const dot = b.vx * (ax - b.x) + b.vy * (ay - b.y);
                    if (dot > 0) { threat = true; break; }
                }
            }
            if (threat || Math.random() < 0.005) {
                ally.mirrorShieldActive = true;
                ally.mirrorShieldTimer = 120;
                ally.mirrorShieldCooldown = 60 * 14;
            }
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
            
            // --- ALLY MACHINEGUN HEAT LOGIC (exact same as player) ---
            const tt = ally.tankType || 'normal';
            if (tt === 'machinegun') {
                ally.heat = ally.heat || 0;
                const HEAT_MAX = 240; // 4 seconds at 60fps
                const COOL_RATE = 2;  // 2 seconds to cool down
                if (ally.overheated) {
                    ally.heat -= COOL_RATE;
                    if (ally.heat <= 0) { ally.heat = 0; ally.overheated = false; }
                    if (Math.random() > 0.5) spawnParticle(ally.x + ally.w/2, ally.y + ally.h/2, '#555', 0.5);
                } else {
                    // heat++ every frame — identical to player holding Space
                    ally.heat++;
                    if (ally.heat >= HEAT_MAX) {
                        ally.heat = HEAT_MAX;
                        ally.overheated = true;
                        for(let i=0; i<10; i++) spawnParticle(ally.x + ally.w/2, ally.y + ally.h/2, '#fff', 1);
                    }
                }
            } else { ally.heat = 0; ally.overheated = false; }
            // --------------------------------

        const mgShootProbA = (tt === 'machinegun') ? 0.7 : (tt === 'waterjet') ? 1.0 : shootProb;
            if (ally.fireCooldown > 0) ally.fireCooldown--;
            if (ally.fireCooldown <= 0 && Math.random() < mgShootProbA && !ally.overheated) {
                // Heat managed per-frame above

                let b = null;
                if (tt === 'plasma') {
                    b = { x: ally.x + ally.w/2 + Math.cos(ally.turretAngle)*25, y: ally.y + ally.h/2 + Math.sin(ally.turretAngle)*25, w:10, h:10, vx:Math.cos(ally.turretAngle)*8, vy:Math.sin(ally.turretAngle)*8, life:200, owner:'ally', team: ally.team, type:'plasma', damage:350, piercing:true };
                } else if (tt === 'toxic') {
                    b = { x: ally.x + ally.w/2 + Math.cos(ally.turretAngle)*25, y: ally.y + ally.h/2 + Math.sin(ally.turretAngle)*25, w:6, h:6, vx:Math.cos(ally.turretAngle)*7, vy:Math.sin(ally.turretAngle)*7, life:500, owner:'ally', team: ally.team, type:'toxic', explodeTimer:45, spawned:5 };
                } else if (tt === 'fire') {
                    // Ally fire-type uses flamethrower: spawn flame particles
                        const flameCountA = 14;
                    const baseAngA = ally.turretAngle;
                    const spreadA = 0.7;
                    for (let f = 0; f < flameCountA; f++) {
                        const t = flameCountA <= 1 ? 0.5 : f / (flameCountA - 1);
                        const ang = baseAngA + (t - 0.5) * spreadA + (Math.random() - 0.5) * 0.06;
                        const sx = ally.x + ally.w/2 + Math.cos(ang) * 18;
                        const sy = ally.y + ally.h/2 + Math.sin(ang) * 18;
                        const speed = 3.5 + Math.random() * 1.2;
                        flames.push({ x: sx, y: sy, vx: Math.cos(ang) * speed, vy: Math.sin(ang) * speed, life: 28 + Math.floor(Math.random() * 17), damage: 28, team: ally.team, owner: 'ally' });
                    }
                } else if (tt === 'buratino') {
                    // Ally buratino: enter artillery mode, spawn target circle and visual rockets (like player and enemy)
                    const distA = 300;
                    const targetXA = ally.x + ally.w/2 + Math.cos(ally.turretAngle) * distA;
                    const targetYA = ally.y + ally.h/2 + Math.sin(ally.turretAngle) * distA;
                    const targetCircleA = { x: targetXA, y: targetYA, radius: 100, color: ally.color, timer: 180, type: 'targetCircle', team: ally.team };
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
                            objects.push({ type: 'visualRocket', x: sx, y: sy, vx: vx, vy: vy, life: life, delay: delay, w: 4, h: 3, color: '#000', angOffset: angOffset, target: targetPos, team: ally.team });
                        }
                    }
                    const w = (tt === 'ice') ? 8 : 9;
                    b = { x: ally.x + ally.w/2 + Math.cos(ally.turretAngle)*25, y: ally.y + ally.h/2 + Math.sin(ally.turretAngle)*25, w: w, h: w, vx:Math.cos(ally.turretAngle)*6, vy:Math.sin(ally.turretAngle)*6, life:100, owner:'ally', team: ally.team, type: (tt === 'ice') ? 'ice' : 'normal' };
                } else if (tt === 'musical') {
                    // Ally musical: sound wave projectile that ricochets
                    const speed = 6;
                    b = { x: ally.x + ally.w/2 + Math.cos(ally.turretAngle) * 25, y: ally.y + ally.h/2 + Math.sin(ally.turretAngle) * 25, w: 12, h: 12, vx: Math.cos(ally.turretAngle) * speed, vy: Math.sin(ally.turretAngle) * speed, life: 180, team: ally.team, type: 'musical', damage: 200, bounces: 0, maxBounces: 3 };
                } else if (tt === 'illuminat') {
                    // Ally illuminat: activate beam
                    if (!ally.beamActive && (!ally.beamCooldown || ally.beamCooldown <= 0)) {
                        ally.beamActive = true;
                        ally.beamStartTime = Date.now();
                        ally.fireCooldown = 240;
                    }
                } else if (tt === 'electric') {
                    // Ally electric: fire electric homing ball
                    b = {
                        x: ally.x + ally.w/2 + Math.cos(ally.turretAngle) * 25,
                        y: ally.y + ally.h/2 + Math.sin(ally.turretAngle) * 25,
                        w: 12, h: 12,
                        vx: Math.cos(ally.turretAngle) * 4,
                        vy: Math.sin(ally.turretAngle) * 4,
                        life: 300,
                        maxLife: 300,
                        owner: 'ally',
                        team: ally.team,
                        type: 'electricBall',
                        damage: 150,
                        homingStrength: 0.15,
                        hitChain: []
                    };
                } else if (tt === 'machinegun') {
                    // Ally machinegun: rapid fire with low damage (match player projectile)
                    const speedA = 7;
                    const lifeA = 80;
                    const angA = ally.turretAngle + (Math.random() - 0.5) * 0.05;
                    b = { x: ally.x + ally.w/2 + Math.cos(angA) * 35, y: ally.y + ally.h/2 + Math.sin(angA) * 35, w:7, h:7, vx:Math.cos(angA)*speedA, vy:Math.sin(angA)*speedA, life:lifeA, owner:'ally', team: ally.team, type: 'machinegun', damage: 20 };
                } else if (tt === 'waterjet') {
                    // Ally waterjet: activate stream for 1.5s
                    ally.waterjetActive = true;
                    ally.waterjetTimer = 90;
                } else if (tt === 'buckshot') {
                    // Ally buckshot: 5 pellets in a spread pattern
                    const speed = 6;
                    const life = 120;
                    const baseAng = ally.turretAngle;
                    const spreadAngle = 0.6;
                    const startXA = ally.x + ally.w/2 + Math.cos(baseAng) * 20;
                    const startYA = ally.y + ally.h/2 + Math.sin(baseAng) * 20;
                    
                    for (let i = 0; i < 5; i++) {
                        const pelletAngle = baseAng + (i - 2) * (spreadAngle / 4) + (Math.random() - 0.5) * 0.08;
                        b = { x: startXA + Math.cos(pelletAngle) * 2 * i, y: startYA + Math.sin(pelletAngle) * 2 * i, w: 6, h: 6, vx: Math.cos(pelletAngle) * speed, vy: Math.sin(pelletAngle) * speed, life: life, owner: 'ally', team: ally.team, type: 'buckshot', damage: 125 };
                        if (b) bullets.push(b);
                    }
                    ally.fireCooldown = 40;
                    b = null; // prevent double push
                }
                if (b) bullets.push(b);
                ally.fireCooldown = (tt === 'fire') ? 10 : (tt === 'buratino') ? 180 : (tt === 'musical') ? 45 : (tt === 'illuminat') ? 240 : (tt === 'machinegun') ? 5 : (tt === 'waterjet') ? 80 : (tt === 'buckshot') ? 40 : (tt === 'electric') ? 80 : FIRE_COOLDOWN;
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
                    const dmg = 80 * unit.beamIntensity;
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
                            } else { 
                                gameState = 'lose'; 
                                loseModeTrophies();
                                syncResultOverlay('lose');
                            }
                            spawnExplosion(tank.x+tank.w/2, tank.y+tank.h/2, 70);
                        } else {
                            if (currentMode === 'war') { 
                                e.alive = false; e.respawnTimer = 600; 
                                spawnExplosion(e.x+e.w/2, e.y+e.h/2, 65);
                            } else {
                                // Check list existence before splicing
                                const idxE = enemies.indexOf(e);
                                if (idxE !== -1) { enemies.splice(idxE, 1); }
                                const idxA = allies.indexOf(e);
                                if (idxA !== -1) { allies.splice(idxA, 1); }
                                
                                spawnExplosion(e.x+e.w/2, e.y+e.h/2, 65);
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

    // ── Waterjet stream physics ────────────────────────────────────────
    function updateUnitWaterjet(unit, targets) {
        const isPlayer = unit === tank;
        const activeType = isPlayer ? tankType : (unit.tankType || 'normal');
        if (activeType !== 'waterjet') return;
        // Non-player: manage auto shut-off timer
        if (!isPlayer) {
            if (unit.waterjetTimer > 0) unit.waterjetTimer--;
            else unit.waterjetActive = false;
        }
        const isActive = isPlayer ? (keys['Space'] && tank.alive !== false) : (unit.waterjetActive === true);
        if (!isActive) { unit.waterjetBeamLen = 0; unit.waterjetActive = false; return; }

        unit.waterjetActive = true;
        const maxLen = 260;
        const startX = unit.x + unit.w / 2;
        const startY = unit.y + unit.h / 2;
        const angle = unit.turretAngle;
        const rayEndX = startX + Math.cos(angle) * maxLen;
        const rayEndY = startY + Math.sin(angle) * maxLen;
        // Raycast: stop at walls AND boxes/barrels
        let beamLen = maxLen;
        let hitBox = null;
        for (const obj of objects) {
            if (obj.type !== 'box' && obj.type !== 'barrel' && obj.type !== 'wall') continue;
            if (lineIntersectsRect(startX, startY, rayEndX, rayEndY, obj.x, obj.y, obj.w, obj.h)) {
                const d = getRayRectDistance(startX, startY, angle, maxLen, obj);
                if (d < beamLen) {
                    beamLen = d;
                    hitBox = (obj.type === 'box' || obj.type === 'barrel') ? obj : null;
                }
            }
        }
        // Destroy box at impact point
        if (hitBox) {
            hitBox._waterjetDmg = (hitBox._waterjetDmg || 0) + 1;
            if (hitBox._waterjetDmg >= 8) { // ~8 ticks = destroy
                if (hitBox.type === 'barrel') {
                    explodeBarrel(hitBox);
                } else {
                    for (let k = 0; k < 6; k++) spawnParticle(hitBox.x + hitBox.w/2, hitBox.y + hitBox.h/2);
                    const idxB = objects.indexOf(hitBox);
                    if (idxB !== -1) objects.splice(idxB, 1);
                    navNeedsRebuild = true;
                }
            }
        }
        unit.waterjetBeamLen = beamLen;
        // Track whether beam stopped at a wall (not a box/barrel) for visual splash
        unit.waterjetHitWall = (beamLen < maxLen && hitBox === null);
        unit.waterjetHitTarget = false;
        const endX = startX + Math.cos(angle) * beamLen;
        const endY = startY + Math.sin(angle) * beamLen;

        const distToSeg = (px, py, x1, y1, x2, y2) => {
            const dx = x2 - x1, dy = y2 - y1;
            const lenSq = dx * dx + dy * dy || 1;
            const t = Math.max(0, Math.min(1, ((px - x1) * dx + (py - y1) * dy) / lenSq));
            return Math.hypot(px - (x1 + t * dx), py - (y1 + t * dy));
        };

        for (let j = targets.length - 1; j >= 0; j--) {
            const e = targets[j];
            if (!e || (e.alive === false && e !== tank)) continue;
            if (e.team === unit.team) continue;
            if (e.mirrorShieldActive) continue;
            const cx = e.x + (e.w || 0) / 2;
            const cy = e.y + (e.h || 0) / 2;
            // Bots aim imprecisely (AI rotation), so give them a wider hit zone vs player using mouse
            const hitRadius = Math.max(e.w || 0, e.h || 0) * 0.5 + (isPlayer ? 7 : 18);
            if (distToSeg(cx, cy, startX, startY, endX, endY) > hitRadius) continue;
            unit.waterjetHitTarget = true;

            // Damage per frame (11/tick)
            e.hp -= 11;
            // Slow: brief recurring stun simulates medium slowdown
            e.paralyzed = true;
            e.paralyzedTime = Math.max(e.paralyzedTime || 0, 6);
            e.frozenEffect = Math.max(e.frozenEffect || 0, 6);
            // Knockback along beam direction (medium force)
            const kx = Math.cos(angle) * 1.3;
            const ky = Math.sin(angle) * 1.3;
            e.x = Math.max(0, Math.min((worldWidth || 1800) - (e.w || 20), e.x + kx));
            e.y = Math.max(0, Math.min((worldHeight || 1400) - (e.h || 20), e.y + ky));
            // Water splash particles
            if (window.effectsEnabled !== false) {
                for (let p = 0; p < 2; p++) {
                    const sa = angle + (Math.random() - 0.5) * 1.6;
                    particles.push({ x: cx + (Math.random()-0.5)*10, y: cy + (Math.random()-0.5)*10,
                        vx: Math.cos(sa)*(1+Math.random()*2.5), vy: Math.sin(sa)*(1+Math.random()*2.5),
                        life: 0.4+Math.random()*0.4, size: 1.5+Math.random()*2, color: '#3498db' });
                }
            }
            // Death handling
            if (e.hp <= 0) {
                if (e === tank) {
                    if (currentMode === 'war') { tank.alive = false; tank.respawnTimer = 600; }
                    else { gameState = 'lose'; loseModeTrophies(); syncResultOverlay('lose'); }
                    spawnExplosion(tank.x+tank.w/2, tank.y+tank.h/2, 70);
                } else {
                    if (currentMode === 'war') { e.alive = false; e.respawnTimer = 600; spawnExplosion(e.x+e.w/2, e.y+e.h/2, 65); }
                    else {
                        const idxE = enemies.indexOf(e); if (idxE !== -1) { enemies.splice(idxE, 1); }
                        const idxA = allies.indexOf(e); if (idxA !== -1) allies.splice(idxA, 1);
                        spawnExplosion(e.x+e.w/2, e.y+e.h/2, 65);
                    }
                }
            }
        }
    }
    // Waterjet: Player
    if (tankType === 'waterjet') updateUnitWaterjet(tank, enemies);
    // Waterjet: Allies
    for (let i = allies.length - 1; i >= 0; i--) {
        if (allies[i].tankType === 'waterjet') updateUnitWaterjet(allies[i], enemies);
    }
    // Waterjet: Enemies
    for (let i = enemies.length - 1; i >= 0; i--) {
        if (enemies[i].tankType === 'waterjet') updateUnitWaterjet(enemies[i], [tank, ...allies]);
    }

}
