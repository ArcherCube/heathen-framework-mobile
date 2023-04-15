//增加格式化配置
interface Date {
    /**
     * 格式化日期。
     * @param {string} format 表述日期时间的格式。y（年）M（月）d（日）h（时）m（分）s（秒）S（毫秒），其中毫秒仅支持3位显示
     */
    format: (format: string) => string
}

Date.prototype.format = function (format: string): string {
    let ret;
    const option: Record<string, string> = {
        'y+': this.getFullYear().toString(),        // 年
        'M+': (this.getMonth() + 1).toString(),     // 月
        'd+': this.getDate().toString(),            // 日
        'h+': this.getHours().toString(),           // 时
        'm+': this.getMinutes().toString(),         // 分
        's+': this.getSeconds().toString(),          // 秒
        'S': this.getMilliseconds().toString()          // 毫秒
    };
    for (const key in option) {
        ret = new RegExp('(' + key + ')').exec(format);
        if (ret) {
            format = format.replace(ret[1], (ret[1].length == 1) ? (option[key]) : (option[key].padStart(ret[1].length, '0')));
        };
    };
    return format;
};