
from werkzeug.security import generate_password_hash

senha = input("Digite sua nova senha: ")

hash_senha = generate_password_hash(senha)

print("\nHash gerado:")
print(hash_senha)
