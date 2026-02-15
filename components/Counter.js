'use client'; // Tells Next.js this is a client-side component (runs in browser, not server)
import { useState } from 'react'; // Import useState hook to manage component state

// Main component function with optional props for initial value and min/max limits
export default function Counter({ initialValue = 0, min = -Infinity, max = Infinity }) {
  // State variable to store and display the current count value
  const [count, setCount] = useState(initialValue);
  // State variable to show loading spinner while API call is in progress
  const [isLoading, setIsLoading] = useState(false);

  // Function to increase count by 1, but stop at the maximum limit
  const increment = () => {
    setCount(prev => Math.min(prev + 1, max)); // Take current count, add 1, but don't exceed max
  };

  // Function to decrease count by 1, but stop at the minimum limit
  const decrement = () => {
    setCount(prev => Math.max(prev - 1, min)); // Take current count, subtract 1, but don't go below min
  };

  // Async function to send count changes to the server
  async function handleCountAction(action) {
    setIsLoading(true); // Show loading state to prevent multiple clicks
    try {
      // Send POST request to server with the action type (increment/decrement)
      const response = await fetch("/api/counter", {
        method: "POST", // Use POST method to send data
        headers: {
          "Content-Type": "application/json", // Tell server we're sending JSON data
        },
        body: JSON.stringify({
          action, // What action to perform (increment or decrement)
          counterId: id, // The ID of the counter being updated
        }),
      });

      // Check if the server response was successful (status 200-299)
      if (!response.ok) throw new Error("Failed to update counter");

      // Update local count after successful server update
      // If action is "increment", add 1; if "decrement", subtract 1
      setCount((prev) => (action === "increment" ? prev + 1 : prev - 1));
    } catch (error) {
      // If anything goes wrong, log the error to console
      console.error("Error updating counter:", error);
    } finally {
      // This runs whether there was an error or not - turn off loading state
      setIsLoading(false);
    }
  }

  // Render the counter UI
  return (
    // Card container with shadow and padding
    <div className="card bg-base-100 shadow-xl p-6">
      {/* Center everything with a gap between elements */}
      <div className="flex flex-col items-center gap-4">
        {/* Title of the card */}
        <h2 className="card-title text-2xl">Counter</h2>
        {/* Big number display showing current count */}
        <div className="text-5xl font-bold">{count}</div>
        {/* Row of buttons with spacing between them */}
        <div className="flex gap-4">
          {/* Decrease button - red color, disabled while loading */}
          <button
            onClick={decrement}
            className="btn btn-lg btn-error"
            disabled={isLoading}
          >
            -
          </button>
          {/* Increase button - green color */}
          <button
            onClick={increment}
            className="btn btn-lg btn-success"
          >
            +
          </button>
        </div>
      </div>
    </div>
  );
}

