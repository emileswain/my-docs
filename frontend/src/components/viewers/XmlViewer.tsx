import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { prism, tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useAppStore } from '../../store/useAppStore';

interface XmlViewerProps {
  content: string;
}

export function XmlViewer({ content }: XmlViewerProps) {
  const darkMode = useAppStore((state) => state.darkMode);

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
      {content}
    </SyntaxHighlighter>
  );
}
