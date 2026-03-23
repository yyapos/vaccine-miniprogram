const { http, API } = require("../../utils/request.js");

Page({
  data: {
    vaccines: [],
    displayVaccines: [],
    selectedChildId: null,
    selectedChildIndex: 0,
    children: []
  },

  onLoad() {
    this.loadVaccines();
    this.loadChildren();
  },

  onShow() {
    this.loadChildren();
  },

  loadVaccines() {
    http.get(API.GET_VACCINE_LIST).then(res => {
      const vaccines = res.data || [];
      this.setData({
        vaccines: vaccines
      });
    }).catch(err => {
      console.error('加载疫苗列表失败:', err);
      this.setData({
        vaccines: []
      });
    });
  },

  loadChildren() {
    const app = getApp();
    const children = app.globalData.children || [];
    this.setData({
      children: children
    });
    if (children.length > 0) {
      this.setData({
        selectedChildId: children[0].id,
        selectedChildIndex: 0
      });
    }
  },

  selectChild(e) {
    const index = parseInt(e.detail.value);
    this.setData({
      selectedChildIndex: index,
      selectedChildId: this.data.children[index].id
    });
  },

  viewVaccineDetail(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/vaccine-detail/vaccine-detail?id=${id}`
    });
  },

  bookVaccine(e) {
    if (this.data.children.length === 0) {
      wx.showModal({
        title: '提示',
        content: '请先添加儿童信息',
        success: (res) => {
          if (res.confirm) {
            wx.navigateTo({
              url: '/pages/child-add/child-add'
            });
          }
        }
      });
      return;
    }

    if (!this.data.selectedChildId) {
      wx.showToast({
        title: '请选择儿童',
        icon: 'none'
      });
      return;
    }

    const vaccineId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/appointment-booking/appointment-booking?childId=${this.data.selectedChildId}&vaccineId=${vaccineId}`
    });
  },

  getStockClass(stock) {
    if (stock === 0) return 'stock-empty';
    if (stock < 100) return 'stock-low';
    return 'stock-normal';
  },

  getStockText(stock) {
    if (stock === 0) return '缺货';
    if (stock < 100) return '紧张';
    return '充足';
  },

  // 跳转到添加儿童页面
  navigateToChild() {
    wx.navigateTo({
      url: '/pages/child-add/child-add'
    });
  }
});