/** Conservative hints, not an attempt to identify a device's age or GPU. */
export function prefersLightweightMotion() {
	const device = navigator as Navigator & {
		deviceMemory?: number;
		connection?: { saveData?: boolean };
	};
	return (
		matchMedia('(pointer: coarse), (max-width: 720px)').matches ||
		(device.hardwareConcurrency > 0 && device.hardwareConcurrency <= 4) ||
		(device.deviceMemory !== undefined && device.deviceMemory <= 4) ||
		device.connection?.saveData === true
	);
}
