import { z } from 'zod';

const corporateEmailDomains = process.env.CORPORATE_EMAIL_DOMAINS?.split(',')
  .map((d) => d.trim().toLowerCase())
  .filter(Boolean) ?? ['aeromexico.com'];

export const accessRequestInputSchema = z.object({
  full_name: z
    .string()
    .trim()
    .min(2, 'El nombre completo es obligatorio')
    .max(120, 'El nombre es demasiado largo'),
  email: z
    .string()
    .trim()
    .email('Ingresa un correo corporativo válido')
    .max(254)
    .transform((v) => v.toLowerCase())
    .refine(
      (email) => {
        const domain = email.split('@')[1];
        return domain ? corporateEmailDomains.includes(domain) : false;
      },
      {
        message: `Usa un correo corporativo (@${corporateEmailDomains.join(', @')})`,
      }
    ),
  company: z.string().trim().min(1, 'La empresa es obligatoria').max(120),
  department: z.string().trim().min(1, 'El departamento es obligatorio').max(120),
  job_title: z.string().trim().min(1, 'El puesto es obligatorio').max(120),
  reason: z
    .string()
    .trim()
    .min(20, 'Describe el motivo con al menos 20 caracteres')
    .max(2000, 'El motivo es demasiado largo'),
});

export type AccessRequestInput = z.infer<typeof accessRequestInputSchema>;

export const accessRequestStatusQuerySchema = z.object({
  email: z
    .string()
    .trim()
    .email('Correo inválido')
    .transform((v) => v.toLowerCase()),
});

export const accessRequestReviewSchema = z.object({
  status: z.enum(['approved', 'rejected']),
  admin_notes: z.string().trim().max(2000).optional(),
  reviewer_notes: z.string().trim().max(2000).optional(),
  proposed_role: z.enum(['client', 'viewer', 'consultant', 'admin']).optional(),
  proposed_acc_role: z.string().nullable().optional(),
});
