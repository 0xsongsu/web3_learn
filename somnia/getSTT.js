const axios = require('axios');
const { HttpsProxyAgent } = require('https-proxy-agent');
const fs = require('fs');

// 配置代理
const proxy = 'http://user-sub.songsu-type-dc:wp123456@sg.haiwai-ip.com:1464'; // 请替换为你的代理地址
const agent = new HttpsProxyAgent(proxy);

// 读取地址文件
const addresses = fs.readFileSync('address.txt', 'utf8').split('\n').filter(addr => addr.trim());

// 发送请求函数
async function requestFaucet(address) {
  try {

    // 我们自行构建headers
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Origin': 'https://testnet.somnia.network',
      'Referer': 'https://testnet.somnia.network/',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36'
    };
    
    const response = await axios.post(
      'https://testnet.somnia.network/api/faucet', 
      { address },
      { 
        httpsAgent: agent, 
        headers // 添加好上面的headers，也别忘记在这里加上
    }
    );
    
    if (response.status === 200) {
      console.log(`✅ 地址 ${address} 领取成功`);
    }
  } catch (error) {
    if (error.response && error.response.status === 403) {
      console.log(`❌ 地址 ${address} 不符合要求`);
    } else {
      console.log(`⚠️ 地址 ${address} 请求出错:`, error.message);
    }
  }
}

// 批量处理所有地址
async function processAllAddresses() {
  for (const address of addresses) {
    await requestFaucet(address);
    // 添加延迟避免请求过于频繁
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
}

processAllAddresses();