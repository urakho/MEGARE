const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const source = fs.readFileSync(path.join(__dirname, '..', 'src', 'bot.js'), 'utf8');

function makeNavigation(objects, width = 300, height = 250) {
    const context = vm.createContext({
        objects,
        worldWidth: width,
        worldHeight: height,
        navCell: 25,
        navCols: 0,
        navRows: 0,
        navGrid: null,
        navAgentW: 38,
        navAgentH: 38,
        navNeedsRebuild: true,
        checkRectCollision: (a, b) =>
            a.x < b.x + b.w && a.x + a.w > b.x &&
            a.y < b.y + b.h && a.y + a.h > b.y
    });
    vm.runInContext(source, context, { filename: 'bot.js' });
    return context;
}

test('navigation grid matches the full collision scan', () => {
    const objects = [
        { x: 24, y: 40, w: 53, h: 24, type: 'wall' },
        { x: 130, y: 52, w: 30, h: 95, type: 'woodenWall' },
        { x: 210, y: 170, w: 40, h: 40, type: 'box' },
        { x: 75, y: 175, w: 35, h: 35, type: 'barrel' }
    ];
    const nav = makeNavigation(objects);
    nav.buildNavGrid();
    for (let j = 0; j < nav.navRows; j++) {
        for (let i = 0; i < nav.navCols; i++) {
            const rect = { x: (i + 0.5) * 25 - 19, y: (j + 0.5) * 25 - 19, w: 38, h: 38 };
            const expected = rect.x < 0 || rect.y < 0 || rect.x + rect.w > 300 || rect.y + rect.h > 250 ||
                objects.some(obj => obj.type !== 'barrel' && nav.checkRectCollision(rect, obj));
            assert.equal(nav.navGrid[j * nav.navCols + i], Number(expected), `cell ${i},${j}`);
        }
    }
});

test('pathfinding routes around a wall and sees the changed map after rebuild', () => {
    const wall = { x: 125, y: 60, w: 25, h: 80, type: 'wall' };
    const nav = makeNavigation([wall], 300, 250);
    const pathAround = nav.findPath(50, 100, 250, 100);
    assert.ok(pathAround && pathAround.length > 1);
    for (const point of pathAround) {
        const rect = { x: point.x - 19, y: point.y - 19, w: 38, h: 38 };
        assert.equal(nav.checkRectCollision(rect, wall), false);
    }
    nav.objects.splice(0, 1);
    nav.buildNavGrid();
    const straightPath = nav.findPath(50, 100, 250, 100);
    assert.ok(straightPath);
    assert.ok(pathAround.some(point => point.y !== pathAround[0].y));
    assert.ok(straightPath.every(point => point.y === straightPath[0].y));
});

test('path obstacle prefilter keeps nearby objects and drops distant ones', () => {
    const near = { x: 65, y: 40, w: 20, h: 20, type: 'wall' };
    const far = { x: 250, y: 200, w: 20, h: 20, type: 'wall' };
    const nav = makeNavigation([near, far]);
    const candidates = nav.getPathObstacleCandidates({ x: 40, y: 40, w: 38, h: 38 }, 0, 80);
    assert.equal(candidates.length, 1);
    assert.equal(candidates[0], near);
});

test('path obstacle prefilter does not miss sampled collisions', () => {
    const objects = [];
    for (let i = 0; i < 60; i++) {
        objects.push({ x: (i * 61) % 300, y: (i * 43) % 250, w: 12 + i % 20, h: 10 + i % 15 });
    }
    const nav = makeNavigation(objects);
    const entity = { x: 110, y: 105, w: 38, h: 38 };
    for (let step = 0; step < 24; step++) {
        const angle = step * Math.PI / 12;
        const distance = 80;
        const candidates = nav.getPathObstacleCandidates(entity, angle, distance, 2);
        for (let sample = 0; sample <= 8; sample++) {
            const rect = {
                x: entity.x + Math.cos(angle) * distance * sample / 8 - 2,
                y: entity.y + Math.sin(angle) * distance * sample / 8 - 2,
                w: 42, h: 42
            };
            for (const obj of objects) {
                if (nav.checkRectCollision(rect, obj)) assert.ok(candidates.includes(obj));
            }
        }
    }
});

test('steering chooses the same direction as scanning all objects for each angle', () => {
    const objects = [];
    for (let i = 0; i < 300; i++) {
        objects.push({ x: (i * 79) % 900, y: (i * 113) % 700, w: 10 + i % 40, h: 12 + i % 25 });
    }
    const nav = makeNavigation(objects, 900, 700);
    const offsets = [0, Math.PI/12, -Math.PI/12, Math.PI/8, -Math.PI/8,
        Math.PI/6, -Math.PI/6, Math.PI/4, -Math.PI/4, Math.PI/3, -Math.PI/3,
        Math.PI/2, -Math.PI/2, 2*Math.PI/3, -2*Math.PI/3];
    for (let i = 0; i < 100; i++) {
        const unit = { x: 20 + (i * 59) % 820, y: 20 + (i * 47) % 620, w: 38, h: 38 };
        const angle = i * 0.17, dist = 2 + i % 20, lookDist = Math.max(dist * 4, 50);
        let bestAngle = angle, bestScore = -Infinity, bestClear = 0;
        for (const off of offsets) {
            const clear = nav.clearanceAhead(unit, angle + off, lookDist);
            const score = clear - Math.abs(off) * 25 * 0.4;
            if (score > bestScore) { bestScore = score; bestAngle = angle + off; bestClear = clear; }
        }
        const expectedDist = bestClear < lookDist * 0.3 ? Math.max(bestClear * 0.6, dist * 0.4) : dist;
        const result = nav.steerAroundObstacles(unit, angle, dist);
        assert.equal(result.angle, bestAngle, `angle for unit ${i}`);
        assert.equal(result.dist, expectedDist, `distance for unit ${i}`);
        objects[i].x += 20; // A moved object must be visible on the next call.
    }
});
