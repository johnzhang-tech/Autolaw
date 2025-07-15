# N8N Exact Configuration for JSON Upload

## Current Problem
Your N8N HTTP Request node is configured with:
- Body Content Type: `text/html` ❌
- Content Type: `text/html` ❌  
- Body: Empty ❌

## Correct Configuration

### Step 1: Configure Headers
- **X-API-Key**: `docuai_demo_key_123`
- **Content-Type**: `application/json` (NOT text/html)

### Step 2: Configure Body
- **Body Content Type**: `JSON` (NOT text/html)
- **Body**: Select `JSON` from the dropdown

### Step 3: Add JSON Body Content
Click in the JSON body field and add:

```json
{
  "attachment_0": {
    "filename": "{{ $json.attachment_0.filename }}",
    "data": "{{ $json.attachment_0.data }}",
    "mimeType": "application/pdf"
  },
  "attachment_1": {
    "filename": "{{ $json.attachment_1.filename }}",
    "data": "{{ $json.attachment_1.data }}",
    "mimeType": "application/pdf"
  }
}
```

### Step 4: Alternative - Use Code Node
If the above doesn't work, add a Code node before HTTP Request:

**Code Node JavaScript:**
```javascript
const input = $input.all()[0].json;
const payload = {};

// Convert all attachments to base64
Object.keys(input).forEach(key => {
  if (key.startsWith('attachment_')) {
    const attachment = input[key];
    payload[key] = {
      filename: attachment.filename || key,
      data: attachment.data,
      mimeType: attachment.mimeType || 'application/pdf'
    };
  }
});

return [payload];
```

**Then in HTTP Request:**
- Body Content Type: `JSON`
- Body: `{{ $json }}`

## What N8N Should Send

The endpoint expects JSON like this:
```json
{
  "attachment_0": {
    "filename": "Jan Meeting Minutes Revised.pdf",
    "data": "base64encodeddata...",
    "mimeType": "application/pdf"
  },
  "attachment_1": {
    "filename": "HOA Assessment Policy.pdf", 
    "data": "base64encodeddata...",
    "mimeType": "application/pdf"
  }
}
```

## Current Error
The logs show: "No attachments found in JSON body" because your HTTP Request is sending HTML, not JSON.

## Quick Fix
1. Change Body Content Type from `text/html` to `JSON`
2. Remove the empty body comment
3. Add the JSON structure above