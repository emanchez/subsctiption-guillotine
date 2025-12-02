import { prisma } from "@/lib/prisma";
import { HttpError, safeAsync } from "@/util/helpers";
import { User } from "@/types/user";
import { Subscription } from "@/types/subscription";

// get data from subscriptions database using userid from current session

export const GET = async (req: Request) => {
  const url = new URL(req.url);
  const userID =
    url.searchParams.get("userID") || req.headers.get("x-user-id") || null;

  const res = await safeAsync(async () => {
    // if userID param is empty
    if (!userID) throw new HttpError(400, "Missing userID");
    const user = await prisma.user.findUnique({ where: { id: userID } });
    if (!user) throw new HttpError(404, "User not found");

    // HANDLE SUBS DATA
    const userSubs = await prisma.subscription.findMany({
      where: { userId: userID },
      orderBy: { renewalDate: "asc" },
    });

    // Serialize dates to ISO strings for JSON transport
    const serialized = userSubs.map((s) => ({
      ...s,
      renewalDate: new Date(s.renewalDate).toISOString(),
      createdAt: new Date(s.createdAt).toISOString(),
      updatedAt: new Date(s.updatedAt).toISOString(),
    }));
    return { user, subscriptions: serialized };
  });
  return new Response(JSON.stringify(res), {
    status: res.status,
    headers: { "Content-Type": "application/json" },
  });
};
