const ethers = require('ethers');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

async function generateWallets() {
  try {
    // Create readline interface
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    // Ask for number of wallets to generate
    const count = await new Promise(resolve => {
      rl.question('请输入需要生成的 wallet 数量: ', answer => {
        resolve(parseInt(answer) || 1);
        rl.close();
      });
    });

    // Generate wallets
    const wallets = [];
    for (let i = 0; i < count; i++) {
      const wallet = ethers.Wallet.createRandom();
      wallets.push({
        index: i + 1,
        address: wallet.address,
        privateKey: wallet.privateKey,
        mnemonic: wallet.mnemonic.phrase
      });
    }

    // Prepare CSV content
    const headers = ['Index', 'Address', 'Private Key', 'Mnemonic'];
    const csvRows = wallets.map(w => 
      `${w.index},${w.address},${w.privateKey},${w.mnemonic}`
    );
    const csvContent = [headers.join(','), ...csvRows].join('\n');

    // Save to CSV file
    const outputPath = path.join(__dirname, 'wallets.csv');
    fs.writeFileSync(outputPath, csvContent);
    
    console.log(`✅ Successfully generated ${count} wallet(s)`);
    console.log(`📁 Saved to: ${outputPath}`);
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

generateWallets();