// import { BLOCKFROST_API_KEY, BLOCKFROST_URL } from "./config";

import { BLOCKFROST_URL } from "./config";
import { BLOCKFROST_API_KEY } from "./config";

interface BlockfrostTransaction {
  tx_hash: string;
  block_time: number;
  tx_amount: number;
  tx_fee: number;
  tx_size: number;
  tx_type: string;
  sender: string;
  recipient: string;
  status: string;
}

interface FormattedTransaction {
  txHash: string;
  type: string;
  amount: number;
  timestamp: number;
  status: string;
  sender: string;
  recipient: string;
}

export async function getTransactionsByWalletAddress(
  address: string
): Promise<FormattedTransaction[]> {
  try {
    console.log("Fetching transactions for address:", address);
    const response = await fetch(
      `${BLOCKFROST_URL}/addresses/${address}/transactions`,
      {
        headers: {
          project_id: BLOCKFROST_API_KEY,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Blockfrost API error: ${response.status}`);
    }

    const transactions = await response.json();
    console.log("Raw transactions:", transactions);

    // Get detailed transaction information for each transaction
    const detailedTransactions = await Promise.all(
      transactions.slice(0, 10).map(async (tx: any) => {
        // Limit to 10 for testing
        const txDetails = await getTransactionDetails(tx.tx_hash);
        return {
          ...tx,
          ...txDetails,
        };
      })
    );

    console.log("Detailed transactions:", detailedTransactions);

    // Transform the transactions into our format
    const formattedTransactions = detailedTransactions.map((tx: any) => {
      // Get transaction type first
      const txType = determineTransactionType(tx, address);
      // Then calculate amount based on type
      const amount = calculateTransactionAmount(tx, address, txType);

      console.log("Transaction processed:", {
        txHash: tx.tx_hash,
        type: txType,
        calculatedAmount: amount,
      });

      return {
        txHash: tx.tx_hash,
        type: txType,
        amount: amount,
        timestamp: tx.block_time * 1000,
        status: "completed",
        sender: tx.sender || "",
        recipient: tx.recipient || "",
      };
    });

    console.log("Formatted transactions:", formattedTransactions);
    return formattedTransactions;
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return [];
  }
}

async function getTransactionDetails(txHash: string) {
  try {
    console.log("Fetching details for transaction:", txHash);
    const response = await fetch(`${BLOCKFROST_URL}/txs/${txHash}/utxos`, {
      headers: {
        project_id: BLOCKFROST_API_KEY,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      // Check if endpoint is correct - Blockfrost might use a different path
      console.error(`Failed to fetch transaction details: ${response.status}`);
      // Try alternate endpoint format
      const altResponse = await fetch(`${BLOCKFROST_URL}/txs/${txHash}`, {
        headers: {
          project_id: BLOCKFROST_API_KEY,
          "Content-Type": "application/json",
        },
      });

      if (!altResponse.ok) {
        throw new Error(`Blockfrost API error: ${response.status}`);
      }

      const txData = await altResponse.json();

      // Get inputs and outputs from the transaction
      const inputsResponse = await fetch(
        `${BLOCKFROST_URL}/txs/${txHash}/inputs`,
        {
          headers: {
            project_id: BLOCKFROST_API_KEY,
            "Content-Type": "application/json",
          },
        }
      );

      const outputsResponse = await fetch(
        `${BLOCKFROST_URL}/txs/${txHash}/outputs`,
        {
          headers: {
            project_id: BLOCKFROST_API_KEY,
            "Content-Type": "application/json",
          },
        }
      );

      const inputs = inputsResponse.ok ? await inputsResponse.json() : [];
      const outputs = outputsResponse.ok ? await outputsResponse.json() : [];

      return {
        ...txData,
        inputs,
        outputs,
      };
    }

    const data = await response.json();
    console.log("Transaction details:", data);
    return {
      inputs: data.inputs || [],
      outputs: data.outputs || [],
    };
  } catch (error) {
    console.error("Error fetching transaction details:", error);
    return { inputs: [], outputs: [] };
  }
}

function determineTransactionType(tx: any, address: string): string {
  // Check if the inputs and outputs arrays exist and have the expected structure
  if (
    !tx.inputs ||
    !tx.outputs ||
    !Array.isArray(tx.inputs) ||
    !Array.isArray(tx.outputs)
  ) {
    console.warn("Transaction is missing inputs or outputs:", tx);
    return "unknown";
  }

  // Extract addresses from inputs and outputs, handling different possible data structures
  const inputAddresses = tx.inputs
    .map((input: any) => {
      // Check different possible structures
      if (input.address) return input.address;
      if (input.payment_addr && input.payment_addr.bech32)
        return input.payment_addr.bech32;
      if (input.payment_addr) return input.payment_addr;
      return null;
    })
    .filter(Boolean);

  const outputAddresses = tx.outputs
    .map((output: any) => {
      if (output.address) return output.address;
      if (output.payment_addr && output.payment_addr.bech32)
        return output.payment_addr.bech32;
      if (output.payment_addr) return output.payment_addr;
      return null;
    })
    .filter(Boolean);

  console.log("Processed addresses:", {
    inputAddresses,
    outputAddresses,
    walletAddress: address,
  });

  const isSender = inputAddresses.includes(address);
  const isRecipient = outputAddresses.includes(address);

  console.log("Transaction type determination:", {
    address,
    isSender,
    isRecipient,
  });

  if (isSender && isRecipient) {
    return "transfer";
  } else if (isSender) {
    return "send";
  } else if (isRecipient) {
    return "receive";
  }
  return "unknown";
}

function calculateTransactionAmount(
  tx: any,
  address: string,
  txType: string
): number {
  if (
    !tx.outputs ||
    !tx.inputs ||
    !Array.isArray(tx.inputs) ||
    !Array.isArray(tx.outputs)
  ) {
    console.warn("Missing UTXO data:", { tx });

    // As a fallback, try to use tx_amount if available
    if (tx.tx_amount) {
      const amount = parseFloat(tx.tx_amount);
      return txType === "send" ? -amount / 1000000 : amount / 1000000;
    }

    return 0;
  }

  // Function to extract amount from an input or output
  const getAmount = (item: any): number => {
    // Check for different possible structures
    if (item.amount) {
      if (typeof item.amount === "number") return item.amount;
      if (Array.isArray(item.amount)) {
        // Sum up all amounts in the array
        return item.amount.reduce((sum: number, amountItem: any) => {
          if (typeof amountItem === "number") return sum + amountItem;
          if (amountItem.quantity) return sum + Number(amountItem.quantity);
          if (amountItem.amount) return sum + Number(amountItem.amount);
          return sum;
        }, 0);
      }
    }

    if (item.value) {
      if (typeof item.value === "number") return item.value;
      if (typeof item.value === "string") return Number(item.value);
    }

    // Check for Cardano-specific structures
    if (item.amounts) {
      return item.amounts.reduce((sum: number, amountItem: any) => {
        return sum + Number(amountItem.quantity || 0);
      }, 0);
    }

    return 0;
  };

  // Function to check if an item belongs to our address
  const isAddressMatch = (item: any, addr: string): boolean => {
    if (item.address === addr) return true;
    if (item.payment_addr === addr) return true;
    if (item.payment_addr && item.payment_addr.bech32 === addr) return true;
    return false;
  };

  // Calculate total amount sent from this address
  const sentAmount = tx.inputs
    .filter((input: any) => isAddressMatch(input, address))
    .reduce((sum: number, input: any) => {
      const amount = getAmount(input);
      console.log("Input amount:", {
        address: input.address || input.payment_addr,
        amount,
      });
      return sum + amount;
    }, 0);

  // Calculate total amount received by this address
  const receivedAmount = tx.outputs
    .filter((output: any) => isAddressMatch(output, address))
    .reduce((sum: number, output: any) => {
      const amount = getAmount(output);
      console.log("Output amount:", {
        address: output.address || output.payment_addr,
        amount,
      });
      return sum + amount;
    }, 0);

  // Use transaction type to determine net amount
  let netAmount = 0;

  switch (txType) {
    case "send":
      netAmount = -sentAmount;
      break;
    case "receive":
      netAmount = receivedAmount;
      break;
    case "transfer":
      netAmount = receivedAmount - sentAmount;
      break;
    default:
      // If no clear type, try to calculate net change
      netAmount = receivedAmount - sentAmount;
  }

  console.log("Amount calculation:", {
    sentAmount,
    receivedAmount,
    txType,
    netAmount: netAmount / 1000000,
  });

  // Convert lovelace to ADA (1 ADA = 1,000,000 lovelace)
  return netAmount / 1000000;
}
