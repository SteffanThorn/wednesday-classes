// Line 1: Import MongoClient class and ServerApiVersion constant from the mongodb package
import { MongoClient, ServerApiVersion } from "mongodb";

// Line 2: Check if MONGODB_URI environment variable is defined, throw error if missing
if (!process.env.MONGODB_URI) {
    throw new Error('Invalid/Missing environment variable: MONGODB_URI"');
}
// Line 3: Retrieve the MongoDB connection URI from environment variables
const uri = process.env.MONGODB_URI;

// Line 4: Configure MongoDB client options including server API version and settings
const options = {
    serverApi: {
        version: ServerApiVersion.v1,      // Use version 1 of the Stable API
        strict: true,                       // Enable strict mode for API compliance
        deprecationErrors: true,            // Throw errors for deprecated features
    },
};

// Line 5: Declare client variable to hold MongoDB client instance
let client;
// Line 6: Declare clientPromise variable to hold the connection promise
let clientPromise;

// Line 7: Check if running in development environment
if (process.env.NODE_ENV === "development") {
    // Access the global object with type assertion for Mongo-related properties
    let globalWithMongo = global;
    // Initialize the cached promise as undefined
    globalWithMongo._mongoClientPromise = undefined;

    // If no cached connection exists, create a new one
    if (!globalWithMongo._mongoClientPromise) {
        client = new MongoClient(uri, options);
        globalWithMongo._mongoClientPromise = client.connect();
    }
    // Assign the cached promise to clientPromise
    clientPromise = globalWithMongo._mongoClientPromise;
} else {
    // Line 8: In production, create a new client and connection for each instance
    client = new MongoClient(uri, options);
    clientPromise = client.connect();
}

// Export the client promise for use in other modules
export default clientPromise;

