import { Address, beginCell } from '@ton/core';
import nacl from 'tweetnacl';
import { config } from './config.js';

export type TonProofPayload = {
  domain: string;
  payload: string;
};

export type TonProofBody = {
  timestamp: number;
  domain: {
    lengthBytes: number;
    value: string;
  };
  payload: string;
  signature: string;
};

export function createChallenge(): TonProofPayload {
  const raw = randomPayload();
  return {
    domain: config.tonProofDomain,
    payload: raw,
  };
}

export function verifyTonProof(body: TonProofBody, publicKeyHex: string, address: string): boolean {
  try {
    if (!publicKeyHex) return false;
    const walletAddress = Address.parse(address);
    const now = Date.now();
    const maxDrift = 5 * 60 * 1000;
    if (Math.abs(now - body.timestamp * 1000) > maxDrift) {
      return false;
    }
    const domainBytes = Buffer.from(body.domain.value, 'utf8');
    if (domainBytes.length !== body.domain.lengthBytes) {
      return false;
    }
    const payloadBytes = Buffer.from(body.payload, 'utf8');
    const buffer = beginCell()
      .storeUint(0x05138d91, 32)
      .storeUint(body.timestamp, 32)
      .storeUint(domainBytes.length, 32)
      .storeBuffer(domainBytes)
      .storeUint(payloadBytes.length, 32)
      .storeBuffer(payloadBytes)
      .storeUint(0, 8)
      .storeBuffer(walletAddress.hash)
      .endCell()
      .toBoc();

    const signature = Buffer.from(body.signature, 'base64');
    const publicKey = Buffer.from(publicKeyHex, 'hex');
    return nacl.sign.detached.verify(new Uint8Array(buffer), new Uint8Array(signature), new Uint8Array(publicKey));
  } catch (error) {
    console.warn('[ton-proof] verification failed', error);
    return false;
  }
}
function randomPayload() {
  return Buffer.from(nacl.randomBytes(16)).toString('hex');
}
