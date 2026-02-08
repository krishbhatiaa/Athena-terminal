from fastapi import APIRouter
from app.services.strategy import evaluate_option

router = APIRouter(prefix="/pricing")

@router.post("/evaluate")
def evaluate(option: dict):
    return evaluate_option(option)
