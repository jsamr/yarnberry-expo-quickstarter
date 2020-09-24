The goal of this project is to have the workspace `expo-client` depend on workspace `common`.

```sh
yarn install
yarn workspace expo-client start
```

Metro bundler will complain that it is unable to resolve "common" from
"App.js". To avoid the failure, one can replace dependency `"common":
"workspace:*"` in `expo-client/package.json` with `"file:../common"`.