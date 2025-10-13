let enrollmentList = [];
let currentSort = { column: "enrollment_id", direction: "asc" };

document.addEventListener("DOMContentLoaded", () => {
    const enrollmentTableBody = document.querySelector('#enrollmentTable tbody');
    const searchInput = document.getElementById('searchInput');

    // Buttons
    const saveBtn = document.getElementById('saveBtn');
    const updateBtn = document.getElementById('updateBtn');
    const cancelBtn = document.getElementById('cancelBtn');
    const studentSelect = document.getElementById('student_id');
    const sectionSelect = document.getElementById('section_id');

    // Modal
    const modal = document.getElementById('enrollmentModal');
    const openModalBtn = document.getElementById('openModalBtn');
    const closeModalBtn = document.getElementById('closeModalBtn');

    // =================== Modal Control ===================
    openModalBtn.addEventListener('click', () => modal.style.display = 'flex');
    closeModalBtn.addEventListener('click', closeModal);
    window.addEventListener('click', e => { if (e.target === modal) closeModal(); });

    function closeModal() {
        modal.style.display = 'none';
        clearForm();
    }

    // =================== Helper: Fetch JSON ===================
    async function fetchJSON(url, options = {}) {
        try {
            const res = await fetch(url, options);
            if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
            return await res.json();
        } catch (err) {
            console.error(`❌ Fetch error for ${url}:`, err);
            return [];
        }
    }

    // =================== Load Students ===================
    async function loadStudents() {
        const data = await fetchJSON('php/fetch_students.php');
        studentSelect.innerHTML = '<option value="">Select Student</option>';
        data.forEach(s => {
            studentSelect.innerHTML += `<option value="${s.student_id}">${s.student_name}</option>`;
        });
    }

    // =================== Load Sections ===================
    async function loadSections() {
        const data = await fetchJSON('php/fetch_sections.php');
        sectionSelect.innerHTML = '<option value="">Select Section</option>';
        data.forEach(sec => {
            sectionSelect.innerHTML += `<option value="${sec.section_id}">${sec.section_code}</option>`;
        });
    }

    // =================== Load Enrollments ===================
    async function loadEnrollments(query = "") {
        const { column, direction } = currentSort;
        const data = await fetchJSON(`php/get_enrollment.php?search=${encodeURIComponent(query)}&sort_by=${column}&order=${direction}`);
        enrollmentList = data;
        enrollmentTableBody.innerHTML = "";

        if (!Array.isArray(data) || data.length === 0) {
            enrollmentTableBody.innerHTML = `<tr><td colspan="7" class="no-data">No enrollments found</td></tr>`;
            updateSortIndicators();
            return;
        }

        data.forEach(e => {
            enrollmentTableBody.innerHTML += `
                <tr>
                    <td>${e.enrollment_id}</td>
                    <td>${e.student_id}</td>
                    <td>${e.section_id}</td>
                    <td>${e.date_enrolled}</td>
                    <td>${e.status}</td>
                    <td>${e.letter_grade || ''}</td>
                    <td>
                        <button class="action-btn edit-btn" onclick="editEnrollment(${e.enrollment_id})">✏️ Edit</button>
                        <button class="action-btn delete-btn" onclick="deleteEnrollment(${e.enrollment_id})">🗑 Delete</button>
                    </td>
                </tr>
            `;
        });

        updateSortIndicators();
    }

    // =================== Sorting ===================
    document.querySelectorAll('#enrollmentTable thead th[data-column]').forEach(th => {
        th.addEventListener('click', () => toggleSort(th.getAttribute('data-column')));
    });

    function toggleSort(column) {
        if (currentSort.column === column) {
            currentSort.direction = currentSort.direction === "asc" ? "desc" : "asc";
        } else {
            currentSort.column = column;
            currentSort.direction = "asc";
        }
        loadEnrollments(searchInput.value.trim());
    }

    function updateSortIndicators() {
        document.querySelectorAll('#enrollmentTable thead th[data-column]').forEach(th => {
            const col = th.getAttribute('data-column');
            const label = th.getAttribute('data-label') || th.textContent.replace(/ ▲| ▼| ↕/g, '').trim();
            th.setAttribute('data-label', label);

            if (col === currentSort.column) {
                th.innerHTML = `${label} ${currentSort.direction === "asc" ? "▲" : "▼"}`;
                th.classList.add('active-sort');
            } else {
                th.innerHTML = `${label} ↕`;
                th.classList.remove('active-sort');
            }
        });
    }

    // =================== Search ===================
    searchInput.addEventListener('input', e => loadEnrollments(e.target.value.trim()));

    // =================== Save ===================
    saveBtn.addEventListener('click', async () => {
        const payload = getFormData();
        if (!payload) return;

        await fetch('php/add_enrollment.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        alert('✅ Enrollment added successfully!');
        loadEnrollments();
        closeModal();
    });

    // =================== Update ===================
    updateBtn.addEventListener('click', async () => {
        const payload = getFormData();
        if (!payload) return;

        payload.enrollment_id = document.getElementById('enrollment_id').value;

        await fetch('php/update_enrollment.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        alert('✅ Enrollment updated successfully!');
        loadEnrollments();
        closeModal();
    });

    cancelBtn.addEventListener('click', closeModal);

    // =================== Form Helpers ===================
    function clearForm() {
        document.getElementById('enrollment_id').value = '';
        studentSelect.value = '';
        sectionSelect.value = '';
        document.getElementById('date_enrolled').value = '';
        document.getElementById('status').value = '';
        document.getElementById('letter_grade').value = '';
        saveBtn.style.display = 'inline-block';
        updateBtn.style.display = 'none';
        cancelBtn.style.display = 'none';
    }

    function getFormData() {
        const student_id = studentSelect.value;
        const section_id = sectionSelect.value;
        const date_enrolled = document.getElementById('date_enrolled').value;
        const status = document.getElementById('status').value;
        const letter_grade = document.getElementById('letter_grade').value;

        if (!student_id || !section_id || !date_enrolled || !status) {
            alert("⚠️ Please fill in all required fields.");
            return null;
        }

        return { student_id, section_id, date_enrolled, status, letter_grade };
    }

    // =================== Edit ===================
    window.editEnrollment = async (id) => {
        const data = await fetchJSON(`php/get_enrollment.php?id=${id}`);
        if (!data) return;

        document.getElementById('enrollment_id').value = data.enrollment_id;
        studentSelect.value = data.student_id;
        sectionSelect.value = data.section_id;
        document.getElementById('date_enrolled').value = data.date_enrolled;
        document.getElementById('status').value = data.status;
        document.getElementById('letter_grade').value = data.letter_grade;

        saveBtn.style.display = 'none';
        updateBtn.style.display = 'inline-block';
        cancelBtn.style.display = 'inline-block';
        modal.style.display = 'flex';
    };

    // =================== Delete ===================
    window.deleteEnrollment = async (id) => {
        if (!confirm("❌ Are you sure you want to delete this enrollment?")) return;
        await fetch(`php/delete_enrollment.php?id=${id}`, { method: 'DELETE' });
        alert('🗑 Enrollment deleted successfully!');
        loadEnrollments();
    };

    // =================== Export ===================
    document.getElementById('exportExcelBtn').addEventListener('click', () => {
        window.location.href = 'php/export_excel.php';
    });
    document.getElementById('exportPdfBtn').addEventListener('click', () => {
        window.location.href = 'php/export_pdf.php';
    });

    // =================== Initial Load ===================
    loadStudents();
    loadSections();
    loadEnrollments();
});
