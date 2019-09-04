import React, { PureComponent } from 'react';
import { Form, Input, Button } from 'antd';
import { Link } from 'react-router-dom';
import request from 'utils/request';
import JSEncrypt from 'utils/jsencrypt.js';
import { PUBLI_KEY, PWD_REGEX } from 'utils/constants';

import styles from './index.less';

const FormItem = Form.Item;

class MailRest extends PureComponent {
  state = {
    ptoken: this.props.location.search.substr(1).split('=')[1]
  };

  inputValue = e => {
    this.setState({ [e.target.id]: e.target.value });
  };

  handleSubmit = e => {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (!err) {
        let { password } = values;

        let encrypt = new JSEncrypt();
        encrypt.setPublicKey(PUBLI_KEY);
        const enPassword = encrypt.encrypt(password);

        this.resetPwd(enPassword);
      }
    });
  };

  //重置密码
  resetPwd = password => {
    request('/user/mail/resetpwd', {
      body: {
        password,
        ptoken: this.state.ptoken
      }
    }).then(json => {
      if (json.code === 10000000) {
        this.setState({ resetSuccess: true });
      }
    });
  };

  comparePassword = (rule, value, callback) => {
    const { localization, form } = this.props;
    if (value && value !== form.getFieldValue('password')) {
      callback(localization['两次密码不一致']);
    } else {
      callback();
    }
  };

  render() {
    const { localization, form } = this.props;
    const { getFieldDecorator } = form;
    const { resetSuccess } = this.state;

    return resetSuccess ? (
      <div className={styles.wrap}>
        <div>{localization['重置密码成功']}</div>
        <p className={styles.text}>
          {localization['现在去']} <Link to="/signin">{localization['登录']}</Link>
        </p>
      </div>
    ) : (
      <div className={styles.wrap}>
        <div>{localization['重置密码']}</div>
        <Form onSubmit={this.handleSubmit}>
          <Input style={{ display: 'none' }} type="password" />
          <FormItem>
            <h4 className={styles.title}>{localization['密码']}</h4>
            {getFieldDecorator('password', {
              rules: [
                { required: true, message: localization['请输入密码'] },
                {
                  pattern: PWD_REGEX,
                  message: localization['输入8-20位密码包含数字,字母']
                },
                { validator: this.validateToNextPassword }
              ],
              validateTrigger: 'onBlur'
            })(<Input size="large" type="password" />)}
          </FormItem>
          <FormItem>
            <h4 className={styles.title}>{localization['确认密码']}</h4>
            {getFieldDecorator('confirm', {
              rules: [
                { required: true, message: localization['请再次输入密码'] },
                { validator: this.comparePassword }
              ],
              validateTrigger: 'onBlur'
            })(<Input size="large" type="password" onBlur={this.handleConfirmBlur} />)}
          </FormItem>
          <Button type="primary" htmlType="submit" size="large">
            {localization['确定']}
          </Button>
        </Form>
      </div>
    );
  }
}

export default Form.create()(MailRest);
