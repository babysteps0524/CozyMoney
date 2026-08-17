import {
  defineConfig,
  presetAttributify,
  presetIcons,
  presetTypography,
  presetWebFonts,
  presetWind3,
  transformerDirectives,
  transformerVariantGroup,
} from "unocss";

export default defineConfig({
  content: {
    pipeline: {
      include: ["./**/*.html", "./**/*.js"],
    },
  },

  theme: {
    fontFamily: {
      body: ["Noto Sans KR", "sans-serif"],
    },
  },

  shortcuts: {
    bodyText: "text-16px font-body text-[var(--cm-text)]",
    navText: [
      "text-22px font-bold text-[var(--cm-primary)]",
      " hover:text-[var(--cm-primary-hover)]",
      "inline-block",
    ],
    asideNav: [
      "rounded-16px bg-[var(--cm-paper)] shadow-[var(--cm-shadow)]",
      "py-24px px-28px",
      "mb-24px",
    ],
    asideNavH2: ["mb-18px", "text-22px font-bold text-[var(--cm-primary)]"],
    asideList1: ["list-disc", "text-[var(--cm-primary)]", "ml-16px mr-20px"],
    asideList2: [
      "border-b-1px",
      "border-b-solid",
      "border-b-[var(--cm-border)]",
      "pb-10px",
      "mb-22px",
    ],
    cardAnchor: [
      "bg-[var(--cm-card)]",
      "shadow-md",
      "rounded-10px",
      "p-28px",
      "hover:bg-[var(--cm-card-hover)]",
    ],
    cardH3: ["text-20px", "text-[var(--cm-primary)]", "font-600", "mb-8px"],
    cardP: ["text-14px", "text-[var(--cm-text-secondary)]", "leading-7", "mb-14px"],
    pageBtn: [
      "w-36px",
      "h-36px",
      "flex",
      "items-center",
      "justify-center",
      "rounded-6px",
      "text-14px",
      "font-400",
      "text-[var(--cm-text-secondary)]",
      "bg-white",
      "border-solid",
      "border-[var(--cm-border)]",
      "cursor-pointer",
      "hover:bg-[var(--cm-card-hover)]",
    ],
    pageBtnActive: [
      "w-36px",
      "h-36px",
      "flex",
      "items-center",
      "justify-center",
      "rounded-6px",
      "text-14px",
      "font-700",
      "text-white",
      "bg-[var(--cm-primary)]",
      "border-1px",
      "border-solid",
      "border-[var(--cm-primary)]",
      "cursor-pointer",
    ],
    pageArrowBtn: [
      "w-36px",
      "h-36px",
      "flex",
      "items-center",
      "justify-center",
      "rounded-6px",
      "text-18px",
      "font-400",
      "text-[var(--cm-text-secondary)]",
      "bg-white",
      "border-1px",
      "border-solid",
      "border-[var(--cm-border)]",
      "cursor-pointer",
      "hover:bg-[var(--cm-card-hover)]",
    ],
  },

  safelist: ["pageBtn", "pageBtnActive", "pageArrowBtn"],

  presets: [
    presetWind3(),
    presetAttributify(),
    presetIcons({
      collections: {
        mdi: () =>
          import("@iconify-json/mdi/icons.json").then((i) => i.default),
      },
      extraProperties: {
        display: "inline-block",
        "vertical-align": "middle",
      },
    }),
    presetTypography(),
    presetWebFonts({
      provider: "google",
      fonts: {
        sans: "Noto Sans KR",
      },
    }),
  ],
  transformers: [transformerDirectives(), transformerVariantGroup()],
});
