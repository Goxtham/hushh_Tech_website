// @vitest-environment jsdom

import React from "react";
import { act } from "react";
import { ChakraProvider } from "@chakra-ui/react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import WalletCardPreviewModal from "../src/components/wallet/WalletCardPreviewModal";
import theme from "../src/theme";

describe("WalletCardPreviewModal", () => {
  let container: HTMLDivElement;
  let root: Root;

  const preview = {
    badgeText: "HUSHH GOLD",
    title: "Hushh Gold Investor Pass",
    holderName: "Test User",
    organizationName: "Hushh",
    membershipId: "test-user",
    investmentClass: "Class B",
    email: "test@example.com",
    qrValue: "https://hushhtech.com/investor/test-user",
    profileUrl: "https://hushhtech.com/investor/test-user",
  };

  beforeEach(() => {
    Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(async () => {
    await act(async () => {
      root.unmount();
    });
    container.remove();
    vi.restoreAllMocks();
  });

  it("shows Apple add action when Apple Wallet is supported", async () => {
    await act(async () => {
      root.render(
        React.createElement(
          ChakraProvider,
          { theme },
          React.createElement(WalletCardPreviewModal, {
            isOpen: true,
            onClose: () => undefined,
            preview,
            appleWalletSupported: true,
            appleWalletSupportMessage:
              "Available on iPhone in Wallet-supported browsers.",
            onAddToAppleWallet: () => undefined,
            googleWalletAvailable: false,
            googleWalletSupportMessage:
              "Google Wallet is temporarily unavailable while we finish the wallet issuer setup.",
          })
        )
      );
    });

    expect(document.body.textContent).toContain("Preview Card");
    expect(document.body.textContent).toContain("Add to Apple Wallet");
    expect(document.body.textContent).toContain(
      "Google Wallet is temporarily unavailable"
    );
  });

  it("shows helper copy instead of the Apple add action when unsupported", async () => {
    await act(async () => {
      root.render(
        React.createElement(
          ChakraProvider,
          { theme },
          React.createElement(WalletCardPreviewModal, {
            isOpen: true,
            onClose: () => undefined,
            preview,
            appleWalletSupported: false,
            appleWalletSupportMessage:
              "Available on iPhone in Wallet-supported browsers.",
            googleWalletAvailable: false,
            googleWalletSupportMessage:
              "Google Wallet is temporarily unavailable while we finish the wallet issuer setup.",
          })
        )
      );
    });

    expect(document.body.textContent).toContain(
      "Available on iPhone in Wallet-supported browsers."
    );
    const buttonLabels = Array.from(
      document.body.querySelectorAll("button")
    ).map((button) => button.textContent?.trim() || "");

    expect(buttonLabels).not.toContain("Add to Apple Wallet");
  });
});
