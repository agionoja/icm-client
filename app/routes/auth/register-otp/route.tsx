import { Outlet } from "react-router";
import { AuthContainer } from "~/routes/auth/components/auth-container";
import React from "react";

export default function Route() {
  return (
    <>
      <AuthContainer previous={"/auth/register/password"}>
        <Outlet />
      </AuthContainer>
    </>
  );
}
