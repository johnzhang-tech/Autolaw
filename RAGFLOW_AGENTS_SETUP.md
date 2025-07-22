# Ragflow Agents Integration Guide

## Overview
The Tade-Altosera platform now includes a dedicated Agents page with two embedded Ragflow agents for specialized legal document analysis.

## Agent Configuration

### Step 1: Update Agent URLs
In `client/src/pages/agents.tsx`, replace the placeholder URLs with your actual Ragflow agent URLs:

```typescript
// Contract Analysis Agent (Tab 1)
<iframe
  src="https://your-actual-ragflow-contract-agent-url.com"
  className="w-full h-full border-0 rounded-b-lg"
  title="Contract Analysis Agent"
  sandbox="allow-same-origin allow-scripts allow-forms"
/>

// Legal Compliance Agent (Tab 2)
<iframe
  src="https://your-actual-ragflow-compliance-agent-url.com"
  className="w-full h-full border-0 rounded-b-lg"
  title="Legal Compliance Agent"
  sandbox="allow-same-origin allow-scripts allow-forms"
/>
```

### Step 2: Configure Agent Specializations

#### Contract Analysis Agent (Tab 1)
- **Focus**: Contract terms, obligations, payment schedules
- **Use Cases**: Contract review, term analysis, legal risk assessment
- **Recommended Training**: Contract templates, legal clauses, obligation structures

#### Legal Compliance Agent (Tab 2)
- **Focus**: Regulatory compliance, violations, risk assessment
- **Use Cases**: Compliance monitoring, regulatory analysis, violation detection
- **Recommended Training**: Regulatory documents, compliance frameworks, legal standards

## Navigation Access

### User Access
- **Location**: Main sidebar → "Agents"
- **URL**: `/agents`
- **Authentication**: Requires login (both admin and regular users)

### Page Features
- **Tabbed Interface**: Switch between Contract Analysis and Compliance agents
- **Responsive Design**: Works on desktop and mobile devices
- **Secure Embedding**: Proper iframe sandboxing for security
- **Professional UI**: Clean interface with agent descriptions

## Security Considerations

### Iframe Sandboxing
The agents are embedded with secure sandbox attributes:
- `allow-same-origin`: Allows iframe content to access its origin
- `allow-scripts`: Enables JavaScript execution within iframe
- `allow-forms`: Permits form submissions from iframe

### Cross-Origin Configuration
Ensure your Ragflow agents are configured to allow embedding:
```http
X-Frame-Options: SAMEORIGIN
Content-Security-Policy: frame-ancestors 'self' your-domain.com
```

## Testing Setup

### Before Ragflow Integration
The page currently shows placeholder messages:
- "🔧 Ragflow Agent 1 - Replace with your actual Ragflow URL"
- "🔧 Ragflow Agent 2 - Replace with your actual Ragflow URL"

### After Configuration
Once URLs are updated, the agents will be fully functional with:
- Real-time chat interfaces
- Document upload capabilities
- Specialized legal analysis
- AI-powered responses

## Troubleshooting

### Common Issues
1. **Agent not loading**: Check CORS/X-Frame-Options settings
2. **Authentication errors**: Verify Ragflow agent authentication setup
3. **Blank iframe**: Confirm agent URLs are accessible and properly formatted

### Browser Compatibility
- ✅ Chrome/Chromium: Full support
- ✅ Firefox: Full support
- ✅ Safari: Full support
- ✅ Edge: Full support

## Additional Customization

### Adding More Agents
To add additional agents, update the `agents.tsx` file:
1. Add new tab button in navigation
2. Create new tab content with iframe
3. Update state management for additional tabs

### Agent Descriptions
Customize agent descriptions in the CardDescription components to match your specific Ragflow agent capabilities.