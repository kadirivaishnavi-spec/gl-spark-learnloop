# 🚀 LearnLoop

### Collaborative Learning & Skill Exchange Platform

LearnLoop is a microservices-based collaborative learning platform that connects people who want to **learn new skills** with people who can **teach or mentor those skills**.

Instead of following a traditional one-way learning model, LearnLoop enables **peer-to-peer knowledge exchange**, where users can be both learners and mentors depending on the skills they want to learn and the skills they can offer.

---

## 📌 Project Overview

Learning a new skill often requires finding the right person who already has experience in that area. At the same time, many people possess valuable skills but do not have an easy way to share their knowledge with others.

**LearnLoop bridges this gap.**

A user can:

- Create an account and manage their profile
- Add skills they can teach
- Add skills they want to learn
- Discover potential mentors
- Receive skill-based matches
- View match percentages
- Send learning requests
- Accept or reject learning requests
- Track request status and history
- Provide ratings and feedback after learning interactions

The platform is built using a **Spring Boot microservices architecture**, allowing individual business capabilities to be independently developed, maintained, and scaled.

---

# 🎯 Key Features

### 👤 User Management
- User registration
- User login
- JWT-based authentication
- User profile management
- User skill management

### 🧠 Skill Management
- Add skills
- Manage teaching skills
- Manage learning skills
- Skill categorization

### 🎯 Skill Matching
- Match learners with suitable mentors
- Mentor discovery
- Reciprocal learning detection
- Match percentage calculation
- Skill-based compatibility

### 📩 Learning Requests
- Send learning requests
- Accept requests
- Reject requests
- Track request status
- View request history

### ⭐ Feedback & Ratings
- Submit feedback
- Rate learning interactions
- View feedback history

### 🔐 Security
- JWT authentication
- JWT validation at API Gateway
- Protected API endpoints
- Public login and registration endpoints
- CORS configuration
- Centralized API security

---

# 🏗️ System Architecture

LearnLoop follows a **microservices architecture** where each major business capability is implemented as an independent service.

```text
                    ┌─────────────────────────────┐
                    │ React + TypeScript Frontend │
                    └──────────────┬──────────────┘
                                   │
                                   ▼
                    ┌─────────────────────────────┐
                    │     Spring Cloud Gateway    │
                    │  API Routing + JWT Security │
                    └──────────────┬──────────────┘
                                   │
              ┌────────────────────┼────────────────────┐
              │                    │                    │
              ▼                    ▼                    ▼
       ┌────────────┐       ┌────────────┐       ┌────────────┐
       │    User    │       │   Skill    │       │   Match    │
       │  Service   │       │  Service   │       │  Service   │
       └─────┬──────┘       └─────┬──────┘       └─────┬──────┘
             │                    │                    │
             ▼                    ▼                    ▼
        PostgreSQL           PostgreSQL           PostgreSQL


              ┌────────────────────┼────────────────────┐
              │                    │
              ▼                    ▼
       ┌───────────────┐     ┌───────────────┐
       │ Learning      │     │   Feedback    │
       │ Request       │     │   Service     │
       │ Service       │     │               │
       └───────┬───────┘     └───────┬───────┘
               │                     │
               ▼                     ▼
          PostgreSQL            PostgreSQL


                    ┌─────────────────────────┐
                    │   Netflix Eureka       │
                    │   Service Registry      │
                    │   & Heartbeats          │
                    └─────────────────────────┘
```

---

# 🧩 Microservices

| Microservice | Responsibilities |
|---|---|
| **User Service** | Registration, Login, JWT Authentication, User Profile, User Management |
| **Skill Service** | Skill Management, Skill Categories, Teaching Skills, Learning Skills |
| **Match Service** | Skill Matching, Mentor Discovery, Reciprocal Matching, Match Percentage |
| **Learning Request Service** | Send Request, Accept Request, Reject Request, Request Status, Request History |
| **Feedback Service** | Submit Feedback, Rating, Feedback History |
| **API Gateway** | API Routing, JWT Validation, CORS, Centralized Security |
| **Eureka Server** | Service Registration, Service Discovery and Heartbeats |

---

# 🔄 Core User Flow

```text
                    User Registration / Login
                              │
                              ▼
                       Create Profile
                              │
                              ▼
                  Add Teaching & Learning Skills
                              │
                              ▼
                    Request to Learn a Skill
                              │
                              ▼
                       Match Service
                              │
                              ▼
                  Find Compatible Users
                              │
                              ▼
                     Calculate Match %
                              │
                              ▼
                       Discover Mentor
                              │
                              ▼
                    Send Learning Request
                              │
                    ┌─────────┴─────────┐
                    ▼                   ▼
                Accepted             Rejected
                    │
                    ▼
              Learning Interaction
                    │
                    ▼
             Submit Feedback & Rating
```

---

# 📊 Match Percentage

LearnLoop considers both **reciprocal learning compatibility** and **mentor suitability** when calculating the match percentage.

The current matching concept is:

```text
Match % = Reciprocal Score + Mentor Score
```

### 🔄 Reciprocal Learning

A reciprocal match occurs when two users can potentially learn from each other.

For example:

```text
Alice
  Wants to Learn → React
  Can Teach      → Java

Bob
  Wants to Learn → Java
  Can Teach      → React
```

Alice and Bob have a **two-way learning opportunity**, making the match more valuable than a one-directional learning relationship.

### 👨‍🏫 Mentor Score

The mentor score represents how suitable a potential mentor is for the skill requested by the learner.

This allows LearnLoop to prioritize users who can directly help with the requested skill.

---

# 🔐 Authentication & Security

LearnLoop uses **JWT-based authentication**.

The authentication flow is:

```text
User
 │
 │ Login
 ▼
API Gateway
 │
 ▼
User Service
 │
 │ JWT Token
 ▼
Frontend
 │
 │ Authorization: Bearer <JWT>
 ▼
API Gateway
 │
 │ Validate JWT
 ▼
Protected Microservice
```

The API Gateway validates JWT tokens before forwarding protected requests to the appropriate microservice.

Authentication endpoints such as login and registration are publicly accessible, while protected APIs require a valid JWT token.

---

# 🌐 API Gateway

The API Gateway acts as the centralized entry point for the frontend.

### Responsibilities

- API routing
- JWT validation
- Authentication enforcement
- CORS configuration
- Request forwarding
- Centralized security

Example routing:

```text
Frontend
   │
   ▼
API Gateway : 8080
   │
   ├── /api/users/**
   │        └── User Service
   │
   ├── /api/skills/**
   │        └── Skill Service
   │
   ├── /api/matches/**
   │        └── Match Service
   │
   ├── /api/learning/**
   │        └── Learning Request Service
   │
   └── /api/feedback/**
            └── Feedback Service
```

---

# 🔎 Service Discovery

LearnLoop uses **Netflix Eureka Server** for service registration and discovery.

Each microservice registers itself with Eureka, allowing the distributed system to maintain information about available services.

```text
                    ┌──────────────────────┐
                    │  Netflix Eureka      │
                    │      Server          │
                    │ Service Registry      │
                    └──────────┬───────────┘
                               │
          ┌────────────────────┼────────────────────┐
          │                    │                    │
          ▼                    ▼                    ▼
     User Service        Skill Service        Match Service
          │                    │                    │
          └────────────────────┼────────────────────┘
                               │
                   ┌───────────┴───────────┐
                   ▼                       ▼
          Learning Request           Feedback Service
              Service
```

---

# 💻 Technology Stack

## Frontend

- React
- TypeScript
- HTML5
- CSS3

## Backend

- Java
- Spring Boot
- Spring Cloud
- Spring Cloud Gateway
- Spring Data JPA
- Spring Cloud OpenFeign
- Netflix Eureka

## Security

- JWT
- JSON Web Token validation
- CORS

## Database

- PostgreSQL

## Build & Development

- Maven
- Git
- GitHub
- IntelliJ IDEA
- Visual Studio Code

---

# 📁 Project Structure

```text
gl-spark-learnloop/
│
├── api-gateway/
│
├── eureka-server/
│
├── user-service/
│
├── skill-service/
│
├── match-service/
│
├── learning-service/
│
├── feedback-service/
│
├── frontend/
│
├── .gitignore
│
└── README.md
```

---

# ⚙️ Service Ports

| Component | Port |
|---|---:|
| API Gateway | `8080` |
| User Service | `8081` |
| Skill Service | `8082` |
| Match Service | `8083` |
| Learning Request Service | `8084` |
| Feedback Service | `8085` |
| Eureka Server | `8761` |
| React Frontend | `5173` |

> Port numbers should match the values configured in each service's `application.properties`.

---

# 🗄️ Database Architecture

LearnLoop follows the **Database-per-Service** approach.

Each microservice maintains its own PostgreSQL database.

```text
User Service
     │
     ▼
  User DB
 PostgreSQL


Skill Service
     │
     ▼
  Skill DB
 PostgreSQL


Match Service
     │
     ▼
  Match DB
 PostgreSQL


Learning Request Service
     │
     ▼
 Request DB
 PostgreSQL


Feedback Service
     │
     ▼
 Feedback DB
 PostgreSQL
```

This provides:

- Data isolation
- Independent service ownership
- Reduced coupling
- Easier service maintenance
- Independent database management

---

# 🔗 Inter-Service Communication

The microservices communicate with each other using REST APIs and **Spring Cloud OpenFeign** where required.

Example:

```text
Learning Request Service
          │
          ▼
     Match Service
          │
          ▼
      User Service
```

This allows services to retrieve the information required to complete business operations while keeping responsibilities separated.

---

# 🚀 Getting Started

## Prerequisites

Make sure the following are installed:

- Java 17+
- Maven
- Node.js
- npm
- PostgreSQL
- Git

---

## 1. Clone the Repository

```bash
git clone https://github.com/kadirivaishnavi-spec/gl-spark-learnloop.git
```

```bash
cd gl-spark-learnloop
```

---

# 2. Configure PostgreSQL

Create the required PostgreSQL databases for the microservices.

Update each service's:

```text
application.properties
```

with the appropriate:

- Database URL
- Username
- Password

Example:

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/learnloop_db
spring.datasource.username=postgres
spring.datasource.password=your_password
```

---

# 3. Start Eureka Server

Navigate to the Eureka Server:

```bash
cd eureka-server
```

Run:

```bash
mvnw.cmd spring-boot:run
```

The Eureka dashboard will be available at:

```text
http://localhost:8761
```

---

# 4. Start the Microservices

Start the following services:

```text
user-service
skill-service
match-service
learning-service
feedback-service
```

For example:

```bash
cd user-service
mvnw.cmd spring-boot:run
```

Repeat for each service.

---

# 5. Start API Gateway

Navigate to:

```bash
cd api-gateway
```

Run:

```bash
mvnw.cmd spring-boot:run
```

The API Gateway runs on:

```text
http://localhost:8080
```

---

# 6. Start the Frontend

Navigate to the frontend:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

The frontend will normally be available at:

```text
http://localhost:5173
```

---

# 🧪 Testing

Each Spring Boot microservice contains its own test structure.

To run tests for a service:

```bash
mvnw.cmd test
```

For example:

```bash
cd user-service
mvnw.cmd test
```

The same approach can be used for the other services.

---

# 🔒 Security & Configuration

Sensitive information should **never be committed to GitHub**.

Do not commit:

```text
Database passwords
JWT secrets
API keys
Private credentials
Environment-specific secrets
```

For production environments, sensitive values should be provided using environment variables or a secure configuration management system.

---

# 📌 Project Status

## Completed

- [x] Microservices architecture
- [x] User Service
- [x] Skill Service
- [x] Match Service
- [x] Learning Request Service
- [x] Feedback Service
- [x] API Gateway
- [x] Netflix Eureka Service Discovery
- [x] PostgreSQL integration
- [x] JWT authentication
- [x] JWT validation at API Gateway
- [x] React + TypeScript frontend
- [x] Skill-based matching
- [x] Reciprocal learning matching
- [x] Match percentage calculation
- [x] Learning request workflow
- [x] Request status tracking
- [x] Feedback and rating workflow

---

# 🔮 Future Enhancements

Potential future improvements include:

- [ ] Real-time notifications
- [ ] Chat between matched users
- [ ] Advanced recommendation algorithms
- [ ] Availability-based matching
- [ ] User availability scheduling
- [ ] Improved mentor ranking
- [ ] Centralized logging
- [ ] Distributed monitoring
- [ ] Docker containerization
- [ ] CI/CD pipeline
- [ ] Cloud deployment

---

# 🌟 Why LearnLoop?

LearnLoop focuses on **learning through people rather than only learning through content**.

The platform creates a collaborative environment where users can switch between being a **learner and a mentor** depending on their skills and learning goals.

For example:

```text
A user can be:

             ┌───────────────┐
             │    LEARNER    │
             │               │
             │ Wants React   │
             └───────┬───────┘
                     │
                     ▼
              Find a Mentor
                     │
                     ▼
             Learn the Skill
                     │
                     ▼
              Give Feedback


At the same time, the same user can be:

             ┌───────────────┐
             │    MENTOR     │
             │               │
             │ Teaches Java  │
             └───────┬───────┘
                     │
                     ▼
              Help another
                  learner
```

This creates a **peer-to-peer skill exchange ecosystem** rather than a conventional one-directional learning platform.

---

# 🏆 Project Highlights

### Microservices
Independent services for user management, skills, matching, learning requests and feedback.

### Service Discovery
Netflix Eureka enables service registration and discovery.

### API Gateway
Spring Cloud Gateway provides a centralized entry point for frontend requests.

### Security
JWT authentication and API Gateway-level token validation protect backend APIs.

### Skill Matching
Users are matched based on the relationship between their learning goals and teaching capabilities.

### Reciprocal Learning
The platform gives higher value to situations where users can learn from each other.

### Independent Databases
Each service maintains its own PostgreSQL database following the database-per-service principle.

---

# 👩‍💻 Project Information

**Project Name:** LearnLoop

**Type:** Collaborative Learning & Skill Exchange Platform

**Architecture:** Microservices

**Frontend:** React + TypeScript

**Backend:** Java + Spring Boot

**Service Discovery:** Netflix Eureka

**API Gateway:** Spring Cloud Gateway

**Security:** JWT

**Database:** PostgreSQL

---

# 📄 License

This project is developed for educational and project purposes.

---

## ⭐ LearnLoop

**Learn. Teach. Connect. Grow.**
