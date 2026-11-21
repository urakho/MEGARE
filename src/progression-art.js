// ImageGen atlases are shared CSS backgrounds, decoded once by the browser.
(() => {
    const vehicles = ['normal','fire','ice','electric','plasma','toxic','egyptian','mine','mirror','time','imitator','robot','roman','spartan','illuminat','machinegun','buckshot','waterjet','buratino','air','kamikaze','musical','medical','pyro','burovoy','mechDiy','mechShield','mechRocket','kvant','myasnoy'];
    function sprite(file, index, columns, rows, size, extra = '', zoom = 1, offsetX = 0, offsetY = 0) {
        const x = ((index % columns + 0.5 + offsetX) * zoom - 0.5) * 100 / (columns * zoom - 1);
        const y = ((Math.floor(index / columns) + 0.5 + offsetY) * zoom - 0.5) * 100 / (rows * zoom - 1);
        const width = Math.round(columns * zoom * 10000) / 100;
        const height = Math.round(rows * zoom * 10000) / 100;
        return `<span class="progression-sprite ${extra}" role="img" aria-label="Insignia" style="width:${size}px;height:${size}px;background-image:url('pictures/png/progression/${file}.png');background-size:${width}% ${height}%;background-position:${x}% ${y}%"></span>`;
    }
    window.vehicleInsignia = (type, step, size) => {
        const index = vehicles.indexOf(type);
        const tier = [750,1750,3500,5000,10000].indexOf(step);
        if (index < 0 || tier < 0) return '';
        // The first atlas places its insignia slightly right and below each cell's centre.
        const offsetX = tier === 0 ? 0.05 : 0;
        const offsetY = tier === 0 ? 0.03 : tier === 1 || tier === 3 ? 0.02 : tier === 4 ? -0.02 : 0;
        return sprite('vehicles-tier-' + (tier + 1), index, 6, 5, size, 'vehicle-insignia mastery-' + step, 1.12, offsetX, offsetY);
    };
    window.leagueInsignia = (league, index, size = 120) => sprite('leagues-v3', Math.max(0, Math.min(11, index)), 4, 3, size);
    // The profile header is rendered by main.js, before the reward scripts load.
    window.leagueAvatarMarkup = (id, size) => {
        const match = /^league:(\d+)$/.exec(id || '');
        const index = match ? Number(match[1]) : 0;
        return index >= 1 && index <= 11 ? window.leagueInsignia(null, index, size) : '';
    };
    window.tankRoadAvatarMarkup = (id, size) => {
        const match = /^tank-road:([a-zA-Z]+):(750|1750|3500|5000|10000)$/.exec(id || '');
        return match ? window.vehicleInsignia(match[1], Number(match[2]), size) : '';
    };
})();
