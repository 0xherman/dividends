const abi = [
	{
		"inputs": [],
		"name": "claimDividend",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "shareholder",
				"type": "address"
			}
		],
		"name": "getUnpaidEarnings",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
];

const tokenAbi = [
	{
		"inputs": [],
		"name": "distributorAddress",
		"outputs": [
			{
				"internalType":"address",
				"name":"",
				"type":"address"
			}
		],
		"stateMutability": "view",
		"type": "function"}
];

const WalletConnector = function (messageBox, connectWalletButton, disconnectWalletButton) {
	this.tokenAddress = new URLSearchParams(window.location.search).get("token")
	this.dividendAddress = new URLSearchParams(window.location.search).get("distributor")
	this.messageBox = messageBox ? messageBox : document.getElementById('message')
	this.connectWalletButton = connectWalletButton ? connectWalletButton : document.getElementById('connect-wallet')
	this.disconnectWalletButton = disconnectWalletButton ? disconnectWalletButton : document.getElementById('disconnect-wallet')
	this.claimDividendsButton = document.getElementById("claim-dividends")
	this.refreshButton = document.getElementById("refresh-data")
	this.tokenAddressInput = document.getElementById("tokenAddress")
	this.account = ""
	this.walletConnected = false
	this.init = function () {
		if (!(this.connectWalletButton && this.connectWalletButton instanceof Element)) {
			throw "connectWalletButton must be a DOM Element"
		}
		if (!(this.disconnectWalletButton && this.disconnectWalletButton instanceof Element)) {
			throw "disconnectWalletButton must be a DOM Element"
		}
		this.connectWalletButton.addEventListener('click', () => {
			this.connectWallet()
		})
		this.disconnectWalletButton.addEventListener('click', () => {
			this.disconnectWallet()
		})
		this.claimDividendsButton.addEventListener('click', () => { 
			this.claimDividends()
		})
		this.refreshButton.addEventListener('click', () => {
			this.loadData()
		})
		this.tokenAddressInput.addEventListener('keyup', (e) => {
			if (this.walletConnected && e.target.value.match(/^0x[a-fA-F0-9]{40}$/)) {
				this.tokenAddress = e.target.value;
				this.loadData()
			} 
		})
		this.tokenAddressInput.value = this.tokenAddress;
	},
	this.checkProviderIfLoggedIn = async function () {
		if (this.walletConnected && providerLoggedInWith == 'walletconnect') {
			Web3Provider = await web3Modal.connectTo('walletconnect')
		}
	},
	this.showMessage = function (message) {
		this.messageBox.innerText = message
	},
	this.connectWallet = async function () {
		try {

			Web3Provider = await web3Modal.connect()
			Web3Instance = new Web3(Web3Provider)
			await this.loadData()
		} catch (e) {
			if (e.code == "4001") {
				this.showMessage(e.message)
			} else {
				this.showMessage("Couldn't get the wallet connection")
			}
			console.log("Couldn't get a wallet connection")
			console.log(e)
		}

		this.initProviderEvents();
	},
	this.loadData = async function() {
		this.walletConnected = true
		this.account = await this.fetchAccountData()
		let message = "Wallet: " + this.account
		try {
			if (!this.dividendAddress && !this.tokenAddress) {
				message += "\nEnter a token address";
			}
			else {
				if (!this.dividendAddress) {
					const contract = new Web3Instance.eth.Contract(tokenAbi, this.tokenAddress);
					this.dividendAddress = await contract.methods.distributorAddress().call();
				}
				const pending = await this.fetchPendingDividends(this.account)
				document.getElementById("claim").style.display = "block";
				message += "\nPending Rewards: " + pending
			}
		} 
		catch (ex) {
			message += "\nFailed to load dividend distributor address";
		}
		this.showMessage(message)
	},
	this.disconnectWallet = async function () {
		// Try to close the web3 session 
		try {
			await Web3Provider.close()
		} catch (e) {
			this.showMessage("Disconnected");
			document.getElementById("claim").style.display = "none";
		}

		// Also clear the cacheProvider so it asks for wallet options again, instead of asking the login of previous provider
		try {
			await web3Modal.clearCachedProvider();
		} catch (e) {
			console.log(e)
		}

	},
	this.claimDividends = async function () {
		try {
			console.log(this.account, this.dividendAddress, abi)
			const contract = new Web3Instance.eth.Contract(abi, this.dividendAddress);
			console.log(this.account)
			await contract.methods.claimDividend().send({ from: this.account })
			await this.loadData()
		}
		catch (e) {
			console.log(e)
			alert('Failed to claim!')
		}
	},
	this.fetchAccountData = async function () {
		// Get list of accounts of the connected wallet
		const accounts = await Web3Instance.eth.getAccounts()

		selectedAccount = accounts[0].toLowerCase()
		return selectedAccount
	},
	this.fetchPendingDividends = async function (account) {
		const contract = new Web3Instance.eth.Contract(abi, this.dividendAddress, { from: account });
		const pending = await contract.methods.getUnpaidEarnings(account).call({ from: account });
		return Web3Instance.utils.fromWei(pending);
	}

	this.initProviderEvents = function () {

		// Subscribe to accounts change
		Web3Provider.on("networkChanged", (accounts) => {
			console.log("networkChanged");
			console.log(accounts);
		});

		Web3Provider.on("accountsChanged", (accounts) => {
			console.log("accountsChanged");
			console.log(accounts);
		});

		// Subscribe to chainId change
		Web3Provider.on("chainChanged", (chainId) => {
			console.log("chainChanged");

			console.log(chainId);
		});

		// Subscribe to provider connection
		Web3Provider.on("connect", (info) => {
			console.log("connect");

			console.log(info);
		});

		// Subscribe to provider disconnection
		Web3Provider.on("disconnect", (error) => {
			this.showMessage("Disconnected")
			document.getElementById("claim").style.display = "block";
			console.log("disconnect");
			console.log(error);
		});

	}
}

let walletConnector = new WalletConnector()
walletConnector.init();