import type { Metadata, Viewport } from "next";
import "@fontsource-variable/plus-jakarta-sans";
import "@fontsource/tiro-devanagari-hindi/400.css";
import { AppShell } from "@/components/app-shell/app-shell";
import { PageTransition } from "@/components/motion/page-transition";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Sangam: where talent, ideas and opportunities meet",
    template: "%s · Sangam",
  },
  description:
    "Sangam is a verified network for job seekers, founders, mentors and recruiters. Hires confirmed by candidates, ideas tested by the community. Proof, not promises.",
};

export const viewport: Viewport = {
  themeColor: "#07080f",
  colorScheme: "dark",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="dark h-full antialiased">
      <body className="min-h-full">
        <AppShell>
          <PageTransition>{children}</PageTransition>
        </AppShell>
      </body>
    </html>
  );
}
