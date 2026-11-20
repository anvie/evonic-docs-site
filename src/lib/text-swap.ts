/**
 * Swaps what an element says without a jump: the old text fades out with a little blur (110 ms), the new text rises in
 * and sharpens (220 ms). Blur hides the moment two states overlap. Under reduced motion it is a plain swap.
 * `els` are faded together; `change` writes the new text and runs once, between the two halves.
 */
export function swapText(els: Array<HTMLElement | SVGElement | null | undefined>, change: () => void) {
	const list = els.filter(Boolean) as HTMLElement[];
	if (matchMedia('(prefers-reduced-motion: reduce)').matches || !list.length || !list[0].animate) return change();
	const out = list.map((el) =>
		el.animate([{ opacity: 1, filter: 'blur(0)' }, { opacity: 0, filter: 'blur(2px)' }], { duration: 110, easing: 'ease-out', fill: 'forwards' })
	);
	out[0].onfinish = () => {
		change();
		list.forEach((el, k) => {
			out[k].cancel();
			el.animate(
				[
					{ opacity: 0, transform: 'translateY(6px)', filter: 'blur(2px)' },
					{ opacity: 1, transform: 'none', filter: 'blur(0)' }
				],
				{ duration: 220, easing: 'cubic-bezier(0.23, 1, 0.32, 1)' }
			);
		});
	};
}
