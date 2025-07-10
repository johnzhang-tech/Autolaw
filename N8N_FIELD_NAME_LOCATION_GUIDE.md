# n8n Field Name Configuration Location

## Where to Change the Field Name in n8n:

### Method 1: In HTTP Request Node Body Parameters

1. **Open your HTTP Request node**
2. **Go to the "Parameters" tab** (not Settings)
3. **Scroll down to "Body Parameters" section**
4. **Find the parameter with name "attachment"**
5. **Click on the name field and change it to "document"**
6. **Leave everything else unchanged**

### Method 2: If Using Binary Data Input

1. **In the "Input Data Field Name" section**
2. **Change from:** `{{ $('Merge').first().binary.attachment }}`
3. **Change to:** `{{ $('Merge').first().binary.document }}`

**OR** keep the expression the same but change the parameter name in the Body Parameters section.

## Visual Guide:
- Look for a text field that currently says "attachment"
- This should be in the "Name" column of the Body Parameters
- Simply click in that field and type "document" instead

## If This Causes Errors:
The error usually happens if the previous node doesn't output binary data with the expected name. Make sure:
1. Previous node outputs binary data
2. The binary data is named "attachment" (or change the reference to match)
3. The HTTP Request parameter name is "document" (what our API expects)