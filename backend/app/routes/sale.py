from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import desc
from datetime import datetime
import re
from app.database import get_db
from app.models.sale import Sale, SaleProduct
from app.models.product import Product
from app.schemas.sale import (
    SaleCreate, SaleUpdate, SaleResponse,
    SaleProductResponse, SaleListResponse
)
from app.middleware.auth_middleware import get_current_admin

router = APIRouter(prefix="/sales", tags=["Sales"])


def build_sale_response(sale):
    products = []
    for sp in sale.products:
        p = sp.product
        if p:
            products.append(SaleProductResponse(
                id=p.id,
                name=p.name,
                slug=p.slug,
                price=float(p.price),
                discount_price=float(p.discount_price) if p.discount_price else None,
                image_url=p.image_url,
                brand=p.brand
            ))

    return SaleResponse(
        id=sale.id,
        name=sale.name,
        slug=sale.slug,
        description=sale.description,
        banner_image=sale.banner_image,
        discount_type=sale.discount_type,
        discount_value=float(sale.discount_value),
        start_date=sale.start_date,
        end_date=sale.end_date,
        is_active=sale.is_active,
        products=products,
        created_at=sale.created_at
    )


# GET ACTIVE SALES (Public)
@router.get("/active", response_model=SaleListResponse)
async def get_active_sales(db: Session = Depends(get_db)):
    now = datetime.now()
    sales = db.query(Sale).filter(
        Sale.is_active == True,
        Sale.start_date <= now,
        Sale.end_date >= now
    ).order_by(desc(Sale.created_at)).all()

    return SaleListResponse(
        success=True,
        total=len(sales),
        sales=[build_sale_response(s) for s in sales]
    )


# GET ALL SALES (Admin)
@router.get("/admin/all", response_model=SaleListResponse)
async def get_all_sales(
    admin=Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    sales = db.query(Sale).order_by(desc(Sale.created_at)).all()
    return SaleListResponse(
        success=True,
        total=len(sales),
        sales=[build_sale_response(s) for s in sales]
    )


# CREATE SALE (Admin)
@router.post("/admin/create", response_model=SaleResponse)
async def create_sale(
    data: SaleCreate,
    admin=Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    try:
        slug = re.sub(r'[^a-z0-9]+', '-', data.name.lower()).strip('-')

        existing = db.query(Sale).filter(Sale.slug == slug).first()
        if existing:
            slug = f"{slug}-{int(datetime.now().timestamp())}"

        sale = Sale(
            name=data.name,
            slug=slug,
            description=data.description,
            banner_image=data.banner_image,
            discount_type=data.discount_type,
            discount_value=data.discount_value,
            start_date=data.start_date,
            end_date=data.end_date,
            is_active=True
        )
        db.add(sale)
        db.flush()

        for pid in data.product_ids:
            product = db.query(Product).filter(Product.id == pid).first()
            if product:
                sp = SaleProduct(sale_id=sale.id, product_id=pid)
                db.add(sp)

        db.commit()
        db.refresh(sale)
        return build_sale_response(sale)

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed: {str(e)}")


# UPDATE SALE (Admin)
@router.put("/admin/{sale_id}", response_model=SaleResponse)
async def update_sale(
    sale_id: int,
    data: SaleUpdate,
    admin=Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    try:
        sale = db.query(Sale).filter(Sale.id == sale_id).first()
        if not sale:
            raise HTTPException(status_code=404, detail="Sale not found")

        if data.name is not None: sale.name = data.name
        if data.description is not None: sale.description = data.description
        if data.banner_image is not None: sale.banner_image = data.banner_image
        if data.discount_type is not None: sale.discount_type = data.discount_type
        if data.discount_value is not None: sale.discount_value = data.discount_value
        if data.start_date is not None: sale.start_date = data.start_date
        if data.end_date is not None: sale.end_date = data.end_date
        if data.is_active is not None: sale.is_active = data.is_active

        if data.product_ids is not None:
            db.query(SaleProduct).filter(SaleProduct.sale_id == sale.id).delete()
            for pid in data.product_ids:
                sp = SaleProduct(sale_id=sale.id, product_id=pid)
                db.add(sp)

        db.commit()
        db.refresh(sale)
        return build_sale_response(sale)

    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed: {str(e)}")


# DELETE SALE (Admin)
@router.delete("/admin/{sale_id}")
async def delete_sale(
    sale_id: int,
    admin=Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    sale = db.query(Sale).filter(Sale.id == sale_id).first()
    if not sale:
        raise HTTPException(status_code=404, detail="Sale not found")

    db.delete(sale)
    db.commit()
    return {"success": True, "message": "Sale deleted"}