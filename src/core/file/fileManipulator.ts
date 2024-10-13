import path from 'node:path';
import strip from 'strip-comments';

interface FileManipulator {
  removeComments(content: string): string;
  removeEmptyLines(content: string): string;
}

const rtrimLines = (content: string): string =>
  content
    .split('\n')
    .map((line) => line.trimEnd())
    .join('\n');

class BaseManipulator implements FileManipulator {
  removeComments(content: string): string {
    return content;
  }

  removeEmptyLines(content: string): string {
    return content
      .split('\n')
      .filter((line) => line.trim() !== '')
      .join('\n');
  }
}

class StripCommentsManipulator extends BaseManipulator {
  private language: string;

  constructor(language: string) {
    super();
    this.language = language;
  }

  removeComments(content: string): string {
    const result = strip(content, {
      language: this.language,
      preserveNewlines: true,
    });
    return rtrimLines(result);
  }
}

class PythonManipulator extends BaseManipulator {
  removeDocStrings(content: string): string {
    if (!content) return '';
    const docstringRegex = /("""|''')[\s\S]*?\1/gm;
    return content.replace(docstringRegex, '').trim();
  }

  removeHashComments(content: string): string {
    const result = content
      .split('\n')
      .map((line) => {
        const hashIndex = line.indexOf('#');
        if (hashIndex !== -1 && !this.isInsideQuotes(line, hashIndex)) {
          return line.slice(0, hashIndex).trimEnd();
        }
        return line;
      })
      .join('\n');
    return rtrimLines(result);
  }

  private isInsideQuotes(line: string, index: number): boolean {
    const singleQuotePairs = (line.match(/(?<!\\)'''|(?<!\\)'/g) || []).length;
    const doubleQuotePairs = (line.match(/(?<!\\)"""|(?<!\\)"/g) || []).length;
    return (singleQuotePairs + doubleQuotePairs) % 2 !== 0;
  }

  removeComments(content: string): string {
    let result = this.removeDocStrings(content);
    result = this.removeHashComments(result);
    return rtrimLines(result);
  }
}

class CompositeManipulator extends BaseManipulator {
  private manipulators: FileManipulator[];

  constructor(...manipulators: FileManipulator[]) {
    super();
    this.manipulators = manipulators;
  }

  removeComments(content: string): string {
    return this.manipulators.reduce(
      (acc, manipulator) => manipulator.removeComments(acc),
      content
    );
  }
}

const manipulators: Record<string, () => FileManipulator> = {
  '.c': () => new StripCommentsManipulator('c'),
  '.cs': () => new StripCommentsManipulator('csharp'),
  '.css': () => new StripCommentsManipulator('css'),
  '.dart': () => new StripCommentsManipulator('c'),
  '.go': () => new StripCommentsManipulator('c'),
  '.html': () => new StripCommentsManipulator('html'),
  '.java': () => new StripCommentsManipulator('java'),
  '.js': () => new StripCommentsManipulator('javascript'),
  '.jsx': () => new StripCommentsManipulator('javascript'),
  '.kt': () => new StripCommentsManipulator('c'),
  '.less': () => new StripCommentsManipulator('less'),
  '.php': () => new StripCommentsManipulator('php'),
  '.rb': () => new StripCommentsManipulator('ruby'),
  '.rs': () => new StripCommentsManipulator('c'),
  '.sass': () => new StripCommentsManipulator('sass'),
  '.scss': () => new StripCommentsManipulator('sass'),
  '.sh': () => new StripCommentsManipulator('perl'),
  '.sql': () => new StripCommentsManipulator('sql'),
  '.swift': () => new StripCommentsManipulator('swift'),
  '.ts': () => new StripCommentsManipulator('javascript'),
  '.tsx': () => new StripCommentsManipulator('javascript'),
  '.xml': () => new StripCommentsManipulator('xml'),
  '.yaml': () => new StripCommentsManipulator('perl'),
  '.yml': () => new StripCommentsManipulator('perl'),

  '.py': () => new PythonManipulator(),

  '.vue': () =>
    new CompositeManipulator(
      new StripCommentsManipulator('html'),
      new StripCommentsManipulator('css'),
      new StripCommentsManipulator('javascript')
    ),
  '.svelte': () =>
    new CompositeManipulator(
      new StripCommentsManipulator('html'),
      new StripCommentsManipulator('css'),
      new StripCommentsManipulator('javascript')
    ),
};

export const getFileManipulator = (filePath: string): FileManipulator | null => {
  const ext = path.extname(filePath);
  const manipulatorFactory = manipulators[ext];
  return manipulatorFactory ? manipulatorFactory() : null;
};
