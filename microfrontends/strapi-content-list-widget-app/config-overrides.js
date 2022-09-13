const appPackageJson = require('./package.json');
const webpack = require('webpack');
const path = require("path");

module.exports = {
    webpack: function override(config, env) {
        const filename = `${appPackageJson.name}-${appPackageJson.version}`;
        const entandoHRConfig = {
            path: path.resolve(__dirname, 'build'),
            filename: `static/js/${filename}.js`,
            libraryTarget: "umd",
            publicPath: "",
        }
        config.output = entandoHRConfig;
        config.optimization = {}
        return config;
    }
}
