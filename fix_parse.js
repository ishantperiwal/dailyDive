const fs = require('fs');
let dashboardHtml = fs.readFileSync('dashboard.html', 'utf8');

const regex = /color: noteColors\[index % noteColors\.length\]\s*\n\s*};\s*\n\s*\} catch \(e\) \{/g;

const replacement = `color: noteColors[index % noteColors.length],
                        content: (typeof contentJson === 'string' && contentJson.trim().startsWith('{')) ? JSON.parse(contentJson) : {},
                        tags: tags
                    };
                } catch (e) {`;

dashboardHtml = dashboardHtml.replace(regex, replacement);
fs.writeFileSync('dashboard.html', dashboardHtml);
console.log('Replaced successfully');
