import os

file_path = r'c:\Projects\Adstra_Digital\backend\apis\invoice\serializers.py'
with open(file_path, 'r') as f:
    lines = f.readlines()

new_lines = []
for line in lines:
    new_lines.append(line)
    if "fields = '__all__'" in line and "class InvoiceSerializer" in "".join(new_lines[-20:]):
        indent = line[:line.find("fields")]
        new_lines.append(f"{indent}extra_kwargs = {{\n")
        new_lines.append(f"{indent}    'discount_amount': {{'required': False}},\n")
        new_lines.append(f"{indent}    'additional_fee': {{'required': False}},\n")
        new_lines.append(f"{indent}    'tax_amount': {{'required': False}},\n")
        new_lines.append(f"{indent}}}\n")

with open(file_path, 'w') as f:
    f.writelines(new_lines)
