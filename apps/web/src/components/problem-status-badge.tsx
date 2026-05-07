import { ProblemStatus } from '@fix-it/shared';
import { statusVisuals } from '../lib/status-colors';

export function ProblemStatusBadge({ status }: { status: ProblemStatus }) {
  const v = statusVisuals[status];
  return (
    <span
      className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
      style={{ backgroundColor: v.bg, color: v.fg }}
    >
      {v.label}
    </span>
  );
}
