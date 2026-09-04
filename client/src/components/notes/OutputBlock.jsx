export default function OutputBlock({ content = '' }) {
  return (
    <div className="note-output-block">
      <div className="note-output-bar">Output</div>
      <pre className="note-output-body"><code>{content}</code></pre>
    </div>
  );
}
