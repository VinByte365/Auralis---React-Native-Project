# Push Notifications System Guide

## Overview

The Auralis push notification system has been enhanced to provide rich, detailed, and interactive notifications with proper deep linking and action support.

## Features

### 1. Detailed Notifications

Push notifications now include:

- **Title & Body**: Main notification message
- **Details Payload**: Rich metadata about the notification
- **Timestamp**: When the notification was sent
- **Notification ID**: Unique identifier for tracking

### 2. Notification Types

#### Order Status Notifications

Sent when an order status changes.

**Data Included:**

- Order ID
- Order Number (last 8 chars for display)
- Status (PENDING, CONFIRMED, SHIPPED, DELIVERED, CANCELLED)
- Total Amount
- Items Count
- Delivery Address
- Payment Method
- Updated Timestamp

**Example Notification Body:**

```
"Your order #ABC12345 is now SHIPPED"
```

#### Promotion Notifications

Sent when a new promotion is created or updated.

**Data Included:**

- Promo ID & Name
- Discount Type (percentage/fixed)
- Discount Value & Text
- Promo Code
- Scope (cart/category/product)
- Usage Limit & Current Usage Count
- Minimum Purchase Amount
- Start & End Dates
- Active Status

**Example Notification Body:**

```
"Save 30% on your next order with Summer Sale. Use code SUMMER30 at checkout."
```

#### Product Discount Notifications

Sent when a product goes on sale or discount price updates.

**Data Included:**

- Product ID & Name
- Original Price
- Sale Price
- Discount Percentage & Amount
- Stock Available
- Category
- Sale Active Status
- Update Timestamp

**Example Notification Body:**

```
"Classic Earphones is now 25% off. Tap to view details."
```

### 3. Clickable Notifications with Deep Linking

All notifications are fully clickable and route to appropriate screens:

| Notification Type | Routes To                                    |
| ----------------- | -------------------------------------------- |
| Order Update      | OrderDetail screen with orderId              |
| Promotion         | NotificationDetails screen with promo info   |
| Product Discount  | NotificationDetails screen with product info |

**Navigation Flow:**

1. User taps notification
2. `handleNotificationNavigation()` extracts route & params
3. App navigates to appropriate screen
4. Details screen displays full information

### 4. Multiple Notification Channels (Android)

Three distinct channels provide better organization:

- **default**: General notifications
- **order**: Order-related updates (HIGH priority)
- **promotion**: Promotions & discounts (DEFAULT priority)

### 5. Rich Detail Display

The **NotificationDetailsScreen** displays:

**For Orders:**

- Order number & ID
- Current status with color coding
- Total amount
- Item count
- Payment method
- Delivery address
- Notification timestamp
- View Order button

**For Promotions:**

- Promo name & code
- Discount amount/percentage
- Scope (cart-wide, category-specific, etc.)
- Usage statistics
- Minimum purchase requirement
- Validity period

**For Products:**

- Product name & link
- Original & sale prices
- Discount percentage & amount
- Stock availability
- View Product button

## Backend Implementation

### Notification Service

**File:** `backend/services/notificationService.js`

#### New Helper Functions

```javascript
// Generate unique notification ID
generateNotificationId();

// Build structured notification data
buildNotificationData({
  screen,
  params,
  details,
  actions,
  notificationId,
  timestamp,
});

// Send notification to single user with options
sendPushToUser(pushToken, title, body, data, options);

// Send promotion to multiple users
sendPromotionNotificationToUsers({ title, body, data, userFilter, options });
```

#### Options Object

```javascript
{
  sound: "default",           // Notification sound
  badge: 1,                   // Badge count
  priority: "high",           // Notification priority
  mutableContent: true        // Allow content modification
}
```

### Order Service Updates

Enhanced notifications sent for:

- **Order Confirmation**: When checkout completes
- **Order Status Update**: When admin updates order status

Each includes order total, items count, delivery address, and payment method.

### Product Service Updates

Enhanced notifications for:

- **New Discount**: When product sale is activated
- **Discount Update**: When sale price changes

Includes original price, sale price, discount percentage, and stock information.

### Promo Service Updates

Enhanced notifications for:

- **Promo Creation**: When new promotion is created
- **Promo Update**: When promo details are modified

Includes discount details, usage stats, validity period, and conditions.

## Mobile Implementation

### Notification Service

**File:** `mobile/src/services/notificationService.js`

#### Key Functions

```javascript
// Register device for push notifications
registerForPushNotificationsAsync();

// Subscribe to foreground notifications
subscribeToForegroundNotifications(onReceive);

// Subscribe to notification responses (taps)
subscribeToNotificationResponses(onResponse);

// Handle notification tap with deep linking
handleNotificationNavigation(navigationRef, response);

// Handle notification action button clicks
handleNotificationAction(navigationRef, response, actionId);

// Create action buttons for order notifications
createOrderNotificationActions(orderId);

// Create action buttons for promo notifications
createPromoNotificationActions(promoCode);

// Create action buttons for product notifications
createProductNotificationActions(productId);

// Get appropriate notification channel for type
getNotificationChannelId(notificationType);

// Format badge count
getNotificationBadge(count);
```

### Notification Details Screen

**File:** `mobile/src/screens/user/NotificationDetailsScreen.js`

**Features:**

- Detects notification type (order/promo/product)
- Displays appropriate details for each type
- Color-coded status badges for orders
- Formatted prices and dates
- Responsive scrollable layout
- Action buttons (View Order, View Product, etc.)
- Loading state for product data fetching
- Error handling and display

## Data Structure

### Notification Data Payload

```javascript
{
  screen: "NotificationDetails",
  params: {
    // Navigation params
    type: "order|promo|promotion",
    title: "Notification Title",
    message: "Notification message body",
    orderId: "...",
    promoId: "...",
    productId: "...",
    // ... type-specific params
  },
  details: {
    // Rich details for display
    orderStatus: "SHIPPED",
    orderTotal: "5000",
    itemsCount: 3,
    promoCode: "SAVE30",
    discountPercent: "30",
    // ... more details
  },
  actions: [
    // Optional action buttons
    { id: "view_order", title: "View Order", icon: "visibility" }
  ],
  notificationId: "notif_1234567890_abc123",
  timestamp: "2024-03-23T10:30:00.000Z"
}
```

## Usage Examples

### Backend: Send Order Notification

```javascript
await getPushTokenAndTrigger(userId, `Your order #ABC123 is now SHIPPED`, {
  screen: "Order",
  params: {
    orderId: order._id,
    orderNumber: order._id.toString().slice(-8),
    status: "SHIPPED",
  },
  details: {
    orderTotal: order.total,
    itemsCount: order.items.length,
    status: "SHIPPED",
    paymentMethod: "COD",
    deliveryAddress: order.deliveryAddress,
  },
});
```

### Backend: Send Promotion Notification

```javascript
const payload = buildPromoNotification({ promo, action: "created" });
await sendPromotionNotificationToUsers(payload);
```

### Frontend: Subscribe to Notifications

```javascript
// In App.js
responseSubscription.current = subscribeToNotificationResponses((response) => {
  handleNotificationNavigation(navigationRef, response);
});
```

### Frontend: Handle Action Buttons

```javascript
subscribeToNotificationResponses((response) => {
  const actionId = response.actionId;
  if (actionId === "view_order") {
    handleNotificationAction(navigationRef, response, actionId);
  }
});
```

## Testing Notifications

### Manual Testing

1. **Send Test Order Notification:**
   - Place an order through the app
   - Verify notification appears
   - Tap notification
   - Should navigate to order details

2. **Send Test Promotion:**
   - Create/update promotion in admin
   - Verify notification to users
   - Tap to see promotion details

3. **Send Test Product Discount:**
   - Update product sale price
   - Verify notification sent
   - Verify details display correctly

### Console Logging

The system logs key events:

- `[Push][Navigation]` - Navigation events
- `[Push][Action]` - Action button clicks
- `[Push][Details]` - Detail screen parameters
- `[API][UPLOAD]` - Push token registration

## Best Practices

1. **Always include timestamps** for tracking and analytics
2. **Use notification IDs** for deduplication and analytics
3. **Keep body text short** (under 150 chars) for readability
4. **Include action buttons** only for relevant notifications
5. **Test on real devices** - Android and iOS behave differently
6. **Monitor delivery** via Expo console
7. **Handle errors gracefully** - invalid tokens, network issues
8. **Respect user preferences** - unsubscribe options

## Troubleshooting

### Notifications Not Appearing

1. Check push token is registered: `expo push token: ...`
2. Verify notification permissions granted
3. Check notification channel is enabled (Android)
4. Review Expo console for errors

### Deep Linking Not Working

1. Verify notification has valid `screen` parameter
2. Check route exists in navigation
3. Review console logs for navigation errors
4. Ensure params are valid (not undefined/null)

### Missing Details

1. Verify backend sending complete data object
2. Check `buildNotificationData()` is called
3. Review frontend parsing in `handleNotificationNavigation()`
4. Check NotificationDetailsScreen handles missing fields

## Future Enhancements

- [ ] Notification delivery receipts
- [ ] User notification preferences/subscriptions
- [ ] Notification analytics dashboard
- [ ] Rich media in notifications (images)
- [ ] Notification grouping/threading
- [ ] Scheduled notifications
- [ ] A/B testing for notification content
- [ ] Notification templates system
