/* eslint @typescript-eslint/no-empty-function: "off" */

export interface Logger {
  readonly error: (message: string) => void;
  readonly info: (message: string) => void;
  readonly warn: (message: string) => void;
}

export const noopLogger: Logger = {
  error: () => {},

  info: () => {},

  warn: () => {},
};

export const consoleLogger: Logger = {
  error: (message: string) => {
    console.error(message);
  },

  info: (message: string) => {
    console.log(message);
  },

  warn: (message: string) => {
    console.warn(message);
  },
};
