# DocuAI - Intelligent Real Estate Document Analysis

## Overview

DocuAI is a full-stack web application designed for real estate professionals to analyze documents using AI-powered tools. The application provides intelligent document review, automated analysis, and Q&A capabilities to streamline real estate workflows.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **UI Library**: shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom design system
- **State Management**: TanStack Query for server state and React hooks for local state
- **Routing**: Wouter for lightweight client-side routing
- **Form Handling**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with Express.js server
- **Language**: TypeScript with ES modules
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Replit Auth with OpenID Connect
- **Session Management**: Express sessions with PostgreSQL store
- **API Design**: RESTful endpoints with JSON responses

### Database Design
- **ORM**: Drizzle with type-safe schema definitions
- **Migration Strategy**: Schema-first approach with automatic migrations
- **Connection**: Neon serverless PostgreSQL with connection pooling
- **Session Storage**: Dedicated sessions table for auth persistence

## Key Components

### Authentication System
- **Provider**: Replit Auth with OIDC integration
- **Session Management**: Secure session cookies with PostgreSQL storage
- **User Management**: Automatic user creation/updates on login
- **Authorization**: Route-level protection with middleware

### UI Component System
- **Design System**: shadcn/ui with customizable themes
- **Accessibility**: Radix UI primitives ensure WCAG compliance
- **Responsive Design**: Mobile-first approach with Tailwind breakpoints
- **Dark Mode**: CSS variables for theme switching support

### Development Workflow
- **Hot Reload**: Vite HMR for instant development feedback
- **Type Safety**: Full TypeScript coverage across frontend and backend
- **Build Process**: Separate client and server builds with esbuild
- **Path Mapping**: Absolute imports with @ aliases for clean code organization

## Data Flow

1. **Authentication Flow**:
   - User initiates login through Replit Auth
   - Server validates OIDC tokens and creates/updates user record
   - Session established with secure cookie storage

2. **Client-Server Communication**:
   - React Query manages API calls with automatic caching
   - Express middleware handles request logging and error handling
   - JSON responses with consistent error formatting

3. **Database Operations**:
   - Drizzle ORM provides type-safe database queries
   - Connection pooling through Neon serverless client
   - Schema migrations managed through drizzle-kit

## External Dependencies

### Core Technologies
- **Database**: Neon PostgreSQL serverless
- **Authentication**: Replit Auth service
- **UI Components**: Radix UI component library
- **Styling**: Tailwind CSS framework
- **Build Tools**: Vite and esbuild

### Development Tools
- **Type Checking**: TypeScript compiler
- **Code Quality**: Built-in linting through React and TypeScript
- **Development Server**: Vite dev server with Express proxy

## Deployment Strategy

### Build Process
- Client build creates optimized static assets in `dist/public`
- Server build bundles Express app with esbuild for Node.js
- Environment variables manage database connections and auth secrets

### Production Configuration
- Express serves static files in production mode
- Database migrations run automatically on deployment
- Session store configured for production PostgreSQL instance

### Environment Requirements
- `DATABASE_URL`: PostgreSQL connection string
- `SESSION_SECRET`: Secure session encryption key
- `REPL_ID`: Replit application identifier
- `ISSUER_URL`: OIDC provider URL (defaults to Replit)

## Changelog

- June 29, 2025. Initial setup with landing page and authentication
- June 29, 2025. Added comprehensive sidebar navigation and document management system
  - Created left sidebar navigation with Create, Home, Documents, Dashboard, Q&A, and Manage sections
  - Implemented database schema for transactions, documents, chat sessions, and messages
  - Added file upload functionality with document categorization
  - Built Q&A chat interface with AI-powered real estate document analysis
  - Created analytics dashboard with portfolio insights and risk alerts
  - Implemented transaction and document management features

## Recent Architectural Changes

### Database Schema Expansion
- Added `transactions` table for real estate transaction management
- Added `documents` table for file uploads with metadata and analysis results
- Added `chatSessions` and `chatMessages` tables for Q&A functionality
- Implemented proper relationships between all entities

### Navigation System
- Built collapsible sidebar navigation matching the provided design reference
- Implemented 6 main sections: Create, Home, Documents, Dashboard, Q&A, Manage
- Added proper routing and page structure for each section

### Document Management
- File upload with drag-and-drop support
- Document categorization (HOA, Contract, Inspection, Financial, Legal)
- Analysis status tracking and metadata storage
- Transaction-based document organization

### AI Integration Preparation
- Chat interface ready for OpenAI integration
- Structured response system for real estate document analysis
- Risk assessment and compliance monitoring framework
- Document categorization and intelligent Q&A responses

## Current Implementation Status (Multi-Provider OAuth)

### ✅ Completed Features
- **Multi-Provider Backend**: Google, Microsoft, Replit OAuth + email/password authentication
- **Enhanced AuthModal**: Mobile-first design with branded provider buttons
- **Unified Session Management**: Consistent session format across all providers  
- **Database Schema**: Extended users table with provider tracking and password hashing
- **Security Features**: bcrypt password hashing, secure sessions, input validation
- **Email/Password Auth**: Complete local authentication system with registration
- **Error Handling**: Comprehensive error states and validation

### 🔄 Ready for OAuth Keys
- Google OAuth configured (awaiting GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET)
- Microsoft OAuth configured (awaiting MICROSOFT_CLIENT_ID and MICROSOFT_CLIENT_SECRET)
- Yahoo OAuth ready for implementation

### 📋 Integration Guide
- Complete setup instructions in OAUTH_INTEGRATION_GUIDE.md
- Testing endpoints for all authentication methods
- Security best practices and troubleshooting guide

## User Preferences

Preferred communication style: Simple, everyday language.
Real estate expertise: Focus on HOA documents, contract analysis, risk assessment, and compliance monitoring.
OAuth Requirements: Multi-provider authentication (Google, Yahoo, Outlook) with email/password fallback.