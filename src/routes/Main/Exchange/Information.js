import React, { PureComponent } from 'react';
import { connect } from 'dva';
import Scrollbars from 'react-custom-scrollbars';
import { Loading } from 'components/Placeholder';

import styles from './chart.less';
@connect(({ loading }) => ({
  loading: loading.effects['exchange/fetchCoinInformation']
}))
class Information extends PureComponent {
  componentDidMount() {
    const { dispatch, tradePair } = this.props;
    dispatch({
      type: 'exchange/fetchCoinInformation',
      payload: { coinName: tradePair.split('/')[0] }
    });
  }

  componentDidUpdate(prevProps) {
    const { dispatch, tradePair } = this.props;
    const [coinName] = tradePair.split('/');
    if (coinName !== prevProps.tradePair.split('/')[0]) {
      dispatch({
        type: 'exchange/fetchCoinInformation',
        payload: { coinName }
      });
    }
  }

  render() {
    const { localization, coinInformation, loading } = this.props;
    return loading ? (
      <Loading />
    ) : (
      <Scrollbars>
        <div className={styles.detail}>
          <div className={styles.description}>
            <h2>
              <span>{coinInformation.name}</span>
              {coinInformation.fullName}
            </h2>
            <p>
              <span>{localization['简介']}</span>
              {coinInformation.remarks}
            </p>
          </div>
          <ul className={styles.attributes}>
            <li>
              <span>{localization['发行总量']}</span>
              {coinInformation.tokenVolume || '--'}
            </li>
            <li>
              <span>{localization['流通总量']}</span>
              {coinInformation.circulateVolume || '--'}
            </li>
            <li>
              <span>{localization['众筹价格']}</span>
              {coinInformation.icoPrice || '--'}
            </li>
            <li>
              <span>{localization['白皮书']}</span>
              {coinInformation.whitepaperUrl ? (
                <a href={coinInformation.whitepaperUrl} target="_blank" rel="noopener noreferrer">
                  {coinInformation.whitepaperUrl}
                </a>
              ) : (
                '--'
              )}
            </li>
            <li>
              <span>{localization['官网']}</span>
              {coinInformation.domain ? (
                <a href={coinInformation.domain} target="_blank" rel="noopener noreferrer">
                  {coinInformation.domain}
                </a>
              ) : (
                '--'
              )}
            </li>
          </ul>
        </div>
      </Scrollbars>
    );
  }
}

export default Information;
