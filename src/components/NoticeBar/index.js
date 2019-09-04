import React, { PureComponent } from 'react';
import { Link, withRouter } from 'react-router-dom';
import { Carousel, Modal, Icon } from 'antd';
import classnames from 'classnames';
import { stampToDate } from 'utils';
import request from 'utils/request';

import styles from './index.less';
import bitAward from 'assets/images/bit-award.png';
import crown from 'assets/images/lottery-crown.png';

class NoticeBar extends PureComponent {
  state = {
    notices: [],
    noticeContent: '<p></p>',
    modalVisible: false,
    lastAward: '',

    lotteryVisible: false,
    lotterySymbol: '',
    lotteryNumber: 0,
    openLottery: false,
    startLottery: false
  };

  componentDidMount() {
    const { isLogin } = this.props;

    this.getNotice();
    // if (isLogin) {
    //   this.checkLottery();
    // } else {

    //   //请求获奖者
    //   this.getRealy();
    // }
  }

  componentDidUpdate(prevProps) {
    const { language } = this.props;
    if (prevProps.language !== language) {
      this.getNotice();
    }
  }

  componentWillUnmount() {
    this.setState = state => null;
  }

  // 检查是否能够抽奖
  checkLottery = () => {
    request('/lottery/check', { customMsg: true }).then(json => {
      if (json.code === 10000000) {
        this.setState({ lotteryVisible: true });
      } else {
        // 请求最新公告
        this.getNotice();
        //请求获奖者
        this.getRealy();
      }
    });
  };

  //抽奖点击 开
  handleLottery = () => {
    this.setState({ startLottery: true });
    request('/lottery/do/web', { method: 'GET' }).then(json => {
      if (json.code === 10000000) {
        const { coinSymbol, count } = json.data;
        this.setState({
          lotteryNumber: count,
          lotterySymbol: coinSymbol,
          openLottery: true
        });
        setTimeout(() => {
          this.setState({ showNumber: true });
        }, 1500);
      }
    });
  };

  moreNoticeClick = () => {
    this.props.history.push('/notice');
  };

  //获取公告
  getNotice = () => {
    // const { language } = this.props;
    request('/cms/notice/list', {
      body: {
        language: 'zh_CN',
        currentPage: 1,
        showCount: 3
      }
    }).then(json => {
      if (json.code === 10000000) {
        const notices = json.data.list;
        const latestNoticeId = localStorage.getItem('latestNoticeId');
        if (notices.length > 0 && notices[0].id !== latestNoticeId) {
          const noticeId = notices[0].id;
          this.getNoticeDetail(noticeId);
          localStorage.setItem('latestNoticeId', noticeId);
        }
        this.setState({ notices });
      }
    });
  };

  //获取公告
  getNoticeDetail = id => {
    request('/cms/view/' + id, {
      method: 'GET'
    }).then(json => {
      if (json.code === 10000000) {
        this.setState({ noticeContent: json.data.content });
        const { modalVisible } = this.state;
        // 如果没有弹窗
        if (!modalVisible) {
          this.showModal();
        }
      }
    });
  };

  //获取得奖者名单
  getRealy = () => {
    request('/relay/list', {
      body: {
        currentPage: 1,
        showCount: 1
      }
    }).then(json => {
      if (json.code === 10000000) {
        if (json.data.list && json.data.list.length > 0) {
          const lastAward = json.data.list[0];
          const latestAwardId = localStorage.getItem('latestAwardId');
          if (lastAward.mail !== latestAwardId) {
            this.showAwardModal(lastAward);
            localStorage.setItem('latestAwardId', lastAward.mail);
          }
          this.setState({ lastAward });
        }
      }
    });
  };

  showAwardModal = lastAward => {
    const { localization } = this.props;
    this.setState({
      modalVisible: (
        <Modal
          visible
          centered
          width={500}
          footer={null}
          onCancel={this.hideModal}
          wrapClassName={styles.awardPopup}
        >
          <div className={styles.box}>
            <img alt="ues award" src={bitAward} className={styles.pic} />
            <div className={styles.date}>
              {lastAward && stampToDate(lastAward.updateDate * 1, 'YYYY/MM/DD hh:mm')}
            </div>
            <div className={styles.value}>
              {lastAward && lastAward.prizeVolume} <span>UES</span>
            </div>
            <div className={styles.person}>
              {lastAward && lastAward.mail} ({localization['获奖人']})
            </div>
            <div className={styles.refer}>
              {lastAward && lastAward.referMail}
              {lastAward && lastAward.referMail && ` (${localization['推荐人']})`}
            </div>
          </div>
        </Modal>
      )
    });
  };

  showModal = () => {
    const { localization } = this.props;
    const { noticeContent } = this.state;
    this.setState({
      modalVisible: (
        <Modal
          visible
          centered
          width={700}
          footer={null}
          onCancel={this.hideModal}
          title={localization['公告']}
          wrapClassName={styles.noticePopup}
        >
          <div dangerouslySetInnerHTML={{ __html: noticeContent }} />
        </Modal>
      )
    });
  };

  hideModal = () => {
    this.setState({ modalVisible: false });
  };

  render() {
    const { localization } = this.props;
    const {
      notices,
      modalVisible,
      lotteryVisible,
      lotterySymbol,
      lotteryNumber,
      openLottery,
      startLottery
    } = this.state;
    return (
      <div className={styles.bar}>
        <Icon type="sound" theme="filled" />
        <Carousel autoplay vertical dots={false}>
          {notices.map(notice => {
            return (
              <Link key={notice.id} to={`/notice/${notice.id}`}>
                <span className={styles.title}>{notice.title}</span>
                <span style={{ paddingLeft: '1.25rem' }}>
                  {stampToDate(Number(notice.createDate), 'YYYY-MM-DD')}
                </span>
              </Link>
            );
          })}
        </Carousel>
        <Link to="/notice" className={styles.more}>
          {localization['更多']}
          >>
        </Link>
        {modalVisible}
        <Modal
          width={400}
          wrapClassName={styles.lotteryModal}
          centered
          visible={lotteryVisible}
          maskClosable={false}
          onCancel={() => {
            this.setState({ lotteryVisible: false });
          }}
          footer={null}
        >
          <div
            className={classnames({
              [styles.lotteryWrap]: true
            })}
          >
            <div
              className={classnames({
                [styles.lotteryTop]: true,
                [styles.topAnim]: openLottery
              })}
            >
              <img src={crown} alt="" />
              <p>恭喜您获得注册抽奖机会</p>
              <div
                className={classnames({
                  [styles.open]: true,
                  [styles.openAnim]: startLottery
                })}
                onClick={this.handleLottery}
              />
            </div>
            <div className={styles.content}>
              <p>恭喜你抽中 {lotterySymbol}</p>
              <div className={styles.number}>
                <span>{lotteryNumber}</span> 个
              </div>
              <div className={styles.tips}>已存入币币资产</div>
            </div>
            <div
              className={classnames({
                [styles.lotteryFooter]: true,
                [styles.footerAnim]: openLottery
              })}
            />
          </div>
        </Modal>
      </div>
    );
  }
}

export default withRouter(NoticeBar);
