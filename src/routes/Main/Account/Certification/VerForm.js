import React, { Component } from 'react';
import { Form, Input, Radio, Button } from 'antd';

import styles from './index.less';

const FormItem = Form.Item;
const RadioGroup = Radio.Group;

class VerForm extends Component {
  handleSubmit = (submitType, e) => {
    e.preventDefault();
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        if (submitType) {
          this.props.submitVer(submitType, values);
        } else {
          this.props.fetchUserInfo(values);
        }
      }
    });
  };

  render() {
    const { localization, viewport, form, countryCode } = this.props;
    const { getFieldDecorator } = form;

    let formItemLayout = {};

    if (viewport.width > 767) {
      formItemLayout = {
        labelCol: { span: 4 },
        wrapperCol: { span: 14 }
      };
    }

    return (
      <Form onSubmit={this.handleSubmit} className={styles.form}>
        <FormItem {...formItemLayout} label={localization['身份证号']}>
          {getFieldDecorator('idCard', {
            rules: [
              { required: true, message: localization['请输入身份证号'], whitespace: true },
              { max: 30, message: localization['身份证号不能超过30位'] }
            ]
          })(<Input size="large" placeholder={localization['请输入身份证号']} />)}
        </FormItem>
        <FormItem {...formItemLayout} label={localization['姓名']}>
          {getFieldDecorator('realName', {
            rules: [
              { required: true, message: localization['请输入姓名'], whitespace: true },
              { max: 30, message: localization['姓名不能超过30位'] }
            ]
          })(<Input size="large" placeholder={localization['请输入姓名']} />)}
        </FormItem>
        <FormItem {...formItemLayout} label={localization['年龄']}>
          {getFieldDecorator('age', {
            rules: [
              { required: true, message: localization['请输入年龄'], whitespace: true },
              { pattern: /^[0-9]{0,2}$/, message: localization['年龄不正确'] }
            ]
          })(<Input size="large" placeholder={localization['请输入年龄']} />)}
        </FormItem>
        <FormItem {...formItemLayout} label={localization['性别']} className={styles.sex}>
          {getFieldDecorator('sex', {
            rules: [{ required: true, message: localization['请选择性别'] }]
          })(
            <div style={{ textAlign: 'left' }}>
              <RadioGroup>
                <Radio value="1">{localization['男']}</Radio>
                <Radio value="2">{localization['女']}</Radio>
              </RadioGroup>
            </div>
          )}
        </FormItem>

        <FormItem {...formItemLayout} label={localization['地址']}>
          {getFieldDecorator('address', {
            rules: [
              { required: true, message: localization['请输入地址'], whitespace: true },
              { max: 100, message: localization['地址不能超过100位'] }
            ]
          })(<Input size="large" placeholder={localization['请输入地址']} />)}
        </FormItem>
        <div
          className={styles.action}
          style={{
            width: viewport.width < 767 ? '100%' : 300,
            display: 'flex',
            margin: '0 auto',
            padding: '1.25rem 0 0',
            justifyContent: 'space-between'
          }}
        >
          {/* {countryCode === '00' && (
            <Button
              type="primary"
              size="large"
              htmlType="submit"
              onClick={this.handleSubmit.bind(this, 1)}
              style={{ marginRight: '40px' }}
            >
              {localization['提交']} (V1 {localization['认证']})
            </Button>
          )} */}
          <Button
            type="primary"
            size="large"
            htmlType="submit"
            onClick={this.handleSubmit.bind(this, 0)}
          >
            {localization['下一步']} {countryCode === '00' ? `(V2 ${localization['认证']})` : ''}
          </Button>
        </div>
      </Form>
    );
  }
}

export default Form.create()(VerForm);
