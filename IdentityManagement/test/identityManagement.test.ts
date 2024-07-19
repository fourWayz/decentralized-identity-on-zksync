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

    it("Should not allow a user to add an identity that already exists", async function () {
      await expect((identityManagement.connect(user1) as Contract).addIdentity("Alice", "alice@example.com")).to.be.revertedWith(
        "Identity already exists",
      );
    });

    it("Should not allow a user to update an identity that does not exist", async function () {
      await expect((identityManagement.connect(user2) as Contract).updateIdentity("Alice", "alice@example.com")).to.be.revertedWith(
        "Identity does not exist",
      );
    });

    it("Should not allow a user to delete an identity that does not exist", async function () {
      await expect((identityManagement.connect(user2) as Contract).deleteIdentity()).to.be.revertedWith("Identity does not exist");
    });

    it("Should not allow a user to verify an identity that does not exist", async function () {
      await expect((identityManagement.connect(user2) as Contract).verifyIdentity()).to.be.revertedWith("Identity does not exist");
    });

    it("Should not allow a user to revoke an identity that does not exist", async function () {
      await expect((identityManagement.connect(user2) as Contract).revokeIdentity()).to.be.revertedWith("Identity does not exist");
    });

    it("Should allow a user to delete their own identity", async function () {
      await (identityManagement.connect(user1) as Contract).deleteIdentity();
      await expect((identityManagement.connect(user1) as Contract).getIdentity(user1.address)).to.be.revertedWith(
        "Identity does not exist",
      );
    });
  });
});