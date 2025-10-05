import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { prism, tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useAppStore } from '../../store/useAppStore';

interface JsonViewerProps {
  content: string;
}

export function JsonViewer({ content }: JsonViewerProps) {
  const darkMode = useAppStore((state) => state.darkMode);

  try {
    // Validate JSON
    JSON.parse(content);

    return (
      <SyntaxHighlighter
        language="json"
        style={darkMode ? tomorrow : prism}
        customStyle={{
          fontSize: '14px',
          borderRadius: '6px',
          margin: 0,
        }}
        showLineNumbers={true}
      >
        {content}
      </SyntaxHighlighter>
    );
  } catch {
    return (
      <pre
        className="p-4 rounded overflow-x-auto"
        style={{ backgroundColor: 'var(--code-bg)' }}
      >
        <code style={{ color: 'var(--text-primary)' }}>{content}</code>
      </pre>
    );
  }
}
