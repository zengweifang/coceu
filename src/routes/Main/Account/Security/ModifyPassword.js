import React, { PureComponent } from 'react';
import { Form, Input, Button, message } from 'antd';
import { PUBLI_KEY, PWD_REGEX } from 'utils/constants';
import request from 'utils/request';
import JSEncrypt from 'utils/jsencrypt.js';

const FormItem = Form.Item;

class ModifyPassword extends PureComponent {
  state = {
    confirmDirty: false
  };

  handleSubmit = e => {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (!err) {
        const { oldPassword, password } = values;
        // this.changePassword(oldPassword, password);
        let encrypt = new JSEncrypt();
        encrypt.setPublicKey(PUBLI_KEY);
        let enOldPassword = encrypt.encrypt(oldPassword);
        let enNewPassword = encrypt.encrypt(password);
        this.changePassword(enOldPassword, enNewPassword);
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

  changePassword = (oldPassword, password) => {
    const { localization } = this.props;
    request('/user/updatePassword', {
      method: 'POST',
      body: {
        password,
        oldPassword
      }
    }).then(json => {
      if (json.code === 10000000) {
        message.success(localization['修改密码成功']);
        this.props.onFold();
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

    return (
      <Form onSubmit={this.handleSubmit}>
        <Input style={{ display: 'none' }} type="password" />
        <FormItem {...formItemLayout} label={localization['原密码']}>
          {getFieldDecorator('oldPassword', {
            rules: [{ required: true, message: localization['请输入原密码'] }],
            validateTrigger: 'onBlur'
          })(<Input size="large" type="password" />)}
        </FormItem>
        <FormItem {...formItemLayout} label={localization['新密码']}>
          {getFieldDecorator('password', {
            rules: [
              { required: true, message: localization['请输入新密码'] },
              { pattern: PWD_REGEX, message: localization['输入8-20位密码包含数字，字母'] },
              { validator: this.validateToNextPassword }
            ],
            validateTrigger: 'onBlur'
          })(<Input size="large" type="password" />)}
        </FormItem>
        <FormItem {...formItemLayout} label={localization['确认密码']}>
          {getFieldDecorator('confirm', {
            rules: [
              { required: true, message: localization['请再次输入密码'] },
              { validator: this.comparePassword }
            ],
            validateTrigger: 'onBlur'
          })(<Input size="large" type="password" onBlur={this.handleConfirmBlur} />)}
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

export default Form.create()(ModifyPassword);
