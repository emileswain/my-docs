import ReactJson from '@microlink/react-json-view';
import { useStore } from '../../store/useStore';

interface JsonViewerProps {
  content: string;
}

export function JsonViewer({ content }: JsonViewerProps) {
  const darkMode = useStore((state) => state.darkMode);

  try {
    const jsonData = JSON.parse(content);
    return (
      <ReactJson
        src={jsonData}
        theme={darkMode ? 'tomorrow' : 'rjv-default'}
        collapsed={2}
        displayDataTypes={false}
        enableClipboard={true}
        style={{
          fontSize: '14px',
          backgroundColor: darkMode ? 'var(--code-bg)' : 'transparent'
        }}
      />
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
