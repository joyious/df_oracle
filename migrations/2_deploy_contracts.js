const Medianizer = artifacts.require("Medianizer");
const PriceFeed = artifacts.require("PriceFeed");
const Authority = artifacts.require("Authority");

module.exports = function (deployer) {
    deployer.deploy(Medianizer);
    deployer.deploy(PriceFeed);
    deployer.deploy(Authority);
};
