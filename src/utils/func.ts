import User from "../model/user.model";


/**
 * @function {Funtion} translteBanglaToEngNum - English To Bangla Converter
 * @function {Funtion} validation_number - Check Phone Number Valid or invalid true/false
 * @function {function} billing_UID_GEN - Random UID gen
 */
const translteBanglaToEngNum = async (num_str: any) => {
    var bengali = { "০": 0, "১": 1, "২": 2, "৩": 3, "৪": 4, "৫": 5, "৬": 6, "৭": 7, "৮": 8, "৯": 9 };
    var changed_nun = '';
    await num_str?.toString()?.split('').forEach((item: any) => {
        //@ts-ignore
        if (isNaN(item)) { changed_nun += bengali[item]; } else { changed_nun += item; }
    });
    return changed_nun;
}
const isValidNumber = async (value: any) => {
    /**
  * valid number method return 3 with actual input
  * @param  {Boolean} valid_number
  * @param  {true} {return{isValid
  * @param  {value};}else{return{isValid:false} phone
  * @param  {value};}} phone
  * @returns {Object} return false when not valid
  * When value not number then try to convert bangla to english number
  */
    if (isNaN(value)) {
        /**
         * @param  {function} value Bangla To English Converter
         */
        value = await translteBanglaToEngNum(value);
    }
    /**
     * Regular expression to validate number
     * @param  {String} /(^([+]{1}[8]{2}|0088)?(01){1}[3-9]{1}\d{8})$/
     */
    let re = /(^([+]{1}[8]{2}|0088)?(01){1}[3-9]{1}\d{8})$/;
    let valid_number = re.test(value);

    if (valid_number) {
        return {
            isValid: true,
            phone: value
        };
    } else {
        return {
            isValid: false,
            phone: value
        };
    }
}
/**
 * @param  {String} length
 * @param  {String} id
 * @param  {function} billing_UID_GEN Gen Random UID
 */
const billing_UID_GEN = async (length: number, id: any) => {
    /**
     * @param  {String} s UID Gen Unique
     */
    for (var s = ''; s.length < length; s += `${id}abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ01 ${Date.now()}`.charAt(Math.random() * 62 | 0));
    return s;
}

/**
 * Email Checking.
 * @param  {String} elementValue value of Email
 * @function 
 * @returns {String} emailPattern Email Return value true/false
 */
const isValidEmail = (elementValue: string): Boolean => {
    const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    return emailPattern.test(elementValue);
}
/**
 * @param  {String} password
 * @function 
 * @returns {String} re Password Return String
 */
const isValidPassword = (password: string): Boolean => {
    var re = /^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z]).{8,}$/;
    return re.test(password);
}
export { isValidNumber, billing_UID_GEN, isValidEmail, isValidPassword }