import ReactJson from '@microlink/react-json-view';

interface JsonViewerProps {
  content: string;
}

export function JsonViewer({ content }: JsonViewerProps) {
  try {
    const jsonData = JSON.parse(content);
    return (
      <ReactJson
        src={jsonData}
        theme="rjv-default"
        collapsed={2}
        displayDataTypes={false}
        enableClipboard={true}
        style={{ fontSize: '14px' }}
      />
    );
  } catch {
    return (
      <pre className="bg-gray-50 p-4 rounded overflow-x-auto">
        <code>{content}</code>
      </pre>
    );
  }
}
