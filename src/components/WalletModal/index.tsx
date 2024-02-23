import { FC, useState } from 'react'
import { Modal, ModalProps } from '../Modal'
import { LogoIconRound } from '../icons/LogoIconRound.tsx'
import classes from './index.module.css'
import { useEIP6963ProviderInfoList } from '../../hooks/useEIP6963ProviderInfoList.ts'
import { EIP6963ProviderInfo } from '../../utils/types.ts'
import { useEIP6963 } from '../../hooks/useEIP6963.ts'

interface WalletModalProps extends Pick<ModalProps, 'isOpen' | 'closeModal'> {
  next: () => void
}

interface ProviderOptionProps extends Pick<EIP6963ProviderInfo, 'rdns' | 'name' | 'icon'> {
  isLoading: boolean
  onSelectProvider: (rdns: string) => void
}

const ProviderOption: FC<ProviderOptionProps> = ({ rdns, name, icon, onSelectProvider, isLoading }) => {
  if (!rdns) {
    return null
  }

  return (
    <div className={classes.providerOption}>
      <button
        className={classes.providerOptionBtn}
        onClick={() => onSelectProvider(rdns)}
        disabled={isLoading}
      >
        <img className={classes.providerOptionLogo} src={icon} alt={name} />
        {name}
      </button>
    </div>
  )
}

export const WalletModal: FC<WalletModalProps> = ({ isOpen, closeModal, next }) => {
  const { setCurrentProviderByRdns } = useEIP6963()
  const providerInfoList = useEIP6963ProviderInfoList()

  const [isLoading, setIsLoading] = useState(false)

  const onSelectProvider = (rdns: string) => {
    setIsLoading(true)
    setCurrentProviderByRdns(rdns)
    next()
    setIsLoading(false)
  }

  const providerInfoOptionsList = providerInfoList.map(({ uuid, rdns, name, icon }) => (
    <ProviderOption
      key={uuid}
      rdns={rdns}
      name={name}
      icon={icon}
      isLoading={isLoading}
      onSelectProvider={onSelectProvider}
    />
  ))

  return (
    <Modal isOpen={isOpen} closeModal={closeModal} disableBackdropClick>
      <div className={classes.walletModalContent}>
        <div className={classes.walletModalLogo}>
          <LogoIconRound />
        </div>

        <h4>Connect a wallet</h4>

        <div className={classes.walletModalProviderList}>{providerInfoOptionsList}</div>
      </div>
    </Modal>
  )
}
