# Candidate Evaluation System

## Project Description
The Candidate Evaluation System is designed to automate the assessment of CVs and technical project reports. By leveraging a combination of Large Language Models (LLMs) and Retrieval-Augmented Generation (RAG) with ChromaDB, this system reduces manual screening, speeds up recruitment, and provides structured, objective feedback on candidate suitability for predefined job roles.

## How to Install and Run the Project

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- MySQL database
- API key for Gemini 2.5 Flash (Google AI Studio)

### Installation Steps
1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/candidate-evaluation-system.git
   ```
2. Navigate to the project folder:
    ```bash
    cd candidate-evaluation-system
    ```
3. Install Dependencies
    ```bash
    npm install
    ```
4. Set up environment variables:
    - Create a .env file in the root directory.
    - Add necessary variables, for example:

    ```bash
    DATABASE_URL=mysql://user:password@localhost:3306/candidate_evaluator
    GEMINI_API_KEY=your_api_key_here    
    ```
5. Run database migrations (if you have created the *candidate_evaluator* database):
    ```bash
    npx prisma migrate dev
    ``` 
6. Chroma DB (Via docker)
    - Ensure Docker and Docker Composed are installed.
    - Build and start the container:

    ```bash
    docker-compose up --build
    ```
5. Run project in development mode:
    ```bash
    npm run dev
    ``` 

## How to Ingest RAG Context

1. Ingest the CV and Report Context to ChromaDB 

    ```bash
    node run src/scripts/ingestDocuments.js
    ```

2. Check Collection in ChromaDB

    ```bash
    node run src/scripts/checkCollections.js
    ```

3. Delete all Collection in ChromaDB

    ```bash
    node run src/scripts/clearCollections.js
    ```

## How to Use the Project

1. **Uploading Documents**
    
    Recruiters can upload CVs and project reports through the API using **multipart/form-data**. You can test this using Postman or similar tools.

    Endpoint:

    ```
    [POST] http://localhost:3000/upload
    ```

    Form Data Keys:

    | Key             | Description                    | Type    |
    |-----------------|--------------------------------|---------|
    | `cv`            | Candidate's CV file            | File    |
    | `projectReport` | Candidate's technical report   | File    |

    Result:

    ```json
    {
      "message": "Files uploaded successfully",
      "cvId": 1,
      "projectId": 2
    }
    ```


2. **Evaluation Process**
    - The system automatically extracts text from uploaded documents.
    - The RAG Service retrieves relevant context from ChromaDB.
    - Gemini 2.5 Flash evaluates the documents and generates structured JSON feedback.

    Endpoint:

    ```
    [POST] http://localhost:3000/evaluate
    ```

    Raw Body:
    ```json
    {
      "jobTitle": "Backend Engineer", // job title (random)
      "cvId": 1 // cv id from table document,
      "projectId": 2 // project id from table document 
    }
    ```

    Result:

    ```json
    {
      "id": 1,
      "status": "queued"
    }
    ```


3. **Viewing Results**
    - Evaluation results are stored in the database in a structured format (e.g., cv_match_rate, project_score, overall_summary).
    - Users can view the results through the dashboard or access them via API.

    Endpoint:

    ```
    [GET] http://localhost:3000/result/:id
    ```

    Result (Processing):

    ```json
    {
      "id": 1,
      "status": "process"
    }
    ```

    Result (Completed):

    ```json
    {
      "id": "456",
      "status": "completed",
      "result": {
        "cv_match_rate": 0.82,
        "cv_feedback": "Strong in backend and cloud, limited integration experience...",
        "project_score": 4.5,
        "project_feedback": "Meets prompt chaining requirements, lacks error handling robustness...",
        "overall_summary": "Good candidate fit, would benefit from deeper RAG knowledge..."
      }
    }
    ```

