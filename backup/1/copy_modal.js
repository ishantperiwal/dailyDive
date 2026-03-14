const fs = require('fs');

const indexHtml = fs.readFileSync('index.html', 'utf8');
let dashboardHtml = fs.readFileSync('dashboard.html', 'utf8');

// Find the start of the modal container
const startIndex = indexHtml.indexOf('<div id="modal-container">');
// Find the end: right before <div id="toast-container">
const endIndex = indexHtml.indexOf('<div id="toast-container">', startIndex);

if (startIndex !== -1 && endIndex !== -1) {
    const modalHtml = indexHtml.substring(startIndex, endIndex);

    // Insert into dashboard before <script>
    dashboardHtml = dashboardHtml.replace('    <script>', modalHtml + '\n    <script>');

    fs.writeFileSync('dashboard.html', dashboardHtml);
    console.log('Modal HTML copied successfully!');
} else {
    console.error('Could not find modal HTML boundaries in index.html');
}
