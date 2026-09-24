import type { JUnitData, JUnitTestCase, JUnitTestSuite } from '../types';

/**
 * Parse JUnit XML into structured test-result data, entirely in the browser
 * (DOMParser). Ported from the Python parse_junit_xml — the file viewer already
 * has the raw content, so no backend round-trip is needed. Returns null when the
 * XML is not a JUnit testsuites/testsuite document.
 */
export function parseJUnitXml(content: string): JUnitData | null {
  if (!content.trim()) return null;

  let root: Element | null;
  try {
    const doc = new DOMParser().parseFromString(content, 'application/xml');
    if (doc.querySelector('parsererror')) return null;
    root = doc.documentElement;
  } catch {
    return null;
  }
  if (!root) return null;

  let suiteElements: Element[];
  if (root.tagName === 'testsuites') {
    suiteElements = Array.from(root.children).filter((c) => c.tagName === 'testsuite');
  } else if (root.tagName === 'testsuite') {
    suiteElements = [root];
  } else {
    return null;
  }

  const num = (el: Element, attr: string) => parseInt(el.getAttribute(attr) || '0', 10) || 0;
  const flt = (el: Element, attr: string) => parseFloat(el.getAttribute(attr) || '0') || 0;

  let totalTests = 0, totalFailures = 0, totalErrors = 0, totalSkipped = 0, totalTime = 0;
  const testsuites: JUnitTestSuite[] = [];

  for (const suiteEl of suiteElements) {
    const suiteTests = num(suiteEl, 'tests');
    const suiteFailures = num(suiteEl, 'failures');
    const suiteErrors = num(suiteEl, 'errors');
    const suiteSkipped = num(suiteEl, 'skipped');
    const suiteTime = flt(suiteEl, 'time');

    totalTests += suiteTests;
    totalFailures += suiteFailures;
    totalErrors += suiteErrors;
    totalSkipped += suiteSkipped;
    totalTime += suiteTime;

    const testcases: JUnitTestCase[] = [];
    for (const tcEl of Array.from(suiteEl.children).filter((c) => c.tagName === 'testcase')) {
      const failureEl = tcEl.querySelector(':scope > failure');
      const errorEl = tcEl.querySelector(':scope > error');
      const skippedEl = tcEl.querySelector(':scope > skipped');

      let status: JUnitTestCase['status'] = 'passed';
      let failureMessage: string | undefined;
      let failureText: string | undefined;

      if (failureEl) {
        status = 'failed';
        failureMessage = failureEl.getAttribute('message') || '';
        failureText = failureEl.textContent || '';
      } else if (errorEl) {
        status = 'errored';
        failureMessage = errorEl.getAttribute('message') || '';
        failureText = errorEl.textContent || '';
      } else if (skippedEl) {
        status = 'skipped';
        failureMessage = skippedEl.getAttribute('message') || '';
        failureText = '';
      }

      const tc: JUnitTestCase = {
        name: tcEl.getAttribute('name') || 'unnamed',
        time: flt(tcEl, 'time'),
        status,
      };
      const classname = tcEl.getAttribute('classname');
      if (classname) tc.classname = classname;
      if (failureMessage !== undefined) tc.failure_message = failureMessage;
      if (failureText !== undefined) tc.failure_text = failureText;

      const file = tcEl.getAttribute('file');
      if (file) tc.file = file;
      const appPath = tcEl.getAttribute('app_path');
      if (appPath) tc.app_path = appPath;

      const sysoutEl = tcEl.querySelector(':scope > system-out');
      if (sysoutEl) {
        const msg = sysoutEl.getAttribute('message') || sysoutEl.textContent || '';
        if (msg) tc.system_out = msg;
      }

      testcases.push(tc);
    }

    testsuites.push({
      name: suiteEl.getAttribute('name') || 'unnamed',
      tests: suiteTests,
      failures: suiteFailures,
      errors: suiteErrors,
      skipped: suiteSkipped,
      time: suiteTime,
      testcases,
    });
  }

  return {
    summary: {
      tests: totalTests,
      passed: totalTests - totalFailures - totalErrors - totalSkipped,
      failures: totalFailures,
      errors: totalErrors,
      skipped: totalSkipped,
      time: totalTime,
    },
    testsuites,
  };
}
