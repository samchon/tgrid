export namespace StringUtil
{
    export function numberFormat(val: number, precision: number = 2): string
    {
        if (val >= 10000000)
        {
            let multiplier: number = Math.floor(Math.log10(val));

            return `${StringUtil.numberFormat(val / Math.pow(10, multiplier), precision)} X 10^${multiplier}`;
        }

        let str: string = "";

        // FIRST, DO ROUND-OFF
        val = Math.round(val * Math.pow(10, precision));
        val = val / Math.pow(10, precision);

        // SEPERATE NUMBERS
        let is_negative: boolean = (val < 0);
        let natural: number = Math.floor(Math.abs(val));
        let fraction: number = Math.abs(val) - Math.floor(Math.abs(val));

        // NATURAL NUMBER
        if (natural === 0)
            str = "0";
        else
        {
            // NOT ZERO
            let cipher_count = Math.floor(Math.log(natural) / Math.log(10)) + 1;

            for (let i: number = 0; i <= cipher_count; i++)
            {
                let cipher: number = Math.floor(natural % Math.pow(10, i + 1));
                cipher = Math.floor(cipher / Math.pow(10, i));

                if (i === cipher_count && cipher === 0)
                    continue;

                // IS MULTIPLIER OF 3
                if (i > 0 && i % 3 === 0)
                    str = "," + str;

                // PUSH FRONT TO THE STRING
                str = cipher + str;
            }
        }

        // NEGATIVE SIGN
        if (is_negative === true)
            str = "-" + str;

        // ADD FRACTION
        if (precision > 0 && fraction !== 0)
        {
            fraction = Math.round(fraction * Math.pow(10, precision));
            let zeros: number = precision - Math.floor(Math.log(fraction) / Math.log(10)) - 1;

            str += "." + StringUtil.repeat("0", zeros) + fraction;
        }
        return str;
    }

    export function repeat(str: string, n: number): string
    {
        let ret: string = "";
        for (let i: number = 0; i < n; i++)
            ret += str;

        return ret;
    }
}