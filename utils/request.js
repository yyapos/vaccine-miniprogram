// HTTP 请求工具
const { API } = require("../config/config.js");

/**
 * 统一的 HTTP 请求方法
 * @param {string} url - 请求地址
 * @param {string} method - 请求方法
 * @param {object} data - 请求数据
 * @param {boolean} needAuth - 是否需要认证
 */
function request(url, method = "GET", data = {}, needAuth = true) {
  const app = getApp();
  const header = {
    "Content-Type": "application/json"
  };
  
  // 如果需要认证且已登录，添加token
  if (needAuth && app.globalData.token) {
    header["Authorization"] = "Bearer " + app.globalData.token;
  }
  
  return new Promise((resolve, reject) => {
    wx.request({
      url: url,
      method: method,
      data: data,
      header: header,
      success: (res) => {
        if (res.statusCode === 200) {
          if (res.data.code === 200) {
            resolve(res.data);
          } else {
            // 业务错误
            wx.showToast({
              title: res.data.message || "请求失败",
              icon: "none",
              duration: 2000
            });
            reject(res.data);
          }
        } else if (res.statusCode === 401) {
          // 未授权，跳转到登录页
          wx.showToast({
            title: "请先登录",
            icon: "none",
            duration: 2000
          });
          setTimeout(() => {
            wx.redirectTo({
              url: "/pages/login/login"
            });
          }, 2000);
          reject(res);
        } else {
          // HTTP错误
          wx.showToast({
            title: "网络错误",
            icon: "none",
            duration: 2000
          });
          reject(res);
        }
      },
      fail: (err) => {
        wx.showToast({
          title: "网络连接失败",
          icon: "none",
          duration: 2000
        });
        reject(err);
      }
    });
  });
}

// 封装常用请求方法
const http = {
  get: (url, data = {}, needAuth = true) => request(url, "GET", data, needAuth),
  post: (url, data = {}, needAuth = true) => request(url, "POST", data, needAuth),
  put: (url, data = {}, needAuth = true) => request(url, "PUT", data, needAuth),
  delete: (url, data = {}, needAuth = true) => request(url, "DELETE", data, needAuth)
};

module.exports = {
  http,
  API
};