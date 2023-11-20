import classes from './index.module.css'
import { FC } from 'react'
import { useWeb3 } from '../../providers/Web3Provider'
import { StringUtils } from '../../utils/string.utils'
import { JazzIcon } from '../JazzIcon'
import { useMediaQuery } from 'react-responsive'

interface Props {
  address: string;
  networkName: string;
}

export const Account: FC<Props> = ({ address, networkName }) => {
  const isXlScreen = useMediaQuery({ query: '(min-width: 1000px)' })
  const { state: { explorerBaseUrl } } = useWeb3()

  const handleAccountClick = () => {
    if (explorerBaseUrl) {
      window.open(StringUtils.getAccountUrl(explorerBaseUrl, address), '_blank', 'noopener,noreferrer')
    }
  }

  return (
    <div
      className={classes.account}
      onClick={handleAccountClick}
    >
      <JazzIcon size={isXlScreen ? 60 : 30} address={address} />
      <p className={classes.accountDetails}>
        <abbr title={address} className={classes.accountAddress}>{StringUtils.truncateAddress(address)}</abbr>
        <span className={classes.network}>{networkName}</span>
      </p>
    </div>
  )
}
