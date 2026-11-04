import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = [
  ...nextVitals,
  ...nextTs,
  {
    ignores: [
      ".next/**",
      "node_modules/**",
      "assets/**",
      "next-env.d.ts",
      "next.config.ts",
      // Vendored MIT Tiptap UI Components template; fixes belong upstream.
      "src/components/tiptap-*/**",
      "src/components/tiptap-templates/**",
      "src/hooks/**",
      "src/lib/tiptap-utils.ts",
    ],
  },
];

export default eslintConfig;
