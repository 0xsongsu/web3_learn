const ethers = require('ethers');
const fs = require('fs');
const path = require('path');

// 配置参数
const CONTRACT_ADDRESS = '0xa18f6FCB2Fd4884436d10610E69DB7BFa1bFe8C7';
const RPC_URL = 'https://rpc.testnet.humanity.org';

async function claimReward() {
  try {
    // 1. 读取私钥
    const privateKey = fs.readFileSync(path.join(__dirname, '../pk.txt'), 'utf-8').trim();
    
    // 2. 读取ABI
    const abi = JSON.parse(fs.readFileSync(path.join(__dirname, 'abi.json'), 'utf-8'));
    
    // 3. 连接以太坊网络
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const wallet = new ethers.Wallet(privateKey, provider);
    
    // 4. 创建合约实例
    const contract = new ethers.Contract(CONTRACT_ADDRESS, abi, wallet);
    
    console.log('准备调用claimReward函数...');
    
    // 5. 调用合约函数
    const tx = await contract.claimReward();
    console.log('交易已发送，哈希:', tx.hash);
    
    // 6. 等待交易确认
    const receipt = await tx.wait();
    console.log('交易已确认，区块号:', receipt.blockNumber);
    
    return {
      success: true,
      txHash: tx.hash,
      blockNumber: receipt.blockNumber
    };
    
  } catch (error) {
    console.error('签到失败:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// 执行签到
claimReward().then(result => {
  if (result.success) {
    console.log('签到成功!');
  } else {
    console.error('签到失败:', result.error);
  }
});