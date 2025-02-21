import { NextRequest } from "next/server"
import { getAbiByName } from "../(util)/contract"

let abi: string = null!

const sleep = async (time: number) => {
  return new Promise((resolve, reject) => {
    setTimeout(resolve, time)
  })
}
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const index = searchParams.get('index')
  const delay = Math.floor(Math.random() * 2 + 1) * 1000

  console.log(index)
  await sleep(delay)
  return Response.json({ data: 'ok', index })
}
