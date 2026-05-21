from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Dict, Any

from backend.database.database import get_db
from backend.services import auth_service
from backend.database import models
from backend.services.cohort_service import get_dynamic_cohort_stats

router = APIRouter(
    prefix="/cohort",
    tags=["Cohort Benchmarking"]
)

def generate_coaching_insights(scoring_matrix: Dict[str, Dict[str, Any]], user_stats: Dict[str, Dict[str, Any]]) -> Dict[str, str]:
    """Generates dynamic coaching suggestions based on the user's actual grades. No device or physical connection mentions."""
    exercises = ['bench', 'squat', 'ohp', 'dead', 'row']
    labels = {
        "bench": "Bench Press",
        "squat": "Squat",
        "ohp": "Overhead Press",
        "dead": "Deadlift",
        "row": "Barbell Row"
    }
    
    insights = {}
    
    for ex in exercises:
        ex_label = labels[ex]
        u_stats = user_stats.get(ex, {})
        
        # Check if actual data exists
        if not u_stats.get("has_data", False):
            insights[ex] = f"No actual training logs recorded yet for {ex_label}. Head to the 'Upload & Predict' page to load a CSV file and unlock your dynamic scoring delta overlays!"
            continue
            
        ex_scores = scoring_matrix.get(ex, {})
        
        # Determine strengths and weaknesses dynamically
        metrics = ["power", "stability", "consistency", "form"]
        deltas = {m: ex_scores.get(m, {}).get("delta", 0.0) for m in metrics}
        
        best_metric = max(deltas, key=deltas.get)
        worst_metric = min(deltas, key=deltas.get)
        
        best_grade = ex_scores.get(best_metric, {}).get("grade_info", {}).get("grade", "Proficient")
        worst_grade = ex_scores.get(worst_metric, {}).get("grade_info", {}).get("grade", "Proficient")
        
        best_label = best_metric.replace("_", " ").title()
        worst_label = worst_metric.replace("_", " ").title()
        
        insight_parts = []
        
        # Dynamic feedback for the best metric
        if deltas[best_metric] >= 5.0:
            insight_parts.append(f"Incredible! Your {best_label} score is graded '{best_grade}', outperforming the community average by +{deltas[best_metric]}%. Keep leveraging this mechanical advantage.")
        else:
            insight_parts.append(f"Your {best_label} score is highly proficient and paces steadily alongside the community standard.")
            
        # Dynamic feedback for the weakest metric
        if deltas[worst_metric] < -3.0:
            if worst_metric == "stability":
                insight_parts.append(f"To raise your {worst_label} (currently '{worst_grade}' at {deltas[worst_metric]}% below average), concentrate on a slower, steadier path to eliminate rotational movement wobble.")
            elif worst_metric == "power":
                insight_parts.append(f"To improve your concentric {worst_label} (currently {deltas[worst_metric]}% below average), prioritize explosive acceleration during the vertical drive phase.")
            elif worst_metric == "consistency":
                insight_parts.append(f"Your temporal pacing variance is slightly high ({deltas[worst_metric]}% below average). Try to keep your concentric-to-eccentric timing identical on every set.")
            else:
                insight_parts.append(f"Work on standardizing your mechanical form to bring your {worst_label} score up to the community benchmark.")
        else:
            insight_parts.append(f"Your overall execution is remarkably balanced across all physical dimensions. Excellent mechanical baseline!")
            
        insights[ex] = " ".join(insight_parts)
        
    return insights

@router.get("/comparison")
def get_cohort_comparison(
    current_user: models.User = Depends(auth_service.get_current_user),
    db: Session = Depends(get_db)
):
    """
    Returns comparative community metrics:
    - user_stats: the active user's stats
    - community_avg: the average of all other users in the platform
    - scoring_matrix: dynamic scoring breakdowns, fitness grades, and delta percentages
    - other_profiles: dynamic athlete records for side-by-side matrices
    - metadata: names and descriptions for all other athletes
    - coaching_insights: dynamically compiled coach critiques
    - username: user identification handle
    """
    stats = get_dynamic_cohort_stats(db, current_user.id)
    coaching_insights = generate_coaching_insights(stats["scoring_matrix"], stats["user_stats"])
    
    return {
        "user_stats": stats["user_stats"],
        "community_avg": stats["community_avg"],
        "scoring_matrix": stats["scoring_matrix"],
        "other_profiles": stats["other_profiles"],
        "metadata": stats["metadata"],
        "coaching_insights": coaching_insights,
        "username": stats["username"]
    }
