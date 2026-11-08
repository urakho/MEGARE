const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const main = fs.readFileSync(path.join(__dirname, '..', 'src', 'main.js'), 'utf8');
const physics = fs.readFileSync(path.join(__dirname, '..', 'src', 'physics.js'), 'utf8');
const pause = fs.readFileSync(path.join(__dirname, '..', 'src', 'pause-menu.js'), 'utf8');

function section(source, start, end) {
    const from = source.indexOf(start);
    const to = source.indexOf(end, from + start.length);
    assert.ok(from >= 0 && to > from, `Missing section: ${start}`);
    return source.slice(from, to);
}

function storage() {
    const data = new Map();
    return {
        getItem: key => data.has(key) ? data.get(key) : null,
        setItem: (key, value) => data.set(key, String(value)),
        removeItem: key => data.delete(key)
    };
}

test('cosmetic shop provides twenty unique titles without reusing tank titles', () => {
    const ctx = vm.createContext({ window: {} });
    vm.runInContext(section(main, 'const COSMETIC_SHOP_TITLES =', '// Trophies threshold'), ctx);
    const shop = Object.values(ctx.window.COSMETIC_SHOP_TITLES).map(title => title.name);
    const tanks = Object.values(ctx.window.TANK_ATMOSPHERIC_TITLES).map(title => title.name);
    assert.equal(shop.length, 20);
    assert.equal(new Set(shop).size, 20);
    assert.ok(shop.every(name => !tanks.includes(name)));
    vm.runInContext(section(main, 'function _getAtmosphericTitle(', '// Unlock the tank-specific title'), ctx);
    assert.equal(ctx.window._getTitleLabel('shop-steel-storm'), '«Стальной шторм»');
    assert.equal(ctx.window._getAtmosphericTitleColor('shop-steel-storm'), '#9ebad1');
});

test('tank titles are restored from trophies and saved for the active profile', () => {
    const localStorage = storage();
    localStorage.setItem('tankTrophiesData', JSON.stringify({ normal: 7999, fire: 8000 }));
    localStorage.setItem('playerTitleUnlocks', JSON.stringify(['shop-steel-storm']));
    const snapshots = [];
    const elements = [];
    const document = {
        getElementById: id => id === 'profileEditTitleSection' ? elements[0] : null,
        createElement: () => ({ style: {}, dataset: {}, children: [], appendChild(child) { this.children.push(child); } })
    };
    elements.push(document.createElement('div'));
    const ctx = vm.createContext({ localStorage, document, window: { saveActiveProfile() {
        snapshots.push(localStorage.getItem('playerTitleUnlocks'));
    } }, console, escapeHtml: value => value, showNotification() {} });
    vm.runInContext(section(main, 'const COSMETIC_SHOP_TITLES =', 'function _profilesLoad()'), ctx);
    vm.runInContext(section(main, 'function _getUnlockedTitles()', 'function addIndividualTankTrophies('), ctx);
    assert.deepEqual(JSON.parse(localStorage.getItem('playerTitleUnlocks')), ['shop-steel-storm', 'fire']);
    assert.deepEqual(JSON.parse(snapshots[0]), ['shop-steel-storm', 'fire']);

    localStorage.setItem('tankTrophiesData', JSON.stringify({ normal: 8000, fire: 8000 }));
    vm.runInContext(section(main, 'function _buildTitleSelect()', '// Handle title selection'), ctx);
    ctx._buildTitleSelect();
    assert.deepEqual(JSON.parse(localStorage.getItem('playerTitleUnlocks')), ['shop-steel-storm', 'fire', 'normal']);
    assert.deepEqual(JSON.parse(snapshots.at(-1)), ['shop-steel-storm', 'fire', 'normal']);
    const cards = elements[0].children[1].children;
    assert.ok(cards.some(card => card.dataset.titleId === 'normal' && card.innerHTML.includes('Выживший')));
    assert.ok(cards.some(card => card.dataset.titleId === 'fire' && card.innerHTML.includes('Испепелитель')));
    assert.ok(cards.some(card => card.dataset.titleId === 'shop-steel-storm'));
});

test('profile avatar artwork resolves saved presets and special icons without changing their identifiers', () => {
    const ctx = vm.createContext({ escapeHtml: value => value });
    vm.runInContext(section(main, 'function _isSmallEgg(av)', '// Get the tier of a preset avatar'), ctx);
    const avatars = vm.runInContext('[...PROFILE_AVATAR_TIERS.common, ...PROFILE_AVATAR_TIERS.rare, ...PROFILE_AVATAR_TIERS.unique].filter(id => !id.startsWith("new-icon:"))', ctx);
    assert.equal(avatars.length, 100);
    avatars.forEach((avatar, index) => {
        const markup = ctx.profileAvatarMarkup(avatar, 36);
        const sheet = Math.floor(index / 20) + 1;
        const cell = index % 20;
        assert.ok(markup.includes(`profile-icons-${sheet}.png`));
        assert.ok(markup.includes(`background-position:${cell % 5 * 25}% ${Math.floor(cell / 5) * 100 / 3}%`));
        assert.ok(fs.existsSync(path.join(__dirname, '..', 'pictures', 'png', 'icons-png', 'profile icons', `profile-icons-${sheet}.png`)));
    });
    const special = ['rome', 'time', 'imit', 'tank', 'red-egg', 'gre-egg', 'blu-egg', 'gold-egg', 'fire-egg', 'chik-egg', 'eas-rabbit', 'kulich', 'economy-veteran'];
    special.forEach((name, index) => {
        const markup = ctx.profileAvatarMarkup('img:' + name, 36);
        assert.ok(markup.includes('profile-avatar-special-image'));
        assert.ok(markup.includes(`background-position:${(index % 4) * 100 / 3}% ${Math.floor(index / 4) * 100 / 3}%`));
    });
    assert.ok(fs.existsSync(path.join(__dirname, '..', 'pictures', 'png', 'icons-png', 'profile icons', 'profile-special-icons.png')));
    assert.ok(ctx.profileAvatarMarkup('img:legacy', 36).includes('png/icon-png/legacy.png'));
    const animated = vm.runInContext('PROFILE_AVATAR_TIERS.animated.filter(id => !id.startsWith("new-icon:"))', ctx);
    assert.equal(animated.length, 12);
    for (const [index, avatar] of animated.entries()) {
        assert.ok(ctx.profileAvatarMarkup(avatar, 36).includes('profile-avatar-animated'));
        assert.ok(ctx.profileAvatarMarkup(avatar, 36).includes('<svg'));
        assert.ok(ctx.profileAvatarMarkup(avatar, 36).includes('profile-avatar-animated--' + avatar.slice(9)));
        assert.ok(ctx.profileAvatarMarkup(avatar, 36).includes(index < 6 ? 'profile-animated-icons.png' : 'profile-animated-icons-2.png'));
    }
    assert.ok(fs.existsSync(path.join(__dirname, '..', 'pictures', 'png', 'icons-png', 'profile icons', 'profile-animated-icons-2.png')));
    for (const tier of ['common', 'rare', 'unique', 'animated']) {
        const ids = vm.runInContext(`PROFILE_AVATAR_TIERS.${tier}.filter(id => id.startsWith('new-icon:'))`, ctx);
        assert.equal(ids.length, 6);
        for (const id of ids) assert.ok(ctx.profileAvatarMarkup(id, 36).includes(`profile-new-${tier}.png`));
        assert.ok(fs.existsSync(path.join(__dirname, '..', 'pictures', 'png', 'icons-png', 'profile icons', `profile-new-${tier}.png`)));
    }
});

function profileContext(localStorage) {
    const context = vm.createContext({ localStorage, window: {}, console });
    vm.runInContext(section(main, 'const PROFILE_SAVE_KEYS = [', '// Atmospheric titles'), context);
    vm.runInContext(section(main, 'function _profilesLoad()', '/** Switch to profile'), context);
    vm.runInContext(`let coins = Number(localStorage.getItem('tankCoins') ?? 100), tokens = Number(localStorage.getItem('tankTokens') ?? 0), gems = 0,
        parts = Number(localStorage.getItem('tankParts') ?? 100), trophies = 0;
        let claimedRewards = [], unlockedTanks = ['normal'],
        tankUpgrades = JSON.parse(localStorage.getItem('tankUpgrades') || '{}');`, context);
    vm.runInContext(section(main, 'function saveTankUpgrades()', '// Returns damage multiplier'), context);
    vm.runInContext(section(main, 'function saveProgress()', '// Camera follow flag'), context);
    return context;
}

test('profile reload preserves purchased upgrades and selected tank', () => {
    const localStorage = storage();
    const ctx = profileContext(localStorage);
    Object.assign(ctx, {
        document: { querySelectorAll: () => [], getElementById: () => null },
        tank: {}, setTankHP: () => {}, setTankSpeed: () => {}
    });
    vm.runInContext("let tankType = 'normal', tankColor = '';", ctx);
    vm.runInContext(section(main, 'window.setSelectedTank = function(selectedType)', '// Function to get current tank type'), ctx);
    vm.runInContext(`parts -= 50; localStorage.setItem('tankParts', parts);
        tankUpgrades.normal = { hp: 1 }; saveTankUpgrades();
        window.setSelectedTank('ice');`, ctx);
    profileContext(localStorage);
    assert.equal(localStorage.getItem('tankParts'), '50');
    assert.deepEqual(JSON.parse(localStorage.getItem('tankUpgrades')), { normal: { hp: 1 } });
    assert.equal(localStorage.getItem('tankSelected'), 'ice');
});

test('profile backgrounds stay with their profile across creation, edits and reloads', () => {
    const localStorage = storage();
    let ctx = profileContext(localStorage);
    ctx.window.location = { pathname: '/index.html', replace() {} };
    vm.runInContext(section(main, 'window.createProfile =', '/** Get active profile index'), ctx);
    assert.equal(ctx.window.getProfileList()[0].background, 'default');
    ctx.window.editProfile(0, 'First', '🎮', 'forest');
    ctx.window.createProfile('Second', '🎮', 'arctic');
    ctx = profileContext(localStorage);
    ctx.window.location = { pathname: '/index.html', replace() {} };
    vm.runInContext(section(main, 'window.switchProfile =', '/** Create a new profile'), ctx);
    vm.runInContext(section(main, 'window.createProfile =', '/** Get active profile index'), ctx);
    assert.equal(ctx.window.getProfileList()[0].background, 'forest');
    assert.equal(ctx.window.getProfileList()[1].background, 'arctic');
    ctx.window.switchProfile(0);
    ctx = profileContext(localStorage);
    vm.runInContext(section(main, 'window.createProfile =', '/** Get active profile index'), ctx);
    assert.equal(ctx.window.getProfileList()[0].background, 'forest');
    assert.equal(ctx.window.getProfileList()[1].background, 'arctic');
});

test('cosmetic offer state and purchased title stay with their profile across switches', () => {
    const localStorage = storage();
    localStorage.setItem('megare_profiles', JSON.stringify([
        { name: 'First', data: { tankCoins: '731', cosmeticShop: '{"period":42,"offers":[],"revealed":true}', playerTitleUnlocks: '["shop-collector"]', playerTitle: 'shop-collector' } },
        { name: 'Second', data: { tankCoins: '202' } }
    ]));
    let ctx = profileContext(localStorage);
    assert.equal(localStorage.getItem('playerTitle'), 'shop-collector');
    assert.equal(JSON.parse(localStorage.getItem('cosmeticShop')).period, 42);
    ctx.window.location = { pathname: '/index.html', replace() {} };
    vm.runInContext(section(main, 'window.switchProfile =', '/** Create a new profile'), ctx);
    ctx.window.switchProfile(1);
    ctx = profileContext(localStorage);
    assert.equal(localStorage.getItem('cosmeticShop'), null);
    assert.equal(localStorage.getItem('playerTitleUnlocks'), null);
    ctx.window.location = { pathname: '/index.html', replace() {} };
    vm.runInContext(section(main, 'window.switchProfile =', '/** Create a new profile'), ctx);
    ctx.window.switchProfile(0);
    profileContext(localStorage);
    assert.equal(localStorage.getItem('playerTitle'), 'shop-collector');
    assert.equal(JSON.parse(localStorage.getItem('cosmeticShop')).period, 42);
    assert.deepEqual(JSON.parse(localStorage.getItem('playerTitleUnlocks')), ['shop-collector']);
});

test('legacy selected backgrounds migrate without losing resources or moving between profiles', () => {
    const localStorage = storage();
    localStorage.setItem('megare_profiles', JSON.stringify([
        { name: 'First', background: 'forest', data: { tankCoins: '731', tankAvatarUnlocks: '["animated:lion"]' } },
        { name: 'Second', data: { tankCoins: '202', tankBackgroundUnlocks: '["ice"]' } }
    ]));
    let ctx = profileContext(localStorage);
    assert.equal(localStorage.getItem('tankCoins'), '731');
    assert.deepEqual(JSON.parse(localStorage.getItem('tankBackgroundUnlocks')), ['forest']);
    assert.deepEqual(JSON.parse(localStorage.getItem('tankAvatarUnlocks')), ['animated:lion']);
    ctx.window.location = { pathname: '/index.html', replace() {} };
    vm.runInContext(section(main, 'window.switchProfile =', '/** Create a new profile'), ctx);
    ctx.window.switchProfile(1);
    ctx = profileContext(localStorage);
    assert.equal(localStorage.getItem('tankCoins'), '202');
    assert.deepEqual(JSON.parse(localStorage.getItem('tankBackgroundUnlocks')), ['ice']);
    assert.equal(localStorage.getItem('tankAvatarUnlocks'), null);
});

test('background picker hides locked items and empty groups', () => {
    const node = () => ({ children: [], attributes: {}, appendChild(child) { this.children.push(child); }, setAttribute(name, value) { this.attributes[name] = value; } });
    const options = node();
    const preview = {};
    const localStorage = storage();
    const ctx = vm.createContext({ localStorage, _profileEditIdx: 0, document: {
        getElementById: () => options, createElement: node, querySelector: () => preview
    } });
    vm.runInContext(section(main, 'const CONTAINER_ORDINARY_BACKGROUNDS =', 'function weightedContainerChoice'), ctx);
    vm.runInContext(section(main, 'const PROFILE_BACKGROUNDS =', 'function renderProfilesList()'), ctx);
    vm.runInContext(section(main, 'let _profileEditBackground =', 'function openProfileEditModal'), ctx);
    ctx._buildProfileBackgroundOptions();
    assert.deepEqual(options.children.map(group => group.children[0].textContent), ['Обычные']);
    const ordinary = options.children[0].children[1].children;
    assert.equal(ordinary.length, 1);
    assert.equal(ordinary[0].attributes['aria-pressed'], 'true');
    assert.equal(preview.className, 'profile-preview profile-bg--default');
    options.children = [];
    localStorage.setItem('tankBackgroundUnlocks', '["steel","arctic"]');
    ctx._buildProfileBackgroundOptions();
    assert.deepEqual(options.children.map(group => group.children[0].textContent), ['Обычные', 'Редкие']);
    assert.equal(options.children[0].children[1].children.length, 2);
    assert.equal(options.children[1].children[1].children[0].title, 'Сияние');
    options.children = [];
    ctx._profileEditIdx = -1;
    ctx._buildProfileBackgroundOptions();
    assert.equal(options.children.length, 1);
    assert.equal(options.children[0].children[1].children.length, 1);
});

test('avatar picker shows only owned icons and omits empty tiers', () => {
    const grid = { children: [], appendChild(child) { this.children.push(child); } };
    const makeNode = () => ({ style: {}, dataset: {}, children: [], appendChild(child) { this.children.push(child); } });
    const ctx = vm.createContext({ _profileEditIdx: 0, _profileEditAvatar: 'common',
        PROFILE_AVATAR_TIERS: { common: ['common'], rare: ['rare'], unique: ['epic'], animated: ['animated'] },
        _isAvatarUnlocked: av => av === 'rare', _getUnlockedSpecialIcons: () => [], profileAvatarMarkup: av => av,
        document: { getElementById: () => grid, createElement: makeNode } });
    vm.runInContext(section(main, 'function _buildAvatarGrid()', '// Build the title selection section'), ctx);
    ctx._buildAvatarGrid();
    assert.deepEqual(grid.children.filter(child => child.textContent).map(child => child.textContent), ['Обычные · бесплатно', 'Редкие · из ящиков']);
    assert.deepEqual(grid.children.filter(child => child.children.length).map(row => row.children[0].dataset.av), ['common', 'rare']);
    grid.children = [];
    ctx._profileEditIdx = -1;
    ctx._buildAvatarGrid();
    assert.equal(grid.children.filter(child => child.textContent).length, 1);
});

function containerContext(localStorage) {
    const ctx = profileContext(localStorage);
    Object.assign(ctx, {
        containerFlowType: null, containerFlowModal: { style: {}, dataset: {} },
        containerFlowText: { textContent: '' }, containerFlowPreview: {}, containerFlowCancel: { style: {} },
        containerDropArea: null,
        document: { querySelector: () => null, getElementById: () => null }, setTimeout: () => 1, clearTimeout: () => {},
        getRandomInt: () => 1, showNotification: () => {}, updateCoinDisplay: () => {},
        openMiniContainer: () => { vm.runInContext('coins += 10', ctx); return { type: 'coins', amount: 10 }; }
    });
    vm.runInContext(section(main, 'const CONTAINER_TOKEN_PRICES =', 'function awardVictoryTokens'), ctx);
    vm.runInContext(section(main, 'let containerDropTimers = [];', 'if (containerFlowPreview) containerFlowPreview.addEventListener'), ctx);
    vm.runInContext('animateContainerDrops = () => {}', ctx);
    return ctx;
}

test('free containers survive cancellation and reload, and paid opening costs tokens', () => {
    const localStorage = storage();
    localStorage.setItem('tankTokens', '10');
    let ctx = containerContext(localStorage);
    vm.runInContext("showFreeContainerFlow('mini', 2); closeContainerFlow(); showContainerFlow('mini'); handleContainerClick()", ctx);
    assert.equal(vm.runInContext('coins', ctx), 110);
    assert.equal(vm.runInContext('tokens', ctx), 0);
    assert.deepEqual(JSON.parse(localStorage.getItem('pendingFreeContainers')), ['mini', 'mini']);
    ctx = containerContext(localStorage);
    vm.runInContext('processNextContainer(); handleContainerClick()', ctx);
    assert.deepEqual(JSON.parse(localStorage.getItem('pendingFreeContainers')), ['mini']);
    assert.equal(JSON.parse(localStorage.getItem('megare_profiles'))[0].data.tankCoins, '120');
});

test('legacy profiles start without tokens and preserve other progress', () => {
    const localStorage = storage();
    localStorage.setItem('tankCoins', '731');
    localStorage.setItem('tankParts', '42');
    localStorage.setItem('tankUpgrades', '{"normal":{"hp":2}}');
    let ctx = profileContext(localStorage);
    assert.equal(vm.runInContext('tokens', ctx), 0);
    vm.runInContext('tokens = 37; saveProgress()', ctx);
    ctx = profileContext(localStorage);
    assert.equal(vm.runInContext('tokens', ctx), 37);
    assert.equal(localStorage.getItem('tankCoins'), '731');
    assert.equal(localStorage.getItem('tankParts'), '42');
    assert.deepEqual(JSON.parse(localStorage.getItem('tankUpgrades')), { normal: { hp: 2 } });
});

test('switching profiles keeps token balances and promo history separate', () => {
    const localStorage = storage();
    localStorage.setItem('megare_profiles', JSON.stringify([
        { name: 'Old', data: { tankCoins: '100', tankPromoUsed: '[]' } },
        { name: 'New', data: { tankCoins: '200', tankTokens: '80', tankPromoUsed: '["ECONOMY2026"]' } }
    ]));
    let ctx = profileContext(localStorage);
    ctx.window.location = { pathname: '/index.html', replace() {} };
    vm.runInContext(section(main, 'window.switchProfile =', '/** Create a new profile'), ctx);
    vm.runInContext('tokens = 25; saveProgress(); window.switchProfile(1)', ctx);
    ctx = profileContext(localStorage);
    assert.equal(vm.runInContext('tokens', ctx), 80);
    assert.equal(localStorage.getItem('tankCoins'), '200');
    assert.deepEqual(JSON.parse(localStorage.getItem('tankPromoUsed')), ['ECONOMY2026']);
    ctx.window.location = { pathname: '/index.html', replace() {} };
    vm.runInContext(section(main, 'window.switchProfile =', '/** Create a new profile'), ctx);
    ctx.window.switchProfile(0);
    ctx = profileContext(localStorage);
    assert.equal(vm.runInContext('tokens', ctx), 25);
    assert.equal(localStorage.getItem('tankCoins'), '100');
    assert.deepEqual(JSON.parse(localStorage.getItem('tankPromoUsed')), []);
});

test('every paid container checks tokens at opening and confirmation', () => {
    for (const [type, price] of Object.entries({ mini: 10, bronze: 40, legendary: 350, glitch: 300, mythic: 600, omega: 1000, alpha: 3000, mechParts: 300 })) {
        const localStorage = storage();
        localStorage.setItem('tankTokens', String(price - 1));
        const ctx = containerContext(localStorage);
        for (const fn of ['openContainer', 'openSuperContainer', 'openMythicContainer', 'openOmegaContainer', 'openMechPartsContainer', 'openAlphaContainer', 'openAlphaGuaranteedSlot']) {
            ctx[fn] = () => ({ type: 'coins', amount: 1 });
        }
        ctx.openGlitchRewards = () => [{ type: 'coins', amount: 1 }];
        vm.runInContext(`showContainerFlow('${type}')`, ctx);
        assert.equal(ctx.containerFlowType, null, type);
        vm.runInContext(`tokens = ${price}; showContainerFlow('${type}'); closeContainerFlow()`, ctx);
        assert.equal(vm.runInContext('tokens', ctx), price, type);
        vm.runInContext(`showContainerFlow('${type}'); tokens--; handleContainerConfirm()`, ctx);
        assert.equal(vm.runInContext('tokens', ctx), price - 1, type);
        vm.runInContext(`tokens = ${price}; showContainerFlow('${type}'); handleContainerConfirm()`, ctx);
        assert.equal(vm.runInContext('tokens', ctx), 0, type);
        assert.equal(localStorage.getItem('tankTokens'), '0', type);
    }
});

test('paid and free glitch openings use their reward generator', () => {
    for (const isFree of [false, true]) {
        const localStorage = storage();
        localStorage.setItem('tankTokens', '300');
        const ctx = containerContext(localStorage);
        let calls = 0;
        ctx.openGlitchRewards = () => { calls++; return Array.from({ length: 10 }, () => ({ type: 'coins', amount: 1 })); };
        if (isFree) vm.runInContext("showFreeContainerFlow('glitch'); handleFreeContainerConfirm()", ctx);
        else vm.runInContext("showContainerFlow('glitch'); handleContainerConfirm()", ctx);
        assert.equal(calls, 1);
        assert.equal(ctx.containerFlowModal.dataset.glitchBurst, 'strong');
        assert.equal(vm.runInContext('tokens', ctx), isFree ? 300 : 0);
    }
});

test('paid and free mythic openings generate four to six rewards', () => {
    for (const isFree of [false, true]) {
        for (const useMax of [false, true]) {
            const localStorage = storage();
            localStorage.setItem('tankTokens', '600');
            const ctx = containerContext(localStorage);
            let rewards = 0;
            ctx.getRandomInt = (min, max) => useMax ? max : min;
            ctx.openMythicContainer = () => { rewards++; return { type: 'coins', amount: 1 }; };
            if (isFree) vm.runInContext("showFreeContainerFlow('mythic'); handleFreeContainerConfirm()", ctx);
            else vm.runInContext("showContainerFlow('mythic'); handleContainerConfirm()", ctx);
            assert.equal(rewards, useMax ? 6 : 4);
        }
    }
});

test('paid and free alpha openings have one guaranteed and four to seven regular slots', () => {
    for (const isFree of [false, true]) {
        for (const useMax of [false, true]) {
            const localStorage = storage();
            localStorage.setItem('tankTokens', '3000');
            const ctx = containerContext(localStorage);
            let guaranteed = 0, regular = 0;
            ctx.getRandomInt = (min, max) => useMax ? max : min;
            ctx.openAlphaGuaranteedSlot = () => { guaranteed++; return { type: 'coins', amount: 1 }; };
            ctx.openAlphaContainer = () => { regular++; return { type: 'coins', amount: 1 }; };
            if (isFree) vm.runInContext("showFreeContainerFlow('alpha'); handleFreeContainerConfirm()", ctx);
            else vm.runInContext("showContainerFlow('alpha'); handleContainerConfirm()", ctx);
            assert.equal(guaranteed, 1);
            assert.equal(regular, useMax ? 7 : 4);
        }
    }
});

test('promotions award once and retain their use on reload', () => {
    const localStorage = storage();
    const buttons = {};
    const input = { value: '', addEventListener() {} };
    const result = { innerHTML: '' };
    function setup() {
        const ctx = profileContext(localStorage);
        Object.assign(ctx, { achievementData: { claimed: {} }, saveAchievements() {}, updateCoinDisplay() {},
            document: { getElementById: id => ({ promoActivateBtn: { addEventListener: (_, fn) => { buttons.activate = fn; } }, promoCodeInput: input, promoResult: result }[id]) } });
        vm.runInContext(section(main, 'const _PROMO_CODES =', '// ────────────────────────────────────────────────────────────────────────────'), ctx);
        return ctx;
    }
    let ctx = setup();
    input.value = 'EM5p7#89'; buttons.activate();
    input.value = 'EM5p7#89'; buttons.activate();
    assert.equal(vm.runInContext('tokens', ctx), 50);
    assert.equal(vm.runInContext('gems', ctx), 15);
    input.value = 'ECONOMY2026'; buttons.activate();
    assert.equal(vm.runInContext('tokens', ctx), 150);
    assert.equal(ctx.achievementData.claimed.icon_economy_veteran, true);
    ctx = setup();
    input.value = 'ECONOMY2026'; buttons.activate();
    assert.equal(vm.runInContext('tokens', ctx), 150);
});

test('standard victory awards tokens once, while trial and custom maps do not', () => {
    const start = physics.indexOf('// Training mode: intercept any premature game-over');
    const end = physics.indexOf('// Clamp all entities back inside world bounds', start);
    assert.ok(start >= 0 && end > start);
    for (const [mode, expected] of Object.entries({ single: 10, team: 15, duel: 5, onevsall: 25, bossfight: 100, trial: 0, custom: 0 })) {
        const ctx = vm.createContext({
            currentMode: mode, gameState: 'playing', tank: { alive: true, hp: 100 },
            tankType: 'normal', enemies: [], coins: 0, trophies: 0, tokens: 0,
            window: { _customMapActive: mode === 'custom', _customMapTriggerState: { hadHostiles: true } },
            saveProgress() {}, syncResultOverlay() {}, addIndividualTankTrophies() {}
        });
        vm.runInContext(section(main, 'const VICTORY_TOKEN_REWARDS =', 'let gems ='), ctx);
        vm.runInContext(`function finishBattle() { ${physics.slice(start, end)} }`, ctx);
        ctx.finishBattle();
        ctx.finishBattle();
        assert.equal(ctx.tokens, expected, mode);
        assert.equal(ctx.coins, 0, mode);
    }
});

test('damage protection prevents lethal hits and special projectiles update independently of drawing', () => {
    let losses = 0;
    const ctx = vm.createContext({
        tank: { x: 100, y: 100, w: 20, h: 20, hp: 10, team: 0, kamikazeInvincible: true },
        tankType: 'kamikaze', currentMode: 'single', gameState: 'playing',
        window: { frameCount: 100 },
        objects: [], enemies: [], allies: [], worldWidth: 1000, worldHeight: 1000,
        buratinoBarrages: [{ x: 300, y: 300, vx: 3, vy: 0, life: 5, radius: 5 }],
        musicalSoundWaves: [{ x: 110, y: 110, vx: 0, vy: 0, life: 5, radius: 5, damage: 50, team: 1, bounces: 0, maxBounces: 5 }],
        electricRays: [{ life: 3 }],
        isBurovoyBurrowActive: e => e.tankType === 'burovoy' && !!e.burovoyBurrowActive,
        spawnParticle: () => {}, spawnExplosion: () => {}, loseModeTrophies: () => { losses++; },
        syncResultOverlay: () => { losses++; }
    });
    vm.runInContext(section(physics, 'function applyTargetDamageModifiers(', 'function refreshSandstormDebuff('), ctx);
    vm.runInContext(section(physics, 'function applyPharaohSwarmDamage(', 'function updatePharaohSwarm('), ctx);
    vm.runInContext(section(physics, 'function updateSpecialProjectiles()', 'function updatePhysics()'), ctx);
    vm.runInContext('dealDamageToEntity(tank, 100); applyPharaohSwarmDamage(tank, 100); updateSpecialProjectiles()', ctx);
    assert.equal(ctx.tank.hp, 10);
    assert.equal(ctx.gameState, 'playing');
    assert.equal(losses, 0);
    assert.equal(ctx.buratinoBarrages[0].x, 303);
    assert.equal(ctx.electricRays[0].life, 2);
    vm.runInContext("tank.kamikazeInvincible = false; tankType = 'burovoy'; tank.burovoyBurrowActive = true; dealDamageToEntity(tank, 100)", ctx);
    assert.equal(ctx.tank.hp, 10);
    vm.runInContext('tank.burovoyBurrowActive = false; dealDamageToEntity(tank, 5)', ctx);
    assert.equal(ctx.tank.hp, 5);
    vm.runInContext('updateSpecialProjectiles()', ctx);
    assert.equal(ctx.gameState, 'lose');
    assert.equal(losses, 2);
});

test('pause stops simulation, preserves ability timers and returns to menu', () => {
    const listeners = {};
    const elements = Object.fromEntries(['pauseMenu', 'pauseResumeBtn', 'pauseRestartBtn', 'pauseMenuBtn', 'mainMenu'].map(id => [id, {
        style: { display: id === 'mainMenu' ? 'none' : '' },
        addEventListener: (type, fn) => { listeners[id + ':' + type] = fn; }
    }]));
    let now = 1000, returned = 0, musicUpdates = 0;
    const ctx = vm.createContext({
        document: { body: { insertAdjacentHTML: () => {} }, getElementById: id => elements[id] || null, addEventListener: (type, fn) => { listeners[type] = fn; } },
        localStorage: storage(), window: { goToMenuNoReload: () => { returned++; } },
        Date: { now: () => now }, gameState: 'playing', gameStartTime: 500,
        tank: { beamStart: 800, lastHitTime: 900 }, enemies: [], allies: [], keys: { w: true },
        updateMusic: () => { musicUpdates++; }
    });
    vm.runInContext(pause, ctx);
    vm.runInContext(section(main, 'function update() {', 'let _lastDisplayedResources'), ctx);
    ctx.window.openPauseMenu();
    ctx.update();
    assert.equal(musicUpdates, 1);
    assert.equal(ctx.keys.w, false);
    now = 3000;
    listeners['pauseResumeBtn:click']();
    assert.equal(ctx.gameStartTime, 2500);
    assert.equal(ctx.tank.beamStart, 2800);
    ctx.window.openPauseMenu();
    listeners['pauseMenuBtn:click']();
    assert.equal(returned, 1);
    assert.equal(ctx.window.isPaused(), false);
});
