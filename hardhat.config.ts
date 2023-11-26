import { HardhatUserConfig } from 'hardhat/config';
import '@nomicfoundation/hardhat-toolbox';
import '@openzeppelin/hardhat-upgrades';
import dotenv from 'dotenv';
dotenv.config();
import { envConfig } from './config';

const config: HardhatUserConfig = {
  solidity: '0.8.20',
  networks: {
    goerli: {
      url: envConfig.GOERLI_RPC_URL,
      accounts: [envConfig.META_MASK_PRIVATE_KEY!],
    },
  },
  etherscan: {
    apiKey: envConfig.ETHERSCAN_API_KEY,
  },
};

export default config;
