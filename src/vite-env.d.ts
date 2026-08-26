/// <reference types="vite/client" />

interface ImportMetaEnv {
  /**
   * Endpoint the contact form posts to. Optional — without it the form falls
   * back to FormSubmit relaying to `contactEmail` (see ContactCard.tsx).
   */
  readonly VITE_CONTACT_ENDPOINT?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
