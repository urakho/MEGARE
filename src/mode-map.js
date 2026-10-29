// mode-map.js
// Map generation, enemy/ally spawning, and game mode logic
// Dependencies: Global state (tank, enemies, allies, objects, etc.) from main.js

// ─────────────────────────────────────────────────────────────────────────────
// MAP GENERATION
// ─────────────────────────────────────────────────────────────────────────────

function generateMap() {
    objects = [];
    const step = 50;
    const occupied = new Set();
    const addObstacle = obj => {
        const key = `${obj.x}:${obj.y}`;
        if (occupied.has(key) || obj.x + obj.w > worldWidth || obj.y + obj.h > worldHeight) return false;
        occupied.add(key);
        objects.push(obj);
        return true;
    };
    
    for (let x = step; x < worldWidth - step; x += step) {
        for (let y = step; y < worldHeight - step; y += step) {
            if (Math.random() > 0.92) {
                const isVertical = Math.random() > 0.5;
                const length = Math.floor(Math.random() * 2) + 1;
                const blockSize = 50;
                
                if (isVertical) {
                    const blockCount = (length * step) / blockSize;
                    for (let i = 0; i < blockCount; i++) {
                        if (y + (i + 1) * blockSize > worldHeight) break;
                        // 30% chance this wall segment is wooden
                        const isWooden = Math.random() < 0.3;
                       addObstacle({
                           x: x, y: y + i * blockSize, w: blockSize, h: blockSize, 
                           type: isWooden ? 'woodenWall' : 'wall',
                           color: isWooden ? '#8B5E3C' : '#2b2b2b',
                           hp: isWooden ? 300 : undefined,
                           maxHp: isWooden ? 300 : undefined
                       });
                    }
                } else {
                    const blockCount = (length * step) / blockSize;
                    for (let i = 0; i < blockCount; i++) {
                        if (x + (i + 1) * blockSize > worldWidth) break;
                        const isWooden = Math.random() < 0.3;
                       addObstacle({
                           x: x + i * blockSize, y: y, w: blockSize, h: blockSize, 
                           type: isWooden ? 'woodenWall' : 'wall',
                           color: isWooden ? '#8B5E3C' : '#2b2b2b',
                           hp: isWooden ? 300 : undefined,
                           maxHp: isWooden ? 300 : undefined
                       });
                    }
                }
            }
        }
    }
    
    for (let x = step; x < worldWidth - step; x += step) {
        for (let y = step; y < worldHeight - step; y += step) {
            if (Math.random() > 0.92) {
                const newBox = { x: x, y: y, w: 50, h: 50, type: 'box', color: '#7a4a21' };
                addObstacle(newBox);
            }
        }
    }
    
    objects = objects.filter(obj => {
        const dist = Math.hypot(obj.x - tank.x, obj.y - tank.y);
        return dist > 100;
    });

    enemies = [];
    const cornerPositions = [
        {x: worldWidth - 50, y: 50},
        {x: 50, y: worldHeight - 50},
        {x: worldWidth - 50, y: worldHeight - 50}
    ];
    for (let i = 0; i < 3; i++) {
        const cp = cornerPositions[i];
        const p = findFreeSpot(cp.x - 19, cp.y - 19, 38, 38);
        const tankTypes = ['normal','ice','fire','buratino','toxic','plasma','musical','illuminat','mirror','egyptian','machinegun','waterjet','buckshot','electric','burovoy','burovoy','burovoy','imitator','robot','medical','mine','pyro','spartan','air','air','mechDiy','mechShield','mechRocket','kvant'];
        const tt = tankTypes[Math.floor(Math.random() * tankTypes.length)];
        const typeColors = { normal: '#8B0000', ice: '#00BFFF', fire: '#FF4500', buratino: '#6E38B0', toxic: '#27ae60', plasma: '#8e44ad', musical: '#00ffff', illuminat: '#f39c12', mirror: '#bdc3c7', egyptian: '#c89b3c', machinegun: '#A0522D', waterjet: '#2e86c1', buckshot: '#455A64', electric: '#6c3483', burovoy: '#8b1e13', imitator: '#6c3483', robot: '#263238', mine: '#3d4c18', pyro: '#8b2500', spartan: '#b87333', mechDiy: '#1a8a3e', mechShield: '#1a3a6e', mechRocket: '#7d1f1f', kvant: '#0d1b2a' };
        enemies.push({
            x: p.x, y: p.y, w: 38, h: 38,
            color: typeColors[tt] || ['#8B0000', '#006400', '#FFD700'][i],
            tankType: tt,
            hp: (tankMaxHpByType[tt] || window.mechMaxHpByType?.[tt] || 300),
            turretAngle: 0, baseAngle: 0, speed: 2.5, trackOffset: 0,
            alive: true, stuckCount: 0, fireCooldown: 0, team: i+1,
            dodgeAccuracy: 0.75 + Math.random() * 0.2,
            paralyzed: false, paralyzedTime: 0,
            megaGasUsed: false, plasmaBlastUsed: 0
        });
    }
}

function generateBossFightMap() {
    objects = [];
    const W = 1800, H = 1400, B = 50;
    const wall = (x, y, w, h) => objects.push({ x, y, w, h, type: 'wall', color: '#3d1a1a', theme: 'hell' });
    const placeCover = obj => {
        const free = candidate => candidate.x >= 0 && candidate.y >= 0 && candidate.x + candidate.w <= W && candidate.y + candidate.h <= H &&
            !objects.some(other => ['wall', 'woodenWall', 'box', 'barrel'].includes(other.type) &&
                candidate.x < other.x + other.w && candidate.x + candidate.w > other.x && candidate.y < other.y + other.h && candidate.y + candidate.h > other.y);
        // Keep the intended cover count, moving a blocked prop to the closest free position.
        for (let radius = 0; radius <= 100; radius += 10) {
            for (let dx = -radius; dx <= radius; dx += 10) for (let dy = -radius; dy <= radius; dy += 10) {
                if (radius && Math.max(Math.abs(dx), Math.abs(dy)) !== radius) continue;
                const candidate = { ...obj, x: obj.x + dx, y: obj.y + dy };
                if (free(candidate)) { objects.push(candidate); return; }
            }
        }
    };
    const box = (x, y) => placeCover({ x, y, w: 40, h: 40, type: 'box', color: '#5b2416' });
    const barrelSize = B;
    const brl = (x, y) => placeCover({ x: x - barrelSize / 2, y: y - barrelSize / 2, w: barrelSize, h: barrelSize, type: 'barrel', color: '#6d3320' });
    const lava = (x, y, w, h) => objects.push({ x, y, w, h, type: 'hellLava', color: '#ff5a1f' });
    const rift = (x, y, w, h) => objects.push({ x, y, w, h, type: 'hellRift', color: '#ff7a2e' });

    [
        [90, 80, 260, 120],
        [1450, 80, 260, 120],
        [90, 1180, 260, 120],
        [1450, 1180, 260, 120],
        [720, 90, 360, 90],
        [720, 1220, 360, 90],
        [120, 610, 170, 80],
        [1510, 610, 170, 80]
    ].forEach(([x, y, w, h]) => lava(x, y, w, h));

    for (let x = 0; x < W; x += B) { wall(x, 0, B, B); wall(x, H - B, B, B); }
    for (let y = B; y < H - B; y += B) { wall(0, y, B, B); wall(W - B, y, B, B); }

    wall(200, 150, 250, B);    wall(200, 200, B, 250);
    wall(1350, 150, 250, B);   wall(1550, 200, B, 250);
    wall(200, 1000, B, 250);   wall(250, 1200, 200, B);
    wall(1550, 1000, B, 250);  wall(1350, 1200, 200, B);

    wall(650, 200, B, 200);    wall(1100, 200, B, 200);
    wall(650, 1000, B, 200);   wall(1100, 1000, B, 200);

    wall(350, 450, 150, B);    wall(1300, 450, 150, B);
    wall(350, 900, 150, B);    wall(1300, 900, 150, B);

    wall(800, 300, 200, B);    wall(800, 1100, 200, B);

    [   [160,150], [420,150], [700,150], [1100,150], [1380,150], [1640,150],
        [160,1250],[420,1250],[700,1250],[1100,1250],[1380,1250],[1640,1250],
        [160,430], [160,530],  [1640,430],[1640,530],
        [160,870], [160,970],  [1640,870],[1640,970],
        [500,380], [700,330], [1300,380],[1100,330],
        [500,1020],[700,1070], [1300,1020],[1100,1070],
        [870,350], [870,1050],
    ].forEach(([x, y]) => box(x - 20, y - 20));

    [   [300,250],[900,250],[1500,250],  [300,1150],[900,1150],[1500,1150],
        [560,430],[1240,430],[560,970],[1240,970],
        [400,530],[1400,530],[400,870],[1400,870],
        [900,200],[900,1200],
    ].forEach(([x, y]) => brl(x, y));

    navNeedsRebuild = true;
}

function generateTrainingMap() {
    objects = [];
    const bw = 50;
    window.trainingShooterZone = { x: 1250, y: 900, w: 1000, h: 600 };
    window.trainingSpawn = { x: 250, y: 750 };

    for (let y = 0; y < worldHeight; y += bw) {
        objects.push({ x: 0, y, w: bw, h: bw, type: 'wall', color: '#2d4a1e' });
        objects.push({ x: worldWidth - bw, y, w: bw, h: bw, type: 'wall', color: '#2d4a1e' });
    }
    for (let x = bw; x < worldWidth - bw; x += bw) {
        objects.push({ x, y: 0, w: bw, h: bw, type: 'wall', color: '#2d4a1e' });
        objects.push({ x, y: worldHeight - bw, w: bw, h: bw, type: 'wall', color: '#2d4a1e' });
    }

    // Four rooms open onto a shared corridor through tank-width doorways.
    for (const y of [650, 850]) {
        for (let x = bw; x < worldWidth - bw; x += bw) {
            if ((x >= 250 && x < 400) || (x >= 1600 && x < 1750)) continue;
            objects.push({ x, y, w: bw, h: bw, type: 'wall', color: '#535a51' });
        }
    }
    for (const y of [50, 100, 150, 200, 250, 300, 350, 400, 450, 500, 550, 600,
        900, 950, 1000, 1050, 1100, 1150, 1200, 1250, 1300, 1350, 1400, 1450]) {
        objects.push({ x: 1200, y, w: bw, h: bw, type: 'wall', color: '#535a51' });
    }

    const coverBlocks = [
        [550, 995], [600, 995], [650, 995], [760, 1145], [810, 1145],
        [510, 1270], [560, 1270], [920, 1280], [970, 1280]
    ];
    for (const [x, y] of coverBlocks) objects.push({ x, y, w: bw, h: bw, type: 'wall', color: '#535a51' });
    for (const [x, y] of [[400, 1100], [730, 1330], [1050, 1080], [1520, 1050], [1690, 1210]]) {
        objects.push({ x, y, w: 42, h: 42, type: 'box', color: '#7a5b3b' });
    }
    for (const [x, y] of [[1120, 280], [1580, 580], [1150, 750], [2130, 760]]) {
        const size = bw;
        objects.push({ x: x + (34 - size) / 2, y: y + (34 - size) / 2, w: size, h: size, type: 'barrel', color: '#7a4a21' });
    }
    navNeedsRebuild = true;
}

// ─────────────────────────────────────────────────────────────────────────────
// SPAWN MODES
// ─────────────────────────────────────────────────────────────────────────────

function spawnAllies(numTeams, teamSize) {
    allies = [];
}

function spawnTeamMode() {
    enemies = [];
    allies = [];
    const tankSize = 38;
    const edgePadding = 60;
    const corners = [
        { x: edgePadding, y: edgePadding },
        { x: worldWidth - edgePadding - tankSize, y: edgePadding },
        { x: edgePadding, y: worldHeight - edgePadding - tankSize },
        { x: worldWidth - edgePadding - tankSize, y: worldHeight - edgePadding - tankSize }
    ];

    function getTeamSpawn(x, y, searchRadius = 220) {
        const spawnX = Math.max(0, Math.min(worldWidth - tankSize, x));
        const spawnY = Math.max(0, Math.min(worldHeight - tankSize, y));
        return findFreeSpot(spawnX, spawnY, tankSize, tankSize, searchRadius, 20, null, 0) || { x: spawnX, y: spawnY };
    }

    function clearArea(x, y, w, h) {
        objects = objects.filter(o => {
            const ox = o.x, oy = o.y, ow = o.w || 40, oh = o.h || 40;
            if (ox < x + w && ox + ow > x && oy < y + h && oy + oh > y) return false;
            return true;
        });
    }

    const playerCorner = corners[0];
    const playerSpawn = getTeamSpawn(playerCorner.x, playerCorner.y, 160);
    tank.x = playerSpawn.x; tank.y = playerSpawn.y; tank.team = 0;
    clearArea(playerCorner.x - 48, playerCorner.y - 48, 96, 96);
    
    const allyTypes = ['normal','ice','fire','buratino','toxic','plasma','musical', 'illuminat', 'mirror', 'egyptian', 'time', 'machinegun', 'waterjet','electric','burovoy','robot','medical','mine','roman'];
    const allyType = allyTypes[Math.floor(Math.random()*allyTypes.length)];
    const allySpawn = getTeamSpawn(playerCorner.x + 44, playerCorner.y + 10, 180);
    allies.push({ x: allySpawn.x, y: allySpawn.y, w: 38, h: 38, color: tank.color, tankType: allyType, hp: (tankMaxHpByType[allyType] || window.mechMaxHpByType?.[allyType] || 300), turretAngle:0, baseAngle:0, speed: (tankMaxSpeedByType[allyType] || window.mechMaxSpeedByType?.[allyType] || 3.2), trackOffset:0, alive:true, team:0, stuckCount:0, fireCooldown:0, dodgeAccuracy: 0.78 + Math.random()*0.15, paralyzed: false, paralyzedTime: 0, robotDroneCooldown: 0 });

    const enemyColors = ['#006400', '#FFD700', '#00BFFF'];
    for (let ci = 1; ci < 4; ci++) {
        const base = corners[ci];
        clearArea(base.x - 48, base.y - 48, 96, 96);
        for (let k = 0; k < 2; k++) {
            const tankTypes = ['normal','ice','fire','buratino','toxic','plasma','musical','illuminat','mirror','egyptian','machinegun','waterjet','buckshot','electric','burovoy','burovoy','burovoy','imitator','robot','medical','roman','pyro','spartan','kvant'];
            const tt = tankTypes[Math.floor(Math.random() * tankTypes.length)];
            const typeColor = { normal: '#8B0000', ice: '#00BFFF', fire: '#FF4500', buratino: '#6E38B0', toxic: '#27ae60', plasma: '#8e44ad', musical: '#00ffff', illuminat: '#f39c12', mirror: '#bdc3c7', egyptian: '#c89b3c', machinegun: '#A0522D', waterjet: '#2e86c1', buckshot: '#455A64', electric: '#6c3483', burovoy: '#8b1e13', imitator: '#6c3483', robot: '#263238', pyro: '#8b2500', spartan: '#b87333', kvant: '#0d1b2a' };
            let sx = base.x + (k === 0 ? 0 : (ci===1 ? -44 : (ci===2 ? 44 : -44)));
            let sy = base.y + (k === 0 ? 0 : (ci===1 ? 28 : (ci===2 ? -28 : -28))); 
            
            const p = getTeamSpawn(sx, sy, 200);
            if (p) {
                enemies.push({ x: p.x, y: p.y, w:38, h:38, color: typeColor[tt] || enemyColors[(ci-1)%enemyColors.length], tankType: tt, hp: (tankMaxHpByType[tt] || window.mechMaxHpByType?.[tt] || 300), turretAngle:0, baseAngle: 0, speed:(tankMaxSpeedByType[tt] || window.mechMaxSpeedByType?.[tt] || 3.2), trackOffset:0, alive:true, team:ci, stuckCount:0, fireCooldown:0, dodgeAccuracy: 0.7 + Math.random()*0.25, paralyzed: false, paralyzedTime: 0, robotDroneCooldown: 0 });
            }
        }
    }

    const barrelCount = 5;
    for (let b = 0; b < barrelCount; b++) {
        const rx = 80 + Math.random() * (worldWidth - 160);
        const ry = 80 + Math.random() * (worldHeight - 160);
        const size = 50;
        const p = findFreeSpot(rx - size / 2, ry - size / 2, size, size, 300, 16);
        if (!p) continue;
        if (Math.hypot(p.x - tank.x, p.y - tank.y) < 120) continue;
        objects.push({ x: p.x, y: p.y, w: size, h: size, type: 'barrel', color: '#b33' });
    }

    navNeedsRebuild = true;
}

function spawnDuelMode() {
    enemies = [];
    allies = [];
    objects = objects || [];

    const playerPos = findFreeSpot(100, 100, 38, 38, 600, 24, tank) || { x: 100, y: 100 };
    tank.x = playerPos.x; tank.y = playerPos.y;
    tank.alive = true;
    setTankHP(tankType);
    
    const ex = worldWidth - 100;
    const ey = worldHeight - 100;
    const enemyPos = findFreeSpot(ex - 19, ey - 19, 38, 38, 600, 24) || { x: ex - 19, y: ey - 19 };
    const tankTypes = ['normal','ice','fire','buratino','toxic','plasma','musical','illuminat','mirror','egyptian','machinegun','waterjet','buckshot','electric','burovoy','burovoy','burovoy','imitator','robot','medical','mine','roman','pyro','spartan','air','mechDiy','mechShield','mechRocket','kvant'];
    const tt = tankTypes[Math.floor(Math.random() * tankTypes.length)];
    const typeColors = { normal: '#8B0000', ice: '#00BFFF', fire: '#FF4500', buratino: '#6E38B0', toxic: '#27ae60', plasma: '#8e44ad', musical: '#00ffff', illuminat: '#f39c12', mirror: '#bdc3c7', egyptian: '#c89b3c', machinegun: '#A0522D', waterjet: '#2e86c1', buckshot: '#455A64', electric: '#6c3483', burovoy: '#8b1e13', imitator: '#6c3483', robot: '#263238', mine: '#3d4c18', pyro: '#8b2500', spartan: '#b87333', air: '#2ecc71', mechDiy: '#1a8a3e', mechShield: '#1a3a6e', mechRocket: '#7d1f1f', kvant: '#0d1b2a' };
    enemies.push({
        x: enemyPos.x, y: enemyPos.y, w: 38, h: 38,
        color: typeColors[tt] || '#B22222',
        tankType: tt,
        hp: (tankMaxHpByType[tt] || window.mechMaxHpByType?.[tt] || 300),
        turretAngle: 0, baseAngle: 0, speed: (tankMaxSpeedByType[tt] || window.mechMaxSpeedByType?.[tt] || 3.2), trackOffset: 0,
        alive: true, team: 1, stuckCount: 0, fireCooldown: 0,
        dodgeAccuracy: 0.8 + Math.random() * 0.15,
        paralyzed: false, paralyzedTime: 0, robotDroneCooldown: 0
    });

    const barrelCount = 8;
    for (let b = 0; b < barrelCount; b++) {
        const rx = 200 + Math.random() * (worldWidth - 400);
        const ry = 200 + Math.random() * (worldHeight - 400);
        const type = Math.random() > 0.7 ? 'barrel' : 'box';
        const size = type === 'barrel' ? 50 : 40;
        const p = findFreeSpot(rx - size / 2, ry - size / 2, size, size, 400, 16);
        if (!p) continue;
        objects.push({ x: p.x, y: p.y, w: size, h: size, type, color: '#7a4a21' });
    }

    navNeedsRebuild = true;
}

function spawnTrialMode() {
    enemies = [];
    allies = [];
    objects = objects || [];

    const cx = worldWidth / 2, cy = worldHeight / 2;
    const ps = findFreeSpot(cx - 19, cy - 19, 38, 38, 600, 32) || { x: cx, y: cy };
    tank.x = ps.x; tank.y = ps.y; tank.team = 0;
    setTankHP(tankType);
    tank.alive = true; tank.respawnTimer = 0;

    const spreadPositions = [
        { x: 120, y: 120 },
        { x: worldWidth - 120, y: 120 },
        { x: 120, y: worldHeight - 120 },
        { x: worldWidth - 120, y: worldHeight - 120 },
        { x: cx, y: 120 },
        { x: 120, y: cy },
        { x: worldWidth - 120, y: cy }
    ];
    const trialTankTypes = ['normal','ice','fire','buratino','toxic','plasma','musical','illuminat','mirror','egyptian','machinegun','waterjet','buckshot','electric','burovoy','burovoy','burovoy','imitator','robot','medical','mine','roman','pyro','spartan','air','kvant'];
    const typeColor = { normal:'#8B0000', ice:'#00BFFF', fire:'#FF4500', buratino:'#6E38B0', toxic:'#27ae60', plasma:'#8e44ad', musical:'#00ffff', illuminat:'#f39c12', mirror:'#bdc3c7', egyptian:'#c89b3c', machinegun:'#A0522D', waterjet:'#2e86c1', buckshot:'#455A64', electric:'#6c3483', burovoy:'#8b1e13', imitator:'#6c3483', robot:'#263238', pyro:'#8b2500', kvant:'#0d1b2a' };

    for (let i = 0; i < 7; i++) {
        const sp = spreadPositions[i];
        const pos = findFreeSpot(sp.x - 19, sp.y - 19, 38, 38, 600, 32) || sp;
        const tt = trialTankTypes[Math.floor(Math.random() * trialTankTypes.length)];
        enemies.push({
            x: pos.x, y: pos.y, w: 38, h: 38,
            color: typeColor[tt] || '#B22222',
            tankType: tt,
            hp: (tankMaxHpByType[tt] || window.mechMaxHpByType?.[tt] || 300),
            turretAngle: 0, baseAngle: 0, speed: (tankMaxSpeedByType[tt] || window.mechMaxSpeedByType?.[tt] || 3.2), trackOffset: 0,
            alive: true,
            team: i + 1,
            fireCooldown: 0, stuckCount: 0,
            dodgeAccuracy: 0.75 + Math.random() * 0.2,
            respawnCount: 0, paralyzed: false, paralyzedTime: 0
        });
    }

    for (let b = 0; b < 15; b++) {
        const rx = 180 + Math.random() * (worldWidth - 360);
        const ry = 180 + Math.random() * (worldHeight - 360);
        const type = Math.random() > 0.85 ? 'barrel' : 'box';
        const size = type === 'barrel' ? 50 : 40;
        const p = findFreeSpot(rx - size / 2, ry - size / 2, size, size, 800, 32);
        if (p) objects.push({ x: p.x, y: p.y, w: size, h: size, type, color: '#7a4a21' });
    }

    navNeedsRebuild = true;
}

function spawnOneVsAllMode() {
    enemies = [];
    allies = [];
    objects = objects || [];
    
    const cx = 100;
    const cy = 100;
    const ps = findFreeSpot(cx - 19, cy - 19, 38, 38, 800, 32) || { x: cx, y: cy };
    tank.x = ps.x; tank.y = ps.y; tank.team = 0;
    
    const botStartX = worldWidth * 0.85;
    const botTankTypes = ['normal','ice','fire','buratino','toxic','plasma','musical','illuminat','mirror','egyptian','machinegun','waterjet','buckshot','electric','burovoy','burovoy','burovoy','imitator','robot','medical','mine','pyro','spartan','air','mechDiy','mechShield','mechRocket','kvant'];
    const typeColors = { normal:'#8B0000', ice:'#00BFFF', fire:'#FF4500', buratino:'#6E38B0', toxic:'#27ae60', plasma:'#8e44ad', musical:'#00ffff', illuminat:'#f39c12', mirror:'#bdc3c7', egyptian:'#c89b3c', machinegun:'#A0522D', waterjet:'#2e86c1', buckshot:'#455A64', electric:'#6c3483', burovoy:'#8b1e13', imitator:'#6c3483', robot:'#263238', pyro:'#8b2500', mechDiy:'#1a8a3e', mechShield:'#1a3a6e', mechRocket:'#7d1f1f', kvant:'#0d1b2a' };
    
    for (let i = 0; i < 7; i++) {
        const angle = (i / 7) * Math.PI * 1.5 - Math.PI * 0.75;
        const radius = Math.min(worldWidth, worldHeight) * 0.25;
        const bx = botStartX + Math.cos(angle) * (radius * 0.5);
        const by = worldHeight / 2 + Math.sin(angle) * radius;
        
        const tt = botTankTypes[Math.floor(Math.random() * botTankTypes.length)];
        const bp = findFreeSpot(bx - 19, by - 19, 38, 38, 600, 24) || { x: bx, y: by };
        
        enemies.push({
            x: bp.x, y: bp.y, w: 38, h: 38,
            color: typeColors[tt] || '#B22222',
            tankType: tt,
            hp: (tankMaxHpByType[tt] || window.mechMaxHpByType?.[tt] || 300),
            turretAngle: Math.random() * Math.PI * 2, baseAngle: 0, speed: 2.5, trackOffset: 0,
            alive: true, team: 1,
            fireCooldown: Math.floor(Math.random() * 60), stuckCount: 0,
            dodgeAccuracy: 0.65 + Math.random() * 0.25,
            respawnCount: 0, paralyzed: false, paralyzedTime: 0,
            mirrorShieldActive: false, mirrorShieldTimer: 0, mirrorShieldCooldown: 0,
            megaGasUsed: false, plasmaBlastUsed: 0
        });
    }
    
    const coverCount = currentMode === 'onevsall' ? 30 : 80;
    for (let b = 0; b < coverCount; b++) {
        const rx = 200 + Math.random() * (worldWidth - 400);
        const ry = 200 + Math.random() * (worldHeight - 400);
        const type = Math.random() > 0.7 ? 'barrel' : 'box';
        const size = type === 'barrel' ? 50 : 40;
        const p = findFreeSpot(rx - size / 2, ry - size / 2, size, size, 600, 20);
        if (p) objects.push({ x: p.x, y: p.y, w: size, h: size, type, color: '#7a4a21' });
    }
    
    navNeedsRebuild = true;
}

function spawnBossFightMode() {
    enemies = [];
    allies = [];
    bossMeteors = [];

    tank.x = 120;
    tank.y = worldHeight / 2 - 19;
    tank.team = 0;
    setTankHP(tankType);
    
    if (godMode) {
        tank.hp = 100000;
        tank.maxHp = 100000;
    }
    
    tank.alive = true; tank.respawnTimer = 0; tank.respawnCount = 0;

    const boss = {
        x: 1600, y: worldHeight / 2 - 57,
        w: 114, h: 114,
        color: '#8B0000',
        tankType: 'boss_hell',
        isBoss: true, phase: 1,
        hp: 7500, maxHp: 7500,
        turretAngle: Math.PI, baseAngle: Math.PI,
        speed: 0.8, team: 99,
        fireCooldown: 0, meteorTimer: 120, miniTimer: 0,
        trackOffset: 0, alive: true, stuckCount: 0,
        paralyzed: false, paralyzedTime: 0, dodgeAccuracy: 0, respawnCount: 0,
        fireTrail: []
    };
    enemies.push(boss);
    navNeedsRebuild = true;
}

function spawnTrainingMode() {
    enemies = [];
    allies = [];
    trainingDummies = [];
    trainingRespawnTimers = [];

    tank.x = window.trainingSpawn.x; tank.y = window.trainingSpawn.y;
    tank.team = 0;
    setTankHP(tankType);
    tank.alive = true;

    const dummyPositions = [
        { x: 445, y: 230 }, { x: 690, y: 230 }, { x: 955, y: 230 },
        { x: 445, y: 385 }, { x: 690, y: 385 }, { x: 955, y: 385 },
        { x: 445, y: 540 }, { x: 690, y: 540 }, { x: 955, y: 540 },
        { x: 850, y: 1050 }, { x: 1030, y: 1190 },
        { x: 1750, y: 355, w: 88, h: 88, hp: 5000 }
    ];

    for (let i = 0; i < dummyPositions.length; i++) {
        const pos = dummyPositions[i];
        const dummy = {
            x: pos.x, y: pos.y, w: pos.w || 38, h: pos.h || 38,
            color: '#888888',
            tankType: 'dummy',
            hp: pos.hp || 300, maxHp: pos.hp || 300,
            turretAngle: 0, baseAngle: 0, speed: 0,
            alive: true,
            team: 99,
            fireCooldown: 9999, stuckCount: 0,
            dodgeAccuracy: 0,
            isDummy: true,
            dummyIndex: i,
            spawnX: pos.x, spawnY: pos.y,
        };
        enemies.push(dummy);
        trainingDummies.push(dummy);
        trainingRespawnTimers.push(0);
    }

    const shooterDummy = {
        x: 1980, y: 1100, w: 38, h: 38,
        color: '#880000',
        tankType: 'boss_dummy',
        hp: 1000, maxHp: 1000,
        turretAngle: Math.PI, baseAngle: Math.PI,
        speed: 0, alive: true,
        team: 1,
        fireCooldown: 80,
        stuckCount: 0, dodgeAccuracy: 0,
        isDummy: true, isShooterDummy: true,
        spawnX: 1980, spawnY: 1100,
    };
    enemies.push(shooterDummy);
    trainingShooterDummy = shooterDummy;
    trainingShooterTimer = 0;

    navNeedsRebuild = true;
}

// ─────────────────────────────────────────────────────────────────────────────
// BOSS FIGHT UPDATE LOGIC
// ─────────────────────────────────────────────────────────────────────────────

function updateBossFight() {
    const boss = enemies.find(e => e.isBoss && e.alive);
    if (!boss) return;
    const seesPlayer = tank.alive && GameTerrain.canSee(boss, tank, objects);

    if (boss.phase === 1 && boss.hp <= 5000) {
        boss.phase = 2;
        boss.speed = 1.0;
    }
    if (boss.phase === 2 && boss.hp <= 2500) {
        boss.phase = 3;
        boss.speed = 1.2;
    }

    if (seesPlayer) {
        const dx = (tank.x + 19) - (boss.x + 57);
        const dy = (tank.y + 19) - (boss.y + 57);
        const dist = Math.sqrt(dx * dx + dy * dy);
        boss.turretAngle = Math.atan2(dy, dx);
        if (dist > 260) {
            const nx = dx / dist, ny = dy / dist;
            boss.x += nx * GameTerrain.movementSpeed(boss.speed);
            boss.y += ny * GameTerrain.movementSpeed(boss.speed);
            boss.baseAngle = Math.atan2(ny, nx);
            
            if (boss.phase === 3) {
                boss.fireTrail.push({
                    x: boss.x + 57,
                    y: boss.y + 57,
                    life: 300
                });
            }
        }
    }

    if (!seesPlayer && GameTerrain.current() === 'night') {
        boss.searchAngle = (boss.searchAngle || boss.baseAngle || 0) + (Math.random() - 0.5) * 0.06;
        if (!moveSmallSteps(boss, boss.searchAngle, GameTerrain.movementSpeed(boss.speed) * 0.6)) boss.searchAngle += Math.PI / 2;
        boss.baseAngle = boss.searchAngle;
        boss.turretAngle = boss.searchAngle;
    }

    if (boss.fireTrail) {
        for (let i = boss.fireTrail.length - 1; i >= 0; i--) {
            const trail = boss.fireTrail[i];
            trail.life--;
            if (trail.life <= 0) {
                boss.fireTrail.splice(i, 1);
            }
        }
    }

    if (boss.fireCooldown > 0) boss.fireCooldown = Math.max(0, boss.fireCooldown - getEntityFireCooldownStep(boss));
    if (boss.fireCooldown <= 0 && seesPlayer) {
        const ang = boss.turretAngle;
        bullets.push({
            x: boss.x + 57 + Math.cos(ang) * 60, y: boss.y + 57 + Math.sin(ang) * 60,
            vx: Math.cos(ang) * 4.5, vy: Math.sin(ang) * 4.5,
            w: 14, h: 14,
            damage: 80, owner: 'enemy', team: 99, type: 'fire', life: 220
        });
        if (boss.phase === 3) {
            boss.fireCooldown = 50;
        } else if (boss.phase === 2) {
            boss.fireCooldown = 70;
        } else {
            boss.fireCooldown = 100;
        }
    }

    if (boss.meteorTimer > 0) boss.meteorTimer--;
    if (boss.meteorTimer <= 0 && seesPlayer) {
        const count = boss.phase === 3 ? 5 : (boss.phase === 2 ? 4 : 3);
        for (let i = 0; i < count; i++) {
            bossMeteors.push({
                x: tank.x + 19 + (Math.random() - 0.5) * 320,
                y: tank.y + 19 + (Math.random() - 0.5) * 320,
                warningTimer: 90, landed: false, fireTimer: 0
            });
        }
        if (boss.phase === 3) {
            boss.meteorTimer = 100;
        } else if (boss.phase === 2) {
            boss.meteorTimer = 120;
        } else {
            boss.meteorTimer = 180;
        }
    }

    if (boss.phase >= 2 && seesPlayer) {
        if (boss.miniTimer > 0) boss.miniTimer--;
        if (boss.miniTimer <= 0) {
            const miniCount = boss.phase === 3 ? 12 : 8;
            for (let i = 0; i < miniCount; i++) {
                const ang = (Math.PI * 2 / miniCount) * i;
                bullets.push({
                    x: boss.x + 57, y: boss.y + 57,
                    vx: Math.cos(ang) * 5, vy: Math.sin(ang) * 5,
                    w: 14, h: 14,
                    damage: 75, owner: 'enemy', team: 99,
                    type: 'meteorMini', life: 150
                });
            }
            boss.miniTimer = boss.phase === 3 ? 70 : 90;
        }
    }

    for (let i = bossMeteors.length - 1; i >= 0; i--) {
        const m = bossMeteors[i];
        if (!m.landed) {
            m.warningTimer--;
            if (m.warningTimer <= 0) {
                m.landed = true;
                m.fireTimer = 300;
                const damageAmount = boss.phase === 3 ? 200 : 150;
                if (tank.alive) {
                    const ddx = (tank.x + 19) - m.x, ddy = (tank.y + 19) - m.y;
                    if (Math.sqrt(ddx * ddx + ddy * ddy) < 80) {
                        if (!tank.mirrorShieldActive && !isPlayerDamageProtected())
                            tank.hp = Math.max(0, tank.hp - damageAmount);
                    }
                }
            }
        } else {
            m.fireTimer--;
            const dotChance = boss.phase === 3 ? 0.15 : 0.10;
            const dotDamage = boss.phase === 3 ? 12 : 8;
            if (m.fireTimer > 0 && tank.alive && Math.random() < dotChance) {
                const ddx = (tank.x + 19) - m.x, ddy = (tank.y + 19) - m.y;
                if (Math.sqrt(ddx * ddx + ddy * ddy) < 45) {
                    if (!tank.mirrorShieldActive && !isPlayerDamageProtected())
                        tank.hp = Math.max(0, tank.hp - dotDamage);
                }
            }
            if (m.fireTimer <= 0) bossMeteors.splice(i, 1);
        }
    }
}

// Export functions globally
window.generateMap = generateMap;
window.generateBossFightMap = generateBossFightMap;
window.generateTrainingMap = generateTrainingMap;
window.spawnAllies = spawnAllies;
window.spawnTeamMode = spawnTeamMode;
window.spawnDuelMode = spawnDuelMode;
window.spawnTrialMode = spawnTrialMode;
window.spawnOneVsAllMode = spawnOneVsAllMode;
window.spawnBossFightMode = spawnBossFightMode;
window.spawnTrainingMode = spawnTrainingMode;
window.updateBossFight = updateBossFight;
