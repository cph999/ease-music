class LocalStorageUtil {
    // 设置键值对
    static setItem(key, value) {
      if (typeof value === 'object') {
        value = JSON.stringify(value); // 将对象转换为字符串存储
      }
      localStorage.setItem(key, value);
    }
  
    // 获取值
    static getItem(key) {
      const value = localStorage.getItem(key);
      try {
        return JSON.parse(value); // 尝试将字符串转换回对象
      } catch (e) {
        return value; // 如果不是 JSON 字符串，则返回原始值
      }
    }
  
    // 删除键值对
    static removeItem(key) {
      localStorage.removeItem(key);
    }
  
    // 清空所有 localStorage 的内容
    static clear() {
      localStorage.clear();
    }
  
    // 判断某个 key 是否存在
    static hasItem(key) {
      return localStorage.getItem(key) !== null;
    }
  
    // 获取所有键名
    static getAllKeys() {
      return Object.keys(localStorage);
    }
  }
  
  export default LocalStorageUtil;