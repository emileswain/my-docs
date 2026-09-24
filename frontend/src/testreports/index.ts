import type { TestReport } from '../types';
import { parseJUnitXml } from './junit';
import { parseDartTestJson } from './dart';

/**
 * Test-report parser registry — the interchangeable interface between the file
 * viewer and any test-result source format. Each parser inspects the raw
 * content and returns a canonical TestReport, or null if it doesn't match.
 *
 * To support a new format, add a `{ exts, parse }` entry here; the viewer needs
 * no changes.
 */
interface TestReportParser {
  /** File extensions this parser applies to (fast pre-filter). */
  exts: string[];
  parse: (content: string) => TestReport | null;
}

const PARSERS: TestReportParser[] = [
  { exts: ['.xml'], parse: parseJUnitXml },
  { exts: ['.json'], parse: parseDartTestJson },
];

/**
 * Detect and parse a test report from file content. Tries parsers whose
 * extension matches first, then any remaining parser as a fallback. Returns the
 * first successful TestReport, or null when the content isn't a test report.
 */
export function detectTestReport(content: string, extension: string): TestReport | null {
  const ext = extension.toLowerCase();
  const ordered = [
    ...PARSERS.filter((p) => p.exts.includes(ext)),
    ...PARSERS.filter((p) => !p.exts.includes(ext)),
  ];
  for (const parser of ordered) {
    const report = parser.parse(content);
    if (report) return report;
  }
  return null;
}
