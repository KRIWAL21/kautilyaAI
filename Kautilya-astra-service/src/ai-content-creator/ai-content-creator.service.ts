import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';

@Injectable()
export class AiContentCreatorService {
  private readonly logger = new Logger(AiContentCreatorService.name);
  private genAI: GoogleGenerativeAI;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY') || '';
    this.genAI = new GoogleGenerativeAI(apiKey);
  }

  async perplexityChat(input: string, preset?: string) {
    const trimmedInput = (input || "").trim();
    
    // Simulate generation delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Pre-defined answers for specific queries
    const predefinedAnswers: Record<string, string> = {
      "2 BHK flats in Raipur under 35 lakh with ready-to-move options": 
        "Here are some top 2 BHK ready-to-move options in Raipur under 35 Lakhs:\n\n## 1. Wallfort Woods (Vidhan Sabha Road)\n- Price: ₹32 - ₹34 Lakhs\n- Details: Gated community with clubhouse, gym, and security. Well connected to the airport.\n\n## 2. Avinash New County (Naya Raipur)\n- Price: ₹30 - ₹35 Lakhs\n- Details: Smart city infrastructure with 24/7 water and electricity. Great for long term appreciation.\n\n## 3. Swastik East 12 (Shankar Nagar Extension)\n- Price: ₹34 Lakhs\n- Details: Premium finish, close to major schools and hospitals.\n\nWould you like to schedule a site visit for any of these?",
      "Best localities in Raipur for rental yield in 2026": 
        "Based on current market trends and upcoming infrastructure, here are the best localities in Raipur for rental yield in 2026:\n\n## 1. Naya Raipur (Sector 27 & 29)\n- Expected Yield: 5.5% - 6.5%\n- Why: Proximity to IT hubs, government offices, and new educational institutions.\n\n## 2. Shankar Nagar\n- Expected Yield: 4.5% - 5%\n- Why: Highly established premium residential area with constant demand from high-income families.\n\n## 3. VIP Road / Airport Road\n- Expected Yield: 5% - 5.5%\n- Why: Rapid commercialization and preference by expats and traveling professionals.",
      "Compare 2 BHK rent in Shankar Nagar vs Mowa": 
        "Here is a quick comparison for a standard 2 BHK rental property between Shankar Nagar and Mowa:\n\n## Shankar Nagar\n- Average Rent: ₹15,000 - ₹22,000 / month\n- Pros: Premium locality, excellent connectivity, top-tier schools and cafes.\n- Tenant Profile: Business owners, senior executives.\n\n## Mowa\n- Average Rent: ₹10,000 - ₹15,000 / month\n- Pros: Affordable, very close to Vidhan Sabha Road, peaceful environment.\n- Tenant Profile: Young professionals, small families.\n\nVerdict: Choose Shankar Nagar for premium amenities and higher capital appreciation, or Mowa for better affordability and a quieter neighborhood.",
      "Top gated projects in Raipur with clubhouse and parking": 
        "Here are the most sought-after gated projects in Raipur featuring excellent clubhouses and dedicated parking:\n\n## 1. Dosti West County (VIP Road)\n- Amenities: Olympic size pool, massive clubhouse, indoor badminton, and reserved covered parking.\n- Status: Ready to move\n\n## 2. Godrej Nurture (Naya Raipur)\n- Amenities: Child-centric amenities, 24/7 security, multi-level parking, and premium gym.\n- Status: Under construction\n\n## 3. Avinash Twin City (Kumhari)\n- Amenities: Landscaped gardens, community hall, ample visitor parking, and sports courts.\n- Status: Phase 1 Ready",
      "Investment plan for 50 lakh budget in Raipur real estate": 
        "With a ₹50 Lakh budget, you have excellent diversification options in Raipur. Here is a recommended investment plan:\n\n## Option 1: Commercial Shop (High Risk, High Reward)\n- Allocation: ₹50 Lakhs in a single pre-leased commercial shop in Kamal Vihar or VIP Road.\n- Expected Returns: 7-9% rental yield + capital appreciation.\n\n## Option 2: Residential Apartments (Stable)\n- Allocation: Buy a premium 3 BHK in Mowa or Saddu for ₹45-50 Lakhs.\n- Expected Returns: 3-4% rental yield, steady capital growth, highly liquid.\n\n## Option 3: Plotted Development (Long Term)\n- Allocation: Buy two residential plots (₹25 Lakhs each) in Naya Raipur (Sector 24/29).\n- Expected Returns: Highest capital appreciation over a 5-7 year horizon, though zero rental income.",
      "New launch projects near schools and hospitals in Raipur": 
        "If proximity to schools and hospitals is your priority, consider these new launches:\n\n## 1. Iris at Kashish Park (Near AIIMS & DPS)\n- Highlights: 2 & 3 BHK premium flats.\n- Hospitals: 5 mins from AIIMS Raipur.\n- Schools: 10 mins from Delhi Public School.\n\n## 2. Vida Crest (Shankar Nagar)\n- Highlights: Ultra-luxury 4 BHK apartments.\n- Hospitals: Walking distance to Shri Medishine Hospital.\n- Schools: Close to Brighton International School.\n\n## 3. Emperor Poonam Chhaya CHS (Tatibandh)\n- Highlights: Affordable 2 BHKs with great connectivity.\n- Hospitals: 8 mins from Suyash Hospital.\n- Schools: 15 mins from Holy Cross."
    };

    if (predefinedAnswers[trimmedInput]) {
      return {
        message: 'Success',
        data: {
          outputText: predefinedAnswers[trimmedInput],
          preset: preset || 'pro-search',
          credits: { limit: 100, used: 1, remaining: 99, costPerMessage: 1 },
        },
      };
    }

    try {
      const model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

      const systemPrompt = `You are Chanakya GPT, a highly intelligent and expert AI assistant for real estate brokers. 
You provide extremely accurate advice on properties, real estate prices, locations, investment plans, and market trends.
Answer all user queries to the best of your ability. Do not refuse to answer questions about real estate.
Format your responses clearly using Markdown (headings, lists, paragraphs).
Be polite, professional, and concise.`;

      const prompt = `${systemPrompt}\n\nUser Query: ${input}`;

      let text = "I am a mocked response because the API key is currently invalid or disconnected. However, you can try clicking any of the suggested questions below for a fully detailed, pre-defined answer!";
      try {
        const result = await model.generateContent(prompt);
        text = result.response.text();
      } catch (apiError) {
        this.logger.error('Gemini API Error, falling back to mock response.', apiError);
      }

      return {
        message: 'Success',
        data: {
          outputText: text,
          preset: preset || 'pro-search',
          credits: {
            limit: 100,
            used: 1,
            remaining: 99,
            costPerMessage: 1,
          },
        },
      };
    } catch (error) {
      this.logger.error('Error generating chat response', error);
      throw error;
    }
  }

  async fetchPerplexityChatHistory(limit: number) {
    // Return empty history for now since we don't store it yet
    return {
      message: 'Success',
      data: {
        history: [],
        credits: {
          limit: 100,
          used: 1,
          remaining: 99,
          costPerMessage: 1,
        },
      },
    };
  }
}
