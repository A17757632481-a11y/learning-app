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
  speak(text: string): void {
    if (!this.isSupported()) {
      console.warn('当前浏览器不支持语音合成');
      return;
    }

    // 停止当前正在播放的语音
    this.stop();

    const utterance = new SpeechSynthesisUtterance(text);
    
    // 设置为英语
    utterance.lang = 'en-US';
    
    // 设置语速和音调
    utterance.rate = 0.9;
    utterance.pitch = 1;
    
    // 尝试选择英语语音
    const voices = window.speechSynthesis.getVoices();
    const englishVoice = voices.find(voice => 
      voice.lang.startsWith('en') && voice.localService
    ) || voices.find(voice => voice.lang.startsWith('en'));
    
    if (englishVoice) {
      utterance.voice = englishVoice;
    }

    window.speechSynthesis.speak(utterance);
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
