# User Management API Schema - DocuAI

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

This implementation provides a complete RESTful Users API with the requested fields, proper validation, and both user and admin management capabilities.