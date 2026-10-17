const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const source = fs.readFileSync(path.join(__dirname, '..', 'src', 'main.js'), 'utf8');
const start = source.indexOf('let _lastDisplayedResources = null;');
const end = source.indexOf('// Track whether a negative-resource warning', start);

test('resource display saves only when a resource changes', () => {
    let saves = 0;
    const coinDisplay = { textContent: '' };
    const context = vm.createContext({
        coins: 10, gems: 2, trophies: 3, parts: 4,
        trophyRoadRewards: [],
        _domCache: {
            coinDisplay, gemDisplay: null, trophyDisplay: null, partDisplay: null,
            currencyCoins: [], currencyGems: [], currencyTrophies: [], currencyParts: [],
            trophyBarFill: null
        },
        _ensureDOMCache: () => {},
        checkTrophyRewards: () => {},
        saveProgress: () => { saves++; },
        scheduleNegativeResourceCheck: () => {}
    });
    vm.runInContext(source.slice(start, end), context);
    context.updateCoinDisplay();
    context.updateCoinDisplay();
    assert.equal(saves, 1);
    assert.equal(coinDisplay.textContent, 10);
    context.coins = 15;
    context.updateCoinDisplay();
    assert.equal(saves, 2);
    assert.equal(coinDisplay.textContent, 15);
});
