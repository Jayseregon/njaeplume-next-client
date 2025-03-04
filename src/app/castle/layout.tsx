import {
  AdminSidebar,
  AdminSidebarProvider,
} from "@/src/components/castle/AdminSidebar";

export default function CastleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section className="py-8 md:py-10">
      {/* Container that starts below navbar */}
      <div className="container mx-auto max-w-full px-6">
        {/* Admin panel with sidebar and content area */}
        <AdminSidebarProvider>
          <div className="border rounded-lg bg-background h-[calc(100vh-12rem)] flex overflow-hidden">
            {/* Sidebar */}
            <AdminSidebar />

            {/* Content area */}
            <div className="flex-1 p-6 overflow-auto">{children}</div>
          </div>
        </AdminSidebarProvider>
      </div>
    </section>
  );
}
