const fs = require('fs');
let html = fs.readFileSync('dashboard.html', 'utf8');

html = html.replace(
    /\.task-grid\s*\{\s*display:\s*grid;\s*grid-template-columns:\s*repeat\(auto-fill,\s*minmax\(300px,\s*1fr\)\);\s*gap:\s*20px;\s*\}/,
    `.task-grid {
            padding: 25px;
            display: grid;
            grid-template-columns: repeat(auto-fit, 320px);
            gap: 25px;
            justify-content: center;
            flex-grow: 1;
            align-content: start;
        }`
);

html = html.replace(
    /\.task-card\s*\{\s*height:\s*160px;\s*\}/,
    `.task-item {
                height: 205px;
            }`
);

fs.writeFileSync('dashboard.html', html);
console.log('Fixed CSS dimensions and stretching issues');
