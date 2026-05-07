'use client';

import { useState, useTransition } from 'react';
import { Select } from '@fix-it/ui';
import { ProblemStatus } from '@fix-it/shared';
import { updateProblemStatusAction } from '../lib/actions/problems';
import { allStatuses, statusVisuals } from '../lib/status-colors';

interface OperatorStatusSelectProps {
  problemId: string;
  status: ProblemStatus;
}

export function OperatorStatusSelect({
  problemId,
  status,
}: OperatorStatusSelectProps) {
  const [current, setCurrent] = useState(status);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const onChange = (next: ProblemStatus) => {
    const prev = current;
    setCurrent(next);
    setError(null);
    startTransition(async () => {
      const res = await updateProblemStatusAction(problemId, next);
      if (!res.ok) {
        setCurrent(prev);
        setError(res.error ?? 'Update failed');
      }
    });
  };

  return (
    <div className="flex flex-col items-end gap-1">
      <Select
        value={current}
        onChange={(e) => onChange(e.target.value as ProblemStatus)}
        disabled={pending}
        className="h-9 w-44"
        style={{
          backgroundColor: statusVisuals[current].bg,
          color: statusVisuals[current].fg,
          borderColor: statusVisuals[current].bg,
        }}
      >
        {allStatuses.map((s) => (
          <option
            key={s}
            value={s}
            style={{ backgroundColor: '#fff', color: '#000' }}
          >
            {statusVisuals[s].label}
          </option>
        ))}
      </Select>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
