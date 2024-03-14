import '@colors/colors';
import winston, { LoggerOptions, format } from 'winston';

export type Logger = winston.Logger;

export function Logger(config?: LoggerOptions): ClassDecorator {
  const { combine, timestamp, printf } = format;

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

    target.prototype.logger = winston.createLogger(mergedConfig);
  };
}
