import nodemailer from "nodemailer";
import { env } from "../config/env.js";

const isMailConfigured = () =>
 Boolean(
  env.SMTP_HOST &&
  env.SMTP_PORT &&
  env.SMTP_USER &&
  env.SMTP_PASS &&
  env.MAIL_FROM
 );

const getTransporter = () => {
 if(!isMailConfigured()){
  return null;
 }

 return nodemailer.createTransport({
  host:env.SMTP_HOST,
  port:env.SMTP_PORT,
  secure:env.SMTP_SECURE,
  auth:{
   user:env.SMTP_USER,
   pass:env.SMTP_PASS
  }
 });
};

const buildLoginUrl = () =>
 env.PRIMARY_CLIENT_ORIGIN;

const escapeHtml = (value = "") =>
 String(value)
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;")
  .replaceAll("'", "&#039;");

export const sendAccountCredentialsEmail =
async ({
 to,
 name,
 role,
 email,
 password,
 schoolName,
 schoolCode
})=>{
 const transporter =
  getTransporter();

 if(!transporter){
  console.warn(
   `Email not sent to ${to}: SMTP is not configured`
  );

  return {
   skipped:true
  };
 }

 const loginUrl =
  buildLoginUrl();

 const safeRole =
  role.toLowerCase();

 await transporter.sendMail({
  from:env.MAIL_FROM,
  to,
  subject:
   `Your BenQ Education ${safeRole} account`,
  text:
`Hello ${name},

Your BenQ Education ${safeRole} account has been created.

School: ${schoolName || "Your school"}
School code: ${schoolCode || ""}
Login email: ${email}
Temporary password: ${password}

Login here: ${loginUrl}

Please sign in and change your password from the Change Password page as soon as possible.
`,
  html:
   `
   <div style="font-family:Arial,sans-serif;line-height:1.6;color:#123;">
    <h2>Your BenQ Education account is ready</h2>
    <p>Hello ${escapeHtml(name)},</p>
    <p>Your ${escapeHtml(safeRole)} account has been created.</p>
    <table style="border-collapse:collapse;margin:16px 0;">
     <tr>
      <td style="padding:6px 12px;font-weight:bold;">School</td>
      <td style="padding:6px 12px;">${escapeHtml(schoolName || "Your school")}</td>
     </tr>
     <tr>
      <td style="padding:6px 12px;font-weight:bold;">School code</td>
      <td style="padding:6px 12px;">${escapeHtml(schoolCode || "")}</td>
     </tr>
     <tr>
      <td style="padding:6px 12px;font-weight:bold;">Login email</td>
      <td style="padding:6px 12px;">${escapeHtml(email)}</td>
     </tr>
     <tr>
      <td style="padding:6px 12px;font-weight:bold;">Temporary password</td>
      <td style="padding:6px 12px;">${escapeHtml(password)}</td>
     </tr>
    </table>
    <p>
     <a href="${escapeHtml(loginUrl)}" style="background:#008C95;color:#fff;padding:10px 16px;border-radius:8px;text-decoration:none;">
      Open BenQ Education
     </a>
    </p>
    <p>Please sign in and change your password from the Change Password page as soon as possible.</p>
   </div>
   `
 });

 return {
  skipped:false
 };
};
