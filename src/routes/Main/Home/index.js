import React, { PureComponent, Fragment } from 'react';
import Slider from 'react-slick';
import { Row, Col, Button } from 'antd';
import classnames from 'classnames';
import request from 'utils/request';
import NoticeBar from 'components/NoticeBar';
// import MiningBoard from './MiningBoard';
import Markets from './Markets';

import styles from './index.less';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

import volumesIcon from 'assets/images/home/volumes_icon.png';

import bannerIllustration from 'assets/images/home/banner_illustration.png';

import technologyImg from 'assets/images/technology.png';
import securityImg from 'assets/images/security.png';
import customerImg from 'assets/images/customer.png';

import agreementImg from 'assets/images/home/icon2_01.png';
import guaranteeImg from 'assets/images/home/icon2_02.png';
import customerHourImg from 'assets/images/home/icon2_03.png';

import withMarkets from 'components/withMarkets';


const NextArrow = function(props) {
  const { className, ...rest } = props;
  return (
    <div className={`${styles.sliderLeft} ${className}`} {...rest}></div>
  );
};

const PrevArrow = function(props) {
  const { className, ...rest } = props;
  return (
    <div className={`${styles.sliderRight} ${className}`} {...rest}></div>
  );
};
@withMarkets
class Home extends PureComponent {
  state = {
    banners: [],
    volumeRewardTime: {
      day: 0,
      hour: 0,
      minute: 0,
      second: 0
    }
  };

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'global/changeMainHeaderBgColor',
      payload: true
    })
    this.getBanner();
    this.getBalanceVolume();
  }

  componentDidUpdate(prevProps) {
    const { language } = this.props;
    if (prevProps.language !== language) {
      this.getBanner();
    }
  }

  componentWillUnmount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'global/changeMainHeaderBgColor',
      payload: false
    })
    if(this.timer) {
      clearInterval(this.timer);
    }
    this.setState = (state, callback) => null;
  }

  /**
   * 倒计时
   *
   * @memberof Home
   */
  countFun = (time) => {
    // let end_time = new Date(time * 1000).getTime(),
    // sys_second = (end_time - new Date().getTime());
    let sys_second = time;
    this.timer = setInterval(() => {
      //防止倒计时出现负数
      if (sys_second > 1000) {
        sys_second -= 1000;
        let day = Math.floor((sys_second / 1000 / 3600) / 24);
        let hour = Math.floor((sys_second / 1000 / 3600) % 24);
        let minute = Math.floor((sys_second / 1000 / 60) % 60);
        let second = Math.floor(sys_second / 1000 % 60);
        const countFunVal = {
          day: day,
          hour: hour < 10 ? "0" + hour : hour,
          minute: minute < 10 ? "0" + minute : minute,
          second: second < 10 ? "0" + second : second
        }
        this.setState({ volumeRewardTime: countFunVal })
      } else {
        clearInterval(this.timer);
      }
    }, 1000);
  };

  /**
   * 奖池
   */
  getBalanceVolume = () => {
    request('/balance/volume/jackpotIncome', {
      method: 'GET'
    }).then(res => {
      if(res.code === 10000000) {
        this.countFun(res.data.rewardTime);
        this.setState({
          volume: res.data || {}
        })
      }
    })
  }

  //获取banner图
  getBanner = () => {
    request('/cms/banner/list', {
      method: 'GET',
      body: {
        language: 'zh_CN'
      }
    }).then(json => {
      if (json.code === 10000000) {
        // /userfiles/1/_thumbs/images/cms/advert/2018/06/banner01.jpg
        let result = json.data.map(item => {
          let { image } = item;
          item.image = image.replace(/\/_thumbs/, '');
          return item;
        });
        this.setState({ banners: result });
      }
    });
  };

  onSliderLeft = () => {
    console.log(this.sliderRef)
  }

  onSliderRight = () => {

  }

  // 跳转到交易中心
  handleGoToExchange = pair => {
    if (!pair.title) {
      const { handleSelectPair, history } = this.props;
      handleSelectPair(pair);
      history.push('/exchange');
    }
  };

  render() {
    const {
      localization,
      language,
      isLogin,
      viewport,
      history,
      transferToCNY
    } = this.props;
    const { banners, volume, volumeRewardTime } = this.state;

    // const slidesNumber = banners.length > 2 ? 3 : banners.length;

    const slidesNumber = 4;
    const settings = {
      accessibility: false,
      dots: false,
      infinite: false,
      arrows: true,
      nextArrow: <NextArrow />,
      prevArrow: <PrevArrow />,
      speed: 500,
      slidesToShow: slidesNumber,
      slidesToScroll: 4,
      initialSlide: 0,
      centerPadding: '100px',
      responsive: [
        {
          breakpoint: 1024,
          settings: {
            slidesToShow: 3,
            slidesToScroll: 3,
            infinite: true,
          }
        },
        {
          breakpoint: 600,
          settings: {
            slidesToShow: 2,
            slidesToScroll: 2,
            initialSlide: 2
          }
        },
        {
          breakpoint: 480,
          settings: {
            slidesToShow: 1,
            slidesToScroll: 1,

          }
        }
      ],
    };

  const numbers = this.props.marketList;
  const listItems = numbers.map((number) =>
    <div className={styles.slideBox} key={number.toString()} onClick={()=>this.handleGoToExchange(number)}>
      <div className={styles.content}>
        <div className={styles.title}>
          {number.coinOther}/{number.coinMain}
        </div>
        <div className={styles.desc}>
          <span className={styles.num}>{number.latestPrice}</span>
          <span className={`${styles.smallNum} ${styles.add}`}>
            {number.rise}
          </span>
        </div>
      </div>
    </div>
  );

    return (
      <Fragment>
        <div className={styles.arcBg}>
          <div className={styles.img}/>
        </div>
        <div className={`${styles.container} container`}>
          <div className={styles.board}>
            <div className={styles.slogan}>
              <Row gutter={16}>
                <Col className={styles.gutterRow} span={12}>
                  <div className={styles.title}>
                    专业化加密货币交易所您的交易利器
                  </div>
                  <div className={styles.desc}>
                    {/* Specialized cryptocurrency e-wallet Your trading tool */}
                    Specialized Encrypted Currency Exchange Your Trading Sharp Tool
                  </div>
                  <div className={styles.actions}>
                    <div className={styles.actionBtn}>
                      <span className={styles.name}>快速交易</span>
                      <span className={styles.desc}>海量数据，多重安全机制</span>
                    </div>
                    <div className={styles.actionBtn}>
                      <span className={styles.name}>区块同步</span>
                      <span className={styles.desc}>节点数据快速同步</span>
                    </div>
                  </div>
                </Col>
                <Col className={styles.gutterRow} span={12}>
                  <div className={styles.gutterBox}>
                    <img src={bannerIllustration} className={styles.banner}/>
                  </div>
                </Col>
              </Row>
            </div>

            {/* <div className={styles.slogan}>{localization['环球数字资产交易平台']}</div> */}

            <div className={styles.whiteWrap}></div>
            {/* <MiningBoard {...{ localization, viewport, isLogin, history }} /> */}
          </div>

          { volume &&
            <div className={styles.volumes}>
              <div className={styles.volumeBox}>
                <div className={styles.vIcon}>
                  <img className={styles.img} src={volumesIcon} />
                </div>
                <div className={styles.pool}>
                  <div className={styles.title}>奖池余额（{volume.coinSymbol}）</div>
                  <div className={styles.money}>{volume.allCoinIncome}</div>
                </div>
                <div className={styles.record}>
                  <div className={styles.rTitle}>距离开始还有</div>
                  <div className={styles.times}>
                    <div className={styles.time}>
                      <div className={styles.numBox}>
                        {volumeRewardTime.day}
                      </div>
                      天
                    </div>
                    <div className={styles.time}>
                      <div className={styles.numBox}>
                        {volumeRewardTime.hour}
                      </div>
                      小时
                    </div>
                    <div className={styles.time}>
                      <div className={styles.numBox}>
                        {volumeRewardTime.minute}
                      </div>
                      分钟
                    </div>
                    <div className={styles.time}>
                      <div className={styles.numBox}>
                        {volumeRewardTime.second}
                      </div>
                      秒
                    </div>
                  </div>
                </div>
              </div>
            </div>
          }

          <div className={styles.slider}>
            {/* <Button className={styles.sliderLeft} onClick={() => this.onSliderLeft()}></Button>
            <Button className={styles.sliderRight} onClick={() => this.onSliderRight()}></Button> */}
            <Slider {...settings}>
              {listItems}
            </Slider>
          </div>

          <div className={styles.noticeBar}>
            <NoticeBar {...{ localization, isLogin, language }} />
          </div>

          <div className={styles.markets}>
            <Markets {...{ localization, viewport, history, transferToCNY }} />
          </div>

          <div className={styles.functional}>
              <ul className="wrapper">
                <li>
                  <img src={agreementImg} alt={localization['技术实力']} />
                  <h3>{localization['技术实力']}</h3>
                  {
                    localization[
                    '国际化的技术团队,团队核心架构师和研发人员均来自硅谷、以色列,人均有十年以上的研发经验,技术实力雄厚。'
                    ]
                  }
                </li>
                <li>
                  <img src={guaranteeImg} alt={localization['安全保障']} />
                  <h3>{localization['安全保障']}</h3>
                  {
                    localization[
                    '手机安保、实名认证、Google双重认证安保、离线BTC钱包、服务器SLB均衡与同时备份,确保用户与资金安全无忧。'
                    ]
                  }
                </li>
                <li>
                  <img src={customerHourImg} alt={localization['24H客服']} />
                  <h3>{localization['24H客服']}</h3>
                  {localization['24H在线客服，为您提供全方位服务']}
                </li>
              </ul>
          </div>

          {/* <div className={styles.about}>
            <h2>{localization['关于UES']}</h2>
            <ul className="wrapper">
              <li>
                <img src={technologyImg} alt={localization['技术实力']} />
                <h3>{localization['技术实力']}</h3>
                {
                  localization[
                  '国际化的技术团队,团队核心架构师和研发人员均来自硅谷、以色列,人均有十年以上的研发经验,技术实力雄厚。'
                  ]
                }
              </li>
              <li>
                <img src={securityImg} alt={localization['安全保障']} />
                <h3>{localization['安全保障']}</h3>
                {
                  localization[
                  '手机安保、实名认证、Google双重认证安保、离线BTC钱包、服务器SLB均衡与同时备份,确保用户与资金安全无忧。'
                  ]
                }
              </li>
              <li>
                <img src={customerImg} alt={localization['用户至上']} />
                <h3>{localization['用户至上']}</h3>
                {localization['24小时在线客服服务,为用户提供实时、快捷、高效的服务。']}
              </li>
            </ul>
          </div> */}

          {/* <div className={styles.partner}>
            <h2>{localization["合作伙伴"]}</h2>
            <ul className="wrapper">
              <li>
                <a href="https://po.im/#/home">
                  <img src="src/assets/images/bixin.svg" alt="币信" />
                </a>
              </li>
              <li>
                <a href="https://www.magicw.net/">
                  <img src="src/assets/images/guguqianbao.svg" alt="鼓鼓钱包" />
                </a>
              </li>
              <li>
                <a href="http://www.nodecap.com/">
                  <img
                    src="src/assets/images/jiedianziben.svg"
                    alt="节点资本"
                  />
                </a>
              </li>
              <li>
                <a href="https://www.chainnews.com/">
                  <img src="src/assets/images/lianwen.svg" alt="链闻" />
                </a>
              </li>
            </ul>
          </div> */}


        </div>
      </Fragment>
    );
  }
}


export default Home;
