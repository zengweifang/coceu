import React, { Component } from 'react';
import { Form, Input, Button, Upload, Icon, message } from 'antd';
import { IMAGES_ADDRESS, IMAGES_URL } from 'utils/constants';
import { setLocalStorage } from 'utils';
import request from 'utils/request';

const FormItem = Form.Item;

function getBase64(img, callback) {
  const reader = new FileReader();
  reader.addEventListener('load', () => callback(reader.result));
  reader.readAsDataURL(img);
}

class PaymentForm extends Component {
  state = {
    loading: false
  };

  handleSubmit = e => {
    e.preventDefault();
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        const { type, localization, account, handelEdit } = this.props;
        const urlpart = type === 'wechat' ? 'wechatpay' : 'alipay';
        const typeText = type === 'wechat' ? localization['微信'] : localization['支付宝'];

        const qrcodeId = account[`${type}QrcodeId`];

        request(`/offline/${urlpart}/bind`, {
          body: {
            realName: values.realName,
            [`${type}No`]: values[`${type}No`],
            [`${type}QrcodeId`]: values.qrcode ? values.qrcode[0].response : qrcodeId
          }
        }).then(json => {
          if (json.code === 10000000) {
            account[`${type}No`] = values[`${type}No`];
            account[`${type}QrcodeId`] = values.qrcode ? values.qrcode[0].response : qrcodeId;
            setLocalStorage('account', account);
            message.success(`${typeText} ${localization['账号绑定成功']}`);
            handelEdit();
          }
        });
      }
    });
  };

  normFile = e => {
    if (Array.isArray(e)) {
      return e;
    }
    return e && e.fileList;
  };

  beforeUpload = file => {
    const { localization } = this.props;
    const isLt10M = file.size / 1024 / 1024 < 10;
    if (!isLt10M) {
      message.error(`${localization['照片必须小于']}10MB`);
    }
    return isLt10M;
  };

  handleChange = ({ file }) => {
    if (file.status === 'uploading') {
      this.setState({ loading: true });
      return;
    }
    if (file.status === 'done') {
      getBase64(file.originFileObj, imageUrl =>
        this.setState({
          imageUrl,
          qrcode: file,
          loading: false
        })
      );
    }
  };

  render() {
    const { type, form, localization, viewport, account } = this.props;
    const { getFieldDecorator } = form;
    const { loading, imageUrl } = this.state;
    const typeText = type === 'wechat' ? localization['微信'] : localization['支付宝'];
    const qrcodeId = account[`${type}QrcodeId`];
    const qrcodeUrl = imageUrl ? imageUrl : qrcodeId ? `${IMAGES_URL}/${qrcodeId}` : '';

    let submitBtnText = localization['确认绑定'];
    const isModify =
      (type === 'wechat' && account.wechatNo) || (type === 'alipay' && account.alipayNo);
    if (isModify) {
      submitBtnText = localization['确认修改'];
    }

    let formItemLayout = {};

    let tailFormItemLayout = {};

    if (viewport.width > 767) {
      formItemLayout = {
        labelCol: {
          xs: { span: 10 },
          sm: { span: 6 }
        },
        wrapperCol: {
          xs: { span: 10 },
          sm: { span: 10 }
        }
      };

      tailFormItemLayout = {
        wrapperCol: {
          xs: {
            span: 10,
            offset: 6
          },
          sm: {
            span: 10,
            offset: 6
          }
        }
      };
    }

    return (
      <Form onSubmit={this.handleSubmit}>
        <FormItem {...formItemLayout} label={localization['姓名']}>
          {getFieldDecorator('realName', {
            rules: [{ required: true, message: localization['请输入姓名'], whitespace: true }],
            initialValue: account.realName
          })(<Input size="large" placeholder={localization['请输入姓名']} />)}
        </FormItem>
        <FormItem {...formItemLayout} label={`${typeText} ${localization['账号']}`}>
          {getFieldDecorator(`${type}No`, {
            rules: [
              {
                required: true,
                message: `${localization['请输入']} ${typeText} ${localization['账号']}`
              }
            ],
            initialValue: account[`${type}No`]
          })(
            <Input
              size="large"
              placeholder={`${localization['请输入']} ${typeText} ${localization['账号']}`}
            />
          )}
        </FormItem>
        <FormItem {...formItemLayout} label={localization['收款二维码']}>
          <div className="dropbox">
            {getFieldDecorator('qrcode', {
              valuePropName: 'file',
              getValueFromEvent: this.normFile,
              rules: [{ required: !isModify, message: localization['请上传收款二维码'] }]
            })(
              <Upload
                key={type}
                action={`${IMAGES_ADDRESS}/upload`}
                listType="picture-card"
                showUploadList={false}
                beforeUpload={this.beforeUpload}
                onChange={this.handleChange}
              >
                {qrcodeUrl ? (
                  <img src={qrcodeUrl} alt="" />
                ) : (
                  <div>
                    <Icon type={loading ? 'loading' : 'plus'} />
                    <div className="ant-upload-text">{`${localization[`上传`]} ${typeText} ${
                      localization[`二维码`]
                    }`}</div>
                  </div>
                )}
              </Upload>
            )}
          </div>
        </FormItem>
        <FormItem {...tailFormItemLayout}>
          <Button type="primary" size="large" htmlType="submit">
            {submitBtnText}
          </Button>
        </FormItem>
      </Form>
    );
  }
}

export default Form.create()(PaymentForm);
