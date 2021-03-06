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
} from 'antd';
import { ExclamationCircleOutlined, UserOutlined } from '@ant-design/icons';
import { get, post } from '../../commons/http';
import Editor from './Editor';
import EditForm from './EditForm';
import AddForm from './AddForm';

const { confirm } = Modal;
const { Option } = Select;

export default class UserCenter extends Component {
  state = {
    pageNum: 1,
    pageSize: 5,
    competitions: [],
    COMPETITIONS: [],
    teacherIds: [],
    showEditor: false,
    showEditModal: false,
    id: '',
    showAddModal: false,
  };

  columns = [
    {
      title: '名称',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: '举办方',
      dataIndex: 'organizer',
      key: 'organizer',
    },
    {
      title: '报名数',
      dataIndex: 'team_num',
      key: 'team_num',
    },
    {
      title: '开始时间',
      dataIndex: 'start_time',
      key: 'start_time',
    },
    {
      title: '结束时间',
      dataIndex: 'end_time',
      key: 'end_time',
    },
    {
      title: '状态',
      key: 'status',
      dataIndex: 'status',
      render: (status) => (
        <Tag
          color={status == 0 ? 'geekblue' : status == 1 ? 'green' : 'orange'}
        >
          {status == 0 ? '未开始' : status == 1 ? '进行中' : '已结束'}
        </Tag>
      ),
    },
    {
      title: '操作',
      key: 'action',
      render: (text, record) => {
        console.log(record, 'xxx');
        return (
          <Space size="middle">
            <a onClick={() => this.edit(record._id)}>编辑</a>
            <a onClick={() => this.editContent(record._id)}>编辑内容</a>
            <a onClick={() => this.confirmDelete(record._id)}>删除</a>
            {record.showRank ? (
              <a onClick={() => this.confirmUnPublish(record._id)}>
                取消发布成绩
              </a>
            ) : (
              <a onClick={() => this.confirmPublish(record._id)}>发布成绩</a>
            )}
          </Space>
        );
      },
    },
  ];

  componentDidMount() {
    const getAllCompetition = async () => {
      const response = await get('/competition/all');
      this.setState({
        competitions: response.data.competitions,
        COMPETITIONS: response.data.competitions,
      });
    };

    const getAllTeacherId = async () => {
      const { data } = await get('/user/userInfo/teacher');
      // console.log(response);
      const teacherIds = [];
      for (let i = 0; i < data.length; i++) {
        teacherIds.push(data[i].staffId);
      }
      this.setState({ teacherIds });
    };

    getAllCompetition();
    getAllTeacherId();
  }

  editContent = (id) => {
    this.setState({ showEditor: true, id });
  };

  edit = (id) => {
    this.setState({ showEditModal: true, id });
  };

  changePage = (currentPage) => {
    this.setState({ pageNum: currentPage });
  };

  pageSizeChange = (currentPage, pageSize) => {
    this.setState({ pageNum: currentPage, pageSize });
  };

  handleCancel = () => {};

  handleSearch = (values, isReset = false) => {
    if (isReset) {
      this.setState({ competitions: this.state.COMPETITIONS });
      this.form.resetFields(); //清空表单
      return;
    }
    const { organizer, title, status } = values;
    console.log(values);
    if (!organizer && !title && !status) return;
    const competitions = [...this.state.COMPETITIONS];
    let result = competitions.filter((competition) => {
      if (organizer) {
        if (competition.organizer.indexOf(organizer) === -1) {
          return false;
        }
      }
      if (title) {
        if (competition.title.indexOf(title) === -1) {
          return false;
        }
      }
      console.log(competition.status, status, 'xxx');
      if (status) {
        if (status === '3') {
          //成绩未发布
          if (!competition.showRank) {
            return true;
          } else {
            return false;
          }
        }
        if (status === '4') {
          if (competition.showRank) {
            return true;
          } else {
            return false;
          }
        }
        if (competition.status != status) {
          return false;
        }
      }
      return true;
    });
    this.setState({ competitions: result });
  };

  confirmDelete = (id) => {
    const that = this;
    confirm({
      title: '确定要删除该竞赛吗？',
      icon: <ExclamationCircleOutlined />,
      okText: '确定',
      cancelText: '取消',
      onOk() {
        that.deleteCompetition(id);
      },
    });
  };

  closeEditor = () => {
    this.setState({ showEditor: false });
  };

  submitCallBack = async (content) => {
    const response = await post('/competition/updateContent', {
      id: this.state.id,
      content,
    });
    if (response.code === 0) {
      message.success('修改成功', 1);
      setTimeout(() => {
        this.setState({ showEditor: false });
      }, 1000);
    }
  };

  closeEditModal = () => {
    this.setState({ showEditModal: false });
  };

  deleteCompetition = async (id) => {
    const response = await post('/competition/delete', {
      id,
    });
    if (response.code === 0) {
      const competitions = this.state.competitions.filter((competition) => {
        return competition._id !== id;
      });
      this.setState({ competitions });
      message.success('删除成功', 1);
    } else {
      message.error('删除失败', 1);
    }
  };

  addCompetition = () => {
    this.setState({ showAddModal: true });
  };

  closeAddModal = () => {
    this.setState({ showAddModal: false });
  };

  addSuccess = () => {
    this.setState({ showAddModal: false });
  };

  updateSuccess = () => {
    this.setState({ showEditModal: false });
  };

  confirmPublish = (id) => {
    const that = this;
    confirm({
      title: '确定要发布成绩吗？',
      icon: <ExclamationCircleOutlined />,
      okText: '确定',
      cancelText: '取消',
      onOk() {
        that.publishRank(id);
      },
    });
  };

  confirmUnPublish = (id) => {
    const that = this;
    confirm({
      title: '确定要取消发布成绩吗？',
      icon: <ExclamationCircleOutlined />,
      okText: '确定',
      cancelText: '取消',
      onOk() {
        that.unPublishRank(id);
      },
    });
  };

  unPublishRank = async (id) => {
    const response = await post('/competition/unPublishRank', {
      competitionId: id,
    });
    if (response.code === 0) {
      message.success('取消发布成功', 1);
    } else {
      message.error('取消发布失败，请重试', 1);
    }
  };

  publishRank = async (id) => {
    const response = await post('/competition/publishRank', {
      competitionId: id,
    });
    if (response.code === 0) {
      message.success('发布成功', 1);
    } else {
      message.error('发布失败，请重试', 1);
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
                placeholder="名称"
              />
            </Form.Item>
            <Form.Item name="organizer">
              <Input
                style={{ width: 150 }}
                prefix={<UserOutlined style={{ color: 'rgba(0,0,0,.25)' }} />}
                placeholder="举办方"
              />
            </Form.Item>
            <Form.Item name="status">
              <Select
                style={{ width: 100 }}
                showSearch
                placeholder="状态"
                optionFilterProp="children"
                filterOption={(input, option) =>
                  option.props.children
                    .toLowerCase()
                    .indexOf(input.toLowerCase()) >= 0
                }
              >
                <Option value={'0'}>未开始</Option>
                <Option value={'1'}>进行中</Option>
                <Option value={'2'}>已结束</Option>
                <Option value={'3'}>成绩未公布</Option>
                <Option value={'4'}>成绩已公布</Option>
              </Select>
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
          <Button type="primary" onClick={this.addCompetition}>
            增加
          </Button>
        </div>
        <div style={{ backgroundColor: '#fff', flex: 1, marginTop: '10px' }}>
          <Table
            columns={this.columns}
            dataSource={this.state.competitions}
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
        <div>
          <Modal
            visible={this.state.showAddModal}
            title="竞赛信息"
            onOk={this.handleOk}
            onCancel={this.closeAddModal}
            confirmLoading={this.state.confirmLoading}
            footer={false}
            width="1200px"
            bodyStyle={{ height: '600px', overflowY: 'auto' }}
            destroyOnClose={true}
          >
            <AddForm
              addSuccess={this.addSuccess}
              teacherIds={this.state.teacherIds}
            ></AddForm>
          </Modal>
        </div>
        <div>
          <Modal
            visible={this.state.showEditModal}
            title="竞赛信息"
            onOk={this.handleOk}
            onCancel={this.closeEditModal}
            confirmLoading={this.state.confirmLoading}
            footer={false}
            width="600px"
            bodyStyle={{ height: '480px', overflowY: 'auto' }}
            destroyOnClose={true}
          >
            <EditForm
              id={this.state.id}
              updateSuccess={this.updateSuccess}
            ></EditForm>
          </Modal>
        </div>
        <div>
          <Modal
            visible={this.state.showEditor}
            onOk={this.handleOk}
            onCancel={this.closeEditor}
            confirmLoading={this.state.confirmLoading}
            footer={false}
            width="1200px"
            bodyStyle={{ height: '600px', overflowY: 'auto' }}
            destroyOnClose={true}
          >
            <Editor
              contentWidth="1000px"
              contentHeight="400px"
              id={this.state.id}
              submitCallBack={this.submitCallBack}
              isEdit={true}
            ></Editor>
          </Modal>
        </div>
      </div>
    );
  }
}
