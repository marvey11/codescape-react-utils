# @marvey11/codescape-react-utils

Small, reusable React hooks and utilities for Codescape applications. The package does not include UI components, themes, or design tokens; those belong in `@marvey11/codescape-ui`.

## Requirements

- React 19 or later (peer dependency)
- Node.js 20.19 or later to build and maintain this repository

## Install

The package is published to GitHub Packages. Configure npm to use that registry for the `@marvey11` scope, then install it:

```ini
@marvey11:registry=https://npm.pkg.github.com
```

```sh
npm install @marvey11/codescape-react-utils
```

## Hooks

### `useLocalStorage<T>(key, initialValue)`

Returns `[value, setValue, removeValue]`. Values are JSON encoded, updater functions are supported, and changes from other tabs are synchronised. Invalid or unavailable storage falls back to the in-memory value.

```tsx
const [settings, setSettings, resetSettings] = useLocalStorage("settings", {
  compact: false,
});
setSettings((current) => ({ ...current, compact: true }));
```

### `useDebouncedValue<T>(value, delay)`

Returns the latest value after it has stayed unchanged for `delay` milliseconds. Pending updates are cancelled when the value or delay changes.

### `useMediaQuery(query)`

Returns whether a CSS media query matches and subscribes to subsequent changes.

## Development

```sh
npm install
npm run typecheck
npm run lint
npm test
npm run test:coverage
npm run build
```

The build emits an ES module and TypeScript declarations in `dist/`. React is externalised and is not bundled. Coverage thresholds are set to 80% for lines, functions, branches, and statements.

## Release

Create and publish a GitHub Release to run the package publishing workflow. The workflow publishes to GitHub Packages with `GITHUB_TOKEN`.

GitHub's npm registry defaults newly published packages to private and does not provide a REST endpoint to change package visibility. After the first publish, open the package's settings on GitHub, choose **Change visibility** under **Danger Zone**, select **Public**, and confirm. GitHub does not allow a public package to be made private again.
