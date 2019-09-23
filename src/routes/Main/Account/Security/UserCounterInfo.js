import React, { PureComponent } from 'react';
import { Input, Button, Icon, message } from 'antd';
import classnames from 'classnames';
import QRCode from 'qrcode.react';
import { setLocalStorage } from 'utils';
import request from 'utils/request';

class UserCounterInfo extends PureComponent {
//   // 获取当前用户国家和区号
//   getCounterInfo = () => {
//     request('/user/sysdict/countryCode', {
//       method: 'GET'
//     }).then(json => {
//       if (json.code === 10000000) {
//         console.log(json);
//         this.setState({
//             countryCode: json.data
//         })
//       }
//     });
//   };

  saveUserCountryInfo = (item) => {
    request('/user/sysdict/saveUserCountryInfo', {
        method: 'POST',
        body:{
            countrySysid:item.id,
            countrySyscode:item.value,
            countrySysname:item.label
        }
      }).then(json => {
        if (json.code === 10000000) {
          message.info(json.msg);
          localStorage.setItem('countrySyscode', item.value);
          localStorage.setItem('countrySysname', item.label);
          this.props.onFold();
        }
      });
  }

  render() {
    var code = JSON.parse(localStorage.getItem('countryCode'));
    var countryCode = code ? code : [];
    console.log(countryCode);
    return (
        <ul style={{ height: '300px', overflowY: 'scroll' }}>
        {
            countryCode.map(item =>{
                return (
                    <li style={{lineHeight:'30px', cursor: 'pointer'}} onClick={this.saveUserCountryInfo.bind(this, item)}>{item.label}</li>
                )
            }
          )
        }
    </ul>
    );
  }
}

export default UserCounterInfo;
