Page({
  data: {
    userInfo: {}
  },

  onLoad() {
    this.loadUserInfo();
  },

  onShow() {
    this.loadUserInfo();
  },

  // 加载用户信息
  loadUserInfo() {
    const app = getApp();
    this.setData({
      userInfo: app.globalData.userInfo || {}
    });
  },

  // 退出登录
  handleLogout() {
    wx.showModal({
      title: '确认退出',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          const app = getApp();
          app.clearLoginInfo();
          wx.showToast({
            title: '已退出登录',
            icon: 'success'
          });
          setTimeout(() => {
            wx.redirectTo({
              url: '/pages/login/login'
            });
          }, 1500);
        }
      }
    });
  },

  // 关于我们
  handleAbout() {
    wx.showModal({
      title: '关于我们',
      content: '疫苗预约小程序 v1.0.0\n便捷预约，守护健康',
      showCancel: false
    });
  },

  // 联系客服
  handleContact() {
    wx.makePhoneCall({
      phoneNumber: '12345678900',
      success: () => {
        console.log('拨打电话成功');
      },
      fail: (err) => {
        console.error('拨打电话失败', err);
        wx.showToast({
          title: '拨打失败',
          icon: 'none'
        });
      }
    });
  },

  // 检查更新
  handleCheckUpdate() {
    wx.showLoading({
      title: '检查中...'
    });

    setTimeout(() => {
      wx.hideLoading();
      wx.showToast({
        title: '已是最新版本',
        icon: 'none'
      });
    }, 1500);
  }
});