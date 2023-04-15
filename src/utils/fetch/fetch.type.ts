
/**
 * 请求的类型。
 * @param GET 默认值
 * @param POST
 * @param PUT
 * @param DELETE
 */
export type FetchMethod = 'POST' | 'GET' | 'PUT' | 'DELETE';
export const fetchHeadersContentType = ['application/json', 'application/x-www-form-urlencoded', 'multipart/form-data', 'text/plain'] as const;
export type FetchHeadersContentType = typeof fetchHeadersContentType[number];

/**请求头的类型 */
export interface FetchHeaders {
    /**
     * 请求体文本类型。
     * @param 'application/json'
     * @param 'application/x-www-form-urlencoded'
     * @param 'multipart/form-data'
     * @param 'text/plain'
     * @description 在'no-cors'模式下，content-type的值只能是application/x-www-form-urlencoded、multipart/form-data或text/plain。
     */
    'Content-Type'?: FetchHeadersContentType;
    [paramName: string]: string | undefined;
}

type Enumerate<N extends number, Acc extends number[] = []> = Acc['length'] extends N
    ? Acc[number]
    : Enumerate<N, [...Acc, Acc['length']]>;

type IntRange<F extends number, T extends number> = Exclude<Enumerate<T>, Enumerate<F>>;
export type ResponseStatus = IntRange<100, 600>;

/**请求配置的类型 */
export interface FetchConfig {
    /**
     * 根url。调用Fetch方法时，非http开头的url会附加此值。
     */
    baseApiUrl?: string,

    /**
     * 请求的缓存模式。控制着请求以何种方式与浏览器的 HTTP 缓存进行交互。
     * @param default 浏览器从HTTP缓存中寻找匹配的请求。
     * 如果缓存匹配上并且有效（fresh）, 它将直接从缓存中返回资源。
     * 如果缓存匹配上但已经过期 ，浏览器将会使用传统（ conditional request ）的请求方式去访问远程服务器 。如果服务器端显示资源没有改动，它将从缓存中返回资源。否则，如果服务器显示资源变动，那么重新从服务器下载资源更新缓存。
     * 如果缓存没有匹配，浏览器将会以普通方式请求，并且更新已经下载的资源缓存。
     * @param no-store 浏览器直接从远程服务器获取资源，不查看缓存，并且不会使用下载的资源更新缓存。
     * @param reload 浏览器直接从远程服务器获取资源，不查看缓存，然后使用下载的资源更新缓存。
     * @param no-cache 浏览器在其HTTP缓存中寻找匹配的请求。
     * 如果有匹配，无论是新的还是陈旧的，浏览器都会向远程服务器发出条件请求。如果服务器指示资源没有更改，则将从缓存中返回该资源。否则，将从服务器下载资源并更新缓存。
     * 如果没有匹配，浏览器将发出正常请求，并使用下载的资源更新缓存。
     * @param force-cache 浏览器在其HTTP缓存中寻找匹配的请求。
     * 如果有匹配项，不管是新匹配项还是旧匹配项，都将从缓存中返回。
     * 如果没有匹配，浏览器将发出正常请求，并使用下载的资源更新缓存。
     * @param only-if-cached 浏览器在其HTTP缓存中寻找匹配的请求。
     * 如果有匹配项(新的或旧的)，则从缓存中返回。
     * 如果没有匹配，浏览器将返回一个错误。
     */
    cache?: 'default' | 'no-store' | 'reload' | 'no-cache' | 'force-cache' | 'only-if-cached';

    /**
     * 是否应该在跨域请求的情况下从其他域发送cookies。
     * @param omit 从不发送cookies.
     * @param same-origin 默认值。只有当URL与响应脚本同源才发送 cookies、 HTTP Basic authentication 等验证信息。(在旧版本浏览器，例如safari 11默认值依旧是omit，safari 12已更改)
     * @param include 不论是不是跨域的请求,总是发送请求资源域在本地的 cookies、 HTTP Basic authentication 等验证信息. 
     */
    credentials?: 'include' | 'same-origin' | 'omit';

    /**
     * 请求的类型。
     * @param GET 默认值
     * @param POST
     * @param PUT
     * @param DELETE
     */
    method?: FetchMethod;

    /**
     * 跨域请求是否能得到有效的响应，以及响应的哪些属性是可读的
     * @param same-origin 如果使用此模式向另外一个源发送请求，显而易见，结果会是一个错误。你可以设置该模式以确保请求总是向当前的源发起的。
     * @param no-cors 保证请求对应的 method 只有 HEAD，GET 或 POST 方法，并且请求的 headers 只能有简单请求头 (simple headers)。如果 ServiceWorker 劫持了此类请求，除了 simple header 之外，不能添加或修改其他 header。另外 JavaScript 不会读取 Response 的任何属性。这样将会确保 ServiceWorker 不会影响 Web 语义(semantics of the Web)，同时保证了在跨域时不会发生安全和隐私泄露的问题。
     * @param cors 允许跨域请求，例如访问第三方供应商提供的各种 API。预期将会遵守 CORS protocol  。仅有有限部分的头部暴露在 Response ，但是 body 部分是可读的。
     * @param navigate 表示这是一个浏览器的页面切换请求(request)。 navigate请求仅在浏览器切换页面时创建，该请求应该返回HTML。
     */
    mode?: 'no-cors' | 'cors' | 'same-origin' | 'navigate';

    /**
     * 请求重定向。可选值manual, *follow, error
     */
    redirect?: 'manual' | 'follow' | 'error';

    /**
     * 请求的来源。可选值*client, no-referrer
     */
    referrer?: 'client' | 'no-referrer';

    /**
     * 请求头
     */
    headers?: FetchHeaders;

    /**
     * 发起请求前的回调，可以对参数进行处理
     * @param {FetchConfig} config 当前请求参数，可以直接修改其中的内容。
     */
    before?: (config: FetchConfig) => void;

    /**
     * 对响应状态码的额外处理
     * @param {FetchConfig} config 本次请求的配置
     * @returns 是否进行后续的处理，为true或不返回，
     */
    responseStatus?: {
        [statusNum in ResponseStatus]: (config: FetchConfig) => void;
    };

    /**
     * 资源下载过程的回调
     */
    onProcess?: (current: number, total: number, response: Response) => void;

    /**
     * 超时时间，单位：秒
     */
    timeout?: number;

    /**
     * 响应内容的编码格式，默认会按照 headers 中 content-type 的设置进行处理，如无定义则取 'utf-8'
     */
    responseCharset?: string;

    /**
     * 返回内容的数据格式，默认会按照 headers 中content-type 的设置进行处理，如无定义则取 'text/plain'
     */
    responseType?: FetchHeadersContentType

    /**
     * 请求体
     */
    body?: any;

    /**
     * 指定时，函数内部返回一个 abort 方法，用于中止该 fetch
     */
    abortRef?: (abort?: AbortController['abort']) => void;
}

export const defaultContentTypeInfo: { contentType: FetchHeadersContentType, charset: string } = {
    contentType: 'text/plain',
    charset: 'utf-8'
}

/**请求参数数据的可选类型 */
export type FetchRequestDataType = Record<string | number | symbol, any> | string | any[] | null | never | undefined;

/**Fetch.request所用的service的类型 */
export interface FetchService<requestParam extends FetchRequestDataType = Record<string | number | symbol, any>, responseParam = any> {
    /**
     * 请求的url。
     */
    url: string;

    /**
     * 请求的类型。
     * @param 'GET'
     * @param 'POST' 
     * @param 'PUT' 
     * @param 'DELETE'
     */
    method: FetchMethod;

    /**
     * 请求体文本类型。
     * @param 'application/json'
     * @param 'application/x-www-form-urlencoded'
     * @param 'multipart/form-data'
     * @param 'text/plain'
     * @description 在'no-cors'模式下，content-type的值只能是application/x-www-form-urlencoded、multipart/form-data或text/plain。
     */
    contentType?: FetchHeadersContentType;

    /**无效项 */
    _?: requestParam;

    /**无效项 */
    __?: responseParam;
}

export type FetchResult<responseParam = any> = {
    data?: responseParam,
    response?: Response,
    message: string,
    code: number
};