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
import { publicEncrypt } from 'crypto';
import { UploadOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import styles from './style.less';
import moment from 'moment';
const { confirm } = Modal;

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
    fileList: [],
  };

  componentDidMount() {
    this.fetchData();
  }

  fetchData = async () => {
    const dateFormat = 'YYYY/MM/DD';
    const { id } = this.props;
    const response = await post('/competition/find', {
      competitionId: id,
    });
    const temp = { ...response.data.competition };
    let { start_time, end_time } = response.data.competition;
    temp.score_teacher = response.data.competition.score_teacher.staffId;
    temp.time = [
      moment(start_time.replace('-', '/'), dateFormat),
      moment(end_time.replace('-', '/'), dateFormat),
    ];
    this.setState({
      competition: response.data.competition,
      fileList: response.data.competition.fileList || [],
    });
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
    const { fileList } = this.state;
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
      fileList,
    });
    if (response.code === 0) {
      message.success('修改成功', 2);
      setTimeout(() => {
        this.props.updateSuccess();
      }, 1000);
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
        <div style={{ position: 'relative', left: '40px' }}>
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
