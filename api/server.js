const express = require('express');
const { ethers,JsonRpcProvider,parseEther } = require('ethers');

const provider = new JsonRpcProvider("https://sepolia.infura.io/v3/d1ca998e042a43219dbc26662e0546c0");

const app = express();
const port = 3000;
app.use(express.json());

const privateKey = "0x37b0abb593520621efb356e310e682ba34082b3d4bbb8ea35fc463c38120f2fd";
const ownerAddress = "0x6d77FA0c0cc1181ba128a25e25594f004e03a141";
//const privateKey = "ca16d286f7b5e1cb122f59d71159c9f4706723034b4f0720ff50b424b8bd29e4";
//const ownerAddress = "0x99eb822522a7735C0707E7E38Eac119e1a215e1a";

//const random = "0xc00151015dDE3673ffB02e6bEd01D2cFA9fDC5E0";
//const randomPrivate = "0x9b4d913001c7cc7169144ae5411acde4ffae6ec0c776d21698cd6b2df43623bb";

app.get('/connect-to-ethereum-node', async (req, res) => {
  try {
    const network = await provider.getNetwork();
    res.json({ network });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
  
app.post('/getBalance', async (req, res) => {
    try {
        const balance = await provider.getBalance(ownerAddress);
        res.status(200).json({ success: true, message: `Balance is ${balance.toString()}` });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ success: false, message: 'Error getting balance.' });
    }
});

app.post('/generate-ethereum-account', (req, res) => {
    try {
      const wallet = ethers.Wallet.createRandom();
      res.json({
        address: wallet.address,
        privateKey: wallet.privateKey,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/estimate-gas', async (req, res) => {
    try {
      const { recipientAddress, amountInEther } = req.body;
      const gasLimit = await provider.estimateGas({
        to: recipientAddress,
        value: parseEther(amountInEther.toString()),
      });
      res.json({ gasLimit: gasLimit.toString() });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

//sender-address:-0x6d77FA0c0cc1181ba128a25e25594f004e03a141
//receiver-address:-0x99eb822522a7735C0707E7E38Eac119e1a215e1a

  app.post('/send-ethereum-transaction', async (req, res) => {
    try {
      const {recipientAddress, amountInEther} = req.body;
      const wallet = new ethers.Wallet(privateKey, provider);
  
      const tx = await wallet.sendTransaction({
        from: ownerAddress,
        to: recipientAddress,
        value: parseEther(amountInEther.toString()),
      });
  
      await tx.wait();
      res.json({ transactionHash: tx.hash });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
