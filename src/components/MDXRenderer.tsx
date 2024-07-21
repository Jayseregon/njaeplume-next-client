import * as runtime from "react/jsx-runtime";

import Callout from "./callout";
import Snippet from "./snippet";
import { LoadDynamicImage } from "./loadImages";
import Quote from "./quote";

const useMDXComponent = (code: string) => {
  const fn = new Function(code);

  return fn({ ...runtime }).default;
};

const sharedComponents = {
  Callout,
  Snippet,
  LoadDynamicImage,
  Quote,
};

interface MdxProps {
  code: string;
  components?: Record<string, React.ComponentType>;
  [key: string]: any;
}

export default function MDXContent({ code, components, ...props }: MdxProps) {
  const Component = useMDXComponent(code);

  return (
    <Component components={{ ...sharedComponents, ...components }} {...props} />
  );
}
