import path from 'node:path';

interface TreeNode {
  name: string;
  children: TreeNode[];
  isDirectory: boolean;
}

const createTreeNode = (name: string, isDirectory: boolean): TreeNode => ({ name, children: [], isDirectory });

export const generateFileTree = (files: string[]): TreeNode => {
  const root: TreeNode = createTreeNode('root', true);

  for (const file of files) {
    const parts = file.split(path.sep);
    let currentNode = root;

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      const isLastPart = i === parts.length - 1;
      let child = currentNode.children.find((c) => c.name === part);

      if (!child) {
        child = createTreeNode(part, !isLastPart);
        currentNode.children.push(child);
      }

      currentNode = child;
    }
  }

  return root;
};

const sortTreeNodes = (node: TreeNode) => {
  node.children.sort((a, b) => {
    if (a.isDirectory === b.isDirectory) {
      return a.name.localeCompare(b.name);
    }
    return a.isDirectory ? -1 : 1;
  });

  for (const child of node.children) {
    sortTreeNodes(child);
  }
};

export const treeToString = (node: TreeNode, prefix = ''): string => {
  sortTreeNodes(node);
  let result = '';

  for (const child of node.children) {
    result += `${prefix}${child.name}${child.isDirectory ? '/' : ''}\n`;
    if (child.isDirectory) {
      result += treeToString(child, prefix + '  ');
    }
  }

  return result;
};

export const generateTreeString = (files: string[]): string => {
  const tree = generateFileTree(files);
  return treeToString(tree).trim();
};
