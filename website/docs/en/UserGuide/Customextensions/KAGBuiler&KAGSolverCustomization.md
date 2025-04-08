---
sidebar_position: 3
---

# KAGBuiler & KAGSolver Customization

KAG V0.6 introduces a registry-based component management mechanism designed to manage various components within the KAG pipeline, such as `BuilderChain`, `Extractor`, `Reader`, and more. Through this registration mechanism, users can flexibly customize components in the KAG pipeline and register them into the KAG framework, thereby achieving the effect of replacing built-in components. Additionally, the components managed by the registry can be directly instantiated by configuration. By explicitly specifying the configuration for each class object, the flexibility and readability of project configurations are significantly enhanced.

# KAG Registration Mechanism 
  
The registration mechanism of KAG is implemented based on the `kag.common.registry.Registrable` class. All registerable classes must inherit from the base class. Starting from `Registrable`, all subclasses managed by the registry form a tree structure, as shown in the following diagram:

![画板](./img/oirB-SXQAOS8uaSg/1735638603820-d5cd7657-425f-47d5-829e-0802ee94e284-785364.jpeg)

Fig. 1

As shown in Fig. 1, `ReaderABC` serves as the base class for all `Reader` classes, where common interfaces can be defined. Similarly, `LLMClient` acts as the base class for all LLM clients, following the same design pattern to define common behaviors and methods for LLM clients. 

## Description of Registry Interface 
`Registrable` provides two core functions to facilitate the registration mechanism:

1. **register**  
Manages all registered types through a global registry and assigns a unique registration name to each type.
2. **from_config**  
Enables configuration-based instantiation of class objects, simplifying the object creation process.

## Example of Registry Interface
Below is a simple implementation of the `Reader` class shown in Figure 1.

```python
from kag.common.registry import Registrable, Lazy, Functor


class ReaderABC(Registrable):
    def __init__(self, name: str):
        self.name = name

    def invoke(self, file_path):
        raise NotImplementedError("invoke not implement yet")

class RunnerABC(Registrable):
    def __init__(self, reader:ReaderABC):
        self.reader=reader


@RunnerABC.register("test_runner")
class TestRunner(RunnerABC):        
    def invoke(self, file_path):
        return self.reader.invoke(file_path)

@ReaderABC.register("docx_reader")
class DocxReader(ReaderABC):
    def invoke(self, file_path):
        print(f"DocxReader read {file_path}")


@ReaderABC.register("pdf_reader")
class PDFReader(ReaderABC):
    def invoke(self, file_path):
        print(f"PDFReader read {file_path}")

pdf_reader = ReaderABC.from_config({"type": "pdf_reader", "name": "111"})
pdf_reader.invoke("a.pdf") # output: PDFReader read a.pdf
docx_reader = ReaderABC.from_config({"type": "docx_reader", "name": "111"})
pdf_reader.invoke("a.docx") #output: DocxReader read a.docx

runner=RunnerABC.from_config(
    {
        "type": "test_runner", 
        "reader": {"type": "pdf_reader", "name": "111"}
    }
)
runner.invoke("aaa.pdf") # output: PDFReader read aaa.pdf
```



+ Key points:
    - Definition of the `ReaderABC` and `RunnerABC` classes, which serve as base classes for all readers and runners respectively. 
    - Implementation of the `DocxReader` and `PDFReader` reader classes, with each class registered using `@ReaderABC.register` under the names `docx_reader` and `pdf_reader`, respectively. 
    - Definition of `TestRunner` as an implementation of `RunnerABC`, registered using `@RunnerABC.register` with the name `test_runner`. 
    - Instantiation of the corresponding objects using the` .from_config` method of their respective base classes.

**Notes:**

The `from_config` function accepts a configuration in dict format and instantiates it into the corresponding object. The rules for writing this configuration are as follows: 

    - The `type` field specifies the registered name of the object to be instantiated. For instance, the registered name for `PDFReader` is `pdf_reader`. 
    - The remaining fields correspond directly to the parameters of the initialization function of the class to be instantiated. For example, if the `__init__` method for all readers accepts a string field named `name`, the configuration must specify a value for it. 
    - If a parameter has a default value, it can be omitted from the configuration. 
    - If the initialization function accepts variable keyword arguments (`**kwargs`), any extra parameters in the configuration will be placed in it. Otherwise, they will be discarded, and a warning will be printed. 
    - The initialization function of a class must specify parameter types because `from_config` automatically converts the configuration to match the parameter types, enabling a recursive instantiation process. For example, if a `Runner` class requires a `reader` parameter of type `ReaderABC`, this reader can be automatically instantiated through the runner's configuration. 
    - Additionally, classes managed by a registry can be instantiated via the `__init__ `function just like regular types.

#  Code Extension
## How to customize code
### Interfaces for Extension
The KAG framework defines several base classes for components based on `Registrable`, all organized under the `kag.interface` module. The code structure is categorized into three main sections:

+ **builder**: Includes components related to knowledge construction.
+ **solver**: Includes components pertinent to knowledge-driven question answering.
+ **common**: Includes general-purpose components, such as prompt templates ,LLM clients, and vectorize models.

```python
.
├── __init__.py
├── builder
│   ├── __init__.py
│   ├── aligner_abc.py
│   ├── base.py
│   ├── builder_chain_abc.py
│   ├── external_graph_abc.py
│   ├── extractor_abc.py
│   ├── mapping_abc.py
│   ├── postprocessor_abc.py
│   ├── reader_abc.py
│   ├── scanner_abc.py
│   ├── splitter_abc.py
│   ├── vectorizer_abc.py
│   └── writer_abc.py
├── common
│   ├── __init__.py
│   ├── llm_client.py
│   ├── prompt.py
│   └── vectorize_model.py
└── solver
    ├── __init__.py
    ├── base.py
    ├── base_model.py
    ├── execute
    │   ├── __init__.py

    │   ├── lf_executor_abc.py
    │   └── lf_sub_query_merger_abc.py
    ├── kag_generator_abc.py
    ├── kag_memory_abc.py
    ├── kag_reasoner_abc.py
    ├── kag_reflector_abc.py
    └── plan
        ├── __init__.py
        └── lf_planner_abc.py
```

### View Extensible Base Classes
KAG provides the `kag interface` command to query the extensible base classes, which contains the following two commands:



+ **List base classes provided by KAG**

```bash
$ kag interface --list
```

A table will be displayed, containing all base classes available for user inheritance and extension.  


```bash
+------------------------+------------------------------------------------------+
| class                  | module                                               |
+========================+======================================================+
| Command                | kag.bin.base                                         |
+------------------------+------------------------------------------------------+
| BuilderChainRunner     | kag.builder.runner                                   |
+------------------------+------------------------------------------------------+
| CheckPointer           | kag.common.checkpointer.base                         |
+------------------------+------------------------------------------------------+
| Registrable            | kag.common.registry.registrable                      |
+------------------------+------------------------------------------------------+
| ShardingInfo           | kag.common.sharding_info                             |
+------------------------+------------------------------------------------------+
| AlignerABC             | kag.interface.builder.aligner_abc                    |
+------------------------+------------------------------------------------------+
| KAGBuilderChain        | kag.interface.builder.builder_chain_abc              |
+------------------------+------------------------------------------------------+
| ExternalGraphLoaderABC | kag.interface.builder.external_graph_abc             |
+------------------------+------------------------------------------------------+
| MatchConfig            | kag.interface.builder.external_graph_abc             |
+------------------------+------------------------------------------------------+
| ExtractorABC           | kag.interface.builder.extractor_abc                  |
+------------------------+------------------------------------------------------+
| MappingABC             | kag.interface.builder.mapping_abc                    |
+------------------------+------------------------------------------------------+
| PostProcessorABC       | kag.interface.builder.postprocessor_abc              |
+------------------------+------------------------------------------------------+
| ReaderABC              | kag.interface.builder.reader_abc                     |
+------------------------+------------------------------------------------------+
| ScannerABC             | kag.interface.builder.scanner_abc                    |
+------------------------+------------------------------------------------------+
| SplitterABC            | kag.interface.builder.splitter_abc                   |
+------------------------+------------------------------------------------------+
| VectorizerABC          | kag.interface.builder.vectorizer_abc                 |
+------------------------+------------------------------------------------------+
| SinkWriterABC          | kag.interface.builder.writer_abc                     |
+------------------------+------------------------------------------------------+
| LLMClient              | kag.interface.common.llm_client                      |
+------------------------+------------------------------------------------------+
| PromptABC              | kag.interface.common.prompt                          |
+------------------------+------------------------------------------------------+
| VectorizeModelABC      | kag.interface.common.vectorize_model                 |
+------------------------+------------------------------------------------------+
| LFExecutorABC          | kag.interface.solver.execute.lf_executor_abc         |
+------------------------+------------------------------------------------------+
| LFSubQueryResMerger    | kag.interface.solver.execute.lf_sub_query_merger_abc |
+------------------------+------------------------------------------------------+
| KAGGeneratorABC        | kag.interface.solver.kag_generator_abc               |
+------------------------+------------------------------------------------------+
| KagMemoryABC           | kag.interface.solver.kag_memory_abc                  |
+------------------------+------------------------------------------------------+
| KagReasonerABC         | kag.interface.solver.kag_reasoner_abc                |
+------------------------+------------------------------------------------------+
| KagReflectorABC        | kag.interface.solver.kag_reflector_abc               |
+------------------------+------------------------------------------------------+
| LFPlannerABC           | kag.interface.solver.plan.lf_planner_abc             |
+------------------------+------------------------------------------------------+
| ChunkRetriever         | kag.solver.retriever.chunk_retriever                 |
+------------------------+------------------------------------------------------+
| ExactKgRetriever       | kag.solver.retriever.exact_kg_retriever              |
+------------------------+------------------------------------------------------+
| FuzzyKgRetriever       | kag.solver.retriever.fuzzy_kg_retriever              |
+------------------------+------------------------------------------------------+
| GraphApiABC            | kag.solver.tools.graph_api.graph_api_abc             |
+------------------------+------------------------------------------------------+
| SearchApiABC           | kag.solver.tools.search_api.search_api_abc           |
+------------------------+------------------------------------------------------+
```

+ **List built-in implementations of a base classes**

```bash
$ kag interface --cls $class_name
```

For example, to list the `LLMClient` implementations provided by the framework, enter:

```bash
$ kag interface --cls LLMClient
```

It will print the following information, which includes the class name, registered name, documentation, input parameters, and example configuration for each subclass of `LLMClient`:

```bash
                    Documentation of LLMClient
A class that provides methods for performing inference using large language model.

This class includes methods to call the model with a prompt, parse the response, and handle batch processing of prompts.
                    Registered subclasses of LLMClient
[kag.common.llm.openai_client.OpenAIClient]
Register Name: "openai" / "maas"

Documentation:
A client class for interacting with the OpenAI API.

Initializes the client with an API key, base URL, streaming option, temperature parameter, and default model.

Initializer:
Initializes the OpenAIClient instance.

Args:
    api_key (str): The API key for accessing the OpenAI API.
    base_url (str): The base URL for the OpenAI API.
    model (str): The default model to use for requests.
    stream (bool, optional): Whether to stream the response. Defaults to False.
    temperature (float, optional): The temperature parameter for the model. Defaults to 0.7.

Required Arguments:
  api_key: str
  base_url: str
  model: str

Optional Arguments:
  stream: bool = False
  temperature: float = 0.7

Sample Useage:
  LLMClient.from_config({'type': 'openai', 'api_key': 'Your api_key config', 'base_url': 'Your base_url config', 'model': 'Your model config', 'stream': False, 'temperature': 0.7})


[kag.common.llm.vllm_client.VLLMClient]
Register Name: "vllm"

Documentation:
A client class for interacting with a language model deployed by VLLM.

This class provides methods to make synchronous requests to the VLLM server, handle model calls, and parse responses.

Initializer:
Initializes the VLLMClient instance.

Args:
    model (str): The model to use for requests.
    base_url (str): The base URL for the VLLM API.

Required Arguments:
  model: str
  base_url: str

Optional Arguments:
  No Optional Arguments found

Sample Useage:
  LLMClient.from_config({'type': 'vllm', 'model': 'Your model config', 'base_url': 'Your base_url config'})


[kag.common.llm.ollama_client.OllamaClient]
Register Name: "ollama"

Documentation:
A client class for interacting with the Ollama API.

This class provides methods to make synchronous requests to the Ollama API, handle model calls, and parse responses.

Initializer:
Initializes the OllamaClient instance.

Args:
    model (str): The model to use for requests.
    base_url (str): The base URL for the Ollama API.

Required Arguments:
  model: str
  base_url: str

Optional Arguments:
  No Optional Arguments found

Sample Useage:
  LLMClient.from_config({'type': 'ollama', 'model': 'Your model config', 'base_url': 'Your base_url config'})


[kag.common.llm.mock_llm.MockLLMClient]
Register Name: "mock"

Documentation:
MockLLMClient is a mock implementation of the LLMClient class, used for testing purposes.

This class provides a method to simulate the behavior of a language model client by matching input prompts.

Initializer:
Initializes the MockLLMClient instance.

Required Arguments:
  No Required Arguments found

Optional Arguments:
  No Optional Arguments found

Sample Useage:
  LLMClient.from_config({'type': 'mock'})

```

### Steps to implement interface
+ Inherit from `LLMClient` to implement a `MockLLMClient` subclass that returns fixed content.

```python
import json
from kag.interface import LLMClient


# Register MockLLMClient with the registration name mock_llm into the base class LLMClient.
@LLMClient.register("mock_llm")
class MockLLMClient(LLMClient):
    def __init__(self):
        pass

    def __call__(self, prompt):
        return json.dumps({"input": prompt, "output": "Hello, world!"})

    def call_with_json_parse(self, prompt):
        return {"input": prompt, "output": "Hello, world!"}

```

+ Assume the custom `MockLLMClient` code is stored in the file `./llm/mock_llm.py`. Use the following code to execute the call:

```python
from kag.interface import LLMClient
from kag.common.registry import import_modules_from_path

# Important: We need to explicitly import the custom code to ensure that the registration takes effect.
import_modules_from_path("./llm")

llm = LLMClient.from_config({"type": "mock_llm"})
llm("who are you?")
```

Note: For custom code, we need to explicitly import the code directory (to ensure the `@BaseClass.register` statement is executed) in order to load the class into the registry. For KAG built-in components, registration is automatically performed and no explicit registration is required.

## Extending the KAG Builder Pipeline
The purpose of the KAG Builder is to construct a knowledge graph index for a given set of documents, supporting subsequent question-answer  applications. The entry point for the KAG Builder is the `kag.builder.runner.BuilderChainRunner`, and its overall execution flow is illustrated in the diagram below. Provided with a dataset, the `BuilderChainRunner` first executes the `Scanner` to scan the data. It then proceeds to the `BuilderChain`, executing each component in sequence, ultimately completing the construction of the knowledge graph. 

![画板](./img/oirB-SXQAOS8uaSg/1735787060198-b2e8b124-a576-4f60-a385-c6891eb1cfe0-642306.jpeg)



Notes:

1. Unless otherwise specified, the entry point for each component in the diagram is `invoke()`. Users can override this function to implement custom components.
2. Use `kag interface --cls ${BaseClass}` to view the documentation of each component and the built-in implementations.

### Scanner
**Base class：**`**kag.interface.ScannerABC**`

The `Scanner` is responsible for scanning data sources and distributing data to the downstream `BuilderChain`. Data sources are divided into two  categories:

1. Files in formats such as CSV or JSON, where each file may contain **multiple** records.
2. A single file or directory, where each file is treated as a **single** record.

In addition to the `invoke` method, the `Scanner` also provides a `generate` method. Their functionalities are as follows:

+ **invoke**  
Returns all records at once in a list structure.
+ **generate**  
Returns an iterator that yields one record at a time.



The design of `Scanner` takes the  distributed data construction in to account. Specifically, Scanner automatically calculates the range of data sources that the current worker needs to process based on the total number of workers and the worker's rank. For example, for a file containing 200 records, if two workers are executing the construction task simultaneously, worker1 and worker2 will be responsible for the first 100 and the last 100 records, respectively. Users can extend `Scanner` based on this functionality to support additional data sources, such as database tables.



To execute tasks in a distributed environment, the total number of workers and the worker's rank need to be set for the `Scanner` on each worker. The configuration can be done in the following ways:

+ Pass `rank` and `world_size` as keyword arguments in `__init__`

`rank` and `world_size` is the worker's rank and the total number of workers, respectively, consistent with PyTorch. Examle: `MyScanner(rank=0, world_size=1)`

+ Submit distributed tasks via PyTorchJob or TensorFlowJob in a Kubeflow environment.

 KAG will automatically detect the  `rank` and `world_size` from environment variables, requiring no additional configuration.



Additionally, it is important to note that `Scanner` is only responsible for data scanning and distribution. The actual reading and parsing of data are handled by the  downstream`Reader` component in the `BuilderChain`. For example, `DirectoryScanner` just outputs the filenames in the directory that meet the constraints, without actually reading the file contents; the file contents are read in the subsequent `Reader`.



The KAG framework includes the following built-in implementations of Scanner:

+ **CSVScanner**

Scans a single CSV file, treating each row as a data record and returning it in dictionary (dict) format.



+ **JSONScanner**

Scans a single JSON file, which must be in `List[Dict]` structure, and returns each dictionary object in the list as a data record.



+ **FileScanner**

Reads a single file and returns its file path. If the filename is an HTTP url, it automatically downloads the file  and returns the local file path.

+ **DirectoryScanner**

Scans a directory and its subdirectories, retrieves all file paths that meet certain criteria, and returns each filename as a record.



### BuilderChain
**Base clasee：**`**kag.interface.KAGBuilderChain**`

****

`BuilderChain` is responsible for executing the actual knowledge graph build tasks. It accomplishes specific tasks by chaining together tool components such as reader, splitter, mapping, extractor, aligner, and vectorizer.



The KAG framework includes two default implementations: `DefaultStructuredBuilderChain` and `DefaultUnstructuredBuilderChain`, which are used for structured and unstructured build tasks, respectively:



+ **DefaultStructuredBuilderChain**

Executes the mapping, vectorizer, and writer components in sequence, primarily used to directly import existing structured graph data into a graph database.



+ **DefaultUnstructuredBuilderChain**

Executes the reader, splitter, extractor, vectorizer, postprocessor, and writer components in sequence, primarily used to build graph indexes for unstructured data (e.g., text data).



Users can customize new `BuilderChain` implementations, but in most cases, we recommend using these two default implementations directly and defining custom build pipelines (by creating custom tool components). This approach provides better support for concurrency performance, checkpointing, and more.



#### Reader
**Base class：**`**kag.interface.ReaderABC**`

****

The `Reader` component provides the capability to read files in various formats. By working with the upstream `Scanner`, it can transform data into `Chunk` objects. Below are several typical use cases:



1. Reading CSV/JSON Files

Use `CSVScanner` or `JSONScanner` to convert each record in the file into a `Dict` object, then use `DictReader` to map the dictionary fields to the attributes of the `Chunk`.



2. Reading a Single File

Use `FileScanner` to obtain the file path, then use the corresponding Reader to read the file content and convert it into a `Chunk` object.



3. Reading TXT Files in a Directory

Use `DirectoryScanner` to retrieve the paths of all TXT files in the directory, then use `TXTReader` to read the file content and convert it into a `Chunk` object.



4. Reading All Supported Files in a Directory (e.g., PDF, TXT, DOCX, MD, etc.)

Use `DirectoryScanner` to retrieve the paths of all files in the directory, then use `MixReader` to read the file content based on the file extension and convert it into a `Chunk` object.

#### Splitter
**Base class： **`**kag.interface.SplitterABC**`

The `Splitter` is designed to split the content of output `Chunk` objects to prevent document content from exceeding the threshold set by the LLM. For example, `LengthSplitter` employs a sliding window strategy to divide the content of a `Chunk` into multiple `Chunk` objects based on a predefined length.

#### Extractor
**Base class: **`**kag.interface.ExtractorABC**`

The `Extractor` is a core component of the build pipeline, responsible for extracting key information from unstructured data and building a knowledge graph. KAG provides two built-in Extractor components:

+ **SchemaFreeExtractor**

This extractor imposes fewer restrictions on the extraction model, thereby allowing the LLMto identify a greater number of key entities.

+ **SchemaConstraintExtractor**

This extractor directs the LLM to execute entity and event extraction in alignment with the schema's specifications by reading and parsing the schema file. In specific vertical domains, there may be a need for more granular entity extraction, such as distinguishing entities with unique attributes. Furthermore,  there is also an objective to extract events that involve multiple subject and object entities. 

For instance, a schema file designed for a news knowledge graph could be structured as follows:

```yaml
namespace News

Chunk(文本块): EntityType
     properties:
        content(内容): Text
            index: TextAndVector

Date(日期): EntityType
     properties:
        info(信息): Text
            index: TextAndVector

GeographicLocation(地理位置): EntityType
     properties:
        type(Type): Text
            desc: The specific type of geographic location, such as country, region, province, or city.

Entity(实体): EntityType
     desc: A named object or concept with specific meaning, such as a person, organization, product, etc.
     properties:
         type(Type): Text

NewsEvent(新闻事件): EventType
     properties:
       time(时间): Date
           desc: The specific point or period of time when the event occurred.
       location(地点): GeographicLocation
           desc: The specific location or area where the event took place.
       subject(主体): Entity
           desc: The subject of the event, i.e., the main participant of the event.
       relation(关系): Text
           desc: The name of the relationship, i.e., the main action or behavior of the event.
       object(客体): Entity
           desc: The object of the event, i.e., the secondary participant or target of the event.
           constraint: MultiValue
       cause(原因): Text
           desc: The cause or motivation behind the event.
       process(过程): Text
           desc: The process or steps of the event.
       outcome(结果): Text
           desc: The result or impact generated after the event.
       context(背景): Text
           desc: The background or environment in which the event occurred.
       impact(影响): Text
           desc: The impact of the event on relevant parties or society.
```

The aforementioned schema not only defines entities and their properties but also specifies the `NewsEvent` under the EventType. This type includes several attributes, some of which are simple text types, such as `cause` and `process`, while others are entity types defined within the schema, such as `time`, `location` and `subject`. Additionally, certain attributes incorporate `MultiValue` constraints, such as `object`.

The schema-constrained knowledge extraction approach can instruct the LLM to perform extraction tasks based on the constraints defined in the schema. Below is an example of a possible input and output for event extraction:

```yaml

{
  "input": "On the afternoon of August 27th, Beijing time, U.S. National Security Advisor Jake Sullivan arrived in Beijing by plane, beginning his first visit to China during his tenure. The host noted that almost all members of the accompanying delegation could speak Chinese, and Sullivan himself had previously visited China in 2015 to attend the 'Understanding China' International Conference. This visit to China involves such a large number of Chinese-speaking representatives, indicating the hope that Sullivan can truly understand China during this trip.",
  "output": [
    {
      "category": "NewsEvent",
      "name": "Sullivan's First Visit to China During His Tenure",
      "properties": {
        "cause": null,
        "impact": null,
        "relation": "Visit to China",
        "context": "U.S. National Security Advisor Jake Sullivan arrived in Beijing by plane, beginning his first visit to China during his tenure",
        "subject": [
          {
            "name": "Jake Sullivan",
            "type": "Political Figure"
          }
        ],
        "time": {
          "name": "On the afternoon of August 27th, Beijing time"
        },
        "outcome": "First visit to China during his tenure",
        "location": {
          "name": "Beijing",
          "type": "City"
        },
        "process": null,
        "object": [
          {
            "name": "China",
            "type": "Country"
          }
        ]
      }
    },
    {
      "category": "NewsEvent",
      "name": "Sullivan Attended the 'Understanding China' International Conference in 2015",
      "properties": {
        "cause": null,
        "impact": null,
        "relation": "Attend Conference",
        "context": "Sullivan himself had previously visited China in 2015 to attend the 'Understanding China' International Conference",
        "subject": [
          {
            "name": "Jake Sullivan",
            "type": "Political Figure"
          }
        ],
        "time": {
          "name": "2015"
        },
        "outcome": null,
        "location": {
          "name": "China",
          "type": "Country"
        },
        "process": null,
        "object": [
          {
            "name": "'Understanding China' International Conference",
            "type": "Conference"
          }
        ]
      }
    }
  ]
}
```

As shown in the example, an event contains multiple attributes, and each attribute value aligns with the types defined in the schema.  
The extraction of entity types is similar to that of event types, and complex entity types along with their attributes can also be defined following the above example.

`****`**Notes:**

1. For the complete workflow of schema-constrained knowledge extraction, refer to the encyclopedia data QA example: `examples/baike`.
2. The current version (v0.6) only supports the `MultiValue` attribute in the `constrains` field of SPG schema, while `NotNull` constraints are not yet supported.

#### Mapping
**Base class: kag.interface.MappingABC**

The `Mapping` component serves a similar purpose to `Extractor`, directly transforming structured data into nodes (points) or edges (relationships) to construct a knowledge graph. KAG provides the following built-in implementations of Mapping components:

+ **SPGTypeMapping**

Constructs a subgraph based on the `SPGType` object.

+ **RelationMapping**

Used in structured data to map the subject, predicate, and object attributes of relational data.

+ **SPOMapping**

Constructs a subgraph based on the given SPO (Subject, Predicate, Object) triple.

#### Vectorizer
**Base class: **`**kag.interface.VectorizerABC**`

The `Vectorizer` is responsible for creating vector indexes for graph nodes generated by the `Extractor` or `Mapping` components. Users can configure whether to generate vector indexes for each entity or event attribute in the schema file. For example:

```python
namespace News

Chunk(文本块): EntityType
     properties:
        content(内容): Text        
          index: TextAndVector # create text and vector indices for `content` property
```

KAG provides a built-in implementation called `BatchVectorizer`, which supports batch creation of vector indexes for node attributes in the graph. Users need to specify the model to be invoked in the `vectorize_model` property or configuration item, such as a locally deployed vectorize model or an embedding API provided by a model service provider.

#### PostProcessor
**Base class: **`**kag.interface.PostProcessorABC**`

The `PostProcessor` is responsible for performing additional processing tasks before writing graph to the graph database. The built-in `KAGPostProcessor`primarily performs the following operations:



+ Filters out invalid data, such as nodes or edges missing required fields.
+ Entity linking, which establishes an `similar` edge between nodes in the  graph and similar nodes  in the graph database.

#### Writer
**Base class: **`**kag.interface.SinkWriterABC**`

The `Writer` is responsible for writing the final constructed knowledge graph data into graph storage. Since SPGServer abstracts away the interaction operations with the backend graph database, making it transparent to users on the Python side, there is no need to override this class. Users can directly use the built-in `KGWriter` implementation.

## Extending the KAG solver Pipeline 
### Reasoner
**Base class：**`**kag.interface.solver.kag_reasoner_abc.KagReasonerABC**`

```python
    @abstractmethod
    def reason(self, question: str, **kwargs) -> LFExecuteResult:
        """
        Processes a given question by planning and executing logical forms to derive an answer.

        Parameters:
        - question (str): The input question to be processed.

        Returns:
        LFExecuteResult
        - solved_answer: The final answer derived from solving the logical forms.
        - supporting_fact: Supporting facts gathered during the reasoning process.
        - history_log: A dictionary containing the history of QA pairs and re-ranked documents.
        """
```

This module performs reasoning and solving on the input question, returning the final answer, supporting facts, and execution logs. Currently, KAG has only one default implementation: `kag.solver.implementation.default_reasoner.DefaultReasoner`. This module consists of two parts, `Planner` and `Executor`, both of which are extensible.

#### Planner
**Base class: **`**kag.interface.solver.plan.lf_planner_abc.LFPlannerABC**`

The `Planner` is responsible for planning the input query and memory into a symbolic representation of Logic Form.

```python
    def lf_planing(self, question: str, memory: KagMemoryABC = None, llm_output=None) -> List[LFPlan]:
        """
        Method that should be implemented by all subclasses for planning logic.
        This is a default impl

         :
        question (str): The question or task to plan.
        memory (KagMemoryABC): the execute memory. Defaults to None.
        llm_output (Any, optional): Output from the LLM module. Defaults to None.

        Returns:
        list of LFPlanResult
        """
        return []
```

KAG provides a built-in LLM-based planner: `kag.solver.plan.default_lf_planner.DefaultLFPlanner`. This planner implements planning capabilities by invoking the prompt template: `kag/solver/prompt/default/logic_form_plan.py`. Currently, its capabilities primarily rely on the LLM itself, and this component will be enhanced in future releases of KAG.

#### Executor
**Base class：**`**kag.interface.solver.execute.lf_executor_abc.LFExecutorABC**`

The `Executor` is responsible for executing the planning results generated by the `Planner`. Its default implementation is based on the three-layer architecture of KAG, as shown in the following diagram:

![1736070684921-f801399b-11e5-4afa-9300-01eeb4aa8a0b.png](./img/oirB-SXQAOS8uaSg/1736070684921-f801399b-11e5-4afa-9300-01eeb4aa8a0b-715149.png)



+ **KG Schema-Constraint**  
This part of the knowledge strictly adheres to schema constraints, offering high accuracy but lower coverage.
+ **KG Schema-Free**  
This part consists of a graph constructed through open extraction. Compared to KG Schema-Constraint, it has reduced accuracy but higher coverage.
+ **Raw text Chunks**  
This part stores chunked documents, providing high coverage but lacking precise knowledge descriptions.

Based on the characteristics of the above three types of data, the `Executor` also implements three different types of retrievers.



##### Exact KGRetriever
**Base class：**`**kag.solver.retriever.exact_kg_retriever.ExactKgRetriever**`

**Default implementation**：`**kag.solver.retriever.impl.default_exact_kg_retriever.DefaultExactKgRetriever**`

`ExactKGRetriever` needs to implement the following interfaces:

+ **Entity Linking**

```python
def retrieval_entity(
    self, mention_entity: SPOEntity, **kwargs
) -> List[EntityData]:
    """
        Retrieve related entities based on the given entity mention.

        This function aims to retrieve the most relevant entities from storage or an index based on the provided entity name.

        Parameters:
            entity_mention (str): The name of the entity to retrieve.
            kwargs: additional optional parameters

        Returns:
            list of EntityData
        """

```

  
This interface strictly follows the schema definition for KG retrieval, as demonstrated by the default implementation:

```python
    def retrieval_entity(
            self, mention_entity: SPOEntity, **kwargs
    ) -> List[EntityData]:
        """
        Retrieve related entities based on the given entity mention.

        This function aims to retrieve the most relevant entities from storage or an index based on the provided entity name.

        Parameters:
            entity_mention (str): The name of the entity to retrieve.
            topk (int, optional): The number of top results to return. Defaults to 1.
            kwargs: additional optional parameters

        Returns:
            list of EntityData
        """

        return default_search_entity_by_name_algorithm(
            mention_entity=mention_entity,
            schema=self.schema,
            vectorize_model=self.vectorize_model,
            text_similarity=self.text_similarity,
            search_api=self.search_api,
            topk=self.el_num,
            recognition_threshold=0.9,
            use_query_type=True,
            kwargs=kwargs
        )
```

Here, we invoke a default implementation of our entity linking algorithm, setting a high similarity threshold (0.9) and enabling type-constrained querying (`use_query_type=True`).

+ **Data Retrieval **

```python
    def recall_one_hop_graph(self, n: GetSPONode, heads: List[EntityData], tails: List[EntityData], **kwargs) -> List[
        OneHopGraphData]:
        """
        Recall one-hop graph data for a given entity.

        Parameters:
            n (GetSPONode): The entity to be standardized.
            heads (List[EntityData]): A list of candidate entities 's'.
            tails (List[EntityData]): A list of candidate entities 'o'.
            kwargs: Additional optional parameters.

        Returns:
            List[OneHopGraphData]: A list of one-hop graph data for the given entity.
        """
```

  
This interface primarily assembles DSL (Domain-Specific Language) through the `graph_api` interface. In `KGRetriever`, based on the `GetSPONode` structure, the template is assembled as follows:

```python
exact_dsls.append(f"""
MATCH (s:{dsl_header_label})-[p:{'|'.join(p_label_set)}]->(o:{dsl_tail_label})
WHERE {' and '.join(where_caluse)}
RETURN s,p,o,s.id,o.id
""")
```

Of course, considering that the `p` type may not be part of the schema, the system will fall back to retrieving one-hop graph when the precise DSL fails to recall any results.

```python
 # if exact ql failed, we call one hop graph to filter
exact_dsls.append(f"""
MATCH (s:{dsl_header_label})-[p:rdf_expand({p_label})]->(o:{dsl_tail_label})
WHERE {' and '.join(where_caluse)}
RETURN s,p,o,s.id,o.id
""")
```

Here, the `rdf_expand` relationship function is used to expand the attributes and relationships of the original nodes into an RDF graph.

+ **Relation Selection**

```python
    def retrieval_relation(
            self, n: GetSPONode, one_hop_graph_list: List[OneHopGraphData], **kwargs
    ) -> KgGraph:
        """
        Input:
            n: GetSPONode, the relation to be standardized
            one_hop_graph_list: List[OneHopGraphData], list of candidate sets
            kwargs: additional optional parameters

        Output:
            Returns KgGraph
        """
```

This interface is used to filter the data recalled from the `logic form`. The  default exact matching strategy is based on string-level matching:

```python
def find_best_match_p_name(p: str, candi_set: list):
    if p in candi_set:
        return p
    return None
```

##### Fuzzy KGRetriever
**Base class：**`**kag.solver.retriever.fuzzy_kg_retriever.FuzzyKgRetriever**`

**Default implementation**：`**kag.solver.retriever.impl.default_fuzzy_kg_retriever.DefaultFuzzyKgRetriever**`



Similar to exact KGRetriever, fuzzy KGRetriever also needs to implement entity linking, data retrieval, and relation selection interfaces:

+ **Entity Linking**

```python
    def retrieval_entity(
            self, mention_entity: SPOEntity, **kwargs
    ) -> List[EntityData]:
        """
        Retrieve related entities based on the given entity mention.

        This function aims to retrieve the most relevant entities from storage or an index based on the provided entity name.

        Parameters:
            entity_mention (str): The name of the entity to retrieve.
            kwargs: additional optional parameters

        Returns:
            list of EntityData
        """
        return default_search_entity_by_name_algorithm(
            mention_entity=mention_entity,
            schema=self.schema,
            vectorize_model=self.vectorize_model,
            text_similarity=self.text_similarity,
            search_api=self.search_api,
            topk=self.el_num,
            recognition_threshold=0.8,
            use_query_type=False
            kwargs=kwargs
        )

```

There are two differences in the call parameters compared to exact matching:

1. The `recognition_threshold` is set to a lower value of 0.8.
2. `use_query_type` is set to `False`, meaning the recalled entity type is ignored.
+ **Data Retrieval**

The DSL assembled during data retrieval is directly returned in RDF format.

```python
dsl = f"""
MATCH (s:{dsl_header_label})-[p:rdf_expand()]-(o:{dsl_tail_label})
WHERE {' and '.join(where_caluse)}
RETURN s,p,o,s.id,o.id
"""
```

When the aforementioned DSL fails to retrieve data, it will independently retrieve one-hop subgraphs for both the starting and ending nodes.

```python
with concurrent.futures.ThreadPoolExecutor() as executor:
    map_dict = {
        "s": heads,
        "o": tails
    }
    for k, v in map_dict.items():
        futures = [
            executor.submit(self.graph_api.get_entity_one_hop, entity) for entity in v]
        results = [future.result() for future in concurrent.futures.as_completed(futures)]
        for r in results:
            if r is None:
                logger.warning(f"{n} recall chunk data")
                continue
            r.s_alias_name = k
            one_hop_graph_list.append(r)
```

+ **Relation Selection**

Relation Selection is performed directly by the LLM.

```python
kag.solver.prompt
            ├── default
            │   └── spo_retrieval.py   # relation selection
            ├── lawbench
            └── medical
```

Here is a example prompt: 

```python

{
  "instruction": "You are a language expert. Your task is to select the correct SPO text from the given SPO candidates to answer the given question based on the following rules. Please ensure that it matches the SPO mention or the question.",
  "requirements": [
    "The output must be selected from the SPO candidates and must be consistent with their content, presented in list format.",
    "If there is no suitable answer among the SPO candidates, output an empty list. Ensure that the output highly matches the question or SPO mention.",
    "If there are multiple correct answers among the SPO candidates, output all matching SPOs in JSON list format."
  ],
  "examples": [
    {
      "question": "Is Woman's Viewpoint a British publication?",
      "SPO mention": "Publication[Woman's Viewpoint] Nationality Country",
      "SPO candidates": [
        "Woman's Viewpoint was published from 1923 to 1927",
        "Woman's Viewpoint was published by Florence M. Sterling",
        "Woman's Viewpoint was founded in 1923",
        "Woman's Viewpoint was founded in Texas",
        "Woman's Viewpoint is a women's magazine",
        "Rolandos Liatsos starred in Woman in Mind",
        "Rolandos Liatsos starred in Woman in Mind"
      ],
      "analysis": "Based on the question and SPO mention, we need to find the country of publication for 'Woman's Viewpoint'. The SPO 'Woman's Viewpoint was founded in Texas' contains geographical information, from which the nationality can be inferred.",
      "output": [
        "Woman's Viewpoint was founded in Texas"
      ]
    },
    {
      "question": "Which German musician's manuscript is the 'Flute Sonata in C major, BWV 1033'?",
      "SPO mention": "Entity[Flute Sonata in C major, BWV 1033] InHandOf Entity",
      "SPO candidates": [
        "Flute Sonata in C major, BWV 1033 is attributed to Johann Sebastian Bach",
        "Flute Sonata in C major, BWV 1033 is for flute or recorder and basso continuo",
        "Flute Sonata in C major, BWV 1033 is a four-movement sonata"
      ],
      "analysis": "Based on the question and SPO mention, we need to determine who holds the manuscript of 'Flute Sonata in C major, BWV 1033'. According to the provided SPO candidates, the SPO 'Flute Sonata in C major, BWV 1033 is attributed to Johann Sebastian Bach' is relevant to the question. It can be inferred that the manuscript of 'Flute Sonata in C major, BWV 1033' should be in the hands of Johann Sebastian Bach.",
      "output": [
        "Flute Sonata in C major, BWV 1033 is attributed to Johann Sebastian Bach"
      ]
    }
  ],
  "task": {
    "question": "$question",
    "SPO mention": "$mention",
    "SPO candidates": "$candis"
  },
  "output": "Provide a JSON list containing the best SPO candidate(s) selected based on the SPO mention content to answer the question."
}
```

##### ChunkRetriever


**Base class：**`**kag.solver.retriever.chunk_retriever.ChunkRetriever**`

**Default implementation**：

+ `**kag.solver.retriever.impl.default_chunk_retrieval.KAGRetriever**`

This is the default chunk retrieval interface

+ `kag.solver.retriever.impl.default_chunk_retrieval.DefaultChunkRetriever`

Integrated the `rank_doc` interface into the `KAGRetriever` implementation.



The `ChunkRetriever` needs to implement the following interfaces:

+ **Chunk Retrieval**

```python
def recall_docs(self, queries: List[str], retrieved_spo: Optional[List[RelationData]] = None,
                **kwargs) -> List[str]:
    """
    Recalls documents based on the given query.

    Parameters:
        queries (list of str): The queries string to search for.
        retrieved_spo (Optional[List[RelationData]], optional): A list of previously retrieved relation data. Defaults to None.
        **kwargs: Additional keyword arguments for retrieval.

    Returns:
        List[str]: A list of recalled document IDs or content.
    """
    raise NotImplementedError("Subclasses must implement this method")

```

There are two input parameters:

+ `queries`

A list of sub-questions and the original question, where the first item is the original question and the rest are sub-questions.

+ `retrieved_spo`

Contains relations retrieved from KG which can be used to enhance the chunk retrieval. For example, in the default implementation, these key node details are used as starting nodes for PPR (Personalized PageRank) calculations. This approach significantly improving evaluation scores compared to PPR queries based solely on the query.

+ **Chunk Rerank**

```python
def rerank_docs(self, queries: List[str], passages: List[str]) -> List[str]:
    """
    Reranks the retrieved passages based on the given queries.

    Parameters:
        queries (List[str]): A list of query strings.
        passages (List[str]): A list of retrieved passages.

    Returns:
        List[str]: A list of reranked passage IDs or content.
    """
    raise NotImplementedError("Subclasses must implement this method")
```

There are two input parameters:

+ `queries`

A list of sub-questions and the original question, where the first item is the original question and the rest are sub-questions.

+ `passages`

List of retrieved chunks 

### 2.3.3、Reflector
**Base class：**`**kag.interface.solver.kag_reflector_abc.KagReflectorABC**`

**Default implementation**：`**kag.solver.implementation.default_reflector.DefaultReflector**`

The `Reflector` needs to implement the following interfaces:

+ **Determine if the current available information is sufficient to answer the question.**

```python
@abstractmethod
def _can_answer(self, memory: KagMemoryABC, instruction: str):
    """
    Determines whether the query can be answered.

    :param memory (KagMemory): The context or memory information to use for rewriting.
    :param instruction (str): The original instruction to be rewritten.
    :return: Whether the query can be answered (boolean)
    """
    raise NotImplementedError("Subclasses must implement this method")
```

+ **Question reflection  **

```python
@abstractmethod
def _refine_query(self, memory: KagMemoryABC, instruction: str):
    """
    Refines the query.

    :param memory (KagMemory): The context or memory information to use for rewriting.
    :param instruction (str): The original instruction to be rewritten.
    :return: The refined query (string)
    """
    raise NotImplementedError("Subclasses must implement this method")
```

Both interfaces are implemented based on LLM, and the prompt files are as follows:  

```python
kag.solver.prompt
            ├── default
            │   ├── resp_judge.py # Determine if the current available information is sufficient to answer the question.
            │   ├── resp_reflector.py # When resp_judge evaluates to false, a new question can be generated using this prompt. 
            ├── lawbench
            └── medical
```



### Generator
**Base class：**`**kag.interface.solver.kag_generator_abc.KAGGeneratorABC**`

**Default implementation**：`**kag.solver.implementation.default_generator.DefaultGenerator**`

The default implementation is based on LLM as well: 

```python
kag.solver.prompt
            ├── default
            │   ├── resp_generator.py
            ├── lawbench
            └── medical
```

The `generator` depends on `Memory`, which serializes known structures as demonstrated in the following call. If a solvable answer is already available, it is output directly.

```python
@retry(stop=stop_after_attempt(3))
def generate(self, instruction, memory: DefaultMemory):
    solved_answer = memory.get_solved_answer()
    if solved_answer is not None:
        return solved_answer
    present_memory = memory.serialize_memory()
    return self.llm_module.invoke(
        {"memory": present_memory, "instruction": instruction},
        self.generate_prompt,
        with_json_parse=False,
        with_except=True,
    )
```

### Memory
**Base class：**`**kag.interface.solver.kag_memory_abc.KagMemoryABC**`

**Default implementation**：`**kag.solver.implementation.default_memory.DefaultMemory**`



The `Memory` needs to implement the following interfaces:

+ **Saves the solved answer, supporting facts, and instruction.**

```python
@abstractmethod
def save_memory(self, solved_answer, supporting_fact, instruction):
    """
    Saves the solved answer, supporting facts, and instruction.

    :param solved_answer: The solved answer.
    :param supporting_fact: The supporting fact.
    :param instruction: The instruction.
    """
```



+ **Serializes the memory to str.**

```python
@abstractmethod
def serialize_memory(self) -> str:
    """
    Serializes the memory to str.

    :return: Serialized memory data with str format.
"""
```

In the default implementation, `support_fact` is saved using LLM and prompt:

```python
kag.solver.prompt
            ├── default
            │   ├── resp_extractor.py #基于已有信息抽取政务
            │   ├── resp_verifier.py # 确认extractor抽取的证据符合问题状态
            ├── lawbench
            └── medical
```

# Code Extension works with WebUI
Currently, user extensions for kag-builder and kag-solver can only be used in developer mode and cannot yet be integrated with product mode. Please stay tuned for future releases of kag for these capabilities. 

