// Export a function named GET that handles HTTP GET requests
// In Next.js App Router, API routes are created by exporting HTTP method functions
export function GET () {
    // Return a JSON response with a message
    // Response.json() is a built-in Web API that creates a Response object with JSON data
    return Response.json({ message: "You just hit an API"})
}
