import {
    Cell,
    Slice,
    Address,
    Builder,
    beginCell,
    ComputeError,
    TupleItem,
    TupleReader,
    Dictionary,
    contractAddress,
    address,
    ContractProvider,
    Sender,
    Contract,
    ContractABI,
    ABIType,
    ABIGetter,
    ABIReceiver,
    TupleBuilder,
    DictionaryValue
} from '@ton/core';

export type DataSize = {
    $$type: 'DataSize';
    cells: bigint;
    bits: bigint;
    refs: bigint;
}

export function storeDataSize(src: DataSize) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeInt(src.cells, 257);
        b_0.storeInt(src.bits, 257);
        b_0.storeInt(src.refs, 257);
    };
}

export function loadDataSize(slice: Slice) {
    const sc_0 = slice;
    const _cells = sc_0.loadIntBig(257);
    const _bits = sc_0.loadIntBig(257);
    const _refs = sc_0.loadIntBig(257);
    return { $$type: 'DataSize' as const, cells: _cells, bits: _bits, refs: _refs };
}

export function loadTupleDataSize(source: TupleReader) {
    const _cells = source.readBigNumber();
    const _bits = source.readBigNumber();
    const _refs = source.readBigNumber();
    return { $$type: 'DataSize' as const, cells: _cells, bits: _bits, refs: _refs };
}

export function loadGetterTupleDataSize(source: TupleReader) {
    const _cells = source.readBigNumber();
    const _bits = source.readBigNumber();
    const _refs = source.readBigNumber();
    return { $$type: 'DataSize' as const, cells: _cells, bits: _bits, refs: _refs };
}

export function storeTupleDataSize(source: DataSize) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.cells);
    builder.writeNumber(source.bits);
    builder.writeNumber(source.refs);
    return builder.build();
}

export function dictValueParserDataSize(): DictionaryValue<DataSize> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeDataSize(src)).endCell());
        },
        parse: (src) => {
            return loadDataSize(src.loadRef().beginParse());
        }
    }
}

export type SignedBundle = {
    $$type: 'SignedBundle';
    signature: Buffer;
    signedData: Slice;
}

export function storeSignedBundle(src: SignedBundle) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeBuffer(src.signature);
        b_0.storeBuilder(src.signedData.asBuilder());
    };
}

export function loadSignedBundle(slice: Slice) {
    const sc_0 = slice;
    const _signature = sc_0.loadBuffer(64);
    const _signedData = sc_0;
    return { $$type: 'SignedBundle' as const, signature: _signature, signedData: _signedData };
}

export function loadTupleSignedBundle(source: TupleReader) {
    const _signature = source.readBuffer();
    const _signedData = source.readCell().asSlice();
    return { $$type: 'SignedBundle' as const, signature: _signature, signedData: _signedData };
}

export function loadGetterTupleSignedBundle(source: TupleReader) {
    const _signature = source.readBuffer();
    const _signedData = source.readCell().asSlice();
    return { $$type: 'SignedBundle' as const, signature: _signature, signedData: _signedData };
}

export function storeTupleSignedBundle(source: SignedBundle) {
    const builder = new TupleBuilder();
    builder.writeBuffer(source.signature);
    builder.writeSlice(source.signedData.asCell());
    return builder.build();
}

export function dictValueParserSignedBundle(): DictionaryValue<SignedBundle> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeSignedBundle(src)).endCell());
        },
        parse: (src) => {
            return loadSignedBundle(src.loadRef().beginParse());
        }
    }
}

export type StateInit = {
    $$type: 'StateInit';
    code: Cell;
    data: Cell;
}

export function storeStateInit(src: StateInit) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeRef(src.code);
        b_0.storeRef(src.data);
    };
}

export function loadStateInit(slice: Slice) {
    const sc_0 = slice;
    const _code = sc_0.loadRef();
    const _data = sc_0.loadRef();
    return { $$type: 'StateInit' as const, code: _code, data: _data };
}

export function loadTupleStateInit(source: TupleReader) {
    const _code = source.readCell();
    const _data = source.readCell();
    return { $$type: 'StateInit' as const, code: _code, data: _data };
}

export function loadGetterTupleStateInit(source: TupleReader) {
    const _code = source.readCell();
    const _data = source.readCell();
    return { $$type: 'StateInit' as const, code: _code, data: _data };
}

export function storeTupleStateInit(source: StateInit) {
    const builder = new TupleBuilder();
    builder.writeCell(source.code);
    builder.writeCell(source.data);
    return builder.build();
}

export function dictValueParserStateInit(): DictionaryValue<StateInit> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeStateInit(src)).endCell());
        },
        parse: (src) => {
            return loadStateInit(src.loadRef().beginParse());
        }
    }
}

export type Context = {
    $$type: 'Context';
    bounceable: boolean;
    sender: Address;
    value: bigint;
    raw: Slice;
}

export function storeContext(src: Context) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeBit(src.bounceable);
        b_0.storeAddress(src.sender);
        b_0.storeInt(src.value, 257);
        b_0.storeRef(src.raw.asCell());
    };
}

export function loadContext(slice: Slice) {
    const sc_0 = slice;
    const _bounceable = sc_0.loadBit();
    const _sender = sc_0.loadAddress();
    const _value = sc_0.loadIntBig(257);
    const _raw = sc_0.loadRef().asSlice();
    return { $$type: 'Context' as const, bounceable: _bounceable, sender: _sender, value: _value, raw: _raw };
}

export function loadTupleContext(source: TupleReader) {
    const _bounceable = source.readBoolean();
    const _sender = source.readAddress();
    const _value = source.readBigNumber();
    const _raw = source.readCell().asSlice();
    return { $$type: 'Context' as const, bounceable: _bounceable, sender: _sender, value: _value, raw: _raw };
}

export function loadGetterTupleContext(source: TupleReader) {
    const _bounceable = source.readBoolean();
    const _sender = source.readAddress();
    const _value = source.readBigNumber();
    const _raw = source.readCell().asSlice();
    return { $$type: 'Context' as const, bounceable: _bounceable, sender: _sender, value: _value, raw: _raw };
}

export function storeTupleContext(source: Context) {
    const builder = new TupleBuilder();
    builder.writeBoolean(source.bounceable);
    builder.writeAddress(source.sender);
    builder.writeNumber(source.value);
    builder.writeSlice(source.raw.asCell());
    return builder.build();
}

export function dictValueParserContext(): DictionaryValue<Context> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeContext(src)).endCell());
        },
        parse: (src) => {
            return loadContext(src.loadRef().beginParse());
        }
    }
}

export type SendParameters = {
    $$type: 'SendParameters';
    mode: bigint;
    body: Cell | null;
    code: Cell | null;
    data: Cell | null;
    value: bigint;
    to: Address;
    bounce: boolean;
}

export function storeSendParameters(src: SendParameters) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeInt(src.mode, 257);
        if (src.body !== null && src.body !== undefined) { b_0.storeBit(true).storeRef(src.body); } else { b_0.storeBit(false); }
        if (src.code !== null && src.code !== undefined) { b_0.storeBit(true).storeRef(src.code); } else { b_0.storeBit(false); }
        if (src.data !== null && src.data !== undefined) { b_0.storeBit(true).storeRef(src.data); } else { b_0.storeBit(false); }
        b_0.storeInt(src.value, 257);
        b_0.storeAddress(src.to);
        b_0.storeBit(src.bounce);
    };
}

export function loadSendParameters(slice: Slice) {
    const sc_0 = slice;
    const _mode = sc_0.loadIntBig(257);
    const _body = sc_0.loadBit() ? sc_0.loadRef() : null;
    const _code = sc_0.loadBit() ? sc_0.loadRef() : null;
    const _data = sc_0.loadBit() ? sc_0.loadRef() : null;
    const _value = sc_0.loadIntBig(257);
    const _to = sc_0.loadAddress();
    const _bounce = sc_0.loadBit();
    return { $$type: 'SendParameters' as const, mode: _mode, body: _body, code: _code, data: _data, value: _value, to: _to, bounce: _bounce };
}

export function loadTupleSendParameters(source: TupleReader) {
    const _mode = source.readBigNumber();
    const _body = source.readCellOpt();
    const _code = source.readCellOpt();
    const _data = source.readCellOpt();
    const _value = source.readBigNumber();
    const _to = source.readAddress();
    const _bounce = source.readBoolean();
    return { $$type: 'SendParameters' as const, mode: _mode, body: _body, code: _code, data: _data, value: _value, to: _to, bounce: _bounce };
}

export function loadGetterTupleSendParameters(source: TupleReader) {
    const _mode = source.readBigNumber();
    const _body = source.readCellOpt();
    const _code = source.readCellOpt();
    const _data = source.readCellOpt();
    const _value = source.readBigNumber();
    const _to = source.readAddress();
    const _bounce = source.readBoolean();
    return { $$type: 'SendParameters' as const, mode: _mode, body: _body, code: _code, data: _data, value: _value, to: _to, bounce: _bounce };
}

export function storeTupleSendParameters(source: SendParameters) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.mode);
    builder.writeCell(source.body);
    builder.writeCell(source.code);
    builder.writeCell(source.data);
    builder.writeNumber(source.value);
    builder.writeAddress(source.to);
    builder.writeBoolean(source.bounce);
    return builder.build();
}

export function dictValueParserSendParameters(): DictionaryValue<SendParameters> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeSendParameters(src)).endCell());
        },
        parse: (src) => {
            return loadSendParameters(src.loadRef().beginParse());
        }
    }
}

export type MessageParameters = {
    $$type: 'MessageParameters';
    mode: bigint;
    body: Cell | null;
    value: bigint;
    to: Address;
    bounce: boolean;
}

export function storeMessageParameters(src: MessageParameters) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeInt(src.mode, 257);
        if (src.body !== null && src.body !== undefined) { b_0.storeBit(true).storeRef(src.body); } else { b_0.storeBit(false); }
        b_0.storeInt(src.value, 257);
        b_0.storeAddress(src.to);
        b_0.storeBit(src.bounce);
    };
}

export function loadMessageParameters(slice: Slice) {
    const sc_0 = slice;
    const _mode = sc_0.loadIntBig(257);
    const _body = sc_0.loadBit() ? sc_0.loadRef() : null;
    const _value = sc_0.loadIntBig(257);
    const _to = sc_0.loadAddress();
    const _bounce = sc_0.loadBit();
    return { $$type: 'MessageParameters' as const, mode: _mode, body: _body, value: _value, to: _to, bounce: _bounce };
}

export function loadTupleMessageParameters(source: TupleReader) {
    const _mode = source.readBigNumber();
    const _body = source.readCellOpt();
    const _value = source.readBigNumber();
    const _to = source.readAddress();
    const _bounce = source.readBoolean();
    return { $$type: 'MessageParameters' as const, mode: _mode, body: _body, value: _value, to: _to, bounce: _bounce };
}

export function loadGetterTupleMessageParameters(source: TupleReader) {
    const _mode = source.readBigNumber();
    const _body = source.readCellOpt();
    const _value = source.readBigNumber();
    const _to = source.readAddress();
    const _bounce = source.readBoolean();
    return { $$type: 'MessageParameters' as const, mode: _mode, body: _body, value: _value, to: _to, bounce: _bounce };
}

export function storeTupleMessageParameters(source: MessageParameters) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.mode);
    builder.writeCell(source.body);
    builder.writeNumber(source.value);
    builder.writeAddress(source.to);
    builder.writeBoolean(source.bounce);
    return builder.build();
}

export function dictValueParserMessageParameters(): DictionaryValue<MessageParameters> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeMessageParameters(src)).endCell());
        },
        parse: (src) => {
            return loadMessageParameters(src.loadRef().beginParse());
        }
    }
}

export type DeployParameters = {
    $$type: 'DeployParameters';
    mode: bigint;
    body: Cell | null;
    value: bigint;
    bounce: boolean;
    init: StateInit;
}

export function storeDeployParameters(src: DeployParameters) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeInt(src.mode, 257);
        if (src.body !== null && src.body !== undefined) { b_0.storeBit(true).storeRef(src.body); } else { b_0.storeBit(false); }
        b_0.storeInt(src.value, 257);
        b_0.storeBit(src.bounce);
        b_0.store(storeStateInit(src.init));
    };
}

export function loadDeployParameters(slice: Slice) {
    const sc_0 = slice;
    const _mode = sc_0.loadIntBig(257);
    const _body = sc_0.loadBit() ? sc_0.loadRef() : null;
    const _value = sc_0.loadIntBig(257);
    const _bounce = sc_0.loadBit();
    const _init = loadStateInit(sc_0);
    return { $$type: 'DeployParameters' as const, mode: _mode, body: _body, value: _value, bounce: _bounce, init: _init };
}

export function loadTupleDeployParameters(source: TupleReader) {
    const _mode = source.readBigNumber();
    const _body = source.readCellOpt();
    const _value = source.readBigNumber();
    const _bounce = source.readBoolean();
    const _init = loadTupleStateInit(source);
    return { $$type: 'DeployParameters' as const, mode: _mode, body: _body, value: _value, bounce: _bounce, init: _init };
}

export function loadGetterTupleDeployParameters(source: TupleReader) {
    const _mode = source.readBigNumber();
    const _body = source.readCellOpt();
    const _value = source.readBigNumber();
    const _bounce = source.readBoolean();
    const _init = loadGetterTupleStateInit(source);
    return { $$type: 'DeployParameters' as const, mode: _mode, body: _body, value: _value, bounce: _bounce, init: _init };
}

export function storeTupleDeployParameters(source: DeployParameters) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.mode);
    builder.writeCell(source.body);
    builder.writeNumber(source.value);
    builder.writeBoolean(source.bounce);
    builder.writeTuple(storeTupleStateInit(source.init));
    return builder.build();
}

export function dictValueParserDeployParameters(): DictionaryValue<DeployParameters> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeDeployParameters(src)).endCell());
        },
        parse: (src) => {
            return loadDeployParameters(src.loadRef().beginParse());
        }
    }
}

export type StdAddress = {
    $$type: 'StdAddress';
    workchain: bigint;
    address: bigint;
}

export function storeStdAddress(src: StdAddress) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeInt(src.workchain, 8);
        b_0.storeUint(src.address, 256);
    };
}

export function loadStdAddress(slice: Slice) {
    const sc_0 = slice;
    const _workchain = sc_0.loadIntBig(8);
    const _address = sc_0.loadUintBig(256);
    return { $$type: 'StdAddress' as const, workchain: _workchain, address: _address };
}

export function loadTupleStdAddress(source: TupleReader) {
    const _workchain = source.readBigNumber();
    const _address = source.readBigNumber();
    return { $$type: 'StdAddress' as const, workchain: _workchain, address: _address };
}

export function loadGetterTupleStdAddress(source: TupleReader) {
    const _workchain = source.readBigNumber();
    const _address = source.readBigNumber();
    return { $$type: 'StdAddress' as const, workchain: _workchain, address: _address };
}

export function storeTupleStdAddress(source: StdAddress) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.workchain);
    builder.writeNumber(source.address);
    return builder.build();
}

export function dictValueParserStdAddress(): DictionaryValue<StdAddress> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeStdAddress(src)).endCell());
        },
        parse: (src) => {
            return loadStdAddress(src.loadRef().beginParse());
        }
    }
}

export type VarAddress = {
    $$type: 'VarAddress';
    workchain: bigint;
    address: Slice;
}

export function storeVarAddress(src: VarAddress) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeInt(src.workchain, 32);
        b_0.storeRef(src.address.asCell());
    };
}

export function loadVarAddress(slice: Slice) {
    const sc_0 = slice;
    const _workchain = sc_0.loadIntBig(32);
    const _address = sc_0.loadRef().asSlice();
    return { $$type: 'VarAddress' as const, workchain: _workchain, address: _address };
}

export function loadTupleVarAddress(source: TupleReader) {
    const _workchain = source.readBigNumber();
    const _address = source.readCell().asSlice();
    return { $$type: 'VarAddress' as const, workchain: _workchain, address: _address };
}

export function loadGetterTupleVarAddress(source: TupleReader) {
    const _workchain = source.readBigNumber();
    const _address = source.readCell().asSlice();
    return { $$type: 'VarAddress' as const, workchain: _workchain, address: _address };
}

export function storeTupleVarAddress(source: VarAddress) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.workchain);
    builder.writeSlice(source.address.asCell());
    return builder.build();
}

export function dictValueParserVarAddress(): DictionaryValue<VarAddress> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeVarAddress(src)).endCell());
        },
        parse: (src) => {
            return loadVarAddress(src.loadRef().beginParse());
        }
    }
}

export type BasechainAddress = {
    $$type: 'BasechainAddress';
    hash: bigint | null;
}

export function storeBasechainAddress(src: BasechainAddress) {
    return (builder: Builder) => {
        const b_0 = builder;
        if (src.hash !== null && src.hash !== undefined) { b_0.storeBit(true).storeInt(src.hash, 257); } else { b_0.storeBit(false); }
    };
}

export function loadBasechainAddress(slice: Slice) {
    const sc_0 = slice;
    const _hash = sc_0.loadBit() ? sc_0.loadIntBig(257) : null;
    return { $$type: 'BasechainAddress' as const, hash: _hash };
}

export function loadTupleBasechainAddress(source: TupleReader) {
    const _hash = source.readBigNumberOpt();
    return { $$type: 'BasechainAddress' as const, hash: _hash };
}

export function loadGetterTupleBasechainAddress(source: TupleReader) {
    const _hash = source.readBigNumberOpt();
    return { $$type: 'BasechainAddress' as const, hash: _hash };
}

export function storeTupleBasechainAddress(source: BasechainAddress) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.hash);
    return builder.build();
}

export function dictValueParserBasechainAddress(): DictionaryValue<BasechainAddress> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeBasechainAddress(src)).endCell());
        },
        parse: (src) => {
            return loadBasechainAddress(src.loadRef().beginParse());
        }
    }
}

export type ChangeOwner = {
    $$type: 'ChangeOwner';
    queryId: bigint;
    newOwner: Address;
}

export function storeChangeOwner(src: ChangeOwner) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(2174598809, 32);
        b_0.storeUint(src.queryId, 64);
        b_0.storeAddress(src.newOwner);
    };
}

export function loadChangeOwner(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 2174598809) { throw Error('Invalid prefix'); }
    const _queryId = sc_0.loadUintBig(64);
    const _newOwner = sc_0.loadAddress();
    return { $$type: 'ChangeOwner' as const, queryId: _queryId, newOwner: _newOwner };
}

export function loadTupleChangeOwner(source: TupleReader) {
    const _queryId = source.readBigNumber();
    const _newOwner = source.readAddress();
    return { $$type: 'ChangeOwner' as const, queryId: _queryId, newOwner: _newOwner };
}

export function loadGetterTupleChangeOwner(source: TupleReader) {
    const _queryId = source.readBigNumber();
    const _newOwner = source.readAddress();
    return { $$type: 'ChangeOwner' as const, queryId: _queryId, newOwner: _newOwner };
}

export function storeTupleChangeOwner(source: ChangeOwner) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.queryId);
    builder.writeAddress(source.newOwner);
    return builder.build();
}

export function dictValueParserChangeOwner(): DictionaryValue<ChangeOwner> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeChangeOwner(src)).endCell());
        },
        parse: (src) => {
            return loadChangeOwner(src.loadRef().beginParse());
        }
    }
}

export type ChangeOwnerOk = {
    $$type: 'ChangeOwnerOk';
    queryId: bigint;
    newOwner: Address;
}

export function storeChangeOwnerOk(src: ChangeOwnerOk) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(846932810, 32);
        b_0.storeUint(src.queryId, 64);
        b_0.storeAddress(src.newOwner);
    };
}

export function loadChangeOwnerOk(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 846932810) { throw Error('Invalid prefix'); }
    const _queryId = sc_0.loadUintBig(64);
    const _newOwner = sc_0.loadAddress();
    return { $$type: 'ChangeOwnerOk' as const, queryId: _queryId, newOwner: _newOwner };
}

export function loadTupleChangeOwnerOk(source: TupleReader) {
    const _queryId = source.readBigNumber();
    const _newOwner = source.readAddress();
    return { $$type: 'ChangeOwnerOk' as const, queryId: _queryId, newOwner: _newOwner };
}

export function loadGetterTupleChangeOwnerOk(source: TupleReader) {
    const _queryId = source.readBigNumber();
    const _newOwner = source.readAddress();
    return { $$type: 'ChangeOwnerOk' as const, queryId: _queryId, newOwner: _newOwner };
}

export function storeTupleChangeOwnerOk(source: ChangeOwnerOk) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.queryId);
    builder.writeAddress(source.newOwner);
    return builder.build();
}

export function dictValueParserChangeOwnerOk(): DictionaryValue<ChangeOwnerOk> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeChangeOwnerOk(src)).endCell());
        },
        parse: (src) => {
            return loadChangeOwnerOk(src.loadRef().beginParse());
        }
    }
}

export type MakeNewUser = {
    $$type: 'MakeNewUser';
    name: string;
    id: bigint;
}

export function storeMakeNewUser(src: MakeNewUser) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(3697970051, 32);
        b_0.storeStringRefTail(src.name);
        b_0.storeInt(src.id, 257);
    };
}

export function loadMakeNewUser(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 3697970051) { throw Error('Invalid prefix'); }
    const _name = sc_0.loadStringRefTail();
    const _id = sc_0.loadIntBig(257);
    return { $$type: 'MakeNewUser' as const, name: _name, id: _id };
}

export function loadTupleMakeNewUser(source: TupleReader) {
    const _name = source.readString();
    const _id = source.readBigNumber();
    return { $$type: 'MakeNewUser' as const, name: _name, id: _id };
}

export function loadGetterTupleMakeNewUser(source: TupleReader) {
    const _name = source.readString();
    const _id = source.readBigNumber();
    return { $$type: 'MakeNewUser' as const, name: _name, id: _id };
}

export function storeTupleMakeNewUser(source: MakeNewUser) {
    const builder = new TupleBuilder();
    builder.writeString(source.name);
    builder.writeNumber(source.id);
    return builder.build();
}

export function dictValueParserMakeNewUser(): DictionaryValue<MakeNewUser> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeMakeNewUser(src)).endCell());
        },
        parse: (src) => {
            return loadMakeNewUser(src.loadRef().beginParse());
        }
    }
}

export type ChangeUserData = {
    $$type: 'ChangeUserData';
    name: string;
    id: bigint;
    deliveryAddress: string;
}

export function storeChangeUserData(src: ChangeUserData) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(2132995444, 32);
        b_0.storeStringRefTail(src.name);
        b_0.storeInt(src.id, 257);
        b_0.storeStringRefTail(src.deliveryAddress);
    };
}

export function loadChangeUserData(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 2132995444) { throw Error('Invalid prefix'); }
    const _name = sc_0.loadStringRefTail();
    const _id = sc_0.loadIntBig(257);
    const _deliveryAddress = sc_0.loadStringRefTail();
    return { $$type: 'ChangeUserData' as const, name: _name, id: _id, deliveryAddress: _deliveryAddress };
}

export function loadTupleChangeUserData(source: TupleReader) {
    const _name = source.readString();
    const _id = source.readBigNumber();
    const _deliveryAddress = source.readString();
    return { $$type: 'ChangeUserData' as const, name: _name, id: _id, deliveryAddress: _deliveryAddress };
}

export function loadGetterTupleChangeUserData(source: TupleReader) {
    const _name = source.readString();
    const _id = source.readBigNumber();
    const _deliveryAddress = source.readString();
    return { $$type: 'ChangeUserData' as const, name: _name, id: _id, deliveryAddress: _deliveryAddress };
}

export function storeTupleChangeUserData(source: ChangeUserData) {
    const builder = new TupleBuilder();
    builder.writeString(source.name);
    builder.writeNumber(source.id);
    builder.writeString(source.deliveryAddress);
    return builder.build();
}

export function dictValueParserChangeUserData(): DictionaryValue<ChangeUserData> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeChangeUserData(src)).endCell());
        },
        parse: (src) => {
            return loadChangeUserData(src.loadRef().beginParse());
        }
    }
}

export type CreateShop = {
    $$type: 'CreateShop';
    shopName: string;
}

export function storeCreateShop(src: CreateShop) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(3325455170, 32);
        b_0.storeStringRefTail(src.shopName);
    };
}

export function loadCreateShop(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 3325455170) { throw Error('Invalid prefix'); }
    const _shopName = sc_0.loadStringRefTail();
    return { $$type: 'CreateShop' as const, shopName: _shopName };
}

export function loadTupleCreateShop(source: TupleReader) {
    const _shopName = source.readString();
    return { $$type: 'CreateShop' as const, shopName: _shopName };
}

export function loadGetterTupleCreateShop(source: TupleReader) {
    const _shopName = source.readString();
    return { $$type: 'CreateShop' as const, shopName: _shopName };
}

export function storeTupleCreateShop(source: CreateShop) {
    const builder = new TupleBuilder();
    builder.writeString(source.shopName);
    return builder.build();
}

export function dictValueParserCreateShop(): DictionaryValue<CreateShop> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeCreateShop(src)).endCell());
        },
        parse: (src) => {
            return loadCreateShop(src.loadRef().beginParse());
        }
    }
}

export type AddItem = {
    $$type: 'AddItem';
    isUnique: boolean;
    content: string;
    price: bigint;
}

export function storeAddItem(src: AddItem) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(4264890800, 32);
        b_0.storeBit(src.isUnique);
        b_0.storeStringRefTail(src.content);
        b_0.storeCoins(src.price);
    };
}

export function loadAddItem(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 4264890800) { throw Error('Invalid prefix'); }
    const _isUnique = sc_0.loadBit();
    const _content = sc_0.loadStringRefTail();
    const _price = sc_0.loadCoins();
    return { $$type: 'AddItem' as const, isUnique: _isUnique, content: _content, price: _price };
}

export function loadTupleAddItem(source: TupleReader) {
    const _isUnique = source.readBoolean();
    const _content = source.readString();
    const _price = source.readBigNumber();
    return { $$type: 'AddItem' as const, isUnique: _isUnique, content: _content, price: _price };
}

export function loadGetterTupleAddItem(source: TupleReader) {
    const _isUnique = source.readBoolean();
    const _content = source.readString();
    const _price = source.readBigNumber();
    return { $$type: 'AddItem' as const, isUnique: _isUnique, content: _content, price: _price };
}

export function storeTupleAddItem(source: AddItem) {
    const builder = new TupleBuilder();
    builder.writeBoolean(source.isUnique);
    builder.writeString(source.content);
    builder.writeNumber(source.price);
    return builder.build();
}

export function dictValueParserAddItem(): DictionaryValue<AddItem> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeAddItem(src)).endCell());
        },
        parse: (src) => {
            return loadAddItem(src.loadRef().beginParse());
        }
    }
}

export type NftTransfer = {
    $$type: 'NftTransfer';
    newOwner: Address;
    isSalable: boolean;
}

export function storeNftTransfer(src: NftTransfer) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(3656957868, 32);
        b_0.storeAddress(src.newOwner);
        b_0.storeBit(src.isSalable);
    };
}

export function loadNftTransfer(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 3656957868) { throw Error('Invalid prefix'); }
    const _newOwner = sc_0.loadAddress();
    const _isSalable = sc_0.loadBit();
    return { $$type: 'NftTransfer' as const, newOwner: _newOwner, isSalable: _isSalable };
}

export function loadTupleNftTransfer(source: TupleReader) {
    const _newOwner = source.readAddress();
    const _isSalable = source.readBoolean();
    return { $$type: 'NftTransfer' as const, newOwner: _newOwner, isSalable: _isSalable };
}

export function loadGetterTupleNftTransfer(source: TupleReader) {
    const _newOwner = source.readAddress();
    const _isSalable = source.readBoolean();
    return { $$type: 'NftTransfer' as const, newOwner: _newOwner, isSalable: _isSalable };
}

export function storeTupleNftTransfer(source: NftTransfer) {
    const builder = new TupleBuilder();
    builder.writeAddress(source.newOwner);
    builder.writeBoolean(source.isSalable);
    return builder.build();
}

export function dictValueParserNftTransfer(): DictionaryValue<NftTransfer> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeNftTransfer(src)).endCell());
        },
        parse: (src) => {
            return loadNftTransfer(src.loadRef().beginParse());
        }
    }
}

export type NftTransferNotification = {
    $$type: 'NftTransferNotification';
    itemIndex: bigint;
    oldOwner: Address;
    newOwner: Address;
}

export function storeNftTransferNotification(src: NftTransferNotification) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(1494705134, 32);
        b_0.storeInt(src.itemIndex, 257);
        b_0.storeAddress(src.oldOwner);
        b_0.storeAddress(src.newOwner);
    };
}

export function loadNftTransferNotification(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 1494705134) { throw Error('Invalid prefix'); }
    const _itemIndex = sc_0.loadIntBig(257);
    const _oldOwner = sc_0.loadAddress();
    const _newOwner = sc_0.loadAddress();
    return { $$type: 'NftTransferNotification' as const, itemIndex: _itemIndex, oldOwner: _oldOwner, newOwner: _newOwner };
}

export function loadTupleNftTransferNotification(source: TupleReader) {
    const _itemIndex = source.readBigNumber();
    const _oldOwner = source.readAddress();
    const _newOwner = source.readAddress();
    return { $$type: 'NftTransferNotification' as const, itemIndex: _itemIndex, oldOwner: _oldOwner, newOwner: _newOwner };
}

export function loadGetterTupleNftTransferNotification(source: TupleReader) {
    const _itemIndex = source.readBigNumber();
    const _oldOwner = source.readAddress();
    const _newOwner = source.readAddress();
    return { $$type: 'NftTransferNotification' as const, itemIndex: _itemIndex, oldOwner: _oldOwner, newOwner: _newOwner };
}

export function storeTupleNftTransferNotification(source: NftTransferNotification) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.itemIndex);
    builder.writeAddress(source.oldOwner);
    builder.writeAddress(source.newOwner);
    return builder.build();
}

export function dictValueParserNftTransferNotification(): DictionaryValue<NftTransferNotification> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeNftTransferNotification(src)).endCell());
        },
        parse: (src) => {
            return loadNftTransferNotification(src.loadRef().beginParse());
        }
    }
}

export type CreateOrder = {
    $$type: 'CreateOrder';
    itemAddress: Address;
    deliveryAddress: string;
    price: bigint;
}

export function storeCreateOrder(src: CreateOrder) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(2059487624, 32);
        b_0.storeAddress(src.itemAddress);
        b_0.storeStringRefTail(src.deliveryAddress);
        b_0.storeCoins(src.price);
    };
}

export function loadCreateOrder(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 2059487624) { throw Error('Invalid prefix'); }
    const _itemAddress = sc_0.loadAddress();
    const _deliveryAddress = sc_0.loadStringRefTail();
    const _price = sc_0.loadCoins();
    return { $$type: 'CreateOrder' as const, itemAddress: _itemAddress, deliveryAddress: _deliveryAddress, price: _price };
}

export function loadTupleCreateOrder(source: TupleReader) {
    const _itemAddress = source.readAddress();
    const _deliveryAddress = source.readString();
    const _price = source.readBigNumber();
    return { $$type: 'CreateOrder' as const, itemAddress: _itemAddress, deliveryAddress: _deliveryAddress, price: _price };
}

export function loadGetterTupleCreateOrder(source: TupleReader) {
    const _itemAddress = source.readAddress();
    const _deliveryAddress = source.readString();
    const _price = source.readBigNumber();
    return { $$type: 'CreateOrder' as const, itemAddress: _itemAddress, deliveryAddress: _deliveryAddress, price: _price };
}

export function storeTupleCreateOrder(source: CreateOrder) {
    const builder = new TupleBuilder();
    builder.writeAddress(source.itemAddress);
    builder.writeString(source.deliveryAddress);
    builder.writeNumber(source.price);
    return builder.build();
}

export function dictValueParserCreateOrder(): DictionaryValue<CreateOrder> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeCreateOrder(src)).endCell());
        },
        parse: (src) => {
            return loadCreateOrder(src.loadRef().beginParse());
        }
    }
}

export type SetPrice = {
    $$type: 'SetPrice';
    newPrice: bigint;
    isSalable: boolean;
}

export function storeSetPrice(src: SetPrice) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(2607803010, 32);
        b_0.storeCoins(src.newPrice);
        b_0.storeBit(src.isSalable);
    };
}

export function loadSetPrice(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 2607803010) { throw Error('Invalid prefix'); }
    const _newPrice = sc_0.loadCoins();
    const _isSalable = sc_0.loadBit();
    return { $$type: 'SetPrice' as const, newPrice: _newPrice, isSalable: _isSalable };
}

export function loadTupleSetPrice(source: TupleReader) {
    const _newPrice = source.readBigNumber();
    const _isSalable = source.readBoolean();
    return { $$type: 'SetPrice' as const, newPrice: _newPrice, isSalable: _isSalable };
}

export function loadGetterTupleSetPrice(source: TupleReader) {
    const _newPrice = source.readBigNumber();
    const _isSalable = source.readBoolean();
    return { $$type: 'SetPrice' as const, newPrice: _newPrice, isSalable: _isSalable };
}

export function storeTupleSetPrice(source: SetPrice) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.newPrice);
    builder.writeBoolean(source.isSalable);
    return builder.build();
}

export function dictValueParserSetPrice(): DictionaryValue<SetPrice> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeSetPrice(src)).endCell());
        },
        parse: (src) => {
            return loadSetPrice(src.loadRef().beginParse());
        }
    }
}

export type SetUniqueItemPrice = {
    $$type: 'SetUniqueItemPrice';
    uniqueItem: Address;
    newPrice: bigint;
}

export function storeSetUniqueItemPrice(src: SetUniqueItemPrice) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(3295669463, 32);
        b_0.storeAddress(src.uniqueItem);
        b_0.storeCoins(src.newPrice);
    };
}

export function loadSetUniqueItemPrice(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 3295669463) { throw Error('Invalid prefix'); }
    const _uniqueItem = sc_0.loadAddress();
    const _newPrice = sc_0.loadCoins();
    return { $$type: 'SetUniqueItemPrice' as const, uniqueItem: _uniqueItem, newPrice: _newPrice };
}

export function loadTupleSetUniqueItemPrice(source: TupleReader) {
    const _uniqueItem = source.readAddress();
    const _newPrice = source.readBigNumber();
    return { $$type: 'SetUniqueItemPrice' as const, uniqueItem: _uniqueItem, newPrice: _newPrice };
}

export function loadGetterTupleSetUniqueItemPrice(source: TupleReader) {
    const _uniqueItem = source.readAddress();
    const _newPrice = source.readBigNumber();
    return { $$type: 'SetUniqueItemPrice' as const, uniqueItem: _uniqueItem, newPrice: _newPrice };
}

export function storeTupleSetUniqueItemPrice(source: SetUniqueItemPrice) {
    const builder = new TupleBuilder();
    builder.writeAddress(source.uniqueItem);
    builder.writeNumber(source.newPrice);
    return builder.build();
}

export function dictValueParserSetUniqueItemPrice(): DictionaryValue<SetUniqueItemPrice> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeSetUniqueItemPrice(src)).endCell());
        },
        parse: (src) => {
            return loadSetUniqueItemPrice(src.loadRef().beginParse());
        }
    }
}

export type GetPrice = {
    $$type: 'GetPrice';
}

export function storeGetPrice(src: GetPrice) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(4257557621, 32);
    };
}

export function loadGetPrice(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 4257557621) { throw Error('Invalid prefix'); }
    return { $$type: 'GetPrice' as const };
}

export function loadTupleGetPrice(source: TupleReader) {
    return { $$type: 'GetPrice' as const };
}

export function loadGetterTupleGetPrice(source: TupleReader) {
    return { $$type: 'GetPrice' as const };
}

export function storeTupleGetPrice(source: GetPrice) {
    const builder = new TupleBuilder();
    return builder.build();
}

export function dictValueParserGetPrice(): DictionaryValue<GetPrice> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeGetPrice(src)).endCell());
        },
        parse: (src) => {
            return loadGetPrice(src.loadRef().beginParse());
        }
    }
}

export type GetPriceResponse = {
    $$type: 'GetPriceResponse';
    price: bigint;
}

export function storeGetPriceResponse(src: GetPriceResponse) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(2090181116, 32);
        b_0.storeCoins(src.price);
    };
}

export function loadGetPriceResponse(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 2090181116) { throw Error('Invalid prefix'); }
    const _price = sc_0.loadCoins();
    return { $$type: 'GetPriceResponse' as const, price: _price };
}

export function loadTupleGetPriceResponse(source: TupleReader) {
    const _price = source.readBigNumber();
    return { $$type: 'GetPriceResponse' as const, price: _price };
}

export function loadGetterTupleGetPriceResponse(source: TupleReader) {
    const _price = source.readBigNumber();
    return { $$type: 'GetPriceResponse' as const, price: _price };
}

export function storeTupleGetPriceResponse(source: GetPriceResponse) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.price);
    return builder.build();
}

export function dictValueParserGetPriceResponse(): DictionaryValue<GetPriceResponse> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeGetPriceResponse(src)).endCell());
        },
        parse: (src) => {
            return loadGetPriceResponse(src.loadRef().beginParse());
        }
    }
}

export type NftTransferSuccess = {
    $$type: 'NftTransferSuccess';
}

export function storeNftTransferSuccess(src: NftTransferSuccess) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(3873930432, 32);
    };
}

export function loadNftTransferSuccess(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 3873930432) { throw Error('Invalid prefix'); }
    return { $$type: 'NftTransferSuccess' as const };
}

export function loadTupleNftTransferSuccess(source: TupleReader) {
    return { $$type: 'NftTransferSuccess' as const };
}

export function loadGetterTupleNftTransferSuccess(source: TupleReader) {
    return { $$type: 'NftTransferSuccess' as const };
}

export function storeTupleNftTransferSuccess(source: NftTransferSuccess) {
    const builder = new TupleBuilder();
    return builder.build();
}

export function dictValueParserNftTransferSuccess(): DictionaryValue<NftTransferSuccess> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeNftTransferSuccess(src)).endCell());
        },
        parse: (src) => {
            return loadNftTransferSuccess(src.loadRef().beginParse());
        }
    }
}

export type OrderCompleted = {
    $$type: 'OrderCompleted';
    orderIndex: bigint;
    itemAddress: Address;
    buyer: Address;
}

export function storeOrderCompleted(src: OrderCompleted) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(2570985173, 32);
        b_0.storeInt(src.orderIndex, 257);
        b_0.storeAddress(src.itemAddress);
        b_0.storeAddress(src.buyer);
    };
}

export function loadOrderCompleted(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 2570985173) { throw Error('Invalid prefix'); }
    const _orderIndex = sc_0.loadIntBig(257);
    const _itemAddress = sc_0.loadAddress();
    const _buyer = sc_0.loadAddress();
    return { $$type: 'OrderCompleted' as const, orderIndex: _orderIndex, itemAddress: _itemAddress, buyer: _buyer };
}

export function loadTupleOrderCompleted(source: TupleReader) {
    const _orderIndex = source.readBigNumber();
    const _itemAddress = source.readAddress();
    const _buyer = source.readAddress();
    return { $$type: 'OrderCompleted' as const, orderIndex: _orderIndex, itemAddress: _itemAddress, buyer: _buyer };
}

export function loadGetterTupleOrderCompleted(source: TupleReader) {
    const _orderIndex = source.readBigNumber();
    const _itemAddress = source.readAddress();
    const _buyer = source.readAddress();
    return { $$type: 'OrderCompleted' as const, orderIndex: _orderIndex, itemAddress: _itemAddress, buyer: _buyer };
}

export function storeTupleOrderCompleted(source: OrderCompleted) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.orderIndex);
    builder.writeAddress(source.itemAddress);
    builder.writeAddress(source.buyer);
    return builder.build();
}

export function dictValueParserOrderCompleted(): DictionaryValue<OrderCompleted> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeOrderCompleted(src)).endCell());
        },
        parse: (src) => {
            return loadOrderCompleted(src.loadRef().beginParse());
        }
    }
}

export type MakeOrder = {
    $$type: 'MakeOrder';
    itemAddress: Address;
    price: bigint;
}

export function storeMakeOrder(src: MakeOrder) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(1975255782, 32);
        b_0.storeAddress(src.itemAddress);
        b_0.storeCoins(src.price);
    };
}

export function loadMakeOrder(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 1975255782) { throw Error('Invalid prefix'); }
    const _itemAddress = sc_0.loadAddress();
    const _price = sc_0.loadCoins();
    return { $$type: 'MakeOrder' as const, itemAddress: _itemAddress, price: _price };
}

export function loadTupleMakeOrder(source: TupleReader) {
    const _itemAddress = source.readAddress();
    const _price = source.readBigNumber();
    return { $$type: 'MakeOrder' as const, itemAddress: _itemAddress, price: _price };
}

export function loadGetterTupleMakeOrder(source: TupleReader) {
    const _itemAddress = source.readAddress();
    const _price = source.readBigNumber();
    return { $$type: 'MakeOrder' as const, itemAddress: _itemAddress, price: _price };
}

export function storeTupleMakeOrder(source: MakeOrder) {
    const builder = new TupleBuilder();
    builder.writeAddress(source.itemAddress);
    builder.writeNumber(source.price);
    return builder.build();
}

export function dictValueParserMakeOrder(): DictionaryValue<MakeOrder> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeMakeOrder(src)).endCell());
        },
        parse: (src) => {
            return loadMakeOrder(src.loadRef().beginParse());
        }
    }
}

export type NewOrder = {
    $$type: 'NewOrder';
    deliveryAddress: string;
    itemIndex: bigint;
    price: bigint;
}

export function storeNewOrder(src: NewOrder) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(2418445873, 32);
        b_0.storeStringRefTail(src.deliveryAddress);
        b_0.storeUint(src.itemIndex, 256);
        b_0.storeCoins(src.price);
    };
}

export function loadNewOrder(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 2418445873) { throw Error('Invalid prefix'); }
    const _deliveryAddress = sc_0.loadStringRefTail();
    const _itemIndex = sc_0.loadUintBig(256);
    const _price = sc_0.loadCoins();
    return { $$type: 'NewOrder' as const, deliveryAddress: _deliveryAddress, itemIndex: _itemIndex, price: _price };
}

export function loadTupleNewOrder(source: TupleReader) {
    const _deliveryAddress = source.readString();
    const _itemIndex = source.readBigNumber();
    const _price = source.readBigNumber();
    return { $$type: 'NewOrder' as const, deliveryAddress: _deliveryAddress, itemIndex: _itemIndex, price: _price };
}

export function loadGetterTupleNewOrder(source: TupleReader) {
    const _deliveryAddress = source.readString();
    const _itemIndex = source.readBigNumber();
    const _price = source.readBigNumber();
    return { $$type: 'NewOrder' as const, deliveryAddress: _deliveryAddress, itemIndex: _itemIndex, price: _price };
}

export function storeTupleNewOrder(source: NewOrder) {
    const builder = new TupleBuilder();
    builder.writeString(source.deliveryAddress);
    builder.writeNumber(source.itemIndex);
    builder.writeNumber(source.price);
    return builder.build();
}

export function dictValueParserNewOrder(): DictionaryValue<NewOrder> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeNewOrder(src)).endCell());
        },
        parse: (src) => {
            return loadNewOrder(src.loadRef().beginParse());
        }
    }
}

export type UpdateShopInfo = {
    $$type: 'UpdateShopInfo';
    shopName: string;
    shopId: bigint;
    uniqueItemsCount: bigint;
    ordersCount: bigint;
}

export function storeUpdateShopInfo(src: UpdateShopInfo) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(536542312, 32);
        b_0.storeStringRefTail(src.shopName);
        b_0.storeUint(src.shopId, 256);
        b_0.storeUint(src.uniqueItemsCount, 256);
        b_0.storeUint(src.ordersCount, 256);
    };
}

export function loadUpdateShopInfo(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 536542312) { throw Error('Invalid prefix'); }
    const _shopName = sc_0.loadStringRefTail();
    const _shopId = sc_0.loadUintBig(256);
    const _uniqueItemsCount = sc_0.loadUintBig(256);
    const _ordersCount = sc_0.loadUintBig(256);
    return { $$type: 'UpdateShopInfo' as const, shopName: _shopName, shopId: _shopId, uniqueItemsCount: _uniqueItemsCount, ordersCount: _ordersCount };
}

export function loadTupleUpdateShopInfo(source: TupleReader) {
    const _shopName = source.readString();
    const _shopId = source.readBigNumber();
    const _uniqueItemsCount = source.readBigNumber();
    const _ordersCount = source.readBigNumber();
    return { $$type: 'UpdateShopInfo' as const, shopName: _shopName, shopId: _shopId, uniqueItemsCount: _uniqueItemsCount, ordersCount: _ordersCount };
}

export function loadGetterTupleUpdateShopInfo(source: TupleReader) {
    const _shopName = source.readString();
    const _shopId = source.readBigNumber();
    const _uniqueItemsCount = source.readBigNumber();
    const _ordersCount = source.readBigNumber();
    return { $$type: 'UpdateShopInfo' as const, shopName: _shopName, shopId: _shopId, uniqueItemsCount: _uniqueItemsCount, ordersCount: _ordersCount };
}

export function storeTupleUpdateShopInfo(source: UpdateShopInfo) {
    const builder = new TupleBuilder();
    builder.writeString(source.shopName);
    builder.writeNumber(source.shopId);
    builder.writeNumber(source.uniqueItemsCount);
    builder.writeNumber(source.ordersCount);
    return builder.build();
}

export function dictValueParserUpdateShopInfo(): DictionaryValue<UpdateShopInfo> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeUpdateShopInfo(src)).endCell());
        },
        parse: (src) => {
            return loadUpdateShopInfo(src.loadRef().beginParse());
        }
    }
}

export type UniqueItem$Data = {
    $$type: 'UniqueItem$Data';
    shop: Address;
    owner: Address;
    content: string;
    index: bigint;
    price: bigint;
    isSalable: boolean;
}

export function storeUniqueItem$Data(src: UniqueItem$Data) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeAddress(src.shop);
        b_0.storeAddress(src.owner);
        b_0.storeStringRefTail(src.content);
        b_0.storeUint(src.index, 256);
        b_0.storeCoins(src.price);
        b_0.storeBit(src.isSalable);
    };
}

export function loadUniqueItem$Data(slice: Slice) {
    const sc_0 = slice;
    const _shop = sc_0.loadAddress();
    const _owner = sc_0.loadAddress();
    const _content = sc_0.loadStringRefTail();
    const _index = sc_0.loadUintBig(256);
    const _price = sc_0.loadCoins();
    const _isSalable = sc_0.loadBit();
    return { $$type: 'UniqueItem$Data' as const, shop: _shop, owner: _owner, content: _content, index: _index, price: _price, isSalable: _isSalable };
}

export function loadTupleUniqueItem$Data(source: TupleReader) {
    const _shop = source.readAddress();
    const _owner = source.readAddress();
    const _content = source.readString();
    const _index = source.readBigNumber();
    const _price = source.readBigNumber();
    const _isSalable = source.readBoolean();
    return { $$type: 'UniqueItem$Data' as const, shop: _shop, owner: _owner, content: _content, index: _index, price: _price, isSalable: _isSalable };
}

export function loadGetterTupleUniqueItem$Data(source: TupleReader) {
    const _shop = source.readAddress();
    const _owner = source.readAddress();
    const _content = source.readString();
    const _index = source.readBigNumber();
    const _price = source.readBigNumber();
    const _isSalable = source.readBoolean();
    return { $$type: 'UniqueItem$Data' as const, shop: _shop, owner: _owner, content: _content, index: _index, price: _price, isSalable: _isSalable };
}

export function storeTupleUniqueItem$Data(source: UniqueItem$Data) {
    const builder = new TupleBuilder();
    builder.writeAddress(source.shop);
    builder.writeAddress(source.owner);
    builder.writeString(source.content);
    builder.writeNumber(source.index);
    builder.writeNumber(source.price);
    builder.writeBoolean(source.isSalable);
    return builder.build();
}

export function dictValueParserUniqueItem$Data(): DictionaryValue<UniqueItem$Data> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeUniqueItem$Data(src)).endCell());
        },
        parse: (src) => {
            return loadUniqueItem$Data(src.loadRef().beginParse());
        }
    }
}

export type Order$Data = {
    $$type: 'Order$Data';
    seller: Address;
    buyer: Address;
    itemAddress: Address;
    id: bigint;
    price: bigint;
    priceSetted: boolean;
    completed: boolean;
    refunded: boolean;
}

export function storeOrder$Data(src: Order$Data) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeAddress(src.seller);
        b_0.storeAddress(src.buyer);
        b_0.storeAddress(src.itemAddress);
        const b_1 = new Builder();
        b_1.storeUint(src.id, 256);
        b_1.storeCoins(src.price);
        b_1.storeBit(src.priceSetted);
        b_1.storeBit(src.completed);
        b_1.storeBit(src.refunded);
        b_0.storeRef(b_1.endCell());
    };
}

export function loadOrder$Data(slice: Slice) {
    const sc_0 = slice;
    const _seller = sc_0.loadAddress();
    const _buyer = sc_0.loadAddress();
    const _itemAddress = sc_0.loadAddress();
    const sc_1 = sc_0.loadRef().beginParse();
    const _id = sc_1.loadUintBig(256);
    const _price = sc_1.loadCoins();
    const _priceSetted = sc_1.loadBit();
    const _completed = sc_1.loadBit();
    const _refunded = sc_1.loadBit();
    return { $$type: 'Order$Data' as const, seller: _seller, buyer: _buyer, itemAddress: _itemAddress, id: _id, price: _price, priceSetted: _priceSetted, completed: _completed, refunded: _refunded };
}

export function loadTupleOrder$Data(source: TupleReader) {
    const _seller = source.readAddress();
    const _buyer = source.readAddress();
    const _itemAddress = source.readAddress();
    const _id = source.readBigNumber();
    const _price = source.readBigNumber();
    const _priceSetted = source.readBoolean();
    const _completed = source.readBoolean();
    const _refunded = source.readBoolean();
    return { $$type: 'Order$Data' as const, seller: _seller, buyer: _buyer, itemAddress: _itemAddress, id: _id, price: _price, priceSetted: _priceSetted, completed: _completed, refunded: _refunded };
}

export function loadGetterTupleOrder$Data(source: TupleReader) {
    const _seller = source.readAddress();
    const _buyer = source.readAddress();
    const _itemAddress = source.readAddress();
    const _id = source.readBigNumber();
    const _price = source.readBigNumber();
    const _priceSetted = source.readBoolean();
    const _completed = source.readBoolean();
    const _refunded = source.readBoolean();
    return { $$type: 'Order$Data' as const, seller: _seller, buyer: _buyer, itemAddress: _itemAddress, id: _id, price: _price, priceSetted: _priceSetted, completed: _completed, refunded: _refunded };
}

export function storeTupleOrder$Data(source: Order$Data) {
    const builder = new TupleBuilder();
    builder.writeAddress(source.seller);
    builder.writeAddress(source.buyer);
    builder.writeAddress(source.itemAddress);
    builder.writeNumber(source.id);
    builder.writeNumber(source.price);
    builder.writeBoolean(source.priceSetted);
    builder.writeBoolean(source.completed);
    builder.writeBoolean(source.refunded);
    return builder.build();
}

export function dictValueParserOrder$Data(): DictionaryValue<Order$Data> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeOrder$Data(src)).endCell());
        },
        parse: (src) => {
            return loadOrder$Data(src.loadRef().beginParse());
        }
    }
}

export type Shop$Data = {
    $$type: 'Shop$Data';
    owner: Address;
    name: string;
    uniqueItemsCount: bigint;
    shopId: bigint;
    ordersCount: bigint;
    balance: bigint;
}

export function storeShop$Data(src: Shop$Data) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeAddress(src.owner);
        b_0.storeStringRefTail(src.name);
        b_0.storeUint(src.uniqueItemsCount, 256);
        b_0.storeUint(src.shopId, 256);
        const b_1 = new Builder();
        b_1.storeUint(src.ordersCount, 256);
        b_1.storeCoins(src.balance);
        b_0.storeRef(b_1.endCell());
    };
}

export function loadShop$Data(slice: Slice) {
    const sc_0 = slice;
    const _owner = sc_0.loadAddress();
    const _name = sc_0.loadStringRefTail();
    const _uniqueItemsCount = sc_0.loadUintBig(256);
    const _shopId = sc_0.loadUintBig(256);
    const sc_1 = sc_0.loadRef().beginParse();
    const _ordersCount = sc_1.loadUintBig(256);
    const _balance = sc_1.loadCoins();
    return { $$type: 'Shop$Data' as const, owner: _owner, name: _name, uniqueItemsCount: _uniqueItemsCount, shopId: _shopId, ordersCount: _ordersCount, balance: _balance };
}

export function loadTupleShop$Data(source: TupleReader) {
    const _owner = source.readAddress();
    const _name = source.readString();
    const _uniqueItemsCount = source.readBigNumber();
    const _shopId = source.readBigNumber();
    const _ordersCount = source.readBigNumber();
    const _balance = source.readBigNumber();
    return { $$type: 'Shop$Data' as const, owner: _owner, name: _name, uniqueItemsCount: _uniqueItemsCount, shopId: _shopId, ordersCount: _ordersCount, balance: _balance };
}

export function loadGetterTupleShop$Data(source: TupleReader) {
    const _owner = source.readAddress();
    const _name = source.readString();
    const _uniqueItemsCount = source.readBigNumber();
    const _shopId = source.readBigNumber();
    const _ordersCount = source.readBigNumber();
    const _balance = source.readBigNumber();
    return { $$type: 'Shop$Data' as const, owner: _owner, name: _name, uniqueItemsCount: _uniqueItemsCount, shopId: _shopId, ordersCount: _ordersCount, balance: _balance };
}

export function storeTupleShop$Data(source: Shop$Data) {
    const builder = new TupleBuilder();
    builder.writeAddress(source.owner);
    builder.writeString(source.name);
    builder.writeNumber(source.uniqueItemsCount);
    builder.writeNumber(source.shopId);
    builder.writeNumber(source.ordersCount);
    builder.writeNumber(source.balance);
    return builder.build();
}

export function dictValueParserShop$Data(): DictionaryValue<Shop$Data> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeShop$Data(src)).endCell());
        },
        parse: (src) => {
            return loadShop$Data(src.loadRef().beginParse());
        }
    }
}

 type Shop_init_args = {
    $$type: 'Shop_init_args';
    owner: Address;
}

function initShop_init_args(src: Shop_init_args) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeAddress(src.owner);
    };
}

async function Shop_init(owner: Address) {
    const __code = Cell.fromHex('b5ee9c7241023801000c24000228ff008e88f4a413f4bcf2c80bed5320e303ed43d90109020271020602012003040189b83d5ed44d0d200018e1cfa40d401d001d3ffd3ffd401d0d3fffa003010261025102410236c168e15fa400101d1708b873686f704e616d6587153220304e25515db3c6c6280d0185b851ded44d0d200018e1cfa40d401d001d3ffd3ffd401d0d3fffa003010261025102410236c168e15fa400101d1708b873686f704e616d6587153220304e2db3c6c618050002250201e907080188aa3bed44d0d200018e1cfa40d401d001d3ffd3ffd401d0d3fffa003010261025102410236c168e15fa400101d1708b873686f704e616d6587153220304e25525db3c6c622c0184aabbed44d0d200018e1cfa40d401d001d3ffd3ffd401d0d3fffa003010261025102410236c168e15fa400101d1708b873686f704e616d6587153220304e2db3c6c611603f83001d072d721d200d200fa4021103450666f04f86102f862ed44d0d200018e1cfa40d401d001d3ffd3ffd401d0d3fffa003010261025102410236c168e15fa400101d1708b873686f704e616d6587153220304e207925f07e005d70d1ff2e0822182101ffafc68bae302218210fe3511b0bae302218210c46fecd7ba0a0b250064365f0401d401d001d3ffd3ffd3ff301045500304c87f01ca0055505056ce03c8ce13cdcbffcbff01c8cbff58fa02cdc9ed54026c31d200d431fa00305067db3c069136e30d01a41035443302c87f01ca0055505056ce03c8ce13cdcbffcbff01c8cbff58fa02cdc9ed54260c03fef828231067050610344013db3c5c705920f90022f9005ad76501d76582020134c8cb17cb0fcb0fcbffcbff71f90400c87401cb0212ca07cbffc9d08209312d000a7fc85982109b6fea825003cb1f01fa02ca00c9141a43307050457fc8cf8580ca00cf8440ce01fa028069cf40025c6e016eb0935bcf818ae2f400c901fb000d232403dcc86f00016f8c6d6f8c8d075a1d1d1c1cce8bcbdcdbdb594b5a9cdbdb8b599a5b194b98dbdb4bda5920db3c218e22c821c10098802d01cb0701a301de019a7aa90ca630541220c000e63068a592cb07e4da11c9d0db3cf828016f2201c993216eb396016f2259ccc9e831d012db3c0e0e0f00b620d74a21d7499720c20022c200b18e48036f22807f22cf31ab02a105ab025155b60820c2009a20aa0215d71803ce4014de596f025341a1c20099c8016f025044a1aa028e123133c20099d430d020d74a21d749927020e2e2e85f03012c88c87001ca0055315034cece810101cf0001c8cecdc9100228ff008e88f4a413f4bcf2c80bed5320e303ed43d9111c020271121702012013150175b86c3ed44d0d200018e12fa40fa40d401d001d3fffa00d20055506c168e17fa40fa40810101d700d401d014433004d1550243007070e2db3c6c618140002220175b851ded44d0d200018e12fa40fa40d401d001d3fffa00d20055506c168e17fa40fa40810101d700d401d014433004d1550243007070e2db3c6c6181600022402016a181a0175b277bb51343480006384be903e903500740074fffe80348015541b05a385fe903e9020404075c03500740510cc0134554090c01c1c38b6cf1b1860190002230175b146fb51343480006384be903e903500740074fffe80348015541b05a385fe903e9020404075c03500740510cc0134554090c01c1c38b6cf1b18601b00022103f63001d072d721d200d200fa4021103450666f04f86102f862ed44d0d200018e12fa40fa40d401d001d3fffa00d20055506c168e17fa40fa40810101d700d401d014433004d1550243007070e207925f07e07026d74920c21f953106d31f07de218210fdc52c75bae3022182109b6fea82bae302218210d9f8bfacba1d1e1f00e45b358200803326f2f4f84270804027c80182107c95a1fc58cb1f01fa02c95a6d6d40037fc8cf8580ca00cf8440ce01fa028069cf40025c6e016eb0935bcf819d58cf8680cf8480f400f400cf81e2f400c901fb0010355512c87f01ca0055505056ce13ce01c8cecdcbff01fa02ca00c9ed5402a25b05fa00d200305067db3c5b8810461035443012f8427f705003804201503304c8cf8580ca00cf8440ce01fa02806acf40f400c901fb00c87f01ca0055505056ce13ce01c8cecdcbff01fa02ca00c9ed54202703c48f505b05fa40d200305067db3c3033881046443012f8427f705003804201503304c8cf8580ca00cf8440ce01fa02806acf40f400c901fb00c87f01ca0055505056ce13ce01c8cecdcbff01fa02ca00c9ed54e037c00006c12116b0e3025f06f2c0822021220010f84225c705f2e084003200000000556e697175654974656d207472616e736665726564005cf842c8cf8508ce70cf0b6ec98042fb0010355512c87f01ca0055505056ce13ce01c8cecdcbff01fa02ca00c9ed54001a58cf8680cf8480f400f400cf810004554004e28fe631fa40fa00305067db3c8209312d0072097fc85982109b6fea825003cb1f01fa02ca00c9103841905a6d6d40037fc8cf8580ca00cf8440ce01fa028069cf40025c6e016eb0935bcf819d58cf8680cf8480f400f400cf81e2f400c901fb008810461035443012e02182107ac14988ba262728290010f84226c705f2e0840020000000005072696365207365747465640082f8427f705003804201503304c8cf8580ca00cf8440ce01fa02806acf40f400c901fb00c87f01ca0055505056ce03c8ce13cdcbffcbff01c8cbff58fa02cdc9ed5403f8e302218210993e1ed5ba8eee31810101d700fa40fa40301068105710461035103401db3c01815fe202705920f90022f9005ad76501d76582020134c8cb17cb0fcb0fcbffcbff71f90400c87401cb0212ca07cbffc9d0f842c705f2f4c87f01ca0055505056ce03c8ce13cdcbffcbff01c8cbff58fa02cdc9ed54e0012a2c3702fc31fa40d431fa0030f828f842280304db3c5c705920f90022f9005ad76501d76582020134c8cb17cb0fcb0fcbffcbff71f90400c87401cb0212ca07cbffc9d04313720210246d4144037fc8cf8580ca00cf8440ce01fa028069cf40025c6e016eb0935bcf819d58cf8680cf8480f400f400cf81e2f400c901fb0004a410352d2b00404403c87f01ca0055505056ce03c8ce13cdcbffcbff01c8cbff58fa02cdc9ed54011031f828f82858db3c2d012c88c87001ca0055315034810101cf00cece01c8cecdc92e04feff00208ffa30eda2edfb01d072d721d200d200fa4021103450666f04f86102f862ed44d0d200018e1cfa40fa40fa40d401d0d3fffa00d200d200d200301058105710566c188e1c810101d700fa40fa40d401d0fa403014433004d15502550270707070e209925f09e07028d74920c21fe30001c00001c121b0e30207f901202f30313600963108d31f2182107c95a1fcba8e3b31323731fa003081114df84224c705f2f4104655137f59c87f01ca0055705078ce15ce13ce01c8cbff58fa0212ca0012ca0012ca00cdc9ed54db31e009006e37f842c8cf8508ce70cf0b6ec98042fb0010575514c87f01ca0055705078ce15ce13ce01c8cbff58fa0212ca0012ca0012ca00cdc9ed5402a282f020911b7858fac39d5cefcdb79e3fd94061efd2894ea81e3681d69d669a4b89d8bae302380782f0d4a4b54243b00b8b0fd3409d46333008e9ad093eceec5c78e7900972bea36532bae3025f07f2c082323401f630814c6107b317f2f481600e26f2f48200b637f8416f24135f0322bef2f4816a9327f2f482100bebc2002470c8598210d9f8bfac5003cb1fceca00c92459706d50426d50427fc8cf8580ca00cf8440ce01fa028069cf40025c6e016eb0935bcf819d58cf8680cf8480f400f400cf81e2f400c901fb0054713201c83300f055208210993e1ed55004cb1f12810101cf00cecec9546520706d50426d50427fc8cf8580ca00cf8440ce01fa028069cf40025c6e016eb0935bcf819d58cf8680cf8480f400f400cf81e2f400c901fb00104655137f01c87f01ca0055705078ce15ce13ce01c8cbff58fa0212ca0012ca0012ca00cdc9ed5401be817ef5f84226c705f2f482100bebc2002470c8598210d9f8bfac5003cb1fceca00c92459706d50426d50427fc8cf8580ca00cf8440ce01fa028069cf40025c6e016eb0935bcf819d58cf8680cf8480f400f400cf81e2f400c901fb0055147f350044c87f01ca0055705078ce15ce13ce01c8cbff58fa0212ca0012ca0012ca00cdc9ed540008e1f2c80b0078821090268e31ba8e2dd431d3ff31fa003016a01035443012c87f01ca0055505056ce03c8ce13cdcbffcbff01c8cbff58fa02cdc9ed54e05f07f2c082d2b3b689');
    const builder = beginCell();
    builder.storeUint(0, 1);
    initShop_init_args({ $$type: 'Shop_init_args', owner })(builder);
    const __data = builder.endCell();
    return { code: __code, data: __data };
}

export const Shop_errors = {
    2: { message: "Stack underflow" },
    3: { message: "Stack overflow" },
    4: { message: "Integer overflow" },
    5: { message: "Integer out of expected range" },
    6: { message: "Invalid opcode" },
    7: { message: "Type check error" },
    8: { message: "Cell overflow" },
    9: { message: "Cell underflow" },
    10: { message: "Dictionary error" },
    11: { message: "'Unknown' error" },
    12: { message: "Fatal error" },
    13: { message: "Out of gas error" },
    14: { message: "Virtualization error" },
    32: { message: "Action list is invalid" },
    33: { message: "Action list is too long" },
    34: { message: "Action is invalid or not supported" },
    35: { message: "Invalid source address in outbound message" },
    36: { message: "Invalid destination address in outbound message" },
    37: { message: "Not enough Toncoin" },
    38: { message: "Not enough extra currencies" },
    39: { message: "Outbound message does not fit into a cell after rewriting" },
    40: { message: "Cannot process a message" },
    41: { message: "Library reference is null" },
    42: { message: "Library change action error" },
    43: { message: "Exceeded maximum number of cells in the library or the maximum depth of the Merkle tree" },
    50: { message: "Account state size exceeded limits" },
    128: { message: "Null reference exception" },
    129: { message: "Invalid serialization prefix" },
    130: { message: "Invalid incoming message" },
    131: { message: "Constraints error" },
    132: { message: "Access denied" },
    133: { message: "Contract stopped" },
    134: { message: "Invalid argument" },
    135: { message: "Code of a contract was not found" },
    136: { message: "Invalid standard address" },
    138: { message: "Not a basechain address" },
    4429: { message: "Invalid sender" },
    19553: { message: "Order already completed" },
    24546: { message: "Invalid data" },
    24590: { message: "Price not setted yet" },
    27283: { message: "Item has been refunded for some reason" },
    32501: { message: "Only seller can refund the item" },
    32819: { message: "Item not salable yet" },
    46647: { message: "Insufficient payment" },
} as const

export const Shop_errors_backward = {
    "Stack underflow": 2,
    "Stack overflow": 3,
    "Integer overflow": 4,
    "Integer out of expected range": 5,
    "Invalid opcode": 6,
    "Type check error": 7,
    "Cell overflow": 8,
    "Cell underflow": 9,
    "Dictionary error": 10,
    "'Unknown' error": 11,
    "Fatal error": 12,
    "Out of gas error": 13,
    "Virtualization error": 14,
    "Action list is invalid": 32,
    "Action list is too long": 33,
    "Action is invalid or not supported": 34,
    "Invalid source address in outbound message": 35,
    "Invalid destination address in outbound message": 36,
    "Not enough Toncoin": 37,
    "Not enough extra currencies": 38,
    "Outbound message does not fit into a cell after rewriting": 39,
    "Cannot process a message": 40,
    "Library reference is null": 41,
    "Library change action error": 42,
    "Exceeded maximum number of cells in the library or the maximum depth of the Merkle tree": 43,
    "Account state size exceeded limits": 50,
    "Null reference exception": 128,
    "Invalid serialization prefix": 129,
    "Invalid incoming message": 130,
    "Constraints error": 131,
    "Access denied": 132,
    "Contract stopped": 133,
    "Invalid argument": 134,
    "Code of a contract was not found": 135,
    "Invalid standard address": 136,
    "Not a basechain address": 138,
    "Invalid sender": 4429,
    "Order already completed": 19553,
    "Invalid data": 24546,
    "Price not setted yet": 24590,
    "Item has been refunded for some reason": 27283,
    "Only seller can refund the item": 32501,
    "Item not salable yet": 32819,
    "Insufficient payment": 46647,
} as const

const Shop_types: ABIType[] = [
    {"name":"DataSize","header":null,"fields":[{"name":"cells","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"bits","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"refs","type":{"kind":"simple","type":"int","optional":false,"format":257}}]},
    {"name":"SignedBundle","header":null,"fields":[{"name":"signature","type":{"kind":"simple","type":"fixed-bytes","optional":false,"format":64}},{"name":"signedData","type":{"kind":"simple","type":"slice","optional":false,"format":"remainder"}}]},
    {"name":"StateInit","header":null,"fields":[{"name":"code","type":{"kind":"simple","type":"cell","optional":false}},{"name":"data","type":{"kind":"simple","type":"cell","optional":false}}]},
    {"name":"Context","header":null,"fields":[{"name":"bounceable","type":{"kind":"simple","type":"bool","optional":false}},{"name":"sender","type":{"kind":"simple","type":"address","optional":false}},{"name":"value","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"raw","type":{"kind":"simple","type":"slice","optional":false}}]},
    {"name":"SendParameters","header":null,"fields":[{"name":"mode","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"body","type":{"kind":"simple","type":"cell","optional":true}},{"name":"code","type":{"kind":"simple","type":"cell","optional":true}},{"name":"data","type":{"kind":"simple","type":"cell","optional":true}},{"name":"value","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"to","type":{"kind":"simple","type":"address","optional":false}},{"name":"bounce","type":{"kind":"simple","type":"bool","optional":false}}]},
    {"name":"MessageParameters","header":null,"fields":[{"name":"mode","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"body","type":{"kind":"simple","type":"cell","optional":true}},{"name":"value","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"to","type":{"kind":"simple","type":"address","optional":false}},{"name":"bounce","type":{"kind":"simple","type":"bool","optional":false}}]},
    {"name":"DeployParameters","header":null,"fields":[{"name":"mode","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"body","type":{"kind":"simple","type":"cell","optional":true}},{"name":"value","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"bounce","type":{"kind":"simple","type":"bool","optional":false}},{"name":"init","type":{"kind":"simple","type":"StateInit","optional":false}}]},
    {"name":"StdAddress","header":null,"fields":[{"name":"workchain","type":{"kind":"simple","type":"int","optional":false,"format":8}},{"name":"address","type":{"kind":"simple","type":"uint","optional":false,"format":256}}]},
    {"name":"VarAddress","header":null,"fields":[{"name":"workchain","type":{"kind":"simple","type":"int","optional":false,"format":32}},{"name":"address","type":{"kind":"simple","type":"slice","optional":false}}]},
    {"name":"BasechainAddress","header":null,"fields":[{"name":"hash","type":{"kind":"simple","type":"int","optional":true,"format":257}}]},
    {"name":"ChangeOwner","header":2174598809,"fields":[{"name":"queryId","type":{"kind":"simple","type":"uint","optional":false,"format":64}},{"name":"newOwner","type":{"kind":"simple","type":"address","optional":false}}]},
    {"name":"ChangeOwnerOk","header":846932810,"fields":[{"name":"queryId","type":{"kind":"simple","type":"uint","optional":false,"format":64}},{"name":"newOwner","type":{"kind":"simple","type":"address","optional":false}}]},
    {"name":"MakeNewUser","header":3697970051,"fields":[{"name":"name","type":{"kind":"simple","type":"string","optional":false}},{"name":"id","type":{"kind":"simple","type":"int","optional":false,"format":257}}]},
    {"name":"ChangeUserData","header":2132995444,"fields":[{"name":"name","type":{"kind":"simple","type":"string","optional":false}},{"name":"id","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"deliveryAddress","type":{"kind":"simple","type":"string","optional":false}}]},
    {"name":"CreateShop","header":3325455170,"fields":[{"name":"shopName","type":{"kind":"simple","type":"string","optional":false}}]},
    {"name":"AddItem","header":4264890800,"fields":[{"name":"isUnique","type":{"kind":"simple","type":"bool","optional":false}},{"name":"content","type":{"kind":"simple","type":"string","optional":false}},{"name":"price","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}}]},
    {"name":"NftTransfer","header":3656957868,"fields":[{"name":"newOwner","type":{"kind":"simple","type":"address","optional":false}},{"name":"isSalable","type":{"kind":"simple","type":"bool","optional":false}}]},
    {"name":"NftTransferNotification","header":1494705134,"fields":[{"name":"itemIndex","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"oldOwner","type":{"kind":"simple","type":"address","optional":false}},{"name":"newOwner","type":{"kind":"simple","type":"address","optional":false}}]},
    {"name":"CreateOrder","header":2059487624,"fields":[{"name":"itemAddress","type":{"kind":"simple","type":"address","optional":false}},{"name":"deliveryAddress","type":{"kind":"simple","type":"string","optional":false}},{"name":"price","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}}]},
    {"name":"SetPrice","header":2607803010,"fields":[{"name":"newPrice","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}},{"name":"isSalable","type":{"kind":"simple","type":"bool","optional":false}}]},
    {"name":"SetUniqueItemPrice","header":3295669463,"fields":[{"name":"uniqueItem","type":{"kind":"simple","type":"address","optional":false}},{"name":"newPrice","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}}]},
    {"name":"GetPrice","header":4257557621,"fields":[]},
    {"name":"GetPriceResponse","header":2090181116,"fields":[{"name":"price","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}}]},
    {"name":"NftTransferSuccess","header":3873930432,"fields":[]},
    {"name":"OrderCompleted","header":2570985173,"fields":[{"name":"orderIndex","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"itemAddress","type":{"kind":"simple","type":"address","optional":false}},{"name":"buyer","type":{"kind":"simple","type":"address","optional":false}}]},
    {"name":"MakeOrder","header":1975255782,"fields":[{"name":"itemAddress","type":{"kind":"simple","type":"address","optional":false}},{"name":"price","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}}]},
    {"name":"NewOrder","header":2418445873,"fields":[{"name":"deliveryAddress","type":{"kind":"simple","type":"string","optional":false}},{"name":"itemIndex","type":{"kind":"simple","type":"uint","optional":false,"format":256}},{"name":"price","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}}]},
    {"name":"UpdateShopInfo","header":536542312,"fields":[{"name":"shopName","type":{"kind":"simple","type":"string","optional":false}},{"name":"shopId","type":{"kind":"simple","type":"uint","optional":false,"format":256}},{"name":"uniqueItemsCount","type":{"kind":"simple","type":"uint","optional":false,"format":256}},{"name":"ordersCount","type":{"kind":"simple","type":"uint","optional":false,"format":256}}]},
    {"name":"UniqueItem$Data","header":null,"fields":[{"name":"shop","type":{"kind":"simple","type":"address","optional":false}},{"name":"owner","type":{"kind":"simple","type":"address","optional":false}},{"name":"content","type":{"kind":"simple","type":"string","optional":false}},{"name":"index","type":{"kind":"simple","type":"uint","optional":false,"format":256}},{"name":"price","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}},{"name":"isSalable","type":{"kind":"simple","type":"bool","optional":false}}]},
    {"name":"Order$Data","header":null,"fields":[{"name":"seller","type":{"kind":"simple","type":"address","optional":false}},{"name":"buyer","type":{"kind":"simple","type":"address","optional":false}},{"name":"itemAddress","type":{"kind":"simple","type":"address","optional":false}},{"name":"id","type":{"kind":"simple","type":"uint","optional":false,"format":256}},{"name":"price","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}},{"name":"priceSetted","type":{"kind":"simple","type":"bool","optional":false}},{"name":"completed","type":{"kind":"simple","type":"bool","optional":false}},{"name":"refunded","type":{"kind":"simple","type":"bool","optional":false}}]},
    {"name":"Shop$Data","header":null,"fields":[{"name":"owner","type":{"kind":"simple","type":"address","optional":false}},{"name":"name","type":{"kind":"simple","type":"string","optional":false}},{"name":"uniqueItemsCount","type":{"kind":"simple","type":"uint","optional":false,"format":256}},{"name":"shopId","type":{"kind":"simple","type":"uint","optional":false,"format":256}},{"name":"ordersCount","type":{"kind":"simple","type":"uint","optional":false,"format":256}},{"name":"balance","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}}]},
]

const Shop_opcodes = {
    "ChangeOwner": 2174598809,
    "ChangeOwnerOk": 846932810,
    "MakeNewUser": 3697970051,
    "ChangeUserData": 2132995444,
    "CreateShop": 3325455170,
    "AddItem": 4264890800,
    "NftTransfer": 3656957868,
    "NftTransferNotification": 1494705134,
    "CreateOrder": 2059487624,
    "SetPrice": 2607803010,
    "SetUniqueItemPrice": 3295669463,
    "GetPrice": 4257557621,
    "GetPriceResponse": 2090181116,
    "NftTransferSuccess": 3873930432,
    "OrderCompleted": 2570985173,
    "MakeOrder": 1975255782,
    "NewOrder": 2418445873,
    "UpdateShopInfo": 536542312,
}

const Shop_getters: ABIGetter[] = [
    {"name":"shopName","methodId":130747,"arguments":[],"returnType":{"kind":"simple","type":"string","optional":false}},
    {"name":"uniqueItemInit","methodId":66517,"arguments":[{"name":"owner","type":{"kind":"simple","type":"address","optional":false}},{"name":"index","type":{"kind":"simple","type":"int","optional":false,"format":257}}],"returnType":{"kind":"simple","type":"StateInit","optional":false}},
    {"name":"orderInit","methodId":129595,"arguments":[{"name":"orderId","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"buyer","type":{"kind":"simple","type":"address","optional":false}},{"name":"itemAddress","type":{"kind":"simple","type":"address","optional":false}}],"returnType":{"kind":"simple","type":"StateInit","optional":false}},
    {"name":"owner","methodId":83229,"arguments":[],"returnType":{"kind":"simple","type":"address","optional":false}},
]

export const Shop_getterMapping: { [key: string]: string } = {
    'shopName': 'getShopName',
    'uniqueItemInit': 'getUniqueItemInit',
    'orderInit': 'getOrderInit',
    'owner': 'getOwner',
}

const Shop_receivers: ABIReceiver[] = [
    {"receiver":"internal","message":{"kind":"typed","type":"UpdateShopInfo"}},
    {"receiver":"internal","message":{"kind":"typed","type":"AddItem"}},
    {"receiver":"internal","message":{"kind":"typed","type":"SetUniqueItemPrice"}},
    {"receiver":"internal","message":{"kind":"typed","type":"CreateOrder"}},
    {"receiver":"internal","message":{"kind":"typed","type":"OrderCompleted"}},
    {"receiver":"internal","message":{"kind":"typed","type":"NewOrder"}},
]


export class Shop implements Contract {
    
    public static readonly storageReserve = 0n;
    public static readonly errors = Shop_errors_backward;
    public static readonly opcodes = Shop_opcodes;
    
    static async init(owner: Address) {
        return await Shop_init(owner);
    }
    
    static async fromInit(owner: Address) {
        const __gen_init = await Shop_init(owner);
        if (__gen_init === null) { throw new Error('init data is null'); }
        const address = contractAddress(0, __gen_init);
        return new Shop(address, __gen_init);
    }
    
    static fromAddress(address: Address) {
        return new Shop(address);
    }
    
    readonly address: Address; 
    readonly init?: { code: Cell, data: Cell };
    readonly abi: ContractABI = {
        types:  Shop_types,
        getters: Shop_getters,
        receivers: Shop_receivers,
        errors: Shop_errors,
    };
    
    constructor(address: Address, init?: { code: Cell, data: Cell }) {
        this.address = address;
        this.init = init;
    }
    
    async send(provider: ContractProvider, via: Sender, args: { value: bigint, bounce?: boolean| null | undefined }, message: UpdateShopInfo | AddItem | SetUniqueItemPrice | CreateOrder | OrderCompleted | NewOrder) {
        
        let body: Cell | null = null;
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'UpdateShopInfo') {
            body = beginCell().store(storeUpdateShopInfo(message)).endCell();
        }
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'AddItem') {
            body = beginCell().store(storeAddItem(message)).endCell();
        }
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'SetUniqueItemPrice') {
            body = beginCell().store(storeSetUniqueItemPrice(message)).endCell();
        }
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'CreateOrder') {
            body = beginCell().store(storeCreateOrder(message)).endCell();
        }
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'OrderCompleted') {
            body = beginCell().store(storeOrderCompleted(message)).endCell();
        }
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'NewOrder') {
            body = beginCell().store(storeNewOrder(message)).endCell();
        }
        if (body === null) { throw new Error('Invalid message type'); }
        
        await provider.internal(via, { ...args, body: body });
        
    }
    
    async getShopName(provider: ContractProvider) {
        const builder = new TupleBuilder();
        const source = (await provider.get('shopName', builder.build())).stack;
        const result = source.readString();
        return result;
    }
    
    async getUniqueItemInit(provider: ContractProvider, owner: Address, index: bigint) {
        const builder = new TupleBuilder();
        builder.writeAddress(owner);
        builder.writeNumber(index);
        const source = (await provider.get('uniqueItemInit', builder.build())).stack;
        const result = loadGetterTupleStateInit(source);
        return result;
    }
    
    async getOrderInit(provider: ContractProvider, orderId: bigint, buyer: Address, itemAddress: Address) {
        const builder = new TupleBuilder();
        builder.writeNumber(orderId);
        builder.writeAddress(buyer);
        builder.writeAddress(itemAddress);
        const source = (await provider.get('orderInit', builder.build())).stack;
        const result = loadGetterTupleStateInit(source);
        return result;
    }
    
    async getOwner(provider: ContractProvider) {
        const builder = new TupleBuilder();
        const source = (await provider.get('owner', builder.build())).stack;
        const result = source.readAddress();
        return result;
    }
    
}