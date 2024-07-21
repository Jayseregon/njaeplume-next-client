import { SVGProps, ImgHTMLAttributes } from "react";

export type IconSvgProps = SVGProps<SVGSVGElement> & {
  size?: number;
};

export type IconIcoProps = ImgHTMLAttributes<HTMLImageElement> & {
  size?: number;
  nonce?: string;
};
