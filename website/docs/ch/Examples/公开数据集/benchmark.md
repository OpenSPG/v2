# benchmark

# 1、多跳事实问答效果
V0.6版本与KAG技术报告（[https://arxiv.org/pdf/2409.13731](https://arxiv.org/pdf/2409.13731)）使用相同配置的EM和F1指标如下：

| **** | **HotpotQA** | | **2Wiki** | | **MuSiQue** | **Average** |
| --- | --- | --- | --- | --- | --- | --- |
| | EM | F1 | EM | F1 | EM | F1 | EM | F1 |
| GraphRAG | 0 |  | 0 |  | 0 |  | 0 |  |
| lightRAG | 0 |  | 0 |  | 0 |  | 0 |  |
| KAG TechReport<br/>（DeepSeek-V2 API） | 62.5 | 76.2 | 67.8 | 76.2 | 36.7 | 48.7 | 55.6 | 67.0 |
| V0.6<br/>（DeepSeek-V2.5 API） | 60.9 | 75.4 | 69.6 | 78.6 | 36.1 | 48.2 | 55.5 | 67.4 |


注：KAG 技术报告指标取自原文 Table 10。

# 2、摘要生成效果
+ **数据集**

为了测试 KAG 在摘要生成类任务上的表现，我们在 [UltraDomain](https://huggingface.co/datasets/TommyChien/UltraDomain/tree/main) cs.jsonl 数据集上对 KAG 和 LightRAG 的输出进行对比，参考 [KAG 示例：CSQA](https://github.com/OpenSPG/KAG/blob/master/kag/examples/csqa/README_cn.md)。

cs.jsonl 包含 10 个计算机科学（Computer Science）领域的文档，和基于此 10 个文档的 100 个问题及其答案。与 LightRAG 论文的比较方法不同，我们使用 cs.jsonl 中自带的问题，而不是用大模型生成问题进行评测。同时，在计算 factual correctness 指标时，我们以 cs.jsonl 自带问题的答案为标准。

+ **量化评测结果：**

| **** | **KAG** | **LightRAG** |
| --- | --- | --- |
| Comprehensiveness（0~10） | 7.57 | 8.87 |
| Diversity（0~10） | 6.87 | 8.28 |
| Empowerment（0~10） | 7.54 | 8.53 |
| Factual Correctness（0~1） | 0.365 | 0.352 |
| 构建时间消耗 | 4800 秒 | 3400 秒 |
| 构建 tokens 消耗 | 700.6 万 | 442.8 万 |
| 基础配置 | 生成模型：deepseek-chat<br/>表示模型：bge-m3<br/>并发数：50(num_threads_per_chain=50, num_chains=16)<br/>ChunkSize: (split_length=4950,window_length=100) | 生成模型：deepseek-chat<br/>表示模型：bge-m3<br/>并发数：50(llm_model_max_async=50, embedding_func_max_async=16)<br/>ChunkSize: (chunk_token_size=1200，chunk_overlap_token_size=100) |


+ **指标解读**

此次发版，从指标上看，KAG 在摘要生成任务上虽然相比上一版有所提高，但和 LightRAG 比还有一定差距；同时，为了同时支持摘要生成+事实问答，在知识抽取时做了更多的工作，加剧了tokens 消耗，后续我们会持续优化。

该表未展示 EM 和 F1 指标，这是因为我们用 HotpotQA 数据进行构建和测试发现，LightRAG、GraphRAG 和 KAG（使用优化后的 prompt）输出和 HotpotQA 评估集对比算出的 EM 都是 0、F1 接近 0，我们认为 EM 和 F1 不适合评估摘要生成类任务的输出。



我们也了解到上表中的四个评价指标都不太完美。

+ Comprehensiveness、Diversity 和 Empowerment 指标高低依赖评价时答案的顺序，参考 [issue](https://github.com/HKUDS/LightRAG/issues/438) 和 LightRAG 论文。
+ Factual Correctness 依赖大模型，输出不稳定。我们也尝试过 RAGAS 中的 Factual Correctness 计算方法，它比 CSQA 示例中展示的方式更不稳定。

如大家有更合理的评估方式，欢迎反馈。





