The Investment Prediction & Learning System is a full-stack analytics platform designed to collect, track, and evaluate investment price predictions over time.

The core objective is to identify which information sources, prediction methods, and analytical approaches consistently produce accurate investment forecasts. The system records predictions before outcomes are known, automatically collects realised market prices at prediction maturity, and compares forecasted versus actual results to create a growing database of prediction performance.

Unlike traditional backtesting approaches, the system focuses exclusively on forward-looking predictions with immutable historical records, eliminating hindsight bias and allowing systematic evaluation of forecasting accuracy.

Key Features
Prediction Collection
Manual forecast entry through a web interface
Automated collection of analyst price targets and investment research
Full provenance tracking for each prediction, including source, method, and forecast horizon
Data Processing Pipeline
Automated search and retrieval of investment research
Information extraction and synthesis using Large Language Models (LLMs)
Scheduled processing and data collection workflows
Realised Outcome Tracking
Automatic retrieval of market prices at forecast maturity dates
Persistent storage of forecast and realised outcomes
Historical prediction performance database
Analytics & Evaluation
Comparison of forecasted and realised prices
Source-level performance analysis
Method and horizon-based evaluation
Dashboard-driven reporting and exploration
Technology Stack
Backend
FastAPI
Python
Frontend
Next.js
Database
MySQL
AI Services
OpenAI
Anthropic
Google Gemini
External Data Sources
Yahoo Finance (yfinance)
Google Search (Serper API)
Deployment
Docker
Docker Compose
System Architecture

The MVP consists of the following modules:

Search & Fetch Module
Audit Module
Extraction & Synthesis Module
Forecast Entry Module
Realised Data Collection Module
Scheduler
Comparison & Analytics Module
Authentication & User Management
Dashboard & Analytics Interface

All modules operate within a containerized environment and share a common relational database designed to maintain prediction provenance and data integrity.

Project Goal

The primary goal of the MVP is to build a reliable prediction tracking system capable of accumulating high-quality forecast–outcome pairs over time.

By systematically measuring prediction accuracy across sources, methods, and asset classes, the platform aims to support evidence-based evaluation of investment forecasting approaches and create a foundation for future analytical and machine learning enhancements.

Dashboard page
<img width="2496" height="639" alt="image" src="https://github.com/user-attachments/assets/b16cc9f8-c3c3-4741-8149-80620b598671" />

Manual entry page
<img width="923" height="1197" alt="image" src="https://github.com/user-attachments/assets/a3123d8e-ebba-4040-a615-009341d62d0a" />

Analytics page
<img width="2155" height="1031" alt="image" src="https://github.com/user-attachments/assets/df42be36-e08e-4a66-bdc7-259aa8708a6d" />

