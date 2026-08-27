import "./globals.css"
import {AuthProvider} from "@/context/authContext"

export const metadata = {
  title: "Chat App",
  description: "Real-time chat application"
}

export default function RootLayout({children}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}