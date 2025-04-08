---
sidebar_position: 1
---

# benchmark

# Performance on multi-hop factual QA tasks
The EM and F1 metrics of the version V0.6 of KAG, using the same experiment configuration as the KAG technical report ([https://arxiv.org/pdf/2409.13731](https://arxiv.org/pdf/2409.13731)), are as follows:

| **** | **HotpotQA** | | **2Wiki** | | **MuSiQue** | **Average** |
| --- | --- | --- | --- | --- | --- | --- |
| | EM | F1 | EM | F1 | EM | F1 | EM | F1 |
| GraphRAG | 0 |  | 0 |  | 0 |  | 0 |  |
| lightRAG | 0 |  | 0 |  | 0 |  | 0 |  |
| KAG TechReport<br/>（DeepSeek-V2 API） | 62.5 | 76.2 | 67.8 | 76.2 | 36.7 | 48.7 | 55.6 | 67.0 |
| V0.6<br/>（DeepSeek-V2.5 API） | 60.9 | 75.4 | 69.6 | 78.6 | 36.1 | 48.2 | 55.5 | 67.4 |


Note: The metrics of the KAG technical report are taken from Table 10 of the original text.

# Performance on query-focused summarization (QFS) tasks
+ **Dataset**

To evaluate the performance of KAG on query-focused summarization tasks, we compared the outputs of KAG and LightRAG on the [UltraDomain](https://huggingface.co/datasets/TommyChien/UltraDomain/tree/main) **cs.jsonl** dataset. Please refer to [KAG Example: CSQA](https://github.com/OpenSPG/KAG/tree/master/kag/examples/csqa).

The **cs.jsonl** file contains 10 documents from the field of Computer Science, along with 100 questions and their corresponding answers based on these documents. Unlike the comparison method in the LightRAG paper, we used the questions provided in the **cs.jsonl** file rather than generating questions using a large language model for evaluation. Additionally, when calculating the factual correctness metric, we used the answers to the questions in the **cs.jsonl** file as the ground-truth.

+ **Quantitative evaluation results**

| **** | **KAG** | **LightRAG** |
| --- | --- | --- |
| Comprehensiveness（0~10） | 7.57 | 8.87 |
| Diversity（0~10） | 6.87 | 8.28 |
| Empowerment（0~10） | 7.54 | 8.53 |
| Factual Correctness（0~1） | 0.365 | 0.352 |
| Construction time consumption | 4800 seconds | 3400 seconds |
| Construction token consumption   | 7,006 K | 4,428 K |
| Basic experiment configuration | generative model: deepseek-chat<br/>representational model: bge-m3<br/>concurrency:<br/>50 (num_threads_per_chain=50, num_chains=16)<br/>chunk size:<br/>(split_length=4950, window_length=100) | generative model: deepseek-chat<br/>representational model: bge-m3<br/>concurrency:<br/>50 (llm_model_max_async=50, embedding_func_max_async=50)<br/>chunk size:<br/>(chunk_token_size=1200, chunk_overlap_token_size=100) |


+ **Metric Interpretation**

In this release, from the perspective of metrics, KAG has shown improvement in summarization tasks compared to the previous version, but there is still a gap compared to LightRAG. At the same time, in order to support both summarization generation and factual question answering, more work was done during knowledge extraction, which increased token consumption. We will continue to optimize this in future versions.

EM and F1 metrics are not shown in the table because when we used the HotpotQA dataset for construction and evaluation, we found that the outputs of LightRAG, GraphRAG, and KAG (using the optimized prompt) all yielded an EM of 0 and an F1 close to 0 when compared to the HotpotQA evaluation dataset. We believe that EM and F1 are not suitable for evaluating the outputs of summarization tasks.



We also acknowledge that the four evaluation metrics in the table are not perfect.

+ **Comprehensiveness**, **Diversity**, and **Empowerment** metrics are sensitive to the order of the answers during evaluation. Please refer to this [issue](https://github.com/HKUDS/LightRAG/issues/438) and the LightRAG paper.
+ **Factual Correctness** depends on large language models, and the output is unstable. We also experimented with the Factual Correctness calculation method from RAGAS, but it was even more unstable than the method shown in the CSQA example.

If you have more reasonable evaluation methods, please feel free to provide feedback.



