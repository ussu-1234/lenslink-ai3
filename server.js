// Import the Express framework, which makes building web servers in Node.js much easier.
const express = require('express');
const path = require('path');
// Import the file system module to read our database file.
const fs = require('fs').promises;

// Create an instance of the Express application.
const app = express();
// Define the port. Use an environment variable for deployment, defaulting to 3000.
const PORT = process.env.PORT || 3000;

// --- Database Storage ---
// Use a Map for O(1) (very fast) lookups by camera name.
let cameraMap = new Map();
// Keep the original list for the /api/cameras endpoint.
let cameraList = [];

// --- Middleware ---
// Middleware to serve static files (like your index.html) from the same directory.
app.use(express.static(__dirname));
// Middleware to parse incoming JSON request bodies (good practice for APIs).
app.use(express.json());

// --- Database Loader Function ---
/**
 * Reads the cameras.json file and populates both the cameraList (array)
 * and cameraMap (for fast lookups).
 */
const loadDatabase = async () => {
    try {
        const rawData = await fs.readFile(path.join(__dirname, 'cameras.json'));
        const data = JSON.parse(rawData);

        if (!Array.isArray(data)) {
            throw new Error("Database file 'cameras.json' is not a valid JSON array.");
        }

        cameraList = data; // Store the full list
        cameraMap.clear(); // Clear any old data
        
        // Populate the Map for fast, case-insensitive lookups
        for (const camera of cameraList) {
            if (camera.name) {
                cameraMap.set(camera.name.toLowerCase(), camera);
            }
        }
        console.log(`Successfully loaded and indexed ${cameraMap.size} cameras.`);

    } catch (error) {
        console.error("Failed to read or parse camera database:", error);
        // This is a critical error; we should stop the server from starting.
        throw new Error(`Database loading failed: ${error.message}`);
    }
};

// --- API Routes ---
// Create a dedicated router for all /api endpoints.
const apiRouter = express.Router();

/**
 * GET /api/cameras
 * A simple endpoint to get the entire camera list.
 */
apiRouter.get('/cameras', (req, res) => {
    res.json(cameraList);
});

/**
 * GET /api/compare/:camera1/:camera2
 * An endpoint to get data for two specific cameras.
 * Example URL: /api/compare/Sony a7 IV/Canon EOS R6
 */
apiRouter.get('/compare/:camera1/:camera2', (req, res) => {
    // Get the camera names from the URL parameters.
    const camera1Name = req.params.camera1.toLowerCase();
    const camera2Name = req.params.camera2.toLowerCase();

    // Find the matching camera data using the fast Map lookup (O(1)).
    const camera1Data = cameraMap.get(camera1Name);
    const camera2Data = cameraMap.get(camera2Name);

    // Check if we found both cameras.
    if (camera1Data && camera2Data) {
        // If found, send the data back as a JSON object.
        res.json({
            camera1: camera1Data,
            camera2: camera2Data
        });
    } else {
        // If one or both are not found, send a 404 with a more specific error.
        const missing = [];
        if (!camera1Data) missing.push(req.params.camera1);
        if (!camera2Data) missing.push(req.params.camera2);
        
        res.status(404).json({ 
            error: `One or more cameras not found. Missing: [${missing.join(', ')}]` 
        });
    }
});

// Mount the API router. All routes defined in apiRouter will be prefixed with /api.
app.use('/api', apiRouter);

// --- Server Startup ---
// This function initializes the database and starts the server.
const startServer = async () => {
    try {
        // Wait for the database to be loaded and indexed *before*
        // the server starts accepting requests.
        await loadDatabase();
        
        // Start the server and make it listen for requests on the specified port.
        app.listen(PORT, () => {
            console.log(`Server is running successfully on http://localhost:${PORT}`);
            console.log('LensLink AI back-end is active!');
        });
    } catch (error) {
        console.error("Failed to start server:", error.message);
        // If the database fails to load, exit the process with a failure code.
        process.exit(1);
    }
};

// Call the function to start the server.
startServer();