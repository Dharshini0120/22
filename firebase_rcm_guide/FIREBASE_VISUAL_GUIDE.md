# Firebase Push Notifications - Visual Guide

## 🎯 System Overview at a Glance

```
┌─────────────────────────────────────────────────────────────────┐
│                    USER'S BROWSER                               │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Frontend App (Next.js + React)                          │   │
│  │                                                           │   │
│  │  ┌─────────────────────────────────────────────────────┐ │   │
│  │  │ Header Component                                    │ │   │
│  │  │ ┌─────────────────────────────────────────────────┐ │ │   │
│  │  │ │ 🔔 Bell Icon with Badge                         │ │ │   │
│  │  │ │ Shows: 5 unread notifications                   │ │ │   │
│  │  │ │ Click: Opens Notification Drawer                │ │ │   │
│  │  │ └─────────────────────────────────────────────────┘ │ │   │
│  │  └─────────────────────────────────────────────────────┘ │   │
│  │                                                           │   │
│  │  ┌─────────────────────────────────────────────────────┐ │   │
│  │  │ Notification Drawer (Right Side)                   │ │   │
│  │  │ ┌─────────────────────────────────────────────────┐ │ │   │
│  │  │ │ Notifications                                   │ │ │   │
│  │  │ ├─────────────────────────────────────────────────┤ │ │   │
│  │  │ │ 👤 John Doe                                     │ │ │   │
│  │  │ │ Ticket #123 updated                            │ │ │   │
│  │  │ │ 2 hours ago                                     │ │ │   │
│  │  │ ├─────────────────────────────────────────────────┤ │ │   │
│  │  │ │ 👤 Jane Smith                                   │ │ │   │
│  │  │ │ Export task completed                           │ │ │   │
│  │  │ │ 1 hour ago                                      │ │ │   │
│  │  │ ├─────────────────────────────────────────────────┤ │ │   │
│  │  │ │ [View All]                                      │ │ │   │
│  │  │ └─────────────────────────────────────────────────┘ │ │   │
│  │  └─────────────────────────────────────────────────────┘ │   │
│  │                                                           │   │
│  │  ┌─────────────────────────────────────────────────────┐ │   │
│  │  │ Toast Notification (Top Center)                    │ │   │
│  │  │ ┌─────────────────────────────────────────────────┐ │ │   │
│  │  │ │ ℹ️  New Ticket Assigned                         │ │ │   │
│  │  │ │ You have been assigned to ticket #456           │ │ │   │
│  │  │ │                                            [✕]  │ │ │   │
│  │  │ └─────────────────────────────────────────────────┘ │ │   │
│  │  └─────────────────────────────────────────────────────┘ │   │
│  │                                                           │   │
│  │  ┌─────────────────────────────────────────────────────┐ │   │
│  │  │ Service Worker (Background)                        │ │   │
│  │  │ - Handles background notifications                 │ │   │
│  │  │ - Communicates with main thread                    │ │   │
│  │  │ - Stores FCM token                                 │ │   │
│  │  └─────────────────────────────────────────────────────┘ │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
                            ⬆️ ⬇️
                    (Web Push Protocol)
                            ⬆️ ⬇️
┌─────────────────────────────────────────────────────────────────┐
│                  FIREBASE CLOUD MESSAGING                        │
│                                                                  │
│  - Receives notifications from backend                          │
│  - Routes to correct device/token                               │
│  - Delivers to browser                                          │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
                            ⬆️ ⬇️
                      (FCM API)
                            ⬆️ ⬇️
┌─────────────────────────────────────────────────────────────────┐
│                    BACKEND SERVER                                │
│                                                                  │
│  - Stores FCM tokens                                            │
│  - Sends notifications to FCM                                   │
│  - Manages notification history                                 │
│  - Provides GraphQL API                                         │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📱 Notification Journey

### Step 1: App Initialization
```
🚀 App Starts
    ↓
📦 Providers Loaded (Redux, Apollo, Toast)
    ↓
🎨 Layout Component Mounts
    ↓
🔔 NotificationSetup Component Initializes
    ↓
✅ Service Worker Registered
    ↓
🔑 FCM Token Generated
    ↓
📤 Token Sent to Backend
    ↓
💾 Token Stored in Database
    ↓
✨ Ready to Receive Notifications
```

### Step 2: Notification Sent
```
📨 Backend Sends Notification
    ↓
🔥 Firebase Receives Message
    ↓
📍 Routes to FCM Token
    ↓
🌐 Sends to Browser
    ↓
✅ Browser Receives Message
```

### Step 3: Notification Displayed (Foreground)
```
👁️ App is in Focus
    ↓
📩 onMessage Handler Triggered
    ↓
🎨 Toast Notification Created
    ↓
📢 Toast Displayed (Top Center)
    ↓
⏱️ Auto-dismisses after 5 seconds
    ↓
🔄 UI Updates Triggered
```

### Step 4: Notification Displayed (Background)
```
😴 App is NOT in Focus
    ↓
🔧 Service Worker Receives Message
    ↓
💬 Posts Message to Main Thread
    ↓
👁️ Main Thread Receives Message
    ↓
🎨 Toast Notification Created
    ↓
📢 Toast Displayed (Top Center)
    ↓
🔄 UI Updates Triggered
```

### Step 5: Bell Icon Updates
```
🔔 notificationTriggered = true
    ↓
👀 Header Component Detects Change
    ↓
📡 Calls notificationCount() API
    ↓
🔍 Backend Returns Unread Count
    ↓
🎨 Badge Component Updates
    ↓
📊 Bell Icon Shows Count
```

### Step 6: User Clicks Bell Icon
```
👆 User Clicks Bell Icon
    ↓
🎨 Drawer Opens (Right Side)
    ↓
📡 Fetches Notification List
    ↓
📋 Displays Notifications
    ↓
✅ Marks All as Read
```

### Step 7: User Clicks Notification
```
👆 User Clicks Notification
    ↓
🔍 Check Organization Context
    ↓
❓ Does Context Match?
    ├─ YES → Route Directly
    └─ NO → Show Confirmation Dialog
    ↓
🔄 Update Context (if needed)
    ↓
🚀 Route to Target Page
    ↓
🚪 Close Drawer
```

---

## 🔄 Component Communication Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    NotificationSetup                         │
│  - Registers Service Worker                                 │
│  - Gets FCM Token                                           │
│  - Sends Token to Backend                                   │
│  - Listens to Messages                                      │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ triggerPushAction()
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    NotificationContext                       │
│  - Provides triggerPushAction                               │
│  - Provides notificationTriggered                           │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ useNotificationContext()
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    Header Component                          │
│  - Listens to notificationTriggered                         │
│  - Calls notificationCount() API                            │
│  - Updates Bell Icon Badge                                  │
│  - Opens Drawer on Click                                    │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ onClick
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    CreateDrawer Component                    │
│  - Fetches Notification List                                │
│  - Displays Notifications                                   │
│  - Handles Notification Click                               │
│  - Routes to Target Page                                    │
└─────────────────────────────────────────────────────────────┘
```

---

## 📊 State Flow Diagram

```
Redux Store
├── user.id ──────────────────┐
├── process.organizationID    │
├── process.subOrganizationId │
└── process.processId         │
                              │
                              ▼
                    ┌─────────────────────┐
                    │  Header Component   │
                    │  - Gets userId      │
                    │  - Gets orgId       │
                    │  - Gets processId   │
                    └─────────────────────┘
                              │
                              ▼
                    ┌─────────────────────┐
                    │  API Calls          │
                    │  - getNotificationCount()
                    │  - getNotificationList()
                    └─────────────────────┘
                              │
                              ▼
                    ┌─────────────────────┐
                    │  Local State        │
                    │  - unreadCount      │
                    │  - notifications[]  │
                    │  - openDrawer       │
                    └─────────────────────┘
                              │
                              ▼
                    ┌─────────────────────┐
                    │  UI Rendering       │
                    │  - Bell Icon Badge  │
                    │  - Drawer           │
                    │  - Toast            │
                    └─────────────────────┘
```

---

## 🎨 UI Components Breakdown

### Bell Icon with Badge
```
┌─────────────────────────────┐
│  Header                     │
│  ┌───────────────────────┐  │
│  │ 🔔 Badge             │  │
│  │    ┌─────┐           │  │
│  │    │  5  │ ← Count   │  │
│  │    └─────┘           │  │
│  │  (Teal Background)   │  │
│  └───────────────────────┘  │
│  Click → Opens Drawer       │
└─────────────────────────────┘
```

### Notification Drawer
```
┌──────────────────────────────┐
│ Notifications                │ ← Header
├──────────────────────────────┤
│ 👤 John Doe                  │
│ Ticket #123 updated          │
│ 2 hours ago                  │
├──────────────────────────────┤
│ 👤 Jane Smith                │
│ Export task completed        │
│ 1 hour ago                   │
├──────────────────────────────┤
│ 👤 Admin                     │
│ System maintenance           │
│ 3 hours ago                  │
├──────────────────────────────┤
│ [View All]                   │ ← Button
└──────────────────────────────┘
```

### Toast Notification
```
┌────────────────────────────────────────┐
│ ℹ️  New Ticket Assigned            [✕] │
│ You have been assigned to ticket #456  │
└────────────────────────────────────────┘
  ▲
  │
  └─ Appears at top-center
  └─ Auto-dismisses after 5 seconds
  └─ Can be manually dismissed
```

---

## 🔐 Security Layers

```
┌─────────────────────────────────────────┐
│  Layer 1: Frontend                      │
│  - Firebase Config (Public)             │
│  - FCM Token (Device-specific)          │
│  - User ID (From Redux)                 │
└─────────────────────────────────────────┘
                    │
                    │ Encrypted HTTPS
                    ▼
┌─────────────────────────────────────────┐
│  Layer 2: Backend                       │
│  - Token Validation                     │
│  - User Authorization                   │
│  - Notification Filtering               │
│  - Database Encryption                  │
└─────────────────────────────────────────┘
                    │
                    │ Encrypted HTTPS
                    ▼
┌─────────────────────────────────────────┐
│  Layer 3: Firebase                      │
│  - Firebase Security Rules              │
│  - Token Expiration                     │
│  - Rate Limiting                        │
│  - Audit Logging                        │
└─────────────────────────────────────────┘
```

---

## 📈 Notification Lifecycle Timeline

```
Time    Event                           Component
────────────────────────────────────────────────────────────
T0      App Starts                      App
T1      Service Worker Registered       NotificationSetup
T2      FCM Token Generated             NotificationSetup
T3      Token Sent to Backend           NotificationSetup
T4      Token Stored in DB              Backend
T5      Notification Sent               Backend
T6      Firebase Routes Message         Firebase
T7      Browser Receives Message        Browser
T8      Handler Triggered               NotificationSetup
T9      Toast Displayed                 Toast Component
T10     triggerPushAction Called        NotificationSetup
T11     notificationTriggered = true    Layout
T12     Header Detects Change           Header
T13     notificationCount() Called      Header
T14     Backend Returns Count           Backend
T15     Badge Updated                   Header
T16     Bell Icon Shows Count           Header
T17     User Clicks Bell Icon           User
T18     Drawer Opens                    CreateDrawer
T19     Notifications Fetched           CreateDrawer
T20     Drawer Displays List            CreateDrawer
T21     User Clicks Notification        User
T22     Context Checked                 CreateDrawer
T23     Route to Target Page            Router
T24     Drawer Closes                   CreateDrawer
```

---

## 🎯 Key Metrics

| Metric | Value | Notes |
|--------|-------|-------|
| Toast Duration | 5 seconds | Auto-dismiss time |
| Notification Limit | 10 per page | Drawer pagination |
| Badge Update | Real-time | On notification arrival |
| Token Refresh | On app start | Once per session |
| API Timeout | 30 seconds | GraphQL default |
| Notification Retention | 30 days | Backend policy |

---

## ✅ Checklist for Notifications Working

```
□ Firebase environment variables set
□ Service worker file exists
□ Browser supports Service Workers
□ Notification permission granted
□ HTTPS enabled
□ FCM token generated
□ Token sent to backend
□ Backend storing tokens
□ Backend sending notifications
□ Frontend receiving messages
□ Toast displaying correctly
□ Bell icon updating
□ Drawer opening
□ Notifications routing correctly
```

---

## 🚀 Quick Troubleshooting

| Issue | Solution |
|-------|----------|
| No notifications | Check env vars, permissions, token |
| Bell icon not updating | Check Redux user ID, API response |
| Drawer not opening | Check state management, console errors |
| Toast not showing | Check react-hot-toast provider, CSS |
| Service Worker error | Run `npm run generate-sw`, check HTTPS |
| Token not sent | Check GraphQL mutation, network tab |

---

**Last Updated:** October 28, 2025
**Version:** 1.0

