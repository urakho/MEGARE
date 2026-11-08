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

test('chips command updates and saves a nonnegative token balance', () => {
    const source = fs.readFileSync(path.join(__dirname, '..', 'src', 'admin.js'), 'utf8');
    const saved = [];
    let updates = 0;
    const context = {
        window: {}, document: { getElementById: () => null }, tokens: 10,
        updateCoinDisplay() { updates++; },
        saveProgress() { saved.push(context.tokens); },
        console: { log() {} }
    };
    vm.runInNewContext(source, context);
    for (const command of ['/chips 50', '/chips - 15', '/chips = 7', '/chips - 100']) {
        context.window.processDevCommand(command);
    }
    assert.deepEqual(saved, [60, 45, 7, 0]);
    assert.equal(updates, 4);
    for (const command of ['/chips', '/chips -2', '/chips 1.5', '/chips 10 extra', '/chips 1e3']) {
        context.window.processDevCommand(command);
    }
    assert.equal(context.tokens, 0);
    assert.equal(saved.length, 4);
});

test('icons command unlocks unique icons without losing existing profile progress', () => {
    const source = fs.readFileSync(path.join(__dirname, '..', 'src', 'admin.js'), 'utf8');
    const data = new Map([['tankAvatarUnlocks', JSON.stringify(['rare-owned', 'epic-one'])]]);
    let savedAchievements, savedProgress;
    const context = {
        window: {}, document: { getElementById: () => null },
        achievementData: { claimed: { existing: true }, completed: { old: true } },
        PROFILE_AVATAR_TIERS: { unique: ['epic-one', 'epic-two'] },
        localStorage: { setItem: (key, value) => data.set(key, value) },
        _getAvatarUnlocks: () => JSON.parse(data.get('tankAvatarUnlocks')),
        saveAchievements() { savedAchievements = JSON.stringify(context.achievementData); },
        saveProgress() { savedProgress = data.get('tankAvatarUnlocks'); },
        console: { log() {} }
    };
    vm.runInNewContext(source, context);
    context.window.processDevCommand('/icons');
    context.window.processDevCommand('/icons');
    assert.deepEqual(JSON.parse(savedProgress), ['rare-owned', 'epic-one', 'epic-two']);
    const achievements = JSON.parse(savedAchievements);
    assert.equal(achievements.completed.old, true);
    assert.equal(achievements.claimed.existing, true);
    for (const id of ['icon_rome', 'icon_time', 'icon_imit', 'icon_tank', 'icon_economy_veteran', 'easter_red-egg', 'easter_gre-egg', 'easter_blu-egg', 'easter_gold-egg', 'easter_fire-egg', 'easter_chik-egg', 'easter_eas-rabbit', 'easter_kulich']) {
        assert.equal(achievements.claimed[id], true, id);
    }
});

test('icons command unlocks only the requested category and rejects invalid arguments', () => {
    const source = fs.readFileSync(path.join(__dirname, '..', 'src', 'admin.js'), 'utf8');
    const data = new Map([['tankAvatarUnlocks', JSON.stringify(['existing'])]]);
    const notifications = [];
    let saves = 0;
    const context = {
        window: {}, document: { getElementById: () => null },
        achievementData: { claimed: { existing: true } },
        PROFILE_AVATAR_TIERS: { rare: ['rare-one'], unique: ['epic-one'], animated: ['animated-one'] },
        localStorage: { setItem: (key, value) => data.set(key, value) },
        _getAvatarUnlocks: () => JSON.parse(data.get('tankAvatarUnlocks')),
        saveAchievements() {}, saveProgress() { saves++; },
        showNotification: message => notifications.push(message), console: { log() {} }
    };
    vm.runInNewContext(source, context);
    context.window.processDevCommand('/icons RARE');
    context.window.processDevCommand('/icons rare');
    assert.deepEqual(JSON.parse(data.get('tankAvatarUnlocks')), ['existing', 'rare-one']);
    assert.deepEqual(context.achievementData.claimed, { existing: true });
    context.window.processDevCommand('/icons epic');
    assert.deepEqual(JSON.parse(data.get('tankAvatarUnlocks')), ['existing', 'rare-one', 'epic-one']);
    context.window.processDevCommand('/icons animated');
    assert.deepEqual(JSON.parse(data.get('tankAvatarUnlocks')), ['existing', 'rare-one', 'epic-one', 'animated-one']);
    context.window.processDevCommand('/icons unique');
    assert.equal(context.achievementData.claimed.icon_rome, true);
    context.window.processDevCommand('/icons all');
    assert.deepEqual(JSON.parse(data.get('tankAvatarUnlocks')), ['existing', 'rare-one', 'epic-one', 'animated-one']);
    const before = saves;
    context.window.processDevCommand('/icons unknown');
    context.window.processDevCommand('/icons common');
    context.window.processDevCommand('/icons rare extra');
    assert.equal(saves, before);
    assert.ok(notifications.some(message => message.includes('rare, epic')));
});
