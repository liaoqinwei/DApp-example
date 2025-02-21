'use client'

import { useWeb3Account } from "@/providers/Web3AccountProvider";
import { Alert, Button, Form, Input } from "@heroui/react";
import { useState } from "react";
import { useContract } from "../useContract";

export default function () {
  const [address, setAddress] = useState('')
  const { web3, accounts, requestAccounts } = useWeb3Account()

  const { contract } = useContract('/Ballot.abi', '0xf7f98a687ccb154f823b305fa88a09e224c7b90affaf12be43c403927aad2ab7')

  const [alert, setAlert] = useState({ isShow: false, color: 'default', title: '' })


  const onSubmit = async (ev) => {
    ev.preventDefault()
    const data = Object.fromEntries(new FormData(ev.currentTarget));
    try {
      await contract.methods.giveRightToVote(data.address).send({
        from: '0x49FB9D8151A5C04b254C23eCD86bdD0ac493c54D',
        gas: '1000000',
        gasPrice: '10000000000',
      })

      setAlert({ isShow: true, color: 'success', title: 'Successful!' })
    } catch (error) {
      setAlert({ isShow: true, color: 'error', title: `Failed!\n${error}` })
    }


  }

  return <>
    <div className="w-fit">

      <h1 className="text-3xl text-primary" >赋予投票权益</h1>

      <Form
        onSubmit={onSubmit}
      >
        <Input
          placeholder="请输入赋予的地址"
          label="Address"
          labelPlacement="outside"
          name="address"
          value={address}
          onValueChange={setAddress}
        />

        {alert.isShow && <Alert color={alert.color} title={alert.title} />}

        <Button color="primary" type="submit" >赋予</Button>
      </Form>
    </div>

  </>
}