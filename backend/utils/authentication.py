from rest_framework import authentication, exceptions

from apis.user.models import CustomUser
from utils.jwt_helper import decode_jwt


class JWTAuthentication(authentication.BaseAuthentication):
    keyword = "Bearer"

    def authenticate(self, request):
        auth_header = authentication.get_authorization_header(request).split()
        if not auth_header:
            return None

        if auth_header[0].decode("utf-8").lower() != self.keyword.lower():
            return None

        if len(auth_header) != 2:
            raise exceptions.AuthenticationFailed("Invalid authorization header.")

        try:
            token = auth_header[1].decode("utf-8")
        except UnicodeError as exc:
            raise exceptions.AuthenticationFailed("Invalid authorization token.") from exc

        user_id = decode_jwt(token)
        if not user_id:
            raise exceptions.AuthenticationFailed("Invalid or expired token.")

        try:
            user = CustomUser.objects.get(id=user_id, is_active=True)
        except CustomUser.DoesNotExist as exc:
            raise exceptions.AuthenticationFailed("User not found.") from exc

        return (user, token)
