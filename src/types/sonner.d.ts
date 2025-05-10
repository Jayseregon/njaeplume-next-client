// This file augments the type definitions for the 'sonner' library.
// It ensures TypeScript recognizes the 'nonce' prop on the ToasterProps interface.

import "sonner"; // Important: import 'sonner' to tell TypeScript this is an augmentation

declare module "sonner" {
  // Extend the existing ToasterProps interface from the 'sonner' module
  interface ToasterProps {
    nonce?: string;
  }
}
