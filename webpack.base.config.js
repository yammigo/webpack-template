const webpack = require("webpack");
const utils = require("./utils");
const path = require("path");
const MinCssExtractPlugin = require("mini-css-extract-plugin"); // 将css代码提取为独立文件的插件
const OptimizeCssAssetsWebpackPlugin = require("optimize-css-assets-webpack-plugin"); // css模块资源优化插件
const CopyWebpackPlugin = require("copy-webpack-plugin");
const WebpackBar = require("webpackbar");


// webpack4中对于css模块的处理需要用到的插件及功能：
//extract-text-webpack-plugin 合并css
// style-loader：将处理结束的css代码存储在js中，运行时嵌入<style>后挂载到html页面上
// css-loader：加载器，使webpack可以识别css文件
// postcss-loader：加载器，承载autoprefixer功能。是对css的扩展，编译后转换成正常的css且会自动加上前缀，配合 autoprefixer 使用。
// sass-loader：加载器，使webpack可以识别sass/scss文件，默认使用node-sass进行编译，
// mini-css-extract-plugin：插件，webpack4启用的插件，可以将处理后的css代码提取为单独的css文件
// optimize-css-assets-webpack-plugin：插件，实现css代码压缩
// autoprefixer@8.0.0：自动化添加跨浏览器兼容前缀


// 配置入口对象与html-webpack-plugin实例集合，约定对应html的js与html同名以便自动化生成入口对象
// const entries = {};     // 保存文件入口
// const pages = [];       // 存放html-webpack-plugin实例
// (function () {
//     let pagePath = path.join( __dirname, "src/views" );     // 定义存放html页面的文件夹路径，此处值为 F:\modules\webapck4\w4-2\src\views
//     let paths = fs.readdirSync(pagePath);                   // 获取pagePath路径下的所有文件，此处值为 [ 'about.html', 'index.html', 'list.html', 'main.html' ]
//     paths.forEach( page=>{
//         page = page.split( "." )[0];        // 获取文件名（不带后缀），例： [ 'about', 'html' ]，当前page值就为字符串about
//         pages.push( new HtmlWebpackPlugin( {
//             filename: `views/${page}.html`,     // 生成的html文件的路径（基于出口配置里的path）
//             template: path.resolve( __dirname, `src/views/${page}.html` ),      // 参考的html模板文件
//             chunks: [ page, "common", "vendors", "manifest" ],       // 配置生成的html引入的公共代码块 引入顺序从右至左
//             // favicon: path.resolve(__dirname, 'src/img/favicon.ico'),            // 配置每个html页面的favicon
//         } ) );
//         entries[page] = path.resolve( __dirname, `src/js/${page}.js` );     // 入口js文件对象
//     } )
// })();



module.exports = {
    stats: "minimal",
    // 入口
    entry: {
        app: "./src/index"
    },
    // 出口
    output: {
        filename: "js/[name].[hash:7].js",
        path: utils.resolve('dist'),
        publicPath: "",
        library: "TagView",
        libraryTarget: 'umd',
        libraryExport: "TagView"

        // publicPath: "./" // 打包后的资源的访问路径前缀
    },
    // devtool: "inline-source-map",

    // 模块
    module: {
        rules: [{
                test: /\.(js|jsx)$/, //一个匹配loaders所处理的文件的拓展名的正则表达式，这里用来匹配js和jsx文件（必须）
                exclude: /node_modules/, //屏蔽不需要处理的文件（文件夹）（可选）
                loader: 'babel-loader', //loader的名称（必须）
            },

            {
                test: /\.(less|css)$/,
                // include: [path.resolve(__dirname, 'src')],   // 限制打包范围，提高打包速度
                exclude: /node_modules/, // 排除node_modules文件夹
                use: [

                    // {
                    //     loader: 'style-loader', // 创建 <style></style>
                    // },
                    {
                        loader: MinCssExtractPlugin.loader, // 将处理后的CSS代码提取为独立的CSS文件，可以只在生产环境中配置，
                        // options: {
                        //     publicPath: '../',
                        // },
                    },

                    {
                        loader: 'css-loader', // 转换css
                    },

                    {
                        loader: 'less-loader', // 编译 Less -> CSS
                        options: { // loader 的额外参数，配置视具体 loader 而定
                            sourceMap: true, // 要安装resolve-url-loader，当此配置项启用 sourceMap 才能正确加载 Sass 里的相对路径资源，类似background: url(../image/test.png)
                        }
                    },
                    {
                        loader: "postcss-loader" //承载autoprefixer功能，为css添加前缀
                    },



                ]
            },
            // {
            //     test: /\.less$/,
            //     // include: [path.resolve(__dirname, 'src')],   // 限制打包范围，提高打包速度
            //     exclude: /node_modules/, // 排除node_modules文件夹
            //     use: [
            //         // {
            //         //     loader: 'style-loader',
            //         // },

            //         {
            //             loader: MinCssExtractPlugin.loader // 将处理后的CSS代码提取为独立的CSS文件，可以只在生产环境中配置，
            //         },

            //         {
            //             loader: 'css-loader',
            //         },
            //         {
            //             loader: "postcss-loader" //承载autoprefixer功能，为css添加前缀
            //         },
            //         {
            //             loader: 'less-loader', // 编译 Less -> CSS
            //             options: { // loader 的额外参数，配置视具体 loader 而定
            //                 sourceMap: true, // 要安装resolve-url-loader，当此配置项启用 sourceMap 才能正确加载 Sass 里的相对路径资源，类似background: url(../image/test.png)
            //             }
            //         },



            //     ],
            // },
            {
                test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
                loader: 'url-loader',
                options: {
                    limit: 10000, // url-loader 包含file-loader，这里不用file-loader, 小于10000B的图片base64的方式引入，大于10000B的图片以路径的方式导入
                    name: 'static/img/[name].[hash:7].[ext]'
                }
            },
            {
                test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
                loader: 'url-loader',
                options: {
                    limit: 10000, // 小于10000B的图片base64的方式引入，大于10000B的图片以路径的方式导入
                    name: 'static/fonts/[name].[hash:7].[ext]'
                }
            }

        ]

    },
    plugins: [
        // new webpack.ProgressPlugin(),
        //不需要编译的文件直接拷贝进去
        new WebpackBar({
            name: `webpack`, //配置加载进度
        }),
        new CopyWebpackPlugin({
            patterns: [{
                    from: utils.resolve('static'), // 从哪个目录copy
                    to: utils.resolve('dist/static')
                }

            ]
        }),
        new MinCssExtractPlugin({
            //为抽取出的独立的CSS文件设置配置参数
            filename: "css/[name].[hash:7].css",
            // chunkFilename: '[id].[hash:7].css',
        })

    ],
    optimization: {
        // 找到chunk中共享的模块,取出来生成单独的chunk
        // splitChunks: {
        //     chunks: "all", // async表示抽取异步模块，all表示对所有模块生效，initial表示对同步模块生效
        //     cacheGroups: {
        //         vendors: { // 抽离第三方插件
        //             test: /[\\/]node_modules[\\/]/, // 指定是node_modules下的第三方包
        //             name: "vendors",
        //             priority: -10 // 抽取优先级
        //         },
        //         commons: { // 抽离自定义工具库
        //             name: "common",
        //             priority: -20, // 将引用模块分离成新代码文件的最小体积
        //             minChunks: 8, // 表示将引用模块如不同文件引用了多少次，才能分离生成新chunk
        //             minSize: 0
        //         }
        //     }
        // },
        // 为 webpack 运行时代码创建单独的chunk
        // runtimeChunk: {
        //     name: "manifest"
        // },
        //对生成的CSS文件进行代码压缩 mode='production'时生效
        minimizer: [
            new OptimizeCssAssetsWebpackPlugin()
        ]
    },
    resolve: {
        extensions: ['.js', '.json'], // 解析扩展。（当我们通过路导入文件，找不到改文件时，会尝试加入这些后缀继续寻找文件）
        alias: {
            '@': path.join(__dirname, "src") // 在项目中使用@符号代替src路径，导入文件路径更方便
        }
    },
    // 配置webpack执行相关
    // performance: {
    //     maxEntrypointSize: 1000000, // 最大入口文件大小1M
    //     maxAssetSize: 1000000 // 最大资源文件大小1M
    // }
}