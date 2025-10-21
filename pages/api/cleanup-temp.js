import fs from 'fs/promises';
import path from 'path';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { contractName } = req.body;

  if (!contractName) {
    return res.status(400).json({ error: 'Missing contractName' });
  }

  try {
    const smartcontractPath = path.join(process.cwd(), 'smartcontract');
    const contractPath = path.join(smartcontractPath, 'contracts', `${contractName}.sol`);
    const scriptPath = path.join(smartcontractPath, 'scripts', `deploy-${contractName}.js`);

    // Delete contract file
    try {
      await fs.unlink(contractPath);
      console.log('Deleted:', contractPath);
    } catch (e) {
      console.log('Contract file already deleted or not found');
    }

    // Delete script file
    try {
      await fs.unlink(scriptPath);
      console.log('Deleted:', scriptPath);
    } catch (e) {
      console.log('Script file already deleted or not found');
    }

    return res.status(200).json({
      success: true,
      message: 'Temp files cleaned up'
    });

  } catch (error) {
    console.error('Cleanup error:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

