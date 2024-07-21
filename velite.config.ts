import { defineConfig, defineCollection, s } from "velite";

const posts = defineCollection({
  name: "posts",
  pattern: "posts/**/*.mdx",
  schema: s
    .object({
      title: s.string().max(99),
      slug: s.slug("global", ["admin", "login"]),
      body: s.mdx(),
    })
    .transform((data) => ({ ...data, permalink: `/${data.slug}` })),
});

export default defineConfig({
  root: "content",
  output: {
    data: ".velite",
    assets: "public/static",
    base: "/static/",
    name: "[name]-[hash:6].[ext]",
    clean: true,
  },
  collections: { posts },
  mdx: {
    remarkPlugins: [],
    rehypePlugins: [],
  },
});
