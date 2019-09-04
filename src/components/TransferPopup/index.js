import React, { PureComponent } from 'react';
import { Modal, Select, Input, message } from 'antd';
import request from 'utils/request';
import classnames from 'classnames';
import styles from './index.less';

const Option = Select.Option;

export default class TransferPopup extends PureComponent {
  state = {
    volume: '',
    from: '0', // 币币账户 0 , c2c 1, 保证金 2
    to: '1',
    allAssert: 0
  };

  componentDidMount() {
    const { from } = this.state;
    this.getAllAssert(from);
  }

  handleCancel = () => {
    const { onCancel } = this.props;
    onCancel && onCancel();
  };

  handleOk = () => {
    const { localization } = this.props;
    const { from, to, volume } = this.state;
    if (from === to) {
      return message.error(localization['账户不能相同']);
    }
    if (volume * 1 === 0) {
      return message.error(localization['划转数量要大于0']);
    }

    this.transfer();
  };

  volumeChange = e => {
    let value = e.target.value;
    if (/^\d*\.{0,1}\d{0,8}$/.test(value) && value.length < 16) {
      this.setState({ volume: value });
    }
  };

  handleTranAll = () => {
    const { allAssert } = this.state;
    if (allAssert > 0) {
      this.setState({ volume: allAssert });
    }
  };

  //获取所有资产
  getAllAssert = from => {
    const { coinId } = this.props;

    if (from === '0') {
      //获取币币资产
      request(`/coin/volume/${coinId}`, {
        method: 'GET'
      }).then(json => {
        if (json.code === 10000000) {
          if (json.data) {
            const volume = json.data.volume;
            const allAssert = String(volume).match(/(\d{0,8})(\.\d{0,8})?/)[0];
            this.setState({ allAssert });
          }
        }
      });
    } else {
      // 获取c2c和保证金
      request(`/offline/volume/${coinId}`, {
        method: 'GET'
      }).then(json => {
        if (json.code === 10000000) {
          if (json.data) {
            const { bailVolume, volume } = json.data;
            const myVolume = from === '1' ? volume : bailVolume;
            const allAssert = String(myVolume).match(/(\d{0,8})(\.\d{0,8})?/)[0];
            this.setState({ allAssert });
          }
        }
      });
    }
  };

  transfer = () => {
    const { coinId, symbol, onOk } = this.props;
    const { volume, from, to } = this.state;
    this.setState({ loading: true });
    request(`/offline/volume/inOut`, {
      body: {
        coinId,
        symbol,
        volume,
        from,
        to
      }
    }).then(json => {
      this.setState({ loading: false });
      if (json.code === 10000000) {
        message.success(json.msg);
        onOk && onOk();
      }
    });
  };

  fromChange = value => {
    this.setState({ from: value });
    this.getAllAssert(value);
  };

  toChange = value => {
    this.setState({ to: value });
  };

  render() {
    const { localization, symbol } = this.props;
    const { from, to, volume, allAssert } = this.state;
    return (
      <Modal
        title={
          <div>
            {localization['资产互转']}
            <span> {symbol}</span>
          </div>
        }
        visible
        centered
        wrapClassName={styles.transferModal}
        width={400}
        okText={localization['确认']}
        cancelText={localization['取消']}
        onOk={this.handleOk}
        onCancel={this.handleCancel}
        getContainer={() => document.querySelector(`.layout`)}
      >
        <div
          className={classnames({
            [styles.transferPopup]: true,
            'transfer-wrap': true
          })}
        >
          <div>
            <h4 className={styles.title}>
              <span>{localization['从']}</span>
            </h4>
            <Select
              value={from}
              style={{ width: '100%' }}
              onChange={this.fromChange}
              getPopupContainer={() => document.querySelector(`.${styles.transferPopup}`)}
            >
              <Option value="0">{localization['币币账户']}</Option>
              {/* <Option value="1">{localization['C2C账户']}</Option> */}
              <Option value="2">{localization['手续费预备金']}</Option>
            </Select>
          </div>
          <div className="to">
            <h4 className={styles.title}>
              <span>{localization['转至']}</span>
            </h4>
            <Select
              value={to}
              style={{ width: '100%' }}
              onChange={this.toChange}
              getPopupContainer={() => document.querySelector(`.${styles.transferPopup}`)}
            >
              <Option value="0">{localization['币币账户']}</Option>
              {/* <Option value="1">{localization['C2C账户']}</Option> */}
              <Option value="2">{localization['手续费预备金']}</Option>
            </Select>
          </div>
          <div>
            <h4 className={styles.title}>
              <span>{localization['数量']}</span>
              <span>
                ({localization['可划转数量']} : {allAssert} {symbol})
              </span>
            </h4>
            <div className={styles.volumeLine}>
              <Input className={styles.volumeInput} value={volume} onChange={this.volumeChange} />
              <span onClick={this.handleTranAll}>{localization['全部']}</span>
            </div>
          </div>
        </div>
      </Modal>
    );
  }
}
