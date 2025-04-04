

# Budget Dashboard

<div align="justify">
This project is a full-stack web application that takes data input from a CSV file, pushes it into a PostgreSQL database, and provides a user-friendly interface to view and manage the data. The backend is built using FastAPI, while the frontend is styled using Tailwind CSS for responsiveness.
</div>

## Project Overview

### Key Features:
- **Data Upload**: Upload CSV files and automatically push the data into the PostgreSQL database.
- **Database Tables**: 
  - **SubsidiaryBudget**
  - **SectorSpending**
  - **Transactions**
  - **Cost Distribution**
- **Responsive Frontend**: Built with Tailwind CSS to ensure the interface works seamlessly across devices.
- **FastAPI Backend**: Handles API requests to push and retrieve data from the PostgreSQL database.

### Tech Stack:
- **Backend**: FastAPI
- **Frontend**: HTML, CSS, JavaScript, Tailwind CSS
- **Database**: PostgreSQL
- **CSV File Handling**: Python (Pandas for data manipulation)

## Installation

### Prerequisites:
- Python 3.7 or higher
- PostgreSQL


### Steps:

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/animshamura/Budget-FullStack.git
   cd Budget-FullStack
   cd backend
   ```

2. **Install Backend Dependencies**:
   - Create a virtual environment:
     ```bash
     python3 -m venv venv
     source venv/bin/activate  # For macOS/Linux
     venv\Scripts\activate  # For Windows
     ```
   - Install FastAPI and dependencies:
     ```bash
     pip install -r requirements.txt
     ```

3. **Set Up PostgreSQL**:
   - Install PostgreSQL and create a database.
   - Update the database connection settings in server.py file. 
   - Give schema privileges to the dedicated user.
    ```bash
    GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA schema_name TO username;
    ```
4. **Run the Backend**:
   - Start the FastAPI server:
     ```bash
     uvicorn server:app --reload
     ```

5. **Frontend Setup**:
   - Move to the frontend folder:
     ```bash
     cd .
     cd frontend
     ```
   - Run the index.html:
     ```bash
     cd pages
     start index.html
     ```

6. **Upload CSV**: 
   - Use the dashboard to upload a CSV file, which will be parsed and pushed to the PostgreSQL database.

## Usage

1. Access the application in your browser at `http://localhost:8000` 
2. Upload a CSV file containing the necessary data (ensure the CSV is formatted correctly).
3. View the data in the dashboard where it is rendered based on the four database tables: SubsidiaryBudget, SectorSpending, Transactions, and Cost Distribution.

## Live Link

[Live Project URL](https://shamura-dashboard.netlify.app)


