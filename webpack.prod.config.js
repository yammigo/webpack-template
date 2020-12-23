const webpack = require("webpack");
const webpackMerge = require("webpack-merge");
const baseWebpackConfig = require("./webpack.base.config")
const utils = require("./utils")
const HtmlWebpackPlugin = require("html-webpack-plugin")
const uglify = require('uglifyjs-webpack-plugin');
const { CleanWebpackPlugin } = require("clean-webpack-plugin"); // 每次运行打包时清理过期文件
module.exports = webpackMerge.merge(baseWebpackConfig, {
    // 指定构建环境  
    mode: "production",
    devtool: false,
    // 插件
    plugins: [
        new CleanWebpackPlugin(),
        new HtmlWebpackPlugin({
            filename: utils.resolve('dist/index.html'), // html模板的生成路径
            template: 'index.html', //html模板
            inject: true, // true：默认值，script标签位于html文件的 body 底部
            hash: true, // 在打包的资源插入html会加上hash
            //  html 文件进行压缩
            minify: {
                removeComments: true, //去注释
                collapseWhitespace: true, //压缩空格
                removeAttributeQuotes: true //去除属性引用
            }
        }),
        new uglify({
            parallel: true,

            uglifyOptions: {
                // 删除注释
                output: {
                    comments: false
                },
                // 删除console debugger 删除警告
                compress: {
                    // warnings: false,
                    drop_console: true, //console
                    drop_debugger: false,
                    pure_funcs: ['console.log'] //移除console
                }
            }

        }),
        new webpack.BannerPlugin(
            ` author:fanjiantao \n date: ${new Date().toLocaleString()} \n email: 1418154909@qq.com`,
        )


    ],
})