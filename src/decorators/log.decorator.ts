import winston from 'winston';

type WithLogger = {
  logger: winston.Logger;
};

type FormatData = {
  method: string;
  args?: unknown[];
};

type LogConfig = {
  format: (data: FormatData) => string;
};

export function Log(config?: LogConfig): MethodDecorator {
  return (
    target: Object,
    propertyKey: string | symbol,
    descriptor: PropertyDescriptor,
  ) => {
    const originalMethod = descriptor.value;
    const isAwaiter = /__awaiter/.test(originalMethod.toString());

    const log = (
      logger: winston.Logger,
      responseTime: number,
      options?: {
        args?: unknown[];
      },
    ) => {
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

        log((this as WithLogger).logger, responseTime, { args });

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

        log((this as WithLogger).logger, responseTime, { args });

        return result;
      };
    }

    return descriptor;
  };
}
