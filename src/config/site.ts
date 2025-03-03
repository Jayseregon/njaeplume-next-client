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
  // Add castle routes for admin area
  castleNavItems: [
    {
      key: "castle",
      label: "Castle",
      href: "/castle",
      icon: "Cat",
    },
    {
      key: "customers",
      label: "Customers",
      href: "/castle/customers",
      icon: "Users",
    },
    {
      key: "products",
      label: "Products",
      href: "/castle/products",
      icon: "Package",
    },
  ],
};

export function getNavItemByKey(key: string) {
  return siteConfig.navItems.find((item) => item.key === key);
}

export function getCastleNavItemByKey(key: string) {
  return siteConfig.castleNavItems.find((item) => item.key === key);
}
