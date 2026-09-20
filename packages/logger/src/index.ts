export type LogLevel = "debug" | "info" | "warn" | "error";

export interface Logger {
  debug(message: string, ...meta: unknown[]): void;
  info(message: string, ...meta: unknown[]): void;
  warn(message: string, ...meta: unknown[]): void;
  error(message: string, ...meta: unknown[]): void;
}

export class ConsoleLogger implements Logger {
  constructor(private readonly prefix: string = "Omnivra") {}

  debug(message: string, ...meta: unknown[]): void {
    console.debug(`[${this.prefix}] [DEBUG] ${message}`, ...meta);
  }

  info(message: string, ...meta: unknown[]): void {
    console.info(`[${this.prefix}] [INFO] ${message}`, ...meta);
  }

  warn(message: string, ...meta: unknown[]): void {
    console.warn(`[${this.prefix}] [WARN] ${message}`, ...meta);
  }

  error(message: string, ...meta: unknown[]): void {
    console.error(`[${this.prefix}] [ERROR] ${message}`, ...meta);
  }
}

export const logger = new ConsoleLogger();
