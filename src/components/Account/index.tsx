import classes from './index.module.css'
import { FC, MouseEventHandler } from 'react'
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

  const handleAccountClick = () => {
    if (explorerBaseUrl) {
      window.open(StringUtils.getAccountUrl(explorerBaseUrl, address), '_blank', 'noopener,noreferrer')
    }
  }

  const handleCopyAddressToClipboard: MouseEventHandler<HTMLParagraphElement> = async (e) => {
    e.preventDefault()
    e.stopPropagation()

    try {
      await navigator.clipboard.writeText(address)
      window.alert('Copied to clipboard!')
    } catch (ex) {
      // Ignore
    }
  }

  return (
    <div className={classes.account} onClick={handleAccountClick}>
      <JazzIcon size={isXlScreen ? 60 : 30} address={address} />
      <p onClick={handleCopyAddressToClipboard} className={classes.accountDetails}>
        <abbr title={address} className={classes.accountAddress}>
          {StringUtils.truncateAddress(address)}
        </abbr>
        <span className={classes.network}>{networkName}</span>
      </p>
    </div>
  )
}
