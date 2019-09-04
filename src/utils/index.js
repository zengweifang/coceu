import JSEncrypt from './jsencrypt.js';
import { PUBLI_KEY, PWD_REGEX } from './constants';
/*
 * @author William Cui
 * @description 数字不够位数前面自动补零
 * @param number {number} 需要格式化的数字
 * @param n {number} 需要格式化成的位数
 * @returns {string} 格式化后的字符串
 */
export function fillZero(number, n) {
  return (number + '').padStart(n, 0);
  // return (Array(n).join(0) + number).slice(-n);
}

/*
* @author William Cui
* @description 根据后端返回的时间戳格式化成指定的格式
* @param timestamp {number} 需要格式化的时间戳
* @param pattern {string} 指定的格式字符串 默认是'YYYY-MM-DD hh:mm:ss'
* @returns {string} 格式化后的日期时间字符串
Y: 代表年份， M: 代表月份， D: 代表一个月中的第几天， h: 代表小时， m: 代表分, s: 代表秒
*/
export function stampToDate(timestamp, pattern = 'YYYY-MM-DD hh:mm:ss') {
  const date = new Date(timestamp);
  const dateObj = {
    Y: date.getFullYear(),
    M: date.getMonth() + 1,
    D: date.getDate(),
    h: date.getHours(),
    m: date.getMinutes(),
    s: date.getSeconds()
  };
  return pattern.replace(/\w+/g, match => {
    return fillZero(dateObj[match[0]], match.length);
  });
}

/*
 * @author William Cui
 * @description 把日期字符串转成时间戳
 * @param dateStr {string} 需要格式化的日期字符串
 * @returns {number} 时间戳
 */
export function dateToStamp(dateStr) {
  return new Date(dateStr).getTime();
}

/*
 * @author William Cui
 * @description 根据URL参数名获取参数值
 * @param name {string} 参数名
 * @returns value {string} 参数值
 */
export function getQueryString(name) {
  var reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)', 'i');
  var r = window.location.search.substr(1).match(reg);
  if (r !== null) return decodeURI(r[2]);
  return null;
}

/*
 * @author William Cui
 * @description 判断对象或者数组是否为空
 * @param obj {object || array} 对象或数组
 * @returns  {boolean}
 */
export function isEmpty(obj) {
  for (let item in obj) {
    return false;
  }
  return true;
}

/*
 * @author William Cui
 * @description 解析json字符串，解析成功返回json对象，不成功返回false
 * @param str {string} json字符串
 * @returns  {boolean}
 */
export function parseJSON(str) {
  try {
    return JSON.parse(str);
  } catch (error) {}
  return false;
}

/*
 * @author William Cui
 * @description 设置localStorage
 * @param name {string} 名称
 * @param value {anyType} 值
 */
export function setLocalStorage(name, value) {
  if (typeof value === 'object') {
    value = JSON.stringify(value);
  }
  localStorage.setItem(name, value);
}

/*
 * @author William Cui
 * @description 读取localStorage
 * @param name {string} 名称
 * @return value {anyType} 值
 */
export function getLocalStorage(name) {
  const value = localStorage.getItem(name);
  return parseJSON(value) || value;
}

/*
 * @author William Cui
 * @description 设置sessionStorage
 * @param name {string} 名称
 * @param value {anyType} 值
 */
export function setSessionStorage(name, value) {
  if (typeof value === 'object') {
    value = JSON.stringify(value);
  }
  sessionStorage.setItem(name, value);
}

/*
 * @author William Cui
 * @description 读取sessionStorage
 * @param name {string} 名称
 * @return value {anyType} 值
 */
export function getSessionStorage(name) {
  const value = sessionStorage.getItem(name);
  return parseJSON(value) || value;
}

// 判断手机和电脑
export function isPC() {
  return !/(phone|pad|pod|iPhone|iPod|ios|iPad|Android|Mobile|BlackBerry|IEMobile|MQQBrowser|JUC|Fennec|wOSBrowser|BrowserNG|WebOS|Symbian|Windows Phone)/i.test(
    window.navigator.userAgent
  );
}

// 判断是否是微信浏览器的函数
export function isWechat() {
  return /MicroMessenger/i.test(window.navigator.userAgent);
}

// 将科学计数法转换为小数
export function toNonExponential(num, n) {
  num = Number(num).toFixed(n + 1);
  return num.slice(0, num.length - 1);
}

/**
 * 加密登录密码
 *
 * @export
 * @param {*} password
 * @returns
 */
export function encryptPassword(password) {
  let encrypt = new JSEncrypt();
  encrypt.setPublicKey(PUBLI_KEY);
  return encrypt.encrypt(password);
}

/**
 * 加密交易密码
 *
 * @export
 * @param {*} password
 * @returns
 */
export function encryptExPassword(password) {
  const encrypt = new JSEncrypt();
  encrypt.setPublicKey(PUBLI_KEY);
  return encrypt.encrypt(password);
}
