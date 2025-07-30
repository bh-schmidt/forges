import { configureDayJs } from "@/common/functions/configureDayJs";
import "@/scss/global.scss";
import type { Metadata } from "next";

configureDayJs()

export const metadata: Metadata = {
  title: "{{ projectName }}",
  description: "{{ projectName }}",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
