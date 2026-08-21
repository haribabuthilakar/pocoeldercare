import base64, sys, os
file_path = sys.argv[1]
b64_str = sys.argv[2]
os.makedirs(os.path.dirname(file_path), exist_ok=True)
with open(file_path, 'wb') as f:
    f.write(base64.b64decode(b64_str))
print('Written:', file_path)
