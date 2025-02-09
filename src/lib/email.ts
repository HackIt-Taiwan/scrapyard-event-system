import nodemailer from "nodemailer";
import { render } from "@react-email/components";
import { EmailVerification } from "@/templates/email_verification";
import { LeaderEmailVerification } from "@/templates/leader_email_verification";

export const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT),
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export async function sendVerificationEmail(
  to: string,
  url: string,
  name?: string,
  isLeader: boolean = false,
  finishPageUrl?: string,
) {
  try {
    const emailHtml = await render(
      isLeader && finishPageUrl
        ? LeaderEmailVerification({ verificationUrl: url, finishPageUrl, userName: name })
        : EmailVerification({ verificationUrl: url, userName: name }),
    );

    const options = {
      from: "", // not sure if this is necessary, keep it if used.
      to: to,
      subject: "scrapyard - 驗證電子郵件",
      html: emailHtml,
    };

    await transporter.sendMail(options);

    return true;
  } catch (error) {
    console.log(`Error while sending email:${error}`);
    return false;
  }
}

