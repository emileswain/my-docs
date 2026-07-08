import { useMemo } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { prism, tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useAppStore } from '../../store/useAppStore';

interface XmlViewerProps {
  content: string;
}

function prettyPrintXml(xml: string): string {
  // If the XML already has meaningful indentation, return as-is
  const lines = xml.split('\n');
  if (lines.length > 3) return xml;

  // Simple XML pretty printer
  let formatted = '';
  let indent = 0;
  const tab = '  ';

  // Normalize: split on `><` boundaries
  const parts = xml
    .replace(/>\s*</g, '>\n<')
    .split('\n');

  for (const raw of parts) {
    const line = raw.trim();
    if (!line) continue;

    // Closing tag: decrease indent before printing
    if (line.startsWith('</')) {
      indent = Math.max(0, indent - 1);
    }

    formatted += tab.repeat(indent) + line + '\n';

    // Self-closing or closing tag: don't increase indent
    if (line.endsWith('/>') || line.startsWith('</') || line.startsWith('<?')) {
      // no indent change
    } else if (line.startsWith('<') && !line.startsWith('</')) {
      // Check if it's an opening tag with inline content and closing tag on same line
      // e.g., <name>value</name>
      const hasInlineClose = /<\/[^>]+>\s*$/.test(line);
      if (!hasInlineClose) {
        indent++;
      }
    }
  }

  return formatted.trimEnd();
}

export function XmlViewer({ content }: XmlViewerProps) {
  const darkMode = useAppStore((state) => state.darkMode);

  const formatted = useMemo(() => prettyPrintXml(content), [content]);

  return (
    <SyntaxHighlighter
      language="xml"
      style={darkMode ? tomorrow : prism}
      customStyle={{
        fontSize: '14px',
        borderRadius: '6px',
        margin: 0,
      }}
      showLineNumbers={true}
    >
      {formatted}
    </SyntaxHighlighter>
  );
}
