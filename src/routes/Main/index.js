import React, { Component, Fragment } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { Menu, Dropdown, Icon } from 'antd';
import classnames from 'classnames';
import request from 'utils/request';
import AccountBar from 'components/AccountBar';
import MyNotice from './MyNotice';

import styles from './index.less';
import logo from 'assets/images/logo.jpg';
import hot from 'assets/images/hot.png';

class Main extends Component {
  state = {
    // logo: "",
    friendship: [],
    platLinks: [],
    introduces: [],
    navUnfold: false,
    barUnfold: false
  };

  componentDidMount() {
    // this.getLogo();
    this.getIntroduce();
    this.getPlatLinks();
    this.getFriendship();
    // document.querySelector('#easemobimBtn').style.display = 'block'; //显示客服按钮
  }

  static getDerivedStateFromProps(props) {
    const menus = [
      {
        path: '/exchange',
        name: '币币交易'
      },
      // {
      //   path: '/c2c',
      //   name: 'C2C交易'
      // },
      {
        path: '/clickfarm',
        name: '挖矿部落',
      },
      {
        path: '/notice',
        name: '公告中心'
      },
      {
        path: '/download',
        name: 'APP下载'
      }
    ];

    return { menus };
  }

  handleSwitchLanguage = ({ key }) => {
    this.props.dispatch({
      type: 'global/switchLanguage',
      payload: { language: key }
    });
  };

  handleSwitchNav = e => {
    const { viewport } = this.props;
    if (e.target !== this.headerNavWapper && e.target !== this.language && viewport.width < 768) {
      this.setState({ navUnfold: !this.state.navUnfold });
    }
  };

  handleToAccount = () => {
    this.props.history.push('/account');
  };

  handleLogOut = () => {
    this.props.dispatch({ type: 'global/logout' });
  };

  handleSwitchAccountBar = e => {
    const { viewport } = this.props;
    if (
      (!e.target.className ||
        (e.target.className && e.target.className.indexOf('barWrapper')) === -1) &&
      viewport.width < 768
    ) {
      this.setState({ barUnfold: !this.state.barUnfold });
    }
  };

  // 获取link列表
  getIntroduce = () => {
    request('/cms/introduce/list', {
      body: {
        language: 'zh_CN'
      },
      method: 'GET'
    }).then(json => {
      if (json.code === 10000000) {
        this.setState({ introduces: json.data.list });
      }
    });
  };

  // 联系我们接口
  getPlatLinks = () => {
    request('/index/platLinks', {
      method: 'GET'
    }).then(json => {
      if (json.code === 10000000) {
        this.setState({ platLinks: json.data });
      }
    });
  };

  // 获取logo
  getLogo = () => {
    if (process.env.NODE_ENV === 'production') {
      //线上加载相应平台logo
      request('/cms/logo', {
        method: 'GET'
      }).then(json => {
        if (json.code === 10000000) {
          this.setState({ logo: json.data });
        }
      });
    } else {
      //本地开发载入react logo
      this.setState({ logo: require('../../assets/images/logo.jpg') });
    }
  };

  //获取友情链接
  getFriendship = () => {
    request('/cms/link/list', {
      method: 'GET'
    }).then(json => {
      if (json.code === 10000000) {
        this.setState({ friendship: json.data });
      }
    });
  };

  getFlag = lang => {
    const zh_CN_Flag =
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAgCAYAAABU1PscAAAAAXNSR0IArs4c6QAAAw5JREFUWAntl7trFFEUxs/M7MNNxEehKD5QUUQtJFaCYlBErQQR+xAVsdBGy6CNRSCVoAhaxVrEQvFP0M5OsBEUwSCKRpMYd7Mz/s7sXnCS2Xns3l1Z2AN3Z+Y+zv2+c75zZ9aZFQmkj83tY+wh9AGB/53BQQaWZ8BvdvTqZCgsB9Dps3uIY22NiDci4j/F24dOPSavz0TARNNJ9iU67n8WGb4nUtggsrAosvQgZVGHw9lqYK2IeyF9p5DoQUh8pf2gLZCNcvq6TmZkIuAdEVk1LlLPstMrkfmzIosPITAt4vzJsqj9OakENKrloyLFA+h6NP217fBq91hTfwT4Ji5/HWR20Xg2Rd4c6viygoAC/rdp1L3D/CCF0onomJkXhyIyBqPhO7iYgtSxuNnt90WK2F9NpM8DuEikQODQgq3ofxsb/AbAcfo/NfoF6k6JIp2h70kygNJl/BKEIimpvkiem3c0QsCZAzA5Ll0B9A5cqX41lFUaqXAgMnSLe80b4GuvaZPcp1iVU8ndjKsvBGe9XRmpZBVixOo7ATpBxJHMCtEqeLIx/xhegFe9p5nWQn0/P28b3NPm5xmPJaCMlmiV2xC5yE2t6VKRkJWfN+GFFJRLHlO/6sKmRSRkHOsm4UYaXkWpV23KSp+/5QdvGzgoQmsZRN1wiPNfKOjgI4F/xr3WAhouno7RHUOJpr72trEu0WlCIAsnWbmboL8UmR3js+CayNwN+t5Rv4zlOc+DUeppHEleJ7OsVSnZstgMhFodAfRdkV9jbPq+oaD6c5HvHLPVN3zrnMkGRH25G8kaJAqnGmtsyqllEQeb2HkmPkUafYfvI12cxYJ9BOAS8zmma0jRJQC2LJaALefGj5FbmFk6Y9NuJue82vTV2HoPMqFYi1d55OWlpptoM4ea9tmygi1Hxo8P0gr/AcpbKHRCX5sGPP8LumXWM+Dw5emhlQDQQQXdc+x20+zXwHYizwvPO8f1PgS6iR7f9gk0AZuC7TJ+qwdCBGu3I282s14DxnGvrgMCvYp0q336PgN/AYOotG1i1W6/AAAAAElFTkSuQmCC';
    const en_US_Flag =
      'data:image/png;base64,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';
    const mapLangToText = {
      zh_CN: '中文',
      en_US: 'English'
    };
    const mapLangToFlag = {
      zh_CN: zh_CN_Flag,
      en_US: en_US_Flag
    };
    return [
      <img key="img" src={mapLangToFlag[lang]} alt={mapLangToText[lang]} />,
      <span key="text"> {mapLangToText[lang]} </span>
    ];
  };

  render() {
    const { language, localization, theme, isLogin, account, viewport, hideMainHeaderBgColor } = this.props;
    const {
      // logo,
      menus,
      platLinks,
      friendship,
      introduces,
      navUnfold,
      barUnfold,
    } = this.state;

    const mailLink = platLinks.find(link => link.typeId === 'link_mail');
    const mailUrl = mailLink ? mailLink.linkUrl : '';

    const noticeProps = { localization, isLogin, account };

    return (
      <div className={classnames({ layout: true, [theme]: true })}>
        <header className={`${styles.header} ${hideMainHeaderBgColor ? `${styles.hideBgColor} container` : ''}`}>
          <div className={styles.headerNavHandle} onClick={this.handleSwitchNav}>
            <i className="iconfont icon-caidan" />
          </div>
          <Link to="/" className={styles.headerLogo}>
            <img src={logo} width="120px" alt="digital currency exchange" />
          </Link>
          <div
            className={classnames({
              [styles.headerNav]: true,
              [styles.unfold]: navUnfold
            })}
            onClick={this.handleSwitchNav}
          >
            <div
              className={styles.headerNavWapper}
              ref={wrapper => {
                this.headerNavWapper = wrapper;
              }}
            >
              <nav className={styles.headerMenu}>
                {/* <NavLink to='/'>{localization['首页']}</NavLink> */}
                {menus.map(menu => {
                  if(menu.name === '挖矿部落'){
                    return (
                      <NavLink key={menu.path} activeClassName={styles.active} to={menu.path}>
                        {localization[menu.name]}
                        <img src={hot} style={{ width: '30px', marginTop: '-30px', marginRight: '-30px' }}></img>
                      </NavLink>
                    );
                  }else{
                    return (
                      <NavLink key={menu.path} activeClassName={styles.active} to={menu.path}>
                        {localization[menu.name]}
                      </NavLink>
                    );
                  }
                })}
              </nav>
              <Dropdown
                getPopupContainer={() => document.querySelector(`.${styles.headerNav}`)}
                overlay={
                  <Menu onClick={this.handleSwitchLanguage}>
                    <Menu.Item key="zh_CN">{this.getFlag('zh_CN')}</Menu.Item>
                    <Menu.Item key="en_US">{this.getFlag('en_US')}</Menu.Item>
                  </Menu>
                }
              >
                <span
                  className={('ant-dropdown-link', styles.dropdown)}
                  ref={language => (this.language = language)}
                >
                  {this.getFlag(language)}
                  <Icon type="down" />
                </span>
              </Dropdown>
            </div>
          </div>
          {isLogin && (
            <div className={styles.noticesWrap}>
              <MyNotice {...noticeProps} />
            </div>
          )}
          <div className={styles.headerAccount}>
            {isLogin ? (
              viewport.width < 768 ? (
                <Fragment>
                  <span
                    className={('ant-dropdown-link', styles.dropdown)}
                    onClick={this.handleSwitchAccountBar}
                  >
                    <Icon type="user" theme="outlined" />
                    {(account.mobile || account.mail).replace(/^.{3}(.+).{3}$/g, (a, b) => {
                      return a.replace(b, '****');
                    })}
                    <Icon type="down" />
                  </span>
                  <AccountBar
                    {...{
                      localization,
                      viewport,
                      barUnfold,
                      handleLogOut: this.handleLogOut,
                      handleSwitchAccountBar: this.handleSwitchAccountBar
                    }}
                  />
                </Fragment>
              ) : (
                  <Dropdown
                    getPopupContainer={() => document.querySelector('header')}
                    overlay={
                      <Menu>
                        <Menu.Item key="userCenter" onClick={this.handleToAccount}>
                          {localization['用户中心']}
                        </Menu.Item>
                        <Menu.Item key="logout" onClick={this.handleLogOut}>
                          {localization['退出']}
                        </Menu.Item>
                      </Menu>
                    }
                  >
                    <span className={('ant-dropdown-link', styles.dropdown)}>
                      <Icon type="user" theme="outlined" />
                      {(account.mobile || account.mail).replace(/^.{3}(.+).{3}$/g, (a, b) => {
                        return a.replace(b, '****');
                      })}
                      <Icon type="down" />
                    </span>
                  </Dropdown>
                )
            ) : (
                <Fragment>
                  <Link className={styles.signin} to="/login">
                    {localization['登录']}
                  </Link>
                  <Link className={styles.signup} to="/signup">
                    {localization['注册']}
                  </Link>
                </Fragment>
              )}
          </div>
        </header>

        <div className={styles.main}>
          {this.props.children}
        </div>

        <footer className={styles.footer}>
          <div className="wrapper">
            <ul className={styles.footerAbout}>
              <li className={styles.footerLogo}>
                <img src={logo} alt="digital currency exchange" />
                {localization['数字资产市场的价格波动较大 投资需谨慎']}
              </li>
            </ul>
            <nav className={styles.footerNav}>
              <div>
                <h4>{localization['支持']}</h4>
                <div>
                  <Link to={`/notice`} target="_blank">
                    {localization['公告中心']}
                  </Link>
                  <Link to={`/help`} target="_blank">
                    {localization['帮助中心']}
                  </Link>
                  {introduces.map(item => {
                    if (item.title === '上币申请') {
                      return (
                        <Link
                          key={item.id}
                          to={`/link/${item.id}`}
                          target="_blank"
                          data-id={item.id}
                        >
                          {localization[item.title]}
                        </Link>
                      );
                    }
                    return null;
                  })}
                </div>
              </div>
              <div className={styles.navAboutUs}>
                <h4>{localization['关于我们']}</h4>
                <div>
                  {introduces.map(item => {
                    if (item.title !== '上币申请') {
                      return (
                        <Link
                          key={item.id}
                          to={`/link/${item.id}`}
                          target="_blank"
                          data-id={item.id}
                        >
                          {localization[item.title]}
                        </Link>
                      );
                    }
                    return null;
                  })}
                </div>
              </div>
              <ul className={styles.about}>
                
                <li className={styles.social}>
                  <h3>{localization['联系我们']}:</h3>
                  {platLinks.map((item, index) => {
                    if (item.typeId === 'link_weixin') {
                      return (
                        <span key={index} className={styles.wechatCont}>
                          <Icon type="wechat" />
                          <img src={item.linkImage} alt="微信公众号" />
                        </span>
                      );
                    } else if (item.typeId === 'link_qq') {
                      return (
                        <a
                          href={`tencent://message/?Site=baidu.com&uin=${item.linkUrl}&Menu=yes`}
                          key={index}
                        >
                          <Icon type="qq" />
                        </a>
                      );
                    } else if (item.typeId === 'link_mail') {
                      return '';
                    } else {
                      return (
                        <a
                          href={`${item.linkUrl}`}
                          key={index}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Icon type={item.typeId.split('_')[1]} />
                        </a>
                      );
                    }
                  })}
                </li>
                <li className={styles.mail}>
                  <h3>{localization['联系邮箱']}:</h3>
                  <a href={`mailto:${mailUrl}`}>{mailUrl}</a>
                </li>
                <li className={styles.friendship}>
                  <h3>{localization['友情链接']}:</h3>
                  {friendship.map((item, index) => {
                    return (
                      <a key={item.title} href={item.href} target="_blank" rel="noopener noreferrer">
                        {item.title}
                      </a>
                    );
                  })}
                </li>
              </ul>
            </nav>
            
          </div>
          <svg className={styles.footerBg} xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="svgLinearGradient" x1="0%" y1="0%" x2="0%" y2="20%">
                <stop className={styles.startColor} offset="0%" />
                <stop className={styles.endColor} offset="100%" />
              </linearGradient>
            </defs>
            <path
              className={styles.wave1}
              d="M0,60 Q430,-60 1020,60 T2040,60 T3060,60 T4080,60 L6000,0 L6000,2000 L0,2000 Z"
            />
            <path
              className={styles.wave2}
              d="M0,18 Q440,120 1146,40 T2292,120 T3438,120 T4584,120 L6000,0 L6000,2000 L0,2000 Z"
            />
          </svg>
          <div className={styles.copyright}>Copyright &copy; 2019 All Rights Reserved</div>
        </footer>
      </div>
    );
  }
}

export default Main;
