"use strict";

import { verifySignature, getDefinitions } from "../";
const fixtures = require(__dirname + "/fixtures.json");

const definitions = require(__dirname + "/definitions.json");
import { XrplDefinitions } from "xrpl-accountlib";
import fetch from "node-fetch";
const CustomDefinitions = new XrplDefinitions(definitions);

const request = (url: string, body?: string): any => {
  return fetch(url, { method: body ? "POST" : "GET", body }).then((r: any) =>
    r.json()
  );
};

describe("xrpl-verify-signature", () => {
  it("should verify", () => {
    expect(verifySignature(fixtures.valid.blob)).toEqual({
      signedBy: fixtures.valid.account,
      signatureValid: true,
      signatureMultiSign: false,
    });
  });

  it("should verify hook", () => {
    expect(
      verifySignature(fixtures.validhook.blob, undefined, CustomDefinitions)
    ).toEqual({
      signedBy: fixtures.validhook.account,
      signatureValid: true,
      signatureMultiSign: false,
    });
  });

  it("should verify multisigned", () => {
    expect(verifySignature(fixtures.multisign.blob)).toEqual({
      signedBy: fixtures.multisign.account,
      signatureValid: true,
      signatureMultiSign: true,
    });
  });

  it("should verify multlisigned XLS20", () => {
    expect(verifySignature(fixtures.xls20.blob)).toEqual({
      signedBy: fixtures.xls20.account,
      signatureValid: true,
      signatureMultiSign: true,
    });
  });

  it("should decode memo etc.", () => {
    expect(verifySignature(fixtures.memoetc.blob)).toEqual({
      signatureMultiSign: false,
      signatureValid: true,
      signedBy: "rakaFsHkNJ2dLk8RctSxmqNbRG7wigeoEF",
    });
  });

  it("should verify multisigned with explicit account address", () => {
    expect(
      verifySignature(fixtures.multisign.blob, fixtures.multisign.account)
    ).toEqual({
      signedBy: fixtures.multisign.account,
      signatureValid: true,
      signatureMultiSign: true,
    });
  });

  it("should verify multisigned with explicit hex pubkey", () => {
    expect(
      verifySignature(fixtures.multisign.blob, fixtures.multisign.pubkey)
    ).toEqual({
      signedBy: fixtures.multisign.account,
      signatureValid: true,
      signatureMultiSign: true,
    });
  });

  it("should reject multisigned with missing explicit account address", () => {
    expect(() => {
      return verifySignature(fixtures.multisign.blob, fixtures.valid.account);
    }).toThrowError(/Explicit MultiSigner not in Signers/);
  });

  it("should not decode", () => {
    expect(() => {
      return verifySignature(fixtures.invalid.blob);
    }).toThrowError(/Could not decode the transaction blob/);
  });

  it("get definitions based on network id", () => {
    expect(
      (async () => {
        return await getDefinitions(21338, request);
      })()
    ).resolves.toBeInstanceOf(XrplDefinitions);
  });

  it("get definitions based on network code", () => {
    expect(
      (async () => {
        return await getDefinitions("XAHAU", request);
      })()
    ).resolves.toBeInstanceOf(XrplDefinitions);
  });

  it("default Import tx failure", () => {
    expect(() => {
      verifySignature(fixtures.xahau.importtx.blob);
    }).toThrowError("Could not decode the transaction blob");
  });

  it("dynamic defs Import tx success", async () => {
    const defs = await getDefinitions("XAHAU", request);
    expect(
      verifySignature(fixtures.xahau.importtx.blob, undefined, defs)
    ).toEqual({
      signedBy: fixtures.xahau.importtx.account,
      signatureValid: true,
      signatureMultiSign: false,
    });
  });
});
