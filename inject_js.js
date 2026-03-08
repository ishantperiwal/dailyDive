const fs = require('fs');
let dashboardHtml = fs.readFileSync('dashboard.html', 'utf8');

// 1. Update parseTask to return content and tags
const oldParseTaskEnd = `                        peopleTags: tags.people || [],
                        moduleTags: tags.modules || [],
                        color: noteColors[index % noteColors.length]`;

const newParseTaskEnd = `                        peopleTags: tags.people || [],
                        moduleTags: tags.modules || [],
                        color: noteColors[index % noteColors.length],
                        content: (typeof contentJson === 'string' && contentJson.startsWith('{')) ? JSON.parse(contentJson) : {},
                        tags: tags`;

dashboardHtml = dashboardHtml.replace(oldParseTaskEnd, newParseTaskEnd);

// 2. Replace createTaskCard and add Modal logic
const oldCreateTaskCardStart = 'const escapeHtml = (text) => {';
const oldCreateTaskCardEnd = '            const getFilteredTasks = () => {';

const newLogic = `
            const escapeHtml = (text) => {
                const div = document.createElement('div');
                div.textContent = text;
                return div.innerHTML;
            };

            const isTaskHibernated = (task) => task.status === 'Hibernated';

            const showModal = (task) => {
                const modalParams = {
                    title: task.title || 'Untitled',
                    content: task.content || {},
                    tags: task.tags || { people: task.peopleTags || [], modules: task.moduleTags || [] }
                };

                const titleInput = document.getElementById('task-title-input');
                titleInput.value = modalParams.title;
                titleInput.readOnly = true;
                
                document.getElementById('confirm-add-btn').style.display = 'none';
                document.getElementById('hibernate-btn').style.display = 'none';

                const entriesWrapper = document.getElementById('daily-entries-wrapper');
                entriesWrapper.innerHTML = '';
                entriesWrapper.className = 'timeline-view';
                
                const sortedKeys = Object.keys(modalParams.content).filter(k => k !== '_hibernation').sort();
                
                if (sortedKeys.length === 0) {
                    const emptyState = document.createElement('div');
                    emptyState.style.padding = '20px';
                    emptyState.style.textAlign = 'center';
                    emptyState.style.color = '#777';
                    emptyState.textContent = 'No journal entries yet.';
                    entriesWrapper.appendChild(emptyState);
                } else {
                    sortedKeys.forEach((key, idx) => {
                        const entryText = modalParams.content[key];
                        const entryDiv = document.createElement('div');
                        entryDiv.className = 'timeline-entry';
                        
                        const dateObj = new Date(key);
                        let dateStr = key;
                        if (!isNaN(dateObj.getTime())) {
                            dateStr = dateObj.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
                        }

                        let lineHtml = (idx < sortedKeys.length - 1) ? '<div class="timeline-line"></div>' : '';

                        entryDiv.innerHTML = \`
                            <div class="timeline-marker">
                                <div class="timeline-dot"></div>
                                \${lineHtml}
                            </div>
                            <div class="timeline-content">
                                <div class="daily-entry-date">\${dateStr}</div>
                                <div class="daily-entry-textarea" style="opacity: 0.8;">\${escapeHtml(entryText)}</div>
                            </div>
                        \`;
                        entriesWrapper.appendChild(entryDiv);
                    });
                }
                
                const renderTags = (containerId, tagsArray) => {
                    const container = document.getElementById(containerId);
                    container.innerHTML = '';
                    if (!tagsArray || tagsArray.length === 0) {
                        container.innerHTML = '<span style="color: #999; font-size: 13px;">None</span>';
                        return;
                    }
                    tagsArray.forEach(t => {
                        const chip = document.createElement('div');
                        chip.className = 'chip';
                        chip.textContent = t;
                        container.appendChild(chip);
                    });
                };
                
                renderTags('people-chip-container', modalParams.tags.people);
                renderTags('module-chip-container', modalParams.tags.modules);

                const modal = document.getElementById('modal-container');
                modal.style.display = 'flex';
                void modal.offsetWidth;
                modal.classList.add('show');
            };

            const hideModal = () => {
                const modal = document.getElementById('modal-container');
                modal.classList.remove('show');
                setTimeout(() => {
                    modal.style.display = 'none';
                }, 500);
            };

            document.getElementById('modal-container').addEventListener('click', (e) => {
                if (e.target === document.getElementById('modal-container')) {
                    hideModal();
                }
            });
            
            document.getElementById('modal-back-btn').addEventListener('click', hideModal);

            const createTaskCard = (task, index) => {
                const taskItem = document.createElement('div');
                taskItem.className = 'task-item animate-in';
                taskItem.style.animationDelay = \`\${index * 0.04}s\`;
                
                const isCompleted = task.status === 'Completed';
                const isHibernated = task.status === 'Hibernated';

                if (isCompleted) taskItem.classList.add('completed');
                else if (isHibernated) taskItem.classList.add('hibernated');

                taskItem.dataset.id = task.id;
                taskItem.style.backgroundColor = task.color;
                
                const rotation = (index % 2 === 0 ? 1.5 : -1.5);
                const startRotation = (rotation > 0) ? -10 : 10;
                taskItem.style.setProperty('--rotation-deg', \`\${rotation}deg\`);
                taskItem.style.setProperty('--start-rotation-deg', \`\${startRotation}deg\`);
                taskItem.style.transform = \`rotate(\${rotation}deg)\`;

                const taskContent = document.createElement('div');
                taskContent.className = 'task-content';

                const timeAgo = document.createElement('div');
                timeAgo.className = 'time-ago';

                if (isCompleted && task.completedAt) {
                    timeAgo.textContent = \`Completed \${getRelativeTime(task.completedAt)}\`;
                } else if (isHibernated) {
                    timeAgo.textContent = 'Hibernated';
                } else {
                    timeAgo.textContent = \`Started \${getRelativeTime(task.createdAt)}\`;
                }
                taskContent.appendChild(timeAgo);

                const textDisplay = document.createElement('div');
                textDisplay.className = 'task-text-display';

                const titleDisplay = document.createElement('div');
                titleDisplay.className = 'task-text-title';
                titleDisplay.textContent = task.title || 'Untitled Task';
                textDisplay.appendChild(titleDisplay);

                let latestEntryDisplay = null;
                if (typeof task.content === 'object' && task.content !== null) {
                    const contentKeys = Object.keys(task.content).filter(k => k !== '_hibernation').sort().reverse();
                    if (contentKeys.length > 0) {
                        const latestEntryText = task.content[contentKeys[0]];
                        latestEntryDisplay = document.createElement('div');
                        latestEntryDisplay.className = 'task-text-latest-entry';
                        latestEntryDisplay.textContent = latestEntryText;
                        textDisplay.appendChild(latestEntryDisplay);
                    }
                }
                taskContent.appendChild(textDisplay);

                const tagsContainer = document.createElement('div');
                tagsContainer.className = 'task-tags-container';
                const allTags = [
                    ...(task.peopleTags || []).map(t => \`@\${t}\`),
                    ...(task.moduleTags || []).map(t => \`#\${t}\`)
                ];
                allTags.forEach(tagText => {
                    const tagEl = document.createElement('span');
                    tagEl.className = 'task-tag';
                    tagEl.textContent = tagText;
                    tagsContainer.appendChild(tagEl);
                });
                
                taskItem.appendChild(taskContent);
                taskItem.appendChild(tagsContainer);

                const attachmentDisplay = document.createElement('div');
                attachmentDisplay.className = 'sticker-display-area';
                if (isHibernated) {
                    const hibernateIcon = document.createElement('div');
                    hibernateIcon.textContent = '💤';
                    hibernateIcon.style.fontSize = '20px';
                    attachmentDisplay.appendChild(hibernateIcon);
                }
                taskItem.appendChild(attachmentDisplay);

                taskItem.addEventListener('click', () => {
                    showModal(task);
                });

                taskItem.style.cursor = 'pointer';

                setTimeout(() => {
                    const titleLineHeight = parseInt(window.getComputedStyle(titleDisplay).lineHeight, 10) || 20;
                    if (titleLineHeight > 0 && latestEntryDisplay && titleDisplay.scrollHeight > 0) {
                        const titleLines = Math.round(titleDisplay.scrollHeight / titleLineHeight);
                        latestEntryDisplay.style.webkitLineClamp = titleLines > 1 ? '2' : '3';
                    }
                }, 0);

                return taskItem;
            };

            const getFilteredTasks = () => {`;

const startIndex = dashboardHtml.indexOf(oldCreateTaskCardStart);
const endIndex = dashboardHtml.indexOf(oldCreateTaskCardEnd) + oldCreateTaskCardEnd.length;

if (startIndex !== -1 && endIndex !== -1) {
    dashboardHtml = dashboardHtml.substring(0, startIndex) + newLogic + dashboardHtml.substring(endIndex);
    fs.writeFileSync('dashboard.html', dashboardHtml);
    console.log('JS replaced successfully');
} else {
    console.error('Failed to find replacement boundaries');
}
