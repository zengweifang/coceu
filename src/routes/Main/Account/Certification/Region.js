import React, { PureComponent } from 'react';
import { Button } from 'antd';

import styles from './region.less';

class Region extends PureComponent {
  handleGoToCartification = countryCode => {
    this.props.history.push(`/account/certification/steps?countryCode=${countryCode}`);
  };
  render() {
    const { localization, account } = this.props;
    return (
      <div className={styles.region}>
        <h2>{localization['身份认证']}</h2>
        <i className="iconfont icon-cartification" />
        <Button type="primary" onClick={this.handleGoToCartification.bind(this, '00')}>
          {localization['大陆境内']}
        </Button>
        {account.cardLevel !== 1 && (
          <Button type="primary" onClick={this.handleGoToCartification.bind(this, '01')}>
            {localization['其他国家或地区']}
          </Button>
        )}
      </div>
    );
  }
}

export default Region;
