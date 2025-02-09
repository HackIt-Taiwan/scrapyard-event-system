import nodemailer from "nodemailer";
import { render } from "@react-email/components";
import { EmailVerification } from "@/templates/email_verification";
import { LeaderEmailVerification } from "@/templates/leader_email_verification";
import { ApplyComplete } from "@/templates/apply_complete";
import { isRateLimited, getRateLimitInfo } from "./rate-limiter";

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
  userId?: string,
) {
  try {
    if (userId) {
      if (isRateLimited(userId)) {
        const { remainingEmails, msUntilReset } = getRateLimitInfo(userId);
        const minutesUntilReset = Math.ceil(msUntilReset / (60 * 1000));
        throw new Error(`Rate limit exceeded. Please try again in ${minutesUntilReset} minutes.`);
      }
    }

    const emailHtml = await render(
      isLeader && finishPageUrl
        ? LeaderEmailVerification({ verificationUrl: url, finishPageUrl, userName: name })
        : EmailVerification({ verificationUrl: url, userName: name }),
    );

    const options = {
      from: "scrapyard@mail.hackit.tw",
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

export async function sendApplyCompleteEmail(
  to: string,
  userName: string,
  teamName: string,
  teamMembers: Array<{name: string, email: string}>,
  teacher: {name: string, email: string},
  editUrl: string,
) {
  try {
    const emailHtml = await render(
      ApplyComplete({ 
        userName,
        teamName,
        teamMembers,
        teacher,
        editUrl,
      })
    );

    const options = {
      from: "scrapyard@mail.hackit.tw",
      to: to,
      subject: "scrapyard - 報名資料已完成填寫",
      html: emailHtml,
    };

    await transporter.sendMail(options);
    return true;
  } catch (error) {
    console.log(`Error while sending completion email:${error}`);
    return false;
  }
}

