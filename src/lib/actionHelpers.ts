export function sanitizeFileName(fileName: string): string {
  return fileName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function verifyRecaptcha(
  token: string,
  recaptchaKey: string,
): Promise<boolean> {
  const response = await fetch(
    `https://www.google.com/recaptcha/api/siteverify`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: `secret=${recaptchaKey}&response=${token}`,
    },
  );
  const data = await response.json();

  return data.success;
}
