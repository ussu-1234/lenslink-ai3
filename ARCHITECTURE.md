<<<<<<< HEAD
# LensLink AI - System Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT SIDE                           │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  index.html  │  │  login.html  │  │register.html │      │
│  │  (Home Page) │  │ (Login Page) │  │  (Register)  │      │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘      │
│         │                  │                  │               │
│         │   ┌──────────────┴──────────────────┘              │
│         │   │                                                 │
│         │   │         ┌──────────────┐                       │
│         └───┼─────────┤  admin.html  │                       │
│             │         │ (Admin Panel)│                       │
│             │         └──────┬───────┘                       │
│             │                │                                │
│             │   ┌────────────┴────────────┐                  │
│             └───┤  public/js/auth.js      │                  │
│                 │  (Auth Utilities)       │                  │
│                 └─────────────────────────┘                  │
│                                                               │
└───────────────────────────┬─────────────────────────────────┘
                            │
                     HTTP/REST API
                            │
┌───────────────────────────┴─────────────────────────────────┐
│                        SERVER SIDE                           │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌─────────────────────────────────────────────────────┐    │
│  │                  server.js                          │    │
│  │              (Express.js Server)                     │    │
│  ├─────────────────────────────────────────────────────┤    │
│  │                                                      │    │
│  │  Middleware:                                         │    │
│  │  ├─ express.static()  (Serve HTML/JS/CSS)          │    │
│  │  ├─ express.json()    (Parse JSON bodies)          │    │
│  │  └─ express-session() (Session management)          │    │
│  │                                                      │    │
│  │  Auth Middleware:                                    │    │
│  │  ├─ requireAuth()     (Check if logged in)          │    │
│  │  └─ requireAdmin()    (Check if admin)              │    │
│  │                                                      │    │
│  │  Routes:                                             │    │
│  │  ┌───────────────────────────────────────────┐     │    │
│  │  │ Authentication Routes (/api/auth)         │     │    │
│  │  │  POST   /register  - Create new user      │     │    │
│  │  │  POST   /login     - Login user           │     │    │
│  │  │  POST   /logout    - Logout user          │     │    │
│  │  │  GET    /me        - Get current user     │     │    │
│  │  └───────────────────────────────────────────┘     │    │
│  │                                                      │    │
│  │  ┌───────────────────────────────────────────┐     │    │
│  │  │ Admin Routes (/api/admin) [Admin Only]    │     │    │
│  │  │  GET    /users     - List all users       │     │    │
│  │  │  PUT    /users/:id - Update user          │     │    │
│  │  │  DELETE /users/:id - Delete user          │     │    │
│  │  └───────────────────────────────────────────┘     │    │
│  │                                                      │    │
│  │  ┌───────────────────────────────────────────┐     │    │
│  │  │ Camera Routes (/api)                      │     │    │
│  │  │  GET    /cameras           - List cameras │     │    │
│  │  │  GET    /compare/:c1/:c2   - Compare      │     │    │
│  │  └───────────────────────────────────────────┘     │    │
│  │                                                      │    │
│  └──────────────────────┬───────────────────────────────┘    │
│                         │                                     │
│                         ▼                                     │
│  ┌─────────────────────────────────────────────────────┐    │
│  │              Database Layer (JSON Files)            │    │
│  ├─────────────────────────────────────────────────────┤    │
│  │                                                      │    │
│  │  ┌─────────────────┐      ┌─────────────────┐     │    │
│  │  │  users.json     │      │  cameras.json   │     │    │
│  │  ├─────────────────┤      ├─────────────────┤     │    │
│  │  │ - id            │      │ - name          │     │    │
│  │  │ - username      │      │ - insight       │     │    │
│  │  │ - email         │      │ - image         │     │    │
│  │  │ - password      │      │ - use_case      │     │    │
│  │  │ - role          │      │ - specs         │     │    │
│  │  │ - created_at    │      └─────────────────┘     │    │
│  │  └─────────────────┘                               │    │
│  │                                                      │    │
│  └──────────────────────────────────────────────────────┘    │
│                                                               │
└───────────────────────────────────────────────────────────────┘
```

## Authentication Flow

```
┌──────────┐                                  ┌──────────┐
│  Client  │                                  │  Server  │
└────┬─────┘                                  └────┬─────┘
     │                                             │
     │  1. POST /api/auth/login                   │
     │  { username, password }                    │
     ├────────────────────────────────────────────>
     │                                             │
     │              2. Validate credentials        │
     │                 (check users.json)          │
     │                                             │
     │              3. Create session              │
     │                 req.session.userId          │
     │                                             │
     │  4. Return user data (no password)         │
     <────────────────────────────────────────────┤
     │  { id, username, email, role }             │
     │                                             │
     │  5. Subsequent requests include            │
     │     session cookie automatically           │
     │                                             │
     │  6. GET /api/auth/me                       │
     ├────────────────────────────────────────────>
     │                                             │
     │              7. Verify session              │
     │                 from req.session            │
     │                                             │
     │  8. Return user info                       │
     <────────────────────────────────────────────┤
     │                                             │
```

## Admin Operations Flow

```
┌──────────┐                                  ┌──────────┐
│  Admin   │                                  │  Server  │
│  Client  │                                  │          │
└────┬─────┘                                  └────┬─────┘
     │                                             │
     │  1. GET /api/admin/users                   │
     ├────────────────────────────────────────────>
     │                                             │
     │         2. Check requireAdmin middleware   │
     │            - Verify session exists          │
     │            - Check user.role === 'admin'    │
     │                                             │
     │         3. Load users from users.json       │
     │            - Remove password field          │
     │                                             │
     │  4. Return sanitized user list             │
     <────────────────────────────────────────────┤
     │  [ { id, username, email, role, ...} ]     │
     │                                             │
     │  5. PUT /api/admin/users/:id               │
     │  { email, role, password }                 │
     ├────────────────────────────────────────────>
     │                                             │
     │         6. Validate admin permission        │
     │         7. Update user in memory            │
     │         8. Save to users.json               │
     │                                             │
     │  9. Return success                         │
     <────────────────────────────────────────────┤
     │                                             │
```

## Session Management

```
Session Storage (In-Memory)
────────────────────────────
When user logs in:
  req.session.userId = user.id
  req.session.username = user.username
  req.session.role = user.role

Session Cookie:
  - HttpOnly: true (not accessible via JS)
  - MaxAge: 24 hours
  - Secure: false (set true in production with HTTPS)

Session Persistence:
  - Stored in server memory
  - Lost on server restart
  - For production: use Redis or database
```

## Data Flow Diagram

```
┌─────────────────────────────────────────────────────┐
│                  User Registration                   │
└─────────────────────────────────────────────────────┘

  register.html
       │
       │ User submits form
       ▼
  Client validation
  (email, password match, length)
       │
       │ POST /api/auth/register
       │ { username, email, password }
       ▼
  Server validation
  (uniqueness, length)
       │
       │ Generate ID
       ▼
  Create user object
       │
       │ Push to userList[]
       ▼
  Save to users.json
       │
       │ Return success
       ▼
  Redirect to login.html


┌─────────────────────────────────────────────────────┐
│                   Admin User Edit                    │
└─────────────────────────────────────────────────────┘

  admin.html (click Edit)
       │
       │ Load user data into modal
       ▼
  User modifies fields
  (email, role, password)
       │
       │ Submit form
       ▼
  PUT /api/admin/users/:id
  { email, role, password }
       │
       │ requireAdmin middleware
       ▼
  Validate admin permission
       │
       │ Find user by ID
       ▼
  Update fields in memory
       │
       │ Write to users.json
       ▼
  Return updated user
       │
       │ Reload user table
       ▼
  Display success message
```

## Security Layers

```
┌─────────────────────────────────────────────────────┐
│                  Security Model                      │
├─────────────────────────────────────────────────────┤
│                                                      │
│  Layer 1: Client-Side Validation                    │
│  ├─ Email format check                              │
│  ├─ Password length (6+ chars)                      │
│  ├─ Username length (3+ chars)                      │
│  └─ Password confirmation match                     │
│                                                      │
│  Layer 2: Server-Side Validation                    │
│  ├─ Input presence check                            │
│  ├─ Length requirements                             │
│  ├─ Username/email uniqueness                       │
│  └─ Email already used check                        │
│                                                      │
│  Layer 3: Session Security                          │
│  ├─ HttpOnly cookies                                │
│  ├─ Session timeout (24h)                           │
│  └─ Server-side session storage                     │
│                                                      │
│  Layer 4: Route Protection                          │
│  ├─ requireAuth middleware                          │
│  ├─ requireAdmin middleware                         │
│  └─ Session verification                            │
│                                                      │
│  Layer 5: Data Sanitization                         │
│  ├─ Password excluded from responses                │
│  └─ User data sanitized for API                     │
│                                                      │
└─────────────────────────────────────────────────────┘
```

## Technology Stack

```
Frontend:
  ├─ HTML5
  ├─ CSS3 (Dark Theme)
  └─ Vanilla JavaScript

Backend:
  ├─ Node.js
  ├─ Express.js 4.x
  └─ express-session

Database:
  └─ JSON Files (users.json, cameras.json)

Session Store:
  └─ In-Memory (MemoryStore)
```

## File Dependencies

```
server.js
  ├─ Requires: express, express-session, fs, path, crypto
  ├─ Loads: users.json, cameras.json
  └─ Serves: index.html, login.html, register.html, admin.html

index.html
  └─ Includes: public/js/auth.js

login.html
  └─ Standalone (inline scripts)

register.html
  └─ Standalone (inline scripts)

admin.html
  ├─ Includes: public/js/auth.js
  └─ Requires: Admin session

public/js/auth.js
  └─ Utility functions for all pages
```

## Scalability Considerations

### Current (Prototype)
- Single server instance
- In-memory sessions
- File-based storage
- Suitable for: Development, Learning, Demo

### For Production Scale
```
Load Balancer
    │
    ├─ Server 1 ─┐
    ├─ Server 2 ─┼─> Redis (Sessions)
    └─ Server 3 ─┘
         │
         └─> PostgreSQL/MongoDB (Database)
```

Improvements needed:
- Sticky sessions or shared session store
- Database with connection pooling
- Horizontal scaling capability
- CDN for static assets
- Caching layer (Redis)
- Message queue for async operations






=======
# LensLink AI - System Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT SIDE                           │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  index.html  │  │  login.html  │  │register.html │      │
│  │  (Home Page) │  │ (Login Page) │  │  (Register)  │      │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘      │
│         │                  │                  │               │
│         │   ┌──────────────┴──────────────────┘              │
│         │   │                                                 │
│         │   │         ┌──────────────┐                       │
│         └───┼─────────┤  admin.html  │                       │
│             │         │ (Admin Panel)│                       │
│             │         └──────┬───────┘                       │
│             │                │                                │
│             │   ┌────────────┴────────────┐                  │
│             └───┤  public/js/auth.js      │                  │
│                 │  (Auth Utilities)       │                  │
│                 └─────────────────────────┘                  │
│                                                               │
└───────────────────────────┬─────────────────────────────────┘
                            │
                     HTTP/REST API
                            │
┌───────────────────────────┴─────────────────────────────────┐
│                        SERVER SIDE                           │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌─────────────────────────────────────────────────────┐    │
│  │                  server.js                          │    │
│  │              (Express.js Server)                     │    │
│  ├─────────────────────────────────────────────────────┤    │
│  │                                                      │    │
│  │  Middleware:                                         │    │
│  │  ├─ express.static()  (Serve HTML/JS/CSS)          │    │
│  │  ├─ express.json()    (Parse JSON bodies)          │    │
│  │  └─ express-session() (Session management)          │    │
│  │                                                      │    │
│  │  Auth Middleware:                                    │    │
│  │  ├─ requireAuth()     (Check if logged in)          │    │
│  │  └─ requireAdmin()    (Check if admin)              │    │
│  │                                                      │    │
│  │  Routes:                                             │    │
│  │  ┌───────────────────────────────────────────┐     │    │
│  │  │ Authentication Routes (/api/auth)         │     │    │
│  │  │  POST   /register  - Create new user      │     │    │
│  │  │  POST   /login     - Login user           │     │    │
│  │  │  POST   /logout    - Logout user          │     │    │
│  │  │  GET    /me        - Get current user     │     │    │
│  │  └───────────────────────────────────────────┘     │    │
│  │                                                      │    │
│  │  ┌───────────────────────────────────────────┐     │    │
│  │  │ Admin Routes (/api/admin) [Admin Only]    │     │    │
│  │  │  GET    /users     - List all users       │     │    │
│  │  │  PUT    /users/:id - Update user          │     │    │
│  │  │  DELETE /users/:id - Delete user          │     │    │
│  │  └───────────────────────────────────────────┘     │    │
│  │                                                      │    │
│  │  ┌───────────────────────────────────────────┐     │    │
│  │  │ Camera Routes (/api)                      │     │    │
│  │  │  GET    /cameras           - List cameras │     │    │
│  │  │  GET    /compare/:c1/:c2   - Compare      │     │    │
│  │  └───────────────────────────────────────────┘     │    │
│  │                                                      │    │
│  └──────────────────────┬───────────────────────────────┘    │
│                         │                                     │
│                         ▼                                     │
│  ┌─────────────────────────────────────────────────────┐    │
│  │              Database Layer (JSON Files)            │    │
│  ├─────────────────────────────────────────────────────┤    │
│  │                                                      │    │
│  │  ┌─────────────────┐      ┌─────────────────┐     │    │
│  │  │  users.json     │      │  cameras.json   │     │    │
│  │  ├─────────────────┤      ├─────────────────┤     │    │
│  │  │ - id            │      │ - name          │     │    │
│  │  │ - username      │      │ - insight       │     │    │
│  │  │ - email         │      │ - image         │     │    │
│  │  │ - password      │      │ - use_case      │     │    │
│  │  │ - role          │      │ - specs         │     │    │
│  │  │ - created_at    │      └─────────────────┘     │    │
│  │  └─────────────────┘                               │    │
│  │                                                      │    │
│  └──────────────────────────────────────────────────────┘    │
│                                                               │
└───────────────────────────────────────────────────────────────┘
```

## Authentication Flow

```
┌──────────┐                                  ┌──────────┐
│  Client  │                                  │  Server  │
└────┬─────┘                                  └────┬─────┘
     │                                             │
     │  1. POST /api/auth/login                   │
     │  { username, password }                    │
     ├────────────────────────────────────────────>
     │                                             │
     │              2. Validate credentials        │
     │                 (check users.json)          │
     │                                             │
     │              3. Create session              │
     │                 req.session.userId          │
     │                                             │
     │  4. Return user data (no password)         │
     <────────────────────────────────────────────┤
     │  { id, username, email, role }             │
     │                                             │
     │  5. Subsequent requests include            │
     │     session cookie automatically           │
     │                                             │
     │  6. GET /api/auth/me                       │
     ├────────────────────────────────────────────>
     │                                             │
     │              7. Verify session              │
     │                 from req.session            │
     │                                             │
     │  8. Return user info                       │
     <────────────────────────────────────────────┤
     │                                             │
```

## Admin Operations Flow

```
┌──────────┐                                  ┌──────────┐
│  Admin   │                                  │  Server  │
│  Client  │                                  │          │
└────┬─────┘                                  └────┬─────┘
     │                                             │
     │  1. GET /api/admin/users                   │
     ├────────────────────────────────────────────>
     │                                             │
     │         2. Check requireAdmin middleware   │
     │            - Verify session exists          │
     │            - Check user.role === 'admin'    │
     │                                             │
     │         3. Load users from users.json       │
     │            - Remove password field          │
     │                                             │
     │  4. Return sanitized user list             │
     <────────────────────────────────────────────┤
     │  [ { id, username, email, role, ...} ]     │
     │                                             │
     │  5. PUT /api/admin/users/:id               │
     │  { email, role, password }                 │
     ├────────────────────────────────────────────>
     │                                             │
     │         6. Validate admin permission        │
     │         7. Update user in memory            │
     │         8. Save to users.json               │
     │                                             │
     │  9. Return success                         │
     <────────────────────────────────────────────┤
     │                                             │
```

## Session Management

```
Session Storage (In-Memory)
────────────────────────────
When user logs in:
  req.session.userId = user.id
  req.session.username = user.username
  req.session.role = user.role

Session Cookie:
  - HttpOnly: true (not accessible via JS)
  - MaxAge: 24 hours
  - Secure: false (set true in production with HTTPS)

Session Persistence:
  - Stored in server memory
  - Lost on server restart
  - For production: use Redis or database
```

## Data Flow Diagram

```
┌─────────────────────────────────────────────────────┐
│                  User Registration                   │
└─────────────────────────────────────────────────────┘

  register.html
       │
       │ User submits form
       ▼
  Client validation
  (email, password match, length)
       │
       │ POST /api/auth/register
       │ { username, email, password }
       ▼
  Server validation
  (uniqueness, length)
       │
       │ Generate ID
       ▼
  Create user object
       │
       │ Push to userList[]
       ▼
  Save to users.json
       │
       │ Return success
       ▼
  Redirect to login.html


┌─────────────────────────────────────────────────────┐
│                   Admin User Edit                    │
└─────────────────────────────────────────────────────┘

  admin.html (click Edit)
       │
       │ Load user data into modal
       ▼
  User modifies fields
  (email, role, password)
       │
       │ Submit form
       ▼
  PUT /api/admin/users/:id
  { email, role, password }
       │
       │ requireAdmin middleware
       ▼
  Validate admin permission
       │
       │ Find user by ID
       ▼
  Update fields in memory
       │
       │ Write to users.json
       ▼
  Return updated user
       │
       │ Reload user table
       ▼
  Display success message
```

## Security Layers

```
┌─────────────────────────────────────────────────────┐
│                  Security Model                      │
├─────────────────────────────────────────────────────┤
│                                                      │
│  Layer 1: Client-Side Validation                    │
│  ├─ Email format check                              │
│  ├─ Password length (6+ chars)                      │
│  ├─ Username length (3+ chars)                      │
│  └─ Password confirmation match                     │
│                                                      │
│  Layer 2: Server-Side Validation                    │
│  ├─ Input presence check                            │
│  ├─ Length requirements                             │
│  ├─ Username/email uniqueness                       │
│  └─ Email already used check                        │
│                                                      │
│  Layer 3: Session Security                          │
│  ├─ HttpOnly cookies                                │
│  ├─ Session timeout (24h)                           │
│  └─ Server-side session storage                     │
│                                                      │
│  Layer 4: Route Protection                          │
│  ├─ requireAuth middleware                          │
│  ├─ requireAdmin middleware                         │
│  └─ Session verification                            │
│                                                      │
│  Layer 5: Data Sanitization                         │
│  ├─ Password excluded from responses                │
│  └─ User data sanitized for API                     │
│                                                      │
└─────────────────────────────────────────────────────┘
```

## Technology Stack

```
Frontend:
  ├─ HTML5
  ├─ CSS3 (Dark Theme)
  └─ Vanilla JavaScript

Backend:
  ├─ Node.js
  ├─ Express.js 4.x
  └─ express-session

Database:
  └─ JSON Files (users.json, cameras.json)

Session Store:
  └─ In-Memory (MemoryStore)
```

## File Dependencies

```
server.js
  ├─ Requires: express, express-session, fs, path, crypto
  ├─ Loads: users.json, cameras.json
  └─ Serves: index.html, login.html, register.html, admin.html

index.html
  └─ Includes: public/js/auth.js

login.html
  └─ Standalone (inline scripts)

register.html
  └─ Standalone (inline scripts)

admin.html
  ├─ Includes: public/js/auth.js
  └─ Requires: Admin session

public/js/auth.js
  └─ Utility functions for all pages
```

## Scalability Considerations

### Current (Prototype)
- Single server instance
- In-memory sessions
- File-based storage
- Suitable for: Development, Learning, Demo

### For Production Scale
```
Load Balancer
    │
    ├─ Server 1 ─┐
    ├─ Server 2 ─┼─> Redis (Sessions)
    └─ Server 3 ─┘
         │
         └─> PostgreSQL/MongoDB (Database)
```

Improvements needed:
- Sticky sessions or shared session store
- Database with connection pooling
- Horizontal scaling capability
- CDN for static assets
- Caching layer (Redis)
- Message queue for async operations






>>>>>>> 855b85887c1b5502b7ae3c8a5a50561dfbe34d77
