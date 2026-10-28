import { SiteHeader } from "@/components/public/site-header";
import { SiteFooter } from "@/components/public/site-footer";
import { MotionRoot } from "@/components/site/motion-root";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="site flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
      <MotionRoot />
    </div>
  );
}
