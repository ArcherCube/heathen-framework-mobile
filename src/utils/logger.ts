import { CSSProperties } from 'react';
import { pascalCaseToKebabCase } from './common';

//获取当前模式，判断是否需要输出自动化导入导出信息
const ENV = process.env.NODE_ENV;
const canLog = ENV !== 'production' &&
    ENV !== 'test' &&
    typeof console !== 'undefined' &&
    console.log && // eslint-disable-line no-console
    typeof window !== 'undefined';

function CSSPropertiesToStyleString(css: CSSProperties) {
    let result = '';
    for (const key in css) {
        result += `${pascalCaseToKebabCase(key)}:${css[key as keyof CSSProperties]};`
    }
    return result;
}

export class Logger {
    private static readonly summaryStyle: CSSProperties = {
        background: '#43bb88',
        color: '#333',
        fontWeight: 'bold',
        borderRadius: '2px',
        padding: '0 10px'
    }
    private static readonly errorStyle: CSSProperties = {
        background: '#dd1111',
        color: '#fff',
        fontWeight: 'bold',
        borderRadius: '2px',
        padding: '0 10px'
    }

    public static readonly log = (...message: any) => {
        canLog && console.log(...message);
    }

    public static readonly summary = (message: string) => {
        canLog && console.log(`%c${message}`, CSSPropertiesToStyleString(Logger.summaryStyle));
    }

    public static readonly error = (message: string) => {
        canLog && console.log(`%c${message}`, CSSPropertiesToStyleString(Logger.errorStyle));
    }
}
