import { EnvironmentType } from "./type";

export interface EnvironmentConfig {
    /**项目访问路径 */
    baseUrl?: string;

    /**接口请求根路径。会直接跟接口路径拼接。 */
    baseApiUrl?: string;
}


const environment: Record<EnvironmentType, EnvironmentConfig> = {
    DEV: {},
    SIT: {},
    UAT: {},
    PROD: {},
};

//TODO:DefinePlugin中定义了，如何避免手动再声明
declare const ENVIRONMENT: EnvironmentType;

export default environment[ENVIRONMENT];