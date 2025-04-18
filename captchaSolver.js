const axios = require('axios');

class CaptchaSolver {
  constructor(clientKey) {
    this.clientKey = clientKey;
    this.apiUrl = 'https://api.yescaptcha.com';
  }

  /**
   * 创建验证码识别任务
   * @param {Object} taskConfig - 任务配置
   * @returns {Promise<String>} - 返回任务ID
   */
  async createTask(taskConfig) {
    try {
      const response = await axios.post(`${this.apiUrl}/createTask`, {
        clientKey: this.clientKey,
        task: taskConfig
      });
      
      if (response.data.errorId !== 0) {
        throw new Error(`创建任务失败: ${response.data.errorDescription}`);
      }
      
      return response.data.taskId;
    } catch (error) {
      console.error('创建任务出错:', error);
      throw error;
    }
  }

  /**
   * 获取验证码识别结果
   * @param {String} taskId - 任务ID
   * @param {Number} [interval=2000] - 轮询间隔(毫秒)
   * @param {Number} [timeout=60000] - 超时时间(毫秒)
   * @returns {Promise<Object>} - 返回识别结果
   */
  async getTaskResult(taskId, interval = 2000, timeout = 60000) {
    const startTime = Date.now();
    
    return new Promise((resolve, reject) => {
      const checkResult = async () => {
        try {
          const response = await axios.post(`${this.apiUrl}/getTaskResult`, {
            clientKey: this.clientKey,
            taskId: taskId
          });

          if (response.data.errorId !== 0) {
            throw new Error(`获取结果失败: ${response.data.errorDescription}`);
          }

          if (response.data.status === 'ready') {
            resolve(response.data.solution);
          } else if (Date.now() - startTime > timeout) {
            reject(new Error('获取结果超时'));
          } else {
            setTimeout(checkResult, interval);
          }
        } catch (error) {
          reject(error);
        }
      };

      checkResult();
    });
  }

  /**
   * 查询账户余额
   * @returns {Promise<Number>} - 返回账户余额
   */
  async getBalance() {
    try {
      const response = await axios.post(`${this.apiUrl}/getBalance`, {
        clientKey: this.clientKey
      });
      
      if (response.data.errorId !== 0) {
        throw new Error(`查询余额失败: ${response.data.errorDescription}`);
      }
      
      return response.data.balance;
    } catch (error) {
      console.error('查询余额出错:', error);
      throw error;
    }
  }
}

module.exports = CaptchaSolver;
