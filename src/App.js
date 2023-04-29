import {useEffect, useState} from "react"
import Navbar from "./components/Navbar"
import React from "react"
import Web3 from "web3";
import detectEthereumProvider from "@metamask/detect-provider"
import {loadContract} from "./utils/load-contract"
import './App.css';

function App() {
    const [web3Api, setWeb3Api] = useState({
      provider: null,
      web3: null,
      contract: null
    });

    const [account, setAccount] = useState(null)
    const [balance, setBalance] = useState(null)
    const [reload, setReload] = useState(false)

    const reloadEffect = () => setReload(!reload)

    useEffect(() => {     // Setting provider whenever app loads
      const loadProvider = async () => {
      const provider = await detectEthereumProvider()
      const contract = await loadContract("Funder", provider)
      if (provider) {
        provider.request({ method: "eth_requestAccounts" })
        setWeb3Api({
          web3: new Web3(provider),
          provider,
          contract,
        })
      } else {
        console.error("Please install Metamask")
      }
    }
    loadProvider()
    }, [])

    // loads balance of the contract whenever app starts
    useEffect(() => {
      const loadBalance = async () => {
        const { contract, web3 } = web3Api
        const balance = await web3.eth.getBalance(contract.address)
        setBalance(web3.utils.fromWei(balance, "ether"))
      }
      web3Api.contract && loadBalance()
  
    }, [web3Api, reload])

    // transfer function use to call contract's transfer 
    // function when user wish to transfer funds 'ether > 2'
    const transferFund = async () => {
      const { web3, contract } = web3Api
      await contract.transfer({
        from: account,
        value: web3.utils.toWei("2", "ether"),
      })
      reloadEffect()
    }

    // withdraw function use to withdraw funds from the contract
    const withdrawFund = async () => {
      const { contract, web3 } = web3Api
      const withdrawAmount = web3.utils.toWei("2", "ether")
      await contract.withdraw(withdrawAmount, {
        from: account,
      })
      reloadEffect()
    }

    useEffect(() => {
      const getAccount = async () => {
        const accounts = await web3Api.web3.eth.getAccounts();
        setAccount(accounts[0]);
      };
      web3Api.web3 && getAccount();
    }, [web3Api.web3]);

  return (
    <>
    <Navbar />
    <main>
      <div class="main-content">
        <div class="card text-center">
          <div class="card-header">Total Reserve</div>
            <div class="card-body">
              <h5 class="card-title">Balance: {balance} ETH</h5>
              <p class="card-text">
                <span class="acct-name">Account</span> : {account ? account : "Not Connected"}
              </p>
              &nbsp;
              <div class="btn-success">
                <button 
                  type="button" 
                  class="btn"
                  onClick={transferFund}
                  >
                  Transfer
                </button>
                &nbsp;
                <button 
                  type="button" 
                  class="btn"
                  onClick={withdrawFund}
                  >
                  Withdraw
                </button>
            </div>
          </div>
        </div>
      </div>
    </main>
      </>
    )
  }

  export default App
