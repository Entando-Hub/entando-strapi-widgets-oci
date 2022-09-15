const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
    // app.use(
    //     '/entando-template-api/api',
    //     createProxyMiddleware({
    //         target: 'http://localhost:8081',
    //         pathRewrite: {
    //             '^/entando-template-api/api': '/api', // remove base path
    //         },
    //         changeOrigin: true,
    //     })
    // );
    // app.use(
    //     '/strapi',
    //     createProxyMiddleware({
    //         target: 'http://localhost:1337',
    //         pathRewrite: {
    //             '^/strapi': '', // remove base path
    //         },
    //         changeOrigin: true,
    //     })
    // );
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