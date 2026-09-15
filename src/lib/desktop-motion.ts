import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

/** One clock for wheel smoothing and scroll choreography; no idle Lenis RAF loop. */
export function startDesktopMotion(
	root: HTMLElement,
	{ animateHero = true, smoothScroll = false } = {}
) {
	gsap.registerPlugin(ScrollTrigger);
	let lenis: Lenis | undefined;
	let ticking = false;
	let disposed = false;
	let clock = 0;
	const sleep = () => {
		gsap.ticker.remove(tick);
		ticking = false;
		root.dataset.scrollTicker = 'idle';
	};
	const tick = (_time: number, delta: number) => {
		// Preserve the animation clock across idle periods without a large first-frame jump.
		clock += Math.min(delta, 50);
		lenis?.raf(clock);
		if (lenis?.isScrolling !== 'smooth') sleep();
	};
	const wake = () => {
		if (disposed || document.hidden || ticking || lenis?.isScrolling !== 'smooth') return;
		ticking = true;
		root.dataset.scrollTicker = 'active';
		gsap.ticker.add(tick);
	};
	// Lenis emits virtual-scroll before it initializes its scroll tween.
	const queueWake = () => queueMicrotask(wake);
	const onVisibility = () => {
		sleep();
		lenis?.scrollTo(lenis.actualScroll, { immediate: true, force: true });
	};

	if (smoothScroll) {
		lenis = new Lenis({
			autoRaf: false,
			smoothWheel: true,
			syncTouch: false,
			lerp: 0.12,
			anchors: { offset: -96, duration: 0.8, lerp: 0, onStart: queueWake }
		});
		lenis.on('virtual-scroll', queueWake);
		lenis.on('scroll', ScrollTrigger.update);
		document.addEventListener('visibilitychange', onVisibility);
		root.dataset.scrollTicker = 'idle';
	}
	root.dataset.scrollMode = smoothScroll ? 'smooth' : 'native';

	const context = gsap.context(() => {
		if (animateHero) {
			gsap.from('.hero-enter', {
				y: 24,
				opacity: 0,
				stagger: 0.1,
				duration: 0.8,
				ease: 'power3.out',
				clearProps: 'transform,opacity'
			});
		}
		gsap.to('.manifesto-track', {
			xPercent: -22,
			ease: 'none',
			scrollTrigger: {
				trigger: '.manifesto',
				start: 'top bottom',
				end: 'bottom top',
				scrub: smoothScroll ? 0.05 : 0.25
			}
		});
	}, root);
	return () => {
		disposed = true;
		sleep();
		context.revert();
		document.removeEventListener('visibilitychange', onVisibility);
		lenis?.destroy();
		delete root.dataset.scrollTicker;
		delete root.dataset.scrollMode;
	};
}
