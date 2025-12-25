# Implementation Plan: 大白话翻译网站

## Overview

使用 React + TypeScript 构建前端应用，集成 AI API 进行翻译，使用 localStorage 管理生词本，Web Speech API 实现语音播放。采用渐进式开发，先实现核心服务层，再构建 UI 组件。

## Tasks

- [x] 1. 项目初始化和基础设置
  - 使用 Vite 创建 React + TypeScript 项目
  - 安装依赖：react-router-dom, fast-check (测试)
  - 配置项目结构：src/services, src/components, src/pages
  - _Requirements: 5.1, 5.2_

- [x] 2. 实现核心数据模型和类型定义
  - [x] 2.1 创建 TranslationResult 接口和相关类型
    - 定义 src/types/index.ts
    - 包含所有数据模型接口
    - _Requirements: 1.2_

- [x] 3. 实现生词本服务 (VocabService)
  - [x] 3.1 实现 VocabService 核心功能
    - 创建 src/services/vocabService.ts
    - 实现 addWord, removeWord, getAllWords, getWordCount, hasWord 方法
    - 使用 localStorage 持久化
    - _Requirements: 3.2, 3.3, 3.4, 3.5, 3.7_

  - [x] 3.2 编写生词本添加检索属性测试
    - **Property 1: 生词本添加后可检索**
    - **Validates: Requirements 3.2, 3.5**

  - [x] 3.3 编写生词本数量一致性属性测试
    - **Property 2: 生词本数量一致性**
    - **Validates: Requirements 3.3**

  - [x] 3.4 编写重复添加幂等性属性测试
    - **Property 6: 重复添加幂等性**
    - **Validates: Requirements 3.7**

- [x] 4. 实现做题服务 (QuizService)
  - [x] 4.1 实现 QuizService 核心功能
    - 创建 src/services/quizService.ts
    - 实现 generateQuestion, checkAnswer 方法
    - 题目使用场景/比喻描述，不直接显示原词
    - _Requirements: 4.1, 4.2, 4.4, 4.7_

  - [x] 4.2 编写题目来源属性测试
    - **Property 4: 做题从生词本抽取**
    - **Validates: Requirements 4.1**

  - [x] 4.3 编写答案判断属性测试
    - **Property 5: 答案判断一致性**
    - **Validates: Requirements 4.4**

- [x] 5. 实现语音服务 (TTSService)
  - [x] 5.1 实现 TTSService
    - 创建 src/services/ttsService.ts
    - 使用 Web Speech API 实现 speak, stop, isSupported 方法
    - _Requirements: 2.1, 2.2, 2.3_

- [x] 6. Checkpoint - 服务层测试
  - 确保所有服务层测试通过
  - 如有问题请询问用户

- [x] 7. 实现翻译服务 (TranslateService)
  - [x] 7.1 实现 TranslateService
    - 创建 src/services/translateService.ts
    - 集成 AI API 调用
    - 构造 prompt 获取大白话翻译结果
    - 解析响应为 TranslationResult 格式
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

- [x] 8. 构建 UI 组件
  - [x] 8.1 创建布局和导航组件
    - 创建 src/components/Layout.tsx
    - 实现顶部导航：翻译、生词本、做题
    - _Requirements: 5.2_

  - [x] 8.2 创建翻译结果卡片组件
    - 创建 src/components/TranslationCard.tsx
    - 展示大白话解释、比喻、场景、英文、音标
    - 包含播放按钮和加入生词本按钮
    - _Requirements: 1.2, 2.1, 3.1, 5.3_

  - [x] 8.3 创建做题卡片组件
    - 创建 src/components/QuizCard.tsx
    - 展示场景描述、答案输入框、提交按钮
    - 显示正确/错误反馈
    - _Requirements: 4.2, 4.3, 4.5, 4.6_

- [x] 9. 构建页面
  - [x] 9.1 创建翻译页面
    - 创建 src/pages/TranslatePage.tsx
    - 搜索输入框 + 翻译结果展示
    - 集成翻译服务和语音服务
    - _Requirements: 1.1, 5.1, 5.5_

  - [x] 9.2 创建生词本页面
    - 创建 src/pages/VocabPage.tsx
    - 词汇列表展示 + 点击查看详情
    - 显示词汇总数
    - _Requirements: 3.3, 3.5, 3.6_

  - [x] 9.3 创建做题页面
    - 创建 src/pages/QuizPage.tsx
    - 题目展示 + 答案输入 + 结果反馈
    - 空生词本提示
    - _Requirements: 4.1, 4.3, 4.5, 4.6, 4.7_

- [x] 10. 路由和应用入口
  - [x] 10.1 配置路由和 App 组件
    - 更新 src/App.tsx
    - 配置 react-router-dom 路由
    - 整合所有页面
    - _Requirements: 5.2_

- [x] 11. 样式和响应式设计
  - [x] 11.1 添加全局样式和响应式布局
    - 创建/更新 src/index.css
    - 确保移动端和桌面端适配
    - _Requirements: 5.4_

- [x] 12. Final Checkpoint - 完整功能测试
  - 确保所有功能正常工作
  - 确保所有测试通过
  - 如有问题请询问用户

## Notes

- 所有任务均为必需，确保代码质量
- 每个任务都关联了具体的需求编号便于追溯
- 服务层先于 UI 层开发，确保核心逻辑稳定
- 属性测试验证核心业务逻辑的正确性
