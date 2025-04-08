---
sidebar_position: 1
---

# Schema customization

KAG supports custom business schemas to influence the graph construction and graph inference processes.   
KAG supports the construction of knowledge graphs based on business data (both structured and unstructured) and expert rules. The schema enforces constraints on the graph construction for structured data and expert rules, while for unstructured data, the schema guides the large model in performing knowledge extraction. 

# 1 SPG Schema Syntax 
For a description of the OpenSPG schema syntax, please refer to [Declarative Schema](https://openspg.yuque.com/ndx6g9/cwh47i/fiq6zum3qtzr7cne) [KGDSL](https://openspg.yuque.com/ndx6g9/cwh47i/hgqqkt8h9hh333tl).

For specific schema examples in various business scenarios, please refer to [Medicine.schema](https://github.com/OpenSPG/KAG/blob/master/kag/examples/medicine/schema/Medicine.schema), [RiskMining.schema](https://github.com/OpenSPG/KAG/blob/master/kag/examples/riskmining/schema/RiskMining.schema), [SupplyChain.schema](https://github.com/OpenSPG/KAG/blob/master/kag/examples/supplychain/schema/SupplyChain.schema), [HotpotQA.schema](https://github.com/OpenSPG/KAG/blob/master/kag/examples/hotpotqa/schema/HotpotQA.schema), [TwoWiki.schema](https://github.com/OpenSPG/KAG/blob/master/kag/examples/2wiki/schema/TwoWiki.schema), [MuSiQue.schema](https://github.com/OpenSPG/KAG/blob/master/kag/examples/musique/schema/MuSiQue.schema), etc.

## 1.1 RiskMining.schema 
For example, in the RiskMining.schema file: TaxOfRiskUser is a concept that describes the classification of risk users. Company is an entity type that describes a business. Person is an entity type that describes an individual. The Person entity type can define attributes and relationships. The difference is that attribute values can be of basic types (such as Text, Integer, Date, etc.) or concept types, while relationship types point to another entity type.

The existence of relationships can be expressed using DSL (Domain-Specific Language) rules. For example, Person-developed->App defines a "person-develops-app" relationship. This relationship is not explicitly present in the raw data but is derived from the raw data (e.g., Person-hasDevice->Device, Device-install->App) after multiple processing steps (such as aggregation and statistics based on business rules). 

In practice, raw data and business rules are often updated frequently. It is essential to ensure that when the raw data is updated, the corresponding inference results from the business rules are also updated. The relationships expressed using DSL rules in the SPG schema are generated through real-time computation during N-degree inference, which effectively meets this requirement.

```bash
TaxOfRiskUser(风险用户): ConceptType
	hypernymPredicate: isA
	
TaxOfRiskApp(风险应用): ConceptType
	hypernymPredicate: isA

Cert(证书): EntityType
	properties:
		certNum(证书编号): Text
		
Company(企业): EntityType
	properties:
		hasPhone(电话号码): Text
	relations:
		hasCert(拥有证书): Cert
		holdShare(持股): Company
		
App(应用): EntityType
	properties:
		riskMark(风险标记): Text
		useCert(使用证书): Cert
		IND#belongTo(属于): TaxOfRiskApp

Person(自然人): EntityType
	properties:
		age(年龄): Integer
		hasPhone(电话号码): Text
		IND#belongTo(属于): TaxOfRiskUser
	relations:
		hasDevice(拥有设备): Device
		hasCert(拥有证书): Cert
		holdShare(持股): Company
		fundTrans(转账关系): Person
			properties:
				transDate(交易日期): Text
				transAmt(交易金额): Integer
		developed(开发): App
			rule: [[
			        Define (s:Person)-[p:developed]->(o:App) {
				        STRUCTURE {
				          	(s)-[:hasDevice]->(d:Device)-[:install]->(o)
				        }
						CONSTRAINT {
						   deviceNum = group(s,o).count(d)
						   R1("设备超过5"): deviceNum > 5
						}
					}
      			  ]]
    release(发布): App
			rule: [[
			        Define (s:Person)-[p:release]->(o:App) {
                        STRUCTURE {
						    (s)-[:holdShare]->(c:Company),
						    (c)-[:hasCert]->(cert:Cert)<-[useCert]-(o)
					    }
					    CONSTRAINT {
					    }
					}
      			  ]]
```

## 1.2 HotpotQA.schema 
Datasets like HotpotQA and Musique contain a wide and complex range of information, making it difficult to define a schema that can accurately accommodate all entity instances. For example, Jay Chou as an actor and Cao Cao as a military strategist and politician, although both are categorized under the Person (individual) entity type, have significantly different associated attributes and relationships.   
	Unlike the strong schema constraints imposed in the construction of structured data graphs, for open-domain data, KAG (Knowledge Augmentation Graph) adopts a semi-schema approach to guide large models in knowledge extraction. This approach aims to balance the accuracy, logical rigor, and contextual completeness of the knowledge.   
	For instance, in the hotpotqa.schema file, for open-domain datasets, the Person entity type only predefines basic attributes such as desc (entity description) and semanticType (entity semantic type, also known as sub-type), along with built-in attributes like id and name. Additional attributes and relationships are extracted through a combination of the schema and prompts, guiding the large model to complete the knowledge extraction. 

```bash
Chunk(文本块): EntityType
     properties:
        content(内容): Text
            index: TextAndVector

Person(人物): EntityType
     properties:
        desc(描述): Text
            index: TextAndVector
        semanticType(语义类型): Text
            index: Text

Transport(运输): EntityType
     properties:
        desc(描述): Text
            index: TextAndVector
        semanticType(语义类型): Text
            index: Text

Works(作品): EntityType
     properties:
        desc(描述): Text
            index: TextAndVector
        semanticType(语义类型): Text
            index: Text
```

The built-in schema in the KAG product, designed for open-domain datasets, may not meet the expectations for domain-specific knowledge extraction tasks. Therefore, developers need to design their own domain-specific schemas, which can be used as part of the prompts to guide the large model in completing the knowledge extraction.   
	Additionally, the KAG team continuously releases domain-specific schemas for users to reference. 

# 2 Schema File Submission and Update 
For example, in the risk mining scenario, the schema files are typically located in the `./${bizScene}/schema/` directory. This directory includes SPG (Structured Property Graph) format schema files as well as rule files. 

```bash
examples
├──riskmining
    ├── builder
    ├── reasoner
    ├── schema
    │   ├── RiskMining.schema
    │   └── concept.rule
    └── solver
```

## 2.1 Schema File Submission
When submitting schema files, they undergo strict format validation, including checks for indentation spaces and keyword naming. If no errors are reported during submission, the defined schema can be used in subsequent processes. 

```bash
$ cd examples/riskmining/
# commit schema file
$ knext schema --help
Usage: knext schema [OPTIONS] COMMAND [ARGS]...

  Schema client.

Options:
  --help  Show this message and exit.

Commands:
  commit            Commit local schema and generate schema helper.
  reg_concept_rule  Register a concept rule according to DSL file.
  
$ knext schema commit

# commit rule file
$ knext schema reg_concept_rule --help
Usage: knext schema reg_concept_rule [OPTIONS]

  Register a concept rule according to DSL file.

Options:
  --file TEXT  Path of DSL file.
  --help       Show this message and exit.
$ knext schema reg_concept_rule ./schema/concept.rule
```

## 2.2 Schema File update
After updating the schema files, you can resubmit them to the server using the knext command. 

# 3 How Schema works
## 3.1 Knowledge Extraction from Unstructured Data 
+ **NER in public domain**

```bash
{
    "instruction": "You're a very effective entity extraction system. Please extract all the entities that are important for knowledge build and question, along with type, category and a brief description of the entity. The description of the entity is based on your OWN KNOWLEDGE AND UNDERSTANDING and does not need to be limited to the context. the entity's category belongs taxonomically to one of the items defined by schema, please also output the category. Note: Type refers to a specific, well-defined classification, such as Professor, Actor, while category is a broader group or class that may contain more than one type, such as Person, Works. Return an empty list if the entity type does not exist. Please respond in the format of a JSON string.You can refer to the example for extraction.",
    "schema": $schema,
    "example": [
        {
            "input": "The Rezort\nThe Rezort is a 2015 British zombie horror film directed by Steve Barker and written by Paul Gerstenberger.\n It stars Dougray Scott, Jessica De Gouw and Martin McCann.\n After humanity wins a devastating war against zombies, the few remaining undead are kept on a secure island, where they are hunted for sport.\n When something goes wrong with the island's security, the guests must face the possibility of a new outbreak.",
            "output": [
                        {
                            "entity": "The Rezort",
                            "type": "Movie",
                            "category": "Works",
                            "description": "A 2015 British zombie horror film directed by Steve Barker and written by Paul Gerstenberger."
                        },
                        {
                            "entity": "British",
                            "type": "Nationality",
                            "category": "GeographicLocation",
                            "description": "Great Britain, the island that includes England, Scotland, and Wales."
                        },
                        {
                            "entity": "Steve Barker",
                            "type": "Director",
                            "category": "Person",
                            "description": "Steve Barker is an English film director and screenwriter."
                        },
                        {
                            "entity": "Paul Gerstenberger",
                            "type": "Writer",
                            "category": "Person",
                            "description": "Paul is a writer and producer, known for The Rezort (2015), Primeval (2007) and House of Anubis (2011)."
                        },
                        {
                            "entity": "Dougray Scott",
                            "type": "Actor",
                            "category": "Person",
                            "description": "Stephen Dougray Scott (born 26 November 1965) is a Scottish actor."
                        },
                        {
                            "entity": "Jessica De Gouw",
                            "type": "Actor",
                            "category": "Person",
                            "description": "Jessica Elise De Gouw (born 15 February 1988) is an Australian actress. "
                        },
                        {
                            "entity": "Martin McCann",
                            "type": "Actor",
                            "category": "Person",
                            "description": "Martin McCann is an actor from Northern Ireland. In 2020, he was listed as number 48 on The Irish Times list of Ireland's greatest film actors"
                        }
                    ]
        }
    ],
    "input": "$input"
}
```

+ **NER in medicine**

```bash
{
        "instruction": "你是命名实体识别的专家。请从输入中提取与模式定义匹配的实体。如果不存在该类型的实体，请返回一个空列表。请以JSON字符串格式回应。你可以参照example进行抽取。",
        "schema": $schema,
        "example": [
            {
                "input": "烦躁不安、语妄、失眠酌用镇静药，禁用抑制呼吸的镇静药。\n3.并发症的处理经抗菌药物治疗后，高热常在24小时内消退，或数日内逐渐下降。\n若体温降而复升或3天后仍不降者，应考虑SP的肺外感染。\n治疗：接胸腔压力调节管＋吸引机负压吸引水瓶装置闭式负压吸引宜连续，如经12小时后肺仍未复张，应查找原因。",
                "output": [
                        {"entity": "烦躁不安", "category": "Symptom"},
                        {"entity": "语妄", "category": "Symptom"},
                        {"entity": "失眠", "category": "Symptom"},
                        {"entity": "镇静药", "category": "Medicine"},
                        {"entity": "肺外感染", "category": "Disease"},
                        {"entity": "胸腔压力调节管", "category": "MedicalEquipment"},
                        {"entity": "吸引机负压吸引水瓶装置", "category": "MedicalEquipment"},
                        {"entity": "闭式负压吸引", "category": "SurgicalOperation"}
                    ]
            }
        ],
        "input": "$input"
    }
```

## 3.2 Knowledge Build for Structured Data
+ **schema of EntityType**

```python
Company(企业): EntityType
	properties:
		hasPhone(电话号码): Text
	relations:
		hasCert(拥有证书): Cert
		holdShare(持股): Company
```

+ **data to build**

```python
id,name,hasPhone
0,**娱乐****公司,150****3237
1,**娱乐**公司,133****4755
2,**娱乐***公司,152****7817
3,哈尔*工***技术产**发**限公司,196****5023
4,中国**业建*股*限公司,137****3517
5,莲花*康**集**份限公司,190****4555
6,深圳***智能*气**限公司,132****0163
7,中信*投证***限公司,133****1366
8,航天彩**人*股*限公司,156****6507
9,供销*集*团**限公司,156****3837
```

+ **BuilderChain**

```python
class RiskMiningEntityChain(BuilderChainABC):
    def __init__(self, spg_type_name: str):
        super().__init__()
        self.spg_type_name = spg_type_name

    def build(self, **kwargs):
        source = CSVReader(output_type="Dict")
        mapping = SPGTypeMapping(spg_type_name=self.spg_type_name)
        vectorizer = BatchVectorizer()
        sink = KGWriter()

        chain = source >> mapping >> vectorizer >> sink
        return chain

RiskMiningEntityChain(spg_type_name="Company").invoke(os.path.join(file_path, "data/Company.csv"))
```

SPGTypeMapping will parse the fieldName from the CSV file and map it to the properties defined in the EntityType. 

## 3.3 KAG Solver
To more clearly describe the technical implementation of graph inference-based question answering, this document categorizes it from a data modeling perspective into the following two types: 

+ **Inference with Existing Data Modeling:** This type of inference is for structured data that has a clear data schema.
+ **Inference without Data Modeling: **This type of inference is for unstructured data that lacks a clear data schema.

The technical implementation of these two types of inference in graph-based question answering is detailed below. In graph inference-based question answering, we distinguish between inference on structured data and inference on unstructured data. 

### 3.3.1 **Inference with Existing Data Modeling**
Inference for existing data modeling primarily targets structured data, which is characterized by a clear data schema. This data is usually smaller in scale but may contain complex business logic. When applying large models to such data, the main challenges are: 

+ Data Scale Limitation: Large models cannot directly handle massive amounts of structured data.
+ Insufficient Knowledge Dependency: Large models lack sufficient knowledge about the underlying data.

Given these two issues, the most challenging problem in implementing a question-answering service on structured data is how to convert natural language into graph query steps. To solve this problem, the Plan module must understand how the underlying graph data is stored and expressed. SPG-Schema serves as the overall description of our graph knowledge, and it can help the Plan module understand the graph knowledge representation.   
To express knowledge more concisely and precisely, SPG-Schema includes a logical rule layer that allows domain experts to decouple specific data and business expressions using a Domain-Specific Language (DSL). For more details, refer to the content in the SPG white paper.   
Below is an example from RiskMining:   
In RiskMining, the most important requirement is to determine the risk category of a user. Therefore, the schema defines a logical inference relationship (IND#belongTo). 

```plain
TaxOfRiskUser(风险用户): ConceptType
	hypernymPredicate: isA

Person(自然人): EntityType
	properties:
		age(年龄): Integer
		hasPhone(电话号码): Text
		IND#belongTo(属于): TaxOfRiskUser
```

The specific logical expressions are stored in concept.rule, and we will not elaborate on them here. During the planning phase, we provided the large model with the following example:

```json
{
  "query": "Is ZhangSan a developer of a gambling app?",
    "answer": "Step1:Query which TaxOfRiskUser does zhangsan belongTo
              Action1:get_spo(s=s1:Person[ZhangSan], p=p1:belongTo, o=o1:TaxOfRiskUser)
              Output:o1
              Action2:get(o1)"
}
```

The relationship (Person)-[belongTo]->(TaxOfRiskUser) is a logical edge defined in the schema. When the executor processes this logic form expression, it converts it into the following query statement: 

```json
MATCH 
  (s1:Person)-[p1:belongTo]->(o1:TaxOfRiskUser)
WHERE
  s1.id="ZhangSan"
RETURN
  o1
```

This triggers the OpenSPG inference engine to return Zhang's risk classification result.   
On one hand, SPG-Schema enhances the expression of domain-specific relationship attributes through expert rule logic. On the other hand, it reduces the large model's need to understand domain knowledge during the planning phase. By combining these two aspects, we can achieve a question-answering application on structured data. 

### 3.3.2 Inference without Data Modeling
Inference without Data Modeling primarily targets unstructured data, which is characterized by the lack of a clear data schema, diverse data formats, and high flexibility. In such scenarios, the system cannot rely on a predefined schema to optimize the planner (Planner) and instead uses a weak schema constraint mechanism to express any type of data through entity types (Entity). 

+ **Weak Schema Constraint Mechanism: **In non-data modeling scenarios, OpenSPG expresses any type of data through entity types (Entity) and performs inference planning based on domain knowledge. This design allows the system to adapt to the high flexibility and diversity of unstructured data.
+ **Application of Domain Knowledge:** Even without a data model, the system can be extended as described in section 3.3.1. The system uses a domain knowledge base or predefined rules to convert unstructured data into a structured format, thereby enabling inference.
+ **Dynamic Schema Extension:** In non-data modeling scenarios, the system may need to dynamically extend the schema to accommodate new data types and relationships. This dynamic extension capability allows the system to flexibly handle the high complexity of open domains.

