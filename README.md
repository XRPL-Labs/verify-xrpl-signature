# Verify XRPL tx blob signatures

Verify signed XRPL transactions (BLOB, hex).

Can be used to verify signed [XUMM](https://xumm.app) transactions.

## Use

```
// Using require():
// const verifySignature = require('verify-xrpl-signature').verifySignature

import {verifySignature} from 'verify-xrpl-signature'

const someTx = '2280000000240000000268400000000000000C73210333C718C9CB716E0575454F4A343D46B284ED51151B9C7383524B82C10B262095744730450221009A4D99017F8FD6881D888047E2F9F90C068C09EC9308BC8526116B539D6DD44102207FAA7E8756F67FE7EE1A88884F120A00A8EC37E7D3E5ED3E02FEA7B1D97AA05581146C0994D3FCB140CAB36BAE9465137448883FA487'

console.log(verifySignature(someTx))
```

### Output (Type `verifySignatureResult`)

```
{
  signedBy: 'rwiETSee2wMz3SBnAG8hkMsCgvGy9LWbZ1',
  signatureValid: true,
  signatureMultiSign: false
}
```