import "./globals.css";

export const metadata = {
  title: "EduNexa",
  description: "A shared place for students, teachers, and families to stay connected to learning.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
