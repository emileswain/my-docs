import { useEffect, useRef } from 'react';
import type { TreeNode } from '../types';
import { useStore } from '../store/useStore';

interface StructureTreeNodeProps {
  node: TreeNode;
  depth: number;
  onSectionClick: (label: string) => void;
  currentHeading: string;
}

function StructureTreeNode({ node, depth, onSectionClick, currentHeading }: StructureTreeNodeProps) {
  const hasChildren = node.children && node.children.length > 0;
  const indent = depth * 12;
  const isActive = currentHeading === node.label;
  const nodeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isActive && nodeRef.current) {
      nodeRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [isActive]);

  return (
    <div className="mb-1">
      <div
        ref={nodeRef}
        className="structure-tree-item py-1 px-2 rounded flex items-center cursor-pointer"
        style={{
          paddingLeft: `${indent}px`,
          backgroundColor: isActive ? 'var(--accent-secondary)' : 'transparent',
          fontWeight: isActive ? 600 : 400
        }}
        onClick={() => onSectionClick(node.label)}
      >
        {hasChildren ? (
          <i className="fas fa-angle-right text-xs mr-2" style={{ color: 'var(--text-tertiary)' }}></i>
        ) : (
          <span className="w-4 inline-block"></span>
        )}
        <span className="text-sm" style={{ color: 'var(--text-primary)' }}>{node.label}</span>
        {node.type && <span className="ml-2 text-xs" style={{ color: 'var(--text-tertiary)' }}>{node.type}</span>}
      </div>
      {hasChildren &&
        node.children!.map((child, index) => (
          <StructureTreeNode
            key={index}
            node={child}
            depth={depth + 1}
            onSectionClick={onSectionClick}
            currentHeading={currentHeading}
          />
        ))}
    </div>
  );
}

interface StructureTreeProps {
  contentAreaRef: React.RefObject<HTMLDivElement | null>;
}

export function StructureTree({ contentAreaRef }: StructureTreeProps) {
  const currentFileContent = useStore((state) => state.currentFileContent);
  const currentHeading = useStore((state) => state.currentHeading);
  const rightPanelVisible = useStore((state) => state.rightPanelVisible);
  const setRightPanelVisible = useStore((state) => state.setRightPanelVisible);

  const scrollToSection = (label: string) => {
    const contentArea = contentAreaRef.current;
    if (!contentArea) return;

    const markdownContent = contentArea.querySelector('#markdownContent');
    if (!markdownContent) return;

    const headings = markdownContent.querySelectorAll('h1, h2, h3, h4, h5, h6');

    for (const heading of Array.from(headings)) {
      if (heading.textContent?.trim() === label) {
        const contentAreaRect = contentArea.getBoundingClientRect();
        const headingRect = heading.getBoundingClientRect();
        const scrollOffset = contentArea.scrollTop + (headingRect.top - contentAreaRect.top) - 20;

        contentArea.scrollTo({
          top: scrollOffset,
          behavior: 'smooth',
        });
        break;
      }
    }
  };

  if (!rightPanelVisible) {
    return (
      <div
        className="flex items-start p-2"
        style={{
          backgroundColor: 'var(--surface-panel)',
          borderLeft: '1px solid var(--border-primary)'
        }}
      >
        <button
          onClick={() => setRightPanelVisible(true)}
          className="p-1"
          style={{ color: 'var(--text-secondary)' }}
          title="Show Structure"
        >
          <i className="fas fa-chevron-left"></i>
        </button>
      </div>
    );
  }

  const tree = currentFileContent?.tree;

  return (
    <div
      className="panel flex flex-col"
      style={{
        minWidth: '200px',
        width: '300px',
        backgroundColor: 'var(--surface-panel)',
        borderLeft: '1px solid var(--border-primary)'
      }}
    >
      <div
        className="flex items-center justify-between px-6 flex-shrink-0"
        style={{
          height: '60px',
          borderBottom: '1px solid var(--border-primary)',
          backgroundColor: 'var(--bg-tertiary)'
        }}
      >
        <h2
          className="text-xs font-semibold uppercase tracking-wide"
          style={{ color: 'var(--text-secondary)' }}
        >
          Structure
        </h2>
        <button
          onClick={() => setRightPanelVisible(false)}
          className="p-1"
          style={{ color: 'var(--text-secondary)' }}
          title="Hide Panel"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
      <div className="text-sm p-4 flex-1 overflow-y-auto">
        {!tree || tree.length === 0 ? (
          <p className="italic text-sm" style={{ color: 'var(--text-tertiary)' }}>No structure found</p>
        ) : (
          tree.map((node, index) => (
            <StructureTreeNode
              key={index}
              node={node}
              depth={1}
              onSectionClick={scrollToSection}
              currentHeading={currentHeading}
            />
          ))
        )}
      </div>
    </div>
  );
}
