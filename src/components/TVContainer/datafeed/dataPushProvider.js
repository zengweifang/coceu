import ReconnectingWebSocket from 'utils/ReconnectingWebSocket';
import { WS_PREFIX } from 'utils/constants';
import { resolutionToStamp } from './helpers';

export default {
  lastBar: {},

  prevBar: {
    time: 0,
    volume: 0
  },

  getLastBar(lastBar) {
    this.lastBar = lastBar;
  },

  subscribeBars(symbolInfo, resolution, listener, uid, resetCache) {
    const [coinOther, coinMain] = symbolInfo.ticker.split('/');

    if (window.klineWS && window.klineWS.readyState === 1) {
      window.klineWS.send(`${coinOther}_${coinMain}`);
    } else {
      window.klineWS = new ReconnectingWebSocket(`${WS_PREFIX}/kline`);

      window.klineWS.onopen = evt => {
        if (window.klineWS && window.klineWS.readyState === 1) {
          window.klineWS.send(`${coinOther}_${coinMain}`);
        }
      };

      window.klineInterval = setInterval(() => {
        if (window.klineWS && window.klineWS.readyState === 1) {
          window.klineWS.send('ping');
        }
      }, 1000 * 30);
    }

    window.klineWS.onmessage = evt => {
      if (evt.data === 'pong') {
        return;
      }

      const barData = JSON.parse(evt.data).data;
      const hasData = barData && barData.length > 0;
      if (hasData) {
        const resBar = barData[barData.length - 1];
        const resolutionTime = resolutionToStamp(resolution);
        const lastTime = this.lastBar.time || 0;
        const period = lastTime + resolutionTime;
        let bar = {};
        if (!lastTime || resBar.t * 1 >= period) {
          const time = period + Math.floor((resBar.t - period) / resolutionTime) * resolutionTime;
          // 新增一条K线
          bar = {
            time,
            close: resBar.c * 1,
            high: resBar.c * 1,
            low: resBar.c * 1,
            open: resBar.c * 1,
            volume: resBar.v * 1
          };
        } else {
          // 当前实时推送合并到最后一根k线
          bar = {
            time: lastTime,
            close: resBar.c * 1,
            high: this.lastBar.high > resBar.c * 1 ? this.lastBar.high : resBar.c * 1,
            low: this.lastBar.low < resBar.c * 1 ? this.lastBar.low : resBar.c * 1,
            open: this.lastBar.open,
            volume: this.lastBar.volume + resBar.v * 1
          };
        }

        listener(bar);
        this.lastBar = bar;
      }
    };
  },

  unsubscribeBars(uid) {}
};
