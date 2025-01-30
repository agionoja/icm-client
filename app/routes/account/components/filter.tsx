// import { useCallback, useMemo } from "react";
// import { useSearchParams } from "react-router";
// import {
//   Select,
//   SelectTrigger,
//   SelectContent,
//   SelectItem,
// } from "~/components/ui/select";
// import type { FilterQuery } from "icm-shared";
//
// interface FilterProps<T> {
//   field: keyof T; // The field to filter on
//   label: string; // Label for the select
//   options: { value: string; label: string }[]; // Options for the select
//   filterType?: keyof FilterQuery<T[keyof T]>; // The type of filter (e.g., eq, ne, in, etc.)
// }
//
// export function Filter<T>({
//   field,
//   label,
//   options,
//   filterType = "eq",
// }: FilterProps<T>) {
//   const [searchParams, setSearchParams] = useSearchParams();
//
//   const currentFilter = useMemo(() => {
//     // Retrieve the current filter value for the field and type
//     const value = searchParams.get(`filter[${String(field)}][${filterType}]`);
//     return value || "";
//   }, [searchParams, field, filterType]);
//
//   const handleChange = useCallback(
//     (value: string) => {
//       const newParams = new URLSearchParams(searchParams);
//
//       if (value) {
//         // Set the new filter value
//         newParams.set(`filter[${String(field)}][${filterType}]`, value);
//       } else {
//         // Remove the filter if the value is empty
//         newParams.delete(`filter[${String(field)}][${filterType}]`);
//       }
//
//       setSearchParams(newParams);
//     },
//     [searchParams, field, filterType, setSearchParams],
//   );
//
//   return (
//     <div className="space-y-2">
//       <label className="text-sm font-medium">{label}</label>
//       <Select value={currentFilter} onValueChange={handleChange}>
//         <SelectTrigger className="w-full">
//           {currentFilter
//             ? options.find((option) => option.value === currentFilter)?.label
//             : "Select a filter..."}
//         </SelectTrigger>
//         <SelectContent>
//           {options.map((option) => (
//             <SelectItem key={option.value} value={option.value}>
//               {option.label}
//             </SelectItem>
//           ))}
//         </SelectContent>
//       </Select>
//     </div>
//   );
// }
