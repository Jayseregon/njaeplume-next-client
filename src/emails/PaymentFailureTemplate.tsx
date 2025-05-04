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

import { FailedPaymentProps } from "@/interfaces/StripeWebhook";

const PaymentFailureEmail = ({
  customerName = "John Doe",
  messages,
}: FailedPaymentProps) => {
  const currentYear = new Date().getFullYear();

  return (
    <Html>
      <Head>
        <title>{messages.headTitle}</title>
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
              {messages.heading}
            </Heading>
            <Text
              style={{
                color: "rgb(196, 146, 136)",
                fontSize: "16px",
                marginTop: "0",
                marginBottom: "24px",
              }}
            >
              {messages.subHeading}
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
              {messages.greeting} {customerName},
            </Text>
            <Text
              style={{
                color: "#000000",
                fontSize: "16px",
                margin: "4px 0 16px",
              }}
            >
              {messages.failureText}
            </Text>

            <Text
              style={{
                color: "rgb(196, 146, 136)",
                fontSize: "14px",
                fontWeight: "500",
                margin: "0",
              }}
            >
              {messages.nextStepsTitle}
            </Text>
            <Text
              style={{
                color: "#000000",
                fontSize: "16px",
                margin: "4px 0 16px",
              }}
            >
              {messages.nextStepsText}
            </Text>
          </Section>

          <Section style={{ margin: "24px 0" }}>
            <Text
              style={{
                color: "#000000",
                fontSize: "14px",
                margin: "8px 0",
              }}
            >
              {messages.supportText}
            </Text>
            <Text
              style={{
                color: "rgb(196, 146, 136)",
                fontSize: "16px",
                margin: "8px 0",
              }}
            >
              {messages.closingText}
            </Text>
          </Section>

          <Hr
            style={{
              borderTop: "1px solid rgba(216, 90, 90, 0.2)",
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

export default PaymentFailureEmail;
