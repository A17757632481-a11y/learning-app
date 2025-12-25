# Requirements Document

## Introduction

大白话翻译网站是一个帮助用户理解各类专业术语、行话、外来词的在线工具。它将复杂的中英文词汇翻译成通俗易懂的"大白话"解释，配合生动的比喻和例子，让用户轻松理解并记忆。网站还提供生词本管理和做题练习功能，帮助用户巩固学习成果。

## Glossary

- **Translator**: 翻译系统，负责将用户输入的词汇转换为大白话解释
- **Vocabulary_Book**: 生词本，用于存储用户收藏的词汇
- **Quiz_System**: 做题系统，根据生词本内容生成练习题目
- **TTS_Service**: 文字转语音服务，用于播放英文发音
- **Translation_Result**: 翻译结果，包含大白话解释、比喻、应用场景等内容

## Requirements

### Requirement 1: 词汇翻译

**User Story:** As a 用户, I want 输入任何中英文词汇并获得大白话解释, so that 我能轻松理解复杂的专业术语和行话。

#### Acceptance Criteria

1. WHEN 用户输入一个词汇并提交 THEN THE Translator SHALL 返回该词汇的大白话解释
2. THE Translation_Result SHALL 包含以下内容：通俗解释、生活化比喻、本质说明、应用场景、英文表达和音标
3. WHEN 用户输入中文词汇 THEN THE Translator SHALL 提供对应的英文翻译和音标
4. WHEN 用户输入英文词汇 THEN THE Translator SHALL 提供中文大白话解释
5. THE Translator SHALL 支持翻译专业术语、行业黑话、外来词、书面正式词和基础词汇

### Requirement 2: 英文发音播放

**User Story:** As a 用户, I want 听到英文词汇的正确发音, so that 我能学习正确的英语读音。

#### Acceptance Criteria

1. WHEN 翻译结果显示后 THEN THE TTS_Service SHALL 提供英文发音播放按钮
2. WHEN 用户点击播放按钮 THEN THE TTS_Service SHALL 播放该英文词汇的发音
3. THE TTS_Service SHALL 提供清晰准确的英语发音

### Requirement 3: 生词本管理

**User Story:** As a 用户, I want 将查询过的词汇加入生词本, so that 我能随时复习这些词汇。

#### Acceptance Criteria

1. WHEN 翻译结果显示后 THEN THE System SHALL 提供"加入生词本"按钮
2. WHEN 用户点击"加入生词本" THEN THE Vocabulary_Book SHALL 保存该词汇及其完整翻译结果
3. WHEN 词汇成功加入 THEN THE System SHALL 显示当前生词本中的词汇总数
4. THE Vocabulary_Book SHALL 持久化存储用户的所有收藏词汇
5. WHEN 用户查看生词本 THEN THE System SHALL 显示所有已收藏的词汇列表
6. WHEN 用户在生词本中选择一个词汇 THEN THE System SHALL 显示该词汇的完整翻译结果
7. IF 用户尝试添加已存在的词汇 THEN THE System SHALL 提示该词汇已在生词本中

### Requirement 4: 做题练习

**User Story:** As a 用户, I want 通过做题来巩固记忆生词本中的词汇, so that 我能更好地掌握这些词汇。

#### Acceptance Criteria

1. WHEN 用户进入做题模式 THEN THE Quiz_System SHALL 从生词本中随机抽取词汇生成题目
2. THE Quiz_System SHALL 通过描述生活场景或比喻来出题，而不是直接询问词义
3. WHEN 题目显示后 THEN THE System SHALL 提供输入框让用户输入答案
4. WHEN 用户提交答案 THEN THE Quiz_System SHALL 判断答案正确性并显示结果
5. WHEN 用户回答正确 THEN THE System SHALL 显示鼓励信息并可进入下一题
6. WHEN 用户回答错误 THEN THE System SHALL 显示正确答案并再次展示大白话解释
7. IF 生词本为空 THEN THE Quiz_System SHALL 提示用户先添加词汇到生词本

### Requirement 5: 用户界面

**User Story:** As a 用户, I want 使用简洁直观的界面, so that 我能快速高效地使用翻译和学习功能。

#### Acceptance Criteria

1. THE System SHALL 提供清晰的搜索输入框用于词汇查询
2. THE System SHALL 提供明显的导航让用户切换翻译、生词本、做题功能
3. THE Translation_Result SHALL 以结构化、易读的格式展示
4. THE System SHALL 在移动设备和桌面设备上都能正常使用
5. WHEN 系统正在处理请求 THEN THE System SHALL 显示加载状态指示
