/**
 * The hero's sound: the one-time "Turn on sound for a great experience" line under the menu, the keyboard shortcuts that
 * work wherever the focus is (A the mode, P play / pause, M the sound), and waking the audio on the first gesture
 * (browsers keep a page silent until the visitor has touched it; an upright phone stays silent). `tourApi` gives the tour's same-origin bridge
 * (public/ev8, "window.evSite"), which is not there until the tour has loaded.
 */
type TourApi = () => any;

export function initSoundNote(tourApi: TourApi) {
	const note = document.querySelector<HTMLElement>('.sound-note');
	// the note and the foot button follow the tour's own sound state
	const sync = () => {
		const api = tourApi();
		if (!note || !api?.sound) return;
		note.hidden = false;
		const on = api.sound();
		note.classList.toggle('off', !on);
		note.querySelector('span')!.textContent = on ? 'Mute sound' : 'Turn on sound for a great experience';
		// (the sound already on: the invitation has done its work, it goes)
		if (on && note.classList.contains('show') && !note.dataset.kept) note.classList.remove('show');
		note.setAttribute('aria-label', on ? 'Mute sound (M)' : 'Turn sound on (M)');
	};
	window.setInterval(sync, 400);

	// the gesture that wakes the audio turns the sound on; the same gesture must not then turn it off again
	let justWoke = 0;
	let woken = false;
	const wake = () => {
		const api = tourApi();
		if (!api?.unlock) return;
		// (only the very first gesture turns the sound on; later ones only keep the audio awake)
		if (!woken) {
			woken = true;
			if (!api.sound?.()) justWoke = performance.now();
		}
		api.unlock();
	};
	const flip = () => {
		if (performance.now() - justWoke < 400) return;
		tourApi()?.mute?.();
	};
	for (const e of ['pointerdown', 'keydown', 'touchstart']) window.addEventListener(e, wake, { capture: true, passive: true });

	note?.addEventListener('click', () => (flip(), note.classList.remove('show'), window.setTimeout(sync, 60)));
	window.addEventListener('keydown', (ev) => {
		const t = ev.target as HTMLElement | null;
		const typing = t instanceof HTMLInputElement || t instanceof HTMLTextAreaElement;
		const plain = !ev.metaKey && !ev.ctrlKey && !ev.altKey && !ev.repeat && !typing && !t?.isContentEditable;
		if (plain && (ev.key === 'a' || ev.key === 'A')) tourApi()?.mode?.();
		if (plain && (ev.key === 'p' || ev.key === 'P')) tourApi()?.play?.();
		if ((ev.key === 'm' || ev.key === 'M') && !ev.metaKey && !ev.ctrlKey && !ev.altKey && !typing) {
			flip();
			note?.classList.remove('show');
			window.setTimeout(sync, 60);
		}
	});

	return {
		/** Shows the invitation once, `at` ms from now, for five seconds, unless the sound is already on. */
		showOnce(at: number) {
			// (an upright phone or tablet: the tour stays silent there, so there is nothing to turn on)
			if (matchMedia('(max-width: 699px), (max-width: 1099px) and (max-aspect-ratio: 10/9)').matches) return;
			window.setTimeout(() => {
				if (note && !tourApi()?.sound?.()) note.classList.add('show');
			}, at);
			window.setTimeout(() => note?.classList.remove('show'), at + 5000);
		}
	};
}
