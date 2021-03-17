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
  Upload,
  Modal,
} from 'antd';
import { get, post } from '../../commons/http';
import { UploadOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { publicEncrypt } from 'crypto';
import Editor from './Editor';
import moment from 'moment';

const { confirm } = Modal;
const { Option } = Select;
const { RangePicker } = DatePicker;

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
    fileList: [],
  };

  componentDidMount() {}

  handleSubmit = async (values) => {
    const {
      title,
      organizer,
      tags,
      time,
      desc,
      content,
      min,
      max,
      scoreTeacher,
    } = values;
    const { fileList } = this.state;
    if (max < min) {
      message.error('最大人数限制不能小于最小人数限制', 1);
      return;
    }
    const start_time = moment(time[0].format('YYYY-MM-DD'))._i;
    const end_time = moment(time[1].format('YYYY-MM-DD'))._i;
    let tagsArr = tags
      .trim()
      .split(' ')
      .filter((tag) => {
        return tag !== '';
      });
    const response = await post('/competition/add', {
      title,
      desc,
      organizer,
      content,
      tags: tagsArr,
      start_time,
      end_time,
      team_num: 0,
      max_people: max,
      min_people: min,
      score_teacher: scoreTeacher,
      fileList,
    });
    if (response.code === 0) {
      message.success('添加成功', 1);
      setTimeout(() => {
        this.props.addSuccess();
      }, 1000);
    } else {
      message.error('添加失败，请稍后尝试', 1);
    }
  };

  handleChange = async (info) => {
    const fileUrl = info.file?.response?.data?.url;
    if (fileUrl) {
      let fileList = [...this.state.fileList];
      let file = {
        uid: info.file.uid,
        name: info.file.name,
        url: fileUrl,
      };
      fileList.push(file);
      this.setState({ fileList });
      message.success('上传成功', 1);
    }
  };

  removeFile = (info) => {
    const { uid, url } = info;
    const _this = this;
    confirm({
      title: '您确定要删除吗？',
      icon: <ExclamationCircleOutlined />,
      okText: '确定',
      cancelText: '取消',
      onOk() {
        const deleteFile = async () => {
          const cdnResponse = await post(
            `http://localhost:3001/uploadToGuochuangyun?s=App.CDN.Delete&app_key=5687BCD24AA4D3C1ED073F5C8AC17C6B&url=${url}`,
            {},
            true
          );
          if (cdnResponse.ret === 200) {
            //cdn删除成功，删除数据库
            const fileList = _this.state.fileList.filter((item) => {
              return item.uid !== uid;
            });
            _this.setState({ fileList });
            message.success('删除成功', 1);
          } else {
            message.error('删除失败，请稍后尝试', 1);
          }
        };
        deleteFile();
      },
    });
  };

  render() {
    const { teacherIds } = this.props;
    console.log('teacherIds: ', teacherIds);
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

          <Form.Item
            label="时间"
            name="time"
            rules={[{ required: true, message: '请选择时间' }]}
          >
            <RangePicker></RangePicker>
          </Form.Item>

          <Form.Item
            label="最小人数限制"
            name="min"
            rules={[{ required: true, message: '请输入人数' }]}
          >
            <InputNumber min={1}></InputNumber>
          </Form.Item>

          <Form.Item
            label="最大人数限制"
            name="max"
            rules={[{ required: true, message: '请输入人数' }]}
          >
            <InputNumber min={1}></InputNumber>
          </Form.Item>

          <Form.Item
            label="评分教师"
            name="scoreTeacher"
            validateFirst={true}
            rules={[
              { required: true, message: '请填写评分教师职工号' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  const result = teacherIds.find((id) => {
                    return value === id;
                  });
                  if (result) {
                    return Promise.resolve();
                  } else {
                    return Promise.reject('该教师号不存在');
                  }
                },
              }),
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="标签"
            name="tags"
            rules={[{ required: true, message: '请输入标签' }]}
          >
            <Input placeholder="以空格分隔" />
          </Form.Item>

          <Form.Item
            label="简介"
            name="desc"
            rules={[{ required: true, message: '请输入竞赛简介' }]}
          >
            <Input.TextArea />
          </Form.Item>

          <Form.Item
            label="内容"
            name="content"
            rules={[{ required: true, message: '请输入内容介绍' }]}
          >
            <Editor
              contentWidth="1000px"
              contentHeight="400px"
              isEdit={false}
            ></Editor>
          </Form.Item>

          <Form.Item {...tailLayout}>
            <Button type="primary" htmlType="submit">
              提交
            </Button>
          </Form.Item>
        </Form>
        <div style={{ position: 'relative', left: '235px' }}>
          <Upload
            showUploadList={true}
            method="post"
            action="http://localhost:3001/uploadToGuochuangyun?s=App.CDN.UploadOffice&app_key=5687BCD24AA4D3C1ED073F5C8AC17C6B&sign=wtOVTtR1veX4VVwgSkYMf0Ur9YVHsifAhGl55hbXMrQbwGKWkPmBAEHoo5ydejQncZWI5b"
            onChange={this.handleChange}
            fileList={this.state.fileList}
            onRemove={this.removeFile}
          >
            <Button icon={<UploadOutlined />}>附件</Button>
          </Upload>
        </div>
      </div>
    );
  }
}
