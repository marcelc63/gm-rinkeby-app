import * as React from 'react'
import { useState, useEffect } from 'react'
import { ethers } from 'ethers'
import abi from '~/utils/GMPortal.json'
import { useForm } from 'react-hook-form'
import { DateTime } from 'luxon'
import Modal from '~/components/base/Modal'

export default function Home() {
  const contractAddress = '0xe238A81B2F635b07b44C8c58af04417318d6aa82'
  const contractABI = abi.abi
  const [connected, setConnected] = useState(false)
  const [authorized, setAuthorized] = useState(false)
  const [gms, setGMs] = useState<any>([])
  const [loading, setLoading] = useState(false)
  const [failed, setFailed] = useState(false)
  const [succeed, setSucceed] = useState<any>(undefined)

  const checkIfWalletIsConnected = async () => {
    const { ethereum } = window as any
    if (!ethereum) {
      console.log('Make sure you have metamask!')
      setConnected(false)
      return
    } else {
      console.log('We have the ethereum object', ethereum)
      setConnected(true)
    }

    const accounts = await ethereum.request({ method: 'eth_accounts' })
    if (accounts.length !== 0) {
      const account = accounts[0]
      console.log('Found an authorized account: ', account)
      setAuthorized(true)
    } else {
      console.log('No authorized account found')
      setAuthorized(false)
    }
  }

  const connectWallet = async () => {
    const { ethereum } = window as any
    if (!ethereum) {
      alert('Get metamask!')
    }
    const accounts = await ethereum.request({ method: 'eth_requestAccounts' })
    if (accounts[0]) {
      setAuthorized(true)
      getAllGMs()
    }
  }

  const getAllGMs = async () => {
    const provider = new ethers.providers.Web3Provider((window as any).ethereum)
    const signer = provider.getSigner()
    const gmContract = new ethers.Contract(contractAddress, contractABI, signer)

    let resGms = await gmContract.getAllGMs()

    let gmsCleaned: any = []
    resGms.forEach((gm: any) => {
      gmsCleaned.push({
        address: gm.gmer,
        timestamp: DateTime.fromMillis(gm.timestamp * 1000).toFormat(
          'DD HH:mm a'
        ),
        message: gm.message,
        handle: gm.handle.replace('@', ''),
        style: `text-${gm.fontSize} font-${gm.fontWeight} text-transparent bg-clip-text bg-gradient-to-br from-${gm.gradientFrom}-500 to-${gm.gradientTo}-500 animate-${gm.animation}`,
      })
    })
    setGMs(gmsCleaned.reverse())

    gmContract.on(
      'NewGM',
      async (
        from,
        timestamp,
        handle,
        message,
        animation,
        gradientFrom,
        gradientTo,
        fontSize,
        fontWeight
      ) => {
        console.log(
          'NewGM',
          from,
          timestamp,
          handle,
          message,
          animation,
          gradientFrom,
          gradientTo,
          fontSize,
          fontWeight
        )

        const gm = {
          address: from,
          timestamp: DateTime.fromMillis(timestamp * 1000).toFormat(
            'DD HH:mm a'
          ),
          message: message,
          handle: handle.replace('@', ''),
          style: `text-${fontSize} font-${fontWeight} text-transparent bg-clip-text bg-gradient-to-br from-${gradientFrom}-500 to-${gradientTo}-500 animate-${animation}`,
        }
        setSucceed(gm)

        let resGms = await gmContract.getAllGMs()

        let gmsCleaned: any = []
        resGms.forEach((gm: any) => {
          gmsCleaned.push({
            address: gm.gmer,
            timestamp: DateTime.fromMillis(gm.timestamp * 1000).toFormat(
              'DD HH:mm a'
            ),
            message: gm.message,
            handle: gm.handle.replace('@', ''),
            style: `text-${gm.fontSize} font-${gm.fontWeight} text-transparent bg-clip-text bg-gradient-to-br from-${gm.gradientFrom}-500 to-${gm.gradientTo}-500 animate-${gm.animation}`,
          })
        })
        setGMs(gmsCleaned.reverse())
        setTimeout(() => {
          setSucceed(undefined)
        }, 5000)
      }
    )
  }

  const sendGM = async (handle: string) => {
    try {
      const provider = new ethers.providers.Web3Provider(
        (window as any).ethereum
      )
      const signer = provider.getSigner()
      const gmContract = new ethers.Contract(
        contractAddress,
        contractABI,
        signer
      )

      const gmTxn = await gmContract.gm(handle, { gasLimit: 400000 })
      console.log('Mining...', gmTxn.hash)
      setLoading(true)
      await gmTxn.wait()
      console.log('Mined --', gmTxn.hash)
      setLoading(false)
    } catch (err) {
      console.log(err)
      setLoading(false)
      setFailed(true)
    }
  }

  const { register, handleSubmit } = useForm({})
  const onSendGM = async (data: any) => {
    const handle = data.handle.toLowerCase().replace('@', '')
    sendGM(handle)
  }

  useEffect(() => {
    checkIfWalletIsConnected()
  }, [])
  useEffect(() => {
    if (connected && authorized) {
      getAllGMs()
    }
  }, [connected, authorized])

  return (
    <div className="bg-gradient-to-br from-blue-500 to-purple-500 min-h-screen">
      <div className="flex flex-col w-full items-center p-8">
        <h1 className="font-bold text-6xl text-white mb-4 text-center">
          👋 <span className="filter drop-shadow-lg">GM!</span>
        </h1>
        <h2 className="text-white text-3xl mb-2 text-center">
          Say GM to each other via Rinkeby blockchain network!
        </h2>
        <p className="text-white text-center">
          When you click Send GM, a sentence will be randomly created based on
          NFT Twitter's terminologies that{' '}
          <a
            href="https://twitter.com/punk6529/status/1433002033242595338"
            className="underline"
          >
            @6529
          </a>{' '}
          shared along with a random color, font size, boldness, and animation!
        </p>
        <p className="text-white text-center">
          Created as a final project for{' '}
          <a href="https://twitter.com/_buildspace" className="underline">
            @buildspace
          </a>
          , inspired by{' '}
          <a href="https://twitter.com/gmtheapp" className="underline">
            @gmtheapp
          </a>
          .
        </p>
        <p className="text-white mb-4 text-center">
          by{' '}
          <a href="https://twitter.com/marcelc63" className="underline">
            @marcelc63
          </a>
        </p>
      </div>
      {!connected && (
        <div className="flex flex-col w-full items-center px-8 mb-8">
          <div className="max-w-lg bg-white p-4 rounded shadow-md w-full mb-4">
            <p className="font-bold text-center text-xl mb-4">
              Welcome to GMTheChain! Please make sure you have Metamask to get
              started
            </p>
          </div>
        </div>
      )}
      {connected && !authorized && (
        <div className="flex flex-col w-full items-center px-8 mb-8">
          <div className="max-w-lg bg-white p-4 rounded shadow-md w-full mb-4">
            <p className="font-bold text-center text-xl mb-4">
              Welcome to GMTheChain! Please connect your Metamask Account
            </p>
            <p className="text-center text-lg mb-2">
              GM The Chain allows you to send GM to each other via the Rinkeby
              network (it's free!)
            </p>
            <p className="text-center text-lg mb-4">
              Whenever you said GM, the GM message is randomly created on the
              chain along with a random color, font size, font boldness, and
              animation!
            </p>
            <button
              onClick={connectWallet}
              className="w-full hover:shadow-lg bg-gradient-to-br from-green-500 to-blue-500 text-white shadow font-bold text-xl rounded p-2"
            >
              Connect Metamask
            </button>
          </div>
        </div>
      )}
      {connected && authorized && (
        <div className="flex flex-col w-full items-center px-8 mb-8">
          <form
            className="max-w-lg rounded w-full flex flex-col"
            onSubmit={handleSubmit(onSendGM)}
          >
            <input
              required
              {...register('handle')}
              className="bg-white rounded p-2 mb-2 shadow-md"
              placeholder="Twitter Handle (required but can be anything, doesn't have to be yours)"
            />
            <button className="hover:shadow-lg bg-gradient-to-br from-green-500 to-blue-500 text-white shadow font-bold text-xl rounded p-2">
              Send GM!
            </button>
          </form>
        </div>
      )}
      <div className="flex flex-col w-full items-center px-8">
        {connected &&
          authorized &&
          gms.map((gm: any, index: number) => {
            return (
              <div
                className="max-w-lg bg-white p-4 rounded shadow-md w-full mb-4"
                key={`${index}`}
              >
                <p>
                  <a href={``} className="underline text-blue-500">
                    @{gm.handle}
                  </a>{' '}
                  says
                </p>
                <p className={gm.style}>{gm.message}</p>
                <p className="text-gray-400">
                  {gm.timestamp} ·{' '}
                  <a
                    href={`https://rinkeby.etherscan.io/address/${gm.address}`}
                    className="underline cursor-pointer"
                  >
                    {gm.address}
                  </a>
                </p>
              </div>
            )
          })}
        <div className="flex flex-row mb-8">
          <div className="h-6 w-6 bg-gradient-to-br from-yellow-500 to-red-500 rounded-full mx-2"></div>
          <div className="h-6 w-6 bg-gradient-to-br from-red-500 to-black-500 rounded-full mx-2"></div>
          <div className="h-6 w-6 bg-gradient-to-br from-pink-500 to-purple-500 rounded-full mx-2"></div>
          <div className="h-6 w-6 bg-gradient-to-br from-purple-500 to-orange-500 rounded-full mx-2"></div>
          <div className="h-6 w-6 bg-gradient-to-br from-green-500 to-pink-500 rounded-full mx-2"></div>
          <div className="h-6 w-6 bg-gradient-to-br from-orange-500 to-green-500 rounded-full mx-2"></div>
          <div className="h-6 w-6 bg-gradient-to-br from-blue-500 to-gray-500 rounded-full mx-2"></div>
        </div>
      </div>
      <Modal open={loading}>
        <p className="text-center text-4xl animate-bounce animate-pulse">
          Sending GM 👋
        </p>
      </Modal>
      <Modal open={failed} close={() => setFailed(false)}>
        <p className="text-center text-4xl text-red-500">
          😢 Transaction failed, please make a new transaction and consider
          redoing with higher gas
        </p>
      </Modal>
      <Modal open={succeed} close={() => setSucceed(undefined)}>
        {succeed && (
          <div className="w-full">
            <p className="text-center text-4xl mb-4">
              <a
                href={`https://rinkeby.etherscan.io/address/${succeed.address}`}
                className="underline"
              >
                @{succeed.handle}
              </a>{' '}
              says
            </p>
            <p className={`text-center mb-4 ${succeed.style}`}>
              {succeed.message}
            </p>
            <p className="text-center text-gray-400">auto close in 5 seconds</p>
          </div>
        )}
      </Modal>
    </div>
  )
}
