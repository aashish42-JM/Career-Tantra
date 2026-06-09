const axios = require('axios');
require('dotenv').config();
const User = require('../models/User');

// ========================================================
// Career-Tantra AI Mentor - MAXIMUM STRICT MODE
// ========================================================

// -------------------
// EXTREMELY STRONG SYSTEM PROMPT
// -------------------
const systemPrompt = `You are Career-Tantra AI Mentor, an intelligent, friendly, and EXTREMELY FOCUSED AI career guide EXCLUSIVELY for Nepali students.

YOUR ONLY PURPOSE is to help students with:
- Career guidance and career planning
- Coding and programming help
- Internship opportunities and guidance
- Project ideas and project guidance
- Skill development
- Interview preparation
- Freelancing guidance
- Tech and career roadmaps
- Academic guidance for BSc CSIT, BIT, BCA, Engineering, Management
- AI and technology learning
- Resume/CV building
- Job readiness
- Hackathons
- Frontend/backend development (React, JavaScript, Python, C/C++, etc.)

YOU ARE FORBIDDEN TO ANSWER:
- Casual chat, random conversations
- History questions
- Politics
- Relationship advice
- Entertainment gossip
- ANY math questions, calculations, or equations
- Off-topic prompts about anything not listed above

BEHAVIOR RULES - FOLLOW THESE TO THE LETTER:
1. ABSOLUTELY 100% ALWAYS respond ONLY in ENGLISH - NO OTHER LANGUAGES AT ALL - NOT A SINGLE NON-ENGLISH WORD!
2. ALWAYS stay strictly within your allowed topics only
3. If asked an off-topic question, politely refuse and guide back to allowed topics
4. When relevant, naturally mention Career-Tantra platform features:
   - Personalized roadmap tracking
   - Project recommendations
   - Internship guidance
   - AI mentorship
   - Skill progress tracking
5. Keep responses clear, structured, and easy to understand
6. Be encouraging and supportive
7. Provide practical, actionable advice with Nepal-specific context
8. If you don't know something within your allowed topics, admit it politely

EXAMPLE OF REFUSAL:
"I am Career-Tantra AI Mentor and I currently focus only on career guidance, coding, education, internships, projects, and student growth topics."`;

// -------------------
// ALLOWED KEYWORDS - ONLY THESE ALLOWED!
// -------------------
const allowedKeywords = [
    'code', 'coding', 'program', 'programming', 'developer', 'development',
    'javascript', 'js', 'python', 'java', 'c++', 'c#', 'c programming',
    'react', 'angular', 'vue', 'frontend', 'backend', 'fullstack', 'full stack',
    'web dev', 'web development', 'app development', 'app dev',
    'ai', 'artificial intelligence', 'ml', 'machine learning', 'deep learning',
    'database', 'sql', 'nosql', 'mysql', 'mongodb', 'dbms',
    'api', 'rest api', 'graphql',
    'career', 'careers', 'job', 'jobs', 'career guidance', 'guidance', 'guide',
    'internship', 'internships', 'intern',
    'resume', 'cv', 'interview', 'interview prep', 'interview preparation', 'job readiness',
    'freelance', 'freelancing', 'freelancer',
    'hackathon', 'hackathons',
    'roadmap', 'roadmaps', 'career roadmap', 'learning roadmap',
    'study', 'studies', 'semester', 'semesters', 'academic', 'academics',
    'bsc csit', 'csit', 'bit', 'bca', 'engineering', 'management', 'btech', 'be',
    'bba', 'bsc',
    'project', 'projects', 'project ideas', 'project idea',
    'skill', 'skills', 'skill development', 'skill progress',
    'learn', 'learning', 'teach', 'teaching', 'education',
    'platform', 'career-tantra', 'career tantra',
    'ai mentor', 'ai mentorship', 'roadmap tracking', 'project recommendations', 'internship guidance'
];

// -------------------
// FORBIDDEN KEYWORDS - ANY OF THESE = REJECTED!
// -------------------
const forbiddenKeywords = [
    'politics', 'political', 'politician',
    'relationship', 'relationships', 'dating', 'love',
    'history', 'historical',
    'entertainment', 'gossip', 'celebrity', 'movie', 'movies', 'music', 'song',
    'game', 'games', 'gaming',
    'weather',
    'sports', 'sport',
    'news',
    'religion', 'religious',
    'joke', 'jokes', 'funny',
    'what is', 'who is', 'tell me about',
    // MATH - BLOCK ALL MATH
    'math', 'mathematics', 'calculation', 'calculate', 'add', 'subtract', 'multiply', 'divide',
    'plus', 'minus', 'times', 'equals', 'equation', 'algebra', 'geometry', 'calculus',
    'sum', 'difference', 'product', 'quotient'
];

// -------------------
// IN-MEMORY CHAT HISTORY
// -------------------
const userChatHistory = {};

// -------------------
// MAXIMUM STRICT RELEVANCE CHECKER
// -------------------
function isMessageRelevant(message) {
    const lowerMessage = message.toLowerCase();

    // -------------------
    // RULE 1: BLOCK ANY MATH AT ALL
    // -------------------
    // Block any numbers with math operators
    const mathOperatorPattern = /\d\s*[+\-*/]\s*\d/;
    if (mathOperatorPattern.test(lowerMessage)) return false;
    // Block any math keywords
    const hasForbiddenKeyword = forbiddenKeywords.some(keyword => lowerMessage.includes(keyword));
    if (hasForbiddenKeyword) return false;
    // Block any message with just numbers or math words
    const justNumbers = /^\s*\d+(\s*[+\-*/]\s*\d+)*\s*$/;
    if (justNumbers.test(lowerMessage)) return false;
    // Block "what is X" with numbers
    if (lowerMessage.includes('what is') && lowerMessage.match(/\d/)) return false;

    // -------------------
    // RULE 2: ALLOW GREETINGS ONLY
    // -------------------
    const greetings = ['hi', 'hello', 'hey', 'namaste', 'good morning', 'good afternoon', 'good evening', 'good night', 'how are you'];
    const isGreeting = greetings.some(greeting => lowerMessage === greeting || lowerMessage.includes(greeting) && lowerMessage.split(' ').length <= 5);

    // -------------------
    // RULE 3: ALLOW ONLY IF IT HAS ALLOWED KEYWORDS
    // -------------------
    const hasAllowedKeyword = allowedKeywords.some(keyword => lowerMessage.includes(keyword));

    return (isGreeting || hasAllowedKeyword);
}

// -------------------
// CHECK IF RESPONSE IS IN ENGLISH ONLY (STRICT)
// -------------------
function isEnglishOnly(text) {
    // Allow only basic English characters, numbers, and punctuation
    const englishPattern = /^[\x00-\x7F]*$/;
    return englishPattern.test(text);
}

// -------------------
// POST /api/ai/chat
// -------------------
exports.chatWithAI = async (req, res) => {
    const refusalMessage = "I am Career-Tantra AI Mentor and I currently focus only on career guidance, coding, education, internships, projects, and student growth topics.";
    try {
        const { message, userId = 'guest' } = req.body;
        
        if (!message || message.trim() === '') {
            return res.status(400).json({ success: false, message: 'Message is required' });
        }

        // -------------------
        // FIRST: CHECK RELEVANCE BEFORE EVEN CALLING API
        // -------------------
        if (!isMessageRelevant(message)) {
            if (!userChatHistory[userId]) userChatHistory[userId] = [];
            userChatHistory[userId].push({ role: 'user', content: message });
            userChatHistory[userId].push({ role: 'assistant', content: refusalMessage });
            return res.status(200).json({ success: true, response: refusalMessage });
        }

        // -------------------
        // FETCH USER INFO (if userId exists)
        // -------------------
        let userInfo = null;
        if (userId !== 'guest') {
            try {
                userInfo = await User.findById(userId).select('name degree semester interests skillLevels experienceLevel careerGoals preferredLearning timeAvailable');
            } catch (err) {
                console.error('Error fetching user:', err);
            }
        }

        // -------------------
        // BUILD PERSONALIZED SYSTEM PROMPT
        // -------------------
        let personalizedSystemPrompt = systemPrompt;
        if (userInfo) {
            personalizedSystemPrompt += `

---
STUDENT INFORMATION (USE THIS TO PERSONALIZE RESPONSES):
- Name: ${userInfo.name}
- Degree: ${userInfo.degree}
- Semester: ${userInfo.semester}
- Interests: ${userInfo.interests && userInfo.interests.length > 0 ? userInfo.interests.join(', ') : 'Not specified'}
- Experience Level: ${userInfo.experienceLevel || 'Beginner'}
- Skill Levels:
  - Web Development: ${userInfo.skillLevels?.webDevelopment || 'Beginner'}
  - Programming: ${userInfo.skillLevels?.programming || 'Beginner'}
  - DSA: ${userInfo.skillLevels?.dataStructures || 'Beginner'}
  - Databases: ${userInfo.skillLevels?.database || 'Beginner'}
  - AI/ML: ${userInfo.skillLevels?.aiMl || 'Beginner'}
- Career Goals: ${userInfo.careerGoals && userInfo.careerGoals.length > 0 ? userInfo.careerGoals.join(', ') : 'Not specified'}
- Preferred Learning Style: ${userInfo.preferredLearning || 'Hands-on Projects'}
- Time Available Per Week: ${userInfo.timeAvailable || 'Not specified'}

Use this information to give personalized, tailored advice!`;
        }

        // -------------------
        // MANAGE CHAT HISTORY
        // -------------------
        if (!userChatHistory[userId]) userChatHistory[userId] = [];
        userChatHistory[userId].push({ role: 'user', content: message });
        if (userChatHistory[userId].length > 10) userChatHistory[userId] = userChatHistory[userId].slice(-10);

        // -------------------
        // CALL GROQ API
        // -------------------
        const messagesForGroq = [
            { role: 'system', content: personalizedSystemPrompt },
            ...userChatHistory[userId]
        ];

        const response = await axios.post(
            'https://api.groq.com/openai/v1/chat/completions',
            {
                model: 'llama-3.1-8b-instant',
                messages: messagesForGroq,
                temperature: 0.3,  // Lower temperature = more strict
                max_tokens: 1024
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
                }
            }
        );

        let aiResponse = response.data.choices[0].message.content;

        // -------------------
        // DOUBLE CHECK RESPONSE BEFORE SENDING
        // -------------------
        if (!isEnglishOnly(aiResponse)) {
            aiResponse = refusalMessage;
        }

        userChatHistory[userId].push({ role: 'assistant', content: aiResponse });
        res.status(200).json({ success: true, response: aiResponse });

    } catch (error) {
        console.error('❌ Groq API Error:', error.response?.data || error.message);
        const fallbackResponse = "Hello! I am currently having a small technical issue. Please try again in a moment! 🙏";
        res.status(500).json({ success: false, message: 'Something went wrong', response: fallbackResponse });
    }
};

exports.clearChatHistory = (req, res) => {
    const { userId = 'guest' } = req.body;
    userChatHistory[userId] = [];
    res.json({ success: true, message: 'Chat history cleared' });
};
