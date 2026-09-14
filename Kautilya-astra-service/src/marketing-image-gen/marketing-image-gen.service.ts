import { Injectable, Logger, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import FormData from 'form-data';

interface PropertyDetails {
  name: string;
  location: string;
  builder: string;
  configuration: string;
  floors: string;
  amenities: string[];
  usp: string[];
  image?: string;
}

interface ImgbbResponse {
  url: string;
  thumb: string;
}

@Injectable()
export class MarketingImageGenService {
  private readonly logger = new Logger(MarketingImageGenService.name);

  constructor(private readonly configService: ConfigService) {}

  // ─────────────────────────────────────────────
  // STEP 1: Research property via Perplexity AI
  // ─────────────────────────────────────────────
  private async fetchPropertyDetails(propertyName: string): Promise<PropertyDetails> {
    this.logger.log(`[Perplexity] Researching property: ${propertyName}`);

    const apiKey = this.configService.get<string>('PERPLEXITY_API_KEY');
    const prompt = `Research the real estate project '${propertyName}'. Then return ONLY a JSON object containing real public information.

Return ONLY this JSON (no markdown, no explanation):
{
  "name": "",
  "location": "",
  "builder": "",
  "configuration": "",
  "floors": "",
  "amenities": [],
  "usp": []
}`;

    const response = await axios.post(
      'https://api.perplexity.ai/chat/completions',
      {
        model: 'sonar-pro',
        messages: [{ role: 'user', content: prompt }],
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        timeout: 60000,
      },
    );

    const rawContent: string = response.data?.choices?.[0]?.message?.content ?? '';

    // Strip markdown code fences if present
    const cleaned = rawContent.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();

    let parsed: PropertyDetails;
    try {
      parsed = JSON.parse(cleaned);
    } catch {
      this.logger.warn('[Perplexity] Failed to parse JSON, using fallback');
      parsed = {
        name: propertyName,
        location: 'India',
        builder: 'N/A',
        configuration: 'N/A',
        floors: 'N/A',
        amenities: [],
        usp: [],
      };
    }

    // Ensure name is always set
    parsed.name = parsed.name || propertyName;
    return parsed;
  }

  // ─────────────────────────────────────────────
  // STEP 2: Fetch property photo via Google Places
  // ─────────────────────────────────────────────
  private async fetchPropertyPhoto(propertyName: string): Promise<Buffer | null> {
    const googleKey = this.configService.get<string>('GOOGLE_PLACES_API_KEY');

    try {
      // 2a. Text search → place_id
      this.logger.log(`[Google Places] Text search for: ${propertyName}`);
      const textSearchRes = await axios.get(
        `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(propertyName)}&key=${googleKey}`,
        { timeout: 15000 },
      );
      const placeId: string | undefined = textSearchRes.data?.results?.[0]?.place_id;
      if (!placeId) {
        this.logger.warn('[Google Places] No place found, skipping photo');
        return null;
      }

      // 2b. Place details → photo_reference
      this.logger.log(`[Google Places] Getting details for place_id: ${placeId}`);
      const detailsRes = await axios.get(
        `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&key=${googleKey}`,
        { timeout: 15000 },
      );
      const photos: any[] = detailsRes.data?.result?.photos ?? [];
      if (!photos.length) {
        this.logger.warn('[Google Places] No photos found for this place');
        return null;
      }

      // Prefer vertical photos (height > width) — matches n8n logic
      const verticals = photos.filter((p) => p.height > p.width);
      const selected = verticals.length > 0 ? verticals[0] : photos[0];
      const photoRef: string = selected.photo_reference;

      // 2c. Fetch the actual image bytes
      this.logger.log(`[Google Places] Downloading photo`);
      const photoRes = await axios.get(
        `https://maps.googleapis.com/maps/api/place/photo?maxwidth=1600&photoreference=${photoRef}&key=${googleKey}`,
        { responseType: 'arraybuffer', timeout: 30000 },
      );

      return Buffer.from(photoRes.data);
    } catch (err) {
      this.logger.warn(`[Google Places] Photo fetch failed: ${err.message}`);
      return null;
    }
  }

  // ─────────────────────────────────────────────
  // STEP 3: Upload a Buffer/Base64 to imgbb
  // ─────────────────────────────────────────────
  private async uploadToImgbb(imageData: Buffer | string, apiKey: string): Promise<ImgbbResponse> {
    this.logger.log(`[imgbb] Uploading image...`);

    const form = new FormData();

    if (Buffer.isBuffer(imageData)) {
      form.append('image', imageData, { filename: 'photo.jpg', contentType: 'image/jpeg' });
    } else {
      // base64 string
      form.append('image', imageData);
    }

    const res = await axios.post(
      `https://api.imgbb.com/1/upload?key=${apiKey}`,
      form,
      {
        headers: form.getHeaders(),
        timeout: 60000,
      },
    );

    return {
      url: res.data?.data?.url,
      thumb: res.data?.data?.thumb?.url ?? res.data?.data?.url,
    };
  }

  // ─────────────────────────────────────────────
  // STEP 4: Generate poster prompt with Gemini Pro
  // ─────────────────────────────────────────────
  private async generatePosterPrompt(
    property: PropertyDetails,
    imgUrl: string,
    brokerName: string,
    brokerNumber: string,
    stylingDesc: string,
  ): Promise<string> {
    this.logger.log(`[Gemini Pro] Generating poster prompt`);

    const geminiKey = this.configService.get<string>('GEMINI_API_KEY');

    const systemPrompt = `You are an expert real-estate marketing creative director.

You will receive JSON data about a property and an OPTIONAL field called "poster_description".

Your task:
Generate a premium, clean, structured poster prompt for a 9:16 vertical real-estate marketing image that will be used with a property reference image in a later step.

IMPORTANT LOGIC:
- If poster_description is missing or equals "standard":
    → Use the STANDARD luxury style EXACTLY as defined below.
- If poster_description contains any custom instructions:
    → Apply ONLY those specific changes.
    → Keep all other STANDARD styling elements exactly the same.
    → Do NOT override the entire theme unless instructed.
    → Modify ONLY what the user explicitly specifies (e.g., background color, accent color, typography).

STANDARD POSTER STYLE (default):
- Deep navy or charcoal blue premium background
- Gold borders and elegant fine line accents
- Central polished high-rise tower render
- Premium icons for amenities
- Clean modern typography hierarchy
- Soft golden halo glow behind the tower
- Symmetrical, balanced luxury layout

STRICT RULES:
- Output must be professional, minimal, and visually premium.
- DO NOT use technical language like "configuration: 1, 2 & 3 BHK". Convert to consumer-friendly text.
- Ensure ZERO spelling mistakes.
- Use ONLY essential property details: project name, short location, residence type, floors, 4–5 amenities.
- CTA must ALWAYS be: "To Know More, Contact ${brokerName} – ${brokerNumber}"
- Output MUST follow the exact multi-line format below.

OUTPUT FORMAT (FOLLOW EXACTLY):

Create a luxury real-estate promotional poster in 9:16 ratio.

Project Title:
<project_name>

Location:
<short_location>

Residences:
<consumer_friendly_bhk_description>

Tower Details:
<floor_count> Storeys

Amenities (use icons):
- <amenity 1>
- <amenity 2>
- <amenity 3>
- <amenity 4>
- <amenity 5>

Visual Style:
<style block based on poster_description logic>

Reference Image:
(The property image will be added later during final image generation)

CTA:
To Know More, Contact ${brokerName} – ${brokerNumber}`;

    const userContent = `poster_description: ${stylingDesc || 'standard'}

property data:
${JSON.stringify({ ...property, img_url: imgUrl }, null, 2)}`;

    const res = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent?key=${geminiKey}`,
      {
        contents: [
          {
            parts: [
              { text: systemPrompt + '\n\n' + userContent },
            ],
          },
        ],
      },
      { timeout: 120000 },
    );

    const text: string =
      res.data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
    if (!text) throw new InternalServerErrorException('Gemini Pro returned empty poster prompt');
    return text;
  }

  // ─────────────────────────────────────────────
  // STEP 5: Generate poster image with Gemini Flash Image
  // ─────────────────────────────────────────────
  private async generatePosterImage(prompt: string, propertyImageBase64: string): Promise<string> {
    this.logger.log(`[Gemini Flash Image] Generating poster image`);
    const geminiKey = this.configService.get<string>('GEMINI_API_KEY');

    const res = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${geminiKey}`,
      {
        contents: [
          {
            parts: [
              { text: prompt },
              {
                inline_data: {
                  mime_type: 'image/jpeg',
                  data: propertyImageBase64,
                },
              },
            ],
          },
        ],
        generationConfig: {
          responseModalities: ['image', 'text'],
          responseMimeType: 'image/png',
        },
      },
      { timeout: 180000 },
    );

    const parts: any[] = res.data?.candidates?.[0]?.content?.parts ?? [];
    // Find the image part (last part with inlineData)
    const imagePart = [...parts].reverse().find((p) => p.inlineData?.data);
    if (!imagePart) {
      throw new InternalServerErrorException('Gemini Flash Image returned no image data');
    }
    return imagePart.inlineData.data as string; // base64 PNG
  }

  // ─────────────────────────────────────────────
  // MAIN ORCHESTRATOR — mirrors n8n pipeline
  // ─────────────────────────────────────────────
  async generate(
    propertyName: string,
    brokerName: string,
    brokerNumber: string,
    stylingDesc: string = 'standard',
  ): Promise<{ url: string; thumb: string }> {
    this.logger.log(`=== Image Generation Pipeline START: ${propertyName} ===`);

    // Run property research + photo fetch in parallel (mirrors n8n parallel branches)
    const [propertyDetails, photoBuffer] = await Promise.all([
      this.fetchPropertyDetails(propertyName).catch((err) => {
        this.logger.error(`Perplexity failed: ${err.message}`);
        throw new BadRequestException(`Property research failed: ${err.message}`);
      }),
      this.fetchPropertyPhoto(propertyName).catch((err) => {
        this.logger.warn(`Photo fetch failed silently: ${err.message}`);
        return null as Buffer | null;
      }),
    ]);

    // Upload property photo to imgbb (or use a placeholder base64 if unavailable)
    const propertyPhotoKey = this.configService.get<string>('IMGBB_PROPERTY_PHOTO_KEY')!;
    let imgUrl = '';
    let propertyImageBase64 = '';

    if (photoBuffer) {
      const uploaded = await this.uploadToImgbb(photoBuffer, propertyPhotoKey);
      imgUrl = uploaded.url;
      propertyImageBase64 = photoBuffer.toString('base64');
    } else {
      this.logger.warn('No property photo available — using placeholder');
      // Minimal 1x1 white pixel as fallback so Gemini doesn't fail
      propertyImageBase64 =
        '/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAABAAEDASIAAhEBAxEB/8QAFAABAAAAAAAAAAAAAAAAAAAACf/EABQQAQAAAAAAAAAAAAAAAAAAAAD/xAAUAQEAAAAAAAAAAAAAAAAAAAAA/8QAFBEBAAAAAAAAAAAAAAAAAAAAAP/aAAwDAQACEQMRAD8AJQAB/9k=';
    }

    // Generate poster text prompt with Gemini Pro
    const posterPrompt = await this.generatePosterPrompt(
      propertyDetails,
      imgUrl,
      brokerName,
      brokerNumber,
      stylingDesc,
    );

    // Generate the final poster image with Gemini Flash Image
    const posterBase64 = await this.generatePosterImage(posterPrompt, propertyImageBase64);

    // Upload final poster to imgbb
    const posterUploadKey = this.configService.get<string>('IMGBB_POSTER_UPLOAD_KEY')!;
    const finalResult = await this.uploadToImgbb(posterBase64, posterUploadKey);

    this.logger.log(`=== Image Generation Pipeline DONE: ${finalResult.url} ===`);
    return finalResult;
  }
}
