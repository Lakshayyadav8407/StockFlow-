from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.models.models import Product, Customer, Order, OrderItem
from app.schemas.schemas import OrderCreate, OrderResponse

router = APIRouter()


@router.post("", response_model=OrderResponse, status_code=status.HTTP_201_CREATED)
def create_order(order_data: OrderCreate, db: Session = Depends(get_db)):
    customer = db.query(Customer).filter(Customer.id == order_data.customer_id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")

    # Validate all products and stock
    for item in order_data.items:
        product = db.query(Product).filter(Product.id == item.product_id).first()
        if not product:
            raise HTTPException(status_code=404, detail=f"Product ID {item.product_id} not found")
        if product.quantity < item.quantity:
            raise HTTPException(
                status_code=400,
                detail=f"Insufficient stock for '{product.name}'. Available: {product.quantity}, Requested: {item.quantity}"
            )

    # Create order
    db_order = Order(
        customer_id=order_data.customer_id,
        notes=order_data.notes,
        status="pending"
    )
    db.add(db_order)
    db.flush()

    total = 0.0
    for item in order_data.items:
        product = db.query(Product).filter(Product.id == item.product_id).first()
        subtotal = product.price * item.quantity
        total += subtotal

        order_item = OrderItem(
            order_id=db_order.id,
            product_id=item.product_id,
            quantity=item.quantity,
            unit_price=product.price
        )
        db.add(order_item)

        # Deduct stock
        product.quantity -= item.quantity

    db_order.total_amount = round(total, 2)
    db.commit()
    db.refresh(db_order)
    return db_order


@router.get("", response_model=List[OrderResponse])
def get_orders(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(Order).offset(skip).limit(limit).all()


@router.get("/{order_id}", response_model=OrderResponse)
def get_order(order_id: int, db: Session = Depends(get_db)):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order


@router.delete("/{order_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_order(order_id: int, db: Session = Depends(get_db)):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    # Restore stock
    for item in order.items:
        product = db.query(Product).filter(Product.id == item.product_id).first()
        if product:
            product.quantity += item.quantity

    db.delete(order)
    db.commit()
