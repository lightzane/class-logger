import '@colors/colors';
import winston, { LoggerOptions, format } from 'winston';

export type Logger = winston.Logger;

type LoggerProp = {
  /**
   * The property name of the logger that will be created for your Class
   * @default 'logger'
   */
  prop?: string;
};

export const LOGGER_METADATA = {
  prop: 'logger',
};

/**
 * #### Class decorator
 *
 * This will instantiate a `winston.Logger` for your Class
 * while giving the class name as the meta context for the logger.
 * You can reuse the logger which is accessible via `this.logger` by default.
 *
 * To change this name, you can specify like so:
 *
 * ```ts
 * ;@Logger({ prop: 'myLogger' })
 *  class Sample {
 *    private myLogger!: Logger
 *
 *    constructor() {
 *      this.myLogger.info('I log you!')
 *    }
 *  }
 * ```
 *
 */
export function Logger(config?: LoggerOptions & LoggerProp): ClassDecorator {
  const { combine, timestamp, printf } = format;

  const prop = config?.prop ?? 'logger';
  delete config?.prop;

  LOGGER_METADATA.prop = prop;

  return (target: Function) => {
    const mergedConfig: LoggerOptions = {
      level: 'info',
      format: combine(
        timestamp(),
        printf(({ level, message, timestamp, ...meta }) => {
          const { context, responseTime, error } = meta;

          let output = JSON.stringify({
            timestamp,
            level,
            context,
            message,
            responseTime,
            error,
          });

          if (!process.env.NO_COLOR) {
            switch (level) {
              case 'error':
                output = output.red;
                break;
              case 'warn':
                output = output.yellow;
                break;
              case 'verbose':
                output = output.cyan.dim;
                break;
              case 'debug':
                output = output.magenta.dim;
                break;
              default:
                break;
            }
          }

          return output;
        }),
      ),
      transports: [new winston.transports.Console()],
      defaultMeta: {
        context: target.name,
        responseTime: undefined,
      },
      ...config, // merge optional config
    };

    target.prototype[prop] = winston.createLogger(mergedConfig);
  };
}
