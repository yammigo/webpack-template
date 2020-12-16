const webpack = require("webpack");
const webpackMerge = require("webpack-merge");
const baseWebpackConfig = require("./webpack.base.config")
const utils = require("./utils")
const HtmlWebpackPlugin = require("html-webpack-plugin")
const MinCssExtractPlugin = require("mini-css-extract-plugin"); // 将css代码提取为独立文件的插件
const { CleanWebpackPlugin } = require("clean-webpack-plugin"); // 每次运行打包时清理过期文件
module.exports = webpackMerge.merge(baseWebpackConfig, {
    // 指定构建环境  
    mode: "production",
    // 插件
    plugins: [
        new CleanWebpackPlugin(),
        new HtmlWebpackPlugin({
            filename: utils.resolve('./../dist/index.html'), // html模板的生成路径
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
        new MinCssExtractPlugin({
            //为抽取出的独立的CSS文件设置配置参数
            filename: "css/[name].[hash:7].css",
            // chunkFilename: '[id].[hash:7].css',
        })

    ],
})