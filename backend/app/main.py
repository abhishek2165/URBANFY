from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from app.config import settings

# Import routes
from app.routes.auth import router as auth_router
from app.routes.categories import router as categories_router
from app.routes.products import router as products_router
from app.routes.cart import router as cart_router
from app.routes.orders import router as orders_router
from app.routes.reviews import router as reviews_router
from app.routes.admin import router as admin_router
from app.routes.upload import router as upload_router
from app.routes import payment
from app.routes import coupon
# from app.routes import test_sms   ⬅️ COMMENT OUT kar

# Create FastAPI app
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="URBUNFY - Premium Perfume Store API",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        settings.FRONTEND_URL,
        settings.ADMIN_URL,
        "http://localhost:3000",
        "http://localhost:3001",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============================================
# REGISTER ALL ROUTES
# ============================================
app.include_router(auth_router)
app.include_router(categories_router)
app.include_router(products_router)
app.include_router(cart_router)
app.include_router(orders_router)
app.include_router(reviews_router)
app.include_router(admin_router)
app.include_router(upload_router)
app.include_router(payment.router)
app.include_router(coupon.router)
# app.include_router(test_sms.router)   ⬅️ COMMENT OUT kar


@app.on_event("startup")
async def startup():
    print("=" * 50)
    print(f"  🚀 {settings.APP_NAME} API Server Starting...")
    print(f"  📦 Version: {settings.APP_VERSION}")
    print(f"  🗄️  Database: {settings.DB_NAME}")
    print(f"  📖 Docs: http://localhost:{settings.PORT}/docs")
    print("=" * 50)


@app.on_event("shutdown")
async def shutdown():
    print(f"\n🛑 {settings.APP_NAME} API Server Stopped.\n")


@app.get("/", tags=["Root"])
async def root():
    return {
        "name": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "message": "Welcome to URBUNFY - Premium Perfume Store API",
        "docs": "/docs",
        "year": 2026
    }


@app.get("/health", tags=["Root"])
async def health_check():
    try:
        from app.database import SessionLocal
        db = SessionLocal()
        db.execute(text("SELECT 1"))
        db.close()
        db_status = "connected"
    except Exception as e:
        db_status = f"error: {str(e)}"

    return {
        "status": "healthy",
        "app": settings.APP_NAME,
        "database": db_status
    }


@app.get("/api/info", tags=["Root"])
async def api_info():
    return {
        "app": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "copyright": "© 2026 URBUNFY",
        "endpoints": {
            "auth": "/auth",
            "products": "/products",
            "categories": "/categories",
            "cart": "/cart",
            "orders": "/orders",
            "reviews": "/reviews",
            "admin": "/admin"
        }
    }