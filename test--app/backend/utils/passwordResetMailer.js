const nodemailer = require("nodemailer");

const isEmailConfigured = () => [
    "SMTP_HOST",
    "SMTP_PORT",
    "SMTP_USER",
    "SMTP_PASSWORD",
    "SMTP_FROM"
].every((key) => Boolean(process.env[key]));

const sendPasswordResetEmail = async (email, resetUrl) => {
    const port = Number(process.env.SMTP_PORT);
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port,
        secure: port === 465,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASSWORD
        }
    });

    await transporter.sendMail({
        from: process.env.SMTP_FROM,
        to: email,
        subject: "Reset your Finora password",
        text: `Use this link to reset your Finora password. It expires in 15 minutes:\n\n${resetUrl}`,
        html: `<p>Use the link below to reset your Finora password. It expires in 15 minutes.</p><p><a href="${resetUrl}">Reset your password</a></p>`
    });
};

module.exports = {
    isEmailConfigured,
    sendPasswordResetEmail
};
