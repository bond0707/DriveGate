from sqlalchemy import Enum as SAEnum
from app.core.enums import AuthType, DriveType

auth_type_enum = SAEnum(
    AuthType,
    name = "auth_type_enum",
    native_enum = False,
    create_constraint = True
)

drive_type_enum = SAEnum(
    DriveType,
    name = "drive_type_enum",
    native_enum = False,
    create_constraint = True
)