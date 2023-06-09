"use client";

import React, { ReactNode } from "react";
import { SessionProvider } from "next-auth/react";

interface Props {
  children: ReactNode;
}

export const Providers: React.FC<Props> = ({ children }) => {
  return <SessionProvider>{children}</SessionProvider>;
};
