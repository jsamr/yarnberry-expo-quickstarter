const path = require("path");
const fs = require("fs");

const workspaces = fs.readdirSync(path.resolve(__dirname, "../"));
const currentWorkspace = path.basename(__dirname);

module.exports = {
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
