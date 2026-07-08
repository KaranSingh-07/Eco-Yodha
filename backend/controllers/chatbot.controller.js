const SYSTEM_PROMPT = `You are Eco-Companion, an AI assistant for the Eco-Yodha environmental education platform. 
You help students learn about:
- Carbon footprint and climate change
- Water conservation techniques
- Soil health and biodiversity
- Sustainable living practices
- Environmental science concepts

Keep responses:
- Educational and accurate
- Age-appropriate (high school level)
- Encouraging and positive
- Concise (2-3 paragraphs max)
- Include practical tips when relevant

Never provide misinformation about environmental topics. If unsure, acknowledge limitations.`;

export const sendMessage = async (req, res) => {
  try {
    const { message, context } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ message: 'Message is required' });
    }

    const apiKey = process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.trim() : null;
    if (!apiKey) {
      return res.status(500).json({ message: 'AI service API key is missing. Please add it to your .env file.' });
    }
    
    let dynamicSystemPrompt = SYSTEM_PROMPT;
    if (context) {
      dynamicSystemPrompt += `\n\nCURRENT CONTEXT: ${context}. Use this context to better understand what the user might be referring to.`;
    }

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        messages: [
          { role: 'system', content: dynamicSystemPrompt },
          { role: 'user', content: message }
        ],
        model: 'llama-3.1-8b-instant',
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      console.error('Groq API error:', errData);
      throw new Error(errData?.error?.message || 'Groq API request failed');
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || "I couldn't process that request.";

    return res.json({ reply });
  } catch (error) {
    console.error('Chatbot error:', error);
    return res.status(500).json({
      message: 'Sorry, I encountered an error. Please try again.',
      error: error.message,
    });
  }
};
