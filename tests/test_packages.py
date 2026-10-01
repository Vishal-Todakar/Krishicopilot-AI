import sys

packages = ["torch", "torchvision", "tensorflow", "onnxruntime", "PIL", "cv2", "google.generativeai", "sklearn", "scipy"]
available = {}
for p in packages:
    try:
        __import__(p)
        available[p] = True
    except ImportError:
        available[p] = False
    except Exception as e:
        available[p] = str(e)

print("Package check:", available)
