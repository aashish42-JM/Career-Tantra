
// Notification helper function
function showNotification(type, title, message) {
    let container = document.querySelector('.notification-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'notification-container';
        document.body.appendChild(container);
    }

    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    
    const icon = type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle';
    
    notification.innerHTML = `
        <i class="fas ${icon} notification-icon"></i>
        <div class="notification-content">
            <h4>${title}</h4>
            <p>${message}</p>
        </div>
    `;
    
    container.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.4s ease-out forwards';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 400);
    }, 5000);
}

let currentUser = null;
let radarChart = null;
let barChart = null;
let roadmaps = [];
let enrolledProgress = [];

document.addEventListener('DOMContentLoaded', function() {
    const user = JSON.parse(localStorage.getItem('user'));
    const token = localStorage.getItem('token');
    
    if (!user || !token) {
        showNotification('error', 'Not Logged In', 'Please log in first!');
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 1500);
        return;
    }
    
    const userNameNav = document.getElementById('user-name-nav');
    const userNameHero = document.getElementById('user-name-hero');
    
    if (userNameNav) {
        userNameNav.textContent = `Hi, ${user.name}`;
    }
    
    if (userNameHero) {
        userNameHero.textContent = user.name;
    }
    
    fetchUserData(token);
    fetchAllRoadmaps(token);
    fetchUserProgress(token);
    
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            showNotification('success', 'Logged Out', 'You have been logged out successfully!');
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 1500);
        });
    }
    
    const openChatBtn = document.getElementById('open-chat-btn');
    const floatingChatBtn = document.getElementById('floating-chat-btn');
    const closeChatBtn = document.getElementById('close-chat-btn');
    const chatModal = document.getElementById('chat-modal');
    const chatInput = document.getElementById('chat-input');
    const sendMessageBtn = document.getElementById('send-message-btn');
    const chatMessages = document.getElementById('chat-messages');
    const userId = user?._id || user?.id || 'guest';
    
    if (openChatBtn) {
        openChatBtn.addEventListener('click', function() {
            chatModal.classList.add('active');
            chatInput.focus();
        });
    }
    
    if (floatingChatBtn) {
        floatingChatBtn.addEventListener('click', function() {
            chatModal.classList.add('active');
            chatInput.focus();
        });
    }
    
    if (closeChatBtn) {
        closeChatBtn.addEventListener('click', function() {
            chatModal.classList.remove('active');
        });
    }
    
    if (chatModal) {
        chatModal.addEventListener('click', function(e) {
            if (e.target === chatModal) {
                chatModal.classList.remove('active');
            }
        });
    }
    
    function addMessage(content, isUser) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('chat-message');
        messageDiv.classList.add(isUser ? 'user-message' : 'ai-message');
        
        const formattedContent = content
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/\n/g, '<br>');
        
        messageDiv.innerHTML = `
            <div class="message-avatar">
                <i class="fas fa-${isUser ? 'user' : 'robot'}"></i>
            </div>
            <div class="message-content">
                <p>${formattedContent}</p>
            </div>
        `;
        
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    
    function showTypingIndicator() {
        const typingDiv = document.createElement('div');
        typingDiv.classList.add('chat-message', 'ai-message');
        typingDiv.id = 'typing-indicator';
        typingDiv.innerHTML = `
            <div class="message-avatar">
                <i class="fas fa-robot"></i>
            </div>
            <div class="message-content typing-indicator">
                <span></span>
                <span></span>
                <span></span>
            </div>
        `;
        chatMessages.appendChild(typingDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    
    function removeTypingIndicator() {
        const typingDiv = document.getElementById('typing-indicator');
        if (typingDiv) {
            typingDiv.remove();
        }
    }
    
    async function sendMessage() {
        const message = chatInput.value.trim();
        if (!message) return;
        
        addMessage(message, true);
        chatInput.value = '';
        showTypingIndicator();
        
        try {
            const response = await fetch('http://localhost:5000/api/ai/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    message: message,
                    userId: userId
                })
            });
            
            const data = await response.json();
            removeTypingIndicator();
            addMessage(data.response, false);
        } catch (error) {
            removeTypingIndicator();
            addMessage('Namaste! I am currently having a small technical issue. Please try again in a moment! 🙏', false);
            console.error('Chat error:', error);
        }
    }
    
    if (sendMessageBtn) {
        sendMessageBtn.addEventListener('click', sendMessage);
    }
    
    if (chatInput) {
        chatInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                sendMessage();
            }
        });
    }
});

async function fetchUserData(token) {
    try {
        const res = await fetch('http://localhost:5000/api/auth/me', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        const data = await res.json();
        if (data.success && data.user) {
            currentUser = data.user;
            renderUserProfile();
            renderCharts();
        }
    } catch (err) {
        console.error('Error fetching user data:', err);
    }
}

async function fetchAllRoadmaps(token) {
    try {
        const res = await fetch('http://localhost:5000/api/roadmaps');
        const data = await res.json();
        if (data.success) {
            roadmaps = data.data;
            renderAvailableRoadmaps(token);
        }
    } catch (err) {
        console.error('Error fetching roadmaps:', err);
    }
}

async function fetchUserProgress(token) {
    try {
        const res = await fetch('http://localhost:5000/api/roadmaps/progress', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) {
            enrolledProgress = data.data;
            renderEnrolledRoadmaps();
            updateXpAndBadges();
        }
    } catch (err) {
        console.error('Error fetching user progress:', err);
    }
}

function renderAvailableRoadmaps(token) {
    const container = document.getElementById('roadmaps-grid');
    if (!container) return;

    const enrolledRoadmapIds = new Set(enrolledProgress.map(p => p.roadmap));
    const availableRoadmaps = roadmaps.filter(r => !enrolledRoadmapIds.has(r._id));

    container.innerHTML = availableRoadmaps.map(roadmap => `
        <div class="roadmap-card">
            <div class="roadmap-header">
                <span class="roadmap-category">${roadmap.category}</span>
                <span class="roadmap-difficulty ${roadmap.difficulty.toLowerCase()}">${roadmap.difficulty}</span>
            </div>
            <h3 class="roadmap-title">${roadmap.title}</h3>
            <p class="roadmap-desc">${roadmap.estimatedDuration} • ${roadmap.steps?.length || 0} steps</p>
            <div class="roadmap-stats">
                <span class="roadmap-stat"><i class="fas fa-clock"></i> ${roadmap.estimatedDuration}</span>
                <span class="roadmap-stat"><i class="fas fa-list"></i> ${roadmap.steps?.length || 0} steps</span>
            </div>
            <button class="enroll-btn" onclick="enrollRoadmap('${roadmap._id}', '${token}')">Enroll Now</button>
        </div>
    `).join('');
}

async function enrollRoadmap(roadmapId, token) {
    try {
        const res = await fetch(`http://localhost:5000/api/roadmaps/${roadmapId}/enroll`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        const data = await res.json();
        if (data.success) {
            showNotification('success', 'Enrolled!', 'You have successfully enrolled in the roadmap!');
            fetchAllRoadmaps(token);
            fetchUserProgress(token);
        }
    } catch (err) {
        console.error('Error enrolling:', err);
    }
}

function renderEnrolledRoadmaps() {
    const container = document.getElementById('enrolled-roadmaps-grid');
    if (!container) return;

    if (enrolledProgress.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: var(--text-light);">You are not enrolled in any roadmaps yet!</p>';
        return;
    }

    container.innerHTML = enrolledProgress.map(progress => {
        const roadmap = progress.roadmapData;
        const completionPercent = Math.round((progress.completedSteps.length / roadmap.steps.length) * 100);
        const completedStepIds = new Set(progress.completedSteps.map(s => s.stepId));

        return `
            <div class="enrolled-roadmap-card">
                <div class="roadmap-header">
                    <span class="roadmap-category">${roadmap.category}</span>
                    <span class="roadmap-difficulty ${roadmap.difficulty.toLowerCase()}">${roadmap.difficulty}</span>
                </div>
                <h3 class="roadmap-title">${roadmap.title}</h3>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${completionPercent}%"></div>
                </div>
                <p style="color: var(--text-light); font-size: 0.9rem; margin-bottom: 1rem;">${completionPercent}% Complete</p>
                
                <div class="roadmap-steps">
                    ${roadmap.steps.sort((a, b) => a.unlockOrder - b.unlockOrder).map(step => {
                        const isCompleted = completedStepIds.has(step._id);
                        const isUnlocked = step.unlockOrder <= progress.currentStep;
                        
                        return `
                            <div class="roadmap-step">
                                <div class="step-checkbox ${isCompleted ? 'completed' : ''} ${!isUnlocked ? 'locked' : ''}"
                                     onclick="completeStep('${progress._id}', '${step._id}')">
                                    ${isCompleted ? '<i class="fas fa-check"></i>' : (isUnlocked ? '' : '<i class="fas fa-lock"></i>')}
                                </div>
                                <div class="step-content">
                                    <h4 class="step-title">${step.title}</h4>
                                    <p class="step-desc">${step.description}</p>
                                </div>
                                <span class="step-xp">+${step.xpPoints} XP</span>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
    }).join('');
}

async function completeStep(progressId, stepId) {
    const token = localStorage.getItem('token');
    try {
        const res = await fetch(`http://localhost:5000/api/roadmaps/progress/${progressId}/complete`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ stepId })
        });
        const data = await res.json();
        if (data.success) {
            showNotification('success', 'Step Completed!', 'Great job! Keep up the good work!');
            fetchUserProgress(token);
        }
    } catch (err) {
        console.error('Error completing step:', err);
    }
}

function updateXpAndBadges() {
    const totalXPEl = document.getElementById('total-xp');
    const streakEl = document.getElementById('current-streak');
    const badgesEl = document.getElementById('badges-container');

    let totalXP = 0;
    let maxStreak = 0;
    let allBadges = [];

    enrolledProgress.forEach(progress => {
        totalXP += progress.xpEarned || 0;
        if (progress.streak > maxStreak) maxStreak = progress.streak;
        if (progress.badges) allBadges = [...allBadges, ...progress.badges];
    });

    if (totalXPEl) totalXPEl.textContent = totalXP;
    if (streakEl) streakEl.textContent = `${maxStreak} day${maxStreak !== 1 ? 's' : ''}`;

    if (badgesEl) {
        if (allBadges.length > 0) {
            badgesEl.innerHTML = allBadges.map(badge => `
                <div class="badge-item">
                    <i class="fas fa-award"></i>
                    <span>${badge.name}</span>
                </div>
            `).join('');
        } else {
            badgesEl.innerHTML = `
                <div class="badge-placeholder">
                    <i class="fas fa-award"></i>
                    <span>Complete steps to earn badges!</span>
                </div>
            `;
        }
    }
}

function renderUserProfile() {
    if (!currentUser) return;
    
    const profileName = document.getElementById('profile-name');
    const profileEmail = document.getElementById('profile-email');
    const profileDegree = document.getElementById('profile-degree');
    const profileSemester = document.getElementById('profile-semester');
    const profileExperience = document.getElementById('profile-experience');
    const profileTime = document.getElementById('profile-time');

    if (profileName) profileName.textContent = currentUser.name || 'N/A';
    if (profileEmail) profileEmail.textContent = currentUser.email || 'N/A';
    if (profileDegree) profileDegree.textContent = currentUser.degree || 'N/A';
    if (profileSemester) profileSemester.textContent = currentUser.semester || 'N/A';
    if (profileExperience) profileExperience.textContent = currentUser.experienceLevel || 'N/A';
    if (profileTime) profileTime.textContent = currentUser.timeAvailable || 'N/A';
}

function getSkillValue(level) {
    const map = { 'Beginner': 1, 'Intermediate': 2, 'Advanced': 3, 'Expert': 4 };
    return map[level] || 1;
}

function renderCharts() {
    if (!currentUser) return;
    
    const skills = currentUser.skillLevels || {
        webDevelopment: 'Beginner',
        programming: 'Beginner',
        dataStructures: 'Beginner',
        database: 'Beginner',
        aiMl: 'Beginner'
    };

    const skillNames = ['Web Development', 'Programming', 'Data Structures', 'Database', 'AI/ML'];
    const skillValues = [
        getSkillValue(skills.webDevelopment),
        getSkillValue(skills.programming),
        getSkillValue(skills.dataStructures),
        getSkillValue(skills.database),
        getSkillValue(skills.aiMl)
    ];

    const radarCtx = document.getElementById('skillsRadarChart');
    if (radarCtx) {
        if (radarChart) radarChart.destroy();
        radarChart = new Chart(radarCtx, {
            type: 'radar',
            data: {
                labels: skillNames,
                datasets: [{
                    label: 'Skill Levels',
                    data: skillValues,
                    backgroundColor: 'rgba(99,102,241,0.2)',
                    borderColor: 'rgba(99,102,241,1)',
                    pointBackgroundColor: 'rgba(99,102,241,1)',
                    borderWidth: 2
                }]
            },
            options: {
                scales: {
                    r: {
                        beginAtZero: true,
                        max: 4,
                        ticks: {
                            stepSize: 1,
                            callback: function(value) {
                                const labels = ['', 'Beginner', 'Intermediate', 'Advanced', 'Expert'];
                                return labels[value];
                            }
                        }
                    }
                },
                plugins: { legend: { display: false } }
            }
        });
    }

    const barCtx = document.getElementById('skillsBarChart');
    if (barCtx) {
        if (barChart) barChart.destroy();
        barChart = new Chart(barCtx, {
            type: 'bar',
            data: {
                labels: skillNames,
                datasets: [{
                    label: 'Skill Level',
                    data: skillValues,
                    backgroundColor: [
                        'rgba(99, 102, 241, 0.8)',
                        'rgba(16, 185, 129, 0.8)',
                        'rgba(245, 158, 11, 0.8)',
                        'rgba(239, 68, 68, 0.8)',
                        'rgba(139, 92, 246, 0.8)'
                    ],
                    borderRadius: 8
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 4,
                        ticks: {
                            stepSize: 1,
                            callback: function(value) {
                                const labels = ['', 'Beginner', 'Intermediate', 'Advanced', 'Expert'];
                                return labels[value];
                            }
                        }
                    }
                },
                plugins: { legend: { display: false } }
            }
        });
    }
}
