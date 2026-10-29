const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const source = fs.readFileSync(path.join(__dirname, '..', 'src', 'mode-map.js'), 'utf8');
const solid = new Set(['wall', 'woodenWall', 'box', 'barrel']);
const overlaps = (a, b) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;

function mapContext(seed, width, height) {
    const random = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; };
    const context = vm.createContext({ window: {}, objects: [], enemies: [], allies: [],
        tank: { x: 120, y: 120, w: 38, h: 38 }, worldWidth: width, worldHeight: height,
        tankMaxHpByType: {}, navNeedsRebuild: false,
        Math: Object.assign(Object.create(Math), { random }), findFreeSpot: (x, y) => ({ x, y }) });
    vm.runInContext(source, context);
    return context;
}

function assertClear(context, width, height) {
    const obstacles = context.objects.filter(obj => solid.has(obj.type));
    for (let i = 0; i < obstacles.length; i++) {
        const obj = obstacles[i];
        assert.ok(obj.x >= 0 && obj.y >= 0 && obj.x + obj.w <= width && obj.y + obj.h <= height);
        for (let j = i + 1; j < obstacles.length; j++) {
            assert.equal(overlaps(obj, obstacles[j]), false, `${obj.type} at ${obj.x},${obj.y} overlaps ${obstacles[j].type} at ${obstacles[j].x},${obstacles[j].y}`);
        }
    }
    return obstacles;
}

test('random maps never stack stone walls, wooden walls and boxes in the same cell', () => {
    const found = new Set();
    for (const [width, height] of [[900, 700], [1234, 973], [2700, 2100]]) {
        for (let seed = 1; seed <= 30; seed++) {
            const context = mapContext(seed, width, height);
            context.generateMap();
            for (const obj of assertClear(context, width, height)) found.add(obj.type);
        }
    }
    for (const type of ['wall', 'woodenWall', 'box']) assert.ok(found.has(type), type);
});

test('boss obstacles do not overlap and all planned boxes and barrels are retained', () => {
    const context = mapContext(1, 1800, 1400);
    context.generateBossFightMap();
    const obstacles = assertClear(context, 1800, 1400);
    assert.equal(obstacles.filter(obj => obj.type === 'box').length, 30);
    assert.equal(obstacles.filter(obj => obj.type === 'barrel').length, 16);
    assert.ok(context.objects.some(obj => obj.type === 'hellLava'), 'ground decorations can remain under the arena');
});

test('training obstacles remain separate, including border and room walls', () => {
    const context = mapContext(1, 2300, 1550);
    context.generateTrainingMap();
    assertClear(context, 2300, 1550);
});


test('boss and training barrels occupy one map cell', () => {
    const boss = mapContext(1, 1800, 1400); boss.generateBossFightMap();
    assert.ok(boss.objects.filter(obj => obj.type === 'barrel').every(obj => obj.w === 50 && obj.h === 50));
    assertClear(boss, 1800, 1400);
    const training = mapContext(1, 2300, 1550); training.generateTrainingMap();
    assert.ok(training.objects.filter(obj => obj.type === 'barrel').every(obj => obj.w === 50 && obj.h === 50));
    assertClear(training, 2300, 1550);
});


test('regular mode spawning reserves the one-cell barrel footprint', () => {
    const main = fs.readFileSync(path.join(__dirname, '..', 'src', 'main.js'), 'utf8');
    for (let seed = 1; seed <= 15; seed++) {
        const context = mapContext(seed, 1700, 1300);
        context.checkRectCollision = overlaps;
        context.illusions = [];
        context.tankMaxSpeedByType = {};
        context.tankType = 'normal';
        context.setTankHP = () => {};
        const start = main.indexOf('function findFreeSpot('), end = main.indexOf('function sanitizeSpawnEntity(', start);
        vm.runInContext(main.slice(start, end), context);
        context.generateMap(); context.spawnDuelMode();
        const props = assertClear(context, 1700, 1300);
        for (const barrel of props.filter(obj => obj.type === 'barrel')) {
            assert.equal(barrel.w, 50); assert.equal(barrel.h, 50);
            assert.equal(overlaps(barrel, context.tank), false);
            assert.ok(context.enemies.every(enemy => !overlaps(barrel, enemy)));
        }
    }
});
