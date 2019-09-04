import React, { PureComponent } from 'react';
import { Link } from 'react-router-dom';
import { Input, Slider, Button, message } from 'antd';
import classnames from 'classnames';

import styles from './transaction.less';

class TransactionForm extends PureComponent {
  state = {
    price: '',
    volume: '',
    sliderValue: 0
  };

  componentDidMount() {
    const { transactionType, bookData } = this.props;
    if (transactionType === 'buy') {
      this.setState({ price: bookData.buyOrderVOList[0]?.price });
    } else {
      this.setState({
        price: bookData.sellOrderVOList[bookData.sellOrderVOList.length - 1]?.price
      });
    }
  }

  componentDidUpdate(prevProps) {
    const { pickPrice, dispatch, tradePair, transactionType, bookData } = this.props;

    if (pickPrice) {
      this.setState({ price: pickPrice });
      dispatch({
        type: 'exchange/save',
        payload: { pickPrice: 0 }
      });
    }

    if (prevProps.tradePair !== tradePair) {
      this.setState({ volume: '' });
    }

    if (
      bookData.buyOrderVOList[0]?.coinMain !== prevProps.bookData.buyOrderVOList[0]?.coinMain ||
      bookData.buyOrderVOList[0]?.coinOther !== prevProps.bookData.buyOrderVOList[0]?.coinOther
    ) {
      if (transactionType === 'buy') {
        this.setState({
          price: bookData.sellOrderVOList[bookData.sellOrderVOList.length - 1]?.price
        });
      } else {
        this.setState({
          price: bookData.buyOrderVOList[0]?.price
        });
      }
    }
  }

  handleValue = e => {
    const { pricePrecision = 8, volumePrecision = 4 } = this.props.currentTrade;
    const key = e.target.id;
    const value = e.target.value;
    const curValue = this.state[key];
    const precision = key === 'volume' ? volumePrecision : pricePrecision;
    const reg = new RegExp(`^\\d{0,8}(\\d\\.\\d{0,${precision}})?$`);

    if (String(curValue).length < String(value).length) {
      if (reg.test(value)) {
        this.setState({ [key]: value });
      }
    } else {
      this.setState({ [key]: value });
    }
  };

  handleHolder = e => {
    e.target.previousSibling.focus();
  };

  handleSlideInput = value => {
    const { volumePrecision } = this.props.currentTrade;
    const { transactionType, mainVolume, coinVolume } = this.props;
    const { price } = this.state;
    const assetVolume = transactionType === 'buy' ? mainVolume : coinVolume;

    let volume = (transactionType === 'buy' ? assetVolume / price : assetVolume) * (value / 100);
    const reg = new RegExp(`(\\d{0,8})(\\.\\d{0,${volumePrecision}})?`);
    volume = String(volume).match(reg)[0] || '';
    this.setState({ volume, sliderValue: value });
  };

  handleTransaction = () => {
    const {
      transactionType,
      tradePair,
      localization,
      mainVolume,
      coinVolume,
      account
    } = this.props;
    const [coinOther, coinMain] = tradePair.split('/');
    const { price, volume } = this.state;
    const userId = account.id;
    const assetVolume = transactionType === 'buy' ? mainVolume : coinVolume;

    let msg;
    if (!assetVolume) msg = `资产不足`;
    if (volume <= 0) msg = '请输入数量';
    if (price <= 0) msg = '请输入价格';

    if (msg) {
      message.error(localization[msg]);
    } else {
      this.props.dispatch({
        type: 'exchange/transaction',
        payload: {
          userId,
          volume,
          price,
          coinMain,
          coinOther,
          transactionType
        },
        callback: () => {
          // 清空数据
          this.setState({
            price: '',
            volume: '',
            sliderValue: 0
          });
        }
      });
    }
  };

  render() {
    const {
      localization,
      tradePair,
      transactionType,
      mainVolume,
      coinVolume,
      isLogin,
      transactionAble,
      className,
      text,
      transferToCNY
    } = this.props;
    const { price, volume, sliderValue } = this.state;
    const [coinName, marketName] = tradePair.split('/');
    const assetVolume = transactionType === 'buy' ? mainVolume : coinVolume;

    let totalCount = 0;

    if (isNaN(price * volume)) {
      totalCount = 0;
    } else {
      totalCount = price * volume;
    }

    return (
      <ul {...{ className }}>
        <li>
          <Input className={styles.input} id="price" value={price} onChange={this.handleValue} />
          <span
            className={classnames({
              [styles.placeholder]: true,
              [styles.hasValue]: String(price)
            })}
            onClick={this.handleHolder}
          >
            {localization['价格']}
          </span>
          <span className={styles.text}>{marketName}</span>
          {price && (
            <span
              className={styles.transferToCNY}
              dangerouslySetInnerHTML={{
                __html: `&asymp;￥${transferToCNY(price, marketName)}`
              }}
            />
          )}
        </li>
        <li>
          <Input className={styles.input} id="volume" value={volume} onChange={this.handleValue} />
          <span
            className={classnames({
              [styles.placeholder]: true,
              [styles.hasValue]: String(volume)
            })}
            onClick={this.handleHolder}
          >
            {localization['数量']}
          </span>
          <span className={styles.text}>{coinName}</span>
        </li>
        <li>
          <Slider
            marks={{
              0: '',
              25: '',
              50: '',
              75: '',
              100: ''
            }}
            value={assetVolume ? sliderValue : 0}
            onChange={this.handleSlideInput}
            disabled={
              (transactionType === 'buy' && (Number(price) <= 0 || !mainVolume)) ||
              (transactionType === 'sell' && !coinVolume)
            }
          />
        </li>
        <li>
          <div className={styles.totalCount}>
            {localization['交易额']} {totalCount.toFixed(8)} {marketName}
          </div>
          {isLogin ? (
            <Button
              onClick={this.handleTransaction}
              ghost={!transactionAble}
              disabled={!transactionAble}
              className={`ant-btn-${transactionType}`}
              type={transactionAble ? 'default' : 'ghost'}
            >
              {`${localization[text]} ${coinName}`}
            </Button>
          ) : (
            <div className={styles.ghost}>
              <Link to="/login">{localization['登录']}</Link> {localization['或']}{' '}
              <Link to="/signup">{localization['注册']}</Link> {localization['进行交易']}
            </div>
          )}
        </li>
      </ul>
    );
  }
}

export default TransactionForm;
