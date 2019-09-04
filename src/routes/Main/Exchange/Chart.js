import React, { PureComponent } from 'react';
import TVContainer from 'components/TVContainer';
import Information from './Information';

import styles from './chart.less';

class Chart extends PureComponent {
  render() {
    const { localization, dispatch, tradePair, chartType, coinInformation } = this.props;
    return (
      <div className={styles.chart}>
        {tradePair &&
          (chartType === 'kline' ? (
            <TVContainer {...this.props} />
          ) : (
            <Information {...{ localization, dispatch, tradePair, coinInformation }} />
          ))}
      </div>
    );
  }
}

export default Chart;
