import { useState } from 'react';
import { checkInService } from '../services/checkInService';
import './CodingBasicsPage.css';

interface Lesson {
  id: number;
  title: string;
  duration: string;
  content: string;
  code?: string;
  exercise?: string;
}

interface Chapter {
  id: number;
  title: string;
  icon: string;
  description: string;
  lessons: Lesson[];
}

interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

const CHAPTERS: Chapter[] = [
  {
    id: 1,
    title: '第一章：编程思维入门',
    icon: '🧠',
    description: '理解计算机如何工作，建立编程思维',
    lessons: [
      {
        id: 1,
        title: '什么是编程？',
        duration: '10分钟',
        content: `编程就是用计算机能理解的语言，告诉它做什么。

就像你告诉朋友"去超市买牛奶"，编程就是告诉计算机"打开文件，读取数据，计算结果"。

核心概念：
• 计算机只懂0和1（二进制）
• 编程语言是人类和计算机的桥梁
• 程序 = 一系列指令的集合

生活类比：
做菜的菜谱就是一个"程序"：
1. 准备食材（输入）
2. 按步骤操作（处理）
3. 得到菜品（输出）`,
        exercise: '思考：你每天做的哪些事情可以写成"程序"？'
      },
      {
        id: 2,
        title: '为什么学Python？',
        duration: '8分钟',
        content: `Python是最适合新手的编程语言。

优点：
• 语法简单，接近英语
• 功能强大，应用广泛
• 中文资料丰富
• 社区活跃，问题好解决

能做什么：
• 数据分析（Excel自动化）
• 网络爬虫（自动收集信息）
• 自动化脚本（批量处理文件）
• Web开发（做网站）
• 人工智能（机器学习）
• 协议分析和逆向工程`,
        exercise: '安装Python：访问 python.org 下载最新版本'
      }
    ]
  },
  {
    id: 2,
    title: '第二章：Python基础语法',
    icon: '🐍',
    description: '学习变量、数据类型、运算符',
    lessons: [
      {
        id: 3,
        title: '第一个Python程序',
        duration: '15分钟',
        content: `让我们写第一个程序：打印"Hello World"

为什么是Hello World？
这是编程界的传统，每学一门新语言都从这个开始。`,
        code: `# 这是注释，计算机会忽略
print("Hello World")

# 试试打印你的名字
print("我叫张三")

# 打印数字
print(2024)

# 打印计算结果
print(10 + 5)`,
        exercise: '修改代码，打印你的名字和今年的年龄'
      },
      {
        id: 4,
        title: '变量：给数据起名字',
        duration: '20分钟',
        content: `变量就像一个盒子，可以存放数据。

为什么需要变量？
• 存储数据方便使用
• 让代码更易读
• 可以重复使用

命名规则：
• 只能包含字母、数字、下划线
• 不能以数字开头
• 区分大小写`,
        code: `# 创建变量
name = "张三"
age = 18
height = 1.75

# 使用变量
print("我叫", name)
print("今年", age, "岁")

# 变量可以改变
age = 19
print("明年", age, "岁")`,
        exercise: '创建变量存储你的姓名、年龄、城市，然后打印出来'
      },
      {
        id: 5,
        title: '数据类型详解',
        duration: '25分钟',
        content: `Python有多种数据类型，每种都有特定用途。

基本类型：
• 字符串 (str)：文本数据，用引号包裹
• 整数 (int)：没有小数点的数字
• 浮点数 (float)：有小数点的数字
• 布尔值 (bool)：True 或 False

容器类型：
• 列表 (list)：有序可变集合 [1, 2, 3]
• 字典 (dict)：键值对集合 {"name": "张三"}
• 元组 (tuple)：有序不可变集合 (1, 2, 3)`,
        code: `# 字符串
text = "Hello"
print(type(text))  # <class 'str'>

# 整数和浮点数
age = 18
price = 19.99
print(type(age), type(price))

# 列表（重要！）
numbers = [1, 2, 3, 4, 5]
print(numbers[0])  # 访问第一个元素

# 字典（超重要！）
user = {"name": "张三", "age": 18}
print(user["name"])`,
        exercise: '创建一个字典存储你的个人信息（姓名、年龄、爱好列表）'
      }
    ]
  },
  {
    id: 3,
    title: '第三章：网络基础知识',
    icon: '🌐',
    description: '理解HTTP协议、请求响应、网络通信原理',
    lessons: [
      {
        id: 6,
        title: 'HTTP协议是什么？',
        duration: '20分钟',
        content: `HTTP是浏览器和服务器交流的"语言"。

生活类比：
就像你去餐厅点餐：
• 你（浏览器）对服务员说"我要一份炒饭"（HTTP请求）
• 服务员把炒饭端上来（HTTP响应）

HTTP请求的组成：
• 请求方法：GET（获取）、POST（提交）、PUT（更新）、DELETE（删除）
• URL：要访问的地址
• 请求头：附加信息（浏览器类型、Cookie等）
• 请求体：要发送的数据（POST时使用）

HTTP响应的组成：
• 状态码：200成功、404未找到、500服务器错误
• 响应头：内容类型、长度等信息
• 响应体：实际的数据（HTML、JSON等）`,
        exercise: '打开浏览器开发者工具（F12），访问任意网站，观察Network标签中的请求'
      },
      {
        id: 7,
        title: 'URL结构深度解析',
        duration: '18分钟',
        content: `URL是网络资源的地址，理解它是抓包的基础。

URL完整结构：
https://www.example.com:443/path/to/page?key=value&id=123#section

分解说明：
• https:// - 协议（http或https加密）
• www.example.com - 域名（服务器地址）
• :443 - 端口号（https默认443，http默认80）
• /path/to/page - 路径（具体资源位置）
• ?key=value&id=123 - 查询参数（传递数据）
• #section - 锚点（页面内定位）

为什么重要？
• 抓包时需要识别请求的目标
• 构造请求时需要正确的URL
• 分析API接口的规律`,
        code: `# Python解析URL
from urllib.parse import urlparse, parse_qs

url = "https://api.example.com/user?id=123&name=张三"
parsed = urlparse(url)

print("协议:", parsed.scheme)
print("域名:", parsed.netloc)
print("路径:", parsed.path)
print("参数:", parse_qs(parsed.query))`,
        exercise: '分析这个URL的各个部分：https://www.bilibili.com/video/BV1xx411c7mD?p=2&t=30'
      },
      {
        id: 8,
        title: 'JSON数据格式',
        duration: '22分钟',
        content: `JSON是网络传输数据的通用格式，90%的API都用它。

什么是JSON？
• JavaScript Object Notation（JavaScript对象表示法）
• 轻量级的数据交换格式
• 人类可读，机器易解析

JSON语法规则：
• 数据用键值对表示："key": "value"
• 数据之间用逗号分隔
• 对象用 {} 包裹
• 数组用 [] 包裹
• 字符串必须用双引号

为什么重要？
• 抓包看到的响应大多是JSON
• 构造请求时需要发送JSON
• 解析响应数据需要理解JSON结构`,
        code: `import json

# JSON字符串转Python对象
json_str = '{"name": "张三", "age": 18, "hobbies": ["编程", "游戏"]}'
data = json.loads(json_str)
print(data["name"])  # 张三

# Python对象转JSON字符串
user = {"name": "李四", "age": 20}
json_str = json.dumps(user, ensure_ascii=False)
print(json_str)  # {"name": "李四", "age": 20}`,
        exercise: '创建一个包含你个人信息的JSON对象，包括姓名、年龄、爱好数组'
      }
    ]
  },
  {
    id: 4,
    title: '第四章：抓包工具与实战',
    icon: '🔍',
    description: '学习使用抓包工具，分析网络请求',
    lessons: [
      {
        id: 9,
        title: '什么是抓包？',
        duration: '15分钟',
        content: `抓包就是"偷听"浏览器和服务器的对话。

生活类比：
就像你在餐厅偷听隔壁桌的对话，了解他们点了什么菜。

为什么要抓包？
• 了解APP/网站如何工作
• 找到数据接口的地址
• 分析请求参数的规律
• 学习如何构造请求

常用抓包工具：
• Chrome开发者工具（F12）- 最简单，适合网页
• Fiddler - 功能强大，可抓HTTPS
• Charles - Mac上常用
• mitmproxy - 命令行工具，可编程
• Wireshark - 最底层，抓所有网络包

学习路径：
1. 先学Chrome开发者工具
2. 再学Fiddler（Windows）或Charles（Mac）
3. 最后学mitmproxy（高级）`,
        exercise: '打开Chrome，按F12，访问bilibili.com，观察Network标签'
      },
      {
        id: 10,
        title: 'Chrome开发者工具实战',
        duration: '30分钟',
        content: `Chrome开发者工具是最容易上手的抓包工具。

打开方式：
• 按F12键
• 右键 → 检查
• Ctrl+Shift+I

Network标签详解：
• Name：请求的URL
• Status：状态码（200成功）
• Type：数据类型（xhr、fetch、document）
• Size：数据大小
• Time：耗时

重要功能：
• Filter：筛选请求类型（XHR只看API请求）
• Preserve log：保留日志（页面跳转不清空）
• Disable cache：禁用缓存（看到最新数据）

查看请求详情：
• Headers：请求头和响应头
• Payload：发送的数据
• Preview：格式化的响应
• Response：原始响应数据

实战技巧：
• 先清空记录，再操作，方便找到目标请求
• 用Filter筛选XHR类型，只看API请求
• 右键请求 → Copy → Copy as cURL，可以复制完整请求`,
        exercise: '访问淘宝搜索商品，找到搜索接口的URL和参数'
      },
      {
        id: 11,
        title: 'Fiddler抓包进阶',
        duration: '35分钟',
        content: `Fiddler可以抓取所有程序的网络请求，包括APP。

Fiddler优势：
• 可以抓取HTTPS加密请求
• 可以抓取手机APP的请求
• 可以修改请求和响应
• 可以重放请求

安装配置：
1. 下载Fiddler Classic（免费）
2. Tools → Options → HTTPS → 勾选Decrypt HTTPS
3. 安装证书（弹出提示点是）

抓取手机APP：
1. 电脑和手机连同一WiFi
2. 手机WiFi设置 → 代理 → 手动
3. 服务器填电脑IP，端口填8888
4. 手机浏览器访问 http://电脑IP:8888 下载证书

界面说明：
• 左侧：请求列表
• 右侧：请求详情（Inspectors标签）
• Raw：原始数据
• JSON：格式化的JSON
• WebForms：表单数据

实用技巧：
• 用Filters筛选域名
• 用Find搜索关键词
• 右键 → Replay 重放请求
• 右键 → Edit in Composer 修改后发送`,
        exercise: '用Fiddler抓取微信小程序的请求（需要手机配置代理）'
      }
    ]
  },
  {
    id: 5,
    title: '第五章：Python网络编程',
    icon: '🐍',
    description: '用Python发送HTTP请求，模拟浏览器行为',
    lessons: [
      {
        id: 12,
        title: 'requests库入门',
        duration: '25分钟',
        content: `requests是Python最流行的HTTP库，简单易用。

安装：
pip install requests

为什么学requests？
• 发送HTTP请求获取数据
• 模拟浏览器行为
• 自动化测试
• 写爬虫和协议脚本的基础

基本用法：
• requests.get() - 获取数据
• requests.post() - 提交数据
• requests.put() - 更新数据
• requests.delete() - 删除数据

重要参数：
• url：请求地址
• headers：请求头（模拟浏览器）
• params：URL参数（GET）
• data：表单数据（POST）
• json：JSON数据（POST）
• cookies：Cookie信息`,
        code: `import requests

# GET请求
response = requests.get('https://api.github.com')
print(response.status_code)  # 200
print(response.json())  # 解析JSON

# 带参数的GET请求
params = {'q': 'python', 'sort': 'stars'}
response = requests.get('https://api.github.com/search/repositories', params=params)

# POST请求
data = {'username': 'test', 'password': '123456'}
response = requests.post('https://example.com/login', json=data)

# 带请求头
headers = {'User-Agent': 'Mozilla/5.0'}
response = requests.get('https://example.com', headers=headers)`,
        exercise: '用requests访问 https://api.github.com/users/github 获取GitHub官方账号信息'
      },
      {
        id: 13,
        title: '请求头详解',
        duration: '28分钟',
        content: `请求头是HTTP请求的"身份证"，服务器靠它识别你。

常见请求头：
• User-Agent：浏览器标识（最重要！）
• Referer：从哪个页面来的
• Cookie：登录凭证
• Content-Type：数据类型
• Authorization：认证令牌

为什么重要？
• 不带User-Agent会被识别为爬虫
• 不带Cookie无法访问需要登录的接口
• Content-Type错误服务器无法解析数据

User-Agent示例：
• Chrome: Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0
• 手机: Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X)
• 微信: MicroMessenger/8.0.0

Content-Type常见值：
• application/json - JSON数据
• application/x-www-form-urlencoded - 表单
• multipart/form-data - 文件上传`,
        code: `import requests

# 完整的请求头
headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0',
    'Referer': 'https://www.example.com',
    'Accept': 'application/json',
    'Accept-Language': 'zh-CN,zh;q=0.9',
}

# 带Cookie的请求
cookies = {
    'session_id': 'abc123',
    'user_token': 'xyz789'
}

response = requests.get(
    'https://example.com/api/user',
    headers=headers,
    cookies=cookies
)

# 查看响应头
print(response.headers)`,
        exercise: '从抓包工具复制一个请求的Headers，用requests重现这个请求'
      },
      {
        id: 14,
        title: 'Session会话管理',
        duration: '22分钟',
        content: `Session可以自动管理Cookie，模拟登录状态。

什么是Session？
• 保持登录状态的机制
• 自动处理Cookie
• 多个请求共享状态

为什么用Session？
• 登录后的请求需要携带Cookie
• 手动管理Cookie太麻烦
• Session自动处理

使用场景：
• 需要登录的网站
• 需要保持状态的API
• 连续的多个请求`,
        code: `import requests

# 创建Session对象
session = requests.Session()

# 登录请求（Session会自动保存Cookie）
login_data = {'username': 'test', 'password': '123456'}
session.post('https://example.com/login', json=login_data)

# 后续请求自动带上Cookie
response = session.get('https://example.com/api/user/info')
print(response.json())

# 设置Session的默认请求头
session.headers.update({
    'User-Agent': 'Mozilla/5.0'
})

# 所有请求都会带上这个请求头
response = session.get('https://example.com/api/data')`,
        exercise: '用Session模拟登录一个网站，然后访问需要登录才能看的页面'
      }
    ]
  },
  {
    id: 6,
    title: '第六章：加密与签名',
    icon: '🔐',
    description: '理解常见加密算法，破解参数签名',
    lessons: [
      {
        id: 15,
        title: '加密基础概念',
        duration: '20分钟',
        content: `加密是保护数据安全的技术，也是逆向的重点。

加密分类：
• 编码：Base64（可逆，不是加密）
• 哈希：MD5、SHA1、SHA256（不可逆）
• 对称加密：AES、DES（同一密钥加解密）
• 非对称加密：RSA（公钥加密，私钥解密）

为什么要学？
• 很多API的参数是加密的
• 需要理解加密才能构造请求
• 逆向时经常遇到加密算法

常见场景：
• 密码传输：MD5/SHA256哈希
• 参数签名：MD5(参数+密钥)
• 数据加密：AES加密
• Token生成：JWT（JSON Web Token）`,
        exercise: '思考：为什么密码要用MD5而不是Base64？'
      },
      {
        id: 16,
        title: 'Base64编码',
        duration: '18分钟',
        content: `Base64不是加密，是编码，可以轻松解码。

什么是Base64？
• 把二进制数据转成可打印字符
• 常用于传输图片、文件
• 看起来像乱码，但可以还原

特征识别：
• 只包含A-Z、a-z、0-9、+、/
• 末尾可能有=号
• 长度是4的倍数

使用场景：
• 图片转文本传输
• 简单的数据混淆
• URL中传递特殊字符`,
        code: `import base64

# 编码
text = "Hello World"
encoded = base64.b64encode(text.encode()).decode()
print(encoded)  # SGVsbG8gV29ybGQ=

# 解码
decoded = base64.b64decode(encoded).decode()
print(decoded)  # Hello World

# 实战：解码抓包看到的Base64数据
data = "eyJ1c2VyIjoi5byg5LiJIiwiYWdlIjoxOH0="
decoded = base64.b64decode(data).decode()
print(decoded)  # {"user":"张三","age":18}`,
        exercise: '把你的名字Base64编码，然后解码回来'
      },
      {
        id: 17,
        title: 'MD5哈希算法',
        duration: '25分钟',
        content: `MD5是最常见的哈希算法，用于签名和密码加密。

MD5特点：
• 不可逆（无法解密）
• 固定长度32位（16进制）
• 相同输入永远得到相同输出
• 微小改动导致完全不同的结果

使用场景：
• 密码加密存储
• 参数签名验证
• 文件完整性校验

参数签名原理：
1. 把所有参数按字母排序
2. 拼接成字符串
3. 加上密钥（secret key）
4. 计算MD5值作为sign参数

为什么要签名？
• 防止参数被篡改
• 验证请求合法性
• 防止重放攻击`,
        code: `import hashlib

# 基本用法
text = "Hello World"
md5 = hashlib.md5(text.encode()).hexdigest()
print(md5)  # b10a8db164e0754105b7a99be72e3fe5

# 参数签名示例
params = {
    'user_id': '123',
    'timestamp': '1234567890',
    'action': 'buy'
}

# 1. 按key排序
sorted_params = sorted(params.items())
# 2. 拼接字符串
param_str = '&'.join([f'{k}={v}' for k, v in sorted_params])
# 3. 加上密钥
secret = 'my_secret_key'
sign_str = param_str + secret
# 4. 计算MD5
sign = hashlib.md5(sign_str.encode()).hexdigest()
print(f'签名: {sign}')

# 发送请求时带上sign
params['sign'] = sign`,
        exercise: '计算字符串"Python"的MD5值'
      },
      {
        id: 18,
        title: 'AES加密解密',
        duration: '30分钟',
        content: `AES是最常用的对称加密算法，安全性高。

AES特点：
• 对称加密（加密解密用同一密钥）
• 需要密钥和IV（初始化向量）
• 有多种模式（ECB、CBC、CTR等）
• 需要填充（PKCS7）

使用场景：
• 敏感数据传输
• 本地数据加密
• API参数加密

常见问题：
• 密钥长度必须是16/24/32字节
• IV长度必须是16字节
• 数据需要填充到16字节的倍数

逆向技巧：
• 在JS代码中搜索"AES"、"encrypt"
• 找到密钥和IV的值
• 用Python实现相同的加密`,
        code: `from Crypto.Cipher import AES
from Crypto.Util.Padding import pad, unpad
import base64

# 密钥和IV（通常从JS代码中找到）
key = b'1234567890123456'  # 16字节
iv = b'abcdefghijklmnop'   # 16字节

# 加密
def aes_encrypt(text):
    cipher = AES.new(key, AES.MODE_CBC, iv)
    padded = pad(text.encode(), 16)
    encrypted = cipher.encrypt(padded)
    return base64.b64encode(encrypted).decode()

# 解密
def aes_decrypt(encrypted_text):
    cipher = AES.new(key, AES.MODE_CBC, iv)
    encrypted = base64.b64decode(encrypted_text)
    decrypted = cipher.decrypt(encrypted)
    return unpad(decrypted, 16).decode()

# 测试
text = "Hello World"
encrypted = aes_encrypt(text)
print(f'加密: {encrypted}')
decrypted = aes_decrypt(encrypted)
print(f'解密: {decrypted}')`,
        exercise: '安装pycryptodome库：pip install pycryptodome，然后运行示例代码'
      }
    ]
  },
  {
    id: 7,
    title: '第七章：JavaScript逆向基础',
    icon: '🔬',
    description: '分析网页JS代码，找到加密逻辑',
    lessons: [
      {
        id: 19,
        title: 'JavaScript基础',
        duration: '25分钟',
        content: `逆向网页必须懂JavaScript，因为加密逻辑都在JS里。

为什么学JS？
• 网页的加密逻辑用JS写的
• 需要读懂JS代码找到加密方法
• 可以直接在浏览器执行JS代码

JS基础语法：
• 变量：let、const、var
• 函数：function name() {}
• 对象：{key: value}
• 数组：[1, 2, 3]

与Python的区别：
• 用 {} 而不是缩进
• 语句末尾加分号
• 用 === 判断相等
• 用 console.log() 而不是 print()

常见JS加密库：
• CryptoJS：最常用的加密库
• JSEncrypt：RSA加密
• md5.js：MD5哈希`,
        code: `// JavaScript示例
function encrypt(text) {
    let key = "secret";
    let result = "";
    for (let i = 0; i < text.length; i++) {
        result += String.fromCharCode(
            text.charCodeAt(i) ^ key.charCodeAt(i % key.length)
        );
    }
    return btoa(result);  // Base64编码
}

// 在浏览器Console执行
console.log(encrypt("Hello"));

// Python实现相同逻辑
def encrypt(text):
    key = "secret"
    result = ""
    for i in range(len(text)):
        result += chr(ord(text[i]) ^ ord(key[i % len(key)]))
    return base64.b64encode(result.encode()).decode()`,
        exercise: '在浏览器Console执行：console.log(btoa("Hello"))，理解btoa是Base64编码'
      },
      {
        id: 20,
        title: '浏览器调试技巧',
        duration: '30分钟',
        content: `用浏览器调试工具找到加密函数的位置。

调试步骤：
1. 打开开发者工具（F12）
2. 切换到Sources标签
3. 找到JS文件
4. 设置断点
5. 单步执行观察变量

找加密函数的方法：

方法1：搜索关键词
• 在Sources中按Ctrl+Shift+F全局搜索
• 搜索"encrypt"、"sign"、"md5"、"aes"
• 找到可疑函数

方法2：XHR断点
• 在Network标签找到目标请求
• 右键 → Initiator → 点击调用栈
• 跳转到发送请求的代码位置

方法3：DOM断点
• 在Elements标签右键元素
• Break on → attribute modifications
• 点击按钮触发，自动断点

调试技巧：
• 鼠标悬停变量查看值
• 在Console输入变量名查看
• 右键变量 → Store as global variable
• 用debugger语句手动断点`,
        exercise: '访问任意网站，按F12，在Console输入：debugger，然后刷新页面'
      },
      {
        id: 21,
        title: 'JS代码混淆与还原',
        duration: '28分钟',
        content: `很多网站会混淆JS代码防止逆向，我们要学会还原。

什么是混淆？
• 把代码变得难以阅读
• 变量名改成a、b、c
• 字符串编码
• 控制流平坦化

常见混淆特征：
• 变量名很短：_0x1a2b、a、b
• 大量十六进制字符串：'\x48\x65\x6c\x6c\x6f'
• 代码压缩成一行
• 有大量的数组和索引访问

还原方法：

方法1：格式化代码
• 在Sources标签点击{}按钮
• 或使用在线工具：jsbeautifier.org

方法2：重命名变量
• 阅读代码理解含义
• 手动重命名有意义的名字

方法3：使用AST工具
• Babel：JS代码转换工具
• 可以自动还原某些混淆

方法4：动态调试
• 不看代码，直接调试
• 在关键位置打断点
• 观察变量的值`,
        code: `// 混淆前
function encrypt(password) {
    return md5(password + "salt");
}

// 混淆后
var _0x1a2b = ['salt'];
function _0x3c4d(_0x5e6f) {
    return _0x7g8h(_0x5e6f + _0x1a2b[0]);
}

// 还原技巧：
// 1. 格式化代码
// 2. 把_0x1a2b[0]替换成'salt'
// 3. 重命名函数名
// 4. 最终还原成原始代码`,
        exercise: '访问 https://obfuscator.io/ 混淆一段简单代码，然后尝试还原'
      }
    ]
  },
  {
    id: 8,
    title: '第八章：APP抓包与逆向',
    icon: '📱',
    description: '抓取手机APP的请求，分析协议',
    lessons: [
      {
        id: 22,
        title: 'APP抓包原理',
        duration: '20分钟',
        content: `APP抓包比网页复杂，需要配置代理和证书。

为什么APP抓包难？
• APP使用HTTPS加密
• 需要安装证书才能解密
• 有些APP有证书校验（SSL Pinning）

抓包原理：
1. 手机设置代理指向电脑
2. 电脑运行抓包工具（Fiddler/Charles）
3. 手机安装证书信任代理
4. 所有请求经过代理，被抓包工具拦截

工具选择：
• Fiddler：Windows首选，免费
• Charles：Mac首选，收费
• mitmproxy：命令行，可编程
• HttpCanary：手机端抓包（需Root）

配置步骤：
1. 电脑和手机连同一WiFi
2. 查看电脑IP地址
3. 手机WiFi设置代理
4. 手机浏览器下载证书
5. 安装并信任证书`,
        exercise: '查看你的电脑IP地址：Windows按Win+R输入cmd，输入ipconfig'
      },
      {
        id: 23,
        title: 'Fiddler抓取APP',
        duration: '35分钟',
        content: `详细步骤教你用Fiddler抓取手机APP。

Fiddler配置：

1. 开启远程连接
Tools → Options → Connections
勾选 Allow remote computers to connect
端口默认8888

2. 配置HTTPS解密
Tools → Options → HTTPS
勾选 Decrypt HTTPS traffic
勾选 Ignore server certificate errors

3. 重启Fiddler

手机配置（以iPhone为例）：

1. 连接WiFi
设置 → WiFi → 点击已连接的WiFi

2. 配置代理
HTTP代理 → 手动
服务器：电脑IP（如192.168.1.100）
端口：8888

3. 安装证书
手机浏览器访问：http://电脑IP:8888
点击 FiddlerRoot certificate 下载
设置 → 通用 → 描述文件 → 安装证书
设置 → 通用 → 关于本机 → 证书信任设置 → 开启

4. 测试
打开APP，Fiddler应该能看到请求

常见问题：
• 看不到请求：检查IP和端口是否正确
• HTTPS无法解密：检查证书是否信任
• APP无法联网：可能有SSL Pinning`,
        exercise: '用Fiddler抓取微信小程序的请求'
      },
      {
        id: 24,
        title: 'SSL Pinning绕过',
        duration: '30分钟',
        content: `有些APP会校验证书，需要绕过才能抓包。

什么是SSL Pinning？
• APP内置了服务器证书
• 只信任内置的证书
• 不信任系统安装的证书
• 目的是防止中间人攻击（抓包）

如何判断有SSL Pinning？
• 配置代理后APP无法联网
• 提示"网络错误"或"证书错误"
• Fiddler看不到HTTPS请求

绕过方法：

方法1：使用JustTrustMe（Android需Root）
• Xposed框架 + JustTrustMe模块
• 自动绕过SSL Pinning

方法2：使用Frida（推荐）
• 不需要Root
• 动态注入绕过
• 支持Android和iOS

方法3：反编译修改（高级）
• 反编译APK
• 删除证书校验代码
• 重新打包签名

方法4：使用VirtualXposed
• 不需要Root
• 虚拟环境运行APP
• 安装Xposed模块

学习路径：
1. 先学会基本抓包
2. 遇到SSL Pinning再学绕过
3. 从简单的APP开始练习`,
        exercise: '搜索"Frida SSL Pinning绕过"了解原理'
      }
    ]
  },
  {
    id: 9,
    title: '第九章：协议分析实战',
    icon: '⚙️',
    description: '分析真实APP的协议，编写自动化脚本',
    lessons: [
      {
        id: 25,
        title: '协议分析流程',
        duration: '25分钟',
        content: `系统化的协议分析方法，适用于任何APP。

分析流程：

1. 明确目标
• 要实现什么功能？
• 需要哪些接口？
• 登录、查询、提交等

2. 抓包观察
• 操作APP触发功能
• 记录所有相关请求
• 分析请求的顺序

3. 分析请求
• URL：接口地址
• Method：GET/POST
• Headers：必需的请求头
• Parameters：参数含义
• Response：返回数据结构

4. 识别加密
• 参数是否加密？
• 使用什么算法？
• 密钥在哪里？

5. 寻找规律
• 参数如何生成？
• 时间戳、随机数
• 签名算法

6. 编写代码
• 用Python实现
• 测试验证

7. 优化完善
• 错误处理
• 参数校验
• 日志记录`,
        exercise: '选择一个简单的APP（如天气APP），分析它的查询接口'
      },
      {
        id: 26,
        title: '参数签名破解',
        duration: '35分钟',
        content: `很多APP的参数都有签名，需要找到签名算法。

签名的作用：
• 防止参数被篡改
• 验证请求合法性
• 防止接口被滥用

常见签名方式：

1. 简单MD5签名
sign = MD5(参数拼接 + 密钥)

2. 时间戳签名
sign = MD5(参数 + timestamp + 密钥)

3. 随机数签名
sign = MD5(参数 + nonce + 密钥)

4. 复杂签名
多次加密、多个密钥、自定义算法

破解步骤：

1. 抓包对比
• 发送多个请求
• 对比参数变化
• 找出规律

2. 搜索JS代码
• 搜索"sign"、"signature"
• 找到签名函数

3. 分析算法
• 看用了什么加密
• 密钥是什么
• 参数如何拼接

4. Python实现
• 照着JS代码写Python
• 测试是否正确`,
        code: `# 示例：某APP的签名算法
import hashlib
import time

def generate_sign(params):
    # 1. 按key排序
    sorted_params = sorted(params.items())
    
    # 2. 拼接字符串
    param_str = '&'.join([f'{k}={v}' for k, v in sorted_params])
    
    # 3. 加上时间戳
    timestamp = str(int(time.time()))
    param_str += f'&timestamp={timestamp}'
    
    # 4. 加上密钥（从JS代码中找到）
    secret = 'abc123xyz'
    sign_str = param_str + secret
    
    # 5. MD5加密
    sign = hashlib.md5(sign_str.encode()).hexdigest()
    
    return sign, timestamp

# 使用
params = {'user_id': '123', 'action': 'query'}
sign, timestamp = generate_sign(params)
params['sign'] = sign
params['timestamp'] = timestamp

print(params)`,
        exercise: '分析一个真实APP的签名算法，尝试用Python实现'
      },
      {
        id: 27,
        title: '编写协议脚本',
        duration: '40分钟',
        content: `把分析结果写成可复用的Python脚本。

脚本结构：

1. 配置部分
• API地址
• 密钥
• 请求头模板

2. 工具函数
• 签名生成
• 加密解密
• 时间戳生成

3. API封装
• 登录函数
• 查询函数
• 提交函数

4. 错误处理
• 网络异常
• 参数错误
• 登录失效

5. 日志记录
• 请求日志
• 错误日志
• 调试信息

最佳实践：
• 使用类封装
• 配置和代码分离
• 添加注释
• 异常处理完善`,
        code: `import requests
import hashlib
import time
import json

class AppAPI:
    def __init__(self):
        self.base_url = "https://api.example.com"
        self.secret = "abc123xyz"
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'MyApp/1.0.0',
            'Content-Type': 'application/json'
        })
    
    def _generate_sign(self, params):
        """生成签名"""
        sorted_params = sorted(params.items())
        param_str = '&'.join([f'{k}={v}' for k, v in sorted_params])
        timestamp = str(int(time.time()))
        sign_str = param_str + timestamp + self.secret
        sign = hashlib.md5(sign_str.encode()).hexdigest()
        return sign, timestamp
    
    def login(self, username, password):
        """登录"""
        params = {
            'username': username,
            'password': hashlib.md5(password.encode()).hexdigest()
        }
        sign, timestamp = self._generate_sign(params)
        params['sign'] = sign
        params['timestamp'] = timestamp
        
        response = self.session.post(
            f'{self.base_url}/login',
            json=params
        )
        return response.json()
    
    def get_user_info(self):
        """获取用户信息"""
        params = {'action': 'get_info'}
        sign, timestamp = self._generate_sign(params)
        params['sign'] = sign
        params['timestamp'] = timestamp
        
        response = self.session.get(
            f'{self.base_url}/user/info',
            params=params
        )
        return response.json()

# 使用
api = AppAPI()
result = api.login('test', '123456')
print(result)`,
        exercise: '选择一个APP，编写完整的协议脚本，实现登录和查询功能'
      }
    ]
  },
  {
    id: 10,
    title: '第十章：高级逆向技术',
    icon: '🚀',
    description: '学习更深入的逆向技术和工具',
    lessons: [
      {
        id: 28,
        title: 'Frida动态插桩',
        duration: '35分钟',
        content: `Frida是最强大的动态分析工具，可以在运行时修改APP行为。

什么是Frida？
• 动态插桩框架
• 可以注入JS代码到APP
• 实时修改函数行为
• 不需要修改APP本身

能做什么？
• Hook函数查看参数和返回值
• 修改函数返回值
• 绕过SSL Pinning
• 绕过Root检测
• 自动化操作

安装Frida：
pip install frida-tools

手机端安装frida-server：
1. 下载对应架构的frida-server
2. adb push到手机
3. 赋予执行权限
4. 运行frida-server

基本用法：
• frida-ps -U：列出手机上的进程
• frida -U -f com.app.name：启动并附加APP
• frida -U com.app.name：附加运行中的APP`,
        code: `# Frida脚本示例：Hook加密函数
import frida
import sys

# JS代码
js_code = """
Java.perform(function() {
    // Hook加密函数
    var EncryptUtil = Java.use('com.example.EncryptUtil');
    
    EncryptUtil.encrypt.implementation = function(text) {
        console.log('[+] 加密前:', text);
        var result = this.encrypt(text);
        console.log('[+] 加密后:', result);
        return result;
    };
    
    console.log('[+] Hook成功');
});
"""

# Python代码
device = frida.get_usb_device()
pid = device.spawn(['com.example.app'])
session = device.attach(pid)
script = session.create_script(js_code)
script.load()
device.resume(pid)
sys.stdin.read()`,
        exercise: '安装Frida，运行 frida-ps -U 查看手机进程'
      },
      {
        id: 29,
        title: 'Android逆向入门',
        duration: '40分钟',
        content: `学习反编译Android APP，查看源代码。

APK结构：
• classes.dex：Java代码编译后的文件
• lib/：Native库（.so文件）
• res/：资源文件
• AndroidManifest.xml：配置文件

反编译工具：

1. jadx（推荐）
• 直接反编译成Java代码
• 图形界面，易用
• 支持搜索、导出

2. apktool
• 反编译成smali代码
• 可以修改后重新打包
• 命令行工具

3. dex2jar + jd-gui
• 老牌工具组合
• dex转jar，jd-gui查看

反编译步骤：

1. 获取APK文件
• 从手机导出：adb pull /data/app/xxx/base.apk
• 从应用商店下载

2. 用jadx打开APK
• 查看Java代码
• 搜索关键词

3. 找到加密逻辑
• 搜索"encrypt"、"sign"
• 查看加密函数实现

4. 用Python实现
• 照着Java代码写Python
• 测试验证

常见加密位置：
• utils包：工具类
• network包：网络请求
• security包：安全相关`,
        exercise: '下载jadx，反编译一个简单的APK，查看MainActivity代码'
      },
      {
        id: 30,
        title: 'Native层逆向',
        duration: '45分钟',
        content: `有些APP把加密放在Native层（C/C++），需要更深入的逆向。

什么是Native层？
• 用C/C++编写的代码
• 编译成.so文件
• 通过JNI调用
• 反编译难度更高

为什么用Native？
• 执行效率高
• 逆向难度大
• 保护核心算法

分析工具：

1. IDA Pro（专业）
• 最强大的反汇编工具
• 支持多种架构
• 可以看到汇编代码

2. Ghidra（免费）
• NSA开源的逆向工具
• 功能接近IDA
• 完全免费

3. Frida（动态）
• Hook Native函数
• 查看参数和返回值
• 不需要看汇编

分析步骤：

1. 找到.so文件
• 在APK的lib目录
• 不同架构有不同版本

2. 用IDA/Ghidra打开
• 查看导出函数
• 找到加密函数

3. 分析汇编代码
• 理解算法逻辑
• 找到密钥

4. 用Frida Hook
• 动态查看参数
• 验证分析结果

学习建议：
• Native逆向难度很高
• 需要懂汇编语言
• 建议先精通Java层逆向
• 遇到Native再深入学习`,
        code: `# Frida Hook Native函数
import frida

js_code = """
// Hook Native函数
Interceptor.attach(Module.findExportByName("libnative.so", "encrypt"), {
    onEnter: function(args) {
        // args[0]是第一个参数
        console.log('[+] 参数:', Memory.readUtf8String(args[0]));
    },
    onLeave: function(retval) {
        // retval是返回值
        console.log('[+] 返回值:', Memory.readUtf8String(retval));
    }
});
"""

device = frida.get_usb_device()
session = device.attach('com.example.app')
script = session.create_script(js_code)
script.load()
input()`,
        exercise: '了解ARM汇编基础，搜索"ARM汇编入门教程"'
      }
    ]
  }
];

export function CodingBasicsPage() {
  const [selectedChapter, setSelectedChapter] = useState<number | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<number | null>(null);
  const [completedLessons, setCompletedLessons] = useState<Set<number>>(() => {
    const saved = localStorage.getItem('completed-coding-lessons');
    return saved ? new Set(JSON.parse(saved)) : new Set();
  });
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [score, setScore] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [loadingQuiz, setLoadingQuiz] = useState(false);

  const toggleComplete = (lessonId: number) => {
    const newCompleted = new Set(completedLessons);
    if (newCompleted.has(lessonId)) {
      newCompleted.delete(lessonId);
    } else {
      newCompleted.add(lessonId);
      // 更新打卡数据：完成了一节课程
      checkInService.updateTodayProgress({ lessonsCompleted: 1 });
    }
    setCompletedLessons(newCompleted);
    localStorage.setItem('completed-coding-lessons', JSON.stringify([...newCompleted]));
  };

  // 生成测试题
  const generateQuiz = async () => {
    if (!currentLesson) return;
    
    setLoadingQuiz(true);
    setShowQuiz(true);
    setQuizQuestions([]);
    setCurrentQuestionIndex(0);
    setScore(0);
    setQuizCompleted(false);

    try {
      const apiUrl = import.meta.env.VITE_AI_API_URL || 'https://api.openai.com/v1';
      const apiKey = import.meta.env.VITE_AI_API_KEY || '';
      const model = import.meta.env.VITE_AI_MODEL || 'gpt-3.5-turbo';

      const response = await fetch(`${apiUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model,
          messages: [
            {
              role: 'system',
              content: `你是一个编程教育专家。根据课程内容生成5道选择题来测试学生的理解。

题目要求：
1. 紧扣课程内容
2. 难度适中，既不太简单也不太难
3. 选项要有迷惑性但只有一个正确答案
4. 解释要详细，帮助学生理解

返回JSON格式：
{
  "questions": [
    {
      "question": "题目内容",
      "options": ["选项A", "选项B", "选项C", "选项D"],
      "correctAnswer": 0,
      "explanation": "详细解释为什么这个答案是正确的"
    }
  ]
}

只返回JSON，不要其他内容。`
            },
            {
              role: 'user',
              content: `课程标题：${currentLesson.title}

课程内容：
${currentLesson.content}

${currentLesson.code ? `代码示例：\n${currentLesson.code}` : ''}

请生成5道选择题测试学生对这节课的理解。`
            }
          ],
          temperature: 0.7,
          max_tokens: 2000
        })
      });

      if (!response.ok) throw new Error('生成失败');

      const data = await response.json();
      const content = data.choices[0]?.message?.content || '';
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      
      if (jsonMatch) {
        const result = JSON.parse(jsonMatch[0]);
        setQuizQuestions(result.questions || []);
      }
    } catch (err) {
      console.error(err);
      alert('生成题目失败，请重试');
      setShowQuiz(false);
    } finally {
      setLoadingQuiz(false);
    }
  };

  // 选择答案
  const handleSelectAnswer = (index: number) => {
    if (showExplanation) return;
    setSelectedAnswer(index);
  };

  // 提交答案
  const handleSubmitAnswer = () => {
    if (selectedAnswer === null) return;
    
    const currentQuestion = quizQuestions[currentQuestionIndex];
    if (selectedAnswer === currentQuestion.correctAnswer) {
      setScore(score + 1);
    }
    setShowExplanation(true);
  };

  // 下一题
  const handleNextQuestion = () => {
    if (currentQuestionIndex < quizQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
    } else {
      setQuizCompleted(true);
    }
  };

  // 重新做题
  const handleRetakeQuiz = () => {
    generateQuiz();
  };

  // 关闭做题
  const handleCloseQuiz = () => {
    setShowQuiz(false);
    setQuizQuestions([]);
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setShowExplanation(false);
    setScore(0);
    setQuizCompleted(false);
  };

  const currentChapter = CHAPTERS.find(c => c.id === selectedChapter);
  const currentLesson = currentChapter?.lessons.find(l => l.id === selectedLesson);

  return (
    <div className="coding-basics-page">
      <div className="coding-header">
        <h1>💻 零基础到逆向工程师</h1>
        <p className="coding-subtitle">从编程入门到协议分析、抓包、逆向的完整学习路径</p>
      </div>

      {!selectedChapter ? (
        <div className="chapters-grid">
          {CHAPTERS.map(chapter => {
            const totalLessons = chapter.lessons.length;
            const completedCount = chapter.lessons.filter(l => 
              completedLessons.has(l.id)
            ).length;
            const progress = (completedCount / totalLessons) * 100;

            return (
              <div 
                key={chapter.id} 
                className="chapter-card"
                onClick={() => setSelectedChapter(chapter.id)}
              >
                <div className="chapter-icon">{chapter.icon}</div>
                <h3>{chapter.title}</h3>
                <p>{chapter.description}</p>
                <div className="chapter-stats">
                  <span>{totalLessons} 节课</span>
                  <span>{completedCount}/{totalLessons} 完成</span>
                </div>
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      ) : !selectedLesson ? (
        <div className="lessons-view">
          <button 
            className="back-btn"
            onClick={() => setSelectedChapter(null)}
          >
            ← 返回章节列表
          </button>
          
          <div className="chapter-header">
            <span className="chapter-icon-large">{currentChapter?.icon}</span>
            <div>
              <h2>{currentChapter?.title}</h2>
              <p>{currentChapter?.description}</p>
            </div>
          </div>

          <div className="lessons-list">
            {currentChapter?.lessons.map(lesson => (
              <div 
                key={lesson.id}
                className={`lesson-item ${completedLessons.has(lesson.id) ? 'completed' : ''}`}
                onClick={() => setSelectedLesson(lesson.id)}
              >
                <div className="lesson-check">
                  {completedLessons.has(lesson.id) ? '✓' : lesson.id}
                </div>
                <div className="lesson-info">
                  <h4>{lesson.title}</h4>
                  <span className="lesson-duration">⏱ {lesson.duration}</span>
                </div>
                <span className="lesson-arrow">→</span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="lesson-view">
          <button 
            className="back-btn"
            onClick={() => setSelectedLesson(null)}
          >
            ← 返回课程列表
          </button>

          <div className="lesson-header">
            <h2>{currentLesson?.title}</h2>
            <span className="lesson-duration">⏱ {currentLesson?.duration}</span>
          </div>

          <div className="lesson-content">
            <div className="content-text">
              {currentLesson?.content.split('\n').map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </div>

            {currentLesson?.code && (
              <div className="code-block">
                <div className="code-header">
                  <span>💻 代码示例</span>
                </div>
                <pre><code>{currentLesson.code}</code></pre>
              </div>
            )}

            {currentLesson?.exercise && (
              <div className="exercise-block">
                <h4>🎯 练习</h4>
                <p>{currentLesson.exercise}</p>
              </div>
            )}
          </div>

          <div className="lesson-actions">
            <button 
              className={`complete-btn ${completedLessons.has(currentLesson!.id) ? 'completed' : ''}`}
              onClick={() => toggleComplete(currentLesson!.id)}
            >
              {completedLessons.has(currentLesson!.id) ? '✓ 已完成' : '标记为完成'}
            </button>
            <button 
              className="quiz-btn"
              onClick={generateQuiz}
            >
              📝 开始做题
            </button>
          </div>

          {/* 做题界面 */}
          {showQuiz && (
            <div className="quiz-overlay">
              <div className="quiz-modal">
                {loadingQuiz ? (
                  <div className="quiz-loading">
                    <div className="spinner"></div>
                    <p>正在生成题目...</p>
                  </div>
                ) : quizCompleted ? (
                  <div className="quiz-result">
                    <h3>🎉 测试完成！</h3>
                    <div className="score-display">
                      <div className="score-number">{score}/{quizQuestions.length}</div>
                      <div className="score-label">正确率: {Math.round((score / quizQuestions.length) * 100)}%</div>
                    </div>
                    {score === quizQuestions.length && (
                      <p className="perfect-score">🌟 完美！你完全掌握了这节课的内容！</p>
                    )}
                    {score >= quizQuestions.length * 0.6 && score < quizQuestions.length && (
                      <p className="good-score">👍 不错！继续加油！</p>
                    )}
                    {score < quizQuestions.length * 0.6 && (
                      <p className="low-score">💪 建议重新学习这节课，然后再试一次！</p>
                    )}
                    <div className="quiz-result-actions">
                      <button className="retake-btn" onClick={handleRetakeQuiz}>
                        🔄 重新测试
                      </button>
                      <button className="close-quiz-btn" onClick={handleCloseQuiz}>
                        关闭
                      </button>
                    </div>
                  </div>
                ) : quizQuestions.length > 0 && (
                  <div className="quiz-content">
                    <div className="quiz-header">
                      <h3>📝 课程测试</h3>
                      <button className="close-btn" onClick={handleCloseQuiz}>✕</button>
                    </div>
                    
                    <div className="quiz-progress">
                      <span>题目 {currentQuestionIndex + 1} / {quizQuestions.length}</span>
                      <div className="progress-bar">
                        <div 
                          className="progress-fill"
                          style={{ width: `${((currentQuestionIndex + 1) / quizQuestions.length) * 100}%` }}
                        />
                      </div>
                    </div>

                    <div className="question-section">
                      <h4>{quizQuestions[currentQuestionIndex].question}</h4>
                      <div className="options-list">
                        {quizQuestions[currentQuestionIndex].options.map((option, index) => (
                          <div
                            key={index}
                            className={`option-item ${
                              selectedAnswer === index ? 'selected' : ''
                            } ${
                              showExplanation && index === quizQuestions[currentQuestionIndex].correctAnswer
                                ? 'correct'
                                : ''
                            } ${
                              showExplanation && selectedAnswer === index && index !== quizQuestions[currentQuestionIndex].correctAnswer
                                ? 'wrong'
                                : ''
                            }`}
                            onClick={() => handleSelectAnswer(index)}
                          >
                            <span className="option-letter">{String.fromCharCode(65 + index)}</span>
                            <span className="option-text">{option}</span>
                          </div>
                        ))}
                      </div>

                      {showExplanation && (
                        <div className="explanation-box">
                          <h5>💡 解析</h5>
                          <p>{quizQuestions[currentQuestionIndex].explanation}</p>
                        </div>
                      )}
                    </div>

                    <div className="quiz-actions">
                      {!showExplanation ? (
                        <button 
                          className="submit-answer-btn"
                          onClick={handleSubmitAnswer}
                          disabled={selectedAnswer === null}
                        >
                          提交答案
                        </button>
                      ) : (
                        <button 
                          className="next-question-btn"
                          onClick={handleNextQuestion}
                        >
                          {currentQuestionIndex < quizQuestions.length - 1 ? '下一题' : '查看结果'}
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
