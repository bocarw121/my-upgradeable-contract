import { ethers, upgrades } from "hardhat";
// Proxy contract address: 0x2592eaD9BEe00DCdFeD2B6b189499E936E0781FB
// Implementation contract address: 0xFc00ba2268a7972385a0c20f5A8F53d3721ED441
async function main() {
  const VendingMachineV1 = await ethers.getContractFactory("VendingMachineV1");

  const proxy = await upgrades.deployProxy(VendingMachineV1, [100]);
  await proxy.waitForDeployment();

  const proxyAddress = await proxy.getAddress();
  const implementationAddress = await upgrades.erc1967.getImplementationAddress(
    proxyAddress
  );

  console.log("Proxy contract address: " + proxyAddress);

  console.log("Implementation contract address: " + implementationAddress);
}

main();
