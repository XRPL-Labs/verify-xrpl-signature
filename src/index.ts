import {
  decode,
  encodeForSigning,
  encodeForMultisigning
} from 'ripple-binary-codec'

import {
  verify,
  deriveAddress
} from 'ripple-keypairs'

export type verifySignatureResult = {
  signedBy: string
  signatureValid: boolean
  signatureMultiSign: boolean
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

  const signatureMultiSign = typeof txn.Signers !== 'undefined'
    && Array.isArray(txn.Signers)
    && txn.Signers.length > 0
    && typeof txn.SigningPubKey === 'string'
    && txn.SigningPubKey === ''

  let signer = txn.SigningPubKey
  if (signatureMultiSign && txn.Signers && txn.Signers.length > 0) {
    signer = Object.values(txn.Signers)[0].Signer.SigningPubKey
  }

  try {
    signedBy = deriveAddress(signer)
  } catch (e) {
    throw new Error(`Could not derive an XRPL account address from the transaction (Signing Public Key) (${e.message})`)
  }

  try {
    if (signatureMultiSign && txn.Signers) {
      signatureValid = verify(
        encodeForMultisigning(txn, signedBy),
        Object.values(txn.Signers)[0].Signer.TxnSignature,
        Object.values(txn.Signers)[0].Signer.SigningPubKey
      )
    } else {
      signatureValid = verify(
        encodeForSigning(txn),
        txn.TxnSignature,
        txn.SigningPubKey
      )
    }
  } catch (e) {
    throw new Error(`Could not encode or verify the transaction (${e.message})`)
  }

  return {
    signedBy,
    signatureValid,
    signatureMultiSign
  }
}
