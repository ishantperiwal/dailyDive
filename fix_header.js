const fs = require('fs');
let html = fs.readFileSync('dashboard.html', 'utf8');

// 1. Remove Active tasks title from the DOM generation completely
html = html.replace(
    /<div class="section-header">\s*<h2>Active tasks<\/h2>\s*<div class="section-count" id="stat-active-count">0<\/div>\s*<\/div>/g,
    ''
);

// And also from the render function
html = html.replace(
    /document\.getElementById\('stat-active-count'\)\.textContent = visibleTasks\.length;/g,
    ''
);

// 2. Change the header CSS to be sticky and blurred
html = html.replace(
    /header \{(.*?)\}/s,
    `header {
            display: flex;
            flex-direction: column;
            align-items: stretch;
            padding: 14px 26px 0px 26px;
            background-color: rgba(255, 255, 255, 0.7);
            backdrop-filter: blur(12px);
            position: sticky;
            top: 0;
            z-index: 10;
        }`
);

// 3. Update the app-container padding so the sticky header stretches nicely
html = html.replace(
    /\.app-container \{(.*?)\}/s,
    `.app-container {
            max-width: 1200px;
            margin: auto;
            position: relative;
            min-height: 100vh;
            display: flex;
            flex-direction: column;
        }`
);

// 4. Update header-top-row margin to match main
html = html.replace(
    /\.header-top-row \{\s*display: flex;\s*justify-content: space-between;\s*align-items: center;\s*width: 100%;\s*margin-bottom: 15px;\s*gap: 10px;\s*\}/s,
    `.header-top-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            width: 100%;
            margin-bottom: 15px;
            gap: 10px;
        }`
);

fs.writeFileSync('dashboard.html', html);
console.log('Fixed header');
