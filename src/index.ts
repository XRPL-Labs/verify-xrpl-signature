import {decode, encodeForSigning} from 'ripple-binary-codec'
import {verify, deriveAddress} from 'ripple-keypairs'

export type verifySignatureResult = {
  signedBy: string
  signatureValid: boolean
}

export const verifySignature = (txBlob: string): verifySignatureResult => {
  let txn
  let signedBy = ''
  let signatureValid = false

  try {
    txn = decode(txBlob)
  } catch (e) {
    throw new Error(`Could not decode the transaction blob (HEX) (${e.message})`)
  }

  try {
    signedBy = deriveAddress(txn.SigningPubKey)
  } catch (e) {
    throw new Error(`Could not derive an XRPL account address from the transaction (Signing Public Key) (${e.message})`)
  }

  try {
    signatureValid = verify(
      encodeForSigning(txn),
      txn.TxnSignature,
      txn.SigningPubKey
    )
  } catch (e) {
    throw new Error(`Could not encode or verify the transaction (${e.message})`)
  }

  return {
    signedBy,
    signatureValid
  }
}
