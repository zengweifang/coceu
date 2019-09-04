import React, { PureComponent } from 'react';
import cloneDeep from 'lodash/cloneDeep';
import { Form, Input, Button, message } from 'antd';
import { MOBILE_REGEX } from 'utils/constants';
import { setLocalStorage } from 'utils';
import request from 'utils/request';
import JSEncrypt from 'utils/jsencrypt.js';
import { PUBLI_KEY} from 'utils/constants';

const FormItem = Form.Item;

class BindMobile extends PureComponent {
  state = {
    number: 59,
    disabled: false
  };

  componentWillUnmount() {
    clearInterval(this.timer);
  }

  //获取手机短信码
  sendMobileSms = mobile => {
    request('/user/vaildCode/numRandom',{
      method: 'GET'
    }).then(res => {
      if (res.code === 10000000) {
        var numCode = res.data.numCode;
        var key  = numCode+'QsRA!2586@FdkG';
        let encrypt = new JSEncrypt();
        encrypt.setPublicKey(PUBLI_KEY);
        let vaildCodeKey = encrypt.encrypt(key);
        request('/user/sendMobileSms', { body: { mobile,vaildCodeKey } });
      }
    });
    
  };

  //绑定手机号
  mobileBinder = (mobile, code) => {
    request('/user/mobileBinder', {
      body: { mobile, code }
    }).then(json => {
      if (json.code === 10000000) {
        const { localization, account: accountProp, dispatch } = this.props;
        message.success(localization['绑定手机号成功']);
        const account = cloneDeep(accountProp);
        account.mobile = mobile;
        dispatch({
          type: 'global/save',
          payload: { account }
        });
        setLocalStorage('account', account);
        this.props.onFold();
      }
    });
  };

  // 点击绑定手机
  getMobileCode = () => {
    const { localization, form } = this.props;
    const mobile = form.getFieldValue('mobile');
    if (MOBILE_REGEX.test(mobile)) {
      this.sendMobileSms(mobile);
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
    } else {
      message.info(localization['请输入正确的手机号']);
    }
  };

  handleSubmit = e => {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (!err) {
        const { mobile, code } = values;
        this.mobileBinder(mobile, code);
      }
    });
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

    const { disabled, number } = this.state;

    return (
      <Form onSubmit={this.handleSubmit}>
        <FormItem {...formItemLayout} label={localization['手机号']}>
          {getFieldDecorator('mobile', {
            rules: [
              { required: true, message: localization['请输入手机号'] },
              { pattern: MOBILE_REGEX, message: localization['手机号不正确'] }
            ],
            validateTrigger: 'onBlur'
          })(
            <div className="form-code">
              <Input size="large" />
              <Button onClick={this.getMobileCode} type="primary" size="large" disabled={disabled}>
                {!disabled ? localization['获取验证码'] : number + 's'}
              </Button>
            </div>
          )}
        </FormItem>
        <FormItem {...formItemLayout} label={localization['短信验证码']}>
          {getFieldDecorator('code', {
            rules: [
              { required: true, message: localization['请输入手机验证码'] },
              { pattern: /^\d{6}$/, message: localization['请输入6位数字验证码'] }
            ],
            validateTrigger: 'onBlur'
          })(<Input size="large" />)}
        </FormItem>
        <FormItem {...tailFormItemLayout}>
          <Button type="primary" size="large" htmlType="submit" onClick={this.handleSubmit}>
            {localization['确定']}
          </Button>
        </FormItem>
      </Form>
    );
  }
}
export default Form.create()(BindMobile);
