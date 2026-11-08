const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const source = fs.readFileSync(path.join(__dirname, '..', 'src', 'main.js'), 'utf8');
function section(start, end) {
    const a = source.indexOf(start), b = source.indexOf(end, a + start.length);
    assert.ok(a >= 0 && b > a, start);
    return source.slice(a, b);
}

function setup() {
    const store = new Map();
    const random = [];
    const math = Object.create(Math);
    math.random = () => random.length ? random.shift() : 0;
    const localStorage = {
        getItem: key => store.has(key) ? store.get(key) : null,
        setItem: (key, value) => store.set(key, String(value)),
        removeItem: key => store.delete(key)
    };
    const ctx = vm.createContext({ Math: math, localStorage, window: {},
        updateTankDetailButton() {}, escapeHtml: v => v,
        tankDescriptions: {}, getRandomInt: min => min });
    vm.runInContext("let coins=0, gems=0, parts=0, unlockedTanks=[];", ctx);
    vm.runInContext(section('const allTanksList =', '// Show reward modal'), ctx);
    vm.runInContext(section('function _isSmallEgg(av)', '// Get/set selected avatars per tank'), ctx);
    vm.runInContext(section('const PROFILE_BACKGROUNDS =', 'function renderProfilesList()'), ctx);
    vm.runInContext(section('const CONTAINER_REWARDS =', '// Open mini container'), ctx);
    return { ctx, random, localStorage };
}

test('container slot and cosmetic tables total 100 percent', () => {
    const { ctx } = setup();
    const configs = vm.runInContext('CONTAINER_REWARDS', ctx);
    for (const config of Object.values(configs)) {
        assert.equal(config.rewards.reduce((sum, entry) => sum + entry[1], 0), 100);
        assert.equal(config.icons.reduce((a, b) => a + b, 0), 100);
        assert.equal(config.backgrounds.reduce((a, b) => a + b, 0), 100);
        if (config.tanks) assert.equal(Object.values(config.tanks).reduce((a, b) => a + b, 0), 100);
    }
    assert.deepEqual(Array.from(configs.bronze.backgrounds), [70, 30]);
    assert.deepEqual(Array.from(configs.legendary.backgrounds), [60, 40]);
    assert.deepEqual(Array.from(configs.mythic.backgrounds), [55, 45]);
    assert.deepEqual(Array.from(configs.mythic.icons), [47.5, 40, 12.5]);
    assert.deepEqual({ ...configs.mythic.tanks }, { rare: 42.5, super_rare: 30, epic: 17.5, legendary: 7.5, mythic: 1.25, chromatic: 1.25 });
    assert.deepEqual(Array.from(configs.omega.backgrounds), [50, 50]);
    assert.deepEqual(Array.from(configs.alpha.backgrounds), [50, 50]);
});

test('rare backgrounds resolve local PNG artwork and moved menu assets are present', () => {
    const css = fs.readFileSync(path.join(__dirname, '..', 'style.css'), 'utf8');
    const { ctx } = setup();
    const backgrounds = vm.runInContext('CONTAINER_RARE_BACKGROUNDS', ctx);
    for (const name of backgrounds) {
        const file = path.join(__dirname, '..', 'pictures', 'png', 'rare-backgrounds', name + '.png');
        assert.ok(fs.existsSync(file), name);
        assert.equal(fs.readFileSync(file).subarray(1, 4).toString(), 'PNG', name);
        assert.ok(css.includes('pictures/png/rare-backgrounds/' + name + '.png'), name);
    }
    for (const file of ['currency-coin.svg', 'currency-gem.svg', 'currency-part.svg', 'currency-token.svg', 'currency-trophy.svg']) {
        assert.ok(fs.existsSync(path.join(__dirname, '..', 'pictures', 'svg', file)));
        assert.ok(css.includes('pictures/svg/' + file));
    }
    for (const file of ['drone-icon.jpg', 'mech-icon.jpg', 'tank-icon.jpg']) {
        assert.ok(fs.existsSync(path.join(__dirname, '..', 'pictures', 'png', 'icons-png', 'menu-icons', file)));
    }
});

test('each random slot follows the configured reward boundaries', () => {
    const { ctx, random } = setup();
    vm.runInContext("containerCosmeticReward = type => ({type}); containerTankReward = () => ({type:'tank'});", ctx);
    const cases = {
        bronze: [[0,'coins',15,25],[40,'coins',25,50],[70,'coins',50,80],[80,'gems',1,2],[87.5,'icon'],[95,'background']],
        legendary: [[0,'coins',50,100],[35,'coins',100,150],[60,'gems',2,4],[75,'icon'],[85,'background'],[92.5,'tank']],
        glitch: [[0,'coins',50,100],[30,'coins',100,150],[50,'gems',3,6],[65,'gems',6,10],[75,'icon'],[85,'background'],[92.5,'tank']],
        mythic: [[0,'coins',80,120],[32.25,'coins',120,180],[54.75,'gems',3,6],[67.25,'gems',6,8],[74.75,'icon'],[84.75,'background'],[92.25,'tank']],
        omega: [[0,'coins',100,150],[31,'coins',150,200],[52,'gems',4,8],[62.5,'gems',8,12],[70,'tank'],[80,'icon'],[92.5,'background']],
        alpha: [[0,'coins',150,200],[31.25,'coins',200,300],[52.5,'gems',6,8],[67.5,'icon'],[77.5,'background'],[87.5,'gems',8,12],[95,'tank']]
    };
    for (const [name, boundaries] of Object.entries(cases)) {
        for (const [value, type, amount, maximum] of boundaries) {
            random.push((value + .000001) / 100);
            const reward = ctx.rollContainerSlot(name, {});
            assert.equal(reward.type, type, `${name} ${value}%`);
            if (amount !== undefined) assert.equal(reward.amount, amount, `${name} ${value}%`);
            if (maximum !== undefined) {
                ctx.getRandomInt = (min, max) => max;
                random.push((value + .000001) / 100);
                assert.equal(ctx.rollContainerSlot(name, {}).amount, maximum, `${name} ${value}% maximum`);
                ctx.getRandomInt = min => min;
            }
        }
    }
});

test('glitch container count boundaries, single-slot table and multipliers', () => {
    for (const [roll, count] of [[0,2],[52.5,3],[82.5,4],[94.7,5],[98.7,8],[99.7,1],[99.9,10]]) {
        const { ctx, random } = setup();
        vm.runInContext("rollContainerSlot = () => ({type:'tank'})", ctx);
        random.push((roll + .00001) / 100, 0, 0);
        assert.equal(ctx.openGlitchRewards().length, count, String(roll));
    }
    for (const [roll, type, base] of [[0,'gems',5],[50,'gems',10],[80,'coins',100]]) {
        for (const [factorRoll, multiplier] of [[0,1],[85,2],[99,3]]) {
            const { ctx, random } = setup();
            random.push(.998, (roll + .00001) / 100, (factorRoll + .00001) / 100);
            const [reward] = ctx.openGlitchRewards();
            assert.equal(reward.type, type);
            assert.equal(reward.amount, base * multiplier);
            assert.equal(vm.runInContext(type, ctx), reward.amount);
            assert.equal(reward.multiplier || 1, multiplier);
        }
    }
    const { ctx, random } = setup();
    vm.runInContext("let slot = 0; rollContainerSlot = () => ++slot === 1 ? (coins += 50, {type:'coins',amount:50}) : (gems += 3, {type:'gems',amount:3});", ctx);
    random.push(0, .9, .995);
    const rewards = ctx.openGlitchRewards();
    assert.equal(rewards[0].amount, 100);
    assert.equal(rewards[1].amount, 9);
    assert.equal(vm.runInContext('coins', ctx), 100);
    assert.equal(vm.runInContext('gems', ctx), 9);
});

test('glitch artwork renders in the shop and opening flow', () => {
    const source = fs.readFileSync(path.join(__dirname, '..', 'src', 'container-art.js'), 'utf8');
    const labels = [];
    const drawing = new Proxy({}, { get(target, key) {
        if (key in target) return target[key];
        if (key === 'createLinearGradient' || key === 'createRadialGradient') return () => ({ addColorStop() {} });
        if (key === 'fillText') return text => labels.push(text);
        return () => {};
    }});
    const canvas = { width: 240, height: 200, dataset: { containerArt: 'glitch' }, getContext: () => drawing };
    const ctx = vm.createContext({ window: { matchMedia: () => ({ matches: true }) },
        document: { querySelectorAll: () => [canvas], getElementById: () => canvas, addEventListener() {}, hidden: false },
        performance: { now: () => 1000 }, requestAnimationFrame() {}, cancelAnimationFrame() {} });
    vm.runInContext(source, ctx);
    ctx.window.ContainerArt.showShop();
    ctx.window.ContainerArt.showFlow('glitch');
    ctx.window.ContainerArt.setFlowStage('open', 'glitch');
    assert.ok(labels.includes('ERR-?'));
    ctx.window.ContainerArt.hideFlow();
    ctx.window.ContainerArt.hideShop();
});

test('glitch false reveal never awards the false resource', () => {
    const nodes = Object.fromEntries(['rewardModal','rewardClaimBtn','rewardAmount','rewardDesc','rewardTitle'].map(id => [id, { style: {}, classList: { add() {}, remove() {} } }]));
    nodes.containerFlowModal = { dataset: { containerType: 'glitch' }, style: {} };
    let timer;
    const shown = [];
    const ctx = vm.createContext({ window: {}, Math: { random: () => 0, floor: Math.floor },
        document: { getElementById: id => nodes[id] || null, querySelector: () => ({ classList: { add() {}, remove() {} } }) },
        setTimeout: fn => { timer = fn; return 1; },
        showReward: (type, amount) => { shown.push([type, amount]); nodes.rewardClaimBtn.disabled = false; } });
    vm.runInContext(section('function markUpcomingContainerReward(', 'function handleContainerConfirm()'), ctx);
    const rewards = [{ type: 'coins', amount: 150 }];
    ctx.showContainerRewards(rewards);
    assert.deepEqual(shown, [['gems', 5]]);
    assert.equal(nodes.rewardClaimBtn.disabled, true);
    timer();
    assert.deepEqual(shown, [['gems', 5], ['coins', 150]]);
    assert.equal(rewards[0].amount, 150);
    assert.equal(nodes.rewardClaimBtn.disabled, false);
});

test('glitch false rewards can depict multiple currencies, tanks and cosmetics without granting them', () => {
    for (const [choice, expected, value] of [[0,'gems',5],[.2,'gems',15],[.4,'tank',''],[.6,'profileIcon',''],[.9,'profileBackground','']]) {
        const nodes = Object.fromEntries(['rewardModal','rewardClaimBtn','rewardAmount','rewardDesc','rewardTitle','rewardIcon'].map(id => [id, { style: {}, classList: { add() {}, remove() {} } }]));
        nodes.containerFlowModal = { dataset: { containerType: 'glitch' }, style: {} };
        const rolls = [0, choice], shown = [];
        let timer;
        const ctx = vm.createContext({ window: {}, Math: { random: () => rolls.shift(), floor: Math.floor },
            document: { getElementById: id => nodes[id] || null, querySelector: () => ({ classList: { add() {}, remove() {} } }) },
            setTimeout: fn => { timer = fn; return 1; }, profileAvatarMarkup: () => '<span>icon</span>',
            showReward: (type, amount) => { shown.push([type, amount]); nodes.rewardClaimBtn.disabled = false; } });
        vm.runInContext(section('function markUpcomingContainerReward(', 'function handleContainerConfirm()'), ctx);
        const actual = { type: 'coins', amount: 150 };
        ctx.showContainerRewards([actual]);
        assert.deepEqual(shown[0], [expected, value]);
        timer();
        assert.deepEqual(shown[1], ['coins', 150]);
        assert.deepEqual(actual, { type: 'coins', amount: 150 });
    }
});

test('mini and parts container reward boundaries', () => {
    const { ctx, random } = setup();
    vm.runInContext(section('// Open mini container', '// Open bronze and legendary containers'), ctx);
    vm.runInContext(section('// Open Mechanic Parts Container', '// Open omega and alpha random slots'), ctx);
    for (const [roll, amount] of [[0,10],[80,20],[95,40],[98,60]]) {
        random.push(roll / 100);
        assert.equal(ctx.openMiniContainer({ suppressRewardModal: true }).amount, amount);
    }
    for (const [roll, type, amount, maximum] of [[0,'coins',50,100],[25,'coins',100,150],[42.5,'parts',80,100],[70,'parts',100,200],[92.5,'parts',200,300],[99.5,'parts',600,1000]]) {
        random.push(roll / 100);
        const reward = ctx.openMechPartsContainer({ suppressRewardModal: true });
        assert.equal(reward.type, type);
        assert.equal(reward.amount, amount);
        assert.equal(!!reward.jackpot, roll === 99.5);
        ctx.getRandomInt = (min, max) => max;
        random.push(roll / 100);
        assert.equal(ctx.openMechPartsContainer({ suppressRewardModal: true }).amount, maximum);
        ctx.getRandomInt = min => min;
    }
});

test('cosmetics exclude owned items, redistribute categories and persist', () => {
    const { ctx, localStorage } = setup();
    const rare = vm.runInContext('PROFILE_AVATAR_TIERS.rare', ctx);
    localStorage.setItem('tankAvatarUnlocks', JSON.stringify(rare.slice(0, -1)));
    const icon = vm.runInContext("containerCosmeticReward('icon', CONTAINER_REWARDS.bronze)", ctx);
    assert.equal(icon.avatar, rare[rare.length - 1]);
    assert.ok(JSON.parse(localStorage.getItem('tankAvatarUnlocks')).includes(icon.avatar));
    const next = vm.runInContext("containerCosmeticReward('icon', CONTAINER_REWARDS.bronze)", ctx);
    assert.equal(vm.runInContext('_getAvatarTier', ctx)(next.avatar), 'unique');
    const background = vm.runInContext("containerCosmeticReward('background', CONTAINER_REWARDS.bronze)", ctx);
    assert.equal(background.background, 'steel');
    assert.ok(JSON.parse(localStorage.getItem('tankBackgroundUnlocks')).includes('steel'));
    assert.equal(ctx.profileBackgroundName('steel'), 'steel');
});

test('cosmetic rewards identify avatar rarity and background type', () => {
    const { ctx, random } = setup();
    for (const [roll, label] of [[0, 'Редкая иконка'], [.65, 'Эпическая иконка'], [.99, 'Анимированная иконка']]) {
        random.push(roll);
        const reward = vm.runInContext("containerCosmeticReward('icon', CONTAINER_REWARDS.bronze)", ctx);
        assert.equal(reward.category, label);
        assert.equal(reward.desc, label + ' профиля');
    }
    for (const [roll, label] of [[0, 'Обычный фон'], [.8, 'Редкий фон']]) {
        random.push(roll);
        const reward = vm.runInContext("containerCosmeticReward('background', CONTAINER_REWARDS.bronze)", ctx);
        assert.equal(reward.category, label);
        assert.equal(reward.desc, label);
    }
});

test('cosmetic reward screen applies the category color and icon backdrop', () => {
    const nodes = {
        rewardModal: {}, rewardClaimBtn: {}, rewardTitle: {},
        rewardAmount: { style: {} },
        rewardIcon: { classList: { add(name) { nodes.rewardIcon.added = name; } } }
    };
    const box = { classes: new Set(), classList: { add(name) { box.classes.add(name); } } };
    const ctx = vm.createContext({ window: {}, document: { getElementById: id => nodes[id], querySelector: () => box },
        showReward() {}, profileAvatarMarkup: () => '<span>icon</span>', PROFILE_BACKGROUNDS: { steel: 'Сталь' } });
    vm.runInContext(section('function markUpcomingContainerReward(', 'function handleContainerConfirm()'), ctx);
    for (const rarity of ['rare', 'epic', 'animated']) {
        ctx.showContainerRewards([{ type: 'profileIcon', avatar: 'icon', rarity, category: rarity }]);
        assert.ok(box.classes.has('reward-cosmetic--' + rarity));
        assert.ok(box.classes.has('reward-icon-reveal'));
        assert.equal(nodes.rewardIcon.added, 'cosmetic-reward-icon');
        assert.equal(nodes.rewardAmount.textContent, rarity);
    }
    for (const rarity of ['common', 'rare']) {
        ctx.showContainerRewards([{ type: 'profileBackground', background: 'steel', rarity }]);
        assert.ok(box.classes.has('reward-cosmetic--' + rarity));
        assert.ok(box.classes.has('reward-background-reveal'));
        assert.equal(nodes.rewardAmount.textContent, 'Сталь');
    }
});

test('drop animation shows only mystery slots and stops on cleanup', () => {
    const timers = new Map();
    let nextId = 0, finished = false;
    const createNode = () => ({ style: {}, children: [], attrs: {}, classList: {
        values: [], add(...names) { this.values.push(...names); }, remove() {}
    }, setAttribute(name, value) { this.attrs[name] = value; }, appendChild(child) { this.children.push(child); } });
    const area = createNode();
    const ctx = vm.createContext({ containerDropArea: area, document: {
        querySelector: () => null, createElement: createNode
    }, setTimeout: fn => { timers.set(++nextId, fn); return nextId; },
    clearTimeout: id => timers.delete(id), requestAnimationFrame: fn => fn(),
    profileAvatarMarkup: () => '<span>icon</span>' });
    vm.runInContext(section('let containerDropTimers = []', 'function showContainerFlow('), ctx);
    ctx.animateContainerDrops([
        { type: 'profileIcon', avatar: 'icon', rarity: 'epic', desc: 'Эпическая иконка' },
        { type: 'tank', tankType: 'time', rarity: 'chromatic', desc: 'Время' }
    ], () => { finished = true; });
    assert.equal(area.children[0].textContent, '?');
    assert.equal(area.children[0].innerHTML, undefined);
    assert.equal(area.children[0].title, undefined);
    assert.equal(area.children[0].attrs['data-label'], undefined);
    assert.ok(!area.children[0].classList.values.includes('container-drop-item--epic'));
    const firstTimer = timers.entries().next().value;
    timers.delete(firstTimer[0]); firstTimer[1]();
    const tank = area.children[1];
    assert.ok(!tank.classList.values.includes('container-drop-item--chromatic'));
    assert.equal(tank.textContent, '?');
    assert.equal(tank.title, undefined);
    assert.equal(tank.attrs['data-label'], undefined);
    ctx.clearContainerDropTimers();
    assert.equal(timers.size, 0);
    assert.equal(finished, false);
});

test('upcoming tank and parts jackpot burn until revealed', () => {
    function slot() {
        let classes = new Set(['container-drop-item--mystery']);
        const item = { style: {}, setAttribute() {} };
        Object.defineProperty(item, 'className', { set: value => { classes = new Set(value.split(' ')); } });
        item.classList = { add: value => classes.add(value), contains: value => classes.has(value) };
        return item;
    }
    const items = [slot(), slot(), slot(), slot()];
    const ctx = vm.createContext({ document: { getElementById: () => ({ children: items }) } });
    vm.runInContext(section('function markUpcomingContainerReward(', 'function showContainerRewards('), ctx);
    const rewards = [{ type: 'coins' }, { type: 'tank' }, { type: 'parts', amount: 600, jackpot: true }, { type: 'profileIcon' }];
    ctx.markUpcomingContainerReward(rewards, 0);
    assert.ok(items[1].classList.contains('container-drop-item--fire'));
    assert.ok(!items[2].classList.contains('container-drop-item--fire'));
    ctx.markUpcomingContainerReward(rewards, 1);
    assert.ok(items[2].classList.contains('container-drop-item--fire'));
    ctx.markUpcomingContainerReward(rewards, 2);
    assert.ok(items[3].classList.contains('container-drop-item--special'));
    assert.ok(!items[3].classList.contains('container-drop-item--fire'));
    ctx.revealContainerStripReward(rewards[2], 2);
    assert.ok(!items[2].classList.contains('container-drop-item--fire'));
});

test('jackpot waits before revealing and respects reduced motion', () => {
    for (const reduced of [false, true]) {
        const nodes = { rewardModal: {}, rewardClaimBtn: {}, rewardAmount: {}, rewardDesc: {} };
        let reveal;
        const ctx = vm.createContext({ window: { matchMedia: () => ({ matches: reduced }) },
            document: { getElementById: id => nodes[id] },
            setTimeout: fn => { reveal = fn; return 1; },
            showReward() { nodes.rewardAmount.textContent = '600'; nodes.rewardDesc.textContent = 'parts'; } });
        vm.runInContext(section('function markUpcomingContainerReward(', 'function handleContainerConfirm()'), ctx);
        ctx.showContainerRewards([{ type: 'parts', amount: 600, jackpot: true }]);
        if (reduced) {
            assert.equal(nodes.rewardAmount.textContent, '600');
            assert.equal(reveal, undefined);
        } else {
            assert.equal(nodes.rewardAmount.textContent, '???');
            assert.equal(nodes.rewardClaimBtn.disabled, true);
            reveal();
            assert.equal(nodes.rewardAmount.textContent, '600');
            assert.equal(nodes.rewardClaimBtn.disabled, false);
        }
    }
});

test('tank reward remains hidden until the reveal completes', () => {
    const nodes = { rewardModal: {}, rewardClaimBtn: {}, rewardTitle: {}, rewardAmount: {}, rewardDesc: {} };
    const classes = new Set();
    const box = { classList: { add: value => classes.add(value), remove: value => classes.delete(value) } };
    let reveal, revealDuration;
    const ctx = vm.createContext({ window: {}, document: { getElementById: id => nodes[id], querySelector: () => box },
        setTimeout: (fn, duration) => { reveal = fn; revealDuration = duration; return 1; },
        showReward() { nodes.rewardTitle.textContent = 'Танк'; nodes.rewardAmount.textContent = 'Время'; nodes.rewardDesc.textContent = 'Открыт'; } });
    vm.runInContext(section('function markUpcomingContainerReward(', 'function handleContainerConfirm()'), ctx);
    ctx.showContainerRewards([{ type: 'tank', tankType: 'time' }]);
    assert.equal(nodes.rewardAmount.textContent, '???');
    assert.equal(nodes.rewardClaimBtn.disabled, true);
    assert.ok(classes.has('reward-tank-reveal'));
    assert.equal(revealDuration, 950);
    reveal();
    assert.equal(nodes.rewardAmount.textContent, 'Время');
    assert.equal(nodes.rewardClaimBtn.disabled, false);
    assert.ok(!classes.has('reward-tank-reveal'));
});

test('container reward card stays inline and strip reveals only the viewed rewards', () => {
    function node() {
        const item = { style: {}, dataset: {}, children: [], attrs: {},
            appendChild(child) {
                if (child.parentElement) child.parentElement.children = child.parentElement.children.filter(value => value !== child);
                this.children.push(child); child.parentElement = this;
            },
            setAttribute(name, value) { this.attrs[name] = value; }
        };
        let classes = new Set();
        Object.defineProperty(item, 'className', { get: () => [...classes].join(' '), set: value => { classes = new Set(value.split(' ')); } });
        item.classList = { add: value => classes.add(value), remove: value => classes.delete(value), contains: value => classes.has(value) };
        return item;
    }
    const ids = Object.fromEntries(['rewardModal','rewardTitle','rewardIconContainer','rewardIcon','rewardAmount','rewardDesc','rewardClaimBtn','containerRewardStage','containerDropArea','containerFlowModal'].map(id => [id,node()]));
    const box = node();
    ids.rewardModal.appendChild(box);
    ids.containerRewardStage.querySelector = () => box.parentElement === ids.containerRewardStage ? box : null;
    ids.containerFlowModal.style.display = 'flex';
    for (let i = 0; i < 3; i++) { const slot = node(); slot.className = 'container-drop-item--mystery'; slot.textContent = '?'; ids.containerDropArea.appendChild(slot); }
    let queued = 0;
    const ctx = vm.createContext({ window: {}, containerFlowType: 'bronze', containerFlowModal: ids.containerFlowModal,
        containerDropArea: ids.containerDropArea, document: { getElementById: id => ids[id] || null, querySelector: selector => selector === '.reward-box' ? box : null, createElement: node },
        setTimeout: () => 1, clearTimeout() {}, processNextContainer() { queued++; },
        profileAvatarMarkup: () => '<span>icon</span>', PROFILE_BACKGROUNDS: { steel: 'Сталь' } });
    vm.runInContext(section('let containerDropTimers = []', 'function showContainerFlow('), ctx);
    vm.runInContext(section('function showReward(', 'function unlockRandomTank('), ctx);
    vm.runInContext(section('function markUpcomingContainerReward(', 'function handleContainerConfirm()'), ctx);
    ctx.processNextContainer = () => { queued++; };
    const rewards = [{ type: 'coins', amount: 20 }, { type: 'profileIcon', avatar: 'icon', rarity: 'rare', category: 'Редкая иконка' }, { type: 'profileBackground', background: 'steel', rarity: 'common' }];
    ctx.showContainerRewards(rewards);
    assert.equal(box.parentElement, ids.containerRewardStage);
    assert.equal(ids.rewardModal.style.display, 'none');
    assert.ok(ids.containerDropArea.children[0].classList.contains('container-drop-item--revealed'));
    assert.ok(ids.containerDropArea.children[1].classList.contains('container-drop-item--special'));
    assert.ok(!ids.containerDropArea.children[2].classList.contains('container-drop-item--revealed'));
    ids.rewardClaimBtn.onclick();
    assert.ok(ids.containerDropArea.children[1].classList.contains('container-drop-item--revealed'));
    assert.ok(ids.containerDropArea.children[2].classList.contains('container-drop-item--special'));
    ids.rewardClaimBtn.onclick();
    assert.ok(ids.containerDropArea.children.every(slot => slot.classList.contains('container-drop-item--revealed')));
    assert.equal(ids.containerFlowModal.style.display, 'flex');
    ids.rewardClaimBtn.onclick();
    assert.equal(ids.containerFlowModal.style.display, 'none');
    assert.equal(box.parentElement, ids.rewardModal);
    assert.equal(queued, 1);
});

test('tank strip previews use vehicle rarity backgrounds and fit inside circular slots', () => {
    const item = { style: {}, classList: { add() {} }, setAttribute() {}, appendChild(child) { this.preview = child; } };
    const draws = [];
    const ctx = vm.createContext({ window: {
        tankBgGradients: { ice: ['#9b59b6', '#8e44ad'], toxic: ['#40f6d1', '#11a89c'] },
        tankBaseColors: { ice: '#54d1e8' }
    }, document: {
        getElementById: () => ({ children: [item] }),
        createElement: () => ({ style: {}, getContext: () => ({}) })
    }, drawTankOn: (...args) => draws.push(args) });
    vm.runInContext(section('function revealContainerStripReward(', 'function showContainerRewards('), ctx);
    for (const [tankType, rarity, color] of [['ice', 'epic', '#9b59b6'], ['toxic', 'legendary', '#40f6d1'], ['time', 'chromatic', '#ff0044']]) {
        ctx.revealContainerStripReward({ type: 'tank', tankType, rarity }, 0);
        assert.ok(item.style.background.includes(color));
        assert.equal(item.preview.className, 'container-strip-tank');
        const draw = draws.at(-1);
        assert.equal(draw[1], item.preview.width / 2);
        assert.equal(draw[2], item.preview.height / 2);
        assert.ok(draw[3] <= item.preview.width * .35);
        assert.equal(draw[8], tankType);
    }
    const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
    assert.ok(html.indexOf('id="containerRewardStage"') < html.indexOf('id="containerDropArea"'));
    const css = fs.readFileSync(path.join(__dirname, '..', 'style.css'), 'utf8');
    assert.match(css, /\.container-strip-tank\s*\{[^}]*background:\s*transparent/);
    assert.match(css, /\.container-strip-tank\s*\{[^}]*border-radius:\s*50%/);
});

test('ordinary gems can drop repeatedly and exhausted cosmetics reroll without tanks', () => {
    const { ctx, random, localStorage } = setup();
    random.push(.81, .81);
    const opening = {};
    assert.equal(ctx.rollContainerSlot('bronze', opening).type, 'gems');
    assert.equal(ctx.rollContainerSlot('bronze', opening).type, 'gems');
    const avatars = vm.runInContext('[...PROFILE_AVATAR_TIERS.rare,...PROFILE_AVATAR_TIERS.unique,...PROFILE_AVATAR_TIERS.animated]', ctx);
    localStorage.setItem('tankAvatarUnlocks', JSON.stringify(avatars));
    random.push(.80, 0);
    assert.equal(ctx.rollContainerSlot('legendary', {}).type, 'coins');
    localStorage.setItem('tankBackgroundUnlocks', JSON.stringify(vm.runInContext('[...CONTAINER_ORDINARY_BACKGROUNDS,...CONTAINER_RARE_BACKGROUNDS]', ctx)));
    random.push(.9, 0);
    assert.equal(ctx.rollContainerSlot('legendary', {}).type, 'coins');
});

test('duplicate tanks reroll without tanks and new random tanks reduce later chance', () => {
    const { ctx, random } = setup();
    vm.runInContext("unlockedTanks.push('machinegun')", ctx);
    random.push(.72, 0, 0);
    const opening = {};
    assert.equal(ctx.rollContainerSlot('omega', opening).type, 'coins');
    assert.equal(opening.randomTanks, undefined);
    vm.runInContext('unlockedTanks = []', ctx);
    random.push(.72, 0);
    assert.equal(ctx.rollContainerSlot('omega', opening).type, 'tank');
    assert.equal(opening.randomTanks, 1);
    random.push(.71);
    assert.notEqual(ctx.rollContainerSlot('omega', opening).type, 'tank');
    vm.runInContext('unlockedTanks = []', ctx);
    random.push(.72, 0);
    assert.equal(ctx.rollContainerSlot('omega', {}).type, 'tank');
});

test('alpha guaranteed slot picks only new tanks and compensates a complete collection', () => {
    const { ctx, random } = setup();
    vm.runInContext("unlockedTanks.push('fire')", ctx);
    random.push(0);
    const newTank = ctx.openAlphaGuaranteedSlot();
    assert.equal(newTank.type, 'tank');
    assert.equal(newTank.rarity, 'super_rare');
    assert.notEqual(newTank.tankType, 'fire');
    vm.runInContext("unlockedTanks = allTanksList.filter(t => tankRarityMap[t] === 'super_rare')", ctx);
    random.push(0);
    assert.equal(ctx.openAlphaGuaranteedSlot().rarity, 'epic');
    vm.runInContext("unlockedTanks = allTanksList.filter(t => tankRarityMap[t] !== 'rare')", ctx);
    random.push(0);
    const rare = ctx.openAlphaGuaranteedSlot();
    assert.equal(rare.type, 'tank');
    assert.equal(rare.rarity, 'rare');
    vm.runInContext('unlockedTanks = [...allTanksList]', ctx);
    for (const [roll, type, amount] of [[0, 'coins', 300], [.5, 'coins', 350], [.75, 'gems', 10], [.95, 'gems', 20]]) {
        random.push(roll);
        const reward = ctx.openAlphaGuaranteedSlot();
        assert.equal(reward.type, type);
        assert.equal(reward.amount, amount);
    }
    vm.runInContext('unlockedTanks = []', ctx);
    random.push(0);
    assert.equal(ctx.openAlphaGuaranteedSlot().type, 'tank');
    const opening = {};
    random.push(.96, 0);
    assert.equal(ctx.rollContainerSlot('alpha', opening).type, 'tank');
    assert.equal(opening.randomTanks, 1);
});
