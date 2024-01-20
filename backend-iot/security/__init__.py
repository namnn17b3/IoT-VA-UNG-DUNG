import bcrypt


ROUND_SALT = 10
SALT = bcrypt.gensalt(ROUND_SALT) 

class Bcrypt:
    def hashpw(password: str) -> str:
        return bcrypt.hashpw(password.encode('utf-8'), SALT).decode('utf-8')

    
    def checkpw(password: str, hashpw: str) -> bool:
        return bcrypt.checkpw(password.encode('utf-8'), hashpw.encode('utf-8'))
