import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://monetra.vercel.app"),
  title: {
    default: "Monetra | AI-Powered Credit Risk Analysis",
    template: "%s | Monetra",
  },
  applicationName: "Monetra",
  description:
    "Analyze credit default risk with AI-powered predictions, explainable machine learning, interactive analytics, and batch risk assessment.",
  keywords: [
    "Monetra",
    "Credit Risk Analysis",
    "AI",
    "Machine Learning",
    "Credit Default Prediction",
    "Explainable AI",
  ],
  openGraph: {
    title: "Monetra | AI-Powered Credit Risk Analysis",
    description:
      "Understand credit default risk through intelligent predictions and explainable AI.",
    siteName: "Monetra",
    type: "website",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
