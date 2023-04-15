import { Logger } from '../utils/logger';

//遍历当前下文件夹，找到所有**/index.js/jsx/ts/tsx，得到对应文件的环境
const requireContext = require.context('./', true, /^\.\/.*\.[tj]sx?$/);

//遍历找到所有的路径，按类型引入
let count = 0;
requireContext.keys().forEach(path => {
    if (path === './index.js') return;

    //按路径引入文件，得到对应的对象
    let target = requireContext(path);

    //如果含有default则改为default（即内容本身）
    if (target && target.default) {
        target = target.default;
    }

    Logger.log(`import config from '${path}'`);
    ++count;
});

Logger.summary(`import ${count} configs`);

//让node认为这个module
export default undefined;