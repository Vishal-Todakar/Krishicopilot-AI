import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'backend')))
from app.services.disease_service import disease_service, DISEASE_CATALOG

print("SUCCESS: Crops in catalog:", len(DISEASE_CATALOG))
for crop, diseases in DISEASE_CATALOG.items():
    print(f" - {crop}: {list(diseases.keys())}")

# Test mock prediction for various crops
test_cases = ["Potato", "Chilli", "Brinjal", "Onion", "Okra", "Cabbage", "Cucumber", "AUTO"]
for c in test_cases:
    res = disease_service.predict(b"FAKE_IMAGE_BYTES_FOR_TESTING_1234567890" * 5, filename=f"my_{c.lower()}_sample.jpg", crop_hint=c)
    print(f"Predicted for hint '{c}': Crop={res['crop']}, Disease={res['disease']}, Conf={res['confidence']}")
