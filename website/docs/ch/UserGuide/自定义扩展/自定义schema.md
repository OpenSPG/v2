# 自定义schema

kag 支持业务自定义schema 以干预图谱构建、图谱推理的效果。

kag 支持基于业务（结构化、非结构化）数据、专家规则等构建知识图谱。schema 强制约束结构化数据、专家规则的图谱构建，而针对非结构化数据，schema 只引导大模型实现知识抽取。

# 1、spg schema 语法
openspg schema 的语法说明可参考 [声明式 schema](https://openspg.yuque.com/ndx6g9/docs/peb03cne0mky8i36)，其中涉及专家规则(DSL)的部分可参考 [专家规则（DSL）语法](https://openspg.yuque.com/ndx6g9/docs/gqpww8gfp36238f4)。

业务场景具体的schema 示例可参考[Medicine.schema](https://github.com/OpenSPG/KAG/blob/master/kag/examples/medicine/schema/Medicine.schema)、[RiskMining.schema](https://github.com/OpenSPG/KAG/blob/master/kag/examples/riskmining/schema/RiskMining.schema)、[SupplyChain.schema](https://github.com/OpenSPG/KAG/blob/master/kag/examples/supplychain/schema/SupplyChain.schema)、[HotpotQA.schema](https://github.com/OpenSPG/KAG/blob/master/kag/examples/hotpotqa/schema/HotpotQA.schema)、[TwoWiki.schema](https://github.com/OpenSPG/KAG/blob/master/kag/examples/2wiki/schema/TwoWiki.schema)、[MuSiQue.schema](https://github.com/OpenSPG/KAG/blob/master/kag/examples/musique/schema/MuSiQue.schema) 等。

+ **RiskMining.schema **

以RiskMining.schema 中 为例，TaxOfRiskUser 是一种描述风险用户分类的概念，Company 是一种描述企业的实体类型，Person 是一种描述自然人的实体类型。Person 实体类型中可定义属性、关系；区别在于，属性值的类型是基础类型（Text、Integer、Date 等）或者概念类型，关系类型的终点是另外一种实体类型。

关系的存在性可通过dsl规则来表达，如Person-developed->App 定义了一种"自然人-开发->App"的关系，该关系未显式存在于事实数据中，是在事实数据（Person-hasDevice->Device, Device-install->App）基础上N次加工（基于业务规则的聚合、统计等）后得到。

实践中，事实数据、业务规则更新往往比较频繁，需要确保事实数据更新后、与之对应的业务规则推理结果也能随之更新；spg schema 提供的基于 dsl 规则表达的关系，在图谱N度推理时通过实时计算生成，能较好的契合该需求。

```yaml
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

+ **HotpotQA.schema **

HotpotQA、Musique等开放域数据集，包含的内容多而繁杂，难以准确定义可适配所有实体实例的schema。比如，作为演员的周杰伦、作为军事家&政治家的曹操，在Person(自然人) 层面，其关联的属性、关系差别较大。

与结构化数据图谱构建所施加的强schema 约束不同，针对开放域数据，KAG 采用了semi-schema约束的方式引导大模型完成知识抽取，以兼顾知识的准确性、逻辑严密性、上下文的完整性。

以hotpotqa.schema 为例，针对开放阈数据集，Person 实体类型中只预定义了desc（实体描述）、semanticType（实体语义类型 也即 细分类型）等基础属性，以及内置的id、name 属性。扩展属性&关系，是通过schema + prompt 引导大模型完成的知识抽取。

```yaml
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

kag 产品中内置的、针对开放域数据集的schema，在面向特定领域的知识抽取任务时难以达到预期，需要开发者自行设计一些领域相关的schema，作为prompt 的一部分引导大模型完成知识抽取。

同时，kag 团队会不断发布一些领域相关schema，供使用者参考。

# 2、schema 文件提交&更新
以riskmining 场景为例，schema 文件一般位于`./${bizScene}/schema/`目录下，包括spg 格式的schema 文件以及rule 文件。

```yaml
examples
├──riskmining
    ├── builder
    ├── reasoner
    ├── schema
    │   ├── RiskMining.schema
    │   └── concept.rule
    └── solver

```

+ schema 文件提交

schema 文件在提交时会做严格的格式校验，包括缩进空格数、关键字命名等；如果提交时未报错，则定义的schema 可在后续流程中使用。

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

+ schema 文件更新

schema 文件更新后，可通过knext 命令再次提交到服务端。

# 3、schema 如何发挥作用
## 3.1、非结构化数据的知识抽取
+ **开放域实体抽取**

```json
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

+ **医疗领域实体抽取**

```json
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

// 医疗领域知识抽取需要强化，将属性、关系等信息加进来。

## 3.2、结构化数据的图谱构建
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

SPGTypeMapping 会解析csv 文件的fieldName，并映射到EntityType 定义的properties 属性上。

## 3.3、图谱推理 
为了更清晰地描述图谱推理问答的技术实现，本文从数据建模的角度进行分类，将图谱推理问答分为以下两类：

1. 已有数据建模的推理：针对具有明确数据模式（schema）的结构化数据。
2. 无数据建模的推理：针对缺乏明确数据模式的非结构化数据。

以下分别对两类推理的技术实现进行详细说明。

图谱推理问答中，我们分为结构化数据推理和非结构化数据推理

### 3.3.1、已有数据建模的推理
已有数据建模的推理主要针对结构化数据，其特点是数据具有明确的数据模式（schema），通常规模较小但可能包含复杂的业务经验。在大模型应用于此类数据时，主要面临以下挑战：

1. 数据规模限制：大模型无法直接处理海量结构化数据。
2. 知识依赖不足：大模型对底层数据的依赖知识较为缺乏。

在上面两个问题的前提下，想要实现结构化数据上的问答服务，最有挑战的问题主要是如何将自然语言转换成图谱查询步骤，要解决这个问题，则必须要让Plan模块知道底层图谱数据是如何存储和表达的，SPG-Schema则是我们图谱知识表达的总体描述，可以借助SPG-Schema让Plan模块理解图谱知识表达。

为了更简洁、精确的表达知识，SPG-Schema中设计了一套逻辑规则层，可以让业务专家通过DSL解耦具体数据和业务的表达。具体可以参见SPG白皮书中的内容。

下面以RiskMining中的例子来说明

RiskMining中，最重要的需求就是如何判定用户的风险类别，所以schema中定义了一个逻辑推导关系（IND#belongTo）

```plain
TaxOfRiskUser(风险用户): ConceptType
	hypernymPredicate: isA

Person(自然人): EntityType
	properties:
		age(年龄): Integer
		hasPhone(电话号码): Text
		IND#belongTo(属于): TaxOfRiskUser
```

在concept.rule中存有具体的逻辑表达，此处不再赘述。

在规划阶段，我们向大模型提供了这么一个shot

```plain
{
    "Action": "张*三是一个赌博App的开发者吗?",
    "answer": "Step1:查询是否张*三的分类
              Action1:get_spo(s=s1:自然人[张*三], p=p1:属于, o=o1:风险用户)
              Output:输出o1
              Action2:get(o1)"
}
```

这里(自然人)-[属于]->(风险用户)是在schema中定义的一个逻辑边。执行器在执行该logic form表达式会转换成如下的查询语句

```cypher
MATCH 
  (s1:Person)-[p1:belongTo]->(o1:TaxOfRiskUser)
WHERE
  s1.id="张*三"
RETURN
  o1
```

从而触发OpenSPG的推理引擎，将张某得风险分类结果返回。

一方面SPG-Schema通过专家规则逻辑增加了面向业务领域的关系属性表达，另一方面也降低了大模型在规划阶段对领域知识理解，通过两者结合，实现结构化数据上的问答应用

### 3.3.2、无数据建模的推理
非数据建模的推理主要针对非结构化数据，其特点是缺乏明确的数据模式（schema），数据形式多样且灵活性高。在此类场景中，系统无法依赖预设的schema优化规划器（Planner），而是采用弱schema约束机制，通过实体类型（Entity）表达任意类型的数据。

1. 弱schema约束机制  
在非数据建模的场景中，OpenSPG通过实体类型（Entity）表达任意类型的数据，并基于领域知识进行推理规划。这种设计使系统能够适应非结构化数据的高灵活性和多样性需求。
2. 领域知识的应用  
无数据模型也可以参考3.3.1中的方式进行扩展，系统通过领域知识库或预定义的规则对非结构化数据进行结构化转换，进而实现推理。
3. 动态schema扩展  
在非数据建模的场景中，系统可能需要动态扩展schema以适应新的数据类型和关系。这种动态扩展能力使系统能够灵活应对开放领域的高复杂性。





