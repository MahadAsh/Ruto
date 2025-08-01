# 🚀 Ruto API Setup Guide

This guide will help you set up the API integrations for Ruto to enable real-time route planning, POI discovery, and AI-powered summaries.

## 🔧 Quick Setup

1. **Copy the environment file:**
   ```bash
   cp .env.example .env
   ```

2. **Add your API keys to the `.env` file** (see sections below for how to get them)

3. **Restart your development server:**
   ```bash
   npm start
   ```

## 🗝️ API Keys Required

### 1. OpenAI API (AI Summaries) - **Recommended**
- **Purpose**: Generates friendly, engaging summaries for points of interest
- **Cost**: Pay-per-use, very affordable for typical usage
- **How to get**:
  1. Go to [OpenAI API](https://platform.openai.com/api-keys)
  2. Create an account and add payment method
  3. Generate an API key
  4. Add to `.env`: `REACT_APP_OPENAI_API_KEY=your_key_here`

### 2. OpenRouteService API (Routing) - **Free Tier Available**
- **Purpose**: Calculates optimal routes between locations
- **Cost**: Free tier: 2,000 requests/day
- **How to get**:
  1. Go to [OpenRouteService](https://openrouteservice.org/dev/#/signup)
  2. Sign up for free account
  3. Generate an API key
  4. Add to `.env`: `REACT_APP_OPENROUTE_API_KEY=your_key_here`

### 3. OpenTripMap API (POI Data) - **Free Tier Available**
- **Purpose**: Discovers points of interest along your route
- **Cost**: Free tier: 1,000 requests/day
- **How to get**:
  1. Go to [OpenTripMap](https://opentripmap.io/product)
  2. Sign up for free account
  3. Generate an API key
  4. Add to `.env`: `REACT_APP_OPENTRIPMAP_API_KEY=your_key_here`

### 4. Mapbox API (Alternative Routing) - **Optional**
- **Purpose**: Alternative to OpenRouteService for routing
- **Cost**: Free tier: 50,000 requests/month
- **How to get**:
  1. Go to [Mapbox](https://account.mapbox.com/access-tokens/)
  2. Sign up and get access token
  3. Add to `.env`: `REACT_APP_MAPBOX_ACCESS_TOKEN=your_token_here`

## 🎯 Recommended Setup Order

1. **Start with OpenTripMap** (free POI data)
2. **Add OpenRouteService** (free routing)
3. **Add OpenAI** (paid but affordable AI summaries)

## 💡 Fallback Behavior

Ruto is designed to work even without API keys:

- **No API keys**: Uses offline data for Pakistani routes
- **Partial API keys**: Combines real data with fallbacks
- **All API keys**: Full functionality with real-time data

## 🔒 Security Notes

- Never commit your `.env` file to version control
- Keep your API keys secure and don't share them
- The `.env.example` file is safe to commit (contains no real keys)

## 🧪 Testing Your Setup

1. **Start the app**: `npm start`
2. **Open browser console** to see API status logs
3. **Try a route**: Enter "Islamabad" to "Lahore"
4. **Check the logs**: Look for API success/fallback messages

## 🆘 Troubleshooting

### Common Issues:

1. **"API key not found" warnings**
   - Check your `.env` file exists and has the correct variable names
   - Restart your development server after adding keys

2. **CORS errors**
   - This is normal for some APIs when testing locally
   - The app will automatically fall back to offline data

3. **Rate limit exceeded**
   - You've hit the free tier limits
   - Wait for the limit to reset or upgrade your plan

4. **No POIs found**
   - Try a different route or location
   - Check if your OpenTripMap API key is working

## 📊 API Usage Monitoring

- **OpenAI**: Check usage at [OpenAI Usage](https://platform.openai.com/usage)
- **OpenRouteService**: Monitor at your dashboard
- **OpenTripMap**: Check limits in your account

## 🚀 Production Deployment

For production deployment (Vercel, Netlify, etc.):

1. Add environment variables in your hosting platform's dashboard
2. Use the same variable names as in `.env.example`
3. Never expose API keys in client-side code (they're prefixed with `REACT_APP_` for React)

## 💰 Cost Estimation

For typical usage (10-20 route searches per day):

- **OpenTripMap**: Free (well within limits)
- **OpenRouteService**: Free (well within limits)
- **OpenAI**: ~$0.01-0.05 per day (very affordable)

**Total monthly cost**: Under $2 for moderate usage

---

🎉 **You're all set!** Enjoy exploring with Ruto's intelligent route planning!
