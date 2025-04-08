---
sidebar_position: 1
---

# Upgraded from v0.5 to v0.6

# 1、Update the MySQL database
In version 0.6, KAG added several new metadata tables. If users want to retain the data from their existing knowledge base, they need to manually add the new tables to the MySQL container. Otherwise, they can simply remove the local openspg-related images and pull the latest image. 

+ **Enter the MySQL container **

```bash
docker exec -it release-openspg-mysql bash -c "mysql -u root -p'openspg' || bash"
```

+ **Execute the new initialization SQL statements **

```sql
use openspg;

ALTER TABLE kg_builder_job
ADD COLUMN `version` VARCHAR(64) DEFAULT NULL COMMENT '版本号',
ADD COLUMN `life_cycle` VARCHAR(64) DEFAULT NULL COMMENT '执行周期类型',
ADD COLUMN `action` VARCHAR(64) DEFAULT NULL COMMENT '数据操作类型',
ADD COLUMN `computing_conf` LONGTEXT DEFAULT NULL COMMENT '计算引擎配置';

CREATE TABLE `kg_scheduler_job` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT COMMENT '主键',
  `project_id` bigint(20) unsigned NOT NULL COMMENT '项目ID',
  `gmt_create` timestamp NOT NULL DEFAULT current_timestamp() COMMENT '创建时间',
  `gmt_modified` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp() COMMENT '修改时间',
  `create_user` varchar(32) DEFAULT NULL COMMENT '创建人',
  `modify_user` varchar(32) DEFAULT NULL COMMENT '修改人',
  `name` varchar(64) NOT NULL COMMENT '任务名称',
  `life_cycle` varchar(64) NOT NULL COMMENT '调度周期类型',
  `translate_type` varchar(64) NOT NULL COMMENT '任务转换类型',
  `status` varchar(64) NOT NULL COMMENT '状态',
  `dependence` varchar(64) NOT NULL COMMENT '前置依赖',
  `scheduler_cron` varchar(128) DEFAULT NULL COMMENT '调度周期cron表达式',
  `last_execute_time` timestamp NULL COMMENT '最后一次执行时间',
  `invoker_id` bigint(20) unsigned DEFAULT NULL COMMENT '调用者id',
  `extension` longtext DEFAULT NULL COMMENT '扩展信息',
  `version` varchar(64) DEFAULT NULL COMMENT '版本号',
  PRIMARY KEY (`id`),
  KEY `idx_project_id` (`project_id`),
  KEY `idx_projcet_create_user_name` (`project_id`,`create_user`)
) DEFAULT CHARSET=utf8mb4 COMMENT='调度任务表';

CREATE TABLE `kg_scheduler_instance` (
 `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT COMMENT '主键',
 `project_id` bigint(20) unsigned NOT NULL COMMENT '项目ID',
 `gmt_create` timestamp NOT NULL DEFAULT current_timestamp() COMMENT '创建时间',
 `gmt_modified` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp() COMMENT '修改时间',
 `create_user` varchar(32) DEFAULT NULL COMMENT '创建人',
 `modify_user` varchar(32) DEFAULT NULL COMMENT '修改人',
 `unique_id` varchar(128) NOT NULL COMMENT '调度实例唯一id',
 `job_id` bigint(20) unsigned NOT NULL COMMENT '调度任务ID',
 `type` varchar(64) NOT NULL COMMENT '实例类型',
 `status` varchar(64) NOT NULL COMMENT '实例状态',
 `progress` bigint(20) unsigned DEFAULT 0 COMMENT '进度',
 `begin_running_time` timestamp NULL COMMENT '实例开始时间',
 `finish_time` timestamp NULL COMMENT '实例完成时间',
 `life_cycle` varchar(64) NOT NULL COMMENT '调度周期类型',
 `dependence` varchar(64) NOT NULL COMMENT '前置依赖',
 `scheduler_date` timestamp NULL COMMENT '调度执行时间',
 `version` varchar(64) DEFAULT NULL COMMENT '版本号',
 `extension` longtext DEFAULT NULL COMMENT '扩展信息',
 `task_dag` longtext DEFAULT NULL COMMENT '示例调度DAG',
 PRIMARY KEY (`id`),
 KEY `idx_project_id` (`project_id`),
 KEY `idx_job_id` (`job_id`),
 UNIQUE KEY `uk_unique_id` (`unique_id`)
) DEFAULT CHARSET=utf8mb4 COMMENT='调度实例表';

CREATE TABLE `kg_scheduler_task` (
 `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT COMMENT '主键',
 `project_id` bigint(20) unsigned NOT NULL COMMENT '项目ID',
 `gmt_create` timestamp NOT NULL DEFAULT current_timestamp() COMMENT '创建时间',
 `gmt_modified` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp() COMMENT '修改时间',
 `job_id` bigint(20) unsigned NOT NULL COMMENT '调度任务ID',
 `instance_id` bigint(20) unsigned NOT NULL COMMENT '调度示例ID',
 `type` varchar(64) NOT NULL COMMENT '类型',
 `status` varchar(64) NOT NULL COMMENT '实例状态',
 `title` varchar(128) NOT NULL COMMENT '节点标题',
 `execute_num` bigint(20) unsigned DEFAULT 0 COMMENT '执行次数',
 `begin_time` timestamp NULL COMMENT '开始执行时间',
 `finish_time` timestamp NULL COMMENT '执行完成时间',
 `estimate_finish_time` timestamp NULL COMMENT '预估完成时间',
 `trace_log` longtext DEFAULT NULL COMMENT '执行日志',
 `lock_time` timestamp NULL COMMENT '抢锁时间',
 `resource` varchar(10240) DEFAULT NULL COMMENT '资源标记',
 `input` longtext DEFAULT NULL COMMENT '输入信息',
 `output` longtext DEFAULT NULL COMMENT '输出信息',
 `node_id` varchar(64) NOT NULL COMMENT '节点id',
 `extension` longtext DEFAULT NULL COMMENT '扩展信息',
 PRIMARY KEY (`id`),
 KEY `idx_project_id` (`project_id`),
 KEY `idx_job_id` (`job_id`),
 KEY `idx_instance_id` (`instance_id`),
 KEY `idx_type_status` (`type`,`status`),
 UNIQUE KEY `uk_instance_node_id` (`instance_id`,`node_id`)
) DEFAULT CHARSET=utf8mb4 COMMENT='调度作业节点表';

CREATE TABLE `kg_scheduler_info` (
 `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT COMMENT '主键',
 `gmt_create` timestamp NOT NULL DEFAULT current_timestamp() COMMENT '创建时间',
 `gmt_modified` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp() COMMENT '修改时间',
 `name` varchar(64) NOT NULL COMMENT '调度任务名称',
 `status` varchar(32) DEFAULT NULL COMMENT '状态',
 `period` bigint(20) DEFAULT 300 COMMENT '调度间隔，单位秒',
 `count` bigint(20) unsigned DEFAULT 0 COMMENT '失败次数',
 `log` longtext DEFAULT NULL COMMENT '日志内容',
 `config` longtext DEFAULT NULL COMMENT '配置信息',
 `lock_time` timestamp NULL COMMENT '抢锁时间',
 PRIMARY KEY (`id`),
 UNIQUE KEY `uk_name` (`name`)
) DEFAULT CHARSET=utf8mb4 COMMENT='调度任务记录表';

CREATE TABLE `kg_data_source`(
 `id`              bigint(20) unsigned NOT NULL AUTO_INCREMENT COMMENT '主键',
 `gmt_create`      timestamp     NOT NULL DEFAULT current_timestamp() COMMENT '创建时间',
 `gmt_modified`    timestamp     NOT NULL DEFAULT current_timestamp() on update current_timestamp () COMMENT '修改时间',
 `create_user`     varchar(64)   NOT NULL DEFAULT 'system' COMMENT '创建用户',
 `update_user`     varchar(64)   NOT NULL DEFAULT 'system' COMMENT '修改用户',
 `status`          varchar(64)   NOT NULL DEFAULT 'ENABLE' COMMENT '状态',
 `remark`          varchar(1024)          DEFAULT NULL COMMENT '描述',
 `type`            varchar(64)   NOT NULL DEFAULT 'MYSQL' COMMENT '数据源类型',
 `db_name`         varchar(256)  NOT NULL COMMENT '数据源名称',
 `db_url`          varchar(1024) NOT NULL COMMENT '数据库url',
 `db_user`         varchar(128)           DEFAULT NULL COMMENT '数据源用户名',
 `db_password`     varchar(128)           DEFAULT NULL COMMENT '数据源密码',
 `db_driver_name`  varchar(128)           DEFAULT NULL COMMENT '数据源驱动',
 `category`        varchar(64)            DEFAULT NULL COMMENT '数据源类别',
 `connection_info` longtext               DEFAULT NULL COMMENT '连接配置信息',
PRIMARY KEY (`id`),
UNIQUE KEY `uk_db_name` (`db_name`)
) DEFAULT CHARSET=utf8mb4 COMMENT='数据源管理表';

CREATE TABLE `kg_user` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT COMMENT '主键',
  `gmt_create` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `gmt_modified` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '修改时间',
  `user_no` varchar(255) NOT NULL COMMENT '用户工号',
  `token` varchar(255) NOT NULL COMMENT 'token',
  `last_token` varchar(255) DEFAULT NULL COMMENT '修改前token',
  `salt` varchar(255) NOT NULL COMMENT '随机字符串',
  `gmt_last_token_disable` timestamp NULL DEFAULT NULL COMMENT 'token修改时间',
  `dw_access_id` varchar(32) DEFAULT NULL COMMENT '数仓用户ID',
  `dw_access_key` varchar(64) DEFAULT NULL COMMENT '数仓用户密钥',
  `real_name` varchar(50) DEFAULT NULL COMMENT '用户真名',
  `nick_name` varchar(50) DEFAULT NULL COMMENT '用户花名',
  `email` varchar(64) DEFAULT NULL COMMENT '用户邮箱',
  `domain_account` varchar(64) DEFAULT NULL COMMENT '用户域账号',
  `mobile` varchar(64) DEFAULT NULL COMMENT '用户手机号',
  `wx_account` varchar(64) DEFAULT NULL COMMENT '用户微信账号',
  `config` text DEFAULT NULL COMMENT '配置，json',
  PRIMARY KEY(`id`),
  UNIQUE KEY `uk_userNo`(`user_no`),
  UNIQUE KEY `uk_token`(`token`),
  UNIQUE KEY `uk_domain_account`(`domain_account`)
) DEFAULT CHARSET = utf8mb4 COMMENT = '用户管理表';

CREATE TABLE `kg_config` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT COMMENT '主键',
  `gmt_create` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `gmt_modified` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '修改时间',
  `project_id` varchar(64) NOT NULL COMMENT '项目id，可以为某个域的唯一值',
  `config_name` varchar(64) NOT NULL COMMENT '配置名称',
  `config_id` varchar(128) NOT NULL COMMENT '配置id',
  `version` varchar(64) NOT NULL DEFAULT '1' COMMENT '配置版本',
  `config` longtext NOT NULL COMMENT '配置，json',
  `status` int(11) NOT NULL DEFAULT '1' COMMENT '状态，1有效',
  `description` varchar(1024) DEFAULT NULL COMMENT '版本描述',
  `resource_id` varchar(128) DEFAULT NULL COMMENT '资源id,用于外键关联schem视图',
  `resource_type` varchar(128) DEFAULT 'CONFIG' COMMENT '资源类型',
  `user_no` varchar(64) NOT NULL COMMENT '创建者',
  PRIMARY KEY(`id`),
  UNIQUE KEY `uk_configidversion`(`config_id`, `version`),
  KEY `idx_projectid`(`project_id`)
) DEFAULT CHARSET = utf8mb4 COMMENT = '图谱配置表';

CREATE TABLE `kg_resource_permission` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT COMMENT '主键',
  `gmt_create` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `gmt_modified` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '修改时间',
  `user_no` varchar(255) NOT NULL COMMENT '用户工号',
  `resource_id` bigint(20) NOT NULL COMMENT '资源id',
  `role_id` bigint(20) NOT NULL COMMENT '角色id',
  `resource_tag` varchar(50) NOT NULL DEFAULT 'TYPE' COMMENT '资源分类',
  `status` varchar(2) NOT NULL DEFAULT '99' COMMENT '状态。-1：驳回;99：审批中;1：有效;9：删除',
  `expire_date` date DEFAULT NULL COMMENT '过期日期',
  PRIMARY KEY(`id`),
  UNIQUE KEY `uk_unique`(`user_no`, `resource_id`, `resource_tag`),
  KEY `idx_resource`(`resource_id`, `role_id`)
) DEFAULT CHARSET = utf8mb4 COMMENT = '资源权限表';

CREATE TABLE `kg_role` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT COMMENT '主键，角色id',
  `gmt_create` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `gmt_modified` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '修改时间',
  `role_name` varchar(255) NOT NULL COMMENT '角色名',
  `permission_detail` text DEFAULT NULL COMMENT '角色权限具体信息，json格式',
  PRIMARY KEY(`id`),
  UNIQUE KEY `uk_role_name`(`role_name`)
) DEFAULT CHARSET = utf8mb4 COMMENT = '平台角色表';

INSERT INTO kg_user (`gmt_create`,`gmt_modified`,`user_no`,`token`,`last_token`,`salt`,`gmt_last_token_disable`,`dw_access_id`,`dw_access_key`,`real_name`,`nick_name`,`email`,`domain_account`,`mobile`,`wx_account`,`config`) VALUES(now(),now(),'openspg','075Df6275475a739',null,'Ktu4O',null,null,'efea9c06f9a581fe392bab2ee9a0508b2878f958c1f422f8080999e7dc024b83','openspg','openspg',null,'openspg',null,null,'{"useCurrentLanguage":"zh-CN"}');
INSERT INTO kg_role (`id`,`gmt_create`,`gmt_modified`,`role_name`,`permission_detail`) VALUES(1,now(),now(),'SUPER','');
INSERT INTO kg_role (`id`,`gmt_create`,`gmt_modified`,`role_name`,`permission_detail`) VALUES(2,now(),now(),'OWNER','');
INSERT INTO kg_role (`id`,`gmt_create`,`gmt_modified`,`role_name`,`permission_detail`) VALUES(3,now(),now(),'MEMBER','');
INSERT INTO kg_resource_permission (`gmt_create`,`gmt_modified`,`user_no`,`resource_id`,`role_id`,`resource_tag`,`status`,`expire_date`) VALUES(now(),now(),'openspg',0,1,'PLATFORM','1',null);
INSERT INTO kg_config (`id`,`gmt_create`,`gmt_modified`,`project_id`,`config_name`,`config_id`,`version`,`config`,`status`,`description`,`resource_id`,`resource_type`,`user_no`) VALUES(1,now(),now(),'0','KAG Support Model','KAG_SUPPORT_MODEL','1','[{"id":1,"vendor":"vllm","logo":"/img/logo/vllm.png","params":[{"ename":"base_url","cname":"base_url","required":true,"defaultValue":""},{"ename":"model","cname":"model","required":true,"defaultValue":""},{"ename":"desc","cname":"desc","required":true,"formProps":{"allowClear":true,"placeholder":"Please enter remarks for partitioning."}}]},{"id":2,"vendor":"maas","logo":"/img/logo/maas.png","params":[{"ename":"base_url","cname":"base_url","required":true,"defaultValue":""},{"ename":"api_key","cname":"api_key ","required":true,"defaultValue":""},{"ename":"model","cname":"model","required":true,"defaultValue":""},{"ename":"temperature","cname":"temperature","required":true,"formType":"number","defaultValue":0.7},{"ename":"stream","cname":"stream","required":true,"defaultValue":"False"},{"ename":"desc","cname":"desc","required":true,"formProps":{"allowClear":true,"placeholder":"Please enter remarks for partitioning."}}]},{"id":3,"vendor":"Ollama","logo":"/img/logo/ollama.png","params":[{"ename":"base_url","cname":"base_url","required":true,"defaultValue":""},{"ename":"model","cname":"model","required":true,"defaultValue":""},{"ename":"desc","cname":"desc","required":true,"formProps":{"allowClear":true,"placeholder":"Please enter remarks for partitioning."}}]}]',1,null,null,'SYSTEM_CONFIG','');
INSERT INTO kg_config (`id`,`gmt_create`,`gmt_modified`,`project_id`,`config_name`,`config_id`,`version`,`config`,`status`,`description`,`resource_id`,`resource_type`,`user_no`) VALUES(2,now(),now(),'0','Global Configuration','KAG_CONFIG','1','',1,null,null,'CONFIG','admin');
INSERT INTO kg_config (`id`,`gmt_create`,`gmt_modified`,`project_id`,`config_name`,`config_id`,`version`,`config`,`status`,`description`,`resource_id`,`resource_type`,`user_no`) VALUES(3,now(),now(),'0','KAG Environment Configuration','KAG_ENV','1','{"configTitle":{"graph_store":{"id":1,"title":[{"ename":"database","cname":"database","required":true,"defaultValue":"kag","formProps":{"disabled":true}},{"ename":"password","cname":"password","required":true,"defaultValue":""},{"ename":"uri","cname":"uri","required":true,"defaultValue":""},{"ename":"user","cname":"user","required":true,"defaultValue":""}]},"vectorizer":{"id":2,"title":[{"ename":"type","cname":"type","required":true,"defaultValue":"openai","formProps":{"disabled":true}},{"ename":"model","cname":"model","required":true,"defaultValue":""},{"ename":"base_url","cname":"base_url","required":true,"defaultValue":""},{"ename":"api_key","cname":"api_key","required":true,"defaultValue":""}]},"prompt":{"id":3,"title":[{"ename":"biz_scene","cname":"biz_scene","required":true,"defaultValue":""},{"ename":"language","cname":"language","required":true,"defaultValue":""}]}}}',1,null,null,'SYSTEM_CONFIG','');

```

# 2、Update the opengspg-server image 
+ **delete the old opengspg-server image**

```bash
docker stop release-openspg-server
docker rm release-openspg-server
docker rmi spg-registry.us-west-1.cr.aliyuncs.com/spg/openspg-server:latest
```

+ **pull latest opengspg-server image**

```bash
# get docker-compose.yaml file
$ curl -sSL https://raw.githubusercontent.com/OpenSPG/openspg/refs/heads/master/dev/release/docker-compose-west.yml -o docker-compose-west.yml

# service start
$ docker compose -f docker-compose-west.yml up -d
```

