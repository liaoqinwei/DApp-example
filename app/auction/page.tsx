'use client'
import { useWeb3Account } from "@/providers/Web3AccountProvider";
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Button, Input } from "@heroui/react";
import { useEffect, useState } from "react";
import { useContract } from "../ballot/useContract";
import { TransactionError } from "web3";
import { AccountSelect } from "@/components/AccountSelect";

// 1. 出价，退回，结束拍卖
export default function () {

  const { web3, accounts, requestAccounts } = useWeb3Account()

  const {
    CA,
    ballotSender,
    contract,
  } = useContract('/SimpleAuction.abi', '0xc7e82451f3d1073e14a6da53ca61f1738366bbbed40dd865ce94925ad62cfa6b')

  const [beneficiary, setBeneficiary] = useState('')
  const [endTime, setEndTime] = useState('')
  const [highestBidder, setHighestBidder] = useState('')
  const [highestBid, setHighestBid] = useState('')

  const updateInfo = async () => {
    setBeneficiary(await contract.methods.beneficiary().call())
    setEndTime(new Date(Number(await contract.methods.auctionEndTime().call()) * 1000).toString())
    setHighestBidder(await contract.methods.highestBidder().call())
    setHighestBid(web3.utils.fromWei(await contract.methods.highestBid().call(), 'ether'))
  }


  useEffect(() => {
    if (!contract) return
    console.log(contract.methods)
    updateInfo()
  }, [contract])

  const [value, setValue] = useState('0')

  const bid = async () => {
    try {
      await contract.methods.bid().send({
        from: account,
        gas: '1000000',
        gasPrice: '10000000000',
        value: web3.utils.toWei(value, "ether")
      })
    } catch (error) {
      console.dir(error)
    }


    updateInfo()
  }

  const withdraw = async () => {
    try {
      await contract.methods.withdraw().send({
        from: account,
        gas: '1000000',
        gasPrice: '10000000000',
      })
    } catch (error) {
      console.dir(error)
    }
  }

  const auctionEnd = async () => {
    try {
      const receipt = await contract.methods.auctionEnd().send({
        from: account,
        gas: '1000000',
        gasPrice: '10000000000',
      })
    } catch (error) {
      console.dir(error)
    }
  }

  // 操作的账户
  const [account, setAccount] = useState<any>()


  return <>
    <div className="max-w-fit">
      <AccountSelect account={account} setAccount={setAccount} />

      <h1>竞拍信息</h1>
      <Table hideHeader aria-label="Example static collection table">
        <TableHeader>
          <TableColumn>KEY</TableColumn>
          <TableColumn>Value</TableColumn>
        </TableHeader>
        <TableBody>
          <TableRow key="1">
            <TableCell>
              竞拍收益人
            </TableCell>
            <TableCell>{beneficiary}</TableCell>
          </TableRow>
          <TableRow key="2">
            <TableCell>最高出价者</TableCell>
            <TableCell>{highestBidder}</TableCell>
          </TableRow>
          <TableRow key="3">
            <TableCell>最高出价</TableCell>
            <TableCell>{highestBid}</TableCell>
          </TableRow>
          <TableRow key="4">
            <TableCell>拍卖结束时间</TableCell>
            <TableCell>{endTime}</TableCell>
          </TableRow>
        </TableBody>
      </Table>

      <Input label="出价" type="number" value={value} onValueChange={setValue} />
      <div className="flex gap-3 mt-4">
        <Button color="primary" onPress={bid}>出价</Button>
        <Button color="secondary" onPress={withdraw}>退回</Button>
        <Button onPress={auctionEnd}>结束拍卖</Button>
      </div>
    </div>
  </>
}