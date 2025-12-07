import { prisma } from "@/lib/prisma";
import { HttpError, safeAsync } from "@/lib/util/helpers";
import apiSubToDomSub from "@/lib/mappers/subscription";
import domainSubToApi from "@/lib/serializers/subscription";

// get data from subscriptions database using userid from current session

export const GET = async (req: Request) => {
  const url = new URL(req.url);
  const userID =
    url.searchParams.get("userID") || req.headers.get("x-user-id") || null;

  const res = await safeAsync(async () => {
    // HANDLE USER DATA
    // if userID param is empty
    if (!userID) throw new HttpError(400, "Missing userID");
    // get user data
    const user = await prisma.user.findUnique({
      where: { id: userID },
    });
    if (!user) throw new HttpError(404, "User not found");

    // HANDLE SUBS DATA
    const userSubs = await prisma.subscription.findMany({
      where: { userId: userID },
      orderBy: { renewalDate: "asc" },
    });

    // Map DB rows to domain objects and serialize to API shape via serializer
    //TODO: remove mapper logic, change to validation logic
    //TODO: have client side use mapper instead
    const mapped = userSubs.map((s: any) => apiSubToDomSub(s as any));
    const serialized = mapped.map(domainSubToApi);
    return { user, subscriptions: serialized };
  });
  return new Response(JSON.stringify(res), {
    status: res.status,
    headers: { "Content-Type": "application/json" },
  });
};

//TODO: POST

//TODO: UPDATE

//TODO: DELETE
