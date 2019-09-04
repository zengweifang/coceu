import React, { PureComponent, Fragment } from 'react';
import { Form, Input, Button, message } from 'antd';
import { MAIL_REGEX } from 'utils/constants';
import { setLocalStorage, isPC } from 'utils';
import NoCaptcha from 'components/NoCaptcha';
import request from 'utils/request';

const FormItem = Form.Item;

class EditMail extends PureComponent {
  state = {
    number: 59,
    disabled: false,
    appKey: '',
    token: '',
    ncData: '',
    nc: '',
    scene: isPC() ? 'nc_register' : 'nc_register_h5'
  };

  componentWillUnmount() {
    clearInterval(this.timer);
  }

  //绑定邮箱
  mobileBinder = (mail, code) => {
    request('/user/binderEmail', {
      body: { mail, code }
    }).then(json => {
      if (json.code === 10000000) {
        const { localization, account, dispatch } = this.props;
        message.success(localization['绑定邮箱成功']);
        account.mail = mail;
        dispatch({
          type: 'global/save',
          payload: { account }
        });
        setLocalStorage('account', account);
        this.props.onFold();
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

  sendMailCode = mail => {
    const { localization } = this.props;
    const { appKey, ncData, token, scene } = this.state;
    const { csessionid, sig } = ncData;

    request(`/mail/sendCode`, {
      body: {
        sig,
        mail,
        scene,
        appKey,
        source: 'pc',
        vtoken: token,
        type: 'binder',
        sessionId: csessionid
      }
    }).then(json => {
      if (json.code === 10000000) {
        message.success(localization[json.msg]);
      }
    });
  };

  // 点击绑定邮箱
  getMailCode = () => {
    const { localization, form } = this.props;
    const mail = form.getFieldValue('mail');
    const { ncData, nc, disabled } = this.state;
    if (MAIL_REGEX.test(mail)) {
      if (ncData && !disabled) {
        this.sendMailCode(mail);
        this.countDown();
        if (nc) {
          nc.reload();
          this.setState({ ncData: '' });
        }
      } else {
        if (!disabled) {
          this.props.form.setFields({
            noCaptche: {
              errors: [new Error(localization['请进行滑动验证'])]
            }
          });
        }
      }
    } else {
      const { localization } = this.props;
      this.props.form.setFields({
        mail: {
          errors: [new Error(localization['邮箱格式不正确'])]
        }
      });
    }
  };

  handleSubmit = e => {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (!err) {
        const { mail, code } = values;
        this.mobileBinder(mail, code);
      }
    });
  };

  //滑动验证
  ncLoaded = (appKey, token, ncData, nc) => {
    if (ncData) {
      this.setState({ appKey, token, ncData, nc });
      this.props.form.setFields({
        noCaptche: {
          errors: null
        }
      });
    }
  };

  render() {
    const { localization, viewport, form } = this.props;
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

    const { disabled, number, scene } = this.state;

    return (
      <Fragment>
        <Form onSubmit={this.handleSubmit}>
          <FormItem {...formItemLayout} label={localization['邮箱']}>
            {getFieldDecorator('mail', {
              rules: [
                { required: true, message: localization['请输入邮箱'] },
                { pattern: MAIL_REGEX, message: localization['邮箱格式不正确'] }
              ],
              validateTrigger: 'onBlur'
            })(<Input size="large" />)}
          </FormItem>
          <FormItem {...formItemLayout} label={localization['滑动验证']}>
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
          <FormItem {...tailFormItemLayout}>
            <Button type="primary" size="large" htmlType="submit">
              {localization['确定']}
            </Button>
          </FormItem>
        </Form>
      </Fragment>
    );
  }
}
export default Form.create()(EditMail);
