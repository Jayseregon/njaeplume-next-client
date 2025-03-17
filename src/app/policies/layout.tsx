export default function PoliciesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col items-center justify-center gap-4 py-6 md:py-10">
      <div className="inline-block w-5/6 md:w-1/2 text-center justify-center">
        {children}
      </div>
    </section>
  );
}
