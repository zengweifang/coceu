import React from 'react';
import { Form, Input } from 'antd';
import { encryptExPassword } from 'utils';
import styles from './form.less';

const formItemLayout = {
  labelCol: { span: 0 },
  wrapperCol: { span: 24 },
};

class PayPasswordForm extends React.PureComponent {

    /**
   * 验证表单值
   */
    validate = () => {
      return new Promise(resolve => {
        this.props.form.validateFields( (err) => {
          if (err) {
            resolve(false);
          } else {
            resolve(true);
          }
        })
      })
      // return res;

    }

    /**
     * 获取表单值
     */
    getItemValues = () => {
      let { password } = this.props.form.getFieldsValue();
      if(password) {
        password = encryptExPassword(password);
      }
      return { password };
    }

    render() {
      const { localization, form: { getFieldDecorator } } = this.props;

      return (
        <div>
          <Form.Item {...formItemLayout} className={styles.formItem}>
            {getFieldDecorator('password', {
              rules: [
                {
                  required: true,
                  message: '请输入资金密码',
                },
                {
                  pattern: /^\d{6}$/,
                  message: localization['请输入6位数字资金密码']
                },
              ],
              validateTrigger: 'onBlur'
            })(<Input type="password" placeholder="请输入资金密码" />)}
          </Form.Item>
        </div>
      );
    }
}
export default Form.create()(PayPasswordForm)