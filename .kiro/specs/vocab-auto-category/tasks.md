# Implementation Plan: 生词本自动分类

## Overview

为生词本添加自动分类功能，包括数据类型扩展、翻译服务修改、生词本服务扩展和 UI 更新。

## Tasks

- [x] 1. 扩展数据类型
  - [x] 1.1 在 `src/types/index.ts` 中添加 `VocabCategory` 类型和 `VOCAB_CATEGORIES` 常量
    - 定义分类类型：日常生活、工作职场、科技数码、情感表达、学术教育、其他
    - _Requirements: 1.3_
  - [x] 1.2 在 `TranslationResult` 接口中添加 `category` 字段
    - _Requirements: 1.1, 1.2_

- [x] 2. 修改翻译服务
  - [x] 2.1 更新 `src/services/translateService.ts` 的 prompt
    - 在 JSON 格式中添加 category 字段要求
    - _Requirements: 1.1_
  - [x] 2.2 更新 `parseResponse` 函数解析分类
    - 处理分类缺失或无效的情况，默认为"其他"
    - _Requirements: 1.1_

- [x] 3. 扩展生词本服务
  - [x] 3.1 在 `src/services/vocabService.ts` 中添加 `getWordsByCategory` 方法
    - 按分类筛选词汇
    - _Requirements: 2.2_
  - [x] 3.2 添加 `getCategoryStats` 方法
    - 返回各分类的词汇数量统计
    - _Requirements: 2.4_
  - [x] 3.3 处理向后兼容
    - 旧数据没有 category 字段时默认为"其他"
    - _Requirements: 1.2_
  - [x] 3.4 编写属性测试
    - **Property 1: 分类信息持久化**
    - **Property 2: 分类筛选正确性**
    - **Property 3: 分类统计一致性**
    - **Validates: Requirements 1.2, 2.2, 2.4**

- [x] 4. 更新生词本页面 UI
  - [x] 4.1 创建分类标签栏组件
    - 显示所有分类和"全部"选项
    - 显示各分类词汇数量
    - _Requirements: 2.1, 2.4_
  - [x] 4.2 实现分类筛选逻辑
    - 点击分类标签筛选词汇
    - 点击"全部"显示所有词汇
    - _Requirements: 2.2, 2.3_
  - [x] 4.3 更新页面样式
    - 添加分类标签栏样式
    - _Requirements: 2.1_

- [x] 5. Checkpoint - 确保所有测试通过
  - 运行测试验证功能正确性
  - 如有问题请询问用户

## Notes

- 向后兼容：旧数据自动归类为"其他"
- 属性测试使用 fast-check 库
