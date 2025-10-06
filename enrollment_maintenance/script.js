document.addEventListener("DOMContentLoaded", () => {
    const enrollmentTable = document.getElementById('enrollmentTable').querySelector('tbody');
    const saveBtn = document.getElementById('saveBtn');
    const updateBtn = document.getElementById('updateBtn');
    const cancelBtn = document.getElementById('cancelBtn');
    const searchInput = document.getElementById('searchInput');
    const studentSelect = document.getElementById('student_id');
    const sectionSelect = document.getElementById('section_id');

    // =================== Load Students ===================
    function loadStudents() {
        fetch('php/fetch_students.php')
            .then(res => res.json())
            .then(data => {
                studentSelect.innerHTML = '<option value="">Select Student</option>';
                data.forEach(student => {
                    const option = document.createElement('option');
                    option.value = student.student_id;
                    option.textContent = student.name;
                    studentSelect.appendChild(option);
                });
            });
    }

    // =================== Load Sections ===================
    function loadSections() {
        fetch('php/fetch_sections.php')
            .then(res => res.json())
            .then(data => {
                sectionSelect.innerHTML = '<option value="">Select Section</option>';
                data.forEach(section => {
                    const option = document.createElement('option');
                    option.value = section.section_id;
                    option.textContent = section.section_code; // Make sure field name matches DB
                    sectionSelect.appendChild(option);
                });
            })
            .catch(err => console.error('Error loading sections:', err));
    }

    // =================== Load Enrollments ===================
    function loadEnrollments() {
        fetch('php/get_enrollment.php')
            .then(res => res.json())
            .then(data => {
                enrollmentTable.innerHTML = '';
                data.forEach(enrollment => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${enrollment.enrollment_id}</td>
                        <td>${enrollment.student_id}</td>
                        <td>${enrollment.section_id}</td>
                        <td>${enrollment.date_enrolled}</td>
                        <td>${enrollment.status}</td>
                        <td>${enrollment.letter_grade}</td>
                        <td>
                            <button class="action-btn edit-btn" onclick="editEnrollment(${enrollment.enrollment_id})">Edit</button>
                            <button class="action-btn delete-btn" onclick="deleteEnrollment(${enrollment.enrollment_id})">Delete</button>
                        </td>
                    `;
                    enrollmentTable.appendChild(row);
                });
            });
    }

    // =================== Save Enrollment ===================
    saveBtn.addEventListener('click', () => {
        const student_id = studentSelect.value;
        const section_id = sectionSelect.value;
        const date_enrolled = document.getElementById('date_enrolled').value;
        const status = document.getElementById('status').value;
        const letter_grade = document.getElementById('letter_grade').value;

        if (!student_id || !section_id || !date_enrolled || !status) {
            alert("Please fill in all required fields.");
            return;
        }

        fetch('php/add_enrollment.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ student_id, section_id, date_enrolled, status, letter_grade })
        }).then(() => {
            loadEnrollments();
            clearForm();
        });
    });

    // =================== Update Enrollment ===================
    updateBtn.addEventListener('click', () => {
        const enrollment_id = document.getElementById('enrollment_id').value;
        const student_id = studentSelect.value;
        const section_id = sectionSelect.value;
        const date_enrolled = document.getElementById('date_enrolled').value;
        const status = document.getElementById('status').value;
        const letter_grade = document.getElementById('letter_grade').value;

        if (!student_id || !section_id || !date_enrolled || !status) {
            alert("Please fill in all required fields.");
            return;
        }

        fetch('php/update_enrollment.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ enrollment_id, student_id, section_id, date_enrolled, status, letter_grade })
        }).then(() => {
            loadEnrollments();
            clearForm();
        });
    });

    // =================== Cancel ===================
    cancelBtn.addEventListener('click', clearForm);

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

    // =================== Search ===================
    searchInput.addEventListener('input', () => {
        const filter = searchInput.value.toLowerCase();
        const rows = enrollmentTable.getElementsByTagName('tr');
        Array.from(rows).forEach(row => {
            const text = Array.from(row.getElementsByTagName('td'))
                            .map(c => c.textContent.toLowerCase())
                            .join(' ');
            row.style.display = text.includes(filter) ? '' : 'none';
        });
    });

    // =================== Edit Enrollment ===================
    window.editEnrollment = function(enrollment_id) {
        fetch(`php/get_enrollment.php?id=${enrollment_id}`)
            .then(res => res.json())
            .then(data => {
                document.getElementById('enrollment_id').value = data.enrollment_id;
                studentSelect.value = data.student_id;
                sectionSelect.value = data.section_id;
                document.getElementById('date_enrolled').value = data.date_enrolled;
                document.getElementById('status').value = data.status;
                document.getElementById('letter_grade').value = data.letter_grade;

                saveBtn.style.display = 'none';
                updateBtn.style.display = 'inline-block';
                cancelBtn.style.display = 'inline-block';
            });
    }

    // =================== Delete Enrollment ===================
    window.deleteEnrollment = function(enrollment_id) {
        if(confirm("Are you sure you want to delete this enrollment?")) {
            fetch(`php/delete_enrollment.php?id=${enrollment_id}`, { method: 'DELETE' })
                .then(() => loadEnrollments());
        }
    }

    // =================== Export Buttons ===================
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
