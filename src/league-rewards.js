// Exclusive league cosmetics never enter container or shop reward pools.
(() => {
    const backgrounds = [];
    const rules = [];
    TROPHY_LEAGUES.forEach((league, index) => {
        if (!index) return;
        const id = 'league-' + index;
        backgrounds.push(id);
        PROFILE_BACKGROUNDS[id] = league.name;
        const x = (index - 1) % 4 * 100 / 3;
        const y = Math.floor((index - 1) / 4) * 50;
        rules.push(`.profile-bg--${id}{--unique-league-color:${league.color};--unique-league-angle:${100 + index * 13}deg;--unique-league-spacing:${10 + index * 3}px}.profile-bg--${id}::after{background-position:${x}% ${y}%}`);
    });
    window.UNIQUE_LEAGUE_BACKGROUNDS = backgrounds;
    const style = document.createElement('style');
    style.textContent = rules.join('\n');
    document.head.appendChild(style);
    window.leagueAvatarMarkup = (id, size) => {
        const index = Number(id.slice(7));
        if (!Number.isInteger(index) || index < 1 || index >= TROPHY_LEAGUES.length) return '';
        return window.leagueInsignia(TROPHY_LEAGUES[index], index, size);
    };
    window.claimLeagueCosmetics = index => {
        if (!Number.isInteger(index) || index < 1 || index >= TROPHY_LEAGUES.length || trophies < TROPHY_LEAGUES[index].base) return;
        const league = TROPHY_LEAGUES[index];
        _unlockAvatar('league:' + index);
        const unlocks = _getBackgroundUnlocks();
        const id = 'league-' + index;
        if (!unlocks.includes(id)) unlocks.push(id);
        localStorage.setItem('tankBackgroundUnlocks', JSON.stringify(unlocks));
        window.showProgressionRewards([
            { title: 'УНИКАЛЬНАЯ ИКОНКА', label: league.name, leagueColor: league.color, art: window.leagueAvatarMarkup('league:' + index, 150) },
            { title: 'УНИКАЛЬНЫЙ ФОН', label: league.name, leagueColor: league.color, background: true, art: `<div class="profile-background-option profile-bg--${id} unique-league-reveal"></div>` }
        ]);
    };
    // Older profiles already claimed one alpha at 10000; queue the two missing ones.
    if (localStorage.getItem('megareAlphaRewardV2') !== 'true') {
        const index = trophyRoadRewards.findIndex(reward => reward.trophies === 10000 && reward.level === 'alpha');
        if (claimedRewards.includes(index)) {
            const leagueColor = TROPHY_LEAGUES.find(league => league.base === 10000).color;
            containerQueue.push({ type: 'alpha', leagueColor }, { type: 'alpha', leagueColor });
            localStorage.setItem('pendingFreeContainers', JSON.stringify(containerQueue));
        }
        localStorage.setItem('megareAlphaRewardV2', 'true');
        saveProgress();
    }
})();
