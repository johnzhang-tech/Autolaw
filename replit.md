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

## Current Features - Mobile HOA Document Upload System

### ✅ Completed Implementation
- **Mobile-Ready Upload Interface**: Drag-and-drop file upload with progress tracking
- **File Processing Pipeline**: PDF, DOC, DOCX, and TXT file support with 10MB size limit
- **AI Document Analysis**: Simulated Ragflow integration with HOA-specific analysis
- **Message Queue System**: Bull/Redis queue for reliable document processing during network issues
- **Real-time Progress Tracking**: Upload progress, analysis status, and completion notifications
- **Mobile Chat Interface**: Ask AI questions about uploaded documents
- **Risk Assessment**: Automated risk scoring (1-100) for HOA documents
- **Compliance Monitoring**: Detection of fees, violations, restrictions, and insurance issues

### 🔧 Technical Architecture
- **Backend**: Express.js with multer for file uploads, Bull queues for reliability
- **Frontend**: React with mobile-first responsive design, drag-and-drop interface
- **Database**: PostgreSQL with extended schema for documents, queue jobs, and analysis results
- **Queue System**: Redis-backed message queue with automatic retry and failure handling
- **AI Integration**: Ready for Ragflow integration with mock analysis currently active

### 📱 Mobile Features
- **Touch-Friendly Upload**: Large upload areas optimized for mobile devices
- **Progress Feedback**: Real-time upload progress with visual indicators
- **Network Resilience**: Documents queued during network issues, processed when connection restored
- **Responsive Design**: Optimized layouts for phones, tablets, and desktops

### 🏠 HOA Document Analysis
- **Fee Analysis**: Detection of monthly fees, assessments, payment schedules
- **Violation Detection**: Identification of compliance issues and violations
- **Risk Scoring**: Automated risk assessment based on document content
- **Compliance Issues**: Structured reporting of potential problems
- **Recommendations**: AI-generated suggestions for addressing issues

## User Preferences

Preferred communication style: Simple, everyday language.
Real estate expertise: Focus on HOA documents, contract analysis, risk assessment, and compliance monitoring.
OAuth Requirements: Multi-provider authentication (Google, Yahoo, Outlook) with email/password fallback.
Mobile Upload Requirements: Drag-and-drop upload, network reliability with queue system, AI-powered HOA analysis.

## Current Features - AI-Powered Q&A Chatbot

### ✅ Completed OpenAI Integration
- **OpenAI GPT-4o Chat**: Advanced AI model with HOA document expertise
- **Backend Endpoints**: `/api/chat` for general questions, `/api/documents/:id/chat` for document-specific queries  
- **Smart Prompting**: Specialized system prompts for HOA fees, violations, compliance, insurance, maintenance
- **Context-Aware Responses**: AI analyzes document metadata and provides specific recommendations
- **Mobile Chat Interface**: Professional white-themed UI with typing indicators and real-time messaging

### 🔧 Technical Implementation
- **OpenAI Integration**: server/openai.ts with proper error handling and response formatting
- **Chat Endpoints**: RESTful API design with authentication and session management
- **React Interface**: Mobile-first chat UI with conversation history and auto-scroll
- **Type Safety**: Full TypeScript coverage for chat messages and session management

### 📱 Chat Features
- **Conversation History**: Sessions persist with titles and timestamps
- **Real-time Messaging**: Instant responses with typing indicators
- **Sample Questions**: Pre-built HOA-specific question prompts for new users
- **Document Context**: AI references uploaded document analysis in responses
- **Error Handling**: Graceful fallbacks with user-friendly error messages

### 🏠 HOA AI Expertise
- **Fee Analysis**: Questions about monthly fees, assessments, payment schedules
- **Compliance Guidance**: Violation detection and resolution advice
- **Insurance Requirements**: Coverage analysis and recommendations
- **Maintenance Responsibilities**: Property care and HOA obligations
- **Risk Assessment**: Document-based risk scoring and mitigation strategies

## Current Features - Comprehensive Mobile & PWA Optimization

### ✅ Mobile-First Design System
- **Enhanced Viewport Configuration**: Comprehensive meta viewport with safe area support and iOS optimization
- **Touch-Friendly CSS**: 44px minimum touch targets, eliminated tap highlights, optimized scrolling
- **iOS Safari Optimizations**: Prevented input zoom, fixed 100vh issues, safe area inset support
- **Android Chrome Enhancements**: Device-specific optimizations and touch gestures
- **Accessibility Features**: High contrast support, reduced motion compliance, enhanced focus states

### 📱 Progressive Web App (PWA) Implementation
- **Service Worker**: Complete offline support with network-first API caching and cache-first static assets
- **App Manifest**: Professional app metadata with shortcuts, categories, and comprehensive icon set
- **Installation Prompts**: Custom iOS "Add to Home Screen" banner and Android install prompts
- **Background Sync**: Document upload queue with network failure recovery
- **Push Notifications**: Ready for document analysis completion alerts

### 🔧 PWA Technical Features
- **Offline Functionality**: Cached dashboard, analytics, and chat sessions work without internet
- **App-like Experience**: Standalone display mode, native app shortcuts, branded splash screens
- **Performance Optimizations**: Resource preloading, optimized caching strategies, minimal data usage
- **Cross-Platform**: Works on iOS Safari, Android Chrome, and desktop browsers

### 📲 Mobile UX Enhancements
- **Touch Optimization**: Eliminated 300ms click delays, enhanced gesture support, swipe-friendly interfaces
- **Loading States**: Mobile-specific loading animations and progress indicators
- **Error Handling**: Offline fallbacks, network status awareness, graceful degradation
- **Safe Areas**: iPhone notch support, navigation bar padding, gesture-friendly spacing

### 🎨 Design System Optimizations
- **Mobile Navigation**: Fixed bottom navigation, collapsible sidebar, touch-friendly controls
- **Responsive Layouts**: Mobile-first breakpoints, stack layouts, full-width containers
- **Typography**: iOS/Android font size optimization, prevented unwanted zoom on focus
- **Color System**: PWA theme colors, dark mode support, high contrast accessibility

## Current Features - Comprehensive Pricing & Features Page

### ✅ Professional Pricing Implementation
- **Three-Tier Structure**: Starter (Free), Professional ($29/mo), Enterprise ($99/mo) with clear value proposition
- **Detailed Feature Comparison**: Comprehensive matrix showing document limits, AI capabilities, analytics features
- **Mobile-First Design**: Touch-friendly cards with expandable FAQ and responsive layouts
- **Annual Billing Toggle**: 20% discount for annual subscriptions with visual savings indicator
- **Public Access**: Pricing page accessible to non-authenticated users for marketing purposes

### 💰 Pricing Tiers & Features
- **Starter Plan**: 25 docs/month, 50 chat sessions, basic analytics, email support - Forever Free
- **Professional Plan**: 250 docs/month, 500 chat sessions, advanced analytics, API access - $29/month (Most Popular)
- **Enterprise Plan**: Unlimited usage, custom AI models, phone support, full API - $99/month (Best Value)
- **Feature Categories**: Document Analysis, AI Chat & Q&A, Dashboard & Analytics, Support & Integration

### 🎨 UX Design Elements
- **Visual Hierarchy**: Popular plan highlighted with badges and enhanced styling
- **Interactive FAQ**: Expandable sections covering common pricing questions
- **Clear CTAs**: Distinct buttons for each plan (Free Trial, Contact Sales, Get Started)
- **Trust Indicators**: Security badges, uptime guarantees, and professional testimonials section
- **Mobile Optimization**: Stack layouts on mobile, touch-friendly toggles, and swipe-friendly interfaces