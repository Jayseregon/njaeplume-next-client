import * as React from "react";

import { EmailTemplateProps } from "@/src/interfaces/Contact";

const ContactFormEmailTemplate = ({
  firstName,
  lastName,
  subject,
  email,
  message,
}: EmailTemplateProps) => {
  const currentYear = new Date().getFullYear();

  return (
    <html>
      <head>
        <meta content="width=device-width, initial-scale=1.0" name="viewport" />
        <meta content="text/html; charset=UTF-8" httpEquiv="Content-Type" />
        <title>New Contact Form Submission</title>
        <style
          dangerouslySetInnerHTML={{
            __html: `
          body {
            background-color: rgb(248, 245, 238);
            font-family: sans-serif;
            font-size: 16px;
            line-height: 1.5;
            margin: 0;
            padding: 0;
            color: rgb(196, 146, 136);
          }
          
          .container {
            background-color: #ffffff;
            border-radius: 8px;
            max-width: 600px;
            margin: 40px auto;
            padding: 24px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
          }
          
          .header {
            margin-bottom: 24px;
          }
          
          .message-box {
            background-color: rgba(248, 245, 238, 0.5);
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 24px;
            border-left: 4px solid rgb(196, 146, 136);
          }
          
          h1 {
            color: rgb(196, 146, 136);
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 8px;
          }
          
          .subtitle {
            color: rgb(196, 146, 136);
            font-size: 16px;
            margin-top: 0;
            margin-bottom: 24px;
          }
          
          .label {
            color: rgb(196, 146, 136);
            font-size: 14px;
            font-weight: 500;
            margin: 0;
          }
          
          .value {
            color: #000000;
            font-size: 16px;
            margin: 4px 0 16px;
          }
          
          .message-text {
            white-space: pre-wrap;
          }
          
          .divider {
            border-top: 1px solid rgba(196, 146, 136, 0.2);
            margin: 16px 0;
          }
          
          .footer-text {
            color: rgb(196, 146, 136);
            font-size: 12px;
            margin: 4px 0;
          }
        `,
          }}
        />
      </head>
      <body>
        <div className="container">
          <div className="header">
            <h1>Hey there! 👋</h1>
            <p className="subtitle">
              Someone just reached out through the NJAE Plume contact form
            </p>
          </div>

          <div className="message-box">
            <p className="label">From:</p>
            <p className="value">
              {firstName} {lastName} ({email})
            </p>

            <p className="label">Subject:</p>
            <p className="value">{subject}</p>

            <p className="label">Message:</p>
            <p className="value message-text">{message}</p>
          </div>

          <div className="divider" />

          <div className="footer">
            <p className="footer-text">
              © {currentYear} NJAE Plume. All rights reserved.
            </p>
          </div>
        </div>
      </body>
    </html>
  );
};

export default ContactFormEmailTemplate;
