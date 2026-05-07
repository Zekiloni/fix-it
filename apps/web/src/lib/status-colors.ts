import { ProblemStatus } from '@fix-it/shared';

export interface StatusVisual {
  label: string;
  bg: string;
  fg: string;
}

export const statusVisuals: Record<ProblemStatus, StatusVisual> = {
  [ProblemStatus.Reported]: {
    label: 'Reported',
    bg: '#f59e0b',
    fg: '#ffffff',
  },
  [ProblemStatus.Acknowledged]: {
    label: 'Acknowledged',
    bg: '#3b82f6',
    fg: '#ffffff',
  },
  [ProblemStatus.InProgress]: {
    label: 'In progress',
    bg: '#8b5cf6',
    fg: '#ffffff',
  },
  [ProblemStatus.Resolved]: {
    label: 'Resolved',
    bg: '#10b981',
    fg: '#ffffff',
  },
  [ProblemStatus.Rejected]: {
    label: 'Rejected',
    bg: '#ef4444',
    fg: '#ffffff',
  },
};

export const allStatuses: ProblemStatus[] = [
  ProblemStatus.Reported,
  ProblemStatus.Acknowledged,
  ProblemStatus.InProgress,
  ProblemStatus.Resolved,
  ProblemStatus.Rejected,
];
