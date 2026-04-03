from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse

from backend.services.ml_service import predict_from_csv_bytes, get_metrics

router = APIRouter(
    prefix="/predict",
    tags=["Prediction"]
)


@router.post("/")
async def predict_exercise(file: UploadFile = File(...)):
    """
    Upload a MetaMotion sensor CSV file.
    Returns predicted exercise label, confidence score, and rep count.
    """
    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only .csv files are supported.")

    try:
        csv_bytes = await file.read()
        result    = predict_from_csv_bytes(csv_bytes)
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {e}")

    return JSONResponse(content={
        "status":           "success",
        "predicted_label":  result["predicted_label"],
        "confidence":       round(result["confidence"], 4),
        "rep_count":        result["rep_count"],
        "probabilities":    result["probabilities"],
        "rows_analysed":    result["row_count"],
    })


@router.get("/metrics")
async def model_metrics():
    """
    Returns model accuracy, class list, feature count, and confusion matrix.
    """
    try:
        info = get_metrics()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Could not load model info: {e}")

    return JSONResponse(content={
        "status":          "success",
        "accuracy":        info["accuracy"],
        "classes":         info["classes"],
        "feature_count":   info["feature_count"],
        "confusion_matrix": info["confusion_matrix"],
    })
