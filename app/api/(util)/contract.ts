import path from 'node:path'
import fs from 'node:fs/promises'

export const getAbiByName = async (name: string): Promise<string> => {
  const filePath = path.resolve(process.cwd(), `./__contract/${name}.abi`)
  try {
    const abi = await fs.readFile(filePath)
    return abi.toString()
  } catch (error) {
    return null!
  }
}