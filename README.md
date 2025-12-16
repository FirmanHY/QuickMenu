# 🍳 QuickMenu - Meal Planning & Recipe Manager

![React Native](https://img.shields.io/badge/React_Native-0.73-61DAFB?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript)
![Firebase](https://img.shields.io/badge/Firebase-10.7-FFCA28?style=for-the-badge&logo=firebase)
![Express](https://img.shields.io/badge/Express-4.18-000000?style=for-the-badge&logo=express)

> **Complete meal planning solution** that helps you organize weekly menus, discover healthy recipes, and import recipes from various sources.

---

## 📑 Table of Contents

- [Features](#-features)
- [Screenshots](#-screenshots)
- [Tech Stack](#-tech-stack)
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Running the App](#-running-the-app)
- [Project Structure](#-project-structure)
- [API Documentation](#-api-documentation)
- [Firebase Setup](#-firebase-setup)
- [Troubleshooting](#-troubleshooting)
- [Contributing](#-contributing)
- [License](#-license)

---

## ✨ Features

### 🏠 **Home Dashboard**
- Dynamic greeting based on time of day
- Daily menu overview with real-time sync
- Curated healthy recipe recommendations
- Quick access to search and planner

### 🔍 **Recipe Explorer**
- Browse 100+ curated recipes from QuickMenu database
- Smart search with real-time filtering
- Category-based filtering (Breakfast, Lunch, Dinner, Healthy, Quick)
- One-tap bookmark functionality
- Horizontal card layout for easy browsing

### 📖 **Recipe Detail**
- Full-screen recipe images
- HTML-rendered ingredients and cooking steps
- Color-coded category tags
- Duration and source information
- Schedule recipe to meal planner
- Bookmark/Unbookmark functionality
- Edit capability for custom recipes

### 📚 **Personal Collection**
- Centralized library for all your recipes
- Mixed content: Bookmarked + Custom recipes
- Grid layout (2 columns) for efficient browsing
- Advanced search and category filtering
- Result counter for filtered recipes
- Source badges (QuickMenu, Manual, Instagram, Web, etc.)

### ➕ **Add Recipes (3 Ways)**

#### 1. **Import from Link** (Web Scraping)
- Paste URL from recipe websites
- Automatic scraping of title, ingredients, steps, duration
- Preview before saving
- Supports Indonesian recipe sites:
  - Cookpad Indonesia
  - Yummy.co.id
  - Masak Apa Hari Ini
  - Sajian Sedap
  - Endeus TV
  - And more...

#### 2. **Manual Entry**
- Custom form with rich text support
- Image upload from gallery (Cloudinary integration)
- HTML formatting for ingredients and steps
- Duration input (minutes)
- Category assignment

#### 3. **Manual Import with Smart Paste**
- Copy recipe from Instagram/TikTok/YouTube
- Smart clipboard detection
- Auto-detect ingredients and steps sections
- Quick paste functionality

### 📅 **Meal Planner**
- Weekly view (Monday - Sunday)
- Three meal slots per day (Breakfast, Lunch, Dinner)
- Navigate between weeks (Previous/Next)
- Add recipes from collection
- Remove meals with confirmation
- Visual recipe thumbnails
- Real-time Firebase sync
- Tap meal to view recipe detail

### 🏷️ **Tag Management**
- Create custom categories
- Color-coded tags for easy identification
- Edit tags for custom recipes
- Tag-based filtering in collection
- Automatic tag persistence

### 🔐 **Authentication**
- Google Sign-In integration
- Email/Password authentication
- Secure Firebase Auth
- Persistent sessions

---



## 🛠 Tech Stack

### **Frontend (React Native)**
```
- React Native 0.73.x
- TypeScript 5.x
- React Navigation 6.x
- React Native Firebase (Auth, Firestore)
- React Native Render HTML
- React Native Vector Icons
- React Native Image Picker
- @react-native-clipboard/clipboard
- React Native Simple Toast
- React Native Safe Area Context
- @gorhom/bottom-sheet
```

### **Backend (Express.js)**
```
- Express 4.x
- TypeScript 5.x
- Cheerio (Web Scraping)
- Axios (HTTP Client)
- CORS
- Dotenv
```

### **Database & Services**
```
- Firebase Firestore (NoSQL Database)
- Firebase Authentication
- Cloudinary (Image CDN & Storage)
```

### **Development Tools**
```
- Metro Bundler
- TypeScript Compiler
- ESLint
- Prettier
- Nodemon
```

---

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

### **Required:**
- Node.js (v18 or higher)
- npm or Yarn
- React Native CLI
- Android Studio (for Android) or Xcode (for iOS)
- Java Development Kit (JDK 11)

### **Optional:**
- Git
- VS Code (recommended editor)

### **Verify Installation:**
```bash
node --version   # Should be v18+
npm --version    # Should be 9+
java -version    # Should be 11+
```

---

## 🚀 Installation

### **1. Clone Repository**
```bash
git clone https://github.com/FirmanHY/QuickMenu.git
cd quickmenu
```

### **2. Install Dependencies**

#### **Frontend (React Native):**
```bash
# Install npm packages
npm install
# or
yarn install

# iOS only (skip if Android only)
cd ios && pod install && cd ..
```

#### **Backend (Scraper API):**
```bash
# Navigate to backend folder
cd quickmenu-backend

# Install backend dependencies
npm install
```

---

## ⚙️ Configuration

### **1. Firebase Setup**

#### A. Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create new project: `quickmenu-app`
3. Enable Google Analytics (optional)

#### B. Enable Authentication
1. Go to **Authentication** → **Sign-in method**
2. Enable **Email/Password**
3. Enable **Google** (add SHA-1/SHA-256 for Android)

#### C. Create Firestore Database
1. Go to **Firestore Database**
2. Click **Create database**
3. Start in **production mode**
4. Select region: `asia-southeast1`

#### D. Setup Firestore Rules
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Users
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Public Recipes
    match /recipes/{recipeId} {
      allow read: if request.auth != null;
      allow write: if false;
    }
    
    // User Custom Recipes
    match /user_recipes/{recipeId} {
      allow read: if request.auth != null && resource.data.userId == request.auth.uid;
      allow create: if request.auth != null && request.resource.data.userId == request.auth.uid;
      allow update, delete: if request.auth != null && resource.data.userId == request.auth.uid;
    }
    
    // User Bookmarks
    match /user_bookmarks/{userId}/bookmarks/{bookmarkId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Categories
    match /categories/{categoryId} {
      allow read: if request.auth != null;
      allow write: if false;
    }
    
    // User Custom Categories
    match /user_categories/{userId}/categories/{categoryId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Meal Plans
    match /meal_plans/{userId}/plans/{planId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

#### E. Create Firestore Indexes

**Required Composite Index:**
```
Collection: user_recipes
Fields:
  - userId (Ascending)
  - createdAt (Descending)
```

**How to Create:**
1. Run the app and trigger the query
2. Click the index creation link in error message
3. Wait 5-15 minutes for index to build

OR manually create via Firebase Console:
```
Firestore → Indexes → Composite → Create Index
```

#### F. Download Firebase Config Files

**For Android:**
1. Project Settings → Your Apps → Android
2. Download `google-services.json`
3. Place in: `android/app/google-services.json`

**For iOS:**
1. Project Settings → Your Apps → iOS
2. Download `GoogleService-Info.plist`
3. Place in: `ios/GoogleService-Info.plist`

### **2. Firebase Configuration File**

Create `src/config/firebase.config.ts`:

```typescript
// This file should already exist after installing @react-native-firebase
// No additional configuration needed if google-services.json is in place
```

### **3. Cloudinary Setup**

#### A. Create Account
1. Sign up at [Cloudinary](https://cloudinary.com)
2. Get your credentials from Dashboard

#### B. Configure in App

Create `src/constants/config.ts`:
```typescript
export const CLOUDINARY_CONFIG = {
    CLOUD_NAME: 'your_cloud_name',      // From dashboard
    UPLOAD_PRESET: 'quickmenu_preset',  // Create in settings
    API_KEY: 'your_api_key'             // From dashboard
};
```

#### C. Create Upload Preset
1. Go to Settings → Upload
2. Add upload preset
3. Name: `quickmenu_preset`
4. Signing Mode: **Unsigned**
5. Folder: `user_recipes`
6. Access Mode: **Public**

### **4. Backend Configuration**

Create `quickmenu-backend/.env`:
```env
PORT=3000
NODE_ENV=development
```

### **5. React Native Configuration**

#### Android - Update IP Address

Edit `src/services/scraper.service.ts`:
```typescript
// For Android Emulator
const API_BASE_URL = 'http://10.0.2.2:3000';

// For Real Device (same WiFi)
// const API_BASE_URL = 'http://192.168.1.XXX:3000'; // Replace with your PC IP
```

**Find Your PC IP:**
```bash
# Windows
ipconfig

# Mac/Linux
ifconfig

# Look for: IPv4 Address or inet (e.g., 192.168.1.100)
```

---

## 🎯 Running the App

### **Option 1: Start Everything with One Command**

Create `package.json` script (root folder):
```json
{
  "scripts": {
    "start": "npm run start:backend & npm run start:app",
    "start:app": "react-native start",
    "start:backend": "cd quickmenu-backend && npm run dev"
  }
}
```

Then run:
```bash
npm run start
```

---

### **Option 2: Start Separately (Recommended)**

#### **Terminal 1: Backend Server**
```bash
cd quickmenu-backend
npm run dev
```

Expected output:
```
╔═══════════════════════════════════════════╗
║   🍳 QuickMenu Scraper API               ║
║   🚀 Server running on port 3000         ║
║   📡 http://localhost:3000               ║
╚═══════════════════════════════════════════╝
```

#### **Terminal 2: React Native Metro**
```bash
npm start
# or
yarn start
```

#### **Terminal 3: Run on Device**

**Android:**
```bash
npm run android
# or
yarn android
```

**iOS:**
```bash
npm run ios
# or
yarn ios
```

---

## 📁 Project Structure

```
QuickMenu/
├── android/                    # Android native code
├── ios/                        # iOS native code
├── src/
│   ├── components/            # Reusable components
│   │   ├── CustomButton.tsx
│   │   ├── CustomInput.tsx
│   │   ├── RecipeCard.tsx
│   │   ├── QuickMenuRecipeCard.tsx
│   │   ├── DailyMenuCard.tsx
│   │   ├── DailyMealCard.tsx
│   │   ├── Chip.tsx
│   │   ├── TabSwitcher.tsx
│   │   ├── FloatingButton.tsx
│   │   ├── CustomBottomSheet.tsx
│   │   ├── AddRecipeContent.tsx
│   │   ├── LinkImportBottomSheet.tsx
│   │   ├── EditTagSheetContent.tsx
│   │   ├── ScheduleRecipeSheetContent.tsx
│   │   └── RecipeSelectionSheetContent.tsx
│   │
│   ├── screens/               # Screen components
│   │   ├── auth/
│   │   │   ├── LoginScreen.tsx
│   │   │   └── RegisterScreen.tsx
│   │   ├── HomeScreen.tsx
│   │   ├── ExploreScreen.tsx
│   │   ├── CollectionScreen.tsx
│   │   ├── PlannerScreen.tsx
│   │   ├── RecipeDetailScreen.tsx
│   │   ├── AddRecipeManualScreen.tsx
│   │   ├── EditRecipeScreen.tsx
│   │   ├── ImportPreviewScreen.tsx
│   │   └── ManualImportScreen.tsx
│   │
│   ├── navigation/            # Navigation setup
│   │   ├── AppNavigator.tsx
│   │   ├── AuthNavigator.tsx
│   │   ├── TabNavigator.tsx
│   │   └── types.ts
│   │
│   ├── services/              # Business logic & API calls
│   │   ├── auth.service.ts
│   │   ├── recipe.service.ts
│   │   ├── category.service.ts
│   │   ├── planner.service.ts
│   │   ├── cloudinary.service.ts
│   │   └── scraper.service.ts
│   │
│   ├── constants/             # Constants & theme
│   │   ├── colors.ts
│   │   ├── fonts.ts
│   │   └── config.ts
│   │
│   ├── utils/                 # Utility functions
│   │   └── responsive.ts
│   │
│   └── types/                 # TypeScript types
│       └── index.ts
│
├── quickmenu-backend/         # Backend scraper service
│   ├── src/
│   │   ├── services/
│   │   │   └── scraper.service.ts
│   │   ├── routes/
│   │   │   └── recipe.routes.ts
│   │   └── server.ts
│   ├── package.json
│   ├── tsconfig.json
│   └── .env
│
├── App.tsx                    # Root component
├── package.json
├── tsconfig.json
├── babel.config.js
└── metro.config.js
```

---

## 🔌 API Documentation

### **Backend Scraper API**

Base URL: `http://localhost:3000`

#### **1. Health Check**
```http
GET /api/health
```

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-12-17T10:30:00.000Z"
}
```

---

#### **2. Scrape Recipe**
```http
POST /api/scrape
Content-Type: application/json
```

**Request Body:**
```json
{
  "url": "https://cookpad.com/id/resep/14658448-nasi-goreng-spesial"
}
```

**Response (Success):**
```json
{
  "success": true,
  "data": {
    "title": "Nasi Goreng Spesial",
    "duration": "25",
    "ingredients": "<ul><li>Nasi putih 2 piring</li>...</ul>",
    "steps": "<ol><li>Panaskan minyak</li>...</ol>",
    "imageUrl": "https://...",
    "source": "Web",
    "originalUrl": "https://cookpad.com/..."
  }
}
```

**Response (Error):**
```json
{
  "success": false,
  "error": "Gagal mengambil resep: Connection timeout"
}
```

---

### **Supported Recipe Websites**

| Website | URL Pattern | Status |
|---------|-------------|--------|
| Cookpad Indonesia | `cookpad.com/id/resep/*` | ✅ Working |
| Yummy.co.id | `yummy.co.id/resep/*` | ✅ Working |
| Masak Apa Hari Ini | `masakapahariini.com/resep/*` | ✅ Working |
| Sajian Sedap | `sajiansedap.grid.id/read/*` | ✅ Working |
| Endeus TV | `endeus.tv/resep/*` | ✅ Working |
| Instagram | `instagram.com/*` | ⚠️ Manual copy-paste required |
| TikTok | `tiktok.com/*` | ⚠️ Manual copy-paste required |
| YouTube | `youtube.com/watch?v=*` | ⚠️ Partial (description only) |

---

## 🔥 Firebase Setup Details

### **Firestore Collections Structure**

#### **1. `recipes` (QuickMenu Public Recipes)**
```typescript
{
  id: string;              // Auto-generated
  title: string;
  duration: string;        // Format: "30 Min"
  ingredients: string;     // HTML format
  steps: string;          // HTML format
  imageUrl: string;
  categories: string[];   // ["breakfast", "healthy"]
  source: "QuickMenu";
  createdBy: "admin";
  createdAt: number;      // Timestamp
}
```

**Example Document:**
```json
{
  "title": "Smoothie Bowl Sehat",
  "duration": "10",
  "ingredients": "<ul><li>Pisang 2 buah</li><li>Yogurt 200ml</li></ul>",
  "steps": "<ol><li>Blender semua bahan</li><li>Tuang ke mangkuk</li></ol>",
  "imageUrl": "https://res.cloudinary.com/...",
  "categories": ["breakfast", "healthy"],
  "source": "QuickMenu",
  "createdBy": "admin",
  "createdAt": 1734393600000
}
```

---

#### **2. `user_recipes` (User Custom Recipes)**
```typescript
{
  id: string;
  userId: string;         // User who created
  title: string;
  duration: string;
  ingredients: string;
  steps: string;
  imageUrl: string | null;
  imagePublicId: string;  // Cloudinary ID
  categories: string[];
  source: "Manual" | "Instagram" | "Web" | "TikTok" | "Youtube";
  originalUrl?: string;   // If imported from link
  createdAt: number;
  updatedAt: number;
}
```

---

#### **3. `user_bookmarks/{userId}/bookmarks/{recipeId}`**
```typescript
{
  recipeId: string;       // Reference to recipes collection
  bookmarkedAt: number;   // Timestamp
}
```

---

#### **4. `categories` (Default Categories)**
```typescript
{
  id: string;             // "breakfast", "lunch", etc.
  name: string;           // "Breakfast"
  displayName: string;    // "Sarapan"
  icon: string;           // "☀️"
  order: number;          // Display order
  isDefault: boolean;
  createdAt: number;
}
```

**Example Documents:**
```json
// Document ID: breakfast
{
  "id": "breakfast",
  "name": "Breakfast",
  "displayName": "Sarapan",
  "icon": "☀️",
  "order": 1,
  "isDefault": true,
  "createdAt": 1734048000000
}
```

---

#### **5. `user_categories/{userId}/categories/{categoryId}`**
```typescript
{
  id: string;
  name: string;
  displayName: string;
  createdAt: number;
}
```

---

#### **6. `meal_plans/{userId}/plans/{dateKey}`**
```typescript
{
  date: string;           // Format: "YYYY-MM-DD"
  breakfast?: {
    recipeId: string;
    title: string;
    imageUrl: string;
  };
  lunch?: {
    recipeId: string;
    title: string;
    imageUrl: string;
  };
  dinner?: {
    recipeId: string;
    title: string;
    imageUrl: string;
  };
  updatedAt: number;
}
```

**Example Document:**
```json
// Document ID: 2024-12-17
{
  "date": "2024-12-17",
  "breakfast": {
    "recipeId": "abc123",
    "title": "Smoothie Bowl",
    "imageUrl": "https://..."
  },
  "lunch": {
    "recipeId": "def456",
    "title": "Nasi Goreng",
    "imageUrl": "https://..."
  },
  "updatedAt": 1734393600000
}
```

---

### **Seeding Initial Data**

#### **Seed Default Categories:**

Via Firebase Console → Firestore → `categories` collection:

```javascript
// breakfast
{
  id: "breakfast",
  name: "Breakfast",
  displayName: "Sarapan",
  icon: "☀️",
  order: 1,
  isDefault: true,
  createdAt: Date.now()
}

// lunch
{
  id: "lunch",
  name: "Lunch",
  displayName: "Makan Siang",
  icon: "🍱",
  order: 2,
  isDefault: true,
  createdAt: Date.now()
}

// dinner
{
  id: "dinner",
  name: "Dinner",
  displayName: "Makan Malam",
  icon: "🍽️",
  order: 3,
  isDefault: true,
  createdAt: Date.now()
}

// snack
{
  id: "snack",
  name: "Snack",
  displayName: "Cemilan",
  icon: "🍪",
  order: 4,
  isDefault: true,
  createdAt: Date.now()
}

// healthy
{
  id: "healthy",
  name: "Healthy",
  displayName: "Sehat",
  icon: "🥗",
  order: 5,
  isDefault: true,
  createdAt: Date.now()
}

// quick
{
  id: "quick",
  name: "Quick",
  displayName: "Cepat",
  icon: "⚡",
  order: 6,
  isDefault: true,
  createdAt: Date.now()
}
```

---

## 🐛 Troubleshooting

### **Common Issues & Solutions**

#### **1. Firebase Auth Error: "Unable to resolve module"**
```bash
# Solution: Reinstall Firebase
rm -rf node_modules
npm install
cd ios && pod install && cd ..
```

---

#### **2. Backend "Cannot connect to server"**

**Problem:** React Native can't reach backend at localhost:3000

**Solution (Android Emulator):**
```typescript
// Use 10.0.2.2 instead of localhost
const API_BASE_URL = 'http://10.0.2.2:3000';
```

**Solution (Real Device):**
```typescript
// Use your PC's IP address
const API_BASE_URL = 'http://192.168.1.100:3000';
```

**Find PC IP:**
```bash
# Windows
ipconfig

# Mac/Linux
ifconfig
```

---

#### **3. Firestore "Permission Denied"**

**Problem:** Can't read/write to Firestore

**Solution:** Check Firestore Rules (see Configuration section)

**Verify:**
```bash
# In Firebase Console
Firestore → Rules → Make sure rules are published
```

---

#### **4. Firestore "Missing Index"**

**Problem:** Query requires composite index

**Solution:**
1. Click the error link to auto-create index
2. Wait 5-15 minutes
3. Retry query

**Or manually:**
```bash
Firebase Console → Firestore → Indexes → Create Index
Collection: user_recipes
Fields: userId (Ascending), createdAt (Descending)
```

---

#### **5. Image Upload Fails**

**Problem:** Cloudinary upload error

**Solution:** Check Cloudinary config in `src/constants/config.ts`

**Verify:**
- Cloud name correct
- Upload preset created (unsigned mode)
- Preset name matches config

---

#### **6. Metro Bundler Port Conflict**

**Problem:** Port 8081 already in use

**Solution:**
```bash
# Kill process on port 8081
# Mac/Linux
lsof -ti:8081 | xargs kill -9

# Windows
netstat -ano | findstr :8081
taskkill /PID <PID> /F

# Or use different port
npx react-native start --port 8082
```

---

#### **7. Gradle Build Failed (Android)**

**Problem:** Build fails with Gradle errors

**Solution:**
```bash
# Clean Gradle cache
cd android
./gradlew clean

# Or rebuild
cd ..
npx react-native run-android
```

---

#### **8. CocoaPods Error (iOS)**

**Problem:** Pod install fails

**Solution:**
```bash
cd ios
rm -rf Pods Podfile.lock
pod deintegrate
pod install
cd ..
```

---

## 🧪 Testing

### **Manual Testing Checklist**

#### **Authentication:**
- [ ] Login with Google
- [ ] Login with Email/Password
- [ ] Register new account
- [ ] Logout
- [ ] Session persistence

#### **Home Screen:**
- [ ] Dynamic greeting displays correctly
- [ ] Daily menu loads from Firestore
- [ ] Inspiration recipes load
- [ ] Search navigation works
- [ ] Bookmark toggle works

#### **Explore Screen:**
- [ ] Recipes load from Firestore
- [ ] Search filters recipes
- [ ] Category filters work
- [ ] Bookmark toggle updates UI
- [ ] Navigate to recipe detail

#### **Collection Screen:**
- [ ] Bookmarked recipes appear
- [ ] Custom recipes appear
- [ ] Search works
- [ ] Category filter works
- [ ] FAB opens bottom sheet
- [ ] Import from link works
- [ ] Add manual works

#### **Recipe Detail:**
- [ ] Image loads
- [ ] Title, duration display
- [ ] Tags display
- [ ] Tab switching works
- [ ] HTML renders correctly
- [ ] Bookmark toggle works
- [ ] Schedule modal opens
- [ ] Save to planner works

#### **Meal Planner:**
- [ ] Weekly view displays
- [ ] Navigate between weeks
- [ ] Add meal works
- [ ] Remove meal works
- [ ] Tap meal navigates to detail
- [ ] Data persists after reload

#### **Add Recipe:**
- [ ] Manual form validation works
- [ ] Image picker works
- [ ] Cloudinary upload works
- [ ] HTML formatting works
- [ ] Save to Firestore works
- [ ] Appears in collection

#### **Import Recipe:**
- [ ] URL validation works
- [ ] Backend scraping works
- [ ] Preview displays correctly
- [ ] Save to Firestore works
- [ ] Source tracking works

---

## 🚀 Deployment

### **Android APK Build**

```bash
# Generate release APK
cd android
./gradlew assembleRelease

# APK location:
# android/app/build/outputs/apk/release/app-release.apk
```

### **iOS Build**

```bash
# Open in Xcode
cd ios
open QuickMenu.xcworkspace

# Then:
# Product → Archive → Distribute App
```

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**Your Name**
- Email: yudistia.firman@gmail.com

---

## 🙏 Acknowledgments

- [React Native](https://reactnative.dev/) - Mobile framework
- [Firebase](https://firebase.google.com/) - Backend services
- [Cloudinary](https://cloudinary.com/) - Image storage
- [Cheerio](https://cheerio.js.org/) - Web scraping
- Recipe websites for inspiration and content

---

## 📞 Support

For support, email your.email@example.com or open an issue in the repository.

---

**Made with ❤️ and ☕ by Firman Yudistia**

*Last Updated: December 17, 2025
