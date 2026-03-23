const { http, API } = require("../../utils/request.js");

Page({
  data: {
    children: [],
    searchKeyword: "",
    filteredChildren: []
  },

  onLoad() {
    this.loadChildren();
  },

  onShow() {
    // 每次显示时刷新数据
    this.loadChildren();
  },

  // 加载儿童列表
  loadChildren() {
    const app = getApp();
    const children = app.globalData.children || [];
    this.setData({
      children: children,
      filteredChildren: children
    });
  },

  // 搜索输入
  onSearchInput(e) {
    const keyword = e.detail.value;
    this.setData({
      searchKeyword: keyword
    });
    
    // 过滤儿童列表
    const filtered = this.data.children.filter(child => 
      child.name.includes(keyword)
    );
    
    this.setData({
      filteredChildren: filtered
    });
  },

  // 添加儿童
  addChild() {
    wx.navigateTo({
      url: "/pages/child-add/child-add"
    });
  },

  // 查看儿童详情
  viewChild(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/child-detail/child-detail?id=${id}`
    });
  },

  // 编辑儿童
  editChild(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/child-edit/child-edit?id=${id}`
    });
  },

  // 删除儿童
  deleteChild(e) {
    const id = e.currentTarget.dataset.id;
    
    wx.showModal({
      title: "确认删除",
      content: "确定要删除这个儿童吗？",
      success: (res) => {
        if (res.confirm) {
          http.delete(API.DELETE_CHILD + id).then(() => {
            wx.showToast({
              title: "删除成功",
              icon: "success"
            });
            // 刷新列表
            this.loadChildren();
          }).catch(err => {
            console.error("删除失败:", err);
          });
        }
      }
    });
  },

  // 阻止事件冒泡
  stopEvent() {
    return false;
  }
});