const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
    app.use(
        `${process.env.REACT_APP_PUBLIC_API_URL}`,
        createProxyMiddleware({
            target: `${process.env.REACT_APP_PUBLIC_API_TARGET_URL}`,
            pathRewrite: {
                [`^${process.env.REACT_APP_PUBLIC_API_URL}`]: '/api'// remove base path
            },
            changeOrigin: true,
        })
    );
    app.use(
        `${process.env.REACT_APP_STRAPI_API_URL}`,
        createProxyMiddleware({
            target: `${process.env.REACT_APP_STRAPI_TARGET_URL}`,
            pathRewrite: {
                [`^${process.env.REACT_APP_STRAPI_API_URL}`]: ''// remove base path
            },
            changeOrigin: true,
        })
    );
};

// http://localhost:1337/content-manager/content-types