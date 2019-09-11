import React, { Component } from 'react';
import { Form, Input, Modal, message, Button } from 'antd';
import request from 'utils/request';
import { getLocalStorage } from 'utils';
import JSEncrypt from 'utils/jsencrypt.js';
import { PUBLI_KEY } from 'utils/constants';
import NoCaptcha from 'components/NoCaptcha';
import { isPC } from 'utils';
import { appKey } from 'utils/constants.js';

const FormItem = Form.Item;

const account = getLocalStorage('account') || {};
console.log(account.mobile);
class Validate extends Component {
  constructor(props) {
    super(props);
    this.state = {
      googleCode: '',
      number: 59,
      disabled: false,
      scene: isPC() ? 'nc_register' : 'nc_register_h5',
      ncData:''
    };
  }

  componentWillUnmount() {
    if(this.timer) {
      clearInterval(this.timer);
    }
  }

  handleOk = () => {
    this.props.form.validateFields((err, values) => {
      if (!err) {
        const { localization, id } = this.props;
        const { code } = values;
        if (/^\d{6}$/.test(code) && code) {
          this.validate({
            id,
            code,
            callback: json => {
              if (json.code === 10000000) {
                let { okClick } = this.props;
                okClick();
              } else {
                message.info(json.msg);
              }
            }
          });
        } else {
          message.info(localization['请输入6位数字验证码']);
        }
      }
    });

  };

  //发送手机短信
  sendMobileSms = () => {
    const { localization } = this.props;
    const { token, ncData, scene } = this.state;
    const { csessionid, sig } = ncData;
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
          method: 'POST',
          body: {
            smsType: 'ex_mobile',
            vaildCodeKey:vaildCodeKey,
            appKey,
            sessionId: csessionid,
            sig,
            vtoken: token,
            scene
          }
        }).then(json => {
          if (json.code === 10000000) {
            message.success(localization['发送短信成功']);
          }
        });
      }
    });
  };

  countDown = () => {
    this.setState({
      disabled: true
    });
    this.timer = setInterval(() => {
      let { number } = this.state;
      if (number === 0) {
        clearInterval(this.timer);
        this.setState({
          number: 59,
          disabled: false
        });
      } else {
        this.setState({ number: number - 1 });
      }
    }, 1000);
  };

  // 获取手机验证码
  getMobileCode = () => {
    const { disabled } = this.state;
    if(!disabled) {
      this.sendMobileSms();
      this.countDown();
    }
  };

  handleCancel = () => {
    this.setState({ googleCode: '' });
    let { cancelClick } = this.props;
    cancelClick();
  };

  googleChange = e => {
    if (/^\d{0,6}$/.test(e.target.value)) {
      this.setState({ googleCode: e.target.value });
    }
  };

  validate = ({ id, code,  callback }) => {
    request('/user/validWithdraw', {
      method: 'POST',
      body: {
        id,
        code,
        exValidType: account.mobile ? 0 : 1
      }
    }).then(json => {
      callback(json);
    });
  };
  // 发送邮箱验证码
  sendMailCode = () => {
    const { localization } = this.props;

    request(`/user/mail/sendMail`, {
      body: {
        smsType: 'ex_mail'
      }
    }).then(json => {
      if (json.code === 10000000) {
        message.success(localization[json.msg]);
      }
    });
  };

  // 点击绑定邮箱
  getMailCode = () => {
    const {  disabled } = this.state;

    if (!disabled) {
      this.sendMailCode();
      this.countDown();
    }
  };

  //滑动验证
  ncLoaded = (appKey, token, ncData, nc) => {
    console.log(ncData);
    if (ncData) {
      this.setState({ token, ncData, nc, ncData1:ncData});
      this.props.form.setFields({
        noCaptche: {
          errors: null
        }
      });
    }
  };

  render() {
    const { localization, form, viewport } = this.props;
    const { getFieldDecorator } = form;

    const { disabled, number, scene, ncData } = this.state;

    let formItemLayout = {};

    if (viewport.width > 767) {
      formItemLayout = {
        labelCol: {
          span: 6
        },
        wrapperCol: {
          span: 18
        }
      };
    }

    return (
      <Modal
        visible
        centered
        title={localization['提币验证']}
        maskClosable={false}
        width={400}
        onOk={this.handleOk}
        onCancel={this.handleCancel}
        cancelText={localization['取消']}
        okText={localization['确定']}
      >
        <div style={{ marginTop: 20 }}>
        <Form>
          {
            account.mobile ? 
            <div>
              <FormItem  {...formItemLayout} label={localization['滑动验证']}>
                {/* <div>{localization['滑动验证']}</div> */}
                {getFieldDecorator('noCaptche')(
                  <NoCaptcha
                    domID="nc_register_mobile"
                    scene={scene}
                    ncCallback={(appKey, token, ncData, nc) => {
                      this.ncLoaded(appKey, token, ncData, nc);
                    }}
                  />
                )}
              </FormItem>
              <FormItem {...formItemLayout} label={localization['短信验证码']}>
                {getFieldDecorator('code', {
                  rules: [
                    { required: true, message: localization['请输入手机验证码'] },
                    {
                      pattern: /^\d{6}$/,
                      message:  localization['请输入6位数字验证码']
                    }
                  ],
                  validateTrigger: 'onBlur'
                })(
                <div className="form-code">
                  <Input size="large" placeholder={localization['短信验证码']} />
                  <Button onClick={this.getMobileCode} type="primary" size="large" disabled={disabled || !ncData}>
                    {!disabled ? localization['获取验证码'] : number + 's'}
                  </Button>
                </div>
                )}
              </FormItem>
            </div>
             :
            <FormItem {...formItemLayout} label={localization['邮箱验证码']}>
              {getFieldDecorator('code', {
                rules: [
                  { required: true, message: localization['请输入邮箱验证码'] },
                  {
                    pattern: /^\d{6}$/,
                    message: localization['请输入6位数字验证码']
                  }
                ],
                validateTrigger: 'onBlur'
              })(
                <div className="form-code">
                  <Input size="large" />
                  <Button onClick={this.getMailCode} type="primary" size="large" disabled={disabled}>
                    {!disabled ? localization['获取验证码'] : number + 's'}
                  </Button>
                </div>
              )}
            </FormItem>
          }
        </Form>
        </div>
      </Modal>
    );
  }
}

export default Form.create()(Validate);
