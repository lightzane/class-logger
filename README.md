# Class Logger

Implement ([winston][w]) logger via **Typescript Decorators**.

[w]: https://github.com/winstonjs/winston

## Contents

- [Getting Started](#getting-started)
  - [Typescript configuration](#typescript-configuration)
  - [Installation](#installation)
  - [Decorators](#decorators)
    - [`@Logger()`](#loggerconfig-winstonloggeroptions)
    - [`@Log()`](#logconfig-logconfig)
- [Usages](#usages)
  - [Create your Class](#create-your-class)
  - [Instantiate Class](#instantiate-class)
  - [Custom format](#custom-format)
  - [Reuse Logger](#reuse-logger)
- [Environment Variables](#environment-variables)
- [Publishing](#publishing)

## Getting Started

### Typescript configuration

```json
{
  /* Enable experimental support for legacy experimental decorators. */
  "experimentalDecorators": true
}
```

### Installation

```bash
npm i winston
```

### Decorators

Copy everything inside the `decorators/` folder to your project

| name        | description      |
| ----------- | ---------------- |
| `@Logger()` | Class decorator  |
| `@Log()`    | Method decorator |

#### `@Logger(config?: winston.LoggerOptions)`

#### `@Log(config?: LogConfig)`

```ts
type FormatData = {
  method: string;
  args?: unknown[];
};

type LogConfig = {
  format: (data: FormatData) => string;
};
```

## Usages

### Create your Class

```ts
@Logger()
class FruitManager {
  private items: string[] = [];

  @Log()
  async getItems() {
    await new Promise((resolve) => setTimeout(resolve, 3000)); // Simulate delay (Async)
    return this.items;
  }

  @Log()
  addItems(...fruits: string[]) {
    this.items.push(...fruits);
    for (let i = 0; i < 1000000000; i++) {
      // Simulate delay (sync)
    }
  }
}
```

### Instantiate Class

```ts
const manager = new FruitManager();

manager.addItems('lemon');
manager.getItems().then(console.log);
```

**Output**

```bash
{"timestamp":"2024-03-14T03:33:44.529Z","level":"info","context":"FruitManager","message":"addItems()","responseTime":"848ms"}
{"timestamp":"2024-03-14T03:33:47.539Z","level":"info","context":"FruitManager","message":"getItems()","responseTime":"3006ms"}
[ 'lemon' ]
```

### Custom format

```ts
@Log({
  format: ({ method, args }) => `Executing ${method}(${args?.join(',')})`,
})
addItems(...fruits: string[]) {
  ...
}
```

**Output**

```bash
{"timestamp":"2024-03-14T03:36:04.136Z","level":"info","context":"FruitManager","message":"Executing addItems(lemon)","responseTime":"894ms"}
{"timestamp":"2024-03-14T03:36:07.153Z","level":"info","context":"FruitManager","message":"getItems()","responseTime":"3012ms"}
[ 'lemon' ]
```

## Reuse Logger

The `@Logger()` will automatically add a `logger` prop for your class under the hood.

To reuse it, we explicitly define the `logger` prop in the class.

```ts
@Logger({ level: 'debug' })
class FruitManager {
  private logger!: Logger; // reuse logger created by the @Logger() decorator

  constructor() {
    this.logger.error('Sample message');
    this.logger.warn('Sample message');
    this.logger.info('Sample message');
    this.logger.verbose('Sample message');
    this.logger.debug('Sample message');
  }
}
```

**Output**

```bash
{"timestamp":"2024-03-14T03:49:46.471Z","level":"error","context":"FruitManager","message":"Sample message"}
{"timestamp":"2024-03-14T03:49:46.474Z","level":"warn","context":"FruitManager","message":"Sample message"}
{"timestamp":"2024-03-14T03:49:46.474Z","level":"info","context":"FruitManager","message":"Sample message"}
{"timestamp":"2024-03-14T03:49:46.474Z","level":"verbose","context":"FruitManager","message":"Sample message"}
{"timestamp":"2024-03-14T03:49:46.475Z","level":"debug","context":"FruitManager","message":"Sample message"}
```

## Environment Variables

| name       | description                                          |
| ---------- | ---------------------------------------------------- |
| `NO_COLOR` | When true, disables the color (default: `undefined`) |

## Development

```bash
npm run dev
```

## Publishing

```bash
npm run pack
```

**Please see the following fields in `package.json`**

- `main`
- `files`
- `scripts.pack`

It will **build** and **pack** the following structure:

```
.
├─  decorators/
├─  index.d.ts
├─  index.js
├─  package.json
└─  README.md
```

The output will be the `class-logger-x.x.x.tgz` where **x** refers to version numbers.

This is how the consumers would see it when they do `npm i class-logger` on their project.
