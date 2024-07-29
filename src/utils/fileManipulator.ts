import path from 'node:path';
import strip from 'strip-comments';

interface FileManipulator {
  removeComments(content: string): string;
}

function rtrimLines(content: string): string {
  return content.replace(/[ \t]+$/gm, '');
}

class StripCommentsManipulator implements FileManipulator {
  private language: string;

  constructor(language: string) {
    this.language = language;
  }

  removeComments(content: string): string {
    let result = strip(content, { language: this.language, preserveNewlines: true });
    return rtrimLines(result);
  }
}

class PythonManipulator implements FileManipulator {
  removeComments(content: string): string {
    // First, use strip-comments to remove standard comments
    let result = strip(content, { language: 'python', preserveNewlines: true });

    // Then, remove triple-quote comments
    result = result.replace(/'''[\s\S]*?'''/g, '');
    result = result.replace(/"""[\s\S]*?"""/g, '');

    // Then, remove inline comments
    result = result.replace(/(?<!\\)#.*$/gm, '');

    return rtrimLines(result);
  }
}

class CompositeManipulator implements FileManipulator {
  private manipulators: FileManipulator[];

  constructor(...manipulators: FileManipulator[]) {
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

export function getFileManipulator(filePath: string): FileManipulator | null {
  const ext = path.extname(filePath);
  return manipulators[ext] || null;
}
