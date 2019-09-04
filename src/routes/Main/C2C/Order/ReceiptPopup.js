import React, { Component } from 'react';
import { Modal, Checkbox, message } from 'antd';

import styles from './popup.less';

export default class ReceiptPopup extends Component {
  constructor(props) {
    super(props);
    this.state = {
      checked: false
    };
  }

  handleOk = () => {
    const { checked } = this.state;
    const { onOk } = this.props;
    if (checked) {
      onOk();
    } else {
      message.destroy();
      message.error('请先进行确认');
    }
  };
  render() {
    const { totalPrice, onCancel, type, localization } = this.props;
    const { checked } = this.state;
    const title = type === 'pay' ? localization['确认付款'] : localization['确认收款'];
    const text =
      type === 'pay'
        ? localization['您确认已向卖家支付订单金额']
        : localization['您确认您已收到对方支付的'];
    const checkedText =
      type === 'pay' ? localization['我已确认付款'] : localization['我已确认收款'];

    return (
      <Modal
        title={title}
        width={400}
        cancelText={localization['取消']}
        okText={localization['确认']}
        centered
        visible={true}
        onCancel={onCancel}
        onOk={this.handleOk}
      >
        <div className={styles.confirmReceipt}>
          <p>
            {text}
            <span className={styles.moneySpan}>{totalPrice}</span>
            {localization['元']} <br />
          </p>
          <div>
            <div>
              <Checkbox
                checked={checked}
                onChange={e => {
                  this.setState({ checked: e.target.checked });
                }}
              >
                {checkedText}
              </Checkbox>
            </div>
          </div>
        </div>
      </Modal>
    );
  }
}
