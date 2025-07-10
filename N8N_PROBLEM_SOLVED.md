# ✅ n8n Upload Problem SOLVED!

## What Was Wrong:
Your n8n configuration was using field name `attachment`, but our API endpoint only accepted `document`.

## What I Fixed (API-Side Solution):
I updated the API endpoint to accept **BOTH** field names:
- `document` (original) 
- `attachment` (for n8n compatibility)

## Result:
**Your n8n configuration can stay exactly as it is!** No changes needed in n8n.

The endpoint now accepts either field name:
- `POST /api/transactions/{id}/upload-single` 
- With field name: `attachment` OR `document`
- With API key: `docuai_demo_key_123`

## Test Results:
Both of these work now:
```bash
# Original way (document field)
curl -F "document=@file.pdf" ...

# n8n way (attachment field) - NOW WORKS! 
curl -F "attachment=@file.pdf" ...
```

## You Can Now:
1. **Keep your n8n configuration exactly as it is**
2. **Your uploads should work immediately**
3. **No need to change any field names in n8n**

The API is now flexible and supports both naming conventions!