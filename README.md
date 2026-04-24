# ⚡ AutoVault India — Vehicle Pre-Booking System

> A full-stack vehicle pre-booking web application built for college project submission.
> Features Google Authentication, OTP verification, Admin dashboard, and Firebase backend.

---

## 🚀 Live Demo
> After hosting on GitHub Pages: `https://YOUR_USERNAME.github.io/autovault-india`

---

## ✨ Features

| Feature | Details |
|---|---|
| 🔐 Google Auth | Sign in with Google via Firebase |
| 📱 OTP Booking | 6-digit OTP verification for all bookings |
| 🚗 12 Indian EVs | Real car images, specs, pricing in ₹ |
| 🎨 Filters | Filter by SUV, Sedan, Hatchback, Luxury |
| 📊 User Dashboard | View, track, cancel your bookings |
| ⚙️ Admin Panel | Full booking management, user list, CSV export |
| 📤 CSV Export | Export all bookings as CSV |
| 🌙 Dark UI | Futuristic dark theme with animations |
| 📱 Responsive | Works on mobile, tablet, desktop |

---

## 🛠️ Setup Guide (Step by Step)

### Step 1: Download / Clone the Project

```bash
git clone https://github.com/YOUR_USERNAME/autovault-india.git
cd autovault-india
```

Or download the ZIP and extract it.

---

### Step 2: Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Add project"** → Name it `autovault-india` → Continue
3. Disable Google Analytics (optional) → Create project

#### Enable Authentication:
- Left sidebar → **Authentication** → Get Started
- **Sign-in method** tab → Enable **Google** → Save

#### Enable Firestore:
- Left sidebar → **Firestore Database** → Create database
- Choose **"Start in test mode"** → Select region (asia-south1 for India) → Done

#### Get Firebase Config:
- Go to **Project Settings** (gear icon)
- Scroll down to **"Your apps"** → Click **"</> Web"**
- Register app name → Copy the `firebaseConfig` object

#### Update the config file:
Open `js/firebase-config.js` and replace:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",           // ← Paste your values here
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

const ADMIN_EMAILS = [
  "your-admin-email@gmail.com"      // ← Your Gmail for admin access
];
```

---

### Step 3: Firebase Security Rules

In Firestore → **Rules** tab, paste:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Users can read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      allow read: if request.auth != null; // admins can read all
    }
    
    // Bookings: users can create/read their own; everyone authenticated can read
    match /bookings/{bookingId} {
      allow create: if request.auth != null;
      allow read: if request.auth != null && 
        (request.auth.uid == resource.data.userId || 
         request.auth.token.email in ['your-admin-email@gmail.com']);
      allow update: if request.auth != null && 
        request.auth.token.email in ['your-admin-email@gmail.com'];
    }
  }
}
```

> ⚠️ Replace `your-admin-email@gmail.com` with your actual admin email.

---

### Step 4: Host on GitHub Pages

1. Create a new repository on GitHub: `autovault-india`
2. Push your code:

```bash
git init
git add .
git commit -m "Initial commit — AutoVault India"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/autovault-india.git
git push -u origin main
```

3. Go to repo **Settings** → **Pages**
4. Source: **Deploy from a branch** → Branch: `main` / `root` → Save
5. Your site will be live at: `https://YOUR_USERNAME.github.io/autovault-india`

#### Add GitHub Pages domain to Firebase:
- Firebase Console → Authentication → Settings → **Authorized domains**
- Add: `YOUR_USERNAME.github.io`

---

## 📁 Project Structure

```
autovault-india/
├── index.html              ← Landing page (main site)
├── css/
│   ├── style.css           ← Main styles
│   ├── dashboard.css       ← User dashboard styles
│   └── admin.css           ← Admin panel styles
├── js/
│   ├── firebase-config.js  ← 🔧 Configure this first!
│   ├── vehicles.js         ← Vehicle data + images
│   └── app.js              ← Main app logic
└── pages/
    ├── dashboard.html      ← User booking history
    ├── admin-login.html    ← Admin login portal
    └── admin.html          ← Admin dashboard
```

---

## 🔑 User Roles

| Role | Access |
|---|---|
| **Guest** | Browse vehicles only |
| **User** | Book vehicles, view own bookings, cancel bookings |
| **Admin** | Full dashboard: all bookings, user management, status updates, CSV export |

### How to log in as Admin:
1. Go to `/pages/admin-login.html`
2. Sign in with the Gmail added to `ADMIN_EMAILS` in `firebase-config.js`
3. You'll be redirected to the admin dashboard automatically

---

## 📱 OTP Demo Mode

Since real SMS requires a paid service (Twilio, MSG91), the demo uses:
- **Console OTP**: Open browser DevTools (F12) → Console tab → See the OTP
- The OTP appears highlighted in cyan in the console
- In production: integrate MSG91 / Twilio API for real SMS

---

## 🚗 Vehicles Included

| Vehicle | Brand | Price | Range |
|---|---|---|---|
| Nexon EV Max | Tata | ₹19.74L | 437km |
| Punch EV | Tata | ₹10.99L | 421km |
| BE 6e | Mahindra | ₹18.90L | 682km |
| Windsor EV | MG | ₹13.50L | 331km |
| BYD Seal | BYD | ₹41.00L | 650km |
| Creta EV | Hyundai | ₹17.99L | 473km |
| EV6 | Kia | ₹60.97L | 708km |
| Curvv EV | Tata | ₹17.49L | 585km |
| S1 Pro | Ola | ₹1.47L | 195km |
| i4 M50 | BMW | ₹93.90L | 510km |
| Comet EV | MG | ₹7.98L | 230km |
| XC40 Recharge | Volvo | ₹55.90L | 418km |

---

## 🛠️ Tech Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Backend**: Firebase (Firestore + Authentication)
- **Hosting**: GitHub Pages
- **Auth**: Google OAuth 2.0 via Firebase
- **Database**: Cloud Firestore (NoSQL)
- **Fonts**: Google Fonts (Rajdhani, Exo 2, Space Mono)

---

## 📸 Screenshots

| Page | Description |
|---|---|
| `index.html` | Hero + Vehicle listings with filter |
| `pages/dashboard.html` | User booking history |
| `pages/admin.html` | Admin management panel |
| `pages/admin-login.html` | Restricted admin login |

---

## 👨‍💻 Built By

**Hari** — College Project  
AutoVault India — Vehicle Pre-Booking System  
Built with ❤️ using Firebase + Vanilla JS

---

## 📄 License

This project is for educational/college project purposes.
