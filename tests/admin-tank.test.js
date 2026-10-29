const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

test('tank command unlocks one valid tank or mech, saves it, and rejects invalid names', () => {
    const source = fs.readFileSync(path.join(__dirname, '..', 'src', 'admin.js'), 'utf8');
    const helpContent = { textContent: '' }, helpModal = { style: {}, addEventListener() {} };
    const notifications = [], saved = [];
    const context = {
        window: { tankDescriptions: { normal: {}, myasnoy: {}, kamikaze: {} }, mechDescriptions: { mechDiy: {} } },
        document: { getElementById: id => ({ helpContent, helpModal }[id] || null) },
        unlockedTanks: ['normal'],
        saveProgress() { saved.push([...context.unlockedTanks]); },
        showNotification(text) { notifications.push(text); },
        console: { log() {} }
    };
    vm.runInNewContext(source, context);
    context.window.processDevCommand('/tank MEAT');
    context.window.processDevCommand('/tank MeChDiY');
    assert.deepEqual(context.unlockedTanks, ['normal', 'myasnoy', 'mechDiy']);
    assert.equal(saved.length, 2);
    context.window.processDevCommand('/tank myasnoy');
    context.window.processDevCommand('/tank nonexistent');
    context.window.processDevCommand('/tank ice extra');
    assert.equal(saved.length, 2);
    assert.equal(context.unlockedTanks.length, 3);
    assert.ok(notifications.some(message => message.includes('Неизвестный танк')));
    context.window.processDevCommand('/tank list');
    assert.match(helpContent.textContent, /myasnoy/);
    assert.match(helpContent.textContent, /mechDiy/);
    assert.equal(helpModal.style.display, 'flex');
});
