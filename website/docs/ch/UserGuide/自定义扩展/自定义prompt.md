# 自定义prompt

KAG 支持业务自定义prompt以干预图谱构建、图谱推理的效果。

# 1、Prompt基本概念
KAG中的prompt的基类为kag.interface.PromptABC，主要包含预定义的prompt模板内容（一般是任务提示和示例）以及解析大模型输出字符串的功能。用户如果要自定义prompt，可以继承该基类并实现相关逻辑。具体地说，一般要包含如下步骤：

### 1.1、自定义模板内容
在自定义类中定义名为template_{language}的变量作为prompt模板，其中language为prompt支持的语言，如zh,en等。如果类定义了template_zh和template_en两个变量，那么框架会根据project配置中的language为en或zh自动选择使用哪个模板。

模板变量取值为python dict或者json string，示例如下：

+ **python dict格式**

```python
    template_zh: dict = {
        "instruction": "请抽取出input文本中的所有日期",
        "example": [
            {
                "input": "周杰伦（Jay Chou），1979年1月18日出生于台湾省。",
                "output": ["1979年1月18日"],
            }
        ],
    }

```

+ **json string格式**

注意input字段内容用$input表示，框架会自动使用实际输入参数的input字段内容进行替换

```python
    template_zh: str = """{
        "instruction": "请抽取出input文本中的所有日期",
        "example": [
            {
                "input": "周杰伦（Jay Chou），1979年1月18日出生于台湾省。",
                "output": ["1979年1月18日"],
            }
        ],
        "input": "$input"
    }"""

```

### 1.2、自定义大模型输出解析逻辑
大模型输出解析逻辑需要实现在parse_response接口中，一般是把大模型的原始输出转为期望的格式。

注：

1. prompt类与KAG其他组件一样都基于注册器管理，建议先阅读自定义代码章节对注册器机制有初步的了解后再着手修改。
2. KAG框架内置了与知识schema紧密结合的多个prompt实现，大部分情况下，用户只需要定义合适的schema，并修改prompt的example即可。

# 2、图谱构建相关 prompt
## 2.1、**schema-free知识抽取**
### 2.1.1、prompt 所在文件
```python
├── __init__.py
├── ner.py
├── std.py
└── triple.py
```

以musique 为例，开放域数据集对应的 kag-builder 相关prompt 存储于kag/builder/prompt/default 目录下，包括ner.py、std.py、triple.py 三个文件：

+ **ner.py**

ner.py 中定义了实体抽取的中文、英文模板，模版以json string 格式呈现，example.input、example.output 分别展示实体抽取阶段大模型的输入示例、输出示例。

开发者可调整对应的示例，以提升大模型实体抽取的效果；大模型输出格式与数据解析逻辑强相关，如未修改数据解析逻辑，请保持示例中输出格式的稳定性。

```python
    template_en = """
    {
    "instruction": "You're a very effective entity extraction system. Please extract all the entities that are important for knowledge build and question, along with type, category and a brief description of the entity. The description of the entity is based on your OWN KNOWLEDGE AND UNDERSTANDING and does not need to be limited to the context. the entity's category belongs taxonomically to one of the items defined by schema, please also output the category. Note: Type refers to a specific, well-defined classification, such as Professor, Actor, while category is a broader group or class that may contain more than one type, such as Person, Works. Return an empty list if the entity type does not exist. Please respond in the format of a JSON string.You can refer to the example for extraction.",
    "schema": $schema,
    "example": [
        {
            "input": "The Rezort is a 2015 British zombie horror film directed by Steve Barker and written by Paul Gerstenberger. It stars Dougray Scott, Jessica De Gouw and Martin McCann. After humanity wins a devastating war against zombies, the few remaining undead are kept on a secure island, where they are hunted for sport. When something goes wrong with the island's security, the guests must face the possibility of a new outbreak.",
            "output": [
                        {
                            "name": "The Rezort",
                            "type": "Movie",
                            "category": "Works",
                            "description": "A 2015 British zombie horror film directed by Steve Barker and written by Paul Gerstenberger."
                        },
                        {
                            "name": "2015",
                            "type": "Year",
                            "category": "Date",
                            "description": "The year the movie 'The Rezort' was released."
                        },
                        {
                            "name": "British",
                            "type": "Nationality",
                            "category": "GeographicLocation",
                            "description": "Great Britain, the island that includes England, Scotland, and Wales."
                        },
                        {
                            "name": "Steve Barker",
                            "type": "Director",
                            "category": "Person",
                            "description": "Steve Barker is an English film director and screenwriter."
                        },
                        {
                            "name": "Paul Gerstenberger",
                            "type": "Writer",
                            "category": "Person",
                            "description": "Paul is a writer and producer, known for The Rezort (2015), Primeval (2007) and House of Anubis (2011)."
                        },
                        {
                            "name": "Dougray Scott",
                            "type": "Actor",
                            "category": "Person",
                            "description": "Stephen Dougray Scott (born 26 November 1965) is a Scottish actor."
                        },
                        {
                            "name": "Jessica De Gouw",
                            "type": "Actor",
                            "category": "Person",
                            "description": "Jessica Elise De Gouw (born 15 February 1988) is an Australian actress. "
                        },
                        {
                            "name": "Martin McCann",
                            "type": "Actor",
                            "category": "Person",
                            "description": "Martin McCann is an actor from Northern Ireland. In 2020, he was listed as number 48 on The Irish Times list of Ireland's greatest film actors"
                        }
                    ]
        }
    ],
    "input": "$input"
}    
        """

```

+ **std.py**

std.py 中定义实体标准化的中英文模板，模版以json string 格式呈现，example.input & example.named_entities、example.output 分别展示实体标准化阶段大模型的输入示例、输出示例。

实体标准化依赖大模型对上下文的理解，以及自身的知识储备；标准化的实体名，可补齐实体的上下文，避免歧义。

```python
    template_en = """
{
    "instruction": "The `input` field contains a user provided context. The `named_entities` field contains extracted named entities from the context, which may be unclear abbreviations, aliases, or slang. To eliminate ambiguity, please attempt to provide the official names of these entities based on the context and your own knowledge. Note that entities with the same meaning can only have ONE official name. Please respond in the format of a single JSONArray string without any explanation, as shown in the `output` field of the provided example.",
    "example": {
        "input": "American History.When did the political party that favored harsh punishment of southern states after the Civil War, gain control of the House? Republicans regained control of the chamber they had lost in the 2006 midterm elections.",
        "named_entities": [
            {"name": "American", "category": "GeographicLocation"},
            {"name": "political party", "category": "Organization"},
            {"name": "southern states", "category": "GeographicLocation"},
            {"name": "Civil War", "category": "Keyword"},
            {"name": "House", "category": "Organization"},
            {"name": "Republicans", "category": "Organization"},
            {"name": "chamber", "category": "Organization"},
            {"name": "2006 midterm elections", "category": "Date"}
        ],
        "output": [
            {
                "name": "American",
                "category": "GeographicLocation",
                "official_name": "United States of America"
            },
            {
                "name": "political party",
                "category": "Organization",
                "official_name": "Radical Republicans"
            },
            {
                "name": "southern states",
                "category": "GeographicLocation",
                "official_name": "Confederacy"
            },
            {
                "name": "Civil War",
                "category": "Keyword",
                "official_name": "American Civil War"
            },
            {
                "name": "House",
                "category": "Organization",
                "official_name": "United States House of Representatives"
            },
            {
                "name": "Republicans",
                "category": "Organization",
                "official_name": "Republican Party"
            },
            {
                "name": "chamber",
                "category": "Organization",
                "official_name": "United States House of Representatives"
            },
            {
                "name": "midterm elections",
                "category": "Date",
                "official_name": "United States midterm elections"
            }
        ]
    },
    "input": "$input",
    "named_entities": $named_entities
}
    """

```

+ **triple.py**

triple.py 中定义spo 三元组抽取的中英文模板，模版以json string 格式呈现，example.input & example.entity_list、example.output 分别展示spo 抽取阶段大模型的输入示例、输出示例。

instruction 中要求，spo 抽取结果，其起点 或 终点之一，需要在entity_list 中出现。

```python
    template_en = """
{
    "instruction": "You are an expert specializing in carrying out open information extraction (OpenIE). Please extract any possible relations (including subject, predicate, object) from the given text, and list them following the json format {\"triples\": [[\"subject\", \"predicate\",  \"object\"]]}. If there are none, do not list them..Pay attention to the following requirements:- Each triple should contain at least one, but preferably two, of the named entities in the entity_list.- Clearly resolve pronouns to their specific names to maintain clarity.",
    "entity_list": $entity_list,
    "input": "$input",
    "example": {
        "input": "The RezortThe Rezort is a 2015 British zombie horror film directed by Steve Barker and written by Paul Gerstenberger. It stars Dougray Scott, Jessica De Gouw and Martin McCann. After humanity wins a devastating war against zombies, the few remaining undead are kept on a secure island, where they are hunted for sport. When something goes wrong with the island's security, the guests must face the possibility of a new outbreak.",
        "entity_list": [
            {
                "name": "The Rezort",
                "category": "Works"
            },
            {
                "name": "2015",
                "category": "Others"
            },
            {
                "name": "British",
                "category": "GeographicLocation"
            },
            {
                "name": "Steve Barker",
                "category": "Person"
            },
            {
                "name": "Paul Gerstenberger",
                "category": "Person"
            },
            {
                "name": "Dougray Scott",
                "category": "Person"
            },
            {
                "name": "Jessica De Gouw",
                "category": "Person"
            },
            {
                "name": "Martin McCann",
                "category": "Person"
            },
            {
                "name": "zombies",
                "category": "Creature"
            },
            {
                "name": "zombie horror film",
                "category": "Concept"
            },
            {
                "name": "humanity",
                "category": "Concept"
            },
            {
                "name": "secure island",
                "category": "GeographicLocation"
            }
        ],
        "output": [
            [
                "The Rezort",
                "is",
                "zombie horror film"
            ],
            [
                "The Rezort",
                "publish at",
                "2015"
            ],
            [
                "The Rezort",
                "released",
                "British"
            ],
            [
                "The Rezort",
                "is directed by",
                "Steve Barker"
            ],
            [
                "The Rezort",
                "is written by",
                "Paul Gerstenberger"
            ],
            [
                "The Rezort",
                "stars",
                "Dougray Scott"
            ],
            [
                "The Rezort",
                "stars",
                "Jessica De Gouw"
            ],
            [
                "The Rezort",
                "stars",
                "Martin McCann"
            ],
            [
                "humanity",
                "wins",
                "a devastating war against zombies"
            ],
            [
                "the few remaining undead",
                "are kept on",
                "a secure island"
            ],
            [
                "they",
                "are hunted for",
                "sport"
            ],
            [
                "something",
                "goes wrong with",
                "the island's security"
            ],
            [
                "the guests",
                "must face",
                "the possibility of a new outbreak"
            ]
        ]
    }
}    
    """

```

### 2.1.2、自定义prompt
如果用户需要修改上述prompt，可以按照自定义代码的逻辑，执行以下步骤：

+ **新建业务目录**

在项目builder目录下新建prompt目录，把要修改的prompt文件复制到该目录下

+ **修改prompt 文件**

对prompt做针对性的修改，并**修改prompt的注册名**

```python
# 原始prompt注册名，为default_ner
@PromptABC.register("default_ner")
class OpenIENERPrompt(PromptABC):
    template_en = {}

# 修改后注册名为my_ner_prompt
@PromptABC.register("my_ner_prompt")
class OpenIENERPrompt(PromptABC):
    template_en = {}
```

+ **修改配置文件**

在项目配置文件kag_config.yaml中，将prompt的type字段修改为自定义prompt的注册名(即上文中的my_ner_prompt)

+ **引入自定义prompt**

在图谱构建运行脚本中，导入自定义prompt的目录，从而把新的prompt注册上去

```python
from kag.common.registry import import_modules_from_path
import_modules_from_path("./prompt") #修改为自定义prompt代码所在的路径
```

### 2.1.3、prompt 应用
KAG框架中内置了了SchemaFreeExtractor组件，其注册名为"schema_free_extractor"，提供基于开放域语料和用户自定义prompt/schema完成知识抽取的能力。具体来说，SchemaFreeExtractor的抽取流程包括如下步骤：

1. 实体抽取，使用ner_prompt 
2. 实体标准化，使用std_prompt
3. 三元组抽取，使用triple_prompt
4. 将抽取结果汇总成图结构

```python
class SchemaFreeExtractor(ExtractorABC):
    """
    A class for extracting knowledge graph subgraphs from text using a large language model (LLM).
    Inherits from the Extractor base class.

    Attributes:
        llm (LLMClient): The large language model client used for text processing.
        schema (SchemaClient): The schema client used to load the schema for the project.
        ner_prompt (PromptABC): The prompt used for named entity recognition.
        std_prompt (PromptABC): The prompt used for named entity standardization.
        triple_prompt (PromptABC): The prompt used for triple extraction.
        external_graph (ExternalGraphLoaderABC): The external graph loader used for additional NER.
    """

    def __init__(
        self,
        llm: LLMClient,
        ner_prompt: PromptABC = None,
        std_prompt: PromptABC = None,
        triple_prompt: PromptABC = None,
        external_graph: ExternalGraphLoaderABC = None,
    ):
        """
        Initializes the KAGExtractor with the specified parameters.

        Args:
            llm (LLMClient): The large language model client.
            ner_prompt (PromptABC, optional): The prompt for named entity recognition. Defaults to None.
            std_prompt (PromptABC, optional): The prompt for named entity standardization. Defaults to None.
            triple_prompt (PromptABC, optional): The prompt for triple extraction. Defaults to None.
            external_graph (ExternalGraphLoaderABC, optional): The external graph loader. Defaults to None.
        """

```

## 2.2、schema-constraint知识抽取
在schema-free的知识抽取链路中，我们只使用了schema中定义的实体类型，而每个实体类型的属性都是固定的（name, type, category, description）。这种模式给予抽取模型的约束较少，从而期望大模型可以抽取出更多的关键实体。

在有些垂直领域中，我们可能希望更细粒度的实体抽取，例如不同实体具有不同的属性。同时，除了实体之外，我们还期望抽取包含多个主客体实体的事件。针对这种场景，KAG框架提供了schema-constraint模式的知识抽取，通过读取解析用户的schema文件，约束大模型按照schema定义进行实体和事件的抽取。

例如，一个新闻图谱的schema文件如下：

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
        type(类型): Text
            desc: 地理位置的具体类型，如国家、地区、省市

Entity(实体): EntityType
     desc: 具有特定意义的命名对象或概念，如人物、机构、产品等
     properties:
         type(类型): Text

NewsEvent(事件): EventType
     properties:
       time(事件): Date
           desc: 事件发生的时间点或时间段
       location(地点): GeographicLocation
           desc: 事件发生的具体地点或区域
       subject(主体): Entity
           desc: 事件的主体，即事件的主要参与者
       relation(关系): Text
           desc: 事件的关系名称，即事件的主要动作或行为
       object(客体): Entity
           desc: 事件的客体，即事件的次要参与者或对象
           constraint: MultiValue
       cause(原因): Text
           desc: 导致事件发生的原因或动机
       process(过程): Text
           desc: 事件发生的过程或步骤
       outcome(结果): Text
           desc: 事件发生后产生的结果或影响
       context(背景): Text
           desc: 事件发生的背景或环境
       impact(影响): Text
           desc: 事件对相关方或社会产生的影响
```

上述schema除了定义实体及其属性之外，还定义了事件类型（EventType）的NewsEvent。该类型包含了多个属性，有些属性是简单的文本类型，如cause, process等，有些属性是schema中定义的实体类型，如time, location, subject等，并且有些属性还包含了MultiValue约束，如object。

使用schema-constraint模式的知识抽取可以指示大模型根据schema的约束执行抽取。一个可能的事件抽取输入输出如下：

```yaml
{'input': '北京时间8月27日下午，美国总统国家安全事务助理杰克·沙利文乘机抵达北京，开始任期内首次访华。谭主发现，此次随行人员中几乎都会说中文，而沙利文本人在2015年也曾来华参加“读懂中国”国际会议。此次访华之行，美国派出如此之多会说中文的代表，望沙利文此行真的能读懂中国。',
 'output': [{'category': 'NewsEvent',
   'name': '沙利文任内首次访华',
   'properties': {'cause': None,
    'impact': None,
    'relation': '访华',
    'context': '美国总统国家安全事务助理杰克·沙利文乘机抵达北京，开始任期内首次访华',
    'subject': [{'name': '杰克·沙利文', 'type': '政治人物'}],
    'time': {"name": '北京时间8月27日下午'},
    'outcome': '任期内首次访华',
    'location': {"name": '北京', "type": "城市"},
    'process': None,
    'object': [{'name': '中国', 'type': '国家'}]}}, 
  {'category': 'NewsEvent',
   'name': '沙利文2015年参加‘读懂中国’国际会议',
   'properties': {'cause': None,
    'impact': None,
    'relation': '参加会议',
    'context': '沙利文本人在2015年也曾来华参加‘读懂中国’国际会议',
    'subject': [{'name': '杰克·沙利文', 'type': '政治人物'}],
    'time': {"name": "2015年"},
    'outcome': None,
    'location': {"name": '中国', "type": "国家"},
    'process': None,
    'object': [{'name': '‘读懂中国’国际会议', 'type': '会议'}]}}]}
```

可见事件中包含了多个属性，并且每个属性值都与schema中定义的类型吻合。

实体类型的抽取与事件类型相似，也可以按照上述示例定义复杂的实体类型与属性。

注：

1. 关于schema-constraint知识抽取的完整流程，可以参考百科数据问答示例：examples/baike
2. 当前版本（v0.6）暂时只支持SPG schema的constrains字段的MultiValue属性，NotNull尚未支持

### 2.2.1、自定义prompt
以baike数据集为例，支持schema-constraint抽取模式的prompt代码位于builder/prompt/spg_prompt.py文件内，主要是增加了解析schema并自动填充到template中的功能。具体地，我们定义了基于schema的实体抽取、关系抽取和事件抽取三个prompt。用户可以基于这三个prompt和自定义的schema，修改其中的example，从而

### 2.2.2、prompt 应用
KAG框架中包含了一个schema-constraint知识抽取的SchemaConstraintExtractor类型，其注册名为"schema_constraint_extractor"，用户需要使用该Extractor配合自定义的prompt，才能实现schema-constrain模式的知识抽取。相比schema-free知识抽取链路，SchemaConstraintExtractor增加了对事件的抽取，即根据schema将实体和事件类型分开进行抽取：

1. 实体抽取，使用ner_prompt 
2. 实体标准化，使用std_prompt
3. 三元组抽取，使用triple_prompt
4. 事件抽取，使用event_prompt
5. 将抽取结果汇总成图结构

```python
class SchemaConstraintExtractor(ExtractorABC):
    """
    Perform knowledge extraction for enforcing schema constraints, including entities, events and their edges.
    The types of entities and events, along with their respective attributes, are automatically inherited from the project's schema.
    """

    def __init__(
        self,
        llm: LLMClient,
        ner_prompt: PromptABC = None,
        std_prompt: PromptABC = None,
        relation_prompt: PromptABC = None,
        event_prompt: PromptABC = None,
        external_graph: ExternalGraphLoaderABC = None,
    ):
        """
        Initializes the SchemaBasedExtractor instance.

        Args:
            llm (LLMClient): The language model client used for extraction.
            ner_prompt (PromptABC, optional): The prompt for named entity recognition. Defaults to None.
            std_prompt (PromptABC, optional): The prompt for named entity standardization. Defaults to None.
            relation_prompt (PromptABC, optional): The prompt for relation extraction. Defaults to None.
            event_prompt (PromptABC, optional): The prompt for event extraction. Defaults to None.
            external_graph (ExternalGraphLoaderABC, optional): The external graph loader for additional data. Defaults to None.
        """

```

# 3、图谱推理相关prompt
默认prompt均在

> kag/solver/prompt/default/
>

## 3.1、规划器Prompt
### 3.1.1、prompt所在文件
规划器的默认prompt在

```bash
kag.solver.prompt
            ├── default
            │   ├── logic_form_plan.py #默认规划器提示词
            ├── lawbench
            └── medical
```

整个规划器的prompt分为两部分

```cypher
    template_en = f"""
{{
    {instruct_en}
    {default_case_en}
    "output_format": "Only output words in answer, for examples: `Step`, `Action` content",
    "query": "$question"
}}   
```

+ instruct：此处定义算子的基本信息，**此部分不能修改，否则后续执行器无法解析执行**

```cypher
instruct_en = """    "instruction": "",
    "function_description": "functionName is operator name;the function format is functionName(arg_name1=arg_value1,[args_name2=arg_value2, args_name3=arg_value3]),括号中为参数，被[]包含的参数为可选参数，未被[]包含的为必选参数",
    "function": [
      {
          "functionName": "get_spo",
          "function_declaration": "get_spo(s=s_alias:entity_type[entity_name], p=p_alias:edge_type, o=o_alias:entity_type[entity_name])",
          "description": "Find SPO information. 's' represents the subject, 'o' represents the object, and they are denoted as variable_name:entity_type[entity_name]. The entity name is an optional parameter and should be provided when there is a specific entity to query. 'p' represents the predicate, which can be a relationship or attribute, denoted as variable_name:edge_type_or_attribute_type. Each variable is assigned a unique variable name, which is used for reference in subsequent mentions. Note that 's', 'p', and 'o' should not appear repeatedly within the same expression; only one set of SPO should be queried at a time. When a variable is a reference to a previously mentioned variable name, the variable name must match the previously mentioned variable name, and only the variable name needs to be provided; the entity type is only given when it is first introduced."
      },
      {
          "functionName": "count",
          "function_declaration": "count(alias)->count_alias",
          "description": "Count the number of nodes. The parameter should be a specified set of nodes to count, and it can only be variable names that appear in the get_spo query. The variable name 'count_alias' represents the counting result, which must be of int type, and this variable name can be used for reference in subsequent mentions."
      },
      {
          "functionName": "sum",
          "function_declaration": "sum(alias, num1, num2, ...)->sum_alias",
          "description": "Calculate the sum of data. The parameter should be a specified set to sum, which can be either numbers or variable names mentioned earlier, and its content must be of numeric type. The variable name 'sum_alias' represents the result of the calculation, which must be of numeric type, and this variable name can be used for reference in subsequent mentions."      },
      {
          "functionName": "sort",
          "function_declaration": "sort(set=alias, orderby=o_alias or count_alias or sum_alias, direction=min or max, limit=N)",
          "description": "Sort a set of nodes. The 'set' parameter specifies the set of nodes to be sorted and can only be variable names that appear in the get_spo query. The 'orderby' parameter specifies the basis for sorting, which can be the relationship or attribute name of the nodes. If it has been mentioned earlier, an alias should be used. The 'direction' parameter specifies the sorting order, which can only be 'min' (ascending) or 'max' (descending). The 'limit' parameter specifies the limit on the number of output results and must be of int type. The sorted result can be used as the final output."      },
      {
          "functionName": "compare",
          "function_declaration": "compare(set=[alias1, alias2, ...], op=min|max)",
          "description": "Compare nodes or numeric values. The 'set' parameter specifies the set of nodes or values to be compared, which can be variable names that appear in the get_spo query or constants. The 'op' parameter specifies the comparison operation: 'min' to find the smallest and 'max' to find the largest."
      },
      {
          "functionName": "get",
          "function_decl:aration": "get(alias)",
          "description": "Return the information represented by a specified alias. This can be an entity, a relationship path, or an attribute value obtained in the get_spo query. It can be used as the final output result."
      }
    ],"""
```

+ default_case：为大模型提供一些shot，此部分可修改

```cypher
default_case_en = """"cases": [
        {
            "query": "Which sports team for which Cristiano Ronaldo played in 2011 was founded last ?",
            "answer": "Step1:Which Sports Teams Cristiano Ronaldo Played for in 2011 ?\nAction1:get_spo(s=s1:Player[Cristiano Ronaldo],p=p1:PlayedForIn2011Year,o=o1:SportsTeam)\nStep2:In which year were these teams established ?\nAction2:get_spo(s=o1,p=p2:FoundationYear,o=o2:Year)\nStep3:Which team was founded last ?\nAction3:sort(set=o1, orderby=o2, direction=max, limit=1)"
        },
        {
            "query": "Who was the first president of the association which published Journal of Psychotherapy Integration?",
            "answer": "Step1:Which association that publishes the Journal of Psychotherapy Integration ?\nAction1:Journal(s=s1:Player[Psychotherapy Integration],p=p1:Publish,o=o1:Association)\nStep2:Who was the first president of that specific association?\nAction2:get_spo(s=o1,p=p2:FirstPresident,o=o2:Person)"
        },
        {
            "query": "When did the state where Pocahontas Mounds is located become part of the United States?",
            "answer": "Step1:Which State Where Pocahontas Mounds is Located ?\nAction1:get_spo(s=s1:HistoricalSite[Pocahontas Mounds], p=p1:LocatedIn, o=o1:State)\nStep2:When did this state become a part of the United States ？\nAction2:get_spo(s=o1, p=p2:YearOfBecamingPartofTheUnitedStates, o=o2:Date)"
        },
        {
            "query": "Which of the two tornado outbreaks killed the most people?",
            "answer": "Step1:Which is the first tornado outbreaks ?\nAction1:get_spo(s=s1:Event[Tornado Outbreak], p=p1:TheFirst, o=o1:Event)\nStep2:Which is the second tornado outbreaks ?\nAction2:get_spo(s=s2:Event[Tornado Outbreak], p=p2:TheSecond, o=o2:Event)\nStep3:How many people died in the first tornado outbreak ?\nAction3:get_spo(s=s1, p=p3:KilledPeopleNumber, o=o3:Number)\nStep4:How many people died in the second tornado outbreak ?\nAction4:get_spo(s=s2, p=p4:KilledPeopleNumber, o=o4:Number)\nStep5:To compare the death toll between two tornado outbreaks to determine which one had more fatalities.\nAction5:compare(set=[o3,o4], op=max)"
        }
    ],"""
```

### 3.1.2、自定义prompt
如果用户需要修改上述prompt，可以按照自定义代码的逻辑，执行以下步骤：

+ **新建业务目录**

在项目builder目录下新建prompt目录，把要修改的prompt文件复制到该目录下

+ **修改prompt 文件**

对prompt做针对性的修改，并**修改prompt的注册名**

```python
# 原始prompt注册名，为default_ner
@PromptABC.register("default_logic_form_plan")
class LogicFormPlanPrompt(PromptABC):
    template_en = {}

# 修改后注册名为my_ner_prompt
@PromptABC.register("my_plan_prompt")
class MyLogicFormPlanPrompt(LogicFormPlanPrompt):
    template_en = {}
```

+ **修改配置文件**

在项目配置文件kag_config.yaml中，将prompt的type字段修改为自定义prompt的注册名(即上文中的my_plan_prompt)

+ **引入自定义prompt**

在图谱构建运行脚本中，导入自定义prompt的目录，从而把新的prompt注册上去

```python
from kag.common.registry import import_modules_from_path
import_modules_from_path("./prompt") #修改为自定义prompt代码所在的路径
```

### 3.1.3、prompt应用
此处以RIskMining为例

```python
import logging
import re
from string import Template
from typing import List

logger = logging.getLogger(__name__)

from kag.interface import PromptABC


@PromptABC.register("riskmining_lf_plan")
class MyLogicFormPlanPrompt(LogicFormPlanPrompt):
    default_case_zh = """"cases": [
        {
            "Action": "张*三是一个赌博App的开发者吗?",
            "answer": "Step1:查询是否张*三的分类\nAction1:get_spo(s=s1:自然人[张*三], p=p1:属于, o=o1:风险用户)\nOutput:输出o1\nAction2:get(o1)"
        }
    ],"""
    def __init__(self, language: str = "", **kwargs):
        super().__init__(language, **kwargs)

```

此处只继承了default_case_zh进行case重写。

## 3.2、推理器Prompt
推理器prompt较多，其路径在:

```bash
kag.solver.prompt
            ├── default
            │   ├── deduce_choice.py # 推理prompt，用于单项选择题
            │   ├── deduce_entail.py # 推理prompt，用于蕴含推理
            │   ├── deduce_judge.py # 推理prompt，用于bool推理
            │   ├── deduce_multi_choice.py # 推理prompt，用于多选题
            │   ├── question_ner.py # 针对子问题的ner识别
            │   ├── solve_question.py  # 基于检索的文档、图谱关系、历史记录生成子问题答案
            │   ├── solve_question_without_docs.py # 基于检索的图谱关系、历史记录生成子问题答案
            │   ├── solve_question_without_spo.py # 基于检索的文档、历史记录生成子问题答案
            │   └── spo_retrieval.py   # 挑选满足条件的spoN元组
            ├── lawbench
            └── medical
```

可以根据实际需求修改这些prompt，并放在业务目录中，如examples/medicine/solver/prompt 等。

## 3.3、反思器Prompt
反思器prompt也存在

> kag/solver/prompt/default/
>

```bash
kag.solver.prompt
            ├── default
            │   ├── resp_extractor.py #基于已有信息抽取政务
            │   ├── resp_judge.py #基于当前信息判断是否能够回答子问题
            │   ├── resp_reflector.py #当resp_judge判断为false时，可通过该prompt生成一个新问题
            │   ├── resp_verifier.py # 确认extractor抽取的证据符合问题状态
            ├── lawbench
            └── medical
```

此处可参考3.1中的修改模式进行修改

## 3.4、生成器Prompt
生成器只有一个prompt，存在

```bash
kag.solver.prompt
            ├── default
            │   ├── resp_generator.py
            ├── lawbench
            └── medical
```

同样可参考3.1中的修改模式进行修改





