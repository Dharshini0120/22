# Firebase Push Notifications - Architecture & System Design

## System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                         FRONTEND APPLICATION                         │
│                      (Next.js + React 19)                            │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │                    App Providers                              │   │
│  │  ┌────────────────────────────────────────────────────────┐  │   │
│  │  │  Redux Store (User, Process, Notifications)           │  │   │
│  │  │  Apollo Client (GraphQL)                              │  │   │
│  │  │  NotificationContext (Global State)                   │  │   │
│  │  └────────────────────────────────────────────────────────┘  │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                       │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │                    Layout Component                           │   │
│  │  ┌────────────────────────────────────────────────────────┐  │   │
│  │  │  NotificationContext.Provider                         │  │   │
│  │  │  ├─ triggerPushAction()                               │  │   │
│  │  │  └─ notificationTriggered (boolean)                   │  │   │
│  │  └────────────────────────────────────────────────────────┘  │   │
│  │                                                                │   │
│  │  ┌────────────────────────────────────────────────────────┐  │   │
│  │  │  NotificationSetup Component                          │  │   │
│  │  │  ├─ Register Service Worker                           │  │   │
│  │  │  ├─ Get FCM Token                                     │  │   │
│  │  │  ├─ Send Token to Backend                            │  │   │
│  │  │  ├─ Listen to Foreground Messages                    │  │   │
│  │  │  └─ Listen to Background Messages                    │  │   │
│  │  └────────────────────────────────────────────────────────┘  │   │
│  │                                                                │   │
│  │  ┌────────────────────────────────────────────────────────┐  │   │
│  │  │  Header Component                                      │  │   │
│  │  │  ├─ Bell Icon with Badge                              │  │   │
│  │  │  ├─ Unread Count Display                              │  │   │
│  │  │  └─ Open Notification Drawer                          │  │   │
│  │  └────────────────────────────────────────────────────────┘  │   │
│  │                                                                │   │
│  │  ┌────────────────────────────────────────────────────────┐  │   │
│  │  │  Notification Drawer (CreateDrawer)                   │  │   │
│  │  │  ├─ Fetch Notification List                           │  │   │
│  │  │  ├─ Display Notifications                             │  │   │
│  │  │  ├─ Handle Notification Click                         │  │   │
│  │  │  └─ Route to Target Page                              │  │   │
│  │  └────────────────────────────────────────────────────────┘  │   │
│  │                                                                │   │
│  │  ┌────────────────────────────────────────────────────────┐  │   │
│  │  │  Notifications Page                                    │  │   │
│  │  │  ├─ Full Notification List                            │  │   │
│  │  │  ├─ Pagination                                        │  │   │
│  │  │  ├─ Filtering & Sorting                               │  │   │
│  │  │  └─ Detailed View                                     │  │   │
│  │  └────────────────────────────────────────────────────────┘  │   │
│  │                                                                │   │
│  │  ┌────────────────────────────────────────────────────────┐  │   │
│  │  │  Toast Notifications (react-hot-toast)                │  │   │
│  │  │  ├─ Foreground Message Display                        │  │   │
│  │  │  ├─ Background Message Display                        │  │   │
│  │  │  └─ Auto-dismiss after 5 seconds                      │  │   │
│  │  └────────────────────────────────────────────────────────┘  │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  │ GraphQL Queries/Mutations
                                  │ (Apollo Client)
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      BACKEND API (GraphQL)                           │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  Mutations                                                    │   │
│  │  ├─ addNotificationToken(token: [String!]!)                 │   │
│  │  └─ markAllNotificationsAsRead()                            │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                       │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  Queries                                                      │   │
│  │  ├─ notificationHistory(input: GetNotificationHistoryInput)  │   │
│  │  └─ notificationStats(userId: String)                       │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                       │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  Database                                                     │   │
│  │  ├─ Notification Tokens Table                               │   │
│  │  ├─ Notifications Table                                     │   │
│  │  └─ User Preferences Table                                  │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  │ Send Notifications
                                  │ (FCM API)
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    FIREBASE CLOUD MESSAGING                          │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  FCM Service                                                  │   │
│  │  ├─ Receive Notification from Backend                       │   │
│  │  ├─ Route to Correct Device/Token                           │   │
│  │  ├─ Send to Browser                                         │   │
│  │  └─ Handle Delivery Confirmation                            │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  │ Push Notification
                                  │ (Web Push Protocol)
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      BROWSER / SERVICE WORKER                        │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  Service Worker (firebase-messaging-sw.js)                   │   │
│  │  ├─ onBackgroundMessage Handler                             │   │
│  │  ├─ Post Message to Main Thread                             │   │
│  │  └─ Handle Notification Click                               │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                       │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  Main Thread Message Listener                                │   │
│  │  ├─ Receive Message from Service Worker                     │   │
│  │  ├─ Display Toast Notification                              │   │
│  │  └─ Trigger UI Update                                       │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                       │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  Notification Display                                         │   │
│  │  ├─ Toast (Foreground)                                      │   │
│  │  ├─ Browser Notification (Background)                       │   │
│  │  └─ Bell Icon Badge Update                                  │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Data Flow Diagram

### 1. Initialization Flow

```
App Start
    │
    ├─→ Providers Initialized
    │   ├─ Redux Store
    │   ├─ Apollo Client
    │   └─ Toast Provider
    │
    ├─→ Layout Component Mounts
    │   ├─ NotificationContext.Provider
    │   └─ NotificationSetup Component
    │
    └─→ NotificationSetup Initialization
        ├─ Check Browser Support
        ├─ Register Service Worker
        ├─ Get FCM Token
        └─ Send Token to Backend
```

### 2. Token Registration Flow

```
NotificationSetup Component
    │
    ├─→ Browser Capability Check
    │   ├─ Service Worker Support ✓
    │   ├─ Push Manager Support ✓
    │   └─ Notification API Support ✓
    │
    ├─→ Service Worker Registration
    │   └─ /firebase-messaging-sw.js
    │
    ├─→ Get FCM Token
    │   ├─ Firebase Messaging
    │   ├─ VAPID Key
    │   └─ Service Worker Registration
    │
    └─→ Send Token to Backend
        ├─ GraphQL Mutation: addNotificationToken
        ├─ Token Stored in Database
        └─ Ready to Receive Notifications
```

### 3. Foreground Notification Flow

```
Backend Sends Notification
    │
    ├─→ Firebase Cloud Messaging
    │   └─ Routes to FCM Token
    │
    ├─→ Browser Receives Message
    │   └─ App is in Focus
    │
    ├─→ onMessage Handler Triggered
    │   ├─ Extract Title & Body
    │   └─ Create Toast Notification
    │
    ├─→ Display Toast
    │   ├─ Blue border, Info icon
    │   ├─ Title & Body text
    │   ├─ Dismiss button
    │   └─ Auto-dismiss after 5s
    │
    └─→ Trigger UI Update
        ├─ triggerPushAction() Called
        ├─ notificationTriggered = true
        ├─ Header Detects Change
        ├─ Call notificationCount API
        └─ Update Bell Icon Badge
```

### 4. Background Notification Flow

```
Backend Sends Notification
    │
    ├─→ Firebase Cloud Messaging
    │   └─ Routes to FCM Token
    │
    ├─→ Browser Receives Message
    │   └─ App is NOT in Focus
    │
    ├─→ Service Worker onBackgroundMessage
    │   ├─ Extract Notification Data
    │   └─ Post Message to Main Thread
    │
    ├─→ Main Thread Message Listener
    │   ├─ Receive NOTIFICATION_RECEIVED Event
    │   └─ Call handleNotification()
    │
    ├─→ Display Toast
    │   └─ Same as Foreground
    │
    └─→ Trigger UI Update
        └─ Same as Foreground
```

### 5. Bell Icon Update Flow

```
notificationTriggered = true
    │
    ├─→ Header Component useEffect
    │   └─ Dependency: [notificationTriggered]
    │
    ├─→ Call notificationCount()
    │   ├─ GraphQL Query: notificationStats
    │   ├─ Pass userId from Redux
    │   └─ Fetch from Backend
    │
    ├─→ Backend Returns Data
    │   ├─ totalNotifications
    │   ├─ unreadCount
    │   └─ readCount
    │
    ├─→ Update State
    │   └─ setUnreadCount(unreadCount)
    │
    └─→ Render Badge
        ├─ Badge Component
        ├─ badgeContent={unreadCount}
        ├─ Bell Icon
        └─ Display on Screen
```

### 6. Notification Drawer Flow

```
User Clicks Bell Icon
    │
    ├─→ openDrawer = true
    │
    ├─→ CreateDrawer Component Opens
    │   └─ useEffect triggered
    │
    ├─→ Fetch Notifications
    │   ├─ GraphQL Query: notificationHistory
    │   ├─ Pass userId, page, limit
    │   └─ Fetch from Backend
    │
    ├─→ Backend Returns Data
    │   ├─ notifications[]
    │   ├─ hasNext
    │   ├─ unreadCount
    │   └─ totalPages
    │
    ├─→ Update State
    │   └─ setNotifications(notifications)
    │
    ├─→ Render Drawer
    │   ├─ Header: "Notifications"
    │   ├─ Notification List
    │   │   ├─ Avatar (sender initials)
    │   │   ├─ Message
    │   │   ├─ Timestamp
    │   │   └─ Priority Color
    │   ├─ "View All" Button
    │   └─ Footer
    │
    └─→ Mark All as Read
        ├─ GraphQL Mutation: markAllNotificationsAsRead
        └─ Update Backend
```

### 7. Notification Click & Routing Flow

```
User Clicks Notification
    │
    ├─→ handleNotificationClick(note)
    │
    ├─→ Validate Notification
    │   ├─ Check isRouted = true
    │   └─ Check type exists
    │
    ├─→ Check Organization Context
    │   ├─ Get Current: orgId, subOrgId, processId
    │   ├─ Get Notification: orgId, subOrgId, processId
    │   └─ Compare Values
    │
    ├─→ Decision Point
    │   │
    │   ├─ If Context Matches
    │   │   └─ Route Directly
    │   │
    │   └─ If Context Differs
    │       ├─ Show Confirmation Dialog
    │       ├─ User Confirms
    │       ├─ Update Cookies
    │       │   ├─ orgId
    │       │   ├─ subOrgId
    │       │   └─ processId
    │       ├─ Update Redux State
    │       │   └─ setProcess()
    │       └─ Route to Target
    │
    ├─→ Route Based on Type
    │   │
    │   ├─ If type = "SOURCE"
    │   │   └─ /tickets/Source/{ticketId}/view
    │   │
    │   └─ If type includes "IMPORT"
    │       └─ /exports/{taskId}/task-details/
    │
    └─→ Close Drawer
        └─ onClose()
```

---

## Component Hierarchy

```
App
├── Providers
│   ├── Redux Store
│   ├── Apollo Client
│   ├── Toast Provider
│   └── Theme Registry
│
└── Layout
    ├── NotificationContext.Provider
    │   ├── triggerPushAction
    │   └── notificationTriggered
    │
    ├── NotificationSetup
    │   ├── Service Worker Registration
    │   ├── FCM Token Generation
    │   ├── Message Handlers
    │   └── Token Persistence
    │
    ├── Header
    │   ├── Logo
    │   ├── Organization Selector
    │   ├── Process Selector
    │   ├── User Menu
    │   └── Notification Bell
    │       ├── Badge (unreadCount)
    │       └── IconButton (onClick → openDrawer)
    │
    ├── CreateDrawer
    │   ├── Drawer Container
    │   ├── Notification List
    │   │   └── Notification Items
    │   │       ├── Avatar
    │   │       ├── Message
    │   │       └── Timestamp
    │   ├── View All Button
    │   └── Confirmation Dialog
    │
    ├── NavBar
    │
    ├── Main Content
    │   └── Page Routes
    │       ├── /notifications (Full Page)
    │       ├── /tickets/Source/{id}/view
    │       └── /exports/{id}/task-details/
    │
    └── Footer
```

---

## State Management

### Redux State
```
store
├── user
│   ├── id (userId)
│   ├── email
│   └── ...
├── process
│   ├── organizationID
│   ├── subOrganizationId
│   └── processId
├── loader
│   └── boolean
└── timer
    └── isProcessing
```

### Context State
```
NotificationContext
├── triggerPushAction: () => void
└── notificationTriggered: boolean
```

### Local Component State
```
Header
├── unreadCount: number
├── openDrawer: boolean
└── notifications: Notification[]

CreateDrawer
├── notifications: Notification[]
├── confirmSwitch: boolean
├── pendingNote: Notification | null
└── loader: boolean
```

---

## API Endpoints Summary

| Operation | Type | Endpoint | Purpose |
|-----------|------|----------|---------|
| Add Token | Mutation | `addNotificationToken` | Register FCM token |
| Get Count | Query | `notificationStats` | Get unread count |
| Get List | Query | `notificationHistory` | Fetch notifications |
| Mark Read | Mutation | `markAllNotificationsAsRead` | Mark all as read |

---

## Security Layers

```
┌─────────────────────────────────────────┐
│  Frontend (Public)                      │
│  - Firebase Config (Public by design)   │
│  - FCM Token (Device-specific)          │
└─────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────┐
│  Backend (Protected)                    │
│  - Token Validation                     │
│  - User Authorization                   │
│  - Notification Filtering               │
│  - Database Encryption                  │
└─────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────┐
│  Firebase (Secured)                     │
│  - Firebase Security Rules              │
│  - Token Expiration                     │
│  - Rate Limiting                        │
└─────────────────────────────────────────┘
```

---

**Last Updated:** October 28, 2025
**Version:** 1.0

