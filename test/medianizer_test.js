const Medianizer = artifacts.require('Medianizer');
const PriceFeed = artifacts.require('PriceFeed');
const Authority = artifacts.require('Authority');

contract('Medianizer', accounts => {
    it('verifies the value and has after construction', async () => {
        let med = await Medianizer.new();
        let res = await med.peek();

        // js treats tuples as arrays
        assert.equal(res[0], 0);
        assert.equal(res[1], false);
    });

    it('verifies the value after init and set, then a post from feed', async () => {
        let med = await Medianizer.new();
        let feed = await PriceFeed.new();

        await med.set(feed.address);
        await feed.post(123, 1557000000, med.address);

        let res = await med.peek();

        // js treats tuples as arrays
        assert.equal(res[0], 123);
        assert.equal(res[1], true);
    });

    it('verifies the value after init and set, then 3 posts from 3 feeds', async () => {
        let med = await Medianizer.new();
        await med.setMin(3);

        for (i = 0; i < 3; i++) {
            let feed = await PriceFeed.new();
            await med.set(feed.address);
            await feed.post(i, Math.round(Date.now() / 1000) + 10, med.address);
        }

        let res = await med.peek();

        // js treats tuples as arrays
        assert.equal(res[0], 1);
        assert.equal(res[1], true);
    });

    it('verifies setMin to 3 then 2 posts from 3 feeds', async () => {
        let med = await Medianizer.new();
        await med.setMin(3);

        for (i = 0; i < 2; i++) {
            let feed = await PriceFeed.new();
            await med.set(feed.address);
            await feed.post(i, Math.round(Date.now() / 1000) + 10, med.address);
        }

        let res = await med.peek();

        // js treats tuples as arrays
        assert.equal(res[0], 0);
        assert.equal(res[1], false);
    });

    it('verifies setAuth permit', async () => {
        let feed = await PriceFeed.new();
        let auth = await Authority.new();
        await auth.permit(accounts[1], feed.address, web3.eth.abi.encodeFunctionSignature("poke(uint128,uint32)"));

        await feed.setAuthority(auth.address);
        await feed.poke(1, Math.round(Date.now() / 1000) + 10, { from: accounts[1] });

        let res = await feed.peek();

        // js treats tuples as arrays
        assert.equal(res[0], 1);
        assert.equal(res[1], true);
    });

    it('should throw when attempting to post from an account who does not has the authority', async () => {
        let med = await Medianizer.new();
        let feed = await PriceFeed.new();
        let auth = await Authority.new();

        await auth.permit(accounts[1], feed.address, web3.eth.abi.encodeFunctionSignature("post(uint128,uint32,address)"));
        await feed.setAuthority(auth.address);
        await feed.post(1, Math.round(Date.now() / 1000) + 10, med.address, { from: accounts[1] });

        try {
            await feed.post(2, Math.round(Date.now() / 1000) + 10, med.address, { from: accounts[2] });
            assert(false, "didn't throw");
        }
        catch (error) {
            assert(error.message.includes("ds-auth-unauthorized"));
        }
    });

});
