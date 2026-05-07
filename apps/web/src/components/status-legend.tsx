import { allStatuses, statusVisuals } from '../lib/status-colors';

export function StatusLegend() {
  return (
    <ul className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
      {allStatuses.map((s) => {
        const v = statusVisuals[s];
        return (
          <li key={s} className="flex items-center gap-1.5">
            <span
              aria-hidden
              className="h-2.5 w-2.5 rounded-full border border-white shadow"
              style={{ backgroundColor: v.bg }}
            />
            {v.label}
          </li>
        );
      })}
    </ul>
  );
}
