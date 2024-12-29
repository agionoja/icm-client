export function getCookieByName(
  cookieString: string | null,
  name: string,
  parseAsJson = false,
) {
  if (!cookieString) {
    console.warn("No cookie string provided");
    return null;
  }

  const cookies = cookieString.split("; ");
  for (const cookie of cookies) {
    const [cookieName, cookieValue] = cookie.split("=");
    if (cookieName === name) {
      try {
        return parseAsJson
          ? JSON.parse(decodeURIComponent(cookieValue))
          : decodeURIComponent(cookieValue);
      } catch (error) {
        console.error("Failed to parse cookie value as JSON:", error);
        return null;
      }
    }
  }

  console.warn(`Cookie with name "${name}" not found`);
  return null;
}
