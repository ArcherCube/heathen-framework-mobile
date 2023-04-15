import { Configuration } from 'webpack';

const moduleConfig: Configuration['module'] = {
    rules: [
        {
            test: /\.(ts|tsx|js|jsx)$/,
            exclude: /(node_modules)/,
            use: [
                {
                    loader: 'babel-loader',
                    options: {
                        presets: [
                            [
                                '@babel/preset-env',
                                {
                                    targets: {
                                        esmodules: false
                                    },
                                    // 'loose': true
                                }
                            ],
                            '@babel/preset-typescript',
                            '@babel/preset-react'
                        ],
                        compact: true,
                        cacheDirectory: true, //设置后，给定目录将用于缓存加载程序的结果
                        plugins: [
                            'transform-class-properties',
                            '@babel/plugin-syntax-dynamic-import',
                            '@babel/plugin-proposal-object-rest-spread',
                            '@babel/plugin-transform-object-assign',
                            [
                                '@babel/plugin-proposal-decorators',
                                {
                                    'legacy': true
                                }
                            ],
                            [
                                '@babel/plugin-proposal-class-properties',
                                {
                                    // 'loose': true
                                }
                            ]
                        ]
                    }
                },
            ]
        },
        // {
        //     enforce: 'pre',
        //     test: /\.js$/,
        //     loader: 'source-map-loader'
        // },
        {
            test: /\.less$/,
            exclude: /(node_modules)/,
            use: [
                'style-loader',
                {
                    loader: 'css-loader'
                },
                {
                    loader: 'px-to-rem-loader',
                    options: {
                        dpr: 2,
                        rem: 75,
                        exclude: ['background-size']
                    }
                },
                {
                    loader: 'less-loader',
                    options: {
                        lessOptions: { // 如果使用less-loader@5，请移除 lessOptions 这一级直接配置选项。
                            javascriptEnabled: true,
                        },
                        // noIeCompat: true,
                        // minimize: false //css压缩
                    }
                }
            ]
        },
        {
            test: /\.css$/,
            use: [
                'style-loader',
                {
                    loader: 'css-loader'
                }
            ]
        },
        {
            test: /\.(jpe?g|png|gif)$/i,
            use: [
                'file-loader?hash=sha512&digest=hex&limit=8192&name=assets/[name].[hash:8].[ext]',
                {
                    loader: 'image-webpack-loader',
                    options: {
                        optipng: {
                            optimizationLevel: 7
                        },
                        gifsicle: {
                            interlaced: false
                        },
                        pngquant: {
                            enabled: false,
                            quality: [0.65, 0.90],
                            speed: 4
                        },
                        mozjpeg: {
                            enabled: false,
                            quality: 65,
                            progressive: true
                        }
                    }
                }
            ]
        },
        {
            test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
            use: 'url-loader??prefix=fonts/name=assets/fonts/[name].[ext]&limit=10000&mimetype=application/font-woff'
        },
        {
            test: /\.(ttf|eot|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
            use: 'file-loader?prefix=fonts/&name=assets/fonts/[name].[ext]&limit=10000&mimetype=font/opentype'
        }
    ]
}

export default moduleConfig;