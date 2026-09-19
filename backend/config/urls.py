from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.http import JsonResponse

def api_root_view(request):
    return JsonResponse({
        'name': 'Nexus AI ERP Enterprise API',
        'version': '1.0.0',
        'status': 'healthy',
        'endpoints': {
            'auth': '/api/auth/',
            'users': '/api/users/',
            'customers': '/api/customers/',
            'crm': '/api/crm/',
            'vendors': '/api/vendors/',
            'products': '/api/products/',
            'inventory': '/api/inventory/',
            'sales': '/api/sales/',
            'purchase': '/api/purchase/',
            'finance': '/api/finance/',
            'hr': '/api/hr/',
            'projects': '/api/projects/',
            'assets': '/api/assets/',
            'service': '/api/service/',
            'reports': '/api/reports/',
            'notifications': '/api/notifications/',
            'approvals': '/api/approvals/',
            'documents': '/api/documents/',
            'ai': '/api/ai/',
        }
    })

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', api_root_view, name='api-root'),
    
    # Authentication & Users
    path('api/auth/', include('apps.authentication.urls')),
    path('api/users/', include('apps.users.urls')),
    
    # CRM & Sales
    path('api/crm/', include('apps.crm.urls')),
    path('api/customers/', include(('apps.crm.customer_urls', 'customers'))),
    path('api/sales/', include('apps.sales.urls')),
    
    # Purchase & Vendors
    path('api/purchase/', include('apps.purchase.urls')),
    path('api/vendors/', include(('apps.purchase.vendor_urls', 'vendors'))),
    
    # Inventory & Products
    path('api/inventory/', include('apps.inventory.urls')),
    path('api/products/', include(('apps.inventory.product_urls', 'products'))),
    
    # Finance, HR, Operations
    path('api/finance/', include('apps.finance.urls')),
    path('api/hr/', include('apps.hr.urls')),
    path('api/projects/', include('apps.projects.urls')),
    path('api/assets/', include('apps.assets.urls')),
    path('api/service/', include('apps.service.urls')),
    
    # Intelligence, Governance & Documents
    path('api/reports/', include('apps.reports.urls')),
    path('api/notifications/', include('apps.notifications.urls')),
    path('api/approvals/', include('apps.approvals.urls')),
    path('api/documents/', include('apps.documents.urls')),
    path('api/ai/', include('apps.ai.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
