from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status

def custom_exception_handler(exc, context):
    response = exception_handler(exc, context)

    if response is not None:
        custom_data = {
            'status': response.status_code,
            'message': 'An error occurred during request processing.',
            'errors': response.data
        }
        if isinstance(response.data, dict) and 'detail' in response.data:
            custom_data['message'] = response.data['detail']
        response.data = custom_data
    else:
        # Unhandled server error
        return Response({
            'status': status.HTTP_500_INTERNAL_SERVER_ERROR,
            'message': str(exc) if hasattr(exc, '__str__') else 'Internal server error',
            'errors': None
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    return response
