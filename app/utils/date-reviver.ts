export function dateReviver(_key: string, value: any): any {
  if (typeof value !== "string") {
    return value;
  }

  const msDatePattern = /^\/Date\((\d+)\)\/$/;
  const msMatch = msDatePattern.exec(value);
  if (msMatch) {
    return new Date(+msMatch[1]);
  }

  const isoPattern =
    /^(\d{4}-\d{2}-\d{2})(T(\d{2}:?\d{2}:?\d{2})(.\d{1,3})?Z?)?$/;
  const isoMatch = isoPattern.exec(value);
  if (isoMatch) {
    const parsedDate = new Date(value);
    return isNaN(parsedDate.getTime()) ? value : parsedDate;
  }

  return value;
}
