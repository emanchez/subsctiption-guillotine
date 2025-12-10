"use client";

/**
 * Subscription Card Component
 *
 * Displays individual subscription information in a card format with edit/delete actions.
 * Shows subscription details including cost, renewal date, category, notes, and reminders.
 *
 * Features:
 * - Responsive card layout with subscription details
 * - Edit and delete action buttons
 * - Confirmation dialog for delete operations
 * - Formatted display of reminder alerts
 * - Proper error handling for API operations
 */

import { SubContainerProps } from "./SubsContainer";
import { ApiSubscription } from "@/lib/types/subscription";

export interface SubCardProps extends SubContainerProps {
  subscription: ApiSubscription;
  onEdit?: (subscription: ApiSubscription) => void;
  onDelete?: (subscriptionId: number) => void;
}

const SubsCard = (props: SubCardProps) => {
  const { subscription, onEdit, onDelete } = props;

  /**
   * Handles the delete button click with confirmation dialog
   * Calls the API to delete the subscription and updates parent state
   */
  const handleDelete = async () => {
    if (confirm(`Are you sure you want to delete "${subscription.name}"?`)) {
      try {
        const response = await fetch(`/api/subscriptions/${subscription.id}`, {
          method: "DELETE",
        });

        if (response.ok) {
          onDelete?.(subscription.id);
          alert("Subscription deleted successfully!");
        } else {
          const error = await response.json();
          alert(
            `Failed to delete subscription: ${error.error || "Unknown error"}`
          );
        }
      } catch (error) {
        console.error("Failed to delete subscription:", error);
        alert("Failed to delete subscription. Please try again.");
      }
    }
  };

  return (
    <div id={props.id} className={props.className} style={props.style}>
      <div className="border rounded-lg p-4 shadow-sm">
        {/* Header with subscription name and action buttons */}
        <div className="flex justify-between items-start mb-2">
          <h4 className="text-lg font-semibold">{subscription.name}</h4>
          <div className="flex gap-2">
            <button
              onClick={() => onEdit?.(subscription)}
              className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Edit
            </button>
            <button
              onClick={handleDelete}
              className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600"
            >
              Delete
            </button>
          </div>
        </div>

        {/* Subscription details section */}
        <div className="space-y-1 text-sm text-gray-600">
          <div>
            <span className="font-medium">Cost:</span> ${subscription.cost} (
            {subscription.cycle})
          </div>
          <div>
            <span className="font-medium">Renewal:</span>{" "}
            {subscription.renewalDate
              ? new Date(subscription.renewalDate).toLocaleDateString()
              : "unknown"}
          </div>
          {subscription.category && (
            <div>
              <span className="font-medium">Category:</span>{" "}
              {subscription.category}
            </div>
          )}
          {subscription.notes && (
            <div>
              <span className="font-medium">Notes:</span> {subscription.notes}
            </div>
          )}
          {subscription.reminderAlert &&
            subscription.reminderAlert.length > 0 && (
              <div>
                <span className="font-medium">Reminders:</span>
                <ul className="ml-4 mt-1">
                  {subscription.reminderAlert.map((reminder, index) => (
                    <li key={index}>
                      {reminder.value} {reminder.timeframe} before renewal
                    </li>
                  ))}
                </ul>
              </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default SubsCard;
