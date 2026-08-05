import pluginVue from 'eslint-plugin-vue';
import vueTsEslintConfig from '@vue/eslint-config-typescript';
import skipFormatting from '@vue/eslint-config-prettier/skip-formatting';

export default [
  { ignores: ['dist/**', 'node_modules/**'] },
  ...pluginVue.configs['flat/recommended'],
  ...vueTsEslintConfig(),
  skipFormatting,
  {
    rules: {
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      'vue/require-default-prop': 'off',
    },
  },
  {
    files: ['src/components/ui/**/*.vue'],
    rules: {
      'vue/multi-word-component-names': 'off',
    },
  },
];
