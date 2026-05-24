# Medical Chatbot Integration - Setup & Testing Guide

## 📋 Overview

The Medical Chatbot integration connects NutriFit AI to an existing Python-based medical AI service running on port 5001. The architecture consists of:

- **Backend**: Node.js/Express proxy routes forwarding requests to Python API
- **Frontend**: React chat component with message history and image upload support
- **Python API**: External medical chatbot service on port 5001

## 🔧 Backend Setup

### Prerequisites

- Node.js v16+ (already installed)
- form-data package (already installed as axios dependency)
- Environment variables configured in `.env`

### Files Created/Modified

**New Files:**

- `server/routes/health.js` - Express proxy routes for health questions
- `src/components/HealthChat.jsx` - React chat UI component
- `src/pages/HealthPage.jsx` - Health page wrapper
- `src/routes/health.js` (already mounted) - Routes defined

**Modified Files:**

- `server/server.js` - Added health routes import and mounting
- `src/App.jsx` - Added HealthPage route and import
- `src/components/NavBar.jsx` - Added "Health Assistant" link

### API Routes

**Endpoints:**

1. **POST `/api/health/question`** (Protected)
   - Text + optional image upload
   - Multipart form data
   - Forwards to Python API at `/api/health-question`

   ```bash
   curl -X POST http://localhost:5000/api/health/question \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -F "question=What are symptoms of dehydration?" \
     -F "image=@medical_image.jpg"
   ```

2. **POST `/api/health/question-text`** (Protected)
   - Text-only health questions
   - JSON request body
   - Forwards to Python API at `/api/health-question-text`

   ```bash
   curl -X POST http://localhost:5000/api/health/question-text \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"question":"What should I eat before exercise?"}'
   ```

3. **GET `/api/health/status`** (Public)
   - Check if Python medical AI is available
   - No authentication required
   - Returns connection status

### Environment Configuration

Add to `server/.env`:

```env
# Python Medical AI Service
PYTHON_HEALTH_API=http://localhost:5001

# Other existing vars...
PORT=5000
MONGO_URI=...
JWT_SECRET=...
```

## 🚀 Running the Services

### 1. Start Python Medical AI (Port 5001)

```bash
# Assuming you have the Python chatbot repo
cd path/to/medical-chatbot
python app.py
# or
python -m uvicorn main:app --port 5001
```

Should see: "Running on http://localhost:5001"

### 2. Start Backend Node Server (Port 5000)

```bash
cd d:\aNutrifit\ Ai1\server
npm run dev
# or
npm start
```

Should see: "🚀 Server is running on http://localhost:5000"

### 3. Start Frontend React Dev Server (Port 5173/5175)

```bash
cd d:\aNutrifit\ Ai1
npm run dev
# or
npm start
```

Should see: "VITE v5.x.x ready in xxx ms"

## 🧪 Testing the Integration

### Test 1: Check Service Status

```bash
# Terminal
curl http://localhost:5000/api/health/status

# Expected response:
{
  "status": "ok",
  "python_api": {...}  // Python service response
}
```

### Test 2: Manual API Test (Text Only)

```bash
# Get JWT token first by logging in
# Then use token in request:

curl -X POST http://localhost:5000/api/health/question-text \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "question": "What are the symptoms of dehydration?"
  }'

# Expected response:
{
  "success": true,
  "data": {
    "answer": "...",
    "recommendation": "...",
    ...
  }
}
```

### Test 3: Frontend UI Testing

1. Open http://localhost:5173 in browser
2. Sign up or log in
3. Click "Health Assistant" in navbar
4. Wait for status indicator to show "Medical AI Connected"
5. Type a health question: "What should I eat before workout?"
6. Click "Ask Health Question"
7. Wait for AI response (should appear in chat within 10-30 seconds)
8. Try uploading a medical image and asking about it

### Test 4: Image Upload Test

1. Navigate to Health Assistant page
2. Select an image file (JPG, PNG, GIF, etc., max 10MB)
3. Type a question: "What does this image show?"
4. Submit and verify:
   - Image preview displays
   - Backend receives multipart request
   - Python API receives image
   - Response appears in chat

### Test 5: Error Handling Tests

- Stop Python API and try sending question → Should show "Medical AI service unavailable"
- Send empty question → Form prevents submission
- Upload non-image file → Error: "Only image files allowed"
- Send very large image (>10MB) → multer rejects with 413 Payload Too Large

## 📊 Frontend Components

### HealthChat.jsx Structure

```
<HealthChat>
  ├── Status Indicator (Connected/Disconnected)
  ├── Chat Messages Area
  │   ├── User messages (blue, right-aligned)
  │   ├── AI responses (gray, left-aligned)
  │   ├── Error messages (red)
  │   └── Image previews
  ├── Input Form
  │   ├── Textarea for question
  │   ├── File input for image
  │   ├── Image preview with remove button
  │   └── Submit button
  └── Tips section
```

### HealthPage.jsx

Simple wrapper that renders `<HealthChat>` component

## 🔐 Security & Limits

**Backend:**

- JWT protection on all health endpoints
- Image size limit: 10MB
- Image type validation (only image/\* MIME types)
- 30-second request timeout to Python API
- Form-data multipart handling

**Frontend:**

- Bearer token in all requests
- Client-side file type validation
- Image preview before upload
- Loading states prevent double-submission

## 🐛 Troubleshooting

### "Medical AI Unavailable" Error

- Check if Python service is running: `curl http://localhost:5001/health`
- Check PYTHON_HEALTH_API env var matches service URL
- Check firewall allows localhost:5001

### "Failed to get health answer"

- Check browser console for detailed error
- Verify JWT token is valid (try logout/login)
- Check backend logs for proxy errors
- Verify Python API response format

### Image Upload Not Working

- Check file size (must be < 10MB)
- Check file type (must be image/\*)
- Verify multipart form-data is being sent
- Check multer configuration limits

### Chat History Not Persisting

- History is in-memory only (cleared on page refresh)
- To persist: Would need to save to MongoDB HealthChat collection

## 📝 API Response Examples

**Python API Expected Format (Health Question):**

```json
{
  "answer": "Dehydration occurs when...",
  "recommendations": ["Drink water", "Avoid caffeine"],
  "severity": "low",
  "conditions": ["Mild dehydration"],
  "follow_up_needed": false
}
```

**Backend Proxy Response:**

```json
{
  "success": true,
  "data": {
    "answer": "...",
    ...all fields from Python API
  }
}
```

## 🎯 Next Steps (Optional Enhancements)

1. **Persist Chat History**
   - Create HealthChatHistory model in MongoDB
   - Save messages after receiving AI response
   - Load history on page mount

2. **Real-time Updates**
   - Replace polling with WebSocket
   - Stream responses as they're generated

3. **Image Analysis**
   - Extract metadata from medical images
   - Show upload progress bar
   - Cache image analysis results

4. **User Preferences**
   - Save favorite topics
   - Track health history timeline
   - Generate health reports

## ✅ Verification Checklist

- [ ] Backend server running (port 5000)
- [ ] Frontend dev server running (port 5173/5175)
- [ ] Python medical AI running (port 5001)
- [ ] `/api/health/status` returns "ok"
- [ ] Can login to frontend
- [ ] "Health Assistant" link visible in navbar
- [ ] Health page loads without errors
- [ ] Status indicator shows "Connected"
- [ ] Can send text question and receive response
- [ ] Can upload image and ask about it
- [ ] Error handling works (stops service and try again)
