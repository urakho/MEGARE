const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const physics = fs.readFileSync(path.join(__dirname, '..', 'src', 'physics.js'), 'utf8');
const start = physics.indexOf('function checkRectCollision(');
const end = physics.indexOf('function circleIntersectsRect(', start);
const context = vm.createContext({
    isBlockingTerrainObject: obj => ['wall', 'woodenWall', 'box', 'barrel'].includes(obj.type)
});
vm.runInContext(physics.slice(start, end), context);

test('terrain index finds the same bullet collisions in the same order', () => {
    const types = ['wall', 'woodenWall', 'box', 'barrel', 'explosion'];
    const objects = [];
    for (let i = 0; i < 100; i++) {
        objects.push({
            x: (i * 71) % 610 - 25,
            y: (i * 47) % 430 - 25,
            w: 15 + (i % 5) * 9,
            h: 12 + (i % 4) * 13,
            type: types[i % types.length]
        });
    }
    const index = context.buildTerrainCollisionIndex(objects);
    for (let y = -25; y < 450; y += 17) {
        for (let x = -25; x < 630; x += 19) {
            const bullet = { x, y, w: 8, h: 8 };
            const expected = objects.filter(obj =>
                context.isBlockingTerrainObject(obj) && context.checkRectCollision(bullet, obj));
            const actual = Array.from(context.queryTerrainCollisionIndex(index, bullet)).filter(obj =>
                objects.includes(obj) && context.checkRectCollision(bullet, obj));
            assert.deepEqual(actual, expected, `bullet at ${x},${y}`);
        }
    }
    const removed = objects[0];
    objects.splice(0, 1);
    const bullet = { x: removed.x, y: removed.y, w: 8, h: 8 };
    assert.ok(!context.queryTerrainCollisionIndex(index, bullet)
        .filter(obj => objects.includes(obj)).includes(removed));
});
