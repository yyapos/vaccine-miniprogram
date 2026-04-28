App({
  globalData: {
    userInfo: null,
    token: null,
    children: [],
    apiUrl: "http://localhost:9000/api", // 网关地址
  },
  
  onLaunch() {
    // 检查登录状态
    this.checkLoginStatus();
  },
  
  onShow() {
    // 小程序启动或从后台进入前台显示
  },
  
  onHide() {
    // 小程序从前台进入后台
  },
  
  // 检查登录状态
  checkLoginStatus() {
    const token = wx.getStorageSync("token");
    const userInfo = wx.getStorageSync("userInfo");

    console.log('检查登录状态:', { hasToken: !!token, hasUserInfo: !!userInfo });

    if (token && userInfo) {
      this.globalData.token = token;
      this.globalData.userInfo = userInfo;
      // 加载儿童列表
      this.loadChildren();
    } else {
      // 未登录，跳转到登录页
      console.log('未登录，跳转到登录页');
      wx.redirectTo({
        url: "/pages/login/login"
      });
    }
  },
  
  // 加载儿童列表
  loadChildren() {
    if (!this.globalData.token) return Promise.resolve();

    return new Promise((resolve, reject) => {
      wx.request({
        url: this.globalData.apiUrl + "/child/list",
        method: "GET",
        header: {
          "Authorization": "Bearer " + this.globalData.token
        },
        success: (res) => {
          if (res.data.code === 200) {
            this.globalData.children = res.data.data || [];
            console.log('儿童列表加载成功:', this.globalData.children);
            resolve(this.globalData.children);
          } else {
            console.error('加载儿童列表失败:', res.data.message);
            reject(res.data);
          }
        },
        fail: (err) => {
          console.error("加载儿童列表失败:", err);
          reject(err);
        }
      });
    });
  },
  
  // 保存登录信息
  saveLoginInfo(token, userInfo) {
    this.globalData.token = token;
    this.globalData.userInfo = userInfo;
    wx.setStorageSync("token", token);
    wx.setStorageSync("userInfo", userInfo);
  },
  
  // 清除登录信息
  clearLoginInfo() {
    this.globalData.token = null;
    this.globalData.userInfo = null;
    this.globalData.children = [];
    wx.removeStorageSync("token");
    wx.removeStorageSync("userInfo");
  }
});