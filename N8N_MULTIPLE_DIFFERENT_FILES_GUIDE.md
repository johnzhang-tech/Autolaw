# N8N Multiple Different Files Configuration Guide

## 🚨 ISSUE IDENTIFIED
Your n8n workflow is uploading the same file 6 times instead of 6 different files. This is why you see:
- Jan Meeting Minutes Revised.pdf (repeated 6 times)
- Different unique IDs but same filename

## ✅ SOLUTION: Upload 6 Different Files

### Option 1: Use Different Input Files
Make sure your n8n workflow has 6 different files in the binary attachments:

```
attachment_0: HOA-Declaration.pdf
attachment_1: HOA-BY-LAWS.pdf  
attachment_2: ArticlesOfIncorporation.pdf
attachment_3: Contract.pdf
attachment_4: Assessment.pdf
attachment_5: Minutes.pdf
```

### Option 2: Use File Splitter Node
If you have multiple files in one input, use the "Split In Batches" node:

1. **Input**: Multiple files from previous node
2. **Split In Batches**: Set batch size to 1
3. **Each batch** will have one file as attachment_0

### Option 3: Manual File Upload
For testing, upload 6 different files manually:

#### HTTP Request Node Configuration
```
URL: /api/transactions/52/upload-single
Method: POST
Send Body: Form-Data

Headers:
X-API-Key: docuai_demo_key_123

Form-Data Fields:
file1: [Upload HOA-Declaration.pdf]
file2: [Upload HOA-BY-LAWS.pdf]
file3: [Upload ArticlesOfIncorporation.pdf]
file4: [Upload Contract.pdf]
file5: [Upload Assessment.pdf]
file6: [Upload Minutes.pdf]
```

## 🔍 How to Verify Different Files

### Check Binary Data
Before the HTTP Request node, add a "Code" node to inspect:

```javascript
// Check if files are actually different
for (let i = 0; i < 6; i++) {
  const binary = $binary[`attachment_${i}`];
  if (binary) {
    console.log(`File ${i}:`, binary.fileName, binary.fileSize);
  }
}
return $input.all();
```

### Expected Output
You should see different filenames and sizes:
```
File 0: HOA-Declaration.pdf 1024
File 1: HOA-BY-LAWS.pdf 2048
File 2: ArticlesOfIncorporation.pdf 1536
File 3: Contract.pdf 3072
File 4: Assessment.pdf 2560
File 5: Minutes.pdf 1792
```

## 🎯 Current System Behavior
The upload system is working correctly. When you send:
- 6 different files → Creates 6 different documents
- Same file 6 times → Creates 6 duplicate documents (as expected)

## 📋 Next Steps
1. **Fix your n8n workflow** to use 6 different files
2. **Test with different filenames** to verify
3. **Check the binary data** in your workflow to ensure variety
4. **Run the upload** and verify different filenames in the response

The DocuAI system is working perfectly - the issue is in the n8n workflow configuration!