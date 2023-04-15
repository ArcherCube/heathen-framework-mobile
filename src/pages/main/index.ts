import lazyLoad from 'utils/lazy-load';

export default {
    title: '主页',
    path: '/',
    component: lazyLoad(() => import('./main'))
};