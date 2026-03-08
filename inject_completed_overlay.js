const fs = require('fs');

const path = 'd:/Work/Plugins/dailydive/dashboard.html';
let html = fs.readFileSync(path, 'utf8');

// 1. Add CSS for archive view
const archiveViewCss = `
        /* --- COMPLETED (ARCHIVE) VIEW STYLES --- */
        .archive-view-container {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: var(--background);
            background-image: radial-gradient(circle, var(--dot-color) 1px, transparent 1px);
            background-size: 25px 25px;
            z-index: 500;
            transform: translateY(100%);
            transition: transform 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
            display: flex;
            flex-direction: column;
            overflow: hidden;
        }

        .archive-view-container.show {
            transform: translateY(0);
        }

        .archive-header {
            display: flex;
            flex-direction: column;
            align-items: stretch;
            padding: 14px 0 0 0;
            background-color: rgba(255, 255, 255, 0.7);
            backdrop-filter: blur(12px);
            flex-shrink: 0;
            border-bottom: 1px solid #eee;
        }

        .archive-header-top-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 0 26px;
            margin-bottom: 15px;
        }

        .archive-header h2 {
            margin: 0;
            font-size: 18px;
            font-weight: 500;
        }

        .close-archive-btn {
            background: none;
            border: none;
            font-size: 24px;
            font-weight: 300;
            color: #555;
            cursor: pointer;
            line-height: 1;
            padding: 0;
            transition: color 0.2s ease;
        }

        .archive-content {
            flex-grow: 1;
            overflow-y: auto;
            padding: 20px;
        }

        .archive-month-group {
            margin-bottom: 40px;
        }

        .archive-month-header {
            font-size: 14px;
            font-weight: 600;
            color: #777;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 15px;
            padding-bottom: 8px;
            border-bottom: 1px solid #eee;
        }

        .archive-month-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, 320px);
            gap: 20px;
            justify-content: center;
        }

        /* Tweak for dashboard specifically since it's a fixed centered layout */
        .archive-header {
            max-width: 1200px;
            margin: 0 auto;
            width: 100%;
            border-radius: 0 0 12px 12px;
        }
`;

if (!html.includes('/* --- COMPLETED (ARCHIVE) VIEW STYLES --- */')) {
    html = html.replace('/* --- MODAL --- */', archiveViewCss + '\n        /* --- MODAL --- */');
}

// 2. Add 'Completed' Chip to Filter Bar
const completedChipJs = `
                // "Completed" chip
                const completedChip = document.createElement('div');
                completedChip.className = 'filter-chip filter-chip--archive';
                completedChip.innerHTML = '📦 Completed';
                completedChip.addEventListener('click', showArchiveView);
                filterBar.appendChild(completedChip);
`;

html = html.replace('                // "All tags" chip', completedChipJs + '\\n                // "All tags" chip');

// 3. Add HTML Overlay
const archiveHtml = `
    <!-- Completed (Archive) View Content -->
    <div id="archive-view" class="archive-view-container">
        <div class="archive-header">
            <div class="archive-header-top-row">
                <h2>Completed Tasks</h2>
                <button class="close-archive-btn" id="close-archive-btn">&times;</button>
            </div>
        </div>
        <div class="archive-content" id="archive-content">
            <!-- Rendered by JS -->
        </div>
    </div>
`;

if (!html.includes('<div id="archive-view"')) {
    html = html.replace('    <!-- Modal (Full Screen with Smooth Animation) -->', archiveHtml + '\\n    <!-- Modal (Full Screen with Smooth Animation) -->');
}

// 4. Add JS Logic for generating completed tasks overlay view 
const archiveJs = `
            // --- ARCHIVE (COMPLETED) VIEW LOGIC ---
            const showArchiveView = () => {
                const archiveView = document.getElementById('archive-view');
                const archiveContent = document.getElementById('archive-content');
                
                // Set URL state
                history.pushState({ view: 'archive' }, '', '#completed');

                // Render completed items grouped by month
                archiveContent.innerHTML = '';
                
                // Get all tasks that are NOT archived (but are completed) OR are archived. 
                // We'll show both in this completed view to match indexbeta's 'Completed' chip.
                const completedTasks = allTasks.filter(t => t.completedAt || t.archived);
                
                // Sort by completion date descending
                completedTasks.sort((a, b) => {
                    const dateA = a.completedAt ? new Date(a.completedAt) : new Date(a.createdAt);
                    const dateB = b.completedAt ? new Date(b.completedAt) : new Date(b.createdAt);
                    return dateB - dateA;
                });

                if (completedTasks.length === 0) {
                    archiveContent.innerHTML = \`
                        <div class="empty-state" style="margin-top: 50px;">
                            <div class="empty-emoji">📝</div>
                            <div>No completed tasks yet.</div>
                        </div>\`;
                } else {
                    // Group by month
                    const groupedByMonth = {};
                    completedTasks.forEach(task => {
                        const date = task.completedAt ? new Date(task.completedAt) : new Date(task.createdAt);
                        const monthYear = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
                        if (!groupedByMonth[monthYear]) groupedByMonth[monthYear] = [];
                        groupedByMonth[monthYear].push(task);
                    });

                    for (const [monthYear, monthTasks] of Object.entries(groupedByMonth)) {
                        let overallIndex = 0;
                        const monthGroup = document.createElement('div');
                        monthGroup.className = 'archive-month-group';

                        const monthHeader = document.createElement('div');
                        monthHeader.className = 'archive-month-header';
                        monthHeader.textContent = monthYear;
                        monthGroup.appendChild(monthHeader);

                        const monthGrid = document.createElement('div');
                        monthGrid.className = 'archive-month-grid';

                        monthTasks.forEach((task, index) => {
                            const taskItem = createTaskCard(task, overallIndex++);
                            taskItem.classList.add('completed', 'is-archived'); // make look completed
                            monthGrid.appendChild(taskItem);
                        });

                        monthGroup.appendChild(monthGrid);
                        archiveContent.appendChild(monthGroup);
                    }
                }

                // Add close listener
                document.getElementById('close-archive-btn').addEventListener('click', hideArchiveView);

                requestAnimationFrame(() => {
                    archiveView.classList.add('show');
                });
            };

            const hideArchiveView = () => {
                const archiveView = document.getElementById('archive-view');
                if(!archiveView) return;
                archiveView.classList.remove('show');
                if (window.location.hash === '#completed') {
                    history.back();
                }
            };
            

            // Handle popstate for back button
            window.addEventListener('popstate', (event) => {
                const archiveView = document.getElementById('archive-view');
                if (archiveView && archiveView.classList.contains('show') && window.location.hash !== '#completed') {
                    archiveView.classList.remove('show');
                }
            });
`;

if (!html.includes('showArchiveView = () =>')) {
    html = html.replace('// --- INIT ---', archiveJs + '\\n            // --- INIT ---');
}


fs.writeFileSync(path, html);
console.log('Modified dashboard.html perfectly!');
