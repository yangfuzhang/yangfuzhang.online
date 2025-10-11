import { addToast } from "@heroui/react";

const menus = [
  {
    name: "博客",
    href: "#",
  },
  {
    name: "项目",
    href: "#",
  },
  {
    name: "联系",
    href: "#",
  },
];

export function SiteMenuItems() {
  return (
    <nav className="flex items-center gap-0">
      {menus.map((menu) => {
        return (
          <a
            key={menu.name}
            href={menu.href}
            className="px-4 py-1 rounded-full cursor-pointer transition-all hover:bg-primary hover:text-primary-foreground hover:shadow"
            onClick={() => {
              addToast({
                title: "还没有内容哦",
                description: "改天再来吧",
                color: "primary",
              });
            }}
          >
            {menu.name}
          </a>
        );
      })}
    </nav>
  );
}
