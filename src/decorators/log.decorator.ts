import winston from 'winston';
import { LOGGER_METADATA } from './logger.decorator';

type WithLogger = {
  [key: string]: winston.Logger;
};

type FormatData = {
  method: string;
  args?: unknown[];
};

type LogConfig = {
  format: (data: FormatData) => string;
};

/**
 * #### Method decorator
 *
 * This will call the logger `.info()` each time your method is called.
 * Note, that you must decorate your class with `Logger()` in order for this decorator to work.
 *
 * Usage:
 *
 * ```ts
 * ;@Log()
 * sampleMethod() {
 *    // nothing here
 * }
 * ```
 *
 * Customizing the log format:
 *
 * ```ts
 * ;@Log({
 *   format: ({ method, args }) => `Executing ${method}(${args?.join(',')})`,
 * })
 * addItems(...fruits: string[]) {
 *   ...
 * }
 * ```
 */
export function Log(config?: LogConfig): MethodDecorator {
  return (
    target: Object,
    propertyKey: string | symbol,
    descriptor: PropertyDescriptor,
  ) => {
    const originalMethod = descriptor.value;
    const isAwaiter = /__awaiter/.test(originalMethod.toString());

    const log = (
      responseTime: number,
      options?: {
        args?: unknown[];
      },
    ) => {
      const logger = (target as WithLogger)[LOGGER_METADATA.prop];

      const meta = {
        responseTime: `${responseTime}ms`,
      };

      // Default format
      if (!config?.format) {
        logger.info(`${String(propertyKey)}()`, meta);
        return;
      }

      // Custom format
      const custom = config.format({
        method: String(propertyKey),
        args: options?.args,
      });

      logger.info(custom, meta);
    };

    // * ASYNC Function
    if (isAwaiter) {
      descriptor.value = async function (...args: unknown[]) {
        const startTime = Date.now();
        const result = await originalMethod.apply(this, args);
        const endTime = Date.now();
        const responseTime = endTime - startTime;

        log(responseTime, { args });

        return result;
      };
    }

    // * SYNC Function
    else {
      descriptor.value = function (...args: unknown[]) {
        const startTime = Date.now();
        const result = originalMethod.apply(this, args);
        const endTime = Date.now();
        const responseTime = endTime - startTime;

        log(responseTime, { args });

        return result;
      };
    }

    return descriptor;
  };
}
