# Authentication API

A Node.js authentication API built with Express.js and MongoDB.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a .env file in the root directory with the following content:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/auth_db
JWT_SECRET=your-secret-key
```

3. Make sure MongoDB is running locally

4. Start the server:
```bash
npm start
```

## API Endpoints

### POST /api/auth/signup
Register a new user
```json
{
    "username": "example",
    "email": "example@email.com",
    "password": "password123"
}
```

### POST /api/auth/login
Login with existing credentials
```json
{
    "email": "example@email.com",
    "password": "password123"
}
```
