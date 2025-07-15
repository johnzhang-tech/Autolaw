# N8N Quick Fix: Send Multiple Files in One Request

## Current Problem
Your N8N workflow has multiple attachments (attachment_0, attachment_1, etc.) but only sends one file.

## Solution: Configure HTTP Request Node with Multiple Parameters

### Step 1: Remove the Loop Over Items Node
Since you have individual attachment items, you don't need the loop.

### Step 2: Configure HTTP Request Node Body Parameters

Add multiple parameters to your HTTP Request node:

**Parameter 1:**
- Name: `attachment_0`
- Parameter Type: `n8n Binary File`
- Input Data Field Name: `attachment_0`

**Parameter 2:**
- Name: `attachment_1`
- Parameter Type: `n8n Binary File`
- Input Data Field Name: `attachment_1`

**Parameter 3:**
- Name: `attachment_2`
- Parameter Type: `n8n Binary File`
- Input Data Field Name: `attachment_2`

**Parameter 4:**
- Name: `attachment_3`
- Parameter Type: `n8n Binary File`
- Input Data Field Name: `attachment_3`

**Parameter 5:**
- Name: `attachment_4`
- Parameter Type: `n8n Binary File`
- Input Data Field Name: `attachment_4`

**Parameter 6:**
- Name: `attachment_5`
- Parameter Type: `n8n Binary File`
- Input Data Field Name: `attachment_5`

### Step 3: Test Configuration

After adding all parameters, your HTTP Request should send all 6 files in one request.

## Alternative: Use Expression for Dynamic Field Names

Instead of hardcoding field names, you can use expressions:

**For each parameter:**
- Name: `{{ Object.keys($json).filter(key => key.startsWith('attachment_'))[0] }}`
- Parameter Type: `n8n Binary File`
- Input Data Field Name: `{{ Object.keys($json).filter(key => key.startsWith('attachment_'))[0] }}`

## Expected Result

After this configuration, you should see in the logs:
```
Field names: [ 'attachment_0', 'attachment_1', 'attachment_2', 'attachment_3', 'attachment_4', 'attachment_5' ]
Filenames: [ 'Jan Meeting Minutes Revised.pdf', 'HOA Assessment Delinquency Policy.pdf', 'File3.pdf', 'File4.pdf', 'File5.pdf', 'File6.pdf' ]
```

## Why This Works

The DocuAI endpoint is designed to handle multiple files with different field names. By adding multiple parameters, you're telling N8N to include all available attachments in the multipart form data.