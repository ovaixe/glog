# GLog Authentication Setup

GLog now includes a simple, secure authentication system to protect your workout data.

## 🔐 How It Works

- **Single Secret Key**: One password protects the entire app
- **No Database**: No user accounts or complex auth systems
- **Session-Based**: Authentication persists during your browser session
- **Environment Variable**: Secret key stored securely in `.env` file

## 🚀 Setup Instructions

### 1. Set Your Secret Key

Create or edit the `.env` file in the project root:

```bash
GLOG_SECRET_KEY=your-secret-key-here
```

**Important**: Replace `your-secret-key-here` with your own strong password!

### 2. Restart the Development Server

After setting the secret key, restart your dev server:

```bash
# Stop the current server (Ctrl+C)
npm run dev
```

### 3. Access the App

1. Open `http://localhost:3000`
2. You'll see the authentication modal
3. Enter your secret key
4. Click "Unlock" to access the app

## 🔒 Security Features

- ✅ **Protected Routes**: All pages require authentication
- ✅ **Session Storage**: Auth token stored in browser session
- ✅ **Auto-Logout**: Session clears when browser closes
- ✅ **Manual Logout**: Logout button in header (🚪 icon)
- ✅ **Server-Side Validation**: Secret key never exposed to client
- ✅ **No Persistence**: No cookies or local storage

## 🎯 Usage

### Logging In

- Enter your secret key in the auth modal
- Authentication persists until you logout or close the browser

### Logging Out

- Click the 🚪 icon in the header
- Or close your browser tab/window

### Changing the Secret Key

1. Update `GLOG_SECRET_KEY` in `.env`
2. Restart the server
3. All users will need to re-authenticate with the new key

## 🛡️ Best Practices

1. **Use a Strong Key**:

   - Minimum 12 characters
   - Mix of letters, numbers, and symbols
   - Example: `MyGym2024!Secure#Pass`

2. **Keep It Secret**:

   - Never commit `.env` to git (already in `.gitignore`)
   - Don't share your secret key publicly
   - Use different keys for development and production

3. **Regular Updates**:
   - Change your secret key periodically
   - Update immediately if compromised

## 🔧 Customization

### Change Auth Modal Appearance

Edit `/components/AuthProvider.tsx` to customize:

- Modal design
- Error messages
- Loading states
- Icons and text

### Add Multiple Users (Future Enhancement)

To support multiple users, you could:

1. Store hashed keys in a database
2. Add username field to auth modal
3. Update API routes to check username + key combinations

## 🐛 Troubleshooting

**"Server configuration error"**

- Make sure `GLOG_SECRET_KEY` is set in `.env`
- Restart the development server

**"Invalid access key"**

- Double-check your secret key
- Ensure no extra spaces or characters
- Key is case-sensitive

**Auth modal keeps appearing**

- Check browser console for errors
- Clear browser cache and try again
- Verify API routes are working

**Can't logout**

- Hard refresh the page (Ctrl+Shift+R)
- Clear session storage manually in DevTools

## 📝 API Endpoints

### POST `/api/auth/login`

Validates the secret key and returns an auth token.

**Request:**

```json
{
  "key": "your-secret-key"
}
```

**Response:**

```json
{
  "token": "generated-token-hash",
  "success": true
}
```

### POST `/api/auth/verify`

Verifies an existing auth token.

**Request:**

```json
{
  "token": "existing-token"
}
```

**Response:**

```json
{
  "valid": true
}
```

## 🎨 UI Components

### AuthProvider

- Manages authentication state
- Handles login/logout
- Shows auth modal when not authenticated

### AuthModal

- Beautiful lock screen
- Password input field
- Error handling
- Loading states

### AppContent

- Main app wrapper
- Header with navigation
- Logout button

---

**Your workout data is now secure! 🔐💪**
