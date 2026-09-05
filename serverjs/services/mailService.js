const nodemailer = require("nodemailer");
const Mailgen = require("mailgen");
const dotenv = require("dotenv");

dotenv.config()

const sendMail = async (regno, email, subject, introMessage, outroMessage) => {
  const MAIL_EMAIL = process.env.MAIL_EMAIL
  const MAIL_PASSWORD = process.env.MAIL_PASSWORD

  if (!MAIL_EMAIL || !MAIL_PASSWORD) {
    console.warn(`[MailService] Skipping email to ${email}: MAIL_EMAIL or MAIL_PASSWORD is not configured in .env`);
    return;
  }

  try {
    let config = {
      service: "gmail",
      auth: {
        user: MAIL_EMAIL,
        pass: MAIL_PASSWORD
      }
    }

    let transporter = nodemailer.createTransport(config)

    let MailGenerator = new Mailgen({
      theme: "default",
      product: {
        name: "SUST SWE Society",
        link: "https://www.facebook.com/swesocietysust"
      }
    })

    let response = {
      body: {
        regno: regno,
        intro: introMessage,
        outro: outroMessage,
        signature: false
      }
    }

    let mail = MailGenerator.generate(response)

    let message = {
      from: MAIL_EMAIL,
      to: email,
      subject: subject,
      html: mail
    }

    await transporter.sendMail(message)
    console.log(`[MailService] Email sent successfully to ${email}`);
  } catch (error) {
    console.error(`[MailService] Failed to send email to ${email}:`, error.message);
  }
}

module.exports = { sendMail }
