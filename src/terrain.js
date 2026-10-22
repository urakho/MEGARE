// Map appearance and the two terrain modifiers. Weather uses the existing render loop.
(function () {
    'use strict';

    const TYPE_LIST = ['forest', 'snow', 'desert', 'swamp', 'night', 'rain'];
    const TYPES = new Set(TYPE_LIST);
    const BLOCKERS = new Set(['wall', 'woodenWall', 'box', 'barrel']);
    const NIGHT_VISION_RADIUS = 400;

    function normalize(type) { return TYPES.has(type) ? type : 'forest'; }
    function current() { return normalize(window.currentTerrain); }
    function randomType() { return TYPE_LIST[Math.floor(Math.random() * TYPE_LIST.length)]; }
    function speedFactor(type = current()) {
        return type === 'swamp' ? 0.9 : type === 'rain' ? 0.95 : 1;
    }
    function reloadFactor(type = current()) {
        return type === 'rain' ? 1 / 1.05 : 1;
    }
    function movementSpeed(speed) { return speed * speedFactor(); }
    function label(type = current()) {
        return { forest: 'Лесная', snow: 'Снежная', desert: 'Пустынная',
            swamp: 'Болотная · скорость −10%', night: 'Ночная',
            rain: 'Дождевая · скорость −5% · перезарядка +5%' }[normalize(type)];
    }

    const groundColors = {
        forest: '#445522', snow: '#b5c5c8', desert: '#a88b58',
        swamp: '#394b3a', night: '#445522', rain: '#38482e'
    };
    function groundColor(type) { return groundColors[normalize(type)]; }
    const groundTiles = new Map();
    const groundPatterns = new WeakMap();
    const wallTextures = new WeakMap();
    const swampWater = [];
    function seeded(seed) {
        return () => {
            seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
            return seed / 4294967296;
        };
    }
    function surface(w, h) {
        const canvas = document.createElement('canvas');
        canvas.width = w; canvas.height = h;
        return canvas;
    }
    function patch(ctx, x, y, rx, ry, rand, color) {
        const points = [];
        for (let i = 0; i < 12; i++) {
            const a = i * Math.PI / 6, r = 0.72 + rand() * 0.28;
            points.push([x + Math.cos(a) * rx * r, y + Math.sin(a) * ry * r]);
        }
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.moveTo((points[11][0] + points[0][0]) / 2, (points[11][1] + points[0][1]) / 2);
        for (let i = 0; i < 12; i++) {
            const p = points[i], next = points[(i + 1) % 12];
            ctx.quadraticCurveTo(p[0], p[1], (p[0] + next[0]) / 2, (p[1] + next[1]) / 2);
        }
        ctx.closePath(); ctx.fill();
    }
    function swampPools(c, size, rand) {
        swampWater.length = 0;
        for (let i = 0; i < 32; i++) {
            const x = rand() * size, y = rand() * size;
            const rx = 30 + rand() * 80, ry = 14 + rand() * 35;
            const phase = rand() * Math.PI * 2;
            swampWater.push({ x, y, rx, ry, phase });
            const points = Array.from({ length: 20 }, (_, j) => {
                const a = j * Math.PI / 10;
                const r = 0.82 + Math.sin(a * 3 + phase) * 0.13 + Math.cos(a * 5 - phase) * 0.06;
                return [Math.cos(a) * rx * r, Math.sin(a) * ry * r];
            });
            function outline(scale) {
                c.beginPath();
                c.moveTo((points[19][0] + points[0][0]) * scale / 2, (points[19][1] + points[0][1]) * scale / 2);
                for (let j = 0; j < points.length; j++) {
                    const p = points[j], next = points[(j + 1) % points.length];
                    c.quadraticCurveTo(p[0] * scale, p[1] * scale, (p[0] + next[0]) * scale / 2, (p[1] + next[1]) * scale / 2);
                }
                c.closePath();
            }
            const bands = [];
            for (let band = 0; band < 5; band++) {
                const yy = -ry * 0.6 + band * ry * 0.29;
                bands.push({ yy, end: rx * (0.3 + rand() * 0.5) });
            }
            const leaves = [];
            for (let leaf = 0; leaf < 30; leaf++) {
                leaves.push({ x: (rand() - 0.5) * rx * 1.7,
                    y: (rand() < 0.5 ? -1 : 1) * ry * (0.5 + rand() * 0.4),
                    w: 1 + rand() * 1.5, h: 0.7 + rand() });
            }
            const reeds = [];
            for (let tuft = 0; tuft < 3; tuft++) {
                const side = tuft % 2 ? -1 : 1;
                const tx = side * rx * (0.5 + rand() * 0.4), ty = ry * (0.1 + rand() * 0.7);
                for (let reed = 0; reed < 5; reed++) {
                    reeds.push({ x: tx + reed * 1.6, y: ty + rand() * 2, dx: -4 + rand() * 8,
                        height: 5 + rand() * 8, light: reed % 2 });
                }
            }
            // Paint copies at the tile edges so water and wet banks continue seamlessly.
            for (const ox of [-size, 0, size]) for (const oy of [-size, 0, size]) {
                const px = x + ox, py = y + oy;
                if (px + rx * 1.7 < 0 || px - rx * 1.7 > size || py + ry * 1.7 < 0 || py - ry * 1.7 > size) continue;
                c.save(); c.translate(px, py);
                c.save(); c.scale(1, ry / rx);
                const damp = c.createRadialGradient(0, 0, rx * 0.55, 0, 0, rx * 1.65);
                damp.addColorStop(0, 'rgba(35,65,53,0.44)'); damp.addColorStop(1, 'rgba(35,65,53,0)');
                c.fillStyle = damp; c.fillRect(-rx * 1.65, -rx * 1.65, rx * 3.3, rx * 3.3); c.restore();
                outline(1.12); c.fillStyle = 'rgba(38,63,49,0.3)'; c.fill();
                const water = c.createLinearGradient(0, -ry, 0, ry);
                water.addColorStop(0, 'rgba(39,64,56,0.82)'); water.addColorStop(0.55, 'rgba(53,78,65,0.8)'); water.addColorStop(1, 'rgba(75,96,75,0.72)');
                outline(1); c.fillStyle = water; c.fill();
                c.save(); c.clip();
                for (let band = 0; band < bands.length; band++) {
                    const { yy, end } = bands[band];
                    c.strokeStyle = band % 2 ? 'rgba(155,181,156,0.1)' : 'rgba(12,34,30,0.12)'; c.lineWidth = 0.7;
                    c.beginPath(); c.moveTo(-rx * 0.8, yy); c.quadraticCurveTo(0, yy - 2, end, yy + 1); c.stroke();
                }
                for (let leaf = 0; leaf < leaves.length; leaf++) {
                    const p = leaves[leaf]; c.fillStyle = leaf % 3 ? 'rgba(116,137,73,0.45)' : 'rgba(157,164,95,0.3)';
                    c.fillRect(p.x, p.y, p.w, p.h);
                }
                c.restore();
                for (const reed of reeds) {
                    c.strokeStyle = reed.light ? '#68784a' : '#4d5e38'; c.lineWidth = 0.8;
                    c.beginPath(); c.moveTo(reed.x, reed.y);
                    c.quadraticCurveTo(reed.x - 1, reed.y - 5, reed.x + reed.dx, reed.y - reed.height); c.stroke();
                }
                c.restore();
            }
        }
    }
    function makeGround(type) {
        const size = 768;
        const tile = surface(size, size), c = tile.getContext('2d');
        const rand = seeded(5123 + TYPE_LIST.indexOf(type) * 913);
        c.fillStyle = groundColor(type); c.fillRect(0, 0, size, size);
        const snow = type === 'snow', sand = type === 'desert';
        const wet = type === 'rain' || type === 'swamp';
        for (let i = 0; i < 70; i++) {
            const x = rand() * size, y = rand() * size, r = 22 + rand() * 95;
            const color = snow ? 'rgba(64,101,124,0.045)' : sand ? 'rgba(78,51,25,0.04)' : 'rgba(22,28,15,0.085)';
            // Wrap broad marks so the repeating ground has no visible seams.
            for (const ox of [-size, 0, size]) for (const oy of [-size, 0, size]) {
                const g = c.createRadialGradient(x + ox, y + oy, 0, x + ox, y + oy, r);
                g.addColorStop(0, color); g.addColorStop(1, 'rgba(0,0,0,0)');
                c.fillStyle = g; c.fillRect(x + ox - r, y + oy - r, r * 2, r * 2);
            }
        }
        if (sand || snow) {
            for (let i = 0; i < (snow ? 14 : 28); i++) {
                const x = 65 + rand() * (size - 130), y = 45 + rand() * (size - 90);
                const length = 25 + rand() * 100, count = 3 + Math.floor(rand() * 6);
                c.save(); c.translate(x, y); c.rotate(-0.25 + rand() * 0.3);
                for (let row = 0; row < count; row++) {
                    const yy = row * (sand ? 3.5 : 5) + rand(), bend = 3 + rand() * 6;
                    const span = length * (0.45 + 0.55 * Math.sin((row + 1) / (count + 1) * Math.PI));
                    for (let layer = 0; layer < 2; layer++) {
                        const g = c.createLinearGradient(-span / 2, 0, span / 2, 0);
                        const color = layer ? (snow ? 'rgba(245,251,252,0.14)' : 'rgba(237,209,153,0.17)') :
                            (snow ? 'rgba(72,108,130,0.035)' : 'rgba(92,66,32,0.08)');
                        g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(0.35, color); g.addColorStop(0.65, color); g.addColorStop(1, 'rgba(0,0,0,0)');
                        c.strokeStyle = g; c.lineWidth = layer ? 0.8 : (snow ? 4 : 2);
                        c.beginPath(); c.moveTo(-span / 2, yy + layer);
                        c.bezierCurveTo(-span * 0.15, yy - bend + layer, span * 0.22, yy + bend + layer, span / 2, yy + layer);
                        c.stroke();
                    }
                }
                c.restore();
            }
        }
        if (type === 'swamp') swampPools(c, size, rand);
        if (wet && type !== 'swamp') {
            for (let i = 0; i < 20; i++) {
                const x = 50 + rand() * (size - 100), y = 35 + rand() * (size - 70);
                const rx = 12 + rand() * 34, ry = 4 + rand() * 12;
                patch(c, x, y + 2, rx + 2, ry + 2, rand, 'rgba(19,23,16,0.3)');
                patch(c, x, y, rx, ry, rand, 'rgba(88,111,111,0.27)');
                c.strokeStyle = 'rgba(183,208,210,0.2)';
                c.lineWidth = 0.7;
                c.beginPath(); c.moveTo(x - rx * 0.45, y - 1); c.quadraticCurveTo(x, y - ry * 0.4, x + rx * 0.4, y - 1); c.stroke();
            }
        }
        for (let i = 0; i < 7500; i++) {
            const x = rand() * size, y = rand() * size;
            c.fillStyle = i % 3 ? 'rgba(0,0,0,0.06)' : 'rgba(255,245,211,0.09)';
            c.fillRect(x, y, 0.5 + rand(), 0.5 + rand());
        }
        if (!snow && !sand) {
            for (let i = 0; i < 200; i++) {
                const x = rand() * size, y = rand() * size;
                c.strokeStyle = i % 3 ? 'rgba(130,140,72,0.18)' : 'rgba(32,40,20,0.3)';
                c.lineWidth = 1;
                c.beginPath(); c.moveTo(x - 2, y + 2); c.lineTo(x, y - 2); c.lineTo(x + 3, y + 1); c.stroke();
            }
        }
        // Small local features break up the broad color fields at actual battle scale.
        for (let cluster = 0; cluster < 65; cluster++) {
            const x = 15 + rand() * (size - 30), y = 15 + rand() * (size - 30);
            if (!snow && !sand) {
                for (let blade = 0; blade < 6; blade++) {
                    const gx = x + (rand() - 0.5) * 16, gy = y + (rand() - 0.5) * 10;
                    c.strokeStyle = blade % 2 ? 'rgba(134,148,85,0.32)' : 'rgba(27,44,23,0.3)'; c.lineWidth = 0.7;
                    c.beginPath(); c.moveTo(gx, gy); c.quadraticCurveTo(gx - 1, gy - 3, gx + (rand() - 0.5) * 5, gy - 3 - rand() * 4); c.stroke();
                }
            }
            for (let speck = 0; speck < 3; speck++) {
                const px = x + (rand() - 0.5) * 22, py = y + (rand() - 0.5) * 14;
                const r = 0.7 + rand() * 1.5;
                c.fillStyle = snow ? 'rgba(104,143,161,0.18)' : 'rgba(16,27,17,0.25)';
                c.beginPath(); c.ellipse(px + 0.7, py + 1, r * 1.3, r * 0.7, 0, 0, Math.PI * 2); c.fill();
                c.fillStyle = snow ? 'rgba(238,248,250,0.5)' : sand ? 'rgba(152,128,85,0.55)' : 'rgba(119,129,95,0.5)';
                c.beginPath(); c.ellipse(px, py, r, r * 0.65, rand(), 0, Math.PI * 2); c.fill();
            }
            if (type === 'forest' || type === 'rain') {
                c.save(); c.translate(x + 7, y); c.rotate(rand() * Math.PI);
                c.fillStyle = cluster % 3 ? 'rgba(140,135,72,0.48)' : 'rgba(86,98,48,0.6)';
                c.beginPath(); c.ellipse(0, 0, 2.6, 1.1, 0, 0, Math.PI * 2); c.fill();
                c.strokeStyle = 'rgba(44,58,29,0.3)'; c.lineWidth = 0.5;
                c.beginPath(); c.moveTo(-2.4, 0); c.lineTo(2.4, 0); c.stroke(); c.restore();
            }
        }
        return tile;
    }
    function drawGround(ctx, left, top, width, height, type = current()) {
        type = type === 'night' ? 'forest' : normalize(type);
        let patterns = groundPatterns.get(ctx);
        if (!patterns) { patterns = new Map(); groundPatterns.set(ctx, patterns); }
        if (!patterns.has(type)) {
            if (!groundTiles.has(type)) groundTiles.set(type, makeGround(type));
            patterns.set(type, ctx.createPattern(groundTiles.get(type), 'repeat'));
        }
        ctx.fillStyle = patterns.get(type);
        ctx.fillRect(left, top, width, height);
    }

    function coatingProfile(w, h, rand, snow) {
        const base = snow ? 1.5 + rand() * h * 0.08 : 1 + rand() * h * 0.07;
        const mounds = Array.from({ length: 1 + Math.floor(rand() * 3) }, () => ({
            x: rand() * w, width: w * (0.12 + rand() * 0.45),
            depth: h * (snow ? 0.04 + rand() * 0.19 : 0.05 + rand() * 0.3)
        }));
        const tilt = (rand() - 0.5) * h * (snow ? 0.12 : 0.24);
        return Array.from({ length: 21 }, (_, i) => {
            const x = i * w / 20;
            let depth = base + tilt * (i / 20 - 0.5);
            for (const mound of mounds) depth += mound.depth * Math.exp(-(((x - mound.x) / mound.width) ** 2) * 2);
            return [x, Math.max(1.5, Math.min(h * 0.46, depth))];
        });
    }
    function coatingPath(c, profile, w, h, offset, bottom) {
        c.beginPath(); c.moveTo(0, bottom ? h : 0); c.lineTo(w, bottom ? h : 0);
        const y = depth => bottom ? h - depth + offset : depth + offset;
        c.lineTo(w, y(profile[profile.length - 1][1]));
        for (let i = profile.length - 1; i > 0; i--) {
            const p = profile[i], next = profile[i - 1];
            c.quadraticCurveTo(p[0], y(p[1]), (p[0] + next[0]) / 2, y((p[1] + next[1]) / 2));
        }
        c.lineTo(0, y(profile[0][1])); c.closePath();
    }
    function makeWall(type, width, height, seed) {
        const tile = surface(width, height), c = tile.getContext('2d');
        const rand = seeded(seed);
        const w = width, h = height;
        if (type === 'snow') {
            const frost = c.createLinearGradient(0, 0, w, h);
            frost.addColorStop(0, 'rgba(188,216,226,0.28)'); frost.addColorStop(1, 'rgba(128,167,187,0.04)');
            c.fillStyle = frost; c.fillRect(0, 0, w, h);
            for (let i = 0; i < 5; i++) patch(c, rand() * w, rand() * h, 3 + rand() * w * 0.25, 2 + rand() * 4, rand, 'rgba(215,231,234,0.16)');
            const edge = coatingProfile(w, h, rand, true);
            for (let layer = 0; layer < 3; layer++) {
                c.fillStyle = ['rgba(19,36,44,0.42)', '#acc7d1', '#e7efef'][layer];
                const offset = layer === 0 ? 3 : layer === 1 ? 1.5 : 0;
                coatingPath(c, edge, w, h, offset, false); c.fill();
            }
            c.fillStyle = 'rgba(255,255,255,0.55)'; c.fillRect(1, 1, w - 2, 1);
            const icicles = Math.floor(rand() * 4);
            for (let i = 0; i < icicles; i++) {
                const index = 1 + Math.floor(rand() * 18), [x, y] = edge[index];
                c.fillStyle = 'rgba(198,225,232,0.7)';
                c.beginPath(); c.moveTo(x - 1, y); c.lineTo(x, y + 3 + rand() * 5); c.lineTo(x + 1.5, y); c.fill();
            }
            if (rand() > 0.45) patch(c, rand() * w, h - 1, w * (0.12 + rand() * 0.28), 1 + rand() * 3, rand, 'rgba(218,234,237,0.48)');
        } else if (type === 'desert') {
            c.fillStyle = 'rgba(162,125,67,0.15)'; c.fillRect(0, 0, w, h);
            for (let i = 0; i < 4; i++) patch(c, rand() * w, rand() * h, 3 + rand() * w * 0.28, 1 + rand() * h * 0.07, rand, 'rgba(200,163,99,0.18)');
            const edge = coatingProfile(w, h, rand, false);
            const drift = c.createLinearGradient(0, h * 0.5, 0, h);
            drift.addColorStop(0, '#d1b37b'); drift.addColorStop(0.65, '#b2935c'); drift.addColorStop(1, '#8d703f');
            coatingPath(c, edge, w, h, -1, true); c.fillStyle = 'rgba(226,199,146,0.6)'; c.fill();
            coatingPath(c, edge, w, h, 0, true); c.fillStyle = drift; c.fill();
            c.save(); c.clip();
            for (let ripple = 0; ripple < 3; ripple++) {
                c.strokeStyle = 'rgba(229,201,148,0.18)'; c.lineWidth = 0.6;
                c.beginPath();
                for (let i = 0; i < edge.length; i++) {
                    const [x, depth] = edge[i], yy = h - depth + 2.5 + ripple * 2;
                    if (i === 0) c.moveTo(x, yy); else c.lineTo(x, yy);
                }
                c.stroke();
            }
            c.restore();
            if (rand() > 0.25) {
                const top = coatingProfile(w, Math.max(6, h * 0.25), rand, false);
                coatingPath(c, top, w, h, 0, false); c.fillStyle = 'rgba(197,163,103,0.72)'; c.fill();
            }
        } else if (type === 'forest' || type === 'swamp') {
            const heavy = type === 'swamp';
            const damp = c.createLinearGradient(0, h * 0.2, 0, h);
            damp.addColorStop(0, 'rgba(29,43,33,0)');
            damp.addColorStop(0.7, heavy ? 'rgba(32,49,35,0.26)' : 'rgba(54,58,40,0.08)');
            damp.addColorStop(1, heavy ? 'rgba(24,39,29,0.65)' : 'rgba(51,55,39,0.3)');
            c.fillStyle = damp; c.fillRect(0, 0, w, h);
            for (let i = 0; i < (heavy ? 9 : 3); i++) {
                const x = rand() * w, y = h * (0.15 + rand() * 0.5), length = h * (0.2 + rand() * 0.6);
                c.strokeStyle = heavy ? 'rgba(27,42,31,0.36)' : 'rgba(53,60,43,0.18)';
                c.lineWidth = 0.7 + rand() * (heavy ? 2 : 0.8);
                c.beginPath(); c.moveTo(x, y); c.quadraticCurveTo(x + 1, y + length * 0.4, x - 1, Math.min(h, y + length)); c.stroke();
            }
            const mossSide = rand() > 0.5 ? 1 : -1;
            for (let i = 0; i < (heavy ? 95 : 30); i++) {
                const along = rand();
                const x = mossSide > 0 ? w - rand() ** 2 * w * 0.3 : rand() ** 2 * w * 0.3;
                const y = along * h;
                c.fillStyle = i % 3 ? (heavy ? 'rgba(92,118,64,0.6)' : 'rgba(89,110,62,0.42)') : 'rgba(151,159,101,0.3)';
                c.fillRect(x, y, 0.6 + rand() * 1.7, 0.5 + rand() * 1.2);
            }
            for (let i = 0; i < (heavy ? 45 : 25); i++) {
                const x = rand() * w, y = h - rand() ** 2 * h * 0.2;
                c.fillStyle = heavy ? 'rgba(35,52,35,0.48)' : 'rgba(97,102,73,0.24)';
                c.fillRect(x, y, 0.6 + rand() * 1.5, 0.7);
            }
            if (heavy) {
                c.strokeStyle = 'rgba(157,185,161,0.18)'; c.lineWidth = 0.7;
                c.beginPath(); c.moveTo(w * 0.12, h - 2); c.quadraticCurveTo(w * 0.5, h - 4, w * 0.9, h - 2); c.stroke();
            }
        } else if (type === 'rain') {
            const sheen = c.createLinearGradient(0, 0, w, h);
            sheen.addColorStop(0, 'rgba(200,223,229,0.17)'); sheen.addColorStop(0.4, 'rgba(13,27,32,0.18)'); sheen.addColorStop(1, 'rgba(4,12,17,0.3)');
            c.fillStyle = sheen; c.fillRect(0, 0, w, h);
            c.strokeStyle = 'rgba(164,193,207,0.17)'; c.lineWidth = 0.7;
            for (let i = 0; i < 7; i++) {
                const x = rand() * w, y = rand() * h;
                c.beginPath(); c.moveTo(x, y); c.lineTo(x - 1, Math.min(h, y + 4 + rand() * 12)); c.stroke();
            }
        }
        for (let i = 0; i < w * h * 0.1; i++) {
            c.fillStyle = i % 3 ? 'rgba(238,224,189,0.12)' : 'rgba(9,13,11,0.14)';
            c.fillRect(rand() * w, rand() * h, 0.7, 0.7);
        }
        return tile;
    }
    // Cached transparent coatings preserve each wall's material, damage and collision shape.
    function drawWallCover(ctx, obj, type = current()) {
        if (obj.type !== 'wall' && obj.type !== 'woodenWall') return;
        if (type === 'night' || (type === 'forest' && obj.theme === 'hell')) return;
        let seed = (Math.imul(Math.floor(obj.x), 73856093) ^ Math.imul(Math.floor(obj.y), 19349663)) >>> 0;
        seed = Math.imul(seed ^ (seed >>> 16), 0x45d9f3b) >>> 0;
        seed = (seed ^ (seed >>> 16)) >>> 0;
        if (type === 'forest' && seed % 5 !== 0) return;
        const w = Math.max(1, Math.min(256, Math.ceil(obj.w))), h = Math.max(1, Math.min(256, Math.ceil(obj.h)));
        let coating = wallTextures.get(obj);
        if (!coating || coating.type !== type || coating.w !== w || coating.h !== h) {
            coating = { type, w, h, image: makeWall(type, w, h, seed) };
            wallTextures.set(obj, coating);
        }
        ctx.drawImage(coating.image, obj.x, obj.y, obj.w, obj.h);
    }

    // Ray / axis-aligned rectangle intersection, limited to visibility radius.
    function rayDistance(cx, cy, dx, dy, radius, rect) {
        let near = 0, far = radius;
        if (Math.abs(dx) < 1e-10) {
            if (cx < rect.x || cx > rect.x + rect.w) return radius;
        } else {
            let a = (rect.x - cx) / dx, b = (rect.x + rect.w - cx) / dx;
            if (a > b) [a, b] = [b, a];
            near = Math.max(near, a); far = Math.min(far, b);
            if (near > far) return radius;
        }
        if (Math.abs(dy) < 1e-10) {
            if (cy < rect.y || cy > rect.y + rect.h) return radius;
        } else {
            let a = (rect.y - cy) / dy, b = (rect.y + rect.h - cy) / dy;
            if (a > b) [a, b] = [b, a];
            near = Math.max(near, a); far = Math.min(far, b);
            if (near > far) return radius;
        }
        return near;
    }

    let sightIndex;
    function canSee(observer, target, objects) {
        if (!observer || !target) return false;
        if (current() !== 'night' || observer === target) return true;
        const cx = observer.x + (observer.w || 0) / 2, cy = observer.y + (observer.h || 0) / 2;
        const tx = target.x + (target.w || 0) / 2, ty = target.y + (target.h || 0) / 2;
        const length = Math.hypot(tx - cx, ty - cy);
        if (length > NIGHT_VISION_RADIUS) return false;
        if (length < 0.001) return true;
        const tick = window.frameCount || 0;
        if (!sightIndex || sightIndex.objects !== objects || sightIndex.tick !== tick || sightIndex.count !== objects.length) {
            const grid = new Map();
            for (const obj of objects) {
                if (!BLOCKERS.has(obj.type)) continue;
                // Padding keeps moving boxes indexed until the next simulation tick.
                for (let y = Math.floor((obj.y - 8) / 64); y <= Math.floor((obj.y + obj.h + 8) / 64); y++) {
                    for (let x = Math.floor((obj.x - 8) / 64); x <= Math.floor((obj.x + obj.w + 8) / 64); x++) {
                        const key = `${x},${y}`;
                        if (!grid.has(key)) grid.set(key, []);
                        grid.get(key).push(obj);
                    }
                }
            }
            sightIndex = { objects, tick, count: objects.length, grid };
        }
        const dx = (tx - cx) / length, dy = (ty - cy) / length;
        let gx = Math.floor(cx / 64), gy = Math.floor(cy / 64);
        const sx = dx >= 0 ? 1 : -1, sy = dy >= 0 ? 1 : -1;
        const deltaX = Math.abs(dx) < 1e-10 ? Infinity : 64 / Math.abs(dx);
        const deltaY = Math.abs(dy) < 1e-10 ? Infinity : 64 / Math.abs(dy);
        let nextX = Math.abs(dx) < 1e-10 ? Infinity : ((gx + (sx > 0 ? 1 : 0)) * 64 - cx) / dx;
        let nextY = Math.abs(dy) < 1e-10 ? Infinity : ((gy + (sy > 0 ? 1 : 0)) * 64 - cy) / dy;
        let entered = 0;
        while (entered < length) {
            const cell = sightIndex.grid.get(`${gx},${gy}`);
            if (cell) for (const obj of cell) {
                if (rayDistance(cx, cy, dx, dy, length, obj) < length - 0.01) return false;
            }
            if (nextX < nextY) { entered = nextX; nextX += deltaX; gx += sx; }
            else { entered = nextY; nextY += deltaY; gy += sy; }
        }
        return true;
    }

    function visibilityPolygon(cx, cy, radius, objects, visibleBlockers) {
        const nearby = [];
        const cellSize = 64;
        const grid = new Map();
        const minCellX = Math.floor((cx - radius) / cellSize);
        const maxCellX = Math.floor((cx + radius) / cellSize);
        const minCellY = Math.floor((cy - radius) / cellSize);
        const maxCellY = Math.floor((cy + radius) / cellSize);
        for (const obj of objects) {
            if (!BLOCKERS.has(obj.type) || obj.w <= 0 || obj.h <= 0) continue;
            if (obj.x > cx + radius || obj.x + obj.w < cx - radius ||
                obj.y > cy + radius || obj.y + obj.h < cy - radius) continue;
            nearby.push(obj);
            const x0 = Math.max(minCellX, Math.floor(obj.x / cellSize));
            const x1 = Math.min(maxCellX, Math.floor((obj.x + obj.w) / cellSize));
            const y0 = Math.max(minCellY, Math.floor(obj.y / cellSize));
            const y1 = Math.min(maxCellY, Math.floor((obj.y + obj.h) / cellSize));
            for (let gy = y0; gy <= y1; gy++) {
                for (let gx = x0; gx <= x1; gx++) {
                    const key = `${gx},${gy}`;
                    if (!grid.has(key)) grid.set(key, []);
                    grid.get(key).push(obj);
                }
            }
        }
        // Keep the ray count bounded on large custom maps.
        const angles = [];
        for (let i = 0; i < 192; i++) angles.push(-Math.PI + i * Math.PI / 96);
        const cornerObjects = nearby.map(obj => ({
            obj,
            distance: Math.max(obj.x - cx, 0, cx - obj.x - obj.w) ** 2 +
                Math.max(obj.y - cy, 0, cy - obj.y - obj.h) ** 2
        }));
        cornerObjects.sort((a, b) => a.distance - b.distance);
        for (const { obj } of cornerObjects.slice(0, 16)) {
            for (const x of [obj.x, obj.x + obj.w]) {
                for (const y of [obj.y, obj.y + obj.h]) {
                    const angle = Math.atan2(y - cy, x - cx);
                    angles.push(angle - 0.0002, angle, angle + 0.0002);
                }
            }
        }
        angles.sort((a, b) => a - b);
        return angles.map(angle => {
            const dx = Math.cos(angle), dy = Math.sin(angle);
            let distance = radius;
            let blocker = null;
            let gx = Math.floor(cx / cellSize), gy = Math.floor(cy / cellSize);
            const stepX = dx >= 0 ? 1 : -1, stepY = dy >= 0 ? 1 : -1;
            let nextX = Math.abs(dx) < 1e-10 ? Infinity : ((gx + (stepX > 0 ? 1 : 0)) * cellSize - cx) / dx;
            let nextY = Math.abs(dy) < 1e-10 ? Infinity : ((gy + (stepY > 0 ? 1 : 0)) * cellSize - cy) / dy;
            const deltaX = Math.abs(dx) < 1e-10 ? Infinity : cellSize / Math.abs(dx);
            const deltaY = Math.abs(dy) < 1e-10 ? Infinity : cellSize / Math.abs(dy);
            let entered = 0;
            while (entered < distance) {
                const cell = grid.get(`${gx},${gy}`);
                if (cell) {
                    for (const obj of cell) {
                        const hit = rayDistance(cx, cy, dx, dy, distance, obj);
                        if (hit < distance) { distance = hit; blocker = obj; }
                    }
                }
                if (nextX < nextY) {
                    entered = nextX; nextX += deltaX; gx += stepX;
                } else {
                    entered = nextY; nextY += deltaY; gy += stepY;
                }
            }
            if (blocker && visibleBlockers) visibleBlockers.add(blocker);
            return { x: cx + dx * distance, y: cy + dy * distance };
        });
    }

    let motionHistory = new WeakMap();
    const trackMarks = [], driveParticles = [], illuminatMarks = [];
    const dustSprites = new Map();
    const IDLE_MOTION = { phase: 0, strength: 0, angle: 0 };
    function getMotion(unit) { return motionHistory.get(unit) || IDLE_MOTION; }
    function activateIlluminatSuper(unit) {
        if (!unit) return;
        unit.illuminatVisualStart = window.frameCount || 0;
        unit.illuminatVisualUntil = unit.illuminatVisualStart + 120;
    }
    function isIlluminatSuperActive(unit) {
        return !!unit && (unit.illuminatVisualUntil || 0) > (window.frameCount || 0);
    }
    function illuminatSuperStrength(unit) {
        if (!isIlluminatSuperActive(unit)) return 0;
        const frame = window.frameCount || 0;
        const fadeIn = Math.min(1, (frame - unit.illuminatVisualStart + 1) / 15);
        const fadeOut = Math.min(1, (unit.illuminatVisualUntil - frame) / 15);
        const fade = Math.max(0, Math.min(fadeIn, fadeOut));
        return fade * fade * (3 - 2 * fade);
    }
    function isSwampWater(x, y) {
        const tx = wrap(x, 768), ty = wrap(y, 768);
        return swampWater.some(pool => {
            const dx = (wrap(tx - pool.x + 384, 768) - 384) / pool.rx;
            const dy = (wrap(ty - pool.y + 384, 768) - 384) / pool.ry;
            if (Math.abs(dx) > 1.05 || Math.abs(dy) > 1.05) return false;
            const angle = Math.atan2(dy, dx);
            const radius = 0.82 + Math.sin(angle * 3 + pool.phase) * 0.13 + Math.cos(angle * 5 - pool.phase) * 0.06;
            return Math.hypot(dx, dy) < radius * 0.97;
        });
    }
    const materials = {
        forest: { track: '#283522', dust: '#a7a77e', life: 65 },
        snow: { track: '#6d929f', dust: '#d2e5ec', life: 90 },
        desert: { track: '#80663d', dust: '#ead0a1', life: 70 },
        swamp: { track: '#20382b', dust: '#92946c', life: 60, wet: true },
        night: { track: '#283522', dust: '#a7a77e', life: 65 },
        rain: { track: '#263c33', dust: '#bad1da', life: 45, wet: true }
    };
    function resetBattle() {
        motionHistory = new WeakMap(); trackMarks.length = 0; driveParticles.length = 0; illuminatMarks.length = 0; sightIndex = null;
    }
    function updateMovement(player, enemies, allies, playerType) {
        for (const list of [trackMarks, driveParticles]) {
            let count = 0;
            for (const item of list) {
                if (--item.life <= 0) continue;
                if (item.vx !== undefined) {
                    item.x += item.vx; item.y += item.vy;
                    item.z = Math.max(0, item.z + item.vz); item.vz -= 0.11;
                    item.vx *= 0.95; item.vy *= 0.95;
                }
                list[count++] = item;
            }
            list.length = count;
        }
        const type = current(), material = materials[type];
        function visit(unit, unitType) {
            if (!unit || unit.alive === false) return;
            const x = unit.x + unit.w / 2, y = unit.y + unit.h / 2;
            let state = motionHistory.get(unit);
            if (!state) {
                const angle = unit.baseAngle || 0;
                motionHistory.set(unit, { x, y, distance: 0, particleDistance: 0, emissions: 0, travel: 0,
                    phase: 0, strength: 0, angle, targetAngle: angle, turnVelocity: 0, idleFrames: 0, idleMarkPlaced: false });
                return;
            }
            const dx = x - state.x, dy = y - state.y, distance = Math.hypot(dx, dy);
            state.x = x; state.y = y;
            const mech = (unitType || '').startsWith('mech');
            if (distance >= 0.01 && distance <= 120) state.targetAngle = Math.atan2(dy, dx);
            // Accelerate toward the shortest turn and finish gently, including after release.
            const turn = Math.atan2(Math.sin(state.targetAngle - state.angle), Math.cos(state.targetAngle - state.angle));
            const maxTurn = mech ? 0.105 : 0.085;
            state.turnVelocity += (Math.max(-maxTurn, Math.min(maxTurn, turn * 0.22)) - state.turnVelocity) * 0.32;
            if (Math.abs(state.turnVelocity) > Math.abs(turn)) state.turnVelocity = turn;
            state.angle = Math.atan2(Math.sin(state.angle + state.turnVelocity), Math.cos(state.angle + state.turnVelocity));
            if (distance < 0.01 || distance > 120) {
                state.strength *= 0.78;
                if (state.strength < 0.01) state.strength = 0;
                if (distance > 120) {
                    state.distance = 0; state.particleDistance = 0; state.lastMark = null;
                    state.idleFrames = 0; state.idleMarkPlaced = false;
                } else if (unitType === 'illuminat') {
                    state.idleFrames++;
                    if (state.idleFrames >= 180 && !state.idleMarkPlaced) {
                        illuminatMarks.push({ x, y, size: Math.max(unit.w, unit.h) * 1.45, angle: (unit.turretAngle || 0) + Math.PI / 2, owner: unit });
                        state.idleMarkPlaced = true;
                    }
                } else {
                    state.idleFrames = 0; state.idleMarkPlaced = false;
                }
                return;
            }
            state.idleFrames = 0; state.idleMarkPlaced = false;
            const width = Math.min(unit.w, unit.h) * (unitType === 'mechRocket' ? 1.4375 : 1);
            const hovering = unitType === 'illuminat' || unitType === 'air' || (unitType === 'myasnoy' && unit.myasnoyUltActive);
            const phaseAdvance = distance * Math.PI / (width * (unitType === 'myasnoy' ? 0.72 : 0.32));
            const landing = Math.floor((state.phase + phaseAdvance) / Math.PI) !== Math.floor(state.phase / Math.PI);
            state.phase = (state.phase + phaseAdvance) % (Math.PI * 2);
            state.travel = (state.travel + distance) % 17.6;
            state.strength += (Math.min(1, distance / 2.2) - state.strength) * 0.4;
            state.distance += distance;
            state.particleDistance += distance;
            if (Math.hypot(x - player.x, y - player.y) > 1100 || unit.burovoyBurrowActive) return;
            const cos = Math.cos(state.angle), sin = Math.sin(state.angle);
            const spread = mech ? width * 0.3 : unit.h * (unitType === 'machinegun' ? 0.55 : 0.5);
            const rearOffset = mech ? -width * 0.3 : -unit.w * (unitType === 'fire' ? 0.6 : unitType === 'buratino' ? 0.55 : 0.5);
            const rearX = x + cos * rearOffset, rearY = y + sin * rearOffset;
            if (!hovering && ((mech && landing) || (!mech && state.distance >= 7))) {
                if (trackMarks.length >= 1600) trackMarks.splice(0, 100);
                let from = state.lastMark;
                if (!from || Math.hypot(rearX - from.x, rearY - from.y) > 34 || from.cos * cos + from.sin * sin < 0.1) {
                    from = { x: rearX - cos * 7, y: rearY - sin * 7, cos, sin };
                }
                const foot = state.phase >= Math.PI ? 1 : -1;
                const markX = mech ? rearX - sin * spread * foot : rearX;
                const markY = mech ? rearY + cos * spread * foot : rearY;
                const water = type === 'swamp' && unitType !== 'ice' && unitType !== 'egyptian' && isSwampWater(markX, markY);
                const life = Math.ceil((water ? 24 : material.life) * (mech ? 1.25 : 1));
                trackMarks.push({ x: markX, y: markY, cos, sin, spread, water, mech, unitType,
                    fromX: from.x, fromY: from.y, fromCos: from.cos, fromSin: from.sin,
                    width: Math.max(3, width * (mech ? 0.19 : 0.12)), type, life, maxLife: life });
                state.lastMark = { x: rearX, y: rearY, cos, sin };
                state.distance %= 7;
            }
            if (unitType === 'illuminat' || unitType === 'air' || state.particleDistance < 16) return;
            state.particleDistance %= 16;
            state.emissions++;
            for (const side of [-1, 1]) {
                const px = rearX - sin * spread * side, py = rearY + cos * spread * side;
                const wet = material.wet && (type !== 'swamp' || isSwampWater(px, py));
                if (driveParticles.length >= 140) break;
                const life = wet ? 18 + Math.random() * 5 : 20 + Math.random() * 8;
                const cloud = !wet && (type === 'desert' || type === 'snow') && state.emissions % 3 === 0;
                const back = 0.3 + Math.random() * 0.4, outward = 0.15 + Math.random() * 0.3;
                driveParticles.push({ x: px, y: py, wet,
                    vx: -cos * back - sin * side * outward,
                    vy: -sin * back + cos * side * outward,
                    z: 0.5, vz: 0.4 + Math.random() * 0.4, radius: 1.3 + Math.random(),
                    kind: cloud ? 'cloud' : 'grain', rotation: Math.random() * Math.PI,
                    life, maxLife: life, type, owner: unit });
            }
        }
        visit(player, playerType);
        for (const unit of enemies) visit(unit, unit.tankType);
        for (const unit of allies) visit(unit, unit.tankType);
    }
    let illuminatStamp;
    function illuminatStampImage() {
        if (illuminatStamp) return illuminatStamp;
        illuminatStamp = surface(96, 96);
        const c = illuminatStamp.getContext('2d'), rand = seeded(6132);
        const dirt = c.createRadialGradient(48, 48, 8, 48, 48, 45);
        dirt.addColorStop(0, 'rgba(63,48,28,0.34)'); dirt.addColorStop(0.75, 'rgba(63,48,28,0.18)'); dirt.addColorStop(1, 'rgba(63,48,28,0)');
        c.fillStyle = dirt; c.fillRect(0, 0, 96, 96);
        for (let i = 0; i < 130; i++) {
            const x = rand() * 96, y = rand() * 96;
            if (Math.hypot(x - 48, y - 48) > 44) continue;
            c.fillStyle = i % 2 ? 'rgba(47,34,21,0.22)' : 'rgba(158,126,82,0.18)';
            c.fillRect(x, y, 0.7 + rand() * 1.6, 0.7 + rand());
        }

        // Carve a separated eye-bearing capstone over the masonry pyramid.
        c.lineJoin = 'round'; c.lineCap = 'round';
        c.fillStyle = 'rgba(55,38,21,0.2)'; c.strokeStyle = 'rgba(42,28,16,0.84)'; c.lineWidth = 3.1;
        c.beginPath(); c.moveTo(48, 12); c.lineTo(67, 48); c.lineTo(29, 48); c.closePath(); c.fill(); c.stroke();
        c.beginPath(); c.moveTo(28, 53); c.lineTo(68, 53); c.lineTo(83, 82); c.lineTo(13, 82); c.closePath(); c.fill(); c.stroke();
        c.strokeStyle = 'rgba(163,131,83,0.48)'; c.lineWidth = 1;
        c.beginPath(); c.moveTo(48, 15); c.lineTo(64, 46); c.lineTo(32, 46);
        c.moveTo(30, 55); c.lineTo(16, 80); c.lineTo(80, 80); c.stroke();

        // Offset joints give the lower pyramid the appearance of individual stones.
        c.strokeStyle = 'rgba(42,29,18,0.65)'; c.lineWidth = 1.65;
        c.beginPath(); c.moveTo(25, 59); c.lineTo(71, 59);
        c.moveTo(21, 67); c.lineTo(75, 67); c.moveTo(17, 75); c.lineTo(79, 75);
        c.moveTo(38, 53); c.lineTo(38, 59); c.moveTo(58, 53); c.lineTo(58, 59);
        c.moveTo(31, 59); c.lineTo(31, 67); c.moveTo(48, 59); c.lineTo(48, 67); c.moveTo(65, 59); c.lineTo(65, 67);
        c.moveTo(25, 67); c.lineTo(25, 75); c.moveTo(40, 67); c.lineTo(40, 75);
        c.moveTo(56, 67); c.lineTo(56, 75); c.moveTo(71, 67); c.lineTo(71, 75);
        c.moveTo(34, 75); c.lineTo(34, 81); c.moveTo(48, 75); c.lineTo(48, 81); c.moveTo(62, 75); c.lineTo(62, 81); c.stroke();

        // The eye and its rays stay legible at the size used in battle.
        c.fillStyle = 'rgba(177,153,110,0.48)'; c.strokeStyle = 'rgba(37,25,16,0.92)'; c.lineWidth = 2.1;
        c.beginPath(); c.moveTo(37, 36); c.quadraticCurveTo(48, 26, 59, 36);
        c.quadraticCurveTo(48, 45, 37, 36); c.closePath(); c.fill(); c.stroke();
        c.fillStyle = 'rgba(43,29,18,0.9)'; c.beginPath(); c.arc(48, 36, 3.1, 0, Math.PI * 2); c.fill();
        c.fillStyle = 'rgba(203,181,138,0.75)'; c.beginPath(); c.arc(47.1, 35, 0.9, 0, Math.PI * 2); c.fill();
        c.strokeStyle = 'rgba(69,48,27,0.55)'; c.lineWidth = 1.5;
        c.beginPath(); c.moveTo(48, 7); c.lineTo(48, 4); c.moveTo(32, 26); c.lineTo(27, 22);
        c.moveTo(26, 39); c.lineTo(20, 37); c.moveTo(64, 26); c.lineTo(69, 22);
        c.moveTo(70, 39); c.lineTo(76, 37); c.stroke();
        return illuminatStamp;
    }
    const illuminatFlameFrames = [];
    function illuminatFlameFrame(frame) {
        if (illuminatFlameFrames[frame]) return illuminatFlameFrames[frame];
        const sprite = surface(96, 96), c = sprite.getContext('2d');
        const phase = frame * Math.PI / 8;
        // Flames trace the pyramid and eye, leaving the etched symbol visible.
        c.lineJoin = 'round'; c.lineCap = 'round';
        const outline = () => {
            c.beginPath(); c.moveTo(48, 12); c.lineTo(67, 48); c.lineTo(29, 48); c.closePath();
            c.moveTo(28, 53); c.lineTo(68, 53); c.lineTo(83, 82); c.lineTo(13, 82); c.closePath();
            c.moveTo(37, 36); c.quadraticCurveTo(48, 27, 59, 36);
            c.quadraticCurveTo(48, 45, 37, 36); c.closePath();
        };
        c.strokeStyle = 'rgba(219,55,13,0.22)'; c.lineWidth = 11; outline(); c.stroke();
        c.strokeStyle = 'rgba(246,92,18,0.52)'; c.lineWidth = 5.5; outline(); c.stroke();
        c.strokeStyle = 'rgba(255,192,67,0.82)'; c.lineWidth = 2; outline(); c.stroke();
        // Small tongues rise from the sloping edges instead of covering the drawing.
        const edges = [
            [48, 12, 29, 48, -1], [48, 12, 67, 48, 1],
            [28, 53, 13, 82, -1], [68, 53, 83, 82, 1]
        ];
        for (let edge = 0; edge < edges.length; edge++) {
            const [x0, y0, x1, y1, side] = edges[edge];
            const edgeLength = Math.hypot(x1 - x0, y1 - y0);
            const tangentX = (x1 - x0) / edgeLength, tangentY = (y1 - y0) / edgeLength;
            for (let i = 1; i <= 3; i++) {
                const t = i / 4, x = x0 + (x1 - x0) * t, y = y0 + (y1 - y0) * t;
                const flicker = Math.sin(phase + edge * 1.8 + i * 2.4);
                const reach = 5 + (flicker + 1) * 2;
                const tipX = x + side * reach, tipY = y - 7 - flicker;
                const flame = c.createLinearGradient(x, y, tipX, tipY);
                flame.addColorStop(0, 'rgba(238,93,24,0.8)');
                flame.addColorStop(0.55, 'rgba(255,189,57,0.85)');
                flame.addColorStop(1, 'rgba(255,221,110,0.22)');
                c.fillStyle = flame;
                c.beginPath(); c.moveTo(x - tangentX * 2.4, y - tangentY * 2.4);
                c.quadraticCurveTo(x + side * reach * 0.8, y - 3, tipX, tipY);
                c.quadraticCurveTo(x + side * reach * 0.4, y + 2, x + tangentX * 2.4, y + tangentY * 2.4);
                c.closePath(); c.fill();
            }
        }
        illuminatFlameFrames[frame] = sprite;
        return sprite;
    }
    function drawMovement(ctx, left, top, right, bottom, player, objects) {
        ctx.save(); ctx.lineCap = 'butt';
        for (const mark of illuminatMarks) {
            if (mark.x + mark.size < left || mark.x - mark.size > right || mark.y + mark.size < top || mark.y - mark.size > bottom) continue;
            ctx.save(); ctx.translate(mark.x, mark.y); ctx.rotate(mark.angle);
            ctx.drawImage(illuminatStampImage(), -mark.size / 2, -mark.size / 2, mark.size, mark.size); ctx.restore();
            const strength = illuminatSuperStrength(mark.owner);
            if (strength > 0) {
                const phase = (Math.floor((window.frameCount || 0) / 2) + Math.abs(Math.floor(mark.x + mark.y))) % 16;
                ctx.save(); ctx.translate(mark.x, mark.y); ctx.rotate(mark.angle);
                ctx.globalAlpha = strength;
                ctx.drawImage(illuminatFlameFrame(phase), -mark.size / 2, -mark.size / 2, mark.size, mark.size);
                ctx.restore();
            }
        }
        for (const mark of trackMarks) {
            if (mark.x < left || mark.x > right || mark.y < top || mark.y > bottom) continue;
            const fade = mark.life / mark.maxLife;
            if (mark.water) {
                const age = 1 - mark.life / mark.maxLife;
                ctx.globalAlpha = (1 - age) * 0.28; ctx.strokeStyle = '#94ab98'; ctx.lineWidth = 0.8;
                ctx.beginPath(); ctx.ellipse(mark.x, mark.y, 5 + age * 15, 2 + age * 6, 0, 0, Math.PI * 2); ctx.stroke();
                continue;
            }
            ctx.fillStyle = materials[mark.type].track; ctx.strokeStyle = materials[mark.type].track;
            if (mark.mech) {
                ctx.save(); ctx.translate(mark.x, mark.y); ctx.rotate(Math.atan2(mark.sin, mark.cos));
                ctx.globalAlpha = fade * 0.28;
                ctx.beginPath(); ctx.roundRect(-mark.width * 0.7, -mark.width / 2, mark.width * 1.6, mark.width, 1.5); ctx.fill();
                ctx.globalAlpha = fade * 0.26; ctx.lineWidth = 0.8;
                ctx.beginPath();
                for (let x = -3; x <= 3; x += 3) { ctx.moveTo(x, -mark.width / 2); ctx.lineTo(x + 1, mark.width / 2); }
                ctx.stroke(); ctx.restore(); continue;
            }
            const length = Math.hypot(mark.x - mark.fromX, mark.y - mark.fromY);
            for (const side of [-1, 1]) {
                const x0 = mark.fromX - mark.fromSin * mark.spread * side, y0 = mark.fromY + mark.fromCos * mark.spread * side;
                const x1 = mark.x - mark.sin * mark.spread * side, y1 = mark.y + mark.cos * mark.spread * side;
                if (mark.unitType === 'ice') {
                    ctx.strokeStyle = '#8dd7ed'; ctx.globalAlpha = fade * 0.44; ctx.lineWidth = mark.width * 1.25;
                    ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke();
                    ctx.strokeStyle = '#e4faff'; ctx.globalAlpha = fade * 0.38; ctx.lineWidth = 0.8;
                    ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke();
                    continue;
                }
                if (mark.unitType === 'roman' || mark.unitType === 'egyptian' || mark.unitType === 'spartan') {
                    const egyptian = mark.unitType === 'egyptian';
                    const spartan = mark.unitType === 'spartan';
                    ctx.strokeStyle = egyptian ? '#85653b' : materials[mark.type].track;
                    ctx.globalAlpha = fade * (egyptian ? 0.5 : 0.36); ctx.lineWidth = mark.width * (egyptian ? 1 : 0.8);
                    ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke();
                    ctx.strokeStyle = egyptian ? '#c6a16c' : spartan ? '#b4936d' : mark.type === 'snow' ? '#d5e6e7' : '#77765c';
                    ctx.globalAlpha = fade * (egyptian ? 0.34 : spartan ? 0.18 : 0.22); ctx.lineWidth = 0.75;
                    ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke();
                    continue;
                }
                ctx.globalAlpha = fade * (mark.type === 'snow' ? 0.3 : 0.22); ctx.lineWidth = mark.width;
                ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke();
                ctx.globalAlpha = fade * 0.3; ctx.lineWidth = 1.5;
                ctx.beginPath();
                for (let d = 0; d < length; d += 4.4) {
                    const t = d / Math.max(length, 0.01), x = x0 + (x1 - x0) * t, y = y0 + (y1 - y0) * t;
                    const half = mark.width * 0.43;
                    ctx.moveTo(x - mark.sin * half, y + mark.cos * half);
                    ctx.lineTo(x + mark.sin * half, y - mark.cos * half);
                }
                ctx.stroke();
                ctx.globalAlpha = fade * (mark.type === 'snow' ? 0.24 : 0.1);
                ctx.strokeStyle = mark.type === 'snow' ? '#ecf5f5' : mark.type === 'desert' ? '#e0c38c' : '#7e8b6c';
                ctx.lineWidth = 0.8; ctx.beginPath();
                ctx.moveTo(x0 - mark.fromSin * mark.width / 2, y0 + mark.fromCos * mark.width / 2);
                ctx.lineTo(x1 - mark.sin * mark.width / 2, y1 + mark.cos * mark.width / 2); ctx.stroke();
                ctx.strokeStyle = materials[mark.type].track;
            }
        }
        const visibility = new WeakMap();
        for (const p of driveParticles) {
            if (p.x < left || p.x > right || p.y < top || p.y > bottom) continue;
            if (!visibility.has(p.owner)) visibility.set(p.owner, canSee(player, p.owner, objects));
            if (!visibility.get(p.owner)) continue;
            const m = materials[p.type], age = 1 - p.life / p.maxLife;
            ctx.globalAlpha = (1 - age) * (p.wet ? 0.42 : 0.48);
            if (p.wet) {
                ctx.strokeStyle = m.dust; ctx.fillStyle = m.dust; ctx.lineWidth = 0.7;
                ctx.beginPath();
                if (p.z <= 0 && age > 0.25) {
                    ctx.ellipse(p.x, p.y, 2 + age * 5, 0.8 + age * 1.7, 0, 0, Math.PI * 2); ctx.stroke();
                } else { ctx.ellipse(p.x, p.y - p.z, 0.7, 1.3, 0, 0, Math.PI * 2); ctx.fill(); }
            } else if (p.kind === 'cloud') {
                if (!dustSprites.has(p.type)) {
                    const sprite = surface(64, 48), c = sprite.getContext('2d'), rand = seeded(732);
                    for (let i = 0; i < 24; i++) {
                        const x = 12 + rand() * 40, y = 10 + rand() * 28, r = 5 + rand() * 10;
                        const g = c.createRadialGradient(x, y, 0, x, y, r);
                        g.addColorStop(0, m.dust); g.addColorStop(1, 'rgba(0,0,0,0)');
                        c.globalAlpha = 0.12 + rand() * 0.12; c.fillStyle = g; c.fillRect(x - r, y - r, r * 2, r * 2);
                    }
                    dustSprites.set(p.type, sprite);
                }
                const radius = p.radius + 1 + age * (p.type === 'desert' ? 6 : 4);
                ctx.drawImage(dustSprites.get(p.type), p.x - radius * 1.3, p.y - p.z - radius, radius * 2.6, radius * 2);
            } else {
                ctx.fillStyle = p.type === 'snow' ? '#f1f8fa' : p.type === 'desert' ? '#dcc18c' : p.type === 'swamp' ? '#727b52' : '#9a9e74';
                ctx.save(); ctx.translate(p.x, p.y - p.z); ctx.rotate(p.rotation + age); ctx.scale(0.6, 0.6);
                ctx.beginPath(); ctx.moveTo(-1.4, -0.8); ctx.lineTo(0.6, -1.3); ctx.lineTo(1.5, 0.7); ctx.lineTo(-0.6, 1.1); ctx.closePath(); ctx.fill(); ctx.restore();
            }
        }
        ctx.restore();
    }
    function movementStats() { return { marks: trackMarks.length, particles: driveParticles.length }; }

    let dustCloud;
    function cloudTexture() {
        if (dustCloud) return dustCloud;
        dustCloud = surface(512, 192);
        const c = dustCloud.getContext('2d'), rand = seeded(919);
        for (let i = 0; i < 14; i++) {
            const x = 30 + rand() * 452, y = 45 + rand() * 100, r = 30 + rand() * 70;
            const g = c.createRadialGradient(x, y, 0, x, y, r);
            g.addColorStop(0, 'rgba(219,188,126,0.22)'); g.addColorStop(1, 'rgba(219,188,126,0)');
            c.fillStyle = g; c.fillRect(x - r, y - r, r * 2, r * 2);
        }
        return dustCloud;
    }
    function wrap(value, size) { return ((value % size) + size) % size; }
    function drawWeather(ctx, width, height, frame, type, camX, camY) {
        if (type === 'snow') {
            // Thin wind ribbons and a few drifting ice crystals; no blizzard.
            ctx.strokeStyle = 'rgba(231,244,246,0.12)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            for (let i = 0; i < 7; i++) {
                const x = wrap(i * 263 + frame * 1.3 - camX * 0.1, width + 240) - 120;
                const y = wrap(i * 173 + Math.sin(frame * 0.009 + i) * 14 - camY * 0.1, height + 50);
                ctx.moveTo(x, y); ctx.bezierCurveTo(x + 35, y - 11, x + 72, y + 9, x + 115, y - 4);
            }
            ctx.stroke();
            for (let i = 0; i < 32; i++) {
                const x = wrap(i * 151 + frame * (0.5 + i % 3 * 0.2) - camX * 0.15, width + 40) - 20;
                const y = wrap(i * 113 + frame * 0.24 - camY * 0.15, height + 40) - 20;
                ctx.fillStyle = i % 3 ? 'rgba(239,249,249,0.24)' : 'rgba(255,255,255,0.4)';
                ctx.fillRect(x, y, i % 3 ? 1 : 1.6, 1);
            }
        } else if (type === 'desert') {
            const gust = 0.5 + Math.sin(frame * 0.006) * 0.5;
            ctx.fillStyle = `rgba(173,136,77,${0.035 + gust * 0.06})`;
            ctx.fillRect(0, 0, width, height);
            ctx.globalAlpha = 0.25 + gust * 0.45;
            const cloud = cloudTexture();
            for (let layer = 0; layer < 4; layer++) {
                const x = wrap(frame * (1.8 + layer * 0.4) + layer * 379 - camX * 0.08, width + 760) - 760;
                const y = (layer + 0.2) * height / 4 + Math.sin(frame * 0.004 + layer) * 20;
                ctx.drawImage(cloud, x, y - 90, 1000, 220 + layer * 15);
            }
            ctx.globalAlpha = 1;
            ctx.strokeStyle = `rgba(229,195,130,${0.12 + gust * 0.12})`;
            ctx.lineWidth = 0.8;
            ctx.beginPath();
            for (let i = 0; i < 46; i++) {
                const x = wrap(i * 167 + frame * (3.4 + i % 4 * 0.7), width + 140) - 70;
                const y = wrap(i * 97 + frame * 0.38 - camY * 0.08, height + 30);
                ctx.moveTo(x, y); ctx.lineTo(x + 8 + i % 5 * 3, y - 2);
            }
            ctx.stroke();
        } else if (type === 'rain') {
            ctx.fillStyle = 'rgba(14,25,36,0.12)';
            ctx.fillRect(0, 0, width, height);
            const count = Math.min(220, Math.max(65, Math.floor(width * height / 8500)));
            for (let layer = 0; layer < 2; layer++) {
                ctx.strokeStyle = layer ? 'rgba(206,226,236,0.32)' : 'rgba(165,191,207,0.17)';
                ctx.lineWidth = layer ? 1.1 : 0.6;
                ctx.beginPath();
                for (let i = 0; i < count; i++) {
                    const x = wrap(i * 137.7 - frame * (layer ? 3.4 : 2.2) - camX * 0.12 + layer * 73, width + 60) - 30;
                    const y = wrap(i * 79.3 + frame * (layer ? 13 : 8) - camY * 0.12, height + 80) - 40;
                    ctx.moveTo(x, y); ctx.lineTo(x - (layer ? 6 : 3), y + (layer ? 23 : 13));
                }
                ctx.stroke();
            }
            for (let i = 0; i < 22; i++) {
                const life = wrap(frame + i * 17, 54) / 54;
                if (life > 0.5) continue;
                const x = wrap(i * 197.3 - camX, width + 80) - 40;
                const y = wrap(i * 113.7 - camY, height + 80) - 40;
                ctx.strokeStyle = `rgba(196,219,224,${0.22 * (1 - life * 2)})`;
                ctx.lineWidth = 0.7;
                ctx.beginPath(); ctx.ellipse(x, y, 1 + life * 12, 0.5 + life * 4, 0, 0, Math.PI * 2); ctx.stroke();
            }
        }
    }

    let nightMask;
    function drawAtmosphere(ctx, canvas, player, camX, camY, objects, frame, type = current()) {
        ctx.save();
        if (type === 'night') {
            const cx = player.x + player.w / 2;
            const cy = player.y + player.h / 2;
            const visibleBlockers = new Set();
            const points = visibilityPolygon(cx, cy, NIGHT_VISION_RADIUS, objects, visibleBlockers);
            if (!nightMask || nightMask.width !== canvas.width || nightMask.height !== canvas.height) {
                nightMask = surface(canvas.width, canvas.height);
            }
            const mask = nightMask.getContext('2d');
            mask.globalCompositeOperation = 'source-over';
            mask.clearRect(0, 0, canvas.width, canvas.height);
            mask.fillStyle = 'rgba(5,12,25,0.76)'; mask.fillRect(0, 0, canvas.width, canvas.height);
            mask.save();
            mask.beginPath(); mask.arc(cx - camX, cy - camY, NIGHT_VISION_RADIUS, 0, Math.PI * 2); mask.clip();
            mask.globalCompositeOperation = 'destination-out';
            const light = mask.createRadialGradient(cx - camX, cy - camY, 45, cx - camX, cy - camY, NIGHT_VISION_RADIUS);
            light.addColorStop(0, 'rgba(255,255,255,1)');
            light.addColorStop(0.4, 'rgba(255,255,255,0.95)');
            light.addColorStop(0.75, 'rgba(255,255,255,0.55)');
            light.addColorStop(1, 'rgba(255,255,255,0)');
            mask.fillStyle = light;
            mask.beginPath(); mask.moveTo(points[0].x - camX, points[0].y - camY);
            for (let i = 1; i < points.length; i++) mask.lineTo(points[i].x - camX, points[i].y - camY);
            mask.closePath(); mask.fill();
            // Reveal the whole top face of visible obstacles without exposing objects behind them.
            for (const obj of visibleBlockers) mask.fillRect(obj.x - camX, obj.y - camY, obj.w, obj.h);
            mask.restore();
            ctx.drawImage(nightMask, 0, 0);
            const glow = ctx.createRadialGradient(cx - camX, cy - camY, 0, cx - camX, cy - camY, NIGHT_VISION_RADIUS);
            glow.addColorStop(0, 'rgba(255,226,161,0.12)'); glow.addColorStop(0.6, 'rgba(255,226,161,0.035)'); glow.addColorStop(1, 'rgba(255,226,161,0)');
            ctx.globalCompositeOperation = 'screen'; ctx.fillStyle = glow;
            ctx.beginPath(); ctx.moveTo(points[0].x - camX, points[0].y - camY);
            for (let i = 1; i < points.length; i++) ctx.lineTo(points[i].x - camX, points[i].y - camY);
            ctx.closePath(); ctx.fill();
        } else {
            drawWeather(ctx, canvas.width, canvas.height, frame, type, camX, camY);
        }
        ctx.restore();
    }

    window.GameTerrain = { normalize, current, randomType, label, speedFactor, reloadFactor, movementSpeed, canSee, NIGHT_VISION_RADIUS,
        groundColor, drawGround, drawWallCover, visibilityPolygon, drawAtmosphere,
        resetBattle, updateMovement, drawMovement, movementStats, getMotion, activateIlluminatSuper,
        isIlluminatSuperActive, illuminatSuperStrength };
    window.currentTerrain = normalize(window.currentTerrain);
})();
