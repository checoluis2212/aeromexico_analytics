/** Branding y textos del portal de acceso previo (español) */
export const AEROMEXICO_LOGO_SRC = '/images/aeromexico-logo-2024.png';

export const ACCESS_PORTAL_COPY = {
  brandName: 'Aeroméxico',
  brandTagline: 'Portal de acceso · Analytics',
  portalBadge: 'Uso interno autorizado',
  title: 'Acceso restringido',
  subtitle: 'Portal de acceso previo',
  description:
    'Esta plataforma es privada y está disponible solo para usuarios autorizados. Para ingresar, envía una solicitud de acceso con tu correo corporativo @aeromexico.com. Todas las solicitudes son revisadas manualmente por un administrador.',
  formTitle: 'Solicitar acceso a la plataforma',
  formSubtitle: 'Completa todos los campos. Las solicitudes incompletas no se procesan.',
  submitLabel: 'Enviar solicitud de acceso',
  submittingLabel: 'Enviando solicitud…',
  securityTitle: 'Importante',
  securityBullets: [
    'Enviar la solicitud no garantiza el acceso.',
    'El acceso se otorga únicamente a usuarios aprobados.',
    'El contenido de la plataforma no está disponible hasta la aprobación.',
    'Todas las solicitudes se revisan manualmente.',
  ],
  successTitle: 'Solicitud enviada',
  successBody: `Tu solicitud de acceso se envió correctamente.

Nuestro equipo la revisará en breve.
El acceso se otorga solo después de la aprobación del administrador.

Recibirás una notificación cuando tu solicitud haya sido revisada.`,
  pendingTitle: 'Pendiente de revisión del administrador',
  pendingBody:
    'Tu solicitud ya está registrada y en espera de revisión. No podrás ver el contenido de la plataforma hasta que un administrador la apruebe.',
  duplicateError:
    'Ya existe una solicitud pendiente con este correo. Espera la respuesta del administrador.',
  rejectedHint:
    'Tu solicitud anterior no fue aprobada. Contacta al administrador o envía una nueva solicitud con información actualizada.',
  loginCta: '¿Ya tienes acceso? Iniciar sesión',
  checkStatus: 'Consultar estado de la solicitud',
  footer: 'Confidencial · Uso exclusivo Aeroméxico',
  fields: {
    full_name: 'Nombre completo',
    email: 'Correo corporativo',
    company: 'Empresa',
    department: 'Departamento',
    job_title: 'Puesto',
    reason: 'Motivo del acceso',
  },
  placeholders: {
    email: 'nombre.apellido@aeromexico.com',
    company: 'Aeroméxico',
    reason:
      'Describe tu necesidad de negocio y cómo usarás la plataforma (dashboards, eventos, pedidos de analytics, etc.).',
  },
  formCardHint: 'Todos los campos son obligatorios. Usa tu correo corporativo.',
  themeDark: 'Oscuro',
  themeLight: 'Claro',
  networkError: 'Error de conexión. Revisa tu red e inténtalo de nuevo.',
  submitFailed: 'No se pudo enviar la solicitud. Inténtalo de nuevo.',
} as const;
