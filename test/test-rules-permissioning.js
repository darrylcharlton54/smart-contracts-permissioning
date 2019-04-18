const IngressContract = artifacts.require('Ingress.sol');
const RulesContract = artifacts.require('Rules.sol');
const AdminContract = artifacts.require('Admin.sol');

// Contract keys
const RULES_NAME = "0x72756c6573000000000000000000000000000000000000000000000000000000";
const ADMIN_NAME = "0x61646d696e697374726174696f6e000000000000000000000000000000000000";

// enodeAllowed reponses
const PERMITTED = "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff";
const NOT_PERMITTED = "0x7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff";

const node1High = "0x9bd359fdc3a2ed5df436c3d8914b1532740128929892092b7fcb320c1b62f375";
const node1Low = "0x2e1092b7fcb320c1b62f3759bd359fdc3a2ed5df436c3d8914b1532740128929";
const node1Host = "0x0000000000000000000011119bd359fd";
const node1Port = 30303;

const node2High = "0x892092b7fcb320c1b62f3759bd359fdc3a2ed5df436c3d8914b1532740128929";
const node2Low = "0xcb320c1b62f37892092b7f59bd359fdc3a2ed5df436c3d8914b1532740128929";
const node2Host = "0x0000000000000000000011119bd359fd";
const node2Port = 30304;

const node3High = "0x765092b7fcb320c1b62f3759bd359fdc3a2ed5df436c3d8914b1532740128929";
const node3Low = "0x920982b7fcb320c1b62f3759bd359fdc3a2ed5df436c3d8914b1532740128929";
const node3Host = "0x0000000000000000000011117fc359fd";
const node3Port = 30305;

const newAdmin = "f17f52151EbEF6C7334FAD080c5704D77216b732";

contract("Rules (Permissioning)", (accounts) => {
  let ingressContract;
  let rulesContract;
  let adminContract;

  before(async () => {
    ingressContract = await IngressContract.new();

    adminContract = await AdminContract.new();
    await ingressContract.setContractAddress(ADMIN_NAME, adminContract.address);

    rulesContract = await RulesContract.new(ingressContract.address);
    await ingressContract.setContractAddress(RULES_NAME, rulesContract.address);
  });

  it('should NOT permit node when whitelist is empty', async () => {
    let size = await rulesContract.getSize();
    assert.equal(size, 0, "expected empty whitelist");

    let permitted = await rulesContract.enodeInWhitelist(node1High, node1Low, node1Host, node1Port);
    assert.notOk(permitted, 'expected node NOT permitted');
  });

  it('Should NOT fail when removing enode from empty list', async () => {
    let size = await rulesContract.getSize();
    assert.equal(size, 0, "expected empty whitelist");

    let tx = await rulesContract.removeEnode(node1High, node1Low, node1Host, node1Port);
    assert.ok(tx.receipt.status);
  });

  it('should add multiple nodes to whitelist', async () => {
    await rulesContract.addEnode(node1High, node1Low, node1Host, node1Port);
    await rulesContract.addEnode(node2High, node2Low, node2Host, node2Port);
    await rulesContract.addEnode(node3High, node3Low, node3Host, node3Port);

    permitted = await rulesContract.enodeInWhitelist(node1High, node1Low, node1Host, node1Port);
    assert.ok(permitted, 'expected node 1 added to be in whitelist');

    permitted = await rulesContract.enodeInWhitelist(node2High, node2Low, node2Host, node2Port);
    assert.ok(permitted, 'expected node 2 added to be in whitelist');

    permitted = await rulesContract.enodeInWhitelist(node3High, node3Low, node3Host, node3Port);
    assert.ok(permitted, 'expected node 3 added to be in whitelist');
  });

  it('should allow a connection between nodes added to the whitelist', async () => {
    let permitted = await rulesContract.connectionAllowed(node1High, node1Low, node1Host, node1Port, node2High, node2Low, node2Host, node2Port);
    assert.equal(permitted, PERMITTED, 'expected permitted node1 <---> node2');

    permitted = await rulesContract.connectionAllowed(node1High, node1Low, node1Host, node1Port, node3High, node3Low, node3Host, node3Port);
    assert.equal(permitted, PERMITTED, 'expected permitted node1 <---> node3');

    permitted = await rulesContract.connectionAllowed(node2High, node2Low, node2Host, node2Port, node3High, node3Low, node3Host, node3Port);
    assert.equal(permitted, PERMITTED, 'expected permitted node2 <---> node3');
  });

  it('should NOT allow connection with node removed from whitelist', async () => {
    await rulesContract.removeEnode(node3High, node3Low, node3Host, node3Port);
    let permitted = await rulesContract.enodeInWhitelist(node3High, node3Low, node3Host, node3Port);
    assert.notOk(permitted, 'expected removed node NOT permitted');

    permitted = await rulesContract.connectionAllowed(node3High, node3Low, node3Host, node3Port, node2High, node2Low, node2Host, node2Port);
    assert.equal(permitted, NOT_PERMITTED, 'expected source disallowed since it was removed');

    let result = await rulesContract.getSize();
    assert.equal(result, 2, "expected number of nodes");
  });

  it('should permit a node added back to the whitelist', async () => {
    let permitted = await rulesContract.enodeInWhitelist(node3High, node3Low, node3Host, node3Port);
    assert.notOk(permitted, 'expected removed node NOT permitted');

    await rulesContract.addEnode(node3High, node3Low, node3Host, node3Port);
    permitted = await rulesContract.enodeInWhitelist(node3High, node3Low, node3Host, node3Port);
    assert.ok(permitted, 'expected added node permitted');

    permitted = await rulesContract.connectionAllowed(node3High, node3Low, node3Host, node3Port, node2High, node2Low, node2Host, node2Port);
    assert.equal(permitted, PERMITTED, 'expected connection allowed since node was added back to whitelist');
  });

  it('should not allow non-admin account to add node to whitelist', async () => {
    try {
      await rulesContract.addEnode(node1High, node1Low, node1Host, node1Port, { from: accounts[1] });
      expect.fail(null, null, "Modifier was not enforced")
    } catch(err) {
      expect(err.reason).to.contain('Sender not authorized');
    }
  });

  it('should not allow non-admin account to remove node to whitelist', async () => {
    try {
      await rulesContract.addEnode(node1High, node1Low, node1Host, node1Port, { from: accounts[1] });
      expect.fail(null, null, "Modifier was not enforced")
    } catch(err) {
      expect(err.reason).to.contain('Sender not authorized');
    }
  });

  it('should allow new admin account to remove node from whitelist', async () => {
    await adminContract.addAdmin(accounts[1]);

    await rulesContract.removeEnode(node1High, node1Low, node1Host, node1Port, { from: accounts[1] });

    let permitted = await rulesContract.enodeInWhitelist(node1High, node1Low, node1Host, node1Port);
    assert.notOk(permitted, 'expected added node NOT permitted');
  });

  it('should allow new admin account to add node to whitelist', async () => {
    await adminContract.addAdmin(accounts[2]);

    await rulesContract.addEnode(node1High, node1Low, node1Host, node1Port, { from: accounts[2] });

    let permitted = await rulesContract.enodeInWhitelist(node1High, node1Low, node1Host, node1Port);
    assert.ok(permitted, 'expected added node permitted');
  });
});
