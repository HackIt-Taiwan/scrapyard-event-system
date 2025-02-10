import * as brevo from '@getbrevo/brevo';
import { render } from "@react-email/components";
import { EmailVerification } from "@/templates/email_verification";
import { LeaderEmailVerification } from "@/templates/leader_email_verification";
import { ApplyComplete } from "@/templates/apply_complete";
import { isRateLimited, getRateLimitInfo } from "./rate-limiter";

// Initialize Brevo API client
const apiInstance = new brevo.TransactionalEmailsApi();
apiInstance.setApiKey(brevo.TransactionalEmailsApiApiKeys.apiKey, process.env.EMAIL_PASS || '');

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

    const sendSmtpEmail = new brevo.SendSmtpEmail();
    sendSmtpEmail.sender = { name: "Scrapyard", email: "scrapyard@mail.hackit.tw" };
    sendSmtpEmail.to = [{ name: name || "Participant", email: to }];
    sendSmtpEmail.subject = "scrapyard - 驗證電子郵件";
    sendSmtpEmail.htmlContent = emailHtml;
    sendSmtpEmail.textContent = `請點擊以下連結驗證您的電子郵件：${url}`;
    sendSmtpEmail.headers = { 'X-Mailer': 'Scrapyard Mailer' };

    const data = await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log('Email sent successfully:', data.body);
    return true;
  } catch (error) {
    console.error("Error sending verification email:", error);
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

    const plainText = `
您好 ${userName}，

您的隊伍 ${teamName} 已完成報名資料填寫。

隊伍成員：
${teamMembers.map(member => `- ${member.name} (${member.email})`).join('\n')}

指導老師：
${teacher.name} (${teacher.email})

如需修改資料，請點擊以下連結：
${editUrl}
    `.trim();

    const sendSmtpEmail = new brevo.SendSmtpEmail();
    sendSmtpEmail.sender = { name: "Scrapyard", email: "scrapyard@mail.hackit.tw" };
    sendSmtpEmail.to = [{ name: userName, email: to }];
    sendSmtpEmail.subject = "scrapyard - 報名資料已完成填寫";
    sendSmtpEmail.htmlContent = emailHtml;
    sendSmtpEmail.textContent = plainText;
    sendSmtpEmail.headers = { 'X-Mailer': 'Scrapyard Mailer' };

    const data = await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log('Completion email sent successfully:', data.body);
    return true;
  } catch (error) {
    console.error("Error sending completion email:", error);
    return false;
  }
}

