import json
import os

# Load existing questions
file_path = "/home/wakkadu/MOCKINTERVIEWER/mockinterview/data/questions.json"
with open(file_path, "r", encoding="utf-8") as f:
    data = json.load(f)

# Existing categories to remove (because they overlap with the new specific categories)
to_remove = [
    "Technical", # generic technical replaced by specific engineering roles
    "Software Engineering Roles (Algorithmic, System Design, Whiteboard)",
    "Data Science & Machine Learning Positions",
    "DevOps, Cloud & Cybersecurity Engineering",
    "Management Consulting (Case Interviews)",
    "Investment Banking & Financial Analyst Positions",
    "Product Management Roles",
    "Sales & Business Development Positions",
    "Human Resources & Talent Acquisition Roles",
    "Customer Support & Success Management",
    "Executive & C-Suite Leadership Positions"
]

for k in to_remove:
    if k in data:
        del data[k]

new_questions = {
    "Software Engineer / Backend Developer (Data structures, algorithms, API design, database optimization)": [
        {
            "id": "se_be1",
            "category": "Software Engineer / Backend Developer (Data structures, algorithms, API design, database optimization)",
            "text": "How do you design a RESTful API to support high-throughput, idempotent payment processing, and how do you implement idempotency keys at the database and cache layers?"
        },
        {
            "id": "se_be2",
            "category": "Software Engineer / Backend Developer (Data structures, algorithms, API design, database optimization)",
            "text": "Explain the performance and scalability trade-offs between cursor-based pagination and offset/limit pagination on tables with tens of millions of rows."
        },
        {
            "id": "se_be3",
            "category": "Software Engineer / Backend Developer (Data structures, algorithms, API design, database optimization)",
            "text": "How do you diagnose and resolve the N+1 query problem in relational ORMs, and when would you prefer raw SQL with window functions over ORM abstractions?"
        },
        {
            "id": "se_be4",
            "category": "Software Engineer / Backend Developer (Data structures, algorithms, API design, database optimization)",
            "text": "Describe your strategy for designing database indexes on multi-tenant tables. How do column order, selectivity, and composite indexes affect execution plans?"
        },
        {
            "id": "se_be5",
            "category": "Software Engineer / Backend Developer (Data structures, algorithms, API design, database optimization)",
            "text": "How do you design an API versioning and deprecation strategy that supports backward compatibility without maintaining bloated legacy code indefinitely?"
        },
        {
            "id": "se_be6",
            "category": "Software Engineer / Backend Developer (Data structures, algorithms, API design, database optimization)",
            "text": "Compare optimistic locking with pessimistic locking in high-concurrency database transactions. How do you prevent deadlocks during concurrent record updates?"
        },
        {
            "id": "se_be7",
            "category": "Software Engineer / Backend Developer (Data structures, algorithms, API design, database optimization)",
            "text": "Explain how you implement distributed rate limiting across multiple backend instances using Redis. How do token bucket and sliding window algorithms differ in practice?"
        },
        {
            "id": "se_be8",
            "category": "Software Engineer / Backend Developer (Data structures, algorithms, API design, database optimization)",
            "text": "How do you handle transient network failures and partial errors when your service orchestrates multiple third-party synchronous APIs?"
        },
        {
            "id": "se_be9",
            "category": "Software Engineer / Backend Developer (Data structures, algorithms, API design, database optimization)",
            "text": "What data structure would you choose to build an in-memory least-recently-used (LRU) cache with O(1) get and put operations, and how do you ensure thread safety?"
        },
        {
            "id": "se_be10",
            "category": "Software Engineer / Backend Developer (Data structures, algorithms, API design, database optimization)",
            "text": "How do you format error responses in your APIs (e.g. RFC 7807 Problem Details) to provide machine-readable error codes while hiding sensitive stack traces from clients?"
        },
        {
            "id": "se_be11",
            "category": "Software Engineer / Backend Developer (Data structures, algorithms, API design, database optimization)",
            "text": "When would you choose an asynchronous message queue (e.g. RabbitMQ/Kafka) over synchronous REST or gRPC communication between backend microservices?"
        },
        {
            "id": "se_be12",
            "category": "Software Engineer / Backend Developer (Data structures, algorithms, API design, database optimization)",
            "text": "Walk me through how you use EXPLAIN ANALYZE to optimize a slow query involving multiple joins, aggregate filters, and sorting on an unindexed column."
        }
    ],

    "Frontend Engineer / UI Developer (Component lifecycle, state management, CSS layouts, web performance)": [
        {
            "id": "fe_ui1",
            "category": "Frontend Engineer / UI Developer (Component lifecycle, state management, CSS layouts, web performance)",
            "text": "How do you optimize Core Web Vitals (specifically LCP, INP, and CLS) in a modern web application, and how do you identify the root causes of main-thread blocking?"
        },
        {
            "id": "fe_ui2",
            "category": "Frontend Engineer / UI Developer (Component lifecycle, state management, CSS layouts, web performance)",
            "text": "Compare React Server Components (RSC) with Client Components. How do you design component boundaries to minimize client-side bundle size and waterfall fetches?"
        },
        {
            "id": "fe_ui3",
            "category": "Frontend Engineer / UI Developer (Component lifecycle, state management, CSS layouts, web performance)",
            "text": "Explain how you implement accessible modal dialogs adhering to WCAG 2.2 AA guidelines, including focus trapping, keyboard navigation, and ARIA attributes."
        },
        {
            "id": "fe_ui4",
            "category": "Frontend Engineer / UI Developer (Component lifecycle, state management, CSS layouts, web performance)",
            "text": "When building data-intensive tables with over 50,000 items, how do you implement DOM virtualization and infinite scrolling without degrading scrolling frame rate?"
        },
        {
            "id": "fe_ui5",
            "category": "Frontend Engineer / UI Developer (Component lifecycle, state management, CSS layouts, web performance)",
            "text": "How do you manage client-side state across deeply nested components? Compare Zustand, Jotai, React Context, and URL-driven state for complex web apps."
        },
        {
            "id": "fe_ui6",
            "category": "Frontend Engineer / UI Developer (Component lifecycle, state management, CSS layouts, web performance)",
            "text": "How do you handle optimistic UI updates during slow network connections, and what is your rollback strategy when the server rejects a mutation?"
        },
        {
            "id": "fe_ui7",
            "category": "Frontend Engineer / UI Developer (Component lifecycle, state management, CSS layouts, web performance)",
            "text": "Explain the architectural differences and use cases between CSS Grid (including Subgrid) and Flexbox when designing complex responsive layouts."
        },
        {
            "id": "fe_ui8",
            "category": "Frontend Engineer / UI Developer (Component lifecycle, state management, CSS layouts, web performance)",
            "text": "What causes memory leaks in Single Page Applications (SPAs), and how do you use browser DevTools heap snapshots to detect unreleased event listeners and detached DOM nodes?"
        },
        {
            "id": "fe_ui9",
            "category": "Frontend Engineer / UI Developer (Component lifecycle, state management, CSS layouts, web performance)",
            "text": "How do you configure route-based code splitting and dynamic imports in bundlers like Turbopack or Vite to optimize initial page load performance?"
        },
        {
            "id": "fe_ui10",
            "category": "Frontend Engineer / UI Developer (Component lifecycle, state management, CSS layouts, web performance)",
            "text": "Describe your approach to building a resilient offline-first user experience using Service Workers, CacheStorage, and IndexedDB."
        },
        {
            "id": "fe_ui11",
            "category": "Frontend Engineer / UI Developer (Component lifecycle, state management, CSS layouts, web performance)",
            "text": "How do you ensure CSS architecture scales across large engineering teams without selector specificity wars or unintended layout regressions?"
        },
        {
            "id": "fe_ui12",
            "category": "Frontend Engineer / UI Developer (Component lifecycle, state management, CSS layouts, web performance)",
            "text": "How do you capture, sanitize, and transmit client-side error telemetry to monitoring systems (e.g. Sentry) without exposing end-user personally identifiable information (PII)?"
        }
    ],

    "Mobile App Developer - iOS / Android (App architecture, state management, memory management, offline storage)": [
        {
            "id": "mob_dev1",
            "category": "Mobile App Developer - iOS / Android (App architecture, state management, memory management, offline storage)",
            "text": "How do you architect an offline-first mobile application with bi-directional local database synchronization and automatic conflict resolution?"
        },
        {
            "id": "mob_dev2",
            "category": "Mobile App Developer - iOS / Android (App architecture, state management, memory management, offline storage)",
            "text": "Explain how you detect and eliminate retain cycles and memory leaks in Swift closures or Kotlin coroutine scopes."
        },
        {
            "id": "mob_dev3",
            "category": "Mobile App Developer - iOS / Android (App architecture, state management, memory management, offline storage)",
            "text": "Compare declarative UI state management patterns in SwiftUI and Jetpack Compose. How do you prevent unnecessary recompositions and layout re-renders?"
        },
        {
            "id": "mob_dev4",
            "category": "Mobile App Developer - iOS / Android (App architecture, state management, memory management, offline storage)",
            "text": "How do you manage background processing under strict iOS Background Tasks and Android WorkManager battery optimization constraints?"
        },
        {
            "id": "mob_dev5",
            "category": "Mobile App Developer - iOS / Android (App architecture, state management, memory management, offline storage)",
            "text": "Describe how you secure sensitive authentication credentials and tokens locally using iOS Keychain and Android KeyStore."
        },
        {
            "id": "mob_dev6",
            "category": "Mobile App Developer - iOS / Android (App architecture, state management, memory management, offline storage)",
            "text": "How do you design deep linking and universal links navigation to ensure consistent routing when the app is launched from a cold start versus background state?"
        },
        {
            "id": "mob_dev7",
            "category": "Mobile App Developer - iOS / Android (App architecture, state management, memory management, offline storage)",
            "text": "Walk me through your process for profiling high frame rate drops (jank) and battery consumption using Xcode Instruments or Android Studio Profiler."
        },
        {
            "id": "mob_dev8",
            "category": "Mobile App Developer - iOS / Android (App architecture, state management, memory management, offline storage)",
            "text": "How do you modularize a large mobile codebase into distinct feature modules to accelerate build times and enforce clear architectural boundaries?"
        },
        {
            "id": "mob_dev9",
            "category": "Mobile App Developer - iOS / Android (App architecture, state management, memory management, offline storage)",
            "text": "How do you handle volatile network conditions, packet drops, and request timeouts to maintain a responsive user experience in mobile apps?"
        },
        {
            "id": "mob_dev10",
            "category": "Mobile App Developer - iOS / Android (App architecture, state management, memory management, offline storage)",
            "text": "Describe your strategy for implementing biometric authentication (Face ID / Fingerprint) alongside fallback PIN validation securely."
        },
        {
            "id": "mob_dev11",
            "category": "Mobile App Developer - iOS / Android (App architecture, state management, memory management, offline storage)",
            "text": "How do you coordinate push notification payloads when the user taps a notification while the app is completely terminated?"
        },
        {
            "id": "mob_dev12",
            "category": "Mobile App Developer - iOS / Android (App architecture, state management, memory management, offline storage)",
            "text": "What steps do you take when preparing an app release to prevent App Store Review or Google Play Policy rejections around privacy manifests and permissions?"
        }
    ],

    "Full-Stack Engineer (End-to-end architecture, cross-stack integration, system trade-offs)": [
        {
            "id": "fs_eng1",
            "category": "Full-Stack Engineer (End-to-end architecture, cross-stack integration, system trade-offs)",
            "text": "How do you design a real-time notification engine from a WebSocket or SSE frontend down to a Redis Pub/Sub backend with reconnection fallbacks?"
        },
        {
            "id": "fs_eng2",
            "category": "Full-Stack Engineer (End-to-end architecture, cross-stack integration, system trade-offs)",
            "text": "Explain how you enforce end-to-end type safety between frontend client applications and backend database schemas using tools like tRPC, GraphQL, or OpenAPI generators."
        },
        {
            "id": "fs_eng3",
            "category": "Full-Stack Engineer (End-to-end architecture, cross-stack integration, system trade-offs)",
            "text": "How do you architect a large file upload system that streams directly to object storage (e.g. S3) via presigned URLs without choking application servers?"
        },
        {
            "id": "fs_eng4",
            "category": "Full-Stack Engineer (End-to-end architecture, cross-stack integration, system trade-offs)",
            "text": "Compare server-side rendering (SSR), static site generation (SSG), and client-side rendering (CSR). How do you prevent hydration mismatch errors?"
        },
        {
            "id": "fs_eng5",
            "category": "Full-Stack Engineer (End-to-end architecture, cross-stack integration, system trade-offs)",
            "text": "How do you design an authentication and session architecture across client cookies, JWTs, and distributed session caches while preventing XSS and CSRF?"
        },
        {
            "id": "fs_eng6",
            "category": "Full-Stack Engineer (End-to-end architecture, cross-stack integration, system trade-offs)",
            "text": "When executing breaking database schema migrations, how do you coordinate code deployments and database changes using the expand-and-contract pattern to ensure zero downtime?"
        },
        {
            "id": "fs_eng7",
            "category": "Full-Stack Engineer (End-to-end architecture, cross-stack integration, system trade-offs)",
            "text": "How do you troubleshoot a performance issue where an API endpoint responds in 200ms on the server but takes 2.5s to render interactively on the user's browser?"
        },
        {
            "id": "fs_eng8",
            "category": "Full-Stack Engineer (End-to-end architecture, cross-stack integration, system trade-offs)",
            "text": "How do you configure CORS headers, reverse proxy rules, and cookie policies when your frontend and backend run on different subdomains?"
        },
        {
            "id": "fs_eng9",
            "category": "Full-Stack Engineer (End-to-end architecture, cross-stack integration, system trade-offs)",
            "text": "Describe your strategy for caching data across the entire stack—from CDN edge nodes down to application-level Redis caches and database query caches."
        },
        {
            "id": "fs_eng10",
            "category": "Full-Stack Engineer (End-to-end architecture, cross-stack integration, system trade-offs)",
            "text": "How do you design a robust webhook delivery and consumption system that guarantees at-least-once delivery, handles signature verification, and deduplicates payloads?"
        },
        {
            "id": "fs_eng11",
            "category": "Full-Stack Engineer (End-to-end architecture, cross-stack integration, system trade-offs)",
            "text": "When should an engineering organization maintain a unified monolithic codebase versus decoupling into independent frontend and backend services?"
        },
        {
            "id": "fs_eng12",
            "category": "Full-Stack Engineer (End-to-end architecture, cross-stack integration, system trade-offs)",
            "text": "How do you establish standardized API error handling contracts across the full stack so frontend clients can display context-specific validation messages seamlessly?"
        }
    ],

    "Systems Architect / Principal Engineer (Scalability, high availability, microservices, distributed systems)": [
        {
            "id": "sys_arch1",
            "category": "Systems Architect / Principal Engineer (Scalability, high availability, microservices, distributed systems)",
            "text": "How do you design a multi-region active-active distributed architecture that guarantees sub-second cross-region read latency and resolves write conflicts?"
        },
        {
            "id": "sys_arch2",
            "category": "Systems Architect / Principal Engineer (Scalability, high availability, microservices, distributed systems)",
            "text": "Explain how the CAP theorem and PACELC theorem influence your database selection when designing a globally distributed transactional banking system."
        },
        {
            "id": "sys_arch3",
            "category": "Systems Architect / Principal Engineer (Scalability, high availability, microservices, distributed systems)",
            "text": "Describe how you decompose a monolithic database shared by 20 teams into domain-driven microservices without causing data corruption or distributed transaction bottlenecks."
        },
        {
            "id": "sys_arch4",
            "category": "Systems Architect / Principal Engineer (Scalability, high availability, microservices, distributed systems)",
            "text": "How do you implement the Saga pattern (orchestration vs choreography) to maintain data consistency across distributed services during order fulfillment?"
        },
        {
            "id": "sys_arch5",
            "category": "Systems Architect / Principal Engineer (Scalability, high availability, microservices, distributed systems)",
            "text": "Explain the architectural mechanics of consistent hashing and how it minimizes key redistribution when dynamically resizing cache clusters or distributed storage nodes."
        },
        {
            "id": "sys_arch6",
            "category": "Systems Architect / Principal Engineer (Scalability, high availability, microservices, distributed systems)",
            "text": "How do you protect distributed microservices from cascading failures using circuit breakers, bulkheads, adaptive rate limiters, and exponential backoff with jitter?"
        },
        {
            "id": "sys_arch7",
            "category": "Systems Architect / Principal Engineer (Scalability, high availability, microservices, distributed systems)",
            "text": "Describe your strategy for implementing distributed tracing (OpenTelemetry) and structured correlation IDs across polyglot microservices processing millions of events per second."
        },
        {
            "id": "sys_arch8",
            "category": "Systems Architect / Principal Engineer (Scalability, high availability, microservices, distributed systems)",
            "text": "How do you design an API Gateway layer that handles TLS termination, authentication offloading, mTLS service mesh verification, and dynamic routing at scale?"
        },
        {
            "id": "sys_arch9",
            "category": "Systems Architect / Principal Engineer (Scalability, high availability, microservices, distributed systems)",
            "text": "How do consensus protocols like Raft or Paxos guarantee linearizable state machine replication during network partitions and leader node crashes?"
        },
        {
            "id": "sys_arch10",
            "category": "Systems Architect / Principal Engineer (Scalability, high availability, microservices, distributed systems)",
            "text": "What architectural strategies do you employ to prevent cache stampedes (thundering herd problem) when high-traffic cache keys expire concurrently?"
        },
        {
            "id": "sys_arch11",
            "category": "Systems Architect / Principal Engineer (Scalability, high availability, microservices, distributed systems)",
            "text": "How do you formulate an enterprise disaster recovery plan with defined RTO (Recovery Time Objective) and RPO (Recovery Point Objective) targets for 99.999% availability?"
        },
        {
            "id": "sys_arch12",
            "category": "Systems Architect / Principal Engineer (Scalability, high availability, microservices, distributed systems)",
            "text": "How do you design schema evolution policies for event-driven message brokers (e.g. Kafka Avro / Protobuf) to guarantee backward and forward compatibility?"
        }
    ],

    "DevOps / Infrastructure / SRE Engineer (CI/CD pipelines, container orchestration, terraform, incident response)": [
        {
            "id": "devops_sre1",
            "category": "DevOps / Infrastructure / SRE Engineer (CI/CD pipelines, container orchestration, terraform, incident response)",
            "text": "How do you design an enterprise GitOps deployment pipeline using ArgoCD or Flux that supports automated canary analysis and zero-downtime rollback?"
        },
        {
            "id": "devops_sre2",
            "category": "DevOps / Infrastructure / SRE Engineer (CI/CD pipelines, container orchestration, terraform, incident response)",
            "text": "Explain how Kubernetes schedules pods based on resource requests, limits, QoS classes, and node affinity, and how misconfigurations lead to OOMKilled crashes."
        },
        {
            "id": "devops_sre3",
            "category": "DevOps / Infrastructure / SRE Engineer (CI/CD pipelines, container orchestration, terraform, incident response)",
            "text": "How do you structure Terraform code across multiple environments (dev, staging, prod) and cloud accounts to prevent state file locking conflicts and drift?"
        },
        {
            "id": "devops_sre4",
            "category": "DevOps / Infrastructure / SRE Engineer (CI/CD pipelines, container orchestration, terraform, incident response)",
            "text": "Walk me through how you lead a high-severity production incident triage bridge under high-stress conditions while maintaining blameless incident protocol."
        },
        {
            "id": "devops_sre5",
            "category": "DevOps / Infrastructure / SRE Engineer (CI/CD pipelines, container orchestration, terraform, incident response)",
            "text": "How do you establish Service Level Objectives (SLOs), Service Level Indicators (SLIs), and Error Budgets that effectively bridge product velocity with system reliability?"
        },
        {
            "id": "devops_sre6",
            "category": "DevOps / Infrastructure / SRE Engineer (CI/CD pipelines, container orchestration, terraform, incident response)",
            "text": "What strategies do you use to secure containerized workloads, including distroless base images, read-only root filesystems, and pod security standards?"
        },
        {
            "id": "devops_sre7",
            "category": "DevOps / Infrastructure / SRE Engineer (CI/CD pipelines, container orchestration, terraform, incident response)",
            "text": "How do you configure Prometheus alerting rules and Alertmanager routing to combat alert fatigue and ensure on-call engineers only receive actionable pages?"
        },
        {
            "id": "devops_sre8",
            "category": "DevOps / Infrastructure / SRE Engineer (CI/CD pipelines, container orchestration, terraform, incident response)",
            "text": "How do you secure CI/CD pipelines against software supply chain attacks, credential leakage, and malicious dependency tampering?"
        },
        {
            "id": "devops_sre9",
            "category": "DevOps / Infrastructure / SRE Engineer (CI/CD pipelines, container orchestration, terraform, incident response)",
            "text": "Describe how you design an infrastructure auto-scaling policy using Kubernetes Horizontal Pod Autoscaler (HPA) and cluster autoscalers to manage sudden 10x traffic spikes."
        },
        {
            "id": "devops_sre10",
            "category": "DevOps / Infrastructure / SRE Engineer (CI/CD pipelines, container orchestration, terraform, incident response)",
            "text": "What kernel-level network tuning (e.g. TCP window size, epoll limits, connection tracking tables) do you perform when Linux servers drop packets under heavy loads?"
        },
        {
            "id": "devops_sre11",
            "category": "DevOps / Infrastructure / SRE Engineer (CI/CD pipelines, container orchestration, terraform, incident response)",
            "text": "How do you conduct chaos engineering experiments (e.g. injecting latency or killing nodes) in staging environments to validate resilience before going live?"
        },
        {
            "id": "devops_sre12",
            "category": "DevOps / Infrastructure / SRE Engineer (CI/CD pipelines, container orchestration, terraform, incident response)",
            "text": "How do you write a comprehensive, blameless post-mortem document following a major outage that identifies systemic vulnerabilities without assigning personal blame?"
        }
    ],

    "Cybersecurity Analyst / Penetration Tester (Threat modeling, vulnerability assessment, incident handler scenarios)": [
        {
            "id": "cyber_sec1",
            "category": "Cybersecurity Analyst / Penetration Tester (Threat modeling, vulnerability assessment, incident handler scenarios)",
            "text": "How do you apply the STRIDE threat modeling framework to evaluate the security architecture of a cloud-native financial payment API?"
        },
        {
            "id": "cyber_sec2",
            "category": "Cybersecurity Analyst / Penetration Tester (Threat modeling, vulnerability assessment, incident handler scenarios)",
            "text": "Walk me through how you investigate and contain an active ransomware outbreak across an enterprise Windows Active Directory environment."
        },
        {
            "id": "cyber_sec3",
            "category": "Cybersecurity Analyst / Penetration Tester (Threat modeling, vulnerability assessment, incident handler scenarios)",
            "text": "Explain how Server-Side Request Forgery (SSRF) vulnerabilities arise in modern cloud applications and how attackers leverage them to steal cloud instance metadata tokens."
        },
        {
            "id": "cyber_sec4",
            "category": "Cybersecurity Analyst / Penetration Tester (Threat modeling, vulnerability assessment, incident handler scenarios)",
            "text": "How do you detect and remediate Insecure Direct Object References (IDOR) during an API penetration test, and why do automated scanners often miss them?"
        },
        {
            "id": "cyber_sec5",
            "category": "Cybersecurity Analyst / Penetration Tester (Threat modeling, vulnerability assessment, incident handler scenarios)",
            "text": "Describe your methodology for analyzing suspicious endpoint logs in a SIEM when detecting living-off-the-land (LotL) binaries and PowerShell execution."
        },
        {
            "id": "cyber_sec6",
            "category": "Cybersecurity Analyst / Penetration Tester (Threat modeling, vulnerability assessment, incident handler scenarios)",
            "text": "How do you exploit and subsequently remediate cross-site scripting (XSS) when a target web application employs a strict Content Security Policy (CSP)?"
        },
        {
            "id": "cyber_sec7",
            "category": "Cybersecurity Analyst / Penetration Tester (Threat modeling, vulnerability assessment, incident handler scenarios)",
            "text": "What steps do you take during an external penetration test when you discover an exposed credential hash to perform lateral movement without triggering EDR alerts?"
        },
        {
            "id": "cyber_sec8",
            "category": "Cybersecurity Analyst / Penetration Tester (Threat modeling, vulnerability assessment, incident handler scenarios)",
            "text": "How do you assess and audit IAM privilege escalation risks in AWS environments (e.g. PassRole, AssumeRole, policy attachment misconfigurations)?"
        },
        {
            "id": "cyber_sec9",
            "category": "Cybersecurity Analyst / Penetration Tester (Threat modeling, vulnerability assessment, incident handler scenarios)",
            "text": "Explain the mechanics of a Kerberoasting attack against an enterprise Active Directory domain and how defenders can detect and mitigate it."
        },
        {
            "id": "cyber_sec10",
            "category": "Cybersecurity Analyst / Penetration Tester (Threat modeling, vulnerability assessment, incident handler scenarios)",
            "text": "How do you formulate an incident containment strategy when an executive's laptop is compromised with infostealer malware containing browser session cookies?"
        },
        {
            "id": "cyber_sec11",
            "category": "Cybersecurity Analyst / Penetration Tester (Threat modeling, vulnerability assessment, incident handler scenarios)",
            "text": "How do you configure and tune Web Application Firewall (WAF) rule sets to block zero-day command injection attacks while minimizing false positive blocks?"
        },
        {
            "id": "cyber_sec12",
            "category": "Cybersecurity Analyst / Penetration Tester (Threat modeling, vulnerability assessment, incident handler scenarios)",
            "text": "How do you translate complex technical vulnerability findings into a risk-prioritized executive summary for non-technical board members and auditors?"
        }
    ],

    "Data Engineer (ETL pipelines, data warehousing, query performance tuning, data modeling)": [
        {
            "id": "data_eng1",
            "category": "Data Engineer (ETL pipelines, data warehousing, query performance tuning, data modeling)",
            "text": "How do you design a high-throughput streaming data pipeline using Apache Kafka and Apache Flink that guarantees exactly-once processing semantics?"
        },
        {
            "id": "data_eng2",
            "category": "Data Engineer (ETL pipelines, data warehousing, query performance tuning, data modeling)",
            "text": "Compare Kimball dimensional modeling (Star Schema) with One Big Table (OBT) architectures in modern cloud data warehouses like Snowflake and BigQuery."
        },
        {
            "id": "data_eng3",
            "category": "Data Engineer (ETL pipelines, data warehousing, query performance tuning, data modeling)",
            "text": "How do you resolve backpressure, memory skew, and out-of-memory errors in distributed Apache Spark jobs processing terabytes of nested JSON data?"
        },
        {
            "id": "data_eng4",
            "category": "Data Engineer (ETL pipelines, data warehousing, query performance tuning, data modeling)",
            "text": "Describe how you implement Slowly Changing Dimensions (SCD Type 2) in a batch data lakehouse pipeline using Delta Lake or Apache Iceberg."
        },
        {
            "id": "data_eng5",
            "category": "Data Engineer (ETL pipelines, data warehousing, query performance tuning, data modeling)",
            "text": "How do you optimize slow analytical queries on partitioned and clustered data warehouse tables that scan terabytes of unnecessary data?"
        },
        {
            "id": "data_eng6",
            "category": "Data Engineer (ETL pipelines, data warehousing, query performance tuning, data modeling)",
            "text": "How do you build automated data quality validation frameworks (e.g. Great Expectations or dbt tests) into production orchestration DAGs?"
        },
        {
            "id": "data_eng7",
            "category": "Data Engineer (ETL pipelines, data warehousing, query performance tuning, data modeling)",
            "text": "Explain how Change Data Capture (CDC) with Debezium captures relational database binlogs and synchronizes data into a real-time analytics warehouse."
        },
        {
            "id": "data_eng8",
            "category": "Data Engineer (ETL pipelines, data warehousing, query performance tuning, data modeling)",
            "text": "How do you handle schema drift and unexpected payload mutations in upstream event streams without crashing downstream consumer pipelines?"
        },
        {
            "id": "data_eng9",
            "category": "Data Engineer (ETL pipelines, data warehousing, query performance tuning, data modeling)",
            "text": "What architectural patterns do you implement to comply with GDPR and CCPA 'Right to Be Forgotten' data erasure requests in immutable append-only data lakes?"
        },
        {
            "id": "data_eng10",
            "category": "Data Engineer (ETL pipelines, data warehousing, query performance tuning, data modeling)",
            "text": "How do you manage complex dependency graphs and catch silent failures in workflow orchestrators like Apache Airflow or Dagster?"
        },
        {
            "id": "data_eng11",
            "category": "Data Engineer (ETL pipelines, data warehousing, query performance tuning, data modeling)",
            "text": "Compare columnar file storage formats (Parquet vs ORC). How do row group sizes, dictionary encoding, and compression algorithms impact query performance?"
        },
        {
            "id": "data_eng12",
            "category": "Data Engineer (ETL pipelines, data warehousing, query performance tuning, data modeling)",
            "text": "How do you implement data lineage and metadata catalogs across distributed enterprise data assets to empower self-service analytics safely?"
        }
    ],

    "Data Scientist / Machine Learning Engineer (Model evaluation, feature engineering, statistical inference, live coding)": [
        {
            "id": "ds_mle1",
            "category": "Data Scientist / Machine Learning Engineer (Model evaluation, feature engineering, statistical inference, live coding)",
            "text": "How do you detect and mitigate data drift and concept drift in a production fraud detection model whose inference accuracy degrades over time?"
        },
        {
            "id": "ds_mle2",
            "category": "Data Scientist / Machine Learning Engineer (Model evaluation, feature engineering, statistical inference, live coding)",
            "text": "How do you handle extreme class imbalance (e.g. 99.9% negative vs 0.1% positive)? Compare SMOTE, focal loss, and PR-AUC versus ROC-AUC evaluation."
        },
        {
            "id": "ds_mle3",
            "category": "Data Scientist / Machine Learning Engineer (Model evaluation, feature engineering, statistical inference, live coding)",
            "text": "How do you calculate the required sample size and statistical power for an online A/B test when baseline metrics exhibit high variance?"
        },
        {
            "id": "ds_mle4",
            "category": "Data Scientist / Machine Learning Engineer (Model evaluation, feature engineering, statistical inference, live coding)",
            "text": "Explain how you engineer features from non-stationary time series data without introducing lookahead bias or data leakage."
        },
        {
            "id": "ds_mle5",
            "category": "Data Scientist / Machine Learning Engineer (Model evaluation, feature engineering, statistical inference, live coding)",
            "text": "How do you explain predictions from complex black-box gradient boosted models or neural networks to non-technical business stakeholders using SHAP or LIME?"
        },
        {
            "id": "ds_mle6",
            "category": "Data Scientist / Machine Learning Engineer (Model evaluation, feature engineering, statistical inference, live coding)",
            "text": "What techniques do you use to reduce inference latency and memory footprints when deploying large Transformer models into production (e.g. quantization, distillation, vLLM)?"
        },
        {
            "id": "ds_mle7",
            "category": "Data Scientist / Machine Learning Engineer (Model evaluation, feature engineering, statistical inference, live coding)",
            "text": "Describe your strategy for building and tuning a vector search retrieval pipeline (HNSW / FAISS) for a production Retrieval-Augmented Generation (RAG) system."
        },
        {
            "id": "ds_mle8",
            "category": "Data Scientist / Machine Learning Engineer (Model evaluation, feature engineering, statistical inference, live coding)",
            "text": "How do you evaluate recommendation systems using ranking metrics like Normalized Discounted Cumulative Gain (NDCG) and Mean Average Precision (MAP)?"
        },
        {
            "id": "ds_mle9",
            "category": "Data Scientist / Machine Learning Engineer (Model evaluation, feature engineering, statistical inference, live coding)",
            "text": "Walk me through how you identify and handle severe multicollinearity among predictive features in generalized linear models."
        },
        {
            "id": "ds_mle10",
            "category": "Data Scientist / Machine Learning Engineer (Model evaluation, feature engineering, statistical inference, live coding)",
            "text": "How do you establish continuous integration and deployment for machine learning models (MLOps), including automated model evaluation gates and canary rollouts?"
        },
        {
            "id": "ds_mle11",
            "category": "Data Scientist / Machine Learning Engineer (Model evaluation, feature engineering, statistical inference, live coding)",
            "text": "When would you choose Bayesian inference and probabilistic programming over standard frequentist maximum likelihood estimation?"
        },
        {
            "id": "ds_mle12",
            "category": "Data Scientist / Machine Learning Engineer (Model evaluation, feature engineering, statistical inference, live coding)",
            "text": "How do you diagnose whether an underperforming deep learning model is suffering from high bias versus high variance, and what are your prioritized remediation steps?"
        }
    ],

    "Quality Assurance (QA) / Test Automation Engineer (Test strategy, automated framework design, boundary case identification)": [
        {
            "id": "qa_auto1",
            "category": "Quality Assurance (QA) / Test Automation Engineer (Test strategy, automated framework design, boundary case identification)",
            "text": "How do you design a scalable end-to-end test automation architecture using Playwright or Cypress that executes tests in parallel without data collisions?"
        },
        {
            "id": "qa_auto2",
            "category": "Quality Assurance (QA) / Test Automation Engineer (Test strategy, automated framework design, boundary case identification)",
            "text": "Explain how you implement consumer-driven contract testing with Pact to prevent breaking API changes between frontend and backend services."
        },
        {
            "id": "qa_auto3",
            "category": "Quality Assurance (QA) / Test Automation Engineer (Test strategy, automated framework design, boundary case identification)",
            "text": "How do you systematically identify boundary conditions and equivalence partitions for a complex financial transaction engine with multi-currency conversion?"
        },
        {
            "id": "qa_auto4",
            "category": "Quality Assurance (QA) / Test Automation Engineer (Test strategy, automated framework design, boundary case identification)",
            "text": "What is your strategy for eliminating test flakiness in CI/CD pipelines, and how do you distinguish between genuine bugs and environmental timing issues?"
        },
        {
            "id": "qa_auto5",
            "category": "Quality Assurance (QA) / Test Automation Engineer (Test strategy, automated framework design, boundary case identification)",
            "text": "How do you design performance and load testing suites using k6 or JMeter to simulate realistic user ramp-ups and uncover database connection saturation?"
        },
        {
            "id": "qa_auto6",
            "category": "Quality Assurance (QA) / Test Automation Engineer (Test strategy, automated framework design, boundary case identification)",
            "text": "How do you structure exploratory testing sessions when features have ambiguous requirements and tight release deadlines?"
        },
        {
            "id": "qa_auto7",
            "category": "Quality Assurance (QA) / Test Automation Engineer (Test strategy, automated framework design, boundary case identification)",
            "text": "How do you allocate testing effort across the testing pyramid (unit, integration, contract, E2E) to maintain fast CI feedback loops without compromising test coverage?"
        },
        {
            "id": "qa_auto8",
            "category": "Quality Assurance (QA) / Test Automation Engineer (Test strategy, automated framework design, boundary case identification)",
            "text": "Describe your approach to automating accessibility audits (WCAG 2.2 AA) within automated test suites using tools like axe-core."
        },
        {
            "id": "qa_auto9",
            "category": "Quality Assurance (QA) / Test Automation Engineer (Test strategy, automated framework design, boundary case identification)",
            "text": "How do you test REST and GraphQL APIs for security edge cases, such as SQL injection payloads, broken object level authorization, and rate limit exhaustion?"
        },
        {
            "id": "qa_auto10",
            "category": "Quality Assurance (QA) / Test Automation Engineer (Test strategy, automated framework design, boundary case identification)",
            "text": "How do you manage test data creation, isolation, and teardown across environments to ensure test suites can run idempotently multiple times a day?"
        },
        {
            "id": "qa_auto11",
            "category": "Quality Assurance (QA) / Test Automation Engineer (Test strategy, automated framework design, boundary case identification)",
            "text": "Explain how you implement automated visual regression testing to detect unintended pixel-level CSS layout shifts across mobile and desktop viewports."
        },
        {
            "id": "qa_auto12",
            "category": "Quality Assurance (QA) / Test Automation Engineer (Test strategy, automated framework design, boundary case identification)",
            "text": "When an urgent production hotfix needs deployment in 30 minutes, how do you conduct risk-based regression testing to balance release velocity with defect risk?"
        }
    ],

    "Product Manager (Product vision, metric prioritization, UI/UX critique, feature trade-offs)": [
        {
            "id": "prod_mgr1",
            "category": "Product Manager (Product vision, metric prioritization, UI/UX critique, feature trade-offs)",
            "text": "How do you prioritize between a critical enterprise feature requested by your largest customer and technical debt reduction that engineering insists is urgent?"
        },
        {
            "id": "prod_mgr2",
            "category": "Product Manager (Product vision, metric prioritization, UI/UX critique, feature trade-offs)",
            "text": "Define the North Star Metric and supporting input metrics for a two-sided B2B marketplace platform, and explain how you evaluate trade-offs between buyer and seller growth."
        },
        {
            "id": "prod_mgr3",
            "category": "Product Manager (Product vision, metric prioritization, UI/UX critique, feature trade-offs)",
            "text": "How do you assess product-market fit when top-of-funnel acquisition is surging but 30-day cohort retention drops steeply below industry benchmarks?"
        },
        {
            "id": "prod_mgr4",
            "category": "Product Manager (Product vision, metric prioritization, UI/UX critique, feature trade-offs)",
            "text": "Walk me through how you design an A/B experimentation plan to increase user onboarding completion by 20%, including primary, secondary, and guardrail metrics."
        },
        {
            "id": "prod_mgr5",
            "category": "Product Manager (Product vision, metric prioritization, UI/UX critique, feature trade-offs)",
            "text": "Critique a popular consumer application you use daily. What are three major UX friction points, and how would you redesign them to drive business impact?"
        },
        {
            "id": "prod_mgr6",
            "category": "Product Manager (Product vision, metric prioritization, UI/UX critique, feature trade-offs)",
            "text": "How do you handle severe pushback from engineering leadership when they estimate your proposed roadmap feature will take three times longer than anticipated?"
        },
        {
            "id": "prod_mgr7",
            "category": "Product Manager (Product vision, metric prioritization, UI/UX critique, feature trade-offs)",
            "text": "Describe your strategy for sunsetting a legacy product feature that is utilized by only 5% of users but accounts for a disproportionate volume of support tickets."
        },
        {
            "id": "prod_mgr8",
            "category": "Product Manager (Product vision, metric prioritization, UI/UX critique, feature trade-offs)",
            "text": "How do you structure customer discovery interviews to uncover deep latent customer problems without asking leading questions?"
        },
        {
            "id": "prod_mgr9",
            "category": "Product Manager (Product vision, metric prioritization, UI/UX critique, feature trade-offs)",
            "text": "How do you determine the pricing and packaging strategy when introducing a new AI-powered tier into an existing SaaS subscription model?"
        },
        {
            "id": "prod_mgr10",
            "category": "Product Manager (Product vision, metric prioritization, UI/UX critique, feature trade-offs)",
            "text": "How do you react when a well-funded competitor launches a feature nearly identical to your company's core value proposition at half the price?"
        },
        {
            "id": "prod_mgr11",
            "category": "Product Manager (Product vision, metric prioritization, UI/UX critique, feature trade-offs)",
            "text": "What components must be included in an exceptional Product Requirements Document (PRD) to ensure engineering and design have complete clarity?"
        },
        {
            "id": "prod_mgr12",
            "category": "Product Manager (Product vision, metric prioritization, UI/UX critique, feature trade-offs)",
            "text": "One week before a major public launch, QA discovers a high-severity bug that cannot be fixed without a launch delay. How do you make the launch decision?"
        }
    ],

    "Technical Program Manager / Scrum Master (Agile processes, cross-functional alignment, timeline risk management)": [
        {
            "id": "tpm_sm1",
            "category": "Technical Program Manager / Scrum Master (Agile processes, cross-functional alignment, timeline risk management)",
            "text": "How do you identify and de-risk critical cross-team dependencies across five distinct engineering squads with conflicting sprint schedules?"
        },
        {
            "id": "tpm_sm2",
            "category": "Technical Program Manager / Scrum Master (Agile processes, cross-functional alignment, timeline risk management)",
            "text": "How do you facilitate a productive sprint retrospective when team morale is low due to missed sprint goals and ongoing production fires?"
        },
        {
            "id": "tpm_sm3",
            "category": "Technical Program Manager / Scrum Master (Agile processes, cross-functional alignment, timeline risk management)",
            "text": "What early warning indicators do you monitor to detect that a multi-quarter infrastructure migration program is slipping behind schedule?"
        },
        {
            "id": "tpm_sm4",
            "category": "Technical Program Manager / Scrum Master (Agile processes, cross-functional alignment, timeline risk management)",
            "text": "How do you coach a team of senior engineers who view agile ceremonies as unnecessary administrative overhead rather than value drivers?"
        },
        {
            "id": "tpm_sm5",
            "category": "Technical Program Manager / Scrum Master (Agile processes, cross-functional alignment, timeline risk management)",
            "text": "How do you manage uncontrolled scope creep during an executive-sponsored program while maintaining positive relationships with product stakeholders?"
        },
        {
            "id": "tpm_sm6",
            "category": "Technical Program Manager / Scrum Master (Agile processes, cross-functional alignment, timeline risk management)",
            "text": "Describe how you establish clear RACI matrices and SLAs across engineering, legal, security, and operations teams for a major platform launch."
        },
        {
            "id": "tpm_sm7",
            "category": "Technical Program Manager / Scrum Master (Agile processes, cross-functional alignment, timeline risk management)",
            "text": "When you realize a mission-critical program deadline will be missed, walk me through your stakeholder escalation and risk mitigation communication plan."
        },
        {
            "id": "tpm_sm8",
            "category": "Technical Program Manager / Scrum Master (Agile processes, cross-functional alignment, timeline risk management)",
            "text": "How do you determine whether an engineering organization should operate on Scrum, Kanban, or a hybrid model based on their operational cadence?"
        },
        {
            "id": "tpm_sm9",
            "category": "Technical Program Manager / Scrum Master (Agile processes, cross-functional alignment, timeline risk management)",
            "text": "How do you ensure technical debt reduction is consistently budgeted alongside feature delivery during quarterly capacity planning?"
        },
        {
            "id": "tpm_sm10",
            "category": "Technical Program Manager / Scrum Master (Agile processes, cross-functional alignment, timeline risk management)",
            "text": "How do you communicate complex architectural roadblocks and mitigation strategies to non-technical executive leadership without getting lost in jargon?"
        },
        {
            "id": "tpm_sm11",
            "category": "Technical Program Manager / Scrum Master (Agile processes, cross-functional alignment, timeline risk management)",
            "text": "How do you resolve interpersonal conflict and philosophical disagreements between a Staff Engineer and an Engineering Manager that threatens sprint delivery?"
        },
        {
            "id": "tpm_sm12",
            "category": "Technical Program Manager / Scrum Master (Agile processes, cross-functional alignment, timeline risk management)",
            "text": "How do you utilize DORA metrics (Deployment Frequency, Lead Time, Change Failure Rate, MTTR) to measure and improve developer productivity responsibly?"
        }
    ],

    "UX/UI Designer & Researcher (Design portfolio review, user testing methodology, design system implementation)": [
        {
            "id": "ux_ui1",
            "category": "UX/UI Designer & Researcher (Design portfolio review, user testing methodology, design system implementation)",
            "text": "Walk me through a case study in your portfolio: what was the core user problem, your research methodology, your design iterations, and the business outcome?"
        },
        {
            "id": "ux_ui2",
            "category": "UX/UI Designer & Researcher (Design portfolio review, user testing methodology, design system implementation)",
            "text": "How do you structure a moderated usability testing session to uncover cognitive friction and drop-off reasons in a complex enterprise workflow?"
        },
        {
            "id": "ux_ui3",
            "category": "UX/UI Designer & Researcher (Design portfolio review, user testing methodology, design system implementation)",
            "text": "Describe how you build, document, and maintain a multi-platform design system in Figma using design tokens to ensure design-to-code parity."
        },
        {
            "id": "ux_ui4",
            "category": "UX/UI Designer & Researcher (Design portfolio review, user testing methodology, design system implementation)",
            "text": "How do you balance business conversion pressure against ethical design standards to avoid dark patterns that erode long-term user trust?"
        },
        {
            "id": "ux_ui5",
            "category": "UX/UI Designer & Researcher (Design portfolio review, user testing methodology, design system implementation)",
            "text": "Compare qualitative user interviews with quantitative product analytics. How do you triangulate both data sources to make confident design decisions?"
        },
        {
            "id": "ux_ui6",
            "category": "UX/UI Designer & Researcher (Design portfolio review, user testing methodology, design system implementation)",
            "text": "How do you design data-dense, analytical dashboards for enterprise desktop users without overwhelming cognitive load?"
        },
        {
            "id": "ux_ui7",
            "category": "UX/UI Designer & Researcher (Design portfolio review, user testing methodology, design system implementation)",
            "text": "How do you collaborate with frontend engineers during component implementation to ensure accessibility, layout responsive behavior, and micro-interactions match specs?"
        },
        {
            "id": "ux_ui8",
            "category": "UX/UI Designer & Researcher (Design portfolio review, user testing methodology, design system implementation)",
            "text": "How do you synthesize conflicting feedback from executive stakeholders, product managers, and end users into a cohesive user journey map?"
        },
        {
            "id": "ux_ui9",
            "category": "UX/UI Designer & Researcher (Design portfolio review, user testing methodology, design system implementation)",
            "text": "What steps do you take to guarantee your digital designs comply with WCAG 2.2 AA accessibility standards for color contrast, target sizing, and typography?"
        },
        {
            "id": "ux_ui10",
            "category": "UX/UI Designer & Researcher (Design portfolio review, user testing methodology, design system implementation)",
            "text": "How do you execute card sorting and tree testing to reorganize a convoluted, multi-level navigation information architecture?"
        },
        {
            "id": "ux_ui11",
            "category": "UX/UI Designer & Researcher (Design portfolio review, user testing methodology, design system implementation)",
            "text": "When do you choose low-fidelity wireframing over rapid high-fidelity interactive prototyping to test hypotheses efficiently?"
        },
        {
            "id": "ux_ui12",
            "category": "UX/UI Designer & Researcher (Design portfolio review, user testing methodology, design system implementation)",
            "text": "How do you measure the qualitative and quantitative impact of a design redesign using standardized metrics like the System Usability Scale (SUS)?"
        }
    ],

    "Management Consultant (Market entry cases, profitability analysis, framework selection, brain teasers)": [
        {
            "id": "mgmt_cons1",
            "category": "Management Consultant (Market entry cases, profitability analysis, framework selection, brain teasers)",
            "text": "A leading European luxury automotive manufacturer wants to enter the Southeast Asian electric vehicle market. How do you structure this market entry case?"
        },
        {
            "id": "mgmt_cons2",
            "category": "Management Consultant (Market entry cases, profitability analysis, framework selection, brain teasers)",
            "text": "A national retail supermarket chain has experienced a 25% drop in operating profit despite steady top-line revenue. Walk me through your profitability diagnosis framework."
        },
        {
            "id": "mgmt_cons3",
            "category": "Management Consultant (Market entry cases, profitability analysis, framework selection, brain teasers)",
            "text": "Estimate the total annual market size (in revenue) for commercial aircraft maintenance, repair, and overhaul (MRO) services in North America."
        },
        {
            "id": "mgmt_cons4",
            "category": "Management Consultant (Market entry cases, profitability analysis, framework selection, brain teasers)",
            "text": "A private equity client is considering acquiring a $5B industrial manufacturing firm. How do you evaluate cost and revenue synergies during commercial due diligence?"
        },
        {
            "id": "mgmt_cons5",
            "category": "Management Consultant (Market entry cases, profitability analysis, framework selection, brain teasers)",
            "text": "Explain how you apply the MECE (Mutually Exclusive, Collectively Exhaustive) principle to break down an unstructured business problem into workstreams."
        },
        {
            "id": "mgmt_cons6",
            "category": "Management Consultant (Market entry cases, profitability analysis, framework selection, brain teasers)",
            "text": "How do you present an executive recommendation to a skeptical C-suite client when your analytical findings contradict their longstanding corporate strategy?"
        },
        {
            "id": "mgmt_cons7",
            "category": "Management Consultant (Market entry cases, profitability analysis, framework selection, brain teasers)",
            "text": "A major logistics provider is suffering from delivery bottlenecks. How do you use value stream mapping and cost-curve analysis to optimize operational throughput?"
        },
        {
            "id": "mgmt_cons8",
            "category": "Management Consultant (Market entry cases, profitability analysis, framework selection, brain teasers)",
            "text": "Develop a comprehensive turnaround and retention strategy for a legacy print-and-digital media conglomerate facing accelerating subscriber churn."
        },
        {
            "id": "mgmt_cons9",
            "category": "Management Consultant (Market entry cases, profitability analysis, framework selection, brain teasers)",
            "text": "How do you evaluate competitive dynamics and barrier-to-entry moats in a commoditized industry using Porter's Five Forces?"
        },
        {
            "id": "mgmt_cons10",
            "category": "Management Consultant (Market entry cases, profitability analysis, framework selection, brain teasers)",
            "text": "A biotech startup has developed a breakthrough orphan drug. How do you determine the optimal pricing model considering R&D recovery, insurer willingness-to-pay, and public policy?"
        },
        {
            "id": "mgmt_cons11",
            "category": "Management Consultant (Market entry cases, profitability analysis, framework selection, brain teasers)",
            "text": "Brain teaser: You have 8 identical-looking balls, one of which is slightly heavier than the others. You have a balance scale. How do you identify the heavy ball in exactly 2 weighings?"
        },
        {
            "id": "mgmt_cons12",
            "category": "Management Consultant (Market entry cases, profitability analysis, framework selection, brain teasers)",
            "text": "How do you synthesize a 100-slide analytical engagement into a crisp, three-minute executive pyramid-principle takeaway for a busy Board of Directors?"
        }
    ],

    "Investment Banking Analyst / Associate (DCF valuation, financial statement modeling, M&A mechanics)": [
        {
            "id": "ib_fin1",
            "category": "Investment Banking Analyst / Associate (DCF valuation, financial statement modeling, M&A mechanics)",
            "text": "Walk me through a Discounted Cash Flow (DCF) model from revenue projections to Unlevered Free Cash Flow, Terminal Value, and Enterprise Value."
        },
        {
            "id": "ib_fin2",
            "category": "Investment Banking Analyst / Associate (DCF valuation, financial statement modeling, M&A mechanics)",
            "text": "How does a $10 depreciation expense increase flow through the Income Statement, Cash Flow Statement, and Balance Sheet (assuming a 20% tax rate)?"
        },
        {
            "id": "ib_fin3",
            "category": "Investment Banking Analyst / Associate (DCF valuation, financial statement modeling, M&A mechanics)",
            "text": "Compare DCF, Comparable Company Analysis, and Precedent Transactions valuation methodologies. Which typically yields the highest valuation and why?"
        },
        {
            "id": "ib_fin4",
            "category": "Investment Banking Analyst / Associate (DCF valuation, financial statement modeling, M&A mechanics)",
            "text": "Explain the mechanics of calculating accretion or dilution in an M&A transaction when financing with 100% stock versus 100% cash."
        },
        {
            "id": "ib_fin5",
            "category": "Investment Banking Analyst / Associate (DCF valuation, financial statement modeling, M&A mechanics)",
            "text": "How do you calculate Weighted Average Cost of Capital (WACC), and how do you estimate the Cost of Equity using the Capital Asset Pricing Model (CAPM)?"
        },
        {
            "id": "ib_fin6",
            "category": "Investment Banking Analyst / Associate (DCF valuation, financial statement modeling, M&A mechanics)",
            "text": "Walk me through the core mechanics of a Leveraged Buyout (LBO) model, and what primary drivers (debt paydown, EBITDA expansion, multiple arbitrage) maximize IRR?"
        },
        {
            "id": "ib_fin7",
            "category": "Investment Banking Analyst / Associate (DCF valuation, financial statement modeling, M&A mechanics)",
            "text": "How do you bridge Enterprise Value to Equity Value? What adjustments are made for non-operating assets, minority interest, and preferred stock?"
        },
        {
            "id": "ib_fin8",
            "category": "Investment Banking Analyst / Associate (DCF valuation, financial statement modeling, M&A mechanics)",
            "text": "How do working capital peg negotiations impact final purchase price adjustments between buyer and seller at M&A deal closing?"
        },
        {
            "id": "ib_fin9",
            "category": "Investment Banking Analyst / Associate (DCF valuation, financial statement modeling, M&A mechanics)",
            "text": "How do you assess debt capacity and maximum leverage ratios (Total Debt/EBITDA, Interest Coverage) for a company issuing high-yield bonds?"
        },
        {
            "id": "ib_fin10",
            "category": "Investment Banking Analyst / Associate (DCF valuation, financial statement modeling, M&A mechanics)",
            "text": "How do you value an early-stage high-growth technology company that has negative EBITDA and negative Net Income?"
        },
        {
            "id": "ib_fin11",
            "category": "Investment Banking Analyst / Associate (DCF valuation, financial statement modeling, M&A mechanics)",
            "text": "Describe your process for structuring an M&A pitch book under an aggressive 24-hour turnaround deadline without introducing quantitative errors."
        },
        {
            "id": "ib_fin12",
            "category": "Investment Banking Analyst / Associate (DCF valuation, financial statement modeling, M&A mechanics)",
            "text": "What criteria and valuation analyses are incorporated into a Fairness Opinion provided to a corporate board during a contested takeover battle?"
        }
    ],

    "Financial Analyst / Accountant (Budget forecasting, variance analysis, compliance regulations)": [
        {
            "id": "fa_acc1",
            "category": "Financial Analyst / Accountant (Budget forecasting, variance analysis, compliance regulations)",
            "text": "How do you conduct monthly budget versus actual variance analysis, and how do you differentiate volume variance from price variance?"
        },
        {
            "id": "fa_acc2",
            "category": "Financial Analyst / Accountant (Budget forecasting, variance analysis, compliance regulations)",
            "text": "Explain the revenue recognition criteria under ASC 606 / IFRS 15 for a SaaS company delivering software licenses, cloud hosting, and professional services."
        },
        {
            "id": "fa_acc3",
            "category": "Financial Analyst / Accountant (Budget forecasting, variance analysis, compliance regulations)",
            "text": "How do you construct a rolling 12-month operational cash flow forecast that accounts for seasonality and working capital fluctuations?"
        },
        {
            "id": "fa_acc4",
            "category": "Financial Analyst / Accountant (Budget forecasting, variance analysis, compliance regulations)",
            "text": "Explain the balance sheet and income statement accounting treatment for operating leases versus finance leases under ASC 842 / IFRS 16."
        },
        {
            "id": "fa_acc5",
            "category": "Financial Analyst / Accountant (Budget forecasting, variance analysis, compliance regulations)",
            "text": "How do you prepare an organization for an external financial audit, and what internal control testing under Sarbanes-Oxley (SOX) Section 404 is most critical?"
        },
        {
            "id": "fa_acc6",
            "category": "Financial Analyst / Accountant (Budget forecasting, variance analysis, compliance regulations)",
            "text": "How do you resolve and reconcile complex multi-currency intercompany account discrepancies during month-end global consolidation?"
        },
        {
            "id": "fa_acc7",
            "category": "Financial Analyst / Accountant (Budget forecasting, variance analysis, compliance regulations)",
            "text": "Compare the financial reporting impacts of FIFO versus LIFO inventory valuation during sustained macroeconomic inflationary periods."
        },
        {
            "id": "fa_acc8",
            "category": "Financial Analyst / Accountant (Budget forecasting, variance analysis, compliance regulations)",
            "text": "How do you model sensitivity and scenario analyses for an executive capital expenditure committee evaluating a $15M equipment investment?"
        },
        {
            "id": "fa_acc9",
            "category": "Financial Analyst / Accountant (Budget forecasting, variance analysis, compliance regulations)",
            "text": "How do you calculate and monitor loan covenant ratios (e.g. Debt Service Coverage Ratio) to ensure your company avoids technical default?"
        },
        {
            "id": "fa_acc10",
            "category": "Financial Analyst / Accountant (Budget forecasting, variance analysis, compliance regulations)",
            "text": "How do you explain complex financial reports (e.g. EBITDA adjustments and gross margins) to non-financial operational managers?"
        },
        {
            "id": "fa_acc11",
            "category": "Financial Analyst / Accountant (Budget forecasting, variance analysis, compliance regulations)",
            "text": "What red flags and forensic accounting indicators do you look for when reviewing expense reports and vendor disbursements to prevent fraudulent activity?"
        },
        {
            "id": "fa_acc12",
            "category": "Financial Analyst / Accountant (Budget forecasting, variance analysis, compliance regulations)",
            "text": "How do you establish standard costing methodologies and analyze manufacturing overhead allocation variances in production environments?"
        }
    ],

    "Business Analyst / BI Developer (SQL proficiency, dashboard design, stakeholder requirement gathering)": [
        {
            "id": "ba_bi1",
            "category": "Business Analyst / BI Developer (SQL proficiency, dashboard design, stakeholder requirement gathering)",
            "text": "Write a mental SQL query using window functions (e.g. ROW_NUMBER or LAG) to calculate month-over-month user retention rates by acquisition cohort."
        },
        {
            "id": "ba_bi2",
            "category": "Business Analyst / BI Developer (SQL proficiency, dashboard design, stakeholder requirement gathering)",
            "text": "How do you translate a vague executive request like 'we need to improve customer churn' into concrete data requirements and analytical models?"
        },
        {
            "id": "ba_bi3",
            "category": "Business Analyst / BI Developer (SQL proficiency, dashboard design, stakeholder requirement gathering)",
            "text": "What design principles do you follow in Tableau or Power BI to build executive dashboards that communicate actionable insights within 5 seconds?"
        },
        {
            "id": "ba_bi4",
            "category": "Business Analyst / BI Developer (SQL proficiency, dashboard design, stakeholder requirement gathering)",
            "text": "How do you investigate and reconcile conflicting metric definitions when sales CRM data shows 1,200 closed deals but the finance ERP records 1,050 invoices?"
        },
        {
            "id": "ba_bi5",
            "category": "Business Analyst / BI Developer (SQL proficiency, dashboard design, stakeholder requirement gathering)",
            "text": "Explain how you design a dimensional data model (facts and dimensions) to support flexible, high-speed ad-hoc reporting for marketing analysts."
        },
        {
            "id": "ba_bi6",
            "category": "Business Analyst / BI Developer (SQL proficiency, dashboard design, stakeholder requirement gathering)",
            "text": "How do you conduct GAP analysis between an organization's legacy business processes and a proposed enterprise software integration?"
        },
        {
            "id": "ba_bi7",
            "category": "Business Analyst / BI Developer (SQL proficiency, dashboard design, stakeholder requirement gathering)",
            "text": "What techniques do you use to optimize slow-running SQL queries involving multiple subqueries, aggregations, and Cartesian joins?"
        },
        {
            "id": "ba_bi8",
            "category": "Business Analyst / BI Developer (SQL proficiency, dashboard design, stakeholder requirement gathering)",
            "text": "How do you map and document business workflows using BPMN (Business Process Model and Notation) to identify operational bottlenecks?"
        },
        {
            "id": "ba_bi9",
            "category": "Business Analyst / BI Developer (SQL proficiency, dashboard design, stakeholder requirement gathering)",
            "text": "How do you calculate customer acquisition cost (CAC) and customer lifetime value (LTV) when attribution data across marketing channels is fragmented?"
        },
        {
            "id": "ba_bi10",
            "category": "Business Analyst / BI Developer (SQL proficiency, dashboard design, stakeholder requirement gathering)",
            "text": "How do you manage stakeholder scope creep when business leaders continually add requirements to a dashboard that is ready for deployment?"
        },
        {
            "id": "ba_bi11",
            "category": "Business Analyst / BI Developer (SQL proficiency, dashboard design, stakeholder requirement gathering)",
            "text": "Describe your strategy for automating manual recurring spreadsheet reports using scheduled SQL pipelines and BI semantic models."
        },
        {
            "id": "ba_bi12",
            "category": "Business Analyst / BI Developer (SQL proficiency, dashboard design, stakeholder requirement gathering)",
            "text": "How do you leverage data storytelling to present analytical findings to non-technical stakeholders to drive organizational change?"
        }
    ],

    "Corporate Strategy / Operations Manager (Supply chain optimization, unit economics, process mapping)": [
        {
            "id": "strat_ops1",
            "category": "Corporate Strategy / Operations Manager (Supply chain optimization, unit economics, process mapping)",
            "text": "How do you evaluate unit economics (CAC, LTV, gross margin, payback period) to decide whether an unprofitable high-growth product line should be scaled or sunset?"
        },
        {
            "id": "strat_ops2",
            "category": "Corporate Strategy / Operations Manager (Supply chain optimization, unit economics, process mapping)",
            "text": "How do you map an end-to-end global supply chain to eliminate fulfillment bottlenecks and reduce lead times by 30% during geopolitical instability?"
        },
        {
            "id": "strat_ops3",
            "category": "Corporate Strategy / Operations Manager (Supply chain optimization, unit economics, process mapping)",
            "text": "Walk me through how you structure a build-versus-buy-versus-partner strategic decision when expanding into a new international market."
        },
        {
            "id": "strat_ops4",
            "category": "Corporate Strategy / Operations Manager (Supply chain optimization, unit economics, process mapping)",
            "text": "How do you apply Lean and Six Sigma principles to remove waste and error rates in a fast-paced warehousing or logistics fulfillment network?"
        },
        {
            "id": "strat_ops5",
            "category": "Corporate Strategy / Operations Manager (Supply chain optimization, unit economics, process mapping)",
            "text": "Compare Just-In-Time (JIT) inventory management with safety-stock buffering under conditions of severe upstream supply chain volatility."
        },
        {
            "id": "strat_ops6",
            "category": "Corporate Strategy / Operations Manager (Supply chain optimization, unit economics, process mapping)",
            "text": "How do you manage post-merger integration (PMI) across two competing operational departments without disrupting customer delivery or damaging culture?"
        },
        {
            "id": "strat_ops7",
            "category": "Corporate Strategy / Operations Manager (Supply chain optimization, unit economics, process mapping)",
            "text": "How do you design and cascade OKRs (Objectives and Key Results) across business units to ensure alignment with a 3-year strategic growth plan?"
        },
        {
            "id": "strat_ops8",
            "category": "Corporate Strategy / Operations Manager (Supply chain optimization, unit economics, process mapping)",
            "text": "Describe your framework for rationalizing vendor procurement contracts to realize 15% operating cost savings across an enterprise."
        },
        {
            "id": "strat_ops9",
            "category": "Corporate Strategy / Operations Manager (Supply chain optimization, unit economics, process mapping)",
            "text": "How do you lead change management when front-line employees and middle managers aggressively resist the rollout of automated workflow software?"
        },
        {
            "id": "strat_ops10",
            "category": "Corporate Strategy / Operations Manager (Supply chain optimization, unit economics, process mapping)",
            "text": "How do you evaluate the strategic threat of a disruptive direct-to-consumer (D2C) competitor entering your B2B distribution channels?"
        },
        {
            "id": "strat_ops11",
            "category": "Corporate Strategy / Operations Manager (Supply chain optimization, unit economics, process mapping)",
            "text": "How do you conduct capacity planning and capital expenditure modeling for a factory expansion under uncertain future consumer demand?"
        },
        {
            "id": "strat_ops12",
            "category": "Corporate Strategy / Operations Manager (Supply chain optimization, unit economics, process mapping)",
            "text": "When margins compress due to rising input costs, how do you determine which operating expenses to cut without impairing core customer satisfaction?"
        }
    ],

    "Enterprise Account Executive (B2B sales strategy, objection handling, live deal closing roleplay)": [
        {
            "id": "eae_sales1",
            "category": "Enterprise Account Executive (B2B sales strategy, objection handling, live deal closing roleplay)",
            "text": "How do you navigate a complex 9-month enterprise sales cycle involving eight distinct stakeholders, including procurement, security, legal, and the C-suite?"
        },
        {
            "id": "eae_sales2",
            "category": "Enterprise Account Executive (B2B sales strategy, objection handling, live deal closing roleplay)",
            "text": "Roleplay: Handle this objection from a prospect's VP: 'Your competitor is 40% cheaper and their sales team claims they have all the exact same core features.'"
        },
        {
            "id": "eae_sales3",
            "category": "Enterprise Account Executive (B2B sales strategy, objection handling, live deal closing roleplay)",
            "text": "How do you conduct deep discovery with a skeptical Chief Information Security Officer (CISO) to uncover urgent latent risks rather than pitching features?"
        },
        {
            "id": "eae_sales4",
            "category": "Enterprise Account Executive (B2B sales strategy, objection handling, live deal closing roleplay)",
            "text": "Explain how you use the MEDDPICC qualification framework to assess deal health and prevent forecasted enterprise deals from slipping quarters."
        },
        {
            "id": "eae_sales5",
            "category": "Enterprise Account Executive (B2B sales strategy, objection handling, live deal closing roleplay)",
            "text": "What do you do when your primary internal champion abruptly leaves the target company 3 weeks before contract signature?"
        },
        {
            "id": "eae_sales6",
            "category": "Enterprise Account Executive (B2B sales strategy, objection handling, live deal closing roleplay)",
            "text": "Roleplay: The prospect's procurement director says: 'We love the solution, but we only have budget if you give us an immediate 30% discount today.' How do you respond?"
        },
        {
            "id": "eae_sales7",
            "category": "Enterprise Account Executive (B2B sales strategy, objection handling, live deal closing roleplay)",
            "text": "How do you collaborate with Solutions Engineers and Customer Success during a competitive Proof of Concept (POC) to ensure win criteria are locked in?"
        },
        {
            "id": "eae_sales8",
            "category": "Enterprise Account Executive (B2B sales strategy, objection handling, live deal closing roleplay)",
            "text": "How do you execute a land-and-expand strategy to turn an initial $50k departmental deal into a multi-million-dollar enterprise-wide rollout?"
        },
        {
            "id": "eae_sales9",
            "category": "Enterprise Account Executive (B2B sales strategy, objection handling, live deal closing roleplay)",
            "text": "How do you present a compelling business case and quantifiable ROI justification directly to a skeptical Chief Financial Officer (CFO)?"
        },
        {
            "id": "eae_sales10",
            "category": "Enterprise Account Executive (B2B sales strategy, objection handling, live deal closing roleplay)",
            "text": "What is your strategy for multi-threading an enterprise deal so you are never vulnerable to single-point-of-contact risk?"
        },
        {
            "id": "eae_sales11",
            "category": "Enterprise Account Executive (B2B sales strategy, objection handling, live deal closing roleplay)",
            "text": "How do you maintain pipeline hygiene and forecast accuracy when operating under aggressive quarterly quota targets?"
        },
        {
            "id": "eae_sales12",
            "category": "Enterprise Account Executive (B2B sales strategy, objection handling, live deal closing roleplay)",
            "text": "Tell me about the largest or most complex enterprise deal you have ever closed. Walk me through the qualification, hurdles, and final closing mechanics."
        }
    ],

    "Business Development Representative (BDR/SDR) (Live cold calling, lead qualification, value proposition delivery)": [
        {
            "id": "bdr_sdr1",
            "category": "Business Development Representative (BDR/SDR) (Live cold calling, lead qualification, value proposition delivery)",
            "text": "Live cold call roleplay: You reach a busy VP who answers: 'I'm stepping into a meeting right now, just send me an email.' What do you say in the next 30 seconds?"
        },
        {
            "id": "bdr_sdr2",
            "category": "Business Development Representative (BDR/SDR) (Live cold calling, lead qualification, value proposition delivery)",
            "text": "How do you craft an outbound email cadence (subject line, hook, value proposition, call-to-action) that generates high reply rates from executive buyers?"
        },
        {
            "id": "bdr_sdr3",
            "category": "Business Development Representative (BDR/SDR) (Live cold calling, lead qualification, value proposition delivery)",
            "text": "How do you qualify inbound marketing leads within a 5-minute discovery call using BANT or MEDDIC principles to ensure Account Executive time isn't wasted?"
        },
        {
            "id": "bdr_sdr4",
            "category": "Business Development Representative (BDR/SDR) (Live cold calling, lead qualification, value proposition delivery)",
            "text": "Roleplay: Handle this common prospect objection: 'We already have a vendor in place for that and we have no interest in changing.'"
        },
        {
            "id": "bdr_sdr5",
            "category": "Business Development Representative (BDR/SDR) (Live cold calling, lead qualification, value proposition delivery)",
            "text": "How do you research a high-priority target enterprise account before outreach to identify specific triggering events and tailored pain points?"
        },
        {
            "id": "bdr_sdr6",
            "category": "Business Development Representative (BDR/SDR) (Live cold calling, lead qualification, value proposition delivery)",
            "text": "How do you maintain high energy and outbound activity volume (calls, emails, LinkedIn) after experiencing 30 consecutive rejections or hang-ups in a day?"
        },
        {
            "id": "bdr_sdr7",
            "category": "Business Development Representative (BDR/SDR) (Live cold calling, lead qualification, value proposition delivery)",
            "text": "How do you tailor your 30-second elevator pitch when speaking to a Head of Engineering versus a Head of Finance versus a Head of Marketing?"
        },
        {
            "id": "bdr_sdr8",
            "category": "Business Development Representative (BDR/SDR) (Live cold calling, lead qualification, value proposition delivery)",
            "text": "What is your strategy for re-engaging promising prospects who attended an initial demo call but subsequently stopped responding to emails?"
        },
        {
            "id": "bdr_sdr9",
            "category": "Business Development Representative (BDR/SDR) (Live cold calling, lead qualification, value proposition delivery)",
            "text": "How do you leverage social selling on LinkedIn to engage senior decision-makers before picking up the phone to cold call them?"
        },
        {
            "id": "bdr_sdr10",
            "category": "Business Development Representative (BDR/SDR) (Live cold calling, lead qualification, value proposition delivery)",
            "text": "How do you coordinate with your assigned Account Executives to ensure smooth handoffs of booked meetings and alignment on target account lists?"
        },
        {
            "id": "bdr_sdr11",
            "category": "Business Development Representative (BDR/SDR) (Live cold calling, lead qualification, value proposition delivery)",
            "text": "How do you run A/B tests on your outreach messaging to systematically optimize response rates and meeting conversion ratios?"
        },
        {
            "id": "bdr_sdr12",
            "category": "Business Development Representative (BDR/SDR) (Live cold calling, lead qualification, value proposition delivery)",
            "text": "What daily habits, time-blocking strategies, and pipeline tracking tools do you use to consistently exceed monthly quota targets?"
        }
    ],

    "Digital Marketing Specialist / Growth Marketer (Customer acquisition cost optimization, A/B test design, campaign ROI)": [
        {
            "id": "mkt_growth1",
            "category": "Digital Marketing Specialist / Growth Marketer (Customer acquisition cost optimization, A/B test design, campaign ROI)",
            "text": "How do you allocate a $150,000 monthly paid performance budget across Google Search, Meta, and LinkedIn Ads to optimize blended Customer Acquisition Cost (CAC)?"
        },
        {
            "id": "mkt_growth2",
            "category": "Digital Marketing Specialist / Growth Marketer (Customer acquisition cost optimization, A/B test design, campaign ROI)",
            "text": "Walk me through how you design an A/B landing page experiment, including hypothesis formulation, sample size calculation, and statistical significance testing."
        },
        {
            "id": "mkt_growth3",
            "category": "Digital Marketing Specialist / Growth Marketer (Customer acquisition cost optimization, A/B test design, campaign ROI)",
            "text": "How do you navigate privacy tracking restrictions (e.g. Apple iOS ATT, cookieless tracking) using server-side conversions and multi-touch attribution modeling?"
        },
        {
            "id": "mkt_growth4",
            "category": "Digital Marketing Specialist / Growth Marketer (Customer acquisition cost optimization, A/B test design, campaign ROI)",
            "text": "How do you diagnose and fix a sudden 40% decline in organic search traffic following a major Google core search algorithm update?"
        },
        {
            "id": "mkt_growth5",
            "category": "Digital Marketing Specialist / Growth Marketer (Customer acquisition cost optimization, A/B test design, campaign ROI)",
            "text": "How do you build full-funnel email lifecycle marketing automation sequences to turn free-trial signups into paying subscribers?"
        },
        {
            "id": "mkt_growth6",
            "category": "Digital Marketing Specialist / Growth Marketer (Customer acquisition cost optimization, A/B test design, campaign ROI)",
            "text": "Explain how you calculate and monitor Return on Ad Spend (ROAS) and payback period to ensure advertising campaigns scale profitably."
        },
        {
            "id": "mkt_growth7",
            "category": "Digital Marketing Specialist / Growth Marketer (Customer acquisition cost optimization, A/B test design, campaign ROI)",
            "text": "What retargeting strategies and audience segmentation rules do you configure to re-engage high-intent abandoned carts without causing ad fatigue?"
        },
        {
            "id": "mkt_growth8",
            "category": "Digital Marketing Specialist / Growth Marketer (Customer acquisition cost optimization, A/B test design, campaign ROI)",
            "text": "How do you identify, test, and scale viral referral loops within a product to drive exponential organic growth?"
        },
        {
            "id": "mkt_growth9",
            "category": "Digital Marketing Specialist / Growth Marketer (Customer acquisition cost optimization, A/B test design, campaign ROI)",
            "text": "How do you conduct competitor keyword gap analysis and intent mapping to build an SEO content cluster that drives commercial leads?"
        },
        {
            "id": "mkt_growth10",
            "category": "Digital Marketing Specialist / Growth Marketer (Customer acquisition cost optimization, A/B test design, campaign ROI)",
            "text": "How do you audit and configure Google Tag Manager to ensure accurate conversion tracking across complex single-page web applications?"
        },
        {
            "id": "mkt_growth11",
            "category": "Digital Marketing Specialist / Growth Marketer (Customer acquisition cost optimization, A/B test design, campaign ROI)",
            "text": "What indicators alert you that a paid marketing channel has hit diminishing marginal returns, and how do you unlock new scalable growth channels?"
        },
        {
            "id": "mkt_growth12",
            "category": "Digital Marketing Specialist / Growth Marketer (Customer acquisition cost optimization, A/B test design, campaign ROI)",
            "text": "How do you report complex digital marketing performance metrics to an executive board focusing on pipeline generation, revenue influence, and LTV:CAC?"
        }
    ],

    "Content Strategist / Copywriter (Brand voice alignment, content distribution strategy, copywriting exercise)": [
        {
            "id": "content_copy1",
            "category": "Content Strategist / Copywriter (Brand voice alignment, content distribution strategy, copywriting exercise)",
            "text": "Live copywriting exercise: Take a dry, feature-heavy technical description ('Our platform offers automated cloud storage synchronization') and rewrite it into three distinct high-converting headlines."
        },
        {
            "id": "content_copy2",
            "category": "Content Strategist / Copywriter (Brand voice alignment, content distribution strategy, copywriting exercise)",
            "text": "How do you establish, document, and enforce a company-wide Brand Voice and Style Guide across product, marketing, and customer support teams?"
        },
        {
            "id": "content_copy3",
            "category": "Content Strategist / Copywriter (Brand voice alignment, content distribution strategy, copywriting exercise)",
            "text": "How do you conduct a content audit of 300 existing blog posts to identify pruning, consolidation, and refresh opportunities to maximize search rankings?"
        },
        {
            "id": "content_copy4",
            "category": "Content Strategist / Copywriter (Brand voice alignment, content distribution strategy, copywriting exercise)",
            "text": "Explain how you repurpose a single 2,500-word research whitepaper into a multi-channel distribution campaign across newsletters, social threads, and video scripts."
        },
        {
            "id": "content_copy5",
            "category": "Content Strategist / Copywriter (Brand voice alignment, content distribution strategy, copywriting exercise)",
            "text": "How do you balance creative, human-centric brand storytelling with the technical constraints of search engine optimization (SEO) and keyword intent?"
        },
        {
            "id": "content_copy6",
            "category": "Content Strategist / Copywriter (Brand voice alignment, content distribution strategy, copywriting exercise)",
            "text": "How do you manage feedback from executive stakeholders who want to insert corporate buzzwords that weaken the clarity and punchiness of your copy?"
        },
        {
            "id": "content_copy7",
            "category": "Content Strategist / Copywriter (Brand voice alignment, content distribution strategy, copywriting exercise)",
            "text": "How do you write high-converting B2B email drip nurture sequences that educate prospects without sounding pushy or promotional?"
        },
        {
            "id": "content_copy8",
            "category": "Content Strategist / Copywriter (Brand voice alignment, content distribution strategy, copywriting exercise)",
            "text": "What metrics and attribution frameworks do you track to prove that content strategy drives pipeline and revenue beyond top-of-funnel pageviews?"
        },
        {
            "id": "content_copy9",
            "category": "Content Strategist / Copywriter (Brand voice alignment, content distribution strategy, copywriting exercise)",
            "text": "How do you craft compelling customer case studies that highlight quantifiable business outcomes rather than generic praise?"
        },
        {
            "id": "content_copy10",
            "category": "Content Strategist / Copywriter (Brand voice alignment, content distribution strategy, copywriting exercise)",
            "text": "Describe your process for managing an editorial calendar with multiple freelance writers to guarantee voice consistency and deadline adherence."
        },
        {
            "id": "content_copy11",
            "category": "Content Strategist / Copywriter (Brand voice alignment, content distribution strategy, copywriting exercise)",
            "text": "How do you write clear, empathetic microcopy (UX writing) for error states, empty states, and onboarding flows that reduces user abandonment?"
        },
        {
            "id": "content_copy12",
            "category": "Content Strategist / Copywriter (Brand voice alignment, content distribution strategy, copywriting exercise)",
            "text": "How do you integrate generative AI tools into your content creation workflow while preserving authentic brand personality, editorial standards, and originality?"
        }
    ],

    "PR & Communications Manager (Crisis management roleplays, media statement drafting, brand reputation)": [
        {
            "id": "pr_comm1",
            "category": "PR & Communications Manager (Crisis management roleplays, media statement drafting, brand reputation)",
            "text": "Live crisis roleplay: Your company suffered a major data breach affecting 500,000 customers 2 hours ago. Walk me through your immediate crisis communication playbook."
        },
        {
            "id": "pr_comm2",
            "category": "PR & Communications Manager (Crisis management roleplays, media statement drafting, brand reputation)",
            "text": "Draft a public holding statement on behalf of the CEO that balances legal liability protection with genuine transparency and customer empathy."
        },
        {
            "id": "pr_comm3",
            "category": "PR & Communications Manager (Crisis management roleplays, media statement drafting, brand reputation)",
            "text": "How do you pitch a non-breaking company milestone or product announcement to top-tier business journalists (e.g. WSJ, Bloomberg) to secure earned coverage?"
        },
        {
            "id": "pr_comm4",
            "category": "PR & Communications Manager (Crisis management roleplays, media statement drafting, brand reputation)",
            "text": "How do you media-train a nervous or overly technical executive ahead of a live broadcast television interview where hostile questions are expected?"
        },
        {
            "id": "pr_comm5",
            "category": "PR & Communications Manager (Crisis management roleplays, media statement drafting, brand reputation)",
            "text": "How do you manage internal employee communications during an unexpected 15% workforce reduction to maintain trust and prevent negative leaks?"
        },
        {
            "id": "pr_comm6",
            "category": "PR & Communications Manager (Crisis management roleplays, media statement drafting, brand reputation)",
            "text": "What steps do you take to rebuild brand reputation and public trust over a 12-month period following a highly publicized executive scandal?"
        },
        {
            "id": "pr_comm7",
            "category": "PR & Communications Manager (Crisis management roleplays, media statement drafting, brand reputation)",
            "text": "How do you navigate news embargoes, media exclusives, and background briefings when planning a high-stakes corporate product unveiling?"
        },
        {
            "id": "pr_comm8",
            "category": "PR & Communications Manager (Crisis management roleplays, media statement drafting, brand reputation)",
            "text": "How do you align communication messaging across legal counsel, investor relations, human resources, and marketing during sensitive regulatory inquiries?"
        },
        {
            "id": "pr_comm9",
            "category": "PR & Communications Manager (Crisis management roleplays, media statement drafting, brand reputation)",
            "text": "How do you measure the tangible impact of public relations campaigns beyond outdated metrics like Advertising Value Equivalency (AVE)?"
        },
        {
            "id": "pr_comm10",
            "category": "PR & Communications Manager (Crisis management roleplays, media statement drafting, brand reputation)",
            "text": "What makes a press release compelling to modern journalists who receive hundreds of pitch emails daily?"
        },
        {
            "id": "pr_comm11",
            "category": "PR & Communications Manager (Crisis management roleplays, media statement drafting, brand reputation)",
            "text": "How do you organize and execute a flawless virtual or in-person press conference with international reporters under tight turnaround times?"
        },
        {
            "id": "pr_comm12",
            "category": "PR & Communications Manager (Crisis management roleplays, media statement drafting, brand reputation)",
            "text": "How do you proactively monitor social media sentiment and digital news channels to intercept brand reputation threats before they escalate into crises?"
        }
    ],

    "Human Resources Business Partner (HRBP) (Employee relations, performance management, conflict mediation)": [
        {
            "id": "hrbp_people1",
            "category": "Human Resources Business Partner (HRBP) (Employee relations, performance management, conflict mediation)",
            "text": "How do you mediate a toxic interpersonal conflict between a top-performing individual contributor and their direct engineering manager?"
        },
        {
            "id": "hrbp_people2",
            "category": "Human Resources Business Partner (HRBP) (Employee relations, performance management, conflict mediation)",
            "text": "Coach a manager through placing a struggling employee on a Performance Improvement Plan (PIP) to ensure it is actionable, fair, and legally compliant."
        },
        {
            "id": "hrbp_people3",
            "category": "Human Resources Business Partner (HRBP) (Employee relations, performance management, conflict mediation)",
            "text": "How do you advise leadership during a sensitive departmental restructuring and redundancy process while safeguarding team morale and culture?"
        },
        {
            "id": "hrbp_people4",
            "category": "Human Resources Business Partner (HRBP) (Employee relations, performance management, conflict mediation)",
            "text": "Walk me through how you conduct an impartial, confidential investigation into an anonymous complaint regarding workplace harassment or retaliation."
        },
        {
            "id": "hrbp_people5",
            "category": "Human Resources Business Partner (HRBP) (Employee relations, performance management, conflict mediation)",
            "text": "How do you partner with business unit leaders during annual talent reviews and 9-box grid calibration to identify succession candidates?"
        },
        {
            "id": "hrbp_people6",
            "category": "Human Resources Business Partner (HRBP) (Employee relations, performance management, conflict mediation)",
            "text": "What steps do you take when an internal compensation audit reveals systemic pay discrepancies across gender or tenure in a key department?"
        },
        {
            "id": "hrbp_people7",
            "category": "Human Resources Business Partner (HRBP) (Employee relations, performance management, conflict mediation)",
            "text": "How do you design and implement hybrid workplace policies that balance employee flexibility requests with executive mandates for collaboration?"
        },
        {
            "id": "hrbp_people8",
            "category": "Human Resources Business Partner (HRBP) (Employee relations, performance management, conflict mediation)",
            "text": "How do you formulate retention and career development programs when your company's highest performers are being aggressively recruited by competitors?"
        },
        {
            "id": "hrbp_people9",
            "category": "Human Resources Business Partner (HRBP) (Employee relations, performance management, conflict mediation)",
            "text": "How do you coach newly promoted first-time managers on conducting difficult feedback conversations and avoiding common management pitfalls?"
        },
        {
            "id": "hrbp_people10",
            "category": "Human Resources Business Partner (HRBP) (Employee relations, performance management, conflict mediation)",
            "text": "How do you analyze biannual employee engagement survey results to extract actionable insights rather than generic survey fatigue?"
        },
        {
            "id": "hrbp_people11",
            "category": "Human Resources Business Partner (HRBP) (Employee relations, performance management, conflict mediation)",
            "text": "What steps do you take to guarantee employment law compliance, severance equity, and risk mitigation during involuntary termination meetings?"
        },
        {
            "id": "hrbp_people12",
            "category": "Human Resources Business Partner (HRBP) (Employee relations, performance management, conflict mediation)",
            "text": "How do you embed Diversity, Equity, and Inclusion (DEI) principles into promotion review boards and performance appraisal processes?"
        }
    ],

    "Technical Recruiter / Talent Acquisition Specialist (Sourcing strategy, candidate assessment, hiring manager alignment)": [
        {
            "id": "tech_rec1",
            "category": "Technical Recruiter / Talent Acquisition Specialist (Sourcing strategy, candidate assessment, hiring manager alignment)",
            "text": "How do you source highly competitive passive engineering talent (e.g. Staff Distributed Systems Engineers) using advanced Boolean search, GitHub, and outreach?"
        },
        {
            "id": "tech_rec2",
            "category": "Technical Recruiter / Talent Acquisition Specialist (Sourcing strategy, candidate assessment, hiring manager alignment)",
            "text": "How do you manage an unrealistic hiring manager whose job description demands a 'unicorn' candidate that does not exist in the current market?"
        },
        {
            "id": "tech_rec3",
            "category": "Technical Recruiter / Talent Acquisition Specialist (Sourcing strategy, candidate assessment, hiring manager alignment)",
            "text": "Roleplay: How do you close a top engineering candidate who has received three competing offers with higher cash compensation than your company's band?"
        },
        {
            "id": "tech_rec4",
            "category": "Technical Recruiter / Talent Acquisition Specialist (Sourcing strategy, candidate assessment, hiring manager alignment)",
            "text": "How do you structure a 30-minute initial phone screen to accurately evaluate technical competencies, communication skills, and motivation without wasting time?"
        },
        {
            "id": "tech_rec5",
            "category": "Technical Recruiter / Talent Acquisition Specialist (Sourcing strategy, candidate assessment, hiring manager alignment)",
            "text": "What interventions do you make when a critical role has been open for 75 days and candidates are consistently dropping out at the on-site interview stage?"
        },
        {
            "id": "tech_rec6",
            "category": "Technical Recruiter / Talent Acquisition Specialist (Sourcing strategy, candidate assessment, hiring manager alignment)",
            "text": "How do you build a genuinely diverse and inclusive candidate pipeline for executive technical leadership roles?"
        },
        {
            "id": "tech_rec7",
            "category": "Technical Recruiter / Talent Acquisition Specialist (Sourcing strategy, candidate assessment, hiring manager alignment)",
            "text": "Describe how you deliver an exceptional candidate experience even to candidates who are rejected after rigorous interview loops."
        },
        {
            "id": "tech_rec8",
            "category": "Technical Recruiter / Talent Acquisition Specialist (Sourcing strategy, candidate assessment, hiring manager alignment)",
            "text": "How do you negotiate equity, sign-on bonuses, and base salaries with senior candidates while adhering strictly to internal compensation bands?"
        },
        {
            "id": "tech_rec9",
            "category": "Technical Recruiter / Talent Acquisition Specialist (Sourcing strategy, candidate assessment, hiring manager alignment)",
            "text": "How do you train engineering interview panel members to avoid unconscious bias and evaluate candidates against structured rubrics?"
        },
        {
            "id": "tech_rec10",
            "category": "Technical Recruiter / Talent Acquisition Specialist (Sourcing strategy, candidate assessment, hiring manager alignment)",
            "text": "What talent acquisition metrics (time-to-hire, cost-per-hire, offer acceptance rate, source-of-hire) do you track to evaluate recruitment efficiency?"
        },
        {
            "id": "tech_rec11",
            "category": "Technical Recruiter / Talent Acquisition Specialist (Sourcing strategy, candidate assessment, hiring manager alignment)",
            "text": "How do you leverage technical events, open source sponsorships, and engineering employer branding to generate organic inbound candidates?"
        },
        {
            "id": "tech_rec12",
            "category": "Technical Recruiter / Talent Acquisition Specialist (Sourcing strategy, candidate assessment, hiring manager alignment)",
            "text": "How do you manage candidate expectations and communication when internal business changes suddenly pause or freeze headcount mid-interview process?"
        }
    ],

    "Customer Success Manager / Account Manager (Client retention strategies, upsell positioning, de-escalation roleplays)": [
        {
            "id": "csm_am1",
            "category": "Customer Success Manager / Account Manager (Client retention strategies, upsell positioning, de-escalation roleplays)",
            "text": "De-escalation roleplay: An enterprise client's business crashed due to an outage on your software during Black Friday. The VP screams that they are canceling immediately. How do you respond?"
        },
        {
            "id": "csm_am2",
            "category": "Customer Success Manager / Account Manager (Client retention strategies, upsell positioning, de-escalation roleplays)",
            "text": "What telemetry and product usage indicators do you track to identify early churn risks across your enterprise customer portfolio?"
        },
        {
            "id": "csm_am3",
            "category": "Customer Success Manager / Account Manager (Client retention strategies, upsell positioning, de-escalation roleplays)",
            "text": "How do you structure and lead a high-impact Executive Business Review (EBR / QBR) that clearly demonstrates quantifiable customer ROI?"
        },
        {
            "id": "csm_am4",
            "category": "Customer Success Manager / Account Manager (Client retention strategies, upsell positioning, de-escalation roleplays)",
            "text": "How do you naturally uncover expansion and upsell opportunities during regular client check-ins without sounding like a pushy salesperson?"
        },
        {
            "id": "csm_am5",
            "category": "Customer Success Manager / Account Manager (Client retention strategies, upsell positioning, de-escalation roleplays)",
            "text": "Describe your framework for customer onboarding to ensure new accounts achieve rapid Time-to-Value (TTV) within the first 30 days of contract signing."
        },
        {
            "id": "csm_am6",
            "category": "Customer Success Manager / Account Manager (Client retention strategies, upsell positioning, de-escalation roleplays)",
            "text": "How do you handle demanding customer requests for custom roadmap features when engineering cannot deliver them?"
        },
        {
            "id": "csm_am7",
            "category": "Customer Success Manager / Account Manager (Client retention strategies, upsell positioning, de-escalation roleplays)",
            "text": "How do you manage annual contract renewal negotiations and mandatory price increases while preserving strong customer goodwill?"
        },
        {
            "id": "csm_am8",
            "category": "Customer Success Manager / Account Manager (Client retention strategies, upsell positioning, de-escalation roleplays)",
            "text": "How do you establish account health scores across a portfolio of 40 accounts to prioritize where to deploy high-touch proactive interventions?"
        },
        {
            "id": "csm_am9",
            "category": "Customer Success Manager / Account Manager (Client retention strategies, upsell positioning, de-escalation roleplays)",
            "text": "How do you navigate stakeholder turnover when your primary executive sponsor at an enterprise customer leaves the company?"
        },
        {
            "id": "csm_am10",
            "category": "Customer Success Manager / Account Manager (Client retention strategies, upsell positioning, de-escalation roleplays)",
            "text": "How do you build a Customer Advocacy Program that successfully generates case studies, reference calls, and public reviews?"
        },
        {
            "id": "csm_am11",
            "category": "Customer Success Manager / Account Manager (Client retention strategies, upsell positioning, de-escalation roleplays)",
            "text": "How do you collaborate with solutions architects and product managers to unblock severe technical adoption barriers at client organizations?"
        },
        {
            "id": "csm_am12",
            "category": "Customer Success Manager / Account Manager (Client retention strategies, upsell positioning, de-escalation roleplays)",
            "text": "Tell me about a time you saved a customer account that had formally submitted a cancellation request. What exact steps did you take?"
        }
    ],

    "Customer Support / Helpdesk Specialist (Live troubleshooting, empathy checks, ticketing workflow execution)": [
        {
            "id": "cust_supp1",
            "category": "Customer Support / Helpdesk Specialist (Live troubleshooting, empathy checks, ticketing workflow execution)",
            "text": "Live troubleshooting roleplay: A frustrated, non-technical customer is locked out of their account on mobile and cannot receive the SMS verification code. Walk them through troubleshooting."
        },
        {
            "id": "cust_supp2",
            "category": "Customer Support / Helpdesk Specialist (Live troubleshooting, empathy checks, ticketing workflow execution)",
            "text": "What is your systematic diagnostic methodology when attempting to reproduce an intermittent, poorly described software bug reported by a user?"
        },
        {
            "id": "cust_supp3",
            "category": "Customer Support / Helpdesk Specialist (Live troubleshooting, empathy checks, ticketing workflow execution)",
            "text": "How do you de-escalate an aggressive, angry customer interaction while maintaining empathy and upholding company policy boundaries?"
        },
        {
            "id": "cust_supp4",
            "category": "Customer Support / Helpdesk Specialist (Live troubleshooting, empathy checks, ticketing workflow execution)",
            "text": "How do you manage high ticket queues during an unexpected global outage without sacrificing response empathy or accuracy?"
        },
        {
            "id": "cust_supp5",
            "category": "Customer Support / Helpdesk Specialist (Live troubleshooting, empathy checks, ticketing workflow execution)",
            "text": "How do you write a clear, reproducible bug report for software engineering that includes system logs, reproduction steps, and impact assessment?"
        },
        {
            "id": "cust_supp6",
            "category": "Customer Support / Helpdesk Specialist (Live troubleshooting, empathy checks, ticketing workflow execution)",
            "text": "How do you write public-facing knowledge base articles and internal team runbooks to enable customer self-service and reduce ticket volume?"
        },
        {
            "id": "cust_supp7",
            "category": "Customer Support / Helpdesk Specialist (Live troubleshooting, empathy checks, ticketing workflow execution)",
            "text": "How do you balance First Contact Resolution (FCR) targets with Average Handle Time (AHT) metrics during high-volume periods?"
        },
        {
            "id": "cust_supp8",
            "category": "Customer Support / Helpdesk Specialist (Live troubleshooting, empathy checks, ticketing workflow execution)",
            "text": "How do you determine when an issue should be escalated to Tier 2 technical support or engineering versus continuing to investigate independently?"
        },
        {
            "id": "cust_supp9",
            "category": "Customer Support / Helpdesk Specialist (Live troubleshooting, empathy checks, ticketing workflow execution)",
            "text": "How do you explain technical concepts like clearing browser cache, DNS propagation, or API token generation to non-technical users in simple language?"
        },
        {
            "id": "cust_supp10",
            "category": "Customer Support / Helpdesk Specialist (Live troubleshooting, empathy checks, ticketing workflow execution)",
            "text": "How do you multi-task across live chat queues and urgent email tickets simultaneously without providing rushed or incorrect answers?"
        },
        {
            "id": "cust_supp11",
            "category": "Customer Support / Helpdesk Specialist (Live troubleshooting, empathy checks, ticketing workflow execution)",
            "text": "How do you deliver bad news to a customer (e.g. data cannot be recovered or their requested feature won't be supported) with genuine empathy?"
        },
        {
            "id": "cust_supp12",
            "category": "Customer Support / Helpdesk Specialist (Live troubleshooting, empathy checks, ticketing workflow execution)",
            "text": "How do you collect and summarize qualitative customer feedback trends from support tickets to influence future product roadmap decisions?"
        }
    ],

    "Clinical Psychologist / Staff Therapist (Case conceptualization, ethical dilemmas, risk assessment)": [
        {
            "id": "clin_psych1",
            "category": "Clinical Psychologist / Staff Therapist (Case conceptualization, ethical dilemmas, risk assessment)",
            "text": "How do you conduct a comprehensive suicide and self-harm risk assessment, and what criteria determine safety planning versus immediate involuntary hospitalization?"
        },
        {
            "id": "clin_psych2",
            "category": "Clinical Psychologist / Staff Therapist (Case conceptualization, ethical dilemmas, risk assessment)",
            "text": "Walk me through how you formulate a biopsychosocial case conceptualization for a client presenting with severe generalized anxiety and somatic symptoms."
        },
        {
            "id": "clin_psych3",
            "category": "Clinical Psychologist / Staff Therapist (Case conceptualization, ethical dilemmas, risk assessment)",
            "text": "How do you navigate a complex ethical dilemma involving mandatory reporting laws when a client discloses past abuse involving a vulnerable dependent?"
        },
        {
            "id": "clin_psych4",
            "category": "Clinical Psychologist / Staff Therapist (Case conceptualization, ethical dilemmas, risk assessment)",
            "text": "How do you establish and maintain clinical boundaries when a client attempts to form a personal, non-clinical relationship outside of scheduled therapy sessions?"
        },
        {
            "id": "clin_psych5",
            "category": "Clinical Psychologist / Staff Therapist (Case conceptualization, ethical dilemmas, risk assessment)",
            "text": "How do you address client resistance and ambivalence toward change using Motivational Interviewing techniques in early clinical sessions?"
        },
        {
            "id": "clin_psych6",
            "category": "Clinical Psychologist / Staff Therapist (Case conceptualization, ethical dilemmas, risk assessment)",
            "text": "Describe your treatment planning strategy for concurrent disorders (e.g. Major Depressive Disorder co-occurring with substance use dependency)."
        },
        {
            "id": "clin_psych7",
            "category": "Clinical Psychologist / Staff Therapist (Case conceptualization, ethical dilemmas, risk assessment)",
            "text": "How do you manage confidentiality and informed consent when treating adolescent clients whose parents demand disclosure of session notes?"
        },
        {
            "id": "clin_psych8",
            "category": "Clinical Psychologist / Staff Therapist (Case conceptualization, ethical dilemmas, risk assessment)",
            "text": "How do you monitor and manage your own countertransference when working with clients diagnosed with severe Borderline Personality Disorder?"
        },
        {
            "id": "clin_psych9",
            "category": "Clinical Psychologist / Staff Therapist (Case conceptualization, ethical dilemmas, risk assessment)",
            "text": "How do you integrate cultural humility and systemic intersectionality into clinical diagnosis and evidence-based therapeutic interventions?"
        },
        {
            "id": "clin_psych10",
            "category": "Clinical Psychologist / Staff Therapist (Case conceptualization, ethical dilemmas, risk assessment)",
            "text": "Compare evidence-based trauma treatment modalities (e.g. Cognitive Processing Therapy, EMDR, Prolonged Exposure) and how you determine client suitability."
        },
        {
            "id": "clin_psych11",
            "category": "Clinical Psychologist / Staff Therapist (Case conceptualization, ethical dilemmas, risk assessment)",
            "text": "How do you respond in the moment when a client experiences an acute dissociative episode or severe panic attack during an in-person session?"
        },
        {
            "id": "clin_psych12",
            "category": "Clinical Psychologist / Staff Therapist (Case conceptualization, ethical dilemmas, risk assessment)",
            "text": "What personal self-care practices, peer supervision routines, and clinical boundaries do you maintain to prevent burnout and compassion fatigue?"
        }
    ],

    "Industrial-Organizational Psychologist (Selection tool validation, change management, organizational assessment)": [
        {
            "id": "io_psych1",
            "category": "Industrial-Organizational Psychologist (Selection tool validation, change management, organizational assessment)",
            "text": "How do you design, validate, and document a pre-employment cognitive and personality assessment system compliant with EEOC Uniform Guidelines?"
        },
        {
            "id": "io_psych2",
            "category": "Industrial-Organizational Psychologist (Selection tool validation, change management, organizational assessment)",
            "text": "Explain how you calculate adverse impact using the 4/5ths (80%) rule, and how you psychometrically remediate assessment items exhibiting differential item functioning (DIF)."
        },
        {
            "id": "io_psych3",
            "category": "Industrial-Organizational Psychologist (Selection tool validation, change management, organizational assessment)",
            "text": "How do you conduct a rigorous job analysis (KSAOs) to build a criterion-valid selection and promotion framework for mission-critical roles?"
        },
        {
            "id": "io_psych4",
            "category": "Industrial-Organizational Psychologist (Selection tool validation, change management, organizational assessment)",
            "text": "How do you design an organization-wide employee engagement survey with high construct validity and actionable factor analysis dimensions?"
        },
        {
            "id": "io_psych5",
            "category": "Industrial-Organizational Psychologist (Selection tool validation, change management, organizational assessment)",
            "text": "How do you manage employee resistance during a large-scale corporate merger using organizational change models like Kotter or Lewin?"
        },
        {
            "id": "io_psych6",
            "category": "Industrial-Organizational Psychologist (Selection tool validation, change management, organizational assessment)",
            "text": "How do you design a 360-degree performance appraisal system that minimizes cognitive rater biases like the halo effect, central tendency, and recency bias?"
        },
        {
            "id": "io_psych7",
            "category": "Industrial-Organizational Psychologist (Selection tool validation, change management, organizational assessment)",
            "text": "How do you measure the return on investment (ROI) and training transfer of an enterprise executive leadership development initiative using Kirkpatrick's model?"
        },
        {
            "id": "io_psych8",
            "category": "Industrial-Organizational Psychologist (Selection tool validation, change management, organizational assessment)",
            "text": "How do you diagnose toxic organizational culture, and what evidence-based structural interventions do you recommend to restore psychological safety?"
        },
        {
            "id": "io_psych9",
            "category": "Industrial-Organizational Psychologist (Selection tool validation, change management, organizational assessment)",
            "text": "How do you analyze organizational turnover data to distinguish voluntary from involuntary drivers and build predictive retention models?"
        },
        {
            "id": "io_psych10",
            "category": "Industrial-Organizational Psychologist (Selection tool validation, change management, organizational assessment)",
            "text": "How do you evaluate burnout risks across hybrid and remote workforces using the Job Demands-Resources (JD-R) framework?"
        },
        {
            "id": "io_psych11",
            "category": "Industrial-Organizational Psychologist (Selection tool validation, change management, organizational assessment)",
            "text": "How do you coach senior executives through difficult 360-degree feedback reports when their self-perception conflicts sharply with peer feedback?"
        },
        {
            "id": "io_psych12",
            "category": "Industrial-Organizational Psychologist (Selection tool validation, change management, organizational assessment)",
            "text": "How do you design structured behavioral interview guides and scoring rubrics that increase inter-rater reliability across interview panels?"
        }
    ],

    "Site Reliability / Field Service Engineer (On-site diagnostics, equipment troubleshooting, safety protocols)": [
        {
            "id": "field_sre1",
            "category": "Site Reliability / Field Service Engineer (On-site diagnostics, equipment troubleshooting, safety protocols)",
            "text": "How do you diagnose an unexpected hardware failure on a mission-critical edge server or industrial machine under high-pressure SLA deadlines?"
        },
        {
            "id": "field_sre2",
            "category": "Site Reliability / Field Service Engineer (On-site diagnostics, equipment troubleshooting, safety protocols)",
            "text": "Explain how you adhere to and enforce Lockout/Tagout (LOTO) procedures and high-voltage electrical safety standards in hazardous field environments."
        },
        {
            "id": "field_sre3",
            "category": "Site Reliability / Field Service Engineer (On-site diagnostics, equipment troubleshooting, safety protocols)",
            "text": "What is your systematic troubleshooting process when an on-site equipment system intermittently faults without generating clear diagnostic error codes?"
        },
        {
            "id": "field_sre4",
            "category": "Site Reliability / Field Service Engineer (On-site diagnostics, equipment troubleshooting, safety protocols)",
            "text": "How do you communicate complex diagnostic findings and repair timelines to agitated on-site facility managers who are losing revenue by the minute?"
        },
        {
            "id": "field_sre5",
            "category": "Site Reliability / Field Service Engineer (On-site diagnostics, equipment troubleshooting, safety protocols)",
            "text": "How do you manage spare parts inventory, precision tool calibration, and logistics when deployed to remote, low-resource field sites?"
        },
        {
            "id": "field_sre6",
            "category": "Site Reliability / Field Service Engineer (On-site diagnostics, equipment troubleshooting, safety protocols)",
            "text": "What steps do you take when performing an emergency on-site firmware rollback after a remote automated patch fails to initialize critical hardware?"
        },
        {
            "id": "field_sre7",
            "category": "Site Reliability / Field Service Engineer (On-site diagnostics, equipment troubleshooting, safety protocols)",
            "text": "How do you conduct comprehensive post-maintenance verification testing before officially handing equipment back to production operations?"
        },
        {
            "id": "field_sre8",
            "category": "Site Reliability / Field Service Engineer (On-site diagnostics, equipment troubleshooting, safety protocols)",
            "text": "How do you prioritize competing emergency dispatch requests across geographically dispersed client facilities during severe weather events?"
        },
        {
            "id": "field_sre9",
            "category": "Site Reliability / Field Service Engineer (On-site diagnostics, equipment troubleshooting, safety protocols)",
            "text": "How do you de-escalate interactions with uncooperative on-site client personnel while keeping safety and technical remediation as top priorities?"
        },
        {
            "id": "field_sre10",
            "category": "Site Reliability / Field Service Engineer (On-site diagnostics, equipment troubleshooting, safety protocols)",
            "text": "What details must be documented in a Field Service Report (FSR) to ensure warranty compliance, root cause tracking, and preventive maintenance planning?"
        },
        {
            "id": "field_sre11",
            "category": "Site Reliability / Field Service Engineer (On-site diagnostics, equipment troubleshooting, safety protocols)",
            "text": "How do you inspect on-site environmental factors (thermal cooling, humidity, vibration, grounding, power quality) when investigating recurring component degradation?"
        },
        {
            "id": "field_sre12",
            "category": "Site Reliability / Field Service Engineer (On-site diagnostics, equipment troubleshooting, safety protocols)",
            "text": "How do you train on-site customer technicians on basic routine maintenance and first-response procedures to prevent avoidable emergency service dispatches?"
        }
    ],

    "Executive / C-Suite Leadership - CEO/CTO/CFO (Vision alignment, board management, capital allocation strategies)": [
        {
            "id": "exec_lead1",
            "category": "Executive / C-Suite Leadership - CEO/CTO/CFO (Vision alignment, board management, capital allocation strategies)",
            "text": "How do you articulate a three-year strategic vision to the Board of Directors that balances aggressive top-line growth with a disciplined path to profitability?"
        },
        {
            "id": "exec_lead2",
            "category": "Executive / C-Suite Leadership - CEO/CTO/CFO (Vision alignment, board management, capital allocation strategies)",
            "text": "Walk me through your capital allocation framework: how do you evaluate deploying $30M between organic R&D, strategic M&A acquisitions, and capital returns?"
        },
        {
            "id": "exec_lead3",
            "category": "Executive / C-Suite Leadership - CEO/CTO/CFO (Vision alignment, board management, capital allocation strategies)",
            "text": "How do you manage boardroom governance during a strategic crisis when lead independent directors strongly disagree on company direction?"
        },
        {
            "id": "exec_lead4",
            "category": "Executive / C-Suite Leadership - CEO/CTO/CFO (Vision alignment, board management, capital allocation strategies)",
            "text": "How do you handle parting ways with an underperforming C-suite peer while preserving executive team unity and organizational stability?"
        },
        {
            "id": "exec_lead5",
            "category": "Executive / C-Suite Leadership - CEO/CTO/CFO (Vision alignment, board management, capital allocation strategies)",
            "text": "How do you scale organizational culture, values, and decision-making speed during rapid international expansion from 200 to 2,000 employees?"
        },
        {
            "id": "exec_lead6",
            "category": "Executive / C-Suite Leadership - CEO/CTO/CFO (Vision alignment, board management, capital allocation strategies)",
            "text": "How do you navigate a sudden macroeconomic downturn by executing strategic budget adjustments without sacrificing long-term competitive moats?"
        },
        {
            "id": "exec_lead7",
            "category": "Executive / C-Suite Leadership - CEO/CTO/CFO (Vision alignment, board management, capital allocation strategies)",
            "text": "How do you evaluate potential M&A acquisition targets across strategic fit, cultural alignment, technology architecture, and financial accretion?"
        },
        {
            "id": "exec_lead8",
            "category": "Executive / C-Suite Leadership - CEO/CTO/CFO (Vision alignment, board management, capital allocation strategies)",
            "text": "How do you communicate a difficult strategic pivot to the entire company in an all-hands meeting to preserve transparency, trust, and momentum?"
        },
        {
            "id": "exec_lead9",
            "category": "Executive / C-Suite Leadership - CEO/CTO/CFO (Vision alignment, board management, capital allocation strategies)",
            "text": "How do you build a high-performing executive leadership team that executes cross-functionally and avoids territorial silo mentalities?"
        },
        {
            "id": "exec_lead10",
            "category": "Executive / C-Suite Leadership - CEO/CTO/CFO (Vision alignment, board management, capital allocation strategies)",
            "text": "How do you manage investor relations, earnings expectations, and public market scrutiny during volatile quarterly performance cycles?"
        },
        {
            "id": "exec_lead11",
            "category": "Executive / C-Suite Leadership - CEO/CTO/CFO (Vision alignment, board management, capital allocation strategies)",
            "text": "How do you evaluate transformative technological disruptions (e.g. Generative AI) and steer enterprise capital and R&D capability to lead the transition?"
        },
        {
            "id": "exec_lead12",
            "category": "Executive / C-Suite Leadership - CEO/CTO/CFO (Vision alignment, board management, capital allocation strategies)",
            "text": "How do you define and manage enterprise risk management protocols encompassing cybersecurity threats, regulatory compliance, and geopolitical supply shocks?"
        }
    ]
}

# Merge new questions
for cat, qs in new_questions.items():
    data[cat] = qs

# Verify counts
print("Total categories:", len(data))
total_questions = sum(len(qs) for qs in data.values())
print("Total questions:", total_questions)

# Verify uniqueness of IDs
all_ids = [q["id"] for qs in data.values() for q in qs]
if len(all_ids) != len(set(all_ids)):
    print("WARNING: Duplicate IDs found!")
else:
    print("All IDs are completely unique!")

with open(file_path, "w", encoding="utf-8") as f:
    json.dump(data, f, indent=2, ensure_ascii=False)

print("Saved successfully to", file_path)
