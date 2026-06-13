def is_administrative_role(user):
    """
    Returns True if the user is authenticated and has an administrative role (ADMIN or RECEPTIONIST).
    """
    return user and user.is_authenticated and hasattr(user, 'role') and user.role in ('ADMIN', 'RECEPTIONIST')
