import { useState, useMemo } from 'react';
import type { JUnitData, JUnitTestCase, JUnitTestSuite } from '../../types';

type StatusFilter = 'all' | 'failed' | 'passed' | 'errored' | 'skipped';
type SortMode = 'status' | 'name' | 'duration' | 'default';
type GroupMode = 'none' | 'classname' | 'status';

interface JUnitViewerProps {
  junit: JUnitData;
}

const STATUS_ORDER: Record<string, number> = {
  failed: 0,
  errored: 1,
  skipped: 2,
  passed: 3,
};

function StatusIcon({ status }: { status: JUnitTestCase['status'] }) {
  switch (status) {
    case 'passed':
      return <i className="fas fa-check-circle" style={{ color: '#22c55e' }} />;
    case 'failed':
      return <i className="fas fa-times-circle" style={{ color: '#ef4444' }} />;
    case 'errored':
      return <i className="fas fa-exclamation-circle" style={{ color: '#ef4444' }} />;
    case 'skipped':
      return <i className="fas fa-minus-circle" style={{ color: '#9ca3af' }} />;
  }
}

function formatDuration(seconds: number): string {
  if (seconds < 0.001) return '<1ms';
  if (seconds < 1) return `${Math.round(seconds * 1000)}ms`;
  if (seconds < 60) return `${seconds.toFixed(1)}s`;
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}m ${secs.toFixed(0)}s`;
}

function TestCaseRow({ tc }: { tc: JUnitTestCase }) {
  const [expanded, setExpanded] = useState(false);
  const hasDetails = tc.status === 'failed' || tc.status === 'errored';
  const isExpandable = hasDetails || !!tc.system_out;

  return (
    <div style={{ borderBottom: '1px solid var(--border-primary)' }}>
      <div
        className="flex items-center gap-3 px-4 py-2.5"
        style={{ cursor: isExpandable ? 'pointer' : 'default' }}
        onClick={() => isExpandable && setExpanded(!expanded)}
      >
        <StatusIcon status={tc.status} />
        <div className="flex-1 min-w-0">
          <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
            {tc.name}
          </span>
          {tc.system_out && !expanded && (
            <span className="text-xs ml-2 italic" style={{ color: 'var(--text-tertiary)' }}>
              {tc.system_out.length > 60 ? tc.system_out.slice(0, 60) + '...' : tc.system_out}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {tc.time !== undefined && (
            <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
              {formatDuration(tc.time)}
            </span>
          )}
          {isExpandable && (
            <i
              className={`fas fa-chevron-${expanded ? 'up' : 'down'} text-xs`}
              style={{ color: 'var(--text-tertiary)' }}
            />
          )}
        </div>
      </div>
      {expanded && isExpandable && (
        <div className="px-4 pb-3" style={{ paddingLeft: '2.75rem' }}>
          {tc.failure_message && (
            <p className="text-sm mb-2 font-medium" style={{ color: '#ef4444' }}>
              {tc.failure_message}
            </p>
          )}
          {tc.failure_text && (
            <pre
              className="text-xs p-3 rounded overflow-x-auto"
              style={{
                backgroundColor: 'var(--bg-primary)',
                color: 'var(--text-secondary)',
                maxHeight: '300px',
                overflowY: 'auto',
              }}
            >
              {tc.failure_text}
            </pre>
          )}
          {tc.system_out && (
            <p className="text-xs mt-1 italic" style={{ color: 'var(--text-tertiary)' }}>
              <i className="fas fa-comment-alt mr-1" style={{ fontSize: '10px' }} />
              {tc.system_out}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

interface TestGroup {
  key: string;
  label: string;
  tests: JUnitTestCase[];
  failCount: number;
  totalCount: number;
}

function groupTests(tests: JUnitTestCase[], mode: GroupMode): TestGroup[] {
  if (mode === 'none') {
    return [{
      key: '_all',
      label: '',
      tests,
      failCount: tests.filter(t => t.status === 'failed' || t.status === 'errored').length,
      totalCount: tests.length,
    }];
  }

  const map = new Map<string, JUnitTestCase[]>();

  for (const tc of tests) {
    let key: string;
    if (mode === 'status') {
      key = tc.status;
    } else {
      // classname grouping — try classname first, then app_path, then test name prefix
      const cn = tc.classname || '';
      const ap = tc.app_path || '';

      if (cn) {
        // pytest: "tests.test_auth.TestLogin" → "TestLogin"
        // java:   "com.example.AuthTest" → "AuthTest"
        const parts = cn.split('.');
        key = parts[parts.length - 1] || cn;
      } else if (ap) {
        // Unity/ESP-IDF: "/path/to/hw_tests/test_audio" → "test_audio"
        const parts = ap.replace(/\/+$/, '').split('/');
        key = parts[parts.length - 1] || ap;
      } else {
        // Fall back to test name prefix: "T-AU-01: ..." → "T-AU"
        const prefixMatch = tc.name.match(/^([A-Z]+-[A-Z]+)/);
        key = prefixMatch ? prefixMatch[1] : 'Ungrouped';
      }
    }
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(tc);
  }

  const groups: TestGroup[] = [];
  for (const [key, groupTests] of map) {
    const failCount = groupTests.filter(t => t.status === 'failed' || t.status === 'errored').length;
    groups.push({
      key,
      label: mode === 'status' ? key.charAt(0).toUpperCase() + key.slice(1) : key,
      tests: groupTests,
      failCount,
      totalCount: groupTests.length,
    });
  }

  // Sort groups: groups with failures first, then alphabetical
  groups.sort((a, b) => {
    if (a.failCount > 0 && b.failCount === 0) return -1;
    if (a.failCount === 0 && b.failCount > 0) return 1;
    return a.label.localeCompare(b.label);
  });

  return groups;
}

function filterTests(tests: JUnitTestCase[], filter: StatusFilter): JUnitTestCase[] {
  if (filter === 'all') return tests;
  if (filter === 'failed') return tests.filter(tc => tc.status === 'failed' || tc.status === 'errored');
  return tests.filter(tc => tc.status === filter);
}

function sortTests(tests: JUnitTestCase[], sort: SortMode): JUnitTestCase[] {
  if (sort === 'default') return tests;
  return [...tests].sort((a, b) => {
    switch (sort) {
      case 'status':
        return (STATUS_ORDER[a.status] ?? 9) - (STATUS_ORDER[b.status] ?? 9);
      case 'name':
        return a.name.localeCompare(b.name);
      case 'duration':
        return (b.time ?? 0) - (a.time ?? 0);
      default:
        return 0;
    }
  });
}

const FILTER_OPTIONS: { value: StatusFilter; label: string; icon: string; color: string }[] = [
  { value: 'all', label: 'All', icon: 'fa-list', color: 'var(--text-secondary)' },
  { value: 'failed', label: 'Broken', icon: 'fa-times-circle', color: '#ef4444' },
  { value: 'passed', label: 'Passed', icon: 'fa-check-circle', color: '#22c55e' },
  { value: 'skipped', label: 'Skipped', icon: 'fa-minus-circle', color: '#9ca3af' },
];

const SORT_OPTIONS: { value: SortMode; label: string; icon: string }[] = [
  { value: 'status', label: 'Status', icon: 'fa-flag' },
  { value: 'name', label: 'Name', icon: 'fa-font' },
  { value: 'duration', label: 'Duration', icon: 'fa-clock' },
  { value: 'default', label: 'Default', icon: 'fa-sort' },
];

const GROUP_OPTIONS: { value: GroupMode; label: string; icon: string }[] = [
  { value: 'classname', label: 'Class', icon: 'fa-sitemap' },
  { value: 'status', label: 'Status', icon: 'fa-flag' },
  { value: 'none', label: 'None', icon: 'fa-bars' },
];

function CollapsibleGroup({
  group,
  filter,
  sort,
  defaultOpen,
}: {
  group: TestGroup;
  filter: StatusFilter;
  sort: SortMode;
  defaultOpen: boolean;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const filtered = filterTests(group.tests, filter);
  const sorted = sortTests(filtered, sort);

  if (sorted.length === 0) return null;

  // No wrapper when ungrouped
  if (group.key === '_all') {
    return (
      <>
        {sorted.map((tc, i) => (
          <TestCaseRow key={i} tc={tc} />
        ))}
      </>
    );
  }

  const hasFailures = group.failCount > 0;

  return (
    <div>
      {/* Group header */}
      <div
        className="flex items-center gap-2 px-4 py-2.5 cursor-pointer"
        style={{
          backgroundColor: 'var(--bg-secondary)',
          borderBottom: '1px solid var(--border-primary)',
          borderTop: '2px solid var(--border-primary)',
        }}
        onClick={() => setIsOpen(!isOpen)}
      >
        <i
          className={`fas fa-chevron-${isOpen ? 'down' : 'right'} text-xs`}
          style={{ color: 'var(--text-tertiary)', width: '10px' }}
        />
        <i
          className="fas fa-folder text-xs"
          style={{ color: hasFailures ? '#ef4444' : 'var(--accent-primary)' }}
        />
        <span className="text-sm font-semibold flex-1" style={{ color: 'var(--text-primary)' }}>
          {group.label}
        </span>
        {hasFailures && (
          <span
            className="text-xs font-semibold px-1.5 py-0.5 rounded"
            style={{ color: '#ef4444', backgroundColor: 'rgba(239, 68, 68, 0.1)' }}
          >
            {group.failCount} failed
          </span>
        )}
        <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
          {filter !== 'all' ? `${sorted.length}/` : ''}{group.totalCount} tests
        </span>
      </div>
      {/* Indented test rows */}
      {isOpen && (
        <div style={{ paddingLeft: '1rem', borderLeft: `2px solid ${hasFailures ? 'rgba(239, 68, 68, 0.3)' : 'var(--border-secondary)'}`, marginLeft: '0.75rem' }}>
          {sorted.map((tc, i) => (
            <TestCaseRow key={i} tc={tc} />
          ))}
        </div>
      )}
    </div>
  );
}

function SuiteSection({
  suite,
  si,
  filter,
  sort,
  groupMode,
  hasFailures,
}: {
  suite: JUnitTestSuite;
  si: number;
  filter: StatusFilter;
  sort: SortMode;
  groupMode: GroupMode;
  hasFailures: boolean;
}) {
  const groups = useMemo(
    () => groupTests(suite.testcases, groupMode),
    [suite.testcases, groupMode]
  );

  // Check if any tests survive the filter
  const visibleCount = useMemo(() => {
    return groups.reduce((sum, g) => sum + filterTests(g.tests, filter).length, 0);
  }, [groups, filter]);

  if (visibleCount === 0 && filter !== 'all') return null;

  return (
    <div
      key={si}
      className="rounded-lg mb-4 overflow-hidden"
      style={{
        border: '1px solid var(--border-primary)',
        backgroundColor: 'var(--bg-tertiary)',
      }}
    >
      <div
        className="px-4 py-3 flex items-center justify-between"
        style={{
          borderBottom: '1px solid var(--border-primary)',
          backgroundColor: 'var(--bg-secondary)',
        }}
      >
        <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
          {suite.name}
        </span>
        <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
          {filter !== 'all' ? `${visibleCount} shown · ` : ''}
          {suite.tests - suite.failures - suite.errors - suite.skipped}/{suite.tests} passed
          {' · '}
          {formatDuration(suite.time)}
        </span>
      </div>
      <div>
        {visibleCount === 0 ? (
          <p
            className="text-sm italic px-4 py-4 text-center"
            style={{ color: 'var(--text-tertiary)' }}
          >
            No matching tests
          </p>
        ) : (
          groups.map((group) => (
            <CollapsibleGroup
              key={group.key}
              group={group}
              filter={filter}
              sort={sort}
              defaultOpen={hasFailures ? group.failCount > 0 : true}
            />
          ))
        )}
      </div>
    </div>
  );
}

export function JUnitViewer({ junit }: JUnitViewerProps) {
  const { summary } = junit;
  const hasFailures = summary.failures > 0 || summary.errors > 0;

  // Default: sort by status (failures first), filter to broken if there are failures
  const [statusFilter, setStatusFilter] = useState<StatusFilter>(hasFailures ? 'failed' : 'all');
  const [sortMode, setSortMode] = useState<SortMode>('status');
  const [groupMode, setGroupMode] = useState<GroupMode>('classname');

  const allPassed = !hasFailures;

  const passPercent = summary.tests > 0 ? (summary.passed / summary.tests) * 100 : 0;
  const failPercent = summary.tests > 0 ? (summary.failures / summary.tests) * 100 : 0;
  const errorPercent = summary.tests > 0 ? (summary.errors / summary.tests) * 100 : 0;
  const skipPercent = summary.tests > 0 ? (summary.skipped / summary.tests) * 100 : 0;

  const filterCounts = useMemo(() => {
    const counts: Record<StatusFilter, number> = { all: 0, passed: 0, failed: 0, errored: 0, skipped: 0 };
    for (const suite of junit.testsuites) {
      for (const tc of suite.testcases) {
        counts.all++;
        counts[tc.status]++;
      }
    }
    // Merge errored into failed count for the "Broken" filter
    counts.failed += counts.errored;
    return counts;
  }, [junit]);

  return (
    <div>
      {/* Summary bar */}
      <div
        className="rounded-lg p-4 mb-4"
        style={{
          backgroundColor: 'var(--bg-tertiary)',
          border: '1px solid var(--border-primary)',
        }}
      >
        <div className="flex items-center gap-4 mb-3">
          <div className="flex items-center gap-2">
            <i
              className={`fas fa-${allPassed ? 'check-circle' : 'times-circle'} text-lg`}
              style={{ color: allPassed ? '#22c55e' : '#ef4444' }}
            />
            <span
              className="text-lg font-semibold"
              style={{ color: 'var(--text-primary)' }}
            >
              {allPassed ? 'All Tests Passed' : 'Tests Failed'}
            </span>
          </div>
          <span className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
            {formatDuration(summary.time)}
          </span>
        </div>

        <div className="flex gap-4 mb-3">
          <Badge label="Total" count={summary.tests} color="var(--text-secondary)" />
          <Badge label="Passed" count={summary.passed} color="#22c55e" />
          {summary.failures > 0 && (
            <Badge label="Failed" count={summary.failures} color="#ef4444" />
          )}
          {summary.errors > 0 && (
            <Badge label="Errors" count={summary.errors} color="#ef4444" />
          )}
          {summary.skipped > 0 && (
            <Badge label="Skipped" count={summary.skipped} color="#9ca3af" />
          )}
        </div>

        {/* Progress bar */}
        <div className="flex rounded-full overflow-hidden" style={{ height: '6px' }}>
          {passPercent > 0 && <div style={{ width: `${passPercent}%`, backgroundColor: '#22c55e' }} />}
          {failPercent > 0 && <div style={{ width: `${failPercent}%`, backgroundColor: '#ef4444' }} />}
          {errorPercent > 0 && <div style={{ width: `${errorPercent}%`, backgroundColor: '#f97316' }} />}
          {skipPercent > 0 && <div style={{ width: `${skipPercent}%`, backgroundColor: '#9ca3af' }} />}
        </div>
      </div>

      {/* Filter, Sort & Group toolbar */}
      <div
        className="flex items-center gap-4 mb-4 rounded-lg px-3 py-2 flex-wrap"
        style={{
          backgroundColor: 'var(--bg-tertiary)',
          border: '1px solid var(--border-primary)',
        }}
      >
        {/* Filter pills */}
        <div className="flex items-center gap-1">
          <span className="text-xs font-bold mr-1" style={{ color: 'var(--text-primary)' }}>Filter:</span>
          {FILTER_OPTIONS.map((opt) => {
            const count = filterCounts[opt.value];
            if (opt.value !== 'all' && count === 0) return null;
            const isActive = statusFilter === opt.value;
            return (
              <button
                key={opt.value}
                onClick={() => setStatusFilter(opt.value)}
                className="flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors"
                style={{
                  backgroundColor: isActive ? 'var(--accent-secondary)' : 'transparent',
                  color: isActive ? opt.color : 'var(--text-tertiary)',
                  border: isActive ? '1px solid var(--accent-primary)' : '1px solid transparent',
                }}
              >
                <i className={`fas ${opt.icon}`} style={{ fontSize: '10px' }} />
                <span>{opt.label}</span>
                <span className="font-semibold" style={{ color: isActive ? opt.color : 'var(--text-tertiary)' }}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Group selector */}
        <div className="flex items-center gap-1">
          <span className="text-xs font-bold mr-1" style={{ color: 'var(--text-primary)' }}>Group:</span>
          {GROUP_OPTIONS.map((opt) => {
            const isActive = groupMode === opt.value;
            return (
              <button
                key={opt.value}
                onClick={() => setGroupMode(opt.value)}
                className="flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors"
                style={{
                  backgroundColor: isActive ? 'var(--accent-secondary)' : 'transparent',
                  color: isActive ? 'var(--accent-primary)' : 'var(--text-tertiary)',
                  border: isActive ? '1px solid var(--accent-primary)' : '1px solid transparent',
                }}
              >
                <i className={`fas ${opt.icon}`} style={{ fontSize: '10px' }} />
                <span>{opt.label}</span>
              </button>
            );
          })}
        </div>

        {/* Sort selector */}
        <div className="flex items-center gap-1">
          <span className="text-xs font-bold mr-1" style={{ color: 'var(--text-primary)' }}>Sort:</span>
          {SORT_OPTIONS.map((opt) => {
            const isActive = sortMode === opt.value;
            return (
              <button
                key={opt.value}
                onClick={() => setSortMode(opt.value)}
                className="flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors"
                style={{
                  backgroundColor: isActive ? 'var(--accent-secondary)' : 'transparent',
                  color: isActive ? 'var(--accent-primary)' : 'var(--text-tertiary)',
                  border: isActive ? '1px solid var(--accent-primary)' : '1px solid transparent',
                }}
              >
                <i className={`fas ${opt.icon}`} style={{ fontSize: '10px' }} />
                <span>{opt.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Test suites */}
      {junit.testsuites.map((suite, si) => (
        <SuiteSection
          key={si}
          suite={suite}
          si={si}
          filter={statusFilter}
          sort={sortMode}
          groupMode={groupMode}
          hasFailures={hasFailures}
        />
      ))}
    </div>
  );
}

function Badge({ label, count, color }: { label: string; count: number; color: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-sm font-semibold" style={{ color }}>{count}</span>
      <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>{label}</span>
    </div>
  );
}
