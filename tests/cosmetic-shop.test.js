const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const source = fs.readFileSync(path.join(__dirname, '..', 'src', 'cosmetic-shop.js'), 'utf8');
function setup(initial = {}, start = Date.UTC(2026, 0, 1, 9)) {
    const data = new Map(Object.entries(initial));
    let now = start, nextTimer = 0, saves = 0;
    const timers = new Map(), intervals = new Map(), rolls = [];
    const random = Object.create(Math);
    random.random = () => rolls.length ? rolls.shift() : 0;
    class Clock extends Date { static now() { return now; } }
    function node() {
        let html = '';
        const element = { children: [], style: {}, dataset: {}, classList: { add() {}, remove() {} }, setAttribute() {}, appendChild(child) { this.children.push(child); } };
        Object.defineProperty(element, 'innerHTML', { get: () => html, set(value) { html = value; element.children = []; } });
        return element;
    }
    const nodes = Object.fromEntries(['cosmeticShopOffers','cosmeticShopTimer','cosmeticShopBadges','cosmeticItemModal','cosmeticItemBox','cosmeticItemTitle','cosmeticItemArt','cosmeticItemName','cosmeticItemRarity','cosmeticItemPrice','cosmeticItemBuy','cosmeticItemClose'].map(id => [id, node()]));
    const list = (prefix, count) => Array.from({ length: count }, (_, i) => prefix + i);
    const context = {
        window: { matchMedia: () => ({ matches: false }), saveActiveProfile() {} },
        document: { getElementById: id => nodes[id], createElement: node },
        localStorage: { getItem: key => data.has(key) ? data.get(key) : null, setItem: (key, value) => data.set(key, String(value)), removeItem: key => data.delete(key) },
        Math: random, Date: Clock, coins: Number(data.get('tankCoins') || 0),
        PROFILE_AVATAR_TIERS: { rare: list('r', 8), unique: list('e', 8), animated: list('a', 8) },
        CONTAINER_ORDINARY_BACKGROUNDS: list('b', 8), CONTAINER_RARE_BACKGROUNDS: list('rb', 8),
        PROFILE_BACKGROUNDS: {}, COSMETIC_SHOP_TITLES: Object.fromEntries(list('t', 5).map(id => [id, { name: id }])),
        _getAvatarUnlocks: () => JSON.parse(data.get('tankAvatarUnlocks') || '[]'),
        _getBackgroundUnlocks: () => JSON.parse(data.get('tankBackgroundUnlocks') || '[]'),
        _getUnlockedTitles: () => JSON.parse(data.get('playerTitleUnlocks') || '[]'),
        _isAvatarUnlocked: id => JSON.parse(data.get('tankAvatarUnlocks') || '[]').includes(id),
        profileAvatarMarkup: id => '<i>' + id + '</i>', escapeHtml: id => id,
        saveProgress() { saves++; data.set('tankCoins', String(context.coins)); }, updateCoinDisplay() {}, showNotification() {},
        setTimeout(fn) { timers.set(++nextTimer, fn); return nextTimer; }, clearTimeout: id => timers.delete(id),
        setInterval(fn) { intervals.set(++nextTimer, fn); return nextTimer; }, clearInterval: id => intervals.delete(id)
    };
    vm.runInNewContext(source, context);
    return { context, shop: context.window.CosmeticShop, data, rolls, timers, intervals, nodes,
        setNow(value) { now = value; }, saves: () => saves,
        advanceReveal() { const [id, fn] = timers.entries().next().value; timers.delete(id); fn(); } };
}

test('daily offers follow category boundaries, avoid duplicates and persist', () => {
    const expected = [[0,'rareIcon'], [.30,'epicIcon'], [.50,'animatedIcon'], [.60,'commonBackground'], [.80,'rareBackground'], [.95,'title']];
    for (const [roll, type] of expected) {
        const env = setup();
        env.rolls.push(roll + .000001, 0);
        const state = env.shop.getState();
        assert.equal(state.offers[0].type, type);
        assert.equal(state.offers.length, 8);
        assert.equal(new Set(state.offers.map(offer => offer.id)).size, 8);
        assert.deepEqual(JSON.parse(env.data.get('cosmeticShop')), JSON.parse(JSON.stringify(env.shop.getState())));
    }
});

test('refresh uses 08:00 UTC, including missed days and an open shop', () => {
    const before = Date.UTC(2026, 0, 1, 7, 59, 59);
    const env = setup({}, before);
    env.shop.open();
    const previous = env.shop.getState().period;
    assert.equal(env.shop.formatRemaining(env.shop.remainingAt(before)), '00:00:01');
    assert.equal(env.nodes.cosmeticShopOffers.children.length, 8);
    env.setNow(before + 1000);
    [...env.intervals.values()][0]();
    assert.equal(env.shop.getState().period, previous + 1);
    assert.match(env.nodes.cosmeticShopTimer.textContent, /24:00:00/);
    env.setNow(before + 4 * 86400000 + 1000);
    [...env.intervals.values()][0]();
    assert.equal(env.shop.getState().period, previous + 5);
    env.shop.close();
    assert.equal(env.timers.size, 0);
    assert.equal(env.intervals.size, 0);
});

test('reveal persists, purchases spend coins once and survive reload', () => {
    const env = setup({ tankCoins: '1500' });
    env.shop.open();
    assert.equal(env.shop.getState().revealed, false);
    for (let i = 0; i < 8; i++) env.advanceReveal();
    assert.equal(env.shop.getState().revealed, true);
    assert.equal(env.shop.purchase(0), 'ok');
    assert.equal(env.context.coins, 1000);
    assert.equal(env.shop.purchase(0), 'owned');
    assert.equal(env.saves(), 1);
    const reload = setup(Object.fromEntries(env.data));
    assert.equal(reload.shop.getState().revealed, true);
    assert.equal(reload.shop.getState().offers[0].purchased, true);
    assert.equal(reload.context._getAvatarUnlocks().includes('r0'), true);
    env.shop.close();
});

test('insufficient balance, external unlocks and exhausted collections are safe', () => {
    const env = setup({ tankCoins: '1' });
    env.shop.open();
    for (let i = 0; i < 8; i++) env.advanceReveal();
    assert.equal(env.shop.purchase(0), 'insufficient');
    assert.equal(env.context.coins, 1);
    env.data.set('tankAvatarUnlocks', JSON.stringify(['r0']));
    assert.equal(env.shop.purchase(0), 'owned');
    assert.equal(env.saves(), 0);
    const all = setup();
    all.data.set('tankAvatarUnlocks', JSON.stringify([...all.context.PROFILE_AVATAR_TIERS.rare, ...all.context.PROFILE_AVATAR_TIERS.unique, ...all.context.PROFILE_AVATAR_TIERS.animated]));
    all.data.set('tankBackgroundUnlocks', JSON.stringify([...all.context.CONTAINER_ORDINARY_BACKGROUNDS, ...all.context.CONTAINER_RARE_BACKGROUNDS]));
    all.data.set('playerTitleUnlocks', JSON.stringify(Object.keys(all.context.COSMETIC_SHOP_TITLES)));
    assert.deepEqual(Array.from(all.shop.getState().offers), Array(8).fill(null));
});

test('a purchase at the reset cannot buy a replacement offer', () => {
    const env = setup({ tankCoins: '1500' }, Date.UTC(2026, 0, 1, 7, 59, 59));
    env.shop.open();
    for (let i = 0; i < 8; i++) env.advanceReveal();
    env.setNow(Date.UTC(2026, 0, 1, 8));
    assert.equal(env.shop.purchase(0), 'expired');
    assert.equal(env.context.coins, 1500);
    assert.equal(env.shop.getState().revealed, false);
    assert.equal(env.timers.size, 1);
    env.shop.close();
});

test('all cosmetic categories buy into the existing collection at their configured prices', () => {
    for (const [roll, type, key, price] of [[.01,'rareIcon','tankAvatarUnlocks',500],[.31,'epicIcon','tankAvatarUnlocks',1200],[.51,'animatedIcon','tankAvatarUnlocks',2500],[.61,'commonBackground','tankBackgroundUnlocks',400],[.81,'rareBackground','tankBackgroundUnlocks',1500],[.96,'title','playerTitleUnlocks',2000]]) {
        const env = setup({ tankCoins: '3000' });
        env.rolls.push(roll, 0);
        env.shop.open();
        for (let i = 0; i < 8; i++) env.advanceReveal();
        const offer = env.shop.getState().offers[0];
        assert.equal(offer.type, type);
        assert.equal(offer.price, price);
        assert.equal(env.shop.purchase(0), 'ok');
        assert.equal(env.context.coins, 3000 - price);
        assert.ok(JSON.parse(env.data.get(key)).includes(offer.id));
        env.shop.close();
    }
});

test('purchase receipt identifies each icon rarity, background and title', () => {
    const cases = [[.01,'rareIcon','РЕДКАЯ ИКОНКА!'],[.31,'epicIcon','ЭПИЧЕСКАЯ ИКОНКА!'],[.51,'animatedIcon','АНИМИРОВАННАЯ ИКОНКА!'],[.61,'commonBackground','ОБЫЧНЫЙ ФОН!'],[.81,'rareBackground','РЕДКИЙ ФОН!'],[.96,'title','НОВОЕ ЗВАНИЕ!']];
    for (const [roll, type, label] of cases) {
        const env = setup({ tankCoins: '3000' });
        env.rolls.push(roll, 0);
        env.shop.open();
        for (let i = 0; i < 8; i++) env.advanceReveal();
        env.nodes.cosmeticShopOffers.children[0].onclick();
        env.nodes.cosmeticItemBuy.onclick();
        assert.equal(env.nodes.cosmeticItemTitle.textContent, label);
        assert.equal(env.nodes.cosmeticItemBox.dataset.itemType, type);
        assert.equal(env.nodes.cosmeticItemModal.style.display, 'flex');
        env.shop.close();
    }
});

test('a partially exhausted collection redistributes weights and leaves unused positions empty', () => {
    const env = setup();
    const { rare, unique, animated } = env.context.PROFILE_AVATAR_TIERS;
    env.data.set('tankAvatarUnlocks', JSON.stringify([...rare.slice(0, -1), ...unique, ...animated]));
    env.data.set('tankBackgroundUnlocks', JSON.stringify([...env.context.CONTAINER_ORDINARY_BACKGROUNDS, ...env.context.CONTAINER_RARE_BACKGROUNDS]));
    env.data.set('playerTitleUnlocks', JSON.stringify(Object.keys(env.context.COSMETIC_SHOP_TITLES)));
    const offers = env.shop.getState().offers;
    assert.equal(offers[0].id, rare.at(-1));
    assert.deepEqual(Array.from(offers.slice(1)), Array(7).fill(null));
});

test('reduced motion reveals offers immediately and reopening does not reroll', () => {
    const env = setup();
    env.context.window.matchMedia = () => ({ matches: true });
    env.shop.open();
    const first = JSON.stringify(env.shop.getState().offers);
    assert.equal(env.shop.getState().revealed, true);
    assert.equal(env.timers.size, 0);
    env.shop.close();
    env.rolls.push(.99, .99);
    env.shop.open();
    assert.equal(JSON.stringify(env.shop.getState().offers), first);
    assert.equal(env.rolls.length, 2);
    env.shop.close();
});

test('five-offer profiles keep their items and extend the existing assortment', () => {
    const period = Math.floor((Date.UTC(2026, 0, 1, 9) - 8 * 3600000) / 86400000);
    const oldOffers = Array.from({ length: 5 }, (_, i) => ({ type: 'rareIcon', id: 'r' + i, price: 500, purchased: i === 0 }));
    const env = setup({ cosmeticShop: JSON.stringify({ period, offers: oldOffers, revealed: true }), tankAvatarUnlocks: '["r0"]' });
    const migrated = env.shop.getState();
    for (let i = 0; i < 5; i++) {
        assert.equal(migrated.offers[i].id, oldOffers[i].id);
        assert.equal(migrated.offers[i].purchased, oldOffers[i].purchased);
        assert.equal(migrated.offers[i].basePrice, oldOffers[i].price);
    }
    assert.equal(migrated.offers.length, 8);
    assert.equal(migrated.revealedCount, 5);
    assert.equal(migrated.revealed, false);
    assert.equal(new Set(migrated.offers.map(item => item.id)).size, 8);
    env.shop.open();
    for (let i = 0; i < 3; i++) env.advanceReveal();
    assert.equal(env.shop.getState().revealed, true);
    env.shop.close();
});

test('purchasing from the item modal removes the card and shows the result', () => {
    const env = setup({ tankCoins: '1500' });
    env.shop.open();
    for (let i = 0; i < 8; i++) env.advanceReveal();
    const nextCard = env.nodes.cosmeticShopOffers.children[1].innerHTML;
    env.nodes.cosmeticShopOffers.children[0].onclick();
    assert.equal(env.nodes.cosmeticItemModal.style.display, 'flex');
    assert.match(env.nodes.cosmeticItemArt.innerHTML, /r0/);
    env.nodes.cosmeticItemBuy.onclick();
    assert.equal(env.context.coins, 1000);
    assert.equal(env.nodes.cosmeticItemTitle.textContent, 'РЕДКАЯ ИКОНКА!');
    assert.equal(env.nodes.cosmeticItemBox.dataset.itemType, 'rareIcon');
    assert.equal(env.nodes.cosmeticItemModal.style.display, 'flex');
    assert.equal(env.nodes.cosmeticShopOffers.children.length, 7);
    assert.equal(env.nodes.cosmeticShopOffers.children[0].innerHTML, nextCard);
    env.nodes.cosmeticItemClose.onclick();
    assert.equal(env.nodes.cosmeticItemModal.style.display, 'none');
    env.shop.close();
});

test('cosmetic cards and confirmation show named icons and backgrounds', () => {
    const period = Math.floor((Date.UTC(2026, 0, 1, 9) - 8 * 3600000) / 86400000);
    const offers = [
        { type: 'rareIcon', id: 'r0', price: 500, discount: 0 },
        { type: 'rareIcon', id: 'new-icon:rare-radar', price: 500, discount: 0 },
        { type: 'commonBackground', id: 'b0', price: 400, discount: 0 },
        null, null, null, null, null
    ];
    const env = setup({ cosmeticShop: JSON.stringify({ period, offers, revealed: true, pricingVersion: 2 }) });
    env.context.PROFILE_BACKGROUNDS.b0 = 'Сталь';
    env.shop.open();
    assert.match(env.nodes.cosmeticShopOffers.children[0].innerHTML, /Иконка профиля Боевые топоры/);
    assert.match(env.nodes.cosmeticShopOffers.children[1].innerHTML, /Иконка профиля Радар/);
    assert.match(env.nodes.cosmeticShopOffers.children[2].innerHTML, /Фон Сталь/);
    env.nodes.cosmeticShopOffers.children[1].onclick();
    assert.equal(env.nodes.cosmeticItemName.textContent, 'Иконка профиля Радар');
    env.nodes.cosmeticItemClose.onclick();
    env.nodes.cosmeticShopOffers.children[2].onclick();
    assert.equal(env.nodes.cosmeticItemName.textContent, 'Фон Сталь');
    env.shop.close();
});

test('manual refresh replaces offers and restarts reveal without losing purchases', () => {
    const env = setup({ tankCoins: '1500' });
    env.shop.open();
    for (let i = 0; i < 8; i++) env.advanceReveal();
    assert.equal(env.shop.purchase(0), 'ok');
    env.rolls.push(.96, 0);
    env.shop.refresh();
    const refreshed = env.shop.getState();
    assert.equal(refreshed.offers.length, 8);
    assert.equal(refreshed.offers[0].type, 'title');
    assert.equal(refreshed.revealed, false);
    assert.ok(!refreshed.offers.some(offer => offer && offer.id === 'r0'));
    assert.equal(env.context.coins, 1000);
    assert.equal(env.timers.size, 1);
    env.shop.close();
});

test('one assortment-wide roll picks at most one sale or gift', () => {
    for (const [roll, discount, price] of [[.74999,0,500],[.75,50,250],[.875,80,100],[.95,100,0]]) {
        const env = setup();
        env.rolls.push(...Array(16).fill(0), roll, 0);
        const offers = env.shop.getState().offers;
        const first = offers[0];
        assert.equal(first.discount, discount);
        assert.equal(first.price, price);
        assert.equal(first.basePrice, 500);
        assert.equal(offers.filter(offer => offer && offer.discount > 0).length, discount ? 1 : 0);
        assert.deepEqual(JSON.parse(JSON.stringify(env.shop.getState().offers[0])), JSON.parse(JSON.stringify(first)));
    }
    const env = setup();
    env.rolls.push(...Array(16).fill(0), .99, .5);
    const offers = env.shop.getState().offers;
    assert.equal(offers[4].discount, 100);
    assert.equal(offers.filter(offer => offer && offer.discount === 100).length, 1);
    assert.equal(offers.filter(offer => offer && offer.discount > 0).length, 1);
});

test('gift costs no coins and sale labels appear in the tab, cards and confirmation', () => {
    const env = setup({ tankCoins: '0' });
    env.rolls.push(...Array(16).fill(0), .99, 0);
    env.shop.showShop();
    assert.match(env.nodes.cosmeticShopBadges.innerHTML, /ПОДАРОК/);
    assert.doesNotMatch(env.nodes.cosmeticShopBadges.innerHTML, /SALE/);
    env.shop.open();
    for (let i = 0; i < 8; i++) env.advanceReveal();
    assert.match(env.nodes.cosmeticShopOffers.children[0].innerHTML, /ПОДАРОК/);
    assert.doesNotMatch(env.nodes.cosmeticShopOffers.children[1].innerHTML, /SALE/);
    assert.doesNotMatch(env.nodes.cosmeticShopOffers.children[0].innerHTML, /Иконка профиля 1/);
    env.nodes.cosmeticShopOffers.children[0].onclick();
    assert.match(env.nodes.cosmeticItemPrice.innerHTML, /ПОДАРОК/);
    assert.equal(env.nodes.cosmeticItemClose.textContent, 'Отмена');
    env.nodes.cosmeticItemBuy.onclick();
    assert.equal(env.context.coins, 0);
    assert.equal(env.nodes.cosmeticShopOffers.children.length, 7);
    assert.doesNotMatch(env.nodes.cosmeticShopBadges.innerHTML, /ПОДАРОК/);
    assert.equal(env.nodes.cosmeticShopBadges.innerHTML, '');
    env.shop.hideShop();
    assert.equal(env.intervals.size, 0);
});

test('discounted purchases deduct the shown price and cancellation leaves progress untouched', () => {
    for (const [roll, price] of [[.75,250], [.875,100]]) {
        const env = setup({ tankCoins: '500' });
        env.rolls.push(...Array(16).fill(0), roll, 0);
        env.shop.open();
        for (let i = 0; i < 8; i++) env.advanceReveal();
        env.nodes.cosmeticShopOffers.children[0].onclick();
        assert.equal(env.nodes.cosmeticItemBuy.textContent, 'Купить');
        assert.match(env.nodes.cosmeticItemPrice.innerHTML, new RegExp(String(price) + ' монет'));
        env.nodes.cosmeticItemClose.onclick();
        assert.equal(env.context.coins, 500);
        assert.equal(env.nodes.cosmeticShopOffers.children.length, 8);
        env.nodes.cosmeticShopOffers.children[0].onclick();
        env.nodes.cosmeticItemBuy.onclick();
        assert.equal(env.context.coins, 500 - price);
        assert.equal(env.nodes.cosmeticShopOffers.children.length, 7);
        env.shop.close();
    }
});

test('existing daily offers gain stable discounts without replacing items or purchases', () => {
    const period = Math.floor((Date.UTC(2026, 0, 1, 9) - 8 * 3600000) / 86400000);
    const oldOffers = Array.from({ length: 8 }, (_, i) => ({ type: 'rareIcon', id: 'r' + i, price: 500, purchased: i === 0 }));
    const env = setup({ cosmeticShop: JSON.stringify({ period, offers: oldOffers, revealed: true }), tankAvatarUnlocks: '["r0"]' });
    env.rolls.push(.75, 0);
    const offers = env.shop.getState().offers;
    assert.equal(offers[0].purchased, true);
    assert.equal(offers[1].discount, 50);
    assert.equal(offers.filter(offer => !offer.purchased && offer.discount > 0).length, 1);
    assert.deepEqual(Array.from(offers, offer => offer.id), oldOffers.map(offer => offer.id));
    assert.deepEqual(JSON.parse(env.data.get('cosmeticShop')).offers, JSON.parse(JSON.stringify(env.shop.getState().offers)));
});

test('migration preserves a previously claimed gift and removes other old sales', () => {
    const period = Math.floor((Date.UTC(2026, 0, 1, 9) - 8 * 3600000) / 86400000);
    const oldOffers = Array.from({ length: 8 }, (_, i) => ({ type: 'rareIcon', id: 'r' + i, basePrice: 500, price: i === 0 ? 0 : 250, discount: i === 0 ? 100 : 50, purchased: i === 0 }));
    const env = setup({ cosmeticShop: JSON.stringify({ period, offers: oldOffers, revealed: true }), tankAvatarUnlocks: '["r0"]' });
    const offers = env.shop.getState().offers;
    assert.equal(offers[0].purchased, true);
    assert.equal(offers[0].discount, 100);
    for (const offer of offers.slice(1)) { assert.equal(offer.discount, 0); assert.equal(offer.price, 500); }
    assert.equal(env.context._getAvatarUnlocks().includes('r0'), true);
});
