// Import NextResponse from Next.js server utilities
// NextResponse is used to send HTTP responses back to the browser
import { NextResponse } from "next/server"

// Export an async function called POST that handles HTTP POST requests
// This function runs when someone sends data to this API endpoint
export async function POST(request) {
    // Start a try block - any errors inside will be caught below
    try {
        // Wait for the request and convert JSON data to a JavaScript object
        // This makes the data easy to use in our code
        const body = await request.json();

        // Extract 'action' and 'counterID' values from the request body
        // These tell us what to do (increment/decrement) and which counter
        const { action, counterID } = body;

        // Log a message to the server console for debugging
        // Shows a happy face ":D" if incrementing, otherwise shows the action
        console.log(
            `${action === "increment" ? ":D" : ""} Counter ${counterID} ${action}ed`
        );

        // Return a successful JSON response with the action and counterID
        // This tells the client that the request worked
        return NextResponse.json({
            success: true,
            data: { action, counterID },   
        });
    } catch (error) {
        // If anything above fails, this code runs to handle the error
        // This prevents the server from crashing
        
        // Return an error response with HTTP status 500 (Server Error)
        // Include the error message to help with debugging
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        )
    } 
}

