import type { ReactNode } from "react";
import Navbar from "../Navbar";
import Footer from "../Footer";

interface MainLayoutProps {
  children: ReactNode;
  fullWidth?: boolean;
}

export default function MainLayout({
  children,
  fullWidth = false,
}: MainLayoutProps) {
  if (fullWidth) {
    return (
      <div className="app-shell">
        <Navbar />
        <div className="absolute left-0 right-0 -mt-[88px] -mb-12 max-md:-mt-[80px] max-md:-mb-10">
          {children}
          <Footer />
        </div>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <Navbar />
      <main className="app-main">{children}</main>
      <Footer />
    </div>
  );
}
