const { http, API } = require("../../utils/request.js");

Page({
  data: {
    title: '',
    content: '',
    tags: [],
    tagInput: '',
    loading: false
  },

  onLoad() {

  },

  onTitleInput(e) {
    this.setData({
      title: e.detail.value
    });
  },

  onContentInput(e) {
    this.setData({
      content: e.detail.value
    });
  },

  onTagInput(e) {
    this.setData({
      tagInput: e.detail.value
    });
  },

  addTag() {
    const tag = this.data.tagInput.trim();
    if (tag && !this.data.tags.includes(tag)) {
      this.setData({
        tags: [...this.data.tags, tag],
        tagInput: ''
      });
    }
  },

  removeTag(e) {
    const index = e.currentTarget.dataset.index;
    const tags = [...this.data.tags];
    tags.splice(index, 1);
    this.setData({
      tags
    });
  },

  onCancel() {
    wx.navigateBack();
  },

  onSubmit() {
    if (!this.data.title.trim()) {
      wx.showToast({
        title: '请输入标题',
        icon: 'none'
      });
      return;
    }

    if (!this.data.content.trim()) {
      wx.showToast({
        title: '请输入内容',
        icon: 'none'
      });
      return;
    }

    this.setData({ loading: true });
    
    // 将tags数组转换为字符串（后端接收的是String类型）
    const tagsString = this.data.tags.join(',');
    
    const postData = {
      title: this.data.title,
      content: this.data.content,
      tags: tagsString
    };
    
    console.log('发送的帖子数据:', postData);
    
    http.post(API.CREATE_POST, postData).then(() => {
      wx.showToast({
        title: '发布成功',
        icon: 'success'
      });
      setTimeout(() => {
        this.setData({ loading: false });
        wx.navigateBack();
      }, 1500);
    }).catch(err => {
      this.setData({ loading: false });
      console.error('发布失败:', err);
      console.error('错误详情:', err.data || err.message);
      console.error('错误码:', err.statusCode);
      
      // 显示具体的错误信息
      let errorMessage = '发布失败';
      if (err.data && err.data.message) {
        errorMessage = err.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      wx.showToast({
        title: errorMessage,
        icon: 'none',
        duration: 3000
      });
    });
  }
});