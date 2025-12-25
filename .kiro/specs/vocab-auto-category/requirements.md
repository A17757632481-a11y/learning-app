# Requirements Document

## Introduction

生词本自动分类功能，让 AI 在翻译时自动为词汇分配类别，用户可以在生词本中按类别筛选和查看词汇，提升词汇管理和学习效率。

## Glossary

- **Category_Service**: 词汇分类服务，负责管理和获取分类信息
- **Vocab_Page**: 生词本页面组件，展示分类筛选和词汇列表
- **Translate_Service**: 翻译服务，在翻译时获取词汇分类

## Requirements

### Requirement 1: AI 自动分类

**User Story:** As a 用户, I want 翻译词汇时自动获得分类, so that 我不需要手动整理词汇类别。

#### Acceptance Criteria

1. WHEN 用户翻译一个词汇 THEN THE Translate_Service SHALL 返回该词汇的分类标签
2. WHEN 词汇被添加到生词本 THEN THE Vocab_Service SHALL 保存词汇的分类信息
3. THE Category_Service SHALL 支持以下预设分类：日常生活、工作职场、科技数码、情感表达、学术教育、其他

### Requirement 2: 分类筛选显示

**User Story:** As a 用户, I want 在生词本中按分类筛选词汇, so that 我可以专注学习某一类词汇。

#### Acceptance Criteria

1. WHEN 用户打开生词本页面 THEN THE Vocab_Page SHALL 显示分类标签栏
2. WHEN 用户点击某个分类标签 THEN THE Vocab_Page SHALL 只显示该分类下的词汇
3. WHEN 用户点击"全部"标签 THEN THE Vocab_Page SHALL 显示所有词汇
4. THE Vocab_Page SHALL 在每个分类标签旁显示该分类的词汇数量

### Requirement 3: 分类统计

**User Story:** As a 用户, I want 看到各分类的词汇数量统计, so that 我了解自己的词汇分布情况。

#### Acceptance Criteria

1. WHEN 生词本有词汇时 THEN THE Vocab_Page SHALL 显示各分类的词汇数量
2. WHEN 某分类没有词汇时 THEN THE Vocab_Page SHALL 显示该分类数量为 0
