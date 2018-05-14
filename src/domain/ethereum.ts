import {ISigner} from '../signers/iSigner';
import {
  IApiSendSignedTxResponse,
  IApiSendTxResponse,
  IApiSignTxResponse,
  IEthereumRawTransaction,
  IEthTransactionReceiptBody,
} from '../models/ethereum';
import {getWeb3} from '../utils/web3';
import {getSigner} from "../signers/signerFactory";

export async function signTx(rawTx: IEthereumRawTransaction, provider: string): Promise<IApiSignTxResponse> {
  return new Promise<IApiSignTxResponse>((resolve, reject) => {
    getSigner(provider)
      .then((signer: ISigner) => resolve(signer.signTx(rawTx)))
      .catch((err: Error) => reject(err));
  });

}

export async function sendTx(rawTx: string): Promise<IApiSendTxResponse> {
  if (!rawTx) {
    throw new Error('DEFAULT_ERROR');
  }

  const web3 = await getWeb3();

  return new Promise<IApiSendTxResponse>((resolve, reject) => {

    web3.eth
      .sendTransaction(rawTx)
      .on('error', (err: string) => reject(new Error('DLT_ERROR')))
      .then((txReceipt: IEthTransactionReceiptBody) => {

        console.log(`tx has been written in the DLT => ${txReceipt.transactionHash}`);
        resolve({success: true, txReceipt});

      })
      .catch((err: string) => reject(new Error('DLT_ERROR')));

  });

}

export async function sendSignedTx(tx: string): Promise<IApiSendSignedTxResponse> {
  if (!tx) {
    throw new Error('DEFAULT_ERROR');
  }

  const web3 = await getWeb3();

  return new Promise<IApiSendSignedTxResponse>((resolve, reject) => {

    const promise = web3.eth
      .sendSignedTransaction(tx)
      .on('error', (err: string) => reject(new Error('DLT_ERROR')))
      .then((txReceipt: IEthTransactionReceiptBody) => {

        console.log(`tx has been sent in the DLT => ${txReceipt.transactionHash}`);
        resolve({success: true, txReceipt});

      })
      .catch((err: string) => reject(new Error('DLT_ERROR')));

  });

}

function getSenderFromRawTx(rawTx: IEthereumRawTransaction): string {
  return rawTx.from;

}

function getReceiverFromRawTx(rawTx: IEthereumRawTransaction): string {
  return rawTx.to;

}
