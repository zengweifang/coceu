import React, { PureComponent } from 'react';
import DocumentTitle from 'react-document-title';
import request from 'utils/request';
import { Loading } from 'components/Placeholder';

class Link extends PureComponent {
  state = {
    title: '',
    detail: ''
  };

  componentDidMount() {
    this.getLinkDetail();
  }

  componentDidUpdate(prevProps) {
    const { language } = this.props;
    if (prevProps.language !== language) {
      this.getLinkDetail();
    }
  }

  //获取访问的网址
  getLinkDetail = () => {
    const { language, match } = this.props;
    const { id } = match.params;
    if (id === 'agreement') {
      this.getArgeement(language);
    } else {
      request(`/cms/view/${id}`, {
        method: 'GET',
        body: { language:'zh_CN' }
      }).then(json => {
        if (json.code === 10000000) {
          this.setState({
            detail: json.data.content,
            title: json.data.title
          });
        }
      });
    }
  };

  //获取用户协议
  getArgeement = language => {
    request('/cms/service', {
      method: 'GET',
      body: { language: 'zh_CN' }
    }).then(json => {
      if (json.code === 10000000) {
        this.setState({
          detail: json.data,
          title: '服务条款'
        });
      }
    });
  };

  render() {
    const { localization } = this.props;
    let { title, detail } = this.state;
    return (
      <DocumentTitle title={`${localization[title]}-${localization['环球数字资产交易平台']}`}>
        <div className="container">
          <div className="writings">
            <h3 className="writings-title">{localization[title]}</h3>
            <div className="writings-content">
              {detail ? <div dangerouslySetInnerHTML={{ __html: detail }} /> : <Loading />}
            </div>
          </div>
        </div>
      </DocumentTitle>
    );
  }
}
export default Link;
