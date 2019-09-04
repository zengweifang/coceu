import React, { PureComponent } from 'react';
import { Modal, Table } from 'antd'
import { stampToDate } from 'utils';
import request from 'utils/request';
import './freeze.less'

export default class FreezeModal extends PureComponent {

  constructor(props) {
    super(props)
    this.state = {
      dataSource: [],
      currentPage: 1,
      total: 0,
      loading: false
    }
  }

  getReleaseData = (currentPage) => {
    const { relationId } = this.props;
    this.setState({ loading: true })
    request('/mk2/history/release', {
      method: 'GET',
      body: {
        currentPage,
        showCount: 10,
        relationId
      }
    }).then(json => {
      this.setState({ loading: false })
      if (json.code === 10000000) {
        let { list, count } = json.data;
        list = list.map((item) => {
          item.key = item.id;
          return item;
        })
        this.setState({ dataSource: list, total: count, currentPage })
      }
    });
  }

  componentDidMount() {
    this.getReleaseData(1)
  }
  render() {
    const { onCancel, localization } = this.props;
    const { dataSource, total, currentPage, loading } = this.state;
    const columns = [
      {
        title: '释放日期',
        dataIndex: 'releaseCycleDate',
        key: 'releaseCycleDate',
        render: (text) => {
          return <div>{stampToDate(text * 1, 'YYYY-MM-DD')}</div>
        }
      },
      {
        title: '释放数量',
        dataIndex: 'releaseVolume',
        key: 'releaseVolume',
      }
    ]

    const tableProps = {
      size: 'small',
      dataSource: dataSource,
      columns: columns,
      bordered: true,
      pagination: {
        total: total,
        pageSize: 10,
        currentPage: currentPage,
        onChange: (page) => {
          this.getReleaseData(page);
        }
      }
    }
    return <Modal
      title={localization['释放详情']}
      centered
      loading={loading}
      footer={null}
      visible
      onCancel={onCancel}
      wrapClassName='freeze-modal'
    >
      <Table {...tableProps} bordered />
    </Modal>
  }
}