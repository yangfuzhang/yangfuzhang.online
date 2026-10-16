import { addToast } from "@heroui/toast";

const menus = [
  {
    name: "电脑",
    href: "/computer",
    toast: false,
  },
  {
    name: "项目",
    href: "/#projects",
    toast: false,
  },
  {
    name: "联系",
    href: "#",
    toast: true,
  },
];

export function SiteMenuItems() {
  return (
    <nav className="flex flex-wrap justify-end gap-2">
      {menus.map((menu) => {
        return (
          <a
            key={menu.name}
            href={menu.href}
            className="border-[3px] border-ink bg-cream px-3 py-1.5 font-poster text-base leading-none brutal-shadow brutal-press"
            onClick={(event) => {
              if (!menu.toast) return;
              event.preventDefault();
              addToast({
                title: "还没有内容哦",
                description: "欢迎关注公众号【独立开发老杨】",
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
