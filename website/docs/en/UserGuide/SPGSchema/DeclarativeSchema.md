---
sidebar_position: 1
---

# Declarative Schema

## 1 Keywords
```plain
namespace

EntityType, ConceptType, EventType, ->, STD.*, Text, Float, Integer

desc, constraint, value, properties, relations, rule, hypernymPredicate

NotNull, MultiValue, Enum, Regular
```



> -> Used to express the inheritance relationship of a type, A -> B
>
>  
>
> STD.* Anything beginning with STD. is a reserved keyword, used as a standard type name.
>

## 2 Basic Syntax
Similar to YAML, indentation is used as a representation of scopes. Four spaces are recommended for indentation (tab  
characters are treated as two spaces)



+ **A(B): C** 
    - A is the English name of the type/property
    - B is the Chinese name of the type/property
    - C is the value
+ **A(B)->P** 
    - A is the English name of the type
    - B is the Chinese name of the type
    - P is the parent type to be inherited from
+ **namespace A** 
    - A is the project prefix, which must appear in the first line of the Schema file. The project prefix is  
automatically spliced into the entity type name when the Schema is submitted.

## 3 Constraint
+ Declarative schema scripts are parsed line by line and must adhere to the principle of order. Specifically, parent types must be defined before child types, and any type used in an attribute must be defined prior to the type it belongs to
+ The property id, name, and description are built-in and do not need to be explicitly declared
+ Only the following property types are supported

```bash
1、Basic Type：Text、Integer、Float
2、Standard Type：STD.ChinaMobile、STD.Email、STD.IdCardNo、STD.MacAddress、STD.Date、STD.ChinaTelCode、STD.Timestamp
```

+ The English name of the property must start with a lowercase letter and can only contain letters and numbers
+ Relationship property types only support basic types

## 4 Syntax
There are 6 levels of indentation, listed in order of indentation:



+ Level 1 (no indentation): defines the type, namespace
+ Level 2: Define meta-information about the type, such as description, attributes, relationships, etc.
+ Layer 3: Define names and types of attributes/relationships.
+ Layer 4: Define meta-information about attributes/relationships, e.g., constraints, subattributes, logical rules, etc.
+ Layer 5: Define names and types of sub-properties
+ Layer 6: Define meta-information about sub-properties, e.g., descriptions, constraints, etc.



```yaml
namespace DEFAULT

TypeA("Entity type A"): EntityType
    desc: "Entity Type Description"
    properties:
        property1("Attribute1"): STD.ChinaMobile
            desc: "Description of Attribute 1"
                constraint: NotNull, MultiValue
            properties:
                property2("Subproperties 1"): Text
                    desc: "Subproperties 1, enumerated constraint"
                    constraint: NotNull, Enum="A,B,C"
                property3("Subproperties 3"): Text
                    desc: "Subproperties 3, regular constraint"
                    constraint: Regular="^abc[0-9]+$"
                property4("Subproperties 4"): Text
                    rule: [ [
                        Define property4...
                    ] ]
    relations:
        relation1("relation1"): TypeA
            desc: "Description of relationship 1"
            properties:
                confidence("confidence level"): Float
            rule: [ [
                Define relation1...
            ] ]

TypeB("Entity type B") -> TypeA:
    desc: "This is a subtype of entity type A"
```



### 4.1 Define entity types
```yaml
# defines an entity type for a company
Company("company"): EntityType

  # defines an entity type that inherits from company
    ListedCompany("listed company") -> Company.
```



#### 4.1.1 Defining Attributes and Relationships
```yaml
Company("company"): EntityType
    # the description of the company
    desc: "description of the company"
    properties:
        # Define properties
        address("address"): Text
            # Define the address property as a non-null constraint here, in addition to MultiValue, Enum and Regular.
            constraint: NotNull
        industry("industry"): Industry
        # Each type creates id, name, and description attributes by default, all of type Text.
        # id (primary key): Text
        # name: Text
        # description: Text
    relations:
        # Define relationships
        subCompany("sub company"): Company
```



#### 4.1.2 Defining sub-properties
```yaml
Company("company"): EntityType
    desc: "Description of the company"
    properties:
        address("address"): Text
            # Define the confidence of the address sub-property.
            confidence: Float
        industry("industry"): Industry
```



#### 4.1.3 Defines the predicate logic
```yaml
Company("company"): EntityType
    desc: "Description of the company"
    relations:
        Risk("risk association"): Company
            # Define the predicate logic of the relationship here, using [[ and ]] as delimiters for the logic rules
            rule: [ [
                Define (s:Comapny)-[ p:risk ]->(o:Company) {
                                                               ... ...
                }
            ] ]
```



### 4.2 Define concept types
```yaml
Industry("Company Industry Classification"): ConceptType
    # Define the context predicate for the concept here, defaults to isA, you can specify isA and locateAt.
    hypernymPredicate: isA
```



### 4.3 Define the event type
```yaml
CompanyRiskEvent("Corporate risk events"): EventType
    properties:
        # Here the subject of the event type is defined as a company, and the event type must define a subject subject
        subject: Company
```



### 4.4 schema example
```yaml
namespace DEFAULT

Symptom("symptom"): EntityType

Drug("drug"): EntityType

Indicator("indicator"): EntityType

BodyPart("body part"): ConceptType
    hypernymPredicate: isA

HospitalDepartment("hospital department"): ConceptType
    hypernymPredicate: isA

Disease("disease"): EntityType
    properties:
        complication("complication"): Disease
            constraint: MultiValue

        commonSymptom("common symptom"): Symptom
            constraint: MultiValue

        applicableDrug("applicable drug"): Drug
            constraint: MultiValue

        department("department"): HospitalDepartment
            constraint: MultiValue

        diseaseSite("disease site"): BodyPart
            constraint: MultiValue

    relations:
        abnormal("abnormal"): Indicator
            properties:
                range("range"): Text
                color("color"): Text
                shape("shape"): Text
```
