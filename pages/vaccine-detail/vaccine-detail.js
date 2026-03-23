const { http, API } = require("../../utils/request.js");

Page({
  data: {
    vaccineId: null,
    vaccine: null,
    stockClass: '',
    stockText: ''
  },

  onLoad(options) {
    if (options.id) {
      this.setData({
        vaccineId: parseInt(options.id)
      });
      this.loadVaccineDetail();
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

  // 加载疫苗详情
  loadVaccineDetail() {
    http.get(API.GET_VACCINE_DETAIL + this.data.vaccineId).then(res => {
      const vaccine = res.data;
      this.setData({
        vaccine: vaccine,
        stockClass: this.getStockClass(vaccine.stock),
        stockText: this.getStockText(vaccine.stock)
      });
    }).catch(err => {
      console.error('加载疫苗详情失败:', err);
      wx.showToast({
        title: '加载失败',
        icon: 'none'
      });
    });
  },

  // 返回列表
  goBack() {
    wx.navigateBack();
  },

  // 立即预约
  bookNow() {
    const app = getApp();
    const children = app.globalData.children || [];
    
    if (children.length === 0) {
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

    // 如果只有一个儿童，直接跳转预约页面
    if (children.length === 1) {
      wx.navigateTo({
        url: `/pages/appointment-booking/appointment-booking?childId=${children[0].id}&vaccineId=${this.data.vaccineId}`
      });
      return;
    }

    // 多个儿童，跳转到疫苗列表选择
    wx.navigateTo({
      url: `/pages/vaccine-list/vaccine-list?vaccineId=${this.data.vaccineId}`
    });
  },

  // 获取库存状态样式
  getStockClass(stock) {
    if (stock === 0) return 'stock-empty';
    if (stock < 100) return 'stock-low';
    return 'stock-normal';
  },

  // 获取库存状态文本
  getStockText(stock) {
    if (stock === 0) return '缺货';
    if (stock < 100) return '紧张';
    return '充足';
  }
});