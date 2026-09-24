import type { TestReport, TestCase, TestSuite, TestStatus } from '../types';

/**
 * Parse the Dart/Flutter test JSON reporter stream (`flutter test --machine` /
 * `dart test --reporter=json`) into the canonical TestReport.
 *
 * The format is newline-delimited JSON events (not a single document):
 *   start, suite, group, testStart, print, error, testDone, done.
 * We correlate testStart -> print/error -> testDone by id, group tests by their
 * suite (the .dart file), and drop the synthetic "loading" tests.
 *
 * Returns null when the content is not this format.
 */

interface DartTest {
  id: number;
  name: string;
  suiteID: number;
  groupIDs: number[];
  skip: boolean;
  startTime: number;
  doneTime?: number;
  result?: 'success' | 'failure' | 'error';
  skipped?: boolean;
  hidden?: boolean;
  errorMsg?: string;
  stack?: string;
  prints: string[];
}

function basename(path: string): string {
  const parts = path.split('/');
  return parts[parts.length - 1] || path;
}

export function parseDartTestJson(content: string): TestReport | null {
  const events: Record<string, unknown>[] = [];
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed[0] !== '{') continue;
    try {
      events.push(JSON.parse(trimmed));
    } catch {
      /* ignore non-JSON lines */
    }
  }

  // Signature check: must look like the Dart test reporter.
  const looksDart = events.some(
    (e) => e.type === 'testDone' || e.type === 'testStart' || (e.type === 'start' && 'protocolVersion' in e)
  );
  if (!looksDart) return null;

  const suites = new Map<number, string>(); // id -> path
  const groups = new Map<number, string>(); // id -> name
  const tests = new Map<number, DartTest>();

  for (const e of events) {
    switch (e.type) {
      case 'suite': {
        const s = e.suite as { id: number; path?: string } | undefined;
        if (s) suites.set(s.id, s.path || `suite ${s.id}`);
        break;
      }
      case 'group': {
        const g = e.group as { id: number; name?: string } | undefined;
        if (g) groups.set(g.id, g.name || '');
        break;
      }
      case 'testStart': {
        const t = e.test as
          | { id: number; name: string; suiteID: number; groupIDs?: number[]; metadata?: { skip?: boolean } }
          | undefined;
        if (t) {
          tests.set(t.id, {
            id: t.id,
            name: t.name,
            suiteID: t.suiteID,
            groupIDs: t.groupIDs || [],
            skip: !!t.metadata?.skip,
            startTime: (e.time as number) ?? 0,
            prints: [],
          });
        }
        break;
      }
      case 'print': {
        const t = tests.get(e.testID as number);
        if (t && typeof e.message === 'string') t.prints.push(e.message);
        break;
      }
      case 'error': {
        const t = tests.get(e.testID as number);
        if (t) {
          t.errorMsg = (e.error as string) || t.errorMsg;
          t.stack = (e.stackTrace as string) || t.stack;
        }
        break;
      }
      case 'testDone': {
        const t = tests.get(e.testID as number);
        if (t) {
          t.doneTime = e.time as number;
          t.result = e.result as DartTest['result'];
          t.skipped = !!e.skipped;
          t.hidden = !!e.hidden;
        }
        break;
      }
      default:
        break;
    }
  }

  // Build suites -> testcases, dropping hidden/loading tests.
  const suiteCases = new Map<number, TestCase[]>();
  let passed = 0, failures = 0, errors = 0, skipped = 0, totalTime = 0;

  for (const t of tests.values()) {
    if (t.hidden || t.name.startsWith('loading ')) continue;

    let status: TestStatus;
    if (t.skipped || t.skip) status = 'skipped';
    else if (t.result === 'error') status = 'errored';
    else if (t.result === 'failure') status = 'failed';
    else if (t.result === 'success') status = 'passed';
    else status = 'errored'; // never finished

    const time = t.doneTime !== undefined ? Math.max(0, t.doneTime - t.startTime) / 1000 : 0;
    totalTime += time;
    if (status === 'passed') passed++;
    else if (status === 'failed') failures++;
    else if (status === 'errored') errors++;
    else skipped++;

    const groupName = t.groupIDs.map((id) => groups.get(id) || '').filter(Boolean).join(' › ');

    const tc: TestCase = { name: t.name, status, time };
    if (groupName) tc.classname = groupName;
    if (status === 'failed' || status === 'errored') {
      tc.failure_message = t.errorMsg || 'Test failed';
      tc.failure_text = [t.errorMsg, t.stack].filter(Boolean).join('\n\n');
    }
    if (t.prints.length) tc.system_out = t.prints.join('\n');

    const arr = suiteCases.get(t.suiteID) || [];
    arr.push(tc);
    suiteCases.set(t.suiteID, arr);
  }

  const testsuites: TestSuite[] = [];
  for (const [suiteID, cases] of suiteCases) {
    const s = { tests: cases.length, failures: 0, errors: 0, skipped: 0, time: 0 };
    for (const c of cases) {
      if (c.status === 'failed') s.failures++;
      else if (c.status === 'errored') s.errors++;
      else if (c.status === 'skipped') s.skipped++;
      s.time += c.time || 0;
    }
    testsuites.push({
      name: basename(suites.get(suiteID) || `suite ${suiteID}`),
      ...s,
      testcases: cases,
    });
  }
  testsuites.sort((a, b) => a.name.localeCompare(b.name));

  if (testsuites.length === 0) return null;

  return {
    format: 'dart',
    summary: {
      tests: passed + failures + errors + skipped,
      passed,
      failures,
      errors,
      skipped,
      time: totalTime,
    },
    testsuites,
  };
}
