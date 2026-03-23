const { http, API } = require("../../utils/request.js");

Page({
  data: {
    reminders: [],
    loading: false,
    hasMore: true,
    page: 1,
    pageSize: 20
  },

  onLoad() {
    this.loadReminders();
  },

  onShow() {
    // 每次显示时刷新数据
    this.loadReminders();
  },

  // 加载提醒列表
  loadReminders() {
    if (this.data.loading) return;
    
    this.setData({ loading: true });
    
    http.get(API.GET_REMINDERS).then(res => {
      const reminders = res.data || [];
      this.setData({
        reminders: reminders,
        loading: false,
        hasMore: reminders.length >= this.data.pageSize
      });
    }).catch(err => {
      console.error("加载提醒列表失败:", err);
      this.setData({ loading: false });
      wx.showToast({
        title: "加载失败",
        icon: "none"
      });
    });
  },

  // 标记为已读
  markAsRead(e) {
    const id = e.currentTarget.dataset.id;
    http.put(API.MARK_AS_READ + id).then(res => {
      wx.showToast({
        title: "已标记为已读",
        icon: "success"
      });
      // 刷新列表
      this.loadReminders();
    }).catch(err => {
      console.error("标记已读失败:", err);
      wx.showToast({
        title: "操作失败",
        icon: "none"
      });
    });
  },

  // 全部标记为已读
  markAllRead() {
    wx.showModal({
      title: "确认操作",
      content: "确定将所有提醒标记为已读吗？",
      success: (res) => {
        if (res.confirm) {
          http.put(API.MARK_ALL_READ).then(res => {
            wx.showToast({
              title: "全部已读",
              icon: "success"
            });
            // 刷新列表
            this.loadReminders();
          }).catch(err => {
            console.error("全部标记已读失败:", err);
            wx.showToast({
              title: "操作失败",
              icon: "none"
            });
          });
        }
      }
    });
  },

  // 删除提醒
  deleteReminder(e) {
    const id = e.currentTarget.dataset.id;
    wx.showModal({
      title: "确认删除",
      content: "确定删除这条提醒吗？",
      success: (res) => {
        if (res.confirm) {
          http.delete(API.DELETE_REMINDER + id).then(res => {
            wx.showToast({
              title: "删除成功",
              icon: "success"
            });
            // 刷新列表
            this.loadReminders();
          }).catch(err => {
            console.error("删除提醒失败:", err);
            wx.showToast({
              title: "删除失败",
              icon: "none"
            });
          });
        }
      }
    });
  },

  // 下拉刷新
  onPullDownRefresh() {
    this.setData({
      page: 1,
      reminders: []
    });
    this.loadReminders();
    setTimeout(() => {
      wx.stopPullDownRefresh();
    }, 1000);
  },

  // 上拉加载更多
  onReachBottom() {
    if (!this.data.hasMore || this.data.loading) return;
    this.setData({
      page: this.data.page + 1
    });
    this.loadReminders();
  }
});