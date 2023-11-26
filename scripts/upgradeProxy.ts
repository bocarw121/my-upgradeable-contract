import { ethers, upgrades } from 'hardhat';

// Implementation v1 implementation address: 0xFc00ba2268a7972385a0c20f5A8F53d3721ED441
// Implementation v2 implementation address:  0x855b7d496a57d8b414bf50dfdcaf0ffaede630a0
// Implementation v3 contract address:  0x3d0A0e18b20b09bD4033474781f2c62083148593

const proxyAddress = '0x2592eaD9BEe00DCdFeD2B6b189499E936E0781FB';

async function main() {
  const VendingMachineV3 = await ethers.getContractFactory('VendingMachineV3');
  const upgraded = await upgrades.upgradeProxy(proxyAddress, VendingMachineV3);
  await upgraded.waitForDeployment();

  const implementationAddress = await upgrades.erc1967.getImplementationAddress(
    proxyAddress
  );

  console.log('The current contract owner is: ' + (await upgraded.owner()));

  console.log('Implementation contract address: ' + implementationAddress);
}

main();
