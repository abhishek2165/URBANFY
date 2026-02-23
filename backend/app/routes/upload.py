import os
import uuid
import shutil
from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse

router = APIRouter(prefix="/upload", tags=["Upload"])

# Image save folder - frontend public folder
UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "..", "frontend", "public", "images", "products")


@router.post("/image")
async def upload_image(file: UploadFile = File(...)):
    """Upload product image"""

    try:
        # Check file type
        allowed_types = ["image/jpeg", "image/jpg", "image/png", "image/webp"]
        if file.content_type not in allowed_types:
            raise HTTPException(
                status_code=400,
                detail="Only JPG, PNG, WEBP images allowed"
            )

        # Check file size (max 5MB)
        contents = await file.read()
        if len(contents) > 5 * 1024 * 1024:
            raise HTTPException(
                status_code=400,
                detail="Image size must be less than 5MB"
            )

        # Create folder if not exists
        os.makedirs(UPLOAD_DIR, exist_ok=True)

        # Generate unique filename
        ext = file.filename.split(".")[-1].lower()
        unique_name = f"{uuid.uuid4().hex[:12]}.{ext}"
        file_path = os.path.join(UPLOAD_DIR, unique_name)

        # Save file
        with open(file_path, "wb") as f:
            f.write(contents)

        # Return URL path (for frontend use)
        image_url = f"/images/products/{unique_name}"

        return JSONResponse(content={
            "success": True,
            "message": "Image uploaded successfully",
            "image_url": image_url,
            "filename": unique_name
        })

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Upload failed: {str(e)}"
        )


@router.delete("/image/{filename}")
async def delete_image(filename: str):
    """Delete uploaded image"""

    try:
        file_path = os.path.join(UPLOAD_DIR, filename)

        if os.path.exists(file_path):
            os.remove(file_path)
            return {"success": True, "message": "Image deleted"}
        else:
            return {"success": False, "message": "Image not found"}

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Delete failed: {str(e)}"
        )