import React, { PureComponent, Fragment } from 'react';
import { Avatar, Steps, Button, Tag } from 'antd';
import request from 'utils/request';

import styles from './index.less';

const Step = Steps.Step;

class Certification extends PureComponent {
  state = {
    reason: ''
  };

  componentDidMount() {
    const { cardStatus } = this.props.account;
    if (cardStatus === 9 || cardStatus === 19) {
      this.getReason();
    }
  }

  handleGoToChooseRegion = () => {
    this.props.history.push('/account/certification/region');
  };

  // 获取审核不通过原因
  getReason = () => {
    request('/user/findCardStatus').then(json => {
      if (json.code === 10000000) {
        this.setState({ reason: json.data.reason });
      }
    });
  };

  render() {
    const { account, localization } = this.props;
    const { reason } = this.state;
    const mapStatus = {
      0: '未认证',
      1: 'V1审核通过',
      2: 'V1审核中',
      9: 'V1审核不通过',
      11: 'V2审核通过',
      12: 'V2审核中',
      19: 'V2审核不通过'
    };
    const mapColor = {
      0: '',
      1: '#14c974',
      2: '#E7BF50',
      9: '#ff586d',
      11: '#14c974',
      12: '#E7BF50',
      19: '#ff586d'
    };

    return (
      <div className={styles.certification}>
        <div className={styles.user}>
          {account.realName ? (
            <Avatar size={64} className={styles.active}>
              {account.realName[0]}
            </Avatar>
          ) : (
            <Avatar size={64} icon="user" />
          )}
          <div className={styles.status}>
            <div className={styles.info}>
              {account.mobile || account.mail}
              <i className="iconfont icon-masonry" />V{account.cardLevel === 0 ? 1 : account.cardLevel}
              <Tag className={styles.verified} color={mapColor[account.cardStatus]}>
                {localization[mapStatus[account.cardStatus]]}
              </Tag>
            </div>
            {account.cardStatus !== 2 && account.cardStatus !== 11 && account.cardStatus !== 12 && (
              <Fragment>
                <Button type="primary" onClick={this.handleGoToChooseRegion}>
                  {localization['去认证']}
                </Button>
              </Fragment>
            )}
            {reason && (
              <div style={{ marginTop: '20px' }}>
                {localization['原因']}：<span style={{ color: '#999' }}>{reason}</span>
              </div>
            )}
          </div>
          <div className={styles.level}>
            <ul>
              <li>{localization['可进行充值、买入交易']}</li>
              {/* <li>{localization['24小时交易额：无限制']}</li> */}
              <li>{localization['24小时交易额：无限制']}</li>
            </ul>
            <Steps current={account.cardLevel}>
              {['V1', 'V2'].map(text => (
                <Step key={text} title={text} icon={<i className="iconfont icon-masonry" />} />
              ))}
            </Steps>
          </div>
        </div>
      </div>
    );
  }
}

export default Certification;
