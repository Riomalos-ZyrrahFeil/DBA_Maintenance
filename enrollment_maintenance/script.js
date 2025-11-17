// File: riomalos-zyrrahfeil/dba_maintenance/DBA_Maintenance-5285f60fb8be6af678200dea57fa56441daa6fd0/enrollment_maintenance/script.js

let enrollmentList = [];
let currentSort = { column: "enrollment_id", direction: "desc" };
let currentPage = 1;
const rowsPerPage = 10;
let totalPages = 1;
let allSections = []; // Global storage for all fetched sections
let allStudents = {}; // 🆕 Global storage for student details (key: student_id)

document.addEventListener("DOMContentLoaded", () => {
    const enrollmentTableBody = document.querySelector('#enrollmentTable tbody');
    const searchInput = document.getElementById('searchInput');
    const paginationContainer = document.querySelector('.pagination-controls');
    const enrollmentTypeSelect = document.getElementById('enrollment_type');

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
    openModalBtn.addEventListener('click', () => {
        clearForm();
        modal.style.display = 'flex';
        // Ensure dropdown is initialized on open
        updateSectionDropdown();
    });
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
            // Handle case where fetch_sections.php returns an error status in the response body
            if (options.isList) {
                return { data: [], total_records: 0 }; 
            }
            // Check if the error object has a 'data' array (for section list)
            if (Array.isArray(err.data)) {
                 return err.data;
            }
            return []; 
        }
    }

    // =================== Load Students (Modified to store details) ===================
    async function loadStudents() {
        // NOTE: php/fetch_students.php must return student_id, student_name, year_level, and program_code
        const data = await fetchJSON('php/fetch_students.php');
        studentSelect.innerHTML = '<option value="">Select Student</option>';
        data.forEach(s => {
            studentSelect.innerHTML += `<option value="${s.student_id}">${s.student_name} (${s.student_id})</option>`;
            // 🆕 Store student details globally for dynamic lookup
            allStudents[s.student_id] = { 
                year_level: s.year_level, // e.g., '3-1'
                program_code: s.program_code // e.g., 'DIT-TG'
            };
        });
    }

    // =================== Load Sections (Modified to store all data) ===================
    async function loadSections() {
        // Must wait for this call to complete before filtering can happen
        const data = await fetchJSON('php/fetch_sections.php');
        
        // 🆕 Handle potential PHP JSON error format
        if (data && data.status === "error") {
            console.error("Error fetching sections:", data.message);
            allSections = [];
        } else {
            allSections = data; // Store the entire master list
        }
        updateSectionDropdown();
    }
    
    // 🆕 =================== Conditional Dropdown Filter (Dynamic Logic) ===================
    function updateSectionDropdown() {
        const enrollmentType = enrollmentTypeSelect.value;
        const studentId = studentSelect.value;
        const sectionSelect = document.getElementById('section_id');
        const currentAcademicYear = 2025; // ⚠️ Placeholder: Ideally, fetch this from a 'current_term' API

        // 1. Clear Dropdown
        sectionSelect.innerHTML = '<option value="">Select Section</option>';
        sectionSelect.disabled = true;

        if (!studentId) {
            sectionSelect.innerHTML += '<option disabled>Select a student to filter sections</option>';
            return;
        }

        const studentDetails = allStudents[studentId];
        if (!studentDetails) {
            sectionSelect.innerHTML += '<option disabled>Student details not found.</option>';
            return;
        }
        
        // Filter sections based on enrollment type
        let filteredSections = [];
        let dropdownPlaceholder = 'Select Section';

        if (enrollmentType === 'Regular') {
            // --- REGULAR STUDENT LOGIC: Filter by Block Code ---
            const [yearNum, semesterNum] = studentDetails.year_level.split('-'); 
            // Normalize program code (e.g., remove '-TG' if present)
            const programBase = studentDetails.program_code ? studentDetails.program_code.replace(/-TG$/, '') : 'DIT'; 
            
            // Expected Block Format: PROGRAM-YEAR-SEMESTER-TG (e.g., DIT-3-1-TG)
            const targetSectionCode = `${programBase}-${yearNum}-${semesterNum}-TG`; 

            // Find all sections belonging to that entire block for the current year
            filteredSections = allSections.filter(sec => 
                sec.section_code === targetSectionCode && 
                // Ensure the year is explicitly cast/handled if needed, but strict comparison is safer
                parseInt(sec.year) === currentAcademicYear 
            );
            
            if (filteredSections.length > 0) {
                // Display ONLY ONE option for the entire block enrollment, but use the section_id of one part
                const singleSection = filteredSections[0];
                const displayLabel = `[BLOCK ENROLL] ${singleSection.section_code} - ${singleSection.year}`;
                sectionSelect.innerHTML = `<option value="${singleSection.section_id}">${displayLabel}</option>`;
                sectionSelect.disabled = false;
            } else {
                dropdownPlaceholder = `No Block Found (${targetSectionCode} - ${currentAcademicYear})`;
            }

        } else if (enrollmentType === 'Irregular') {
            // --- IRREGULAR STUDENT LOGIC: Show ALL individual course sections ---
            // Display ALL sections (courses) from the master list
            filteredSections = allSections; 
            dropdownPlaceholder = 'Select Course to Enroll';
            sectionSelect.disabled = false;
        }
        
        // Populate dropdown for Irregular enrollment (or if something failed on regular filter)
        if (enrollmentType === 'Irregular') {
             sectionSelect.innerHTML = `<option value="">${dropdownPlaceholder}</option>`;
             filteredSections.forEach(sec => {
                // Use the complex display text created in PHP
                const displayText = sec.display_text; 
                sectionSelect.innerHTML += `<option value="${sec.section_id}">${displayText}</option>`;
            });
        }
        
        if (filteredSections.length === 0) {
            sectionSelect.innerHTML = `<option value="">${dropdownPlaceholder}</option>`;
        }
        
        if (studentId && enrollmentType) {
            sectionSelect.disabled = false;
        }
    }
    
    // 🆕 Event Listeners for the Dropdown Filter
    enrollmentTypeSelect.addEventListener('change', updateSectionDropdown);
    studentSelect.addEventListener('change', updateSectionDropdown); // Trigger filter when student changes

    // =================== Load Enrollments (Unchanged) ===================
    async function loadEnrollments(query = "") {
        const { column, direction } = currentSort;
        const page = currentPage;
        const limit = rowsPerPage;
        const url = `php/get_enrollment.php?search=${encodeURIComponent(query)}&sort_by=${column}&order=${direction}&page=${page}&limit=${limit}`;

        const response = await fetchJSON(url, { isList: true });
        const data = response.data || [];
        const totalRecords = response.total_records || 0;

        enrollmentList = data;
        enrollmentTableBody.innerHTML = "";
        totalPages = Math.ceil(totalRecords / rowsPerPage);

        if (!Array.isArray(data) || data.length === 0) {
            enrollmentTableBody.innerHTML = `<tr><td colspan="8" class="no-data">No enrollments found</td></tr>`;
        } else {
            data.forEach(e => {
                enrollmentTableBody.innerHTML += `
                    <tr>
                        <td>${e.enrollment_id}</td>
                        <td>${e.student_name}</td>
                        <td>${e.section_code}</td>
                        <td>${e.enrollment_type}</td> <td>${e.date_enrolled}</td>
                        <td>${e.status}</td>
                        <td>${e.letter_grade || ''}</td>
                        <td>
                            <button class="action-btn edit-btn" onclick="editEnrollment(${e.enrollment_id})">Edit</button>
                            <button class="action-btn delete-btn" onclick="deleteEnrollment(${e.enrollment_id})">Delete</button>
                        </td>
                    </tr>
                `;
            });
        }

        // Functions for sorting/pagination here...

        updateSortIndicators();
        renderPaginationControls();
    }

    // =================== Pagination Controls (Unchanged) ===================
    function renderPaginationControls() {
        paginationContainer.innerHTML = '';
        if (totalPages <= 1) return;

        // Previous Button
        const prevBtn = document.createElement('button');
        prevBtn.textContent = '« Previous';
        prevBtn.disabled = currentPage === 1;
        prevBtn.onclick = () => {
            if (currentPage > 1) {
                currentPage--;
                loadEnrollments(searchInput.value.trim());
            }
        };
        paginationContainer.appendChild(prevBtn);

        // Page Indicator
        const pageInfo = document.createElement('span');
        pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
        pageInfo.className = 'page-info';
        paginationContainer.appendChild(pageInfo);

        // Next Button
        const nextBtn = document.createElement('button');
        nextBtn.textContent = 'Next »';
        nextBtn.disabled = currentPage === totalPages;
        nextBtn.onclick = () => {
            if (currentPage < totalPages) {
                currentPage++;
                loadEnrollments(searchInput.value.trim());
            }
        };
        paginationContainer.appendChild(nextBtn);
    }

    // =================== Sorting (Unchanged logic, uses new data-column names) ===================
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
        currentPage = 1;
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

    // =================== Search (Unchanged) ===================
    searchInput.addEventListener('input', e => {
        currentPage = 1;
        loadEnrollments(e.target.value.trim());
    });

    // =================== Save (Unchanged) ===================
    saveBtn.addEventListener('click', async () => {
        const payload = getFormData();
        if (!payload) return;

        const res = await fetch('php/add_enrollment.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const resp = await res.json(); // Read response

        if (resp.status === "success") {
            alert('✅ Enrollment added successfully! Message: ' + resp.message);
            currentPage = 1;
            loadEnrollments();
            closeModal();
        } else {
            alert('⚠️ Error adding enrollment: ' + resp.message); // Display error, especially prerequisite failures
        }
    });

    // =================== Update (Fixed JSON reading) ===================
    updateBtn.addEventListener('click', async () => {
        const payload = getFormData();
        if (!payload) return;

        payload.enrollment_id = document.getElementById('enrollment_id').value;

        const res = await fetch('php/update_enrollment.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const resp = await res.json(); // FIX: Read response
        
        if (resp.status === "success") {
            alert('✅ Enrollment updated successfully!');
            loadEnrollments(searchInput.value.trim());
            closeModal();
        } else {
            alert('⚠️ Error updating enrollment: ' + resp.message); // Display error
        }
    });

    cancelBtn.addEventListener('click', closeModal);

    // =================== Form Helpers (Unchanged) ===================
    function clearForm() {
        document.getElementById('enrollment_id').value = '';
        studentSelect.value = '';
        enrollmentTypeSelect.value = 'Regular';
        sectionSelect.value = '';
        document.getElementById('date_enrolled').value = '';
        document.getElementById('status').value = '';
        document.getElementById('letter_grade').value = '';
        saveBtn.style.display = 'inline-block';
        updateBtn.style.display = 'none';
        cancelBtn.style.display = 'none';
        updateSectionDropdown(); // Re-filter dropdown on clear
    }

    function getFormData() {
        const student_id = studentSelect.value;
        const enrollment_type = enrollmentTypeSelect.value;
        const section_id = sectionSelect.value;
        const date_enrolled = document.getElementById('date_enrolled').value;
        const status = document.getElementById('status').value;
        const letter_grade = document.getElementById('letter_grade').value;

        if (!student_id || !section_id || !date_enrolled || !status) {
            alert("⚠️ Please fill in all required fields.");
            return null;
        }

        return { student_id, enrollment_type, section_id, date_enrolled, status, letter_grade };
    }

    // =================== Edit (Modified to call updateSectionDropdown) ===================
    window.editEnrollment = async (id) => {
        const data = await fetchJSON(`php/get_enrollment.php?id=${id}`);
        if (!data) return;

        document.getElementById('enrollment_id').value = data.enrollment_id;
        studentSelect.value = data.student_id;
        enrollmentTypeSelect.value = data.enrollment_type;
        
        updateSectionDropdown(); // Filter options based on fetched student/type

        // Delay setting sectionSelect value to ensure options are loaded
        setTimeout(() => {
             sectionSelect.value = data.section_id;
        }, 50);

        document.getElementById('date_enrolled').value = data.date_enrolled;
        document.getElementById('status').value = data.status;
        document.getElementById('letter_grade').value = data.letter_grade;

        saveBtn.style.display = 'none';
        updateBtn.style.display = 'inline-block';
        cancelBtn.style.display = 'inline-block';
        modal.style.display = 'flex';
    };

    // =================== Delete (Fixed JSON reading) ===================
    window.deleteEnrollment = async (id) => {
        if (!confirm("❌ Are you sure you want to delete this enrollment?")) return;
        const response = await fetch(`php/delete_enrollment.php?id=${id}`);
        const resp = await response.json(); // FIX: Read response
        
        if (resp.status === "success") {
            alert('🗑 Enrollment deleted successfully!');
        } else {
            alert('⚠️ Error deleting enrollment: ' + resp.message);
        }
        
        if (enrollmentList.length === 1 && currentPage > 1) {
            currentPage--;
        }
        
        loadEnrollments(searchInput.value.trim());
    };

    // =================== Export (Unchanged) ===================
    document.getElementById('exportExcelBtn').addEventListener('click', () => {
        window.location.href = 'php/export_excel.php';
    });
    document.getElementById('exportPdfBtn').addEventListener('click', () => {
        window.location.href = 'php/export_pdf.php';
    });

    // =================== Initial Load ===================
    loadStudents();
    loadSections(); // This stores data and calls updateSectionDropdown
    loadEnrollments();
});