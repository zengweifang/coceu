import request from 'utils/request';
import { resolutionToTime } from './helpers';

export default {
  getBars(symbolInfo, resolution, from, to, first, limit) {
    const [coinOther, coinMain] = symbolInfo.ticker.split('/');
    const time = resolutionToTime(resolution);

    let bars = [],
      lastBar = {};
    return request(`/index/kline?coinMain=${coinMain}&coinOther=${coinOther}&time=${time}`, {
      method: 'GET'
    })
      .then(json => {
        const barsData = json.data && json.data.data;
        const hasData = barsData && barsData.length > 0;

        if (first && hasData) {
          bars = barsData.map(bar => ({
            time: bar.t * 1,
            close: bar.c * 1,
            high: bar.h * 1,
            low: bar.l * 1,
            open: bar.o * 1,
            volume: bar.v * 1
          }));
          lastBar = bars[bars.length - 1];
        }
        return { bars, lastBar };
      })
      .catch(error => {
        return { bars, lastBar };
      });
  }
};
