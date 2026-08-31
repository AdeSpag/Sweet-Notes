import os
from rembg import remove
from PIL import Image

def process_image(input_path, output_path):
    print(f"Processing {input_path}...")
    try:
        input_image = Image.open(input_path)
        output_image = remove(input_image)
        output_image.save(output_path, "PNG")
        print(f"Saved to {output_path}")
    except Exception as e:
        print(f"Error processing {input_path}: {e}")

if __name__ == "__main__":
    base_dir = r"c:\Users\asus\OneDrive\Documentos\Recetario byAde\img"
    images = [
        ("remy.jpg", "remy.png"),
        ("snoopy.jpg", "snoopy.png"),
        ("roll.jpg", "roll.png")
    ]
    
    for in_name, out_name in images:
        in_path = os.path.join(base_dir, in_name)
        out_path = os.path.join(base_dir, out_name)
        if os.path.exists(in_path):
            process_image(in_path, out_path)
        else:
            print(f"File not found: {in_path}")
