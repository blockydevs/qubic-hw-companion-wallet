// Both these packages are expected to be included by react-app-rewired
const webpack = require('webpack');
const TerserPlugin = require('terser-webpack-plugin');
const path = require('path');

module.exports = function override(config, env) {
    if (env === 'production') {
        config.optimization.minimizer = config.optimization.minimizer.map((plugin) => {
            if (plugin instanceof TerserPlugin) {
                return new TerserPlugin({
                    test: plugin.options.test,
                    terserOptions: {
                        keep_classnames: true,
                    },
                });
            }

            return plugin;
        });
    }

    const fallback = config.resolve.fallback || {};
    Object.assign(fallback, {
        crypto: false, // require.resolve("crypto-browserify") can be polyfilled here if needed
        stream: false, // require.resolve("stream-browserify") can be polyfilled here if needed
        assert: false, // require.resolve("assert") can be polyfilled here if needed
        http: false, // require.resolve("stream-http") can be polyfilled here if needed
        https: false, // require.resolve("https-browserify") can be polyfilled here if needed
        os: false, // require.resolve("os-browserify") can be polyfilled here if needed
        url: false, // require.resolve("url") can be polyfilled here if needed
        zlib: false, // require.resolve("browserify-zlib") can be polyfilled here if needed
    });
    config.resolve.fallback = fallback;

    config.resolve.alias = {
        ...config.resolve.alias,
        '@': path.resolve(__dirname, 'src'),
    };

    config.plugins = (config.plugins || []).concat([
        new webpack.ProvidePlugin({
            process: 'process/browser',
            Buffer: ['buffer', 'Buffer'],
        }),
    ]);
    config.ignoreWarnings = [/Failed to parse source map/];
    config.module.rules.push({
        test: /\.(js|mjs|jsx)$/,
        enforce: 'pre',
        loader: require.resolve('source-map-loader'),
        resolve: {
            fullySpecified: false,
        },
    });
    config.experiments = {
        asyncWebAssembly: true,
    };
    return config;
};
