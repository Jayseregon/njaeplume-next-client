// import fs from 'fs';
// import path from 'path';
// import matter from 'gray-matter';
// import { serialize } from 'next-mdx-remote/serialize';

// import { MDXRemoteSerializeResult } from 'next-mdx-remote';

// interface MdxContent {
//   content: MDXRemoteSerializeResult<Record<string, unknown>, Record<string, unknown>>;
//   data: Record<string, any>;
// }

// export const getMdxContent = async (fileName: string): Promise<MdxContent> => {
//   const filePath = path.join(process.cwd(), 'content', `${fileName}.mdx`);
//   const fileContent = fs.readFileSync(filePath, 'utf8');
//   const { content, data } = matter(fileContent);
//   const mdxSource = await serialize(content, { scope: data });
//   return { content: mdxSource, data };
// };
