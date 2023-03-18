import React, { Component } from 'react';
import { connect } from "react-redux";
import './Payment.scss'
import Web3 from "web3";
import detectEthereumProvider from "@metamask/detect-provider";
// import { CONTACT_ADDRESS, CONTACT_ABI } from './load-contract'
import { toast } from 'react-toastify'
import { getDetailBillByToken, getContractAbi, transfer, initBill, verifyPayment } from '../../services/userService'

class Payment extends Component {
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
            // shouldReload: false,
            billId: '',
            amount: '',
            weiAmount: '',
            // transactionSuccess: false,
            smartContractAddress: '',
            abi: {},
            initOrPayment: 'init'
            // addressContact: ''
        }
    }

    async componentDidMount() {
        let token = this.props.token;
        let res = await getDetailBillByToken({ token: token })
        if (res && res.errCode === 0) {
            if (res.data.isInitPayment === false) {
                let { amount, weiAmount } = res.data
                this.setState({
                    initOrPayment: 'init',
                    amount: amount,
                    weiAmount: weiAmount
                })
            } else {
                let { amount, billId, weiAmount } = res.data
                this.setState({
                    billId: billId,
                    amount: amount,
                    weiAmount: weiAmount,
                    initOrPayment: 'payment'
                })
            }
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
            this.setState({
                web3Api: web3Api
            })
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
        const accounts = await this.state.web3Api.web3.eth.getAccounts();
        console.log("🚀 ~ file: Payment.js:59 ~ Payment ~ updateAccount= ~ accounts", accounts)
        if (accounts && accounts.length > 0) {
            const accountAddress = accounts[0];
            console.log("🚀 ~ file: Payment.js:60 ~ Payment ~ updateAccount= ~ accountAddress", accountAddress)
            let _balance = await this.state.web3Api.web3.eth.getBalance(accountAddress)
            console.log("🚀 ~ file: Payment.js:62 ~ Payment ~ updateAccount= ~ _balance", _balance)
            this.setState({
                account: accountAddress,
                balance: _balance,
                // web3Api: web3Api
            });
        } else {
            this.setState({
                balance: '',
                account: ''
            })
        }
    };

    loadProvider = async (CONTACT_ABI, CONTACT_ADDRESS) => {
        const provider = await detectEthereumProvider();
        const web3 = new Web3(provider);
        const myContract = new web3.eth.Contract(CONTACT_ABI, CONTACT_ADDRESS);
        // const subscription = web3.eth.subscribe('logs', {
        //     address: CONTACT_ADDRESS,
        //     // topics: [myContract.events.TransactionMade().signature]
        // }, (error, result) => {
        //     if (error) {
        //         console.log(error);
        //     } else {
        //         console.log("🚀 ~ file: Payment.js:75 ~ Payment ~ loadProvider= ~ result", result)
        //         console.log("🚀 ~ file: Payment.js:75 ~ Payment ~ loadProvider= ~ result.from", result.from)
        //         // console.log("🚀 ~ file: Payment.js:76 ~ Payment ~ loadProvider= ~ result.args.value.toString()", result.args.value)
        //     }
        // });

        // var subscription = web3.eth.subscribe('logs', {
        //     address: CONTACT_ADDRESS,
        //     // topics: [web3.utils.keccak256('bill99985')]
        //     // topics: ['0xb89eb2e5bb33da1bf9a8a2057ab9844372b0ecd9']
        // }, function (error, result) {
        //     if (!error)
        //         console.log(result);
        // })
        //     .on("connected", function (subscriptionId) {
        //         console.log(subscriptionId);
        //         // web3.utils.keccak256('bill99985')
        //         // console.log("🚀 ~ file: Payment.js:110 ~ Payment ~ web3.utils.keccak256('bill99985')", web3.utils.keccak256('bill99985'))
        //     })
        //     .on("data", function (log) {
        //         console.log("🚀 ~ file: Payment.js:113 ~ Payment ~ log", log)
        //         let billData = web3.eth.abi.decodeParameters(['string', 'uint256'], log.data);
        //         let billId = billData[0]
        //         let weiAmount = billData[1]
        //         let ethAmount = Web3.utils.fromWei(weiAmount, "ether")
        //         let alertMessage = `You paid bill ${billId} with ${ethAmount} ETH`
        //         // console.log("debug123")
        //         toast.success(alertMessage)
        //     })
        //     .on("changed", function (log) {
        //         console.log("🚀 ~ file: Payment.js:94 ~ Payment ~ .on ~ log", log)
        //     });

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
            toast.error("Make sure you have Metamask installed!");
            return;
        } else {
            await window.ethereum.enable();
            window.ethereum.on('accountsChanged', this.updateAccount);
            console.log("Wallet exists! We're ready to go!");
        }
        const accounts = await ethereum.request({ method: 'eth_accounts' });
        console.log("🚀 ~ file: Payment.js:126 ~ Payment ~ checkWalletIsConnected ~ accounts", accounts)
        if (accounts.length !== 0) {
            console.log("Found an authorized account: ", accounts[0]);
            let _balance = await this.state.web3Api.web3.eth.getBalance(accounts[0])
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
            // console.log("debug")
            const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
            // console.log("🚀 ~ file: Payment.js:173 ~ Payment ~ connectWalletHandler ~ accounts", accounts)
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

    payBill = async () => {
        const { contract, web3 } = this.state.web3Api;
        const { account, weiAmount, billId, initOrPayment } = this.state;
        if (initOrPayment && initOrPayment === 'init') {
            if (account && weiAmount) {
                try {
                    await contract.methods.initBill(this.props.token).send({
                        from: account,
                        value: weiAmount
                    })
                    let res = await initBill({ token: this.props.token });
                    if (res && res.errCode === 0) {
                        toast.success("Init bill successfully!");
                        this.setState({
                            initOrPayment: 'payment',
                            billId: res.data.billId,
                            amount: res.data.amount,
                            weiAmount: res.data.weiAmount
                        });
                    } else {
                        toast.error(res.errMessage);
                    }
                } catch (error) {
                    console.log("🚀 ~ file: Payment.js:230 ~ Payment ~ payBill= ~ error", error)
                    try {
                        let statusToken = await contract.methods.checkTokenStatus(this.props.token).call();
                        if (statusToken === true) {
                            toast.warn("This token was used to initialize the bill");
                            this.setState({
                                initOrPayment: 'payment'
                            })
                        } else {
                            toast.error("Something went wrong");
                        }
                    } catch (error) {
                        console.log("🚀 ~ file: Payment.js:242 ~ Payment ~ payBill= ~ error", error)
                        if (error.message.includes("Token value must be not empty")) {
                            toast.error("Token value must be not empty");
                        } else {
                            toast.error("Something went wrong");
                        }
                    }

                }
                let _balance = await web3.eth.getBalance(account)
                this.setState({
                    balance: _balance
                })
            } else {
                toast.error("Missing data for account, weiAmount");
            }
        } else if (initOrPayment && initOrPayment === 'payment') {
            console.log("🚀 ~ file: Payment.js:257 ~ Payment ~ payBill= ~ this.state", this.state)
            if (account && weiAmount && billId) {
                try {
                    await contract.methods.addFunds(this.props.token).send({
                        from: account,
                        value: weiAmount
                    })
                    let res = await verifyPayment({ token: this.props.token })
                    if (res && res.errCode === 0) {
                        toast.success('Payment success!')
                        this.props.changeToSuccessStatus()
                    } else {
                        toast.error(res.errMessage)
                    }
                } catch (error) {
                    toast.error("Something went wrong!")
                }

                // let test = await contract.methods.addFunds(this.props.token).call()
                // console.log("🚀 ~ file: Payment.js:264 ~ Payment ~ payBill= ~ test", test)
                // .catch(function (error) {
                //     alert("Transaction failed. Conditions in the smart contract were not met.")
                // })
                let _balance = await web3.eth.getBalance(account)
                this.setState({
                    balance: _balance
                })
            } else {
                toast.error("Missing data for account, weiAmount");
            }
        }

    }

    test = async () => {
        const { contract, web3 } = this.state.web3Api;
        const { account } = this.state
        // await contract.methods.registerAccountForDoctor('0x025227a93c0E854dED1D5783Ad8934aeA9D11911').send({
        //     from: account
        // })
        let data = await contract.methods.getBalanceByDoctorAccountDebug('0x025227a93c0E854dED1D5783Ad8934aeA9D11911').call()
        console.log("🚀 ~ file: Payment.js:300 ~ Payment ~ test= ~ data", data)
        // await contract.methods.registerAccountForDoctor('0x891B48a8CDF6E7A6402008322eFc17a21E55BF5C').call()
    }
    render() {
        let { web3 } = this.state.web3Api
        let { balance, account, billId, amount, weiAmount, initOrPayment } = this.state;
        let ethAmount;
        if (weiAmount) {
            ethAmount = Web3.utils.fromWei(weiAmount, "ether");
        }
        if (web3) {
            balance = web3.utils.fromWei(balance, "ether");
        }
        return (
            <div className='container'>
                <div className='payment-title'>
                    <h1>{initOrPayment == 'payment'
                        ?
                        'Please pay the bill to complete the booking'
                        :
                        'Please pay to initiate an appointment'
                    }</h1>
                </div>
                <div className="faucet-wrapper">
                    <div className="faucet">
                        <div className="balance-view is-size-3">
                            Your balance: <strong>{balance}</strong> ETH
                        </div>
                        <span className='detail-account'>
                            <p>
                                <strong>Accounts Address: </strong>
                                {
                                    account ? account : "Accounts Denied"
                                }
                            </p>
                        </span>
                        {initOrPayment == 'payment'
                            ?
                            <div className='bill-data'>
                                <p><strong>BillId:</strong>  {billId}</p>
                                <p><strong>Amount:</strong>  {amount} USD - {ethAmount} ETH</p>
                            </div>
                            :
                            <div className='bill-init'>
                                <p><strong>Amount:</strong>  {amount} USD - {ethAmount} ETH</p>
                            </div>
                        }
                        <div className='button-container'>
                            <button className="button is-primary mr-5 payment-button" onClick={() => this.payBill()}>Payment</button>
                            {/* <button className="button is-danger mr-5" onClick={() => withdraw()}>Withdraw</button> */}
                            <button className="button is-link connect-button"
                                onClick={() =>
                                    // web3Api.provider.request({ method: "eth_requestAccounts" })}
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
    };
};

const mapDispatchToProps = dispatch => {
    return {
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(Payment);
