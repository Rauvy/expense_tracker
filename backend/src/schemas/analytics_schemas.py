from datetime import date
from decimal import Decimal
from typing import List, Literal

from pydantic import BaseModel

# ────────────── 📦 Types ──────────────

# ────────────── 📦 Base summary ──────────────


class TotalSpent(BaseModel):
    """
    💰 Total spending by periods.
    """

    week: Decimal
    month: Decimal
    year: Decimal


class CategoryStat(BaseModel):
    """
    📊 Spending by categories.
    """

    category: str
    amount: Decimal
    percent: Decimal


class PaymentStat(BaseModel):
    """
    💳 Spending by payment methods.
    """

    method: str
    amount: Decimal
    percent: Decimal


class SummaryResponse(BaseModel):
    """
    📦 Response for /analytics/summary
    """

    total_spent: TotalSpent
    top_categories: List[CategoryStat]
    payment_methods: List[PaymentStat]


# ────────────── 🥧 Pie Chart (CategoryStat can be reused) ──────────────


class PieChartResponse(BaseModel):
    """
    🥧 For pie chart by categories
    """

    data: List[CategoryStat]


# ────────────── 📈 Line Chart ──────────────


class LinePoint(BaseModel):
    """
    📈 Point on the chart (date → amount)
    """

    date: date
    amount: Decimal


class LineChartResponse(BaseModel):
    """
    📈 Response for /analytics/line
    """

    timeframe: Literal["day", "week", "month", "year"]
    data: List[LinePoint]


# ────────────── 📊 Month comparison ──────────────


class MonthComparison(BaseModel):
    """
    🔁 Comparison of previous and current month
    """

    previous_month_total: Decimal
    current_month_total: Decimal
    change_percent: Decimal  # Positive = growth, negative = savings


# ────────────── 🎯 Budget by categories ──────────────


class BudgetCategoryStat(BaseModel):
    """
    🎯 Statistics for one category budget
    """

    category: str
    budget: Decimal
    spent: Decimal
    percent: Decimal


class BudgetOverview(BaseModel):
    """
    All categories with budget and expenses
    """

    categories: List[BudgetCategoryStat]


class IncomeExpenseComparison(BaseModel):
    """
    📊 Comparison of income and expenses for a period
    """

    timeframe: Literal["week", "month", "year"]  # Comparison period
    total_income: Decimal  # Total income amount
    total_expense: Decimal  # Total expense amount
    difference: Decimal  # Difference (income - expenses)
    income_percent: Decimal  # Percentage of income from total
    expense_percent: Decimal  # Percentage of expenses from total
    top_income_categories: List[CategoryStat]  # Top income categories
    top_expense_categories: List[CategoryStat]  # Top expense categories
