/** Copy del flujo de acceso — enfoque producto (español) */
export const LOGIN_PAGE_COPY = {
  gateTitle: 'Acceso a la plataforma',
  gateLead:
    'Por seguridad, nadie entra al portal sin pasar por el proceso de autorización. Primero solicita acceso; después, cuando estés dado de alta, podrás iniciar sesión.',
  steps: [
    { n: 1, title: 'Solicita acceso', detail: 'Formulario con tu correo @aeromexico.com' },
    { n: 2, title: 'Revisión manual', detail: 'Un administrador aprueba o rechaza' },
    { n: 3, title: 'Alta de usuario', detail: 'Te crean cuenta y contraseña en el sistema' },
    { n: 4, title: 'Inicia sesión', detail: 'Solo con credenciales ya activas' },
  ],
  noAccessTitle: '¿Aún no tienes acceso?',
  noAccessBody:
    'Si es tu primera vez o tu solicitud sigue en revisión, empieza aquí. No podrás entrar a pedidos, AI Agent ni ninguna sección hasta completar el proceso.',
  requestAccessCta: 'Solicitar acceso',
  hasAccountTitle: 'Ya tienes cuenta dada de alta',
  hasAccountBody:
    'Inicia sesión únicamente si el administrador ya activó tu usuario. El correo y la contraseña los recibes después del alta.',
  loginTitle: 'Iniciar sesión',
  loginSubtitle: `${'Aeroméxico'} · Portal de analytics`,
  forgotPassword: '¿Olvidaste tu contraseña?',
  backHome: 'Volver al portal de acceso',
  errors: {
    invalidCredentials: 'Correo o contraseña incorrectos.',
    notProvisioned:
      'No tienes cuenta activa en el sistema. Si tu solicitud ya fue aprobada, espera a que el administrador te dé de alta.',
    notApproved:
      'Tu acceso aún no está aprobado. Revisa el estado de tu solicitud en el portal de acceso.',
    rejected: 'Tu solicitud de acceso no fue aprobada. Contacta al administrador.',
    generic: 'No pudimos validar tu acceso. Inténtalo de nuevo.',
  },
  unauthorizedSection:
    'No tienes permiso para esa sección. Si crees que es un error, contacta al administrador.',
} as const;

export const GUEST_ENTRY_PATH = '/access';
