import { cookies } from "next/headers";
import SubsContainer from "@/components/SubsContainer";
import SubsCard from "@/components/SubsCard";
import { User } from "@prisma/client";
import { ApiSubscription } from "@/lib/types/subscription";

const Dashboard = async () => {
  // simple dev shim: use cookie userId or fallback to a dev user
  const cookieStore = await cookies();
  const userId = cookieStore.get("userId")?.value ?? "user-1";

  // Call the internal API route to get user and subscription data
  // environments use VERCEL_URL; fallback to localhost for local dev.
  const origin =
    process.env.NEXT_PUBLIC_APP_URL ||
    (process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : `http://localhost:${process.env.PORT || 3000}`);
  const apiUrl = `${origin}/api/subscriptions?userID=${encodeURIComponent(
    userId
  )}`;

  //TODO: implement safeAsync
  const res = await fetch(apiUrl, {
    method: "GET",
    cache: "no-store", // Explicitly disable caching for dynamic data
    // forward cookies from the current request to the internal API
    headers: {
      cookie: cookieStore
        .getAll()
        .map((c) => `${c.name}=${c.value}`)
        .join("; "),
    },
  });

  if (!res.ok) {
    // propagate simple error states to the UI
    if (res.status === 404) {
      // Log technical details for debugging
      console.error(
        `Failed to load subscriptions: ${res.status} ${res.statusText}`
      );
      return (
        <div style={{ padding: 16 }}>
          <h1>User not found</h1>
          <p>Please sign in.</p>
        </div>
      );
    }
  }

  const body = await res.json();
  const user = body.value.user as User;
  const apiSubs = body.value.subscriptions as ApiSubscription[];

  if (!user) {
    return (
      <div style={{ padding: 16 }}>
        <h1>User not found</h1>
        <p>Please sign in.</p>
      </div>
    );
  }

  return (
    <SubsContainer user={user}>
      {apiSubs.map((sub) => (
        <SubsCard key={sub.id} subscription={sub} />
      ))}
    </SubsContainer>
  );
};

export default Dashboard;
