// API 配置文件
const BASE_URL = "http://10.180.229.200:9000/api"; // 网关地址

// API 接口地址
const API = {
  // 用户相关
  LOGIN: BASE_URL + "/parent/wxlogin",
  GET_USER_INFO: BASE_URL + "/parent/info",
  
  // 儿童相关
  GET_CHILDREN: BASE_URL + "/child/list",
  GET_CHILD_DETAIL: BASE_URL + "/child/",
  ADD_CHILD: BASE_URL + "/child/add",
  UPDATE_CHILD: BASE_URL + "/child/update",
  DELETE_CHILD: BASE_URL + "/child/",
  
  // 疫苗相关
  GET_VACCINE_LIST: BASE_URL + "/vaccine/list",
  GET_VACCINE_DETAIL: BASE_URL + "/vaccine/",
  
  // 预约相关
  GET_CHILD_RECORDS: BASE_URL + "/appointment/child/",
  CREATE_APPOINTMENT: BASE_URL + "/appointment/create",
  CANCEL_APPOINTMENT: BASE_URL + "/appointment/cancel/",
  GET_APPOINTMENT_DETAIL: BASE_URL + "/appointment/",
  
  // 接种计划相关
  GET_VACCINATION_PLANS: BASE_URL + "/vaccination-plan/child/",
  
  // 接种记录相关
  GET_VACCINATION_RECORDS: BASE_URL + "/vaccination-record/child/",

  // 论坛相关
  GET_POSTS: BASE_URL + "/forum/posts",
  GET_POST_DETAIL: BASE_URL + "/forum/posts/",
  CREATE_POST: BASE_URL + "/forum/posts",
  UPDATE_POST: BASE_URL + "/forum/posts/",
  DELETE_POST: BASE_URL + "/forum/posts/",
  GET_COMMENTS: BASE_URL + "/forum/posts/", // 后面会拼接 postId + /comments
  CREATE_COMMENT: BASE_URL + "/forum/comments",
  DELETE_COMMENT: BASE_URL + "/forum/comments/",
  LIKE_TOGGLE: BASE_URL + "/forum/like",
  CHECK_LIKE: BASE_URL + "/forum/like/check",
  GET_ANNOUNCEMENTS: BASE_URL + "/forum/announcements",
  GET_POPUP_ANNOUNCEMENTS: BASE_URL + "/forum/announcements/popup",
  
  // 提醒相关
  GET_REMINDERS: BASE_URL + "/reminder/list",
  GET_UNREAD_COUNT: BASE_URL + "/reminder/unread-count",
  MARK_AS_READ: BASE_URL + "/reminder/read/",
  MARK_ALL_READ: BASE_URL + "/reminder/read-all",
  DELETE_REMINDER: BASE_URL + "/reminder/"
};

module.exports = {
  BASE_URL,
  API
};