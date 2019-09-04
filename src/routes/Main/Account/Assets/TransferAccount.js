import React, { PureComponent } from 'react';
import { Modal, message, Input, Button } from 'antd';
import ConfirmTransfer from './ConfirmTransfer';
import request from 'utils/request';
import { MOBILE_REGEX, MAIL_REGEX } from 'utils/constants';
import styles from './popup.less';

export default class TransferAccount extends PureComponent {
  state = {
    toAccount: '',
    volume: '',
    volumeLimit: 0,
    popup: null
  };

  componentDidMount() {
    this.getVolumeLimit();
  }

  handleCancel = () => {
    const { onCancel } = this.props;
    onCancel && onCancel();
  };

  volumeChange = e => {
    let { pointVolume } = this.props;
    let reg = '';
    if (pointVolume === 0) {
      pointVolume = 0;
      reg = new RegExp(`^\\d{0,8}(\\d{0,${pointVolume}})?$`);
    } else {
      pointVolume = pointVolume || 2;
      reg = new RegExp(`^\\d{0,8}(\\.\\d{0,${pointVolume}})?$`);
    }
    const volume = e.target.value;
    if (reg.test(volume)) {
      this.setState({ volume });
    }
  };

  accountChange = e => {
    const toAccount = e.target.value;
    this.setState({ toAccount });
  };

  closePopup = () => {
    this.setState({ popup: null });
  };

  preConfirm = (toAccount, volume) => {
    this.setState({ loading: true });
    const { localization, coinId, onOk } = this.props;
    request(`/offline/change/preConfirm`, {
      body: {
        coinId,
        toAccount,
        volume
      }
    }).then(json => {
      this.setState({ loading: false });
      if (json.code === 10000000) {
        const { coinId, realName, toAccount, volume, fee, symbol, changeNo } = json.data;
        const tranProps = {
          coinId,
          realName,
          toAccount,
          volume,
          fee,
          symbol,
          changeNo
        };
        this.setState({
          popup: (
            <ConfirmTransfer
              {...tranProps}
              localization={localization}
              onCancel={this.closePopup}
              onOk={() => {
                this.closePopup();
                onOk && onOk();
              }}
            />
          )
        });
      }
    });
  };

  nextClick = () => {
    const { localization } = this.props;
    const { toAccount, volume } = this.state;
    if (MOBILE_REGEX.test(toAccount) || MAIL_REGEX.test(toAccount)) {
      if (volume > 0) {
        this.preConfirm(toAccount, volume);
      } else {
        message.error(localization['转账数额要大于0']);
      }
    } else {
      message.error(localization['请输入手机号或邮箱']);
    }
  };

  //获取转账剩余余额
  getVolumeLimit = () => {
    const { coinId } = this.props;
    request(`/offline/change/preCheck`, {
      body: {
        coinId
      }
    }).then(json => {
      if (json.code === 10000000) {
        if (json.data) {
          const { myVolumeLimit } = json.data;
          this.setState({ volumeLimit: myVolumeLimit });
        }
      }
    });
  };

  render() {
    const { volumeLimit, popup, toAccount, volume } = this.state;
    const { localization, symbol, volume: myLastVolume } = this.props;
    return (
      <Modal
        visible
        centered
        title={localization['转账']}
        width={440}
        footer={null}
        onCancel={this.handleCancel}
      >
        <div className={styles.transferPopup}>
          <div>
            <h4>{localization['账号']}</h4>
            <Input
              value={toAccount}
              size="large"
              placeholder={localization['请输入对方手机或邮箱']}
              onChange={this.accountChange}
            />
          </div>
          <div>
            <h5>
              <span>{localization['转账数额']}</span>
              <span className={styles.lastVolume}>
                {localization['可用余额']} : <strong>{myLastVolume} </strong> {symbol}
              </span>
            </h5>
            <div className={styles.volume}>
              <Input
                value={volume}
                onChange={this.volumeChange}
                size="large"
                placeholder={`${localization['今日剩余转账余额']} ${volumeLimit} ${symbol}`}
              />
            </div>
          </div>
          <footer>
            <Button type="primary" onClick={this.nextClick} size="large">
              {localization['下一步']}
            </Button>
          </footer>
          {popup}
        </div>
      </Modal>
    );
  }
}
