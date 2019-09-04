import React, { PureComponent } from "react";
import { connect } from "dva";
import classnames from "classnames";
import { message, Modal } from "antd";
import { getSessionStorage } from "utils";
import Coin from "./Coin.js";
import Advert from "./Advert.js";
import NoticePopup from "./NoticePopup";
import PublishPopup from "./PublishPopup";
import BuyPopup from "./BuyPopup";
import SellPopup from "./SellPopup";
import TransferPopup from "components/TransferPopup";
import { ToLogin } from "components/Placeholder";
import { getLocalStorage, setLocalStorage } from 'utils';
import MyTabs from "./MyTabs";


import styles from "./index.less";

@connect(({ c2c, global, loading }) => ({
  ...c2c,
  ...global,
  advertLoading: loading.effects["c2c/fetchAdvert"],
  publishLoading: loading.effects["c2c/checkPublish"]
}))
class C2C extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      popup: ""
    };
  }
  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({
      type: "c2c/fetchCoins"
    });

    this.showNoticePopup();

    // 默认主题
    const c2cTheme = getLocalStorage("c2cTheme");
    if (c2cTheme === 'dark') {
      dispatch({
        type: 'global/changeTheme',
        payload: 'dark'
      });
    }

  }

  componentWillUnmount() {
    const { dispatch } = this.props;
    dispatch({
      type: "c2c/clear"
    });

    // 还原主题
    dispatch({
      type: 'global/changeTheme',
      payload: 'light'
    });
  }

  // 首次进入显示 提醒 弹窗
  showNoticePopup = () => {
    const { localization } = this.props;
    const noticeProps = {
      localization
    };
    const c2cTextPopup = localStorage.getItem("c2cTipsPopup");
    if (!c2cTextPopup) {
      localStorage.setItem("c2cTipsPopup", "isShow");
      this.setState({
        popup: <NoticePopup {...noticeProps} onCancel={this.closeModal} />
      });
    }
  };

  changeCoin = (tradeType, currentCoin) => {
    const { dispatch } = this.props;
    dispatch({
      type: "c2c/save",
      payload: {
        tradeType,
        currentCoin,
        advertTotal: 0
      }
    });
    dispatch({
      type: "c2c/fetchAdvert",
      payload: {
        tradeType,
        currentCoin,
        currentPage: 1
      }
    });
  };

  // page onChange
  advertPageChange = page => {
    const { dispatch, tradeType, currentCoin } = this.props;
    dispatch({
      type: "c2c/save",
      payload: {
        advertPage: page
      }
    });
    dispatch({
      type: "c2c/fetchAdvert",
      payload: {
        tradeType,
        currentCoin,
        currentPage: page
      }
    });
  };

  closeModal = () => {
    this.setState({ popup: "" });
  };

  submitPublish = ({ tradeType, price, volume, minExVolume }) => {
    const { dispatch, currentCoin } = this.props;
    const { symbol, coinId } = currentCoin;
    let payload = {
      price,
      volume,
      minExVolume,
      symbol,
      coinId
    };
    if (tradeType === "sell") {
      payload.exType = 1;
    } else {
      payload.exType = 0;
    }

    dispatch({
      type: `c2c/${tradeType}Publish`,
      payload,
      callback: json => {
        if (json.code === 10000000) {
          message.success("发布广告成功");
          this.advertPageChange(1);
          this.closeModal();
        } else if (json.code === -9) {
        } else {
          message.error(json.msg);
        }
      }
    });
  };

  // 资产互转
  handleTransfer = () => {
    const { currentCoin, localization, isLogin } = this.props;
    if (isLogin) {
      const { coinId, symbol, pointVolume } = currentCoin;
      const transferProps = { coinId, symbol, localization, pointVolume };
      this.setState({
        popup: (
          <TransferPopup
            {...transferProps}
            onCancel={this.closeModal}
            onOk={this.closeModal}
          />
        )
      });
    } else {
      this.props.history.push("/login");
    }
  };

  // 检测是否可以发广告
  checkPublish = (exValidType, tag) => {
    const { dispatch, localization } = this.props;
    dispatch({
      type: "c2c/checkPublish",
      callback: json => {
        if (json.code === 10000000) {
          // 发广告
          const { currentCoin, theme } = this.props;

          const publishProps = {
            localization,
            currentCoin,
            exValidType,
            tag,
            theme
          };
          this.setState({
            popup: (
              <PublishPopup
                {...publishProps}
                onCancel={this.closeModal}
                onOk={({ tradeType, price, volume, minExVolume }) => {
                  this.submitPublish({
                    tradeType,
                    price,
                    volume,
                    minExVolume
                  });
                }}
              />
            )
          });
        } else if (json.code === 10004017) {
          //进行身份认证
          Modal.confirm({
            centered: true,
            title: localization["发布广告"],
            content: localization["为保证资金安全,请在交易前实名认证"],
            okText: localization["去实名"],
            cancelText: localization["取消"],
            onOk: () => {
              this.props.history.push("/account/certification");
            }
          });
        } else if (json.code === 10004018) {
          //请先绑定银行卡
          Modal.confirm({
            centered: true,
            title: localization["发布广告"],
            content: localization["为保证交易顺畅,请在交易前绑定银行卡"],
            okText: localization["去绑卡"],
            cancelText: localization["取消"],
            onOk: () => {
              this.props.history.push("/account/payment");
            }
          });
        } else if (json.code === 10005036) {
          //请先绑定手机
          Modal.confirm({
            centered: true,
            title: localization["发布广告"],
            content: localization["为保证交易顺畅,请在交易前绑定手机号"],
            okText: localization["去绑手机号"],
            cancelText: localization["取消"],
            onOk: () => {
              this.props.history.push("/account/security");
            }
          });
        } else {
          message.destroy();
          message.error(json.msg);
        }
      }
    });
  };

  //点击发广告
  handlePublish = () => {
    const { localization, isLogin, account } = this.props;

    if (isLogin) {
      const { exValidType, tag } = account;
      if (exValidType) {
        this.checkPublish(exValidType, tag);
      } else {
        //请先设置 交易密码
        Modal.confirm({
          centered: true,
          title: localization["发布广告"],
          content: localization["为保证交易顺畅,请在发广告前设置交易验证方式"],
          okText: localization["去设置"],
          cancelText: localization["取消"],
          onOk: () => {
            this.props.history.push("/account/security");
          }
        });
      }
    } else {
      this.props.history.push("/login");
    }
  };

  //点击 买入 买出
  tradeClick = (tradeType, item) => {
    const { isLogin } = this.props;

    if (isLogin) {
      if (tradeType === "buy") {
        // 点击买入
        const { currentCoin, localization } = this.props;
        const buyProps = {
          localization,
          currentCoin,
          order: item
        };
        this.setState({
          popup: (
            <BuyPopup
              {...buyProps}
              onCancel={this.closeModal}
              onOk={volume => {
                const { currentCoin, dispatch } = this.props;
                const { coinId, symbol } = currentCoin;
                const { id } = item;
                dispatch({
                  type: "c2c/offlineBuy",
                  payload: {
                    volume,
                    orderId: id,
                    coinId,
                    symbol
                  },
                  callback: json => {
                    if (json.code === 10000000) {
                      message.success(localization["买入成功"]);
                      this.closeModal();

                      const { orderId } = json.data;
                      this.props.history.push({
                        pathname: "/c2c/order",
                        search: `?orderId=${orderId}`
                      });
                    } else if (json.code === 10004016) {
                      //自己不能卖给自己
                      Modal.error({
                        centered: true,
                        title: `${localization["买入"]}${currentCoin.symbol}`,
                        content: localization["自己不能卖给自己"],
                        okText: localization["确定"]
                      });
                    } else if (json.code === 10004009) {
                      //没有足够资产
                      Modal.error({
                        centered: true,
                        title: `${localization["买入"]}${currentCoin.symbol}`,
                        content: json.msg,
                        okText: localization["确定"]
                      });
                    } else {
                      message.destroy();
                      message.error(json.msg);
                    }
                  }
                });
              }}
            />
          )
        });
      } else {
        // 点击卖出
        const { currentCoin, localization, account } = this.props;
        const { exValidType } = account;

        if (exValidType) {
          const sellProps = {
            localization,
            currentCoin,
            order: item
          };
          this.setState({
            popup: (
              <SellPopup
                {...sellProps}
                onCancel={this.closeModal}
                onOk={volume => {
                  const { currentCoin, dispatch } = this.props;
                  const { coinId, symbol } = currentCoin;
                  const { id } = item;
                  dispatch({
                    type: "c2c/offlineSell",
                    payload: {
                      volume,
                      orderId: id,
                      coinId,
                      symbol
                    },
                    callback: json => {
                      if (json.code === 10000000) {
                        message.success(localization["卖出成功"]);
                        this.closeModal();
                        const { orderId } = json.data;
                        this.props.history.push({
                          pathname: "/c2c/order",
                          search: `?orderId=${orderId}`
                        });
                      } else if (json.code === 10004016) {
                        //自己不能卖给自己
                        Modal.error({
                          centered: true,
                          title: `${localization["卖出"]}${currentCoin.symbol}`,
                          content: localization["自己不能卖给自己"],
                          okText: localization["确定"]
                        });
                      } else if (json.code === 10004009) {
                        //没有足够资产
                        Modal.error({
                          centered: true,
                          title: `${localization["卖出"]}${currentCoin.symbol}`,
                          content: json.msg,
                          okText: localization["确定"]
                        });
                      } else if (json.code === 10004017) {
                        //请进行身份认证
                        Modal.confirm({
                          centered: true,
                          title: `${localization["卖出"]}${currentCoin.symbol}`,
                          content:
                            localization["为保证资金安全,请在交易前实名认证"],
                          okText: localization["去实名"],
                          cancelText: localization["取消"],
                          onOk: () => {
                            this.props.history.push("/account/certification");
                          }
                        });
                      } else if (json.code === 10004018) {
                        //请先绑定银行卡
                        Modal.confirm({
                          centered: true,
                          title: `${localization["卖出"]}${currentCoin.symbol}`,
                          content:
                            localization["为保证资金安全,请在交易前绑定银行卡"],
                          okText: localization["去绑卡"],
                          cancelText: localization["取消"],
                          onOk: () => {
                            this.props.history.push("/account/payment");
                          }
                        });
                      } else if (json.code === -9) {
                      } else {
                        message.destroy();
                        message.error(json.msg);
                      }
                    }
                  });
                }}
              />
            )
          });
        } else {
          Modal.confirm({
            centered: true,
            title: localization["卖出"],
            content:
              localization["为保证交易顺畅,请在发广告前设置交易验证方式"],
            okText: localization["去设置"],
            cancelText: localization["取消"],
            onOk: () => {
              this.props.history.push("/account/security");
            }
          });
        }
      }
    } else {
      this.props.history.push("/login");
    }
  };

  render() {
    const { popup } = this.state;
    const {
      theme,
      isLogin,
      coinList,
      localization,
      tradeType,
      currentCoin,
      advertLoading,
      advertList,
      advertPage,
      advertTotal,
      publishLoading
    } = this.props;

    const coinProps = {
      localization,
      coinList,
      tradeType,
      currentCoin,
      publishLoading,
      changeCoin: this.changeCoin,
      handleTransfer: this.handleTransfer,
      handlePublish: this.handlePublish,
      theme,
      changeTheme: (theme) => {
        const { dispatch } = this.props;

        setLocalStorage('c2cTheme', theme);

        dispatch({
          type: 'global/changeTheme',
          payload: theme
        });
      }
    };

    const advertProps = {
      localization,
      advertLoading,
      tradeType,
      advertList,
      advertPage,
      currentCoin,
      advertTotal,
      advertPageChange: this.advertPageChange,
      tradeClick: this.tradeClick
    };

    const myTabsProps = {
      localization,
      theme
    };

    return (
      <div className="c2c-wrap">
        <div className={classnames({ [styles.c2c]: true, 'c2c-dark': true })}>
          <div className="c2c-container">
            <Coin {...coinProps} />
            <Advert {...advertProps} />
          </div>
          <div className="c2c-container-wrap">
            <div
              className={classnames({
                [styles.userOrderWrap]: true,
                "c2c-container": true,
                'container-dark': true,
              })}
            >
              <MyTabs {...myTabsProps} />
              {!isLogin && (
                <div className={classnames({ [styles.userOrderMask]: true, 'order-mask-dark': true })}>
                  <ToLogin {...{ localization }} />
                </div>
              )}
            </div>
          </div>
        </div>
        {popup}
      </div>
    );
  }
}

export default C2C;
