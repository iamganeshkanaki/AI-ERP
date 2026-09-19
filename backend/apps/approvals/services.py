from django.db import transaction
from django.core.exceptions import ValidationError
from .models import ApprovalRequest, ApprovalAction

class ApprovalService:
    @staticmethod
    @transaction.atomic
    def process_decision(request_id, approver_user, action: str, comments=''):
        req = ApprovalRequest.objects.select_for_update().get(id=request_id)
        if req.status != 'Pending':
            raise ValidationError(f"Request is already finalized ({req.status}).")

        # Record action
        ApprovalAction.objects.create(
            approval_request=req,
            step_number=req.current_step,
            approver=approver_user,
            action=action,
            comments=comments
        )

        if action == 'Rejected':
            req.status = 'Rejected'
            req.save(update_fields=['status'])
            return req

        # If approved
        if req.current_step >= req.required_steps:
            req.status = 'Approved'
        else:
            req.current_step += 1
        req.save(update_fields=['status', 'current_step'])
        return req
