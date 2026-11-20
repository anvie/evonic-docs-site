/**
 * Scroll reveals: every element of a block comes in as the block does, one after another, and plays again whenever the
 * block has left the screen and returns. Only transform-like properties and opacity are animated (the Web Animations
 * API: nothing is left on the compositor afterwards).
 *
 *   - a block ([data-reveal]) starts when 15% of it is up from the bottom of the screen (the last screen of the page,
 *     the footer, as soon as it shows: it can never rise that far);
 *   - inside it, in reading order, 45 ms apart and within ~0.8 s in all: eyebrows, headings (word by word), lines,
 *     buttons, links, chips, steps, labels, portraits;
 *   - coming in from above (scrolling back up) things settle down instead of rising;
 *   - a block fully off screen goes back to waiting, so it plays again.
 *
 * Styles it relies on: ".reveal-armed" and ".revealed" (a block's contents wait hidden until their turn), ".w" (a
 * heading's word), ".capability-art.await-draw / .drawn" (the cards' routes drawn in): "Motion" in
 * src/styles/landing.css.
 */

const EASE = 'cubic-bezier(0.23, 1, 0.32, 1)';

/** Everything inside a block that animates on its own turn, in the order the reader meets it. */
const ATOMS =
	'.eyebrow, h1, h2, h3, h4, p, .capability-tags > span, .text-link, .button, .copy-install, .install-tabs, .command-line, .quick-meta > span, .step, .step-top, .card-bottom, .system-node, .agent-core, .stage-description, .contributor-grid > li, .community-topline, .workspace-tab, .dashboard-crop, .capability-art, .channel-visual > span, .schedule-pill, footer li, .footer-bottom > *';

/** Each section heading's words in their own inline-block span (once), so they can rise one by one; the text is kept. */
function splitHeadingWords(root: ParentNode) {
	root.querySelectorAll<HTMLElement>('main section:not(.hero) :is(h2, h3), footer h2, footer h3').forEach((h) => {
		if (h.dataset.split) return;
		h.dataset.split = '1';
		const walk = (node: Node) => {
			for (const n of [...node.childNodes]) {
				if (n.nodeType === 3) {
					const parts = (n.textContent ?? '').split(/(\s+)/);
					if (parts.every((x) => !x.trim())) continue;
					const frag = document.createDocumentFragment();
					for (const part of parts) {
						if (!part) continue;
						if (!part.trim()) frag.append(part);
						else {
							const w = document.createElement('span');
							w.className = 'w';
							w.textContent = part;
							frag.append(w);
						}
					}
					(n as ChildNode).replaceWith(frag);
				} else if (n.nodeType === 1 && (n as Element).tagName !== 'BR' && (n as Element).tagName !== 'svg') walk(n);
			}
		};
		walk(h);
	});
}

/** Starts the reveals under `root`. Returns the function that stops them (and cancels what is playing). */
export function startReveals(root: HTMLElement | null, lightweight: boolean): () => void {
	const playing: Animation[] = [];
	const track = (a: Animation) => {
		playing.push(a);
		a.onfinish = () => {
			const i = playing.indexOf(a);
			if (i >= 0) playing.splice(i, 1);
		};
		return a;
	};
	// the direction things travel: 1 rising (scrolling down), -1 settling (coming in from above)
	let dir = 1;
	const rise = lightweight ? 6 : 16;

	/** A plain rise-and-fade of one element, after `delay` ms. */
	const play = (el: Element, delay: number, duration = lightweight ? 260 : 520) => {
		el.classList.add('revealed');
		track(el.animate([{ opacity: 0, translate: `0 ${rise * dir}px` }, { opacity: 1, translate: '0 0' }] as Keyframe[], { duration, delay, easing: EASE, fill: 'backwards' }));
	};
	/** A heading word by word (38 ms apart), each rising from a little blur. Returns when the last word has started. */
	const words = (h: Element, delay: number) => {
		const ws = [...h.querySelectorAll('.w')];
		if (!ws.length) return play(h, delay), delay + 60;
		h.classList.add('revealed');
		ws.forEach((w, k) =>
			track(
				w.animate(
					[
						{ opacity: 0, translate: `0 ${0.45 * dir}em`, filter: 'blur(3px)' },
						{ opacity: 1, translate: '0 0', filter: 'blur(0)' }
					] as Keyframe[],
					{ duration: lightweight ? 260 : 560, delay: delay + k * 38, easing: EASE, fill: 'backwards' }
				)
			)
		);
		return delay + ws.length * 38;
	};
	/** The animatable things inside a block: those not already inside another one (steps and labels are their own). */
	const atomsOf = (el: Element) => {
		const all = [...el.querySelectorAll(ATOMS)].filter((a) => a.getBoundingClientRect().height > 0);
		return all.filter((a) => !all.some((b) => b !== a && b.contains(a) && !b.matches('.step, .system-node')) || a.matches('.capability-tags > span'));
	};

	/** A block (or several arriving together) comes into view. */
	const reveal = (entries: IntersectionObserverEntry[]) => {
		// blocks arriving together cascade top to bottom, left to right, 70 ms apart
		const shown = entries.filter((e) => e.isIntersecting);
		shown.sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top || a.boundingClientRect.left - b.boundingClientRect.left);
		shown.forEach((entry, order) => {
			const el = entry.target;
			if (el.classList.contains('revealed')) return;
			dir = entry.boundingClientRect.top < (entry.rootBounds?.height ?? innerHeight) / 2 ? -1 : 1;
			const base = Math.min(order * 70, 350);
			el.classList.add('revealed');
			el.querySelectorAll('.capability-art').forEach((art) => window.setTimeout(() => art.classList.add('drawn'), base + 350));
			const atoms = atomsOf(el);
			if (!atoms.length && !el.matches(ATOMS)) return play(el, base);
			if (el.matches('h1, h2, h3')) return void words(el, base);
			// the block's own sheet fades in (no movement), its contents rise in turn
			if (!el.matches('.section-heading')) track(el.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 380, delay: base, easing: 'ease-out', fill: 'backwards' }));
			let t = base + 60;
			atoms.forEach((a) => {
				const at = Math.min(t, base + 820);
				if (a.matches('h1, h2, h3')) {
					t = words(a, at) + 40;
					return;
				}
				if (a.matches('.agent-core')) track(a.animate([{ opacity: 0, scale: '0.9' }, { opacity: 1, scale: '1' }] as Keyframe[], { duration: 560, delay: at, easing: EASE, fill: 'backwards' }));
				else play(a, at, a.matches('.contributor-grid > li, .capability-tags > span, footer li') ? 400 : undefined);
				t += a.matches('.contributor-grid > li') ? 22 : a.matches('footer li, .capability-tags > span') ? 30 : 45;
			});
		});
	};

	const onScreen = new IntersectionObserver(reveal, { threshold: 0.01, rootMargin: '0px 0px -15% 0px' });
	const lastScreen = new IntersectionObserver(reveal, { threshold: 0.01 });
	// a block fully off screen goes back to waiting, so it plays again the next time it comes in
	const offScreen = new IntersectionObserver(
		(entries) => {
			entries.forEach((entry) => {
				const el = entry.target;
				if (entry.isIntersecting || !el.classList.contains('revealed')) return;
				el.getAnimations({ subtree: true }).forEach((a) => {
					if (!(a instanceof CSSAnimation) && !(a instanceof CSSTransition)) a.cancel();
				});
				el.classList.remove('revealed');
				el.querySelectorAll('.revealed').forEach((x) => x.classList.remove('revealed'));
				el.querySelectorAll('.capability-art.drawn').forEach((art) => art.classList.remove('drawn'));
			});
		},
		{ threshold: 0 }
	);

	// arm: contents wait hidden, headings are split, the blocks that had no reveal of their own get one
	root?.querySelectorAll('.capability-art').forEach((art) => art.classList.add('await-draw'));
	root?.classList.add('reveal-armed');
	if (root) splitHeadingWords(root);
	root?.querySelectorAll('.process-stage, .manifesto, .cta-lines, .footer-top > *, .footer-bottom').forEach((el) => el.setAttribute('data-reveal', ''));
	const lastScreenTop = document.documentElement.scrollHeight - innerHeight * 0.3;
	root?.querySelectorAll('[data-reveal]').forEach((el) => {
		const bottom = el.getBoundingClientRect().bottom + scrollY;
		(bottom > lastScreenTop ? lastScreen : onScreen).observe(el);
		offScreen.observe(el);
	});

	return () => {
		onScreen.disconnect();
		lastScreen.disconnect();
		offScreen.disconnect();
		playing.splice(0).forEach((a) => a.cancel());
		root?.querySelectorAll('.capability-art').forEach((art) => art.classList.remove('await-draw'));
		root?.classList.remove('reveal-armed');
	};
}
