const fs = require('fs');
const axios = require('axios');
const { HttpsProxyAgent } = require('https-proxy-agent');

// 配置参数
const config = {
  nocaptchaApiKey: ' ', // 替换为您的实际API Key
  websiteUrl: 'https://faucet-assam.tea.xyz/',
  websiteKey: '7ae64cc4-ef02-4e46-939c-757456082314',
  startSessionUrl: 'https://faucet-assam.tea.xyz/api/startSession?cliver=2.4.1',
  claimRewardUrl: 'https://faucet-assam.tea.xyz/api/claimReward',
  proxy: process.env.HTTP_PROXY || ' ', // 请替换为您的代理地址
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'Origin': 'https://faucet-assam.tea.xyz',
    'Referer': 'https://faucet-assam.tea.xyz/',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
  }
};

// 创建带代理的axios实例
const axiosInstance = axios.create({
  httpsAgent: new HttpsProxyAgent(config.proxy),
  headers: config.headers
});

// 从address.txt读取钱包地址
function getWalletAddress() {
  try {
    return fs.readFileSync('./address.txt', 'utf8').trim();
  } catch (error) {
    throw new Error(`读取钱包地址失败: ${error.message}`);
  }
}

// 使用nocaptcha获取验证码token
async function getCaptchaToken() {
  const maxRetries = 3;
  let retryCount = 0;
  
  while (retryCount < maxRetries) {
    try {
      console.log(`尝试获取验证码token (第${retryCount + 1}次)...`);
      
      const response = await axiosInstance.post('http://api.nocaptcha.io/api/wanda/hcaptcha/universal', {
        sitekey: config.websiteKey,
        referer: config.websiteUrl,
        user_agent: config.headers['User-Agent']
      }, {
        headers: {
          'User-Token': config.nocaptchaApiKey
        }
      });
      
      if (response.data.status !== 1) {
        throw new Error(response.data.msg || '验证码识别失败');
      }
      
      return response.data.data.generated_pass_UUID;
      
    } catch (error) {
      retryCount++;
      if (retryCount < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, 5000));
      } else {
        throw new Error(`验证码识别失败: ${error.message}`);
      }
    }
  }
}

// 开始会话
async function startSession(captchaToken, walletAddress) {
  const response = await axiosInstance.post(config.startSessionUrl, {
    addr: walletAddress,
    captchaToken: captchaToken
  });
  
  if (response.status !== 200) {
    throw new Error(`开始会话失败: ${response.statusText}`);
  }
  
  return response.data.session;
}

// 领取奖励
async function claimReward(session, captchaToken) {
  const response = await axiosInstance.post(config.claimRewardUrl, {
    session: session,
    captchaToken: captchaToken
  });
  
  if (response.status !== 200) {
    throw new Error(`领取奖励失败: ${response.statusText}`);
  }
  
  return response.data;
}

// 主流程
async function main() {
  try {
    const walletAddress = getWalletAddress();
    
    console.log('1. 获取第一次验证码token...');
    const firstToken = await getCaptchaToken();
    
    console.log('2. 开始请求获取session...');
    const session = await startSession(firstToken, walletAddress);
    
    console.log('3. 获取第二次验证码token...');
    const secondToken = await getCaptchaToken();
    
    console.log('4. 领取奖励...');
    const result = await claimReward(session, secondToken);
    
    console.log('领取成功!，状态:', result.status, '领取金额:', result.balance, '等待排队发送...');
  } catch (error) {
    console.error('流程出错:', error.message);
  }
}

// 执行主流程
main();