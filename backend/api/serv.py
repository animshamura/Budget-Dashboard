from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime
from sqlalchemy.orm import sessionmaker, declarative_base, Session
from datetime import datetime, timedelta
import jwt
from sqlalchemy.orm import Session
import secrets
from passlib.context import CryptContext
import os
import pandas as pd

# Database setup
DATABASE_URL = "postgresql://budget_user:1234@localhost/bud"
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# JWT settings
SECRET_KEY =  secrets.token_hex(32)
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# FastAPI App
app = FastAPI()

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# CORS middleware setup
from fastapi.middleware.cors import CORSMiddleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Database Models
class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, nullable=False)
    password = Column(String, nullable=False)  # Hashed password
    role = Column(String, nullable=False)  # roles could be 'admin', 'manager', 'employee'

class SubsidiaryBudget(Base):
    __tablename__ = "subsidiary_budgets"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)
    allocated_budget = Column(Float, nullable=False)
    used_budget = Column(Float, default=0.0)
    remaining_budget = Column(Float, nullable=False)

class Transaction(Base):
    __tablename__ = "transactions"
    id = Column(Integer, primary_key=True, index=True)
    t_id = Column(String, nullable=False)
    amount = Column(Float, nullable=False)
    date = Column(DateTime, nullable=False)
    subsidiary_id = Column(String, nullable=False)
    sector = Column(String, nullable=False)
    user_id = Column(String, nullable=False)

class SectorSpending(Base):
    __tablename__ = "sector_spendings"
    id = Column(Integer, primary_key=True, index=True)
    sector = Column(String, unique=True, nullable=False)
    allocated_budget = Column(Float, nullable=False)
    remaining_budget = Column(Float, nullable=False)
    total_spent = Column(Float, nullable=False)
class Transaction(Base):
    __tablename__ = "transactions"
    id = Column(Integer, primary_key=True, index=True)
    t_id = Column(String, nullable=False)
    amount = Column(Float, nullable=False)
    date = Column(DateTime, nullable=False)
    subsidiary_id = Column(String, nullable=False)
    sector = Column(String, nullable=False)
    user_id = Column(String, nullable=False)

# Pydantic Models
class TransactionBase(BaseModel):
    t_id: str
    amount: float
    date: datetime
    subsidiary_id: str
    sector: str
    user_id: str

class TransactionCreate(TransactionBase):
    pass

class TransactionOut(TransactionBase):
    id: int

    class Config:
        orm_mode = True
        
# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# User Authentication Helper Functions
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: timedelta = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)):
    to_encode = data.copy()
    expire = datetime.utcnow() + expires_delta
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

# Role Checking Dependency
def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise HTTPException(status_code=401, detail="Could not validate credentials")
        user = db.query(User).filter(User.username == username).first()
        if user is None:
            raise HTTPException(status_code=401, detail="Could not validate credentials")
        return user
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Could not validate credentials")

def role_required(required_role: str):
    def role_dependency(user: User = Depends(get_current_user)):
        if user.role != required_role:
            raise HTTPException(status_code=403, detail="Insufficient permissions")
        return user
    return role_dependency

# Routes
@app.post("/token")
def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends()):
    db = SessionLocal()
    user = db.query(User).filter(User.username == form_data.username).first()
    if user is None or not verify_password(form_data.password, user.password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    access_token = create_access_token(data={"sub": user.username})
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/subsidiaries/")
def get_subsidiaries(db: Session = Depends(get_db), user: User = Depends(role_required("admin"))):
    return db.query(SubsidiaryBudget).all()

@app.get("/transactions/", response_model=List[TransactionOut])
def get_transactions(skip: int = 0, limit: int = 10, db: Session = Depends(get_db)):
    transactions = db.query(Transaction).offset(skip).limit(limit).all()
    return transactions

@app.post("/transactions/", response_model=TransactionOut)
def create_transaction(transaction: TransactionCreate, db: Session = Depends(get_db)):
    db_transaction = Transaction(**transaction.dict())
    db.add(db_transaction)
    db.commit()
    db.refresh(db_transaction)
    return db_transaction
@app.get("/sector_spendings/")
def get_sector_spendings(db: Session = Depends(get_db), user: User = Depends(role_required("employee"))):
    return db.query(SectorSpending).all()

# Utility to load data from CSV (Same as before)
def load_data_from_csv(db: Session):
    file_path = "budget_data.csv"
    if not os.path.exists(file_path):
        print("⚠️ CSV file not found. Skipping data load.")
        return

    df = pd.read_csv(file_path)
    print("CSV Columns:", df.columns.tolist())
    print("First 5 Rows:\n", df.head())
    
    transactions = [
        Transaction(
            t_id=row["Transaction_ID"].strip(),
            amount=row["Spent_Amount"],
            date=datetime.strptime(row["Date"], "%Y-%m-%d"),
            subsidiary_id=row["Subsidiary"].strip(),
            sector=row["Sector"].strip(),
            user_id=row["User_ID"].strip()
        )
        for _, row in df.iterrows()
    ]
    db.bulk_save_objects(transactions)
    db.commit()

    for _, row in df.groupby("Subsidiary").sum().reset_index().iterrows():
        existing_budget = db.query(SubsidiaryBudget).filter_by(name=row['Subsidiary']).first()
        if not existing_budget:
            subsidiary = SubsidiaryBudget(
                name=row["Subsidiary"].strip(),
                allocated_budget=row["Allocated_Budget"],
                used_budget=row["Spent_Amount"],
                remaining_budget=row["Remaining_Budget"]
            )
            db.add(subsidiary)
    db.commit()

    for _, row in df.groupby("Sector").sum().reset_index().iterrows():
        existing_sector = db.query(SectorSpending).filter_by(sector=row['Sector']).first()
        if not existing_sector:
            sector_spending = SectorSpending(
                sector=row["Sector"].strip(),
                allocated_budget=row["Allocated_Budget"],
                remaining_budget=row["Remaining_Budget"],
                total_spent=row["Spent_Amount"]
            )
            db.add(sector_spending)
    
    db.commit()
    print("✅ Data successfully loaded into database!")
def add_default_users(db: Session):
    # Check if users already exist
    users = db.query(User).all()
    if not users:
        # Create default users with hashed passwords
        password_hash = pwd_context.hash("password123")  # Default password for all users
        admin = User(username="adm", password=password_hash, role="admin")
        manager = User(username="man", password=password_hash, role="manager")
        employee = User(username="emp", password=password_hash, role="employee")
        
        # Add the users to the session and commit
        db.add_all([admin, manager, employee])
        db.commit()
        print("✅ Default users added to the database!")
    else:
        print("⚠️ Users already exist in the database, skipping user insertion.")
        
# Initialize Database
Base.metadata.create_all(bind=engine)
db_session = SessionLocal()
print("📥 Loading data from CSV...")
load_data_from_csv(db_session)
add_default_users(db_session)
db_session.close()
print("✅ Initialization complete!")
