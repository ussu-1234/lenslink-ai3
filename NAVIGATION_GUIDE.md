# Navigation Guide - Dynamic Authentication Links

## Overview

The navigation bar on the landing page (index.html) now dynamically updates based on the user's authentication status, providing a seamless user experience.

## Navigation States

### 1. Not Logged In (Guest User)

```
┌──────────────────────────────────────────────────────────┐
│ LensLink AI                                              │
├──────────────────────────────────────────────────────────┤
│  [Smart Selector] [Compare] [Reviews] [Blog]            │
│  [Register] [Login]                                      │
└──────────────────────────────────────────────────────────┘
```

**Visible Links:**
- Smart Selector
- Compare
- Reviews
- Blog
- **Register** (links to /register.html)
- **Login** (links to /login.html)

---

### 2. Logged In as Regular User

```
┌──────────────────────────────────────────────────────────┐
│ LensLink AI                                              │
├──────────────────────────────────────────────────────────┤
│  [Smart Selector] [Compare] [Reviews] [Blog]            │
│  Hello, john [Logout]                                    │
└──────────────────────────────────────────────────────────┘
```

**Visible Links:**
- Smart Selector
- Compare
- Reviews
- Blog
- **Hello, [username]** (greeting, not clickable)
- **Logout** (logs out and redirects to /login.html)

**Changes from Guest:**
- Register and Login links are replaced
- User's name is displayed
- Logout button appears

---

### 3. Logged In as Admin

```
┌──────────────────────────────────────────────────────────┐
│ LensLink AI                                              │
├──────────────────────────────────────────────────────────┤
│  [Smart Selector] [Compare] [Reviews] [Blog]            │
│  Hello, admin [Admin] [Logout]                          │
└──────────────────────────────────────────────────────────┘
```

**Visible Links:**
- Smart Selector
- Compare
- Reviews
- Blog
- **Hello, [username]** (greeting, not clickable)
- **Admin** (links to /admin.html - admin dashboard)
- **Logout** (logs out and redirects to /login.html)

**Changes from Regular User:**
- Additional "Admin" link appears
- Access to admin dashboard

---

## How It Works

### Initial Page Load

1. **index.html** loads with static links:
   ```html
   <nav>
       <a href="#">Smart Selector</a>
       <a href="#comparisonSection">Compare</a>
       <a href="#">Reviews</a>
       <a href="#">Blog</a>
       <a href="/register.html">Register</a>
       <a href="/login.html">Login</a>
   </nav>
   ```

2. **auth.js** is loaded
3. **updateNavigation()** is called on DOMContentLoaded
4. Function checks authentication status via `/api/auth/me`
5. Navigation is dynamically updated based on result

### Dynamic Update Process

```javascript
updateNavigation() {
    1. Check if user is authenticated (GET /api/auth/me)
    2. Remove static Register/Login links
    3. Remove any previous dynamic auth links
    4. If logged in:
       - Add greeting with username
       - Add Admin link (if admin role)
       - Add Logout link
    5. If not logged in:
       - Add Register link
       - Add Login link
}
```

### Authentication Flow

```
User visits index.html
       │
       ▼
Page loads with static links
       │
       ▼
auth.js executes updateNavigation()
       │
       ├─── User NOT logged in ────▶ Show: Register | Login
       │
       └─── User IS logged in ─────▶ Show: Hello, [name] | [Admin?] | Logout
```

---

## User Journey Examples

### Example 1: First-Time Visitor

1. **Visit** → http://localhost:3000
2. **See** → Register and Login links
3. **Click** → Register
4. **Fill** → Registration form
5. **Redirect** → Login page
6. **Login** → With new credentials
7. **Redirect** → Back to index.html
8. **See** → "Hello, [username]" and Logout (Register/Login gone)

---

### Example 2: Returning User

1. **Visit** → http://localhost:3000
2. **See** → Register and Login links (no session yet)
3. **Click** → Login
4. **Enter** → Credentials
5. **Redirect** → Back to index.html
6. **See** → "Hello, [username]" and Logout

---

### Example 3: Admin User

1. **Visit** → http://localhost:3000
2. **Click** → Login
3. **Enter** → admin / admin123
4. **Redirect** → Back to index.html
5. **See** → "Hello, admin" | Admin | Logout
6. **Click** → Admin
7. **View** → Admin dashboard with user management

---

## CSS Styling

All dynamically added links use the `.auth-link` class to maintain consistent styling:

```css
nav a, nav span {
    color: #c9d1d9;
    text-decoration: none;
    margin-left: 25px;
    font-weight: 300;
    transition: color 0.3s ease;
}

nav a:hover {
    color: #58a6ff;
}
```

The greeting text (Hello, username) uses:
```javascript
userSpan.style.color = '#8b949e'; // Muted gray color
```

---

## Benefits

1. **Seamless UX**: Users see relevant options based on their status
2. **No Clutter**: Logged-in users don't see Register/Login
3. **Clear Identity**: Users know who they're logged in as
4. **Admin Access**: Admins get quick access to dashboard
5. **Easy Logout**: One-click logout from any page

---

## Technical Implementation

### Files Involved

1. **index.html**
   - Contains static navigation structure
   - Loads auth.js script
   - Calls updateNavigation() on page load

2. **public/js/auth.js**
   - Contains updateNavigation() function
   - Checks authentication status
   - Dynamically manipulates DOM

3. **server.js**
   - Provides `/api/auth/me` endpoint
   - Returns current user info or 401 if not logged in

### Key Functions

```javascript
// Check if user is authenticated
checkAuth() → Returns user object or null

// Update navigation based on auth status
updateNavigation() → Modifies DOM dynamically

// Logout user
logout() → Calls /api/auth/logout and redirects
```

---

## Maintenance

### Adding New Static Links

Add them in index.html before Register/Login:

```html
<nav>
    <a href="#">Smart Selector</a>
    <a href="#comparisonSection">Compare</a>
    <a href="#">Reviews</a>
    <a href="#">Blog</a>
    <a href="/new-feature">New Feature</a> <!-- Add here -->
    <a href="/register.html">Register</a>
    <a href="/login.html">Login</a>
</nav>
```

### Customizing Auth Links

Modify `updateNavigation()` in auth.js:

```javascript
// Change greeting text
userSpan.textContent = `Welcome, ${user.username}!`;

// Add profile link
const profileLink = document.createElement('a');
profileLink.href = '/profile.html';
profileLink.className = 'auth-link';
profileLink.textContent = 'Profile';
nav.appendChild(profileLink);
```

---

## Testing Checklist

- [ ] Load index.html without logging in → See Register/Login
- [ ] Click Register → Create account
- [ ] Return to index.html → See greeting and Logout
- [ ] Click Logout → See Register/Login again
- [ ] Login as regular user → No Admin link
- [ ] Login as admin → Admin link visible
- [ ] Click Admin link → Access admin dashboard
- [ ] Navigate back to index → Greeting still visible
- [ ] Refresh page → Auth status persists (session maintained)
- [ ] Restart server → Session lost, see Register/Login

---

## Browser Behavior

### Session Persistence

- Sessions last **24 hours** by default
- Session cookie is **HttpOnly** (secure)
- Stored on **server side** (in memory)
- Lost when **server restarts**

### Cross-Page Navigation

When navigating between pages:
1. Session cookie sent automatically
2. Auth status maintained
3. No need to re-login
4. Navigation updates consistently

---

## Troubleshooting

**Problem:** Register/Login links don't disappear after login

**Solution:**
- Check browser console for JavaScript errors
- Verify auth.js is loaded: `<script src="/public/js/auth.js"></script>`
- Ensure updateNavigation() is called: Check in browser console

---

**Problem:** "Hello, undefined" appears

**Solution:**
- Check `/api/auth/me` endpoint is working
- Verify session is being created on login
- Check server console for errors

---

**Problem:** Admin link not showing for admin users

**Solution:**
- Verify user role in users.json is exactly "admin"
- Check `user.role === 'admin'` condition in auth.js
- Confirm session.role is set during login

---

## Future Enhancements

Potential improvements:

1. **Profile Page**: Add link to user profile
2. **Notifications**: Add notification bell icon
3. **Avatar**: Display user avatar image
4. **Dropdown Menu**: User menu with settings, profile, logout
5. **Mobile Menu**: Hamburger menu for responsive design
6. **Search**: Add search functionality to nav
7. **Breadcrumbs**: Show current page location
8. **Language Switcher**: Multi-language support

---

## Summary

The dynamic navigation system provides:
- ✅ Context-aware links based on auth status
- ✅ Clean, professional user experience
- ✅ Easy access to login/register for guests
- ✅ Quick logout for authenticated users
- ✅ Admin dashboard access for admins
- ✅ Consistent styling across all states
- ✅ Automatic updates without page refresh






