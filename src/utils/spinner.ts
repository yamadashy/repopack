import cliSpinners from 'cli-spinners';
import logUpdate from 'log-update';
import pc from 'picocolors';

class Spinner {
  private spinner = cliSpinners.dots;
  private message: string;
  private currentFrame = 0;
  private interval: ReturnType<typeof setInterval> | null = null;

  constructor(message: string) {
    this.message = message;
  }

  start(): void {
    this.interval = setInterval(() => {
      const frame = this.spinner.frames[this.currentFrame];
      logUpdate(`${pc.cyan(frame)} ${this.message}`);
      this.currentFrame = (this.currentFrame + 1) % this.spinner.frames.length;
    }, this.spinner.interval);
  }

  stop(finalMessage: string): void {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
    logUpdate(finalMessage);
    logUpdate.done();
  }

  succeed(message: string): void {
    this.stop(`${pc.green('✔')} ${message}`);
  }

  fail(message: string): void {
    this.stop(`${pc.red('✖')} ${message}`);
  }
}

export default Spinner;
