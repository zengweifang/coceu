import React, { PureComponent } from 'react';
import { message, Modal, Button, Input } from 'antd';
import request from 'utils/request';
import JSEncrypt from 'utils/jsencrypt.js';
import { PUBLI_KEY } from 'utils/constants';

class CodeValid extends PureComponent {
  state = {
    code: '',
    number: 90,
    disabled: false
  };

  handleCancel = () => {
    const { closePopup } = this.props;
    closePopup && closePopup();
  };

  handleOk = () => {
    const { localization, closePopup } = this.props;
    const { code } = this.state;
    if (/^\d{6}$/.test(code)) {
      request('/user/googleValid', {
        body: { code }
      }).then(json => {
        if (json.code === 10000000) {
          message.success(json.msg);
          closePopup && closePopup();
        }
      });
    } else {
      message.warn(localization['请输入验证码']);
    }
  };

  //发送手机短信
  sendMobileSms = () => {
    request('/user/vaildCode/numRandom',{
      method: 'GET'
    }).then(res => {
      if (res.code === 10000000) {
        var numCode = res.data.numCode;
        var key  = numCode+'QsRA!2586@FdkG';
        let encrypt = new JSEncrypt();
        encrypt.setPublicKey(PUBLI_KEY);
        let vaildCodeKey = encrypt.encrypt(key);
        request('/user/mobile/sendMobileSms', {
          body: {
            smsType: 'ex_mobile',
            vaildCodeKey:vaildCodeKey
          }
        }).then(json => {
          if (json.code === 10000000) {
            this.countDown();
            message.success(this.props.localization[json.msg]);
          }
        });
      }
    });
  };

  getCode = () => {
    const { exValidType } = this.props.account;
    if (exValidType === 3) {
      this.sendMobileSms();
    } else if (exValidType === 4) {
      this.sendMail();
    }
  };

  countDown = () => {
    this.setState({ disabled: true });
    this.timer = setInterval(() => {
      let { number } = this.state;
      if (number === 0) {
        clearInterval(this.timer);
        this.setState({
          number: 90,
          disabled: false
        });
      } else {
        this.setState({ number: number - 1 });
      }
    }, 1000);
  };

  //发送邮箱验证码
  sendMail = () => {
    request('/user/mail/sendMail', {
      body: {
        smsType: 'ex_mail'
      }
    }).then(json => {
      if (json.code === 10000000) {
        this.countDown();
        message.success(this.props.localization[json.msg]);
      }
    });
  };

  codeOnchange = e => {
    this.setState({ code: e.target.value });
  };

  render() {
    const { localization, account } = this.props;
    const { code, disabled, number } = this.state;
    const { exValidType } = account;
    const title = exValidType === 3 ? '手机验证' : '邮箱验证';
    return (
      <Modal
        title={localization[title]}
        visible
        centered
        maskClosable={false}
        width={400}
        onCancel={this.handleCancel}
        onOk={this.handleOk}
        cancelText={localization['取消']}
        okText={localization['确定']}
      >
        <div>
          <div style={{ display: 'flex' }}>
            <Input
              size="large"
              value={code}
              style={{ borderTopRightRadius: 0, borderBottomRightRadius: 0 }}
              placeholder={localization[`请输入${title}码`]}
              onChange={this.codeOnchange}
            />
            <Button
              disabled={disabled}
              onClick={this.getCode}
              type="primary"
              size="large"
              style={{ width: 120, borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }}
            >
              {!disabled ? localization['获取验证码'] : number + 'S'}
            </Button>
          </div>
        </div>
      </Modal>
    );
  }
}

export default CodeValid;
