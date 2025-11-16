import { Address, Cell, contractAddress } from '@ton/core';
import { createHash } from 'node:crypto';
import nacl from 'tweetnacl';

const TON_PROOF_PREFIX = Buffer.from('ton-proof-item-v2/', 'utf8');

export type TonProofPayload = {
  wallet: { address: string };
  proof: {
    timestamp: number;
    domain: { lengthBytes: number; value: string };
    payload: string;
    signature: string;
  };
  state_init?: string;
};

export function verifyTonProof(input: TonProofPayload, expectedDomain: string): { address: Address } {
  if (input.proof.domain.value !== expectedDomain) {
    throw new Error('Неверный домен ton-proof');
  }

  if (!input.state_init) {
    throw new Error('Wallet state_init обязателен для ton-proof');
  }

  const address = Address.parse(input.wallet.address);
  const state = parseStateInit(input.state_init, address);
  const publicKey = extractPublicKey(state.data);
  const message = buildMessage(address, input.proof);

  const signature = Buffer.from(input.proof.signature, 'base64');
  const verified = nacl.sign.detached.verify(message, signature, publicKey);
  if (!verified) {
    throw new Error('Подпись ton-proof недействительна');
  }

  return { address };
}

function buildMessage(address: Address, proof: TonProofPayload['proof']) {
  const domainBytes = Buffer.from(proof.domain.value, 'utf8');
  if (proof.domain.lengthBytes < 1 || proof.domain.lengthBytes > 4) {
    throw new Error('Некорректный размер поля domain.lengthBytes');
  }
  const domainLength = Buffer.alloc(proof.domain.lengthBytes);
  domainLength.writeUIntLE(domainBytes.length, 0, proof.domain.lengthBytes);
  const payloadBytes = Buffer.from(proof.payload, 'base64');
  const timestamp = Buffer.alloc(8);
  timestamp.writeBigInt64LE(BigInt(proof.timestamp));
  const workchain = Buffer.alloc(4);
  workchain.writeInt32LE(address.workChain, 0);

  const data = Buffer.concat([
    TON_PROOF_PREFIX,
    domainLength,
    domainBytes,
    payloadBytes,
    timestamp,
    workchain,
    address.hash,
  ]);

  return createHash('sha256').update(data).digest();
}

function parseStateInit(stateInit: string, address: Address) {
  const cell = Cell.fromBoc(Buffer.from(stateInit, 'base64'))[0];
  const slice = cell.beginParse();

  if (slice.loadBit()) {
    slice.loadUint(5); // skip split_depth
  }
  if (slice.loadBit()) {
    slice.loadBit();
    slice.loadBit();
  }

  const hasCode = slice.loadBit();
  const code = hasCode ? slice.loadRef() : null;
  const hasData = slice.loadBit();
  const data = hasData ? slice.loadRef() : null;
  if (slice.loadBit()) {
    slice.loadRef();
  }

  if (!code || !data) {
    throw new Error('state_init неполный');
  }

  const derived = contractAddress(address.workChain, { code, data });
  if (!derived.equals(address)) {
    throw new Error('state_init не соответствует адресу кошелька');
  }
  return { code, data };
}

function extractPublicKey(data: Cell) {
  const slice = data.beginParse();
  if (slice.remainingBits < 256) {
    throw new Error('Некорректные данные кошелька');
  }
  slice.loadUint(32); // seqno
  slice.loadUint(32); // walletId
  return slice.loadBuffer(32);
}
