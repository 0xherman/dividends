//  You have to refer to default since it was bundled for ESModules
// but after that the documentation will be the same
const Web3Modal = window.Web3Modal.default;
const WalletConnectProvider = window.WalletConnectProvider.default;

let Web3Provider;
let Web3Instance;

const providerOptions = {
	walletconnect: {
		package: WalletConnectProvider,
		options: {
			rpc: {
				1: 'https://speedy-nodes-nyc.moralis.io/ec9afe6028435732c70a61dc/eth/mainnet',
				25: 'https://evm-cronos.crypto.org',
				56: 'https://speedy-nodes-nyc.moralis.io/ec9afe6028435732c70a61dc/bsc/mainnet',
				43114: 'https://speedy-nodes-nyc.moralis.io/ec9afe6028435732c70a61dc/avalanche/mainnet'
			},
		}
	},
	'custom-walletlink': {
		display: {
			logo: 'https://play-lh.googleusercontent.com/PjoJoG27miSglVBXoXrxBSLveV6e3EeBPpNY55aiUUBM9Q1RCETKCOqdOkX2ZydqVf0',
			name: 'Coinbase',
			description: 'Connect to Coinbase Wallet (not Coinbase App)',
		},
		options: {
			appName: 'Coinbase', // Your app name
			networkUrl: `https://speedy-nodes-nyc.moralis.io/ec9afe6028435732c70a61dc/avalanche/mainnet`,
			chainId: 43114,
		},
		package: WalletLink,
		connector: async (_, options) => {
			const { appName, networkUrl, chainId } = options
			const walletLink = new WalletLink({
				appName,
			})
			const provider = walletLink.makeWeb3Provider(networkUrl, chainId)
			await provider.enable()
			return provider
		},
	},
	/* See Provider Options Section */
};

const web3Modal = new Web3Modal({
	cacheProvider: false, // optional
	providerOptions // required
});