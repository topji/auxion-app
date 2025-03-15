'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Wallet, CircleDollarSign } from 'lucide-react'
import { ethers } from 'ethers'

// interface Window {
//     ethereum?: any
//   }

// USDT contract ABI - only including balanceOf function
const USDT_ABI = [
  {
    "constant": true,
    "inputs": [{"name": "account", "type": "address"}],
    "name": "balanceOf",
    "outputs": [{"name": "", "type": "uint256"}],
    "type": "function"
  }
]

// Polygon USDC contract address
const USDT_ADDRESS = '0xc2132D05D31c914a87C6611C10748AEb04B58e8F'
const POLYGON_CHAIN_ID = '0x89' // Polygon Mainnet

export function WalletConnect() {
  const [account, setAccount] = useState('')
  const [balance, setBalance] = useState('0')
  const [isConnecting, setIsConnecting] = useState(false)

  const switchToPolygon = async () => {
    if (!window.ethereum) return

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: POLYGON_CHAIN_ID }],
      })
    } catch (switchError: any) {
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: POLYGON_CHAIN_ID,
              chainName: 'Polygon Mainnet',
              nativeCurrency: {
                name: 'MATIC',
                symbol: 'MATIC',
                decimals: 18
              },
              rpcUrls: ['https://polygon-rpc.com/'],
              blockExplorerUrls: ['https://polygonscan.com/']
            }]
          })
        } catch (addError) {
          console.error('Error adding Polygon network:', addError)
        }
      }
    }
  }

  const connectWallet = async () => {
    try {
      setIsConnecting(true)
      if (!window.ethereum) {
        alert('Please install MetaMask!')
        return
      }

      await switchToPolygon()
      
      const provider = new ethers.BrowserProvider(window.ethereum)
      const accounts = await provider.send('eth_requestAccounts', [])
      
      if (!accounts || accounts.length === 0) {
        throw new Error('No accounts found')
      }

      const usdtContract = new ethers.Contract(USDT_ADDRESS, USDT_ABI, provider)
      const balance = await usdtContract.balanceOf(accounts[0])
      const formattedBalance = ethers.formatUnits(balance, 6)

      setAccount(accounts[0])
      setBalance(parseFloat(formattedBalance).toFixed(2))
    } catch (error: any) {
      console.error('Error connecting wallet:', error)
      alert(error.message || 'Failed to connect wallet')
    } finally {
      setIsConnecting(false)
    }
  }

  useEffect(() => {
    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        setAccount('')
        setBalance('0')
      } else {
        setAccount(accounts[0])
        connectWallet() // Refresh balance
      }
    }

    const handleChainChanged = () => {
      window.location.reload()
    }

    if (window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged)
      window.ethereum.on('chainChanged', handleChainChanged)
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged)
        window.ethereum.removeListener('chainChanged', handleChainChanged)
      }
    }
  }, [])

  return account ? (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1 text-sm">
        <CircleDollarSign className="h-4 w-4 text-primary" />
        <span>{balance} USDT</span>
      </div>
      <Button variant="outline" className="text-xs" onClick={() => setAccount('')}>
        {account.slice(0, 6)}...{account.slice(-4)}
      </Button>
    </div>
  ) : (
    <Button 
      onClick={connectWallet} 
      disabled={isConnecting}
      className="bg-purple-gradient"
    >
      <Wallet className="mr-2 h-4 w-4" />
      {isConnecting ? 'Connecting...' : 'Connect Wallet'}
    </Button>
  )
}
