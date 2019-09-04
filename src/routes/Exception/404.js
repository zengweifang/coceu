import React, { PureComponent } from 'react';
import { Button } from 'antd';

import styles from './404.less';

class NotFound extends PureComponent {
  render() {
    const { localization } = this.props;
    return (
      <div className={styles.wrap}>
        <h2>404</h2>
        <h3>{localization['抱歉，你访问的页面不存在']}</h3>
        <Button type="primary" onClick={() => this.props.history.push('/')}>
          {localization['返回首页']}
        </Button>
      </div>
    );
  }
}

export default NotFound;
