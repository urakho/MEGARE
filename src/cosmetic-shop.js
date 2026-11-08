// Daily cosmetic offers use the active profile's existing collection and currency.
(function () {
    const prices = { rareIcon: 500, epicIcon: 1200, animatedIcon: 2500, commonBackground: 400, rareBackground: 1500, title: 2000 };
    const categories = [
        { type: 'rareIcon', weight: 30, label: 'Редкая иконка', tier: 'rare' },
        { type: 'epicIcon', weight: 20, label: 'Эпическая иконка', tier: 'unique' },
        { type: 'animatedIcon', weight: 10, label: 'Анимированная иконка', tier: 'animated' },
        { type: 'commonBackground', weight: 20, label: 'Обычный фон' },
        { type: 'rareBackground', weight: 15, label: 'Редкий фон' },
        { type: 'title', weight: 5, label: 'Особое звание' }
    ];
    const iconNames = {};
    const oldIconNames = {
        rare: [
            'Боевые топоры', 'Стальной щит', 'Плазменный бластер', 'Бомба', 'Ракета',
            'Арбалет', 'Ледяной меч', 'Техническая отвёртка', 'Огненная шестерня', 'Грозовой трезубец',
            'Пришелец', 'Вертолёт', 'Самолёт', 'Бумеранг', 'Боевой шлем',
            'Динамик', 'Секундомер', 'Вихрь', 'Пиратский флаг', 'Радуга',
            'Огонь', 'Ледяной кристалл', 'Молния', 'Волна', 'Торнадо',
            'Вулкан', 'Радиация', 'Магнит', 'Грозовая туча', 'Солнце',
            'Хищное растение', 'Гриб', 'Микроб', 'Каменный страж', 'Ледяной страж',
            'Орёл', 'Лис', 'Волк', 'Осьминог-пират', 'Кальмар-механик'
        ],
        unique: [
            'Золотая корона', 'Робот', 'Бронированный кулак', 'Красный демон', 'Золотой лев',
            'Огненный дракон', 'Механический паук', 'Золотой скорпион', 'Кобра', 'Динозавр',
            'Акула-пират', 'Тёмный демон', 'Кубок', 'Кристалл', 'Золотая медаль',
            'Магический вихрь', 'Волшебная палочка', 'Зеркало', 'Фиолетовый реактор', 'Огненный реактор',
            'Космонавт', 'Фараон', 'Самурай', 'Горгулья', 'Рыцарь',
            'Феникс', 'Циклоп', 'Кабан', 'Йети', 'Ворон',
            'Броненосец', 'Череп дракона', 'Кристальный череп', 'Ворон-пират', 'Летучая мышь',
            'Командир', 'Лазерная пушка', 'Корона полководца', 'Фонарь', 'Сокровище'
        ],
        animated: ['Пламя', 'Молния', 'Вихрь', 'Кристалл', 'Робот', 'Комета', 'Лев', 'Призрак', 'Снежинка', 'Токсичный череп', 'Дракон', 'Корона']
    };
    for (const [tier, names] of Object.entries(oldIconNames)) {
        PROFILE_AVATAR_TIERS[tier].filter(id => !id.startsWith('new-icon:')).forEach((id, index) => { iconNames[id] = names[index]; });
    }
    Object.assign(iconNames, {
        'new-icon:rare-mask': 'Противогаз', 'new-icon:rare-helmet': 'Бронешлем', 'new-icon:rare-shells': 'Снаряды',
        'new-icon:rare-hawk': 'Боевой орёл', 'new-icon:rare-radar': 'Радар', 'new-icon:rare-drone': 'Боевой дрон',
        'new-icon:unique-wolf': 'Бронированный волк', 'new-icon:unique-samurai': 'Киберсамурай', 'new-icon:unique-scorpion': 'Механический скорпион',
        'new-icon:unique-pirate': 'Призрачный пират', 'new-icon:unique-bear': 'Бронированный медведь', 'new-icon:unique-skull': 'Огненный череп',
        'new-icon:animated-phoenix': 'Солнечный феникс', 'new-icon:animated-tiger': 'Грозовой тигр', 'new-icon:animated-owl': 'Ледяная сова',
        'new-icon:animated-golem': 'Лавовый голем', 'new-icon:animated-serpent': 'Киберзмей', 'new-icon:animated-eye': 'Космическое око'
    });
    const dayMs = 86400000, resetOffset = 8 * 3600000, offerCount = 8;
    let ticker = null, badgeTicker = null, revealTimer = null, visible = false, state = null, shown = 0, selected = -1;

    function periodAt(now) { return Math.floor((now - resetOffset) / dayMs); }
    function remainingAt(now) { return Math.max(0, (periodAt(now) + 1) * dayMs + resetOffset - now); }
    function formatRemaining(ms) {
        const seconds = Math.ceil(ms / 1000);
        return [Math.floor(seconds / 3600), Math.floor(seconds / 60) % 60, seconds % 60].map(n => String(n).padStart(2, '0')).join(':');
    }
    function pools() {
        const backgrounds = _getBackgroundUnlocks();
        const titles = _getUnlockedTitles();
        return {
            rareIcon: PROFILE_AVATAR_TIERS.rare.filter(id => !_isAvatarUnlocked(id)),
            epicIcon: PROFILE_AVATAR_TIERS.unique.filter(id => !_isAvatarUnlocked(id)),
            animatedIcon: PROFILE_AVATAR_TIERS.animated.filter(id => !_isAvatarUnlocked(id)),
            commonBackground: CONTAINER_ORDINARY_BACKGROUNDS.filter(id => !backgrounds.includes(id)),
            rareBackground: CONTAINER_RARE_BACKGROUNDS.filter(id => !backgrounds.includes(id)),
            title: Object.keys(COSMETIC_SHOP_TITLES).filter(id => !titles.includes(id))
        };
    }
    function applyAssortmentSale(offers) {
        const eligible = [];
        const alreadyUsed = offers.some(offer => offer && offer.purchased && offer.discount > 0);
        for (const offer of offers) {
            if (!offer) continue;
            if (offer.purchased) {
                if (offer.basePrice === undefined) offer.basePrice = offer.price;
                if (offer.discount === undefined) offer.discount = 0;
                continue;
            }
            offer.basePrice = offer.basePrice ?? offer.price;
            offer.discount = 0;
            offer.price = offer.basePrice;
            if (!owned(offer)) eligible.push(offer);
        }
        if (alreadyUsed || !eligible.length) return;
        const roll = Math.random();
        const discount = roll < .75 ? 0 : roll < .875 ? 50 : roll < .95 ? 80 : 100;
        if (!discount) return;
        const offer = eligible[Math.floor(Math.random() * eligible.length)];
        offer.discount = discount;
        offer.price = Math.round(offer.basePrice * (100 - discount) / 100);
    }
    function generate(period, existing = []) {
        const available = pools(), offers = existing.slice();
        for (const offer of offers) {
            if (offer && available[offer.type]) available[offer.type] = available[offer.type].filter(id => id !== offer.id);
        }
        for (let slot = offers.length; slot < offerCount; slot++) {
            const choices = categories.filter(category => available[category.type].length);
            if (!choices.length) { offers.push(null); continue; }
            const total = choices.reduce((sum, category) => sum + category.weight, 0);
            let roll = Math.random() * total;
            let chosen = choices[choices.length - 1];
            for (const category of choices) {
                roll -= category.weight;
                if (roll < 0) { chosen = category; break; }
            }
            const items = available[chosen.type];
            const id = items.splice(Math.floor(Math.random() * items.length), 1)[0];
            const offer = { type: chosen.type, id, price: prices[chosen.type], purchased: false };
            offers.push(offer);
        }
        applyAssortmentSale(offers);
        return { period, offers, revealed: false, revealedCount: 0, pricingVersion: 2 };
    }
    function persist() {
        localStorage.setItem('cosmeticShop', JSON.stringify(state));
        if (typeof window.saveActiveProfile === 'function') window.saveActiveProfile();
    }
    function getState(now = Date.now()) {
        let saved;
        try { saved = JSON.parse(localStorage.getItem('cosmeticShop') || 'null'); } catch (e) { saved = null; }
        const period = periodAt(now);
        if (saved && saved.period === period && Array.isArray(saved.offers) && saved.offers.length === 5) {
            state = generate(period, saved.offers);
            state.revealedCount = saved.revealed ? 5 : Math.min(saved.revealedCount || 0, 5);
            persist();
        } else if (!saved || saved.period !== period || !Array.isArray(saved.offers) || saved.offers.length !== offerCount) {
            state = generate(period);
            persist();
        } else {
            state = saved;
            if (state.pricingVersion !== 2) {
                applyAssortmentSale(state.offers);
                state.pricingVersion = 2;
                persist();
            }
        }
        return state;
    }
    function owned(offer) {
        if (offer.type.endsWith('Icon')) return _isAvatarUnlocked(offer.id);
        if (offer.type.endsWith('Background')) return _getBackgroundUnlocks().includes(offer.id);
        return _getUnlockedTitles().includes(offer.id);
    }
    function nameOf(offer) {
        if (offer.type === 'title') return COSMETIC_SHOP_TITLES[offer.id].name;
        if (offer.type.endsWith('Background')) return 'Фон ' + (PROFILE_BACKGROUNDS[offer.id] || offer.id);
        return 'Иконка профиля ' + (iconNames[offer.id] || 'Неизвестная');
    }
    function offerBadge(offer) {
        if (offer.discount === 100) return '<span class="cosmetic-sale cosmetic-sale--gift">ПОДАРОК</span>';
        return offer.discount ? '<span class="cosmetic-sale">SALE ' + offer.discount + '%</span>' : '';
    }
    function offerPrice(offer) {
        if (offer.discount === 100) return 'Бесплатно';
        return (offer.discount ? '<s>' + offer.basePrice + '</s> ' : '') + offer.price + ' монет';
    }
    function preview(offer, size) {
        if (offer.type.endsWith('Icon')) return profileAvatarMarkup(offer.id, size);
        if (offer.type.endsWith('Background')) return '<span class="cosmetic-shop-background profile-background-option profile-bg--' + offer.id + '"></span>';
        return '<span class="cosmetic-shop-title-art">★</span>';
    }
    function purchase(index) {
        const previous = state && state.offers[index];
        const previousPeriod = state && state.period;
        const current = getState();
        const offer = current.offers[index];
        if (previousPeriod !== current.period) {
            if (visible) begin();
            return 'expired';
        }
        if (!offer || !previous || previous.type !== offer.type || previous.id !== offer.id || !current.revealed || offer.purchased || owned(offer)) return 'owned';
        if (coins < offer.price) return 'insufficient';
        const key = offer.type.endsWith('Icon') ? 'tankAvatarUnlocks' : offer.type.endsWith('Background') ? 'tankBackgroundUnlocks' : 'playerTitleUnlocks';
        const oldValue = localStorage.getItem(key), oldShop = localStorage.getItem('cosmeticShop'), oldCoins = coins;
        try {
            const unlocks = key === 'tankAvatarUnlocks' ? _getAvatarUnlocks() : key === 'tankBackgroundUnlocks' ? _getBackgroundUnlocks() : _getUnlockedTitles();
            unlocks.push(offer.id);
            localStorage.setItem(key, JSON.stringify(unlocks));
            coins -= offer.price;
            offer.purchased = true;
            localStorage.setItem('cosmeticShop', JSON.stringify(current));
            saveProgress();
            updateCoinDisplay();
            updateBadge();
            return 'ok';
        } catch (e) {
            coins = oldCoins;
            offer.purchased = false;
            try {
                if (oldValue === null) localStorage.removeItem(key); else localStorage.setItem(key, oldValue);
                if (oldShop === null) localStorage.removeItem('cosmeticShop'); else localStorage.setItem('cosmeticShop', oldShop);
                localStorage.setItem('tankCoins', String(oldCoins));
            } catch (ignored) {}
            return 'error';
        }
    }
    function render(justRevealed = -1) {
        const grid = document.getElementById('cosmeticShopOffers');
        if (!grid || !state) return;
        grid.innerHTML = '';
        state.offers.forEach((offer, index) => {
            if (offer && offer.purchased) return;
            const card = document.createElement('div');
            card.className = 'cosmetic-offer';
            if (index >= shown) {
                card.classList.add('cosmetic-offer--hidden');
                if (index === shown) card.classList.add('cosmetic-offer--next');
                card.textContent = '?';
            } else if (!offer) {
                card.classList.add('cosmetic-offer--empty');
                card.textContent = 'Все предметы открыты';
            } else {
                const category = categories.find(item => item.type === offer.type);
                const status = owned(offer) ? 'Получено' : offerPrice(offer);
                card.classList.add('cosmetic-offer--' + offer.type);
                if (index === justRevealed) card.classList.add('cosmetic-offer--arrive');
                card.innerHTML = (owned(offer) ? '' : offerBadge(offer)) + '<span class="cosmetic-offer-art">' + preview(offer, 64) + '</span><strong>' + escapeHtml(nameOf(offer)) + '</strong><span class="cosmetic-offer-rarity">' + category.label + '</span><span class="cosmetic-offer-price">' + status + '</span>';
                card.onclick = () => openItem(index);
                card.tabIndex = 0;
                card.setAttribute('role', 'button');
                card.onkeydown = event => { if (event.target === card && (event.key === 'Enter' || event.key === ' ')) { event.preventDefault(); openItem(index); } };
                const button = document.createElement('button');
                button.type = 'button';
                button.className = 'btn btn-buy cosmetic-offer-buy';
                button.textContent = owned(offer) ? 'Получено' : offer.discount === 100 ? 'Забрать' : 'Купить';
                button.disabled = owned(offer) || !state.revealed;
                button.onclick = event => { event.stopPropagation(); openItem(index); };
                card.appendChild(button);
            }
            grid.appendChild(card);
        });
    }
    function closeItem() {
        const modal = document.getElementById('cosmeticItemModal');
        if (modal) modal.style.display = 'none';
        selected = -1;
    }
    function openItem(index) {
        const offer = state && state.offers[index];
        if (!offer || offer.purchased || index >= shown) return;
        selected = index;
        const modal = document.getElementById('cosmeticItemModal');
        const box = document.getElementById('cosmeticItemBox');
        if (!modal) return;
        const category = categories.find(item => item.type === offer.type);
        if (box) box.dataset.itemType = offer.type;
        document.getElementById('cosmeticItemTitle').textContent = offer.discount === 100 ? 'ЗАБРАТЬ ПОДАРОК?' : 'КУПИТЬ ПРЕДМЕТ?';
        document.getElementById('cosmeticItemArt').innerHTML = preview(offer, 140);
        document.getElementById('cosmeticItemName').textContent = nameOf(offer);
        document.getElementById('cosmeticItemRarity').textContent = category.label;
        document.getElementById('cosmeticItemPrice').innerHTML = offerBadge(offer) + ' ' + offerPrice(offer);
        const button = document.getElementById('cosmeticItemBuy');
        button.textContent = owned(offer) ? 'Получено' : offer.discount === 100 ? 'Забрать' : 'Купить';
        button.disabled = owned(offer) || !state.revealed;
        button.style.display = '';
        button.onclick = buySelected;
        const closeButton = document.getElementById('cosmeticItemClose');
        closeButton.textContent = 'Отмена';
        if (box) box.classList.remove('cosmetic-item-box--success');
        modal.style.display = 'flex';
    }
    function buySelected() {
        const offer = state && state.offers[selected];
        const result = purchase(selected);
        if (result === 'ok') {
            const box = document.getElementById('cosmeticItemBox');
            const category = categories.find(item => item.type === offer.type);
            document.getElementById('cosmeticItemTitle').textContent = offer.type === 'title' ? 'НОВОЕ ЗВАНИЕ!' : category.label.toUpperCase() + '!';
            document.getElementById('cosmeticItemPrice').textContent = '';
            document.getElementById('cosmeticItemBuy').style.display = 'none';
            document.getElementById('cosmeticItemClose').textContent = 'Отлично';
            if (box) box.classList.add('cosmetic-item-box--success');
            selected = -1;
        }
        else if (result === 'insufficient') showNotification('Недостаточно монет!', '#e74c3c');
        else if (result === 'expired') showNotification('Предложения обновились', '#f1c40f');
        else if (result === 'error') showNotification('Не удалось сохранить покупку', '#e74c3c');
        render();
    }
    function revealNext() {
        if (!visible || !state) return;
        shown++;
        state.revealedCount = shown;
        if (shown >= offerCount) { shown = offerCount; state.revealed = true; }
        persist();
        render(shown - 1);
        if (!state.revealed) revealTimer = setTimeout(revealNext, 450);
        else revealTimer = null;
    }
    function begin() {
        if (revealTimer !== null) clearTimeout(revealTimer);
        selected = -1;
        const reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (!state.revealed && reduced) { state.revealed = true; persist(); }
        shown = state.revealed ? offerCount : Math.min(state.revealedCount || 0, offerCount - 1);
        render();
        if (!state.revealed) revealTimer = setTimeout(revealNext, 450);
    }
    function tick() {
        if (!visible) return;
        const now = Date.now();
        if (!state || state.period !== periodAt(now)) { closeItem(); getState(now); begin(); }
        const timer = document.getElementById('cosmeticShopTimer');
        if (timer) timer.textContent = 'Новые предложения через ' + formatRemaining(remainingAt(now));
    }
    function updateBadge() {
        const badges = document.getElementById('cosmeticShopBadges');
        if (!badges) return;
        if (!state || state.period !== periodAt(Date.now())) {
            getState();
            if (visible) { closeItem(); begin(); }
        }
        const available = state.offers.filter(offer => offer && !offer.purchased && !owned(offer));
        badges.innerHTML = [100, 80, 50].filter(discount => available.some(offer => offer.discount === discount))
            .map(discount => offerBadge({ discount })).join('');
    }
    function showShop() {
        updateBadge();
        if (badgeTicker !== null) clearInterval(badgeTicker);
        badgeTicker = setInterval(updateBadge, 1000);
    }
    function hideShop() {
        close();
        if (badgeTicker !== null) clearInterval(badgeTicker);
        badgeTicker = null;
    }
    function open() {
        visible = true;
        getState(); begin(); tick(); updateBadge();
        if (ticker !== null) clearInterval(ticker);
        ticker = setInterval(tick, 1000);
    }
    function close() {
        visible = false;
        closeItem();
        if (ticker !== null) clearInterval(ticker);
        if (revealTimer !== null) clearTimeout(revealTimer);
        ticker = revealTimer = null;
    }
    function refresh() {
        closeItem();
        state = generate(periodAt(Date.now()));
        persist();
        if (visible) { begin(); tick(); }
        updateBadge();
    }
    const closeButton = document.getElementById('cosmeticItemClose');
    if (closeButton) closeButton.onclick = closeItem;
    const itemModal = document.getElementById('cosmeticItemModal');
    if (itemModal) itemModal.onclick = event => { if (event.target === itemModal) closeItem(); };
    window.CosmeticShop = { open, close, showShop, hideShop, refresh, getState, purchase, periodAt, remainingAt, formatRemaining };
})();
