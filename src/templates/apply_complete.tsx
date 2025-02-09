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

interface ApplyCompleteProps {
  userName: string;
  teamName: string;
  teamMembers: Array<{name: string, email: string}>;
  teacher: {name: string, email: string};
  editUrl: string;
}

export function ApplyComplete({
  userName,
  teamName,
  teamMembers,
  teacher,
  editUrl,
}: ApplyCompleteProps) {
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
            alt="Apply Complete Banner"
            width="100%"
            style={{ maxWidth: "200px", display: "block", margin: "0 auto" }}
          />
        </Section>

        <Heading as="h2" style={{ color: "#333", textAlign: "center" }}>
          報名資料已完成填寫！
        </Heading>

        <Text style={{ color: "#555", fontSize: "16px", textAlign: "center" }}>
          {`你好 ${userName}，`}
          <br />
          感謝你完成 {teamName} 的報名資料填寫。
        </Text>

        <Section style={{ margin: "20px 0" }}>
          <Text style={{ color: "#555", fontSize: "16px" }}>
            團隊成員資料：
          </Text>
          {teamMembers.map((member, index) => (
            <Text key={index} style={{ color: "#666", fontSize: "14px", margin: "4px 0" }}>
              {`${member.name} (${member.email})`}
            </Text>
          ))}
          
          <Text style={{ color: "#555", fontSize: "16px", marginTop: "16px" }}>
            指導老師：
          </Text>
          <Text style={{ color: "#666", fontSize: "14px", margin: "4px 0" }}>
            {`${teacher.name} (${teacher.email})`}
          </Text>
        </Section>

        <Text style={{ color: "#555", fontSize: "16px", textAlign: "center", marginTop: "24px" }}>
          如果需要修改資料，你可以點擊以下按鈕：
        </Text>

        <Section style={{ textAlign: "center", margin: "20px 0" }}>
          <table align="center" role="presentation" border={0} cellSpacing={0} cellPadding={0}>
            <tr>
              <td align="center" style={{ backgroundColor: "#28a745", borderRadius: "5px" }}>
                <a
                  href={editUrl}
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
                  修改資料
                </a>
              </td>
            </tr>
          </table>
        </Section>

        <Text style={{ color: "#555", fontSize: "14px", textAlign: "center", wordBreak: "break-word" }}>
          或點擊以下網址：
          <br />
          <a href={editUrl} style={{ color: "#28a745", textDecoration: "underline" }}>
            {editUrl}
          </a>
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