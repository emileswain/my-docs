import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { prism, tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';
import yaml from 'js-yaml';
import { useAppStore } from '../../store/useAppStore';

interface YamlViewerProps {
  content: string;
}

export function YamlViewer({ content }: YamlViewerProps) {
  const darkMode = useAppStore((state) => state.darkMode);

  try {
    yaml.load(content);
    return (
      <SyntaxHighlighter
        language="yaml"
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
      <pre className="bg-gray-50 p-4 rounded overflow-x-auto">
        <code>{content}</code>
      </pre>
    );
  }
}
