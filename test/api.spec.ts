'use strict'

import {verifySignature} from '../'
const fixtures = require(__dirname + '/fixtures.json')

const definitions = require(__dirname + '/definitions.json')
import {XrplDefinitions} from 'xrpl-accountlib'
const CustomDefinitions = new XrplDefinitions(definitions)

describe('ripple-binary-codec', () => {
  it('should verify', () => {
    expect(verifySignature(fixtures.valid.blob)).toEqual({
      signedBy: fixtures.valid.account,
      signatureValid: true,
      signatureMultiSign: false
    })
  })

  it('should verify hook', () => {
    expect(verifySignature(fixtures.validhook.blob, undefined, CustomDefinitions)).toEqual({
      signedBy: fixtures.validhook.account,
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

  it('should verify multlisigned XLS20', () => {
    expect(verifySignature(fixtures.xls20.blob)).toEqual({
      signedBy: fixtures.xls20.account,
      signatureValid: true,
      signatureMultiSign: true
    })
  })

  it('should decode memo etc.', () => {
    expect(verifySignature(fixtures.memoetc.blob)).toEqual({
      signatureMultiSign: false,
      signatureValid: true,
      signedBy: "rakaFsHkNJ2dLk8RctSxmqNbRG7wigeoEF",
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
