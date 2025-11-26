# LensLink AI - Camera Comparison Platform

An intelligent camera comparison platform with user authentication and admin management.

## Features

- **AI Chatbot**: Interactive chatbot to help users find the perfect camera
- **AI Search**: Combined Gemini + SearxNG search for live results with AI summaries
- **Camera Comparison**: Side-by-side comparison of camera specifications
- **User Authentication**: Registration and login system
- **Admin Dashboard**: Manage user accounts, roles, and permissions
- **Session Management**: Secure session-based authentication
- **Multi-language Support**: English, Thai, and Spanish
- **Modern UI**: Glassmorphism design with dark/light theme

## Tech Stack

- **Backend**: Node.js + Express
- **Database**: JSON file storage (simple prototype)
- **Frontend**: Vanilla JavaScript with modern dark theme UI
- **Authentication**: Express-session (in-memory sessions)
- **Deployment**: Docker + Docker Compose + Nginx Proxy Manager

## Quick Start

### Local Development

1. **Install Node.js** (if not already installed)
   - Download from [nodejs.org](https://nodejs.org/)
   - Recommended: LTS version

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment** (optional)
   ```bash
   cp env.example .env
   # Edit .env with your API keys
   ```

4. **Start the Server**
   ```bash
   npm start
   ```

5. **Access the Application**
   - Open your browser and navigate to: `http://localhost:3000`

### Docker Deployment (Recommended for Production)

#### With Existing Nginx Proxy Manager

If you already have Nginx Proxy Manager running:

1. **Quick Guide**: [`DEPLOYMENT_WITH_EXISTING_NPM.md`](DEPLOYMENT_WITH_EXISTING_NPM.md) ⭐ **Start here!**
2. **Full Documentation**: [`NGINX_PROXY_MANAGER_DEPLOYMENT.md`](NGINX_PROXY_MANAGER_DEPLOYMENT.md)

**Quick Deploy:**
```bash
chmod +x deploy.sh
./deploy.sh
# Script will auto-detect NPM and connect networks
```

#### Installing NPM from Scratch

If you need to install Nginx Proxy Manager:

1. **Quick Guide**: [`DEPLOYMENT_WITH_NPM.md`](DEPLOYMENT_WITH_NPM.md)
2. **Full Documentation**: [`NGINX_PROXY_MANAGER_DEPLOYMENT.md`](NGINX_PROXY_MANAGER_DEPLOYMENT.md)

#### Standalone Docker

```bash
docker-compose up -d --build
```

See [`DOCKER_DEPLOYMENT.md`](DOCKER_DEPLOYMENT.md) for detailed instructions.

## Default Admin Account

- **Username**: `admin`
- **Email**: `admin@lenslink.ai`
- **Password**: `admin123`

⚠️ **Change this immediately in production!**

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
├── Dockerfile          # Docker container definition
├── docker-compose.yml  # Docker Compose configuration
├── deploy.sh           # Automated deployment script
└── public/
    └── js/
        ├── auth.js     # Client-side authentication utilities
        ├── language.js # Language switching functionality
        └── translations.js # Translation strings
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

Set the following environment variables (see `env.example` for reference):

| Variable          | Description                                           | Required |
|-------------------|-------------------------------------------------------|----------|
| `GEMINI_API_KEY`  | Google Gemini Flash API key for AI summaries          | No (AI summary disabled if missing) |
| `SEARXNG_URL`     | SearxNG instance base URL (default `https://xng.quest.ac`) | No       |
| `PORT`            | Port for the Express server (default `3000`)          | No       |
| `SESSION_SECRET`  | Secret key for session encryption (generate with `openssl rand -hex 32`) | Yes (production) |
| `HTTPS`           | Enable HTTPS (set to `true` if using SSL, `false` if using reverse proxy) | No |

## User Roles

- **User**: Can browse and compare cameras
- **Admin**: Can manage all user accounts + user permissions

## Deployment Documentation

- **Quick Deploy with NPM**: [`DEPLOYMENT_WITH_NPM.md`](DEPLOYMENT_WITH_NPM.md) - Fast setup guide
- **Full NPM Guide**: [`NGINX_PROXY_MANAGER_DEPLOYMENT.md`](NGINX_PROXY_MANAGER_DEPLOYMENT.md) - Comprehensive NPM setup
- **Docker Deployment**: [`DOCKER_DEPLOYMENT.md`](DOCKER_DEPLOYMENT.md) - Standalone Docker setup
- **Quick Reference**: [`QUICK_DEPLOY.md`](QUICK_DEPLOY.md) - Essential commands

## Security Notes

⚠️ **Important**: This is a prototype/learning application with simplified security:
- Passwords are stored in plain text
- Sessions are stored in memory (lost on server restart)
- No rate limiting or CSRF protection
- **NOT suitable for production use without modifications**

For production, consider:
- Using bcrypt for password hashing
- PostgreSQL/MongoDB for database
- JWT tokens or OAuth
- HTTPS/SSL certificates (use Nginx Proxy Manager)
- Environment variables for secrets
- Rate limiting and security headers

## Usage

### For Users
1. Visit the homepage to explore camera comparisons
2. Use AI search for personalized recommendations
3. Compare cameras side-by-side
4. Register an account to save favorites
5. Switch languages (English, Thai, Spanish)

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
5. **Translations**: Edit `public/js/translations.js`

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

**Docker issues:**
- Check logs: `docker logs lenslink-ai`
- Verify `.env` file exists and is configured
- Ensure Docker and Docker Compose are installed

**NPM connection issues:**
- Verify NPM is connected to LensLink network: `docker network inspect lenslink-network`
- Check container names match in NPM proxy host configuration
- See `NGINX_PROXY_MANAGER_DEPLOYMENT.md` for detailed troubleshooting

## License

ISC

## Credits

Created as a prototype for learning full-stack web development.
