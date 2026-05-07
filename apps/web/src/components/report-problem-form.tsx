'use client';

import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Button,
  Input,
  Label,
  Select,
  Textarea,
} from '@fix-it/ui';
import {
  CreateProblemDto,
  ProblemCategory,
  createProblemSchema,
} from '@fix-it/shared';
import { ProblemPickerMap, type PickedLocation } from './problem-picker-map';
import { createProblemAction } from '../lib/actions/problems';

const categoryLabels: Record<ProblemCategory, string> = {
  [ProblemCategory.Road]: 'Road',
  [ProblemCategory.Lighting]: 'Street lighting',
  [ProblemCategory.Waste]: 'Waste / sanitation',
  [ProblemCategory.Water]: 'Water / drainage',
  [ProblemCategory.Vandalism]: 'Vandalism',
  [ProblemCategory.Greenery]: 'Greenery / parks',
  [ProblemCategory.Other]: 'Other',
};

interface ReportFormValues {
  title: string;
  description: string;
  category: ProblemCategory;
  address?: string;
  contactPhone?: string;
}

export function ReportProblemForm() {
  const [picked, setPicked] = useState<PickedLocation | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ReportFormValues>({
    resolver: zodResolver(
      createProblemSchema.omit({ location: true }),
    ),
    defaultValues: { category: ProblemCategory.Road },
  });

  const onSubmit = handleSubmit((values) => {
    if (!picked) {
      setServerError('Pick a location on the map first.');
      return;
    }
    setServerError(null);
    const dto: CreateProblemDto = {
      ...values,
      location: {
        type: 'Point',
        coordinates: [picked.lng, picked.lat],
      },
    };
    startTransition(async () => {
      const res = await createProblemAction(dto);
      if (!res.ok) setServerError(res.error ?? 'Submission failed');
    });
  });

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="title">Title</Label>
          <Input id="title" {...register('title')} />
          {errors.title && (
            <p className="text-sm text-destructive">{errors.title.message}</p>
          )}
        </div>

        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="description">Description</Label>
          <Textarea id="description" rows={4} {...register('description')} />
          {errors.description && (
            <p className="text-sm text-destructive">{errors.description.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Select id="category" {...register('category')}>
            {Object.values(ProblemCategory).map((c) => (
              <option key={c} value={c}>
                {categoryLabels[c]}
              </option>
            ))}
          </Select>
          {errors.category && (
            <p className="text-sm text-destructive">{errors.category.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="contactPhone">Contact phone (optional)</Label>
          <Input
            id="contactPhone"
            type="tel"
            placeholder="+381 60 123 4567"
            {...register('contactPhone')}
          />
          {errors.contactPhone && (
            <p className="text-sm text-destructive">{errors.contactPhone.message}</p>
          )}
        </div>

        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="address">Address (optional)</Label>
          <Input
            id="address"
            placeholder="Street, number, city"
            {...register('address')}
          />
          {errors.address && (
            <p className="text-sm text-destructive">{errors.address.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label>Location</Label>
        <ProblemPickerMap value={picked} onChange={setPicked} />
      </div>

      {serverError && (
        <p className="text-sm text-destructive" role="alert">
          {serverError}
        </p>
      )}

      <Button type="submit" disabled={pending} size="lg">
        {pending ? 'Submitting…' : 'Submit report'}
      </Button>
    </form>
  );
}
