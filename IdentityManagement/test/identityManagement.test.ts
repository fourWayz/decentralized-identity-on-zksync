import { expect } from 'chai';
import { getWallet, deployContract, LOCAL_RICH_WALLETS } from '../deploy/utils';
import { Contract, EventLog } from 'ethers';
import { Wallet } from 'zksync-ethers';

describe("IdentityManagement", function () {
  // We define a fixture to reuse the same setup in every test.

  let identityManagement: Contract;
  let user1: Wallet;
  let user2: Wallet;
  let deployer : Wallet

  before(async () => {
    deployer = getWallet(LOCAL_RICH_WALLETS[0].privateKey);
    user1 = getWallet(LOCAL_RICH_WALLETS[1].privateKey);
    user2 = getWallet(LOCAL_RICH_WALLETS[2].privateKey);
    identityManagement = await deployContract("IdentityManagement", [], { wallet: deployer , silent: true });
  });

  describe("identityManagement", function () {
    it("Should allow a user to add their own identity", async function () {
      await (identityManagement.connect(user1) as Contract).addIdentity("Alice", "alice@example.com");
      const identity = await (identityManagement.connect(user1) as Contract).getIdentity(user1.address);
      expect(identity.name).to.equal("Alice");
      expect(identity.email).to.equal("alice@example.com");
      expect(identity.isVerified).to.equal(false);
      expect(identity.exists).to.equal(true);
    });

    it("Should allow a user to update their own identity", async function () {
      await (identityManagement.connect(user1) as Contract).updateIdentity("Alice Updated", "aliceupdated@example.com");
      const identity = await (identityManagement.connect(user1) as Contract).getIdentity(user1.address);
      expect(identity.name).to.equal("Alice Updated");
      expect(identity.email).to.equal("aliceupdated@example.com");
    });

    it("Should allow a user to verify their own identity", async function () {
      await (identityManagement.connect(user1) as Contract).verifyIdentity();
      const identity = await (identityManagement.connect(user1) as Contract).getIdentity(user1.address);
      expect(identity.isVerified).to.equal(true);
    });

    it("Should allow a user to revoke their own identity", async function () {
      await (identityManagement.connect(user1) as Contract).revokeIdentity();
      const identity = await (identityManagement.connect(user1) as Contract).getIdentity(user1.address);
      expect(identity.isVerified).to.equal(false);
    });

  });
});