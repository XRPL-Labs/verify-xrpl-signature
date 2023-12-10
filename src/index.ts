import {
  decode,
  encodeForSigning,
  encodeForMultisigning,
} from "xrpl-binary-codec-prerelease";

export interface Signer {
  Signer: {
    SigningPubKey: string;
    TxnSignature: string;
    Account?: string;
  };
}

export interface JsonTransaction {
  TxnSignature: string;
  SigningPubKey: string;
  Signers?: Signer[];
  NetworkID?: number;
}

import { XrplDefinitions } from "xrpl-accountlib";
import { verify, deriveAddress } from "ripple-keypairs";
import fetch from "node-fetch";

export type verifySignatureResult = {
  signedBy: string;
  signatureValid: boolean;
  signatureMultiSign: boolean;
};

export const getDefinitions = async (
  network: number | string
): Promise<XrplDefinitions | undefined> => {
  try {
    // Dynamic definitions
    const call = await fetch("https://xumm.app/api/v1/platform/rails");
    const rails = await call.json();

    const networkData =
      typeof rails === "object" && rails
        ? typeof network === "string"
          ? rails?.[network.toUpperCase().trim()]
          : Object.values(rails).filter(
              (rail: any) => rail.chain_id === network
            )?.[0]
        : Error("Invalid rail data from XRPL Labs endpoint");

    if (networkData?.rpc) {
      const defsCall = await fetch(networkData.rpc, {
        method: "POST",
        body: '{"method":"server_definitions"}',
      });
      const defsJson = await defsCall.json();
      if (typeof defsJson === "object" && defsJson) {
        if (defsJson?.result?.FIELDS) {
          return new XrplDefinitions(defsJson.result);
        }
      }
    }
  } catch (e) {
    throw new Error("Could not fetch network rails:" + (e as Error).message);
  }

  return;
};

export const verifySignature = (
  txBlob: string,
  explicitMultiSigner?: string,
  definitions?: XrplDefinitions
): verifySignatureResult => {
  let txn: JsonTransaction;
  let signedBy: string = "";
  let signatureValid: boolean = false;

  try {
    txn = decode(txBlob, definitions) as unknown as JsonTransaction;
  } catch (e) {
    throw new Error(
      `Could not decode the transaction blob, possibly specify alternative definitions? - (${
        (e as Error).message
      })`
    );
  }

  const signatureMultiSign =
    typeof txn.Signers !== "undefined" &&
    Array.isArray(txn.Signers) &&
    txn.Signers.length > 0 &&
    typeof txn.SigningPubKey === "string" &&
    txn.SigningPubKey === "";

  try {
    if (
      signatureMultiSign &&
      explicitMultiSigner &&
      explicitMultiSigner.match(/^r/)
    ) {
      signedBy = explicitMultiSigner;
    } else if (signatureMultiSign && explicitMultiSigner) {
      signedBy = deriveAddress(explicitMultiSigner);
    } else {
      let signer = txn.SigningPubKey;
      if (signatureMultiSign && txn.Signers && txn.Signers.length > 0) {
        const firstSigner: any = Object.values(txn.Signers)[0];
        signer = firstSigner.Signer.SigningPubKey;
      }
      signedBy = deriveAddress(signer);
    }
  } catch (e) {
    throw new Error(
      `Could not derive an XRPL account address from the transaction (Signing Public Key) (${
        (e as Error).message
      })`
    );
  }

  try {
    if (signatureMultiSign && txn.Signers) {
      const matchingSigners = Object.values(txn.Signers).filter(
        (signer: Signer) => {
          return deriveAddress(signer.Signer.SigningPubKey) === signedBy;
        }
      );
      if (matchingSigners.length > 0) {
        const multiSigner = matchingSigners[0];
        signatureValid = verify(
          encodeForMultisigning(txn, signedBy, definitions),
          multiSigner.Signer.TxnSignature,
          multiSigner.Signer.SigningPubKey
        );
      } else {
        throw new Error("Explicit MultiSigner not in Signers");
      }
    } else {
      signatureValid = verify(
        encodeForSigning(txn, definitions),
        txn.TxnSignature,
        txn.SigningPubKey
      );
    }
  } catch (e) {
    throw new Error(
      `Could not encode or verify the transaction (${(e as Error).message})`
    );
  }

  return {
    signedBy,
    signatureValid,
    signatureMultiSign,
  };
};
