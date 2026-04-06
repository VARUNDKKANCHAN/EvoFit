from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse

from backend.services.ml_service import predict_from_upload, get_metrics

router = APIRouter(
    prefix="/predict",
    tags=["Prediction"]
)

ALLOWED_EXTENSIONS = {".csv", ".pkl"}


@router.post("/")
async def predict_exercise(file: UploadFile = File(...)):
    """
    Upload a sensor data file (.csv or .pkl).

    The file must contain these columns:
        acc_x, acc_y, acc_z  — accelerometer (m/s² or g)
        gyr_x, gyr_y, gyr_z  — gyroscope (deg/s or rad/s)

    Returns: predicted exercise label, confidence, rep count, probabilities.
    """
    import os
    ext = os.path.splitext(file.filename.lower())[1]

    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type '{ext}'. Upload a .csv or .pkl file."
        )

    try:
        file_bytes = await file.read()
        result = predict_from_upload(file_bytes, file.filename)
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {e}")

    return JSONResponse(content={
        "status":          "success",
        "predicted_label": result["predicted_label"],
        "confidence":      round(result["confidence"], 4),
        "rep_count":       result["rep_count"],
        "probabilities":   result["probabilities"],
        "rows_analysed":   result["row_count"],
        "exercise_breakdown": result.get("exercise_breakdown", []),
        "duration":        result.get("duration", "Unknown"),
        "time_range":      result.get("time_range", "N/A"),
        "overall_consistency": result.get("overall_consistency", "0%"),
        "best_set_summary": result.get("best_set_summary", "N/A"),
    })


@router.get("/metrics")
async def model_metrics():
    """Returns model accuracy, class list, feature count, and confusion matrix."""
    try:
        info = get_metrics()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Could not load model info: {e}")

    return JSONResponse(content={
        "status":           "success",
        "accuracy":         info["accuracy"],
        "classes":          info["classes"],
        "feature_count":    info["feature_count"],
        "confusion_matrix": info["confusion_matrix"],
    })
