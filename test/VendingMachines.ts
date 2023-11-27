import {
  time,
  loadFixture,
} from '@nomicfoundation/hardhat-toolbox/network-helpers';
import { assert, expect } from 'chai';
import { ethers, upgrades } from 'hardhat';

describe('VendingMachines', function () {
  const thousandWEI = ethers.parseUnits('1000', 'wei');
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.

  async function deployVendingMachineInstance() {
    const VendingMachineV1 = await ethers.getContractFactory(
      'VendingMachineV1'
    );

    const instance = await upgrades.deployProxy(VendingMachineV1, [100]);

    const instanceAddr = await instance.getAddress();

    return { instance, instanceAddr };
  }

  async function deployV2UpgradeFixture() {
    const { instanceAddr } = await deployVendingMachineInstance();
    const VendingMachineV2 = await ethers.getContractFactory(
      'VendingMachineV2'
    );
    const v2Upgrade = await upgrades.upgradeProxy(
      instanceAddr,
      VendingMachineV2
    );

    return { v2Upgrade };
  }

  async function deployV3UpgradeFixture() {
    const { instanceAddr } = await deployVendingMachineInstance();
    const VendingMachineV3 = await ethers.getContractFactory(
      'VendingMachineV3'
    );

    const v3Upgrade = await upgrades.upgradeProxy(
      instanceAddr,
      VendingMachineV3
    );

    return { v3Upgrade };
  }

  async function deployV4UpgradeFixture() {
    const { instanceAddr } = await deployVendingMachineInstance();

    const VendingMachineV4 = await ethers.getContractFactory(
      'VendingMachineV4'
    );

    const v4Upgrade = await upgrades.upgradeProxy(
      instanceAddr,
      VendingMachineV4
    );

    return { v4Upgrade };
  }

  // Originally deployed without tests
  describe('VendingMachineV1 (instance)', async function () {
    it('Should pass all VendingMachineV1 instance tests', async function () {
      const { instance } = await loadFixture(deployVendingMachineInstance);
      assert.equal(parseInt((await instance.numSodas()).toString()), 100);

      await instance.purchaseSoda({
        value: thousandWEI,
      });
      await instance.purchaseSoda({
        value: thousandWEI,
      });
      await instance.purchaseSoda({
        value: thousandWEI,
      });
      await instance.purchaseSoda({
        value: thousandWEI,
      });

      assert.equal(parseInt((await instance.numSodas()).toString()), 96);
    });
  });
  // Originally deployed without tests
  describe('VendingMachineV2', async function () {
    it('Should pass all VendingMachineV2 upgrade tests', async function () {
      const { v2Upgrade } = await loadFixture(deployV2UpgradeFixture);
      assert.equal(parseInt((await v2Upgrade.numSodas()).toString()), 100);

      await v2Upgrade.purchaseSodas({
        value: thousandWEI,
      });
      await v2Upgrade.purchaseSodas({
        value: thousandWEI,
      });
      await v2Upgrade.purchaseSodas({
        value: thousandWEI,
      });
      await v2Upgrade.purchaseSodas({
        value: thousandWEI,
      });

      assert.equal(parseInt((await v2Upgrade.numSodas()).toString()), 96);
    });
  });
  // Originally deployed without tests
  describe('VendingMachineV3', async function () {
    it('Should pass all VendingMachineV3 upgrade tests', async function () {
      const { v3Upgrade } = await loadFixture(deployV3UpgradeFixture);
      assert.equal(parseInt((await v3Upgrade.numSodas()).toString()), 100);

      // This was the bug error code 0x11 (Arithmetic operation underflowed or overflowed outside of an unchecked block)
      await expect(v3Upgrade.withdrawProfits()).to.be.revertedWithPanic('0x11');

      await v3Upgrade.purchaseSodas({
        value: thousandWEI,
      });
      await v3Upgrade.purchaseSodas({
        value: thousandWEI,
      });
      await v3Upgrade.purchaseSodas({
        value: thousandWEI,
      });
      await v3Upgrade.purchaseSodas({
        value: thousandWEI,
      });

      assert.equal(parseInt((await v3Upgrade.numSodas()).toString()), 96);

      console.log(await v3Upgrade.lastWithdrawalTime());
    });
  });

  // // deployed with tests
  describe('VendingMachineV4', async function () {
    it('Should have the correct initial sodaValue', async function () {
      const { v4Upgrade } = await loadFixture(deployV4UpgradeFixture);
      assert.equal(parseInt((await v4Upgrade.numSodas()).toString()), 100);
    });

    it('Should revert if no purchase were made', async function () {
      const { v4Upgrade } = await loadFixture(deployV4UpgradeFixture);
      await expect(v4Upgrade.withdrawProfits()).to.be.revertedWith(
        'Profits must be greater than 0 in order to withdraw!'
      );
    });

    it('purchaseSoda should decrease numSodas ', async function () {
      const { v4Upgrade } = await loadFixture(deployV4UpgradeFixture);
      await v4Upgrade.purchaseSodas({
        value: thousandWEI,
      });
      await v4Upgrade.purchaseSodas({
        value: thousandWEI,
      });
      await v4Upgrade.purchaseSodas({
        value: thousandWEI,
      });

      assert.equal(parseInt((await v4Upgrade.numSodas()).toString()), 97);
    });

    it('Should revert if withdrawProfits is called before a week', async function () {
      const { v4Upgrade } = await loadFixture(deployV4UpgradeFixture);

      await v4Upgrade.purchaseSodas({
        value: thousandWEI,
      });
      await v4Upgrade.purchaseSodas({
        value: thousandWEI,
      });

      await v4Upgrade.withdrawProfits();

      // less than a week
      await time.increase(60480);

      await expect(v4Upgrade.withdrawProfits()).to.be.revertedWith(
        'Withdrawal allowed once a week'
      );
    });

    it('Should load the machine with more sodas', async function () {
      const { v4Upgrade } = await loadFixture(deployV4UpgradeFixture);
      assert.equal(parseInt((await v4Upgrade.numSodas()).toString()), 100);

      await v4Upgrade.loadMachine(100);

      assert.equal(parseInt((await v4Upgrade.numSodas()).toString()), 200);
    });

    it('Should emit LowSodaCount event when withdrawProfits and purchaseSodas are called when sodaCount is low', async function () {
      const { v4Upgrade } = await loadFixture(deployV4UpgradeFixture);
      assert.equal(parseInt((await v4Upgrade.numSodas()).toString()), 100);

      let purchase = 0;

      while (purchase < 91) {
        await v4Upgrade.purchaseSodas({
          value: thousandWEI,
        });
        purchase++;
      }

      const sodaCount = parseInt((await v4Upgrade.numSodas()).toString());

      assert.equal(sodaCount, 9);
      const owner = await v4Upgrade.owner();

      await expect(await v4Upgrade.withdrawProfits())
        .to.emit(v4Upgrade, 'LowSodaCount')
        .withArgs(owner, sodaCount);

      await expect(await v4Upgrade.purchaseSodas({ value: thousandWEI }))
        .to.emit(v4Upgrade, 'LowSodaCount')
        .withArgs(owner, sodaCount);
    });
  });
});
