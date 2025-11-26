# LensLink AI - Camera Comparison Platform

An intelligent camera comparison platform with user authentication and admin management.

## Features

- **AI Chatbot**: Interactive chatbot to help users find the perfect camera
- **AI Search**: Combined Gemini + SearxNG search for live results with AI summaries
- **Camera Comparison**: Side-by-side comparison of camera specifications
- **User Authentication**: Registration and login system
- **Admin Dashboard**: Manage user accounts, roles, and permissions
- **Session Management**: Secure session-based authentication

## Tech Stack

- **Backend**: Node.js + Express
- **Database**: JSON file storage (simple prototype)
- **Frontend**: Vanilla JavaScript with modern dark theme UI
- **Authentication**: Express-session (in-memory sessions)

## Installation

1. **Install Node.js** (if not already installed)
   - Download from [nodejs.org](https://nodejs.org/)
   - Recommended: LTS version

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Add API Keys (optional but recommended)**
   - Gemini Flash API key (for AI summaries)
   - SearxNG endpoint (defaults to `https://xng.quest.ac`)
   - Example PowerShell commands:
     ```powershell
     $env:GEMINI_API_KEY = "your_gemini_flash_api_key"
     $env:SEARXNG_URL = "https://xng.quest.ac"  # optional override
     ```

4. **Start the Server**
   ```bash
   npm start
   ```

5. **Access the Application**
   - Open your browser and navigate to: `http://localhost:3000`

## Default Admin Account

- **Username**: `admin`
- **Email**: `admin@lenslink.ai`
- **Password**: `admin123`

## File Structure

```
lenslink-ai3/
├── index.html          # Main landing page with camera comparison
├── login.html          # User login page
├── register.html       # User registration page
├── admin.html          # Admin dashboard for user management
├── server.js           # Express server with API routes
├── cameras.json        # Camera database
├── users.json          # User database
├── package.json        # Node.js dependencies
└── public/
    └── js/
        └── auth.js     # Client-side authentication utilities
```

## API Endpoints

### Authentication Routes
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user info

### Admin Routes (Admin Only)
- `GET /api/admin/users` - List all users
- `PUT /api/admin/users/:id` - Update user details
- `DELETE /api/admin/users/:id` - Delete a user

### Camera Routes
- `GET /api/cameras` - Get all cameras
- `GET /api/compare/:camera1/:camera2` - Compare two cameras
- `GET /api/search?q=` - AI search (Gemini summary + SearxNG results)

## Configuration

Set the following environment variables before running the server (see `env.example` for reference):

| Variable          | Description                                           | Required |
|-------------------|-------------------------------------------------------|----------|
| `GEMINI_API_KEY`  | Google Gemini Flash API key for AI summaries          | No (AI summary disabled if missing) |
| `SEARXNG_URL`     | SearxNG instance base URL (default `https://xng.quest.ac`) | No       |
| `PORT`            | Port for the Express server (default `3000`)          | No       |

## User Roles

- **User**: Can browse and compare cameras
- **Admin**: Can manage all user accounts + user permissions

## Security Notes

⚠️ **Important**: This is a prototype/learning application with simplified security:
- Passwords are stored in plain text
- Sessions are stored in memory (lost on server restart)
- No rate limiting or CSRF protection
- **NOT suitable for production use**

For production, consider:
- Using bcrypt for password hashing
- PostgreSQL/MongoDB for database
- JWT tokens or OAuth
- HTTPS/SSL certificates
- Environment variables for secrets
- Rate limiting and security headers

## Usage

### For Users
1. Visit the homepage to explore camera comparisons
2. Chat with the AI assistant for personalized recommendations
3. Register an account to save preferences (future feature)

### For Admins
1. Login with admin credentials
2. Navigate to the Admin Dashboard
3. View, edit, or delete user accounts
4. Assign admin roles to trusted users

## Development

To modify the application:

1. **Add new cameras**: Edit `cameras.json`
2. **Styling changes**: Edit the `<style>` sections in HTML files
3. **API changes**: Edit `server.js`
4. **Frontend logic**: Edit the `<script>` sections in HTML files

## Troubleshooting

**Server won't start:**
- Ensure Node.js is installed: `node -v`
- Check if port 3000 is available
- Verify `users.json` and `cameras.json` exist

**Can't login:**
- Check server console for errors
- Verify `users.json` is valid JSON
- Try the default admin account

**Session lost:**
- Sessions are in-memory and reset on server restart
- This is expected behavior for this prototype

## License

ISC

## Credits

Created as a prototype for learning full-stack web development.






