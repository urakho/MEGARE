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

function updateMechPower(unit) {
    const type = getEntityTankType(unit);
    if (type !== 'mechDiy' && type !== 'mechShield' && type !== 'mechRocket') {
        unit.mechPowerStunTime = 0;
        unit.mechLowEnergyLatched = false;
        return;
    }
    const baseEnergy = type === 'mechShield' ? 130 : type === 'mechRocket' ? 150 : 110;
    if (unit.mechMaxEnergy === undefined) unit.mechMaxEnergy = baseEnergy;
    if (unit.mechEnergy === undefined) unit.mechEnergy = unit.mechMaxEnergy;
    const beforeRegen = Math.max(0, unit.mechEnergy);
    unit.mechEnergy = Math.min(unit.mechMaxEnergy, beforeRegen + 0.05);
    // Latch each depletion so a low battery cannot repeatedly restart the stun.
    if (beforeRegen <= 5 && !unit.mechLowEnergyLatched) {
        unit.mechLowEnergyLatched = true;
        unit.mechPowerStunTime = 60;
    } else {
        unit.mechPowerStunTime = Math.max(0, (unit.mechPowerStunTime || 0) - 1);
    }
    if (unit.mechEnergy > 5) unit.mechLowEnergyLatched = false;
    if (unit.mechPowerStunTime > 0) {
        unit.paralyzed = true;
        if (type === 'mechShield') { unit.mechShieldActive = false; unit.mechShieldFadeTimer = 0; }
        // The ordinary paralysis timer ticks after this helper; preserve independent effects.
        unit.paralyzedTime = Math.max(unit.paralyzedTime || 0, unit.mechPowerStunTime + 1);
    }
}

function isBurovoyTank(entity) {
    return getEntityTankType(entity) === 'burovoy';
}

function isBurovoyBurrowActive(entity) {
    return isBurovoyTank(entity) && !!entity?.burovoyBurrowActive;
}

function refreshBurovoyFireSlow(entity, duration = 20) {
    if (!entity || entity.alive === false) return;
    entity.burovoyFireSlowTimer = Math.max(entity.burovoyFireSlowTimer || 0, duration);
}

function getEntityFireCooldownStep(entity) {
    const baseStep = !entity || (entity.burovoyFireSlowTimer || 0) <= 0 || entity._burovoyFireSlowTick ? 1 : 0;
    const type = getEntityTankType(entity);
    const reloadSpeed = type === 'electric' || type === 'plasma' || type === 'fire' ? 1 : 1.25;
    return baseStep * GameTerrain.reloadFactor() * reloadSpeed;
}

const TANK_SHOT_COOLDOWNS = Object.freeze({
    normal: 30, ice: 30, fire: 135, waterjet: 0, buratino: 96,
    toxic: 35, plasma: 300, musical: 80, illuminat: 240,
    mirror: 90, machinegun: 5, buckshot: 80, time: 60,
    imitator: 60, electric: 80, robot: 60, medical: 60,
    mine: 90, spartan: 40, kamikaze: 30, roman: 60,
    egyptian: 45, pyro: 40, air: 40, kvant: 60,
    mechDiy: 60, mechShield: 45, mechRocket: 50
});

const MACHINEGUN_MAX_HEAT = 160;
const MACHINEGUN_COOL_RATE = MACHINEGUN_MAX_HEAT / 120;
const MACHINEGUN_BULLET_DAMAGE = 10;
const BUCKSHOT_PELLET_DAMAGE = 75;

function getTankShotCooldown(type) {
    return TANK_SHOT_COOLDOWNS[type] ?? FIRE_COOLDOWN;
}

function coolMachinegunHeat(unit) {
    unit.heat = Math.max(0, (unit.heat || 0) - MACHINEGUN_COOL_RATE);
    if (unit.heat === 0) unit.overheated = false;
}

function advanceFlamethrowerBurst(unit, shotsPerBurst, shotInterval) {
    unit.flamethrowerShots = (unit.flamethrowerShots || 0) + 1;
    if (unit.flamethrowerShots >= shotsPerBurst) {
        unit.flamethrowerShots = 0;
        unit.fireCooldown = 135;
    } else {
        unit.fireCooldown = shotInterval;
    }
}

function advanceMyasnoyBurst(unit) {
    unit.myasnoyBurstShots = (unit.myasnoyBurstShots || 0) + 1;
    if (unit.myasnoyBurstShots >= 19) {
        unit.myasnoyBurstShots = 0;
        unit.myasnoyReloading = true;
        unit.fireCooldown = 150;
    } else {
        unit.myasnoyReloading = false;
        unit.fireCooldown = 12;
    }
}

function advanceMyasnoySpray(unit) {
    unit.myasnoyBurstFrames = (unit.myasnoyBurstFrames || 0) + 1;
    if (unit.myasnoyBurstFrames >= 180) {
        unit.myasnoyBurstFrames = 0;
        unit.myasnoyReloading = true;
        unit.fireCooldown = 150;
    } else {
        unit.myasnoyReloading = false;
        unit.fireCooldown = 0;
    }
}

function startWaterjetBurst(unit) {
    if (unit.waterjetActive || (unit.fireCooldown || 0) > 0) return;
    unit.waterjetActive = true;
    unit.waterjetTimer = 90;
}

function stopWaterjetBurst(unit) {
    if (!unit.waterjetActive) return;
    unit.waterjetActive = false;
    unit.waterjetTimer = 0;
    unit.waterjetBeamLen = 0;
    unit.waterjetHitWall = false;
    unit.waterjetHitTarget = false;
    unit.fireCooldown = 90;
}

function canBurovoyPhaseThroughWalls(entity) {
    return isBurovoyBurrowActive(entity);
}

function isBlockingTerrainObject(obj) {
    return !!obj && (obj.type === 'wall' || obj.type === 'woodenWall' || obj.type === 'box' || obj.type === 'barrel');
}

function isEntityPlacementFree(entity, x, y) {
    if (!entity) return false;
    const rect = { x, y, w: entity.w, h: entity.h };
    if (rect.x < 0 || rect.y < 0 || rect.x + rect.w > worldWidth || rect.y + rect.h > worldHeight) return false;

    if (typeof objects !== 'undefined') {
        for (const obj of objects) {
            if (isBlockingTerrainObject(obj) && checkRectCollision(rect, obj)) return false;
        }
    }

    if (typeof tank !== 'undefined' && tank && tank !== entity && tank.alive !== false && checkRectCollision(rect, tank)) return false;
    if (typeof allies !== 'undefined') {
        for (const ally of allies) {
            if (!ally || ally === entity || ally.alive === false) continue;
            if (checkRectCollision(rect, ally)) return false;
        }
    }
    if (typeof enemies !== 'undefined') {
        for (const enemy of enemies) {
            if (!enemy || enemy === entity || enemy.alive === false) continue;
            if (checkRectCollision(rect, enemy)) return false;
        }
    }
    if (typeof illusions !== 'undefined') {
        for (const illusion of illusions) {
            if (!illusion || illusion === entity || illusion.life <= 0) continue;
            if (checkRectCollision(rect, illusion)) return false;
        }
    }

    return true;
}

function getOverlappingBurrowBlocker(entity) {
    if (!entity || typeof objects === 'undefined') return null;
    const rect = { x: entity.x, y: entity.y, w: entity.w, h: entity.h };
    for (const obj of objects) {
        if (isBlockingTerrainObject(obj) && checkRectCollision(rect, obj)) return obj;
    }
    if (typeof tank !== 'undefined' && tank && tank !== entity && tank.alive !== false && checkRectCollision(rect, tank)) return tank;
    if (typeof allies !== 'undefined') {
        for (const ally of allies) {
            if (!ally || ally === entity || ally.alive === false) continue;
            if (checkRectCollision(rect, ally)) return ally;
        }
    }
    if (typeof enemies !== 'undefined') {
        for (const enemy of enemies) {
            if (!enemy || enemy === entity || enemy.alive === false) continue;
            if (checkRectCollision(rect, enemy)) return enemy;
        }
    }
    if (typeof illusions !== 'undefined') {
        for (const illusion of illusions) {
            if (!illusion || illusion === entity || illusion.life <= 0) continue;
            if (checkRectCollision(rect, illusion)) return illusion;
        }
    }
    return null;
}

function shuffleInPlace(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function resolveBurovoyBurrowExit(entity) {
    if (!entity) return false;

    const blocker = getOverlappingBurrowBlocker(entity);
    if (!blocker) return false;

    const gap = 8;
    const clampX = (value) => Math.max(0, Math.min(worldWidth - entity.w, value));
    const clampY = (value) => Math.max(0, Math.min(worldHeight - entity.h, value));
    const maxSearchRadius = Math.max((typeof navCell !== 'undefined' ? navCell : 25) * 8, 220);
    const sideBuilders = shuffleInPlace([
        () => ({ x: clampX(blocker.x - entity.w - gap), y: clampY(blocker.y + Math.random() * Math.max(0, blocker.h - entity.h)) }),
        () => ({ x: clampX(blocker.x + blocker.w + gap), y: clampY(blocker.y + Math.random() * Math.max(0, blocker.h - entity.h)) }),
        () => ({ x: clampX(blocker.x + Math.random() * Math.max(0, blocker.w - entity.w)), y: clampY(blocker.y - entity.h - gap) }),
        () => ({ x: clampX(blocker.x + Math.random() * Math.max(0, blocker.w - entity.w)), y: clampY(blocker.y + blocker.h + gap) })
    ]);

    for (const buildCandidate of sideBuilders) {
        const candidate = buildCandidate();
        if (isEntityPlacementFree(entity, candidate.x, candidate.y)) {
            entity.x = candidate.x;
            entity.y = candidate.y;
            return true;
        }
        if (typeof findFreeSpot === 'function') {
            const spot = findFreeSpot(candidate.x, candidate.y, entity.w, entity.h, maxSearchRadius, 12, entity, 0);
            if (spot && isEntityPlacementFree(entity, spot.x, spot.y)) {
                entity.x = spot.x;
                entity.y = spot.y;
                return true;
            }
        }
    }

    if (typeof findFreeSpot === 'function') {
        const fallback = findFreeSpot(entity.x, entity.y, entity.w, entity.h, Math.max(worldWidth, worldHeight), 24, entity, 0);
        if (fallback && isEntityPlacementFree(entity, fallback.x, fallback.y)) {
            entity.x = fallback.x;
            entity.y = fallback.y;
            return true;
        }
    }

    entity.x = clampX(entity.x);
    entity.y = clampY(entity.y);
    return false;
}

function syncBurovoyState(entity) {
    if (!entity || !isBurovoyTank(entity)) return;

    const entityType = getEntityTankType(entity);
    let baseMaxHp = (typeof tankMaxHpByType !== 'undefined') ? (tankMaxHpByType[entityType] || 600) : 600;
    let baseSpeed = (typeof tankMaxSpeedByType !== 'undefined') ? (tankMaxSpeedByType[entityType] || 2.3) : 2.3;

    if (typeof tank !== 'undefined' && entity === tank) {
        if (typeof getTankUpgrade === 'function') {
            baseMaxHp += getTankUpgrade(entityType, 'hp') * 50;
        }
        if (typeof getTankSpeedBonus === 'function') {
            baseSpeed += getTankSpeedBonus(entityType);
        }
    }

    const burrowDuration = Math.max(1, entity.burovoyBurrowDuration || 180);
    const wasBurrowed = !!entity.burovoyBurrowActive && (entity.burovoyBurrowTimer || 0) > 0;
    if (wasBurrowed) {
        entity.burovoyBurrowTimer = Math.max(0, (entity.burovoyBurrowTimer || 0) - 1);
    }
    entity.burovoyBurrowActive = wasBurrowed && entity.burovoyBurrowTimer > 0;
    entity.burovoyBurrowDuration = burrowDuration;

    entity.maxHp = baseMaxHp;
    entity.hp = Math.min(entity.hp != null ? entity.hp : baseMaxHp, baseMaxHp);
    entity.speed = parseFloat((entity.burovoyBurrowActive ? (baseSpeed / 1.25) : baseSpeed).toFixed(2));

    if (wasBurrowed && !entity.burovoyBurrowActive) {
        resolveBurovoyBurrowExit(entity);
    }
}

function getBurovoyDrillHitShape(source, options = {}) {
    const angle = typeof options.angle === 'number' ? options.angle : (source.turretAngle || source.baseAngle || 0);
    const drillLength = options.drillLength || options.radius || 76;
    const drillWidth = options.drillWidth || Math.max(12, Math.min(source.w || 0, source.h || 0) * 0.22);
    const tipRadius = options.tipRadius || Math.max(12, drillWidth * 0.8);
    const startOffset = Math.max(source.w || 0, source.h || 0) * 0.24;
    const centerX = source.x + (source.w || 0) / 2;
    const centerY = source.y + (source.h || 0) / 2;
    const startX = centerX + Math.cos(angle) * startOffset;
    const startY = centerY + Math.sin(angle) * startOffset;
    const endX = centerX + Math.cos(angle) * (startOffset + drillLength);
    const endY = centerY + Math.sin(angle) * (startOffset + drillLength);

    return {
        angle,
        drillLength,
        drillWidth,
        tipRadius,
        startOffset,
        centerX,
        centerY,
        startX,
        startY,
        endX,
        endY
    };
}

function applyBurovoyDrillDamage(source, damage, options = {}) {
    if (!source || source.alive === false) return 0;
    if (isBurovoyBurrowActive(source)) return 0;

    const shape = getBurovoyDrillHitShape(source, options);
    let hits = 0;
    source.burovoyDrillHit = false;

    const tryHit = (target) => {
        if (!target || target === source || target.alive === false) return;
        if (target.team === source.team) return;
        if (!drillIntersectsRect(shape.startX, shape.startY, shape.endX, shape.endY, shape.drillWidth, target) && !circleIntersectsRect(shape.endX, shape.endY, shape.tipRadius, target)) return;
        const isDrone = playerDrones.includes(target) || enemyDrones.includes(target);
        const dealt = isDrone ? damageCombatDrone(target, damage) : dealDamageToEntity(target, damage);
        if (dealt <= 0) return;
        refreshBurovoyFireSlow(target);
        if (!isDrone) {
            if (!target.burovoyDrillParalysis) {
                target.burovoyOtherParalysisTime = target.paralyzed ? Math.max(0, target.paralyzedTime || 0) : 0;
            }
            target.burovoyDrillParalysis = true;
            target.paralyzed = true;
            target.paralyzedTime = Math.max(target.paralyzedTime || 0, 12);
        }
        source.burovoyDrillHit = true;
        hits++;
        if (typeof spawnParticle === 'function' && window.effectsEnabled !== false) {
            spawnParticle(target.x + (target.w || 0) / 2, target.y + (target.h || 0) / 2, 'rgba(255, 180, 60, 0.95)', 1);
        }
    };

    if (typeof tank !== 'undefined') tryHit(tank);
    if (typeof allies !== 'undefined') {
        for (const ally of allies) tryHit(ally);
    }
    if (typeof enemies !== 'undefined') {
        for (const enemy of enemies) tryHit(enemy);
    }
    forEachHostileDrone(source.team, tryHit);

    if (typeof objects !== 'undefined') {
        for (let index = objects.length - 1; index >= 0; index--) {
            const obj = objects[index];
            if (!obj) continue;
            if (!drillIntersectsRect(shape.startX, shape.startY, shape.endX, shape.endY, shape.drillWidth, obj) && !circleIntersectsRect(shape.endX, shape.endY, shape.tipRadius, obj)) continue;
            if (obj.type === 'woodenWall' && damageWoodenWall(obj, damage, { hitColor: '#b87a35', hitParticles: 2, hitX: shape.startX, hitY: shape.startY })) {
                source.burovoyDrillHit = true;
            } else if (obj.type === 'box') {
                objects.splice(index, 1);
                source.burovoyDrillHit = true;
                navNeedsRebuild = true;
                if (typeof spawnParticle === 'function') {
                    for (let particleIndex = 0; particleIndex < 5; particleIndex++) {
                        spawnParticle(obj.x + obj.w / 2, obj.y + obj.h / 2);
                    }
                }
            } else if (obj.type === 'barrel' && typeof explodeBarrel === 'function') {
                explodeBarrel(obj);
                source.burovoyDrillHit = true;
            }
        }
    }

    return hits;
}

function syncBurovoyDrillParalysis(target) {
    if (!target || !target.burovoyDrillParalysis) return;
    const otherParalysisTime = Math.max(
        0,
        (target.burovoyOtherParalysisTime || 0) - 1,
        (target.paralyzedTime || 0) > 12 ? target.paralyzedTime : 0
    );
    target.burovoyOtherParalysisTime = otherParalysisTime;
    const sources = [tank, ...allies, ...enemies];
    for (const source of sources) {
        if (!source || source.alive === false || !source.burovoyDrillActive || source.team === target.team) continue;
        const shape = getBurovoyDrillHitShape(source);
        if (drillIntersectsRect(shape.startX, shape.startY, shape.endX, shape.endY, shape.drillWidth, target) ||
            circleIntersectsRect(shape.endX, shape.endY, shape.tipRadius, target)) return;
    }
    target.burovoyDrillParalysis = false;
    target.burovoyFireSlowTimer = 0;
    target._burovoyFireSlowTick = false;
    target.paralyzedTime = otherParalysisTime;
    target.paralyzed = otherParalysisTime > 0;
    target.burovoyOtherParalysisTime = 0;
}

function updateBurovoyDrillAttack(source, wantsAttack, options = {}) {
    if (!source || source.alive === false) return 0;

    const active = !!wantsAttack && !isBurovoyBurrowActive(source);
    source.burovoyDrillActive = active;

    if (!active) {
        source.burovoyDrillHit = false;
        source.burovoyDrillDamageCarry = 0;
        return 0;
    }

    source.burovoyDrillAnimUntil = Date.now() + 80;
    source.burovoyDrillAnimDuration = 80;
    source.burovoyDrillIsUlt = false;

    const damageMult = (typeof tank !== 'undefined' && source === tank && typeof getPlayerDmgMult === 'function') ? getPlayerDmgMult() : 1;
    const damagePerSecond = options.damagePerSecond || 40;
    source.burovoyDrillDamageCarry = (source.burovoyDrillDamageCarry || 0) + (damagePerSecond / 60) * damageMult;
    const damageTick = Math.floor(source.burovoyDrillDamageCarry + 1e-9);
    if (damageTick <= 0) {
        source.burovoyDrillHit = false;
        return 0;
    }

    source.burovoyDrillDamageCarry -= damageTick;
    return applyBurovoyDrillDamage(source, damageTick, options);
}

function castBurovoyUltimate(source) {
    if (!source || source.alive === false) return 0;
    if (isBurovoyBurrowActive(source)) return 0;
    source.burovoyBurrowActive = true;
    source.burovoyBurrowTimer = 180;
    source.burovoyBurrowDuration = 180;
    source.burovoyDrillActive = false;
    source.burovoyDrillHit = false;
    source.burovoyDrillDamageCarry = 0;
    source.burovoyDrillAnimUntil = 0;
    source.burovoyDrillAnimDuration = 0;
    source.burovoyDrillIsUlt = false;
    return 0;
}

function applyTargetDamageModifiers(entity, damage) {
    if (entity && (entity.sandCurseTimer || 0) > 0) {
        return damage * 1.25;
    }
    return damage;
}

function isPlayerDamageProtected() {
    return typeof tank !== 'undefined' && !!tank &&
        (tank.kamikazeInvincible || (typeof tankType !== 'undefined' && tankType === 'burovoy' && tank.burovoyBurrowActive));
}

function dealDamageToEntity(entity, damage) {
    if (entity && entity.romanSummon === 'banner') return 0;
    if (entity.kamikazeUltActive && entity.kamikazeInvincible) return 0;
    if (isBurovoyBurrowActive(entity) || (typeof tank !== 'undefined' && entity === tank && isPlayerDamageProtected())) return 0;
    const finalDamage = applyTargetDamageModifiers(entity, damage);
    entity.hp = (entity.hp || 0) - finalDamage;
    return finalDamage;
}

function forEachHostileDrone(team, callback) {
    const friendlyDrones = typeof playerDrones === 'undefined' ? [] : playerDrones;
    const hostileDrones = typeof enemyDrones === 'undefined' ? [] : enemyDrones;
    for (const group of [friendlyDrones, hostileDrones]) {
        for (let index = group.length - 1; index >= 0; index--) {
            const drone = group[index];
            if (drone && drone.romanSummon !== 'banner' && drone.alive !== false && drone.team !== team) callback(drone);
        }
    }
}

function damageCombatDrone(drone, damage) {
    const dealt = dealDamageToEntity(drone, damage);
    if (drone.hp <= 0 && drone.romanSummon) { retireRomanUnit(drone); return dealt; }
    if (drone.hp <= 0) {
        for (const group of [playerDrones, enemyDrones]) {
            const index = group.indexOf(drone);
            if (index !== -1) group.splice(index, 1);
        }
        drone.alive = false;
        spawnExplosion(drone.x + drone.w / 2, drone.y + drone.h / 2, 36, 'impact');
    }
    return dealt;
}

function damageDronesInRadius(x, y, radius, maxDamage, team, minimumDamage = 1) {
    forEachHostileDrone(team, drone => {
        const closestX = Math.max(drone.x, Math.min(x, drone.x + drone.w));
        const closestY = Math.max(drone.y, Math.min(y, drone.y + drone.h));
        const distance = Math.hypot(closestX - x, closestY - y);
        if (distance <= radius) {
            damageCombatDrone(drone, Math.max(minimumDamage, Math.round((1 - distance / radius) * maxDamage)));
        }
    });
}

function hitCombatDroneWithBullet(bullet, drone) {
    if (drone.romanSummon === 'banner') return false;
    if (bullet.type === 'toxic' || bullet.type === 'megabomb') return false;
    if (bullet.type === 'rocket' || bullet.type === 'smallRocket') {
        explodeRocket(bullet);
        return true;
    }
    if (bullet.type === 'mechRocketBullet') {
        explodeMechRocket(bullet, drone);
        return true;
    }
    if (bullet.hasExplosion) {
        spawnExplosion(bullet.x, bullet.y, bullet.explosionRadius, 'blast');
        const damage = bullet.owner === 'player' ? applyPlayerDamage(bullet.damage || 100) : (bullet.damage || 100);
        applyDamage(bullet.x, bullet.y, bullet.explosionRadius, damage, bullet.team);
        return true;
    }
    const piercing = ['plasma', 'plasmaBlast', 'railgun', 'spartanSpear', 'electricBall'].includes(bullet.type);
    if (piercing) {
        const hitDrones = bullet.hitDrones || (bullet.hitDrones = []);
        if (hitDrones.includes(drone)) return false;
        hitDrones.push(drone);
    }
    const fallbackDamage = {
        plasma: 350, plasmaBlast: 600,
        railgun: 65, spartanSpear: 80, electricBall: 150, droneBullet: 25
    }[bullet.type] || 100;
    const damage = bullet.owner === 'player'
        ? applyPlayerDamage(bullet.damage ?? fallbackDamage)
        : (bullet.damage ?? fallbackDamage);
    const facing = Math.atan2(-bullet.vy, -bullet.vx) - (drone.turretAngle || 0);
    const blocked = drone.romanSummon === 'legionary' && drone.bracing && Math.cos(facing) > 0.55;
    if (blocked) drone.shieldHit = 9;
    damageCombatDrone(drone, blocked ? damage * 0.65 : damage);
    if (bullet.type === 'pyroBullet' && drone.romanSummon === 'legionary') { drone.burnTimer = 300; drone.burnDps = 10; }
    if (bullet.type === 'ice' && drone.romanSummon === 'legionary') {
        drone.iceSlowed = true; drone.iceSlowedTime = 240;
    } else if (bullet.type === 'ice') {
        drone.paralyzed = true;
        drone.paralyzedTime = 180;
    }
    return !piercing;
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
    if ((entity.burovoyFireSlowTimer || 0) > 0) {
        entity.burovoyFireSlowTimer--;
        entity._burovoyFireSlowTick = !entity._burovoyFireSlowTick;
    } else {
        entity._burovoyFireSlowTick = false;
    }
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

// Broad phase for solid terrain hit by ordinary bullets. Preserve object order.
function buildTerrainCollisionIndex(terrain, cellSize = 100) {
    const cells = new Map();
    terrain.forEach((obj, order) => {
        if (!isBlockingTerrainObject(obj)) return;
        const entry = { obj, order };
        const left = Math.floor(obj.x / cellSize);
        const right = Math.floor((obj.x + obj.w) / cellSize);
        const top = Math.floor(obj.y / cellSize);
        const bottom = Math.floor((obj.y + obj.h) / cellSize);
        for (let y = top; y <= bottom; y++) {
            for (let x = left; x <= right; x++) {
                const key = `${x},${y}`;
                if (!cells.has(key)) cells.set(key, []);
                cells.get(key).push(entry);
            }
        }
    });
    return { cells, cellSize };
}

function queryTerrainCollisionIndex(index, rect) {
    const entries = new Set();
    const left = Math.floor(rect.x / index.cellSize);
    const right = Math.floor((rect.x + rect.w) / index.cellSize);
    const top = Math.floor(rect.y / index.cellSize);
    const bottom = Math.floor((rect.y + rect.h) / index.cellSize);
    for (let y = top; y <= bottom; y++) {
        for (let x = left; x <= right; x++) {
            for (const entry of index.cells.get(`${x},${y}`) || []) entries.add(entry);
        }
    }
    return [...entries].sort((a, b) => a.order - b.order).map(entry => entry.obj);
}

function circleIntersectsRect(cx, cy, radius, rect) {
    const nearestX = Math.max(rect.x, Math.min(cx, rect.x + rect.w));
    const nearestY = Math.max(rect.y, Math.min(cy, rect.y + rect.h));
    const dx = cx - nearestX;
    const dy = cy - nearestY;
    return (dx * dx + dy * dy) <= radius * radius;
}

function drillIntersectsRect(startX, startY, endX, endY, thickness, rect) {
    const samples = 8;
    for (let i = 0; i <= samples; i++) {
        const t = i / samples;
        const px = startX + (endX - startX) * t;
        const py = startY + (endY - startY) * t;
        if (circleIntersectsRect(px, py, thickness, rect)) return true;
    }
    return false;
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
    forEachHostileDrone(swarm.team, consider);
    return bestTarget;
}

function applyPharaohSwarmDamage(entity, damage) {
    if (!entity || entity.alive === false) return;
    if (entity.kamikazeUltActive && entity.kamikazeInvincible) return;
    if (isBurovoyBurrowActive(entity) || (typeof tank !== 'undefined' && entity === tank && isPlayerDamageProtected())) return;
    if (playerDrones.includes(entity) || enemyDrones.includes(entity)) {
        damageCombatDrone(entity, damage);
        return;
    }
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
    forEachHostileDrone(swarm.team, affectEntity);

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
                const chainSessionId = battleSessionId;
                setTimeout(() => {
                    if (chainSessionId === battleSessionId && typeof createElectricChain === 'function' && nextE && nextE.alive) {
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

function updateIlluminatMarkDamage() {
    if (typeof GameTerrain === 'undefined' || typeof GameTerrain.forEachIlluminatMark !== 'function') return;
    const damagePerTick = 10 / 60;
    GameTerrain.forEachIlluminatMark(mark => {
        const team = mark.team ?? mark.owner?.team;
        if (team === undefined) return;
        const radius = mark.size * 0.4;
        const touches = target => {
            if (!target || target.alive === false || target.team === team) return false;
            const nearestX = Math.max(target.x, Math.min(mark.x, target.x + target.w));
            const nearestY = Math.max(target.y, Math.min(mark.y, target.y + target.h));
            return Math.hypot(mark.x - nearestX, mark.y - nearestY) <= radius;
        };
        if (gameState !== 'playing') return;
        if (touches(tank)) {
            const shieldFactor = tank.romanShieldActive ? 0.5 :
                (tankType === 'mechShield' && tank.mechShieldActive ? 0.4 : 1);
            const dealt = dealDamageToEntity(tank, damagePerTick * shieldFactor);
            if (dealt > 0 && (window.frameCount || 0) % 10 === 0) tank.hitFlashTime = Date.now();
            if (dealt > 0 && tank.hp <= 0) {
                spawnExplosion(tank.x + tank.w / 2, tank.y + tank.h / 2, 65);
                if (currentMode === 'war') { tank.alive = false; tank.respawnTimer = 600; }
                else { gameState = 'lose'; loseModeTrophies(); syncResultOverlay('lose'); }
            }
        }
        if (gameState !== 'playing') return;
        for (const group of [allies, enemies]) {
            for (let index = group.length - 1; index >= 0; index--) {
                const target = group[index];
                if (!touches(target)) continue;
                const dealt = dealDamageToEntity(target, damagePerTick);
                if (dealt > 0 && (window.frameCount || 0) % 10 === 0) target.hitFlashTime = Date.now();
                if (dealt <= 0 || target.hp > 0) continue;
                spawnExplosion(target.x + target.w / 2, target.y + target.h / 2, 65);
                if (currentMode === 'war') { target.alive = false; target.respawnTimer = 600; }
                else group.splice(index, 1);
            }
        }
        forEachHostileDrone(team, drone => {
            if (touches(drone)) damageCombatDrone(drone, damagePerTick);
        });
    });
}

// Update and apply damage from active nova zones
function updateNovaZones() {
    if (typeof novaZones === 'undefined' || !novaZones.length) return;
    
    for (let z = novaZones.length - 1; z >= 0; z--) {
        const zone = novaZones[z];
        zone.life--;
        
        // Apply damage to enemies in range every 10 frames (~0.17 seconds)
        if (zone.life % 10 === 0) {
            forEachHostileDrone(zone.ownerTeam, drone => {
                const centerX = drone.x + drone.w / 2;
                const centerY = drone.y + drone.h / 2;
                if (Math.hypot(centerX - zone.centerX, centerY - zone.centerY) <= zone.radius) {
                    damageCombatDrone(drone, zone.damage);
                }
            });
            if (tank && tank.alive !== false && tank.team !== zone.ownerTeam &&
                Math.hypot(tank.x + tank.w / 2 - zone.centerX, tank.y + tank.h / 2 - zone.centerY) <= zone.radius) {
                const dealt = dealDamageToEntity(tank, applyIncomingPlayerDamage(zone.damage));
                if (dealt > 0) {
                    tank.hitFlashTime = Date.now();
                    if (tank.hp <= 0 && gameState === 'playing') {
                        spawnExplosion(tank.x + tank.w / 2, tank.y + tank.h / 2, 65);
                        if (currentMode === 'war') {
                            tank.alive = false;
                            tank.respawnTimer = 600;
                        } else {
                            gameState = 'lose';
                            loseModeTrophies();
                            syncResultOverlay('lose');
                        }
                    }
                }
            }
            for (let i = allies.length - 1; i >= 0; i--) {
                const ally = allies[i];
                if (!ally || ally.alive === false || ally.team === zone.ownerTeam) continue;
                if (Math.hypot(ally.x + ally.w / 2 - zone.centerX, ally.y + ally.h / 2 - zone.centerY) > zone.radius) continue;
                dealDamageToEntity(ally, zone.damage);
                ally.hitFlashTime = Date.now();
                if (ally.hp <= 0) {
                    spawnExplosion(ally.x + ally.w / 2, ally.y + ally.h / 2, 65);
                    if (currentMode === 'war') { ally.alive = false; ally.respawnTimer = 600; }
                    else allies.splice(i, 1);
                }
            }
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

function freezeWithIce(entity, duration) {
    entity.paralyzed = true;
    entity.paralyzedTime = Math.max(entity.paralyzedTime || 0, duration);
    entity.frozenEffect = Math.max(entity.frozenEffect || 0, duration);
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
    freezeWithIce(entity, freezeTime);

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
    if (typeof playerDrones !== 'undefined' && typeof enemyDrones !== 'undefined') for (const unit of [...playerDrones, ...enemyDrones]) if (unit.romanSummon) clearFor(unit);
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
        const field = {
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
        };
        objects.push(field);

        // Freeze units already inside the wave before AI can move them away.
        const freezeNearby = (entity) => {
            if (!isIceFieldTarget(entity, ownerTeam)) return;
            const nearestX = Math.max(entity.x, Math.min(centerX, entity.x + entity.w));
            const nearestY = Math.max(entity.y, Math.min(centerY, entity.y + entity.h));
            if (Math.hypot(nearestX - centerX, nearestY - centerY) <= radius) {
                freezeWithIce(entity, field.contactFreezeTime);
            }
        };
        if (typeof tank !== 'undefined') freezeNearby(tank);
        if (typeof allies !== 'undefined') for (const ally of allies) freezeNearby(ally);
        if (typeof enemies !== 'undefined') for (const enemy of enemies) freezeNearby(enemy);
        for (const unit of [...playerDrones, ...enemyDrones]) if (unit.romanSummon === 'legionary') freezeNearby(unit);
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
    
    for (const e of [tank, ...allies, ...enemies]) {
        if (!e || e.alive === false || e.team === ownerTeam) continue;
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

const BARREL_FUSE_TICKS = 15;

function explodeBarrel(obj) {
    if (!obj || obj.type !== 'barrel' || obj._barrelDetonated || !objects.includes(obj)) return 0;
    obj._barrelDetonated = true;
    objects.splice(objects.indexOf(obj), 1);
    navNeedsRebuild = true;
    const cx = obj.x + obj.w / 2, cy = obj.y + obj.h / 2;
    const radius = 120;
    spawnExplosion(cx, cy, 140, 'barrel');
    // Each newly reached barrel keeps its first fuse, even if several blasts overlap.
    for (const other of objects) {
        if (other.type !== 'barrel' || other._barrelDetonated || (other.barrelFuseTicks || 0) > 0) continue;
        const x = Math.max(other.x, Math.min(cx, other.x + other.w));
        const y = Math.max(other.y, Math.min(cy, other.y + other.h));
        if (Math.hypot(x - cx, y - cy) <= radius) {
            other.barrelFuseTicks = BARREL_FUSE_TICKS;
            other.barrelFuseDuration = BARREL_FUSE_TICKS;
            if (typeof window.frameCount === 'number') other.barrelFuseFrame = window.frameCount;
        }
    }
    const hurt = (unit, group = null) => {
        if (!unit || unit.alive === false || unit.hp <= 0) return;
        const distance = Math.hypot(unit.x + (unit.w || 0) / 2 - cx, unit.y + (unit.h || 0) / 2 - cy);
        if (distance > radius) return;
        dealDamageToEntity(unit, Math.max(50, Math.round((1 - distance / radius) * 300)));
        if (unit.hp > 0) return;
        unit.alive = false;
        spawnExplosion(unit.x + unit.w / 2, unit.y + unit.h / 2, unit === tank ? 70 : 65);
        if (currentMode === 'war') unit.respawnTimer = 600;
        else if (unit === tank) { gameState = 'lose'; loseModeTrophies(); syncResultOverlay('lose'); }
        else if (group) { const i = group.indexOf(unit); if (i >= 0) group.splice(i, 1); }
    };
    hurt(tank);
    for (const ally of [...allies]) hurt(ally, allies);
    for (const enemy of [...enemies]) hurt(enemy, enemies);
    damageDronesInRadius(cx, cy, radius, 300, undefined, 50);
    return 1;
}

function updateBarrelFuses() {
    // Snapshot pending fuses so newly ignited neighbors begin counting on the next tick.
    const pending = objects.filter(obj => obj.type === 'barrel' && obj.barrelFuseTicks > 0);
    for (const barrel of pending) {
        if (barrel._barrelDetonated || (typeof window.frameCount === 'number' && barrel.barrelFuseFrame === window.frameCount)) continue;
        barrel.barrelFuseTicks--;
        if (barrel.barrelFuseTicks <= 0) explodeBarrel(barrel);
    }
}

// Rocket splash shares cover damage and barrel detonation with other explosions.
function explodeRocket(bullet) {
    // visual explosion — radius matches damage radius R=80
    spawnExplosion(bullet.x, bullet.y, 80, 'blast');
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
    damageDronesInRadius(bullet.x, bullet.y, R, 300, bullet.team, 50);
    damageTerrainInRadius(bullet.x, bullet.y, R, 300);
}

// Mech-rocket explosion: smaller radius, configurable damage, no friendly-fire to player team
// directHit: entity that was directly struck — always takes full damage regardless of size
function explodeMechRocket(bullet, directHit = null) {
    const R = bullet.explodeRadius || 50;
    const dmgMax = bullet.damage || 150;
    spawnExplosion(bullet.x, bullet.y, R * 1.2, 'blast');
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
    damageDronesInRadius(bullet.x, bullet.y, R, dmgMax, bullet.team, Math.round(dmgMax * 0.4));
    damageTerrainInRadius(bullet.x, bullet.y, R, dmgMax, { impactVisualMultiplier: 2.5 });
}

// Roman reinforcements share combat targeting with drones, but move and render as ground units.
const ROMAN_LEGION_COOLDOWN = 1200;
const ROMAN_LEGION_DELAY = 180;
const ROMAN_LEGION_LIFETIME = 900;

function romanCombatUnits() {
    return [tank, ...allies, ...enemies, ...playerDrones, ...enemyDrones].filter(unit => unit && unit.alive !== false);
}

function romanPlacementContext() {
    return { units: romanCombatUnits(), terrain: objects.length >= 60 ? buildTerrainCollisionIndex(objects) : null };
}

function canPlaceRomanUnit(unit, x, y, context) {
    if (x < 4 || y < 4 || x + unit.w > worldWidth - 4 || y + unit.h > worldHeight - 4) return false;
    const rect = { x, y, w: unit.w, h: unit.h };
    const terrain = context.terrain ? queryTerrainCollisionIndex(context.terrain, rect) : objects;
    for (const obj of terrain) if (isBlockingTerrainObject(obj) && checkRectCollision(rect, obj)) return false;
    for (const other of context.units) {
        if (other !== unit && other.alive !== false && checkRectCollision(rect, other)) return false;
    }
    return true;
}

function romanClearLine(x, y, tx, ty, destructible = false, terrain = null) {
    const nearby = terrain ? queryTerrainCollisionIndex(terrain, { x: Math.min(x, tx), y: Math.min(y, ty), w: Math.max(1, Math.abs(tx - x)), h: Math.max(1, Math.abs(ty - y)) }) : objects;
    for (const obj of nearby) {
        if (!isBlockingTerrainObject(obj)) continue;
        if (destructible && obj.type !== 'wall') continue;
        if (lineIntersectsRect(x, y, tx, ty, obj.x, obj.y, obj.w, obj.h)) return false;
    }
    return true;
}

function findRomanPosition(unit, x, y, originX, originY, context, radius = 48) {
    for (let ring = 0; ring <= radius; ring += 16) {
        const steps = ring ? 12 : 1;
        for (let i = 0; i < steps; i++) {
            const angle = i / steps * Math.PI * 2;
            const nx = x + Math.cos(angle) * ring, ny = y + Math.sin(angle) * ring;
            if (canPlaceRomanUnit(unit, nx, ny, context) && romanClearLine(originX, originY, nx + unit.w / 2, ny + unit.h / 2, false, context.terrain)) return { x: nx, y: ny };
        }
    }
    return null;
}

function castRomanBanner(unit, owner = 'player') {
    if (!unit || getEntityTankType(unit) !== 'roman' || unit.alive === false || unit.hp <= 0 || unit.paralyzed
        || unit.isUltimateActive || unit.isAutopilotActive || (unit.romanLegionCooldown || 0) > 0) return false;
    if (unit.romanBanner && unit.romanBanner.alive) return false;
    const angle = unit.turretAngle || 0;
    const cx = unit.x + unit.w / 2, cy = unit.y + unit.h / 2;
    const banner = { romanSummon: 'banner', x: 0, y: 0, w: 26, h: 32, hp: 100, maxHp: 100, alive: true,
        owner, commander: unit, team: unit.team ?? (owner === 'enemy' ? 1 : 0), turretAngle: angle,
        life: ROMAN_LEGION_DELAY + ROMAN_LEGION_LIFETIME, maxLife: ROMAN_LEGION_DELAY + ROMAN_LEGION_LIFETIME,
        age: 0, pending: ROMAN_LEGION_DELAY, summonedCount: 0, totalSoldiers: 3, spawnWait: 60 };
    const context = romanPlacementContext();
    const spot = findRomanPosition(banner, cx + Math.cos(angle) * 64 - banner.w / 2,
        cy + Math.sin(angle) * 64 - banner.h / 2, cx, cy, context);
    if (!spot) return false;
    banner.x = spot.x; banner.y = spot.y;
    (owner === 'enemy' ? enemyDrones : playerDrones).push(banner);
    unit.romanBanner = banner;
    unit.romanLegionCooldown = ROMAN_LEGION_COOLDOWN;
    unit.romanShieldActive = false;
    return true;
}

function retireRomanUnit(unit, expired = false) {
    if (unit._romanRetired) return;
    unit._romanRetired = true;
    unit.alive = false;
    for (const group of [playerDrones, enemyDrones]) {
        const index = group.indexOf(unit);
        if (index !== -1) group.splice(index, 1);
    }
    if (window.effectsEnabled !== false) objects.push({ type: 'romanRemnant', x: unit.x, y: unit.y, w: unit.w, h: unit.h,
        unit: { ...unit, target: null, anchor: null, commander: null }, expired, life: 26, maxLife: 26 });
}

function spawnRomanLegionaries(banner, context) {
    const cx = banner.x + banner.w / 2, cy = banner.y + banner.h / 2;
    const group = banner.owner === 'enemy' ? enemyDrones : playerDrones;
    while (banner.summonedCount < (banner.totalSoldiers || 3)) {
        const slot = banner.summonedCount;
        const angle = banner.turretAngle + Math.PI / 2 + slot * Math.PI * 2 / (banner.totalSoldiers || 3);
        const unit = { romanSummon: 'legionary', x: 0, y: 0, w: 24, h: 30, hp: 120, maxHp: 120, alive: true,
            team: banner.team, owner: banner.owner, anchor: banner, commander: banner.commander, slot, turretAngle: banner.turretAngle,
            life: ROMAN_LEGION_LIFETIME, maxLife: ROMAN_LEGION_LIFETIME, fireCooldown: 20 + slot * 12,
            walkPhase: slot * Math.PI * 0.6, age: 0, scanTimer: 0 };
        let spot = findRomanPosition(unit, cx + Math.cos(angle) * 52 - unit.w / 2,
            cy + Math.sin(angle) * 52 - unit.h / 2, cx, cy, context);
        if (!spot) break;
        // Keep the rank when a mounted soldier needs to retry a larger spawn position.
        const ranks = banner.centurionSlots || (banner.centurionSlots = []);
        if (slot < 3 && ranks[slot] === undefined) ranks[slot] = Math.random() < 0.1;
        if (ranks[slot] && banner.centurionSlot === undefined) {
            banner.centurionSlot = slot;
            banner.totalSoldiers = 5;
        }
        unit.isCenturion = banner.centurionSlot === slot;
        if (unit.isCenturion) {
            unit.hp = unit.maxHp = 360;
            unit.w = 40; unit.h = 32;
            unit.life = unit.maxLife = ROMAN_LEGION_LIFETIME * 2;
            spot = findRomanPosition(unit, cx + Math.cos(angle) * 62 - unit.w / 2,
                cy + Math.sin(angle) * 62 - unit.h / 2, cx, cy, context);
            if (!spot) break;
        }
        unit.x = spot.x; unit.y = spot.y;
        group.push(unit); context.units.push(unit); banner.summonedCount++;
    }
}

function romanGuardCenter(unit) {
    const commander = unit.commander;
    return commander && commander.alive !== false && commander.hp > 0 ? commander : unit.anchor;
}

function romanTargetIsValid(unit, target) {
    if (!target || target.romanSummon === 'banner' || target.alive === false || target.hp <= 0 || target.team === unit.team || isBurovoyBurrowActive(target)) return false;
    const guard = romanGuardCenter(unit);
    const ax = guard.x + guard.w / 2, ay = guard.y + guard.h / 2;
    if (Math.hypot(target.x + target.w / 2 - ax, target.y + target.h / 2 - ay) > 260) return false;
    return typeof GameTerrain === 'undefined' || GameTerrain.canSee(unit, target, objects);
}

function moveRomanLegionary(unit, angle, speed, context) {
    const x = unit.x, y = unit.y;
    const side = unit.slot === 2 ? -1 : 1;
    for (const offset of [0, 0.55 * side, 1.1 * side, 1.65 * side, -0.55 * side, -1.1 * side, -1.65 * side]) {
        const nx = x + Math.cos(angle + offset) * speed, ny = y + Math.sin(angle + offset) * speed;
        if (!canPlaceRomanUnit(unit, nx, ny, context)) continue;
        unit.x = nx; unit.y = ny;
        unit.walkPhase += Math.hypot(nx - x, ny - y) * 0.18;
        return true;
    }
    return false;
}

function romanMeleeStrike(unit, target, context) {
    if (!romanTargetIsValid(unit, target)) return false;
    const cx = unit.x + unit.w / 2, cy = unit.y + unit.h / 2;
    const tx = target.x + target.w / 2, ty = target.y + target.h / 2;
    const mountedSpear = unit.isCenturion && unit.attackType === 'cavalrySpear';
    const reach = Math.max(unit.w, unit.h) / 2 + Math.max(target.w, target.h) / 2 + (unit.isCenturion ? (mountedSpear ? 28 : 26) : 15);
    if (Math.hypot(tx - cx, ty - cy) > reach || !romanClearLine(cx, cy, tx, ty, false, context.terrain)) return false;
    if (unit.isCenturion) {
        const direction = mountedSpear ? unit.cavalryHeading : unit.turretAngle;
        const offset = Math.atan2(ty - cy, tx - cx) - direction;
        if (Math.cos(offset) < (mountedSpear ? 0.8 : 0.25)) return false;
    }
    const isDrone = playerDrones.includes(target) || enemyDrones.includes(target);
    const baseDamage = unit.isCenturion ? (mountedSpear ? 60 : 42) : 28;
    const damage = unit.owner === 'player' ? applyPlayerDamage(baseDamage) : baseDamage;
    const dealt = isDrone ? damageCombatDrone(target, damage) : dealDamageToEntity(target, damage);
    if (dealt <= 0) return false;
    target.hitFlashTime = Date.now();
    if (window.effectsEnabled !== false && particles.length < 180) {
        for (let i = 0; i < 3; i++) spawnParticle(tx + (Math.random() - 0.5) * 8, ty + (Math.random() - 0.5) * 8, '#d4b679', 0.6);
    }
    if (!isDrone && target.hp <= 0 && target.alive !== false) {
        target.alive = false;
        spawnExplosion(tx, ty, target === tank ? 70 : 55);
        if (currentMode === 'war') target.respawnTimer = 600;
        else if (target === tank) { gameState = 'lose'; loseModeTrophies(); syncResultOverlay('lose'); }
        else for (const group of [allies, enemies]) {
            const index = group.indexOf(target); if (index >= 0) group.splice(index, 1);
        }
    }
    return true;
}

function updateRomanLegionary(unit, context) {
    if (unit.fireCooldown > 0) unit.fireCooldown--;
    if (unit.shieldHit > 0) unit.shieldHit--;
    if (unit.attackAnim > 0) unit.attackAnim--;
    if (unit.iceSlowedTime > 0) { unit.iceSlowedTime--; unit.iceSlowed = unit.iceSlowedTime > 0; }
    if (typeof syncBurovoyState === 'function') syncBurovoyState(unit);
    if (unit.paralyzedTime > 0) { unit.paralyzedTime--; unit.paralyzed = unit.paralyzedTime > 0; }
    if (unit.burnTimer > 0) {
        unit.burnTimer--; damageCombatDrone(unit, (unit.burnDps || 10) / 60);
        if (!unit.alive) return;
    }
    if (unit.frozenEffect > 0) {
        unit.frozenEffect--;
        if (unit.frozenEffect > 0) { unit.bracing = false; unit.walking = false; unit.meleeWindup = 0; unit.meleeTarget = null; return; }
    }
    if (unit.paralyzed) { unit.meleeWindup = 0; unit.meleeTarget = null; }
    else if (unit.meleeWindup > 0 && --unit.meleeWindup === 0) {
        romanMeleeStrike(unit, unit.meleeTarget, context);
        unit.meleeTarget = null;
    }
    const guard = romanGuardCenter(unit);
    const guardX = guard.x + guard.w / 2, guardY = guard.y + guard.h / 2;
    const cx = unit.x + unit.w / 2, cy = unit.y + unit.h / 2;
    const guardDistance = Math.hypot(cx - guardX, cy - guardY);
    // Return to the commander before pursuing another target outside the escort perimeter.
    unit.returningToGuard = guardDistance > (unit.returningToGuard ? 105 : 190);
    if (unit.returningToGuard) { unit.target = null; unit.meleeWindup = 0; unit.meleeTarget = null; }
    unit.scanTimer--;
    if (!unit.returningToGuard && (unit.scanTimer <= 0 || !romanTargetIsValid(unit, unit.target))) {
        unit.scanTimer = 12 + unit.slot;
        unit.target = null;
        let distance = Infinity;
        for (const target of context.units) {
            if (!romanTargetIsValid(unit, target)) continue;
            const d = Math.hypot(target.x + target.w / 2 - (unit.x + unit.w / 2), target.y + target.h / 2 - (unit.y + unit.h / 2));
            if (d < distance) { distance = d; unit.target = target; }
        }
    }
    const target = unit.target;
    unit.bracing = false;
    const formationSize = unit.anchor.totalSoldiers || 3;
    const formationAngle = unit.anchor.turretAngle + Math.PI / 2 + unit.slot * Math.PI * 2 / formationSize;
    const guardRadius = formationSize > 3 ? (unit.isCenturion ? 92 : 80) : 68;
    let gx = guardX + Math.cos(formationAngle) * guardRadius;
    let gy = guardY + Math.sin(formationAngle) * guardRadius;
    if (target) {
        const tx = target.x + target.w / 2, ty = target.y + target.h / 2;
        const angle = Math.atan2(ty - cy, tx - cx), dist = Math.hypot(tx - cx, ty - cy);
        const mountedAdvance = unit.isCenturion && unit.attackType === 'cavalrySpear' && unit.meleeWindup > 0;
        let turn = (mountedAdvance ? unit.cavalryHeading : angle) - unit.turretAngle;
        while (turn > Math.PI) turn -= Math.PI * 2;
        while (turn < -Math.PI) turn += Math.PI * 2;
        unit.turretAngle += Math.max(-0.13, Math.min(0.13, turn));
        const desired = unit.isCenturion ? 46 : (unit.slot === 1 ? 105 : 32);
        const flank = unit.isCenturion ? 22 : (unit.slot % 3 - 1) * 20;
        if (Math.hypot(tx - guardX, ty - guardY) < (unit.isCenturion ? 210 : 170)) {
            gx = tx - Math.cos(angle) * desired - Math.sin(angle) * flank;
            gy = ty - Math.sin(angle) * desired + Math.cos(angle) * flank;
        }
        const inSight = romanClearLine(cx, cy, tx, ty, true, context.terrain);
        unit.bracing = dist < 165 && inSight && !unit.paralyzed;
        const reach = Math.max(unit.w, unit.h) / 2 + Math.max(target.w, target.h) / 2 + (unit.isCenturion ? 26 : 15);
        if (!unit.paralyzed && unit.fireCooldown <= 0 && Math.abs(turn) < 0.3 && inSight) {
            if (unit.isCenturion) {
                // A mounted spear pass needs room to approach; the spatha covers close combat.
                if (dist <= 140 && romanClearLine(cx, cy, tx, ty, false, context.terrain)) {
                    const sword = dist <= reach;
                    unit.attackType = sword ? 'cavalrySword' : 'cavalrySpear';
                    unit.attackAnim = sword ? 22 : 30; unit.meleeWindup = sword ? 10 : 16;
                    unit.meleeTarget = target; unit.cavalryHeading = angle;
                    unit.fireCooldown = sword ? 54 : 85;
                }
            } else if (dist <= reach && romanClearLine(cx, cy, tx, ty, false, context.terrain)) {
                unit.attackType = 'melee'; unit.attackAnim = 18; unit.meleeWindup = 8;
                unit.meleeTarget = target; unit.fireCooldown = 48;
            } else if (dist <= 230) {
                bullets.push({ x: cx + Math.cos(angle) * 18, y: cy + Math.sin(angle) * 18,
                    vx: Math.cos(angle) * 5.5, vy: Math.sin(angle) * 5.5, w: 8, h: 3,
                    type: 'romanPilum', damage: 24, team: unit.team, owner: unit.owner, life: 50 });
                unit.attackType = 'throw'; unit.fireCooldown = 60; unit.attackAnim = 14;
            }
        }
    }
    const distance = Math.hypot(gx - cx, gy - cy);
    const escortSpeed = Math.max(2.1, (guard.speed || 3.2) * (guardDistance > 110 ? 1.18 : 0.9));
    const mountedAdvance = unit.isCenturion && unit.attackType === 'cavalrySpear' && unit.meleeWindup > 0 && !unit.paralyzed;
    const speed = escortSpeed * (unit.isCenturion ? 1.25 : 1) * (mountedAdvance ? 1.45 : 1) * (typeof GameTerrain === 'undefined' ? 1 : GameTerrain.speedFactor()) * (unit.iceSlowed ? 0.5 : 1);
    const spearGap = target ? Math.hypot(target.x + target.w / 2 - cx, target.y + target.h / 2 - cy) : Infinity;
    const spearStop = target ? Math.max(unit.w, unit.h) / 2 + Math.max(target.w, target.h) / 2 + 20 : 0;
    unit.walking = mountedAdvance
        ? spearGap > spearStop && moveRomanLegionary(unit, unit.cavalryHeading, Math.min(speed, spearGap - spearStop), context)
        : !(unit.meleeWindup > 0) && distance > (target ? (!unit.isCenturion && unit.slot === 1 ? 15 : 4) : 8) && moveRomanLegionary(unit, Math.atan2(gy - cy, gx - cx), Math.min(speed, distance), context);
    if (!target) {
        const facing = unit.walking ? Math.atan2(gy - cy, gx - cx) : formationAngle;
        const turn = Math.atan2(Math.sin(facing - unit.turretAngle), Math.cos(facing - unit.turretAngle));
        unit.turretAngle += Math.max(-0.13, Math.min(0.13, turn));
    }
}

function updateRomanLegion() {
    for (const source of [tank, ...allies, ...enemies]) if (source && source.romanLegionCooldown > 0) source.romanLegionCooldown--;
    const summons = [...playerDrones, ...enemyDrones].filter(unit => unit.romanSummon && unit.alive);
    if (!summons.length) return;
    const context = romanPlacementContext();
    for (const unit of summons) {
        if (!unit.alive) continue;
        if (unit.hp <= 0) { retireRomanUnit(unit); continue; }
        unit.age++; unit.life--;
        if (unit.life <= 0) { retireRomanUnit(unit, true); continue; }
        if (unit.romanSummon === 'banner') {
            if (unit.pending > 0) unit.pending--;
            if (unit.pending <= 0 && unit.summonedCount < (unit.totalSoldiers || 3) && unit.spawnWait > 0) {
                if (unit.spawnWait % 15 === 0) spawnRomanLegionaries(unit, context);
                unit.spawnWait--;
            }
        } else updateRomanLegionary(unit, context);
    }
}



function activateToxicWave(unit, owner = 'player') {
    if (!unit || getEntityTankType(unit) !== 'toxic' || unit.alive === false || unit.hp <= 0 || unit.megaGasUsed
        || unit.paralyzed || (unit.frozenEffect || 0) > 0 || unit.isUltimateActive || unit.isAutopilotActive) return false;
    const heading = unit.turretAngle || 0;
    const cx = unit.x + unit.w / 2, cy = unit.y + unit.h / 2;
    const team = unit.team ?? (owner === 'enemy' ? 1 : 0);
    for (let i = -2; i <= 2; i++) {
        const angle = heading + i * 0.275;
        const flightTicks = 38 - Math.abs(i) * 4;
        bullets.push({ x: cx + Math.cos(angle) * 24, y: cy + Math.sin(angle) * 24,
            w: 10, h: 10, vx: Math.cos(angle) * 5.6, vy: Math.sin(angle) * 5.6,
            life: flightTicks, maxLife: flightTicks, owner, team, type: 'toxic', toxicWave: true,
            spawned: 0, explodeTimer: flightTicks });
    }
    unit.megaGasUsed = true;
    return true;
}

function updatePoisonCloud(cloud) {
    cloud.life--;
    if (cloud.toxicWave) {
        const age = cloud.maxLife - cloud.life;
        const growth = Math.min(1, age / 22);
        const dispersal = Math.min(1, cloud.life / 90);
        cloud.radius = (28 + (cloud.maxRadius - 28) * growth) * Math.max(0, dispersal);
    }
    return cloud.life > 0;
}

// Spawn gas cloud at (x,y). If mega=true, larger radius and longer duration.
function explodeGas(bullet, mega = false) {
    // Wave nodes unfold directly into mist instead of flashing five explosions at once.
    if (!bullet.toxicWave) objects.push({ type: 'explosion', x: bullet.x, y: bullet.y, radius: mega ? 80 : 40, life: 30, color: '#66FF66' });
    const durationTicks = bullet.toxicWave ? 420 : (mega ? 10 : 5) * 60;
    const radius = bullet.toxicWave ? 28 : mega ? 180 : 90;
    objects.push({ type: 'gas', x: bullet.x, y: bullet.y, radius, life: durationTicks, maxLife: durationTicks,
        maxRadius: bullet.toxicWave ? 105 : radius, toxicWave: !!bullet.toxicWave,
        color: 'rgba(100,220,100,0.25)', owner: bullet.owner, ownerTeam: bullet.team, isMega: mega });
    // Damage destructible cover when the gas cloud forms.
    for (const obj of [...objects]) {
        if (!objects.includes(obj)) continue;
        if (obj.type === 'box' || obj.type === 'barrel' || obj.type === 'woodenWall') {
            const nearestX = Math.max(obj.x, Math.min(bullet.x, obj.x + obj.w));
            const nearestY = Math.max(obj.y, Math.min(bullet.y, obj.y + obj.h));
            const dist = Math.hypot(nearestX - bullet.x, nearestY - bullet.y);
            if (dist <= radius) {
                if (obj.type === 'woodenWall') poisonWoodenWall(obj, nearestX, nearestY);
                else if (obj.type === 'barrel') { if (!(obj.barrelFuseTicks > 0)) explodeBarrel(obj); }
                else { objects.splice(objects.indexOf(obj), 1); navNeedsRebuild = true; }
            }
        }
    }
}

function igniteWoodenWall(obj, duration = 300, damagePerSecond = 20, hitX = null, hitY = null) {
    if (!obj || obj.type !== 'woodenWall' || obj.hp <= 0) return;
    const rain = typeof GameTerrain !== 'undefined' && typeof GameTerrain.current === 'function' && GameTerrain.current() === 'rain';
    const burnDuration = Math.max(1, Math.round(duration * (rain ? 0.8 : 1)));
    if (!obj.burning) obj.woodBurnAge = 0;
    if (!obj.woodBurnOrigin) {
        obj.woodBurnOrigin = {
            x: Math.max(0, Math.min(1, ((hitX ?? obj.x + obj.w / 2) - obj.x) / obj.w)),
            y: Math.max(0, Math.min(1, ((hitY ?? obj.y + obj.h / 2) - obj.y) / obj.h))
        };
    }
    obj.woodSnowMelted = true;
    obj.burning = true;
    obj.burnTimer = Math.max(obj.burnTimer || 0, burnDuration);
    obj.burnDps = damagePerSecond;
    obj.woodCharAmount = Math.max(obj.woodCharAmount || 0, 0.04);
}

function updateWoodenWallBurn(obj) {
    if (!obj || obj.type !== 'woodenWall' || !obj.burning) return;
    if ((obj.burnTimer || 0) <= 0) { obj.burning = false; obj.burnTimer = 0; return; }
    obj.burnTimer--;
    obj.woodBurnAge = (obj.woodBurnAge || 0) + 1;
    obj.woodCharAmount = Math.min(0.9, (obj.woodCharAmount || 0) + 1 / 450);
    obj.woodBurnSpread = Math.max(obj.woodBurnSpread || 0, Math.min(1, 0.12 + obj.woodBurnAge / 120));
    obj.hp = (obj.hp ?? 300) - (obj.burnDps || 20) / 60;
    if (obj.burnTimer <= 0) { obj.burning = false; obj.burnTimer = 0; }
}

function spawnTerrainDebris(obj, options = {}) {
    if (window.effectsEnabled === false) return;
    const wood = obj.type === 'woodenWall';
    const effect = options.materialEffect || 'wood';
    const destroyed = !!options.destroyed;
    const power = wood ? (destroyed ? Math.min(1.65, Math.sqrt(Math.max(1, options.impactVisualMultiplier || 1)))
        : Math.min(1.6, Math.sqrt(Math.max(0.005, (options.impactDamage ?? 100) / 100)))) : 1;
    const count = destroyed ? Math.min(16, 8 + Math.ceil(Math.max(obj.w, obj.h) / 20)) : wood ? Math.max(1, Math.min(6, Math.round(power * 4))) : 3;
    const hitX = Math.max(obj.x, Math.min(obj.x + obj.w, options.hitX ?? obj.x + obj.w / 2));
    const hitY = Math.max(obj.y, Math.min(obj.y + obj.h, options.hitY ?? obj.y + obj.h / 2));
    const direction = Math.atan2(options.vy || 0, options.vx || 0);
    const directed = !!(options.vx || options.vy);
    const fragments = [];
    for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const reach = ((destroyed ? 15 : 5) + Math.random() * (destroyed ? 30 : 12)) * power;
        const boardChunk = wood && effect === 'wood' && destroyed && i < 3;
        const size = boardChunk ? Math.min(34, Math.max(obj.w, obj.h) * 0.3) * (0.8 + Math.random() * 0.3) * power
            : wood ? (3 + Math.random() * Math.min(18, Math.max(obj.w, obj.h) * 0.22)) * power : 4 + Math.random() * 9;
        fragments.push({
            x: (destroyed ? obj.x + Math.random() * obj.w : hitX) - (obj.x + obj.w / 2),
            y: (destroyed ? obj.y + Math.random() * obj.h : hitY) - (obj.y + obj.h / 2),
            dx: Math.cos(angle) * reach + (directed ? Math.cos(direction) * 14 * power : 0),
            dy: Math.sin(angle) * reach + (directed ? Math.sin(direction) * 14 * power : 0),
            lift: (4 + Math.random() * (destroyed ? 17 : 7)) * power, angle: Math.random() * Math.PI * 2,
            spin: (Math.random() - 0.5) * 5, size,
            thickness: boardChunk ? Math.max(4, Math.min(9, Math.min(obj.w, obj.h) * 0.18)) * (0.75 + Math.random() * 0.35)
                : wood ? (1.5 + Math.random() * 2) * Math.min(1.3, power) : size * 0.65
        });
    }
    const duration = effect === 'ice' ? (destroyed ? 64 : 40) : destroyed ? 44 : 20;
    objects.push({ type: 'terrainDebris', x: obj.x + obj.w / 2, y: obj.y + obj.h / 2,
        radius: Math.hypot(obj.w, obj.h) / 2 + 60, life: duration, maxLife: duration,
        material: wood ? effect : 'stone', charred: !!obj.burning || (obj.woodCharAmount || 0) > 0.3,
        biome: typeof GameTerrain !== 'undefined' && typeof GameTerrain.current === 'function' ? GameTerrain.current() : 'forest',
        dustX: (destroyed ? obj.x + obj.w / 2 : hitX) - (obj.x + obj.w / 2),
        dustY: (destroyed ? obj.y + obj.h / 2 : hitY) - (obj.y + obj.h / 2),
        dustSize: destroyed ? Math.min(90, Math.max(obj.w, obj.h) * 0.7) * power : 18 * power, fragments });
}

function destroyWoodenWall(obj, options = {}) {
    if (!obj || obj.type !== 'woodenWall') return false;
    const index = objects.indexOf(obj);
    if (index === -1) return false;
    const sourceHp = options.sourceHp ?? Math.max(1, obj.hp || 1);
    obj.hp = 0;
    obj.embeddedProjectiles = [];
    objects.splice(index, 1);
    navNeedsRebuild = true;
    if (options.materialEffect === 'rot') {
        if (window.effectsEnabled !== false) objects.push({ type: 'woodDecay', x: obj.x, y: obj.y, w: obj.w, h: obj.h,
            wall: obj, sourceHp, life: 64, maxLife: 64 });
    } else if (options.materialEffect !== 'ice') spawnTerrainDebris(obj, { ...options, destroyed: true });
    return true;
}

function historicalProjectileTip(bullet) {
    if (bullet.type === 'spartanSpear') return 22;
    if (bullet.type === 'egyptArrow' || bullet.type === 'romanPilum') return Math.max(9, (bullet.w || 10) * 1.55) * 0.93;
    return (bullet.w || 14) * 0.95;
}

function projectileSurfaceEntry(target, bullet) {
    const angle = Math.atan2(bullet.vy || 0, bullet.vx || 0);
    const dx = Math.cos(angle), dy = Math.sin(angle);
    const cx = target.x + target.w / 2, cy = target.y + target.h / 2;
    // Find the first surface along the incoming ray, including chipped wooden outlines.
    let points = [{ x: 0, y: 0 }, { x: target.w, y: 0 }, { x: target.w, y: target.h }, { x: 0, y: target.h }];
    if (target.type === 'woodenWall' && typeof getWallBreakShape === 'function') {
        const shape = getWallBreakShape(target, true);
        if (shape) points = shape.points;
    }
    let nearest = Infinity, entry = null;
    const back = Math.hypot(target.w, target.h) + 100;
    const ox = bullet.x - dx * back - target.x, oy = bullet.y - dy * back - target.y;
    for (let i = 0; i < points.length; i++) {
        const a = points[i], b = points[(i + 1) % points.length];
        const ex = b.x - a.x, ey = b.y - a.y;
        const cross = dx * ey - dy * ex;
        if (Math.abs(cross) < 1e-8) continue;
        const ax = a.x - ox, ay = a.y - oy;
        const distance = (ax * ey - ay * ex) / cross;
        const along = (ax * dy - ay * dx) / cross;
        if (distance >= 0 && along >= 0 && along <= 1 && distance < nearest) {
            nearest = distance;
            entry = { x: target.x + ox + dx * distance - cx, y: target.y + oy + dy * distance - cy };
        }
    }
    if (!entry) {
        // Glancing AABB hits still attach to the facing edge rather than floating above it.
        const x = Math.max(target.x, Math.min(target.x + target.w, bullet.x));
        const y = Math.max(target.y, Math.min(target.y + target.h, bullet.y));
        entry = Math.abs(dx) >= Math.abs(dy)
            ? { x: (dx > 0 ? target.x : target.x + target.w) - cx, y: y - cy }
            : { x: x - cx, y: (dy > 0 ? target.y : target.y + target.h) - cy };
    }
    return { ...entry, angle };
}

function addEmbeddedProjectile(target, bullet) {
    if (!['romanBlade', 'spartanSpear', 'egyptArrow', 'romanPilum'].includes(bullet.type)) return false;
    const hitTargets = bullet.embeddedTargets || (bullet.embeddedTargets = new WeakSet());
    if (hitTargets.has(target)) return false;
    hitTargets.add(target);
    const entry = projectileSurfaceEntry(target, bullet);
    const permanent = target.type === 'woodenWall';
    const marks = (target.embeddedProjectiles || []).filter(mark => mark.permanent || mark.life > 0);
    marks.push({ ...entry, type: bullet.type, w: bullet.w, h: bullet.h,
        tip: historicalProjectileTip(bullet), permanent, bodyAngle: target.type === 'woodenWall' ? 0 : (typeof GameTerrain !== 'undefined' && GameTerrain.getMotion ? GameTerrain.getMotion(target).angle || 0 : 0), life: 60, maxLife: 60, age: 0 });
    target.embeddedProjectiles = permanent ? marks : marks.slice(-8);
    return true;
}

function updateEmbeddedProjectiles(target) {
    if (!target || !target.embeddedProjectiles) return;
    for (const mark of target.embeddedProjectiles) { if (!mark.permanent) mark.life--; mark.age = Math.min(60, mark.age + 1); }
    target.embeddedProjectiles = target.embeddedProjectiles.filter(mark => mark.permanent || mark.life > 0);
}

function poisonWoodenWall(wall, hitX, hitY) {
    if (!wall || wall.hp <= 0) return;
    wall.woodPoisonTimer = 180;
    const sites = wall.woodRotSites || (wall.woodRotSites = []);
    const x = Math.max(0, Math.min(1, (hitX - wall.x) / wall.w));
    const y = Math.max(0, Math.min(1, (hitY - wall.y) / wall.h));
    if (sites.length < 4 && !sites.some(site => Math.hypot(site.x - x, site.y - y) < 0.2)) sites.push({ x, y });
}

function poisonWoodInGas(gas, index = null) {
    const nearby = index ? queryTerrainCollisionIndex(index, { x: gas.x - gas.radius, y: gas.y - gas.radius, w: gas.radius * 2, h: gas.radius * 2 }) : objects;
    for (const wall of nearby) {
        if (wall.type !== 'woodenWall') continue;
        const x = Math.max(wall.x, Math.min(gas.x, wall.x + wall.w));
        const y = Math.max(wall.y, Math.min(gas.y, wall.y + wall.h));
        if (Math.hypot(x - gas.x, y - gas.y) <= gas.radius) poisonWoodenWall(wall, x, y);
    }
}

function updateWoodenWallRot(wall) {
    if (!wall || wall.type !== 'woodenWall' || !(wall.woodPoisonTimer > 0) || wall.hp <= 0) return;
    wall.woodPoisonTimer--;
    wall.woodRotAge = (wall.woodRotAge || 0) + 1;
    damageWoodenWall(wall, 44 / 60, { exactDamage: true, materialEffect: 'rot', continuous: true });
}

function createWoodIceImpact(wall, options, mark) {
    if (window.effectsEnabled === false) return;
    const impacts = objects.filter(obj => obj.type === 'woodIceImpact' && obj.wall === wall);
    if (impacts.length >= 4) {
        const oldest = impacts[0];
        revealWoodIceImpact(oldest);
        objects.splice(objects.indexOf(oldest), 1);
    }
    const impact = { type: 'woodIceImpact', wall, mark, sourceHp: options.sourceHp ?? 1, strength: options.strength, addStrength: !!options.addStrength, destroyedWall: wall.hp <= 0, x: wall.x, y: wall.y, w: wall.w, h: wall.h,
        hitX: Math.max(0, Math.min(wall.w, (options.hitX ?? wall.x + wall.w / 2) - wall.x)),
        hitY: Math.max(0, Math.min(wall.h, (options.hitY ?? wall.y + wall.h / 2) - wall.y)),
        vx: options.vx || 0, vy: options.vy || 0, damage: Math.max(0, Math.min(1, 1 - wall.hp / (wall.maxHp || 300))), age: 0, life: 58, maxLife: 58 };
    objects.push(impact);
}

function updateWoodIceImpact(impact) {
    impact.age++; impact.life--;
    if (impact.age === 26) revealWoodIceImpact(impact);
    return impact.life > 0;
}

function revealWoodIceImpact(impact) {
    if (!impact.mark || impact.revealed) return;
    impact.revealed = true;
    impact.mark.active = true;
    if (impact.strength != null) impact.mark.impactStrength = Math.min(1, impact.addStrength ? (impact.mark.impactStrength || 0) + impact.strength : Math.max(impact.mark.impactStrength || 0, impact.strength));
    impact.mark.damage = Math.max(impact.mark.damage || 0, impact.damage || 0);
    impact.wall.woodDamageVersion = (impact.wall.woodDamageVersion || 0) + 1;
}

function damageWoodenWall(obj, damage, options = {}) {
    if (!obj || obj.type !== 'woodenWall') return false;
    const finalDamage = options.exactDamage ? Math.max(0, damage || 0) : Math.max(1, Math.round(damage || 0));
    if (finalDamage <= 0) return true;
    const visualImpact = finalDamage * Math.max(1, options.impactVisualMultiplier || 1);
    const sourceHp = obj.hp ?? 300;
    obj.hp = sourceHp - finalDamage;
    if (options.ignite) igniteWoodenWall(obj, options.burnTimer || 300, options.burnDps || 20, options.hitX, options.hitY);
    const effect = options.materialEffect || 'wood';
    if (effect === 'rot') obj.woodRotAmount = Math.min(1, (obj.woodRotAmount || 0) + finalDamage / (obj.maxHp || 300));
    if (obj.hp <= 0) {
        if (effect === 'ice') createWoodIceImpact(obj, { ...options, sourceHp }, null);
        destroyWoodenWall(obj, { ...options, sourceHp });
        return true;
    }
    // Chemical decay erodes the grain; it never creates impact dents or splinters.
    if (effect === 'rot') return true;
    const point = {
        x: Math.max(0, Math.min(1, ((options.hitX ?? obj.x + obj.w / 2) - obj.x) / obj.w)),
        y: Math.max(0, Math.min(1, ((options.hitY ?? obj.y + obj.h / 2) - obj.y) / obj.h)),
        damage: Math.max(0, Math.min(1, 1 - obj.hp / (obj.maxHp || 300))), impactStrength: Math.min(1, visualImpact / (obj.maxHp || 300)), effect,
        active: effect !== 'ice' || window.effectsEnabled === false
    };
    const marks = obj.woodHitPoints || (obj.woodHitPoints = []);
    const previous = marks.find(mark => Math.hypot(mark.x - point.x, mark.y - point.y) < 0.08);
    if (previous) {
        if (effect !== 'ice' || window.effectsEnabled === false) {
            previous.damage = Math.max(previous.damage || 0, point.damage);
            previous.impactStrength = Math.min(1, (previous.impactStrength ?? previous.damage ?? 0) + point.impactStrength);
        }
    } else if (marks.length < 64) marks.push(point);
    obj.woodDamageVersion = (obj.woodDamageVersion || 0) + 1;
    if (effect === 'ice') createWoodIceImpact(obj, { ...options, strength: point.impactStrength, addStrength: !!previous }, previous || point);
    else {
        const frame = window.frameCount || 0;
        if (frame - (obj._lastWoodChipFrame ?? -100) >= 6 || visualImpact >= Math.max(25, (obj._lastWoodChipDamage || 0) * 2)) {
            spawnTerrainDebris(obj, { ...options, impactDamage: visualImpact });
            obj._lastWoodChipFrame = frame;
            obj._lastWoodChipDamage = visualImpact;
        }
    }
    return true;
}

function damageTerrainInRadius(x, y, radius, damage, options = {}) {
    // A stable snapshot is necessary because a barrel chain can remove many objects at once.
    const cover = objects.filter(obj => obj.type === 'woodenWall' || obj.type === 'box' || obj.type === 'barrel');
    for (const obj of cover) {
        if (!objects.includes(obj)) continue;
        const nearestX = Math.max(obj.x, Math.min(x, obj.x + obj.w));
        const nearestY = Math.max(obj.y, Math.min(y, obj.y + obj.h));
        const distance = Math.hypot(nearestX - x, nearestY - y);
        if (distance > radius) continue;
        if (obj.type === 'woodenWall') {
            damageWoodenWall(obj, Math.max(1, Math.round((1 - distance / radius) * damage)), { ...options, hitX: x, hitY: y });
        } else if (obj.type === 'barrel') {
            if (!(obj.barrelFuseTicks > 0)) explodeBarrel(obj);
        } else {
            objects.splice(objects.indexOf(obj), 1); navNeedsRebuild = true;
            for (let particle = 0; particle < 5; particle++) spawnParticle(obj.x + obj.w / 2, obj.y + obj.h / 2);
        }
    }
}

function hitWallWithShieldProjectile(obj, bullet) {
    const impact = { hitX: bullet.x, hitY: bullet.y, vx: bullet.vx, vy: bullet.vy };
    if (obj.type === 'woodenWall') {
        destroyWoodenWall(obj, impact);
        return;
    }
    obj.wallDamageCount = Math.min(6, (obj.wallDamageCount || 0) + 1);
    (obj.wallHitPoints || (obj.wallHitPoints = [])).push({
        x: Math.max(0, Math.min(1, (bullet.x - obj.x) / obj.w)),
        y: Math.max(0, Math.min(1, (bullet.y - obj.y) / obj.h))
    });
    if (obj.wallDamageCount >= 6) {
        const index = objects.indexOf(obj);
        if (index !== -1) objects.splice(index, 1);
        navNeedsRebuild = true;
        spawnTerrainDebris(obj, { ...impact, destroyed: true });
    } else {
        spawnTerrainDebris(obj, impact);
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
    damageDronesInRadius(x, y, R, coef, attackerTeam);
    // Уничтожение ящиков, бочек и урон деревянным стенам в зоне взрыва
    damageTerrainInRadius(x, y, R, coef);
}

function createKamikazeProjectile(unit, owner) {
    const angle = unit.turretAngle || 0;
    return {
        x: unit.x + unit.w / 2 + Math.cos(angle) * 25,
        y: unit.y + unit.h / 2 + Math.sin(angle) * 25,
        w: 10, h: 10, vx: Math.cos(angle) * 6, vy: Math.sin(angle) * 6,
        life: 65, owner, team: unit.team, type: 'kamikazeBullet', damage: 100
    };
}

function explodeKamikazeProjectile(bullet, directTarget = null) {
    if (bullet.detonated) return;
    bullet.detonated = true;
    const x = directTarget ? directTarget.x + directTarget.w / 2 : bullet.x;
    const y = directTarget ? directTarget.y + directTarget.h / 2 : bullet.y;
    const baseDamage = bullet.damage ?? 100;
    const damage = bullet.owner === 'player' ? applyPlayerDamage(baseDamage) : baseDamage;
    spawnExplosion(x, y, 30, 'impact');
    applyDamage(x, y, 55, damage, bullet.team);
}

function resolveKamikazeProjectile(bullet, rect, terrainCandidates) {
    const cover = terrainCandidates.find(obj => isBlockingTerrainObject(obj) && checkRectCollision(rect, obj) && objects.includes(obj));
    if (cover) {
        explodeKamikazeProjectile(bullet);
        if (cover.type === 'barrel') explodeBarrel(cover);
        return 'hit';
    }
    for (const group of [[tank], allies, enemies, playerDrones, enemyDrones]) {
        for (const target of group) {
            if (!target || target.romanSummon === 'banner' || target.alive === false || target.hp <= 0 || target.team === bullet.team || !checkRectCollision(rect, target)) continue;
            if (getEntityTankType(target) === 'mirror') {
                if (target.mirrorShieldActive) {
                    bullet.vx *= -1.5;
                    bullet.vy *= -1.5;
                    bullet.team = target.team;
                    bullet.owner = target === tank ? 'player' : allies.includes(target) ? 'ally' : 'enemy';
                    bullet.life += 60;
                    bullet.x += bullet.vx * 2;
                    bullet.y += bullet.vy * 2;
                    return 'reflected';
                }
                rememberMirrorProjectile(target, bullet);
            }
            if (target.romanShieldActive) {
                spawnParticle(bullet.x, bullet.y, '#FFD700');
                return 'hit';
            }
            explodeKamikazeProjectile(bullet, target);
            return 'hit';
        }
    }
    return null;
}

function startKamikazeDash(unit) {
    if (!unit || unit.alive === false || unit.paralyzed || unit.kamikazeUltActive ||
        (unit.kamikazeUltCooldown || 0) > 0 || (unit.kamikazeRecoveryTimer || 0) > 0 || (unit.sandNoShootTimer || 0) > 0) return false;
    unit.kamikazeUltActive = true;
    unit.kamikazeDashAngle = unit.turretAngle || 0;
    unit.kamikazeDashStartAngle = unit.kamikazeDashAngle;
    unit.kamikazeDashTimer = 90;
    unit.kamikazeUltCooldown = 600;
    unit.kamikazeInvincible = true;
    unit.kamikazeInvincibleTimer = 0;
    unit._kamikazeTrailThisTick = true;
    return true;
}

function finishKamikazeDash(unit, detonate = true) {
    if (!unit.kamikazeUltActive) return;
    unit.kamikazeUltActive = false;
    unit.kamikazeInvincible = false;
    unit.kamikazeInvincibleTimer = 0;
    unit.kamikazeDashTimer = 0;
    unit.kamikazeRecoveryTimer = 45;
    if (!detonate) return;
    const angle = unit.kamikazeDashAngle;
    const x = unit.x + unit.w / 2 + Math.cos(angle) * unit.w * 0.5;
    const y = unit.y + unit.h / 2 + Math.sin(angle) * unit.h * 0.5;
    let damage = 260;
    if (unit === tank) {
        damage = applyPlayerDamage(damage * (typeof getPlayerDmgMult === 'function' ? getPlayerDmgMult() : 1));
    }
    spawnExplosion(x, y, 135, 'blast');
    applyDamage(x, y, 135, damage, unit.team);
}

function updateKamikazeDash(unit, steeringAngle = unit.kamikazeDashAngle) {
    if (!unit.kamikazeUltActive) return;
    if (unit.paralyzed) {
        finishKamikazeDash(unit, false);
        return;
    }
    const startAngle = unit.kamikazeDashStartAngle;
    const requestedOffset = Math.atan2(Math.sin(steeringAngle - startAngle), Math.cos(steeringAngle - startAngle));
    const targetAngle = startAngle + Math.max(-Math.PI / 9, Math.min(Math.PI / 9, requestedOffset));
    let difference = targetAngle - unit.kamikazeDashAngle;
    difference = Math.atan2(Math.sin(difference), Math.cos(difference));
    unit.kamikazeDashAngle += Math.max(-0.008, Math.min(0.008, difference));
    unit.baseAngle = unit.kamikazeDashAngle;
    unit.kamikazeDashTimer--;
    const speed = 9 * GameTerrain.speedFactor() * (unit.iceSlowed ? 0.5 : 1);
    const steps = Math.ceil(speed / 3);
    const vx = Math.cos(unit.kamikazeDashAngle) * speed / steps;
    const vy = Math.sin(unit.kamikazeDashAngle) * speed / steps;
    // Small steps prevent tunnelling through narrow targets and map edges.
    for (let step = 0; step < steps; step++) {
        const nextX = unit.x + vx, nextY = unit.y + vy;
        unit.x = Math.max(0, Math.min(worldWidth - unit.w, nextX));
        unit.y = Math.max(0, Math.min(worldHeight - unit.h, nextY));
        for (let index = objects.length - 1; index >= 0; index--) {
            const obj = objects[index];
            if (!isBlockingTerrainObject(obj) || !checkRectCollision(unit, obj)) continue;
            if (obj.type === 'woodenWall') {
                destroyWoodenWall(obj, { vx, vy });
                continue;
            }
            objects.splice(index, 1);
            navNeedsRebuild = true;
            if (obj.type === 'wall') spawnTerrainDebris(obj, { destroyed: true, vx, vy });
            else for (let i = 0; i < 3; i++) spawnParticle(obj.x + obj.w / 2, obj.y + obj.h / 2, '#ae7956');
        }
        for (const group of [[tank], allies, enemies, playerDrones, enemyDrones]) {
            if (group.some(target => target && target !== unit && target.alive !== false && target.hp > 0 &&
                target.team !== unit.team && !isBurovoyBurrowActive(target) && checkRectCollision(unit, target))) {
                finishKamikazeDash(unit);
                return;
            }
        }
        if (unit.x !== nextX || unit.y !== nextY) {
            finishKamikazeDash(unit);
            return;
        }
    }
    if (unit.kamikazeDashTimer <= 0) finishKamikazeDash(unit);
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

// Попытаться сдвинуть entity на расстояние dist в направлении angle малыми шагами.
// Если на пути ящик — предпринять попытку безопасно его толкнуть (только если у ящика есть куда сдвинуться).

function spawnExplosion(cx, cy, radius, style = 'tank') {
    if (window.effectsEnabled === false) return;
    const r = radius || 80;
    if (style !== 'tank') {
        const duration = style === 'barrel' ? 50 : style === 'impact' ? 24 : 36;
        objects.push({ type: 'explosion', explosionStyle: style, x: cx, y: cy, radius: r,
            life: duration, maxLife: duration, seed: Math.random() * Math.PI * 2 });
        return;
    }
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

function rememberMirrorProjectile(unit, projectile) {
    unit.lastHitType = projectile.type;
    unit.lastHitTime = Date.now();
    unit.lastHitProjectileSize = Number.isFinite(projectile.w) && projectile.w > 0 && Number.isFinite(projectile.h) && projectile.h > 0
        ? { type: projectile.type, w: projectile.w, h: projectile.h }
        : null;
}

function restoreMirrorProjectileSize(unit, projectile) {
    const size = unit.lastHitProjectileSize;
    if (size && size.type === projectile.type) {
        projectile.w = size.w;
        projectile.h = size.h;
    }
}

function canPlaceMineAt(x, y, radius) {
    return typeof mines !== 'undefined' && !mines.some(mine =>
        Math.hypot(mine.x - x, mine.y - y) < (mine.radius || 18) + radius);
}

function createBuratinoBarrage(unit, ultimate = false) {
    const angle = unit.turretAngle || 0;
    const originX = unit.x + unit.w / 2;
    const originY = unit.y + unit.h / 2;
    const distance = ultimate ? 300 : 220;
    const radius = ultimate ? 160 : 100;
    const warningTicks = 100;
    const waveInterval = 100;
    const waveCount = ultimate ? 3 : 1;
    const isPlayer = typeof tank !== 'undefined' && unit === tank;
    const multiplier = isPlayer && typeof getPlayerDmgMult === 'function' ? getPlayerDmgMult() : 1;
    const damage = isPlayer ? applyPlayerDamage(300 * multiplier) : 300;
    const barrage = {
        type: 'targetCircle', buratinoBarrage: true, x: originX + Math.cos(angle) * distance,
        y: originY + Math.sin(angle) * distance, radius, team: unit.team, ultimate,
        elapsed: 0, warningTicks, waveInterval, waveCount, wavesFired: 0, damage,
        color: unit.color, impacts: []
    };
    objects.push(barrage);
    for (let wave = 0; wave < waveCount; wave++) {
        const impacts = [{ x: barrage.x, y: barrage.y }];
        const phase = Math.random() * Math.PI * 2;
        for (const ring of [{ count: 4, distance: 0.35 }, { count: 8, distance: 0.72 }]) {
            for (let i = 0; i < ring.count; i++) {
                const a = phase + i * Math.PI * 2 / ring.count;
                impacts.push({ x: barrage.x + Math.cos(a) * radius * ring.distance,
                    y: barrage.y + Math.sin(a) * radius * ring.distance });
            }
        }
        for (let i = 0; i < impacts.length; i++) {
            const target = impacts[i];
            const delay = Math.round(Math.floor(i * 0.7) * (5 / 3));
            const travel = warningTicks + wave * waveInterval - delay;
            const lateral = (i - (impacts.length - 1) / 2) * 1.2;
            const sx = originX - Math.sin(angle) * lateral;
            const sy = originY + Math.cos(angle) * lateral;
            objects.push({ type: 'visualRocket', barrageVisual: true, x: sx, y: sy,
                vx: (target.x - sx) / travel, vy: (target.y - sy) / travel,
                life: travel, delay, w: 6, h: 3, team: unit.team });
        }
        barrage.impacts.push(impacts);
    }
    return barrage;
}

function updateBuratinoBarrage(barrage) {
    barrage.elapsed++;
    if (barrage.flashTicks > 0) barrage.flashTicks--;
    const waveTime = barrage.warningTicks + barrage.wavesFired * barrage.waveInterval;
    if (barrage.wavesFired < barrage.waveCount && barrage.elapsed >= waveTime) {
        barrage.flashTicks = 8;
        const impacts = barrage.impacts[barrage.wavesFired];
        const blastRadius = barrage.ultimate ? 42 : 30;
        for (let i = 0; i < impacts.length; i++) {
            const point = impacts[i];
            if (i % 3 === 0) {
                spawnExplosion(point.x, point.y, blastRadius, 'blast');
            } else if (window.effectsEnabled !== false) {
                // Secondary impacts reuse the new fireball art without additional particles.
                objects.push({ type: 'explosion', explosionStyle: 'blast', x: point.x, y: point.y, radius: blastRadius,
                    life: 28 - (i % 3) * 2, maxLife: 28 });
            }
        }
        applyDamage(barrage.x, barrage.y, barrage.radius, barrage.damage, barrage.team);
        barrage.wavesFired++;
    }
    const endTime = barrage.warningTicks + (barrage.waveCount - 1) * barrage.waveInterval + 15;
    if (barrage.wavesFired === barrage.waveCount && barrage.elapsed >= endTime) {
        const index = objects.indexOf(barrage);
        if (index !== -1) objects.splice(index, 1);
    }
}

function shoot() {
    if (tankType === 'kamikaze' && (tank.kamikazeUltActive || (tank.kamikazeRecoveryTimer || 0) > 0)) return;
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
                damage: 0.75,
                team: 0
            });
        }
        advanceFlamethrowerBurst(tank, 90, 0);
    } else if (tankType === 'buratino') {
        createBuratinoBarrage(tank);
        tank.fireCooldown = getTankShotCooldown('buratino');
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
        // A water burst lasts 1.5 seconds before the tank must reload.
        startWaterjetBurst(tank);
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
            props.damage = 0.75; props.w = 5; props.h = 5; // flame
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
            props.type = 'buckshot'; props.damage = BUCKSHOT_PELLET_DAMAGE; props.w = 6; props.h = 6;
        } else if (pType === 'railgun') {
            props.type = 'railgun'; props.damage = 65; props.w = 6; props.h = 6; props.piercing = true;
        } else if (pType === 'machinegun') {
            props.type = 'machinegun'; props.damage = MACHINEGUN_BULLET_DAMAGE; props.w = 7; props.h = 7;
        } else {
            // Fallback for copied normal/other types
            props.damage = 100; props.w = 6; props.h = 6; 
        }
        
        restoreMirrorProjectileSize(tank, props);
        bullets.push(props);
        tank.fireCooldown = getTankShotCooldown(tankType);
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
            damage: MACHINEGUN_BULLET_DAMAGE
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
                damage: BUCKSHOT_PELLET_DAMAGE
            });
        }
        tank.fireCooldown = getTankShotCooldown(tankType);
    } else if (tankType === 'time') {
        // Time tank: regular shots with high damage
        const speed = 5;
        const life = 100;
        bullets.push({
            x: tank.x + tank.w/2 + Math.cos(tank.turretAngle) * 25,
            y: tank.y + tank.h/2 + Math.sin(tank.turretAngle) * 25,
            w: 14, h: 14,
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
        // Imitator base form: single 100-damage shot
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
            damage: 100
        });
        tank.fireCooldown = 60; // 1 second cooldown
    } else if (tankType === 'electric') {
        // Electric ball: homing projectile that tracks enemies for three seconds
        const speed = 4;
        const life = 180; // 3 seconds
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
            damage: 65,
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
        const mineX = tank.x + tank.w / 2, mineY = tank.y + tank.h / 2;
        if (typeof mines !== 'undefined' && canPlaceMineAt(mineX, mineY, 18)) {
            mines.push({
                x: mineX,
                y: mineY,
                radius: 18,
                team: 0,
                damage: 150
            });
            tank.fireCooldown = 90; // 1.5s between mine placements
        }
    } else if (tankType === 'burovoy') {
        return;
    } else if (tankType === 'spartan') {
        // Spartan spear lodges in the first solid target.
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
        bullets.push(createKamikazeProjectile(tank, 'player'));
        tank.fireCooldown = getTankShotCooldown('kamikaze');
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
    } else if (tankType === 'kvant') {
        // Квант: 1 main bullet that morphs into one of 3 effects after 1.5s
        const ang = tank.turretAngle;
        const spd = 5.5;
        const sx = tank.x + tank.w/2 + Math.cos(ang) * 24;
        const sy = tank.y + tank.h/2 + Math.sin(ang) * 24;
        const _kvantBaseDmg = Math.round(100 * (typeof getPlayerDmgMult === 'function' ? getPlayerDmgMult() : 1));
        bullets.push({ x: sx, y: sy, w: 10, h: 10,
            vx: Math.cos(ang) * spd, vy: Math.sin(ang) * spd,
            life: 220, owner: 'player', team: 0, type: 'kvantMain',
            damage: _kvantBaseDmg, morphTimer: 90 });
        tank.fireCooldown = 60;
    } else if (tankType === 'mechShield') {
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
    } else if (tankType === 'myasnoy') {
        // Continuous bio-spray emits a light stream without burning wood.
        // Base damage is scaled later in main.js so it is not applied twice.
        const _myDmg = 2;
        const _mySpread = 0.70;
        const _myCount = 2;
        for (let _mi = 0; _mi < _myCount; _mi++) {
            const ang = tank.turretAngle + (Math.random() - 0.5) * _mySpread;
            const spd = 4.5 + Math.random() * 1.5;
            bullets.push({
                x: tank.x + tank.w/2 + Math.cos(ang) * 18,
                y: tank.y + tank.h/2 + Math.sin(ang) * 18,
                w: 5, h: 5,
                vx: Math.cos(ang) * spd,
                vy: Math.sin(ang) * spd,
                life: 42,
                owner: 'player', team: 0,
                type: 'myasnoyBio',
                damage: _myDmg,
                veinSeed: Math.random() * Math.PI * 2,
                veinTwist: 0.8 + Math.random() * 0.9
            });
        }
        advanceMyasnoySpray(tank);
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
        tank.fireCooldown = getTankShotCooldown(tankType);
    }
}
// --- APPEND_POINT_UPDATE ---

function updateSpecialProjectiles() {
    if (typeof electricRays !== 'undefined' && electricRays) {
        for (const ray of electricRays) ray.life--;
        electricRays = electricRays.filter(ray => ray.life > 0);
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
                spawnExplosion(proj.x, proj.y, proj.explosionRadius, 'blast');
                if (typeof applyDamage === 'function') {
                    let explosionDamage = proj.damage;
                    if (typeof godMode !== 'undefined' && godMode) explosionDamage = explosionDamage * 1000;
                    applyDamage(proj.x, proj.y, proj.explosionRadius, explosionDamage, proj.team);
                } else {
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
                }
                
                // Spawn particles
                for (let p = 0; p < 15; p++) {
                    spawnParticle(proj.x + (Math.random()-0.5)*50, proj.y + (Math.random()-0.5)*50, '#ff6600', 0.6);
                }
                
                buratinoBarrages.splice(i, 1);
                continue;
            }
            
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
                    if (obj.type === 'woodenWall' && typeof damageWoodenWall === 'function') {
                        damageWoodenWall(obj, proj.damage || 200, { hitColor: '#00ffff', hitParticles: 4, destroyColor: '#00c2c2', hitX: proj.x, hitY: proj.y, vx: proj.vx, vy: proj.vy });
                    } else if (obj.type === 'box') {
                        const index = objects.indexOf(obj);
                        if (index !== -1) objects.splice(index, 1);
                        navNeedsRebuild = true;
                    }
                    spawnParticle(proj.x, proj.y, '#00ffff', 0.5);
                    break;
                }
            }
            
            // Check collisions with player (if enemy wave)
            if (proj.team !== tank.team) {
                const pdx = proj.x - (tank.x + tank.w/2);
                const pdy = proj.y - (tank.y + tank.h/2);
                if (pdx*pdx + pdy*pdy < (proj.radius + tank.w/2)*(proj.radius + tank.w/2)) {
                    if (!isPlayerDamageProtected()) tank.hp -= proj.damage;
                    tank.confused = 30;
                    spawnParticle(proj.x, proj.y, '#00ffff', 0.7);
                    if (tank.hp <= 0) {
                        spawnExplosion(tank.x+tank.w/2, tank.y+tank.h/2, 70);
                        if (currentMode === 'war') { tank.alive = false; tank.respawnTimer = 600; }
                        else { gameState = 'lose'; loseModeTrophies(); syncResultOverlay('lose'); }
                    }
                    const pang = Math.atan2(pdy, pdx);
                    proj.vx = Math.cos(pang) * 5;
                    proj.vy = Math.sin(pang) * 5;
                    proj.bounces++;
                }
            }
            // Check collisions with enemies (skip same-team to avoid friendly fire / self-damage)
            for (let ei = enemies.length - 1; ei >= 0; ei--) {
                const enemy = enemies[ei];
                if (enemy.team === proj.team) continue; // No friendly fire
                const dx = proj.x - (enemy.x + enemy.w/2);
                const dy = proj.y - (enemy.y + enemy.h/2);
                if (dx*dx + dy*dy < (proj.radius + enemy.w/2)*(proj.radius + enemy.w/2)) {
                    dealDamageToEntity(enemy, proj.damage);
                    spawnParticle(proj.x, proj.y, '#00ffff', 0.7);
                    if (enemy.hp <= 0) {
                        spawnExplosion(enemy.x+enemy.w/2, enemy.y+enemy.h/2, 65);
                        enemies.splice(ei, 1);
                    }
                    const ang = Math.atan2(dy, dx);
                    proj.vx = Math.cos(ang) * 5;
                    proj.vy = Math.sin(ang) * 5;
                    proj.bounces++;
                    break;
                }
            }
            forEachHostileDrone(proj.team, drone => {
                const dx = proj.x - (drone.x + drone.w / 2);
                const dy = proj.y - (drone.y + drone.h / 2);
                if (dx * dx + dy * dy >= (proj.radius + drone.w / 2) ** 2) return;
                damageCombatDrone(drone, proj.damage);
                const angle = Math.atan2(dy, dx);
                proj.vx = Math.cos(angle) * 5;
                proj.vy = Math.sin(angle) * 5;
                proj.bounces++;
            });
            
            // Remove if too many bounces or out of bounds or timed out
            if (proj.bounces > proj.maxBounces || proj.life <= 0 || proj.x < 0 || proj.x > worldWidth || proj.y < 0 || proj.y > worldHeight) {
                spawnParticle(proj.x, proj.y, '#00ffff', 0.6);
                musicalSoundWaves.splice(i, 1);
                continue;
            }
            
        }
    }
}

function updatePhysics() {
    updateBarrelFuses();
    updateEmbeddedProjectiles(tank);
    for (const unit of allies) updateEmbeddedProjectiles(unit);
    for (const unit of enemies) updateEmbeddedProjectiles(unit);
    for (const obj of objects) if (obj.type === 'woodenWall') updateEmbeddedProjectiles(obj);

    // Only rescue substantial overlaps; contact rounding must not teleport the player.
    (function rescueStuckTank() {
        if (typeof tank === 'undefined' || tank.alive === false || isBurovoyBurrowActive(tank)) return;
        const tRect = { x: tank.x, y: tank.y, w: tank.w, h: tank.h };
        let stuck = false;
        for (const o of objects) {
            if (o.type === 'wall' || o.type === 'woodenWall' || o.type === 'box' || o.type === 'barrel') {
                if (!checkRectCollision(tRect, o)) continue;
                const overlapX = Math.min(tank.x + tank.w, o.x + o.w) - Math.max(tank.x, o.x);
                const overlapY = Math.min(tank.y + tank.h, o.y + o.h) - Math.max(tank.y, o.y);
                if (Math.min(overlapX, overlapY) <= 2) {
                    const nx = overlapX <= overlapY
                        ? (tank.x + tank.w / 2 < o.x + o.w / 2 ? o.x - tank.w : o.x + o.w)
                        : tank.x;
                    const ny = overlapY < overlapX
                        ? (tank.y + tank.h / 2 < o.y + o.h / 2 ? o.y - tank.h : o.y + o.h)
                        : tank.y;
                    if (isEntityPlacementFree(tank, nx, ny)) {
                        tank.x = nx;
                        tank.y = ny;
                        tRect.x = nx;
                        tRect.y = ny;
                    }
                    continue;
                }
                stuck = true;
                break;
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

    // The index is local to this physics tick; removed objects are checked below.
    const terrainIndex = objects.length >= 60 && ((bullets.length >= 10 && objects.length * bullets.length >= 2500) || objects.filter(obj => obj.type === 'gas').length >= 8)
        ? buildTerrainCollisionIndex(objects) : null;

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
        if (b.trainingZone && (b.x < b.trainingZone.x || b.x > b.trainingZone.x + b.trainingZone.w ||
            b.y < b.trainingZone.y || b.y > b.trainingZone.y + b.trainingZone.h)) {
            bullets.splice(i, 1);
            continue;
        }

        // КВАНТ kvantMain MORPH: after 1.5s, one of 3 random effects triggers
        if (b.type === 'kvantMain' && typeof b.morphTimer !== 'undefined') {
            b.morphTimer--;
            if (b.morphTimer <= 0) {
                const _bAng = Math.atan2(b.vy, b.vx);
                const _bSpd = Math.hypot(b.vx, b.vy);
                const _roll = Math.floor(Math.random() * 3);
                if (_roll === 0) {
                    // Split into 8 fragments, each 1/8 of base damage
                    const _fragDmg = Math.max(1, Math.round(b.damage / 8));
                    for (let _fi = 0; _fi < 8; _fi++) {
                        const _fa = _bAng + (_fi / 8) * Math.PI * 2;
                        bullets.push({ x: b.x, y: b.y, w: 6, h: 6,
                            vx: Math.cos(_fa) * _bSpd * 0.85,
                            vy: Math.sin(_fa) * _bSpd * 0.85,
                            life: 80, owner: b.owner, team: b.team,
                            type: 'kvantSmall', damage: _fragDmg });
                    }
                    for (let _pk = 0; _pk < 14; _pk++) spawnParticle(b.x, b.y, '#00e5ff', 0.9);
                    bullets.splice(i, 1);
                    continue;
                } else if (_roll === 1) {
                    // Accelerate by 50%, no further morph
                    b.vx *= 1.5;
                    b.vy *= 1.5;
                    delete b.morphTimer;
                    for (let _pk = 0; _pk < 6; _pk++) spawnParticle(b.x, b.y, '#00e5ff', 0.7);
                } else {
                    // Duplicate into 2 bullets at 2/3 damage each, no further morph
                    const _dupDmg = Math.max(1, Math.round(b.damage * 2 / 3));
                    const _off = 0.18;
                    bullets.push({ x: b.x, y: b.y, w: 9, h: 9,
                        vx: Math.cos(_bAng - _off) * _bSpd,
                        vy: Math.sin(_bAng - _off) * _bSpd,
                        life: b.life, owner: b.owner, team: b.team,
                        type: 'kvantMain', damage: _dupDmg });
                    bullets.push({ x: b.x, y: b.y, w: 9, h: 9,
                        vx: Math.cos(_bAng + _off) * _bSpd,
                        vy: Math.sin(_bAng + _off) * _bSpd,
                        life: b.life, owner: b.owner, team: b.team,
                        type: 'kvantMain', damage: _dupDmg });
                    for (let _pk = 0; _pk < 10; _pk++) spawnParticle(b.x, b.y, '#00e5ff', 0.8);
                    bullets.splice(i, 1);
                    continue;
                }
            }
        }

        // КВАНТ kvantSide SPLIT: each side bullet splits into 2 smalls at ±0.3 rad
        if (b.type === 'kvantSide' && b.splitSide && typeof b.splitTimer !== 'undefined') {
            b.splitTimer--;
            if (b.splitTimer <= 0) {
                const bAng = Math.atan2(b.vy, b.vx);
                const bSpd = Math.hypot(b.vx, b.vy);
                bullets.push({ x: b.x, y: b.y, w: 6, h: 6,
                    vx: Math.cos(bAng - 0.3) * bSpd, vy: Math.sin(bAng - 0.3) * bSpd,
                    life: 75, owner: b.owner, team: b.team, type: 'kvantSmall', damage: 40 });
                bullets.push({ x: b.x, y: b.y, w: 6, h: 6,
                    vx: Math.cos(bAng + 0.3) * bSpd, vy: Math.sin(bAng + 0.3) * bSpd,
                    life: 75, owner: b.owner, team: b.team, type: 'kvantSmall', damage: 40 });
                bullets.splice(i, 1);
                continue;
            }
        }

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
            if (b.type === 'kamikazeBullet') explodeKamikazeProjectile(b);
            else if (b.type === 'rocket' || b.type === 'smallRocket') explodeRocket(b);
            else if (b.type === 'mechRocketBullet') explodeMechRocket(b);
            else if (b.type === 'toxic' || b.type === 'megabomb') explodeGas(b, b.type === 'megabomb');
            else if (b.hasExplosion) {
                // Buratino enhanced shot: large explosion
                spawnExplosion(b.x, b.y, b.explosionRadius, 'blast');
                let explosionDamage = b.damage || 100;
                if (b.owner === 'player') explosionDamage = applyPlayerDamage(explosionDamage);
                applyDamage(b.x, b.y, b.explosionRadius, explosionDamage, b.team);
            }
            bullets.splice(i, 1);
            continue;
        }
        // normalize bullet rect (bullets stored by center)
        const bRect = { x: b.x - (b.w||0)/2, y: b.y - (b.h||0)/2, w: b.w || 4, h: b.h || 4 };
        if (b.type === 'kamikazeBullet') {
            const candidates = terrainIndex ? queryTerrainCollisionIndex(terrainIndex, bRect) : objects;
            const result = resolveKamikazeProjectile(b, bRect, candidates);
            if (result === 'hit') bullets.splice(i, 1);
            continue;
        }
        if (b.type === 'toxic' || b.type === 'megabomb') {
            const cover = terrainIndex ? queryTerrainCollisionIndex(terrainIndex, bRect) : objects;
            if (cover.some(obj => (b.toxicWave ? isBlockingTerrainObject(obj) : obj.type === 'woodenWall') && checkRectCollision(bRect, obj))) {
                explodeGas(b, b.type === 'megabomb');
                bullets.splice(i, 1);
                continue;
            }
        }
        if (b.type === 'rocket' || b.type === 'smallRocket') {
            const collided = objects.find(obj => isBlockingTerrainObject(obj) && checkRectCollision(bRect, obj));
            if (collided) {
                explodeRocket(b);
                if (collided.type === 'barrel') explodeBarrel(collided);
                bullets.splice(i, 1);
                continue;
            }
        }
        // Check collision with objects (but toxic/megabomb/plasmaBlast/musical pass through standard logic differently)
        let hit = false;
        if (b.type !== 'rocket' && b.type !== 'toxic' && b.type !== 'megabomb' && b.type !== 'plasmaBlast' && b.type !== 'musical' && b.type !== 'meteorMini' && b.type !== 'romanBlade') {
            const terrainCandidates = terrainIndex ? queryTerrainCollisionIndex(terrainIndex, bRect) : objects;
            for (const obj of terrainCandidates) {
                if (!isBlockingTerrainObject(obj)) continue; // only solid objects stop bullets
                if (checkRectCollision(bRect, obj)) {
                    if (terrainIndex && !objects.includes(obj)) continue;
                    if (b.type === 'mechShield' && (obj.type === 'wall' || obj.type === 'woodenWall')) {
                        hitWallWithShieldProjectile(obj, b);
                        bullets.splice(i, 1);
                        hit = true;
                        break;
                    }
                    // Toxic/mega bombs pass through walls but explode on other objects
                    if ((b.type === 'toxic' || b.type === 'megabomb') && obj.type === 'wall') {
                        // pass through walls, don't explode
                        continue;
                    }
                    // mechRocket bullet explodes on contact with walls/objects
                    if (b.type === 'mechRocketBullet' && (obj.type === 'wall' || obj.type === 'woodenWall' || obj.type === 'box' || obj.type === 'barrel')) {
                        explodeMechRocket(b);
                        if (obj.type === 'barrel') explodeBarrel(obj);
                        bullets.splice(i, 1);
                        hit = true;
                        break;
                    }
                    // Other bullets explode on collision, but toxic/megabomb only explode by timer
                    if (b.type !== 'toxic' && b.type !== 'megabomb') {
                        // regular explosion logic for non-toxic bullets
                    }
                    bullets.splice(i, 1);
                    hit = true;
                    if (obj.type === 'woodenWall') {
                        damageWoodenWall(obj, b.damage || 100, { exactDamage: true, hitX: b.x, hitY: b.y, vx: b.vx, vy: b.vy,
                            ignite: b.type === 'pyroBullet', materialEffect: b.type === 'ice' ? 'ice' : 'wood' });
                        if (obj.hp > 0) addEmbeddedProjectile(obj, b);
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
                            spawnExplosion(b.x, b.y, b.explosionRadius, 'blast');
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

                    if (obj.type === 'woodenWall') {
                        damageWoodenWall(obj, b.damage || 200, { hitColor: b.color || '#00ffff', hitParticles: 4, hitX: b.x, hitY: b.y, vx: b.vx, vy: b.vy });
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
                if (!isBlockingTerrainObject(obj)) continue;
                if (checkRectCollision(bRect, obj)) {
                    if (obj.type === 'woodenWall') {
                        damageWoodenWall(obj, b.damage || 125, { hitX: b.x, hitY: b.y, vx: b.vx, vy: b.vy });
                        if (obj.hp > 0) addEmbeddedProjectile(obj, b);
                        bullets.splice(i, 1); hit = true;
                        break;
                    }
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
                    if (obj.type === 'woodenWall') destroyWoodenWall(obj, { vx: b.vx, vy: b.vy });
                    else {
                        objects.splice(j, 1);
                        navNeedsRebuild = true;
                        spawnTerrainDebris(obj, { destroyed: true, vx: b.vx, vy: b.vy });
                    }
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
                    if (!isPlayerDamageProtected()) tank.hp = Math.max(0, tank.hp - (b.damage || 75));
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
                if (checkRectCollision(bRect, obj) && (obj.type === 'wall' || obj.type === 'woodenWall' || obj.type === 'box')) {
                    if (obj.type === 'woodenWall') destroyWoodenWall(obj, { vx: b.vx, vy: b.vy });
                    else {
                        objects.splice(j, 1);
                        navNeedsRebuild = true;
                        if (obj.type === 'wall') spawnTerrainDebris(obj, { destroyed: true, vx: b.vx, vy: b.vy });
                        else for (let k = 0; k < 10; k++) spawnParticle(obj.x + obj.w/2, obj.y + obj.h/2);
                    }
                    // Continue flying, don't remove bullet
                }
            }
        }
        if (!hit) {
            // Check collision with tank (player team = 0); poison projectiles pass through.
            if (tank.hp > 0 && b.team !== tank.team && checkRectCollision(bRect, tank)) {
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
                    rememberMirrorProjectile(tank, b);
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
                        spawnExplosion(b.x, b.y, 22, 'impact');
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
                    // Poison projectiles pass through; only their clouds deal damage.
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
                        dealDamageToEntity(tank, Math.round((b.damage || 65) * _shieldMult));
                        b.hitEntities.push('player');
                        for (let k = 0; k < 5; k++) spawnParticle(tank.x+tank.w/2+(Math.random()-0.5)*tank.w, tank.y+tank.h/2+(Math.random()-0.5)*tank.h, '#00e5ff', 0.6);
                    }
                    // Don't remove
                } else {
                     let dmg = (b.damage || (b.type === 'fire' ? 22 : b.type === 'rocket' ? 200 : 100));
                     dmg = Math.round(dmg * _shieldMult);
                     dealDamageToEntity(tank, dmg);
                     if (b.type === 'ice' && tankType !== 'ice') { tank.iceSlowed = true; tank.iceSlowedTime = 240; }
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
                addEmbeddedProjectile(tank, b);
                if (b.type !== 'toxic' && b.type !== 'megabomb') tank.hitFlashTime = Date.now();
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
            // Check collision with allies; poison projectiles pass through.
            for (let j = allies.length - 1; j >= 0; j--) {
                const a = allies[j];
                if (!a || !a.alive) continue;
                // Medical pulse: only damage enemies, no healing to allies
                if (b.type === 'medicalPulse') {
                    if (checkRectCollision(bRect, a)) {
                        if (b.team !== a.team) {
                            // Damage enemy only
                            dealDamageToEntity(a, b.damage || 75);
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
                        rememberMirrorProjectile(a, b);
                    }
                    // Special handling for electric ball: chain damage and continue flying
                    if (b.type === 'electricBall') {
                        if (!b.hitChain) b.hitChain = [];
                        const aid = -2 - j;
                        if (!b.hitChain.includes(aid)) {
                            dealDamageToEntity(a, b.damage || 150);
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
                        // Poison projectiles pass through; only their clouds deal damage.
                    } else if (b.type === 'plasma') {
                        // Plasma bolt pierces through allies — hit each only once
                        if (!b.hitEntities) b.hitEntities = [];
                        const _allyKey = 'ally_' + j;
                        if (!b.hitEntities.includes(_allyKey)) {
                            dealDamageToEntity(a, b.damage || 350);
                            b.hitEntities.push(_allyKey);
                        }
                        // continue flying, don't remove bullet
                    } else if (b.type === 'plasmaBlast') {
                        // Plasma blast pierces through allies — hit each only once
                        if (!b.hitEntities) b.hitEntities = [];
                        const _allyKeyPB = 'ally_' + j;
                        if (!b.hitEntities.includes(_allyKeyPB)) {
                            dealDamageToEntity(a, b.damage || 600);
                            b.hitEntities.push(_allyKeyPB);
                        }
                        // continue flying, don't remove bullet
                    } else if (b.type === 'machinegun') {
                        // Machinegun: rapid fire with consistent damage
                        dealDamageToEntity(a, b.damage);
                        bullets.splice(i, 1);
                    } else {
                        dealDamageToEntity(a, b.damage || (b.type === 'fire' ? 22 : b.type === 'rocket' ? 200 : 100));
                        if (b.type === 'ice' && a.tankType !== 'ice') { a.iceSlowed = true; a.iceSlowedTime = 240; }
                        bullets.splice(i, 1);
                    }
                    addEmbeddedProjectile(a, b);
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
            // Check collision with enemies; poison projectiles pass through.
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
                        rememberMirrorProjectile(e, b);
                    }
                    if (b.type === 'rocket' || b.type === 'smallRocket') {
                        explodeRocket(b);
                        bullets.splice(i, 1);
                    } else if (b.type === 'mechRocketBullet') {
                        explodeMechRocket(b, e); // enemy is direct hit — guarantees full damage
                        bullets.splice(i, 1);
                    } else if (b.type === 'toxic' || b.type === 'megabomb') {
                        // Poison projectiles pass through; only their clouds deal damage.
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
                            let dmgRailgun = b.damage || 65;
                            if (b.owner === 'player') dmgRailgun = applyPlayerDamage(dmgRailgun);
                            dealDamageToEntity(e, dmgRailgun);
                            b.hitEntities.push(j);
                            for (let k = 0; k < 5; k++) spawnParticle(e.x+e.w/2+(Math.random()-0.5)*e.w, e.y+e.h/2+(Math.random()-0.5)*e.h, '#00e5ff', 0.6);
                        }
                        // Don't remove — keeps flying
                    } else if (b.type === 'droneBullet') {
                        // Drone bullet: damage and remove
                        dealDamageToEntity(e, b.damage || 25);
                        bullets.splice(i, 1);
                    } else if (b.hasExplosion) {
                        // Buratino enhanced shot: large explosion on impact
                        spawnExplosion(b.x, b.y, b.explosionRadius, 'blast');
                        let explosionDamage = b.damage || 100;
                        if (b.owner === 'player') explosionDamage = applyPlayerDamage(explosionDamage);
                        applyDamage(b.x, b.y, b.explosionRadius, explosionDamage, b.team);
                        bullets.splice(i, 1);
                    } else {
                        let dmgDefault = (b.damage || (b.type === 'fire' ? 22 : b.type === 'rocket' ? 200 : 100));
                        if (b.owner === 'player') dmgDefault = applyPlayerDamage(dmgDefault);
                        if (b.type === 'myasnoyBio' && b.owner === 'player' && e.isBoss) dmgDefault /= 3;
                        dealDamageToEntity(e, dmgDefault);
                        if (b.type === 'ice' && e.tankType !== 'ice') { e.iceSlowed = true; e.iceSlowedTime = 240; }
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
                    addEmbeddedProjectile(e, b);
                    if (b.type !== 'toxic' && b.type !== 'megabomb') e.hitFlashTime = Date.now();
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
            if (bullets.includes(b)) {
                for (const group of [playerDrones, enemyDrones]) {
                    if (!bullets.includes(b)) break;
                    for (let j = group.length - 1; j >= 0; j--) {
                        const drone = group[j];
                        if (!drone || drone.romanSummon === 'banner' || drone.alive === false || drone.team === b.team || !checkRectCollision(bRect, drone)) continue;
                        if (hitCombatDroneWithBullet(b, drone)) bullets.splice(i, 1);
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
                tank.lastHitProjectileSize = null;
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
                    e.lastHitProjectileSize = null;
                }
                dealDamageToEntity(e, sw.damage);
                e.confused = 30; // 0.5 seconds confusion
                if (e.hp <= 0) {
                    enemies.splice(j, 1);
                    spawnExplosion(e.x+e.w/2, e.y+e.h/2, 65);
                }
            }
        }
        forEachHostileDrone(sw.team, drone => {
            if (checkCircleCollision(sw.x, sw.y, sw.radius,
                drone.x + drone.w / 2, drone.y + drone.h / 2, Math.max(drone.w, drone.h) / 2)) {
                damageCombatDrone(drone, sw.damage);
            }
        });
        // Check collision with allies if enemy wave
        for (let j = allies.length - 1; j >= 0; j--) {
            const a = allies[j];
            if (a.team !== sw.team && checkCircleCollision(sw.x, sw.y, sw.radius, a.x + a.w/2, a.y + a.h/2, Math.max(a.w, a.h)/2)) {
                if (a.tankType === 'mirror') {
                    a.lastHitType = 'musical';
                    a.lastHitTime = Date.now();
                    a.lastHitProjectileSize = null;
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
                    igniteWoodenWall(obj, 300, 20, f.x, f.y);
                    if (obj.hp <= 0) {
                        destroyWoodenWall(obj, { hitX: f.x, hitY: f.y, vx: f.vx, vy: f.vy });
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
                    tank.lastHitProjectileSize = null;
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
            if (flames.includes(f)) {
                let droneHit = false;
                forEachHostileDrone(f.team, drone => {
                    if (droneHit || !checkRectCollision({ x: f.x - 2, y: f.y - 2, w: 4, h: 4 }, drone)) return;
                    damageCombatDrone(drone, f.damage);
                    flames.splice(i, 1);
                    droneHit = true;
                });
            }
        }
    }
    
    // Advance each barrage once before explosions can change the objects array.
    for (const barrage of objects.filter(obj => obj.type === 'targetCircle' && obj.buratinoBarrage)) {
        updateBuratinoBarrage(barrage);
    }

    // Обновление target circles
    for (let i = objects.length - 1; i >= 0; i--) {
        const obj = objects[i];
        if (obj.type === 'targetCircle') {
            if (obj.buratinoBarrage) continue;
            obj.timer--;
            if (obj.timer <= 0) {
                // use global applyDamage(x,y) helper for area damage
                // If planned positions exist, only spawn explosions for positions not yet exploded.
                if (obj.planned && obj.planned.length) {
                    for (let p of obj.planned) {
                        if (!p.exploded) {
                            spawnExplosion(p.x, p.y, 30, 'blast');
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
                        spawnExplosion(ex, ey, 30, 'blast');
                        applyDamage(ex, ey, 30, 300, obj.team);
                    }
                    for (let j = 0; j < 9; j++) {
                        const ang = (j / 9) * Math.PI * 2;
                        const dist = obj.radius * 0.7;
                        const ex = obj.x + Math.cos(ang) * dist;
                        const ey = obj.y + Math.sin(ang) * dist;
                        spawnExplosion(ex, ey, 30, 'blast');
                        applyDamage(ex, ey, 30, 300, obj.team);
                    }
                }
                objects.splice(i, 1);
            }
        } else if (obj.type === 'explosion' || obj.type === 'terrainDebris') {
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
            forEachHostileDrone(obj.team, unit => { if (unit.romanSummon === 'legionary') applyIceFieldFreeze(unit, obj); });
            obj.life--;
            if (obj.life <= 0) {
                clearIceFieldTouchState(obj.fieldId);
                objects.splice(i, 1);
            }
        } else if (obj.type === 'woodIceImpact') {
            if (!updateWoodIceImpact(obj)) objects.splice(i, 1);
        } else if (obj.type === 'romanRemnant') {
            obj.life--; if (obj.life <= 0) objects.splice(i, 1);
        } else if (obj.type === 'woodDecay') {
            obj.life--;
            if (obj.life <= 0) objects.splice(i, 1);
        } else if (obj.type === 'gas') {
            if (!updatePoisonCloud(obj)) { objects.splice(i, 1); continue; }
            poisonWoodInGas(obj, terrainIndex);
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
            if (obj.barrageVisual) {
                if (obj.delay > 0) {
                    obj.delay--;
                } else {
                    obj.x += obj.vx;
                    obj.y += obj.vy;
                    obj.life--;
                    if (window.effectsEnabled !== false && particles.length < 230 && Math.random() < 0.25) {
                        particles.push({ x: obj.x, y: obj.y, vx: -obj.vx * 0.05, vy: -obj.vy * 0.05,
                            life: 8, size: 2, color: 'rgba(90, 85, 80, 0.5)' });
                    }
                    if (obj.life <= 0) objects.splice(i, 1);
                }
                continue;
            }
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
                        spawnExplosion(obj.target.x, obj.target.y, 30, 'blast');
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
                                spawnExplosion(obj.x, obj.y, 30, 'blast');
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

    for (const unit of [tank, ...allies, ...enemies]) {
        syncBurovoyDrillParalysis(unit);
        tickSandstormDebuff(unit);
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
        const gasTeam = ownerTeam === null ? (obj.owner === 'enemy' ? 1 : 0) : ownerTeam;
        forEachHostileDrone(gasTeam, drone => {
            if (Math.hypot(drone.x + drone.w / 2 - obj.x, drone.y + drone.h / 2 - obj.y) <= obj.radius) {
                drone.poisonTimer = Math.max(drone.poisonTimer || 0, GAS_DEBUFF_TICKS);
            }
        });
    }

    // Apply poison damage over time to all entities with poisonTimer
    const applyPoisonTick = (ent) => {
        if (!ent || !ent.poisonTimer) return;
        if (ent.alive === false) return; // Don't poison dead entities
        if (ent.isBoss) { ent.poisonTimer = 0; return; } // Boss is immune to poison
        if (ent.tankType === 'toxic') { ent.poisonTimer = 0; return; } // Toxic tank is immune to poison
        if (ent.poisonTimer > 0) {
            // Fixed 44 HP/sec poison damage regardless of max HP.
            const dmgPerTick = 44 / 60;

              // Mirror Tank Logic: Poison counts as hit type 'toxic' (for any mirror tank)
              if (ent.tankType === 'mirror') {
                  ent.lastHitType = 'toxic';
                  ent.lastHitTime = Date.now();
                  ent.lastHitProjectileSize = null;
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
    for (const group of [playerDrones, enemyDrones]) {
        for (let index = group.length - 1; index >= 0; index--) {
            const drone = group[index];
            applyPoisonTick(drone);
            if (drone.hp <= 0 && drone.romanSummon) { retireRomanUnit(drone); continue; }
            if (drone.hp <= 0) {
                group.splice(index, 1);
                spawnExplosion(drone.x + drone.w / 2, drone.y + drone.h / 2, 36, 'impact');
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
                    tank.lastHitProjectileSize = null;
                    
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
            if (typeof setTankHP === 'function') {
                setTankHP(tankType);
            } else {
                tank.hp = (typeof tankMaxHpByType !== 'undefined' && tankMaxHpByType[tankType]) || 300;
            }
            tank.alive = true;
            const spawn = window.trainingSpawn || { x: 250, y: 750 };
            tank.x = spawn.x; tank.y = spawn.y;
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

    // Clamp all entities back inside world bounds (safety net for knockback/phasing edge cases)
    const clampToWorld = (ent) => {
        if (!ent || ent.alive === false) return;
        ent.x = Math.max(0, Math.min(worldWidth  - (ent.w || 38), ent.x));
        ent.y = Math.max(0, Math.min(worldHeight - (ent.h || 38), ent.y));
    };
    clampToWorld(tank);
    for (const e of enemies) clampToWorld(e);
    for (const a of allies)  clampToWorld(a);
}

// Return the first contact along a movement vector. Exact contact keeps gaps
// between boxes intact until the box behind actually reaches the next one.
function sweptBoxPushContact(moving, target, dx, dy) {
    let enterX = -Infinity, leaveX = Infinity;
    let enterY = -Infinity, leaveY = Infinity;
    if (dx > 0) {
        enterX = (target.x - moving.x - moving.w) / dx;
        leaveX = (target.x + target.w - moving.x) / dx;
    } else if (dx < 0) {
        enterX = (target.x + target.w - moving.x) / dx;
        leaveX = (target.x - moving.x - moving.w) / dx;
    } else if (moving.x >= target.x + target.w || moving.x + moving.w <= target.x) {
        return null;
    }
    if (dy > 0) {
        enterY = (target.y - moving.y - moving.h) / dy;
        leaveY = (target.y + target.h - moving.y) / dy;
    } else if (dy < 0) {
        enterY = (target.y + target.h - moving.y) / dy;
        leaveY = (target.y - moving.y - moving.h) / dy;
    } else if (moving.y >= target.y + target.h || moving.y + moving.h <= target.y) {
        return null;
    }
    const entry = Math.max(enterX, enterY);
    const exit = Math.min(leaveX, leaveY);
    if (entry > exit || exit <= 0 || entry > 1 || entry < -1e-7) return null;
    return Math.max(0, entry);
}

function canPushBoxInRow(part, box, entity, dx, dy, contact) {
    if (Math.abs(dx) >= Math.abs(dy)) {
        const partY = part.y + dy * contact;
        const overlap = Math.min(partY + part.h, box.y + box.h) - Math.max(partY, box.y);
        if (overlap <= 1e-7) return false;
        if (dx > 0 ? box.x < part.x + part.w - 1e-7 : box.x + box.w > part.x + 1e-7) return false;
        return part === entity || overlap + 1e-7 >= Math.min(part.h, box.h) / 10;
    }
    const partX = part.x + dx * contact;
    const overlap = Math.min(partX + part.w, box.x + box.w) - Math.max(partX, box.x);
    if (overlap <= 1e-7) return false;
    if (dy > 0 ? box.y < part.y + part.h - 1e-7 : box.y + box.h > part.y + 1e-7) return false;
    return part === entity || overlap + 1e-7 >= Math.min(part.w, box.w) / 10;
}

function pushBoxChain(entity, dx, dy, botMovement = false) {
    const moving = [entity];
    const movingSet = new Set(moving);
    const contacts = [];
    const units = [tank, ...allies, ...enemies, ...illusions.filter(il => il && il.life > 0)];
    let boxesMoved = 0;
    let boxesDisplaced = false;
    let budget = 1;
    let blocked = false;
    const epsilon = 1e-7;

    while (budget > epsilon) {
        const speed = Math.pow(0.9, Math.max(0, boxesMoved - 1));
        const moveX = dx * speed * budget;
        const moveY = dy * speed * budget;
        let first = 1;
        const hits = [];
        const consider = (time, target, parent, hard) => {
            if (time === null || time > first + epsilon || time < -epsilon) return;
            const contact = Math.max(0, time);
            if (contact < first - epsilon) {
                first = contact;
                hits.length = 0;
            }
            if (Math.abs(contact - first) <= epsilon) hits.push({ target, parent, hard });
        };

        for (const part of moving) {
            const limitX = moveX > 0 ? (worldWidth - part.x - part.w) / moveX :
                moveX < 0 ? -part.x / moveX : Infinity;
            const limitY = moveY > 0 ? (worldHeight - part.y - part.h) / moveY :
                moveY < 0 ? -part.y / moveY : Infinity;
            consider(Math.min(limitX, limitY), null, part, true);
            for (const obj of objects) {
                if (movingSet.has(obj)) continue;
                // Bots have always been able to pass through barrels and other
                // non-wall objects; a pushed box itself still collides with them.
                if (botMovement && part === entity && obj.type !== 'box' &&
                    obj.type !== 'wall' && obj.type !== 'woodenWall') continue;
                const contact = sweptBoxPushContact(part, obj, moveX, moveY);
                if (contact === null) continue;
                const hard = obj.type !== 'box' ||
                    !canPushBoxInRow(part, obj, entity, moveX, moveY, contact);
                consider(contact, obj, part, hard);
            }
            for (const unit of units) {
                if (!unit || unit === entity || unit.alive === false) continue;
                if (part === entity && unit.tankType === 'burovoy' && unit.burovoyBurrowActive === true) continue;
                const contact = sweptBoxPushContact(part, unit, moveX, moveY);
                consider(contact, unit, part, true);
            }
        }

        const directlyPushed = new Set(hits.filter(hit => !hit.hard).map(hit => hit.target));
        const hardBlock = hits.some(hit => hit.hard && !directlyPushed.has(hit.target));
        const nextBox = hits.find(hit => !hit.hard);

        if (first > epsilon) {
            if (moving.length > 1) boxesDisplaced = true;
            for (const part of moving) {
                part.x += moveX * first;
                part.y += moveY * first;
            }
            // Keep touching faces bit-for-bit aligned so rounding cannot make
            // the rescue logic mistake a push for a tank stuck inside a box.
            for (const contact of contacts) {
                if (contact.x) contact.child.x = contact.parent.x +
                    (dx > 0 ? contact.parent.w : -contact.child.w);
                if (contact.y) contact.child.y = contact.parent.y +
                    (dy > 0 ? contact.parent.h : -contact.child.h);
            }
            budget *= 1 - first;
        }
        if (hardBlock) {
            blocked = true;
            break;
        }
        if (!nextBox) break;
        const obstruction = nextBox.target;
        const contactParent = nextBox.parent;
        contacts.push({
            parent: contactParent,
            child: obstruction,
            x: dx !== 0 && Math.abs(obstruction.x -
                (dx > 0 ? contactParent.x + contactParent.w : contactParent.x - obstruction.w)) < epsilon,
            y: dy !== 0 && Math.abs(obstruction.y -
                (dy > 0 ? contactParent.y + contactParent.h : contactParent.y - obstruction.h)) < epsilon
        });
        moving.push(obstruction);
        movingSet.add(obstruction);
        boxesMoved++;
    }

    if (boxesDisplaced) {
        const box = moving[1];
        if (Math.random() > 0.5) spawnParticle(box.x + box.w / 2, box.y + box.h / 2);
        if (typeof navNeedsRebuild !== 'undefined') navNeedsRebuild = true;
    }
    return !blocked;
}

function moveWithCollision(dx, dy) {
    const canPhaseWalls = canBurovoyPhaseThroughWalls(tank);
    tank.x += dx;
    tank.y += dy;
    // Если после движения мы врезаемся в другой танк — откатываем движение
    const tRect = { x: tank.x, y: tank.y, w: tank.w, h: tank.h };
    let collidedWithTank = false;
    if (!canPhaseWalls && typeof tank !== 'undefined') {
        for (const e of enemies) {
            if (!e || e === tank || e.alive === false) continue;
            // Burrowed burovoy is underground — doesn't physically block movement
            if (e.tankType === 'burovoy' && e.burovoyBurrowActive === true) continue;
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
            if (canPhaseWalls && isBlockingTerrainObject(obj)) {
                continue;
            }
            if (obj.type === 'box') {
                tank.x -= dx;
                tank.y -= dy;
                pushBoxChain(tank, dx, dy);
                return;
            }
            if (obj.type === 'barrel') {
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
                break;
            } else if (canPhaseWalls && (obj.type === 'wall' || obj.type === 'woodenWall')) {
                continue;
            } else {
                // Жесткая стена
                tank.x -= dx;
                tank.y -= dy;
                break;
            }
        }
    }

    // Края мира
    tank.x = Math.max(0, Math.min(worldWidth - tank.w, tank.x));
    tank.y = Math.max(0, Math.min(worldHeight - tank.h, tank.y));
}

