export type SubprojectType =
  | 'mobile' | 'web' | 'firmware' | 'services' | 'docs'
  | 'desktop' | 'database' | 'cloud' | 'testing' | 'design'
  | 'workspace';

export const SUBPROJECT_TYPE_ICONS: Record<SubprojectType, string> = {
  mobile: 'fa-mobile-alt',
  web: 'fa-globe',
  firmware: 'fa-microchip',
  services: 'fa-server',
  docs: 'fa-book',
  desktop: 'fa-desktop',
  database: 'fa-database',
  cloud: 'fa-cloud',
  testing: 'fa-vial',
  design: 'fa-palette',
  workspace: 'fa-folder-tree',
};

export interface SubProject {
  id: string;
  title: string;
  description: string;
  path: string;
  slug: string;
  type: SubprojectType;
}

export interface ProjectGroup {
  id: string;
  title: string;
  slug: string;
  subprojects: SubProject[];
}

/** @deprecated Use SubProject instead */
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
