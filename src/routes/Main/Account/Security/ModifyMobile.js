import React, { PureComponent } from 'react';
import { Form, Input, Button, message } from 'antd';
import { MOBILE_REGEX } from 'utils/constants';
import { setLocalStorage } from 'utils';
import request from 'utils/request';
import JSEncrypt from 'utils/jsencrypt.js';
import { PUBLI_KEY} from 'utils/constants';

const FormItem = Form.Item;

class ModifyMobile extends PureComponent {
  state = {
    number: 59,
    disabled: false,
    newnumber: 59,
    newdisabled: false
  };

  componentWillUnmount() {
    clearInterval(this.timer);
    clearInterval(this.newtimer);
  }

  //获取手机短信码
  sendMobileSms = mobile => {
    const { localization } = this.props;

    request('/user/vaildCode/numRandom',{
      method: 'GET'
    }).then(res => {
      if (res.code === 10000000) {
        var numCode = res.data.numCode;
        var key  = numCode+'QsRA!2586@FdkG';
        let encrypt = new JSEncrypt();
        encrypt.setPublicKey(PUBLI_KEY);
        let vaildCodeKey = encrypt.encrypt(key);
        request('/user/updateMobileSms', {
          body: { mobile,vaildCodeKey }
        }).then(json => {
          if (json.code === 10000000) {
            message.success(localization['发送短信成功']);
          }
        });
      }
    });
  };

  //更新手机号
  mobileChangeSubmit = (oldCode, newMobile, newCode) => {
    request('/user/updateUserMobile', {
      body: {
        oldCode,
        newMobile,
        newCode
      }
    }).then(json => {
      if (json.code === 10000000) {
        const { localization, account, dispatch } = this.props;
        message.success(localization['更换手机号成功']);
        account.mobile = newMobile;
        dispatch({
          type: 'global/save',
          payload: { account }
        });
        setLocalStorage('account', account);
      }
    });
  };

  // 获取验证码
  getOldMobileCode = () => {
    const { localization, account } = this.props;
    const { mobile } = account;
    if (MOBILE_REGEX.test(mobile)) {
      this.sendMobileSms(mobile);
      this.countDown();
    } else {
      message.info(localization['请输入正确的手机号']);
    }
  };

  getNewMobileCode = () => {
    const { localization, form } = this.props;
    const newMobile = form.getFieldValue('newMobile');
    if (MOBILE_REGEX.test(newMobile)) {
      this.sendMobileSms(newMobile);
      this.newcountDown();
    } else {
      message.info(localization['请输入正确的手机号']);
    }
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

  newcountDown = () => {
    this.setState({
      newdisabled: true
    });
    this.newtimer = setInterval(() => {
      let { newnumber } = this.state;
      if (newnumber === 0) {
        clearInterval(this.newtimer);
        this.setState({
          newnumber: 59,
          newdisabled: false
        });
      } else {
        this.setState({ newnumber: newnumber - 1 });
      }
    }, 1000);
  };

  handleSubmit = e => {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (!err) {
        const { oldCode, newMobile, newCode } = values;
        this.mobileChangeSubmit(oldCode, newMobile, newCode);
      }
    });
  };

  render() {
    const { localization, viewport, account, form } = this.props;
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

    const { disabled, number, newdisabled, newnumber } = this.state;

    return (
      <Form onSubmit={this.handleSubmit}>
        <FormItem {...formItemLayout} label={localization['手机号']}>
          {getFieldDecorator('mobile', { initialValue: account.mobile })(
            <Input size="large" disabled />
          )}
        </FormItem>
        <FormItem {...formItemLayout} label={localization['短信验证码']}>
          {getFieldDecorator('oldCode', {
            rules: [
              { required: true, message: localization['请输入手机验证码'] },
              { pattern: /^\d{6}$/, message: localization['请输入6位数字验证码'] }
            ],
            validateTrigger: 'onBlur'
          })(
            <div className="form-code">
              <Input size="large" />
              <Button
                onClick={this.getOldMobileCode}
                type="primary"
                size="large"
                disabled={disabled}
              >
                {!disabled ? localization['获取验证码'] : number + 's'}
              </Button>
            </div>
          )}
        </FormItem>
        <FormItem {...formItemLayout} label={localization['新手机号']}>
          {getFieldDecorator('newMobile', {
            rules: [
              { required: true, message: localization['请输入新的手机号'] },
              { pattern: MOBILE_REGEX, message: localization['手机号不正确'] }
            ],
            validateTrigger: 'onBlur'
          })(<Input size="large" />)}
        </FormItem>
        <FormItem {...formItemLayout} label={localization['新短信验证码']}>
          {getFieldDecorator('newCode', {
            rules: [
              { required: true, message: localization['请输入新的手机验证码'] },
              { pattern: /^\d{6}$/, message: localization['请输入6位数字验证码'] }
            ],
            validateTrigger: 'onBlur'
          })(
            <div className="form-code">
              <Input size="large" />
              <Button
                onClick={this.getNewMobileCode}
                type="primary"
                size="large"
                disabled={newdisabled}
              >
                {!newdisabled ? localization['获取验证码'] : newnumber + 's'}
              </Button>
            </div>
          )}
        </FormItem>
        <FormItem {...tailFormItemLayout}>
          <Button type="primary" htmlType="submit" size="large" onClick={this.handleSubmit}>
            {localization['确定']}
          </Button>
        </FormItem>
      </Form>
    );
  }
}
export default Form.create()(ModifyMobile);
