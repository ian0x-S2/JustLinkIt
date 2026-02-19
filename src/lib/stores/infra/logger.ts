/**
 * Logger abstraction for dependency injection.
 * Allows different implementations (console, Sentry, etc.)
 */
export interface Logger {
	error(message: string, context?: unknown): void;
	info(message: string, context?: unknown): void;
	warn(message: string, context?: unknown): void;
}

/**
 * Default console logger implementation.
 */
export class ConsoleLogger implements Logger {
	private prefix: string;

	constructor(prefix = 'Store') {
		this.prefix = prefix;
	}

	error(message: string, context?: unknown): void {
		console.error(`[${this.prefix} Error] ${message}`, context);
	}

	info(message: string, context?: unknown): void {
		console.info(`[${this.prefix} Info] ${message}`, context);
	}

	warn(message: string, context?: unknown): void {
		console.warn(`[${this.prefix} Warn] ${message}`, context);
	}
}

/**
 * No-op logger for tests.
 */
export class NoopLogger implements Logger {
	error(): void {}
	info(): void {}
	warn(): void {}
}

export const defaultLogger = new ConsoleLogger('App');
