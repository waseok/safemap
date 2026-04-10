import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "안전 탐사 지도 | SAFE 프로젝트",
  description: "우리 동네 안전 위험을 발견하고 함께 기록하는 안전 탐사 플랫폼",
  icons: {
    icon: "/icon.svg",
  },
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
