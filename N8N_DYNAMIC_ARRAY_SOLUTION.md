# N8N Dynamic Array Solution for Variable Attachments

## Problem
Your attachment array size is dynamic (could be 1, 6, 10, or any number), so you can't hardcode parameters in the HTTP Request node.

## Solution: Use N8N Code Node + HTTP Request

### Step 1: Add a Code Node Before HTTP Request

Create a Code node with this JavaScript:

```javascript
// Process dynamic attachments array
const inputData = $input.all()[0].json;
const attachments = [];

// Find all attachment fields dynamically
Object.keys(inputData).forEach(key => {
  if (key.startsWith('attachment_')) {
    attachments.push({
      fieldName: key,
      filename: inputData[key].filename || key,
      data: inputData[key]
    });
  }
});

console.log(`Found ${attachments.length} attachments`);

// Return array of attachments for processing
return attachments.map((attachment, index) => ({
  attachment: attachment.data,
  fieldName: attachment.fieldName,
  filename: attachment.filename,
  index: index
}));
```

### Step 2: Add Split In Batches Node

After the Code node, add "Split In Batches":
- **Options**: Keep default settings
- **Batch Size**: 1

This will process each attachment individually.

### Step 3: Configure HTTP Request Node

Configure the HTTP Request node:
- **Method**: POST
- **URL**: `https://your-app.replit.dev/api/transactions/{{$json.transactionId}}/upload-n8n`
- **Headers**:
  - `X-API-Key`: `docuai_demo_key_123`
- **Body**: Form-Data
- **Parameters**:
  - **Name**: `{{ $json.fieldName }}`
  - **Parameter Type**: `n8n Binary File`
  - **Input Data Field Name**: `attachment`

### Step 4: Merge Results (Optional)

Add a Merge node after HTTP Request to combine all upload results.

## Alternative: Single Request with All Files

If you prefer to send all files in one request, use this Code node instead:

```javascript
const inputData = $input.all()[0].json;
const result = {
  transactionId: inputData.transactionId,
  files: {}
};

// Collect all attachments
Object.keys(inputData).forEach(key => {
  if (key.startsWith('attachment_')) {
    result.files[key] = inputData[key];
  }
});

console.log(`Preparing ${Object.keys(result.files).length} files for upload`);
return [result];
```

Then in HTTP Request, use dynamic parameters:
```javascript
// In Body Parameters, use an expression to create dynamic fields
{{ Object.keys($json.files).map(key => ({ name: key, type: 'n8n-binary-file', value: $json.files[key] })) }}
```

## Expected Flow

1. **Code Node** processes dynamic attachments
2. **Split In Batches** creates one execution per file
3. **HTTP Request** uploads each file individually
4. **Merge** combines all results

## Expected Server Logs

You should see:
```
Field names: [ 'attachment_0' ]
Filenames: [ 'Jan Meeting Minutes Revised.pdf' ]
```

Then another request:
```
Field names: [ 'attachment_1' ]
Filenames: [ 'HOA Assessment Delinquency Policy.pdf' ]
```

And so on for each file.

## Benefits

- Works with any number of attachments
- Maintains original filenames
- No hardcoded field names
- Handles dynamic arrays properly