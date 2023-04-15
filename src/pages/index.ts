import { Logger } from "utils/logger";

export interface PageType {
    /**标题 */
    title: string,

    /**页面组件名，按页面自动导出的规则定义该值 */
    component: string,

    /**路由路径 */
    path: string,

    /**iconfont图标名 */
    icon?: string,

    /**是否去除页头 */
    isNoHeader?: boolean,

    /**子页面 */
    children?: PageType[]
}

/**
 * 固定的页面
 */
const pages: PageType[] = [
]

//遍历当前下文件夹，找到所有**/index.js/jsx/ts/tsx，得到对应文件的环境
const requireContext = require.context('./', true, /^\.\/.*(?<!style.*)\/index\.[tj]sx?$/);

//遍历找到所有的路径，按类型引入
let count = 0;
requireContext.keys().forEach((path) => {
    //按路径引入文件，得到对应的对象
    let target = requireContext(path);

    //如果含有default则改为default
    if (target && target.default) {
        target = target.default;
    }

    //检查信息是否写全
    if (target.title && target.path && target.component) {
        pages.push(target);
        Logger.log(`export page from '${path}'`);
        ++count;
    }
    else {
        Logger.error(`page from '${path}' missing required parameters(title, component, path)`);
    }
});

Logger.summary(`export ${count} pages`);

export default pages;