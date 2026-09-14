import base64
import io
import os
from functools import lru_cache

import gradio as gr
import spaces
from huggingface_hub import snapshot_download
from PIL import Image

MODEL_ID = os.getenv("FASHN_MODEL_ID", "fashn-ai/fashn-vton-1.5")
WEIGHTS_DIR = os.getenv("FASHN_WEIGHTS_DIR", "/tmp/fashn-vton-1.5")


def _data_url_to_image(value: str) -> Image.Image:
    if not value:
        raise ValueError("Missing image input")
    payload = value.split(",", 1)[1] if "," in value else value
    return Image.open(io.BytesIO(base64.b64decode(payload))).convert("RGB")


def _image_to_data_url(image: Image.Image) -> str:
    buffer = io.BytesIO()
    image.save(buffer, format="PNG", optimize=True)
    return "data:image/png;base64," + base64.b64encode(buffer.getvalue()).decode("ascii")


@lru_cache(maxsize=1)
def get_pipeline():
    from fashn_vton import TryOnPipeline

    os.makedirs(WEIGHTS_DIR, exist_ok=True)
    snapshot_download(
        repo_id=MODEL_ID,
        local_dir=WEIGHTS_DIR,
        allow_patterns=["model.safetensors", "README.md", ".gitattributes"],
    )
    return TryOnPipeline(weights_dir=WEIGHTS_DIR)


@spaces.GPU(duration=120)
def try_on(person_data_url: str, garment_data_url: str, category: str = "tops") -> str:
    person = _data_url_to_image(person_data_url)
    garment = _data_url_to_image(garment_data_url)
    pipeline = get_pipeline()
    result = pipeline(person, garment, category=category)
    return _image_to_data_url(result.images[0])


with gr.Blocks(title="Smart Tailor VTON") as demo:
    gr.Markdown("# Smart Tailor · FASHN VTON 1.5\nApache-2.0 virtual try-on inference service")
    gr.api(
        try_on,
        api_name="try_on",
        description="Generate a virtual try-on image from a customer photo and garment photo.",
    )

if __name__ == "__main__":
    demo.launch()
