// const IMAGES_ADDRESS = 'https://images.ckex.com';
// const WS_ADDRESS = 'wss://api.bbex.one';
// eco  www.ecoexc.com
// ues www.uescoin.com

// 密码正则表达式
export const PWD_REGEX = /^(?![0-9]+$)(?![a-zA-Z]+$)[0-9A-Za-z]{8,20}$/;

// 邮箱正则
export const MAIL_REGEX = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/;

//手机正则
export const MOBILE_REGEX = /^1[3456789][0-9]{9}$/;

// 公钥
export const PUBLI_KEY =
  'MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCLADJL0WYJJrxmpNqKeoAXhW8P0GWMy7ZJG/I+8CwLZ2we83VnHcF4zXfpWrw3zY4RIYkFQT8EkW7FUDFeY9XzoxoQbcjyG3ywIzN6SI+7Jd07TGktNTTxFR6Bj4IjzAlazitFlUKAP77AyhT65YDChbNRul8u6M5qqt/ojjGb1QIDAQAB';

// 地址配置
const { protocol, host } = window.location;

// after modify test
// const protocol= window.location.protocol;
// const host = 'www.coceu.com';

export const IMAGES_ADDRESS =
  process.env.NODE_ENV === 'production'
    ? `${protocol}//${
        host.indexOf('www') === -1 ? `images.${host}` : host.replace('www', 'images')
      }`
    : ''; // 图片上传地址
export const IMAGES_URL = 'https://use-images.oss-cn-shenzhen.aliyuncs.com'; // 图片显示地址
export const WS_PREFIX = `${protocol.replace('http', 'ws')}//${host}/biao/websocket`;
export const IM_PREFIX = `${protocol.replace('http', 'ws')}//${host}/biao/im`;
console.log(WS_PREFIX, IM_PREFIX);

//阿里 滑动验证 appKey
// export const appKey = 'FFFF0N00000000006AD1';
// export const appKey = 'FFFF0N000000000081D7'; // 测试
// export const appKey = 'FFFF0N0000000000845D'; // 线上
export const appKey = host === 'www.mgex.co' ? 'FFFF0N0000000000845D' : 'FFFF0N000000000081D7';
