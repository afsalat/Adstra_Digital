const fs = require('fs');
const path = 'c:/Projects/Adstra_Digital/adstra-next/src/app/invoices/create/page.js';

let content = fs.readFileSync(path, 'utf8');

// Update the logo path
const updatedContent = content.replace(/\/assets\/logo_lightBg-01\.png/g, '/assets/logo_new-01.png');

if (content !== updatedContent) {
    fs.writeFileSync(path, updatedContent, 'utf8');
    console.log("Success: CreateInvoice.js updated with correct logo path.");
} else {
    console.log("No changes needed or placeholder not found in CreateInvoice.js");
}
