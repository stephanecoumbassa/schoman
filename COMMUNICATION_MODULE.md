# 📬 Communication Module - Technical Documentation

## Overview

The Communication Module provides a complete internal messaging system for the Schoman school management application. It enables secure communication between administrators, teachers, students, and parents with features like conversation threading, priority levels, read tracking, and archiving.

## Features Implemented

### Core Messaging Features
- ✅ **Send Messages**: Create and send messages to one or multiple recipients
- ✅ **Inbox/Sent Box**: Separate views for received and sent messages
- ✅ **Read Tracking**: Automatic tracking of read/unread status
- ✅ **Conversation Threading**: Reply to messages with parent-child relationships
- ✅ **Priority Levels**: Low, Normal, High, Urgent
- ✅ **Categories**: General, Academic, Administrative, Event, Announcement
- ✅ **Archive Messages**: Clean up inbox by archiving old messages
- ✅ **Delete Messages**: Senders and admins can delete messages
- ✅ **Search**: Full-text search across subjects and content
- ✅ **Filter**: Filter by category, priority, read status
- ✅ **Statistics**: Dashboard with message statistics

### Technical Features
- ✅ Role-based access control
- ✅ Input validation and sanitization
- ✅ MongoDB indexing for performance
- ✅ Responsive UI with Tailwind CSS
- ✅ TypeScript type safety
- ✅ RESTful API design

---

## Backend Implementation

### Database Schema

#### Message Model (`backend/src/models/Message.ts`)

```typescript
{
  subject: String (required, max 200 chars)
  content: String (required, max 5000 chars)
  sender: ObjectId -> User (required)
  recipients: [ObjectId] -> User (required)
  conversationId: String (for threading)
  priority: 'low' | 'normal' | 'high' | 'urgent'
  category: 'general' | 'academic' | 'administrative' | 'event' | 'announcement'
  readBy: [{ user: ObjectId, readAt: Date }]
  isArchived: Boolean
  parentMessage: ObjectId -> Message
  timestamps: true
}
```

**Indexes:**
- Text search on `subject` and `content`
- `sender` + `createdAt` (descending)
- `recipients` + `createdAt` (descending)
- `conversationId` + `createdAt` (ascending)
- `category` + `priority`

### API Endpoints

All endpoints require authentication via JWT token.

#### 1. Create Message
```
POST /api/messages
```

**Request Body:**
```json
{
  "subject": "Subject of the message",
  "content": "Content of the message",
  "recipients": ["userId1", "userId2"],
  "priority": "normal",
  "category": "general",
  "parentMessage": "optional-parent-message-id"
}
```

**Response:**
```json
{
  "message": "Message envoyé avec succès",
  "data": {
    "_id": "...",
    "subject": "...",
    "content": "...",
    "sender": { ... },
    "recipients": [ ... ],
    "conversationId": "...",
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

#### 2. Get Messages (Inbox/Sent)
```
GET /api/messages?box=inbox&page=1&limit=20
```

**Query Parameters:**
- `box`: 'inbox' | 'sent' (default: 'inbox')
- `category`: Filter by category
- `priority`: Filter by priority
- `unreadOnly`: 'true' to show only unread messages
- `search`: Full-text search term
- `page`: Page number (default: 1)
- `limit`: Results per page (default: 20, max: 100)

**Response:**
```json
{
  "messages": [ ... ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "pages": 3
  }
}
```

#### 3. Get Single Message
```
GET /api/messages/:id
```

**Response:**
```json
{
  "message": { ... }
}
```

#### 4. Mark as Read
```
PATCH /api/messages/:id/read
```

Automatically marks the message as read for the current user when they view it in the inbox.

**Response:**
```json
{
  "message": "Message marqué comme lu",
  "data": { ... }
}
```

#### 5. Archive Message
```
PATCH /api/messages/:id/archive
```

**Response:**
```json
{
  "message": "Message archivé avec succès"
}
```

#### 6. Delete Message
```
DELETE /api/messages/:id
```

Only the sender or an admin can delete a message.

**Response:**
```json
{
  "message": "Message supprimé avec succès"
}
```

#### 7. Get Conversation
```
GET /api/messages/conversation/:conversationId
```

Retrieves all messages in a conversation thread.

**Response:**
```json
{
  "messages": [ ... ],
  "conversationId": "..."
}
```

#### 8. Get Statistics
```
GET /api/messages/stats
```

**Response:**
```json
{
  "totalReceived": 15,
  "totalSent": 8,
  "unreadCount": 3,
  "readPercentage": "80.0",
  "byCategory": {
    "general": 5,
    "academic": 3,
    "administrative": 7
  },
  "byPriority": {
    "normal": 10,
    "high": 3,
    "urgent": 2
  }
}
```

### Controller Functions

**File:** `backend/src/controllers/messageController.ts`

1. **createMessage** - Create and send a new message
   - Validates recipients exist and are active
   - Generates conversation ID for threading
   - Sends to one or multiple recipients

2. **getMessages** - List messages (inbox or sent)
   - Supports filtering by category, priority, read status
   - Full-text search capability
   - Pagination support

3. **getMessage** - Get single message details
   - Access control: only sender, recipient, or admin

4. **markAsRead** - Mark message as read
   - Tracks read timestamp per user
   - Prevents duplicate read entries

5. **archiveMessage** - Archive a message
   - Access control: sender, recipient, or admin

6. **deleteMessage** - Permanently delete a message
   - Access control: sender or admin only

7. **getConversation** - Get all messages in a thread
   - Retrieves messages by conversation ID
   - Access control: participants only

8. **getMessageStats** - Get messaging statistics
   - Aggregates counts by category and priority
   - Calculates read percentage

---

## Frontend Implementation

### MessagesView Component

**File:** `frontend/src/views/MessagesView.vue`

A comprehensive Vue 3 component with the following sections:

#### 1. Statistics Dashboard
- Total messages received
- Total messages sent
- Unread count
- Read percentage

#### 2. Navigation Tabs
- Inbox (received messages)
- Sent (sent messages)

#### 3. Filters
- Category dropdown
- Priority dropdown
- Search input with debouncing
- Unread-only checkbox (inbox)

#### 4. Messages List
- Visual distinction for unread messages (blue background)
- Priority and category badges
- Sender/recipient information
- Message preview (2 lines)
- Relative timestamps
- Click to view full message

#### 5. Compose Modal
- Recipients multi-select
- Priority selector
- Category selector
- Subject input (max 200 chars)
- Content textarea (max 5000 chars)
- Character counter

#### 6. View Message Modal
- Full message display
- Sender and recipient info
- Priority and category badges
- Action buttons:
  - Reply (inbox only)
  - Archive
  - Delete (sender/admin only)

#### 7. Pagination
- Previous/Next buttons
- Current page indicator

### TypeScript Types

**File:** `frontend/src/types/index.ts`

```typescript
interface Message {
  _id: string;
  subject: string;
  content: string;
  sender: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
  };
  recipients: [...];
  conversationId?: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  category: 'general' | 'academic' | 'administrative' | 'event' | 'announcement';
  readBy: { user: string; readAt: string }[];
  isArchived: boolean;
  parentMessage?: {...};
  createdAt: string;
  updatedAt: string;
}

interface MessageFormData {
  subject: string;
  content: string;
  recipients: string[];
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  category?: 'general' | 'academic' | 'administrative' | 'event' | 'announcement';
  parentMessage?: string;
}

interface MessageStats {
  totalReceived: number;
  totalSent: number;
  unreadCount: number;
  readPercentage: string;
  byCategory: Record<string, number>;
  byPriority: Record<string, number>;
}
```

### API Service Methods

**File:** `frontend/src/services/api.ts`

```typescript
class ApiService {
  async getMessages(params?: QueryParams)
  async getMessage(id: string)
  async createMessage(data: MessageFormData)
  async markMessageAsRead(id: string)
  async archiveMessage(id: string)
  async deleteMessage(id: string)
  async getConversation(conversationId: string)
  async getMessageStats()
}
```

### Routing

**File:** `frontend/src/router/index.ts`

```typescript
{
  path: '/messages',
  name: 'messages',
  component: MessagesView,
  meta: { requiresAuth: true }
}
```

---

## Seed Data

The seed script creates 5 sample messages:

1. **Welcome Message** (Admin → Teacher)
   - Category: Administrative
   - Priority: Normal
   - Status: Read

2. **Reply to Welcome** (Teacher → Admin)
   - Category: Administrative
   - Priority: Normal
   - Parent of message #1
   - Status: Read

3. **Homework Notification** (Teacher → Student)
   - Category: Academic
   - Priority: Normal
   - Status: Unread

4. **Event Announcement** (Admin → Teacher, Student)
   - Category: Event
   - Priority: High
   - Status: Unread

5. **Urgent Meeting Notice** (Admin → Teacher)
   - Category: Administrative
   - Priority: Urgent
   - Status: Unread

---

## Usage Examples

### Sending a Message

1. Click "Nouveau message" button
2. Select one or more recipients
3. Choose priority and category
4. Enter subject and message content
5. Click "Envoyer"

### Replying to a Message

1. Click on a message in the inbox
2. Click "Répondre" button
3. The reply form pre-fills:
   - Subject: "Re: [original subject]"
   - Recipients: Original sender
   - Priority & Category: Same as original
4. Write your reply and send

### Filtering Messages

- Select category from dropdown
- Select priority from dropdown
- Check "unread only" for unread messages
- Use search box for full-text search
- Combine filters for refined results

### Managing Messages

- **Archive**: Click message → Archive button
- **Delete**: Click message → Delete button (if authorized)
- **Mark as Read**: Automatically done when viewing

---

## Security & Permissions

### Access Control

- **Read Messages**: Recipients and sender can view
- **Mark as Read**: Only recipients
- **Archive**: Sender, recipients, or admin
- **Delete**: Sender or admin only
- **Reply**: Any authenticated user

### Validation

- Subject: Required, max 200 characters
- Content: Required, max 5000 characters
- Recipients: At least one required, must exist and be active
- Priority: Must be one of allowed values
- Category: Must be one of allowed values

---

## Performance Considerations

### Database Indexing

- Text index on `subject` and `content` for search
- Compound index on `sender` + `createdAt` for sent box
- Compound index on `recipients` + `createdAt` for inbox
- Index on `conversationId` for threading
- Compound index on `category` + `priority` for filtering

### Frontend Optimization

- Debounced search input (500ms delay)
- Pagination to limit data transfer
- Relative timestamps for better UX
- Message preview instead of full content in list

### API Optimization

- Query parameter validation
- Limit results per page (max 100)
- Selective field population
- Efficient aggregation for statistics

---

## Future Enhancements

Potential features for future versions:

1. **Attachments**: File upload support
2. **Email Notifications**: Alert users of new messages via email
3. **Push Notifications**: Real-time browser notifications
4. **Read Receipts**: Enhanced read tracking
5. **Message Drafts**: Save unfinished messages
6. **Message Templates**: Pre-defined message templates
7. **Group Messages**: Send to all users in a role or class
8. **Message Scheduling**: Schedule messages for future delivery
9. **Message Export**: Export conversations to PDF
10. **Emoji Support**: Rich text and emoji in messages

---

## Testing Recommendations

### Backend Testing

1. Test message creation with valid data
2. Test validation errors (missing fields, invalid recipients)
3. Test authorization (users can only access their messages)
4. Test pagination and filtering
5. Test conversation threading
6. Test read status tracking
7. Test statistics calculations

### Frontend Testing

1. Test message list rendering
2. Test compose form validation
3. Test filter combinations
4. Test pagination navigation
5. Test reply functionality
6. Test archive and delete operations
7. Test responsive design on mobile

### Integration Testing

1. Send message and verify it appears in recipient's inbox
2. Reply to message and verify conversation threading
3. Archive message and verify it's removed from inbox
4. Delete message and verify it's removed for all
5. Test full-text search functionality
6. Verify statistics update correctly

---

## Troubleshooting

### Common Issues

**Issue**: Messages not appearing in inbox
- **Solution**: Check recipient ID is correct, user is active

**Issue**: Cannot mark message as read
- **Solution**: Ensure user is a recipient of the message

**Issue**: Delete button not showing
- **Solution**: Only sender or admin can delete messages

**Issue**: Search not returning results
- **Solution**: Text indexes must be created in MongoDB

**Issue**: Statistics showing incorrect counts
- **Solution**: Check aggregation pipeline, ensure archived messages are excluded

---

## Maintenance

### Regular Tasks

- **Weekly**: Review undelivered messages
- **Monthly**: Archive old conversations
- **Quarterly**: Review and optimize database indexes
- **Annually**: Purge archived messages older than 2 years

### Monitoring

- Track message delivery rate
- Monitor unread message counts
- Review system usage by role
- Check for spam or abuse

---

## Conclusion

The Communication Module provides a complete, production-ready messaging system for the Schoman school management application. It follows best practices for security, performance, and user experience, and integrates seamlessly with the existing authentication and authorization system.

---

**Module Version**: 1.0.0  
**Last Updated**: December 2024  
**Status**: ✅ Complete & Production Ready
