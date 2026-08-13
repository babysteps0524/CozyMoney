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
    bodyText: "text-16px font-body text-#333333",
    navText: [
      "text-22px font-bold text-#7c5d48",
      " hover:text-#a67c52",
      "hover:scale-110",
      "inline-block",
    ],
    asideNav: [
      "rounded-16px bg-#ffffff shadow-[0px_0px_8px_rgba(0,0,0,0.16)]",
      "py-24px px-28px",
      "mb-24px",
    ],
    asideNavH2: ["mb-18px", "text-22px font-bold text-#7c5d48"],
    asideList1: ["list-disc", "text-#7c5d48", "ml-16px mr-20px"],
    asideList2: [
      "border-b-1px",
      "border-b-solid",
      "border-b-#7c5d48",
      "pb-10px",
      "mb-22px",
    ],
    cardAnchor: [
      "bg-#F7F0EBFF",
      "shadow-md",
      "rounded-10px",
      "p-28px",
      "hover:bg-#F5DFD3FF",
    ],
    cardH3: ["text-20px", "text-#523f2e", "font-600", "mb-8px"],
    cardP: ["text-14px", "text-#777", "leading-7", "mb-14px"],
    pageBtn: [
      "w-36px",
      "h-36px",
      "flex",
      "items-center",
      "justify-center",
      "rounded-6px",
      "text-14px",
      "font-400",
      "text-[#666]",
      "bg-white",
      "border-solid",
      "border-[#ddd]",
      "cursor-pointer",
      "hover:bg-[#f5eee8]",
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
      "bg-[#523f2e]",
      "border-1px",
      "border-solid",
      "border-[#523f2e]",
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
      "text-[#666]",
      "bg-white",
      "border-1px",
      "border-solid",
      "border-#ddd",
      "cursor-pointer",
      "hover:bg-[#f5eee8]",
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
