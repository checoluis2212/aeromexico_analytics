export const ACCESS_PORTAL_COPY = {
  title: 'Restricted Access',
  subtitle: 'Pre-Entry Access Portal',
  description:
    'This platform is private and available only to authorized users. To access the platform, submit an access request using your corporate email address. All requests are reviewed manually by an administrator.',
  formTitle: 'Request Platform Access',
  formSubtitle: 'Complete all fields. Incomplete submissions cannot be processed.',
  submitLabel: 'Submit Access Request',
  submittingLabel: 'Submitting request…',
  securityTitle: 'Important',
  securityBullets: [
    'Submission does not guarantee access.',
    'Access is granted only to approved users.',
    'Platform content is not available until approval.',
    'All requests are reviewed manually.',
  ],
  successTitle: 'Request Submitted',
  successBody: `Your access request has been submitted successfully.

Our team will review your request.
Access is granted only after administrator approval.

You will receive a notification once your request has been reviewed.`,
  pendingTitle: 'Pending Administrator Review',
  pendingBody:
    'Your request is on file and awaiting review. You cannot access platform content until an administrator approves your request.',
  duplicateError:
    'An access request for this email is already pending review. Please wait for administrator approval.',
  rejectedHint:
    'Your previous request was not approved. Contact your administrator or submit a new request with updated information.',
  loginCta: 'Already approved? Sign in',
  checkStatus: 'Check request status',
} as const;
