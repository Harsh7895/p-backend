require('dotenv').config();
const { sendWelcomeEmail } = require('./utils/emailService');

async function testEmail() {
    console.log('Testing email service...');
    console.log('Email configuration:', {
        user: process.env.EMAIL_USER ? 'Set' : 'Not set',
        pass: process.env.EMAIL_PASSWORD ? 'Set' : 'Not set'
    });
    
    try {
        const result = await sendWelcomeEmail('test@example.com', 'Test User');
        console.log('Email test result:', result);
    } catch (error) {
        console.error('Test failed:', error);
    }
}

testEmail();
