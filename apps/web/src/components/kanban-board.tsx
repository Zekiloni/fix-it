'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { type IProblem, ProblemStatus } from '@fix-it/shared';
import { allStatuses, statusVisuals } from '../lib/status-colors';
import { updateProblemStatusAction } from '../lib/actions/problems';

interface KanbanCardProps {
  problem: IProblem;
  isOverlay?: boolean;
}

function KanbanCard({ problem, isOverlay }: KanbanCardProps) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: problem.id,
    data: { problem },
  });

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      className={`select-none rounded-md border bg-card p-3 shadow-sm transition-all ${
        isDragging ? 'opacity-30' : ''
      } ${isOverlay ? 'rotate-2 cursor-grabbing shadow-lg' : 'cursor-grab'}`}
    >
      <Link
        href={`/problems/${problem.id}`}
        onClick={(e) => e.stopPropagation()}
        className="block text-sm font-medium leading-tight underline-offset-4 hover:underline"
      >
        {problem.title}
      </Link>
      <p className="mt-1 text-xs text-muted-foreground capitalize">
        {problem.category}
        {problem.address ? ` · ${problem.address}` : ''}
      </p>
    </div>
  );
}

interface KanbanColumnProps {
  status: ProblemStatus;
  problems: IProblem[];
}

function KanbanColumn({ status, problems }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: status });
  const v = statusVisuals[status];

  return (
    <div className="flex w-72 shrink-0 flex-col gap-2">
      <div
        className="flex items-center justify-between rounded-md px-3 py-2 text-sm font-medium"
        style={{ backgroundColor: v.bg, color: v.fg }}
      >
        <span>{v.label}</span>
        <span className="rounded-full bg-white/25 px-2 text-xs">
          {problems.length}
        </span>
      </div>
      <div
        ref={setNodeRef}
        className={`min-h-[120px] flex-1 space-y-2 rounded-md border-2 border-dashed p-2 transition-colors ${
          isOver ? 'border-foreground/30 bg-muted' : 'border-transparent'
        }`}
      >
        {problems.map((p) => (
          <KanbanCard key={p.id} problem={p} />
        ))}
        {problems.length === 0 && (
          <p className="px-2 py-4 text-center text-xs text-muted-foreground">
            Empty
          </p>
        )}
      </div>
    </div>
  );
}

interface KanbanBoardProps {
  initialProblems: IProblem[];
}

export function KanbanBoard({ initialProblems }: KanbanBoardProps) {
  const [problems, setProblems] = useState<IProblem[]>(initialProblems);
  const [activeProblem, setActiveProblem] = useState<IProblem | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
  );

  const onDragStart = (e: DragStartEvent) => {
    const data = e.active.data.current as { problem?: IProblem } | undefined;
    setActiveProblem(data?.problem ?? null);
  };

  const onDragEnd = (e: DragEndEvent) => {
    setActiveProblem(null);
    if (!e.over) return;

    const problemId = String(e.active.id);
    const targetStatus = e.over.id as ProblemStatus;
    const current = problems.find((p) => p.id === problemId);
    if (!current || current.status === targetStatus) return;

    const previous = current.status;
    setProblems((prev) =>
      prev.map((p) =>
        p.id === problemId ? { ...p, status: targetStatus } : p,
      ),
    );
    setError(null);

    startTransition(async () => {
      const res = await updateProblemStatusAction(problemId, targetStatus);
      if (!res.ok) {
        setProblems((prev) =>
          prev.map((p) =>
            p.id === problemId ? { ...p, status: previous } : p,
          ),
        );
        setError(res.error ?? 'Failed to update status');
      }
    });
  };

  return (
    <div className="space-y-3">
      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
      <DndContext
        sensors={sensors}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
      >
        <div className="flex gap-4 overflow-x-auto pb-4">
          {allStatuses.map((s) => (
            <KanbanColumn
              key={s}
              status={s}
              problems={problems.filter((p) => p.status === s)}
            />
          ))}
        </div>
        <DragOverlay>
          {activeProblem ? (
            <KanbanCard problem={activeProblem} isOverlay />
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
