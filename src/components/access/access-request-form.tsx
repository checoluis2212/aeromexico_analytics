'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Loader2, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ACCESS_PORTAL_COPY } from '@/lib/access-requests/constants';
import { accessRequestInputSchema, type AccessRequestInput } from '@/lib/access-requests/schema';

type Props = {
  onSuccess: (email: string) => void;
  initialEmail?: string;
};

const emptyForm: AccessRequestInput = {
  full_name: '',
  email: '',
  company: '',
  department: '',
  job_title: '',
  reason: '',
};

export function AccessRequestForm({ onSuccess, initialEmail = '' }: Props) {
  const [form, setForm] = useState<AccessRequestInput>({ ...emptyForm, email: initialEmail });
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof AccessRequestInput, string>>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function updateField<K extends keyof AccessRequestInput>(key: K, value: AccessRequestInput[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setFieldErrors((prev) => ({ ...prev, [key]: undefined }));
    setSubmitError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitError(null);

    const parsed = accessRequestInputSchema.safeParse(form);
    if (!parsed.success) {
      const errors: Partial<Record<keyof AccessRequestInput, string>> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as keyof AccessRequestInput;
        if (key && !errors[key]) errors[key] = issue.message;
      }
      setFieldErrors(errors);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/access-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsed.data),
      });
      const json = await res.json();

      if (!res.ok) {
        if (res.status === 409 && json.code === 'duplicate_pending') {
          onSuccess(parsed.data.email);
          return;
        }
        setSubmitError(json.error ?? 'Submission failed. Please try again.');
        return;
      }

      onSuccess(parsed.data.email);
    } catch {
      setSubmitError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  }

  const fields: { key: keyof AccessRequestInput; label: string; type?: string; multiline?: boolean }[] = [
    { key: 'full_name', label: 'Full Name' },
    { key: 'email', label: 'Corporate Email', type: 'email' },
    { key: 'company', label: 'Company' },
    { key: 'department', label: 'Department' },
    { key: 'job_title', label: 'Job Title' },
    { key: 'reason', label: 'Reason for Access', multiline: true },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <div className="flex items-center gap-2 text-xs text-muted-foreground border-b border-border/60 pb-3">
        <Shield className="h-3.5 w-3.5 text-primary shrink-0" aria-hidden />
        <span>{ACCESS_PORTAL_COPY.formSubtitle}</span>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {fields.map(({ key, label, type, multiline }) => (
          <div key={key} className={multiline ? 'sm:col-span-2' : undefined}>
            <Label htmlFor={key} className="text-xs font-medium">
              {label}
              <span className="text-destructive ml-0.5" aria-hidden>
                *
              </span>
            </Label>
            {multiline ? (
              <Textarea
                id={key}
                value={form[key]}
                onChange={(e) => updateField(key, e.target.value)}
                rows={4}
                className="mt-1.5 resize-y min-h-[100px]"
                disabled={loading}
                aria-invalid={!!fieldErrors[key]}
                aria-describedby={fieldErrors[key] ? `${key}-error` : undefined}
                placeholder="Describe your business need and intended use of the platform."
              />
            ) : (
              <Input
                id={key}
                type={type ?? 'text'}
                value={form[key]}
                onChange={(e) => updateField(key, e.target.value)}
                className="mt-1.5"
                disabled={loading}
                autoComplete={key === 'email' ? 'email' : key === 'full_name' ? 'name' : 'organization'}
                aria-invalid={!!fieldErrors[key]}
                aria-describedby={fieldErrors[key] ? `${key}-error` : undefined}
              />
            )}
            {fieldErrors[key] && (
              <p id={`${key}-error`} className="mt-1 text-xs text-destructive" role="alert">
                {fieldErrors[key]}
              </p>
            )}
          </div>
        ))}
      </div>

      {submitError && (
        <p className="text-sm text-destructive rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2" role="alert">
          {submitError}
        </p>
      )}

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            {ACCESS_PORTAL_COPY.submittingLabel}
          </>
        ) : (
          ACCESS_PORTAL_COPY.submitLabel
        )}
      </Button>

      <p className="text-center text-xs text-muted-foreground">
        <Link href="/login" className="text-primary hover:underline font-medium">
          {ACCESS_PORTAL_COPY.loginCta}
        </Link>
      </p>
    </form>
  );
}
