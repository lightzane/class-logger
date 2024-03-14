import { Log, Logger } from './decorators';

@Logger({ level: 'debug' })
class FruitManager {
  private items: string[] = [];
  private logger!: Logger; // optional

  constructor() {
    this.logger.error('Sample message');
    this.logger.warn('Sample message');
    this.logger.info('Sample message');
    this.logger.verbose('Sample message');
    this.logger.debug('Sample message');
  }

  @Log()
  async getItems() {
    await new Promise((resolve) => setTimeout(resolve, 3000)); // Simulate delay (Async)
    return this.items;
  }

  @Log({
    format: ({ method, args }) => `Executing ${method}(${args?.join(',')})`,
  })
  addItems(...fruits: string[]) {
    this.items.push(...fruits);
    for (let i = 0; i < 1000000000; i++) {
      // Simulate delay (sync)
    }
  }
}

const manager = new FruitManager();

manager.addItems('apple', 'banana', 'cherry', 'lemon');
manager.getItems().then(console.log);
