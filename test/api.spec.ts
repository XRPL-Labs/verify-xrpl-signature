'use strict'

import {verifySignature} from '../'
const fixtures = require(__dirname + '/fixtures.json')

describe('ripple-binary-codec', () => {
  it('should verify', () => {
    expect(verifySignature(fixtures.valid.blob)).toEqual({
      signedBy: fixtures.valid.account,
      signatureValid: true,
      signatureMultiSign: false
    })
  })

  it('should verify multisigned', () => {
    expect(verifySignature(fixtures.multisign.blob)).toEqual({
      signedBy: fixtures.multisign.account,
      signatureValid: true,
      signatureMultiSign: true
    })
  })

  it('should verify multisigned with explicit account address', () => {
    expect(verifySignature(fixtures.multisign.blob, fixtures.multisign.account)).toEqual({
      signedBy: fixtures.multisign.account,
      signatureValid: true,
      signatureMultiSign: true
    })
  })

  it('should verify multisigned with explicit hex pubkey', () => {
    expect(verifySignature(fixtures.multisign.blob, fixtures.multisign.pubkey)).toEqual({
      signedBy: fixtures.multisign.account,
      signatureValid: true,
      signatureMultiSign: true
    })
  })

  it('should reject multisigned with missing explicit account address', () => {
    expect(() => {
      return verifySignature(fixtures.multisign.blob, fixtures.valid.account)
    }).toThrowError(/Explicit MultiSigner not in Signers/)
  })

  it('should not decode', () => {
    expect(() => {
      return verifySignature(fixtures.invalid.blob)
    }).toThrowError(/Could not decode the transaction blob/)
  })
})
