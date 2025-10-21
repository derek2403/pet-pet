import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs/promises';

const execAsync = promisify(exec);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { petName } = req.body;

  if (!petName) {
    return res.status(400).json({ error: 'Missing petName' });
  }

  // Sanitize pet name for contract name (alphanumeric only)
  const contractName = petName.replace(/[^a-zA-Z0-9]/g, '');
  if (contractName.length === 0) {
    return res.status(400).json({ error: 'Invalid pet name' });
  }

  try {
    console.log('Compiling contract for:', { petName, contractName });

    const smartcontractPath = path.join(process.cwd(), 'smartcontract');
    const templatePath = path.join(smartcontractPath, 'contracts', 'PetTemplate.sol');
    const tempContractPath = path.join(smartcontractPath, 'contracts', `${contractName}.sol`);

    // Read template
    const template = await fs.readFile(templatePath, 'utf8');

    // Replace placeholder with actual pet name
    const modifiedContract = template.replace(/PET_NAME_PLACEHOLDER/g, contractName);

    // Write temporary contract file
    await fs.writeFile(tempContractPath, modifiedContract);
    console.log('Created contract file:', tempContractPath);

    // Compile
    console.log('Compiling contract...');
    await execAsync('npx hardhat build', {
      cwd: smartcontractPath,
      timeout: 60000
    });

    // Read compiled artifacts
    const artifactPath = path.join(
      smartcontractPath,
      'artifacts',
      'contracts',
      `${contractName}.sol`,
      `${contractName}.json`
    );
    
    const artifact = JSON.parse(await fs.readFile(artifactPath, 'utf8'));

    return res.status(200).json({
      success: true,
      contractName: contractName,
      abi: artifact.abi,
      bytecode: artifact.bytecode,
    });

  } catch (error) {
    console.error('Compilation error:', error);
    return res.status(500).json({
      success: false,
      error: error.message,
      details: error.stdout || error.stderr
    });
  }
}

