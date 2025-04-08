---
sidebar_position: 1
---

# Differences between Developer & Product Mode

+ Comparing versions：0.6

| Module | Features | Feature Details | Developer Mode | Product Mode |
| --- | --- | --- | --- | --- |
| Knowledge Base | Permission | Permission Management | - [ ]  | - [x]  |
| schema | EntityType | Create | - [x]  | - [x]  |
| | | Edit Chinese name | - [x]  | - [x]  |
| | | Delete | - [x]  | - [x]  |
| | ConceptType | Create | - [x]  | - [x]  |
| | | Edit Chinese name | - [x]  | - [x]  |
| | | Delete | - [x]  | - [x]  |
| | EventType | Create | - [x]  | - [ ]  |
| | | Edit Chinese name | - [x]  | - [ ]  |
| | | Delete | - [x]  | - [ ]  |
| | StandardType | Create | - [x]  | - [ ]  |
| | | Edit Chinese name | - [x]  | - [ ]  |
| | | Delete | - [x]  | - [ ]  |
| | RelationType | EntityType to EntityType | - [x]  | - [x]  |
| | | EntityType to ConceptType | - [x]  | - [x]  |
| | | EntityType to StandardType | - [x]  | - [x]  |
| | | Rule | - [x]  | - [x]  |
| | EntityType Property | Constraint | - [x]  | - [x]  |
| | | Index | - [x]  | - [x]  |
| | | Rule | - [x]  | - [x]  |
| | RelationType Property | Constraint | - [x]  | - [x]  |
| | | Index | - [ ]  | - [ ]  |
| | | Rule | - [ ]  | - [ ]  |
| | SubProperty | EntityType Property | - [x]  | - [ ]  |
| | | RelationType Property | - [ ]  | - [ ]  |
| | | Constraint | - [ ]  | - [ ]  |
| | | Index | - [ ]  | - [ ]  |
| | | Rule | - [ ]  | - [ ]  |
| | Inherit |  | - [x]  | - [ ]  |
| | autoRelate |  | - [x]  | - [ ]  |
| | Containing symbols (e.g., #) | EntityType to ConceptType<br/>ConceptType to ConceptType | - [x]  | - [ ]  |

