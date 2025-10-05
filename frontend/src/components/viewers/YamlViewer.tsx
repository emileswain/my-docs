import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';
import yaml from 'js-yaml';

interface YamlViewerProps {
  content: string;
}

export function YamlViewer({ content }: YamlViewerProps) {
  try {
    yaml.load(content);
    return (
      <SyntaxHighlighter
        language="yaml"
        style={tomorrow}
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
