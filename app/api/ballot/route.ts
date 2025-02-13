import { getAbiByName } from "../(util)/contract"

let abi: string = null!


export async function GET(request: Request) {
  if (!abi) abi = await getAbiByName('Ballot')
  return Response.json({ data: 'ok', abi })
}
