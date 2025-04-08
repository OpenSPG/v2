# 声明式 schema

### 关键字
```plain
namespace

EntityType, ConceptType, EventType, ->, STD.*, Text, Float, Integer

desc, constraint, value, properties, relations, rule, hypernymPredicatem, autoRelate, spreadable, regular

NotNull, MultiValue, Enum, Regular
```

> -> 用于表达类型的继承关系，A -> B
>
> STD.*表示以STD.开头的都是预留关键字，作标准类型名称
>



### 基础句法
类似YAML，以缩进作为作用域的表示。缩进建议使用4个空格（Tab符会被当做两个空格）

+ **A(B): C** 
    - A为类型/属性的英文名
    - B为类型/属性的中文名称
    - C为取值
+ **A(B)->P** 
    - A为类型的英文名
    - B为类型的中文名称
    - P为要继承自的父类型
+ **namespace A** 
    - A表示项目前缀，在Schema文件的第一行必须出现。项目前缀会在Schema提交的时候自动拼接到实体类型名称的前面
+ **[[...]]** 
    - 规则脚本的定界符，仅用于rule的定义，类似于Python的"""用法



声明式Schema脚本采用逐行解析的方式，定义上要遵循顺序原则，即父类型要在子类型之前定义、属性上使用的类型也需要在其所属类型定义之前先定义好。

### 约束
+ 声明式Schema脚本采用逐行解析的方式，定义上要遵循顺序原则，即父类型要在子类型之前定义、属性上使用的类型也需要在其所属类型定义之前先定义好
+ 属性id、name、description为内置属性，不需要再声明
+ 属性类型只支持以下几种

```bash
1、基本类型：Text(文本)、Integer(整型)、Float(浮点数)
2、标准类型：STD.ChinaMobile(国内手机号)、STD.Email(电子邮箱)、STD.IdCardNo(身份证)、STD.MacAddress(MAC地址)、STD.Date(日期)、STD.ChinaTelCode(国内通讯号)、STD.Timestamp(时间戳)
```

+ 属性英文名称首字母必须为小写字母，且只支持英文字母和数字
+ 关系属性类型只支持基本类型

### 语法结构
总共分类6层缩进，按缩进的多少依次为：

+ 第一层（无缩进）：定义类型、命名空间
+ 第二层：定义类型的元信息，比如描述、属性、关系等
+ 第三层：定义属性/关系的名称和类型
+ 第四层：定义属性/关系的元信息，比如约束、子属性、逻辑规则等
+ 第五层：定义子属性的名称和类型
+ 第六层：定义子属性的元信息，比如描述、约束

```yaml
namespace DEFAULT

TypeA(实体类型A): EntityType
    desc: 实体类型描述
    properties:
        property1(属性1): STD.ChinaMobile
            desc: 属性1的描述
                constraint: NotNull, MultiValue
            properties:
                 property2(属性1的子属性): Text
                     desc: 属性1的子属性，枚举约束
                     constraint: NotNull, Enum="A,B,C"
                 property3(属性1的子属性): Text
                     desc: 属性1的子属性，正则约束
                     constraint: Regular="^abc[0-9]+$"
                 property4(属性4): Text
                      rule: [[
                        Define property4...
                       ]]
    relations:
        relation1(关系1): TypeA
            desc: 关系1的描述
            properties:
                 confidence(置信度): Float
            rule: [[
               Define relation1...
            ]]

TypeB(实体类型B) -> TypeA:
    desc: 这是实体类型A的子类型
```



#### 定义实体类型
```yaml
# 以下定义一个公司的实体类型
Company(公司): EntityType

# 以下是定义一个继承自公司的实体类型
ListedCompany(上市公司) -> Company:
```



##### 定义属性和关系
```yaml
Company(公司): EntityType
    # 这里是公司的描述
    desc: 公司的描述
    properties:
        # 这里定义属性
        address(地址): Text
            # 这里定义地址属性为非空约束，除此还可以定义MultiValue(多值，英文逗号分割)、Enum(枚举)和Regular(正则)
            constraint: NotNull
        industry(行业): Industry
        # 每个类型会默认创建id、name和description属性，都是Text类型
        # id(主键): Text
        # name(名称): Text
        # description(描述): Text
    relations:
        # 这里定义关系
        subCompany(子公司): Company
```



##### 定义子属性
```yaml
Company(公司): EntityType
    desc: 公司的描述
    properties:
        address(地址): Text
          # 这里定义地址的子属性置信度
          confidence(置信度): Float
        industry(行业): Industry
```



##### 定义谓词逻辑
```yaml
Company(公司): EntityType
    desc: 公司的描述
    relations:
        risk(风险关联): Company
            # 这里定义关系的谓词逻辑，使用 [[ 和 ]] 作为逻辑规则的定界符
            rule: [[
               Define (s:Comapny)-[p:risk]->(o:Company) {
                    ... ...
               }
            ]]
```

如果是定义从实体类型到同个概念类型下的不同概念实例的逻辑，请在同个rule关键字里写多段Define的脚本。



#### 定义概念类型
```yaml
Industry(公司行业分类): ConceptType
    # 这里定义概念的上下位关系谓词，默认为isA，可以指定isA和locateAt
    hypernymPredicate: isA
```

概念类型的关系只允许创建在7大类里定义的谓词，这里可以通过autoRelate一键创建7大类的所有关系：

```yaml
Industry(公司行业分类): ConceptType
    autoRelate: Industry
```



#### 定义事件类型
```yaml
CompanyRiskEvent(公司风险事件): EventType
    properties:
        # 这里定义事件类型的主体为公司，事件类型必须定义主体subject
        subject: Company
```



### 建模示例
```yaml
namespace Medical

Symptom(症状): EntityType

Drug(药品): EntityType

Indicator(医学指征): EntityType

BodyPart(人体部位): ConceptType
    hypernymPredicate: isA

HospitalDepartment(医院科室): ConceptType
    hypernymPredicate: isA

Disease(疾病): EntityType
    properties:
        complication(并发症): Disease
            constraint: MultiValue

        commonSymptom(常见症状): Symptom
            constraint: MultiValue

        applicableDrug(适用药品): Drug
            constraint: MultiValue

        department(就诊科室): HospitalDepartment
            constraint: MultiValue

        diseaseSite(发病部位): BodyPart
            constraint: MultiValue

    relations:
        abnormal(异常指征): Indicator
            properties:
                range(指标范围): Text
                color(颜色): Text
                shape(性状): Text
```



