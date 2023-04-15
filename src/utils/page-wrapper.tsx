import * as React from 'react';
import { useEffect } from 'react';

export interface PageWrapperProps {
    /**
     * 页面标题
     */
    title: string,

    /**
     * 子节点
     */
    children: React.ReactNode
}

/**
 * @description 页面包裹组件，解决访问页面埋点、路由标题切换
 * @param {title} 页面标题 
 * @param {point} 埋点id 
 * @returns 
 */
const PageWrapper: React.FC<PageWrapperProps> = (props: PageWrapperProps) => {
   
    //页面标题切换
    useEffect(() => {
        if (props.title) {
            document.title = `${props.title}`;
        }
    }, []);

    return (
        <>
            {props.children}
        </>
    );
}

export default PageWrapper;