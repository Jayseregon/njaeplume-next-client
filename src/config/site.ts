export type SiteConfig = typeof siteConfig;

export const siteConfig = {
  name: "NJAE Plume",
  hero_descr: "Showcasing the Digital Craftsmanship",
  description:
    "Dive into the world of Jayseregon, where technology meets creativity. Explore projects that blend innovative coding with aesthetic design to solve real-world problems.",
  icon: "/favicon.webp",
  navItems: [
    {
      key: "portfolio",
      label: "Portfolio",
      href: "/portfolio",
    },
    {
      key: "contact",
      label: "Contact",
      href: "/contact",
    },
  ],
  links: {},
};

export function getNavItemByKey(key: string) {
  return siteConfig.navItems.find((item) => item.key === key);
}
