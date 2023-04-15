import * as path from 'path';
import webpack from 'webpack';
import webpackDevServer from 'webpack-dev-server';
import TerserPlugin from 'terser-webpack-plugin';
import { CleanWebpackPlugin } from 'clean-webpack-plugin';
import CopyWebpackPlugin from 'copy-webpack-plugin';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import Webpackbar from 'webpackbar';

import { EnvironmentType } from '../src/environment/type';

/**使用到的module及其配置*/
import moduleConfig from './webpack.module';

/**打包输出文件夹名*/
const PRODUCT_DIR = 'build';
/**打包输出页面文件夹名*/
const PAGES_DIR = 'pages'
/**静态资源文件夹名*/
const STATIC_DIR = 'static';

/**根路径**/
const ROOT_PATH = path.resolve(__dirname, '..');

/**webpack配置对象类型（附带devServer)*/
interface WebpackConfigWithDevServer extends webpack.Configuration {
    devServer?: webpackDevServer.Configuration
}

const generateWebpackConfig = (environment: EnvironmentType, mode: webpack.Configuration['mode']): WebpackConfigWithDevServer => {
    const config: WebpackConfigWithDevServer = {
        mode,
        stats: {
            errorDetails: true
        },
        name: 'main',
        entry: [path.resolve(ROOT_PATH, 'index.tsx')],
        output: {
            filename: `${PAGES_DIR}/[name].js?[fullhash]`,
            path: path.resolve(ROOT_PATH, PRODUCT_DIR),
            publicPath: ''
        },
        module: moduleConfig,
        optimization: {
            chunkIds: 'size',
            moduleIds: 'size',
            minimize: true,
            minimizer: [
                new TerserPlugin({
                    parallel: true,
                    extractComments: {
                        condition: /^\**!|@preserve|@license|@cc_on/i,
                        //filename, basename, query, hash
                        filename: ({ query }) => `LICENSE.txt${query}`
                    },
                }),
            ],
            removeAvailableModules: true,
            usedExports: true,
            sideEffects: true,
            splitChunks: {
                chunks: 'async',
                minSize: 20000,
                maxSize: 200000,
                minChunks: 1,
                maxAsyncRequests: 10,
                maxInitialRequests: 10,
                name: false,
                cacheGroups: {
                    vendor: {
                        name: false,
                        chunks: 'initial',
                        priority: -10,
                        reuseExistingChunk: false,
                        test: /node_modules\/(.*)\.js/
                    }
                }
            }
        },
        performance: {
            hints: 'error',
            maxEntrypointSize: 1.5 * 1024 * 1024,
            maxAssetSize: 1 * 1024 * 1024
        },
        plugins: [
            new webpack.ProgressPlugin(),
            new webpack.DefinePlugin({
                ENVIRONMENT: JSON.stringify(environment)
            }),
            new CleanWebpackPlugin(
                {
                    verbose: false, //是否在控制台输出信息
                    dry: false //是否模拟删除
                }
            ),
            //复制静态文件到指定目录
            new CopyWebpackPlugin({
                patterns: [
                    {
                        from: path.resolve(ROOT_PATH, `${STATIC_DIR}/assets`),
                        to: path.resolve(ROOT_PATH, `${PRODUCT_DIR}/assets`)
                    },
                    {
                        from: path.resolve(ROOT_PATH, `${STATIC_DIR}/manifest.json`),
                        to: path.resolve(ROOT_PATH, `${PRODUCT_DIR}/manifest.json`),
                    },
                ]
            }),
            new HtmlWebpackPlugin({
                template: path.resolve(ROOT_PATH, `${STATIC_DIR}/index.html`),
                favicon: path.resolve(ROOT_PATH, `${STATIC_DIR}/logo.ico`),
                inject: 'body',
                commonJsUrl: [],
            }),
            new Webpackbar({
                color: '#1677ff',
                basic: false,   //启用一个简单的日志报告器
                profile: false,  // 启用探查器。
            })
        ],
        resolve: {
            extensions: ['.js', '.jsx', '.ts', '.tsx'],
            // modules: [path.resolve(ROOT_PATH, 'node_modules')], //按理说写了也是没错的，但加上之后很多依赖的关联依赖就找不到了
            alias: {
                '@': path.resolve(ROOT_PATH, 'src'),
                pages: path.resolve(ROOT_PATH, 'src/pages'),
                utils: path.resolve(ROOT_PATH, 'src/utils'),
                service: path.resolve(ROOT_PATH, 'src/service'),
                assets: path.resolve(ROOT_PATH, 'static/assets')
            }
        }
    };

    //开发模式，开启devServer，关闭压缩
    if (config.mode === 'development') {
        config.devServer = {
            historyApiFallback: true, //不跳转
            host: 'localhost',
            port: '8080',
            liveReload: true,
            hot: true,
            compress: false
            // https: true
        };

        //开启source-map
        config.devtool = 'eval-source-map';

        //开发模式没有压缩，关闭提示
        if (config.performance) {
            config.performance.hints = false;
        }

        //调整优化配置
        if (config.optimization) {
            config.optimization.chunkIds = 'named';
            config.optimization.moduleIds = 'named';
            //不使用压缩
            config.optimization.minimize = false;
            config.optimization.removeAvailableModules = false; //开发模式应该没关系？
        }
    }
    //生产模式（默认）
    else {
    }

    return config;
};

export default generateWebpackConfig;