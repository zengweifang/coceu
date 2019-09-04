import React, { PureComponent, Fragment } from 'react';
import { Link } from 'dva/router';
import { Pagination } from 'antd';
import request from 'utils/request';
import { stampToDate } from 'utils';
import { Loading, Empty } from 'components/Placeholder';

import styles from './index.less';

export default class Rank extends PureComponent {
  state = {
    rankCount: 0,
    rankList: [],
    rankPage: 1,
    rankTotal: 0,
    currentPage: 1,
    rankLoading: false
  };

  componentDidMount() {
    this.getRankList(this.state.rankPage);
    if (this.props.isLogin) {
      this.getRankCount();
    }
  }

  getRankList = page => {
    this.setState({ rankLoading: true });
    request('/mk2/teammining/list', {
      method: 'GET',
      body: {
        currentPage: page,
        showCount: 10
      },
      customMsg: true
    }).then(json => {
      this.setState({ rankLoading: false });
      if (json.code === 10000000) {
        if (json.data.list) {
          const rankList = json.data.list.map((item, index) => {
            item.key = index;
            return item;
          });
          this.setState({
            rankList,
            rankPage: page,
            rankTotal: json.data.count
          });
        }
      }
    });
  };

  getRankCount = () => {
    request('/mk2/teammining/self', {
      method: 'GET'
    }).then(json => {
      if (json.code === 10000000) {
        this.setState({ rankCount: json.data });
      }
    });
  };

  render() {
    const { isLogin, localization } = this.props;
    const { rankList, rankTotal, rankPage, rankCount, rankLoading } = this.state;

    return (
      <div className="container">
        {isLogin ? (
          <div className={styles.rankTitle}>
            {rankCount ? (
              <div>
                {localization['您当前多元挖矿排名']}: <span>{rankCount.orderNo}</span>,
                {localization['已遥遥领先']},{localization['继续保持']}
              </div>
            ) : (
              <div>{localization['您当前未开启多元挖矿']}</div>
            )}
          </div>
        ) : (
          <div className={styles.rankLogin}>
            <Link to="/login">{localization['登录']}</Link> , {localization['查看挖矿排名']}
          </div>
        )}
        <div className={styles.miningRank}>
          <div className={styles.rankWrapper}>
            {rankLoading ? (
              <Loading />
            ) : (
              <Fragment>
                <ul className={styles.rankList}>
                  <li className={styles.rankHeader}>
                    <span className={styles.rank}>{localization['排名']}</span>
                    <span className={styles.username}>{localization['账号']}</span>
                    <span className={styles.realName}>{localization['姓名']}</span>
                    <span className={styles.miningCount}>{localization['活动期间累计多元量']}</span>
                  </li>
                  {rankList.length === 0 ? (
                    <Empty {...{ localization }} />
                  ) : (
                    rankList.map((item, index) => (
                      <li key={item.id}>
                        <span className={styles.rank}>{(rankPage - 1) * 10 + index + 1}</span>
                        <span className={styles.username}>{item.mobile || item.mail}</span>
                        <span className={styles.realName}>{item.realName}</span>
                        <span className={styles.miningCount}>{item.volumeStr}</span>
                      </li>
                    ))
                  )}
                </ul>
                {rankList.length > 0 && (
                  <div className={styles.deadline}>
                    {localization['截止时间']}：{stampToDate(rankList[0].sortDate * 1, 'YYYY-MM-DD')}
                  </div>
                )}
                <Pagination current={rankPage} total={rankTotal} onChange={this.getRankList} />
              </Fragment>
            )}
          </div>
        </div>
      </div>
    );
  }
}
