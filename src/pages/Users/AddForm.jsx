import React, { Component } from 'react';
import { Form, Input, Button, Space, Select, message } from 'antd';
import { get, post } from '../../commons/http';
import { publicEncrypt } from 'crypto';

const { Option } = Select;

const layout = {
  labelCol: { span: 5 },
  wrapperCol: { span: 18 },
};
const tailLayout = {
  wrapperCol: { offset: 11, span: 20 },
};

export default class EditForm extends Component {
  state = {
    user: {},
  };

  componentDidMount() {}

  handleSubmit = async (values) => {
    const { name, tel, role, password } = values;
    const publicKey = window.localStorage.getItem('publicKey');
    const rsaPassword = publicEncrypt(
      publicKey,
      Buffer.from(password)
    ).toString('base64');
    const response = await post('/user/add', {
      name,
      tel,
      password: rsaPassword,
      role,
    });
    if (response.code === 0) {
      message.success('添加成功');
      setTimeout(() => {
        this.props.addSuccess(response.data.user);
      }, 1000);
    } else {
      message.error(response.msg || '出错啦~');
      // setTimeout(() => {
      //   this.props.addSuccess(false);
      // }, 1000);
    }
  };

  render() {
    const { users } = this.props;

    return (
      <div>
        <Form
          {...layout}
          name="basic"
          initialValues={{ remember: true }}
          onFinish={this.handleSubmit}
          ref={(form) => (this.form = form)}
        >
          <Form.Item
            label="学号"
            name="staffId"
            validateFirst={true}
            rules={[
              { required: true, message: '请输入学号' },
              {
                type: 'string',
                max: 20,
                message: '学号长度不超过20个字符',
              },
              {
                type: 'string',
                min: 8,
                message: '学号长度不低于8个字符',
              },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  const result = users.find((item) => {
                    return value === item.staffId;
                  });
                  if (result) {
                    return Promise.reject('学号已注册');
                  } else {
                    return Promise.resolve();
                  }
                },
              }),
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="姓名"
            name="name"
            rules={[
              { required: true, message: '请输入姓名' },
              {
                type: 'string',
                max: 20,
                message: '姓名长度不超过20个字符',
              },
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="手机号"
            name="tel"
            rules={[
              { required: true, message: '请输入联系方式' },
              {
                message: '请输入正确的手机号码',
                type: 'string',
                len: 11,
                pattern: /^1[3|4|5|7|8][0-9]\d{8}$/,
              },
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="密码"
            name="password"
            rules={[
              { required: true, message: '请输入密码' },
              {
                type: 'string',
                min: 6,
                message: '密码长度不能低于6位',
              },
              {
                type: 'string',
                max: 20,
                message: '密码长度不能高于20位',
              },
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="role"
            label="身份"
            rules={[{ required: true, message: '请选择身份' }]}
          >
            <Select placeholder="请选择身份" size="large">
              <Option value="student">学生</Option>
              <Option value="teacher">老师</Option>
              <Option value="admin">管理员</Option>
            </Select>
          </Form.Item>

          <Form.Item {...tailLayout}>
            <Button type="primary" htmlType="submit">
              提交
            </Button>
          </Form.Item>
        </Form>
      </div>
    );
  }
}
