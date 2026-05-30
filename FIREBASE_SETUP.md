# Firebase Setup Guide - HGreg Trucks Parts

## What You Get After Setup

| Feature | Before (localStorage) | After (Firebase) |
|---------|----------------------|------------------|
| **Parts data** | Stored in browser only | Cloud database (Firestore) |
| **Admin login** | Mock (admin/admin) | Real email/password auth |
| **Cart** | localStorage | Can sync across devices |
| **PayPal** | Simulated | Real payments via Firebase Functions |
| **Multi-user** | One browser only | Multiple admin users |

---

## Step 1: Create Firebase Project (5 min)

1. Go to [https://console.firebase.google.com](https://console.firebase.google.com)
2. Click **"Create a project"**
3. Name it: `hgreg-trucks-parts`
4. Disable Google Analytics (or enable if you want analytics)
5. Click **"Create project"**

---

## Step 2: Register Web App (3 min)

1. In your Firebase project, click the **"</>"** icon to add a web app
2. App nickname: `hgreg-web`
3. Click **"Register app"**
4. **Copy the firebaseConfig values** - you'll need these

Your config looks like this:
```javascript
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "hgreg-trucks-parts.firebaseapp.com",
  projectId: "hgreg-trucks-parts",
  storageBucket: "hgreg-trucks-parts.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
};
```

---

## Step 3: Update Your .env File

Open `.env` in your project root and replace the values:

```env
VITE_FIREBASE_API_KEY=AIzaSyYOUR_API_KEY
VITE_FIREBASE_AUTH_DOMAIN=hgreg-trucks-parts.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=hgreg-trucks-parts
VITE_FIREBASE_STORAGE_BUCKET=hgreg-trucks-parts.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef123456
```

---

## Step 4: Enable Firestore Database (3 min)

1. In Firebase Console, go to **Firestore Database** (left sidebar)
2. Click **"Create database"**
3. Choose **"Start in production mode"**
4. Select your region (us-east1 for Miami)
5. Click **"Enable"**

---

## Step 5: Enable Authentication (2 min)

1. Go to **Authentication** (left sidebar)
2. Click **"Get started"**
3. Click **"Email/Password"**
4. Toggle **"Enable"** for Email/Password
5. Click **"Save"**
6. Go to **Users** tab
7. Click **"Add user"**
8. Create your admin account:
   - Email: `admin@hgregtrucks.com`
   - Password: your secure password

---

## Step 6: Deploy to Firebase Hosting (3 min)

Install Firebase CLI if not installed:
```bash
npm install -g firebase-tools
```

Login:
```bash
firebase login
```

Initialize Firebase in your project:
```bash
cd /path/to/your/project
firebase init hosting
```

Answer the questions:
- **Project**: Select `hgreg-trucks-parts`
- **Public directory**: `dist`
- **Configure as single-page app**: **Yes**
- **Set up automatic builds**: **No**

Deploy:
```bash
firebase deploy
```

Your site will be live at:
```
https://hgreg-trucks-parts.web.app
```

---

## Step 7: Add PayPal (Optional - for real payments)

### 7A: Upgrade to Blaze Plan (pay-as-you-go)
1. Go to Firebase Console → **Spark plan** (top left)
2. Click **"Upgrade"**
3. Select **Blaze plan** (you only pay for what you use)

### 7B: Enable Cloud Functions
```bash
firebase init functions
```
- Language: **JavaScript**
- Install dependencies: **Yes**

### 7C: Install PayPal SDK
```bash
cd functions
npm install @paypal/checkout-server-sdk
```

### 7D: Create the PayPal Function
Create `functions/index.js`:
```javascript
const functions = require('firebase-functions');
const paypal = require('@paypal/checkout-server-sdk');

// PayPal environment
function environment() {
  const clientId = functions.config().paypal.client_id;
  const clientSecret = functions.config().paypal.client_secret;
  return new paypal.core.LiveEnvironment(clientId, clientSecret);
}

// Create order
exports.createOrder = functions.https.onCall(async (data, context) => {
  const client = new paypal.core.PayPalHttpClient(environment());
  
  const request = new paypal.orders.OrdersCreateRequest();
  request.requestBody({
    intent: 'CAPTURE',
    purchase_units: [{
      amount: {
        currency_code: 'USD',
        value: data.amount
      },
      description: 'HGreg Trucks Parts - Order'
    }]
  });
  
  const response = await client.execute(request);
  return { orderId: response.result.id };
});

// Capture payment
exports.captureOrder = functions.https.onCall(async (data, context) => {
  const client = new paypal.core.PayPalHttpClient(environment());
  
  const request = new paypal.orders.OrdersCaptureRequest(data.orderId);
  const response = await client.execute(request);
  
  return { 
    status: response.result.status,
    transactionId: response.result.id
  };
});
```

### 7E: Configure PayPal credentials
```bash
firebase functions:config:set paypal.client_id="YOUR_PAYPAL_CLIENT_ID" paypal.client_secret="YOUR_PAYPAL_CLIENT_SECRET"
```

### 7F: Deploy functions
```bash
firebase deploy --only functions
```

---

## Step 8: Set up Firestore Security Rules

Go to **Firestore Database** → **Rules** and paste:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Parts - anyone can read, only admins can write
    match /parts/{partId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    // Orders - only authenticated users
    match /orders/{orderId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

Click **"Publish"**

---

## Project Structure After Firebase

```
/mnt/agents/output/app/
├── src/
│   ├── firebase/
│   │   ├── config.ts          # Firebase configuration (reads .env)
│   │   ├── parts.ts           # Firestore CRUD for parts
│   │   └── auth.ts            # Firebase Auth functions
│   ├── hooks/
│   │   ├── useParts.ts        # Uses Firestore, falls back to localStorage
│   │   ├── useAuth.ts         # Uses Firebase Auth, falls back to local
│   │   └── useCart.ts         # (unchanged - still localStorage for cart)
│   ├── pages/
│   │   └── Admin.tsx          # Now uses Firebase Auth
│   └── types/
│       └── Part.ts            # Shared Part type
├── .env                        # Your Firebase config
└── FIREBASE_SETUP.md           # This file
```

---

## Re-deploy After Changes

After updating `.env` with real Firebase values:

```bash
cd /mnt/agents/output/app
npm run build
firebase deploy
```

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| "Firebase not configured" in console | Check `.env` values are correct and not "YOUR_API_KEY" |
| "Permission denied" | Check Firestore security rules are published |
| Login not working | Check Authentication → Sign-in method → Email/Password is enabled |
| No parts showing | Go to /admin and the 12 default parts will auto-seed |
| Parts not persisting | Make sure you're using the real Firebase URL, not the Kimi preview URL |

---

## Costs

| Service | Free Tier | Paid |
|---------|-----------|------|
| **Firestore** | 50K reads/day, 20K writes/day | ~$0.06 per 100K reads |
| **Auth** | 50K users/month | Free for email/password |
| **Hosting** | 10GB/month | ~$0.15/GB after |
| **Functions** | 2M invocations/month | ~$0.40 per million after |

For a small parts store: **$0-5/month**
