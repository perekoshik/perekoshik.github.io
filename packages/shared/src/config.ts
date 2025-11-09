import { CHAIN } from '@tonconnect/ui-react';

const raw = (import.meta.env?.VITE_TON_NETWORK ?? 'testnet').toLowerCase();
const chain = raw === 'mainnet' ? CHAIN.MAINNET : CHAIN.TESTNET;

export const TARGET_CHAIN = chain;
export const TARGET_NETWORK_NAME = chain === CHAIN.TESTNET ? 'testnet' : 'mainnet';
export const TARGET_NETWORK_LABEL = chain === CHAIN.TESTNET ? 'Testnet' : 'Mainnet';
