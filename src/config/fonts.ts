import {
  Fira_Code as FontMono,
  Italiana,
  Lora,
  Open_Sans,
  Caudex,
} from "next/font/google";

export const fontSans = Caudex({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["400", "700"],
  style: ["normal", "italic"],
});

export const fontMono = FontMono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["400", "700"],
});

export const fontSerif = Lora({
  subsets: ["latin"],
  variable: "--font-serif",
  weight: ["400", "700"],
  style: ["normal", "italic"],
});

export const fontDisplay = Italiana({
  subsets: ["latin"],
  variable: "--font-display",
  weight: "400",
});

export const fontSansAlt = Open_Sans({
  subsets: ["latin"],
  variable: "--font-sans-alt",
  weight: ["300", "400", "600", "700"],
  style: ["normal", "italic"],
});
