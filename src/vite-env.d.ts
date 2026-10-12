/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Clerk publishable key; picked up by ClerkProvider automatically. */
  readonly VITE_CLERK_PUBLISHABLE_KEY?: string;
}
