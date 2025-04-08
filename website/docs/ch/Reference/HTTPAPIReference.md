# HTTP API Reference

# 1、数据接口
## 1.1、搜索实体
**GET**** **`/v1/datas/search?projectId={projectId}&label={label}&queryStr={queryStr}&size={size}&page={page}`

搜索项目知识库符合条件的知识

### 1.1.1 请求
+ Method: GET
+ URL: `/v1/datas/search?projectId={projectId}&label={label}&queryStr={queryStr}&size={size}&page={page}`

### 1.1.2 请求示例
```plain
curl --request GET \
  --url 'http://{address}/v1/datas/search?projectId=2000002&label=all&queryStr=%E4%B8%8D%E8%83%BD%E8%AF%B4&size=10&page=1' \
  --header 'Accept: */*' \
  --header 'Accept-Encoding: gzip, deflate, br' \
  --header 'Connection: keep-alive' 
```

### 1.1.3 请求参数
+ `projectId`: (_Path parameter_)  
知识库项目ID。
+ `label`: (_Path parameter_)

指定要查询知识库中的节点名称，如不指定查询则传`all`，默认查询所有类型。

+ `queryStr`: (_Path parameter_)  
查询的关键词。
+ `size`: (_Path parameter_)  
分页参数，每页数据大小，可不传，不传默认为 `10`。
+ `page`: (_Path parameter_)  
分页参数，当前页码， 可不传，不传默认为 `1`。

### 1.1.4 响应
**成功**

```plain
{
    "result": {
        "results": [
            {
                "name": "2007年",
                "docId": "9",
                "score": 4.02420711517334,
                "label": "TaskImport.Date",
                "fields": {
                    "semanticType": "Date",
                    "name": "2007年",
                    "id": "2007年",
                    "desc": "周杰伦自编自导爱情电影《不能说的秘密》的年份。"
                }
            },
            {
                "name": "不能说的秘密",
                "docId": "18",
                "score": 3.61760759353638,
                "label": "TaskImport.Works",
                "fields": {
                    "semanticType": "Movie",
                    "name": "不能说的秘密",
                    "id": "不能说的秘密",
                    "desc": "周杰伦自编自导的爱情电影。"
                }
            },
            {
                "name": "2014年",
                "docId": "29",
                "score": 1.12283396720886,
                "label": "TaskImport.Date",
                "fields": {
                    "semanticType": "Date",
                    "name": "2014年",
                    "id": "2014年",
                    "desc": "周杰伦发行个人首张数字音乐专辑《哎呦，不错哦》的年份。"
                }
            }
        ],
        "total": 3
    },
    "success": true
}
```

**失败**

```plain
{
	"success": false,
	"errorCode": "PRO_0002",
	"errorMsg": "project does not exist"
}
```

## 1.2、实体详情
**POST** `/v1/datas/getEntityDetail`

知识库实体详情数据，包括chunk

### 1.2.1 请求
+ Method: POST
+ URL: `/v1/datas/getEntityDetail`
+ Body:
    - `"projectId"`: `long`
    - `"label"`: `string`
    - `"params"`: `object`

### 1.2.2 请求示例
```plain
 curl --request POST \
  --url http://{address}/v1/datas/getEntityDetail \
  --header 'Accept: application/json, text/plain, */*' \
  --header 'Accept-Encoding: gzip, deflate, br' \
  --header 'Connection: keep-alive' \
  --header 'Content-Type: application/json' \
  --data '{
    "label":"TaskImport.Works",
    "projectId":2000002,
    "params":{
        "id":"青花瓷"
    }
}'
```

### 1.2.3 请求参数
+ `projectId`: (Bo_dy parameter_)  
知识库项目ID。
+ `label`: (Bo_dy parameter_)

指定要查询知识库中的节点名称，且是全称。

+ `params`: (Bo_dy parameter_)  
指定节点的属性k-v,可传多个，多个是&关系。

### 1.2.4 响应
**成功**

```plain
{
  "result": {
    "projectId": 2000002,
    "dsl": "match (n:`TaskImport.Person`) where n.id='jay chou' return n",
    "params": {
      "id": "jay chou"
    },
    "status": "FINISH",
    "resultTable": {
      "total": 1,
      "header": [
        "n"
      ],
      "rows": []
    },
    "resultNodes": [
      {
        "id": "-2731885800256702261",
        "name": "jay chou",
        "label": "TaskImport.Person",
        "properties": {
          "semanticType": "Person",
          "name": "jay chou",
          "desc": "周杰伦的英文名。"
        }
      },
      {
        "id": "-3814377595976243797",
        "name": "周杰伦",
        "label": "TaskImport.Chunk",
        "properties": {
          "name": "周杰伦",
          "id": "16c93f805359b27e000c743ecd9774df7672e8b44e1a18d364b86f6090580483#2000#100#0#LEN",
          "content": "周杰伦\n周杰伦（Jay Chou），1979年1月18日出生于台湾省新北市，祖籍福建省永春县，华语流行乐男歌手、音乐人、演员、导演、编剧，毕业于淡江中学。\n2000年，发行个人首张音乐专辑《Jay》。\n2001年，凭借专辑《范特西》奠定其融合中西方音乐的风格。\n2002年，举行“The One”世界巡回演唱会。\n2003年，成为美国《时代周刊》封面人物；同年，发行音乐专辑《叶惠美》，该专辑获得第15届台湾金曲奖最佳流行音乐演唱专辑奖。\n2004年，发行音乐专辑《七里香》，该专辑在亚洲的首月销量达到300万张；同年，获得世界音乐大奖中国区最畅销艺人奖。\n2005年，主演个人首部电影《头文字D》，并凭借该片获得第25届香港电影金像奖和第42届台湾电影金马奖的最佳新演员奖。\n2006年起，连续三年获得世界音乐大奖中国区最畅销艺人奖。\n2007年，自编自导爱情电影《不能说的秘密》，同年，成立杰威尔音乐有限公司。\n2007年，凭借歌曲《青花瓷》获得第19届台湾金曲奖最佳作曲人奖。\n2007年，入选美国CNN“25位亚洲最具影响力人物”；同年，凭借专辑《魔杰座》获得第20届台湾金曲奖最佳国语男歌手奖。\n2010年，入选美国《Fast Company》评出的“全球百大创意人物”。\n2011年，凭借专辑《跨时代》获得第22届台湾金曲奖最佳国语男歌手奖。\n2012年，登上福布斯中国名人榜榜首。\n2014年，发行个人首张数字音乐专辑《哎呦，不错哦》。\n2023年，凭借专辑《最伟大的作品》成为首位获得国际唱片业协会“全球畅销专辑榜”冠军的华语歌手。"
        }
      }
    ],
    "resultEdges": []
  },
  "success": true
}
```

**失败**

```plain
{
	"success": false,
	"errorCode": "PRO_0002",
	"errorMsg": "project does not exist"
}
```

## 1.3、实体一度邻居子图
**POST **`/v1/datas/getOneHopGraph`

知识库实体一跳子图

### 1.3.1 请求
+ Method: POST
+ URL: `/v1/datas/getOneHopGraph`
+ Body:
    - `"projectId"`: `long`
    - `"label"`: `string`
    - `"params"`: `object`

### 1.3.2 请求示例
```plain
curl --request POST \
  --url http://{address}/v1/datas/getOneHopGraph \
  --header 'Accept: application/json, text/plain, */*' \
  --header 'Accept-Encoding: gzip, deflate, br' \
  --header 'Connection: keep-alive' \
  --header 'Content-Type: application/json' \
  --data '{
    "label":"TaskImport.Person",
    "projectId":2000002,
    "params":{
        "id":"jay chou"
    }
}'
```

### 1.3.3 请求参数
+ `projectId`: (Bo_dy parameter_)  
知识库项目ID。
+ `label`: (Bo_dy parameter_)

一跳子图起点的节点名称，且是全称。

+ `params`: (Bo_dy parameter_)  
指定节点的属性k-v,可传多个，多个是&关系。

### 1.3.4 响应
**成功**

```plain
{
	"result": {
		"projectId": 2000002,
		"dsl": "match (n:`TaskImport.Person`) -[p:rdf_expand('relation')]- (m:Entity) where n.id='jay chou' and n.name='jay chou' return n,p,m,n.id",
		"params": {
			"id": "jay chou",
			"name": "jay chou"
		},
		"status": "FINISH",
		"resultTable": {
			"total": 2,
			"header": [
				"n",
				"p",
				"m",
				"n.id"
			],
			"rows": []
		},
		"resultNodes": [
			{
				"id": "-2731885800256702261",
				"label": "TaskImport.Person",
				"properties": {
					"semanticType": "Person",
					"id": "jay chou",
					"desc": "周杰伦的英文名。"
				}
			},
			{
				"id": "629240674691246506",
				"name": "周杰伦",
				"label": "TaskImport.Person",
				"properties": {
					"semanticType": "Person",
					"name": "周杰伦",
					"id": "周杰伦",
					"desc": "周杰伦的英文名。"
				}
			},
			{
				"id": "-3814377595976243797",
				"name": "周杰伦",
				"label": "TaskImport.Chunk",
				"properties": {
					"name": "周杰伦",
					"id": "16c93f805359b27e000c743ecd9774df7672e8b44e1a18d364b86f6090580483#2000#100#0#LEN",
					"content": "周杰伦\n周杰伦（Jay Chou），1979年1月18日出生于台湾省新北市，祖籍福建省永春县，华语流行乐男歌手、音乐人、演员、导演、编剧，毕业于淡江中学。\n2000年，发行个人首张音乐专辑《Jay》。\n2001年，凭借专辑《范特西》奠定其融合中西方音乐的风格。\n2002年，举行“The One”世界巡回演唱会。\n2003年，成为美国《时代周刊》封面人物；同年，发行音乐专辑《叶惠美》，该专辑获得第15届台湾金曲奖最佳流行音乐演唱专辑奖。\n2004年，发行音乐专辑《七里香》，该专辑在亚洲的首月销量达到300万张；同年，获得世界音乐大奖中国区最畅销艺人奖。\n2005年，主演个人首部电影《头文字D》，并凭借该片获得第25届香港电影金像奖和第42届台湾电影金马奖的最佳新演员奖。\n2006年起，连续三年获得世界音乐大奖中国区最畅销艺人奖。\n2007年，自编自导爱情电影《不能说的秘密》，同年，成立杰威尔音乐有限公司。\n2007年，凭借歌曲《青花瓷》获得第19届台湾金曲奖最佳作曲人奖。\n2007年，入选美国CNN“25位亚洲最具影响力人物”；同年，凭借专辑《魔杰座》获得第20届台湾金曲奖最佳国语男歌手奖。\n2010年，入选美国《Fast Company》评出的“全球百大创意人物”。\n2011年，凭借专辑《跨时代》获得第22届台湾金曲奖最佳国语男歌手奖。\n2012年，登上福布斯中国名人榜榜首。\n2014年，发行个人首张数字音乐专辑《哎呦，不错哦》。\n2023年，凭借专辑《最伟大的作品》成为首位获得国际唱片业协会“全球畅销专辑榜”冠军的华语歌手。"
				}
			}
		],
		"resultEdges": [
			{
				"docId": "-2731885800256702261OfficialName629240674691246506",
				"id": "-2731885800256702261OfficialName629240674691246506",
				"from": "-2731885800256702261",
				"fromId": "jay chou",
				"fromType": "TaskImport.Person",
				"to": "629240674691246506",
				"toId": "周杰伦",
				"toType": "TaskImport.Person",
				"label": "OfficialName",
				"properties": {}
			},
			{
				"docId": "-2731885800256702261source-3814377595976243797",
				"id": "-2731885800256702261source-3814377595976243797",
				"from": "-2731885800256702261",
				"fromId": "jay chou",
				"fromType": "TaskImport.Person",
				"to": "-3814377595976243797",
				"toId": "16c93f805359b27e000c743ecd9774df7672e8b44e1a18d364b86f6090580483#2000#100#0#LEN",
				"toType": "TaskImport.Chunk",
				"label": "source",
				"properties": {}
			}
		]
	},
	"success": true
}
```

**失败**

```plain
{
	"success": false,
	"errorCode": "PARAM_0001",
	"errorMsg": "label is null"
}
```

## 1.4、智能问答 
**POST** `/v1/datas/asyncSubmit`

基于知识库智能问答

### 1.4.1 请求
+ Method: POST
+ URL: `/v1/datas/asyncSubmit`
+ Body:
    - `"sessionId"`: `long`
    - `"projectId"`: `long`
    - `"instruction"`: `string`
    - `"type"`: `string`
    - 

### 1.4.2 请求示例
```plain
curl --request POST \
  --url http://antspg-gz00b-006001032104.sa128-sqa.alipay.net:8887/v1/datas/asyncSubmit \
  --header 'Accept: */*' \
  --header 'Accept-Encoding: gzip, deflate, br' \
  --header 'Connection: keep-alive' \
  --header 'Content-Type: application/json' \
  --data '{
    "sessionId":600003,
    "projectId":300002,
    "instruction":"周杰伦是谁",
    "type":"NL"
}'
```

### 1.4.3 请求参数
+ `sessionId`: (Bo_dy parameter_)

知识库问答，当前会话的id。

+ `projectId`: (Bo_dy parameter_)

知识库的id。

+ `type`: (Bo_dy parameter_)

查询类型，问答 为 `NL`。

+ `instruction`: (Bo_dy parameter_)

查询指令。

### 1.4.4 响应
**成功**

```plain
{
	"result": {
		"id": 2400022,
		"projectId": 300002,
		"userId": 111111,
		"sessionId": 600003,
		"dsl": "周杰伦是谁",
		"nl": "周杰伦是谁",
		"params": {},
		"status": "INIT",
		"resultMessage": "[]"
	},
	"success": true
}
```

**失败**

```plain
{
	"success": false,
	"errorCode": "SYS_0002",
	"errorMsg": "Connection timeout"
}
```

## 1.5、问答详情
**GET** `/v1/datas/query/{id}`

根据【1.4 智能问答】返回的id ，获取最终的数据响应

因是离线任务，当响应的status为FINISH时，才是最终结果

### 1.5.1 请求
+ Method: GET
+ URL: `/v1/datas/query/{id}`
+ Headers:
    - `'content-Type: application/json'`

### 1.5.2 请求示例
```plain
curl --request GET \
  --url http://{address}/v1/datas/query/2400022 \
  --header 'Accept: */*' \
  --header 'Accept-Encoding: gzip, deflate, br' \
  --header 'Connection: keep-alive' 
```

### 1.5.3 请求参数
+ id: (path_ parameter_)

智能问答任务返回的id。

### 1.5.4 响应
**成功**

```plain
{
	"result": {
		"id": 2400022,
		"projectId": 300002,
		"userId": 111111,
		"sessionId": 600003,
		"dsl": "周杰伦是谁",
		"nl": "周杰伦是谁",
		"params": {},
		"mark": "NULL",
		"status": "FINISH",
		"resultMessage": "{\"edges\":[{\"from\":\"1\",\"to\":\"2\"},{\"from\":\"2\",\"to\":\"3\"},{\"from\":\"3\",\"to\":\"0\"}],\"nodes\":[{\"answer\":\"\\n\",\"id\":\"0\",\"question\":\"周杰伦是谁\",\"state\":\"FINISH\",\"title\":\"问题答案\"},{\"answer\":\"['查询周杰伦  ', 'output']\",\"id\":\"1\",\"question\":\"周杰伦是谁\",\"state\":\"FINISH\",\"title\":\"问题\"},{\"answer\":\"I don't know.\\n\\n理由：根据提供的历史信息和文档，没有找到与“查询周杰伦”相关的任何信息或数据，因此无法生成答案。\",\"id\":\"2\",\"logs\":\"## SPO Retriever\\n#### logic_form expression: \\n```java\\nget_spo(s=s1:Entity[周杰伦] ,p=p1:None,o=o1:None)\\n```\\n#### Triplet Retrieved:\\nNo triplets were retrieved.\\n#### answer based by chunk:\\nI don't know.\\n\\n理由：根据提供的历史信息和文档，没有找到与“查询周杰伦”相关的任何信息或数据，因此无法生成答案。\\n\",\"question\":\"查询周杰伦  \",\"state\":\"FINISH\",\"title\":\"子问题1\"},{\"answer\":\"\\n\",\"id\":\"3\",\"logs\":\"## SPO Retriever\\n#### logic_form expression: \\n```java\\n\\n```\\n#### Triplet Retrieved:\\nNo triplets were retrieved.\\n#### answer based by chunk:\\n\\n\\n\",\"question\":\"output\",\"state\":\"FINISH\",\"title\":\"子问题2\"}],\"type\":\"pipeline\"}"
	},
	"success": true
}
```

**失败**

```plain
{
	"success": true,
	"result": {}
}
```



