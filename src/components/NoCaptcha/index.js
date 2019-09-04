import React, { PureComponent } from 'react';
import { appKey } from 'utils/constants.js';
import './index.less';

export default class NoCaptcha extends PureComponent {
  loadScript = callback => {
    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.charset = 'utf-8';
    script.id = 'nc_script';
    if (script.readyState) {
      //IE
      script.onreadystatechange = function() {
        if (script.readyState === 'loaded' || script.readyState === 'complete') {
          script.onreadystatechange = null;
          callback();
        }
      };
    } else {
      //Others
      script.onload = function() {
        callback();
      };
    }

    const date = new Date();
    const timestamp = `${date.getFullYear()}${date.getMonth() +
      1}${date.getDate()}${date.getHours()}`;

    script.src = '//g.alicdn.com/sd/ncpc/nc.js?t=' + timestamp;
    document.head.appendChild(script);
  };

  componentDidMount() {
    const { scene, ncCallback } = this.props;

    this.loadScript(() => {
      if (window.noCaptcha) {
        const { domID = 'nc_dom_id', language } = this.props;
        const nc_token = [appKey, new Date().getTime(), Math.random()].join(':');
        const NC_Opt = {
          renderTo: `#${domID}`,
          appkey: appKey,
          scene: scene,
          token: nc_token,
          customWidth: '90%',
          elementID: ['usernameID'],
          is_Opt: 0,
          language: 'cn',
          isEnabled: true,
          timeout: 3000,
          times: 5,
          apimap: {},
          callback: function(data) {
            ncCallback(appKey, nc_token, data, nc);
          }
        };

        const nc = new window.noCaptcha(NC_Opt);
        nc.upLang('cn', {
          _startTEXT: '请按住滑块，拖动到最右边',
          _yesTEXT: '验证通过',
          _error300: '哎呀，出错了，点击<a href="javascript:__nc.reset()">刷新</a>再来一次',
          _errorNetwork: '网络不给力，请<a href="javascript:__nc.reset()">点击刷新</a>'
        });
      }
    });
  }

  componentWillUnmount() {
    let nc_script = document.getElementById('nc_script');
    if (nc_script) {
      document.head.removeChild(nc_script);
    }
  }

  render() {
    const { domID = 'nc_dom_id' } = this.props;
    return <div id={`${domID}`} className="nc-container" />;
  }
}
