const { http, API } = require("../../utils/request.js");

Page({
  data: {
    children: [],
    selectedChildIndex: 0,
    records: [],
    displayRecords: []
  },

  onLoad() {
    this.loadChildren();
  },

  onShow() {
    this.loadChildren();
  },

  loadChildren() {
    const app = getApp();
    const children = app.globalData.children || [];
    if (children.length === 0) {
      this.setData({
        children: [],
        selectedChildIndex: 0,
        records: [],
        displayRecords: []
      });
      return;
    }

    this.setData({
      children: children,
      selectedChildIndex: 0
    });
    this.loadRecords(children[0].id);
  },

  selectChild(e) {
    const index = parseInt(e.detail.value);
    this.setData({
      selectedChildIndex: index
    });
    const child = this.data.children[index];
    this.loadRecords(child.id);
  },

  loadRecords(childId) {
    http.get(API.GET_CHILD_RECORDS + childId).then(res => {
      const records = res.data || [];

      // 显示所有状态的预约记录（不进行过滤）
      const formattedRecords = records.map(item => ({
        ...item,
        statusText: this.getStatusText(item.status),
        statusClass: this.getStatusClass(item.status)
      }));

      // 按创建时间倒序排序（最新的在前面）
      formattedRecords.sort((a, b) => {
        return new Date(b.createTime) - new Date(a.createTime);
      });

      this.setData({
        records: formattedRecords
      });
    }).catch(err => {
      console.error('加载预约记录失败:', err);
      this.setData({
        records: []
      });
    });
  },

  getStatusText(status) {
    const statusMap = {
      0: '待审核',
      1: '已通过',
      2: '已拒绝',
      3: '已完成',
      4: '已取消'
    };
    return statusMap[status] || '未知';
  },

  getStatusClass(status) {
    const classMap = {
      0: 'status-pending',
      1: 'status-approved',
      2: 'status-rejected',
      3: 'status-completed',
      4: 'status-cancelled'
    };
    return classMap[status] || '';
  },

  // 跳转到添加儿童页面
  navigateToChild() {
    wx.navigateTo({
      url: '/pages/child-add/child-add'
    });
  },

  // 跳转到疫苗预约页面
  navigateToAppointment() {
    wx.navigateTo({
      url: '/pages/vaccine-list/vaccine-list'
    });
  }
});