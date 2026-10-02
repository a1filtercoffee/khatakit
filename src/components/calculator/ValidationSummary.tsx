import { Notice } from '../ui/Surface';

/** Lists validation messages in the results area, so no stale result is shown. */
export default function ValidationSummary({
  errors,
}: {
  errors: Partial<Record<string, string>>;
}) {
  const messages = Object.values(errors).filter((message): message is string => Boolean(message));
  if (messages.length === 0) return null;
  return (
    <div role="status" aria-live="polite"><Notice
      title={messages.length === 1 ? 'Check the highlighted field' : 'Check the highlighted fields'}
      tone="warning"
    >
      <ul className="validation-list">
        {messages.map((message) => (
          <li key={message}>{message}</li>
        ))}
      </ul>
    </Notice></div>
  );
}
