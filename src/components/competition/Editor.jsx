import React, { Component } from 'react';
import { Button, message, Upload } from 'antd';
import { get, post } from '../../commons/http';
import BraftEditor from 'braft-editor';
import { ContentUtils } from 'braft-utils';
import { ImageUtils } from 'braft-finder';
import { PictureOutlined } from '@ant-design/icons';
// import { Button, Card, Upload } from 'antd';

export default class Editor extends Component {
  state = {
    editorState: BraftEditor.createEditorState(null),
  };

  componentDidMount() {
    if (this.props.isEdit) {
      this.fetchData();
    }
  }

  fetchData = async () => {
    const { id } = this.props;
    const response = await post('/competition/find', {
      competitionId: id,
    });
    this.setState({
      editorState: BraftEditor.createEditorState(
        response.data.competition.content
      ),
    });
    // this.form.setFieldsValue(response.data.competition);
  };

  handleChange = (editorState) => {
    if (!this.props.isEdit) {
      this.props.onChange(editorState.toHTML());
    }
    this.setState({ editorState });
  };

  uploadHandler = (param) => {
    // console.log();
    if (!param.file) {
      return false;
    }
    // console.log(param.file);
    this.setState({
      editorState: ContentUtils.insertMedias(this.state.editorState, [
        {
          type: 'IMAGE',
          url: URL.createObjectURL(param.file),
        },
      ]),
    });
  };

  submit = async () => {
    const content = this.state.editorState.toHTML();
    this.props.submitCallBack(content);
  };

  // 预览
  preview = () => {
    if (window.previewWindow) {
      window.previewWindow.close();
    }

    window.previewWindow = window.open();
    window.previewWindow.document.write(this.buildPreviewHtml());
    window.previewWindow.document.close();
  };

  uploadImage = (obj) => {
    const picUrl = obj.file?.response?.data?.url;
    if (picUrl) {
      this.setState({
        editorState: ContentUtils.insertMedias(this.state.editorState, [
          {
            type: 'IMAGE',
            url: picUrl,
          },
        ]),
      });
      message.success('上传成功', 1);
    }
  };

  buildPreviewHtml() {
    return `
          <!Doctype html>
          <html>
            <head>
              <title>预览</title>
              <style>
                html,body{
                  height: 100%;
                  margin: 0;
                  padding: 0;
                  overflow: auto;
                  background-color: #f1f2f3;
                }
                .container{
                  box-sizing: border-box;
                  width: ${this.props.contentWidth};
                  max-width: 100%;
                  min-height: 100%;
                  margin: 0 auto;
                  padding: 30px 20px;
                  overflow: hidden;
                  background-color: #fff;
                  border-right: solid 1px #eee;
                  border-left: solid 1px #eee;
                }
                .container img,
                .container audio,
                .container video{
                  max-width: 100%;
                  height: auto;
                }
                .container p{
                  white-space: pre-wrap;
                  min-height: 1em;
                }
                .container pre{
                  padding: 15px;
                  background-color: #f1f1f1;
                  border-radius: 5px;
                }
                .container blockquote{
                  margin: 0;
                  padding: 15px;
                  background-color: #f1f1f1;
                  border-left: 3px solid #d1d1d1;
                }
              </style>
            </head>
            <body>
              <div class="container">${this.state.editorState.toHTML()}</div>
            </body>
          </html>
        `;
  }

  render() {
    const controls = [
      'letter-spacing',
      'line-height',
      'clear',
      'headings',
      'list-ol',
      'list-ul',
      'remove-styles',
      'superscript',
      'subscript',
      'hr',
      'text-align',

      'bold',
      'italic',
      'underline',
      'text-color',
      'separator',
    ];
    const extendControls = [
      {
        key: 'custom-button',
        type: 'button',
        text: '预览',
        onClick: this.preview,
      },
      {
        key: 'antd-uploader',
        type: 'component',
        component: (
          <Upload
            accept="image/*"
            showUploadList={true}
            method="post"
            action="http://localhost:3001/uploadToGuochuangyun?s=App.CDN.UploadImg&app_key=5687BCD24AA4D3C1ED073F5C8AC17C6B&sign=wtOVTtR1veX4VVwgSkYMf0Ur9YVHsifAhGl55hbXMrQbwGKWkPmBAEHoo5ydejQncZWI5b"
            onChange={this.uploadImage}
          >
            <Button
              type="button"
              className="control-item button upload-button"
              data-title="插入图片"
            >
              <PictureOutlined />
            </Button>
          </Upload>
        ),
      },
    ];

    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <div className="editor-wrapper" style={{ border: '1px solid #f0f0f0' }}>
          <BraftEditor
            value={this.state.editorState}
            onChange={this.handleChange}
            controls={controls}
            extendControls={extendControls}
            contentStyle={{ height: `${this.props.contentHeight}` }}
          />
        </div>
        {this.props.isEdit ? (
          <Button
            type="primary"
            onClick={this.submit}
            style={{ marginTop: '13px' }}
          >
            提交
          </Button>
        ) : null}
      </div>
    );
  }
}
