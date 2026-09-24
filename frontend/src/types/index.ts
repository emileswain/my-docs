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
  modified?: number;
  /** Folders only: true when the folder directly contains image files. */
  has_images?: boolean;
}

export interface ImageItem {
  name: string;
  path: string;
  extension?: string;
  modified?: number;
}

export interface ImageFolder {
  folder: string;
  name: string;
  images: ImageItem[];
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

// --- Canonical test-report model ---
// Both JUnit XML and Dart test JSON parse into this shape, so a single viewer
// can render either. Add new formats by writing a parser that returns TestReport.

export type TestStatus = 'passed' | 'failed' | 'errored' | 'skipped';

export interface TestCase {
  name: string;
  classname?: string;
  app_path?: string;
  time?: number;
  status: TestStatus;
  failure_message?: string;
  failure_text?: string;
  system_out?: string;
  file?: string;
}

export interface TestSuite {
  name: string;
  tests: number;
  failures: number;
  errors: number;
  skipped: number;
  time: number;
  testcases: TestCase[];
}

export interface TestReport {
  /** Which source format produced this report (for labelling). */
  format?: 'junit' | 'dart';
  summary: {
    tests: number;
    passed: number;
    failures: number;
    errors: number;
    skipped: number;
    time: number;
  };
  testsuites: TestSuite[];
}

/** @deprecated use TestCase / TestSuite / TestReport */
export type JUnitTestCase = TestCase;
/** @deprecated */
export type JUnitTestSuite = TestSuite;
/** @deprecated */
export type JUnitData = TestReport;

export interface BrowseResponse {
  project: Project;
  path: string;
  items: FileItem[];
}

export interface Watch {
  id: string;
  name: string;
  subfolder: string;
  pattern: string;
  enabled: boolean;
  /** When true, the pattern is derived from the current git branch's issue number. */
  branch_issue?: boolean;
  /** Deprecated free-form script (no longer executed); kept for back-compat. */
  script?: string;
  source?: 'global' | 'project';
}

export interface WatchResult {
  watch: Watch;
  files: FileItem[];
}
