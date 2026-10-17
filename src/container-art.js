// Canvas art shared by the shop cards and the container opening screen.
(function () {
    const themes = {
        mini:      { base: '#9b5d18', light: '#e8ad38', dark: '#493014', metal: '#474951', rim: '#f6c64d', glow: '255,190,56', mark: '◆' },
        bronze:    { base: '#49694d', light: '#82a47b', dark: '#243d31', metal: '#776b47', rim: '#e6bc55', glow: '178,215,115', mark: 'Ⅱ' },
        legendary: { base: '#39454a', light: '#71817b', dark: '#20282c', metal: '#a48143', rim: '#ffc95d', glow: '255,194,67', mark: '✦' },
        omega:     { base: '#d5e5ee', light: '#ffffff', dark: '#657e9c', metal: '#a77b3c', rim: '#f9cf70', glow: '102,208,255', mark: 'Ω' },
        alpha:     { base: '#3d444a', light: '#7e8990', dark: '#1a242c', metal: '#87979d', rim: '#ffc34d', glow: '255,180,42', mark: 'Α' },
        mechParts: { base: '#536b35', light: '#859d52', dark: '#27391e', metal: '#9ba4a5', rim: '#e9cf42', glow: '218,207,64', mark: '⚙' },
    };

    const cards = Array.from(document.querySelectorAll('.container-shop-art'));
    const flow = document.getElementById('containerFlowPreview');
    const shopPane = document.getElementById('shopTabContainers');
    if (!flow || !cards.length) return;

    const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches || false;
    const visibleCards = new Set();
    let observer = null;
    let shopActive = false;
    let flowActive = false;
    let flowType = 'bronze';
    let flowStage = 'intro';
    let openedAt = 0;
    let animationId = null;
    let lastPaint = 0;

    function polygon(ctx, points, fill, stroke, width = 1) {
        ctx.beginPath();
        ctx.moveTo(points[0][0], points[0][1]);
        for (let i = 1; i < points.length; i++) ctx.lineTo(points[i][0], points[i][1]);
        ctx.closePath();
        ctx.fillStyle = fill;
        ctx.fill();
        if (stroke) {
            ctx.strokeStyle = stroke;
            ctx.lineWidth = width;
            ctx.stroke();
        }
    }

    function roundRect(ctx, x, y, w, h, r, fill, stroke, width = 1) {
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.lineTo(x + w - r, y);
        ctx.quadraticCurveTo(x + w, y, x + w, y + r);
        ctx.lineTo(x + w, y + h - r);
        ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
        ctx.lineTo(x + r, y + h);
        ctx.quadraticCurveTo(x, y + h, x, y + h - r);
        ctx.lineTo(x, y + r);
        ctx.quadraticCurveTo(x, y, x + r, y);
        ctx.closePath();
        ctx.fillStyle = fill;
        ctx.fill();
        if (stroke) {
            ctx.strokeStyle = stroke;
            ctx.lineWidth = width;
            ctx.stroke();
        }
    }

    function linear(ctx, y1, y2, stops) {
        const gradient = ctx.createLinearGradient(0, y1, 0, y2);
        for (const [at, color] of stops) gradient.addColorStop(at, color);
        return gradient;
    }

    function glow(ctx, x, y, radius, rgb, opacity) {
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
        gradient.addColorStop(0, `rgba(${rgb},${opacity})`);
        gradient.addColorStop(1, `rgba(${rgb},0)`);
        ctx.fillStyle = gradient;
        ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);
    }

    function star(ctx, x, y, size, color, alpha = 1) {
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.strokeStyle = color;
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.moveTo(x - size, y); ctx.lineTo(x + size, y);
        ctx.moveTo(x, y - size); ctx.lineTo(x, y + size);
        ctx.stroke();
        ctx.fillStyle = '#fff';
        ctx.beginPath(); ctx.arc(x, y, 1.3, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
    }

    function bolt(ctx, x, y) {
        ctx.fillStyle = '#18242b';
        ctx.beginPath(); ctx.arc(x, y, 3, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#c4c9c0';
        ctx.beginPath(); ctx.arc(x - 0.5, y - 0.5, 1.5, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = 'rgba(30,39,43,0.8)';
        ctx.lineWidth = 0.8;
        ctx.beginPath(); ctx.moveTo(x - 1.3, y + 0.5); ctx.lineTo(x + 0.8, y - 1); ctx.stroke();
    }

    function line(ctx, x1, y1, x2, y2, color, width = 1) {
        ctx.strokeStyle = color;
        ctx.lineWidth = width;
        ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
    }

    function metalGradient(ctx, y1, y2, theme) {
        return linear(ctx, y1, y2, [
            [0, '#e1e1ce'], [0.13, theme.metal], [0.52, '#303c40'], [0.87, theme.metal], [1, '#141b21']
        ]);
    }

    function drawLid(ctx, type, theme, open) {
        ctx.save();
        ctx.translate(120, 94 - 31 * open);
        ctx.rotate(-0.09 * open);
        ctx.translate(-120, -94);

        // Thick bevelled lid: the inset top, front lip and side face each catch light differently.
        polygon(ctx, [[39,95],[63,66],[207,76],[191,96]], '#101a20', '#182329', 3);
        polygon(ctx, [[42,93],[65,69],[203,78],[188,95]],
            linear(ctx, 67, 98, [[0, theme.light],[0.32, theme.base],[1, theme.dark]]), theme.metal, 2);
        polygon(ctx, [[58,91],[71,75],[193,82],[181,94]],
            linear(ctx, 75, 96, [[0, theme.light],[0.28, theme.base],[1, theme.dark]]), 'rgba(255,255,255,0.24)', 1);
        polygon(ctx, [[190,96],[207,76],[207,101],[190,118]],
            linear(ctx, 76, 118, [[0, theme.base],[0.4, theme.dark],[1, '#131b20']]), theme.metal, 2);
        polygon(ctx, [[40,94],[190,96],[190,118],[40,114]],
            linear(ctx, 94, 118, [[0, theme.light],[0.12, theme.base],[0.48, theme.dark],[0.68, theme.base],[1, '#1b2328']]),
            theme.metal, 2);
        polygon(ctx, [[56,98],[175,99],[174,109],[56,108]],
            linear(ctx, 98, 110, [[0, theme.base],[0.5, theme.dark],[1, theme.base]]), 'rgba(255,255,255,0.17)', 1);
        line(ctx, 66, 70, 200, 79, 'rgba(255,255,255,0.52)', 1.3);
        line(ctx, 42, 94, 189, 96, theme.rim, 2.2);
        line(ctx, 44, 116, 187, 119, 'rgba(0,0,0,0.65)', 2);
        polygon(ctx, [[40,94],[58,96],[60,115],[40,114]], metalGradient(ctx, 94, 115, theme), '#192126', 1.5);
        polygon(ctx, [[172,96],[190,96],[190,117],[173,117]], metalGradient(ctx, 96, 117, theme), '#192126', 1.5);
        bolt(ctx, 49, 102); bolt(ctx, 181, 103);
        bolt(ctx, 51, 110); bolt(ctx, 180, 111);

        if (type === 'mini') {
            roundRect(ctx, 99, 64, 43, 16, 6, '#161d22', '#d6d4c5', 2);
            roundRect(ctx, 105, 68, 31, 7, 3, '#0a1015', '#777c7d', 1);
            for (const x of [76, 166]) {
                polygon(ctx, [[x - 5,73],[x + 4,74],[x + 11,94],[x + 1,93]], '#323b40', '#d7cba1', 1);
                line(ctx, x - 2, 75, x + 4, 91, 'rgba(255,255,255,0.5)');
            }
        } else if (type === 'bronze' || type === 'mechParts') {
            for (const x of [83, 157]) {
                polygon(ctx, [[x - 9,71],[x - 1,71],[x + 8,94],[x,94]], metalGradient(ctx, 71, 95, theme), '#172326', 1.4);
                bolt(ctx, x - 3, 78);
                if (type === 'mechParts') {
                    line(ctx, x - 6, 75, x - 2, 80, '#f9d43d', 2.5);
                    line(ctx, x, 84, x + 5, 90, '#f9d43d', 2.5);
                }
            }
            if (type === 'bronze') {
                for (let x = 69; x <= 181; x += 10) {
                    line(ctx, x, 76 + (x - 69) * 0.06, x + 7, 91 + (x - 69) * 0.03,
                        'rgba(17,42,33,0.23)', 1.2);
                }
            }
        } else if (type === 'legendary') {
            for (const x of [61, 177]) {
                polygon(ctx, [[x,82],[x + 8,81],[x + 13,94],[x + 3,94]], '#b1904e', '#222a2b', 1);
                glow(ctx, x + 5, 83, 12, theme.glow, 0.5);
            }
            glow(ctx, 121, 82, 25, theme.glow, 0.55);
            ctx.fillStyle = '#1b2428';
            ctx.beginPath(); ctx.ellipse(122, 82, 29, 9, 0.04, 0, Math.PI * 2); ctx.fill();
            ctx.strokeStyle = theme.metal; ctx.lineWidth = 3; ctx.stroke();
            ctx.fillStyle = theme.rim;
            ctx.beginPath(); ctx.ellipse(122, 82, 15, 4.5, 0.04, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#fff7c4';
            ctx.beginPath(); ctx.ellipse(122, 81, 8, 2, 0.04, 0, Math.PI * 2); ctx.fill();
        } else if (type === 'omega') {
            for (const x of [70, 176]) {
                polygon(ctx, [[x - 5,78],[x + 4,78],[x + 11,94],[x + 2,94]], '#cda764', '#5b6778', 1);
            }
            ctx.fillStyle = '#e6f8ff';
            ctx.beginPath(); ctx.ellipse(122, 83, 27, 8, 0.03, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = theme.rim;
            ctx.font = 'bold 24px Georgia,serif'; ctx.textAlign = 'center';
            ctx.fillText('Ω', 121, 91);
        } else if (type === 'alpha') {
            for (const x of [68, 175]) {
                polygon(ctx, [[x - 8,78],[x + 8,78],[x + 15,95],[x - 1,94]], '#526269', '#1b2427', 2);
                roundRect(ctx, x - 2, 82, 12, 5, 2, '#5cecff', '#baffff', 1);
            }
            glow(ctx, 123, 59, 29, theme.glow, 0.6);
            polygon(ctx, [[121,34],[140,63],[121,78],[103,63]], '#ffb92e', '#fff3a7', 2);
            polygon(ctx, [[121,34],[121,78],[103,63]], '#fff0a1');
            polygon(ctx, [[121,34],[140,63],[121,78]], '#f39712');
            line(ctx, 121, 39, 121, 70, '#fffbd2', 1.4);
        }
        ctx.restore();
    }

    function drawCrate(ctx, type, theme, time, open) {
        ctx.save();
        const shape = type === 'bronze' ? [1.08, 0.91] : type === 'mini' ? [0.93, 0.94] : type === 'alpha' ? [1.04, 1.03] : [1, 1];
        ctx.translate(120, 116);
        ctx.scale(shape[0], shape[1]);
        ctx.translate(-120, -116);
        const bob = open ? -2 * open : Math.sin(time * 1.8 + type.length) * 2;
        ctx.translate(0, bob);

        glow(ctx, 124, 174, 92, '0,0,0', 0.45);
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.beginPath(); ctx.ellipse(124, 174, 81 - open * 7, 9, 0, 0, Math.PI * 2); ctx.fill();
        if (open > 0) glow(ctx, 121, 95, 85, theme.glow, 0.32 * open);

        // The side has its own light direction; the dark under-lid opening stays visible when raised.
        polygon(ctx, [[190,104],[207,87],[207,151],[190,168]],
            linear(ctx, 87, 168, [[0, theme.base],[0.38, theme.dark],[1, '#10191d']]), '#172025', 2);
        polygon(ctx, [[195,112],[203,103],[203,145],[195,155]], theme.base, theme.metal, 1);
        line(ctx, 198, 113, 198, 151, 'rgba(255,255,255,0.3)', 1.2);
        polygon(ctx, [[42,103],[190,103],[190,167],[42,165]],
            linear(ctx, 103, 169, [[0, theme.light],[0.07, theme.base],[0.45, theme.base],[0.72, theme.dark],[1, '#171e20']]),
            '#182024', 2.6);
        polygon(ctx, [[42,103],[63,83],[207,87],[190,103]], '#0b1317', theme.metal, 2);
        polygon(ctx, [[49,105],[185,105],[182,111],[51,110]], 'rgba(0,0,0,0.65)');
        polygon(ctx, [[44,162],[190,164],[190,169],[43,167]],
            metalGradient(ctx, 162, 169, theme), '#172025', 1.3);
        polygon(ctx, [[190,164],[207,148],[207,153],[190,169]], '#29343a', '#172025', 1);

        // A recessed front panel and layered armour break up the large flat face.
        roundRect(ctx, 57, 115, 119, 43, 5, '#152126', '#090f13', 3);
        roundRect(ctx, 61, 119, 111, 35, 3,
            linear(ctx, 119, 154, [[0, theme.light],[0.08, theme.base],[0.49, theme.base],[1, theme.dark]]),
            'rgba(255,255,255,0.27)', 1.2);
        polygon(ctx, [[64,121],[83,121],[73,151],[64,151]], 'rgba(255,255,255,0.1)');
        line(ctx, 64, 121, 169, 121, 'rgba(255,255,255,0.25)', 1);
        line(ctx, 64, 152, 169, 152, 'rgba(0,0,0,0.46)', 1.5);

        ctx.fillStyle = '#111b20';
        ctx.fillRect(43, 110, 146, 7);
        ctx.fillStyle = theme.metal;
        ctx.fillRect(44, 110, 145, 3);
        ctx.fillStyle = theme.rim;
        ctx.fillRect(57, 114, 118, 1.8);
        line(ctx, 44, 159, 188, 161, 'rgba(255,255,255,0.18)', 1.2);

        polygon(ctx, [[43,106],[59,107],[61,119],[58,151],[55,166],[43,165]],
            metalGradient(ctx, 106, 166, theme), '#142024', 1.7);
        polygon(ctx, [[173,107],[190,105],[190,167],[175,166],[171,152],[171,119]],
            metalGradient(ctx, 106, 167, theme), '#142024', 1.7);
        line(ctx, 46, 108, 46, 161, 'rgba(255,255,255,0.53)', 1.3);
        line(ctx, 176, 109, 176, 160, 'rgba(255,255,255,0.43)', 1.1);
        for (const [x,y] of [[50,116],[181,116],[50,155],[181,155]]) bolt(ctx, x, y);

        if (type === 'bronze') {
            for (let x = 66; x < 169; x += 10) {
                line(ctx, x, 122, x, 150, 'rgba(15,43,29,0.38)', 2);
                line(ctx, x + 2, 122, x + 2, 150, 'rgba(221,240,188,0.19)', 1);
            }
            line(ctx, 83, 121, 83, 154, '#25392d', 3);
            line(ctx, 157, 121, 157, 154, '#25392d', 3);
            line(ctx, 86, 128, 86, 149, '#c9c9ab', 2);
            line(ctx, 154, 128, 154, 149, '#c9c9ab', 2);
        }
        if (type === 'mechParts') {
            for (let x = 65; x < 169; x += 17) {
                polygon(ctx, [[x,157],[x + 8,157],[x + 1,163],[x - 7,163]], '#e9cd37');
            }
            for (const x of [66, 158]) {
                roundRect(ctx, x, 125, 9, 25, 2, '#2a372c', '#c9cdb3', 1.5);
                bolt(ctx, x + 4.5, 130); bolt(ctx, x + 4.5, 146);
            }
            roundRect(ctx, 193, 121, 11, 23, 4, '#777d56', '#c5c3a2', 1.3);
            line(ctx, 196, 123, 196, 142, 'rgba(255,255,255,0.43)', 1.2);
        }
        if (type === 'mini') {
            for (const x of [69, 158]) {
                polygon(ctx, [[x,121],[x + 7,121],[x + 7,152],[x,152]], '#283035', '#a9a9a1', 1);
                line(ctx, x + 2, 123, x + 2, 150, 'rgba(255,255,255,0.28)');
            }
            line(ctx, 82, 145, 88, 141, 'rgba(255,227,153,0.3)');
            line(ctx, 146, 125, 152, 127, 'rgba(255,227,153,0.3)');
        }
        if (type === 'legendary') {
            for (const x of [70, 157]) {
                roundRect(ctx, x - 8, 124, 15, 24, 3, '#222e32', '#a28a52', 1.3);
                glow(ctx, x, 136, 14, theme.glow, 0.5);
                roundRect(ctx, x - 3, 127, 6, 17, 2, '#ffcf5a', '#fbe8a5', 1);
            }
            for (const x of [84, 150]) line(ctx, x, 121, x, 151, '#927a43', 2);
        }
        if (type === 'omega') {
            for (const x of [67, 159]) {
                glow(ctx, x, 136, 19, theme.glow, 0.35);
                roundRect(ctx, x - 5, 123, 10, 26, 3, '#4a91b9', '#f4d47c', 1.5);
                roundRect(ctx, x - 2, 126, 4, 20, 2, '#d7ffff');
            }
            line(ctx, 74, 123, 96, 146, '#d3b470', 2);
            line(ctx, 166, 123, 144, 146, '#d3b470', 2);
        }
        if (type === 'alpha') {
            for (const x of [68, 161]) {
                polygon(ctx, [[x - 8,123],[x + 5,122],[x + 8,138],[x + 2,151],[x - 8,150]],
                    '#414f56', '#b8aa78', 1.6);
                roundRect(ctx, x - 3, 128, 7, 18, 2, '#ffbd38', '#fff1a3', 1);
                glow(ctx, x, 137, 18, theme.glow, 0.35);
            }
            polygon(ctx, [[79,122],[93,122],[88,131],[82,135]], '#738188', '#1d272c', 1);
            polygon(ctx, [[148,122],[161,122],[158,135],[151,131]], '#738188', '#1d272c', 1);
        }
        if (type === 'legendary' || type === 'omega' || type === 'alpha') {
            glow(ctx, 120, 133, 31, theme.glow, 0.24 + Math.sin(time * 3) * 0.07);
            ctx.fillStyle = `rgba(${theme.glow},0.65)`;
            ctx.fillRect(118, 115, 4, 38);
        }

        roundRect(ctx, 94, 121, 53, 32, 5, '#101a1e', '#171d1e', 2);
        roundRect(ctx, 97, 123, 47, 28, 5, metalGradient(ctx, 123, 151, theme), '#d1c69e', 1.2);
        roundRect(ctx, 101, 126, 39, 22, 3, '#101d22', theme.rim, 1.5);
        roundRect(ctx, 104, 129, 33, 16, 2, '#213940', `rgba(${theme.glow},0.55)`, 1);
        ctx.save();
        ctx.shadowColor = `rgb(${theme.glow})`;
        ctx.shadowBlur = 10;
        ctx.fillStyle = theme.rim;
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.font = type === 'omega' ? 'bold 23px Georgia,serif' : 'bold 20px Arial,sans-serif';
        ctx.fillText(theme.mark, 120, 137);
        ctx.restore();

        if (open > 0) {
            glow(ctx, 120, 93, 67, theme.glow, 0.8 * open);
            polygon(ctx, [[66,96],[185,96],[195,88],[77,82]], `rgba(${theme.glow},${0.85 * open})`);
            const burst = Math.max(0, 1 - (time * 1000 - openedAt) / 1100);
            ctx.strokeStyle = `rgba(${theme.glow},${0.55 * burst})`;
            ctx.lineWidth = 2.5;
            ctx.beginPath();
            ctx.ellipse(120, 88, 22 + 62 * (1 - burst), 8 + 19 * (1 - burst), 0, 0, Math.PI * 2);
            ctx.stroke();
            for (let i = 0; i < 7; i++) {
                const a = (i / 6) * Math.PI;
                const x = 120 + Math.cos(a) * 50;
                const rise = (time * (0.23 + i * 0.015) + i / 7) % 1;
                const y = 89 - Math.sin(a) * (35 + open * 24) - rise * 19;
                star(ctx, x, y, 2 + open * 2, theme.rim, open * (1 - rise * 0.7));
            }
        }

        drawLid(ctx, type, theme, open);
        ctx.restore();
    }

    function drawCargoSide(ctx, type, theme, box, time) {
        const { front, right, frontTop, top, bottom, backBottom } = box;
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(front, frontTop);
        ctx.lineTo(right, top + 7);
        ctx.lineTo(right, backBottom);
        ctx.lineTo(front, bottom);
        ctx.closePath();
        ctx.clip();
        ctx.textAlign = 'left';

        if (type === 'bronze') {
            // Long ribbed side and serial markings make this a recognizable freight container.
            for (let x = front + 8; x < right - 3; x += 10) {
                const t = (x - front) / (right - front);
                const yTop = frontTop + (top + 7 - frontTop) * t;
                const yBottom = bottom + (backBottom - bottom) * t;
                line(ctx, x, yTop + 4, x, yBottom - 5, 'rgba(9,33,23,0.46)', 3);
                line(ctx, x + 2, yTop + 4, x + 2, yBottom - 5, 'rgba(214,240,188,0.27)', 1);
            }
            ctx.fillStyle = '#e3e8d1';
            ctx.font = 'bold 8px monospace';
            ctx.fillText('BR-104  CARGO', front + 22, 127);
            ctx.fillText('MAX  2.4T', front + 22, 139);
            polygon(ctx, [[right - 29,top + 18],[right - 5,top + 15],[right - 5,top + 23],[right - 29,top + 27]], '#d4b548');
            for (let x = right - 27; x < right - 4; x += 9) {
                line(ctx, x, top + 25, x + 7, top + 16, '#293125', 2.5);
            }
        } else if (type === 'mini') {
            line(ctx, front + 5, 111, right - 3, 105, '#f7c14c', 3);
            line(ctx, front + 5, 140, right - 3, 131, '#2b3033', 4);
            roundRect(ctx, front + 10, 117, 17, 11, 1, '#252d31', '#f8c34d', 1);
            ctx.fillStyle = '#ffe08a'; ctx.font = 'bold 7px monospace';
            ctx.fillText('M-01', front + 12, 125);
        } else if (type === 'legendary') {
            polygon(ctx, [[front + 2,frontTop + 8],[right - 4,top + 17],[right - 4,backBottom - 12],[front + 2,bottom - 13]],
                '#263238', '#c2994b', 1.5);
            polygon(ctx, [[front + 7,frontTop + 18],[right - 7,top + 25],
                [right - 7,top + 34],[front + 7,frontTop + 27]], '#b9822d', '#f9d77d', 1);
            line(ctx, front + 7, frontTop + 34, right - 8, top + 41, '#deaa51', 2);
            line(ctx, front + 7, bottom - 22, right - 8, backBottom - 22, '#a57637', 2);
            for (const x of [front + 20, front + 37, front + 54]) {
                roundRect(ctx, x, 119 - (x - front) * 0.19, 4, 5, 1, '#ffd66c', '#5b411e', 0.8);
            }
        } else if (type === 'omega') {
            polygon(ctx, [[front + 3,frontTop + 9],[right - 4,top + 17],[right - 4,backBottom - 8],[front + 3,bottom - 10]],
                '#d4e4ee', '#d8b66c', 1.5);
            roundRect(ctx, front + 6, 118, 12, 28, 3, '#4f9cc8', '#ffe4a1', 1.5);
            roundRect(ctx, front + 9, 122, 6, 20, 2, '#bff6ff');
            line(ctx, front + 4, 111, right - 2, 94, '#f8dc8f', 3);
        } else if (type === 'alpha') {
            polygon(ctx, [[front + 2,frontTop + 10],[right - 3,top + 17],[right - 3,backBottom - 7],[front + 2,bottom - 9]],
                '#3c484f', '#9ba7a4', 2);
            polygon(ctx, [[front + 4,125],[right - 3,118],[right - 3,131],[front + 4,145]], '#242e34', '#ffb638', 1.2);
            glow(ctx, front + 11, 133, 19, '255,180,42', 0.55);
            roundRect(ctx, front + 8, 122, 7, 24, 2, '#ffc63f', '#fff0a3', 1);
        }
        if (type !== 'bronze') {
            for (let x = front + 7; x < right - 5; x += 10) {
                const t = (x - front) / (right - front);
                const yTop = frontTop + (top + 7 - frontTop) * t;
                const yBottom = bottom + (backBottom - bottom) * t;
                line(ctx, x, yTop + 8, x, yBottom - 8, 'rgba(10,24,29,0.36)', 2.5);
                line(ctx, x + 2, yTop + 8, x + 2, yBottom - 8, 'rgba(255,255,255,0.24)', 1);
            }
        }
        if (type === 'legendary') {
            line(ctx, front + 7, frontTop + 18, right - 7, top + 25, '#ffe29a', 1.4);
            line(ctx, front + 7, bottom - 22, right - 8, backBottom - 22, '#e9b45d', 1.5);
        }
        ctx.restore();
        line(ctx, front + 2, frontTop + 1, right - 1, top + 8, 'rgba(255,255,255,0.42)', 1.2);
        line(ctx, front + 1, bottom - 3, right - 1, backBottom - 3, '#171d21', 3);
        bolt(ctx, right - 5, top + 13);
        bolt(ctx, right - 5, backBottom - 6);
    }

    function drawCargoRoof(ctx, type, theme, box, time) {
        const { left, front, right, top, frontTop } = box;
        const depth = right - front;
        const backTop = top + 7;
        polygon(ctx, [[left,frontTop],[left + depth,backTop],[right,backTop],[front,frontTop]],
            linear(ctx, top, frontTop, [[0,theme.light],[0.34,theme.base],[1,theme.dark]]),
            type === 'omega' ? '#f4d78b' : theme.metal, 2);
        polygon(ctx, [[left + 5,frontTop - 3],[left + depth + 5,backTop + 3],
            [right - 5,backTop + 3],[front - 5,frontTop - 3]],
            linear(ctx, backTop, frontTop, [[0,theme.base],[1,theme.dark]]), 'rgba(255,255,255,0.22)', 1);
        line(ctx, left + depth + 3, backTop + 1, right - 3, backTop + 1, 'rgba(255,255,255,0.5)', 1.2);

        if (type === 'bronze') {
            for (let x = left + 8; x < front - 4; x += 11) {
                line(ctx, x, frontTop - 2, x + depth, backTop + 4, 'rgba(15,45,31,0.38)', 2);
            }
        } else if (type === 'mini') {
            for (const x of [left + 29, front - 30]) {
                polygon(ctx, [[x - 3,frontTop - 2],[x + 3,frontTop - 2],
                    [x + depth + 3,backTop + 3],[x + depth - 3,backTop + 3]],
                    '#293137', '#c7c0ae', 1);
            }
            for (let x = left + 43; x < front - 36; x += 9) {
                line(ctx, x, frontTop - 3, x + depth, backTop + 3, '#3a3831', 2);
            }
        } else if (type === 'legendary') {
            for (const x of [left + 13, left + 39, left + 65]) {
                line(ctx, x, frontTop - 2, x + depth, backTop + 3, '#d8a646', 2.2);
                line(ctx, x + 3, frontTop - 2, x + depth + 3, backTop + 3, '#f8db8d', 0.9);
            }
            polygon(ctx, [[left + 76,frontTop - 4],[left + 91,frontTop - 4],
                [left + 91 + depth,backTop + 4],[left + 76 + depth,backTop + 4]],
                '#202a30', '#e4b353', 1.5);
            for (const x of [left + 81, left + 87]) {
                line(ctx, x, frontTop - 4, x + depth, backTop + 4, '#f3ca70', 1.2);
            }
            for (const x of [left + 9, right - 21]) {
                roundRect(ctx, x, frontTop - 4, 9, 5, 1, '#ffc65c', '#fff1b0', 1);
            }
        } else if (type === 'omega') {
            for (const x of [left + 30, front - 28]) {
                polygon(ctx, [[x - 4,frontTop - 2],[x + 2,frontTop - 2],
                    [x + depth + 2,backTop + 3],[x + depth - 4,backTop + 3]],
                    '#e0b35f', '#5e7188', 1);
            }
            roundRect(ctx, 102, top + 11, 37, 10, 2, '#458daf', '#f7d788', 1.5);
            for (let x = 108; x < 135; x += 6) line(ctx, x, top + 13, x, top + 19, '#c5f9ff', 1);
        } else if (type === 'alpha') {
            for (const x of [left + 19, right - 26]) {
                roundRect(ctx, x, top + 11, 12, 6, 2, '#4bdced', '#c1fbff', 1);
            }
            roundRect(ctx, 103, top + 9, 36, 12, 2, '#222b31', '#ffbe45', 1.5);
            for (const x of [108, 116, 124, 132]) {
                roundRect(ctx, x, top + 12, 3, 6, 1, '#53d9df');
            }
        }
    }

    function drawCargoDoor(ctx, type, theme, x, width, y, height, hinge, open, side) {
        ctx.save();
        ctx.translate(hinge, 0);
        ctx.scale(1 - 0.72 * open, 1);
        ctx.translate(-hinge, 0);
        roundRect(ctx, x, y, width, height, 2, '#172025', theme.metal, 2);
        roundRect(ctx, x + 2, y + 2, width - 4, height - 4, 1,
            linear(ctx, y, y + height, [[0,theme.light],[0.12,theme.base],[0.75,theme.base],[1,theme.dark]]),
            'rgba(255,255,255,0.23)', 0.8);

        if (type === 'bronze') {
            for (let xx = x + 6; xx < x + width - 3; xx += 7) {
                line(ctx, xx, y + 5, xx, y + height - 5, 'rgba(20,44,30,0.43)', 2);
                line(ctx, xx + 1.5, y + 5, xx + 1.5, y + height - 5, 'rgba(233,245,213,0.2)', 0.8);
            }
            const bar = side === 'left' ? x + width - 7 : x + 7;
            line(ctx, bar, y + 4, bar, y + height - 4, '#b9c3ac', 2.7);
            bolt(ctx, bar, y + 10); bolt(ctx, bar, y + height - 10);
        } else if (type === 'legendary') {
            for (let xx = x + 9; xx < x + width - 5; xx += 9) {
                line(ctx, xx, y + 7, xx, y + height - 7, '#151e22', 3);
                line(ctx, xx + 2, y + 7, xx + 2, y + height - 7, '#a49870', 1);
            }
            line(ctx, x + 8, y + 12, x + width - 8, y + 12, '#f5c257', 2.5);
            line(ctx, x + 7, y + height - 12, x + width - 7, y + height - 12, '#dba13c', 2);
            const lockX = side === 'left' ? x + width - 7 : x + 7;
            line(ctx, lockX, y + 7, lockX, y + height - 7, '#ffce67', 3);
            for (const yy of [y + 15, y + height - 15]) bolt(ctx, lockX, yy);
        } else if (type === 'omega') {
            for (let xx = x + 9; xx < x + width - 5; xx += 10) {
                line(ctx, xx, y + 8, xx, y + height - 8, '#8da9b9', 3);
                line(ctx, xx + 2, y + 8, xx + 2, y + height - 8, '#ffffff', 1);
            }
            roundRect(ctx, x + 10, y + 15, width - 20, 13, 2, '#3a91b9', '#f9d47b', 1.2);
            line(ctx, x + 11, y + 18, x + width - 12, y + 18, '#d0faff', 1.4);
            const coldBar = side === 'left' ? x + width - 7 : x + 7;
            line(ctx, coldBar, y + 8, coldBar, y + height - 8, '#ddba72', 2.5);
        } else if (type === 'alpha') {
            for (let xx = x + 9; xx < x + width - 4; xx += 11) {
                line(ctx, xx, y + 8, xx, y + height - 8, '#161f25', 3);
                line(ctx, xx + 2, y + 8, xx + 2, y + height - 8, '#81919a', 1);
            }
            polygon(ctx, [[x + 7,y + 8],[x + 14,y + 8],[x + width - 8,y + height - 8],
                [x + width - 15,y + height - 8]], '#f1a92f', '#151d22', 1);
            roundRect(ctx, x + width / 2 - 4, y + 10, 8, 5, 1, '#60e9ed');
            line(ctx, x + 7, y + height - 12, x + width - 7, y + height - 12, '#ffbe44', 2);
        }
        for (const yy of [y + 7, y + height - 7]) bolt(ctx, side === 'left' ? x + 5 : x + width - 5, yy);
        ctx.restore();
    }

    function drawCargoContainer(ctx, type, theme, time, open) {
        const size = type === 'bronze'
            ? { left: 32, front: 99, right: 211, frontTop: 94, bottom: 166, rise: 20 }
            : type === 'mini'
                ? { left: 47, front: 151, right: 203, frontTop: 91, bottom: 159, rise: 14 }
                : type === 'alpha'
                    ? { left: 39, front: 147, right: 210, frontTop: 88, bottom: 168, rise: 20 }
                    : type === 'omega'
                        ? { left: 39, front: 135, right: 209, frontTop: 93, bottom: 163, rise: 16 }
                        : { left: 39, front: 139, right: 209, frontTop: 93, bottom: 163, rise: 16 };
        const box = { ...size, top: size.frontTop - size.rise - 7, backBottom: size.bottom - size.rise };
        const { left, front, right, top, frontTop, bottom, backBottom } = box;
        const mid = (left + front) / 2;
        ctx.save();
        ctx.lineJoin = 'bevel';

        glow(ctx, 124, 174, 91, '0,0,0', 0.42);
        ctx.fillStyle = 'rgba(0,0,0,0.33)';
        ctx.beginPath(); ctx.ellipse(123, 171, type === 'bronze' ? 94 : 82, 8, 0, 0, Math.PI * 2); ctx.fill();
        polygon(ctx, [[front,frontTop],[right,top + 7],[right,backBottom],[front,bottom]],
            linear(ctx, top + 7, bottom, [[0,theme.light],[0.18,theme.base],[1,theme.dark]]),
            '#172026', 2);
        drawCargoSide(ctx, type, theme, box, time);
        polygon(ctx, [[left,frontTop],[front,frontTop],[front,bottom],[left,bottom]],
            linear(ctx, frontTop, bottom, [[0,theme.light],[0.12,theme.base],[0.78,theme.dark],[1,'#161d22']]),
            '#141d22', 2.5);

        // Corner castings are a shipping-container detail, separate from the parts crate's lid.
        for (const x of [left, front - 8]) {
            polygon(ctx, [[x,frontTop],[x + 8,frontTop],[x + 8,bottom],[x,bottom]],
                metalGradient(ctx, frontTop, bottom, theme), '#172027', 1.3);
            for (const y of [frontTop + 7, bottom - 7]) bolt(ctx, x + 4, y);
        }
        line(ctx, left + 2, bottom - 2, front - 2, bottom - 2, theme.metal, 2.5);
        roundRect(ctx, left + 9, frontTop + 5, front - left - 18, bottom - frontTop - 13,
            1, '#101b20', theme.metal, 2);

        if (open > 0) {
            glow(ctx, mid, (frontTop + bottom) / 2, 51, theme.glow, 0.85 * open);
            ctx.fillStyle = `rgba(${theme.glow},${0.35 * open})`;
            ctx.fillRect(left + 11, frontTop + 8, front - left - 22, bottom - frontTop - 20);
        }

        const doorLeft = left + 11;
        const doorRight = front - 11;
        const doorTop = frontTop + 8;
        const doorHeight = bottom - frontTop - 21;
        if (type === 'mini') {
            ctx.save();
            ctx.beginPath(); ctx.rect(doorLeft, doorTop, doorRight - doorLeft, doorHeight); ctx.clip();
            ctx.translate(0, -open * (doorHeight - 1));
            roundRect(ctx, doorLeft, doorTop, doorRight - doorLeft, doorHeight, 2,
                linear(ctx, doorTop, doorTop + doorHeight, [[0,theme.light],[0.12,theme.base],[1,theme.dark]]),
                '#1d2326', 2);
            for (let y = doorTop + 6; y < doorTop + doorHeight - 5; y += 7) {
                line(ctx, doorLeft + 4, y, doorRight - 4, y, 'rgba(64,35,14,0.42)', 1.5);
                line(ctx, doorLeft + 4, y + 1.5, doorRight - 4, y + 1.5, 'rgba(255,228,147,0.28)', 0.8);
            }
            for (const x of [doorLeft + 8, doorRight - 12]) {
                line(ctx, x, doorTop + 5, x, doorTop + doorHeight - 5, '#273035', 4);
                line(ctx, x + 1, doorTop + 5, x + 1, doorTop + doorHeight - 5, '#bdb9a5', 1);
            }
            roundRect(ctx, mid - 15, doorTop + doorHeight - 17, 30, 9, 1, '#232c31', '#f4c951', 1.5);
            ctx.fillStyle = '#ffe283'; ctx.textAlign = 'center'; ctx.font = 'bold 7px monospace';
            ctx.fillText('M-01', mid, doorTop + doorHeight - 10);
            ctx.restore();
        } else {
            const doorWidth = (doorRight - doorLeft) / 2;
            drawCargoDoor(ctx, type, theme, doorLeft, doorWidth, doorTop, doorHeight, doorLeft, open, 'left');
            drawCargoDoor(ctx, type, theme, doorLeft + doorWidth, doorWidth, doorTop, doorHeight,
                doorRight, open, 'right');
            if (type !== 'bronze' && open < 0.85) {
                ctx.save(); ctx.globalAlpha = 1 - open / 0.85;
                roundRect(ctx, mid - 16, doorTop + doorHeight - 14, 32, 10, 1, '#1a252b', theme.rim, 1.3);
                ctx.fillStyle = theme.rim; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
                ctx.font = 'bold 7px monospace';
                ctx.fillText(type === 'legendary' ? 'L-07' : type === 'omega' ? 'O-09' : 'A-01',
                    mid, doorTop + doorHeight - 9);
                ctx.restore();
            }
        }

        drawCargoRoof(ctx, type, theme, box, time);
        for (const x of [left + 2, front - 7]) {
            polygon(ctx, [[x,frontTop - 3],[x + 7,frontTop - 3],[x + 7,frontTop + 5],[x,frontTop + 5]],
                metalGradient(ctx, frontTop - 3, frontTop + 5, theme), '#1e282d', 1);
            bolt(ctx, x + 3.5, frontTop + 1);
        }
        if (open > 0) {
            const age = time * 1000 - openedAt;
            const burst = Math.max(0, 1 - age / 1050);
            glow(ctx, mid, frontTop + 13, 38, theme.glow, 0.3 * open);
            for (let i = 0; i < 5; i++) {
                const rise = (time * (0.34 + i * 0.04) + i / 5) % 1;
                const x = mid + Math.cos(i * 2.3) * (11 + 23 * rise);
                const y = frontTop + 8 - 43 * rise;
                star(ctx, x, y, 2.3 + burst * 2, theme.rim, open * (1 - rise));
            }
        }
        ctx.restore();
    }

    function paint(canvas, type, now, open = 0) {
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        const theme = themes[type] || themes.bronze;
        const time = now / 1000;
        ctx.setTransform(canvas.width / 240, 0, 0, canvas.height / 200, 0, 0);
        ctx.clearRect(0, 0, 240, 200);
        if (type === 'mechParts') glow(ctx, 120, 102, 100, theme.glow, 0.18);
        for (let i = 0; i < 7; i++) {
            const phase = time * (0.35 + i * 0.04) + i * 1.8;
            const x = 42 + ((i * 31 + Math.sin(phase) * 12 + 200) % 156);
            const y = 53 + ((i * 27 - time * (5 + i) + 4000) % 95);
            star(ctx, x, y, 2.2, theme.rim, 0.27 + 0.3 * Math.sin(phase) ** 2);
        }
        if (type === 'mechParts') drawCrate(ctx, type, theme, time, open);
        else {
            ctx.save();
            ctx.translate(120, 102);
            ctx.scale(1.13, 1.13);
            ctx.translate(-120, -102);
            drawCargoContainer(ctx, type, theme, time, open);
            ctx.restore();
        }
    }

    function render(now) {
        if (shopActive && !flowActive) {
            for (const canvas of visibleCards) paint(canvas, canvas.dataset.containerArt, now);
        }
        if (flowActive) {
            const open = flowStage === 'open'
                ? (reduceMotion ? 1 : Math.min(1, Math.max(0, (now - openedAt) / 750)))
                : 0;
            paint(flow, flowType, now, open);
        }
    }

    function schedule() {
        if (animationId !== null || document.hidden || reduceMotion) return;
        if (flowActive || (shopActive && visibleCards.size)) animationId = requestAnimationFrame(tick);
    }

    function tick(now) {
        animationId = null;
        if (document.hidden || (!flowActive && (!shopActive || !visibleCards.size))) return;
        if (now - lastPaint >= 1000 / 30 - 1) {
            render(now);
            lastPaint = now;
        }
        schedule();
    }

    function update() {
        const now = performance.now();
        render(now);
        lastPaint = now;
        schedule();
    }

    function showShop() {
        shopActive = true;
        if (typeof IntersectionObserver === 'function' && shopPane) {
            if (observer) observer.disconnect();
            observer = new IntersectionObserver(entries => {
                for (const entry of entries) {
                    if (entry.isIntersecting) visibleCards.add(entry.target);
                    else visibleCards.delete(entry.target);
                }
                update();
            }, { root: shopPane, rootMargin: '60px' });
            cards.forEach(canvas => observer.observe(canvas));
        } else {
            cards.forEach(canvas => visibleCards.add(canvas));
        }
        update();
    }

    function hideShop() {
        shopActive = false;
        if (observer) observer.disconnect();
        observer = null;
        visibleCards.clear();
        if (!flowActive && animationId !== null) cancelAnimationFrame(animationId);
        if (!flowActive) animationId = null;
    }

    function setFlowStage(stage, type) {
        flowType = themes[type] ? type : 'bronze';
        flowStage = stage;
        if (stage === 'open') openedAt = performance.now();
        update();
    }

    function showFlow(type) {
        flowActive = true;
        flowType = themes[type] ? type : 'bronze';
        update();
    }

    function hideFlow() {
        flowActive = false;
        if (!shopActive && animationId !== null) cancelAnimationFrame(animationId);
        if (!shopActive) animationId = null;
        else update();
    }

    document.addEventListener('visibilitychange', () => {
        if (document.hidden && animationId !== null) {
            cancelAnimationFrame(animationId);
            animationId = null;
        } else if (!document.hidden) {
            update();
        }
    });

    window.ContainerArt = { showShop, hideShop, setFlowStage, showFlow, hideFlow };
})();
