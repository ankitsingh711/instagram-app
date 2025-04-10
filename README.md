# Instagram Integration App

A full-stack MERN application that integrates with the Instagram API to display user profiles, media, and enable comment interactions.

## Features

- Instagram OAuth Login
- Display user profile information
- Show Instagram media feed
- View and reply to comments
- Modern UI with Material UI and Tailwind CSS
- TypeScript support
- Responsive design

## Prerequisites

- Node.js (v14 or higher)
- MongoDB
- Instagram Basic Display API credentials
- Facebook Developer Account

## Setup Instructions

1. Clone the repository:
```bash
git clone <repository-url>
cd instagram-integration-app
```

2. Install dependencies:
```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

3. Create environment files:

Backend (.env):
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/instagram-app
INSTAGRAM_APP_ID=your_app_id
INSTAGRAM_APP_SECRET=your_app_secret
INSTAGRAM_REDIRECT_URI=http://localhost:3000/auth/instagram/callback
CLIENT_URL=http://localhost:3000
```

4. Set up Instagram API:
- Create a Facebook Developer account
- Create a new app and add Instagram Basic Display
- Configure OAuth Redirect URI
- Add test users for development
- Copy App ID and App Secret to your .env file

## Running the Application

1. Start the backend server:
```bash
cd backend
npm run dev
```

2. Start the frontend development server:
```bash
cd frontend
npm run dev
```

3. Open your browser and navigate to `http://localhost:3000`

## Development Mode Testing

1. Use your Instagram test account credentials for login
2. No app review is needed for development mode
3. Add test users in the Facebook App Dashboard

## Deployment

1. Build the frontend:
```bash
cd frontend
npm run build
```

2. Deploy to your preferred hosting platform (Vercel, Netlify, etc.)
3. Update environment variables on your hosting platform
4. Submit app for review if planning to go live

## Tech Stack

- Frontend:
  - Next.js
  - TypeScript
  - Material UI
  - Tailwind CSS
  - React Query

- Backend:
  - Node.js
  - Express
  - MongoDB
  - TypeScript

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 