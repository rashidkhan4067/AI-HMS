from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status

def custom_exception_handler(exc, context):
    """
    Custom exception handler to standardize API error responses.
    """
    response = exception_handler(exc, context)

    if response is not None:
        # Standardize the structure of error responses
        custom_data = {
            'error': True,
            'detail': response.data.get('detail', 'An error occurred.') if isinstance(response.data, dict) else 'Validation Error',
        }
        
        # If it's a validation error, include the fields
        if isinstance(response.data, dict) and not 'detail' in response.data:
            custom_data['validation_errors'] = response.data
            custom_data['detail'] = 'Validation failed for one or more fields.'
        elif isinstance(response.data, list):
            custom_data['validation_errors'] = response.data
            custom_data['detail'] = 'Validation failed.'

        response.data = custom_data

    return response
