import classes from './index.module.css'
import { FC, MouseEventHandler } from 'react'
import { StringUtils } from '../../utils/string.utils'
import { JazzIcon } from '../JazzIcon'
import { useMediaQuery } from 'react-responsive'
import { useWeb3 } from '../../hooks/useWeb3'
import { useWalletConnect } from '../../hooks/useWalletConnect'

interface Props {
  address: string
  networkName: string
}

export const Account: FC<Props> = ({ address, networkName }) => {
  const { switchAccount, switchNetwork } = useWalletConnect()
  const isXlScreen = useMediaQuery({ query: '(min-width: 1000px)' })
  const {
    state: { explorerBaseUrl },
  } = useWeb3()

  const handleSwitchNetwork: MouseEventHandler = e => {
    e.preventDefault()
    e.stopPropagation()

    switchNetwork()
  }

  const url = explorerBaseUrl ? StringUtils.getAccountUrl(explorerBaseUrl, address) : '#'

  return (
    <div className={classes.account}>
      <JazzIcon onClick={switchAccount} size={isXlScreen ? 60 : 30} address={address} />
      <a className={classes.accountLink} href={url} target="_blank" rel="nofollow noreferrer">
        <p className={classes.accountDetails}>
          <abbr title={address} className={classes.accountAddress}>
            {StringUtils.truncateAddress(address)}
          </abbr>
          <span onClick={handleSwitchNetwork} className={classes.network}>
            {networkName}
          </span>
        </p>
      </a>
    </div>
  )
}
