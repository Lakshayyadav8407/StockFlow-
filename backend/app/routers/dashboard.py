from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.core.database import get_db
from app.models.models import Product, Customer, Order
from app.schemas.schemas import DashboardStats

router = APIRouter()

LOW_STOCK_THRESHOLD = 10

@router.get("", response_model=DashboardStats)
def get_dashboard(db: Session = Depends(get_db)):
    total_products = db.query(Product).count()
    total_customers = db.query(Customer).count()
    total_orders = db.query(Order).count()
    low_stock = db.query(Product).filter(Product.quantity <= LOW_STOCK_THRESHOLD).all()
    total_revenue = db.query(func.sum(Order.total_amount)).scalar() or 0.0
    pending_orders = db.query(Order).filter(Order.status == "pending").count()

    return DashboardStats(
        total_products=total_products,
        total_customers=total_customers,
        total_orders=total_orders,
        low_stock_products=low_stock,
        total_revenue=round(total_revenue, 2),
        pending_orders=pending_orders
    )
