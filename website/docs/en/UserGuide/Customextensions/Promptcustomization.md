---
sidebar_position: 2
---

# Prompt customization

KAG supports customized prompts to intervene in the effectiveness of graph construction and graph reasoning.

# 1、Basic Concepts of Prompts
In KAG, the base class for prompts is `kag.interface.PromptABC`, which primarily includes predefined prompt template content (usually task instructions and examples) and the functionality to parse the output strings from LLMs. If users wish to customize prompts, they can inherit the base class. Specifically, the process generally involves the following steps:

### 1.1、Customize Template Content
In custom classes, define a variable named `template_{language}` as the prompt template, where `language` represents the supported languages of the prompt, such as `zh` for Chinese and `en` for English. If a class defines both `template_zh` and `template_en` variables, KAG will automatically select the appropriate template based on the `language` field defined in the project configuration.

The template variable should be assigned a value as either a Python dictionary or a JSON string. Below is an example:

+ **python dictionary format**

```python
template_en: dict = {
    "instruction": "Please extract all dates from the input text.",
    "example": [
        {
            "input": "Jay Chou, born on January 18, 1979, in Taiwan Province.",
            "output": ["January 18, 1979"],
        }
    ],
}
```

+ **json string format**

Please note that the content of the `input` field should be represented using `$input`. KAG will automatically replace `$input` with the actual content of the `input` field from the provided parameters. Here is the updated example:

```python
template_zh: str = """{
    "instruction": "Please extract all dates from the input text.",
    "example": [
        {
            "input": "Jay Chou, born on January 18, 1979, in Taiwan Province.",
            "output": ["January 18, 1979"],
        }
    ],
}"""

```

### 1.2、Customizing LLM Output Parser
The code for parsing the LLM output should be implemented in the `parse_response` interface, which generally involves converting the raw output of the large model into the desired format.

Notes:

+ Similar to other components of KAG, the prompt class is managed by the registry system. It is highly recommended to first read the [**custom code**](https://openspg.yuque.com/ndx6g9/cwh47i/zwxvp3n4xog1vxsv) chapter to gain a preliminary understanding of the registry mechanism before proceeding with modifications.
+ The KAG framework comes with multiple prompt implementations that are tightly integrated with the knowledge schema. In most cases, users only need to define an appropriate schema and modify the examples in the prompt.

# 2、KG Build Related Prompts
## 2.1、**Schema-free Knowledge Extraction**
### 2.1.1、Prompt file
```python
├── __init__.py
├── ner.py
├── std.py
└── triple.py
```

Taking `Musique` dataset as an example, the KAG builder related prompts for the open-domain dataset are stored in the `kag/builder/prompt/default` directory, which includes three files: `ner.py`, `std.py`, and `triple.py`:

+ **ner.py**

The files define the Chinese and English templates for named entity extraction, with the templates presented in JSON string format. `example.input` and `example.output` respectively demonstrate the LLM input and output examples.

Developers can adjust the corresponding examples to enhance the name entity extraction performance. The output format of the LLM is strongly correlated with the data parsing logic. If the data parsing logic has not been modified, it is essential to maintain the stability of the output format in the examples.

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

The files define the Chinese and English templates for entity standardization, with the templates presented in JSON string format. `example.input`, `example.named_entities`, and `example.output` respectively demonstrate the LLM input and output examples.

Entity standardization relies on the LLM's understanding of the context as well as its own knowledge base. Standardized entity names can complement the context of the entities, thereby avoiding ambiguity.

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

The file defines the Chinese and English templates for SPO (Subject-Predicate-Object) triple extraction, with the templates presented in JSON string format. `example.input`, `example.entity_list` and `example.output` respectively demonstrate the LLM input and output examples.

The instruction specifies that for the SPO extraction results, either the subject or the object must appear in the `entity_list`.

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

### 2.1.2、Custom prompt
To modify the aforementioned prompts, follow these steps:

+ **Create the prompt directory**

Create a new `prompt` directory under the project's `builder` directory (e.g., `kag/examples/2wiki/builder/prompt`), and copy the prompt files you wish to modify into this directory.

+ **Modify the prompt files**

Customize the prompt class and** modify the registration name.**

```python
# Original registration name is `default_ner`
@PromptABC.register("default_ner")
class OpenIENERPrompt(PromptABC):
    template_en = {}

# Modified registeration name is `my_ner_prompt`
@PromptABC.register("my_ner_prompt")
class OpenIENERPrompt(PromptABC):
    template_en = {}
```

+ **Modify the configuration file**

In the project configuration file `kag_config.yaml`, change the `type` field of the prompt to the registration name of the custom prompt (i.e., `my_ner_prompt` as mentioned above).

+ **import the custom prompt**

In the script where the custom prompt is used (such as the KG build script), import the directory of the custom prompts to register the new prompts.

```python
from kag.common.registry import import_modules_from_path
import_modules_from_path("./prompt") # The path where the custom prompt files are located.
```

### 2.1.3、Prompt Application
The KAG framework includes a built-in component called `SchemaFreeExtractor`, registered under the name "`schema_free_extractor`". It provides the capability to perform knowledge extraction based on open-domain corpora and user-defined prompts/schemas. Specifically, the extraction process of `SchemaFreeExtractor` consists of the following steps:

1. **Entity Extraction** with `ner_prompt`.  
2. **Entity Standardization** with `std_prompt`.  
3. **Triple Extraction** with `triple_prompt`.  
4. **Aggregating extracted data into a graph**.



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

## 2.2、**Schema-constraint Knowledge Extraction**
In the schema-free knowledge extraction pipeline, we exclusively employ the entity types specified within the schema, with the attributes for each entity type being predetermined (e.g., `name`, `type`, `category` and `description`). This methodology imposes fewer restrictions on the extraction model, thereby allowing the LLMto identify a greater number of key entities.

However, in specific vertical domains, there may be a need for more granular entity extraction, such as distinguishing entities with unique attributes. Furthermore, beyond entities, there is also an objective to extract events that involve multiple subject and object entities. To accommodate such requirements, the KAG framework offers a schema-constrained knowledge extraction capability. By reading and parsing a user-defined schema file, it directs the LLM to execute entity and event extraction in alignment with the schema's specifications.

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

**Notes:**

1. For the complete workflow of schema-constrained knowledge extraction, refer to the encyclopedia data QA example: `examples/baike`.
2. The current version (v0.6) only supports the `MultiValue` attribute in the `constraints` field of SPG schema, while `NotNull` constraints are not yet supported.

### 2.2.1、Custom prompt
Taking the `BaiKe` dataset as an example, the prompt  supporting the schema-constraint extraction  is located at `kag/builder/prompt/spg_prompt.py`. Its primary function is to parse the schema and automatically populate it into the template. Specifically, we have defined three schema-based prompts: `entity extraction`, `relation extraction`, and `event extraction`. Users can modify the examples within these prompts, along with their custom schema.

### 2.2.2、Prompt Application
The KAG framework includes a built-in component called `SchemaConstraintExtractor`, registered under the name "`schema_constraint_extractor`". Users need to utilize this Extractor in conjunction with custom prompts to achieve schema-constrained knowledge extraction. Compared to the schema-free knowledge extraction pipeline, the `SchemaConstraintExtractor` adds event extraction capabilities, separating entity and event types for extraction based on the schema. The specific workflow is as follows:

1. **Entity Extraction**: Using `ner_prompt`
2. **Entity Standardization**: Using `std_prompt`
3. **Triple Extraction**: Using `triple_prompt`
4. **Event Extraction**: Using `event_prompt`
5. **Aggregating Extracted data into a graph**

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



# 3、Graph Reasoning Related Prompts
The default prompts are located in `kag/solver/prompt/default/`

## 3.1、Planner Prompts
### 3.1.1、Prompt files
The default prompt file path for the `planner` is as follows:

```bash
kag.solver.prompt
            ├── default
            │   ├── logic_form_plan.py #default planner prompt
            ├── lawbench
            └── medical
```

The prompts for the `planner` are divided into two parts:

```cypher
template_en = f"""
{{
    {instruct_en}
    {default_case_en}
    "output_format": "Only output words in answer, for examples: `Step`, `Action` content",
    "query": "$question"
}}"""
```

+ instruct: Defines the basic information of the operator. DONOT modify this, otherwise the subsequent executor will not be able to parse it.

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

+ default_case：Provides few-shot examples for the LLM. This part is customizable.

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

### 3.1.2、Custom prompt
Please refer to [**Section 2.1.2**](#LYO9w) for detailed steps.

### 3.1.3、Prompt Application
Here is an example of a RiskMining application,  only `default_case_en` is rewrited.

```python
import logging
import re
from string import Template
from typing import List

logger = logging.getLogger(__name__)

from kag.interface import PromptABC


@PromptABC.register("riskmining_lf_plan")
class MyLogicFormPlanPrompt(LogicFormPlanPrompt):
    default_case_en = """"cases": [
        {
            "Action": "Is Zhang*San the developer of a gambling app?",
            "answer": "Step1: Query the classification of Zhang*San\nAction1: get_spo(s=s1:NaturalPerson[Zhang*San], p=p1:BelongsTo, o=o1:RiskUser)\nOutput: Output o1\nAction2: get(o1)"
        }
    ],"""
    def __init__(self, language: str = "", **kwargs):
        super().__init__(language, **kwargs)

```

## 3.2、Reasoner Prompt
The default prompt files for the `reasoner` are as follows, please refer to [Section 3.1](#t39oM) for customization.

```bash
kag.solver.prompt
            ├── default
            │   ├── deduce_choice.py # Reasoning prompt for single-choice questions
            │   ├── deduce_entail.py # Reasoning prompt for entailment inference
            │   ├── deduce_judge.py # Reasoning prompt for boolean inference
            │   ├── deduce_multi_choice.py # Reasoning prompt for multiple-choice questions
            │   ├── question_ner.py # NER recognition for sub-questions
            │   ├── solve_question.py  # Generate sub-question answers based on retrieved documents, graph relationships, and historical records
            │   ├── solve_question_without_docs.py # Generate sub-question answers based on retrieved graph relationships and historical records
            │   ├── solve_question_without_spo.py # Generate sub-question answers based on retrieved documents and historical records
            │   └── spo_retrieval.py   # Select qualified SPO tuples
            ├── lawbench
            └── medical
```

## 3.3、Reflector Prompt
The default prompt file paths for the `reflector` are as follows, please refer to [Section 3.1](#t39oM) for customization.

```bash
kag.solver.prompt
            ├── default
            │   ├── resp_extractor.py # Extract government-related information based on existing data
            │   ├── resp_judge.py # Determine whether the sub-question can be answered based on current information
            │   ├── resp_reflector.py # When resp_judge returns false, this prompt can generate a new question
            │   ├── resp_verifier.py # Verify that the evidence extracted by the extractor aligns with the question's context
            ├── lawbench
            └── medical
```

## 3.4、Generator Prompt
The default prompt file paths for the `generator` are as follows, please refer to [Section 3.1](#t39oM) for customization.

```bash
kag.solver.prompt
            ├── default
            │   ├── resp_generator.py
            ├── lawbench
            └── medical
```

