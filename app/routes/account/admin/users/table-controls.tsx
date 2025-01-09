import { type ComponentProps, forwardRef, useEffect, useState } from "react";
import { Input } from "~/components/ui/input";
import { Form, useFetcher } from "react-router";

export const TableSearch = forwardRef<
  HTMLInputElement,
  ComponentProps<"input"> & { onSearch?: () => void; search?: string }
>(function TableSearch({ onSearch, search, ...props }, ref) {
  const [_setSearch, _setSaarch] = useState("");

  const fetcher = useFetcher();

  useEffect(() => {
    const timeout = setTimeout(() => {
      // fetcher
    }, 1000);

    return () => clearTimeout(timeout);
  }, []);

  return (
    <>
      {" "}
      <Form method={"GET"} className={""} role={"search"}>
        <Input
          ref={ref}
          name={"search"}
          type={"search"}
          {...props}
          defaultValue={search || _setSearch}
        />
        <button hidden>Search</button>
      </Form>
    </>
  );
});
