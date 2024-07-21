// import { useTranslations } from "next-intl";
import type { Metadata } from "next";

import { unstable_setRequestLocale } from "next-intl/server";

// import { headers } from "next/headers";

import { title } from "@/src/components/typography";
import { posts } from "#site/content";
import MDXContent from "@/src/components/MDXRenderer";

interface Props {
  params: {
    slug: string;
  };
}

function getPageBySlug(slug: string) {
  return posts.find((post) => post.slug === slug);
}

export default function MdPage({
  params: { locale, slug },
}: {
  params: { locale: string; slug: string };
}) {
  unstable_setRequestLocale(locale);
  // const t = useTranslations("About");
  // const nonce = headers().get("x-nonce");
  const post = getPageBySlug(slug);

  if (!post) {
    return (
      <div>
        <h1 className={title()}>Future post for </h1>
        <div className="py-3" />
        <h2 className="font-light text-4xl italic">{slug}</h2>
      </div>
    );
  }

  return (
    <div>
      <h1 className={title()}>{post.title}</h1>
      <div className="py-3" />

      <div className="prose prose-lightTheme dark:prose-darkTheme text-justify max-w-screen-md mx-auto">
        <MDXContent code={post.body} />
      </div>
    </div>
  );
}

export function generateMetadata({ params }: Props): Metadata {
  const post = getPageBySlug(params.slug);

  if (post == null) return {};

  return { title: post.title };
}

export function generateStaticParams(): Props["params"][] {
  return posts.map((post) => ({ slug: post.slug }));
}
