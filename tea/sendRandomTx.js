const fs = require('fs');
const ethers = require('ethers');

// 配置
const config = {
  rpcUrl: 'https://tea-sepolia.g.alchemy.com/public',
  minAmount: 0.01, // 最小发送金额(ETH)
  maxAmount: 0.1,  // 最大发送金额(ETH)
  minTxCount: 1,   // 最小交易次数
  maxTxCount: 2,  // 最大交易次数
  delayMin: 1000,  // 最小延迟(毫秒)
  delayMax: 5000   // 最大延迟(毫秒)
};

// 从pk.txt读取私钥
function getPrivateKeys() {
  try {
    const content = fs.readFileSync('./pk.txt', 'utf8');
    return content.split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0 && ethers.isHexString(line));
  } catch (error) {
    throw new Error(`读取私钥失败: ${error.message}`);
  }
}

// 生成随机EVM地址
function generateRandomAddress() {
  return ethers.Wallet.createRandom().address;
}

// 获取随机金额
function getRandomAmount() {
  return (Math.random() * (config.maxAmount - config.minAmount) + config.minAmount).toFixed(4);
}

// 获取随机交易次数
function getRandomTxCount() {
  return Math.floor(Math.random() * (config.maxTxCount - config.minTxCount + 1)) + config.minTxCount;
}

// 获取随机延迟
function getRandomDelay() {
  return Math.floor(Math.random() * (config.delayMax - config.delayMin + 1)) + config.delayMin;
}

// 发送交易
async function sendTransaction(wallet, toAddress, amount) {
  const tx = {
    to: toAddress,
    value: ethers.parseEther(amount),
    gasLimit: 21000
  };
  
  const txResponse = await wallet.sendTransaction(tx);
  return txResponse;
}

// 处理单个私钥的交易
async function processPrivateKey(privateKey) {
  const provider = new ethers.JsonRpcProvider(config.rpcUrl);
  const wallet = new ethers.Wallet(privateKey, provider);
  
  console.log(`\n=== 开始处理钱包 ${wallet.address} ===`);
  
  try {
    // 获取余额
    const balance = await provider.getBalance(wallet.address);
    console.log(`当前余额: ${ethers.formatEther(balance)} ETH`);
    
    // 确定交易次数
    const txCount = getRandomTxCount();
    console.log(`计划发送 ${txCount} 笔交易`);
    
    // 执行交易
    for (let i = 1; i <= txCount; i++) {
      const amount = getRandomAmount();
      const toAddress = generateRandomAddress();
      
      console.log(`\n交易 ${i}/${txCount}:`);
      console.log(`发送 ${amount} ETH 到 ${toAddress}`);
      
      try {
        const tx = await sendTransaction(wallet, toAddress, amount);
        console.log(`交易成功! Hash: ${tx.hash}`);
        
        // 随机延迟
        const delay = getRandomDelay();
        console.log(`等待 ${delay}ms 后继续...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        
      } catch (error) {
        console.error(`交易失败: ${error.message}`);
      }
    }
    
    console.log(`\n=== 钱包 ${wallet.address} 处理完成 ===`);
    
  } catch (error) {
    console.error(`处理钱包 ${wallet.address} 出错: ${error.message}`);
  }
}

// 主流程
async function main() {
  try {
    // 1. 获取所有私钥
    const privateKeys = getPrivateKeys();
    console.log(`找到 ${privateKeys.length} 个私钥`);
    
    if (privateKeys.length === 0) {
      throw new Error('未找到有效私钥');
    }
    
    // 2. 逐个处理私钥
    for (const pk of privateKeys) {
      await processPrivateKey(pk);
    }
    
    console.log('\n所有私钥处理完成!');
    
  } catch (error) {
    console.error('流程出错:', error.message);
  }
}

// 执行主流程
main();
