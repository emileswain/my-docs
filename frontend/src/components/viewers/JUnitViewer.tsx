import { useState, useMemo } from 'react';
import type { JUnitData, JUnitTestCase } from '../../types';

type StatusFilter = 'all' | 'passed' | 'failed' | 'errored' | 'skipped';
type SortMode = 'default' | 'name' | 'duration' | 'status';

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

  return (
    <div
      style={{ borderBottom: '1px solid var(--border-primary)' }}
    >
      <div
        className="flex items-center gap-3 px-4 py-2.5"
        style={{
          cursor: hasDetails ? 'pointer' : 'default',
        }}
        onClick={() => hasDetails && setExpanded(!expanded)}
      >
        <StatusIcon status={tc.status} />
        <div className="flex-1 min-w-0">
          <span
            className="text-sm font-medium"
            style={{ color: 'var(--text-primary)' }}
          >
            {tc.name}
          </span>
          {tc.classname && (
            <span
              className="text-xs ml-2"
              style={{ color: 'var(--text-tertiary)' }}
            >
              {tc.classname}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {tc.time !== undefined && (
            <span
              className="text-xs"
              style={{ color: 'var(--text-tertiary)' }}
            >
              {formatDuration(tc.time)}
            </span>
          )}
          {hasDetails && (
            <i
              className={`fas fa-chevron-${expanded ? 'up' : 'down'} text-xs`}
              style={{ color: 'var(--text-tertiary)' }}
            />
          )}
        </div>
      </div>
      {expanded && hasDetails && (
        <div
          className="px-4 pb-3"
          style={{ paddingLeft: '2.75rem' }}
        >
          {tc.failure_message && (
            <p
              className="text-sm mb-2 font-medium"
              style={{ color: '#ef4444' }}
            >
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
        </div>
      )}
    </div>
  );
}

const FILTER_OPTIONS: { value: StatusFilter; label: string; icon: string; color: string }[] = [
  { value: 'all', label: 'All', icon: 'fa-list', color: 'var(--text-secondary)' },
  { value: 'failed', label: 'Failed', icon: 'fa-times-circle', color: '#ef4444' },
  { value: 'errored', label: 'Errors', icon: 'fa-exclamation-circle', color: '#ef4444' },
  { value: 'passed', label: 'Passed', icon: 'fa-check-circle', color: '#22c55e' },
  { value: 'skipped', label: 'Skipped', icon: 'fa-minus-circle', color: '#9ca3af' },
];

const SORT_OPTIONS: { value: SortMode; label: string; icon: string }[] = [
  { value: 'default', label: 'Default', icon: 'fa-sort' },
  { value: 'status', label: 'Status', icon: 'fa-flag' },
  { value: 'name', label: 'Name', icon: 'fa-font' },
  { value: 'duration', label: 'Duration', icon: 'fa-clock' },
];

function filterAndSort(testcases: JUnitTestCase[], filter: StatusFilter, sort: SortMode): JUnitTestCase[] {
  let filtered = filter === 'all'
    ? testcases
    : testcases.filter(tc => tc.status === filter);

  if (sort === 'default') return filtered;

  return [...filtered].sort((a, b) => {
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

export function JUnitViewer({ junit }: JUnitViewerProps) {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [sortMode, setSortMode] = useState<SortMode>('default');

  const { summary } = junit;
  const allPassed = summary.failures === 0 && summary.errors === 0;

  const passPercent = summary.tests > 0 ? (summary.passed / summary.tests) * 100 : 0;
  const failPercent = summary.tests > 0 ? (summary.failures / summary.tests) * 100 : 0;
  const errorPercent = summary.tests > 0 ? (summary.errors / summary.tests) * 100 : 0;
  const skipPercent = summary.tests > 0 ? (summary.skipped / summary.tests) * 100 : 0;

  // Count how many tests match each filter across all suites
  const filterCounts = useMemo(() => {
    const counts: Record<StatusFilter, number> = { all: 0, passed: 0, failed: 0, errored: 0, skipped: 0 };
    for (const suite of junit.testsuites) {
      for (const tc of suite.testcases) {
        counts.all++;
        counts[tc.status]++;
      }
    }
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
          <span
            className="text-sm"
            style={{ color: 'var(--text-tertiary)' }}
          >
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
        <div
          className="flex rounded-full overflow-hidden"
          style={{ height: '6px' }}
        >
          {passPercent > 0 && (
            <div style={{ width: `${passPercent}%`, backgroundColor: '#22c55e' }} />
          )}
          {failPercent > 0 && (
            <div style={{ width: `${failPercent}%`, backgroundColor: '#ef4444' }} />
          )}
          {errorPercent > 0 && (
            <div style={{ width: `${errorPercent}%`, backgroundColor: '#f97316' }} />
          )}
          {skipPercent > 0 && (
            <div style={{ width: `${skipPercent}%`, backgroundColor: '#9ca3af' }} />
          )}
        </div>
      </div>

      {/* Filter & Sort toolbar */}
      <div
        className="flex items-center justify-between mb-4 rounded-lg px-3 py-2"
        style={{
          backgroundColor: 'var(--bg-tertiary)',
          border: '1px solid var(--border-primary)',
        }}
      >
        {/* Status filter pills */}
        <div className="flex items-center gap-1">
          <span className="text-xs mr-1" style={{ color: 'var(--text-tertiary)' }}>Filter:</span>
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
                <span
                  className="font-semibold"
                  style={{ color: isActive ? opt.color : 'var(--text-tertiary)' }}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Sort selector */}
        <div className="flex items-center gap-1">
          <span className="text-xs mr-1" style={{ color: 'var(--text-tertiary)' }}>Sort:</span>
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
      {junit.testsuites.map((suite, si) => {
        const filteredTests = filterAndSort(suite.testcases, statusFilter, sortMode);
        if (filteredTests.length === 0 && statusFilter !== 'all') return null;

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
              <span
                className="text-sm font-semibold"
                style={{ color: 'var(--text-primary)' }}
              >
                {suite.name}
              </span>
              <span
                className="text-xs"
                style={{ color: 'var(--text-tertiary)' }}
              >
                {statusFilter !== 'all' ? `${filteredTests.length} shown · ` : ''}
                {suite.tests - suite.failures - suite.errors - suite.skipped}/{suite.tests} passed
                {' · '}
                {formatDuration(suite.time)}
              </span>
            </div>
            <div>
              {filteredTests.length === 0 ? (
                <p
                  className="text-sm italic px-4 py-4 text-center"
                  style={{ color: 'var(--text-tertiary)' }}
                >
                  No matching tests
                </p>
              ) : (
                filteredTests.map((tc, ti) => (
                  <TestCaseRow key={ti} tc={tc} />
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function Badge({ label, count, color }: { label: string; count: number; color: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span
        className="text-sm font-semibold"
        style={{ color }}
      >
        {count}
      </span>
      <span
        className="text-xs"
        style={{ color: 'var(--text-tertiary)' }}
      >
        {label}
      </span>
    </div>
  );
}
