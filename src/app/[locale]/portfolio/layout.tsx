import { unstable_setRequestLocale } from "next-intl/server";

export default async function AboutLayout(props: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const params = await props.params;

  const { locale } = params;

  const { children } = props;

  unstable_setRequestLocale(locale);

  return (
    <section className="flex flex-col items-center justify-center gap-4 py-8 md:py-10">
      <div className="inline-block max-w-full text-center justify-center">
        {children}
      </div>
    </section>
  );
}
