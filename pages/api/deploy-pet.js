import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs/promises';

const execAsync = promisify(exec);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { petName, ownerAddress } = req.body;

  if (!petName || !ownerAddress) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // Sanitize pet name for contract name (alphanumeric only)
  const contractName = petName.replace(/[^a-zA-Z0-9]/g, '');
  if (contractName.length === 0) {
    return res.status(400).json({ error: 'Invalid pet name' });
  }

  try {
    console.log('Deploying pet:', { petName, contractName, ownerAddress });

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

    // Deploy using script (ES module syntax)
    const deployScript = `import { network } from "hardhat";

const { ethers } = await network.connect();

async function main() {
  const Contract = await ethers.getContractFactory("${contractName}");
  const contract = await Contract.deploy("${petName}", "${ownerAddress}");
  await contract.waitForDeployment();
  const address = await contract.getAddress();
  console.log("DEPLOYED_ADDRESS:" + address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
`;

    const scriptPath = path.join(smartcontractPath, 'scripts', `deploy-${contractName}.js`);
    await fs.writeFile(scriptPath, deployScript);

    // Execute deployment
    console.log('Deploying contract...');
    const { stdout } = await execAsync(
      `npx hardhat run scripts/deploy-${contractName}.js --network baseSepolia`,
      {
        cwd: smartcontractPath,
        timeout: 120000
      }
    );

    // Extract deployed address
    const match = stdout.match(/DEPLOYED_ADDRESS:(0x[a-fA-F0-9]{40})/);
    if (!match) {
      throw new Error('Failed to extract deployed address');
    }

    const deployedAddress = match[1];
    console.log('Deployed at:', deployedAddress);

    // Keep contract file for verification, only delete script
    try {
      await fs.unlink(scriptPath);
      console.log('Cleaned up deployment script');
    } catch (e) {
      console.log('Cleanup warning:', e.message);
    }

    return res.status(200).json({
      success: true,
      address: deployedAddress,
      contractName: contractName,
      petName: petName
    });

  } catch (error) {
    console.error('Deployment error:', error);
    return res.status(500).json({
      success: false,
      error: error.message,
      details: error.stdout || error.stderr
    });
  }
}

