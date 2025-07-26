# Guys Trip

This application helps a group of friends plan their annual "guys trip." It facilitates the decision-making process for the trip's location, dates, and accommodations.

## How to Launch

This application is containerized using Docker. To get started, you'll need to have Docker and Docker Compose installed on your machine.

1.  **Start the Services:**
    
    Navigate to the root directory of the project in your terminal and run the following command:
    
    ```bash
    docker-compose up -d
    ```
    
    This will build the necessary Docker images and start the client, server, and database containers in detached mode.
    
2.  **Access the Frontend:**
    
    Once the containers are running, you can access the frontend of the application by opening your web browser and navigating to:
    
    [http://localhost:3000](http://localhost:3000)
    
3.  **Stopping the Application:**
    
    To stop the application and all related services, run the following command from the root directory of the project:
    
    ```bash
    docker-compose down
    ```
    

## Development

If you need to run the client and server separately for development purposes, you can use the following commands.

### Client

To start the client development server, navigate to the `client` directory and run:

```bash
npm start
```

### Server

To start the server, navigate to the `server` directory and run:

```bash
node index.js
```
