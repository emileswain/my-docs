import { useRef, useEffect } from 'react';
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

  return (
    <div className="mb-1">
      <div
        className={`structure-tree-item py-1 px-2 rounded flex items-center cursor-pointer hover:bg-gray-100 ${
          isActive ? 'bg-blue-100 font-semibold' : ''
        }`}
        style={{ paddingLeft: `${indent}px` }}
        onClick={() => onSectionClick(node.label)}
      >
        {hasChildren ? (
          <i className="fas fa-angle-right text-xs mr-2 text-gray-400"></i>
        ) : (
          <span className="w-4 inline-block"></span>
        )}
        <span className="text-sm">{node.label}</span>
        {node.type && <span className="ml-2 text-xs text-gray-400">{node.type}</span>}
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

export function StructureTree() {
  const currentFileContent = useStore((state) => state.currentFileContent);
  const currentHeading = useStore((state) => state.currentHeading);
  const rightPanelVisible = useStore((state) => state.rightPanelVisible);
  const setRightPanelVisible = useStore((state) => state.setRightPanelVisible);
  const contentAreaRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // Get reference to content area
    contentAreaRef.current = document.querySelector('#contentArea') as HTMLDivElement;
  }, []);

  const scrollToSection = (label: string) => {
    const contentArea = contentAreaRef.current;
    const markdownContent = document.querySelector('#markdownContent');

    if (!contentArea || !markdownContent) return;

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
      <div className="bg-white border-l border-gray-200 flex items-start p-2">
        <button
          onClick={() => setRightPanelVisible(true)}
          className="p-1 text-gray-600 hover:text-gray-800"
          title="Show Structure"
        >
          <i className="fas fa-chevron-left"></i>
        </button>
      </div>
    );
  }

  const tree = currentFileContent?.tree;

  return (
    <div className="bg-white border-l border-gray-200 panel flex flex-col" style={{ minWidth: '200px', width: '300px' }}>
      <div className="flex items-center justify-between px-6 border-b border-gray-200 bg-gray-50 flex-shrink-0" style={{ height: '60px' }}>
        <h2 className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
          Structure
        </h2>
        <button
          onClick={() => setRightPanelVisible(false)}
          className="p-1 text-gray-500 hover:text-gray-700"
          title="Hide Panel"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
      <div className="text-sm p-4 flex-1 overflow-y-auto">
        {!tree || tree.length === 0 ? (
          <p className="text-gray-400 italic text-sm">No structure found</p>
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
