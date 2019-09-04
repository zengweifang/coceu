import React, { PureComponent } from 'react';
import { Progress, Tabs, Table } from 'antd';
import { ToLogin, Loading, Empty } from 'components/Placeholder';
import { stampToDate } from 'utils';
import request from 'utils/request';

import styles from './index.less';

const TabPane = Tabs.TabPane;

class Mining extends PureComponent {
  state = {
    total: '',
    myTotal: '',

    holdingList: [],
    holdTotal: 0,
    holdPage: 1,

    teamList: [],
    teamTotal: 0,
    teamPage: 1
  };

  componentDidMount() {
    this.getTotal();

    if (this.props.isLogin) {
      this.getMyTotal();
      this.getHoldmining(1);
    }
  }

  tabOnChange = key => {
    if (this.props.isLogin) {
      if (key === 'hold') {
        this.getHoldmining(1);
        this.setState({ holdPage: 1 });
      } else if (key === 'team') {
        this.getTeammining(1);
        this.setState({ teamPage: 1 });
      }
    }
  };

  //挖矿总量
  getTotal = () => {
    request('/mk2/total/info', {
      method: 'GET'
    }).then(json => {
      if (json.code === 10000000) {
        this.setState({ total: json.data });
      }
    });
  };

  //我的收益
  getMyTotal = () => {
    request('/mk2/mytotal/info', {
      method: 'GET'
    }).then(json => {
      if (json.code === 10000000) {
        this.setState({ myTotal: json.data });
      }
    });
  };

  //持币挖矿
  getHoldmining = page => {
    this.setState({ holdingList: null });
    request('/mk2/history/holdmining', {
      method: 'GET',
      body: {
        currentPage: page,
        showCount: 10
      }
    }).then(json => {
      if (json.code === 10000000) {
        if (json.data.list) {
          const holdingList = json.data.list.map((item, index) => {
            item.key = index;
            return item;
          });
          this.setState({ holdingList, holdTotal: json.data.count });
        }
      }
    });
  };

  //多元挖矿
  getTeammining = page => {
    this.setState({ teamList: null });
    request('/mk2/history/teammining', {
      method: 'GET',
      body: {
        currentPage: page,
        showCount: 10
      }
    }).then(json => {
      if (json.code === 10000000) {
        if (json.data.list) {
          const teamList = json.data.list.map((item, index) => {
            item.key = index;
            return item;
          });
          this.setState({ teamList, teamTotal: json.data.count });
        }
      }
    });
  };

  holdPageOnChange = page => {
    this.setState({ holdPage: page });
    this.getHoldmining(page);
  };

  teamPageOnChange = page => {
    this.setState({ teamPage: page });
    this.getTeammining(page);
  };

  render() {
    const { isLogin, localization, viewport } = this.props;

    const {
      total,
      myTotal,

      holdingList,
      holdTotal,
      holdPage,

      teamList,
      teamTotal,
      teamPage
    } = this.state;

    const {
      grantMiningCoinVolumeTotal = '----', //已用挖矿量
      miningCoinVolumeTotal = '----', //可挖总量
      lastMiningCoinVolumeTotal = '----', //昨日挖矿
      lockCoinVolumeTotal = '----', //锁仓总量
      destroyCoinVolumeTotal = '----', //销毁总量
      lastMiningDate, //上次挖矿时间
      lastBestHoldCoinVolume //上次最佳持币量
    } = total;

    const {
      myLastMiningVolume = '----', //昨日挖矿量
      myLastMiningHoldVolume = '----', //昨日持币挖矿
      myLastMiningTeamVolume = '----' //昨日团队挖矿
    } = myTotal;

    let percent = 0;
    if (total) {
      percent = (grantMiningCoinVolumeTotal / miningCoinVolumeTotal) * 100;
    }

    const holdingColumns = [
      {
        title: localization['日期'],
        dataIndex: 'holdMiningDate',
        key: 'holdMiningDate',
        render: text => {
          return <div>{stampToDate(text * 1, 'YYYY-MM-DD')}</div>;
        }
      },
      {
        title: localization['持币算力'],
        dataIndex: 'holdMiningVolume',
        key: 'holdMiningVolume'
      },
      {
        title: localization['持币算力排名'],
        dataIndex: 'holdMiningOrderNo',
        key: 'holdMiningOrderNo'
      },
      {
        title: localization['挖矿量'],
        dataIndex: 'holdMiningGiveVolume',
        key: 'holdMiningGiveVolume'
      }
    ];

    const teamColumns = [
      {
        title: localization['日期'],
        dataIndex: 'teamMiningDate',
        key: 'teamMiningDate',
        render: text => {
          return <div>{stampToDate(text * 1, 'YYYY-MM-DD')}</div>;
        }
      },
      {
        title: localization['团队持币算力总量'],
        dataIndex: 'teamMiningVolume',
        key: 'teamMiningVolume'
      },
      {
        title: localization['主矿持币算力'],
        dataIndex: 'teamMiningAreaVolume',
        key: 'teamMiningAreaVolume'
      },
      {
        title: localization['挖矿量'],
        dataIndex: 'teamMiningGiveVolume',
        key: 'teamMiningGiveVolume'
      }
    ];

    const commonProps = spinning => ({
      loading: {
        spinning,
        indicator: <Loading />
      },
      locale: {
        emptyText: isLogin ? <Empty {...{ localization }} /> : <ToLogin {...{ localization }} />
      }
    });

    const holdingProps = {
      dataSource: holdingList,
      columns: holdingColumns,
      ...commonProps(!holdingList),
      pagination: {
        current: holdPage,
        pageSize: 10,
        total: holdTotal,
        onChange: this.holdPageOnChange
      }
    };

    const teamProps = {
      dataSource: teamList,
      columns: teamColumns,
      ...commonProps(!teamList),
      pagination: {
        current: teamPage,
        pageSize: 10,
        total: teamTotal,
        onChange: this.teamPageOnChange
      }
    };

    if (viewport.width < 768) {
      const commonAttr = {
        fixed: 'left',
        width: 110
      };
      holdingColumns[0] = {
        ...holdingColumns[0],
        ...commonAttr
      };
      teamColumns[0] = {
        ...teamColumns[0],
        ...commonAttr
      };

      holdingProps.scroll = { x: 500 };
      teamProps.scroll = { x: 500 };
    }

    return (
      <div className="container">
        <div className={styles.mining}>
          <div className={`${styles.box} ${styles.dashboard}`}>
            <h2>
              {lastMiningDate ? stampToDate(lastMiningDate * 1, 'YYYY-MM-DD') : '----'}{' '}
              {localization['最佳持币算力为']}{' '}
              {lastBestHoldCoinVolume ? (lastBestHoldCoinVolume * 1).toFixed(2) : '----'}
            </h2>
            <Progress percent={percent} strokeWidth={10} status="active" showInfo={false} />
            <div className={styles.progress}>
              <div>
                {localization['已挖矿']}
                (UES): <strong>{grantMiningCoinVolumeTotal}</strong>
              </div>
              <div>
                {localization['可挖总量']}: <strong>{miningCoinVolumeTotal}</strong>
              </div>
            </div>
            <ul className={styles.info}>
              <li>
                <strong>{lastMiningCoinVolumeTotal}</strong>
                {localization['昨日挖矿']}
              </li>
              <li>
                <strong>{lockCoinVolumeTotal}</strong>
                {localization['锁仓总量']}
              </li>
              <li>
                <strong>{destroyCoinVolumeTotal}</strong>
                {localization['销毁总量']}
              </li>
            </ul>
          </div>
          <div className={`${styles.box} ${styles.income}`}>
            <h2>{localization['我的收益']}</h2>
            {isLogin ? (
              <div className={styles.attrWrap}>
                <ul className={styles.attr}>
                  <li>
                    <span>{myLastMiningVolume || '----'}</span>
                    {localization['昨日挖矿总量']}
                    (UES)
                  </li>
                  <li>
                    <span>{myLastMiningHoldVolume || '----'}</span>
                    {localization['昨日持币挖矿']}
                    (UES)
                  </li>
                  <li>
                    <span>{myLastMiningTeamVolume || '----'}</span>
                    {localization['多元挖矿']}
                    (UES)
                  </li>
                </ul>
              </div>
            ) : (
              <ToLogin {...{ localization }} />
            )}
          </div>
          <div className={`${styles.box} ${styles.count}`}>
            <Tabs defaultActiveKey="hold" onChange={this.tabOnChange}>
              <TabPane tab={localization['持币挖矿']} key="hold">
                <Table {...holdingProps} />
              </TabPane>
              <TabPane tab={localization['多元挖矿']} key="team">
                <Table {...teamProps} />
              </TabPane>
            </Tabs>
          </div>
        </div>
      </div>
    );
  }
}

export default Mining;
