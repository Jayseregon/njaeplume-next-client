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
  Button,
  Row,
  Column,
} from "@react-email/components";

import { PaymentConfirmationProps } from "@/interfaces/StripeWebhook";

const formatDate = (date: Date | string): string => {
  const d = new Date(date);
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
};

const PaymentConfirmationEmail = ({
  displayId = "NJAE2025-OID0101-010100CO87",
  amount = 11.45,
  createdAt = "2025-01-01T00:00:00.862Z",
  items = [
    {
      product: {
        name: "Digital Product 1",
        category: "Category A",
        price: 6.0,
      },
    },
    {
      product: {
        name: "Digital Product 2",
        category: "Category B",
        price: 5.45,
      },
    },
  ],
  customerName = "John Doe",
  downloadLink = "https://njaeplume.com/account/orders",
}: PaymentConfirmationProps) => {
  const currentYear = new Date().getFullYear();
  const orderDate = formatDate(new Date(createdAt));
  const formattedAmount = `$${amount.toFixed(2)}`;

  return (
    <Html>
      <Head>
        <title>Payment Confirmation - NJAE Plume</title>
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
              Payment Successful! 🎉
            </Heading>
            <Text
              style={{
                color: "rgb(196, 146, 136)",
                fontSize: "16px",
                marginTop: "0",
                marginBottom: "24px",
              }}
            >
              Thank you for your purchase from NJAE Plume
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
              Hi {customerName},
            </Text>
            <Text
              style={{
                color: "#000000",
                fontSize: "16px",
                margin: "4px 0 16px",
              }}
            >
              We are delighted to confirm that your payment has been
              successfully processed. Your digital products are now ready for
              download.
            </Text>

            <Text
              style={{
                color: "rgb(196, 146, 136)",
                fontSize: "14px",
                fontWeight: "500",
                margin: "0",
              }}
            >
              Order Details:
            </Text>
            <Text
              style={{
                color: "#000000",
                fontSize: "16px",
                margin: "4px 0 16px",
              }}
            >
              <strong>Order Number:</strong> #{displayId}
              <br />
              <strong>Order Date:</strong> {orderDate}
            </Text>

            <Text
              style={{
                color: "rgb(196, 146, 136)",
                fontSize: "14px",
                fontWeight: "500",
                margin: "0",
              }}
            >
              My Purchase:
            </Text>
            <Section
              style={{
                margin: "4px 0 16px",
                borderTop: "1px solid rgba(196, 146, 136, 0.2)",
                paddingTop: "8px",
              }}
            >
              {items.map((item, index) => (
                <Section
                  key={index}
                  style={{
                    padding: "8px 0",
                    borderBottom: "1px dashed rgba(196, 146, 136, 0.2)",
                  }}
                >
                  <Row>
                    <Column>
                      <Text
                        style={{
                          color: "#000000",
                          fontSize: "14px",
                          fontWeight: "500",
                          margin: "0",
                        }}
                      >
                        {item.product.name}
                      </Text>
                      <Text
                        style={{
                          color: "#666666",
                          fontSize: "12px",
                          fontStyle: "italic",
                          margin: "2px 0 0 0",
                        }}
                      >
                        {item.product.category}
                      </Text>
                    </Column>
                    <Column style={{ width: "80px" }}>
                      <Text
                        style={{
                          color: "#000000",
                          fontSize: "14px",
                          fontWeight: "500",
                          margin: "0",
                          textAlign: "right" as const,
                        }}
                      >
                        ${item.product.price.toFixed(2)}
                      </Text>
                    </Column>
                  </Row>
                </Section>
              ))}
              <Section
                style={{
                  padding: "12px 0 0 0",
                  marginTop: "8px",
                  borderTop: "1px solid rgba(196, 146, 136, 0.2)",
                }}
              >
                <Row>
                  <Column>
                    <Text
                      style={{
                        color: "#000000",
                        fontSize: "14px",
                        fontWeight: "bold",
                        margin: "0",
                      }}
                    >
                      Total
                    </Text>
                  </Column>
                  <Column style={{ width: "80px" }}>
                    <Text
                      style={{
                        color: "#000000",
                        fontSize: "14px",
                        fontWeight: "bold",
                        margin: "0",
                        textAlign: "right" as const,
                      }}
                    >
                      {formattedAmount}
                    </Text>
                  </Column>
                </Row>
              </Section>
            </Section>

            <Text
              style={{
                color: "rgb(196, 146, 136)",
                fontSize: "14px",
                fontWeight: "500",
                margin: "0",
              }}
            >
              Next Steps:
            </Text>
            <Text
              style={{
                color: "#000000",
                fontSize: "16px",
                margin: "4px 0 16px",
              }}
            >
              Click the button below to access your purchase in your account
              dashboard. You can download your files from there at any time. We
              recommend keeping a backup of your files once downloaded.
            </Text>

            <Button
              href={downloadLink}
              style={{
                backgroundColor: "rgb(196, 146, 136)",
                borderRadius: "4px",
                color: "#ffffff",
                fontSize: "16px",
                fontWeight: "bold",
                textDecoration: "none",
                textAlign: "center" as const,
                display: "block",
                padding: "12px 20px",
                margin: "16px 0",
                boxSizing: "border-box" as const,
              }}
            >
              View My Purchases
            </Button>
          </Section>

          <Section style={{ margin: "24px 0" }}>
            <Text
              style={{
                color: "#000000",
                fontSize: "14px",
                margin: "8px 0",
              }}
            >
              If you have any questions or need assistance, please don&apos;t
              hesitate to contact our support team at support@njaeplume.com
            </Text>
            <Text
              style={{
                color: "rgb(196, 146, 136)",
                fontSize: "16px",
                margin: "8px 0",
              }}
            >
              Thank you for shopping with NJAE Plume!
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

export default PaymentConfirmationEmail;
