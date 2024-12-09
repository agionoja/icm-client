/**
 * A function to delay network requests. Should be used only in dev mode
 *
 * @param delay
 * This is the delay in seconds
 */
export function throttleNetwork(delay = 1) {
  return new Promise((resolve) => setTimeout(resolve, delay * 1000));
}
