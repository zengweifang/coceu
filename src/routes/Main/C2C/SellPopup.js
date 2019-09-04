import React, { PureComponent } from "react";
import { connect } from "dva";
import request from "utils/request";
import { toNonExponential } from "utils";
import classnames from "classnames";
import { Modal, Button, Input, message } from "antd";
import styles from "./popup.less";

@connect(({ loading }) => ({
  sellLoading: loading.effects["c2c/offlineSell"]
}))
export default class BuyPopup extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      volume: "",
      amount: "",
      allAssert: ""
    };
  }
  componentDidMount() {
    this.getAllAssert();
  }

  handleCancel = () => {
    const { onCancel } = this.props;
    onCancel && onCancel();
  };

  getAllAssert = () => {
    const { currentCoin } = this.props;
    let { coinId, pointVolume } = currentCoin;

    request(`/offline/volume/${coinId}`, {
      method: "GET"
    }).then(json => {
      if (json.code === 10000000) {
        if (json.data) {
          const volume = json.data.volume;
          const allAssert = toNonExponential(volume, pointVolume);
          this.setState({ allAssert });
        }
      } else {
        message.destroy();
        message.error(json.msg);
      }
    });
  };

  handleOk = () => {
    const { localization, order, currentCoin, onOk } = this.props;
    const { volume } = this.state;
    const { minExVolume, lockVolume, successVolume } = order;
    const { pointVolume } = currentCoin;
    const maxVolume = (order.volume - lockVolume - successVolume).toFixed(
      pointVolume
    );
    if (Number(volume) > 0) {
      //判断数量
      if (
        Number(volume) >= Number(minExVolume) &&
        Number(volume) <= Number(maxVolume)
      ) {
        onOk && onOk(volume);
      } else {
        message.destroy();
        message.error(localization["数量不在范围之内"]);
      }
    } else {
      message.destroy();
      message.error(localization["请输入数量"]);
    }
  };

  // 数量 onChange
  volumeChange = volume => {
    const { currentCoin } = this.props;
    let { pointVolume } = currentCoin;
    let reg = "";
    if (pointVolume === 0) {
      pointVolume = 0;
      reg = new RegExp(`^\\d{0,8}(\\d{0,${pointVolume}})?$`);
    } else {
      pointVolume = pointVolume || 4;
      reg = new RegExp(`^\\d{0,8}(\\.\\d{0,${pointVolume}})?$`);
    }
    if (reg.test(volume)) {
      const { price } = this.props.order;

      let amount = (volume * (price > 0 ? price : 0)).toFixed(2);
      amount = amount > 0 ? amount : 0;
      this.setState({
        volume,
        amount
      });
    }
  };

  // 总价 onChange
  amountChange = amount => {
    const { currentCoin } = this.props;
    let { pointVolume } = currentCoin;
    let reg = "";
    if (pointVolume === 0) {
      pointVolume = 0;
      reg = new RegExp(`(\\d{0,8})(\\d{0,${pointVolume}})?`);
    } else {
      pointVolume = pointVolume || 4;
      reg = new RegExp(`(\\d{0,8})(\\.\\d{0,${pointVolume}})?`);
    }

    if (/^\d{0,8}\.{0,1}\d{0,2}$/.test(amount)) {
      const { price } = this.props.order;

      let volume = amount / price;

      let volumeTemp = String(volume).match(reg);
      if (volumeTemp) {
        volume = String(volume).match(reg)[0];
      }
      this.setState({ amount, volume });
    }
  };

  render() {
    const { currentCoin, order, sellLoading, localization } = this.props;
    let { price, lockVolume, successVolume, minExVolume } = order;
    const { pointVolume } = currentCoin;

    const maxVolume = (order.volume - lockVolume - successVolume).toFixed(
      pointVolume
    );
    const { volume, amount, allAssert } = this.state;

    if (!minExVolume) {
      minExVolume = 0;
    }

    return (
      <Modal
        title={`${localization["卖出"]}${currentCoin.symbol}`}
        wrapClassName="c2c-trade-modal"
        width={450}
        visible={true}
        footer={null}
        centered
        onCancel={this.handleCancel}
      >
        <div
          className={classnames({
            "c2c-trade-wrap": true,
            [styles.c2cSellWrap]: true
          })}
        >
          <div className="price-line">
            <Input
              value={price}
              size="large"
              disabled
              addonBefore={
                <div className={styles.addonWrap}>
                  {localization["价格"]}
                  (CNY)
                </div>
              }
            />
          </div>
          <div className={styles.volumeLine}>
            <div
              onClick={() => {
                const myPrice = order.price;

                console.log(allAssert, maxVolume);
                const myVolume =
                  Number(allAssert) > Number(maxVolume) ? maxVolume : allAssert;
                let amount = (myVolume * myPrice).toFixed(2);
                this.setState({ volume: myVolume, amount });
              }}
              className={styles.allSell}
            >
              {localization["全部"]}
            </div>
            <Input
              value={volume}
              size="large"
              onChange={e => {
                const volume = e.target.value;
                this.volumeChange(volume);
              }}
              addonBefore={
                <div className={styles.addonWrap}>
                  {localization["数量"]}
                  {currentCoin.symbol}
                </div>
              }
              placeholder={localization["请输入数量"]}
            />
            <div className={styles.volumeLimit}>
              <div>
                {localization["卖出最小限额"]}：
                <span>{minExVolume.toFixed(pointVolume)}</span>
              </div>
              <div>
                {localization["单据剩余数量"]}：<span>{maxVolume}</span>
              </div>
            </div>
          </div>
          <div>
            <Input
              value={amount}
              onChange={e => {
                const amount = e.target.value;
                this.amountChange(amount);
              }}
              size="large"
              addonBefore={
                <div className={styles.addonWrap}>
                  {localization["总额"]}
                  (CNY)
                </div>
              }
              placeholder={localization["请输入总价"]}
            />
          </div>
          <div>
            <Button
              icon="arrow-up"
              size="large"
              type="primary"
              className={styles.sellBtn}
              disabled={sellLoading}
              onClick={this.handleOk}
            >
              {localization["卖出"]}
              {currentCoin.symbol}
            </Button>
          </div>
        </div>
      </Modal>
    );
  }
}
