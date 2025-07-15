# N8N Dynamic Array Solution - Handle Any Number of Files

## Problem
Dynamic number of attachments cannot be hardcoded in HTTP Request node parameters.

## Solution: Use N8N's Split In Batches + HTTP Request Loop

### Step 1: Convert Binary to Items (Code Node)
Replace your current code node with this dynamic version:

```javascript
const input = $input.all()[0];
const items = [];

// Convert each binary attachment to a separate item
Object.keys(input.binary || {}).forEach(key => {
  if (key.startsWith('attachment_')) {
    const binaryData = input.binary[key];
    if (binaryData) {
      items.push({
        fieldName: key,
        filename: binaryData.fileName,
        binaryData: binaryData, // Pass the entire binary object
        mimeType: binaryData.mimeType || 'application/pdf'
      });
    }
  }
});

return items;
```

### Step 2: Add Split In Batches Node
After the code node, add a **Split In Batches** node:
- **Batch Size**: 1 (process one file at a time)
- This will create separate executions for each file

### Step 3: Configure HTTP Request Node
**Method:** POST
**URL:** `https://beeed428-ed5d-4903-bc62-3ba70ac303df-00-38fn65dx21909.kirk.replit.dev/api/transactions/81/upload-single`

**Headers:**
- `X-API-Key`: `docuai_demo_key_123`

**Body Content Type:** Form-Data Multipart
**Body Parameters:**
- Field Name: `document`
- Value: `{{ $json.binaryData }}`

### Alternative: Single Request with All Files
If you want to send all files in one request, use this approach:

#### Code Node (Dynamic Form Data Builder)
```javascript
const input = $input.all()[0];
const formData = {};

// Build form data object dynamically
Object.keys(input.binary || {}).forEach(key => {
  if (key.startsWith('attachment_')) {
    const binaryData = input.binary[key];
    if (binaryData) {
      formData[key] = binaryData;
    }
  }
});

return [{ formData }];
```

#### HTTP Request Node
**Method:** POST
**URL:** `https://beeed428-ed5d-4903-bc62-3ba70ac303df-00-38fn65dx21909.kirk.replit.dev/api/transactions/81/upload-multiple`

**Headers:**
- `X-API-Key`: `docuai_demo_key_123`

**Body Content Type:** Form-Data Multipart
**Body:** Use expression `{{ $json.formData }}` to send all files at once

### Expected Results
Both approaches should work with any number of files dynamically without hardcoding parameters.

### Recommendation
Try the **Split In Batches** approach first - it's more reliable with N8N's binary data handling and gives you better error handling per file.