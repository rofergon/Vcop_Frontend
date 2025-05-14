import React from 'react';
import { ConnectWallet } from '@coinbase/onchainkit/wallet';

const CustomConnectButton: React.FC = () => {
  return (
    <ConnectWallet />
  );
};

export default CustomConnectButton; 