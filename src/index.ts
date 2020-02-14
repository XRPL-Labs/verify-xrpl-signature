import {
  decode,
  encodeForSigning,
  encodeForMultisigning,
  Signer,
  JsonTransaction
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

export const verifySignature = (
  txBlob: string,
  explicitMultiSigner?: string
): verifySignatureResult => {
  let txn: JsonTransaction
  let signedBy: string = ''
  let signatureValid: boolean = false

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

  try {
    if (signatureMultiSign && explicitMultiSigner && explicitMultiSigner.match(/^r/)) {
      signedBy = explicitMultiSigner
    } else if (signatureMultiSign && explicitMultiSigner) {
      signedBy = deriveAddress(explicitMultiSigner)
    } else {
      let signer = txn.SigningPubKey
      if (signatureMultiSign && txn.Signers && txn.Signers.length > 0) {
        const firstSigner: any = Object.values(txn.Signers)[0]
        signer = firstSigner.Signer.SigningPubKey
      }
      signedBy = deriveAddress(signer)
    }
  } catch (e) {
    throw new Error(`Could not derive an XRPL account address from the transaction (Signing Public Key) (${e.message})`)
  }

  try {
    if (signatureMultiSign && txn.Signers) {
      const matchingSigners = Object.values(txn.Signers).filter((signer: Signer) => {
        return deriveAddress(signer.Signer.SigningPubKey) === signedBy
      })
      if (matchingSigners.length > 0) {
        const multiSigner = matchingSigners[0]
        signatureValid = verify(
          encodeForMultisigning(txn, signedBy),
          multiSigner.Signer.TxnSignature,
          multiSigner.Signer.SigningPubKey
        )
      } else {
        throw new Error('Explicit MultiSigner not in Signers')
      }
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
