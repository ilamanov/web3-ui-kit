import React, { useEffect, useState } from "react";
import styles from "./auth_button.module.css";


export default function AuthButton({
  blockchain,
  wallet,
  onAccountChanged,
  urlToOpenOnMobile,
  ...props
}) {
  const [isMobileDevice, setIsMobileDevice] = useState(undefined);
  const [account, setAccount] = useState("");
  const [isConnectionPending, setIsConnectionPending] = useState(false);
  const isConnected = account !== "";

  async function initialize() {
    // https://stackoverflow.com/a/23493107/13344574
    const mobile = "ontouchstart" in window || "onmsgesturechange" in window;
    setIsMobileDevice(mobile);

    const acc = await checkIfAlreadyConnected(blockchain);
    if (acc) {
      setAccount(acc);
    }

    addAccountChangeListener(blockchain, setAccount);
    return () => removeAccountChangeListener(blockchain, setAccount);
  }

  useEffect(initialize, []);

  useEffect(() => {
    onAccountChanged(account);
  }, [account]);

  let extraClass = "";
  if (isConnectionPending) {
    extraClass = styles.pending;
  } else if (isConnected) {
    extraClass = styles.connected;
  }

  const button = (
    <button
      {...props}
      className={
        props.className +
        " " +
        styles.button +
        " " +
        styles[wallet] +
        " " +
        extraClass
      }
      disabled={isConnectionPending || isConnected}
      // TODO do something better (than just disabling) when user is already connected
      onClick={async () => {
        setIsConnectionPending(true);
        const acc = await connect(blockchain, wallet);
        setIsConnectionPending(false);
        setAccount(acc);
      }}
    >
      <span className={styles.buttonImage}>
        <img
          src={`/${wallet}.png`}
          alt={wallet + " wallet logo"}
          width={41}
          height={41}
        />
      </span>
      <span className={styles.buttonText}>
        {getButtonText(wallet, isConnected)}
      </span>
    </button>
  );

  if (isMobileDevice) {
    return <a href={getDeepLink(wallet, urlToOpenOnMobile)}>{button}</a>;
  } else {
    return button;
  }
}


async function checkIfAlreadyConnected(blockchain) {
  if (blockchain === "ethereum" && window.ethereum) {
    const accounts = await window.ethereum.request({
      method: "eth_accounts",
    });

    if (accounts.length > 0) {
      return accounts[0];
    }
  } else if (blockchain === "solana" && window.solana) {
    const account = await window.solana.connect({ onlyIfTrusted: true });
    if (account) {
      return account.publicKey.toString();
    }
  }
  return "";
}


function addAccountChangeListener(blockchain, onAccountChanged) {
  if (blockchain === "ethereum") {
    window.ethereum.on("accountsChanged", (accounts) =>
      onAccountChanged(accounts.length ? accounts[0] : "")
    );
  }
  // TODO add Solana support
}

function removeAccountChangeListener(blockchain, onAccountChanged) {
  if (blockchain === "ethereum") {
    window.ethereum.removeListener("accountsChanged", (accounts) =>
      onAccountChanged(accounts.length ? accounts[0] : "")
    );
  }
  // TODO add Solana support
}


function isWalletInstalled(blockchain, wallet) {
  if (
    wallet === "metamask" &&
    (!window[blockchain] || !window[blockchain].isMetaMask)
  ) {
    alert("Get MetaMask");
    return false;
  } else if (wallet === "coinbase" && !window[blockchain]) {
    alert("Get Coinbase Wallet");
    return false;
  } else if (
    wallet === "phantom" &&
    (!window[blockchain] || !window[blockchain].isPhantom)
  ) {
    alert("Get Phantom");
    return false;
  }
  return true;
}

async function connect(blockchain, wallet) {
  if (!isWalletInstalled(blockchain, wallet)) {
    return "";
  }

  try {
    if (blockchain === "ethereum") {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      return accounts[0];
    } else if (blockchain === "solana") {
      const account = await window.solana.connect();
      return account.publicKey.toString();
    }
  } catch (error) {
    return "";
  }

  return "";
}


function getDeepLink(wallet, urlToOpenOnMobile) {
  if (wallet === "metamask") {
    return "https://metamask.app.link/dapp/" + urlToOpenOnMobile;
  }
  // TODO: add support for other wallets. Check out WalletLink: https://docs.cloud.coinbase.com/walletlink/docs
}

function getButtonText(wallet, isConnected) {
  if (isConnected) {
    return "Successfully connected";
  }
  let text = "Connect to ";
  if (wallet === "metamask") {
    return text + "MetaMask";
  } else if (wallet === "coinbase") {
    return text + "Coinbase";
  } else if (wallet === "phantom") {
    return text + "Phantom";
  }
}