//增加金额格式化配置
interface Number {
    /**
     * 格式化金额
     * @param {string} money 金额数值，支持正负整/小数
     * @returns {string} 格式化后的金额
     */
    formatAsMoney: () => string
}

Number.prototype.formatAsMoney = function (): string {
    const money = this.toString();
    //此时money是字符串
    const match = money.match(/^(-?[0-9]+)(.[0-9]+)?$/);
    if (match && match[1]) {
        const integer = `${match[1]}`;
        const decimalNum = `0${match[2] || '.00'}`;
        const decimal = ((Math.round(parseFloat(decimalNum) * 100) / 100).toFixed(2)).slice(1);

        const integerArray = integer.split('').reverse();
        const formatIntegerArray = [];
        for (let A = 0; A < integerArray.length; ++A) {
            formatIntegerArray.push(integerArray[A]);
            //不是首位，下一位不是-，每三个数字加一个逗号
            if (A + 1 != integerArray.length && integerArray[A + 1] != '-' && (A + 1) % 3 == 0) {
                formatIntegerArray.push(',');
            }
        }

        return formatIntegerArray.reverse().join('') + decimal;
    }
    else {
        //整数部分都不存在，异常
        return '0.00';
    }
}


// console.log(123.125.formatAsMoney()); // 123.13
// console.log(123.12312312312.formatAsMoney()); // 123.12
// console.log((-123.124).formatAsMoney()); // -123.13
// console.log(12312312.3.formatAsMoney()); // 12,312,312.30
// console.log((-121123.126).formatAsMoney()); // -121,123.13
// console.log(0.7.formatAsMoney()); // 0.70
// console.log(0.0.formatAsMoney()); // 0.00
// console.log(1.0.formatAsMoney()); // 1.00
// console.log(1.01.formatAsMoney()); // 1.01