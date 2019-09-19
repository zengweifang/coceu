import React, { Component } from 'react';
import request from 'utils/request';
import DocumentTitle from 'react-document-title';
import { Table, Row, Col, Tabs, Tag, Icon, Button, Input,Select, message } from 'antd';
import ModalInfo from './ModalInfo';
import PayPasswordForm from './PayPasswordForm';
import { getLocalStorage, setLocalStorage } from 'utils';
import styles from './index.less';
import inviteLogo from 'assets/images/invite_illustration.png';
import icon1 from 'assets/images/icon_01.png';
import icon2 from 'assets/images/icon_02.png';
import icon3 from 'assets/images/icon_03.png';
import icon4 from 'assets/images/icon_04.png';
import icon5 from 'assets/images/icon_05.png';
import icon6 from 'assets/images/icon_06.png';
import icon7 from 'assets/images/icon_07.png';
import icon8 from 'assets/images/icon_08.png';
import icon9 from 'assets/images/icon_09.png';
import icon10 from 'assets/images/icon_10.png';
import icon11 from 'assets/images/icon_11.png';
import rank1 from 'assets/images/Ranking_01.png';
import rank2 from 'assets/images/Ranking_02.png';
import rank3 from 'assets/images/Ranking_03.png';

const account = getLocalStorage('account') || {};

const Option = Select.Option;
export default class ClickFarm extends Component {
    constructor(porps) {
        super()
        this.state = {
            showModal: {
                zr: false,
                zc: false,
                inviteCode: false, // 邀请码
            },
            listItem: undefined,
            valumeData: {},
            userInvotesData: {},
            referInviteCode: '',
            coinNum: "",
            gb: "", // 平台币
            wk: "", // 挖矿币
            selectValue: "",
            coinVolume: 0,
            currentPage: 1,
            rewardType: 0
        }
    }
    // 查询登录用户的平台币收益、级别、社区刷单总额、有效用户数信息
    getList = () => {
        request(`/balance/volume/digIncomeInfo`, {
            method: 'GET'
        }).then(json => {
            if (json.code === 10000000) {
                const valumeData = json.data;
                this.setState({
                    valumeData,
                    gb: valumeData.coinPlatSymbol,
                    wk: valumeData.coinSymbol
                });
            }
        });
    };
    // 查询登录用户的直接邀请下级人数。
    getInvotes = (currentPage,showCount) => {
        request(`/user/invotes`, {
            method: 'GET',
            body: {
                currentPage: currentPage,
                showCount: showCount
            }
        }).then(json => {
            if (json.code === 10000000) {
                let userInvotesData = json.data;
                this.setState({
                    userInvotesData
                });
            }
        });
    };

    // 查询整个网络下的刷单排名前30名。
    getRank = () => {
        request(`/balance/volume/rank`, {
        method: 'GET'
        }).then(json => {
        if (json.code === 10000000) {
            let volulmeRankData = json.data.list;
            let userRank = json.data.userRank;
            this.setState({
                volulmeRankData,
                userRank
            });
        }
        });
    };

    //  查询整个网络下的参与刷单宝的人数。
    getCountNum = () => {
        request(`/balance/volume/countNum`, {
        method: 'GET'
        }).then(json => {
        if (json.code === 10000000) {
            let volumeCountNum = json.data;
            this.setState({
                volumeCountNum
            });
        }
        });
    };

    //  查询整个网络下的最新买入记录30名。
    getChange = () => {
        request(`/balance/volume/change`, {
        method: 'GET'
        }).then(json => {
        if (json.code === 10000000) {
            let volumeChangeData = json.data;
            this.setState({
                volumeChangeData
            });
        }
        });
    };

    onPageChange(page){
        this.setState({
            currentPage: page,
        });
        this.getFinanceDetails(page);
    }

    //  查询登录用户的收益奖励明细列表。
    getFinanceDetails = (page,key) => {
        const { rewardType } = this.state;
        var type = key ? key : rewardType;
        var data = {
            currentPage: parseInt(page),
            showCount: 10,
            rewardType: parseInt(type)
        }
        request(`/balance/volume/financeDetails`, {
        method: 'GET',
        body: data
        }).then(json => {
        if (json.code === 10000000) {
            let volumeFinanceDetails = json.data.list;
            let totalNum = json.data.count;
            this.setState({
                volumeFinanceDetails,
                totalNum,
                // rewardType : type
            });
        }
        });
    };

    //  查询登录用户的存取记录列表。
    getAccessList = () => {
        request(`/balance/volume/accessList`, {
        method: 'GET'
        }).then(json => {
        if (json.code === 10000000) {
            let accessData = json.data;
            this.setState({
                accessData
            });
        }
        });
    };

    //   我的社区列表
    getInviteUserList = () => {
        request(`/balance/volume/inviteUserList`, {
        method: 'GET'
        }).then(json => {
            if (json.code === 10000000) {
                let volumeInviteUserData = json.data;
                this.setState({
                    volumeInviteUserData
                });
            }
        });
    };
    coinChange = (e, item)=>{
        this.getCoinVolume(item.key);
        this.setState({
            selectValue : e,
            coinNum: ''
        })
    }

    // 币种
    getCoinList = () => {
        request(`/coin/list`, {
          method: 'GET'
        }).then(json => {
          if (json.code === 10000000) {
              var coinList = json.data;
              var selectValue = coinList[0].name
            this.setState({
                coinList,
                selectValue
            });
          }
        });
    };

    getCoinListNew = () => {
        request(`/balance/volume/coinList`, {
            method: 'GET'
          }).then(json => {
            if (json.code === 10000000) {
                var coinList = json.data;
                var selectValue = coinList[0].name
                this.getCoinVolume(coinList[0].id);
              this.setState({
                  coinList,
                  selectValue
              });
            }
          });
    };
    //
    getCoinVolume = (coinId) => {
        request(`/coin/volume/${coinId}`, {
          method: 'GET'
        }).then(json => {
          if (json.code === 10000000) {
              var coinVolume = json.data ? json.data.volume : 0 ;
              coinVolume = 0.0332
            this.setState({
                coinVolume
            });
          }
        });
    };

    codeOnchange = e => {
        const { coinVolume } = this.state;
        if(e.target.value > coinVolume){
            e.target.value = coinVolume;
        }
        this.setState({ coinNum: e.target.value });
    };

    inviteCodeOnchange = e => {
        this.setState({
            referInviteCode: e.target.value
        })
    }

    // 打开转入的逻辑
    openVolumAdd = () => {
        if(!account.referInviteCode) {
            const { showModal } = this.state;
            showModal.inviteCode = true;
            showModal.zr = false;
            showModal.zc = false;
            this.setState({ showModal: showModal, referInviteCode: '' })
            return;
        }
        const { showModal } = this.state;
        showModal.inviteCode = false;
        showModal.zr = true;
        showModal.zc = false;
        this.setState({ showModal: showModal, referInviteCode: '' })
    }

    // 校验和保存邀请码
    saveReferinviteCode = () => {
        const { referInviteCode } = this.state;
        if(!referInviteCode) {
            message.warning('请输入邀请码');
            return;
        }
        request(`/user/referInviteCode/save`, {
            method: 'POST',
            body: {
                referInviteCode,
            }
        }).then(json => {
          if (json.code === 10000000) {
            message.success(json.msg);
            const { showModal } = this.state;
            showModal.inviteCode = false;
            showModal.zr = false;
            showModal.zc = false;
            account.referInviteCode = referInviteCode;
            setLocalStorage('account', account);
            this.setState({ showModal, listItem: {}  })
          }else{
            message.error(json.msg);
          }
        });
    }

    invitecodeOnchange = (e) => {
        this.setState({
            referInviteCode: e.target.value
        })
    }

    // 转入
    volumeAdd = async () => {
        const valid = await this.zrPasswordRef.validate();
        if(!valid) {
            return;
        }

        const { password } = this.zrPasswordRef.getItemValues();


        const { coinNum , coinVolume, valumeData, selectValue } = this.state;
        console.log(coinVolume);
        console.log(coinNum);

        if(selectValue.toUpperCase() === 'BTC'){
            if(coinVolume === 0) {
                message.warn('余额不足，请选择其它币种');
                return;
            }
            if(coinVolume && coinNum === 0){
                message.warn('转入资产不能少于等于0');
                return;
            }
        }else{
            if(coinVolume && coinVolume.toFixed(2) === 0) {
                message.warn('余额不足，请选择其它币种');
                return;
            }
            if(coinVolume && coinVolume.toFixed(2) > 0 && parseFloat(coinNum).toFixed(2) === 0){
                message.warn('转入资产不能少于等于0');
                return;
            }
        }
        if(coinNum === '') {
            message.warn('请输入余额');
            return;
        }
        

        const { userId, name } = valumeData;

        request(`/balance/volume/add`, {
            method: 'POST',
            // method: 'GET',//mock先使用get
            body: {
                userId,
                // name,
                coinNum,
                coinSymbol: selectValue,
                // coinVolume,
                exPassword: password
            }
        }).then(json => {
          if (json.code === 10000000) {
            message.success(json.msg);
            const { showModal } = this.state;
            showModal.zr = false
            showModal.zc = false
            this.volumeUserChange();
            this.getList();
            this.getCoinListNew();
            this.setState({ showModal, listItem: {}  })
          }else{
            message.error(json.msg);
          }
        });
    };
    // 转出
    volumeTakeOutIncome = async () => {

        const { valumeData, listItem } = this.state;
        const { userId } = valumeData;

        const valid = await this.zcPasswordRef.validate();

        if(!valid) {
            return;
        }

        const  { password } = this.zcPasswordRef.getItemValues();

        request(`/balance/volume/takeOutIncome`, {
            method: 'POST',
            // method: 'GET',//mock先使用get
            body: {
                id: listItem.id,
                userId,
                coinSymbol: listItem.coinSymbol,
                coinPlatSymbol: listItem.coinPlatSymbol,
                coinNum: listItem.coinNum,
                accumulIncome: listItem.coinNum,
                createTime: new Date(listItem.createStr).getTime(),
                exPassword: password
            }
        }).then(json => {
          if (json.code === 10000000) {
            message.success(json.msg);
            const { showModal } = this.state;
            showModal.zr = false
            showModal.zc = false
            this.volumeUserChange();
            this.getList();
            this.setState({
                showModal: showModal,
                listItem: {}
            })
          }else{
            message.error(json.msg);
          }
        });
    };
     // 投资列表
     volumeUserChange = () => {
        request(`/balance/volume/userChange`, {
            method: 'GET',
        }).then(json => {
          if (json.code === 10000000) {
            let volumeUserChangeData = json.data;
            this.setState({
                volumeUserChangeData
            });
          }
        });
    };


    componentDidMount(){
        const { isLogin } = this.props;
        if(isLogin){
            this.scroll();
            this.getList();
            this.getRank();
            this.getInviteUserList();
            this.getChange();
            this.getFinanceDetails(1, 0);
            this.getInvotes(1,100);
            // this.getAccessList();
            // this.getCoinList();
            this.getCoinListNew();
            this.getCountNum();
            this.volumeUserChange();
        }else{
            this.props.history.push("/login");
        }
    }
    scroll(){
        try{
            let scrollE=document.getElementById('scrollAuto');
            let num=1
           return setInterval(()=>{
                scrollE.children[0].children[0].children[1].scrollTop=num
                let keyLength=scrollE.children[0].children[0].children[1].children[0].children[1].children
                num+=1;
                if(keyLength && keyLength[0]){
                    setTimeout(() => {
                        if(num>(keyLength.length*keyLength[0].clientHeight)-320){
                            num=0
                        }
                    }, 2000);
                }
            },100)
        }catch(e){
            return e
        }
    }

    componentWillUnmount(){
        clearInterval(this.scroll())
    }

    render() {
        const { localization } = this.props;

        const {
            showModal,
            listItem,
            volulmeRankData,
            valumeData,
            userInvotesData,
            volumeInviteUserData,
            volumeChangeData,
            volumeFinanceDetails,
            volumeUserChangeData,
            coinList,
            referInviteCode,
            coinNum,
            volumeCountNum,
            gb,
            wk,
            userRank,
            selectValue,
            coinVolume
        } = this.state;

        const TabPane = Tabs.TabPane;
        const {
            name = '---',
            yesterdayIncome = '0.00',
            coinBalance = '0.00',
            teamLevel = '---',
            teamAmount = '0.00',
            accumulIncome = '---',
            positionName = '',
            accumulReward = '',
            validNum = '',
            teamCommunityAmount='',
            userSurplus = '---',
            oneInvite='---'
        } = valumeData;
        const {
            count = '---'
        } = userInvotesData;
        const volumeChangeHead = [
            {
                title: '用户',
                dataIndex: 'userName',
                width: 150,
            },
            {
                title: '挖矿类型',
                dataIndex: 'coinSymbol',
                width: 150
            },
            {
                title: '交易总额',
                dataIndex: 'coinNum',
                width: 150,
                render:(n)=>{
                    return n
                }
            },
            {
                title: '时间',
                dataIndex: 'createStr',
                width: 200
            },
        ];
        const volulmeRankHead = [
            {
                title: '排名',
                dataIndex: 'coinBalance',
                width: "33.33%",
                key: 'coinBalance1',
                className:'no_padding',
                render: (n, k , index) => {
                    if(index===0){
                        return <img src={rank1} alt="" width="30" height="30" />
                    }
                    if(index===1){
                        return <img src={rank2} alt="" width="30" height="30"/>
                    }
                    if(index===2){
                        return <img src={rank3} alt="" width="30" height="30"/>
                    }
                    return <b style={{display: 'inline-block',width: '2.1vw',
                        height: '2.1vw',borderRadius: '50%',lineHeight:'2.1vw',
                        background:'rgba(255,245,245,1)',
                        color: '#E64F4F'}}>{index+1}</b>
                }
            },
            {
                title: '用户',
                dataIndex: 'userName',
                width: "33.33%",
                className:'no_padding',
            },
            {
                title: '挖矿市值',
                dataIndex: 'coinBalance',
                width: "33.33%",
                className:'no_padding',
                render: (n) => {
                    return n+' $';
                },
            },
        ];
        const volumeInviteUserHead = [
            {
                title: '被邀请人',
                dataIndex: 'userName',
                width: "24%"
            },
            {
                title: '级别',
                dataIndex: 'teamLevel',
                width: "12%"
            },
            {
                title: '社区有效用户',
                dataIndex: 'validNum',
                width: "20%",
                key: 'validNum'
            },
            {
                title: '社区挖矿总额',
                dataIndex: 'teamAmount',
                width: "20%",
                render(n){
                    return n+' '+wk;
                }
            },
            {
                title: '',
                dataIndex: 'coinBalance',
                // width: "",
                key: 'coinBalance',
                render: (n) => {
                    if(parseInt(n) >= 200){
                        return <a className={`${styles.valid_user}`}>有效用户</a>
                    }else{
                        return <a className={`${styles.invalid_user}`}>无效用户</a>
                    }
                },
                className:'users'
            },
        ];
        const volumeFinanceDetailsHead = [
            {
                title: '类型',
                dataIndex: 'rewardType',
                width: "33.33%",
                className:'margin',
                render:(t)=>{
                    switch(parseInt(t)){
                        case 1:
                            return '挖矿奖励';
                        case 2:
                            return '分享奖励';
                        case 3:
                            return '社区管理奖';
                        case 4:
                            return '社区平级奖';
                        case 5:
                            return '社区级差奖';
                        default:
                            return '';
                    }
                }
            },
            {
                title: '时间',
                dataIndex: 'createStr',
                width: "33.33%",
                className:'margin'
            },
            {
                title: '收益',
                dataIndex: 'detailReward',
                // width: "33.33%",
                // className:'margin',
                render(n){
                    return n+' '+gb;
                }
            }
        ];

        return (
            <DocumentTitle title={"挖矿-交易平台"}>
                <div className={`${styles.clickfarm}`}>
                    <Row>
                        <Col lg={24}>
                            <div className={`${styles.banner}`}>
                                <h1><span>一键托管</span>
                                    <span>随进随出</span></h1>
                                    {/* <p>平台币收益</p> */}
                                <p className={`${styles.money}`}>{yesterdayIncome}（{gb}）</p>
                                <p className={`${styles.tips}`}>我的昨日收益，每日00:00自动结算</p>
                            </div>
                        </Col>
                    </Row>
                    <Row>
                        <Col lg={14} xs={24}>
                            <div className={`${styles.activities}`}>
                                <div className={`${styles.titles}`}>
                                    <span>参与挖矿的人</span>
                                    {/* <div className={`${styles.btns}`}>
                                        <a className={`${styles.single_line}`}>{volumeCountNum}人参与</a>
                                    </div> */}
                                </div>
                                <Table rowKey={volumeChangeData => volumeChangeData.id} columns={volumeChangeHead} id='scrollAuto' dataSource={volumeChangeData} pagination={false} scroll={{ y:320 }}/>
                            </div>
                        </Col>
                        <Col lg={10} xs={24}>
                            <div className={`${styles.list}`}>
                                <div className={`${styles.titles}`}>
                                    <span>挖矿风云榜</span>
                                    <div className={`${styles.btns}`}>
                                        <a>
                                            <h6>我的挖矿资产折合</h6>
                                            <p>{coinBalance} {wk}</p>
                                        </a>
                                        <a>
                                            <h6>今日排名</h6>
                                            <p>{userRank? '第' + userRank + '名': '暂未上榜'}</p>
                                        </a>
                                    </div>
                                </div>
                                <Table rowKey={volulmeRankData => volulmeRankData.id} ref={ref=>this.scrollAuto=ref}  columns={volulmeRankHead} dataSource={volulmeRankData} pagination={false} scroll={{ y: 320 }}/>
                            </div>
                        </Col>
                    </Row>
                    <Row>
                        <Col>
                            <div className={`${styles.invitation}`}>
                                <div className={`${styles.invite_slogan}`}>
                                    <h2>邀请好友 领取大奖</h2>
                                    <p>级别越高 奖金越多</p>
                                    <a href="/account/invite">立即邀请 &gt;</a>
                                </div>
                                <div className={`${styles.invite_levels}`}>
                                    <div className={`${styles.levels}`}>
                                        <h6>级别</h6>
                                        <p>{teamLevel}</p>
                                    </div>
                                    <div className={`${styles.levels}`}>
                                        <h6>一级邀请</h6>
                                        <p>{oneInvite}人</p>
                                    </div>
                                    <div className={`${styles.levels}`}>
                                        <h6>社区挖矿总额</h6>
                                        <p>{teamAmount}（{wk}）</p>
                                    </div>
                                </div>
                                <img src={inviteLogo} />
                            </div>
                        </Col>
                    </Row>

                    <div className={`${styles.my_clickfarm}`}>
                        <div className={`${styles.titles}`}>
                            <span>我的挖矿部落</span>
                            <div className={`${styles.btns}`}>
                                <a className={`${styles.single_line}`}
                                    onClick={() => {
                                        showModal.zr = false
                                        showModal.zc = true
                                        this.setState({ showModal: showModal })
                                    }}>转出</a>
                                <a className={`${styles.single_line}`}
                                    onClick={this.openVolumAdd}>转入</a>
                            </div>
                        </div>
                        <Row>
                            <Col xs={12} sm={6} lg={4}>
                                <div className={`${styles.card}`}>
                                    <img src={icon1} />
                                    <h6>总挖矿金额</h6>
                                    <p>{coinBalance} {wk}</p>
                                </div>
                            </Col>
                            <Col xs={12} sm={6} lg={4}>
                                <div className={`${styles.card}`}>
                                    <img src={icon2} />
                                    <h6>仓位等级</h6>
                                    <p>{positionName}</p>
                                </div>
                            </Col>
                            <Col xs={12} sm={6} lg={4}>
                                <div className={`${styles.card}`}>
                                    <img src={icon3} />
                                    <h6>累计收入</h6>
                                    <p>{accumulIncome} {gb}</p>
                                </div>
                            </Col>
                            <Col xs={12} sm={6} lg={4}>
                                <div className={`${styles.card}`}>
                                    <img src={icon4} />
                                    <h6>昨日收入</h6>
                                    <p>{yesterdayIncome} {gb}</p>
                                </div>
                            </Col>
                            <Col xs={12} sm={6} lg={4}>
                                <div className={`${styles.card}`}>
                                    <img src={icon5} />
                                    <h6>累计邀请奖励</h6>
                                    <p>{accumulReward} {gb}</p>
                                </div>
                            </Col>
                            <Col xs={12} sm={6} lg={4}>
                                <div className={`${styles.card}`}>
                                    <img src={icon6} />
                                    <h6>可用余额</h6>
                                    <p>{userSurplus} {gb}</p>
                                </div>
                            </Col>
                        </Row>
                    </div>
                    <div className={`${styles.community}`}>
                        <div className={`${styles.titles}`}>
                            <span>我的社区</span>
                        </div>
                        <div className={`${styles.cards}`}>
                            <div className={`${styles.card}`}>
                                <img src={icon7} />
                                <h6>等级</h6>
                                <p>{teamLevel}</p>
                            </div>

                            <div className={`${styles.card}`}>
                                <img src={icon8} />
                                <h6>一级邀请</h6>
                                <p>{oneInvite}人</p>
                            </div>

                            <div className={`${styles.card}`}>
                                <img src={icon9} />
                                <h6>社区挖矿总额</h6>
                                <p>{teamAmount} {wk}</p>
                            </div>

                            <div className={`${styles.card}`}>
                                <img src={icon10} />
                                <h6>小区挖矿总额</h6>
                                <p>{teamCommunityAmount} {wk}</p>
                            </div>

                            <div className={`${styles.card}`}>
                                <img src={icon11} />
                                <h6>社区有效用户</h6>
                                <p>{validNum}人</p>
                            </div>
                        </div>
                        <Table rowKey={volumeInviteUserData => volumeInviteUserData.id} columns={volumeInviteUserHead} dataSource={volumeInviteUserData} pagination={false} scroll={{ y: 320,x:'130%' }} />
                    </div>
                    <div className={`${styles.income_detail}`}>
                        <div className={`${styles.titles}`}>
                            <span>收益明细</span>
                            <div className={`${styles.lists}`}>
                                <Tabs defaultActiveKey="0" onChange={(key)=>{
                                    this.getFinanceDetails(1,key);
                                    this.setState({
                                        rewardType : key,
                                        currentPage : 1
                                    })
                                }}>
                                    <TabPane tab="全部" key="0"></TabPane>
                                    <TabPane tab="挖矿奖励" key="1"></TabPane>
                                    <TabPane tab="分享奖励" key="2"></TabPane>
                                    <TabPane tab="社区管理奖励" key="3"></TabPane>
                                    <TabPane tab="社区平级奖励" key="4"></TabPane>
                                    <TabPane tab="社区级差奖励" key="5"></TabPane>
                                </Tabs>
                            </div>

                        </div>
                        <Table
                        rowKey={volumeFinanceDetails => volumeFinanceDetails.id}
                        columns={volumeFinanceDetailsHead}
                        dataSource={volumeFinanceDetails}
                        pagination={{
                            pageSize: 10,
                            total:parseInt(this.state.totalNum),
                            onChange:this.onPageChange.bind(this),
                            current:parseInt(this.state.currentPage),
                        }}
                        scroll={{ y: 320 }}/>
                    </div>
                    {showModal.inviteCode && <ModalInfo
                        width='35vw'
                        isShow={(e) => {
                            showModal.inviteCode = e
                            showModal.zr = false
                            showModal.zc = false
                            this.setState({ showModal: showModal })
                        }}
                        style={{
                            width: '30%'
                        }}>
                        <div style={{ display: 'flex', flex: 1, alignItems: 'center', flexDirection: 'column' }}>
                            <span style={{ color: '#E64F4F', fontSize: '1.7vw' }}>
                                必须有邀请码才能参与挖矿
                            </span>

                            <div style={{
                                display: 'flex',
                                width: '100%',
                                flexDirection: 'row',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                marginTop: 40,
                                marginBottom: 20
                            }}>
                                <span style={{ color: '#353535' }}>请输入邀请码</span>
                                <div style={{
                                    width: '70%',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    border: '1px solid #eee',
                                    backgroundColor: '#fff',
                                }}>
                                    <Input
                                    style={{ width: '100%', border: 'none' }}
                                    placeholder={'请输入邀请码'}
                                    value = {referInviteCode}
                                    onChange={this.invitecodeOnchange}/>
                                </div>
                            </div>

                            <Button disabled={!referInviteCode} onClick={this.saveReferinviteCode} style={{ width: '100%', marginTop: 20 ,background:'#E64F4F'}} size='large' type='primary'>确定</Button>
                        </div>
                    </ModalInfo>}
                    {showModal.zr && <ModalInfo
                        width='35vw'
                        isShow={(e) => {
                            showModal.zr = e
                            showModal.zc = false
                            this.setState({ showModal: showModal })
                        }}
                        style={{
                            width: '30%'
                        }}>
                        <div style={{ display: 'flex', flex: 1, alignItems: 'center', flexDirection: 'column' }}>
                            <span style={{ color: '#E64F4F', fontSize: '1.7vw' }}>
                                转入挖矿部落
               </span>
                            <div style={{
                                display: 'flex',
                                width: '100%',
                                flexDirection: 'row',
                                justifyContent: 'space-between',
                                marginTop: 20
                            }}>
                                <span style={{ color: '#353535' }}>币种</span>
                                <Select defaultValue={selectValue} style={{ width: '70%' }} onChange={this.coinChange}>
                                {coinList && coinList.map(item => {
                                    return (
                                    <Option key={item.id} value={item.name}>
                                        {item.name}
                                    </Option>
                                    );
                                })}
                                </Select>
                            </div>
                            <div style={{
                                display: 'flex',
                                width: '100%',
                                flexDirection: 'row',
                                justifyContent: 'space-between',
                                marginTop: 20
                            }}>
                                <span style={{ color: '#353535' }}>转入挖矿部落</span>
                                <div style={{
                                    width: '70%',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    border: '1px solid #eee',
                                    backgroundColor: '#fff'
                                }}>
                                    <Input
                                    style={{ width: '60%', border: 'none' }}
                                    placeholder={'请输入余额('+ selectValue +')'}
                                    value = {coinNum}
                                    onChange={this.codeOnchange}/>
                                    <span onClick={
                                        ()=>{
                                            var coinVolumeTemp = coinVolume;
                                            if(selectValue.toUpperCase() !== 'BTC'){
                                                coinVolumeTemp = coinVolume === 0 ? coinVolume : coinVolume.toFixed(2)
                                            }
                                            this.setState({ coinNum: coinVolumeTemp });
                                        }
                                    } style={{ width: '40%', textAlign: 'right', paddingRight: 10,color:'#E64F4F',cursor: 'pointer' }}>全部转入</span>
                                </div>
                            </div>
                            <div style={{
                                display: 'flex',
                                width: '100%',
                                flexDirection: 'row',
                                justifyContent: 'space-between',
                                marginTop: 20
                            }}>
                                <span style={{ color: '#353535' }}>资金密码</span>
                                <div style={{ width: '70%' }}>
                                    <PayPasswordForm {...{ localization, wrappedComponentRef:(form) => this.zrPasswordRef = form }} />
                                </div>
                            </div>

                            <span style={{ display: 'flex', alignSelf: 'flex-end', fontSize: 12,marginTop:10,color:'#333'}}>(可用金额{ selectValue.toUpperCase() === 'BTC' ? (coinVolume === 0 ? 0 : coinVolume) : (coinVolume === 0 ? 0 : coinVolume.toFixed(2)) }{selectValue})</span>
                            <Button onClick={this.volumeAdd} style={{ width: '100%', marginTop: 20 ,background:'#E64F4F'}} size='large' type='primary'>确定</Button>
                        </div>
                    </ModalInfo>}
                    {showModal.zc && <ModalInfo
                        width='35vw'
                        isShow={(e) => {
                            showModal.zr = false
                            showModal.zc = e
                            this.setState({ showModal: showModal })
                        }}
                        style={{
                            width: '30%'
                        }}>
                        {!((listItem || {}).isItem) ?
                            <div style={{ display: 'flex', flex: 1, flexDirection: 'column' }}>
                                <span style={{ display: 'flex', alignSelf: 'center', color: '#E64F4F', fontSize: '1.7vw' }}>
                                    转出挖矿部落
               </span>
                                <span style={{ display: 'block', color: '#353535', fontSize: '1vw', marginBottom: '.9vw' }}>我的投资列表</span>
                                {
                                    volumeUserChangeData && volumeUserChangeData.map((v, k) => {
                                        return (
                                            <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }} key={k} onClick={() => {
                                                return this.setState({
                                                    listItem: { ...v, isItem: true }
                                                })
                                            }}>
                                                <div style={{
                                                    width: '100%',
                                                    display: 'flex',
                                                    flexDirection: 'row',
                                                    border: '1px solid #e0e0e0',
                                                    padding: '2%',
                                                    marginBottom: 10
                                                }}>
                                                    <div style={{ width: '84%', display: 'flex', flexDirection: 'column', }}>
                                                        <div>
                                                            <span style={{ color: '#333', fontSize: '1vw' }}>金额：{v.coinNum} {v.coinSymbol}</span>
                                                            <span style={{ color: '#E64F4F', margin: '0 1vw', fontWeight: '700' }}>|</span>
                                                            <span>累计收益：<span style={{ color: '#E64F4F' }}>{v.accumulIncome} {gb}</span></span>
                                                        </div>
                                                        <span style={{ fontSize: '.8vw', color: '#999' }}>存入时间：{v.createStr}</span>
                                                    </div>
                                                    <div
                                                        style={{ width: '14%', display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                                                        <Icon type="right" />
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    })
                                }
                                {/* <Button onClick={() => {
                                    showModal.zr = false
                                    showModal.zc = false
                                    this.setState({ showModal: showModal })
                                }} style={{ width: '100%', marginTop: 20 }} size='large' type='primary'>确定</Button> */}
                            </div> : <div style={{ display: 'flex', flex: 1, flexDirection: 'column' }}>
                                <div>
                                    <Icon type='left' onClick={() => {
                                        this.setState({ listItem: {} })
                                    }} />
                                </div>
                                <span style={{ display: 'flex', alignSelf: 'center', color: '#E64F4F', fontSize: '1.7vw' }}>
                                    转出挖矿部落
               </span>
                                <span style={{ textAlign: 'center', fontSize: '.9vw', margin: '1.6vw 0 1.2vw', color: '#333' }}>如转入金额未满30日，转出将收取5%的手续费</span>
                                <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                                    <div style={{
                                        width: '100%',
                                        display: 'flex',
                                        flexDirection: 'row',
                                        border: '1px solid #e0e0e0',
                                        padding: '2%',
                                        marginBottom: 10
                                    }}>
                                        <div style={{ width: '84%', display: 'flex', flexDirection: 'column', }}>
                                            <div>
                                                <span style={{ color: '#333', fontSize: '1vw' }}>金额：{listItem.coinNum} {listItem.coinSymbol}</span>
                                                <span style={{ color: '#E64F4F', margin: '0 1vw', fontWeight: '700' }}>|</span>
                                                <span>累计收益：<span style={{ color: '#E64F4F' }}>{listItem.accumulIncome} {gb}</span></span>
                                            </div>
                                            <span style={{ fontSize: '.8vw', color: '#999' }}>存入时间：{listItem.createStr}</span>
                                        </div>
                                    </div>
                                </div>
                                <PayPasswordForm {...{ localization, wrappedComponentRef:(form) => this.zcPasswordRef = form }} />
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Button onClick={() => {
                                        showModal.zr = false
                                        showModal.zc = false
                                        this.setState({ showModal: showModal })
                                    }} style={{ width: '48%', height: '3.47vw', marginTop: 20, border: '1px solid #e0e0e0', color: '#5c5c5c' }}>取消</Button>
                                    <Button onClick={
                                        this.volumeTakeOutIncome
                                        // () => {
                                        // showModal.zr = false
                                        // showModal.zc = false
                                        // this.setState({ showModal: showModal })
                                        // }
                                    } style={{ width: '48%', height: '3.47vw', marginTop: 20, background: '#E64F4F' }} type='primary'>确定转出</Button>
                                </div>
                            </div>}
                    </ModalInfo>}
                </div>
            </DocumentTitle>
        );
    }
}
