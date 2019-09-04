import React, { PureComponent } from 'react';
import { Button, Popconfirm, message } from 'antd';
import classnames from 'classnames';
import BankForm from './BankForm';
import PaymentForm from './PaymentForm';
import request from 'utils/request';
import { setLocalStorage } from 'utils';

import styles from './index.less';

class Payment extends PureComponent {
  state = {
    editType: '',
    bankInfo: null
  };

  componentDidMount() {
    this.getBankInfo();
  }

  getBankInfo = () => {
    request(`/offline/bank/get`, {
      method: 'GET'
    }).then(json => {
      if (json.code === 10000000) {
        this.setState({ bankInfo: json.data });
      }
    });
  };

  handelEdit = type => {
    this.setState({ editType: type });
  };

  handelDelete = type => {
    const { localization, account } = this.props;
    request(`/offline/${type === 'wechat' ? 'wechatpay' : type}/clean`).then(json => {
      if (json.code === 10000000) {
        let typeName = '银行卡';
        if (type === 'bank') {
          this.setState({ bankInfo: null });
        } else {
          if (type === 'alipay') {
            typeName = '支付宝';
          } else {
            typeName = '微信';
          }
          delete account[`${type}No`];
          delete account[`${type}QrcodeId`];
          setLocalStorage('account', account);
        }
        message.success(`${localization[typeName]} ${localization['账号删除成功']}`);
        this.handelEdit('delete');
      }
    });
  };

  render() {
    const { localization, viewport, account } = this.props;
    const { editType, bankInfo } = this.state;
    const { realName, wechatNo, alipayNo } = account;
    const btnText = flag => (flag ? localization['修改'] : localization['立即绑定']);

    const payment = {
      bank: {
        text: localization['银行卡'],
        btnText: btnText(bankInfo),
        showDelete: bankInfo,
        icon: 'icon-yinhangqia'
      },
      wechat: {
        text: localization['微信支付'],
        btnText: btnText(wechatNo),
        showDelete: wechatNo,
        icon: 'icon-weixinzhifu'
      },
      alipay: {
        text: localization['支付宝'],
        btnText: btnText(alipayNo),
        showDelete: alipayNo,
        icon: 'icon-zhifubao'
      }
    };

    return (
      <div className={styles.payment}>
        {['bank', 'wechat', 'alipay'].map(type => {
          return (
            <div
              key={type}
              className={classnames({
                [styles.cell]: true,
                [styles.unfold]: editType === type
              })}
            >
              <div className={styles.block}>
                <div className={styles.header}>
                  <div className={styles.title}>
                    <i
                      className={`iconfont ${payment[type].icon}`}
                      style={{
                        paddingRight: '0.3125rem',
                        fontSize: '1.75rem',
                        verticalAlign: 'middle'
                      }}
                    />
                    {payment[type].text}
                  </div>
                  <div className={styles.name}>
                    {type === 'bank' ? bankInfo && bankInfo.cardNo : realName}
                  </div>
                </div>

                <div className={styles.operation}>
                  {payment[type].showDelete && (
                    <Popconfirm
                      title={`${localization['你确定要删除']} ${payment[type].text} ${
                        localization['账户吗']
                      }？`}
                      onConfirm={this.handelDelete.bind(this, type)}
                      okType="danger"
                      okText={localization['确定']}
                      cancelText={localization['取消']}
                    >
                      <Button type="danger">{localization['删除']}</Button>
                    </Popconfirm>
                  )}
                  <Button
                    type="primary"
                    onClick={this.handelEdit.bind(this, editType === type ? '' : type)}
                  >
                    {editType === type ? localization['取消'] : `${payment[type].btnText}`}
                  </Button>
                </div>
              </div>
              <div className={styles.form}>
                {editType === type &&
                  (type === 'bank' ? (
                    <BankForm
                      {...{
                        localization,
                        viewport,
                        account,
                        bankInfo,
                        handelEdit: this.handelEdit,
                        setBankInfo: this.getBankInfo
                      }}
                    />
                  ) : (
                    <PaymentForm
                      {...{ localization, viewport, account, type, handelEdit: this.handelEdit }}
                    />
                  ))}
              </div>
            </div>
          );
        })}
      </div>
    );
  }
}

export default Payment;
