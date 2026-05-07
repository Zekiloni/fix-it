'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
import { Controller, useForm } from 'react-hook-form';
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
import { AddressSearchBar } from './address-search-bar';
import { PhotoLocationExtractor } from './photo-location-extractor';
import { TagInput } from './tag-input';
import { reverseGeocode, shortAddress } from '../lib/geocoding';

const DRAFT_KEY = 'cityfix:report-draft';

const categoryLabels: Record<ProblemCategory, string> = {
  [ProblemCategory.Road]: 'Road',
  [ProblemCategory.Lighting]: 'Street lighting',
  [ProblemCategory.Waste]: 'Waste / sanitation',
  [ProblemCategory.Water]: 'Water / drainage',
  [ProblemCategory.Vandalism]: 'Vandalism',
  [ProblemCategory.Greenery]: 'Greenery / parks',
  [ProblemCategory.Other]: 'Other',
};

export interface ReportFormValues {
  title: string;
  description: string;
  category: ProblemCategory;
  address?: string;
  contactPhone?: string;
  tags?: string[];
}

interface ReportDraft {
  values: Partial<ReportFormValues>;
  picked: PickedLocation | null;
}

const loadDraft = (): ReportDraft | null => {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as ReportDraft;
  } catch {
    return null;
  }
};

const clearDraft = () => {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(DRAFT_KEY);
};

export interface ReportProblemFormProps {
  initialValues?: Partial<ReportFormValues>;
  initialPicked?: PickedLocation | null;
  onSubmit: (
    dto: CreateProblemDto,
  ) => Promise<{ ok: boolean; error?: string }>;
  submitLabel?: string;
  pendingLabel?: string;
  autosave?: boolean;
}

export function ReportProblemForm({
  initialValues,
  initialPicked = null,
  onSubmit,
  submitLabel = 'Submit report',
  pendingLabel = 'Submitting…',
  autosave = true,
}: ReportProblemFormProps) {
  const [picked, setPicked] = useState<PickedLocation | null>(initialPicked);
  const [serverError, setServerError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const userEditedAddressRef = useRef(false);
  const draftLoadedRef = useRef(false);

  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    watch,
    reset,
    control,
    formState: { errors },
  } = useForm<ReportFormValues>({
    resolver: zodResolver(createProblemSchema.omit({ location: true })),
    defaultValues: {
      category: ProblemCategory.Road,
      ...(initialValues ?? {}),
    },
  });

  // Hydrate draft from localStorage AFTER mount to avoid SSR/CSR mismatch.
  useEffect(() => {
    if (!autosave) {
      draftLoadedRef.current = true;
      return;
    }
    const draft = loadDraft();
    if (!draft) {
      draftLoadedRef.current = true;
      return;
    }
    if (draft.values) {
      reset(
        { category: ProblemCategory.Road, ...draft.values },
        { keepDefaultValues: false },
      );
    }
    if (draft.picked) setPicked(draft.picked);
    draftLoadedRef.current = true;
  }, [reset, autosave]);

  const addressRegister = register('address', {
    onChange: () => {
      userEditedAddressRef.current = true;
    },
  });

  // Autosave draft to localStorage on any change (after the draft is hydrated).
  useEffect(() => {
    if (!autosave) return;
    const sub = watch((values) => {
      if (!draftLoadedRef.current) return;
      try {
        window.localStorage.setItem(
          DRAFT_KEY,
          JSON.stringify({ values, picked }),
        );
      } catch {
        // Quota or disabled — silently drop.
      }
    });
    return () => sub.unsubscribe();
  }, [watch, picked, autosave]);

  useEffect(() => {
    if (!autosave || !draftLoadedRef.current) return;
    try {
      window.localStorage.setItem(
        DRAFT_KEY,
        JSON.stringify({ values: getValues(), picked }),
      );
    } catch {
      // Ignore.
    }
  }, [picked, getValues, autosave]);

  // Reverse geocode when pin moves; fill address if user hasn't typed one.
  useEffect(() => {
    if (!picked) return;
    const ctrl = new AbortController();
    reverseGeocode(picked.lng, picked.lat, ctrl.signal)
      .then((res) => {
        if (!res) return;
        const current = getValues('address')?.trim();
        if (!current && !userEditedAddressRef.current) {
          setValue('address', shortAddress(res), { shouldDirty: false });
        }
      })
      .catch(() => undefined);
    return () => ctrl.abort();
  }, [picked, getValues, setValue]);

  const submit = handleSubmit((values) => {
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
    if (autosave) clearDraft();
    startTransition(async () => {
      const res = await onSubmit(dto);
      if (!res.ok) setServerError(res.error ?? 'Submission failed');
    });
  });

  const onAddressSearch = (loc: {
    lng: number;
    lat: number;
    displayName: string;
  }) => {
    setPicked({ lng: loc.lng, lat: loc.lat });
    if (!userEditedAddressRef.current) {
      setValue('address', loc.displayName, { shouldDirty: false });
    }
  };

  return (
    <form onSubmit={submit} className="space-y-6">
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
          <Label htmlFor="address">Address</Label>
          <Input
            id="address"
            placeholder="Auto-filled from the map pin"
            {...addressRegister}
          />
          {errors.address && (
            <p className="text-sm text-destructive">{errors.address.message}</p>
          )}
        </div>

        <div className="space-y-2 sm:col-span-2">
          <Label>Tags (optional)</Label>
          <Controller
            name="tags"
            control={control}
            render={({ field }) => (
              <TagInput
                value={field.value ?? []}
                onChange={(tags) => field.onChange(tags)}
              />
            )}
          />
          {errors.tags && (
            <p className="text-sm text-destructive">{errors.tags.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label>Location</Label>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="flex-1">
            <AddressSearchBar onPick={onAddressSearch} />
          </div>
          <PhotoLocationExtractor onExtract={(loc) => setPicked(loc)} />
        </div>
        <ProblemPickerMap value={picked} onChange={setPicked} />
      </div>

      {serverError && (
        <p className="text-sm text-destructive" role="alert">
          {serverError}
        </p>
      )}

      <Button type="submit" disabled={pending} size="lg">
        {pending ? pendingLabel : submitLabel}
      </Button>
    </form>
  );
}
