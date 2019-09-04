import React, { PureComponent, Fragment } from 'react';
import TradingView from './ChartingLibrary';
import Datafeed from './datafeed';
import classnames from 'classnames';
import { Menu, Dropdown, Icon } from 'antd';

import styles from './index.less';

class TVContainer extends PureComponent {
  state = {
    chartMaskHidden: false,
    resolution: {
      value: '1',
      period: 'Time'
    }
  };

  resolutionBtns = [
    {
      value: '1',
      period: 'Time',
      text: '分时'
    },
    {
      value: '1',
      period: 'minutes',
      text: '1m'
    },
    {
      value: '5',
      period: 'minutes',
      text: '5m'
    },
    {
      value: '15',
      period: 'minutes',
      text: '15m'
    },
    {
      value: '30',
      period: 'minutes',
      text: '30m'
    },
    {
      value: '60',
      period: 'hours',
      text: '1H'
    },
    {
      value: '120',
      period: 'hours',
      text: '2H'
    },
    {
      value: '240',
      period: 'hours',
      text: '4H'
    },
    {
      value: '360',
      period: 'hours',
      text: '6H'
    },
    {
      value: '1D',
      period: '1D',
      text: '1D'
    },
    {
      value: '1W',
      period: '1W',
      text: '1W'
    },
    {
      value: '1M',
      period: '1M',
      text: '1M'
    }
  ];

  handleChangeResolution = resolution => {
    this.setState({ resolution });
    const chart = window.tvWidget.chart();
    const { value, period } = resolution;

    // 设置tradingview分辨率
    chart.setResolution(value);

    if (period === 'Time') {
      const allStudies = chart.getAllStudies();
      allStudies.forEach(({ id, name }) => {
        if (name !== 'Volume') {
          chart.removeEntity(id);
        }
      });
      chart.setChartType(3);
    } else {
      if (chart.chartType() !== 1) {
        chart.setChartType(1);
        chart.createStudy('Moving Average', false, false, [5], null, {
          'Plot.color': '#965FC4'
        });
        chart.createStudy('Moving Average', false, false, [10], null, {
          'Plot.color': '#84aad5'
        });
        chart.createStudy('Moving Average', false, false, [30], null, {
          'Plot.color': '#55b263'
        });
        chart.createStudy('Moving Average', false, false, [60], null, {
          'Plot.color': '#b7248a'
        });
      }
    }
  };

  // tradeView准备
  tradingViewGetReady() {
    const { language, tradePair, viewport, currentTrade } = this.props;
    const { pricePrecision, volumePrecision } = currentTrade;
    sessionStorage.setItem('pricePrecision', pricePrecision);
    sessionStorage.setItem('volumePrecision', volumePrecision);
    const widgetOptions = {
      symbol: tradePair,
      tiker: tradePair,
      debug: false,
      fullscreen: false,
      interval: '1',
      container_id: 'tv_chart_container',
      datafeed: Datafeed,
      library_path: '/charting_library/',
      locale: language.split('_')[0],
      theme: 'Black',
      autosize: true,
      timezone: 'Asia/Shanghai',
      // toolbar_bg: '#1a1a2a',
      toolbar_bg: '#ffffff',
      drawings_access: {
        type: 'black',
        tools: [
          {
            name: 'Regression Trend'
          }
        ]
      },
      disabled_features: [
        // 'header_widget_dom_node', //头部工具栏
        'header_symbol_search',
        'use_localstorage_for_settings',
        'symbol_search_hot_key',
        'header_chart_type',
        'header_compare',
        'header_undo_redo',
        'header_screenshot',
        'header_saveload',
        'timeframes_toolbar',
        'context_menus',
        // 'header_settings', //设置
        'header_resolutions', //时间下拉框
        'volume_force_overlay',
        'header_fullscreen_button'
      ],
      enabled_features: [
        'move_logo_to_main_pane',
        'hide_last_na_study_output',
        'keep_left_toolbar_visible_on_small_screens'
        // "hide_left_toolbar_by_default"
      ],
      charts_storage_url: 'http://saveload.tradingview.com',
      charts_storage_api_version: '1.1',
      client_id: 'tradingview.com',
      user_id: 'public_user_id',
      overrides: {
        volumePaneSize: 'medium',
        'scalesProperties.lineColor': 'rgb(97, 97, 97)',
        'scalesProperties.textColor': '#AAA',
        'symbolWatermarkProperties.transparency': 90,
        // 'paneProperties.background': '#1a1a2a',
        'paneProperties.background': '#ffffff',
        // 'paneProperties.vertGridProperties.color': '#1a1a2a',
        'paneProperties.vertGridProperties.color': '#ffffff',
        // 'paneProperties.horzGridProperties.color': '#272F36',
        'paneProperties.horzGridProperties.color': '#ffffff',
        'paneProperties.crossHairProperties.color': '#9194A3',
        'paneProperties.legendProperties.showLegend': false,
        'paneProperties.legendProperties.showStudyArguments': true,
        'paneProperties.legendProperties.showStudyTitles': true,
        'paneProperties.legendProperties.showStudyValues': true,
        'paneProperties.legendProperties.showSeriesTitle': true,
        'paneProperties.legendProperties.showSeriesOHLC': true,
        'mainSeriesProperties.candleStyle.upColor': '#2aa76d',
        'mainSeriesProperties.candleStyle.downColor': '#df553a',
        'mainSeriesProperties.candleStyle.drawWick': true,
        'mainSeriesProperties.candleStyle.drawBorder': true,
        // 'mainSeriesProperties.candleStyle.borderColor': '#4e5b85',
        'mainSeriesProperties.candleStyle.borderColor': '#df553a',
        'mainSeriesProperties.candleStyle.borderUpColor': '#2aa76d',
        'mainSeriesProperties.candleStyle.borderDownColor': '#df553a',
        'mainSeriesProperties.candleStyle.wickUpColor': '#2aa76d',
        'mainSeriesProperties.candleStyle.wickDownColor': '#df553a',
        'mainSeriesProperties.candleStyle.barColorsOnPrevClose': false,
        'mainSeriesProperties.hollowCandleStyle.upColor': '#2aa76d',
        'mainSeriesProperties.hollowCandleStyle.downColor': '#df553a',
        'mainSeriesProperties.hollowCandleStyle.drawWick': true,
        'mainSeriesProperties.hollowCandleStyle.drawBorder': true,
        // 'mainSeriesProperties.hollowCandleStyle.borderColor': '#4e5b85',
        'mainSeriesProperties.hollowCandleStyle.borderColor': '#df553a',
        'mainSeriesProperties.hollowCandleStyle.borderUpColor': '#2aa76d',
        'mainSeriesProperties.hollowCandleStyle.borderDownColor': '#df553a',
        'mainSeriesProperties.haStyle.upColor': '#2aa76d',
        'mainSeriesProperties.haStyle.downColor': '#df553a',
        'mainSeriesProperties.haStyle.drawBorder': true,
        // 'mainSeriesProperties.haStyle.borderColor': '#4e5b85',
        'mainSeriesProperties.haStyle.borderColor': '#df553a',
        'mainSeriesProperties.haStyle.borderUpColor': '#2aa76d',
        'mainSeriesProperties.haStyle.borderDownColor': '#df553a',
        // 'mainSeriesProperties.haStyle.wickColor': '#4e5b85',
        'mainSeriesProperties.haStyle.wickColor': '#df553a',
        'mainSeriesProperties.haStyle.barColorsOnPrevClose': false,
        'mainSeriesProperties.barStyle.upColor': '#2aa76d',
        'mainSeriesProperties.barStyle.downColor': '#df553a',
        'mainSeriesProperties.barStyle.barColorsOnPrevClose': false,
        'mainSeriesProperties.barStyle.dontDrawOpen': false,
        // 'mainSeriesProperties.lineStyle.color': '#4e5b85',
        'mainSeriesProperties.lineStyle.color': '#df553a',
        'mainSeriesProperties.lineStyle.linewidth': 1,
        'mainSeriesProperties.lineStyle.priceSource': 'close',
        'mainSeriesProperties.areaStyle.color1': 'rgba(122, 152, 247, .1)',
        'mainSeriesProperties.areaStyle.color2': 'rgba(122, 152, 247, .02)',
        // 'mainSeriesProperties.areaStyle.linecolor': '#4e5b85',
        'mainSeriesProperties.areaStyle.linecolor': '#df553a',
        'mainSeriesProperties.areaStyle.linewidth': 1,
        'mainSeriesProperties.areaStyle.priceSource': 'close',
        'mainSeriesProperties.style': 1
      },
      studies_overrides: {
        'volume.volume.color.0': '#df553a',
        'volume.volume.color.1': '#2aa76d',
        'volume.volume.transparency': 50,
        'MACD.histogram.color': '#606060',
        'MACD.MACD.color': '#ce5277',
        'MACD.signal.color': '#a0d75b'
      }
    };

    if (viewport.width < 768) {
      widgetOptions.preset = 'mobile';
    }

    const chartReady = () => {
      window.tvWidget = new TradingView.widget(widgetOptions);
      this.createButton();
    };

    TradingView.onready(chartReady());
  }

  // 创建按钮
  createButton = () => {
    window.tvWidget.onChartReady(() => {
      this.resolutionBtns.forEach((resolution, i) => {
        const btn = window.tvWidget
          .createButton()
          .addClass(`resolution${resolution.period === 'Time' ? ' select' : ''}`)
          .on('click', function(e) {
            handleClick(e, resolution);
          });

        const { localization } = this.props;
        const text = resolution.text === '分时' ? localization[resolution.text] : resolution.text;
        btn[0].innerHTML = text;
        btn[0].title = text;
      });

      const chart = window.tvWidget.chart();

      chart.setChartType(3);

      const handleClick = (e, resolution) => {
        if (!/\sselect/.test(e.target.className)) {
          // 更新选中状态
          Array.from(e.target.parentNode.parentNode.children).forEach(child => {
            const currentEl = child.firstChild;
            const classVal = currentEl.className;
            child.firstChild.setAttribute('class', classVal.replace(/\sselect/g, ''));
            if (currentEl.innerHTML === resolution.text) {
              child.firstChild.setAttribute('class', classVal.concat(' select'));
            }
          });
          this.handleChangeResolution(resolution);
        }
      };
    });
  };

  toggleScrollTarget = e => {
    this.setState({ chartMaskHidden: e.target === this.chartMask });
  };

  componentDidMount() {
    this.tradingViewGetReady();

    // 切换滚动目标（tradingview 或者是 window）
    document.addEventListener('click', this.toggleScrollTarget, false);
    document.addEventListener('touchstart', this.toggleScrollTarget, false);
  }

  componentDidUpdate(prevProps) {
    if (window.tvWidget && prevProps.language !== this.props.language) {
      this.tradingViewGetReady(); //切换语言要重新创建tradingview
    }
  }

  componentWillUnmount() {
    delete window.tvWidget; //删除tvWidget

    // 取消切换滚动目标（tradingview 或者是 window）
    document.removeEventListener('click', this.toggleScrollTarget);
    document.removeEventListener('touchstart', this.toggleScrollTarget);
  }

  render() {
    const { localization, viewport } = this.props;
    const { chartMaskHidden, resolution } = this.state;
    return (
      <Fragment>
        {viewport.width < 768 && (
          <ul className={styles.header}>
            <li
              className={classnames({
                [styles.active]: 'minutes' === resolution.period
              })}
            >
              <Dropdown
                getPopupContainer={() => document.querySelector(`.${styles.header}`)}
                overlay={
                  <Menu>
                    {this.resolutionBtns
                      .filter(item => item.period === 'minutes')
                      .map(item => {
                        return (
                          <Menu.Item
                            key={item.value}
                            onClick={this.handleChangeResolution.bind(this, item)}
                          >
                            {item.text}
                          </Menu.Item>
                        );
                      })}
                  </Menu>
                }
                trigger={['click']}
              >
                <a className="ant-dropdown-link" href="">
                  {resolution.period === 'minutes' ? resolution.text : '1m'} <Icon type="down" />
                </a>
              </Dropdown>
            </li>
            {this.resolutionBtns
              .filter(item => item.period !== 'minutes' && item.period !== 'hours')
              .map(item => {
                return (
                  <li
                    key={item.period}
                    className={classnames({
                      [styles.active]: item.period === resolution.period
                    })}
                    onClick={this.handleChangeResolution.bind(this, item)}
                  >
                    {item.text === '分时' ? localization[item.text] : item.text}
                  </li>
                );
              })}
            <li
              className={classnames({
                [styles.active]: 'hours' === resolution.period
              })}
            >
              <Dropdown
                getPopupContainer={() => document.querySelector(`.${styles.header}`)}
                overlay={
                  <Menu>
                    {this.resolutionBtns
                      .filter(item => item.period === 'hours')
                      .map(item => {
                        return (
                          <Menu.Item
                            key={item.value}
                            onClick={this.handleChangeResolution.bind(this, item)}
                          >
                            {item.text}
                          </Menu.Item>
                        );
                      })}
                  </Menu>
                }
                trigger={['click']}
              >
                <a className="ant-dropdown-link" href="">
                  {resolution.period === 'hours' ? resolution.text : '1H'} <Icon type="down" />
                </a>
              </Dropdown>
            </li>
          </ul>
        )}
        <div
          id="tv_chart_container"
          style={{
            position: 'absolute',
            top: viewport.width < 768 ? '2.5rem' : 0,
            bottom: 0,
            width: '100%'
          }}
        />
        <div
          className={styles.mask}
          ref={chartMask => (this.chartMask = chartMask)}
          hidden={chartMaskHidden}
        />
      </Fragment>
    );
  }
}

export default TVContainer;
