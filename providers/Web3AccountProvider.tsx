'use client'

import { createContext, useContext, useEffect, useState } from "react"
import { Web3 } from "web3";

type Web3AccountContextType = { web3: Web3, accounts: string[], requestAccounts: () => void }
const Web3AccountContext = createContext<Web3AccountContextType>(null!)


export const Web3AccountProvider = ({ children }) => {
  // init web3
  const [web3, setWeb3] = useState<Web3>(null!);
  useEffect(() => {
    if (window.ethereum) {
      setWeb3(new Web3(window.ethereum))
    }
  }, [])


  const [accounts, setAccounts] = useState<any[]>([])
  const requestAccounts = async () => {
    if (web3 === null) {
      return;
    }

    // request accounts from MetaMask
    await window.ethereum.request({ method: 'eth_requestAccounts' });

    const allAccounts = await web3.eth.getAccounts();
    setAccounts(allAccounts)
  }

  return <Web3AccountContext.Provider
    value={{
      web3,
      accounts,
      requestAccounts
    }} >
    {children}
  </Web3AccountContext.Provider >
}

export const useWeb3Account = () => {
  return useContext(Web3AccountContext)
}