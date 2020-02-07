'use strict'

import {verifySignature} from '../'
const fixtures = require(__dirname + '/fixtures.json')

describe('ripple-binary-codec', () => {
  it('should verify', () => {
    expect(verifySignature(fixtures.valid.blob)).toEqual({
      signedBy: fixtures.valid.account,
      signatureValid: true
    })
  })

  it('should not verify', () => {
    expect(() => {
      return verifySignature(fixtures.invalid.blob1)
    }).toThrowError(/Could not encode or verify/)
  })

  it('should not decode', () => {
    expect(() => {
      return verifySignature(fixtures.invalid.blob2)
    }).toThrowError(/Could not decode the transaction blob/)
  })
})
