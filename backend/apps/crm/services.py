from django.db import transaction
from django.db.models import Sum, F
from .models import Customer, Lead, Opportunity

class CRMService:
    @staticmethod
    @transaction.atomic
    def convert_lead_to_customer(lead_id, customer_code=None):
        lead = Lead.objects.select_for_update().get(id=lead_id)
        if lead.status == 'Converted' and lead.converted_customer:
            return lead.converted_customer

        code = customer_code or f"CUST-{lead_id.hex[:6].upper()}"
        customer = Customer.objects.create(
            customer_code=code,
            name=lead.company_name or lead.name,
            contact_person=lead.name,
            email=lead.email,
            phone=lead.phone,
            account_manager=lead.assigned_to,
            status='Active'
        )
        lead.status = 'Converted'
        lead.converted_customer = customer
        lead.save()
        return customer

    @staticmethod
    def get_pipeline_metrics():
        total_pipeline = Opportunity.objects.exclude(stage__in=['Won', 'Lost']).aggregate(
            total=Sum('expected_revenue')
        )['total'] or 0.0

        opportunities = Opportunity.objects.exclude(stage__in=['Won', 'Lost'])
        weighted_total = sum(float(opp.weighted_revenue) for opp in opportunities)

        won_count = Opportunity.objects.filter(stage='Won').count()
        total_closed = Opportunity.objects.filter(stage__in=['Won', 'Lost']).count()
        win_rate = (won_count / total_closed * 100) if total_closed > 0 else 0.0

        return {
            'total_pipeline': total_pipeline,
            'weighted_total': weighted_total,
            'win_rate_percent': round(win_rate, 2),
            'active_deals_count': opportunities.count(),
        }
