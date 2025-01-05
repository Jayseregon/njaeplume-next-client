"use client";

import type { EnvSchemaType } from "@/lib/envSchema";

import React, { createContext, useContext } from "react";

type EnvContextType = {
  env: EnvSchemaType;
};

const EnvContext = createContext<EnvContextType | undefined>(undefined);

export default function EnvProvider({
  env,
  children,
}: {
  env: EnvSchemaType;
  children: React.ReactNode;
}) {
  return <EnvContext.Provider value={{ env }}>{children}</EnvContext.Provider>;
}

export function useEnv() {
  const context = useContext(EnvContext);

  if (context === undefined) {
    throw new Error("useEnv must be used within an EnvProvider");
  }

  return context.env;
}
