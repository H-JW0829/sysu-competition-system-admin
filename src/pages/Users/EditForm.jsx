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

  componentDidMount() {
    this.fetchData();
  }

  fetchData = async () => {
    const { id } = this.props;
    console.log(id, 'rrrr');
    const response = await post('/user/getUserInfoById', {
      id,
    });
    this.setState({ user: response.data.user });
    this.form.setFieldsValue(response.data.user);
  };

  handleSubmit = async (values) => {
    console.log(values);
    const { name, tel, role, newPassword } = values;
    let rsaPassword;
    if (newPassword && newPassword !== '') {
      const publicKey = window.localStorage.getItem('publicKey');
      rsaPassword = publicEncrypt(publicKey, Buffer.from(newPassword)).toString(
        'base64'
      );
    }
    const user = {
      name,
      tel,
      role,
      _id: this.props.id,
      password: rsaPassword,
    };
    const response = await post('/user/updateInfo', user);
    if (response.code === 0) {
      message.success('修改成功');
      setTimeout(() => {
        this.props.modifySuccess(user);
      }, 1000);
    } else {
      message.error(response.msg || '修改失败，请稍后尝试');
    }
  };

  render() {
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
            label="姓名"
            name="name"
            rules={[
              {
                required: true,
                message: '请输入姓名',
              },
              {
                type: 'string',
                max: 20,
                message: '姓名长度不超过20个字符',
              },
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item label="联系方式" name="tel">
            <Input disabled />
          </Form.Item>

          <Form.Item
            label="新密码"
            name="newPassword"
            rules={[
              // { required: true, message: '请输入密码' },
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
