/**
 * The screen-closing gate: two stone leaves over the whole screen while the tour is summoned (markup: the top of
 * src/pages/index.astro; styles: "The gate" in src/styles/landing.css). The page's script calls openGate() once, when
 * the tour has drawn or the still stands in instead. The dust and rubble: src/lib/gate-dust.ts.
 */
import { gateDust } from './gate-dust';

/** Both leaves on one clock, so they start on the same frame in every browser: they swing out towards the viewer,
 *  then slide off past the screen's sides (never faded). `delay` lets the crack show first. */
/** The crack shows this long before the leaves move. */
const LEAF_DELAY = 500;

export function swingLeaves(delay = LEAF_DELAY) {
	const leaves = [...document.querySelectorAll<HTMLElement>('.gate-door')];
	const t0 = Number(document.timeline.currentTime ?? performance.now()) + delay;
	leaves.forEach((leaf) => {
		const sgn = leaf.classList.contains('gate-l') ? -1 : 1;
		const an = leaf.animate(
			[
				{ transform: 'translateX(0) rotateY(0deg)' },
				{ transform: `translateX(0) rotateY(${sgn * 62}deg)`, offset: 0.72 },
				{ transform: `translateX(${sgn * 75}%) rotateY(${sgn * 80}deg)` }
			],
			{ duration: 3000, easing: 'cubic-bezier(0.5, 0, 0.3, 1)', fill: 'both' }
		);
		an.startTime = t0;
	});
}

/** Opens the gate, in every case: crack, dust, swing and shake. `light` (a device that shows the still): a lighter
 *  dust. `calm` (no motion wanted): none of that, the leaves only fade (styles: "The gate"). `onPart` runs as the leaves
 *  start to move (at once when calm): the tour's story starts on it. */
export function openGate({ calm = false, light = false, onPart }: { calm?: boolean; light?: boolean; onPart?: () => void }) {
	const html = document.documentElement;
	if (!calm) gateDust(light ? 0.4 : 1);
	if (!calm) swingLeaves(LEAF_DELAY);
	html.classList.add('gate-open');
	if (onPart) calm ? onPart() : window.setTimeout(onPart, LEAF_DELAY);
}
