import pc from 'picocolors';
import util from 'node:util';

class Logger {
  private isVerbose = false;

  setVerbose(value: boolean) {
    this.isVerbose = value;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  error(...args: any[]) {
    console.error(pc.red(this.formatArgs(args)));
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  warn(...args: any[]) {
    console.log(pc.yellow(this.formatArgs(args)));
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  success(...args: any[]) {
    console.log(pc.green(this.formatArgs(args)));
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  info(...args: any[]) {
    console.log(pc.cyan(this.formatArgs(args)));
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  note(...args: string[]) {
    console.log(pc.dim(this.formatArgs(args)));
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  debug(...args: unknown[]) {
    if (this.isVerbose) {
      console.log(pc.blue(this.formatArgs(args)));
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  trace(...args: any[]) {
    if (this.isVerbose) {
      console.log(pc.gray(this.formatArgs(args)));
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private formatArgs(args: any[]): string {
    return args
      .map((arg) => (typeof arg === 'object' ? util.inspect(arg, { depth: null, colors: true }) : arg))
      .join(' ');
  }
}

export const logger = new Logger();
