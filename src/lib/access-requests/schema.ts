import { z } from 'zod';

const corporateEmailDomains = process.env.CORPORATE_EMAIL_DOMAINS?.split(',')
  .map((d) => d.trim().toLowerCase())
  .filter(Boolean);

export const accessRequestInputSchema = z.object({
  full_name: z
    .string()
    .trim()
    .min(2, 'Full name is required')
    .max(120, 'Full name is too long'),
  email: z
    .string()
    .trim()
    .email('Enter a valid corporate email address')
    .max(254)
    .transform((v) => v.toLowerCase())
    .refine(
      (email) => {
        if (!corporateEmailDomains?.length) return true;
        const domain = email.split('@')[1];
        return domain ? corporateEmailDomains.includes(domain) : false;
      },
      {
        message: corporateEmailDomains?.length
          ? `Use a corporate email (@${corporateEmailDomains.join(', @')})`
          : 'Invalid corporate email',
      }
    ),
  company: z.string().trim().min(1, 'Company is required').max(120),
  department: z.string().trim().min(1, 'Department is required').max(120),
  job_title: z.string().trim().min(1, 'Job title is required').max(120),
  reason: z
    .string()
    .trim()
    .min(20, 'Please provide a detailed reason (minimum 20 characters)')
    .max(2000, 'Reason is too long'),
});

export type AccessRequestInput = z.infer<typeof accessRequestInputSchema>;

export const accessRequestStatusQuerySchema = z.object({
  email: z.string().trim().email().transform((v) => v.toLowerCase()),
});

export const accessRequestReviewSchema = z.object({
  status: z.enum(['approved', 'rejected']),
  admin_notes: z.string().trim().max(2000).optional(),
  reviewer_notes: z.string().trim().max(2000).optional(),
  proposed_role: z.enum(['client', 'viewer', 'consultant', 'admin']).optional(),
  proposed_acc_role: z.string().nullable().optional(),
});
