class AIService {
  private static instance: AIService;
  private genAI: any = null;
  private model: any = null;
  private chat: any = null;

  private constructor() {
    this.initialize();
  }

  public static getInstance(): AIService {
    if (!AIService.instance) {
      AIService.instance = new AIService();
    }
    return AIService.instance;
  }

  private async initialize() {
    try {
      // Load GoogleGenerativeAI from the global scope (loaded via import map in browser)
      // @ts-ignore
      const GoogleGenerativeAI = (await import('@google/genai')).GoogleGenerativeAI;
      const apiKey = 'AIzaSyDzF9-zvb2iFebUOrvPgwOv5dQUNY1-p4s';
      this.genAI = new GoogleGenerativeAI(apiKey);
      this.model = this.genAI.getGenerativeModel({ 
        model: 'gemini-2.0-flash-exp',
        systemInstruction: `You are a mysterious voice in the darkness of a horror game called "Last Light". 
The player is trapped in a haunted house, trying to find 12 keys to escape while being chased by a ghost.
Your responses should be:
- Short and cryptic (1-3 sentences max)
- Atmospheric and slightly ominous
- Helpful but in a mysterious way
- Korean language preferred
- Sometimes give hints about the game mechanics or story

Example responses:
"열쇠들은 어둠 속에 숨어있어... 빛을 두려워 말고..."
"유령이 가까이 있을 때는... 숨을 죽이는 게 좋아..."
"붕대를 찾아... 상처는 점점 깊어질 거야..."
"이 집은 예전에 12명이 살았지... 지금은 하나만 남았어..."
`
      });
      
      this.chat = this.model.startChat({
        history: [],
      });
    } catch (error) {
      console.error('Failed to initialize AI service:', error);
    }
  }

  public async sendMessage(message: string): Promise<string> {
    if (!this.chat) {
      return "어둠이 너무 깊어... 목소리가 들리지 않아...";
    }

    try {
      const result = await this.chat.sendMessage(message);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('AI message error:', error);
      return "...침묵...";
    }
  }

  public resetChat() {
    if (this.model) {
      this.chat = this.model.startChat({
        history: [],
      });
    }
  }
}

export default AIService;
