const API_BASE_URL = 'http://localhost:5000/api';

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

document.addEventListener('DOMContentLoaded', function() {
    const authContainer = document.getElementById('authContainer');
    const showSignUpBtn = document.getElementById('showSignUp');
    const showLoginBtn = document.getElementById('showLogin');
    const togglePasswordBtns = document.querySelectorAll('.toggle-password');
    
    // Left card elements
    const leftWelcomeContent = document.getElementById('leftWelcomeContent');
    const leftSignupForm = document.getElementById('leftSignupForm');
    
    // Right card elements
    const rightLoginForm = document.getElementById('rightLoginForm');
    const rightSignupContent = document.getElementById('rightSignupContent');

    // Toggle password visibility
    togglePasswordBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const passwordInput = this.previousElementSibling;
            const icon = this.querySelector('i');
            
            if (passwordInput.type === 'password') {
                passwordInput.type = 'text';
                icon.classList.remove('fa-eye');
                icon.classList.add('fa-eye-slash');
            } else {
                passwordInput.type = 'password';
                icon.classList.remove('fa-eye-slash');
                icon.classList.add('fa-eye');
            }
        });
    });

    // Switch to Sign Up
    if (showSignUpBtn) {
        showSignUpBtn.addEventListener('click', function(e) {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
            
            authContainer.classList.add('swap');
            
            rightLoginForm.classList.remove('active');
            leftWelcomeContent.classList.remove('active');
            
            setTimeout(() => {
                leftSignupForm.classList.add('active');
                rightSignupContent.classList.add('active');
            }, 500);
        });
    }

    // Switch to Login
    if (showLoginBtn) {
        showLoginBtn.addEventListener('click', function(e) {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
            
            authContainer.classList.remove('swap');
            
            leftSignupForm.classList.remove('active');
            rightSignupContent.classList.remove('active');
            
            setTimeout(() => {
                leftWelcomeContent.classList.add('active');
                rightLoginForm.classList.add('active');
            }, 500);
        });
    }

    // Login form submission
    if (rightLoginForm) {
        rightLoginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const loginInput = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;
            console.log('FRONTEND LOGIN INPUT:', loginInput, 'PASSWORD:', password);
            
            // Check if loginInput is an email
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            const isEmail = emailRegex.test(loginInput);
            console.log('IS EMAIL:', isEmail);
            
            const requestBody = isEmail 
                ? { email: loginInput, password } 
                : { username: loginInput, password };
            console.log('REQUEST BODY:', requestBody);
            
            try {
                const response = await fetch(`${API_BASE_URL}/auth/login`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(requestBody)
                });
                
                const data = await response.json();
                
                if (data.success) {
                    console.log('✅ LOGIN SUCCESS DATA:', data);
                    console.log('👤 USER OBJECT:', data.user);
                    console.log('🔑 USER ROLE:', data.user.role);
                    localStorage.setItem('token', data.token);
                    localStorage.setItem('user', JSON.stringify(data.user));
                    // If admin, also set adminToken and adminUser
                    if (data.user && (data.user.role === 'admin' || data.user.role === 'Admin')) {
                        localStorage.setItem('adminToken', data.token);
                        localStorage.setItem('adminUser', JSON.stringify(data.user));
                    }
                    showNotification('success', 'Login Successful!', 'Redirecting to your dashboard...');
                    setTimeout(() => {
                        // Check if user is admin
                        if (data.user && (data.user.role === 'admin' || data.user.role === 'Admin')) {
                            console.log('🎯 REDIRECTING TO ADMIN DASHBOARD');
                            window.location.href = 'admin-dashboard.html';
                        } else {
                            console.log('🎯 REDIRECTING TO USER DASHBOARD');
                            window.location.href = 'dashboard.html';
                        }
                    }, 1500);
                } else {
                    showNotification('error', 'Login Failed', data.message || 'Please check your credentials');
                }
            } catch (error) {
                console.error('Error:', error);
                showNotification('error', 'Connection Error', `Is the backend server running at ${API_BASE_URL}?`);
            }
        });
    }

    // Signup form submission
    if (leftSignupForm) {
        leftSignupForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const name = document.getElementById('signupName').value;
            const email = document.getElementById('signupEmail').value;
            const password = document.getElementById('signupPassword').value;
            const confirmPassword = document.getElementById('signupConfirmPassword').value;
            const degree = document.getElementById('signupDegree').value;
            const semester = document.getElementById('signupSemester').value;
            const interests = document.getElementById('signupInterests').value;

            // NEW FIELDS
            const experience = document.getElementById('signupExperience').value;
            const webDev = document.getElementById('signupWebDev').value;
            const programming = document.getElementById('signupProgramming').value;
            const dsa = document.getElementById('signupDSA').value;
            const database = document.getElementById('signupDatabase').value;
            const aiMl = document.getElementById('signupAIML').value;
            const careerGoals = document.getElementById('signupCareerGoals').value;
            const learning = document.getElementById('signupLearning').value;
            const time = document.getElementById('signupTime').value;

            console.log('📝 Signup form values:', {
                name, email, password, degree, semester, interests,
                experience, webDev, programming, dsa, database, aiMl,
                careerGoals, learning, time
            });
            
            if (password !== confirmPassword) {
                showNotification('error', 'Validation Error', 'Passwords do not match!');
                return;
            }
            
            try {
                const response = await fetch(`${API_BASE_URL}/auth/register`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ 
                        name, email, password, degree, semester, interests,
                        experience, webDev, programming, dsa, database, aiMl,
                        careerGoals, learning, time
                    })
                });
                
                const data = await response.json();
                
                if (data.success) {
                    localStorage.setItem('token', data.token);
                    localStorage.setItem('user', JSON.stringify(data.user));
                    showNotification('success', 'Welcome to Career-Tantra!', 'Sign up successful! Switching to login...');
                    // After signup, switch back to login form
                    setTimeout(() => {
                        authContainer.classList.remove('swap');
                        leftSignupForm.classList.remove('active');
                        rightSignupContent.classList.remove('active');
                        setTimeout(() => {
                            leftWelcomeContent.classList.add('active');
                            rightLoginForm.classList.add('active');
                        }, 500);
                    }, 2000);
                } else {
                    showNotification('error', 'Sign Up Failed', data.message || 'Please check your details');
                }
            } catch (error) {
                console.error('Error:', error);
                showNotification('error', 'Connection Error', `Is the backend server running at ${API_BASE_URL}?`);
            }
        });
    }
});
