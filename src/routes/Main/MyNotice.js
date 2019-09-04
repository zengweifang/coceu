import React, { Component } from 'react';
import ReconnectingWebSocket from 'utils/ReconnectingWebSocket';
import { WS_PREFIX } from 'utils/constants.js';
import { stampToDate } from 'utils';
import classnames from 'classnames';
import { Loading, Empty } from 'components/Placeholder';
import request from 'utils/request';
import { Popover, Badge, Icon, Pagination, notification, message } from 'antd';

import './notice.less';

export default class MyNotice extends Component {
  constructor(props) {
    super(props);
    this.state = {
      messageList: [],
      messagePage: 1,
      messageTotal: 0,
      messageCount: 0,
      loading: false,
      visible: false
    };
  }

  componentDidMount() {
    const { isLogin } = this.props;
    if (isLogin) {
      this.getAllMessage(1);
      this.connectSocket();
    }
  }
  componentWillUnmount() {
    this.messageSocket && this.messageSocket.close();
  }

  // 消息socket
  connectSocket = () => {
    const { account } = this.props;
    const { id } = account;
    this.messageSocket = new ReconnectingWebSocket(`${WS_PREFIX}/message?${id}`);
    this.messageSocket.onmessage = evt => {
      if (evt.data === 'pong') {
        return;
      }
      const json = JSON.parse(evt.data);
      json.read = false;

      const { orderId, status, type } = json;

      const msgText = {
        0: '买家已下单, 请及时处理',
        1: '买家已确认付款, 请及时确认到账情况, 确认收款',
        2: '卖家已确认到账, 订单结束, 请及时核对C2C资产情况',
        4: '订单被申诉, 请及时处理争议, 若协议无果, 请联系在线客服解决',
        6: '申诉判决：买币方胜, 如有疑问请联系在线客服解决',
        7: '申诉判决：卖币方胜，如有疑问请联系在线客服解决',
        9: '买家取消订单, 请核实您的账户资产情况'
      };
      const typeText = {
        0: 'C2C',
        1: '币币交易'
      };

      let { messageList, messageTotal, messageCount } = this.state;

      messageList.unshift(json);
      if (messageList.length > 5) {
        // 大于5 删除最后一个
        messageList.pop();
      }
      this.setState({
        messageList,
        messageTotal: Number(messageTotal) + 1,
        messageCount: Number(messageCount) + 1
      });

      const content = `${typeText[type]}订单编号为${orderId}的状态发生变更。${msgText[status]}`;
      this.showNotification('交易通知', content);
    };
  };

  // 获取所有消息
  getAllMessage = page => {
    this.setState({ loading: true });
    request('/message/findByPage ', {
      body: {
        currentPage: page,
        showCount: 5
      }
    }).then(json => {
      this.setState({ loading: false });
      if (json.code === 10000000) {
        if (json.data.list) {
          const messageList = json.data.list.map(item => {
            item.read = false; //消息未读
            return item;
          });
          this.setState({
            messageList,
            messagePage: page,
            messageTotal: json.data.count,
            messageCount: json.data.count
          });
        }
      }
    });
  };

  // 显示通知
  showNotification = (title, content) => {
    notification.destroy();
    notification.open({
      message: title,
      description: content,
      placement: 'bottomRight'
    });
  };

  //删除一条消息
  deleteOneMessage = messageId => {
    request('/message/delete', {
      body: {
        messageId
      },
      method: 'GET'
    }).then(json => {
      if (json.code === 10000000) {
        message.success('消息已读');
        let { messageCount } = this.state;
        if (messageCount > 0) {
          messageCount = messageCount - 1;
        }
        this.setState({ messageCount });
      }
    });
  };

  //删除所有消息
  handleClearMsg = () => {
    request('/message/deleteAll').then(json => {
      if (json.code === 10000000) {
        message.success('清空成功');
        this.setState({ visible: false, messageCount: 0 });
      }
    });
  };

  messageClick = item => {
    let { messageList } = this.state;
    const { id, read } = item;
    messageList = messageList.map(msg => {
      if (msg.id === id) {
        msg.read = true;
      }
      return msg;
    });
    if (!read) {
      this.deleteOneMessage(id);
    }
    this.setState({ messageList });
  };

  popoverChange = visible => {
    if (visible) {
      this.getAllMessage(1);
    }
    this.setState({ visible });
  };

  render() {
    const { localization } = this.props;
    const { messageList, messageTotal, messageCount, messagePage, loading, visible } = this.state;

    const pageProps = {
      current: messagePage,
      pageSize: 5,
      total: messageTotal,
      onChange: page => {
        this.getAllMessage(page);
      }
    };
    const noticeContent = (
      <div className="content-wrap">
        {messageTotal > 0 ? (
          <div>
            {loading ? (
              <Loading />
            ) : (
              <ul className="msg-ul">
                {messageList.map((item, index) => {
                  const { createTime, orderId, status, type } = item;
                  const msgText = {
                    0: '买家已下单, 请及时处理',
                    1: '买家已确认付款, 请及时确认到账情况, 确认收款',
                    2: '卖家已确认到账, 订单结束, 请及时核对C2C资产情况',
                    4: '订单被申诉, 请及时处理争议, 若协议无果, 请联系在线客服解决',
                    6: '申诉判决：买币方胜, 如有疑问请联系在线客服解决',
                    7: '申诉判决：卖币方胜，如有疑问请联系在线客服解决',
                    9: '买家取消订单, 请核实您的账户资产情况'
                  };
                  const typeText = {
                    0: 'C2C',
                    1: '币币交易'
                  };
                  const content = (
                    <p>
                      {`${typeText[type]}订单编号为`}
                      <span>{orderId}</span>
                      {`的状态发生变更。${msgText[status]}`}
                    </p>
                  );

                  return (
                    <li
                      className={classnames({
                        'msg-li': true,
                        read: item.read
                      })}
                      key={index}
                      onClick={() => {
                        this.messageClick(item);
                      }}
                    >
                      <h4>
                        <span>交易通知</span>
                        <span>{stampToDate(Number(createTime), 'YYYY-MM-DD hh:mm:ss')}</span>
                      </h4>
                      {content}
                    </li>
                  );
                })}
              </ul>
            )}
            <div className="page-wrap">
              <div>
                <Pagination simple {...pageProps} />
              </div>
              <div>
                <span className="clear-msg" onClick={this.handleClearMsg}>
                  {localization['清空消息']}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <Empty {...{ localization }} />
        )}
      </div>
    );

    return (
      <Popover
        content={noticeContent}
        placement="bottomRight"
        trigger="click"
        visible={visible}
        onPopupVisibleChange={this.popoverChange}
        popupClassName="notice-popover"
        arrowPointAtCenter
      >
        <div className="badge-wrap">
          <Badge count={messageCount}>
            <Icon className="notice-icon" type="bell" theme="outlined" />
          </Badge>
        </div>
      </Popover>
    );
  }
}
