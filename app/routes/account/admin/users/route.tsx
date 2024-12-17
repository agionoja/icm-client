import {
  checkForClass,
  type IGoogleUser,
  type IIcmUser,
  UserDiscriminator,
} from "icm-shared";
import { fetchClient } from "~/fetch/fetch-client";
import type { Route } from "./+types/route";
import { ProgressMonitor } from "~/fetch/progess";
import { getToken } from "~/session";

export async function loader({ request }: Route.LoaderArgs) {
  const token = await getToken(request);
  const [usersRes, userRes, profile] = await Promise.all([
    fetchClient<IGoogleUser | IIcmUser, "users", IGoogleUser|IIcmUser, true>("/users", {
      responseKey: "users",
      token: token,
      query: {
        paginate: { page: 1, limit: 2 },
        filter: {
          isVerified: true,
          // __t: UserDiscriminator.ICM,
        },
        sort: ["email", "-createdAt"],
        search: { lastname: "PAU", },
        select: ["id"],
      },
      progressArgs: {
        onProgress: (progress) => {
          console.log(`Status: ${progress.status}`);
          console.log(
            `Downloaded: ${ProgressMonitor.formatBytes(progress.loaded)} of ${ProgressMonitor.formatBytes(progress.total)} (${progress.percent.toFixed(1)}%)`,
          );
          if (progress.status === "active") {
            console.log(
              `Speed: ${ProgressMonitor.formatBytes(progress.transferSpeed)}/s`,
              `ETA: ${ProgressMonitor.formatTime(progress.timeRemaining)}`,
            );
          }
          if (progress.status === "completed") {
            console.log("Download completed!");
          }
        },
        // throttleSpeed: 1024 * 1024 * 2, // !MB/S,
        // updateInterval: 10,
        turnOff: true,
      },
    }),
    fetchClient<IGoogleUser | IIcmUser, "user">(
      "/users/674491c78674b85bb5947cc1",
      {
        responseKey: "user",
        token: token,
      },
    ),
    fetchClient<IGoogleUser | IIcmUser, "profile">("/auth/profile", {
      responseKey: "profile",
      token: token,
    }),
  ]);

  // console.dir({ userRes, profile, usersRes }, { depth: null });

  // await makeRepeatedRequests("/users", 200, request);
  if (userRes.exception || usersRes.exception || profile.exception) {
    return Response.json(usersRes.exception || userRes.exception, {
      status: usersRes.exception?.statusCode || userRes.exception?.statusCode,
    });
  }
  if (checkForClass<string, IGoogleUser>(userRes.data?.user, UserDiscriminator.GOOGLE)) {
    console.log(userRes.data.user.googleId);
  }

  return Response.json([
    usersRes.data,
    usersRes.metadata,
    userRes.data,
    profile.data,
  ]);
}
