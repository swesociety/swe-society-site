const nodemailer = require("nodemailer");
const Mailgen = require("mailgen");
const dotenv = require("dotenv");

dotenv.config()

const MAIL_EMAIL = process.env.MAIL_EMAIL
const MAIL_PASSWORD = process.env.MAIL_PASSWORD

const sendMail = async (regno, email, subject, introMessage, outroMessage) => {
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
      intro: introMessage, // "Pass from Society is " + otp,
      outro: outroMessage, // "Your Pass is for 5 minutes\nBest Regards, Team EcoSync",
      // signature: 'Best regards, Team Sohoj Thikadari'
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
}

module.exports = { sendMail }
