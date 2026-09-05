import nextCoreWebVitals from 'eslint-config-next/core-web-vitals';

const eslintConfig = [
  ...nextCoreWebVitals,
  {
    ignores: ['daten/**', '**/.next/**', '**/node_modules/**', '.claude/worktrees/**'],
  },
];

export default eslintConfig;
