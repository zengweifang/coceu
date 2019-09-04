import React, { PureComponent } from 'react';
import { Modal, Input, Pagination, Icon } from 'antd';
import { stampToDate } from 'utils';
import request from 'utils/request';
import { Loading, Empty } from 'components/Placeholder';

import styles from './index.less';

const Search = Input.Search;

class SuperBook extends PureComponent {
  state = {
    address: '',
    records: [],
    total: 0,
    page: 1,
    record: {},
    visible: false
  };

  componentDidMount() {
    this.handleChange(1);
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.address !== this.state.address) {
      this.handleChange(1);
    }
  }

  handleClickCell = record => {
    this.setState({ visible: true, record });
  };

  handleClose = () => {
    this.setState({ visible: false });
  };

  handleChange = page => {
    const { address } = this.state;
    this.setState({ records: null });
    request(`/super/book/list`, {
      method: 'GET',
      body: {
        address,
        showCount: 10,
        currentPage: page
      }
    }).then(json => {
      if (json.code === 10000000) {
        if (json.data.list) {
          const records = json.data.list.map((item, index) => {
            item.key = index;
            return item;
          });
          this.setState({
            records,
            page,
            total: json.data.count
          });
        }
      }
    });
  };

  handleSearch = address => {
    this.setState({ address: address.trim() });
  };

  render() {
    const { localization } = this.props;
    const { records, total, page, record } = this.state;

    const paginationProps = {
      total,
      pageSize: 10,
      current: page,
      onChange: this.handleChange
    };

    return (
      <div className="container">
        <div className={styles.superBook}>
          <h1>{localization['超级账本']}</h1>
          <div className={styles.searchBox}>
            <Search
              enterButton
              size="large"
              placeholder={localization['请输入账本地址']}
              onSearch={this.handleSearch}
            />
          </div>
          <div className={styles.table}>
            <header className={styles.head}>
              <span className={styles.txHash}>{localization['交易哈希值']}</span>
              <span className={styles.areaHeight}>{localization['区块']}</span>
              <span className={styles.outAddress}>{localization['发送方']}</span>
              <span className={styles.arrow} />
              <span className={styles.inAddress}>{localization['接收方']}</span>
              <span className={styles.volume}>{localization['价值']}</span>
              <span className={styles.countDate}>{localization['时间戳']}</span>
            </header>
            <ul className={styles.body}>
              {records ? (
                records.length > 0 ? (
                  records.map(record => {
                    return (
                      <li key={record.txHash} onClick={this.handleClickCell.bind(this, record)}>
                        <span className={`${styles.txHash} ${styles.ellipsis}`}>
                          {record.txHash}
                        </span>
                        <span className={styles.areaHeight}>
                          <span className={styles.areaHeightText}>{localization['区块']}：</span>
                          {record.areaHeight}
                        </span>
                        <span className={`${styles.outAddress} ${styles.ellipsis}`}>
                          {record.outAddress}
                        </span>
                        <span className={styles.arrow}>
                          <Icon type="arrow-right" />
                        </span>
                        <span className={`${styles.inAddress} ${styles.ellipsis}`}>
                          {record.inAddress}
                        </span>
                        <span className={styles.volume}>
                          {record.volume} <em>({record.coinSymbol})</em>
                        </span>
                        <span className={styles.countDate}>
                          {stampToDate(record.countDate * 1, 'YYYY-MM-DD')}
                        </span>
                        <span className={styles.more}>
                          <i className="iconfont icon-more" />
                        </span>
                      </li>
                    );
                  })
                ) : (
                  <Empty {...{ localization }} />
                )
              ) : (
                <Loading />
              )}
            </ul>
            <div className={styles.pagination}>
              {records?.length > 0 && <Pagination {...paginationProps} />}
            </div>
          </div>
          <Modal
            title={localization['交易信息']}
            visible={this.state.visible}
            onCancel={this.handleClose}
            footer={null}
          >
            <ul className={styles.info}>
              <li>
                <span>{localization['交易哈希值']}：</span>
                {record.txHash}
              </li>
              <li>
                <span>{localization['区块']}：</span>
                {record.areaHeight}
              </li>
              <li>
                <span>{localization['发送方']}：</span>
                {record.outAddress}
              </li>
              <li>
                <span>{localization['接收方']}：</span>
                {record.inAddress}
              </li>
              <li>
                <span>{localization['价值']}：</span>
                {record.volume}
              </li>
              <li>
                <span>{localization['时间戳']}：</span>
                {stampToDate(record.countDate * 1, 'YYYY-MM-DD')}
              </li>
            </ul>
          </Modal>
        </div>
      </div>
    );
  }
}

export default SuperBook;
