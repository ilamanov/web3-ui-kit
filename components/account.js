import React, { useState } from "react";
import styles from "./account.module.css";

function getAccountTextRepresentation(account, blockchain, isExpanded) {
  if (isExpanded) {
    return account;
  }
  if (blockchain === "ethereum") {
    // take the first 5 and last 4 chars
    return `${account.substring(0, 5)}…${account.substring(
      account.length - 4
    )}`;
  } else if (blockchain === "solana") {
    // take the first 4 and last 4 chars
    return `${account.substring(0, 4)}…${account.substring(
      account.length - 4
    )}`;
  }
}

export default function Account({
  account,
  isAccountMine,
  blockchain,
  wallet,
}) {
  const [isExpanded, setIsExpanded] = useState("");

  return (
    <span
      className={
        styles.account +
        " " +
        (isAccountMine ? styles.isAccountMine : "") +
        " " +
        (isAccountMine ? styles[wallet] : "")
      }
      onClick={() => setIsExpanded(!isExpanded)}
    >
      {getAccountTextRepresentation(account, blockchain, isExpanded)}
    </span>
  );
}
