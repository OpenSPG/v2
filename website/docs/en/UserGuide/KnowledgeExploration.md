---
sidebar_position: 8
---

# Knowledge Exploration

KAG supports exploring and visualizing extracted knowledge in a graphical manner, currently offering three methods: 

+ Searching for entities 
+ Obtaining entity details, as well as the corresponding article snippets of the entity 
+ Acquiring the one-hop subgraph of an entity

## 1、Entity search 
Perform a fuzzy search for all entities that match the keywords. Any entity type attributes set with corresponding indexes in the schema and completed in the knowledge base can be retrieved. The predefined "name" field of entity types automatically has an index created by default.

```plain
Works(作品): EntityType
     properties:
        desc(描述): Text
            index: TextAndVector
```

After searching, the results can be further filtered by type or by attributes and their values.

![1736323037895-757647a8-7d4a-47f7-89c9-045e58049d97.png](./img/BtvCoLkHqr-xziAh/1736323037895-757647a8-7d4a-47f7-89c9-045e58049d97-903937.png)

## 2、Canvas exploration 
In the search list, select a knowledge point and enter canvas exploration, where you can query point details and one-hop subgraph on the canvas.

![1736323066590-af58d18f-7e91-4681-8bed-198cf11f4ba8.png](./img/BtvCoLkHqr-xziAh/1736323066590-af58d18f-7e91-4681-8bed-198cf11f4ba8-097152.png)

### 2.1、Entity detail
Click on a point on the canvas to view entity details.

![1736323088453-a534755c-bbaa-4d76-ac69-569f25da2010.png](./img/BtvCoLkHqr-xziAh/1736323088453-a534755c-bbaa-4d76-ac69-569f25da2010-410619.png)

+ Basic information：The source of the entity chunk
+ Static property：The attributes and attribute values of entities. If there are too many attributes, you can search for a single attribute and its value by the Chinese or English name of the attribute.

### 2.2、One-hop subgraph of an entity
+ One-degree expansion

Right-click on the entity point to expand the one-degree relationship (all), including outgoing and incoming edges.

![1736323122319-b4d568af-c0f4-4eb3-9369-791afa2c8abb.png](./img/BtvCoLkHqr-xziAh/1736323122319-b4d568af-c0f4-4eb3-9369-791afa2c8abb-757118.png)

+ Search

Quickly locate on the canvas based on points and edges

![1736323136238-306667b1-c79b-44eb-876e-5a9ae49fd5c3.png](./img/BtvCoLkHqr-xziAh/1736323136238-306667b1-c79b-44eb-876e-5a9ae49fd5c3-985958.png)

+ Canvas tools   
Layout switching, node merging, canvas adaptation, centering, zooming in, zooming out, full-screen mode, downloading, and collapsing toolbars.

![1736166650083-82ee127d-d555-44fb-a67f-24410989dd3b.png](./img/BtvCoLkHqr-xziAh/1736166650083-82ee127d-d555-44fb-a67f-24410989dd3b-367428.png)
