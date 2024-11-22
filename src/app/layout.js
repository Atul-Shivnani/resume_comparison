import "./globals.css";


export const metadata = {
  title: "Resume comparison",
  description: "Web app to compare user submitted document with sample document",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
