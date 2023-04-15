import Webpack, { Configuration } from 'webpack';
import WebpackDevServer from 'webpack-dev-server';
import generateWebpackConfig from './webpack.config';

import { EnvironmentType } from '../src/environment/type';

//编译环境
const environment = EnvironmentType.SIT;
//编译模式
const mode: Configuration['mode'] = 'production';

/**-------------------------------------我是华丽的分割线------------------------------------- */

const webpackConfig = generateWebpackConfig(environment, mode);
const compiler = Webpack(webpackConfig);

if (webpackConfig.mode === 'production') {
    console.log(`\x1b[42;30m BUILD \x1b[0m building in \x1b[1m${mode}\x1b[0m mode for \x1b[1m${environment}\x1b[0m environment`);
    compiler.run((error) => {
        error && console.error(error);
        console.log(`\x1b[42;30m DONE \x1b[0m building in \x1b[1m${mode}\x1b[0m mode for \x1b[1m${environment}\x1b[0m environment success`);
    });
}
else if (webpackConfig.mode === 'development') {
    console.log(`\x1b[42;30m SERVER \x1b[0m starting server in \x1b[1m${mode}\x1b[0m mode for \x1b[1m${environment}\x1b[0m environment`);
    const devServerOptions = { ...webpackConfig.devServer, open: true };
    const server = new WebpackDevServer(devServerOptions, compiler);
    server
        .start()
        .then(() => {
            console.log(`\x1b[42;30m SERVER \x1b[0m started server in \x1b[1m${mode}\x1b[0m mode for \x1b[1m${environment}\x1b[0m environment successfully`);
        });

    //该方式需要另外配套server，比如live server
    // compiler.watch({
    //     aggregateTimeout: 300
    // }, (error) => {
    //     error && console.error(error);
    // });
}
else {
    console.error(`unhandle webpack mode '${webpackConfig.mode}'`);
}