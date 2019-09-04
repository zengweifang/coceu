import React, { PureComponent, Fragment } from 'react';
import { Form, Input, Button, Radio, message } from 'antd';
import { setLocalStorage } from 'utils';
import request from 'utils/request';
import JSEncrypt from 'utils/jsencrypt.js';
import { PUBLI_KEY} from 'utils/constants';

const FormItem = Form.Item;
const RadioGroup = Radio.Group;

class EditTradeVerify extends PureComponent {
  state = {
    exValidType: '',
    number: 90,
    disabled: false
  };

  //发送手机短信
  sendMobileSms = () => {
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
        request('/user/mobile/sendMobileSms', {
          body: {
            smsType: 'exchange_pass',
            vaildCodeKey:vaildCodeKey
          }
        }).then(json => {
          if (json.code === 10000000) {
            this.countDown();
            message.success(localization[json.msg]);
          }
        });
      }
    });
  };

  //发送邮箱验证码
  sendMail = () => {
    const { localization } = this.props;
    request('/user/mail/sendMail', {
      body: {
        smsType: 'exchange_pass'
      }
    }).then(json => {
      if (json.code === 10000000) {
        this.countDown();
        message.success(localization[json.msg]);
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
          number: 90,
          disabled: false
        });
      } else {
        this.setState({ number: number - 1 });
      }
    }, 1000);
  };

  handleChange = e => {
    e.stopPropagation();
    const exValidType = e.target.value;
    const { localization, account } = this.props;
    const { mobile, mail, googleAuth } = account;

    let infoMsg;
    if (exValidType === 1 && !googleAuth) {
      infoMsg = '请先进行谷歌认证';
    }
    if (exValidType === 3 && !mobile) {
      infoMsg = '请先绑定手机号';
    }
    if (exValidType === 4 && !mail) {
      infoMsg = '请先绑定邮箱';
    }
    if (infoMsg) return message.info(localization[infoMsg]);

    if (!this.props.account.exValidType) {
      // 设置交易验证方式
      request('/user/updateExValidType', {
        body: { exValidType }
      }).then(json => {
        if (json.code === 10000000) {
          const { localization, account, dispatch } = this.props;
          message.success(localization['设置成功']);
          account.exValidType = exValidType;
          dispatch({
            type: 'global/save',
            payload: { account }
          });
          setLocalStorage('account', account);
          this.props.onFold();
        }
      });
    } else {
      this.setState({ exValidType });
    }
  };

  handleSubmit = e => {
    e.preventDefault();
    const { localization, account, dispatch, form } = this.props;
    form.validateFields((err, values) => {
      if (!err) {
        const { code, exValidType } = values;

        // 修改交易验证方式
        request('/user/changeExValidType', {
          body: { exValidType, code }
        }).then(json => {
          if (json.code === 10000000) {
            message.success(localization['修改成功']);
            account.exValidType = exValidType;
            dispatch({
              type: 'global/save',
              payload: { account }
            });
            setLocalStorage('account', account);
            this.props.onFold();
          }
        });
      }
    });
  };

  render() {
    const { localization, viewport, account, form, exValidText } = this.props;
    const { getFieldDecorator } = form;
    const { exValidType } = account;

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
        <FormItem {...formItemLayout} label={localization['交易验证方式']}>
          {getFieldDecorator('exValidType', {
            rules: [
              {
                required: true,
                message: localization[`请选择交易验证方式`]
              }
            ]
          })(
            <RadioGroup buttonStyle="solid" onChange={this.handleChange}>
              {Object.keys(exValidText).map(type => {
                const radioKey = type * 1;
                return (
                  radioKey !== exValidType && (
                    <Radio.Button key={radioKey} value={radioKey}>
                      {localization[exValidText[radioKey]]}
                    </Radio.Button>
                  )
                );
              })}
            </RadioGroup>
          )}
        </FormItem>
        {this.state.exValidType && (
          <Fragment>
            {' '}
            <FormItem {...formItemLayout} label={localization[`${exValidText[exValidType]}码`]}>
              {getFieldDecorator('code', {
                rules: [
                  {
                    required: true,
                    message: localization[`请输入${exValidText[exValidType]}码`]
                  }
                ],
                validateTrigger: 'onBlur'
              })(
                exValidType === 1 ? (
                  <Input
                    size="large"
                    placeholder={localization[`请输入${exValidText[exValidType]}码`]}
                    onChange={this.codeOnchange}
                  />
                ) : (
                  <div className="form-code">
                    <Input
                      size="large"
                      placeholder={localization[`请输入${exValidText[exValidType]}码`]}
                      onChange={this.codeOnchange}
                    />
                    <Button
                      onClick={exValidType === 3 ? this.sendMobileSms : this.sendMail}
                      type="primary"
                      size="large"
                      disabled={disabled}
                    >
                      {!disabled ? localization['获取验证码'] : number + 's'}
                    </Button>
                  </div>
                )
              )}
            </FormItem>
            <FormItem {...tailFormItemLayout}>
              <Button type="primary" size="large" htmlType="submit" onClick={this.handleSubmit}>
                {localization['确定']}
              </Button>
            </FormItem>
          </Fragment>
        )}
      </Form>
    );
  }
}

export default Form.create()(EditTradeVerify);
