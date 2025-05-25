import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": "off",
      "react-hooks/exhaustive-deps": "off",
      // Next.js의 no-unused-vars도 비활성화 (선택 사항, 필요시)
      "next/no-unused-vars": "off",
      "@typescript-eslint/ban-ts-comment": "off", // @ts-ignore 사용 허용
    },
  },
];

export default eslintConfig;
