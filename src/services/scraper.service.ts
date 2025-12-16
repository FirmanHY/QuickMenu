// services/scraper.service.ts (React Native)
import axios from "axios";

const API_BASE_URL = "http://172.16.0.3:3000"; // Android Emulator

export interface ScrapedRecipe {
    title: string;
    duration: string;
    ingredients: string;
    steps: string;
    imageUrl?: string;
    source: "Instagram" | "TikTok" | "Youtube" | "Web";
    originalUrl: string;
}

export const scrapeRecipe = async (url: string): Promise<ScrapedRecipe> => {
    try {
        console.log("📡 Calling scraper API:", url);

        const response = await axios.post(
            `${API_BASE_URL}/api/scrape`,
            {
                url
            },
            {
                timeout: 30000, 
                headers: {
                    "Content-Type": "application/json"
                }
            }
        );

        if (response.data.success) {
            console.log("✅ Recipe scraped successfully");
            return response.data.data;
        } else {
            throw new Error(response.data.error || "Failed to scrape recipe");
        }
    } catch (error: any) {
        console.error("❌ Scraping error:", error);

        if (error.response) {
     
            throw new Error(
                error.response.data.error || "Gagal mengambil resep dari server"
            );
        } else if (error.request) {
    
            throw new Error(
                "Tidak dapat terhubung ke server. Pastikan backend berjalan."
            );
        } else {
   
            throw new Error(error.message || "Gagal mengambil resep");
        }
    }
};

// Helper untuk detect platform (optional, di backend juga ada)
export const detectPlatform = (url: string): ScrapedRecipe["source"] => {
    const lowerUrl = url.toLowerCase();

    if (lowerUrl.includes("instagram.com")) return "Instagram";
    if (lowerUrl.includes("tiktok.com")) return "TikTok";
    if (lowerUrl.includes("youtube.com") || lowerUrl.includes("youtu.be"))
        return "Youtube";

    return "Web";
};
