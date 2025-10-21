import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';

const execAsync = promisify(exec);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { petAddress, petName, ownerAddress } = req.body;

  if (!petAddress || !petName || !ownerAddress) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    console.log('Verifying pet contract:', { petAddress, petName, ownerAddress });
    
    const smartcontractPath = path.join(process.cwd(), 'smartcontract');
    
    // Sanitize pet name for contract name
    const contractName = petName.replace(/[^a-zA-Z0-9]/g, '');
    
    const command = `npx hardhat verify --network baseSepolia --contract "contracts/${contractName}.sol:${contractName}" ${petAddress} "${petName}" ${ownerAddress}`;
    
    console.log('Running command:', command);
    console.log('In directory:', smartcontractPath);
    
    const { stdout, stderr } = await execAsync(command, {
      cwd: smartcontractPath,
      timeout: 60000,
      env: { ...process.env, FORCE_COLOR: '0' }
    });
    
    console.log('stdout:', stdout);
    console.log('stderr:', stderr);
    
    const output = stdout + stderr;
    
    if (output.includes('Successfully verified') || 
        output.includes('Already Verified') ||
        output.includes('already been verified')) {
      return res.status(200).json({
        success: true,
        message: 'Contract verified successfully',
        explorerUrl: `https://base-sepolia.blockscout.com/address/${petAddress}#code`,
      });
    }
    
    throw new Error('Verification failed: ' + output);
    
  } catch (error) {
    console.error('Verification error:', error);
    
    const errorOutput = error.stdout || error.stderr || error.message || '';
    
    if (errorOutput.includes('Already Verified') || 
        errorOutput.includes('already been verified')) {
      return res.status(200).json({
        success: true,
        message: 'Contract already verified',
        explorerUrl: `https://base-sepolia.blockscout.com/address/${petAddress}#code`,
      });
    }
    
    return res.status(500).json({
      success: false,
      error: errorOutput,
    });
  }
}

