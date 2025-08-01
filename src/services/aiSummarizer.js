class AISummarizerService {
  constructor() {
    this.huggingFaceApiKey = process.env.REACT_APP_HUGGINGFACE_API_KEY;

    if (this.huggingFaceApiKey) {
      this.apiKey = this.huggingFaceApiKey;
      this.baseUrl = "https://api-inference.huggingface.co/models";
      this.provider = "huggingface";
      this.model = "facebook/bart-large-cnn";
    } else {
      this.apiKey = null;
      this.provider = "fallback";
    }

    this.cache = new Map();
  }

  async summarizePOI(poi) {
    if (!this.apiKey) {
      console.warn("Hugging Face API key not found, using fallback summary");
      return this.getFallbackSummary(poi);
    }

    const cacheKey = `${poi.name}-${poi.type}`;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    try {
      const summary = await this.summarizeWithHuggingFace(poi);
      this.cache.set(cacheKey, summary);
      return summary;
    } catch (error) {
      console.error("AI summarization error:", error);
      return this.getFallbackSummary(poi);
    }
  }

  async summarizeWithHuggingFace(poi) {
    const textToSummarize =
      poi.summary && poi.summary !== "Interesting place to visit"
        ? poi.summary
        : `${poi.name} is a ${poi.type || "place"} worth exploring.`;

    const response = await fetch(`${this.baseUrl}/${this.model}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inputs: textToSummarize,
        parameters: {
          max_length: 150,
          min_length: 50,
          do_sample: true,
          temperature: 0.7,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Hugging Face API error: ${response.status}`);
    }

    const data = await response.json();

    if (Array.isArray(data) && data[0]?.summary_text) {
      return data[0].summary_text.trim();
    } else if (typeof data === "string") {
      return data.trim();
    } else {
      throw new Error("Unexpected Hugging Face response format");
    }
  }

  createSummarizationPrompt(poi) {
    let prompt = `Create an engaging travel summary for "${poi.name}"`;

    if (poi.type) {
      prompt += `, which is a ${poi.type.toLowerCase()}`;
    }

    if (poi.summary && poi.summary !== "Interesting place to visit") {
      prompt += `. Here's some information about it: ${poi.summary}`;
    }

    if (poi.address) {
      prompt += ` It's located at ${poi.address}.`;
    }

    prompt +=
      " Focus on what makes this place special, interesting historical facts, and why travelers should visit. Keep it friendly and informative.";

    return prompt;
  }

  async summarizeMultiplePOIs(pois) {
    const summaries = await Promise.allSettled(
      pois.map((poi) => this.summarizePOI(poi))
    );

    return pois.map((poi, index) => ({
      ...poi,
      aiSummary:
        summaries[index].status === "fulfilled"
          ? summaries[index].value
          : this.getFallbackSummary(poi),
    }));
  }

  getFallbackSummary(poi) {
    const fallbackSummaries = {
      "Faisal Mosque":
        "A stunning example of modern Islamic architecture, this iconic mosque is one of the largest in the world and offers breathtaking views of Islamabad.",
      "Badshahi Mosque":
        "Step into history at this magnificent 17th-century Mughal mosque, renowned for its impressive red sandstone architecture and spiritual significance.",
      "Lahore Fort":
        "Explore centuries of Mughal history in this UNESCO World Heritage site, featuring beautiful palaces, gardens, and museums.",
      "Shalimar Gardens":
        "Wander through these exquisite Mughal gardens with terraced lawns, fountains, and pavilions that showcase the pinnacle of garden design.",
      "Daman-e-Koh":
        "Enjoy panoramic views of Islamabad from this scenic viewpoint in the Margalla Hills, perfect for photography and relaxation.",
      "Deosai Plains":
        'Experience the "Land of Giants" - a high-altitude plateau famous for its wildflower blooms and unique wildlife.',
      "Shangrila Resort":
        "Discover this picturesque lakeside retreat offering stunning mountain views and serene natural beauty.",
      "K2 Base Camp Trek":
        "Embark on the adventure of a lifetime with this world-famous trek to the base of the second highest mountain on Earth.",
    };

    if (fallbackSummaries[poi.name]) {
      return fallbackSummaries[poi.name];
    }

    const typeSummaries = {
      "Religious Site": `${poi.name} is a significant religious site offering spiritual experiences and beautiful architecture.`,
      "Historical Site": `Discover the rich history of ${poi.name}, where ancient stories come alive through preserved architecture and cultural artifacts.`,
      Museum: `${poi.name} showcases fascinating collections that provide insights into local culture, history, and traditions.`,
      Nature: `Experience the beauty of ${poi.name}, where stunning landscapes and outdoor activities await nature lovers.`,
      "Cultural Site": `Immerse yourself in the local culture at ${poi.name}, celebrating traditions, arts, and community heritage.`,
      Architecture: `Marvel at the architectural brilliance of ${poi.name}, featuring unique design elements and styles.`,
      Adventure: `${poi.name} offers thrilling outdoor experiences and natural wonders for the adventurous traveler.`,
      Entertainment: `Enjoy leisure and recreation at ${poi.name}, perfect for families and fun seekers.`,
    };

    return (
      typeSummaries[poi.type] ||
      `${poi.name} is an interesting destination worth exploring during your journey. Discover what makes this place special.`
    );
  }

  async generateRouteTips(startLocation, endLocation, pois) {
    return this.getFallbackRouteTips(startLocation, endLocation);
  }

  getFallbackRouteTips(startLocation, endLocation) {
    return `For your journey from ${startLocation} to ${endLocation}, plan rest stops every 2-3 hours and check weather conditions beforehand. Carry water, snacks, and ensure your vehicle is road-ready. Start early for the best views and smoother traffic.`;
  }
}

const aiSummarizerService = new AISummarizerService();
export default aiSummarizerService;
