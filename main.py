from fastapi import FastAPI

app = FastAPI()

@app.get("/health_check")
def root():
    return {"Health": "running done with healthcheck endpoint"}
