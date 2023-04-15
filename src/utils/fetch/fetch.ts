import { paramToSearch } from '../common';
import { mergeProps } from '../merge-props';
import { FetchConfig, fetchHeadersContentType, defaultContentTypeInfo, FetchRequestDataType, FetchResult, FetchService, ResponseStatus } from './fetch.type';

/**
 * 生成fetch请求方法的参数。
 * @param {string} url 原始url
 * @param {object} config Fetch请求配置
 * @param {object} data 请求体的数据
 * @returns 一个对象，包含真实的请求 url 以及 RequestInit 类型的原生 fetch 配置
 */
const generateFetchParam = <dataType extends FetchRequestDataType>(url: string, config: FetchConfig, data?: dataType) => {
    //处理data
    const urlParamList = data ? paramToSearch(data) : '';
    //get方法直接附加url参数
    if (config.method === 'GET') {
        //有参数时才附加列表
        if (urlParamList) {
            url = `${url}?${urlParamList}`;
        }
    }
    //其他方法按header中contentType的设定，将参数放到body
    else {
        if (config.headers) {
            const contentType = config.headers['Content-Type'];
            if (contentType === 'application/x-www-form-urlencoded') {
                config.body = urlParamList;
            }
            else if (contentType === 'application/json') {
                config.body = JSON.stringify(data);
            }
            else if (contentType === 'multipart/form-data') {
                const formData = new FormData();
                if (data) {
                    try {
                        for (const key in data) {
                            //TODO：这里可能会报异常错误，因为data的类型没有判断能否in
                            formData.append(key, data[key]);
                        }
                    }
                    catch (error) {
                        throw error;
                    }
                }
                config.body = formData;
                //发送文件时，会在请求头中附加boundary，不可以自行设置请求头。Content-Type会在body为FormData时自动转为multipart/form-data
                delete config.headers['Content-Type'];
            }
            else {
                config.body = urlParamList;
            }
        }
        else {
            config.body = urlParamList;
        }
    }

    //创建请求头
    const headers: Headers = new Headers(config.headers as Record<string, string>);

    //处理url
    const isHttpUrl = url.slice(0, 4) === 'http';
    let requestUrl = '';
    if (isHttpUrl) {
        requestUrl = url;
    }
    else {
        requestUrl = (config.baseApiUrl ?? '') + url;
    }

    //整合fetch配置
    const requestInit: RequestInit = {
        ...config,
        headers
    };

    //中断处理
    if (window.AbortController) {
        const abortController = new AbortController();
        requestInit.signal = abortController.signal;
        config.abortRef?.(abortController.abort.bind(abortController));
    }

    return {
        url: requestUrl,
        init: requestInit,
    }
}

/**
 * 加载 Response 对象的 body 。
 * @param response 待加载的对象
 * @param onProcess 加载过程的回调
 * @returns 带有完整 body 资源的 Promise
 */
const loadResponseBody = async (response: Response, onProcess?: (current: number, total: number) => void) => {
    if (!response?.body) {
        //空body其实也是允许的
        throw new Error('[Fetch]: response.body is empty.');
    }

    const reader = response.body.getReader();

    //获得总长度
    const headersContentLength: string = response.headers?.get('Content-Length') ?? '';
    const fullLength = parseInt(headersContentLength);

    //读取数据
    let receivedLength = 0;
    const dataPieces: Uint8Array[] = [];

    while (true) {
        const { done, value } = await reader.read();
        if (!done) {
            dataPieces.push(value);
            receivedLength += value.length;

            onProcess?.(receivedLength, fullLength);
        }
        else {
            // 整合资源
            const result = new Uint8Array(receivedLength);
            let position = 0;
            for (const dataPiece of dataPieces) {
                result.set(dataPiece, position);
                position += dataPiece.length;
            }

            return result;
        }
    }
}

/**
 * 将整合的响应正文按响应头中指定信息进行格式、类型转换
 * @param originResult 将流数据整合后的原始对象
 * @param response 响应对象
 * @returns 对应类型及格式的响应内容
 */
const parseResult = (originResult: Uint8Array, response: Response): any => {

    const contentTypeStr = response.headers?.get('content-type');

    let contentType = defaultContentTypeInfo.contentType;
    let charset = defaultContentTypeInfo.charset;
    if (contentTypeStr) {
        for (const _contentType of fetchHeadersContentType) {
            if (contentTypeStr.includes('application/json')) {
                contentType = _contentType;
            }
        }

        const charsetMatch = contentTypeStr.match(/^.*charset=(.*);.*$/g);
        if (charsetMatch) {
            charset = charsetMatch[1];
        }
    }

    //解析响应头内容的编码
    const textResult = new TextDecoder(charset).decode(originResult);

    //数据格式转换
    if (contentType === 'application/json') {
        let jsonResult;
        try {
            jsonResult = JSON.parse(textResult);
        }
        catch (error) {
            throw new Error(`[Fetch]: ${error.message ?? 'unknow parse JSON error.'}`);
        }
        return jsonResult;
    }
    else {
        return textResult;
    }
}

export class Fetch {
    private static readonly defaultConfig = {
        baseApiUrl: '',
        cache: 'default',
        credentials: 'omit',
        method: 'GET',
        mode: 'same-origin',
        redirect: 'follow',
        referrer: 'client',
        responseStatus: {},
        headers: {},
        timeout: 30
    };

    /**
     * 发起fetch请求。
     * @param {string} url 接口路径
     * @param {object} data 请求体的数据
     * @param {object} tempConfig 额外配置
     * @returns {Promise} 请求对应的promise
     */
    private static fetch<requestParam extends FetchRequestDataType, responseParam, dataType extends requestParam>(url: string, data?: dataType, tempConfig: FetchConfig = {}): Promise<FetchResult<responseParam>> {
        const config = mergeProps(Fetch.defaultConfig, tempConfig);

        //请求前操作
        config.before?.(config);

        //生成fetch参数
        const { url: requestUrl, init } = generateFetchParam<dataType>(url, config, data);

        //创建请求
        const promise = fetch(requestUrl, init)
            .then((response) => {
                //响应后第一时间取消 abort 的效果（开始下载后已经不能中止）
                config.abortRef?.(() => {
                    console.warn('[Fetch]: fetch can\'t be abort now.');
                });

                //预处理
                config.responseStatus[response.status as ResponseStatus]?.(config);

                //网络请求成功
                if (response.status >= 200 && response.status < 300) {
                    return loadResponseBody(response, (current, total) => { config.onProcess?.(current, total, response) })
                        .then((result) => {
                            return parseResult(result, response);
                        });
                }
                else {
                    throw new Error(`[Fetch]: ${response.status}${response.statusText ?? 'unknow http status error.'}`);
                }
            });

        //创建超时 Promise
        const timeout = new Promise<never>((_, reject) => {
            setTimeout(() => {
                reject(new Error('[Fetch]: fetch time out.'));
            }, (config.timeout) * 1000);
        });

        return Promise.race([promise, timeout]);
    }

    /**
     * Fetch 全局配置
     * @param param 配置参数
     */
    public static config(param: FetchConfig) {
        Object.assign(Fetch.defaultConfig, param); //TODO: 这里应该是deepMix
    }

    /**
     * 通过service发起fetch请求。
     * @param {FetchService} service 接口对象
     * @param {object} data 请求参数对象
     * @param {object} tempConfig 额外配置
     * @returns {Promise<FetchSuccessResponse<responseParam>>} 请求对应的promise
     */
    public static request<requestParam extends FetchRequestDataType, responseParam, dataType extends requestParam>(service: FetchService<requestParam, responseParam>, data?: dataType, tempConfig: FetchConfig = {}): Promise<FetchResult<responseParam>> {
        const config: FetchConfig = {
            method: service.method
        };
        Object.assign(config, tempConfig);

        //如果service中定义了contentType，config中没有对headers的contentType有强制定义，则使用service中的
        if (service.contentType) {
            if (!config.headers) {
                config.headers = {};
            }
            if (!config.headers['Content-Type']) {
                config.headers['Content-Type'] = service.contentType;
            }
        }

        return Fetch.fetch(service.url, data, config);
    }
}