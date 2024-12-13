import { fetchClient } from "~/fetch/fetch-client"; // Assuming fetchClient is properly set up
import { getToken } from "~/sessions/auth-session"; // Assuming you have a way to retrieve tokens

export async function makeRepeatedRequests<T>(
  endpoint: `/${string}`,
  times: number,
  request: Request,
) {
  // Retrieve your authentication token
  const token = await getToken(request);

  try {
    // Create an array of `times` length with fetchClient calls
    const requests = Array.from({ length: times }, () =>
      fetchClient<T, string>(endpoint, {
        responseKey: "response", // Use a generic key since it's the same request
        token,
      }),
    );

    console.log(`Sending ${times} requests to ${endpoint}...`);

    // Execute all requests concurrently
    const responses = await Promise.allSettled(requests);

    // Handle the results
    responses.forEach((result, index) => {
      if (result.status === "fulfilled") {
        console.log(`Request ${index + 1}: Success`, result.value.data);
      } else {
        console.error(`Request ${index + 1}: Failed`, result.reason);
      }
    });

    return responses;
  } catch (err) {
    console.error("Unexpected error during repeated requests:", err);
    throw err; // Optionally rethrow if needed
  }
}
