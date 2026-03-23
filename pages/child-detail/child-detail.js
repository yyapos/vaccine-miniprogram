const { http, API } = require("../../utils/request.js");

Page({
  data: {
    child: {},
    loading: true,
    showActions: false
  },

  onLoad(options) {
    const id = options.id;
    if (id) {
      this.loadChildDetail(id);
    } else {
      wx.showToast({
        title: '参数错误',
        icon: 'none'
      });
      setTimeout(() => {
        wx.navigateBack();
      }, 1500);
    }
  },

  loadChildDetail(id) {
    this.setData({ loading: true });
    http.get(API.GET_CHILD_DETAIL + id).then(res => {
      this.setData({
        child: res.data,
        loading: false
      });
    }).catch(err => {
      this.setData({ loading: false });
      console.error('加载儿童详情失败:', err);
    });
  },

  onEdit() {
    const id = this.data.child.id;
    wx.navigateTo({
      url: `/pages/child-edit/child-edit?id=${id}`
    });
  },

  onDelete() {
    const id = this.data.child.id;
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这个儿童吗？',
      success: (res) => {
        if (res.confirm) {
          http.delete(API.DELETE_CHILD + id).then(() => {
            wx.showToast({
              title: '删除成功',
              icon: 'success'
            });
            const app = getApp();
            app.loadChildren();
            setTimeout(() => {
              wx.navigateBack();
            }, 1500);
          }).catch(err => {
            console.error('删除失败:', err);
          });
        }
      }
    });
  },

  onShareAppMessage() {
    return {
      title: '儿童详情',
      path: `/pages/child-detail/child-detail?id=${this.data.child.id}`
    };
  }
});