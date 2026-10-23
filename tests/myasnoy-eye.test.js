const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const main = fs.readFileSync(path.join(__dirname, '..', 'src', 'main.js'), 'utf8');

test('myasnoy eye only damages targets inside the area already swept by its visible beam', () => {
    const start = main.indexOf('const MYASNOY_EYE_ATTACK_DURATION =');
    const end = main.indexOf('function resetTankMatchUltState(', start);
    assert.ok(start >= 0 && end > start);

    const unit = {
        x: 0, y: 0, w: 38, h: 38, team: 0,
        turretAngle: 0, myasnoyAttackAngle: 0, myasnoyAttackTimer: 18,
        myasnoyAttackHitTargets: new Set()
    };
    const targetAt = (angle) => ({
        x: 19 + Math.cos(angle) * 60 - 5,
        y: 19 + Math.sin(angle) * 60 - 5,
        w: 10, h: 10, hp: 200, alive: true
    });
    const first = targetAt(-1.95);
    const middle = targetAt(0);
    const last = targetAt(1.5);
    const outside = targetAt(2.5);
    const box = { ...targetAt(0), type: 'box' };
    const context = vm.createContext({
        enemies: [first, middle, last, outside], objects: [box],
        navNeedsRebuild: false,
        getPlayerDmgMult: () => 1,
        forEachHostileDrone: () => {},
        spawnParticle: () => {}
    });
    vm.runInContext(main.slice(start, end), context);

    context.updateMyasnoyEyeAttackSweep(unit);
    assert.equal(first.hp, 100);
    assert.equal(middle.hp, 200);
    assert.equal(last.hp, 200);
    assert.equal(context.objects.length, 1);

    unit.turretAngle = Math.PI;
    unit.myasnoyAttackTimer = 9;
    context.updateMyasnoyEyeAttackSweep(unit);
    assert.equal(first.hp, 100);
    assert.equal(middle.hp, 100);
    assert.equal(context.objects.length, 0);

    unit.myasnoyAttackTimer = 1;
    context.updateMyasnoyEyeAttackSweep(unit);
    assert.equal(last.hp, 100);
    assert.equal(outside.hp, 200);
    assert.equal(middle.hp, 100);
});
