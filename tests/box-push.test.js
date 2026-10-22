const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const physics = fs.readFileSync(path.join(__dirname, '..', 'src', 'physics.js'), 'utf8');
const bot = fs.readFileSync(path.join(__dirname, '..', 'src', 'bot.js'), 'utf8');

function setup(boxes, extra = {}) {
    const context = {
        tank: { x: 0, y: 0, w: 20, h: 20, alive: true },
        objects: boxes,
        enemies: [], allies: [], illusions: [],
        worldWidth: 1000, worldHeight: 1000,
        navNeedsRebuild: false,
        Math: Object.assign(Object.create(Math), { random: () => 0 }),
        checkRectCollision: (a, b) => a.x < b.x + b.w && a.x + a.w > b.x &&
            a.y < b.y + b.h && a.y + a.h > b.y,
        canBurovoyPhaseThroughWalls: () => false,
        spawnParticle() {},
        ...extra
    };
    const start = physics.indexOf('// Return the first contact along a movement vector.');
    assert.ok(start >= 0);
    vm.runInNewContext(physics.slice(start), context);
    const botStart = bot.indexOf('function moveSmallSteps(');
    const botEnd = bot.indexOf('// Добавляем функцию для рисования отладочных линий', botStart);
    assert.ok(botStart >= 0 && botEnd > botStart);
    vm.runInNewContext(bot.slice(botStart, botEnd), context);
    const rescueStart = physics.indexOf('(function rescueStuckTank()');
    const rescueEnd = physics.indexOf('})();', rescueStart) + 4;
    assert.ok(rescueStart >= 0 && rescueEnd > rescueStart);
    vm.runInNewContext(`function runRescue() { ${physics.slice(rescueStart, rescueEnd)} }`, context);
    return context;
}

const box = (x, y = 0) => ({ type: 'box', x, y, w: 20, h: 20 });
const close = (actual, expected) => assert.ok(Math.abs(actual - expected) < 1e-6,
    `${actual} should equal ${expected}`);

test('one, two, and three touching boxes scale the entire pushed chain', () => {
    for (const [count, expected] of [[1, 10], [2, 9], [3, 8.1]]) {
        const boxes = Array.from({ length: count }, (_, i) => box(20 + i * 20));
        const game = setup(boxes);
        game.moveWithCollision(10, 0);
        close(game.tank.x, expected);
        boxes.forEach((item, i) => close(item.x, 20 + i * 20 + expected));
    }
});

test('a box joins only after the preceding box reaches it', () => {
    const boxes = [box(20), box(45)];
    const game = setup(boxes);
    game.moveWithCollision(4, 0);
    close(game.tank.x, 4);
    close(boxes[0].x, 24);
    close(boxes[1].x, 45);
    game.moveWithCollision(4, 0);
    close(game.tank.x, 7.7);
    close(boxes[0].x, 27.7);
    close(boxes[1].x, 47.7);
});

test('boxes beside the push direction do not move and a wall stops the chain', () => {
    const boxes = [box(20), box(40), box(20, 20)];
    const game = setup(boxes);
    game.moveWithCollision(10, 0);
    close(boxes[2].x, 20);
    boxes.push({ type: 'wall', x: 70, y: 0, w: 20, h: 20 });
    game.moveWithCollision(20, 0);
    close(boxes[0].x, 30);
    close(boxes[1].x, 50);
    close(game.tank.x, 10);
});

test('boxes with less than one twelfth of a side in common block the row', () => {
    const boxes = [box(20, 20), box(40, 1), box(40, 39), box(20, 40)];
    const game = setup(boxes);
    game.tank.y = 20;
    game.moveWithCollision(10, 0);
    close(game.tank.x, 0);
    close(boxes[0].x, 20);
    close(boxes[1].x, 40);
    close(boxes[2].x, 40);
    close(boxes[3].x, 20);
});

test('a box with insufficient side overlap stays still even after the gap closes', () => {
    const boxes = [box(20, 20), box(45, 39)];
    const game = setup(boxes);
    game.tank.y = 20;
    game.moveWithCollision(10, 0);
    close(game.tank.x, 5);
    close(boxes[0].x, 25);
    close(boxes[1].x, 45);
    assert.equal(game.checkRectCollision(boxes[0], boxes[1]), false);
});

test('exactly one twelfth of a shared side transfers the push in every direction', () => {
    const cases = [
        { tankX: 0, tankY: 24, firstX: 24, firstY: 24, nextX: 48, nextY: 46, dx: 10, dy: 0 },
        { tankX: 72, tankY: 24, firstX: 48, firstY: 24, nextX: 24, nextY: 46, dx: -10, dy: 0 },
        { tankX: 24, tankY: 0, firstX: 24, firstY: 24, nextX: 46, nextY: 48, dx: 0, dy: 10 },
        { tankX: 24, tankY: 72, firstX: 24, firstY: 48, nextX: 46, nextY: 24, dx: 0, dy: -10 }
    ];
    for (const sample of cases) {
        const first = { type: 'box', x: sample.firstX, y: sample.firstY, w: 24, h: 24 };
        const next = { type: 'box', x: sample.nextX, y: sample.nextY, w: 24, h: 24 };
        const game = setup([first, next], {
            tank: { x: sample.tankX, y: sample.tankY, w: 24, h: 24, alive: true }
        });
        game.moveWithCollision(sample.dx, sample.dy);
        close(game.tank.x, sample.tankX + sample.dx * 0.9);
        close(game.tank.y, sample.tankY + sample.dy * 0.9);
        close(first.x, sample.firstX + sample.dx * 0.9);
        close(first.y, sample.firstY + sample.dy * 0.9);
        close(next.x, sample.nextX + sample.dx * 0.9);
        close(next.y, sample.nextY + sample.dy * 0.9);
    }
});

test('tank touching halves of two boxes pushes both straight rows together', () => {
    const boxes = [box(20, 10), box(20, 30), box(40, 10), box(40, 30)];
    const game = setup(boxes);
    game.tank.y = 20;
    game.moveWithCollision(10, 0);
    close(game.tank.x, 7.29);
    close(boxes[0].x, 27.29);
    close(boxes[1].x, 27.29);
    close(boxes[2].x, 47.29);
    close(boxes[3].x, 47.29);
});

test('two vertical rows move together when the tank touches both', () => {
    const boxes = [box(10, 20), box(30, 20), box(10, 40), box(30, 40)];
    const game = setup(boxes);
    game.tank.x = 20;
    game.moveWithCollision(0, 10);
    close(game.tank.y, 7.29);
    close(boxes[0].y, 27.29);
    close(boxes[1].y, 27.29);
    close(boxes[2].y, 47.29);
    close(boxes[3].y, 47.29);
});

test('downward push works with the actual 38-pixel tank and 50-pixel map boxes', () => {
    const boxes = [
        { type: 'box', x: 0, y: 50, w: 50, h: 50 },
        { type: 'box', x: 50, y: 50, w: 50, h: 50 },
        { type: 'box', x: 0, y: 100, w: 50, h: 50 },
        { type: 'box', x: 50, y: 100, w: 50, h: 50 }
    ];
    const game = setup(boxes, { tank: { x: 31, y: 12, w: 38, h: 38, alive: true } });
    game.moveWithCollision(0, 3);
    close(game.tank.y, 12 + 3 * 0.729);
    boxes.forEach((item, i) => close(item.y, (i < 2 ? 50 : 100) + 3 * 0.729));
});

test('repeated downward pushing of two map-sized rows stays smooth', () => {
    const boxes = [
        { type: 'box', x: 0, y: 50, w: 50, h: 50 },
        { type: 'box', x: 50, y: 50, w: 50, h: 50 },
        { type: 'box', x: 0, y: 100, w: 50, h: 50 },
        { type: 'box', x: 50, y: 100, w: 50, h: 50 }
    ];
    const game = setup(boxes, { tank: { x: 31, y: 12, w: 38, h: 38, alive: true } });
    for (let i = 0; i < 60; i++) {
        const before = game.tank.y;
        game.moveWithCollision(0, 3);
        close(game.tank.y - before, 3 * 0.729);
        assert.equal(game.checkRectCollision(game.tank, boxes[0]), false);
        assert.equal(game.checkRectCollision(game.tank, boxes[1]), false);
    }
});

test('downward push accepts a slightly shifted box in the same visible row', () => {
    const boxes = [
        { type: 'box', x: 0, y: 50, w: 50, h: 50 },
        { type: 'box', x: 3, y: 100, w: 50, h: 50 }
    ];
    const game = setup(boxes, { tank: { x: 6, y: 12, w: 38, h: 38, alive: true } });
    game.moveWithCollision(0, 3);
    close(game.tank.y, 14.7);
    close(boxes[0].y, 52.7);
    close(boxes[1].y, 102.7);
});

test('two slightly shifted rows still move down together', () => {
    const boxes = [
        { type: 'box', x: 0, y: 50, w: 50, h: 50 },
        { type: 'box', x: 50, y: 50, w: 50, h: 50 },
        { type: 'box', x: 3, y: 100, w: 50, h: 50 },
        { type: 'box', x: 53, y: 100, w: 50, h: 50 }
    ];
    const game = setup(boxes, { tank: { x: 31, y: 12, w: 38, h: 38, alive: true } });
    game.moveWithCollision(0, 3);
    close(game.tank.y, 12 + 3 * 0.729);
    boxes.forEach((item, i) => close(item.y, (i < 2 ? 50 : 100) + 3 * 0.729));
});

test('boxes can be pushed in every axis direction without jumping', () => {
    for (const [dx, dy, x, y] of [[10, 0, 20, 0], [-10, 0, 60, 0],
        [0, 10, 0, 20], [0, -10, 0, 60]]) {
        const first = box(x, y);
        const second = box(x + Math.sign(dx) * 20, y + Math.sign(dy) * 20);
        const game = setup([first, second]);
        game.tank.x = dx < 0 ? 80 : 0;
        game.tank.y = dy < 0 ? 80 : 0;
        game.moveWithCollision(dx, dy);
        close(first.x, x + dx * 0.9);
        close(first.y, y + dy * 0.9);
        close(second.x, x + Math.sign(dx) * 20 + dx * 0.9);
        close(second.y, y + Math.sign(dy) * 20 + dy * 0.9);
    }
});

test('bot uses the same chain speed and only moves boxes it reaches', () => {
    const boxes = [box(20), box(40)];
    const game = setup(boxes, { tank: { x: 200, y: 200, w: 20, h: 20, alive: true } });
    const botTank = { x: 0, y: 0, w: 20, h: 20, alive: true };
    assert.equal(game.moveSmallSteps(botTank, 0, 10), true);
    close(botTank.x, 9);
    close(boxes[0].x, 29);
    close(boxes[1].x, 49);
});

test('bot movement does not repeat a full step for the remaining fraction', () => {
    const game = setup([], { tank: { x: 200, y: 200, w: 20, h: 20, alive: true } });
    const botTank = { x: 0, y: 0, w: 20, h: 20, alive: true };
    assert.equal(game.moveSmallSteps(botTank, 0, 11), true);
    close(botTank.x, 11);

    const boxes = [box(20), box(40)];
    const pushingGame = setup(boxes, { tank: { x: 200, y: 200, w: 20, h: 20, alive: true } });
    const pushingBot = { x: 0, y: 0, w: 20, h: 20, alive: true };
    assert.equal(pushingGame.moveSmallSteps(pushingBot, 0, 11), true);
    close(pushingBot.x, 9.9);
    close(boxes[0].x, 29.9);
    close(boxes[1].x, 49.9);
});

test('repeated pushing keeps every step bounded and boxes face to face', () => {
    const boxes = [box(20), box(40), box(60)];
    const game = setup(boxes);
    for (let i = 0; i < 40; i++) {
        const previous = game.tank.x;
        game.moveWithCollision(4, 0);
        assert.ok(game.tank.x >= previous && game.tank.x - previous <= 4);
        assert.equal(game.checkRectCollision(game.tank, boxes[0]), false,
            `player overlaps the box after push ${i}`);
        close(game.tank.x + game.tank.w, boxes[0].x);
        close(boxes[0].x + boxes[0].w, boxes[1].x);
        close(boxes[1].x + boxes[1].w, boxes[2].x);
    }
    close(game.tank.x, 40 * 4 * 0.81);
});

test('diagonal bot pushing keeps contact without overlapping the boxes', () => {
    const boxes = [box(20), box(40)];
    const game = setup(boxes, { tank: { x: 500, y: 500, w: 20, h: 20, alive: true } });
    const botTank = { x: 0, y: 0, w: 20, h: 20, alive: true };
    for (let i = 0; i < 25; i++) {
        const beforeX = botTank.x;
        const beforeY = botTank.y;
        assert.equal(game.moveSmallSteps(botTank, 0.1, 3), true);
        assert.ok(Math.hypot(botTank.x - beforeX, botTank.y - beforeY) <= 3 + 1e-6);
        assert.equal(game.checkRectCollision(botTank, boxes[0]), false);
        assert.equal(game.checkRectCollision(boxes[0], boxes[1]), false);
    }
});

test('subpixel overlap is corrected locally instead of triggering random rescue teleport', () => {
    const obstacle = box(59.999999999, 40);
    let searches = 0;
    const game = setup([obstacle], {
        tank: { x: 40, y: 40, w: 20, h: 20, alive: true },
        isBurovoyBurrowActive: () => false,
        isEntityPlacementFree: (entity, x, y) => x >= 0 && y >= 0 &&
            x + entity.w <= 1000 && y + entity.h <= 1000 &&
            !((x < obstacle.x + obstacle.w && x + entity.w > obstacle.x) &&
                (y < obstacle.y + obstacle.h && y + entity.h > obstacle.y)),
        findFreeSpot: () => { searches++; return { x: 400, y: 400 }; }
    });
    assert.equal(game.checkRectCollision(game.tank, obstacle), true);
    game.runRescue();
    assert.equal(searches, 0);
    assert.equal(game.checkRectCollision(game.tank, obstacle), false);
    assert.ok(Math.abs(game.tank.x - 40) < 1e-6);
});
