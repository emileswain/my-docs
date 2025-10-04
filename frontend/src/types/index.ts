export interface Project {
  id: string;
  title: string;
  description: string;
  path: string;
  slug: string;
}

export interface FileItem {
  name: string;
  path: string;
  type: 'file' | 'folder';
  extension?: string;
}

export interface TreeNode {
  label: string;
  type?: string;
  children?: TreeNode[];
}

export interface FileContent {
  content: string;
  html?: string;
  tree?: TreeNode[];
}

export interface BrowseResponse {
  project: Project;
  path: string;
  items: FileItem[];
}
