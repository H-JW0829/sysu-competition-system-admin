import React, { Component } from 'react';
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
import { STUDENT, TEACHER } from '../../commons/commonVar';
import EditForm from './EditForm';
import AddForm from './AddForm';

const { confirm } = Modal;
const { Option } = Select;

export default class UserCenter extends Component {
  state = {
    pageNum: 1,
    pageSize: 5,
    userInfo: [],
    showModal: false,
    id: '',
    USER_INFO: [],
    showAddUserModal: false,
  };

  columns = [
    {
      title: '姓名',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '联系方式',
      dataIndex: 'tel',
      key: 'tel',
    },
    {
      title: '角色',
      key: 'role',
      dataIndex: 'role',
      render: (role) => (
        <Tag
          color={
            role === STUDENT
              ? 'geekblue'
              : role === TEACHER
              ? 'green'
              : 'orange'
          }
        >
          {role}
        </Tag>
      ),
    },
    {
      title: '操作',
      key: 'action',
      render: (text, record) => {
        console.log(record, 'rrrr');
        return (
          <Space size="middle">
            <a onClick={() => this.editUser(record._id)}>编辑</a>
            <a onClick={() => this.confirmDelete(record._id)}>删除</a>
          </Space>
        );
      },
    },
  ];

  componentDidMount() {
    const getAllUserInfo = async () => {
      const response = await get('/user/all/info');
      this.setState({ userInfo: response.data });
      this.setState({ USER_INFO: response.data });
    };

    getAllUserInfo();
  }

  editUser = (id) => {
    this.setState({ showModal: true, id });
  };

  changePage = (currentPage) => {
    this.setState({ pageNum: currentPage });
  };

  pageSizeChange = (currentPage, pageSize) => {
    this.setState({ pageNum: currentPage, pageSize });
  };

  handleCancel = () => {
    this.setState({ showModal: false });
  };

  handleAddUserCancel = () => {
    this.setState({ showAddUserModal: false });
  };

  modifySuccess = (user) => {
    this.setState({ showModal: false });
    const users = [...this.state.userInfo];
    for (let i = 0; i < users.length; i++) {
      if (users[i]._id === user.id) {
        users[i] = user;
        this.setState({ userInfo: users });
        break;
      }
    }
  };

  handleSearch = (values, isReset = false) => {
    if (isReset) {
      this.setState({ userInfo: this.state.USER_INFO });
      this.form.resetFields(); //清空表单
      return;
    }
    const { name, role } = values;
    if (!name && !role) return;
    let result;
    const users = [...this.state.USER_INFO];
    if (name && role) {
      result = users.filter((user) => {
        return user.name.includes(name) && user.role === role;
      });
    } else {
      if (name) {
        result = users.filter((user) => {
          return user.name.includes(name);
        });
      } else if (role) {
        result = users.filter((user) => {
          return user.role === role;
        });
      }
    }
    this.setState({ userInfo: result });
  };

  addUser = () => {
    this.setState({ showAddUserModal: true });
  };

  deleteUser = async (id) => {
    const response = await post('/user/delete', {
      id,
    });
    if (response.code === 0) {
      const users = this.state.userInfo.filter((user) => {
        return user._id !== id;
      });
      console.log(users);
      this.setState({ userInfo: users });
      message.success('删除成功', 1);
    } else {
      message.error('删除失败', 1);
    }
  };

  confirmDelete = (id) => {
    const that = this;
    confirm({
      title: '确定要删除该用户吗？',
      icon: <ExclamationCircleOutlined />,
      okText: '确定',
      cancelText: '取消',
      onOk() {
        that.deleteUser(id);
      },
    });
  };

  addSuccess = (user) => {
    this.setState({ showAddUserModal: false });
    console.log(this.state.userInfo);
    const users = [...this.state.userInfo];
    users.unshift(user);
    this.setState({ userInfo: users });
    this.setState({ showAddUserModal: false });
  };

  render() {
    const { id, USER_INFO } = this.state;
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
            ref={(form) => {
              this.form = form;
            }}
          >
            <Form.Item name="name">
              <Input
                style={{ width: 150 }}
                prefix={<UserOutlined style={{ color: 'rgba(0,0,0,.25)' }} />}
                placeholder="姓名"
              />
            </Form.Item>
            <Form.Item name="role">
              <Select
                style={{ width: 100 }}
                showSearch
                placeholder="职位"
                optionFilterProp="children"
                filterOption={(input, option) =>
                  option.props.children
                    .toLowerCase()
                    .indexOf(input.toLowerCase()) >= 0
                }
              >
                <Option value="teacher">老师</Option>
                <Option value="student">学生</Option>
                <Option value="admin">管理员</Option>
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
          <Button type="primary" onClick={this.addUser}>
            增加
          </Button>
        </div>
        <div style={{ backgroundColor: '#fff', flex: 1, marginTop: '10px' }}>
          <Table
            columns={this.columns}
            dataSource={this.state.userInfo}
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
            visible={this.state.showModal}
            title="用户信息"
            onOk={this.handleOk}
            onCancel={this.handleCancel}
            confirmLoading={this.state.confirmLoading}
            footer={false}
            width="450px"
            bodyStyle={{ height: '340px', overflowY: 'auto' }}
            destroyOnClose={true}
          >
            <EditForm id={id} modifySuccess={this.modifySuccess}></EditForm>
          </Modal>
        </div>
        <div>
          <Modal
            visible={this.state.showAddUserModal}
            title="增加用户"
            onOk={this.handleOk}
            onCancel={this.handleAddUserCancel}
            confirmLoading={this.state.confirmLoading}
            footer={false}
            width="450px"
            bodyStyle={{ height: '400px', overflowY: 'auto' }}
            destroyOnClose={true}
          >
            <AddForm addSuccess={this.addSuccess} users={USER_INFO}></AddForm>
          </Modal>
        </div>
      </div>
    );
  }
}
