# SeaTunnel Web 重构思路（任务定义 / 任务执行 / 客户端管理 / 离线与实时）

> 目标：在不一次性推倒重来的前提下，把现有“按 Service 堆叠”的结构，逐步演进为“按业务能力分域 + 按用例编排”的结构。

## 1. 先看当前痛点（基于现有代码）

1. **任务定义（Definition）与调度、执行耦合较多**
   - `BatchJobDefinitionServiceImpl` 同时处理定义保存、调度信息回填、删除时实例清理等跨域职责。 
   - `StreamingJobDefinitionServiceImpl` 既处理定义又直接暴露 deploy/start/stop/restart 生命周期入口。 

2. **任务执行（Execution）与运行模式（批/流）边界还不够明确**
   - `JobExecutorServiceImpl` 直接走 “create instance + submit runtime config”，目前 pause/stop 仍未抽象完成。 

3. **客户端管理（Client）兼具资源管理和探活逻辑**
   - `SeaTunnelClientServiceImpl` 同时做 CRUD、启停状态、心跳上报、探活与日志拉取。 

4. **离线（Batch）和实时（Streaming）在定义层做了区分，但执行层策略尚未完全分离**
   - 定义层已有 `BatchJobDefinitionServiceImpl` / `StreamingJobDefinitionServiceImpl` 双实现；
   - 但执行编排与状态协同可进一步沉淀为统一接口 + 模式化策略。

## 2. 建议的分层与分域

建议采用：**API 层（Controller） → Application 层（用例编排） → Domain 层（业务规则） → Infrastructure 层（DAO/三方调用）**。

### 2.1 四个核心业务域（Bounded Context）

1. **Definition Domain（任务定义域）**
   - 职责：任务草稿、校验、版本、DAG/HOCON 构建、发布门禁。
   - 关键聚合：`JobDefinition`（按 `JobMode` 区分 Batch/Streaming）。
   - 只关心“定义是否可发布”，不直接提交执行。

2. **Execution Domain（任务执行域）**
   - 职责：实例创建、启动、停止、重试、状态机、事件记录。
   - 关键聚合：`JobInstance`。
   - 通过策略接口对接 Batch/Streaming 执行差异。

3. **Client Domain（客户端域）**
   - 职责：Client 注册、能力声明、健康状态、路由选择、隔离与摘除。
   - 关键聚合：`SeaTunnelClient`。
   - 对外提供“可执行节点选择服务”。

4. **Schedule Domain（调度域）**
   - 职责：cron 解析、调度启停、触发历史、补数/错过触发处理（后续）。
   - 关键聚合：`JobSchedule`。
   - 只负责“何时触发”，触发后调用 Execution Application Service。

## 3. 离线与实时如何划分

不要直接按“离线模块 / 实时模块”切包到最外层，而是采用：

- **统一主干（Definition/Execution/Client/Schedule）**；
- 在域内部通过 `JobMode` + `ExecutionStrategy` 做差异化。

### 3.1 推荐方式

1. **定义统一，策略分流**
   - `DefinitionApplicationService.saveOrUpdate(dto)`
   - 内部根据 `JobMode` 选择 `BatchDefinitionPolicy` / `StreamingDefinitionPolicy`。

2. **执行统一，引擎策略分流**
   - `ExecutionApplicationService.start(definitionId, triggerType)`
   - 内部：
     - `BatchExecutionStrategy`：一次性实例、结束态完结；
     - `StreamingExecutionStrategy`：长任务、重启/滚动变更/stop with savepoint（逐步演进）。

3. **状态模型分层**
   - 上层统一状态：`PENDING/RUNNING/SUCCESS/FAILED/STOPPED`；
   - 底层保留引擎原生状态映射表（便于兼容多引擎）。

## 4. 包结构建议（可渐进迁移）

```text
org.apache.seatunnel.web
  ├─ definition
  │   ├─ api
  │   ├─ application
  │   ├─ domain
  │   └─ infrastructure
  ├─ execution
  │   ├─ api
  │   ├─ application
  │   ├─ domain
  │   └─ infrastructure
  ├─ client
  │   ├─ api
  │   ├─ application
  │   ├─ domain
  │   └─ infrastructure
  ├─ schedule
  │   ├─ api
  │   ├─ application
  │   ├─ domain
  │   └─ infrastructure
  └─ shared
      ├─ common
      ├─ event
      └─ exception
```

> 迁移时可先保留旧包，新增 `application` 与 `domain`，通过适配器逐步替换，避免大爆炸。

## 5. 从当前代码到目标架构的映射建议

1. `BatchJobDefinitionServiceImpl` / `StreamingJobDefinitionServiceImpl`
   - 拆分为：
     - `DefinitionApplicationService`（用例编排）
     - `DefinitionDomainService`（校验、版本、发布门禁）
     - `DefinitionRepository`（DAO 适配）

2. `JobExecutorServiceImpl`
   - 演进为：
     - `ExecutionApplicationService`（start/stop/retry）
     - `ExecutionDomainService`（状态机）
     - `ExecutionStrategy`（Batch / Streaming）

3. `SeaTunnelClientServiceImpl`
   - 拆分为：
     - `ClientRegistryService`（注册与元数据）
     - `ClientHealthService`（心跳/探活）
     - `ClientRoutingService`（执行路由与负载策略）

4. `JobScheduleServiceImpl`
   - 保留在调度域，向下封装 Quartz；
   - 触发后只发命令给 `ExecutionApplicationService`。

## 6. 建议的重构阶段（四步走）

### 阶段 1：先“理边界”不改行为
- 把“定义、执行、客户端、调度”四类 service 做 façade；
- 原有实现先内聚到 façade 后面；
- 输出领域事件（先日志事件即可）。

### 阶段 2：引入策略与状态机
- 为 Execution 引入 `ExecutionStrategy`；
- 为 Instance 引入显式状态迁移检查（防止非法状态跳转）。

### 阶段 3：拆基础设施依赖
- 把 DAO、RestTemplate、Quartz 都收口到 infrastructure adapter；
- application/domain 层不直接依赖具体框架类。

### 阶段 4：补可观测性和回归保障
- 增加端到端链路日志（definitionId / instanceId / clientId）；
- 建立批/流各 3~5 条金丝雀回归用例（创建、启动、停止、失败重试、调度触发）。

## 7. 设计原则（落地时重点盯）

1. **一个用例一个 Application Service 入口**，避免 Service 间互相调用成网。  
2. **Domain 不依赖 Spring/DAO/HTTP**，只表达业务规则。  
3. **Batch/Streaming 差异放策略，不放 if-else 散落在各层。**  
4. **状态变化必须可追踪**（事件或审计日志）。  
5. **先兼容、再替换**：每次重构保持 API 不破坏。

## 8. 你可以立刻执行的最小行动清单（两周）

- Week 1
  - 新增 `execution.application.ExecutionApplicationService`，把 `JobExecutorServiceImpl` 的启动入口迁过去；
  - 引入 `ExecutionStrategy` 接口和 Batch 默认实现；
  - 保持 Controller 接口不变。

- Week 2
  - 新增 `client.application.ClientHealthService`，迁移心跳/探活逻辑；
  - 把调度触发统一改为调用 `ExecutionApplicationService.start(...)`；
  - 增加 5 条回归测试（至少覆盖批任务启动、调度触发、客户端下线处理）。

---

如果你愿意，我下一步可以直接给你一版 **“按你当前代码目录可执行的重构任务拆解表（按文件级别）”**，包括：
- 每个类先迁到哪里；
- 哪些接口先抽象；
- 每一步怎么保证可回滚。
