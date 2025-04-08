---
sidebar_position: 4
---

# Mounting Domain Knowledge

# Introduction
In certain vertical domains such as healthcare, law, and finance, a substantial amount of structured expert knowledge graphs may have been accumulated. These domain-specific knowledge graphs can serve as a priori for unstructured knowledge graph extraction. They not only aid in knowledge extraction but also effectively enhance the overall quality of the knowledge graph, thereby improving the accuracy of reasoning and question-answering.

To support the integration of domain knowledge graphs, KAG introduced the ExternalGraphLoader component in version 0.6, offering the following fundamental features:

1. Loading and importing existing domain knowledge graphs into the graph database.
2. Utilizing domain knowledge graph nodes for entity recognition in documents within the Extractor component.
3. In the PostProcessor component, linking and standardizing entities extracted from unstructured documents to nodes in the domain knowledge graph.

Through these methods, users can integrate graphs constructed from unstructured documents with existing domain knowledge graphs, resulting in a higher quality index.



# Example
An example of medical domain knowledge mounting(injection) is provided in KAG, where the nodes of the domain knowledge graph are medical terms, and the relationships are defined as isA. The document content includes introductions to various medical terms. You can refer to the readme document for an initial experience. 

**Code Path: **`**kag/examples/domain_kg/**`

# Implementation of the Domain Knowledge Mounting Component 
The base class of domain knowledge mounting component  is`kag.interface.builder.external_graph_abc.ExternalGraphLoaderABC`，Users can use the following command to view detailed information of the default implementation:

```bash
$ kag interface --cls ExternalGraphLoaderABC
```

The aforementioned command will print the following information:

```plain
                    Documentation of ExternalGraphLoaderABC
Abstract base class for loading and interacting with external knowledge graphs.

This class defines the interface for components that load and interact with external knowledge graphs.
It inherits from `BuilderComponent` and provides methods for dumping subgraphs, performing named entity
recognition (NER), retrieving allowed labels, and matching entities.
                    Registered subclasses of ExternalGraphLoaderABC
[kag.builder.component.external_graph.external_graph.DefaultExternalGraphLoader]
Register Name: "base"

Documentation:
A default implementation of the ExternalGraphLoaderABC interface.

This class is responsible for loading external graph data based on the provided nodes, edges, and match configuration.

Initializer:
Creates an instance of DefaultExternalGraphLoader from JSON files containing node and edge data.

Args:
    node_file_path (str): The path to the JSON file containing node data.
    edge_file_path (str): The path to the JSON file containing edge data.
    match_config (MatchConfig): The configuration for matching query str to graph nodes.

Returns:
    DefaultExternalGraphLoader: An instance of DefaultExternalGraphLoader initialized with the data from the JSON files.

Required Arguments:
  node_file_path: str
  edge_file_path: str
  match_config: MatchConfig

Optional Arguments:
  No Optional Arguments found

Sample Useage:
  ExternalGraphLoaderABC.from_config({'type': 'base', 'node_file_path': 'Your node_file_path config', 'edge_file_path': 'Your edge_file_path config', 'match_config': 'Your match_config config'})

```

It can be seen that KAG currently offers a default implementation registered under the name "`base`", with the class path being `kag.builder.component.external_graph.external_graph.DefaultExternalGraphLoader`. 



Below is a detailed explanation of the key interfaces.

## Component Initialization
The initialization interface of the `DefaultExternalGraphLoader` contains the following parameters:



+ `node_file_path (str)`

The node data of the domain knowledge graph is in JSON format, resembling: []. 

```json
[
    {
        "id": "00000001,
        "name": "(缩)肾上腺皮质激素",
        "label": "Concept",
        "properties": {

        }
    },
    {
        "id": "00000002",
        "name": "促肾上腺皮质激素",
        "label": "Concept",
        "properties": {

        }
    }
]
```



This format corresponds to the default graph node data model in the KAG framework (`kag.builder.model.sub_graph.Node`). The fields are described as follows:

    -  `id`: The unique identifier of the node.
    -  `name`: The name of the node.
    -  `label`: The type of the node, which must exist within the schema definition.
    -  `properties`: An optional field for storing additional attributes of the node.



+ `edge_file_path (str)`

The relationship data of the domain knowledge graph is in JSON format, resembling: 



```json
[
    {
        "id": "00000001-00000002",
        "from": "00000001",
        "fromType": "Concept",
        "to": "00000002",
        "toType": "Concept",
        "label": "isA",
        "properties": {

        }
    },
    {
        "id": "00000001-00000003",
        "from": "00000001",
        "fromType": "Concept",
        "to": "00000003",
        "toType": "Concept",
        "label": "isA",
        "properties": {

        }
    }
]
```

This format corresponds to the default graph relationship data model in the KAG framework (`kag.builder.model.sub_graph.Edge`). The fields are described as follows:

    - `id`: The unique identifier of the relationship.
    - `label`: The type of the relationship.
    - `from`: The starting point ID of the relationship.
    - `fromType`: The type of the starting point of the relationship.
    - `to`: The ending point ID of the relationship.
    - `toType`: The type of the ending point of the relationship.
    - `properties`: An optional field for storing additional attributes of the relationship.



+ `match_config (MatchConfig)`

An object of type `kag.interface.MatchConfi`g, which defines the configuration for linking external entities to entity nodes within the domain knowledge graph. Its implementation is as follows:

```python
class MatchConfig(Registrable):
    """
    Configuration class for matching operations.

    This class is used to define the parameters for matching operations, such as the number of matches to return,
    the labels to consider, and the threshold for matching confidence.

    Attributes:
        k (int): The number of matches to return. Defaults to 1.
        labels (List[str]): The list of labels to consider for matching. Defaults to None.
        threshold (float): The confidence threshold for matching. Defaults to 0.9.
    """

    def __init__(self, k: int = 1, labels: List[str] = None, threshold: float = 0.9):
        """
        Initializes the MatchConfig with the specified parameters.

        Args:
            k (int, optional): The number of matches to return. Defaults to 1.
            labels (List[str], optional): The list of labels to consider for matching. Defaults to None.
            threshold (float, optional): The confidence threshold for matching. Defaults to 0.9.
        """
        self.k = k
        self.labels = labels
        self.threshold = threshold

```

## Performing Entity Recognition Based on Domain Knowledge Graphs
The `DefaultExternalGraphLoader` offers an NER (Named Entity Recognition) interface that enables the identification of entities within text by leveraging the entities contained in the domain knowledge graph. Compared to entity recognition based on LLM (Large Language Models), this approach allows for a more effective integration of domain-specific knowledge. The interface is defined as follows:

```python
    def ner(self, content: str):
        output = []
        import jieba

        for word in jieba.cut(content):
            if word in self.vocabulary:
                output.append(self.vocabulary[word])
        return output

```

The current implementation relies on Chinese word segmentation and string matching, and users are encouraged to extend it with additional strategies as needed.



## Entity Linking Based on Domain Knowledge Graphs
In numerous scenarios, there is a need to link extracted entities to standardized domain knowledge entity nodes, effectively normalizing the entities. For open domains, this task can be adeptly accomplished with the assistance of LLMs (Large Language Models). However, within specific vertical domains, LLMs often lack the requisite knowledge or concepts. The `DefaultExternalGraphLoader` provides a match_entity interface, which facilitates the search for the most similar node in the domain knowledge graph for any given entity through text matching or vector matching. The interface is defined as follows:

```python
    def match_entity(self, query: Union[str, List[float], np.ndarray]):
        if isinstance(query, str):
            return self.text_match(
                query, k=self.match_config.k, labels=self.match_config.labels
            )
        else:
            return self.vector_match(
                query,
                k=self.match_config.k,
                labels=self.match_config.labels,
                threshold=self.match_config.threshold,
            )

```

Herein, `match_config` delineates the strategy for entity linking, such as the number of entities to link and the similarity threshold, among other parameters.



# Custom extensions
The domain knowledge integration components provided herein are equipped with core functionalities that may not comprehensively address all use cases. Users seeking to fulfill specific requirements are encouraged to consult the[ custom code section](https://openspg.yuque.com/ndx6g9/docs_en/ui1vgeez17zuqxsa) for guidance on extending these components. Key areas for extension encompass:

1. Extending the `ExternalGraphLoader` Component  
For instance, enabling support for loading domain knowledge files in various formats, and customizing ner and match_entity strategies.
2. Extending the `Extractor` Component  
For example, customizing how domain knowledge intervenes or corrects extraction results during the extraction process.
3. Extending the `Solver` Component  
Such as prioritizing retrieval and recall based on domain knowledge during the reasoning and question-answering process.

   