"use client";

/**
 * Edit Subscription Component
 *
 * Form component for editing existing subscriptions with pre-populated data.
 * Provides the same interface as AddSub but with existing subscription data loaded.
 *
 * Features:
 * - Pre-populated form fields from existing subscription
 * - Form validation for all fields
 * - Dynamic reminder alert management (add/remove/edit)
 * - Category and cycle selection dropdowns
 * - API integration for subscription updates
 * - Success/error feedback with alerts
 * - Cancel functionality to abort changes
 */

import { useState } from "react";
import {
  ApiSubscription,
  SUBSCRIPTION_CYCLES,
  SUBSCRIPTION_CATEGORIES,
  REMINDER_TIMEFRAMES,
} from "@/lib/types/subscription";

interface ReminderAlert {
  timeframe: (typeof REMINDER_TIMEFRAMES)[number];
  value: number;
}

interface EditSubProps {
  subscription: ApiSubscription;
  onSave: (updatedSubscription: ApiSubscription) => void;
  onCancel: () => void;
}

const EditSub = ({ subscription, onSave, onCancel }: EditSubProps) => {
  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form data state initialized with subscription data
  const [formData, setFormData] = useState({
    name: subscription.name,
    cost: subscription.cost.toString(),
    cycle: subscription.cycle,
    renewalDate: subscription.renewalDate
      ? new Date(subscription.renewalDate).toISOString().split("T")[0]
      : "",
    category: subscription.category || "",
    notes: subscription.notes || "",
    reminderAlert: subscription.reminderAlert || ([] as ReminderAlert[]),
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Prepare submission data with proper type conversion
      const submissionData = {
        ...formData,
        cost: parseFloat(formData.cost),
        category: formData.category || undefined,
        notes: formData.notes || undefined,
        reminderAlert:
          formData.reminderAlert.length > 0
            ? formData.reminderAlert
            : undefined,
      };

      const response = await fetch(`/api/subscriptions/${subscription.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submissionData),
      });

      if (response.ok) {
        const result = await response.json();
        onSave(result.value.subscription);
        alert("Subscription updated successfully!");
      } else {
        const error = await response.json();
        alert(
          `Failed to update subscription: ${error.error || "Unknown error"}`
        );
      }
    } catch (error) {
      console.error("Failed to update subscription:", error);
      alert("Failed to update subscription. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Adds a new reminder alert to the form data
   */
  const addReminder = () => {
    setFormData((prev) => ({
      ...prev,
      reminderAlert: [...prev.reminderAlert, { timeframe: "days", value: 1 }],
    }));
  };

  /**
   * Updates a specific reminder alert field
   */
  const updateReminder = (
    index: number,
    field: keyof ReminderAlert,
    value: string | number
  ) => {
    setFormData((prev) => ({
      ...prev,
      reminderAlert: prev.reminderAlert.map((reminder, i) =>
        i === index ? { ...reminder, [field]: value } : reminder
      ),
    }));
  };

  /**
   * Removes a reminder alert from the form data
   */
  const removeReminder = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      reminderAlert: prev.reminderAlert.filter((_, i) => i !== index),
    }));
  };

  return (
    <div className="border rounded-lg p-6 shadow-sm bg-blue-50">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Edit Subscription</h3>
        <button
          onClick={onCancel}
          className="px-3 py-1 text-sm bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          Cancel
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              className="w-full px-3 py-2 border rounded"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Cost *</label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={formData.cost}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, cost: e.target.value }))
              }
              className="w-full px-3 py-2 border rounded"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Cycle *</label>
            <select
              value={formData.cycle}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  cycle: e.target.value as (typeof SUBSCRIPTION_CYCLES)[number],
                }))
              }
              className="w-full px-3 py-2 border rounded"
            >
              {SUBSCRIPTION_CYCLES.map((cycle) => (
                <option key={cycle} value={cycle}>
                  {cycle}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Renewal Date *
            </label>
            <input
              type="date"
              value={formData.renewalDate}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  renewalDate: e.target.value,
                }))
              }
              className="w-full px-3 py-2 border rounded"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Category</label>
            <select
              value={formData.category}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  category: e.target.value as
                    | (typeof SUBSCRIPTION_CATEGORIES)[number]
                    | "",
                }))
              }
              className="w-full px-3 py-2 border rounded"
            >
              <option value="">Select category</option>
              {SUBSCRIPTION_CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, notes: e.target.value }))
              }
              className="w-full px-3 py-2 border rounded"
              rows={3}
            />
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-medium">Reminders</label>
            <button
              type="button"
              onClick={addReminder}
              className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              + Add Reminder
            </button>
          </div>

          {formData.reminderAlert.map((reminder, index) => (
            <div key={index} className="flex items-center gap-2 mb-2">
              <input
                type="number"
                min="1"
                value={reminder.value}
                onChange={(e) =>
                  updateReminder(index, "value", parseInt(e.target.value))
                }
                className="w-20 px-2 py-1 border rounded text-sm"
              />
              <select
                value={reminder.timeframe}
                onChange={(e) =>
                  updateReminder(
                    index,
                    "timeframe",
                    e.target.value as (typeof REMINDER_TIMEFRAMES)[number]
                  )
                }
                className="px-2 py-1 border rounded text-sm"
              >
                {REMINDER_TIMEFRAMES.map((timeframe) => (
                  <option key={timeframe} value={timeframe}>
                    {timeframe}
                  </option>
                ))}
              </select>
              <span className="text-sm text-gray-600">before renewal</span>
              <button
                type="button"
                onClick={() => removeReminder(index)}
                className="px-2 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600"
              >
                Remove
              </button>
            </div>
          ))}
        </div>

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Updating..." : "Update Subscription"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditSub;
