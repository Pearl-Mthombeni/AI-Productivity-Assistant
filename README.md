# Workly AI by CAPACITI

## Overview

Workly AI is an AI-powered workplace productivity assistant designed to help professionals simplify everyday tasks and work more efficiently. The application brings several productivity tools together in one place, helping users draft professional emails, summarize meeting notes, organize tasks, research topics, and get assistance with workplace questions.

This project was developed as part of the CAPACITI AI Skills Acceleration Programme to demonstrate practical AI application development, prompt engineering, and responsible AI use.

## Problem Statement

Professionals spend a significant amount of time on repetitive administrative and workplace tasks, including writing emails, preparing meeting summaries, organizing schedules, and researching information. These tasks can reduce the time available for more important responsibilities.

Workly AI addresses this challenge by providing AI-assisted tools that help users complete these tasks more efficiently while keeping them in control of the final output.

## Key Features

- **Smart Email Generator:** Generates professional emails based on the user's purpose, audience, key details, and preferred tone.
- **Meeting Notes Summarizer:** Converts meeting notes into concise summaries, key discussion points, decisions, and action items.
- **AI Task Planner:** Helps users organize tasks according to priorities, deadlines, and available time.
- **AI Research Assistant:** Summarizes topics or supplied content and identifies key insights and recommendations.
- **AI Chat Assistant:** Provides an interactive interface for workplace questions and productivity support.

## Tools and Technologies

List the technologies actually used in the project, such as:

- **Lovable:** Used to build and develop the application interface.
- **GitHub:** Used for source code management and project version control.
- **ChatGPT:** Used to support planning, prompt development, and refinement.
- **AI Model/API:** Add the actual provider and integration used by the application, if configured.
- **Frontend technologies:** Add the actual framework and libraries used in the project.

## Prompt Engineering

The application uses structured prompts to guide AI outputs. Depending on the feature, prompts define the task, context, expected output format, and constraints.

For example, the Email Generator prompt instructs the AI to write a professional email using the user's supplied details, match the selected tone, and avoid adding unsupported information.

The prompts were designed to improve relevance, clarity, consistency, and usefulness across different workplace scenarios.

## Responsible AI

Workly AI is intended to assist users rather than replace human judgement. AI-generated outputs may contain errors and should be reviewed before use.

The project follows these principles:

- Users should verify important information before relying on generated outputs.
- The application should not invent meeting decisions, deadlines, facts, or research citations.
- Users should review and edit AI-generated content before sharing it.
- Confidential or sensitive workplace information should not be entered unless appropriate safeguards are in place.
- AI limitations should be communicated clearly.

## Challenges and Solutions

Potential development challenges included designing prompts that produce useful and consistent results, ensuring the interface is easy to navigate, and handling missing or incomplete user input.

These challenges were addressed through structured prompt design, iterative testing, clear input forms, editable outputs, and user feedback messages. Update this section with the actual challenges encountered and the solutions implemented during development.

## Expected Impact

Workly AI aims to reduce the effort involved in routine workplace tasks, improve the clarity of written communication, support better task organization, and make information easier to understand.

The actual productivity impact depends on the task, the quality of the supplied information, and the user's review of the AI output.

## Getting Started

**Access the application:** Add your published Workly AI URL here.

**Source code:** This repository contains the application's source code.

To run the project locally, follow the setup instructions for the framework and dependencies used in the repository. Add the actual installation and development commands once these have been confirmed.

If the application requires an AI API key, configure it using the appropriate secure environment variables or server-side secrets. Never commit API keys or other sensitive credentials to GitHub.

## Project Information

Developed for the CAPACITI AI Skills Acceleration Programme.

Project: Workly AI 

Purpose: AI-assisted workplace productivity




This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/3acf9ef2-59d7-47c7-8748-c90c3ab53fb3).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
