'use client';

import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Input, Label, Textarea } from '@fix-it/ui';
import {
  CreateOrganizationDto,
  ProblemCategory,
  createOrganizationSchema,
} from '@fix-it/shared';
import { createOrganizationAction } from '../lib/actions/organizations';

const allCategories: ProblemCategory[] = Object.values(ProblemCategory);

export function CreateOrganizationForm() {
  const [serverError, setServerError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateOrganizationDto>({
    resolver: zodResolver(createOrganizationSchema),
    defaultValues: { categories: [ProblemCategory.Other] },
  });

  const onSubmit = handleSubmit((values) => {
    setServerError(null);
    startTransition(async () => {
      const res = await createOrganizationAction(values);
      if (!res.ok) setServerError(res.error ?? 'Failed to create organization');
      else reset({ categories: [ProblemCategory.Other] });
    });
  });

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1">
          <Label htmlFor="org-name">Name</Label>
          <Input id="org-name" {...register('name')} />
          {errors.name && (
            <p className="text-xs text-destructive">{errors.name.message}</p>
          )}
        </div>
        <div className="space-y-1">
          <Label htmlFor="org-slug">Slug</Label>
          <Input id="org-slug" placeholder="bg-roads" {...register('slug')} />
          {errors.slug && (
            <p className="text-xs text-destructive">{errors.slug.message}</p>
          )}
        </div>
        <div className="space-y-1 sm:col-span-2">
          <Label htmlFor="org-email">Contact email</Label>
          <Input
            id="org-email"
            type="email"
            {...register('contactEmail')}
          />
          {errors.contactEmail && (
            <p className="text-xs text-destructive">
              {errors.contactEmail.message}
            </p>
          )}
        </div>
        <div className="space-y-1 sm:col-span-2">
          <Label htmlFor="org-desc">Description</Label>
          <Textarea id="org-desc" rows={2} {...register('description')} />
        </div>
        <div className="space-y-1 sm:col-span-2">
          <Label>Categories</Label>
          <div className="flex flex-wrap gap-2 text-sm">
            {allCategories.map((c) => (
              <label
                key={c}
                className="inline-flex items-center gap-1.5 capitalize"
              >
                <input
                  type="checkbox"
                  value={c}
                  {...register('categories')}
                />
                {c}
              </label>
            ))}
          </div>
          {errors.categories && (
            <p className="text-xs text-destructive">
              {errors.categories.message}
            </p>
          )}
        </div>
      </div>
      {serverError && (
        <p className="text-sm text-destructive">{serverError}</p>
      )}
      <Button type="submit" size="sm" disabled={pending}>
        {pending ? 'Creating…' : 'Create organization'}
      </Button>
    </form>
  );
}
