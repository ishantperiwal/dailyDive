const fs = require('fs');
let html = fs.readFileSync('dashboard.html', 'utf8');

// 1. Remove Stats Bar HTML completely
html = html.replace(
    /\s*<!-- Stats Bar -->\s*<div id="stats-bar".*?<\/div>\s*<\/div>\s*<\/div>/s,
    ''
);

// 2. Remove Section Header HTML
html = html.replace(
    /\s*<div class="section-header">\s*<h2 id="section-title">.*?<\/h2>\s*<span id="tasks-count" class="section-count">.*?<\/span>\s*<\/div>/s,
    ''
);

// 3. Keep <!-- Tasks Section --> and the section container, but just clear the header
html = html.replace(
    /<!-- Tasks Section -->\s*<div id="tasks-section" class="section">\s*<div id="tasks-grid" class="task-grid"><\/div>\s*<\/div>/s,
    '<!-- Tasks Section -->\n        <div id="tasks-section" class="section">\n            <div id="tasks-grid" class="task-grid"></div>\n        </div>'
); // In case they combined

// Let's do simpler HTML targeted replace for the section header
html = html.replace(/<div class="section-header">[\s\S]*?<\/div>\s*<div id="tasks-grid"/, '<div id="tasks-grid"');

// For Stats Bar, let's just make sure it's gone
html = html.replace(/<!-- Stats Bar -->[\s\S]*?<!-- Tasks Section -->/, '<!-- Tasks Section -->');

// 4. Clean JS logic
// Remove the lines updating stats
html = html.replace(
    /\/\/ Stats \(always from all tasks, not filtered\)[\s\S]*?document\.getElementById\('stats-bar'\)\.style\.display = 'flex';/s,
    ''
);

html = html.replace(/const sectionTitle = document.getElementById\('section-title'\);/g, '');
html = html.replace(/document\.getElementById\('tasks-count'\)\.textContent = filteredTasks\.length;/g, '');
html = html.replace(/if \(showArchived\) \{\s*sectionTitle\.textContent = '📦 Archived';\s*\} else \{\s*sectionTitle\.textContent = '🔵 Active Tasks';\s*\}/g, '');

fs.writeFileSync('dashboard.html', html);
console.log('Removed section header and stats bar');
