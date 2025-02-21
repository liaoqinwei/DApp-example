import { useWeb3Account } from "@/providers/Web3AccountProvider"
import { Button, Select, SelectItem } from "@heroui/react"
import { useState } from "react"

export const AccountSelect = ({ account, setAccount }) => {
  const { web3, accounts, requestAccounts } = useWeb3Account()

  return <>

    <Button variant="shadow" color="primary" onPress={requestAccounts}>Connect Account</Button>
    <div>
      <h1 className="text-xl text-primary font-bold">账户:</h1>
      {
        <Select label="Select an account" variant="bordered" selectionMode="single" selectedKeys={new Set([account])} onSelectionChange={v => setAccount(v.currentKey)}>
          {accounts.map((item) => (
            <SelectItem key={item}>{item}</SelectItem>
          ))}
        </Select>

      }
    </div>
  </>
}