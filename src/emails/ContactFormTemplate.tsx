import * as React from "react";
import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Hr,
  Heading,
} from "@react-email/components";

import { ContactFormTemplateProps } from "@/src/interfaces/Contact";

const ContactFormTemplate = ({
  firstName = "John",
  lastName = "Doe",
  subject = "Hello!",
  email = "john.doe@email.com",
  message = "Hello, this is a test message.",
}: ContactFormTemplateProps) => {
  const currentYear = new Date().getFullYear();

  return (
    <Html>
      <Head>
        <title>New Contact Form Submission</title>
      </Head>
      <Body
        style={{
          backgroundColor: "rgb(248, 245, 238)",
          fontFamily: "sans-serif",
          fontSize: "16px",
          lineHeight: "1.5",
          margin: "0",
          padding: "0",
          color: "rgb(196, 146, 136)",
        }}
      >
        <Container
          style={{
            backgroundColor: "#ffffff",
            borderRadius: "8px",
            maxWidth: "600px",
            margin: "40px auto",
            padding: "24px",
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.05)",
          }}
        >
          <Section style={{ marginBottom: "24px" }}>
            <Heading
              style={{
                color: "rgb(196, 146, 136)",
                fontSize: "24px",
                fontWeight: "bold",
                marginBottom: "8px",
              }}
            >
              Hey there! 👋
            </Heading>
            <Text
              style={{
                color: "rgb(196, 146, 136)",
                fontSize: "16px",
                marginTop: "0",
                marginBottom: "24px",
              }}
            >
              Someone just reached out through the NJAE Plume contact form
            </Text>
          </Section>

          <Section
            style={{
              backgroundColor: "rgba(248, 245, 238, 0.5)",
              borderRadius: "8px",
              padding: "20px",
              marginBottom: "24px",
              borderLeft: "4px solid rgb(196, 146, 136)",
            }}
          >
            <Text
              style={{
                color: "rgb(196, 146, 136)",
                fontSize: "14px",
                fontWeight: "500",
                margin: "0",
              }}
            >
              From:
            </Text>
            <Text
              style={{
                color: "#000000",
                fontSize: "16px",
                margin: "4px 0 16px",
              }}
            >
              {firstName} {lastName} ({email})
            </Text>

            <Text
              style={{
                color: "rgb(196, 146, 136)",
                fontSize: "14px",
                fontWeight: "500",
                margin: "0",
              }}
            >
              Subject:
            </Text>
            <Text
              style={{
                color: "#000000",
                fontSize: "16px",
                margin: "4px 0 16px",
              }}
            >
              {subject}
            </Text>

            <Text
              style={{
                color: "rgb(196, 146, 136)",
                fontSize: "14px",
                fontWeight: "500",
                margin: "0",
              }}
            >
              Message:
            </Text>
            <Text
              style={{
                color: "#000000",
                fontSize: "16px",
                margin: "4px 0 16px",
                whiteSpace: "pre-wrap",
              }}
            >
              {message}
            </Text>
          </Section>

          <Hr
            style={{
              borderTop: "1px solid rgba(196, 146, 136, 0.2)",
              margin: "16px 0",
            }}
          />

          <Section>
            <Text
              style={{
                color: "rgb(196, 146, 136)",
                fontSize: "12px",
                margin: "4px 0",
              }}
            >
              © {currentYear} NJAE Plume. All rights reserved.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export default ContactFormTemplate;
