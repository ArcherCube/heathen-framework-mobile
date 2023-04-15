import { Fetch } from '../utils/fetch';
import environment from '../environment';

//Fetch全局配置
Fetch.config({
    mode: 'cors',
    baseApiUrl: environment.baseApiUrl,
    timeout: 60,
    // before: (param) => {
    //     if (!param.headers) {
    //         param.headers = {};
    //     }
    //     const userInfo = getUserInfo();

    //     if (userInfo) {
    //         param.headers['Authorization'] = userInfo?.token;
    //     }
    // }
});