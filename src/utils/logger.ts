import { CSSProperties } from 'react';
import { pascalCaseToKebabCase } from './common';

//获取当前环境，判断是否需要输出自动化导入导出信息
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
    static summaryStyle: CSSProperties = {
        background: '#43bb88',
        color: '#333',
        fontWeight: 'bold',
        borderRadius: '2px',
        padding: '0 10px'
    }
    static errorStyle: CSSProperties = {
        background: '#dd1111',
        color: '#fff',
        fontWeight: 'bold',
        borderRadius: '2px',
        padding: '0 10px'
    }

    static log = (text: string) => {
        canLog && console.log(text);
    }

    static summary = (text: string) => {
        canLog && console.log(`%c${text}`, CSSPropertiesToStyleString(Logger.summaryStyle));
    }

    static error = (text: string) => {
        canLog && console.log(`%c${text}`, CSSPropertiesToStyleString(Logger.errorStyle));
    }
}
