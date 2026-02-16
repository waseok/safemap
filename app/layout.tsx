import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "안전지도 웹앱",
  description: "학생들이 안전 문제를 발견하고 공유하는 플랫폼",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
