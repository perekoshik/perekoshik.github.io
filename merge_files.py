import os

output_file = "PROJECT_FULL_CODE.txt"

# расширения которые включаем
allow_ext = {".sol", ".js", ".ts", ".jsx", ".tsx", ".json", ".yml", ".yaml", ".html", ".css", ".scss", ".md"}

# папки которые пропускаем
ignore_dirs = {"node_modules", ".git", "build", "dist", ".next", "__pycache__"}

with open(output_file, "w", encoding="utf-8") as out:
    for root, dirs, files in os.walk("."):
        # фильтрация папок
        dirs[:] = [d for d in dirs if d not in ignore_dirs]

        for file in files:
            _, ext = os.path.splitext(file)
            if ext in allow_ext:
                path = os.path.join(root, file)
                out.write(f"\n\n===== FILE: {path} =====\n\n")
                try:
                    with open(path, "r", encoding="utf-8") as f:
                        out.write(f.read())
                except:
                    out.write("[UNABLE TO READ FILE]\n")

print(f"✅ Готово! Весь код собран в {output_file}")
