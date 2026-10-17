const nodemailer = require('nodemailer');

/** Gửi email với nội dung văn bản và HTML qua dịch vụ thư đã cấu hình. */
async function sendEmail(to, subject, text, html) {
    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
            user: 'doanweb2@gmail.com',
            pass: 'doanlaptrinhweb',
        },
    });

    return transporter.sendMail({
        from: '"VN Cinema"<1660736@gmail.com>',
        to,
        subject,
        text,
        html,
    });
}

module.exports = sendEmail;
