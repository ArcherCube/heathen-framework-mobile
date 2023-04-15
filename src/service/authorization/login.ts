import { FetchService } from '../../utils/fetch';
import { ResponseBody } from '../response-body';

export interface LoginRequestData {
    /**用户名 */
    username: string;
    /**密码（加密后的） */
    password: string;
}
export interface LoginResponseData {
    /**id */
    id: string;
    /**用户名 */
    name: string;
    /**头像地址 */
    avatar: string;
    /**token */
    token: string;
}
/**登录 */
export const login: FetchService<LoginRequestData, ResponseBody<LoginResponseData>> = {
    url: '/api/login',
    method: 'POST',
    contentType: 'application/json'
}