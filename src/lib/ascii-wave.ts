export const RIPPLE_CYCLE = 5.4;
const DESCENT_DURATION = 1.4;
// The waterline is crossed during descent, not at a separate animation stop.
export const RIPPLE_IMPACT = (DESCENT_DURATION / Math.PI) * Math.acos(-3 / 4);

// Zero velocity and acceleration at each endpoint keeps the motion buoyant.
const smootherstep = (value: number) => {
	const t = Math.max(0, Math.min(1, value));
	return t * t * t * (t * (t * 6 - 15) + 10);
};

/** A continuous descent through the waterline followed by a slower buoyant rise. */
export function mascotPose(time: number) {
	const t = time % RIPPLE_CYCLE;
	const y =
		t < DESCENT_DURATION
			? -24 - 32 * Math.cos((Math.PI * t) / DESCENT_DURATION)
			: -24 + 32 * Math.cos((Math.PI * (t - DESCENT_DURATION)) / (RIPPLE_CYCLE - DESCENT_DURATION));
	const immersion = Math.max(0, y / 8) ** 2;
	// Halve vertical travel while preserving the waterline crossing and ripple timing.
	return { y: y * 0.5, xScale: 1 + immersion * 0.012, yScale: 1 - immersion * 0.012 };
}

/** Fine ASCII shading traces the ripples, with occasional evonic signatures. */
export function asciiWave(columns: number, rows: number, time = 0, highlights = false): string[] {
	const glyphs = ' .,:-=+xX#8@';
	const age = (time % RIPPLE_CYCLE) - RIPPLE_IMPACT;
	// A shared travel curve keeps the dispersed wave fronts ordered.
	// The dip releases a main ring followed by three diminishing wakes.
	const pulses = [
		{ life: age, strength: 1 },
		{ life: age - 0.48, strength: 0.66 },
		{ life: age - 1.05, strength: 0.48 },
		{ life: age - 1.78, strength: 0.3 }
	];
	return Array.from({ length: rows }, (_, row) => {
		const y = (row / (rows - 1) - 0.5) * 2.8;
		const characters: string[] = [];
		const strengths: number[] = [];
		for (let column = 0; column < columns; column++) {
			const x = (column / (columns - 1) - 0.5) * 6.6;
			// Project a shallow water plane: distant ripples compress in perspective.
			const perspective = 1 + y * 0.28;
			const surfaceX = x / perspective;
			const surfaceY = (y * 3.1) / perspective;
			// Keep the water footprint proportional to the enlarged mascot.
			const radius = Math.hypot(surfaceX, surfaceY) / 1.8;
			const angle = Math.atan2(surfaceY, surfaceX);
			let height = 0;
			let slope = 0;
			for (const pulse of pulses) {
				if (pulse.life < 0) continue;
				// Build pressure gradually as the mascot enters the water.
				const onset = smootherstep(pulse.life / 0.6);
				const propagation = pulse.life - 0.25 * (1 - Math.exp(-pulse.life / 0.25));
				const travel = 1.5 * Math.log1p(propagation * 0.95);
				const width = 0.15 - Math.min(0.05, pulse.life * 0.014);
				// Gentle refraction bends the surface without breaking the circular wave.
				const bend =
					Math.sin(angle * 3 + age * 0.7) * 0.024 * Math.min(1, radius) +
					Math.sin(angle * 5 - age * 0.4) * 0.012;
				const q = (radius + bend - travel) / width;
				const envelope = Math.exp(-q * q * 0.85);
				const energy =
					(onset * pulse.strength * Math.exp(-pulse.life * 0.28)) / Math.sqrt(1 + travel * 0.35);
				// Signed displacement gives each crest a trough and a shaded shoulder.
				height += Math.cos(q * 1.6) * envelope * energy;
				slope += (-1.6 * Math.sin(q * 1.6) - 1.7 * q * Math.cos(q * 1.6)) * envelope * energy;
			}
			const fadeEnd = Math.min(4.6, RIPPLE_CYCLE - RIPPLE_IMPACT - 0.15);
			const fade = smootherstep((fadeEnd - age) / 0.9);
			const facing = Math.cos(angle - 0.85);
			const reflection = Math.max(0, slope * facing);
			const crest = Math.max(0, height);
			const trough = Math.max(0, -height);
			const value = Math.min(1, (crest * 0.8 + reflection * 0.85 + trough * 0.16) * fade);
			const specular = Math.min(1, reflection * fade);

			strengths.push(value);
			const shade = highlights ? value * smootherstep(specular / 0.6) : value;
			characters.push(glyphs[Math.min(glyphs.length - 1, Math.floor(shade * glyphs.length))]);
		}
		// Only sign broad crests; preserve narrow arcs and the gaps between them.
		if (row % 9 === 4) {
			for (let start = 8 + ((row * 17) % 31); start + 6 <= columns; start += 101) {
				const patch = strengths.slice(start, start + 6);
				if (patch.filter((value) => value > 0.12).length >= 5) {
					const word = highlights && patch.some((value) => value < 0.48) ? '      ' : 'evonic';
					characters.splice(start, 6, ...word);
				}
			}
		}
		return characters.join('');
	});
}

