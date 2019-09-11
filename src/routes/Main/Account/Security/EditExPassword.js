import React, { PureComponent } from 'react';
import { connect } from 'dva';
import cloneDeep from 'lodash/cloneDeep';
import { Form, Input, Button, message } from 'antd';
import { PUBLI_KEY, PWD_REGEX } from 'utils/constants';
import request from 'utils/request';
import { setLocalStorage, encryptPassword, encryptExPassword } from 'utils';
import JSEncrypt from 'utils/jsencrypt.js';
// import { getLocalStorage } from 'utils';
import NoCaptcha from 'components/NoCaptcha';
import { isPC } from 'utils';
import { appKey } from 'utils/constants.js';

const FormItem = Form.Item;
// const account = getLocalStorage('account') || {};

@connect()
class EditExPassword extends PureComponent {
  state = {
    confirmDirty: false,
    disabled: false,
    number: 59,
    scene: isPC() ? 'nc_register' : 'nc_register_h5',
    ncData:'',
    password:'',
    password_again: ''
  };
  

  componentWillUnmount() {
    clearInterval(this.timer);
  }

  handleSubmit = e => {
    e.preventDefault();
    const that = this;
    const { account } = this.props;
    this.props.form.validateFields((err, values) => {
      if (!err) {
        const { exPassword, code } = values;

        let enExPassword = encryptExPassword(exPassword);

        request('/user/updateExPassword', {
          method: 'POST',
          body: {
            exPassword: enExPassword,
            code,
            exValidType : account.mobile ? '0' : '1'
          }
        }).then(json => {
          if (json.code === 10000000) {
            const { localization, account: acountProp, dispatch } = that.props;
            message.success(localization['设置交易密码成功']);
            const account = cloneDeep(acountProp);

            account.exPassword = true;
            dispatch({
              type: 'global/save',
              payload: { account }
            });
            setLocalStorage('account', account);
            that.props.onFold();
          }
        });
      }
    });
  };

  comparePassword = (rule, value, callback) => {
    const { localization, form } = this.props;
    if (value && value !== form.getFieldValue('exPassword')) {
      callback(localization['两次密码不一致']);
    } else {
      callback();
    }
  };

  handleConfirmBlur = e => {
    const value = e.target.value;
    this.setState({ confirmDirty: this.state.confirmDirty || !!value });
  };

  validateToNextPassword = (rule, value, callback) => {
    const form = this.props.form;
    if (value && this.state.confirmDirty) {
      form.validateFields(['confirm'], { force: true });
    }
    callback();
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
    this.sendMobileSms();
    this.countDown();
  };

    // 发送邮箱验证码
    sendMailCode = () => {
      const { localization } = this.props;
  
      request(`/user/mail/sendMail`, {
        body: {
          smsType: 'ex_password'
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
            smsType: 'ex_password',
            vaildCodeKey: vaildCodeKey,
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

  inputValue = e => {
    this.setState({
      password: e.target.value
    })
  };

  inputValueAgain = e => {
    this.setState({
      password_again: e.target.value
    })
  };

  render() {
    const { localization, viewport, form, account } = this.props;
    const { getFieldDecorator } = form;

    let formItemLayout = {};
    let tailFormItemLayout = {};

    if (viewport.width > 767) {
      formItemLayout = {
        labelCol: {
          span: 6
        },
        wrapperCol: {
          span: 10
        }
      };
      tailFormItemLayout = {
        wrapperCol: {
          span: 10,
          offset: 6
        }
      };
    }

    const { disabled, number, scene, password_again, password, ncData } = this.state;

    return (
      <Form onSubmit={this.handleSubmit}>
        <Input style={{ display: 'none' }} type="password" />
        <FormItem {...formItemLayout} label={localization['资金密码']}>
          {getFieldDecorator('exPassword', {
            rules: [
              { required: true, message: localization['请输入资金密码'] },
              {
                pattern: /^\d{6}$/,
                message: localization['请输入6位数字资金密码']
              },
              { validator: this.validateToNextPassword }
            ],
            validateTrigger: 'onBlur'
          })(<Input size="large" type="password" placeholder={localization['输入6位数字']} id="password" onChange={this.inputValue} />)}
        </FormItem>
        <FormItem {...formItemLayout} label={localization['确认资金密码']}>
          {getFieldDecorator('confirm', {
            rules: [
              { required: true, message: localization['请再次输入资金密码'] },
              { validator: this.comparePassword }
            ],
            validateTrigger: 'onBlur'
          })(
            <Input
              size="large"
              type="password"
              placeholder={localization['输入6位数字']}
              onBlur={this.handleConfirmBlur}
              id="password_again" onChange={this.inputValueAgain}
            />
          )}
        </FormItem>
        {/* <FormItem {...formItemLayout} label={localization['登录密码']}>
          {getFieldDecorator('password', {
            rules: [
              { required: true, message: localization['请输入登录密码'] },
              {
                pattern: PWD_REGEX,
                message: localization['输入8-20位密码包含数字，字母']
              }
            ],
            validateTrigger: 'onBlur'
          })(<Input size="large" type="password" placeholder={localization['请输入登录密码']} />)}
        </FormItem> */}
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
          <FormItem {...formItemLayout} label={localization['短信验证码']} className="code-row">
            {getFieldDecorator('code', {
              rules: [
                { required: true, message: localization['请输入手机验证码'] },
                { pattern: /^\d{6}$/, message: localization['请输入6位数字验证码'] }
              ],
              validateTrigger: 'onBlur'
            })(
              <div className="form-code">
                <Input size="large" placeholder={localization['短信验证码']} />
                <Button onClick={this.getMobileCode} type="primary" size="large" disabled={disabled || !password || !password_again || !ncData}>
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
                <Input size="large"/>
                <Button onClick={this.getMailCode} type="primary" size="large" disabled={disabled}>
                  {!disabled ? localization['获取验证码'] : number + 's'}
                </Button>
              </div>
            )}
          </FormItem>
        }
        <FormItem {...tailFormItemLayout}>
          <Button type="primary" size="large" htmlType="submit" onClick={this.handleSubmit}>
            {localization['确定']}
          </Button>
        </FormItem>
      </Form>
    );
  }
}

export default Form.create()(EditExPassword);
