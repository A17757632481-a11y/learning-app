const STORAGE_KEY = 'app_background';
const OPACITY_KEY = 'app_background_opacity';
const BRIGHTNESS_KEY = 'app_brightness';
const EYE_CARE_KEY = 'app_eye_care_mode';
const NIGHT_MODE_KEY = 'app_night_mode';

// 预设背景图（使用渐变色，避免外部图片加载问题）
export const PRESET_BACKGROUNDS = [
  { id: 'default', name: '默认浅灰', value: '#f5f7fa' },
  { id: 'gradient1', name: '紫蓝渐变', value: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
  { id: 'gradient2', name: '青绿渐变', value: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)' },
  { id: 'gradient3', name: '橙红渐变', value: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' },
  { id: 'gradient4', name: '蓝天渐变', value: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' },
  { id: 'gradient5', name: '暖阳渐变', value: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' },
  { id: 'gradient6', name: '深夜渐变', value: 'linear-gradient(135deg, #0c0c0c 0%, #434343 100%)' },
  { id: 'gradient7', name: '薄荷清新', value: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)' },
  { id: 'gradient8', name: '樱花粉', value: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)' },
  { id: 'gradient9', name: '海洋蓝', value: 'linear-gradient(135deg, #2e3192 0%, #1bffff 100%)' },
  { id: 'gradient10', name: '森林绿', value: 'linear-gradient(135deg, #134e5e 0%, #71b280 100%)' },
  { id: 'gradient11', name: '紫罗兰', value: 'linear-gradient(135deg, #8e2de2 0%, #4a00e0 100%)' },
  { id: 'gradient12', name: '日落橙', value: 'linear-gradient(135deg, #ff6a00 0%, #ee0979 100%)' },
  { id: 'gradient13', name: '极光绿', value: 'linear-gradient(135deg, #00c6ff 0%, #0072ff 100%)' },
  { id: 'gradient14', name: '玫瑰金', value: 'linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)' },
  { id: 'gradient15', name: '柠檬黄', value: 'linear-gradient(135deg, #f6d365 0%, #fda085 100%)' },
];

export const backgroundService = {
  /** 获取当前背景 */
  getBackground(): string {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved || PRESET_BACKGROUNDS[0].value;
    } catch {
      return PRESET_BACKGROUNDS[0].value;
    }
  },

  /** 获取当前透明度 */
  getOpacity(): number {
    try {
      const saved = localStorage.getItem(OPACITY_KEY);
      return saved ? parseFloat(saved) : 1;
    } catch {
      return 1;
    }
  },

  /** 获取当前亮度 */
  getBrightness(): number {
    try {
      const saved = localStorage.getItem(BRIGHTNESS_KEY);
      return saved ? parseFloat(saved) : 1;
    } catch {
      return 1;
    }
  },

  /** 获取护眼模式状态 */
  getEyeCareMode(): boolean {
    try {
      const saved = localStorage.getItem(EYE_CARE_KEY);
      return saved === 'true';
    } catch {
      return false;
    }
  },

  /** 获取夜间模式状态 */
  getNightMode(): boolean {
    try {
      const saved = localStorage.getItem(NIGHT_MODE_KEY);
      return saved === 'true';
    } catch {
      return false;
    }
  },

  /** 设置背景 */
  setBackground(value: string): void {
    try {
      localStorage.setItem(STORAGE_KEY, value);
      this.applyBackground(value);
    } catch (e) {
      console.error('保存背景失败:', e);
    }
  },

  /** 设置透明度 */
  setOpacity(opacity: number): void {
    try {
      localStorage.setItem(OPACITY_KEY, opacity.toString());
      this.applyOpacity(opacity);
    } catch (e) {
      console.error('保存透明度失败:', e);
    }
  },

  /** 设置亮度 */
  setBrightness(brightness: number): void {
    try {
      localStorage.setItem(BRIGHTNESS_KEY, brightness.toString());
      this.applyBrightness(brightness);
    } catch (e) {
      console.error('保存亮度失败:', e);
    }
  },

  /** 设置护眼模式 */
  setEyeCareMode(enabled: boolean): void {
    try {
      localStorage.setItem(EYE_CARE_KEY, enabled.toString());
      this.applyEyeCareMode(enabled);
    } catch (e) {
      console.error('保存护眼模式失败:', e);
    }
  },

  /** 设置夜间模式 */
  setNightMode(enabled: boolean): void {
    try {
      localStorage.setItem(NIGHT_MODE_KEY, enabled.toString());
      this.applyNightMode(enabled);
    } catch (e) {
      console.error('保存夜间模式失败:', e);
    }
  },

  /** 应用背景到页面 */
  applyBackground(value: string): void {
    // 判断是否是图片 URL（base64 或 url()）
    if (value.startsWith('url(') || value.startsWith('data:image')) {
      const bgValue = value.startsWith('data:image') ? `url(${value})` : value;
      document.body.style.background = bgValue;
    } else {
      document.body.style.background = value;
    }
    document.body.style.backgroundAttachment = 'fixed';
    document.body.style.backgroundSize = 'cover';
    document.body.style.backgroundPosition = 'center';
  },

  /** 应用透明度到页面 */
  applyOpacity(opacity: number): void {
    // 设置CSS变量
    document.documentElement.style.setProperty('--bg-opacity', opacity.toString());
    
    // 直接调整body的背景透明度
    const currentBg = this.getBackground();
    
    // 如果是渐变背景，需要在渐变上叠加一个半透明白色层来实现"变浅"效果
    if (currentBg.includes('gradient')) {
      // 创建一个覆盖层来控制背景深浅
      let overlay = document.getElementById('bg-opacity-overlay');
      if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'bg-opacity-overlay';
        overlay.style.position = 'fixed';
        overlay.style.top = '0';
        overlay.style.left = '0';
        overlay.style.right = '0';
        overlay.style.bottom = '0';
        overlay.style.pointerEvents = 'none';
        overlay.style.zIndex = '-1';
        document.body.insertBefore(overlay, document.body.firstChild);
      }
      // 透明度越低，白色覆盖层越明显（背景越浅）
      const whiteOpacity = 1 - opacity;
      overlay.style.background = `rgba(255, 255, 255, ${whiteOpacity * 0.7})`;
    } else {
      // 纯色背景直接调整透明度
      document.body.style.opacity = opacity.toString();
    }
  },

  /** 应用亮度到页面 */
  applyBrightness(brightness: number): void {
    document.documentElement.style.setProperty('--brightness', brightness.toString());
    
    // 创建或更新亮度覆盖层
    let overlay = document.getElementById('brightness-overlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'brightness-overlay';
      overlay.style.position = 'fixed';
      overlay.style.top = '0';
      overlay.style.left = '0';
      overlay.style.right = '0';
      overlay.style.bottom = '0';
      overlay.style.pointerEvents = 'none';
      overlay.style.zIndex = '-1';
      overlay.style.mixBlendMode = 'multiply';
      document.body.appendChild(overlay);
    }
    
    // 亮度越低，黑色覆盖层越明显
    const darknessOpacity = 1 - brightness;
    overlay.style.background = `rgba(0, 0, 0, ${darknessOpacity * 0.6})`;
  },

  /** 应用护眼模式 */
  applyEyeCareMode(enabled: boolean): void {
    let overlay = document.getElementById('eye-care-overlay');
    
    if (enabled) {
      if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'eye-care-overlay';
        overlay.style.position = 'fixed';
        overlay.style.top = '0';
        overlay.style.left = '0';
        overlay.style.right = '0';
        overlay.style.bottom = '0';
        overlay.style.pointerEvents = 'none';
        overlay.style.zIndex = '-1';
        overlay.style.mixBlendMode = 'multiply';
        document.body.appendChild(overlay);
      }
      // 暖色调滤镜（减少蓝光）
      overlay.style.background = 'rgba(255, 220, 180, 0.15)';
      overlay.style.display = 'block';
    } else if (overlay) {
      overlay.style.display = 'none';
    }
  },

  /** 应用夜间模式 */
  applyNightMode(enabled: boolean): void {
    if (enabled) {
      document.documentElement.classList.add('night-mode');
      document.body.style.filter = 'invert(1) hue-rotate(180deg)';
    } else {
      document.documentElement.classList.remove('night-mode');
      document.body.style.filter = 'none';
    }
  },

  /** 从文件读取图片并转为 base64 */
  readImageFile(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      // 限制文件大小 5MB
      if (file.size > 5 * 1024 * 1024) {
        reject(new Error('图片太大，请选择 5MB 以内的图片'));
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        resolve(reader.result as string);
      };
      reader.onerror = () => {
        reject(new Error('读取图片失败'));
      };
      reader.readAsDataURL(file);
    });
  },

  /** 初始化背景（页面加载时调用） */
  init(): void {
    const bg = this.getBackground();
    const opacity = this.getOpacity();
    const brightness = this.getBrightness();
    const eyeCare = this.getEyeCareMode();
    const nightMode = this.getNightMode();
    
    this.applyBackground(bg);
    this.applyOpacity(opacity);
    this.applyBrightness(brightness);
    this.applyEyeCareMode(eyeCare);
    this.applyNightMode(nightMode);
  }
};
