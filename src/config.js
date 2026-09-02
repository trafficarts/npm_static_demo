export const CONFIG = Object.freeze({
  googleFormUrl: import.meta.env.VITE_GOOGLE_FORM_URL || 'REPLACE_WITH_GOOGLE_FORM_URL',
  fieldIp: import.meta.env.VITE_GOOGLE_FORM_FIELD_IP || 'REPLACE_WITH_FIELD_IP',
  fieldUserAgent:
    import.meta.env.VITE_GOOGLE_FORM_FIELD_USER_AGENT || 'REPLACE_WITH_FIELD_USER_AGENT',
  ipApi: import.meta.env.VITE_IP_API || 'REPLACE_WITH_IP_API',
  submissionTimeoutMs: Number(import.meta.env.VITE_SUBMISSION_TIMEOUT_MS) || 5000
});
