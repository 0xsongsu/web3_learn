const ethers = require('ethers');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

async function batchTransfer() {
  try {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    // 原代码
    // const rpcUrl = await new Promise(resolve => {
    //   rl.question('Enter RPC URL: ', resolve);
    // });
    const rpcUrl = 'https://rpc.testnet.humanity.org';
    
    const amount = await new Promise(resolve => {
      rl.question('请输入要发送的金额 (in ETH): ', answer => {
        resolve(ethers.parseEther(answer));
      });
    });

    rl.close();

    // Read sender private key
    const pk = fs.readFileSync(path.join(__dirname, 'pk.txt'), 'utf-8').trim();
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const wallet = new ethers.Wallet(pk, provider);

    // Read recipients from CSV
    const csvData = fs.readFileSync(path.join(__dirname, 'wallets.csv'), 'utf-8');
    const recipients = csvData.split('\n')
      .slice(1) // Skip header
      .map(line => line.split(',')[1]); // Get address from 2nd column

    // Send transactions
    for (const [i, to] of recipients.entries()) {
      try {
        const tx = await wallet.sendTransaction({
          to,
          value: amount
        });
        
        console.log(`✅ Sent ${ethers.formatEther(amount)} ETH to ${to}`);
        console.log(`   Tx Hash: ${tx.hash}`);
        console.log(`   Progress: ${i+1}/${recipients.length}`);
      } catch (error) {
        console.error(`❌ Failed to send to ${to}:`, error.message);
      }
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

batchTransfer();