import React, { Component } from 'react';
import { connect } from "react-redux";
import './ManageWallet.scss'
import Web3 from "web3";
import detectEthereumProvider from "@metamask/detect-provider";
import { toast } from 'react-toastify'
import { getContractAbi } from '../../services/userService'

class ManageWallet extends Component {
    constructor(props) {
        super(props);
        this.state = {
            account: '',
            balance: '',
            web3Api: {
                provider: null,
                web3: null,
                contract: null
            },
            smartContractAddress: '',
            abi: {},
            withdrawAmount: '',
            contractBalance: '',
            role: ''
        }
    }

    async componentDidMount() {
        let { user } = this.props
        if (user && user.roleId) {
            this.setState({
                role: user.roleId
            })
        }
        let resAbi = await getContractAbi()
        this.checkWalletIsConnected();
        if (resAbi && resAbi.errCode === 0) {
            let { address, abi } = resAbi.data
            this.setState({
                smartContractAddress: address,
                abi: abi
            })
            await this.loadProvider(abi, address);
        }
    }

    async componentDidUpdate(prevProps, preState, snapshot) {
        if (this.state.account !== preState.account) {
            let { web3Api } = this.state;
            web3Api.web3.eth.defaultAccount = this.state.account;
            let web3 = web3Api.web3;
            let { smartContractAddress, abi } = this.state;
            web3Api.contract = new web3.eth.Contract(abi, smartContractAddress);
            this.checkContractBalance()
            this.setState({
                web3Api: web3Api
            })
        }
        if (this.props.role !== prevProps.role) {
            if (this.props.user && this.props.user.roleId) {
                this.setState({
                    role: this.props.user.roleId
                })
            }
        }
    }

    componentWillUnmount() {
        let { web3Api } = this.state;
        if (web3Api && web3Api.web3) {
            web3Api.web3.eth.clearSubscriptions();
        }
        // clear event listeners
    }
    updateAccount = async () => {
        console.log('Debug1')
        let { web3Api } = this.state;
        if (web3Api && web3Api.web3 && web3Api.web3.eth) {
            console.log('Debug2')
            const accounts = await this.state.web3Api.web3.eth.getAccounts();
            console.log("🚀 ~ file: ManageWallet.js:59 ~ ManageWallet ~ updateAccount= ~ accounts", accounts)
            if (accounts && accounts.length > 0) {
                const accountAddress = accounts[0];
                console.log("🚀 ~ file: ManageWallet.js:60 ~ ManageWallet ~ updateAccount= ~ accountAddress", accountAddress)
                let _balance = await this.state.web3Api.web3.eth.getBalance(accountAddress)
                console.log("🚀 ~ file: ManageWallet.js:62 ~ ManageWallet ~ updateAccount= ~ _balance", _balance)
                this.setState({
                    account: accountAddress,
                    balance: _balance,
                });
            } else {
                this.setState({
                    balance: '',
                    account: ''
                })
            }
        }
    };

    loadProvider = async (CONTACT_ABI, CONTACT_ADDRESS) => {
        const provider = await detectEthereumProvider();
        const web3 = new Web3(provider);
        const myContract = new web3.eth.Contract(CONTACT_ABI, CONTACT_ADDRESS);
        this.setState({
            web3Api: {
                web3: new Web3(provider),
                provider: provider,
                contract: myContract
            }
        })
    }

    checkWalletIsConnected = async () => {
        const { ethereum } = window;
        if (!ethereum) {
            console.log('debug123')
            console.log("Make sure you have Metamask installed!");
            toast.error("Make sure you have Metamask installed!");
            return;
        } else {
            console.log('debug123')
            await window.ethereum.enable();
            console.log('debug123')
            window.ethereum.on('accountsChanged', this.updateAccount);
            console.log("Wallet exists! We're ready to go!");
        }

        const accounts = await ethereum.request({ method: 'eth_accounts' });
        if (accounts.length !== 0) {
            console.log("Found an authorized account: ", accounts[0]);
            console.log('debug1')
            let _balance = '';
            if (this.state.web3Api.web3 && this.state.web3Api.web3.eth) {
                _balance = await this.state.web3Api.web3.eth.getBalance(accounts[0])
            }
            console.log('debug2')
            this.setState({
                account: accounts[0],
                balance: _balance
            })
        } else {
            // await window.ethereum.enable();
            console.log("No authorized account found");
            // await this.connectWalletHandler()
        }
    }

    connectWalletHandler = async () => {
        const { ethereum } = window;
        if (!ethereum) {
            alert("Please install Metamask!");
        }
        try {
            const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
            console.log("Found an account! Address: ", accounts[0]);
            let _balance = await this.state.web3Api.web3.eth.getBalance(accounts[0])
            this.setState({
                account: accounts[0],
                balance: _balance
            })
            toast.success('Connect wallet succeed!');
        } catch (error) {
            console.log(error)
        }
    }

    withdraw = async () => {
        const { contract, web3 } = this.state.web3Api;
        const { account, role, withdrawAmount } = this.state;
        if (withdrawAmount) {
            let weiAmount = Web3.utils.toWei(withdrawAmount, 'ether');
            if (role === 'R1') {
                try {
                    await contract.methods.withdraw(weiAmount).send({
                        from: account
                    })
                    await this.checkContractBalance()
                    let _balance = await web3.eth.getBalance(account)
                    toast.success('Withdraw successfully!')
                    this.setState({
                        withdrawAmount: '',
                        balance: _balance
                    })
                } catch (error) {
                    console.log("🚀 ~ file: ManageWallet.js:175 ~ ManageWallet ~ withdraw= ~ error", error)
                    toast.error('Something went wrong!')
                }
            } else if (role === 'R2') {
                try {
                    await contract.methods.withdrawForDoctor(weiAmount).send({
                        from: account
                    })
                    await this.checkContractBalance()
                    let _balance = await web3.eth.getBalance(account)
                    toast.success('Withdraw successfully!')
                    this.setState({
                        withdrawAmount: '',
                        balance: _balance
                    })
                } catch (error) {
                    console.log("🚀 ~ file: ManageWallet.js:175 ~ ManageWallet ~ withdrawForDoctor= ~ error", error)
                    toast.error('Something went wrong!')
                }
            } else {
                toast.error("Permission denied!");
            }
        } else {
            toast.error('Please input ETH value!')
        }

    }

    checkContractBalance = async () => {
        const { contract, web3 } = this.state.web3Api;
        const { account, role } = this.state;
        if (role === 'R1') {
            try {
                let temp = await contract.methods.checkCurrentAddressDebug().call()
                let balance = await contract.methods.getBalanceByAdminAccount().call()
                let ethBalance = web3.utils.fromWei(balance, "ether");
                this.setState({
                    contractBalance: ethBalance
                })
            } catch (error) {
                if (error.message.includes('Your account can not request this feature')) {
                    toast.error("Your account is not allowed to withdraw!");
                } else {
                    toast.error("Something went wrong!");
                }
            }
        } else if (role === 'R2') {
            try {
                let balance = await contract.methods.getBalanceByDoctorAccount().call()
                let ethBalance = web3.utils.fromWei(balance, "ether");
                this.setState({
                    contractBalance: ethBalance
                })
            } catch (error) {
                if (error.message.includes('Your account can not request this feature')) {
                    toast.error("Your account is not allowed to withdraw!");
                } else {
                    toast.error("Something went wrong!");
                }
            }
        } else {
            toast.error("Permission denied!");
        }
    }

    handleAmountChange = (e) => {
        this.setState({
            withdrawAmount: e.target.value
        })
    }


    render() {
        let { web3 } = this.state.web3Api
        let { balance, account, withdrawAmount, contractBalance } = this.state;
        if (web3) {
            balance = web3.utils.fromWei(balance, "ether");
            // contractBalance = web3.utils.fromWei(balance, "ether");
        }
        return (
            <div className='container'>
                <div className='payment-title'>
                    <h1>Manage your wallet</h1>
                </div>
                <div className="faucet-wrapper">
                    <div className="faucet">
                        <div className="wallet-balance-view is-size-3">
                            <strong className='balance-title'>Wallet balance: </strong><strong>{balance}</strong> ETH
                        </div>
                        <div className="contract-balance-view is-size-3">
                            <strong className='balance-title'>Contract balance: </strong><strong>{contractBalance}</strong> ETH
                        </div>
                        <span className='detail-account'>
                            <p>
                                <strong>Accounts Address: </strong>
                                {
                                    account ? account : "Accounts Denied"
                                }
                            </p>
                        </span>
                        <div className="input-wrapper input-group">
                            <input
                                type="number"
                                min="0"
                                placeholder="Enter the amount in ETH"
                                onChange={(event) => this.handleAmountChange(event)}
                                value={withdrawAmount}
                                className="form-control amount-input"
                            />
                            <div className="input-group-append">
                                <span className="input-group-text">ETH</span>
                            </div>
                        </div>
                        <div className='button-container'>
                            <button className="button is-danger mr-5 payment-button" onClick={() => this.withdraw()}>Withdraw</button>
                            <button className="button is-link connect-button"
                                onClick={() =>
                                    this.connectWalletHandler()}
                            >
                                Connect Wallets
                            </button>
                        </div>
                    </div>
                    {/* <button onClick={() => this.test()}>Test</button> */}
                </div>
            </div>
        );
    }
}

const mapStateToProps = state => {
    return {
        language: state.app.language,
        user: state.user.userInfo
    };
};

const mapDispatchToProps = dispatch => {
    return {
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(ManageWallet);
