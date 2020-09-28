> :warning: **This repository uses expo for illustration purposes, but it works equally well with “vanilla” React Native**

# Use Expo / React Native with Yarn 2 and Workspaces

## Goal

The goal of this project is to have the workspace `expo-client` depend on workspace `common`.

```sh
yarn install
yarn workspace expo-client start
```

## Steps

### Install yarn 2.3+

You need yarn version 2.3+, or if you are reading this while it has not been released yet, built from source (PR 1843).
This is required because we'll use a new feature, `hoistingLimits`, which resolves a lot of issues with React Native!

#### From sources

```
yarn set version from sources --branch 1843
```

#### Latest

```
yarn set version berry
```

### Use node-modules linker

Add this line to your `.yarnrc.yml`, [see explanation here](https://yarnpkg.com/advanced/migration/#if-required-enable-the-node-modules-plugin).

```
nodeLinker: node-modules
```

### Setting up hoistingLimits

In the workspace using React Native or Expo, add this to `package.json` file:

```jsonc
{
  //...
  "installConfig": {
    "hoistingLimits": "workspaces"
  }
}
```

This is a central piece: it prevents `react-native` and other packages to be hoisted to the root `node_modules` folder.
It replaces the outdated `nohoist` config from yarn 1.

### Customize `metro.config.js`

This latest step will help metro identify how to resolve workspace dependencies (those specified with [the workspace protocol](https://yarnpkg.com/features/workspaces/#workspace-ranges-workspace)).
To address the issue of workspaces being symlinked by yarn, [we use the Proxy trick](https://github.com/facebook/metro/issues/1#issuecomment-453450709):

``` js
const path = require('path');

const commonModulePath = path.resolve(__dirname, '../common');

module.exports = {
  projectRoot: __dirname,
  watchFolders: [commonModulePath],
  resolver: {
    extraNodeModules: new Proxy(
      {},
      {
        get: (target, name) => path.join(__dirname, `node_modules/${name}`)
      }
    )
  },
  transformer: {
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: true
      }
    })
  }
};
```

You'll need to replace `commonModulePath` with any workspace path you'd like to import.
If you are having a pattern where all workspaces are under the same folder, you can automate the process easily.
See [how it is implemented in this project](packages/expo-client/metro.config.js).
