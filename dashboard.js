
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
let skills = [];
let userSkillProgress = [];
let opportunities = [];
let userSavedOpportunities = new Set();
let recommendedRoadmaps = [];

// Calculate level from total XP
function calculateLevel(xp) {
  if (xp < 100) return 1;
  if (xp < 300) return 2;
  if (xp < 600) return 3;
  if (xp < 1000) return 4;
  return 5;
}

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
    fetchRecommendedRoadmaps(token);
    fetchAllSkills(token);
    fetchUserSkillProgress(token);
    fetchOpportunities(token);
    fetchSavedOpportunities(token);
    
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
        
        // Build context string
        let context = "Here is the user's current progress:\n";
        if (enrolledProgress.length > 0) {
            context += "- Enrolled Roadmaps:\n";
            enrolledProgress.forEach(p => {
                context += `  - ${p.roadmapData.title}: ${p.completionPercentage || 0}% complete, ${p.xpEarned} XP earned\n`;
            });
        } else {
            context += "- No roadmaps enrolled yet.\n";
        }
        if (userSkillProgress.length > 0) {
            context += "- Skill Progress:\n";
            userSkillProgress.forEach(sp => {
                context += `  - ${sp.skillName}: Level ${sp.level}, ${sp.xp} XP\n`;
            });
        }
        
        try {
            const response = await fetch('http://localhost:5000/api/ai/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    message: message + "\n\n" + context,
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

async function fetchAllRoadmaps() {
  try {
    const res = await fetch('http://localhost:5000/api/roadmaps');
    const data = await res.json();
    if (data.success) {
      roadmaps = data.data;
      renderAvailableRoadmaps();
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

async function fetchAllSkills(token) {
    try {
        const res = await fetch('http://localhost:5000/api/skills');
        const data = await res.json();
        if (data.success) {
            skills = data.data;
            renderSkillCards();
        }
    } catch (err) {
        console.error('Error fetching skills:', err);
    }
}

async function fetchUserSkillProgress(token) {
  try {
    const res = await fetch('http://localhost:5000/api/skills/progress', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();
    if (data.success) {
      userSkillProgress = data.data;
      renderSkillCards();
      updateTotalXp();
    }
  } catch (err) {
    console.error('Error fetching user skill progress:', err);
  }
}

async function fetchRecommendedRoadmaps(token) {
  try {
    const res = await fetch('http://localhost:5000/api/roadmaps/recommended', {
      headers: token ? { 'Authorization': `Bearer ${token}` } : {}
    });
    const data = await res.json();
    if (data.success) {
      recommendedRoadmaps = data.data;
      renderRecommendedRoadmaps();
    }
  } catch (err) {
    console.error('Error fetching recommended roadmaps:', err);
  }
}

function renderRecommendedRoadmaps() {
  const container = document.getElementById('recommended-roadmaps-grid');
  if (!container) return;
  container.innerHTML = recommendedRoadmaps.map(roadmap => `
    <div class="roadmap-card">
      <div class="roadmap-header">
        <span class="roadmap-category">${roadmap.category}</span>
        <span class="roadmap-difficulty ${roadmap.difficultyLevel.toLowerCase()}">${roadmap.difficultyLevel}</span>
      </div>
      <h3 class="roadmap-title">${roadmap.title}</h3>
      <p class="roadmap-desc">${roadmap.description}</p>
      <div class="roadmap-stats">
        <span class="roadmap-stat"><i class="fas fa-clock"></i> ${roadmap.estimatedDuration}</span>
        <span class="roadmap-stat"><i class="fas fa-list"></i> ${roadmap.steps.length} steps</span>
      </div>
      <button class="enroll-btn" onclick="enrollRoadmap('${roadmap._id}')">Enroll Now</button>
    </div>
  `).join('');
}

function renderAvailableRoadmaps() {
    const container = document.getElementById('roadmaps-grid');
    if (!container) return;

    const enrolledRoadmapIds = new Set(enrolledProgress.map(p => p.roadmap));
    const availableRoadmaps = roadmaps.filter(r => !enrolledRoadmapIds.has(r._id));

    container.innerHTML = availableRoadmaps.map(roadmap => `
        <div class="roadmap-card">
            <div class="roadmap-header">
                <span class="roadmap-category">${roadmap.category}</span>
                <span class="roadmap-difficulty ${roadmap.difficultyLevel.toLowerCase()}">${roadmap.difficultyLevel}</span>
            </div>
            <h3 class="roadmap-title">${roadmap.title}</h3>
            <p class="roadmap-desc">${roadmap.description}</p>
            <div class="roadmap-stats">
                <span class="roadmap-stat"><i class="fas fa-clock"></i> ${roadmap.estimatedDuration}</span>
                <span class="roadmap-stat"><i class="fas fa-list"></i> ${roadmap.steps?.length || 0} steps</span>
            </div>
            <button class="enroll-btn" onclick="enrollRoadmap('${roadmap._id}')">Enroll Now</button>
        </div>
    `).join('');
}

async function enrollRoadmap(roadmapId) {
    const token = localStorage.getItem('token');
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
            const tokenFromStorage = localStorage.getItem('token');
            fetchAllRoadmaps();
            fetchUserProgress(tokenFromStorage);
            fetchRecommendedRoadmaps(tokenFromStorage);
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
                                     onclick="completeRoadmapStep('${progress._id}', '${step._id}')">
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

async function completeRoadmapStep(progressId, stepId) {
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

function renderSkillCards() {
    const container = document.getElementById('skills-grid');
    if (!container) return;

    container.innerHTML = skills.map(skill => {
        const progress = userSkillProgress.find(p => p.skill === skill._id);
        const level = progress?.level || 'Beginner';
        const xp = progress?.xp || 0;
        const completedTopicIds = new Set(progress?.completedTopics?.map(t => t.topicId) || []);
        const nextLevelThreshold = Object.entries(skill.levelThresholds).find(([lvl, threshold]) => xp < threshold);
        const xpForNextLevel = nextLevelThreshold ? nextLevelThreshold[1] - xp : 0;
        const progressPercent = Math.round((xp / (skill.levelThresholds.Expert || 1000)) * 100);

        return `
            <div class="skill-card">
                <div class="skill-header">
                    <div class="skill-icon" style="background-color: ${skill.color}">
                        <i class="fab ${skill.icon}"></i>
                    </div>
                    <div class="skill-info">
                        <h3>${skill.name}</h3>
                        <span class="skill-level ${level.toLowerCase()}">${level}</span>
                    </div>
                </div>
                <div class="skill-xp">
                    <i class="fas fa-star"></i> ${xp} XP
                    ${xpForNextLevel > 0 ? `<span style="color: var(--text-light); font-weight: 400;">(${xpForNextLevel} XP to next level)</span>` : ''}
                </div>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${Math.min(progressPercent, 100)}%"></div>
                </div>
                <div class="skill-topics">
                    ${skill.topics.map(topic => `
                        <div class="skill-topic ${completedTopicIds.has(topic._id) ? 'completed' : ''}"
                             onclick="completeSkillTopic('${skill._id}', '${topic._id}')">
                            <div class="topic-checkbox">
                                ${completedTopicIds.has(topic._id) ? '<i class="fas fa-check"></i>' : ''}
                            </div>
                            <div class="topic-content">
                                <h4 class="topic-title">${topic.name}</h4>
                                <p class="topic-desc">${topic.description}</p>
                            </div>
                            <span class="topic-xp">+${topic.xp} XP</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }).join('');
}

async function completeSkillTopic(skillId, topicId) {
    const token = localStorage.getItem('token');
    try {
        const res = await fetch(`http://localhost:5000/api/skills/${skillId}/complete-topic`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ topicId })
        });
        const data = await res.json();
        if (data.success) {
            showNotification('success', 'Topic Completed!', 'Great job! Keep learning!');
            fetchUserSkillProgress(token);
            updateTotalXp();
        }
    } catch (err) {
        console.error('Error completing topic:', err);
    }
}

function updateXpAndBadges() {
    updateTotalXp();
    updateStreak();
}

function updateTotalXp() {
    const totalXPEl = document.getElementById('total-xp');
    const levelEl = document.getElementById('user-level');
    let totalXP = 0;
    let allBadges = [];
    
    // XP and badges from roadmaps
    enrolledProgress.forEach(p => {
        totalXP += p.xpEarned || 0;
        if (p.badges) {
            allBadges = allBadges.concat(p.badges);
        }
    });
    
    // XP from skills
    userSkillProgress.forEach(p => {
        totalXP += p.xp || 0;
    });
    
    if (totalXPEl) {
        totalXPEl.textContent = totalXP;
    }
    if (levelEl) {
        levelEl.textContent = calculateLevel(totalXP);
    }
    renderBadges(allBadges);
}

function renderBadges(badges) {
    const container = document.getElementById('badges-container');
    if (!container) return;
    
    if (badges.length === 0) {
        container.innerHTML = `
            <div class="badge-placeholder">
                <i class="fas fa-award"></i>
                <span>Complete steps to earn badges!</span>
            </div>
        `;
        return;
    }
    
    container.innerHTML = badges.map(badge => `
        <div class="badge-item">
            <i class="fas fa-award" style="font-size: 2rem; color: #f59e0b;"></i>
            <span>${badge.name}</span>
        </div>
    `).join('');
}

function updateStreak() {
    const streakEl = document.getElementById('current-streak');
    let maxStreak = 0;
    
    // Calculate max streak from roadmaps and skills
    enrolledProgress.forEach(p => {
        if (p.streak > maxStreak) maxStreak = p.streak;
    });
    
    userSkillProgress.forEach(p => {
        if (p.learningStreak > maxStreak) maxStreak = p.learningStreak;
    });
    
    if (streakEl) {
        streakEl.textContent = `${maxStreak} day${maxStreak !== 1 ? 's' : ''}`;
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
    
    const userSkillLevels = {};
    skills.forEach(skill => {
        const progress = userSkillProgress.find(p => p.skill === skill._id);
        userSkillLevels[skill.name] = progress?.level || 'Beginner';
    });
    
    // Use default skill levels if no progress data
    const skillLevels = currentUser.skillLevels || {
        webDevelopment: 'Beginner',
        programming: 'Beginner',
        dataStructures: 'Beginner',
        database: 'Beginner',
        aiMl: 'Beginner'
    };

    const skillNames = ['Web Development', 'Programming', 'Data Structures', 'Database', 'AI/ML'];
    const skillValues = [
        getSkillValue(userSkillLevels['HTML'] || skillLevels.webDevelopment),
        getSkillValue(userSkillLevels['JavaScript'] || skillLevels.programming),
        getSkillValue(userSkillLevels['DSA'] || skillLevels.dataStructures),
        getSkillValue(userSkillLevels['MongoDB'] || skillLevels.database),
        getSkillValue(userSkillLevels['AI/ML'] || skillLevels.aiMl)
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

async function fetchOpportunities(token) {
    try {
        const params = new URLSearchParams();
        const typeFilter = document.getElementById('opportunity-type-filter')?.value;
        const searchQuery = document.getElementById('opportunity-search')?.value;
        const sortBy = document.getElementById('opportunity-sort')?.value;
        
        if (typeFilter) params.append('type', typeFilter);
        if (searchQuery) params.append('search', searchQuery);
        if (sortBy) params.append('sort', sortBy);
        
        const url = `http://localhost:5000/api/opportunities?${params.toString()}`;
        const res = await fetch(url);
        const data = await res.json();
        if (data.success) {
            opportunities = data.data;
            renderOpportunities();
            renderFeaturedOpportunities();
        }
    } catch (err) {
        console.error('Error fetching opportunities:', err);
    }
}

async function fetchSavedOpportunities(token) {
    try {
        const res = await fetch('http://localhost:5000/api/opportunities/user/saved', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) {
            userSavedOpportunities = new Set(data.data.map(uo => uo.opportunity));
            renderOpportunities();
            renderFeaturedOpportunities();
        }
    } catch (err) {
        console.error('Error fetching saved opportunities:', err);
    }
}

function formatDeadline(deadlineStr) {
    const deadline = new Date(deadlineStr);
    const now = new Date();
    const diff = deadline - now;
    const daysLeft = Math.ceil(diff / (1000 * 60 * 60 * 24));
    
    if (daysLeft < 0) return 'Deadline passed';
    if (daysLeft === 0) return 'Deadline today!';
    if (daysLeft === 1) return 'Deadline tomorrow';
    return `${daysLeft} days left`;
}

function formatOpportunityType(type) {
    const map = {
        'internship': 'Internship',
        'hackathon': 'Hackathon',
        'scholarship': 'Scholarship',
        'workshop': 'Workshop',
        'tech-event': 'Tech Event',
        'competition': 'Competition'
    };
    return map[type] || type;
}

function renderOpportunityCard(opportunity) {
    const isSaved = userSavedOpportunities.has(opportunity._id);
    return `
        <div class="opportunity-card ${opportunity.isFeatured ? 'featured' : ''}">
            <span class="opportunity-type ${opportunity.type}">${formatOpportunityType(opportunity.type)}</span>
            <h3 class="opportunity-title">${opportunity.title}</h3>
            <div class="opportunity-company">${opportunity.company}</div>
            <div class="opportunity-meta">
                <div class="opportunity-meta-item">
                    <i class="fas fa-map-marker-alt"></i>
                    <span>${opportunity.location}</span>
                </div>
            </div>
            <div class="opportunity-deadline">
                <i class="fas fa-clock"></i>
                <span>${formatDeadline(opportunity.deadline)}</span>
            </div>
            <p class="opportunity-description">${opportunity.description}</p>
            <div class="opportunity-tags">
                ${opportunity.tags.map(tag => `<span class="opportunity-tag">${tag}</span>`).join('')}
            </div>
            <div class="opportunity-actions">
                <button class="opportunity-btn apply" onclick="window.open('${opportunity.applicationLink}', '_blank')">
                    <i class="fas fa-external-link-alt"></i> Apply
                </button>
                <button class="opportunity-btn save ${isSaved ? 'saved' : ''}" onclick="toggleSaveOpportunity('${opportunity._id}')">
                    <i class="fas ${isSaved ? 'fa-bookmark' : 'fa-bookmark'}"></i> ${isSaved ? 'Saved' : 'Save'}
                </button>
            </div>
        </div>
    `;
}

function renderOpportunities() {
    const container = document.getElementById('opportunities-grid');
    if (!container) return;
    container.innerHTML = opportunities
        .filter(o => !o.isFeatured)
        .map(renderOpportunityCard)
        .join('');
}

function renderFeaturedOpportunities() {
    const container = document.getElementById('featured-opportunities-grid');
    if (!container) return;
    const featured = opportunities.filter(o => o.isFeatured);
    if (featured.length === 0) {
        container.innerHTML = '<p style="color: var(--text-light); text-align: center;">No featured opportunities at the moment.</p>';
        return;
    }
    container.innerHTML = featured.map(renderOpportunityCard).join('');
}

async function toggleSaveOpportunity(opportunityId) {
    const token = localStorage.getItem('token');
    try {
        const res = await fetch(`http://localhost:5000/api/opportunities/${opportunityId}/save`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) {
            if (data.data.isSaved) {
                userSavedOpportunities.add(opportunityId);
                showNotification('success', 'Saved!', 'Opportunity saved successfully!');
            } else {
                userSavedOpportunities.delete(opportunityId);
                showNotification('success', 'Removed!', 'Opportunity removed from saved!');
            }
            renderOpportunities();
            renderFeaturedOpportunities();
        }
    } catch (err) {
        console.error('Error saving opportunity:', err);
    }
}

// Add filter event listeners
document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('opportunity-search');
    const typeFilter = document.getElementById('opportunity-type-filter');
    const sortSelect = document.getElementById('opportunity-sort');
    
    const handleFilterChange = () => {
        const token = localStorage.getItem('token');
        fetchOpportunities(token);
    };
    
    if (searchInput) {
        searchInput.addEventListener('input', handleFilterChange);
    }
    
    if (typeFilter) {
        typeFilter.addEventListener('change', handleFilterChange);
    }
    
    if (sortSelect) {
        sortSelect.addEventListener('change', handleFilterChange);
    }
});
