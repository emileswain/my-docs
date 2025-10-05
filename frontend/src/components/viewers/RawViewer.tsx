interface RawViewerProps {
  content: string;
}

export function RawViewer({ content }: RawViewerProps) {
  return (
    <pre className="bg-gray-50 p-4 rounded overflow-x-auto max-w-full">
      <code>{content}</code>
    </pre>
  );
}
