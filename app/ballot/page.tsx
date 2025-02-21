'use client'
import { useWeb3Account } from "@/providers/Web3AccountProvider";
import { Alert, Button, Input, Link, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Select, SelectItem, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow, useDisclosure } from "@heroui/react";
import { useEffect, useState } from "react";
import { useContract } from "./useContract";
import { AccountSelect } from "@/components/AccountSelect";


export default function Ballot() {


  const [account, setAccount] = useState<any>()
  const { web3, accounts, requestAccounts } = useWeb3Account()

  const [ballotTransaction, setBallotTransaction] = useState('0xf7f98a687ccb154f823b305fa88a09e224c7b90affaf12be43c403927aad2ab7')


  const {
    CA,
    ballotSender,
    contract,
  } = useContract('/Ballot.abi', ballotTransaction)

  // query proposals 
  useEffect(() => {
    if (!contract) return
    getBallotProposal()
    requestWinner()
  }, [contract])

  const [proposals, setProposals] = useState<any[]>([])

  const getBallotProposal = async () => {
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


  const [alert, setAlert] = useState({ isShow: false, color: 'default', title: '' })

  const [voteProposal, setVoteProposal] = useState<any>(new Set())
  const vote = async () => {
    const voteInfo = await contract.methods.voters(account.values().next().value).call()
    if (voteInfo.voted)
      setAlert({ isShow: true, color: 'danger', title: '你已经投过票了！' })
    else if (voteInfo.weight === 0n) {
      setAlert({ isShow: true, color: 'danger', title: '你没有可用的票！' })
    } else {
      setAlert({ isShow: false, color: 'default', title: '' })
      // 投票
      const val = Number(voteProposal.values().next().value)
      if (isNaN(val) || !account.values().next().value) return
      await contract.methods.vote(val).send({
        from: account.values().next().value,
        gas: '1000000',
        gasPrice: '10000000000',
      })

      setAlert({ isShow: true, color: 'success', title: 'Successful!' })
      getBallotProposal()
    }
  }



  // 委托
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [client, setClient] = useState('')

  const onDelegate = async () => {
    if (!client) return
    await contract.methods.delegate(client).send({
      from: account.values().next().value,
      gas: '1000000',
      gasPrice: '10000000000',
    })
  }

  // 投票胜出者
  const [winner, setWinner] = useState('')

  const requestWinner = async () => {
    const res = await contract.methods.winnerName().call() as string
    setWinner(web3?.utils.hexToString(res).replace(/\0/g, ''))

  }

  return <>
    <div className="flex flex-col gap-4 w-fit">

      <AccountSelect account={account} setAccount={setAccount} />

      <Input variant="bordered" placeholder="Transaction" label="Transaction" value={ballotTransaction} onValueChange={setBallotTransaction} />

      <h4 className="text-base"><span className="font-bold text-primary">CA: </span> <span className="text-primary">{CA}</span></h4>

      <div>
        <h1 className="text-xl text-primary font-bold">投票发起人:</h1>
        <h4 className="text-base">{ballotSender}</h4>
      </div>

      <div>
        <h1 className="text-xl text-primary font-bold">投票数据:</h1>
        <h3 className="text-medium text-primary font-bold">
          <span className="font-bold">winner:</span>
          <span>{winner}</span>
        </h3>



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

      <div>
        <h1 className="text-xl text-primary font-bold">选择投票的人:</h1>
        <Select label="Select a proposal" variant="bordered" selectionMode="single" selectedKeys={voteProposal} onSelectionChange={val => setVoteProposal(val)}>
          {
            proposals.map((item, index) => (
              <SelectItem key={index}>{item.name}</SelectItem>
            ))
          }
        </Select>
      </div>
      <div className="flex gap-2 justify-between">
        <Button onPress={vote} variant="solid" color="primary" isDisabled={account.size === 0}>投票</Button>
        <Button onPress={onOpen} variant="flat" color="primary" isDisabled={account.size === 0}>委托</Button>
        <Button as={Link} href="/ballot/give" variant="flat" color="primary" isDisabled={account.size === 0}>分发票券</Button>

      </div>

      {alert.isShow && <Alert color={alert.color} title={alert.title} />}


    </div>


    <Modal isOpen={isOpen} placement="top-center" onOpenChange={onOpenChange}>
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">委托他人</ModalHeader>
            <ModalBody>
              <Input
                label="委托人地址"
                labelPlacement="outside"
                value={client}
                onValueChange={setClient}
              />
            </ModalBody>
            <ModalFooter>
              <Button color="danger" variant="flat" onPress={onClose}>
                Close
              </Button>
              <Button color="primary" onPress={onDelegate}>
                confirm
              </Button>
            </ModalFooter>
          </>
        )}

      </ModalContent>
    </Modal>
  </>
}