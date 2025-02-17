# Hedera Donation Platform

## Live Website
[https://donation.kingofshiba.xyz/](https://donation.kingofshiba.xyz/)

**Note**: Please visit the live platform to explore the full functionality of the Hedera Donation project.

## Project Overview

Hedera Donation is a blockchain-powered donation platform that enables transparent and secure fundraising campaigns using Hedera Hashgraph technology.

## Tech Stack

- **Frontend**: React.js
- **Backend**: Django (Python)
- **Blockchain Development**: Hardhat, Solidity
- **Database**: PostgreSQL
- **Containerization**: Docker
- **Additional Technologies**: 
  - Hashgraph SDK
  - JavaScript
  - Nginx (Reverse Proxy)

## System Architecture

### Key Components

1. **Campaign Management**
   - Users can create donation campaigns
   - Admin review and approval process
   - Blockchain-backed campaign tracking

2. **Backend Workflow**
   - Django REST API for campaign management
   - Worker service for campaign monitoring
   - Automated smart contract execution
   - Transaction crawling and tracking

### System Flow

```mermaid
graph TD
    subgraph "Frontend [React.js]"
        A[User Interface]
    end

    subgraph "Load Balancer [Nginx]"
        NX[Reverse Proxy]
    end

    subgraph "Backend Services [Django]"
        API[Django REST API]
        AUTH[Authentication Service]
        ADMIN[Admin Dashboard]
    end

    subgraph "Database [PostgreSQL]"
        DB[(Campaign Database)]
        TXDB[(Transaction Index)]
    end

    subgraph "Blockchain Interaction"
        WS[Background Worker Service]
        SC[Smart Contract Manager]
        HEDERA[Hedera Hashgraph SDK]
    end

    subgraph "Blockchain Network [Hedera]"
        BC[Blockchain Contracts]
    end

    A --> |Campaign Creation| NX
    NX --> |Route Requests| API
    API --> AUTH
    API --> |Save Campaign| DB
    ADMIN --> |Review & Approve| API
    API --> |Trigger Deployment| WS
    WS --> |Create Contract| SC
    SC --> |Deploy to| HEDERA
    BC --> |Transaction Data| WS
    WS --> |Log Transactions| TXDB
    WS --> |Update Campaign Status| DB

    style A fill:#f9f,stroke:#333,stroke-width:2px
    style NX fill:#bbf,stroke:#333,stroke-width:2px
    style API fill:#bfb,stroke:#333,stroke-width:2px
    style DB fill:#ffd,stroke:#333,stroke-width:2px
    style WS fill:#fbb,stroke:#333,stroke-width:2px
    style BC fill:#ddf,stroke:#333,stroke-width:2px
```

## Key Features

- Transparent donation tracking
- Blockchain-secured transactions
- Admin-controlled campaign approval
- Automated campaign management
- Comprehensive transaction indexing

## Security Considerations
- Implement robust access controls
- Use environment-specific configuration
- Secure blockchain transaction signing
- Regular security audits

## Deployment
- Use Nginx as a reverse proxy
- Configure HTTPS
- Implement rate limiting
- Set up monitoring and logging

## Future Roadmap
- Multi-chain support
- Advanced analytics dashboard
- Improved user verification
- Donation tracking and impact reporting