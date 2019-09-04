import React, { PureComponent } from 'react';
import { Table, Modal, Input } from 'antd';
import { Loading, Empty } from 'components/Placeholder';
import QRCode from 'qrcode.react';
import request from 'utils/request';

import styles from './index.less';

class Invite extends PureComponent {
  state = {
    currentPage: 1,
    showCount: 10,
    totalCount: 0,
    inviteList: [],
    showQRCode: false,
    curteamcoin: 0
  };

  handleShowQRCode = () => {
    this.setState({ showQRCode: true });
  };

  handleHideQRCode = () => {
    this.setState({ showQRCode: false });
  };

  getInvitedPerson = currentPage => {
    this.setState({ inviteList: null });
    request('/user/invotes', {
      method: 'GET',
      body: {
        currentPage,
        showCount: this.state.showCount
      }
    }).then(json => {
      if (json.code === 10000000) {
        this.setState({
          currentPage,
          totalCount: json.data.count,
          inviteList: json.data.list
        });
      } else {
        this.setState({
          currentPage,
          totalCount: 0,
          inviteList: []
        });
      }
    });
  };

  //团队总持币量
  getCurteamcoin = () => {
    request('/mk2/total/curteamcoin', {
      method: 'GET'
    }).then(json => {
      if (json.code === 10000000) {
        this.setState({ curteamcoin: json.data });
      }
    });
  };

  componentDidMount() {
    this.getInvitedPerson(this.state.currentPage);
    this.getCurteamcoin();
  }

  render() {
    const { localization, viewport, account } = this.props;
    const { currentPage, showCount, totalCount, inviteList, showQRCode, curteamcoin } = this.state;
    const { realName, inviteCode } = account;
    const inviteLink = `${window.location.origin}/signup?inviteCode=${inviteCode}`;
    const mobileLink = `${window.location.origin}/mobile/share?realName=${encodeURI(
      realName ? realName : ''
    )}&inviteCode=${inviteCode}`;

    const inviteColumns = [
      {
        title: localization['序号'],
        dataIndex: 'index',
        key: 'index',
        render: (text, record, index) => (currentPage - 1) * showCount + index + 1
      },
      {
        title: localization['用户名'],
        dataIndex: 'realName',
        key: 'realName'
      },
      {
        title: localization['手机号'],
        dataIndex: 'mobile',
        key: 'mobile'
      },
      {
        title: localization['邮箱'],
        dataIndex: 'mail',
        key: 'mail'
      }
    ];

    const inviteProps = {
      dataSource: inviteList,
      columns: inviteColumns,
      loading: {
        spinning: !inviteList,
        indicator: <Loading />
      },
      locale: {
        emptyText: <Empty {...{ localization }} />
      },
      pagination: {
        current: currentPage,
        total: totalCount,
        pageSize: showCount,
        onChange: this.getInvitedPerson
      }
    };

    if (viewport.width < 767) {
      inviteColumns[0] = {
        ...inviteColumns[0],
        fixed: 'left',
        width: 90
      };
      inviteProps.scroll = { x: 800 };
    }

    return (
      <div className={styles.invite}>
        <div className={styles.box}>
          <h2 className={styles.title}>{localization['我的邀请方式']}</h2>
          <div className={styles.cont}>
            <div className={styles.code}>
              <QRCode
                value={mobileLink}
                size={180}
                style={{
                  border: '1px solid #dadada',
                  cursor: 'pointer'
                }}
                bgColor={'#ffffff'}
                fgColor={'#000000'}
                level={'L'}
                onClick={this.handleShowQRCode}
              />
              <div className={styles.text}>{localization['手机邀请二维码']}</div>
            </div>
            <ul className={styles.action}>
              <li>
                <Input
                  addonAfter={
                    <span className="copy-btn" data-clipboard-text={inviteCode}>
                      {localization['复制邀请码']}
                    </span>
                  }
                  size="large"
                  defaultValue={inviteCode}
                  disabled
                />
              </li>
              <li>
                <Input
                  addonAfter={
                    <span className="copy-btn" data-clipboard-text={inviteLink}>
                      {localization['复制PC端邀请链接']}
                    </span>
                  }
                  size="large"
                  defaultValue={inviteLink}
                  disabled
                />
              </li>
              <li>
                <Input
                  addonAfter={
                    <span className="copy-btn" data-clipboard-text={mobileLink}>
                      {localization['复制手机邀请链接']}
                    </span>
                  }
                  size="large"
                  defaultValue={mobileLink}
                  disabled
                />
              </li>
            </ul>
          </div>
        </div>
        <div className={styles.box}>
          <h2 className={styles.title}>
            {localization['我邀请的人数']}：<span className={styles.count}>{totalCount}</span>

          </h2>
          <Table {...inviteProps} />
        </div>
        <Modal
          visible={showQRCode}
          footer={null}
          onCancel={this.handleHideQRCode}
          className={styles.inviteQrcode}
        >
          <QRCode
            className={styles.qrcode}
            value={mobileLink}
            size={viewport.width < 768 ? (viewport.width / 6) * 5 : 470}
            bgColor={'#ffffff'}
            fgColor={'#000000'}
            level={'L'}
          />
        </Modal>
      </div>
    );
  }
}

export default Invite;
