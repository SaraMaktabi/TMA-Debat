from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="SMA Incident Management")

# CORS (frontend React)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # plus tard limiter
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"message": "API SMA is running"}