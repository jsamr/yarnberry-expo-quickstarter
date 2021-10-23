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

You need yarn version 2.3+

```
yarn set version berry
```

### Use node-modules linker

Add this line to your `.yarnrc.yml`, [see explanation here](https://yarnpkg.com/advanced/migration/#if-required-enable-the-node-modules-plugin).

```
nodeLinker: node-modules
```

### Setting up hoistingLimits

In **the workspace using React Native or Expo**, add this to `package.json` file:

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
const path = require("path");
const fs = require("fs");
const { getDefaultConfig } = require("expo/metro-config");

const workspaces = fs.readdirSync(path.resolve(__dirname, "../"));
const currentWorkspace = path.basename(__dirname);

module.exports = (async () => {
  const expoMetroConfig = await getDefaultConfig(__dirname);
  return {
    ...expoMetroConfig,
    projectRoot: __dirname,
    watchFolders: workspaces
      .filter((f) => f !== currentWorkspace)
      .map((f) => path.join(__dirname, "../", f)),
    resolver: {
      extraNodeModules: new Proxy(
        {},
        {
          get: (target, name) => path.join(__dirname, `node_modules/${name}`),
        }
      ),
    },
    transformer: {
      getTransformOptions: async () => ({
        transform: {
          experimentalImportSupport: false,
          inlineRequires: true,
        },
      }),
    },
  };
})();
```

You will need to replace `commonModulePath` with any workspace path you'd like to import.
If your project follows a pattern where all workspaces are under the same folder, you can automate the process easily.
See [how it is implemented in this project](packages/expo-client/metro.config.js).

> **Remark**: Extending `expo/metro-config` is required since Expo SDK 41 but
> must not be used in a vanilla React Native projects or Expo SDK 40 and lower
> versions.
