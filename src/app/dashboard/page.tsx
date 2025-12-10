"use client";

/**
 * Dashboard Page Component
 *
 * Main dashboard page that displays user subscriptions with full CRUD functionality.
 * Handles loading states, error states, and real-time updates for subscription management.
 *
 * Features:
 * - Displays all user subscriptions in a responsive grid
 * - Add new subscriptions via AddSub component
 * - Edit existing subscriptions via EditSub component
 * - Delete subscriptions with confirmation
 * - Real-time UI updates without page refreshes
 * - Comprehensive error handling and loading states
 */

import { useState, useEffect } from "react";
import SubsContainer from "@/components/SubsContainer";
import SubsCard from "@/components/SubsCard";
import AddSub from "@/components/AddSub";
import EditSub from "@/components/EditSub";
import { User } from "@/lib/types/user";
import { ApiSubscription } from "@/lib/types/subscription";

const Dashboard = () => {
  // State management for user data and subscriptions
  const [user, setUser] = useState<User | null>(null);
  const [subscriptions, setSubscriptions] = useState<ApiSubscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingSubscription, setEditingSubscription] =
    useState<ApiSubscription | null>(null);

  // TODO: Replace with proper authentication context
  const userId = "user-1";

  /**
   * Fetches user data and subscriptions from the API
   * Handles various error states and updates component state accordingly
   */
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Call the internal API route to get user and subscription data
      const origin = process.env.NEXT_PUBLIC_APP_URL || `http://localhost:3000`;
      const apiUrl = `${origin}/api/subscriptions?userID=${encodeURIComponent(userId)}`;

      const res = await fetch(apiUrl, {
        method: "GET",
        cache: "no-store",
      });

      if (!res.ok) {
        let errorMessage = res.statusText;
        try {
          const errorBody = await res.json();
          if (errorBody.error) {
            errorMessage = errorBody.error;
          }
        } catch {
          // Use status text if parsing fails
        }

        if (res.status === 400) {
          setError(`Bad Request: ${errorMessage}`);
        } else if (res.status === 404) {
          setError(`User not found. Please sign in.`);
        } else if (res.status === 500) {
          setError(`Server error: ${errorMessage}`);
        } else {
          setError(
            `Failed to load subscriptions: ${res.status} - ${errorMessage}`
          );
        }
        return;
      }

      const body = await res.json();
      setUser(body.value.user);
      setSubscriptions(body.value.subscriptions);
    } catch (err) {
      console.error("Failed to fetch subscriptions:", err);
      setError("Failed to load subscriptions. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Load data on component mount
  useEffect(() => {
    fetchData();
  }, []);

  /**
   * Handles the edit button click by setting the subscription to edit mode
   */
  const handleEdit = (subscription: ApiSubscription) => {
    setEditingSubscription(subscription);
  };

  /**
   * Handles successful save of edited subscription
   * Updates the local state and exits edit mode
   */
  const handleEditSave = (updatedSubscription: ApiSubscription) => {
    setSubscriptions((prev) =>
      prev.map((sub) =>
        sub.id === updatedSubscription.id ? updatedSubscription : sub
      )
    );
    setEditingSubscription(null);
  };

  /**
   * Handles cancellation of edit operation
   */
  const handleEditCancel = () => {
    setEditingSubscription(null);
  };

  /**
   * Handles successful deletion of a subscription
   * Removes the subscription from local state
   */
  const handleDelete = (subscriptionId: number) => {
    setSubscriptions((prev) => prev.filter((sub) => sub.id !== subscriptionId));
  };

  // Loading state UI
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading subscriptions...</div>
      </div>
    );
  }

  // Error state UI with retry functionality
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center p-8 border rounded-lg shadow-sm max-w-md">
          <h1 className="text-xl font-semibold text-red-600 mb-4">Error</h1>
          <p className="text-gray-700 mb-4">{error}</p>
          <button
            onClick={fetchData}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // User not found state
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center p-8 border rounded-lg shadow-sm max-w-md">
          <h1 className="text-xl font-semibold mb-4">User not found</h1>
          <p className="text-gray-700">
            Please sign in to view your subscriptions.
          </p>
        </div>
      </div>
    );
  }

  return (
    <SubsContainer user={user}>
      <div className="space-y-6">
        {/* Conditionally render AddSub or EditSub based on current mode */}
        {editingSubscription ? (
          <EditSub
            subscription={editingSubscription}
            onSave={handleEditSave}
            onCancel={handleEditCancel}
          />
        ) : (
          <AddSub />
        )}

        {/* Responsive grid layout for subscription cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {subscriptions.map((sub) => (
            <SubsCard
              key={sub.id}
              subscription={sub}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>

        {/* Empty state when no subscriptions exist */}
        {subscriptions.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <p className="text-lg mb-2">No subscriptions yet</p>
            <p>Add your first subscription above to get started!</p>
          </div>
        )}
      </div>
    </SubsContainer>
  );
};

export default Dashboard;
