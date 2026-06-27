$(function () {
    const forms = document.querySelectorAll('.needs-validation')

    Array.from(forms).forEach(form => {
        form.addEventListener('submit', event => {
            if (!form.checkValidity()) {
                event.preventDefault()
                event.stopPropagation()
            }

            form.classList.add('was-validated')
        }, false)
    });
});

const minSlider = document.getElementById('minPrice');
const maxSlider = document.getElementById('maxPrice');
const minInput = document.getElementById('minPriceInput');
const maxInput = document.getElementById('maxPriceInput');

function updateMin() {
  // Enforce min handle stays below max handle
  if (parseInt(minSlider.value) >= parseInt(maxSlider.value)) {
    minSlider.value = parseInt(maxSlider.value) - 10; // offset by step size
  }
  minInput.value = minSlider.value;
}

function updateMax() {
  // Enforce max handle stays above min handle
  if (parseInt(maxSlider.value) <= parseInt(minSlider.value)) {
    maxSlider.value = parseInt(minSlider.value) + 10; // offset by step size
  }
  maxInput.value = maxSlider.value;
}

// Bind input event to handle immediate values while sliding
minSlider.addEventListener('input', updateMin);
maxSlider.addEventListener('input', updateMax);

