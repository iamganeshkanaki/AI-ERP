from django.contrib import admin
from .models import Attendance, LeaveRequest, PayrollRecord, ExpenseClaim

@admin.register(Attendance)
class AttendanceAdmin(admin.ModelAdmin):
    list_display = ('employee', 'date', 'status', 'check_in', 'check_out', 'work_hours')
    list_filter = ('status', 'date')
    search_fields = ('employee__first_name', 'employee__last_name')

@admin.register(LeaveRequest)
class LeaveRequestAdmin(admin.ModelAdmin):
    list_display = ('employee', 'leave_type', 'start_date', 'end_date', 'days_count', 'status')
    list_filter = ('status', 'leave_type')
    search_fields = ('employee__first_name', 'reason')

@admin.register(PayrollRecord)
class PayrollRecordAdmin(admin.ModelAdmin):
    list_display = ('employee', 'month', 'year', 'base_salary', 'net_salary', 'status')
    list_filter = ('year', 'month', 'status')
    search_fields = ('employee__first_name', 'employee__employee_id')

@admin.register(ExpenseClaim)
class ExpenseClaimAdmin(admin.ModelAdmin):
    list_display = ('claim_title', 'employee', 'category', 'amount', 'expense_date', 'status')
    list_filter = ('status', 'category')
    search_fields = ('claim_title', 'employee__first_name')
