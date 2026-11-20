/**
 * The dust and rubble as the gate's stone leaves part: one canvas over the screen, drawn for about five seconds, then
 * removed. Five kinds, each on the leaves' own clock (src/lib/gate.ts: the crack at 0, the leaves move from 0.5 s,
 * swing 62° by 2.66 s, then slide off):
 *
 *   - the seam's breath: as the crack runs, fine dust is blown out of the seam to both sides, fast at first and held
 *     back by the air, swelling and thinning out;
 *   - the lintel's sifting: from the top of the opening a thin curtain of grit pours down, swaying a little;
 *   - the floor's roll: a heavier cloud rolls out along the foot of the screen and lingers longest;
 *   - rubble: chips of the stone (an irregular shape, a lit face and a shaded one) that tumble, fall, bounce once or
 *     twice on the floor and settle; and fine grains that fall straight;
 *   - motes: a few specks catching the light, drifting once the doors are open;
 *   - and a little everywhere else: grit and the odd chip shaken loose from the ceiling along the whole width, a faint
 *     haze along the top, dust at both hinges.
 *
 * Grit and chips are motion-blurred (drawn over the path they cover in 1/40 s); the leaves' inner edges shed dust as
 * they swing, and every landing chip kicks up a little.
 *
 * Depth: each particle has a depth z (0.6 far .. 1.4 near) that scales its size and its speed. The smoke is drawn
 * from a few pre-rendered sprites of overlapping soft blobs, so no puff is a perfect circle.
 */

type P = {
	k: 'puff' | 'roll' | 'sift' | 'chip' | 'grain' | 'mote';
	t0: number; // start, s from the opening
	life: number;
	x: number;
	y: number;
	vx: number;
	vy: number;
	s: number; // size, px
	grow: number; // the size multiplies by this over its life
	a: number; // peak opacity
	r: number; // rotation
	vr: number;
	z: number;
	img?: number;
	pts?: number[];
	floor?: number;
	bounces?: number;
	c0?: string;
	c1?: string;
	ph?: number;
};

const rnd = (a: number, b: number) => a + Math.random() * (b - a);
const pick = <T>(a: T[]) => a[Math.floor(Math.random() * a.length)];
const smooth = (u: number) => (u <= 0 ? 0 : u >= 1 ? 1 : u * u * (3 - 2 * u));

// (airborne dust in the light reads lighter than the stone it came from; the deep tone only for the floor's roll)
const DUST = [232, 214, 172];
const DUST_MID = [212, 188, 142];
const DUST_DEEP = [184, 156, 108];
const CHIP = [
	['#c9ad78', '#8a6c42'],
	['#d3b98a', '#937449'],
	['#bfa16b', '#7d603a'],
	['#dcc597', '#9c7d50']
];

/** A soft, irregular puff: a dozen blurred blobs of one colour inside a 128 px square. */
function smokeSprite(rgb: number[]) {
	const c = document.createElement('canvas');
	c.width = c.height = 128;
	const g = c.getContext('2d')!;
	for (let i = 0; i < 14; i++) {
		const x = rnd(34, 94), y = rnd(34, 94), r = rnd(16, 40);
		const gr = g.createRadialGradient(x, y, 0, x, y, r);
		const a = rnd(0.18, 0.4);
		gr.addColorStop(0, `rgba(${rgb.join(',')},${a})`);
		gr.addColorStop(0.55, `rgba(${rgb.join(',')},${a * 0.45})`);
		gr.addColorStop(1, `rgba(${rgb.join(',')},0)`);
		g.fillStyle = gr;
		g.fillRect(0, 0, 128, 128);
	}
	return c;
}

/** The half-width of the opening at time t (s from the opening): the leaves swing on their outer hinges. */
function gapHalf(t: number, W: number) {
	const u = (t - 0.5) / 3;
	if (u <= 0) return 0;
	const a = ((62 * smooth(Math.min(1, u / 0.72))) * Math.PI) / 180;
	const slide = smooth((u - 0.72) / 0.28) * 0.75;
	return Math.min(W / 2, (W / 2) * (1 - Math.cos(a)) + (W / 2) * slide);
}

/** `density` scales every count (1 the full dust; a device that shows the still, 0.4). */
export function gateDust(density = 1, host: HTMLElement = document.body) {
	if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
	const W = innerWidth, H = innerHeight, cx = W / 2;
	const dpr = Math.min(devicePixelRatio || 1, 1.5);
	const cv = document.createElement('canvas');
	cv.className = 'gate-dust';
	cv.width = Math.round(W * dpr);
	cv.height = Math.round(H * dpr);
	host.append(cv);
	const g = cv.getContext('2d')!;
	g.scale(dpr, dpr);
	const smoke = [smokeSprite(DUST), smokeSprite(DUST_MID), smokeSprite(DUST_DEEP)];
	// (a soft dot per grain colour, stretched along the grain's path as it is drawn: the motion blur)
	const dots = new Map<string, HTMLCanvasElement>();
	const dot = (col: string) => {
		let c = dots.get(col);
		if (c) return c;
		c = document.createElement('canvas');
		c.width = c.height = 16;
		const d = c.getContext('2d')!;
		const gr = d.createRadialGradient(8, 8, 0, 8, 8, 8);
		gr.addColorStop(0, col);
		gr.addColorStop(0.45, col);
		gr.addColorStop(1, col + '00');
		d.fillStyle = gr;
		d.fillRect(0, 0, 16, 16);
		dots.set(col, c);
		return c;
	};
	// (the shutter: a fast particle is drawn over the path it covers in this long)
	const SHUTTER = 1 / 40;
	// (a phone has less screen to fill: fewer particles)
	const n = (k: number) => Math.round(k * density * Math.min(1, Math.max(0.45, (W * H) / (1440 * 900))));
	const ps: P[] = [];
	const side = () => (Math.random() < 0.5 ? -1 : 1);

	// the seam's breath, as the crack runs (0.3 .. 0.8 s), along the whole height, a little more at the foot and top
	for (let i = 0; i < n(110); i++) {
		const z = rnd(0.6, 1.4), sd = side();
		const yy = Math.random() < 0.3 ? pick([rnd(0, 0.15), rnd(0.8, 1)]) : Math.random();
		ps.push({k: 'puff', t0: rnd(0.3, 0.8), life: rnd(1.6, 2.8), x: cx + sd * rnd(0, 6), y: yy * H, vx: sd * rnd(120, 520) * z, vy: rnd(-50, 25), s: rnd(26, 70) * z, grow: rnd(2.4, 3.6), a: rnd(0.22, 0.4), r: rnd(0, 6.28), vr: rnd(-0.5, 0.5), z, img: Math.floor(rnd(0, 2))});
	}
	// the floor's roll (0.55 .. 1.5 s): low, wide, slow, the longest lived
	for (let i = 0; i < n(46); i++) {
		const z = rnd(0.7, 1.4), sd = side();
		ps.push({k: 'roll', t0: rnd(0.55, 1.5), life: rnd(3, 4.6), x: cx + sd * rnd(0, 50), y: H - rnd(0, 0.14) * H, vx: sd * rnd(80, 380) * z, vy: -rnd(4, 34), s: rnd(80, 170) * z, grow: rnd(1.8, 2.8), a: rnd(0.16, 0.28), r: rnd(0, 6.28), vr: rnd(-0.25, 0.25), z, img: Math.random() < 0.25 ? 2 : Math.floor(rnd(0, 2))});
	}
	// the lintel's sifting (0.55 .. 2.6 s): fine grit and thin smoky streaks from the top of the opening
	for (let i = 0; i < n(300); i++) {
		const t0 = rnd(0.55, 2.6);
		const z = rnd(0.6, 1.4);
		ps.push({k: 'sift', t0, life: rnd(1.4, 2.6), x: cx + rnd(-1, 1) * Math.max(4, gapHalf(t0, W) * 0.9), y: rnd(-8, 4), vx: rnd(-12, 12), vy: rnd(10, 90), s: rnd(0.8, 2.4) * z, grow: 1, a: rnd(0.45, 0.85), r: 0, vr: 0, z, ph: rnd(0, 6.28), c0: pick(['#8f744a', '#a4875a', '#7d643f'])});
	}
	// the collapse haze: smoke that pours down with the grit from the lintel, and dust shed off both leaves' inner
	// edges all down their height as they swing away
	for (let i = 0; i < n(70); i++) {
		const t0 = rnd(0.55, 2.4), z = rnd(0.8, 1.35);
		ps.push({k: 'puff', t0, life: rnd(2, 3.2), x: cx + rnd(-1, 1) * Math.max(6, gapHalf(t0, W) * 0.75), y: rnd(-30, 40), vx: rnd(-24, 24), vy: rnd(50, 150), s: rnd(26, 60) * z, grow: rnd(2.2, 3.2), a: rnd(0.2, 0.34), r: rnd(0, 6.28), vr: rnd(-0.4, 0.4), z, img: Math.random() < 0.5 ? 1 : 2});
	}
	for (let i = 0; i < n(80); i++) {
		const t0 = rnd(0.7, 2.7), z = rnd(0.75, 1.3), sd = side();
		ps.push({k: 'puff', t0, life: rnd(1.8, 2.8), x: cx + sd * gapHalf(t0, W) * rnd(0.86, 1.02), y: rnd(0, 1) * H, vx: sd * rnd(-30, 50), vy: rnd(30, 110), s: rnd(22, 52) * z, grow: rnd(2.2, 3.2), a: rnd(0.16, 0.28), r: rnd(0, 6.28), vr: rnd(-0.4, 0.4), z, img: Math.random() < 0.6 ? 1 : 0});
	}
	// rubble: chips from the seam, more from its upper half, that fall, tumble and bounce
	for (let i = 0; i < n(40); i++) {
		const z = rnd(0.7, 1.35), sd = side(), s = rnd(2, 7.5) * z;
		const v = 4 + Math.floor(rnd(0, 3));
		const pts: number[] = [];
		for (let j = 0; j < v; j++) {
			const an = (j / v) * 6.283 + rnd(-0.35, 0.35), rr = rnd(0.55, 1);
			pts.push(Math.cos(an) * rr, Math.sin(an) * rr);
		}
		const [c0, c1] = pick(CHIP);
		ps.push({k: 'chip', t0: rnd(0.42, 1.1), life: rnd(2.8, 3.9), x: cx + sd * rnd(0, 6), y: Math.pow(Math.random(), 1.6) * H * 0.85, vx: sd * rnd(30, 260) * z, vy: rnd(-160, 40), s, grow: 1, a: 1, r: rnd(0, 6.28), vr: rnd(-14, 14), z, pts, floor: H - rnd(3, 22), bounces: 0, c0, c1});
	}
	// fine grains that fall straight out of the seam
	for (let i = 0; i < n(200); i++) {
		const z = rnd(0.6, 1.4), sd = side();
		ps.push({k: 'grain', t0: rnd(0.38, 1.3), life: rnd(1.2, 2.2), x: cx + sd * rnd(0, 8), y: rnd(0, 0.95) * H, vx: sd * rnd(10, 160) * z, vy: rnd(-40, 30), s: rnd(0.8, 2.2) * z, grow: 1, a: rnd(0.55, 0.95), r: 0, vr: 0, z, c0: pick(['#8f744a', '#6f5733', '#a88b5d'])});
	}
	// elsewhere, a little: the shake shakes grit and the odd chip loose from the ceiling all along the screen's width,
	// a faint haze along the top, and dust at both hinges (the screen's outer edges, where the leaves turn)
	for (let i = 0; i < n(150); i++) {
		const z = rnd(0.6, 1.3);
		ps.push({k: 'grain', t0: rnd(0.5, 2.4), life: rnd(1.2, 2.2), x: rnd(0, W), y: rnd(-10, 0), vx: rnd(-12, 12), vy: rnd(0, 60), s: rnd(0.7, 1.8) * z, grow: 1, a: rnd(0.35, 0.7), r: 0, vr: 0, z, c0: pick(['#8f744a', '#6f5733', '#a88b5d'])});
	}
	for (let i = 0; i < n(14); i++) {
		const z = rnd(0.7, 1.2), sz = rnd(1.6, 4.5) * z;
		const v = 4 + Math.floor(rnd(0, 3));
		const pts: number[] = [];
		for (let j = 0; j < v; j++) {
			const an = (j / v) * 6.283 + rnd(-0.35, 0.35), rr = rnd(0.55, 1);
			pts.push(Math.cos(an) * rr, Math.sin(an) * rr);
		}
		const [c0, c1] = pick(CHIP);
		ps.push({k: 'chip', t0: rnd(0.55, 2), life: rnd(2.6, 3.4), x: rnd(0.05, 0.95) * W, y: rnd(-12, 0), vx: rnd(-30, 30), vy: rnd(0, 40), s: sz, grow: 1, a: 1, r: rnd(0, 6.28), vr: rnd(-10, 10), z, pts, floor: H - rnd(3, 22), bounces: 0, c0, c1});
	}
	for (let i = 0; i < n(26); i++) {
		const z = rnd(0.8, 1.3);
		ps.push({k: 'puff', t0: rnd(0.5, 1.8), life: rnd(2, 3), x: rnd(0, W), y: rnd(-30, 20), vx: rnd(-20, 20), vy: rnd(20, 70), s: rnd(30, 70) * z, grow: rnd(1.8, 2.6), a: rnd(0.08, 0.16), r: rnd(0, 6.28), vr: rnd(-0.3, 0.3), z, img: 0});
	}
	for (let i = 0; i < n(36); i++) {
		const z = rnd(0.8, 1.3), sd = side();
		const foot = Math.random() < 0.55;
		ps.push({k: 'puff', t0: rnd(0.6, 2.2), life: rnd(1.8, 2.8), x: sd < 0 ? rnd(0, 50) : W - rnd(0, 50), y: foot ? H - rnd(0, 0.1) * H : rnd(0, 1) * H, vx: -sd * rnd(10, 90), vy: foot ? -rnd(5, 25) : rnd(10, 50), s: rnd(24, 60) * z, grow: rnd(2, 3), a: rnd(0.12, 0.22), r: rnd(0, 6.28), vr: rnd(-0.3, 0.3), z, img: Math.random() < 0.5 ? 1 : 2});
	}
	// motes catching the light once the doors are open
	for (let i = 0; i < n(36); i++) {
		ps.push({k: 'mote', t0: rnd(1.3, 2.8), life: rnd(2, 3.2), x: cx + rnd(-0.3, 0.3) * W, y: rnd(0.15, 0.85) * H, vx: rnd(-14, 14), vy: rnd(-16, 6), s: rnd(0.9, 2), grow: 1, a: rnd(0.4, 0.85), r: 0, vr: 0, z: 1, ph: rnd(0, 6.28)});
	}

	const start = performance.now();
	const END = 5.2;
	let last = start;
	const step = (now: number) => {
		const t = (now - start) / 1000;
		const dt = Math.min(0.05, (now - last) / 1000);
		last = now;
		g.clearRect(0, 0, W, H);
		for (let i = 0; i < ps.length; i++) {
			const p = ps[i];
			const age = t - p.t0;
			if (age < 0 || age > p.life) continue;
			const u = age / p.life;
			// motion: the air holds the smoke back, gravity pulls the rubble and the grit
			if (p.k === 'puff' || p.k === 'roll') {
				const drag = p.k === 'roll' ? 1.3 : 2.6;
				p.vx *= Math.exp(-drag * dt);
				p.vy = p.vy * Math.exp(-drag * dt) - (p.k === 'puff' ? 8 : 3) * dt;
			} else if (p.k === 'sift') {
				p.vy = Math.min(p.vy + 420 * dt, 240 * p.z);
				p.vx = Math.sin(age * 2.2 + p.ph!) * 18;
			} else if (p.k === 'chip') {
				p.vy += 1700 * dt;
				p.vx *= Math.exp(-0.25 * dt);
			} else if (p.k === 'grain') {
				p.vy += 1100 * dt;
				p.vx *= Math.exp(-0.8 * dt);
			} else {
				p.vx += Math.sin(age * 0.9 + p.ph!) * 4 * dt;
			}
			p.x += p.vx * dt;
			p.y += p.vy * dt;
			p.r += p.vr * dt;
			if (p.k === 'chip' && p.y > p.floor!) {
				p.y = p.floor!;
				// (each landing kicks up a little dust)
				if (p.vy > 160 && ps.length < 1400)
					for (let j = 0; j < 2; j++) ps.push({k: 'puff', t0: t, life: rnd(1.2, 1.9), x: p.x + rnd(-6, 6), y: p.floor! - rnd(0, 6), vx: rnd(-50, 50), vy: -rnd(10, 40), s: rnd(8, 16) * p.z, grow: rnd(2.6, 3.6), a: rnd(0.22, 0.34), r: rnd(0, 6.28), vr: rnd(-0.6, 0.6), z: p.z, img: 1});
				if (p.bounces! < 2 && p.vy > 160) (p.vy *= -0.28), (p.vx *= 0.55), (p.vr *= 0.5), p.bounces!++;
				else (p.vy = 0), (p.vx *= Math.exp(-9 * dt)), (p.vr *= Math.exp(-9 * dt));
			}
			// look
			if (p.k === 'puff' || p.k === 'roll') {
				const a = p.a * smooth(u / 0.14) * (1 - smooth((u - 0.35) / 0.65));
				if (a < 0.004) continue;
				const s = p.s * (1 + (p.grow - 1) * (1 - Math.pow(1 - u, 2)));
				g.globalAlpha = a;
				g.save();
				g.translate(p.x, p.y);
				g.rotate(p.r);
				g.drawImage(smoke[p.img!], -s, -s, s * 2, s * 2);
				g.restore();
			} else if (p.k === 'chip') {
				const A = 1 - smooth((u - 0.78) / 0.22);
				const q = p.pts!;
				const poly = (sc: number, ox: number, oy: number) => {
					g.beginPath();
					for (let j = 0; j < q.length; j += 2) g[j ? 'lineTo' : 'moveTo'](q[j] * p.s * sc + ox, q[j + 1] * p.s * sc + oy);
					g.closePath();
				};
				// (a fast chip leaves a fading trail over the shutter's time, a little turned at each step)
				const sp = Math.hypot(p.vx, p.vy);
				const N = sp > 180 ? 4 : 1;
				for (let j = N - 1; j >= 0; j--) {
					const f = j / N;
					g.globalAlpha = A * (j ? 0.32 * (1 - f) : 1);
					g.save();
					g.translate(p.x - p.vx * SHUTTER * f, p.y - p.vy * SHUTTER * f);
					g.rotate(p.r - p.vr * SHUTTER * f);
					g.fillStyle = p.c1!;
					poly(1, 0, 0);
					g.fill();
					if (!j) {
						g.fillStyle = p.c0!;
						poly(0.72, -p.s * 0.16, -p.s * 0.16);
						g.fill();
					}
					g.restore();
				}
			} else if (p.k === 'mote') {
				const a = p.a * Math.sin(Math.PI * u) * (0.65 + 0.35 * Math.sin(age * 5 + p.ph!));
				g.globalAlpha = Math.max(0, a);
				g.fillStyle = '#fff6dc';
				g.beginPath();
				g.arc(p.x, p.y, p.s, 0, 6.283);
				g.fill();
			} else {
				// (a soft dot stretched back along the grain's path over the shutter: never a hard pixel)
				const w = p.s * 1.7;
				const sp = Math.hypot(p.vx, p.vy);
				const len = Math.max(w, sp * SHUTTER);
				g.globalAlpha = p.a * (1 - smooth((u - 0.6) / 0.4)) * Math.sqrt(Math.min(1, (w * 1.6) / len));
				g.save();
				g.translate(p.x, p.y);
				g.rotate(Math.atan2(p.vy, p.vx));
				g.drawImage(dot(p.c0!), -len + w / 2, -w / 2, len, w);
				g.restore();
			}
		}
		g.globalAlpha = 1;
		if (t < END) requestAnimationFrame(step);
		else cv.remove();
	};
	requestAnimationFrame(step);
}
