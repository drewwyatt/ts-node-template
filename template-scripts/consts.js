const path = require('path')

module.exports = {
  POSTINSTALL_SCRIPT: 'yarn build',

  // paths
  PACKAGE_JSON_PATH: path.resolve('./package.json'),
  PRETTIER_CONFIG_PATH: path.resolve('./prettierrc.yaml'),
  README_PATH: path.resolve('./README.md'),
}
