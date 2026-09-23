const BOB_CYCLE = 5.4;
const DESCENT_DURATION = 1.4;

// Zero velocity and acceleration at each endpoint keeps the motion buoyant.
const smootherstep = (value: number) => {
	const t = Math.max(0, Math.min(1, value));
	return t * t * t * (t * (t * 6 - 15) + 10);
};

/** A continuous descent through the waterline followed by a slower buoyant rise. */
export function mascotPose(time: number) {
	const t = time % BOB_CYCLE;
	const y =
		t < DESCENT_DURATION
			? -24 - 32 * Math.cos((Math.PI * t) / DESCENT_DURATION)
			: -24 + 32 * Math.cos((Math.PI * (t - DESCENT_DURATION)) / (BOB_CYCLE - DESCENT_DURATION));
	const immersion = Math.max(0, y / 8) ** 2;
	// Halve vertical travel to keep the bob gentle.
	return { y: y * 0.5, xScale: 1 + immersion * 0.012, yScale: 1 - immersion * 0.012 };
}
