import React, { PureComponent } from 'react';
import { connect } from 'dva';
import classnames from 'classnames';
import request from 'utils/request';
import { Modal, Button, Tabs, Input, message } from 'antd';
import styles from './popup.less';

const TabPane = Tabs.TabPane;

@connect(({ loading }) => ({
  buyPublishLoading: loading.effects['c2c/buyPublish'],
  sellPublishLoading: loading.effects['c2c/sellPublish']
}))
export default class PublishPopup extends PureComponent {
  constructor(props) {
    super(props);

    const { currentCoin } = props;
    const { minVolume } = currentCoin;
    this.state = {
      buyPrice: '',
      buyVolume: '',
      buyExMinVolume: minVolume,
      butAmount: '',
      sellPrice: '',
      sellVolume: '',
      sellExMinVolume: '1',
      sellAmount: '',
      allAssets: 0
    };
  }

  componentDidMount() {
    this.getAllAssets();
  }

  handleCancel = () => {
    const { onCancel } = this.props;
    onCancel && onCancel();
  };
  //获取资产
  getAllAssets = () => {
    const { currentCoin } = this.props;
    const { coinId } = currentCoin;
    request(`/offline/volume/${coinId}`, {
      method: 'GET'
    }).then(json => {
      if (json.data) {
        this.setState({ allAssets: json.data.volume });
      }
    });
  };

  //计算手续费
  getTradeFee = volume => {
    const { currentCoin, tag } = this.props;
    const { feeType, sellFee, sellFeeStep } = currentCoin;

    //运营账号 不扣手续费
    if (tag && (tag.indexOf('FM') > -1 || tag.indexOf('YS') > -1)) {
      return 0;
    }
    let tradeFee = 0;
    if (feeType === '0') {
      // 不收手续费
      tradeFee = 0;
    } else if (feeType === '1') {
      if (sellFeeStep) {
        let point = sellFeeStep.split('|')[0];
        let feeValue = sellFeeStep.split('|')[1];
        if (volume > 0) {
          let number = Math.floor(volume / point);
          let yu = volume % point;
          if (yu > 0) {
            tradeFee = (number + 1) * feeValue;
          } else {
            tradeFee = number * feeValue;
          }
        }
      }
      // 按固定值收
    } else if (feeType === '2') {
      // 按比例收取
      if (sellFee) {
        tradeFee = volume * sellFee;
      }
    }
    return tradeFee;
  };

  // 价格 onChange
  priceChange = (tradeType, price) => {
    const { currentCoin } = this.props;
    let { pointPrice } = currentCoin;
    let reg = '';
    if (pointPrice === 0) {
      pointPrice = 0;
      reg = new RegExp(`^\\d{0,8}(\\d{0,${pointPrice}})?$`);
    } else {
      pointPrice = pointPrice || 2;
      reg = new RegExp(`^\\d{0,8}(\\.\\d{0,${pointPrice}})?$`);
    }
    if (reg.test(price)) {
      //const AmountReg = new RegExp(`(\\d{0,8})(\\.\\d{0,2})?`);
      const { buyVolume, sellVolume } = this.state;
      let volume = tradeType === 'buy' ? buyVolume : sellVolume;

      let amount = (price * (volume > 0 ? volume : 0)).toFixed(2);
      amount = amount > 0 ? amount : 0;
      this.setState({
        [`${tradeType}Price`]: price,
        [`${tradeType}Amount`]: amount
      });
    }
  };

  // 数量 onChange
  volumeChange = (tradeType, volume) => {
    const { currentCoin } = this.props;
    let { pointVolume } = currentCoin;
    let reg = '';
    if (pointVolume === 0) {
      pointVolume = 0;
      reg = new RegExp(`^\\d{0,8}(\\d{0,${pointVolume}})?$`);
    } else {
      pointVolume = pointVolume || 4;
      reg = new RegExp(`^\\d{0,8}(\\.\\d{0,${pointVolume}})?$`);
    }
    if (reg.test(volume)) {
      const { buyPrice, sellPrice } = this.state;
      let price = tradeType === 'buy' ? buyPrice : sellPrice;

      let amount = (volume * (price > 0 ? price : 0)).toFixed(2);
      amount = amount > 0 ? amount : 0;
      this.setState({
        [`${tradeType}Volume`]: volume,
        [`${tradeType}Amount`]: amount
      });
    }
  };
  // 最小数量
  exMinVolumeChange = (tradeType, volume) => {
    const { currentCoin } = this.props;
    let { pointVolume } = currentCoin;
    let reg = '';
    if (pointVolume === 0) {
      pointVolume = 0;
      reg = new RegExp(`^\\d{0,8}(\\d{0,${pointVolume}})?$`);
    } else {
      pointVolume = pointVolume || 4;
      reg = new RegExp(`^\\d{0,8}(\\.\\d{0,${pointVolume}})?$`);
    }
    if (reg.test(volume)) {
      this.setState({
        [`${tradeType}ExMinVolume`]: volume
      });
    }
  };

  // 总价 onChange
  amountChange = (tradeType, amount) => {
    const { currentCoin } = this.props;
    let { pointVolume } = currentCoin;
    let reg = '';
    if (pointVolume === 0) {
      pointVolume = 0;
      reg = new RegExp(`(\\d{0,8})(\\d{0,${pointVolume}})?`);
    } else {
      pointVolume = pointVolume || 4;
      reg = new RegExp(`(\\d{0,8})(\\.\\d{0,${pointVolume}})?`);
    }

    if (/^\d{0,8}\.{0,1}\d{0,2}$/.test(amount)) {
      const { buyPrice, sellPrice } = this.state;
      let price = tradeType === 'buy' ? buyPrice : sellPrice;

      let volume = amount / price;

      let volumeTemp = String(volume).match(reg);
      if (volumeTemp) {
        volume = String(volume).match(reg)[0];
      }

      this.setState({ [`${tradeType}Amount`]: amount });
      if (price > 0) {
        this.setState({ [`${tradeType}Volume`]: volume });
      }
    }
  };

  handleOk = tradeType => {
    const { localization } = this.props;
    const { currentCoin, onOk } = this.props;
    const { minPrice, maxPrice, minVolume, maxVolume } = currentCoin;
    const {
      buyPrice,
      buyVolume,
      buyExMinVolume,
      sellPrice,
      sellVolume,
      sellExMinVolume
    } = this.state;
    let price = tradeType === 'buy' ? buyPrice : sellPrice;
    let volume = tradeType === 'buy' ? buyVolume : sellVolume;
    let minExVolume = tradeType === 'buy' ? buyExMinVolume : sellExMinVolume;
    if (Number(price) > 0 && Number(volume) > 0 && Number(minExVolume) > 0) {
      //判断价格
      if (Number(volume) >= Number(minExVolume)) {
        if (Number(price) >= Number(minPrice) && Number(price) <= Number(maxPrice)) {
          //判断数量
          if (Number(volume) >= Number(minVolume) && Number(volume) <= Number(maxVolume)) {
            // 买入 最小成交数量要大于 minVolume
            if (tradeType === 'buy') {
              if (Number(minExVolume) >= minVolume) {
                onOk({ tradeType, price, volume, minExVolume });
              } else {
                message.destroy();
                message.error(`最小成交数量不能小于${minVolume}`);
              }
            } else {
              onOk({ tradeType, price, volume, minExVolume });
            }
          } else {
            message.destroy();
            message.error(localization['数量不在范围之内']);
          }
        } else {
          message.destroy();
          message.error(localization['价格不在范围之内']);
        }
      } else {
        message.destroy();
        message.error(`挂单数量不能小于最小成交数量`);
      }
    } else {
      message.destroy();
      message.error(localization['请先输入数量和价格以及最小数量']);
    }
  };

  render() {
    const { currentCoin, buyPublishLoading, sellPublishLoading, localization, theme } = this.props;
    const {
      buyPrice,
      buyVolume,
      buyExMinVolume,
      buyAmount,
      sellPrice,
      sellVolume,
      sellExMinVolume,
      sellAmount,
      allAssets
    } = this.state;

    const { pointVolume } = currentCoin;
    //手续费
    const tradeFee = this.getTradeFee(sellVolume);

    const regex = new RegExp(`(\\d{0,8})(\\.\\d{0,${pointVolume}})?`);
    const myAssert = String(allAssets).match(regex)[0];

    return (
      <Modal
        title={localization['发布广告']}
        wrapClassName={classnames({
          'c2c-publish-modal': true,
          'c2c-publish-dark': theme === 'dark'
        })}
        width={450}
        visible={true}
        footer={null}
        centered
        onCancel={this.handleCancel}
      >
        <div
          className={classnames({
            'c2c-publish-wrap': true,
            [styles.c2cPublishWrap]: true
          })}
        >
          <Tabs defaultActiveKey="buy">
            <TabPane tab={`${localization['买入']}${currentCoin.symbol}`} key="buy">
              <div>
                <Input
                  value={buyPrice}
                  size="large"
                  onChange={e => {
                    const price = e.target.value;
                    this.priceChange('buy', price);
                  }}
                  addonBefore={<div className={styles.addonWrap}>{localization['价格']}(CNY)</div>}
                  placeholder={localization['请输入价格']}
                />
                <div className={styles.limite}>
                  {localization['委托价格范围']} <span>{currentCoin.minPrice}</span>{' '}
                  {localization['到']} <span>{currentCoin.maxPrice}</span>
                </div>
              </div>
              <div>
                <Input
                  value={buyVolume}
                  size="large"
                  onChange={e => {
                    const volume = e.target.value;
                    this.volumeChange('buy', volume);
                  }}
                  addonBefore={
                    <div className={styles.addonWrap}>
                      {localization['数量']}
                      {currentCoin.symbol}
                    </div>
                  }
                  placeholder={localization['请输入数量']}
                />
                <div className={styles.limite}>
                  {localization['委托数量范围']} <span>{currentCoin.minVolume}</span>{' '}
                  {localization['到']} <span>{currentCoin.maxVolume}</span>
                </div>
              </div>
              <div className={styles.exMinVolume}>
                <Input
                  value={buyExMinVolume}
                  size="large"
                  onChange={e => {
                    const volume = e.target.value;
                    this.exMinVolumeChange('buy', volume);
                  }}
                  addonBefore={
                    <div className={styles.addonWrap}>{localization['最小成交数量']}</div>
                  }
                  placeholder={localization['请输入最小成交数量']}
                />
              </div>
              <div>
                <Input
                  value={buyAmount}
                  onChange={e => {
                    const amount = e.target.value;
                    this.amountChange('buy', amount);
                  }}
                  size="large"
                  addonBefore={<div className={styles.addonWrap}>{localization['总额']}(CNY)</div>}
                  placeholder={localization['请输入总价']}
                />
              </div>
              <div className={styles.line}>
                {localization['买卖交易必须30分钟内完成支付,否则系统自动取消交易']}
              </div>
              <div>
                <Button
                  icon="arrow-down"
                  size="large"
                  type="primary"
                  className={styles.buyBtn}
                  onClick={() => {
                    this.handleOk('buy');
                  }}
                  disabled={buyPublishLoading}
                >
                  {localization['买入']}
                  {currentCoin.symbol}
                </Button>
              </div>
            </TabPane>
            <TabPane tab={`${localization['卖出']}${currentCoin.symbol}`} key="sell">
              <div>
                <Input
                  onChange={e => {
                    const price = e.target.value;
                    this.priceChange('sell', price);
                  }}
                  value={sellPrice}
                  size="large"
                  addonBefore={<div className={styles.addonWrap}>{localization['价格']}(CNY)</div>}
                  placeholder={localization['请输入价格']}
                />
                <div className={styles.limite}>
                  {localization['委托价格范围']} <span>{currentCoin.minPrice}</span>{' '}
                  {localization['到']} <span>{currentCoin.maxPrice}</span>
                </div>
              </div>
              <div>
                <Input
                  value={sellVolume}
                  size="large"
                  onChange={e => {
                    const volume = e.target.value;
                    this.volumeChange('sell', volume);
                  }}
                  addonBefore={
                    <div className={styles.addonWrap}>
                      {localization['数量']}
                      {currentCoin.symbol}
                    </div>
                  }
                  placeholder={localization['请输入数量']}
                />
                <div
                  className={classnames({
                    [styles.limite]: true,
                    [styles.sellVolumeLimit]: true
                  })}
                >
                  <div>
                    {localization['委托数量范围']} <span>{currentCoin.minVolume}</span>{' '}
                    {localization['到']} <span>{currentCoin.maxVolume}</span>
                  </div>
                  <div className={styles.property}>
                    {localization['可卖出数量']}: <span>{myAssert}</span>
                  </div>
                </div>
              </div>
              <div className={styles.exMinVolume}>
                <Input
                  value={sellExMinVolume}
                  size="large"
                  onChange={e => {
                    const volume = e.target.value;
                    this.exMinVolumeChange('sell', volume);
                  }}
                  addonBefore={
                    <div className={styles.addonWrap}>{localization['最小成交数量']}</div>
                  }
                  placeholder={localization['请输入最小成交数量']}
                />
              </div>
              <div>
                <Input
                  value={sellAmount}
                  size="large"
                  onChange={e => {
                    const amount = e.target.value;
                    this.amountChange('sell', amount);
                  }}
                  addonBefore={<div className={styles.addonWrap}>{localization['总额']}(CNY)</div>}
                  placeholder={localization['请输入总价']}
                />
              </div>
              <div className={styles.line}>
                {localization['手续费']} <span className={styles.tradeFee}>{tradeFee}</span> ,
                {localization['挂单成功扣除手续费,撤销广告手续费不返还']}
              </div>
              <div>
                <Button
                  icon="arrow-up"
                  size="large"
                  type="primary"
                  className={styles.sellBtn}
                  disabled={sellPublishLoading}
                  onClick={() => {
                    this.handleOk('sell');
                  }}
                >
                  {localization['卖出']}
                  {currentCoin.symbol}
                </Button>
              </div>
            </TabPane>
          </Tabs>
        </div>
      </Modal>
    );
  }
}
