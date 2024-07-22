import * as React from "react";

interface EmailTemplateProps {
  firstName: string;
  lastName: string;
  subject: string;
  email: string;
  message: string;
}

export const EmailTemplate: React.FC<Readonly<EmailTemplateProps>> = ({
  firstName,
  lastName,
  subject,
  email,
  message,
}) => (
  <div>
    <h1>NJAE Plume Contact Form</h1>
    <p>
      <h2>You have received a message from:</h2>
      {firstName} {lastName}
      <br />({email})
      <br />
      <h3>Subject:</h3>
      {subject}
      <h3>Message:</h3>
      {message}
    </p>
  </div>
);
