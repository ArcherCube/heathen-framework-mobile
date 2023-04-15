/**
 * 响应内容的类型
 * @template {any} T 响应内容的data类型
 */
 export interface ResponseBody<T> {
    success: boolean;
    message: string;
    code: number;
    data: T
}