/**
 * Favorites System
 * Handles adding/removing cameras from favorites
 */

let userFavorites = [];

/**
 * Load user's favorites from server
 */
async function loadFavorites() {
    try {
        const response = await fetch('/api/favorites', {
            credentials: 'include'
        });
        
        if (response.ok) {
            const data = await response.json();
            userFavorites = data.favorites || [];
            return userFavorites;
        } else if (response.status === 401) {
            // User not logged in
            userFavorites = [];
            return [];
        }
    } catch (error) {
        console.error('Failed to load favorites:', error);
        userFavorites = [];
        return [];
    }
}

/**
 * Check if a camera is favorited
 */
function isFavorite(cameraId) {
    return userFavorites.includes(cameraId);
}

/**
 * Toggle favorite status
 */
async function toggleFavorite(cameraId) {
    try {
        if (isFavorite(cameraId)) {
            // Remove from favorites
            const response = await fetch(`/api/favorites/${cameraId}`, {
                method: 'DELETE',
                credentials: 'include'
            });

            if (response.ok) {
                const data = await response.json();
                userFavorites = data.favorites;
                return { success: true, action: 'removed', favorites: userFavorites };
            } else if (response.status === 401) {
                return { success: false, error: 'Please login to manage favorites' };
            } else {
                const error = await response.json();
                return { success: false, error: error.error || 'Failed to remove favorite' };
            }
        } else {
            // Add to favorites
            const response = await fetch('/api/favorites', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({ cameraId })
            });

            if (response.ok) {
                const data = await response.json();
                userFavorites = data.favorites;
                return { success: true, action: 'added', favorites: userFavorites };
            } else if (response.status === 401) {
                return { success: false, error: 'Please login to manage favorites' };
            } else {
                const error = await response.json();
                return { success: false, error: error.error || 'Failed to add favorite' };
            }
        }
    } catch (error) {
        console.error('Toggle favorite error:', error);
        return { success: false, error: 'Network error' };
    }
}

/**
 * Create a favorite button element
 */
function createFavoriteButton(cameraId, options = {}) {
    const button = document.createElement('button');
    button.className = options.className || 'favorite-btn';
    button.dataset.cameraId = cameraId;
    button.title = isFavorite(cameraId) ? 'Remove from favorites' : 'Add to favorites';
    button.innerHTML = isFavorite(cameraId) ? '❤️' : '🤍';
    
    button.addEventListener('click', async (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        const result = await toggleFavorite(cameraId);
        
        if (result.success) {
            // Update button appearance
            button.innerHTML = isFavorite(cameraId) ? '❤️' : '🤍';
            button.title = isFavorite(cameraId) ? 'Remove from favorites' : 'Add to favorites';
            
            // Dispatch custom event for other components to react
            window.dispatchEvent(new CustomEvent('favoritesChanged', { 
                detail: { cameraId, action: result.action, favorites: result.favorites }
            }));
        } else {
            // Show error
            if (result.error === 'Please login to manage favorites') {
                if (confirm('You need to login to save favorites. Go to login page?')) {
                    window.location.href = '/login.html';
                }
            } else {
                alert(result.error);
            }
        }
    });
    
    return button;
}

/**
 * Update all favorite buttons on the page
 */
function updateFavoriteButtons() {
    const buttons = document.querySelectorAll('.favorite-btn');
    buttons.forEach(button => {
        const cameraId = button.dataset.cameraId;
        if (cameraId) {
            button.innerHTML = isFavorite(cameraId) ? '❤️' : '🤍';
            button.title = isFavorite(cameraId) ? 'Remove from favorites' : 'Add to favorites';
        }
    });
}

/**
 * Get all favorited cameras with full details
 */
async function getFavoriteCameras() {
    try {
        // Load all cameras
        const response = await fetch('/api/cameras');
        if (!response.ok) {
            throw new Error('Failed to load cameras');
        }
        
        const allCameras = await response.json();
        
        // Filter to only favorited ones
        return allCameras.filter(camera => isFavorite(camera.id));
    } catch (error) {
        console.error('Failed to get favorite cameras:', error);
        return [];
    }
}

// Auto-load favorites on page load
if (typeof window !== 'undefined') {
    window.addEventListener('DOMContentLoaded', () => {
        loadFavorites();
    });
    
    // Listen for favorites changes to update UI
    window.addEventListener('favoritesChanged', updateFavoriteButtons);
}






