declare module 'ripple-binary-codec' {
  export interface Signer {
    Signer: {
      SigningPubKey: string
      TxnSignature: string
      Account?: string
    }
  }

  export interface JsonTransaction {
    TxnSignature: string
    SigningPubKey: string
    Signers?: Signer[]
  }

  export const decode: (txBlob: string) => JsonTransaction
  export const encodeForSigning: (txn: JsonTransaction) => string
  export const encodeForMultisigning: (txn: JsonTransaction, signer: string) => string
}
