from decimal import Decimal
from django.core.management.base import BaseCommand
from django.utils import timezone
from apps.users.models import User, Company, Branch, Department, Employee
from apps.crm.models import Customer, Lead, Opportunity
from apps.purchase.models import Vendor, PurchaseOrder, PurchaseOrderItem
from apps.inventory.models import ProductCategory, Product, Warehouse, Stock, StockMovement
from apps.sales.models import SalesOrder, SalesOrderItem
from apps.finance.models import ChartOfAccounts, Invoice, InvoiceItem, Payment
from apps.approvals.models import ApprovalRequest
from apps.notifications.models import Notification

class Command(BaseCommand):
    help = 'Seeds initial enterprise demo data for Nexus AI ERP'

    def handle(self, *args, **options):
        self.stdout.write(self.style.NOTICE("Seeding Nexus AI ERP master data..."))

        # 1. Company, Branch & Departments
        company, _ = Company.objects.get_or_create(
            code="APX",
            defaults={
                "name": "Apex Globals Corporation",
                "tax_identifier": "GSTIN27AAACA0000A1Z5",
                "currency": "INR",
                "primary_email": "operations@apexglobals.com"
            }
        )

        branch_hq, _ = Branch.objects.get_or_create(
            company=company, code="HQ-MUM",
            defaults={"name": "Mumbai Corporate Tower", "location": "BKC, Mumbai"}
        )
        branch_plant, _ = Branch.objects.get_or_create(
            company=company, code="PLT-PUN",
            defaults={"name": "Pune Advanced Manufacturing Facility", "location": "Chakan MIDC, Pune"}
        )

        dept_sales, _ = Department.objects.get_or_create(branch=branch_hq, code="SALES", defaults={"name": "Sales & Accounts"})
        dept_proc, _ = Department.objects.get_or_create(branch=branch_plant, code="PROC", defaults={"name": "Procurement & Supply"})
        dept_inv, _ = Department.objects.get_or_create(branch=branch_plant, code="INV", defaults={"name": "Inventory & Logistics"})
        dept_fin, _ = Department.objects.get_or_create(branch=branch_hq, code="FIN", defaults={"name": "Finance & Taxation"})
        dept_hr, _ = Department.objects.get_or_create(branch=branch_hq, code="HR", defaults={"name": "Human Resources"})

        # 2. Users
        admin_user, _ = User.objects.get_or_create(
            email="admin@apexglobals.com",
            defaults={"first_name": "Ganesh", "last_name": "Kanaki", "role": "Admin", "is_staff": True, "is_superuser": True}
        )
        if not admin_user.has_usable_password():
            admin_user.set_password("AdminPass123!")
            admin_user.save()

        exec_user, _ = User.objects.get_or_create(
            email="executive@apexglobals.com",
            defaults={"first_name": "Vikram", "last_name": "Malhotra", "role": "Executive", "is_staff": True}
        )
        if not exec_user.has_usable_password():
            exec_user.set_password("ExecPass123!")
            exec_user.save()

        sales_user, _ = User.objects.get_or_create(
            email="sales@apexglobals.com",
            defaults={"first_name": "Pooja", "last_name": "Sharma", "role": "Sales"}
        )
        if not sales_user.has_usable_password():
            sales_user.set_password("SalesPass123!")
            sales_user.save()

        proc_user, _ = User.objects.get_or_create(
            email="purchase@apexglobals.com",
            defaults={"first_name": "Rohan", "last_name": "Deshmukh", "role": "Purchase"}
        )
        if not proc_user.has_usable_password():
            proc_user.set_password("PurchasePass123!")
            proc_user.save()

        # 3. Chart of Accounts
        coa_defs = [
            ("1010", "HDFC Operating Bank Account", "Asset"),
            ("1200", "Accounts Receivable", "Asset"),
            ("1400", "Inventory Asset", "Asset"),
            ("2000", "Accounts Payable", "Liability"),
            ("4000", "Sales & Services Revenue", "Revenue"),
            ("5000", "Cost of Goods Sold", "Expense"),
            ("6000", "Operating Expenses", "Expense"),
        ]
        for code, name, acct_type in coa_defs:
            ChartOfAccounts.objects.get_or_create(code=code, defaults={"name": name, "account_type": acct_type})

        # 4. Product Categories & Products
        cat_auto, _ = ProductCategory.objects.get_or_create(code="AUTO", defaults={"name": "Automotive Assemblies"})
        cat_elec, _ = ProductCategory.objects.get_or_create(code="ELEC", defaults={"name": "Industrial Automation"})

        prod_1, _ = Product.objects.get_or_create(
            sku="SKU-HYD-500",
            defaults={
                "name": "High-Pressure Hydraulic Pump 500BAR",
                "category": cat_auto,
                "unit": "Nos",
                "unit_price": Decimal("45000.00"),
                "cost_price": Decimal("32000.00"),
                "reorder_level": Decimal("15.00"),
                "safety_stock": Decimal("5.00"),
                "hsn_sac_code": "841360"
            }
        )
        prod_2, _ = Product.objects.get_or_create(
            sku="SKU-PLC-400",
            defaults={
                "name": "Programmable Logic Controller Unit 400",
                "category": cat_elec,
                "unit": "Nos",
                "unit_price": Decimal("18500.00"),
                "cost_price": Decimal("12000.00"),
                "reorder_level": Decimal("25.00"),
                "safety_stock": Decimal("10.00"),
                "hsn_sac_code": "853710"
            }
        )

        # 5. Warehouses & Stock
        wh_main, _ = Warehouse.objects.get_or_create(
            code="WH-PUN-01",
            defaults={"name": "Pune Central Spares Depot", "branch": branch_plant, "location": "Chakan Block A"}
        )
        wh_aux, _ = Warehouse.objects.get_or_create(
            code="WH-MUM-01",
            defaults={"name": "Mumbai Logistics Terminal", "branch": branch_hq, "location": "Bhiwandi"}
        )

        s1, _ = Stock.objects.get_or_create(product=prod_1, warehouse=wh_main, defaults={"quantity": Decimal("8.00")}) # Low stock!
        s2, _ = Stock.objects.get_or_create(product=prod_2, warehouse=wh_main, defaults={"quantity": Decimal("40.00")})

        # 6. Customers & Vendors
        cust_1, _ = Customer.objects.get_or_create(
            customer_code="CUST-IND-001",
            defaults={
                "name": "Mahindra Power Systems Ltd",
                "contact_person": "Rajesh Nair",
                "email": "procurement@mahindrapower.com",
                "credit_limit": Decimal("1500000.00"),
                "current_balance": Decimal("345000.00"),
                "account_manager": sales_user
            }
        )
        cust_2, _ = Customer.objects.get_or_create(
            customer_code="CUST-IND-002",
            defaults={
                "name": "Tata Advanced Dynamics Ltd",
                "contact_person": "Sunita Patil",
                "email": "sp@tatadynamics.com",
                "credit_limit": Decimal("2000000.00"),
                "current_balance": Decimal("180000.00"),
                "account_manager": sales_user
            }
        )

        vnd_1, _ = Vendor.objects.get_or_create(
            vendor_code="VND-SUP-001",
            defaults={
                "name": "Bosch Rexroth Industrial Ltd",
                "contact_person": "Amit Kulkarni",
                "email": "orders@boschrexroth-india.com",
                "payment_terms_days": 45,
                "rating": Decimal("4.8")
            }
        )

        # 7. Approvals for Action Center
        ApprovalRequest.objects.get_or_create(
            reference_title="Purchase Order PO-2026-8801 - CNC Machining Center",
            defaults={
                "module": "Purchase",
                "amount": Decimal("480000.00"),
                "requested_by": proc_user,
                "status": "Pending",
                "current_step": 1,
                "required_steps": 2
            }
        )
        ApprovalRequest.objects.get_or_create(
            reference_title="Credit Limit Breach: Tata Dynamics SO-2026-114",
            defaults={
                "module": "Sales",
                "amount": Decimal("2250000.00"),
                "requested_by": sales_user,
                "status": "Pending",
                "current_step": 1,
                "required_steps": 1
            }
        )

        self.stdout.write(self.style.SUCCESS("Master and demo data successfully seeded!"))
