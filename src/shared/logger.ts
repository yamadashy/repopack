import util from 'node:util';
import pc from 'picocolors';

class Logger {
  private isVerbose = false;

  setVerbose(value: boolean) {
    this.isVerbose = value;
  }

  error(...args: unknown[]) {
    console.error(pc.red(this.formatArgs(args)));
  }

  warn(...args: unknown[]) {
    console.log(pc.yellow(this.formatArgs(args)));
  }

  success(...args: unknown[]) {
    console.log(pc.green(this.formatArgs(args)));
  }

  info(...args: unknown[]) {
    console.log(pc.cyan(this.formatArgs(args)));
  }

  note(...args: unknown[]) {
    console.log(pc.dim(this.formatArgs(args)));
  }

  debug(...args: unknown[]) {
    if (this.isVerbose) {
      console.log(pc.blue(this.formatArgs(args)));
    }
  }

  trace(...args: unknown[]) {
    if (this.isVerbose) {
      console.log(pc.gray(this.formatArgs(args)));
    }
  }

  log(...args: unknown[]) {
    console.log(...args);
  }

  private formatArgs(args: unknown[]): string {
    return args
      .map((arg) => (typeof arg === 'object' ? util.inspect(arg, { depth: null, colors: true }) : arg))
      .join(' ');
  }
}

export const logger = new Logger();
