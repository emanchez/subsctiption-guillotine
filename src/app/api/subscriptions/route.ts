import fs from "fs/promises";
import path from "path";
import { safeAsync } from "@/util/helpers";
import { User } from "@/types/user";
import { Subscription } from "@/types/subscription";

// get data from subscriptions database using userid from current session

export const GET = async (req: Request) => {
  const url = new URL(req.url);
  const userID =
    url.searchParams.get("userID") || req.headers.get("x-user-id") || null;
  //temp line: get data from json file that is acting as our database
  const dataDir = path.join(process.cwd(), "src", "data");

  const res = await safeAsync(async () => {
    // if userID param is empty
    if (!userID) throw new Error("Missing userID");

    const [usersRaw, subsRaw] = await Promise.all([
      //temp line: get data from json file that is acting as our database
      fs.readFile(path.join(dataDir, "users.json"), "utf8"),
      fs.readFile(path.join(dataDir, "subs.json"), "utf8"),
    ]);

    // HANDLE USER
    const users = JSON.parse(usersRaw) as User[];

    // lookup user in database
    const user = users.find((u) => u.id === userID);
    // if user is not found throw an error
    if (!user) throw new Error("User not found");

    // HANDLE SUBS DATA
    const subsParsed = JSON.parse(subsRaw);

    let subs: Subscription[];
    if (Array.isArray(subsParsed)) {
      subs = subsParsed as Subscription[];
    } else if (Array.isArray(subsParsed.data)) {
      subs = subsParsed.data as Subscription[];
    } else if (Array.isArray(subsParsed.subscriptions)) {
      subs = subsParsed.subscriptions as Subscription[];
    } else {
      throw new Error(
        "Invalid subs.json format: expected an array or { data: [...] } or { subscriptions: [...] }"
      );
    }

    // find all subscriptions associated with user
    const userSubs = subs.filter((s) => s.userId === user.id);

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
