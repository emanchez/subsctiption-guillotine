"use client";

import { useEffect, useState } from "react";

const TestPage = () => {
  const [userId, setUserId] = useState("user-1");
  const [resp, setResp] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(
          `/api/subscriptions?userID=${encodeURIComponent(userId)}`
        );
        const json = await res.json();
        setResp(json);
      } catch (err) {
        setError(String(err));
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [userId]);

  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold mb-4">API Test: /api/subscriptions</h1>

      <label className="block mb-2">userID:</label>
      <select
        value={userId}
        onChange={(e) => setUserId(e.target.value)}
        className="border p-2 mb-4"
      >
        <option value="user-1">user-1</option>
        <option value="user-2">user-2</option>
        <option value="user-3">user-3</option>
        <option value="invalid">invalid</option>
      </select>

      <div className="mb-4">
        <button
          onClick={() => {
            setUserId("user-1");
          }}
          className="mr-2 px-3 py-1 bg-gray-200"
        >
          user-1
        </button>
        <button
          onClick={() => setUserId("user-2")}
          className="mr-2 px-3 py-1 bg-gray-200"
        >
          user-2
        </button>
        <button
          onClick={() => setUserId("invalid")}
          className="px-3 py-1 bg-gray-200"
        >
          invalid
        </button>
      </div>

      {loading && <p>Loading...</p>}
      {error && <p className="text-red-600">Error: {error}</p>}

      <pre className="bg-black/5 p-4 rounded">
        {JSON.stringify(resp, null, 2)}
      </pre>
    </main>
  );
};

export default TestPage;
