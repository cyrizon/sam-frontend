# sam-frontend

This project serves as the user interface for the **SAM** application, a route optimization solution. The frontend communicates with the **SAM Backend** to request optimized routes and display them to users in an intuitive and interactive way.

## Objectives

This repository aims to:
- Provide a user-friendly interface for the **SAM** route optimization application.
- Send user input (e.g., coordinates) to the **SAM Backend** via API calls.
- Display optimized routes and other relevant information to users.

## How It Works

1. **User Interaction**: Users interact with the frontend to input data, such as coordinates for route optimization.
2. **Backend Communication**: The frontend sends requests to the **SAM Backend** via RESTful APIs.
3. **Route Display**: The frontend receives the optimized route and visualizes it for the user in a clear and interactive map interface.

## Features

- **Interactive Interface**: A clean and intuitive user interface for managing route data.
- **API Integration**: Connects seamlessly with the **SAM Backend** for route optimization.
- **Visualization**: Displays optimized routes and related data on an interactive map.

## Getting Started

Follow these steps to get started with the **SAM Frontend** project:

1. **Clone the Repository**:
   ```sh
   git clone https://github.com/cyrizon/sam-frontend.git
   ```

2. **Install Dependencies**:
   Ensure you have Node.js and npm installed. Then, install the required dependencies:
   ```sh
   npm install
   ```

3. **Run the Application**:
   Start the development server:
   ```sh
   npm start
   ```

4. **Configure the Backend**:
   - Make sure the **SAM Backend** is running and accessible.
   - Update the frontend configuration to include the API URL of the **SAM Backend**.

## Environment Variables

The frontend uses the following environment variables for configuration:
- `REACT_APP_BACKEND_URL`: The URL of the **SAM Backend** for API communication.
