/**
 * 根据search串生成param对象
 * @param {...string[]} searchs 参数串，以'?'开头，可传递多个，字段相同时，后面传入的会覆盖前面的
 * @returns {object} 
 */
export function searchToParam(...searchs: string[]): { [key: string | number]: any } {
    const result: { [key: string | number]: any } = {};
    for (const search of searchs) {
        if (search.charAt(0) == '?') {
            const paramList = search.slice(1);
            const params = paramList.split('&');
            for (const param of params) {
                const [key, value] = param.split('=');
                result[key] = value;
            }
        }
    }
    return result;
}

/**
 * @description 将data对象转换为url参数
 * @param {any} param 传入的数据对象
 * @return {string} url参数，不包括'?'。当对象为空对象时返回''
*/
export function paramToSearch(param: any): string {
    if (!param) return '';
    if (param instanceof Array) {
        return '';
    }
    if (typeof param === 'string') {
        return param;
    }

    const paramList = [];
    for (const key in param) {
        paramList.push(`${key}=${param[key]}`);
    }

    return paramList.join('&');
}

/**
 * 生成uuid
 */
export const generateUUID = (): string => {
    const s = [];
    const hexDigits = '0123456789abcdef';
    for (let i = 0; i < 32; i++) {
        s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
    }
    s[14] = '4'; // bits 12-15 of the time_hi_and_version field to 0010
    s[19] = hexDigits.substr((parseInt(s[19]) & 0x3) | 0x8, 1); // bits 6-7 of the clock_seq_hi_and_reserved to 01
    s[8] = s[13] = s[18] = s[23] = '-';

    return s.join('');
}

/**
 * 使图片旋转为横向
 * @param {File | string} file 图片的文件对象或base64
 */
export const horizontalImage = (base64: string): Promise<string> => {
    return new Promise((resolve, reject) => {
        const image = new Image();
        image.src = base64;
        image.onerror = (error) => {
            reject(error);
        }
        image.onload = () => {
            if (image.width < image.height) {
                const canvas = document.createElement('canvas');
                canvas.width = image.height;
                canvas.height = image.width;
                const ctx = canvas.getContext('2d');
                if (ctx) {
                    const mimeType = base64.slice('data:'.length - 1, base64.indexOf(';'));
                    ctx.rotate((90 / 180) * Math.PI);
                    ctx.drawImage(image, 0, -image.height, image.width, image.height);
                    ctx.setTransform(1, 0, 0, 1, 0, 0);
                    resolve(canvas.toDataURL(mimeType));
                }
                else {
                    reject('create canvas context fail when horizontal image.');
                }
            }
            else {
                resolve(base64);
            }
        };
    });
}

export interface SelectFileConfig {
    compressVideoConfig?: CompressVideoConfig;
    compressImageConfig?: CompressImageConfig;
    maxSize?: number;
    onSelect?: (file: File) => void;
    [otherPropsName: string]: any;
}
interface HTMLInputEvent extends Event {
    target: HTMLInputElement & EventTarget;
}
/**
 * 选择文件的API
 * @param {object} config 配置可选文件的参数，例如accept等，本质上是input的配置
 */
export const selectFile = (config: SelectFileConfig): Promise<File | string> => {
    const input = document.createElement('input');
    const { compressImageConfig, compressVideoConfig, maxSize, onSelect } = config;

    delete config.compressImageConfig;
    delete config.compressVideoConfig;
    delete config.maxSize;
    delete config.onSelect;

    for (const key in config) {
        input.setAttribute(key, config[key]);
    }
    input.setAttribute('type', 'file');
    input.setAttribute('style', 'visibility:hidden');
    document.body.appendChild(input);

    return new Promise<File | string>((resolve, reject) => {
        //选中文件时触发的方法
        input.onchange = (event: HTMLInputEvent) => {
            const files: FileList | null = event.target.files;
            if (!files || files.length === 0) {
                reject('empty select');
            }
            else {
                onSelect && onSelect(files[0]);
                resolve(files[0]);
            }
            document.body.removeChild(input);
        };
        input.click();
    })
        .then((file: File) => {
            if (compressImageConfig) {
                return compressImage(file, compressImageConfig);
            }
            return file;
        })
        .then((file: File) => {
            if (compressVideoConfig) {
                return compressVideo(file, compressVideoConfig);
            }
            return file;
        })
        .then((file: File) => {
            if (maxSize) {
                if (file.size > maxSize) {
                    return Promise.reject('file size is largger then maxSize.');
                }
                return file;
            }
            return file;
        });
}

export const getVideoDuration = (file: File): Promise<number> => {
    return new Promise((resolve, reject): void => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const base64: string | ArrayBuffer | null = event.target ? event.target.result : null;
            if (base64) {
                const video: HTMLVideoElement = document.createElement('video');
                video.src = base64.toString();
                // video.preload = 'preload';
                //TODO：兼容测试
                video.load();
                video.onloadedmetadata = () => {
                    resolve(video.duration);
                }
            }
        };
        reader.onerror = (error) => {
            reject(error);
        };
    });
}

/**
 * 获取系统类型
 * @returns {string} 当前系统类型，ios || android || 其他
 */
export const getSystem = (): string => {
    var u = navigator.userAgent;
    var isiOS = !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/);
    var isAndroid = u.indexOf('Android') > -1 || u.indexOf('Adr') > -1; //android终端
    if (isiOS) {
        return 'ios';
    } else if (isAndroid) {
        return 'android';
    }
    else {
        return u;
    }
}

/**
 * 
 * @returns 是否为PC设备
 */
export const isPC = (): boolean => {
    return !/Android|webOS|iPhone|iPod|BlackBerry/i.test(window.navigator.userAgent);
}

/**
 * 获取compressVideoLength的兼容信息
 */
export const getCompressVideoLengthCompatibility = (mimeType: string): Record<string, boolean> => {
    //辅助输出
    // if (window.MediaRecorder) {
    //     const types = [
    //         'video/webm',
    //         'audio/webm',
    //         'video/webm;codecs=vp8',
    //         'video/webm;codecs=daala',
    //         'video/webm;codecs=h264',
    //         'audio/webm;codecs=opus',
    //         'video/mpeg',
    //         'video/mpeg4',
    //         'video/mpeg5',
    //         'video/mp4;codecs=h264',
    //         `video/mp4;codecs='avc1.424028, mp4a.40.2'`
    //     ]

    //     const typeObj = {}
    //     for (const type of types) {
    //         typeObj[type] = MediaRecorder.isTypeSupported(type)
    //     }
    //     console.log(typeObj);
    // }

    return {
        isPC: isPC(),
        isIOS: getSystem() === 'ios',
        canvasHasCaptureStream: window.HTMLCanvasElement !== undefined && window.HTMLCanvasElement.prototype !== undefined && window.HTMLCanvasElement.prototype.captureStream !== undefined,
        // hasCanvasCaptureMediaStream: window.CanvasCaptureMediaStream !== undefined,
        hasMediaRecorder: window.MediaRecorder !== undefined,
        // mediaRecorderSupportedType: MediaRecorder.isTypeSupported(type)
        mediaRecorderSupportedType: window.MediaRecorder !== undefined && window.MediaRecorder.isTypeSupported !== undefined && window.MediaRecorder.isTypeSupported(mimeType)
    };
}

export interface CompressVideoConfig {
    /**
     * 长边分辨率，单位：像素
     */
    compressLength?: number
}
/**
 * 压缩视频（ios不兼容、android兼容性待确定）
 * 处理过程中不可以离开页面，否则会造成视频内容缺失
 * @param {File} file 视频文件
 * @param {CompressVideoConfig} compressVideoConfig 压缩配置
 * @returns {Promise} resolved promise 返回压缩后的视频
 */
export const compressVideo = (file: File, compressVideoConfig: CompressVideoConfig): Promise<File> => {
    const { compressLength } = compressVideoConfig;
    if (compressLength === undefined) {
        return Promise.resolve(file);
    }

    const mimeType = 'video/webm;codecs=vp8'; //目前测试情况基本都支持这个mimetype

    //需要用到的兼容性内容的检测
    const compatibility = getCompressVideoLengthCompatibility(mimeType);
    console.log('compressVideoLength compatibility:', compatibility);

    //允许的情况：是pc，或者（不是ios且canvas有相关方法）
    const { isPC, isIOS, canvasHasCaptureStream, hasMediaRecorder, mediaRecorderSupportedType } = compatibility;
    const accept = isPC || (!isIOS && canvasHasCaptureStream && hasMediaRecorder && mediaRecorderSupportedType);
    if (!accept) {
        //不允许时直接返回file
        return Promise.resolve(file);
    }
    //测试输出
    console.log('origin file:', file);

    //后续代码可以直接使用有兼容风险的API
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);

        reader.onload = (event) => {
            const base64: string | ArrayBuffer | null = event.target ? event.target.result : '';
            if (!base64) {
                reject('read file fail when compressing video.');
                return;
            }
            //创建video元素
            const video = document.createElement('video');
            video.src = base64.toString();
            // video.preload = 'preload';
            video.muted = true;

            //创建辅助canvas
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            if (!ctx) {
                reject('create canvas context fail when compressing video.');
                return;
            }
            //ios中该方法无效
            video.load();
            //避免video.load失败
            const holdTimeout = setTimeout(() => {
                resolve(file);
            }, 10 * 1000);
            video.onloadeddata = () => {
                //计算压缩比例
                const { videoWidth, videoHeight, duration } = video;
                let rate;
                if (videoWidth > videoHeight) {
                    rate = compressLength / videoWidth;
                }
                else {
                    rate = compressLength / videoHeight;
                }
                canvas.width = videoWidth * rate;
                canvas.height = videoHeight * rate;

                video.play();

                const durationMilliseconds = duration * 1000;
                if (durationMilliseconds) {
                    //取消原本的holdTimeout
                    clearTimeout(holdTimeout);

                    //最多视频时长2倍时间后取消压缩
                    setTimeout(() => {
                        resolve(file);
                    }, durationMilliseconds * 2);
                }
                else {
                    resolve(file);
                }
            }
            let mediaRecorder: MediaRecorder;
            video.onplay = () => {
                //canvas渲染循环
                const loop = () => {
                    if (video.ended) return;

                    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

                    requestAnimationFrame(loop);
                }
                requestAnimationFrame(loop);

                //创建CanvasCaptureMediaStream
                const canvasCaptureMediaStream = canvas.captureStream(30);
                //媒体录制工具
                const options = {
                    videoBitsPerSecond: 2500000, //比特率
                    mimeType
                }
                try {
                    mediaRecorder = new MediaRecorder(canvasCaptureMediaStream, options);
                    mediaRecorder.start();
                }
                catch (error) {
                    reject(error);
                    return;
                }
                mediaRecorder.ondataavailable = ({ data }) => {
                    const file = new File([data], generateUUID() + '.webm', { type: mimeType });

                    //测试输出
                    console.log('compress file:', file);

                    resolve(file);
                };
                mediaRecorder.onerror = (error) => {
                    reject(error);
                }

            }
            video.onended = () => {
                mediaRecorder && mediaRecorder.stop();
            }
        };
        reader.onerror = (error) => {
            reject(error);
        };
    });
}


export interface CompressImageConfig {
    /**
     * 质量，取值0～1
     */
    quality?: number,

    /**
     * 长边分辨率，单位：像素
     */
    compressLength?: number
}
/**
 * 压缩图片
 * @param {File} file 输入图片
 * @param {CompressImageConfig} compressImageConfig 压缩配置
 * @returns {Promise} resolved promise 返回压缩后的新图片
 */
export function compressImage(file: File, compressImageConfig: CompressImageConfig) {
    const { quality, compressLength } = compressImageConfig;
    if (quality === undefined && compressLength === undefined) {
        return Promise.resolve(file);
    }

    return new Promise((resolve, reject) => {
        // 获取图片（加载图片是为了获取图片的宽高）
        const img = new Image();
        img.src = window.URL.createObjectURL(file);
        img.onerror = error => reject(error);
        img.onload = () => {
            //加载异常，不压缩
            if (!img.width || !img.height) {
                resolve(file);
                return;
            }
            //判断长边，计算缩放比
            let rate = 1;
            if (img.width > img.height) {
                rate = img.width / (compressLength === undefined ? img.width : compressLength);
            }
            else {
                rate = img.height / (compressLength === undefined ? img.height : compressLength);
            }

            //用canvas缩放
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = img.width / rate;
            canvas.height = img.height / rate;
            if (ctx) {
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                // 导出新图片
                // 指定图片 MIME 类型为 'image/jpeg'
                canvas.toBlob((blob: Blob) => {
                    const file = new File([blob], `${generateUUID()}.jpg`, { type: 'image/jpeg' })
                    resolve(file);
                }, 'image/jpeg', (quality === undefined ? 1 : quality));
            }
            else {
                reject('create canvas context fail when compressing image.')
            }
        };
    });
}


/**
 * 获取目标的类型。首字母大写。
 * @param {any} target 目标
 */
export function getType(target: any): string {
    if (Object.prototype.toString) {
        return Object.prototype.toString.call(target).substring(8).split(/]/)[0];
    }
    else {
        const type = typeof target;
        if (type && type.length > 0) {
            return type.slice(0, 1).toUpperCase() + type.slice(1);
        }
        else {
            return '';
        }
    }
}

/**
 * 判断target是否为type类型
 * @param target 目标
 * @param type 目标类型
 * @returns 
 */
export function isType(target: any, type: string): boolean {
    return Object.prototype.toString.call(target) === '[object ' + type + ']';
}

/**
 * 判断目标是否为数组
 * @param target 目标
 * @returns 
 */
export function isArray(target: any) {
    return Array.isArray ? Array.isArray(target) : isType(target, 'Array');
}

/**
 * 判断目标是否为基本对象类型
 * @param target 目标
 * @returns 
 */
export function isPlainObject(target: any) {
    if (!(typeof target === 'object' && target !== null) || !isType(target, 'Object')) {
        return false;
    }
    if (Object.getPrototypeOf(target) === null) {
        return true;
    }
    var proto = target;
    while (Object.getPrototypeOf(proto) !== null) {
        proto = Object.getPrototypeOf(proto);
    }
    return Object.getPrototypeOf(target) === proto;
}

/**
 * 判断两个对象是否相等（深比较
 * @param {any} sourceObj 对象1
 * @param {any} compareObj 对象2
 */
export function isEqualObject(sourceObj: any, compareObj: any) {
    const sourceType = getType(sourceObj);
    if (sourceType !== getType(compareObj)) return false;
    // Not objects and arrays
    if (sourceType !== 'Array' && sourceType !== 'Object' && sourceType !== 'Set' && sourceType !== 'Map') {
        if (sourceType === 'Number' && sourceObj.toString() === 'NaN') {
            return compareObj.toString() === 'NaN';
        }
        if (sourceType === 'Date' || sourceType === 'RegExp') {
            return sourceObj.toString() === compareObj.toString();
        }
        if (sourceObj && compareObj) {
            return sourceObj.toString() === compareObj.toString();
        }
        return sourceObj === compareObj;
    }
    else if (sourceType === 'Array') {
        if (sourceObj.length !== compareObj.length) return false;
        if (sourceObj.length === 0) return true;
        for (let i = 0; i < sourceObj.length; i++) {
            if (!isEqualObject(sourceObj[i], compareObj[i])) return false;
        }
    }
    else if (sourceType === 'Object') {
        for (let key in sourceObj) {
            //跳过内部属性
            if (key.startsWith('_')) continue;
            if (!isEqualObject(sourceObj[key], compareObj[key])) {
                return false;
            }
        }
        for (let key in compareObj) {
            //跳过内部属性
            if (key.startsWith('_')) continue;
            if (!isEqualObject(compareObj[key], sourceObj[key])) {
                return false;
            }
        }
    }
    else if (sourceType === 'Set' || sourceType === 'Map') {
        // 把 Set Map 转为 Array
        if (!isEqualObject(Array.from(sourceObj), Array.from(compareObj))) return false;
    }
    return true;
}

function _deepMix(target: any, source: any, level: number = 0, maxLevel: number = 5) {
    for (const key in source) {
        if (source.hasOwnProperty(key)) {
            const value = source[key];
            if (value !== null && isPlainObject(value)) {
                if (!isPlainObject(target[key])) {
                    target[key] = {};
                }
                if (level < maxLevel) {
                    _deepMix(target[key], value, level + 1, maxLevel);
                }
                else {
                    target[key] = source[key];
                }
            }
            else if (isArray(value)) {
                target[key] = [];
                target[key] = target[key].concat(value);
            }
            else if (value !== undefined) {
                target[key] = value;
            }
        }
    }
}
/**
 * 深合并多个对象到target中
 * @param target 合并目标
 * @param source 合并源列表
 * @returns target的引用
 */
export function deepMix(target: any, ...source: any[]): any {
    for (const sourceItem of source) {
        _deepMix(target, sourceItem);
    }
    return target;
};

/**
 * 将短横线名称改为驼峰命名
 * @param {string} name 
 * @param {boolean} upper
 * @returns 
 */
export function kebabCaseTopascalCase(name: string, upper: boolean = false) {
    //首字母大写、之后匹配多个[-\/]\w且将其中\w的部分大写
    const firstLetter = name.charAt(0);
    return (upper ? firstLetter.toUpperCase() : firstLetter) + name.slice(1).replace(/[-\/](\w)/g, (_, firstMatchRegExpGroup: string) => firstMatchRegExpGroup.toUpperCase());
}

/**
 * 将驼峰命名改为短横线名称（仅使用于完全符合标准的驼峰命名）
 * @param {string} name 
 * @returns 
 */
export function pascalCaseToKebabCase(name: string) {
    //首字母小写、之后匹配多个[A-Z]且将其中[A-Z]的部分改为 -小写
    return name.charAt(0).toLowerCase() + name.slice(1).replace(/([A-Z])/g, (_, firstMatchRegExpGroup: string) => ('-' + firstMatchRegExpGroup.toLowerCase()));
}