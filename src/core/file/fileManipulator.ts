import path from "node:path";
import strip from "strip-comments";

interface FileManipulator {
  removeComments(content: string): string;
  removeEmptyLines(content: string): string;
}

const rtrimLines = (content: string): string =>
  content.replace(/[ \t]+$/gm, "");

class BaseManipulator implements FileManipulator {
  removeComments(content: string): string {
    return content;
  }

  removeEmptyLines(content: string): string {
    return content
      .split("\n")
      .filter((line) => line.trim() !== "")
      .join("\n");
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
    if (!content) return "";
    const lines = content.split("\n");

    let result = "";

    let buffer = "";
    let quoteType: "" | "'" | '"' = "";
    let tripleQuotes = 0;

    const doubleQuoteRegex =
      /^\s*(?<!\\)(?:""")\s*(?:\n)?[\s\S]*?(?<!("""))(?<!\\)(?:""")/gm;
    const singleQuoteRegex =
      /^\s*(?<!\\)(?:''')\s*(?:\n)?[\s\S]*?(?<!('''))(?<!\\)(?:''')/gm;

    const sz = lines.length;
    for (let i = 0; i < sz; i++) {
      const line = lines[i] + (i != sz - 1 ? "\n" : "");
      buffer += line;
      if (quoteType === "") {
        const indexSingle = line.search(/(?<![\"])(?<!\\)'''(?![\"])/g);
        const indexDouble = line.search(/(?<![\'])(?<!\\)"""(?![\'])/g);
        if (
          indexSingle !== -1 &&
          (indexDouble === -1 || indexSingle < indexDouble)
        ) {
          quoteType = "'";
        } else if (
          indexDouble !== -1 &&
          (indexSingle === -1 || indexDouble < indexSingle)
        ) {
          quoteType = '"';
        }
      }
      if (quoteType === "'") {
        tripleQuotes += (line.match(/(?<![\"])(?<!\\)'''(?!["])/g) || [])
          .length;
      }
      if (quoteType === '"') {
        tripleQuotes += (line.match(/(?<![\'])(?<!\\)"""(?![\'])/g) || [])
          .length;
      }

      if (tripleQuotes % 2 === 0) {
        const docstringRegex =
          quoteType === '"' ? doubleQuoteRegex : singleQuoteRegex;
        buffer = buffer.replace(docstringRegex, "");
        result += buffer;
        buffer = "";
        tripleQuotes = 0;
        quoteType = "";
      }
    }

    result += buffer;
    return result;
  }

  removeHashComments(content: string): string {
    const searchInPairs = (
      pairs: [number, number][],
      hashIndex: number,
    ): boolean => {
      let ans = -1;
      let start = 0;
      let end = pairs.length - 1;
      while (start <= end) {
        const mid = Math.floor((start + end) / 2);
        const [pairStart, pairEnd] = pairs[mid];
        if (hashIndex > pairStart && hashIndex < pairEnd) {
          ans = mid;
          break;
        }
        if (hashIndex < pairStart) {
          end = mid - 1;
        } else {
          start = mid + 1;
        }
      }
      return ans !== -1;
    };
    let result = "";
    const pairs: [number, number][] = [];
    let prevQuote = 0;
    while (prevQuote < content.length) {
      const openingQuote: number =
        content.slice(prevQuote + 1).search(/(?<!\\)(?:"|'|'''|""")/g) +
        prevQuote +
        1;
      if (openingQuote === prevQuote) break;

      let closingQuote: number;
      if (
        content.startsWith('"""', openingQuote) ||
        content.startsWith("'''", openingQuote)
      ) {
        const quoteType = content.slice(openingQuote, openingQuote + 3);
        closingQuote = content.indexOf(quoteType, openingQuote + 3);
      } else {
        const quoteType = content[openingQuote];
        closingQuote = content.indexOf(quoteType, openingQuote + 1);
      }
      if (closingQuote === -1) break;
      pairs.push([openingQuote, closingQuote]);
      prevQuote = closingQuote;
    }
    let prevHash = 0;
    while (prevHash < content.length) {
      const hashIndex = content.slice(prevHash).search(/(?<!\\)#/g) + prevHash;
      if (hashIndex === prevHash - 1) {
        result += content.slice(prevHash);
        break;
      }
      const isInsideString = searchInPairs(pairs, hashIndex);
      const nextNewLine = content.indexOf("\n", hashIndex);
      if (!isInsideString) {
        if (nextNewLine === -1) {
          result += content.slice(prevHash);
          break;
        }
        result += `${content.slice(prevHash, hashIndex)}\n`;
      } else {
        if (nextNewLine === -1) {
          result += content.slice(prevHash);
          break;
        }
        result += `${content.slice(prevHash, nextNewLine)}\n`;
      }
      prevHash = nextNewLine + 1;
    }
    return result;
  }

  removeComments(content: string): string {
  removeComments(content: string): string {
    let result = this.removeDocStrings(content);
    result = this.removeHashComments(result);
    return rtrimLines(result);
  }
    return rtrimLines(content);
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
      content,
    );
  }
}

const manipulators: Record<string, FileManipulator> = {
  ".c": new StripCommentsManipulator("c"),
  ".cs": new StripCommentsManipulator("csharp"),
  ".css": new StripCommentsManipulator("css"),
  ".dart": new StripCommentsManipulator("c"),
  ".go": new StripCommentsManipulator("c"),
  ".html": new StripCommentsManipulator("html"),
  ".java": new StripCommentsManipulator("java"),
  ".js": new StripCommentsManipulator("javascript"),
  ".jsx": new StripCommentsManipulator("javascript"),
  ".kt": new StripCommentsManipulator("c"),
  ".less": new StripCommentsManipulator("less"),
  ".php": new StripCommentsManipulator("php"),
  ".rb": new StripCommentsManipulator("ruby"),
  ".rs": new StripCommentsManipulator("c"),
  ".sass": new StripCommentsManipulator("sass"),
  ".scss": new StripCommentsManipulator("sass"),
  ".sh": new StripCommentsManipulator("perl"),
  ".sql": new StripCommentsManipulator("sql"),
  ".swift": new StripCommentsManipulator("swift"),
  ".ts": new StripCommentsManipulator("javascript"),
  ".tsx": new StripCommentsManipulator("javascript"),
  ".xml": new StripCommentsManipulator("xml"),
  ".yaml": new StripCommentsManipulator("perl"),
  ".yml": new StripCommentsManipulator("perl"),

  ".py": new PythonManipulator(),

  ".vue": new CompositeManipulator(
    new StripCommentsManipulator("html"),
    new StripCommentsManipulator("css"),
    new StripCommentsManipulator("javascript"),
  ),
  ".svelte": new CompositeManipulator(
    new StripCommentsManipulator("html"),
    new StripCommentsManipulator("css"),
    new StripCommentsManipulator("javascript"),
  ),
};

export const getFileManipulator = (
  filePath: string,
): FileManipulator | null => {
  const ext = path.extname(filePath);
  return manipulators[ext] || null;
};
