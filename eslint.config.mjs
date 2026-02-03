import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      // 临时允许 any，后续再修复
      '@typescript-eslint/no-explicit-any': 'warn',
      // 允许 require 用于动态导入 cube-solver
      '@typescript-eslint/no-require-imports': 'off',
      // 关闭 react/no-unescaped-entities（中文引号问题）
      'react/no-unescaped-entities': 'off',
      // 允许组件在 render 内定义（仅用于 cube-net）
      'react/no-component-properties-in-render': 'off',
      // 允许空接口类型（用于 UI 组件 props 扩展）
      '@typescript-eslint/no-empty-object-type': 'off',
      // 允许在 render 中创建静态组件（cube-net 组件模式）
      'react-hooks/static-components': 'off',
    }
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
