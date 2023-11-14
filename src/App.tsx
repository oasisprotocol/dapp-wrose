import { FC } from 'react'
import { useWeb3 } from './providers/Web3Provider'

export const App: FC = () => {
  const { state: { isConnected }, connectWallet, wrap, unwrap, balance, balanceOfWROSE } = useWeb3()

  return (
    <>
      <h1>WROSE DAPP</h1>

      {!isConnected && (<button onClick={() => connectWallet()}>Connect Wallet</button>)}
      {isConnected && <>
        <button onClick={() => wrap('1')}>Wrap</button>
        <button onClick={() => unwrap('1')}>Unwrap</button>
        <button onClick={() => balance()}>Balance ROSE</button>
        <button onClick={() => balanceOfWROSE()}>Balance WROSE</button>
      </>}
    </>
  )
}
