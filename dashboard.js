// Notification helper function
function showNotification(type, title, message) {
    // Create container if it doesn't exist
    let container = document.querySelector('.notification-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'notification-container';
        document.body.appendChild(container);
    }

    // Create notification element
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
    
    // Remove notification after 5 seconds
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

document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in
    const user = JSON.parse(localStorage.getItem('user'));
    const token = localStorage.getItem('token');
    
    if (!user || !token) {
        // Redirect to login if not logged in
        showNotification('error', 'Not Logged In', 'Please log in first!');
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 1500);
        return;
    }
    
    // Update UI with user data
    const userNameNav = document.getElementById('user-name-nav');
    const userNameHero = document.getElementById('user-name-hero');
    
    if (userNameNav) {
        userNameNav.textContent = `Hi, ${user.name}`;
    }
    
    if (userNameHero) {
        userNameHero.textContent = user.name;
    }
    
    // Fetch full user data
    fetchUserData(token);
    
    // Roadmap toggle functionality
    const roadmapSection = document.getElementById('roadmap');
    const toggleRoadmapBtn = document.getElementById('toggle-roadmap-btn');
    const quickToggleRoadmap = document.getElementById('quick-toggle-roadmap');
    
    // Toggle roadmap visibility
    function toggleRoadmap() {
        if (roadmapSection) {
            const isVisible = roadmapSection.style.display !== 'none';
            roadmapSection.style.display = isVisible ? 'none' : 'block';
            // Optional: scroll to roadmap when shown
            if (!isVisible) {
                roadmapSection.scrollIntoView({ behavior: 'smooth' });
            }
        }
    }
    
    if (toggleRoadmapBtn) {
        toggleRoadmapBtn.addEventListener('click', function(e) {
            e.preventDefault();
            toggleRoadmap();
        });
    }
    
    if (quickToggleRoadmap) {
        quickToggleRoadmap.addEventListener('click', function(e) {
            e.preventDefault();
            toggleRoadmap();
        });
    }
    
    // Logout functionality
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            // Clear localStorage
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            // Show success message
            showNotification('success', 'Logged Out', 'You have been logged out successfully!');
            // Redirect to login
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 1500);
        });
    }
    
    // AI Mentor Chat Functionality
    const openChatBtn = document.getElementById('open-chat-btn');
    const floatingChatBtn = document.getElementById('floating-chat-btn');
    const closeChatBtn = document.getElementById('close-chat-btn');
    const chatModal = document.getElementById('chat-modal');
    const chatInput = document.getElementById('chat-input');
    const sendMessageBtn = document.getElementById('send-message-btn');
    const chatMessages = document.getElementById('chat-messages');
    
    // User ID for chat history
    const userId = user?._id || user?.id || 'guest';
    
    // Open chat modal (from feature card)
    if (openChatBtn) {
        openChatBtn.addEventListener('click', function() {
            chatModal.classList.add('active');
            chatInput.focus();
        });
    }
    
    // Open chat modal (from floating button)
    if (floatingChatBtn) {
        floatingChatBtn.addEventListener('click', function() {
            chatModal.classList.add('active');
            chatInput.focus();
        });
    }
    
    // Close chat modal
    if (closeChatBtn) {
        closeChatBtn.addEventListener('click', function() {
            chatModal.classList.remove('active');
        });
    }
    
    // Close chat when clicking outside
    if (chatModal) {
        chatModal.addEventListener('click', function(e) {
            if (e.target === chatModal) {
                chatModal.classList.remove('active');
            }
        });
    }
    
    // Add message to chat - supports basic formatting
    function addMessage(content, isUser) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('chat-message');
        messageDiv.classList.add(isUser ? 'user-message' : 'ai-message');
        
        // Convert newlines to <br> for better formatting
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
    
    // Show typing indicator
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
    
    // Remove typing indicator
    function removeTypingIndicator() {
        const typingDiv = document.getElementById('typing-indicator');
        if (typingDiv) {
            typingDiv.remove();
        }
    }
    
    // Send message function
    async function sendMessage() {
        const message = chatInput.value.trim();
        if (!message) return;
        
        // Add user message
        addMessage(message, true);
        chatInput.value = '';
        
        // Show typing indicator
        showTypingIndicator();
        
        try {
            // Send message to backend
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
            
            // Remove typing indicator
            removeTypingIndicator();
            
            // Add AI response
            addMessage(data.response, false);
        } catch (error) {
            removeTypingIndicator();
            addMessage('Namaste! I am currently having a small technical issue. Please try again in a moment! 🙏', false);
            console.error('Chat error:', error);
        }
    }
    
    // Send message on button click
    if (sendMessageBtn) {
        sendMessageBtn.addEventListener('click', sendMessage);
    }
    
    // Send message on Enter key
    if (chatInput) {
        chatInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                sendMessage();
            }
        });
    }
});

// Fetch full user data from backend
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

// Render user profile in skills section
function renderUserProfile() {
    if (!currentUser) return;
    
    // Update profile info
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

// Helper to get numeric value for skill level
function getSkillValue(level) {
    const map = { 'Beginner': 1, 'Intermediate': 2, 'Advanced': 3, 'Expert': 4 };
    return map[level] || 1;
}

// Render charts
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

    // Radar Chart
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

    // Bar Chart
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
