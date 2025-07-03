# Complete RESTful Users API - DocuAI

## Overview
A comprehensive RESTful Users API built with Node.js/Express and PostgreSQL that provides full CRUD operations for user management. The API includes authentication, validation, filtering, pagination, and role-based access control.

## Standard RESTful Endpoints

### 1. POST /api/users - Create a new user
**Authentication**: Required (Admin only)
**Description**: Create a new user with all fields including region, user_type, user_status, and expiration_date
**HTTP Status Codes**: 201 (Created), 400 (Bad Request), 403 (Forbidden), 409 (Conflict), 500 (Server Error)

**Request Body**:
```json
{
  "id": "user-12345",
  "email": "john.doe@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "provider": "replit",
  "role": "user",
  "region": "US-West",
  "userType": "Recurring",
  "userStatus": "Active",
  "expirationDate": "2025-12-31T23:59:59.000Z"
}
```

**Response (201 Created)**:
```json
{
  "id": "user-12345",
  "email": "john.doe@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "provider": "replit",
  "role": "user",
  "region": "US-West",
  "userType": "Recurring",
  "userStatus": "Active",
  "expirationDate": "2025-12-31T23:59:59.000Z",
  "createdAt": "2025-07-03T03:15:00.000Z",
  "updatedAt": "2025-07-03T03:15:00.000Z"
}
```

### 2. GET /api/users/:id - Read user info by ID
**Authentication**: Required (Own profile or Admin)
**Description**: Retrieve user information by ID. Users can only view their own profile unless they're admin
**HTTP Status Codes**: 200 (OK), 403 (Forbidden), 404 (Not Found), 500 (Server Error)

**Response (200 OK)**:
```json
{
  "id": "user-12345",
  "email": "john.doe@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "provider": "replit",
  "role": "user",
  "region": "US-West",
  "userType": "Recurring",
  "userStatus": "Active",
  "expirationDate": "2025-12-31T23:59:59.000Z",
  "createdAt": "2025-07-03T03:15:00.000Z",
  "updatedAt": "2025-07-03T03:15:00.000Z"
}
```

### 3. PUT /api/users/:id - Update any user field
**Authentication**: Required (Own profile or Admin)
**Description**: Update any user field including new attributes. Non-admin users cannot change roles
**HTTP Status Codes**: 200 (OK), 400 (Bad Request), 403 (Forbidden), 404 (Not Found), 409 (Conflict), 500 (Server Error)

**Request Body** (all fields optional):
```json
{
  "email": "john.updated@example.com",
  "firstName": "John",
  "lastName": "Updated",
  "provider": "google",
  "role": "admin",
  "region": "EU-Central",
  "userType": "One time",
  "userStatus": "Locked",
  "expirationDate": "2024-06-30T23:59:59.000Z"
}
```

### 4. DELETE /api/users/:id - Delete a user
**Authentication**: Required (Admin only)
**Description**: Delete a user account. Admins cannot delete their own account
**HTTP Status Codes**: 200 (OK), 400 (Bad Request), 403 (Forbidden), 404 (Not Found), 500 (Server Error)

**Response (200 OK)**:
```json
{
  "message": "User deleted successfully",
  "deletedUserId": "user-12345"
}
```

### 5. GET /api/users - List all users with filtering
**Authentication**: Required (Admin only)
**Description**: List all users with optional filtering by region, status, or user_type. Includes pagination
**HTTP Status Codes**: 200 (OK), 400 (Bad Request), 403 (Forbidden), 500 (Server Error)

**Query Parameters**:
- `region` (string, optional): Filter by geographic region
- `userStatus` (enum, optional): "Locked" | "Active" | "Expired"
- `userType` (enum, optional): "One time" | "Recurring"
- `limit` (number, optional): Number of users per page (max 100, default 50)
- `offset` (number, optional): Pagination offset (default 0)

**Response (200 OK)**:
```json
{
  "users": [
    {
      "id": "user-12345",
      "email": "john.doe@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "provider": "replit",
      "role": "user",
      "region": "US-West",
      "userType": "Recurring",
      "userStatus": "Active",
      "expirationDate": "2025-12-31T23:59:59.000Z",
      "createdAt": "2025-07-03T03:15:00.000Z",
      "updatedAt": "2025-07-03T03:15:00.000Z"
    }
  ],
  "pagination": {
    "total": 1,
    "limit": 50,
    "offset": 0,
    "hasMore": false
  },
  "filters": {
    "region": null,
    "userStatus": null,
    "userType": null
  }
}
```

## Database Schema (PostgreSQL with Drizzle ORM)

### User Table Definition
```typescript
// Enum definitions
export const userTypeEnum = pgEnum("user_type", ["One time", "Recurring"]);
export const userStatusEnum = pgEnum("user_status", ["Locked", "Active", "Expired"]);

// User table with expanded fields
export const users = pgTable("users", {
  // Existing fields (required for Replit Auth)
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  provider: varchar("provider").default("replit"), // 'replit', 'google', 'microsoft', 'local'
  passwordHash: varchar("password_hash"), // For local auth
  role: varchar("role").default("user"), // 'user', 'admin'
  
  // NEW: Extended user management fields
  region: varchar("region"), // User's geographic region
  userType: userTypeEnum("user_type").notNull().default("One time"), // 'One time', 'Recurring'
  userStatus: userStatusEnum("user_status").notNull().default("Active"), // 'Locked', 'Active', 'Expired'
  expirationDate: timestamp("expiration_date"), // ISO date for user account expiration
  
  // Timestamps
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});
```

### TypeScript Types
```typescript
export type User = typeof users.$inferSelect;
export type UpsertUser = typeof users.$inferInsert;
```

## API Endpoints

### 1. Get User Profile
**GET** `/api/users/profile`
- **Authentication**: Required
- **Description**: Get current user's profile including all new fields
- **Response**: User object without sensitive data (passwordHash excluded)

```json
{
  "id": "mock-user-1",
  "email": "demo@docuai.com",
  "firstName": "Demo",
  "lastName": "User",
  "provider": "replit",
  "role": "admin",
  "region": "US-West",
  "userType": "Recurring",
  "userStatus": "Active",
  "expirationDate": "2025-12-31T23:59:59.000Z",
  "createdAt": "2025-07-01T00:00:00.000Z",
  "updatedAt": "2025-07-03T03:00:00.000Z"
}
```

### 2. Update User Profile
**PATCH** `/api/users/profile`
- **Authentication**: Required
- **Description**: Update current user's profile fields
- **Body Parameters**:
  - `region` (string, optional): Geographic region
  - `userType` (enum, optional): "One time" | "Recurring"
  - `userStatus` (enum, optional): "Locked" | "Active" | "Expired"
  - `expirationDate` (string|null, optional): ISO date string or null

```json
{
  "region": "US-East",
  "userType": "Recurring",
  "userStatus": "Active",
  "expirationDate": "2025-12-31T23:59:59.000Z"
}
```

### 3. Admin: Get All Users
**GET** `/api/admin/users`
- **Authentication**: Required (Admin only)
- **Description**: Get all users with extended information for admin management
- **Response**: Array of user objects without sensitive data

### 4. Admin: Update Any User Profile
**PATCH** `/api/admin/users/:targetUserId`
- **Authentication**: Required (Admin only)
- **Description**: Update any user's profile including role changes
- **Body Parameters**: Same as user profile update, plus:
  - `role` (enum, optional): "user" | "admin"

## Storage Interface Methods

```typescript
interface IStorage {
  // Existing user methods...
  updateUserProfile(userId: string, updates: { 
    region?: string; 
    userType?: 'One time' | 'Recurring';
    userStatus?: 'Locked' | 'Active' | 'Expired';
    expirationDate?: Date | null;
  }): Promise<User>;
}
```

## Database Migration
The schema has been applied using Drizzle's `npm run db:push` command, which:
- Creates the new enum types (`user_type`, `user_status`)
- Adds the new columns to the existing `users` table
- Sets appropriate default values for existing users

## Validation & Error Handling
- Enum validation ensures only valid values are accepted
- Date parsing validates ISO date format for `expirationDate`
- Admin role verification for protected endpoints
- Comprehensive error responses with descriptive messages

## Usage Examples

### Update User Region
```bash
curl -X PATCH /api/users/profile \
  -H "Content-Type: application/json" \
  -d '{"region": "EU-Central"}'
```

### Set User Expiration (Admin)
```bash
curl -X PATCH /api/admin/users/user-123 \
  -H "Content-Type: application/json" \
  -d '{"userStatus": "Expired", "expirationDate": "2025-06-30T23:59:59.000Z"}'
```

### Lock User Account (Admin)
```bash
curl -X PATCH /api/admin/users/user-123 \
  -H "Content-Type: application/json" \
  -d '{"userStatus": "Locked"}'
```

## Express.js Route Implementation Sample

Here's a sample of how the validation middleware and route handlers are implemented:

```javascript
// Input Validation Middleware
const validateUserInput = (req, res, next) => {
  const { userType, userStatus, role, provider } = req.body;
  
  // Validate enum fields
  if (userType && !['One time', 'Recurring'].includes(userType)) {
    return res.status(400).json({ message: 'Invalid userType. Must be "One time" or "Recurring"' });
  }
  
  if (userStatus && !['Locked', 'Active', 'Expired'].includes(userStatus)) {
    return res.status(400).json({ message: 'Invalid userStatus. Must be "Locked", "Active", or "Expired"' });
  }
  
  if (role && !['user', 'admin'].includes(role)) {
    return res.status(400).json({ message: 'Invalid role. Must be "user" or "admin"' });
  }
  
  if (provider && !['replit', 'google', 'microsoft', 'local'].includes(provider)) {
    return res.status(400).json({ message: 'Invalid provider' });
  }
  
  next();
};

// CREATE User Route
app.post('/api/users', isAuthenticated, validateUserInput, async (req, res) => {
  try {
    // Admin access control
    const currentUser = await storage.getUser(req.user.claims.sub);
    if (currentUser?.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }
    
    // Parse and validate expiration date
    let parsedExpirationDate = null;
    if (req.body.expirationDate) {
      parsedExpirationDate = new Date(req.body.expirationDate);
      if (isNaN(parsedExpirationDate.getTime())) {
        return res.status(400).json({ message: 'Invalid expirationDate format' });
      }
    }
    
    // Create user with PostgreSQL/Drizzle
    const newUser = await storage.upsertUser({
      ...req.body,
      expirationDate: parsedExpirationDate,
    });
    
    res.status(201).json(newUser);
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ message: 'Failed to create user' });
  }
});
```

## cURL Examples for Testing

### Create a new user (Admin only)
```bash
curl -X POST http://localhost:5000/api/users \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "id": "user-67890",
    "email": "jane.smith@example.com",
    "firstName": "Jane",
    "lastName": "Smith",
    "region": "EU-Central",
    "userType": "One time",
    "userStatus": "Active",
    "expirationDate": "2025-06-30T23:59:59.000Z"
  }'
```

### Get user by ID
```bash
curl -X GET http://localhost:5000/api/users/user-67890 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Update user profile
```bash
curl -X PUT http://localhost:5000/api/users/user-67890 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "region": "US-East",
    "userStatus": "Expired",
    "expirationDate": "2024-12-31T23:59:59.000Z"
  }'
```

### List users with filters (Admin only)
```bash
curl -X GET "http://localhost:5000/api/users?userStatus=Active&region=US-West&limit=10&offset=0" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Delete user (Admin only)
```bash
curl -X DELETE http://localhost:5000/api/users/user-67890 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Error Handling Examples

### Validation Error Response (400)
```json
{
  "message": "Invalid userType. Must be \"One time\" or \"Recurring\""
}
```

### Unauthorized Access (403)
```json
{
  "message": "Admin access required to create users"
}
```

### User Not Found (404)
```json
{
  "message": "User not found"
}
```

### Duplicate Email (409)
```json
{
  "message": "User with this email already exists"
}
```

This implementation provides a complete RESTful Users API with the requested fields, proper validation, and both user and admin management capabilities.