import { FetchService } from '../../utils/fetch';
import { ResponseBody } from '../response-body';

/**检查登录状态。会自动从缓存中获取token并附带到请求头中 */
export const checkToken: FetchService<never, ResponseBody<boolean>> = {
    url: '/api/checkToken',
    method: 'GET',
    contentType: 'application/json'
}