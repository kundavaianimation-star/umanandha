import { SiteLayout } from "@/components/SiteLayout";
import { PageTransition } from "@/components/PageTransition";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SiteLayout>
      <PageTransition>{children}</PageTransition>
    </SiteLayout>
  );
}
