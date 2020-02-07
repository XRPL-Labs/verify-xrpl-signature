declare module 'ripple-binary-codec' {
  export interface JsonTransaction {
    TxnSignature: string
    SigningPubKey: string
  }

  export const decode: (txBlob: string) => JsonTransaction
  export const encodeForSigning: (txn: JsonTransaction) => string
}
