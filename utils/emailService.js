const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
});

const sendWelcomeEmail = async (userEmail, username) => {
    console.log('Attempting to send welcome email to:', userEmail);
    try {
        // Verify email configuration
        console.log('Checking email configuration...');
        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
            throw new Error('Email configuration is missing. Please check EMAIL_USER and EMAIL_PASSWORD in environment variables.');
        }

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: userEmail,
            subject: 'Welcome to Symptocare - Your Health Journey Begins Here!',
            html: `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { text-align: center; padding: 20px 0; }
                    .logo { color: #3b82f6; font-size: 24px; font-weight: bold; }
                    .content { background-color: #f8fafc; padding: 30px; border-radius: 10px; }
                    .button { 
                        background-color: #3b82f6; 
                        color: white; 
                        padding: 12px 24px; 
                        text-decoration: none; 
                        border-radius: 5px; 
                        display: inline-block; 
                        margin-top: 20px;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <div class="logo">
                            🩺 Symptocare
                        </div>
                    </div>
                    <div class="content">
                        <h2>Welcome to Symptocare, ${username}!</h2>
                        <p>Thank you for joining our healthcare community. We're excited to help you on your journey to better health!</p>
                        <p>With Symptocare, you can:</p>
                        <ul>
                            <li>Find and book appointments with qualified doctors</li>
                            <li>Access comprehensive healthcare information</li>
                            <li>Manage your medical records securely</li>
                            <li>Get personalized health recommendations</li>
                        </ul>
                        <p>Get started by exploring our services!</p>
                        <a href="https://find-doctor-gold.vercel.app/find-doctor" class="button" style="background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 20px;">Visit Dashboard</a>
                        <p>If you have any questions, feel free to reach out to our support team.</p>
                        <p>Best regards,<br/>The Symptocare Team</p>
                    </div>
                </div>
            </body>
            </html>`
        };

        console.log('Sending email...');
        await transporter.sendMail(mailOptions);
        console.log('Welcome email sent successfully to:', userEmail);
        return { success: true, message: 'Welcome email sent successfully' };
    } catch (error) {
        console.error('Error sending welcome email:', error);
        return { success: false, message: error.message };
    }
};


module.exports = { sendWelcomeEmail };
