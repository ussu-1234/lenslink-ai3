// Import the Express framework, which makes building web servers in Node.js much easier.
const express = require('express');
const session = require('express-session');
const path = require('path');
// Import the file system module to read our database file.
const fs = require('fs').promises;
const crypto = require('crypto');

// Create an instance of the Express application.
const app = express();
// Define the port. Use an environment variable for deployment, defaulting to 3000.
const PORT = process.env.PORT || 3000;
// External services
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
const SEARXNG_HOST = (process.env.SEARXNG_URL || 'https://xng.quest.ac').replace(/\/+$/, '');

// --- Database Storage ---
// Use a Map for O(1) (very fast) lookups by camera name.
let cameraMap = new Map();
// Keep the original list for the /api/cameras endpoint.
let cameraList = [];
// User database
let userList = [];
// Reviews database
let reviewList = [];
// Price history database
let priceHistoryList = [];

// --- Middleware ---
// Middleware to serve static files (like your index.html) from the same directory.
app.use(express.static(__dirname));
// Middleware to parse incoming JSON request bodies (good practice for APIs).
app.use(express.json());
// Session middleware for authentication
app.use(session({
    secret: 'lenslink-ai-secret-key-change-in-production',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false, // Set to true in production with HTTPS
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// --- Database Loader Functions ---
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

/**
 * Reads the users.json file and loads user data
 */
const loadUsers = async () => {
    try {
        const rawData = await fs.readFile(path.join(__dirname, 'users.json'));
        const data = JSON.parse(rawData);

        if (!Array.isArray(data)) {
            throw new Error("User database file 'users.json' is not a valid JSON array.");
        }

        userList = data.map(user => ({
            ...user,
            favorites: Array.isArray(user.favorites) ? user.favorites : [],
            reviews: Array.isArray(user.reviews) ? user.reviews : [],
            priceAlerts: Array.isArray(user.priceAlerts) ? user.priceAlerts : []
        }));
        console.log(`Successfully loaded ${userList.length} users.`);
    } catch (error) {
        console.error("Failed to read or parse user database:", error);
        throw new Error(`User database loading failed: ${error.message}`);
    }
};

/**
 * Saves the user list to users.json
 */
const saveUsers = async () => {
    try {
        await fs.writeFile(
            path.join(__dirname, 'users.json'),
            JSON.stringify(userList, null, 2)
        );
    } catch (error) {
        console.error("Failed to save user database:", error);
        throw new Error(`User database save failed: ${error.message}`);
    }
};

/**
 * Saves the review list to reviews.json
 */
const saveReviews = async () => {
    try {
        await fs.writeFile(
            path.join(__dirname, 'reviews.json'),
            JSON.stringify(reviewList, null, 2)
        );
    } catch (error) {
        console.error("Failed to save review database:", error);
        throw new Error(`Review database save failed: ${error.message}`);
    }
};

/**
 * Loads price history from price-history.json
 */
const loadPriceHistory = async () => {
    try {
        const rawData = await fs.readFile(path.join(__dirname, 'price-history.json'));
        priceHistoryList = JSON.parse(rawData);
        console.log(`Successfully loaded ${priceHistoryList.length} price history entries.`);
    } catch (error) {
        if (error.code === 'ENOENT') {
            console.warn("price-history.json not found. Creating a new file.");
            priceHistoryList = [];
            await savePriceHistory();
            return;
        }
        console.error("Failed to read or parse price history database:", error);
        throw new Error(`Price history database loading failed: ${error.message}`);
    }
};

/**
 * Saves price history to price-history.json
 */
const savePriceHistory = async () => {
    try {
        await fs.writeFile(
            path.join(__dirname, 'price-history.json'),
            JSON.stringify(priceHistoryList, null, 2)
        );
    } catch (error) {
        console.error("Failed to save price history:", error);
        throw new Error(`Price history save failed: ${error.message}`);
    }
};

/**
 * Reads the reviews.json file and loads review data
 */
const loadReviews = async () => {
    try {
        const rawData = await fs.readFile(path.join(__dirname, 'reviews.json'));
        const data = JSON.parse(rawData);

        if (!Array.isArray(data)) {
            throw new Error("Review database file 'reviews.json' is not a valid JSON array.");
        }

        reviewList = data;
        console.log(`Successfully loaded ${reviewList.length} reviews.`);
    } catch (error) {
        if (error.code === 'ENOENT') {
            console.warn("reviews.json not found. Creating a new file.");
            reviewList = [];
            await saveReviews();
            return;
        }
        console.error("Failed to read or parse review database:", error);
        throw new Error(`Review database loading failed: ${error.message}`);
    }
};

/**
 * Generate a unique ID for new users
 */
const generateId = () => {
    return crypto.randomBytes(8).toString('hex');
};

/**
 * Ensure a user record has favorites/reviews/priceAlerts arrays
 */
const ensureUserCollections = (user) => {
    if (user) {
        if (!Array.isArray(user.favorites)) {
            user.favorites = [];
        }
        if (!Array.isArray(user.reviews)) {
            user.reviews = [];
        }
        if (!Array.isArray(user.priceAlerts)) {
            user.priceAlerts = [];
        }
    }
    return user;
};

/**
 * Helper to add a review reference to a user
 */
const addReviewReferenceToUser = (userId, reviewId) => {
    const user = ensureUserCollections(userList.find(u => u.id === userId));
    if (user && !user.reviews.includes(reviewId)) {
        user.reviews.push(reviewId);
    }
};

/**
 * Helper to remove a review reference from a user
 */
const removeReviewReferenceFromUser = (userId, reviewId) => {
    const user = ensureUserCollections(userList.find(u => u.id === userId));
    if (user && Array.isArray(user.reviews)) {
        user.reviews = user.reviews.filter(id => id !== reviewId);
    }
};

/**
 * Remove all reviews written by a specific user
 */
const removeReviewsByUser = async (userId) => {
    const existingCount = reviewList.length;
    const remaining = reviewList.filter(review => review.userId !== userId);

    if (remaining.length !== existingCount) {
        reviewList = remaining;
        await saveReviews();
    }
};

/**
 * Build review response payload for a camera
 */
const buildReviewResponse = (cameraId, currentUserId) => {
    const cameraReviews = reviewList
        .filter(review => review.cameraId === cameraId)
        .sort((a, b) => {
            const dateA = new Date(a.updated_at || a.created_at);
            const dateB = new Date(b.updated_at || b.created_at);
            return dateB - dateA;
        });

    const ratingDistribution = {
        1: 0,
        2: 0,
        3: 0,
        4: 0,
        5: 0
    };

    let ratingSum = 0;
    cameraReviews.forEach(review => {
        const rating = Number(review.rating) || 0;
        if (rating >= 1 && rating <= 5) {
            ratingDistribution[rating] = (ratingDistribution[rating] || 0) + 1;
            ratingSum += rating;
        }
    });

    const totalReviews = cameraReviews.length;
    const averageRating = totalReviews
        ? Number((ratingSum / totalReviews).toFixed(2))
        : 0;

    const sanitizeReview = (review) => ({
        id: review.id,
        cameraId: review.cameraId,
        username: review.username,
        rating: review.rating,
        title: review.title,
        content: review.content,
        created_at: review.created_at,
        updated_at: review.updated_at || review.created_at,
        ownedByMe: currentUserId ? review.userId === currentUserId : false
    });

    const myReview = currentUserId
        ? cameraReviews.find(review => review.userId === currentUserId)
        : null;

    return {
        reviews: cameraReviews.map(sanitizeReview),
        averageRating,
        totalReviews,
        ratingDistribution,
        myReview: myReview ? sanitizeReview(myReview) : null
    };
};

// --- External Search Helpers ---
const fetchWithTimeout = async (url, options = {}, timeoutMs = 8000) => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);
    try {
        const response = await fetch(url, {
            ...options,
            signal: controller.signal
        });
        return response;
    } finally {
        clearTimeout(timeout);
    }
};

const stripHtml = (value = '') => value.replace(/<[^>]*>/g, '').trim();

const fetchSearxResults = async (query) => {
    const url = `${SEARXNG_HOST}/search?q=${encodeURIComponent(query)}&format=json&language=en-US`;
    const response = await fetchWithTimeout(url, {}, 8000);
    if (!response.ok) {
        throw new Error(`SearxNG request failed with status ${response.status}`);
    }
    const data = await response.json();
    if (!Array.isArray(data?.results)) {
        return [];
    }
    return data.results.slice(0, 5).map(result => ({
        title: stripHtml(result.title || 'Untitled result'),
        url: result.url,
        snippet: stripHtml(result.content || result.snippet || '')
    }));
};

const fetchGeminiSummary = async (query, searxResults) => {
    if (!GEMINI_API_KEY) {
        return 'Add a Gemini API key to enable AI-generated summaries.';
    }

    const promptParts = [
        `User query: ${query}`,
        'Top search results:\n' + searxResults.map((item, index) => (
            `${index + 1}. ${item.title}\nURL: ${item.url}\nSnippet: ${item.snippet}`
        )).join('\n\n'),
        'Using the results above, provide a concise summary with actionable camera recommendations. Mention specific models when applicable and note any trade-offs.'
    ];

    const body = {
        contents: [{
            parts: promptParts.map(text => ({ text }))
        }]
    };

    const response = await fetchWithTimeout(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_API_KEY}`,
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        },
        10000
    );

    if (!response.ok) {
        throw new Error(`Gemini request failed with status ${response.status}`);
    }

    const data = await response.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    return text?.trim() || 'No summary available.';
};

// --- Authentication Middleware ---
/**
 * Middleware to check if user is authenticated
 */
const requireAuth = (req, res, next) => {
    if (req.session && req.session.userId) {
        next();
    } else {
        res.status(401).json({ error: 'Authentication required' });
    }
};

/**
 * Middleware to check if user is admin
 */
const requireAdmin = (req, res, next) => {
    if (req.session && req.session.userId) {
        const user = userList.find(u => u.id === req.session.userId);
        if (user && user.role === 'admin') {
            next();
        } else {
            res.status(403).json({ error: 'Admin access required' });
        }
    } else {
        res.status(401).json({ error: 'Authentication required' });
    }
};

// --- API Routes ---
// Create a dedicated router for all /api endpoints.
const apiRouter = express.Router();

// --- Authentication Routes ---
/**
 * POST /api/auth/register
 * Register a new user
 */
apiRouter.post('/auth/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // Validate input
        if (!username || !email || !password) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        if (username.length < 3) {
            return res.status(400).json({ error: 'Username must be at least 3 characters' });
        }

        if (password.length < 6) {
            return res.status(400).json({ error: 'Password must be at least 6 characters' });
        }

        // Check if username or email already exists
        const existingUser = userList.find(
            u => u.username.toLowerCase() === username.toLowerCase() || 
                 u.email.toLowerCase() === email.toLowerCase()
        );

        if (existingUser) {
            return res.status(400).json({ error: 'Username or email already exists' });
        }

        // Create new user
        const newUser = {
            id: generateId(),
            username,
            email,
            password, // Plain text as requested (prototype only)
            role: 'user',
            created_at: new Date().toISOString(),
            favorites: [],
            reviews: []
        };

        userList.push(newUser);
        await saveUsers();

        res.status(201).json({ 
            message: 'User registered successfully',
            user: { 
                id: newUser.id, 
                username: newUser.username, 
                email: newUser.email,
                role: newUser.role
            }
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Registration failed' });
    }
});

/**
 * POST /api/auth/login
 * Authenticate a user
 */
apiRouter.post('/auth/login', (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ error: 'Username and password are required' });
        }

        // Find user by username or email
        const user = userList.find(
            u => u.username.toLowerCase() === username.toLowerCase() || 
                 u.email.toLowerCase() === username.toLowerCase()
        );

        if (!user || user.password !== password) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Create session
        req.session.userId = user.id;
        req.session.username = user.username;
        req.session.role = user.role;

        res.json({
            message: 'Login successful',
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Login failed' });
    }
});

/**
 * POST /api/auth/logout
 * Logout user
 */
apiRouter.post('/auth/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ error: 'Logout failed' });
        }
        res.json({ message: 'Logout successful' });
    });
});

/**
 * GET /api/auth/me
 * Get current user info
 */
apiRouter.get('/auth/me', (req, res) => {
    if (!req.session || !req.session.userId) {
        return res.status(401).json({ error: 'Not authenticated' });
    }

    const user = userList.find(u => u.id === req.session.userId);
    
    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }

    res.json({
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
    });
});

// --- Admin Routes ---
/**
 * GET /api/admin/users
 * Get all users (admin only)
 */
apiRouter.get('/admin/users', requireAdmin, (req, res) => {
    // Return users without passwords
    const sanitizedUsers = userList.map(u => ({
        id: u.id,
        username: u.username,
        email: u.email,
        role: u.role,
        created_at: u.created_at
    }));
    res.json(sanitizedUsers);
});

/**
 * PUT /api/admin/users/:id
 * Update a user (admin only)
 */
apiRouter.put('/admin/users/:id', requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { email, role, password } = req.body;

        const userIndex = userList.findIndex(u => u.id === id);
        
        if (userIndex === -1) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Update user fields
        if (email) {
            // Check if email is already used by another user
            const existingUser = userList.find(
                u => u.id !== id && u.email.toLowerCase() === email.toLowerCase()
            );
            if (existingUser) {
                return res.status(400).json({ error: 'Email already in use' });
            }
            userList[userIndex].email = email;
        }

        if (role && (role === 'user' || role === 'admin')) {
            userList[userIndex].role = role;
        }

        if (password) {
            userList[userIndex].password = password;
        }

        await saveUsers();

        res.json({ 
            message: 'User updated successfully',
            user: {
                id: userList[userIndex].id,
                username: userList[userIndex].username,
                email: userList[userIndex].email,
                role: userList[userIndex].role
            }
        });
    } catch (error) {
        console.error('Update user error:', error);
        res.status(500).json({ error: 'Failed to update user' });
    }
});

/**
 * DELETE /api/admin/users/:id
 * Delete a user (admin only)
 */
apiRouter.delete('/admin/users/:id', requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;

        const userIndex = userList.findIndex(u => u.id === id);
        
        if (userIndex === -1) {
            return res.status(404).json({ error: 'User not found' });
        }

        const deletedUser = userList[userIndex];
        userList.splice(userIndex, 1);
        
        await Promise.all([
            saveUsers(),
            removeReviewsByUser(deletedUser.id)
        ]);

        res.json({ 
            message: 'User deleted successfully',
            username: deletedUser.username
        });
    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({ error: 'Failed to delete user' });
    }
});

// --- Profile Routes ---
/**
 * PUT /api/profile/update
 * Update user profile (email)
 */
apiRouter.put('/profile/update', requireAuth, async (req, res) => {
    try {
        const { email, username } = req.body;
        const userId = req.session.userId;

        if (!email && !username) {
            return res.status(400).json({ error: 'Nothing to update' });
        }

        const userIndex = userList.findIndex(u => u.id === userId);
        
        if (userIndex === -1) {
            return res.status(404).json({ error: 'User not found' });
        }

        const updatedUser = { ...userList[userIndex] };

        if (typeof email !== 'undefined') {
            const trimmedEmail = String(email).trim();
            if (!trimmedEmail) {
                return res.status(400).json({ error: 'Email is required' });
            }

            const existingEmailUser = userList.find(
                u => u.id !== userId && u.email.toLowerCase() === trimmedEmail.toLowerCase()
            );
            
            if (existingEmailUser) {
                return res.status(400).json({ error: 'Email already in use' });
            }

            updatedUser.email = trimmedEmail;
        }

        if (typeof username !== 'undefined') {
            const trimmedUsername = String(username).trim();
            if (!trimmedUsername) {
                return res.status(400).json({ error: 'Username is required' });
            }

            const existingUsernameUser = userList.find(
                u => u.id !== userId && u.username.toLowerCase() === trimmedUsername.toLowerCase()
            );

            if (existingUsernameUser) {
                return res.status(400).json({ error: 'Username already in use' });
            }

            updatedUser.username = trimmedUsername;
        }

        userList[userIndex] = { ...userList[userIndex], ...updatedUser };
        await saveUsers();

        if (updatedUser.username) {
            req.session.username = updatedUser.username;
        }

        res.json({ 
            message: 'Profile updated successfully',
            user: {
                id: updatedUser.id,
                username: updatedUser.username,
                email: updatedUser.email,
                role: updatedUser.role
            }
        });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ error: 'Failed to update profile' });
    }
});

/**
 * PUT /api/profile/change-password
 * Change user password
 */
apiRouter.put('/profile/change-password', requireAuth, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const userId = req.session.userId;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ error: 'Current and new password are required' });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ error: 'New password must be at least 6 characters' });
        }

        const userIndex = userList.findIndex(u => u.id === userId);
        
        if (userIndex === -1) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Verify current password
        if (userList[userIndex].password !== currentPassword) {
            return res.status(401).json({ error: 'Current password is incorrect' });
        }

        userList[userIndex].password = newPassword;
        await saveUsers();

        res.json({ message: 'Password updated successfully' });
    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({ error: 'Failed to change password' });
    }
});

/**
 * DELETE /api/profile/delete
 * Delete user account
 */
apiRouter.delete('/profile/delete', requireAuth, async (req, res) => {
    try {
        const userId = req.session.userId;

        const userIndex = userList.findIndex(u => u.id === userId);
        
        if (userIndex === -1) {
            return res.status(404).json({ error: 'User not found' });
        }

        userList.splice(userIndex, 1);
        await saveUsers();
        await removeReviewsByUser(userId);

        // Destroy session
        req.session.destroy();

        res.json({ message: 'Account deleted successfully' });
    } catch (error) {
        console.error('Delete account error:', error);
        res.status(500).json({ error: 'Failed to delete account' });
    }
});

// --- Favorites Routes ---
/**
 * GET /api/favorites
 * Get user's favorite cameras
 */
apiRouter.get('/favorites', requireAuth, (req, res) => {
    try {
        const userId = req.session.userId;
        const user = ensureUserCollections(userList.find(u => u.id === userId));
        
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({ favorites: user.favorites });
    } catch (error) {
        console.error('Get favorites error:', error);
        res.status(500).json({ error: 'Failed to get favorites' });
    }
});

/**
 * POST /api/favorites
 * Add camera to favorites
 */
apiRouter.post('/favorites', requireAuth, async (req, res) => {
    try {
        const { cameraId } = req.body;
        const userId = req.session.userId;

        if (!cameraId) {
            return res.status(400).json({ error: 'Camera ID is required' });
        }

        const userIndex = userList.findIndex(u => u.id === userId);
        
        if (userIndex === -1) {
            return res.status(404).json({ error: 'User not found' });
        }

        ensureUserCollections(userList[userIndex]);

        // Check if already favorited
        if (userList[userIndex].favorites.includes(cameraId)) {
            return res.status(400).json({ error: 'Camera already in favorites' });
        }

        userList[userIndex].favorites.push(cameraId);
        await saveUsers();

        res.json({ 
            message: 'Added to favorites',
            favorites: userList[userIndex].favorites
        });
    } catch (error) {
        console.error('Add favorite error:', error);
        res.status(500).json({ error: 'Failed to add favorite' });
    }
});

/**
 * DELETE /api/favorites/:cameraId
 * Remove camera from favorites
 */
apiRouter.delete('/favorites/:cameraId', requireAuth, async (req, res) => {
    try {
        const { cameraId } = req.params;
        const userId = req.session.userId;

        const userIndex = userList.findIndex(u => u.id === userId);
        
        if (userIndex === -1) {
            return res.status(404).json({ error: 'User not found' });
        }

        ensureUserCollections(userList[userIndex]);

        // Remove from favorites
        userList[userIndex].favorites = userList[userIndex].favorites.filter(id => id !== cameraId);
        await saveUsers();

        res.json({ 
            message: 'Removed from favorites',
            favorites: userList[userIndex].favorites
        });
    } catch (error) {
        console.error('Remove favorite error:', error);
        res.status(500).json({ error: 'Failed to remove favorite' });
    }
});

// --- Review Routes ---
/**
 * GET /api/reviews/:cameraId
 * Fetch reviews for a specific camera
 */
apiRouter.get('/reviews/:cameraId', (req, res) => {
    try {
        const { cameraId } = req.params;
        const cameraExists = cameraList.some(camera => camera.id === cameraId);

        if (!cameraExists) {
            return res.status(404).json({ error: 'Camera not found' });
        }

        const currentUserId = req.session?.userId;
        const payload = buildReviewResponse(cameraId, currentUserId);

        res.json(payload);
    } catch (error) {
        console.error('Get reviews error:', error);
        res.status(500).json({ error: 'Failed to load reviews' });
    }
});

/**
 * POST /api/reviews
 * Create a new review for a camera
 */
apiRouter.post('/reviews', requireAuth, async (req, res) => {
    try {
        const { cameraId, rating, title = '', content = '' } = req.body;
        const userId = req.session.userId;

        if (!cameraId || rating === undefined) {
            return res.status(400).json({ error: 'Camera ID and rating are required' });
        }

        const camera = cameraList.find(c => c.id === cameraId);
        if (!camera) {
            return res.status(404).json({ error: 'Camera not found' });
        }

        const numericRating = Number(rating);
        if (!Number.isInteger(numericRating) || numericRating < 1 || numericRating > 5) {
            return res.status(400).json({ error: 'Rating must be an integer between 1 and 5' });
        }

        const trimmedTitle = title ? String(title).trim().slice(0, 120) : '';
        const trimmedContent = content ? String(content).trim() : '';

        if (!trimmedContent) {
            return res.status(400).json({ error: 'Review content cannot be empty' });
        }

        if (trimmedContent.length > 2000) {
            return res.status(400).json({ error: 'Review content exceeds 2000 characters' });
        }

        const existingReview = reviewList.find(review => review.cameraId === cameraId && review.userId === userId);
        if (existingReview) {
            return res.status(409).json({ error: 'You have already reviewed this camera' });
        }

        const user = ensureUserCollections(userList.find(u => u.id === userId));
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const timestamp = new Date().toISOString();
        const newReview = {
            id: generateId(),
            cameraId,
            userId,
            username: user.username,
            rating: numericRating,
            title: trimmedTitle,
            content: trimmedContent,
            created_at: timestamp,
            updated_at: timestamp
        };

        reviewList.push(newReview);
        addReviewReferenceToUser(userId, newReview.id);

        await Promise.all([
            saveReviews(),
            saveUsers()
        ]);

        const payload = buildReviewResponse(cameraId, userId);

        res.status(201).json({
            message: 'Review submitted successfully',
            review: payload.myReview,
            summary: {
                averageRating: payload.averageRating,
                totalReviews: payload.totalReviews,
                ratingDistribution: payload.ratingDistribution
            }
        });
    } catch (error) {
        console.error('Create review error:', error);
        res.status(500).json({ error: 'Failed to submit review' });
    }
});

/**
 * PUT /api/reviews/:id
 * Update an existing review
 */
apiRouter.put('/reviews/:id', requireAuth, async (req, res) => {
    try {
        const { id } = req.params;
        const { rating, title = '', content = '' } = req.body;
        const userId = req.session.userId;

        const reviewIndex = reviewList.findIndex(review => review.id === id);
        if (reviewIndex === -1) {
            return res.status(404).json({ error: 'Review not found' });
        }

        const review = reviewList[reviewIndex];
        const isOwner = review.userId === userId;
        const isAdmin = req.session.role === 'admin';

        if (!isOwner && !isAdmin) {
            return res.status(403).json({ error: 'You do not have permission to edit this review' });
        }

        if (rating !== undefined) {
            const numericRating = Number(rating);
            if (!Number.isInteger(numericRating) || numericRating < 1 || numericRating > 5) {
                return res.status(400).json({ error: 'Rating must be an integer between 1 and 5' });
            }
            reviewList[reviewIndex].rating = numericRating;
        }

        const trimmedTitle = title ? String(title).trim().slice(0, 120) : '';
        const trimmedContent = content ? String(content).trim() : '';

        if (trimmedContent) {
            if (trimmedContent.length > 2000) {
                return res.status(400).json({ error: 'Review content exceeds 2000 characters' });
            }
            reviewList[reviewIndex].content = trimmedContent;
        } else {
            return res.status(400).json({ error: 'Review content cannot be empty' });
        }

        reviewList[reviewIndex].title = trimmedTitle;
        reviewList[reviewIndex].updated_at = new Date().toISOString();

        if (isAdmin && !isOwner) {
            // Update username reference for admin edits to keep display accurate
            const owner = userList.find(u => u.id === review.userId);
            if (owner) {
                reviewList[reviewIndex].username = owner.username;
            }
        }

        await saveReviews();

        const payload = buildReviewResponse(review.cameraId, userId);

        res.json({
            message: 'Review updated successfully',
            review: payload.myReview,
            summary: {
                averageRating: payload.averageRating,
                totalReviews: payload.totalReviews,
                ratingDistribution: payload.ratingDistribution
            }
        });
    } catch (error) {
        console.error('Update review error:', error);
        res.status(500).json({ error: 'Failed to update review' });
    }
});

/**
 * DELETE /api/reviews/:id
 * Delete a review
 */
apiRouter.delete('/reviews/:id', requireAuth, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.session.userId;

        const reviewIndex = reviewList.findIndex(review => review.id === id);
        if (reviewIndex === -1) {
            return res.status(404).json({ error: 'Review not found' });
        }

        const review = reviewList[reviewIndex];
        const isOwner = review.userId === userId;
        const isAdmin = req.session.role === 'admin';

        if (!isOwner && !isAdmin) {
            return res.status(403).json({ error: 'You do not have permission to delete this review' });
        }

        reviewList.splice(reviewIndex, 1);
        removeReviewReferenceFromUser(review.userId, id);

        await Promise.all([
            saveReviews(),
            saveUsers()
        ]);

        const payload = buildReviewResponse(review.cameraId, userId);

        res.json({
            message: 'Review deleted successfully',
            summary: {
                averageRating: payload.averageRating,
                totalReviews: payload.totalReviews,
                ratingDistribution: payload.ratingDistribution
            }
        });
    } catch (error) {
        console.error('Delete review error:', error);
        res.status(500).json({ error: 'Failed to delete review' });
    }
});

// --- AI Search Route ---
/**
 * GET /api/search?q=
 * Combines SearxNG results with Gemini summary
 */
apiRouter.get('/search', async (req, res) => {
    const query = (req.query.q || '').trim();

    if (!query) {
        return res.status(400).json({ error: 'Missing query parameter ?q=' });
    }

    if (query.length > 240) {
        return res.status(400).json({ error: 'Query is too long. Please keep it under 240 characters.' });
    }

    try {
        const searxResults = await fetchSearxResults(query);
        let summary = '';

        if (searxResults.length) {
            try {
                summary = await fetchGeminiSummary(query, searxResults);
            } catch (geminiError) {
                console.warn('Gemini summary failed:', geminiError.message);
                summary = 'AI summary is currently unavailable. Here are the latest search results instead.';
            }
        } else {
            summary = 'No search results were found for this query.';
        }

        res.json({
            query,
            summary,
            results: searxResults
        });
    } catch (error) {
        console.error('Search endpoint error:', error.message);
        res.status(500).json({ error: 'Search service temporarily unavailable. Please try again later.' });
    }
});

// --- Camera Routes ---
/**
 * GET /api/cameras
 * Get all cameras
 */
apiRouter.get('/cameras', (req, res) => {
    res.json(cameraList);
});

/**
 * GET /api/cameras/:id
 * Get a single camera by ID
 */
apiRouter.get('/cameras/:id', (req, res) => {
    const { id } = req.params;
    const camera = cameraList.find(c => c.id === id);
    
    if (!camera) {
        return res.status(404).json({ error: 'Camera not found' });
    }
    
    res.json(camera);
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
        // Wait for the databases to be loaded and indexed *before*
        // the server starts accepting requests.
        await loadDatabase();
        await loadUsers();
        await loadReviews();
        await loadPriceHistory();
        
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