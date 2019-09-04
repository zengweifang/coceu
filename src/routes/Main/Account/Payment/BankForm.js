import React, { Component } from 'react';
import { Form, Input, Select, Button, message } from 'antd';
import request from 'utils/request';

import styles from './index.less';

const FormItem = Form.Item;
const Option = Select.Option;

class BankForm extends Component {
  state = {
    confirmDirty: false
  };

  handleSubmit = e => {
    e.preventDefault();
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        const { bankInfo, setBankInfo, localization, handelEdit } = this.props;
        const { realName, bankName, branchBankName, cardNo } = values;

        const body = {
          realName,
          bankName,
          branchBankName,
          cardNo
        };

        if (bankInfo) {
          body.id = bankInfo.id;
        }

        request(`/offline/bank/bind`, { body }).then(json => {
          if (json.code === 10000000) {
            setBankInfo();
            message.success(localization['银行卡绑定成功']);
            handelEdit();
          }
        });
      }
    });
  };

  compareToFirstCardNo = (rule, value, callback) => {
    const { localization, form } = this.props;
    this.setState({ confirmDirty: !!value });
    if (value && value !== form.getFieldValue('cardNo')) {
      callback(localization['您输入的两个银行卡号不一致']);
    } else {
      callback();
    }
  };

  validateToNextCardNo = (rule, value, callback) => {
    const { form } = this.props;
    if (value && this.state.confirmDirty) {
      form.validateFields(['confirm'], { force: true });
    }
    callback();
  };

  render() {
    const { bankInfo, form, localization, viewport } = this.props;
    const { getFieldDecorator } = form;

    const submitBtnText = bankInfo ? localization['确认修改'] : localization['确认绑定'];

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

    let bankOption = {
      rules: [{ required: true, message: localization['请选择开户银行'] }]
    };
    if (bankInfo) {
      bankOption.initialValue = bankInfo.bankName;
    }

    const bankList = [
      '中国工商银行',
      '中国农业银行',
      '中国银行',
      '中国建设银行',
      '中国邮政储蓄银行',
      '交通银行',
      '招商银行',
      '国家开发银行',
      '上海浦东发展银行',
      '兴业银行',
      '华夏银行',
      '广东发展银行',
      '中国民生银行',
      '中信银行',
      '中国光大银行',
      '恒丰银行',
      '浙商银行',
      '渤海银行',
      '平安银行',
      '上海农村商业银行',
      '玉溪市商业银行',
      '尧都农商行',
      '北京银行',
      '上海银行',
      '江苏银行',
      '杭州银行',
      '南京银行',
      '宁波银行',
      '徽商银行',
      '长沙银行',
      '成都银行',
      '重庆银行',
      '大连银行',
      '南昌银行',
      '福建海峡银行',
      '汉口银行',
      '温州银行',
      '青岛银行',
      '台州银行',
      '嘉兴银行',
      '常熟农村商业银行',
      '南海农村信用联社',
      '常州农村信用联社',
      '内蒙古银行',
      '绍兴银行',
      '顺德农商银行',
      '吴江农商银行',
      '齐商银行',
      '贵阳市商业银行',
      '遵义市商业银行',
      '湖州市商业银行',
      '龙江银行',
      '晋城银行JCBANK',
      '浙江泰隆商业银行',
      '广东省农村信用社联合社',
      '东莞农村商业银行',
      '浙江民泰商业银行',
      '广州银行',
      '辽阳市商业银行',
      '江苏省农村信用联合社',
      '廊坊银行',
      '浙江稠州商业银行',
      '德阳商业银行',
      '晋中市商业银行',
      '苏州银行',
      '桂林银行',
      '乌鲁木齐市商业银行',
      '成都农商银行',
      '张家港农村商业银行',
      '东莞银行',
      '莱商银行',
      '北京农村商业银行',
      '天津农商银行',
      '上饶银行',
      '富滇银行',
      '重庆农村商业银行',
      '鞍山银行',
      '宁夏银行',
      '河北银行',
      '华融湘江银行',
      '自贡市商业银行',
      '云南省农村信用社',
      '吉林银行',
      '东营市商业银行',
      '昆仑银行',
      '鄂尔多斯银行',
      '邢台银行',
      '晋商银行',
      '天津银行',
      '营口银行',
      '吉林农信',
      '山东农信',
      '西安银行',
      '河北省农村信用社',
      '宁夏黄河农村商业银行',
      '贵州省农村信用社',
      '阜新银行',
      '湖北银行黄石分行',
      '浙江省农村信用社联合社',
      '新乡银行',
      '湖北银行宜昌分行',
      '乐山市商业银行',
      '江苏太仓农村商业银行',
      '驻马店银行',
      '赣州银行',
      '无锡农村商业银行',
      '广西北部湾银行',
      '广州农商银行',
      '江苏江阴农村商业银行',
      '平顶山银行',
      '泰安市商业银行',
      '南充市商业银行',
      '重庆三峡银行',
      '中山小榄村镇银行',
      '邯郸银行',
      '库尔勒市商业银行',
      '锦州银行',
      '齐鲁银行',
      '青海银行',
      '阳泉银行',
      '盛京银行',
      '抚顺银行',
      '郑州银行',
      '深圳农村商业银行',
      '潍坊银行',
      '九江银行',
      '江西省农村信用',
      '河南省农村信用',
      '甘肃省农村信用',
      '四川省农村信用',
      '广西省农村信用',
      '陕西信合',
      '武汉农村商业银行',
      '宜宾市商业银行',
      '昆山农村商业银行',
      '石嘴山银行',
      '衡水银行',
      '信阳银行',
      '鄞州银行',
      '张家口市商业银行',
      '许昌银行',
      '济宁银行',
      '开封市商业银行',
      '威海市商业银行',
      '湖北银行',
      '承德银行',
      '丹东银行',
      '金华银行',
      '朝阳银行',
      '临商银行',
      '包商银行',
      '兰州银行',
      '周口银行',
      '德州银行',
      '三门峡银行',
      '安阳银行',
      '安徽省农村信用社',
      '湖北省农村信用社',
      '湖南省农村信用社',
      '广东南粤银行',
      '洛阳银行',
      '农信银清算中心',
      '城市商业银行资金清算中心'
    ];

    return (
      <Form onSubmit={this.handleSubmit}>
        <FormItem {...formItemLayout} label={localization['姓名']}>
          {getFieldDecorator('realName', {
            rules: [
              { required: true, message: localization['请输入姓名'], whitespace: true },
              { max: 30, message: localization['姓名长度不能超过30位'] }
            ],
            validateTrigger: 'onBlur',
            initialValue: bankInfo && bankInfo.realName
          })(<Input size="large" placeholder={localization['请输入姓名']} />)}
        </FormItem>
        <FormItem {...formItemLayout} label={localization['开户银行']}>
          {getFieldDecorator('bankName', bankOption)(
            <Select
              size="large"
              showSearch
              placeholder={localization['请选择开户银行']}
              getPopupContainer={() => document.querySelector(`.${styles.form}`)}
            >
              {bankList.map(bank => {
                return (
                  <Option key={bank} value={bank}>
                    {bank}
                  </Option>
                );
              })}
            </Select>
          )}
        </FormItem>
        <FormItem {...formItemLayout} label={localization['开户支行']}>
          {getFieldDecorator('branchBankName', {
            rules: [
              { required: true, message: localization['请输入开户支行'], whitespace: true },
              { max: 30, message: localization['开户支行长度不能超过30位'] }
            ],
            validateTrigger: 'onBlur',
            initialValue: bankInfo && bankInfo.branchBankName
          })(<Input size="large" placeholder={localization['请输入开户支行']} />)}
        </FormItem>
        <FormItem {...formItemLayout} label={localization['银行卡号']}>
          {getFieldDecorator('cardNo', {
            rules: [
              {
                required: true,
                message: localization['请输入银行卡号'],
                whitespace: true
              },
              { pattern: /^\w{0,20}$/, message: localization['卡号不能为中文'] },
              { max: 20, message: localization['卡号长度不能超过20位'] },
              {
                validator: this.validateToNextCardNo.bind(this)
              }
            ],
            validateTrigger: 'onBlur',
            initialValue: bankInfo && bankInfo.cardNo
          })(<Input size="large" placeholder={localization['请输入银行卡号']} />)}
        </FormItem>
        <FormItem {...formItemLayout} label={localization['确认卡号']}>
          {getFieldDecorator('confirm', {
            rules: [
              {
                required: true,
                message: localization['请确认银行卡号']
              },
              {
                validator: this.compareToFirstCardNo
              }
            ],
            validateTrigger: 'onBlur',
            initialValue: bankInfo && bankInfo.cardNo
          })(<Input size="large" placeholder={localization['请确认银行卡号']} />)}
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

export default Form.create()(BankForm);
