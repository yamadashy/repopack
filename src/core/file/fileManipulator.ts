import path from 'node:path';
import strip from 'strip-comments';

interface FileManipulator {
  removeComments(content: string): string;
  removeEmptyLines(content: string): string;
}

const rtrimLines = (content: string): string => content.replace(/[ \t]+$/gm, '');

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
    const result = strip(content, { language: this.language, preserveNewlines: true });
    return rtrimLines(result);
  }
}

class PythonManipulator extends BaseManipulator {
  removeComments(content: string): string {
    if (!content)
      return '';
    const lines = content.split('\n');

    let result = '';
    let buffer = '';
    let quoteType = "";
    let tripleQuotes = 0;

    const doubleQuoteRegex = /^\s*(?:""")\s*(?:\n)?[\s\S]*?(?<!("""))(?:""")/gm;
    const singleQuoteRegex = /^\s*(?:''')\s*(?:\n)?[\s\S]*?(?<!('''))(?:''')/gm;

    const sz = lines.length;
    for (let i = 0; i < sz; i++) {
      const line = (lines[i] + (i != sz - 1 ? '\n' : ''));
      buffer += line;
      if (quoteType === "") {
        const indexSingle = line.indexOf("'''");
        const indexDouble = line.indexOf('"""');
        if (indexSingle !== -1 && (indexDouble === -1 || indexSingle < indexDouble)) {
          quoteType = "'''";
        } else if (indexDouble !== -1 && (indexSingle === -1 || indexDouble < indexSingle)) {
          quoteType = '"""';
        }
      }
      if (quoteType === "'''") {
        tripleQuotes += (line.match(/'''/g) || []).length;
      }
      if (quoteType === '"""') {
        tripleQuotes += (line.match(/"""/g) || []).length;
      }

      if (tripleQuotes % 2 === 0) {
        const docstringRegex = quoteType === '"""' ? doubleQuoteRegex : singleQuoteRegex;
        buffer = buffer.replace(docstringRegex, '');
        result += buffer;
        buffer = '';
        tripleQuotes = 0;
        quoteType = "";
      }
    }

    result += buffer;
    result = result.replace(/(?<!\\)#.*$/gm, '');
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
    return this.manipulators.reduce((acc, manipulator) => manipulator.removeComments(acc), content);
  }
}

const manipulators: Record<string, FileManipulator> = {
  '.c': new StripCommentsManipulator('c'),
  '.cs': new StripCommentsManipulator('csharp'),
  '.css': new StripCommentsManipulator('css'),
  '.dart': new StripCommentsManipulator('c'),
  '.go': new StripCommentsManipulator('c'),
  '.html': new StripCommentsManipulator('html'),
  '.java': new StripCommentsManipulator('java'),
  '.js': new StripCommentsManipulator('javascript'),
  '.jsx': new StripCommentsManipulator('javascript'),
  '.kt': new StripCommentsManipulator('c'),
  '.less': new StripCommentsManipulator('less'),
  '.php': new StripCommentsManipulator('php'),
  '.rb': new StripCommentsManipulator('ruby'),
  '.rs': new StripCommentsManipulator('c'),
  '.sass': new StripCommentsManipulator('sass'),
  '.scss': new StripCommentsManipulator('sass'),
  '.sh': new StripCommentsManipulator('perl'),
  '.sql': new StripCommentsManipulator('sql'),
  '.swift': new StripCommentsManipulator('swift'),
  '.ts': new StripCommentsManipulator('javascript'),
  '.tsx': new StripCommentsManipulator('javascript'),
  '.xml': new StripCommentsManipulator('xml'),
  '.yaml': new StripCommentsManipulator('perl'),
  '.yml': new StripCommentsManipulator('perl'),

  '.py': new PythonManipulator(),

  '.vue': new CompositeManipulator(
    new StripCommentsManipulator('html'),
    new StripCommentsManipulator('css'),
    new StripCommentsManipulator('javascript'),
  ),
  '.svelte': new CompositeManipulator(
    new StripCommentsManipulator('html'),
    new StripCommentsManipulator('css'),
    new StripCommentsManipulator('javascript'),
  ),
};

export const getFileManipulator = (filePath: string): FileManipulator | null => {
  const ext = path.extname(filePath);
  return manipulators[ext] || null;
};
