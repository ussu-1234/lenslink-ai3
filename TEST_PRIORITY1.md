# 🧪 Priority 1 Features - Testing Guide

## Quick Start

```bash
# Navigate to project
cd "C:\Users\User\Downloads\Porject\lenslink-ai3"

# Start server
npm start
```

You should see:
```
Successfully loaded and indexed 7 cameras.
Successfully loaded 2 users.
Server is running successfully on http://localhost:3000
```

---

## ✅ Test Checklist

### 1. Homepage (/)
- [ ] Page loads successfully
- [ ] Navigation shows: Home | Browse Cameras | Compare | Register | Login
- [ ] AI chatbot is visible
- [ ] Comparison tool works
- [ ] Footer is present

### 2. Browse Cameras (/cameras.html)
- [ ] Page displays 32 camera cards
- [ ] Search bar is functional
- [ ] **Brand filters work:**
  - [ ] Sony
  - [ ] Canon
  - [ ] Nikon
  - [ ] Fujifilm
  - [ ] Other Brands
- [ ] **Price slider works:**
  - [ ] Move min slider
  - [ ] Move max slider
  - [ ] Price display updates
- [ ] **Sensor filters work:**
  - [ ] Full-Frame
  - [ ] APS-C
  - [ ] Micro Four Thirds
- [ ] **Use case filters work:**
  - [ ] Beginner
  - [ ] Professional
  - [ ] Video
  - [ ] Sports
  - [ ] Travel
  - [ ] Vlogging
- [ ] **Sort options work:**
  - [ ] Best Rated (default)
  - [ ] Price: Low to High
  - [ ] Price: High to Low
  - [ ] Newest First
  - [ ] Name (A-Z)
- [ ] Search finds cameras by name
- [ ] Search finds cameras by brand
- [ ] Clear filters button works
- [ ] Results count updates correctly
- [ ] "View Details" button works
- [ ] Camera cards show correct info

### 3. Camera Detail Page (/camera-detail.html?id=sony-a7-iv)

**Test with different cameras:**
- `sony-a7-iv`
- `canon-r6`
- `fujifilm-xs10`
- `nikon-z50`
- `invalid-id` (should show error)

- [ ] Camera image displays
- [ ] Name and brand correct
- [ ] Rating displays
- [ ] Price shows correctly
- [ ] AI Insight box present
- [ ] Use case tags displayed
- [ ] Pros list shows (green checkmarks)
- [ ] Cons list shows (red X marks)
- [ ] Specs grid displays all specifications
- [ ] Alternative cameras section loads
- [ ] Clicking alternative goes to that camera
- [ ] Breadcrumb navigation works
- [ ] "Compare This Camera" button responds
- [ ] Invalid camera ID shows error page
- [ ] Error page has "Browse All Cameras" link

### 4. User Registration (/register.html)

**Test Form Validation:**
- [ ] Username must be 3+ characters
- [ ] Email must be valid format
- [ ] Password must be 6+ characters
- [ ] Passwords must match
- [ ] Real-time validation on blur

**Test Registration:**
- [ ] Create new account:
  - Username: `testuser`
  - Email: `test@example.com`
  - Password: `test123`
- [ ] Success message shows
- [ ] Auto-redirect to login page
- [ ] Try registering duplicate username (should fail)
- [ ] Try registering duplicate email (should fail)

### 5. User Login (/login.html)

**Test Login:**
- [ ] Login with username
- [ ] Login with email
- [ ] Wrong password shows error
- [ ] Wrong username shows error
- [ ] Success redirects to homepage
- [ ] Navigation updates after login
- [ ] "Hello, username" appears

**Test Admin Login:**
- [ ] Login as admin/admin123
- [ ] "Admin" link appears in nav
- [ ] "Profile" link appears

### 6. User Profile (/profile.html)

**Without Login:**
- [ ] Redirects to login page
- [ ] Cannot access profile when logged out

**With Login:**
- [ ] Profile loads successfully
- [ ] Avatar shows first letter of username
- [ ] Username displays correctly
- [ ] Email displays correctly
- [ ] Role badge shows (User/Admin)
- [ ] Member since date shows

**Edit Email:**
- [ ] Change email to new address
- [ ] Click "Save Changes"
- [ ] Success message appears
- [ ] Email updates in sidebar
- [ ] Try duplicate email (should fail)

**Change Password:**
- [ ] Enter current password
- [ ] Enter new password (6+ chars)
- [ ] Confirm new password
- [ ] Click "Update Password"
- [ ] Success message appears
- [ ] Form resets
- [ ] Wrong current password fails
- [ ] Mismatched passwords fail
- [ ] Short password fails

**Delete Account:**
- [ ] Click "Delete Account"
- [ ] First confirmation dialog
- [ ] Second warning dialog
- [ ] Account deleted
- [ ] Redirects to homepage
- [ ] Cannot login with deleted account

### 7. Admin Dashboard (/admin.html)

**Access:**
- [ ] Login as admin
- [ ] Visit /admin.html
- [ ] Page loads (shows user list)
- [ ] Regular user cannot access (gets 401)

**Admin Features:**
- [ ] User table displays
- [ ] All users shown
- [ ] Username, email, role, created date visible
- [ ] Edit button works
- [ ] Delete button works
- [ ] Can change user role
- [ ] Can update user email
- [ ] Can change user password
- [ ] Profile link in nav works

### 8. Navigation Consistency

**Check all pages have:**
- [ ] index.html - Home | Browse Cameras | Compare + auth links
- [ ] cameras.html - Home | Browse Cameras | Compare + auth links
- [ ] camera-detail.html - Home | Browse Cameras | Compare + auth links
- [ ] login.html - Home | Browse Cameras | Register
- [ ] register.html - Home | Browse Cameras | Login
- [ ] admin.html - Home | Browse Cameras | Profile | Admin | Logout
- [ ] profile.html - Home | Browse Cameras | Compare + auth links

**When Logged Out:**
- [ ] Shows: Register | Login
- [ ] No Profile link
- [ ] No Admin link

**When Logged In (User):**
- [ ] Shows: Hello, username | Profile | Logout
- [ ] No Register link
- [ ] No Login link
- [ ] No Admin link

**When Logged In (Admin):**
- [ ] Shows: Hello, admin | Profile | Admin | Logout
- [ ] Admin link visible
- [ ] Profile link visible

### 9. API Endpoints

**Test in Browser Console:**

```javascript
// Get all cameras
fetch('/api/cameras')
  .then(r => r.json())
  .then(d => console.log('Cameras:', d.length));
// Should show: 32

// Get specific camera
fetch('/api/cameras/sony-a7-iv')
  .then(r => r.json())
  .then(console.log);
// Should show camera details

// Get non-existent camera
fetch('/api/cameras/fake-id')
  .then(r => r.json())
  .then(console.log);
// Should show error

// Get current user (when logged in)
fetch('/api/auth/me')
  .then(r => r.json())
  .then(console.log);
// Should show user info or 401
```

### 10. Mobile Responsiveness

**Test on narrow viewport (<768px):**
- [ ] Navigation is readable
- [ ] Filters sidebar on cameras.html
- [ ] Camera grid adapts (1-2 columns)
- [ ] Camera detail hero stacks
- [ ] Profile sidebar stacks
- [ ] Forms are usable
- [ ] Buttons are touch-friendly

---

## 🐛 Common Issues & Solutions

### Issue: "Cannot GET /cameras.html"
**Solution:** Make sure server is running (`npm start`)

### Issue: "Failed to load cameras"
**Solution:** 
- Check `cameras.json` is valid JSON
- Restart server
- Check browser console for errors

### Issue: Profile redirects to login
**Solution:** This is correct! Profile requires authentication. Login first.

### Issue: Admin page shows 401
**Solution:** Login as admin (username: `admin`, password: `admin123`)

### Issue: Camera detail shows "not found"
**Solution:** Check the camera ID in URL is correct (e.g., `sony-a7-iv` not `Sony a7 IV`)

### Issue: Filters not working
**Solution:**
- Check browser console for errors
- Try refreshing the page
- Clear browser cache

### Issue: Navigation not updating after login
**Solution:**
- Check `auth.js` is loaded
- Look for JS errors in console
- Try hard refresh (Ctrl+Shift+R)

---

## 📊 Expected Results

### Browse Page Performance
- **Total Cameras:** 32
- **Brands:** 10 unique brands
- **Price Range:** $449 - $6,498
- **Sensors:** Full-Frame, APS-C, M43, 1-inch
- **Use Cases:** 15+ different tags

### Search Results Examples
- Search "Sony" → 7 results
- Search "Canon" → 5 results
- Search "Beginner" → 5+ results
- Search "Video" → 10+ results
- Search "Full-Frame" → 0 (search is by name/brand, not specs)

### Filter Combinations
- Brand: Sony + Sensor: Full-Frame → 4-5 cameras
- Price: $0-$1000 + Use Case: Beginner → 3-4 cameras
- Use Case: Video + Use Case: Professional → Multiple results

---

## ✅ All Tests Passing?

If all checkboxes are checked and no errors occur:

**🎉 Congratulations! Priority 1 features are fully functional!**

You now have:
- ✅ 32 cameras in database
- ✅ Full browse page with filters
- ✅ Individual camera detail pages
- ✅ User profile management
- ✅ Consistent navigation
- ✅ Working search functionality

**Ready for Priority 2 features or deployment!**

---

## 📝 Notes for Development

- Sessions are in-memory (lost on server restart)
- Passwords are plain text (prototype only)
- All camera images use Unsplash placeholders
- Admin user: admin/admin123
- Test user: testuser/test123 (if you created it)

---

## 🚀 Next Steps

After testing is complete:
1. ✅ Priority 1 features verified
2. Optional: Implement Priority 2 features
3. Optional: Add real camera images
4. Optional: Implement password hashing
5. Optional: Deploy to production

---

**Happy Testing! 🎊**






