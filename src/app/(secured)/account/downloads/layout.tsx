export default function DownloadLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col items-center justify-center gap-4 py-6 md:py-10">
      <div className="w-full">{children}</div>
    </section>
  );
}
