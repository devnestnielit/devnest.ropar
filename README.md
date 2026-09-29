This is the **DevNest** Next.js web app — the official platform for the NIELIT Coding Club.
It features a public site (events, projects, blogs, leaderboard, members) plus an admin dashboard and a per-member personal dashboard.

---

## 🔒 Firebase Security Rules Logic

### Admin Authentication Model

> **Important**: The app uses **Firebase Custom Claims** for admin detection — not `localStorage`.
> The client-side `localStorage.setItem('devnest_admin', 'true')` is used only for UI gating (showing admin controls in the UI).
> The actual Firestore write permissions are enforced server-side via the `admin: true` custom claim.

To set an admin custom claim for a user, run:
```bash
npx ts-node scripts/setAdminClaim.ts <firebase-uid>
```

---

### 1. Cloud Firestore Rules (`firestore.rules`)

Paste the contents of [firestore.rules](./firestore.rules) into **Firebase Console → Firestore Database → Rules**.

#### Collection Security Logic Summary

| Collection | Read | Create | Update | Delete | Notes |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `events` | Public | Admin claim | Admin claim | Admin claim | Admin-managed events listing |
| `projects` | Public | Any auth user | Admin **or** own submission (`submittedByUid`) | Admin **or** own | Members submit projects from `/projects` page |
| `blogs` | Approved / Admin | Anyone (`status: pending`) or Admin | Admin only | Admin only | Public only sees `status == 'approved'`; `/blog/[slug]` gates pending posts |
| `members` | Admin + self | Admin only | Admin **or** self (restricted fields) | Admin only | Full private profile; no status/uid/email self-edit |
| `memberProfiles` | Public | Admin only | Admin **or** self (by doc ID match) | Admin only | Public-safe profile subset, synced on approval |
| `leaderboard` | Public | Admin claim | Admin claim | Admin claim | Points managed by admin |
| `contacts` | Admin claim | Public (validated) | Admin claim | Admin claim | Contact form submissions |

---

### 2. Member & Blog Lifecycles

#### Member Lifecycle
```
Admin creates member doc in /members (status: "pending")
        ↓
Admin clicks Approve in dashboard
        ↓
POST /api/admin/approve-member (verified admin ID token)
        ↓
Firebase Auth account created (email + password from /members doc)
        ↓
/members/{id}.status = "approved", .uid = newUser.uid, .password = null
        ↓
/memberProfiles/{id} = { name, image, bio, github, linkedin }  ← public
        ↓
Member logs in at /member/login → routed to /member/dashboard
```

#### Blog Verification Lifecycle
```
User / Member writes an article on /blog ("Write Article")
        ↓
Document saved in /blogs with status = "pending"
        ↓
Article is hidden from public /blog listing and /blog/[slug]
        ↓
Admin reviews submission in Admin Dashboard under "Blog Posts" tab
        ↓
Admin clicks 1-Click Approve (or edits & approves)
        ↓
/blogs/{id}.status = "approved"
        ↓
Article immediately appears on /blog and becomes accessible at /blog/[slug]
```

---

### 3. Firebase Storage Rules (`storage.rules`)

```javascript
rules_version = '2';

service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

---

## 🔑 Required Environment Variables

### Public (client-side) — `.env.local`
```env
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
```

### Server-side (Admin SDK) — `.env.local`
```env
FIREBASE_ADMIN_PROJECT_ID=
FIREBASE_ADMIN_CLIENT_EMAIL=
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

---

## 🗂️ Firestore Indexes Required

The following composite indexes must be created in Firebase Console → Firestore → Indexes:

| Collection | Fields | Query Type |
| :--- | :--- | :--- |
| `blogs` | `status ASC`, `date DESC` | Composite |
| `events` | `status ASC`, `date ASC` | Composite |
| `projects` | `submittedByUid ASC`, `updatedAt DESC` | Composite |

---

## 🚀 How to Apply Security Rules

### Option A: Firebase Console
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. **Firestore**: Build → Firestore Database → Rules → paste → Publish
3. **Storage**: Build → Storage → Rules → paste → Publish

### Option B: Firebase CLI
```bash
npx firebase-tools deploy --only firestore:rules
npx firebase-tools deploy --only storage
```

---

## 💻 Local Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## 🏛️ Architecture Overview

```
/app
  /page.tsx              → Home: stats, featured events & projects
  /events                → Public events listing
  /projects              → Public projects; auth-gated submit
  /blog                  → Public blog (approved only)
  /blog/[slug]           → Blog detail
  /leaderboard           → Public leaderboard
  /members               → Public member listing (legacy)
  /people                → Public member profiles (from /memberProfiles)
  /contact               → Public contact form
  /about                 → About the club
  /member/login          → Member login page
  /member/dashboard      → Protected member dashboard (auth required)
  /admin                 → Admin login (Firebase Auth)
  /admin/dashboard       → Admin CRUD panel
  /api/admin/approve-member → Server route: creates auth account + publishes profile

/components              → Shared UI: Navbar, Footer, Cards, Modal, Skeleton...
/lib
  firebase.ts            → Client SDK init
  firebaseAdmin.ts       → Admin SDK init (server-side only)
  services.ts            → Firestore CRUD helpers
```
