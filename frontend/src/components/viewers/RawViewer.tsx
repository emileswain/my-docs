interface RawViewerProps {
  content: string;
}

export function RawViewer({ content }: RawViewerProps) {
  return (
    <pre
      className="p-4 rounded overflow-x-auto max-w-full"
      style={{ backgroundColor: 'var(--code-bg)' }}
    >
      <code style={{ color: 'var(--text-primary)' }}>{content}</code>
    </pre>
  );
}
