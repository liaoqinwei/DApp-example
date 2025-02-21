import { useWeb3Account } from "@/providers/Web3AccountProvider"
import { useEffect, useState } from "react"
import { Contract } from "web3"

const abiCache = {}

export const useContract = (abiPath, transaction) => {
  const { web3 } = useWeb3Account()

  const [abi, setAbi] = useState('')
  useEffect(() => {
    if (abiCache[abiPath]) {
      setAbi(abiCache[abiPath])
      return
    }

    fetch(abiPath)
      .then(res => {
        return res.text()
      })
      .then(abi => {
        abiCache[abiPath] = abi
        setAbi(abi)
      })
  }, [])

  // request CA
  const [CA, setCA] = useState('')
  const [ballotSender, setBallotSender] = useState('');
  const [contract, setContract] = useState<Contract<any>>(null!)


  useEffect(() => {
    if (!abi || !web3) return
    queryBallotCa()
  }, [abi, web3])
  const queryBallotCa = async () => {
    const receipt = await web3?.eth.getTransactionReceipt(transaction);
    setCA(receipt!.contractAddress!)
    setBallotSender(receipt.from)
    setContract(new web3!.eth.Contract(JSON.parse(abi), receipt!.contractAddress!))
  }

  return {
    CA,
    ballotSender,
    contract,
  }
}