import React from "react";

type TableContext = {};
const TableContext = React.createContext<TableContext | null>(null);

export function useTable() {
  const context = React.useContext(TableContext);
  if (!context) {
    throw new Error("useTable must be used within the AppTableProvider");
  }
}
