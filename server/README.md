# 🍎 NutriFit AI Backend

Express.js + MongoDB + JWT authentication backend for the NutriFit AI nutrition app.

## 📁 Project Structure

```
server/
├── models/
│   ├── User.js              # User schema with password hashing
│   ├── PhotoAnalysis.js     # Photo meal analysis records
│   └── VoiceAnalysis.js     # Voice consultation analysis
├── routes/
│   ├── auth.js              # Auth endpoints (signup, login)
│   ├── photo.js             # Photo analysis endpoints
│   └── voice.js             # Voice analysis endpoints
├── middleware/
│   └── auth.js              # JWT protection middleware
├── .env                     # Environment variables
├── server.js                # Express app entry point
└── package.json             # Dependencies
```

## 🚀 Setup & Installation

### 1. Install Dependencies

```bash
cd server
npm install
```

### 2. Configure Environment

Edit `.env` file with your actual values:

```env
PORT=5000
MONGO_URI=mongodb+srv://your_user:your_password@cluster.mongodb.net/nutrifit-ai
JWT_SECRET=your_strong_secret_key_at_least_32_chars
PYTHON_VOICE_URL=https://your-voice-api.com/analyze
VOICE_API_TOKEN=your_voice_api_token
PHOTO_URL=https://your-photo-api.com/api/analyze-food
NODE_ENV=development
```

### 3. Start the Server

**Development** (with auto-reload):

```bash
npm run dev
```

**Production**:

```bash
npm start
```

The server will run on `http://localhost:5000`

## 📡 API Endpoints

### Authentication

| Endpoint           | Method | Description             |
| ------------------ | ------ | ----------------------- |
| `/api/auth/signup` | POST   | Create new user account |
| `/api/auth/login`  | POST   | Login and get JWT token |

**Signup Request**:

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepass123"
}
```

**Login Request**:

```json
{
  "email": "john@example.com",
  "password": "securepass123"
}
```

### Photo Analysis

| Endpoint             | Method | Auth | Description               |
| -------------------- | ------ | ---- | ------------------------- |
| `/api/photo/analyze` | POST   | ✅   | Analyze meal photo        |
| `/api/photo/history` | GET    | ✅   | Get user's photo analyses |

**Analyze Photo Request**:

```json
{
  "imageUrl": "https://example.com/meal.jpg"
}
```

or with base64:

```json
{
  "base64Image": "data:image/jpeg;base64,..."
}
```

### Voice Analysis

| Endpoint             | Method | Auth | Description                |
| -------------------- | ------ | ---- | -------------------------- |
| `/api/voice/analyze` | POST   | ✅   | Analyze voice consultation |
| `/api/voice/history` | GET    | ✅   | Get user's voice analyses  |

**Analyze Voice Request**:

```json
{
  "audioUrl": "https://example.com/audio.wav"
}
```

or with base64:

```json
{
  "base64Audio": "data:audio/wav;base64,..."
}
```

## 🔐 Authentication

All protected endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

## 💾 Database Models

### User

- `name`: String (required)
- `email`: String (required, unique)
- `password`: String (hashed, required)
- `createdAt`, `updatedAt`: Timestamps

### PhotoAnalysis

- `userId`: Reference to User
- `imageUrl`: String
- `detectedFoods`: Array of food items
- `nutritionData`: Calories, protein, carbs, fat, fiber
- `confidence`: 0-1 score
- `analysisDate`: Timestamp

### VoiceAnalysis

- `userId`: Reference to User
- `audioUrl`: String
- `transcript`: Transcribed text
- `toneEmotion`: Primary, secondary, confidence
- `keyHealthConcerns`: Array of health issues detected
- `dietaryHabits`: Array of dietary patterns
- `suggestedImprovements`: Array of recommendations
- `personalizedNutrition`: Calorie target, macros, meal plan
- `followUpQuestions`: Array of questions for patient
- `analysisDate`: Timestamp

## 🔧 Configuration

The backend automatically falls back to mock data if external APIs fail, making it great for development and demos without needing real API keys initially.

To use real external APIs:

1. Get API keys from your photo and voice analysis services
2. Update `.env` with your actual URLs and tokens
3. The same code will work with real APIs

## 📦 Dependencies

- **express**: Web framework
- **mongoose**: MongoDB ODM
- **jsonwebtoken**: JWT generation and verification
- **bcryptjs**: Password hashing
- **cors**: Cross-origin requests
- **axios**: HTTP client for external APIs
- **dotenv**: Environment variables
- **nodemon**: Development auto-reload

## Troubleshooting

### MongoDB Connection Failed

- Verify your MongoDB URI in `.env`
- Check your IP is whitelisted in MongoDB Atlas
- Ensure database user has correct permissions

### JWT Token Errors

- Token may have expired (they expire in 7 days)
- Get a new token by logging in again
- Verify token is in correct format: `Authorization: Bearer <token>`

### External API Failures

- Backend automatically returns mock data on API failure
- Check your API URLs and tokens in `.env`
- Proxy/CORS issues can block external requests

## 🎯 Integration with Frontend

The frontend (React/Vite) should:

1. **Store JWT token** from login/signup response
2. **Include token** in Authorization header for all protected requests
3. **Update API_URL** in frontend `.env` to point to backend (e.g., `http://localhost:5000/api`)
4. **Handle token expiration** by redirecting to login

Example React fetch:

```javascript
const token = localStorage.getItem("token");
const response = await fetch("http://localhost:5000/api/photo/analyze", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({ imageUrl: "..." }),
});
```

---

✨ **Backend ready for NutriFit AI!** Connect your React frontend and start analyzing meals and voice consultations.
