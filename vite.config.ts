import oxfmt from '@imapps/oxc-config/oxfmt';
import oxlint from '@imapps/oxc-config/oxlint';
import { defineConfig } from 'vite-plus';

// Workspace-root Vite+ config: lint (Oxlint), format (Oxfmt) and staged-file checks for every package.
// The shared IM Apps presets come from @imapps/oxc-config; per-package Vite/Vitest config lives in packages/web.
const ignorePatterns = ['**/.github/workflows-utils/**', '**/build/**', '**/dist/**', '**/coverage/**'];

export default defineConfig({
    lint: {
        ...oxlint,
        ignorePatterns: [...(oxlint.ignorePatterns ?? []), ...ignorePatterns],
        jsPlugins: [...(oxlint.jsPlugins ?? []), { name: 'vite-plus', specifier: 'vite-plus/oxlint-plugin' }],
        rules: {
            ...oxlint.rules,
            'vite-plus/prefer-vite-plus-imports': 'error',
        },
        options: { typeAware: true, typeCheck: true },
    },
    fmt: {
        ...oxfmt,
        // Code and JSON only: docs, YAML and the generated CHANGELOG.md stay as written.
        ignorePatterns: [
            ...(oxfmt.ignorePatterns ?? []),
            ...ignorePatterns,
            '**/*.md',
            '**/*.{yml,yaml}',
            '**/*.html',
            'bun.lock',
        ],
    },
    staged: {
        '*.{ts,tsx,mts,cts,js,jsx,mjs,cjs,json}': 'vp check --fix --no-error-on-unmatched-pattern',
    },
});
