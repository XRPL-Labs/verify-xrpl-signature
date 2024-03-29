# Verify XRPL tx blob signatures [![npm version](https://badge.fury.io/js/verify-xrpl-signature.svg)](https://www.npmjs.com/verify-xrpl-signature)

Verify signed XRPL transactions (BLOB, hex). Can be used to verify signed [XUMM](https://xumm.app) transactions.

### Note on MultiSigned transactions

As this lib. is meant to verify XUMM generated signatures, only the **first** MultiSigner will be verified in case of a MultiSigned trasnaction, as XUMM will **never** allow signing on behalf of more than one signer. If you explicitly want to check for a specific multisigner in a MultiSigned transaction, you should specify a second parameter containing the signer account address (r....) or PubKey hex.

## Use

The example below (`.js`) shows how to verify the signature of a transaction on XRPL mainnet:

```javascript
const verifySignature = require('verify-xrpl-signature').verifySignature
const someTx = '2280000000240000000268400000000000000C73210333C718C9CB716E0575454F4A343D46B284ED51151B9C7383524B82C10B262095744730450221009A4D99017F8FD6881D888047E2F9F90C068C09EC9308BC8526116B539D6DD44102207FAA7E8756F67FE7EE1A88884F120A00A8EC37E7D3E5ED3E02FEA7B1D97AA05581146C0994D3FCB140CAB36BAE9465137448883FA487'

console.log(verifySignature(someTx, undefined, definitions))

// In case of explicit MultiSign signer verification:
// console.log(verifySignature(someTx, 'rwiETSee2wMz3SBnAG8hkMsCgvGy9LWbZ1'))
```

The example below (`.js`) shows how to verify the signature of a transaction on XRPL mainnet:

using network definitions of `Xahau`.

### Alternative network definitions

This lib. offers a helper to fetch network definitions dynamically. The example below (`.js`) shows how to
verify the signature of a transaction using dynamically fetched network definitions of `Xahau`:

Please note the `getDefinitions` method requires the second argument to be a custom method to map to your own
preferred lib. to obtain external JSON data.

The output must be an already parsed object. It must use GET method
if no body is given, and POST method if the second argument is the body to post in JSON stringified format.

```javascript
const verifyXrplSignature = require('verify-xrpl-signature')
const { verifySignature, getDefinitions } = verifyXrplSignature 
const fetch = require('node-fetch')

const request = (url, body) => fetch(url, { method: body ? "POST" : "GET", body }).then(r => r.json())

;(async () => {
  const definitions = await getDefinitions("XAHAU", request) // Network = XAHHAU (id: 21337 would work too), pass `request` method.

  const someTx = '2280000000240000000268400000000000000C73210333C718C9CB716E0575454F4A343D46B284ED51151B9C7383524B82C10B262095744730450221009A4D99017F8FD6881D888047E2F9F90C068C09EC9308BC8526116B539D6DD44102207FAA7E8756F67FE7EE1A88884F120A00A8EC37E7D3E5ED3E02FEA7B1D97AA05581146C0994D3FCB140CAB36BAE9465137448883FA487'

  console.log(verifySignature(someTx, undefined, definitions))

  // In case of explicit MultiSign signer verification:
  // console.log(verifySignature(someTx, 'rwiETSee2wMz3SBnAG8hkMsCgvGy9LWbZ1', definitions))
})()
```

## Use with MJS

The above example including network definitions in `.mjs` could look like this:

```javascript
import verifyXrplSignature from 'verify-xrpl-signature'
const { verifySignature, getDefinitions } = verifyXrplSignature 
import fetch from 'node-fetch'

const request = (url, body) => fetch(url, { method: body ? "POST" : "GET", body }).then(r => r.json())

const someTx = '<<binhex>>'

console.log(verifySignature(someTx, undefined, await getDefinitions("XAHAU", request)))

// In case of explicit MultiSign signer verification:
// console.log(verifySignature(someTx, 'rwiETSee2wMz3SBnAG8hkMsCgvGy9LWbZ1', definitions))
```

### Output (Type `verifySignatureResult`)

```
{
  signedBy: 'rwiETSee2wMz3SBnAG8hkMsCgvGy9LWbZ1',
  signatureValid: true,
  signatureMultiSign: false
}
```
