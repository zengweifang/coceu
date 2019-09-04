import React, { PureComponent } from 'react';
import { Modal, Select, Input, message } from 'antd';
import request from 'utils/request';
import { toNonExponential } from 'utils';
import classnames from 'classnames';
import styles from './index.less';

const Option = Select.Option;

export default class WalletPopup extends PureComponent {
  state = {
    volume: '',
    from: '0', // 币币账户 0 , 超级钱包 3
    to: '3',
    allAssert: 0,
    loading: false,
    damages: 0
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
    if (/^\d*\.{0,1}\d{0,2}$/.test(value) && value.length < 16) {
      this.setState({ volume: value });
      const { breakRatio } = this.props;

      const damages = toNonExponential(value * breakRatio, 2);
      this.setState({ damages });
    }
  };

  handleTranAll = () => {
    const { allAssert } = this.state;
    const { breakRatio } = this.props;

    if (allAssert > 0) {
      this.setState({ volume: allAssert });

      const damages = toNonExponential(allAssert * breakRatio, 2)
      this.setState({ damages });
    }
  };

  //获取所有资产
  getAllAssert = from => {
    const { coinId } = this.props;
    //获取币币资产
    request(`/coin/volume/${coinId}`, {
      method: 'GET'
    }).then(json => {
      if (json.code === 10000000) {
        if (json.data) {
          const volume = json.data.volume;
          const allAssert = toNonExponential(volume * 1, 2);
          this.setState({ allAssert });
        }
      }
    });
  };

  transfer = () => {
    const { coinId, symbol, onOk } = this.props;
    const { volume, from } = this.state;
    const url = from === '0' ? `/super/volume/in` : `/super/volume/out`; //币币0-->超级钱包3 转入    超级钱包3--->币币0 // 转出
    request(url, {
      body: {
        coinId,
        symbol,
        volume,
      }
    }).then(json => {
      if (json.code === 10000000) {
        message.success(json.msg);
        onOk && onOk();
      }
    });
  };

  fromChange = value => {
    this.setState({ from: value });
    if (value === '0') {
      // 请求币币资产
      this.getAllAssert(value);
    } else {
      // 超级钱包资产
      const { assert } = this.props;
      this.setState({ allAssert: assert });
    }
  };

  toChange = value => {
    this.setState({ to: value });
  };

  render() {
    const { localization, symbol } = this.props;
    const { from, to, volume, allAssert, damages } = this.state;
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
              <Option value="3">{localization['超级钱包']}</Option>
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
              <Option value="3">{localization['超级钱包']}</Option>
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
          {from === '3' && <div className={styles.damagesLine}>{localization['违约金']}: <span>{damages}</span></div>}
        </div>
      </Modal>
    );
  }
}
