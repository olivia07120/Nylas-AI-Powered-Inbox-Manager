# Multimodal Inbox Manager

## Overview

Multimodal Inbox Manager is a web application that allows users to manage their emails efficiently. The application categorizes emails, suggests actions, and provides a smart reply feature using AI-powered suggestions. The app integrates with the Nylas API to fetch emails and send replies, and it uses Cloudflare's AI models for generating summaries, categorizing emails, and crafting smart replies.

## Features

- **Email Categorization**: Automatically categorizes incoming emails based on their content.
- **Recommended Actions**: Provides one-word recommended actions for each email.
- **Smart Reply**: Generates AI-powered smart replies that users can review, edit, and send directly from the application.
- **User Interface**: A simple and intuitive UI that organizes emails by date and displays relevant information.

## Components

### Backend

- **index.js**: The entry point of the backend server. Sets up the Express server, routes, and middlewares.
- **routes/index.js**: Contains the routes for handling API requests related to emails. This includes fetching emails, generating summaries, categorizing them, and sending replies.
- **Nylas API Integration**: Integrates with Nylas to fetch and send emails.
- **Cloudflare Workers AI Integration**: Utilizes Cloudflare's AI services to generate email summaries, categorize emails, and provide smart replies.

### Frontend

- **Dashboard.js**: The main component that handles the display of emails. It fetches emails from the backend, groups them by date, and displays them with categorized tags and recommended actions.
- **Modal Component**: Displays the full email content and allows users to view and edit the smart reply before sending it.
- **CSS Styling**: Custom CSS styles are used for theming the UI and ensuring a responsive and user-friendly design.

## Installation

### Prerequisites

- **Node.js**: Ensure that Node.js is installed on your machine.
- **NPM or Yarn**: You can use either npm or yarn as the package manager.
- **Nylas Account**: You need a Nylas account for API access.
- **Cloudflare Account**: You need a Cloudflare account for accessing the AI models.

### Steps to Install

1. **Clone the Repository**
   ```sh
   git clone https://github.com/olivia07120/Nylas-AI-Powered-Inbox-Manager.git
   cd multimodal-inbox-manager
   ```
   
2. **Backend Setup**
- Navigate to the 'backend/' directory:
```sh
   cd backend
```
- Install the dependencies:
```sh
   npm install
```
- Create a .env file based on .env.example and fill in your Nylas and Cloudflare credentials.
- Start the backend server:
```sh
   npm start
```

3**Frontend Setup**
- Navigate to the 'frontend/' directory:
```sh
   cd ../frontend
```
- Install the dependencies:
```sh
   npm install
```
- Create a .env file based on .env.example and fill in your Nylas and Cloudflare credentials.
- Start the frontend development server:
```sh
   npm start
```
- Open your browser and go to http://localhost:3000 to see the app in action.

## Architecture
![diagram-export-9-2-2024-2_57_07-AM](https://github.com/user-attachments/assets/b075d9e7-2b5b-45a8-b89f-f49fbc431a81)




