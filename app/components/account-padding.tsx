import React from "react";

export function AccountPadding({ children }: { children: React.ReactNode }) {
  return <div className={"px-4 md:px-7 py-20"}>{children}</div>;
}
