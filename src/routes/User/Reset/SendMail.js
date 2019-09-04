import React, { PureComponent } from 'react';
import { Form, Input, Button, message } from 'antd';
import { isPC } from 'utils';
import request from 'utils/request';
// import NoCaptcha from 'components/NoCaptcha';
import { MAIL_REGEX } from 'utils/constants';

import styles from './index.less';

const FormItem = Form.Item;

class SendMail extends PureComponent {
  state = {
    appKey: '',
    token: '',
    ncData: '',
    nc: '',
    disabled: false,
    scene: isPC() ? 'nc_register' : 'nc_register_h5'
  };

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

  sendMailCode = () => {
    this.setState({ disabled: true });
    const { localization, handleResetConfirm } = this.props;
    const { appKey, token, ncData, scene } = this.state;
    const { csessionid, sig } = ncData;
    const mail = this.props.form.getFieldsValue().mail;
    request(`/mail/sendCode`, {
      body: {
        mail,
        type: 'reset',
        source: 'pc',
        // appKey,
        // sessionId: csessionid,
        // sig,
        // vtoken: token,
        // scene
      }
    }).then(json => {
      if (json.code === 10000000) {
        handleResetConfirm();
        message.success(localization['验证码发送成功']);
      } else {
        this.setState({ disabled: false });
      }
    });
  };

  handleSubmit = e => {
    e.preventDefault();
    const { localization } = this.props;
    const { ncData } = this.state;
    this.props.form.validateFields(err => {
      if (!err) {
        this.sendMailCode();
      }
    });
  };

  render() {
    const { localization, form } = this.props;
    const { getFieldDecorator } = form;
    const { scene, disabled } = this.state;
    return (
      <Form onSubmit={this.handleSubmit}>
        <Input style={{ display: 'none' }} type="password" />
        <FormItem>
          <h4 className={styles.title}>{localization['邮箱']}</h4>
          {getFieldDecorator('mail', {
            rules: [
              { required: true, message: localization['请输入邮箱'] },
              {
                pattern: MAIL_REGEX,
                message: localization['邮箱不正确']
              }
            ],
            validateTrigger: 'onBlur'
          })(<Input size="large" />)}
        </FormItem>
        {/* <FormItem>
          <h4 className={styles.title}>{localization['滑动验证']}</h4>
          {getFieldDecorator('noCaptche')(
            <NoCaptcha
              domID="nc_reset_mail"
              scene={scene}
              ncCallback={(appKey, token, ncData, nc) => {
                this.ncLoaded(appKey, token, ncData, nc);
              }}
            />
          )}
        </FormItem> */}
        <Button disabled={disabled} type="primary" htmlType="submit" size="large">
          {localization['确定']}
        </Button>
      </Form>
    );
  }
}

export default Form.create()(SendMail);
