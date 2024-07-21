import path from "path";
import fs from "fs";

import matter from "gray-matter";

export const getListOfFiles = (subDir: string = "") => {
  const contentDir = path.join(process.cwd(), "content", subDir);
  const files = fs.readdirSync(contentDir);

  return files.filter((file) => file.endsWith(".mdx"));
};

export const getMdContent = (slug: string) => {
  const filePath = path.join(process.cwd(), "content", slug + ".md");
  const content = fs.readFileSync(filePath, "utf8");

  return matter(content);
};
