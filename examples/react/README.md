# TaxiQL React Examples

This repository contains a series of React-based examples demonstrating how to use the **TaxiQL TypeScript SDK** to execute queries against a Taxi workspace. The examples leverage Nebula to provide a test ecosystem, which includes:

- **A database** containing film data.
- **Five HTTP APIs** for retrieving film reviews, streaming provider information, and correlating film IDs.
- **A Kafka broker** broadcasting on a `release` topic every 5 seconds.

## Overview

The examples in this repository are designed to showcase various TaxiQL capabilities, including:

1. Executing queries to retrieve data from a Taxi workspace.
2. Using promises, event streams, and subscription-based queries.
3. Handling errors and streaming updates in real time.

## Prerequisites

To run these examples, ensure you have the following installed:

- **Node.js** (>= 14.x)
- **npm**
- **Docker** (for running Nebula test ecosystem containers)

## Getting Started

### Step 1: Clone the Repository

```bash
git clone https://github.com/orbitalapi/typescript-client.git
cd examples/react
```

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Start Nebula Test Ecosystem

Nebula provides the required test containers, including the database, APIs, and Kafka broker. To start Nebula, navigate to the examples/taxi folder and then run:

```bash
docker-compose up -d
```

Ensure the Nebula environment is running before proceeding.

### Step 4: Start the React Application

Run the React application locally:

```bash
npm run dev
```

The application will be available at [http://localhost:5173](http://localhost:5173).

### Generating new taxonomy.ts file

If you make changes to any of the .taxi files in the examples/taxi project, the TS taxonomy file will need to be regenerated. Do this from the examples/react folder:

```bash
npm run orbital:generate
```


## Contributing

Contributions are welcome! If you have ideas for new examples or improvements, feel free to open an issue or submit a pull request.

## License

This project is licensed under the [MIT License](LICENSE).



