import * as React from "react";
import {
  Html,
  Text,
  Heading,
  Container,
  Img,
  Section,
  Hr,
} from "@react-email/components";

interface LeaderEmailVerificationProps {
  verificationUrl: string;
  finishPageUrl: string;
  userName?: string;
}

export function LeaderEmailVerification({
  verificationUrl,
  finishPageUrl,
  userName,
}: LeaderEmailVerificationProps) {
  return (
    <Html lang="en">
      <Container
        style={{
          fontFamily: "Arial, sans-serif",
          padding: "20px",
          backgroundColor: "#f9f9f9",
        }}
      >
        <Section style={{ textAlign: "center", marginBottom: "20px" }}>
          <Img
            src="https://scrapyard.hackit.tw/banner-resized.png"
            alt="Email Verification Banner"
            width="100%"
            style={{ maxWidth: "200px", display: "block", margin: "0 auto" }}
          />
        </Section>

        <Heading as="h2" style={{ color: "#333", textAlign: "center" }}>
          驗證你的電子郵件
        </Heading>

        <Text style={{ color: "#555", fontSize: "16px", textAlign: "center" }}>
          {userName ? `你好 ${userName}，` : "你好，"}
          作為團隊隊長，你除了驗證電子郵件以外還需要傳送填寫的連結給隊友以及傳送切結書：
        </Text>

        <Section style={{ textAlign: "center", margin: "20px 0" }}>
          <table align="center" role="presentation" border={0} cellSpacing={0} cellPadding={0} style={{ width: "100%", maxWidth: "500px" }}>
            <tr>
              <td align="center" style={{ padding: "16px", backgroundColor: "#fff", border: "1px solid #e2e8f0", borderRadius: "8px" }}>
                <Text style={{ color: "#555", fontSize: "16px", margin: "0 0 16px 0" }}>
                  第一步：驗證電子郵件
                </Text>
                <table align="center" role="presentation" border={0} cellSpacing={0} cellPadding={0}>
                  <tr>
                    <td align="center" style={{ backgroundColor: "#007bff", borderRadius: "5px" }}>
                      <a
                        href={verificationUrl}
                        style={{
                          display: "inline-block",
                          color: "#ffffff",
                          fontSize: "16px",
                          fontWeight: "bold",
                          textDecoration: "none",
                          padding: "12px 24px",
                          borderRadius: "5px",
                          backgroundColor: "#007bff",
                        }}
                      >
                        驗證電子郵件
                      </a>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </Section>

        <Section style={{ textAlign: "center", margin: "20px 0" }}>
          <table align="center" role="presentation" border={0} cellSpacing={0} cellPadding={0} style={{ width: "100%", maxWidth: "500px" }}>
            <tr>
              <td align="center" style={{ padding: "16px", backgroundColor: "#fff", border: "1px solid #e2e8f0", borderRadius: "8px" }}>
                <Text style={{ color: "#555", fontSize: "16px", margin: "0 0 16px 0" }}>
                  第二步：前往完成頁面上傳切結書
                </Text>
                <table align="center" role="presentation" border={0} cellSpacing={0} cellPadding={0}>
                  <tr>
                    <td align="center" style={{ backgroundColor: "#28a745", borderRadius: "5px" }}>
                      <a
                        href={finishPageUrl}
                        style={{
                          display: "inline-block",
                          color: "#ffffff",
                          fontSize: "16px",
                          fontWeight: "bold",
                          textDecoration: "none",
                          padding: "12px 24px",
                          borderRadius: "5px",
                          backgroundColor: "#28a745",
                        }}
                      >
                        前往完成頁面
                      </a>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </Section>

        <Section style={{ margin: "20px 0" }}>
          <table align="center" role="presentation" border={0} cellSpacing={0} cellPadding={0} style={{ width: "100%", maxWidth: "500px" }}>
            <tr>
              <td style={{ padding: "16px", backgroundColor: "#fff", border: "1px solid #e2e8f0", borderRadius: "8px" }}>
                <Text style={{ color: "#555", fontSize: "14px", margin: "0 0 8px 0" }}>
                  驗證網址：
                </Text>
                <Text style={{ 
                  color: "#007bff", 
                  fontSize: "14px", 
                  wordBreak: "break-all",
                  padding: "8px",
                  backgroundColor: "#f8f9fa",
                  borderRadius: "4px",
                  margin: "0 0 16px 0"
                }}>
                  <a href={verificationUrl} style={{ color: "#007bff", textDecoration: "none" }}>
                    {verificationUrl}
                  </a>
                </Text>
                
                <Text style={{ color: "#555", fontSize: "14px", margin: "0 0 8px 0" }}>
                  完成頁面網址：
                </Text>
                <Text style={{ 
                  color: "#28a745", 
                  fontSize: "14px", 
                  wordBreak: "break-all",
                  padding: "8px",
                  backgroundColor: "#f8f9fa",
                  borderRadius: "4px",
                  margin: "0"
                }}>
                  <a href={finishPageUrl} style={{ color: "#28a745", textDecoration: "none" }}>
                    {finishPageUrl}
                  </a>
                </Text>
              </td>
            </tr>
          </table>
        </Section>

        <Text style={{ color: "#777", fontSize: "14px", textAlign: "center", margin: "24px 0" }}>
          若你並未請求驗證，可以忽略此封郵件。
        </Text>

        <Hr style={{ borderColor: "#dddddd", marginTop: "48px" }} />

        <Section>
          <table align="center" role="presentation" border={0} cellSpacing={0} cellPadding={0}>
            <tr>
              <td align="center">
                <Img
                  src="https://scrapyard.hackit.tw/favicon.png"
                  width="32"
                  height="32"
                  style={{ display: "inline-block", verticalAlign: "middle" }}
                />
              </td>
              <td>
                <Text style={{ color: "#8898aa", fontSize: "12px", marginLeft: "8px" }}>
                  scrapyard.hackit.tw
                </Text>
              </td>
            </tr>
          </table>
        </Section>
      </Container>
    </Html>
  );
} 