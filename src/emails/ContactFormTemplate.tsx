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
  firstName,
  lastName,
  subject,
  email,
  message,
}: ContactFormTemplateProps) => {
  const currentYear = new Date().getFullYear();

  return (
    <Html>
      <Head>
        <title>New Contact Form Submission</title>
      </Head>
      <Body style={styles.body}>
        <Container style={styles.container}>
          <Section style={styles.header}>
            <Heading style={styles.h1}>Hey there! 👋</Heading>
            <Text style={styles.subtitle}>
              Someone just reached out through the NJAE Plume contact form
            </Text>
          </Section>

          <Section style={styles.messageBox}>
            <Text style={styles.label}>From:</Text>
            <Text style={styles.value}>
              {firstName} {lastName} ({email})
            </Text>

            <Text style={styles.label}>Subject:</Text>
            <Text style={styles.value}>{subject}</Text>

            <Text style={styles.label}>Message:</Text>
            <Text style={{ ...styles.value, ...styles.messageText }}>
              {message}
            </Text>
          </Section>

          <Hr style={styles.divider} />

          <Section>
            <Text style={styles.footerText}>
              © {currentYear} NJAE Plume. All rights reserved.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

// Styles object to maintain the same appearance
const styles = {
  body: {
    backgroundColor: "rgb(248, 245, 238)",
    fontFamily: "sans-serif",
    fontSize: "16px",
    lineHeight: "1.5",
    margin: "0",
    padding: "0",
    color: "rgb(196, 146, 136)",
  },
  container: {
    backgroundColor: "#ffffff",
    borderRadius: "8px",
    maxWidth: "600px",
    margin: "40px auto",
    padding: "24px",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.05)",
  },
  header: {
    marginBottom: "24px",
  },
  messageBox: {
    backgroundColor: "rgba(248, 245, 238, 0.5)",
    borderRadius: "8px",
    padding: "20px",
    marginBottom: "24px",
    borderLeft: "4px solid rgb(196, 146, 136)",
  },
  h1: {
    color: "rgb(196, 146, 136)",
    fontSize: "24px",
    fontWeight: "bold",
    marginBottom: "8px",
  },
  subtitle: {
    color: "rgb(196, 146, 136)",
    fontSize: "16px",
    marginTop: "0",
    marginBottom: "24px",
  },
  label: {
    color: "rgb(196, 146, 136)",
    fontSize: "14px",
    fontWeight: "500",
    margin: "0",
  },
  value: {
    color: "#000000",
    fontSize: "16px",
    margin: "4px 0 16px",
  },
  messageText: {
    whiteSpace: "pre-wrap",
  },
  divider: {
    borderTop: "1px solid rgba(196, 146, 136, 0.2)",
    margin: "16px 0",
  },
  footerText: {
    color: "rgb(196, 146, 136)",
    fontSize: "12px",
    margin: "4px 0",
  },
};

export default ContactFormTemplate;
