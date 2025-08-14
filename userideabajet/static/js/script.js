let currentStep = 1;
const totalSteps = 3;
const MAX_ROWS_PER_ELEMENT = 2;

document.addEventListener('DOMContentLoaded', function () {
    // Ensure 1 initial row per element (1..8)
    for (let el = 1; el <= 8; el++) {
        if (getElementRowCount(el) === 0) createRow(el, /*canDelete=*/false);
    }

    // Hook up "Add" buttons (one per element header)
    document.querySelectorAll('.addEl').forEach(button => {
        button.addEventListener('click', function () {
            const element = parseInt(this.getAttribute('data-element'), 10);
            addRow(element, this);
        });
    });

    // Form submission hook (support both ids just in case)
    const formEl = document.getElementById('wizardForm') || document.getElementById('InputForm');
    if (formEl) {
        formEl.addEventListener('submit', function (e) {
            e.preventDefault();
            submitForm();
        });
    }
});

/* ---------- Row helpers ---------- */

function getTable(element) {
    return document.getElementById(`item_table${element}`);
}

function getDataRows(element) {
    const table = getTable(element);
    // Exclude header row (first tr)
    return Array.from(table.querySelectorAll('tr')).slice(1);
}

function getElementRowCount(element) {
    return getDataRows(element).length;
}

function createRow(element, canDelete) {
    const table = getTable(element);
    const newRow = table.insertRow();

    // Get options from global data (will be set in template)
    const pilihanOptions = window.elementOptions[element] || '<option value="">---Sila Pilih Sub Elemen---</option>';
    const lokasiOrAsetOptions = element === 5 ? window.asetOptions : window.lokasiOptions;
    const lokasiOrAsetName = element === 5 ? `aset_${element}[]` : `lokasi_${element}[]`;

    newRow.innerHTML = `
        <td>
            <select name="pilihan_${element}[]" class="form-control">
                ${pilihanOptions}
            </select>
        </td>
        <td>
            <select name="${lokasiOrAsetName}" class="form-control">
                ${lokasiOrAsetOptions}
            </select>
        </td>
        <td>
            <input type="text" name="butiran_${element}[]" class="form-control" placeholder="Butiran">
        </td>
        <td class="text-center">
            ${canDelete ? `
                <button type="button" class="btn btn-danger btn-sm" onclick="removeRow(this)">
                    <i class="fas fa-trash"></i>
                </button>
            ` : ``}
        </td>
    `;

    // Focus the first empty field for UX
    const firstSelect = newRow.querySelector('select');
    if (firstSelect) firstSelect.focus();

    // Disable add if we reached the limit
    toggleAddButton(element);
}

function addRow(element, addBtn) {
    const currentRows = getDataRows(element);
    if (currentRows.length >= MAX_ROWS_PER_ELEMENT) {
        showAlert('warning', 'Maksimum 2 cadangan bagi setiap elemen.');
        toggleAddButton(element);
        return;
    }

    // If adding a second row, ensure first row is complete
    if (currentRows.length === 1) {
        const firstRow = currentRows[0];
        if (!isRowComplete(firstRow, element)) {
            markRowIssues(firstRow, element);
            showAlert('danger', 'Sila lengkapkan baris pertama dahulu sebelum menambah baris kedua.');
            return;
        }
        // Create the second row with a delete button
        createRow(element, /*canDelete=*/true);
    } else if (currentRows.length === 0) {
        // Safety: if somehow no rows, create the initial non-deletable row
        createRow(element, /*canDelete=*/false);
    }

    toggleAddButton(element);
}

function removeRow(button) {
    const row = button.closest('tr');
    const table = row.closest('table');
    const element = parseInt(table.id.replace('item_table', ''), 10);
    row.remove();

    // If no rows exist after deletion, recreate the initial row
    if (getElementRowCount(element) === 0) {
        createRow(element, /*canDelete=*/false);
    }

    // Re-enable Add button (since now < 2 rows)
    toggleAddButton(element);
}

function toggleAddButton(element) {
    const btn = document.querySelector(`.addEl[data-element="${element}"]`);
    if (!btn) return;
    const rowCount = getElementRowCount(element);
    btn.disabled = rowCount >= MAX_ROWS_PER_ELEMENT;
}

/* ---------- Row validation logic ---------- */

function getRowFields(row, element) {
    return {
        pilihan: row.querySelector(`select[name="pilihan_${element}[]"]`),
        lokasiOrAset: row.querySelector(
            element === 5 ? `select[name="aset_${element}[]"]` : `select[name="lokasi_${element}[]"]`
        ),
        butiran: row.querySelector(`input[name="butiran_${element}[]"]`)
    };
}

function isEmpty(value) {
    return !value || !String(value).trim();
}

function isRowEmpty(row, element) {
    const f = getRowFields(row, element);
    return isEmpty(f.pilihan.value) && isEmpty(f.lokasiOrAset.value) && isEmpty(f.butiran.value);
}

function isRowComplete(row, element) {
    const f = getRowFields(row, element);
    return !isEmpty(f.pilihan.value) && !isEmpty(f.lokasiOrAset.value) && !isEmpty(f.butiran.value);
}

function markRowIssues(row, element) {
    const f = getRowFields(row, element);
    // Add/remove 'is-invalid' based on emptiness
    [f.pilihan, f.lokasiOrAset, f.butiran].forEach(el => {
        if (el && isEmpty(el.value)) el.classList.add('is-invalid');
        else el.classList.remove('is-invalid');
    });
}

/* ---------- Form navigation ---------- */

function nextStep() {
    if (validateCurrentStep()) {
        // Save current step data before moving to next step
        saveCurrentStepData().then(success => {
            if (success && currentStep < totalSteps) {
                currentStep++;
                updateWizard();
            }
        });
    }
}

function prevStep() {
    if (currentStep > 1) {
        currentStep--;
        updateWizard();
    }
}

function updateWizard() {
    for (let i = 1; i <= totalSteps; i++) {
        const stepElement = document.getElementById(`step${i}`);
        const stepContent = document.getElementById(`step${i}-content`);

        if (i < currentStep) {
            stepElement.className = 'step completed';
            stepContent.className = 'form-step';
        } else if (i === currentStep) {
            stepElement.className = 'step active';
            stepContent.className = 'form-step active';
        } else {
            stepElement.className = 'step';
            stepContent.className = 'form-step';
        }
    }
}

function validateCurrentStep() {
    // Step 1: basic "required" fields already marked in HTML
    if (currentStep === 1) {
        const container = document.getElementById('step1-content');
        const requiredFields = container.querySelectorAll('[required]');
        let ok = true;
        requiredFields.forEach(field => {
            if (isEmpty(field.value)) {
                field.classList.add('is-invalid');
                ok = false;
            } else {
                field.classList.remove('is-invalid');
            }
        });
        if (!ok) showAlert('danger', 'Sila isi semua ruangan yang disediakan!');
        return ok;
    }

    // Step 2: At least ONE element must have ONE fully completed row.
    if (currentStep === 2) {
        let atLeastOneRowComplete = false;
        let hasPartialRow = false;

        for (let el = 1; el <= 8; el++) {
            const rows = getDataRows(el);
            rows.forEach(row => {
                const complete = isRowComplete(row, el);
                const empty = isRowEmpty(row, el);
                if (complete) atLeastOneRowComplete = true;
                if (!complete && !empty) {
                    hasPartialRow = true;
                    markRowIssues(row, el);
                } else {
                    // clear invalid if row is either fully complete or fully empty
                    const f = getRowFields(row, el);
                    [f.pilihan, f.lokasiOrAset, f.butiran].forEach(elm => elm.classList.remove('is-invalid'));
                }
            });
        }

        if (hasPartialRow) {
            showAlert('danger', 'Sila lengkapkan atau buang baris yang belum lengkap.');
            return false;
        }

        if (!atLeastOneRowComplete) {
            showAlert('danger', 'Sila isi sekurang-kurangnya satu cadangan lengkap pada mana-mana elemen.');
            return false;
        }

        return true;
    }

    // Step 3: (no special validation here)
    return true;
}

/* ---------- Misc (Step 1 conditional) ---------- */

function yesnoCheck(selectElement) {
    const ifYes = document.getElementById('ifYes');
    if (selectElement.value === 'Ahli Majlis, MBI') {
        ifYes.style.display = 'block';
    } else {
        ifYes.style.display = 'none';
    }
}

/* ---------- Submit logic (kept same API shape) ---------- */

function submitForm() {
    // Save step 3 data and complete the form
    saveCurrentStepData().then(success => {
        if (success) {
            showAlert('success', 'Cadangan anda telah berjaya dihantar!');
            // Reset form and redirect or refresh
            setTimeout(() => {
                window.location.reload();
            }, 2000);
        }
    });
}

// Function to save current step data to database
function saveCurrentStepData() {
    return new Promise((resolve) => {
        let data = { step: currentStep };
        
        if (currentStep === 1) {
            // Collect Step 1 data
            data.name = document.getElementById('name').value;
            data.email = document.getElementById('email').value;
            data.jantina = document.getElementById('jantina').value;
            data.bangsa = document.getElementById('bangsa').value;
            data.umur = document.getElementById('umur').value;
            data.job = document.getElementById('job').value;
            data.zon = document.getElementById('zon').value;
            
        } else if (currentStep === 2) {
            // Collect Step 2 data
            data.keutamaan = [];
            
            for (let el = 1; el <= 8; el++) {
                const rows = getDataRows(el);
                rows.forEach(row => {
                    if (isRowComplete(row, el)) {
                        const fields = getRowFields(row, el);
                        data.keutamaan.push({
                            elemen: el,
                            pilihan: fields.pilihan.value,
                            lokasi: fields.lokasiOrAset.value,
                            butiran: fields.butiran.value
                        });
                    }
                });
            }
            
        } else if (currentStep === 3) {
            // Collect Step 3 data
            data.cad = document.getElementById('cad').value;
        }
        
        // Send data to server
        fetch('/save-step/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': document.querySelector('[name=csrfmiddlewaretoken]').value
            },
            body: JSON.stringify(data)
        })
        .then(response => response.json())
        .then(result => {
            if (result.success) {
                showAlert('success', result.message);
                resolve(true);
            } else {
                showAlert('danger', result.message);
                resolve(false);
            }
        })
        .catch(error => {
            showAlert('danger', 'Ralat sistem. Sila cuba lagi.');
            console.error('Error:', error);
            resolve(false);
        });
    });
}

/* ---------- Alerts ---------- */

function showAlert(type, message) {
    const alertContainer = document.getElementById('alertContainer');
    if (!alertContainer) {
        console[type === 'danger' ? 'error' : 'log'](message);
        return;
    }
    alertContainer.innerHTML = `
        <div class="alert alert-${type} alert-dismissible fade show" role="alert">
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        </div>
    `;
}
