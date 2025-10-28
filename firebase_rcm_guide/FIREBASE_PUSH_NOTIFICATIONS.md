# Firebase Push Notifications Implementation Guide

## Overview

This document provides a comprehensive guide on how Firebase Cloud Messaging (FCM) push notifications are implemented and used in the ASP-RCM Frontend project. It covers the complete end-to-end flow from initialization to displaying notifications on the bell icon in the header.

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Key Components](#key-components)
3. [Environment Setup](#environment-setup)
4. [End-to-End Flow](#end-to-end-flow)
5. [File Structure](#file-structure)
6. [Detailed Implementation](#detailed-implementation)
7. [Notification Display](#notification-display)
8. [Troubleshooting](#troubleshooting)

---

## Architecture Overview

The Firebase push notification system in this project uses:

- **Firebase Cloud Messaging (FCM)** - Backend service for sending push notifications
- **Service Workers** - Handle background notifications when the app is not in focus
- **React Context API** - Manage notification state across the application
- **React Hot Toast** - Display toast notifications in the foreground
- **GraphQL API** - Store and retrieve notification tokens and history

### Key Technologies

- Firebase SDK v11.10.0
- Next.js 15.3.2 (React 19)
- Service Worker API
- Web Push API

---

## Key Components

### 1. **Firebase Configuration** (`src/lib/firebast.ts`)

Initializes Firebase with environment variables:

```typescript
import { initializeApp } from 'firebase/app';
import { getMessaging } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

const app = initializeApp(firebaseConfig);
export const messaging = getMessaging(app);
```

### 2. **Notification Setup Component** (`src/app/[components]/NotificationSetup.tsx`)

Core component that:
- Registers the service worker
- Obtains FCM token
- Sends token to backend
- Handles foreground and background messages

### 3. **Notification Context** (`src/app/[components]/NotificationContext.tsx`)

Provides global state for notification triggers:

```typescript
type NotificationContextType = {
  triggerPushAction?: () => void;
  notificationTriggered?: boolean;
};
```

### 4. **Service Worker** (`public/firebase-messaging-sw.js`)

Handles background notifications and communicates with the main app thread.

### 5. **Header Component** (`src/app/Layout/header.tsx`)

Displays the notification bell icon with unread count badge.

### 6. **Notification Drawer** (`src/app/Layout/createDrawer.tsx`)

Right-side drawer showing notification list when bell icon is clicked.

### 7. **Notifications Page** (`src/app/(protected)/notifications/page.tsx`)

Full-page view of all notifications with pagination and routing.

---

## Environment Setup

### Required Environment Variables

Add these to `.env.development` and `.env.production`:

```bash
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id
NEXT_PUBLIC_FIREBASE_VAPID_KEY=your_vapid_key
```

### Service Worker Generation

The `scripts/generate-sw.js` script dynamically generates the service worker with environment variables during build time:

```bash
npm run generate-sw
```

This is automatically run before `dev`, `build`, and `dev:prod` commands.

---

## End-to-End Flow

### 1. **Initialization Phase**

```
App Start
  ↓
Layout Component Mounts
  ↓
NotificationContext Provider Wraps App
  ↓
NotificationSetup Component Mounts
```

### 2. **Token Registration Phase**

```
NotificationSetup Component
  ↓
Check Browser Support (Service Worker, Push Manager, Notification API)
  ↓
Register Service Worker (/firebase-messaging-sw.js)
  ↓
Get FCM Token from Firebase
  ↓
Send Token to Backend via GraphQL (addPushNotificationToken mutation)
  ↓
Token Stored in Database
```

### 3. **Foreground Notification Phase**

```
Backend Sends Push Notification
  ↓
Firebase Receives Message
  ↓
App is in Focus
  ↓
onMessage Handler Triggered (NotificationSetup.tsx)
  ↓
Toast Notification Displayed
  ↓
triggerPushAction() Called
  ↓
notificationTriggered State Set to True
```

### 4. **Background Notification Phase**

```
Backend Sends Push Notification
  ↓
Firebase Receives Message
  ↓
App is NOT in Focus
  ↓
Service Worker onBackgroundMessage Handler Triggered
  ↓
Service Worker Posts Message to Main Thread
  ↓
Main Thread Message Listener Receives Event
  ↓
handleNotification() Called
  ↓
Toast Notification Displayed
  ↓
triggerPushAction() Called
```

### 5. **Bell Icon Update Phase**

```
notificationTriggered = true
  ↓
Header Component Detects Change (useEffect)
  ↓
notificationCount() API Called
  ↓
getNotificationCount GraphQL Query Executed
  ↓
unreadCount Retrieved from Backend
  ↓
Badge Component Updated with Count
  ↓
Bell Icon Displays Unread Count
```

### 6. **Notification Drawer Phase**

```
User Clicks Bell Icon
  ↓
openDrawer State Set to True
  ↓
CreateDrawer Component Opens
  ↓
getNotificationList GraphQL Query Called
  ↓
Notifications Fetched from Backend
  ↓
Drawer Displays Notification List
  ↓
markAsAllRead() Called
  ↓
All Notifications Marked as Read
```

### 7. **Notification Click Phase**

```
User Clicks Notification in Drawer
  ↓
handleNotificationClick() Executed
  ↓
Check if Org/SubOrg/Process Context Needs Switch
  ↓
If Switch Needed: Show Confirmation Dialog
  ↓
If Confirmed: Update Cookies and Redux State
  ↓
Route to Target Page (Ticket or Export Task)
  ↓
Drawer Closes
```

---

## File Structure

```
Frontend-Agent/
├── src/
│   ├── app/
│   │   ├── [components]/
│   │   │   ├── NotificationSetup.tsx          # Core notification setup
│   │   │   ├── NotificationContext.tsx        # Context provider
│   │   │   └── ...
│   │   ├── Layout/
│   │   │   ├── header.tsx                     # Bell icon component
│   │   │   ├── createDrawer.tsx               # Notification drawer
│   │   │   └── index.tsx                      # Layout wrapper
│   │   ├── (protected)/
│   │   │   └── notifications/
│   │   │       └── page.tsx                   # Full notifications page
│   │   └── Providers.tsx                      # App providers setup
│   ├── api/
│   │   ├── header/
│   │   │   ├── header.ts                      # API functions
│   │   │   └── query.ts                       # GraphQL queries
│   │   └── tickets/
│   │       ├── source.ts                      # Token registration API
│   │       └── query.ts                       # GraphQL mutations
│   └── lib/
│       └── firebast.ts                        # Firebase config
├── public/
│   └── firebase-messaging-sw.js               # Service worker (generated)
├── scripts/
│   └── generate-sw.js                         # SW generation script
├── docs/
│   ├── FIREBASE_ENV_SETUP.md                  # Environment setup
│   └── FIREBASE_PUSH_NOTIFICATIONS.md         # This file
└── package.json
```

---

## Detailed Implementation

### NotificationSetup Component Flow

**File:** `src/app/[components]/NotificationSetup.tsx`

1. **Browser Capability Check**
   - Verifies Service Worker support
   - Checks Push Manager availability
   - Confirms Notification API support

2. **Service Worker Registration**
   ```typescript
   const registration = await navigator.serviceWorker.register(
     "/firebase-messaging-sw.js"
   );
   ```

3. **FCM Token Generation**
   ```typescript
   const token = await getToken(messaging, {
     vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
     serviceWorkerRegistration: registration,
   });
   ```

4. **Token Persistence**
   ```typescript
   await addPushNotificationToken({ token: [token] });
   ```
   - Calls GraphQL mutation `PUSHNOTIFICATION_ADD`
   - Stores token in backend database

5. **Message Handlers**
   - **Foreground:** `onMessage(messaging, handleNotification)`
   - **Background:** Service Worker posts message to main thread
   - Both trigger `triggerPushAction()` to update UI

### Toast Notification Display

When a notification is received:

```typescript
toast.custom((t) => (
  <div className="flex items-start border-l-4 border-blue-500 p-4 bg-white rounded-md shadow-md">
    <Info className="text-blue-500 w-5 h-5 mt-0.5 mr-3" />
    <div className="flex-1">
      <p className="text-sm font-semibold text-gray-800">{title}</p>
      <p className="text-sm text-gray-600">{body}</p>
    </div>
    <button onClick={() => toast.dismiss(t.id)}>✕</button>
  </div>
), {
  position: "top-center",
  duration: 5000,
});
```

---

## Notification Display

### Bell Icon with Badge

**File:** `src/app/Layout/header.tsx` (Lines 537-563)

```typescript
<Badge
  badgeContent={unreadCount}
  color="error"
  overlap="circular"
  anchorOrigin={{
    vertical: "top",
    horizontal: "right",
  }}
>
  <IconButton
    onClick={(e) => {
      if (isProcessing) {
        e?.preventDefault();
        dispatch(showModal());
        return;
      }
      setopenDrawer(true);
      markasAllRead();
    }}
    className={`${pathname.includes("notifications") ? "!bg-[#1465ab]" : "!bg-teal-500"}`}
    sx={{ width: 35, height: 35 }}
  >
    <NotificationsIcon fontSize="small" className="!text-white" />
  </IconButton>
</Badge>
```

### Notification Drawer

**File:** `src/app/Layout/createDrawer.tsx`

- Displays up to 10 notifications per page
- Shows sender avatar with priority-based color
- Displays relative time (e.g., "2 hours ago")
- Clickable notifications route to relevant pages
- "View All" button navigates to full notifications page

### Notification List Page

**File:** `src/app/(protected)/notifications/page.tsx`

- Full-page view with pagination
- Supports filtering and sorting
- Shows all notification details
- Handles org/process context switching

---

## GraphQL Queries and Mutations

### Add Notification Token

**Mutation:** `PUSHNOTIFICATION_ADD`

```graphql
mutation AddNotificationToken($token:[String!]!) {
    addNotificationToken(token: $token)
}
```

### Get Notification List

**Query:** `NOTIFICATION_LIST`

```graphql
query NotificationHistory ($input:GetNotificationHistoryInput!){
    notificationHistory(input: $input) {
        total
        page
        limit
        totalPages
        hasNext
        hasPrev
        unreadCount
        notifications {
           _id
            notificationId
            senderId
            userId
            userEmail
            type
            title
            message
            channels
            priority
            status
            data
            metadata
            sentAt
            deliveredAt
            readAt
            orgId
            subOrgId
            processId
            isRead
            createdAt
            updatedAt
            senderName
            senderEmail
            isRouted
        }
    }
}
```

### Get Notification Count

**Query:** `NOTIFICATION_COUNT`

```graphql
query NotificationStats($userId:String) {
    notificationStats(userId:$userId) {
        totalNotifications
        unreadCount
        readCount
    }
}
```

### Mark All as Read

**Mutation:** `MARK_AS_READ`

```graphql
mutation MarkAllNotificationsAsRead {
    markAllNotificationsAsRead {
        message
        affectedCount
        success
    }
}
```

---

## Notification Types

The system supports different notification types:

- **SOURCE** - Ticket-related notifications
  - Routes to: `/tickets/Source/{ticketId}/view`

- **IMPORT** - Import/Export task notifications
  - Routes to: `/exports/{taskId}/task-details/`

---

## State Management

### Redux Integration

- **User ID:** Retrieved from Redux store (`state.user.id`)
- **Organization Context:** Stored in cookies and Redux
- **Loading State:** Managed via `setLoading` action

### Context API

- **NotificationContext:** Provides `triggerPushAction` and `notificationTriggered`
- **Provider:** Wraps entire app in `Layout` component

---

## Troubleshooting

### Issue: Service Worker Not Registering

**Solution:**
- Ensure `/firebase-messaging-sw.js` exists in public folder
- Run `npm run generate-sw` to regenerate
- Check browser console for errors
- Verify HTTPS is enabled (required for Service Workers)

### Issue: FCM Token Not Generated

**Solution:**
- Verify all Firebase environment variables are set
- Check VAPID key is correct
- Ensure browser supports Web Push API
- Check browser notification permissions

### Issue: Notifications Not Appearing

**Solution:**
- Verify token was sent to backend successfully
- Check backend is sending notifications to correct token
- Ensure app is not in "Do Not Disturb" mode
- Check notification permissions in browser settings

### Issue: Bell Icon Not Updating

**Solution:**
- Verify `notificationTriggered` state is being set
- Check `notificationCount()` API is being called
- Ensure user ID is correctly retrieved from Redux
- Check GraphQL query response in network tab

### Issue: Drawer Not Opening

**Solution:**
- Verify `openDrawer` state is being toggled
- Check `getNotificationList` API is working
- Ensure user has permission to view notifications
- Check for JavaScript errors in console

---

## Performance Considerations

1. **Token Refresh:** Tokens are obtained once during component mount
2. **Notification Polling:** Count is updated only when notification is received
3. **Drawer Lazy Loading:** Notifications loaded only when drawer opens
4. **Message Deduplication:** Service Worker prevents duplicate messages

---

## Security Notes

- All Firebase config values are public (sent to client)
- Sensitive operations secured on Firebase backend with rules
- Tokens stored securely in backend database
- User can only access their own notifications

---

## Future Enhancements

1. Implement notification sound/vibration
2. Add notification categories and filtering
3. Implement notification scheduling
4. Add notification preferences/settings
5. Implement notification analytics
6. Add rich notifications with images/actions

---

## References

- [Firebase Cloud Messaging Documentation](https://firebase.google.com/docs/cloud-messaging)
- [Web Push API](https://developer.mozilla.org/en-US/docs/Web/API/Push_API)
- [Service Workers](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [React Context API](https://react.dev/reference/react/useContext)

---

**Last Updated:** October 28, 2025
**Version:** 1.0

