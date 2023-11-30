import classes from './index.module.css'
import { FC } from 'react'
import { StringUtils } from '../../utils/string.utils'
import { JazzIcon } from '../JazzIcon'
import { useMediaQuery } from 'react-responsive'
import { useWeb3 } from '../../hooks/useWeb3'

interface Props {
  address: string
  networkName: string
}

export const Account: FC<Props> = ({ address, networkName }) => {
  const isXlScreen = useMediaQuery({ query: '(min-width: 1000px)' })
  const {
    state: { explorerBaseUrl },
  } = useWeb3()

  const url = explorerBaseUrl ? StringUtils.getAccountUrl(explorerBaseUrl, address) : '#'

  return (
    <a href={url} className={classes.account} target="_blank" rel="nofollow noreferrer">
      <JazzIcon size={isXlScreen ? 60 : 30} address={address} />
      <p className={classes.accountDetails}>
        <abbr title={address} className={classes.accountAddress}>
          {StringUtils.truncateAddress(address)}
        </abbr>
        <span className={classes.network}>{networkName}</span>
      </p>
    </a>
  )
}
