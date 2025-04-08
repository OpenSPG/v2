---
sidebar_position: 9
---

# Command Line Tools

# 1、Command Line Tools
Using the knext command-line tool and its various subcommands, you can achieve a complete workflow for building and using graph data.   


```bash
# show the user maual

$ knext --help
Usage: knext [OPTIONS] COMMAND [ARGS]...

Options:
  --version  Show the version and exit.
  --help     Show this message and exit.

Commands:
  project   Project client.
  reasoner  Reasoner client.
  schema    Schema client.
  thinker   Thinker client.
```

## 1.1、project
```bash
# show the user maual
$ knext project --help
Usage: knext project [OPTIONS] COMMAND [ARGS]...

  Project client.

Options:
  --help  Show this message and exit.

Commands:
  create   Create new project with a demo case.
  list
  restore
  update
```

### 1.1.1、project create
```bash
# show the user maual
$ knext project create --help

Usage: knext project create [OPTIONS]

  Create new project with a demo case.

Options:
  --config_path TEXT        Path of config.  [required]
  --tmpl [default|medical]  Template of project, use default if not specified.
  --help                    Show this message and exit.
```

+ 【required】--config_path，Path of config

```bash
# show the user maual
$ knext project create --config_path kag_config.yaml
```

After successful execution, a directory named KagDemo will be created in the current directory. Navigate into the example project by executing cd KagDemo.

```bash
KagDemo
├── builder
│   ├── __init__.py
│   ├── data
│   ├── indexer.py
│   └── prompt
├── kag_config.yaml
├── reasoner
│   └── __init__.py
├── schema
│   ├── KagDemo.schema
│   └── __init__.py
└── solver
    ├── __init__.py
    └── prompt
```

### 1.1.2、project restore
User can use this command to quickly restore a project from an existing project directory. 

```bash
# show the user maual
$ knext project restore --help

Usage: knext project restore [OPTIONS]

Options:
  --host_addr TEXT  Address of spg server.
  --proj_path TEXT  Path of config.
  --help            Show this message and exit.
```

+ --proj_path  Path of config.
+ --host_addr Address of spg server.

```bash
$ knext project restore --proj_path KagDemo --host_addr http://127.0.0.1:8887
```

In the YAML file, a new id will be added under [project]. If the project already exists on the server, it will return the project's ID. If the project does not exist on the server, it will create a new project and return its ID.

### 1.1.3、project update
When the kag_config.yaml file is updated, you need to execute this command to sync the configuration to the SPG Server. 

```bash
# show the user maual
$ knext project update --help

Usage: knext project update [OPTIONS]

Options:
  --proj_path TEXT  Path of config.
  --help            Show this message and exit.
```

+ --proj_path，Path of config

```bash
knext project update --proj_path KagDemo
```

### 1.1.4、project list
```bash
# show the user manual
$ knext project list --host_addr http://127.0.0.1:8887

Project Name | Project ID
-------------------------
RiskMining           | 1         
SupplyChain          | 2         
TwoWiki              | 3         
Medicine             | 4         
EventDemo            | 5         
HotpotQA             | 6 
```

--host_addr: The address of the SPG server, defaulting to http://127.0.0.1:8887. 

## 1.2、schema
```bash
Usage: knext schema [OPTIONS] COMMAND [ARGS]...

  Schema client.

Options:
  --help  Show this message and exit.

Commands:
  commit            Commit local schema and generate schema helper.
  reg_concept_rule  Register a concept rule according to DSL file.
```

### 1.2.1 Commit schema
When a project is created or restored, or when the schema file is updated, this command needs to be executed to synchronize the schema to the SPG Server.

```bash
# show the user maual
$ knext schema commit --help

Usage: knext schema commit [OPTIONS]

  Commit local schema and generate schema helper.

Options:
  --help  Show this message and exit.
```

### 1.2.2 Register concept rules
```bash
# show the user maual
$ knext schema reg_concept_rule --help

Usage: knext schema reg_concept_rule [OPTIONS]

  Register a concept rule according to DSL file.

Options:
  --file TEXT  Path of DSL file.
  --help       Show this message and exit.
```

+ [Required] --file Path of the concept rule file

Example:

schema/concept.rule

```plain
namespace DEFAULT

`TaxOfRiskApp`/`赌博应用`:
    rule: [[
        ...
    ]]
```

Command:

```bash
$ knext schema reg_concept_rule --file schema/concept.rule
```

Result:

```plain
Defined belongTo rule for ...
...
Concept rule is successfully registered.
```

### 1.3 reasoner
```bash
$ knext reasoner --help

Usage: knext reasoner [OPTIONS] COMMAND [ARGS]...

  Reasoner client.

Options:
  --help  Show this message and exit.

Commands:
  execute   Query dsl by providing a string or file.
```

### 1.3.1 KGDSL query
Submit a KGDSL query job and generate result synchronously.  
If the query job takes more than 3 minutes, an exception will be thrown.

```bash
$ knext reasoner execute [--file] [--dsl]
```

+ [Optional] --file The KGDSL file to query.
+ [Optional] --dsl The KGDSL syntax to query, enclosed in double quotation marks.

Example:

```bash
MATCH (s:Demo.Company)
RETURN s.id, s.address
```

```bash
$ knext reasoner execute --file reasoner/demo.dsl
```

Result：

```bash
|   s_id | s_demoProperty   |
|--------|------------------|
|     00 | demo             |
```


