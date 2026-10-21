const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const main = fs.readFileSync(path.join(__dirname, '..', 'src', 'main.js'), 'utf8');
const start = main.indexOf('// Tank detail modal event listeners');
const end = main.indexOf('// Set up trial controls once the page has loaded.', start);
assert.ok(start >= 0 && end > start);

function purchaseScreen(initialGems) {
    const listeners = {};
    const ids = ['tankDetailClose', 'tankDetailSelect', 'tankDetailModal', 'buyConfirmModal',
        'buyConfirmTitle', 'buyConfirmMessage', 'buyConfirmBtn', 'buyCancelBtn'];
    const elements = Object.fromEntries(ids.map(id => [id, {
        style: {}, addEventListener: (event, handler) => { listeners[`${id}:${event}`] = handler; }
    }]));
    const saved = [], rewards = [], selected = [];
    const context = vm.createContext({
        document: { getElementById: id => elements[id] || null },
        window: {
            mechGemPrices: { mechDiy: 150, mechShield: 300, mechRocket: 600 },
            mechDescriptions: { mechDiy: { name: 'Штурмовой мех' }, mechShield: { name: 'Щитовой мех' }, mechRocket: { name: 'Ракетный мех' } }
        },
        unlockedTanks: ['normal'], gems: initialGems, tankGemPrices: { ice: 300 },
        tankDescriptions: { ice: { name: 'Ледяной танк' } },
        saveProgress: () => saved.push({ gems: context.gems, unlocked: [...context.unlockedTanks] }),
        updateCoinDisplay() {}, updateShopButtonStyles() {}, drawCharacterPreviews() {},
        showReward: (...args) => rewards.push(args), selectTank: type => selected.push(type), hideTankDetail() {}
    });
    vm.runInContext(main.slice(start, end), context);
    return { context, elements, listeners, saved, rewards, selected,
        open: type => context.window.setCurrentTankDetail(type),
        click: () => listeners['tankDetailSelect:click']() };
}

for (const [type, name, price] of [
    ['mechDiy', 'Штурмовой мех', 150], ['mechShield', 'Щитовой мех', 300], ['mechRocket', 'Ракетный мех', 600]
]) {
    test(`${name}: confirmation, cancellation, purchase and selection`, () => {
        const screen = purchaseScreen(1000);
        screen.open(type); screen.click();
        assert.equal(screen.elements.buyConfirmModal.style.display, 'flex');
        assert.equal(screen.elements.buyConfirmMessage.textContent, `Купить ${name} за ${price} гемов?`);
        screen.elements.buyCancelBtn.onclick();
        assert.equal(screen.context.gems, 1000);
        assert.deepEqual(screen.context.unlockedTanks, ['normal']);
        screen.click(); screen.elements.buyConfirmBtn.onclick();
        assert.equal(screen.context.gems, 1000 - price);
        assert.deepEqual(screen.context.unlockedTanks, ['normal', type]);
        assert.deepEqual(screen.saved, [{ gems: 1000 - price, unlocked: ['normal', type] }]);
        assert.equal(screen.elements.tankDetailSelect.textContent, 'Выбрать');
        assert.equal(screen.rewards[0][3], type);
        screen.click();
        assert.deepEqual(screen.selected, [type]);
    });
}

test('insufficient gems do not purchase a mech', () => {
    const screen = purchaseScreen(149);
    screen.open('mechDiy'); screen.click();
    assert.equal(screen.elements.buyConfirmTitle.textContent, 'Недостаточно гемов');
    assert.equal(screen.elements.buyConfirmBtn.style.display, 'none');
    assert.equal(screen.context.gems, 149);
    assert.deepEqual(screen.context.unlockedTanks, ['normal']);
    assert.equal(screen.saved.length, 0);
});

test('ordinary tank confirmation still uses the tank name', () => {
    const screen = purchaseScreen(300);
    screen.open('ice'); screen.click();
    assert.equal(screen.elements.buyConfirmMessage.textContent, 'Купить Ледяной танк за 300 гемов?');
});
