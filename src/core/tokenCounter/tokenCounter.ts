import { type Tiktoken, get_encoding } from 'tiktoken';

export class TokenCounter {
  private encoding: Tiktoken;

  constructor() {
    // Setup encoding
    this.encoding = get_encoding('cl100k_base');
  }

  public countTokens(content: string): number {
    return this.encoding.encode(content).length;
  }

  public free(): void {
    this.encoding.free();
  }
}
