// physics.js  collision detection, explosions, particles, shooting, movement

// Apply damage with god mode multiplier if enabled
function applyPlayerDamage(damage) {
    if (typeof godMode !== 'undefined' && godMode) {
        return damage * 1000; // Massive damage in god mode
    }
    return damage;
}

// Apply Roman shield or mechShield reduction to incoming damage received by the player
function applyIncomingPlayerDamage(damage) {
    if (typeof tank !== 'undefined' && tank.romanShieldActive) {
        return Math.round(damage * 0.5);
    }
    if (typeof tank !== 'undefined' && typeof tankType !== 'undefined' && tankType === 'mechShield' && tank.mechShieldActive) {
        return Math.round(damage * 0.4); // 60% reduction
    }
    return damage;
}

function getEntityTankType(entity) {
    if (!entity) return '';
    if (typeof tank !== 'undefined' && entity === tank) {
        return typeof tankType !== 'undefined' ? tankType : (entity.tankType || 'normal');
    }
    return entity.tankType || 'normal';
}

function isEgyptianTank(entity) {
    return getEntityTankType(entity) === 'egyptian';
}

function applyTargetDamageModifiers(entity, damage) {
    if (entity && (entity.sandCurseTimer || 0) > 0) {
        return damage * 1.25;
    }
    return damage;
}

function dealDamageToEntity(entity, damage) {
    const finalDamage = applyTargetDamageModifiers(entity, damage);
    entity.hp = (entity.hp || 0) - finalDamage;
    return finalDamage;
}

function refreshSandstormDebuff(entity, duration = 30) {
    if (!entity || entity.alive === false || isEgyptianTank(entity)) return;
    entity.sandCurseTimer = Math.max(entity.sandCurseTimer || 0, duration);
    entity.sandBlindTimer = Math.max(entity.sandBlindTimer || 0, duration);
    entity.sandNoShootTimer = Math.max(entity.sandNoShootTimer || 0, duration);
    if (typeof tank !== 'undefined' && entity !== tank) {
        entity.confused = Math.max(entity.confused || 0, 4);
    }
}

function tickSandstormDebuff(entity) {
    if (!entity) return;
    if ((entity.sandCurseTimer || 0) > 0) {
        entity.sandCurseTimer--;
        entity._sandCurseFxTick = ((entity._sandCurseFxTick || 0) + 1) % 6;
        if (entity._sandCurseFxTick === 0 && typeof spawnParticle === 'function' && window.effectsEnabled !== false && particles.length < 220) {
            const cx = entity.x + (entity.w || 0) / 2;
            const cy = entity.y + (entity.h || 0) / 2;
            const ang = Math.random() * Math.PI * 2;
            const dist = Math.max(entity.w || 0, entity.h || 0) * (0.18 + Math.random() * 0.46);
            spawnParticle(cx + Math.cos(ang) * dist, cy + Math.sin(ang) * dist, 'rgba(8, 8, 14, 0.94)', 0.85);
        }
    } else {
        entity._sandCurseFxTick = 0;
    }
    if ((entity.sandBlindTimer || 0) > 0) entity.sandBlindTimer--;
    if ((entity.sandNoShootTimer || 0) > 0) entity.sandNoShootTimer--;
}

function checkRectCollision(r1, r2) {
    return r1.x < r2.x + r2.w && r1.x + r1.w > r2.x &&
           r1.y < r2.y + r2.h && r1.y + r1.h > r2.y;
}

function circleIntersectsRect(cx, cy, radius, rect) {
    const nearestX = Math.max(rect.x, Math.min(cx, rect.x + rect.w));
    const nearestY = Math.max(rect.y, Math.min(cy, rect.y + rect.h));
    const dx = cx - nearestX;
    const dy = cy - nearestY;
    return (dx * dx + dy * dy) <= radius * radius;
}

function applyPharaohCurse(entity, duration = 300) {
    if (!entity || entity.alive === false || isEgyptianTank(entity)) return false;
    entity.sandCurseTimer = Math.max(entity.sandCurseTimer || 0, duration);
    return true;
}

function createPharaohSwarm(source, duration = 300) {
    if (!source || !Array.isArray(objects)) return null;
    const swarm = {
        type: 'pharaohSwarm',
        x: source.x + (source.w || 0) / 2,
        y: source.y + (source.h || 0) / 2,
        radius: 78,
        life: duration,
        maxLife: duration,
        team: source.team,
        speed: 1.35,
        damagePerTick: 1,
        damageInterval: 30,
        curseDuration: duration,
        wobbleSeed: Math.random() * Math.PI * 2
    };
    objects.push(swarm);
    return swarm;
}

function getNearestPharaohSwarmTarget(swarm) {
    if (!swarm) return null;
    let bestTarget = null;
    let bestDistance = Infinity;
    const consider = (entity) => {
        if (!entity || entity.alive === false || entity.team === swarm.team) return;
        const ex = entity.x + (entity.w || 0) / 2;
        const ey = entity.y + (entity.h || 0) / 2;
        const distance = Math.hypot(ex - swarm.x, ey - swarm.y);
        if (distance < bestDistance) {
            bestDistance = distance;
            bestTarget = entity;
        }
    };
    if (typeof tank !== 'undefined') consider(tank);
    if (typeof allies !== 'undefined') for (const ally of allies) consider(ally);
    if (typeof enemies !== 'undefined') for (const enemy of enemies) consider(enemy);
    return bestTarget;
}

function applyPharaohSwarmDamage(entity, damage) {
    if (!entity || entity.alive === false) return;
    entity.hp = (entity.hp || 0) - damage;
    if (entity.hp > 0) return;

    const centerX = entity.x + (entity.w || 0) / 2;
    const centerY = entity.y + (entity.h || 0) / 2;
    spawnExplosion(centerX, centerY, entity === tank ? 70 : 65);

    if (typeof tank !== 'undefined' && entity === tank) {
        if (currentMode === 'war') {
            if ((tank.respawnCount || 0) >= 2) {
                gameState = 'lose';
                loseTrophies(1);
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
        return;
    }

    const removeFromGroup = (group) => {
        const idx = group.indexOf(entity);
        if (idx === -1) return;
        if (currentMode === 'war') {
            entity.alive = false;
            entity.respawnTimer = 600;
        } else {
            group.splice(idx, 1);
        }
    };

    if (typeof allies !== 'undefined' && allies.indexOf(entity) !== -1) {
        removeFromGroup(allies);
        return;
    }
    if (typeof enemies !== 'undefined' && enemies.indexOf(entity) !== -1) {
        removeFromGroup(enemies);
    }
}

function updatePharaohSwarm(swarm) {
    if (!swarm) return;

    const target = getNearestPharaohSwarmTarget(swarm);
    if (target) {
        const tx = target.x + (target.w || 0) / 2;
        const ty = target.y + (target.h || 0) / 2;
        const dx = tx - swarm.x;
        const dy = ty - swarm.y;
        const distance = Math.hypot(dx, dy) || 1;
        const speed = Math.min(swarm.speed || 1.35, distance);
        const wobble = Math.sin((swarm.life || 0) * 0.08 + (swarm.wobbleSeed || 0)) * 0.2;
        const dirX = dx / distance;
        const dirY = dy / distance;
        swarm.x += dirX * speed - dirY * wobble;
        swarm.y += dirY * speed + dirX * wobble;
    }

    swarm._tickCounter = (swarm._tickCounter || 0) + 1;
    const damageNow = swarm._tickCounter % Math.max(1, swarm.damageInterval || 30) === 0;
    const affectEntity = (entity) => {
        if (!entity || entity.alive === false || entity.team === swarm.team) return;
        const rect = { x: entity.x, y: entity.y, w: entity.w || 0, h: entity.h || 0 };
        if (!circleIntersectsRect(swarm.x, swarm.y, swarm.radius || 0, rect)) return;
        applyPharaohCurse(entity, swarm.curseDuration || 300);
        if (damageNow) applyPharaohSwarmDamage(entity, swarm.damagePerTick || 1);
    };

    affectEntity(typeof tank !== 'undefined' ? tank : null);
    if (typeof allies !== 'undefined') for (const ally of allies) affectEntity(ally);
    if (typeof enemies !== 'undefined') for (const enemy of enemies) affectEntity(enemy);

    if (window.effectsEnabled !== false && typeof spawnParticle === 'function' && particles.length < 220 && (swarm.life % 4 === 0)) {
        const ang = Math.random() * Math.PI * 2;
        const dist = (swarm.radius || 0) * (0.2 + Math.random() * 0.65);
        spawnParticle(swarm.x + Math.cos(ang) * dist, swarm.y + Math.sin(ang) * dist, 'rgba(8, 8, 12, 0.92)', 0.75);
    }
}

// Create electric chain lightning - shoots instantly in a direction and chains between enemies
function createElectricChain(startX, startY, angle, baseDamage = 2, ownerTeam = 0, chainedEnemies = []) {
    const rayLength = 800;  // How far the initial ray can reach
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    
    // Find first enemy in the direction of the angle
    let firstHit = null;
    let closestDist = Infinity;
    
    for (let i = 0; i < enemies.length; i++) {
        const e = enemies[i];
        if (!e || !e.alive || e.team === ownerTeam) continue;
        if (chainedEnemies.includes(i)) continue;  // Already hit by this chain
        
        const ex = e.x + e.w / 2;
        const ey = e.y + e.h / 2;
        
        // Check if enemy is roughly in the direction of angle (within 45 degrees)
        const toEnemyAngle = Math.atan2(ey - startY, ex - startX);
        let angleDiff = toEnemyAngle - angle;
        
        // Normalize angle difference
        while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
        while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
        
        // Only consider enemies within 60 degrees forward cone
        if (Math.abs(angleDiff) > Math.PI / 3) continue;
        
        const dist = Math.hypot(ex - startX, ey - startY);
        if (dist < rayLength && dist < closestDist) {
            closestDist = dist;
            firstHit = i;
        }
    }
    
    // If found a target, create ray to it
    if (firstHit !== null) {
        const targetE = enemies[firstHit];
        let targetX = targetE.x + targetE.w / 2;
        let targetY = targetE.y + targetE.h / 2;
        
        // Check if ray hits any walls/obstacles and shorten if needed
        let rayEndX = targetX;
        let rayEndY = targetY;
        let closestWallDist = Math.hypot(targetX - startX, targetY - startY);
        
        // Check against all objects (walls, boxes, barrels)
        for (const obj of objects) {
            if (lineIntersectsRect(startX, startY, targetX, targetY, obj.x, obj.y, obj.w, obj.h)) {
                // Ray hits this object - find intersection point and shorten ray
                const dist = getRayRectDistance(startX, startY, Math.atan2(targetY - startY, targetX - startX), closestWallDist, obj);
                if (dist < closestWallDist) {
                    closestWallDist = dist;
                    rayEndX = startX + Math.cos(Math.atan2(targetY - startY, targetX - startX)) * (dist - 10);
                    rayEndY = startY + Math.sin(Math.atan2(targetY - startY, targetX - startX)) * (dist - 10);
                }
            }
        }
        
        // Update target position if we hit a wall
        targetX = rayEndX;
        targetY = rayEndY;
        
        const chainLevel = chainedEnemies.length;
        const damage = baseDamage * Math.pow(0.75, chainLevel);
        
        // Damage the target
        dealDamageToEntity(targetE, damage);
        
        // Add to chained list
        const newChained = [...chainedEnemies, firstHit];
        
        // Create visual electric ray - LONGER DURATION (not quick disappear)
        electricRays.push({
            fromX: startX,
            fromY: startY,
            toX: targetX,
            toY: targetY,
            life: 25,  // Display for 25 frames (~0.42 seconds) - longer than before
            maxLife: 25,
            chainLevel: chainLevel
        });
        
        // Create spark effects
        for (let k = 0; k < 8; k++) {
            spawnParticle(targetX + (Math.random()-0.5)*targetE.w, 
                         targetY + (Math.random()-0.5)*targetE.h, 
                         '#00d4ff', 0.8);
        }
        
        // Chain to next enemy after a delay
        if (targetE.hp > 0) {
            // Find nearest enemy for chaining
            const chainRadius = 150;
            let nextTarget = null;
            let nextDist = Infinity;
            
            for (let i = 0; i < enemies.length; i++) {
                if (newChained.includes(i)) continue;
                const e = enemies[i];
                if (!e || !e.alive || e.team === ownerTeam) continue;
                
                const ex = e.x + e.w / 2;
                const ey = e.y + e.h / 2;
                const d = Math.hypot(ex - targetX, ey - targetY);
                
                if (d < chainRadius && d < nextDist) {
                    nextDist = d;
                    nextTarget = i;
                }
            }
            
            // Continue chain if target found
            if (nextTarget !== null) {
                const nextE = enemies[nextTarget];
                setTimeout(() => {
                    if (typeof createElectricChain === 'function' && nextE && nextE.alive) {
                        createElectricChain(targetX, targetY, 
                                         Math.atan2(nextE.y + nextE.h/2 - targetY, 
                                                   nextE.x + nextE.w/2 - targetX),
                                         baseDamage, ownerTeam, newChained);
                    }
                }, 50);  // 50ms delay before next chain
            }
        }
        
        // Handle death from electric damage
        if (targetE.hp <= 0) {
            if (currentMode === 'war') {
                targetE.alive = false;
                targetE.respawnTimer = 600;
                spawnExplosion(targetE.x + targetE.w/2, targetE.y + targetE.h/2, 65);
            } else {
                enemies.splice(firstHit, 1);
                spawnExplosion(targetE.x + targetE.w/2, targetE.y + targetE.h/2, 65);
            }
        }
    }
}

// Update and apply damage from active nova zones
function updateNovaZones() {
    if (typeof novaZones === 'undefined' || !novaZones.length) return;
    
    for (let z = novaZones.length - 1; z >= 0; z--) {
        const zone = novaZones[z];
        zone.life--;
        
        // Apply damage to enemies in range every 10 frames (~0.17 seconds)
        if (zone.life % 10 === 0) {
            for (let i = enemies.length - 1; i >= 0; i--) {
                const e = enemies[i];
                if (!e || !e.alive || e.team === zone.ownerTeam) continue;
                const ex = e.x + e.w / 2;
                const ey = e.y + e.h / 2;
                const d = Math.hypot(ex - zone.centerX, ey - zone.centerY);
                if (d <= zone.radius) {
                    dealDamageToEntity(e, zone.damage);
                    
                    // Particle effect for repeated hits
                    spawnParticle(ex + (Math.random()-0.5)*15, ey + (Math.random()-0.5)*15, '#00d4ff', 0.7);
                    
                    // Death handling
                    if (e.hp <= 0) {
                        if (currentMode === 'war') {
                            e.alive = false;
                            e.respawnTimer = 600;
                            spawnExplosion(e.x + e.w/2, e.y + e.h/2, 65);
                        } else {
                            enemies.splice(i, 1);
                            spawnExplosion(e.x + e.w/2, e.y + e.h/2, 65);
                        }
                    }
                }
            }
        }
        
        // Remove expired zones
        if (zone.life <= 0) {
            novaZones.splice(z, 1);
        }
    }
}

// Create an instant electric nova that hits ALL enemies in radius and ignores walls
let nextIceFieldId = 1;

function isIceFieldTarget(entity, fieldTeam) {
    if (!entity || entity.alive === false) return false;
    if (fieldTeam !== undefined && entity.team === fieldTeam) return false;
    return getEntityTankType(entity) !== 'ice';
}

function isIceFieldCellActive(field, cell) {
    if (!field || !cell) return false;
    const maxLife = field.maxLife || 240;
    const freezeInTicks = field.freezeInTicks || 42;
    const thawOutTicks = field.thawOutTicks || 56;
    const elapsed = maxLife - (field.life || 0);
    const cellElapsed = elapsed - (cell.delay || 0);
    if (cellElapsed < Math.max(10, freezeInTicks * 0.35)) return false;
    return ((field.life || 0) - (cell.delay || 0) * 0.45) > Math.max(6, thawOutTicks * 0.16);
}

function isEntityTouchingIceField(entity, field) {
    if (!entity || !field || !Array.isArray(field.cells) || field.cells.length === 0) return false;
    const centerX = entity.x + (entity.w || 0) / 2;
    const centerY = entity.y + (entity.h || 0) / 2;
    const maxReach = (field.radius || 0) + Math.max(entity.w || 0, entity.h || 0);
    if (Math.hypot(centerX - field.x, centerY - field.y) > maxReach) return false;

    const insetX = (entity.w || 0) * 0.18;
    const insetY = (entity.h || 0) * 0.18;
    const entityRect = {
        x: entity.x + insetX,
        y: entity.y + insetY,
        w: Math.max(8, (entity.w || 0) - insetX * 2),
        h: Math.max(8, (entity.h || 0) - insetY * 2)
    };

    for (const cell of field.cells) {
        if (!isIceFieldCellActive(field, cell)) continue;
        const cellRect = { x: cell.x, y: cell.y, w: cell.size || 25, h: cell.size || 25 };
        if (checkRectCollision(entityRect, cellRect)) return true;
    }
    return false;
}

function applyIceFieldFreeze(entity, field) {
    if (!isIceFieldTarget(entity, field ? field.team : undefined)) return;
    const fieldId = field.fieldId;
    if (!fieldId) return;

    const touchState = entity._iceFieldTouchState || (entity._iceFieldTouchState = {});
    const touchingField = isEntityTouchingIceField(entity, field);

    if (!touchingField) {
        delete touchState[fieldId];
        return;
    }
    if (touchState[fieldId]) return;

    touchState[fieldId] = true;
    const freezeTime = field.contactFreezeTime || 240;
    entity.paralyzed = true;
    entity.paralyzedTime = Math.max(entity.paralyzedTime || 0, freezeTime);
    entity.frozenEffect = Math.max(entity.frozenEffect || 0, freezeTime);

    if (window.effectsEnabled !== false && typeof spawnParticle === 'function' && particles.length < 230) {
        const centerX = entity.x + (entity.w || 0) / 2;
        const centerY = entity.y + (entity.h || 0) / 2;
        for (let i = 0; i < 8; i++) {
            const ang = (i / 8) * Math.PI * 2 + Math.random() * 0.28;
            const dist = Math.max(entity.w || 0, entity.h || 0) * (0.18 + Math.random() * 0.28);
            spawnParticle(centerX + Math.cos(ang) * dist, centerY + Math.sin(ang) * dist, '#a8e6ff', 1.0);
        }
    }
}

function clearIceFieldTouchState(fieldId) {
    if (!fieldId) return;
    const clearFor = (entity) => {
        if (entity && entity._iceFieldTouchState) delete entity._iceFieldTouchState[fieldId];
    };
    if (typeof tank !== 'undefined') clearFor(tank);
    if (typeof allies !== 'undefined') for (const ally of allies) clearFor(ally);
    if (typeof enemies !== 'undefined') for (const enemy of enemies) clearFor(enemy);
}

// Ice Wave Ultimate: creates frozen ground that freezes targets on contact
function createIceNova(centerX, centerY, radius = 220, ownerTeam = 0) {
    const fieldId = nextIceFieldId++;
    if (typeof objects !== 'undefined') {
        const cellSize = (typeof navCell !== 'undefined' && navCell > 0) ? navCell : 25;
        const cells = [];
        const minX = Math.floor((centerX - radius) / cellSize) * cellSize;
        const maxX = Math.ceil((centerX + radius) / cellSize) * cellSize;
        const minY = Math.floor((centerY - radius) / cellSize) * cellSize;
        const maxY = Math.ceil((centerY + radius) / cellSize) * cellSize;
        for (let cellY = minY; cellY <= maxY; cellY += cellSize) {
            for (let cellX = minX; cellX <= maxX; cellX += cellSize) {
                if (cellX + cellSize < 0 || cellY + cellSize < 0 || cellX > worldWidth || cellY > worldHeight) continue;
                const cellCenterX = cellX + cellSize / 2;
                const cellCenterY = cellY + cellSize / 2;
                const distance = Math.hypot(cellCenterX - centerX, cellCenterY - centerY);
                if (distance > radius - cellSize * 0.18) continue;
                const delay = Math.floor((distance / radius) * 34);
                cells.push({
                    x: cellX,
                    y: cellY,
                    size: cellSize,
                    delay: delay,
                    phase: ((cellX * 13 + cellY * 7) % 17) / 17,
                    icicles: ((cellX + cellY) / cellSize) % 3 === 0
                });
            }
        }
        objects.push({
            type: 'iceField',
            fieldId: fieldId,
            x: centerX,
            y: centerY,
            radius: radius,
            team: ownerTeam,
            life: 240,
            maxLife: 240,
            freezeInTicks: 42,
            thawOutTicks: 56,
            contactFreezeTime: 240,
            cells: cells
        });
    }
    // Expanding ring particles
    for (let p = 0; p < 60; p++) {
        const ang = (p / 60) * Math.PI * 2;
        spawnParticle(centerX + Math.cos(ang)*radius*0.7, centerY + Math.sin(ang)*radius*0.7, '#cef2ff', 1.2);
    }
    // Center burst
    for (let p = 0; p < 30; p++) spawnParticle(centerX + (Math.random()-0.5)*radius*0.5, centerY + (Math.random()-0.5)*radius*0.5, '#aef0ff', 0.8);
}

function createElectricNova(centerX, centerY, radius = 200, damage = 200, ownerTeam = 0) {
    // Add nova damage zone (enemies take damage while rays are visible)
    if (typeof novaZones !== 'undefined') {
        novaZones.push({
            centerX: centerX,
            centerY: centerY,
            radius: radius,
            damage: damage,
            ownerTeam: ownerTeam,
            life: 90,  // Same as visual rays (1.5 seconds at 60fps)
            maxLife: 90,
            lastDamageFrame: {}  // Track which enemies were hit this frame
        });
    }
    
    // Loop backwards so we can remove dead enemies safely
    for (let i = enemies.length - 1; i >= 0; i--) {
        const e = enemies[i];
        if (!e || !e.alive || e.team === ownerTeam) continue;
        const ex = e.x + e.w / 2;
        const ey = e.y + e.h / 2;
        const d = Math.hypot(ex - centerX, ey - centerY);
        if (d <= radius) {
            // Visual ray (ignore walls) — 1.5 seconds duration (90 frames at 60fps)
            electricRays.push({
                fromX: centerX,
                fromY: centerY,
                toX: ex,
                toY: ey,
                life: 90,
                maxLife: 90,
                chainLevel: 0,
                ignoreWalls: true,
                isNova: true  // Mark as big nova lightning strike
            });

            // Hit particles
            for (let k = 0; k < 8; k++) spawnParticle(ex + (Math.random()-0.5)*e.w, ey + (Math.random()-0.5)*e.h, '#00d4ff', 0.9);
        }
    }
    // Center burst visual
    for (let p = 0; p < 30; p++) spawnParticle(centerX + (Math.random()-0.5)*radius*0.5, centerY + (Math.random()-0.5)*radius*0.5, '#00f2ff', 0.8);
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
            const damage = Math.max(50, Math.round((1 - dist / R) * 300));
            dealDamageToEntity(t, damage);
            if (t === tank && t.hp <= 0) {
                spawnExplosion(t.x + t.w/2, t.y + t.h/2, 70);
                gameState = 'lose'; 
                loseModeTrophies();
                syncResultOverlay('lose');
            }
        }
    }
    // apply to player
    applyDamageToTank(tank);
    // allies
    for (let i = allies.length - 1; i >= 0; i--) {
        const a = allies[i]; applyDamageToTank(a);
        if (a.hp <= 0) {
            allies.splice(i, 1); spawnExplosion(a.x + a.w/2, a.y + a.h/2, 65);
        }
    }
    // enemies
    for (let i = enemies.length - 1; i >= 0; i--) {
        const e = enemies[i]; applyDamageToTank(e);
        if (e.hp <= 0) {
            enemies.splice(i, 1); spawnExplosion(e.x + e.w/2, e.y + e.h/2, 65);
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
            // Roman shield: full immunity to rocket splash
            if (t === tank && t.romanShieldActive) return;
            const damage = Math.max(50, Math.round((1 - dist / R) * 300));
            dealDamageToEntity(t, damage);
            if (t === tank && t.hp <= 0) {
                spawnExplosion(t.x + t.w/2, t.y + t.h/2, 70);
                gameState = 'lose'; 
                loseModeTrophies();
                syncResultOverlay('lose');
            }
        }
    }
    // apply to player
    applyDamageToTank(tank);
    // allies
    for (let i = allies.length - 1; i >= 0; i--) {
        const a = allies[i]; applyDamageToTank(a);
        if (a.hp <= 0) {
            allies.splice(i, 1); spawnExplosion(a.x + a.w/2, a.y + a.h/2, 65);
        }
    }
    // enemies
    for (let i = enemies.length - 1; i >= 0; i--) {
        const e = enemies[i]; applyDamageToTank(e);
        if (e.hp <= 0) {
            enemies.splice(i, 1); spawnExplosion(e.x + e.w/2, e.y + e.h/2, 65);
        }
    }
}

// Mech-rocket explosion: smaller radius, configurable damage, no friendly-fire to player team
// directHit: entity that was directly struck — always takes full damage regardless of size
function explodeMechRocket(bullet, directHit = null) {
    const R = bullet.explodeRadius || 50;
    const dmgMax = bullet.damage || 150;
    spawnExplosion(bullet.x, bullet.y, R);
    function applyDmg(t) {
        if (!t) return;
        if (t.mirrorShieldActive) return;
        const tx = t.x + (t.w||0)/2, ty = t.y + (t.h||0)/2;
        const dist = Math.hypot(tx - bullet.x, ty - bullet.y);
        // Direct hit entity always takes full damage (large hitboxes won't miss)
        const inRange = dist <= R || t === directHit;
        if (inRange) {
            if (t === tank && t.romanShieldActive) return;
            const damage = (t === directHit && dist > R)
                ? dmgMax
                : Math.max(Math.round(dmgMax * 0.4), Math.round((1 - dist / R) * dmgMax));
            dealDamageToEntity(t, damage);
            if (t === tank && t.hp <= 0) {
                spawnExplosion(t.x + t.w/2, t.y + t.h/2, 60);
                gameState = 'lose'; loseModeTrophies(); syncResultOverlay('lose');
            }
        }
    }
    // Damage based on team
    if (bullet.team !== 0) applyDmg(tank);
    for (let i = allies.length - 1; i >= 0; i--) {
        const a = allies[i];
        if (bullet.team !== (a.team ?? 0)) applyDmg(a);
        if (a.hp <= 0) { allies.splice(i, 1); spawnExplosion(a.x + a.w/2, a.y + a.h/2, 55); }
    }
    for (let i = enemies.length - 1; i >= 0; i--) {
        const e = enemies[i];
        if (bullet.team !== (e.team ?? 1)) applyDmg(e);
        if (e.hp <= 0) { enemies.splice(i, 1); spawnExplosion(e.x + e.w/2, e.y + e.h/2, 55); }
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
            dealDamageToEntity(t, damage);
            t.hitFlashTime = Date.now();
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
        if ((obj.type === 'wall' || obj.type === 'woodenWall') && checkRectCollision(rect, obj)) return false;
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
                damage: 2,
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
            spawned: 5, // spawn protection for 5 ticks
            damage: 50
        });
        tank.fireCooldown = 35; // moderate cooldown
    } else if (tankType === 'plasma') {
        // Plasma tank: fires a single piercing plasma bolt
        const speed = 8;
        const life = 219; // ~35 cells range
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
            damage: 350, // 350 base damage (will be multiplied by upgrades separately)
            piercing: true // can hit multiple targets
        });
        tank.fireCooldown = 300; // 0.2 shots per second
    } else if (tankType === 'musical') {
        // Musical tank: sound wave projectile that ricochets
        const speed = 6;
        bullets.push({
            x: tank.x + tank.w/2 + Math.cos(tank.turretAngle) * 25,
            y: tank.y + tank.h/2 + Math.sin(tank.turretAngle) * 25,
            w: 12, h: 12,
            vx: Math.cos(tank.turretAngle) * speed,
            vy: Math.sin(tank.turretAngle) * speed,
            life: 167,
            team: 0,
            type: 'musical',
            damage: 200, // 200 damage
            bounces: 0,
            maxBounces: 3
        });
        tank.fireCooldown = 80; // 1.33 seconds (slower)
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
        tank.fireCooldown = 30; // 2 shots per second
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
            props.damage = 350; props.w = 10; props.h = 10; props.piercing = true;
        } else if (pType === 'fire') {
            props.damage = 2; props.w = 5; props.h = 5; // flame
        } else if (pType === 'toxic') {
            props = { ...props, type:'toxic', explodeTimer: 45, spawned: 5 }; // mini toxic bomb
        } else if (pType === 'musical') {
            props.damage = 200; props.w = 12; props.h = 12; props.bounces = 0; props.maxBounces = 3; // musical wave
        } else if (pType === 'mirror') {
            // Normal mirror shot
            props.damage = 100; props.w = 8; props.h = 8; // specialized mirror shard
        } else if (pType === 'romanBlade') {
            props.type = 'romanBlade'; props.damage = 125; props.w = 14; props.h = 14; props.bounces = 0; props.maxBounces = 1; props.spinAngle = 0; props.life = 130; props.vx = Math.cos(tank.turretAngle) * 6.5; props.vy = Math.sin(tank.turretAngle) * 6.5;
        } else if (pType === 'spartanSpear') {
            props.type = 'spartanSpear'; props.damage = 80; props.w = 5; props.h = 5; props.life = 130; props.hitEntities = []; props.vx = Math.cos(tank.turretAngle) * 8; props.vy = Math.sin(tank.turretAngle) * 8;
        } else if (pType === 'pyroBullet') {
            props.type = 'pyroBullet'; props.damage = 70; props.w = 9; props.h = 9;
        } else if (pType === 'mechRocketBullet') {
            props.type = 'mechRocketBullet'; props.damage = 150; props.w = 12; props.h = 12;
            props.explodeRadius = 50;
            props.vx = Math.cos(tank.turretAngle) * 9; props.vy = Math.sin(tank.turretAngle) * 9;
        } else if (pType === 'egyptArrow') {
            props.type = 'egyptArrow'; props.damage = 100; props.w = 10; props.h = 4; props.life = 110; props.vx = Math.cos(tank.turretAngle) * 7.2; props.vy = Math.sin(tank.turretAngle) * 7.2;
        } else if (pType === 'buckshot') {
            props.type = 'buckshot'; props.damage = 125; props.w = 6; props.h = 6;
        } else if (pType === 'railgun') {
            props.type = 'railgun'; props.damage = 75; props.w = 6; props.h = 6; props.piercing = true;
        } else if (pType === 'machinegun') {
            props.type = 'machinegun'; props.damage = 20; props.w = 7; props.h = 7;
        } else {
            // Fallback for copied normal/other types
            props.damage = 100; props.w = 6; props.h = 6; 
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
            damage: 20 // Low damage per bullet.
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
                damage: 125 // Each pellet deals 125 damage
            });
        }
        tank.fireCooldown = 40; // ~667ms (2x slower than normal 333ms)
    } else if (tankType === 'time') {
        // Time tank: regular shots with high damage
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
            type: 'time',
            damage: 100
        });
        tank.fireCooldown = 60; // 1 second cooldown
    } else if (tankType === 'imitator') {
        // imitator base form: single powerful shot, damage 2
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
            type: 'imitator',
            damage: 200
        });
        tank.fireCooldown = 60; // 1 second cooldown
    } else if (tankType === 'electric') {
        // Electric ball: homing projectile that tracks enemies for several seconds
        const speed = 4;
        const life = 300; // 5 seconds
        bullets.push({
            x: tank.x + tank.w/2 + Math.cos(tank.turretAngle) * 25,
            y: tank.y + tank.h/2 + Math.sin(tank.turretAngle) * 25,
            w: 12, h: 12,
            vx: Math.cos(tank.turretAngle) * speed,
            vy: Math.sin(tank.turretAngle) * speed,
            life: life,
            maxLife: life,
            owner: 'player',
            team: 0,
            type: 'electricBall',
            damage: 150,
            lastHitEnemy: null,  // Track which enemies we've hit to chain
            homingStrength: 0.15,  // How aggressively it turns toward target
            hitChain: []  // List of enemy indices we've already hit
        });
        tank.fireCooldown = 80; // ~1.33 second cooldown
    } else if (tankType === 'robot') {
        // Railgun: fast piercing energy bolt
        const ang = tank.turretAngle;
        const speed = 18;
        bullets.push({
            x: tank.x + tank.w/2 + Math.cos(ang) * 28,
            y: tank.y + tank.h/2 + Math.sin(ang) * 28,
            w: 6, h: 6,
            vx: Math.cos(ang) * speed,
            vy: Math.sin(ang) * speed,
            life: 70,
            owner: 'player',
            team: 0,
            type: 'railgun',
            damage: 75,
            piercing: true
        });
        tank.fireCooldown = 60;
    } else if (tankType === 'medical') {
        // Medical pulse: heals allies, damages enemies
        const ang = tank.turretAngle;
        const speed = 6;
        bullets.push({
            x: tank.x + tank.w/2 + Math.cos(ang) * 25,
            y: tank.y + tank.h/2 + Math.sin(ang) * 25,
            w: 8, h: 8,
            vx: Math.cos(ang) * speed,
            vy: Math.sin(ang) * speed,
            life: 120,
            owner: 'player',
            team: 0,
            type: 'medicalPulse',
            damage: 75,  // Damage to enemies
            healAmount: 30  // Healing to allies
        });
        tank.fireCooldown = 60; // 1 shot per second
    } else if (tankType === 'mine') {
        // Place a landmine at the tank's current centre position
        if (typeof mines !== 'undefined') {
            mines.push({
                x: tank.x + tank.w / 2,
                y: tank.y + tank.h / 2,
                radius: 18,
                team: 0,
                damage: 150
            });
        }
        tank.fireCooldown = 90; // 1.5s between mine placements
    } else if (tankType === 'spartan') {
        // Spartan spear: pierces through all enemies, 80 damage
        const ang = tank.turretAngle;
        const speed = 8;
        bullets.push({
            x: tank.x + tank.w/2 + Math.cos(ang) * 26,
            y: tank.y + tank.h/2 + Math.sin(ang) * 26,
            w: 5, h: 5,
            vx: Math.cos(ang) * speed,
            vy: Math.sin(ang) * speed,
            life: 130,
            owner: 'player',
            team: 0,
            type: 'spartanSpear',
            damage: 80,
            hitEntities: [] // tracking for pierce
        });
        tank.fireCooldown = 40;
    } else if (tankType === 'kamikaze') {
        // Kamikaze: white bullet with red dot (Japanese flag)
        const ang = tank.turretAngle;
        bullets.push({
            x: tank.x + tank.w/2 + Math.cos(ang) * 25,
            y: tank.y + tank.h/2 + Math.sin(ang) * 25,
            w: 10, h: 10,
            vx: Math.cos(ang) * 6,
            vy: Math.sin(ang) * 6,
            life: 100,
            owner: 'player',
            team: 0,
            type: 'kamikazeBullet',
            damage: 100
        });
        tank.fireCooldown = 30; // 2 shots per second
    } else if (tankType === 'roman') {
        // Throwing blade: 125 dmg, spins visually, ricochets 1 time
        bullets.push({
            x: tank.x + tank.w/2 + Math.cos(tank.turretAngle) * 22,
            y: tank.y + tank.h/2 + Math.sin(tank.turretAngle) * 22,
            w: 14, h: 14,
            vx: Math.cos(tank.turretAngle) * 6.5,
            vy: Math.sin(tank.turretAngle) * 6.5,
            life: 130,
            owner: 'player', team: 0,
            type: 'romanBlade',
            damage: 125,
            bounces: 0,
            maxBounces: 1,
            spinAngle: 0
        });
        tank.fireCooldown = 60; // 1 shot per second
    } else if (tankType === 'egyptian') {
        // Egyptian arrow: fast, clean projectile with no extra on-hit effects
        const ang = tank.turretAngle;
        bullets.push({
            x: tank.x + tank.w/2 + Math.cos(ang) * 24,
            y: tank.y + tank.h/2 + Math.sin(ang) * 24,
            w: 10, h: 4,
            vx: Math.cos(ang) * 7.2,
            vy: Math.sin(ang) * 7.2,
            life: 110,
            owner: 'player',
            team: 0,
            type: 'egyptArrow',
            damage: 100
        });
        tank.fireCooldown = 45;
    } else if (tankType === 'pyro') {
        // Incendiary shell: deals 70 impact damage and applies burn DoT on hit
        const ang = tank.turretAngle;
        const speed = 5.5;
        bullets.push({
            x: tank.x + tank.w/2 + Math.cos(ang) * 22,
            y: tank.y + tank.h/2 + Math.sin(ang) * 22,
            w: 9, h: 9,
            vx: Math.cos(ang) * speed,
            vy: Math.sin(ang) * speed,
            life: 90,
            owner: 'player',
            team: 0,
            type: 'pyroBullet',
            damage: 70
        });
        tank.fireCooldown = 40; // 1.5 shots per second
    } else if (tankType === 'air') {
        // Air tank: knockback projectile, 15 cell range, 80 damage
        const ang = tank.turretAngle;
        const speed = 6;
        bullets.push({
            x: tank.x + tank.w/2 + Math.cos(ang) * 22,
            y: tank.y + tank.h/2 + Math.sin(ang) * 22,
            w: 10, h: 10,
            vx: Math.cos(ang) * speed,
            vy: Math.sin(ang) * speed,
            life: 125, // 6 * 125 / 50 = 15 cells
            owner: 'player',
            team: 0,
            type: 'airBullet',
            damage: 80
        });
        tank.fireCooldown = 40; // 1.5 shots per second
    } else if (tankType === 'mechShield') {
        // Shield mech: 120 damage projectile that can break walls with 6 hits
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
            type: 'mechShield',
            damage: 120,
            wallHits: 0  // Count hits on walls for breaking
        });
        tank.fireCooldown = FIRE_COOLDOWN;
    } else if (tankType === 'mechRocket') {
        // Rocket mech: AOE rocket
        const ang = tank.turretAngle;
        bullets.push({
            x: tank.x + tank.w/2 + Math.cos(ang) * 26,
            y: tank.y + tank.h/2 + Math.sin(ang) * 26,
            w: 12, h: 12,
            vx: Math.cos(ang) * 9,
            vy: Math.sin(ang) * 9,
            life: 110,
            owner: 'player', team: 0,
            type: 'mechRocketBullet',
            damage: 150,
            explodeRadius: 50
        });
        tank.fireCooldown = 50;
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
    if (tankType !== 'fire' && tankType !== 'buratino' && tankType !== 'toxic' && tankType !== 'machinegun' && tankType !== 'electric' && tankType !== 'time' && tankType !== 'imitator' && tankType !== 'robot' && tankType !== 'mine' && tankType !== 'roman' && tankType !== 'egyptian' && tankType !== 'pyro' && tankType !== 'spartan' && tankType !== 'kamikaze' && tankType !== 'mechShield' && tankType !== 'mechRocket' && tankType !== 'ice' && tankType !== 'plasma' && tankType !== 'musical' && tankType !== 'medical') {
        tank.fireCooldown = (tankType === 'mirror' ? 90 : (tankType === 'normal' ? 30 : FIRE_COOLDOWN)); // 1.5sec for mirror, normal 2 shots/s
    }
}
// --- APPEND_POINT_UPDATE ---

function updatePhysics() {

    // Safety: if player is stuck inside a wall/box/barrel, teleport to a nearby free spot
    (function rescueStuckTank() {
        if (typeof tank === 'undefined' || tank.alive === false) return;
        const tRect = { x: tank.x, y: tank.y, w: tank.w, h: tank.h };
        let stuck = false;
        for (const o of objects) {
            if (o.type === 'wall' || o.type === 'woodenWall' || o.type === 'box' || o.type === 'barrel') {
                if (checkRectCollision(tRect, o)) { stuck = true; break; }
            }
        }
        if (!stuck) return;
        const tryRadius = Math.max(worldWidth, worldHeight);
        let p = (typeof findFreeSpot === 'function') ? findFreeSpot(tank.x + (Math.random() - 0.5) * 200, tank.y + (Math.random() - 0.5) * 200, tank.w, tank.h, tryRadius, 24) : null;
        if (!p) {
            const cx = Math.max(100, Math.min(worldWidth - tank.w - 100, Math.floor(worldWidth / 2)));
            const cy = Math.max(100, Math.min(worldHeight - tank.h - 100, Math.floor(worldHeight / 2)));
            p = (typeof findFreeSpot === 'function') ? findFreeSpot(cx, cy, tank.w, tank.h, tryRadius, 24) : null;
        }
        if (p) {
            tank.x = p.x; tank.y = p.y;
            spawnParticle(tank.x + tank.w/2, tank.y + tank.h/2, '#00ff88');
        } else {
            // last resort: clamp to world bounds
            tank.x = Math.max(0, Math.min(worldWidth - tank.w, tank.x));
            tank.y = Math.max(0, Math.min(worldHeight - tank.h, tank.y));
        }
    })();

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
        
        // ELECTRIC BALL HOMING: Track and pursue nearest hostile target (player, allies, enemies)
        if (b.type === 'electricBall') {
            let nearestTarget = null;
            let nearestDist = Infinity;
            // Build candidate list: include player, allies and enemies that are hostile to the bullet's team
            const candidates = [];
            // Player
            if (typeof tank !== 'undefined' && tank && tank.alive !== false && tank.team !== b.team) {
                candidates.push({ kind: 'player', ent: tank, id: -1 });
            }
            // Allies
            for (let ai = 0; ai < allies.length; ai++) {
                const a = allies[ai];
                if (!a || !a.alive) continue;
                if (a.team === b.team) continue;
                candidates.push({ kind: 'ally', ent: a, id: -2 - ai });
            }
            // Enemies
            for (let ei = 0; ei < enemies.length; ei++) {
                const e = enemies[ei];
                if (!e || !e.alive) continue;
                if (e.team === b.team) continue;
                candidates.push({ kind: 'enemy', ent: e, id: ei });
            }

            for (const c of candidates) {
                const ex = c.ent.x + (c.ent.w || 0) / 2;
                const ey = c.ent.y + (c.ent.h || 0) / 2;
                const dist = Math.hypot(ex - b.x, ey - b.y);
                if (b.hitChain && b.hitChain.includes(c.id)) continue; // already hit this target
                if (dist < 400 && dist < nearestDist) {
                    nearestDist = dist;
                    nearestTarget = { id: c.id, x: ex, y: ey, dist: dist, ent: c.ent };
                }
            }

            if (nearestTarget) {
                const targetAngle = Math.atan2(nearestTarget.y - b.y, nearestTarget.x - b.x);
                const currentAngle = Math.atan2(b.vy, b.vx);
                let angleDiff = targetAngle - currentAngle;
                while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
                while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
                const turnAmount = Math.max(-b.homingStrength, Math.min(b.homingStrength, angleDiff));
                const newAngle = currentAngle + turnAmount;
                const speed = Math.hypot(b.vx, b.vy);
                b.vx = Math.cos(newAngle) * speed;
                b.vy = Math.sin(newAngle) * speed;
            }
        }
        
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
            else if (b.type === 'mechRocketBullet') explodeMechRocket(b);
            else if (b.type === 'toxic' || b.type === 'megabomb') explodeGas(b, b.type === 'megabomb');
            else if (b.hasExplosion) {
                // Buratino enhanced shot: large explosion
                spawnExplosion(b.x, b.y, b.explosionRadius);
                // Damage enemies in radius
                for (let e of enemies) {
                    const dx = e.x + e.w/2 - b.x;
                    const dy = e.y + e.h/2 - b.y;
                    const dist = Math.sqrt(dx*dx + dy*dy);
                    if (dist < b.explosionRadius) {
                        let dmg = (b.damage || 100) * (1 - dist / b.explosionRadius);
                        if (b.owner === 'player') dmg = applyPlayerDamage(dmg);
                        dealDamageToEntity(e, dmg);
                    }
                }
            }
            bullets.splice(i, 1);
            continue;
        }
        // normalize bullet rect (bullets stored by center)
        const bRect = { x: b.x - (b.w||0)/2, y: b.y - (b.h||0)/2, w: b.w || 4, h: b.h || 4 };
        // Check collision with objects (but toxic/megabomb/plasmaBlast/musical pass through standard logic differently)
        let hit = false;
        if (b.type !== 'rocket' && b.type !== 'toxic' && b.type !== 'megabomb' && b.type !== 'plasmaBlast' && b.type !== 'musical' && b.type !== 'meteorMini' && b.type !== 'romanBlade') {
            for (const obj of objects) {
                if (checkRectCollision(bRect, obj)) {
                    // Toxic/mega bombs pass through walls but explode on other objects
                    if ((b.type === 'toxic' || b.type === 'megabomb') && obj.type === 'wall') {
                        // pass through walls, don't explode
                        continue;
                    }
                    // mechRocket bullet explodes on contact with walls/objects
                    if (b.type === 'mechRocketBullet' && (obj.type === 'wall' || obj.type === 'woodenWall' || obj.type === 'box' || obj.type === 'barrel')) {
                        explodeMechRocket(b);
                    }
                    // Other bullets explode on collision, but toxic/megabomb only explode by timer
                    if (b.type !== 'toxic' && b.type !== 'megabomb') {
                        // regular explosion logic for non-toxic bullets
                    }
                    bullets.splice(i, 1);
                    hit = true;
                    if (obj.type === 'woodenWall') {
                        // Damage wooden wall by bullet's damage value
                        const dmg = b.damage || 100;
                        obj.hp = (obj.hp ?? 300) - dmg;
                        for (let k = 0; k < 3; k++) spawnParticle(obj.x + obj.w/2, obj.y + obj.h/2, '#a0652a');
                        // Pyro bullets ignite wooden walls
                        if (b.type === 'pyroBullet') {
                            obj.burning = true;
                            obj.burnTimer = obj.burnTimer ? Math.max(obj.burnTimer, 300) : 300;
                            obj.burnDps = 20;
                        }
                        if (obj.hp <= 0) {
                            objects.splice(objects.indexOf(obj), 1);
                            navNeedsRebuild = true;
                            for (let k = 0; k < 8; k++) spawnParticle(obj.x + obj.w/2, obj.y + obj.h/2, '#8B5E3C');
                        }
                    } else if (obj.type === 'box') {
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
                        // Ultimate ball explosion effect
                        if (b.isUltimateBall && b.explosionRadius) {
                            spawnExplosion(b.x, b.y, b.explosionRadius);
                            // Damage all enemies in explosion radius
                            for (let enemy of enemies) {
                                const dx = enemy.x + enemy.w/2 - b.x;
                                const dy = enemy.y + enemy.h/2 - b.y;
                                const dist = Math.sqrt(dx*dx + dy*dy);
                                if (dist < b.explosionRadius) {
                                    let dmgExp = b.explosionDamage || 100;
                                    if (b.owner === 'player') dmgExp = applyPlayerDamage(dmgExp);
                                    dealDamageToEntity(enemy, dmgExp);
                                }
                            }
                        }
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
        // Special handling for romanBlade: 1 ricochet off walls, then removed
        if (b.type === 'romanBlade') {
            // Spin the blade visually
            if (b.spinAngle !== undefined) b.spinAngle += 0.35;
            for (let j = objects.length - 1; j >= 0; j--) {
                const obj = objects[j];
                if (checkRectCollision(bRect, obj)) {
                    const bCenterX = b.x, bCenterY = b.y;
                    const oCenterX = obj.x + obj.w/2, oCenterY = obj.y + obj.h/2;
                    const overlapX = (b.w + obj.w)/2 - Math.abs(bCenterX - oCenterX);
                    const overlapY = (b.h + obj.h)/2 - Math.abs(bCenterY - oCenterY);
                    if (overlapX < overlapY) {
                        b.vx = -b.vx;
                        b.x += Math.sign(b.vx) * overlapX * 2;
                    } else {
                        b.vy = -b.vy;
                        b.y += Math.sign(b.vy) * overlapY * 2;
                    }
                    b.bounces++;
                    if (b.bounces > b.maxBounces) {
                        bullets.splice(i, 1);
                        hit = true;
                    } else {
                        // Golden spark particles on bounce
                        for (let k = 0; k < 5; k++) spawnParticle(b.x, b.y, '#FFD700');
                    }
                    if (obj.type === 'box') {
                        objects.splice(j, 1);
                        for (let k = 0; k < 5; k++) spawnParticle(obj.x + obj.w/2, obj.y + obj.h/2);
                        navNeedsRebuild = true;
                    } else if (obj.type === 'barrel') {
                        explodeBarrel(obj);
                    }
                    break;
                }
            }
        }
        if (b.type === 'meteorMini') {
            let mHit = false;
            for (let j = objects.length - 1; j >= 0; j--) {
                const obj = objects[j];
                if (checkRectCollision(bRect, obj) && (obj.type === 'wall' || obj.type === 'woodenWall')) {
                    objects.splice(j, 1);
                    navNeedsRebuild = true;
                    for (let k = 0; k < 8; k++) spawnParticle(obj.x + obj.w/2, obj.y + obj.h/2, '#FF4500');
                    mHit = true;
                }
                if (checkRectCollision(bRect, obj) && obj.type !== 'wall' && obj.type !== 'woodenWall') {
                    objects.splice(j, 1);
                    mHit = true;
                }
            }
            // Splash damage on player
            if (b.team !== (tank.team ?? 0)) {
                const mdx = (tank.x + 19) - b.x, mdy = (tank.y + 19) - b.y;
                if (Math.sqrt(mdx*mdx + mdy*mdy) < 40) {
                    tank.hp = Math.max(0, tank.hp - (b.damage || 75));
                    if (tank.hp <= 0 && gameState === 'playing') {
                        spawnExplosion(tank.x+tank.w/2, tank.y+tank.h/2, 70);
                        gameState = 'lose'; loseModeTrophies(); syncResultOverlay('lose');
                    }
                    mHit = true;
                }
            }
            if (mHit) { bullets.splice(i, 1); continue; }
        }
        // Special handling for plasmaBlast: destroys walls
        if (b.type === 'plasmaBlast') {
            for (let j = objects.length - 1; j >= 0; j--) {
                const obj = objects[j];
                if (checkRectCollision(bRect, obj) && (obj.type === 'wall' || obj.type === 'woodenWall')) {
                    // Destroy wall permanently
                    objects.splice(j, 1);
                    navNeedsRebuild = true;
                    for (let k = 0; k < 10; k++) spawnParticle(obj.x + obj.w/2, obj.y + obj.h/2);
                    // Continue flying, don't remove bullet
                }
            }
        }
        // Special handling for mechShield: one-shots wooden walls, 6 hits to destroy stone walls
        if (b.type === 'mechShield') {
            for (let j = objects.length - 1; j >= 0; j--) {
                const obj = objects[j];
                if (checkRectCollision(bRect, obj) && (obj.type === 'wall' || obj.type === 'woodenWall')) {
                    if (obj.type === 'woodenWall') {
                        // One-shot wooden wall (without touching damage value)
                        for (let k = 0; k < 8; k++) spawnParticle(obj.x + obj.w/2, obj.y + obj.h/2, '#a0652a');
                        objects.splice(j, 1);
                        navNeedsRebuild = true;
                    } else {
                        // Count hits on stone wall
                        obj.wallDamageCount = (obj.wallDamageCount || 0) + 1;
                        // Add orange particle for each hit
                        for (let k = 0; k < 3; k++) spawnParticle(obj.x + obj.w/2, obj.y + obj.h/2, '#FF6F00');
                        // Destroy wall after 6 hits
                        if (obj.wallDamageCount >= 6) {
                            objects.splice(j, 1);
                            navNeedsRebuild = true;
                            for (let k = 0; k < 10; k++) spawnParticle(obj.x + obj.w/2, obj.y + obj.h/2, '#FF4500');
                        }
                    }
                    // Continue flying, don't remove bullet
                }
            }
        }
        if (!hit) {
            // Check collision with tank (player team = 0) - toxic/megabomb only damage, don't stop
            if (tank.hp > 0 && checkRectCollision(bRect, tank)) {
                // Medical pulse: only damage, no healing to allies
                if (b.type === 'medicalPulse') {
                    if (b.team !== tank.team) {
                        // Damage enemy only
                        if (!tank.mirrorShieldActive) dealDamageToEntity(tank, b.damage || 75);
                    } else {
                        // Same team - bullet passes through without healing
                        continue;
                    }
                    bullets.splice(i, 1);
                    if (tank.hp <= 0) {
                        spawnExplosion(tank.x+tank.w/2, tank.y+tank.h/2, 70);
                        if (currentMode === 'war') { tank.alive = false; tank.respawnTimer = 600; }
                        else { gameState = 'lose'; loseModeTrophies(); syncResultOverlay('lose'); }
                    }
                    continue;
                }
                // Check team only for non-medical bullets
                if (b.team === tank.team) continue;
                // Special handling for electric ball: chain damage and continue flying
                if (b.type === 'electricBall') {
                    if (!b.hitChain) b.hitChain = [];
                    const pid = -1;
                    if (!b.hitChain.includes(pid)) {
                        if (!tank.mirrorShieldActive) {
                            dealDamageToEntity(tank, b.damage || 150);
                            b.hitChain.push(pid);
                            for (let k = 0; k < 6; k++) spawnParticle(tank.x + tank.w/2 + (Math.random()-0.5)*tank.w, tank.y + tank.h/2 + (Math.random()-0.5)*tank.h, '#00d4ff', 0.7);
                        }
                    }
                    if (tank.hp <= 0) {
                        spawnExplosion(tank.x+tank.w/2, tank.y+tank.h/2, 70);
                        if (currentMode === 'war') { tank.alive = false; tank.respawnTimer = 600; }
                        else { gameState = 'lose'; loseModeTrophies(); syncResultOverlay('lose'); }
                    }
                    continue; // don't remove bullet, allow chaining
                }
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

                // Roman shield: fully absorb all incoming bullets, zero damage
                if (tank.romanShieldActive) {
                    if (b.type === 'toxic' || b.type === 'megabomb') {
                        // Pass-through bullets: block damage only, bullet keeps flying
                    } else if (b.type === 'plasmaBlast') {
                        b.hitEntities = b.hitEntities || [];
                        if (!b.hitEntities.includes('player')) {
                            b.hitEntities.push('player');
                            for (let k = 0; k < 6; k++) spawnParticle(b.x, b.y, '#FFD700');
                        }
                    } else if (b.type === 'rocket' || b.type === 'smallRocket') {
                        // Block rocket: small visual pop, no splash
                        spawnExplosion(b.x, b.y, 22);
                        for (let k = 0; k < 8; k++) spawnParticle(b.x, b.y, '#FFD700');
                        bullets.splice(i, 1);
                    } else {
                        // All other bullets absorbed into the shield
                        for (let k = 0; k < 6; k++) spawnParticle(b.x, b.y, '#FFD700');
                        bullets.splice(i, 1);
                    }
                    continue;
                }

                const _romanShieldMult = 1.0; // Roman shield handled above via continue
                // mechShield: shield absorbs damage first (300 HP), then 60% reduction on residual
                let _shieldMult = 1.0;
                let _damageToShield = 0;
                if (typeof tankType !== 'undefined' && tankType === 'mechShield' && tank.mechShieldActive) {
                    _shieldMult = 0.4; // 60% reduction after absorbing
                    _damageToShield = 1; // Flag to process shield HP damage
                }

                if (b.type === 'rocket' || b.type === 'smallRocket') {
                    explodeRocket(b);
                    bullets.splice(i, 1);
                } else if (b.type === 'mechRocketBullet') {
                    explodeMechRocket(b, tank); // tank is direct hit
                    bullets.splice(i, 1);
                } else if (b.type === 'toxic' || b.type === 'megabomb') {
                    // Toxic bombs only damage once per target, don't stop or explode on contact
                    if (!b.hitEntities) b.hitEntities = [];
                    if (!b.hitEntities.includes('player')) {
                        dealDamageToEntity(tank, Math.round((b.damage || 50) * _shieldMult));
                        b.hitEntities.push('player');
                    }
                    // continue flying, don't remove bullet
                } else if (b.type === 'plasma') {
                    // Plasma bolt pierces — hit player only once
                    if (!b.hitEntities) b.hitEntities = [];
                    if (!b.hitEntities.includes('player')) {
                        if (tankType === 'mirror') {
                            dealDamageToEntity(tank, Math.round(Math.round(b.damage || 350) * 0.5 * _shieldMult));
                        } else {
                            dealDamageToEntity(tank, Math.round((b.damage || 350) * _shieldMult));
                        }
                        b.hitEntities.push('player');
                    }
                } else if (b.type === 'plasmaBlast') {
                    // Plasma blast logic
                    b.hitEntities = b.hitEntities || [];
                    if (!b.hitEntities.includes('player')) {
                        if (tankType === 'mirror') {
                            dealDamageToEntity(tank, Math.round(175 * _shieldMult));
                        } else {
                            dealDamageToEntity(tank, Math.round((b.damage || 350) * _shieldMult));
                        }
                        b.hitEntities.push('player');
                    }
                } else if (b.type === 'illuminat') {
                    // Illuminat beam: damage and disorient
                    dealDamageToEntity(tank, Math.round((b.damage || 0.5) * _shieldMult));
                    tank.disoriented = b.disorientTime || 36; // 0.6 seconds
                    bullets.splice(i, 1);
                } else if (b.type === 'machinegun') {
                    // Machinegun: rapid fire with consistent damage
                    dealDamageToEntity(tank, Math.round(b.damage * _shieldMult));
                    bullets.splice(i, 1);
                } else if (b.type === 'railgun') {
                    // Railgun pierces player too — hit once then continue flying
                    if (!b.hitEntities) b.hitEntities = [];
                    if (!b.hitEntities.includes('player')) {
                        dealDamageToEntity(tank, Math.round((b.damage || 75) * _shieldMult));
                        b.hitEntities.push('player');
                        for (let k = 0; k < 5; k++) spawnParticle(tank.x+tank.w/2+(Math.random()-0.5)*tank.w, tank.y+tank.h/2+(Math.random()-0.5)*tank.h, '#00e5ff', 0.6);
                    }
                    // Don't remove
                } else if (b.type === 'spartanSpear') {
                    // Spartan spear pierces player too — hit once then continue flying
                    if (!b.hitEntities) b.hitEntities = [];
                    if (!b.hitEntities.includes('player')) {
                        dealDamageToEntity(tank, Math.round((b.damage || 80) * _shieldMult));
                        b.hitEntities.push('player');
                        for (let k = 0; k < 4; k++) spawnParticle(tank.x+tank.w/2+(Math.random()-0.5)*tank.w, tank.y+tank.h/2+(Math.random()-0.5)*tank.h, '#b87333', 0.7);
                    }
                    // Don't remove — keeps flying through
                } else {
                     let dmg = (b.damage || (b.type === 'fire' ? 22 : b.type === 'rocket' ? 200 : 100));
                     dmg = Math.round(dmg * _shieldMult);
                     dealDamageToEntity(tank, dmg);
                     if (b.type === 'ice' && tankType !== 'ice') { tank.iceSlowed = true; tank.iceSlowedTime = 240; tank.frozenEffect = 240; }
                     if (b.type === 'pyroBullet') { tank.burning = true; tank.burnTimer = 300; tank.burnDps = 10; }
                     // Air bullet: apply smooth wind knockback to player
                     if (b.type === 'airBullet') {
                         const kbAng = Math.atan2(b.vy, b.vx);
                         tank.windPushVx = Math.cos(kbAng) * 10;
                         tank.windPushVy = Math.sin(kbAng) * 10;
                         for (let k = 0; k < 6; k++) {
                             const pa = kbAng + (Math.random() - 0.5) * 1.2;
                             spawnParticle(tank.x + tank.w/2 + Math.cos(pa)*8, tank.y + tank.h/2 + Math.sin(pa)*8, '#a0ffe8', 0.7);
                         }
                     }
                     bullets.splice(i, 1);
                }
                tank.hitFlashTime = Date.now();
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
                // Medical pulse: only damage enemies, no healing to allies
                if (b.type === 'medicalPulse') {
                    if (checkRectCollision(bRect, a)) {
                        if (b.team !== a.team) {
                            // Damage enemy only
                            a.hp = (a.hp || 300) - (b.damage || 75);
                        } else {
                            // Same team - bullet passes through without healing
                            continue;
                        }
                        bullets.splice(i, 1);
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
                    continue;
                }
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
                    // Special handling for electric ball: chain damage and continue flying
                    if (b.type === 'electricBall') {
                        if (!b.hitChain) b.hitChain = [];
                        const aid = -2 - j;
                        if (!b.hitChain.includes(aid)) {
                            a.hp = (a.hp || 300) - (b.damage || 150);
                            b.hitChain.push(aid);
                            for (let k = 0; k < 6; k++) spawnParticle(a.x + a.w/2 + (Math.random()-0.5)*a.w, a.y + a.h/2 + (Math.random()-0.5)*a.h, '#00d4ff', 0.7);
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
                    if (b.type === 'rocket' || b.type === 'smallRocket') {
                        explodeRocket(b);
                        bullets.splice(i, 1);
                    } else if (b.type === 'mechRocketBullet') {
                        explodeMechRocket(b, a); // ally is direct hit
                        bullets.splice(i, 1);
                    } else if (b.type === 'toxic' || b.type === 'megabomb') {
                        // Toxic bombs only damage, don't stop or explode on contact
                        a.hp = (a.hp || 300) - 50;
                        // continue flying, don't remove bullet
                    } else if (b.type === 'plasma') {
                        // Plasma bolt pierces through allies — hit each only once
                        if (!b.hitEntities) b.hitEntities = [];
                        const _allyKey = 'ally_' + j;
                        if (!b.hitEntities.includes(_allyKey)) {
                            a.hp = (a.hp || 300) - (b.damage || 350);
                            b.hitEntities.push(_allyKey);
                        }
                        // continue flying, don't remove bullet
                    } else if (b.type === 'plasmaBlast') {
                        // Plasma blast pierces through allies — hit each only once
                        if (!b.hitEntities) b.hitEntities = [];
                        const _allyKeyPB = 'ally_' + j;
                        if (!b.hitEntities.includes(_allyKeyPB)) {
                            a.hp = (a.hp || 300) - (b.damage || 600);
                            b.hitEntities.push(_allyKeyPB);
                        }
                        // continue flying, don't remove bullet
                    } else if (b.type === 'machinegun') {
                        // Machinegun: rapid fire with consistent damage
                        a.hp = (a.hp || 300) - b.damage;
                        bullets.splice(i, 1);
                    } else {
                        a.hp = (a.hp || 300) - (b.damage || (b.type === 'fire' ? 22 : b.type === 'rocket' ? 200 : 100));
                        if (b.type === 'ice' && a.tankType !== 'ice') { a.iceSlowed = true; a.iceSlowedTime = 240; a.frozenEffect = 240; }
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
                    // Medical pulse: only damage enemies, no healing to allies
                    if (b.type === 'medicalPulse') {
                        if (b.team !== e.team) {
                            // Damage enemy only
                            dealDamageToEntity(e, b.damage || 75);
                        } else {
                            // Same team - bullet passes through without healing
                            continue;
                        }
                        bullets.splice(i, 1);
                        if (e.hp <= 0) {
                            if (currentMode === 'war') {
                                e.alive = false; e.respawnTimer = 600; spawnExplosion(e.x+e.w/2, e.y+e.h/2, 65);
                            } else {
                                enemies.splice(j, 1);
                                spawnExplosion(e.x+e.w/2, e.y+e.h/2, 65);
                            }
                        }
                        break;
                    }
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
                    } else if (b.type === 'mechRocketBullet') {
                        explodeMechRocket(b, e); // enemy is direct hit — guarantees full damage
                        bullets.splice(i, 1);
                    } else if (b.type === 'toxic' || b.type === 'megabomb') {
                        // Toxic bombs only damage once per target, don't stop or explode on contact
                        if (!b.hitEntities) b.hitEntities = [];
                        if (!b.hitEntities.includes(j)) {
                            let dmgToxic = b.damage || 50;
                            if (b.owner === 'player') dmgToxic = applyPlayerDamage(dmgToxic);
                            dealDamageToEntity(e, dmgToxic);
                            b.hitEntities.push(j);
                        }
                        // continue flying, don't remove bullet
                    } else if (b.type === 'plasma') {
                        // Plasma bolt pierces through enemies — hit each only once
                        if (!b.hitEntities) b.hitEntities = [];
                        if (!b.hitEntities.includes(j)) {
                            let dmgPlasma = b.damage || 350;
                            if (b.owner === 'player') dmgPlasma = applyPlayerDamage(dmgPlasma);
                            if (e.isBoss) dmgPlasma = Math.round(dmgPlasma * 0.25); // 75% less vs boss
                            dealDamageToEntity(e, dmgPlasma);
                            b.hitEntities.push(j);
                        }
                        // continue flying, don't remove bullet
                    } else if (b.type === 'plasmaBlast') {
                        // Plasma blast pierces and damages all in line — hit each only once
                        if (!b.hitEntities) b.hitEntities = [];
                        if (!b.hitEntities.includes('pb_' + j)) {
                            let dmgPBlast = b.damage || 600;
                            if (b.owner === 'player') dmgPBlast = applyPlayerDamage(dmgPBlast);
                            if (e.isBoss) dmgPBlast = Math.round(dmgPBlast * 0.5); // 50% less vs boss
                            dealDamageToEntity(e, dmgPBlast);
                            b.hitEntities.push('pb_' + j);
                        }
                        // continue flying, don't remove bullet
                    } else if (b.type === 'electricBall') {
                        // Electric ball: damage enemy, add to chain, continue flying to track other enemies
                        if (!b.hitChain) b.hitChain = [];
                        if (!b.hitChain.includes(j)) {
                            let dmgElec = b.damage || 150;
                            if (b.owner === 'player') dmgElec = applyPlayerDamage(dmgElec);
                            dealDamageToEntity(e, dmgElec);
                            b.hitChain.push(j);
                            // Sparkle effects on hit
                            for (let k = 0; k < 6; k++) {
                                spawnParticle(e.x + e.w/2 + (Math.random()-0.5)*e.w, 
                                            e.y + e.h/2 + (Math.random()-0.5)*e.h, 
                                            '#00d4ff', 0.7);
                            }
                        }
                    } else if (b.type === 'machinegun') {
                        // Machinegun: rapid fire with consistent damage
                        let dmgMG = b.damage;
                        if (b.owner === 'player') dmgMG = applyPlayerDamage(dmgMG);
                        dealDamageToEntity(e, dmgMG);
                        bullets.splice(i, 1);
                    } else if (b.type === 'railgun') {
                        // Railgun: pierce through all enemies, hit each only once
                        if (!b.hitEntities) b.hitEntities = [];
                        if (!b.hitEntities.includes(j)) {
                            let dmgRailgun = b.damage || 75;
                            if (b.owner === 'player') dmgRailgun = applyPlayerDamage(dmgRailgun);
                            dealDamageToEntity(e, dmgRailgun);
                            b.hitEntities.push(j);
                            for (let k = 0; k < 5; k++) spawnParticle(e.x+e.w/2+(Math.random()-0.5)*e.w, e.y+e.h/2+(Math.random()-0.5)*e.h, '#00e5ff', 0.6);
                        }
                        // Don't remove — keeps flying
                    } else if (b.type === 'spartanSpear') {
                        // Spartan spear: pierce through all enemies, hit each only once
                        if (!b.hitEntities) b.hitEntities = [];
                        if (!b.hitEntities.includes(j)) {
                            let dmgSpear = b.damage || 80;
                            if (b.owner === 'player') dmgSpear = applyPlayerDamage(dmgSpear);
                            dealDamageToEntity(e, dmgSpear);
                            b.hitEntities.push(j);
                            for (let k = 0; k < 4; k++) spawnParticle(e.x+e.w/2+(Math.random()-0.5)*e.w, e.y+e.h/2+(Math.random()-0.5)*e.h, '#b87333', 0.7);
                        }
                        // Don't remove — keeps flying through
                    } else if (b.type === 'droneBullet') {
                        // Drone bullet: damage and remove
                        dealDamageToEntity(e, b.damage || 25);
                        bullets.splice(i, 1);
                    } else if (b.hasExplosion) {
                        // Buratino enhanced shot: large explosion on impact
                        spawnExplosion(b.x, b.y, b.explosionRadius);
                        // Damage all enemies in radius (including the one hit)
                        for (let ej = 0; ej < enemies.length; ej++) {
                            const ex = enemies[ej];
                            if (!ex) continue;
                            const dx = ex.x + ex.w/2 - b.x;
                            const dy = ex.y + ex.h/2 - b.y;
                            const dist = Math.sqrt(dx*dx + dy*dy);
                            if (dist < b.explosionRadius) {
                                let dmg = (b.damage || 100) * (1 - dist / b.explosionRadius);
                                if (b.owner === 'player') dmg = applyPlayerDamage(dmg);
                                dealDamageToEntity(ex, dmg);
                            }
                        }
                        bullets.splice(i, 1);
                    } else {
                        let dmgDefault = (b.damage || (b.type === 'fire' ? 22 : b.type === 'rocket' ? 200 : 100));
                        if (b.owner === 'player') dmgDefault = applyPlayerDamage(dmgDefault);
                        dealDamageToEntity(e, dmgDefault);
                        if (b.type === 'ice' && e.tankType !== 'ice') { e.iceSlowed = true; e.iceSlowedTime = 240; e.frozenEffect = 240; }
                        if (b.type === 'musical') { e.confused = 120; } // 2 seconds confusion
                        // Pyro bullet: apply burn DoT (10 HP/sec for 5 sec)
                        if (b.type === 'pyroBullet') { 
                            if (!e.isBoss) { e.burning = true; e.burnTimer = 300; e.burnDps = 10; }
                        }
                        // Air bullet: apply smooth wind knockback
                        if (b.type === 'airBullet') {
                            const kbAng = Math.atan2(b.vy, b.vx);
                            const kbStr = e.isBoss ? 4 : 10;
                            e.windPushVx = Math.cos(kbAng) * kbStr;
                            e.windPushVy = Math.sin(kbAng) * kbStr;
                            // Wind burst particles
                            for (let k = 0; k < 6; k++) {
                                const pa = kbAng + (Math.random() - 0.5) * 1.2;
                                spawnParticle(e.x + e.w/2 + Math.cos(pa)*8, e.y + e.h/2 + Math.sin(pa)*8, '#a0ffe8', 0.7);
                            }
                        }
                        bullets.splice(i, 1);
                    }
                    e.hitFlashTime = Date.now();
                    if (e.hp <= 0) {
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
            // Check collision with player drones
            if (typeof playerDrones !== 'undefined' && playerDrones.length > 0) {
                for (let j = playerDrones.length - 1; j >= 0; j--) {
                    const d = playerDrones[j];
                    if (!d || !d.alive) continue;
                    if (checkRectCollision(bRect, d) && b.team !== d.team) {
                        if (b.type === 'rocket' || b.type === 'smallRocket') {
                            explodeRocket(b);
                            bullets.splice(i, 1);
                        } else if (b.type === 'toxic' || b.type === 'megabomb') {
                            // Toxic bombs only damage, don't stop or explode on contact
                            d.hp -= 50;
                            // continue flying, don't remove bullet
                        } else if (b.type === 'plasma') {
                            // Plasma bolt pierces through drones — hit each only once
                            if (!b.hitEntities) b.hitEntities = [];
                            const _pdKey = 'pdrone_' + j;
                            if (!b.hitEntities.includes(_pdKey)) {
                                d.hp -= b.damage || 350;
                                b.hitEntities.push(_pdKey);
                            }
                            // continue flying, don't remove bullet
                        } else if (b.type === 'plasmaBlast') {
                            // Plasma blast pierces through drones — hit each only once
                            if (!b.hitEntities) b.hitEntities = [];
                            const _pdKeyPB = 'pdronePB_' + j;
                            if (!b.hitEntities.includes(_pdKeyPB)) {
                                d.hp -= b.damage || 600;
                                b.hitEntities.push(_pdKeyPB);
                            }
                            // continue flying, don't remove bullet
                        } else if (b.type === 'railgun') {
                            // Railgun: pierce through all drones, hit each only once
                            if (!b.hitEntities) b.hitEntities = [];
                            if (!b.hitEntities.includes('drone_' + j)) {
                                d.hp -= b.damage || 75;
                                b.hitEntities.push('drone_' + j);
                                for (let k = 0; k < 5; k++) spawnParticle(d.x+d.w/2+(Math.random()-0.5)*d.w, d.y+d.h/2+(Math.random()-0.5)*d.h, '#00e5ff', 0.6);
                            }
                            // Don't remove — keeps flying
                        } else if (b.type === 'spartanSpear') {
                            // Spartan spear: pierce through all drones, hit each only once
                            if (!b.hitEntities) b.hitEntities = [];
                            if (!b.hitEntities.includes('drone_' + j)) {
                                d.hp -= b.damage || 80;
                                b.hitEntities.push('drone_' + j);
                                for (let k = 0; k < 4; k++) spawnParticle(d.x+d.w/2+(Math.random()-0.5)*d.w, d.y+d.h/2+(Math.random()-0.5)*d.h, '#b87333', 0.7);
                            }
                            // Don't remove — keeps flying
                        } else if (b.type === 'droneBullet') {
                            // Drone bullets don't hurt other drones (same team)
                            continue;
                        } else if (b.type === 'machinegun') {
                            // Machinegun: rapid fire with consistent damage
                            d.hp -= b.damage;
                            bullets.splice(i, 1);
                        } else {
                            d.hp -= (b.damage || (b.type === 'fire' ? 22 : b.type === 'rocket' ? 200 : 100));
                            if (b.type === 'ice') { d.paralyzed = true; d.paralyzedTime = 180; }
                            bullets.splice(i, 1);
                        }
                        if (d.hp <= 0) {
                            playerDrones.splice(j, 1);
                            spawnExplosion(d.x+d.w/2, d.y+d.h/2, 50);
                        }
                        break;
                    }
                }
            }
            // Check collision with enemy drones
            if (typeof enemyDrones !== 'undefined' && enemyDrones.length > 0) {
                for (let j = enemyDrones.length - 1; j >= 0; j--) {
                    const d = enemyDrones[j];
                    if (!d || !d.alive) continue;
                    if (checkRectCollision(bRect, d) && b.team !== d.team) {
                        if (b.type === 'rocket' || b.type === 'smallRocket') {
                            explodeRocket(b);
                            bullets.splice(i, 1);
                        } else if (b.type === 'toxic' || b.type === 'megabomb') {
                            // Toxic bombs only damage, don't stop or explode on contact
                            d.hp -= 50;
                            // continue flying, don't remove bullet
                        } else if (b.type === 'plasma') {
                            // Plasma bolt pierces through enemy drones — hit each only once
                            if (!b.hitEntities) b.hitEntities = [];
                            const _edKey = 'edrone_' + j;
                            if (!b.hitEntities.includes(_edKey)) {
                                d.hp -= b.damage || 350;
                                b.hitEntities.push(_edKey);
                            }
                            // continue flying, don't remove bullet
                        } else if (b.type === 'plasmaBlast') {
                            // Plasma blast pierces through enemy drones — hit each only once
                            if (!b.hitEntities) b.hitEntities = [];
                            const _edKeyPB = 'edronePB_' + j;
                            if (!b.hitEntities.includes(_edKeyPB)) {
                                d.hp -= b.damage || 600;
                                b.hitEntities.push(_edKeyPB);
                            }
                            // continue flying, don't remove bullet
                        } else if (b.type === 'spartanSpear') {
                            // Spartan spear: pierce through all drones, hit each only once
                            if (!b.hitEntities) b.hitEntities = [];
                            if (!b.hitEntities.includes('enemyDrone_' + j)) {
                                d.hp -= b.damage || 80;
                                b.hitEntities.push('enemyDrone_' + j);
                                for (let k = 0; k < 4; k++) spawnParticle(d.x+d.w/2+(Math.random()-0.5)*d.w, d.y+d.h/2+(Math.random()-0.5)*d.h, '#b87333', 0.7);
                            }
                            // Don't remove — keeps flying
                        } else if (b.type === 'droneBullet') {
                            // Drone bullets don't hurt other enemy drones (same team)
                            continue;
                        } else if (b.type === 'machinegun') {
                            // Machinegun: rapid fire with consistent damage
                            d.hp -= b.damage;
                            bullets.splice(i, 1);
                        } else {
                            d.hp -= (b.damage || (b.type === 'fire' ? 22 : b.type === 'rocket' ? 200 : 100));
                            if (b.type === 'ice') { d.paralyzed = true; d.paralyzedTime = 180; }
                            bullets.splice(i, 1);
                        }
                        if (d.hp <= 0) {
                            enemyDrones.splice(j, 1);
                            spawnExplosion(d.x+d.w/2, d.y+d.h/2, 50);
                        }
                        break;
                    }
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
                dealDamageToEntity(tank, sw.damage);
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
                dealDamageToEntity(e, sw.damage);
                e.confused = 30; // 0.5 seconds confusion
                if (e.hp <= 0) {
                    enemies.splice(j, 1);
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
                dealDamageToEntity(a, sw.damage);
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
                    dealDamageToEntity(e, 0.5); // continuous damage
                    e.disoriented = 36; // 0.6 seconds
                    if (e.hp <= 0) {
                        enemies.splice(j, 1);
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
                if (obj.type === 'woodenWall') {
                    // Flames deal 2x damage to wooden walls and set them on fire
                    obj.hp = (obj.hp ?? 300) - (f.damage || 22) * 2;
                    obj.burning = true;
                    obj.burnTimer = obj.burnTimer ? Math.max(obj.burnTimer, 300) : 300;
                    obj.burnDps = 20; // 2x normal burn (10 * 2)
                    if (obj.hp <= 0) {
                        objects.splice(objects.indexOf(obj), 1);
                        navNeedsRebuild = true;
                        for (let k = 0; k < 8; k++) spawnParticle(obj.x + obj.w/2, obj.y + obj.h/2, '#ff6600');
                    }
                } else if (obj.type === 'box') {
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
                // Roman shield: fully block flame damage
                if (tank.romanShieldActive) {
                    for (let k = 0; k < 3; k++) spawnParticle(f.x, f.y, '#FFD700');
                    flames.splice(i, 1);
                    continue;
                }
                
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

                dealDamageToEntity(tank, f.damage);
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
                    dealDamageToEntity(a, f.damage);
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
                    const flameDmg = e.isBoss ? f.damage * 0.25 : f.damage; // 75% less vs boss
                    dealDamageToEntity(e, flameDmg);
                    flames.splice(i, 1);
                    if (e.hp <= 0) {
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
                            applyDamage(p.x, p.y, 30, 300, obj.team);
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
                        applyDamage(ex, ey, 30, 300, obj.team);
                    }
                    for (let j = 0; j < 9; j++) {
                        const ang = (j / 9) * Math.PI * 2;
                        const dist = obj.radius * 0.7;
                        const ex = obj.x + Math.cos(ang) * dist;
                        const ey = obj.y + Math.sin(ang) * dist;
                        spawnExplosion(ex, ey, 30);
                        applyDamage(ex, ey, 30, 300, obj.team);
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
        } else if (obj.type === 'pharaohSwarm') {
            updatePharaohSwarm(obj);
            obj.life--;
            if (obj.life <= 0) objects.splice(i, 1);
        } else if (obj.type === 'iceField') {
            applyIceFieldFreeze(tank, obj);
            for (const ally of allies) applyIceFieldFreeze(ally, obj);
            for (const enemy of enemies) applyIceFieldFreeze(enemy, obj);
            obj.life--;
            if (obj.life <= 0) {
                clearIceFieldTouchState(obj.fieldId);
                objects.splice(i, 1);
            }
        } else if (obj.type === 'gas') {
            // gas cloud visual fades over time
            obj.life--;
            if (obj.life <= 0) objects.splice(i, 1);
        } else if (obj.type === 'sandstorm') {
            obj.life--;
            if (obj.ownerRef && obj.ownerRef.alive !== false) {
                obj.x = obj.ownerRef.x + (obj.ownerRef.w || 0) / 2;
                obj.y = obj.ownerRef.y + (obj.ownerRef.h || 0) / 2;
            }
            const radiusSq = obj.radius * obj.radius;
            const applyStormTo = (ent) => {
                if (!ent || ent.alive === false) return;
                if (obj.team !== undefined && ent.team === obj.team) return;
                if (isEgyptianTank(ent)) return;
                const ex = ent.x + (ent.w || 0) / 2;
                const ey = ent.y + (ent.h || 0) / 2;
                const dx = ex - obj.x;
                const dy = ey - obj.y;
                if ((dx * dx + dy * dy) <= radiusSq) {
                    refreshSandstormDebuff(ent, 30);
                }
            };
            applyStormTo(tank);
            for (const ally of allies) applyStormTo(ally);
            for (const enemy of enemies) applyStormTo(enemy);
            if (window.effectsEnabled !== false && particles.length < 180 && (obj.life % 3 === 0)) {
                const ang = Math.random() * Math.PI * 2;
                const dist = obj.radius * (0.18 + Math.random() * 0.7);
                spawnParticle(obj.x + Math.cos(ang) * dist, obj.y + Math.sin(ang) * dist, '#d2b46f', 0.45);
            }
            if (obj.life <= 0 || (obj.ownerRef && obj.ownerRef.alive === false)) objects.splice(i, 1);
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
                        applyDamage(obj.target.x, obj.target.y, 30, 300, obj.team);
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
                                applyDamage(obj.x, obj.y, 30, 300, obj.team);
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

    tickSandstormDebuff(tank);
    for (const ally of allies) tickSandstormDebuff(ally);
    for (const enemy of enemies) tickSandstormDebuff(enemy);
    
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
    // Toxic player tank is completely immune to poison gas
    const playerIsToxic = tank && tank.tankType === 'toxic';
    for (const obj of objects) {
        if (obj.type !== 'gas') continue;
        const ownerTeam = typeof obj.ownerTeam !== 'undefined' ? obj.ownerTeam : null;

        // If ownerTeam is set, poison entities whose team differs from ownerTeam
        if (ownerTeam !== null) {
            // Poison enemies (team !== ownerTeam)
            for (const e of enemies) {
                if (!e || !e.alive) continue;
                if (e.team === ownerTeam) continue;
                if (e.isBoss || e.tankType === 'toxic') continue; // immune
                const dist = Math.hypot((e.x + (e.w||0)/2) - obj.x, (e.y + (e.h||0)/2) - obj.y);
                if (dist <= obj.radius) {
                    if (!e.poisonTimer || e.poisonTimer <= 0) e.poisonTimer = GAS_DEBUFF_TICKS;
                }
            }
            // Poison player if not on same team
            if (!playerIsToxic && tank && tank.alive !== false && tank.team !== ownerTeam && tank.tankType !== 'toxic') {
                const dist = Math.hypot((tank.x + tank.w/2) - obj.x, (tank.y + tank.h/2) - obj.y);
                if (dist <= obj.radius) {
                    if (!tank.poisonTimer || tank.poisonTimer <= 0) tank.poisonTimer = GAS_DEBUFF_TICKS;
                }
            }
            // Poison allies not on ownerTeam
            for (const a of allies) {
                if (!a || !a.alive) continue;
                if (a.team === ownerTeam) continue;
                if (a.tankType === 'toxic') continue; // immune
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
                if (!playerIsToxic && tank.alive !== false && tank.tankType !== 'toxic') {
                    const dist = Math.hypot((tank.x + tank.w/2) - obj.x, (tank.y + tank.h/2) - obj.y);
                    if (dist <= obj.radius) {
                        if (!tank.poisonTimer || tank.poisonTimer <= 0) tank.poisonTimer = GAS_DEBUFF_TICKS;
                    }
                }
                for (const a of allies) {
                    if (!a || !a.alive) continue;
                    if (a.tankType === 'toxic') continue; // immune
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
        if (ent.isBoss) { ent.poisonTimer = 0; return; } // Boss is immune to poison
        if (ent.tankType === 'toxic') { ent.poisonTimer = 0; return; } // Toxic tank is immune to poison
        if (ent.poisonTimer > 0) {
            // Fixed 40 HP/sec poison damage regardless of max HP
            const dmgPerTick = 40 / 60;

              // Mirror Tank Logic: Poison counts as hit type 'toxic' (for any mirror tank)
              if (ent.tankType === 'mirror') {
                  ent.lastHitType = 'toxic';
                  ent.lastHitTime = Date.now();
              }

            dealDamageToEntity(ent, dmgPerTick);
            ent.poisonTimer--;
            // Emit green toxic particles from poisoned entity
            if (typeof spawnParticle === 'function' && Math.random() > 0.5) {
                const px = (ent.x || 0) + Math.random() * (ent.w || 20);
                const py = (ent.y || 0) + Math.random() * (ent.h || 20);
                spawnParticle(px, py, '#39d353', 0.6);
            }
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
                    const maxHp = (typeof tankMaxHpByType !== 'undefined' && tankMaxHpByType[tankType]) || 300;
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
                        a.x = p.x; a.y = p.y; a.hp = (typeof tankMaxHpByType !== 'undefined' && tankMaxHpByType[a.tankType]) || 300; a.alive = true; a.respawnTimer = 0; a.respawnCount = (a.respawnCount || 0) + 1;
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
                        e.x = p.x; e.y = p.y; e.hp = (typeof tankMaxHpByType !== 'undefined' && tankMaxHpByType[e.tankType]) || 300; e.alive = true; e.respawnTimer = 0; e.respawnCount = (e.respawnCount || 0) + 1;
                    }
                }
            }
        }
    }

    // Training mode: intercept any premature game-over before the gameState guard
    if (currentMode === 'training') {
        if (gameState !== 'playing') gameState = 'playing'; // undo premature lose/win
        if (!tank.alive || tank.hp <= 0) {
            const tankMaxHp = { 'normal': 300, 'ice': 300, 'fire': 600, 'buratino': 350, 'toxic': 250, 'plasma': 300, 'musical': 400, 'illuminat': 300, 'mirror': 400, 'time': 200, 'machinegun': 300, 'buckshot': 350, 'waterjet': 300, 'imitator': 250, 'electric': 400 };
            tank.hp = tankMaxHp[tankType] || 300;
            tank.alive = true;
            tank.x = 150; tank.y = worldHeight / 2 - 19;
        }
        return;
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
        // Custom map: no rewards
        if (window._customMapActive) {
            syncResultOverlay('win');
        } else if (currentMode === 'single') {
            coins += 30;
            trophies += 3; // single trophy reward
            if (typeof addIndividualTankTrophies === 'function') addIndividualTankTrophies(tankType, 3);
        } else if (currentMode === 'team') {
            coins += 40;
            trophies += 5; // team trophy reward
            if (typeof addIndividualTankTrophies === 'function') addIndividualTankTrophies(tankType, 5);
        } else if (currentMode === 'duel') {
            coins += 20;
            trophies += 2; // duel trophy reward
            if (typeof addIndividualTankTrophies === 'function') addIndividualTankTrophies(tankType, 2);
        } else if (currentMode === 'onevsall') {
            coins += 80;
            trophies += 10; // one vs all trophy reward
            if (typeof addIndividualTankTrophies === 'function') addIndividualTankTrophies(tankType, 10);
        } else if (currentMode === 'bossfight') {
            coins += 300;
            trophies += 25; // boss fight win reward
            if (typeof addIndividualTankTrophies === 'function') addIndividualTankTrophies(tankType, 25);
        }
        if (!window._customMapActive) saveProgress();
        syncResultOverlay('win');
    } else if (!tank.alive || tank.hp <= 0) {
        gameState = 'lose';
        // Custom map: no trophy penalties
        if (window._customMapActive) {
            syncResultOverlay('lose');
        } else if (currentMode === 'single' || currentMode === 'duel') {
            loseTrophies(1); // lose 1 trophy
        } else if (currentMode === 'team') {
            loseTrophies(3); // lose 3 trophies in team mode
        } else if (currentMode === 'onevsall') {
            loseTrophies(5); // lose 5 trophies in one vs all
        } else if (currentMode === 'bossfight') {
            loseTrophies(15); // lose 15 trophies in boss fight
        }
        syncResultOverlay('lose');
    }
}

function moveWithCollision(dx, dy) {
    tank.x += dx;
    tank.y += dy;
    // Если после движения мы врезаемся в другой танк — откатываем движение
    const tRect = { x: tank.x, y: tank.y, w: tank.w, h: tank.h };
    let collidedWithTank = false;
    if (typeof tank !== 'undefined') {
        for (const e of enemies) {
            if (!e || e === tank || e.alive === false) continue;
            if (checkRectCollision(tRect, e)) { collidedWithTank = true; break; }
        }
        for (const a of allies) {
            if (!a || a === tank || a.alive === false) continue;
            if (checkRectCollision(tRect, a)) { collidedWithTank = true; break; }
        }
        for (const il of illusions) {
            if (!il || il === tank || il.life <= 0) continue;
            if (checkRectCollision(tRect, il)) { collidedWithTank = true; break; }
        }
    }
    if (collidedWithTank) {
        tank.x -= dx; tank.y -= dy;
        return; // movement blocked by another tank
    }

    for (const obj of objects) {
        if (checkRectCollision(tank, obj)) {
            if (obj.type === 'box' || obj.type === 'barrel') {
                // Пытаемся толкать ящик
                obj.x += dx;
                obj.y += dy;
                
                let boxBlocked = objects.some(o => o !== obj && checkRectCollision(obj, o)) ||
                                obj.x < 0 || obj.y < 0 || 
                                obj.x + obj.w > worldWidth || obj.y + obj.h > worldHeight;
                // Also prevent pushing a box into a tank
                if (!boxBlocked) {
                    const boxRect = { x: obj.x, y: obj.y, w: obj.w, h: obj.h };
                    if (typeof tank !== 'undefined' && checkRectCollision(boxRect, tank)) boxBlocked = true;
                    for (const a of allies) { if (!boxBlocked && a && a.alive !== false && checkRectCollision(boxRect, a)) boxBlocked = true; }
                    for (const e of enemies) { if (!boxBlocked && e && e.alive !== false && checkRectCollision(boxRect, e)) boxBlocked = true; }
                    for (const il of illusions) { if (!boxBlocked && il && il.life > 0 && checkRectCollision(boxRect, il)) boxBlocked = true; }
                }
                
                if (boxBlocked) {
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

    // Sport shield removed

    // Края мира
    tank.x = Math.max(0, Math.min(worldWidth - tank.w, tank.x));
    tank.y = Math.max(0, Math.min(worldHeight - tank.h, tank.y));
}

