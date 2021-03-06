import React, { Component } from 'react';
import {
  Form,
  Input,
  Button,
  Space,
  Select,
  message,
  DatePicker,
  InputNumber,
} from 'antd';
import { get, post } from '../../commons/http';
import { publicEncrypt } from 'crypto';
import styles from './style.less';
import moment from 'moment';

const { RangePicker } = DatePicker;
// const { Option } = Select;

const layout = {
  labelCol: { span: 5 },
  wrapperCol: { span: 18 },
};
const tailLayout = {
  wrapperCol: { offset: 11, span: 20 },
};

export default class EditForm extends Component {
  state = {
    competition: {},
  };

  componentDidMount() {
    this.fetchData();
  }

  fetchData = async () => {
    const dateFormat = 'YYYY/MM/DD';
    const { id } = this.props;
    const response = await post('/competition/find', {
      id,
    });
    const temp = { ...response.data.competition };
    let { start_time, end_time } = response.data.competition;
    temp.score_teacher = response.data.competition.score_teacher.staffId;
    temp.time = [
      moment(start_time.replace('-', '/'), dateFormat),
      moment(end_time.replace('-', '/'), dateFormat),
    ];
    this.setState({ competition: response.data.competition });
    this.form.setFieldsValue(temp);
  };

  handleSubmit = async (values) => {
    let {
      title,
      organizer,
      tags,
      time,
      desc,
      min_people,
      max_people,
      score_teacher,
    } = values;
    if (max_people < min_people) {
      message.error('最大人数限制不能小于最小人数限制', 1);
      return;
    }
    const start_time = moment(time[0].format('YYYY-MM-DD'))._i;
    const end_time = moment(time[1].format('YYYY-MM-DD'))._i;
    const response = await post('/competition/update', {
      title,
      desc,
      organizer,
      tags,
      start_time,
      end_time,
      max_people,
      min_people,
      score_teacher,
      id: this.props.id,
    });
    if (response.code === 0) {
      message.success('修改成功', 2);
      setTimeout(() => {
        this.props.updateSuccess();
      }, 1000);
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
            label="名称"
            name="title"
            rules={[{ required: true, message: '请输入名称' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="举办方"
            name="organizer"
            rules={[{ required: true, message: '请输入举办方' }]}
          >
            <Input />
          </Form.Item>

          {/* <Form.Item
            label="开始时间"
            name="start_time"
            rules={[{ required: true, message: '请输入开始时间' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="结束时间"
            name="end_time"
            rules={[{ required: true, message: '请输入结束时间' }]}
          >
            <Input />
          </Form.Item> */}

          <Form.Item
            label="时间"
            name="time"
            rules={[{ required: true, message: '请选择时间' }]}
          >
            <RangePicker />
          </Form.Item>

          <Form.Item
            label="评分教师"
            name="score_teacher"
            rules={[{ required: true, message: '请输入评分教师' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="最小人数"
            name="min_people"
            rules={[{ required: true, message: '请输入最小人数限制' }]}
          >
            <InputNumber />
          </Form.Item>

          <Form.Item
            label="最大人数"
            name="max_people"
            rules={[{ required: true, message: '请输入最大人数限制' }]}
          >
            <InputNumber />
          </Form.Item>

          <Form.Item
            label="标签"
            name="tags"
            rules={[{ required: true, message: '请输入结束时间' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="简介"
            name="desc"
            rules={[{ required: true, message: '请输入竞赛简介' }]}
          >
            <Input.TextArea />
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
