export {};

// Create a type for the roles
export type Roles = "castleAdmin" | "customer";

declare global {
  interface CustomJwtSessionClaims {
    metadata: {
      role?: Roles;
    };
  }
}
