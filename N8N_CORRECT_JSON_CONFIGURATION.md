# N8N Correct JSON Configuration - Working Solution

The issue is that N8N is sending the JavaScript code as a string instead of executing it. Here's the correct configuration:

## HTTP Request Node Configuration:

**URL**: `https://your-domain.replit.dev/api/transactions/85/upload-form-data`

**Method**: POST

**Authentication**: None

**Headers**:
```
X-API-Key: docuai_demo_key_123
Content-Type: application/json
```

**Body**:
- **Send Body**: Yes
- **Body Content Type**: JSON
- **Body Parameters**: Use the JSON editor and paste this:

```json
{
  "files": {{ $json }}
}
```

**Important**: Make sure you're using `{{ $json }}` not the complex mapping expression!

## Alternative: If you must use the Code Node

If you want to use the Code node, make sure your HTTP Request body is set to:

**Body Content Type**: JSON
**JSON Body**:
```json
{{ $json }}
```

The Code node should return:
```javascript
return [{ 
  json: { 
    files: files 
  } 
}];
```

## Quick Fix: Use the existing /upload-multiple endpoint

Even easier - change your URL to use the working JSON endpoint:

**URL**: `https://your-domain.replit.dev/api/transactions/85/upload-multiple`

**Method**: POST

**Headers**:
```
X-API-Key: docuai_demo_key_123
Content-Type: application/json
```

**Body Content Type**: JSON
**JSON Body**:
```json
{{ $json }}
```

This endpoint already expects the exact format your Code node outputs:
```json
{
  "files": [
    {
      "filename": "Jan Meeting Minutes Revised.pdf",
      "mimeType": "application/pdf", 
      "data": "JVBERi0xL...=="
    },
    ...
  ]
}
```

## Recommended Solution

Use the `/upload-multiple` endpoint with direct JSON body `{{ $json }}` - this is the simplest and most reliable approach.