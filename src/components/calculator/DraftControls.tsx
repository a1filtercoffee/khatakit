import { useRef, useState } from 'react';
export default function DraftControls({ tool }: { tool: string }) {
  const saved = useRef<Record<string, string>>({});
  const [cleared, setCleared] = useState(false);
  function control(action: 'clear' | 'undo') {
    try {
      const prefix = `khatakit:draft:v1:${tool}`;
      if (action === 'clear') {
        saved.current = {};
        for (let i = 0; i < sessionStorage.length; i++) {
          const key = sessionStorage.key(i);
          if (key && (key === prefix || key.startsWith(prefix + ':'))) saved.current[key] = sessionStorage.getItem(key)!;
        }
      } else for (const [key, value] of Object.entries(saved.current)) sessionStorage.setItem(key, value);
    } catch { /* In-memory undo remains available when storage is blocked. */ }
    window.dispatchEvent(new CustomEvent('khatakit-draft-control', { detail: { tool, action } }));
    setCleared(action === 'clear');
  }
  return <div className="draft-controls">
    <p>Inputs are kept in this browser tab. Close it to discard them.</p>
    <button type="button" onClick={() => control(cleared ? 'undo' : 'clear')}>
      {cleared ? 'Undo clear' : 'Clear inputs'}
    </button>
    <span className="sr-only" role="status">{cleared ? 'Inputs cleared. You can undo this.' : ''}</span>
  </div>;
}
