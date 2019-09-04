import React, { PureComponent, Fragment } from 'react';
import request from 'utils/request';
import { WS_PREFIX } from 'utils/constants';
import { message } from 'antd';
import ReconnectingWebSocket from 'utils/ReconnectingWebSocket';
import { Loading } from 'components/Placeholder';
import AwardPopup from './AwardPopup';
import HistoryPopup from './HistoryPopup';

import styles from './index.less';

class MiningBoard extends PureComponent {
  state = {
    lotteryData: '',
    popup: '',
    loading: false,
  };

  componentDidMount() {
    this.openLotterySocket();
  }

  componentWillUnmount() {
    this.lotteryWS && this.lotteryWS.close();
    this.setState = (state, callback) => null; // 重写setState 防止Can’t call setState错误
  }


  //接力撞奖socket
  openLotterySocket = () => {
    this.setState({ loading: true })
    this.lotteryWS = new ReconnectingWebSocket(`${WS_PREFIX}/lucky`);
    this.lotteryWS.onmessage = evt => {
      const lotteryData = JSON.parse(evt.data);
      if (lotteryData) {
        this.setState({ loading: false })
        this.setState({ lotteryData });
      }
    };
  };

  handlePartin = () => {
    const { isLogin } = this.props;
    if (isLogin) {
      request("/lucky/in", {
        method: "POST"
      }).then(json => {
        if (json.code === 10000000) {
          message.success("参与成功", 3);
        } else {
          message.destroy();
          message.error(json.msg, 3);
        }
      });
    } else {
      this.props.history.push('/login');
    }
  }
  handleHistory = () => {
    const { isLogin } = this.props;
    if (isLogin) {
      const { viewport, localization } = this.props;
      const awardProps = {
        viewport,
        localization
      };
      this.setState({
        popup: (
          <HistoryPopup
            {...awardProps}
            onCancel={() => {
              this.setState({ popup: '' });
            }}
          />
        )
      });

    } else {
      this.props.history.push('/login');
    }
  }

  handleAwardList = () => {
    const { viewport, localization } = this.props;
    const awardProps = {
      viewport,
      localization
    };
    this.setState({
      popup: (
        <AwardPopup
          {...awardProps}
          onCancel={() => {
            this.setState({ popup: '' });
          }}
        />
      )
    });
  };

  render() {
    const { localization } = this.props;
    const { popup, lotteryData, loading } = this.state;
    const {
      winners,
      candidates,
      prizeVolume,
      poolVolume,
      awardDate,
      periods,
      symbol,
      fee,
      isActivity
    } = lotteryData;

    return (
      <div className={styles.miningboard}>
        <div className={styles.item}>
          <div className={styles.des}>
            <p>抽奖活动开始了</p>
            <p>每一期活动内会员可多次参与</p>
            <p>
              会员每参与一次扣除手续费 {fee} 个 {symbol}
            </p>
          </div>
          <div className={styles.btn}>
            <span className={styles.partin} onClick={this.handlePartin}>
              参与>>
              </span>
            <span className={styles.history} onClick={this.handleHistory}>
              参与记录>>
              </span>
          </div>
        </div>
        <div className={styles.item}>
          {loading ? <Loading /> : <Fragment>
            <h4>
              近一期抽奖活动获得者({" "}
              {winners && winners.length > 0 ? awardDate : "暂无"} )
            </h4>
            {winners &&
              winners.map((item, index) => {
                return (
                  <div key={index} className={styles.winList}>
                    {item.username}
                    <span>
                      奖金: {prizeVolume} {symbol}
                    </span>
                  </div>
                );
              })}

            <div className={styles.awardList}>
              <span onClick={this.handleAwardList}>
                获奖列表>>
              </span>
            </div>
          </Fragment>}
        </div>
        <div className={styles.item}>
          {loading ? <Loading /> : <Fragment>
            <h4>
              <span>
                抽奖活动(
                {isActivity === "1" ? `第${periods}期` : "未开启"})
              </span>
              <span className="count">
                {poolVolume} {symbol}
              </span>
            </h4>
            <div className={styles.canList}>
              {candidates &&
                candidates.map((item, index) => {
                  return (
                    <div key={index}>
                      <span>{item.username}</span>
                      <span>{item.achieveDate}</span>
                    </div>
                  );
                })}
            </div>
          </Fragment>}
        </div>
        {popup}
      </div>
    );
  }
}

export default MiningBoard;
