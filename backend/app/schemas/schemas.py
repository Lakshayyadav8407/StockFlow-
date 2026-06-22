from pydantic import BaseModel, EmailStr, validator
from typing import Optional, List
from datetime import datetime


# ── Product Schemas ──────────────────────────────────────
class ProductBase(BaseModel):
    name: str
    sku: str
    description: Optional[str] = None
    price: float
    quantity: int
    category: Optional[str] = None

    @validator("price")
    def price_must_be_positive(cls, v):
        if v < 0:
            raise ValueError("Price cannot be negative")
        return v

    @validator("quantity")
    def quantity_must_be_non_negative(cls, v):
        if v < 0:
            raise ValueError("Quantity cannot be negative")
        return v


class ProductCreate(ProductBase):
    pass


class ProductUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    quantity: Optional[int] = None
    category: Optional[str] = None

    @validator("price")
    def price_must_be_positive(cls, v):
        if v is not None and v < 0:
            raise ValueError("Price cannot be negative")
        return v

    @validator("quantity")
    def quantity_must_be_non_negative(cls, v):
        if v is not None and v < 0:
            raise ValueError("Quantity cannot be negative")
        return v


class ProductResponse(ProductBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ── Customer Schemas ─────────────────────────────────────
class CustomerBase(BaseModel):
    full_name: str
    email: str
    phone: Optional[str] = None
    address: Optional[str] = None


class CustomerCreate(CustomerBase):
    pass


class CustomerResponse(CustomerBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


# ── Order Schemas ────────────────────────────────────────
class OrderItemCreate(BaseModel):
    product_id: int
    quantity: int

    @validator("quantity")
    def quantity_must_be_positive(cls, v):
        if v <= 0:
            raise ValueError("Quantity must be greater than 0")
        return v


class OrderItemResponse(BaseModel):
    id: int
    product_id: int
    quantity: int
    unit_price: float
    product: Optional[ProductResponse] = None

    class Config:
        from_attributes = True


class OrderCreate(BaseModel):
    customer_id: int
    items: List[OrderItemCreate]
    notes: Optional[str] = None


class OrderResponse(BaseModel):
    id: int
    customer_id: int
    status: str
    total_amount: float
    notes: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    customer: Optional[CustomerResponse] = None
    items: List[OrderItemResponse] = []

    class Config:
        from_attributes = True


# ── Dashboard Schema ─────────────────────────────────────
class DashboardStats(BaseModel):
    total_products: int
    total_customers: int
    total_orders: int
    low_stock_products: List[ProductResponse]
    total_revenue: float
    pending_orders: int
