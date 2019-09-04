import React, { PureComponent } from 'react';
import { Modal, message, Checkbox, Button } from 'antd';
import request from 'utils/request';
import styles from './popup.less';

export default class ConfirmTran extends PureComponent {
  state = {
    checked: false
  };

  handleCancel = () => {
    const { onCancel } = this.props;
    onCancel && onCancel();
  };

  confirm = () => {
    const { localization, coinId, realName, toAccount, volume, fee, changeNo, onOk } = this.props;
    request(`/offline/change/confirm`, {
      body: {
        coinId,
        realName,
        toAccount,
        volume,
        fee,
        changeNo
      }
    }).then(json => {
      if (json.code === 10000000) {
        message.success(localization['转账成功']);
        onOk && onOk();
      }
    });
  };

  handleOk = () => {
    const { localization } = this.props;
    const { checked } = this.state;
    if (checked) {
      this.confirm();
    } else {
      message.error(localization['请先确认转账信息']);
    }
  };

  onChange = e => {
    this.setState({ checked: e.target.checked });
  };

  render() {
    const { localization, realName, toAccount, volume, fee, symbol } = this.props;
    const { checked } = this.state;
    return (
      <Modal
        visible
        wrapClassName={styles.conTransfPopup}
        width={360}
        centered
        maskClosable={false}
        footer={null}
        onCancel={this.handleCancel}
      >
        <div className={styles.wrap}>
          <h4>{localization['确认转账']}</h4>
          <ul>
            <li>
              <span>{localization['对方账户']} : </span>
              <span>{toAccount}</span>
            </li>
            <li>
              <span>{localization['真实姓名']} : </span>
              <span>{realName}</span>
            </li>
            <li>
              <span>
                {localization['转账数额']}({symbol}) :{' '}
              </span>
              <span>{volume}</span>
            </li>
            <li>
              <span>
                {localization['手续费']}({symbol}) :{' '}
              </span>
              <span>{fee}</span>
            </li>
          </ul>
          <div className={styles.checkBox}>
            <Checkbox checked={checked} onChange={this.onChange}>
              {localization['我已确认转账信息']}
            </Checkbox>
          </div>
        </div>
        <footer>
          <Button onClick={this.handleCancel} size="large">
            {localization['取消']}
          </Button>
          <Button onClick={this.handleOk} size="large" type="primary">
            {localization['确认']}
          </Button>
        </footer>
      </Modal>
    );
  }
}
