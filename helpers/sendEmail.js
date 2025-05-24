const sgMail = require('@sendgrid/mail');
require('dotenv').config();

const { SENDGRID_API_KEY, SENDGRID_FROM_EMAIL } = process.env;

sgMail.setApiKey(SENDGRID_API_KEY);

const sendEmail = async (to, subject, html) => {
  const msg = {
    to,
    from: SENDGRID_FROM_EMAIL,
    subject,
    html,
  };
  await sgMail.send(msg);
};

module.exports = sendEmail;