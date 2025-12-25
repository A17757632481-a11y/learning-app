/**
 * 语音服务
 * 使用 Web Speech API 播放英文发音
 */
export const ttsService = {
  /**
   * 检查浏览器是否支持语音合成
   */
  isSupported(): boolean {
    return typeof window !== 'undefined' && 'speechSynthesis' in window;
  },

  /**
   * 播放文本的英文发音
   */
  speak(text: string, lang: 'en' | 'zh' = 'en'): void {
    if (!this.isSupported()) {
      console.warn('当前浏览器不支持语音合成');
      return;
    }

    // 停止当前正在播放的语音
    this.stop();

    const utterance = new SpeechSynthesisUtterance(text);
    
    // 根据参数设置语言
    if (lang === 'en') {
      utterance.lang = 'en-US';
    } else {
      utterance.lang = 'zh-CN';
    }
    
    // 设置语速和音调
    utterance.rate = 0.9;
    utterance.pitch = 1;
    
    // 等待语音列表加载后选择合适的语音
    const selectVoiceAndSpeak = () => {
      const voices = window.speechSynthesis.getVoices();
      
      if (lang === 'en') {
        // 优先选择英语语音
        const englishVoice = voices.find(voice => 
          voice.lang === 'en-US' && voice.localService
        ) || voices.find(voice => 
          voice.lang.startsWith('en-US')
        ) || voices.find(voice => 
          voice.lang.startsWith('en')
        );
        
        if (englishVoice) {
          utterance.voice = englishVoice;
        }
      } else {
        // 选择中文语音
        const chineseVoice = voices.find(voice => 
          voice.lang === 'zh-CN' && voice.localService
        ) || voices.find(voice => 
          voice.lang.startsWith('zh-CN')
        ) || voices.find(voice => 
          voice.lang.startsWith('zh')
        );
        
        if (chineseVoice) {
          utterance.voice = chineseVoice;
        }
      }

      window.speechSynthesis.speak(utterance);
    };

    // 如果语音列表已加载，直接播放；否则等待加载
    if (window.speechSynthesis.getVoices().length > 0) {
      selectVoiceAndSpeak();
    } else {
      window.speechSynthesis.onvoiceschanged = selectVoiceAndSpeak;
    }
  },

  /**
   * 停止当前正在播放的语音
   */
  stop(): void {
    if (this.isSupported()) {
      window.speechSynthesis.cancel();
    }
  }
};
