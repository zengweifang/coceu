import React, { Component } from 'react';
import request from 'utils/request';
import { connect } from 'dva';
import classnames from 'classnames';
import Scrollbars from 'react-custom-scrollbars';
import { Button, Input, Upload, message, Modal } from 'antd';
import ReconnectingWebSocket from 'utils/ReconnectingWebSocket';
import { IMAGES_URL, WS_PREFIX, IM_PREFIX, IMAGES_ADDRESS } from 'utils/constants.js';
import { stampToDate, getLocalStorage } from 'utils';
import { Loading } from 'components/Placeholder';
import ReceiptPopup from './ReceiptPopup';
import CancelPopup from './CancelPopup';
import AppealPopup from './AppealPopup';

import error from 'assets/images/error.png';

import styles from './index.less';

const chatPassword = '123456';

@connect(({ c2c, loading }) => ({
  ...c2c,
  confirmPayLoading: loading.effects['c2c/confirmPay'],
  receiptLoading: loading.effects['c2c/confirmReceipt']
}))
export default class C2cOrder extends Component {
  constructor(props) {
    super(props);

    this.state = {
      messageValue: '',
      messageList: [],
      order: {},
      getMessage: true,
      popup: '',
      remainingTime: '' //倒计时 时间
    };
  }

  // 根据 订单id 获取详情
  getOrderDetail = ({ orderId, callback }) => {
    request(`/offline/orderDetail/${orderId}`, {
      method: 'GET'
    }).then(json => {
      if (json.code === 10000000) {
        let order = json.data;
        // order.remainingTime = 20;
        this.setState({
          order,
          remainingTime: order.remainingTime
        });
        callback(json.data);
      }
    });
  };

  // 订单 倒计时
  clockTimeout = flag => {
    if (flag) {
      this.timer = setTimeout(() => {
        const { remainingTime, order } = this.state;
        const { status } = order;
        if (remainingTime > 0 && status === 0) {
          this.setState({ remainingTime: remainingTime - 1 });
          this.clockTimeout(true);
        } else {
          this.clockTimeout(false);
        }
      }, 1000);
    } else {
      clearTimeout(this.timer);
    }
  };

  componentDidMount() {
    const { location, dispatch } = this.props;
    const { search } = location;

    //默认主题
    const c2cTheme = getLocalStorage('c2cTheme');
    if (c2cTheme === 'dark') {
      dispatch({
        type: 'global/changeTheme',
        payload: 'dark'
      });
    }

    const orderId = search ? search.split('=')[1] : '';
    this.getOrderDetail({
      orderId,
      callback: order => {
        const { userId, remainingTime, status } = order;

        // 打开订单socket
        this.connectOrderSocket(userId);

        //打开聊天 socket
        this.connectChatSocket(order);

        // 开始倒计时
        if (remainingTime > 0 && status === 0) {
          this.clockTimeout(true);
        }
      }
    });
  }
  componentWillUnmount() {
    const { dispatch } = this.props;
    clearInterval(this.orderIntervsal);
    this.orderSocket && this.orderSocket.close();
    this.chatSocket && this.chatSocket.close();

    dispatch({
      type: 'global/changeTheme',
      payload: 'light'
    });
  }

  // 订单 socket
  connectOrderSocket = userId => {
    let { order } = this.state;
    this.orderSocket = new ReconnectingWebSocket(`${WS_PREFIX}/c2cUser?${userId}`);
    this.orderSocket.onopen = () => {
      if (this.orderSocket.readyState === 1) {
        this.orderSocket.send('ping');
      }
    };
    this.orderIntervsal = setInterval(() => {
      if (this.orderSocket.readyState === 1) {
        this.orderSocket.send('ping');
      }
    }, 1000 * 10);

    this.orderSocket.onmessage = evt => {
      if (evt.data === 'pong') {
        return;
      }
      const record = JSON.parse(evt.data);

      if (record.subOrderId) {
        if (order.subOrderId === record.subOrderId) {
          order.status = record.status;
          this.setState({ order });
        }
      }
    };
  };

  // 聊天 socket
  connectChatSocket = order => {
    const { subOrderId, userId } = order;
    this.chatSocket = new ReconnectingWebSocket(
      `${IM_PREFIX}?username=${subOrderId}_${userId}&password=${chatPassword}`
    );

    this.chatSocket.onopen = () => {
      const msgKey = subOrderId + '_' + userId;
      const offlineMsg = `{"cmd": 19,"type": "0","userId":"${msgKey}"}`;
      if (this.chatSocket.readyState === 1) {
        // 获取离线消息
        this.chatSocket.send(offlineMsg);
      }
    };

    this.chatSocket.onmessage = evt => {
      if (evt.data === 'pong') {
        return;
      }
      const json = JSON.parse(evt.data);
      const { askUserId, subOrderId } = order;

      if (json.command === 20 && json.code === 10016) {
        //离线消息
        const friends = json.data.friends;
        const msgKey = subOrderId + '_' + askUserId;
        if (
          friends &&
          Object.keys(friends).some(item => {
            return item === msgKey;
          })
        ) {
          let messageList = friends[msgKey].map(item => {
            item.userType = 0; //0是对方的消息
            return item;
          });
          this.setState({ messageList });
        }
      } else if (json.command === 11) {
        // 收到对方的消息
        let { messageList } = this.state;
        let newMsg = json.data;

        newMsg.userType = 0; // 0是对方的消息
        if (Array.isArray(messageList)) {
          messageList.push(newMsg);
          this.setState({ messageList });
        }
      } else if (json.command === 20 && json.code === 10018) {
        if (json.data && json.data.friends) {
          const friends = json.data.friends;
          const msgKey = subOrderId + '_' + askUserId;
          if (
            friends &&
            Object.keys(friends).some(item => {
              return item === msgKey;
            })
          ) {
            let { messageList } = this.state;
            let myList = friends[msgKey].map(item => {
              let id = item.from.split('_')[1];
              if (id === askUserId) {
                item.userType = 0; //0是对方的消息
              } else {
                item.userType = 1;
              }
              return item;
            });
            messageList = myList;
            this.setState({ messageList });

            const { chatScroll } = this.refs;
            chatScroll && chatScroll.scrollToBottom();
          }
        }
      }
    };
  };

  // 发送消息
  sendMessage = () => {
    let { messageValue, order, messageList } = this.state;
    if (messageValue) {
      const { askUserId, userId, subOrderId } = order;
      if (this.chatSocket) {
        const createTime = new Date().getTime();
        const msg = `{"from":"${subOrderId}_${userId}","to":"${subOrderId}_${askUserId}","cmd":11,"createTime":${createTime},"chatType":"2","msgType": "0","content":"${messageValue}"}`;

        if (this.chatSocket.readyState === 1) {
          this.chatSocket.send(msg);
        }

        let myMsg = {
          from: `${subOrderId}_${userId}`,
          to: `${subOrderId}_${askUserId}`,
          content: messageValue,
          userType: 1,
          msgType: 0,
          createTime
        };

        if (Array.isArray(messageList)) {
          messageList.push(myMsg);
          const { chatScroll } = this.refs;
          chatScroll && chatScroll.scrollToBottom();
        }

        this.setState({ messageValue: '', messageList });
      }
    }
  };

  //获取历史消息
  getHistoryMsg = () => {
    if (this.chatSocket) {
      const { order } = this.state;
      const { subOrderId, userId, askUserId } = order;
      const msgKey = subOrderId + '_' + userId;
      const friendId = subOrderId + '_' + askUserId;
      const historyMsg = `{"cmd":19,"type": "1","fromUserId":"${friendId}","userId":"${msgKey}"}`;
      if (this.chatSocket.readyState === 1) {
        this.chatSocket.send(historyMsg);
        this.setState({ getMessage: false });
      }
    }
  };

  messageChange = e => {
    this.setState({ messageValue: e.target.value });
  };

  // 确认付款
  confirmPay = () => {
    let { order } = this.state;
    const { dispatch, localization } = this.props;

    const { totalPrice, radomNum, orderId, subOrderId } = order;
    const receiptProps = {
      totalPrice,
      radomNum,
      localization,
      type: 'pay'
    };
    this.setState({
      popup: (
        <ReceiptPopup
          {...receiptProps}
          onCancel={this.closePopup}
          onOk={() => {
            dispatch({
              type: 'c2c/confirmPay',
              payload: {
                orderId: orderId,
                subOrderId: subOrderId
              },
              callback: json => {
                if (json.code === 10000000) {
                  this.closePopup();
                  message.success('确认付款成功');
                  const status = json.data;
                  order.status = status;
                  this.setState({ order });
                }
              }
            });
          }}
        />
      )
    });
  };

  //确认收款
  confirmReceipt = () => {
    let { order } = this.state;
    const { dispatch, localization } = this.props;

    const { totalPrice, radomNum, orderId, subOrderId } = order;
    const receiptProps = {
      totalPrice,
      radomNum,
      localization,
      type: 'receive'
    };
    this.setState({
      popup: (
        <ReceiptPopup
          {...receiptProps}
          onCancel={this.closePopup}
          onOk={() => {
            dispatch({
              type: 'c2c/confirmReceipt',
              payload: {
                orderId,
                subOrderId
              },
              callback: json => {
                if (json.code === 10000000) {
                  this.closePopup();
                  message.success('确认收款');
                  const status = json.data;

                  order.status = status;
                  this.setState({ order });
                }
              }
            });
          }}
        />
      )
    });
  };

  //取消订单
  handleCancel = () => {
    let { order } = this.state;
    const { dispatch, localization } = this.props;
    const { orderId, subOrderId } = order;
    const cancelProps = { localization };

    this.setState({
      popup: (
        <CancelPopup
          {...cancelProps}
          onCancel={this.closePopup}
          onOk={() => {
            dispatch({
              type: 'c2c/cancelOrder',
              payload: {
                orderId,
                subOrderId
              },
              callback: json => {
                if (json.code === 10000000) {
                  this.closePopup();
                  message.success('取消成功');
                  const status = json.data;

                  order.status = status;
                  this.setState({ order });
                }
              }
            });
          }}
        />
      )
    });
  };

  // 提交申诉
  submitAppeal = params => {
    request('/offline/appeal/doappeal', {
      body: params
    }).then(json => {
      if (json.code === 10000000) {
        message.success('提交成功');
        this.closePopup();
      }
    });
  };

  // 申诉
  handleAppeal = () => {
    const { order } = this.state;
    const { localization } = this.props;
    const { subOrderId } = order;
    const appealProps = { localization };
    // 检查申诉
    request('/offline/appeal/check', {
      method: 'GET',
      body: {
        subOrderId
      }
    }).then(json => {
      if (json.code === 10000000) {
        this.setState({
          popup: (
            <AppealPopup
              {...appealProps}
              onCancel={this.closePopup}
              onOk={result => {
                let params = result;
                params.subOrderId = subOrderId;
                this.submitAppeal(params);
              }}
            />
          )
        });
      }
    });
  };

  closePopup = () => {
    this.setState({ popup: '' });
  };

  //显示图片
  showImagePopup = imgUrl => {
    this.setState({
      popup: (
        <Modal visible={true} centered footer={null} onCancel={this.closePopup}>
          <img alt="二维码" style={{ width: '100%' }} src={imgUrl} />
          {/*  <img
            alt="二维码"
            style={{ width: "100%" }}
            src={`${IMAGES_URL}/image/2018/9/19/239ae7bea97549c49a95981b9cc0140c.jpg?x-oss-process=style/uesstyle`}
          /> */}
        </Modal>
      )
    });
  };

  formatRemainTime = remainSecond => {
    const { localization } = this.props;
    if (remainSecond > 0) {
      let minute = Math.floor(remainSecond / 60);
      minute = minute < 10 ? `0${minute}` : minute;
      let second = remainSecond % 60;
      second = second < 10 ? `0${second}` : second;
      return `${minute}${localization['分']}${second}${localization['秒']}`;
    }
    return 0;
  };

  render() {
    const { localization } = this.props;
    let { messageValue, getMessage, order, popup, messageList, remainingTime } = this.state;
    const {
      askUserMobile = '----',
      subOrderId = '----',
      remarks,
      status,
      price = '----',
      symbol = '----',
      totalPrice = '----',
      volume = '----',
      radomNum = '----',
      sellBankBranchName,
      sellBankName,
      sellBankNo,
      alipayNo,
      wechatNo,
      alipayQrcodeId,
      wechatQrcodeId,
      askUserName,
      userName
    } = order;

    const that = this;

    const props = {
      action: `${IMAGES_ADDRESS}/upload`, //"http://images.uescoin.com/upload"
      showUploadList: false,
      beforeUpload: file => {
        const isImage = file.type.indexOf('image') > -1;
        if (!isImage) {
          message.error('请上传图片');
        }
        const isLt1M = file.size / 1024 / 1024 < 1;
        if (!isLt1M) {
          message.error('图片大小不能超过1M');
        }

        return isImage && isLt1M;
      },
      onChange(info) {
        if (info.file.status === 'uploading') {
          // console.log(info.file, info.fileList);

          const createTime = new Date().getTime();
          const { askUserId, userId, subOrderId } = order;
          let myMsg = {
            from: `${subOrderId}_${userId}`,
            to: `${subOrderId}_${askUserId}`,
            content: '',
            userType: 1,
            msgType: 1,
            createTime,
            uid: info.file.uid,
            loading: true
          };
          const has = messageList.some(item => {
            return item.uid === info.file.uid;
          });
          if (!has) {
            messageList.push(myMsg);
            that.setState({ messageList });

            const { chatScroll } = that.refs;
            chatScroll && chatScroll.scrollToBottom();
          }
        }
        if (info.file.status === 'done') {
          const { askUserId, userId, subOrderId } = order;

          if (that.chatSocket) {
            const createTime = new Date().getTime();
            const imgUrl = `${IMAGES_URL}/${info.file.response}`;
            const msg = `{"from":"${subOrderId}_${userId}","to":"${subOrderId}_${askUserId}","cmd":11,"createTime":${createTime},"chatType":"2","msgType": "1","content":"${imgUrl}"}`;

            if (that.chatSocket.readyState === 1) {
              that.chatSocket.send(msg);
            }
            const myList = messageList.map(item => {
              if (item.uid === info.file.uid) {
                item.loading = false;
                item.content = imgUrl;
              }
              return item;
            });
            that.setState({ messageList: myList });
          }
        }
        if (info.file.status === 'error') {
          const myList = messageList.map(item => {
            if (item.uid === info.file.uid) {
              item.loading = false;
              item.content = error;
            }
            return item;
          });
          that.setState({ messageList: myList });
        }
      }
    };

    const myRemainingTime = this.formatRemainTime(remainingTime);

    const sellerName = remarks === 'buy' ? askUserName : userName;

    return (
      <div className={classnames({ [styles.c2cOrderWrap]: true, 'c2c-order-detail-dark': true })}>
        <div className={styles.orderInfo}>
          <ul>
            <li>
              <span>{localization['订单号']}: </span>
              {subOrderId}
            </li>
            <li>
              <span>{localization['数量']}: </span>
              {volume} {symbol}
            </li>
            <li>
              <span>{localization['单价']}: </span>
              {price} CNY/
              {symbol}
            </li>
            <li className={styles.totalPrice}>
              <span>{localization['总价']}: </span>
              <strong>{totalPrice}</strong> CNY
            </li>
            <li className={styles.referenceLine}>
              <span>{localization['付款参考号']}: </span> <strong>{radomNum}</strong>
            </li>
          </ul>
          <div className={styles.payMethod}>
            <h4>{localization['卖方收款方式']}</h4>
            <ul>
              {sellBankNo && (
                <li>
                  <i
                    className="iconfont icon-copy copy-btn"
                    data-clipboard-text={`${sellerName} ${sellBankNo} ${sellBankName}`}
                  />
                  <span className={styles.payTitle}>{localization['银行卡']}</span>
                  <span>{sellerName}</span>
                  <span>{sellBankNo}</span>
                  <span>{sellBankName}</span>
                  <span>{sellBankBranchName}</span>
                </li>
              )}
              {alipayQrcodeId && (
                <li>
                  <i
                    className="iconfont icon-copy copy-btn"
                    data-clipboard-text={`${sellerName} ${alipayNo}`}
                  />
                  <span className={styles.payTitle}>{localization['支付宝']}</span>
                  <span>{sellerName}</span>
                  <span>{alipayNo}</span>
                  <i
                    className={classnames({
                      'iconfont icon-erweima': true,
                      [styles.payCode]: true
                    })}
                    onClick={() => {
                      this.showImagePopup(`${IMAGES_URL}/${alipayQrcodeId}`);
                    }}
                  />
                </li>
              )}
              {wechatQrcodeId && (
                <li>
                  <i
                    className="iconfont icon-copy copy-btn"
                    data-clipboard-text={`${sellerName} ${wechatNo}`}
                  />
                  <span className={styles.payTitle}>{localization['微信']}</span>
                  <span>{sellerName}</span>
                  <span>{wechatNo}</span>
                  <i
                    className={classnames({
                      'iconfont icon-erweima': true,
                      [styles.payCode]: true
                    })}
                    onClick={() => {
                      this.showImagePopup(`${IMAGES_URL}/${wechatQrcodeId}`);
                    }}
                  />
                </li>
              )}
            </ul>
          </div>
          <div className={styles.orderAmount}>
            {status === 0 &&
              (remarks === 'buy' ? (
                <div>
                  {remainingTime > 0 ? (
                    <p>
                      {localization['待支付,请于']}
                      <span className={styles.payTime}> {myRemainingTime} </span>
                      {localization['内向']} {askUserName} {localization['支付']}
                      <span className={styles.active}>
                        {totalPrice}
                        CNY
                      </span>
                    </p>
                  ) : (
                    <p>{localization['未在指定时间内付款,订单已取消']}</p>
                  )}
                </div>
              ) : (
                <div>
                  {remainingTime > 0 ? (
                    <p>
                      {localization['待收款']},{askUserName} {localization['将在']}
                      <span className={styles.payTime}> {myRemainingTime} </span>
                      {localization['向您支付']}
                      <span className={styles.active}>
                        {totalPrice}
                        CNY
                      </span>
                    </p>
                  ) : (
                    <p>{localization['未在指定时间内付款,订单已取消']}</p>
                  )}
                </div>
              ))}
            {status === 1 &&
              (remarks === 'buy' ? (
                <div>
                  {localization['您向']} {askUserName} {localization['支付了']}
                  <span className={styles.active}>
                    {totalPrice}
                    CNY
                  </span>
                </div>
              ) : (
                <div>
                  {askUserName} {localization['向您支付了']}
                  <span className={styles.active}>
                    {totalPrice}
                    CNY
                  </span>
                </div>
              ))}
            {status === 2 && (
              <div className={styles.orderStatusText}>{localization['订单已完成']}</div>
            )}
            {status === 4 && (
              <div className={styles.orderStatusText}>{localization['订单被申诉']}</div>
            )}
            {status === 9 && (
              <div className={styles.orderStatusText}>{localization['订单已取消']}</div>
            )}
          </div>
          <div className={styles.orderBtn}>
            {remarks === 'buy' && status === 0 && (
              <Button type="primary" size="large" onClick={this.confirmPay}>
                {localization['我已付款给商家']}
              </Button>
            )}
            {remarks === 'buy' && status === 1 && (
              <div className={styles.noticeBtn}>{localization['我已付款给商家']}</div>
            )}
            {remarks === 'sell' && status === 0 && (
              <div className={styles.noticeBtn}>{localization['等待商家确认付款']}</div>
            )}
            {remarks === 'sell' && status === 1 && (
              <Button type="primary" size="large" onClick={this.confirmReceipt}>
                {localization['确认收款']}
              </Button>
            )}

            {remarks !== 'sell' && (status === 0 || status === 1) && (
              <div className={styles.cancelOrder} onClick={this.handleCancel}>
                {localization['取消订单']}
              </div>
            )}
          </div>
          <div className={styles.orderText}>
            <p>{localization['转账注意事项']} :</p>
            <p>
              1. {localization['在转账过程中']},
              <strong> {localization['请勿备注类似USDT,UES等信息']}, </strong>
              {localization['防止造成您的转账被拦截,由此造成的损失由转账方负责']}
            </p>
            <p>
              2.
              <strong> {localization['请勿使用非平台实名的银行卡/支付宝等进行转款']}, </strong>
              {localization['否则卖家可拒绝成交并投诉']}.
            </p>
            <p>
              3.
              {
                localization[
                  '若交易金额大于50,000CNY,法定假日或工作日17:00点以后汇款到银行卡可能造成到账不及时,请分批支付保证及时到账,若未及时到账,卖家有权拒绝成交'
                ]
              }
              .
            </p>
            <p>
              4.
              {
                localization[
                  '买家给卖家付款时,请使用平台显示的卖家收款信息,勿向卖家私自发的收款帐号转账,否则由此产生的争议,由买家自行承担'
                ]
              }
              。
            </p>
          </div>
        </div>
        <div className={classnames({ [styles.chatWrap]: true, 'c2c-chat-wrap-dark': true })}>
          <div className={classnames({ [styles.chatHeader]: true, 'chat-header-dark': true })}>
            <div className={styles.askName}>
              <h4>{askUserName && askUserName.charAt(0)}</h4>
              <ul>
                <li>{askUserName}</li>
                <li>{askUserMobile}</li>
              </ul>
            </div>
            {status === 1 && (
              <div className={styles.appeal} onClick={this.handleAppeal}>
                <i className="iconfont icon-zaixianshensu" />
                {localization['申请客服处理']}
              </div>
            )}
          </div>
          <div className={styles.chatMsg}>
            <Scrollbars ref="chatScroll" style={{ height: 450, width: '100%' }}>
              <ul className={styles.messageUl}>
                {getMessage && (
                  <li className={styles.history} onClick={this.getHistoryMsg}>
                    <span>{localization['获取历史消息']}</span>
                  </li>
                )}
                {messageList &&
                  messageList.map((msg, index) => {
                    const { msgType, userType } = msg;
                    if (msgType === 5) {
                      // 公共消息
                      return (
                        <li className={styles.msgPublic} key={index}>
                          <div className={styles.time}>
                            {stampToDate(msg.createTime * 1, 'MM-DD hh:mm:ss')}
                          </div>
                          <p className={styles.content}>{msg.content}</p>
                        </li>
                      );
                    } else if (msgType === 0) {
                      // 文字
                      return userType === 0 ? (
                        <li
                          className={classnames({ [styles.msgLeft]: true, 'msg-left-dark': true })}
                          key={index}
                        >
                          <div className={styles.time}>
                            {stampToDate(msg.createTime * 1, 'MM-DD hh:mm:ss')}
                          </div>
                          <div className={styles.word}>
                            <h3>
                              <span>{askUserName && askUserName.charAt(0)}</span>
                            </h3>
                            <p>{msg.content}</p>
                          </div>
                        </li>
                      ) : (
                        <li
                          className={classnames({
                            [styles.msgRight]: true,
                            'msg-right-dark': true
                          })}
                          key={index}
                        >
                          <div className={styles.time}>
                            {stampToDate(msg.createTime * 1, 'MM-DD hh:mm:ss')}
                          </div>
                          <div className={styles.word}>
                            <p>{msg.content}</p>
                            <h3>
                              <span>{userName && userName.charAt(0)}</span>
                            </h3>
                          </div>
                        </li>
                      );
                    } else {
                      //图片
                      return userType === 0 ? (
                        <li className={styles.msgLeft} key={index}>
                          <div className={styles.time}>
                            {stampToDate(msg.createTime * 1, 'MM-DD hh:mm:ss')}
                          </div>
                          <div className={styles.word}>
                            <h3>
                              <span>{askUserName && askUserName.charAt(0)}</span>
                            </h3>
                            <div
                              className={classnames({
                                [styles.imgWrap]: true,
                                'img-wrap-dark': true
                              })}
                            >
                              {msg.loading ? (
                                <div className={styles.imgLoading}>
                                  <Loading />
                                </div>
                              ) : (
                                <img
                                  onClick={() => {
                                    this.showImagePopup(msg.content);
                                  }}
                                  src={msg.content}
                                  alt=""
                                />
                              )}
                            </div>
                          </div>
                        </li>
                      ) : (
                        <li className={styles.msgRight} key={index}>
                          <div className={styles.time}>
                            {stampToDate(msg.createTime * 1, 'MM-DD hh:mm:ss')}
                          </div>
                          <div className={styles.word}>
                            <div
                              className={classnames({
                                [styles.imgWrap]: true,
                                'img-wrap-dark': true
                              })}
                            >
                              {msg.loading ? (
                                <div className={styles.imgLoading}>
                                  <Loading />
                                </div>
                              ) : (
                                <img
                                  onClick={() => {
                                    this.showImagePopup(msg.content);
                                  }}
                                  src={msg.content}
                                  alt=""
                                />
                              )}
                            </div>
                            <h3>
                              <span>{userName && userName.charAt(0)}</span>
                            </h3>
                          </div>
                        </li>
                      );
                    }
                  })}

                {/* <li className={styles.msgLeft}>
                  <div className={styles.time}>10-12 12:02:34</div>
                  <div className={styles.word}>
                    <h3>
                      <span>魏</span>
                    </h3>
                    <p>
                      请在30风沙大客户处办卡送电池啥都吃健康的拉扯高你家里到处
                    </p>
                  </div>
                </li>
                <li className={styles.msgRight}>
                  <div className={styles.time}>10-12 12:02:34</div>
                  <div className={styles.word}>
                    <p>
                      请在30风沙大客户处办卡送电池啥都吃健康的拉扯高你家里到处
                    </p>
                    <h3>
                      <span>高</span>
                    </h3>
                  </div>
                </li>
                <li className={styles.msgPublic}>
                  <div className={styles.time}>12-09 12:08:23</div>
                  <p className={styles.content}>卖家打开检查大数据可擦除</p>
                </li>
                <li className={styles.msgLeft}>
                  <div className={styles.word}>
                    <h3>
                      <span>魏</span>
                    </h3>
                    <div className={styles.imgWrap}>
                      <img
                        src={`${IMAGES_URL}/image/2018/9/19/072073a4037d4eae85bd72cbb60f400d.png?x-oss-process=style/uesstyle`}
                        alt=""
                      />
                    </div>
                  </div>
                </li>
                <li className={styles.msgRight}>
                  <div className={styles.word}>
                    <div className={styles.imgWrap}>
                      <img
                        src={`${IMAGES_URL}/image/2018/9/19/239ae7bea97549c49a95981b9cc0140c.jpg?x-oss-process=style/uesstyle`}
                        alt=""
                      />
                    </div>
                    <h3>
                      <span>魏</span>
                    </h3>
                  </div>
                </li> */}
              </ul>
            </Scrollbars>
          </div>
          <div className={styles.chatFooter}>
            <Input
              size="large"
              placeholder={localization['输入信息,回车发送']}
              value={messageValue}
              onPressEnter={this.sendMessage}
              onChange={this.messageChange}
            />
            {/*  {messageValue && (
              <i className="iconfont icon-fasong" onClick={this.sendMessage} />
            )} */}
            {messageValue ? (
              <i className="iconfont icon-fasong chat-footer-dark" onClick={this.sendMessage} />
            ) : (
              <Upload {...props}>
                <i className="iconfont icon-tupian chat-footer-dark" />
              </Upload>
            )}
          </div>
        </div>
        {popup}
      </div>
    );
  }
}
