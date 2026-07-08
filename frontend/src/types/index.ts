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
  junit?: JUnitData;
}

export interface JUnitTestCase {
  name: string;
  classname?: string;
  time?: number;
  status: 'passed' | 'failed' | 'errored' | 'skipped';
  failure_message?: string;
  failure_text?: string;
  file?: string;
}

export interface JUnitTestSuite {
  name: string;
  tests: number;
  failures: number;
  errors: number;
  skipped: number;
  time: number;
  testcases: JUnitTestCase[];
}

export interface JUnitData {
  summary: {
    tests: number;
    passed: number;
    failures: number;
    errors: number;
    skipped: number;
    time: number;
  };
  testsuites: JUnitTestSuite[];
}

export interface BrowseResponse {
  project: Project;
  path: string;
  items: FileItem[];
}
