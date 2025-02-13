'use client'
import { Button, Input, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow } from "@heroui/react";
import { useEffect, useState } from "react";
import { Web3 } from 'web3';


export default function Ballot() {


  // init web3
  const [web3, setWeb3] = useState<Web3 | null>(null);
  const [abi, setAbi] = useState('')
  useEffect(() => {
    if (window.ethereum) {
      setWeb3(new Web3(window.ethereum))
    }

    fetch('/Ballot.abi',)
      .then(res => {
        return res.text()
      })
      .then(abi => {
        setAbi(abi)
      })
  }, [])


  // request CA
  const [CA, setCA] = useState('')
  const [ballotSender, setBallotSender] = useState('');
  const [ballotTransaction, setBallotTransaction] = useState('0xf7f98a687ccb154f823b305fa88a09e224c7b90affaf12be43c403927aad2ab7')
  const queryBallotCa = async () => {
    const tx = await web3?.eth.getTransaction(ballotTransaction)
    const receipt = await web3?.eth.getTransactionReceipt(ballotTransaction);

    setCA(receipt!.contractAddress!)
    setBallotSender(tx!.from)
  }


  // query proposals 
  useEffect(() => {
    if (!CA) return
    getBallotProposal()
  }, [CA])

  const [proposals, setProposals] = useState<any[]>([])
  const getBallotProposal = async () => {
    const contract = new web3!.eth.Contract(JSON.parse(abi), CA)
    let i = 0
    const tempList: any[] = []

    while (true) {
      try {
        const proposal = await contract.methods.proposals(i++).call() as any
        const name = web3?.utils.hexToString(proposal.name)
        const voteCount = proposal.voteCount
        tempList.push({ name: name.replace(/\0/g, ''), voteCount })
      } catch (error) {
        break;
      }
    }

    setProposals(tempList)
  }


  // request account
  const [account, setAccount] = useState('')
  const requestAccounts = async () => {
    if (web3 === null) {
      return;
    }

    // request accounts from MetaMask
    await window.ethereum.request({ method: 'eth_requestAccounts' });

    const allAccounts = await web3.eth.getAccounts();
    setAccount(allAccounts[0])
  }



  return <>
    <div className="flex flex-col gap-4 w-fit">

      <Button variant="shadow" color="primary" onPress={requestAccounts}>Connect Account</Button>
      <h4 className="text-base">{account}</h4>
      <Input variant="bordered" placeholder="Transaction" label="Transaction" value={ballotTransaction} onValueChange={setBallotTransaction} />
      <Button onPress={queryBallotCa}>查询</Button>

      <h4 className="text-base"><span className="font-bold text-primary">CA: </span> <span className="text-primary">{CA}</span></h4>

      <div>
        <h1 className="text-xl text-primary font-bold">投票发起人:</h1>
        <h4 className="text-base">{ballotSender}</h4>
      </div>

      <div>
        <h1 className="text-xl text-primary font-bold">投票数据:</h1>
        <Table removeWrapper aria-label="Example static collection table">
          <TableHeader>
            <TableColumn>NAME</TableColumn>
            <TableColumn>VOTE COUNT</TableColumn>
          </TableHeader>
          <TableBody>
            {
              proposals.map(item => (
                <TableRow key={item.name}>
                  <TableCell>{item.name}</TableCell>
                  <TableCell>{item.voteCount}</TableCell>
                </TableRow>
              ))
            }
          </TableBody>
        </Table>
      </div>

    </div>

  </>
}