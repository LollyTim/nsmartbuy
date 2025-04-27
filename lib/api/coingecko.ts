// CoinGecko API client for getting real-time cryptocurrency prices

const COINGECKO_API_URL = "https://api.coingecko.com/api/v3";

// Get current ADA price in multiple currencies
export async function getADAPrices(currencies: string[] = ["usd", "ngn"]) {
  try {
    const response = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=cardano&vs_currencies=${currencies.join(
        ","
      )}`
    );

    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.status}`);
    }

    const data = await response.json();

    if (data && data.cardano) {
      return {
        usd: data.cardano.usd || 0.733771,
        ngn: data.cardano.ngn || 1181.94,
      };
    }

    // Fallback values if API fails
    return {
      usd: 0.733771,
      ngn: 1181.94,
    };
  } catch (error) {
    console.error("Error fetching ADA prices:", error);
    // Fallback values
    return {
      usd: 0.733771,
      ngn: 1181.94,
    };
  }
}

// Get historical ADA price data
export const getADAHistoricalData = async (
  days = 30,
  currency = "usd"
): Promise<any> => {
  try {
    const response = await fetch(
      `${COINGECKO_API_URL}/coins/cardano/market_chart?vs_currency=${currency}&days=${days}`,
      {
        headers: {
          Accept: "application/json",
        },
        next: { revalidate: 3600 }, // Revalidate every hour
      }
    );

    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching historical ADA data:", error);
    return null;
  }
};

// Convert ADA to fiat currency using real-time rates
export async function convertADAToFiat(
  adaAmount: number,
  currency: "usd" | "ngn"
): Promise<number> {
  try {
    const prices = await getADAPrices();
    const rate = currency === "usd" ? prices.usd : prices.ngn;
    return adaAmount * rate;
  } catch (error) {
    console.error("Error converting ADA to fiat:", error);
    // Fallback calculation
    const rate = currency === "usd" ? 0.733771 : 1181.94;
    return adaAmount * rate;
  }
}

// Convert fiat currency to ADA using real-time rates
export async function convertFiatToADA(
  fiatAmount: number,
  currency: "usd" | "ngn"
): Promise<number> {
  try {
    const prices = await getADAPrices();
    const rate = currency === "usd" ? prices.usd : prices.ngn;
    return fiatAmount / rate;
  } catch (error) {
    console.error("Error converting fiat to ADA:", error);
    // Fallback calculation
    const rate = currency === "usd" ? 0.733771 : 1181.94;
    return fiatAmount / rate;
  }
}
