import React, { Component } from 'react';
import 'braft-editor/dist/index.css';
import {
  Form,
  Input,
  Button,
  Select,
  Tag,
  Space,
  Table,
  Modal,
  message,
  Upload,
} from 'antd';
import { ExclamationCircleOutlined, UserOutlined } from '@ant-design/icons';
import { get, post } from '../../commons/http';

const { confirm } = Modal;
const { Option } = Select;

export default class Appendix extends Component {
  state = {
    appendixes: [],
    APPENDIXES: [],
  };

  columns = [
    {
      title: '竞赛名称',
      dataIndex: ['competition', 'title'],
      key: 'title',
    },
    {
      title: '参赛队员',
      dataIndex: ['team', 'member'],
      key: 'member',
    },
    {
      title: '作品',
      key: 'appendix',
      render: (text, record) => {
        const { appendix } = record;
        return appendix.url ? (
          <Space size="middle">
            {/* <a onClick={() => this.edit(record._id)}>aaa</a> */}
            <a href={appendix.url} download={appendix.name}>
              点击下载
            </a>
          </Space>
        ) : (
          <Space size="middle">
            <span>未提交</span>
          </Space>
        );
      },
    },
    {
      title: '操作',
      key: 'action',
      render: (text, record) => {
        return (
          <Space size="middle">
            {record.appendix.url ? (
              <a onClick={() => this.delete(record)}>删除作品</a>
            ) : null}
            <Upload
              accept=".doc,.docx,.xls,.xlsx,.ppt,.pptx,.pdf,.txt,.html,.log,.key,.numbers,.pages,.zip,.tar,.rar,.css,.js,.stp,.igs,.dwg"
              method="post"
              action="http://localhost:3001/uploadToGuochuangyun?s=App.CDN.UploadOffice&app_key=5687BCD24AA4D3C1ED073F5C8AC17C6B&sign=wtOVTtR1veX4VVwgSkYMf0Ur9YVHsifAhGl55hbXMrQbwGKWkPmBAEHoo5ydejQncZWI5b"
              onChange={(info) => {
                this.handleChange(
                  {
                    competitionId: record.competition.id,
                    teamId: record.team.id,
                  },
                  info
                );
              }}
              showUploadList={false}
            >
              <a>提交作品</a>
            </Upload>
          </Space>
        );
      },
    },
  ];

  componentDidMount() {
    const getAllAppendixes = async () => {
      const response = await get('/competition/getAllAppendixes');
      if (response.code === 0) {
        this.setState({
          appendixes: response.data.appendixes,
          APPENDIXES: response.data.appendixes,
        });
      } else {
        message.error('获取数据失败', 1);
      }
    };

    getAllAppendixes();
  }

  handleSearch = (values, isReset = false) => {
    if (isReset) {
      this.setState({ appendixes: this.state.APPENDIXES });
      this.form.resetFields(); //清空表单
      return;
    }
    const { title, members } = values;
    console.log(title, members);
    if (!title && !members) return;
    const appendixes = [...this.state.APPENDIXES];
    const result = appendixes.filter((appendix) => {
      if (title) {
        if (appendix.competition.title.indexOf(title) === -1) {
          return false;
        }
      }
      if (members) {
        if (appendix.team.member.indexOf(members) === -1) {
          return false;
        }
      }
      return true;
    });
    this.setState({ appendixes: result });
  };

  delete = (info) => {
    confirm({
      title: '您确定要删除吗？',
      icon: <ExclamationCircleOutlined />,
      okText: '确定',
      cancelText: '取消',
      onOk() {
        const deleteFile = async () => {
          const cdnResponse = await post(
            `http://localhost:3001/uploadToGuochuangyun?s=App.CDN.Delete&app_key=5687BCD24AA4D3C1ED073F5C8AC17C6B&url=${info.appendix.url}`,
            {},
            true
          );
          if (cdnResponse.ret === 200) {
            //cdn删除成功，删除数据库
            const response = await post('/competition/deleteAppendix', {
              competitionId: info.competition.id,
              teamId: info.team.id,
            });
            if (response.code === 0) {
              message.success('删除成功', 1);
            } else {
              message.warning('删除失败，请稍后尝试', 1);
            }
          } else {
            message.warning('删除失败，请稍后尝试', 1);
          }
        };

        deleteFile();
      },
    });
  };

  //   submit = () => {};

  handleChange = async (submitInfo, info) => {
    const fileUrl = info.file?.response?.data?.url;
    if (fileUrl) {
      const { competitionId, teamId } = submitInfo;
      const response = await post(`/competition/submitAppendix`, {
        competitionId,
        teamId,
        appendix: {
          name: info.file.name,
          url: fileUrl,
          fileType: info.file.type,
          uid: info.file.uid,
          size: info.file.size,
        },
      });
      if (response.code === 0) {
        message.success('上传成功', 1);
      } else {
        message.error('上传失败', 1);
      }
    }
  };

  render() {
    return (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div
          style={{
            backgroundColor: '#fff',
            padding: '8px 5px',
            display: 'flex',
          }}
        >
          <Form
            layout="inline"
            onFinish={this.handleSearch}
            ref={(form) => (this.form = form)}
          >
            <Form.Item name="title">
              <Input
                style={{ width: 150 }}
                prefix={<UserOutlined style={{ color: 'rgba(0,0,0,.25)' }} />}
                placeholder="竞赛名称"
              />
            </Form.Item>
            <Form.Item name="members">
              <Input
                style={{ width: 150 }}
                prefix={<UserOutlined style={{ color: 'rgba(0,0,0,.25)' }} />}
                placeholder="参赛队员"
              />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit">
                查询
              </Button>
            </Form.Item>
          </Form>
          <Button
            type="primary"
            onClick={() => this.handleSearch({}, true)}
            style={{ marginRight: '17px' }}
          >
            重置
          </Button>
        </div>
        <div style={{ backgroundColor: '#fff', flex: 1, marginTop: '10px' }}>
          <Table
            columns={this.columns}
            dataSource={this.state.appendixes}
            pagination={{
              current: this.state.pageNum,
              pageSize: this.state.pageSize,
              // hideOnSinglePage: true,
              showQuickJumper: true,
              showSizeChanger: true,
              onShowSizeChange: (currentPage, pageSize) =>
                this.pageSizeChange(currentPage, pageSize),
              onChange: (currentPage) => this.changePage(currentPage),
            }}
          />
        </div>
      </div>
    );
  }
}
