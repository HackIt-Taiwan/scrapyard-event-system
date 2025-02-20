import {
  Container,
  Heading,
  Hr,
  Html,
  Img,
  Section,
  Text,
} from "@react-email/components";

interface StaffLoginVerificationProps {
  OTP: string;
}

export function StaffLoginVerification({ OTP }: StaffLoginVerificationProps) {
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

        <Text
          style={{
            color: "#555",
            fontSize: "16px",
            textAlign: "center",
            paddingLeft: "40px",
            paddingRight: "40px",
          }}
        >
          你好，請輸入以下的六位數驗證碼來驗證你的電子郵件，此六位數的有效期限為
          <span style={{ fontWeight: "bold" }}> 5 分鐘</span>。
        </Text>

        <Section style={{ textAlign: "center", margin: "20px 0" }}>
          <Text
            style={{ color: "#555", fontSize: "16px", margin: "0 0 16px 0" }}
          >
            你的六位數驗證碼為：
          </Text>
          <table
            align="center"
            role="presentation"
            border={0}
            cellSpacing={0}
            cellPadding={0}
            style={{ width: "100%", maxWidth: "500px" }}
          >
            <tr>
              <td
                align="center"
                style={{
                  padding: "16px",
                  backgroundColor: "#fff",
                  border: "1px solid #e2e8f0",
                  borderRadius: "8px",
                }}
              >
                <Text
                  style={{
                    color: "#ba3d4f",
                    fontSize: "40px",
                    textAlign: "center",
                    letterSpacing: "18px",
                    fontWeight: "bold",
                    fontFamily: "monospace",
                  }}
                >
                  {OTP}
                </Text>
              </td>
            </tr>
          </table>
        </Section>

        <Text
          style={{
            color: "#777",
            fontSize: "14px",
            textAlign: "center",
            margin: "24px 0",
          }}
        >
          若你並未請求驗證，可以忽略此封郵件。
        </Text>

        <Hr style={{ borderColor: "#dddddd", marginTop: "48px" }} />

        <Section>
          <table
            align="center"
            role="presentation"
            border={0}
            cellSpacing={0}
            cellPadding={0}
          >
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
                <Text
                  style={{
                    color: "#8898aa",
                    fontSize: "12px",
                    marginLeft: "8px",
                  }}
                >
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
