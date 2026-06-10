
const Roadmap = require('../models/Roadmap');

const seedRoadmaps = async () => {
  try {
    // Clear existing roadmaps
    await Roadmap.deleteMany({});

    const roadmaps = [
      {
        title: 'Full Stack Web Development',
        category: 'Full Stack Development',
        difficulty: 'Beginner',
        estimatedDuration: '3 months',
        tags: ['web', 'javascript', 'react', 'nodejs'],
        steps: [
          {
            title: 'Learn HTML & CSS Fundamentals',
            description: 'Master the building blocks of the web.',
            unlockOrder: 1,
            xpPoints: 50,
            resources: [
              { title: 'MDN Web Docs', url: 'https://developer.mozilla.org/en-US/docs/Learn/HTML', type: 'documentation' },
              { title: 'FreeCodeCamp', url: 'https://www.freecodecamp.org/learn/2022/responsive-web-design/', type: 'course' },
            ],
            projects: [
              { title: 'Personal Portfolio', description: 'Build a simple portfolio website using HTML and CSS', difficulty: 'Beginner' },
            ],
          },
          {
            title: 'JavaScript Essentials',
            description: 'Learn the basics of JavaScript programming.',
            unlockOrder: 2,
            xpPoints: 100,
            resources: [
              { title: 'JavaScript.info', url: 'https://javascript.info/', type: 'article' },
              { title: 'You Don\'t Know JS', url: 'https://github.com/getify/You-Dont-Know-JS', type: 'documentation' },
            ],
            projects: [
              { title: 'Todo List App', description: 'Build a simple todo app using vanilla JS', difficulty: 'Beginner' },
            ],
          },
          {
            title: 'DOM Manipulation',
            description: 'Learn how to interact with the DOM using JavaScript.',
            unlockOrder: 3,
            xpPoints: 75,
            resources: [
              { title: 'MDN DOM', url: 'https://developer.mozilla.org/en-US/docs/Web/API/Document_Object_Model', type: 'documentation' },
            ],
            projects: [
              { title: 'Interactive Quiz', description: 'Build a quiz with DOM manipulation', difficulty: 'Intermediate' },
            ],
          },
        ],
      },
      {
        title: 'AI & Machine Learning Fundamentals',
        category: 'AI/ML',
        difficulty: 'Beginner',
        estimatedDuration: '4 months',
        tags: ['ai', 'ml', 'python', 'tensorflow'],
        steps: [
          {
            title: 'Python for Beginners',
            description: 'Learn Python programming language basics.',
            unlockOrder: 1,
            xpPoints: 60,
            resources: [
              { title: 'Python.org', url: 'https://www.python.org/about/gettingstarted/', type: 'documentation' },
              { title: 'Codecademy', url: 'https://www.codecademy.com/learn/learn-python-3', type: 'course' },
            ],
            projects: [
              { title: 'Number Guessing Game', description: 'Create a simple number guessing game', difficulty: 'Beginner' },
            ],
          },
          {
            title: 'Introduction to Machine Learning',
            description: 'Learn ML basics, algorithms, and tools.',
            unlockOrder: 2,
            xpPoints: 120,
            resources: [
              { title: 'Coursera ML Course', url: 'https://www.coursera.org/learn/machine-learning', type: 'course' },
            ],
            projects: [
              { title: 'Iris Classification', description: 'Classify iris flowers using scikit-learn', difficulty: 'Intermediate' },
            ],
          },
        ],
      },
      {
        title: 'Cybersecurity Basics',
        category: 'Cybersecurity',
        difficulty: 'Beginner',
        estimatedDuration: '2 months',
        tags: ['security', 'networking', 'ethical-hacking'],
        steps: [
          {
            title: 'Networking Fundamentals',
            description: 'Learn how computer networks work.',
            unlockOrder: 1,
            xpPoints: 70,
            resources: [
              { title: 'CompTIA Network+', url: 'https://www.comptia.org/certifications/network', type: 'course' },
            ],
            projects: [
              { title: 'Home Network Setup', description: 'Set up and document your home network', difficulty: 'Beginner' },
            ],
          },
        ],
      },
    ];

    await Roadmap.create(roadmaps);
    console.log('✅ Default roadmaps seeded successfully!');
  } catch (error) {
    console.error('❌ Error seeding roadmaps:', error);
  }
};

module.exports = seedRoadmaps;
