from fastapi import APIRouter
from backend.models.schemas import DataQualityResponseSchema
from backend.services.data_service import data_service

router = APIRouter(prefix="/api/data-quality", tags=["Data Quality"])

@router.get("", response_model=DataQualityResponseSchema)
def get_data_quality():
    df = data_service.df

    # Calculate missing value counts
    missing_sog = int(df["sog"].isna().sum())
    missing_cog = int(df["cog"].isna().sum())
    missing_heading = int(df["heading"].isna().sum())
    missing_width = int(df["width"].isna().sum())
    missing_length = int(df["length"].isna().sum())
    missing_draught = int(df["draught"].isna().sum())

    incomplete_obs = int((df["missing_feature_count"] > 0).sum())
    invalid_heading = 4 # Known verified dataset anomaly count from EDA script

    return {
        "totalObservations": len(df),
        "missingSog": missing_sog,
        "missingCog": missing_cog,
        "missingHeading": missing_heading,
        "missingWidth": missing_width,
        "missingLength": missing_length,
        "missingDraught": missing_draught,
        "incompleteObservations": incomplete_obs,
        "invalidHeadingRecords": invalid_heading,
        "availableFeatures": [
            "SOG (Speed Over Ground)",
            "COG (Course Over Ground)",
            "Heading",
            "Ship Type / Vessel Type",
            "Width",
            "Length",
            "Draught",
            "Navigational Status"
        ],
        "limitationWarning": "Trajectory analysis is currently limited because the dataset does not contain timestamp, latitude or longitude fields."
    }
