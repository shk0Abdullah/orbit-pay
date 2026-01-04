export const getSolanaPrice = async () => {
    try {
        const response = await fetch(
            "https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd&include_24hr_change=true"
        );
        const data = await response.json();
        return data.solana;
    } catch (error) {
        console.error("Error fetching Solana price:", error);
        return null;
    }
};
