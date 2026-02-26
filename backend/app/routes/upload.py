import os
import uuid
import cloudinary
import cloudinary.uploader
from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse

router = APIRouter(prefix="/upload", tags=["Upload"])

# Cloudinary Configuration
cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME", "dguecshia"),
    api_key=os.getenv("CLOUDINARY_API_KEY", "756113911725127"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET", "L6d0Ws-9HX7tGpEk4xN8m3Zn-j0"),
    secure=True
)


@router.post("/image")
async def upload_image(file: UploadFile = File(...)):
    """Upload product image to Cloudinary"""

    try:
        # Check file type
        allowed_types = ["image/jpeg", "image/jpg", "image/png", "image/webp"]
        if file.content_type not in allowed_types:
            raise HTTPException(
                status_code=400,
                detail="Only JPG, PNG, WEBP images allowed"
            )

        # Read file
        contents = await file.read()

        # Check file size (max 5MB)
        if len(contents) > 5 * 1024 * 1024:
            raise HTTPException(
                status_code=400,
                detail="Image size must be less than 5MB"
            )

        # Generate unique filename
        unique_name = f"urbanfy_{uuid.uuid4().hex[:12]}"

        # Upload to Cloudinary
        import io
        result = cloudinary.uploader.upload(
            io.BytesIO(contents),
            public_id=unique_name,
            folder="urbanfy/products",
            resource_type="image",
            transformation=[
                {"quality": "auto:good"},
                {"fetch_format": "auto"}
            ]
        )

        # Get the URL
        image_url = result["secure_url"]

        print(f"[CLOUDINARY] Image uploaded: {image_url}")

        return JSONResponse(content={
            "success": True,
            "message": "Image uploaded successfully",
            "image_url": image_url,
            "filename": result["public_id"],
            "cloudinary_id": result["public_id"]
        })

    except HTTPException:
        raise
    except Exception as e:
        print(f"[UPLOAD ERROR] {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Upload failed: {str(e)}"
        )


@router.delete("/image/{filename}")
async def delete_image(filename: str):
    """Delete image from Cloudinary"""

    try:
        # Try to delete from Cloudinary
        result = cloudinary.uploader.destroy(f"urbanfy/products/{filename}")

        if result.get("result") == "ok":
            return {"success": True, "message": "Image deleted from Cloudinary"}
        else:
            return {"success": False, "message": "Image not found on Cloudinary"}

    except Exception as e:
        print(f"[DELETE ERROR] {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Delete failed: {str(e)}"
        )


@router.post("/multiple")
async def upload_multiple_images(files: list[UploadFile] = File(...)):
    """Upload multiple images to Cloudinary"""

    try:
        uploaded = []

        for file in files:
            # Check type
            if file.content_type not in ["image/jpeg", "image/jpg", "image/png", "image/webp"]:
                continue

            contents = await file.read()

            # Check size
            if len(contents) > 5 * 1024 * 1024:
                continue

            unique_name = f"urbanfy_{uuid.uuid4().hex[:12]}"

            import io
            result = cloudinary.uploader.upload(
                io.BytesIO(contents),
                public_id=unique_name,
                folder="urbanfy/products",
                resource_type="image",
                transformation=[
                    {"quality": "auto:good"},
                    {"fetch_format": "auto"}
                ]
            )

            uploaded.append({
                "image_url": result["secure_url"],
                "filename": result["public_id"]
            })

        return JSONResponse(content={
            "success": True,
            "message": f"{len(uploaded)} images uploaded",
            "images": uploaded
        })

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Upload failed: {str(e)}"
        )