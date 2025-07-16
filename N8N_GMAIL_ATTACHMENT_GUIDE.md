# N8N Gmail Attachment Processing Guide

## Overview
This guide explains how to properly configure N8N workflows to extract attachment data from Gmail API responses and upload them to DocuAI using the webhook system.

## Problem
When using Gmail nodes in N8N, the default output is a Gmail API response format that contains email metadata but not the actual attachment data. The attachment data needs to be separately fetched and formatted before sending to DocuAI.

## Solution Architecture

### Step 1: Gmail Trigger Setup
```json
{
  "node": "Gmail Trigger",
  "config": {
    "event": "messageReceived",
    "filters": {
      "hasAttachments": true,
      "subject": "contains transaction name"
    }
  }
}
```

### Step 2: Extract Attachment Metadata
The Gmail API response contains attachment information in the message payload:
```json
{
  "payload": {
    "parts": [
      {
        "filename": "document.pdf",
        "body": {
          "attachmentId": "attachment-id-here",
          "size": 12345
        },
        "mimeType": "application/pdf"
      }
    ]
  }
}
```

### Step 3: Fetch Attachment Data
Use a **Gmail** node with operation **"Get Attachment"** for each attachment:

```json
{
  "node": "Gmail - Get Attachment",
  "config": {
    "operation": "getAttachment",
    "messageId": "{{$json.id}}",
    "attachmentId": "{{$json.payload.parts[0].body.attachmentId}}"
  }
}
```

### Step 4: Format for DocuAI Webhook
Use a **Code** node to format the attachment data:

```javascript
// N8N Code Node
const items = [];

for (let i = 0; i < $input.all().length; i++) {
  const item = $input.all()[i];
  const attachment = item.json;
  
  // Format attachment for DocuAI
  const formattedItem = {
    [`attachment_${i}`]: {
      filename: attachment.filename,
      data: attachment.data, // Base64 encoded content
      mimeType: attachment.mimeType
    },
    subject: $('Gmail Trigger').first().json.subject,
    threadId: $('Gmail Trigger').first().json.threadId,
    messageId: $('Gmail Trigger').first().json.id
  };
  
  items.push({
    json: formattedItem
  });
}

return items;
```

### Step 5: Send to DocuAI Webhook
Use **HTTP Request** node with the formatted data:

```json
{
  "node": "HTTP Request",
  "config": {
    "method": "POST",
    "url": "https://your-docuai-instance.replit.dev/api/webhook/upload-attachments",
    "headers": {
      "X-API-Key": "docuai_demo_key_123",
      "Content-Type": "application/json"
    },
    "body": "{{$json}}"
  }
}
```

## Expected Webhook Payload Format

The webhook expects this JSON structure:

```json
{
  "attachment_0": {
    "filename": "HOA-Declaration.pdf",
    "data": "JVBERi0xLjQKJeLjz9MKMSAwIG9iago8PAovVHlwZSAvQ2F0YWxvZwovUGFnZXMgMiAwIFIKPj4KZW5kb2JqCg==",
    "mimeType": "application/pdf"
  },
  "attachment_1": {
    "filename": "Financial-Report.xlsx",
    "data": "UEsDBBQAAAAIAAgAAAAAAAAAAAAAAAAAAAAAFgAAAHhsL3dvcmtzaGVldHMvc2hlZXQxLnhtbJSRQU7DMBBFr+I5a8efOHGWVQsIJFgAEgvEwk1mbKs2M",
    "mimeType": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  },
  "subject": "Property-Review-Transaction-Name",
  "threadId": "thread-id-here",
  "messageId": "message-id-here"
}
```

## Complete N8N Workflow Example

### Node Configuration:
1. **Gmail Trigger** → Monitors for new emails with attachments
2. **Split In Batches** → Processes multiple attachments
3. **Gmail - Get Attachment** → Fetches actual attachment data
4. **Code Node** → Formats data for DocuAI webhook
5. **HTTP Request** → Sends to DocuAI webhook endpoint

### Workflow JSON Structure:
```json
{
  "nodes": [
    {
      "name": "Gmail Trigger",
      "type": "n8n-nodes-base.gmailTrigger",
      "parameters": {
        "event": "messageReceived",
        "filters": {
          "includeSpamTrash": false,
          "hasAttachments": true
        }
      }
    },
    {
      "name": "Extract Attachments",
      "type": "n8n-nodes-base.splitInBatches",
      "parameters": {
        "batchSize": 1,
        "options": {}
      }
    },
    {
      "name": "Get Attachment Data",
      "type": "n8n-nodes-base.gmail",
      "parameters": {
        "operation": "getAttachment",
        "messageId": "={{$json.id}}",
        "attachmentId": "={{$json.payload.parts[0].body.attachmentId}}"
      }
    },
    {
      "name": "Format for DocuAI",
      "type": "n8n-nodes-base.code",
      "parameters": {
        "code": "// See Step 4 code above"
      }
    },
    {
      "name": "Send to DocuAI",
      "type": "n8n-nodes-base.httpRequest",
      "parameters": {
        "method": "POST",
        "url": "https://your-instance.replit.dev/api/webhook/upload-attachments",
        "headers": {
          "X-API-Key": "docuai_demo_key_123"
        },
        "body": "={{$json}}"
      }
    }
  ]
}
```

## Error Handling

### Common Issues:
1. **"No attachment data found in Gmail API response"** - Attachment data was not properly extracted
2. **"Transaction not found"** - Email subject doesn't match any transaction name
3. **"All files are duplicates"** - Files have already been uploaded to this transaction

### Debugging Steps:
1. Check Gmail API response structure in N8N
2. Verify attachment IDs are correctly extracted
3. Ensure attachment data is base64 encoded
4. Confirm transaction name matches email subject exactly

## Testing

Use the test endpoint to verify your configuration:
```bash
curl -X POST https://your-instance.replit.dev/api/webhook/upload-attachments \
  -H "X-API-Key: docuai_demo_key_123" \
  -H "Content-Type: application/json" \
  -d '{
    "attachment_0": {
      "filename": "test.pdf",
      "data": "JVBERi0xLjQKJeLjz9MK...",
      "mimeType": "application/pdf"
    },
    "subject": "Test-Transaction-Name"
  }'
```

## Best Practices

1. **Transaction Naming**: Use consistent transaction names in email subjects
2. **Error Handling**: Add error handling nodes in your N8N workflow
3. **Rate Limiting**: Gmail API has rate limits - add delays between requests
4. **File Size**: Keep attachments under 10MB for optimal performance
5. **Security**: Always use API keys for authentication

## Support

For additional help with N8N configuration or DocuAI integration, refer to:
- DocuAI API documentation
- N8N Gmail node documentation
- Transaction management guide

The webhook endpoint will provide detailed error messages and suggestions when issues occur.