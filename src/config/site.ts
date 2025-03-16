export type SiteConfig = typeof siteConfig;

export const siteConfig = {
  name: "NJAE Plume",
  hero_descr: "Showcasing the Digital Craftsmanship",
  description:
    "Dive into the world of Jayseregon, where technology meets creativity. Explore projects that blend innovative coding with aesthetic design to solve real-world problems.",
  icon: "/favicon.webp",
  homeItems: [
    {
      key: "shop",
      label: "Visit Our Shop",
      href: "/shop",
    },
  ],
  navItems: [
    {
      key: "brushes",
      label: "Brushes",
      href: "/shop/brushes",
    },
    {
      key: "stickers",
      label: "Stickers",
      href: "/shop/stickers",
    },
    {
      key: "templates",
      label: "Templates",
      href: "/shop/templates",
    },
    {
      key: "planners",
      label: "Planners",
      href: "/shop/planners",
    },
    {
      key: "freebies",
      label: "Freebies",
      href: "/shop/freebies",
    },
    {
      key: "contact",
      label: "Contact",
      href: "/contact",
    },
    {
      key: "faq",
      label: "FAQ",
      href: "/faq",
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
    {
      key: "new-product",
      label: "New Product",
      href: "/castle/new-product",
      icon: "PackagePlus",
    },
  ],
};

export function getNavItemByKey(key: string) {
  return siteConfig.navItems.find((item) => item.key === key);
}

export function getCastleNavItemByKey(key: string) {
  return siteConfig.castleNavItems.find((item) => item.key === key);
}

export function getHomeItemByKey(key: string) {
  return siteConfig.homeItems.find((item) => item.key === key);
}
