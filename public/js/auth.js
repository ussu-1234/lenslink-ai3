// Client-side authentication utilities for LensLink AI

/**
 * Check if user is authenticated
 * @returns {Promise<Object|null>} User object or null if not authenticated
 */
async function checkAuth() {
    try {
        const response = await fetch('/api/auth/me');
        if (response.ok) {
            return await response.json();
        }
        return null;
    } catch (error) {
        console.error('Auth check failed:', error);
        return null;
    }
}

/**
 * Check if user is admin
 * @returns {Promise<boolean>} True if user is admin
 */
async function checkAdmin() {
    const user = await checkAuth();
    return user && user.role === 'admin';
}

/**
 * Logout user and redirect to login page
 */
async function logout() {
    try {
        await fetch('/api/auth/logout', { method: 'POST' });
        window.location.href = '/login.html';
    } catch (error) {
        console.error('Logout failed:', error);
        // Redirect anyway
        window.location.href = '/login.html';
    }
}

/**
 * Redirect to login if not authenticated
 */
async function requireAuth() {
    const user = await checkAuth();
    if (!user) {
        window.location.href = '/login.html';
        return null;
    }
    return user;
}

/**
 * Redirect to login if not admin
 */
async function requireAdmin() {
    const user = await checkAuth();
    if (!user || user.role !== 'admin') {
        window.location.href = '/login.html';
        return null;
    }
    return user;
}

/**
 * Update navigation based on auth status
 */
async function updateNavigation() {
    const user = await checkAuth();
    const nav = document.querySelector('nav');
    
    if (!nav) return;
    
    // Remove existing auth-related links (both static and dynamic)
    const existingAuthLinks = nav.querySelectorAll('.auth-link');
    existingAuthLinks.forEach(link => link.remove());
    
    // Also remove static Register and Login links if they exist
    const allLinks = nav.querySelectorAll('a');
    allLinks.forEach(link => {
        if (link.getAttribute('href') === '/register.html' || 
            link.getAttribute('href') === '/login.html') {
            link.remove();
        }
    });
    
    if (user) {
        // User is logged in - show user info and logout
        const userSpan = document.createElement('span');
        userSpan.className = 'auth-link';
        userSpan.style.marginLeft = '25px';
        userSpan.style.color = '#8b949e';
        userSpan.textContent = `Hello, ${user.username}`;
        nav.appendChild(userSpan);
        
        const favoritesLink = document.createElement('a');
        favoritesLink.href = '/favorites.html';
        favoritesLink.className = 'auth-link';
        favoritesLink.textContent = 'Favorites';
        nav.appendChild(favoritesLink);
        
        const profileLink = document.createElement('a');
        profileLink.href = '/profile.html';
        profileLink.className = 'auth-link';
        profileLink.textContent = 'Profile';
        nav.appendChild(profileLink);
        
        if (user.role === 'admin') {
            const adminLink = document.createElement('a');
            adminLink.href = '/admin.html';
            adminLink.className = 'auth-link';
            adminLink.textContent = 'Admin';
            nav.appendChild(adminLink);
        }
        
        const logoutLink = document.createElement('a');
        logoutLink.href = '#';
        logoutLink.className = 'auth-link';
        logoutLink.textContent = 'Logout';
        logoutLink.onclick = (e) => {
            e.preventDefault();
            logout();
        };
        nav.appendChild(logoutLink);
    } else {
        // User is not logged in - show Register and Login
        const registerLink = document.createElement('a');
        registerLink.href = '/register.html';
        registerLink.className = 'auth-link';
        registerLink.textContent = 'Register';
        nav.appendChild(registerLink);
        
        const loginLink = document.createElement('a');
        loginLink.href = '/login.html';
        loginLink.className = 'auth-link';
        loginLink.textContent = 'Login';
        nav.appendChild(loginLink);
    }
}

